# Pass 0 brief: PR #30 (S02 observation schedule and exchange calendar)

Written by the PM on 2026-11-09 (America/New_York), from a fresh read of the PR at `0f9b5fc97daf675d037ed9146dacc2eb798048f9`. This brief lives on branch `docs/pr-30-records`, not on the PR branch, so that no Claude-authored commit enters PR #30 and Pass 1 stays Claude Code. When it was written, PR #30 had no comment (`gh api repos/BeniCheni/keel/issues/30/comments --jq length` printed `0`).

## Seat for Pass 1

Claude Code, fresh session, fresh clone. Model Fable 5.1 Extra, because a sensitive path is touched. Fallback Opus 5.5 High; say so in the comment if it is used. Fable seats work on synthetic data only and never open the private-list file.

Later seats: Pass 1.5 is the PM. Pass 2 is Codex, GPT-6.1 Sol Extra High, with no fallback, and it also runs the private-list check, reporting counts only. Pass 2.5 is a fresh Claude session on Fable 5.1 High, fallback Opus 5.5 High. Beni merges. The PR is still a draft and must be marked ready before it can merge.

## Scope

- Spec: `docs/specs/s02-schedule.md`, plus the build prompt recorded at the end of this brief, which adds two controls to AC10 and does not loosen the spec. Design brief: none.
- Sensitive paths touched: `packages/core/**` (15 files, `git diff --name-only origin/main...HEAD -- packages/core | wc -l`). The one other file is `tools/acceptance/test/core-entry.test.mjs`, which is not a sensitive path.
- Release: no.
- New dependencies: none. `git diff --exit-code origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml packages/core/package.json` exits 0.
- Bootstrap path: no. Install, `verify` and mutations all apply. Pass M does not apply: this slice has no engine and no golden fixture (spec, Non-goals; `ls fixtures/golden` lists nothing).
- Diff: 16 files, 1783 insertions, 4 deletions (`git diff --shortstat origin/main...HEAD`).
- Base: `origin/main` at `4210f6d`, the PR #29 squash (`git merge-base origin/main HEAD`).
- CI: run 42652330150 at `0f9b5fc`, event `pull_request`, conclusion `success` (`gh run list --repo BeniCheni/keel --commit 0f9b5fc97daf675d037ed9146dacc2eb798048f9 --json databaseId,event,conclusion`).

## Rulings every seat carries

1. **AC9 exception, Beni, 2026-11-09, this PR only.** AC9 requires an empty diff under `tools`, but the spec requires new exports from `packages/core/src/index.ts`, and `tools/acceptance/test/core-entry.test.mjs` pins the exact export list. Those two cannot both hold, which is the PM's error in the spec. Beni allowed one change: the expected string on line 15, with the `toBe` comparison kept. So AC9's diff command prints exactly one file, and that alone is not a finding. The ruling's full text is at the end of this brief.
2. **The open High from PR #28, Beni, 2026-11-08.** PR #28's Pass 1 finding 1 (High) stayed open under `AGENTS.md` Severity when the spec merged, and the S02 build had to land the AC10 test. `docs/reviews/pr-28-pass-1.5.md`, ruling 1, has the wording. Item 1 below decides whether it closes.
3. **Two additions to AC10, accepted by Beni on 2026-11-09.** The `import` rule also sees through comments, and `BigInt`, `Symbol`, `WeakMap` and `WeakSet` each get a negative control. `docs/reviews/pr-28-pass-2.5.md`, Risks and the records note, says where they came from.
4. **"Yes, last round", Beni, 2026-11-08.** That ended AC10 rounds on the spec. It does not limit this review. AC10 itself says "A form found later is added here as a new control", so a new form belongs in the test, with no spec round.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `0f9b5fc` feat(core): add the observation schedule and exchange calendar | Cursor | Claude Code, Pass 1 |

Any fix commit Pass 1 pushes is Claude-authored and gets its cold read from Codex at Pass 2. Any Codex fix commit gets its cold read from the fresh Claude session at Pass 2.5. A Claude session wrote the spec and the build prompt but no commit on this branch, so that does not change who takes Pass 1. The session that wrote this brief takes no review pass on this PR.

## Fast-track

Not allowed: the diff is code on a sensitive path.

## What to check, beyond the skill's standing checks

Each is a question, not a finding. Results the PM has for some of them are in the sealed appendix, so that your first read stays your own.

