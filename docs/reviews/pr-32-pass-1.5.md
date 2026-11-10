# Pass 1.5 brief: PR #32

Written by the PM on 2026-11-10 (America/New_York) after reading Codex's Pass 1 comment ([issuecomment-6775075272](https://github.com/BeniCheni/keel/pull/32#issuecomment-6775075272)) at `89687da` and taking Beni's two rulings below. Codex receives this brief for Pass 2.

Pass 1's verdict was not mergeable, on five Highs. It reproduced every frozen value and all eleven sealed claims, and found zero hits on every privacy surface. It recorded demo mode, mutations and Pass M as N/A. Before checkout it had stopped once, on the prompt's demo-mode line, which the PM withdrew in favour of the skill.

## Per finding

The PM accepts every finding and contests none. All fixes are in `c456237`. This is a spec, so nothing goes back to Cursor as rework.

| Pass 1 # | Severity | PM disposition | Reason and fix in `c456237` | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| H1 | High | Accept | Reproduced: a close of `0.000001` on ALFA's `100.25` rounds to `0/1` under `half-up-4dp`, and `toCall` divided by it. `toCall` is now `Ratio \| null`, and null when the worst ratio is zero. Decision 3 says nothing divides by a ratio. A frozen `0/1` metrics row, AC5 and a mutant pin it | no |
| H2 | High | Accept | Reproduced from the text: `matured` came from the final row alone, and a listed schedule never met S02's maturity check. Now:<br>- `dates.trade`, `dates.settlement` and `dates.maturity` are check-2 inputs.<br>- Check 5 rejects a final valuation date on or before trade or after maturity, an evidenced call event on or before trade, and a listed item after maturity.<br>- A new status, `final-fixed`, covers the final valuation date up to the day before maturity, and `matured` starts at maturity.<br>- A conflict that straddles the final valuation date is now an input conflict, so no chronology is assumed.<br>Decision 9, Status and a new honesty test carry this | no |
| H3 | High | Accept, by Beni's ruling 5 | A generated date is not evidence that the contract observed then. New Decision 14:<br>- A status rests only on evidenced dates: stated, listed or final-valuation dates with status `primary`, `document`, `advisor` or `user`.<br>- A past planning date stops evaluation with `unknown` and `estimated-date`, and is never a row.<br>Golden cases g02 to g10 move to L, B with its dates listed. g11 holds closes that would call on a planning date, and the engine does not call on them | no |
| H4 | High | Accept | Reproduced: 106375 against 114875 for Pass 1's off-cycle example. Decision 6 now uses the index only when the dates evidence it:<br>- The whole-month offset from settlement nearest the first call observation must equal `non_call_months`. This takes up idea 49.<br>- Every listed item, and the final valuation date, must sit nearest the slot its index names. A tie fails.<br>Otherwise the result is `non-call-months-mismatch`, `listed-off-cycle` or `final-valuation-off-cycle`. "Mapping failures" freezes three examples | no |
| H5 | High | Accept | Reproduced from the text. An undated item is now `next` only when `asOf` is the last row's date, or when there is no row and `asOf` is on or before trade. Otherwise it gives `unknown` with `date-unknown`. AC4 and AC7 each require the trailing case, and AC7 requires at least 100 such evaluations. There is also a new honesty test | no |
| M1 | Medium | Accept | Check 1 now validates only the closes a function can read: those for a member's ticker dated on or before `asOf`. Any other close is never read and never validated. An honesty test and AC4 cover the boundary with invalid data | no |
| M2 | Medium | Accept | Rows step 4 now gives every member's `close`, `sources` and `ratio` for each case:<br>- No close: `null`, empty and `null`.<br>- A conflict: `null`, every source and `null`.<br>- A bad initial level: the close as read and a `null` ratio.<br>- A member with no reason keeps its ratio when another member has one.<br>Shared result fields lists the full `unverified` order, so Pass M needs no other spec. Pass M also reads Decisions and Public API, and a second control removes an `assumptions` entry | no |
| M3 | Medium | Accept | The generator now runs the repository tripwire (`scanRepo`) after writing and fails on any hit, in any class, under `fixtures/golden/`. Redraws are capped at 64 per value, and a hit on a value the spec fixes is an error, never redrawn. Decision 13 says so | no |
| M4 | Medium | Accept | Pass 1 is right: with today's one-level `test-support/`, both narrowed globs match the listing. Both specs now commit a pure depth marker two folders down: S02.1 in `packages/core/src/schedule/test-support/nested/`, and S03 in `packages/plugin-mln/src/test-support/nested/`. A narrowed glob then misses it. S03 also runs its comparison and extension rule on synthetic listings with `x.mts`, `x.js` and `x.json` | no |
| M5 | Medium | Accept, by Beni's ruling 4 | The skill checks that "the schema version moved if the shape changed". S02.1 now adds `schemas/mln-terms/0.2.json` and leaves `0.1.json` byte-identical. The loader reads both, and a 0.1 file stating the term is `unknown-key`. `example-autocall.yaml` moves to 0.2, which makes 5 lines added and 1 removed. A new invalid fixture puts the term in a 0.1 file | no |
| M6 | Medium | Accept | Reproduced: the existing `invalid-date` entry names `dates.maturity.value`. The new entry is `invalid-date` at `dates.final_valuation.value`, and AC1 asserts its path, line and column | no |
| M7 | Medium | Accept | Scope now lists every file the builder may change, naming the three tooling tests, and anything else stops the build. AC10 checks that allowlist at the builder's last commit. At the Pass 2 head it requires `tools/reference/payoff.py` to exist, its authorship history to be nonempty and all Codex, and the same allowlist plus `tools/reference/` | no |
| L1 | Low | Accept | The comment now reads "the given ratio, rounded by the terms' rule". A whole-word scan of the API block for `performance`, `crypto`, `console`, `Date`, `process` and `fetch` finds none | no |

