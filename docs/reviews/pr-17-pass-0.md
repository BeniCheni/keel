# Pass 0 brief: PR #17 (ideas from the PR #16 review)

Written by the PM on 2026-11-02 (America/New_York), from a fresh read of the PR. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Codex, GPT-6.1 Sol High. `AGENTS.md` asks for one cold review by a vendor that did not write the PR, and a Claude session wrote every line. Codex gave Pass 2 and three re-reads on PR #16, and ideas 35, 37 and 39 draw on its comments, so it says so in its comment where a row concerns its own claim. The seat has no fallback: if it is unavailable, stop and escalate.

## Scope

- Spec: none. This PR adds candidates to `docs/v0.1.0-ideas.md`, which is never a release scope. Design brief: none.
- Sensitive paths touched: none (`git diff --name-only origin/main...HEAD` lists this file and `docs/v0.1.0-ideas.md`). Ideas 36, 39 and 40 name sensitive paths and do not touch them.
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

1. **Sources.** Does each new row's source exist, in the pass it names? Check against the comments on PR #16 and the briefs on `docs/pr-16-records`.
2. **Nothing dropped.** Does every item those records route to the ideas file appear in a row? The lists are "Pass 2's comment, as the PM takes it up" and "Pass 2.5's findings, as the PM takes them up" in `pr-16-pass-1.5.md`, and "Risks and accepted costs" and "Carried to the ideas file" in `pr-16-pass-2.5.md`.
3. **Overclaims.** Does any row claim more than its record does? Ideas 36 and 40 are the ones to test. To reproduce idea 36, in a scratch clone of `main` after `pnpm install --frozen-lockfile`, run `mkdir -p .claude/worktrees/copy && cp -R tools .claude/worktrees/copy/tools && cp package.json .claude/worktrees/copy/ && node tools/test-tooling.mjs -- copy-boundary`, which should print `Test Files  2 passed (2)`. Beni's count of 18 test files is from his own run, as `pr-16-pass-2.5.md` records it.
4. **Existing rows.** Are ideas 1 to 33 and the "Taken up or ruled out" table unchanged (`git diff origin/main...HEAD -- docs/v0.1.0-ideas.md | grep -c '^-[^-]'` should print `0`)? Are exactly seven rows added (the same diff with `grep -c '^+[|] '` should print `7`)?
5. **Private list.** This seat runs the owner's private-list check, counts only, over the diff, the commit messages, the PR title and body, every comment and its own proposed comment.
