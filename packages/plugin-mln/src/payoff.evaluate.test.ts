import { loadTerms, observationSchedule, type ExchangeCalendar } from "@keel/core";
import { expect, test } from "vitest";
import { addDaysIso } from "./dates.ts";
import { evaluateNote, finalPayout, noteMetrics, payoutSchedule } from "./index.ts";
import { baseTerms, calendar, entryDates, listedTerms, readGolden } from "./test-support/access.test.ts";
import { closeValue, uniform } from "./test-support/closes.ts";
import { assumed, clone, conflictTerm, dropFinal, estimate, primary, sourced, unknownTerm } from "./test-support/edit.ts";
import type { Close, Evaluation, PayoffReason, Terms, Unavailable, Unsupported } from "./types.ts";

const nyse = calendar();

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

function withList(terms: Terms, items: NonNullable<Terms["dates"]["observation_schedule"]>): Terms {
  const next = clone(terms);
  next.dates.observation_schedule = items;
  return next;
}

test("an invalid date is reported before a close the function can read", () => {
  const closes = [closeValue("ALFA", "2026-01-02", "0")];
  expect(unavailable(evaluateNote(baseTerms(), nyse, closes, "2026-02-31"))).toEqual([
    { code: "as-of-invalid" },
    { code: "close-invalid", index: 0 },
  ]);
});

test("a ratio that fails its grammar is ratio-invalid", () => {
  expect(unavailable(finalPayout(baseTerms(), nyse, "19/020"))).toEqual([{ code: "ratio-invalid" }]);
});

test("an unevidenced trade date stays ahead of an unknown settlement", () => {
  const terms = baseTerms();
  terms.dates.trade = estimate("2026-03-02");
  terms.dates.settlement = unknownTerm();
  expect(unavailable(evaluateNote(terms, nyse, [], "2026-09-01"))).toEqual([
    { code: "input-unevidenced", path: "dates.trade" },
    { code: "input-unknown", path: "dates.settlement" },
  ]);
});

test("an unknown input is reported before an unsupported variant", () => {
  const terms = baseTerms();
  terms.dates.trade = unknownTerm();
  terms.premium.accrual = primary("compound");
  const result = evaluateNote(terms, nyse, [], "2026-09-01");
  expect(result.kind).toBe("unavailable");
  if (result.kind !== "unavailable") return;
  expect(result.reasons[0]).toEqual({ code: "input-unknown", path: "dates.trade" });
});

test("unsupported variants are listed in order", () => {
  const terms = baseTerms();
  terms.premium.accrual = primary("compound");
  terms.barrier.observation = primary("daily-close");
  const daily = evaluateNote(terms, nyse, [], "2026-09-01");
  expect(daily.kind).toBe("unsupported");
  terms.barrier.observation = primary("continuous");
  terms.barrier.below_barrier = primary("physical-delivery");
  const result = evaluateNote(terms, nyse, [], "2026-09-01");
  expect(result).toEqual({
    kind: "unsupported",
    reasons: [
      { code: "accrual-compound", path: "premium.accrual" },
      { code: "barrier-continuous", path: "barrier.observation" },
      { code: "below-barrier-physical-delivery", path: "barrier.below_barrier" },
    ],
  });
  expect(daily).toEqual({
    kind: "unsupported",
    reasons: [
      { code: "accrual-compound", path: "premium.accrual" },
      { code: "barrier-daily-close", path: "barrier.observation" },
    ],
  });
});

test("an unavailable schedule is returned unchanged", () => {
  const narrow: ExchangeCalendar = { id: "narrow-2020", fromYear: 2020, toYear: 2020, closures: [] };
  const schedule = observationSchedule(baseTerms(), narrow);
  expect(schedule.kind).toBe("unavailable");
  if (schedule.kind !== "unavailable") return;
  expect(evaluateNote(baseTerms(), narrow, [], "2026-09-01")).toEqual({
    kind: "unavailable",
    reasons: [{ code: "schedule-unavailable", reasons: schedule.reasons }],
  });
});

test("off-cycle dates are both reported", () => {
  const terms = withList(baseTerms(), [primary("2026-09-01"), primary("2027-12-01")]);
  expect(unavailable(evaluateNote(terms, nyse, [], "2026-09-01"))).toEqual([
    { code: "listed-off-cycle", index: 1 },
    { code: "final-valuation-off-cycle" },
  ]);
});

test("a monthly tie is off cycle at the second index", () => {
  const terms = baseTerms();
  terms.call.frequency = primary("monthly");
  const listed = withList(terms, [primary("2026-09-01"), primary("2026-09-16")]);
  expect(unavailable(evaluateNote(listed, nyse, [], "2026-09-01"))).toEqual([
    { code: "listed-off-cycle", index: 1 },
    { code: "final-valuation-off-cycle" },
  ]);
});

test("a date tied at the first index is off cycle", () => {
  const terms = baseTerms();
  terms.call.frequency = primary("monthly");
  const listed = withList(terms, [primary("2026-09-16")]);
  expect(unavailable(evaluateNote(listed, nyse, [], "2026-09-01"))).toEqual([
    { code: "listed-off-cycle", index: 0 },
    { code: "final-valuation-off-cycle" },
  ]);
});

test("an observation before the first call is unavailable", () => {
  const terms = listedTerms();
  const schedule = terms.dates.observation_schedule;
  if (schedule === undefined) throw new Error("list");
  schedule[0] = primary("2026-08-31");
  expect(unavailable(evaluateNote(terms, nyse, uniform("2026-08-31", "19/20"), "2026-08-31"))).toEqual([
    { code: "observation-before-first-call", index: 0 },
  ]);
});

