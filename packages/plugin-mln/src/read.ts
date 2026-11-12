import type { Term, Terms } from "@keel/core";
import { isRealDate } from "./dates.ts";
import { levelRatio, parseDecimal, parseRounding, type Frac, type Rounding } from "./fraction.ts";
import type { Close, PayoffReason } from "./types.ts";

const SOURCE = /^[a-z0-9][a-z0-9-]{0,63}$/;

const CHECK_PATHS = [
  "dates.trade",
  "dates.settlement",
  "dates.maturity",
  "dates.first_call_observation",
  "underlyings.performance_rounding",
  "call.level",
  "call.non_call_months",
  "call.frequency",
  "premium.rate_per_year",
  "premium.accrual",
  "barrier.level",
  "barrier.observation",
  "barrier.below_barrier",
] as const;

type CheckPath = (typeof CHECK_PATHS)[number];

const DATE_PATHS = new Set<CheckPath>([
  "dates.trade",
  "dates.settlement",
  "dates.maturity",
  "dates.first_call_observation",
]);

const METRIC_PATHS = new Set<CheckPath>(["underlyings.performance_rounding", "call.level", "barrier.level"]);

const EVIDENCED = new Set(["primary", "document", "advisor", "user"]);

export type DatedStatus = Exclude<Term<string>["status"], "unknown" | "conflict">;

export function evidencedStatus(status: string): boolean {
  return EVIDENCED.has(status);
}

export function hasValue<T>(term: Term<T>): term is Exclude<Term<T>, { status: "unknown" } | { status: "conflict" }> {
  return term.status !== "unknown" && term.status !== "conflict";
}

function termAt(terms: Terms, path: CheckPath): Term<string> | Term<number> {
  if (path === "dates.trade") return terms.dates.trade;
  if (path === "dates.settlement") return terms.dates.settlement;
  if (path === "dates.maturity") return terms.dates.maturity;
  if (path === "dates.first_call_observation") return terms.dates.first_call_observation;
  if (path === "underlyings.performance_rounding") return terms.underlyings.performance_rounding;
  if (path === "call.level") return terms.call.level;
  if (path === "call.non_call_months") return terms.call.non_call_months;
  if (path === "call.frequency") return terms.call.frequency;
  if (path === "premium.rate_per_year") return terms.premium.rate_per_year;
  if (path === "premium.accrual") return terms.premium.accrual;
  if (path === "barrier.level") return terms.barrier.level;
  if (path === "barrier.observation") return terms.barrier.observation;
  return terms.barrier.below_barrier;
}

/** One finding per path, in path order. An unevidenced date takes that date's place. */
export function checkTerms(terms: Terms, scope: "all" | "metrics"): PayoffReason[] {
  const reasons: PayoffReason[] = [];
  for (const path of CHECK_PATHS) {
    if (scope === "metrics" && !METRIC_PATHS.has(path)) continue;
    const term = termAt(terms, path);
    if (term.status === "unknown") {
      reasons.push({ code: "input-unknown", path });
      continue;
    }
    if (term.status === "conflict") {
      reasons.push({ code: "input-conflict", path });
      continue;
    }
    if (DATE_PATHS.has(path) && (term.status === "estimate" || term.status === "assumed")) {
      reasons.push({ code: "input-unevidenced", path });
    }
  }
  return reasons;
}

export function checkVariants(terms: Terms): {
  code: "accrual-compound" | "barrier-daily-close" | "barrier-continuous" | "below-barrier-physical-delivery";
  path: string;
}[] {
  const reasons: {
    code: "accrual-compound" | "barrier-daily-close" | "barrier-continuous" | "below-barrier-physical-delivery";
    path: string;
  }[] = [];
  const accrual = terms.premium.accrual;
  if (hasValue(accrual) && accrual.value === "compound") {
    reasons.push({ code: "accrual-compound", path: "premium.accrual" });
  }
  const observation = terms.barrier.observation;
  if (hasValue(observation) && observation.value === "daily-close") {
    reasons.push({ code: "barrier-daily-close", path: "barrier.observation" });
  }
  if (hasValue(observation) && observation.value === "continuous") {
    reasons.push({ code: "barrier-continuous", path: "barrier.observation" });
  }
  const below = terms.barrier.below_barrier;
  if (hasValue(below) && below.value === "physical-delivery") {
    reasons.push({ code: "below-barrier-physical-delivery", path: "barrier.below_barrier" });
  }
  return reasons;
}

export function memberTickers(terms: Terms): Set<string> {
  const names = new Set<string>();
  for (const member of terms.underlyings.members) names.add(member.ticker);
  return names;
}

export function checkInputs(
  terms: Terms,
  closes: readonly Close[] | null,
  asOf: string | null,
  ratio: string | null,
): PayoffReason[] {
  const reasons: PayoffReason[] = [];
  if (asOf !== null && !isRealDate(asOf)) reasons.push({ code: "as-of-invalid" });
  if (closes !== null && asOf !== null) {
    const names = memberTickers(terms);
    for (let index = 0; index < closes.length; index += 1) {
      const close = closes[index];
      if (close === undefined) continue;
      if (!names.has(close.ticker) || close.date > asOf) continue;
      if (!isRealDate(close.date) || parseDecimal(close.value) === null || parseDecimal(close.value)?.p === 0n || !SOURCE.test(close.source)) {
        reasons.push({ code: "close-invalid", index });
      }
    }
  }
  if (ratio !== null && !/^(0|[1-9][0-9]*)\/([1-9][0-9]*)$/.test(ratio)) reasons.push({ code: "ratio-invalid" });
  return reasons;
}

