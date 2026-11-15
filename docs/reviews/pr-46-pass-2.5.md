# Executive brief: PR #46, Pass 2.5, 2026-11-15 America/New_York

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim.

Seat: Claude, fresh session, not the PM. Model `claude-fable-5-2` at effort `high`, both read from this session's metadata, which is the pin, so no fallback. I wrote no line of the build or any fix, pushed nothing and merged nothing. The one PR comment is posted: [issuecomment-6900161893](https://github.com/BeniCheni/keel/pull/46#issuecomment-6900161893).

## Decision

Shadow mode: the gate says **would escalate**, because `AGENTS.md` and `.claude/skills/keel-pr-review/SKILL.md` are sensitive paths and finding 1 carries one question for you. The review verdict is **mergeable** at `cc8d95e54988b6b12a3a3151e280469cf670e9ab`. Beni merges.

## What ships

- `AGENTS.md` names the Pass 2.5 seat "Claude, fresh session, not the PM" in both the Seats table and the Workflow table, and the Claude review skill says the same.
- The Planner row lists Executive Handoff Briefs for design, Pass 0 and 1.5 briefs, and the Pass 2.5 seat's prompt. The Pass 2.5 seat writes the review executive brief.
- `CHANGELOG.md` gains one line under Unreleased, Changed.
- No pin, fallback, effort, pass order or gate rule changes, and no code, test, fixture or dependency changes.

## What the passes found

- **Pass 1 (Codex):** two Mediums, both fixed by Pass 1.
  - The Planner row lost its design handoff duty; fixed in `cc8d95e54988b6b12a3a3151e280469cf670e9ab`.
  - The body's wording-count command missed the skill; fixed in a body edit.
- **Pass 2 (Codex):** mergeable, no fix commit. It accepted both Pass 1 findings and found two Mediums and two Lows in the PM's text, all since corrected. Pass M is N/A.
- **Pass 2.5 corroboration:** Pass 1's finding 2 reproduces, and Pass 2's four corrections are in place. Pass 1's finding 1 I accept as a fix and dispute as a description (finding 1 below).
- **Contested:** only the word "retain" in finding 1. Nobody disputes the row itself.

My five findings, all Low under `AGENTS.md` Severity, none fixed here:

| # | Finding | Command and result |
| --- | --- | --- |
| 1 | `cc8d95e`'s subject says "retain" and Pass 1's body sentence says the Planner "still writes" the design Executive Handoff Brief, but `main` never named a writer for it. [AGENTS.md:16](AGENTS.md:16) therefore assigns it in so many words for the first time, which rulings 1 and 2 do not cover. | Pass 1's `awk` assertion on `git show origin/main:AGENTS.md` prints `design-handoff assignments=0`, exit 1, the same as at `783abe138f655033b6660d0ac58fe0bc47490bea`. |
| 2 | [CHANGELOG.md:21](CHANGELOG.md:21) no longer says what the Planner row dropped, so it reads as two additions. | `git diff 783abe138f655033b6660d0ac58fe0bc47490bea cc8d95e54988b6b12a3a3151e280469cf670e9ab -- CHANGELOG.md` |
| 3 | PR body, Claims: Pass 1 pinned one row to `783abe1` and left the others on `HEAD`, so "One commit, Claude's" no longer reproduces as printed. | `git log --format='%an' origin/main..HEAD \| sort \| uniq -c` prints `1 Claude` and `1 Codex`. |
| 4 | PR body, Privacy: "this branch's one commit message"; there are two. | `git rev-list origin/main..HEAD \| wc -l` prints `2`. |
| 5 | Outside this PR: branch `docs/pr-46-records` adds two briefs and no index row for PR #46. | `git show origin/docs/pr-46-records:docs/README.md \| grep -c -E 'PR #46\|pr-46-'` prints `0`. |

