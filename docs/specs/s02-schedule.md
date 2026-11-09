# S02: Observation schedule and exchange calendar

- Status: drafted 2026-11-08 by the PM (Claude), on Beni's ruling of 2026-11-08 to split the engine work and build the schedule first. Amended the same day after Codex's plan challenge (`docs/reviews/pr-28-pass-1.5.md`). No code exists yet.
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
2. **One calendar, NYSE, for every underlying.** The terms schema has no calendar field, and adding one is a schema change this slice does not make. Every generated entry names the calendar in its `rule`, so the assumption is visible. The calendar is a planning fallback: it is no evidence of when an underlying on another exchange trades, or of unscheduled closures.
3. **Coverage is 2026 to 2060 inclusive.** Rules cannot know an unscheduled closure, and past years contain some (for example 2025-01-09), so coverage starts at 2026. A date outside coverage is flagged `outside-calendar`, never reported as an ordinary open day.
4. **Generated dates step from the stated first call observation.** `dates.first_call_observation` is the anchor, and it is entry 0 exactly as stated: it is never moved, even if it falls on a closed day, because a stated date is not this slice's to change. A closed-day anchor is flagged instead.
5. **`call.non_call_months` is not read.** The anchor already carries that information. Checking that the two agree needs a tolerance no source gives, so that check is left out and goes to the ideas file.
6. **Closed days roll forward** to the next open day ("following"). The terms do not state a convention, and the output is tagged ESTIMATE.
7. **A conflict or unknown input means no generated schedule.** Hard rule 6 keeps conflicting sources side by side. Generating from either candidate, or only up to the earlier one, would choose between them or imply they agree.

## Scope

All new code lives in `packages/core/src/schedule/` and is exported from `packages/core/src/index.ts`. `loadTerms`, `dateFlags` and `verificationSummary` keep their behaviour and signatures. No new dependency, schema change, fixture file or registered fixture generator.

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

