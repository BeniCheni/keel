import Ajv from "ajv/dist/2020.js";
import { expect, test } from "vitest";
import { parse } from "yaml";
import schema from "../../../../schemas/mln-terms/0.1.json" with { type: "json" };
import schemaV02 from "../../../../schemas/mln-terms/0.2.json" with { type: "json" };
import { loadTerms } from "./load.ts";
import { termsManifest, textOf } from "./fixtures.ts";

const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile(schema);
const validate02 = ajv.compile(schemaV02);

declare const crypto: {
  subtle: {
    digest(algorithm: "SHA-256", data: Uint8Array): Promise<ArrayBuffer>;
  };
};

declare const TextEncoder: new () => { encode(text: string): Uint8Array };

/** SHA-256 of the text as UTF-8, which is what shasum prints for the file. */
async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

const SCHEMA_01_SHA256 = "411d100f2dc971e2d8c5f2bd553dfc95292196f41d6c0f9301f5a9cb6a21de78";

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

test("a source name that is also an Object.prototype property is missing, not mismatched", () => {
  const text = textOf("valid", "minimal.yaml").replace("  source: supplement\ndates:", "  source: constructor\ndates:");
  const result = loadTerms(text, "minimal.yaml");
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.errors).toEqual([
      expect.objectContaining({ code: "source-missing", path: "issuer.source", line: 8, column: 11 }),
    ]);
  }
});

test("0.1.json stays byte-identical to origin/main", async () => {
  const files = import.meta.glob("../../../../schemas/mln-terms/0.1.json", {
    query: "?raw",
    import: "default",
    eager: true,
  });
  const text = Object.values(files)[0];
  if (text === undefined) throw new Error("missing 0.1.json");
  expect(await sha256Hex(text)).toBe(SCHEMA_01_SHA256);
});

test("the digest reads a character outside ASCII as its UTF-8 bytes", async () => {
  // U+016D and "m" share their low eight bits. `printf '\xc5\xad' | shasum -a 256` prints this digest.
  expect(await sha256Hex("\u016d")).toBe("6f4eb234cc3cf3c870ea1f69ffcc13182f1029e91dfe7db99ba38dcc6e8b451a");
  expect(await sha256Hex("\u016dln-terms/0.1")).not.toBe(await sha256Hex("mln-terms/0.1"));
});

test("schema 0.2 names mln-terms/0.2 and copies the first call observation shape", () => {
  expect(schemaV02.$id).toBe("mln-terms/0.2");
  expect(schemaV02.title).toBe("mln-terms/0.2");
  expect(schemaV02.properties.schema.const).toBe("mln-terms/0.2");
  expect(schemaV02.$defs.dates.properties.final_valuation).toEqual(
    schemaV02.$defs.dates.properties.first_call_observation,
  );
  expect(schemaV02.$defs.dates.required).not.toContain("final_valuation");
});

test("schema 0.2 accepts final valuation in each status shape, as a conflict, and when absent", () => {
  const absent = structuredClone(minimalDocument());
  absent.schema = "mln-terms/0.2";
  expect(validate02(absent)).toBe(true);

  const shapes: Array<Record<string, unknown>> = [
    { value: "2031-07-09", status: "primary", source: "supplement" },
    { value: "2031-07-09", status: "document", source: "supplement" },
    { value: "2031-07-09", status: "advisor", source: "supplement" },
    { value: "2031-07-09", status: "user" },
    { value: "2031-07-09", status: "estimate", rule: "Named barrier fraction." },
    { value: "2031-07-09", status: "assumed", note: "Recorded accrual default." },
    { value: null, status: "unknown" },
    {
      status: "conflict",
      candidates: [
        { value: "2031-07-09", status: "primary", source: "supplement" },
        { value: "2031-07-10", status: "primary", source: "supplement" },
      ],
    },
  ];
  for (const shape of shapes) {
    const data = structuredClone(minimalDocument());
    data.schema = "mln-terms/0.2";
    (data.dates as Record<string, unknown>).final_valuation = shape;
    expect(validate02(data), JSON.stringify(shape)).toBe(true);
    expect(validate(data), JSON.stringify(shape)).toBe(false);
    expect(errorsOf(data), JSON.stringify(shape)).toContain("additionalProperties");
  }
});

const EXTRA_SOURCES = `  doc-src:
    kind: document
    file: sources/doc-src.pdf
  adv-src:
    kind: advisor
    file: sources/adv-src.pdf
`;

test("the loader accepts final valuation in each status shape and as a conflict", () => {
  const shapes: Array<{ body: string; term: Record<string, unknown> }> = [
    {
      body: "    value: 2031-07-09\n    status: primary\n    source: supplement\n",
      term: { value: "2031-07-09", status: "primary", source: "supplement" },
    },
    {
      body: "    value: 2031-07-09\n    status: document\n    source: doc-src\n",
      term: { value: "2031-07-09", status: "document", source: "doc-src" },
    },
    {
      body: "    value: 2031-07-09\n    status: advisor\n    source: adv-src\n",
      term: { value: "2031-07-09", status: "advisor", source: "adv-src" },
    },
    {
      body: "    value: 2031-07-09\n    status: user\n",
      term: { value: "2031-07-09", status: "user" },
    },
    {
      body: '    value: 2031-07-09\n    status: estimate\n    rule: "Named barrier fraction."\n',
      term: { value: "2031-07-09", status: "estimate", rule: "Named barrier fraction." },
    },
    {
      body: '    value: 2031-07-09\n    status: assumed\n    note: "Recorded accrual default."\n',
      term: { value: "2031-07-09", status: "assumed", note: "Recorded accrual default." },
    },
    {
      body: "    value: null\n    status: unknown\n",
      term: { value: null, status: "unknown" },
    },
    {
      body: "    status: conflict\n    candidates:\n      - value: 2031-07-09\n        status: primary\n        source: supplement\n      - value: 2031-07-10\n        status: primary\n        source: supplement\n",
      term: {
        status: "conflict",
        candidates: [
          { value: "2031-07-09", status: "primary", source: "supplement" },
          { value: "2031-07-10", status: "primary", source: "supplement" },
        ],
      },
    },
  ];
  for (const shape of shapes) {
    const text = textOf("valid", "minimal.yaml")
      .replace("schema: mln-terms/0.1\n", "schema: mln-terms/0.2\n")
      .replace("underlyings:\n", `  final_valuation:\n${shape.body}underlyings:\n`)
      .replace(
        "  supplement:\n    kind: primary\n    file: sources/supplement.pdf\n",
        `  supplement:\n    kind: primary\n    file: sources/supplement.pdf\n${EXTRA_SOURCES}`,
      );
    const loaded = loadTerms(text, "minimal.yaml");
    expect(loaded.ok, shape.body).toBe(true);
    if (loaded.ok) expect(loaded.terms.dates.final_valuation, shape.body).toEqual(shape.term);
  }
});

test("a conflict with no candidates key is conflict-candidates at the term", () => {
  const text = textOf("valid", "minimal.yaml").replace(
    "  maturity:\n    value: 2031-03-03\n    status: primary\n    source: supplement\n",
    "  maturity:\n    status: conflict\n",
  );
  const result = loadTerms(text, "minimal.yaml");
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.errors).toEqual([
      expect.objectContaining({ code: "conflict-candidates", path: "dates.maturity.candidates", line: 18, column: 3 }),
    ]);
  }
});