test("two observations before the first call are all reported", () => {
  const terms = listedTerms();
  const schedule = terms.dates.observation_schedule;
  if (schedule === undefined) throw new Error("list");
  schedule[0] = primary("2026-08-28");
  schedule[1] = primary("2026-08-31");
  expect(unavailable(evaluateNote(terms, nyse, [], "2026-09-01"))).toEqual([
    { code: "observation-before-first-call", index: 0 },
    { code: "observation-before-first-call", index: 1 },
    { code: "listed-off-cycle", index: 1 },
  ]);
});

test("a mismatched offset is unavailable", () => {
  const terms = baseTerms();
  terms.call.non_call_months = primary(7);
  expect(unavailable(payoutSchedule(terms, nyse))).toEqual([{ code: "non-call-months-mismatch" }]);
});

test("a first call on or before settlement is unavailable for an estimated schedule", () => {
  const terms = baseTerms();
  terms.dates.settlement = primary("2027-03-04");
  terms.call.non_call_months = primary(0);
  expect(unavailable(evaluateNote(terms, nyse, [], "2026-09-01"))).toEqual([{ code: "first-call-before-settlement" }]);
});

test("a first call on or before settlement is unavailable for a listed schedule", () => {
  const terms = dropFinal(baseTerms());
  terms.dates.settlement = primary("2027-03-04");
  terms.call.non_call_months = primary(0);
  const listed = withList(terms, [primary("2026-09-01")]);
  expect(unavailable(evaluateNote(listed, nyse, [], "2026-09-01"))).toEqual([{ code: "first-call-before-settlement" }]);
});

test("a listed anchor before settlement adds the final valuation finding on the payout", () => {
  const terms = dropFinal(baseTerms());
  terms.dates.first_call_observation = primary("2026-03-03");
  terms.call.non_call_months = primary(0);
  const listed = withList(terms, [primary("2026-03-05"), primary("2026-06-03")]);
  expect(unavailable(evaluateNote(listed, nyse, [], "2026-03-05"))).toEqual([{ code: "first-call-before-settlement" }]);
  expect(unavailable(payoutSchedule(listed, nyse))).toEqual([
    { code: "first-call-before-settlement" },
    { code: "final-valuation-absent" },
  ]);
  expect(unavailable(finalPayout(listed, nyse, "19/20"))).toEqual([
    { code: "first-call-before-settlement" },
    { code: "final-valuation-absent" },
  ]);
});

test("settlement before the trade date is unavailable", () => {
  const terms = baseTerms();
  terms.dates.trade = primary("2026-09-02");
  expect(unavailable(evaluateNote(terms, nyse, uniform("2026-09-01", "19/20"), "2026-09-01"))).toEqual([
    { code: "settlement-before-trade" },
  ]);
});

test("the offset is measured from settlement", () => {
  const terms = baseTerms();
  terms.dates.trade = primary("2026-01-31");
  const result = payoutSchedule(terms, nyse);
  expect(result.kind).toBe("payouts");
  if (result.kind !== "payouts") return;
  expect(result.calls[0]?.payoutCents).toBe(104250);
});

test("a final valuation before the first call is unavailable", () => {
  const terms = baseTerms();
  terms.dates.final_valuation = primary("2026-08-31");
  expect(unavailable(evaluateNote(terms, nyse, [], "2026-09-01"))).toContainEqual({ code: "final-valuation-before-first-call" });
});

test("a final valuation after maturity is unavailable", () => {
  const terms = baseTerms();
  terms.dates.final_valuation = primary("2031-03-04");
  expect(unavailable(evaluateNote(terms, nyse, [], "2031-03-04"))).toContainEqual({ code: "final-valuation-after-maturity" });
});

test("a listed item after maturity is unavailable", () => {
  const terms = listedTerms();
  terms.dates.observation_schedule?.push(primary("2031-06-01"));
  expect(unavailable(evaluateNote(terms, nyse, [], "2031-06-01"))).toContainEqual({ code: "listed-after-maturity", index: 19 });
});

test("a listed item after the final valuation is unavailable", () => {
  const terms = listedTerms();
  terms.dates.observation_schedule?.push(primary("2031-02-27"));
  expect(unavailable(evaluateNote(terms, nyse, [], "2031-02-27"))).toContainEqual({
    code: "listed-after-final-valuation",
    index: 19,
  });
});

test("an estimated entry on the final valuation date is the final row", () => {
  const dates = entryDates();
  expect(dates[1]).toBe("2026-12-01");
  const terms = baseTerms();
  terms.dates.final_valuation = primary("2026-12-01");
  const pay = payoutSchedule(terms, nyse);
  expect(pay.kind).toBe("payouts");
  if (pay.kind !== "payouts") return;
  expect(pay.calls).toHaveLength(1);
  expect(pay.final.date).toBe("2026-12-01");
  expect(pay.final.premiumMonths).toBe(9);
  expect(pay.assumptions).toContainEqual({ code: "estimated-after-final-valuation-left-out", count: dates.length - 2 });
  const result = evaluated(evaluateNote(terms, nyse, [...uniform(dates[0] ?? "", "3/5"), ...uniform("2026-12-01", "3/5")], "2026-12-01"));
  expect(result.rows.map((row) => row.kind)).toEqual(["call", "final"]);
  expect(result.rows[1]?.dateOrigin).toBe("final-valuation");
  expect(result.status).toBe("final-fixed");
});

test("a listed unknown item is next on the row date", () => {
  const terms = listedTerms();
  const schedule = terms.dates.observation_schedule;
  if (schedule === undefined || schedule[0] === undefined) throw new Error("list");
  schedule[1] = unknownTerm();
  const date = schedule[0].status === "unknown" || schedule[0].status === "conflict" ? "" : schedule[0].value;
  const result = evaluated(evaluateNote(terms, nyse, uniform(date, "3/5"), date));
  expect(result.status).toBe("live");
  expect(result.reasons).toEqual([]);
  expect(result.next).toEqual({ kind: "call", scheduleIndex: 1, date: null, evidenced: false });
});

