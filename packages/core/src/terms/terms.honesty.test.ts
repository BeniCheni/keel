import { expect, test } from "vitest";
import { loadTerms } from "./load.ts";
import { verificationSummary } from "./summary.ts";
import type { Terms } from "./types.ts";
import { textOf } from "./fixtures.ts";

const STATUSES = ["document", "advisor", "user", "estimate", "assumed", "unknown"];

function forceStatus(term: object, status: string): void {
  Object.assign(term, { status });
}

function leafInText(value: unknown, text: string): void {
  if (value === null || typeof value === "boolean") return;
  if (typeof value === "number") {
    expect(text).toMatch(new RegExp(`(?:^|[^0-9])${String(value)}(?:[^0-9]|$)`));
    return;
  }
  if (typeof value === "string") {
    expect(text).toContain(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) leafInText(item, text);
    return;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value)) leafInText(item, text);
  }
}

function withSchedule(text: string, entries: string): string {
  const anchor = `  first_call_observation:
    value: 2026-09-01
    status: primary
    source: supplement
`;
  return text.replace(anchor, `${anchor}  observation_schedule:\n${entries}`);
}

test("only a primary status verifies a payoff path", () => {
  const loaded = loadTerms(textOf("valid", "minimal.yaml"), "minimal.yaml");
  expect(loaded.ok).toBe(true);
  if (!loaded.ok) return;
  const base = loaded.terms;
  const edits: Array<{ path: string; apply: (terms: Terms, status: string) => void }> = [
    { path: "dates.maturity", apply: (terms, status) => forceStatus(terms.dates.maturity, status) },
    {
      path: "dates.first_call_observation",
      apply: (terms, status) => forceStatus(terms.dates.first_call_observation, status),
    },
    {
      path: "dates.observation_schedule",
      apply: (terms, status) => {
        terms.dates.observation_schedule = [{ value: "2027-01-04", status: "primary", source: "supplement" }];
        const entry = terms.dates.observation_schedule[0];
        if (entry) forceStatus(entry, status);
      },
    },
    {
      path: "underlyings.performance_rounding",
      apply: (terms, status) => forceStatus(terms.underlyings.performance_rounding, status),
    },
    { path: "call.level", apply: (terms, status) => forceStatus(terms.call.level, status) },
    { path: "call.non_call_months", apply: (terms, status) => forceStatus(terms.call.non_call_months, status) },
    { path: "call.frequency", apply: (terms, status) => forceStatus(terms.call.frequency, status) },
    { path: "premium.rate_per_year", apply: (terms, status) => forceStatus(terms.premium.rate_per_year, status) },
    { path: "premium.accrual", apply: (terms, status) => forceStatus(terms.premium.accrual, status) },
    { path: "barrier.level", apply: (terms, status) => forceStatus(terms.barrier.level, status) },
    { path: "barrier.observation", apply: (terms, status) => forceStatus(terms.barrier.observation, status) },
    { path: "barrier.below_barrier", apply: (terms, status) => forceStatus(terms.barrier.below_barrier, status) },
  ];
  base.underlyings.members.forEach((_, index) => {
    edits.push({
      path: `underlyings.members[${index}].initial`,
      apply: (terms, status) => {
        const member = terms.underlyings.members[index];
        if (member) forceStatus(member.initial, status);
      },
    });
  });
  for (const status of STATUSES) {
    for (const edit of edits) {
      const terms = structuredClone(base);
      edit.apply(terms, status);
      const summary = verificationSummary(terms);
      expect(summary.unverified, `${status} ${edit.path}`).toContain(edit.path);
      expect(summary.total).toBe(17);
    }
  }
});

