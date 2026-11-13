# Pass 1.5 brief: PR #40 (S03.1 spec, and the S03 spec amended after its build's review)

Written by the PM on 2026-11-13 (America/New_York), after Codex's Pass 1 ([issuecomment-6866705462](https://github.com/BeniCheni/keel/pull/40#issuecomment-6866705462), posted at 17:40 EST). Pass 1 read `ab9737e` and found it not mergeable, with one High and seven Mediums. The read ran in a Codex sub-agent on GPT-6.1 Sol High. It pushed nothing, as its prompt said. The PM reproduced every finding at `9ec6fd0` with Codex's printed probes, and amended both specs in `d466083` and `faae442`.

## Seat for Pass 2

Codex, GPT-6.1 Sol High, on the Claude-authored commits after Pass 1: `d466083` and `faae442`. `AGENTS.md` gives Codex Pass 2 on a Claude-authored PR. PR #40 touches no sensitive path, so the pin is High. There is no fallback.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason |
| --- | --- | --- | --- |
| 1 | High | Accept. Fixed in S03.1 by Beni's ruling | Reproduced on both Nodes with Codex's `contract-probe.mjs`: `noteMetrics(B, new Array(1), "2026-09-01")` throws `TypeError: Cannot read properties of undefined (reading 'ticker')`. The PM's `holes.mjs`, printed in the PR body, shows the same throw for a hole before and after a full set of closes, while `evaluateNote` returns results on all three. Check 1 skips a hole explicitly (`read.ts:128`), and `noteMetrics` alone iterates with `for ... of` (`engine.ts:410`). So the merged engine is inconsistent, and the amended contract's promise was false at `9ec6fd0`. Beni's ruling: S03.1's Decision 6 has Cursor make `noteMetrics` skip a hole, with AC12's test and three mutants. The S03 contract now says every function skips a hole, and names the gap until S03.1 lands. The High stays open until S03.1's build lands AC12's test, which fails at `9ec6fd0`. PR #32's Highs took the same path under ruling 6 |
| 2 | Medium | Accept | Reproduced: `payoutSchedule(B, { ...nyseRulesCalendar(), id: "synthetic-calendar" })` returns calendar `synthetic-calendar`. The contract now takes any calendar that meets S02's comments on `ExchangeCalendar` (S02 spec line 124 states the same contract for `observationSchedule`). It names `nyseRulesCalendar()` as the one core provides, and says a result's `calendar` field holds the given id. The PR body's grep `export function .*Calendar` also matched `scheduleDateFlags`, `termDateFlags`, `observationSchedule` and `scheduleDiff`, so its result "`nyseRulesCalendar` alone" did not follow from its command. The row now uses `grep -rn -E '^export function \w+\(\): ExchangeCalendar' packages/core/src`, which prints `calendar.ts:91` alone |
| 3 | Medium | Accept | Reproduced: L with its last two items replaced by one `unknown` item, no closes, `asOf` 2030-09-04, gives four `close-missing` at row 0. The bullet now requires a close for every member on entries 0 to 16, each below the call level, as the landed test supplies (`uniform(date, "3/5")`) |
| 4 | Medium | Accept | Reproduced: with `asOf` `bad-date`, L and L with item 18 marked `estimate` give the same `{ kind: "unavailable", reasons: [{ code: "as-of-invalid" }] }`, which has neither field. The sentence now holds wherever `evaluateNote` returns an evaluation, and in `payoutSchedule`'s result |
| 5 | Medium | Accept | A fresh clone of `main` lacks `3e48b83`: in the PM's clone at `9ec6fd0`, `git show 3e48b83:tools/reference/payoff.py` failed with `fatal: invalid object name`, and the PM ran that reference from a clone that had fetched PR #38's head. `origin/main` will carry the amended reference once S03.1 merges. The controls now name `9ec6fd0` and say to fetch `refs/pull/38/head` first. Frozen values and the mutation floor now name `9ec6fd0` too |
| 6 | Medium | Accept | The pipeline's exit is `grep`'s, and an empty `grep -v` output looks the same whether Git listed nothing or failed. AC6 now writes Git's list to a file, and requires that command to exit 0 before filtering. It also allows `engine.ts`, for Decision 6 |
| 7 | Medium | Accept | Reproduced: at `9ec6fd0`, `generators.find((g) => g.name === "golden").version` from `tools/fixtures/registry.mjs` prints `1`, and no AC read it. AC4 now requires `2` |
| 8 | Medium | Accept | Reproduced with Codex's `generator-probe.mjs`: rows with `worstTicker` BRVO and `seedBelow: true` get 0 BRVO closes, 1 with a `fixedClose`, and 2 with a `conflict`. Decision 4 now gives the shape from `placeRow`'s branches (`generate.mjs:315-357`): no `all`, `worstTicker` and `seedBelow: true`, no `fixedClose`, no `conflict`, and `missing` not naming `worstTicker`. AC8 requires the three neighbouring shapes not to throw. g08's row, with `missing` naming its `worstTicker`, is one of them |

