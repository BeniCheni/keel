import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

const root = process.argv[2];
const list = process.argv[3];
const core = await import(join(root, "packages/core/src/index.ts"));
const files = readFileSync(list, "utf8").split("\n").filter((line) => line.length > 0);
const locale = new Intl.Collator().resolvedOptions().locale;
process.stdout.write(`KEEL_SPIKE v1 locale engine=node variant=core locale=${locale}\n`);
for (const file of files) {
  const text = readFileSync(isAbsolute(file) ? file : join(root, file), "utf8");
  let line;
  try {
    const result = core.loadTerms(text, file);
    const payload = { file, result };
    if (result.ok) payload.summary = core.verificationSummary(result.terms);
    line = JSON.stringify(payload);
  } catch {
    line = JSON.stringify({ file, error: "exception" });
  }
  process.stdout.write(`${line}\n`);
}
