import type { EstimatedSchedule, ListedSchedule, Term, Terms } from "@keel/core";
import { addMonths, compareIso, parseIso, serialFromCivil } from "./dates.ts";
import type { PayoffReason } from "./types.ts";
import { evidencedStatus, readFinal, type DatedStatus, type FinalState, type SolvedTerms } from "./read.ts";

export interface PlannedEvent {
  role: "call" | "final" | "unknown";
  scheduleIndex: number | null;
  date: string | null;
  origin: "stated" | "generated" | "listed" | "final-valuation";
  status: DatedStatus | "unknown" | "conflict" | null;
  evidenced: boolean;
}

export interface EventPlan {
  events: PlannedEvent[];
  leftOut: number;
  k: number;
}

export function nearestSlot(anchor: string, step: number, date: string): number | null {
  const start = parseIso(anchor);
  const target = parseIso(date);
  if (step <= 0 || start === null || target === null) return null;
  const targetDay = serialFromCivil(target.year, target.month, target.day);
  const monthOffset = (target.year - start.year) * 12 + target.month - start.month;
  const center = Math.max(0, Math.floor(monthOffset / step));
  let bestIndex = 0;
  let bestDistance = Infinity;
  let tied = false;
  // Clamping keeps slots in their own month. The nearest slot is in this month or adjacent cycles.
  for (let index = Math.max(0, center - 1); index <= center + 1; index += 1) {
    const slot = addMonths(start, index * step);
    const distance = Math.abs(serialFromCivil(slot.year, slot.month, slot.day) - targetDay);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
      tied = false;
    } else if (distance === bestDistance) {
      tied = true;
    }
  }
  return tied ? null : bestIndex;
}

export function wholeMonthOffset(settlement: string, target: string): number | null {
  return nearestSlot(settlement, 1, target);
}

function evidencedDate(origin: PlannedEvent["origin"], status: PlannedEvent["status"], date: string | null): boolean {
  if (date === null || status === null) return false;
  if (origin === "generated") return false;
  return evidencedStatus(status);
}

function planned(
  role: PlannedEvent["role"],
  scheduleIndex: number | null,
  date: string | null,
  origin: PlannedEvent["origin"],
  status: PlannedEvent["status"],
): PlannedEvent {
  return { role, scheduleIndex, date, origin, status, evidenced: evidencedDate(origin, status, date) };
}

function beforeEveryCandidate(date: string, term: Term<string>): boolean {
  if (term.status !== "conflict") return false;
  if (term.candidates.length === 0) return false;
  for (const candidate of term.candidates) {
    const order = compareIso(date, candidate.value);
    if (order === null || order >= 0) return false;
  }
  return true;
}

function laterEvidenced(entries: ListedSchedule["entries"], index: number): boolean {
  for (let later = index + 1; later < entries.length; later += 1) {
    const entry = entries[later];
    if (entry === undefined || entry.date === null) continue;
    if (evidencedStatus(entry.term.status)) return true;
  }
  return false;
}

function fromListed(entry: ListedSchedule["entries"][number], role: "call" | "unknown"): PlannedEvent {
  const status = entry.term.status;
  return planned(role, entry.index, entry.date, "listed", status);
}

function fromEstimated(
  entry: EstimatedSchedule["entries"][number],
  role: "call" | "unknown",
): PlannedEvent {
  const origin = entry.origin === "stated" ? "stated" : "generated";
  return planned(role, entry.index, entry.date, origin, entry.status);
}

