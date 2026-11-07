# Pass 0 brief: PR #23 (S90 results, ADR-0009 accepted, and the records of PRs #21 and #22)

Written by the PM on 2026-11-06 (America/New_York). The same Claude session wrote every commit on this branch and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Cursor, Grok 4.7 at Extra High, by Beni's word of 2026-11-06: "Pivot to use Cursor". The chat's model id reads `grok-4.7` at any effort, so Cursor reads the effort from the picker. If Extra High is unavailable, stop and escalate.

This brief first named Codex, and said Cursor had a stake because it built the spike whose results this PR states. Beni moved the seat to Cursor anyway. That fits the authorship rule, because Claude wrote every commit on this PR and Cursor wrote none. The stake stays, so Cursor says so wherever its read concerns its own build on PR #21 or its App Review re-read, and judges the results against the review records and the commands, not against its memory of building the spike.

## Scope

- Spec: `docs/specs/s90-ios-core-spike.md`, untouched (`git diff --exit-code origin/main...HEAD -- docs/specs/s90-ios-core-spike.md` exits 0). Its decision rule and thresholds govern the results.
- Files: the new results file `docs/specs/s90-ios-core-spike-results.md`; ADR-0009's status, Core section and "Revisit when" list; ideas 41 to 47 in `docs/v0.1.0-ideas.md`; rows in `docs/README.md`; two corrections in `docs/reviews/pr-22-pass-0.md`; and the PR #21 records, which are `pr-21-pass-0.md`, `pr-21-pass-1.5.md`, `pr-21-pass-2.5.md`, `pr-21-device-records.txt` and `pr-21-device-extra.txt`, with this brief. Command: `git diff --name-only origin/main...HEAD`.
- Sensitive paths touched: none.
- Release: no. New dependencies: none.
- Bootstrap path: no. `verify` applies through CI. Mutations and Pass M do not apply, because no code or fixture changes.
- Not a records PR: it touches `docs/specs/`, `docs/adr/` and the ideas note, so it is an ordinary docs PR.

## Ruling

On 2026-11-06, after reading a draft of the results, Beni ruled "Rule Path A", on the PM's question "Rule Path A for the iOS companion's core, as the rule selects?". He gave it in the PM's session, so the cold reviewer cannot see it, and Beni's merge confirms it. His earlier rulings on the spike are in `pr-21-pass-0.md`, `pr-21-pass-1.5.md` and `pr-21-pass-2.5.md`, which records his first-hand confirmation of them.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| Every commit on the branch, this brief's included | Claude | Cursor |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or numbering fork. One cold review by a vendor that wrote none of the PR replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **The results' figures.** Does each reproduce with the command given, at `0c06924` or from the record files copied out of this branch? Are Beni's device numbers labelled as his run, and every reading labelled as a reading?
2. **The rule as applied.** Does the clause table follow the decision rule's text, including its edge cases? Is "not a close call" right? Is anything claimed for Path A that the spike did not measure?
3. **Disclosures.** Do the results say everything the spec asks them to say: that Q2's amendment is not pre-registered, how the device run differed from the plan, and what a pass does not prove? Check them against the three PR #21 briefs and the PR #21 comments.
4. **ADR-0009.** Does the Core section say only what the results show? Is anything else in the ADR changed besides the status line and the first item under "Revisit when"?
5. **The Pass 2.5 record.** The PM recorded it from Beni's paste of the review chat, restoring its formatting. Compare it with [issuecomment-6670022832](https://github.com/BeniCheni/keel/pull/21#issuecomment-6670022832) for anything that disagrees.
6. **The PR #22 corrections** against Cursor's [issuecomment-6641890050](https://github.com/BeniCheni/keel/pull/22#issuecomment-6641890050), and the `docs/README.md` rows against `gh pr view 21 --repo BeniCheni/keel` and `gh pr view 22 --repo BeniCheni/keel`.
7. **Ideas 41 to 47.** Does each trace to its source, and does none read as a scope commitment?
8. **Privacy.** Run the tripwire over the repo, the PR title and body, every comment on this PR, and your own proposed comment, and report counts per class. Confirm the two device record files hold only `KEEL_SPIKE v1` lines and `#` notes. Cursor never opens the owner's private-list file, so Beni runs that check, counts only, after your comment is posted, with a script the PM wrote. It covers the diff, every commit message, the PR title and body, every comment on this PR, and PR #21's Pass 2.5 comment (issuecomment-6670022832), which Beni ruled on 2026-11-06 is checked here because Codex's count on PR #21 came before it. Your comment says that check is Beni's and still to run.

