# Pass 0 brief: PR #49 (docs after PR #48)

Written by the PM on 2026-11-16 (America/New_York), from a fresh read of the branch at `d778fe6`, before this brief and its index row were added. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Codex, GPT-6.1 Sol High. The PR touches no sensitive path, so the High effort applies. `AGENTS.md` asks for one cold review by a vendor that did not write the PR, and a Claude session wrote every line. The PR reports on PR #48, whose commits are all Claude's (`gh api repos/BeniCheni/keel/pulls/48/commits --jq '[.[] | .commit.author.name] | group_by(.) | map("\(length) \(.[0])") | .[]'` prints `3 Claude`). Cursor could take it only on Beni's word, which this brief does not ask for. The seat has no fallback: if it is unavailable, stop and escalate.

## Scope

- Spec: none amended. Design brief: none.
- Sensitive paths touched: none. `git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers` prints nothing.
- Release: no. New dependencies: none.
- Bootstrap path: no. `verify` applies. Mutations and Pass M are N/A: no code, test or fixture changes. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.
- Files: `docs/README.md` (PR #48's merge line and this PR's row), `docs/v0.1.0-ideas.md`, and this brief.

## Where each item comes from

No record routes items here: the only record merged since PR #47, the records PR for PR #46, is PR #48's own Pass 0 brief (`git diff --name-only 1724f74 origin/main -- docs/reviews` prints `docs/reviews/pr-48-pass-0.md`). The items come from PR #48's review comments (`gh api --paginate repos/BeniCheni/keel/issues/48/comments --jq '.[] | .body'`) and its squash message (`git log -1 --format=%b bbf9e6b`). The PR body's claims table gives the command for each figure taken from those comments.

| Item | In this PR |
| --- | --- |
| PR #48's row in `docs/README.md` still says "in review" | That row's merge line |
| PR #48's third cold re-read raised a Medium on pipes in plain replay commands; the fourth re-read and each after it list it as an idea under Beni's ruling "Scans only" (corrected on 2026-11-16 after Codex's cold review, which found this row dating the idea to the third re-read) | Idea 76 |
| PR #48's body scan blocks, which Beni's ruling "Cut to pointers" removed | Idea 77 |
| The rulings "Cut to a log" and "Cut to pointers" | Idea 78 |
| PR #48's cold review, finding 1: its brief grouped the commits in one row | Idea 79 |

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`. A commit that adds or changes this brief cannot name itself, so its row gives the command that finds it.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `d778fe6` | Claude | Codex |
| The commit that adds this brief and its index row (`git log --diff-filter=A -1 --format='%h %an' -- docs/reviews/pr-49-pass-0.md`) | Claude | Codex |
| The commit that corrects this brief after the cold review (`git log -1 --format='%h %an' -- docs/reviews/pr-49-pass-0.md`) | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or a numbering fork. One cold review by Codex replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **PR #48's merge line.** Does it match `gh pr view 48 --repo BeniCheni/keel --json mergedAt,mergeCommit,headRefOid` and PR #48's seventh re-read?
2. **The ideas.** Does each of ideas 76 to 79 state its source fairly, against PR #48's comments, the squash message of `bbf9e6b`, `docs/reviews/pr-45-pass-0.md` and the skill's Pass 0 template, with every line number right at the head? Do they continue the numbering from 75, and does each say which sensitive path it would touch? Is any already a row, or already taken up?
3. **Coverage.** Does the table above match its sources? Is anything from PR #48's review that belongs on the ideas list missing?
4. **Privacy.** This seat runs the owner's private-list check, counts only, over the diff, the commit messages, the PR title and body, every comment and its own proposed comment.

Out of scope: any change to code, tests, fixtures, schemas, `AGENTS.md` or the skills. Findings there go in the comment for the PM to carry.