Out of scope, for the PM's ideas list:
- The independence rules bound the PM's channel to Pass 1 and say nothing about its channel to Pass 2.5, which the Planner row now names.
- The skill has no template for the Pass 2.5 seat's prompt.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Head | `gh pr view 46 --repo BeniCheni/keel --json headRefOid` | `cc8d95e54988b6b12a3a3151e280469cf670e9ab`, before and after posting |
| Install | `pnpm install --frozen-lockfile` | Exit 0 on Node v24.22.2 and v26.13.0 |
| Verify | `pnpm verify` | Exit 0 on both. Core 178 tests in 16 files, plugin 212 in 12, tooling 126 in 11, all passed. Worktree clean and data folder empty after each |
| CI | `gh run list --repo BeniCheni/keel --commit cc8d95e54988b6b12a3a3151e280469cf670e9ab --json databaseId,event,conclusion` | One `pull_request` run, 43747456576, success |
| Determinism | The skill's command, 2 trees | Exit 0 |
| Zero network | `pnpm verify:network` | Exit 0 |
| Diff | `git diff --shortstat origin/main...HEAD` | 3 files, 5 insertions, 4 deletions |
| Tables | `python3 -I tablecols.py AGENTS.md CHANGELOG.md .claude/skills/keel-pr-review/SKILL.md` | `AGENTS.md` 3 tables, 23 rows, 0 bad; control exits 1 |
| Copy lint | `node tools/verify/one.mjs copy` | Exit 0 |
| Tripwire | `node tools/tripwire/cli.mjs .` | Exit 0, no output |
| Tripwire per class | `scanRepo` over the clone, then over the title, 4 body snapshots, live body and my comment in an isolated repository | 0 in each of the ten classes on every surface; the planted control gave `cusip` 1 |
| Mutations | N/A | No code, test or fixture changes |
| Pass M | N/A | No engine or golden fixture changes |
| UI matrix | N/A | No UI |
| Demo mode | `grep -c -i demo README.md` prints `0`, exit 1 | N/A, not green: idea 50 |

Not re-run, and why:
- **Private-list check.** Codex's counts (0 per surface, control 1) are Codex's claims; no Claude seat opens that list. No private-list check has covered the 19:14:03Z body, the brief as amended at `54faccaba11787719634504483bef8c76f526c38`, or my comment.
- **Codex's model and effort** are Codex's statement.
- **One early invocation** ran read-only `git` commands with `KEEL_DATA_DIR` empty, because a bare `mktemp -d` fails in this app's sandbox. No keel code ran in it.
- Commands using `gh`, `git fetch`, `pnpm` or `tsx` ran with the sandbox off, as your prompt allowed.

## Estimates and model output

None.

## Risks and accepted costs

- If your answer to the question below is No, the Planner row needs rework before merge, and that commit needs its own cold read.
- Findings 2 to 5 stay open as Lows for the PM; the squash message below does not repeat the stale body text.
- Your prompt said three Codex comments; two existed (`gh api repos/BeniCheni/keel/issues/46 --jq .comments` printed `2` before mine).

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes |
| Verdict mergeable, every High closed | Yes: no High from any pass |
| Nothing contested | No: the word "retain" in finding 1, put to Beni |
| `verify` green at tip; every number re-run | Yes |
| No sensitive path, dependency or schema change | No: two sensitive paths |
| Every commit cold-read by a non-author vendor | Yes: Codex read the Claude commit, this seat read the Codex commit |
| Gate verdict | would escalate |
| Beni's decision (filled after) | Merge. He answered "Yes" to question 1 in the PM's session on 2026-11-15, and merged at 15:25:59 EST as `36f4a38` after a private-list scan he reported all zero |

## Questions for Beni

1. Does the Planner write the design Executive Handoff Brief, as `AGENTS.md:16` now says? Yes means merge as is; No means rework first.

## Handoff block

This block is for a Yes. Trailers checked: `git log --format='%an <%ae>' origin/main..HEAD` gives `Claude <noreply@anthropic.com>` and `Codex <noreply@openai.com>`; Codex gave Passes 1 and 2 and Claude gave Pass 2.5. Marking the PR ready starts no new run, because `verify.yml` triggers on plain `pull_request`.

