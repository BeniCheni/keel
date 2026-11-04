import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.argv[2];
const logPath = process.argv[3];
const log = readFileSync(logPath, "utf8");
const records = [];
for (const line of log.split("\n")) {
  if (!line.startsWith("KEEL_SPIKE v1 parity ")) continue;
  const fields = {};
  for (const part of line.split(" ").slice(3)) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    fields[part.slice(0, index)] = part.slice(index + 1);
  }
  if (!fields.variant || !fields.locale || !fields.file || !fields.sha256) continue;
  records.push(fields);
}

const locales = [...new Set(records.map((record) => record.locale))].sort();
const variants = [...new Set(records.map((record) => record.variant))].sort();
const files = [...new Set(records.map((record) => record.file))].sort();
process.stdout.write(
  `device-compare records=${records.length} locales=${locales.join(",") || "none"} variants=${variants.join(",") || "none"} files=${files.length}\n`,
);

function fail(reason) {
  process.stdout.write(`reason=${reason}\n`);
  process.exit(1);
}

if (!locales.some((locale) => locale.startsWith("haw")) || !locales.some((locale) => locale.startsWith("en"))) {
  fail("locale");
}
if (files.length !== 31 || !variants.includes("compile") || !variants.includes("standalone")) {
  fail("fixture-count");
}

const scratch = mkdtempSync(join(tmpdir(), "keel-spike-device-"));
const list = join(scratch, "files.txt");
writeFileSync(list, `${files.join("\n")}\n`);
const cache = new Map();

function nodeHashes(locale) {
  const cached = cache.get(locale);
  if (cached) return cached;
  const envLocale = locale.startsWith("haw") ? "haw_US.UTF-8" : "en_US.UTF-8";
  const run = spawnSync("node", ["spike/ios-core/parity-node.mjs", root, list], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, LC_ALL: envLocale, KEEL_DATA_DIR: process.env.KEEL_DATA_DIR },
  });
  if (run.status !== 0) fail("node");
  const map = new Map();
  for (const line of run.stdout.split("\n")) {
    if (!line.startsWith("{")) continue;
    const payload = JSON.parse(line);
    map.set(payload.file, createHash("sha256").update(line, "utf8").digest("hex"));
  }
  cache.set(locale, map);
  return map;
}

let mismatches = 0;
for (const record of records) {
  const expected = nodeHashes(record.locale).get(record.file);
  if (expected !== record.sha256) mismatches += 1;
}
process.stdout.write(`device-compare mismatches=${mismatches}\n`);
if (mismatches !== 0) fail("hash");
process.stdout.write("device-compare bytes=match\n");
