import { parseOptions, statusOf } from "./options.mjs";
import { steps } from "./steps.mjs";

const options = parseOptions(process.argv.slice(2));
const name = options.rest[0];
const step = steps.find((item) => item.name === name);
if (!step) {
  console.error(`unknown verify step: ${name ?? ""}`);
  process.exit(2);
}
if (options.stub) console.error("verify: stub run, no step executed");
process.exit(statusOf(step, options));