test("a listed unknown item stops in the list", () => {
  const terms = listedTerms();
  const schedule = terms.dates.observation_schedule;
  if (schedule === undefined || schedule[0] === undefined) throw new Error("list");
  schedule[1] = unknownTerm();
  const date = schedule[0].status === "unknown" || schedule[0].status === "conflict" ? "" : schedule[0].value;
  const asOf = addDaysIso(date, 1);
  if (asOf === null) throw new Error("date");
  const result = evaluated(evaluateNote(terms, nyse, uniform(date, "3/5"), asOf));
  expect(result.status).toBe("unknown");
  expect(result.reasons).toEqual([{ code: "date-unknown", index: 1 }]);
  expect(result.next).toBeNull();
});

test("a trailing undated item stops the status", () => {
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
  expect(result.rows).toHaveLength(17);
  expect(result.next).toBeNull();
});

test("a generated date stops as estimated", () => {
  const result = evaluated(
    evaluateNote(baseTerms(), nyse, [...uniform("2026-09-01", "3/5"), ...uniform("2026-12-01", "11/10")], "2026-12-15"),
  );
  expect(result.status).toBe("unknown");
  expect(result.rows).toHaveLength(1);
  expect(result.reasons).toEqual([{ code: "estimated-date", scheduleIndex: 1, date: "2026-12-01" }]);
  expect(result.payoutCents).toBeNull();
});

test("a listed estimate stops as estimated", () => {
  const terms = listedTerms();
  const schedule = terms.dates.observation_schedule;
  if (schedule === undefined) throw new Error("list");
  schedule[1] = estimate("2026-12-01");
  const result = evaluated(evaluateNote(terms, nyse, [...uniform("2026-09-01", "3/5"), ...uniform("2026-12-01", "19/20")], "2026-12-01"));
  expect(result.status).toBe("unknown");
  expect(result.rows).toHaveLength(1);
  expect(result.reasons).toEqual([{ code: "estimated-date", scheduleIndex: 1, date: "2026-12-01" }]);
});

test("a listed assumed date stops as estimated", () => {
  const terms = listedTerms();
  const schedule = terms.dates.observation_schedule;
  if (schedule === undefined) throw new Error("list");
  schedule[1] = assumed("2026-12-01");
  const result = evaluated(evaluateNote(terms, nyse, uniform("2026-09-01", "3/5"), "2026-12-01"));
  expect(result.reasons).toEqual([{ code: "estimated-date", scheduleIndex: 1, date: "2026-12-01" }]);
});

test("an ignored ticker leaves the result unchanged", () => {
  const closes = uniform("2026-09-01", "19/20");
  const extra = closeValue("ZZZZ", "2026-09-01", "1");
  expect(evaluateNote(baseTerms(), nyse, closes, "2026-09-01")).toEqual(
    evaluateNote(baseTerms(), nyse, [...closes, extra], "2026-09-01"),
  );
});

test("equal closes merge their sources", () => {
  const closes = [
    closeValue("BRVO", "2026-09-01", "76.475", "synthetic-a"),
    closeValue("BRVO", "2026-09-01", "76.4750", "synthetic-b"),
    ...uniform("2026-09-01", "1/1").filter((close) => close.ticker !== "BRVO"),
  ];
  const result = evaluated(evaluateNote(baseTerms(), nyse, closes, "2026-09-01"));
  const member = result.rows[0]?.members.find((item) => item.ticker === "BRVO");
  expect(member).toEqual({ ticker: "BRVO", close: "76.475", sources: ["synthetic-a", "synthetic-b"], ratio: "19/20" });
  expect(result.rows[0]?.reasons).toEqual([]);
  expect(result.rows[0]?.worst).toEqual({ ticker: "BRVO", ratio: "19/20" });
});

test("an absent final valuation stays live until the unknown role", () => {
  const terms = withList(dropFinal(baseTerms()), [primary("2026-09-01"), primary("2026-12-01")]);
  const live = evaluated(evaluateNote(terms, nyse, uniform("2026-09-01", "3/5"), "2026-09-01"));
  expect(live.status).toBe("live");
  expect(live.reasons).toEqual([]);
  expect(live.next?.kind).toBe("observation");
  expect(live.next?.date).toBe("2026-12-01");
  const reached = evaluated(evaluateNote(terms, nyse, uniform("2026-09-01", "3/5"), "2026-12-01"));
  expect(reached.status).toBe("unknown");
  expect(reached.reasons).toEqual([{ code: "final-valuation-absent" }]);
  expect(reached.rows).toHaveLength(1);
});

test("a conflicting final valuation leaves the role unknown", () => {
  const terms = withList(baseTerms(), [primary("2026-09-01")]);
  terms.dates.final_valuation = conflictTerm("2026-09-01", "2026-12-01");
  const closes = uniform("2026-09-01", "19/20");
  const onDate = evaluated(evaluateNote(terms, nyse, closes, "2026-09-01"));
  expect(onDate.status).toBe("unknown");
  expect(onDate.rows).toEqual([]);
  expect(onDate.reasons).toEqual([{ code: "final-valuation-conflict" }]);
  const before = evaluated(evaluateNote(terms, nyse, closes, "2026-08-31"));
  expect(before.status).toBe("live");
  expect(before.next).toEqual({ kind: "observation", scheduleIndex: 0, date: "2026-09-01", evidenced: true });
});

