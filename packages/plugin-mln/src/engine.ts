import type { ExchangeCalendar, Terms } from "@keel/core";
import { observationSchedule } from "@keel/core";
import { compareIso } from "./dates.ts";
import { chronologyReasons, planEvents, type PlannedEvent } from "./events.ts";
import {
  cmpFrac,
  divFrac,
  formatRatio,
  isZero,
  oneForOneCents,
  parseDecimal,
  parseRatio,
  PRINCIPAL_CENTS,
  principalPlusPremium,
  roundRatio,
  subFrac,
  type Frac,
  type Rounding,
} from "./fraction.ts";
import {
  checkInputs,
  checkTerms,
  checkVariants,
  evidencedStatus,
  hasValue,
  readFinal,
  solveMetrics,
  solveTerms,
  unverifiedPaths,
  type FinalState,
  type SolvedTerms,
} from "./read.ts";
import type {
  Assumption,
  Close,
  Evaluation,
  FinalPayout,
  FinalResult,
  MemberLevel,
  MemberReason,
  Metrics,
  MetricsResult,
  NextEvent,
  Outcome,
  PayoffReason,
  PayoutSchedule,
  Row,
  Unavailable,
  Unsupported,
} from "./types.ts";

function unavailable(reasons: PayoffReason[]): Unavailable {
  return { kind: "unavailable", reasons };
}

function assumptionsFor(finalState: FinalState, leftOut: number): Assumption[] {
  const assumptions: Assumption[] = [
    { code: "per-1000-principal" },
    { code: "cents-half-up" },
    { code: "premium-months-by-index" },
  ];
  if (finalState.known) assumptions.push({ code: "final-call-then-barrier" });
  if (finalState.known && leftOut >= 1) {
    assumptions.push({ code: "estimated-after-final-valuation-left-out", count: leftOut });
  }
  return assumptions;
}

function callMonths(solved: SolvedTerms, scheduleIndex: number): number {
  return solved.nonCall + scheduleIndex * solved.step;
}

function finalMonths(solved: SolvedTerms, k: number): number {
  return solved.nonCall + k * solved.step;
}

interface Prepared {
  solved: SolvedTerms;
  schedule: Extract<ReturnType<typeof observationSchedule>, { kind: "estimated" | "listed" }>;
  plan: ReturnType<typeof planEvents>;
  finalState: FinalState;
  unverified: string[];
  assumptions: Assumption[];
  calendar: ExchangeCalendar;
}

function prepare(
  terms: Terms,
  calendar: ExchangeCalendar,
  closes: readonly Close[] | null,
  asOf: string | null,
  ratio: string | null,
  scope: "all" | "payout",
  includeFinalGap: boolean,
): Prepared | Unavailable | Unsupported {
  const inputs = checkInputs(terms, closes, asOf, ratio);
  if (inputs.length > 0) return unavailable(inputs);
  const termReasons = checkTerms(terms, "all");
  if (termReasons.length > 0) return unavailable(termReasons);
  const variants = checkVariants(terms);
  if (variants.length > 0) return { kind: "unsupported", reasons: variants };
  const schedule = observationSchedule(terms, calendar);
  if (schedule.kind === "unavailable") {
    return unavailable([{ code: "schedule-unavailable", reasons: [...schedule.reasons] }]);
  }
  const solved = solveTerms(terms);
  if (solved === null) throw new Error("terms did not solve");
  const finalState = readFinal(terms);
  const plan = planEvents(terms, schedule, finalState);
  const chronology = chronologyReasons(terms, schedule, solved, finalState, plan, includeFinalGap);
  if (chronology.length > 0) return unavailable(chronology);
  return {
    solved,
    schedule,
    plan,
    finalState,
    unverified: unverifiedPaths(terms, scope),
    assumptions: assumptionsFor(finalState, plan.leftOut),
    calendar,
  };
}

interface Resolved {
  level: MemberLevel;
  reason: MemberReason | null;
  raw: Frac | null;
  rounded: Frac | null;
}

