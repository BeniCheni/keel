# Pass 0 brief: PR #38 (S03 payoff engine)

Written by the PM on 2026-11-12 (America/New_York), from a fresh read of the PR at `e29d9ff42521d9086c4cc657587947215a5491d9`. This brief lives on branch `docs/pr-38-records`, not on the PR branch, so that no Claude-authored commit enters PR #38 and Pass 1 stays Claude Code. When it was written, PR #38 had no comment (`gh api repos/BeniCheni/keel/issues/38/comments --jq length` printed `0`).

## Seat for Pass 1

Claude Code, fresh session, fresh clone. Model Fable 5.2 Extra, because sensitive paths are touched; `AGENTS.md` pins it since PR #35. Fallback Opus 5.5 High; say so in the comment if it is used. Fable seats work on synthetic data only and never open the private-list file.

Later seats:
- **Pass 1.5** is the PM.
- **Pass 2** is Codex, GPT-6.1 Sol Extra High, with no fallback. By Beni's ruling 2 of 2026-11-10 ("Codex at Pass 2 (Recommended)"), Codex writes `tools/reference/payoff.py` from the spec before it reads anything under `packages/plugin-mln/` or `tools/generators/golden/`. It then runs Pass M, and also the private-list check, counts only.
- **Pass 2.5** is a fresh Claude session on Fable 5.2 High, fallback Opus 5.5 High.

Beni merges. The PR is a draft and must be marked ready before it can merge.

## Scope

- Spec: `docs/specs/s03-payoff-engine.md`, read with the rulings below and the build prompt recorded at the end of this brief. Design brief: none.
- Sensitive paths touched: `packages/plugin-mln/**` (25 files) and `fixtures/golden/**` (33 files), counted with `git diff --name-only origin/main...HEAD -- <path> | wc -l`. The other five files are on the spec's list: `tools/generators/golden/generate.mjs`, `tools/fixtures/registry.mjs`, `tools/verify/steps.mjs`, `tools/acceptance/test/determinism.test.mjs` and `pnpm-lock.yaml`.
- Release: no.
- New dependencies: none beyond the two the spec names, `@keel/core` (`workspace:*`) and `vitest` 5.0.5. The PR body says the lockfile gains the workspace importer only.
- Bootstrap path: no. Install, `verify` and mutations apply. Pass M is Codex's at Pass 2, because the reference does not exist yet; Pass 1 records it as N/A for that reason. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.
- Diff: 63 files, 24784 insertions, 6 deletions (`git diff --shortstat origin/main...HEAD`).
- Base: `origin/main` at `9f0745f`, the PR #37 squash (`git merge-base origin/main HEAD`).
- CI: run 43316372304 at `e29d9ff`, event `pull_request`, conclusion `success`, attempt 1 (`gh run list --repo BeniCheni/keel --commit e29d9ff42521d9086c4cc657587947215a5491d9 --json databaseId,event,conclusion,attempt`).

## Rulings every seat carries

From the spec's review, PR #32 (`docs/reviews/pr-32-pass-1.5.md`), on 2026-11-10 and 2026-11-11, by PR #32's numbers:

- **Ruling 1, "Schema term first (Recommended)":** the final valuation date comes from the term. S02.1 built it.
- **Ruling 2, "Codex at Pass 2 (Recommended)":** Codex writes the Pass M reference at Pass 2, from the spec.
- **Ruling 3, "Simple, final, cash (Recommended)":** compound accrual, daily-close and continuous barriers, and physical delivery return `unsupported`.
- **Ruling 5, "Stop: status unknown (Recommended)":** a status rests only on evidenced dates.
- **Ruling 6, "Yes, with obligations (Recommended)":** PR #32 merged with 13 Highs open, and this build must land each one's closing test (the table below).
- **Ruling 7, "Yes, last round (Recommended)":** later spec findings go to this build's review, not to another spec round.

New for this build, both given in the PM's session on 2026-11-12:

- **Check 2's order, at 14:29 EST.** The PM asked where an `input-unevidenced` finding goes among check 2's per-path findings. Beni answered "In its path's place (Recommended)": one finding per path, in the spec's path order, with an `input-unevidenced` finding in its date's place. This settles the one Low on ruling 7's list. The other two items on that list, the S03 status-line date and the six-scripts row, are fixed on `main`.
- **The picker, at 15:35 EST.** Beni answered "Yes!" to whether Cursor's picker was on Grok 4.7 Extra High when he pasted the build prompt.

