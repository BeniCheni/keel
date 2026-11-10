import type { Term, TermStatus } from "../terms/types.ts";

export interface ExchangeClosure {
  date: string;
  name: string;
}

export interface ExchangeCalendar {
  id: string;
  fromYear: number;
  toYear: number;
  /** Ascending by date, no duplicates, real dates. */
  closures: readonly ExchangeClosure[];
}

export type ScheduleFlag = "weekend" | "exchange-holiday" | "outside-calendar" | "invalid-date";

export interface ScheduleInput {
  path: string;
  status: TermStatus;
}

export interface StatedEntry {
  index: 0;
  date: string;
  origin: "stated";
  status: Exclude<TermStatus, "unknown" | "conflict">;
  flags: ScheduleFlag[];
}

export interface GeneratedEntry {
  index: number;
  date: string;
  unadjusted: string;
  origin: "generated";
  status: "estimate";
  label: "ESTIMATE";
  rule: string;
}

export interface EstimatedSchedule {
  kind: "estimated";
  calendar: string;
  inputs: ScheduleInput[];
  entries: (StatedEntry | GeneratedEntry)[];
}

export interface ListedEntry {
  index: number;
  date: string | null;
  term: Term<string>;
}

export interface ListedSchedule {
  kind: "listed";
  entries: ListedEntry[];
}

export type UnavailableReason =
  | { code: "input-unknown" | "input-conflict" | "input-invalid"; path: string }
  | { code: "anchor-after-maturity"; path: "dates.first_call_observation" }
  | { code: "outside-calendar"; date: string }
  | { code: "calendar-collision"; date: string };

export interface UnavailableSchedule {
  kind: "unavailable";
  reasons: UnavailableReason[];
}

export type ScheduleResult = EstimatedSchedule | ListedSchedule | UnavailableSchedule;

export type ScheduleDiffResult =
  | {
      kind: "diff";
      calendar: string;
      inBoth: string[];
      onlyEstimated: string[];
      onlyListed: string[];
      noKnownDate: number[];
    }
  | { kind: "no-list" }
  | UnavailableSchedule;
