# Executive brief: PR #7, Pass 2.5, 2026-10-31 America/New_York

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim.

Seat: Claude, fresh session, Fable 5.1 High (sensitive-path PR: `AGENTS.md` and `.claude/skills/**`), fallback not used. This session wrote no line of PR #7: it started in a fresh clone of `docs/housekeeping` at `d3852d9` and made no commit on that branch. Reviewed head from GitHub: `d3852d90f828d444e2c8f96e2f2f53904b3d7f69` (`gh pr view 7 --json headRefOid`), equal to `git rev-parse HEAD` after `git fetch origin`. `KEEL_DATA_DIR` pointed at an empty temporary directory for every run (`export KEEL_DATA_DIR="$(mktemp -d)"`); no user data folder and no private pattern file was opened. Read in this order: `AGENTS.md` at `origin/main`, the PR's `AGENTS.md`, `docs/reviews/pr-7-pass-0.md`, `docs/reviews/pr-7-pass-1.5.md`, and the four Codex comments on PR #7.

## Decision

Shadow mode: the gate says **"would escalate"**, because the PR touches two sensitive paths (`AGENTS.md`, `.claude/skills/keel-pr-review/**`), so the "no sensitive path, dependency or schema change" clause is not met; every other clause holds. Beni merges, as `AGENTS.md` requires for every sensitive-path PR.