test("a conflict keeps both candidates and stays unverified", () => {
  const minimal = textOf("valid", "minimal.yaml");
  const text = minimal.replace(
    `  maturity:
    value: 2031-03-03
    status: primary
    source: supplement
`,
    `  maturity:
    status: conflict
    candidates:
      - value: 2031-06-16
        status: primary
        source: supplement
      - value: 2031-06-17
        status: primary
        source: supplement
`,
  );
  const loaded = loadTerms(text, "minimal.yaml");
  expect(loaded.ok).toBe(true);
  if (!loaded.ok) return;
  const maturity = loaded.terms.dates.maturity;
  expect(maturity.status).toBe("conflict");
  if (maturity.status !== "conflict") return;
  expect(maturity.candidates.map((candidate) => candidate.value)).toEqual(["2031-06-16", "2031-06-17"]);
  expect(maturity.candidates.map((candidate) => candidate.status)).toEqual(["primary", "primary"]);
  const summary = verificationSummary(loaded.terms);
  expect(summary.unverified).toContain("dates.maturity");
  expect(summary.verified).toBe(14);
  expect(summary.total).toBe(17);
});

test("a primary term backed by an advisor source is an error", () => {
  const fixture = loadTerms(textOf("invalid", "source-kind.yaml"), "source-kind.yaml");
  expect(fixture.ok).toBe(false);
  if (!fixture.ok) expect(fixture.errors.map((error) => error.code)).toEqual(["source-kind"]);

  const minimal = textOf("valid", "minimal.yaml");
  const text = minimal
    .replace(
      `call:
  level:
    value: 9500
    status: primary
    source: supplement
`,
      `call:
  level:
    value: 9500
    status: primary
    source: advisor-note
`,
    )
    .replace(
      `  supplement:
    kind: primary
    file: sources/supplement.pdf
`,
      `  supplement:
    kind: primary
    file: sources/supplement.pdf
  advisor-note:
    kind: advisor
    file: sources/advisor-note.txt
`,
    );
  const loaded = loadTerms(text, "minimal.yaml");
  expect(loaded.ok).toBe(false);
  if (!loaded.ok) {
    expect(loaded.errors).toEqual([
      expect.objectContaining({ code: "source-kind", path: "call.level.source" }),
    ]);
  }
});

test("the loader does not invent a value", () => {
  const text = textOf("valid", "minimal.yaml");
  const loaded = loadTerms(text, "minimal.yaml");
  expect(loaded.ok).toBe(true);
  if (!loaded.ok) return;
  expect(Object.keys(loaded.terms.economics)).toEqual(["issue_price"]);
  expect(loaded.terms.economics.estimated_value).toBeUndefined();
  expect(loaded.terms.economics.fees).toBeUndefined();
  expect(loaded.terms.identifiers).toBeUndefined();
  expect(loaded.terms.dates.observation_schedule).toBeUndefined();
  leafInText(loaded.terms, text);
  const encoded = JSON.stringify(loaded.terms);
  expect(encoded).not.toContain("weekend");
  expect(encoded).not.toContain("cusip-check-digit");

  const exampleText = textOf("valid", "example-autocall.yaml");
  const example = loadTerms(exampleText, "example-autocall.yaml");
  expect(example.ok).toBe(true);
  if (!example.ok) return;
  expect(example.terms.underlyings.performance_rounding).toEqual({ status: "unknown", value: null });
  expect(JSON.stringify(example.terms)).not.toContain("weekend");
  expect(JSON.stringify(example.terms)).not.toContain("cusip-check-digit");
  expect(example.dateFlags["dates.trade"]).toEqual(["weekend"]);
});

