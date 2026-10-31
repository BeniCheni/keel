import { expectedCells } from "./matrix.mjs";

export function assessSuccess(jobs) {
  const errors = [];
  const cells = expectedCells();
  for (const name of cells) {
    const job = jobs.find((item) => item.name === name);
    if (!job) errors.push(`missing ${name}`);
    else if (job.conclusion !== "success") errors.push(`${name} is ${job.conclusion}`);
  }
  const verify = jobs.filter((item) => item.name === "verify");
  if (verify.length !== 1) errors.push(`verify count ${verify.length}`);
  else if (verify[0].conclusion !== "success") errors.push(`verify is ${verify[0].conclusion}`);
  return errors;
}

export function assessFailure(jobs) {
  const errors = [];
  const cells = expectedCells().map((name) => jobs.find((item) => item.name === name));
  if (cells.some((job) => !job)) errors.push("missing cell");
  const failed = cells.filter((job) => job && job.conclusion === "failure");
  if (failed.length !== 1) errors.push(`failed cell count ${failed.length}`);
  const rest = cells.filter((job) => job && job.conclusion !== "failure");
  if (rest.some((job) => job.conclusion !== "success")) errors.push("another cell was not success");
  const verify = jobs.filter((item) => item.name === "verify");
  if (verify.length !== 1 || verify[0].conclusion !== "failure") errors.push("verify did not fail");
  return errors;
}
