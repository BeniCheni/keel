import { spawnSync } from "node:child_process";
import { generators } from "./registry.mjs";

export function treesOf(list) {
  const trees = [];
  for (const generator of list) {
    for (const tree of generator.trees) trees.push(tree);
  }
  if (trees.length === 0) return ["fixtures"];
  return trees;
}

/** Match command-substitution stripping: drop trailing newlines, keep a blank record. */
export function splitTrees(stdout) {
  const stripped = String(stdout ?? "").replace(/\n+$/, "");
  if (stripped === "") return [""];
  return stripped.split("\n");
}

export function check(cwd, trees) {
  let dirty = "";
  for (const tree of trees) {
    const result = spawnSync(
      "git",
      ["status", "--porcelain", "--untracked-files=all", "--", tree],
      { cwd, encoding: "utf8" },
    );
    if (result.error || result.status === null) return { status: 127, stdout: "" };
    if (result.status !== 0) return { status: result.status, stdout: result.stdout ?? "" };
    dirty += result.stdout ?? "";
  }
  if (dirty.length > 0) return { status: 1, stdout: dirty };
  return { status: 0, stdout: "" };
}

export function verifyRegistered(cwd, list) {
  for (const generator of list) generator.regen(cwd);
  return check(cwd, treesOf(list));
}

export function verifyDeterminism(cwd) {
  const regen = spawnSync("pnpm", ["fixtures:regen"], { cwd, encoding: "utf8" });
  if (regen.error || regen.status === null) return { status: 127, stdout: "" };
  if (regen.status !== 0) return { status: regen.status, stdout: regen.stdout ?? "" };
  const treesRun = spawnSync("pnpm", ["-s", "fixtures:trees"], { cwd, encoding: "utf8" });
  if (treesRun.error || treesRun.status === null) return { status: 127, stdout: "" };
  if (treesRun.status !== 0) return { status: treesRun.status, stdout: treesRun.stdout ?? "" };
  return check(cwd, splitTrees(treesRun.stdout ?? ""));
}

export function productionTrees() {
  return treesOf(generators);
}