test("a later listed item does not rule out a candidate", () => {
  const closes = uniform("2026-09-01", "19/20");
  for (const second of [estimate("2026-12-01"), primary("2026-12-01")]) {
    const terms = withList(baseTerms(), [primary("2026-09-01"), second]);
    terms.dates.final_valuation = conflictTerm("2026-09-01", "2026-12-01");
    const onDate = evaluated(evaluateNote(terms, nyse, closes, "2026-09-01"));
    expect(onDate.status).toBe("unknown");
    expect(onDate.rows).toEqual([]);
    expect(onDate.reasons).toEqual([{ code: "final-valuation-conflict" }]);
    const before = evaluated(evaluateNote(terms, nyse, closes, "2026-08-31"));
    expect(before.status).toBe("live");
    expect(before.next?.kind).toBe("observation");
  }
});

test("an absent final valuation with a later primary item can call", () => {
  const terms = withList(dropFinal(baseTerms()), [primary("2026-09-01"), primary("2026-12-01")]);
  const result = evaluated(evaluateNote(terms, nyse, uniform("2026-09-01", "19/20"), "2026-09-01"));
  expect(result.status).toBe("called");
  expect(result.rows).toHaveLength(1);
  expect(result.payoutCents).toBe(104250);
});

test("an absent final valuation with a later estimate does not call", () => {
  const terms = withList(dropFinal(baseTerms()), [primary("2026-09-01"), estimate("2026-12-01")]);
  const result = evaluated(evaluateNote(terms, nyse, uniform("2026-09-01", "19/20"), "2026-09-01"));
  expect(result.status).toBe("unknown");
  expect(result.rows).toEqual([]);
  expect(result.reasons).toEqual([{ code: "final-valuation-absent" }]);
});

test("each of the four dates is unevidenced when estimated or assumed", () => {
  const keys = ["trade", "settlement", "maturity", "first_call_observation"] as const;
  const values = { trade: "2026-03-02", settlement: "2026-03-04", maturity: "2031-03-03", first_call_observation: "2026-09-01" };
  for (const key of keys) {
    for (const make of [estimate, assumed]) {
      const terms = baseTerms();
      terms.dates[key] = make(values[key]);
      for (const result of [evaluateNote(terms, nyse, [], "2026-09-01"), payoutSchedule(terms, nyse), finalPayout(terms, nyse, "19/20")]) {
        expect(unavailable(result), `${key} ${make.name}`).toContainEqual({ code: "input-unevidenced", path: `dates.${key}` });
      }
      const metrics = noteMetrics(terms, uniform("2026-09-01", "9/10"), "2026-09-01");
      expect(metrics.kind, key).toBe("metrics");
    }
  }
});

test("invalid closes the function cannot read leave the result unchanged", () => {
  const closes = uniform("2026-09-01", "19/20");
  const extras: Close[] = [
    closeValue("ALFA", "2099-01-01", "0", "not a source"),
    closeValue("ZZZZ", "2026-09-01", "nope", "not a source"),
  ];
  const terms = baseTerms();
  expect(evaluateNote(terms, nyse, closes, "2026-09-01")).toEqual(evaluateNote(terms, nyse, [...closes, ...extras], "2026-09-01"));
  expect(noteMetrics(terms, closes, "2026-09-01")).toEqual(noteMetrics(terms, [...closes, ...extras], "2026-09-01"));
});

test("each member reason is traced", () => {
  const terms = baseTerms();
  terms.underlyings.members[0] = { ticker: "ALFA", initial: unknownTerm() };
  const unknownInitial = evaluated(evaluateNote(terms, nyse, uniform("2026-09-01", "19/20"), "2026-09-01"));
  expect(unknownInitial.rows[0]?.reasons[0]).toEqual({ code: "initial-unknown", ticker: "ALFA" });
  expect(unknownInitial.rows[0]?.members[0]?.ratio).toBeNull();

  const conflicted = baseTerms();
  conflicted.underlyings.members[1] = { ticker: "BRVO", initial: conflictTerm("80.5", "81") };
  const missing = uniform("2026-09-01", "19/20").filter((close) => close.ticker !== "BRVO");
  const initialConflict = evaluated(evaluateNote(conflicted, nyse, missing, "2026-09-01"));
  expect(initialConflict.rows[0]?.reasons).toContainEqual({ code: "initial-conflict", ticker: "BRVO" });
  expect(initialConflict.rows[0]?.reasons.some((reason) => reason.code === "close-missing")).toBe(false);

  const gap = evaluated(evaluateNote(baseTerms(), nyse, missing, "2026-09-01"));
  const brvo = gap.rows[0]?.members.find((member) => member.ticker === "BRVO");
  expect(brvo).toEqual({ ticker: "BRVO", close: null, sources: [], ratio: null });
  expect(gap.rows[0]?.reasons).toContainEqual({ code: "close-missing", ticker: "BRVO" });

  const conflictCloses = [
    closeValue("CHRL", "2026-09-01", "116.4", "synthetic-a"),
    closeValue("CHRL", "2026-09-01", "111.6", "synthetic-b"),
    ...uniform("2026-09-01", "19/20").filter((close) => close.ticker !== "CHRL"),
  ];
  const conflict = evaluated(evaluateNote(baseTerms(), nyse, conflictCloses, "2026-09-01"));
  expect(conflict.rows[0]?.members.find((member) => member.ticker === "CHRL")).toEqual({
    ticker: "CHRL",
    close: null,
    sources: ["synthetic-a", "synthetic-b"],
    ratio: null,
  });
  expect(conflict.reasons).toEqual([{ code: "close-conflict", ticker: "CHRL", values: ["116.4", "111.6"] }]);
});

