import { steps } from "./steps.mjs";

const stub = process.env.KEEL_VERIFY_STUB === "1";
const fail = new Set(
  (process.env.KEEL_VERIFY_FAIL ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean),
);

const failed = [];
for (const step of steps) {
  let status = 0;
  if (fail.has(step.name)) status = 1;
  else if (!stub) status = step.run();
  console.log(`verify:${step.name} ${status === 0 ? "ok" : "fail"}`);
  if (status !== 0) failed.push(step.name);
}

if (failed.length > 0) {
  console.error(`verify failed: ${failed.join(" ")}`);
  process.exit(1);
}
console.log("verify ok");