1. **Does PR #28's Pass 1 finding 1 close?** Severity closes a tracked High only with a fix commit carrying a test that fails without it. The PR body shows one such failure, `Date.now` added to `nyseRulesCalendar`. Is `schedule.purity.test.ts` AC10 in full, both parts? Does each negative control reach the rule it names, and does removing that rule turn it red? State in your comment whether the finding closes.
2. **AC10's absolute words.** AC10 says the checker rejects "any import or export specifier" not starting with `./` or `../`, rejects `import` followed "after any whitespace" by `(` or `.`, and loads "each non-test `.ts` file" in the schedule folder. Build prompt addition 1 extends the second rule to comments. Test each absolute against forms the listed controls do not show: spacing, comments in other positions, the whitespace JavaScript accepts beyond ASCII, and how the glob reaches files.
3. **The mutation floor, per claim.** The spec asks for at least three killed mutants per claim. The PR lists 47 rows (`gh pr view 30 --repo BeniCheni/keel --json body --jq .body | awk '/^## Mutation floor/{f=1} /^## Notes for review/{f=0} f && /^\| /' | tail -n +3 | wc -l`). No row names a test from `schedule.listed.test.ts` (AC4 and AC5) or `schedule.properties.test.ts` (AC7), and none names a `termDateFlags` test (AC6). Of the nine honesty tests, the table names two: compare `grep '^test(' packages/core/src/schedule/schedule.honesty.test.ts` with the table. AC8 requires each honesty test to fail when its guarded behaviour is broken, and the PR body says each does "under the mutant named below". Which of the unnamed behaviours survive a mutant when you try them?
4. **Whether each listed mutant died for the right reason.** The PR body discloses that an unescaped `-t` filter matched no test and Vitest exited 0 for six rows. Pick a sample of rows, including those six, and confirm the named test fails on the named assertion.
5. **Date comparison at the edges of the format.** The schedule compares dates as strings and `formatIso` prints the year unpadded. `isRealDate` and the schema accept any four-digit year. Do steps 3 and 5 of the spec's `observationSchedule` hold for the lowest and highest years the loader accepts? Does any result present more certainty than the spec allows?
6. **Rolling and the order of checks.** Cases 1 to 18 are frozen. Beyond them, does each clause of step 5 hold: a roll crossing a year end into a covered year, a roll crossing into an uncovered one, an anchor on a closed day followed by a slot that rolls onto or before it, and a slot at exactly maturity?
7. **An independent calendar.** The frozen SHA-256 and eight year rows pin the output. Derive the 35 years with a separate implementation (another language, a second Easter algorithm) and compare, rather than reading `calendar.ts` against the rules.
8. **AC7's oracle and range.** `schedule.properties.test.ts` checks open days with `scheduleDateFlags`, which is code under test, and its anchors run from 2026 to 2057. Does the test fail when rolling or stepping is broken? Does its `>= 1000` count fail if the generator goes wrong?
9. **The runtime half of AC10.** AC10 says "deep-equal results"; `sameTwice` compares `JSON.stringify` output. Does that differ for anything these functions return? On cases 1, 8 and 13 the terms have no list, so which lines of `scheduleDiff` run under the stubs? If the spec's three cases leave a path unexercised, say so; the PM takes it to Beni.
10. **`termDateFlags` against the loader.** AC6 compares key sets on every valid fixture. Which statuses do those fixtures put on a date? Does the key set still match on the statuses they do not cover?
11. **`samples.ts`.** It is a non-test file in the schedule folder that imports `../terms/fixtures.ts`, so the purity checker reads it and production typecheck covers it. It is imported only by tests. Does it belong in that tree, and could it reach the entry?
12. **Edits outside `schedule/`.** `index.test.ts` was rewritten, and its expected order differs from the string in `core-entry.test.mjs`. Do both describe what they should? Are `loadTerms`, `dateFlags` and `verificationSummary` untouched in behaviour and signature?
13. **Unreachable branches.** `schedule.ts:80`, `flags.ts:16` and `civil.ts:28` and `:32` guard conditions an earlier check appears to exclude. Are they reachable? A mutant there cannot die, so if they are not, are they worth keeping?

Out of scope, by the spec's non-goals: the payoff engine, metrics and trace (S03), UI, editing terms files, business-day arithmetic for alerts, a note-specific calendar or any schema change, unscheduled closures and half days, checking `call.non_call_months` against the anchor, importing an official schedule, payment dates, and Pass M. List out-of-scope findings in your comment rather than in `docs/v0.1.0-ideas.md`; the PM carries them to the next ordinary docs PR.

