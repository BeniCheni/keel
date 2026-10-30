import { test } from "vitest";

test("one linux node 24 cell fails", () => {
  const linux = process.env.RUNNER_OS === "Linux";
  const node24 = process.versions.node.startsWith("24.");
  if (linux && node24) throw new Error("probe cell");
});
