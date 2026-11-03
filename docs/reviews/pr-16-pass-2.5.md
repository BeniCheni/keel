# Executive brief: PR #16, Pass 2.5, 2026-11-02 America/New_York

Recorded by the PM on 2026-11-02 (America/New_York). This file holds both Pass 2.5 briefs on this PR. The one directly below is the one Beni merges from: the Pass 2.5 session (Claude, fresh session, Opus 5.5 High) delivered it in chat at `19ea2f5`, and its PR comment ([issuecomment-6591458579](https://github.com/BeniCheni/keel/pull/16#issuecomment-6591458579)) says the PM records it. The PM copied it from that session's final message, and it stands as written, except for the "Beni's decision" row, which the PM fills after the merge. The first Pass 2.5, at `c4c3e1f`, follows under its own heading.

On question 2: rulings 16 and 17 are first-hand, because Beni gave them to the PM directly. Ruling 15 comes from the first Pass 2.5 session's transcript, which holds his "Yes, fix first".

The PM re-ran these of the brief's numbers at `19ea2f5`, and they hold:

| Figure | Command | Result |
| --- | --- | --- |
| Scope | `git diff --shortstat origin/main...HEAD`; `git ls-files spike/ios-core \| wc -l` | 3 files, +475 −2; 0 |
| Commits by vendor | `git log --format='%an' origin/main..HEAD \| sort \| uniq -c` | 10 Claude, 1 Codex |
| Stories and roles | The spec's `grep`; the PR body's `awk` | 35, 13; 13, 20, 15 |
| Fixtures and sizes | `git ls-files fixtures/synthetic/terms \| grep -c '\.yaml$'`; the PR body's `wc` lines | 31; 964; 2163 |
| Arithmetic | `node -p '[60-6+1, 2*(60-6+1), 3*(60-6+1)].join(" ")'` | 55, 110, 165 |
| M1, M4 and N1 greps | `git grep` with the patterns the brief gives | Each exits 1, no match |
| CI | `gh run view 41545606891 --repo BeniCheni/keel --json conclusion,headSha,jobs` | success at `19ea2f5`, 5 jobs |
| Verify | `pnpm install --frozen-lockfile && pnpm verify`, Node 24.22.2 and 26.13.0, on the same tree before the push | Exit 0 on both; 33 and 122 tests |
| AC8 and AC10 tables | The PM's scratch repos, for the rows in `pr-16-pass-1.5.md` | Same exit codes |
| Comments the squash message cites | `gh api repos/BeniCheni/keel/issues/comments/<id> --jq .issue_url`, for all 7 IDs | Each is on PR #16 |
| Handoff block | `bash -n`; `zsh -n`; the Cursor address in `tools/tripwire/vendors.txt` | Exit 0, exit 0, present. Parsed, not run |

The PM did not re-run the V8 anchor table, the determinism check on its own, the licenses, the macOS cell seconds, the `console` or `--jitless` probes, or the Apple reads.

Every number below comes from a command run in this session, in the fresh clone `~/keel-reviews/pr-16-2.5c` at `19ea2f55729ee67887a03a1814c5d2bb1b298e1e`, with `KEEL_DATA_DIR` an empty `mktemp -d` (still 0 entries at the end). A number from a PR comment is labelled as that vendor's claim. The seat is Claude on Opus 5.5 High (`get_session` reports `claude-opus-5-5`, effort `high`), with no fallback used.

Three slips of mine:
- **PR comment posted before its scan passed:** my script posted the comment even though the tripwire pre-scan had exited 2, so nothing had been scanned. I then scanned the posted text properly: exit 0 with no hits. The controls also behaved: exit 0 on a repo without the comment, exit 1 on planted synthetic values. The comment needed no change.
- **`KEEL_DATA_DIR` missing on some early calls:** shell state doesn't persist here, so the read-only `git`, `gh` and `cat` calls right after setup ran without it. No keel code ran in them, and every keel command had it.
- **False first AC8 run:** every AC8 cell came back 127 because my script extracted the command wrongly. I fixed the script and re-ran; the table below is the corrected run.

## Decision

Shadow mode: the gate says **"would escalate"** because finding 2's High closes only by Beni's ruling 12, an exception the gate clause does not provide for. Beni merges. The PM records this brief; the PR comment is [issuecomment-6591458579](https://github.com/BeniCheni/keel/pull/16#issuecomment-6591458579).

The review verdict is mergeable, by exception. M1 to M4 are closed. L1 to L3 and one new Low stay open, and none of them blocks the gate.

**Conflict to report:** `AGENTS.md` Severity closes a High in tracked files only with a fix commit and a test, and has no exception path. Ruling 12 is recorded here as the exception, not as meeting the clause. Cursor's Pass 1 seat is also a PR-only ruling outside `AGENTS.md`. Neither changes that file.

## What ships

- A registered plan for choosing how a native iOS companion runs keel's core: Path A (`@keel/core` in JavaScriptCore) or Path B (a Swift port).
- A phone journey for all 48 Must and Should M1 stories: 13 Primary, 20 Read-only, 15 Desktop-only.
- A draft ADR-0009, Status: Proposed, which supersedes nothing.
- An honest finding that story 9.1 works as transport and falls short as content.
- It still declines to claim that either path works. No spike code exists, no Swift has run, and a pass would cover the terms loader only.

## What the passes found

**Pass 1 (Cursor, at `8c0deaf`; its claims):** 18 findings, 2 High, 13 Medium and 3 Low. The Highs are:
- 1: required `verify` was red from a cancelled macOS cell.
- 2: a scheduled reminder could state a stale fact as current.

**Pass 2 (Codex, at `044690c`; its claims):**
- It accepted all 18, disputing parts of 5, 13 and 15.
- C1 to C8 are Mediums, fixed in `804720e`.
- C9, High: finding 2's closure lacked a test. Closed by ruling 12.
- Pass M: N/A.

**First Pass 2.5 (at `c4c3e1f`):** M1 to M4 and L1 to L3.

**Codex's re-reads (its claims):**
- `025f853` and `c4c3e1f`: no findings.
- `8419c84`: M2 incomplete.
- `19ea2f5`: M2 closed, no new findings, and the AC10 repair justified.

**This pass, findings**

| # | Severity | Finding | How verified |
| --- | --- | --- | --- |
| N1 | Low | Ruling 17 is in Pass 1.5 and not in the spec. [spec:33](docs/specs/s90-ios-core-spike.md:33) names the Pass 2.5 rulings on the Mediums and on A4 only, then says "Each ruling is written into this spec where it applies". Not fixed: this seat pushes nothing, and ruling 17 confirms records rather than changing the plan. | `git grep -n -E 'second-hand\|Cursor seat\|rulings 1 to 14\|as the PM recorded' -- docs/specs docs/adr` finds nothing; the only hits for the ruling quotes are line 33 |

**This pass, corroboration**

| Check | Result |
| --- | --- |
| Ruling 15 | In spec:33 and Pass 1.5, same words ("Yes, fix first") |
| Ruling 16 | In spec:33 and Pass 1.5, same words ("No (Recommended)") |
| Ruling 17 | In Pass 1.5 only (N1) |
| M1 | **Closed.** `git grep -E 'keep their own'` exits 1. `loadTerms` with `retrieved_at` on a source, `as_of` at the top level or `as_of` on a term gives `ok=false`, `unknown-key`, and the unchanged fixture gives `ok=true`, on both Nodes. `git grep -nE 'retrieved_at\|as_of' -- schemas` exits 1. [spec:160-161](docs/specs/s90-ios-core-spike.md:160) now gives the oracle |
| M2 | **Closed.** Both tables below reproduce. On a branch cut before the spec and then merged with main, AC8 exits 0 and AC11 exits 1, as Pass 1.5 says |
| M3 | **Closed.** The A4 rows say after import only ([spec:98](docs/specs/s90-ios-core-spike.md:98), [spec:148](docs/specs/s90-ios-core-spike.md:148)), AC12 lists A3, A5, A8 and A9, and the ADR sentence and the 110 stand |
| M4 | **Closed.** `git grep -E 'every screen says\|as-of date'` exits 1. [ADR:32](docs/adr/0009-ios-companion-and-core.md:32) and [spec:87](docs/specs/s90-ios-core-spike.md:87) now match the data path |
| L1 to L3 | Still present and unfixed ([spec:276](docs/specs/s90-ios-core-spike.md:276), [spec:160](docs/specs/s90-ios-core-spike.md:160), [spec:373](docs/specs/s90-ios-core-spike.md:373)). They are the only findings of the first Pass 2.5 left: it reported 7, and M1 to M4 are closed |
| Finding 1 | CI 41545606891 is success at the head, on all 5 jobs |
| Finding 2 | Wording at spec:160 and ADR:24; closes by exception |
| Finding 13 | `console` absent gives `ReferenceError`; `undefined` compiles, on both Nodes. No JSContext has run |
| Authorship record | All 11 commits have a row in Pass 1.5 |

**AC8 exit codes** (commands taken from the spec at each SHA, run with `sh -c` in scratch repos)

| Case | `8419c84` | `19ea2f5` |
| --- | --- | --- |
| Only spike changes, true base | 0 | 0 |
| Only spike changes, an annotated tag at the true base | 1 | 0 |
| Only spike changes, base is `HEAD` | 1 | 1 |
| Outside change, true base | 1 | 1 |
| Outside change, base moved past it | 1 | 1 |
| Outside change, base `--quiet` | 1 | 128 |
| Outside change, empty base | 1 | 128 |
| Outside change, base `--quiet`, no `origin/main` | **0** | 128 |
| Outside change, true base, no `origin/main` | 1 | 128 |

Beyond the table, at `19ea2f5`:
- Unset, bad and blob bases each exit 128.
- A `main` that moved after the cut exits 0.
- An outside change in the first commit, with the base and first commit both moved up one, exits 1.

**AC10 exit codes** (synthetic identifiers)

| Case | As rendered | As in the raw file | `19ea2f5` |
| --- | --- | --- | --- |
| Clean | 1 | 1 | 1 |
| Team ID planted | 0 | **1** | 0 |
| Device ID planted | 0 | **1** | 0 |
| Outside a repo | 128 | 128 | 128 |

A corrupt index also exits 128 in all three columns.

**Contested: nothing open.** The Ajv and `console`, finding 2 closure, and `standalone`-only disputes stay settled as the first Pass 2.5 records them, with rulings 12 to 14.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | Exit 0 on 24.22.2 and 26.13.0 |
| Verify | `pnpm verify` | Exit 0 on both; core 33 of 33 in 9 files, tooling 122 of 122 in 10 files |
| Determinism | The `fixtures:regen` and `fixtures:trees` check from the brief template | Exit 0 on both |
| Zero network | Inside `pnpm verify` (`verify:network ok`) | Green on both; not run separately |
| Tripwire | `node tools/tripwire/cli.mjs` | Exit 0, 0 lines, on both |
| Boundary | `node tools/boundary/cli.mjs` | Exit 0, 0 lines, on both |
| Mutations | N/A | No code or fixture changes, and the spike's floor is not a suite yet |
| Pass M | N/A | No engine or golden fixture touched |
| UI matrix | N/A | No UI change |
| Demo mode | N/A | None exists yet: `git grep -c -i 'demo mode' -- README.md package.json` exits 1 |
| CI | `gh run view 41545606891` | Success at `19ea2f5` |
| Scope | `git diff --shortstat origin/main...HEAD` | 3 files, +475 −2; `git diff --check` exit 0; 0 files under `spike/ios-core` |
| Commits | `git log --format='%an' origin/main..HEAD` | 11: 10 Claude, 1 Codex |
| Stories and roles | The spec's `grep`, the PR body's `awk`, an ID diff | 35 Must, 13 Should; 48 IDs and priorities equal; 13, 20, 15 |
| Sizes | `git ls-files`, `wc -l` | 31 fixtures (2 valid, 29 invalid); core 964 lines; schema 2163 lines; Q4's per-file lines all match |
| Arithmetic | `node -p` | 55, 110, 165 |
| Library facts | `git grep`, `grep`, `sed` | `localeCompare` is one test stub; locale grep count 0; `return console;` and `new Function` at the cited lines |
| `--jitless` | `node --jitless anchor.mjs` | Exit 1, `ERR_WEBASSEMBLY_NOT_SUPPORTED`, on both |
| Licenses | `gh api repos/<repo> --jq .license.spdx_id` | MIT, MIT, MIT, Apache-2.0, BSD-3-Clause, MIT; last push of `kylef/JSONSchema.swift` 2023-07-25 |
| macOS cells | `gh run view 41482481086 --json jobs` | 56 and 59 seconds |

**Not verified**
- **Every swift, xcodebuild and devicectl command:** not run, because this Mac has no full Xcode (`xcode-select -p` prints the command-line tools path). AC12 and JavaScriptCore behaviour are therefore untested.
- **Owner's private-list check:** Codex's count, not mine: 0 hits (issuecomment-6591278315). It does not cover my comment, which I scanned with the tripwire only, and it found no addresses.
- **Apple pages:** every guideline, Personal Team, forum and Xcode 7 reading is not re-read.
- **Other probes:** the `--trace-regexp-tier-up` and `--print-regexp-code` results, the planted boundary-file probes, and the "Prompt" column of Pass 1.5's first M2 table.
- **Cold reads:** none given here, by your instruction. `804720e` rests on the first Pass 2.5 and `8419c84` and `19ea2f5` on Codex.

## Estimates and model output

The V8 anchors are ESTIMATE, on the assumption that V8 on an Apple M4 is a guide to scale. None was checked against JavaScriptCore. Three runs each, from the spec's "Anchor" script:

| Node | Flags | Import ms | Median `loadTerms` ms | Worst ms |
| --- | --- | --- | --- | --- |
| 24.22.2 | none | 88.7 to 123.1 | 0.97 to 1.02 | 8.6 to 9.3 |
| 24.22.2 | compiler flags | 127.6 to 154.4 | 2.40 to 2.96 | 8.9 to 14.8 |
| 26.13.0 | none | 92.0 to 134.3 | 0.96 to 1.50 | 8.4 to 12.2 |
| 26.13.0 | compiler flags | 132.1 to 155.4 | 2.37 to 3.21 | 8.5 to 10.1 |

The order of magnitude holds, but the spec's narrower ranges, such as 93 to 103 ms, did not repeat here. The thresholds of 500 ms and 50 ms are Beni's and are not derived from these figures.

## Risks and accepted costs

- A reminder for a note called on the desktop still fires on the phone until the next import. The wording rule makes it say it is from a snapshot, and it does not stop it.
- Finding 2's test does not exist yet. AC12 requires one in the spike, and ADR-0009 requires one with the real app before any notification text ships. Spike code never merges, so that second test is the one that binds.
- A barrier or a call cannot reach a closed app. The ADR accepts this to keep nothing leaving the owner's machines.
- If the phone is not opened before its reminder window ends, reminders stop, and nothing in the spec warns the owner beforehand.
- Which candidate sets A5's fire time for a date held in conflict stays open, per Pass 1.5.
- The spec cites `docs/reviews/pr-16-pass-1.5.md`, which is on `docs/pr-16-records` and not on this PR. That reference dangles on `main` until the records PR lands.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes; S90 is Beni's ruling |
| Verdict mergeable, every High closed | **By exception.** Finding 1: outside tracked files, closed by a green re-run plus ruling 11. Finding 2 (Codex's C9): High, closed by Beni's ruling 12 as an exception for this PR only, with AC12 and ADR-0009's obligation. It is not a fix commit with a test, and the clause as written is not met |
| Nothing contested | Yes; settled above |
| `verify` green at tip; every number re-run | Yes for every number reported; the rest is listed as not verified |
| No sensitive path, dependency or schema change | Yes; 3 docs files |
| Every commit cold-read by a non-author vendor | Yes, per the authorship record and comments: `804720e` by the first Pass 2.5, the other 10 by Cursor and Codex |
| Gate verdict | **Would escalate** |
| Beni's decision (filled after) | Merged on 2026-11-02 at squash `db4ab3f`, reviewed head `19ea2f5`. The PM told Beni that merging would be recorded as yes to all three questions below, and no answer came back as no |

## Questions for Beni

1. Merge at `19ea2f5` with finding 2's High closed by ruling 12's exception? I recommend **yes**.
2. Do rulings 15 to 17 stand as the PM recorded them? Yes or no; they are second-hand here.
3. Leave ruling 17 in Pass 1.5 only, with no spec edit? I recommend **yes**, because an edit moves the head and voids the block below.

## Handoff block

- **Authors:** from `git log --format='%an <%ae>' origin/main..HEAD`, Claude and Codex.
- **Review passes:** Cursor (Pass 1), Codex (Pass 2 and re-reads), Claude (Pass 2.5). The Cursor address is in `tools/tripwire/vendors.txt`.
- **`gh pr ready`:** `verify.yml` sets no `ready_for_review` trigger, so this does not restart the check (read, not run).
- **Parse check:** the block passes `zsh -n` and `bash -n`, but has not been run. I removed apostrophes from the squash body because macOS bash 3.2 failed to parse them inside the heredoc, and the first block had the same problem.
- **Where to run it:** from a clone on `main`.
- **Node for the last two checks:** they run on your default Node, which is v24.15.0 in this shell. That version meets the `>=24` floor, but this seat didn't test it.

```bash
gh pr ready 16 --repo BeniCheni/keel && gh pr merge 16 --repo BeniCheni/keel --squash --match-head-commit 19ea2f55729ee67887a03a1814c5d2bb1b298e1e --subject "docs(s90): iOS core spike spec, phone journey and ADR-0009 (#16)" --body "$(cat <<'EOF'
Adds the S90 spec, a phone journey for the 48 Must and Should M1 stories, a pre-registered decision rule between JavaScriptCore and a Swift port, and ADR-0009 as Proposed. No code changes, and the M1 slice plan does not change.

Reviewed head: 19ea2f55729ee67887a03a1814c5d2bb1b298e1e. Pass 1 by Cursor, by a ruling from Beni for this PR only (issuecomment-6587500288). Pass 2 by Codex (issuecomment-6588858035), with its re-reads (issuecomment-6589253253, issuecomment-6590981024, issuecomment-6591278315). Pass 2.5 by Claude (issuecomment-6590526388, issuecomment-6591458579).

The High in finding 2 closes by ruling 12 from Beni, an exception for this PR only, not by a fix commit with a test. AC12 and ADR-0009 carry the test obligation.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
Co-authored-by: Cursor <cursoragent@cursor.com>
EOF
)" && git pull && test "$(gh pr view 16 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" = "$(git rev-parse origin/main)" && echo "origin/main is the squash commit" && pnpm install --frozen-lockfile && KEEL_DATA_DIR="$(mktemp -d)" pnpm verify
```

The third green check, demo mode starting with zero outbound requests, is N/A because no demo mode exists before the UI slices. Check by eye that the README renders. The merge is Beni's; this seat stops here.

## Post-merge checks (added by the PM)

From the PM's session on 2026-11-02, in a fresh clone of `main` at the squash, with a fresh `mktemp -d` as `KEEL_DATA_DIR`.

| Check | Command | Result |
| --- | --- | --- |
| `origin/main` is the squash GitHub recorded | `gh pr view 16 --json mergeCommit --jq .mergeCommit.oid`; `git rev-parse origin/main` | both `db4ab3f0f708213887efca649fd8ac88e44a6ea5`; merged at 23:57:28 UTC by Beni, whose own run of the handoff's `test` line also passed |
| The base did not move, so the trees match | `git rev-parse 'origin/main^{tree}'`; `git rev-parse '19ea2f5^{tree}'` | both `b90eae009e39eb50545ad019d096c4c7658fd4f1` |
| Trailers | `git log -1 --format=%B db4ab3f` | Claude, Codex and Cursor, each spelled out in full |
| CI on the squash | `gh run view 41549309290 --json conclusion,headSha,event` | `success`, `push`, at `db4ab3f` |
| Verify on the squash | `pnpm install --frozen-lockfile && pnpm verify` on v24.22.2, v26.13.0 and v24.15.0 | exit 0 on all three; core 33 passed (9 files), tooling 122 passed (10 files) |
| Last private-list scan | Beni's own run of the PM's counts-only command over issuecomment-6591458579 and this brief, before the merge | `0`, as Beni reported it. The PM did not open the list |
| README | `git diff --name-only 2ed7b44 db4ab3f` | Not among the 3 files changed |
| Release checks | n/a | Not a release: no tag, and no version moved. Demo mode does not exist before the UI slices |

**The red run.** Beni's own run of the handoff's last step, in `~/code/keel-pm` on v24.15.0, exited 1 at `verify:tooling`, with 18 test files where the fresh clone has 10. The merge was not the cause. A leftover Git worktree, `.claude/worktrees/keel-pm-handoff-review-603af6`, held a second copy of `tools/`, and `tools/vitest.config.mjs` has no exclude for it, so `test:tooling drops a leading --` found 2 files where it expects 1. In a fresh clone, a copy of `tools/` under `.claude/worktrees/` fails that same test, plus six inside the copy, which holds only `tools/` and `package.json`. Removing the copy turns it green. The PM told Beni to run the block from that working copy without checking what was under it.

On Beni's word, the PM removed the worktree with `git worktree remove`, without force. It had no uncommitted changes, it was detached at `2be9b6b`, and that commit stays on local branch `docs/pr-13-records`. `pnpm verify` in that copy then exited 0, with 122 tooling tests in 10 files.

## Carried to the ideas file (added by the PM)

PR #17 adds these, for Beni to weigh, and commits no one to any of them:

- L1 to L3 from the first Pass 2.5 (idea 34).
- Which candidate date sets A5's fire time when maturity is held in conflict (idea 35).
- The tooling config's missing exclude, and where the handoff's last step runs (idea 36).
- The full export envelope and its validation, from Codex's Pass 2 (idea 37).
- A warning before the phone's reminders run out (idea 38).
- A path for a High on a docs-only PR (idea 39).
- Posting a PR comment only after its scan passes (idea 40).

# Executive brief: PR #16, first Pass 2.5, at `c4c3e1f`, 2026-11-02 America/New_York

Recorded by the PM on 2026-11-02 (America/New_York). The Pass 2.5 session (Claude, fresh session, Opus 5.5 High) delivered this brief in chat, and its PR comment ([issuecomment-6590526388](https://github.com/BeniCheni/keel/pull/16#issuecomment-6590526388)) says the PM records it. It stands below as that session wrote it, except for this heading and the "Beni's decision" row in the gate log.

Beni ruled "Yes, fix first" on question 1, so the handoff block below is void: it is pinned to `c4c3e1f`, and the head has moved. The Pass 2.5 at `19ea2f5`, above, writes the block he merges from. A session started for that at `8419c84` stopped before it began, on Codex's open finding, as `pr-16-pass-1.5.md` records. Questions 2 and 3 are answered first-hand in `pr-16-pass-1.5.md`, rulings 16 and 17.

The PM re-ran these of the brief's numbers, and they hold:

| Figure | Command | Result |
| --- | --- | --- |
| Scope at `c4c3e1f` | `git diff --shortstat origin/main...c4c3e1f` | 3 files, +475 −2 |
| Commits by vendor | `git log --format='%an' origin/main..c4c3e1f \| sort \| uniq -c` | 8 Claude, 1 Codex |
| Fixtures | `git ls-files fixtures/synthetic/terms \| grep -c '\.yaml$'`, and the same under `valid/` and `invalid/` | 31, 2, 29 |
| Core and schema size | `git ls-files packages/core/src \| grep -v test \| xargs cat \| wc -l`; `wc -l schemas/mln-terms/0.1.json` | 964; 2163 |
| Roles and stories | The PR body's `awk`; the spec's `grep` | 13, 20, 15; 35, 13 |
| Arithmetic | `node -p '[60-6+1, 2*(60-6+1), 3*(60-6+1)].join(" ")'` | 55, 110, 165 |
| CI at `c4c3e1f` | `gh run view 41529775953 --repo BeniCheni/keel --json conclusion,headSha` | success at that SHA |
| Demo mode absent | `git grep -c -i 'demo mode' -- README.md package.json` | exit 1, no match |
| M1's probe | `loadTerms` on the valid fixture with `retrieved_at` on a source, or `as_of` at the top level, on Node 24.22.2 and 26.13.0 | `ok=false`, `unknown-key`, both Nodes |
| AC8 with a misreported base | Scratch repo; both commands are in `pr-16-pass-1.5.md` | As the brief says, and one more case that its command missed |

The PM did not re-run the V8 anchor table, the `console` or `--jitless` probes, or the Apple reads. `verify` at `8419c84` gave the same test counts as this brief's: core 33 of 33 in 9 files, tooling 122 of 122 in 10 files, exit 0 on both Nodes (`pnpm install --frozen-lockfile && pnpm verify`).

Every number below comes from a command run in this session, in the fresh clone `~/keel-reviews/pr-16-2.5` at `c4c3e1f817ee2c53b991cf2e5b9473fbee25c43d`, with `KEEL_DATA_DIR` an empty `mktemp -d`. A number from a PR comment is labelled as that vendor's claim. The seat is Claude on Opus 5.5 High (`get_session` reports `claude-opus-5-5`, effort `high`), with no fallback used.

## Decision

Shadow mode: the gate says **"would escalate"** because finding 2's High closes only by Beni's ruling 12, an exception the gate clause does not provide for. Beni merges. The PM records this brief; the PR comment is [issuecomment-6590526388](https://github.com/BeniCheni/keel/pull/16#issuecomment-6590526388).

The review verdict is mergeable, by exception. Four Mediums are open, and none of them blocks the gate.

**Conflict to report:** `AGENTS.md` Severity closes a High in tracked files only with a fix commit and a test, and has no exception path. I recorded ruling 12 as the exception you asked for and did not count it as meeting the clause. Cursor's Pass 1 seat is also a PR-only ruling outside `AGENTS.md`. Neither changes that file.

## What ships

- A registered plan for choosing how a native iOS companion runs keel's core: Path A (`@keel/core` in JavaScriptCore) or Path B (a Swift port).
- A phone journey for all 48 Must and Should M1 stories: 13 Primary, 20 Read-only, 15 Desktop-only.
- A draft ADR-0009, Status: Proposed, which supersedes nothing.
- An honest finding that story 9.1 works as transport and falls short as content.
- It still declines to claim that either path works. No spike code exists, no Swift has run, and a pass would cover the terms loader only.

## What the passes found

**Pass 1 (Cursor, at `8c0deaf`; its claims)**
- 1, High: required `verify` was red from a cancelled macOS cell.
- 2, High: a scheduled reminder could state a stale fact as current.
- 3, Medium: mis-cited story 9.1's acceptance.
- 4, Medium: the close-call band conflicted with the clauses.
- 5, Medium: `standalone`-only was named both as Path A and as a failure.
- 6, Medium: positions were required where terms are enough.
- 7, Medium: the as-of date was undefined.
- 8, Medium: A8 and A6 timers assumed a calendar and a rating date that do not exist.
- 9, Medium: "55 observations" did not imply a rolling window.
- 10, Medium: Q5's sources were incomplete.
- 11, Medium: demo mode's role was wrong.
- 12, Medium: acknowledged alert state was missing from the gap table.
- 13, Medium: the `console` trap was overstated.
- 14, Medium: the boundary walk trips on a quoted import.
- 15, Medium: the load measurement was warm, and testability was on.
- 16, Low: the host shim was unbounded.
- 17, Low: mutation rows had no commands.
- 18, Low: the strongest argument against led with the wrong failure.

**Pass 2 (Codex, at `044690c`; its claims)**
- It accepted all 18 findings, disputing the characterisation of 5, the breadth of 15, and the `console` half of 13.
- C1 to C8 are Mediums, fixed in `804720e`: notification wording, as-of definition, `loadTerms` scope, roles, AC8, the ADR's boundary sentence, "interpreter-only", and the forum reading.
- C9, High: finding 2's closure lacked a test. Closed by Beni's ruling 12.
- Pass M: N/A.

**Pass 2.5 cold read of `804720e`, every hunk then the spec and ADR at the head**

| # | Severity | Finding | How verified |
| --- | --- | --- | --- |
| M1 | Medium | "Terms and alerts keep their own dated provenance" is untrue of terms at the head ([spec:161](docs/specs/s90-ios-core-spike.md:161), [ADR:20](docs/adr/0009-ios-companion-and-core.md:20)). "Applicable data dates" ([spec:160](docs/specs/s90-ios-core-spike.md:160)) therefore has no oracle for A5 and A9 in AC12. The research's `sources` table lists `retrieved_at`, so a later export could carry it. | `loadTerms` on the valid fixture plus `retrieved_at` on a source, or `as_of` on a term: `ok=false`, `unknown-key`, on both Nodes |
| M2 | Medium | AC8's base is self-reported, and its only record is in results written after the review ([spec:166](docs/specs/s90-ios-core-spike.md:166), [spec:354](docs/specs/s90-ios-core-spike.md:354)). Nothing ties it to AC11. | Scratch repo with a change outside the folder: true base exits 1; `KEEL_SPIKE_BASE=HEAD` exits 0 |
| M3 | Medium | The A4 row now says "A scheduled prompt" ([spec:148](docs/specs/s90-ios-core-spike.md:148)), and the ADR says A4 does not notify a closed app ([ADR:24](docs/adr/0009-ios-companion-and-core.md:24)). AC12 tests that prompt. If it is per observation, the "110" becomes 165. | Read both lines; `3*(60-6+1)` prints 165 |
| M4 | Medium | Left stale: "every screen says when that was" ([ADR:32](docs/adr/0009-ios-companion-and-core.md:32)) and "the as-of date" ([spec:87](docs/specs/s90-ios-core-spike.md:87)). Both conflict with [ADR:20](docs/adr/0009-ios-companion-and-core.md:20) and [spec:161](docs/specs/s90-ios-core-spike.md:161). | `git blame` shows `9e96d5f`; `804720e` retired the term and left them |
| L1 | Low | Q5 re-checks only backup exclusion after a replacement ([spec:276](docs/specs/s90-ios-core-spike.md:276)), while [ADR:22](docs/adr/0009-ios-companion-and-core.md:22) requires both attributes. "Must not silently reset it" also reads as a demand on iOS; Apple's page warns that some operations do reset it. | Read; Apple's page fetched |
| L2 | Low | "Names the closes" ([spec:160](docs/specs/s90-ios-core-spike.md:160)) could mean levels on a lock screen, against "Amounts … stay out" ([ADR:24](docs/adr/0009-ios-companion-and-core.md:24)). Separately dated series may also not fit a first line, and Q5 does not check truncation. | Read; no device run |
| L3 | Low | "Mismatch or coverage failure" ([spec:373](docs/specs/s90-ios-core-spike.md:373)) does not describe the `node:fs`, `montecarlo` or first-line rows. | Read |

**Rulings, clauses and thresholds are not weakened.** Comparing the spec before and after `804720e`, the "Beni's rulings" section is byte-identical. In "Decision rule", only the "Why these" line differs. Fresh-launch evidence and sanitized logs tighten ruling 6 and hard rule 1.

**Sentences in `804720e` tested and upheld**
- **The 64 limit:** the Apple engineer's accepted answer confirms 64 pending requests per app and promises no retention order. `curl` got a bot-check page, so I read it in the built-in browser, from the page's structured data.
- **Xcode 7 note:** the release notes say Enable Testability prohibits optimizations that depend on not exporting internal symbols.
- **`UNUserNotificationCenter`:** the page's documentation JSON has 0 standalone `64`s.
- **V8 flags:** `--trace-regexp-tier-up` gives 41 native-code records on 24.22.2 and none on 26.13.0, but `--print-regexp-code` shows regexp code on both.
- **`--jitless`:** exits 1 with `ERR_WEBASSEMBLY_NOT_SUPPORTED` on both Nodes.
- **AC8 on Git failure:** exits 128 for an empty, unset or bad ref. The old pipeline printed 0 with exit 0 outside a repo, so C5 was real.
- **Boundary sentence:** a comment or raw string literal exits 1; the word alone or a native Swift import exits 0. An escaped literal also exits 0, which the ADR's limit sentence covers.

**Pass 2.5 corroboration**
- Finding 1: CI run 41529775953 is success at the head.
- Finding 2: the wording is at [spec:160](docs/specs/s90-ios-core-spike.md:160) and [ADR:24](docs/adr/0009-ios-companion-and-core.md:24), and it closes by exception.
- Finding 13: the probe ran on both Nodes.
- Findings 14 and C6: the boundary probes above.
- C4: role counts re-run.
- C5, C7 and C8: as above.
- The others I read at the head and did not re-run.

**Contested: nothing open.** Three disputes are settled:
- **Ajv and `console`:** Cursor reported that compile completes with `console` removed; the PM said an absent binding throws. Codex and my probe agree with the PM: absent gives `ReferenceError`, `undefined` compiles. No JSContext has run.
- **Finding 2's closure:** the PM said `b6cbcc9` closed it; Codex said it had no test. Beni ruled 12.
- **`standalone`-only and the joint gate:** Codex asked; Beni ruled 13 and 14.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | Exit 0 on 24.22.2 and 26.13.0 |
| Verify | `pnpm verify` | Exit 0 on both; core 33 of 33 in 9 files, tooling 122 of 122 in 10 files |
| Determinism | The `fixtures:regen` and `fixtures:trees` check from the brief template | Exit 0 on both |
| Zero network | Inside `pnpm verify` | Green on both; not run separately |
| Tripwire | `node tools/tripwire/cli.mjs` | Exit 0, 0 lines, on both |
| Mutations | N/A | No code or fixture changes, and the spike's floor is not a suite yet |
| Pass M | N/A | No engine or golden fixture touched |
| UI matrix | N/A | No UI change |
| Demo mode | N/A | `git grep` finds none in the README or `package.json` |
| CI | `gh run view 41529775953` | Success at `c4c3e1f` |
| Scope | `git diff --shortstat origin/main...HEAD` | 3 files, +475 −2; `git diff --check` exit 0 |
| Stories and roles | The spec's `grep` and the PR body's `awk`, plus an ID comparison | 35 Must, 13 Should; 48 IDs equal; 13, 20, 15 |
| Sizes | `git ls-files` and `wc -l` commands | 31 fixtures (2 valid, 29 invalid); core 964 lines; schema 2163 lines |
| Arithmetic | `node -p` | 55, 110, 165 |

**Not re-run, and why**
- **Every swift, xcodebuild and devicectl command:** not run, because this Mac has no full Xcode. AC12 and JavaScriptCore behaviour are therefore untested.
- **Owner's private-list check:** Codex's count, not mine: 0 hits across the diff, 9 commit messages, 2 PR fields, 2 issue comments, 0 inline comments and 0 review bodies (issuecomment-6589253253). It does not cover my comment. I scanned that with the tripwire only: exit 0, no addresses.
- **Not re-run and not reported as mine:** library licenses, macOS CI cell seconds, Q4's per-file lines, the Q2 locale grep, Apple's guideline and Personal Team paraphrases, and Codex's other Apple reads.
- **Cold reads of `025f853` and `c4c3e1f`:** not given by this seat, by your instruction. Codex's re-read found nothing (its claim).

## Estimates and model output

The V8 anchors are ESTIMATE, on the assumption that V8 on an Apple M4 is a guide to scale. None was checked against JavaScriptCore. Three runs each, from the spec's "Anchor" script:

| Node | Flags | Import ms | Median `loadTerms` ms | Worst ms |
| --- | --- | --- | --- | --- |
| 24.22.2 | none | 93.6 to 150.0 | 0.96 to 1.26 | 9.0 to 10.0 |
| 24.22.2 | compiler flags | 131.9 to 150.9 | 2.45 to 2.68 | 8.6 to 10.6 |
| 26.13.0 | none | 160.5 to 266.5 | 1.24 to 1.40 | 11.0 to 14.2 |
| 26.13.0 | compiler flags | 115.8 to 269.3 | 2.41 to 2.96 | 8.6 to 10.0 |

The order of magnitude holds. The spec's narrower ranges, such as 93 to 103 ms, did not repeat here, and on Node 26 the import gap between flag settings is within noise. The thresholds of 500 ms and 50 ms are Beni's and are not derived from these figures.

## Risks and accepted costs

- A reminder for a note called on the desktop still fires on the phone until the next import. The wording rule makes it say it is from a snapshot, and it does not stop it.
- Finding 2's test does not exist yet. AC12 requires one in the spike, and ADR-0009 requires one with the real app before any notification text ships. Spike code never merges, so that second test is the one that binds.
- A barrier or a call cannot reach a closed app. The ADR accepts this to keep nothing leaving the owner's machines.
- If the phone is not opened before its reminder window ends, reminders stop, and nothing in the spec warns the owner that they are about to.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes; S90 is Beni's ruling |
| Verdict mergeable, every High closed | **By exception.** Finding 1: closed by a green re-run plus ruling 11. Finding 2 (Codex's C9): High, closed by Beni's ruling 12 as an exception for this PR only, with AC12 and ADR-0009's obligation. It is not a fix commit with a test, and the clause as written is not met. |
| Nothing contested | Yes; settled above |
| `verify` green at tip; every number re-run | Yes for every number reported; the rest is listed as not re-run |
| No sensitive path, dependency or schema change | Yes; 3 docs files |
| Every commit cold-read by a non-author vendor | Yes; `804720e` by this seat, the other 8 by Cursor and Codex per the authorship record and comments |
| Gate verdict | **Would escalate** |
| Beni's decision (filled after) | Fix first (ruling 15). His merge decision follows the later Pass 2.5 |

## Questions for Beni

1. Fix M1 to M4 on this PR before merging? I recommend **yes**, because M1 and M3 sit on AC12, which ruling 12 leans on, and the spec stays as registered once merged. It costs one docs commit and a Codex re-read, and it voids the block below. **No** means merge now and carry them to a docs PR before the spike branch is cut.
2. Does A4's date-based prompt notify a closed app? Yes or no; this settles M3.
3. Do rulings 1 to 14 and the Cursor seat stand as the PM recorded them? Yes or no; these are second-hand here.

## Handoff block

Authors from `git log --format='%an <%ae>' origin/main..HEAD`: 8 commits by Claude, 1 by Codex. Review passes: Cursor (Pass 1), Codex (Pass 2 and re-read), Claude (Pass 2.5). `verify.yml` has no `ready_for_review` trigger, so `gh pr ready` does not restart the check.

```bash
gh pr ready 16 --repo BeniCheni/keel && gh pr merge 16 --repo BeniCheni/keel --squash --match-head-commit c4c3e1f817ee2c53b991cf2e5b9473fbee25c43d --subject "docs(s90): iOS core spike spec, phone journey and ADR-0009 (#16)" --body "$(cat <<'EOF'
Adds the S90 spec, a phone journey for the 48 Must and Should M1 stories, a pre-registered decision rule between JavaScriptCore and a Swift port, and ADR-0009 as Proposed. No code changes, and the M1 slice plan does not change.

Reviewed head: c4c3e1f817ee2c53b991cf2e5b9473fbee25c43d. Pass 1 by Cursor, by Beni's word for this PR only (issuecomment-6587500288). Pass 2 by Codex (issuecomment-6588858035), with its re-read (issuecomment-6589253253). Pass 2.5 by Claude (issuecomment-6590526388).

Finding 2's High closes by Beni's ruling 12, an exception for this PR only, not by a fix commit with a test. AC12 and ADR-0009 carry the test obligation.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
Co-authored-by: Cursor <cursoragent@cursor.com>
EOF
)" && git pull && test "$(gh pr view 16 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" = "$(git rev-parse origin/main)" && echo "origin/main is the squash commit" && pnpm install --frozen-lockfile && KEEL_DATA_DIR="$(mktemp -d)" pnpm verify
```

The third green check, demo mode starting with zero outbound requests, is N/A because no demo mode exists before the UI slices. Check by eye that the README renders. The merge is Beni's; this seat stops here.
