# Executive brief: PR #3, Pass 2.5, 2026-10-30 America/New_York

Every number below comes from a command run in this session, in a fresh clone of `s00/tooling` at head `bbe3aec0fb6b0c62441e3cdff72f59ac58c7f879` (taken from `gh pr view 3 --json headRefOid` and equal to `git rev-parse HEAD` after `git fetch`). A number taken from a PR body or comment is labelled as that vendor's claim. Seat: Claude, fresh session, Fable 5.1 High (`claude-fable-5-1`, the sensitive-path pin); fallback not used. `KEEL_DATA_DIR` pointed at an empty `mktemp -d` directory for every command; no user data folder and no private pattern file was opened. This brief lives on branch `docs/pr-3-reviews`, like the Pass 0 and Pass 1.5 briefs, so that no further Claude-authored commit enters PR #3.

## Decision

Shadow mode: the gate says **"would escalate"**, because the PR touches three sensitive paths (`packages/core/**`, `.github/workflows/**`, `tools/tripwire/**`) and adds two dependencies (`typescript`, `vitest`), so the "no sensitive path, dependency or schema change" clause is not met; every other clause holds. Beni merges.

Review verdict on the content itself: **mergeable**. Every High is closed with a test that fails without its fix, nothing is contested between vendors, `verify` is green at the tip on both Node lines and in CI, and the three Codex-authored commits pass this seat's cold read with no finding. One new Medium from this seat stays open as a record (the honesty-discovery test reads pnpm's command echo; details under "New from this seat"); it fails closed, not open, so it does not change the verdict. Beni rules on it in question 2.

## What ships

- A workspace that gates every commit before any product code exists: `pnpm verify` runs typecheck, the `@keel/core` smoke test, the tooling self-tests, the PII tripwire, the network guard, the determinism check, copy lint and the import boundary, runs every step even after one fails, and names each failed step.
- A PII tripwire that scans every tracked file and every commit message in `origin/main..HEAD` for CUSIP and ISIN check-digit hits, account identifiers, SSN shapes, street addresses, non-noreply emails, unmarked price files, local-only paths and unscannable files, exits 2 on a scan error, and never prints a matched value. Its allowlist ships empty.
- Two network layers: an in-process guard that makes 22 named entry points throw `network blocked: <name>` in every Vitest run, and on Linux CI a network namespace with no route out whose probe prints the no-route code it saw.
- A determinism check that regenerates the registry's outputs and requires `git status --porcelain --untracked-files=all` on the registered trees to exit 0 and print nothing, so a failed Git command never reads as clean; the registry is empty in this slice.
- CI on ubuntu and macOS at Node 24 and 26 with a single `verify` job that is red if any cell is anything but `success`.
- What it still declines to claim: no product behaviour, no terms schema, no UI, no connector, no Monte Carlo, no Pass M reference. A clean tripwire run is a heuristic backstop and is not a claim that the tree holds no personal data.

## What the passes found

