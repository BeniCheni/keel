import { expect, test } from "vitest";
import { loadTerms } from "./load.ts";
import { textOf } from "./fixtures.ts";

/**
 * Every limit in the field contract, pinned from both sides through the loader: the last
 * accepted value loads, the first rejected value gives exactly one diagnostic. Shifting any
 * bound in the schema or the loader by one unit turns a row red.
 */

interface Row {
  label: string;
  text: string;
  rejected: { code: string; path: string } | null;
}

const minimal = textOf("valid", "minimal.yaml");
const SCHEDULE_ANCHOR = "  first_call_observation:\n    value: 2026-09-01\n    status: primary\n    source: supplement\n";
const BARRIER_LEVEL = "  level:\n    value: 6000\n    status: primary\n    source: supplement\n";
const ACCRUAL = '  accrual:\n    value: "simple"\n    status: primary\n    source: supplement\n';

function swap(from: string, to: string, text = minimal): string {
  if (!text.includes(from)) throw new Error(`anchor missing: ${from}`);
  return text.replace(from, to);
}

function withOptional(name: "estimated_value" | "fees", value: string): string {
  return swap("sources:\n", `  ${name}:\n    value: ${value}\n    status: user\nsources:\n`);
}

function withSchedule(count: number): string {
  const entries: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const year = 2027 + Math.floor(i / 12);
    const month = String((i % 12) + 1).padStart(2, "0");
    entries.push(`    - value: ${year}-${month}-01\n      status: primary\n      source: supplement\n`);
  }
  const list = count === 0 ? "  observation_schedule: []\n" : `  observation_schedule:\n${entries.join("")}`;
  return swap(SCHEDULE_ANCHOR, `${SCHEDULE_ANCHOR}${list}`);
}

function withMembers(count: number): string {
  if (count === 0) return minimal.replace(/  members:\n(?:    .*\n)+/, "  members: []\n");
  if (count === 1) {
    return minimal.replace(
      /  members:\n(?:    .*\n)+/,
      '  members:\n    - ticker: ALFA\n      initial:\n        value: "100.25"\n        status: primary\n        source: supplement\n',
    );
  }
  const extra = Array.from({ length: count - 4 }, (_, i) =>
    `    - ticker: T${i}\n      initial:\n        value: "1"\n        status: primary\n        source: supplement\n`,
  ).join("");
  return swap("  performance_rounding:", `${extra}  performance_rounding:`);
}

function withRule(length: number): string {
  return swap(BARRIER_LEVEL, `  level:\n    value: 6000\n    status: estimate\n    rule: "${"r".repeat(length)}"\n`);
}

function withNote(length: number): string {
  return swap(ACCRUAL, `  accrual:\n    value: "simple"\n    status: assumed\n    note: "${"n".repeat(length)}"\n`);
}

function withCandidates(count: number): string {
  const candidates = ["      - value: 2031-03-03\n        status: primary\n        source: supplement\n", "      - value: 2031-03-04\n        status: user\n"];
  return swap(
    "  maturity:\n    value: 2031-03-03\n    status: primary\n    source: supplement\n",
    `  maturity:\n    status: conflict\n    candidates:\n${candidates.slice(0, count).join("")}`,
  );
}

const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);
const range = (code: string, path: string) => ({ code, path });

