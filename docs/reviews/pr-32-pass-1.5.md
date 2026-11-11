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

## After Pass 2

Codex's Pass 2 is [issuecomment-6776702360](https://github.com/BeniCheni/keel/pull/32#issuecomment-6776702360), at `0b44cdb`. Its verdict was not mergeable, with four new Highs, four Mediums and one Low.

- **Pass 1 dispositions.** It closed H1, H5, M1, M2, M4, M5, M6, M7 and L1. It found H2, H3, H4 and M3 partly closed, with what remains in its new findings.
- **Checks.** Both quickstarts, GitHub's `verify` and the privacy scans passed. Demo mode, mutations and Pass M were recorded as N/A.
- **Stops.** It first stopped on an existing clone path, and the PM gave it a new one.

The PM accepts all nine findings and contests none. The fixes are in `d6c22f7`. S02.1 is unchanged.

| Pass 2 # | Severity | PM disposition | Reason and fix in `d6c22f7` |
| --- | --- | --- | --- |
| P2-1 | High | Accept | Reproduced from the text: check 2 required maturity to be known, not evidenced, and `matured` read only dates. Check 2 now requires settlement, the first call observation and maturity to be evidenced. A status of `estimate` or `assumed` gives the new `input-unevidenced`, for every function but `noteMetrics`. Decisions 9 and 14 and a new honesty clause cover it |
| P2-2 | High | Accept | Reproduced from the text: with the final valuation date not known, every event was a call. Now an event is a call event only when a later listed item has a known date, or, for a conflict, it falls before every candidate. Any other event's role is unknown:<br>- It is never a row.<br>- Reaching it gives `unknown` with the final valuation reason.<br>- Before that it is `next`, of kind `observation`.<br>Pass 2's case is frozen as "Role unknown" |
| P2-3 | High | Accept | Reproduced from the text and S02's listed branch. Check 2 now includes `dates.first_call_observation` for unknown, conflict and unevidenced, so no listed schedule reaches the mapping without an anchor |
| P2-4 | High | Accept | Reproduced: with settlement 2027-03-04, the offset search gives 0 at 184 days. Chronology now runs from settlement. `observation-before-settlement` and `final-valuation-before-settlement` replace the codes based on the trade date, so the offset is always measured forward. Pass 2's case is frozen as "Call before settlement". The trade date is no longer read, and `unverified` now starts with `dates.settlement` |
| P2-5 | Medium | Accept | Confirmed in `tools/tripwire/scan.mjs`: `scanRepo` lists files with `git ls-files` and returns `error` apart from `hits`. The generator now copies its output and the two policy files into a fresh temporary Git repository, commits them, sets `origin/main` and runs `scanRepo`. It fails on any hit or on an `error` |
| P2-6 | Medium | Accept | Reproduced: with two listed items `k` is 2, while the final valuation date sits nearest slot 18, or slot 54 for monthly. Both examples now list `listed-off-cycle` then `final-valuation-off-cycle`, and "Mapping failures" says each lists the group's full findings in order |
| P2-7 | Medium | Accept | AC4 now pins both sides with the final valuation date absent: `live` with empty `reasons` while the last listed item is in the future, and `unknown` with `final-valuation-absent` once it is reached |
| P2-8 | Low | Accept | Decision 3 now says nothing divides by a zero ratio, and that the two distances divide by the worst ratio only when it is above zero |
| P2-9 | Medium | Accept | The tie sentence now says the premium is exactly 11672.5 cents and rounds half up to 11673, so the payout is 111673. Half-even would give 11672 and 111672 |

Beyond the findings, the Rows steps are renumbered for the new step 3, an event of unknown role. References to them in `finalPayout`, `noteMetrics` and AC4 now say steps 5 and 8. B's description now names settlement and maturity, and says the trade date is not read.

### The PM's re-runs at `d6c22f7`