export function planEvents(terms: Terms, schedule: EstimatedSchedule | ListedSchedule, finalState: FinalState): EventPlan {
  const events: PlannedEvent[] = [];
  let leftOut = 0;
  let k = 0;
  const finalTerm = terms.dates.final_valuation;
  const pushCall = (event: PlannedEvent): void => {
    events.push(event);
    k += 1;
  };

  if (schedule.kind === "estimated") {
    for (const entry of schedule.entries) {
      if (finalState.known) {
        const order = compareIso(entry.date, finalState.date);
        if (order === null) continue;
        if (order < 0) pushCall(fromEstimated(entry, "call"));
        else if (order > 0) leftOut += 1;
      } else if (finalState.reason === "final-valuation-conflict" && finalTerm !== undefined && beforeEveryCandidate(entry.date, finalTerm)) {
        pushCall(fromEstimated(entry, "call"));
      } else {
        events.push(fromEstimated(entry, "unknown"));
      }
    }
  } else if (finalState.known) {
    let onFinal = -1;
    for (let index = 0; index < schedule.entries.length; index += 1) {
      const entry = schedule.entries[index];
      if (entry !== undefined && entry.date === finalState.date) {
        onFinal = index;
        break;
      }
    }
    if (onFinal >= 0) {
      for (let index = 0; index < onFinal; index += 1) {
        const entry = schedule.entries[index];
        if (entry !== undefined) pushCall(fromListed(entry, "call"));
      }
    } else {
      for (const entry of schedule.entries) {
        if (entry.date !== null) {
          const order = compareIso(entry.date, finalState.date);
          if (order !== null && order > 0) continue;
        }
        pushCall(fromListed(entry, "call"));
      }
    }
  } else if (finalState.reason === "final-valuation-conflict" && finalTerm !== undefined) {
    for (const entry of schedule.entries) {
      if (entry.date !== null && beforeEveryCandidate(entry.date, finalTerm)) pushCall(fromListed(entry, "call"));
      else events.push(fromListed(entry, "unknown"));
    }
  } else {
    for (let index = 0; index < schedule.entries.length; index += 1) {
      const entry = schedule.entries[index];
      if (entry === undefined) continue;
      if (laterEvidenced(schedule.entries, index)) pushCall(fromListed(entry, "call"));
      else events.push(fromListed(entry, "unknown"));
    }
  }

  if (finalState.known) {
    events.push(planned("final", null, finalState.date, "final-valuation", finalState.status));
  }
  return { events, leftOut, k };
}

function pushIndexed(
  reasons: PayoffReason[],
  code: "observation-before-first-call" | "listed-after-maturity" | "listed-after-final-valuation" | "listed-off-cycle",
  index: number,
): void {
  reasons.push({ code, index });
}

export function chronologyReasons(
  terms: Terms,
  schedule: EstimatedSchedule | ListedSchedule,
  solved: SolvedTerms,
  finalState: FinalState,
  plan: EventPlan,
  includeFinalGap: boolean,
): PayoffReason[] {
  const reasons: PayoffReason[] = [];
  const settlementOrder = compareIso(solved.settlement, solved.trade);
  if (settlementOrder !== null && settlementOrder < 0) reasons.push({ code: "settlement-before-trade" });
  const firstOrder = compareIso(solved.firstCall, solved.settlement);
  if (firstOrder !== null && firstOrder <= 0) reasons.push({ code: "first-call-before-settlement" });
  if (finalState.known) {
    const beforeFirst = compareIso(finalState.date, solved.firstCall);
    if (beforeFirst !== null && beforeFirst < 0) reasons.push({ code: "final-valuation-before-first-call" });
    const afterMaturity = compareIso(finalState.date, solved.maturity);
    if (afterMaturity !== null && afterMaturity > 0) reasons.push({ code: "final-valuation-after-maturity" });
  }
  if (schedule.kind === "listed") {
    for (const entry of schedule.entries) {
      if (entry.date === null) continue;
      const order = compareIso(entry.date, solved.firstCall);
      if (order !== null && order < 0) pushIndexed(reasons, "observation-before-first-call", entry.index);
    }
    for (const entry of schedule.entries) {
      if (entry.date === null) continue;
      const order = compareIso(entry.date, solved.maturity);
      if (order !== null && order > 0) pushIndexed(reasons, "listed-after-maturity", entry.index);
    }
  }
  if (schedule.kind === "listed" && finalState.known) {
    let followed = false;
    for (const entry of schedule.entries) {
      const datedOn = entry.date === finalState.date;
      const after = entry.date !== null && compareIso(entry.date, finalState.date) === 1;
      if (after || followed) pushIndexed(reasons, "listed-after-final-valuation", entry.index);
      if (datedOn) followed = true;
    }
  }
  const offset = wholeMonthOffset(solved.settlement, solved.firstCall);
  if (offset === null || offset !== solved.nonCall) reasons.push({ code: "non-call-months-mismatch" });
  if (schedule.kind === "listed") {
    for (const entry of schedule.entries) {
      if (entry.date === null) continue;
      const slot = nearestSlot(solved.firstCall, solved.step, entry.date);
      if (slot !== entry.index) pushIndexed(reasons, "listed-off-cycle", entry.index);
    }
  }
  if (finalState.known) {
    const slot = nearestSlot(solved.firstCall, solved.step, finalState.date);
    if (slot !== plan.k) reasons.push({ code: "final-valuation-off-cycle" });
  }
  if (includeFinalGap && !finalState.known) reasons.push({ code: finalState.reason });
  return reasons;
}
