# S03: Payoff engine

- Status: drafted 2026-11-10 by the PM (Claude), on Beni's ruling of 2026-11-08 to split the engine work ("Split, schedule first") and his three rulings of 2026-11-10, recorded under Decisions. No code exists yet.
- Release: non-release slice toward `v0.1.0`. Starts only after this spec merges and S02.1's build merges, because it reads `dates.final_valuation`.
- Builder: Cursor, Grok 4.7 Extra High (sensitive-path slice), in one draft PR on branch `s03/payoff-engine`. Codex adds the Pass M reference at Pass 2 (see Pass M).
- Sensitive paths the build touches: `packages/plugin-mln/**` and `fixtures/golden/**`, including its `expected/` files. At Pass 2 Codex also adds `tools/reference/**`. This spec PR touches none.
- Design rung: none (no UI).
- Stories served: 4.1 one lifecycle status, 4.2 worst name and distances, 4.3 the observation log, 5.2 and 5.4 the payout data behind the payoff and call-month charts, 11.2 golden tests runnable without the UI. Stories 7.1 and 7.2 read `finalPayout` in a later slice.

## Goal

keel can say, from the terms and dated closes alone, whether a note has been called, has matured or is still live, and what the terms pay in each case. Every number shows its working. A payout appears only when every input it rests on is known. A missing or conflicting close gives "unknown", never a guess. No output is a value of the note or of a holding.

## Decisions

Each of these is open to the plan challenge, except where a ruling of Beni's settles it.

