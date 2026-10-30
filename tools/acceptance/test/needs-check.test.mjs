import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { assessFailure, assessSuccess } from "../../ci/evidence.mjs";
import { cellName, expectedCells } from "../../ci/matrix.mjs";
import { repoRoot, run } from "./helpers.mjs";

function needs(payload) {
  return run(process.execPath, ["tools/ci/needs-check.mjs", JSON.stringify(payload)]);
}

function jobs(conclusion, verifyConclusion = conclusion) {
  return [
    ...expectedCells().map((name, index) => ({
      name,
      conclusion: index === 0 && conclusion === "failure" ? "failure" : conclusion === "failure" ? "success" : conclusion,
    })),
    { name: "verify", conclusion: verifyConclusion },
  ];
}

test("needs-check rejects failure, cancelled, and skipped", () => {
  for (const result of ["failure", "cancelled", "skipped"]) {
    const runResult = needs({ cells: { result } });
    expect(runResult.status).not.toBe(0);
    expect(runResult.stderr).toContain(result);
  }
});

test("needs-check accepts only all-success and still checks later jobs", () => {
  expect(needs({ cells: { result: "success", outputs: {} } }).status).toBe(0);
  expect(needs({ cells: { result: "success" }, other: { result: "success" } }).status).toBe(0);
  const mixed = needs({ cells: { result: "success" }, other: { result: "failure" } });
  expect(mixed.status).not.toBe(0);
  expect(mixed.stderr).toContain("other");
});

test("needs-check rejects invalid input", () => {
  expect(run(process.execPath, ["tools/ci/needs-check.mjs", "not-json"]).status).not.toBe(0);
  expect(run(process.execPath, ["tools/ci/needs-check.mjs"], { env: { ...process.env, NEEDS: "" } }).status).not.toBe(0);
});

test("evidence accepts a green matrix and a single red cell", () => {
  expect(assessSuccess(jobs("success"))).toEqual([]);
  expect(assessFailure(jobs("failure", "failure"))).toEqual([]);
  expect(assessSuccess(jobs("failure", "failure")).length).toBeGreaterThan(0);
  expect(assessFailure(jobs("success", "success")).length).toBeGreaterThan(0);
  const twoFailures = jobs("failure", "failure").map((job) =>
    job.name === cellName("macos-latest", "26") ? { ...job, conclusion: "failure" } : job,
  );
  expect(assessFailure(twoFailures).length).toBeGreaterThan(0);
  const skipped = jobs("success").map((job) =>
    job.name === cellName("ubuntu-latest", "24") ? { ...job, conclusion: "skipped" } : job,
  );
  expect(assessSuccess(skipped).length).toBeGreaterThan(0);
});

test("the workflow names verify, checks needs, and confines Linux", () => {
  const workflow = readFileSync(`${repoRoot}/.github/workflows/verify.yml`, "utf8");
  const netns = readFileSync(`${repoRoot}/tools/ci/verify-netns.sh`, "utf8");
  expect(workflow).toContain("fetch-depth: 0");
  expect(workflow).toContain("contents: read");
  expect(workflow).toContain("if: always()");
  expect(workflow).toContain("tools/ci/needs-check.mjs");
  expect(workflow).toContain("name: verify");
  expect(workflow).toContain("fail-fast: false");
  expect(workflow).toContain("bash tools/ci/verify-netns.sh");
  expect(netns).toContain("unshare");
  expect(netns).toContain("--net");
  expect(workflow).toContain("ubuntu-latest");
  expect(workflow).toContain("macos-latest");
  for (const node of ["24", "26"]) expect(workflow).toContain(node);
  expect(workflow).toContain("cell (${{ matrix.os }}, node ${{ matrix.node }})");
});
