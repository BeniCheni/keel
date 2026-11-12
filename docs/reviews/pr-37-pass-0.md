# Pass 0 brief: PR #37 (docs after S02.1)

Written by the PM on 2026-11-12 (America/New_York), from a fresh read of the PR at `ae19dc6`, before this brief and its index row were added. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing. When it was written, PR #37 had no comment (`gh api repos/BeniCheni/keel/issues/37/comments --jq length` printed `0`).

## Seat for the cold review

Codex, GPT-6.1 Sol High. The PR touches no sensitive path, so the High effort applies. `AGENTS.md` asks for one cold review by a vendor that did not write the PR, and a Claude session wrote every line. Cursor does not take it: the PR reports on PR #34, which has a Cursor-authored commit (`gh api repos/BeniCheni/keel/pulls/34/commits --jq '[.[] | .commit.author.name] | group_by(.) | map("\(length) \(.[0])") | .[]'` prints `2 Claude`, `1 Codex`, `1 Cursor`). The seat has no fallback: if it is unavailable, stop and escalate.

## Scope

- Spec: this PR amends four specs, `s01-terms-schema.md`, `s02-schedule.md`, `s02.1-final-valuation.md` and `s03-payoff-engine.md`, to match code already merged and Beni's rulings. Design brief: none.
- Sensitive paths touched: none. `git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers | wc -l` prints `0`.
- Release: no. New dependencies: none.
- Bootstrap path: no. `verify` applies. Mutations and Pass M are N/A: no code, test or fixture changes. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.
- Files: `README.md`, the four specs, `docs/v0.1.0-ideas.md`, this brief and its row in `docs/README.md`.

## Rulings the PR records

All three came from Beni on 2026-11-11, in sessions the cold review cannot see. The records on `main` quote them, and Beni's merge confirms them.

1. **"Yes, in the prompt (Recommended)", 16:23 EST, in the PM's session.** `0.2.json`'s `$id`, `title` and `schema` constant read `mln-terms/0.2`, and the manifest's `version` line moves from 1 to 2. `docs/reviews/pr-34-pass-0.md`, ruling 1, quotes the question.
2. **"Yes, fix the spec (Recommended)", 18:23 EST, in the PM's session.** Spec line 57 is met by the generator's comment. `docs/reviews/pr-34-pass-1.5.md`, ruling 5.
3. **"Carry (Recommended)", in PR #34's Pass 2.5 session.** The S01 source-check gap is carried rather than fixed on PR #34; it becomes idea 60. `docs/reviews/pr-34-pass-2.5.md`, question 4 and the records note.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| Every commit on the branch, this brief's included | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or a numbering fork. One cold review by Codex replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **The frozen values.** Do S01's two summaries and S02's `termDateFlags` object now equal what the tests on `main` assert? They are in `packages/core/src/terms/terms.summary.test.ts` and `packages/core/src/schedule/schedule.flags.test.ts`.
2. **S01's path order.** Does the amended list match the order of the `consider` calls in `packages/core/src/terms/summary.ts`? Does the new item's rule match the code: verified only when present as one `primary` term?
3. **S02.1's line 1 rule.** Does the added sentence describe what `load.ts` does for a file whose line 1 is not a marker? Try a 0.2 file with a comment on line 1, a 0.1 file the same way, and a file naming an unknown marker.
4. **S02.1's fixture text.** Do the fixture section and AC4 now match the manifest and the generator: version 2, the two entries appended, and the comment above the 0.2 mutation?
5. **S03's status line.** Are the amendment dates right? `git show -s --format='%h %cI' c456237 d6c22f7 48b995e 7563d4f 6d27938`.
6. **README line 7.** Is it accurate now? Does anything else in the README still describe the core as it stood before S02 and S02.1?
7. **The ideas.** Do ideas 59 to 62 state their sources fairly, continue the numbering from 58, and sit in the ranked table? Is idea 29's taken-up row right?
8. **Stale claims elsewhere.** Does any other spec or doc still state a value or behaviour that PR #34 or PR #35 changed?
9. **Privacy.** This seat runs the owner's private-list check, counts only, over the diff, the commit messages, the PR title and body, every comment and its own proposed comment.

Out of scope: any change to code, tests, fixtures, schemas or `AGENTS.md`. Findings there go in the comment for the PM to carry.
