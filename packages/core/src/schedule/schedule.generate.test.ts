import { expect, test } from "vitest";
import { nyseRulesCalendar, observationSchedule } from "../index.ts";
import type { Term } from "../terms/types.ts";
import { loadExample, loadMinimal } from "./samples.ts";
import type { ExchangeCalendar, ExchangeClosure, ScheduleFlag, ScheduleResult } from "./types.ts";

const NYSE = "nyse-rules-1";

function setValued(term: Term<string>, value: string): void {
  if (term.status === "unknown" || term.status === "conflict") throw new Error("valued term required");
  term.value = value;
}

function withInputs(first: string | null, maturity: string | null, frequency: string | null) {
  const terms = loadMinimal();
  if (first !== null) setValued(terms.dates.first_call_observation, first);
  if (maturity !== null) setValued(terms.dates.maturity, maturity);
  if (frequency !== null) setValued(terms.call.frequency, frequency);
  return terms;
}

function expectEstimated(
  actual: ScheduleResult,
  dates: string,
  flags: ScheduleFlag[],
  every: string,
  calendarId: string,
): void {
  expect(actual.kind).toBe("estimated");
  if (actual.kind !== "estimated") return;
  const parsed = dates.split(" ").map((token) => {
    const [date, unadjusted] = token.split("<");
    return { date: date ?? "", unadjusted: unadjusted ?? date ?? "" };
  });
  const rule = `Generated from the stated first call observation, ${every}, with closed days moved to the next open day on calendar ${calendarId}.`;
  expect(actual.calendar).toBe(calendarId);
  expect(actual.inputs).toEqual([
    { path: "dates.first_call_observation", status: "primary" },
    { path: "dates.maturity", status: "primary" },
    { path: "call.frequency", status: "primary" },
  ]);
  expect(actual.entries).toHaveLength(parsed.length);
  parsed.forEach((item, index) => {
    const entry = actual.entries[index];
    if (index === 0) {
      expect(entry).toEqual({ index: 0, date: item.date, origin: "stated", status: "primary", flags });
      return;
    }
    expect(entry).toEqual({
      index,
      date: item.date,
      unadjusted: item.unadjusted,
      origin: "generated",
      status: "estimate",
      label: "ESTIMATE",
      rule,
    });
  });
}