function resolveMember(
  ticker: string,
  initial: Terms["underlyings"]["members"][number]["initial"],
  closes: readonly Close[],
  date: string,
  rounding: Rounding,
): Resolved {
  const matching = closes.filter((close) => close.ticker === ticker && close.date === date);
  const sources = matching.map((close) => close.source);
  const distinct: string[] = [];
  const seen = new Set<string>();
  for (const close of matching) {
    const frac = parseDecimal(close.value);
    if (frac === null) continue;
    const key = formatRatio(frac);
    if (seen.has(key)) continue;
    seen.add(key);
    distinct.push(close.value);
  }
  const first = matching[0];
  let closeText: string | null = null;
  let closeReason: MemberReason | null = null;
  if (matching.length === 0) closeReason = { code: "close-missing", ticker };
  else if (distinct.length > 1) closeReason = { code: "close-conflict", ticker, values: distinct };
  else closeText = first === undefined ? null : first.value;

  let reason: MemberReason | null = null;
  if (initial.status === "unknown") reason = { code: "initial-unknown", ticker };
  else if (initial.status === "conflict") reason = { code: "initial-conflict", ticker };
  else if (closeReason !== null) reason = closeReason;

  let raw: Frac | null = null;
  let rounded: Frac | null = null;
  let ratio: RatioOrNull = null;
  if (reason === null && hasValue(initial) && closeText !== null) {
    const initialFrac = parseDecimal(initial.value);
    const closeFrac = parseDecimal(closeText);
    // The loader admits only a positive decimal here, and check 1 only a valid close. Anything else
    // has no ratio, and a member with no ratio and no reason would drop out of the worst-of.
    if (initialFrac === null || initialFrac.p === 0n) throw new Error("initial level did not solve");
    if (closeFrac === null) throw new Error("close did not solve");
    raw = divFrac(closeFrac, initialFrac);
    rounded = roundRatio(raw, rounding);
    ratio = formatRatio(rounded);
  }
  return { level: { ticker, close: closeText, sources, ratio }, reason, raw, rounded };
}

type RatioOrNull = string | null;

function settleCall(worst: Frac, callLevel: Frac, rate: number, months: number): { outcome: "called" | "not-called"; payoutCents: number | null } {
  if (cmpFrac(worst, callLevel) >= 0) return { outcome: "called", payoutCents: principalPlusPremium(rate, months) };
  return { outcome: "not-called", payoutCents: null };
}

function settleFinal(
  rounded: Frac,
  raw: Frac,
  callLevel: Frac,
  barrierLevel: Frac,
  rate: number,
  months: number,
): { outcome: "final-above-call" | "final-at-or-above-barrier" | "final-below-barrier"; payoutCents: number } {
  if (cmpFrac(rounded, callLevel) >= 0) {
    return { outcome: "final-above-call", payoutCents: principalPlusPremium(rate, months) };
  }
  if (cmpFrac(rounded, barrierLevel) >= 0) {
    return { outcome: "final-at-or-above-barrier", payoutCents: PRINCIPAL_CENTS };
  }
  return { outcome: "final-below-barrier", payoutCents: oneForOneCents(rounded) };
}

function buildRow(
  terms: Terms,
  event: PlannedEvent,
  index: number,
  closes: readonly Close[],
  solved: SolvedTerms,
  k: number,
): Row {
  const months = event.role === "final" ? finalMonths(solved, k) : callMonths(solved, event.scheduleIndex ?? 0);
  const resolved = terms.underlyings.members.map((member) =>
    resolveMember(member.ticker, member.initial, closes, event.date ?? "", solved.rounding),
  );
  const reasons = resolved.flatMap((member) => (member.reason === null ? [] : [member.reason]));
  let worst: { ticker: string; ratio: string } | null = null;
  let outcome: Outcome = "unknown";
  let payoutCents: number | null = null;
  if (reasons.length === 0) {
    let best = resolved[0];
    for (const member of resolved) {
      if (best === undefined || member.rounded === null || best.rounded === null) continue;
      if (cmpFrac(member.rounded, best.rounded) < 0) best = member;
    }
    if (best !== undefined && best.rounded !== null && best.raw !== null && best.level.ratio !== null) {
      worst = { ticker: best.level.ticker, ratio: best.level.ratio };
      if (event.role === "final") {
        const settled = settleFinal(best.rounded, best.raw, solved.callLevel, solved.barrierLevel, solved.rate, months);
        outcome = settled.outcome;
        payoutCents = settled.payoutCents;
      } else {
        const settled = settleCall(best.rounded, solved.callLevel, solved.rate, months);
        outcome = settled.outcome;
        payoutCents = settled.payoutCents;
      }
    }
  }
  const origin = event.origin === "listed" || event.origin === "final-valuation" ? event.origin : "stated";
  const status = event.status === null || event.status === "unknown" || event.status === "conflict" ? "primary" : event.status;
  return {
    index,
    kind: event.role === "final" ? "final" : "call",
    scheduleIndex: event.role === "final" ? null : event.scheduleIndex,
    date: event.date ?? "",
    dateOrigin: origin,
    dateStatus: status,
    premiumMonths: months,
    members: resolved.map((member) => member.level),
    worst,
    outcome,
    payoutCents,
    reasons,
  };
}