| Check | Command | Result |
| --- | --- | --- |
| The new examples' values | `python3 -I s03_amend.py`, extended and printed in the PR body | Settlement 2027-03-04 gives offset 0 at 184 days, against 215 for 1. With two listed items, the final valuation date sits nearest slot 18 (quarterly) and 54 (monthly). 2026-09-01 is not before every candidate in the role example |
| No frozen value changed | The 20 frozen strings from Pass 1.5, against the spec at `89687da` and at `d6c22f7` | 20 of 20 present and unchanged |
| Size of the amendment | `git diff --shortstat 0b44cdb d6c22f7` | 1 file, 80 insertions, 58 deletions |

### Authorship since Pass 2

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `d6c22f7` docs(specs): amend S03 after Pass 2 | Claude | Codex, re-read of the Pass 2 fixes |
| The commit adding this section | Claude | Codex, the same re-read |

### What the re-read does

1. **Cold-read `d6c22f7` and this section's commit.** `git diff 0b44cdb d6c22f7` is the whole amendment.
2. **Reproduce or disprove each disposition above.** Can a compliant build still show:
   - `matured` or `final-fixed` that rests on a planning date;
   - `called` on an event whose role is unknown;
   - a mapping without an evidenced anchor;
   - a call on or before settlement?
3. **Re-derive the new examples** with your own implementation: call before settlement, role unknown, and both two-item mapping failures with their full findings. Confirm no other frozen value changed.
4. **Check the renumbered Rows steps.** Is every reference to them right?

## After the re-read of the Pass 2 fixes

Codex's re-read is [issuecomment-6778380443](https://github.com/BeniCheni/keel/pull/32#issuecomment-6778380443), at `cc8b063`, run in a GPT-6.1 Sol High sub-agent. Its verdict was not mergeable, with two new Highs and two Mediums.

- **Pass 2 dispositions.** It closed P2-1, P2-3, P2-5, P2-6, P2-7, P2-8 and P2-9. It found P2-2 and P2-4 partly closed, with what remains in R1 and R2.
- **Checks.** Both quickstarts, GitHub's `verify`, every claim in the PR body and the privacy scans passed. Demo mode, mutations and Pass M were recorded as N/A.

The PM accepts all four findings and contests none. The fixes are in `48b995e`. S02.1 is unchanged.

| Re-read # | Severity | PM disposition | Reason and fix in `48b995e` |
| --- | --- | --- | --- |
| R1 | High | Accept | Reproduced with the rules at `cc8b063` in `s03_reread.py`. In the role example with a second listed item on 2026-12-01 at `estimate`, the first item was a call event because a later item had a known date, so closes that would call gave `called` at 104250. Now:<br>- With the term absent or unknown, only a later item with an evidenced date makes an event a call event.<br>- With a conflict, only a date before every candidate does. A listed item never rules a candidate out, since that would resolve the conflict, which hard rule 6 forbids. This goes beyond R1's case, and is stricter.<br>Frozen as "A later listed item" and "The term absent", under a new heading, "Final valuation date not known" |
| R2 | Medium | Accept | Reproduced: with a listed schedule, a stated first call observation of 2026-03-03, before settlement on 2026-03-04, gave no finding, with an offset of 0 at 1 day. The new `first-call-before-settlement` checks `dates.first_call_observation` with either kind of schedule, and `observation-before-settlement` now covers listed items only. Frozen as "Listed, anchored before settlement". "Call before settlement" now gives `first-call-before-settlement` alone, in place of `observation-before-settlement` at index 0. That is the one example value this amendment changes |
| R3 | High | Accept | Reproduced: with the trade date at 2026-09-02, check 5 at `cc8b063` found nothing, so g01's closes would give `called` at 104250. `d6c22f7` had stopped reading the trade date. It is read again:<br>- In check 2, as one of four dates that must be known and evidenced.<br>- In check 5, where the new `settlement-before-trade` requires settlement on or after it. Every observation must fall after settlement, so each falls after the trade date.<br>`unverified` starts with `dates.trade` again, as it did at `0b44cdb`, and paths 3 to 16 are `verificationSummary`'s list. B's trade date is `primary`, so no golden `unverified` value changes. Frozen as "Trade after settlement" |
| R4 | Medium | Accept | Confirmed: "Role unknown" sat under "Mapping failures", whose honesty clause requires `unavailable`, while the example is evaluated. It moves to "Final valuation date not known". "Mapping failures" becomes "Chronology and mapping failures", and the honesty clauses and AC4 name both headings. The chronology honesty clause now names its codes instead of counting bullets |

