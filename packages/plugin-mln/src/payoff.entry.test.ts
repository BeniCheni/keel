import { expect, test } from "vitest";
import * as entry from "./index.ts";

test("the entry exports exactly the five names", () => {
  expect(Object.keys(entry).sort()).toEqual(["PRINCIPAL_CENTS", "evaluateNote", "finalPayout", "noteMetrics", "payoutSchedule"]);
  expect(entry.PRINCIPAL_CENTS).toBe(100000);
});
