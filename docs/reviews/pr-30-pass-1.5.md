# Pass 1.5 brief: PR #30

Written by the PM on 2026-11-09 (America/New_York), after reading Pass 1's comment ([issuecomment-6746624951](https://github.com/BeniCheni/keel/pull/30#issuecomment-6746624951); reviewed head `0f9b5fc`, post-fix head `ab33165`) and Beni's rulings. Like the Pass 0 brief, it lives on branch `docs/pr-30-records`, so that no PM commit enters PR #30. Codex receives this brief for Pass 2.

Pass 1's verdict is mergeable after fixes. This seat accepts all ten findings. It disputes one conclusion, that PR #28's open High closes at `ab33165`, and it raises one severity. None goes to Cursor as rework: each was closed by a patch or needs only a small one.

## Seat for Pass 2

Codex, GPT-6.1 Sol Extra High, because `packages/core/**` is a sensitive path. The seat has no fallback: if that model is unavailable, stop and escalate. If the chat reaches the model only through a sub-agent, that sub-agent gets the whole prompt word for word and does all the reading and running, and the comment says so.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | High, continues PR #28 Pass 1 finding 1 | Accept and dispute the closure | Reproduced. Nine import forms from the Pass 0 appendix give 0 hits each at `0f9b5fc` and 1 hit each at `ab33165`. Restoring the old specifier rule, ASCII-only whitespace and the line-feed-only comment fails 7, 3 and 1 controls. With a nested file calling `Date.now()`, the head's test file exits 0 and the tip's exits 1. **Dispute:** Severity closes a High in tracked files "only with a fix commit carrying a test that fails without it". The specifier and whitespace limbs have that. The glob limb does not: Pass 1 states it has no committed control, and its before-and-after run is evidence, not a test. So this finding, and PR #28's, stay open until Pass 2 lands one and Codex has cold-read `25084c4` | no |
| 2 | High, surviving mutant on a boundary | Accept | Reproduced. Mutants X7b and X7c pass every schedule test at `0f9b5fc`, and both fail at `ab33165` | no |
| 3 | Medium | Accept | Reproduced. With `civil.ts` and `schedule.ts` from `0f9b5fc` and the tip's tests: 2 failed, 119 passed. Both failures are the two tests the fix adds. The two probes from the Pass 0 appendix now read as the spec does (sealed appendix) | no |
| 4 | Medium, surviving mutants off a boundary | Accept | Reproduced. All 14 pass every schedule test at `0f9b5fc`, and all die at `ab33165` | no |
| 5 | Medium, raised to **High, outside tracked files** | Accept, severity raised | Pass 1 left this reading to the PM. PR #8's Pass 1.5 drew the line: a finding is not "a trust claim the numbers fail to support" when the AC was "true as shipped". Here it was not. The AC8 row said each guarded behaviour fails under a named mutant, and 11 mutants on honesty-guarded behaviour passed every test. Remediation is below. It closes with that recorded check plus Beni's written confirmation, which the PM asks for at the merge | no |
| 6 | Low | Accept; Pass 2 adds the case | Beni's ruling 7 below | no |
| 7 | Low | Accept; no change here | Where a relative specifier may point is a new rule, not a control of an existing one. The PM carries it to the next ordinary docs PR | no |
| 8 | Low | Accept; no change | Tidiness | no |
| 9 | Low | Accept; no change | The guards narrow types and cost nothing | no |
| 10 | Low | Accept; no change | Nothing survives the full suite | no |

The PM also carries two items from Pass 1's "Deliberately not done" to the next ordinary docs PR: identifiers written with Unicode escapes pass the checker, and the glob does not match `.mts`, `.js` or `.json`.

## PR body (finding 5)

At 13:24 EST on 2026-11-09 the PM appended "Corrections after Pass 1" to the PR body with `gh pr edit 30 --body-file`, under Beni's ruling 6 below. It went on before Pass 2 so that Codex's private-list check covers it. Cursor's text is byte-identical (`cmp` of the first 103 lines against the body saved before the edit exits 0). The repo tripwire's `scanRepo` gated the edit: no error and 0 hits on the new text, and a generated address added to the same temporary repository gives 1 email hit. If Pass 2 moves the head, the section gets one refresh, not one per commit. That refresh comes after Codex's check, so Beni runs the check again before merging.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `0f9b5fc` feat(core): add the observation schedule and exchange calendar | Cursor | Claude Code, Pass 1 (done) |
| `25084c4` test(core): close three gaps in the AC10 purity checker | Claude | Codex, Pass 2 |
| `415be36` fix(core): compare schedule dates as numbers and print four-digit years | Claude | Codex, Pass 2 |
| `ab33165` test(core): cover schedule behaviours whose mutants survived | Claude | Codex, Pass 2 |

Any Codex fix commit gets its cold read from the fresh Claude session at Pass 2.5. This PM session wrote the spec, the build prompt and these briefs, and it takes no review pass on this PR.

## Rulings from Beni

Carried from Pass 0:

