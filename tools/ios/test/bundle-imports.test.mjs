import { expect, test } from "vitest";
import { bundleImportHits } from "../bundle-imports.mjs";
import { NESTED_RUN_TIMEOUT_MS, repoRoot, run } from "../../acceptance/test/helpers.mjs";

test("the bundle import check passes, then fails each planted entry", async () => {
  const clean = await bundleImportHits(repoRoot);
  expect(clean.ok).toBe(true);
  expect(clean.hits).toEqual([]);
  const plants = [
    { planted: 'import "fs";', rule: "external" },
    { planted: 'import "node:fs";', rule: "external" },
    { planted: 'import "../../plugin-mln/src/index.ts";', rule: "input" },
  ];
  for (const plant of plants) {
    const result = await bundleImportHits(repoRoot, { planted: plant.planted });
    expect(result.ok).toBe(true);
    expect(result.hits.some((hit) => hit.rule === plant.rule)).toBe(true);
  }
  expect(run(process.execPath, ["tools/ios/bundle-imports.mjs", repoRoot]).status).toBe(0);
}, NESTED_RUN_TIMEOUT_MS);
