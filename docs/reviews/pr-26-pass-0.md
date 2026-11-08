# Pass 0 brief: PR #26 (idea 48 from the PR #24 review)

Written by the PM on 2026-11-08 (America/New_York), from a fresh read of the PR. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Codex, GPT-6.1 Sol High. `AGENTS.md` asks for one cold review by a vendor that did not write the PR, and a Claude session wrote every line. Cursor does not take it: the row reports on PR #24, which has Cursor-authored commits, so the bar PR #24 landed applies. Codex's own reading is the subject of the row, so it says so in its comment. The seat has no fallback: if it is unavailable, stop and escalate.

## Scope

- Spec: none. This PR adds one candidate to `docs/v0.1.0-ideas.md`, which is never a release scope, and indexes this brief. Design brief: none.
- Sensitive paths touched: none (`git diff --name-only origin/main...HEAD` lists `docs/README.md`, `docs/reviews/pr-26-pass-0.md` and `docs/v0.1.0-ideas.md`). The row names two sensitive paths and touches neither.
- Release: no.
- New dependencies: none.
- Bootstrap path: no. `verify` applies through CI. Mutations and Pass M do not apply, because no code or fixture changes.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| Every commit on the branch, this brief's included | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or numbering fork. One cold review by Codex replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **Source.** Does the row state Codex's reading as its Pass 2 comment does? `gh api repos/BeniCheni/keel/issues/comments/6715607940 --jq .body`, under "Owner decision on scope".
2. **PR #21.** Does it include Codex's `0c06924`? `gh pr view 21 --repo BeniCheni/keel --json commits`.
3. **The ruling.** Is it recorded as the row says? `grep -n 'No, Cursor only' docs/reviews/pr-24-pass-2.5.md`. Beni gave the ruling in the PM's session, so its words are not checkable beyond that record, and Beni's merge confirms it.
4. **The "no eligible reader" sentence.** Does it follow from `AGENTS.md`? Take a records PR written by a Claude session about a slice with Cursor and Codex commits. Claude authored the records PR, and an extended bar would stop both other vendors.
5. **PR #25.** Did Codex give the cold read of records about a PR with its own commit, as the row says? `gh pr view 24 --repo BeniCheni/keel --json commits` lists `22de9d7` by Codex, and PR #25's comments are Codex's.
6. **Existing rows.** Only additions: `git diff origin/main...HEAD -- docs/v0.1.0-ideas.md docs/README.md | grep -c '^-[^-]'` prints `0`, and the same diff with `grep -c '^+[|] '` prints `2`.
7. **Private list.** This seat runs the owner's private-list check, counts only, over the diff, the commit messages, the PR title and body, every comment and its own proposed comment.