```bash
# first: Codex's private-list check over the 19:14:03Z body, the brief at 54faccaba11787719634504483bef8c76f526c38 and comment 6900161893
gh pr ready 46 --repo BeniCheni/keel
gh pr merge 46 --repo BeniCheni/keel --squash --match-head-commit cc8d95e54988b6b12a3a3151e280469cf670e9ab --subject "docs(agents): the Pass 2.5 seat is a fresh Claude session, not the PM (#46)" --body "AGENTS.md names the Pass 2.5 seat 'Claude, fresh session, not the PM' in both its Seats table and its Workflow table, and the Claude review skill says the same, by Beni's ruling of 2026-11-15. Before this the Seats table said 'Claude, fresh session' while the Workflow table and the skill named the PM (PR #38's Pass 2.5 finding 6). The Planner row now lists Executive Handoff Briefs for design, Pass 0 and 1.5 briefs and the Pass 2.5 seat's prompt, where it listed Pass 0, 1.5 and 2.5 briefs and executive briefs; the Pass 2.5 seat writes the review executive brief. No pin, fallback, effort, pass order or gate rule changes. CHANGELOG.md records the change under Unreleased.

Review: 783abe138f655033b6660d0ac58fe0bc47490bea is Claude-authored and cc8d95e54988b6b12a3a3151e280469cf670e9ab is Codex-authored. Codex gave Pass 1 (two Mediums, fixed in the second commit and in the PR body) and Pass 2 (mergeable). A fresh Claude session gave Pass 2.5 and the cold read of the Codex commit at cc8d95e54988b6b12a3a3151e280469cf670e9ab: mergeable, five Lows, none needing a commit. Beni confirmed at the merge that the Planner writes the design Executive Handoff Brief. AGENTS.md and .claude/skills/** are sensitive paths, so the shadow gate said would escalate and Beni merges.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>"
# then, in your main checkout:
git switch main && git pull --ff-only
gh pr view 46 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid   # must equal the next line
git rev-parse origin/main
git rev-parse 'origin/main^{tree}'   # ae49a161580532a819d43aec73d4b4ebdbca1982 if main did not move
pnpm install --frozen-lockfile
pnpm verify
# demo mode: N/A, the README has no demo step (idea 50); not a green check
```

`★ Insight ─────────────────────────────────────`
- **Run a before/after assertion on the base too.** Pass 1's check failed at `783abe1` and passed at `cc8d95e`, which looks like "a duty was dropped, then restored". Running it on `origin/main` as well showed it fails there too, so the fix adds an explicit assignment that the base never had.
- **Check that a control can fail.** My first copy of `tablecols.py` lost its final `sys.exit` line, so its bad-row control exited 0. Reading the control's exit code, not its printed output, is what caught it.
`─────────────────────────────────────────────────`

## Records note (PM, 2026-11-15)

Written by the PM after the merge, in the records PR for PR #46. Everything above this heading is the Pass 2.5 seat's chat message of 14:41:58 EST, read as data from its session transcript `3bc4ba41-5fe1-4475-b86b-9c23293a9633` with `brief-from-transcript.py`, which `pr-40-pass-2.5.md` prints (SHA-256 `20373071784e26c95c68714efbb525873133d18fcf7aedeffb1c96b928a8d6e4`). The message is 10,180 characters, SHA-256 `ba59a7b2ae7da580be513ce06012556ead24561b8b0901445a2f0628d65d3d00`. The PM changed one line, the gate log's last row, and added the final newline. All 88 assistant turns in that transcript name the model `claude-fable-5-2` (`models.py`, appendix). The seat read its effort, `high`, from its own metadata; the PM did not check it.

