# Pass 0 brief: PR #14 (ideas from the PR #13 review, and the S01 spec amendments)

Written by the PM on 2026-11-02 (America/New_York), from a fresh read of the PR. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Cursor, Grok 4.7 High, by Beni's word on 2026-11-02. Codex, the usual seat, is at its usage limit until after 3:50 PM, and Beni wrote: "Update your cold-read prompts for Cursor & Grok 4.7." `AGENTS.md` asks for one cold review by a vendor that did not write the PR. A Claude session wrote every line, and Cursor wrote none. Cursor did build `26b661f`, the loader's first commit, which item 1 below reads against, so it says so in its comment and does not re-judge that commit. If this seat is unavailable, stop and escalate.

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
| Every commit on the branch, this brief's included | Claude | Cursor |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or numbering fork. One cold review by Cursor replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **The spec against the code.** Does each amendment match `main` at `3bceb20`? The five are the schedule rule (`packages/core/src/terms/checks.ts`), the tie-break (`load.ts`), `duplicate-ticker` (`checks.ts`, `messages.ts`), the integer token rule with its precedence over a schema fault (`load.ts`), and two-stage reporting (`load.ts`). Run each through `loadTerms`. Did the PM state anything the code does not do?
2. **The rulings.** Do the amendments say what Beni ruled, and no more? The words are under "Rulings from Beni" in `docs/reviews/pr-13-pass-1.5.md`, which lands in PR #15.
3. **Sources.** Does each new row's source exist, in the pass it names? Check against the comments on PR #13 and the briefs on `docs/pr-13-records`.
4. **Nothing dropped.** Does every item those records route to the ideas file appear in a row? The lists are in "More ideas-file entries for the PM" in `pr-13-pass-1.5.md`, and "Risks and accepted costs" and "Carried to the ideas file" in `pr-13-pass-2.5.md`.
5. **Overclaims.** Does any row claim more than its record does? Ideas 26, 28, 32 and 33 are the ones to test. Idea 32 cites the S90 spec, which lands in a later PR.
6. **Line references.** Do the file and line references in the rows match `main` at `3bceb20`?
7. **Existing rows.** Are ideas 1 to 20 and the "Taken up or ruled out" table unchanged (`git diff origin/main...HEAD -- docs/v0.1.0-ideas.md | grep -c '^-[^-]'`)? Idea 21's rewrite is inside a row this PR adds, so nothing should be removed.
8. **Private list.** Not the cold reader's. Beni runs the owner's private-list check himself over the diff, the commit messages, the PR title and body, and every comment, Cursor's included. Neither a Claude seat nor this seat opens that file.

## Corrections (PM, 2026-11-02, after the merge)

- **Item 8 and the seat.** Item 8 says Beni runs the private-list check himself and that neither a Claude seat nor this seat opens that file. That was the plan when written. In the event, Beni asked the PM's session to run it, and it ran twice on 2026-11-02, at 14:16 and 14:20 EST: 0 hits on all six inputs for each of PRs #14 and #15. It used `/usr/bin/grep -F -i -c -f` on the list's nonblank lines, with a readable-file precheck, a missing-list control that exited 2 and a control that hit a term from the list. It printed counts only, so no term reached the model or any file. Cursor did not open the list. PR #14's and PR #15's bodies say the same. This correction lands here because changing the brief before the merge would have moved the reviewed head.
- **The squash message.** PR #14's squash `2ed7b44` still has the placeholder `issuecomment-<ID>`, which the PM's handoff asked Beni to fill. The re-read is [issuecomment-6586030144](https://github.com/BeniCheni/keel/pull/14#issuecomment-6586030144). `main` moves only by a PR merge, so the message stays as it is.