const ROWS: Row[] = [
  { label: "call.level 1", text: swap("value: 9500", "value: 1"), rejected: null },
  { label: "call.level 0", text: swap("value: 9500", "value: 0"), rejected: range("out-of-range", "call.level.value") },
  { label: "call.level 20000", text: swap("value: 9500", "value: 20000"), rejected: null },
  { label: "call.level 20001", text: swap("value: 9500", "value: 20001"), rejected: range("out-of-range", "call.level.value") },
  { label: "non_call_months 0", text: swap("value: 6\n", "value: 0\n"), rejected: null },
  { label: "non_call_months -1", text: swap("value: 6\n", "value: -1\n"), rejected: range("out-of-range", "call.non_call_months.value") },
  { label: "non_call_months 120", text: swap("value: 6\n", "value: 120\n"), rejected: null },
  { label: "non_call_months 121", text: swap("value: 6\n", "value: 121\n"), rejected: range("out-of-range", "call.non_call_months.value") },
  { label: "rate_per_year 0", text: swap("value: 850", "value: 0"), rejected: null },
  { label: "rate_per_year -1", text: swap("value: 850", "value: -1"), rejected: range("out-of-range", "premium.rate_per_year.value") },
  { label: "rate_per_year 10000", text: swap("value: 850", "value: 10000"), rejected: null },
  { label: "rate_per_year 10001", text: swap("value: 850", "value: 10001"), rejected: range("out-of-range", "premium.rate_per_year.value") },
  { label: "barrier.level 1", text: swap("value: 6000", "value: 1"), rejected: null },
  { label: "barrier.level 0", text: swap("value: 6000", "value: 0"), rejected: range("out-of-range", "barrier.level.value") },
  { label: "barrier.level 10000", text: swap("value: 6000", "value: 10000"), rejected: null },
  { label: "barrier.level 10001", text: swap("value: 6000", "value: 10001"), rejected: range("out-of-range", "barrier.level.value") },
  { label: "issue_price 1", text: swap("value: 10000", "value: 1"), rejected: null },
  { label: "issue_price 0", text: swap("value: 10000", "value: 0"), rejected: range("out-of-range", "economics.issue_price.value") },
  { label: "issue_price MAX_SAFE", text: swap("value: 10000", `value: ${MAX_SAFE}`), rejected: null },
  {
    label: "issue_price MAX_SAFE + 1",
    text: swap("value: 10000", `value: ${MAX_SAFE + 1n}`),
    rejected: range("out-of-range", "economics.issue_price.value"),
  },
  { label: "estimated_value 1", text: withOptional("estimated_value", "1"), rejected: null },
  { label: "estimated_value 0", text: withOptional("estimated_value", "0"), rejected: range("out-of-range", "economics.estimated_value.value") },
  { label: "fees 0", text: withOptional("fees", "0"), rejected: null },
  { label: "fees -1", text: withOptional("fees", "-1"), rejected: range("out-of-range", "economics.fees.value") },
  { label: "fees -MAX_SAFE - 1", text: withOptional("fees", `-${MAX_SAFE + 1n}`), rejected: range("out-of-range", "economics.fees.value") },
  { label: "issuer 1 char", text: swap('value: "Example Bank SA"', 'value: "a"'), rejected: null },
  { label: "issuer empty", text: swap('value: "Example Bank SA"', 'value: ""'), rejected: range("out-of-range", "issuer.value") },
  { label: "issuer 200 chars", text: swap('value: "Example Bank SA"', `value: "${"a".repeat(200)}"`), rejected: null },
  { label: "issuer 201 chars", text: swap('value: "Example Bank SA"', `value: "${"a".repeat(201)}"`), rejected: range("out-of-range", "issuer.value") },
  { label: "rule 1 char", text: withRule(1), rejected: null },
  { label: "rule empty", text: withRule(0), rejected: range("out-of-range", "barrier.level.rule") },
  { label: "rule 200 chars", text: withRule(200), rejected: null },
  { label: "rule 201 chars", text: withRule(201), rejected: range("out-of-range", "barrier.level.rule") },
  { label: "note 1 char", text: withNote(1), rejected: null },
  { label: "note empty", text: withNote(0), rejected: range("out-of-range", "premium.accrual.note") },
  { label: "note 200 chars", text: withNote(200), rejected: null },
  { label: "note 201 chars", text: withNote(201), rejected: range("out-of-range", "premium.accrual.note") },
  { label: "members 1", text: withMembers(1), rejected: null },
  { label: "members 0", text: withMembers(0), rejected: range("out-of-range", "underlyings.members") },
  { label: "members 10", text: withMembers(10), rejected: null },
  { label: "members 11", text: withMembers(11), rejected: range("out-of-range", "underlyings.members") },
  { label: "schedule 1", text: withSchedule(1), rejected: null },
  { label: "schedule 0", text: withSchedule(0), rejected: range("out-of-range", "dates.observation_schedule") },
  { label: "schedule 400", text: withSchedule(400), rejected: null },
  { label: "schedule 401", text: withSchedule(401), rejected: range("out-of-range", "dates.observation_schedule") },
  { label: "candidates 2", text: withCandidates(2), rejected: null },
  { label: "candidates 1", text: withCandidates(1), rejected: range("conflict-candidates", "dates.maturity.candidates") },
  { label: "sources 0", text: minimal.replace(/sources:\n(?:  .*\n)+/, "sources: {}\n"), rejected: range("out-of-range", "sources") },
  { label: "id 64 chars", text: swap("id: note-min", `id: ${"a".repeat(64)}`), rejected: null },
  { label: "id 65 chars", text: swap("id: note-min", `id: ${"a".repeat(65)}`), rejected: range("wrong-type", "id") },
  { label: "ticker 10 chars", text: swap("ticker: ALFA", `ticker: ${"A".repeat(10)}`), rejected: null },
  { label: "ticker 11 chars", text: swap("ticker: ALFA", `ticker: ${"A".repeat(11)}`), rejected: range("wrong-type", "underlyings.members[0].ticker") },
  { label: "initial 10 integer digits", text: swap('value: "100.25"', 'value: "1234567890.5"'), rejected: null },
  {
    label: "initial 11 integer digits",
    text: swap('value: "100.25"', 'value: "12345678901.5"'),
    rejected: range("wrong-type", "underlyings.members[0].initial.value"),
  },
  { label: "initial 6 decimals", text: swap('value: "100.25"', 'value: "1.123456"'), rejected: null },
  { label: "initial 7 decimals", text: swap('value: "100.25"', 'value: "1.1234567"'), rejected: range("wrong-type", "underlyings.members[0].initial.value") },
  { label: "initial smallest positive", text: swap('value: "100.25"', 'value: "0.000001"'), rejected: null },
  { label: "initial zero", text: swap('value: "100.25"', 'value: "0.000000"'), rejected: range("out-of-range", "underlyings.members[0].initial.value") },
  { label: "source path 255 chars", text: swap("file: sources/supplement.pdf", `file: ${"a".repeat(255)}`), rejected: null },
  { label: "source path 256 chars", text: swap("file: sources/supplement.pdf", `file: ${"a".repeat(256)}`), rejected: range("source-path", "sources.supplement.file") },
  { label: "rounding 6dp", text: swap('value: "half-up-4dp"', "value: half-up-6dp"), rejected: null },
  { label: "rounding 7dp", text: swap('value: "half-up-4dp"', "value: half-up-7dp"), rejected: range("wrong-type", "underlyings.performance_rounding.value") },
  { label: "rounding 0dp", text: swap('value: "half-up-4dp"', "value: truncate-0dp"), rejected: null },
  { label: "rounding none", text: swap('value: "half-up-4dp"', "value: none"), rejected: null },
];

test("every bound in the field contract holds on both sides", () => {
  expect(ROWS).toHaveLength(64);
  for (const row of ROWS) {
    const result = loadTerms(row.text, "minimal.yaml");
    if (row.rejected === null) {
      expect(result.ok, row.label).toBe(true);
      continue;
    }
    expect(result.ok, row.label).toBe(false);
    if (result.ok) continue;
    expect(result.errors, row.label).toEqual([expect.objectContaining(row.rejected)]);
  }
});