The Fable 5.2 seats need no ruling here: `AGENTS.md` on `main` pins them.

**Setup note.** Beni created `~/code/keel-s03` at 14:40 EST. One Cursor chat cloned into it and built the PR. A second chat, opened later in the same folder, stopped at the empty-folder check, reported that it read nothing, and was closed on Beni's word that the first chat was still working. The PM saw the first chat's 9 untracked files under `packages/plugin-mln/` before the commit, and read none of them.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `e29d9ff` feat(plugin-mln): pay a worst-of autocall from evidenced terms | Cursor | Claude Code, Pass 1 |

Any fix commit Pass 1 pushes is Claude-authored and gets its cold read from Codex at Pass 2. Codex's reference file and any Codex fix get their cold read from the fresh Claude session at Pass 2.5. A Claude session wrote the spec and the build prompt but no commit on this branch. The session that wrote this brief takes no review pass on this PR.

## The 13 Highs this build must close

From `docs/reviews/pr-32-pass-1.5.md`, "The obligations on the S03 build". Each closes only when its test lands and fails without the behaviour it guards. The PR body names a killing mutant for each; those claims are in the sealed appendix.

| High | Closing test in the S03 build |
| --- | --- |
| H1 | AC5: the `0/1` metrics row with `toCall` null; mutant "Dividing by a zero ratio" |
| H2 | Honesty "No maturity before maturity" and "Chronology"; AC4, each check-5 reason |
| H3 | Honesty "No status on a planning date"; AC4, both `estimated-date` stops; AC6, g11; AC7, no planning date in any row |
| H4 | Honesty "No payout on an unestablished chronology or mapping"; AC4, each example under Chronology and mapping failures |
| H5 | Honesty "An undated item bounds the status"; AC4, the trailing `date-unknown` stop; AC7, at least 100 trailing undated items |
| P2-1 | Honesty "Chronology", an estimated maturity never `matured`; AC4, `input-unevidenced` for each of the four dates |
| P2-2 | Honesty "Final valuation date not known"; AC4, Role unknown |
| P2-3 | Honesty "No payout without its inputs", for `dates.first_call_observation`; AC4, its `input-unevidenced` |
| P2-4 | AC4, Call before settlement |
| R1 | AC4, A later listed item and The term absent; honesty "Final valuation date not known" |
| R3 | AC4, Trade after settlement; honesty "Chronology", `settlement-before-trade` |
| R5 | AC4, Before the first call; honesty "Chronology", `observation-before-first-call` |
| PM slot gap | As R5, whose fix closes it, plus AC4, Two before the first call |

## Fast-track

Not allowed: the diff is code on sensitive paths.

## What to check, beyond the skill's standing checks

Each is a question, not a finding. The PM's results for some are in the sealed appendix, so that your first read stays your own.

