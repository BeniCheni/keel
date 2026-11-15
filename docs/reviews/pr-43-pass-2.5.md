# Executive brief: PR #43, Pass 2.5, 2026-11-14 (America/New_York)

Every number below comes from a command run in this session at `00ee1e07a0e6bd355f32bafc88bb4a133ea03205`. A number taken from a PR body, comment or brief is labelled as that vendor's claim.

Seat: Claude, fresh session, `claude-fable-5-2` at effort `high` (both read from the session's metadata), no fallback. This session wrote no line of the build or any fix. I pushed nothing and merged nothing, and the PR is still a draft.

Setup, with three departures from the letter of the skill:
- **Folder check:** `pwd` printed `/Users/benicheni/code/keel-pr-43-p25` and `ls -A` printed `.claude` alone, which I never opened. The clone is `keel/` in that folder, not `/tmp/keel-pr-43` as the skill's example has it.
- **Data folder:** the sandbox refused the bare `mktemp -d`, so `KEEL_DATA_DIR` was made once with `mktemp -d "$TMPDIR/keel-data.XXXXXX"`. It held 0 entries after the runs.
- **`gh`:** it ran outside the command sandbox, which blocks its certificate check. Everything else ran inside.
- **Refs:** GitHub's head, `git rev-parse HEAD` and `origin/s03.1/reference-k` all equal the SHA above. `origin/docs/pr-43-records` is `8e7e43e135b44445edaf6a9d3b1fff80ba668978`.

## Decision

Shadow mode: the gate says **would escalate**, because three sensitive paths are touched (`packages/plugin-mln/**`, `fixtures/golden/**`, `tools/reference/**`). You merge, from the PM's handoff.

The review verdict is **mergeable**. No High is open, every other gate clause holds, and PR #40's High meets its closing condition at this head.

PR comment: https://github.com/BeniCheni/keel/pull/43#issuecomment-6887274779

## What ships

- keel's distance figures no longer fail on a list of closes with a gap in it. A gap is not a close, and the result is the same as without it.
- Two more worked cases are frozen:
  - A listed observation date after the final valuation date gives "unavailable" with the reason named. It is never counted as a call date.
  - A note whose dates run to the last representable year still evaluates.
- The independent recomputation (Pass M) now agrees with the engine on all 13 cases.
- The fixture generator refuses a rejected fixed close under test, and stops with an error where it used to write no close for a row's worst member.
- keel still declines to give a value of the note or of a holding, a status on an estimated date, or any payout when the schedule contradicts the final valuation date.

## What the passes found

- **Pass 1 (Claude Code):** four findings, no High.
  - Finding 1, Medium: four surviving mutants of `noteMetrics`'s new index loop. Closed in `21d3e371fc1d11d324d745dfbdad58aa5877bdee`.
  - Finding 2, Medium: three untested conditions of the generator's guard. Closed in `06aa0a4c3680f8f158d260f4702dd5d9dd73dcc7`.
  - Finding 3, Low: no test pins the generator's version. Not fixed.
  - Finding 4, Low: the PR body's AC7 diff does not apply as printed. Not fixed.
- **Pass 2 (Codex):** accepted all four, contested none, and added no finding. It amended the reference in `00ee1e07a0e6bd355f32bafc88bb4a133ea03205`. Pass M as Codex reported it: 13 cases, 0 disagreements.
- **Pass 2.5 corroboration:**
  - Findings 1 and 2 are closed: L1 to L4 and G1 to G3 each exit 1 on the test Pass 1 added for it.
  - Finding 3 reproduces: with the version set back to 1, both suites exit 0.
  - Finding 4 reproduces: `git apply --check` on the body's AC7 diff exits 128, and exits 0 with `--recount`. The other seven mutant diffs apply, and AC6's applies in reverse.
  - Nothing was killed as unreproducible.
- **Contested:** nothing, by any vendor.

**Cold read of `00ee1e0` (Codex).** `git diff 06aa0a4c3680f8f158d260f4702dd5d9dd73dcc7 00ee1e07a0e6bd355f32bafc88bb4a133ea03205` changes `tools/reference/payoff.py` alone, 8 lines in and 2 out, all in `observation_events`. Author and committer are `Codex <noreply@openai.com>`. It matches S03's Events rules and `events.ts:122-143`:
- With a listed schedule, a known final valuation date and no item dated on it, an item with a known later date is skipped. It is not an event and adds nothing to `k`. An undated item still counts.
- With an item dated on it, the loop still stops at the first such item and counts every item before it, a later-dated one included.
- Codex's comment names the S03 rule it follows, as Decision 2 requires, and no other file changed.

**Pass 2.5's own findings:**

| # | Severity | Finding | Status |
| --- | --- | --- | --- |
| 1 | Medium, a surviving mutant off a boundary by the skill's letter | Three mutants of the amendment survive Pass M on the 13 golden cases: `not has_listed_final` dropped, `any` read as `all` (`payoff.py:182-184`), and `day is not None` dropped (`payoff.py:211`). No golden case has an item dated on the final valuation date after a later-dated one, or an undated item with no item on that date | Not fixed: I push nothing, and S03.1's non-goals leave a committed differential to a later slice. For the PM's ideas list |
| 2 | Low | Pass M's own case floor is still 11 (`payoff.py:531`), as S03's text has it. With g13's folder removed from a copy, it prints `cases 12, disagreements 0` and exits 0 | Not fixed: Decision 2 bars other reference changes. The suite's 13-case list and AC2's printed count catch a missing case today. For the PM |
| 3 | Low, docs, already known | `AGENTS.md`'s Workflow table and the skill call this seat "PM, fresh session"; the Seats table and your prompt say it is not the PM. This is PR #38's Pass 2.5 finding 6, so I cite it and did not stop | For the PM |

Finding 1 does not mean the amendment is wrong. Off the golden cases, the amended reference and the engine agree on all 72,000 compared results. The finding is that only an uncommitted comparison can see two of its three conditions.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | Exit 0 on Node 24.22.2 and on 26.13.0 |
| Verify | `pnpm verify` | Exit 0 on each; eight steps `ok`; 516 run, 516 passed, 0 failed in 39 files (core 178 in 16, plugin 212 in 12, tooling 126 in 11); status empty after each |
| CI | `gh run view 43648292601 --repo BeniCheni/keel --json headSha,event,status,conclusion,attempt,jobs` | Head `00ee1e0`, `pull_request`, success, attempt 1, 5 of 5 jobs |
| Timeline | `gh api repos/BeniCheni/keel/issues/43/timeline --paginate --jq '[.[] \| .event] \| group_by(.) \| map("\(length) \(.[0])")'` | 4 `committed`, 2 `commented`, 2 `referenced` before my comment; no force-push |
| Authors | `git log --format='%h %an <%ae>' origin/main..HEAD` | `00ee1e0` Codex, `06aa0a4` and `21d3e37` Claude, `bd9ae45` Cursor, each with its commit identity |
| AC1 | `after-final.mjs`, `after-final.py`, extracted from `docs/reviews/pr-38-pass-2.5.md`, hashes matching its headings | `equal: True True` on both Nodes; both sides give `listed-after-final-valuation` at index 18 alone |
| AC2, Pass M | `python3 -I tools/reference/payoff.py fixtures/golden/` (Python 3.9.6) | Exit 0, 13 `agree` lines, `cases 13, disagreements 0` |
| S03's two controls | The same on two copies | Exit 1 at `$.evaluation.payoutCents` (104250 raised to 104251); exit 1 at `$.evaluation.assumptions[4]` |
| AC3 | `git show <sha>:tools/reference/payoff.py` into a file, then that file on the head's golden cases | `9ec6fd0284505d4f0653acc529f41b0ed7d940dd`: exit 1, g12 alone at `$.evaluation.reasons[1]`. `3e48b83e9ae6313b9ff10a266e23d2810f612d37`: exit 1, g12 and g13 (`$.evaluation.kind`) |
| AC2 at Cursor's last commit | The reference blob at `bd9ae45`, `9ec6fd0` and `06aa0a4` is one blob, `01652108f036c9062038589a0224e2b164173dda`; `git diff --quiet bd9ae45 HEAD -- fixtures` exits 0 | Exit 1, g12 the only disagreement |
| AC4 | The spec's three commands | Six `A` lines; regen then status prints nothing on both Nodes; the registry prints `2`, and `1` in a worktree of `9ec6fd0` |
| AC5 | Read, plus mutants K2, F1, F2, F3 | The test pins 13 cases, g12's two results, g13's payouts and its six evaluation fields; each mutant fails it |
| AC6 | The spec's commands | Five paths; the filter prints nothing (grep's own exit 1); `engine.ts` numstat `3 1`, the loop alone |
| AC7, AC8 | Mutants A7, A8 | Tooling exit 1: 1 failed, then 2 failed, with the named tests |
| AC9 | The spec's two commands, from the clone's root | One line in `honesty.txt`; `100644 blob 6190a5eb06d34b22e075a5df5ffc1015887abbc5`, a tab, the path. At `883bdd14f688603f191cf11973b087af0329668c`: `06f285ad4a6dd6077433f85f9d79d03ed813bb3e`. The blob rebuilt from the spec's 13 lines hashes to the pin |
| AC10 | `git diff --quiet origin/main...HEAD -- package.json pnpm-lock.yaml packages/plugin-mln/package.json` | Exit 0 |
| AC11 | As Install and Verify | Green on both Nodes |
| AC12, PR #40's High | A worktree of `0fda80f1bf02ec8a551491608fcc2cf3e70f598a` with `bd9ae4597acd194ffbe3c91870de40f8cbf298c2`'s `payoff.metrics.test.ts` copied in; `pnpm --filter @keel/plugin-mln exec vitest run --config vitest.config.mjs payoff.metrics.test.ts` | Exit 1 on both Nodes: 1 failed, 4 passed, `noteMetrics skips a hole in closes`, `TypeError: Cannot read properties of undefined (reading 'ticker')` |
| Sparse contract | Codex's `sparse-contract.mjs` (SHA-256 `cc7aa2d49703c7a4e077b8f8ffe8d5e2be7a25356a39ad9998589c58b47d0431`) | Four `TypeError` lines and exit 1 at `0fda80f`; four `equal` lines and exit 0 at the head on both Nodes |
| Determinism | `pnpm fixtures:regen && sh -c '…'` (the skill's command) | Exit 0 on both Nodes; the 11 older case folders are unchanged (`git diff --quiet`, exit 0) |
| Zero network | `pnpm verify:network` | Exit 0 on both Nodes (macOS in-process guard) |
| Engine against reference, off golden | PR #38's `diff-gen.mjs` and `diff-ref.py`, 12,000 plain and 12,000 calm cases | 72,000 results: 72,000 equal, 0 different, nothing thrown. Case files are byte-identical across Nodes. With the reference from `06aa0a4`: 1,674 differ (142 and 1,532) |
| Mutations, suite | `mut43.py`, Node 24.22.2 | 24 exact edits: 23 killed, 1 survivor (V1, Pass 1's finding 3). Ten sampled on Node 26.13.0: same exit codes and failing tests |
| Mutations, reference | `ref-mutants.py`, on copies | 8 edits: 3 killed by Pass M on g12, 2 equivalent, 3 survive Pass M (finding 1) |
| README quickstart | `quickstart43.sh`, Node 24.22.2 | 18 commands: 17 exit 0, and the no-match filter exits 1 as the README says |
| README `test:ci-evidence` | `pnpm -s test:ci-evidence -- --success-run 43641619604 --failure-run 41113925991` | Exit 0, `ci-evidence ok`; also with the head's run 43648292601. With the two runs swapped: exit 1 |
| Tripwire | `node tools/tripwire/cli.mjs .`, and `scanRepo` counted per class | Exit 0, no output. 0 in each of 10 classes over 291 tracked files and 4 commit messages; over the PR's title, body, two comments and two briefs; and over my comment and the squash text before posting. A planted token gives `cusip` 1, exit 1 |
| UI matrix | n/a | N/A: no UI |

The ten tripwire classes are `cusip`, `account`, `ssn`, `address`, `email`, `price`, `local-only`, `unscannable`, `allowlist` and `vendors`.

**The mutation floor per claim,** each one exact edit against the plugin or tooling suite:

| Claim | Mutant | Result |
| --- | --- | --- |
| AC3 | Reference set back to `9ec6fd0`'s, then to `3e48b83`'s | Pass M exit 1 on g12; exit 1 on g12 and g13 |
| The `k` rule, AC5 | `events.ts` `continue` removed | Plugin exit 1: 2 failed, 210 passed (`an item after the final valuation is found by its date, and by its place`, and the golden test) |
| AC5 | g12's expected output given the old extra reason | Plugin exit 1, the golden test; Pass M on a copy exits 1 at `$.evaluation.reasons[1]` |
| AC7 | Fixed-close check removed | Tooling exit 1: `a rejected fixed close is refused` |
| AC8 | Silent-skip throw removed | Tooling exit 1: both guard tests |
| Decision 7 | g03-live's `asOf` not a date; g12's folder removed | Plugin exit 1 each; the rewritten honesty test fails, receiving two ids, then `[]`; the other 23 tests in that file pass |
| Decision 6, AC12 | Loop back to `for...of`; skip as `break`; skip at index 0 only | Plugin exit 1 each: 2 failed, 210 passed, AC12's test among them |
| Pass 1 finding 1 | L1 to L4 | Plugin exit 1 each: 1 failed, 211 passed |
| Pass 1 finding 2 | G1 to G3 | Tooling exit 1 each: 1 failed, 125 passed; plugin exit 0 |
| Engine boundaries | 95.00% call row, 95.00% final row, 60.00%, call is terminal | Plugin exit 1: 6, 6, 3 and 8 failed |

**The 14 builder claims:** 1 and 4 to 14 reproduce at the head.
- **Claim 10's counts** are the builder's at `bd9ae45` (211 and 125). The head has 212 and 126, and `git diff bd9ae45 HEAD` adds two `test(` lines and removes none.
- **Claims 2 and 3** cannot be re-run by any command. They rest on your word, below.

Not re-run, and why:
- **The private-list check.** It is Codex's, and a Fable seat never opens that file. Codex's claim: 0 on the diff, every commit message, the title and body, every comment and review, both briefs and its own comment. It has not run on my comment, this brief or the squash text.
- **Demo mode.** N/A, not green: `grep -c -i demo README.md` prints 0, the known gap of idea 50.
- **Builder claim 3's history.** The reflog and stash evidence in the Pass 1.5 brief is the PM's record from Cursor's checkout, which I never opened. None of its numbers are mine.
- **Earlier heads.** I ran `verify` at the head only, not at `bd9ae45`, `21d3e37` or `06aa0a4`.
- **Pass 1's 33 mutants and Pass 2's full replay.** I ran 24 suite mutants and 8 reference mutants, chosen to cover the spec's floor, every finding, PR #40's High and the engine's boundaries.
- **The Linux network namespace.** It runs only in CI; I cite the green run.

## Estimates and model output

None. No figure in this PR comes from a model. g13's cents recompute exactly: six months give a premium of 4250, so 104250; seven give 14875/3, which rounds to 4958, so 104958.

## Risks and accepted costs

- **The reference is checked on 13 cases only.** Finding 1 shows what that leaves out. Both reference defects so far, and this pass's check, came from an uncommitted comparison.
- **Pass M would not notice a missing new case.** Its floor is 11 (finding 2). The test suite does notice.
- **One honesty test was rewritten,** by your ruling of 00:32:49 EST. Its bytes are pinned by blob id, and it still fails if any case other than g12 stops evaluating.
- **An explicit `undefined` or `null` in closes still throws.** S03's input contract admits a hole, not those values.
- **The generator's version is checked by command only** (Pass 1's finding 3).
- **The PR body is stale.** It names `bd9ae45` as the head, lists 14 files, gives the builder's counts, and its AC7 diff does not apply.
- **Three texts are unscanned against the private list:** my PR comment, this brief and the squash message.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes |
| Verdict mergeable, every High closed | Yes. No High is open in this PR. PR #40's High has its fix commit (`bd9ae45`) and a test that fails without it, and closes when this PR merges |
| Nothing contested | Yes |
| `verify` green at tip; every number re-run | Yes, except the items under "Not re-run" |
| No sensitive path, dependency or schema change | No: three sensitive paths. No dependency, no schema change |
| Every commit cold-read by a non-author vendor | Yes: `bd9ae45` (Cursor) by Claude at Pass 1; `21d3e37` and `06aa0a4` (Claude) by Codex at Pass 2; `00ee1e0` (Codex) by Claude here |
| Gate verdict | would escalate |
| Beni's decision (filled after) | Merged at `00ee1e0` as `38a4617` at 20:37:40 EST, with this pass's finding 1 open by his answer "Yes, record it open (Recommended)" at 20:33:40 EST, after his private-list scan ("Yes, merged", 20:37:49 EST) (filled by the PM) |

## Questions for Beni

One, answered in this session at about 20:22 EST. Asked whether three rulings of 2026-11-14 that I had only second-hand are yours, you answered **"Yes"**:
1. 16:25:40 EST, "Yes": Cursor's picker was on Grok 4.7 Extra High (builder claim 2).
2. 16:29:09 EST, "No, Medium (Recommended)": a loop's bound is not a Severity "boundary".
3. "Yes" in Codex's Pass 2 chat: no commits and no remote ref before Cursor's rebase, and no conflict on `git stash pop` (builder claim 3).

The earlier rulings are in the specs on `main`, which you merged. Nothing else is open for you.

For the PM: findings 1 and 2 go to the ideas list, and the handoff's private-list scan needs to cover comment 6887274779, this brief and the squash message.

## Proposed squash message

No merge or ready command is printed here; you merge from the PM's handoff. The base has not moved, so the squash commit's tree is `530b1aa759fc7f26997b053fd72e6cd182b33417` while `main` stays at `0fda80f1bf02ec8a551491608fcc2cf3e70f598a`.

Subject:

```text
fix(plugin-mln): skip a hole in noteMetrics and pin the k and year-10000 cases (#43)
```

Body:

```text
Slice S03.1. noteMetrics now skips an index of closes that has no element, so no exported function of @keel/plugin-mln throws on a hole. That closes PR #40's High, and AC12's test fails without the fix. Two golden cases join the eleven: g12-listed-after-final, in which a listed item dated after the final valuation date does not count toward k, and g13-year-10000-slot, in which the final valuation date's nearest slot falls in year 10000. The golden generator moves to version 2, has a test for its refusal of a rejected fixed close, and stops with an error naming the case where it used to write no close for a row's worst member. tools/reference/payoff.py now follows S03's Events rule for k, so Pass M agrees on all 13 cases. One honesty test is rewritten as S03.1 Decision 7 gives it.

Review: Cursor built bd9ae4597acd194ffbe3c91870de40f8cbf298c2. Pass 1 (Claude Code) found two test gaps by mutation and closed them in 21d3e371fc1d11d324d745dfbdad58aa5877bdee and 06aa0a4c3680f8f158d260f4702dd5d9dd73dcc7. Pass 2 (Codex) accepted all four findings and amended the reference in 00ee1e07a0e6bd355f32bafc88bb4a133ea03205. Pass 2.5 (Claude) cold-read that commit at 00ee1e07a0e6bd355f32bafc88bb4a133ea03205: verify exits 0 on Node 24.22.2 and 26.13.0 with 516 tests passed, and Pass M prints 13 cases and 0 disagreements. Sensitive paths: packages/plugin-mln, fixtures/golden, tools/reference. Beni merges.

Co-authored-by: Cursor <cursoragent@cursor.com>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
```

The trailers match `git log --format='%an <%ae>' origin/main..HEAD` (2 Claude, 1 Codex, 1 Cursor) and the three review comments: Pass 1 by Claude Code, Pass 2 by Codex, Pass 2.5 by Claude. No records cold read was given on this PR.

## Scripts

Extracted, not rewritten: `after-final.mjs`, `after-final.py`, `diff-gen.mjs` and `diff-ref.py` from `docs/reviews/pr-38-pass-2.5.md`, and `sparse-contract.mjs` from Codex's comment. Each SHA-256 matched its heading. `quickstart43.sh` is that record's `quickstart.sh` with `KEEL_DATA_DIR` taken from the environment and a count of its entries at the end. The four below are mine.

`passm43.sh` (SHA-256 `004875f8c9579edfefeaed5b4fe2c2e59e861f9e5cd03f6e998e1776f95df95b`):

```sh
#!/bin/sh
# Pass M at the head (AC2), S03's two controls, AC3's two pinned references, and the reference at 06aa0a4,
# each on the head's fixtures/golden bytes or a copy of them. Each run's own exit code is printed.
# usage: passm43.sh <clone> <workdir>
C="$1"; W="$2"; rm -rf "$W"; mkdir -p "$W"
cd "$C" || exit 97
echo "HEAD $(git rev-parse HEAD)"; python3 --version
# run <label> <reference file> <golden folder>: full output to a log, then the exit code, the non-agree lines and the agree count
run() {
  python3 -I "$2" "$3" > "$W/$1.out" 2> "$W/$1.err"; code=$?
  echo "[$1] exit=$code agree_lines=$(grep -c ': agree$' "$W/$1.out") stderr_lines=$(wc -l < "$W/$1.err" | tr -d ' ')"
  grep -v ': agree$' "$W/$1.out" | sed 's/^/    /'
}
echo "--- AC2: Pass M at the head"
run head tools/reference/payoff.py fixtures/golden/
echo "--- S03 control 1: g01 evaluation.payoutCents plus 1, in a copy"
cp -R fixtures/golden "$W/c1"
python3 -I - "$W/c1/g01-called-first/expected/result.json" <<'PY'
import json, sys
p = sys.argv[1]; d = json.load(open(p, encoding="utf-8"))
before = d["evaluation"]["payoutCents"]; d["evaluation"]["payoutCents"] = before + 1
open(p, "w", encoding="utf-8").write(json.dumps(d, indent=2) + "\n"); print("    changed", before, "->", before + 1)
PY
run control1 tools/reference/payoff.py "$W/c1/"
echo "--- S03 control 2: g01 evaluation.assumptions, last entry removed, in a copy"
cp -R fixtures/golden "$W/c2"
python3 -I - "$W/c2/g01-called-first/expected/result.json" <<'PY'
import json, sys
p = sys.argv[1]; d = json.load(open(p, encoding="utf-8"))
gone = d["evaluation"]["assumptions"].pop(); open(p, "w", encoding="utf-8").write(json.dumps(d, indent=2) + "\n"); print("    removed", json.dumps(gone))
PY
run control2 tools/reference/payoff.py "$W/c2/"
for sha in 9ec6fd0284505d4f0653acc529f41b0ed7d940dd 3e48b83e9ae6313b9ff10a266e23d2810f612d37 06aa0a4c3680f8f158d260f4702dd5d9dd73dcc7; do
  echo "--- the reference at $sha on the head's golden bytes"
  git show "$sha:tools/reference/payoff.py" > "$W/payoff-$sha.py" || exit 96
  run "ref-$sha" "$W/payoff-$sha.py" fixtures/golden/
done
echo "--- reference blobs: 9ec6fd0, 06aa0a4, 3e48b83, HEAD"
for sha in 9ec6fd0 06aa0a4 3e48b83 HEAD; do git rev-parse "$sha:tools/reference/payoff.py"; done
echo "--- controls of mine: a case folder removed (12 cases still >= 11), then three removed (10 cases)"
cp -R fixtures/golden "$W/c3"; rm -rf "$W/c3/g13-year-10000-slot"
run minus-one tools/reference/payoff.py "$W/c3/"
rm -rf "$W/c3/g12-listed-after-final" "$W/c3/g11-estimated-stop"
run minus-three tools/reference/payoff.py "$W/c3/"
echo "status lines after: $(git status --porcelain --untracked-files=all | wc -l | tr -d ' ')"
```

`ref-mutants.py` (SHA-256 `d878bd577e6a81139ca6a65251ce10e6a8f3cf4de8922af11420b38f4d1b4bc3`), run as `python3 -I ref-mutants.py <clone> <workdir> diff-ref.py <plain cases.json> <calm cases.json>`:

```python
# Mutants of Codex's amendment (00ee1e0) to observation_events, each applied alone to a COPY of the head's
# reference (the clone is never edited). For each: Pass M on the head's golden cases, then the off-golden
# differential (diff-ref.py from docs/reviews/pr-38-pass-2.5.md) on the seeded case files.
# usage: python3 -I ref-mutants.py <clone> <workdir> <diff-ref.py> <cases.json>...
import os, subprocess, sys
C, W, DIFF, CASES = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
src = open(os.path.join(C, "tools/reference/payoff.py"), encoding="utf-8").read()
SKIP = "            if listed and not has_listed_final and day is not None and day > final_date:\n                continue\n"
M = [
    ("R0 unmutated", None, None),
    ("R1 the new skip removed", SKIP, ""),
    ("R2 'not has_listed_final' dropped", "if listed and not has_listed_final and day is not None", "if listed and day is not None"),
    ("R3 has_listed_final inverted", "if listed and not has_listed_final and", "if listed and has_listed_final and"),
    ("R4 '>' to '>='", "day is not None and day > final_date:", "day is not None and day >= final_date:"),
    ("R5 '>' to '<'", "day is not None and day > final_date:", "day is not None and day < final_date:"),
    ("R6 any() to all()", "has_listed_final = listed and final_date is not None and any(", "has_listed_final = listed and final_date is not None and all("),
    ("R7 'day is not None' dropped", "and day is not None and day > final_date:", "and day > final_date:"),
    ("R8 'listed and' dropped from the skip", "if listed and not has_listed_final and", "if not has_listed_final and"),
]
for label, old, new in M:
    text = src
    if old is not None:
        if src.count(old) != 1: print(label, "old text found", src.count(old), "times"); sys.exit(2)
        text = src.replace(old, new)
    root = os.path.join(W, label.split()[0]); os.makedirs(os.path.join(root, "tools/reference"), exist_ok=True)
    path = os.path.join(root, "tools/reference/payoff.py"); open(path, "w", encoding="utf-8").write(text)
    p = subprocess.run(["python3", "-I", path, os.path.join(C, "fixtures/golden/")], capture_output=True, text=True)
    lines = p.stdout.splitlines()
    bad = [line for line in lines if ": agree" not in line and not line.startswith("cases ")]
    print(f"{label}: Pass M exit {p.returncode}; {lines[-1] if lines else p.stderr.strip()}; {bad}")
    for cases in CASES:
        d = subprocess.run(["python3", "-I", DIFF, root, cases], capture_output=True, text=True)
        tail = d.stdout.strip().splitlines()[-2:]
        print(f"    {os.path.basename(cases)}: " + " | ".join(tail))
```

Its results: R1, R3 and R5 exit 1 on g12. R4 and R8 are equivalent (72,000 equal). R2 and R6 pass Pass M and differ on 2 of 72,000 results. R7 passes Pass M and raises `TypeError` on 3,540 results, which is 1,180 cases.

`mut43.py` (SHA-256 `0e985e0d6b77c7ed2767799b3a938118bd77da26aa577ae64b8effc0d6932ecc`), run as `python3 -I mut43.py <clone> <work dir> [label ...]` with the Node version first on `PATH`:

```python
# Pass 2.5's mutation replay for PR #43. Each mutant is one exact edit, applied alone at the clone's HEAD;
# the named suites run with vitest's JSON reporter; the edited path is restored from its saved bytes; and
# `git status --porcelain --untracked-files=all` must be empty before and after every mutant.
# Never edits packages/plugin-mln/src/payoff.honesty.test.ts.
# usage: python3 -I mut43.py <clone> <work dir> [label ...]     (no labels = every mutant)
import json, os, shutil, subprocess, sys
C, W, ONLY = sys.argv[1], sys.argv[2], set(sys.argv[3:])
E = "packages/plugin-mln/src/engine.ts"; EV = "packages/plugin-mln/src/events.ts"
G = "tools/generators/golden/generate.mjs"; T = "packages/plugin-mln/src/payoff.golden.test.ts"
G03 = "fixtures/golden/g03-live/input.json"; G12D = "fixtures/golden/g12-listed-after-final"
G12 = G12D + "/expected/result.json"
LOOP = "  for (let index = 0; index < closes.length; index += 1) {\n    const close = closes[index];\n    if (close === undefined) continue;\n"
HEADLINE = "  for (let index = 0; index < closes.length; index += 1) {\n"
SKIP = "    if (close === undefined) continue;\n"
G12_REASON = '      {\n        "code": "listed-after-final-valuation",\n        "index": 18\n      }\n'
G12_EXTRA = '      {\n        "code": "listed-after-final-valuation",\n        "index": 18\n      },\n      {\n        "code": "final-valuation-off-cycle"\n      }\n'
P, TL = ["plugin"], ["tooling"]
# (label, claim, path, old, new, suites, replace count)
M = [
  ("D6a", "Decision 6 / AC12 / PR #40 High: loop back to for-of, no skip", E, LOOP, "  for (const close of closes) {\n", P, 1),
  ("D6b", "Decision 6 / AC12: skip written as break", E, SKIP, "    if (close === undefined) break;\n", P, 1),
  ("D6c", "Decision 6 / AC12: skip only at index 0", E, SKIP, "    if (index === 0 && close === undefined) continue;\n", P, 1),
  ("L1", "Pass 1 finding 1: bound closes.length - 1", E, HEADLINE, HEADLINE.replace("index < closes.length;", "index < closes.length - 1;"), P, 1),
  ("L2", "Pass 1 finding 1: start at index 1", E, HEADLINE, HEADLINE.replace("let index = 0;", "let index = 1;"), P, 1),
  ("L3", "Pass 1 finding 1: step of 2", E, HEADLINE, HEADLINE.replace("index += 1", "index += 2"), P, 1),
  ("L4", "Pass 1 finding 1: a hole also skips the next element", E, SKIP, "    if (close === undefined) { index += 1; continue; }\n", P, 1),
  ("K1", "k rule / AC5: events.ts continue removed", EV, "          if (order !== null && order > 0) continue;\n", "", P, 1),
  ("K2", "AC5: g12 expected output given the old extra reason, both arrays", G12, G12_REASON, G12_EXTRA, P, 2),
  ("F1", "AC5: the test's g12 pin, index 18 to 17", T, 'code: "listed-after-final-valuation", index: 18', 'code: "listed-after-final-valuation", index: 17', P, 1),
  ("F2", "AC5: the test's g13 pin, 104958 to 104959", T, "aboveCallCents: 104958", "aboveCallCents: 104959", P, 1),
  ("F3", "AC5: the test's case-list length, 13 to 12", T, "expect(IDS).toHaveLength(13);", "expect(IDS).toHaveLength(12);", P, 1),
  ("H1", "Decision 7: g03-live asOf is not a date", G03, '"asOf": "2028-01-14"', '"asOf": "not-a-date"', P, 1),
  ("H2", "Decision 7: g12's folder removed", G12D, None, None, P, 0),
  ("A7", "AC7: fixed-close check removed from pushClose", G, "  if (seededValueRejected(close.value) !== null) {\n    throw new Error(`${caseId}: fixed close rejected`);\n  }\n", "", TL, 1),
  ("A8", "AC8: silent-skip throw removed", G, "    throw new Error(`${caseId}: worst member has no close`);\n", "", TL, 1),
  ("G1", "Pass 1 finding 2: the all condition dropped", G, "    row.all === undefined &&\n", "", P + TL, 1),
  ("G2", "Pass 1 finding 2: the worstTicker condition dropped", G, "    row.worstTicker !== undefined &&\n", "", P + TL, 1),
  ("G3", "Pass 1 finding 2: missing !== worstTicker read as missing === undefined", G, "    row.missing !== row.worstTicker\n", "    row.missing === undefined\n", P + TL, 1),
  ("V1", "Pass 1 finding 3: version back to 1", G, "export const version = 2;\n", "export const version = 1;\n", P + TL, 1),
  ("B1", "Engine boundary 95.00% on a call row: >= to >", E, "cmpFrac(worst, callLevel) >= 0", "cmpFrac(worst, callLevel) > 0", P, 1),
  ("B2", "Engine boundary 95.00% on the final row: >= to >", E, "cmpFrac(rounded, callLevel) >= 0", "cmpFrac(rounded, callLevel) > 0", P, 1),
  ("B3", "Engine boundary 60.00%: >= to >", E, "cmpFrac(rounded, barrierLevel) >= 0", "cmpFrac(rounded, barrierLevel) > 0", P, 1),
  ("B4", "Engine: a call is terminal", E, 'if (row.outcome === "called" || row.outcome === "unknown") {', 'if (row.outcome === "unknown") {', P, 1),
]
SUITES = {
  "plugin": ["pnpm", "--filter", "@keel/plugin-mln", "exec", "vitest", "run", "--config", "vitest.config.mjs", "--reporter=json"],
  "tooling": ["pnpm", "exec", "vitest", "run", "--config", "tools/vitest.config.mjs", "--reporter=json"],
}
def git(*args):
    return subprocess.run(["git", *args], cwd=C, capture_output=True, text=True)
def clean():
    return git("status", "--porcelain", "--untracked-files=all").stdout == ""
node = subprocess.run(["node", "-v"], capture_output=True, text=True).stdout.strip()
head = git("rev-parse", "HEAD").stdout.strip()
print("head", head, "node", node, flush=True)
os.makedirs(W, exist_ok=True)
for label, claim, path, old, new, suites, count in M:
    if ONLY and label not in ONLY: continue
    if not clean(): print(label, "tree not clean before"); sys.exit(2)
    p = os.path.join(C, path)
    if old is None:
        holder = os.path.join(W, f"{label}-{node}-holder"); shutil.move(p, holder)
    else:
        before = open(p, "rb").read(); text = before.decode("utf-8")
        if text.count(old) != count: print(label, "old text found", text.count(old), "times, wanted", count); sys.exit(2)
        open(p, "w", encoding="utf-8").write(text.replace(old, new))
    parts = []
    try:
        for s in suites:
            out = os.path.join(W, f"{label}-{node}-{s}.json")
            rc = subprocess.run(SUITES[s] + [f"--outputFile={out}"], cwd=C, capture_output=True).returncode
            d = json.load(open(out))
            failed = sorted({a["title"] for f in d["testResults"] for a in f["assertionResults"] if a["status"] == "failed"})
            parts.append(f"{s} exit {rc}, {d['numPassedTests']} passed, {d['numFailedTests']} failed" + (f" {failed}" if failed else ""))
    finally:
        if old is None: shutil.move(holder, p)
        else: open(p, "wb").write(before)
        git("checkout", "--", "fixtures")
    print(f"{label} [{claim}]: " + " | ".join(parts), flush=True)
    if not clean(): print(label, "tree not clean after"); sys.exit(2)
print("done; head", git("rev-parse", "HEAD").stdout.strip(), "clean", clean())
```

`tripwire-counts.mjs` (SHA-256 `d864af0c02df5a8582d8014cb8f069f3ec0553bee88d706b62f1ac641f7dec16`). Loose texts were scanned by committing them to a throwaway repository that carries the clone's `allowlist.txt` and `vendors.txt`, with `refs/remotes/origin/main` set to its one commit, as Pass 1's `scan-texts.sh` does:

```js
// Counts tripwire hits per class. Never prints a matched value, a line or a path.
// usage: node tripwire-counts.mjs <clone> <repo to scan>
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const [clone, target] = process.argv.slice(2);
const { scanRepo } = await import(pathToFileURL(resolve(clone, "tools/tripwire/scan.mjs")).href);
const result = scanRepo(resolve(target));
if (result.error) { console.log(`scan error: ${result.error}`); process.exit(2); }
const classes = ["cusip", "account", "ssn", "address", "email", "price", "local-only", "unscannable", "allowlist", "vendors"];
const counts = Object.fromEntries(classes.map((name) => [name, 0]));
let other = 0;
for (const hit of result.hits) { if (hit.class in counts) counts[hit.class] += 1; else other += 1; }
console.log(JSON.stringify(counts), "other", other, "total", result.hits.length);
process.exit(result.hits.length === 0 ? 0 : 1);
```

`★ Insight ─────────────────────────────────────`
- **Why only `noteMetrics` threw on a hole:** `for...of` visits a hole as `undefined`, while `Array.prototype.filter`, which the row logic uses, skips holes. The index loop with an explicit `undefined` check is the smallest change that makes the two agree.
- **Why three reference mutants survive Pass M:** a differential test can only see branches its inputs reach. g12 reaches "no item on the final date, one item after it" and nothing else, so the conditions guarding the neighbouring shapes are invisible until a seeded comparison generates them.
- **Why the blob pin in AC9 works:** `git ls-tree` prints mode, type and content hash in one line, so one string comparison rules out an edited byte, an executable bit and a symlink at once.
`─────────────────────────────────────────────────`

Stopping here, as instructed.

## Records note (PM, 2026-11-14)

Written by the PM after the merge. Everything above this heading is the seat's chat message of 20:28:24 EST, read as data from its session transcript `522f1fd7-9199-4247-a2fe-700bab1b08a7` with `brief-from-transcript.py`, which `pr-40-pass-2.5.md` prints (SHA-256 `20373071784e26c95c68714efbb525873133d18fcf7aedeffb1c96b928a8d6e4`). The message is 33,995 characters, SHA-256 `71e8bc6fa68cd8ff781516df12db69bb44e7dea165817fbbc56375cc9db0f99c`. The PM changed one line, the gate log's last row. All 150 assistant turns in that transcript name the model `claude-fable-5-2`, and the app's record of the session gives effort `high`.

- **The seat's scripts.**
  - **Printed in the brief:** `passm43.sh`, `ref-mutants.py`, `mut43.py` and `tripwire-counts.mjs`. Each printed block, with its final newline, has the SHA-256 in its heading. That is also the SHA-256 of the file in the seat's scratch folder, copied by the PM after the merge.
  - **Taken from earlier records:** `after-final.mjs`, `after-final.py`, `diff-gen.mjs` and `diff-ref.py`, from `pr-38-pass-2.5.md`, and `sparse-contract.mjs`, from Codex's Pass 2 comment. The seat's copies have the SHA-256 their sources give.
  - **Not printed in the brief:** `extract.py`, `quickstart43.sh` and `scan-texts.sh`. The appendix prints them byte for byte from the seat's scratch folder.
- **The seat's question.** It asked once, at 20:09:42 EST, whether three rulings of 2026-11-14 it had only second-hand were Beni's: Cursor's picker, finding 1's severity at Pass 1, and the history before Cursor's rebase. He answered "Yes" at 20:22:42 EST. `p25-turns.py`, printed in `pr-38-pass-2.5.md` (SHA-256 `3029bc6e2a5c9a4683a48b30a8555ef9be35200c74924a1351b4c32250f07b8b`), prints both turns from the seat's transcript.
- **Beni's ruling on this pass's finding 1.** The PM asked in its own session at 20:33:20 EST, and he answered at 20:33:40 EST, "Yes, record it open (Recommended)".
  - **The question:** "PR #43's Pass 2.5 (Fable 5.2 High) says mergeable, with one new Medium: three mutants of Codex's amendment to tools/reference/payoff.py pass Pass M on all 13 golden cases, and only PR #38's uncommitted differential catches them. The engine's own mutants are all killed. S03.1's non-goals defer a committed differential to a later slice. Merge PR #43 with that Medium recorded open?"
  - **The chosen option read:** "Merge from the PM's handoff. The Medium and Pass 2.5's Low (Pass M's case floor is still 11) go to the ideas list, next to the committed differential."
  - **He declined** "No, fix first".
  - **The PM's check first:** with each of those three mutants applied alone to a copy of the head's reference, `python3 -I <copy> fixtures/golden/` exits 0 with `cases 13, disagreements 0`. With the new skip removed, it exits 1. S03.1's non-goals say: "A committed differential of the engine against the reference on seeded cases is an idea for a later slice."
- **The squash message.** The PM edited the seat's proposed text before the handoff:
  - The first sentence follows Decision 6's wording, "as check 1 and `evaluateNote` already do". The seat's draft said that "no exported function" of the package throws on a hole, which is a wider claim than Decision 6 makes.
  - The review paragraph names the open findings, Beni's ruling on the Medium, and the reviewed head.
  - The subject and the three trailers are the seat's.
- **The handoff and the scan.** The PM gave Beni `private-scan-43.sh` and `merge-43.sh`, both in the appendix.
  - **What the scan covers:**
    - the diff, the commit messages, the title and body;
    - the comments, reviews and inline comments;
    - both briefs on `docs/pr-43-records`, at `8e7e43e`;
    - this executive brief, as sent;
    - the squash subject and body.

    Before it fetches anything, it checks the SHA-256 of each local file. It also prints the PR's comment count and head. The merge script checks the same two message files' hashes, so the merged text is the text scanned.
  - **How it was tested:** against synthetic lists only. It exits 1 with a term present in every surface, 0 with an absent term, and 2 on an empty list. In the two runs that reached GitHub, it printed 3 comments and head `00ee1e0`.
  - **The result:** at 20:37:49 EST Beni answered "Yes, merged" in the PM's session, to "Will you run the scan, then the merge if every count is 0?". He reported the outcome, not the counts.
- **The merge.** GitHub records it at 20:37:40 EST (`2026-11-15T01:37:40Z`), by `BeniCheni`, as squash `38a46170199299ddf0860791262c308799b47fa4` (`gh pr view 43 --repo BeniCheni/keel --json mergedAt,mergedBy,mergeCommit`).
- **For the gate-activation record.**
  - Shadow verdict: "would escalate", on sensitive paths alone.
  - Review verdict: "mergeable", with no High open.
  - Beni's decision: merge at the reviewed head from the PM's handoff, after the scan, with this pass's finding 1 open by his ruling.
- **Post-merge checks.** The PM ran `post-merge-43.sh` (appendix) in a fresh clone of `main`, with `KEEL_DATA_DIR` set to one empty `mktemp -d` (0 entries after the runs).
  - **The commit and its base.** `git rev-parse origin/main` prints `38a46170199299ddf0860791262c308799b47fa4`, the commit GitHub records for the PR. Its one parent is `0fda80f1bf02ec8a551491608fcc2cf3e70f598a`, which is also `git merge-base 0fda80f 00ee1e0`, so the base did not move during review.
  - **The tree.** `530b1aa759fc7f26997b053fd72e6cd182b33417` is both the squash's tree and the reviewed head's.
  - **The message.** The subject equals the handoff's, and the body equals it with trailing blank lines trimmed.
  - **The trailers.** `git log -1 --format='%(trailers:key=Co-authored-by)' 38a4617` prints Cursor, Claude and Codex in full. `git log --format='%an <%ae>' 0fda80f..00ee1e0` gives 1 Cursor, 2 Claude and 1 Codex commit, and Claude and Codex gave the review passes.
  - **Tag and branch.** No tag points at the squash, as expected for a PR that is not a release, and the branch `s03.1/reference-k` is gone.
  - **AC9 on `main`.** `git ls-tree 38a4617 -- packages/plugin-mln/src/payoff.honesty.test.ts` prints `100644 blob 6190a5eb06d34b22e075a5df5ffc1015887abbc5`.
  - **Install and verify.** `pnpm install --frozen-lockfile` and `pnpm verify` exit 0 on Node 24.22.2 and on 26.13.0. Core 178, plugin 212 and tooling 126 tests passed, and `git status --porcelain --untracked-files=all` prints nothing afterwards.
  - **Push CI.** Run 43663976525 on `38a4617` succeeded on attempt 1, with all five jobs (`gh run view 43663976525 --repo BeniCheni/keel --json headSha,event,conclusion,attempt,jobs`).
  - **Pass M on `main`.** `python3 -I tools/reference/payoff.py fixtures/golden/` exits 0 with `cases 13, disagreements 0` (Python 3.9.6).
  - **The PR thread.** PR #43 has 3 comments, 0 reviews and 0 inline comments. Its body has no edits (`userContentEdits` 0), so it still names `bd9ae45` as the head, as this brief's risks say.
- **PR #40's High** (`noteMetrics` throws on a hole in `closes`) closed with this merge. Its fix, `bd9ae45`, carries AC12's test, and the test fails without the fix. `pr-40-pass-2.5.md` and the index row now say so.
- **Builder claim 3,** the history before Cursor's rebase, rests on Beni's "Yes" in Codex's Pass 2 chat. The PM's evidence from Cursor's build checkout is in `pr-43-pass-1.5.md`, under "After Pass 2".
- **Privacy.**
  - **Codex's check.** Codex's private-list check is in its Pass 2 comment of 17:33:38 EST. It reports 0 on the diff, every commit message, the PR title and body, the comments, inline comments and reviews, both briefs at `d0d0ded`, and its own comment.
  - **Four texts came later:** `8e7e43e` on the records branch (the "After Pass 2" section), the Pass 2.5 comment (20:25:43 EST), this executive brief and the squash message. Beni's scan covered all four, and he reported it all zero.
  - **This records PR** adds new text: the records notes, the index rows, its commit messages and its PR body. Codex's cold read runs the private-list check over them.
- **Where the open items go.**
  - **The next ordinary docs PR** adds these to `docs/v0.1.0-ideas.md`:
    - a committed differential of the engine against the reference on seeded cases. This pass's three surviving reference mutants are its floor;
    - Pass M's case floor of 11, in S03's text and in `payoff.py`. Since `tools/reference/**` is a sensitive path, that change goes in a slice of its own;
    - a test that pins the golden generator's version (Pass 1's finding 3);
    - `missing` naming a member other than the worst, which only the guard's shape catches;
    - the README naming a failure run for `pnpm test:ci-evidence`, such as run 41113925991, the S00 red probe that `pr-3-pass-2.5.md` records.

    That PR also carries the README quickstart and status line, and the ideas from PR #38's records.
  - **Pass 1's finding 4,** the AC7 diff in the PR body, needs no change: the body is Cursor's, on a merged PR.
  - **An `AGENTS.md` PR** takes this pass's finding 3, which is PR #38's Pass 2.5 finding 6: the seat's name in the Seats and Workflow tables.

