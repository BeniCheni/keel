import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inspectVariant } from "./bundle.mjs";
import { TIE_FILE } from "./tie.mjs";

const root = join(import.meta.dirname, "../..");
const mutant = process.argv[2];

function run(command, args) {
  return spawnSync(command, args, { cwd: root, encoding: "utf8", env: process.env });
}

function show(result) {
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
}

async function bundleMutant(planted, accept) {
  const baseline = run("node", ["spike/ios-core/check-bundle.mjs"]);
  show(baseline);
  if (baseline.status !== 0) {
    process.stdout.write(`phase=baseline exit=${baseline.status}\n`);
    process.exit(2);
  }
  process.stdout.write("phase=baseline exit=0\n");
  const inspected = await inspectVariant(root, "compile", planted);
  const reasons = inspected.flags.map((flag) => `${flag.reason}${flag.name ? `:${flag.name}` : ""}${flag.path ? `:${flag.path}` : ""}`);
  const hit = inspected.flags.some(accept);
  process.stdout.write(`phase=mutant reasons=${reasons.join(",") || "none"} hit=${hit}\n`);
  const restored = run("node", ["spike/ios-core/check-bundle.mjs"]);
  show(restored);
  if (restored.status !== 0) {
    process.stdout.write(`phase=restored exit=${restored.status}\n`);
    process.exit(5);
  }
  process.stdout.write("phase=restored exit=0\n");
  process.exit(hit ? 1 : 3);
}

function parityMutant(flag, reason, prove) {
  const baseline = run("sh", ["spike/ios-core/run-parity.sh", "--prove", prove]);
  show(baseline);
  const baselineOk = baseline.status === 0 && proveOk(prove, baseline.stdout);
  if (!baselineOk) {
    process.stdout.write(`phase=baseline exit=${baseline.status}\n`);
    process.exit(2);
  }
  process.stdout.write("phase=baseline exit=0\n");
  const changed = run("sh", ["spike/ios-core/run-parity.sh", flag]);
  show(changed);
  const hit = changed.status === 1 && changed.stdout.includes(`reason=${reason}`);
  process.stdout.write(`phase=mutant exit=${changed.status} hit=${hit}\n`);
  const restored = run("sh", ["spike/ios-core/run-parity.sh", "--prove", prove]);
  show(restored);
  const restoredOk = restored.status === 0 && proveOk(prove, restored.stdout);
  if (!restoredOk) {
    process.stdout.write(`phase=restored exit=${restored.status}\n`);
    process.exit(5);
  }
  process.stdout.write("phase=restored exit=0\n");
  process.exit(hit ? 1 : 3);
}

function proveOk(prove, text) {
  if (prove === "bytes" || prove === "reversed") {
    return text.includes("bytes=match") && text.includes("reversed=match");
  }
  if (prove === "count") return text.includes("status=pass");
  const line = text.split("\n").find((row) => row.startsWith("locale-check status=pass "));
  if (!line) return false;
  const pair = (line.split("jscontext=")[1] ?? "").split(",");
  return pair[0].startsWith("en") && pair[1].startsWith("sv") && pair[0] !== pair[1];
}

function dropSnapshotLine() {
  const path = join(root, "spike/ios-core/Sources/KeelSpikeKit/NotificationCopy.swift");
  const original = readFileSync(path, "utf8");
  const needle = "From the imported snapshot.";
  if (!original.includes(needle)) {
    process.stdout.write("phase=baseline exit=2\n");
    process.exit(2);
  }
  const baseline = run("swift", ["test", "--package-path", "spike/ios-core", "--filter", "NotificationWordingTests"]);
  if (baseline.status !== 0) {
    process.stdout.write(`phase=baseline exit=${baseline.status}\n`);
    process.exit(2);
  }
  process.stdout.write("phase=baseline exit=0\n");
  writeFileSync(path, original.replaceAll(needle, "Reminder only."));
  let status = 0;
  try {
    const changed = run("swift", ["test", "--package-path", "spike/ios-core", "--filter", "NotificationWordingTests"]);
    status = changed.status ?? 1;
    const failed = status !== 0;
    process.stdout.write(`phase=mutant exit=${status} hit=${failed}\n`);
    if (!failed) status = 0;
  } finally {
    writeFileSync(path, original);
  }
  const restored = run("swift", ["test", "--package-path", "spike/ios-core", "--filter", "NotificationWordingTests"]);
  if (restored.status !== 0) {
    process.stdout.write(`phase=restored exit=${restored.status}\n`);
    process.exit(5);
  }
  process.stdout.write("phase=restored exit=0\n");
  process.exit(status !== 0 ? 1 : 3);
}

