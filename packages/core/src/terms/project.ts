import type { Candidate, ConflictTerm, Member, SourceKind, SourceRecord, Term, Terms } from "./types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(value: unknown): string {
  if (typeof value !== "string") throw new Error("expected string");
  return value;
}

export function copyTerm<T>(raw: unknown): Term<T> {
  if (!isRecord(raw) || typeof raw.status !== "string") throw new Error("expected term");
  if (raw.status === "conflict") {
    if (!Array.isArray(raw.candidates)) throw new Error("expected candidates");
    const conflict: ConflictTerm<T> = {
      status: "conflict",
      candidates: raw.candidates.map((item) => copyCandidate<T>(item)),
    };
    return conflict;
  }
  if (raw.status === "unknown") return { status: "unknown", value: null };
  if (raw.status === "user") return { status: "user", value: raw.value as T };
  if (raw.status === "estimate") return { status: "estimate", value: raw.value as T, rule: stringField(raw.rule) };
  if (raw.status === "assumed") return { status: "assumed", value: raw.value as T, note: stringField(raw.note) };
  if (raw.status === "primary" || raw.status === "document" || raw.status === "advisor") {
    return { status: raw.status, value: raw.value as T, source: stringField(raw.source) };
  }
  throw new Error("expected status");
}

function copyCandidate<T>(raw: unknown): Candidate<T> {
  const term = copyTerm<T>(raw);
  if (term.status === "primary" || term.status === "document" || term.status === "advisor" || term.status === "user") {
    return term;
  }
  throw new Error("expected candidate");
}

function copySources(raw: unknown): Record<string, SourceRecord> {
  if (!isRecord(raw)) throw new Error("expected sources");
  const sources: Record<string, SourceRecord> = {};
  for (const [id, value] of Object.entries(raw)) {
    if (!isRecord(value)) throw new Error("expected source");
    const kind = value.kind;
    if (kind !== "primary" && kind !== "document" && kind !== "advisor") throw new Error("expected kind");
    sources[id] = { kind: kind as SourceKind, file: stringField(value.file) };
  }
  return sources;
}

function copyMember(raw: unknown): Member {
  if (!isRecord(raw)) throw new Error("expected member");
  return { ticker: stringField(raw.ticker), initial: copyTerm<string>(raw.initial) };
}

export function projectTerms(raw: unknown): Terms {
  if (!isRecord(raw) || !isRecord(raw.dates) || !isRecord(raw.underlyings) || !isRecord(raw.call)) {
    throw new Error("expected document");
  }
  if (!isRecord(raw.premium) || !isRecord(raw.barrier) || !isRecord(raw.economics)) throw new Error("expected document");
  if (!Array.isArray(raw.underlyings.members)) throw new Error("expected members");

  const dates: Terms["dates"] = {
    trade: copyTerm<string>(raw.dates.trade),
    settlement: copyTerm<string>(raw.dates.settlement),
    maturity: copyTerm<string>(raw.dates.maturity),
    first_call_observation: copyTerm<string>(raw.dates.first_call_observation),
  };
  if (raw.dates.observation_schedule !== undefined) {
    if (!Array.isArray(raw.dates.observation_schedule)) throw new Error("expected schedule");
    dates.observation_schedule = raw.dates.observation_schedule.map((item) => copyTerm<string>(item));
  }

  const economics: Terms["economics"] = { issue_price: copyTerm<number>(raw.economics.issue_price) };
  if (raw.economics.estimated_value !== undefined) {
    economics.estimated_value = copyTerm<number>(raw.economics.estimated_value);
  }
  if (raw.economics.fees !== undefined) economics.fees = copyTerm<number>(raw.economics.fees);

  const terms: Terms = {
    schema: "mln-terms/0.1",
    id: stringField(raw.id),
    category: "mln",
    structure: "autocall-snowball-worst-of",
    issuer: copyTerm<string>(raw.issuer),
    dates,
    underlyings: {
      basket: "worst_of",
      members: raw.underlyings.members.map((item) => copyMember(item)),
      performance_rounding: copyTerm<string>(raw.underlyings.performance_rounding),
    },
    call: {
      level: copyTerm<number>(raw.call.level),
      non_call_months: copyTerm<number>(raw.call.non_call_months),
      frequency: copyTerm<string>(raw.call.frequency),
    },
    premium: {
      rate_per_year: copyTerm<number>(raw.premium.rate_per_year),
      accrual: copyTerm<string>(raw.premium.accrual),
    },
    barrier: {
      level: copyTerm<number>(raw.barrier.level),
      observation: copyTerm<string>(raw.barrier.observation),
      below_barrier: copyTerm<string>(raw.barrier.below_barrier),
    },
    economics,
    sources: copySources(raw.sources),
  };

  if (raw.identifiers !== undefined) {
    if (!isRecord(raw.identifiers)) throw new Error("expected identifiers");
    const identifiers: NonNullable<Terms["identifiers"]> = {};
    if (raw.identifiers.cusip !== undefined) identifiers.cusip = copyTerm<string>(raw.identifiers.cusip);
    if (raw.identifiers.isin !== undefined) identifiers.isin = copyTerm<string>(raw.identifiers.isin);
    terms.identifiers = identifiers;
  }
  return terms;
}
