# Executive brief: PR #5, Pass 2.5, 2026-10-31 America/New_York

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim.

Seat: Claude, fresh session, Opus 5.5 High (no sensitive path touched), fallback not used. This session wrote no line of PR #5: it started in a fresh clone at `6ba4347` and made no commit before this brief. Reviewed head from GitHub: `6ba4347927a0ccc732b67e30ceba28d9ac7f1a80`, equal to `git rev-parse HEAD` after `git fetch` (`gh pr view 5 --json headRefOid`). `KEEL_DATA_DIR` pointed at an empty temporary directory for every run; no user data folder was opened.

## Decision

Shadow mode: the gate says "would merge", because every commit through `6ba4347` now has a cold read from a vendor that did not write it, nothing is contested, both Pass 1 Mediums are closed, and the merge result is green; Beni merges.

This is a **fast-track** PR, as the Pass 0 brief names it: Codex's one cold review replaced Passes 1 to 2.5 for the ten Claude commits. This read closes the one commit Codex could not read, its own correction `6ba4347`. It gives no cold read of any Claude-authored commit.

## What ships

- The PR #3 review record: its Pass 0 brief, its Pass 1.5 brief with the post-Pass-2 correction kept beside the original sentence, and its Pass 2.5 executive brief with Beni's rulings and decision row.
- A `CHANGELOG.md` note under `[Unreleased]` that records the empty `Co-authored-by: Cursor <>` trailer on squash `e9ab4ba` instead of rewriting `main`.
- Docs index rows for PRs #2, #3 and #5.
- The PR #5 Pass 0 brief, with the authorship record Codex completed, and this brief.
- No product code, test, tooling, schema or dependency changes. A green gate on the merge result shows only that these docs do not break the gate.

## What the passes found

