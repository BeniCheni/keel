import { expect, test } from "vitest";
import { noteMetrics } from "./index.ts";
import { baseTerms } from "./test-support/access.test.ts";
import { closeFor, closeValue, uniform } from "./test-support/closes.ts";
import type { Close } from "./types.ts";

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

function holeAt(closes: readonly Close[], at: number): Close[] {
  const holed = new Array<Close>(closes.length + 1);
  let source = 0;
  for (let index = 0; index < holed.length; index += 1) {
    if (index === at) continue;
    const close = closes[source];
    if (close === undefined) throw new Error("close");
    holed[index] = close;
    source += 1;
  }
  return holed;
}

test("noteMetrics skips a hole in closes", () => {
  const closes = uniform(DATE, "9/10");
  const plain = noteMetrics(baseTerms(), closes, DATE);
  expect(plain.kind).toBe("metrics");
  const before = holeAt(closes, 0);
  const between = holeAt(closes, 2);
  const after = holeAt(closes, closes.length);
  expect(Object.hasOwn(before, 0)).toBe(false);
  expect(Object.hasOwn(between, 2)).toBe(false);
  expect(Object.hasOwn(after, closes.length)).toBe(false);
  expect(noteMetrics(baseTerms(), before, DATE)).toEqual(plain);
  expect(noteMetrics(baseTerms(), between, DATE)).toEqual(plain);
  expect(noteMetrics(baseTerms(), after, DATE)).toEqual(plain);
  expect(noteMetrics(baseTerms(), new Array(1), DATE)).toEqual(noteMetrics(baseTerms(), [], DATE));
  const invalid = new Array<Close>(2);
  invalid[1] = closeValue("ALFA", DATE, "0");
  expect(Object.hasOwn(invalid, 0)).toBe(false);
  expect(noteMetrics(baseTerms(), invalid, DATE)).toEqual({
    kind: "unavailable",
    reasons: [{ code: "close-invalid", index: 1 }],
  });
});

test("noteMetrics takes its date from a close at any index, with or without a hole before it", () => {
  const earlier = uniform("2026-08-31", "9/10");
  const lone = closeFor("ALFA", DATE, "9/10");
  // The lone close sets the date, so the other members have no close on it, and nothing falls back.
  const onDate = {
    kind: "unavailable",
    reasons: ["BRVO", "CHRL", "DLTA"].map((ticker) => ({ code: "close-missing", ticker })),
  };
  expect(noteMetrics(baseTerms(), earlier, DATE).kind).toBe("metrics");
  for (let at = 0; at <= earlier.length; at += 1) {
    const dense = [...earlier.slice(0, at), lone, ...earlier.slice(at)];
    expect(dense[at], String(at)).toBe(lone);
    expect(noteMetrics(baseTerms(), dense, DATE), String(at)).toEqual(onDate);
    const holed = holeAt(dense, at);
    expect(Object.hasOwn(holed, at), String(at)).toBe(false);
    expect(holed[at + 1], String(at)).toBe(lone);
    expect(noteMetrics(baseTerms(), holed, DATE), String(at)).toEqual(onDate);
  }
});