## After the cold read

Cursor first stopped, because `.agents/skills/keel-pr-review/SKILL.md` says Cursor never reviews. Beni ruled on 2026-11-07, "Yes, Cursor reads it": `AGENTS.md` outranks that copy, the procedure it points to says `AGENTS.md` wins, and Cursor wrote none of this PR's commits.

Cursor then gave the cold read at `86be618` ([issuecomment-6710345176](https://github.com/BeniCheni/keel/pull/23#issuecomment-6710345176)), on Grok 4.7 Extra High with no sub-agent. Its verdict is "mergeable after fixes", with one Medium, one Low and no High. It said where the read concerns its own build of the spike, its App Review re-read and its PR #22 re-read, and judged those from the records and the commands.

- **Medium 1, accepted.** The note on part 1 of `pr-21-device-extra.txt` called the Hawaiian launch one compile launch, while that part holds parity lines for both variants: 64 compile and 64 standalone, beside one compile timing line (`awk` over part 1, counting lines by kind and variant). Fixed in the commit that adds this section, which also clarifies the same wording in `pr-21-device-records.txt`'s order note. Only `#` lines change in either file, so the device comparison reads the same records.
- **Found while fixing Medium 1.** The 33 hand-check lines in part 2 of `pr-21-device-extra.txt` each end with a carriage return (`awk '/^# Part 2/{p=1} p && /\r$/{c++} END{print c}' docs/reviews/pr-21-device-extra.txt` prints `33`). The terminal capture added it: the device helper ran `devicectl` through `script` for those sessions, and its strip of one trailing carriage return left one in place. The phone printed none. The lines stay as recorded, and idea 47 covers the device harness.
- **Low 2, accepted.** The skill copy's "Cursor never reviews" against `AGENTS.md`'s fast-track rule. Idea 33 stays open; aligning the files touches sensitive paths, so it is a PR of its own.

Beni ran the owner's private-list check, counts only, on 2026-11-07, after Cursor's comment. With 6 terms in the list, it found 0 hits in each of seven sources: this PR's diff, its commit messages, its title and body, its comments (1, Cursor's), its reviews, its review comments, and PR #21's Pass 2.5 comment. The positive control fired once, and the scan exited 0. It ran before the fix commit, so Beni runs it again after Cursor's re-read.

Cursor re-reads the fix commit. Then Beni merges.

## The merge (PM, 2026-11-07, after it)

Cursor re-read the fix at `04403b0` ([issuecomment-6710500138](https://github.com/BeniCheni/keel/pull/23#issuecomment-6710500138)), on Grok 4.7 Extra High: verdict "mergeable". It counted 64 compile and 64 standalone parity lines in part 1, found no `KEEL_SPIKE` line changed, and found this brief's account accurate.

Beni ran his private-list scan again, chained to the merge so the merge ran only if the scan exited 0. He reported that it printed `total hits: 0`.

He merged at 13:05 America/New_York as squash `b58e2df` (`gh pr view 23 --repo BeniCheni/keel --json mergeCommit,mergedAt`), with "fast-track" in the subject and trailers for Claude and Cursor. The PM then checked from a fresh clone: `origin/main` equals `b58e2df`, its parent is `32cfe40`, and its tree equals `04403b0`'s (`git rev-parse b58e2df^{tree} 04403b0^{tree}` prints one tree twice). `pnpm verify` exits 0 on Node 24.22.2 and 26.13.0, and `main`'s push CI on `b58e2df` succeeded. GitHub deleted the PR branch, and the PM deleted the older `docs/pr-21-records`, after checking that every file on it is on `main`.