## Sealed appendix: to verify independently

Do your own read before opening this. Everything here is a claim, not a fact. Re-derive each one; report any that do not reproduce.

### Builder claims, from the PR body at `0f9b5fc`

| # | Claim (as the builder stated it) | Command the builder gave |
| --- | --- | --- |
| 1 | Base is `4210f6d998505e94fd9adf662de0ed4bda8759db`, and it is an ancestor of the head | `git rev-parse origin/main`; `git merge-base --is-ancestor 4210f6d998505e94fd9adf662de0ed4bda8759db HEAD` |
| 2 | 16 files, 1783 insertions, 4 deletions | `git diff --stat origin/main...HEAD` |
| 3 | No dependency, schema or fixture change: exit 0 | `git diff --exit-code origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml schemas fixtures packages/core/package.json` |
| 4 | Schedule tests, Node v24.22.2: exit 0, 7 files, 100 tests | `pnpm --filter @keel/core test schedule` |
| 5 | S01 terms tests, Node v24.22.2: exit 0, 8 files, 32 tests | `pnpm --filter @keel/core test terms` |
| 6 | Verify on Node v24.22.2: exit 0; typecheck, tests (133 in 16 files), tooling (122 in 10 files), tripwire, network, determinism, copy, boundaries | `pnpm install --frozen-lockfile`; `pnpm verify` |
| 7 | Verify on Node v26.13.0: the same eight steps, tests 133, tooling 122 | The same two commands |
| 8 | AC9's paths print exactly `1	1	tools/acceptance/test/core-entry.test.mjs` | `git diff --numstat origin/main...HEAD -- packages/core/src/terms schemas fixtures tools` |
| 9 | With `void Date.now();` first in `nyseRulesCalendar`, the purity test exits 1 with `./calendar.ts ambient:Date`. Restored, exit 0, 1 passed, 56 skipped | `pnpm --filter @keel/core exec vitest run --config vitest.config.mjs schedule.purity -t 'schedule sources pass the purity checker'` |
| 10 | AC1: count 345, the frozen SHA-256, the eight year rows, ascending, no duplicates, every closure a weekday, id `nyse-rules-1`, years 2026 to 2060 | `pnpm --filter @keel/core test schedule` |
| 11 | AC2: cases 1 to 7 match entry by entry, including entry 0 flags, the four rule strings, and inputs | `schedule.generate.test.ts` |
| 12 | AC3: cases 8 to 18 match, including case 13 entry 0 only, case 14 `calendar-collision` on `2027-03-02`, and case 11 `outside-calendar` on `2061-01-30` | `schedule.generate.test.ts` |
| 13 | AC4: a listed schedule keeps file order, index, date and term for primary, user, unknown and conflict, including when the three inputs are unknown | `schedule.listed.test.ts` |
| 14 | AC5: the diff case, `no-list`, and unavailable when the estimate is | `schedule.listed.test.ts` |
| 15 | AC6: the frozen flag table, the frozen `termDateFlags` object, the loader key set on every valid fixture, and the diff-list keys through the conflict candidates | `schedule.flags.test.ts` |
| 16 | AC7: seed `20261108`, 1200 trials, at least 1000 estimated schedules with a generated entry, strictly increasing, index equals position, generated dates open and on or before maturity, two runs deep-equal | `schedule.properties.test.ts` |
| 17 | AC8: each guarded behaviour fails under the mutant named in the table | The schedule run, both `pnpm verify` runs, and the mutant table |
| 18 | AC9: met with one exception, by Beni's ruling; the comparison stays `toBe`; terms tests 32 of 32 | The numstat command above; `pnpm --filter @keel/core test terms` |
| 19 | AC10: pass on the committed tree; the checker sees through comments, so `import /* module source */ .meta.url` is rejected; `BigInt`, `Symbol`, `WeakMap` and `WeakSet` are rejected as ambient names | `pnpm --filter @keel/core test schedule.purity` |
| 20 | AC11: `pnpm verify` exit 0 on both Nodes | Rows 6 and 7 |
| 21 | 47 mutant rows, each exit 1 under its named test, the working tree clean afterward, and no mutant in the commit. Six purity rows and the conflict row were re-run with an escaped filter | `pnpm --filter @keel/core exec vitest run --config vitest.config.mjs schedule -t <name>` |
| 22 | `loadTerms`, `dateFlags` and `verificationSummary` keep their signatures; the new runtime exports are `nyseRulesCalendar`, `scheduleDateFlags`, `termDateFlags`, `observationSchedule` and `scheduleDiff` | The PR's notes |
| 23 | Core schedule code does no file, network, clock or random I/O; the purity test is the check and is no proof against deliberate evasion | The PR's notes |
| 24 | The plain-Node export string is `dateFlags loadTerms nyseRulesCalendar observationSchedule scheduleDateFlags scheduleDiff termDateFlags verificationSummary` | `tools/acceptance/test/core-entry.test.mjs` |