test("an absent or empty schedule stays in the total", () => {
  const text = textOf("valid", "minimal.yaml");
  const loaded = loadTerms(text, "minimal.yaml");
  expect(loaded.ok).toBe(true);
  if (!loaded.ok) return;
  const absent = verificationSummary(loaded.terms);
  expect(absent).toEqual({
    verified: 15,
    total: 17,
    unverified: ["dates.final_valuation", "dates.observation_schedule"],
  });

  const emptyTerms = structuredClone(loaded.terms);
  emptyTerms.dates.observation_schedule = [];
  const empty = verificationSummary(emptyTerms);
  expect(empty.total).toBe(17);
  expect(empty.unverified).toContain("dates.observation_schedule");

  const present = `    - value: 2027-01-04
      status: primary
      source: supplement
    - value: 2027-04-05
      status: primary
      source: supplement
`;
  const allPrimary = loadTerms(withSchedule(text, present), "minimal.yaml");
  expect(allPrimary.ok).toBe(true);
  if (!allPrimary.ok) return;
  expect(verificationSummary(allPrimary.terms)).toEqual({
    verified: 16,
    total: 17,
    unverified: ["dates.final_valuation"],
  });
  const mixed = structuredClone(allPrimary.terms);
  const entry = mixed.dates.observation_schedule?.[0];
  if (entry) Object.assign(entry, { status: "document" });
  const summary = verificationSummary(mixed);
  expect(summary.total).toBe(17);
  expect(summary.verified).toBe(15);
  expect(summary.unverified).toEqual(["dates.final_valuation", "dates.observation_schedule"]);
});

/** Replaces the body of the n-th term block named `key` with the given lines, at the block's own indent. */
function replaceTerm(text: string, key: string, occurrence: number, body: string[]): string {
  const pattern = new RegExp(`^( *)${key}:\\n((?:\\1 {2}.*\\n)+)`, "gm");
  let seen = 0;
  let replaced = false;
  const out = text.replace(pattern, (whole, indent: string) => {
    if (seen++ !== occurrence) return whole;
    replaced = true;
    return `${indent}${key}:\n${body.map((line) => `${indent}  ${line}\n`).join("")}`;
  });
  if (!replaced) throw new Error(`no term block ${key}#${occurrence}`);
  return out;
}

const TERM_ROWS: Array<{ path: string; key: string; occurrence: number; get: (terms: Terms) => unknown }> = [
  { path: "issuer", key: "issuer", occurrence: 0, get: (terms) => terms.issuer },
  { path: "dates.trade", key: "trade", occurrence: 0, get: (terms) => terms.dates.trade },
  { path: "dates.settlement", key: "settlement", occurrence: 0, get: (terms) => terms.dates.settlement },
  { path: "dates.maturity", key: "maturity", occurrence: 0, get: (terms) => terms.dates.maturity },
  {
    path: "dates.first_call_observation",
    key: "first_call_observation",
    occurrence: 0,
    get: (terms) => terms.dates.first_call_observation,
  },
  ...[0, 1, 2, 3].map((index) => ({
    path: `underlyings.members[${index}].initial`,
    key: "initial",
    occurrence: index,
    get: (terms: Terms) => terms.underlyings.members[index]?.initial,
  })),
  {
    path: "underlyings.performance_rounding",
    key: "performance_rounding",
    occurrence: 0,
    get: (terms) => terms.underlyings.performance_rounding,
  },
  { path: "call.level", key: "level", occurrence: 0, get: (terms) => terms.call.level },
  { path: "call.non_call_months", key: "non_call_months", occurrence: 0, get: (terms) => terms.call.non_call_months },
  { path: "call.frequency", key: "frequency", occurrence: 0, get: (terms) => terms.call.frequency },
  { path: "premium.rate_per_year", key: "rate_per_year", occurrence: 0, get: (terms) => terms.premium.rate_per_year },
  { path: "premium.accrual", key: "accrual", occurrence: 0, get: (terms) => terms.premium.accrual },
  { path: "barrier.level", key: "level", occurrence: 1, get: (terms) => terms.barrier.level },
  { path: "barrier.observation", key: "observation", occurrence: 0, get: (terms) => terms.barrier.observation },
  { path: "barrier.below_barrier", key: "below_barrier", occurrence: 0, get: (terms) => terms.barrier.below_barrier },
  { path: "economics.issue_price", key: "issue_price", occurrence: 0, get: (terms) => terms.economics.issue_price },
  {
    path: "economics.estimated_value",
    key: "estimated_value",
    occurrence: 0,
    get: (terms) => terms.economics.estimated_value,
  },
  { path: "economics.fees", key: "fees", occurrence: 0, get: (terms) => terms.economics.fees },
];

