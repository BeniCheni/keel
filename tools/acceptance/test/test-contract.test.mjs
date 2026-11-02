import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "vitest";
import { inspectTools } from "../spawn-graph.mjs";
import { vitestArgs } from "../../test-tooling.mjs";
import { NESTED_RUN_TIMEOUT_MS, repoRoot, repoTempPath, run, spawnCollect } from "./helpers.mjs";

function tsc(source) {
  const dir = mkdtempSync(join(tmpdir(), "keel-tsc-"));
  writeFileSync(join(dir, "probe.ts"), source);
  writeFileSync(
    join(dir, "tsconfig.json"),
    JSON.stringify({
      extends: join(repoRoot, "packages/core/tsconfig.json"),
      compilerOptions: { rootDir: ".", noEmit: true },
      include: ["probe.ts"],
    }),
  );
  const result = run("pnpm", ["exec", "tsc", "-p", join(dir, "tsconfig.json"), "--noEmit"]);
  rmSync(dir, { recursive: true, force: true });
  return result;
}

test("the core package is @keel/core on the Node 24 floor", () => {
  const root = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
  const core = JSON.parse(readFileSync(join(repoRoot, "packages/core/package.json"), "utf8"));
  expect(root.engines.node).toBe(">=24");
  expect(core.name).toBe("@keel/core");
  expect(core.devDependencies.vitest).toBe(root.devDependencies.vitest);
  expect(core.dependencies).toEqual({ ajv: "8.20.0", yaml: "2.9.1" });
  expect(Object.keys(root.devDependencies).sort()).toEqual(["typescript", "vitest"]);
});

test("strict, noUncheckedIndexedAccess, and exactOptionalPropertyTypes are in force", () => {
  expect(tsc("export const value = 1;\n").status).toBe(0);
  expect(tsc("export function first(values: string[]): string {\n  return values[0];\n}\n").status).not.toBe(0);
  expect(tsc("type Box = { label?: string };\nexport const box: Box = { label: undefined };\n").status).not.toBe(0);
  expect(tsc("export function shout(value: string | null): string {\n  return value.toUpperCase();\n}\n").status).not.toBe(0);
}, NESTED_RUN_TIMEOUT_MS);

test("a filter that matches no file fails", () => {
  const result = run("pnpm", ["--filter", "@keel/core", "test", "zz-no-such-test-file"]);
  expect(result.status).not.toBe(0);
}, NESTED_RUN_TIMEOUT_MS);

test("test:tooling drops a leading -- so the filter reaches vitest", () => {
  const scripts = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")).scripts;
  expect(scripts["test:tooling"]).toBe("node tools/test-tooling.mjs");
  expect(vitestArgs(["--", "tripwire"])).toEqual(["run", "--config", "tools/vitest.config.mjs", "tripwire"]);
  expect(vitestArgs(["tripwire"])).toEqual(["run", "--config", "tools/vitest.config.mjs", "tripwire"]);
  expect(vitestArgs([])).toEqual(["run", "--config", "tools/vitest.config.mjs"]);
  const narrowed = run(process.execPath, ["tools/test-tooling.mjs", "--", "copy-boundary"]);
  expect(narrowed.status).toBe(0);
  expect(visible(`${narrowed.stdout}\n${narrowed.stderr}`)).toMatch(/Test Files\s+1 passed \(1\)/);
  const none = run(process.execPath, ["tools/test-tooling.mjs", "--", "zz-no-such-tooling-test"]);
  expect(none.status).not.toBe(0);
  expect(visible(`${none.stdout}\n${none.stderr}`)).toContain("No test files found");
}, NESTED_RUN_TIMEOUT_MS);

