import { scheduleDateFlags } from "@keel/core";
import { expect, test } from "vitest";
import { addDaysIso } from "./dates.ts";
import { evaluateNote, finalPayout, noteMetrics, payoutSchedule } from "./index.ts";
import { baseTerms, calendar, entryDates, goldenIds, listedTerms, readGolden } from "./test-support/access.test.ts";
import { uniform } from "./test-support/closes.ts";
import { assumed, clone, conflictTerm, dropFinal, estimate, primary, unknownTerm } from "./test-support/edit.ts";
import type { Close, Evaluation, PayoffReason, Terms, Unavailable, Unsupported } from "./types.ts";

const nyse = calendar();
const EVIDENCED = new Set(["primary", "document", "advisor", "user"]);

function unavailable(result: { kind: string }): PayoffReason[] {
  if (result.kind !== "unavailable" || !("reasons" in result) || !Array.isArray(result.reasons)) {
    throw new Error(JSON.stringify(result));
  }
  expect(JSON.stringify(result)).not.toMatch(/Cents/);
  return result.reasons as PayoffReason[];
}

function evaluated(result: Evaluation | Unavailable | Unsupported): Evaluation {
  if (result.kind !== "evaluated") throw new Error(JSON.stringify(result));
  return result;
}

function setUnknown(terms: Terms, path: string): void {
  const term = unknownTerm();
  if (path === "dates.trade") terms.dates.trade = term;
  else if (path === "dates.settlement") terms.dates.settlement = term;
  else if (path === "dates.maturity") terms.dates.maturity = term;
  else if (path === "dates.first_call_observation") terms.dates.first_call_observation = term;
  else if (path === "underlyings.performance_rounding") terms.underlyings.performance_rounding = term;
  else if (path === "call.level") terms.call.level = term;
  else if (path === "call.non_call_months") terms.call.non_call_months = term;
  else if (path === "call.frequency") terms.call.frequency = term;
  else if (path === "premium.rate_per_year") terms.premium.rate_per_year = term;
  else if (path === "premium.accrual") terms.premium.accrual = term;
  else if (path === "barrier.level") terms.barrier.level = term;
  else if (path === "barrier.observation") terms.barrier.observation = term;
  else terms.barrier.below_barrier = term;
}

function setConflict(terms: Terms, path: string): void {
  if (path === "dates.trade") terms.dates.trade = conflictTerm("2026-03-02", "2026-03-03");
  else if (path === "dates.settlement") terms.dates.settlement = conflictTerm("2026-03-04", "2026-03-05");
  else if (path === "dates.maturity") terms.dates.maturity = conflictTerm("2031-03-03", "2031-03-04");
  else if (path === "dates.first_call_observation") terms.dates.first_call_observation = conflictTerm("2026-09-01", "2026-09-02");
  else if (path === "underlyings.performance_rounding") terms.underlyings.performance_rounding = conflictTerm("half-up-4dp", "none");
  else if (path === "call.level") terms.call.level = conflictTerm(9500, 9600);
  else if (path === "call.non_call_months") terms.call.non_call_months = conflictTerm(6, 7);
  else if (path === "call.frequency") terms.call.frequency = conflictTerm("quarterly", "monthly");
  else if (path === "premium.rate_per_year") terms.premium.rate_per_year = conflictTerm(850, 851);
  else if (path === "premium.accrual") terms.premium.accrual = conflictTerm("simple", "compound");
  else if (path === "barrier.level") terms.barrier.level = conflictTerm(6000, 6001);
  else if (path === "barrier.observation") terms.barrier.observation = conflictTerm("final", "daily-close");
  else terms.barrier.below_barrier = conflictTerm("one-for-one-worst", "physical-delivery");
}

const CHECK_PATHS = [
  "dates.trade",
  "dates.settlement",
  "dates.maturity",
  "dates.first_call_observation",
  "underlyings.performance_rounding",
  "call.level",
  "call.non_call_months",
  "call.frequency",
  "premium.rate_per_year",
  "premium.accrual",
  "barrier.level",
  "barrier.observation",
  "barrier.below_barrier",
];

test("no payout without its inputs", () => {
  for (const path of CHECK_PATHS) {
    for (const fill of [setUnknown, setConflict]) {
      const terms = baseTerms();
      fill(terms, path);
      const code = fill === setUnknown ? "input-unknown" : "input-conflict";
      for (const result of [evaluateNote(terms, nyse, [], "2026-09-01"), payoutSchedule(terms, nyse), finalPayout(terms, nyse, "19/20")]) {
        expect(unavailable(result), `${path} ${code}`).toContainEqual({ code, path });
      }
    }
  }
});

