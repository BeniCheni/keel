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
      expect(summary.total).toBe(16);
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
  expect(summary.total).toBe(16);
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
  expect(absent).toEqual({ verified: 15, total: 16, unverified: ["dates.observation_schedule"] });

  const emptyTerms = structuredClone(loaded.terms);
  emptyTerms.dates.observation_schedule = [];
  const empty = verificationSummary(emptyTerms);
  expect(empty.total).toBe(16);
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
  expect(verificationSummary(allPrimary.terms)).toEqual({ verified: 16, total: 16, unverified: [] });
  const mixed = structuredClone(allPrimary.terms);
  const entry = mixed.dates.observation_schedule?.[0];
  if (entry) Object.assign(entry, { status: "document" });
  const summary = verificationSummary(mixed);
  expect(summary.total).toBe(16);
  expect(summary.verified).toBe(15);
  expect(summary.unverified).toEqual(["dates.observation_schedule"]);
});
