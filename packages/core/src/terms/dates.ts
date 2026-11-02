import type { DateFlag } from "./types.ts";

const MONTH_DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const WEEKDAY_TABLE = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function isRealDate(isoDate: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12) return false;
  const limit = month === 2 && isLeapYear(year) ? 29 : MONTH_DAYS[month];
  if (limit === undefined) return false;
  return day >= 1 && day <= limit;
}

/** 0 is Sunday. Computed from the Gregorian date alone. */
export function dayOfWeek(year: number, month: number, day: number): number {
  const shifted = month < 3 ? year - 1 : year;
  const table = WEEKDAY_TABLE[month - 1] ?? 0;
  const dow =
    (shifted + Math.floor(shifted / 4) - Math.floor(shifted / 100) + Math.floor(shifted / 400) + table + day) % 7;
  return dow < 0 ? dow + 7 : dow;
}

export function dateFlags(isoDate: string): DateFlag[] {
  if (!isRealDate(isoDate)) return [];
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return [];
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const dow = dayOfWeek(year, month, day);
  if (dow === 0 || dow === 6) return ["weekend"];
  return [];
}
