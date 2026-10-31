import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { steps } from "../../verify/steps.mjs";
import { repoRoot, run } from "./helpers.mjs";

const names = ["typecheck", "tests", "tooling", "tripwire", "network", "determinism", "copy", "boundaries"];

function runner(args, env = process.env) {
  return run(process.execPath, ["tools/verify/run.mjs", ...args], { env });
}

function one(args) {
  return run(process.execPath, ["tools/verify/one.mjs", ...args]);
}

test("production steps stay in verify order", () => {
  expect(steps.map((step) => step.name)).toEqual(names);
  const scripts = JSON.parse(readFileSync(`${repoRoot}/package.json`, "utf8")).scripts;
  for (const name of names) {
    expect(scripts[`verify:${name}`]).toBe(`node tools/verify/one.mjs ${name}`);
  }
  expect(scripts.verify).toBe("node tools/verify/run.mjs");
});

test("each failed step is named and later steps still run", () => {
  for (const name of names) {
    const result = runner(["--stub", "--fail", name]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`verify failed: ${name}`);
    expect(result.stdout).toContain("verify:boundaries ");
    expect(result.stdout).toContain(`verify:${name} fail`);
  }
});

test("two failed steps are both named", () => {
  const result = runner(["--stub", "--fail", "typecheck,boundaries"]);
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("verify failed: typecheck boundaries");
  expect(result.stdout).toContain("verify:tests ok");
  expect(result.stdout).toContain("verify:boundaries fail");
});

test("a stub run with no injected failure exits 0 and says it is a stub", () => {
  const result = runner(["--stub"]);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("verify ok");
  expect(result.stderr).toContain("stub run, no step executed");
});

test("the environment cannot stub a verify run or inject a failure", () => {
  const env = { ...process.env, KEEL_VERIFY_STUB: "1", KEEL_VERIFY_FAIL: "typecheck,boundaries" };
  const result = runner(["--stub"], env);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("verify ok");
  expect(result.stdout).not.toContain(" fail");
  for (const file of ["run.mjs", "one.mjs", "options.mjs", "steps.mjs"]) {
    expect(readFileSync(`${repoRoot}/tools/verify/${file}`, "utf8")).not.toContain("process.env");
  }
});

test("verify:<step> runs one step and passes its status through", () => {
  const unknown = one(["nonsense"]);
  expect(unknown.status).toBe(2);
  expect(unknown.stderr).toContain("unknown verify step");
  expect(one(["copy", "--stub", "--fail", "copy"]).status).toBe(1);
  expect(one(["copy", "--stub"]).status).toBe(0);
  expect(one(["copy"]).status).toBe(0);
});
