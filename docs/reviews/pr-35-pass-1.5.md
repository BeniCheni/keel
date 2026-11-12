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

At 19:18 EST the PM reworded those two paragraphs with `gh pr edit 35 --body-file` and added a line marking them "Edited after Pass 1". GitHub's edit history of the body shows that edit and nothing else (the script in the appendix). The repo tripwire's `scanRepo` gated the edit: no error and 0 hits on the new body, and a generated address added to the same temporary repository gave exactly 1 email hit. Codex's private-list check ran before the edit, so Pass 2 runs it again over the body.

## During Pass 2

Codex's Pass 2 stopped before posting, on one sentence of the body. The "Why" paragraph said PR #34's Pass 2 stopped "before running anything". PR #34's Pass 2 comment says only "before the substantive read", and that seat had cloned and read its instructions before it stopped. So Pass 2 could not verify the broader claim. It also could not open the PM's local copies of the body, which this brief first cited for the edit; the appendix now cites GitHub's edit history instead.

At 19:52 EST the PM changed "before running anything" to "before the substantive read", linked PR #34's Pass 2 comment, and added a line marking the change "Edited during Pass 2". The new body passed the same tripwire gate: 0 hits, with the control giving exactly 1. The head did not move. Pass 2 runs the private-list check again over this body.

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
| Body edit history | `gh api graphql -f query='query{repository(owner:"BeniCheni",name:"keel"){pullRequest(number:35){body userContentEdits(first:20){nodes{editedAt diff}}}}}' \| python3 -I body_edits.py` | 3 revisions, and the latest equals the live body. 23:54Z to 00:18Z: 2 lines removed, 5 added, the two reworded paragraphs and the "Edited after Pass 1" note. 00:18Z to 00:52Z: 2 removed, 5 added, the timing sentence and the "Edited during Pass 2" note |

`body_edits.py`, which reads GitHub's revisions of the body and prints each edit's changed lines:

```python
# Reads GitHub's edit history of a PR body (GraphQL JSON on stdin) and prints, per edit, the lines removed and added.
import sys, json, difflib
pr = json.load(sys.stdin)["data"]["repository"]["pullRequest"]
revs = sorted(pr["userContentEdits"]["nodes"], key=lambda n: n["editedAt"])
print("revisions", len(revs), "| latest equals live body:", revs[-1]["diff"] == pr["body"])
for old, new in zip(revs, revs[1:]):
    lines = [l for l in difflib.unified_diff(old["diff"].splitlines(), new["diff"].splitlines(), lineterm="", n=0)
             if l[:1] in "+-" and not l.startswith(("+++", "---"))]
    print(f"{old['editedAt']} -> {new['editedAt']}: {sum(l[0] == '-' for l in lines)} removed, {sum(l[0] == '+' for l in lines)} added")
    for l in lines:
        print("  " + l[:110])
```

## After Pass 2

Pass 2's comment is [issuecomment-6811197709](https://github.com/BeniCheni/keel/pull/35#issuecomment-6811197709), posted at 19:59 EST. Verdict mergeable at `20da0de`, with no fix commit. Codex closed Pass 1's Low against the edited body and PR #34's branch, and raised nothing new. It ran `body_edits.py` above against GitHub's revisions and got the counts in the appendix. Its private-list check found 0 matching lines in the PR title, the edited body, the existing comments and its own comment, and it cited Pass 1's zero for the unchanged diff and commit message.

The authorship record is unchanged: one Claude commit, `20da0de`, cold-read by Codex at Pass 1. No Codex commit exists, so Pass 2.5 has no cold read to give.

### What Pass 2.5 does

1. Runs in a fresh Claude session on Fable 5.2 High, by ruling 1. `AGENTS.md` on `main` still names Fable 5.1 High for this seat, and the PR's own head names Fable 5.2 High.
2. Re-runs every number it reports at `20da0de`.
3. Evaluates the merge gate in shadow mode, writes the executive brief, and gives Beni the handoff block. The PR is still a draft. The squash's `Co-authored-by` trailers are Claude, the author and the Pass 2.5 seat, and Codex, Passes 1 and 2.
4. Never opens the private list, and cites Codex's counts.