- Pass 1 (Claude Code, Fable 5.1 Extra, at `3c8b544`, fixes to `d0caa9c`): 10 findings. 1 High: the account-keyword window was stricter than the spec and seven boundary mutants survived (closed by `9cb2a56` and `d0caa9c`). 6 Medium: acceptance commands ran the whole suite (`885eb4b`), the local guard let a dozen transports through (`68bac4e`), the verify runner could be silenced from the environment (`585c12e`), the namespace probe accepted any failure (`84d160e`), four off-boundary mutants survived (`aa78a99`), and `8b9dfee` is red in CI (history, ruling 4). 3 Low: four mutant-table rows overclaimed, honesty discovery proved its failing half by absence, and a Node-version line was mis-cited.
- Pass 1.5 (PM): all 10 accepted; finding 7 at Medium; rulings 1 to 4 recorded; `55774a1` brought the spec in line with rulings 1 to 3. Corrected after Pass 2: its sentence calling T14 and T15 equivalent was wrong.
- Pass 2 (Codex, GPT-6.1 Sol Extra High, at `55774a1`, fixes to `bbe3aec`): all 10 Pass 1 findings accepted with its own commands, finding 8's equivalence explanation corrected. Own findings: P2-A High (direction and unit deletions are non-equivalent surviving boundary mutants; `fc13571`, test-only), P2-B High (the masked form's mask length and digit limits were unpinned; `fc13571`, test-only), P2-C Medium (named ESM builtin imports bypassed the guard; `bbe3aec`), P2-D Medium (template, options and commented import calls escaped the boundary; `f5a0ca7`), P2-E Medium (a failing `fixtures:trees`, an unrelated probe crash and a missing `needs: [cells]` were untested; `fc13571`). Pass M: N/A, no engine. Private-list check: 0 matches in tracked files, commit messages, PR body and comments (Codex's counts).
- Pass 2.5 cold read of the Codex-authored commits (this seat; `git log --format='%h %an' origin/main..HEAD` names exactly these three as Codex):
  - `fc13571` (test-only; `tools/acceptance/test/{determinism,needs-check,network,tripwire}.test.mjs`, 83 insertions, 1 deletion): at the head the four files pass 12, 5, 26 and 37 tests. In a scratch worktree I applied each of the eight mutants the commit targets and ran the file twice, once with the head's tests and once with the tests restored from `fc13571^`: delete the direction fragment, delete the unit fragment, mask run `{3,}` to `{4,}`, digit suffix `{3,4}` to `{4}` and to `{3,5}` (tripwire: new tests 1 failed of 37 each, the named regression; old tests 34 of 34 pass), ignore `treesRun.status` (determinism: 1 failed of 12; old 11 of 11 pass), `blockedByGuard` without the message check (network: 1 failed of 26; old 25 of 25 pass), delete `needs: [cells]` from the workflow (needs-check: 1 failed of 5; old 5 of 5 pass). Each mutant lives under the old coverage and dies under the new, for the test Codex named. The test positives are generated in temporary repositories; no realistic value is committed. No finding.
  - `f5a0ca7` (`tools/boundary/check.mjs` plus one test): with `f5a0ca7^:tools/boundary/check.mjs` restored and the new test kept, `copy-boundary` fails 1 of 6 (`literal calls with templates, import options, and comments cannot cross the boundary`); at the head 6 of 6 pass. Read: the trivia alternatives (whitespace, block comment, line comment) start with disjoint characters, so no backtracking blow-up; a template literal containing `${` is not a literal and is skipped, as before. Beyond the committed tests, 11 cases of my own in temporary trees: a similar package name in a dynamic import, a similar name with options, a template with an expression, a comment naming `packages/montecarlo`, the new forms inside both allowed importers, and a plain string that is not a call argument all exit 0; comments inside the call, a newline plus line comment inside the call, a subpath in a template literal and the pre-existing static form all exit 1. Twenty unterminated calls with 40,000 characters of trivia each scan in 29 ms. No finding.
  - `bbe3aec` (`tools/network/guard.mjs` plus one test): with `bbe3aec^:tools/network/guard.mjs` restored and the new test kept, `network` fails 1 of 26 (`the guard blocks builtin ESM named imports as well as default imports`); at the head 26 of 26 pass. The 22 `block("...")` names in `guard.mjs` equal the spec's 22-entry list in the same order, and `probeNames` in `run.mjs` equals that list (`diff` of the extracted names: empty; `JSON.stringify` equality: true, length 22). `syncBuiltinESMExports` is a function on v24.22.2 and v26.13.0. Beyond the committed test, a file importing `request`, `get`, `connect`, `createConnection`, `Socket`, `tls.connect`, `resolve4`, `Resolver` and `promises` by name from `node:http`, `node:https`, `node:net`, `node:tls` and `node:dns` throws `network blocked: <name>` for all 10 calls under the new guard; the same file against the old guard lets 7 of the 10 through. No finding.
- Pass 2.5 corroboration of earlier findings, re-checked at head:
  - Pass 1 #1 and ruling 3: `scan.mjs` loops `while (i < windowEnd)` with `windowEnd = keywordEnd + 40`, the start rule; the tripwire file passes 37 of 37, which includes the `starts 39` and `starts 40` regressions.
  - Pass 1 #2 and ruling 1: each spec filter runs one file: `verify-runner` 6, `tripwire` 37, `network` 26, `determinism` 12, `copy-boundary` 6, `needs-check` 5, `test-contract` 5, `namespace-probe` 4; sum 101, equal to the gate's tooling count.
  - Pass 1 #3 and ruling 2: the 22 names, as above.
  - Pass 1 #5: the head run's two ubuntu cells print `fetch blocked: EAI_AGAIN` and `net.connect blocked: ENETUNREACH` after `verify ok` and `namespace-probe`.
  - Pass 1 #7 and ruling 4: `gh run list --branch s00/tooling --workflow verify` shows five runs; only 41112013304 at `8b9dfee` is `failure`; the PR body's corrections section records it.
  - Pass 1 #10: the namespace step's own `node --version` prints v24.22.1 on the ubuntu Node 24 cell and v26.13.0 on the ubuntu Node 26 cell, matching each cell's `Node version` step.
  - P2-A, P2-B, P2-E: the eight mutant runs above.
  - AC8 live half: `pnpm test:ci-evidence -- --success-run 41158421752 --failure-run 41113925991` prints `ci-evidence ok`, exit 0. PR #4 is `CLOSED`, `mergedAt` null, base `s00/tooling`, head `14e6db2`; `git ls-remote --heads origin s00/probe-verify-red` prints nothing; `git merge-base --is-ancestor 14e6db2f75c2d68c052d452586fb466a7e09d729 HEAD` exits 1 after fetching `refs/pull/4/head`.
  - Sealed claims 5 and 6: `pnpm -s fixtures:trees | od -An -tx1` prints `66 69 78 74 75 72 65 73 0a`; `wc -c tools/tripwire/allowlist.txt` prints 0.
- Contested: none. Codex accepted every Pass 1 finding; the PM accepted Codex's correction of finding 8 and of the Pass 1.5 note; Beni's rulings 1 to 4 stand, and the test-only closure of P2-A and P2-B was ruled during Pass 2 (recorded second-hand by Codex; question 1).
- New from this seat: **Medium, open**, `tools/acceptance/test/test-contract.test.mjs:75` (Cursor, `3c8b544`) and `:89` (Claude, `aa78a99`). The honesty-discovery test asserts that the child's output contains the temporary file's name, but Vitest's default reporter prints no per-file line here, so the assertion is met by pnpm's echo of the command (`> vitest run --config vitest.config.mjs zz-acceptance.honesty`) and not by Vitest's report. Reproduced three times: `pnpm -s test:tooling -- test-contract` exits 1 with `expected '\n RUN  v5.0.5 ...' to contain 'zz-acceptance.honesty'`, while the spec's `pnpm test:tooling -- test-contract` and `pnpm verify` pass (5 of 5). With a temporary honesty file in place, `FORCE_COLOR=1 pnpm --filter @keel/core test zz-acceptance.honesty` prints the file name only on pnpm's echo line, and the same command with `-s` never prints it. The `Tests 1 passed` and `Tests 1 failed` assertions still prove that a test was discovered and ran, because a no-match filter exits 1 with `No test files found`, so no honesty file can go undiscovered and pass; the defect is that the gate fails closed under a silent invocation and that the file-name assertion answers Pass 0 item 5 with pnpm's echo rather than Vitest's output. Not fixed by this seat: the PM writes no code, and a Claude fix commit would need another Codex read. The test-only fix is small (assert on the summary, or run Vitest with `--reporter` set, or accept the echo and say so); it belongs with idea 5 in `docs/v0.1.0-ideas.md` (structured reporter) if Beni defers it (question 2). Beni deferred it on 2026-10-31; see the ruling under question 2.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Head SHA | `gh pr view 3 --json headRefOid`; `git fetch; git rev-parse HEAD` | both `bbe3aec0fb6b0c62441e3cdff72f59ac58c7f879`; PR open, not draft, title `feat(s00): repo tooling`, base `main` at `0db249a` |
| Install | `nvm exec 24.22.2 pnpm install --frozen-lockfile`; `nvm exec 26.13.0 pnpm install --frozen-lockfile` | exit 0 on v24.22.2 and v26.13.0, pnpm 10.28.2 |
| Verify | `nvm exec 24.22.2 pnpm verify`; `nvm exec 26.13.0 pnpm verify` | exit 0 on both lines; eight `verify:* ok` lines; core 1 file, 1 test passed; tooling 8 files, 101 tests passed; `verify ok` |
| CI at head | `gh run view 41158421752 --json headSha,conclusion,jobs`; `gh run view 41158421752 --log` | `headSha` = head, `success`; `cell (ubuntu-latest, node 24)`, `cell (macos-latest, node 24)`, `cell (ubuntu-latest, node 26)`, `cell (macos-latest, node 26)` and `verify` all `success`; `Node version` step v24.22.1, v24.22.1, v26.13.0, v26.13.0; namespace `node --version` v24.22.1 and v26.13.0; each cell `Test Files 1 passed (1)` and `8 passed (8)`; four `verify ok` lines; probe codes `EAI_AGAIN` and `ENETUNREACH` on both ubuntu cells |
| Determinism | `pnpm verify:determinism` (inside `pnpm verify`) and the registry probes | ok on both lines; empty registry prints `fixtures`; the `determinism` file's 12 tests cover edit, deletion, staged, untracked, Git failure, failing `fixtures:regen`, failing `fixtures:trees` and a clean run |
| Zero network | `pnpm verify:network` (inside `pnpm verify`); CI namespace probe | ok on both lines (22 probes); namespace probe lines as above |
| Mutations | eight mutant runs against `fc13571`, two reversals against `f5a0ca7` and `bbe3aec` (procedure above) | 8 of 8 mutants killed by the new tests and alive under the old; both reversals fail their new test |
| Pass M | `python3 tools/reference/payoff.py fixtures/golden/` | N/A: no engine, no golden fixtures in S00 |
| UI matrix | | N/A: no UI in S00 |
| Diff | `git diff --shortstat origin/main...HEAD` | 53 files changed, 3566 insertions, 13 deletions; Codex's share `git diff --shortstat 55774a1..HEAD`: 7 files, 144 insertions, 4 deletions |
| Sensitive paths | `git diff --name-only origin/main...HEAD` filtered by the AGENTS.md list | `.github/workflows/verify.yml`, five files under `packages/core/`, `tools/tripwire/{allowlist.txt,cli.mjs,scan.mjs}`; none among the Codex commits' 7 files |
| Dependencies | `node -e 'const p=require("./package.json"); ...'` | devDependencies `typescript` 7.0.2 and `vitest` 5.0.5 only; `packageManager` pnpm@10.28.2; `engines.node` `>=24`; both expected by the spec |
| Honesty tests | `git diff origin/main...HEAD -- '*.honesty.test.ts' \| wc -c` | 0 |
| Whitespace | `git diff --check origin/main...HEAD` | clean, exit 0 |
| Tripwire, repo | `node tools/tripwire/cli.mjs .`; `pnpm verify:tripwire` | exit 0, 0 lines on stdout and stderr, over 73 tracked files (`git ls-files \| wc -l`) and 14 commit messages (`git rev-list --count origin/main..HEAD`); per class: cusip 0, account 0, ssn 0, address 0, email 0, price 0, local-only 0, unscannable 0, allowlist 0 |
| Tripwire, PR text | PR title and body (197 lines), both review comments (436 lines) and the 14 commit messages committed into a temporary repository with an empty allowlist and `origin/main` set, then `node tools/tripwire/cli.mjs <dir>` | 3 hits, all in the comments file: address 1, ssn 1, email 1 (the canonical placeholders Pass 1 named); body and commit messages 0; no matched text printed; equal to Codex's table |
| Spec filters | `pnpm test:tooling -- <name>` for each AC | 6, 37, 26, 12, 6, 5, 5, 4 tests; each `Test Files 1 passed (1)` |
| AC8 live | `pnpm test:ci-evidence -- --success-run 41158421752 --failure-run 41113925991` | `ci-evidence ok`, exit 0 |
| Guard list | names extracted from `guard.mjs`, the spec and `run.mjs` | 22 = 22 = 22, same order |
| Authorship | `git log --format='%h %an' origin/main..HEAD` | 14 commits: Cursor 2, Claude 9, Codex 3 (table below) |
| Clone state | `git status --porcelain --untracked-files=all` | empty before and after every scratch run; scratch worktrees removed |

Not re-run, and why:

- The owner's private-list check: not re-run by this seat. Fable seats work only on synthetic data and never open `~/.config/keel/private-terms.txt`. It rests on Codex's Pass 2 counts (0 matches in tracked files, commit messages, PR title and body, and comments).
- `sudo unshare --net` locally: darwin host. The namespace evidence is the CI log of run 41158421752.
- Demo mode: N/A, S00 has no product.

## Estimates and model output

None. No figure in this PR comes from a model or an assumption.

## Risks and accepted costs

- The tripwire is a heuristic. It catches the shapes the spec names and nothing else; the owner's private-list check and review cover arbitrary names and facts. A 9-digit integer passes the CUSIP check digit one time in ten, so S01's fixture generator must keep integer-cent values below nine digits or allowlist them (ideas file, rank 2).
- The in-process guard is the only network layer on macOS and on a developer's machine. The Linux namespace is authoritative, and only CI runs it.
- `actions/setup-node` floats within a major: CI resolved v24.22.1 while the local floor run used v24.22.2. The three workflow actions are tag-pinned (`@v4`); SHA pinning is ideas rank 1.
- `8b9dfee` is red in CI history (run 41112013304). Beni ruled to keep it rather than force-push a rebuild.
- The honesty-discovery test depends on pnpm echoing its command (the open Medium above). Under `pnpm -s` the gate fails closed.
- Vitest's printed summary is still the evidence of honesty-file discovery; a structured reporter is ideas rank 5.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | yes: non-release slice toward `v0.1.0`; root package stays `0.0.0` |
| Verdict mergeable, every High closed (fix commit with a failing-first test, or for a High outside tracked files, a recorded remediation check plus Beni's confirmation) | yes: Pass 1 #1 closed by `9cb2a56` and `d0caa9c` (Codex reproduced the failing-first test); P2-A and P2-B closed test-only by `fc13571` under Beni's Pass 2 ruling, each regression failing on its mutant in this session (question 1 confirms the ruling) |
| Nothing contested | yes |
| `verify` green at tip; every number re-run | yes on v24.22.2 and v26.13.0 and in CI run 41158421752; every number above re-run here, except the private-list check listed as not re-run |
| No sensitive path, dependency or schema change | **no**: three sensitive paths and two devDependencies; no schema |
| Every commit cold-read by a non-author vendor (authorship record) | yes: `8b9dfee`, `3c8b544` (Cursor) read by Claude Code at Pass 1 (issuecomment-6532940023); `9cb2a56`, `585c12e`, `68bac4e`, `84d160e`, `aa78a99`, `885eb4b`, `0fadf6a`, `d0caa9c`, `55774a1` (Claude) read by Codex at Pass 2 (issuecomment-6537661855, commit table); `fc13571`, `f5a0ca7`, `bbe3aec` (Codex) read by this seat. 2 + 9 + 3 = 14 = `git rev-list --count origin/main..HEAD` |
| Gate verdict | **would escalate** (sensitive paths and dependencies; the delegated gate never covers this PR). Beni merges |
| Beni's decision (filled after) | merged by Beni 2026-10-31 (America/New_York) as squash commit `e9ab4ba` on base `0db249a`. Post-merge checks: `origin/main` equals `gh pr view 3 --json mergeCommit` (Beni's run); `git diff --quiet bbe3aec0fb6b0c62441e3cdff72f59ac58c7f879 origin/main` exits 0, so the squash tree equals the reviewed tree and the green `verify` at the reviewed head carries over. **Attribution defect, ruled "record" by Beni on 2026-10-31:** the squash message carries `Co-authored-by: Cursor <>`, because the handoff block took Cursor's address from `git log -1 --format=%ae 8b9dfee` and the clone the merge ran from had not fetched that commit. Cursor authored `8b9dfee` and `3c8b544`, reachable through PR #3 and recorded in the authorship row above. Beni ruled not to rewrite `main` (hard rule 10, and `origin/main` must stay equal to the recorded merge commit); the record is this row and the `CHANGELOG.md` note. Lesson for the template: spell the trailers out in the brief and give the tripwire an exemption for vendor addresses (ideas-file candidate). |

## Questions for Beni

Each answerable in one word.

1. Confirm the ruling Codex recorded during Pass 2: the direction, unit and masked-form survivors are High and close test-only with `fc13571`? (yes/no) **Ruled 2026-10-31 (America/New_York): yes. Approved;** the second-hand record in issuecomment-6537661855 is confirmed first-hand.
2. Defer the open Medium (honesty discovery satisfied by pnpm's echo; fails under `pnpm -s`) to the ideas file as a test-only follow-up rather than fixing it on this PR? (yes/no) **Ruled 2026-10-31 (America/New_York): defer. Approved.** The Medium stays open on this PR as a record and does not block the merge. `docs/v0.1.0-ideas.md` is part of PR #3's diff (`0fadf6a`), so the row lands after the merge, in the next PM docs change, as: "Honesty-file discovery test asserts the file name from pnpm's command echo, not Vitest's report; `pnpm -s test:tooling -- test-contract` fails while `pnpm verify` passes. Assert on Vitest's own output (pairs with rank 5). Source: PR #3, Pass 2.5. Size XS."
3. Merge PR #3 at `bbe3aec0fb6b0c62441e3cdff72f59ac58c7f879` with the block below? (yes/no) **Ruled 2026-10-31 (America/New_York): yes. Approved.** Shadow mode: Pass 2.5 does not run the merge; Beni, or Cursor as merge logistics on Beni's word, runs the block, and the decision row below is filled once GitHub records the squash commit.

## Handoff block

Cursor's trailer takes its address from Git (`git log -1 --format=%ae 8b9dfee`, the author of the PR's first commit) rather than spelling it here, because the tripwire's email class flags every non-noreply address in a tracked file and the allowlist cannot cover a path outside `fixtures/` (ideas rank 3). Run from a clone that has fetched `s00/tooling`; the substitution yields the same trailer Cursor's commits carry.

```bash
gh pr merge 3 --repo BeniCheni/keel --squash --match-head-commit bbe3aec0fb6b0c62441e3cdff72f59ac58c7f879 --subject "feat(s00): repo tooling" --body "Slice S00: the pnpm workspace, the empty @keel/core package and the verify gate later slices inherit (tripwire, network guard, determinism check, copy lint, import boundary, CI). Reviewed head bbe3aec0fb6b0c62441e3cdff72f59ac58c7f879.

Co-authored-by: Cursor <$(git log -1 --format=%ae 8b9dfee)>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>"
git checkout main && git pull --ff-only
test "$(git rev-parse origin/main)" = "$(gh pr view 3 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" && echo "origin/main equals the squash commit"
git diff --quiet bbe3aec0fb6b0c62441e3cdff72f59ac58c7f879 origin/main && echo "squash tree equals the reviewed tree (base did not move)"
pnpm install --frozen-lockfile
pnpm verify
echo "demo mode: N/A, S00 has no product"
```
