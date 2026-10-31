import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { probeNames, runProbe, runProbes } from "../../network/run.mjs";
import { repoRoot, run } from "./helpers.mjs";

for (const name of probeNames) {
  test(`child probe for ${name} exits nonzero`, () => {
    const result = runProbe(name);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`network blocked: ${name}`);
  });
}

test("an unknown probe name exits 2", () => {
  expect(runProbe("nonsense").status).toBe(2);
});

test("runProbes reports a probe that exits 0, hangs, or dies for another reason", () => {
  const fake = (name) =>
    ({
      fetch: { status: 0, stderr: "" },
      "http.get": { status: null, stderr: "" },
      "net.connect": { status: 2, stderr: "unknown network probe" },
      "http.request": { status: 1, stderr: "ReferenceError: probe failed" },
      "tls.connect": { status: 1, stderr: "Error: network blocked: tls.connect" },
    })[name];
  expect(runProbes(["fetch", "http.get", "net.connect", "http.request", "tls.connect"], fake)).toEqual([
    "fetch", "http.get", "net.connect", "http.request",
  ]);
  expect(runProbes()).toEqual([]);
});

test("vitest setup blocks fetch and dns", () => {
  const file = join(repoRoot, "tools/acceptance/test/zz-guard.test.mjs");
  writeFileSync(
    file,
    [
      'import dns from "node:dns";',
      'import http from "node:http";',
      'import net from "node:net";',
      'import { expect, test } from "vitest";',
      'test("setup blocks fetch and dns", () => {',
      '  expect(() => globalThis.fetch("http://127.0.0.1:9/")).toThrow(/network blocked: fetch/);',
      '  expect(() => dns.lookup("localhost", () => {})).toThrow(/network blocked: dns.lookup/);',
      '  expect(() => http.get("http://127.0.0.1:9/")).toThrow(/network blocked: http.get/);',
      '  expect(() => new net.Socket().connect(9, "127.0.0.1")).toThrow(/network blocked: net.Socket.prototype.connect/);',
      "});",
      "",
    ].join("\n"),
  );
  try {
    const result = run("pnpm", ["exec", "vitest", "run", "--config", "tools/vitest.config.mjs", file]);
    expect(result.status).toBe(0);
  } finally {
    rmSync(file, { force: true });
  }
});
