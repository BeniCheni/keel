import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { inlineHits } from "../inline-check.mjs";
import { NESTED_RUN_TIMEOUT_MS, repoRoot, run } from "../../acceptance/test/helpers.mjs";

function rootWith(rel, body) {
  const root = mkdtempSync(join(tmpdir(), "keel-inline-"));
  mkdirSync(join(root, rel, ".."), { recursive: true });
  writeFileSync(join(root, rel), body);
  return root;
}

test("a string literal in Text fails outside Copy.swift", () => {
  const hit = inlineHits(rootWith("apps/ios/Keel/RootView.swift", "Text(\"hello\")\n"));
  expect(hit.length).toBe(1);
  const spared = inlineHits(rootWith("apps/ios/Keel/Copy.swift", "Text(\"hello\")\n"));
  expect(spared.length).toBe(0);
  const variable = inlineHits(rootWith("apps/ios/Keel/RootView.swift", "Text(row.text)\n"));
  expect(variable.length).toBe(0);
}, NESTED_RUN_TIMEOUT_MS);

test("the repo inline-string check passes", () => {
  const result = run(process.execPath, ["tools/ios/inline-check.mjs", repoRoot]);
  expect(result.status).toBe(0);
}, NESTED_RUN_TIMEOUT_MS);
