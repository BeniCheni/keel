# Executive brief: PR #24, Pass 2.5, 2026-11-07 America/New_York

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim.

Seat: a fresh Claude session on Fable 5.1 High (the session reports model `claude-fable-5-1`, effort `high`). Fallback used: no. This session wrote no commit and no fix on this PR. Fresh clone at `~/code/keel-pr-24-p25`, empty before the clone; `KEEL_DATA_DIR` pointed at a new empty temp directory for every command; synthetic data only. Head SHA from GitHub at the first pass: `22de9d79f07b8d4a2681d5065c20e77feeb78a28`, matching the prompt and the local checkout. After Beni ruled "Before" and "Cursor" on the two Lows, Cursor pushed `d1d24df49787dcc85538b60a1f4ea36d5e7305ef`, and this brief was re-run at that head (section "Re-run at d1d24df"). Rules applied were `origin/main`'s `AGENTS.md` and `.claude/skills/keel-pr-review/SKILL.md` with its templates; the PR's edits to `AGENTS.md` and `.agents/skills/keel-pr-review/SKILL.md` were the subject, not rules in force. Run as if given `--no-merge`.

## Decision

Shadow mode: the gate says "would escalate" because the PR touches two sensitive paths, `AGENTS.md` and `.agents/skills/keel-pr-review/SKILL.md`, and the gate's sensitive-path clause fails; Beni merges. On merit the PR is mergeable: no High, no Medium open, nothing contested between vendors, `verify` green at the head on both Node versions, and every commit cold-read by a vendor that did not author it. Two new Lows were reported below at `22de9d7` and left unfixed by this seat; Cursor fixed both in `d1d24df` by Beni's ruling, and Codex gave that commit its cold read with no new finding. The verdict at `d1d24df` is mergeable on merit; the gate still says "would escalate" on the sensitive-path clause, and Beni merges.

## What ships

- Both rule files now agree on when Cursor may review: on Beni's word, Cursor gives the one cold read of a records or fast-track PR it wrote none of, and gives no review pass on a PR it built. The old "Cursor never reviews" line is gone from every rule file.
- The bar from Pass 1.5: Cursor gives no such read when the PR records or reports on a PR with any Cursor-authored commit, because no vendor gives the only cold read of its own work. Codex takes those; if Codex is not eligible either, stop and escalate.
- The Builder row pins Grok 4.7 Extra High for cold reads, dated 2026-11-07; every other pin stays dated 2026-10-29.
- PR #23's merge is on record: squash `b58e2df`, reviewed head `04403b0`, one tree, with the fetch a fresh clone needs to check it. `docs/README.md` indexes PR #23 and this PR's two briefs. Idea 33 moves to "Taken up or ruled out".
- The repo still claims nothing about values, prices or recommendations; this PR is review policy and records only.

## What the passes found

