import { runProbes } from "./run.mjs";

const missed = runProbes();
if (missed.length > 0) {
  console.error(`network guard missed: ${missed.join(" ")}`);
  process.exit(1);
}
