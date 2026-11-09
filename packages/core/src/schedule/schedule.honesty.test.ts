import { expect, test } from "vitest";
import { nyseRulesCalendar, observationSchedule, scheduleDateFlags, scheduleDiff, termDateFlags } from "../index.ts";
import { verificationSummary } from "../terms/summary.ts";
import type { Term, Terms } from "../terms/types.ts";
import { loadExample, loadMinimal } from "./samples.ts";

const VALUED = ["primary", "document", "advisor", "user", "estimate", "assumed"] as const;

function setValued(term: Term<string>, value: string): void {
  if (term.status === "unknown" || term.status === "conflict") throw new Error("valued term required");
  term.value = value;
}

function valued(value: string, status: (typeof VALUED)[number]): Term<string> {
  if (status === "primary" || status === "document" || status === "advisor") {
    return { value, status, source: "supplement" };
  }
  if (status === "user") return { value, status: "user" };
  if (status === "estimate") return { value, status: "estimate", rule: "Recorded for the status check." };
  return { value, status: "assumed", note: "Recorded for the status check." };
}

function conflict(first: string, second: string): Term<string> {
  return {
    status: "conflict",
    candidates: [
      { value: first, status: "primary", source: "supplement" },
      { value: second, status: "primary", source: "supplement" },
    ],
  };
}

test("generated entries stay estimates and name the calendar", () => {
  const calendar = nyseRulesCalendar();
  for (const status of VALUED) {
    const terms = loadMinimal();
    terms.dates.first_call_observation = valued("2026-09-01", status);
    terms.dates.maturity = valued("2031-03-03", status);
    terms.call.frequency = valued("quarterly", status);
    const result = observationSchedule(terms, calendar);
    expect(result.kind, status).toBe("estimated");
    if (result.kind !== "estimated") continue;
    const generated = result.entries.filter((entry) => entry.origin === "generated");
    expect(generated.length, status).toBeGreaterThan(0);
    for (const entry of generated) {
      expect(entry.status, status).toBe("estimate");
      expect(entry.label, status).toBe("ESTIMATE");
      expect(entry.rule, status).toContain(calendar.id);
    }
  }
});

test("a conflict generates nothing and names no candidate", () => {
  const calendar = nyseRulesCalendar();
  const rows: Array<{ apply: (terms: Terms) => void; path: string; first: string; second: string }> = [
    {
      path: "dates.first_call_observation",
      first: "2024-01-02",
      second: "2024-03-04",
      apply: (terms) => {
        terms.dates.first_call_observation = conflict("2024-01-02", "2024-03-04");
      },
    },
    {
      path: "dates.maturity",
      first: "2032-01-02",
      second: "2032-03-04",
      apply: (terms) => {
        terms.dates.maturity = conflict("2032-01-02", "2032-03-04");
      },
    },
    {
      path: "call.frequency",
      first: "weekly",
      second: "biweekly",
      apply: (terms) => {
        terms.call.frequency = conflict("weekly", "biweekly");
      },
    },
  ];
  for (const row of rows) {
    const terms = loadMinimal();
    row.apply(terms);
    const result = observationSchedule(terms, calendar);
    expect(result, row.path).toEqual({ kind: "unavailable", reasons: [{ code: "input-conflict", path: row.path }] });
    const text = JSON.stringify(result);
    expect(text, row.path).not.toContain(row.first);
    expect(text, row.path).not.toContain(row.second);
  }
});

test("an unknown input generates nothing", () => {
  const calendar = nyseRulesCalendar();
  const rows: Array<{ path: string; apply: (terms: Terms) => void }> = [
    {
      path: "dates.first_call_observation",
      apply: (terms) => {
        terms.dates.first_call_observation = { value: null, status: "unknown" };
      },
    },
    {
      path: "dates.maturity",
      apply: (terms) => {
        terms.dates.maturity = { value: null, status: "unknown" };
      },
    },
    {
      path: "call.frequency",
      apply: (terms) => {
        terms.call.frequency = { value: null, status: "unknown" };
      },
    },
  ];
  for (const row of rows) {
    const terms = loadMinimal();
    row.apply(terms);
    expect(observationSchedule(terms, calendar), row.path).toEqual({
      kind: "unavailable",
      reasons: [{ code: "input-unknown", path: row.path }],
    });
  }
});

