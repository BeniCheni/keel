import { expect, test } from "vitest";
import { assertSafeFixtureValues } from "../../generators/terms/generate.mjs";

test("a nine-digit cent value is rejected", () => {
  const nine = `1${"0".repeat(8)}`;
  expect(() => assertSafeFixtureValues([{ label: "cents", value: nine }])).toThrow(/9 integer digits/);
  expect(() => assertSafeFixtureValues([{ label: "cents", value: "99999999" }])).not.toThrow();
  expect(() =>
    assertSafeFixtureValues([{ label: "magnitude", value: "99999999999999999", allowUnsafeMagnitude: true }]),
  ).not.toThrow();
  const decimal = `1${"0".repeat(8)}.5`;
  expect(() => assertSafeFixtureValues([{ label: "price", value: decimal }])).toThrow(/9 integer digits/);
});