// Each inject row must be caught by the gate it targets. This row switches each gate off in a copy of the
// harness, just before the gates are reported, and requires every inject run on that copy to survive.
function gateOff() {
  const script = join(root, "spike/ios-core/run-parity.sh");
  const copy = join(root, "spike/ios-core/.floor-gate-off.sh");
  const original = readFileSync(script, "utf8");
  const needle = 'echo "bytes=$BYTES"\n';
  if (!original.includes(needle)) {
    process.stdout.write("phase=baseline exit=2\n");
    process.exit(2);
  }
  const rows = [
    ["--inject-diff", "byte", "BYTES=match"],
    ["--inject-column", "column", "BYTES=match"],
    ["--inject-reorder", "reorder", "BYTES=match"],
    ["--inject-same-locale", "locale-same", "LOCALE=pass"],
    ["--inject-one-locale", "locale-run", "LOCALE=pass"],
    ["--inject-fewer", "fixture-count", "COUNT=pass"],
    ["--inject-localecompare", "reversed-tie", "REVERSED=match"],
  ];
  let detected = 0;
  let setup = false;
  try {
    for (const [flag, reason, off] of rows) {
      const real = run("sh", ["spike/ios-core/run-parity.sh", flag]);
      if (real.status !== 1 || !real.stdout.includes(`reason=${reason}\n`)) {
        process.stdout.write(`phase=baseline flag=${flag} exit=${real.status}\n`);
        setup = true;
        break;
      }
      writeFileSync(copy, original.replace(needle, `${off}\n${needle}`));
      const changed = run("sh", ["spike/ios-core/.floor-gate-off.sh", flag]);
      const survived = changed.status === 3 && changed.stdout.includes("reason=survived\n");
      if (survived) detected += 1;
      process.stdout.write(`phase=mutant flag=${flag} gate-off=${off} exit=${changed.status} gate-needed=${survived}\n`);
    }
  } finally {
    rmSync(copy, { force: true });
  }
  if (setup) process.exit(2);
  process.stdout.write("phase=baseline exit=0\n");
  const restored = run("sh", ["spike/ios-core/run-parity.sh", "--prove", "bytes"]);
  if (restored.status !== 0) {
    process.stdout.write(`phase=restored exit=${restored.status}\n`);
    process.exit(5);
  }
  process.stdout.write("phase=restored exit=0\n");
  const hit = detected === rows.length;
  process.stdout.write(`hit=${hit}\n`);
  process.exit(hit ? 1 : 3);
}