## Appendix: scripts

The seat's three scripts that its brief does not print come first, byte for byte, as its scratch folder held them after the merge. The PM's scripts follow. Each heading gives the file's SHA-256 (`shasum -a 256`).

### The seat's scripts

#### `extract.py` (`19aa34297a6dd4b6d9ed22ab7b29e5fe06447150bfc6ae4c5367a6354e58cf99`)

```python
# Extracts the fenced block that follows a "#### `name` (`sha256`)" heading in a Markdown record,
# writes it with a final newline, and checks its SHA-256 against the heading.
# usage: python3 -I extract.py <record.md> <outdir> <name>...
import hashlib, re, sys
text = open(sys.argv[1], encoding="utf-8").read().split("\n")
for name in sys.argv[3:]:
    start = next(i for i, line in enumerate(text) if line.startswith("#### `" + name + "`"))
    want = re.search(r"\(`([0-9a-f]{64})`\)", text[start]).group(1)
    open_ = next(i for i in range(start, len(text)) if text[i].startswith("```"))
    close = next(i for i in range(open_ + 1, len(text)) if text[i] == "```")
    body = "\n".join(text[open_ + 1:close]) + "\n"
    got = hashlib.sha256(body.encode("utf-8")).hexdigest()
    open(sys.argv[2] + "/" + name, "w", encoding="utf-8").write(body)
    print(name, got, "match" if got == want else "MISMATCH " + want)
