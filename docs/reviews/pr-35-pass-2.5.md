# Executive brief: PR #35, Pass 2.5, 2026-11-11 America/New_York

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim.

## Decision

Shadow mode: the gate says **would escalate**, because `AGENTS.md` is a sensitive path and Beni merges those. Every other clause holds. The verdict is mergeable, with no High or Medium.

PR comment: [issuecomment-6811527490](https://github.com/BeniCheni/keel/pull/35#issuecomment-6811527490). I pushed nothing, merged nothing, and the PR is still a draft.

## What ships

- `AGENTS.md` names Fable 5.2 for the two Claude review seats on sensitive-path PRs: Pass 1 on Extra and Pass 2.5 on High.
- The fallbacks (Opus 5.5 High) and Codex's pin do not change.
- The version now lives only in the seats table. The two rule sentences say "Fable pins" and "Fable seats", and still bind the same seats to synthetic data and a fresh clone.
- `CHANGELOG.md` records the move under Unreleased, Changed.
- keel itself does nothing new. PR #34's branch keeps the old text and runs under the ruling in its own briefs.

## What the passes found

- **Pass 1 (Codex):** mergeable, one Low. The PR body overstated when a seat stops and how an open PR picks up the new pins.
- **Pass 1.5 (PM):** accepted the Low and reworded the body.
- **Pass 2 (Codex):** accepted, Low closed, nothing new. One timing sentence was reworded during the pass. Pass M is N/A.
- **Pass 2.5 corroboration:**
  - The Low is closed. The body's stop is now conditional, and PR #34's branch at `902a9ec` still has Fable 5.1 on lines 19, 21, 29 and 50.
  - "Before the substantive read" appears once in PR #34's Pass 2 comment; "before running anything" appears 0 times.
  - The word diff of `AGENTS.md` shows only the five `5.1` tokens and the date clause changing.
  - No spec names Fable 5.1. Outside `docs/reviews/**`, the only hit is the new changelog line.
  - No new finding. No Codex commit exists, so I gave no cold read.
- **Contested:** nothing.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Head | `gh pr view 35 --repo BeniCheni/keel --json headRefOid`; `git rev-parse HEAD` | Both `20da0de081ef72d1033136c582204f55daeed434`; base `58845e2` is still `origin/main` |
| Authorship | `git log --format='%h %an <%ae>' origin/main..HEAD` | 1 commit, `Claude <noreply@anthropic.com>` |
| Install | `pnpm install --frozen-lockfile` after `git clean -xdfq` | Exit 0 on Node v24.22.2 and v26.13.0 |
| Verify | `pnpm verify` | Exit 0 on both; 8 `ok` lines each; core 154 of 154 in 16 files; tooling 122 of 122 in 10 files |
| Quickstart | `quickstart_rest.sh` (below) | 15 commands exit 0 on each Node; the no-match filter exits 1, as the README says |
| Determinism | The skill's `fixtures:regen` and `git status` command | Exit 0 on both |
| Zero network | `pnpm verify:network` | Exit 0 on both (macOS in-process guard) |
| Body claims 1 to 8 | Each command as the body gives it | All reproduce: 2 files, 6 insertions, 5 deletions; 4 then none; 2; 0 and 2; exit 0; green; no hits; `SKILL.md:46` only |
| Body edits | `body_edits.py` from the Pass 1.5 brief, over `userContentEdits` | 3 revisions (`totalCount` 3); latest equals live body; each edit 2 removed, 5 added |
| Tripwire, checkout | `node tools/tripwire/cli.mjs .` | Exit 0; 206 tracked files and 1 commit message |
| Tripwire, PR text | `pr_text_tripwire.sh` (below) | Exit 0 over title, body, two comments and my comment; control gave exactly 1 email hit |
| CI | `gh run view 43123354970 --json headSha,conclusion,jobs` | Success at the head: four cells and `verify` |
| CI evidence | `pnpm test:ci-evidence -- --success-run 43123354970 --failure-run 41113925991` | `ci-evidence ok`, exit 0; the failure run is my pick, the S00 red probe |
| Mutations | N/A | The diff changes no code, test or fixture |
| Pass M | N/A | No engine or golden fixture |
| UI matrix | N/A | No UI |
| Demo mode | N/A, not green | `grep -c -i demo README.md` prints 0; idea 50 |

Tripwire counts per class, in both scans: cusip 0, account 0, ssn 0, address 0, email 0, price 0, allowlist 0, vendors 0, local-only 0, unscannable 0.

Not re-run, and why:

- **Beni's two rulings.** Given in the PM's session; see the questions.
- **Private-list check.** Codex's claim is 0 matching lines at Passes 1 and 2. I did not run it, by instruction.
- **Codex's model and effort** (`gpt-6.1-sol`, `xhigh`). Codex's claim.
- **Linux network-namespace probe.** It ran only in CI's ubuntu cells.

## Estimates and model output

None.

## Risks and accepted costs

- **The pin is circular.** This pass ran on Fable 5.2 at effort high (read from session metadata), while `main` still names Fable 5.1 High. It rests on your ruling, which I could not see. If the answer to question 1 is no, this pass needs re-running on another seat.
- **PR #34 keeps the old text.** Its seats read Fable 5.1 from their branch after this merges and rely on ruling 3 in their briefs.
- **If `main` moves before the merge**, the tree check in the handoff will not match. Then `verify` must run green on the squash commit.
- **Setup differed from the skill in place only.** The clone is in the folder you made, not `/tmp/keel-pr-35`. It was empty and the clone is fresh.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes |
| Verdict mergeable, every High closed | Yes; no High was raised |
| Nothing contested | Yes |
| `verify` green at tip; every number re-run | Yes, except the items listed as not re-run |
| No sensitive path, dependency or schema change | **No**: `AGENTS.md` |
| Every commit cold-read by a non-author vendor | Yes: `20da0de` (Claude) by Codex, Pass 1 |
| Gate verdict | **would escalate** |
| Beni's decision (filled after) | Merged on 2026-11-11 at 20:36 EST at squash `9d74d05`, after answering "Yes" to both questions |

## Questions for Beni

1. Is Fable 5.2 High the pin for this pass, by your standing ruling of 17:39 EST? (Yes/No)
2. Did you answer "Yes, open it" at 18:52 EST to opening this PR? (Yes/No)

## Handoff block

Trailers checked: the author is `Claude <noreply@anthropic.com>` from the reviewed clone's `git log`. Codex gave Passes 1 and 2 per the two review comments, written with its hard rule 10 identity. Marking the PR ready starts no new CI run, because `verify.yml` triggers on plain `pull_request`.

```bash
gh pr ready 35 --repo BeniCheni/keel
gh pr merge 35 --repo BeniCheni/keel --squash --match-head-commit 20da0de081ef72d1033136c582204f55daeed434 --subject "docs(agents): move the Fable pins to Fable 5.2 (#35)" --body "AGENTS.md moves the two Fable pins from Fable 5.1 to Fable 5.2: Pass 1 runs on Fable 5.2 Extra and Pass 2.5 on Fable 5.2 High on sensitive-path PRs, by Beni's ruling of 2026-11-11. The fallbacks (Opus 5.5 High) and Codex's pin are unchanged, and the Fable rules on synthetic data and fresh clones still apply. CHANGELOG.md records the change under Unreleased.

Review: the one commit is Claude-authored. Codex gave Pass 1 (one Low, closed in the PR body) and Pass 2, and a fresh Claude session gave Pass 2.5 at 20da0de. AGENTS.md is a sensitive path, so the shadow gate said would escalate and Beni merges.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>"
# then, in your main checkout:
git switch main && git pull --ff-only
gh pr view 35 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid   # must equal the next line
git rev-parse origin/main
git rev-parse 'origin/main^{tree}'   # 25bca70d7160ee645ba45375044f19f18afd1d04 if main did not move
pnpm install --frozen-lockfile
pnpm verify
# demo mode: N/A, the README has no demo step (idea 50); not a green check
```

## Scripts these numbers rest on

`body_edits.py` is the fenced Python block in `docs/reviews/pr-35-pass-1.5.md` at `c471655`. I extracted it verbatim with `awk` and ran it with `python3 -I`.

`run_node.sh <node version> <log dir>`:

```zsh
V="$1"; S="$2"
cd /Users/benicheni/code/keel-pr-35-p25 || exit 2
export KEEL_DATA_DIR=<the one mktemp -d from setup>
export PATH="$HOME/.nvm/versions/node/v$V/bin:$PATH"
git clean -xdfq; echo "clean exit: $?"
echo "HEAD: $(git rev-parse HEAD)"; echo "node: $(node --version)  pnpm: $(pnpm --version)"
pnpm install --frozen-lockfile > "$S/install-$V.log" 2>&1; echo "install exit: $?"
echo "pnpm exec node: $(pnpm exec node --version)"
pnpm verify > "$S/verify-$V.log" 2>&1; echo "verify exit: $?"
echo "verify ok lines: $(grep -c '^verify:.* ok$' "$S/verify-$V.log")"
echo "verify lines not ok: $(grep '^verify:' "$S/verify-$V.log" | grep -vc ' ok$')"
echo "worktree status lines: $(git status --porcelain --untracked-files=all | wc -l | tr -d ' ')"
echo "KEEL_DATA_DIR entries: $(ls -A "$KEEL_DATA_DIR" | wc -l | tr -d ' ')"
```

Test counts came from `grep -nE 'Test Files|Tests ' verify-<V>.log`.

`quickstart_rest.sh <node version> <log dir>` (same `cd`, `KEEL_DATA_DIR` and `PATH` lines as above):

```zsh
L="$S/quickstart-$V.log"; : > "$L"
run() { echo "### $*" >> "$L"; "$@" >> "$L" 2>&1; echo "exit $? : $*"; }
for step in typecheck tests tooling tripwire network determinism copy boundaries; do run pnpm verify:$step; done
run pnpm --filter @keel/core test
run pnpm --filter @keel/core test honesty
run pnpm --filter @keel/core test zz-no-such-file-zz
run pnpm test:tooling
run pnpm test:tooling -- tripwire
run pnpm fixtures:regen
run pnpm -s fixtures:trees
pnpm fixtures:regen >> "$L" 2>&1 && sh -c 'keel_generated_trees="$(pnpm -s fixtures:trees)" && keel_generated_status="$(printf "%s\n" "$keel_generated_trees" | while IFS= read -r keel_generated_tree; do git status --porcelain --untracked-files=all -- "$keel_generated_tree" || exit; done)" && test -z "$keel_generated_status"'; echo "exit $? : skill determinism check"
```

`pr_text_tripwire.sh <work dir> [draft files...]`:

```zsh
S="$1"; shift
CLONE=/Users/benicheni/code/keel-pr-35-p25
export PATH="$HOME/.nvm/versions/node/v24.22.2/bin:$PATH"
T="$(mktemp -d "$S/prtext.XXXXXX")" || exit 2
cd "$T" && git init -q . || exit 2
mkdir -p tools/tripwire pr
cp "$CLONE/tools/tripwire/allowlist.txt" "$CLONE/tools/tripwire/vendors.txt" tools/tripwire/ || exit 2
gh pr view 35 --repo BeniCheni/keel --json title --jq .title > pr/title.txt || exit 2
gh pr view 35 --repo BeniCheni/keel --json body --jq .body > pr/body.md || exit 2
for ep in issues/35/comments pulls/35/comments pulls/35/reviews; do
  gh api --paginate "repos/BeniCheni/keel/$ep" --jq '.[].body' > "pr/$(echo $ep | tr / _).md" || exit 2
done
n=0; for f in "$@"; do n=$((n+1)); cp "$f" "pr/draft-$n.md" || exit 2; done
git add -A && git -c user.name=scan -c user.email=noreply@example.invalid commit -qm scan && git update-ref refs/remotes/origin/main HEAD || exit 2
node "$CLONE/tools/tripwire/cli.mjs" . > "$T.out" 2> "$T.err"; echo "tripwire exit on PR text: $?"
for c in cusip account ssn address email price allowlist vendors local-only unscannable; do echo "  $c: $(cut -f1 "$T.out" | grep -cx -- "$c")"; done
printf 'control %s@%s\n' "tripwire-control" "example.com" > pr/control.txt
git add -A
node "$CLONE/tools/tripwire/cli.mjs" . > "$T.ctl" 2>/dev/null; echo "control exit: $? ; control hits: $(cut -f1,2 "$T.ctl" | sort | uniq -c | tr '\n' ';')"
```

The checkout scan used the same per-class tally over `node tools/tripwire/cli.mjs .` output.

## Records note (PM, 2026-11-11)

Written by the PM for the records PR, after the merge. Everything above is the seat's chat message, read as data from its session transcript. The PM changed one line, the gate log's last row.

- **The two questions.** The PM put them to Beni word for word in the PM's session, and he answered both at 20:33 EST:
  - "Yes" to "Is Fable 5.2 High the pin for this pass, by your standing ruling of 17:39 EST? (Yes/No)".
  - "Yes" to "Did you answer "Yes, open it" at 18:52 EST to opening this PR? (Yes/No)".
- **The handoff.** Beni ran only the two GitHub commands, `gh pr ready 35` and the pinned `gh pr merge`. The PM ran the block's local-checkout steps in a fresh clone after the merge.
- **The merge.** Beni merged at 20:36 EST (`2026-11-12T01:36:20Z`): squash `9d74d05302910cdde211def5cb255468674a174c`, parent `58845e25f8ebaa65527678aa7d98f8edea515bf0`. The base had not moved, so the tree, `25bca70d7160ee645ba45375044f19f18afd1d04`, equals the reviewed head's. The squash message equals the handoff block's, with trailers Claude and Codex. The branch `docs/fable-5-2-pins` is deleted.
- **The post-merge checks.** In a fresh clone at `9d74d05`, `pnpm install --frozen-lockfile` and `pnpm verify` exited 0 on Node 24.22.2 and 26.13.0: 154 core and 122 tooling tests, eight steps ok, and a clean tree afterwards. Push run 43135647271 succeeded on `9d74d05`, with all four cells and `verify`. `AGENTS.md` on `main` now names Fable 5.2 on two lines, the two Claude seat rows.
- **A gap in the PM's handoff.** This seat's PR comment, issuecomment-6811527490, was posted after Codex's last private-list scan. The PM's handoff did not ask for another scan, so this PR merged with that comment unscanned. PR #34's Pass 2.5 flagged the same gap for its own comment. Beni's scan before PR #34's merge covered this PR as well, every surface plus its squash message, and he reported "Yes, all zero" at 21:06 EST. So the gap closed only after this merge. PR #34's records note has the script.
- **PR #34.** Its branch kept Fable 5.1 and ran under its own rulings. It merged next, at 20:49 EST, as `3804dc3`, on top of this squash.