Review verdict on the content itself: **mergeable**. No High was found by any pass. Codex's eight Pass 1 findings are closed (three by Codex's own `acbcc25`, five by the PM's `ada396b` under Beni's rulings Q1 to Q6), Codex's two Pass 2 findings on S00.1's AC1 are closed by `f1bc1b6`, `72b9a7f` and `d3852d9` under rulings Q8 and 9, and Codex's final scoped read of `d3852d9` reports no finding in scope. Nothing is contested. `verify` is green at the tip on both Node lines and in CI. The one Codex-authored commit, `acbcc25`, passes this seat's cold read with no finding. One Medium from this seat is open outside tracked files (the PR body's commit and diff counts are stale); it does not change the verdict and Beni rules on it in question 2.

## What ships

- `AGENTS.md`: `main` moves only by a pinned PR squash merge with the `verify` check green, never by a direct push, an API edit or the web editor. Records PRs (only `docs/reviews/**` plus their index rows, never `gate-activation.md`) get one non-author cold read as a comment and write no records of their own. Builders push the next commit only after CI is green on the last. Follow-up slices may be numbered `sNN.M`. Hard rule 10 names each agent's commit identity.
- The review skill and the executive-brief template spell every `Co-authored-by` trailer out in full, resolved in the reviewed clone from Git authors plus every reviewing vendor, never by shell substitution at merge time.
- ADR-0001 to ADR-0008 record the Milestone 1 architecture: Tauri shell with a first-class browser build, core without I/O, terms as YAML with provenance on term fields, SQLite outside the repo, no value without evidence, bring-your-own-key connectors, end-of-day check, Monte Carlo isolated. After Codex's corrections, each claims only what `AGENTS.md`, S00 and S01 already say.
- `docs/specs/s00.1-tooling-hardening.md`: the next slice, ruled to build before S01: nested-run timeouts computed from the import graph per exported symbol, process-isolated temp files with an overlapping-process check, honesty discovery from Vitest's JSON report, a reviewed vendor-address exemption for the tripwire's email class, and `@keel/core` declaring `vitest`.
- The PR #7 Pass 0 and Pass 1.5 briefs, index rows, a `CHANGELOG.md` Unreleased update, and the ideas file with ideas 3 and 5 to 9 moved out with their outcomes.
- No product code, test, tooling, schema, fixture or dependency changes. keel still shows no value, predicts nothing and makes no outbound request; this PR changes the rules the next slices are built and reviewed under, not the product.

## What the passes found

- Pass 1 (Codex, GPT-6.1 Sol Extra High, [comment](https://github.com/BeniCheni/keel/pull/7#issuecomment-6546987719), reviewed `80c0eb3`, post-fix `acbcc25`): eight findings, no High. 1 Medium, the records-PR shortcut dropped the non-author cold read and reached `gate-activation.md`. 2 Medium, the trailer rule could not supply a reviewer who wrote no commit. 3 Medium, S00.1's AC4 same-process check did not prove cross-process isolation and missed the network test's shared file. 4 Medium, S00.1's AC1 covered direct `run()` calls only. 5 Medium, ADR-0003 claimed provenance on every field against S01's plain fields and source-free statuses. 6 Medium, ADR-0002 claimed the existing checks enforce purity. 7 Medium, ADR-0004 and ADR-0005 overclaimed. 8 Low, S00.1 had no story IDs. Codex fixed 5 to 7 in `acbcc25` and left 1 to 4 and 8 for Beni's rulings. Each of the four comments was posted from the `BeniCheni` GitHub login under the Codex seat heading (`gh api repos/BeniCheni/keel/issues/7/comments --jq '.[] | "\(.id) \(.user.login)"'`).
- Pass 1.5 (PM, `docs/reviews/pr-7-pass-1.5.md`): all eight accepted; Beni's rulings Q1 to Q7 recorded; 1 to 4 and 8 fixed by `ada396b`.
- Pass 2 (Codex, three scoped reads of the Claude commits after Pass 1): [`ada396b`](https://github.com/BeniCheni/keel/pull/7#issuecomment-6547327421), one Medium, AC1's listed-leaf oracle accepted an unlisted spawning wrapper without a timeout, Pass 1 findings 1 to 4 and 8 adjudicated as addressed (4 incomplete); [`f1bc1b6` and `72b9a7f`](https://github.com/BeniCheni/keel/pull/7#issuecomment-6547815846), one Medium, the module-wide `helpers.mjs` exemption reopened wrapper coverage; [`d3852d9`](https://github.com/BeniCheni/keel/pull/7#issuecomment-6548263446), no finding in scope, ruling 9 closed. Pass M N/A: no engine or golden fixtures. Codex named `acbcc25` as the only commit still needing a cold read, in each comment.
- Pass 2.5 cold read of `acbcc25` (Codex-authored, "docs: align ADR claims with specs and tooling limits"), from Git alone:
  - Scope: 4 files, 5 insertions, 5 deletions, all under `docs/adr/` (`git show --stat acbcc25`). `git diff --check acbcc25^ acbcc25` exits 0 with no output. No file outside the four ADRs is touched.
  - ADR-0002 now says the network guard checks outbound entry points and the import-boundary check isolates Monte Carlo, and that neither checks file-system, clock or randomness use. True to S00 Scope 5 (22 network entry points) and Scope 8 (`@keel/montecarlo` imports only). Reproduced in this session: a temporary `packages/core/src/zz-purity-probe-*.ts` importing `node:fs` and calling `Date.now()` and `Math.random()` leaves `node tools/boundary/cli.mjs` and `node tools/network/cli.mjs` at exit 0; the probe was removed and `git status --porcelain --untracked-files=all` printed nothing afterwards.
  - ADR-0003 now says each term field carries a value and provenance status or a conflict with every candidate, that a source is required only for the statuses that cite one, and that plain structural fields carry no provenance wrapper. True to S01: the field contract marks `schema`, `id`, `category`, `structure`, `underlyings.basket` and `ticker` as plain; `user`, `estimate`, `assumed` and `unknown` forbid `source`. The title change to "provenance on term fields" matches S01 story 3.1, "provenance on every term". The old title is quoted nowhere else in the tree except the Pass 1.5 brief's description of the finding (`grep -rn "provenance on every field" --include='*.md' .`).
  - ADR-0004 now says keeping runtime data outside the repo reduces accidental-commit risk, and that the heuristic tripwire, the owner's private-list check and review remain necessary. True to S00 Scope 4 and `AGENTS.md` hard rule 1, which call the tripwire a heuristic backstop.
  - ADR-0005 now scopes evidence to the dollar value in the value slot and sends Scenario estimates to ADR-0008 with their assumptions. True to `AGENTS.md` hard rules 3 and 7 and to ADR-0008 as written.
  - Personal data and figures: every digit-bearing token across the eight ADRs, listed with `cat docs/adr/*.md | grep -o -E '[A-Za-z/.-]*[0-9][A-Za-z0-9./:-]*' | sort | uniq -c`, is an ADR number, the two dates, "Section 6", "Tauri 2", "YAML 1.2", "SHA-256", "12 months", "Milestone 1", "hard rule 3", "hard rule 7" or the S01 spec path. No account, balance, holding, name beyond the owner, or research figure. The tripwire scan below covers the same files.
  - Finding: none. The commit removes overclaims and adds none.
- Pass 2.5 corroboration:
  - PR body claims 3 to 6 reproduce at the head: tripwire, copy lint and boundary CLIs exit 0; `git diff --check origin/main...HEAD` is clean; the ruleset prints `["deletion","non_fast_forward","required_linear_history","pull_request","required_status_checks"]` with `allowed_merge_methods: ["squash"]`, required context `verify`, enforcement `active`, no bypass actors; the changed paths are only `AGENTS.md`, `.claude/skills/**`, `docs/**` and `CHANGELOG.md`. The repository allows squash merges only (`gh api repos/BeniCheni/keel --jq '{allow_squash_merge,allow_merge_commit,allow_rebase_merge}'`).
  - **New from this seat, Medium, outside tracked files, not fixed:** PR body claims 1 and 2 are stale. The body says four commits and 351 insertions; at `d3852d9` the range has seven commits (six Claude, one Codex) and 355 insertions, in 17 files with 17 deletions. The body also says the Pass 1 rulings are applied in `ada396b` alone, while rulings Q8 and 9 landed in `f1bc1b6`, `72b9a7f` and `d3852d9`. Severity by `AGENTS.md`: a stale claim, Medium; it closes by editing the body. Question 2.
  - Pass 1.5's authorship table names the last PM commit by description because it could not know its own SHA: that commit is `d3852d9`, and Codex's fourth comment covers it.
- Contested: none. Codex's proposals were each put to Beni as yes/no questions and ruled; no vendor disputes a ruling.

## Verification as re-run

All at `d3852d9` in the fresh clone, each Node line selected with `nvm use` and confirmed with `node --version`.

| Check | Command | Result |
| --- | --- | --- |
| Head | `gh pr view 7 --json headRefOid`; `git rev-parse HEAD` | both `d3852d90f828d444e2c8f96e2f2f53904b3d7f69`; `origin/main` is `f47e047`, equal to GitHub's `main` and to `git merge-base origin/main HEAD`, so the base has not moved |
| Authorship | `git log --format='%h %an' origin/main..HEAD` | 7 commits: Claude `a0db3bb`, `80c0eb3`, `ada396b`, `f1bc1b6`, `72b9a7f`, `d3852d9`; Codex `acbcc25`. `git log --format='%an' origin/main..HEAD \| sort \| uniq -c`: 6 Claude, 1 Codex; `git rev-list --count origin/main..HEAD`: 7 |
| Diff | `git diff --shortstat origin/main...HEAD` | 17 files changed, 355 insertions, 17 deletions; `git diff --name-only origin/main...HEAD -- package.json pnpm-lock.yaml tools packages schemas .github/workflows fixtures` prints nothing; `git diff origin/main...HEAD -- '*.honesty.test.ts'` is empty |
| Install | `pnpm install --frozen-lockfile` | exit 0 on Node v24.22.2 and v26.13.0, pnpm 10.28.2 |
| Verify | `pnpm verify` | exit 0 on v24.22.2 and v26.13.0; each run: core 1 test passed (1 file), tooling 101 tests passed (8 files), eight `verify:* ok` lines (typecheck, tests, tooling, tripwire, network, determinism, copy, boundaries) |
| CI | `gh pr checks 7`; `gh api repos/BeniCheni/keel/commits/d3852d90f828d444e2c8f96e2f2f53904b3d7f69/check-runs` | 5 of 5 success at the head SHA: `cell` on ubuntu-latest and macos-latest for Node 24 and 26, and `verify`; run 41232568614, event `pull_request`, conclusion `success`; `gh pr view 7 --json mergeable,mergeStateStatus`: `MERGEABLE`, `CLEAN` |
| Determinism | `pnpm fixtures:regen && sh -c 'keel_generated_trees="$(pnpm -s fixtures:trees)" && keel_generated_status="$(printf "%s\n" "$keel_generated_trees" \| while IFS= read -r keel_generated_tree; do git status --porcelain --untracked-files=all -- "$keel_generated_tree" \|\| exit; done)" && test -z "$keel_generated_status"'` | exit 0 on v24.22.2; registered tree `fixtures`; also `verify:determinism ok` inside both `pnpm verify` runs |
| Zero network | `pnpm verify:network` | exit 0 on v24.22.2 (in-process macOS guard); the Linux namespace probe ran in the CI cells above; also `verify:network ok` inside both `pnpm verify` runs |
| Tripwire, copy, boundary | `node tools/tripwire/cli.mjs .`; `node tools/copy/cli.mjs`; `node tools/boundary/cli.mjs` | each exit 0, no output |
| Mutations | n/a | N/A: no tested claim in a docs-only diff. The one probe run (file-system, clock and randomness in core) tests ADR-0002's statement about the checks, not a check |
| Pass M | `python3 tools/reference/payoff.py fixtures/golden/` | N/A: no engine, no golden fixtures, no reference implementation yet |
| UI matrix, demo mode | n/a | N/A: no UI and no product surface yet |

Privacy sweep, counts per tripwire class, from `scanRepo` in `tools/tripwire/scan.mjs` grouped by `hit.class`, which never prints a matched value. The repo scan covers every tracked file at `d3852d9` and the 7 commit messages in `origin/main..HEAD`. The PR text scan covers the PR title, body and all four comments (387 lines), in a temporary repository with an empty allowlist and `origin/main` set to its one commit.

| Pattern class | Repo and commit messages | PR title, body, comments |
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

Negative control: `node tools/tripwire/cli.mjs <repo with no origin/main>` prints `scan error: origin/main unavailable` and exits 2, so a failed scan does not read as zero hits.

Not re-run, and why:

- The owner's private-list check: not run by this seat, which under the Fable rule works only on synthetic data and does not open `~/.config/keel/private-terms.txt` or any user data folder. It rests on Codex's counts: 0 hits per input over the diff, commit messages, PR body and each draft comment, with a readable-and-nonempty precheck and a missing-list control exiting 2, reported in all four Codex comments and covering every commit through `d3852d9`. Codex's claim, not verified here.
- Codex's mutations of the S00 guards, its AC1 and AC4 oracle models, its concurrent-load stress runs and its PR #6 landing checks: these test Claude-authored content, which Codex cold-read; this seat's read is limited to `acbcc25`.
- Fidelity of ADR-0001 to 0008 to the private research: the research was not opened. Beni confirmed the decisions second-hand as ruling Q7; question 1 asks him to confirm it here.

## Estimates and model output

None. No figure in this PR comes from a model or an assumption.

## Risks and accepted costs

- The rules in this PR are checked by reading, not by a test. The `main` ruleset is the only mechanical enforcement of "main moves only by a PR merge", and this seat verified its live configuration, not how `f47e047` bypassed it; the PR body says so. The required `verify` check now blocks a commit with no green run by any route.
- A records PR gets one cold read and no briefs. That is a deliberate reduction in review depth for files that only record reviews, accepted by Beni in ruling Q1 with `gate-activation.md` excluded.
- S00.1 is a plan. Codex's oracles model its AC1 and AC4, and the three rounds of Q8 show the spawning predicate was hard to state; the build will tell whether the import-graph computation is implementable as written. The spec's mutation floor carries the cases Codex found.
- The ADRs cite decisions from research held privately until a scrubbed copy lands in `docs/proposals/`. Until then a reader cannot check them against their source.
- The PR body's counts are a dated snapshot that went stale after three more commits; this brief's counts are at the head.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | yes: docs and rules only, root package stays `0.0.0`; S00.1's numbering was ruled by Beni (Q7), not forked |
| Verdict mergeable, every High closed (fix commit with a failing-first test, or for a High outside tracked files, a recorded remediation check plus Beni's confirmation) | yes: no High in any pass; eight Pass 1 Mediums and one Low closed in `acbcc25` and `ada396b`; two Pass 2 Mediums closed in `f1bc1b6`, `72b9a7f`, `d3852d9`; one Medium from this seat open in the PR body only |
| Nothing contested | yes |
| `verify` green at tip; every number re-run | yes on v24.22.2 and v26.13.0 and in CI run 41232568614 at the head SHA; every number above re-run here, except the private-list check listed as not re-run |
| No sensitive path, dependency or schema change | **no**: `AGENTS.md` and `.claude/skills/keel-pr-review/SKILL.md` and `executive-brief.md` are sensitive paths; no dependency, no schema |
| Every commit cold-read by a non-author vendor (authorship record) | yes: `a0db3bb`, `80c0eb3` (Claude) read by Codex at Pass 1 (issuecomment-6546987719); `ada396b` (Claude) by Codex (issuecomment-6547327421); `f1bc1b6`, `72b9a7f` (Claude) by Codex (issuecomment-6547815846); `d3852d9` (Claude) by Codex (issuecomment-6548263446); `acbcc25` (Codex) by this seat. 2 + 1 + 2 + 1 + 1 = 7 = `git rev-list --count origin/main..HEAD` |
| Gate verdict | **would escalate** (sensitive paths; the delegated gate never covers this PR). Beni merges |
| Beni's decision (filled after) | |

### Authorship record

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `a0db3bb` housekeeping, `80c0eb3` Pass 0 brief | Claude (PM) | Codex, Pass 1 |
| `acbcc25` ADR corrections | Codex | Claude, Pass 2.5 (this session, Fable 5.1 High), no finding |
| `ada396b` rulings Q1 to Q6 and the Pass 1.5 brief | Claude (PM) | Codex, scoped Pass 2 |
| `f1bc1b6`, `72b9a7f` ruling Q8 | Claude (PM) | Codex, scoped Pass 2 |
| `d3852d9` ruling 9, per-symbol helper tracking | Claude (PM) | Codex, scoped Pass 2 |
| The commit adding this brief, on branch `docs/pr-7-records` from `origin/main` (SHA in the PR comment that links it) | Claude (this Pass 2.5 session) | the records-PR cold read, by a vendor that authored none of its commits, when that PR opens |

## Questions for Beni

Each answerable in one word.

1. Confirm rulings Q1 to Q9 as recorded second-hand in `docs/reviews/pr-7-pass-1.5.md`, and the ADR decisions dated 2026-10-29, as yours? (yes/no) **Ruled 2026-10-31 (America/New_York): yes. Confirmed.**
2. Refresh the PR body's commit and diff counts (seven commits, six Claude and one Codex; 17 files, 355 insertions, 17 deletions; rulings Q8 and 9 in `f1bc1b6`, `72b9a7f`, `d3852d9`) before merging? (yes/no) **Ruled 2026-10-31: yes. Done before the ruling reached this seat: the body was edited at 21:37 (America/New_York) on 2026-10-31, right after the Pass 2.5 comment, and its claims 1 and 2 now equal the re-runs above (`gh pr view 7 --json body,updatedAt`). The Medium from this seat is closed.**
3. Merge PR #7 at `d3852d9` with the handoff block below? (yes/no) **Ruled 2026-10-31: yes. Beni runs the block; in shadow mode and on a sensitive-path PR this seat does not merge.**
4. Open the records PR from `docs/pr-7-records` now, or batch it with later records? (now/batch) **Ruled 2026-10-31: batch.**

## Handoff block

Every trailer is literal text. Both vendors wrote commits (`git log --format='%an <%ae>' origin/main..d3852d9` in the reviewed clone prints `Claude <noreply@anthropic.com>` six times and `Codex <noreply@openai.com>` once), and both reviewed (Codex at Passes 1 and 2, Claude at Pass 2.5), so the two trailers cover authors and reviewers. The base did not move during review, so the squash tree must equal the reviewed tree.

```bash
gh pr merge 7 --repo BeniCheni/keel --squash --match-head-commit d3852d90f828d444e2c8f96e2f2f53904b3d7f69 --subject "docs: housekeeping rules, trailers, ADR-0001 to 0008 and the S00.1 spec" --body "Housekeeping after S00: main moves only by a pinned PR merge, records PRs, literal co-author trailers, ADR-0001 to 0008, and the S00.1 spec. Reviewed head d3852d90f828d444e2c8f96e2f2f53904b3d7f69.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>"
git checkout main && git pull --ff-only
test "$(git rev-parse origin/main)" = "$(gh pr view 7 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" && echo "origin/main equals the squash commit"
git diff --quiet d3852d90f828d444e2c8f96e2f2f53904b3d7f69 origin/main && echo "squash tree equals the reviewed tree (base did not move)"
pnpm install --frozen-lockfile
pnpm verify
echo "demo mode: N/A, no product surface yet"
```

Not a release: no tag.