test("the first tied member is the worst", () => {
  const result = evaluated(evaluateNote(baseTerms(), nyse, uniform("2026-09-01", "19/20"), "2026-09-01"));
  expect(result.rows[0]?.worst?.ticker).toBe("ALFA");
  expect(result.status).toBe("called");
});

test("evaluation stops after a call", () => {
  const result = evaluated(
    evaluateNote(listedTerms(), nyse, [...uniform("2026-09-01", "19/20"), ...uniform("2026-12-01", "19/20")], "2026-12-15"),
  );
  expect(result.status).toBe("called");
  expect(result.rows).toHaveLength(1);
  expect(result.next).toBeNull();
  expect(result.payoutCents).toBe(104250);
});

test("evaluation stops after an unknown row", () => {
  const closes = [...uniform("2026-09-01", "3/5").filter((close) => close.ticker !== "BRVO"), ...uniform("2026-12-01", "19/20")];
  const result = evaluated(evaluateNote(listedTerms(), nyse, closes, "2026-12-15"));
  expect(result.status).toBe("unknown");
  expect(result.rows).toHaveLength(1);
  expect(result.payoutCents).toBeNull();
  expect(result.next).toBeNull();
});

test("the final row tests the call level before the barrier", () => {
  const result = finalPayout(baseTerms(), nyse, "19/20");
  expect(result.kind).toBe("final");
  if (result.kind !== "final") return;
  expect(result.outcome).toBe("final-above-call");
  expect(result.payoutCents).toBe(142500);
});

test("a document trade date is unverified", () => {
  const terms = baseTerms();
  terms.dates.trade = sourced("2026-03-02", "document");
  const result = evaluated(evaluateNote(terms, nyse, [], "2026-08-31"));
  expect(result.unverified).toContain("dates.trade");
});

test("settlement is unverified when it is not primary", () => {
  const terms = baseTerms();
  terms.dates.settlement = sourced("2026-03-04", "document");
  const result = evaluated(evaluateNote(terms, nyse, [], "2026-08-31"));
  expect(result.unverified).toContain("dates.settlement");
  expect(result.unverified).toContain("dates.observation_schedule");
});

test("an unknown final valuation is reported by the payout", () => {
  const terms = baseTerms();
  terms.dates.final_valuation = unknownTerm();
  expect(unavailable(payoutSchedule(terms, nyse))).toEqual([{ code: "final-valuation-unknown" }]);
});

// Boundaries: each test below sits on the date or the level where a rule changes its answer.

function notCalledThrough(count: number): Close[] {
  return entryDates()
    .slice(0, count)
    .flatMap((date) => uniform(date, "3/5"));
}

function finalRow(closes: Close[]): Evaluation {
  const others = uniform("2031-02-26", "1/1").filter((close) => !closes.some((item) => item.ticker === close.ticker));
  return evaluated(evaluateNote(listedTerms(), nyse, [...notCalledThrough(18), ...closes, ...others], "2031-02-26"));
}

test("the final row rounds the ratio before the call test", () => {
  const result = finalRow([closeValue("BRVO", "2031-02-26", "76.470975")]);
  const last = result.rows[18];
  expect(last?.kind).toBe("final");
  expect(last?.worst).toEqual({ ticker: "BRVO", ratio: "19/20" });
  expect(last?.outcome).toBe("final-above-call");
  expect(result.status).toBe("final-fixed");
  expect(result.payoutCents).toBe(142500);
});

test("the final row rounds the ratio before the barrier test", () => {
  const result = finalRow([closeValue("BRVO", "2031-02-26", "48.295975")]);
  const last = result.rows[18];
  expect(last?.worst).toEqual({ ticker: "BRVO", ratio: "3/5" });
  expect(last?.outcome).toBe("final-at-or-above-barrier");
  expect(result.payoutCents).toBe(100000);
});

test("the final row pays one-for-one on the rounded ratio", () => {
  const result = finalRow([closeValue("CHRL", "2031-02-26", "71.99388")]);
  const last = result.rows[18];
  expect(last?.worst).toEqual({ ticker: "CHRL", ratio: "5999/10000" });
  expect(last?.outcome).toBe("final-below-barrier");
  expect(result.payoutCents).toBe(59990);
});

test("a first call on the settlement date is unavailable", () => {
  const terms = baseTerms();
  terms.dates.settlement = primary("2026-09-01");
  terms.call.non_call_months = primary(0);
  expect(unavailable(evaluateNote(terms, nyse, [], "2026-09-01"))).toEqual([{ code: "first-call-before-settlement" }]);
});

test("a first call the day after settlement is in order", () => {
  const terms = baseTerms();
  terms.dates.settlement = primary("2026-08-31");
  terms.call.non_call_months = primary(0);
  const result = payoutSchedule(terms, nyse);
  expect(result.kind).toBe("payouts");
  if (result.kind !== "payouts") return;
  expect(result.calls[0]).toEqual({ scheduleIndex: 0, date: "2026-09-01", evidenced: true, premiumMonths: 0, payoutCents: 100000 });
});

test("settlement on the trade date is in order", () => {
  const terms = baseTerms();
  terms.dates.trade = primary("2026-03-04");
  expect(evaluated(evaluateNote(terms, nyse, [], "2026-08-31")).status).toBe("live");
  expect(payoutSchedule(terms, nyse).kind).toBe("payouts");
});