1. **H5 and the undated-item honesty bullet.** The spec's bullet reads: "A listed `unknown` item as the last item, with the final valuation date absent and `asOf` after the last row's date, gives `unknown` with `date-unknown`, never `live`." The landed test keeps the final valuation term. The PR body says why: with the term absent, an earlier event's role is unknown, so evaluation stops before it reaches the trailing item. Take the spec's Events and Rows sections together. With the term absent, can the bullet's case reach the trailing item at all, or does evaluation stop at the item before it (`final-valuation-absent`), or report `live` while that item lies after `asOf`? If the bullet cannot be met as written, that is a defect in the spec, which the PM takes to Beni. The build prompt said to stop on such a rule, and Cursor changed the test instead. Say whether H5 closes with the test as landed.
2. **Each of the 13 Highs.** Does each closing test exist, assert what the table names, and fail under the mutant the PR body names and under a mutant of your own?
3. **The mutation floor.** Most rows give the change as old and new text. Some do not: H2's second row, "Each check-5 push removed, one at a time"; Sequencing's "the stop condition keeps only…"; and moving the barrier `if` above the call `if`. Can each row be re-run exactly from the PR body? Count killed mutants per claim against the spec's floor of three. The spec asks for "removing any purity rule or runtime stub", and the body lists three: `BigInt`, the glob and `Math.random`. Is every rule and stub covered?
4. **The frozen values, recomputed.** Recompute a sample of the spec's tables independently rather than reading the tests: rounding, cents with the 111673 tie, `finalPayout` on B, `noteMetrics` on B with its `0/1` row, and the 54-row monthly table.
5. **AC7's counts.** The body says the test "builds 100 trailing `date-unknown` evaluations and 900 more". The spec asks for a fixed-seed generator local to the test that "counts and requires" at least 1,000 evaluations, 100 of them ending on a trailing undated item. Are the 100 drawn and counted, or built to meet the floor? Would the count requirement fail if the generator broke?
6. **AC9's controls.** Are (a) to (f) all present, each reaching the rule it names? That means the synthetic listings with `.mts`, `.js` and `.json`; a product file importing from `test-support/`; the `\u` and `\x` escapes; and the runtime calls on g01, g03, g08 and g11.
7. **Exactness.** Decision 2 says no floating-point number takes part in any result. Product code uses `Number` and `Math.floor` in its civil-date code. Does any number in a result pass through floating point?
8. **Mapping and chronology at the edges.** Beyond the frozen examples, test month-end clamping, a nearest-slot tie, a first call observation one day after settlement, and a final valuation date on maturity.
9. **The golden generator.** It has the digit and CUSIP value guards, the post-write tripwire scan in a temporary repository, and no allowlist entry. Does regeneration stay byte-identical on both Nodes? Does every golden JSON file carry `"synthetic": true`?
10. **`tools/verify/steps.mjs`.** `typecheck` and `tests` now run both packages and return the first nonzero status. Does a failure in the plugin alone fail `verify`? Do the step names and order stay unchanged?
11. **Check 2's order**, by the ruling of 2026-11-12 above, in `payoff.evaluate.test.ts`.
12. **Scope.** Run AC10 at the head: every path on the spec's list, nothing under `tools/reference/`. Run AC11: the entry exports exactly five names.

Out of scope, by the spec's non-goals: alerts, UI, payment dates, annualized returns, the three unsupported variants beyond returning `unsupported`, reading a missing close as "not called", Monte Carlo, stress screens, close import, estimating the final valuation date, and any change to `packages/core`, the schemas or `fixtures/synthetic`. List out-of-scope findings in your comment; the PM carries them.

## Sealed appendix: to verify independently

Do your own read before opening this. Everything here is a claim, not a fact. Re-derive each one; report any that do not reproduce.

### Builder claims, from the PR body at `e29d9ff`

| # | Claim (as the builder stated it) | Command or source the builder gave |
| --- | --- | --- |
| 1 | 63 changed files, none under `tools/reference/`; every path on the spec's list; one commit, by Cursor | `git diff --name-only origin/main...HEAD \| wc -l`; the same with `-- tools/reference`; `git log --format='%h %an <%ae>' origin/main..HEAD` |
| 2 | `pnpm -s fixtures:trees` prints `fixtures/synthetic/terms` and `fixtures/golden` | That command |
| 3 | The plugin suite: 172 passed in 12 files, with per-file counts (arithmetic 10, payouts 5, final 4, evaluate 46, metrics 4, golden 2, properties 3, honesty 17, purity 75, policy 4, entry 1, `test-support/access` 1) | `pnpm --filter @keel/plugin-mln exec vitest run --config vitest.config.mjs --reporter=json` on Node 26.13.0 |
| 4 | AC1 to AC12 pass as the body's table states | The table |
| 5 | `pnpm verify` exits 0 on Node 24.22.2 and 26.13.0, with core 178 and plugin 172 tests | `pnpm install --frozen-lockfile`, `pnpm verify` |
| 6 | The lockfile diff is 10 insertions, the workspace importer only | `git diff -- pnpm-lock.yaml` |
| 7 | Check 2: an estimated trade date and an unknown settlement give `input-unevidenced` on `dates.trade`, then `input-unknown` on `dates.settlement` | Test `an unevidenced trade date stays ahead of an unknown settlement` |
| 8 | Each of the 13 Highs has a closing test that failed under the named mutant, with the suite exiting 1 | The body's High table and its command |
| 9 | Every listed mutant was killed; no survivor | The body's mutation floor tables |
| 10 | The trailing undated honesty test keeps the term, because with it absent the first event's role is unknown | The note under the AC table |
| 11 | The entry's runtime keys are `PRINCIPAL_CENTS`, `evaluateNote`, `finalPayout`, `noteMetrics`, `payoutSchedule` | `payoff.entry.test.ts` |
| 12 | Golden cases come from seed `keel-s03-golden-1` and are scanned by the tripwire before they are written | The body's summary |

### PM runs at `e29d9ff`

