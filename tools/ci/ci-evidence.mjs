import { spawnSync } from "node:child_process";
import { assessFailure, assessSuccess } from "./evidence.mjs";

function argument(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function jobsFor(runId) {
  const result = spawnSync("gh", ["run", "view", runId, "--json", "jobs"], { encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stderr ?? "");
    process.exit(result.status ?? 1);
  }
  const parsed = JSON.parse(result.stdout);
  if (!parsed || !Array.isArray(parsed.jobs)) {
    console.error("ci-evidence: jobs missing");
    process.exit(1);
  }
  return parsed.jobs;
}

const successRun = argument("--success-run");
const failureRun = argument("--failure-run");
if (!successRun || !failureRun) {
  console.error("usage: pnpm test:ci-evidence -- --success-run <id> --failure-run <id>");
  process.exit(2);
}

const successErrors = assessSuccess(jobsFor(successRun));
const failureErrors = assessFailure(jobsFor(failureRun));
if (successErrors.length > 0 || failureErrors.length > 0) {
  for (const error of successErrors) console.error(`success run: ${error}`);
  for (const error of failureErrors) console.error(`failure run: ${error}`);
  process.exit(1);
}
console.log("ci-evidence ok");