function nextFrom(event: PlannedEvent): NextEvent {
  const kind = event.role === "unknown" ? "observation" : event.role;
  return { kind, scheduleIndex: event.scheduleIndex, date: event.date, evidenced: event.evidenced };
}

function evaluated(
  prepared: Prepared,
  asOf: string,
  status: Evaluation["status"],
  rows: Row[],
  next: NextEvent | null,
  payoutCents: number | null,
  reasons: PayoffReason[],
): Evaluation {
  return {
    kind: "evaluated",
    asOf,
    calendar: prepared.calendar.id,
    schedule: prepared.schedule.kind,
    status,
    rows,
    next,
    payoutCents,
    reasons,
    unverified: prepared.unverified,
    provisional: prepared.unverified.length > 0,
    assumptions: prepared.assumptions,
  };
}

function runEvaluation(prepared: Prepared, terms: Terms, closes: readonly Close[], asOf: string): Evaluation {
  const rows: Row[] = [];
  for (const event of prepared.plan.events) {
    if (event.date === null) {
      const last = rows[rows.length - 1];
      const onLast = last !== undefined && asOf === last.date;
      const settlementOrder = compareIso(asOf, prepared.solved.settlement);
      const beforeSettlement = rows.length === 0 && settlementOrder !== null && settlementOrder <= 0;
      if (onLast || beforeSettlement) return evaluated(prepared, asOf, "live", rows, nextFrom(event), null, []);
      const index = event.scheduleIndex ?? 0;
      return evaluated(prepared, asOf, "unknown", rows, null, null, [{ code: "date-unknown", index }]);
    }
    const order = compareIso(event.date, asOf);
    if (order !== null && order > 0) return evaluated(prepared, asOf, "live", rows, nextFrom(event), null, []);
    if (event.role === "unknown") {
      const code = prepared.finalState.known ? "final-valuation-absent" : prepared.finalState.reason;
      return evaluated(prepared, asOf, "unknown", rows, null, null, [{ code }]);
    }
    if (!event.evidenced) {
      return evaluated(prepared, asOf, "unknown", rows, null, null, [
        { code: "estimated-date", scheduleIndex: event.scheduleIndex, date: event.date },
      ]);
    }
    const row = buildRow(terms, event, rows.length, closes, prepared.solved, prepared.plan.k);
    rows.push(row);
    if (row.outcome === "called" || row.outcome === "unknown") {
      const called = row.outcome === "called";
      return evaluated(prepared, asOf, called ? "called" : "unknown", rows, null, called ? row.payoutCents : null, called ? [] : row.reasons);
    }
  }
  const last = rows[rows.length - 1];
  if (last !== undefined && last.kind === "final" && last.outcome !== "unknown") {
    const maturityOrder = compareIso(asOf, prepared.solved.maturity);
    if (maturityOrder !== null && maturityOrder < 0) {
      const next: NextEvent = {
        kind: "maturity",
        scheduleIndex: null,
        date: prepared.solved.maturity,
        evidenced: evidencedStatus(prepared.solved.maturityStatus),
      };
      return evaluated(prepared, asOf, "final-fixed", rows, next, last.payoutCents, []);
    }
    return evaluated(prepared, asOf, "matured", rows, null, last.payoutCents, []);
  }
  if (!prepared.finalState.known) {
    return evaluated(prepared, asOf, "unknown", rows, null, null, [{ code: prepared.finalState.reason }]);
  }
  throw new Error("final event did not settle");
}

export function evaluateNote(
  terms: Terms,
  calendar: ExchangeCalendar,
  closes: readonly Close[],
  asOf: string,
): Evaluation | Unavailable | Unsupported {
  const prepared = prepare(terms, calendar, closes, asOf, null, "all", false);
  if ("kind" in prepared && (prepared.kind === "unavailable" || prepared.kind === "unsupported")) return prepared;
  if (!("plan" in prepared)) return prepared;
  return runEvaluation(prepared, terms, closes, asOf);
}

