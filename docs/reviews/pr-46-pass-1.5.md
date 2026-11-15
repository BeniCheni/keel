# Pass 1.5 brief: PR #46

Written by the PM on 2026-11-15 (America/New_York), after reading Codex's Pass 1 comment ([issuecomment-6899313437](https://github.com/BeniCheni/keel/pull/46#issuecomment-6899313437), posted at 13:38:22 EST). Pass 1 reviewed `783abe1` and pushed one fix commit, so the head is now `cc8d95e`. Like the Pass 0 brief, this brief lives on branch `docs/pr-46-records`. This PM session wrote the PR's first commit and both briefs, and takes no review pass on it.

Pass 1's verdict is "mergeable after fixes", with two Mediums. Pass 1 fixed both itself: the first with commit `cc8d95e`, the second by editing the PR body. This seat reproduced both, and accepts both findings and both fixes. Nothing goes to rework.

## Seat for Pass 2

Codex, GPT-6.1 Sol Extra High, because `AGENTS.md` and `.claude/skills/**` are sensitive paths. No fallback. On a Claude-authored PR, Pass 2 cold-reads the Claude commits after Pass 1. There are none, so this Pass 2 is narrow: confirm the head, read the PM's body edit, and run the private-list check over what changed. Pass 2 does not give the cold read of `cc8d95e` or of Codex's body edit, because Codex wrote both. The fresh Claude session at Pass 2.5 does.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework? |
| --- | --- | --- | --- | --- |
| 1 | Medium | Accept; fixed in `cc8d95e` | Reproduced with Pass 1's own assertion, which counts Planner rows that assign the Executive Handoff Brief: 0 at `783abe1` (exit 1), 1 at `cc8d95e` (exit 0). Workflow step 2 sends that brief to Cursor and names no writer, and `783abe1` dropped "executive briefs", the Planner row's only words that could cover it. The fix restores that duty in plain words, "Executive Handoff Briefs for design", and leaves the review executive brief with the Pass 2.5 seat. It reads the old row's "executive briefs" as covering the design brief; it does not extend Beni's ruling, which concerned only the Pass 2.5 seat | no |
| 2 | Medium | Accept; fixed in the PR body | Reproduced. At `783abe1`, `git grep -c 'fresh session, not the PM' 783abe1 -- AGENTS.md .claude` prints only `AGENTS.md:2`, because the skill says "fresh Claude session". The PM ran a wider pattern while writing the body, then printed the narrower one in the claims table. Pass 1's corrected command, `git grep -c -E 'fresh (Claude )?session, not the PM' 783abe1 -- AGENTS.md .claude`, prints `AGENTS.md:2` and the skill's 1 (corrected after Pass 2: this brief first printed the pattern without its ref and paths, which also counts `CHANGELOG.md`) | no |

## What Pass 1 changed

- **`cc8d95e`**, authored and committed as Codex (`git log -1 --format='%an <%ae> / %cn <%ce>' cc8d95e`). It changes one line of `AGENTS.md`, the Planner row, and the changelog line to match. Its message has a subject and no body.
- **The PR body**, edited at 13:34:45 EST. GitHub shows the editor as Beni's account for every edit, because each seat acts through it; Pass 1's comment says it made this one. The edit changed three lines: the claims table's lead line, which now pins the rows to `783abe1` and says Pass 1 re-ran the wording count; the wording-count row's command; and a sentence under the Planner bullet saying the Planner still writes the Executive Handoff Brief for design. It also added a trailing newline.

Two texts still describe the Planner row as `783abe1` left it, and neither changes: `783abe1`'s commit message, because commits here are never rewritten, and the Pass 0 brief, which records what the PR was when it was written. The Pass 0 brief's sealed appendix keeps the body's original command in its claim 5, because that appendix records the builder's claims as stated.

## The PM's body edit

At 13:40:53 EST the PM replaced "None yet" under the body's Review log with one row for Pass 1. It changed nothing else: GitHub's raw snapshots of the body before and after differ only in that section, and both end in one newline (corrected after Pass 2: this brief first said the edit also changed the trailing newline, which a local copy of the body had shown). Before posting, the new body passed the repo tripwire's `scanRepo` in a throwaway repository with the clone's two policy files: 0 in each of its ten classes, and a planted check-digit-valid token gave exactly 1 `cusip` hit.

## Authorship record

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `783abe1` docs(agents): the Pass 2.5 seat is a fresh Claude session, not the PM | Claude | Codex, Pass 1 (done) |
| `cc8d95e` docs(agents): retain the Planner design handoff duty | Codex | the fresh Claude session at Pass 2.5 |

No commit since Pass 1 (`gh pr view 46 --repo BeniCheni/keel --json headRefOid`). Any Claude commit after Pass 1 gets Codex's cold read at Pass 2 (corrected after Pass 2, which found "before Pass 2" here); any Codex commit at Pass 2 gets its cold read at Pass 2.5.

## Rulings from Beni

