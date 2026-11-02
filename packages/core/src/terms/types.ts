export type SourceKind = "primary" | "document" | "advisor";

export type SourcedStatus = SourceKind;

export type TermStatus = SourcedStatus | "user" | "estimate" | "assumed" | "unknown" | "conflict";

export interface SourceRecord {
  kind: SourceKind;
  file: string;
}

export interface SourcedTerm<T> {
  value: T;
  status: SourcedStatus;
  source: string;
}

export interface UserTerm<T> {
  value: T;
  status: "user";
}

export interface EstimateTerm<T> {
  value: T;
  status: "estimate";
  rule: string;
}

export interface AssumedTerm<T> {
  value: T;
  status: "assumed";
  note: string;
}

export interface UnknownTerm {
  value: null;
  status: "unknown";
}

export type Candidate<T> = SourcedTerm<T> | UserTerm<T>;

export interface ConflictTerm<T> {
  status: "conflict";
  candidates: Candidate<T>[];
}

export type Term<T> = SourcedTerm<T> | UserTerm<T> | EstimateTerm<T> | AssumedTerm<T> | UnknownTerm | ConflictTerm<T>;

export interface Member {
  ticker: string;
  initial: Term<string>;
}

export interface Terms {
  schema: "mln-terms/0.1";
  id: string;
  category: "mln";
  structure: "autocall-snowball-worst-of";
  identifiers?: {
    cusip?: Term<string>;
    isin?: Term<string>;
  };
  issuer: Term<string>;
  dates: {
    trade: Term<string>;
    settlement: Term<string>;
    maturity: Term<string>;
    first_call_observation: Term<string>;
    observation_schedule?: Term<string>[];
  };
  underlyings: {
    basket: "worst_of";
    members: Member[];
    performance_rounding: Term<string>;
  };
  call: {
    level: Term<number>;
    non_call_months: Term<number>;
    frequency: Term<string>;
  };
  premium: {
    rate_per_year: Term<number>;
    accrual: Term<string>;
  };
  barrier: {
    level: Term<number>;
    observation: Term<string>;
    below_barrier: Term<string>;
  };
  economics: {
    issue_price: Term<number>;
    estimated_value?: Term<number>;
    fees?: Term<number>;
  };
  sources: Record<string, SourceRecord>;
}

export interface Diagnostic {
  code: string;
  path: string;
  line: number;
  column: number;
  message: string;
}

export type DateFlag = "weekend";

export interface LoadSuccess {
  ok: true;
  terms: Terms;
  warnings: Diagnostic[];
  dateFlags: Record<string, DateFlag[]>;
}

export interface LoadFailure {
  ok: false;
  errors: Diagnostic[];
}

export type LoadResult = LoadSuccess | LoadFailure;