**Found by the PM while checking the fixes.** Slots were counted only from 0, so a listed item dated before the first call observation could sit nearest slot 0. In B with a listed schedule of 2026-06-01 and 2026-12-01, the first item sat nearest slot 0, 92 days away. It would have been paid 6 months' premium inside the non-call period, a wrong payoff and so a High under Severity. Slots now run in both directions, so that item sits on slot −1 and gives `listed-off-cycle`. Every existing nearest-slot value is unchanged. Frozen as "Before the first call", with AC1 and a new mutant. The next re-read checks it like the four findings.

### The PM's re-runs at `48b995e`

| Check | Command | Result |
| --- | --- | --- |
| The new examples' values | `python3 -I s03_reread.py`, printed in the PR body | Each new example's findings and roles as frozen. Under the rules at `cc8b063` the same script reproduces R1 (the first item a call event), R2 and R3 (no finding). With slots from 0 only, 2026-06-01 sits nearest slot 0; with slots in both directions, slot −1. Every existing nearest-slot value is unchanged |
| No frozen value changed | `python3 -I frozen20.py`, printed in the PR body, and `python3 -I s03_frozen.py \| shasum -a 256` | 20 of 20 present and unchanged since `89687da`. The output hash starts `4dbe9b22`, unchanged |
| Copy words | `grep -c -i -w 'should\|buy\|sell\|hold' docs/specs/s03-payoff-engine.md` | 0 |
| Size of the amendment | `git diff --shortstat cc8b063 48b995e` | 1 file, 63 insertions, 37 deletions |

### Authorship since the re-read

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `48b995e` docs(specs): amend S03 after the re-read of the Pass 2 fixes | Claude | Codex, the next re-read |
| The commit adding this section | Claude | Codex, the same re-read |

### What the next re-read does

1. **Cold-read `48b995e` and this section's commit.** `git diff cc8b063 48b995e` is the whole amendment.
2. **Reproduce or disprove each disposition above.** Can a compliant build still show:
   - `called` on an event whose role rests on a planning date, or on a resolved conflict;
   - a mapping anchored on or before settlement, with either kind of schedule;
   - an observation on or before the trade date;
   - a premium on a listed item dated before the first call observation?
3. **Re-derive the new examples** with your own implementation before reading the scripts: the four new or changed ones under Chronology and mapping failures, and the three under Final valuation date not known. Confirm that no other frozen value changed, and that slots in both directions change no existing nearest-slot value.
4. **Check the renamed headings.** Is every reference to them right?

## After the second re-read

Codex's second re-read is [issuecomment-6779820940](https://github.com/BeniCheni/keel/pull/32#issuecomment-6779820940), at `9ccc8ee`, run in a GPT-6.1 Sol High sub-agent. Its verdict was not mergeable, with one new High and one Medium.

- **Dispositions.** It closed R1 to R4 and found the PM's slot gap partly closed.
- **Checks.** Both quickstarts, GitHub's `verify`, every claim in the PR body and the privacy scans passed. Demo mode, mutations and Pass M were recorded as N/A.
- **A process slip.** Against the prompt, the sub-agent opened the review skill's pointer file in an earlier checkout, `keel-pr-32-p2`. It read nothing else there and reviewed in `/tmp/keel-pr-32-reread2`. That checkout is a clone of this repository holding synthetic data only, so the PM records a process slip, not a privacy issue. The next prompt names the skill files to read in the fresh clone.

The PM accepts both findings and contests neither, numbering them R5 and R6. The fixes are in `7563d4f`. S02.1 is unchanged.

