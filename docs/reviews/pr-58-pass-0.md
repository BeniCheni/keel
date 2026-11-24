# Pass 0 brief: PR #58 (docs after PR #56)

Written by the PM on 2026-11-24 (America/New_York), from the branch `docs/after-pr-56` cut from `main` at `0b7327d`. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Codex, GPT-6.2 Sol High. No seats row names a Codex records or fast-track cold read (idea 96, added by this PR), so this brief uses Codex's review pin on `main`, the Pass 2 adjudicator row (`AGENTS.md:20`), as PR #57's cold read did. The PR touches no sensitive path, so the High effort applies. `AGENTS.md` asks for one cold review by a vendor that did not write the PR, and a Claude session wrote every line. The PR carries items from PR #56's review and PR #57's: both PRs' commits are all Claude's: `git log --format='%an' f551559..aa609a4` prints `Claude` 5 times and `git log --format='%an' dacfef3..e9121bd` 9 times, with the two reviewed heads fetched by `git fetch origin refs/pull/56/head refs/pull/57/head`, since both branches are deleted. So Codex has no commit in the work these ideas report on.

## Scope

- Spec: none amended. Design brief: none.
- Sensitive paths touched: none. `git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers apps` prints nothing.
- Release: no. New dependencies: none.
- Bootstrap path: no. `verify` applies. Mutations and Pass M are N/A: no code, test or fixture changes. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.
- Files: `docs/v0.1.0-ideas.md` (ideas 93 to 97), `docs/README.md` (this PR's row), and this brief.

## Where each item comes from

PR #56's records send these items to the next docs PR: F10 by ruling 20, F20 by ruling 24, and the Pass 2.5 seat's four "Deliberately not done" items, which the head's `SKILL.md` has the PM append. The last of those four is F10's own row, so it adds no row of its own (`docs/reviews/pr-56-pass-1.5.md:370`).

| Item | In this PR |
| --- | --- |
| F10, the Planner's effort against its pin, carried by ruling 20 | Idea 93 |
| F20, no slot for Beni's word on a Cursor build, carried by ruling 24 | Idea 94 |
| Idea 48 now reaching every slice | Idea 95, which extends idea 48 |
| No seats row or pin for a Claude or Codex records cold read | Idea 96, with PR #57's cold read as a second source |
| The skill's unguarded `mktemp -d` | Idea 97 |
| F10's ideas row | Idea 93 |
| PR #57's findings F1 to F3 | Not carried: each was fixed in PR #57 (`e9121bd` and its body) |

The CHANGELOG is unchanged: PR #56 changed `CHANGELOG.md` itself (`git show --stat dacfef3`), and no idea is a release item.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`. A commit that adds or changes this brief cannot name itself, so its row gives the command that finds it.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| The commit that adds ideas 93 to 97, this brief and its index row (`git log --diff-filter=A -1 --format='%h %an' -- docs/reviews/pr-58-pass-0.md`) | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or a numbering fork. One cold review by Codex replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **The ideas.** Does each of ideas 93 to 97 state its item fairly, against the record line and the review comment it cites, with every file and line number right at the head? Do they continue the numbering from 92, and does each say whether a fix would touch a sensitive path? Is any already a row, or already taken up?
2. **Coverage.** Does the table above match PR #56's records and the Pass 2.5 seat's list? Is anything those records send to the ideas rows missing?
3. **Idea 97's claim.** It says nothing reads `KEEL_DATA_DIR` yet. Is that true at the head, outside docs?
4. **The index row.** Is this PR's row in `docs/README.md` in the form PR #54's row had while it was in review?
5. **Privacy.** This seat runs the owner's private-list check, counts only, over the diff, the commit messages, the PR title and body, every comment and its own proposed comment.

Out of scope: any change to code, tests, fixtures, schemas, `AGENTS.md` or the skills. Findings there go in the comment for the PM to carry.
