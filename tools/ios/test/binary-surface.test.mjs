import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { expect, test } from "vitest";
import { NESTED_RUN_TIMEOUT_MS, repoRoot, run, write } from "../../acceptance/test/helpers.mjs";
import { parseAllowlist } from "../allowlist.mjs";
import { unusedBinaryEntries } from "../allowlist-usage.mjs";
import { RULES, binarySurface, evaluateBinary } from "../binary-check.mjs";

// The binary check reads a binary through xcrun. These tests put a stand-in xcrun first on PATH
// that prints canned output, so the check's own parsing and its command lines are tested on every
// runner, with or without Xcode. The compiled controls stay in the swift job.
const stub = [
  "#!/bin/sh",
  'dir="$(dirname "$0")"',
  'tool="$1"',
  "shift",
  'if [ -f "$dir/fail-$tool" ]; then echo "stub: $tool failed" >&2; exit 1; fi',
  'case "$tool $1" in',
  '  "otool -L") cat "$dir/linked" ;;',
  '  "nm -um") cat "$dir/undefined" ;;',
  '  "swift-demangle --compact") awk -F "\\t" \'NR == FNR { names[$1] = $2; next } { print ($0 in names) ? names[$0] : $0 }\' "$dir/demangle" - ;;',
  '  "otool -ov") cat "$dir/objc" ;;',
  '  "otool -v") cat "$dir/methods" ;;',
  '  *) echo "stub: unexpected $tool $*" >&2; exit 64 ;;',
  "esac",
  "",
].join("\n");

function linkedRows(frameworks) {
  const rows = frameworks.map((name) => `\t/System/Library/Frameworks/${name}.framework/${name} (compatibility version 1.0.0, current version 1.0.0)`);
  return ["Keel:", ...rows, "\t/usr/lib/libSystem.B.dylib (compatibility version 1.0.0, current version 1.0.0)", ""].join("\n");
}

function undefinedRows(rows) {
  return rows.map(([name, library]) => `                 (undefined) external ${name} (from ${library})\n`).join("");
}

function selectorRefs(names) {
  const rows = names.map((name, index) => `    0x10001d${String(100 + index)} ${name}`);
  return ["Keel:", "Contents of (__DATA,__objc_classlist) section", "000000010002c0f8 0x10002d5d8 a class row, outside the selector references", "Contents of (__DATA,__objc_selrefs) section", ...rows, "Contents of (__DATA,__objc_superrefs) section", ""].join("\n");
}

// A binary that links Foundation, sends init and imports objc_msgSend.
const defaults = {
  linked: linkedRows(["Foundation"]),
  undefined: undefinedRows([["_objc_msgSend", "libobjc"]]),
  demangle: "_$s4Keel5thingyyF\tKeel.thing() -> ()\n",
  objc: selectorRefs(["init"]),
  methods: "Keel:\nContents of (__TEXT,__objc_methname) section\n000000010001cff2  init\n",
};
const defaultList = { frameworks: ["Foundation"], selectors: ["init"], symbols: [], undefinedSymbols: ["_objc_msgSend"] };

function tools({ onTestFinished }, files = {}) {
  const dir = mkdtempSync(join(tmpdir(), "keel-xcrun-"));
  const path = process.env.PATH;
  onTestFinished(() => {
    process.env.PATH = path;
    rmSync(dir, { recursive: true, force: true });
  });
  writeFileSync(join(dir, "xcrun"), stub, { mode: 0o755 });
  for (const [name, text] of Object.entries({ ...defaults, ...files })) writeFileSync(join(dir, name), text);
  process.env.PATH = dir + delimiter + path;
  return dir;
}

