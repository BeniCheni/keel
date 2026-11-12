# Pass 1.5 brief: PR #35

Written by the PM on 2026-11-11 (America/New_York), after reading Codex's Pass 1 comment ([issuecomment-6810411578](https://github.com/BeniCheni/keel/pull/35#issuecomment-6810411578), posted at 19:12 EST; reviewed head `20da0de`, no fix commit). Like the Pass 0 brief, it lives on branch `docs/pr-35-records`. This PM session wrote the PR and both briefs, and takes no review pass on it.

Pass 1's verdict is mergeable, with one Low. This seat accepts it and fixed it in the PR body, which is the PM's own text. Nothing goes to rework, and no commit has been added since Pass 1.

## Seat for Pass 2

Codex, GPT-6.1 Sol Extra High, because `AGENTS.md` is a sensitive path. No fallback. On a Claude-authored PR, Pass 2 cold-reads the Claude commits after Pass 1. There are none, so this Pass 2 is narrow: confirm the head has not moved, re-read the edited PR body, and run the private-list check over it.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework? |
| --- | --- | --- | --- | --- |
| 1 | Low | Accept; fixed in the PR body | Reproduced. The body said every seat that reads `AGENTS.md` "sees a disagreement and stops", but the stop rule applies only where a seat's instructions disagree with the file. It also said seats starting after the merge read the pins "from this file", but PR #34's branch predates this change. `git grep -n 'Fable 5\.1' origin/s02.1/final-valuation -- AGENTS.md` finds its four old lines, so PR #34's seats keep seeing Fable 5.1 after the merge | no |

## PR body edit

At 19:18 EST the PM reworded those two paragraphs with `gh pr edit 35 --body-file` and added a line marking them "Edited after Pass 1". `diff` of the body before and after shows those three changes and nothing else. The body read back from GitHub is byte-identical to the file sent. The repo tripwire's `scanRepo` gated the edit: no error and 0 hits on the new body, and a generated address added to the same temporary repository gave exactly 1 email hit. Codex's private-list check ran before the edit, so Pass 2 runs it again over the body.

## Authorship record

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `20da0de` docs(agents): move the Fable pins to Fable 5.2 | Claude | Codex, Pass 1 (done) |

No commit since Pass 1 (`gh pr view 35 --repo BeniCheni/keel --json headRefOid` printed `20da0de…` after the edit). Any Codex commit at Pass 2 gets its cold read from the fresh Claude session at Pass 2.5.

## Rulings from Beni

Carried from Pass 0, both given in the PM's session on 2026-11-11:

1. **17:39 EST, standing.** "Correction: Fable 5.2 is the current latest version from Claude. We're using that for the Pass 1 prompt and future prompts when Fable is desired."
2. **18:52 EST.** "Yes, open it", to "Shall I open the AGENTS.md PR moving the Fable pins to 5.2?".

None new.

## What Pass 2 does

1. Confirm the head is still `20da0de081ef72d1033136c582204f55daeed434`, with no commit after Pass 1.
2. Re-read the edited PR body against the diff and against PR #34's branch, and say whether the Low is closed.
3. Run the owner's private-list check, counts only, with a readable-file precheck and a nonzero exit on a failed scan, over the edited PR title and body and every comment. The diff and the commit message are unchanged since Pass 1's check, so cite Pass 1's counts for them.
4. Install and `verify` on both Nodes as the skill says. Mutations, Pass M and demo mode stay N/A for the reasons in the Pass 0 brief.

## Sealed appendix for Pass 2

The PM's checks after the edit:

| Check | Command | Result |
| --- | --- | --- |
| Head | `gh pr view 35 --repo BeniCheni/keel --json headRefOid` | `20da0de081ef72d1033136c582204f55daeed434` |
| CI at the head | `gh run list --repo BeniCheni/keel --commit 20da0de081ef72d1033136c582204f55daeed434 --json databaseId,event,conclusion` | Run 43123354970, `pull_request`, success |
| PR #34's pins | `git grep -n 'Fable 5\.1' origin/s02.1/final-valuation -- AGENTS.md` | Four lines: 19, 21, 29 and 50 |
| Body diff | `diff` of the body saved before the edit against the body sent | Lines 9 and 32 changed, two lines added after 33 |
| Body read back | `cmp` of the body sent against `gh pr view 35 --json body --jq .body` | Identical |
