/** Public terms API: load a worst-of autocall file, flag weekend dates, and summarize which payoff terms are verified. */
export { dateFlags } from "./terms/dates.ts";
export { loadTerms } from "./terms/load.ts";
export { verificationSummary } from "./terms/summary.ts";
export type {
  DateFlag,
  Diagnostic,
  LoadFailure,
  LoadResult,
  LoadSuccess,
  Term,
  Terms,
} from "./terms/types.ts";