export function stepMonths(frequency: string): number | null {
  if (frequency === "monthly") return 1;
  if (frequency === "quarterly") return 3;
  if (frequency === "semiannual") return 6;
  if (frequency === "annual") return 12;
  return null;
}

export interface SolvedTerms {
  trade: string;
  tradeStatus: DatedStatus;
  settlement: string;
  settlementStatus: DatedStatus;
  maturity: string;
  maturityStatus: DatedStatus;
  firstCall: string;
  firstCallStatus: DatedStatus;
  rounding: Rounding;
  callLevel: Frac;
  barrierLevel: Frac;
  nonCall: number;
  frequency: string;
  step: number;
  rate: number;
}

export function solveTerms(terms: Terms): SolvedTerms | null {
  const trade = terms.dates.trade;
  const settlement = terms.dates.settlement;
  const maturity = terms.dates.maturity;
  const first = terms.dates.first_call_observation;
  const roundingTerm = terms.underlyings.performance_rounding;
  const call = terms.call.level;
  const barrier = terms.barrier.level;
  const nonCall = terms.call.non_call_months;
  const frequency = terms.call.frequency;
  const rate = terms.premium.rate_per_year;
  if (!hasValue(trade) || !hasValue(settlement) || !hasValue(maturity) || !hasValue(first)) return null;
  if (!hasValue(roundingTerm) || !hasValue(call) || !hasValue(barrier) || !hasValue(nonCall) || !hasValue(frequency) || !hasValue(rate)) {
    return null;
  }
  const rounding = parseRounding(roundingTerm.value);
  const step = stepMonths(frequency.value);
  if (rounding === null || step === null) return null;
  return {
    trade: trade.value,
    tradeStatus: trade.status,
    settlement: settlement.value,
    settlementStatus: settlement.status,
    maturity: maturity.value,
    maturityStatus: maturity.status,
    firstCall: first.value,
    firstCallStatus: first.status,
    rounding,
    callLevel: levelRatio(call.value),
    barrierLevel: levelRatio(barrier.value),
    nonCall: nonCall.value,
    frequency: frequency.value,
    step,
    rate: rate.value,
  };
}

export type FinalState =
  | { known: true; date: string; status: DatedStatus }
  | { known: false; reason: "final-valuation-absent" | "final-valuation-unknown" | "final-valuation-conflict" };

export function readFinal(terms: Terms): FinalState {
  const term = terms.dates.final_valuation;
  if (term === undefined) return { known: false, reason: "final-valuation-absent" };
  if (term.status === "unknown") return { known: false, reason: "final-valuation-unknown" };
  if (term.status === "conflict") return { known: false, reason: "final-valuation-conflict" };
  return { known: true, date: term.value, status: term.status };
}

export function solveMetrics(terms: Terms): { rounding: Rounding; callLevel: Frac; barrierLevel: Frac } | null {
  const roundingTerm = terms.underlyings.performance_rounding;
  const call = terms.call.level;
  const barrier = terms.barrier.level;
  if (!hasValue(roundingTerm) || !hasValue(call) || !hasValue(barrier)) return null;
  const rounding = parseRounding(roundingTerm.value);
  if (rounding === null) return null;
  return { rounding, callLevel: levelRatio(call.value), barrierLevel: levelRatio(barrier.value) };
}

export function unverifiedPaths(terms: Terms, scope: "all" | "payout" | "metrics"): string[] {
  const paths: string[] = [];
  const wantHead = scope !== "metrics";
  const wantInitials = scope !== "payout";
  if (wantHead) {
    if (terms.dates.trade.status !== "primary") paths.push("dates.trade");
    if (terms.dates.settlement.status !== "primary") paths.push("dates.settlement");
    if (terms.dates.maturity.status !== "primary") paths.push("dates.maturity");
    if (terms.dates.first_call_observation.status !== "primary") paths.push("dates.first_call_observation");
    const finalTerm = terms.dates.final_valuation;
    if (finalTerm === undefined || finalTerm.status !== "primary") paths.push("dates.final_valuation");
    const schedule = terms.dates.observation_schedule;
    const scheduleVerified = schedule !== undefined && schedule.length > 0 && schedule.every((item) => item.status === "primary");
    if (!scheduleVerified) paths.push("dates.observation_schedule");
  }
  if (wantInitials) {
    terms.underlyings.members.forEach((member, index) => {
      if (member.initial.status !== "primary") paths.push(`underlyings.members[${index}].initial`);
    });
  }
  if (terms.underlyings.performance_rounding.status !== "primary") paths.push("underlyings.performance_rounding");
  if (terms.call.level.status !== "primary") paths.push("call.level");
  if (scope !== "metrics") {
    if (terms.call.non_call_months.status !== "primary") paths.push("call.non_call_months");
    if (terms.call.frequency.status !== "primary") paths.push("call.frequency");
    if (terms.premium.rate_per_year.status !== "primary") paths.push("premium.rate_per_year");
    if (terms.premium.accrual.status !== "primary") paths.push("premium.accrual");
  }
  if (terms.barrier.level.status !== "primary") paths.push("barrier.level");
  if (scope !== "metrics") {
    if (terms.barrier.observation.status !== "primary") paths.push("barrier.observation");
    if (terms.barrier.below_barrier.status !== "primary") paths.push("barrier.below_barrier");
  }
  if (scope === "metrics") {
    return paths.filter((path) => path.startsWith("underlyings.members[") || METRIC_PATHS.has(path as CheckPath));
  }
  return paths;
}
