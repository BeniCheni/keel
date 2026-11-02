import { expect, test } from "vitest";
import { loadTerms } from "./load.ts";
import { termsManifest, textOf, textsIn } from "./fixtures.ts";

test("discovered valid fixtures match the manifest", () => {
  const names = [...textsIn("valid").keys()].sort();
  expect(names.length).toBeGreaterThanOrEqual(2);
  expect(names).toEqual([...termsManifest.valid].sort());
  for (const name of termsManifest.valid) {
    const result = loadTerms(textOf("valid", name), name);
    expect(result.ok, name).toBe(true);
    if (result.ok) expect(result.warnings, name).toEqual([]);
  }
});