Beyond the findings, the PM rewrote the golden table for H3 and H2. It now has eleven cases, ten on L, and `g05` is now `g05-final-fixed-par` at `asOf` 2031-02-27.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`, extended with the commits since Pass 1.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `12e3d99` docs(specs): S02.1 final valuation date and S03 payoff engine | Claude | Codex, Pass 1 |
| `89687da` docs(reviews): Pass 0 brief for PR #32 | Claude | Codex, Pass 1 |
| `c456237` docs(specs): amend S02.1 and S03 after the plan challenge | Claude | Codex, Pass 2 |
| The commit adding this brief | Claude | Codex, Pass 2 |

## Rulings from Beni

All of these were given in the PM's session; Beni's merge confirms them.

**Carried from Pass 0:**

- 2026-11-08: "Split, schedule first".
- 2026-11-10:
  1. "Schema term first (Recommended)".
  2. "Codex at Pass 2 (Recommended)".
  3. "Simple, final, cash (Recommended)".

**New, 2026-11-10, on two questions from Pass 1:**

4. On M5, how S02.1 handles the schema version: "Bump to 0.2 (Recommended)".
5. On H3, what S03 does at a past estimated date: "Stop: status unknown (Recommended)".

## What Pass 2 does

1. **Cold-read `c456237` and this brief's commit**, the Claude-authored commits after Pass 1. `git diff 89687da c456237` is the whole amendment.
2. **Reproduce or disprove each disposition above**, and check each fix against the finding it answers. In particular:
   - Can a compliant build still show a payout, a `final-fixed` or `matured` status, or a terminal call that the inputs do not support?
   - Does Decision 14 leave any path where a planning date shapes a status?
3. **Test the new rules as a plan:**
   - The whole-month offset and the nearest-slot mapping: ties, month-end clamping, and the 54/55 monthly case.
   - The chronology checks and their order.
   - `final-fixed` against `matured`.
   - The undated-item rule.
   - The member trace.
   - The `unverified` order.

   Could you still write the Pass M reference from S03's named sections alone?
4. **Check S02.1's schema 0.2 plan:**
   - The loader reads both versions, and a 0.1 file stating the term gets `unknown-key`.
   - The fixture diff is 5 lines added and 1 removed, and the two new manifest entries are right.
   - Does the depth marker make AC6 fail for both narrowed globs?
5. **Re-derive the new values** with your own implementation before opening the appendix:
   - the whole-month offset for B;
   - the nearest slots for B quarterly and monthly, and for the final valuation date;
   - the off-cycle and tie examples;
   - the `0/1` metrics row.
6. **Rerun the claims.** Re-run every claim in the PR body's claims table at the head. Rerun the frozen values to confirm the amendment changed none of those Pass 1 reproduced.
7. **Run the skill's Pass 2 as written,** with this prompt's narrowing. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md`), the known gap of idea 50. Mutations are N/A because no code changes. Pass M is N/A because no engine or golden fixture changes.

## Sealed appendix for Pass 2

Pass 1's findings and the PM's fixes are suspicions to re-derive, not conclusions. Codex reproduces or disproves each one independently and adds its own read.

| # | PM claim | How the PM got it |
| --- | --- | --- |
| 1 | For B, settlement 2026-03-04 plus 6 months is 3 days from the first call observation 2026-09-01, and plus 5 months is 28 days. So the offset is 6 | `s03_amend.py`, printed in the PR body, which reuses `s03_frozen.py`'s rules |
| 2 | Every B call entry, quarterly and monthly, sits nearest its own slot, at most 3 days after it. The final valuation date 2031-02-26 is nearest slot 18 (quarterly) and slot 54 (monthly), each equal to `k` | The same script |
| 3 | 2027-12-01 sits nearest quarterly slot 5. 2026-09-16 is 15 days from monthly slots 0 and 1, so it has no nearest slot | The same script |
| 4 | `0.000001 / 100.25` rounds to `0/1` under `half-up-4dp`, below the barrier | The same script |
| 5 | Pass 1's H4 example pays 106375 by index and 114875 by elapsed months | Pass 1's probe C, rerun by the PM in this session |
| 6 | The amendment changes no value that Pass 1 reproduced at `89687da` | `python3 -I s03_frozen.py` again. Then 20 frozen strings were checked against the spec at `89687da` and at the head: the rounding rows, B's payouts, the month table, the tie, the `finalPayout` and `noteMetrics` rows, and the golden decimals. Each is present, unchanged, in both |
