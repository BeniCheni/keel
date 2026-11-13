import { expect, test } from "vitest";
import { payoutSchedule } from "./index.ts";
import { baseTerms, calendar, listedTerms } from "./test-support/access.test.ts";
import { primary } from "./test-support/edit.ts";

const CALL_CENTS = [
  104250, 106375, 108500, 110625, 112750, 114875, 117000, 119125, 121250, 123375, 125500, 127625, 129750, 131875,
  134000, 136125, 138250, 140375,
];

const MONTH_CENTS: Record<number, number> = {
  6: 110000,
  7: 111667,
  12: 120000,
  24: 140000,
  36: 160000,
  48: 180000,
  60: 200000,
};

test("payoutSchedule on B lists 18 calls and leaves the last estimated entry out", () => {
  const result = payoutSchedule(baseTerms(), calendar());
  expect(result.kind).toBe("payouts");
  if (result.kind !== "payouts") return;
  expect(result.calls).toHaveLength(18);
  result.calls.forEach((row, index) => {
    expect(row.scheduleIndex, String(index)).toBe(index);
    expect(row.premiumMonths, String(index)).toBe(6 + 3 * index);
    expect(row.payoutCents, String(index)).toBe(CALL_CENTS[index]);
    expect(row.evidenced, String(index)).toBe(index === 0);
  });
  expect(result.final).toEqual({
    date: "2031-02-26",
    evidenced: true,
    premiumMonths: 60,
    aboveCallCents: 142500,
    atOrAboveBarrierCents: 100000,
  });
  expect(result.unverified).toEqual(["dates.observation_schedule"]);
  expect(result.provisional).toBe(true);
  expect(result.assumptions).toEqual([
    { code: "per-1000-principal" },
    { code: "cents-half-up" },
    { code: "premium-months-by-index" },
    { code: "final-call-then-barrier" },
    { code: "estimated-after-final-valuation-left-out", count: 1 },
  ]);
});

test("payoutSchedule on L evidences every call", () => {
  const result = payoutSchedule(listedTerms(), calendar());
  expect(result.kind).toBe("payouts");
  if (result.kind !== "payouts") return;
  expect(result.calls).toHaveLength(18);
  result.calls.forEach((row, index) => {
    expect(row.premiumMonths, String(index)).toBe(6 + 3 * index);
    expect(row.payoutCents, String(index)).toBe(CALL_CENTS[index]);
    expect(row.evidenced, String(index)).toBe(true);
  });
  expect(result.final.premiumMonths).toBe(60);
  expect(result.final.aboveCallCents).toBe(142500);
  expect(result.unverified).toEqual([]);
  expect(result.provisional).toBe(false);
  expect(result.assumptions.some((item) => item.code === "estimated-after-final-valuation-left-out")).toBe(false);
});

test("a monthly rate of 2000 matches the month table and its 54 call rows", () => {
  const terms = baseTerms();
  terms.premium.rate_per_year = primary(2000);
  terms.call.frequency = primary("monthly");
  const result = payoutSchedule(terms, calendar());
  expect(result.kind).toBe("payouts");
  if (result.kind !== "payouts") return;
  expect(result.calls).toHaveLength(54);
  for (const [months, cents] of Object.entries(MONTH_CENTS)) {
    const month = Number(months);
    if (month === 60) expect(result.final.aboveCallCents).toBe(cents);
    else {
      const row = result.calls.find((call) => call.premiumMonths === month);
      expect(row?.payoutCents, months).toBe(cents);
    }
  }
  const last = result.calls[53];
  expect(last?.scheduleIndex).toBe(53);
  expect(last?.date).toBe("2031-02-03");
  expect(last?.premiumMonths).toBe(59);
  expect(last?.payoutCents).toBe(198333);
  expect(result.final.premiumMonths).toBe(60);
  expect(result.final.atOrAboveBarrierCents).toBe(100000);
});

test("rate 2001 at seven months pays 111673", () => {
  const terms = baseTerms();
  terms.premium.rate_per_year = primary(2001);
  terms.call.frequency = primary("monthly");
  const result = payoutSchedule(terms, calendar());
  expect(result.kind).toBe("payouts");
  if (result.kind !== "payouts") return;
  const row = result.calls.find((call) => call.premiumMonths === 7);
  expect(row?.payoutCents).toBe(111673);
});