test("a final valuation on the maturity date is in order", () => {
  const estimated = baseTerms();
  estimated.dates.final_valuation = primary("2031-03-03");
  const pay = payoutSchedule(estimated, nyse);
  expect(pay.kind).toBe("payouts");
  if (pay.kind !== "payouts") return;
  expect(pay.calls).toHaveLength(18);
  expect(pay.final).toEqual({ date: "2031-03-03", evidenced: true, premiumMonths: 60, aboveCallCents: 142500, atOrAboveBarrierCents: 100000 });
  expect(pay.assumptions.some((item) => item.code === "estimated-after-final-valuation-left-out")).toBe(false);

  const listed = listedTerms();
  listed.dates.final_valuation = primary("2031-03-03");
  const schedule = listed.dates.observation_schedule;
  if (schedule === undefined) throw new Error("list");
  schedule[18] = primary("2031-03-03");
  const closes = [...notCalledThrough(18), ...uniform("2031-03-03", "19/20")];
  const before = evaluated(evaluateNote(listed, nyse, closes, "2031-03-02"));
  expect(before.status).toBe("live");
  expect(before.next).toEqual({ kind: "final", scheduleIndex: null, date: "2031-03-03", evidenced: true });
  const on = evaluated(evaluateNote(listed, nyse, closes, "2031-03-03"));
  expect(on.status).toBe("matured");
  expect(on.rows).toHaveLength(19);
  expect(on.rows[18]?.date).toBe("2031-03-03");
  expect(on.payoutCents).toBe(142500);
});

test("a final valuation on the first call date is in order", () => {
  const terms = baseTerms();
  terms.dates.final_valuation = primary("2026-09-01");
  const pay = payoutSchedule(terms, nyse);
  expect(pay.kind).toBe("payouts");
  if (pay.kind !== "payouts") return;
  expect(pay.calls).toEqual([]);
  expect(pay.final).toEqual({ date: "2026-09-01", evidenced: true, premiumMonths: 6, aboveCallCents: 104250, atOrAboveBarrierCents: 100000 });
  expect(pay.assumptions).toContainEqual({ code: "estimated-after-final-valuation-left-out", count: 18 });
  const result = evaluated(evaluateNote(terms, nyse, uniform("2026-09-01", "19/20"), "2026-09-01"));
  expect(result.rows.map((row) => row.kind)).toEqual(["final"]);
  expect(result.status).toBe("final-fixed");
  expect(result.payoutCents).toBe(104250);
});

test("an undated first item is next up to the settlement date and unknown after it", () => {
  const terms = listedTerms();
  const schedule = terms.dates.observation_schedule;
  if (schedule === undefined) throw new Error("list");
  schedule[0] = unknownTerm();
  for (const asOf of ["2026-03-03", "2026-03-04"]) {
    const result = evaluated(evaluateNote(terms, nyse, [], asOf));
    expect(result.status, asOf).toBe("live");
    expect(result.rows, asOf).toEqual([]);
    expect(result.reasons, asOf).toEqual([]);
    expect(result.next, asOf).toEqual({ kind: "call", scheduleIndex: 0, date: null, evidenced: false });
  }
  const after = evaluated(evaluateNote(terms, nyse, [], "2026-03-05"));
  expect(after.status).toBe("unknown");
  expect(after.rows).toEqual([]);
  expect(after.next).toBeNull();
  expect(after.reasons).toEqual([{ code: "date-unknown", index: 0 }]);
});

// Checks, paths and shared fields that had a surviving mutant.

test("each way a readable close can be invalid is reported at its index", () => {
  const closes: Close[] = [
    closeValue("ALFA", "2026-09-01", "95.2375"),
    closeValue("ALFA", "2026-02-30", "95.2375"),
    closeValue("BRVO", "2026-09-01", "95."),
    closeValue("CHRL", "2026-09-01", "0.0"),
    closeValue("DLTA", "2026-09-01", "90.36875", "Not A Source"),
    closeValue("DLTA", "2026-09-01", "1e2"),
  ];
  const expected = [1, 2, 3, 4, 5].map((index) => ({ code: "close-invalid", index }));
  expect(unavailable(evaluateNote(baseTerms(), nyse, closes, "2026-09-01"))).toEqual(expected);
  expect(unavailable(noteMetrics(baseTerms(), closes, "2026-09-01"))).toEqual(expected);
});

test("an input finding is returned ahead of a terms finding", () => {
  const terms = baseTerms();
  terms.dates.trade = unknownTerm();
  expect(unavailable(evaluateNote(terms, nyse, [], "2026-13-01"))).toEqual([{ code: "as-of-invalid" }]);
  expect(unavailable(finalPayout(terms, nyse, "19/020"))).toEqual([{ code: "ratio-invalid" }]);
  expect(unavailable(noteMetrics(baseTerms(), [closeValue("ALFA", "2026-09-01", "0")], "2026-09-01"))).toEqual([
    { code: "close-invalid", index: 0 },
  ]);
});

test("a leap day is real only in a leap year", () => {
  expect(unavailable(evaluateNote(baseTerms(), nyse, [], "2100-02-29"))).toEqual([{ code: "as-of-invalid" }]);
  expect(unavailable(evaluateNote(baseTerms(), nyse, [], "2027-02-29"))).toEqual([{ code: "as-of-invalid" }]);
  expect(evaluateNote(baseTerms(), nyse, [], "2028-02-29").kind).toBe("evaluated");
  expect(evaluateNote(baseTerms(), nyse, [], "2000-02-29").kind).toBe("evaluated");
});

test("a first call with two equally near whole-month offsets has none", () => {
  for (const months of [6, 7]) {
    const terms = baseTerms();
    terms.dates.trade = primary("2026-02-27");
    terms.dates.settlement = primary("2026-03-01");
    terms.dates.first_call_observation = primary("2026-09-16");
    terms.call.non_call_months = primary(months);
    expect(unavailable(payoutSchedule(terms, nyse)), String(months)).toEqual([{ code: "non-call-months-mismatch" }]);
  }
});