| Re-read # | Severity | PM disposition | Reason and fix in `7563d4f` |
| --- | --- | --- | --- |
| R5 | High | Accept | Reproduced with `s03_reread2.py`. In L with its first item on 2026-08-31, the distances to slots −1, 0 and 1 are 91, 1 and 92 days. Under `48b995e` check 5 finds nothing, so closes that would call on 2026-08-31 give `called` at 104250, a day before the first date the terms allow a call. The fix makes the date chain explicit:<br>- settlement on or after the trade date;<br>- the first call observation after settlement;<br>- every listed item with a known date, and the final valuation date, on or after the first call observation and on or before maturity.<br>`observation-before-first-call` replaces `observation-before-settlement`, and `final-valuation-before-first-call` replaces `final-valuation-before-settlement`. The first call observation falls after settlement, so each new code covers the one it replaces. Frozen as "Before the first call", in place of the June example |
| R6 | Medium | Accept | Reproduced: under the rules at `cc8b063`, the June example already gave `final-valuation-off-cycle`, so it paid nothing. The PM's "would have been paid" overstated it, and only with the term absent did the old rule give no finding. R5's case replaces the example and isolates the gap: `observation-before-first-call` at index 0, alone |

**The negative slots of `48b995e` are withdrawn.** Once nothing dated falls before the first call observation, no negative slot is ever nearest. `s03_reread2.py` checks every date from the anchor to maturity, 1,645 of them, quarterly and monthly. Keeping the slots would leave dead text and a mutant no test can kill. Slots count from 0 again, as at `cc8b063`, and the mutant "Counting slots only from 0" is gone. Two mutants are added: accepting a listed item before the first call observation, and accepting a final valuation date before it.

### The PM's re-runs at `7563d4f`

| Check | Command | Result |
| --- | --- | --- |
| The changed examples | `python3 -I s03_reread2.py`, printed in the PR body | R5's case gives nothing under `48b995e` and `observation-before-first-call` at index 0 alone under the new rules. The June list, under the rules at `cc8b063`: `final-valuation-off-cycle` with the term present, nothing with it absent. Every other example's findings are unchanged. Negative slots change no nearest slot on any of the 1,645 dates |
| No frozen value changed | `python3 -I frozen20.py` and `python3 -I s03_frozen.py \| shasum -a 256` | 20 of 20 present and unchanged since `89687da`. The output hash starts `4dbe9b22`, unchanged |
| Copy words | `grep -c -i -w 'should\|buy\|sell\|hold' docs/specs/s03-payoff-engine.md` | 0 |
| Size of the amendment | `git diff --shortstat 9ccc8ee 7563d4f` | 1 file, 17 insertions, 15 deletions |

### Authorship since the second re-read

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `7563d4f` docs(specs): amend S03 after the second re-read | Claude | Codex, the third re-read |
| The commit adding this section | Claude | Codex, the same re-read |

### What the third re-read does

1. **Cold-read `7563d4f` and this section's commit.** `git diff 9ccc8ee 7563d4f` is the whole amendment.
2. **Reproduce or disprove each disposition above.** Can a compliant build still show a call or a premium on a dated observation before the first call observation, on or before settlement, or before the trade date? Check both kinds of schedule, with the final valuation date known and not known. Does withdrawing the negative slots reopen any route that `48b995e` closed?
3. **Re-derive "Before the first call"** with your own implementation before reading the script, and confirm that no other example's findings changed.
4. **Check the retired codes.** Does any reference to `observation-before-settlement` or `final-valuation-before-settlement` remain in the spec?

## After the third re-read

Codex's third re-read is [issuecomment-6780212799](https://github.com/BeniCheni/keel/pull/32#issuecomment-6780212799), at `5abb894`, run in a GPT-6.1 Sol High sub-agent. Its formal verdict was not mergeable and its plan verdict mergeable after one Medium fix.

- **Dispositions.** It closed R5, R6 and the PM's slot gap in the plan. It marked R5 formally open, because a docs commit carries no test that fails without the fix, which Severity requires.
- **Checks.** Both quickstarts, GitHub's `verify`, every claim in the PR body and the privacy scans passed. Demo mode, mutations and Pass M were recorded as N/A.
- **Paths.** The sub-agent read the review skill from its fresh clone. Outside it, it opened only the private list and its own temporary folder.