1. **Payouts are integer cents per $1,000 of principal.** The terms state no principal amount, and `economics.issue_price` is the price paid, which can differ from principal. So the engine never reads `economics.*` and never scales by a quantity. A payout is what the terms pay per $1,000 of principal on a stated outcome: the research's payoff and call-month charts and alert A4 show these amounts. ADR-0005 states hard rule 3 for the note's value, the value slot. A payout values no holding, so the PM reads it as outside that rule. This is a reading of a hard rule: the plan challenge tests it, and if it is contested, Beni rules.
2. **Arithmetic is exact.** Closes, initial levels and ratios are parsed into exact fractions with `BigInt`. No floating-point number takes part in any result. Initial levels can carry 16 significant digits, beyond `Number.MAX_SAFE_INTEGER`.
3. **`underlyings.performance_rounding` rounds the ratio close ÷ initial.** `AGENTS.md` makes levels decimal ratios, so `half-up-4dp` turns 0.94995 into 0.9500 (95.00%). The schema allows `0dp` and `1dp`, which are coarse on a ratio, and the engine applies them literally. `none` keeps the exact fraction.
4. **The worst-of is the lowest rounded ratio.** A tie goes to the first tied member in the terms' member order.
5. **The tests are inclusive.** A call observation calls when the worst ratio is at or above `call.level`. On the final valuation date the call test runs first. If it fails, a worst ratio at or above `barrier.level` pays principal, and one below it pays principal times the worst ratio.
6. **Premium months come from the index, not from day counts.** A call row with schedule index `i` uses `call.non_call_months + i × step`, where `step` is 1, 3, 6 or 12 by `call.frequency`. The final row uses `non_call_months + k × step`, where `k` counts the call events before the final valuation date. A date moved by a holiday or listed off-cycle therefore never changes the premium. This reads `call.non_call_months`, which S02 does not. Idea 49 proposes checking that term against the first call observation, and nothing checks it yet.
7. **Money rounds once, half up, to the cent.** The terms state no rounding for amounts, so this is keel's convention, and every result names it in `assumptions`.
8. **Only the exactly dated close counts.** A row reads closes dated on its own date and nothing else: no carry forward or back, and never a close dated after `asOf`. Two closes for one member and date with different values make that row unknown, listing both, as hard rule 6 keeps sources side by side. An unknown row stops the evaluation, and so does a called row, because a call ends the note.
9. **The final valuation date comes from the term (Beni's ruling 1, 2026-11-10, "Schema term first").** It splits the schedule. Estimated entries after it are left out, and the result counts them. A listed entry after it, or a final valuation date after maturity, makes the evaluation unavailable. When the term is absent, unknown or in conflict, there is no final row, the status is never `matured`, and once every call event is past the status is `unknown`.
10. **Pass M's reference is Codex's, written at Pass 2 (Beni's ruling 2, 2026-11-10, "Codex at Pass 2").** Codex writes it from this spec before opening the engine code.
11. **Three variants are unsupported (Beni's ruling 3, 2026-11-10, "Simple, final, cash").** Compound accrual, `daily-close` and `continuous` barriers, and physical delivery have no formula in the terms that keel can apply exactly. A function that meets one returns `unsupported` with the reason and no partial result.
12. **Golden expected outputs come from the engine, and their independence comes from elsewhere.** A registered generator writes each case's inputs from a seed and its expected output by running the engine, so regeneration is byte-identical. Two things keep the expected files honest: the values this spec freezes, which a separate test asserts, and Pass M, which recomputes every case from its input alone.
13. **Golden values pass the tripwire by construction (idea 2).** No golden file holds a 9-character token that passes the CUSIP check digit, and no close has 9 or more integer digits. The generator draws again rather than writing one, and no allowlist entry is added. Every golden JSON file carries `"synthetic": true`, which the tripwire's price rule requires.

## Scope

### Package

A new workspace package, `@keel/plugin-mln`, in `packages/plugin-mln/`. Its entry is `src/index.ts`, with `@keel/core` as its one dependency (`workspace:*`) and `vitest` 5.0.5 as its one dev dependency. Its `vitest.config.mjs` uses the same network guard setup as core's.

Outside `packages/plugin-mln/`, `fixtures/golden/` and `tools/generators/golden/`, the build may change only these:

- `tools/fixtures/registry.mjs`, to register the generator.
- `tools/verify/steps.mjs`, to add the package to the `typecheck` and `tests` steps, with step names and order unchanged.
- The tooling tests that pin those two files.
- `pnpm-lock.yaml`, for the workspace entry.

The PR body lists each such file with its reason.

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
  | { code: "input-unknown" | "input-conflict"; path: string }
  | { code: "schedule-unavailable"; reasons: UnavailableReason[] }
  | { code: "final-valuation-absent" | "final-valuation-unknown" | "final-valuation-conflict" }
  | { code: "final-valuation-after-maturity" }
  | { code: "listed-after-final-valuation"; index: number }
  | { code: "date-unknown"; index: number }
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
  date: string;
  dateOrigin: "stated" | "generated" | "listed" | "final-valuation";
  dateStatus: Status;
  estimated: boolean;            // true exactly when dateOrigin is "generated"
  premiumMonths: number;
  members: MemberLevel[];        // in the terms' member order
  worst: { ticker: string; ratio: Ratio } | null;
  outcome: Outcome;
  payoutCents: number | null;
  reasons: MemberReason[];
}
export interface NextEvent { kind: "call" | "final"; scheduleIndex: number | null; date: string | null; estimated: boolean }
export interface Evaluation {
  kind: "evaluated";
  asOf: string;
  calendar: string;
  schedule: "estimated" | "listed";
  status: "live" | "called" | "matured" | "unknown";
  rows: Row[];
  next: NextEvent | null;
  payoutCents: number | null;
  reasons: PayoffReason[];
  unverified: string[];
  provisional: boolean;
  assumptions: Assumption[];
}
export function evaluateNote(terms: Terms, calendar: ExchangeCalendar, closes: readonly Close[], asOf: string): Evaluation | Unavailable | Unsupported;

export interface PayoutRow { scheduleIndex: number; date: string | null; estimated: boolean; premiumMonths: number; payoutCents: number }
export interface PayoutSchedule {
  kind: "payouts";
  calendar: string;
  schedule: "estimated" | "listed";
  calls: PayoutRow[];
  final: { date: string; premiumMonths: number; aboveCallCents: number; atOrAboveBarrierCents: number };
  unverified: string[];
  provisional: boolean;
  assumptions: Assumption[];
}
export function payoutSchedule(terms: Terms, calendar: ExchangeCalendar): PayoutSchedule | Unavailable | Unsupported;

export interface FinalPayout {
  kind: "final";
  ratio: Ratio;  // the given ratio after performance rounding
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
  toBarrier: Ratio;  // the fall, as a fraction of the worst name's close, that brings it to the barrier level
  toCall: Ratio;     // the rise, as a fraction of the worst name's close, that brings it to the call level
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

### Checks, in order

Every function runs the checks that apply to it in this order. It returns the first group that finds anything, listing every finding in that group in the order shown.

1. **Inputs.** `as-of-invalid` when `asOf` is not a real Gregorian date. One `close-invalid` per close, in input order, whose date is not a real Gregorian date, whose value fails the decimal grammar or is zero, or whose source fails `^[a-z0-9][a-z0-9-]{0,63}$`. `ratio-invalid` for a `finalPayout` ratio that fails its grammar. A close whose ticker names no member is not invalid. It is never read.
2. **Terms.** One `input-unknown` or `input-conflict` per path, in this order: `underlyings.performance_rounding`, `call.level`, `call.non_call_months`, `call.frequency`, `premium.rate_per_year`, `premium.accrual`, `barrier.level`, `barrier.observation`, `barrier.below_barrier`. `noteMetrics` checks only `underlyings.performance_rounding`, `call.level` and `barrier.level`.
3. **Variants.** The result is `unsupported` with `accrual-compound` (path `premium.accrual`), `barrier-daily-close` or `barrier-continuous` (path `barrier.observation`), and `below-barrier-physical-delivery` (path `barrier.below_barrier`), in that order. `noteMetrics` skips this group.
4. **Schedule.** If `observationSchedule(terms, calendar)` is `unavailable`, the result is one `schedule-unavailable` reason carrying its reasons unchanged. `noteMetrics` skips this group.
5. **Final valuation date.** This group applies when the term has a known value:
   - `final-valuation-after-maturity` when `dates.maturity` is known and earlier.
   - With a listed schedule, one `listed-after-final-valuation` per item that has a known date later than the final valuation date, or that follows an item dated on it.

   `payoutSchedule` and `finalPayout` also return `final-valuation-absent`, `final-valuation-unknown` or `final-valuation-conflict` here when the term is not known. `evaluateNote` does not, and `noteMetrics` skips this group.

### Events

From the schedule and the final valuation date, in schedule order:

- **Final valuation date known.**
  - With an estimated schedule, an entry dated before it is a call event, and an entry dated on it is the final event. An entry dated after it is left out, and the count goes in `estimated-after-final-valuation-left-out`.
  - With a listed schedule, every item before the first item dated on the final valuation date is a call event, including items with no known date. An item dated on it is the final event.
  - If no entry or item falls on it, the final event comes after the last call event.
  - The final event's date, origin `final-valuation` and status come from the term, so `k` is the number of call events.
- **Final valuation date absent, unknown or in conflict.** Every entry or item is a call event, and there is no final event.

### Rows

Events are taken in order:

1. An event with no known date (a listed `unknown` or `conflict` item) is never a row. If a later event has a known date on or before `asOf`, evaluation stops there with status `unknown`, and `reasons` holds one `date-unknown` with the item's index. Otherwise the event is `next`, with `date: null`, and evaluation stops.
2. An event dated after `asOf` is `next`, and evaluation stops.
3. Otherwise the event becomes a row. For each member in order:
   - An `unknown` or `conflict` initial level gives `initial-unknown` or `initial-conflict`.
   - The closes for that ticker dated exactly on the row's date are read. None gives `close-missing`. More than one distinct value gives `close-conflict`, listing each distinct value's first spelling in input order. Otherwise `close` is the first spelling, and `sources` lists every matching close's source in input order.
4. If any member has a reason, the row's outcome is `unknown` and `worst` is `null`. Otherwise each member's `ratio` is its close ÷ initial, rounded as the terms say, and `worst` follows Decision 4.
5. A call row is `called` when worst ≥ call level, with `payoutCents` of `100000 + premium(m)`, and `not-called` otherwise, with `payoutCents` null.
6. The final row is `final-above-call` when worst ≥ call level, `final-at-or-above-barrier` when worst ≥ barrier level, and `final-below-barrier` otherwise, with the payouts under Arithmetic.
7. After a row that is `called` or `unknown`, evaluation stops and `next` is `null`.

### Status

- `called` when the last row is `called`.
- `matured` when the last row is the final row and is not `unknown`. The payout falls on the maturity date, which this slice does not report.
- `unknown` in three cases:
  - The last row is `unknown`. `reasons` holds that row's reasons.
  - Evaluation stopped under Rows step 1. `reasons` holds the `date-unknown` reason.
  - There is no final event, and every call event is on or before `asOf` with none called. `reasons` holds `final-valuation-absent`, `final-valuation-unknown` or `final-valuation-conflict`.
- `live` otherwise, with `next` set and `reasons` empty.

`payoutCents` on the evaluation is the payout of a `called` or `matured` last row, and `null` otherwise.

### Shared result fields

- `unverified` lists, in `verificationSummary`'s order, each path in that function's list that the function reads and that `verificationSummary` counts as unverified:
  - `evaluateNote` reads every path in the list.
  - `payoutSchedule` and `finalPayout` read every path except the members' `initial` levels.
  - `noteMetrics` reads the `initial` levels, `underlyings.performance_rounding`, `call.level` and `barrier.level`.

  An estimated schedule therefore always puts `dates.observation_schedule` in an evaluation's `unverified`.
- `provisional` is `unverified.length > 0`.
- `assumptions` holds `per-1000-principal`, `cents-half-up` and `premium-months-by-index` always, in that order. `final-call-then-barrier` follows when the final valuation date is known, and then `estimated-after-final-valuation-left-out` when its count is at least 1. `noteMetrics` has no `assumptions`.

### `payoutSchedule`

One `PayoutRow` per call event, with `payoutCents` set to `100000 + premium(m)`. Then `final`, with the final valuation date, `premiumMonths` of `non_call_months + k × step`, `aboveCallCents` of `100000 + premium(that)` and `atOrAboveBarrierCents` of `100000`. It reads no close.

### `finalPayout`

Rounds the given ratio as the terms say, then applies Rows step 6 with the final event's `premiumMonths`. It serves the payoff diagram and the later stress screen, and it reads no close.

### `noteMetrics`

- Its date is the latest date on or before `asOf` on which any member's ticker has a close. If there is none, the result is unavailable with `no-close`.
- Every member is resolved on that date as in Rows step 3. If any member has a reason, the result is unavailable with those reasons. It never falls back to an earlier date.
- `worst` follows Decision 4, with `w` its ratio, `b` the barrier level and `c` the call level, both as ratios.
- `toBarrier` is `1 − b/w` when `w > b`, and `0/1` otherwise. `toCall` is `c/w − 1` when `w < c`, and `0/1` otherwise.
- `belowBarrier` is `w < b`, and `atOrAboveCall` is `w ≥ c`.

### Purity

No I/O, clock, randomness, console output or locale outside test files. Imports are `@keel/core` and relative files inside `packages/plugin-mln/src/` only. AC9 states how this is tested.

## Frozen values

Computed with exact fractions. The PR body prints the script.

### Rounding a ratio

| Raw ratio | `none` | `half-up-4dp` | `half-even-4dp` | `truncate-4dp` | `half-up-2dp` | `half-up-0dp` |
| --- | --- | --- | --- | --- | --- | --- |
| 0.94995 | `18999/20000` | `19/20` | `19/20` | `9499/10000` | `19/20` | `1/1` |
| 0.94985 | `18997/20000` | `9499/10000` | `4749/5000` | `4749/5000` | `19/20` | `1/1` |
| 0.599999 | `599999/1000000` | `3/5` | `3/5` | `5999/10000` | `3/5` | `1/1` |

### Base terms B

B is `fixtures/synthetic/terms/valid/minimal.yaml` as loaded, plus `dates.final_valuation: { value: 2031-02-26, status: primary, source: supplement }`. That gives:

- **Rate and step.** Rate 850 basis points, quarterly, 6 non-call months. The call level is 9500 and the barrier level 6000.
- **Rounding.** `half-up-4dp`, with a final barrier and one-for-one loss below it.
- **Schedule.** Its estimated schedule is S02's case 1. Entries 0 to 17 (2026-09-01 to 2030-12-02) are call events. The final valuation date, 2031-02-26, is a Wednesday. Entry 18, 2031-03-03, falls after it and is left out, so `k` is 18 and the final row's `premiumMonths` is 60.
- **Unverified.** `verificationSummary` gives `["dates.observation_schedule"]`.

`payoutSchedule` on B gives calls with `premiumMonths` `6 + 3i` and `payoutCents` 104250, 106375, 108500, 110625, 112750, 114875, 117000, 119125, 121250, 123375, 125500, 127625, 129750, 131875, 134000, 136125, 138250 and 140375. `final` is `{ date: "2031-02-26", premiumMonths: 60, aboveCallCents: 142500, atOrAboveBarrierCents: 100000 }`.

### Payouts under other terms

B with rate 2000 and frequency `monthly` is close to the research's illustrative terms. Its estimated schedule has 55 entries. Entries 0 to 53 are call events, the last on 2031-02-03, and entry 54, 2031-03-03, is left out. So call row `i` has `premiumMonths` `6 + i`, and the final row has 60. `payoutSchedule` on it gives, among its rows, the research's table:

| `premiumMonths` | 6 | 7 | 12 | 24 | 36 | 48 | 60 (final, `aboveCallCents`) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cents | 110000 | 111667 | 120000 | 140000 | 160000 | 180000 | 200000 |

At rate 2001 and `m` = 7 the amount is exactly 11672.5 cents. It rounds to 111673, where half-even would give 111672.

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

Each row is reached with closes that put the worst ratio at the value shown. The first three are the research's worked example.

| Worst ratio | `toBarrier` | `toCall` | `belowBarrier` | `atOrAboveCall` |
| --- | --- | --- | --- | --- |
| `9/10` | `1/3` | `1/18` | false | false |
| `3/4` | `1/5` | `4/15` | false | false |
| `33/50` | `1/11` | `29/66` | false | false |
| `3/5` | `0/1` | `7/12` | false | false |
| `5999/10000` | `0/1` | `3501/5999` | true | false |
| `19/20` | `7/19` | `0/1` | false | true |

### Golden cases

The ten cases in `fixtures/golden/`, all on B unless stated. The worst member named is the one whose ratio the row reaches. Every other member's ratio is higher on that row.

| Case | Terms | `asOf` | What the closes do | Expected |
| --- | --- | --- | --- | --- |
| `g01-called-first` | B | 2026-09-01 | Row 0: BRVO `76.470975`, raw 0.94995, rounds to `19/20` | `called`, 1 row, payout 104250 |
| `g02-called-second` | B | 2026-12-15 | Row 0: worst CHRL `9499/10000`. Row 1: worst DLTA `1289/1250` | `called` on row 1 (2026-12-01), 2 rows, payout 106375 |
| `g03-live` | B | 2028-01-14 | Rows 0 to 5 worst below `19/20`. Closes on 2028-03-01 at `11/10` for every member are present and unread | `live`, 6 rows, `next` call index 6 on 2028-03-01, payout null |
| `g04-final-above-call` | B | 2031-03-03 | Rows 0 to 17 worst below `19/20`. Final: worst ALFA `19/20` | `matured`, 19 rows, `final-above-call` with `premiumMonths` 60, payout 142500, one entry left out |
| `g05-final-par-listed` | B with a listed schedule: entries 0 to 17's dates, then 2031-02-26, each `primary` from `supplement` | 2031-03-03 | Rows 0 to 17 worst below `19/20`. Final: worst BRVO `3/5` | `matured`, 19 rows, `final-at-or-above-barrier`, payout 100000, `unverified` empty, nothing left out |
| `g06-final-below-boundary` | B | 2031-03-03 | As g04, with final worst CHRL `5999/10000` | `matured`, `final-below-barrier`, payout 59990 |
| `g07-final-deep` | B | 2031-03-03 | As g04, with final worst DLTA `1571/5000` | `matured`, `final-below-barrier`, payout 31420 |
| `g08-unknown-missing` | B | 2027-09-15 | Rows 0 to 2 worst below `19/20`. Row 3 (2027-06-01) has no BRVO close. Closes on 2027-09-01 would call | `unknown`, 4 rows, row 3 reason `close-missing` BRVO, payout null |
| `g09-unknown-conflict` | B | 2027-03-15 | Rows 0 and 1 worst below `19/20`. Row 2 (2027-03-01) has CHRL at `116.4` (source `synthetic-a`) and `111.6` (source `synthetic-b`), in that order | `unknown`, 3 rows, row 2 reason `close-conflict` CHRL `["116.4", "111.6"]` |
| `g10-truncate-provisional` | B with rounding `truncate-4dp`, and DLTA's initial level `advisor` from a new `advisor`-kind source `email-b` | 2026-12-15 | Row 0: BRVO `76.470975` truncates to `9499/10000`. Row 1: worst ALFA `19/20` | `called` on row 1, payout 106375, `unverified` `["dates.observation_schedule", "underlyings.members[3].initial"]` |

g01 and g10 have the same row 0 close. Only the rounding rule separates a call from no call.

## Golden fixtures

### Layout

`fixtures/golden/<case>/` holds exactly three files:

- `terms.yaml`: the case's terms, with no `identifiers`.
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

Before it writes, it checks every token it would write with the tripwire's CUSIP rule and every close for 9 or more integer digits. On a hit it draws again from the seed stream. It never adds an allowlist entry.

## Pass M

Codex writes `tools/reference/payoff.py` at Pass 2 (Beni's ruling 2), before reading anything under `packages/plugin-mln/` or `tools/generators/golden/`, from this spec's sections Arithmetic through `noteMetrics` and Golden fixtures. It uses the Python 3 standard library only. It reads each case's `input.json` and nothing else from the case, and computes the three results.

`python3 tools/reference/payoff.py fixtures/golden/` takes each case folder in sorted order. It prints `<case>: agree` when its three results deep-equal the case's `expected/result.json`, or `<case>: disagree <first differing JSON path>`. Its last line is `cases <n>, disagreements <d>`. It exits 0 only when `d` is 0 and `n` equals the number of case folders, which is at least 10. It exits 1 on a disagreement, and 2 on a missing or unreadable file.

As a control, the reference must exit 1 on a copy of `fixtures/golden/` in which one integer in one `expected/result.json` has changed by 1. Codex's Pass 2 comment reports both runs. Under the review skill any disagreement is High until Beni adjudicates, and Pass M reruns on every later PR that touches the engine or the golden fixtures.

## Honesty tests (`payoff.honesty.test.ts`)

- No payout without its inputs. For each check-2 path, set in turn to `unknown` and to a conflict, `evaluateNote`, `payoutSchedule` and `finalPayout` return `unavailable` naming it, and no `payoutCents` or `*Cents` field appears.
- Each unsupported variant gives `unsupported` and no payout.
- A close conflict is never resolved: the row is `unknown`, lists every distinct value, gives that member no ratio, and the status is `unknown`.
- Nothing carries. On g08's input, deleting every decoy close leaves `evaluateNote` deep-equal, and moving BRVO's decoy onto the row's date changes it.
- Nothing after `asOf` is read: adding closes dated after `asOf` leaves `evaluateNote` and `noteMetrics` deep-equal.
- Nothing follows a `called` or `unknown` row, in every golden case and every property case.
- No holding value. Changing `economics.issue_price`, `economics.estimated_value`, `economics.fees`, `issuer` and `identifiers` leaves every result deep-equal.
- With the final valuation date absent, unknown or in conflict, no result is `matured`. No row has kind `final`, and once every call event is past the status is `unknown` with the matching reason.
- Estimated dates stay estimated. Every row on a generated date has `estimated: true` and `dateStatus: "estimate"`. Every evaluation over an estimated schedule lists `dates.observation_schedule` in `unverified` and has `provisional: true`.
- `provisional` is true exactly when `unverified` is not empty, and every unverified path a function reads appears.
- `noteMetrics` never falls back. With one member's close missing on the latest date, it is `unavailable` even when an earlier date has every member's close.
- No input changes: deep copies of `terms` and `closes` taken before each call equal them after.

## Non-goals

- Alerts and business-day arithmetic.
- Any UI or product text.
- Payment dates for a call or at maturity.
- Annualized returns, which need a fractional power (idea 57).
- Compound accrual, `daily-close` and `continuous` barriers, and physical delivery (ideas 54 to 56).
- Reading a missing close as "not called" when a known member is below the call level (idea 58).
- Monte Carlo or any probability.
- Stress screens, which read `finalPayout` later.
- CSV import, close storage and split detection.
- Estimating the final valuation date.
- Checking `call.non_call_months` against the first call observation (idea 49).
- Any change to `packages/core`, the schema or `fixtures/synthetic`.

## Acceptance criteria

All plugin tests run with `pnpm --filter @keel/plugin-mln test`. Each criterion names the test file that carries it.

| # | Criterion | Test file and what it asserts |
| --- | --- | --- |
| AC1 | Arithmetic matches the frozen values | `payoff.arithmetic.test.ts`: the rounding table, cent rounding with the 111673 tie, decimal equality (`95.1` equals `95.10`), every grammar in Arithmetic with one passing and one failing value each, and an initial level of `9999999999.999999` parsed exactly |
| AC2 | Payout schedules match | `payoff.payouts.test.ts`: `payoutSchedule` on B, on B with rate 2000 and `monthly` (the month table and its 54 call rows), and on B with g05's listed schedule |
| AC3 | Final payouts match | `payoff.final.test.ts`: the `finalPayout` table and the `none` case at 60000 |
| AC4 | Checks and events behave as specified | `payoff.evaluate.test.ts`: each reason code in check order, including a case with two findings in one group. Unsupported after unknown. `final-valuation-after-maturity`. `listed-after-final-valuation`. An estimated entry on the final valuation date becomes the final row. A listed `unknown` item both as `next` and as a `date-unknown` stop. An ignored ticker. Equal duplicate closes merging their sources. And `final-valuation-absent` both before and after the last call event |
| AC5 | Metrics match | `payoff.metrics.test.ts`: the metrics table, `no-close`, and the no-fallback case |
| AC6 | Golden cases match, and their fixtures are well formed | `payoff.golden.test.ts`: `fixtures/golden/` holds exactly the ten case folders named above, each with exactly its three files. For each case: `terms.yaml` loads with no errors, to `input.terms`. `input.schedule` equals `observationSchedule` on it. The three results, written as stated, equal `expected/result.json` byte for byte. Each case meets the golden table's expected values. Every JSON file has `"synthetic": true` |
| AC7 | Results are well formed across inputs | `payoff.properties.test.ts`: from a fixed-seed generator local to the test, the test counts and requires at least 1,000 evaluations. Across them: row dates strictly increase, `index` equals position, at most one row is `called` or `unknown` and it is last, `status` agrees with the last row, `payoutCents` is set exactly for `called` and `matured`, two runs are deep-equal, and `finalPayout` never decreases as the ratio rises over a grid of 301 ratios from `0/1` to `3/2` for each terms variant |
| AC8 | Honesty tests pass, and each fails when its guarded behaviour is broken | `payoff.honesty.test.ts` under `pnpm verify`; the PR body names, per mutant, the test that kills it |
| AC9 | The code is pure, and the check can fail | `payoff.purity.test.ts`, in S02 AC10's two parts, with its checker and stubs defined in this test. The differences from S02 AC10: (a) **Files.** The files are every file under `packages/plugin-mln/src/` except `*.test.ts` and anything under `test-support/`, found by a recursive `import.meta.glob`. The test also lists that folder recursively with `node:fs`, requires the glob's keys to equal that listing, and requires every listed file to end in `.ts`. (b) **Specifiers.** A specifier passes when it is exactly `@keel/core`, or relative and resolving inside `packages/plugin-mln/src/` to a file that is neither a test file nor under `test-support/`. (c) **Names.** `BigInt` joins the frozen list of pure names. (d) **Escapes.** The checker also rejects any `\u` or `\x` escape sequence. (e) **Runtime.** The runtime part calls every exported function on g01, g03 and g08's inputs. (f) **Controls.** The negative controls are S02 AC10's plus `import "@keel/core/src/terms/load.ts"`, `import x from "../../core/src/index.ts"`, `import y from "./test-support/z.ts"`, `import z from "./z.test.ts"`, and a `\u` escape in an identifier and an `\x` escape in a string, each written so the backslash is present. The positive controls are S02 AC10's, adjusted to this package, plus `import { observationSchedule } from "@keel/core"` and `BigInt(10) ** 6n` |
| AC10 | The build stays in its paths | `git diff --stat origin/main...HEAD -- packages/core schemas fixtures/synthetic tools/tripwire tools/reference` prints nothing at the builder's last commit. After Pass 2, `git log --format='%h %an' origin/main..HEAD -- tools/reference` lists only Codex. The PR body lists every changed file outside `packages/plugin-mln/`, `fixtures/golden/` and `tools/generators/golden/` with its reason |
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
- **Selection.**
  - Principal taken from `economics.issue_price`.
  - A worst tie going to the last member.
- **Closes.**
  - Carrying a close forward, or back.
  - Taking the first of two conflicting closes.
  - Reading a close dated after `asOf`.
- **Sequencing.**
  - Continuing after a `called` row, or after an `unknown` row.
  - The barrier test before the call test on the final row.
- **Final valuation date.**
  - Keeping estimated entries after it.
  - Accepting a listed item after it, or a date after maturity.
  - Reporting `matured` with the term absent.
- **Metrics.**
  - Falling back to an earlier date.
  - `w − b` for `toBarrier`, and `c − w` for `toCall`.
- **Unverified.** Dropping `dates.observation_schedule` from `unverified` for an estimated schedule.
- **Purity.** Removing any purity rule or runtime stub, or narrowing the glob.
- **Value policy.** The generator's CUSIP guard, unit-tested with a planted check-digit token.

## Dependencies

None. The new package depends on `@keel/core` in this workspace and on `vitest` at the version the repo already pins.

## Claims list (PR body)

As in S00: every claim with its reproducing command, copied by the PM into the Pass 0 sealed appendix.