test("an approval names one import exactly: a shorter or a longer name approves nothing", (context) => {
  const mangled = "_$s10Foundation13URLComponentsV3urlAA3URLVSgvg";
  const getter = "Foundation.URLComponents.url.getter : Foundation.URL?";
  tools(context, {
    linked: linkedRows(["PDFKit"]),
    undefined: undefinedRows([["_gethostbyname", "libSystem"], [mangled, "Foundation"]]),
    demangle: `${mangled}\t${getter}\n`,
    objc: selectorRefs(["currentDirectoryPath"]),
  });
  const exact = { frameworks: ["PDFKit"], selectors: ["currentDirectoryPath"], symbols: [getter], undefinedSymbols: ["_gethostbyname"] };
  expect(evaluateBinary("Keel", exact).status).toBe(0);
  const near = [
    ["framework", "frameworks", ["PDF", "PDFKitUI", "Kit"]],
    ["selector", "selectors", ["currentDirectory", "currentDirectoryPath:", "Path"]],
    ["urlSymbol", "symbols", ["Foundation.URLComponents.url.getter", `${getter} `, "Foundation.URL"]],
    ["undefinedSymbol", "undefinedSymbols", ["_gethostby", "_gethostbyname2", "gethostbyname"]],
  ];
  for (const [rule, field, names] of near) {
    const result = evaluateBinary("Keel", { ...exact, [field]: names });
    expect(result.status, rule).toBe(1);
    for (const other of RULES) expect(result.counts[other], `${rule} ${other}`).toBe(other === rule ? 1 : 0);
  }
}, NESTED_RUN_TIMEOUT_MS);

test("only Swift's own imports are left off the undefined list", (context) => {
  tools(context, {
    undefined: undefinedRows([
      // A mangled Swift name that the demangler changes: Swift's own, checked by the URL rule instead.
      ["_$s4Keel5thingyyF", "libswiftCore"],
      // Named like a mangled Swift name, but the demangler leaves each one as it is.
      ["_$sNotSwift", "libOther"],
      ["_Topen", "libOther"],
      // The Swift runtime, and a symbol that is only named like it.
      ["_swift_retain", "libswiftCore"],
      ["_swift_connect", "libOther"],
      // The overlay reference for Foundation, and the same form for a framework that is not exempt.
      ["__swift_FORCE_LOAD_$_swiftFoundation", "Foundation"],
      ["__swift_FORCE_LOAD_$_swiftNetwork", "Network"],
      ["_objc_msgSend", "libobjc"],
    ]),
  });
  const surface = binarySurface("Keel");
  expect(surface.ok, surface.error).toBe(true);
  expect(surface.undefinedSymbols).toEqual(["_$sNotSwift", "_Topen", "_swift_connect", "__swift_FORCE_LOAD_$_swiftNetwork", "_objc_msgSend"]);
}, NESTED_RUN_TIMEOUT_MS);

test("tool output the check cannot read is an error, never a pass", (context) => {
  const dir = tools(context);
  expect(evaluateBinary("Keel", defaultList).status).toBe(0);
  const unreadable = {
    undefined: "                 (undefined) [an unknown form] _objc_msgSend\n",
    objc: "Keel:\nContents of (__DATA,__objc_selrefs) section\n    0x10001d055\n",
  };
  for (const [name, text] of Object.entries(unreadable)) {
    const before = readFileSync(join(dir, name), "utf8");
    writeFileSync(join(dir, name), text);
    expect(evaluateBinary("Keel", defaultList).status, name).toBe(2);
    writeFileSync(join(dir, name), before);
  }
  for (const tool of ["otool", "nm", "swift-demangle"]) {
    writeFileSync(join(dir, `fail-${tool}`), "");
    const result = evaluateBinary("Keel", defaultList);
    expect(result.status, tool).toBe(2);
    expect(result.error, tool).toContain(`stub: ${tool} failed`);
    rmSync(join(dir, `fail-${tool}`));
  }
  expect(evaluateBinary("Keel", defaultList).status).toBe(0);
}, NESTED_RUN_TIMEOUT_MS);