test("unsupported variants give no payout", () => {
  const cases = [
    { field: "accrual", value: "compound", code: "accrual-compound", path: "premium.accrual" },
    { field: "observation", value: "daily-close", code: "barrier-daily-close", path: "barrier.observation" },
    { field: "observation", value: "continuous", code: "barrier-continuous", path: "barrier.observation" },
    { field: "below", value: "physical-delivery", code: "below-barrier-physical-delivery", path: "barrier.below_barrier" },
  ] as const;
  for (const item of cases) {
    const terms = baseTerms();
    if (item.field === "accrual") terms.premium.accrual = primary(item.value);
    else if (item.field === "observation") terms.barrier.observation = primary(item.value);
    else terms.barrier.below_barrier = primary(item.value);
    for (const result of [evaluateNote(terms, nyse, [], "2026-09-01"), payoutSchedule(terms, nyse), finalPayout(terms, nyse, "19/20")]) {
      expect(result.kind, item.code).toBe("unsupported");
      expect(JSON.stringify(result), item.code).not.toMatch(/Cents/);
      if (result.kind === "unsupported") expect(result.reasons).toContainEqual({ code: item.code, path: item.path });
    }
  }
});

test("no status on a planning date", () => {
  const dates = entryDates();
  const closes = dates.flatMap((date, index) => uniform(date, index === 0 ? "3/5" : "19/20"));
  let cursor: string | null = "2026-12-01";
  while (cursor !== null && cursor <= "2031-03-03") {
    const result = evaluated(evaluateNote(baseTerms(), nyse, closes, cursor));
    expect(result.status, cursor).toBe("unknown");
    expect(result.reasons[0]?.code, cursor).toBe("estimated-date");
    for (const row of result.rows) expect(EVIDENCED.has(row.dateStatus), cursor).toBe(true);
    cursor = addDaysIso(cursor, 1);
  }
  const listed = listedTerms();
  const schedule = listed.dates.observation_schedule;
  if (schedule === undefined) throw new Error("list");
  for (const index of schedule.keys()) {
    if (index > 17) continue;
    for (const make of [estimate, assumed]) {
      const terms = listedTerms();
      const items = terms.dates.observation_schedule;
      if (items === undefined) throw new Error("list");
      const current = items[index];
      if (current === undefined || current.status === "unknown" || current.status === "conflict") throw new Error("item");
      items[index] = make(current.value);
      const prior = dates.slice(0, index).flatMap((date) => uniform(date, "3/5"));
      const result = evaluated(evaluateNote(terms, nyse, [...prior, ...uniform(current.value, "19/20")], current.value));
      expect(result.status, `${index} ${make.name}`).toBe("unknown");
      expect(result.reasons[0], `${index}`).toEqual({ code: "estimated-date", scheduleIndex: index, date: current.value });
    }
  }
}, 60_000);

test("no payout on an unestablished chronology or mapping", () => {
  const off = listedTerms();
  off.dates.observation_schedule = [primary("2026-09-01"), primary("2027-12-01")];
  expect(unavailable(evaluateNote(off, nyse, [], "2027-12-01"))[0]?.code).toBe("listed-off-cycle");
  const mismatch = baseTerms();
  mismatch.call.non_call_months = primary(7);
  expect(unavailable(payoutSchedule(mismatch, nyse))).toEqual([{ code: "non-call-months-mismatch" }]);
  const early = baseTerms();
  early.dates.settlement = primary("2027-03-04");
  early.call.non_call_months = primary(0);
  expect(unavailable(finalPayout(early, nyse, "19/20"))).toEqual([{ code: "first-call-before-settlement" }]);
});

test("chronology failures stay unavailable", () => {
  const trade = baseTerms();
  trade.dates.trade = primary("2026-09-02");
  expect(unavailable(evaluateNote(trade, nyse, [], "2026-09-02"))).toContainEqual({ code: "settlement-before-trade" });
  const settlement = baseTerms();
  settlement.dates.settlement = primary("2027-03-04");
  settlement.call.non_call_months = primary(0);
  expect(unavailable(evaluateNote(settlement, nyse, [], "2026-09-01"))).toContainEqual({ code: "first-call-before-settlement" });
  const before = baseTerms();
  before.dates.final_valuation = primary("2026-08-31");
  expect(unavailable(evaluateNote(before, nyse, [], "2026-09-01"))).toContainEqual({ code: "final-valuation-before-first-call" });
  const after = baseTerms();
  after.dates.final_valuation = primary("2031-03-04");
  expect(unavailable(evaluateNote(after, nyse, [], "2031-03-04"))).toContainEqual({ code: "final-valuation-after-maturity" });
  const listed = listedTerms();
  const schedule = listed.dates.observation_schedule;
  if (schedule === undefined) throw new Error("list");
  schedule[0] = primary("2026-08-31");
  expect(unavailable(evaluateNote(listed, nyse, [], "2026-08-31"))).toContainEqual({ code: "observation-before-first-call", index: 0 });
  const matured = listedTerms();
  matured.dates.observation_schedule?.push(primary("2031-06-01"));
  expect(unavailable(evaluateNote(matured, nyse, [], "2031-06-01"))).toContainEqual({ code: "listed-after-maturity", index: 19 });
  const later = listedTerms();
  later.dates.observation_schedule?.push(primary("2031-02-27"));
  expect(unavailable(evaluateNote(later, nyse, [], "2031-02-27"))).toContainEqual({ code: "listed-after-final-valuation", index: 19 });
  const estimatedMaturity = baseTerms();
  estimatedMaturity.dates.maturity = estimate("2031-03-03");
  const result = evaluateNote(estimatedMaturity, nyse, uniform("2031-02-26", "19/20"), "2031-03-03");
  expect(result.kind).toBe("unavailable");
  expect(JSON.stringify(result)).not.toContain("matured");
  expect(unavailable(result)).toContainEqual({ code: "input-unevidenced", path: "dates.maturity" });
});

