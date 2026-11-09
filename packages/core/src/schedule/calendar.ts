import { dayOfWeek } from "../terms/dates.ts";
import { addDays, formatIso, monthLength, type Civil } from "./civil.ts";
import type { ExchangeCalendar, ExchangeClosure } from "./types.ts";

const FIRST_YEAR = 2026;
const LAST_YEAR = 2060;

const NEW_YEAR = "New Year's Day";
const MLK = "Martin Luther King, Jr. Day";
const WASHINGTON = "Washington's Birthday";
const GOOD_FRIDAY = "Good Friday";
const MEMORIAL = "Memorial Day";
const JUNETEENTH = "Juneteenth National Independence Day";
const INDEPENDENCE = "Independence Day";
const LABOR = "Labor Day";
const THANKSGIVING = "Thanksgiving Day";
const CHRISTMAS = "Christmas Day";

function nonNegativeMod(value: number, divisor: number): number {
  const remainder = value % divisor;
  return remainder < 0 ? remainder + divisor : remainder;
}

/** Gregorian Easter Sunday, Anonymous algorithm, for a positive year. */
function easterSunday(year: number): Civil {
  const yearMod19 = year % 19;
  const century = Math.floor(year / 100);
  const yearInCentury = year % 100;
  const centuryQuarter = Math.floor(century / 4);
  const centuryMod4 = century % 4;
  const leapSkip = Math.floor((century + 8) / 25);
  const centuryAdjust = Math.floor((century - leapSkip + 1) / 3);
  const epact = nonNegativeMod(19 * yearMod19 + century - centuryQuarter - centuryAdjust + 15, 30);
  const yearQuarter = Math.floor(yearInCentury / 4);
  const yearMod4 = yearInCentury % 4;
  const weekdayShift = nonNegativeMod(32 + 2 * centuryMod4 + 2 * yearQuarter - epact - yearMod4, 7);
  const correction = Math.floor((yearMod19 + 11 * epact + 22 * weekdayShift) / 451);
  const month = Math.floor((epact + weekdayShift - 7 * correction + 114) / 31);
  const day = nonNegativeMod(epact + weekdayShift - 7 * correction + 114, 31) + 1;
  return { year, month, day };
}

function nthWeekday(year: number, month: number, weekday: number, n: number): Civil {
  const first = dayOfWeek(year, month, 1);
  const delta = (weekday - first + 7) % 7;
  return { year, month, day: 1 + delta + (n - 1) * 7 };
}

function lastWeekday(year: number, month: number, weekday: number): Civil {
  const last = monthLength(year, month);
  const lastDow = dayOfWeek(year, month, last);
  const delta = (lastDow - weekday + 7) % 7;
  return { year, month, day: last - delta };
}

function observed(year: number, month: number, day: number): Civil {
  const dow = dayOfWeek(year, month, day);
  if (dow === 6) return addDays({ year, month, day }, -1);
  if (dow === 0) return addDays({ year, month, day }, 1);
  return { year, month, day };
}

/** A Saturday 1 January closes nothing. A Sunday 1 January closes the Monday after. */
function newYearsDay(year: number): Civil | null {
  const dow = dayOfWeek(year, 1, 1);
  if (dow === 6) return null;
  if (dow === 0) return { year, month: 1, day: 2 };
  return { year, month: 1, day: 1 };
}

function pushClosure(closures: ExchangeClosure[], civil: Civil | null, name: string): void {
  if (civil === null) return;
  closures.push({ date: formatIso(civil), name });
}

function closuresForYear(year: number): ExchangeClosure[] {
  const closures: ExchangeClosure[] = [];
  pushClosure(closures, newYearsDay(year), NEW_YEAR);
  pushClosure(closures, nthWeekday(year, 1, 1, 3), MLK);
  pushClosure(closures, nthWeekday(year, 2, 1, 3), WASHINGTON);
  pushClosure(closures, addDays(easterSunday(year), -2), GOOD_FRIDAY);
  pushClosure(closures, lastWeekday(year, 5, 1), MEMORIAL);
  pushClosure(closures, observed(year, 6, 19), JUNETEENTH);
  pushClosure(closures, observed(year, 7, 4), INDEPENDENCE);
  pushClosure(closures, nthWeekday(year, 9, 1, 1), LABOR);
  pushClosure(closures, nthWeekday(year, 11, 4, 4), THANKSGIVING);
  pushClosure(closures, observed(year, 12, 25), CHRISTMAS);
  return closures;
}

export function nyseRulesCalendar(): ExchangeCalendar {
  const closures: ExchangeClosure[] = [];
  for (let year = FIRST_YEAR; year <= LAST_YEAR; year += 1) {
    closures.push(...closuresForYear(year));
  }
  closures.sort((left, right) => (left.date < right.date ? -1 : left.date > right.date ? 1 : 0));
  return { id: "nyse-rules-1", fromYear: FIRST_YEAR, toYear: LAST_YEAR, closures };
}