test("the binary command names each unlisted import and exits 1, and exits 2 on a binary it cannot read", (context) => {
  const dir = tools(context);
  const cli = (list) => run(process.execPath, [join(repoRoot, "tools/ios/binary-check.mjs"), "Keel", repoRoot, list]);
  const all = "framework\tFoundation\tLinked.\nselector\tinit\tSent.\nundefined\t_objc_msgSend\tImported.\n";
  const listed = cli(all);
  expect(listed.status).toBe(0);
  expect(listed.stdout).toBe(RULES.map((rule) => `${rule}=0\n`).join(""));
  expect(listed.stderr).toBe("");
  const unlisted = cli("framework\tFoundation\tLinked.\n");
  expect(unlisted.status).toBe(1);
  expect(unlisted.stdout).toBe(RULES.map((rule) => `${rule}=${rule === "selector" || rule === "undefinedSymbol" ? 1 : 0}\n`).join(""));
  expect(unlisted.stderr).toBe("ios-binary\tselector\tinit\nios-binary\tundefinedSymbol\t_objc_msgSend\n");
  writeFileSync(join(dir, "fail-otool"), "");
  const unreadable = cli(all);
  expect(unreadable.status).toBe(2);
  expect(unreadable.stderr).toContain("ios-binary\tstub: otool failed");
}, NESTED_RUN_TIMEOUT_MS);

test("an unused entry of any binary kind is reported unless its reason retains it", () => {
  const list = parseAllowlist([
    "framework\tStaleFramework\tNo longer linked.",
    "selector\tstaleSelector:\tNo longer sent.",
    "symbol\tFoundation.URL.stale() -> ()\tNo longer imported.",
    "undefined\t_stale\tNo longer imported.",
    "framework\tKeptFramework\tRetained for the allowed control.",
    "selector\tkeptSelector:\tRetained for the allowed control.",
    "symbol\tFoundation.URL.kept() -> ()\tRetained for the allowed control.",
    "undefined\t_kept\tRetained for the allowed control.",
    "selector\tinit\tSent by the app.",
  ].join("\n"));
  const surface = { frameworks: [], selectors: ["init"], urlSymbols: [], undefinedSymbols: [] };
  expect(unusedBinaryEntries(list, [surface])).toEqual([
    "framework\tStaleFramework",
    "selector\tstaleSelector:",
    "symbol\tFoundation.URL.stale() -> ()",
    "undefined\t_stale",
  ]);
}, NESTED_RUN_TIMEOUT_MS);

test("the usage command exits 0 when every entry is used, 1 naming each unused entry, and 2 when it cannot check", (context) => {
  const dir = tools(context);
  const root = mkdtempSync(join(tmpdir(), "keel-usage-"));
  context.onTestFinished(() => rmSync(root, { recursive: true, force: true }));
  const used = ["framework\tFoundation\tLinked.", "selector\tinit\tSent.", "undefined\t_objc_msgSend\tImported.", "module\tFoundation\tChecked in the source."];
  const cli = (lines, binaries = ["Release", "Verification"]) => {
    write(root, "tools/ios/allowlist.txt", `${lines.join("\n")}\n`);
    return run(process.execPath, [join(repoRoot, "tools/ios/allowlist-usage.mjs"), ...binaries], { cwd: root });
  };
  const current = cli(used);
  expect(current.status).toBe(0);
  expect(current.stderr).toBe("");
  const stale = cli([...used, "selector\tstaleSelector:\tNo longer sent."]);
  expect(stale.status).toBe(1);
  expect(stale.stderr).toBe("ios-allowlist\tunused\tselector\tstaleSelector:\n");
  expect(cli(used, ["Release"]).status).toBe(2);
  writeFileSync(join(dir, "fail-nm"), "");
  const unreadable = cli(used);
  expect(unreadable.status).toBe(2);
  expect(unreadable.stderr).toContain("stub: nm failed");
}, NESTED_RUN_TIMEOUT_MS);

test("an allowlist that lists one entry twice is rejected", () => {
  expect(() => parseAllowlist("selector\tinit\tOnce.\nselector\tinit\tTwice.\n")).toThrow("duplicate allowlist entry on line 2");
  expect(() => parseAllowlist("selector\tinit\tA selector.\nundefined\tinit\tA symbol of the same name.\n")).not.toThrow();
}, NESTED_RUN_TIMEOUT_MS);
