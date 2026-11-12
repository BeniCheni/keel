import { expect, test } from "vitest";
import { addMonthsIso, daysApart } from "./dates.ts";
import { nearestSlot, wholeMonthOffset } from "./events.ts";
import {
  formatRatio,
  parseDecimal,
  parseRatio,
  parseRounding,
  premiumCents,
  principalPlusPremium,
  ratiosEqual,
  roundRatio,
  type Rounding,
} from "./fraction.ts";

const ROUNDING_TABLE: Array<{ raw: string; cells: Record<string, string> }> = [
  {
    raw: "18999/20000",
    cells: {
      none: "18999/20000",
      "half-up-4dp": "19/20",
      "half-even-4dp": "19/20",
      "truncate-4dp": "9499/10000",
      "half-up-2dp": "19/20",
      "half-up-0dp": "1/1",
    },
  },
  {
    raw: "18997/20000",
    cells: {
      none: "18997/20000",
      "half-up-4dp": "9499/10000",
      "half-even-4dp": "4749/5000",
      "truncate-4dp": "4749/5000",
      "half-up-2dp": "19/20",
      "half-up-0dp": "1/1",
    },
  },
  {
    raw: "599999/1000000",
    cells: {
      none: "599999/1000000",
      "half-up-4dp": "3/5",
      "half-even-4dp": "3/5",
      "truncate-4dp": "5999/10000",
      "half-up-2dp": "3/5",
      "half-up-0dp": "1/1",
    },
  },
];

function roundingOf(text: string): Rounding {
  const parsed = parseRounding(text);
  if (parsed === null) throw new Error(text);
  return parsed;
}

test("performance rounding matches the frozen table", () => {
  for (const row of ROUNDING_TABLE) {
    const raw = parseRatio(row.raw);
    if (raw === null) throw new Error(row.raw);
    for (const [mode, expected] of Object.entries(row.cells)) {
      expect(formatRatio(roundRatio(raw, roundingOf(mode))), `${row.raw} ${mode}`).toBe(expected);
    }
  }
});

test("the half-cent premium rounds half up", () => {
  expect(premiumCents(2001, 7)).toBe(11673);
  expect(principalPlusPremium(2001, 7)).toBe(111673);
});

test("decimals with the same value are equal", () => {
  const left = parseDecimal("95.1");
  const right = parseDecimal("95.10");
  if (left === null || right === null) throw new Error("decimal");
  expect(ratiosEqual(left, right)).toBe(true);
});

test("the decimal grammar accepts one value and rejects one value", () => {
  expect(parseDecimal("95.1")).not.toBeNull();
  expect(parseDecimal("95.")).toBeNull();
});

test("the ratio grammar accepts one value and rejects one value", () => {
  expect(parseRatio("19/20")).not.toBeNull();
  expect(parseRatio("019/20")).toBeNull();
});

test("the rounding grammar accepts one value and rejects one value", () => {
  expect(parseRounding("half-up-4dp")).toEqual({ mode: "half-up", places: 4 });
  expect(parseRounding("half-up-7dp")).toBeNull();
});

test("a 16-digit initial level parses exactly", () => {
  expect(parseDecimal("9999999999.999999")).toEqual({ p: 9999999999999999n, q: 1000000n });
});

test("adding months clamps the day to the target month", () => {
  expect(addMonthsIso("2026-01-31", 1)).toBe("2026-02-28");
  expect(addMonthsIso("2024-01-31", 1)).toBe("2024-02-29");
  expect(addMonthsIso("2026-03-31", 1)).toBe("2026-04-30");
});

test("the nearest slot is the closest one, and a tie has none", () => {
  expect(nearestSlot("2026-09-01", 3, "2026-09-01")).toBe(0);
  expect(nearestSlot("2026-09-01", 3, "2026-12-01")).toBe(1);
  expect(nearestSlot("2026-09-01", 1, "2026-09-16")).toBeNull();
});

test("the whole-month offset of the base first call is 6", () => {
  expect(wholeMonthOffset("2026-03-04", "2026-09-01")).toBe(6);
  expect(daysApart(addMonthsIso("2026-03-04", 6) ?? "", "2026-09-01")).toBe(3);
  expect(daysApart(addMonthsIso("2026-03-04", 5) ?? "", "2026-09-01")).toBe(28);
});
