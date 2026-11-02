import { cusipCheckDigitFails } from "./cusip.ts";
import { dateFlags, isRealDate } from "./dates.ts";
import { nodePos, type DocIndex } from "./locate.ts";
import { diagnostic } from "./messages.ts";
import type { DateFlag, Diagnostic, Term, Terms } from "./types.ts";

function walk(path: string, term: Term<unknown>, visit: (path: string, term: Term<unknown>) => void): void {
  visit(path, term);
  if (term.status === "conflict") {
    term.candidates.forEach((candidate, index) => {
      walk(`${path}.candidates[${index}]`, candidate, visit);
    });
  }
}

function eachTerm(terms: Terms, visit: (path: string, term: Term<unknown>) => void): void {
  const one = (path: string, term: Term<unknown> | undefined): void => {
    if (term !== undefined) walk(path, term, visit);
  };
  one("issuer", terms.issuer);
  one("identifiers.cusip", terms.identifiers?.cusip);
  one("identifiers.isin", terms.identifiers?.isin);
  one("dates.trade", terms.dates.trade);
  one("dates.settlement", terms.dates.settlement);
  one("dates.maturity", terms.dates.maturity);
  one("dates.first_call_observation", terms.dates.first_call_observation);
  terms.dates.observation_schedule?.forEach((item, index) => {
    one(`dates.observation_schedule[${index}]`, item);
  });
  terms.underlyings.members.forEach((member, index) => {
    one(`underlyings.members[${index}].initial`, member.initial);
  });
  one("underlyings.performance_rounding", terms.underlyings.performance_rounding);
  one("call.level", terms.call.level);
  one("call.non_call_months", terms.call.non_call_months);
  one("call.frequency", terms.call.frequency);
  one("premium.rate_per_year", terms.premium.rate_per_year);
  one("premium.accrual", terms.premium.accrual);
  one("barrier.level", terms.barrier.level);
  one("barrier.observation", terms.barrier.observation);
  one("barrier.below_barrier", terms.barrier.below_barrier);
  one("economics.issue_price", terms.economics.issue_price);
  one("economics.estimated_value", terms.economics.estimated_value);
  one("economics.fees", terms.economics.fees);
}

function dateOwner(path: string): string {
  return path.replace(/\.candidates\[\d+\]$/, "");
}

function isDateTerm(path: string): boolean {
  const owner = dateOwner(path);
  return (
    owner === "dates.trade" ||
    owner === "dates.settlement" ||
    owner === "dates.maturity" ||
    owner === "dates.first_call_observation" ||
    /^dates\.observation_schedule\[\d+\]$/.test(owner)
  );
}

function isInitial(path: string): boolean {
  const owner = dateOwner(path);
  return /^underlyings\.members\[\d+\]\.initial$/.test(owner);
}

function isCusip(path: string): boolean {
  return dateOwner(path) === "identifiers.cusip";
}

function positiveDecimal(value: string): boolean {
  const [whole, fraction = ""] = value.split(".");
  if (whole !== "0") return true;
  return /[1-9]/.test(fraction);
}

function knownScheduleDates(term: Term<string>, path: string): Array<{ path: string; value: string }> {
  if (term.status === "conflict") {
    const found: Array<{ path: string; value: string }> = [];
    term.candidates.forEach((candidate, index) => {
      found.push(...knownScheduleDates(candidate, `${path}.candidates[${index}]`));
    });
    return found;
  }
  if (term.status === "unknown" || typeof term.value !== "string" || !isRealDate(term.value)) return [];
  return [{ path: `${path}.value`, value: term.value }];
}

export function collectDateFlags(terms: Terms): Record<string, DateFlag[]> {
  const flags: Record<string, DateFlag[]> = {};
  const add = (path: string, term: Term<string>): void => {
    if (term.status === "conflict") {
      term.candidates.forEach((candidate, index) => {
        add(`${path}.candidates[${index}]`, candidate);
      });
      return;
    }
    if (term.status === "unknown") return;
    flags[path] = dateFlags(term.value);
  };
  add("dates.trade", terms.dates.trade);
  add("dates.settlement", terms.dates.settlement);
  add("dates.maturity", terms.dates.maturity);
  add("dates.first_call_observation", terms.dates.first_call_observation);
  terms.dates.observation_schedule?.forEach((item, index) => {
    add(`dates.observation_schedule[${index}]`, item);
  });
  return flags;
}

export function referentialDiagnostics(
  terms: Terms,
  index: DocIndex,
  fileName: string,
): { errors: Diagnostic[]; warnings: Diagnostic[] } {
  const errors: Diagnostic[] = [];
  const warnings: Diagnostic[] = [];
  const seenTickers = new Map<string, number>();
  terms.underlyings.members.forEach((member, memberIndex) => {
    const previous = seenTickers.get(member.ticker);
    const path = `underlyings.members[${memberIndex}].ticker`;
    if (previous !== undefined) {
      const pos = nodePos(path, index);
      errors.push(diagnostic(fileName, "duplicate-ticker", path, pos.line, pos.column));
    } else {
      seenTickers.set(member.ticker, memberIndex);
    }
  });

  eachTerm(terms, (path, term) => {
    if (term.status === "primary" || term.status === "document" || term.status === "advisor") {
      const sourcePath = `${path}.source`;
      const pos = nodePos(sourcePath, index);
      // sources is a plain object, so a name like constructor resolves to a prototype member; only a listed source counts.
      const source = Object.hasOwn(terms.sources, term.source) ? terms.sources[term.source] : undefined;
      if (!source) errors.push(diagnostic(fileName, "source-missing", sourcePath, pos.line, pos.column));
      else if (source.kind !== term.status) {
        errors.push(diagnostic(fileName, "source-kind", sourcePath, pos.line, pos.column));
      }
    }
    if (isDateTerm(path) && term.status !== "conflict" && term.status !== "unknown") {
      const valuePath = `${path}.value`;
      if (typeof term.value !== "string" || !isRealDate(term.value)) {
        const pos = nodePos(valuePath, index);
        errors.push(diagnostic(fileName, "invalid-date", valuePath, pos.line, pos.column));
      }
    }
    if (isInitial(path) && term.status !== "conflict" && term.status !== "unknown" && typeof term.value === "string") {
      if (!positiveDecimal(term.value)) {
        const valuePath = `${path}.value`;
        const pos = nodePos(valuePath, index);
        errors.push(diagnostic(fileName, "out-of-range", valuePath, pos.line, pos.column));
      }
    }
    if (isCusip(path) && term.status !== "conflict" && term.status !== "unknown" && typeof term.value === "string") {
      if (cusipCheckDigitFails(term.value)) {
        const valuePath = `${path}.value`;
        const pos = nodePos(valuePath, index);
        warnings.push(diagnostic(fileName, "cusip-check-digit", valuePath, pos.line, pos.column));
      }
    }
  });

  const schedule = terms.dates.observation_schedule;
  if (schedule !== undefined) {
    const known: Array<{ path: string; value: string }> = [];
    schedule.forEach((item, itemIndex) => {
      known.push(...knownScheduleDates(item, `dates.observation_schedule[${itemIndex}]`));
    });
    for (let i = 1; i < known.length; i += 1) {
      const previous = known[i - 1];
      const current = known[i];
      if (previous === undefined || current === undefined) continue;
      if (current.value <= previous.value) {
        const pos = nodePos(current.path, index);
        errors.push(diagnostic(fileName, "schedule-order", current.path, pos.line, pos.column));
        break;
      }
    }
  }
  return { errors, warnings };
}