1. **AC9 exception, 2026-11-09, this PR only.** One change under `tools`: the expected string on line 15 of `tools/acceptance/test/core-entry.test.mjs`, with `toBe` kept. AC9's diff command printing exactly that one file is not a finding.
2. **PR #28's open High, 2026-11-08.** It stayed open when the spec merged, and the S02 build had to land the AC10 test. Finding 1 above decides when it closes.
3. **Two AC10 additions, accepted 2026-11-09.** The `import` rule sees through comments, and `BigInt`, `Symbol`, `WeakMap` and `WeakSet` each get a negative control.
4. **"Yes, last round", 2026-11-08.** It ended AC10 rounds on the spec and does not limit review. A form found now goes into the test as a new control, with no spec edit.

New on 2026-11-09, given in the PM's session in these words, so Codex cannot see them and Beni's merge confirms them:

5. **"Yes, push when written (Recommended)"**, on pushing this brief to `docs/pr-30-records` with no pull request opened.
6. **"Yes, append (Recommended)"**, on whether the PM may append "Corrections after Pass 1" to the PR body, leaving Cursor's text byte-identical, with Beni confirming the close in writing at the merge.
7. **"Yes, add at Pass 2 (Recommended)"**, on whether Codex should add a fourth runtime case with a list to AC10's runtime half at Pass 2, with no spec edit.

## What Pass 2 does

1. Cold-read the three Claude commits. `git diff 0f9b5fc ab33165` is all of them. `415be36` is the one that changes product code, and it replaces `isRealDate` in `readDate` with `parseIso`.
2. Reproduce or disprove each row above, including the raised severity and the dispute. Add your own read of the whole PR at the head.
3. **Land a test that fails without the recursive glob.** It must fail when the glob in `schedule.purity.test.ts` is `./*.ts`, and it must not put an impure file in the tree. A pure file in a subfolder that the test requires the glob to reach would do; a better design is welcome. This closes finding 1's third limb.
4. **Add the fourth runtime case, under ruling 7.** Terms that carry a listed schedule, with usable inputs, so that `listedSchedule` and the whole of `scheduleDiff` run under the stubs. `void Math.random();` added in either place must then fail the runtime test as well as the lexical one. Cases 1, 8 and 13 stay.
5. State in your comment whether PR #28's Pass 1 finding 1 closes at your head.
6. Run the owner's private-list check, counts only, with a readable-file precheck and a nonzero exit on a failed scan, over the diff, every commit message in `origin/main..HEAD`, the PR title and body, and every comment. No Claude seat ran it.
7. Pass M is N/A: this slice has no engine and no golden fixture. Item 3 and item 4 are tests only. Any other fix follows the skill: reproduce it first, and give each behaviour fix a test that fails without it.

## Sealed appendix for Pass 2

Pass 1's findings and fixes are suspicions to re-derive, not conclusions, and so are this brief's dispositions. Do your own read before opening this.

The PM's runs, in a fresh clone at `ab331654f6980cb36bbdbbdbcefb79ce6df322f5` with a fresh `mktemp -d` as `KEEL_DATA_DIR`. The mutant tools are `mut.py` and `mutants_after.py` from Pass 1's comment, read before they were run.

| Check | Command | Result |
| --- | --- | --- |
| Install and verify | `pnpm install --frozen-lockfile`, `pnpm verify`, on v24.22.2 and v26.13.0 | Exit 0 for each. Core 154 in 16 files, tooling 122 in 10, eight steps ok, status clean |
| CI at the tip | `gh run list --repo BeniCheni/keel --commit ab331654f6980cb36bbdbbdbcefb79ce6df322f5 --json databaseId,event,conclusion,status` | Run 42662638682, `pull_request`, success |
| Schedule tests | `pnpm --filter @keel/core test schedule`; the same with `schedule.purity` | 121 in 7 files; 68 |
| Diff | `git diff --shortstat origin/main...HEAD` | 16 files, 2027 insertions, 4 deletions |
| AC9 | `git diff --numstat origin/main...HEAD -- packages/core/src/terms schemas fixtures tools` | Exactly `1 1 tools/acceptance/test/core-entry.test.mjs` (tab-separated) |
| Dependencies | `git diff --exit-code origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml packages/core/package.json` | Exit 0 |
| No skips | `grep -n -E '\.(skip\|only\|todo)\b' packages/core/src/schedule/*.test.ts \| wc -l` | 0 |
| Pass 1's 42 mutants at the tip | `python3 -I mut.py m.json` | 41 killed, status clean. N3 passes (below) |
| The 16 former survivors, tests as of `415be36` | `git checkout 415be36 --` the flags, generate, honesty and listed test files, then the runner on the first 16 ids | 14 pass, 2 killed (X7c and X22) |
| The same 16 at the tip | The runner on the first 16 ids | 16 killed |
| The same 16 at `0f9b5fc` | The runner, with the two mutants below re-worded for that commit | 16 pass. Honesty tests at that commit: 9 (`grep -c '^test('`) |
| Finding 3's tests | `git checkout 0f9b5fc -- packages/core/src/schedule/civil.ts packages/core/src/schedule/schedule.ts`, then `pnpm --filter @keel/core test schedule` | 2 failed, 119 passed |
| The glob | `export const t = Date.now();` in `packages/core/src/schedule/sub/evil.ts`; `pnpm --filter @keel/core exec vitest run --config vitest.config.mjs schedule.purity -t 'schedule sources pass the purity checker'` | Exit 0 with the head's test file (1 passed, 56 skipped). Exit 1 at the tip, `./sub/evil.ts ambient:Date` |