- **The seat's comment** is [issuecomment-6900161893](https://github.com/BeniCheni/keel/pull/46#issuecomment-6900161893), posted at 14:40:59 EST, before the message above.
- **Beni's answer to the seat's question.** In the PM's session on 2026-11-15, to "Does the Planner write the design Executive Handoff Brief?", he answered "Yes". So the Planner row's "Executive Handoff Briefs for design" stands by his ruling, which closes the seat's finding 1, and the squash message's sentence "Beni confirmed at the merge that the Planner writes the design Executive Handoff Brief" is true.
- **The handoff and the scan.** The squash subject and body are the seat's handoff text byte for byte, compared against its transcript. The PM gave Beni `private-scan-46.sh` and `merge-46.sh` (appendix), which carry that text in a heredoc where the seat's command used a `--body` string.
  - **What the scan covers:** a check that the head is still `cc8d95e`; the diff; both commit messages; the title and every version of the body in GitHub's edit history (4 at the time); every comment (3); reviews and inline comments; the Pass 0 and Pass 1.5 briefs at `54faccaba11787719634504483bef8c76f526c38`; and the squash message. That reaches the texts no Codex private-list check had read: the body edit of 19:14:03Z, the brief as amended at `54facca`, and the seat's comment.
  - **How it was tested:** against synthetic lists only. It exits 2 on an empty list, 1 with a term known to appear, and 0 with an absent one.
  - **The result:** Beni answered "Yes, all zero" in the PM's session, to "Did the PR #46 scan end all zero before you merged?". He reported the outcome, not the counts.
- **The merge.** GitHub records it at 15:25:59 EST (`2026-11-15T20:25:59Z`) as squash `36f4a38b66bc04dc13bbf9591ac5c96e59ea33f1`, at the reviewed head `cc8d95e` (`gh pr view 46 --repo BeniCheni/keel --json mergedAt,mergeCommit,headRefOid`).
- **For the gate-activation record.** The shadow gate said "would escalate", on sensitive paths and on the word contested in finding 1. Beni merged after answering that finding's question. The verdict and his decision agree.
- **Post-merge checks**, in a fresh clone of `main` with `KEEL_DATA_DIR` set to an empty `mktemp -d`:
  - **Base and tree.** The squash has one parent, `79839c3`, so the base did not move during review. Its tree, `ae49a161580532a819d43aec73d4b4ebdbca1982`, equals the reviewed head's (`git diff --quiet 36f4a38 cc8d95e` exits 0), the value the seat's handoff predicted.
  - **Files.** The three reviewed: `.claude/skills/keel-pr-review/SKILL.md`, `AGENTS.md` and `CHANGELOG.md` (`git diff --name-only 36f4a38^ 36f4a38`).
  - **The message and trailers.** The subject and body equal the handoff files, after trimming trailing blank lines. `git log -1 --format='%(trailers:key=Co-authored-by,valueonly)' 36f4a38` prints Claude and Codex in full.
  - **The rule on `main`.** `git grep -c 'fresh session, not the PM' HEAD -- AGENTS.md` prints 2, the skill says "fresh Claude session, not the PM", and `git grep -c -E 'PM, fresh session|PM in a fresh session' HEAD -- AGENTS.md .claude .agents` prints nothing and exits 1.
  - **Install and verify.** `pnpm install --frozen-lockfile` and `pnpm verify` exit 0 on Node 24.22.2 and on 26.13.0. Core 178, plugin 212 and tooling 126 tests passed; `git status --porcelain --untracked-files=all` prints nothing afterwards, and the data folder holds 0 entries.
  - **Pass M.** `python3 -I tools/reference/payoff.py fixtures/golden/` exits 0 with 13 cases and 0 disagreements.
  - **Push CI.** Run 43758045060 on `36f4a38` succeeded.
  - **Tag and branch.** No tag points at the squash, and the branch `docs/pass-2.5-seat` is gone.
- **Where the open items go.**
  - **The seat's Low 1** closed with Beni's "Yes" above.
  - **Low 2**, the changelog line that no longer says what the Planner row dropped: the next ordinary docs PR. `CHANGELOG.md` is not a sensitive path.
  - **Lows 3 and 4**, the PR body's commit count and commit-message count, stale once `cc8d95e` landed: no change. The body is on a merged PR, and the squash message repeats neither.
  - **Low 5**, no index row for PR #46 on this branch: closed by this records PR's row in `docs/README.md`.
  - **The seat's two ideas**, that the independence rules say nothing of the PM's channel to the Pass 2.5 seat, and that the skill has no template for that seat's prompt: the next ordinary docs PR's ideas. Either change would touch `AGENTS.md` or the skill, both sensitive paths.
  - **The PM's Pass 2.5 prompt** said "Codex's three comments"; two existed, as the seat noted. The links it gave were right.