Carried from Pass 0, both given in the PM's session on 2026-11-15:

1. **"Fresh Claude, not PM"**, to "Which should the Pass 2.5 seat be?".
2. **"Yes, start it"**, to "Start the AGENTS.md PR for the Pass 2.5 seat name?".

None new. Finding 1's fix rests on the old Planner row, not on a new ruling. If Pass 2 or Pass 2.5 reads it as assigning a duty the old row did not, ask Beni in one word.

## What Pass 2 does

1. Confirm the head is still `cc8d95e54988b6b12a3a3151e280469cf670e9ab`, with no commit after Pass 1.
2. Read the PM's body edit against Pass 1's comment and the two commits, and say whether the Review log row states them fairly.
3. Run the owner's private-list check, counts only, with a readable-file precheck and a nonzero exit on a failed scan, over the diff, every commit message in `origin/main..HEAD`, the PR title, every version of the body in GitHub's edit history, every comment, both briefs on `docs/pr-46-records`, and its own comment.
4. Install and `verify` on both Nodes as the skill says. Mutations, Pass M and demo mode stay N/A for the reasons in the Pass 0 brief.
5. Leave the cold read of `cc8d95e` and of Pass 1's body edit to Pass 2.5. Report anything else you see in them as a finding for the PM.

## Sealed appendix for Pass 2

The PM's checks after Pass 1. Re-derive each; report any that do not reproduce.

| Check | Command | Result |
| --- | --- | --- |
| Head | `gh pr view 46 --repo BeniCheni/keel --json headRefOid` | `cc8d95e54988b6b12a3a3151e280469cf670e9ab` |
| CI at the head | `gh run list --repo BeniCheni/keel --commit cc8d95e54988b6b12a3a3151e280469cf670e9ab --json databaseId,event,conclusion` | Run 43747456576, `pull_request`, success |
| The fix's scope | `git diff --stat 783abe1 cc8d95e` | `AGENTS.md` and `CHANGELOG.md`, 1 line each |
| The fix's identity | `git log -1 --format='%an <%ae> / %cn <%ce>' cc8d95e` | Codex as author and committer |
| Finding 2 | `git grep -c 'fresh session, not the PM' 783abe1 -- AGENTS.md .claude` | `783abe1:AGENTS.md:2` only |
| Body edit history | `gh api graphql -f query='query{repository(owner:"BeniCheni",name:"keel"){pullRequest(number:46){userContentEdits(first:20){nodes{editedAt}}}}}'` | 3 revisions: `18:05:52Z` (opened), `18:34:45Z` (Pass 1), `18:40:53Z` (the PM) |

## After Pass 2

Pass 2's comment is [issuecomment-6899743082](https://github.com/BeniCheni/keel/pull/46#issuecomment-6899743082), posted at 14:11:11 EST. Its verdict is "mergeable" at `cc8d95e`, with no fix commit. It accepted both Pass 1 findings, confirmed this brief's dispositions and its account of what Pass 1 changed, and left the cold read of `cc8d95e` and of Pass 1's body edit to Pass 2.5.

It found nothing in the PR's commits, and four things in the PM's text:

- **Two Mediums and a Low in this brief:** finding 2's corrected command printed without its ref and paths; the claim that the PM's body edit changed the trailing newline; and "before Pass 2" in the authorship record. All three are corrected in place above, each marked.
- **A Low in the body's Review log:** "n/a" under Findings closed beside a cell that described both fixes, and an introduction saying each commit's message tells what it changed, which `cc8d95e`'s subject does not for its changelog line. At 14:14:03 EST the PM rewrote the introduction and the Pass 1 row, and added a row for Pass 2. GitHub's snapshots before and after differ only in that section. The new body passed the tripwire's `scanRepo` with 0 in each class, and the planted control gave exactly 1 `cusip` hit.

The authorship record is unchanged: `783abe1` by Claude, cold-read by Codex at Pass 1; `cc8d95e` by Codex, for the fresh Claude session at Pass 2.5. The PM's two body edits are Claude's text that no Codex pass has read since; Pass 2.5 reads them, and Beni's private-list scan before the merge covers every version of the body.

### What Pass 2.5 does

1. Runs in a fresh Claude session, not the PM's, on Fable 5.2 High, because the PR touches sensitive paths; fallback Opus 5.5 High, declared if used.
2. Gives the cold read of `cc8d95e` and of Pass 1's body edit, the Codex-authored work on this PR.
3. Re-runs every number it reports at `cc8d95e54988b6b12a3a3151e280469cf670e9ab`.
4. Reads both briefs on `docs/pr-46-records` and the PR body against the commits and the three comments, and reports what it finds.
5. Evaluates the merge gate in shadow mode, writes the executive brief, and gives Beni the handoff block. The PR is a draft. The squash's `Co-authored-by` trailers are Claude, the author and the Pass 2.5 seat, and Codex, the author of `cc8d95e` and Passes 1 and 2.
6. Never opens the private list, and cites Codex's counts.
