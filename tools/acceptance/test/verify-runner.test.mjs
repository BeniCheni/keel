import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { steps } from "../../verify/steps.mjs";
import { repoRoot, run } from "./helpers.mjs";

const names = ["typecheck", "tests", "tooling", "tripwire", "network", "determinism", "copy", "boundaries"];

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
    const result = run(process.execPath, ["tools/verify/run.mjs"], {
      env: { ...process.env, KEEL_VERIFY_STUB: "1", KEEL_VERIFY_FAIL: name },
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`verify failed: ${name}`);
    expect(result.stdout).toContain("verify:boundaries ");
    expect(result.stdout).toContain(`verify:${name} fail`);
  }
});

test("two failed steps are both named", () => {
  const result = run(process.execPath, ["tools/verify/run.mjs"], {
    env: { ...process.env, KEEL_VERIFY_STUB: "1", KEEL_VERIFY_FAIL: "typecheck,boundaries" },
  });
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("verify failed: typecheck boundaries");
  expect(result.stdout).toContain("verify:tests ok");
  expect(result.stdout).toContain("verify:boundaries fail");
});

test("a stub run with no injected failure exits 0", () => {
  const result = run(process.execPath, ["tools/verify/run.mjs"], {
    env: { ...process.env, KEEL_VERIFY_STUB: "1" },
  });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("verify ok");
});
