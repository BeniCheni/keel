# Executive brief: PR #38, Pass 2.5, 2026-11-13 (America/New_York)

Every number below comes from a command run in this session at `fd4fd79cc4769f310afc23f91f6458fb7544f393`. A number taken from a PR body or comment is labelled as that vendor's claim.

Seat: Claude, fresh session, `claude-fable-5-2` at effort `high` (read from the session's metadata), no fallback. The clone is fresh, in the folder you made empty. `KEEL_DATA_DIR` was one empty `mktemp -d`, still empty after the runs. I pushed nothing, merged nothing, and the PR is still a draft.

## Decision

Shadow mode: the gate says **would escalate**. Three sensitive paths are touched, and by your ruling today one fix lands in this PR before merge, so the head will move. You merge.

Do not merge at `fd4fd79`. The review verdict is "mergeable after fixes": no High is open, and the one owed fix is Codex amending `tools/reference/payoff.py`. That commit then needs a cold read from a fresh Claude session and a Pass 2.5 re-run at the new head.

PR comment: https://github.com/BeniCheni/keel/pull/38#issuecomment-6862990658

## What ships

- keel can now say, from a note's terms and dated closes alone, whether it has been called, has had its final payoff fixed, has matured or is still live.
- It states what the terms pay in each case, in whole cents per $1,000 of principal, and shows its working: each underlying's close, sources and ratio, the worst performer, and the outcome on every observation date.
- It reports how far the worst underlying sits from the call level and the barrier.
- It still declines to give a value of the note or of a holding, or a status on a date that is only an estimate.
- It answers "unknown" when a close is missing, two sources disagree, or the final valuation date is not known. Compound accrual, daily and continuous barriers, and physical delivery return "unsupported".

## What the passes found

- **Pass 1 (Claude Code):** 14 findings, three High.
  - Finding 1: `live` for ever under a conflicting final valuation date. Left open for your ruling.
  - Finding 2: a purity rule that could not fail. Fixed in `0f9d20d`.
  - Finding 3: eight surviving boundary mutants. Fixed in `758d482`.
  - The other 11 are Medium or Low; six more commits closed what reproduced.
- **Pass 2 (Codex):** accepted all 14 and contested none. Its own four:
  - Finding 1, High: Pass 1's finding 1, fixed under ruling A in `f24e2f3`.
  - Finding 2, Medium: the slot search gave up past year 9999. Fixed in `f24e2f3`.
  - Finding 3, Medium: the generator never redrew a rejected value. Fixed in `f24e2f3`.
  - Finding 4, High: the reference dropped slots in year 10000. Fixed in `fd4fd79` after ruling C.
  - Pass M as Codex reported it: 11 cases, 0 disagreements.
- **Pass 2.5 corroboration:** every figure in the PM's "re-runs at `fd4fd79`" table reproduced, including the three after-Pass-2 mutants with the same failing tests. Nothing was killed as unreproducible.
- **Pass 2.5's own findings:**

| # | Severity | Finding | Status |
| --- | --- | --- | --- |
| 1 | High until you adjudicate (the skill's Pass M rule, as Pass 2 read the year-9999 case) | Off the golden cases, the engine and the reference count `k` differently when a listed item is dated after a known final valuation date and no item is dated on it. The engine leaves the item out (`events.ts:139`); the reference counts it (`payoff.py:199-206`). Both return `unavailable` and no payout; only the reason list differs | Adjudicated: the engine stands. Fix owed in this PR |
| 2 | Closure of Pass 2's finding 4 | `fd4fd79`'s test guards the engine, not the reference. With `payoff.py` set back to `3e48b83`, `pnpm verify` exits 0 (511 passed) and Pass M prints 11 `agree` | Closed by your word |
| 3 | Medium, surviving mutant off a boundary | Nothing fails when `pushClose` stops refusing a rejected fixed close (`generate.mjs:283-285`, new in `f24e2f3`) | Open. It can ride with Codex's commit, or the PM carries it |
| 4 | Low | A generator row with `worstTicker`, `seedBelow: true` and no `missing` would now silently get no close for its worst member (`generate.mjs:350`). No case has that shape | Not fixed |
| 5 | Low | The engine's `nearestSlot` now uses the reference's three-candidate search, and Codex wrote both, so Pass M no longer checks slot mapping independently | Covered here by an oracle that is not committed |
| 6 | Low, docs | `AGENTS.md`'s Seats table names this seat "Claude, fresh session"; its Workflow table and the skill say "PM, fresh session". Your prompt followed the Seats table, so I did not stop | For the PM |

- **Contested:** no vendor contested a finding. The one disagreement between vendors' work is finding 1, on which the spec reads both ways:
  - Engine (Cursor's code, pinned by Claude's test at `payoff.evaluate.test.ts:682`): Decision 6 says `k` "counts the call events before the final valuation date".
  - Reference (Codex): Events says that with no item dated on the final valuation date, every listed item is a call event.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | Exit 0 on Node 24.22.2 and on 26.13.0 |
| Verify | `pnpm verify` (Node floor and current) | Exit 0 on each; eight steps `ok`; 511 run, 511 passed, 0 failed in 38 files (core 178 in 16, plugin 210 in 12, tooling 123 in 10); `git status` empty after |
| CI | `gh run view 43483419088 --json conclusion,headSha,attempt,jobs` | `success` at `fd4fd79`, attempt 1, four cells and `verify` |
| Determinism | `pnpm fixtures:regen && sh -c '…'` (the skill's command) | Exit 0 on both Nodes |
| Golden bytes | `git diff --quiet d052141 fd4fd79 -- fixtures/golden` | Exit 0; the dependency files likewise |
| Zero network | `pnpm verify:network` | Exit 0 on both Nodes (macOS in-process guard) |
| Pass M | `python3 tools/reference/payoff.py fixtures/golden/` | Exit 0, `cases 11, disagreements 0` |
| Pass M controls | The same on two copies | Exit 1 at `$.evaluation.payoutCents` (104250 raised to 104251); exit 1 at `$.evaluation.assumptions[4]` |
| Pass M, my controls | 10 case folders; a missing `input.json` | Exit 1; exit 2 |
| Ruling C's case | `probes.mjs`, `probes.py` | Engine and reference both: one call, 6 months, 104250; final 7 months, 104958 |
| Slot rewrite | `slots.mjs`, brute-force oracle | 476,500 comparisons, 0 mismatches, on both Nodes; reference against the oracle: 120,000, 0 mismatches |
| Engine against reference, off golden | `diff-gen.mjs`, `diff-ref.py` | 12,000 seeded cases, 36,000 results: 35,195 equal, 805 different, all finding 1; the engine threw 0 times |
| Mutations | `mutants.py`, both Nodes, identical results | 41 text mutants: 39 killed, 1 equivalent, 1 survivor (finding 3); the planted `src/x.js` fails 3 of 81 |
| README quickstart | `quickstart.sh`, Node 26.13.0 | 18 commands; 17 exit 0, and the no-match filter exits 1 as the README says |
| Tripwire | `scanRepo`, counted per class | 0 in each of 10 classes over 277 tracked files and 12 commit messages, over the PR's title, body and two comments, and over my comment before posting; a planted token gives `cusip` 1, exit 1 |
| UI matrix | n/a | N/A: no UI |

The Highs, each as one exact edit against the plugin suite:

| High | Closes? | Evidence |
| --- | --- | --- |
| PR #32's 13 | Yes | 17 mutants (the PR body's 14, three of mine), 17 killed by the named closing tests |
| Pass 1 finding 1 and Pass 2 finding 1 | Yes, under Severity | Run-out set back to `live`: 3 of 210 fail |
| Pass 1 finding 2 | Yes | The planted file, above |
| Pass 1 finding 3 | Yes | Eight boundary mutants, 8 killed |
| Pass 2 finding 4 | Yes, by ruling C and your word | Finding 2 above |

Not re-run, and why:
- **The private-list check.** It is Codex's, and a Fable seat never opens that file. Codex's claim: 0 on every surface. It has not run on my comment.
- **Demo mode.** N/A, not green: `grep -c -i demo README.md` prints 0, the known gap of idea 50.
- **Pass 1's 124 mutants and Pass 2's full replay.** I ran 41, chosen to cover every High and the code Codex wrote.
- **The Linux network namespace.** It runs only in CI; I cite the green run.

## Estimates and model output

None. No figure in this PR comes from a model. Each result names the conventions keel applies in its `assumptions`.

## Risks and accepted costs

- **A payout is not a value.** It is what the terms pay per $1,000 of principal, which the spec reads as outside hard rule 3. Your merge confirms that reading.
- **The reference is only checked on 11 cases.** No committed test runs it off the golden set. Both of its defects found so far, the year-10000 slots and `k`, were found by ad hoc comparison.
- **Ruling A's cost.** Under a conflicting final valuation date, the status turns `unknown` on the last listed call date, before either candidate date has passed.
- **Hand-built terms may throw.** The loader refuses them, and the input contract is not yet in the spec.
- **The spec lags the rulings.** A, B, C, check 2's order and today's `k` ruling go in the next docs PR. The README quickstart does not name the plugin's tests.
- **The PR body is stale.** It still gives the builder's counts at `e29d9ff` (172 plugin tests, 63 files).

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes |
| Verdict mergeable, every High closed | No at `fd4fd79`: every High is closed, but the verdict is "mergeable after fixes" and the fix you ruled into this PR is not in yet |
| Nothing contested | Yes, since your ruling on `k` |
| `verify` green at tip; every number re-run | Yes at `fd4fd79` |
| No sensitive path, dependency or schema change | No: three sensitive paths. No dependency, no schema change |
| Every commit cold-read by a non-author vendor | Yes for the 12 commits at `fd4fd79`; the owed commit will need one |
| Gate verdict | would escalate |
| Beni's decision (filled after) | Merged at `fd4fd79` as `67a1d92` at 14:58 EST, before the fix he had ruled into this PR, after running the held handoff block by mistake; at 15:07 EST he ruled "Follow-up PR" (filled by the PM) |

## Questions for Beni

All four were answered in this session at 14:35 EST:

1. Rulings as the briefs record them (check 2's order, the picker, A, B, C): **"Yes"**.
2. Does a listed item dated after the final valuation date count toward `k`: **"No (Recommended)"**. The engine stands.
3. Where the reference gets fixed: **"In this PR (Recommended)"**.
4. Does ruling C plus the recorded comparison close Pass 2's finding 4: **"Yes (Recommended)"**.

Nothing else is open for you. For the PM: Codex's fix is one condition in `observation_events`, after which `after-final.py` should print `equal: True True`.

## Handoff block

Held. It pins `fd4fd79`, so it fails by design once Codex's commit lands; the next Pass 2.5 reissues it with the new SHA and counts.

```sh
# HOLD: do not run at fd4fd79. Beni ruled on 2026-11-13 that the reference fix lands in this PR first.
gh pr ready 38 --repo BeniCheni/keel
gh pr merge 38 --repo BeniCheni/keel --squash --match-head-commit fd4fd79cc4769f310afc23f91f6458fb7544f393 --subject "feat(plugin-mln): payoff engine for a worst-of autocall (#38)" --body-file - <<'MSG'
Adds @keel/plugin-mln, slice S03. evaluateNote, payoutSchedule, finalPayout and noteMetrics work from the terms and dated closes alone, in exact fractions, and pay integer cents per $1,000 of principal. A status rests only on evidenced dates. A missing or conflicting close, a planning date, or a final valuation date that is not known gives unknown, never a guess. Compound accrual, daily-close and continuous barriers, and physical delivery return unsupported. Eleven golden cases are generated by seed under fixtures/golden, and tools/reference/payoff.py recomputes each from its input alone (Pass M).

Review: Cursor built e29d9ff. Pass 1 (Claude Code) found three Highs and pushed eight commits. Pass 2 (Codex) wrote the Pass M reference, fixed the run-out under ruling A and amended the reference under ruling C. Pass 2.5 (Claude) cold-read Codex's three commits at fd4fd79cc4769f310afc23f91f6458fb7544f393: verify exits 0 on Node 24.22.2 and 26.13.0 with 511 tests passed, and Pass M prints 11 cases and 0 disagreements. Sensitive paths: packages/plugin-mln, fixtures/golden, tools/reference. Beni merges.

Co-authored-by: Cursor <cursoragent@cursor.com>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
MSG
git pull
gh pr view 38 --repo BeniCheni/keel --json mergeCommit -q .mergeCommit.oid
git rev-parse origin/main            # must equal the line above
git rev-parse 'origin/main^{tree}'   # c4ab7e7377f63a0093cc32709209d150f3022046 while the base stays at 9f0745f
pnpm install --frozen-lockfile
pnpm verify
# Demo mode: N/A while the README has no demo step (idea 50). Never report it as green.
```

The trailers match `git log --format='%an <%ae>' origin/main..HEAD` (8 Claude, 3 Codex, 1 Cursor) and the three review comments. No records cold read was given on this PR.

## Scripts

All 13 scripts are attached above, because the clone may not outlive the pass. The reproducer for finding 1 (`after-final.mjs`, `after-final.py`) is also printed in the PR comment. The shortest one, which the tripwire counts rest on:

```js
// Counts tripwire hits per class. Never prints a matched value, a line or a path.
// usage: node tripwire-count.mjs <clone> <repo to scan>
const { scanRepo } = await import(`${process.argv[2]}/tools/tripwire/scan.mjs`);
const result = scanRepo(process.argv[3]);
if (result.error) { console.log(`scan error: ${result.error}`); process.exit(2); }
const classes = ["cusip", "account", "ssn", "address", "email", "price", "local-only", "unscannable", "allowlist", "vendors"];
const counts = Object.fromEntries(classes.map((name) => [name, 0]));
for (const hit of result.hits) counts[hit.class] = (counts[hit.class] ?? 0) + 1;
console.log(JSON.stringify(counts), "total", result.hits.length);
process.exit(result.hits.length === 0 ? 0 : 1);
```

## Records note (PM, 2026-11-13)

Written by the PM after the merge. Everything above this heading is the seat's chat message of 14:38:47 EST, read as data from its session transcript `8f1c493b-89c6-4983-821d-3f7e9d4ab6be` (`p25-turns.py` in the appendix prints the questions and answers). The PM changed one line, the gate log's last row. The brief says its 13 scripts are "attached above". The seat sent them to Beni as files at 14:37:55 EST, and the appendix prints them byte for byte with their SHA-256. A fork of the session, `2cebb710`, opened at 15:15 EST and answered only where to paste the seat's note to the PM.

- **The four questions.** The seat asked them at 14:11:48 EST, and the transcript records Beni's answers at 14:34:49 EST, in the order the brief lists them: "Yes", "No (Recommended)", "In this PR (Recommended)" and "Yes (Recommended)". He confirmed them in writing at 14:54:39 EST: "1. Yes! 2. No! 3. In this PR! 4. Yes!".
- **The merge.** GitHub records the merge at 14:58:14 EST (`2026-11-13T19:58:14Z`), merged by `BeniCheni`, as squash `67a1d92ad98561578f8f4b14efe2088e8a17e6cc` (`gh pr view 38 --json mergedAt,mergedBy,mergeCommit`).
  - At 14:59:56 EST Beni wrote in the seat's session, under a quote of the brief's "Held" line: "I misunderstood and ran your handoff block, without being aware of our next Pass 2.5. What do we do now?"
  - The seat answered at 15:00:58 EST. It recommended leaving the merge in place and fixing the reference in a follow-up PR.
  - At 15:07:27 EST Beni answered "Follow-up PR". That supersedes "In this PR (Recommended)", which the merge had made impossible to meet.
- **For the gate-activation record.**
  - Shadow verdict: "would escalate".
  - Review verdict: "mergeable after fixes", with one fix owed: Codex's amendment to the `k` rule in `tools/reference/payoff.py`.
  - Beni's decision: he merged at the reviewed head before the owed fix, then ruled "Follow-up PR". He ran a block the brief marked as held by mistake, so the merge shows no ruling that the fix was not needed.
- **Why the held block ran.** The PM's Pass 2.5 prompt asked the seat for a handoff block holding the merge command, and did not say what to do when the gate holds. The seat printed the pinned commands with a `# HOLD` comment as their first line. The block also had no private-list scan. Until now that scan has come from the PM after it checks the brief, and this time it never got that far. From now on, the PM's Pass 2.5 prompts tell the seat to print no runnable merge command unless it would merge, and Beni merges only from the PM's handoff.
- **Post-merge checks.** The PM ran these in a fresh clone of `main` (`post-merge.sh` in the appendix), with `KEEL_DATA_DIR` set to one empty `mktemp -d` (0 entries after the runs):
  - `git rev-parse origin/main` prints `67a1d92ad98561578f8f4b14efe2088e8a17e6cc`. Its one parent is `9f0745f7fd1431f07450d43c4f4b93fea21cb603`, which is also `git merge-base 9f0745f fd4fd79`, so the base did not move during review.
  - The tree `c4ab7e7377f63a0093cc32709209d150f3022046` equals the reviewed head's, and `git diff --quiet fd4fd79 origin/main` exits 0.
  - The squash message equals the handoff block's subject and body. `git log -1 --format='%(trailers:key=Co-authored-by)' 67a1d92` prints Cursor, Claude and Codex in full, which matches `git log --format='%an <%ae>' 9f0745f..fd4fd79` (8 Claude, 3 Codex, 1 Cursor).
  - No tag points at the squash (`git tag --points-at 67a1d92` prints nothing), as expected for a PR that is not a release.
  - The branch `s03/payoff-engine` is gone (`git ls-remote --heads origin s03/payoff-engine` prints nothing).
  - `pnpm install --frozen-lockfile` and `pnpm verify` exit 0 on Node 24.22.2 and on 26.13.0: core 178, plugin 210 and tooling 123 tests passed, and `git status --porcelain --untracked-files=all` prints nothing afterwards.
  - Push run 43497154170 on `67a1d92` succeeded on attempt 1, with all four cells and `verify` (`gh run view 43497154170 --json headSha,event,conclusion,attempt,jobs`).
  - Pass M on `main`: `python3 -I tools/reference/payoff.py fixtures/golden/` exits 0 with `cases 11, disagreements 0` (Python 3.9.6).
  - The PR body was never edited (`userContentEdits` 0). PR #38 has 0 reviews, 0 review threads and 0 inline comments.
- **Finding 1 on `main`.** The seat's reproducer (`after-final.mjs`, `after-final.py`) gives the same result on Node 24.22.2 and on 26.13.0:
  - The engine gives `unavailable` with `listed-after-final-valuation` at index 18 alone, from both `evaluateNote` and `payoutSchedule`.
  - The reference gives `unavailable` with that reason, then `final-valuation-off-cycle`.
  - The last line is `equal: False False`.

  `git blame` at `fd4fd79` shows who wrote each side: the engine's rule (`events.ts:136-141`) is Cursor's, from `e29d9ff`; the test that pins it (`payoff.evaluate.test.ts:682`) is Claude's, from `da5631e`; and the reference's lines (`payoff.py:199-206`) are Codex's, from `3e48b83`.
- **The PR thread.** At 15:28:47 EST the PM posted a correction to the Pass 2.5 comment as [issuecomment-6864069040](https://github.com/BeniCheni/keel/pull/38#issuecomment-6864069040), by Beni's "Yes, post it (Recommended)". The tripwire over its text in a scratch repository with the two policy files gave 0 in each of the ten classes, and a planted check-digit-valid token gave `cusip` 1. GitHub's copy equals the text the PM sent.
- **Privacy.** Codex's last private-list check, in its Pass 2 comment at 13:34:39 EST, covered every surface of the PR at that time. Three texts came later: the Pass 2.5 comment (14:37:12 EST), the squash message (14:58:14 EST) and the PM's correction (15:28:47 EST). The tripwire scanned the two comments before they were posted. No private-list check has covered any of the three yet. The PM gave Beni `private-scan-38.sh` (appendix), which covers every surface of PR #38 and the squash message as merged. The PM tested it against synthetic lists only: it exits 2 on a missing or empty list, 1 with a known hit, and 0 with no hit. Beni ran it after the correction was posted, and reported "Yes, all zero" at 15:40:47 EST in the PM's session. He was answering "Did the PR #38 private-list scan end with exit 0 and every line at 0?", and reported the outcome, not the counts.
- **Rulings for the follow-up.** The PM asked four questions in its own session at 15:23:00 EST, and Beni answered at 15:28:21 EST:
  - "Yes, post it (Recommended)": the correction above.
  - "S03.1 (Recommended)": the follow-up is slice S03.1, with spec `docs/specs/s03.1-<slug>.md` and build branch `s03.1/<slug>`.
  - "Codex, adjudicating (Recommended)": on S03.1, which Codex writes, Claude's Pass 1 gives the cold read of Codex's commits. Codex's Pass 2 adjudicates Pass 1, cold-reads only Pass 1's commits and runs Pass M. Any Codex fix commit gets its cold read at Pass 2.5. This mirrors AGENTS.md's rule for Claude-authored PRs. It is a ruling for S03.1; AGENTS.md has no row for it yet.
  - "One spec PR (Recommended)": the S03.1 spec goes in one spec PR with the S03 spec catch-up, under one plan challenge from Codex.
- **Where the open items go.**
  - **S03.1** is a sensitive-path slice (`tools/reference/**`): full passes, Fable pins, no fast-track, and Beni merges.
    - It owes the `k` amendment (finding 1). The reproducer above must print `equal: True True` afterwards.
    - Its spec decides whether to take the rest: a committed check of the reference off the golden cases (finding 2's gap), a test for the generator's fixed-close guard (finding 3, Medium), the silent-skip row shape (finding 4, Low), and a committed slot oracle (finding 5, Low).
  - **The S03.1 spec PR** also carries the S03 spec edits the Pass 1.5 brief listed for the next docs PR:
    - Status under ruling A;
    - the undated-item bullet under ruling B;
    - a Decision 6 sentence under ruling C;
    - the item 18 wording;
    - the Public API input contract;
    - check 2's order;
    - and one clause in Events under today's `k` ruling.
  - **The next ordinary docs PR** keeps the README quickstart and status line and the ideas the Pass 1.5 brief lists. The records PR for PR #38 writes PR #37's merge line in `docs/README.md`.
  - **Finding 6** (AGENTS.md's Seats table says "Claude, fresh session" for Pass 2.5, while its Workflow table and the skill say "PM, fresh session") changes `AGENTS.md`, a sensitive path. So it goes to an AGENTS.md PR, not the docs PR. That PR can also add a row for Pass 2 on a Codex-authored PR.

## Appendix: scripts

The seat's 13 scripts are printed as it sent them at 14:37:55 EST. The PM's scripts follow. Each heading gives the file's SHA-256 (`shasum -a 256`).

### The seat's scripts

#### `baseline.sh` (`476729dd958d0230b2d5c1e936a16f603fdf6f5698887370b072aa8ef3fa5e88`)

```sh
#!/bin/sh
# usage: baseline.sh <node-version> <logdir>
# Runs install and verify under one Node, recording each command's own exit code.
V="$1"; L="$2"
export KEEL_DATA_DIR=/var/folders/qp/8rzgt2ws02sc46cp15d67sgc0000gn/T/tmp.W9dCLGmcQt
export PATH="$HOME/.nvm/versions/node/v$V/bin:$PATH"
cd /Users/benicheni/code/keel-pr-38-p25 || exit 97
node --version > "$L/node-$V.version" 2>&1; echo "node_version_exit=$?" > "$L/exit-$V.txt"
git rev-parse HEAD >> "$L/node-$V.version"
pnpm install --frozen-lockfile > "$L/install-$V.log" 2>&1; echo "install_exit=$?" >> "$L/exit-$V.txt"
pnpm verify > "$L/verify-$V.log" 2>&1; echo "verify_exit=$?" >> "$L/exit-$V.txt"
git status --porcelain --untracked-files=all > "$L/status-$V.txt" 2>&1; echo "status_exit=$?" >> "$L/exit-$V.txt"
```

#### `passm.sh` (`6ca511f2dd1f14fb37ef1d42305e7bc7f9a4ad73cb72d255a40dde022e12edb8`)

```sh
#!/bin/sh
# Pass M at the head, the spec's two controls, and the pre-engine-read reference (3e48b83) on the same golden bytes.
# usage: passm.sh <clone> <workdir>
C="$1"; W="$2"; rm -rf "$W"; mkdir -p "$W"
cd "$C" || exit 97
echo "HEAD $(git rev-parse HEAD)"; python3 --version
echo "--- Pass M at head"
python3 -I tools/reference/payoff.py fixtures/golden/; echo "exit=$?"
echo "--- control 1: one integer +1 (g01 evaluation.payoutCents)"
cp -R fixtures/golden "$W/c1"
python3 -I - "$W/c1/g01-called-first/expected/result.json" <<'PY'
import json, sys
p = sys.argv[1]; d = json.load(open(p, encoding="utf-8"))
before = d["evaluation"]["payoutCents"]; d["evaluation"]["payoutCents"] = before + 1
open(p, "w", encoding="utf-8").write(json.dumps(d, indent=2) + "\n"); print("changed", before, "->", before + 1)
PY
python3 -I tools/reference/payoff.py "$W/c1/"; echo "exit=$?"
echo "--- control 2: one assumptions entry removed (g01 evaluation.assumptions, last)"
cp -R fixtures/golden "$W/c2"
python3 -I - "$W/c2/g01-called-first/expected/result.json" <<'PY'
import json, sys
p = sys.argv[1]; d = json.load(open(p, encoding="utf-8"))
gone = d["evaluation"]["assumptions"].pop(); open(p, "w", encoding="utf-8").write(json.dumps(d, indent=2) + "\n"); print("removed", json.dumps(gone))
PY
python3 -I tools/reference/payoff.py "$W/c2/"; echo "exit=$?"
echo "--- control 3 (mine): a case folder removed, so n is 10"
cp -R fixtures/golden "$W/c3"; rm -rf "$W/c3/g11-estimated-stop"
python3 -I tools/reference/payoff.py "$W/c3/"; echo "exit=$?"
echo "--- control 4 (mine): an input.json removed"
cp -R fixtures/golden "$W/c4"; rm "$W/c4/g05-final-fixed-par/input.json"
python3 -I tools/reference/payoff.py "$W/c4/" 2>&1; echo "exit=$?"
echo "--- the reference as first committed (3e48b83, before Codex read the engine) on the head's golden bytes"
git show 3e48b83:tools/reference/payoff.py > "$W/payoff-3e48b83.py"
python3 -I "$W/payoff-3e48b83.py" fixtures/golden/; echo "exit=$?"
echo "--- golden bytes and deps since d052141; reference authorship"
git diff --quiet d052141 fd4fd79 -- fixtures/golden; echo "golden_diff_exit=$?"
git diff --quiet d052141 fd4fd79 -- pnpm-lock.yaml package.json packages/plugin-mln/package.json; echo "deps_diff_exit=$?"
git log --format='%an' origin/main..HEAD -- tools/reference | sort | uniq -c
git status --porcelain --untracked-files=all | wc -l
```

#### `privacy.sh` (`1bbd9fb0a307af45041c36d4bdb8c7b917f704761a17d4e117e1486ed7d62dbe`)

```sh
#!/bin/sh
# Tripwire over the clone (tracked files and the 12 commit messages), then over the PR's title, body and comments
# in a throwaway repository with the two policy files, then a planted control to show the scan can fail.
# usage: privacy.sh <clone> <workdir> <node version>
C="$1"; W="$2"; export PATH="$HOME/.nvm/versions/node/v$3/bin:$PATH"
export KEEL_DATA_DIR=/var/folders/qp/8rzgt2ws02sc46cp15d67sgc0000gn/T/tmp.W9dCLGmcQt
rm -rf "$W"; mkdir -p "$W/meta/tools/tripwire" "$W/meta/pr"
cd "$C" || exit 97
node --version
echo "tracked files: $(git ls-files | wc -l | tr -d ' '); commit messages: $(git rev-list origin/main..HEAD | wc -l | tr -d ' ')"
echo "--- cli over the clone"; node tools/tripwire/cli.mjs . > "$W/cli.out" 2> "$W/cli.err"; echo "exit=$? stdout_lines=$(wc -l < "$W/cli.out" | tr -d ' ') stderr_lines=$(wc -l < "$W/cli.err" | tr -d ' ')"
echo "--- per class over the clone"; node "$(dirname "$0")/tripwire-count.mjs" "$C" "$C"; echo "exit=$?"
cp tools/tripwire/allowlist.txt tools/tripwire/vendors.txt "$W/meta/tools/tripwire/"
gh pr view 38 --repo BeniCheni/keel --json title -q .title > "$W/meta/pr/title.txt"
gh pr view 38 --repo BeniCheni/keel --json body -q .body > "$W/meta/pr/body.md"
gh api repos/BeniCheni/keel/issues/38/comments --paginate -q '.[].body' > "$W/meta/pr/issue-comments.md"
gh api repos/BeniCheni/keel/pulls/38/comments --paginate -q '.[].body' > "$W/meta/pr/inline-comments.md"
gh api repos/BeniCheni/keel/pulls/38/reviews --paginate -q '.[].body' > "$W/meta/pr/reviews.md"
echo "issue comments: $(gh api repos/BeniCheni/keel/issues/38/comments --jq length); inline: $(gh api repos/BeniCheni/keel/pulls/38/comments --jq length); reviews: $(gh api repos/BeniCheni/keel/pulls/38/reviews --jq length)"
wc -c "$W"/meta/pr/* | sed "s#$W/##"
cd "$W/meta" && git init -q -b main && git add -A && git -c user.name=Claude -c user.email=noreply@anthropic.com -c commit.gpgsign=false commit -q -m "Scan PR metadata." && git update-ref refs/remotes/origin/main HEAD
echo "--- per class over the PR title, body and comments"; node "$(dirname "$0")/tripwire-count.mjs" "$C" "$W/meta"; echo "exit=$?"
# control: a 9-character token whose last character is its CUSIP check digit, built at run time, never printed
node -e '
const { cusipCheckDigit } = await import(process.argv[1] + "/tools/tripwire/scan.mjs");
const stem = "ZZ9QQ7KK"; const token = stem + String(cusipCheckDigit(stem));
(await import("node:fs")).writeFileSync(process.argv[2] + "/pr/planted.txt", "token " + token + "\n");
' --input-type=module "$C" "$W/meta" 2>/dev/null || node --input-type=module -e '
const { cusipCheckDigit } = await import(process.argv[1] + "/tools/tripwire/scan.mjs");
const stem = "ZZ9QQ7KK"; const token = stem + String(cusipCheckDigit(stem));
(await import("node:fs")).writeFileSync(process.argv[2] + "/pr/planted.txt", "token " + token + "\n");
' "$C" "$W/meta"
git add -A && git -c user.name=Claude -c user.email=noreply@anthropic.com -c commit.gpgsign=false commit -q -m "Plant a control."
echo "--- control: a planted check-digit-valid token"; node "$(dirname "$0")/tripwire-count.mjs" "$C" "$W/meta"; echo "exit=$?"
```

#### `tripwire-count.mjs` (`3a28dc9c08f7e074c34a9b85619795f82843f3680cb6d3d3d58478295c4ef7a2`)

```js
// Counts tripwire hits per class. Never prints a matched value, a line or a path.
// usage: node tripwire-count.mjs <clone> <repo to scan>
const { scanRepo } = await import(`${process.argv[2]}/tools/tripwire/scan.mjs`);
const result = scanRepo(process.argv[3]);
if (result.error) { console.log(`scan error: ${result.error}`); process.exit(2); }
const classes = ["cusip", "account", "ssn", "address", "email", "price", "local-only", "unscannable", "allowlist", "vendors"];
const counts = Object.fromEntries(classes.map((name) => [name, 0]));
for (const hit of result.hits) counts[hit.class] = (counts[hit.class] ?? 0) + 1;
console.log(JSON.stringify(counts), "total", result.hits.length);
process.exit(result.hits.length === 0 ? 0 : 1);
```

#### `quickstart.sh` (`420180197b2808c5ef002b6ef1ba3de25a6cfdc7401f374730b2002e635456cf`)

```sh
#!/bin/sh
# The README quickstart, command by command, each exit code read on its own. Then the skill's determinism command.
# usage: quickstart.sh <clone> <node version> <logdir>
C="$1"; V="$2"; L="$3"; mkdir -p "$L"
export KEEL_DATA_DIR=/var/folders/qp/8rzgt2ws02sc46cp15d67sgc0000gn/T/tmp.W9dCLGmcQt
export PATH="$HOME/.nvm/versions/node/v$V/bin:$PATH"
cd "$C" || exit 97
echo "node $(node --version) HEAD $(git rev-parse --short HEAD)"
n=0
run() { n=$((n+1)); "$@" > "$L/q-$V-$n.log" 2>&1; code=$?; tests=$(grep -E '^ +Tests ' "$L/q-$V-$n.log" | tr -s ' ' | tr '\n' ';'); echo "[$n] exit=$code :: $* :: $tests"; }
run pnpm install --frozen-lockfile
run pnpm verify
for s in typecheck tests tooling tripwire network determinism copy boundaries; do run pnpm verify:$s; done
run pnpm --filter @keel/core test
run pnpm --filter @keel/core test schedule
run pnpm --filter @keel/core test no-such-file-zzz
run pnpm --filter @keel/plugin-mln test
run pnpm test:tooling
run pnpm test:tooling -- tripwire
run pnpm fixtures:regen
run pnpm -s fixtures:trees; cat "$L/q-$V-$n.log"
echo "--- the skill's determinism command"
pnpm fixtures:regen > "$L/q-$V-regen.log" 2>&1 && sh -c 'keel_generated_trees="$(pnpm -s fixtures:trees)" && keel_generated_status="$(printf "%s\n" "$keel_generated_trees" | while IFS= read -r keel_generated_tree; do git status --porcelain --untracked-files=all -- "$keel_generated_tree" || exit; done)" && test -z "$keel_generated_status"'; echo "determinism_exit=$?"
echo "status lines after: $(git status --porcelain --untracked-files=all | wc -l | tr -d ' ')"
echo "demo count: $(grep -c -i demo README.md)"
```

#### `mutants.py` (`0a5ceb7c0f37a848765381e2da442f1036e9f7e211c0bdd2234aaf6f81f2e27d`)

```python
# Applies one exact-string mutation at a time in a clone, runs the plugin suite, records the exit code and
# the failing test titles from vitest's JSON report, and restores the file with git checkout.
# usage: python3 -I mutants.py <clone> <node bin dir> <out.json>
import json, os, subprocess, sys, tempfile
clone, nodebin, outpath = sys.argv[1], sys.argv[2], sys.argv[3]
env = dict(os.environ, PATH=nodebin + ":" + os.environ["PATH"],
           KEEL_DATA_DIR="/var/folders/qp/8rzgt2ws02sc46cp15d67sgc0000gn/T/tmp.W9dCLGmcQt")
ENGINE = "packages/plugin-mln/src/engine.ts"; EVENTS = "packages/plugin-mln/src/events.ts"
READ = "packages/plugin-mln/src/read.ts"; GEN = "tools/generators/golden/generate.mjs"
RUNOUT = 'return evaluated(prepared, asOf, "unknown", rows, null, null, [{ code: prepared.finalState.reason }]);'
SLOT = "    const slot = addMonths(start, index * step);\n"
LOOP = "for (let index = Math.max(0, center - 1); index <= center + 1; index += 1) {"
DRAW = """  let ratio;
  const value = drawAllowed(caseId, () => {
    ratio = nextRatio();
    return closeText(initial, ratio, rounding);
  });
"""
M = [
 # PR #32's 13 Highs: the PR body's mutant for each, on the head's text
 ("H1 divide by a zero ratio", ENGINE, "const toCall = isZero(worst)", "const toCall = false && isZero(worst)"),
 ("H2 matured before maturity", ENGINE, "if (maturityOrder !== null && maturityOrder < 0)", "if (maturityOrder !== null && maturityOrder > 0)"),
 ("H2 own: final-fixed on the maturity date", ENGINE, "if (maturityOrder !== null && maturityOrder < 0)", "if (maturityOrder !== null && maturityOrder <= 0)"),
 ("H3 row on a planning date", ENGINE, "    if (!event.evidenced) {", "    if (false && !event.evidenced) {"),
 ("H3 estimate and assumed as evidence", READ, 'new Set(["primary", "document", "advisor", "user"])', 'new Set(["primary", "document", "advisor", "user", "estimate", "assumed"])'),
 ("H4 offset check disabled", EVENTS, "if (offset === null || offset !== solved.nonCall) reasons.push", "if (false) reasons.push"),
 ("H4 own: off-cycle final not reported", EVENTS, 'if (slot !== plan.k) reasons.push({ code: "final-valuation-off-cycle" });', 'if (false) reasons.push({ code: "final-valuation-off-cycle" });'),
 ("H5 live on a trailing undated item", ENGINE, 'return evaluated(prepared, asOf, "unknown", rows, null, null, [{ code: "date-unknown", index }]);', 'return evaluated(prepared, asOf, "live", rows, null, null, [{ code: "date-unknown", index }]);'),
 ("P2-1 unevidenced dates accepted", READ, 'if (DATE_PATHS.has(path) && (term.status === "estimate" || term.status === "assumed")) {', 'if (false && DATE_PATHS.has(path) && (term.status === "estimate" || term.status === "assumed")) {'),
 ("P2-2 matured on an unknown role", ENGINE, 'return evaluated(prepared, asOf, "unknown", rows, null, null, [{ code }]);', 'return evaluated(prepared, asOf, "matured", rows, null, null, [{ code }]);'),
 ("P2-3 unknown first call not reported", READ, 'reasons.push({ code: "input-unknown", path });', 'if (path !== "dates.first_call_observation") reasons.push({ code: "input-unknown", path });'),
 ("P2-4 first call on or before settlement accepted", EVENTS, "if (firstOrder !== null && firstOrder <= 0) reasons.push", "if (false) reasons.push"),
 ("R1 a later item rules a candidate in", EVENTS, 'if (entry.date !== null && beforeEveryCandidate(entry.date, finalTerm)) pushCall(fromListed(entry, "call"));', 'if (entry.date !== null) pushCall(fromListed(entry, "call"));'),
 ("R1 a later planning date counts", EVENTS, "    if (evidencedStatus(entry.term.status)) return true;", "    return true;"),
 ("R3 settlement before trade accepted", EVENTS, "if (settlementOrder !== null && settlementOrder < 0) reasons.push", "if (false) reasons.push"),
 ("R5 observation before first call accepted", EVENTS, 'if (order !== null && order < 0) pushIndexed(reasons, "observation-before-first-call", entry.index);', 'if (false) pushIndexed(reasons, "observation-before-first-call", entry.index);'),
 ("PM slot gap own: mapping skips a date rejected earlier", EVENTS, "      const slot = nearestSlot(solved.firstCall, solved.step, entry.date);\n", "      if (compareIso(entry.date, solved.firstCall) === -1) continue;\n      const slot = nearestSlot(solved.firstCall, solved.step, entry.date);\n"),
 # Pass 1 finding 3: the eight boundary mutants
 ("B-MB7 final row on the unrounded ratio", ENGINE, "settleFinal(best.rounded, best.raw,", "settleFinal(best.raw, best.raw,"),
 ("B-CH1 first call on settlement accepted", EVENTS, "firstOrder !== null && firstOrder <= 0", "firstOrder !== null && firstOrder < 0"),
 ("B-CH2 settlement on the trade date refused", EVENTS, "settlementOrder !== null && settlementOrder < 0) reasons.push", "settlementOrder !== null && settlementOrder <= 0) reasons.push"),
 ("B-CH3 final valuation on maturity refused", EVENTS, "afterMaturity !== null && afterMaturity > 0", "afterMaturity !== null && afterMaturity >= 0"),
 ("B-CH4 final valuation on the first call refused", EVENTS, "beforeFirst !== null && beforeFirst < 0", "beforeFirst !== null && beforeFirst <= 0"),
 ("B-CH6 listed item on maturity refused", EVENTS, 'if (order !== null && order > 0) pushIndexed(reasons, "listed-after-maturity", entry.index);', 'if (order !== null && order >= 0) pushIndexed(reasons, "listed-after-maturity", entry.index);'),
 ("B-DU1 undated first item before settlement", ENGINE, "if (onLast || beforeSettlement) return", "if (onLast) return"),
 ("B-DU3 undated first item on settlement", ENGINE, "settlementOrder !== null && settlementOrder <= 0;", "settlementOrder !== null && settlementOrder < 0;"),
 # After Pass 2: the brief's three
 ("Run-out returns live (ruling A reverted)", ENGINE, RUNOUT, 'return evaluated(prepared, asOf, "live", rows, null, null, []);'),
 ("Slots capped at 9999 (skip)", EVENTS, SLOT, SLOT + "    if (slot.year > 9999) continue;\n"),
 ("Old out-of-range exit (return null)", EVENTS, SLOT, SLOT + "    if (slot.year > 9999) return null;\n"),
 # Codex's two redraw controls, and mine on the same site
 ("Redraw: the same value retried", GEN, DRAW, "  const ratio = nextRatio();\n  const value = drawAllowed(caseId, () => closeText(initial, ratio, rounding));\n"),
 ("Redraw: guard bypassed", GEN, DRAW, "  const ratio = nextRatio();\n  const value = closeText(initial, ratio, rounding);\n"),
 ("Own: a rejected fixed close is not an error", GEN, "  if (seededValueRejected(close.value) !== null) {\n    throw new Error(`${caseId}: fixed close rejected`);\n  }\n", ""),
 # Mine, on the code Codex wrote in f24e2f3
 ("Own RO2: run-out reason always absent", ENGINE, RUNOUT, 'return evaluated(prepared, asOf, "unknown", rows, null, null, [{ code: "final-valuation-absent" }]);'),
 ("Own RO3: run-out keeps a payout", ENGINE, RUNOUT, 'return evaluated(prepared, asOf, "unknown", rows, null, rows.length, [{ code: prepared.finalState.reason }]);'),
 ("Own NS1: no earlier candidate slot", EVENTS, LOOP, "for (let index = center; index <= center + 1; index += 1) {"),
 ("Own NS2: no later candidate slot", EVENTS, LOOP, "for (let index = Math.max(0, center - 1); index <= center; index += 1) {"),
 ("Own NS3: a tie accepted", EVENTS, "return tied ? null : bestIndex;", "return bestIndex;"),
 ("Own NS4: a tie goes to the later slot", EVENTS, "if (distance < bestDistance) {", "if (distance <= bestDistance) {"),
 ("Own NS5: centre rounded up", EVENTS, "const center = Math.max(0, Math.floor(monthOffset / step));", "const center = Math.max(0, Math.ceil(monthOffset / step));"),
 ("Own NS6: offset measured from the trade date", EVENTS, "wholeMonthOffset(solved.settlement, solved.firstCall)", "wholeMonthOffset(solved.trade, solved.firstCall)"),
 ("Own NS7: signed distance", EVENTS, "const distance = Math.abs(serialFromCivil(slot.year, slot.month, slot.day) - targetDay);", "const distance = serialFromCivil(slot.year, slot.month, slot.day) - targetDay;"),
 ("Own NS8: slot day not clamped back to the anchor's", EVENTS, "nearestSlot(settlement, 1, target)", "nearestSlot(settlement, 3, target)"),
]
def suite(extra=()):
    report = tempfile.NamedTemporaryFile(suffix=".json", delete=False).name
    cmd = ["pnpm", "--filter", "@keel/plugin-mln", "exec", "vitest", "run", "--config", "vitest.config.mjs", *extra, "--reporter=json", "--outputFile=" + report]
    r = subprocess.run(cmd, cwd=clone, capture_output=True, text=True, env=env)
    try:
        data = json.load(open(report, encoding="utf-8"))
        failed = sorted({a["title"] for f in data["testResults"] for a in f["assertionResults"] if a["status"] == "failed"})
        res = {"exit": r.returncode, "total": data["numTotalTests"], "failed_count": data["numFailedTests"], "failed": failed}
    except Exception as error:
        res = {"exit": r.returncode, "report_error": str(error), "tail": (r.stdout + r.stderr)[-400:]}
    finally:
        if os.path.exists(report): os.remove(report)
    return res
node = subprocess.run(["node", "--version"], capture_output=True, text=True, env=env).stdout.strip()
out = [{"node": node, "head": subprocess.run(["git", "rev-parse", "HEAD"], cwd=clone, capture_output=True, text=True).stdout.strip()}]
out.append({"mutant": "none (baseline)", **suite()})
for name, rel, a, b in M:
    path = os.path.join(clone, rel)
    text = open(path, encoding="utf-8").read()
    n = text.count(a)
    if n != 1:
        out.append({"mutant": name, "error": "anchor count %d" % n}); continue
    open(path, "w", encoding="utf-8").write(text.replace(a, b))
    try:
        out.append({"mutant": name, **suite()})
    finally:
        subprocess.run(["git", "checkout", "--", rel], cwd=clone, check=True)
# Pass 1 finding 2: an impure .js file under src/ against the purity test.
plant = os.path.join(clone, "packages/plugin-mln/src/x.js")
open(plant, "w").write("export const now = Date.now();\nconsole.log(Math.random());\n")
try:
    out.append({"mutant": "Finding 2: impure src/x.js planted (purity file only)", **suite(["payoff.purity"])})
finally:
    os.remove(plant)
status = subprocess.run(["git", "status", "--porcelain", "--untracked-files=all"], cwd=clone, capture_output=True, text=True).stdout
out.append({"status_lines_after": len(status.splitlines())})
json.dump(out, open(outpath, "w"), indent=1)
for row in out:
    if "mutant" in row:
        print("%-58s exit=%s failed=%s %s" % (row["mutant"][:58], row.get("exit"), row.get("failed_count"), row.get("error", "")))
    else:
        print(row)
```

#### `slots.mjs` (`d8bbaf9c87232f4343fa3513b53e8a2525049c9186eb1abd487b2d244bfd6c60`)

```js
// The head's nearestSlot and wholeMonthOffset against a brute-force oracle that shares no code with them.
// The oracle walks every slot j >= 0 with Date.UTC, keeps the least distance in days, and returns null on a tie.
// usage: node slots.mjs <clone>
const e = await import(`${process.argv[2]}/packages/plugin-mln/src/events.ts`);
const DAY = 86400000;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return { y, m, d }; };
const utc = (y, m, d) => { const t = new Date(Date.UTC(2000, m - 1, d)); t.setUTCFullYear(y); return t.getTime(); };
const monthLen = (y, m) => { const t = new Date(Date.UTC(2000, m, 0)); t.setUTCFullYear(y, m, 0); return t.getUTCDate(); };
const iso = (y, m, d) => `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
function slotMs(a, months) {
  const total = a.y * 12 + (a.m - 1) + months; const y = Math.floor(total / 12), m = (total % 12) + 1;
  return utc(y, m, Math.min(a.d, monthLen(y, m)));
}
function oracle(anchor, step, date) {
  const a = parse(anchor), t = parse(date); const target = utc(t.y, t.m, t.d);
  let best = Infinity, at = -1, ties = 0;
  for (let j = 0; ; j += 1) {
    const ms = slotMs(a, j * step); const dist = Math.abs(ms - target) / DAY;
    if (dist < best) { best = dist; at = j; ties = 1; } else if (dist === best) ties += 1;
    if (ms > target && dist > best) break; // slots only move away from here on
  }
  return ties > 1 ? null : at;
}
let state = 20261113; const rnd = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
const pick = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
let n = 0, bad = 0, nulls = 0, low = 0; const firstBad = [];
function check(anchor, step, date) {
  const want = oracle(anchor, step, date); const got = e.nearestSlot(anchor, step, date);
  n += 1; if (want === null) nulls += 1;
  if (got !== want) { bad += 1; if (firstBad.length < 5) firstBad.push([anchor, step, date, got, want]); }
  if (step === 1) { const off = e.wholeMonthOffset(anchor, date); n += 1; if (off !== want) { bad += 1; if (firstBad.length < 5) firstBad.push(["offset", anchor, date, off, want]); } }
}
// 1. Random anchors on every day of the month, each step, targets from 400 days before the anchor to 31 years after.
for (let i = 0; i < 300000; i += 1) {
  const y = pick(1990, 2100), m = pick(1, 12), d = pick(1, monthLen(y, m)); const step = [1, 3, 6, 12][pick(0, 3)];
  const t = new Date(utc(y, m, d) + pick(-400, 11323) * DAY);
  if (t.getTime() < utc(y, m, d)) low += 1;
  check(iso(y, m, d), step, iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()));
}
// 2. Exhaustive: month-end and leap-day anchors, every day for seven years, each step.
for (const anchor of ["2026-01-31", "2026-03-04", "2026-09-01", "2027-08-30", "2028-02-29", "2099-12-31", "2026-05-15"]) {
  const a = parse(anchor); const start = utc(a.y, a.m, a.d) - 45 * DAY;
  for (const step of [1, 3, 6, 12]) for (let k = 0; k < 2600; k += 1) { const t = new Date(start + k * DAY); check(anchor, step, iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate())); }
}
// 3. The last representable years: every day of 9998 and 9999 against anchors there, so slots cross into 10000.
for (const anchor of ["9998-01-31", "9999-06-01", "9999-06-30", "9999-12-01", "9999-12-31", "9997-11-30"]) {
  const a = parse(anchor);
  for (const step of [1, 3, 6, 12]) for (let ms = utc(a.y, a.m, a.d) - 40 * DAY; ms <= utc(9999, 12, 31); ms += DAY) { const t = new Date(ms); check(anchor, step, iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate())); }
}
console.log(`comparisons ${n}; mismatches ${bad}; oracle ties ${nulls}; targets before the anchor in part 1: ${low}`);
console.log("spec values:", e.wholeMonthOffset("2026-03-04", "2026-09-01"), e.nearestSlot("2026-09-01", 3, "2031-02-26"), e.nearestSlot("2026-09-01", 1, "2031-02-26"), e.nearestSlot("2026-09-01", 3, "2027-12-01"), e.nearestSlot("2026-09-01", 1, "2026-09-16"), e.nearestSlot("9999-12-01", 1, "9999-12-31"), e.wholeMonthOffset("9999-06-01", "9999-12-01"));
if (firstBad.length) console.log("first mismatches", JSON.stringify(firstBad));
```

#### `probes.mjs` (`e5b75847c19fd7cb086e30d8e0a75665a346c9a80bc0c02ba177758cd9df7ee0`)

```js
// At the head: Pass 1's finding 1 (listed), the PM's estimated variant, and ruling C's case. usage: node probes.mjs <clone> <case.json>
import { readFileSync, writeFileSync } from "node:fs";
const ROOT = process.argv[2];
const { loadTerms, nyseRulesCalendar, observationSchedule } = await import(`${ROOT}/packages/core/src/index.ts`);
const { evaluateNote, payoutSchedule } = await import(`${ROOT}/packages/plugin-mln/src/index.ts`);
const cal = nyseRulesCalendar();
const base = readFileSync(`${ROOT}/fixtures/synthetic/terms/valid/minimal.yaml`, "utf8").replace("mln-terms/0.1", "mln-terms/0.2");
const low = { ALFA: "60.15", BRVO: "48.3", CHRL: "72", DLTA: "57.075" }; // 3/5 of each initial level
const show = (label, r) => console.log(label, r.kind, r.status ?? "", "rows", r.rows?.length, "next", JSON.stringify(r.next ?? null), "reasons", JSON.stringify(r.reasons), "payout", r.payoutCents ?? null);
// 1. Pass 1's live-forever.mjs: 18 primary listed calls, the final valuation in conflict between 2031-02-26 and 2031-03-03.
const dates = observationSchedule(loadTerms(base, "b.yaml").terms, cal).entries.slice(0, 18).map((entry) => entry.date);
const item = (d) => `    - value: ${d}\n      status: primary\n      source: supplement\n`;
const extra = "  final_valuation:\n    status: conflict\n    candidates:\n      - value: 2031-02-26\n        status: primary\n        source: supplement\n      - value: 2031-03-03\n        status: primary\n        source: supplement\n  observation_schedule:\n" + dates.map(item).join("");
const loaded = loadTerms(base.replace("underlyings:\n", `${extra}underlyings:\n`), "conflict.yaml");
console.log("listed conflict loads:", loaded.ok);
const closes = dates.flatMap((d) => Object.entries(low).map(([ticker, value]) => ({ ticker, date: d, value, source: "synthetic-close" })));
for (const asOf of ["2030-12-01", "2030-12-02", "2030-12-03", "2031-02-26", "2031-03-03", "2031-03-04", "2036-01-02"]) show(`  ${asOf}`, evaluateNote(loaded.terms, cal, closes, asOf));
// 2. The PM's probe-estimated.mjs: one estimated entry, maturity 2026-09-15, conflict 2026-09-10 against 2026-09-14.
const t = structuredClone(loadTerms(base, "b.yaml").terms); const p = (value) => ({ value, status: "primary", source: "supplement" });
t.dates.maturity = { ...t.dates.maturity, value: "2026-09-15" }; t.dates.final_valuation = { status: "conflict", candidates: [p("2026-09-10"), p("2026-09-14")] };
console.log("estimated conflict entries:", JSON.stringify(observationSchedule(t, cal).entries.map((e) => e.date)));
const one = Object.entries(low).map(([ticker, value]) => ({ ticker, date: "2026-09-01", value, source: "synthetic-close" }));
for (const asOf of ["2026-08-31", "2026-09-01", "2026-09-14", "2026-09-15", "2027-01-04"]) show(`  ${asOf}`, evaluateNote(t, cal, one, asOf));
// 3. Ruling C's case: monthly, first call 9999-12-01, final valuation and maturity 9999-12-31.
const yaml = readFileSync(`${ROOT}/fixtures/golden/g01-called-first/terms.yaml`, "utf8")
  .replace('"2026-03-02"', '"9999-05-28"').replace('"2026-03-04"', '"9999-06-01"').replace('"2026-09-01"', '"9999-12-01"')
  .replace('"2031-02-26"', '"9999-12-31"').replace('"2031-03-03"', '"9999-12-31"').replace('value: "quarterly"', 'value: "monthly"');
const far = loadTerms(yaml, "y9999.yaml"); const schedule = observationSchedule(far.terms, cal); const pay = payoutSchedule(far.terms, cal);
console.log("ruling C loads:", far.ok, "schedule", schedule.kind, JSON.stringify(schedule.entries.map((e) => e.date)));
console.log("  engine:", JSON.stringify(pay.kind === "payouts" ? { final: pay.final, calls: pay.calls.map((c) => [c.date, c.premiumMonths, c.payoutCents]) } : pay));
writeFileSync(process.argv[3], JSON.stringify({ data: { calendar: cal.id, terms: far.terms, schedule }, engine: pay }));
```

#### `probes.py` (`ef933ab219ffd2de11b904ae86143d8e87983523cbc7df087def152193cd5dfb`)

```python
# Ruling C's case in the reference, and the reference's slot arithmetic against a brute-force day count that shares no code with it.
# usage: python3 -I probes.py <clone> <case.json>
import json, random, runpy, sys
ref = runpy.run_path(sys.argv[1] + "/tools/reference/payoff.py")
case = json.load(open(sys.argv[2], encoding="utf-8")); r = ref["payout_schedule"](case["data"])
print("  reference:", json.dumps({"final": r["final"], "calls": [[c["date"], c["premiumMonths"], c["payoutCents"]] for c in r["calls"]]} if r.get("kind") == "payouts" else r))
print("  deep-equal to the engine:", r == case["engine"], "| premium by hand, 100000*850*7/120000 rounded half up:", (100000 * 850 * 7 * 2 + 120000) // 240000)
def days(y, m, d):  # days from civil, proleptic Gregorian, integer arithmetic only
    y -= m <= 2; era = y // 400; yoe = y - era * 400; doy = (153 * (m + (-3 if m > 2 else 9)) + 2) // 5 + d - 1
    return era * 146097 + yoe * 365 + yoe // 4 - yoe // 100 + doy
def mlen(y, m): return [31, 29 if (y % 4 == 0 and y % 100 != 0) or y % 400 == 0 else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]
def oracle(a, t, step):
    ay, am, ad = a; target = days(*t); best = None; at = None; ties = 0; j = 0
    while True:
        total = ay * 12 + am - 1 + j * step; y, m = divmod(total, 12); m += 1
        dist = abs(days(y, m, min(ad, mlen(y, m))) - target)
        if best is None or dist < best: best, at, ties = dist, j, 1
        elif dist == best: ties += 1
        if days(y, m, 1) > target + 40: break
        j += 1
    return None if ties > 1 else at
rng = random.Random(3813); n = bad = nulls = 0
iso = lambda t: "%04d-%02d-%02d" % t
for i in range(120000):
    hi = i % 5 == 0  # one in five near the last representable years
    y = rng.randint(9990, 9999) if hi else rng.randint(1990, 2100); m = rng.randint(1, 12); a = (y, m, rng.randint(1, mlen(y, m)))
    ty = min(9999, y + rng.randint(0, 9 if hi else 31)); tm = rng.randint(1, 12); t = (ty, tm, rng.randint(1, mlen(ty, tm)))
    step = rng.choice([1, 3, 6, 12]); want = oracle(a, t, step); got = ref["nearest_slot"](iso(a), iso(t), step)
    n += 1; nulls += want is None; bad += got != want
print("reference nearest_slot against the oracle: comparisons", n, "mismatches", bad, "oracle ties", nulls)
```

#### `diff-gen.mjs` (`dfa59d6a6bcdc9697392c4c23d89a3c0d26c1d96c61295d74db2deb41a99bc9d`)

```js
// Off-golden differential: seeded synthetic terms, closes and dates; the engine's three results per case go to a JSON file
// with the input the reference needs. usage: node diff-gen.mjs <clone> <out.json> <cases>
import { readFileSync, writeFileSync } from "node:fs";
const ROOT = process.argv[2];
const { loadTerms, nyseRulesCalendar, observationSchedule } = await import(`${ROOT}/packages/core/src/index.ts`);
const { evaluateNote, payoutSchedule, noteMetrics } = await import(`${ROOT}/packages/plugin-mln/src/index.ts`);
const cal = nyseRulesCalendar();
const text = readFileSync(`${ROOT}/fixtures/synthetic/terms/valid/minimal.yaml`, "utf8").replace("mln-terms/0.1", "mln-terms/0.2");
const BASE = loadTerms(text, "b.yaml").terms;
let state = 3813; const rnd = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
const CALM = process.argv[5] === "calm"; const maybe = (p) => rnd() < (CALM ? p * 0.15 : p);
const pick = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1)); const one = (list) => list[pick(0, list.length - 1)]; const chance = (p) => rnd() < p;
const DAY = 86400000;
const shift = (iso, days) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);
const p = (value) => ({ status: "primary", value, source: "supplement" });
const withStatus = (value, status) => status === "estimate" ? { status, value, rule: "stated" } : status === "assumed" ? { status, value, note: "stated" } : { status, value, source: "supplement" };
const unknown = () => ({ value: null, status: "unknown" });
const conflict = (a, b) => ({ status: "conflict", candidates: [p(a), p(b)] });
const INITIAL = { ALFA: 100250000n, BRVO: 80500000n, CHRL: 120000000n, DLTA: 95125000n }; // micro-units
function closeText(ticker, k) { // initial x k/10000, cut to 6 places
  const micro = (INITIAL[ticker] * BigInt(k)) / 10000n; const whole = micro / 1000000n; const frac = String(micro % 1000000n).padStart(6, "0").replace(/0+$/, "");
  return frac === "" ? String(whole) : `${whole}.${frac}`;
}
const baseDates = observationSchedule((() => { const t = structuredClone(BASE); t.dates.final_valuation = p("2031-02-26"); return t; })(), cal).entries.map((entry) => entry.date);
function makeCase(i) {
  const t = structuredClone(BASE);
  const far = maybe(0.04); // the last representable years
  if (far) { t.dates.trade = p("9999-05-28"); t.dates.settlement = p("9999-06-01"); t.dates.first_call_observation = p(one(["9999-12-01", "9999-12-31", "9999-11-30"])); t.dates.maturity = p("9999-12-31"); t.call.frequency = p(one(["monthly", "quarterly"])); }
  const first = t.dates.first_call_observation.value;
  // final valuation term
  const roll = CALM ? rnd() * 0.6 : rnd();
  const nearFinal = far ? one(["9999-12-31", "9999-12-30", "9999-12-01"]) : shift("2031-02-26", chance(0.7) ? 0 : pick(-50, 8));
  if (roll < 0.5) t.dates.final_valuation = p(nearFinal);
  else if (roll < 0.58) t.dates.final_valuation = withStatus(nearFinal, one(["estimate", "assumed", "document", "advisor", "user"]));
  else if (roll < 0.68) t.dates.final_valuation = unknown();
  else if (roll < 0.86) { const a = far ? "9999-12-30" : shift("2031-02-26", pick(-1700, 0)); t.dates.final_valuation = conflict(a, far ? "9999-12-31" : shift(a, pick(1, 120))); }
  // a listed schedule for about half
  let listed = null;
  if (!far && chance(0.55)) {
    const count = CALM ? one([18, 19, 19, 19, 17]) : pick(1, 19); listed = [];
    for (let j = 0; j < count; j += 1) {
      const date = j === 18 ? "2031-02-26" : baseDates[j]; const r = CALM ? rnd() * 0.82 : rnd();
      if (r < 0.80) listed.push(p(date));
      else if (r < 0.86) listed.push(withStatus(date, one(["estimate", "assumed", "document", "advisor", "user"])));
      else if (r < 0.90) listed.push(unknown());
      else if (r < 0.92) listed.push(conflict(date, shift(date, 1)));
      else listed.push(p(shift(date, one([-46, -45, -20, -3, -1, 1, 2, 15, 44, 45, 46, 400]))));
    }
    t.dates.observation_schedule = listed;
  } else if (far && chance(0.5)) { t.dates.observation_schedule = [p(first)]; }
  // perturb other terms now and then
  if (!far && maybe(0.12)) t.dates.settlement = p(shift("2026-03-04", one([-3, -2, 1, 14, 15, 16, 28, 181, 182])));
  if (!far && maybe(0.06)) t.dates.trade = p(shift("2026-03-02", one([1, 2, 3, 184])));
  if (!far && maybe(0.08)) t.dates.maturity = p(shift("2031-03-03", one([-6, -5, -1, 1, 30])));
  if (!far && maybe(0.08)) t.dates.first_call_observation = p(shift("2026-09-01", one([-1, 1, 2, 14, 15, 16])));
  if (maybe(0.06)) { const path = one(["trade", "settlement", "maturity", "first_call_observation"]); const cur = t.dates[path]; t.dates[path] = chance(0.5) ? withStatus(cur.value, one(["estimate", "assumed", "document"])) : chance(0.5) ? unknown() : conflict(cur.value, shift(cur.value, 1)); }
  if (maybe(0.10)) t.call.non_call_months = p(one([0, 5, 7]));
  if (!far && maybe(0.12)) { t.call.frequency = p(one(["monthly", "semiannual", "annual"])); }
  if (maybe(0.25)) t.underlyings.performance_rounding = withStatus(one(["none", "half-even-4dp", "truncate-4dp", "half-up-2dp", "half-up-0dp", "truncate-1dp"]), one(["primary", "document"]));
  if (maybe(0.04)) t.premium.accrual = p("compound");
  if (maybe(0.04)) t.barrier.observation = p(one(["daily-close", "continuous"]));
  if (maybe(0.03)) t.barrier.below_barrier = p("physical-delivery");
  if (maybe(0.05)) t.call.level = chance(0.5) ? unknown() : conflict(9500, 9000);
  if (maybe(0.06)) t.premium.rate_per_year = withStatus(one([2000, 2001, 1, 9999]), one(["primary", "advisor"]));
  if (maybe(0.06)) { const m = t.underlyings.members[pick(0, 3)]; m.initial = chance(0.4) ? unknown() : chance(0.5) ? conflict(m.initial.value, "1") : withStatus(m.initial.value, "advisor"); }
  const schedule = observationSchedule(t, cal);
  // closes on the dates the schedule or the list names, then an as-of date
  const dates = [...new Set([...(schedule.entries ?? []).map((entry) => entry.date).filter((d) => d !== null), ...(far ? [] : baseDates), ...(t.dates.final_valuation?.value ? [t.dates.final_valuation.value] : [])])].sort();
  const callAt = chance(CALM ? 0.1 : 0.5) ? pick(0, dates.length + 3) : 99; const closes = [];
  dates.forEach((date, index) => {
    const worst = index === callAt ? one([9500, 9501, 11000]) : one([9499, 9499, 9000, 7000, 6000, 5999, 3142, 9494, 9495]);
    const isFinal = t.dates.final_valuation?.value === date; const level = isFinal ? one([9500, 9499, 6000, 5999, 6001, 3000, 12000, 1]) : worst;
    const worstMember = one(["ALFA", "BRVO", "CHRL", "DLTA"]);
    for (const ticker of ["ALFA", "BRVO", "CHRL", "DLTA"]) {
      if (chance(0.01)) continue; // a missing close
      const k = ticker === worstMember || chance(0.1) ? level : level + pick(1, 3000);
      closes.push({ ticker, date, value: closeText(ticker, k), source: "synthetic-close" });
      if (chance(0.01)) closes.push({ ticker, date, value: closeText(ticker, k + 7), source: "synthetic-b" }); // a conflict
      if (chance(0.01)) closes.push({ ticker, date, value: `${closeText(ticker, k)}${closeText(ticker, k).includes(".") ? "0" : ".0"}`.replace(/(\.\d{6})0$/, "$1"), source: "synthetic-c" }); // the same value, spelled again
    }
    if (chance(0.03)) closes.push({ ticker: "ZULU", date, value: "not-a-number", source: "synthetic-close" });
    if (chance(0.03)) for (const ticker of ["ALFA", "DLTA"]) closes.push({ ticker, date: shift(date, one([-1, 1])), value: closeText(ticker, 12000), source: "synthetic-close" });
  });
  if (chance(0.03)) closes.push({ ticker: "ALFA", date: one(dates) ?? "2026-09-01", value: one(["0", "01.5", "1.1234567", "-3"]), source: "synthetic-close" });
  if (chance(0.03)) closes.push({ ticker: "BRVO", date: one(dates) ?? "2026-09-01", value: "50", source: one(["Bad Source", ""]) });
  if (chance(0.3)) for (let j = closes.length - 1; j > 0; j -= 1) { const k = pick(0, j); [closes[j], closes[k]] = [closes[k], closes[j]]; }
  const anchor = one(dates) ?? "2026-09-01";
  const asOf = CALM && !far && chance(0.4) ? one(["2031-02-25", "2031-02-26", "2031-02-27", "2031-03-02", "2031-03-03", "2031-03-04", "2035-01-02"]) : chance(0.02) ? one(["2026-02-30", "2026-9-01", ""]) : chance(0.55) ? anchor : chance(0.5) ? shift(anchor, pick(-3, 3)) : far ? one(["9999-12-31", "9999-06-01", "9999-12-01"]) : shift("2026-02-20", pick(0, 2000));
  const run = (fn) => { try { return fn(); } catch (error) { return { threw: String(error.message) }; } };
  return {
    data: { asOf, calendar: cal.id, terms: t, schedule, closes },
    engine: { evaluation: run(() => evaluateNote(t, cal, closes, asOf)), payouts: run(() => payoutSchedule(t, cal)), metrics: run(() => noteMetrics(t, closes, asOf)) },
  };
}
const cases = []; for (let i = 0; i < Number(process.argv[4]); i += 1) cases.push(makeCase(i));
writeFileSync(process.argv[3], JSON.stringify(cases));
const tally = {}; for (const c of cases) { const e = c.engine.evaluation; const key = e.threw ? "threw" : e.kind === "evaluated" ? `evaluated:${e.status}` : e.kind; tally[key] = (tally[key] ?? 0) + 1; }
const pay = {}; for (const c of cases) { const e = c.engine.payouts; const key = e.threw ? "threw" : e.kind; pay[key] = (pay[key] ?? 0) + 1; }
const met = {}; for (const c of cases) { const e = c.engine.metrics; const key = e.threw ? "threw" : e.kind; met[key] = (met[key] ?? 0) + 1; }
console.log("cases", cases.length, "evaluateNote", JSON.stringify(tally), "payoutSchedule", JSON.stringify(pay), "noteMetrics", JSON.stringify(met));
```

#### `diff-ref.py` (`728934da5da520a5ef0408d648de1cc188333c252676fb44645fa6678d40c11b`)

```python
# Runs the PR's Pass M reference on each generated case and compares its three results with the engine's.
# usage: python3 -I diff-ref.py <clone> <cases.json>
import json, runpy, sys
from collections import Counter
ref = runpy.run_path(sys.argv[1] + "/tools/reference/payoff.py")
cases = json.load(open(sys.argv[2], encoding="utf-8"))
agree = 0; diffs = Counter(); shown = 0; skipped = Counter()
for number, case in enumerate(cases):
    data, engine = case["data"], case["engine"]
    try:
        closes = ref["readable_closes"](data)
        actual = {"evaluation": ref["evaluate"](data, closes), "payouts": ref["payout_schedule"](data), "metrics": ref["metrics"](data, closes)}
    except Exception as error:
        actual = None; refthrew = type(error).__name__
    for part in ("evaluation", "payouts", "metrics"):
        if isinstance(engine[part], dict) and "threw" in engine[part]:
            skipped["engine threw: " + engine[part]["threw"]] += 1; continue
        if actual is None:
            skipped["reference raised " + refthrew] += 1; continue
        where = ref["first_difference"](actual[part], engine[part])
        if where is None:
            agree += 1
        else:
            diffs[part + " " + where.split("[")[0]] += 1
            if shown < 12:
                shown += 1
                print("DIFF case", number, part, where, "| engine", json.dumps(engine[part])[:260], "| reference", json.dumps(actual[part])[:260])
print("cases", len(cases), "results compared and equal", agree, "different", sum(diffs.values()), dict(diffs))
print("not compared", dict(skipped))
```

#### `after-final.mjs` (`152e00332782a2ac120a9a547894cd8b85336d3967e393caa5d3b18bac853a8c`)

```js
// A listed item dated after a known final valuation date, with no item dated on it: how many call events (k)?
// g02's terms are L. Its last listed item, 2031-02-26, is moved to 2031-03-03 (maturity), five days after the term's date.
// usage: node after-final.mjs <clone> <out.json>
import { readFileSync, writeFileSync } from "node:fs";
const ROOT = process.argv[2];
const { loadTerms, nyseRulesCalendar, observationSchedule } = await import(`${ROOT}/packages/core/src/index.ts`);
const { evaluateNote, payoutSchedule } = await import(`${ROOT}/packages/plugin-mln/src/index.ts`);
const cal = nyseRulesCalendar();
const yaml = readFileSync(`${ROOT}/fixtures/golden/g02-called-second/terms.yaml`, "utf8")
  .replace('  - value: "2031-02-26"\n    status: primary', '  - value: "2031-03-03"\n    status: primary');
const loaded = loadTerms(yaml, "after-final.yaml");
if (!loaded.ok) { console.log("loads: false", JSON.stringify(loaded.errors)); process.exit(1); }
const t = loaded.terms; const schedule = observationSchedule(t, cal);
console.log("loads: true; final valuation", t.dates.final_valuation.value, "; listed", schedule.entries.length, "items; last", schedule.entries.at(-1).date);
const asOf = "2026-08-31";
const engine = { evaluation: evaluateNote(t, cal, [], asOf), payouts: payoutSchedule(t, cal) };
console.log("engine evaluateNote  :", JSON.stringify(engine.evaluation));
console.log("engine payoutSchedule:", JSON.stringify(engine.payouts));
writeFileSync(process.argv[3], JSON.stringify({ data: { asOf, calendar: cal.id, terms: t, schedule, closes: [] }, engine }));
```

#### `after-final.py` (`cca90db902ab6cc184c7512da03722484eff13fe6c9b2b68b009aaff11f3e03c`)

```python
# usage: python3 -I after-final.py <clone> <case.json>
import json, runpy, sys
ref = runpy.run_path(sys.argv[1] + "/tools/reference/payoff.py")
case = json.load(open(sys.argv[2], encoding="utf-8")); data = case["data"]
print("reference evaluate       :", json.dumps(ref["evaluate"](data, ref["readable_closes"](data))))
print("reference payout_schedule:", json.dumps(ref["payout_schedule"](data)))
print("equal:", ref["evaluate"](data, []) == case["engine"]["evaluation"], ref["payout_schedule"](data) == case["engine"]["payouts"])
```

### The PM's scripts

#### `post-merge.sh`, the post-merge checks (`47707d8730551a569ad6b540d1e4a34ec2836bb2a55a5dc7c535c33bfebb6dc6`)

```sh
#!/bin/bash
# Post-merge checks for PR #38, in a fresh clone of main.
SP=/private/tmp/claude-501/-Users-benicheni-code-keel-pm/225b8049-5222-43ea-a7be-10c973d89ac6/scratchpad/pr38
D=$SP/post-merge
if [ -e "$D" ]; then echo "exists: $D"; exit 2; fi
export KEEL_DATA_DIR="$(mktemp -d)"
gh repo clone BeniCheni/keel "$D" -- -q || { echo "clone failed"; exit 3; }
cd "$D" || exit 3
git fetch -q origin pull/38/head:pr38-head || { echo "fetch head failed"; exit 3; }
echo "origin/main      $(git rev-parse origin/main)"
echo "HEAD             $(git rev-parse HEAD)"
echo "parent           $(git rev-parse 67a1d92^)"
echo "parents count    $(git rev-list --parents -n1 67a1d92 | wc -w | tr -d ' ')"
echo "tree squash      $(git rev-parse '67a1d92^{tree}')"
echo "tree head        $(git rev-parse 'fd4fd79^{tree}')"
git diff --quiet fd4fd79 origin/main; echo "diff head main exit $?"
echo "pr head ref      $(git rev-parse pr38-head)"
echo "merge-base       $(git merge-base 9f0745f fd4fd79)"
echo "tags at squash   [$(git tag --points-at 67a1d92 | tr '\n' ' ')]"
echo "author           $(git log -1 --format='%an <%ae>' 67a1d92)"
echo "committer        $(git log -1 --format='%cn <%ce> %cI' 67a1d92)"
echo "--- squash message"
git log -1 --format=%B 67a1d92 > $SP/squash-msg.txt
cat $SP/squash-msg.txt
echo "--- trailers"
git log -1 --format='%(trailers:key=Co-authored-by)' 67a1d92
echo "--- authors on the PR"
git log --format='%an <%ae>' 9f0745f..fd4fd79 | sort | uniq -c
for v in 24.22.2 26.13.0; do
  echo "== node v$v"
  ( export PATH="$HOME/.nvm/versions/node/v$v/bin:$PATH"; echo "node $(node -v)";
    pnpm install --frozen-lockfile > $SP/pm-install-v$v.log 2>&1; echo "install exit $?"
    pnpm verify > $SP/pm-verify-v$v.log 2>&1; echo "verify exit $?"
    grep -E '^\s+Tests\s' $SP/pm-verify-v$v.log
    echo "status lines: $(git status --porcelain --untracked-files=all | wc -l | tr -d ' ')" )
done
echo "KEEL_DATA_DIR entries: $(ls -A "$KEEL_DATA_DIR" | wc -l | tr -d ' ')"
```

#### `private-scan-38.sh`, the private-list scan for Beni to run (`e3265e832ac9556515dbb562de1600f018c73078a834234d8647b3d5d0e63518`)

```sh
bash <<'SCRIPT'
set -u
F="${KEEL_PRIVATE_LIST:-$HOME/.config/keel/private-terms.txt}"
R=BeniCheni/keel
N=38
SQUASH=67a1d92ad98561578f8f4b14efe2088e8a17e6cc
{ test -r "$F" && test -s "$F"; } || { echo "list unreadable or empty"; exit 2; }
W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT
grep -v '^[[:space:]]*$' "$F" > "$W/p" || { echo "list has no patterns"; exit 2; }
head -n 1 "$W/p" > "$W/control"
c="$(grep -F -i -c -f "$W/p" "$W/control")"
[ "$c" = 1 ] || { echo "control failed"; exit 2; }
echo "control: ok"
gh api repos/$R/commits/$SQUASH --jq .commit.message > "$W/squash" < /dev/null || { echo "squash fetch failed"; exit 2; }
gh repo clone $R "$W/repo" -- -q < /dev/null || { echo "clone failed"; exit 2; }
git -C "$W/repo" diff 9f0745f7fd1431f07450d43c4f4b93fea21cb603 $SQUASH > "$W/diff" || { echo "diff failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/commits --jq '.[].commit.message' > "$W/commits" < /dev/null || { echo "commits fetch failed"; exit 2; }
gh pr view $N --repo $R --json title,body --jq '.title, .body' > "$W/title-body" < /dev/null || { echo "PR fetch failed"; exit 2; }
gh api --paginate repos/$R/issues/$N/comments --jq '.[].body' > "$W/comments" < /dev/null || { echo "comments fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/reviews --jq '.[].body' > "$W/reviews" < /dev/null || { echo "reviews fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/comments --jq '.[].body' > "$W/review-comments" < /dev/null || { echo "review comments fetch failed"; exit 2; }
echo "comments on PR #$N now: $(gh api repos/$R/issues/$N --jq .comments < /dev/null)"
status=0
for s in squash diff commits title-body comments reviews review-comments; do
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

#### `p25-turns.py`, the seat's questions and Beni's answers from its transcript (`3029bc6e2a5c9a4683a48b30a8555ef9be35200c74924a1351b4c32250f07b8b`)

```python
# Print user turns and AskUserQuestion exchanges from a Claude Code transcript, as data.
import json, sys, datetime
EST = datetime.timezone(datetime.timedelta(hours=-5))
def ts(r):
    t = r.get("timestamp")
    if not t: return "?"
    return datetime.datetime.fromisoformat(t.replace("Z","+00:00")).astimezone(EST).strftime("%H:%M:%S EST")
asks = {}
for line in open(sys.argv[1], encoding="utf-8"):
    r = json.loads(line)
    m = r.get("message") or {}
    c = m.get("content")
    if r.get("type") == "assistant" and isinstance(c, list):
        for b in c:
            if b.get("type") == "tool_use" and b.get("name") == "AskUserQuestion":
                asks[b["id"]] = b["input"]
                print(f"[{ts(r)}] ASK", json.dumps([q["question"] for q in b["input"].get("questions", [])])[:1500])
    if r.get("type") == "user":
        if isinstance(c, str):
            print(f"[{ts(r)}] USER", c[:600].replace("\n"," / "))
        elif isinstance(c, list):
            for b in c:
                if b.get("type") == "text":
                    print(f"[{ts(r)}] USER", b["text"][:600].replace("\n"," / "))
                if b.get("type") == "tool_result" and b.get("tool_use_id") in asks:
                    cc = b.get("content")
                    txt = cc if isinstance(cc, str) else " ".join(x.get("text","") for x in cc if isinstance(x, dict))
                    print(f"[{ts(r)}] ANSWER", txt[:1500].replace("\n"," / "))
```