test("an item after the final valuation is found by its date, and by its place", () => {
  const dated = listedTerms();
  const datedList = dated.dates.observation_schedule;
  if (datedList === undefined) throw new Error("list");
  datedList[18] = primary("2031-02-27");
  expect(unavailable(evaluateNote(dated, nyse, [], "2026-09-01"))).toEqual([{ code: "listed-after-final-valuation", index: 18 }]);
  const placed = listedTerms();
  placed.dates.observation_schedule?.push(unknownTerm());
  expect(unavailable(evaluateNote(placed, nyse, [], "2026-09-01"))).toEqual([{ code: "listed-after-final-valuation", index: 19 }]);
});

test("noteMetrics takes its date from a member's close only", () => {
  const closes = [...uniform("2026-08-31", "9/10"), closeValue("ZZZZ", "2026-09-01", "1")];
  const result = noteMetrics(baseTerms(), closes, "2026-09-01");
  expect(result.kind).toBe("metrics");
  if (result.kind !== "metrics") return;
  expect(result.date).toBe("2026-08-31");
  expect(result.asOf).toBe("2026-09-01");
});

const UNVERIFIED_ORDER = [
  "dates.trade",
  "dates.settlement",
  "dates.maturity",
  "dates.first_call_observation",
  "dates.final_valuation",
  "dates.observation_schedule",
  "underlyings.members[0].initial",
  "underlyings.members[1].initial",
  "underlyings.members[2].initial",
  "underlyings.members[3].initial",
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

/** L with one path, or every path, moved from `primary` to `document`. */
function unverifiedTerms(path: string | null): Terms {
  const terms = listedTerms();
  const hit = (name: string) => path === null || path === name;
  const doc = <T>(term: { value: T }): { value: T; status: "document"; source: string } => ({
    value: term.value,
    status: "document",
    source: "supplement",
  });
  const text = (term: Terms["dates"]["trade"]) => (term.status === "primary" ? doc(term) : term);
  const count = (term: Terms["call"]["level"]) => (term.status === "primary" ? doc(term) : term);
  if (hit("dates.trade")) terms.dates.trade = text(terms.dates.trade);
  if (hit("dates.settlement")) terms.dates.settlement = text(terms.dates.settlement);
  if (hit("dates.maturity")) terms.dates.maturity = text(terms.dates.maturity);
  if (hit("dates.first_call_observation")) terms.dates.first_call_observation = text(terms.dates.first_call_observation);
  if (hit("dates.final_valuation") && terms.dates.final_valuation !== undefined) terms.dates.final_valuation = text(terms.dates.final_valuation);
  const schedule = terms.dates.observation_schedule;
  if (hit("dates.observation_schedule") && schedule !== undefined && schedule[5] !== undefined) schedule[5] = text(schedule[5]);
  terms.underlyings.members.forEach((member, index) => {
    if (hit(`underlyings.members[${index}].initial`)) member.initial = text(member.initial);
  });
  if (hit("underlyings.performance_rounding")) terms.underlyings.performance_rounding = text(terms.underlyings.performance_rounding);
  if (hit("call.level")) terms.call.level = count(terms.call.level);
  if (hit("call.non_call_months")) terms.call.non_call_months = count(terms.call.non_call_months);
  if (hit("call.frequency")) terms.call.frequency = text(terms.call.frequency);
  if (hit("premium.rate_per_year")) terms.premium.rate_per_year = count(terms.premium.rate_per_year);
  if (hit("premium.accrual")) terms.premium.accrual = text(terms.premium.accrual);
  if (hit("barrier.level")) terms.barrier.level = count(terms.barrier.level);
  if (hit("barrier.observation")) terms.barrier.observation = text(terms.barrier.observation);
  if (hit("barrier.below_barrier")) terms.barrier.below_barrier = text(terms.barrier.below_barrier);
  return terms;
}

function unverifiedOf(result: { kind: string }): string[] {
  if (!("unverified" in result) || !Array.isArray(result.unverified)) throw new Error(JSON.stringify(result));
  return result.unverified as string[];
}

test("every unverified path a function reads is listed, in the fixed order", () => {
  const closes = uniform("2026-09-01", "9/10");
  const isInitial = (path: string) => path.startsWith("underlyings.members[");
  const metricsReads = (path: string) => isInitial(path) || ["underlyings.performance_rounding", "call.level", "barrier.level"].includes(path);
  const all = unverifiedTerms(null);
  expect(unverifiedOf(evaluateNote(all, nyse, closes, "2026-09-01"))).toEqual(UNVERIFIED_ORDER);
  expect(unverifiedOf(payoutSchedule(all, nyse))).toEqual(UNVERIFIED_ORDER.filter((path) => !isInitial(path)));
  expect(unverifiedOf(finalPayout(all, nyse, "19/20"))).toEqual(UNVERIFIED_ORDER.filter((path) => !isInitial(path)));
  expect(unverifiedOf(noteMetrics(all, closes, "2026-09-01"))).toEqual(UNVERIFIED_ORDER.filter(metricsReads));
  for (const path of UNVERIFIED_ORDER) {
    const terms = unverifiedTerms(path);
    expect(unverifiedOf(evaluateNote(terms, nyse, closes, "2026-09-01")), path).toEqual([path]);
    expect(unverifiedOf(payoutSchedule(terms, nyse)), path).toEqual(isInitial(path) ? [] : [path]);
    expect(unverifiedOf(finalPayout(terms, nyse, "19/20")), path).toEqual(isInitial(path) ? [] : [path]);
    expect(unverifiedOf(noteMetrics(terms, closes, "2026-09-01")), path).toEqual(metricsReads(path) ? [path] : []);
  }
});

test("an absent final valuation term is unverified and adds no final assumption", () => {
  const terms = withList(dropFinal(baseTerms()), [primary("2026-09-01"), primary("2026-12-01")]);
  const result = evaluated(evaluateNote(terms, nyse, [], "2026-08-31"));
  expect(result.unverified).toEqual(["dates.final_valuation"]);
  expect(result.provisional).toBe(true);
  expect(result.assumptions).toEqual([{ code: "per-1000-principal" }, { code: "cents-half-up" }, { code: "premium-months-by-index" }]);
});

test("an initial level the loader would refuse stops the call instead of leaving the member out", () => {
  const closes = uniform("2026-09-01", "19/20");
  for (const value of ["0", "0.000", "1e2"]) {
    const terms = listedTerms();
    terms.underlyings.members[2] = { ticker: "CHRL", initial: primary(value) };
    expect(() => evaluateNote(terms, nyse, closes, "2026-09-01"), value).toThrow("initial level did not solve");
    expect(() => noteMetrics(terms, closes, "2026-09-01"), value).toThrow("initial level did not solve");
    // With no close for that member the row has its reason, and nothing is computed from the level.
    const without = closes.filter((close) => close.ticker !== "CHRL");
    expect(evaluated(evaluateNote(terms, nyse, without, "2026-09-01")).reasons, value).toEqual([{ code: "close-missing", ticker: "CHRL" }]);
  }
});

test.each([
  { schedule: "listed", before: "2030-12-01", atOrAfter: ["2030-12-02", "2031-03-03", "2036-01-02"] },
  { schedule: "estimated", before: "2026-08-31", atOrAfter: ["2026-09-01", "2026-09-15", "2027-01-04"] },
])("an exhausted $schedule schedule cannot stay live when the final valuation is in conflict", ({ schedule, before, atOrAfter }) => {
  const conflict = (left: string, right: string) =>
    "  final_valuation:\n    status: conflict\n    candidates:\n" +
    [left, right].map((date) => `      - value: "${date}"\n        status: primary\n        source: supplement\n`).join("");
  const replaceFinal = (yaml: string, left: string, right: string) =>
    yaml.replace(/  final_valuation:\n(?:    [^\n]*\n){3}/, conflict(left, right));
  const dates = schedule === "listed" ? entryDates().slice(0, 18) : ["2026-09-01"];
  const yaml = schedule === "listed"
    ? replaceFinal(readGolden("g02-called-second").yaml, "2031-02-26", "2031-03-03")
      .replace(/  - value: "2031-02-26"\n    status: primary\n    source: "supplement"\n/, "")
    : replaceFinal(readGolden("g01-called-first").yaml, "2026-09-10", "2026-09-14")
      .replace("2031-03-03", "2026-09-15");
  const parsed = loadTerms(yaml, "synthetic.yaml");
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.errors));
  const closes = dates.flatMap((date) => uniform(date, "3/5"));
  const upcoming = evaluated(evaluateNote(parsed.terms, nyse, closes, before));
  expect(upcoming.schedule).toBe(schedule);
  expect(upcoming.status).toBe("live");
  expect(upcoming.reasons).toEqual([]);
  expect(upcoming.next).toEqual({
    kind: "call", scheduleIndex: dates.length - 1, date: atOrAfter[0], evidenced: true,
  });
  for (const asOf of atOrAfter) {
    const result = evaluated(evaluateNote(parsed.terms, nyse, closes, asOf));
    expect(result.rows.map((row) => row.date)).toEqual(dates);
    expect(result.status, asOf).toBe("unknown");
    expect(result.next).toBeNull();
    expect(result.payoutCents).toBeNull();
    expect(result.reasons).toEqual([{ code: "final-valuation-conflict" }]);
  }
});