- Pass 1 (Cursor, Grok 4.7 Extra High by Cursor's statement, by Beni's word for this PR only): finding 1, Medium, the new permission did not say whether Cursor may give the only cold read of records about its own build; finding 2, Medium, the pin-date sentence was stale; finding 3, Low, the tree command could not run in a fresh clone. Fixes `fa105d9` and `b43c412` by Cursor; finding 1 left to Beni.
- Pass 1.5 (PM): accepted all three; Beni ruled "No, bar it (Recommended)" on finding 1; fix `66a98da` by Claude.
- Pass 2 (Codex, GPT-6.1 Sol Extra High by Codex's statement): accepted all three Pass 1 findings with its own reproductions; one new Medium, the two PR #24 briefs were tracked but not in `docs/README.md`, fixed in `22de9d7`; owner's private-list check 0 hits in each of seven sources (Codex's claim, not re-runnable by this seat); raised whether the bar reaches Codex too, and left that to Beni.
- Pass 2.5 corroboration: each Pass 1 finding reproduces at its pre-fix commit and is closed at the head (commands in the table below). Codex's Medium reproduces: `git grep -n 'reviews/pr-24-pass-' acc518f -- docs/README.md` exits 1, and the same search at `HEAD` finds line 25.
- Contested: none between vendors. Codex's reading that the bar's reasoning reaches Codex is closed by Beni's ruling of 2026-11-07, "No, Cursor only (Recommended)", heard by this seat through the PM's prompt only; it goes to the ideas file in a later docs PR and is not an open finding here. Question 2 below asks Beni to confirm it.

### Cold read of `22de9d7` (Codex)

`git show 22de9d7` adds one line to `docs/README.md`, a row for this PR: title "Cursor cold-read policy (PR #24, idea 33)", release "n/a", spec "none (review policy)", design brief "none", review records `reviews/pr-24-pass-0.md` and `reviews/pr-24-pass-1.5.md`, status "Sensitive-path review, with Pass 1 by Cursor under Beni's one-time ruling".

- True? Yes, cell by cell. Both briefs exist at the head (`git ls-tree -r --name-only HEAD -- docs/reviews/pr-24-pass-0.md docs/reviews/pr-24-pass-1.5.md` prints both). The PR touches sensitive paths (`git diff --name-only origin/main...HEAD` lists `AGENTS.md` and `.agents/skills/keel-pr-review/SKILL.md`). Pass 1 was Cursor by Beni's word for this PR only, as the Pass 0 brief and Pass 1's comment record.
- In the table's form? Not quite. Every other Status cell holds a dated outcome ("merged <date> at squash ...", "closed unmerged <date> ...", "landed <date> as ..."), and the two PRs that indexed themselves before merging, PR #1 at `8b316f3` and PR #7 at `8a04ff3`, used the cell "in review" (`git show 8b316f3:docs/README.md | grep 'PR #1)'`). The new row's cell describes the review's seating instead and carries no state and no date. `awk -F'|' 'NR>6 && NF>6 && $7 !~ /20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]/ {print NR": "$7}' docs/README.md` prints only line 25. This is finding 1 below, Low.
- What must change at merge: the Status cell becomes "merged <date> at squash `<sha>`, reviewed head `22de9d7`; Pass 1 by Cursor and Pass 2 by Codex, by Beni's rulings of 2026-11-07", and the Review records cell adds `reviews/pr-24-pass-2.5.md (executive brief)` when the records PR carrying this brief lands. Nothing else in the row changes. Since `d1d24df` the cell reads "in review".

### Authorship record at the head

From `git log --format='%h %an' origin/main..HEAD`. Every commit has a cold read from a vendor that did not author it.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `d2e6e3a` | Claude | Cursor (Pass 1) and Codex (Pass 2) |
| `c8b1f59` | Claude | Cursor (Pass 1) and Codex (Pass 2) |
| `fa105d9` | Cursor | Codex (Pass 2) |
| `b43c412` | Cursor | Codex (Pass 2) |
| `66a98da` | Claude | Codex (Pass 2) |
| `acc518f` | Claude | Codex (Pass 2) |
| `22de9d7` | Codex | Claude, this session (Pass 2.5) |
| `d1d24df` | Cursor | Codex, GPT-6.1 Sol Extra High by Codex's statement ([issuecomment-6716077893](https://github.com/BeniCheni/keel/pull/24#issuecomment-6716077893)): both Lows closed, no new finding. This session also checked the two edits against the fix prompt |

The Pass 1.5 record held at `22de9d7` and holds at `d1d24df`: every commit has a cold read from a vendor that did not author it. No Claude session that wrote a commit reviewed one.

### Findings from this seat

| # | Severity | Finding | Command that shows it | Fix |
| --- | --- | --- | --- | --- |
| 1 | Low | `docs/README.md:25` Status cell has no state and no date, where every other row has a dated outcome and the two self-indexed rows before it said "in review". | `awk -F'\|' 'NR>6 && NF>6 && $7 !~ /20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]/ {print NR": "$7}' docs/README.md` prints only line 25 | `d1d24df` (Cursor): the cell is now "in review", the form PR #1 and PR #7 used; the records PR replaces it with the merge line |
| 2 | Low | `.agents/skills/keel-pr-review/SKILL.md:11` ends "It runs merge logistics only on Beni's word" right after a sentence whose subject is Codex, so "It" now reads as Codex; on `main` the same sentence followed "Cursor never reviews". | `sed -n 11p .agents/skills/keel-pr-review/SKILL.md \| sed 's/\. /.\n/g' \| tail -2` | `d1d24df` (Cursor): the sentence now reads "Cursor runs merge logistics only on Beni's word." |

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Head SHA | `gh pr view 24 --json headRefOid` and `git rev-parse HEAD` | both `22de9d79f07b8d4a2681d5065c20e77feeb78a28` |
| Install | `pnpm install --frozen-lockfile` | exit 0 on Node 24.22.2 and 26.13.0 |
| Verify | `pnpm verify` | exit 0 on Node 24.22.2 and 26.13.0; each run: core 33 passed, 0 failed, 9 files; tooling 122 passed, 0 failed, 10 files; typecheck, tests, tooling, tripwire, network, determinism, copy and boundaries each "ok" |
| Determinism | inside `pnpm verify` (`verify:determinism ok`) | ok on both Node versions; no code or fixture change in the diff |
| Zero network | inside `pnpm verify` (`verify:network ok`) | ok on both Node versions |
| Mutations | N/A | no code or fixture change; nothing to mutate |
| Pass M | N/A | no engine or golden fixture change |
| UI matrix | N/A | no UI |
| Demo mode | `git grep -c -i 'demo mode' -- README.md package.json` | exit 1: no demo entry point exists yet |
| CI at the head | `gh run view 42434092843 --json headSha,conclusion` and `gh pr checks 24` | success on `22de9d7`; four cells and `verify` pass |
| CI at `b43c412` (Pass 1's claim) | `gh run view 42414074520 --json headSha,conclusion` | success on `b43c412` |
| Claim: files changed | `git diff --name-only origin/main...HEAD` | 7, the seven paths the PR body lists |
| Claim: size | `git diff --shortstat origin/main...HEAD` | 7 files, 139 insertions, 4 deletions |
| Claim: no rule file says Cursor never reviews | `git grep -n -i 'never reviews' -- AGENTS.md CLAUDE.md .claude .agents` | exit 1, no match |
| Claim: the bar is in both rule files | `git grep -c 'Cursor-authored commit' -- AGENTS.md CLAUDE.md .claude .agents` | 1 in `AGENTS.md`, 1 in `.agents/skills/keel-pr-review/SKILL.md` |
| Claim: PR #23 merge facts | `gh pr view 23 --json mergeCommit,mergedAt,headRefOid,state` | MERGED, `b58e2df`, 2026-11-07T18:05:25Z (13:05 America/New_York), head `04403b0` |
| Claim: squash tree equals reviewed head | `git rev-parse --verify '04403b0^{tree}'` before the fetch; `git fetch origin pull/23/head`; then `git rev-parse 'b58e2df^{tree}' '04403b087b3174e4d09d263c56546bff55cae292^{tree}'`; `gh api repos/BeniCheni/keel/commits/04403b087b3174e4d09d263c56546bff55cae292 --jq .commit.tree.sha` | exit 128 before the fetch; after it, `38074eb1df9a3968328167d9aa87b017f793b577` twice; the API prints the same tree |
| Claim: `b58e2df` subject, trailers, parent, push CI | `git log -1 --format='%s%n%b' b58e2df`; `git rev-parse 'b58e2df^'`; `gh run list --commit b58e2dff1a555af5438eb73bee714a80e2ac2fd4 --json conclusion,event` | subject ends "(fast-track)"; Claude and Cursor trailers; parent `32cfe40`; push run 42399518049 success |
| Claim: `pnpm verify` exits 0 at `b58e2df` on both Node versions (PR #23 merge section) | `git worktree add <scratch> b58e2df`, then install and verify there on Node 24.22.2 and 26.13.0 | install exit 0 and verify exit 0 on both; 33 and 122 tests passed; worktree removed afterwards |
| Claim: branches deleted, nothing lost | `git ls-remote --heads origin docs/s90-results docs/pr-21-records`; `git diff --name-status 90a92c5 b58e2df \| grep -c '^D'`; `comm -23` of `12d69d7`'s paths against `origin/main` | no branch; 0 deleted paths; 0 paths missing |
| Claim: 64 compile and 64 standalone parity lines in part 1; no `KEEL_SPIKE` line changed | `git show 04403b0:docs/reviews/pr-21-device-extra.txt \| sed -n '1,135p' \| grep '^KEEL_SPIKE' \| grep -c -E 'parity.*compile'` and the same for `standalone`; `git diff 86be618 04403b0 -- docs/reviews/pr-21-device-records.txt docs/reviews/pr-21-device-extra.txt \| grep -c -E '^[-+]KEEL_SPIKE'` | 64, 64, 0 |
| Claim: PR #21 has Cursor-authored commits (the bar's case) | `gh pr view 21 --json commits` | Cursor `ff4fc35`, `27a877b`, `27c802c`; Claude `14b0308`, `d0c9fc3`; Codex `0c06924` |
| Pass 1's counts | `git diff --shortstat origin/main...c8b1f59` and `...b43c412` | 6 files, 60 insertions, 3 deletions; 6 files, 61 insertions, 4 deletions |
| Pass 2's counts | `git diff --shortstat origin/main...acc518f` | 7 files, 138 insertions, 4 deletions |
| Pass 1 finding 2 at its commits | `git grep -nE '^Model pins\|Extra High.*cold reads' <c8b1f59, fa105d9, HEAD> -- AGENTS.md` | at `c8b1f59` the Builder row has "and for cold reads" under the blanket 2026-10-29 date; from `fa105d9` the sentence excepts the Builder cold-read effort as of 2026-11-07 |
| Only idea 33 changed | `git diff -U0 origin/main...HEAD -- docs/v0.1.0-ideas.md` | one row removed and one added, both idea 33 |
| Honesty tests, whitespace, code paths | `git diff --stat origin/main...HEAD -- '*.honesty.test.ts'`; `git diff --check origin/main...HEAD`; `git diff --name-only origin/main...HEAD -- package.json pnpm-lock.yaml .github/workflows fixtures schemas packages tools` | nothing, exit 0, nothing: no dependency, workflow, fixture, schema or code change |
| Tripwire, repo and commit messages | `node tools/tripwire/cli.mjs .` | exit 0, no hit line: 0 in every class (cusip, account, ssn, address, email, price, allowlist, vendors, local-only, unscannable) |
| Tripwire, external text | a harness in the scratch folder that imports the scanner's `textHits` with the repo's vendor exemptions, over the PR title and body (3,270 bytes), the issue comments (22,417 bytes), the inline review comments (`[]`) and the reviews (`[]`), then over this brief and the Pass 2.5 comment | 0 in each of cusip, account, ssn, address and email for every source; a synthetic positive control counted 1 and exited 1 |

Not re-run, and why:

- Codex's owner private-list checks (0 hits in seven sources at Pass 2, and 0 in five inputs at its cold read of `d1d24df`) and Beni's two private-list scans on PR #23: this seat never opens `~/.config/keel/`, by rule. Recorded as Codex's and Beni's claims.
- Cursor's and Codex's model and effort (Grok 4.7 Extra High, GPT-6.1 Sol Extra High): stated in their comments; not checkable from here.
- Rulings 2 and 4 below: heard through the PM's prompt only; no repo file records them yet.

## Estimates and model output

None. No figure in this PR comes from a model or an assumption.

## Risks and accepted costs

- This PR widens what Cursor may do, and Cursor gave Pass 1 on it. Codex's Pass 2 read the whole PR, and this seat read the rule text again, so Cursor's read is not the only one. Pass 1 found the gap in its own favour and reported it against its interest.
- The bar names Cursor only. By Beni's ruling of 2026-11-07, the parallel reading for Codex is parked in the ideas file and does not change the rule now. Until it is settled, a records PR about a PR with a Codex-authored commit may get its only cold read from Codex by the letter of the rule.
- The records PR that will carry this brief records PR #24, which has three Cursor-authored commits, so under the new bar Cursor cannot give its cold read; Codex or Claude Code can. Codex wrote `22de9d7` on this PR, which the rule as ruled does not bar.
- The rule files read the pin date two ways on purpose: 2026-10-29 for every pin, 2026-11-07 for the Builder cold-read effort.
- Process deviations recorded, none a rule conflict: the prompt put the fresh clone at `~/code/keel-pr-24-p25` where the skill names `/tmp/keel-pr-<N>`, and the clone was fresh and empty, which is what the skill protects; Codex's Pass 2 read every commit rather than only the Claude commits after Pass 1, which `AGENTS.md` scopes for the case where Codex took Pass 1, and Cursor took Pass 1 here by ruling 1, with ruling 2 letting Codex go on.

## Rulings heard second-hand

Rulings 1 and 3 are in `docs/reviews/pr-24-pass-0.md` and `docs/reviews/pr-24-pass-1.5.md`. Rulings 2 and 4 are in no repo file; this seat heard them through the PM's prompt and asked Beni to confirm each below. Answer in the Pass 2.5 session's chat on 2026-11-07: "Yes, both". Questions 1 and 2 are closed; this brief is the first repo record of rulings 2 and 4.

1. Pass 1 by Cursor on Grok 4.7 Extra High, by Beni's word of 2026-11-07, for this PR only, where `AGENTS.md` names Codex (Pass 0 brief).
2. Codex stopped Pass 2 on that seating conflict; Beni ruled "Keep Cursor's" on 2026-11-07, and Codex went on (prompt only).
3. "No, bar it (Recommended)" on Pass 1's finding 1, at Pass 1.5 (Pass 1.5 brief).
4. On Codex's reading that the bar reaches Codex: "No, Cursor only (Recommended)" on 2026-11-07; the bar stays on Cursor and Codex's reading goes to the ideas file in a later docs PR (prompt only; the PR body states the outcome).

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes |
| Verdict mergeable, every High closed (fix commit with a failing-first test, or for a High outside tracked files, a recorded remediation check plus Beni's confirmation) | Yes: no High was raised; both Pass 1 Mediums, its Low and Codex's Medium are fixed and cold-read; the two Lows are fixed in `d1d24df` |
| Nothing contested | Yes: Beni's ruling 4, confirmed "Yes, both" in chat on 2026-11-07 |
| `verify` green at tip; every number re-run | Yes: exit 0 on both Node versions; everything not re-run is listed above and none of it is a gate number |
| No sensitive path, dependency or schema change | No: `AGENTS.md` and `.agents/skills/keel-pr-review/SKILL.md` are sensitive paths; no dependency or schema change |
| Every commit cold-read by a non-author vendor (authorship record) | Yes at `d1d24df`: this brief's read of Codex's `22de9d7`, and Codex's read of Cursor's `d1d24df` |
| Gate verdict | would escalate (sensitive paths; Beni merges every sensitive-path PR); every other clause holds at `d1d24df` |
| Beni's decision (filled after) | Merged by Beni on 2026-11-07 at 21:36 America/New_York (2026-11-08T02:36:40Z) as squash `de7a3dbd0c5938e9e3c6587c1bb17ebc98a1099e`, pinned to `d1d24df` (`gh pr view 24 --json state,mergeCommit,mergedAt,mergedBy`). Matches the shadow verdict: Beni merged a sensitive-path PR himself |

## Questions for Beni

Each answerable in one word.

1. Ruling 2: did you rule "Keep Cursor's" on 2026-11-07 when Codex stopped Pass 2 on the seating conflict, so that Codex went on? Answered "Yes, both" with question 2, in chat, 2026-11-07.
2. Ruling 4: did you rule "No, Cursor only" on 2026-11-07, keeping the bar on Cursor and sending Codex's reading to the ideas file in a later docs PR? Answered "Yes, both" with question 1, in chat, 2026-11-07.
3. The two Lows in `docs/README.md:25` and `.agents/skills/keel-pr-review/SKILL.md:11`: fix them before the merge, or after it in the records PR? Answered "Before", in chat, 2026-11-07. This seat makes no commit, so the fix needs a vendor and a cold read: a Codex fix gets its cold read from this Pass 2.5 seat, as `AGENTS.md` already assigns; a Cursor fix needs Codex's read. Either way the head moves, so the merge command below must be re-pinned and every number re-run at the new head before the merge.
4. Merge PR #24 at `22de9d7`? Superseded by the answer to 3: the merge waits for the fix commit, its cold read and a re-run at the new head.
5. Who writes the fix commit for the two Lows? Answered "Cursor", in chat, 2026-11-07. Path: Cursor pushes one fix commit to `docs/idea-33-cursor-cold-reads` as itself; Codex gives that commit's cold read in one short comment, as Codex did for `fa105d9` and `b43c412`; then a Pass 2.5 Claude session re-runs every number at the new head, re-pins the handoff block, and extends the authorship record. Cursor has a stake in the `.agents/skills/keel-pr-review/SKILL.md:11` edit, which names Cursor; the edit is one word, and Codex's read covers it.

## Handoff block

Authors from `git log --format='%an <%ae>' origin/main..HEAD` in this clone: `Claude <noreply@anthropic.com>`, `Codex <noreply@openai.com>`, `Cursor <cursoragent@cursor.com>`. Review passes: Cursor (Pass 1), Codex (Pass 2), Claude (Pass 2.5), with the identities in `AGENTS.md` hard rule 10. The three trailers below cover both lists. Not fast-track. Re-pinned to `d1d24df49787dcc85538b60a1f4ea36d5e7305ef` after Cursor's fix and Codex's cold read of it.

```bash
gh pr merge 24 --repo BeniCheni/keel --squash --match-head-commit d1d24df49787dcc85538b60a1f4ea36d5e7305ef --subject "docs: let Cursor give records and fast-track cold reads on Beni's word (#24)" --body "Takes up idea 33 by Beni's ruling of 2026-11-07: on his word, Cursor gives the one cold read of a records or fast-track PR it wrote none of, unless that PR records or reports on a PR with any Cursor-authored commit, and gives no review pass on a PR it built. Pins Grok 4.7 Extra High for those cold reads, dated 2026-11-07. Records PR #23's merge and indexes it and this PR's briefs.

Reviewed head: d1d24df49787dcc85538b60a1f4ea36d5e7305ef. Pass 1 by Cursor (issuecomment-6713033857), Pass 2 by Codex (issuecomment-6715607940), Pass 2.5 by Claude on Fable 5.1 High (issuecomment-6715805569), Cursor's fix of two Lows (issuecomment-6715923940) with Codex's cold read, by Beni's rulings of 2026-11-07.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Cursor <cursoragent@cursor.com>
Co-authored-by: Codex <noreply@openai.com>"
git pull
test "$(git rev-parse origin/main)" = "$(gh pr view 24 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" && echo "origin/main is the squash commit"
export KEEL_DATA_DIR="$(mktemp -d)"
pnpm install --frozen-lockfile
pnpm verify
```

Demo mode is N/A: no demo entry point exists yet (`git grep -c -i 'demo mode' -- README.md package.json` exits 1). The third green check is the `verify` push run on the squash commit (`gh run list --repo BeniCheni/keel --commit <squash sha>`).

## Re-run at d1d24df

Cursor pushed `d1d24df49787dcc85538b60a1f4ea36d5e7305ef` on 2026-11-07 (its comment: [issuecomment-6715923940](https://github.com/BeniCheni/keel/pull/24#issuecomment-6715923940)). This session fetched it and re-ran:

| Check | Command | Result |
| --- | --- | --- |
| Head SHA | `gh pr view 24 --json headRefOid` and `git rev-parse HEAD` after `git merge --ff-only` | both `d1d24df49787dcc85538b60a1f4ea36d5e7305ef` |
| The fix is only the two edits | `git diff 22de9d7..HEAD --stat` and `git diff 22de9d7..HEAD` | 2 files, 2 insertions, 2 deletions: `docs/README.md:25` Status cell is "in review"; `.agents/skills/keel-pr-review/SKILL.md:11` ends "Cursor runs merge logistics only on Beni's word." Nothing else changed |
| Author | `git log -1 --format='%an <%ae>'` | `Cursor <cursoragent@cursor.com>` |
| Diff against main | `git diff --shortstat origin/main...HEAD` | 7 files, 139 insertions, 4 deletions (unchanged: two lines replaced) |
| Install | `pnpm install --frozen-lockfile` | exit 0 on Node 24.22.2 and 26.13.0 |
| Verify | `pnpm verify` | exit 0 on Node 24.22.2 and 26.13.0; each run: core 33 passed, 0 failed, 9 files; tooling 122 passed, 0 failed, 10 files; all eight sub-checks "ok" |
| CI | `gh run list --commit d1d24df49787dcc85538b60a1f4ea36d5e7305ef` | run 42436691392 `verify` success |
| Tripwire, repo and commit messages | `node tools/tripwire/cli.mjs .` | exit 0, no hit line: 0 in every class |
| Tripwire, external text | the same harness over the PR title and body, all four issue comments (27,132 bytes), Cursor's fix comment alone (614 bytes), the inline review comments (`[]`) and the reviews (`[]`) | 0 in each of cusip, account, ssn, address and email |

Cursor's comment claims install and verify exit 0 on both Node versions and a tripwire of 0 in every class; those are Cursor's claims, re-run above and matching. Codex then gave the cold read of `d1d24df` ([issuecomment-6716077893](https://github.com/BeniCheni/keel/pull/24#issuecomment-6716077893)): two line replacements, both Lows closed, no new finding, install and verify exit 0 on both Node versions, tripwire 0 in every class, and the owner's private-list check 0 in each of five inputs (Codex's claim; not re-runnable by this seat). The harness over Codex's comment and all five issue comments (28,802 bytes): 0 in every text class. The head did not move: `gh pr view 24 --json headRefOid` still prints `d1d24df49787dcc85538b60a1f4ea36d5e7305ef`.

## After the merge (Pass 2.5 session, 2026-11-07)

| Check | Command | Result |
| --- | --- | --- |
| `origin/main` is the squash GitHub recorded | `git fetch origin && git rev-parse origin/main`; `gh pr view 24 --json mergeCommit` | both `de7a3dbd0c5938e9e3c6587c1bb17ebc98a1099e` |
| Base did not move during review | `git rev-parse 'origin/main^'` | `b58e2df`, PR #23's squash |
| Squash tree equals the reviewed head's tree | `git rev-parse 'origin/main^{tree}' 'd1d24df49787dcc85538b60a1f4ea36d5e7305ef^{tree}'` | `2086434fce3ecffc356808e2fa92e8114eb6000f` twice |
| Squash message and trailers | `git log -1 --format='%s%n%b' origin/main` | the handoff block's subject and body; `Co-authored-by` for Claude, Cursor and Codex, each spelled out |
| Push CI on the squash | `gh run list --commit de7a3dbd0c5938e9e3c6587c1bb17ebc98a1099e` | run 42439282054 `verify` success |
| PR branch | `git ls-remote --heads origin docs/idea-33-cursor-cold-reads` | deleted |
| Install and verify at the squash | `git worktree add <scratch> de7a3db`, then `pnpm install --frozen-lockfile` and `pnpm verify` there on Node 24.22.2 and 26.13.0 | install exit 0 and verify exit 0 on both; core 33 passed, tooling 122 passed each time; worktree removed afterwards |

For the records PR: the `docs/README.md` row for PR #24 changes from "in review" to "merged 2026-11-07 at squash `de7a3db`, reviewed head `d1d24df`; Pass 1 by Cursor and Pass 2 by Codex, by Beni's rulings of 2026-11-07", and its Review records cell adds `reviews/pr-24-pass-2.5.md (executive brief)`.

## Retro

- Caught: the index row's Status cell is the first in the table with no state or date, against the "in review" form PR #1 and PR #7 used; and the pointer line's last "It" lost its antecedent when the Cursor sentence grew.
- Missed or wasted: nothing this seat could re-run disagreed with Pass 1 or Pass 2; the verify at `b58e2df` in a scratch worktree cost two full runs to confirm one sentence in the PR #23 merge section.

## Records note (PM, 2026-11-07)

This brief was written uncommitted in the Pass 2.5 clone and lands in a records PR written by the PM. The PM changed four things and nothing else. Questions 4 and 5 above are put in number order, so the rendered list keeps the numbers the Pass 2.5 comment used. Two counts are corrected after Codex's cold read of this records PR: "Risks and accepted costs" said two Cursor-authored commits where `git log --format='%h %an' b58e2df..d1d24df` shows three, and the shadow gate log said three Pass 1 Mediums where Pass 1 recorded two Mediums and one Low. And this note is added.

A later clone of `main` does not have this PR's branch commits, such as `c8b1f59`, `22de9d7` or `d1d24df`, because the branch is deleted. Run `git fetch origin pull/24/head` first. In a fresh clone, `git rev-parse --verify -q 'd1d24df^{commit}'` exits 1 before the fetch. After it, `git rev-parse 'de7a3db^{tree}' 'd1d24df49787dcc85538b60a1f4ea36d5e7305ef^{tree}'` prints `2086434fce3ecffc356808e2fa92e8114eb6000f` twice, and `git diff --shortstat b58e2df...d1d24df` gives 7 files, 139 insertions and 4 deletions. In the commands above, `origin/main` and `HEAD` mean `main` and the PR head as they were when each check ran.

The PM re-ran the checks in "After the merge" in its own fresh clone on 2026-11-07, with `KEEL_DATA_DIR` set to an empty temp directory. `origin/main` was `de7a3db` and its parent `b58e2df`; the two trees matched; the squash message carried the three trailers; push run 42439282054 succeeded; `git ls-remote --heads origin docs/idea-33-cursor-cold-reads` printed nothing; and `pnpm install --frozen-lockfile` and `pnpm verify` exited 0 on Node 24.22.2 and 26.13.0, with 33 core and 122 tooling tests passing each time.