Contested: none. The PM also agrees with Pass 1's notes that need no change:
- the seven edits' other readings;
- a dated-after item before the on-date item cannot load, because `loadTerms` rejects it with `schedule-order`, so the Events bullet's wording for it is harmless;
- g13's `asOf` before its only row;
- the split of AC1 to AC3 between Cursor's PR body and Codex's Pass 2.

The PM did not re-run `schedule-order`. Pass 2 may.

## Ruling from Beni

The PM asked in its session at 17:43:33 EST: "PR #40's High: the amended S03 contract says any type-valid closes get a result, but noteMetrics throws on a hole in the closes array (new Array(1)). Check 1 and evaluateNote already skip a hole; only noteMetrics's loop doesn't. How should it close?"

Beni answered **"Fix in S03.1 (Recommended)"** at 17:43:39 EST. The option read: "S03.1's Cursor build makes noteMetrics skip a hole as check 1 does, with a test that fails without it. That is S03.1's one engine change. The spec says so now, and the High stays open until that test lands, as PR #32's Highs did under ruling 6."

The alternative he declined, "Narrow the contract", read: "The contract requires a dense closes array, and the engine doesn't change. The High closes on this spec PR by your written word, since a spec fix carries no test."

The builder ruling of 17:14 EST is in the Pass 0 brief.

## Authorship since Pass 1

From `git log --format='%h %an' ab9737e..faae442`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `d466083` | Claude | Codex, at Pass 2 |
| `faae442` | Claude | Codex, at Pass 2 |

## What Pass 2 does

1. Cold-read `d466083` and `faae442` (`git diff ab9737e faae442`), against Pass 1's findings and against the code at `9ec6fd0`.
2. Say whether each finding closes as amended, or, for the High, whether S03.1's Decision 6, AC12 and its mutants would close it once built.
3. Check the new contract text against the code's own conditions. Does any function still throw on an input the contract admits, once `noteMetrics` skips a hole? Consider a `null` element, which the `Close` type does not admit.
4. Check that each new or changed AC can fail, and that AC6's two-step form fails on a Git error.
5. Re-run the PR body's new "After the plan challenge" table.
6. Run `pnpm install --frozen-lockfile && pnpm verify` on both Nodes, the tripwire with counts per class, and the private-list check over the diff, the commit messages, the title and body, every comment, both briefs on `docs/pr-40-records`, and its own comment.

## After Pass 2

Codex's Pass 2 ([issuecomment-6867211522](https://github.com/BeniCheni/keel/pull/40#issuecomment-6867211522), posted at 18:08 EST) read `faae442` in a GPT-6.1 Sol High sub-agent. Its verdict was not mergeable, because the High stays open by Beni's ruling until S03.1 lands. It closed all seven Mediums, and agreed that Decision 6, AC12 and its three mutants would close the High once built. In scratch it ran AC12's comparisons with a loop-only skip and the three mutants, and each mutant failed. It found two new Mediums, both reproduced by the PM at `9ec6fd0` on both Nodes with its printed `sparse-contract.mjs`:

| Pass 2 # | Severity | PM disposition | Reason |
| --- | --- | --- | --- |
| P2-1 | Medium | Accept | `noteMetrics` on `[bad]` gives `close-invalid` at index 0, and on `[, bad]` at index 1. Check 1 numbers closes by their place in the array as given, before the loop Decision 6 changes. So Decision 6's promise that a hole changes no result was too wide. In `831c337` the equality holds when check 1 finds nothing wrong, check 1 does not change, and AC12 pins index 1 for an invalid close after a leading hole. S03's contract says how `close-invalid` counts |
| P2-2 | Medium | Accept | Scope allowed plugin test files "for the case list and the frozen values", which leaves out AC12's test in `payoff.metrics.test.ts`. In `831c337` the clause also names AC12's test of Decision 6 |

Codex also confirmed that a `null` element makes both closes APIs throw in check 1, and that the `Close` type rejects `null` under `--strict`. So `null` is outside the contract, which admits only what the type allows. The PM agrees, and no change is needed.

### Authorship since Pass 2

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `831c337` | Claude | Codex, at a Pass 2 re-read |

`831c337` is Claude's, so it needs a cold read from Codex before Pass 2.5. That re-read is scoped to `git diff faae442 831c337` and to the PR body's "After Pass 2" section.

### Then Pass 2.5

A fresh Claude session on Opus 5.5 High, since PR #40 touches no sensitive path. It re-runs every number at the head, writes the executive brief, and evaluates the gate in shadow mode. No Codex commit exists on this PR, so it has none to cold-read. The open High is the one expected item for the gate: Beni's ruling of 17:43 EST keeps it open until S03.1's build.
