import { dayOfWeek, isRealDate } from "../terms/dates.ts";
import type { Term, Terms } from "../terms/types.ts";
import { parseIso } from "./civil.ts";
import type { ExchangeCalendar, ScheduleFlag } from "./types.ts";

function closedOn(calendar: ExchangeCalendar, isoDate: string): boolean {
  for (const closure of calendar.closures) {
    if (closure.date === isoDate) return true;
  }
  return false;
}

export function scheduleDateFlags(isoDate: string, calendar: ExchangeCalendar): ScheduleFlag[] {
  if (!isRealDate(isoDate)) return ["invalid-date"];
  const civil = parseIso(isoDate);
  if (civil === null) return ["invalid-date"];
  const flags: ScheduleFlag[] = [];
  const dow = dayOfWeek(civil.year, civil.month, civil.day);
  if (dow === 0 || dow === 6) flags.push("weekend");
  const outside = civil.year < calendar.fromYear || civil.year > calendar.toYear;
  if (!outside && closedOn(calendar, isoDate)) flags.push("exchange-holiday");
  if (outside) flags.push("outside-calendar");
  return flags;
}

export function termDateFlags(terms: Terms, calendar: ExchangeCalendar): Record<string, ScheduleFlag[]> {
  const flags: Record<string, ScheduleFlag[]> = {};
  const add = (key: string, term: Term<string>): void => {
    if (term.status === "conflict") {
      for (let index = 0; index < term.candidates.length; index += 1) {
        const candidate = term.candidates[index];
        if (candidate !== undefined) add(`${key}.candidates[${index}]`, candidate);
      }
      return;
    }
    if (term.status === "unknown") return;
    flags[key] = scheduleDateFlags(term.value, calendar);
  };
  add("dates.trade", terms.dates.trade);
  add("dates.settlement", terms.dates.settlement);
  add("dates.maturity", terms.dates.maturity);
  add("dates.first_call_observation", terms.dates.first_call_observation);
  const list = terms.dates.observation_schedule;
  if (list !== undefined) {
    for (let index = 0; index < list.length; index += 1) {
      const item = list[index];
      if (item !== undefined) add(`dates.observation_schedule[${index}]`, item);
    }
  }
  return flags;
}