test("a listed conflict keeps candidates in file order and a listed unknown has no date", () => {
  const terms = loadMinimal();
  terms.dates.observation_schedule = [
    { value: null, status: "unknown" },
    {
      status: "conflict",
      candidates: [
        { value: "2027-06-02", status: "primary", source: "supplement" },
        { value: "2027-06-01", status: "primary", source: "supplement" },
      ],
    },
  ];
  const result = observationSchedule(terms, nyseRulesCalendar());
  expect(result.kind).toBe("listed");
  if (result.kind !== "listed") return;
  expect(result.entries[0]?.date).toBeNull();
  expect(result.entries[1]?.date).toBeNull();
  expect(result.entries[1]?.term).toEqual({
    status: "conflict",
    candidates: [
      { value: "2027-06-02", status: "primary", source: "supplement" },
      { value: "2027-06-01", status: "primary", source: "supplement" },
    ],
  });
});

test("observationSchedule, scheduleDiff and termDateFlags do not change terms", () => {
  const calendar = nyseRulesCalendar();
  for (const terms of [loadMinimal(), loadExample()]) {
    const before = structuredClone(terms);
    observationSchedule(terms, calendar);
    scheduleDiff(terms, calendar);
    termDateFlags(terms, calendar);
    expect(terms).toEqual(before);
  }
});

test("a generated schedule does not verify the observation list", () => {
  const terms = loadMinimal();
  const before = verificationSummary(terms);
  observationSchedule(terms, nyseRulesCalendar());
  const after = verificationSummary(terms);
  expect(after).toEqual(before);
  expect(after.unverified).toContain("dates.observation_schedule");
  expect(terms.dates.observation_schedule).toBeUndefined();
});

test("a date outside the calendar is never open", () => {
  const calendar = nyseRulesCalendar();
  for (const date of ["2025-12-25", "2025-12-27", "2025-01-06", "2061-01-03", "2061-07-04", "1999-12-31"]) {
    const flags = scheduleDateFlags(date, calendar);
    expect(flags, date).toContain("outside-calendar");
    expect(flags, date).not.toContain("exchange-holiday");
  }
  const terms = loadMinimal();
  setValued(terms.dates.first_call_observation, "2060-11-30");
  setValued(terms.dates.maturity, "2061-01-31");
  setValued(terms.call.frequency, "monthly");
  const result = observationSchedule(terms, calendar);
  expect(result).toEqual({ kind: "unavailable", reasons: [{ code: "outside-calendar", date: "2061-01-30" }] });
});

test("a stated anchor on a closed day stays stated", () => {
  const calendar = nyseRulesCalendar();
  const holiday = loadMinimal();
  setValued(holiday.dates.first_call_observation, "2026-12-25");
  setValued(holiday.dates.maturity, "2028-12-26");
  setValued(holiday.call.frequency, "semiannual");
  const holidayResult = observationSchedule(holiday, calendar);
  expect(holidayResult.kind).toBe("estimated");
  if (holidayResult.kind === "estimated") {
    expect(holidayResult.entries[0]).toMatchObject({ date: "2026-12-25", origin: "stated", flags: ["exchange-holiday"] });
  }
  expect(termDateFlags(holiday, calendar)["dates.first_call_observation"]).toEqual(["exchange-holiday"]);

  const weekend = loadMinimal();
  setValued(weekend.dates.first_call_observation, "2027-01-31");
  setValued(weekend.dates.maturity, "2027-07-30");
  setValued(weekend.call.frequency, "monthly");
  const weekendResult = observationSchedule(weekend, calendar);
  expect(weekendResult.kind).toBe("estimated");
  if (weekendResult.kind === "estimated") {
    expect(weekendResult.entries[0]).toMatchObject({ date: "2027-01-31", origin: "stated", flags: ["weekend"] });
  }
  expect(termDateFlags(weekend, calendar)["dates.first_call_observation"]).toEqual(["weekend"]);
});

test("an invalid date is never open", () => {
  const calendar = nyseRulesCalendar();
  for (const date of ["2027-02-30", "2026-13-01", "2026-00-10", "nope", ""]) {
    expect(scheduleDateFlags(date, calendar), date).toEqual(["invalid-date"]);
  }
  const terms = loadMinimal();
  setValued(terms.dates.first_call_observation, "2027-02-30");
  expect(observationSchedule(terms, calendar)).toEqual({
    kind: "unavailable",
    reasons: [{ code: "input-invalid", path: "dates.first_call_observation" }],
  });
});
