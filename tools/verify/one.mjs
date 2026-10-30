import { steps } from "./steps.mjs";

const name = process.argv[2];
const step = steps.find((item) => item.name === name);
if (!step) {
  console.error(`unknown verify step: ${name ?? ""}`);
  process.exit(2);
}
process.exit(step.run());