```

#### `quickstart43.sh` (`63b1581e5ca9ccc9ce91413dc5dc6f2764774c1eede6e8034d106bb528a512c2`)

```sh
#!/bin/sh
# The README quickstart, command by command, each command's own exit code read. Then the skill's determinism command.
# The README's last step, pnpm test:ci-evidence, needs gh and is run separately.
# usage: quickstart43.sh <clone> <node version> <logdir>     (KEEL_DATA_DIR must already be exported)
C="$1"; V="$2"; L="$3"; mkdir -p "$L"
export PATH="$HOME/.nvm/versions/node/v$V/bin:$PATH"
cd "$C" || exit 97
echo "node $(node --version) HEAD $(git rev-parse HEAD) KEEL_DATA_DIR=${KEEL_DATA_DIR:?unset}"
n=0
run() { n=$((n+1)); "$@" > "$L/q-$V-$n.log" 2>&1; code=$?; tests=$(sed 's/\x1b\[[0-9;]*m//g' "$L/q-$V-$n.log" | grep -E '^ +(Tests|Test Files) ' | tr -s ' ' | tr '\n' ';'); echo "[$n] exit=$code :: $* :: $tests"; }
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
echo "KEEL_DATA_DIR entries: $(ls -A "$KEEL_DATA_DIR" | wc -l | tr -d ' ')"
echo "demo count: $(grep -c -i demo README.md)"
```

#### `scan-texts.sh` (`cb6982d918c64351388a18a7af09fee2f5acb6de0b7550cabbb56ef08f7e9c10`)

```sh
#!/bin/sh
# Scans loose text files (PR title and body, comments, briefs, drafts) with the repo's tripwire, counts only.
# The tripwire reads the tracked files of a Git repository, so the texts are committed to a throwaway
# repository that carries the clone's two policy files. With "plant" as the last argument, a check-digit-valid
# token built at run time (never printed) is added, to show that the scan can fail.
# usage: scan-texts.sh <clone> <new empty workdir> <text file>... [plant]
clone="$1"; temp="$2"; shift 2
here="$(dirname "$0")"
git -C "$temp" init -q -b main || exit 2
mkdir -p "$temp/tools/tripwire" "$temp/texts" || exit 2
cp "$clone/tools/tripwire/allowlist.txt" "$clone/tools/tripwire/vendors.txt" "$temp/tools/tripwire/" || exit 2
plant=no
for file in "$@"; do
  if [ "$file" = plant ]; then plant=yes; else cp "$file" "$temp/texts/" || exit 2; fi
