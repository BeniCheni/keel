export interface Civil {
  year: number;
  month: number;
  day: number;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function digits(text: string): number {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    value = value * 10 + (code - 48);
  }
  return value;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function monthLength(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  const length = MONTH_DAYS[month];
  return length ?? 0;
}

export function isRealDate(isoDate: string): boolean {
  const match = ISO_DATE.exec(isoDate);
  if (match === null) return false;
  const yearText = match[1];
  const monthText = match[2];
  const dayText = match[3];
  if (yearText === undefined || monthText === undefined || dayText === undefined) return false;
  const year = digits(yearText);
  const month = digits(monthText);
  const day = digits(dayText);
  if (month < 1 || month > 12) return false;
  const limit = monthLength(year, month);
  return day >= 1 && day <= limit;
}

export function parseIso(isoDate: string): Civil | null {
  if (!isRealDate(isoDate)) return null;
  const match = ISO_DATE.exec(isoDate);
  if (match === null) return null;
  const yearText = match[1];
  const monthText = match[2];
  const dayText = match[3];
  if (yearText === undefined || monthText === undefined || dayText === undefined) return null;
  return { year: digits(yearText), month: digits(monthText), day: digits(dayText) };
}

function twoDigits(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

export function formatIso(civil: Civil): string {
  const year = `${civil.year}`.padStart(4, "0");
  return `${year}-${twoDigits(civil.month)}-${twoDigits(civil.day)}`;
}

export function compareIso(left: string, right: string): number | null {
  if (!isRealDate(left) || !isRealDate(right)) return null;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function serialFromCivil(year: number, month: number, day: number): number {
  const marchShift = Math.floor((14 - month) / 12);
  const shiftedYear = year + 4800 - marchShift;
  const shiftedMonth = month + 12 * marchShift - 3;
  return (
    day +
    Math.floor((153 * shiftedMonth + 2) / 5) +
    365 * shiftedYear +
    Math.floor(shiftedYear / 4) -
    Math.floor(shiftedYear / 100) +
    Math.floor(shiftedYear / 400) -
    32045
  );
}

function civilFromSerial(serial: number): Civil {
  const shifted = serial + 32044;
  const era = Math.floor((4 * shifted + 3) / 146097);
  const dayOfEra = shifted - Math.floor((146097 * era) / 4);
  const yearOfEra = Math.floor((4 * dayOfEra + 3) / 1461);
  const dayOfYear = dayOfEra - Math.floor((1461 * yearOfEra) / 4);
  const monthIndex = Math.floor((5 * dayOfYear + 2) / 153);
  const day = dayOfYear - Math.floor((153 * monthIndex + 2) / 5) + 1;
  const month = monthIndex + 3 - 12 * Math.floor(monthIndex / 10);
  const year = 100 * era + yearOfEra - 4800 + Math.floor(monthIndex / 10);
  return { year, month, day };
}

export function addDays(civil: Civil, days: number): Civil {
  return civilFromSerial(serialFromCivil(civil.year, civil.month, civil.day) + days);
}

export function addDaysIso(isoDate: string, days: number): string | null {
  const civil = parseIso(isoDate);
  if (civil === null) return null;
  return formatIso(addDays(civil, days));
}

export function addMonths(civil: Civil, months: number): Civil {
  const total = civil.year * 12 + (civil.month - 1) + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  const length = monthLength(year, month);
  const day = Math.min(civil.day, length);
  return { year, month, day };
}

export function addMonthsIso(isoDate: string, months: number): string | null {
  const civil = parseIso(isoDate);
  if (civil === null) return null;
  return formatIso(addMonths(civil, months));
}

export function daysApart(left: string, right: string): number | null {
  const a = parseIso(left);
  const b = parseIso(right);
  if (a === null || b === null) return null;
  return Math.abs(serialFromCivil(a.year, a.month, a.day) - serialFromCivil(b.year, b.month, b.day));
}
