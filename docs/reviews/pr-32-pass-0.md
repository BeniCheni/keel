# Pass 0 brief: PR #32 (S02.1 final valuation date and S03 payoff engine specs)

Written by the PM on 2026-11-10 (America/New_York), from a fresh read of the PR at `12e3d99`. The same Claude session wrote the PR and this brief, so Pass 1 and Pass 2 are its cold reads.

## Seat for Pass 1

Codex, GPT-6.1 Sol High. `AGENTS.md` gives Codex Pass 1 on a Claude-authored PR, and on a spec that pass is the plan challenge. The seat has no fallback: if it is unavailable, stop and escalate.

Later seats: Pass 1.5 is the PM. Pass 2 is Codex, on the Claude-authored commits after Pass 1. Pass 2.5 is a fresh Claude session on Opus 5.5 High, including the cold read of any Codex commit. Beni merges.

## Scope

- **Specs.** This PR adds `docs/specs/s02.1-final-valuation.md` and `docs/specs/s03-payoff-engine.md`. Design brief: none.
- **Sensitive paths touched:** none. `git diff --name-only origin/main...HEAD` lists `docs/README.md`, `docs/reviews/pr-32-pass-0.md`, both specs and `docs/v0.1.0-ideas.md`. The builds these specs authorize will touch:
  - S02.1: `schemas/**` and `packages/core/**`.
  - S03: `packages/plugin-mln/**` and `fixtures/golden/**`, plus `tools/reference/**` at Pass 2.
- **Release:** no.
- **New dependencies:** none, in this PR or in either build it specifies.
- **Bootstrap path:** no. `verify` applies through CI. Mutations and Pass M do not apply, because no code or fixture changes.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| Every commit on the branch, this brief's included | Claude | Codex, Pass 1 |

## Fast-track

Not allowed. These specs are the build authority for two sensitive-path slices, and `AGENTS.md` gives every spec the plan challenge.

## Beni's rulings

All four were given in the PM's session. Codex cannot see that session, and Beni's merge confirms them.

- **2026-11-08:** "Split, schedule first", which made S03 the payoff engine.
- **2026-11-10**, on three questions the PM put before drafting:
  1. **The final valuation date:** "Schema term first (Recommended)". A small slice adds an optional term before S03, and S03 reads it.
  2. **The Pass M reference:** "Codex at Pass 2 (Recommended)". Codex writes it during S03's Pass 2, from the spec, before opening the engine code.
  3. **Variants:** "Simple, final, cash (Recommended)". Compound accrual, `daily-close` and `continuous` barriers, and physical delivery return `unsupported`.

The number S02.1 came from the option text Beni picked. Numbering is his, so a different number is a question for him, not a finding.

## What to check, beyond the skill's standing checks

Please derive the frozen values yourself before opening the sealed appendix.

1. **Decision 1 and hard rule 3.** The spec reads ADR-0005 as stating hard rule 3 for the note's value slot. On that reading, payouts per $1,000 of principal under the terms sit outside the rule. Is that reading sound? Can any S03 output read as a value of the note or of a holding? If you contest the reading, say so as a question for Beni.
2. **Decision 3, rounding.** The spec applies `underlyings.performance_rounding` to the ratio close ÷ initial, citing `AGENTS.md`'s "Levels are decimal ratios". Is that the right reading of S01's grammar, given that `0dp` and `1dp` are then coarse and `minimal.yaml` uses `half-up-4dp`?
3. **Decision 6, premium months.** Months come from `call.non_call_months` plus index times step.
   - Does that reproduce the research's figures (month 6 pays 110%, month 60 pays 200%) and its count of 55 observations?
   - Is it sound when a listed schedule is off-cycle, or when `non_call_months` disagrees with the first call observation? `example-autocall.yaml` has 55 non-call months and a first call about five months after trade.
4. **The final valuation date.** Take S02.1 and S03's Decision 9 and Events together.
   - Can any path report `matured`, or a final payout, without a known final valuation date?
   - Does the monthly case that gives S02 54 entries now get 54 call events plus a final test?
   - Are the rules for an estimated entry or a listed item after the date, and for a date after maturity, complete? Do they hold to hard rule 6?
5. **Rows and status.** Can a missing or conflicting close, an unknown initial level, or a listed item with no date ever yield a payout or a status other than `unknown`? Does anything carry a close from another day, or read one dated after `asOf`? Does the `date-unknown` rule give one answer for every list?
6. **The frozen values.** Re-derive each with your own implementation:
   - the rounding table, B's 19 schedule entries with 18 call events, the 18 call payouts and 142500;
   - the monthly variant's 55 entries and 54 call events, the month table, and the 111673 tie;
   - the `finalPayout` and `noteMetrics` tables, the golden decimals, and S02.1's `2031-07-09` and its two summaries.