In a fresh clone with a fresh `mktemp -d` as `KEEL_DATA_DIR`, on Node v24.22.2 and v26.13.0:

| Check | Command | Result |
| --- | --- | --- |
| Install and verify | `pnpm install --frozen-lockfile`, `pnpm verify` | Exit 0 for each. Core 178 in 16 files, plugin 172 in 12, tooling 122 in 10, eight steps ok, status clean |
| Tripwire | `node tools/tripwire/cli.mjs .` | Exit 0, no output, nothing on stderr |
| Scope | `git diff --name-only origin/main...HEAD`, filtered by the spec's list | No path outside it; 0 under `tools/reference`; 0 under `packages/core`, `schemas`, `fixtures/synthetic`, `docs`, `CHANGELOG.md`, `README.md` and `package.json` |
| Golden cases | `find fixtures/golden -mindepth 1 -maxdepth 1 -type d` | 11 folders, g01 to g11; 33 files |
| `"synthetic": true` | `grep -c '"synthetic": true'` over every case's `input.json` and `expected/result.json` | No file without it |

### PM reads at `e29d9ff`

These were done to sharpen the questions. They are not findings.

- `grep -n -E 'parseFloat|parseInt|toFixed|Number\(|Math\.'` over product files under `packages/plugin-mln/src/` finds `Math.floor` only in `dates.ts`'s civil-date conversion.
- `grep -n economics` over the same product files finds nothing.
- The test `an undated item bounds the status` (`payoff.honesty.test.ts`, line 306) builds 17 `primary` items and one `unknown` item on the base terms, which keep the final valuation term. It sets `asOf` one day after the 17th date and expects `unknown` with `date-unknown` at index 17.
- `tools/generators/golden/generate.mjs` rejects a seeded value with 9 or more integer digits (line 67) or a 9-character token passing the CUSIP check (line 70).

## Build prompt

As the PM wrote it and handed it to Beni on 2026-11-12 at 14:31 EST, taken as data from the PM's session transcript. Beni has reported no change to it, and the PM cannot see what Cursor received.