The PR body also states that Beni confirmed Grok 4.7 Extra High from Cursor's model picker. That is Beni's statement and no command re-runs it.

### PM runs at `0f9b5fc`

The PM ran `pnpm install --frozen-lockfile && pnpm verify` in a fresh clone with `KEEL_DATA_DIR="$(mktemp -d)"`, on Node v24.22.2 and v26.13.0. Both exited 0. Each printed eight step lines ending in ` ok`, then `verify ok`. Core tests were 133 in 16 files, tooling 122 in 10 files, and `git status --porcelain --untracked-files=all | wc -l` printed `0` afterward.

### PM probes at `0f9b5fc`

The PM ran these on Node 24 only, through temporary tests in a scratch clone, then restored the clone. They were run to sharpen the questions above. They are not findings: severity and fixes are Pass 1's.

Dates went through `loadTerms` on `minimal.yaml` with only the two values changed (quarterly), against `nyseRulesCalendar()`:

| # | Input | Spec, as the PM reads it | Result |
| --- | --- | --- | --- |
| A | First call `9999-12-01`, maturity `9999-12-31` | `estimated`, entry 0 only, because `unadjusted` is after maturity | `unavailable`, `outside-calendar` on `10000-03-01` |
| B | First call `0999-01-15`, maturity `0999-12-31` | `unavailable`, `outside-calendar` on `0999-04-15` | `estimated`, entry 0 only |

The checker from `schedule.purity.test.ts`, called directly, returned no hit on each of these: `import{readFileSync}from"node:fs"`, `export*from"fs"`, `export{x}from"fs"`, `;import"fs"`, `import /* c */ "node:fs"`, `import x from /* c */ "node:fs"`, `import` then U+00A0 then `("fs")`, `import` then U+2028 then `.meta.url`, and `import` then U+FEFF then `.meta.url`.

A file at `packages/core/src/schedule/sub/evil.ts` containing `export const t = Date.now();` left `schedule sources pass the purity checker` passing, because the glob is `./*.ts`.

Checked and held, so they need no repeat unless you doubt them: a first call and maturity of `2061-01-03` give entry 0 only with `outside-calendar`, as in case 18. `import x from` then a newline then `"fs"` is rejected, and so is `import`, tab, `(`, newline, `"fs")`. With `dates.settlement` changed to `unknown`, the loader's `dateFlags` keys and `termDateFlags` keys are the same three.

## Build prompt

As the PM wrote it and handed it to Beni on 2026-11-09. Beni reported no change to it, and the PM cannot see what Cursor received.

