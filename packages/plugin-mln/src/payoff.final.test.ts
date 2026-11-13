import { expect, test } from "vitest";
import { finalPayout } from "./index.ts";
import { baseTerms, calendar } from "./test-support/access.test.ts";
import { primary } from "./test-support/edit.ts";

const TABLE: Array<{ ratio: string; outcome: string; cents: number }> = [
  { ratio: "3/2", outcome: "final-above-call", cents: 142500 },
  { ratio: "19/20", outcome: "final-above-call", cents: 142500 },
  { ratio: "9499/10000", outcome: "final-at-or-above-barrier", cents: 100000 },
  { ratio: "3/5", outcome: "final-at-or-above-barrier", cents: 100000 },
  { ratio: "5999/10000", outcome: "final-below-barrier", cents: 59990 },
  { ratio: "1571/5000", outcome: "final-below-barrier", cents: 31420 },
  { ratio: "0/1", outcome: "final-below-barrier", cents: 0 },
];

test("finalPayout on B matches the frozen table", () => {
  for (const row of TABLE) {
    const result = finalPayout(baseTerms(), calendar(), row.ratio);
    expect(result.kind, row.ratio).toBe("final");
    if (result.kind !== "final") continue;
    expect(result.outcome, row.ratio).toBe(row.outcome);
    expect(result.payoutCents, row.ratio).toBe(row.cents);
    expect(result.premiumMonths, row.ratio).toBe(60);
  }
});

test("with rounding none a half cent rounds up to 60000", () => {
  const terms = baseTerms();
  terms.underlyings.performance_rounding = primary("none");
  const result = finalPayout(terms, calendar(), "119999/200000");
  expect(result.kind).toBe("final");
  if (result.kind !== "final") return;
  expect(result.ratio).toBe("119999/200000");
  expect(result.outcome).toBe("final-below-barrier");
  expect(result.payoutCents).toBe(60000);
});

test("one-for-one uses the rounded ratio", () => {
  const result = finalPayout(baseTerms(), calendar(), "59994/100000");
  expect(result.kind).toBe("final");
  if (result.kind !== "final") return;
  expect(result.ratio).toBe("5999/10000");
  expect(result.outcome).toBe("final-below-barrier");
  expect(result.payoutCents).toBe(59990);
});