function visible(text) {
  return text.replace(/\u001b\[[0-9;]*m/g, "");
}

function honestySource(passes) {
  return [
    'import { expect, test } from "vitest";',
    'test("marker", () => {',
    passes ? "  expect(1).toBe(1);" : "  expect(1).toBe(2);",
    "});",
    "",
  ].join("\n");
}

function readReport(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

test("a temporary honesty test is discovered from the json report, and a failing one turns the run red", () => {
  const reportDir = mkdtempSync(join(tmpdir(), "keel-honesty-"));
  const srcDir = join(repoRoot, "packages/core/src");
  const passing = repoTempPath(srcDir, ".honesty.test.ts");
  const failing = repoTempPath(srcDir, ".honesty.test.ts");
  const passReport = join(reportDir, "pass.json");
  const failReport = join(reportDir, "fail.json");
  try {
    writeFileSync(passing, honestySource(true));
    const ok = run("pnpm", [
      "--filter",
      "@keel/core",
      "test",
      basename(passing, ".test.ts"),
      "--reporter=json",
      `--outputFile=${passReport}`,
    ]);
    const passed = readReport(passReport);
    expect(ok.status).toBe(0);
    expect(passed.testResults.map((item) => item.name)).toEqual([passing]);
    expect(passed.numPassedTests).toBe(1);
    expect(passed.numFailedTests).toBe(0);
    rmSync(passing, { force: true });
    writeFileSync(failing, honestySource(false));
    const bad = run("pnpm", [
      "--filter",
      "@keel/core",
      "test",
      basename(failing, ".test.ts"),
      "--reporter=json",
      `--outputFile=${failReport}`,
    ]);
    const failed = readReport(failReport);
    expect(bad.status).not.toBe(0);
    expect(failed.testResults.map((item) => item.name)).toEqual([failing]);
    expect(failed.numFailedTests).toBe(1);
    expect(failed.numPassedTests).toBe(0);
  } finally {
    rmSync(passing, { force: true });
    rmSync(failing, { force: true });
    rmSync(reportDir, { recursive: true, force: true });
  }
}, NESTED_RUN_TIMEOUT_MS);

function putFile(root, rel, lines) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${lines.join("\n")}\n`);
}

function spawnFixture() {
  const root = mkdtempSync(join(tmpdir(), "keel-spawn-"));
  putFile(root, "tools/acceptance/test/helpers.mjs", [
    'import { spawnSync } from "node:child_process";',
    "export const NESTED_RUN_TIMEOUT_MS = 60000;",
    "export function run() {",
    '  spawnSync("true", []);',
    "}",
    "export function write() {",
    "  return 1;",
    "}",
  ]);
  putFile(root, "tools/leaf.mjs", [
    'import { spawnSync } from "node:child_process";',
    "export function leaf() {",
    '  spawnSync("true", []);',
    "}",
  ]);
  putFile(root, "tools/wrap-leaf.mjs", [
    'import { leaf } from "./leaf.mjs";',
    "export function wrapped() {",
    "  leaf();",
    "}",
  ]);
  putFile(root, "tools/reexport-leaf.mjs", ['export { leaf } from "./leaf.mjs";']);
  putFile(root, "tools/wrap-helper.mjs", [
    'import { run } from "./acceptance/test/helpers.mjs";',
    "export function viaRun() {",
    "  run();",
    "}",
  ]);
  putFile(root, "tools/reexport-helper.mjs", ['export { run } from "./acceptance/test/helpers.mjs";']);
  putFile(root, "tools/wrap-helper-2.mjs", [
    'import { viaRun } from "./wrap-helper.mjs";',
    "export function viaVia() {",
    "  viaRun();",
    "}",
  ]);
  putFile(root, "tools/wrap-write.mjs", [
    'import { write } from "./acceptance/test/helpers.mjs";',
    "export function viaWrite() {",
    "  write();",
    "}",
  ]);
  putFile(root, "tools/leaf-bare.mjs", [
    'import { spawnSync } from "child_process";',
    "export function bare() {",
    '  spawnSync("true", []);',
    "}",
  ]);
  putFile(root, "tools/leaf-dynamic.mjs", [
    'const cp = await import("node:child_process");',
    "export function dynamic() {",
    '  cp.spawnSync("true", []);',
    "}",
  ]);
  putFile(root, "tools/leaf-require.mjs", [
    'import { createRequire } from "node:module";',
    "const require = createRequire(import.meta.url);",
    'const { spawnSync } = require("node:child_process");',
    "export function required() {",
    '  spawnSync("true", []);',
    "}",
  ]);
  putFile(root, "tools/leaf-builtin.mjs", [
    'const { spawnSync } = process.getBuiltinModule("node:child_process");',
    "export function builtin() {",
    '  spawnSync("true", []);',
    "}",
  ]);
  putFile(root, "tools/leaf-common.cjs", [
    'const { spawnSync } = require("node:child_process");',
    "module.exports = {",
    "  common() {",
    '    spawnSync("true", []);',
    "  },",
    "};",
  ]);
  putFile(root, "tools/acceptance/test/spawn-fixtures.mjs", [
    'import { test } from "vitest";',
    'import { NESTED_RUN_TIMEOUT_MS } from "./helpers.mjs";',
    'import { leaf } from "../../leaf.mjs";',
    'import { wrapped } from "../../wrap-leaf.mjs";',
    'import { leaf as reexported } from "../../reexport-leaf.mjs";',
    'import { viaRun } from "../../wrap-helper.mjs";',
    'import { run } from "../../reexport-helper.mjs";',
    'import { viaVia } from "../../wrap-helper-2.mjs";',
    'import { viaWrite } from "../../wrap-write.mjs";',
    'import { bare } from "../../leaf-bare.mjs";',
    'import { dynamic } from "../../leaf-dynamic.mjs";',
    'import { required } from "../../leaf-require.mjs";',
    'import { builtin } from "../../leaf-builtin.mjs";',
    'import common from "../../leaf-common.cjs";',
    "const OTHER = 180000;",
    "const alias = leaf;",
    "const bag = { leaf };",
    "const stored = () => {",
    "  leaf();",
    "};",
    "class Box {",
    "  open() {",
    "    leaf();",
    "  }",
    "}",
    "function throughLeaf() {",
    "  leaf();",
    "}",
    'test("leaf", () => {',
    "  leaf();",
    "});",
    'test("wrap", () => {',
    "  wrapped();",
    "});",
    'test("reexport", () => {',
    "  reexported();",
    "});",
    'test("helper", () => {',
    "  viaRun();",
    "});",
    'test("reexport helper", () => {',
    "  run();",
    "});",
    'test("second", () => {',
    "  viaVia();",
    "});",
    'test("through", () => {',
    "  throughLeaf();",
    "});",
    'test("write", () => {',
    "  viaWrite();",
    "});",
    'test("leaf with timeout", () => {',
    "  leaf();",
    "}, NESTED_RUN_TIMEOUT_MS);",
    'test("bare", () => {',
    "  bare();",
    "});",
    'test("dynamic", () => {',
    "  dynamic();",
    "});",
    'test("required", () => {',
    "  required();",
    "});",
    'test("builtin", () => {',
    "  builtin();",
    "});",
    'test("common", () => {',
    "  common.common();",
    "});",
    'test.each([1])("each %i", () => {',
    "  leaf();",
    "});",
    'test.only("only", () => {',
    "  leaf();",
    "});",
    'test.concurrent("concurrent", () => {',
    "  leaf();",
    "});",
    'test("alias", () => {',
    "  alias();",
    "});",
    'test("bag", () => {',
    "  bag.leaf();",
    "});",
    'test("stored", stored);',
    'test("passed", () => {',
    "  [1].forEach(leaf);",
    "});",
    'test("optional", () => {',
    "  leaf?.();",
    "});",
    'test("invoked", () => {',
    "  leaf.call(null);",
    "});",
    'test("imported", async () => {',
    '  const mod = await import("../../leaf.mjs");',
    "  mod.leaf();",
    "});",
    'test("boxed", () => {',
    "  new Box().open();",
    "});",
    'test("literal", () => {',
    "  leaf();",
    "}, 180000);",
    'test("other", () => {',
    "  leaf();",
    "}, OTHER);",
    'test("options", { timeout: NESTED_RUN_TIMEOUT_MS }, () => {',
    "  leaf();",
    "});",
    'test.each([1])("each with timeout %i", () => {',
    "  leaf();",
    "}, NESTED_RUN_TIMEOUT_MS);",
  ]);
  putFile(root, "tools/acceptance/test/bad-import.mjs", [
    'import { spawnSync } from "node:child_process";',
    'import { test } from "vitest";',
    'test("bad", () => {',
    '  spawnSync("true", []);',
    "});",
  ]);
  putFile(root, "tools/acceptance/test/bad-bare.mjs", [
    'import { spawnSync } from "child_process";',
    'import { test } from "vitest";',
    'test("bad", () => {',
    '  spawnSync("true", []);',
    "});",
  ]);
  putFile(root, "tools/acceptance/test/bad-dynamic.mjs", [
    'import { test } from "vitest";',
    'const { spawnSync } = await import("node:child_process");',
    'test("bad", () => {',
    '  spawnSync("true", []);',
    "});",
  ]);
  putFile(root, "tools/acceptance/test/bad-require.mjs", [
    'import { createRequire } from "node:module";',
    'import { test } from "vitest";',
    "const require = createRequire(import.meta.url);",
    'const { spawnSync } = require("node:child_process");',
    'test("bad", () => {',
    '  spawnSync("true", []);',
    "});",
  ]);
  putFile(root, "tools/acceptance/test/bad-builtin.mjs", [
    'import { test } from "vitest";',
    'const { spawnSync } = process.getBuiltinModule("node:child_process");',
    'test("bad", () => {',
    '  spawnSync("true", []);',
    "});",
  ]);
  return root;
}

function symbols(report, file) {
  return report.entryPoints.filter((entry) => entry.file === file).map((entry) => entry.symbol).sort();
}

test("the spawn graph follows wrappers and re-exports and leaves a write-only wrapper out", () => {
  const root = spawnFixture();
  try {
    const report = inspectTools(root);
    expect(symbols(report, "tools/leaf.mjs")).toEqual(["leaf"]);
    expect(symbols(report, "tools/wrap-leaf.mjs")).toEqual(["wrapped"]);
    expect(symbols(report, "tools/reexport-leaf.mjs")).toEqual(["leaf"]);
    expect(symbols(report, "tools/wrap-helper.mjs")).toEqual(["viaRun"]);
    expect(symbols(report, "tools/reexport-helper.mjs")).toEqual(["run"]);
    expect(symbols(report, "tools/wrap-helper-2.mjs")).toEqual(["viaVia"]);
    expect(symbols(report, "tools/wrap-write.mjs")).toEqual([]);
    expect(symbols(report, "tools/acceptance/test/helpers.mjs")).toEqual(["run"]);
    expect(symbols(report, "tools/leaf-bare.mjs")).toEqual(["bare"]);
    expect(symbols(report, "tools/leaf-dynamic.mjs")).toEqual(["dynamic"]);
    expect(symbols(report, "tools/leaf-require.mjs")).toEqual(["required"]);
    expect(symbols(report, "tools/leaf-builtin.mjs")).toEqual(["builtin"]);
    expect(symbols(report, "tools/leaf-common.cjs")).toEqual([]);
    expect(report.missingTimeouts.map((item) => item.name).sort()).toEqual([
      "alias",
      "bag",
      "bare",
      "boxed",
      "builtin",
      "common",
      "concurrent",
      "dynamic",
      "each %i",
      "helper",
      "imported",
      "invoked",
      "leaf",
      "literal",
      "only",
      "optional",
      "other",
      "passed",
      "reexport",
      "reexport helper",
      "required",
      "second",
      "stored",
      "through",
      "wrap",
    ]);
    expect(report.forbiddenChildProcessImports).toEqual([
      "tools/acceptance/test/bad-bare.mjs",
      "tools/acceptance/test/bad-builtin.mjs",
      "tools/acceptance/test/bad-dynamic.mjs",
      "tools/acceptance/test/bad-import.mjs",
      "tools/acceptance/test/bad-require.mjs",
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("unrecognised uses of spawning namespaces fail closed", () => {
  const root = spawnFixture();
  try {
    const forms = [
      'test("probe", () => { const { run: r } = h; r(); });',
      'test("probe", () => { h["run"](); });',
      'const { run: r } = h; test("probe", () => { r(); });',
      'const r = h.run; test("probe", () => { r(); });',
      'const other = h; test("probe", () => { other.run(); });',
      'test("probe", () => { Reflect.apply(h.run, null, []); });',
      'test("probe", () => { h.nope(); });',
    ];
    for (const form of forms) {
      putFile(root, "tools/acceptance/test/namespace.mjs", [
        'import { test } from "vitest";',
        'import * as h from "./helpers.mjs";',
        form,
      ]);
      expect(() => inspectTools(root), form).toThrow(/unrecognised spawning namespace use/);
    }
    putFile(root, "tools/acceptance/test/namespace.mjs", [
      'import { test } from "vitest";',
      'import * as h from "./helpers.mjs";',
      'import * as c from "../../leaf-common.cjs";',
      'test("direct namespace spawn", () => { h.run(); });',
      'test("common namespace spawn", () => { c.common(); });',
      'test("namespace write only", () => { h.write(); });',
    ]);
    expect(inspectTools(root).missingTimeouts.filter((item) => item.file.endsWith("/namespace.mjs"))
      .map((item) => item.name)).toEqual(["direct namespace spawn", "common namespace spawn"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("unrecognised vitest test registration fails closed", () => {
  const root = spawnFixture();
  try {
    const escaping = [
      [
        'import * as v from "vitest";',
        'import { leaf } from "../../leaf.mjs";',
        'v.test("namespace", () => { leaf(); });',
      ],
      [
        'import vitest from "vitest";',
        'import { leaf } from "../../leaf.mjs";',
        'vitest.test("default", () => { leaf(); });',
      ],
      [
        'import { default as vitest } from "vitest";',
        'import { leaf } from "../../leaf.mjs";',
        'vitest.test("named default", () => { leaf(); });',
      ],
      [
        'import { test } from "vitest";',
        'import { leaf } from "../../leaf.mjs";',
        "const extended = test.extend({});",
        'extended("extended", () => { leaf(); });',
      ],
      [
        'import { leaf } from "../../leaf.mjs";',
        'const { test } = await import("vitest");',
        'test("dynamic", () => { leaf(); });',
      ],
      [
        'import { leaf } from "../../leaf.mjs";',
        'const { test } = require("vitest");',
        'test("required", () => { leaf(); });',
      ],
      [
        'import { test } from "vitest";',
        'import { leaf } from "../../leaf.mjs";',
        "const t = test;",
        't("bound", () => { leaf(); });',
      ],
      [
        'import { test } from "vitest";',
        'import { leaf } from "../../leaf.mjs";',
        "let bound;",
        'test((bound = test, "title"), () => {});',
        'bound("after title", () => { leaf(); });',
      ],
      [
        'import { test } from "vitest";',
        'import { leaf } from "../../leaf.mjs";',
        "let extended;",
        'test((extended = test.extend({}), "title"), () => {});',
        'extended("after title", () => { leaf(); });',
      ],
      [
        'import { test } from "vitest";',
        'import { leaf } from "../../leaf.mjs";',
        "let extended;",
        'test.each((extended = test.extend({}), [1]))("table", () => {});',
        'extended("after table", () => { leaf(); });',
      ],
      [
        'import { test } from "vitest";',
        'import { leaf } from "../../leaf.mjs";',
        "let extended;",
        'test.skipIf((extended = test.extend({}), 0))("condition", () => {});',
        'extended("after condition", () => { leaf(); });',
      ],
      [
        'import { test } from "vitest";',
        'test("callback", () => { const t = test; t("inner"); });',
      ],
      [
        'import { test } from "vitest";',
        'import { leaf } from "../../leaf.mjs";',
        'const args = ["spread", () => { leaf(); }];',
        "test(...args);",
      ],
      [
        'import { test } from "vitest";',
        'import { leaf } from "../../leaf.mjs";',
        't\\u0065st("escaped", () => { leaf(); });',
      ],
      ['import { test } from "vitest";', "const t = test.each([1]);"],
      ['import { test } from "vitest";', "const t = test.skipIf(0);"],
      ['import { test } from "vitest";', "const t = test.only;"],
      ['import { test } from "vitest";', "const t = test.concurrent;"],
      ['export { test } from "vitest";'],
      ['export { test as t } from "vitest";'],
      ['export * from "vitest";'],
      ['export * as v from "vitest";'],
      ["const before = 1", 'export { test } from "vitest"'],
      [
        'import { leaf } from "../../leaf.mjs";',
        "const { test } = await import(`vitest`);",
        'test("template", () => { leaf(); });',
      ],
      [
        'import { leaf } from "../../leaf.mjs";',
        'const { test } = await import(("vitest"));',
        'test("parenthesised", () => { leaf(); });',
      ],
      [
        'import { vi } from "vitest";',
        'import { leaf } from "../../leaf.mjs";',
        'const { test } = await vi.importActual("vitest");',
        'test("actual", () => { leaf(); });',
      ],
      [
        'import { leaf } from "../../leaf.mjs";',
        "const { test } = import.meta.vitest;",
        'test("meta", () => { leaf(); });',
      ],
      ['const { test } = import.meta["vitest"];'],
      ["const { vitest } = import.meta;"],
      ["const meta = import.meta;"],
      ["const vitest = import.meta?.vitest;"],
      ['const vitest = import.meta?.["vitest"];'],
      ['import { test } from "../../../node_modules/vitest/dist/index.js";'],
      ['const { test } = await import("../../../node_modules/vitest/dist/index.js");'],
      ['export { test } from "../../../node_modules/.pnpm/vitest@5.0.5/node_modules/vitest/dist/index.js";'],
      ['import { test } from "@vitest/runner";'],
      [
        'import { leaf } from "../../leaf.mjs";',
        'const { test } = await import("vit\\u0065st");',
        'test("unicode", () => { leaf(); });',
      ],
      ['const { test } = await import(`vit\\u{65}st`);'],
    ];
    for (const lines of escaping) {
      putFile(root, "tools/acceptance/test/escape.mjs", lines);
      expect(() => inspectTools(root), lines.join("\n")).toThrow(/unrecognised vitest test registration/);
    }
    rmSync(join(root, "tools/acceptance/test/escape.mjs"));
    for (const extension of ["mts", "cts", "jsx", "tsx"]) {
      const rel = `tools/escape.${extension}`;
      putFile(root, rel, ['export { test } from "vitest";']);
      expect(() => inspectTools(root), rel).toThrow(/unrecognised vitest test registration/);
      rmSync(join(root, rel));
    }
    putFile(root, "tools/acceptance/test/other-spec.mjs", [
      'import { defineConfig, test } from "vitest/config";',
      'import { leaf } from "../../leaf.mjs";',
      "const notATestLocal = test;",
      'client.require("vitest");',
      'client?.import("vitest");',
      'const pair = [require, "vitest"];',
      "const here = import.meta.url;",
      "const located = import.meta?.dirname;",
      'const notVitest = await import("../../leaf.mjs");',
      'const vitest = "../../leaf.mjs";',
      "const constructed = await import(vitest);",
      'const quoted = "vitest";',
      'export { leaf as again } from "../../leaf.mjs";',
    ]);
    expect(inspectTools(root).missingTimeouts.filter((item) => item.file.endsWith("/other-spec.mjs"))).toEqual([]);
    putFile(root, "tools/acceptance/test/registered.mjs", [
      'import { describe, it, test } from "vitest";',
      'import { NESTED_RUN_TIMEOUT_MS } from "./helpers.mjs";',
      'import { leaf } from "../../leaf.mjs";',
      'test("plain", () => { leaf(); });',
      'it("it", () => { leaf(); });',
      'test.each([1])("each %i", () => { leaf(); });',
      'test.only("only", () => { leaf(); });',
      'test.concurrent("concurrent", () => { leaf(); });',
      'test.skipIf(1)("skipIf", () => { leaf(); });',
      'describe("suite", () => {',
      '  test("inside describe", () => { leaf(); });',
      "});",
      'test("timed", () => { leaf(); }, NESTED_RUN_TIMEOUT_MS);',
    ]);
    putFile(root, "tools/acceptance/test/registered-alias.mjs", [
      'import { test as it2 } from "vitest";',
      'import { leaf } from "../../leaf.mjs";',
      'it2("aliased", () => { leaf(); });',
    ]);
    putFile(root, "tools/acceptance/test/not-registered.mjs", [
      'import { test } from "vitest";',
      'import { leaf } from "../../leaf.mjs";',
      "const member = other.test;",
      "const optional = other?.test;",
      'other.test("member", () => { leaf(); });',
      'other?.test("optional", () => { leaf(); });',
      "function shadow() {",
      "  function test(value = leaf()) { return value; }",
      "}",
    ]);
    putFile(root, "tools/acceptance/test/registered-timed.mjs", [
      'import { it, test } from "vitest";',
      'import { NESTED_RUN_TIMEOUT_MS as T } from "./helpers.mjs";',
      'import { leaf } from "../../leaf.mjs";',
      'test.each([1])("each", () => { leaf(); }, T);',
      'test.skipIf(0)("skipIf", () => { leaf(); }, T);',
      'test.only("only", { timeout: T }, () => { leaf(); });',
      'test.only("only third", () => { leaf(); }, T);',
      'test.concurrent("concurrent", () => { leaf(); }, T);',
      'test.concurrent("concurrent options", { timeout: T }, () => { leaf(); });',
      'it.each([1])("it each", { timeout: T }, () => { leaf(); });',
      'test.each([1], T)("table call", () => { leaf(); });',
      'test.each([1], { timeout: T })("table options", () => { leaf(); });',
      'test.skipIf(0, T)("condition call", () => { leaf(); });',
      'test.each([1])("each fourth", () => { leaf(); }, 1000, T);',
      'test.only("only literal", () => { leaf(); }, 1000);',
    ]);
    putFile(root, "tools/acceptance/test/registered-statement.mjs", [
      'import { test } from "vitest";',
      'import { leaf } from "../../leaf.mjs";',
      "const dotted = other.import, first = leaf();",
      "const optional = other?.import, second = leaf();",
      "const located = import.meta.url, third = leaf();",
      'const loaded = await import("../../leaf.mjs");',
      'test("dotted", () => { dotted(); });',
      'test("optional", () => { optional(); });',
      'test("located", () => { located(); });',
      'test("loaded", () => { loaded.leaf(); });',
      'test("first call", () => { leaf(); })();',
    ]);
    putFile(root, "tools/acceptance/test/registered-escaped.mjs", [
      'import { test } from "vit\\x65st";',
      'import { leaf } from "../../leaf.mjs";',
      'test("hex", () => { leaf(); });',
    ]);
    putFile(root, "tools/acceptance/test/registered-continued.mjs", [
      'import { it } from "vi\\',
      'test";',
      'import { leaf } from "../../leaf.mjs";',
      'it("continued", () => { leaf(); });',
    ]);
    putFile(root, "tools/acceptance/test/registered-no-semi.mjs", [
      "const before = 1",
      'import { test } from "vitest"',
      "const between = before + 1",
      'import { leaf } from "../../leaf.mjs"',
      'test("no semicolons", () => { leaf() })',
    ]);
    const report = inspectTools(root);
    expect(report.missingTimeouts.filter((item) => item.file.endsWith("/not-registered.mjs"))).toEqual([]);
    expect(report.missingTimeouts.filter((item) => item.file.endsWith("/registered-timed.mjs")).map((item) => item.name))
      .toEqual(["table call", "table options", "condition call", "each fourth", "only literal"]);
    expect(report.missingTimeouts.filter((item) => item.file.endsWith("/registered-statement.mjs")).map((item) => item.name))
      .toEqual(["dotted", "optional", "located", "loaded", "first call"]);
    expect(report.missingTimeouts.filter((item) => item.file.endsWith("/registered-no-semi.mjs")).map((item) => item.name))
      .toEqual(["no semicolons"]);
    expect(report.missingTimeouts.filter((item) => item.file.endsWith("/registered-escaped.mjs")).map((item) => item.name))
      .toEqual(["hex"]);
    expect(report.missingTimeouts.filter((item) => item.file.endsWith("/registered-continued.mjs")).map((item) => item.name))
      .toEqual(["continued"]);
    expect(report.missingTimeouts.filter((item) => item.file.endsWith("/registered.mjs")).map((item) => item.name))
      .toEqual(["plain", "it", "each %i", "only", "concurrent", "skipIf", "inside describe"]);
    expect(report.missingTimeouts.filter((item) => item.file.endsWith("/registered-alias.mjs")).map((item) => item.name))
      .toEqual(["aliased"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("dynamic code execution is forbidden under tools", () => {
  const root = spawnFixture();
  try {
    for (const form of [
      'new Function("return 1")();',
      'Function("return 1")();',
      'eval("1");',
      '(0, eval)("1");',
      'const execute = eval; execute("1");',
      'globalThis["eval"]("1");',
    ]) {
      putFile(root, "tools/opaque.mjs", [form]);
      expect(() => inspectTools(root), form).toThrow(/dynamic code execution is forbidden/);
    }
    putFile(root, "tools/opaque.mjs", [
      '// new Function("ignored"); eval("ignored");',
      'export const description = "new Function and eval are forbidden";',
    ]);
    expect(() => inspectTools(root)).not.toThrow();
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("unrecognised builtin-loader uses fail closed", () => {
  const root = spawnFixture();
  try {
    for (const form of [
      'const get = process.getBuiltinModule; const cp = get("node:child_process");',
      'const { getBuiltinModule: get } = process; const cp = get("child_process");',
      'const cp = process["getBuiltinModule"]("node:child_process");',
      'const get = process.getBuiltinModule.bind(process); const cp = get("child_process");',
      'const spec = "node:child_process"; const cp = process.getBuiltinModule(spec);',
    ]) {
      putFile(root, "tools/opaque.mjs", [form]);
      expect(() => inspectTools(root), form).toThrow(/unrecognised builtin loader use/);
    }
    putFile(root, "tools/opaque.mjs", ['const fs = process.getBuiltinModule("node:fs");']);
    expect(() => inspectTools(root)).not.toThrow();
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("missing dependencies inside tools fail closed", () => {
  const root = spawnFixture();
  try {
    symlinkSync("missing.mjs", join(root, "tools/gone.mjs"));
    for (const form of [
      'import { run } from "../../gone.mjs"; test("missing", () => { run(); });',
      'export { run } from "../../gone.mjs";',
      'test("missing", async () => { const mod = await import("../../gone.mjs"); mod.run(); });',
    ]) {
      putFile(root, "tools/acceptance/test/missing.mjs", ['import { test } from "vitest";', form]);
      expect(() => inspectTools(root), form).toThrow(/missing module inside tools/);
    }
    rmSync(join(root, "tools/acceptance/test/missing.mjs"));
    expect(() => inspectTools(root)).not.toThrow();
    symlinkSync("loop.mjs", join(root, "tools/loop.mjs"));
    expect(() => inspectTools(root)).toThrow(/ELOOP/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("timeout options use the complete binding in a Vitest timeout position", () => {
  const root = spawnFixture();
  try {
    putFile(root, "tools/acceptance/test/timeout-options.mjs", [
      'import { test } from "vitest";',
      'import { run, NESTED_RUN_TIMEOUT_MS } from "./helpers.mjs";',
      'test("expression", { timeout: NESTED_RUN_TIMEOUT_MS / 60 }, () => { run(); });',
      'test("nested", { metadata: { timeout: NESTED_RUN_TIMEOUT_MS }, timeout: 1000 }, () => { run(); });',
      'test("duplicate", { timeout: NESTED_RUN_TIMEOUT_MS, timeout: 1000 }, () => { run(); });',
      'test("fourth", () => { run(); }, 1000, NESTED_RUN_TIMEOUT_MS);',
      'test("named", () => { run(); }, NESTED_RUN_TIMEOUT_MS);',
      'test("second options", { timeout: NESTED_RUN_TIMEOUT_MS }, () => { run(); });',
      'test("third options", () => { run(); }, { timeout: NESTED_RUN_TIMEOUT_MS });',
    ]);
    expect(inspectTools(root).missingTimeouts.filter((item) => item.file.endsWith("/timeout-options.mjs"))
      .map((item) => item.name)).toEqual(["expression", "nested", "duplicate", "fourth"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("spawned tooling tests declare NESTED_RUN_TIMEOUT_MS of at least 60000", () => {
  const live = inspectTools(repoRoot);
  expect(live.forbiddenChildProcessImports).toEqual([]);
  expect(live.missingTimeouts).toEqual([]);
  expect(live.nestedTimeoutMs).toBe(NESTED_RUN_TIMEOUT_MS);
  expect(live.nestedTimeoutMs).toBeGreaterThanOrEqual(60000);
  expect(symbols(live, "tools/acceptance/test/helpers.mjs")).toEqual([
    "cleanRepo",
    "commitAll",
    "git",
    "pointOrigin",
    "run",
    "spawnCollect",
    "tempGit",
    "tripwire",
  ]);
  expect(symbols(live, "tools/tripwire/scan.mjs")).toEqual([
    "ALLOWLIST_REL",
    "VENDORS_REL",
    "cusipCheckDigit",
    "isLocalOnly",
    "scanRepo",
  ]);
  expect(symbols(live, "tools/fixtures/check.mjs")).toEqual([
    "check",
    "productionTrees",
    "splitTrees",
    "treesOf",
    "verifyDeterminism",
    "verifyRegistered",
  ]);
  expect(symbols(live, "tools/network/run.mjs")).toEqual(["blockedByGuard", "probeNames", "runProbe", "runProbes"]);
  expect(symbols(live, "tools/test-tooling.mjs")).toEqual(["vitestArgs"]);
  expect(symbols(live, "tools/verify/steps.mjs")).toEqual(["repoRoot", "steps"]);
});

/** A per-process temp file of a concurrent run can vanish between listing and reading. */
function readVanishing(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

test("tooling tests do not embed fixed repo temp names", () => {
  const hits = [];
  // A string literal that is a path whose last segment is a test file name. A bare suffix such as
  // ".test.mjs" has no name part; that is what repoTempPath takes.
  const pattern = /["'`](?:[^"'`\n]*\/)?([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*\.test\.(?:mjs|ts))["'`]/g;
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.name.endsWith(".test.mjs")) {
        const source = readVanishing(path);
        if (source === null) continue;
        for (const match of source.matchAll(pattern)) hits.push(`${entry.name} ${match[1]}`);
      }
    }
  };
  visit(join(repoRoot, "tools"));
  expect(hits).toEqual([]);
});

