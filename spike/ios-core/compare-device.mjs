import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { TIE_FILE } from "./tie.mjs";

const root = process.argv[2];
const logPath = process.argv[3];
const log = readFileSync(logPath, "utf8");
const records = [];
let hawSeen = false;
let errorLines = 0;
for (const line of log.split("\n")) {
  if (!line.startsWith("KEEL_SPIKE v1 ")) continue;
  if (line.startsWith("KEEL_SPIKE v1 error ")) errorLines += 1;
  const locale = line.match(/(?:^|\s)locale=(\S+)/);
  if (locale && locale[1].startsWith("haw")) hawSeen = true;
  if (!line.startsWith("KEEL_SPIKE v1 parity ")) continue;
  const fields = {};
  for (const part of line.split(" ").slice(3)) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    fields[part.slice(0, index)] = part.slice(index + 1);
  }
  if (!fields.variant || !fields.locale || !fields.file || !fields.sha256 || !fields.comparator) continue;
  records.push(fields);
}

const locales = [...new Set(records.map((record) => record.locale))].sort();
const variants = [...new Set(records.map((record) => record.variant))].sort();
const comparators = [...new Set(records.map((record) => record.comparator))].sort();
const files = [...new Set(records.map((record) => record.file))].sort();
const fixtures = files.filter((file) => file.startsWith("fixtures/"));
process.stdout.write(
  `device-compare records=${records.length} locales=${locales.join(",") || "none"} variants=${variants.join(",") || "none"} comparators=${comparators.join(",") || "none"} files=${files.length} fixtures=${fixtures.length} haw-seen=${hawSeen ? "yes" : "no"}\n`,
);

function fail(reason) {
  process.stdout.write(`reason=${reason}\n`);
  process.exit(1);
}

const listed = spawnSync("git", ["ls-files", "fixtures/synthetic/terms"], { cwd: root, encoding: "utf8" });
if (listed.status !== 0) fail("setup");
const expectedFiles = [
  ...listed.stdout.split("\n").filter((file) => file.endsWith(".yaml")),
  TIE_FILE,
];

// The phone logs an error line and carries on when a session or an input fails, so any error line fails the comparison.
if (errorLines !== 0) {
  process.stdout.write(`device-compare errors=${errorLines}\n`);
  fail("error");
}

const gating = records.filter((record) => record.locale.startsWith("en") || record.locale.startsWith("sv"));
const gatingLocales = [...new Set(gating.map((record) => record.locale))];
if (!gatingLocales.some((locale) => locale.startsWith("en")) || !gatingLocales.some((locale) => locale.startsWith("sv"))) {
  fail("locale");
}
if (!comparators.includes("identity") || !comparators.includes("reversed")) fail("reversed");
if (fixtures.length !== 31 || !files.includes(TIE_FILE) || !variants.includes("compile") || !variants.includes("standalone")) {
  fail("fixture-count");
}
for (const variant of ["compile", "standalone"]) {
  for (const comparator of ["identity", "reversed"]) {
    const rows = gating.filter((record) => record.variant === variant && record.comparator === comparator);
    const rowLocales = new Set(rows.map((record) => record.locale));
    if (![...rowLocales].some((locale) => locale.startsWith("en")) || ![...rowLocales].some((locale) => locale.startsWith("sv"))) {
      fail(comparator === "reversed" ? "reversed" : "locale");
    }
    if (!rows.some((record) => record.file === TIE_FILE)) fail("fixture-count");
    // Every gating locale in this group holds every fixture and the tie input. A group with fewer is a skipped comparison.
    for (const locale of rowLocales) {
      const held = new Set(rows.filter((record) => record.locale === locale).map((record) => record.file));
      const missing = expectedFiles.filter((file) => !held.has(file));
      if (missing.length !== 0) {
        process.stdout.write(
          `device-compare missing variant=${variant} comparator=${comparator} locale=${locale} count=${missing.length}\n`,
        );
        fail("coverage");
      }
    }
  }
}

const scratch = mkdtempSync(join(tmpdir(), "keel-spike-device-"));
const list = join(scratch, "files.txt");
writeFileSync(list, `${files.join("\n")}\n`);
const cache = new Map();

function nodeLocale(locale) {
  if (locale.startsWith("sv")) return "sv_SE.UTF-8";
  if (locale.startsWith("haw")) return "haw_US.UTF-8";
  return "en_US.UTF-8";
}

function nodeHashes(locale) {
  const cached = cache.get(locale);
  if (cached) return cached;
  const run = spawnSync("node", ["spike/ios-core/parity-node.mjs", root, list], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, LC_ALL: nodeLocale(locale), KEEL_DATA_DIR: process.env.KEEL_DATA_DIR },
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
for (const record of gating) {
  const expected = nodeHashes(record.locale).get(record.file);
  if (expected !== record.sha256) mismatches += 1;
}
process.stdout.write(`device-compare mismatches=${mismatches}\n`);
if (mismatches !== 0) fail("hash");
process.stdout.write("device-compare bytes=match\n");