## Appendix: the PM's scripts

Each heading gives the file's SHA-256 (`shasum -a 256`).

#### `models.py` (`1abb750f646e29c90ac26255f18b265c54dcb5f85d2d42597d006719c7251b16`)

```python
# Counts the model each assistant turn of a Claude Code transcript names, as data. Executes nothing it reads.
# usage: python3 -I models.py <transcript.jsonl>
import sys, json, collections
c = collections.Counter()
for line in open(sys.argv[1], encoding="utf-8"):
    r = json.loads(line)
    if r.get("type") == "assistant": c[(r.get("message") or {}).get("model")] += 1
print(dict(c))
```

#### `private-scan-46.sh`, the private-list scan for Beni to run (`7bd0f50164de80a713bb83901978dd6abea30301e34adc55a619dd347061e826`)

```sh
bash <<'SCRIPT'
set -u
F="${KEEL_PRIVATE_LIST:-$HOME/.config/keel/private-terms.txt}"
R=BeniCheni/keel
N=46
REC=54faccaba11787719634504483bef8c76f526c38
{ test -r "$F" && test -s "$F"; } || { echo "list unreadable or empty"; exit 2; }
W="$(mktemp -d)" || { echo "mktemp failed"; exit 2; }; trap 'rm -rf "$W"' EXIT
grep -v '^[[:space:]]*$' "$F" > "$W/p" || { echo "list has no patterns"; exit 2; }
head -n 1 "$W/p" > "$W/control"
c="$(grep -F -i -c -f "$W/p" "$W/control")"
[ "$c" = 1 ] || { echo "control failed"; exit 2; }
echo "control: ok"
h="$(gh pr view $N --repo $R --json headRefOid --jq .headRefOid < /dev/null)" || { echo "head fetch failed"; exit 2; }
[ "$h" = cc8d95e54988b6b12a3a3151e280469cf670e9ab ] || { echo "head is $h, not the reviewed head"; exit 2; }
gh pr diff $N --repo $R > "$W/diff" < /dev/null || { echo "diff fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/commits --jq '.[].commit.message' > "$W/commits" < /dev/null || { echo "commits fetch failed"; exit 2; }
gh pr view $N --repo $R --json title,body --jq '.title, .body' > "$W/title-body" < /dev/null || { echo "PR fetch failed"; exit 2; }
gh api graphql -f query='query{repository(owner:"BeniCheni",name:"keel"){pullRequest(number:46){userContentEdits(first:100){nodes{diff}}}}}' --jq '.data.repository.pullRequest.userContentEdits.nodes[].diff' > "$W/body-versions" < /dev/null || { echo "body versions fetch failed"; exit 2; }
gh api --paginate repos/$R/issues/$N/comments --jq '.[].body' > "$W/comments" < /dev/null || { echo "comments fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/reviews --jq '.[].body' > "$W/reviews" < /dev/null || { echo "reviews fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/comments --jq '.[].body' > "$W/review-comments" < /dev/null || { echo "review comments fetch failed"; exit 2; }
for b in 0 1.5; do
  gh api -H 'Accept: application/vnd.github.raw' "repos/$R/contents/docs/reviews/pr-$N-pass-$b.md?ref=$REC" > "$W/brief-pass-$b" < /dev/null || { echo "brief $b fetch failed"; exit 2; }
done
cat > "$W/squash" <<'MSG'
docs(agents): the Pass 2.5 seat is a fresh Claude session, not the PM (#46)

AGENTS.md names the Pass 2.5 seat 'Claude, fresh session, not the PM' in both its Seats table and its Workflow table, and the Claude review skill says the same, by Beni's ruling of 2026-11-15. Before this the Seats table said 'Claude, fresh session' while the Workflow table and the skill named the PM (PR #38's Pass 2.5 finding 6). The Planner row now lists Executive Handoff Briefs for design, Pass 0 and 1.5 briefs and the Pass 2.5 seat's prompt, where it listed Pass 0, 1.5 and 2.5 briefs and executive briefs; the Pass 2.5 seat writes the review executive brief. No pin, fallback, effort, pass order or gate rule changes. CHANGELOG.md records the change under Unreleased.

Review: 783abe138f655033b6660d0ac58fe0bc47490bea is Claude-authored and cc8d95e54988b6b12a3a3151e280469cf670e9ab is Codex-authored. Codex gave Pass 1 (two Mediums, fixed in the second commit and in the PR body) and Pass 2 (mergeable). A fresh Claude session gave Pass 2.5 and the cold read of the Codex commit at cc8d95e54988b6b12a3a3151e280469cf670e9ab: mergeable, five Lows, none needing a commit. Beni confirmed at the merge that the Planner writes the design Executive Handoff Brief. AGENTS.md and .claude/skills/** are sensitive paths, so the shadow gate said would escalate and Beni merges.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
MSG
echo "comments on PR #$N now: $(gh api repos/$R/issues/$N --jq .comments < /dev/null); body versions in the edit history: $(gh api graphql -f query='query{repository(owner:"BeniCheni",name:"keel"){pullRequest(number:46){userContentEdits(first:100){totalCount}}}}' --jq .data.repository.pullRequest.userContentEdits.totalCount < /dev/null)"
status=0
for s in diff commits title-body body-versions comments reviews review-comments brief-pass-0 brief-pass-1.5 squash; do
  f="$W/$s"
  test -s "$f" || [ "$s" = reviews ] || [ "$s" = review-comments ] || { echo "$s: empty, scan failed"; status=2; continue; }
  n="$(grep -F -i -c -f "$W/p" "$f")"; rc=$?
  if [ "$rc" -gt 1 ]; then echo "$s: scan failed"; status=2
  else echo "$s: $n matching lines"; [ "$n" = 0 ] || { [ "$status" = 2 ] || status=1; }
  fi
done
echo "exit $status"
exit $status
SCRIPT
```

