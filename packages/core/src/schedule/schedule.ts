import { isRealDate } from "../terms/dates.ts";
import type { Term, TermStatus, Terms } from "../terms/types.ts";
import { addDays, addMonths, formatIso, parseIso, type Civil } from "./civil.ts";
import { scheduleDateFlags } from "./flags.ts";
import type {
  EstimatedSchedule,
  ExchangeCalendar,
  GeneratedEntry,
  ListedSchedule,
  ScheduleDiffResult,
  ScheduleResult,
  StatedEntry,
  UnavailableReason,
  UnavailableSchedule,
} from "./types.ts";

type ValuedStatus = Exclude<TermStatus, "unknown" | "conflict">;
type DateRead =
  | { ok: true; value: string; status: ValuedStatus }
  | { ok: false; code: "input-unknown" | "input-conflict" | "input-invalid" };
type FrequencyName = "monthly" | "quarterly" | "semiannual" | "annual";
type FrequencyRead =
  | { ok: true; value: FrequencyName; status: ValuedStatus }
  | { ok: false; code: "input-unknown" | "input-conflict" | "input-invalid" };

function readDate(term: Term<string>): DateRead {
  if (term.status === "unknown") return { ok: false, code: "input-unknown" };
  if (term.status === "conflict") return { ok: false, code: "input-conflict" };
  if (!isRealDate(term.value)) return { ok: false, code: "input-invalid" };
  return { ok: true, value: term.value, status: term.status };
}

function readFrequency(term: Term<string>): FrequencyRead {
  if (term.status === "unknown") return { ok: false, code: "input-unknown" };
  if (term.status === "conflict") return { ok: false, code: "input-conflict" };
  if (term.value !== "monthly" && term.value !== "quarterly" && term.value !== "semiannual" && term.value !== "annual") {
    return { ok: false, code: "input-invalid" };
  }
  return { ok: true, value: term.value, status: term.status };
}

function stepMonths(frequency: FrequencyName): number {
  if (frequency === "monthly") return 1;
  if (frequency === "quarterly") return 3;
  if (frequency === "semiannual") return 6;
  return 12;
}

function ruleFor(step: number, calendarId: string): string {
  const every = step === 1 ? "every month" : `every ${step} months`;
  return `Generated from the stated first call observation, ${every}, with closed days moved to the next open day on calendar ${calendarId}.`;
}

function yearOutside(year: number, calendar: ExchangeCalendar): boolean {
  return year < calendar.fromYear || year > calendar.toYear;
}

function blocked(civil: Civil, calendar: ExchangeCalendar): boolean {
  const flags = scheduleDateFlags(formatIso(civil), calendar);
  return flags.includes("weekend") || flags.includes("exchange-holiday");
}

function unavailable(reasons: UnavailableReason[]): UnavailableSchedule {
  return { kind: "unavailable", reasons };
}

function estimateSchedule(terms: Terms, calendar: ExchangeCalendar): EstimatedSchedule | UnavailableSchedule {
  const reasons: UnavailableReason[] = [];
  const anchor = readDate(terms.dates.first_call_observation);
  if (!anchor.ok) reasons.push({ code: anchor.code, path: "dates.first_call_observation" });
  const maturity = readDate(terms.dates.maturity);
  if (!maturity.ok) reasons.push({ code: maturity.code, path: "dates.maturity" });
  const frequency = readFrequency(terms.call.frequency);
  if (!frequency.ok) reasons.push({ code: frequency.code, path: "call.frequency" });
  if (!anchor.ok || !maturity.ok || !frequency.ok) return unavailable(reasons);
  if (anchor.value > maturity.value) {
    return unavailable([{ code: "anchor-after-maturity", path: "dates.first_call_observation" }]);
  }
  const anchorCivil = parseIso(anchor.value);
  if (anchorCivil === null) {
    return unavailable([{ code: "input-invalid", path: "dates.first_call_observation" }]);
  }
  const step = stepMonths(frequency.value);
  const stated: StatedEntry = {
    index: 0,
    date: anchor.value,
    origin: "stated",
    status: anchor.status,
    flags: scheduleDateFlags(anchor.value, calendar),
  };
  const entries: Array<StatedEntry | GeneratedEntry> = [stated];
  const rule = ruleFor(step, calendar.id);
  let previous = anchor.value;
  for (let k = 1; ; k += 1) {
    const unadjustedCivil = addMonths(anchorCivil, k * step);
    const unadjusted = formatIso(unadjustedCivil);
    if (unadjusted > maturity.value) break;
    let cursor = unadjustedCivil;
    let accepted: string | null = null;
    for (;;) {
      const current = formatIso(cursor);
      if (current > maturity.value) {
        accepted = null;
        break;
      }
      if (yearOutside(cursor.year, calendar)) {
        return unavailable([{ code: "outside-calendar", date: current }]);
      }
      if (blocked(cursor, calendar)) {
        cursor = addDays(cursor, 1);
        continue;
      }
      accepted = current;
      break;
    }
    if (accepted === null) continue;
    if (accepted <= previous) return unavailable([{ code: "calendar-collision", date: accepted }]);
    const generated: GeneratedEntry = {
      index: entries.length,
      date: accepted,
      unadjusted,
      origin: "generated",
      status: "estimate",
      label: "ESTIMATE",
      rule,
    };
    entries.push(generated);
    previous = accepted;
  }
  return {
    kind: "estimated",
    calendar: calendar.id,
    inputs: [
      { path: "dates.first_call_observation", status: anchor.status },
      { path: "dates.maturity", status: maturity.status },
      { path: "call.frequency", status: frequency.status },
    ],
    entries,
  };
}

function listedSchedule(list: readonly Term<string>[]): ListedSchedule {
  return {
    kind: "listed",
    entries: list.map((term, index) => ({
      index,
      date: term.status === "unknown" || term.status === "conflict" ? null : term.value,
      term,
    })),
  };
}

export function observationSchedule(terms: Terms, calendar: ExchangeCalendar): ScheduleResult {
  const list = terms.dates.observation_schedule;
  if (list !== undefined) return listedSchedule(list);
  return estimateSchedule(terms, calendar);
}

function byCodeUnit(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function sortedUnique(values: readonly string[]): string[] {
  const seen = new Set<string>();
  for (const value of values) seen.add(value);
  return [...seen].sort(byCodeUnit);
}

export function scheduleDiff(terms: Terms, calendar: ExchangeCalendar): ScheduleDiffResult {
  const list = terms.dates.observation_schedule;
  if (list === undefined) return { kind: "no-list" };
  const estimate = estimateSchedule(terms, calendar);
  if (estimate.kind !== "estimated") return estimate;
  const estimatedDates = estimate.entries.map((entry) => entry.date);
  const listedDates: string[] = [];
  const noKnownDate: number[] = [];
  for (let index = 0; index < list.length; index += 1) {
    const term = list[index];
    if (term === undefined) continue;
    if (term.status === "unknown" || term.status === "conflict") {
      noKnownDate.push(index);
      continue;
    }
    listedDates.push(term.value);
  }
  const estimatedSet = new Set(estimatedDates);
  const listedSet = new Set(listedDates);
  return {
    kind: "diff",
    calendar: calendar.id,
    inBoth: sortedUnique(estimatedDates.filter((date) => listedSet.has(date))),
    onlyEstimated: sortedUnique(estimatedDates.filter((date) => !listedSet.has(date))),
    onlyListed: sortedUnique(listedDates.filter((date) => !estimatedSet.has(date))),
    noKnownDate,
  };
}
