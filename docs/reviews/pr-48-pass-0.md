# Pass 0 brief: PR #48 (docs after PR #46)

Written by the PM on 2026-11-15 (America/New_York), from a fresh read of the branch at `98bd74d`, before this brief and its index row were added. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Codex, GPT-6.1 Sol High. The PR touches no sensitive path, so the High effort applies. `AGENTS.md` asks for one cold review by a vendor that did not write the PR, and a Claude session wrote every line. The PR reports on PR #46, whose commits are one Claude's and one Codex's (`gh api repos/BeniCheni/keel/pulls/46/commits --jq '[.[] | .commit.author.name] | group_by(.) | map("\(length) \(.[0])") | .[]'` prints `1 Claude` and `1 Codex`). The bar on a vendor giving the only cold read of records about its own work names Cursor only, by Beni's ruling "No, Cursor only" of 2026-11-07 (idea 48), so Codex may take it. Cursor could take it only on Beni's word, which this brief does not ask for. The seat has no fallback: if it is unavailable, stop and escalate.

## Scope

- Spec: none amended. Design brief: none.
- Sensitive paths touched: none. `git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers | wc -l` prints `0`.
- Release: no. New dependencies: none.
- Bootstrap path: no. `verify` applies. Mutations and Pass M are N/A: no code, test or fixture changes. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.
- Files: `CHANGELOG.md`, `docs/v0.1.0-ideas.md`, this brief and its row in `docs/README.md`.

## Where each item comes from

The records merged since PR #45 are PR #46's three: `git diff --name-only 79839c3 origin/main -- docs/reviews` prints `pr-46-pass-0.md`, `pr-46-pass-1.5.md` and `pr-46-pass-2.5.md`. Of them, only `pr-46-pass-2.5.md` routes items to "the next ordinary docs PR", in its records note's "Where the open items go" bullets.

| Item | In this PR |
| --- | --- |
| The Pass 2.5 seat's Low 2: `CHANGELOG.md`'s line for PR #46 no longer says what the Planner row dropped | `CHANGELOG.md`, that line |
| The seat's first idea: the independence rules say nothing of the PM's channel to the Pass 2.5 seat | Idea 74 |
| The seat's second idea: the skill has no template for the Pass 2.5 seat's prompt | Idea 75 |
| The seat's Lows 1, 3, 4 and 5 | Not here: the records note closes 1 and 5, and leaves 3 and 4 with no change |

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`. A commit that adds or changes this brief cannot name itself, so its row gives the command that finds it. (Split into one row per commit on 2026-11-16, after Codex's cold review; the table first grouped every commit in one row.)

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `98bd74d` | Claude | Codex |
| `f15f86b`, which adds this brief and its index row (`git log --diff-filter=A -1 --format='%h %an' -- docs/reviews/pr-48-pass-0.md`) | Claude | Codex |
| The commit that splits this table, after the cold review (`git log -1 --format='%h %an' -- docs/reviews/pr-48-pass-0.md`) | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or a numbering fork. One cold review by Codex replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **The changelog line.** Does it now say what PR #46 changed in the Planner row, against `git diff 36f4a38^ 36f4a38 -- AGENTS.md`, adding or dropping nothing the row does not show? Codex's `cc8d95e` wrote the line this PR corrects; the correction is Claude's. Does anything else under `[Unreleased]` still misdescribe PR #46?
2. **The ideas.** Do ideas 74 and 75 state the seat's two ideas fairly, against `docs/reviews/pr-46-pass-2.5.md`, with every line number right at the head? Do they continue the numbering from 73, and does each say which sensitive path it would touch? Is either already a row, or already taken up?
3. **Coverage.** Does the table above match the records note it cites? Is anything the records merged since PR #45 route to the next ordinary docs PR missing?
4. **Privacy.** This seat runs the owner's private-list check, counts only, over the diff, the commit messages, the PR title and body, every comment and its own proposed comment.

Out of scope: any change to code, tests, fixtures, schemas, `AGENTS.md` or the skills. Findings there go in the comment for the PM to carry.
