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

test("the terms manifest is generator version 2 with the same seed", () => {
  expect(termsManifest.version).toBe(2);
  expect(termsManifest.seed).toBe("keel-s01-terms-1");
});

test("minimal.yaml moved to 0.2 loads to the same terms apart from schema", () => {
  const minimal = loadTerms(textOf("valid", "minimal.yaml"), "minimal.yaml");
  const moved = loadTerms(
    textOf("valid", "minimal.yaml").replace("schema: mln-terms/0.1\n", "schema: mln-terms/0.2\n"),
    "minimal.yaml",
  );
  expect(minimal.ok).toBe(true);
  expect(moved.ok).toBe(true);
  if (!minimal.ok || !moved.ok) return;
  expect(minimal.terms.schema).toBe("mln-terms/0.1");
  expect(moved.terms.schema).toBe("mln-terms/0.2");
  const { schema: schema01, ...rest01 } = minimal.terms;
  const { schema: schema02, ...rest02 } = moved.terms;
  expect(schema01).toBe("mln-terms/0.1");
  expect(schema02).toBe("mln-terms/0.2");
  expect(rest01).toEqual(rest02);
});