// A device log built from Node's own hashes passes. With one group thinned to the tie input, or with an
// error line, the comparison must fail for coverage or for the error.
function deviceThin() {
  const scratch = mkdtempSync(join(tmpdir(), "keel-spike-floor-"));
  try {
    const listed = run("git", ["ls-files", "fixtures/synthetic/terms"]);
    if (listed.status !== 0) process.exit(2);
    const files = [...listed.stdout.split("\n").filter((file) => file.endsWith(".yaml")).sort(), TIE_FILE];
    const list = join(scratch, "list.txt");
    writeFileSync(list, `${files.join("\n")}\n`);
    const full = ["KEEL_SPIKE v1 process pid=1"];
    for (const lc of ["en_US.UTF-8", "sv_SE.UTF-8"]) {
      const node = spawnSync("node", ["spike/ios-core/parity-node.mjs", root, list], {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, LC_ALL: lc },
      });
      if (node.status !== 0) process.exit(2);
      const locale = (node.stdout.match(/ locale=(\S+)/) ?? [])[1];
      const lines = node.stdout.split("\n").filter((line) => line.startsWith("{"));
      if (!locale || lines.length !== files.length) process.exit(2);
      for (const variant of ["compile", "standalone"]) {
        full.push(`KEEL_SPIKE v1 locale engine=jscontext variant=${variant} locale=${locale}`);
        for (const comparator of ["identity", "reversed"]) {
          for (const line of lines) {
            const sha = createHash("sha256").update(line, "utf8").digest("hex");
            full.push(`KEEL_SPIKE v1 parity variant=${variant} locale=${locale} comparator=${comparator} file=${JSON.parse(line).file} sha256=${sha}`);
          }
        }
      }
    }
    const compare = (name, rows) => {
      const path = join(scratch, name);
      writeFileSync(path, `${rows.join("\n")}\n`);
      return run("node", ["spike/ios-core/compare-device.mjs", root, path]);
    };
    const baseline = compare("full.log", full);
    show(baseline);
    if (baseline.status !== 0 || !baseline.stdout.includes("bytes=match")) {
      process.stdout.write(`phase=baseline exit=${baseline.status}\n`);
      process.exit(2);
    }
    process.stdout.write("phase=baseline exit=0\n");
    const thin = full.filter(
      (line) => !(line.includes(" variant=standalone ") && line.includes(" comparator=reversed ") && / locale=sv/.test(line) && line.includes(" file=fixtures/")),
    );
    const thinRun = compare("thin.log", thin);
    show(thinRun);
    const thinHit = thinRun.status === 1 && thinRun.stdout.includes("reason=coverage\n");
    const errorRun = compare("error.log", [...full, "KEEL_SPIKE v1 error subject=parity"]);
    show(errorRun);
    const errorHit = errorRun.status === 1 && errorRun.stdout.includes("reason=error\n");
    process.stdout.write(`phase=mutant thin=${thinHit} error=${errorHit}\n`);
    const restored = compare("full.log", full);
    if (restored.status !== 0) {
      process.stdout.write(`phase=restored exit=${restored.status}\n`);
      process.exit(5);
    }
    process.stdout.write("phase=restored exit=0\n");
    const hit = thinHit && errorHit;
    process.stdout.write(`hit=${hit}\n`);
    process.exit(hit ? 1 : 3);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const planted = {
  "node-fs": [`import fs from "node:fs";\nexport const f = fs;\n`, (flag) => flag.reason === "node"],
  "require-call": [`export const r = require("x");\n`, (flag) => flag.reason === "require"],
  "process-global": [`export const p = process.env.X;\n`, (flag) => flag.reason === "mark" && flag.name === "process"],
  "process-alias": [
    "const g = globalThis;\nexport const p = g.process;\n",
    (flag) => flag.reason === "mark" && flag.name === "globalThis",
  ],
  montecarlo: [`export const m = "montecarlo";\n`, (flag) => flag.reason === "montecarlo"],
};

if (planted[mutant]) {
  const [source, accept] = planted[mutant];
  await bundleMutant(source, accept);
}

const parity = {
  "alter-byte": ["--inject-diff", "byte", "bytes"],
  "reorder-diagnostics": ["--inject-reorder", "reorder", "bytes"],
  "change-column": ["--inject-column", "column", "bytes"],
  "same-locale": ["--inject-same-locale", "locale-same", "locales-differ"],
  "one-run-locale": ["--inject-one-locale", "locale-run", "locales-differ"],
  "fewer-fixtures": ["--inject-fewer", "fixture-count", "count"],
  "localecompare-dedupe": ["--inject-localecompare", "reversed-tie", "reversed"],
};

if (parity[mutant]) {
  const [flag, reason, prove] = parity[mutant];
  parityMutant(flag, reason, prove);
}

if (mutant === "drop-snapshot-line") dropSnapshotLine();
if (mutant === "gate-off") gateOff();
if (mutant === "device-thin") deviceThin();

process.stderr.write("unknown mutant\n");
process.exit(2);
