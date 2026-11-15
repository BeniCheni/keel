# Pass 0 brief: PR #42 (S03.1 Decision 7, one honesty test rewritten for g12)

Written by the PM on 2026-11-14 (America/New_York), from a fresh read of the PR at `d568181`. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing. When it was written, PR #42 had no comment (`gh api repos/BeniCheni/keel/issues/42/comments --jq length` printed `0`). The brief sits on `docs/pr-42-records`, not on the PR branch, so the PR's diff stays one spec file. Records PR #41 also edits the S03.1 row of `docs/README.md`, and this PR's index row would sit next to it.

## Seat for the cold review

Codex, GPT-6.1 Sol High. The PR touches no sensitive path, so the High effort applies. `AGENTS.md` asks for one cold review by a vendor that did not write the PR, and a Claude session wrote every line. Cursor does not take it: the amendment changes the rules of the S03.1 build Cursor is doing now, and settles the stop Cursor raised. The seat has no fallback: if it is unavailable, stop and escalate.

## Scope

- **Spec:** this PR amends `docs/specs/s03.1-reference-k.md` alone. Design brief: none.
- **Sensitive paths touched:** none. `git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers | wc -l` prints `0`.
- **Release:** no. New dependencies: none.
- **Checks that apply:** this is not the bootstrap path, so `verify` applies. Mutations and Pass M are N/A: no code, test or fixture changes. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.

## The ruling the PR records

**"Rewrite that test (Recommended)", 2026-11-14 at 00:32:49 EST, in the PM's session.** The PM asked at 00:32:26 EST. Decision 7 quotes the question in full.

- **The chosen option read:** "Amend the spec so Cursor changes only that one test. It lists the golden cases that don't evaluate, requires that list to be exactly g12, and still requires a next event on every live case. All 11 existing cases must still evaluate. In my probe it passes with g12, and fails if another case stops evaluating or if g12 is missing. Needs your word that this isn't weakening under hard rule 3."
- **Its preview** showed the test text that Decision 7 now gives, and the probe's four results.
- **He declined:**
  - "Drop g12": "Keep g13 only, and change no honesty test. Pass M then cannot see the k-rule disagreement, so PR #38's uncommitted reproducer (AC1) stays the only check on it."
  - "Separate g12 folder": "Put g12 outside fixtures/golden, for example in fixtures/golden-unavailable/, with a second Pass M run and a new registry tree. No honesty test changes, but more spec and tooling change."

The cold review cannot see that session. Beni's merge confirms the ruling.

**Cursor's stop,** as Beni relayed it to the PM at 00:30:11 EST, with nothing committed:
- `pnpm verify` on Node 24.22.2 failed in the honesty test "a live golden evaluation names its next event", with g12's frozen `unavailable` result as the error.
- AC9 and the Honesty tests section forbade any change to the test.
- Two other red checks were separate:
  - `payoff.policy.test.ts` pinned 11 golden folders, a case-list pin Cursor had moved to 13;
  - the determinism step failed, because the six new golden files were not yet tracked.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `d568181` | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or a numbering fork. One cold review by Codex replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message. The rewritten test itself is code, and it gets the full passes in the S03.1 build PR: Pass 1 by Claude Code on Fable 5.2 Extra, Pass 2 by Codex, and Pass 2.5 by a fresh Claude session on Fable 5.2 High.

## What to check, beyond the skill's standing checks

