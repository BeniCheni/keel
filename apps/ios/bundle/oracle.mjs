import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.argv[2];
const inputsPath = process.argv[3];
const core = await import(pathToFileURL(join(root, "packages/core/src/index.ts")).href);
const inputs = JSON.parse(readFileSync(inputsPath, "utf8"));
const locale = new Intl.Collator().resolvedOptions().locale;
process.stdout.write(`KEEL v1 locale=${locale}\n`);
for (const input of inputs) {
  let line;
  try {
    const result = core.loadTerms(input.text, input.file);
    const payload = { file: input.file, result, summary: null, schedule: null };
    if (result.ok) {
      payload.summary = core.verificationSummary(result.terms);
      payload.schedule = core.observationSchedule(result.terms, core.nyseRulesCalendar());
    }
    line = JSON.stringify(payload);
  } catch {
    line = JSON.stringify({ file: input.file, error: "exception" });
  }
  process.stdout.write(`${line}\n`);
}
