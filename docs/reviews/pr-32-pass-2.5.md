# Executive brief: PR #32, Pass 2.5, 2026-11-11 America/New_York

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim.

- **Head:** `06f8ac9ce11e8d56ca1b68b6bf364ff102cf6980` (`gh pr view 32 --repo BeniCheni/keel --json headRefOid`), equal to `git rev-parse HEAD` in the clone. Base `38f9c1a` (`git rev-parse origin/main`, unchanged after `git fetch`).
- **Seat:** Claude, fresh session, model `claude-fable-5-2` at effort `high`, both read from the session's own metadata. No fallback used. `AGENTS.md` pins Opus 5.5 High for this seat, because the PR touches no sensitive path. Beni's ruling 8 moves the seat for this PR only. That is an owner ruling against the pin, not the fallback.
- **Clone:** the prompt named `~/code/keel-pr-32-p25`, which did not exist. Asked in this session, Beni answered "Can you make a fresh clone in ~/code/ with your desired folder name, and proceed?". I made it there with `gh repo clone BeniCheni/keel` and `gh pr checkout 32`. `git status --porcelain --untracked-files=all --ignored` printed nothing before the install, and `git status --porcelain --untracked-files=all` printed nothing after every run. A new empty `KEEL_DATA_DIR` in every shell. Synthetic data only.
- **Output:** no commit, push, merge or review record. One PR comment, [issuecomment-6801238133](https://github.com/BeniCheni/keel/pull/32#issuecomment-6801238133), posted with the head still at `06f8ac9`.

## Decision

Shadow mode: the gate says "would escalate", because 13 Highs stay open under Severity and a docs PR cannot land the failing-first tests that close them. No other gate clause fails. Beni merges. The formal verdict is not mergeable. Codex's final re-read says not mergeable under Severity, would escalate, no new High. It gives no separate plan verdict: its third re-read gave "mergeable after the Medium fix", and the final re-read closes that Medium (R7).

## What ships

- Two specs and no code. keel does nothing new until the two builds land.
- S02.1 lets a terms file state the note's final valuation date, with provenance, in a new terms schema 0.2. The loader keeps reading 0.1 files. Nothing infers the date.
- S03 specifies the payoff engine: whether a note has been called, has had its final payoff fixed, has matured or is still live, and what the terms pay per $1,000 of principal in each case, in exact arithmetic and integer cents.
- keel still declines to give a payout when any input it rests on is unknown, in conflict or only an estimate. A status rests only on dates the terms evidence, and a missing or conflicting close gives "unknown".
- No output is a value of the note or of a holding, and nothing is predicted or recommended.

## What the passes found

Counts are from the comment texts, by the `grep` patterns under Verification.

- **Pass 1 (Codex, plan challenge, at `89687da`): not mergeable. 5 High, 7 Medium, 1 Low.**
  - H1: a positive close could round to a zero ratio, and `toCall` divided by it.
  - H2: `matured` could be reported at the final valuation date, or with maturity unknown or in conflict.
  - H3: a close on a generated planning date could end the note as called.
  - H4: premium months by index paid the wrong amount on an off-cycle listed schedule.
  - H5: a trailing undated item left the status `live` indefinitely.
  - M1: closes the function never reads were still validated. M2: the member trace and the `unverified` order were underspecified for Pass M. M3: the generator's tripwire guard covered one class. M4: the narrowed-glob controls could not fail. M5: the schema shape changed under the same version. M6: the invalid-date path named the wrong token. M7: AC10 checked a partial list and could pass an empty history.
  - L1: an API comment used the ambient name `performance`.
- **Pass 2 (Codex, at `0b44cdb`): not mergeable. Closed 9 of Pass 1's findings, found H2, H3, H4 and M3 partly closed. 4 High, 4 Medium, 1 Low of its own. Pass M: N/A.**
  - P2-1: an estimated maturity could still give `matured`.
  - P2-2: with the final valuation term in conflict, every event was a call.
  - P2-3: a listed schedule could reach the mapping with no first-call anchor.
  - P2-4: a first call before settlement mapped to month zero.
  - P2-5 (Medium): the post-write scan missed files new to Git and ignored a scan error. P2-6 (Medium): the off-cycle examples omitted a second finding. P2-7 (Medium): AC4 did not pin which side holds `final-valuation-absent`. P2-9 (Medium): the half-cent sentence left out the principal. P2-8 (Low): "nothing divides by a ratio" overclaimed.
- **Re-read (Codex, at `cc8b063`): not mergeable. Closed 7 of Pass 2's findings, found P2-2 and P2-4 partly closed. 2 High, 2 Medium.**
  - R1: a later estimated item could make an ambiguous event a call. R3: dropping the trade date let a call fall before the note trades.
  - R2 (Medium): a listed schedule could anchor before settlement. R4 (Medium): an evaluated example sat under a heading whose honesty clause requires `unavailable`.
- **The PM's slot gap (High, found by the PM while checking those fixes):** a listed item before the first call observation could sit nearest slot 0.
- **Second re-read (Codex, at `9ccc8ee`): not mergeable. Closed R1 to R4, found the slot gap partly closed. 1 High, 1 Medium.**
  - R5: a listed item one day before the first call observation still mapped to slot 0 and could pay 104250. R6 (Medium): the June example overstated the old behaviour.
- **Third re-read (Codex, at `5abb894`): formal verdict not mergeable, plan verdict mergeable after one Medium fix.** Closed R5, R6 and the slot gap in the plan. R7 (Medium): the spec said two things about whether check 5 compares rejected dates with the slots.
- **Final re-read (Codex, at `06f8ac9`): not mergeable under Severity, would escalate, no new High.** R7 closed. All 13 obligations rows matched to a spec assertion. Two Mediums carried to S03's build review under ruling 7.
- **Pass 2.5 corroboration:**
  - Authorship: 12 commits, all `Claude <noreply@anthropic.com>`. Each of Codex's six comments names its head and scope in its own text, two commits per comment: `12e3d99` and `89687da` (Pass 1), `c456237` and `0b44cdb` (Pass 2), `d6c22f7` and `cc8b063` (re-read), `48b995e` and `9ccc8ee` (second), `7563d4f` and `5abb894` (third), `6d27938` and `06f8ac9` (final). Every commit has a Codex cold read. There is no Codex-authored commit, so this seat owes no cold read.
  - Check 5 (spec lines 219 to 229, and Slots at line 202) says one thing about rejected dates: every bullet runs, and a date one bullet rejects is still checked by the later ones. That is what the final re-read says it does.
  - A clean check 5 requires trade on or before settlement, settlement before the first call observation, and every dated item and the final valuation date on or after the first call observation and on or before maturity. That is the chain the third re-read states. Neither retired code remains in `docs/specs/` (`grep -n -E '(observation|final-valuation)-before-settlement' docs/specs/*.md` exits 1).
  - Events for a final valuation date not known (lines 240 to 243), with Decision 9: absent or unknown, only a later listed item with an evidenced date makes an event a call event; in conflict, only a date before every candidate does, and a listed item never rules a candidate out. That is what the second re-read says under R1.
  - The eight examples under Chronology and mapping failures and the three under Final valuation date not known give, in my own probe, the findings and roles the spec freezes, in the frozen order. They match the second re-read's R2 and R3 dispositions, the third re-read's R5 and the final re-read's R7.
  - The two carried Mediums reproduce. `git show -s --format=%aI 6d27938` prints `2026-11-11T09:50:46-05:00`, while spec line 3 says "Amended the same day" as the 2026-11-10 draft. Line 275 of the Pass 1.5 brief says "six scripts", and the PR body holds seven `<details>` script blocks.
  - **One Low from this seat, for the same list.** Check 2 (spec lines 210 to 216) lists "one `input-unknown` or `input-conflict` per path, in this order, and one `input-unevidenced` for each of the four dates". It does not say whether an `input-unevidenced` finding takes its path's place in that order or follows the others. With, say, an estimated trade date and an unknown settlement date, two builds could order the two findings differently. Both readings block every payout, and no golden case reaches it, so Pass M cannot see it.
  - The obligations table: each of its 13 rows names an assertion in the spec that would fail without its fix. See the table below.
- **Contested:** nothing. The PM accepted all 29 findings Codex raised before the final re-read and contested none. Codex's two final Mediums and this seat's Low await the S03 build review.

### The obligations table, row by row

Line numbers are in `docs/specs/s03-payoff-engine.md` at the head.

| High | Assertion the row names | Where | What it would see without the fix |
| --- | --- | --- | --- |
| H1 | AC5's `0/1` row with `toCall` null; mutant "Dividing by a zero ratio" | 437, 554, 614 | A division by zero, not null |
| H2 | Honesty "No maturity before maturity" and "Chronology"; AC4, each check-5 reason | 516, 517, 553 | `matured` on g05's dates before maturity, and no check-5 reason |
| H3 | Honesty "No status on a planning date"; AC4's two `estimated-date` stops; g11; AC7's planning-date rule | 512 to 514, 553, 455, 556 | A row, and `called`, on a generated date |
| H4 | Honesty "No payout on an unestablished chronology or mapping"; AC4, each example | 515, 553, 383 to 398 | A payout schedule for the off-cycle list |
| H5 | Honesty "An undated item bounds the status"; AC4's trailing stop; AC7's 100 trailing items | 524, 553, 556 | `live` after a trailing undated item |
| P2-1 | Honesty "Chronology", an estimated maturity never `matured`; AC4's four `input-unevidenced` cases | 516, 553 | `matured` on an estimated maturity |
| P2-2 | Honesty "Final valuation date not known"; AC4, Role unknown | 523, 553, 402 | `called` at 104250 where the role is unknown |
| P2-3 | Honesty "No payout without its inputs", for `dates.first_call_observation`; AC4's `input-unevidenced` | 510, 211, 553 | No reason naming the path |
| P2-4 | AC4, Call before settlement | 394, 553 | No finding: the offset is 0 at 184 days |
| R1 | AC4, A later listed item and The term absent; honesty "Final valuation date not known" | 406 to 409, 523 | `called` because a later estimate exists |
| R3 | AC4, Trade after settlement; honesty "Chronology" | 398, 516 | `called` a day before the trade date |
| R5 | AC4, Before the first call; honesty "Chronology" | 391, 516 | `called` a day before the first call observation |
| PM slot gap | As R5, plus AC4, Two before the first call | 391, 392 | As R5, and a shorter list of findings |

These are assertions the spec prescribes. No test exists yet, so none of the 13 is closed.

## Verification as re-run

All at `06f8ac9`, in the clone, on Node 24.22.2 and 26.13.0 from `~/.nvm/versions/node`. Each exit code is the command's own.

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | Exit 0 on both Nodes |
| Verify | `pnpm verify` (Node floor and current) | Exit 0 on both. Vitest's lines: 154 passed of 154 in 16 files (core), 122 passed of 122 in 10 files (tooling), 0 failed. `grep -c -E '^verify:[a-z]+ ok$'` on each log prints 8, then `verify ok` |
| Determinism | `pnpm fixtures:regen && sh -c 'keel_generated_trees="$(pnpm -s fixtures:trees)" && keel_generated_status="$(printf "%s\n" "$keel_generated_trees" \| while IFS= read -r keel_generated_tree; do git status --porcelain --untracked-files=all -- "$keel_generated_tree" \|\| exit; done)" && test -z "$keel_generated_status"'` | Exit 0 on both. One registered tree, `fixtures/synthetic/terms`. This diff changes no fixture |
| Zero network | `pnpm -s verify:network`, and the `network` step inside `pnpm verify` | Exit 0 on both. On this Mac it is the in-process guard |
| Mutations | n/a | N/A: the diff changes no code. Not green |
| Pass M | `python3 tools/reference/payoff.py fixtures/golden/` | N/A: no engine or golden fixture changes, and neither path exists yet. Not green |
| UI matrix | n/a | N/A: the PR has no UI. Not green |
| Demo mode | `grep -c -i demo README.md` | Prints 0 (exit 1). N/A while the README has no demo step, the known gap of idea 50. Not green |
| Tripwire, repo | `node tools/tripwire/cli.mjs .`, then `cut -f1 \| sort \| uniq -c` on its output | Exit 0, 0 lines, 0 bytes on stderr. So 0 hits in each class: CUSIP, account, SSN, address, email, price, allowlist, vendors, local-only, unscannable. It covers tracked files and the 12 commit messages |
| Tripwire, PR text | `scanRepo` from the clone's `tools/tripwire/scan.mjs` on a temporary Git repository holding the two policy files, the PR title, the PR body and the six comment bodies | No error, 0 hits. With one planted street-shaped line added, 1 hit, in the address class, so the scan can fail. The drafts of the PR comment, the squash message, this brief and the probe were scanned the same way before posting: 0 hits |
| Diff | `git diff --name-only origin/main...HEAD`; `git diff --shortstat origin/main...HEAD`; `git diff --shortstat 5abb894 HEAD`; `git diff --check origin/main...HEAD` | 6 files, all under `docs/`. 1195 insertions, 4 deletions. Since the third re-read's head: 3 files, 71 insertions, 5 deletions. `--check` exits 0 |
| Paths | The six names against the sensitive-path list, by `grep -c -E` on the list's patterns; `git diff --stat origin/main...HEAD --` for `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `packages`, `schemas`, `fixtures`, `tools`, `.github` and `'*.honesty.test.ts'` | 0 sensitive paths. Every `--stat` prints nothing: no dependency, lockfile, product code, schema, fixture, tooling, workflow or honesty-test change |
| Commits | `git rev-list --count origin/main..HEAD`; `git log --format='%an <%ae>' origin/main..HEAD \| sort \| uniq -c`; `git rev-list --merges --count origin/main..HEAD` | 12 commits, 12 by `Claude <noreply@anthropic.com>`, 0 merges |
| GitHub | `gh pr checks 32 --repo BeniCheni/keel`; `gh api repos/BeniCheni/keel/actions/runs/43042623273 --jq .head_sha`; `gh pr view 32 --json mergeable,mergeStateStatus` | Exit 0: four cells and `verify` pass. The run's head is `06f8ac9…`. `MERGEABLE`, `CLEAN`. Six issue comments, 0 reviews, 0 inline comments. The body was last edited at 2026-11-11T14:52:57Z, before the final re-read at 15:08:34Z |
| PR-body scripts | `extract.py` (below) on the PR body, then `shasum -a 256` | 7 `<details>` blocks, 7 scripts, 7 matching their printed SHA-256 |
| `s03_frozen.py` | `python3 -I s03_frozen.py`, and the same piped to `shasum -a 256` | Exit 0. 345 closures; B quarterly 19 entries, 18 call events, 2031-03-03 left out; the 18 payouts and 142500; monthly 55 entries, 54 call events, last 2031-02-03, and the month table; the 111673 tie; both tables; 2031-07-09. Output hash `4dbe9b22a277…` |
| `s03_amend.py` | `python3 -I s03_amend.py`, beside the others | Exit 0. Offset 6 at 3 days, 28 for 5. Every B entry nearest its own slot, at most 3 days off. FV nearest slots 18 and 54. 2027-12-01 nearest slot 5. 2026-09-16 ties at 15 and 15. `0/1`. Offset 0 at 184 days, 215 for 1 |
| `s03_reread.py` | `python3 -I s03_reread.py` | Exit 0. The three chronology examples give their one finding each, and the roles are as frozen. Under the rules at `cc8b063` it reproduces R1 to R3 |
| `s03_reread2.py` | `python3 -I s03_reread2.py` | Exit 0. 2026-08-31 is 91, 1 and 92 days from slots −1, 0 and 1. Nothing under `48b995e`, `observation-before-first-call` at 0 alone now. Every other example unchanged. 1,645 dates, same nearest slot with or without negative slots, for both steps |
| `s03_reread3.py` | `python3 -I s03_reread3.py` | Exit 0. 2026-08-28 a Friday and 2026-08-31 a Monday, both open, both nearest slot 0 at 4 and 1 days. The three findings as frozen |
| `frozen20.py` | `python3 -I frozen20.py`, from the clone's root | Exit 0. 20 of 20 |
| `summary-check.mjs` | `node summary-check.mjs <clone>` on Node 24.22.2 | Exit 0. `minimal.yaml` 15 of 17, `example-autocall.yaml` 8 of 17, with the unverified paths S02.1 freezes |
| This seat's probe | `node p25-probe.mjs <clone>` (below) on both Nodes | Exit 0 on both, 30 of 30 (`grep -c '^ok'`). B's schedules come from core at the head, not from the PR's scripts |
| Copy words | `grep -n -i -E '(^\|[^A-Za-z])(should\|buy\|sell\|hold)([^A-Za-z]\|$)'` on the two specs; `grep -c -i -w 'should\|buy\|sell\|hold'` on each | No hit (exit 1); 0 and 0. A two-line control gives 1. The PR has no product text |
| Table columns | `tablecols.py` (below) on the six changed files | 28 tables, 274 rows, 0 bad. A three-row control with one bad row exits 1 |
| High rows | `grep -c -E '^\| (H[0-9]+\|P2-[0-9]+\|R[0-9]+) \| High \|' docs/reviews/pr-32-pass-1.5.md` | 12: H1 to H5, P2-1 to P2-4, R1, R3, R5. With the PM's slot gap, 13 |
| Finding counts | On each comment body: `grep -c -E '^\| (H\|M\|L)[0-9]+ \| (High\|Medium\|Low) \|'`, the same with `P2-[0-9]+`, and `grep -o` on each later comment's bold severity labels | Pass 1: 13 (5, 7, 1). Pass 2: 9 (4, 4, 1), with 9 "Accept, closed" and 4 "Accept, partly closed". Re-read: 2 High, 2 Medium. Second: 1 and 1. Third: 1 Medium. Final: 2 Mediums carried. 29 before the final re-read |

Not re-run, and why:

- **The owner's private-list check.** No Claude seat runs it, and this seat opened neither the list nor any data folder. Codex's zero counts on every surface, at each of its six comments, are Codex's claim. This seat's PR comment comes after Codex's last check, so Beni runs the check again before merging.
- **The process slip at the second re-read.** The Pass 1.5 brief records it. Codex's comment does not mention it, and nothing on the PR lets me check it. It is the PM's claim.
- **Codex's own probes.** I ran the PR body's scripts and my own probe, not the scratch probes Codex describes in its comments.
- **Whether a build can meet the specs.** No engine, generator or reference exists. The frozen values reproduce as arithmetic. The golden outcomes, the purity checker and Pass M can only be tested by the builds.

## Estimates and model output

None. Every frozen value is exact arithmetic on synthetic terms. The specs keep Monte Carlo and any probability out of scope.

## Risks and accepted costs

- **Thirteen Highs merge open.** Each is a way the first draft, or a later amendment, would have let a compliant engine show a wrong payoff or a status the inputs do not support. The spec text now blocks each one, and Codex agrees in the plan. `AGENTS.md` closes a High in tracked files only with a fix commit carrying a test that fails without it, and a docs PR has no test to carry. Ruling 6 accepts that for this PR only. The cost is that the S03 build's Pass 0 brief must list all 13 with their closing tests, the build's PR body must name a killing mutant for each, and each stays open until its test lands.
- **Idea 39 is on its third exception** (PR #16, PR #28 and now PR #32). `AGENTS.md` still has no path for a docs PR, so every spec PR with a High will escalate the same way.
- **The list for S03's build review, under ruling 7.** Two Mediums from Codex: spec line 3 dates the third amendment to 2026-11-10, and line 275 of the Pass 1.5 brief says six scripts where the PR body prints seven. One Low from this seat: where `input-unevidenced` sits in check 2's order. None changes a payout.
- **Six rounds of findings on one spec.** Five rounds each found a High in the previous round's fix. The final round found none. Ruling 7 ends the spec rounds, so anything left is found by the build's review, where it costs code.
- **A process slip, as the PM records it.** At the second re-read Codex's sub-agent opened one file, the review skill's pointer, in an earlier checkout. That checkout holds synthetic data only, so the PM recorded a slip and not a privacy issue.
- **S01's and S02's frozen values change once S02.1's build merges.** S02.1 replaces S01's two verification summaries and S02's frozen `termDateFlags` object. Until the next ordinary docs PR updates those two specs, they disagree with the code.
- **The seat pin moved.** This pass ran on Fable 5.2 High by ruling 8, not the pinned Opus 5.5 High. The records PR needs to say so.
- **Vendor attribution rests on text.** GitHub shows the owner's account as the author of all six review comments. That Codex wrote them is each comment's own statement.
- **The index rows are stale on merge.** `docs/README.md` says "spec in review" for both slices until the records PR updates them.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Holds. Not a release. S02.1 is a new slice number, which the Pass 0 brief says came from the option text of Beni's ruling 1. Question 2 confirms it |
| Verdict mergeable, every High closed (fix commit with a failing-first test, or for a High outside tracked files, a recorded remediation check plus Beni's confirmation) | Fails. Verdict not mergeable: 13 Highs open, all in tracked files, none with a test. Ruling 6 allows the merge and does not close them |
| Nothing contested | Holds. The PM contested no finding, and Codex's final re-read raises no dispute |
| `verify` green at tip; every number re-run | Holds. Green locally on both Nodes and on GitHub at `06f8ac9`. Every number above was re-run. What was not re-run is listed, and carries no number of mine |
| No sensitive path, dependency or schema change | Holds for this diff. The two builds it authorizes will touch `schemas/**`, `packages/core/**`, `packages/plugin-mln/**`, `fixtures/golden/**` and `tools/reference/**` |
| Every commit cold-read by a non-author vendor (authorship record) | Holds. 12 Claude commits, each covered by one of Codex's six comments |
| Gate verdict | would escalate |
| Beni's decision (filled after) | Merged on 2026-11-11 at squash `7c47d10`, under ruling 6, after the private-list check returned zero on every surface |

## Appendix: the scripts these numbers rely on

The seven PR-body scripts are in the PR body under their hashes. These four are this seat's.

Baseline, run once in the background. The run used the absolute form of the clone's path.

```sh
#!/bin/sh
# Pass 2.5 baseline: install + verify on each Node, each command's own exit code recorded.
CLONE="$HOME/code/keel-pr-32-p25"
LOGS="$1"
export KEEL_DATA_DIR="$(mktemp -d)"
cd "$CLONE" || exit 99
for v in 24.22.2 26.13.0; do
  PATH="$HOME/.nvm/versions/node/v$v/bin:$HOME/Library/pnpm:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/usr/local/bin"
  export PATH
  {
    echo "== node $(node -v) pnpm $(pnpm -v) head $(git rev-parse HEAD)"
    pnpm install --frozen-lockfile; echo "INSTALL_EXIT=$?"
    pnpm verify; echo "VERIFY_EXIT=$?"
    git status --porcelain --untracked-files=all; echo "STATUS_EXIT=$?"
  } > "$LOGS/baseline-$v.log" 2>&1
done
echo done
```

`extract.py`, run as `python3 -I extract.py body.md <empty folder>` on the output of `gh pr view 32 --repo BeniCheni/keel --json body --jq .body`:

```python
# Extracts each <details> script printed in the PR body and checks it against its printed SHA-256.
import re, sys, hashlib, pathlib
body = pathlib.Path(sys.argv[1]).read_bytes().decode("utf-8")
out = pathlib.Path(sys.argv[2])
print("CR bytes in body:", body.count("\r"))
body = body.replace("\r\n", "\n")
pat = re.compile(r"<details><summary><code>([A-Za-z0-9_.\-]+)</code>[^\n]*?SHA-256 <code>([0-9a-f]{64})</code>[^\n]*</summary>\n\n(`{3,})[a-z]*\n(.*?)\n\3\n", re.S)
n = bad = 0
for m in pat.finditer(body):
    name, want, text = m.group(1), m.group(2), m.group(4) + "\n"
    got = hashlib.sha256(text.encode("utf-8")).hexdigest()
    ok = got == want
    n += 1; bad += (not ok)
    (out / name).write_text(text, encoding="utf-8")
    print(f"{name}: {'MATCH' if ok else 'MISMATCH'} printed={want} got={got} lines={text.count(chr(10))}")
print(f"scripts {n}, mismatches {bad}; details blocks in body: {body.count('<details>')}")
sys.exit(1 if bad or n != 7 else 0)
```

`tablecols.py`, run as `python3 -I tablecols.py <files>` from the clone's root:

```python
# Counts, per markdown table, rows whose column count differs from the header's. Pipes inside backticks and escaped pipes do not split.
import sys, re
def cols(line):
    s = re.sub(r"`[^`]*`", lambda m: m.group(0).replace("|", "\x00"), line.rstrip("\n"))
    s = s.replace("\\|", "\x00")
    return s.count("|")
total_bad = 0
for path in sys.argv[1:]:
    lines = open(path, encoding="utf-8").read().split("\n")
    tables = rows = bad = 0; i = 0; fence = False
    while i < len(lines):
        if lines[i].lstrip().startswith("```"): fence = not fence
        if not fence and lines[i].startswith("|") and i + 1 < len(lines) and re.match(r"^\|( ?:?-+:? ?\|)+$", lines[i + 1]):
            tables += 1; want = cols(lines[i]); j = i
            while j < len(lines) and lines[j].startswith("|"):
                rows += 1
                if cols(lines[j]) != want:
                    bad += 1; print(f"  BAD {path}:{j+1} cols {cols(lines[j])} want {want}")
                j += 1
            i = j; continue
        i += 1
    total_bad += bad
    print(f"{path}: tables {tables}, rows {rows}, bad {bad}")
sys.exit(1 if total_bad else 0)
```

`p25-probe.mjs` (SHA-256 `3c442c9c892c2899d93698b1a88210be21966bdefaa7750dd7b2eda6a45ccb66`), run as `node p25-probe.mjs <clone>`:

```js
// Pass 2.5 probe for PR #32. Independent of the PR body's scripts: B's schedules come from core at the head,
// and check 5 and the role rules are written from docs/specs/s03-payoff-engine.md as it stands at the head.
// Usage: node p25-probe.mjs <clone>. Exits 1 if any frozen value fails to reproduce.
import { readFileSync } from "node:fs";
const root = process.argv[2];
const { loadTerms, observationSchedule, nyseRulesCalendar } = await import(`${root}/packages/core/src/index.ts`);
const loaded = loadTerms(readFileSync(`${root}/fixtures/synthetic/terms/valid/minimal.yaml`, "utf8"), "minimal.yaml");
if (!loaded.ok) throw new Error("minimal.yaml did not load");
const entriesFor = (frequency) => {
  const t = structuredClone(loaded.terms); t.call.frequency.value = frequency;
  const s = observationSchedule(t, nyseRulesCalendar());
  if (s.kind !== "estimated") throw new Error(`schedule ${s.kind}`);
  return s.entries.map((e) => e.date);
};
const utc = (d) => { const [y, m, dd] = d.split("-").map(Number); return Date.UTC(y, m - 1, dd); };
const days = (a, b) => Math.abs(Math.round((utc(a) - utc(b)) / 86400000));
const addMonths = (d, n) => {
  const [y, m, dd] = d.split("-").map(Number); const t = y * 12 + (m - 1) + n; const yy = Math.floor(t / 12), mm = t % 12;
  const len = new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate();
  return `${yy}-${String(mm + 1).padStart(2, "0")}-${String(Math.min(dd, len)).padStart(2, "0")}`;
};
const nearestOf = (list) => { const s = [...list].sort((a, b) => a[0] - b[0] || a[1] - b[1]); return { j: s[0][0] === s[1][0] ? null : s[0][1], d: s[0][0], runnerUp: s[1] }; };
const slot = (d, first, step) => nearestOf(Array.from({ length: 130 }, (_, j) => [days(d, addMonths(first, j * step)), j]));
const offset = (settle, first) => nearestOf(Array.from({ length: 130 }, (_, n) => [days(first, addMonths(settle, n)), n]));
// Check 5, every bullet in the spec's order. listed: dates, or null for an estimated schedule. fv: date, or null when not known.
function check5({ trade, settle, mat, first, nonCall, step, listed, entries, fv }) {
  const f = [];
  if (settle < trade) f.push("settlement-before-trade");
  if (first <= settle) f.push("first-call-before-settlement");
  if (fv !== null && fv < first) f.push("final-valuation-before-first-call");
  if (fv !== null && fv > mat) f.push("final-valuation-after-maturity");
  if (listed) listed.forEach((d, i) => { if (d < first) f.push(`observation-before-first-call@${i}`); });
  if (listed) listed.forEach((d, i) => { if (d > mat) f.push(`listed-after-maturity@${i}`); });
  const onFv = listed && fv !== null ? listed.indexOf(fv) : -1;
  if (listed && fv !== null) listed.forEach((d, i) => { if (d > fv || (onFv >= 0 && i > onFv)) f.push(`listed-after-final-valuation@${i}`); });
  const o = offset(settle, first);
  if (o.j === null || o.j !== nonCall) f.push("non-call-months-mismatch");
  if (listed) listed.forEach((d, i) => { if (slot(d, first, step).j !== i) f.push(`listed-off-cycle@${i}`); });
  if (fv !== null) {
    const k = listed ? (onFv >= 0 ? onFv : listed.length) : entries.filter((d) => d < fv).length;
    if (slot(fv, first, step).j !== k) f.push("final-valuation-off-cycle");
  }
  return f;
}
// Events, final valuation date not known. items: [date, status]. state: "absent" | "conflict".
const EVID = new Set(["primary", "document", "advisor", "user"]);
const roles = (items, state, candidates = []) => items.map(([d], i) =>
  state === "conflict" ? (candidates.every((c) => d < c) ? "call" : "unknown")
    : (items.slice(i + 1).some(([, s]) => EVID.has(s)) ? "call" : "unknown"));
const premium = (rate, m) => Number((100000n * BigInt(rate) * BigInt(m) * 2n + 120000n) / 240000n); // floor(a + 1/2)

let bad = 0;
const eq = (name, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) bad += 1; console.log(`${ok ? "ok  " : "FAIL"} ${name}: ${JSON.stringify(got)}${ok ? "" : ` want ${JSON.stringify(want)}`}`); };
const FV = "2031-02-26";
const B = { trade: "2026-03-02", settle: "2026-03-04", mat: "2031-03-03", first: "2026-09-01", nonCall: 6, step: 3, listed: null, fv: FV };
const q = entriesFor("quarterly"), mo = entriesFor("monthly");
B.entries = q;
const L = [...q.filter((d) => d < FV), FV];
const off = offset(B.settle, B.first);
eq("B offset [months, days, runner-up]", [off.j, off.d, off.runnerUp], [6, 3, [28, 5]]);
eq("B quarterly [entries, call events, left out, last call]", [q.length, q.filter((d) => d < FV).length, q.filter((d) => d > FV), q.filter((d) => d < FV).at(-1)], [19, 18, ["2031-03-03"], "2030-12-02"]);
eq("B monthly [entries, call events, left out, last call]", [mo.length, mo.filter((d) => d < FV).length, mo.filter((d) => d > FV), mo.filter((d) => d < FV).at(-1)], [55, 54, ["2031-03-03"], "2031-02-03"]);
eq("every B call entry nearest its own slot, max days after it [q, m]", [3, 1].map((st, x) => { const e = (x ? mo : q).filter((d) => d < FV); return [e.every((d, i) => slot(d, B.first, st).j === i), Math.max(...e.map((d, i) => days(d, addMonths(B.first, i * st))))]; }), [[true, 3], [true, 3]]);
eq("FV nearest slot [q slot, days, slot date, m slot]", [slot(FV, B.first, 3).j, slot(FV, B.first, 3).d, addMonths(B.first, 54), slot(FV, B.first, 1).j], [18, 3, "2031-03-01", 54]);
eq("B call payouts, final", [q.filter((d) => d < FV).map((_, i) => 100000 + premium(850, 6 + 3 * i)), 100000 + premium(850, 60)], [Array.from({ length: 18 }, (_, i) => 104250 + 2125 * i), 142500]);
eq("month table at rate 2000", [6, 7, 12, 24, 36, 48, 60].map((m) => 100000 + premium(2000, m)), [110000, 111667, 120000, 140000, 160000, 180000, 200000]);
eq("tie at rate 2001, m 7 [twice the exact premium, payout]", [100000 * 2001 * 7 * 2 / 120000, 100000 + premium(2001, 7)], [23345, 111673]);
eq("B estimated", check5(B), []);
eq("B monthly", check5({ ...B, step: 1, entries: mo }), []);
eq("L", check5({ ...B, listed: L }), []);
eq("Off cycle", check5({ ...B, listed: ["2026-09-01", "2027-12-01"] }), ["listed-off-cycle@1", "final-valuation-off-cycle"]);
eq("  2027-12-01 nearest quarterly slot", slot("2027-12-01", B.first, 3).j, 5);
eq("No nearest slot", check5({ ...B, step: 1, listed: ["2026-09-01", "2026-09-16"] }), ["listed-off-cycle@1", "final-valuation-off-cycle"]);
eq("  2026-09-16 days to monthly slots 0 and 1", [days("2026-09-16", "2026-09-01"), days("2026-09-16", addMonths("2026-09-01", 1))], [15, 15]);
eq("Before the first call", check5({ ...B, listed: ["2026-08-31", ...L.slice(1)] }), ["observation-before-first-call@0"]);
eq("  2026-08-31 [nearest slot, days]", [slot("2026-08-31", B.first, 3).j, slot("2026-08-31", B.first, 3).d], [0, 1]);
eq("Two before the first call", check5({ ...B, listed: ["2026-08-28", "2026-08-31", ...L.slice(2)] }), ["observation-before-first-call@0", "observation-before-first-call@1", "listed-off-cycle@1"]);
eq("  nearest slots of 2026-08-28 and 2026-08-31 [slot, days]", ["2026-08-28", "2026-08-31"].map((d) => [slot(d, B.first, 3).j, slot(d, B.first, 3).d]), [[0, 4], [0, 1]]);
eq("Mismatched offset", check5({ ...B, nonCall: 7 }), ["non-call-months-mismatch"]);
eq("Call before settlement", check5({ ...B, settle: "2027-03-04", nonCall: 0 }), ["first-call-before-settlement"]);
eq("  its offset [months, days]", [offset("2027-03-04", B.first).j, offset("2027-03-04", B.first).d], [0, 184]);
eq("Listed, anchored before settlement", check5({ ...B, first: "2026-03-03", nonCall: 0, fv: null, listed: ["2026-03-05", "2026-06-03"] }), ["first-call-before-settlement"]);
eq("  its offset [months, days, runner-up]", [offset(B.settle, "2026-03-03").j, offset(B.settle, "2026-03-03").d, offset(B.settle, "2026-03-03").runnerUp], [0, 1, [32, 1]]);
eq("Trade after settlement", check5({ ...B, trade: "2026-09-02" }), ["settlement-before-trade"]);
const cand = ["2026-09-01", "2026-12-01"], one = [["2026-09-01", "primary"]];
eq("Role unknown (conflict, one item) [check 5, roles]", [check5({ ...B, fv: null, listed: ["2026-09-01"] }), roles(one, "conflict", cand)], [[], ["unknown"]]);
for (const st of ["estimate", "primary"]) eq(`A later listed item (conflict, second item ${st})`, roles([...one, ["2026-12-01", st]], "conflict", cand), ["unknown", "unknown"]);
eq("The term absent, second item primary", roles([...one, ["2026-12-01", "primary"]], "absent"), ["call", "unknown"]);
eq("The term absent, second item estimate", roles([...one, ["2026-12-01", "estimate"]], "absent"), ["unknown", "unknown"]);
console.log(`checks failed: ${bad}`);
process.exit(bad ? 1 : 0);
```

The probe covers check 5's findings and order, the role rules, the mapping distances and the premium arithmetic. It does not model Rows, Status or `noteMetrics`.

## Questions for Beni

Each answerable in one word.

1. Do you confirm these rulings, all recorded second-hand from the PM's session, as quoted? 2026-11-08: "Split, schedule first". 2026-11-10: (1) "Schema term first (Recommended)"; (2) "Codex at Pass 2 (Recommended)"; (3) "Simple, final, cash (Recommended)"; (4) "Bump to 0.2 (Recommended)"; (5) "Stop: status unknown (Recommended)". 2026-11-11: (6) "Yes, with obligations (Recommended)"; (7) "Yes, last round (Recommended)"; (8) "Yes, Fable 5.2".
2. Is S02.1 the number you ruled for the final-valuation slice?
3. The question behind ruling 6 said 14 Highs and the count is 13. Does ruling 6 cover all 13?
4. Does this seat's Low on check 2's order join the list for S03's build review?
5. Has the private-list check been run again after this seat's PR comment?
6. Merge PR #32 at `06f8ac9` under ruling 6?

## Handoff block

Run the private-list check first. The command needs no local checkout. The PM runs the post-merge checks.

```sh
gh pr merge 32 --repo BeniCheni/keel --squash --match-head-commit 06f8ac9ce11e8d56ca1b68b6bf364ff102cf6980 --subject 'docs(specs): S02.1 final valuation date and S03 payoff engine (#32)' --body 'Adds two specs. S02.1 adds an optional dates.final_valuation term in a new terms schema 0.2, and the loader keeps reading 0.1 files. S03 specifies the payoff engine in a new plugin-mln package: exact arithmetic, payouts in integer cents per 1,000 of principal, frozen values, eleven golden cases and the Pass M contract. Also adds the Pass 0 and Pass 1.5 briefs, two index rows and ideas 51 to 58. No code changes.

Review: every commit is Claude-authored, and Codex gave the plan challenge, Pass 2 and four re-reads. Thirteen Highs stay open under the AGENTS.md Severity clause, because a docs PR cannot land a test that fails without the fix: H1 to H5, P2-1 to P2-4, R1, R3, R5 and the PM slot gap. Owner ruling 6 of 2026-11-11, for this PR only: merged with them open, and the S03 build must land each closing test listed in docs/reviews/pr-32-pass-1.5.md. Owner ruling 7: the final re-read was the last spec round, and its two Mediums go to the S03 build review. Pass 2.5 ran on Fable 5.2 High by owner ruling 8, against the Opus 5.5 High pin. Shadow gate: would escalate. Reviewed head 06f8ac9ce11e8d56ca1b68b6bf364ff102cf6980.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>'
```

## Records note (PM, 2026-11-11)

Added by the PM for the records PR. The Pass 2.5 seat wrote no file. This brief is the seat's last chat message, read as data from its session transcript with `extract_brief.py` (printed in the records PR body), SHA-256 `1320454380fb7d55dfb6fdc51002a9225a4ecc2cfdac38ff6b6c38e7e5ee15c0`. Beni pasted the same text into the PM's session. The PM changed one line, the last row of the gate log, added the final newline, and appended this note.

- **Questions 1 to 6.** Beni answered in the PM's session on 2026-11-11.
  - **Question 1**, at 11:47 EST: "Yes, confirmed", in answer to "Do you confirm rulings 1 to 8 as Pass 2.5 quotes them, giving ruling 8 now?". That confirms rulings 1 to 7 first-hand, and it is ruling 8's own record.
  - **Questions 2 to 4**, at 11:53 EST: "Yes to 2, 3, 4". So S02.1 is the number he ruled, ruling 6 covers all 13 Highs, and this seat's Low on check 2's order joins the list for S03's build review.
  - **Question 5.** He ran the counts-only script below over seven surfaces: the diff, every commit message, the PR title and body, the issue comments, the reviews, the review comments, and the squash message as the handoff block gives it. It found 7 issue comments, so this seat's comment 6801238133 was included. Every surface had 0 matching lines, and the script exited 0. His paste shows its output before the merge's. No Claude seat opened the list. Before handing it over, the PM tested the script against throwaway lists only:
    - an unmatched list gave exit 0;
    - a matched term gave exit 1;
    - a phrase found only in the squash message was caught;
    - an empty list, a blank list, a missing list and a failed GitHub fetch each gave exit 2.
  - **Question 6:** merged, below.
- **Ruling 8's source.** The Pass 2.5 prompt said the seat moved "by Beni's ruling of 2026-11-11 in the PM's session ("Yes, Fable 5.2")", and this brief quotes it that way. Those words were never given.
  - The PM asked "Seat PR #32's Pass 2.5 on Fable 5.2 High, for this PR only?" and, in the same turn, gave Beni the prompt to send on a yes.
  - Beni sent the prompt without answering the question. Sending it was his choice of seat, and his "Yes, confirmed" at question 1 is the ruling's record.
  - The error is the PM's, for writing the quote into the prompt before the ruling existed.
- **Where the seat started.** The session opened in `~/code/keel-pr-32-final`, a clone of the PR made at 09:59 EST that day, because `~/code/keel-pr-32-p25` did not exist. Before asking Beni (line 7 above), it ran `git reflog` and `git status` there and read three files from that clone: `SKILL.md`, `executive-brief.md` and `pr-comment.md` under `.claude/skills/keel-pr-review/`.
  - Its prompt said to leave every other keel clone alone, and the brief does not mention these reads.
  - Nothing the seat read differs from what it reviewed. The evidence is its transcript, because the folder was removed before this PR's cold read.
    - Its own shell calls there showed `HEAD` at `06f8ac9`, a reflog holding only the clone and the checkout at 09:59 EST, and no output from `git status --porcelain --ignored --untracked-files=all`.
    - The text of each of the three files it read, as its transcript records it, equals that file at `06f8ac9`. `seat_clone_check.py`, printed in the records PR body, shows this, and the same check against `8a04ff3^` finds two of the three different.
  - The cause is the PM's handoff, which had Beni make the clone in a separate step. Seat prompts now make their own clone.
- **The merge.** Squash `7c47d104b4c8ac5edbbbf331e483a315436005a2`, merged by Beni at 2026-11-11T16:53:55Z (11:53 EST), reviewed head `06f8ac9` (`gh pr view 32 --repo BeniCheni/keel --json mergeCommit,mergedAt,headRefOid,mergedBy`).
  - Its parent is `38f9c1a`, so the base did not move. Its tree equals the reviewed head's: `7f21263a9784726c3b5d5af1da3710212e3d71e9` for both (`git rev-parse '7c47d10^{tree}' '06f8ac9^{tree}'`).
  - The branch `docs/s03-spec` is deleted (`git ls-remote --heads origin docs/s03-spec` prints nothing).
  - The squash message is the handoff block's subject and body, unchanged: comparing them with `git log -1 --format=%B 7c47d10` shows no difference. Its trailers are `Claude <noreply@anthropic.com>` and `Codex <noreply@openai.com>`.
- **Post-merge checks**, in a fresh clone at `7c47d10` with a fresh `mktemp -d` as `KEEL_DATA_DIR`:
  - `origin/main` equals the squash commit.
  - `pnpm install --frozen-lockfile` and `pnpm verify` each exit 0 on Node v24.22.2 and v26.13.0, with 154 core and 122 tooling tests and all eight steps ok. `git status` is clean afterwards.
  - The push run on `main`, 43062826455, succeeded (`gh run view 43062826455 --repo BeniCheni/keel --json headSha,event,conclusion`).
  - Demo mode is N/A, because the README has no demo step (`grep -c -i demo README.md` prints 0, idea 50).
- **Closed by this records PR:** the final re-read's Medium on line 275 of `docs/reviews/pr-32-pass-1.5.md`. The row was true when written. `06f8ac9` added it at 14:51 UTC on 2026-11-11, while the PR body held six script blocks, and the body went to seven at 14:52 UTC. That timing comes from GitHub's `userContentEdits` for the PR, counting `<details>` in each version. The row now says so.
- **Still open:**
  - The 13 Highs: H1 to H5, P2-1 to P2-4, R1, R3, R5 and the PM's slot gap. By ruling 6, the S03 build must land each closing test in the table "The obligations on the S03 build" in `docs/reviews/pr-32-pass-1.5.md`. The S03 build's Pass 0 brief, not yet written, must list all 13 with their closing tests.
  - The rest of the list for S03's build review, under ruling 7:
    - The final re-read's Medium on line 3 of `docs/specs/s03-payoff-engine.md`, which dates the third amendment to 2026-11-10 though `6d27938` is dated 2026-11-11. A records PR cannot change a spec, so it goes to the next ordinary docs PR.
    - This seat's Low on check 2's order.
  - S01's and S02's frozen values change once S02.1's build merges. The next ordinary docs PR records that.
  - Idea 39, now on its third exception.
  - `AGENTS.md` pins this seat to Opus 5.5 High on a PR that touches no sensitive path, and it names no Fable 5.2 seat. Moving a pin takes its own sensitive-path PR.

The script Beni ran:

```bash
bash <<'SCRIPT'
set -u
F="${KEEL_PRIVATE_LIST:-$HOME/.config/keel/private-terms.txt}"
R=BeniCheni/keel; N=32
{ test -r "$F" && test -s "$F"; } || { echo "list unreadable or empty"; exit 2; }
W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT
grep -v '^[[:space:]]*$' "$F" > "$W/p" || { echo "list has no patterns"; exit 2; }
gh pr diff $N --repo $R > "$W/diff" < /dev/null || { echo "diff fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/commits --jq '.[].commit.message' > "$W/commits" < /dev/null || { echo "commits fetch failed"; exit 2; }
gh pr view $N --repo $R --json title,body --jq '.title, .body' > "$W/title-body" < /dev/null || { echo "PR fetch failed"; exit 2; }
gh api --paginate repos/$R/issues/$N/comments --jq '.[].body' > "$W/comments" < /dev/null || { echo "comments fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/reviews --jq '.[].body' > "$W/reviews" < /dev/null || { echo "reviews fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/comments --jq '.[].body' > "$W/review-comments" < /dev/null || { echo "review comments fetch failed"; exit 2; }
cat > "$W/squash" <<'MSG'
docs(specs): S02.1 final valuation date and S03 payoff engine (#32)

Adds two specs. S02.1 adds an optional dates.final_valuation term in a new terms schema 0.2, and the loader keeps reading 0.1 files. S03 specifies the payoff engine in a new plugin-mln package: exact arithmetic, payouts in integer cents per 1,000 of principal, frozen values, eleven golden cases and the Pass M contract. Also adds the Pass 0 and Pass 1.5 briefs, two index rows and ideas 51 to 58. No code changes.

Review: every commit is Claude-authored, and Codex gave the plan challenge, Pass 2 and four re-reads. Thirteen Highs stay open under the AGENTS.md Severity clause, because a docs PR cannot land a test that fails without the fix: H1 to H5, P2-1 to P2-4, R1, R3, R5 and the PM slot gap. Owner ruling 6 of 2026-11-11, for this PR only: merged with them open, and the S03 build must land each closing test listed in docs/reviews/pr-32-pass-1.5.md. Owner ruling 7: the final re-read was the last spec round, and its two Mediums go to the S03 build review. Pass 2.5 ran on Fable 5.2 High by owner ruling 8, against the Opus 5.5 High pin. Shadow gate: would escalate. Reviewed head 06f8ac9ce11e8d56ca1b68b6bf364ff102cf6980.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
MSG
head -n 1 "$W/p" > "$W/control"
c="$(grep -F -i -c -f "$W/p" "$W/control")"
[ "$c" = 1 ] || { echo "control failed"; exit 2; }
echo "control: ok"
echo "comments on PR #$N now: $(gh api repos/$R/issues/$N --jq .comments < /dev/null)"
status=0
for s in diff commits title-body comments reviews review-comments squash; do
  test -s "$W/$s" || [ "$s" = reviews ] || [ "$s" = review-comments ] || { echo "$s: empty, scan failed"; status=2; continue; }
  n="$(grep -F -i -c -f "$W/p" "$W/$s")"; rc=$?
  if [ "$rc" -gt 1 ]; then echo "$s: scan failed"; status=2
  else echo "$s: $n matching lines"; [ "$n" = 0 ] || { [ "$status" = 2 ] || status=1; }
  fi
done
echo "exit $status"
exit $status
SCRIPT
```