1. **The rewrite.** Is Decision 7's text a correct replacement for the test at `883bdd1`, lines 503 to 509 of `packages/plugin-mln/src/payoff.honesty.test.ts`? Every name it uses is already imported or defined in that file. Run the PR body's `honesty-probe.sh`, after reading it, in a clone of `main` with `node_modules` installed. The PM also ran `pnpm -s verify:typecheck` with the rewrite applied, and it exited 0.
2. **Hard rule 3.** At `883bdd1`, the test asserted two things about every golden case: it evaluates, and, if `live`, it names its next event. Does the rewrite relax either for any of the 11 existing cases? Can a future case stop evaluating without the test failing?
3. **AC9.** Does the line rule admit exactly the rewrite, and fail on an edit elsewhere in the file or in another honesty file? The rule is that every hunk's old range lies within lines 503 to 509. Is "the test reads as Decision 7 gives it" checkable as written?
4. **Agreement.** Do the status line, Decision 7, Scope, Honesty tests, AC9 and the Mutation floor agree with each other and with Non-goals? Does any other line of the S03.1 spec, or of the S03 spec, still say that no honesty test changes?
5. **Scope.** Is the new bullet right that the golden-folder count in `payoff.policy.test.ts` is part of the case list? Is excluding `*.honesty.test.ts` from the general test-file bullet right?
6. **The mutants.** Does each of Decision 7's two mutants fail the rewritten test? Is each stated exactly enough for Cursor to apply it?
7. **Copy.** The quoted question contains "should". `pnpm -s verify:copy` exits 0. Is quoting Beni's question verbatim acceptable here, as earlier specs have done?
8. **Privacy.** This seat runs the owner's private-list check, counts only, over the diff, the commit message, the PR title and body, every comment, this brief and its own proposed comment.

Out of scope: any change to code, tests, fixtures or `AGENTS.md`, and Cursor's paused build. Findings there go in the comment for the PM to carry.

## Records note (PM, 2026-11-14)

Written by the PM after the merge, in the records PR for PRs #42 and #43. Everything above this heading is the Pass 0 brief as Codex read it, at `b9ab3c3`.