/** minimal.yaml plus the two optional integer terms, so every term path has a block to edit. */
function minimalWithOptional(): string {
  return textOf("valid", "minimal.yaml").replace(
    "sources:\n",
    "  estimated_value:\n    value: 20\n    status: user\n  fees:\n    value: 3\n    status: user\nsources:\n",
  );
}

test("unknown stays null on every term path, integer terms included", () => {
  const base = minimalWithOptional();
  expect(TERM_ROWS).toHaveLength(21);
  for (const row of TERM_ROWS) {
    const loaded = loadTerms(replaceTerm(base, row.key, row.occurrence, ["value: null", "status: unknown"]), "minimal.yaml");
    expect(loaded.ok, row.path).toBe(true);
    if (!loaded.ok) continue;
    expect(row.get(loaded.terms), row.path).toEqual({ status: "unknown", value: null });
    expect(loaded.dateFlags[row.path], row.path).toBeUndefined();
    expect(loaded.warnings, row.path).toEqual([]);
  }
});

test("a null value is rejected under every status except unknown", () => {
  const base = minimalWithOptional();
  const bodies: Array<[string, string[]]> = [
    ["primary", ["value: null", "status: primary", "source: supplement"]],
    ["user", ["value: null", "status: user"]],
    ["estimate", ["value: null", "status: estimate", 'rule: "Named rule."']],
    ["assumed", ["value: null", "status: assumed", 'note: "Recorded default."']],
  ];
  const sample = ["issuer", "dates.maturity", "underlyings.members[0].initial", "call.level", "call.frequency"];
  for (const row of TERM_ROWS.filter((candidate) => sample.includes(candidate.path))) {
    for (const [status, body] of bodies) {
      const loaded = loadTerms(replaceTerm(base, row.key, row.occurrence, body), "minimal.yaml");
      expect(loaded.ok, `${status} ${row.path}`).toBe(false);
      if (loaded.ok) continue;
      expect(loaded.errors, `${status} ${row.path}`).toEqual([
        expect.objectContaining({ code: "status-fields", path: `${row.path}.value` }),
      ]);
    }
  }

  const conflict = replaceTerm(base, "maturity", 0, [
    "status: conflict",
    "candidates:",
    "  - value: null",
    "    status: primary",
    "    source: supplement",
    "  - value: 2031-03-04",
    "    status: user",
  ]);
  const loaded = loadTerms(conflict, "minimal.yaml");
  expect(loaded.ok).toBe(false);
  if (!loaded.ok) {
    expect(loaded.errors).toEqual([
      expect.objectContaining({ code: "status-fields", path: "dates.maturity.candidates[0].value" }),
    ]);
  }
});

test("the schema marker is the whole value on line 1, never a literal the loader supplies", () => {
  for (const marker of ["mln-terms/0.1", "mln-terms/0.2"]) {
    const text = textOf("valid", "minimal.yaml").replace("schema: mln-terms/0.1\n", `schema: ${marker}\n  extra\n`);
    const result = loadTerms(text, "minimal.yaml");
    expect(result.ok, marker).toBe(false);
    if (!result.ok) {
      expect(result.errors, marker).toEqual([
        expect.objectContaining({ code: "schema-line", path: "schema", line: 1, column: 1 }),
      ]);
    }
  }
});

test("an absent final valuation stays absent and stays in the total", () => {
  const minimal = textOf("valid", "minimal.yaml");
  for (const schema of ["mln-terms/0.1", "mln-terms/0.2"] as const) {
    const loaded = loadTerms(minimal.replace("schema: mln-terms/0.1\n", `schema: ${schema}\n`), "minimal.yaml");
    expect(loaded.ok, schema).toBe(true);
    if (!loaded.ok) continue;
    expect(loaded.terms.schema, schema).toBe(schema);
    expect(loaded.terms.dates.final_valuation, schema).toBeUndefined();
    expect(Object.hasOwn(loaded.terms.dates, "final_valuation"), schema).toBe(false);
    const summary = verificationSummary(loaded.terms);
    expect(summary.total, schema).toBe(13 + loaded.terms.underlyings.members.length);
    expect(summary.unverified, schema).toContain("dates.final_valuation");
  }
});

