import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { inspectVariant } from "./bundle.mjs";

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
  const baselineOk =
    baseline.status === 0 &&
    (prove === "bytes"
      ? baseline.stdout.includes("bytes=match")
      : prove === "count"
        ? baseline.stdout.includes("status=pass")
        : baseline.stdout.includes("locale-check status="));
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
  const restoredOk =
    restored.status === 0 &&
    (prove === "bytes"
      ? restored.stdout.includes("bytes=match")
      : prove === "count"
        ? restored.stdout.includes("status=pass")
        : restored.stdout.includes("locale-check status="));
  if (!restoredOk) {
    process.stdout.write(`phase=restored exit=${restored.status}\n`);
    process.exit(5);
  }
  process.stdout.write("phase=restored exit=0\n");
  process.exit(hit ? 1 : 3);
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
  "fewer-fixtures": ["--inject-fewer", "fixture-count", "count"],
};

if (parity[mutant]) {
  const [flag, reason, prove] = parity[mutant];
  parityMutant(flag, reason, prove);
}

if (mutant === "drop-snapshot-line") dropSnapshotLine();

process.stderr.write("unknown mutant\n");
process.exit(2);
