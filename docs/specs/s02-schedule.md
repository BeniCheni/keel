# S02: Observation schedule and exchange calendar

- Status: drafted 2026-11-08 by the PM (Claude), on Beni's ruling of 2026-11-08 to split the engine work and build the schedule first. It goes through the plan challenge (Codex, Pass 1) before any code exists.
- Release: non-release slice toward `v0.1.0`. Starts only after this spec merges.
- Builder: Cursor, Grok 4.7 Extra High (sensitive-path slice), in one draft PR on branch `s02/schedule`.
- Sensitive paths the build touches: `packages/core/**`. This spec PR touches none.
- Design rung: none (no UI).
- Stories served: 3.4 estimated observation dates from the stated rule, 3.5 the exchange-holiday half of date sanity. Stories 5.3, A3 and A9 read this output in later slices.

## Goal

keel can say which dates a note observes on. When the terms list those dates, keel shows them as listed. When they do not, keel generates them from the stated rule and tags each one ESTIMATE. When the inputs do not allow that, keel says so and generates nothing. No date is ever presented as more certain than its source, and nothing picks a winner between conflicting dates.

## Decisions

Each of these is open to the plan challenge.

1. **The calendar is rule-generated code, passed in.** Core does no I/O and the default build makes no outbound request, so the calendar cannot be fetched. `nyseRulesCalendar()` computes closures from fixed rules with no dependency, and returns plain data that every schedule function takes as an argument (ADR-0002).
2. **One calendar, NYSE, for every underlying.** The terms schema has no calendar field, and adding one is a schema change this slice does not make. Every generated entry names the calendar in its `rule`, so the assumption is visible.
3. **Coverage is 2026 to 2060 inclusive.** Rules cannot know an unscheduled closure, and past years contain some (for example 2025-01-09), so coverage starts at 2026. A date outside coverage is flagged `outside-calendar`, never reported as an ordinary open day.
4. **Generated dates step from the stated first call observation.** `dates.first_call_observation` is the anchor, and it is entry 0 exactly as stated: it is never moved, even if it falls on a closed day, because a stated date is not this slice's to change. A closed-day anchor is flagged instead.
5. **`call.non_call_months` is not read.** The anchor already carries that information. Checking that the two agree needs a tolerance no source gives, so that check is left out and goes to the ideas file.
6. **Closed days roll forward** to the next open day ("following"). The terms do not state a convention, and the output is tagged ESTIMATE.
7. **A conflict or unknown input means no generated schedule.** Hard rule 6 keeps conflicting sources side by side. Generating from either candidate, or only up to the earlier one, would choose between them or imply they agree.

## Scope

All new code lives in `packages/core/src/schedule/` and is exported from `packages/core/src/index.ts`. `loadTerms`, `dateFlags` and `verificationSummary` keep their behaviour and signatures. No new dependency, schema change, fixture file or generator.

### Calendar rules

Closures for each year, each a weekday:

| Name, as returned | Date |
| --- | --- |
| `New Year's Day` | January 1. If Sunday, the Monday after. If Saturday, no closure |
| `Martin Luther King, Jr. Day` | Third Monday of January |
| `Washington's Birthday` | Third Monday of February |
| `Good Friday` | Two days before Gregorian Easter Sunday |
| `Memorial Day` | Last Monday of May |
| `Juneteenth National Independence Day` | June 19, observed |
| `Independence Day` | July 4, observed |
| `Labor Day` | First Monday of September |
| `Thanksgiving Day` | Fourth Thursday of November |
| `Christmas Day` | December 25, observed |

"Observed" means a Saturday date closes the Friday before and a Sunday date closes the Monday after. New Year's Day is the exception above, because NYSE Rule 7.2 keeps the exchange open when that Friday ends a monthly or yearly accounting period, and December 31 does.

Early closes still produce a closing price, so they are not closures.