- **The cold review and its re-reads.** Codex, GPT-6.1 Sol High, each read in a sub-agent, posted eight comments (`gh api repos/BeniCheni/keel/issues/42/comments --jq '.[] | [.id, .created_at] | @tsv'`):
  - the cold review, [issuecomment-6879720808](https://github.com/BeniCheni/keel/pull/42#issuecomment-6879720808) (10:28:07 EST);
  - re-reads one to six, at 10:47:47, 11:06:47, 11:39:46, 12:56:55, 13:12:09 and 13:23:26 EST, each "mergeable after fixes";
  - the seventh re-read, [issuecomment-6883253707](https://github.com/BeniCheni/keel/pull/42#issuecomment-6883253707) (14:48:35 EST), "mergeable under Beni's 2026-11-14 ruling" at `3e32f47b016b894153f07a74bf66a9c8f98e2c07`. Two earlier attempts at it stopped before posting, on the identity that the PR body's proof scripts committed with.

  From the sixth re-read on, every finding was in the proof scripts the PR body prints, not in Decision 7 or AC9, as the ruling's question below says and the seventh re-read confirms ("No spec findings in this read").
- **Beni's ruling, "One last read (Recommended)".** The PM asked at 13:50:48 EST, and he answered at 13:50:56 EST: "PR #42's spec (Decision 7 and AC9) has held since Codex's fifth re-read; the last three rounds found issues only in proof scripts printed in the PR body (now: Git env vars can override their commit identity). After I pin both identities, how should PR #42 proceed?"
  - **The chosen option read:** "I pin author and committer identities, and Codex resumes the seventh re-read on that fix. If it then finds only issues in the body's helper scripts, not the spec, you merge anyway, and the records list those findings as open."
  - **He declined:** "Iterate to clean", and "Drop the scripts".
- **Open, by that ruling:** three Medium findings, each labelled "body helper" in the seventh re-read. None is in the spec.
  1. The argument guard in `ac9-proof.sh` accepts an empty clone argument when the caller is already in the clone, and a relative rewrite path passes the guard but fails after the script changes folder.
  2. A failed `git status`, `git diff` or `git ls-tree` reads as success, so the script can exit 0 with a stray file present or with an AC9 command failed.
  3. The cleanup trap can report success after a failed checkout. It also leaves an initially attached `HEAD` detached, and deletes an ignored `honesty.txt`.
- **The handoff and the scan.** The PM gave Beni `private-scan-42.sh` and the pinned merge commands in `merge-42.sh`, both in the appendix.
  - **What the scan covers:** the diff, the commit messages, the title and body, the comments, reviews and inline comments, this brief at `b9ab3c3`, and the squash message.
  - **How it was tested:** against synthetic lists only. It exits 2 on an empty list, 1 with a known hit, and 0 with no hit.
  - **The result:** at 14:56:18 EST Beni answered "Yes, merged" in the PM's session, to "Did the PR #42 scan end all zero before you merged?". He reported the outcome, not the counts.
- **The merge.** GitHub records it at 14:56:11 EST (`2026-11-14T19:56:11Z`) as squash `0fda80f1bf02ec8a551491608fcc2cf3e70f598a`, at the reviewed head `3e32f47` (`gh pr view 42 --repo BeniCheni/keel --json mergedAt,mergeCommit,headRefOid`).
- **For the gate-activation record.** Fast-track, so no Pass 2.5 evaluated the gate. Beni merged in shadow mode from the PM's handoff, with the three body-helper Mediums open by his ruling. "fast-track" is in the squash message.
- **Post-merge checks.** The PM ran `post-merge-42.sh` (appendix) in a fresh clone of `main`, with `KEEL_DATA_DIR` set to one empty `mktemp -d` (0 entries after the runs).
  - **The base moved during review.** Records PR #41 merged as `9a1fff0` while PR #42 was open, so the squash's one parent is `9a1fff0a656051757518e1466544d9004e95ae8e`, not the review base `883bdd1`. The checks therefore compare files, not trees:
    - the squash changes one file against its parent, `docs/specs/s03.1-reference-k.md`;
    - that file equals the reviewed head's (`git diff --quiet 3e32f47 0fda80f -- docs/specs/s03.1-reference-k.md` exits 0);
    - nothing else changed against the parent (exit 0);
    - `9a1fff0` did not touch the spec after `883bdd1` (exit 0).
  - **The message and trailers.** `git log -1 --format='%(trailers:key=Co-authored-by)' 0fda80f` prints Claude and Codex in full. `git log --format='%an <%ae>' 883bdd1..3e32f47` gives 6 Claude commits, and Codex gave every review.
  - **Tag and branch.** No tag points at the squash, and the branch `docs/s03.1-honesty-rewrite` is gone.
  - **Install and verify.** `pnpm install --frozen-lockfile` and `pnpm verify` exit 0 on Node 24.22.2 and on 26.13.0. Core 178, plugin 210 and tooling 123 tests passed, and `git status --porcelain --untracked-files=all` prints nothing afterwards.
  - **Push CI.** Run 43634768591 on `0fda80f` succeeded.
  - **AC9 on `main`.** `git ls-tree 0fda80f -- packages/plugin-mln/src/payoff.honesty.test.ts` still printed the base blob `06f285ad4a6dd6077433f85f9d79d03ed813bb3e`, as expected. The rewrite landed in PR #43, the S03.1 build, whose records follow this note.
- **Privacy.** The seventh re-read reports three scans. Its private-list scan checked that the list was readable, then gave 0 hit lines in the body, the seven issue comments before it, and its own comment; the PR had no reviews or inline comments. Its two tripwire scans, `node tools/tripwire/cli.mjs .` over its checkout and a counts-only metadata scan of the title, body and commit messages, gave 0 in each of the ten classes, and its synthetic control gave `cusip` 1. So the title and commit messages had the tripwire's classes but not the private list, and the re-read reports no private-list scan of the diff. Beni's scan before the merge, `private-scan-42.sh` in the appendix, ran the private list over the diff, the commit messages, the title and body, the comments, reviews and inline comments, this brief at `b9ab3c3`, and the squash message, as the handoff bullet above lists. It scans those texts, not the checkout. This records PR's new text gets the private-list check in its own cold read.
- **Where the open items go.** The three body-helper Mediums stay open. The proof scripts live only in PR #42's body, a closed PR, so no change follows. The lesson is in the PM's practice: any printed script that commits takes the author from its caller, and sets the `GIT_AUTHOR_*` and `GIT_COMMITTER_*` variables as well as `git -c`.

## Appendix: the PM's scripts

Each heading gives the file's SHA-256 (`shasum -a 256`).

#### `private-scan-42.sh`, the private-list scan for Beni to run (`005a5a2d5231e9e841d79f2f2920973c743f51b1d5fc47268d3e3e2b672c293d`)

```sh
bash <<'SCRIPT'
set -u
F="${KEEL_PRIVATE_LIST:-$HOME/.config/keel/private-terms.txt}"
R=BeniCheni/keel
N=42
{ test -r "$F" && test -s "$F"; } || { echo "list unreadable or empty"; exit 2; }
W="$(mktemp -d)" || { echo "mktemp failed"; exit 2; }; trap 'rm -rf "$W"' EXIT
grep -v '^[[:space:]]*$' "$F" > "$W/p" || { echo "list has no patterns"; exit 2; }
head -n 1 "$W/p" > "$W/control"
c="$(grep -F -i -c -f "$W/p" "$W/control")"
[ "$c" = 1 ] || { echo "control failed"; exit 2; }
echo "control: ok"
gh pr diff $N --repo $R > "$W/diff" < /dev/null || { echo "diff fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/commits --jq '.[].commit.message' > "$W/commits" < /dev/null || { echo "commits fetch failed"; exit 2; }
gh pr view $N --repo $R --json title,body --jq '.title, .body' > "$W/title-body" < /dev/null || { echo "PR fetch failed"; exit 2; }
gh api --paginate repos/$R/issues/$N/comments --jq '.[].body' > "$W/comments" < /dev/null || { echo "comments fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/reviews --jq '.[].body' > "$W/reviews" < /dev/null || { echo "reviews fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/comments --jq '.[].body' > "$W/review-comments" < /dev/null || { echo "review comments fetch failed"; exit 2; }
gh api -H 'Accept: application/vnd.github.raw' "repos/$R/contents/docs/reviews/pr-$N-pass-0.md?ref=docs/pr-$N-records" > "$W/brief-pass-0" < /dev/null || { echo "brief fetch failed"; exit 2; }
cat > "$W/squash" <<'MSG'
docs(specs): S03.1 Decision 7, one honesty test rewritten for g12 (#42)

Amends the S03.1 spec so Cursor's build can rewrite one honesty test. g12's frozen result is unavailable by design, and the test "a live golden evaluation names its next event" required every golden case to evaluate. Decision 7 gives the test's new text: the golden cases that do not evaluate must be exactly g12, and every live evaluation still names its next event. AC9 pins the rewritten file's tree entry with git ls-tree: mode 100644, blob 6190a5eb06d34b22e075a5df5ffc1015887abbc5. No code changes.

Review: fast-track. Every commit is Claude-authored. Codex gave the cold review and seven re-reads; two attempts at the seventh stopped before posting. Owner rulings of 2026-11-14: "Rewrite that test (Recommended)" and "One last read (Recommended)". Under the second, three Medium findings in the PR body's proof scripts stay open, for the records; Decision 7 and AC9 have none. Reviewed head 3e32f47b016b894153f07a74bf66a9c8f98e2c07.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
MSG
echo "comments on PR #$N now: $(gh api repos/$R/issues/$N --jq .comments < /dev/null)"
status=0
for s in diff commits title-body comments reviews review-comments brief-pass-0 squash; do
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

#### `merge-42.sh`, the merge commands as given to Beni (PR #42 is merged, so they now fail) (`ae9ee12ce0d8c5f603b732c8657a38d2c8bfb1e827f4e83848f333cd0a57245a`)

```sh
gh pr ready 42 --repo BeniCheni/keel
gh pr merge 42 --repo BeniCheni/keel --squash --match-head-commit 3e32f47b016b894153f07a74bf66a9c8f98e2c07 --subject "docs(specs): S03.1 Decision 7, one honesty test rewritten for g12 (#42)" --body-file - <<'EOF'
Amends the S03.1 spec so Cursor's build can rewrite one honesty test. g12's frozen result is unavailable by design, and the test "a live golden evaluation names its next event" required every golden case to evaluate. Decision 7 gives the test's new text: the golden cases that do not evaluate must be exactly g12, and every live evaluation still names its next event. AC9 pins the rewritten file's tree entry with git ls-tree: mode 100644, blob 6190a5eb06d34b22e075a5df5ffc1015887abbc5. No code changes.

Review: fast-track. Every commit is Claude-authored. Codex gave the cold review and seven re-reads; two attempts at the seventh stopped before posting. Owner rulings of 2026-11-14: "Rewrite that test (Recommended)" and "One last read (Recommended)". Under the second, three Medium findings in the PR body's proof scripts stay open, for the records; Decision 7 and AC9 have none. Reviewed head 3e32f47b016b894153f07a74bf66a9c8f98e2c07.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
EOF
```

#### `post-merge-42.sh`, the post-merge checks (`0e401029ebd223b40b3269d32acd8d76f6db5d35ace9764bf6fbf29aaac7cfc2`)

```sh
#!/bin/bash
# Post-merge checks for PR #42, in a fresh clone of main. The base moved during review (883bdd1 -> 9a1fff0),
# so the checks compare the squash with its own parent and with the reviewed head's spec, not tree to tree.
SP=/private/tmp/claude-501/-Users-benicheni-code-keel-pm/e156256f-23a2-45f7-ac1d-b6f35ecbdc13/scratchpad
D=$SP/post-merge-42
SQ=0fda80f1bf02ec8a551491608fcc2cf3e70f598a
HEAD_SHA=3e32f47b016b894153f07a74bf66a9c8f98e2c07
PARENT=9a1fff0a656051757518e1466544d9004e95ae8e
S=docs/specs/s03.1-reference-k.md
if [ -e "$D" ]; then echo "exists: $D"; exit 2; fi
export KEEL_DATA_DIR="$(mktemp -d)"
gh repo clone BeniCheni/keel "$D" -- -q < /dev/null || { echo "clone failed"; exit 3; }
cd "$D" || exit 3
git fetch -q origin pull/42/head:pr42-head || { echo "fetch head failed"; exit 3; }
echo "origin/main      $(git rev-parse origin/main)"
echo "parents          $(git show -s --format=%P $SQ)"
echo "pr head ref      $(git rev-parse pr42-head)"
echo "files vs parent  $(git diff --name-only $PARENT $SQ | tr '\n' ' ')"
git diff --quiet $HEAD_SHA $SQ -- $S; echo "spec equals reviewed head's: exit $?"
git diff --quiet $PARENT $SQ -- . ":(exclude)$S"; echo "nothing else changed vs parent: exit $?"
echo "base of review   $(git merge-base $PARENT $HEAD_SHA)"
git diff --quiet $(git merge-base $PARENT $HEAD_SHA) $PARENT -- $S; echo "parent did not touch the spec since the review base: exit $?"
echo "tags at squash   [$(git tag --points-at $SQ | tr '\n' ' ')]"
echo "branch on origin [$(git ls-remote --heads origin docs/s03.1-honesty-rewrite)]"
echo "author           $(git log -1 --format='%an' $SQ) (GitHub squash)"
echo "committer        $(git log -1 --format='%cn <%ce> %cI' $SQ)"
git log -1 --format=%B $SQ > $SP/squash-msg-42-merged.txt
echo "--- trailers"
git log -1 --format='%(trailers:key=Co-authored-by)' $SQ
echo "--- authors on the PR"
git log --format='%an <%ae>' $(git merge-base $PARENT $HEAD_SHA)..$HEAD_SHA | sort | uniq -c
echo "--- AC9's pinned blob is not yet on main (the rewrite lands in the S03.1 build)"
echo "ls-tree on main  $(git ls-tree $SQ -- packages/plugin-mln/src/payoff.honesty.test.ts | cut -f1)"
for v in 24.22.2 26.13.0; do
  echo "== node v$v"
  ( export PATH="$HOME/.nvm/versions/node/v$v/bin:$PATH"; echo "node $(node -v)";
    pnpm install --frozen-lockfile > $SP/pm42-install-v$v.log 2>&1; echo "install exit $?"
    pnpm verify > $SP/pm42-verify-v$v.log 2>&1; echo "verify exit $?"
    grep -E '^\s+Tests\s' $SP/pm42-verify-v$v.log | sed 's/\x1b\[[0-9;]*m//g'
    echo "status lines: $(git status --porcelain --untracked-files=all | wc -l | tr -d ' ')" )
done
echo "KEEL_DATA_DIR entries: $(ls -A "$KEEL_DATA_DIR" | wc -l | tr -d ' ')"
```