test("final valuation stays unverified unless it is one primary term", () => {
  const text = textOf("valid", "minimal.yaml").replace("schema: mln-terms/0.1\n", "schema: mln-terms/0.2\n");
  const loaded = loadTerms(text, "minimal.yaml");
  expect(loaded.ok).toBe(true);
  if (!loaded.ok) return;
  const absent = verificationSummary(loaded.terms);
  expect(absent.unverified).toContain("dates.final_valuation");

  const primary = structuredClone(loaded.terms);
  primary.dates.final_valuation = { value: "2031-07-09", status: "primary", source: "supplement" };
  expect(verificationSummary(primary).unverified).not.toContain("dates.final_valuation");

  for (const status of STATUSES) {
    const terms = structuredClone(primary);
    const term = terms.dates.final_valuation;
    if (term === undefined) throw new Error("missing final valuation");
    forceStatus(term, status);
    expect(verificationSummary(terms).unverified, status).toContain("dates.final_valuation");
  }

  const conflict = structuredClone(loaded.terms);
  conflict.dates.final_valuation = {
    status: "conflict",
    candidates: [
      { value: "2031-07-09", status: "primary", source: "supplement" },
      { value: "2031-07-10", status: "primary", source: "supplement" },
    ],
  };
  const summary = verificationSummary(conflict);
  expect(summary.unverified).toContain("dates.final_valuation");
  expect(summary.verified).toBe(absent.verified);
  expect(summary.total).toBe(absent.total);
});

test("final valuation and its candidates require a source matching their primary status", () => {
  const text = textOf("valid", "minimal.yaml")
    .replace("schema: mln-terms/0.1\n", "schema: mln-terms/0.2\n")
    .replace(
      "sources:\n",
      "sources:\n  doc-source:\n    kind: document\n    file: sources/doc-source.pdf\n",
    );
  for (const [source, code] of [
    ["doc-source", "source-kind"],
    ["missing-source", "source-missing"],
  ] as const) {
    const direct = `    value: 2031-07-09
    status: primary
    source: ${source}
`;
    const conflict = `    status: conflict
    candidates:
      - value: 2031-07-09
        status: primary
        source: supplement
      - value: 2031-07-10
        status: primary
        source: ${source}
`;
    for (const [body, path] of [
      [direct, "dates.final_valuation.source"],
      [conflict, "dates.final_valuation.candidates[1].source"],
    ] as const) {
      const stated = text.replace("underlyings:\n", `  final_valuation:\n${body}underlyings:\n`);
      expect(loadTerms(stated, "minimal.yaml"), path).toMatchObject({
        ok: false,
        errors: [{ code, path }],
      });
    }
  }
});

test("a 0.1 file never yields a final valuation key", () => {
  const loaded = loadTerms(textOf("valid", "minimal.yaml"), "minimal.yaml");
  expect(loaded.ok).toBe(true);
  if (loaded.ok) {
    expect(loaded.terms.schema).toBe("mln-terms/0.1");
    expect(Object.hasOwn(loaded.terms.dates, "final_valuation")).toBe(false);
  }
  const stated = textOf("valid", "minimal.yaml").replace(
    "underlyings:\n",
    "  final_valuation:\n    value: 2027-03-01\n    status: primary\n    source: supplement\nunderlyings:\n",
  );
  const rejected = loadTerms(stated, "minimal.yaml");
  expect(rejected.ok).toBe(false);
  if (!rejected.ok) {
    expect(rejected.errors.map((error) => error.code)).toContain("unknown-key");
  }
});
