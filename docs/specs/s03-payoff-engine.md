# S03: Payoff engine

- Status: drafted 2026-11-10 by the PM (Claude), on Beni's ruling of 2026-11-08 to split the engine work ("Split, schedule first") and his rulings of 2026-11-10, recorded under Decisions. Amended the same day after Codex's plan challenge and again after its Pass 2 (`docs/reviews/pr-32-pass-1.5.md`). No code exists yet.
- Release: non-release slice toward `v0.1.0`. Starts only after this spec merges and S02.1's build merges, because it reads `dates.final_valuation` from schema 0.2.
- Builder: Cursor, Grok 4.7 Extra High (sensitive-path slice), in one draft PR on branch `s03/payoff-engine`. Codex adds the Pass M reference at Pass 2 (see Pass M).
- Sensitive paths the build touches: `packages/plugin-mln/**` and `fixtures/golden/**`, including its `expected/` files. At Pass 2 Codex also adds `tools/reference/**`. This spec PR touches none.
- Design rung: none (no UI).
- Stories served: 4.1 one lifecycle status, 4.2 worst name and distances, 4.3 the observation log, 5.2 and 5.4 the payout data behind the payoff and call-month charts, 11.2 golden tests runnable without the UI. Stories 7.1 and 7.2 read `finalPayout` in a later slice.

## Goal

keel can say, from the terms and dated closes alone, whether a note has been called, has had its final payoff fixed, has matured or is still live, and what the terms pay in each case. Every number shows its working. A payout appears only when every input it rests on is known. A status rests only on dates the terms evidence. A missing or conflicting close, or a date that is only an estimate, gives "unknown", never a guess. No output is a value of the note or of a holding.

## Decisions

Each of these is open to the plan challenge, except where a ruling of Beni's settles it.

1. **Payouts are integer cents per $1,000 of principal.** The terms state no principal amount, and `economics.issue_price` is the price paid, which can differ from principal. So the engine never reads `economics.*` and never scales by a quantity. A payout is what the terms pay per $1,000 of principal on a stated outcome: the research's payoff and call-month charts and alert A4 show these amounts. ADR-0005 states hard rule 3 for the note's value, the value slot. A payout values no holding, so the PM reads it as outside that rule. Codex's plan challenge agreed. This is a reading of a hard rule, and Beni's merge confirms it.
2. **Arithmetic is exact.** Closes, initial levels and ratios are parsed into exact fractions with `BigInt`. No floating-point number takes part in any result. Initial levels can carry 16 significant digits, beyond `Number.MAX_SAFE_INTEGER`.
3. **`underlyings.performance_rounding` rounds the ratio close ÷ initial.** `AGENTS.md` makes levels decimal ratios, so `half-up-4dp` turns 0.94995 into 0.9500 (95.00%). The schema allows `0dp` and `1dp`, which are coarse on a ratio, and the engine applies them literally. `none` keeps the exact fraction. A positive close can therefore round to a ratio of zero. Nothing divides by a zero ratio: the two metrics distances divide by the worst ratio only when it is above zero.
4. **The worst-of is the lowest rounded ratio.** A tie goes to the first tied member in the terms' member order.
5. **The tests are inclusive.** A call observation calls when the worst ratio is at or above `call.level`. On the final valuation date the call test runs first. If it fails, a worst ratio at or above `barrier.level` pays principal, and one below it pays principal times the worst ratio.
6. **Premium months come from the index, and only when the dates evidence that index.** A call row with schedule index `i` uses `call.non_call_months + i × step`, where `step` is 1, 3, 6 or 12 by `call.frequency`. The final row uses `non_call_months + k × step`, where `k` counts the call events before the final valuation date. The mapping is used only when the terms show it:
   - The whole-month offset from `dates.settlement` nearest the first call observation equals `call.non_call_months`. This takes up idea 49.
   - Every listed item with a known date, and the final valuation date, sits nearest the cycle slot its index names.

   Otherwise the result is unavailable, so a holiday move or a day's difference never changes a premium, and an off-cycle list never gets one. "Nearest" needs no tolerance from outside the terms: the cycle itself sets it, and a tie fails.
