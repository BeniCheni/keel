import { expect, test } from "vitest";
import { noteMetrics } from "./index.ts";
import { baseTerms } from "./test-support/access.test.ts";
import { closeValue, uniform } from "./test-support/closes.ts";

const DATE = "2026-09-01";

const TABLE: Array<{
  ratio: string;
  toBarrier: string;
  toCall: string | null;
  belowBarrier: boolean;
  atOrAboveCall: boolean;
  close?: string;
}> = [
  { ratio: "9/10", toBarrier: "1/3", toCall: "1/18", belowBarrier: false, atOrAboveCall: false },
  { ratio: "3/4", toBarrier: "1/5", toCall: "4/15", belowBarrier: false, atOrAboveCall: false },
  { ratio: "33/50", toBarrier: "1/11", toCall: "29/66", belowBarrier: false, atOrAboveCall: false },
  { ratio: "3/5", toBarrier: "0/1", toCall: "7/12", belowBarrier: false, atOrAboveCall: false },
  { ratio: "5999/10000", toBarrier: "0/1", toCall: "3501/5999", belowBarrier: true, atOrAboveCall: false },
  { ratio: "19/20", toBarrier: "7/19", toCall: "0/1", belowBarrier: false, atOrAboveCall: true },
  { ratio: "0/1", toBarrier: "0/1", toCall: null, belowBarrier: true, atOrAboveCall: false, close: "0.000001" },
];

test("noteMetrics on B matches the frozen distances", () => {
  for (const row of TABLE) {
    const closes =
      row.close === undefined
        ? uniform(DATE, row.ratio)
        : [closeValue("ALFA", DATE, row.close), ...uniform(DATE, "19/20").filter((close) => close.ticker !== "ALFA")];
    const result = noteMetrics(baseTerms(), closes, DATE);
    expect(result.kind, row.ratio).toBe("metrics");
    if (result.kind !== "metrics") continue;
    expect(result.worst.ratio, row.ratio).toBe(row.ratio);
    expect(result.toBarrier, row.ratio).toBe(row.toBarrier);
    expect(result.toCall, row.ratio).toBe(row.toCall);
    expect(result.belowBarrier, row.ratio).toBe(row.belowBarrier);
    expect(result.atOrAboveCall, row.ratio).toBe(row.atOrAboveCall);
    expect(result.date, row.ratio).toBe(DATE);
  }
});

test("no close on or before the date is no-close", () => {
  const result = noteMetrics(baseTerms(), [], DATE);
  expect(result).toEqual({ kind: "unavailable", reasons: [{ code: "no-close" }] });
});

test("a missing close on the latest date is not filled from an earlier date", () => {
  const earlier = uniform("2026-08-31", "9/10");
  const latest = uniform(DATE, "9/10").filter((close) => close.ticker !== "BRVO");
  const result = noteMetrics(baseTerms(), [...earlier, ...latest], DATE);
  expect(result.kind).toBe("unavailable");
  if (result.kind !== "unavailable") return;
  expect(result.reasons).toEqual([{ code: "close-missing", ticker: "BRVO" }]);
});