The rules agree with the holiday table NYSE publishes for 2026 to 2028 (<https://www.nyse.com/trade/hours-calendars>, read 2026-11-08). Published holiday dates are calendar information, not prices, so this spec treats them as outside hard rule 4; the plan challenge tests that.

### Public API

```ts
export interface ExchangeClosure { date: string; name: string }
export interface ExchangeCalendar {
  id: string;
  fromYear: number;
  toYear: number;
  closures: readonly ExchangeClosure[]; // ascending by date, no duplicates
}
export function nyseRulesCalendar(): ExchangeCalendar; // id "nyse-rules-1", 2026 to 2060

export type ScheduleFlag = "weekend" | "exchange-holiday" | "outside-calendar";
export function scheduleDateFlags(isoDate: string, calendar: ExchangeCalendar): ScheduleFlag[];
export function termDateFlags(terms: Terms, calendar: ExchangeCalendar): Record<string, ScheduleFlag[]>;

export interface ScheduleInput { path: string; status: TermStatus }

export interface StatedEntry {
  index: 0;
  date: string;
  origin: "stated";
  status: Exclude<TermStatus, "unknown" | "conflict">;
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
  calendar: string; // the calendar's id
  inputs: ScheduleInput[];
  entries: (StatedEntry | GeneratedEntry)[];
}

export interface ListedEntry { index: number; date: string | null; term: Term<string> }
export interface ListedSchedule { kind: "listed"; entries: ListedEntry[] }

export type UnavailableReason =
  | { code: "input-unknown" | "input-conflict"; path: string }
  | { code: "anchor-after-maturity"; path: "dates.first_call_observation" }
  | { code: "outside-calendar"; date: string };
export interface UnavailableSchedule { kind: "unavailable"; reasons: UnavailableReason[] }

export type ScheduleResult = EstimatedSchedule | ListedSchedule | UnavailableSchedule;
export function observationSchedule(terms: Terms, calendar: ExchangeCalendar): ScheduleResult;

export type ScheduleDiffResult =
  | { kind: "diff"; calendar: string; inBoth: string[]; onlyEstimated: string[]; onlyListed: string[]; noKnownDate: number[] }
  | { kind: "no-list" }
  | UnavailableSchedule;
export function scheduleDiff(terms: Terms, calendar: ExchangeCalendar): ScheduleDiffResult;
```

### `scheduleDateFlags`

`weekend` for a Saturday or Sunday, from the date alone. `exchange-holiday` when the date is a closure in the calendar. `outside-calendar` when the date's year is outside `fromYear` to `toYear`. The order in the array is the order just given. An outside date never gets `exchange-holiday`.

### `termDateFlags`

The same keys `loadTerms` returns in `dateFlags` for the same file, including `.candidates[i]` paths and `dates.observation_schedule[i]`, with `scheduleDateFlags` as the value. It never rejects a date.

### `observationSchedule`

1. If `terms.dates.observation_schedule` is present, return `listed`: one entry per list item, in file order. `date` is the value, or `null` for `unknown` and `conflict`. `term` is the item unchanged, so a conflict keeps every candidate in file order. A listed schedule is not thereby verified: `verificationSummary` decides that.
2. Otherwise read the three inputs in this order: `dates.first_call_observation`, `dates.maturity`, `call.frequency`. If any is `unknown` or `conflict`, return `unavailable` with one `input-unknown` or `input-conflict` reason per such input, in that order, and nothing else.
3. If the anchor is after maturity, return `unavailable` with `anchor-after-maturity`.
4. Otherwise `step` is 1, 3, 6 or 12 months for `monthly`, `quarterly`, `semiannual` or `annual`. Entry 0 is the anchor, `origin: "stated"`, with the anchor's status.
5. For `k` from 1: `unadjusted` is the anchor plus `k × step` months, computed from the anchor each time, with the day clamped to the length of the target month. So a January 31 anchor gives February 28 and then March 31.
   - If `unadjusted` is after maturity, stop.
   - Roll forward one day at a time while the date is a Saturday, a Sunday or a closure.
   - If `unadjusted` or any date reached while rolling is outside the calendar's years, return `unavailable` with one `outside-calendar` reason naming that date. There is no partial schedule.
   - If the rolled date is after maturity, leave it out and continue to the next `k`, which then stops.
6. Each generated entry has `rule` exactly `Generated from the stated first call observation, <every>, each moved to the next open day on calendar <id>.`, where `<every>` is `every month`, `every 3 months`, `every 6 months` or `every 12 months`.
7. `inputs` lists the three inputs and their statuses in the order of step 2.

### `scheduleDiff`

Returns `no-list` when the terms have no observation schedule. Otherwise it computes the estimate from the terms with the list ignored; if that is `unavailable`, it returns that result. Dates are compared as sets: `inBoth`, `onlyEstimated` and `onlyListed` are ascending, compared by code unit. `noKnownDate` holds the indices of list items with no known value, ascending. Conflict candidates appear in no set. It does not pair dates up or guess which one moved.

### Purity

No I/O, clock, randomness or locale: no `Date`, `Intl`, `localeCompare`, `Math.random`, `process` or Node built-ins outside test files. ADR-0009's Path A runs this core inside JavaScriptCore with no host shim. `packages/core/src/terms/dates.ts` already holds a Gregorian `dayOfWeek` and `isLeapYear`, and the build reuses them.

## Frozen values

`nyseRulesCalendar()` returns 345 closures. Joining each as `<date> <name>\n` in order gives a text whose SHA-256 is `e438df993de99cc780739a56901ea276353bc094675a0800cf1ac500a28d5fd5`.

Closures by year, from the published table for 2026 to 2028 and from the rules after that:

| Year | Closures |
| --- | --- |
| 2026 | 01-01 01-19 02-16 04-03 05-25 06-19 07-03 09-07 11-26 12-25 |
| 2027 | 01-01 01-18 02-15 03-26 05-31 06-18 07-05 09-06 11-25 12-24 |
| 2028 | 01-17 02-21 04-14 05-29 06-19 07-04 09-04 11-23 12-25 |
| 2029 | 01-01 01-15 02-19 03-30 05-28 06-19 07-04 09-03 11-22 12-25 |
| 2034 | 01-02 01-16 02-20 04-07 05-29 06-19 07-04 09-04 11-23 12-25 |
| 2035 | 01-01 01-15 02-19 03-23 05-28 06-19 07-04 09-03 11-22 12-25 |
| 2038 | 01-01 01-18 02-15 04-23 05-31 06-18 07-05 09-06 11-25 12-24 |
| 2060 | 01-01 01-19 02-16 04-16 05-31 06-18 07-05 09-06 11-25 12-24 |

### Generated schedules

Each case starts from `fixtures/synthetic/terms/valid/minimal.yaml` as loaded, with only the listed values changed. The first date is entry 0; `a<b` means generated date `a` with `unadjusted` date `b`, and a date alone has `unadjusted` equal to `date`.

| # | First call | Maturity | Frequency | Entries | Expected dates |
| --- | --- | --- | --- | ---: | --- |
| 1 | as loaded, 2026-09-01 | as loaded, 2031-03-03 | as loaded, quarterly | 19 | 2026-09-01 2026-12-01 2027-03-01 2027-06-01 2027-09-01 2027-12-01 2028-03-01 2028-06-01 2028-09-01 2028-12-01 2029-03-01 2029-06-01 2029-09-04<2029-09-01 2029-12-03<2029-12-01 2030-03-01 2030-06-03<2030-06-01 2030-09-03<2030-09-01 2030-12-02<2030-12-01 2031-03-03<2031-03-01 |
| 2 | 2027-01-31 | 2027-07-30 | monthly | 6 | 2027-01-31 2027-03-01<2027-02-28 2027-03-31 2027-04-30 2027-06-01<2027-05-31 2027-06-30 |
| 3 | 2028-02-29 | 2033-02-28 | annual | 6 | 2028-02-29 2029-02-28 2030-02-28 2031-02-28 2032-03-01<2032-02-29 2033-02-28 |
| 4 | 2026-12-25 | 2028-12-26 | semiannual | 5 | 2026-12-25 2027-06-25 2027-12-27<2027-12-25 2028-06-26<2028-06-25 2028-12-26<2028-12-25 |
| 5 | 2026-12-25 | 2028-12-25 | semiannual | 4 | 2026-12-25 2027-06-25 2027-12-27<2027-12-25 2028-06-26<2028-06-25 |
| 6 | 2026-04-03 | 2027-01-04 | quarterly | 4 | 2026-04-03 2026-07-06<2026-07-03 2026-10-05<2026-10-03 2027-01-04<2027-01-03 |
| 7 | 2027-03-15 | 2027-03-15 | monthly | 1 | 2027-03-15 |

Case 4 against case 5 is the maturity boundary: 2028-12-25 is on or before both maturities, and rolls to 2028-12-26, which only case 4 includes.

### Unavailable schedules

| # | Input | Expected `reasons` |
| --- | --- | --- |
| 8 | `fixtures/synthetic/terms/valid/example-autocall.yaml` as loaded (its maturity is in conflict) | `[{ code: "input-conflict", path: "dates.maturity" }]` |
| 9 | Case 1 with first call, maturity and frequency all `unknown` | three `input-unknown` reasons, in the three paths' order |
| 10 | First call 2027-03-16, maturity 2027-03-15 | `[{ code: "anchor-after-maturity", path: "dates.first_call_observation" }]` |
| 11 | First call 2060-11-30, maturity 2061-01-31, monthly, with `nyseRulesCalendar()` | `[{ code: "outside-calendar", date: "2061-01-30" }]` |
| 12 | First call 2028-11-30, maturity 2029-03-01, monthly, with a calendar `{ id: "test-2028", fromYear: 2028, toYear: 2028, closures: [] }` | `[{ code: "outside-calendar", date: "2029-01-01" }]`, reached while rolling from 2028-12-30 |

### Date flags

| Date | Flags, with `nyseRulesCalendar()` |
| --- | --- |
| 2026-11-26 | `exchange-holiday` |
| 2026-07-03 | `exchange-holiday` |
| 2026-07-04 | `weekend` |
| 2027-12-31 | none |
| 2028-01-01 | `weekend` |
| 2025-12-25 | `outside-calendar` |
| 2025-12-27 | `weekend`, `outside-calendar` |
| 2060-12-31 | none |
| 2061-01-03 | `outside-calendar` |

`termDateFlags` on `example-autocall.yaml` returns exactly:

```json
{
  "dates.trade": ["weekend"],
  "dates.settlement": [],
  "dates.maturity.candidates[0]": [],
  "dates.maturity.candidates[1]": ["weekend"],
  "dates.first_call_observation": ["weekend"]
}
```

### Diff

Case 1's terms, with `dates.observation_schedule` set to `2026-09-01` (primary), `2026-12-01` (primary), `2027-03-02` (user), and a conflict between `2027-06-01` and `2027-06-02`, give `inBoth` `[2026-09-01, 2026-12-01]`, `onlyListed` `[2027-03-02]`, `noKnownDate` `[3]`, and `onlyEstimated` the other 17 dates from case 1, including 2027-06-01.

## Honesty tests (`schedule.honesty.test.ts`)

- A generated entry always has status `estimate` and label `ESTIMATE`, and names its calendar in `rule`, for every input status including all-`primary` inputs.
- A conflict in any of the three inputs generates nothing, even between two `primary` candidates, and names no candidate as the value.
- `unknown` in any of the three inputs generates nothing.
- A listed conflict keeps `date: null` and every candidate in file order. A listed `unknown` keeps `date: null`.
- `observationSchedule`, `scheduleDiff` and `termDateFlags` never change `terms`: a deep copy taken before the call equals `terms` after it.
- A generated schedule never makes `dates.observation_schedule` verified: `verificationSummary` returns the same object before and after, and the path stays unverified when the list is absent.
- A date outside the calendar is never reported as open: no flags array for such a date lacks `outside-calendar`, and a generated schedule reaching one is `unavailable`, never partial.
- A stated anchor on a closed day stays as stated in entry 0 and is flagged by `termDateFlags`.

## Non-goals

The payoff engine, metrics and trace (S03). Any UI, including the observation calendar. Writing, editing or replacing terms files. Business-day arithmetic for alerts (T−5 and the like). A note-specific calendar or any schema change. Unscheduled closures, half days and market disruption rules. Checking `call.non_call_months` against the anchor. Importing an official schedule from a document. Payment dates, which the terms do not state. Pass M: its command compares payoffs on golden fixtures, and this slice has neither.

## Acceptance criteria

All schedule tests run with `pnpm --filter @keel/core test schedule`. Each criterion names the test file that carries it.

| # | Criterion | Test file and what it asserts |
| --- | --- | --- |
| AC1 | The calendar matches the frozen values | `schedule.calendar.test.ts`: count 345, the SHA-256 above, each year in the closures table, ascending, no duplicates, every closure a weekday, `id`, `fromYear` and `toYear` |
| AC2 | Generated schedules match, entry by entry | `schedule.generate.test.ts`: cases 1 to 7, deep-equal on `date`, `unadjusted`, `origin`, `status` and `label`, plus `rule` for each of the four frequencies, and `inputs` |
| AC3 | Unavailable schedules match | `schedule.generate.test.ts`: cases 8 to 12, deep-equal on `reasons` |
| AC4 | A listed schedule is returned as listed | `schedule.listed.test.ts`: file order, `date` and `term` for `primary`, `user`, `unknown` and `conflict` items, with no generated entry and regardless of the three inputs' statuses |
| AC5 | The diff matches | `schedule.listed.test.ts`: the diff case above, `no-list` with no schedule, and `unavailable` when the estimate is |
| AC6 | Date flags match | `schedule.flags.test.ts`: the table above, the frozen `termDateFlags` object, and, for every valid fixture, the same key set as the loader's `dateFlags` |
| AC7 | Generated schedules are well formed across inputs | `schedule.properties.test.ts`: over at least 1,000 cases from a fixed-seed generator local to the test, entries are strictly increasing, every generated date is an open day within the calendar and on or before maturity, and two runs are deep-equal |
| AC8 | Honesty tests pass, and each fails when its guarded behaviour is broken | `schedule.honesty.test.ts` under `pnpm verify`; the PR body names, per mutant, the test that kills it |
| AC9 | S01's behaviour is unchanged | `git diff --stat origin/main...HEAD -- packages/core/src/terms schemas fixtures tools` prints nothing, and `pnpm --filter @keel/core test terms` passes |
| AC10 | The code is pure | `git ls-files packages/core/src/schedule \| grep -c '\.ts$'` is at least 1, and `git grep -nE 'new Date\|Date\.now\|Intl\.\|localeCompare\|Math\.random\|performance\.\|process\.\|from "node:\|require\(' -- packages/core/src/schedule ':!packages/core/src/schedule/*.test.ts'` exits 1 with no output |
| AC11 | `pnpm verify` stays green, including tripwire, network and determinism | `pnpm verify`, on Node 24.22.2 and 26.13.0 |

## Mutation floor

At least three killed mutants per claim, listed in the PR body with the killing test. Required among them: closing the December 31 before a Saturday New Year's Day; closing the Friday before a Sunday holiday; Good Friday one day off; fourth Monday in place of last Monday of May; last Thursday in place of fourth Thursday of November (2029); rolling backward in place of forward; stepping from the previous date in place of the anchor; not clamping the day; excluding a date equal to maturity; keeping a rolled date after maturity; rolling entry 0; treating a conflict as its first candidate; marking a generated entry with the anchor's status; treating 2061 as covered; treating 2060 as outside; flagging a Saturday holiday as `exchange-holiday`.

## Dependencies

None.

## Claims list (PR body)

As in S00: every claim with its reproducing command, copied by the PM into the Pass 0 sealed appendix.