test("no maturity before maturity", () => {
  const { input } = readGolden("g05-final-fixed-par");
  let cursor: string | null = "2031-02-26";
  while (cursor !== null && cursor < "2031-03-03") {
    const result = evaluated(evaluateNote(input.terms, nyse, input.closes, cursor));
    expect(result.status, cursor).toBe("final-fixed");
    cursor = addDaysIso(cursor, 1);
  }
  const onMaturity = evaluated(evaluateNote(input.terms, nyse, input.closes, "2031-03-03"));
  expect(onMaturity.status).toBe("matured");
});

test("a close conflict is never resolved", () => {
  const { input } = readGolden("g09-unknown-conflict");
  const result = evaluated(evaluateNote(input.terms, nyse, input.closes, input.asOf));
  expect(result.status).toBe("unknown");
  const member = result.rows[2]?.members.find((item) => item.ticker === "CHRL");
  expect(member?.ratio).toBeNull();
  expect(member?.close).toBeNull();
  expect(result.reasons).toEqual([{ code: "close-conflict", ticker: "CHRL", values: ["116.4", "111.6"] }]);
});

function openDay(date: string, direction: -1 | 1): string {
  let cursor = addDaysIso(date, direction);
  for (let step = 0; step < 14 && cursor !== null; step += 1) {
    if (scheduleDateFlags(cursor, nyse).length === 0) return cursor;
    cursor = addDaysIso(cursor, direction);
  }
  throw new Error("open day");
}

test("nothing carries", () => {
  const { input } = readGolden("g08-unknown-missing");
  const original = evaluateNote(input.terms, nyse, input.closes, input.asOf);
  if (original.kind !== "evaluated") throw new Error("g08");
  const decoys = new Set(original.rows.flatMap((row) => [openDay(row.date, -1), openDay(row.date, 1)]));
  const stripped = input.closes.filter((close) => !decoys.has(close.date));
  expect(evaluateNote(input.terms, nyse, stripped, input.asOf)).toEqual(original);
  const moved = input.closes.map((close) =>
    close.ticker === "BRVO" && close.date === openDay("2027-06-01", -1) ? { ...close, date: "2027-06-01" } : close,
  );
  expect(evaluateNote(input.terms, nyse, moved, input.asOf)).not.toEqual(original);
});

test("nothing after asOf is read", () => {
  const { input } = readGolden("g01-called-first");
  const extras: Close[] = [
    { ticker: "ALFA", date: "2099-01-01", value: "0", source: "not a source" },
    { ticker: "ZZZZ", date: input.asOf, value: "nope", source: "not a source" },
  ];
  expect(evaluateNote(input.terms, nyse, input.closes, input.asOf)).toEqual(
    evaluateNote(input.terms, nyse, [...input.closes, ...extras], input.asOf),
  );
  expect(noteMetrics(input.terms, input.closes, input.asOf)).toEqual(noteMetrics(input.terms, [...input.closes, ...extras], input.asOf));
});

test("nothing follows a called or unknown row", () => {
  for (const id of goldenIds()) {
    const { input } = readGolden(id);
    const result = evaluateNote(input.terms, nyse, input.closes, input.asOf);
    if (result.kind !== "evaluated") continue;
    const stopping = result.rows.findIndex((row) => row.outcome === "called" || row.outcome === "unknown");
    if (stopping >= 0) {
      expect(stopping, id).toBe(result.rows.length - 1);
      expect(result.next, id).toBeNull();
    }
  }
});