```
You are Cursor, the Builder for slice S02 of BeniCheni/keel: the observation schedule and exchange calendar. Read `AGENTS.md` in full. It outranks this prompt. If they disagree, stop and report.
Model: Grok 4.7 Extra High, because this slice touches the sensitive path `packages/core/**`. Your chat id reads `grok-4.7` at every effort, so do not judge the effort from the id. Beni confirmed from the picker that this chat is on Extra High; record that in the PR body. If this chat cannot run at that effort, `grok-4.7-xhigh` as a sub-agent is authorized as a backup, and the PR body says so. There is no fallback model. If neither is available, stop and escalate.
Work in the fresh clone at ~/code/keel-s02, which Beni made for this build and opened here. Do not clone again, and never work in ~/code/keel-pm. Export KEEL_DATA_DIR="$(mktemp -d)" in every shell invocation, and use synthetic data only. Confirm `origin/main` is 4210f6d998505e94fd9adf662de0ed4bda8759db with a clean git status; if not, stop. Create branch `s02/schedule` from it.
The build authority is `docs/specs/s02-schedule.md`. Build exactly that one slice in one draft PR. Read the spec in full, along with "Rulings from Beni" in `docs/reviews/pr-28-pass-1.5.md` and "Risks and accepted costs" and the records note in `docs/reviews/pr-28-pass-2.5.md`.
All new code goes in `packages/core/src/schedule/`, exported from `packages/core/src/index.ts`. Add no dependency, schema change, fixture file or registered fixture generator. `loadTerms`, `dateFlags` and `verificationSummary` keep their behaviour and signatures. Core does no I/O: no file system, network, clock or randomness. Stay out of everything in the spec's non-goals.
The frozen values, the 18 cases and the honesty tests are the contract. If your code and a frozen value disagree, do not change the value, the test or the spec to make them agree: stop and ask Beni in one word. Honesty tests are never weakened, skipped or deleted.
The open High. PR #28 merged by Beni's ruling of 2026-11-08 with its Pass 1 finding 1 open under Severity in `AGENTS.md`, for that PR only, and this build carries the obligation. AC10 lands in full as `schedule.purity.test.ts`, both the lexical and the runtime part, with every negative control, accepted form, sentinel and stub control the spec lists. In the commit that adds it, the PR body must show the test failing without the behaviour it guards, so that the finding can close.
Beyond AC10's text, by Beni's decision of 2026-11-09, the build also adds these two controls. First, the rule on `import` followed by `(` or `.` must also see through comments, so `import /* module source */ .meta.url` is rejected, with that form as a negative control. Second, add a negative control each for `BigInt`, `Symbol`, `WeakMap` and `WeakSet`, each of which must be rejected as an ambient name.
Meet the Mutation floor in the spec: at least three killed mutants per claim, including every mutant it lists by name and each boundary. List each mutant in the PR body with the test that kills it. A surviving mutant on a boundary is a High.
Git. Set the author per commit with `git -c user.name=Cursor -c user.email=cursoragent@cursor.com commit`, never as Beni. Never force-push. Open a draft PR on branch `s02/schedule` after the first commit. Every commit is green: push the next commit only after CI is green on the last one. Run `pnpm install --frozen-lockfile && pnpm verify` on Node 24.22.2 and 26.13.0 before each push, reading each command's own exit code.
PR body. List every claim with its reproducing command, as in S00, and state each acceptance criterion from AC1 to AC11 with its result. Every figure comes from a command you ran in this session. Absolute words are claims to test. Name the sensitive path touched and state that no dependency was added. PM copies your claims into a sealed appendix, so make each one checkable as written.
Privacy. Never open the owner's data folder, ~/.keel-spike/env, ~/.keel-spike/logs or ~/.config/keel/private-terms.txt. No personal data, real market data or real documents go in code, tests, commits, the PR or comments. Product text explains mechanics only and passes the copy rules in `AGENTS.md`.
Stop and escalate to Beni, as a question answerable in one word, on anything `AGENTS.md` lists: a dependency the work needs, a claim you cannot re-run, a privacy issue, or this prompt disagreeing with that file.
You review nothing you built, and you merge nothing. When the slice is complete and CI is green on the last commit, leave the PR in draft, report the PR link and head SHA, and stop.
```

The AC9 ruling, as the PM drafted it for Beni to send to Cursor on 2026-11-09. The PR body reports the same exception.

```
Yes, by Beni's ruling of 2026-11-09. This is a one-line exception to AC9 for this PR only, because the spec requires new exports from `packages/core/src/index.ts` and `tools/acceptance/test/core-entry.test.mjs` pins the exact export list.
Change only the expected string on line 15 of that test, to exactly "dateFlags loadTerms nyseRulesCalendar observationSchedule scheduleDateFlags scheduleDiff termDateFlags verificationSummary". Keep the exact `toBe` comparison. Do not loosen it to a partial match, and change nothing else under `tools`.
Make that change in the same commit that adds the exports, so every commit stays green.
If the real export list differs from that string, do not adjust the string to match: stop and ask Beni in one word.
Do not report AC9 as printing nothing. In the PR body, report it as met with this one exception, citing this ruling, with the output of `git diff --numstat origin/main...HEAD -- packages/core/src/terms schemas fixtures tools`, which must be exactly one line: 1 added, 1 deleted, `tools/acceptance/test/core-entry.test.mjs`. `pnpm --filter @keel/core test terms` must still pass.
Do not edit the spec.
```