7. **Golden independence and Pass M.** Expected outputs come from the engine, and the spec rests their independence on its frozen values and on Pass M.
   - Is that enough?
   - Can you write `tools/reference/payoff.py` from the spec's sections alone, without reading any engine code?
   - Is `input.json` self-contained?
   - Can the comparison, a deep-equal including `assumptions`, fail on a real disagreement, and does its control prove that?
8. **Value policy (idea 2) and the price rule.** Would every golden file pass the tripwire as specified? Consider reduced fractions with 9-digit parts under `none`, `"synthetic": true` on both JSON files, and the account and address patterns. Is "draws again" deterministic?
9. **Purity (AC9).** Can each part fail? Look at the `BigInt` addition, the escape rule, the specifier targets, and the recursive-listing control that answers PR #30's Medium 2.5-1. Does anything in the public API need a name AC9 rejects?
10. **S02.1 against `AGENTS.md`.** Is amending schema 0.1 in place, with no version bump, compatible with "A terms-schema bump is always at least a minor"? Are the two frozen summaries and the 4-line fixture diff right? Does carrying Medium 2.5-1 and idea 29 there fit the rulings that sent them to the next slice touching `packages/core`?
11. **Testability.** Can each acceptance criterion in both specs fail?
    - S03's AC10 holds at the builder's last commit and again after Pass 2. Is it stated so that both can be run?
    - AC7's grid has 301 ratios.
    - S02.1's AC4 counts lines.
12. **Slice boundary.** Is S03's list of allowed files outside its package complete? Consider the verify steps and the tooling tests that pin them. Is the generator's reliance on Node's built-in type stripping safe on both Node versions, and is "the builder stops and reports" the right fallback?
13. **Private list.** This seat runs the owner's private-list check, counts only, over the diff, the commit messages, the PR title and body, every comment and its own proposed comment.

## Sealed appendix: PM claims to verify independently

These are claims, not facts. Re-derive each one; report any that do not reproduce.

| # | Claim | How the PM got it |
| --- | --- | --- |
| 1 | The S02 calendar rules give 345 closures for 2026 to 2060 | `s03_frozen.py`, printed in the PR body, rebuilding the rules with `datetime` |
| 2 | B's estimated schedule has 19 entries. Entries 0 to 17 fall before 2031-02-26. Entry 18, 2031-03-03, is left out, so `k` is 18 and the final row's `premiumMonths` is 60 | The same script |
| 3 | B's call payouts are 104250 plus 2125 per index, from 104250 to 140375, and the final `aboveCallCents` is 142500 | The same script, with `cents(a) = floor(a + 1/2)` |
| 4 | B with rate 2000 and `monthly` has 55 entries and 54 call events, the last on 2031-02-03. The month table is 110000, 111667, 120000, 140000, 160000, 180000 and 200000 | The same script |
| 5 | Rate 2001 with `m` = 7 gives exactly 11672.5 cents, so the payout is 111673 | The same script |
| 6 | `finalPayout` on B gives 142500, 142500, 100000, 100000, 59990, 31420 and 0 for the seven ratios. `119999/200000` under `none` gives 60000 | The same script |
| 7 | The six `noteMetrics` rows, including `3501/5999` and `7/19` | The same script. An earlier draft had these two wrong, and the PM corrected them before committing |
| 8 | `76.470975 / 80.5` is exactly 0.94995. `95.125 × 1289/1250` is `98.0929`, and `120 × 0.97` and `120 × 0.93` are `116.4` and `111.6` | The same script |
| 9 | 2031-02-26 and 2031-07-09 are open Wednesdays. 2031-07-09 is five days before 2031-07-14 | The same script |
| 10 | S02.1's summaries are 15 of 17 on `minimal.yaml`, unverified `dates.final_valuation` and `dates.observation_schedule`, and 8 of 17 on `example-autocall.yaml`, with the same nine unverified paths as today | `summary-check.mjs`, printed in the PR body. On Node 24.22.2 it loads both fixtures with today's core at `38f9c1a`, imported from its `.ts` sources with no flag, then adds the new path by S02.1's rule |
| 11 | The branch passes `pnpm verify` on Node 24.22.2 and 26.13.0 with 154 core and 122 tooling tests | A fresh clone at `12e3d99` |
