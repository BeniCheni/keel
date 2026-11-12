import type { ExchangeCalendar, Term, Terms, UnavailableReason } from "@keel/core";

export interface Close {
  ticker: string;
  date: string;
  value: string;
  source: string;
}

export type Ratio = string;

export type MemberReason =
  | { code: "close-missing"; ticker: string }
  | { code: "close-conflict"; ticker: string; values: string[] }
  | { code: "initial-unknown" | "initial-conflict"; ticker: string };

export type PayoffReason =
  | { code: "as-of-invalid" }
  | { code: "close-invalid"; index: number }
  | { code: "ratio-invalid" }
  | { code: "input-unknown" | "input-conflict" | "input-unevidenced"; path: string }
  | { code: "schedule-unavailable"; reasons: UnavailableReason[] }
  | { code: "final-valuation-absent" | "final-valuation-unknown" | "final-valuation-conflict" }
  | { code: "settlement-before-trade" | "first-call-before-settlement" }
  | { code: "final-valuation-before-first-call" | "final-valuation-after-maturity" | "final-valuation-off-cycle" }
  | { code: "observation-before-first-call" | "listed-after-maturity" | "listed-after-final-valuation" | "listed-off-cycle"; index: number }
  | { code: "non-call-months-mismatch" }
  | { code: "date-unknown"; index: number }
  | { code: "estimated-date"; scheduleIndex: number | null; date: string }
  | { code: "no-close" }
  | MemberReason;

export interface Unavailable {
  kind: "unavailable";
  reasons: PayoffReason[];
}

export interface Unsupported {
  kind: "unsupported";
  reasons: {
    code: "accrual-compound" | "barrier-daily-close" | "barrier-continuous" | "below-barrier-physical-delivery";
    path: string;
  }[];
}

export type Assumption =
  | { code: "per-1000-principal" }
  | { code: "cents-half-up" }
  | { code: "premium-months-by-index" }
  | { code: "final-call-then-barrier" }
  | { code: "estimated-after-final-valuation-left-out"; count: number };

export interface MemberLevel {
  ticker: string;
  close: string | null;
  sources: string[];
  ratio: Ratio | null;
}

export type Outcome =
  | "called"
  | "not-called"
  | "final-above-call"
  | "final-at-or-above-barrier"
  | "final-below-barrier"
  | "unknown";

type Status = Term<string>["status"];

export interface Row {
  index: number;
  kind: "call" | "final";
  scheduleIndex: number | null;
  date: string;
  dateOrigin: "stated" | "listed" | "final-valuation";
  dateStatus: Status;
  premiumMonths: number;
  members: MemberLevel[];
  worst: { ticker: string; ratio: Ratio } | null;
  outcome: Outcome;
  payoutCents: number | null;
  reasons: MemberReason[];
}

export interface NextEvent {
  kind: "call" | "final" | "observation" | "maturity";
  scheduleIndex: number | null;
  date: string | null;
  evidenced: boolean;
}

export interface Evaluation {
  kind: "evaluated";
  asOf: string;
  calendar: string;
  schedule: "estimated" | "listed";
  status: "live" | "called" | "final-fixed" | "matured" | "unknown";
  rows: Row[];
  next: NextEvent | null;
  payoutCents: number | null;
  reasons: PayoffReason[];
  unverified: string[];
  provisional: boolean;
  assumptions: Assumption[];
}

export interface PayoutRow {
  scheduleIndex: number;
  date: string | null;
  evidenced: boolean;
  premiumMonths: number;
  payoutCents: number;
}

export interface PayoutSchedule {
  kind: "payouts";
  calendar: string;
  schedule: "estimated" | "listed";
  calls: PayoutRow[];
  final: {
    date: string;
    evidenced: boolean;
    premiumMonths: number;
    aboveCallCents: number;
    atOrAboveBarrierCents: number;
  };
  unverified: string[];
  provisional: boolean;
  assumptions: Assumption[];
}

export interface FinalPayout {
  kind: "final";
  ratio: Ratio;
  outcome: "final-above-call" | "final-at-or-above-barrier" | "final-below-barrier";
  premiumMonths: number;
  payoutCents: number;
  unverified: string[];
  provisional: boolean;
  assumptions: Assumption[];
}

export interface Metrics {
  kind: "metrics";
  asOf: string;
  date: string;
  members: MemberLevel[];
  worst: { ticker: string; ratio: Ratio };
  toBarrier: Ratio;
  toCall: Ratio | null;
  belowBarrier: boolean;
  atOrAboveCall: boolean;
  unverified: string[];
  provisional: boolean;
}

export type EngineResult = Evaluation | Unavailable | Unsupported;
export type FinalResult = FinalPayout | Unavailable | Unsupported;
export type MetricsResult = Metrics | Unavailable;

export type { ExchangeCalendar, Term, Terms };
