# Pass 0 brief: PR #45 (docs after S03.1)

Written by the PM on 2026-11-14 (America/New_York), from a fresh read of the branch at `2ef2c0f`, before this brief and its index row were added. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Codex, GPT-6.1 Sol High. The PR touches no sensitive path, so the High effort applies. `AGENTS.md` asks for one cold review by a vendor that did not write the PR, and a Claude session wrote every line. Cursor does not take it: the PR reports on PR #38 and PR #43, and each has a Cursor-authored commit (`gh api repos/BeniCheni/keel/pulls/38/commits --jq '[.[] | .commit.author.name] | group_by(.) | map("\(length) \(.[0])") | .[]'` prints `8 Claude`, `3 Codex`, `1 Cursor`; for PR #43 it prints `2 Claude`, `1 Codex`, `1 Cursor`). Codex may take it by Beni's ruling "No, Cursor only" of 2026-11-07 (`docs/reviews/pr-24-pass-2.5.md`; idea 48). The seat has no fallback: if it is unavailable, stop and escalate.

## Scope

- Spec: none amended. Design brief: none.
- Sensitive paths touched: none. `git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers | wc -l` prints `0`.
- Release: no. New dependencies: none.
- Bootstrap path: no. `verify` applies. Mutations and Pass M are N/A: no code, test or fixture changes. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.
- Files: `README.md`, `docs/v0.1.0-ideas.md`, this brief and its row in `docs/README.md`.

## Where each item comes from

The records route these items to "the next ordinary docs PR": `docs/reviews/pr-38-pass-1.5.md` ("Known gaps for the next ordinary docs PR"), and the "Where the open items go" bullets of `pr-38-pass-2.5.md`, `pr-40-pass-2.5.md` and `pr-43-pass-2.5.md`.

| Item | In this PR |
| --- | --- |
| The README quickstart names only `@keel/core`'s tests | `README.md`, package tests |
| The README status line predates the engine | `README.md` line 7 |
| PR #38's Pass 1: the same listing defect in core's purity test | Idea 53, a second source |
| PR #38's Pass 1: a listed first item that differs from the stated first call observation | Idea 70 |
| PR #38's Pass 1: `live` for an `asOf` before the trade date | Idea 71 |
| PR #38's Pass 1 finding 7, "if Codex leaves it" | Not carried: PR #38's Pass 2 marks it "Accept, fixed" (`gh api repos/BeniCheni/keel/issues/comments/6861673765 --jq .body`, row 7) |
| PR #38's Pass 1 finding 13, "if Codex leaves it" | Idea 69: PR #38's Pass 2 marks it "Accept, carry" (same comment, row 13) |
| PR #43's five ideas | Ideas 64 to 68 |
| The S03 spec edits in `pr-38-pass-1.5.md`'s list | Not here: `pr-38-pass-2.5.md` routes them to the S03.1 spec PR, which became PR #40 |
| `docs/README.md`'s merge line for PR #37 | Not here: on `main` since `9ec6fd0`, the records PR for PR #38 |

Two rows come from PR #44 rather than from a record's routing: idea 72, from Beni's ruling "Cut to a log" of 2026-11-14 in the PM's session, which PR #44's body edit of 23:02:43 EST applied; and idea 73, from the PM's scan of that body before it was posted.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| Every commit on the branch, this brief's included | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or a numbering fork. One cold review by Codex replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **README line 7.** Does each clause match the S02 and S03 Goal sections and what `packages/core/src/index.ts` and `packages/plugin-mln/src/index.ts` export? Is "there is no app yet" true at the head? Does anything else in the README still describe the repository as it stood before S02 or S03?
2. **Package tests.** Do the four commands run, and does a filter that matches no file fail for `@keel/plugin-mln`, as the sentence after them says?
3. **The ideas.** Does each of ideas 64 to 73, and idea 53's added sentence, state its source fairly, with every line number right at the head? Do the new rows continue the numbering from 63, and does each row that touches a sensitive path say so? Is any of them already a row, or already taken up?
4. **Coverage.** Does the table above match the records it cites? Is anything those records route to the next ordinary docs PR missing? Did the S03 spec edits that `pr-38-pass-2.5.md` routes to the S03.1 spec PR land in PR #40?
5. **Ideas 72 and 73.** Do they state PR #44 fairly, against its comments and body history, and the tripwire rule at `tools/tripwire/scan.mjs:80`?
6. **Privacy.** This seat runs the owner's private-list check, counts only, over the diff, the commit messages, the PR title and body, every comment and its own proposed comment.

Out of scope: any change to code, tests, fixtures, schemas, `AGENTS.md` or the skills. Findings there go in the comment for the PM to carry.
