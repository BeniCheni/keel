import { expect, test } from "vitest";
import { addDaysIso } from "./dates.ts";
import { finalPayout, evaluateNote } from "./index.ts";
import { baseTerms, calendar, entryDates, listedTerms } from "./test-support/access.test.ts";
import { uniform } from "./test-support/closes.ts";
import { primary, unknownTerm } from "./test-support/edit.ts";
import type { Evaluation, Terms } from "./types.ts";

const nyse = calendar();
const RATIOS = ["3/5", "9499/10000", "19/20", "1/1", "5999/10000"];

function hashSeed(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function allowedDates(terms: Terms): Set<string> {
  const dates = new Set<string>();
  const add = (status: string, value: string | null) => {
    if (value !== null && (status === "primary" || status === "document" || status === "advisor" || status === "user")) dates.add(value);
  };
  const first = terms.dates.first_call_observation;
  if (first.status !== "unknown" && first.status !== "conflict") add(first.status, first.value);
  for (const item of terms.dates.observation_schedule ?? []) {
    if (item.status !== "unknown" && item.status !== "conflict") add(item.status, item.value);
  }
  const finalTerm = terms.dates.final_valuation;
  if (finalTerm !== undefined && finalTerm.status !== "unknown" && finalTerm.status !== "conflict") add(finalTerm.status, finalTerm.value);
  return dates;
}

function expectWellFormed(result: Evaluation, terms: Terms): void {
  expect(result.provisional).toBe(result.unverified.length > 0);
  const allowed = allowedDates(terms);
  let previous = "";
  for (const row of result.rows) {
    expect(row.index).toBe(result.rows.indexOf(row));
    expect(row.date > previous).toBe(true);
    previous = row.date;
    expect(allowed.has(row.date)).toBe(true);
  }
  const stopping = result.rows.filter((row) => row.outcome === "called" || row.outcome === "unknown");
  expect(stopping.length).toBeLessThanOrEqual(1);
  if (stopping.length === 1) expect(stopping[0]).toBe(result.rows[result.rows.length - 1]);
  const pays = result.status === "called" || result.status === "final-fixed" || result.status === "matured";
  expect(result.payoutCents !== null).toBe(pays);
  const last = result.rows[result.rows.length - 1];
  if (result.status === "called") {
    expect(last?.outcome).toBe("called");
    expect(result.next).toBeNull();
  } else if (result.status === "final-fixed") {
    expect(last?.kind).toBe("final");
    expect(result.next?.kind).toBe("maturity");
  } else if (result.status === "matured") {
    expect(last?.kind).toBe("final");
    expect(result.next).toBeNull();
  } else if (result.status === "unknown") {
    expect(result.next).toBeNull();
    expect(result.payoutCents).toBeNull();
  } else {
    expect(result.status).toBe("live");
    expect(result.reasons).toEqual([]);
    expect(result.payoutCents).toBeNull();
  }
}

test("results stay well formed across a fixed seed", () => {
  const rng = mulberry32(hashSeed("keel-s03-properties-1"));
  const dates = entryDates();
  const bases = [baseTerms(), listedTerms()];
  let evaluations = 0;
  let trailing = 0;
  const trailTerms = baseTerms();
  trailTerms.dates.observation_schedule = [...dates.slice(0, 17).map((date) => primary(date)), unknownTerm()];
  const trailCloses = dates.slice(0, 17).flatMap((date) => uniform(date, "3/5"));
  let cursor = addDaysIso(dates[16] ?? "", 1);
  for (let i = 0; i < 100 && cursor !== null; i += 1) {
    const first = evaluateNote(trailTerms, nyse, trailCloses, cursor);
    const second = evaluateNote(trailTerms, nyse, trailCloses, cursor);
    expect(second).toEqual(first);
    if (first.kind !== "evaluated") throw new Error("trail");
    expect(first.reasons[0]?.code).toBe("date-unknown");
    expectWellFormed(first, trailTerms);
    evaluations += 1;
    trailing += 1;
    cursor = addDaysIso(cursor, 1);
  }
  for (let i = 0; i < 900; i += 1) {
    const terms = bases[Math.floor(rng() * bases.length)] ?? baseTerms();
    const start = addDaysIso("2026-03-02", Math.floor(rng() * 1800));
    if (start === null) continue;
    const chosen = dates.filter(() => rng() < 0.25).slice(0, 4);
    const closes = chosen.flatMap((date) => uniform(date, RATIOS[Math.floor(rng() * RATIOS.length)] ?? "3/5"));
    const first = evaluateNote(terms, nyse, closes, start);
    const second = evaluateNote(terms, nyse, closes, start);
    expect(second).toEqual(first);
    if (first.kind !== "evaluated") throw new Error(JSON.stringify(first));
    expectWellFormed(first, terms);
    evaluations += 1;
  }
  expect(evaluations).toBeGreaterThanOrEqual(1000);
  expect(trailing).toBeGreaterThanOrEqual(100);
}, 60_000);

test("finalPayout never decreases as the ratio rises", () => {
  const variants = [
    baseTerms(),
    listedTerms(),
    (() => {
      const terms = baseTerms();
      terms.premium.rate_per_year = primary(2000);
      terms.call.frequency = primary("monthly");
      return terms;
    })(),
    (() => {
      const terms = baseTerms();
      terms.underlyings.performance_rounding = primary("truncate-4dp");
      return terms;
    })(),
    (() => {
      const terms = baseTerms();
      terms.underlyings.performance_rounding = primary("none");
      return terms;
    })(),
  ];
  for (const terms of variants) {
    let previous = -1;
    let count = 0;
    for (let i = 0; i <= 300; i += 1) {
      const ratio = i === 0 ? "0/1" : `${i}/200`;
      const result = finalPayout(terms, nyse, ratio);
      expect(result.kind, ratio).toBe("final");
      if (result.kind !== "final") continue;
      expect(result.payoutCents, ratio).toBeGreaterThanOrEqual(previous);
      previous = result.payoutCents;
      count += 1;
    }
    expect(count).toBe(301);
  }
});