"Observed" means a Saturday date closes the Friday before and a Sunday date closes the Monday after. NYSE states that practice with an exception for unusual business conditions, such as the end of a monthly or yearly accounting period (SR-NYSE-2021-56, footnote 6, <https://www.govinfo.gov/content/pkg/FR-2021-10-05/html/2021-21742.htm>), and its published table has no closure on Friday, December 31, 2027. This calendar projects that one case as a fixed rule: a Saturday New Year's Day closes nothing. That is keel's projection, not a commitment by NYSE, whose discretion is wider.

Early closes still produce a closing price, so they are not closures.

The rules agree with the holiday table NYSE publishes for 2026 to 2028 (<https://www.nyse.com/trade/hours-calendars>, read 2026-11-08). Published holiday dates are calendar information, not prices, so this spec treats them as outside hard rule 4; the plan challenge tests that.

### Public API

```ts
export interface ExchangeClosure { date: string; name: string }
export interface ExchangeCalendar {
  id: string;
  fromYear: number;
  toYear: number;
  closures: readonly ExchangeClosure[]; // ascending by date, no duplicates, real dates
}
export function nyseRulesCalendar(): ExchangeCalendar; // id "nyse-rules-1", 2026 to 2060

export type ScheduleFlag = "weekend" | "exchange-holiday" | "outside-calendar" | "invalid-date";
export function scheduleDateFlags(isoDate: string, calendar: ExchangeCalendar): ScheduleFlag[];
export function termDateFlags(terms: Terms, calendar: ExchangeCalendar): Record<string, ScheduleFlag[]>;

export interface ScheduleInput { path: string; status: TermStatus }

export interface StatedEntry {
  index: 0;
  date: string;
  origin: "stated";
  status: Exclude<TermStatus, "unknown" | "conflict">;
  flags: ScheduleFlag[];
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
  | { code: "input-unknown" | "input-conflict" | "input-invalid"; path: string }
  | { code: "anchor-after-maturity"; path: "dates.first_call_observation" }
  | { code: "outside-calendar"; date: string }
  | { code: "calendar-collision"; date: string };
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

`weekend` for a Saturday or Sunday, from the date alone. `exchange-holiday` when the date is a closure in the calendar. `outside-calendar` when the date's year is outside `fromYear` to `toYear`. The order in the array is the order just given. An outside date never gets `exchange-holiday`. A string that is not a real Gregorian date returns only `invalid-date`, so it cannot read as an open day.

### `termDateFlags`

The same keys `loadTerms` returns in `dateFlags` for the same file, including `.candidates[i]` paths and `dates.observation_schedule[i]`, with `scheduleDateFlags` as the value. It never rejects a date.

### `observationSchedule`

`terms` comes from a successful `loadTerms`. `calendar` meets the comments on `ExchangeCalendar`. Each entry's `index` is its position in `entries`, from 0.

1. If `terms.dates.observation_schedule` is present, return `listed`: one entry per list item, in file order. `date` is the value, or `null` for `unknown` and `conflict`. `term` is the item unchanged, so a conflict keeps every candidate in file order. A listed schedule is not thereby verified: `verificationSummary` decides that.
2. Otherwise read the three inputs in this order: `dates.first_call_observation`, `dates.maturity`, `call.frequency`. If any is `unknown` or `conflict`, or has a known value that is not a real Gregorian date (the two dates) or one of the four frequencies, return `unavailable` with one `input-unknown`, `input-conflict` or `input-invalid` reason per such input, in that order, and nothing else.
3. If the anchor is after maturity, return `unavailable` with `anchor-after-maturity`.
4. Otherwise `step` is 1, 3, 6 or 12 months for `monthly`, `quarterly`, `semiannual` or `annual`. Entry 0 is the anchor, `origin: "stated"`, with the anchor's status and `flags` from `scheduleDateFlags`. It needs no calendar coverage.
5. For `k` from 1: `unadjusted` is the anchor plus `k × step` months, computed from the anchor each time, with the day clamped to the length of the target month. So a January 31 anchor gives February 28 and then March 31.
   - If `unadjusted` is after maturity, stop.
   - Starting at `unadjusted`, take each date in turn. If it is after maturity, leave this `k` out and go to the next `k`. Otherwise, if its year is outside the calendar's years, return `unavailable` with one `outside-calendar` reason naming that date. Otherwise, if it is a Saturday, a Sunday or a closure, move to the next day. Otherwise accept it.
   - If the accepted date is not after the previous entry's date, return `unavailable` with one `calendar-collision` reason naming it.
   - There is no partial schedule.
6. Each generated entry has `rule` exactly `Generated from the stated first call observation, <every>, with closed days moved to the next open day on calendar <id>.`, where `<every>` is `every month`, `every 3 months`, `every 6 months` or `every 12 months`.
7. `inputs` lists the three inputs and their statuses in the order of step 2.

### `scheduleDiff`

Returns `no-list` when the terms have no observation schedule. Otherwise it computes the estimate from the terms with the list ignored; if that is `unavailable`, it returns that result. Dates are compared as sets: `inBoth`, `onlyEstimated` and `onlyListed` are ascending, compared by code unit. `noKnownDate` holds the indices of list items with no known value, ascending. A conflict candidate contributes no listed date, and does not remove an estimated date of the same value. It does not pair dates up or guess which one moved.

### Purity

No I/O, clock, randomness, console output or locale outside test files, and only relative imports. AC10 lists the forms this rules out and how they are tested. ADR-0009's Path A runs this core inside JavaScriptCore with no host shim. `packages/core/src/terms/dates.ts` already holds a Gregorian `dayOfWeek` and `isLeapYear`, and the build reuses them.

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

Entry 0's `flags` are `weekend` in case 2, `exchange-holiday` in cases 4, 5 and 6, and empty in cases 1, 3 and 7.

### Unavailable schedules

| # | Input | Expected `reasons` |
| --- | --- | --- |
| 8 | `fixtures/synthetic/terms/valid/example-autocall.yaml` as loaded (its maturity is in conflict) | `[{ code: "input-conflict", path: "dates.maturity" }]` |
| 9 | Case 1 with first call, maturity and frequency all `unknown` | three `input-unknown` reasons, in the three paths' order |
| 10 | First call 2027-03-16, maturity 2027-03-15 | `[{ code: "anchor-after-maturity", path: "dates.first_call_observation" }]` |
| 11 | First call 2060-11-30, maturity 2061-01-31, monthly, with `nyseRulesCalendar()` | `[{ code: "outside-calendar", date: "2061-01-30" }]` |
| 12 | First call 2028-11-30, maturity 2029-03-01, monthly, with a calendar `{ id: "test-2028", fromYear: 2028, toYear: 2028, closures: [] }` | `[{ code: "outside-calendar", date: "2029-01-01" }]`, reached while rolling from 2028-12-30 |
| 14 | First call 2027-01-01, maturity 2027-03-03, monthly, with a calendar `test-collision` covering 2027 and closing every weekday from 2027-02-01 through 2027-03-01 | `[{ code: "calendar-collision", date: "2027-03-02" }]` |
| 15 | Case 1 with first call value `2027-02-30` | `[{ code: "input-invalid", path: "dates.first_call_observation" }]` |
| 16 | Case 1 with frequency value `weekly` | `[{ code: "input-invalid", path: "call.frequency" }]` |

### Coverage edge cases

| # | Input | Expected |
| --- | --- | --- |
| 13 | First call 2028-11-30, maturity 2028-12-31, monthly, with `test-2028` | `estimated`, entry 0 only: the roll from 2028-12-30 reaches 2029-01-01, which is after maturity. Maturity is checked first, so the slot is left out and not reported as outside coverage |
| 17 | First call 2025-12-15, maturity 2026-02-15, monthly | `estimated`: entry 0 is 2025-12-15 with flags `outside-calendar`, then 2026-01-15. The 2026-02-15 slot rolls past maturity |
| 18 | First call and maturity 2061-01-03, monthly | `estimated`, entry 0 only, with flags `outside-calendar` |

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
| 2027-02-30 | `invalid-date` |
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
- A generated schedule never makes `dates.observation_schedule` verified: `verificationSummary` returns deep-equal values before and after, and the path stays unverified when the list is absent.
- A date outside the calendar is never reported as open: every flags array for such a date holds `outside-calendar`, and a generated date on or before maturity that reaches one makes the result `unavailable`, never partial.
- A stated anchor on a closed day stays as stated in entry 0, and is flagged in that entry and by `termDateFlags`.
- An invalid date never reads as open: `scheduleDateFlags` returns `invalid-date`, and an invalid input generates nothing.

## What S03 takes from this

This slice gives S03 estimated or listed call-observation dates. It does not establish the note's final valuation date, and the terms have no field for it. An estimated schedule's last entry is the last generated slot on or before maturity, or the stated anchor alone when no generated slot remains, as in case 13. A listed schedule's last entry is the final list item in file order, with its known date or `null` for an unknown or conflict. Neither tells S03 whether that entry is the final valuation date. Leaving out a slot that rolls past maturity can also shorten the count, so a monthly note can show 54 entries where the research counts 55. S03's spec has to establish separately the final valuation date, the order of the call and barrier tests on it, an exact dated close for each test, and the premium accrual basis when a date was moved or listed.

## Non-goals

The payoff engine, metrics and trace (S03). Any UI, including the observation calendar. Writing, editing or replacing terms files. Business-day arithmetic for alerts (T−5 and the like). A note-specific calendar or any schema change. Unscheduled closures, half days and market disruption rules. Checking `call.non_call_months` against the anchor. Importing an official schedule from a document. Payment dates, which the terms do not state. Pass M: its command compares payoffs on golden fixtures, and this slice has neither.

## Acceptance criteria

All schedule tests run with `pnpm --filter @keel/core test schedule`. Each criterion names the test file that carries it.

| # | Criterion | Test file and what it asserts |
| --- | --- | --- |
| AC1 | The calendar matches the frozen values | `schedule.calendar.test.ts`: count 345, the SHA-256 above, each year in the closures table, ascending, no duplicates, every closure a weekday, `id`, `fromYear` and `toYear` |
| AC2 | Generated schedules match, entry by entry | `schedule.generate.test.ts`: cases 1 to 7, deep-equal on `index`, `date`, `unadjusted`, `origin`, `status` and `label`, entry 0's `flags`, `rule` for each of the four frequencies, and `inputs` |
| AC3 | Unavailable and edge-case schedules match | `schedule.generate.test.ts`: cases 8 to 12 and 14 to 16, deep-equal on `reasons`, and cases 13, 17 and 18 as stated |
| AC4 | A listed schedule is returned as listed | `schedule.listed.test.ts`: file order, `index`, `date` and `term` for `primary`, `user`, `unknown` and `conflict` items, with no generated entry and regardless of the three inputs' statuses |
| AC5 | The diff matches | `schedule.listed.test.ts`: the diff case above, `no-list` with no schedule, and `unavailable` when the estimate is |
| AC6 | Date flags match | `schedule.flags.test.ts`: the table above, the frozen `termDateFlags` object, for every valid fixture the same key set as the loader's `dateFlags`, and for case 1 with the diff case's list the keys `dates.observation_schedule[0]` to `[2]` and `dates.observation_schedule[3].candidates[0]` and `[1]` |
| AC7 | Generated schedules are well formed across inputs | `schedule.properties.test.ts`: from a fixed-seed generator local to the test, the test counts and requires at least 1,000 `estimated` schedules with at least one generated entry. In each, entries are strictly increasing, `index` equals position, every generated date is an open day within the calendar and on or before maturity, and two runs are deep-equal |
| AC8 | Honesty tests pass, and each fails when its guarded behaviour is broken | `schedule.honesty.test.ts` under `pnpm verify`; the PR body names, per mutant, the test that kills it |
| AC9 | S01's behaviour is unchanged | `git diff --stat origin/main...HEAD -- packages/core/src/terms schemas fixtures tools` prints nothing, and `pnpm --filter @keel/core test terms` passes |
| AC10 | The code is pure, and the check can fail | `schedule.purity.test.ts`, in two parts. **Lexical:** loads each non-test `.ts` file in `packages/core/src/schedule/` as raw text through `import.meta.glob`, requires at least one such file, and requires each to pass a checker defined in that test. The checker rejects any import or export specifier not starting with `./` or `../`; every ambient name as a whole word (not next to a letter, digit, `_` or `$`), where the ambient names are what `Object.getOwnPropertyNames(globalThis)` returns on the running Node, minus this frozen list of pure language names: `Array`, `Boolean`, `Error`, `Infinity`, `JSON`, `Map`, `Math`, `NaN`, `Number`, `Object`, `RangeError`, `Set`, `String`, `TypeError`, `isFinite`, `isNaN`, `parseFloat`, `parseInt` and `undefined`; the whole words `constructor`, `require`, `__dirname` and `__filename`; `import` followed, after any whitespace, by `(` or `.`; the text `locale` or `stack` in any case; and any use of `Math` other than `Math.floor`, `Math.ceil`, `Math.min`, `Math.max`, `Math.abs` or `Math.trunc`. The names come from that expression at test time and are never stored. The test requires them to include `crypto`, `setTimeout`, `console` and `Date` and to exclude `Array`, so an empty or unfiltered derivation fails. The test requires the checker to reject each negative control: `import { readFileSync } from 'node:fs'`, the same with double quotes, `import fs from 'fs'`, `export * from "ajv"`, `Date.UTC(2026, 0, 1)`, `new Date()`, `Date.now()`, `Intl.Collator()`, `a.localeCompare(b)`, `performance.now()`, `process.env`, `globalThis.x`, `console.log("x")`, `fetch("x")`, `eval("1")`, `new Function("return 1")`, `x.constructor`, `Reflect.get(a, "b")`, `require("fs")`, `require("./x.ts")`, `require(name)`, `import("fs")`, `import("./x.ts")`, `Math.random()`, `Math["random"]()`, `const m = Math`, `crypto.getRandomValues(new Uint32Array(1))`, `"i".toLocaleUpperCase()`, `x.toLocaleString()`, `setTimeout(f, 0)`, `navigator.language`, `new WebSocket("x")`, `RegExp.$1`, `new Error("x").stack`, `Error.captureStackTrace(x)`, `import.meta.url`, `__dirname` and `__filename`. It requires the checker to accept `import { dayOfWeek } from "../terms/dates.ts"`, `Math.floor(x / 4)`, `Object.keys(x)`, `Number.isInteger(x)`, `new Map()`, `new Error("x")`, `/^(\d{4})$/.exec(s)` and the identifier `scheduleDateFlags`. **Runtime:** replaces `Math.random`, `Date.now`, `performance.now`, `globalThis.fetch`, `crypto.getRandomValues`, `crypto.randomUUID`, `String.prototype.toLocaleUpperCase`, `String.prototype.toLocaleLowerCase`, `String.prototype.localeCompare`, `Number.prototype.toLocaleString` and each `console` method with counting stubs, installed only around the calls and restored in a `finally` before any assertion. It calls every public function of this slice on cases 1, 8 and 13, twice on the same arguments, and requires zero calls and deep-equal results from the two calls. A stand-in in the test whose result depends on a `/g` regular expression's `lastIndex` must fail that comparison. For each stub it also calls that target once under the stubs and requires that stub's count to be 1 and every other count to be 0, so a removed stub fails. Together these guard against accidental impurity on the Node versions the suite runs. They do not prove purity against deliberate evasion, which stays with review. A form found later is added here as a new control |
| AC11 | `pnpm verify` stays green, including tripwire, network and determinism | `pnpm verify`, on Node 24.22.2 and 26.13.0 |

## Mutation floor

At least three killed mutants per claim, listed in the PR body with the killing test. Required among them: closing the December 31 before a Saturday New Year's Day; closing the Friday before a Sunday holiday; Good Friday one day off; fourth Monday in place of last Monday of May; last Thursday in place of fourth Thursday of November (2029); rolling backward in place of forward; stepping from the previous date in place of the anchor; not clamping the day; excluding a date equal to maturity; keeping a rolled date after maturity; rolling entry 0; treating a conflict as its first candidate; marking a generated entry with the anchor's status; treating 2061 as covered; treating 2060 as outside; flagging a Saturday holiday as `exchange-holiday`; checking coverage before maturity while rolling; dropping the collision check; treating an invalid date as open; removing any purity rule; removing any runtime stub; removing the repeat-call comparison.

## Dependencies

None.

## Claims list (PR body)

As in S00: every claim with its reproducing command, copied by the PM into the Pass 0 sealed appendix.