const ESTIMATED: Array<{
  id: number;
  first: string | null;
  maturity: string | null;
  frequency: string | null;
  flags: ScheduleFlag[];
  every: string;
  dates: string;
  calendarId: string;
  calendar: ExchangeCalendar | null;
}> = [
  {
    id: 1,
    first: null,
    maturity: null,
    frequency: null,
    flags: [],
    every: "every 3 months",
    dates:
      "2026-09-01 2026-12-01 2027-03-01 2027-06-01 2027-09-01 2027-12-01 2028-03-01 2028-06-01 2028-09-01 2028-12-01 2029-03-01 2029-06-01 2029-09-04<2029-09-01 2029-12-03<2029-12-01 2030-03-01 2030-06-03<2030-06-01 2030-09-03<2030-09-01 2030-12-02<2030-12-01 2031-03-03<2031-03-01",
    calendarId: NYSE,
    calendar: null,
  },
  {
    id: 2,
    first: "2027-01-31",
    maturity: "2027-07-30",
    frequency: "monthly",
    flags: ["weekend"],
    every: "every month",
    dates: "2027-01-31 2027-03-01<2027-02-28 2027-03-31 2027-04-30 2027-06-01<2027-05-31 2027-06-30",
    calendarId: NYSE,
    calendar: null,
  },
  {
    id: 3,
    first: "2028-02-29",
    maturity: "2033-02-28",
    frequency: "annual",
    flags: [],
    every: "every 12 months",
    dates: "2028-02-29 2029-02-28 2030-02-28 2031-02-28 2032-03-01<2032-02-29 2033-02-28",
    calendarId: NYSE,
    calendar: null,
  },
  {
    id: 4,
    first: "2026-12-25",
    maturity: "2028-12-26",
    frequency: "semiannual",
    flags: ["exchange-holiday"],
    every: "every 6 months",
    dates: "2026-12-25 2027-06-25 2027-12-27<2027-12-25 2028-06-26<2028-06-25 2028-12-26<2028-12-25",
    calendarId: NYSE,
    calendar: null,
  },
  {
    id: 5,
    first: "2026-12-25",
    maturity: "2028-12-25",
    frequency: "semiannual",
    flags: ["exchange-holiday"],
    every: "every 6 months",
    dates: "2026-12-25 2027-06-25 2027-12-27<2027-12-25 2028-06-26<2028-06-25",
    calendarId: NYSE,
    calendar: null,
  },
  {
    id: 6,
    first: "2026-04-03",
    maturity: "2027-01-04",
    frequency: "quarterly",
    flags: ["exchange-holiday"],
    every: "every 3 months",
    dates: "2026-04-03 2026-07-06<2026-07-03 2026-10-05<2026-10-03 2027-01-04<2027-01-03",
    calendarId: NYSE,
    calendar: null,
  },
  {
    id: 7,
    first: "2027-03-15",
    maturity: "2027-03-15",
    frequency: "monthly",
    flags: [],
    every: "every month",
    dates: "2027-03-15",
    calendarId: NYSE,
    calendar: null,
  },
  {
    id: 13,
    first: "2028-11-30",
    maturity: "2028-12-31",
    frequency: "monthly",
    flags: [],
    every: "every month",
    dates: "2028-11-30",
    calendarId: "test-2028",
    calendar: { id: "test-2028", fromYear: 2028, toYear: 2028, closures: [] },
  },
  {
    id: 17,
    first: "2025-12-15",
    maturity: "2026-02-15",
    frequency: "monthly",
    flags: ["outside-calendar"],
    every: "every month",
    dates: "2025-12-15 2026-01-15",
    calendarId: NYSE,
    calendar: null,
  },
  {
    id: 18,
    first: "2061-01-03",
    maturity: "2061-01-03",
    frequency: "monthly",
    flags: ["outside-calendar"],
    every: "every month",
    dates: "2061-01-03",
    calendarId: NYSE,
    calendar: null,
  },
];

for (const item of ESTIMATED) {
  test(`case ${item.id} matches the frozen schedule`, () => {
    const terms = withInputs(item.first, item.maturity, item.frequency);
    const calendar = item.calendar ?? nyseRulesCalendar();
    expectEstimated(observationSchedule(terms, calendar), item.dates, item.flags, item.every, item.calendarId);
  });
}

test("case 8 returns the maturity conflict and nothing else", () => {
  expect(observationSchedule(loadExample(), nyseRulesCalendar())).toEqual({
    kind: "unavailable",
    reasons: [{ code: "input-conflict", path: "dates.maturity" }],
  });
});

test("case 9 returns three unknown inputs in path order", () => {
  const terms = loadMinimal();
  terms.dates.first_call_observation = { value: null, status: "unknown" };
  terms.dates.maturity = { value: null, status: "unknown" };
  terms.call.frequency = { value: null, status: "unknown" };
  expect(observationSchedule(terms, nyseRulesCalendar())).toEqual({
    kind: "unavailable",
    reasons: [
      { code: "input-unknown", path: "dates.first_call_observation" },
      { code: "input-unknown", path: "dates.maturity" },
      { code: "input-unknown", path: "call.frequency" },
    ],
  });
});

test("case 10 returns anchor-after-maturity", () => {
  const terms = withInputs("2027-03-16", "2027-03-15", "monthly");
  expect(observationSchedule(terms, nyseRulesCalendar())).toEqual({
    kind: "unavailable",
    reasons: [{ code: "anchor-after-maturity", path: "dates.first_call_observation" }],
  });
});

test("case 11 returns outside-calendar for 2061-01-30", () => {
  const terms = withInputs("2060-11-30", "2061-01-31", "monthly");
  expect(observationSchedule(terms, nyseRulesCalendar())).toEqual({
    kind: "unavailable",
    reasons: [{ code: "outside-calendar", date: "2061-01-30" }],
  });
});

