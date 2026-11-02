import Ajv from "ajv/dist/2020";
import { expect, test } from "vitest";
import { parse } from "yaml";
import schema from "../../../../schemas/mln-terms/0.1.json" with { type: "json" };
import { loadTerms } from "./load.ts";
import { termsManifest, textOf } from "./fixtures.ts";

const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile(schema);

function errorsOf(data: unknown): string[] {
  validate(data);
  return (validate.errors ?? []).filter((error) => error.keyword !== "if").map((error) => error.keyword);
}

function minimalDocument(): Record<string, unknown> {
  return parse(textOf("valid", "minimal.yaml")) as Record<string, unknown>;
}

function withFile(file: string): Record<string, unknown> {
  const data = structuredClone(minimalDocument());
  const sources = data.sources as Record<string, { file: string }>;
  const supplement = sources.supplement;
  if (!supplement) throw new Error("missing source");
  supplement.file = file;
  return data;
}

test("the schema rejects nested unknown keys, bad companions, and non-portable paths", () => {
  const valid = minimalDocument();
  expect(validate(valid)).toBe(true);

  const nested = structuredClone(valid) as { call: Record<string, unknown> };
  nested.call.levle = 1;
  expect(errorsOf(nested)).toEqual(["additionalProperties"]);

  const unknownValue = structuredClone(valid) as {
    underlyings: { performance_rounding: Record<string, unknown> };
  };
  unknownValue.underlyings.performance_rounding = { value: "half-up-4dp", status: "unknown" };
  expect(errorsOf(unknownValue)).toContain("type");

  const unknownNull = structuredClone(valid) as {
    underlyings: { performance_rounding: Record<string, unknown> };
  };
  unknownNull.underlyings.performance_rounding = { value: null, status: "unknown" };
  expect(validate(unknownNull)).toBe(true);

  const estimate = structuredClone(valid) as { barrier: { level: Record<string, unknown> } };
  estimate.barrier.level = { value: 6000, status: "estimate" };
  expect(errorsOf(estimate)).toContain("required");

  const estimateOk = structuredClone(valid) as { barrier: { level: Record<string, unknown> } };
  estimateOk.barrier.level = { value: 6000, status: "estimate", rule: "Named barrier fraction." };
  expect(validate(estimateOk)).toBe(true);

  for (const file of ["..", "foo/../bar", "foo/./bar", "/tmp/x", "C:/x", "//server/share", "foo\\bar", "foo/.."]) {
    expect(errorsOf(withFile(file)), file).toContain("pattern");
  }
  expect(validate(withFile("sources/supplement.pdf"))).toBe(true);
  expect(validate(withFile("a..b/c.pdf"))).toBe(true);
});

test("the loader reports source paths and referential failures", () => {
  const referential = new Set(["source-path", "source-missing", "source-kind", "invalid-date", "schedule-order"]);
  const rows = termsManifest.invalid.filter((row) => referential.has(row.code));
  expect(rows.length).toBeGreaterThanOrEqual(9);
  for (const row of rows) {
    const result = loadTerms(textOf("invalid", row.file), row.file);
    expect(result.ok, row.file).toBe(false);
    if (!result.ok) {
      expect(result.errors, row.file).toEqual([
        expect.objectContaining({ code: row.code, path: row.path, line: row.line, column: row.column }),
      ]);
    }
  }
});