done
if [ "$plant" = yes ]; then
  node --input-type=module -e '
    const { cusipCheckDigit } = await import(process.argv[1] + "/tools/tripwire/scan.mjs");
    const stem = "ZZ9QQ7KK"; const token = stem + String(cusipCheckDigit(stem));
    (await import("node:fs")).writeFileSync(process.argv[2] + "/texts/planted.txt", "token " + token + "\n");
  ' "$clone" "$temp" || exit 2
fi
git -C "$temp" add -A || exit 2
git -C "$temp" -c user.name=Claude -c user.email=noreply@anthropic.com -c commit.gpgsign=false commit -q -m "Scan review texts." || exit 2
git -C "$temp" update-ref refs/remotes/origin/main HEAD || exit 2
echo "files scanned: $(git -C "$temp" ls-files texts | wc -l | tr -d ' ')"
node "$here/tripwire-counts.mjs" "$clone" "$temp"; echo "exit=$?"
```

### The PM's scripts

#### `private-scan-43.sh`, the private-list scan for Beni to run (`8c9c1439f895fac8453e94b0939e1a596a1bf1f1cf7185221abe1a5cbcc408ec`)

```sh
bash <<'SCRIPT'
set -u
F="${KEEL_PRIVATE_LIST:-$HOME/.config/keel/private-terms.txt}"
R=BeniCheni/keel
N=43
H=/private/tmp/claude-501/-Users-benicheni-code-keel-pm/e156256f-23a2-45f7-ac1d-b6f35ecbdc13/scratchpad/handoff43
REC=8e7e43e135b44445edaf6a9d3b1fff80ba668978
{ test -r "$F" && test -s "$F"; } || { echo "list unreadable or empty"; exit 2; }
W="$(mktemp -d)" || { echo "mktemp failed"; exit 2; }; trap 'rm -rf "$W"' EXIT
grep -v '^[[:space:]]*$' "$F" > "$W/p" || { echo "list has no patterns"; exit 2; }
head -n 1 "$W/p" > "$W/control"
c="$(grep -F -i -c -f "$W/p" "$W/control")"
[ "$c" = 1 ] || { echo "control failed"; exit 2; }
echo "control: ok"
check() { [ "$(shasum -a 256 < "$H/$1" | cut -d' ' -f1)" = "$2" ] || { echo "$1: hash differs"; exit 2; }; cp "$H/$1" "$W/$3"; }
check pr-43-pass-2.5-brief.md 71e8bc6fa68cd8ff781516df12db69bb44e7dea165817fbbc56375cc9db0f99c exec-brief
check squash-43-subject.txt 476994510844e2af0f9f542573e9804157ff365270489083a7c7dcc2d1b8aaa6 squash-subject
check squash-43-body.txt 00cc91d268c327c14e12c2bb3597e8ee9296d4d93044af412dd316fd6fa4e809 squash-body
echo "local files: hashes ok"
gh pr diff $N --repo $R > "$W/diff" < /dev/null || { echo "diff fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/commits --jq '.[].commit.message' > "$W/commits" < /dev/null || { echo "commits fetch failed"; exit 2; }
gh pr view $N --repo $R --json title,body --jq '.title, .body' > "$W/title-body" < /dev/null || { echo "PR fetch failed"; exit 2; }
gh api --paginate repos/$R/issues/$N/comments --jq '.[].body' > "$W/comments" < /dev/null || { echo "comments fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/reviews --jq '.[].body' > "$W/reviews" < /dev/null || { echo "reviews fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/comments --jq '.[].body' > "$W/review-comments" < /dev/null || { echo "review comments fetch failed"; exit 2; }
for b in 0 1.5; do
  gh api -H 'Accept: application/vnd.github.raw' "repos/$R/contents/docs/reviews/pr-$N-pass-$b.md?ref=$REC" > "$W/brief-pass-$b" < /dev/null || { echo "brief $b fetch failed"; exit 2; }
done
echo "comments on PR #$N now: $(gh api repos/$R/issues/$N --jq .comments < /dev/null)"
echo "head of PR #$N now: $(gh pr view $N --repo $R --json headRefOid --jq .headRefOid < /dev/null)"
status=0
for s in diff commits title-body comments reviews review-comments brief-pass-0 brief-pass-1.5 exec-brief squash-subject squash-body; do
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

#### `merge-43.sh`, the merge commands as given to Beni (PR #43 is merged, so they now fail) (`ed1b73681caad894c2c2f39d980e86a566c408834318591808b77c2ea012a603`)

```sh
bash <<'SCRIPT'
set -u
H=/private/tmp/claude-501/-Users-benicheni-code-keel-pm/e156256f-23a2-45f7-ac1d-b6f35ecbdc13/scratchpad/handoff43
[ "$(shasum -a 256 < "$H/squash-43-subject.txt" | cut -d' ' -f1)" = 476994510844e2af0f9f542573e9804157ff365270489083a7c7dcc2d1b8aaa6 ] || { echo "subject hash differs"; exit 2; }
[ "$(shasum -a 256 < "$H/squash-43-body.txt" | cut -d' ' -f1)" = 00cc91d268c327c14e12c2bb3597e8ee9296d4d93044af412dd316fd6fa4e809 ] || { echo "body hash differs"; exit 2; }
gh pr ready 43 --repo BeniCheni/keel || exit 1
gh pr merge 43 --repo BeniCheni/keel --squash --match-head-commit 00ee1e07a0e6bd355f32bafc88bb4a133ea03205 --subject "$(cat "$H/squash-43-subject.txt")" --body-file "$H/squash-43-body.txt"
SCRIPT
```

#### `post-merge-43.sh`, the post-merge checks (`69a37c8ddf4e9b8113cd6db9558b6a97fc177a54c8e0ec0647378ad52ca4282d`)

```sh
#!/bin/bash
# Post-merge checks for PR #43, in a fresh clone of main. The base did not move during review (0fda80f),
# so the squash commit's tree must equal the reviewed head's tree.
SP=/private/tmp/claude-501/-Users-benicheni-code-keel-pm/e156256f-23a2-45f7-ac1d-b6f35ecbdc13/scratchpad
D=$SP/post-merge-43
SQ=38a46170199299ddf0860791262c308799b47fa4
HEAD_SHA=00ee1e07a0e6bd355f32bafc88bb4a133ea03205
PARENT=0fda80f1bf02ec8a551491608fcc2cf3e70f598a
if [ -e "$D" ]; then echo "exists: $D"; exit 2; fi
export KEEL_DATA_DIR="$(mktemp -d)"
gh repo clone BeniCheni/keel "$D" -- -q < /dev/null || { echo "clone failed"; exit 3; }
cd "$D" || exit 3
git fetch -q origin pull/43/head:pr43-head || { echo "fetch head failed"; exit 3; }
echo "origin/main      $(git rev-parse origin/main)"
echo "HEAD             $(git rev-parse HEAD)"
echo "parents          $(git show -s --format=%P $SQ)"
echo "pr head ref      $(git rev-parse pr43-head)"
echo "squash tree      $(git rev-parse $SQ^{tree})"
echo "head tree        $(git rev-parse $HEAD_SHA^{tree})"
echo "merge-base       $(git merge-base $PARENT $HEAD_SHA)"
echo "tags at squash   [$(git tag --points-at $SQ | tr '\n' ' ')]"
echo "branch on origin [$(git ls-remote --heads origin s03.1/reference-k)]"
echo "author           $(git log -1 --format='%an' $SQ) (GitHub squash)"
echo "committer        $(git log -1 --format='%cn %cI' $SQ)"
git log -1 --format=%s $SQ > $SP/squash-43-merged-subject.txt
git log -1 --format=%b $SQ > $SP/squash-43-merged-body.txt
echo "--- trailers"
git log -1 --format='%(trailers:key=Co-authored-by)' $SQ
echo "--- AC9 on main"
echo "ls-tree on main  $(git ls-tree $SQ -- packages/plugin-mln/src/payoff.honesty.test.ts | cut -f1)"
echo "--- Pass M on main ($(python3 --version 2>&1))"
python3 -I tools/reference/payoff.py fixtures/golden/ > $SP/pm43-passm.out 2>&1; echo "pass M exit $?: $(tail -1 $SP/pm43-passm.out)"
for v in 24.22.2 26.13.0; do
  echo "== node v$v"
  ( export PATH="$HOME/.nvm/versions/node/v$v/bin:$PATH"; echo "node $(node -v)";
    pnpm install --frozen-lockfile > $SP/pm43-install-v$v.log 2>&1; echo "install exit $?"
    pnpm verify > $SP/pm43-verify-v$v.log 2>&1; echo "verify exit $?"
    grep -E '^\s+Tests\s' $SP/pm43-verify-v$v.log | sed 's/\x1b\[[0-9;]*m//g'
    echo "status lines: $(git status --porcelain --untracked-files=all | wc -l | tr -d ' ')" )
done
echo "KEEL_DATA_DIR entries: $(ls -A "$KEEL_DATA_DIR" | wc -l | tr -d ' ')"
```