test("case 12 returns outside-calendar while rolling from 2028-12-30", () => {
  const terms = withInputs("2028-11-30", "2029-03-01", "monthly");
  const calendar: ExchangeCalendar = { id: "test-2028", fromYear: 2028, toYear: 2028, closures: [] };
  expect(observationSchedule(terms, calendar)).toEqual({
    kind: "unavailable",
    reasons: [{ code: "outside-calendar", date: "2029-01-01" }],
  });
});

function collisionCalendar(): ExchangeCalendar {
  const closures: ExchangeClosure[] = [];
  for (let stamp = Date.UTC(2027, 1, 1); stamp <= Date.UTC(2027, 2, 1); stamp += 86_400_000) {
    const when = new Date(stamp);
    const dow = when.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    closures.push({ date: when.toISOString().slice(0, 10), name: "Closed" });
  }
  return { id: "test-collision", fromYear: 2027, toYear: 2027, closures };
}

test("case 14 returns calendar-collision on 2027-03-02", () => {
  const terms = withInputs("2027-01-01", "2027-03-03", "monthly");
  expect(observationSchedule(terms, collisionCalendar())).toEqual({
    kind: "unavailable",
    reasons: [{ code: "calendar-collision", date: "2027-03-02" }],
  });
});

test("case 15 rejects an impossible first call date", () => {
  const terms = withInputs("2027-02-30", null, null);
  expect(observationSchedule(terms, nyseRulesCalendar())).toEqual({
    kind: "unavailable",
    reasons: [{ code: "input-invalid", path: "dates.first_call_observation" }],
  });
});

test("case 16 rejects a frequency outside the four named periods", () => {
  const terms = withInputs(null, null, "weekly");
  expect(observationSchedule(terms, nyseRulesCalendar())).toEqual({
    kind: "unavailable",
    reasons: [{ code: "input-invalid", path: "call.frequency" }],
  });
});

// Cases beyond the spec's frozen tables, added at Pass 1 of PR #30. Each expected value follows from the spec's steps and was derived by a separate implementation, not read back from this code.

test("a slot before the calendar's first year returns outside-calendar", () => {
  const terms = withInputs("2025-11-15", "2026-02-15", "monthly");
  expect(observationSchedule(terms, nyseRulesCalendar())).toEqual({
    kind: "unavailable",
    reasons: [{ code: "outside-calendar", date: "2025-12-15" }],
  });
});

test("a year below 1000 prints four digits and is still checked against the calendar", () => {
  const terms = withInputs("0999-01-15", "0999-12-31", "quarterly");
  expect(observationSchedule(terms, nyseRulesCalendar())).toEqual({
    kind: "unavailable",
    reasons: [{ code: "outside-calendar", date: "0999-04-15" }],
  });
  const covering: ExchangeCalendar = { id: "test-0999", fromYear: 999, toYear: 999, closures: [] };
  expectEstimated(
    observationSchedule(terms, covering),
    "0999-01-15 0999-04-15 0999-07-15 0999-10-15",
    [],
    "every 3 months",
    "test-0999",
  );
});

test("a slot past year 9999 is after maturity and ends the schedule", () => {
  const quarterly = withInputs("9999-12-01", "9999-12-31", "quarterly");
  expectEstimated(observationSchedule(quarterly, nyseRulesCalendar()), "9999-12-01", ["outside-calendar"], "every 3 months", NYSE);
  const monthly = withInputs("9999-10-31", "9999-12-31", "monthly");
  const covering: ExchangeCalendar = { id: "test-9999", fromYear: 9999, toYear: 9999, closures: [] };
  expectEstimated(
    observationSchedule(monthly, covering),
    "9999-10-31 9999-11-30 9999-12-31",
    ["weekend"],
    "every month",
    "test-9999",
  );
  const closed: ExchangeCalendar = {
    id: "test-9999-closed",
    fromYear: 9999,
    toYear: 9999,
    closures: [{ date: "9999-12-31", name: "Closed" }],
  };
  expectEstimated(observationSchedule(monthly, closed), "9999-10-31 9999-11-30", ["weekend"], "every month", "test-9999-closed");
});