test("mapping an exact match at the last representable date needs no later date", () => {
  const yaml = readGolden("g01-called-first").yaml
    .replace("2026-03-02", "9999-06-28")
    .replace("2026-03-04", "9999-06-30")
    .replace("2026-09-01", "9999-12-31")
    .replace("2031-02-26", "9999-12-31")
    .replace("2031-03-03", "9999-12-31")
    .replace("underlyings:\n", '  observation_schedule:\n  - value: "9999-12-31"\n    status: primary\n    source: supplement\nunderlyings:\n');
  const parsed = loadTerms(yaml, "synthetic.yaml");
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.errors));
  const pay = payoutSchedule(parsed.terms, nyse);
  expect(pay.kind).toBe("payouts");
  if (pay.kind !== "payouts") return;
  expect(pay.calls).toEqual([]);
  expect(pay.final).toEqual({
    date: "9999-12-31", evidenced: true, premiumMonths: 6,
    aboveCallCents: 104250, atOrAboveBarrierCents: 100000,
  });
});

test("the nearest cycle slot may fall after the last representable contract date", () => {
  const yaml = readGolden("g01-called-first").yaml
    .replace("2026-03-02", "9999-05-28")
    .replace("2026-03-04", "9999-06-01")
    .replace("2026-09-01", "9999-12-01")
    .replace("2031-02-26", "9999-12-31")
    .replace("2031-03-03", "9999-12-31")
    .replace('value: "quarterly"', 'value: "monthly"');
  const parsed = loadTerms(yaml, "synthetic.yaml");
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.errors));
  const pay = payoutSchedule(parsed.terms, nyse);
  expect(pay.kind).toBe("payouts");
  if (pay.kind !== "payouts") return;
  expect(pay.schedule).toBe("estimated");
  expect(pay.calls).toEqual([{
    scheduleIndex: 0, date: "9999-12-01", evidenced: true, premiumMonths: 6, payoutCents: 104250,
  }]);
  expect(pay.final).toEqual({
    date: "9999-12-31", evidenced: true, premiumMonths: 7,
    aboveCallCents: 104958, atOrAboveBarrierCents: 100000,
  });
});