### Beni's rulings of 2026-11-11

6. **"Yes, with obligations (Recommended)"**, on "As on PR #16 and PR #28 (idea 39), may PR #32 merge with all 14 open, for this PR only, if the S03 build must land each one's test?" Every High raised on PR #32 stays open under Severity, and the shadow gate says "would escalate". Beni still merges. This is an exception for this PR only, as on PR #16 (ruling 12) and PR #28 (ruling 1). `AGENTS.md` has no exception path. **The question's count was wrong.** The PM wrote 14. The Highs are 12 finding rows (`grep -c -E '^\| (H[0-9]+|P2-[0-9]+|R[0-9]+) \| High \|' docs/reviews/pr-32-pass-1.5.md`) plus the PM's slot gap, so 13. The ruling covers every High on this PR, so its scope is unchanged, and the error is reported to Beni.
7. **"Yes, last round (Recommended)"**, on "Should the push that fixes it be the last spec round?" As on PR #28 (ruling 3): Codex still cold-reads the fix and checks it is correct. Any further Medium or Low goes on a list that S03's build review carries, not into another spec round. A new High still goes to Beni.

### The obligations on the S03 build

The build's Pass 0 brief lists each High with the test that closes it. The build's PR body names, for each, a mutant that test kills. Each closes only when that test lands and fails without the fix.

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

### The Medium

| Re-read # | Severity | PM disposition | Reason and fix in `6d27938` |
| --- | --- | --- | --- |
| R7 | Medium | Accept | Reproduced with `s03_reread3.py`. With the first call observation 2026-09-01, the dates 2026-08-28 and 2026-08-31 are both nearest slot 0, at 4 and 1 days. If every bullet of check 5 runs, the list is `observation-before-first-call` at 0 and at 1, then `listed-off-cycle` at 1. If the mapping skipped rejected dates, the last finding would drop. The Slots text said no compared date fell before the anchor, which suggested the second reading. Check 5 now says every bullet runs, and a date one bullet rejects is still checked by the later ones. The Slots text now says check 5 rejects every date before the anchor, whatever its nearest slot. Frozen as "Two before the first call", on L. The PR body no longer says such a date cannot reach slot 0 |

### The PM's re-runs at `6d27938`

| Check | Command | Result |
| --- | --- | --- |
| Scripts restored | The six scripts the PR body printed before this round, extracted and hashed. The seventh, `s03_reread3.py`, joined the body with this round | All six match their printed SHA-256 |
| The new example | `python3 -I s03_reread3.py`, printed in the PR body | 2026-08-28 is a Friday and 2026-08-31 a Monday, both open. Both are nearest slot 0. The findings are as frozen |
| No frozen value changed | `python3 -I frozen20.py` and `python3 -I s03_frozen.py \| shasum -a 256` | 20 of 20 present and unchanged since `89687da`. The output hash starts `4dbe9b22`, unchanged |
| Copy words | `grep -c -i -w 'should\|buy\|sell\|hold' docs/specs/s03-payoff-engine.md` | 0 |
| Size of the amendment | `git diff --shortstat 5abb894 6d27938` | 1 file, 5 insertions, 4 deletions |

### Authorship since the third re-read

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `6d27938` docs(specs): amend S03 after the third re-read | Claude | Codex, the final re-read |
| The commit adding this section | Claude | Codex, the same re-read |

### What the final re-read does

By ruling 7 this is the last spec round.

1. **Cold-read `6d27938` and this section's commit.** `git diff 5abb894 6d27938` is the whole amendment.
2. **Check that the fix is correct.** Does check 5 now say one thing about rejected dates, and does "Two before the first call" follow from it?
3. **Check the obligations table.** Does each of the 13 Highs name a test in the spec that would fail without its fix?
4. **List anything else.** Put any further Medium or Low on the list for S03's build review. Report a new High to Beni.
