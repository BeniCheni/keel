# Pass 0 brief: PR #14 (ideas from the PR #13 review, and the S01 spec amendments)

Written by the PM on 2026-11-02 (America/New_York), from a fresh read of the PR. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Codex, GPT-6.1 Sol High, because a Claude session wrote every line. The seat has no fallback, so if it is unavailable, stop and escalate.

## Scope

- Spec: none of its own. This PR adds candidates to `docs/v0.1.0-ideas.md`, which is never a release scope, and amends `docs/specs/s01-terms-schema.md` to match the loader merged in PR #13. Design brief: none.
- Sensitive paths touched: none (`git diff --name-only origin/main...HEAD` lists `docs/v0.1.0-ideas.md`, `docs/specs/s01-terms-schema.md` and this file). `AGENTS.md` does not list `docs/specs/**`.
- Release: no.
- New dependencies: none.
- Bootstrap path: no. `verify` applies through CI. Mutations and Pass M do not apply, because no code or fixture changes.

## Authorship record

From `git log --no-merges --format='%h %an' origin/main..HEAD`. The PR also holds one merge of `origin/main`, by Claude.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| Every commit on the branch, this brief's included | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or numbering fork. One cold review by Codex replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **The spec against the code.** Does each amendment match `main` at `3bceb20`? The five are the schedule rule (`packages/core/src/terms/checks.ts`), the tie-break (`load.ts`), `duplicate-ticker` (`checks.ts`, `messages.ts`), the integer token rule with its precedence over a schema fault (`load.ts`), and two-stage reporting (`load.ts`). Run each through `loadTerms`. Did the PM state anything the code does not do?
2. **The rulings.** Do the amendments say what Beni ruled, and no more? The words are under "Rulings from Beni" in `docs/reviews/pr-13-pass-1.5.md`, which lands in PR #15.
3. **Sources.** Does each new row's source exist, in the pass it names? Check against the comments on PR #13 and the briefs on `docs/pr-13-records`.
4. **Nothing dropped.** Does every item those records route to the ideas file appear in a row? The lists are in "More ideas-file entries for the PM" in `pr-13-pass-1.5.md`, and "Risks and accepted costs" and "Carried to the ideas file" in `pr-13-pass-2.5.md`.
5. **Overclaims.** Does any row claim more than its record does? Ideas 26, 28 and 32 are the ones to test. Idea 32 cites the S90 spec, which lands in a later PR.
6. **Line references.** Do the file and line references in the rows match `main` at `3bceb20`?
7. **Existing rows.** Are ideas 1 to 20 and the "Taken up or ruled out" table unchanged (`git diff origin/main...HEAD -- docs/v0.1.0-ideas.md | grep -c '^-[^-]'`)? Idea 21's rewrite is inside a row this PR adds, so nothing should be removed.
8. **Private list.** The owner's private-list check, which no Claude seat runs, over the diff, the commit messages, the PR title and body, and every comment.
