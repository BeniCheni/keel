import { parseOptions, statusOf } from "./options.mjs";
import { steps } from "./steps.mjs";

const options = parseOptions(process.argv.slice(2));
if (options.stub) console.error("verify: stub run, no step executed");

const failed = [];
for (const step of steps) {
  const status = statusOf(step, options);
  console.log(`verify:${step.name} ${status === 0 ? "ok" : "fail"}`);
  if (status !== 0) failed.push(step.name);
}

if (failed.length > 0) {
  console.error(`verify failed: ${failed.join(" ")}`);
  process.exit(1);
}
console.log("verify ok");
