# Pass 0 brief: PR #40 (S03.1 spec, and the S03 spec amended after its build's review)

Written by the PM on 2026-11-13 (America/New_York), from a fresh read of the PR at `d09bbda`. The same Claude session wrote the PR and this brief, so Pass 1 and Pass 2 are its cold reads. This brief lives on the records branch `docs/pr-40-records`, not on the PR branch, so the PR's diff and claims stay as posted.

## Seat for Pass 1

Codex, GPT-6.1 Sol High. `AGENTS.md` gives Codex Pass 1 on a Claude-authored PR, and on a spec that pass is the plan challenge. PR #40 touches no sensitive path, so the pin is High. The seat has no fallback: if it is unavailable, stop and escalate.

Later seats:
- Pass 1.5 is the PM.
- Pass 2 is Codex, on the Claude-authored commits after Pass 1.
- Pass 2.5 is a fresh Claude session on Opus 5.5 High, including the cold read of any Codex commit. This PR touches no sensitive path, so the Fable pin does not apply.
- Beni merges.

## Scope

- **Specs.** Adds `docs/specs/s03.1-reference-k.md`, and amends `docs/specs/s03-payoff-engine.md` in seven places. It also adds the S03.1 row to `docs/README.md`. Design brief: none.
- **Sensitive paths touched:** none. `git diff --name-only origin/main...HEAD` lists the three files above. The build S03.1 authorizes will touch `tools/reference/**`, `fixtures/golden/**` and test files under `packages/plugin-mln/**`.
- **Release:** no.
- **New dependencies:** none, in this PR or in the build it specifies.
- **Bootstrap path:** no. `verify` applies through CI. Mutations and Pass M do not apply, because no code or fixture changes.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `a415541` | Claude | Codex, at Pass 1 |
| `d09bbda` | Claude | Codex, at Pass 1 |

## Fast-track

Not allowed. S03.1's spec is the build authority for a sensitive-path slice, and the S03 edits change engine rule text that the reference will be built against. `AGENTS.md` gives every spec the plan challenge, and PR #28 and PR #32 ran full passes on theirs.

## Beni's rulings

All were given on 2026-11-13. Codex cannot see the sessions they were given in; `docs/reviews/pr-38-pass-1.5.md` and `docs/reviews/pr-38-pass-2.5.md` on `main` record each one with its question.

- **In the PM's session:**
  - At 12:28 EST: ruling A ("Yes (Recommended)") and ruling B ("Reword it (Recommended)").
  - At 13:20 EST: ruling C ("Yes, it counts (Recommended)").
  - At 15:28 EST: "S03.1 (Recommended)", "Codex, adjudicating (Recommended)" and "One spec PR (Recommended)".
- **In PR #38's Pass 2.5 session:**
  - At 14:35 EST, confirmed in writing at 14:54 EST: "No (Recommended)", that a listed item dated after the final valuation date does not count toward `k`.
  - At 15:07 EST: "Follow-up PR".
- **Check 2's order** came on 2026-11-12 at 14:29 EST: "In its path's place (Recommended)".

The number S03.1 came from the option text Beni picked. Numbering is his, so a different number is a question for him, not a finding. That Codex builds S03.1 follows from ruling 2 of 2026-11-10 and from the 15:28 EST question, which said "Codex writes the commit (ruling 2 makes the reference Codex's)". Every later S03.1 seat prompt states it, since `AGENTS.md`'s Builder seat is Cursor.

## What to check, beyond the skill's standing checks

Please do your own read of each S03 edit against the code at `9ec6fd0` before opening the sealed appendix.

1. **Status, ruling A.** Does the new third `unknown` case match `runEvaluation`'s end (`packages/plugin-mln/src/engine.ts:315-333`) exactly? Is "Only a conflict reaches this" true, and is its reason complete for an estimated schedule as well as a listed one?
2. **Events, the `k` rule.** Do the two listed-schedule bullets state `planEvents`'s branch for a known final valuation date (`events.ts:121-143`) exactly? Consider an item dated after the final valuation date that comes before the first item dated on it, an undated item, and the case where no item falls on the date. Does the wording match the question Beni answered, and does it extend that ruling anywhere he did not rule?
3. **Check 2's order.** Does the new text match `checkTerms` (`read.ts:64-82`), `noteMetrics`'s narrower scope included?
4. **The input contract.** Is "Within this contract every function returns one of its result kinds" a requirement the engine meets? Look at every `throw` under `packages/plugin-mln/src/` (seven in `engine.ts` and `fraction.ts`) and at the schema's bounds. Is the example right, and is naming `nyseRulesCalendar()` as the only calendar too narrow?
5. **Decision 6, ruling C.** Is the year-10000 example right: slot 1, one day away, and `k` 1?
6. **The two honesty bullets.** Does ruling B's rewording describe the landed test (`payoff.honesty.test.ts:305-318`) exactly? Is the item 18 sentence true for `evaluateNote` and `payoutSchedule` on every `asOf`, not only on the probed ones?
7. **S03.1's cases.** Re-derive g12's and g13's frozen values with your own reference. Does g13's `asOf` before its only row avoid a decoy close in year 10000, and is that the right choice? Is a golden case the right way to make Pass M catch both regressions, against the alternative of a committed differential? The spec makes that alternative a non-goal.
8. **The seats.** Is the Pass 2 arrangement ("Codex, adjudicating") consistent with `AGENTS.md`'s independence rules, given that Codex writes every build commit? Is any rule in `AGENTS.md` broken by Codex building, or does only the Seats table's default change?
9. **Testability.** Can each of AC1 to AC11 fail? Are the Pass M controls in AC3 stated so they can be run at the head?
10. **Slice boundary.** Is the allowed-file list complete for two new cases, a generator version bump and the guard tests? Consider `tools/acceptance/test/test-contract.test.mjs`, the registry, and `payoff.golden.test.ts`'s pinned case list.
11. **Private list.** This seat runs the owner's private-list check, counts only, over the diff, the commit messages, the PR title and body, every comment and its own proposed comment.

## Sealed appendix: PM claims to verify independently

The PR body's claims table holds the PM's runs, with the four probe scripts printed in full: `cases.mjs`, `cases-ref.py`, `item18.mjs` and `zero-initial.mjs`. In summary:

- g12 gives `unavailable` with `listed-after-final-valuation` at index 18 alone. `main`'s reference adds `final-valuation-off-cycle`.
- g13 gives `live` with `next` on 9999-12-01, and payouts of 104250 and a final 104958 at 7 months. The reference as of `3e48b83` gives `unavailable`.
- Removing the `k` rule's `continue` from `events.ts` fails 1 of 210 plugin tests at `9ec6fd0`.
- Marking L's item 18 `estimate` or `assumed` changes only `unverified` and `provisional`, on four dates and in `payoutSchedule`.
- `loadTerms` refuses a zero initial level as `out-of-range`. Set by hand on loaded terms, the same level makes `evaluateNote` and `noteMetrics` throw.
- `pnpm verify` exits 0 at `d09bbda` on both Nodes.