test("economics and the issuer do not change a result", () => {
  const terms = baseTerms();
  const closes = uniform("2026-09-01", "19/20");
  const before = [
    evaluateNote(terms, nyse, closes, "2026-09-01"),
    payoutSchedule(terms, nyse),
    finalPayout(terms, nyse, "19/20"),
    noteMetrics(terms, closes, "2026-09-01"),
  ];
  terms.economics.issue_price = primary(10001);
  terms.economics.estimated_value = primary(1);
  terms.economics.fees = primary(1);
  terms.issuer = primary("Example Issuer");
  terms.identifiers = { cusip: primary("EXAMPLE") };
  const after = [
    evaluateNote(terms, nyse, closes, "2026-09-01"),
    payoutSchedule(terms, nyse),
    finalPayout(terms, nyse, "19/20"),
    noteMetrics(terms, closes, "2026-09-01"),
  ];
  expect(after).toEqual(before);
});

test("an unknown final valuation date is never a fixed or matured note", () => {
  for (const make of [
    (terms: Terms) => dropFinal(terms),
    (terms: Terms) => {
      terms.dates.final_valuation = unknownTerm();
      return terms;
    },
    (terms: Terms) => {
      terms.dates.final_valuation = conflictTerm("2026-09-01", "2026-12-01");
      return terms;
    },
  ]) {
    const terms = make(baseTerms());
    const result = evaluateNote(terms, nyse, uniform("2031-02-26", "19/20"), "2031-03-03");
    if (result.kind === "evaluated") {
      expect(result.status).not.toBe("final-fixed");
      expect(result.status).not.toBe("matured");
      expect(result.rows.some((row) => row.kind === "final")).toBe(false);
    }
  }
  const role = baseTerms();
  role.dates.observation_schedule = [primary("2026-09-01")];
  role.dates.final_valuation = conflictTerm("2026-09-01", "2026-12-01");
  expect(evaluated(evaluateNote(role, nyse, uniform("2026-09-01", "19/20"), "2026-09-01")).status).toBe("unknown");
  const later = dropFinal(baseTerms());
  later.dates.observation_schedule = [primary("2026-09-01"), estimate("2026-12-01")];
  expect(evaluated(evaluateNote(later, nyse, uniform("2026-09-01", "19/20"), "2026-09-01")).status).toBe("unknown");
});

test("an undated item bounds the status", () => {
  const dates = entryDates();
  const terms = baseTerms();
  terms.dates.observation_schedule = [...dates.slice(0, 17).map((date) => primary(date)), unknownTerm()];
  const closes = dates.slice(0, 17).flatMap((date) => uniform(date, "3/5"));
  const last = dates[16];
  if (last === undefined) throw new Error("date");
  const asOf = addDaysIso(last, 1);
  if (asOf === null) throw new Error("date");
  const result = evaluated(evaluateNote(terms, nyse, closes, asOf));
  expect(result.status).toBe("unknown");
  expect(result.reasons).toEqual([{ code: "date-unknown", index: 17 }]);
  expect(result.status).not.toBe("live");
});

test("provisional matches unverified paths", () => {
  const estimated = evaluated(evaluateNote(baseTerms(), nyse, [], "2026-08-31"));
  expect(estimated.provisional).toBe(true);
  expect(estimated.unverified).toContain("dates.observation_schedule");
  const listed = evaluated(evaluateNote(listedTerms(), nyse, [], "2026-08-31"));
  expect(listed.provisional).toBe(listed.unverified.length > 0);
  expect(listed.unverified).toEqual([]);
  const terms = baseTerms();
  terms.underlyings.members[3] = { ticker: "DLTA", initial: { value: "95.125", status: "document", source: "supplement" } };
  const metrics = noteMetrics(terms, uniform("2026-09-01", "9/10"), "2026-09-01");
  if (metrics.kind !== "metrics") throw new Error("metrics");
  expect(metrics.unverified).toContain("underlyings.members[3].initial");
  expect(metrics.provisional).toBe(true);
  const payout = payoutSchedule(terms, nyse);
  if (payout.kind !== "payouts") throw new Error("payout");
  expect(payout.unverified.includes("underlyings.members[3].initial")).toBe(false);
});

test("noteMetrics never falls back", () => {
  const earlier = uniform("2026-08-31", "9/10");
  const latest = uniform("2026-09-01", "9/10").filter((close) => close.ticker !== "DLTA");
  const result = noteMetrics(baseTerms(), [...earlier, ...latest], "2026-09-01");
  expect(result).toEqual({ kind: "unavailable", reasons: [{ code: "close-missing", ticker: "DLTA" }] });
});

test("calls do not change their inputs", () => {
  const terms = baseTerms();
  const closes = uniform("2026-09-01", "9/10");
  const termsBefore = clone(terms);
  const closesBefore = clone(closes);
  evaluateNote(terms, nyse, closes, "2026-09-01");
  payoutSchedule(terms, nyse);
  finalPayout(terms, nyse, "19/20");
  noteMetrics(terms, closes, "2026-09-01");
  expect(terms).toEqual(termsBefore);
  expect(closes).toEqual(closesBefore);
});
