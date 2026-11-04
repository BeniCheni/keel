import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2];
const out = process.argv[3];
const minimal = readFileSync(join(root, "fixtures/synthetic/terms/valid/minimal.yaml"), "utf8");
const emoji = "\u{1F600}";
const flow = `[${"[".repeat(1999)}0${"]".repeat(1999)}]`;
let block = "v: 1\n";
for (let depth = 0; depth < 1000; depth += 1) {
  block = `k${depth}:\n${block.replace(/^/gm, "  ")}`;
}
const cases = [
  ["complex-key", `${minimal}\n? [a, b]\n`],
  ["alias-key", `${minimal}\n*nope : 1\n`],
  ["leading-bom", `\uFEFF${minimal}`],
  ["crlf", minimal.replace(/\n/g, "\r\n")],
  [
    "non-bmp",
    minimal.replace('issuer:\n  value: "Example Bank SA"\n', `issuer:\n  value: "${emoji}"\n  extra: [\n`),
  ],
  ["year-zero", minimal.replace("value: 2031-03-03\n", "value: 0000-02-29\n")],
  ["flow-2000", minimal.replace('issuer:\n  value: "Example Bank SA"\n', `issuer:\n  value: ${flow}\n`)],
  ["block-1000", `${minimal}\n${block}`],
];
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "names.txt"), `${cases.map(([name]) => name).join("\n")}\n`);
for (const [name, text] of cases) writeFileSync(join(out, name), text);
process.stdout.write(`edges=${cases.length}\n`);