export function payoutSchedule(terms: Terms, calendar: ExchangeCalendar): PayoutSchedule | Unavailable | Unsupported {
  const prepared = prepare(terms, calendar, null, null, null, "payout", true);
  if (!("plan" in prepared)) return prepared;
  if (!prepared.finalState.known) return unavailable([{ code: prepared.finalState.reason }]);
  const calls = prepared.plan.events.filter((event) => event.role === "call").map((event) => {
    const months = callMonths(prepared.solved, event.scheduleIndex ?? 0);
    return {
      scheduleIndex: event.scheduleIndex ?? 0,
      date: event.date,
      evidenced: event.evidenced,
      premiumMonths: months,
      payoutCents: principalPlusPremium(prepared.solved.rate, months),
    };
  });
  const months = finalMonths(prepared.solved, prepared.plan.k);
  return {
    kind: "payouts",
    calendar: prepared.calendar.id,
    schedule: prepared.schedule.kind,
    calls,
    final: {
      date: prepared.finalState.date,
      evidenced: evidencedStatus(prepared.finalState.status),
      premiumMonths: months,
      aboveCallCents: principalPlusPremium(prepared.solved.rate, months),
      atOrAboveBarrierCents: PRINCIPAL_CENTS,
    },
    unverified: prepared.unverified,
    provisional: prepared.unverified.length > 0,
    assumptions: prepared.assumptions,
  };
}

export function finalPayout(terms: Terms, calendar: ExchangeCalendar, worstRatio: string): FinalResult {
  const prepared = prepare(terms, calendar, null, null, worstRatio, "payout", true);
  if (!("plan" in prepared)) return prepared;
  if (!prepared.finalState.known) return unavailable([{ code: prepared.finalState.reason }]);
  const parsed = parseRatio(worstRatio);
  if (parsed === null) return unavailable([{ code: "ratio-invalid" }]);
  const rounded = roundRatio(parsed, prepared.solved.rounding);
  const months = finalMonths(prepared.solved, prepared.plan.k);
  const settled = settleFinal(rounded, parsed, prepared.solved.callLevel, prepared.solved.barrierLevel, prepared.solved.rate, months);
  return {
    kind: "final",
    ratio: formatRatio(rounded),
    outcome: settled.outcome,
    premiumMonths: months,
    payoutCents: settled.payoutCents,
    unverified: prepared.unverified,
    provisional: prepared.unverified.length > 0,
    assumptions: prepared.assumptions,
  };
}

export function noteMetrics(terms: Terms, closes: readonly Close[], asOf: string): MetricsResult {
  const inputs = checkInputs(terms, closes, asOf, null);
  if (inputs.length > 0) return unavailable(inputs);
  const termReasons = checkTerms(terms, "metrics");
  if (termReasons.length > 0) return unavailable(termReasons);
  const solved = solveMetrics(terms);
  if (solved === null) throw new Error("metrics did not solve");
  let date: string | null = null;
  const names = new Set(terms.underlyings.members.map((member) => member.ticker));
  for (const close of closes) {
    if (!names.has(close.ticker) || close.date > asOf) continue;
    if (date === null || close.date > date) date = close.date;
  }
  if (date === null) return unavailable([{ code: "no-close" }]);
  const resolved = terms.underlyings.members.map((member) =>
    resolveMember(member.ticker, member.initial, closes, date, solved.rounding),
  );
  const reasons = resolved.flatMap((member) => (member.reason === null ? [] : [member.reason]));
  if (reasons.length > 0) return unavailable(reasons);
  let best = resolved[0];
  for (const member of resolved) {
    if (best === undefined || member.rounded === null || best.rounded === null) continue;
    if (cmpFrac(member.rounded, best.rounded) < 0) best = member;
  }
  if (best === undefined || best.rounded === null || best.level.ratio === null) return unavailable([{ code: "no-close" }]);
  const worst = best.rounded;
  const toBarrier = cmpFrac(worst, solved.barrierLevel) > 0 ? formatRatio(subFrac({ p: 1n, q: 1n }, divFrac(solved.barrierLevel, worst))) : "0/1";
  const toCall = isZero(worst)
    ? null
    : cmpFrac(worst, solved.callLevel) >= 0
      ? "0/1"
      : formatRatio(subFrac(divFrac(solved.callLevel, worst), { p: 1n, q: 1n }));
  const unverified = unverifiedPaths(terms, "metrics");
  return {
    kind: "metrics",
    asOf,
    date,
    members: resolved.map((member) => member.level),
    worst: { ticker: best.level.ticker, ratio: best.level.ratio },
    toBarrier,
    toCall,
    belowBarrier: cmpFrac(worst, solved.barrierLevel) < 0,
    atOrAboveCall: cmpFrac(worst, solved.callLevel) >= 0,
    unverified,
    provisional: unverified.length > 0,
  };
}