The two mutants re-worded for `0f9b5fc`, both in `schedule.ts`:

- `const maturity = readDate(terms.dates.maturity);` becomes a read that returns `{ ok: true, value, status }` for a valued maturity without checking that it is a real date.
- `if (!isRealDate(term.value)) return { ok: false, code: "input-invalid" };` becomes `if (term.value === "2027-02-30") return { ok: false, code: "input-invalid" };`.

The nine import forms, run through a copy of the checker (everything above `const NEGATIVES` in the test file at each commit), counting `purityHits`: `import{readFileSync}from"node:fs"`, `export*from"fs"`, `export{x}from"fs"`, `;import"fs"`, `import /* c */ "node:fs"`, `import x from /* c */ "node:fs"`, `import` then U+00A0 then `("fs")`, `import` then U+2028 then `.meta.url`, and `import` then U+FEFF then `.meta.url`. Each gives 0 at `0f9b5fc` and 1 at the tip. Pass 1's count of 18 forms was not re-run in full.

The date probes at the tip, through `observationSchedule` with `nyseRulesCalendar()` and quarterly frequency: first call `9999-12-01`, maturity `9999-12-31` gives `estimated` with 1 entry. First call `0999-01-15`, maturity `0999-12-31` gives `unavailable`, `outside-calendar`, on `0999-04-15`.

N3 changes the first maturity check at `schedule.ts` back to a text comparison, and it passes. Pass 1 calls it equivalent. The PM's reasoning agrees: a slot past 9999 sorts before the maturity as text, the roll's numeric check then rejects it, and the loop still ends once the year's text sorts after the maturity. Only the iteration count differs. Check that yourself.

Pass 1's comment reports its effort as "Extra as assigned" and says the session could not show it. No seat can check that statement.

## After Pass 2

Codex's Pass 2 is [issuecomment-6749892420](https://github.com/BeniCheni/keel/pull/30#issuecomment-6749892420), and it pushed `f6a21c1`. Its formal verdict is not mergeable, on finding 5 alone, pending Beni's written confirmation. It accepted every disposition above, including the raised severity and the dispute on finding 1. It added two things: a glob control, which moves `sameTwice` into `packages/core/src/schedule/test-support/same-twice.ts` and asserts the glob reaches that file, and the fourth runtime case under ruling 7. On that commit it closed finding 1 and PR #28's Pass 1 finding 1. It reported zero private-list hits on every surface. That is Codex's claim, and Beni's later run is recorded in the Pass 2.5 brief.

The PM re-ran these at `f6a21c1`, in a fresh clone with a fresh `mktemp -d` as `KEEL_DATA_DIR`. This is not the cold read of `f6a21c1`, which went to the fresh Claude session at Pass 2.5.

| Check | Command | Result |
| --- | --- | --- |
| Install and verify | `pnpm install --frozen-lockfile`, `pnpm verify`, on v24.22.2 and v26.13.0 | Exit 0 for each. Core 154 in 16 files, tooling 122 in 10, eight steps ok, status clean |
| Diff | `git diff --shortstat origin/main...HEAD` | 17 files, 2046 insertions, 4 deletions |
| CI at the head | `gh run list --repo BeniCheni/keel --commit f6a21c144a9ce2510c550d6cec6f3dc0a659d64d --json databaseId,event,conclusion,status` | Run 42687442879, `pull_request`, success |
| The glob control | Glob in `schedule.purity.test.ts` set to `./*.ts`, then `pnpm --filter @keel/core exec vitest run --config vitest.config.mjs schedule.purity` | 1 failed, 67 passed |
| The fourth runtime case | `void Math.random();` at the start of `listedSchedule`, then before the `estimatedSet` line in `scheduleDiff`, the same run each time | 2 failed, 66 passed, each time: the runtime test and the lexical one |
| The same, without the case | The second insertion, with the purity test file from `ab33165` | 1 failed, 67 passed: the lexical test only |

**PR body refresh.** At 19:22 EST on 2026-11-09 the PM replaced "Corrections after Pass 1" with a version that describes `f6a21c1`, using `gh pr edit 30 --body-file`. Codex's report had named the refresh as the PM's step. Cursor's first 103 lines are byte-identical (`cmp` against the body saved before the edit). The repo tripwire's `scanRepo` gated the edit: no error and 0 hits on the new text, and a generated address added to the same temporary repository gives 1 email hit. The refresh came after Codex's private-list check, so Beni ran that check again before merging.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `f6a21c1` test(core): guard nested schedule sources and listed runtime paths | Codex | Claude, Pass 2.5, fresh session, Fable 5.2 High by Beni's ruling of 2026-11-09 |
