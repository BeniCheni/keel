import { formatDecimal, mulFrac, parseDecimal, parseRatio } from "../fraction.ts";
import type { Close } from "../types.ts";

const INITIALS: Record<string, string> = {
  ALFA: "100.25",
  BRVO: "80.5",
  CHRL: "120",
  DLTA: "95.125",
};

export const MEMBER_ORDER = ["ALFA", "BRVO", "CHRL", "DLTA"] as const;

export function closeValue(ticker: string, date: string, value: string, source = "synthetic-close"): Close {
  return { ticker, date, value, source };
}

export function closeFor(ticker: string, date: string, ratio: string, source = "synthetic-close"): Close {
  const initial = parseDecimal(INITIALS[ticker] ?? "");
  const frac = parseRatio(ratio);
  if (initial === null || frac === null) throw new Error("close");
  return closeValue(ticker, date, formatDecimal(mulFrac(initial, frac), 6), source);
}

export function uniform(date: string, ratio: string, source = "synthetic-close"): Close[] {
  return MEMBER_ORDER.map((ticker) => closeFor(ticker, date, ratio, source));
}
