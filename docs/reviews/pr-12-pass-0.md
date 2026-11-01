# Pass 0 brief: PR #12 (ideas from the PR #8 and PR #10 reviews)

Written by the PM on 2026-11-01 (America/New_York), from a fresh read of the PR at `9200349`. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Codex, GPT-6.1 Sol High, because a Claude session wrote every line. The seat has no fallback, so if it is unavailable, stop and escalate.

## Scope

- Spec: none; this PR only adds candidates to `docs/v0.1.0-ideas.md`, which is never a release scope. Design brief: none.
- Sensitive paths touched: none (`git diff --name-only origin/main...HEAD` lists `docs/v0.1.0-ideas.md` and this file).
- Release: no.
- New dependencies: none.
- Bootstrap path: no. `verify` applies through CI. Mutations and Pass M do not apply, because no code or fixture changes.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `9200349` add ideas 10 to 20 | Claude | Codex |
| The commit adding this brief, which also extends idea 10 | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or numbering fork. One cold review by Codex replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **Sources.** Does each row's source exist, in the pass it names? Check against the records and comments, for example ideas 13 and 14 against `docs/reviews/pr-10-pass-1.5.md`, `docs/reviews/pr-10-pass-2.5.md` and the Pass 2 comment on PR #10.
2. **Nothing dropped.** Does every item the records route to this file appear in a row? The lists are in `docs/reviews/pr-8-pass-1.5.md` (the entries under "Pass 1's questions" and "Pass 2's first and completing comments"), `docs/reviews/pr-8-pass-2.5.md` ("Carried to the ideas file"), `docs/reviews/pr-10-pass-1.5.md` ("Pass 1's questions" and "Pass 2's comment") and `docs/reviews/pr-10-pass-2.5.md` ("Carried to the ideas file").
3. **Overclaims.** Does any row claim more than its record does? Idea 10 is the one to test: it says the runtime guard and the real parser are neither designed nor tried, and that a guard could reach forms a lexer cannot see.
4. **Existing rows.** Are ideas 1, 2 and 4 and the "Taken up or ruled out" table unchanged (`git diff origin/main...HEAD -- docs/v0.1.0-ideas.md | grep -c '^-[^-]'`)? Idea 10's edit is inside a row this PR adds.
5. **Private list.** The owner's private-list check, which no Claude seat runs, over the diff, the commit messages, the PR title and body, and every comment.
