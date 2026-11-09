import { expect, test } from "vitest";
import { nyseRulesCalendar, observationSchedule, scheduleDiff } from "../index.ts";
import { loadExample, loadMinimal } from "./samples.ts";

const ONLY_ESTIMATED = [
  "2027-03-01",
  "2027-06-01",
  "2027-09-01",
  "2027-12-01",
  "2028-03-01",
  "2028-06-01",
  "2028-09-01",
  "2028-12-01",
  "2029-03-01",
  "2029-06-01",
  "2029-09-04",
  "2029-12-03",
  "2030-03-01",
  "2030-06-03",
  "2030-09-03",
  "2030-12-02",
  "2031-03-03",
];

function listedTerms() {
  const terms = loadMinimal();
  terms.dates.observation_schedule = [
    { value: "2026-09-01", status: "primary", source: "supplement" },
    { value: "2027-03-02", status: "user" },
    { value: null, status: "unknown" },
    {
      status: "conflict",
      candidates: [
        { value: "2027-06-02", status: "primary", source: "supplement" },
        { value: "2027-06-01", status: "user" },
      ],
    },
  ];
  return terms;
}

test("a listed schedule keeps file order for primary, user, unknown and conflict", () => {
  const terms = listedTerms();
  const list = terms.dates.observation_schedule;
  const result = observationSchedule(terms, nyseRulesCalendar());
  expect(result.kind).toBe("listed");
  if (result.kind !== "listed" || list === undefined) return;
  expect(result.entries).toHaveLength(4);
  expect(result.entries.map((entry) => entry.index)).toEqual([0, 1, 2, 3]);
  expect(result.entries.map((entry) => entry.date)).toEqual(["2026-09-01", "2027-03-02", null, null]);
  expect(result.entries[0]?.term).toBe(list[0]);
  expect(result.entries[1]?.term).toBe(list[1]);
  expect(result.entries[2]?.term).toBe(list[2]);
  expect(result.entries[3]?.term).toEqual(list[3]);
  if (list[3]?.status === "conflict") {
    expect(list[3].candidates.map((candidate) => candidate.value)).toEqual(["2027-06-02", "2027-06-01"]);
  }
  expect(JSON.stringify(result)).not.toContain('"generated"');
  expect(JSON.stringify(result)).not.toContain("ESTIMATE");
});

test("a list stays listed when the three inputs are unknown", () => {
  const terms = listedTerms();
  terms.dates.first_call_observation = { value: null, status: "unknown" };
  terms.dates.maturity = { value: null, status: "unknown" };
  terms.call.frequency = { value: null, status: "unknown" };
  const result = observationSchedule(terms, nyseRulesCalendar());
  expect(result.kind).toBe("listed");
  if (result.kind !== "listed") return;
  expect(result.entries.map((entry) => entry.date)).toEqual(["2026-09-01", "2027-03-02", null, null]);
});

test("the diff matches case 1 against the mixed list", () => {
  const terms = loadMinimal();
  terms.dates.observation_schedule = [
    { value: "2026-09-01", status: "primary", source: "supplement" },
    { value: "2026-12-01", status: "primary", source: "supplement" },
    { value: "2027-03-02", status: "user" },
    {
      status: "conflict",
      candidates: [
        { value: "2027-06-01", status: "primary", source: "supplement" },
        { value: "2027-06-02", status: "primary", source: "supplement" },
      ],
    },
  ];
  expect(scheduleDiff(terms, nyseRulesCalendar())).toEqual({
    kind: "diff",
    calendar: "nyse-rules-1",
    inBoth: ["2026-09-01", "2026-12-01"],
    onlyEstimated: ONLY_ESTIMATED,
    onlyListed: ["2027-03-02"],
    noKnownDate: [3],
  });
});

test("scheduleDiff returns no-list when the terms have no observation schedule", () => {
  expect(scheduleDiff(loadMinimal(), nyseRulesCalendar())).toEqual({ kind: "no-list" });
});

test("scheduleDiff returns the unavailable estimate when a list is present", () => {
  const terms = loadExample();
  terms.dates.observation_schedule = [{ value: "2026-09-01", status: "primary", source: "supplement" }];
  expect(scheduleDiff(terms, nyseRulesCalendar())).toEqual({
    kind: "unavailable",
    reasons: [{ code: "input-conflict", path: "dates.maturity" }],
  });
});