- Pass 1 (Codex, fast-track, [comment](https://github.com/BeniCheni/keel/pull/5#issuecomment-6545780366)): P1-A Medium, the Pass 0 authorship table omitted `7c6827e` and named the brief's own commit without a SHA, fixed in `6ba4347`. P1-B Medium, the PR body described a stale head, file count and commit count, fixed in the PR body. No High. The comment was posted from the `BeniCheni` GitHub account under the Codex seat heading (`gh api repos/BeniCheni/keel/issues/comments/6545780366 --jq .user.login`).
- Pass 2: none separate; under fast-track the Codex Pass 1 read replaces it. Pass M N/A, no engine or golden fixtures.
- Pass 2.5 cold read of `6ba4347` (Codex-authored), from Git alone:
  - Scope: one file, 4 insertions, 2 deletions (`git show 6ba4347 --stat`; `git show 6ba4347 --numstat`). The two deleted lines are the old one-sentence authorship snapshot and the placeholder row "the commit adding this brief and the index rows". The snapshot's substance survives in the new sentence; the placeholder is replaced by the `10c23d6` row. Nothing else in the brief is removed (`git show 6ba4347`). `git diff --check 7c6827e 6ba4347` exits 0 with no output.
  - "The original snapshot at `a699303` had 8 commits, all `Claude`": true, 8 commits, 8 `Claude` (`git log --format='%h %an' origin/main..a699303`).
  - "At the Pass 1 input head `7c6827e`, the range has 10 commits, all `Claude`": true, 10 `Claude` (`git log --format='%an' origin/main..7c6827e | sort | uniq -c`).
  - "`10c23d6` this brief and the index rows": true; `10c23d6` is Claude's and adds `docs/reviews/pr-5-pass-0.md` (59 lines) and changes `docs/README.md` (`git show 10c23d6 --stat`).
  - "`7c6827e` run the gate on the merge result": true; `7c6827e` is Claude's and changes only the brief's bootstrap bullet, from "no" to "partly ... run the gate on the merge result instead" (`git show 7c6827e`).
  - "The table includes the brief's initial commit and its later bootstrap correction": true. The table's SHAs equal the input range exactly, 10 listed and 10 in range, none missing (the table's backticked SHAs, sorted, against `git log --format=%h origin/main..7c6827e | sort`).
  - The row it adds for itself: its command, `git log -1 --format='%h %an' -- docs/reviews/pr-5-pass-0.md`, prints `6ba4347 Codex`, so it names the right file and vendor. Its routing, a fresh Claude session because Codex cannot cold-read its own fix, matches the AGENTS.md authorship rule.
- Pass 2.5 corroboration of Pass 1:
  - P1-A: closed by `6ba4347`, per the read above.
  - P1-B: the PR body now states head `6ba4347`, 6 files, 310 insertions, 2 deletions, and 11 commits, 10 Claude and 1 Codex. Each matches the re-runs below. This brief's commit makes those figures a dated snapshot again (one more commit and file); see Risks.
  - Pass 1's historical replay of PR #3 figures, its mutations and its owner private-list check were not re-run; see "Not re-run".
- Pass 2.5 finding, Low, not fixed: the `6ba4347` row identifies its commit by a command instead of a SHA. The command resolves to `6ba4347 Codex` at the reviewed head and still does after this brief's commit, which leaves `docs/reviews/pr-5-pass-0.md` untouched, but it would drift if a later commit touched that file. Codex's record is left as written; the SHA is recorded here.
- Contested: none.

## Verification as re-run

Branch tree: it forks from `0db249a`, before S00 (`git merge-base origin/main HEAD`), so it has no `package.json`, lockfile, workflow or tripwire. Install, `verify` and mutations are **N/A on the branch itself**, not green. The gate ran on the merge result instead: a scratch worktree at `origin/main` (`e9ab4ba`, equal to GitHub's `main`), then `git merge --no-edit origin/docs/pr-3-reviews`, local merge commit `ff4e787` with parents `e9ab4ba` and `6ba4347`. The merge adds exactly the PR's three-dot diff (`diff <(git diff origin/main HEAD) <(git diff origin/main...origin/docs/pr-3-reviews)` prints nothing).

| Check | Command | Result |
| --- | --- | --- |
| Diff | `git diff --shortstat origin/main...HEAD` | 6 files, 310 insertions, 2 deletions; docs only (`git diff --name-only origin/main...HEAD`: `CHANGELOG.md`, `docs/README.md`, four files under `docs/reviews/`) |
| Commits | `git log --format='%h %an' origin/main..HEAD` | 11 commits: 10 Claude, 1 Codex (`6ba4347`) |
| Install | `pnpm install --frozen-lockfile` on the merge result | exit 0 on Node v24.22.2 and v26.13.0 |
| Verify | `pnpm verify` on the merge result | exit 0 on v24.22.2 and v26.13.0; each run: core 1 test passed (1 file), tooling 101 tests passed (8 files), 8 `verify:* ok` lines |
| Tripwire | `node tools/tripwire/cli.mjs .` on the merge result | exit 0 on both Node versions, no output |
| Copy lint | `node tools/copy/cli.mjs .` on the merge result | exit 0 on both Node versions, no output |
| Determinism | inside `pnpm verify` | `verify:determinism ok` on both Node versions |
| Zero network | inside `pnpm verify` | `verify:network ok` on both Node versions |
| CI | `gh pr checks 5` | 5 of 5 pass: `cell` on macos-latest and ubuntu-latest for Node 24 and 26, and `verify`; run 41217254179, event `pull_request` at head `6ba4347` (`gh run view 41217254179 --json event,headSha,conclusion`), so the cells ran on the PR's merge ref |
| Mutations | n/a | N/A: no tested claim in a docs-only diff |
| Pass M | `python3 tools/reference/payoff.py fixtures/golden/` | N/A: no engine or golden fixtures touched |
| UI matrix | n/a | N/A: no UI |
| Demo mode | n/a | N/A: no product surface yet |

Privacy sweep, counts per tripwire class (classes from `tools/tripwire/scan.mjs`; counts from `scanRepo`, which never prints a matched value). The merge-tree scan covers every tracked file and the commit messages in `origin/main..HEAD`, which at the merge commit includes all 11 branch commits. The PR text scan covers the PR title, body and existing comments, in a temporary repository with an empty allowlist and `origin/main` set to its one commit.

| Pattern class | Merge tree and commit messages | PR title, body, comments |
| --- | --- | --- |
| cusip | 0 | 0 |
| account | 0 | 0 |
| ssn | 0 | 0 |
| address | 0 | 0 |
| email (non-noreply) | 0 | 0 |
| price | 0 | 0 |
| local-only | 0 | 0 |
| unscannable | 0 | 0 |
| allowlist | 0 | 0 |

Negative control: the tripwire CLI on a repository with no `origin/main` prints `scan error: origin/main unavailable` and exits 2, so a failed scan does not read as zero hits.

Not re-run, and why:

- The owner's private-list check: not re-run by this seat, which has no pattern file and does not seek one. It rests on Codex's counts in its comment (readable-file precheck passed; 0 in tracked files, commit messages, PR title and body, and comments; missing-file control exits 2). Codex's claim, not verified here.
- Codex's historical replay of PR #3 figures, the eight mutant pairs, the two reversals and the 22-name guard check: these test Claude-authored content, which Codex cold-read; this seat's read is limited to `6ba4347`.
- Codex's report of three and six five-second tooling timeouts under concurrent load on Node 24: not reproduced here; this seat ran the gate serially and saw no timeout.
- Gate checks on the head that includes this brief: run after this brief was committed and before push, and recorded in the PR comment that links this brief, since the brief cannot report on its own commit.

## Estimates and model output

None.

## Risks and accepted costs

- **This brief's commit is a new Claude commit on the PR.** It is docs-only: it adds this file and the pointer to it in the `docs/README.md` row for PR #5, which AGENTS.md's Docs rule requires for every review record. It describes only this seat's read. Under the fast-track depth it needs no further cold read unless Beni rules otherwise (question 1). The merge pin therefore names the head that includes this commit, not `6ba4347`.
- **The PR body's figures are now a dated snapshot.** It names head `6ba4347`, 6 files and 11 commits; after this commit the head moves and the range gains one Claude commit and one file. Its sentences are dated ("Head after Pass 1 docs correction", "After the docs correction"), so they stay true as written; this brief and the PR comment carry the current figures.
- **The empty Cursor trailer on `e9ab4ba` stays on `main`.** Beni ruled on 2026-10-31 to record it rather than rewrite history; this PR is that record.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes: docs only, no version change |
| Verdict mergeable, every High closed (fix commit with a failing-first test, or for a High outside tracked files, a recorded remediation check plus Beni's confirmation) | Yes: Codex's verdict was "mergeable after fixes"; no High was found; both Mediums are closed |
| Nothing contested | Yes |
| `verify` green at tip; every number re-run | Yes at `6ba4347` on the merge result and in CI; the brief's own commit is checked before push and reported in the PR comment. The owner's private-list check rests on Codex's counts |
| No sensitive path, dependency or schema change | Yes (`git diff --name-only origin/main...HEAD`) |
| Every commit cold-read by a non-author vendor (authorship record) | Yes through `6ba4347`: the ten Claude commits by Codex (Pass 1), `6ba4347` by this Claude seat. This brief's commit is Claude's and docs-only; see question 1 |
| Fast-track | Yes, named in the Pass 0 brief; record "fast-track" in the squash message |
| Gate verdict | would merge |
| Beni's decision (filled after) | merged by Beni 2026-10-31 (America/New_York) as squash commit `330cc87` on base `e9ab4ba`, reviewed head `fed9d33`. Post-merge checks by the PM on 2026-10-31: `origin/main` equals `gh pr view 5 --json mergeCommit` (`330cc870d9c7098f943747289e3a2b848e68ae3c`); the base moved during review (the branch forked from `0db249a`, before S00), so the tree check is `git merge-tree --write-tree e9ab4ba fed9d33` = `dde1e6f`, equal to `origin/main^{tree}`, and `pnpm install --frozen-lockfile && pnpm verify` is green on the squash commit on Node v24.22.2 (core 1 test, tooling 101 tests, eight `verify:* ok` lines). Both co-author trailers are present and spelled out. |

### Authorship record

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `b8443cc`, `32eff6b`, `4e80cfe`, `6159ea2`, `a6f294e`, `d593070`, `654e8c9`, `a699303`, `10c23d6`, `7c6827e` | Claude | Codex, Pass 1 (fast-track) |
| `6ba4347` authorship-record correction | Codex | Claude, Pass 2.5 (this session, Opus 5.5 High) |
| The commit adding this brief (SHA in the PR comment that links it) | Claude (this Pass 2.5 session) | none further under fast-track, unless Beni rules otherwise |

## Questions for Beni

1. Accept this brief's docs-only Claude commit without a further Codex cold read, under the fast-track depth? (yes/no) **Ruled 2026-10-31 (America/New_York): yes. Approved.**

## Handoff block

A commit cannot name its own SHA, so the pin below is `<HEAD_SHA>`: copy it from the PR comment that links this brief, and check it against `gh pr view 5 --json headRefOid` before running. Run only on a "yes" to question 1, and only if that SHA is still the PR's head.

```bash
gh pr merge 5 --repo BeniCheni/keel --squash --match-head-commit <HEAD_SHA> --subject "docs(reviews): PR #3 review records (fast-track)" --body "Archive the PR #3 review briefs, rulings and squash attribution record, with the PR #5 Pass 0 and Pass 2.5 briefs. Reviewed under fast-track: Codex cold-read the Claude commits; a fresh Claude session cold-read the Codex authorship-record correction.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>"
git checkout main
git pull --ff-only
git fetch origin
test "$(git rev-parse origin/main)" = "$(gh pr view 5 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" && echo "origin/main equals the recorded squash"
pnpm install --frozen-lockfile && pnpm verify
```

Demo mode: N/A, no product surface yet.
