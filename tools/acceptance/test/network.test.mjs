import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { probeNames, runProbe } from "../../network/run.mjs";
import { repoRoot, run } from "./helpers.mjs";

for (const name of probeNames) {
  test(`child probe for ${name} exits nonzero`, () => {
    const result = runProbe(name);
    expect(result.status).not.toBe(0);
    expect(result.status).not.toBe(null);
  });
}

test("vitest setup blocks fetch and dns", () => {
  const file = join(repoRoot, "tools/acceptance/test/zz-guard.test.mjs");
  writeFileSync(
    file,
    [
      'import dns from "node:dns";',
      'import { expect, test } from "vitest";',
      'test("setup blocks fetch and dns", () => {',
      '  expect(() => globalThis.fetch("http://127.0.0.1:9/")).toThrow(/network blocked: fetch/);',
      '  expect(() => dns.lookup("localhost", () => {})).toThrow(/network blocked: dns.lookup/);',
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
