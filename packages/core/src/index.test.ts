import { expect, test } from "vitest";
import * as api from "./index.ts";

test("public API lists the terms and schedule functions", () => {
  expect(Object.keys(api)).toEqual([
    "dateFlags",
    "loadTerms",
    "verificationSummary",
    "nyseRulesCalendar",
    "scheduleDateFlags",
    "termDateFlags",
    "observationSchedule",
    "scheduleDiff",
  ]);
});