7. **Money rounds once, half up, to the cent.** The terms state no rounding for amounts, so this is keel's convention, and every result names it in `assumptions`.
8. **Only the exactly dated close counts.** A row reads closes dated on its own date and nothing else: no carry forward or back, and never a close dated after `asOf`. Two closes for one member and date with different values make that row unknown, listing both, as hard rule 6 keeps sources side by side. An unknown row stops the evaluation, and so does a called row, because a call ends the note.
9. **The final valuation date comes from the term (Beni's ruling 1, 2026-11-10, "Schema term first"), and the dates must be in order.**
   - **Chronology.** `dates.settlement`, `dates.first_call_observation` and `dates.maturity` must be evidenced (Decision 14), since chronology, the premium mapping and `matured` rest on them. Every evidenced call event and the final valuation date must fall after settlement, and the final valuation date on or before maturity.
   - **Splitting the schedule.** Estimated entries after the final valuation date are left out, and the result counts them. A listed item after it, or after maturity, makes the evaluation unavailable.
   - **Statuses.** The final payoff is fixed on the final valuation date, but the note matures on its maturity date. So the engine reports `final-fixed` between the two dates and `matured` only from maturity on.
   - **Term not known.** When the term is absent, unknown or in conflict, there is no final row, and the status is never `final-fixed` or `matured`. An event is then a call event only when the terms show it comes before the final valuation date: a later listed item has a known date, or, for a conflict, it falls before every candidate. Any other event's role is unknown, and reaching it stops evaluation with status `unknown`.
10. **Pass M's reference is Codex's, written at Pass 2 (Beni's ruling 2, 2026-11-10, "Codex at Pass 2").** Codex writes it from this spec before opening the engine code.
11. **Three variants are unsupported (Beni's ruling 3, 2026-11-10, "Simple, final, cash").** Compound accrual, `daily-close` and `continuous` barriers, and physical delivery have no formula in the terms that keel can apply exactly. A function that meets one returns `unsupported` with the reason and no partial result.
12. **Golden expected outputs come from the engine, and their independence comes from elsewhere.** A registered generator writes each case's inputs from a seed and its expected output by running the engine, so regeneration is byte-identical. Two things keep the expected files honest: the values this spec freezes, which a separate test asserts, and Pass M, which recomputes every case from its input alone.
13. **Golden files pass the whole tripwire by construction (idea 2).** The generator scans what it writes with the repository's tripwire and fails on any hit, in any class. Before that, it redraws a seeded value that would give a 9-character token passing the CUSIP check digit, or a close with 9 or more integer digits. No allowlist entry is added. Every golden JSON file carries `"synthetic": true`, which the tripwire's price rule requires.
14. **A status rests only on evidenced dates (Beni's ruling 5, 2026-11-10, "Stop: status unknown").**
    - A date is evidenced when it comes from the stated first call observation, a listed item or the final valuation term, and its status is `primary`, `document`, `advisor` or `user`.
    - A generated date, or a stated or listed date whose status is `estimate` or `assumed`, is a planning date. A close on it shows the price that day, not that the contract observed then.
    - When evaluation reaches a planning date on or before `asOf`, it stops with status `unknown`. Payout tables, `finalPayout` and `noteMetrics` still work over planning observation dates.
    - Settlement, the first call observation and maturity are never planning dates here. With a status of `estimate` or `assumed` they make every function but `noteMetrics` unavailable, with `input-unevidenced`.
    - (Beni's ruling 4, "Bump to 0.2", is S02.1's.)

## Scope

### Package

A new workspace package, `@keel/plugin-mln`, in `packages/plugin-mln/`. Its entry is `src/index.ts`, with `@keel/core` as its one dependency (`workspace:*`) and `vitest` 5.0.5 as its one dev dependency. Its `vitest.config.mjs` uses the same network guard setup as core's.

The builder's commits change only these:

- Files under `packages/plugin-mln/`, `fixtures/golden/` and `tools/generators/golden/`.
- `tools/fixtures/registry.mjs`, to register the generator.
- `tools/verify/steps.mjs`, to add the package to the `typecheck` and `tests` steps, with step names and order unchanged.
- `tools/acceptance/test/determinism.test.mjs`, `tools/acceptance/test/test-contract.test.mjs` and `tools/acceptance/test/verify-runner.test.mjs`, where they pin the registry or the steps.
- `pnpm-lock.yaml`, for the workspace entry.

If the build needs any other file, the builder stops and reports, and the spec is amended first. The PR body lists each changed file outside the three folders with its reason.

### Public API

```ts
import type { ExchangeCalendar, Term, Terms, UnavailableReason } from "@keel/core";

export const PRINCIPAL_CENTS = 100000; // $1,000 of principal

export interface Close { ticker: string; date: string; value: string; source: string }
export type Ratio = string; // a reduced fraction "p/q": p ≥ 0, q ≥ 1, no sign, no leading zeros; zero is "0/1"
type Status = Term<string>["status"];

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
  | { code: "final-valuation-before-settlement" | "final-valuation-after-maturity" | "final-valuation-off-cycle" }
  | { code: "observation-before-settlement" | "listed-after-maturity" | "listed-after-final-valuation" | "listed-off-cycle"; index: number }
  | { code: "non-call-months-mismatch" }
  | { code: "date-unknown"; index: number }
  | { code: "estimated-date"; scheduleIndex: number | null; date: string }
  | { code: "no-close" }
  | MemberReason;
export interface Unavailable { kind: "unavailable"; reasons: PayoffReason[] }
export interface Unsupported {
  kind: "unsupported";
  reasons: { code: "accrual-compound" | "barrier-daily-close" | "barrier-continuous" | "below-barrier-physical-delivery"; path: string }[];
}
export type Assumption =
  | { code: "per-1000-principal" }
  | { code: "cents-half-up" }
  | { code: "premium-months-by-index" }
  | { code: "final-call-then-barrier" }
  | { code: "estimated-after-final-valuation-left-out"; count: number };

export interface MemberLevel { ticker: string; close: string | null; sources: string[]; ratio: Ratio | null }
export type Outcome =
  | "called" | "not-called"
  | "final-above-call" | "final-at-or-above-barrier" | "final-below-barrier"
  | "unknown";
export interface Row {
  index: number;                 // position in rows, from 0
  kind: "call" | "final";
  scheduleIndex: number | null;  // the schedule entry's index; null for the final row
  date: string;                  // always an evidenced date
  dateOrigin: "stated" | "listed" | "final-valuation";
  dateStatus: Status;
  premiumMonths: number;
  members: MemberLevel[];        // in the terms' member order
  worst: { ticker: string; ratio: Ratio } | null;
  outcome: Outcome;
  payoutCents: number | null;
  reasons: MemberReason[];
}
export interface NextEvent { kind: "call" | "final" | "observation" | "maturity"; scheduleIndex: number | null; date: string | null; evidenced: boolean } // "observation": a call or the final event, role unknown
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
export function evaluateNote(terms: Terms, calendar: ExchangeCalendar, closes: readonly Close[], asOf: string): Evaluation | Unavailable | Unsupported;

export interface PayoutRow { scheduleIndex: number; date: string | null; evidenced: boolean; premiumMonths: number; payoutCents: number }
export interface PayoutSchedule {
  kind: "payouts";
  calendar: string;
  schedule: "estimated" | "listed";
  calls: PayoutRow[];
  final: { date: string; evidenced: boolean; premiumMonths: number; aboveCallCents: number; atOrAboveBarrierCents: number };
  unverified: string[];
  provisional: boolean;
  assumptions: Assumption[];
}
export function payoutSchedule(terms: Terms, calendar: ExchangeCalendar): PayoutSchedule | Unavailable | Unsupported;

export interface FinalPayout {
  kind: "final";
  ratio: Ratio;  // the given ratio, rounded by the terms' rule
  outcome: "final-above-call" | "final-at-or-above-barrier" | "final-below-barrier";
  premiumMonths: number;
  payoutCents: number;
  unverified: string[];
  provisional: boolean;
  assumptions: Assumption[];
}
export function finalPayout(terms: Terms, calendar: ExchangeCalendar, worstRatio: string): FinalPayout | Unavailable | Unsupported;

export interface Metrics {
  kind: "metrics";
  asOf: string;
  date: string;
  members: MemberLevel[];
  worst: { ticker: string; ratio: Ratio };
  toBarrier: Ratio;      // the fall, as a fraction of the worst name's close, that brings it to the barrier level
  toCall: Ratio | null;  // the rise, as a fraction of the worst name's close, that brings it to the call level; null when the worst ratio is zero
  belowBarrier: boolean;
  atOrAboveCall: boolean;
  unverified: string[];
  provisional: boolean;
}
export function noteMetrics(terms: Terms, closes: readonly Close[], asOf: string): Metrics | Unavailable;
```

The entry exports exactly `PRINCIPAL_CENTS`, `evaluateNote`, `payoutSchedule`, `finalPayout` and `noteMetrics`, plus the types above.

### Arithmetic

- **Decimals.** A close value or an initial level matches `^(0|[1-9][0-9]{0,9})(\.[0-9]{1,6})?$` and is parsed to an exact fraction. A close must be greater than zero. Two closes are equal when their fractions are equal, so `95.1` equals `95.10`.
- **Ratios.** An input ratio for `finalPayout` matches `^(0|[1-9][0-9]*)/([1-9][0-9]*)$` and need not be reduced. Every output `Ratio` is reduced.
- **Rounding a ratio** `x` to `n` places, with `y = x × 10^n`:
  - `truncate` is `floor(y)`.
  - `half-up` is `floor(y + 1/2)`.
  - `half-even` is the nearest integer, with ties going to the even one.

  The result is divided back by `10^n`. Ratios are never negative, so `truncate` and `floor` agree.
- **Cents.** An exact amount `a` rounds to `floor(a + 1/2)` cents.
- **Premium.** For simple accrual, `premium(m) = cents(100000 × rate × m / 120000)`, where `rate` is `premium.rate_per_year` in basis points. A call, or a final row at or above the call level, pays `100000 + premium(m)`.
- **Below the barrier**, the final row pays `cents(100000 × w)`, where `w` is the rounded worst ratio.
- **Months.** Adding `n` months to a date moves it `n` calendar months and clamps the day to the target month's length, as in S02.
- **Slots.** Slot `j`, for `j ≥ 0`, is `dates.first_call_observation` plus `j × step` months, computed from the first call observation each time. A date's nearest slot is the one with the fewest days between them. When two slots are equally near, the date has no nearest slot.
- **Whole-month offset.** The whole-month offset of `dates.first_call_observation` is the `n ≥ 0` for which `dates.settlement` plus `n` months is nearest it in days. A tie means there is none.

### Checks, in order

Every function runs the checks that apply to it in this order. It returns the first group that finds anything, listing every finding in that group in the order shown.

1. **Inputs.** `as-of-invalid` when `asOf` is not a real Gregorian date. For each close the function can read, in input order, one `close-invalid` when its date is not a real Gregorian date, its value fails the decimal grammar or is zero, or its source fails `^[a-z0-9][a-z0-9-]{0,63}$`. A close it can read names a member's ticker and is dated on or before `asOf`, compared as `YYYY-MM-DD` text. Any other close is never read and never validated. `ratio-invalid` for a `finalPayout` ratio that fails its grammar.
2. **Terms.** One `input-unknown` or `input-conflict` per path, in this order, and one `input-unevidenced` for each of the three dates whose status is `estimate` or `assumed`:
   - `dates.settlement`, `dates.maturity` and `dates.first_call_observation`.
   - `underlyings.performance_rounding`, `call.level`, `call.non_call_months` and `call.frequency`.
   - `premium.rate_per_year` and `premium.accrual`.
   - `barrier.level`, `barrier.observation` and `barrier.below_barrier`.

   `noteMetrics` checks only `underlyings.performance_rounding`, `call.level` and `barrier.level`.
3. **Variants.** The result is `unsupported` with `accrual-compound` (path `premium.accrual`), `barrier-daily-close` or `barrier-continuous` (path `barrier.observation`), and `below-barrier-physical-delivery` (path `barrier.below_barrier`), in that order. `noteMetrics` skips this group.
4. **Schedule.** If `observationSchedule(terms, calendar)` is `unavailable`, the result is one `schedule-unavailable` reason carrying its reasons unchanged. `noteMetrics` skips this group.
5. **Chronology and mapping.** `noteMetrics` skips this group. The others check, in this order:
   - When the final valuation date is known: `final-valuation-before-settlement` when it is on or before the settlement date, and `final-valuation-after-maturity` when it is after maturity.
   - `observation-before-settlement` for the stated first call observation of an estimated schedule, and for each listed item with a known date, that is on or before the settlement date. So the whole-month offset is always measured forward from settlement.
   - With a listed schedule, `listed-after-maturity` for each item with a known date after maturity.
   - With a listed schedule and a known final valuation date, `listed-after-final-valuation` for each item that has a known date after it, or that follows an item dated on it.
   - `non-call-months-mismatch` when the first call observation has no whole-month offset, or its offset differs from `call.non_call_months`.
   - With a listed schedule, `listed-off-cycle` for each item with a known date whose nearest slot is not its own index.
   - When the final valuation date is known, `final-valuation-off-cycle` when its nearest slot is not `k` (see Events).
   - `payoutSchedule` and `finalPayout` also return `final-valuation-absent`, `final-valuation-unknown` or `final-valuation-conflict` here, last, when the term is not known. `evaluateNote` does not.

### Events

From the schedule and the final valuation date, in schedule order:

- **Final valuation date known.**
  - With an estimated schedule, an entry dated before it is a call event, and an entry dated on it is the final event. An entry dated after it is left out, and the count goes in `estimated-after-final-valuation-left-out`.
  - With a listed schedule, every item before the first item dated on the final valuation date is a call event, including items with no known date. An item dated on it is the final event.
  - If no entry or item falls on it, the final event comes after the last call event.
  - The final event's date, origin `final-valuation` and status come from the term, so `k` is the number of call events.
- **Final valuation date absent, unknown or in conflict.** There is no final event. An entry or item is a call event when a later listed item has a known date, since every observation falls on or before the final valuation date. With a conflict, an entry or item dated before every candidate is also a call event. Any other entry or item is an event of unknown role.

An event's date is evidenced as Decision 14 says.

### Rows

Events are taken in order:

1. **An event with no known date** (a listed `unknown` or `conflict` item) is never a row. It is `next`, with `date: null` and `evidenced: false`, and evaluation stops, but only in one of two cases:
   - `asOf` is the last row's date. A later item then falls after `asOf`.
   - There is no row, and `asOf` is on or before the settlement date.

   Otherwise evaluation stops with status `unknown`, and `reasons` holds one `date-unknown` with the item's index.
2. **An event dated after `asOf`** is `next`, with `evidenced` set by Decision 14 and `kind` `observation` for an event of unknown role, and evaluation stops.
3. **An event of unknown role dated on or before `asOf`** is never a row. Evaluation stops with status `unknown`, and `reasons` holds `final-valuation-absent`, `final-valuation-unknown` or `final-valuation-conflict`.
4. **An event dated on or before `asOf` that is not evidenced** is never a row. Evaluation stops with status `unknown`, and `reasons` holds one `estimated-date`, with the event's schedule index (`null` for the final event) and its date.
5. **Otherwise the event becomes a row.** For each member in order:
   - The closes for that ticker dated exactly on the row's date are read.
     - None: `close` is `null` and `sources` is empty.
     - More than one distinct value: `close` is `null`, `sources` lists every matching close's source in input order, and the member gets `close-conflict`, listing each distinct value's first spelling in input order.
     - Otherwise: `close` is the first spelling, and `sources` lists every matching close's source in input order.
   - Its reason, if any:
     - `initial-unknown` or `initial-conflict` for an `unknown` or `conflict` initial level.
     - Otherwise `close-missing` when there was no close, or `close-conflict` as above.
   - Its `ratio` is its close ÷ initial, rounded as the terms say, when it has no reason. Otherwise `ratio` is `null`.
6. **The worst.** If any member has a reason, the row's outcome is `unknown`, `worst` is `null`, `payoutCents` is `null`, and `reasons` lists the members' reasons in member order. Otherwise `worst` follows Decision 4.
7. **A call row** is `called` when worst ≥ call level, with `payoutCents` of `100000 + premium(m)`. Otherwise it is `not-called`, with `payoutCents` null.
8. **The final row** is `final-above-call` when worst ≥ call level, `final-at-or-above-barrier` when worst ≥ barrier level, and `final-below-barrier` otherwise, with the payouts under Arithmetic.
9. **After a row that is `called` or `unknown`**, evaluation stops, and `next` is `null`.

### Status

- `called` when the last row is `called`.
- `final-fixed` when the last row is the final row, is not `unknown`, and `asOf` is before maturity. `next` is then `{ kind: "maturity", scheduleIndex: null, date: <maturity>, evidenced }`, where `evidenced` follows Decision 14's statuses for `dates.maturity`.
- `matured` when the last row is the final row, is not `unknown`, and `asOf` is on or after maturity. The payment date is not reported.
- `unknown` in two cases, each setting `reasons`:
  - The last row is `unknown`: that row's reasons.
  - Evaluation stopped under Rows step 1, 3 or 4: the `date-unknown`, final valuation or `estimated-date` reason.
- `live` otherwise, with `next` set and `reasons` empty. That includes the time before an event of unknown role is reached: it is `next`, with `kind` `observation`.

`payoutCents` on the evaluation is the payout of the last row when the status is `called`, `final-fixed` or `matured`, and `null` otherwise.

### Shared result fields

- **`unverified`** lists the paths a function reads that are not verified, in this fixed order:
  1. `dates.settlement`
  2. `dates.maturity`
  3. `dates.first_call_observation`
  4. `dates.final_valuation`
  5. `dates.observation_schedule`
  6. `underlyings.members[i].initial`, in member order
  7. `underlyings.performance_rounding`
  8. `call.level`
  9. `call.non_call_months`
  10. `call.frequency`
  11. `premium.rate_per_year`
  12. `premium.accrual`
  13. `barrier.level`
  14. `barrier.observation`
  15. `barrier.below_barrier`

  A path is verified only when its status is `primary`. `dates.observation_schedule` is verified only when it is present, nonempty, and every item is `primary`, so an estimated schedule always lists it. An absent `dates.final_valuation` is listed. Paths 2 to 15 are `verificationSummary`'s list in its order, as S02.1 extends it.

  Which paths each function reads:
  - `evaluateNote` reads every path.
  - `payoutSchedule` and `finalPayout` read every path except the members' `initial` levels.
  - `noteMetrics` reads only the `initial` levels, `underlyings.performance_rounding`, `call.level` and `barrier.level`.
- **`provisional`** is `unverified.length > 0`.
- **`assumptions`** holds `per-1000-principal`, `cents-half-up` and `premium-months-by-index` always, in that order. `final-call-then-barrier` follows when the final valuation date is known, and then `estimated-after-final-valuation-left-out` when its count is at least 1. `noteMetrics` has no `assumptions`.

### `payoutSchedule`

One `PayoutRow` per call event, with `payoutCents` set to `100000 + premium(m)` and `evidenced` per Decision 14. Then `final`, with:

- `date`: the final valuation date.
- `premiumMonths`: `non_call_months + k × step`.
- `aboveCallCents`: `100000 + premium(that)`.
- `atOrAboveBarrierCents`: `100000`.

It reads no close, and planning dates are allowed.

### `finalPayout`

Rounds the given ratio as the terms say, then applies Rows step 8 with the final event's `premiumMonths`. It serves the payoff diagram and the later stress screen, and it reads no close.

### `noteMetrics`

- Its date is the latest date on or before `asOf` on which any member's ticker has a close. If there is none, the result is unavailable with `no-close`.
- Every member is resolved on that date as in Rows step 5. If any member has a reason, the result is unavailable with those reasons. It never falls back to an earlier date.
- `worst` follows Decision 4, with `w` its ratio, `b` the barrier level and `c` the call level, both as ratios.
- `toBarrier` is `1 − b/w` when `w > b`, and `0/1` otherwise.
- `toCall` is `c/w − 1` when `0 < w < c`, `0/1` when `w ≥ c`, and `null` when `w` is zero, since no finite rise reaches the call level.
- `belowBarrier` is `w < b`, and `atOrAboveCall` is `w ≥ c`.

### Purity

No I/O, clock, randomness, console output or locale outside test files. Imports are `@keel/core` and relative files inside `packages/plugin-mln/src/` only. AC9 states how this is tested.

## Frozen values

Computed with exact fractions. The PR body prints the scripts.

### Rounding a ratio

| Raw ratio | `none` | `half-up-4dp` | `half-even-4dp` | `truncate-4dp` | `half-up-2dp` | `half-up-0dp` |
| --- | --- | --- | --- | --- | --- | --- |
| 0.94995 | `18999/20000` | `19/20` | `19/20` | `9499/10000` | `19/20` | `1/1` |
| 0.94985 | `18997/20000` | `9499/10000` | `4749/5000` | `4749/5000` | `19/20` | `1/1` |
| 0.599999 | `599999/1000000` | `3/5` | `3/5` | `5999/10000` | `3/5` | `1/1` |

### Base terms B and L

B is `fixtures/synthetic/terms/valid/minimal.yaml`, moved to schema 0.2 by its line 1, plus `dates.final_valuation: { value: 2031-02-26, status: primary, source: supplement }`. That gives:

- **Dates.** Settlement 2026-03-04 and maturity 2031-03-03, both `primary`. The trade date, 2026-03-02, is not read.
- **Rate and step.** Rate 850 basis points, quarterly, 6 non-call months. The call level is 9500 and the barrier level 6000.
- **Rounding.** `half-up-4dp`, with a final barrier and one-for-one loss below it.
- **Schedule.** Its estimated schedule is S02's case 1. Entries 0 to 17 (2026-09-01 to 2030-12-02) are call events. The final valuation date, 2031-02-26, is a Wednesday. Entry 18, 2031-03-03, falls after it and is left out, so `k` is 18 and the final row's `premiumMonths` is 60.
- **Mapping.** Settlement plus 6 months is nearest the first call observation, 3 days away. The next nearest, plus 5 months, is 28 days away. So the offset is 6, which equals `non_call_months`. Every entry sits nearest its own slot, at most 3 days after it. The final valuation date is nearest slot 18, 3 days before it.
- **Unverified.** `["dates.observation_schedule"]`.

L is B with `dates.observation_schedule` listing B's entries 0 to 17 by date, then 2031-02-26, each `primary` from `supplement`. Every date in L is evidenced, `k` is 18, and `unverified` is empty.

`payoutSchedule` on B or on L gives calls with `premiumMonths` `6 + 3i` and `payoutCents` 104250, 106375, 108500, 110625, 112750, 114875, 117000, 119125, 121250, 123375, 125500, 127625, 129750, 131875, 134000, 136125, 138250 and 140375. `final` is `{ date: "2031-02-26", evidenced: true, premiumMonths: 60, aboveCallCents: 142500, atOrAboveBarrierCents: 100000 }`. On B, call 0 is evidenced and calls 1 to 17 are not. On L every row is evidenced.

### Payouts under other terms

B with rate 2000 and frequency `monthly` is close to the research's illustrative terms. Its estimated schedule has 55 entries. Entries 0 to 53 are call events, the last on 2031-02-03, and entry 54, 2031-03-03, is left out. The final valuation date is nearest slot 54, which is `k`. So call row `i` has `premiumMonths` `6 + i`, and the final row has 60. `payoutSchedule` on it gives, among its rows, the research's table:

| `premiumMonths` | 6 | 7 | 12 | 24 | 36 | 48 | 60 (final, `aboveCallCents`) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cents | 110000 | 111667 | 120000 | 140000 | 160000 | 180000 | 200000 |

At rate 2001 and `m` = 7 the premium is exactly 11672.5 cents. It rounds half up to 11673, so the payout is 111673. Half-even would give 11672 and 111672.

### Mapping failures

Each result lists every finding in check 5's group, in order.

- **Off cycle.** B with a listed schedule of 2026-09-01 and 2027-12-01, both `primary`:
  - The second item sits nearest slot 5, not 1. Index-based accrual would have paid it 9 months where the elapsed term is 21.
  - With two call events, `k` is 2, while the final valuation date sits nearest slot 18.
  - So the result is `listed-off-cycle` at index 1, then `final-valuation-off-cycle`.
- **No nearest slot.** B with frequency `monthly` and a listed schedule of 2026-09-01 and 2026-09-16:
  - The second item is 15 days from slot 0 and 15 days from slot 1, so it has no nearest slot.
  - `k` is 2, while the final valuation date sits nearest monthly slot 54.
  - So the result is `listed-off-cycle` at index 1, then `final-valuation-off-cycle`.
- **Mismatched offset.** B with `call.non_call_months` 7 gives `non-call-months-mismatch` alone.
- **Call before settlement.** B with settlement 2027-03-04 and `call.non_call_months` 0 gives `observation-before-settlement` at index 0 alone. The whole-month offset there would be 0 (184 days), so without this check the mapping would have passed.
- **Role unknown.** B with a listed schedule of 2026-09-01 alone, `primary`, and the final valuation term in conflict between 2026-09-01 and 2026-12-01, each `primary` from `supplement`:
  - With closes on 2026-09-01 that would call, `evaluateNote` at that `asOf` gives `unknown` with `final-valuation-conflict` and no row.
  - On 2026-08-31 it gives `live`, with `next` of kind `observation` on 2026-09-01.
  - Resolved to the first candidate, the event would be the final row. Resolved to the second, it would be a call.

### `finalPayout` on B

| Ratio given | Outcome | Cents |
| --- | --- | --- |
| `3/2` | `final-above-call` | 142500 |
| `19/20` | `final-above-call` | 142500 |
| `9499/10000` | `final-at-or-above-barrier` | 100000 |
| `3/5` | `final-at-or-above-barrier` | 100000 |
| `5999/10000` | `final-below-barrier` | 59990 |
| `1571/5000` | `final-below-barrier` | 31420 |
| `0/1` | `final-below-barrier` | 0 |

With B's rounding set to `none`, `119999/200000` (59.9995%) is `final-below-barrier` at 60000 cents, because the half cent rounds up.

### `noteMetrics` on B

Each row is reached with closes that put the worst ratio at the value shown. The first three are the research's worked example. The last is ALFA at `0.000001`, which rounds to `0/1` under `half-up-4dp`.

| Worst ratio | `toBarrier` | `toCall` | `belowBarrier` | `atOrAboveCall` |
| --- | --- | --- | --- | --- |
| `9/10` | `1/3` | `1/18` | false | false |
| `3/4` | `1/5` | `4/15` | false | false |
| `33/50` | `1/11` | `29/66` | false | false |
| `3/5` | `0/1` | `7/12` | false | false |
| `5999/10000` | `0/1` | `3501/5999` | true | false |
| `19/20` | `7/19` | `0/1` | false | true |
| `0/1` | `0/1` | null | true | false |

### Golden cases

The eleven cases in `fixtures/golden/`. The worst member named is the one whose ratio the row reaches. Every other member's ratio is higher on that row.

| Case | Terms | `asOf` | What the closes do | Expected |
| --- | --- | --- | --- | --- |
| `g01-called-first` | B | 2026-09-01 | Row 0, the stated first call: BRVO `76.470975`, raw 0.94995, rounds to `19/20` | `called`, 1 row, payout 104250, `unverified` `["dates.observation_schedule"]` |
| `g02-called-second` | L | 2026-12-15 | Row 0: worst CHRL `9499/10000`. Row 1: worst DLTA `1289/1250` | `called` on row 1 (2026-12-01), 2 rows, payout 106375 |
| `g03-live` | L | 2028-01-14 | Rows 0 to 5 worst below `19/20`. Closes on 2028-03-01 at `11/10` for every member are present and unread | `live`, 6 rows, `next` call index 6 on 2028-03-01, payout null |
| `g04-final-above-call` | L | 2031-03-03 | Rows 0 to 17 worst below `19/20`. Final: worst ALFA `19/20` | `matured`, 19 rows, `final-above-call` with `premiumMonths` 60, payout 142500 |
| `g05-final-fixed-par` | L | 2031-02-27 | As g04, with final worst BRVO `3/5` | `final-fixed`, 19 rows, `final-at-or-above-barrier`, payout 100000, `next` maturity on 2031-03-03 |
| `g06-final-below-boundary` | L | 2031-03-03 | As g04, with final worst CHRL `5999/10000` | `matured`, `final-below-barrier`, payout 59990 |
| `g07-final-deep` | L | 2031-03-03 | As g04, with final worst DLTA `1571/5000` | `matured`, `final-below-barrier`, payout 31420 |
| `g08-unknown-missing` | L | 2027-09-15 | Rows 0 to 2 worst below `19/20`. Row 3 (2027-06-01) has no BRVO close. Closes on 2027-09-01 would call | `unknown`, 4 rows, row 3 reason `close-missing` BRVO, payout null |
| `g09-unknown-conflict` | L | 2027-03-15 | Rows 0 and 1 worst below `19/20`. Row 2 (2027-03-01) has CHRL at `116.4` (source `synthetic-a`) and `111.6` (source `synthetic-b`), in that order | `unknown`, 3 rows, row 2 reason `close-conflict` CHRL `["116.4", "111.6"]`, that member's `close` null and `sources` `["synthetic-a", "synthetic-b"]` |
| `g10-truncate-provisional` | L with rounding `truncate-4dp`, and DLTA's initial level `advisor` from a new `advisor`-kind source `email-b` | 2026-12-15 | Row 0: BRVO `76.470975` truncates to `9499/10000`. Row 1: worst ALFA `19/20` | `called` on row 1, payout 106375, `unverified` `["underlyings.members[3].initial"]` |
| `g11-estimated-stop` | B | 2026-12-15 | Row 0 worst below `19/20`. Closes on 2026-12-01, B's generated entry 1, at `11/10` for every member | `unknown`, 1 row, reason `estimated-date` with index 1 and 2026-12-01, payout null |

g01 and g10 have the same row 0 close. Only the rounding rule separates a call from no call. g11 holds closes that would call on a planning date, and the engine does not call on them.

## Golden fixtures

### Layout

`fixtures/golden/<case>/` holds exactly three files:

- `terms.yaml`: the case's terms, schema 0.2, with no `identifiers`.
- `input.json`: `{ "synthetic": true, "case", "asOf", "calendar": "nyse-rules-1", "terms", "schedule", "closes" }`. Here `terms` is `loadTerms(terms.yaml).terms` and `schedule` is `observationSchedule(terms, nyseRulesCalendar())`, both as JSON. `closes` is sorted by date, then by member order, with g09's two CHRL closes in the order above.
- `expected/result.json`: `{ "synthetic": true, "case", "evaluation", "payouts", "metrics" }`. These are `evaluateNote`, `payoutSchedule` and `noteMetrics` on the input, written as `JSON.stringify(value, null, 2)` plus a newline.

### Closes

On every row's date each member has one close, except where the table says otherwise. Each close is the member's initial level times a ratio:

- **The worst member.** The table's ratio. Where the table names no member or ratio, the seed picks the worst member and a ratio in steps of 0.0001 from 0.6000 to 0.9499.
- **The others.** A ratio drawn from the seed, in steps of 0.0001, from the worst's ratio plus 0.0100 to 1.3000.

The close is written to at most 6 places. Where rounding to 6 places would change the member's rounded ratio, the generator moves the close by the smallest step that keeps it.

On the open day before and after each row's date, by `nyseRulesCalendar()`, each member also has a decoy close. The decoy is at `6/5` of initial when the row is `unknown` or its worst ratio is below the call level, and at `1/2` of initial otherwise. Reading a decoy would therefore change the row's outcome. Each case also has a close for every member on `asOf`, unless `asOf` is a row's date or a decoy's. Every close has source `synthetic-close`, except g09's two.

### Generator

`tools/generators/golden/generate.mjs`, registered as `golden` version 1, with seed `keel-s03-golden-1` and tree `fixtures/golden`. It imports the engine and core from their `.ts` sources under Node's built-in type stripping, with no build step and no flag, on the Node floor and the current LTS. If that cannot work, the builder stops and reports.

It checks its output in two stages:

1. Before writing, it checks each seeded value it would write. If the value would give a 9-character token passing the CUSIP check digit, or a close with 9 or more integer digits, it draws that value again. After 64 draws for one value it stops with an error naming the case.
2. After writing, it scans what it wrote with the repository tripwire, so that files new to Git are seen too:
   - It copies `fixtures/golden/` and the tripwire's two policy files into a fresh temporary Git repository.
   - It commits them there and sets `refs/remotes/origin/main`.
   - It runs `scanRepo` on that repository.
   - It fails with an error naming each file and class for any hit, and also when `scanRepo` returns an `error`.
   - A value this spec fixes is never redrawn, so a hit on one is an error.
   - The `tripwire` step of `pnpm verify` then scans the committed files as well.

## Pass M

Codex writes `tools/reference/payoff.py` at Pass 2 (Beni's ruling 2), before reading anything under `packages/plugin-mln/` or `tools/generators/golden/`. It works from this spec's Decisions and its sections Public API, Arithmetic through `noteMetrics`, and Golden fixtures, which together contain every rule, order and field it needs, including Decision 14's evidence rule. It uses the Python 3 standard library only. It reads each case's `input.json` and nothing else from the case, and computes the three results.

`python3 tools/reference/payoff.py fixtures/golden/` takes each case folder in sorted order. It prints `<case>: agree` when its three results deep-equal the case's `expected/result.json`, or `<case>: disagree <first differing JSON path>`. Its last line is `cases <n>, disagreements <d>`. It exits 0 only when `d` is 0 and `n` equals the number of case folders, which is at least 11. It exits 1 on a disagreement, and 2 on a missing or unreadable file.

As controls, the reference must exit 1 on two copies of `fixtures/golden/`:

- one in which one integer in one `expected/result.json` has changed by 1;
- one in which one `assumptions` entry has been removed.

Codex's Pass 2 comment reports all three runs. Under the review skill any disagreement is High until Beni adjudicates, and Pass M reruns on every later PR that touches the engine or the golden fixtures.

## Honesty tests (`payoff.honesty.test.ts`)

- **No payout without its inputs.** For each check-2 path, set in turn to `unknown` and to a conflict, `evaluateNote`, `payoutSchedule` and `finalPayout` return `unavailable` naming it, and no `payoutCents` or `*Cents` field appears.
- **Unsupported variants.** Each gives `unsupported` and no payout.
- **No status on a planning date.** No row has a date that is not evidenced.
  - On B with row 0 not called, every `asOf` from 2026-12-01 onward gives `unknown` with `estimated-date`, whatever the closes on generated dates say.
  - On L, setting any item's status to `estimate` or `assumed` gives the same once `asOf` reaches that item, unless an earlier row ends the evaluation.
- **No payout on an unestablished mapping.** Each mapping failure under Frozen values gives `unavailable` and no payout.
- **Chronology.** Each check in check 5's first four bullets gives `unavailable`. So does `estimate` or `assumed` on settlement, the first call observation or maturity, with `input-unevidenced`. In particular, an estimated maturity never yields `matured`.
- **No maturity before maturity.** On g05's input, with `asOf` moved to each date from the final valuation date up to the day before maturity, the status is `final-fixed`. It is `matured` only from maturity on.
- **A close conflict is never resolved.** The row is `unknown` and lists every distinct value. That member has no ratio, and the status is `unknown`.
- **Nothing carries.** On g08's input, deleting every decoy close leaves `evaluateNote` deep-equal, and moving BRVO's decoy onto the row's date changes it.
- **Nothing after `asOf` is read.** Adding closes dated after `asOf` leaves `evaluateNote` and `noteMetrics` deep-equal. That holds even when the added closes are invalid, and so does adding invalid closes for a ticker that names no member.
- **Nothing follows a `called` or `unknown` row**, in every golden case and every property case.
- **No holding value.** Changing `economics.issue_price`, `economics.estimated_value`, `economics.fees`, `issuer` and `identifiers` leaves every result deep-equal.
- **Final valuation date not known.** With the term absent, unknown or in conflict, no result is `final-fixed` or `matured`, and no row has kind `final`. No event of unknown role is ever a row, so no `called` status rests on one: the role-unknown example under Mapping failures gives `unknown`, never `called`.
- **An undated item bounds the status.** A listed `unknown` item as the last item, with the final valuation date absent and `asOf` after the last row's date, gives `unknown` with `date-unknown`, never `live`.
- **`provisional`** is true exactly when `unverified` is not empty, and every unverified path a function reads appears.
- **`noteMetrics` never falls back.** With one member's close missing on the latest date, it is `unavailable` even when an earlier date has every member's close.
- **No input changes.** Deep copies of `terms` and `closes` taken before each call equal them after.

## Non-goals

- Alerts and business-day arithmetic.
- Any UI or product text.
- Payment dates for a call or at maturity.
- Annualized returns, which need a fractional power (idea 57).
- Compound accrual, `daily-close` and `continuous` barriers, and physical delivery (ideas 54 to 56).
- Reading a missing close as "not called" when a known member is below the call level (idea 58).
- Evaluating a past planning date as a conditional row. Beni's ruling 5 chose to stop instead.
- Monte Carlo or any probability.
- Stress screens, which read `finalPayout` later.
- CSV import, close storage and split detection.
- Estimating the final valuation date.
- Any change to `packages/core`, the schemas or `fixtures/synthetic`.

## Acceptance criteria

All plugin tests run with `pnpm --filter @keel/plugin-mln test`. Each criterion names the test file that carries it.

| # | Criterion | Test file and what it asserts |
| --- | --- | --- |
| AC1 | Arithmetic matches the frozen values | `payoff.arithmetic.test.ts`: the rounding table, cent rounding with the 111673 tie, decimal equality (`95.1` equals `95.10`), every grammar in Arithmetic with one passing and one failing value each, an initial level of `9999999999.999999` parsed exactly, month addition with clamping, nearest slots including a tie, and the whole-month offset for B |
| AC2 | Payout schedules match | `payoff.payouts.test.ts`: `payoutSchedule` on B, on L, and on B with rate 2000 and `monthly` (the month table and its 54 call rows), including each row's `evidenced` |
| AC3 | Final payouts match | `payoff.final.test.ts`: the `finalPayout` table and the `none` case at 60000 |
| AC4 | Checks and events behave as specified | `payoff.evaluate.test.ts` asserts each of these:<br>- Each reason code in check order, including a case with two findings in one group, and unsupported after unknown.<br>- Each check-5 reason, and each mapping failure with its full list of findings.<br>- An estimated entry on the final valuation date becomes the final row.<br>- A listed `unknown` item as `next`, as an in-list `date-unknown` stop, and as a trailing `date-unknown` stop.<br>- An `estimated-date` stop at a generated entry, and at a listed item with status `estimate`.<br>- An ignored ticker, and equal duplicate closes merging their sources.<br>- With the final valuation date absent, `live` with empty `reasons` while the last listed item is in the future, and `unknown` with `final-valuation-absent` once it is reached.<br>- The role-unknown and call-before-settlement examples.<br>- `input-unevidenced` for each of settlement, the first call observation and maturity.<br>- Invalid closes after `asOf` and for nonmember tickers leaving the result unchanged.<br>- The member trace of Rows step 5 for each reason |
| AC5 | Metrics match | `payoff.metrics.test.ts`: the metrics table, including the `0/1` row with `toCall` null, `no-close`, and the no-fallback case |
| AC6 | Golden cases match, and their fixtures are well formed | `payoff.golden.test.ts`: `fixtures/golden/` holds exactly the eleven case folders named above, each with exactly its three files. For each case: `terms.yaml` loads with no errors, to `input.terms`. `input.schedule` equals `observationSchedule` on it. The three results, written as stated, equal `expected/result.json` byte for byte. Each case meets the golden table's expected values. Every JSON file has `"synthetic": true` |
| AC7 | Results are well formed across inputs | `payoff.properties.test.ts`: from a fixed-seed generator local to the test, the test counts and requires at least 1,000 evaluations, at least 100 of them ending on a trailing undated item. Across them:<br>- Row dates strictly increase, and `index` equals position.<br>- At most one row is `called` or `unknown`, and it is last.<br>- `status` agrees with the last row, the stop reason and `next`.<br>- `payoutCents` is set exactly for `called`, `final-fixed` and `matured`.<br>- No row date is a planning date.<br>- Two runs are deep-equal.<br>- `finalPayout` never decreases as the ratio rises, over a grid of 301 ratios from `0/1` to `3/2`, for each terms variant |
| AC8 | Honesty tests pass, and each fails when its guarded behaviour is broken | `payoff.honesty.test.ts` under `pnpm verify`; the PR body names, per mutant, the test that kills it |
| AC9 | The code is pure, and the check can fail | `payoff.purity.test.ts`, in S02 AC10's two parts, with its checker and stubs defined in this test. The differences from S02 AC10:<br>(a) **Files.** Every file under `packages/plugin-mln/src/` except `*.test.ts`, `test-support/` included, found by a recursive `import.meta.glob`. A committed pure file, `src/test-support/nested/depth-marker.ts`, sits two folders down. The test lists the folder recursively with `node:fs`, requires the glob's keys to equal that listing, and requires every listed file to end in `.ts`. With the glob narrowed to `./{*,*/*}.ts` the test fails on the listing comparison. The comparison and the extension rule are also run on synthetic listings holding `x.mts`, `x.js` and `x.json`, and each fails.<br>(b) **Specifiers.** A specifier passes when it is exactly `@keel/core`, or relative and resolving inside `packages/plugin-mln/src/` to a file that is not a test file. A product file, meaning one outside `test-support/`, must not resolve into `test-support/`.<br>(c) **Names.** `BigInt` joins the frozen list of pure names.<br>(d) **Escapes.** The checker also rejects any `\u` or `\x` escape sequence.<br>(e) **Runtime.** The runtime part calls every exported function on g01, g03, g08 and g11's inputs.<br>(f) **Controls.** The negative controls are S02 AC10's plus:<br>- `import "@keel/core/src/terms/load.ts"`<br>- `import x from "../../core/src/index.ts"`<br>- `import y from "./test-support/z.ts"` in a product file<br>- `import z from "./z.test.ts"`<br>- a `\u` escape in an identifier, and an `\x` escape in a string, each written so the backslash is present.<br>The positive controls are S02 AC10's, adjusted to this package, plus `import { observationSchedule } from "@keel/core"` and `BigInt(10) ** 6n` |
| AC10 | The build stays in its paths | At the builder's last commit, every path from `git diff --name-only origin/main...HEAD` is in Scope's list of files the build may change, and none is under `tools/reference/`. At the Pass 2 head:<br>- `test -f tools/reference/payoff.py` succeeds.<br>- `git log --format='%an' origin/main..HEAD -- tools/reference` is not empty, and every line is `Codex`.<br>- Every changed path is in the same list or under `tools/reference/` |
| AC11 | The entry exports exactly the stated names | `payoff.entry.test.ts`: the sorted runtime keys of `import * as entry from "./index.ts"` equal the five names |
| AC12 | `pnpm verify` stays green, including tripwire, network and determinism, and covers the package | `pnpm verify`, on Node 24.22.2 and 26.13.0, with the plugin's typecheck and tests in its output. `pnpm -s fixtures:trees` lists `fixtures/golden` |

## Mutation floor

At least three killed mutants per claim, listed in the PR body with the killing test. Required among them:

- **Boundaries.**
  - `>` for `≥` at the call level, on a call row and on the final row.
  - `>` for `≥` at the barrier level.
  - The unrounded worst ratio in the one-for-one payout.
  - Half-even or truncation for cents.
  - Each pair of performance rounding modes swapped.
- **Premium months.**
  - Index `i + 1` for `i`.
  - Months from 0 in place of `non_call_months`.
  - A step of 1 for every frequency.
  - `k − 1` or `k + 1` for the final row.
- **Mapping.**
  - Dropping the offset check.
  - Dropping the off-cycle check.
  - Accepting a tie for the nearest slot.
  - Measuring the offset from the trade date.
  - Accepting a first call observation on or before settlement.
- **Selection.**
  - Principal taken from `economics.issue_price`.
  - A worst tie going to the last member.
- **Closes.**
  - Carrying a close forward, or back.
  - Taking the first of two conflicting closes.
  - Reading a close dated after `asOf`.
  - Validating a close the function cannot read.
- **Sequencing.**
  - Continuing after a `called` row, or after an `unknown` row.
  - The barrier test before the call test on the final row.
- **Planning dates.**
  - Making a row on a past generated date.
  - Treating `estimate` or `assumed` as evidence.
- **Final valuation date and chronology.**
  - Keeping estimated entries after it.
  - Accepting a listed item after it, or after maturity.
  - Accepting a final valuation date after maturity, or on the settlement date.
  - Accepting an estimated settlement, first call observation or maturity.
  - Treating an event of unknown role as a call event.
  - Reporting `matured` before maturity.
  - Reporting `matured` with the term absent.
  - Reporting `live` on a trailing undated item.
- **Metrics.**
  - Falling back to an earlier date.
  - `w − b` for `toBarrier`, and `c − w` for `toCall`.
  - Dividing by a zero ratio.
- **Unverified.**
  - Dropping `dates.observation_schedule` from `unverified` for an estimated schedule.
  - Omitting `dates.settlement`.
- **Purity.** Removing any purity rule or runtime stub, or narrowing the glob.
- **Value policy.** Removing the generator's CUSIP guard, or its post-write scan, or scanning without committing the new files to the temporary repository, each unit-tested with a planted token. Also ignoring a scan `error`.

## Dependencies

None. The new package depends on `@keel/core` in this workspace and on `vitest` at the version the repo already pins.

## Claims list (PR body)

As in S00: every claim with its reproducing command, copied by the PM into the Pass 0 sealed appendix.