```
You are Cursor, the Builder for slice S03 of BeniCheni/keel: the payoff engine, in a new package @keel/plugin-mln.
Set up first. This chat opened in ~/code/keel-s03, which Beni created empty for this build. Before you read or run anything else, run pwd and ls -A. pwd must print that folder and ls -A must print nothing; if either fails, stop and tell Beni, and read nothing in that folder. Then run gh repo clone BeniCheni/keel . and confirm that git rev-parse origin/main prints 9f0745f7fd1431f07450d43c4f4b93fea21cb603 and git status --porcelain --untracked-files=all prints nothing; if not, stop. Create branch s03/payoff-engine from it. Never work in ~/code/keel-pm or any other keel checkout. Export KEEL_DATA_DIR="$(mktemp -d)" in every shell invocation, and use synthetic data only.
Then read AGENTS.md in full, before anything else in the repo. It outranks this prompt. If they disagree, stop and report.
Model: Grok 4.7 Extra High, because this slice touches the sensitive paths packages/plugin-mln/** and fixtures/golden/**. Your chat id reads grok-4.7 at every effort, so do not judge the effort from the id. Beni sets Extra High in the picker before he pastes this prompt, and that setting is the evidence of your effort; say so in the PR body. If this chat cannot run at that effort, grok-4.7-xhigh as a sub-agent is authorized as a backup, and the PR body says so. There is no fallback model. If neither is available, stop and escalate. Every seat for this slice is the AGENTS.md default; no ruling moves one.
The build authority is docs/specs/s03-payoff-engine.md. Build exactly that one slice in one draft PR. Read the spec in full, along with docs/reviews/pr-32-pass-1.5.md (its "Rulings from Beni", Beni's rulings 6 and 7 of 2026-11-11, and "The obligations on the S03 build") and "Risks and accepted costs" in docs/reviews/pr-32-pass-2.5.md. S02.1, which this slice reads dates.final_valuation from, is already on main.
One reading of the spec, by Beni's ruling of 2026-11-12 at 14:29 EST in the PM's session ("In its path's place (Recommended)"). Check 2 gives one finding per path, in the path order the spec lists. An input-unevidenced finding takes its date's place in that order. So with an estimated trade date and an unknown settlement date, the trade date's input-unevidenced comes first, then the settlement date's input-unknown. Pin that order in AC4's tests, and state the reading in the PR body. Do not edit the spec: the PM records the reading in a later docs PR.
Scope is the spec's list of files the builder may change: files under packages/plugin-mln/, fixtures/golden/ and tools/generators/golden/; tools/fixtures/registry.mjs; tools/verify/steps.mjs, with step names and order unchanged; the three acceptance tests the spec names, only where they pin the registry or the steps; and pnpm-lock.yaml for the workspace entry. If the build needs any other file, stop and report; the spec is amended first. List each changed file outside the three folders in the PR body with its reason. Never create or touch anything under tools/reference/: Codex writes the Pass M reference there at Pass 2, from the spec, before it reads your engine. Do not change packages/core, the schemas, fixtures/synthetic, anything under docs/, CHANGELOG.md, README.md or any version; this slice is not a release. The package depends on @keel/core (workspace:*) and on vitest 5.0.5 only, as the spec says; add no other dependency.
The engine does no I/O: no file system, network, clock or randomness. Time, closes and seeds are passed in. Arithmetic is exact, with BigInt fractions, and money is integer cents per $1,000 of principal; nothing reads economics.* or values a holding.
The frozen values, the golden cases and the honesty tests are the contract. If your code and a frozen value disagree, do not change the value, the test or the spec to make them agree: stop and ask Beni in one word. Honesty tests are never weakened, skipped or deleted.
The 13 open Highs from the spec's review. PR #32 merged with them open by Beni's ruling 6 of 2026-11-11, for that PR only, and this build carries the obligation. The table "The obligations on the S03 build" in docs/reviews/pr-32-pass-1.5.md names each High (H1 to H5, P2-1 to P2-4, R1, R3, R5 and the PM slot gap) with the tests that close it. Each of those tests lands in this build. For each High, the PR body names a mutant that its closing test kills, with the exact change, the command and the failing test's name from the output. Each closes only when its test lands and fails without the behaviour it guards.
Meet the spec's Mutation floor: at least three killed mutants per claim, including every mutant it lists by name and each boundary. For each mutant, the PR body gives the exact change as a unified diff or a one-line sed or perl command that applies to the file at your head. A description in words is not enough, because nobody can re-run it exactly. Give the command that runs it, naming the test file, and the name of the test that fails, taken from the output. An exit code alone does not show which test failed. Run every one in this session. A survivor is reported as a survivor, never as a kill, and a surviving mutant on a boundary is a High.
Golden fixtures are generated by seed, never hand-typed, by the registered generator the spec describes. It writes each case's expected output by running the engine, scans what it writes with the repository's tripwire, and adds no allowlist entry. After pnpm fixtures:regen, git status --porcelain --untracked-files=all over every tree pnpm -s fixtures:trees prints shows nothing, on both Nodes.
Git. Set the author per commit with git -c user.name=Cursor -c user.email=cursoragent@cursor.com commit, never as Beni. Never force-push. Open a draft PR on branch s03/payoff-engine after the first commit. Every commit is green: push the next commit only after CI is green on the last one. Before each push, run pnpm install --frozen-lockfile && pnpm verify on Node 24.22.2 and 26.13.0, reading each command's own exit code. If a CI job is cancelled without running a single step, that is GitHub running out of macOS runners, not a failure of your commit: rerun the failed jobs with gh run rerun <run id> --failed, wait for them to finish green, and say so in the PR body. Never push a commit just to retrigger CI.
PR body. List every claim with its reproducing command, as in S00, and state each acceptance criterion from AC1 to AC12 with its result, AC10 at your last commit. Every figure comes from a command you ran in this session. Absolute words are claims to test. Name the sensitive paths touched, state that no dependency was added beyond the two the spec names, state the check 2 reading above, and give the table of the 13 Highs with their killing mutants. The PM copies your claims into a sealed appendix, so make each one checkable as written.
Privacy. Never open the owner's data folder or anything under ~/.keel-spike/ or ~/.config/keel/. No personal data, real market data or real documents go in code, tests, fixtures, commits, the PR or comments. Any text the engine returns explains mechanics only, recommends nothing and passes the copy rules in AGENTS.md.
Stop and escalate to Beni, as a question answerable in one word, on anything AGENTS.md lists: a dependency the work needs, a claim you cannot re-run, a privacy issue, a spec rule you cannot meet as written, or this prompt disagreeing with that file or with the spec beyond the reading above.
You review nothing you built, and you merge nothing. When the slice is complete and CI is green on the last commit, leave the PR in draft, report the PR link and head SHA, and stop.
```
