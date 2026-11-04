import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const seed = "keel-s90-standin-1";
const root = process.argv[2] ? process.argv[2] : join(import.meta.dirname, "../..");

function hashSeed(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seedValue) {
  let state = seedValue >>> 0;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

const files = execFileSync("git", ["ls-files", "fixtures/synthetic/terms"], { cwd: root, encoding: "utf8" })
  .split("\n")
  .filter((file) => file.endsWith(".yaml"))
  .sort();
const valid = files.filter((file) => file.includes("/valid/"));
const invalid = files.filter((file) => file.includes("/invalid/"));
const rng = mulberry32(hashSeed(seed));
const validPick = valid[Math.floor(rng() * valid.length)];
const invalidPick = invalid[Math.floor(rng() * invalid.length)];
const validBytes = readFileSync(join(root, validPick));
const invalidBytes = readFileSync(join(root, invalidPick));
const dir = join(root, "spike/ios-core/standin");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "export.yaml"), validBytes);
writeFileSync(join(dir, "malformed.yaml"), invalidBytes);
const manifest = {
  seed,
  valid: validPick,
  invalid: invalidPick,
  exportSha256: createHash("sha256").update(validBytes).digest("hex"),
  malformedSha256: createHash("sha256").update(invalidBytes).digest("hex"),
};
writeFileSync(join(dir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(manifest)}\n`);
