import { isLeapYear, isRealDate } from "../terms/dates.ts";

export interface Civil {
  year: number;
  month: number;
  day: number;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function monthLength(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if (month === 4 || month === 6 || month === 9 || month === 11) return 30;
  return 31;
}

function twoDigits(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

export function formatIso(civil: Civil): string {
  return `${civil.year}-${twoDigits(civil.month)}-${twoDigits(civil.day)}`;
}

export function parseIso(isoDate: string): Civil | null {
  if (!isRealDate(isoDate)) return null;
  const match = ISO_DATE.exec(isoDate);
  if (match === null) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  return { year, month, day };
}

function serialFromCivil(year: number, month: number, day: number): number {
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

export function addMonths(civil: Civil, months: number): Civil {
  const total = civil.year * 12 + (civil.month - 1) + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  const length = monthLength(year, month);
  const day = Math.min(civil.day, length);
  return { year, month, day };
}