#### `merge-46.sh`, the merge commands as given to Beni (PR #46 is merged, so they now fail) (`bc22b89d44b90b3b593a317385ebcf1b4ac3b3d65bbe763da48e758a045c131b`)

```sh
gh pr ready 46 --repo BeniCheni/keel
gh pr merge 46 --repo BeniCheni/keel --squash --match-head-commit cc8d95e54988b6b12a3a3151e280469cf670e9ab --subject "docs(agents): the Pass 2.5 seat is a fresh Claude session, not the PM (#46)" --body-file - <<'EOF'
AGENTS.md names the Pass 2.5 seat 'Claude, fresh session, not the PM' in both its Seats table and its Workflow table, and the Claude review skill says the same, by Beni's ruling of 2026-11-15. Before this the Seats table said 'Claude, fresh session' while the Workflow table and the skill named the PM (PR #38's Pass 2.5 finding 6). The Planner row now lists Executive Handoff Briefs for design, Pass 0 and 1.5 briefs and the Pass 2.5 seat's prompt, where it listed Pass 0, 1.5 and 2.5 briefs and executive briefs; the Pass 2.5 seat writes the review executive brief. No pin, fallback, effort, pass order or gate rule changes. CHANGELOG.md records the change under Unreleased.

Review: 783abe138f655033b6660d0ac58fe0bc47490bea is Claude-authored and cc8d95e54988b6b12a3a3151e280469cf670e9ab is Codex-authored. Codex gave Pass 1 (two Mediums, fixed in the second commit and in the PR body) and Pass 2 (mergeable). A fresh Claude session gave Pass 2.5 and the cold read of the Codex commit at cc8d95e54988b6b12a3a3151e280469cf670e9ab: mergeable, five Lows, none needing a commit. Beni confirmed at the merge that the Planner writes the design Executive Handoff Brief. AGENTS.md and .claude/skills/** are sensitive paths, so the shadow gate said would escalate and Beni merges.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
EOF
```