function tempName(pid, suffix) {
  return new RegExp(`^zz-${pid}-[0-9a-f]{16}${suffix.replaceAll(".", "\\.")}$`);
}

test("repoTempPath names carry this process id and a fresh random part", () => {
  const dir = join(tmpdir(), "keel-names");
  const first = basename(repoTempPath(dir, ".test.mjs"));
  const second = basename(repoTempPath(dir, ".test.mjs"));
  expect(first).toMatch(tempName(process.pid, ".test.mjs"));
  expect(second).toMatch(tempName(process.pid, ".test.mjs"));
  expect(second).not.toBe(first);
});

test("a file that vanishes between listing and reading does not fail the scan", () => {
  const root = spawnFixture();
  try {
    symlinkSync("missing.mjs", join(root, "tools/gone.mjs"));
    const report = inspectTools(root);
    expect(symbols(report, "tools/leaf.mjs")).toEqual(["leaf"]);
    expect(report.entryPoints.some((entry) => entry.file === "tools/gone.mjs")).toBe(false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("overlapping processes use different repo temp names and leave nothing behind", async () => {
  const barrier = mkdtempSync(join(tmpdir(), "keel-overlap-"));
  const script = join(barrier, "write-temp.mjs");
  const repoDir = join(repoRoot, "tools/acceptance/test");
  const helperUrl = pathToFileURL(join(repoRoot, "tools/acceptance/test/helpers.mjs")).href;
  writeFileSync(
    script,
    [
      'import { readdirSync, rmSync, writeFileSync } from "node:fs";',
      'import { setTimeout } from "node:timers/promises";',
      'import { join } from "node:path";',
      `import { repoTempPath } from ${JSON.stringify(helperUrl)};`,
      "const barrier = process.argv[2];",
      "const repoDir = process.argv[3];",
      "const suffix = process.argv[4];",
      "const deadline = Date.now() + 30000;",
      "async function waitFor(prefix, count) {",
      "  while (readdirSync(barrier).filter((name) => name.startsWith(prefix)).length < count) {",
      "    if (Date.now() > deadline) process.exit(3);",
      "    await setTimeout(15);",
      "  }",
      "}",
      'writeFileSync(join(barrier, "ready-" + process.pid), "ready");',
      'await waitFor("ready-", 2);',
      "const path = repoTempPath(repoDir, suffix);",
      'writeFileSync(path, "overlap\\n", { flag: "wx" });',
      'writeFileSync(join(barrier, "path-" + process.pid), path);',
      'await waitFor("path-", 2);',
      "rmSync(path, { force: true });",
      'process.stdout.write(process.pid + " " + path + "\\n");',
      "",
    ].join("\n"),
  );
  try {
    const args = [script, barrier, repoDir, ".test.mjs"];
    const results = await Promise.all([
      spawnCollect(process.execPath, args),
      spawnCollect(process.execPath, args),
    ]);
    expect(results.map((result) => result.status), results.map((result) => result.stderr).join("\n")).toEqual([0, 0]);
    const reported = results.map((result) => result.stdout.trim().split(" "));
    const paths = reported.map(([, path]) => path);
    expect(paths[0]).not.toBe(paths[1]);
    expect(reported[0][0]).not.toBe(reported[1][0]);
    for (const [pid, path] of reported) expect(basename(path)).toMatch(tempName(pid, ".test.mjs"));
    const after = run("git", ["status", "--porcelain", "--untracked-files=all", "--", "packages", "tools"]);
    expect(after.status).toBe(0);
    for (const path of paths) {
      expect(existsSync(path)).toBe(false);
      expect(after.stdout).not.toContain(basename(path));
    }
  } finally {
    try {
      for (const name of readdirSync(barrier)) {
        if (!name.startsWith("path-")) continue;
        rmSync(readFileSync(join(barrier, name), "utf8").trim(), { force: true });
      }
    } catch {
      // The barrier is removed below either way.
    }
    rmSync(barrier, { recursive: true, force: true });
  }
}, NESTED_RUN_TIMEOUT_MS);
