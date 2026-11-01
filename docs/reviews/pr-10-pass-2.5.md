# Executive brief: PR #10, Pass 2.5, 2026-11-01 America/New_York

Recorded by the PM on 2026-11-01 (America/New_York). The Pass 2.5 session (Claude, fresh session, Opus 5.5 High) delivered this brief in chat, and its PR comment ([issuecomment-6562088749](https://github.com/BeniCheni/keel/pull/10#issuecomment-6562088749)) says the PM records it. "This session" and "this seat" below mean that session. The text is unchanged except for one trailer in the handoff block, replaced and marked there, and the sections the PM added after the handoff block. The "Beni's decision" row stays empty until the PR merges.

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim.

## Decision

Shadow mode: the gate says **would merge**, because no High or defect is open, `verify` is green at the tip, and nothing is contested between vendors. Beni merges. Two things come first: the one question below and Beni's private-list check.

PR comment: [issuecomment-6562088749](https://github.com/BeniCheni/keel/pull/10#issuecomment-6562088749).

## What ships

- The spawn analyzer now fails closed when a Vitest test is reached any way other than a named import of `test` or `it` that is called. It also accepts `test.only`, `test.concurrent`, `test.each(table)(...)` and `test.skipIf(cond)(...)`.
- Re-exports of Vitest, template and parenthesised `import()`, `vi.importActual`, `import.meta.vitest` and direct paths into the installed package now throw.
- The analyzer also reads imports after a semicolon-free statement, and it scans `.mts`, `.cts`, `.jsx` and `.tsx`.
- It still declines to claim complete coverage. A hand-written lexer has known silent routes, and the PR body's residual-risk sentence lists them. No live test uses a route that I or Pass 2 found.
- No product code, dependency or sensitive path changes.

## What the passes found

- **Pass 1 (claims re-derived below):**
  - Findings 1 to 6, Medium: silent routes, fixed in `970d21a`, `57dd887` and `d37b08b`.
  - Finding 7, Medium: mutants that survived the new clauses, fixed in `5989f81`.
  - Finding 8, Low: fixed in `5989f81`.
  - Finding 9, Medium: stale PR body, closed by the PM's corrections.
  - Finding 10, Medium: routes outside the slice, left open by ruling.
  - Finding 11, Low: poor error message for an object key named `import`, left open.
- **Pass 2:** accepted all eleven with no fix commit. It added C1 (computed `vi["importActual"]`), C2 (symlink path) and C3 (spawning function after a semicolon-free statement), all Medium, and C4 (JSX/TSX syntax), Low. Pass M is N/A.
- **Pass 2.5 corroboration:**
  - Findings 1 to 6, 8, 10 and 11, and C1 to C4, all reproduce in Codex's harness at `origin/main`, `b4ff2af` and head.
  - The PM's regex route reproduces too.
  - The finding 7 kills reproduce through Codex's 43 mutants; Pass 1's own totals could not be re-run.
  - Finding 9: the PM's corrections check out line by line, as below.
- **Contested:** nothing. No result disagrees with another vendor's.

### New from this seat

A1 to A6 are silent: the analyzer reports nothing, Vitest exits 0 with 1 passed, and the child spawns. They are also silent at `origin/main` and `b4ff2af`. All are unfixed under Beni's ruling, and none is a form a fix claims, so none is a defect. This follows the PM's reasoning on C1.

| # | Severity | Form | Named in the residual-risk sentence? |
| --- | --- | --- | --- |
| A1 | Medium | `vi.importActual?.("vitest")` | No |
| A2 | Medium | `vi.importActual("vitest")` | No |
| A3 | Medium | `import.meta.vitest` | No |
| A4 | Medium | `import("../../../node_modules/./vitest/dist/index.js")` | No |
| A5 | Medium | `import("vitest?x")` | No |
| A6 | Medium | `import("#v")` with a `package.json` `imports` map | No |
| A7 | Low | The `970d21a` subject ("every other route") and the comment above `assertVitestImports` overclaim. The squash message below does not repeat this | n/a, not a route |

**No live use:** `git grep` for these forms under `tools/` prints nothing outside the analyzer and contract test, and neither the root nor any `packages/*` `package.json` has an `imports` field. These greps match common forms, so they support the claim without proving it.

**Killed as unreproducible:**
- A direct `process.getBuiltinModule("node:child_process")` looked silent at first, but it is listed in `forbiddenChildProcessImports` in all three placements I tried.
- `const a = { export: 1 }` is not a new rejection.

### Corrections after Pass 1, line by line

| Line | Holds? | Evidence |
| --- | --- | --- |
| Cursor's text unchanged | Yes | The first 76 lines equal Cursor's last revision and every PM revision (GraphQL `userContentEdits`) |
| Head | Yes | `gh pr view 10 --json headRefOid` |
| Diff | Yes | 2 files, 367 and 24 (`git diff --shortstat origin/main...HEAD`); `grep -c '^-[^-]'` on the test file prints `0` |
| Test counts | Yes | Tooling 120 in 8 files, core 1, on both Node versions; contract file 17 |
| Fix commits can fail | Yes | Final test file against the `b4ff2af` analyzer: 16 passed, 1 failed, `unrecognised vitest test registration fails closed` |
| Deliberately not done | Yes | Re-exports, named and star, throw; locals in a title, table or condition throw; the modifier rows still throw |
| New rejections | Yes | `import type`, `typeof test`, a parameter named `test` or `it`, a backslash regex after `)` or `}`, and JSX/TSX each throw |
| Scope | Yes | Recorded in `pr-10-pass-1.5.md`, and your prompt restates it |
| Residual risk | True, but incomplete | Equals Pass 2's text word for word (Python comparison of both bodies, 757 characters). It omits A1 to A6 |
| CI | Yes | Runs 41328902804, 41329087886, 41329261127 and 41329632281 match their SHAs, all `success` (`gh run view`) |

Residual-risk clauses, as observed:
- **Green escapes:** constructed specifiers, alias and wrapper loaders, computed members, symlink paths, worker threads, runtime-generated code, the regex route, a function after a semicolon-free statement, code outside `tools/`, hooks, `describe` bodies, module top level and object members.
- **Not a green escape:**
  - My `node:cluster` form was silent at the analyzer but timed out at 5000 ms.
  - Two lexical-shadowing forms were flagged, not silent. The rejection side of shadowing does reproduce.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Head | `gh pr view 10 --json headRefOid` | `5989f8132c540607b08768301cb9001e63608c86` |
| Authorship | `git log --format='%h %an' origin/main..HEAD` | Cursor `b4ff2af`; Claude `970d21a`, `57dd887`, `d37b08b`, `5989f81`. No Codex commit, so no cold read is owed |
| Install | `pnpm install --frozen-lockfile` | Exit 0 on both Node versions |
| Verify | `pnpm verify` (v24.22.2 and v26.13.0) | Exit 0 on both: core 1 passed (1 file), tooling 120 passed (8 files), all eight `verify:* ok`, 0 status lines afterwards |
| Determinism | The skill's command | Exit 0, tree `fixtures`, 0 status lines |
| Zero network | `verify:network` inside `pnpm verify` | ok on both |
| AC2, normal | PR #8's loop, fresh clone, cold install, v24.22.2 | `0 0 0` in 3 rounds, 9 runs of 120 passed, 0 leftover lines |
| AC2, broken glob | Same, core include set to `**/index.test.ts` | `1 1 1` in 3 rounds, 9 runs of 119 passed and 1 failed (honesty discovery only); status shows only the config edit |
| Mutations | Codex's `mutations.py`, unedited | Control 17 passed; 5 earlier analyzers each 16 passed, 1 failed; own 43 of 43 killed; builder 19 of 19 killed; `P25-exportnames-any` 16 passed, 1 failed on the whole file |
| Probes | Codex's `probes.py`, 54 cases, plus 39 of mine | Every Pass 2 row reproduces |
| Timeout controls | Codex's `timeouts.py`, 13 forms | 7 pass, 5 flagged and time out, `fn, { timeout: T }` exits 1 at collection |
| Live tree | `inspectTools(".")` | `missingTimeouts` `[]`, `forbiddenChildProcessImports` `[]`, `nestedTimeoutMs` 180000 |
| Dependencies | `git diff --name-only origin/main...HEAD -- package.json pnpm-lock.yaml 'packages/*/package.json' \| wc -l` | `0` |
| Honesty tests | `git diff origin/main...HEAD -- '*.honesty.test.ts' \| wc -l` | `0` |
| Tripwire | `node tools/tripwire/cli.mjs` | Exit 0 |
| Public scan | Codex's `public-scan.mjs --draft`, over repo, PR metadata and my comment | 0 hits and no error in each class; generated address gives 1 hit |
| Pass M | N/A | No engine or golden fixtures |
| UI matrix | N/A | No UI |

**The one departure from the commands as written:** AC2 logs went to the scratchpad instead of `/tmp/keel-ac2-logs`. The loop is otherwise unchanged.

**Not re-run, and why:**
- **Private-list check:** not verified by this seat. Beni runs it before merging, because it has not covered the PM's refreshed PR body or my comment.
- **Pass 1's mutant totals (vendor's claim: "11 of 18", "50 of 50", and "ten mutants" in `5989f81`'s message):** no edits were published. Codex's 43 cover the same clauses.
- **Builder's working-tree restores:** history, not re-derivable.
- **Linux, locally:** the Ubuntu cells in run 41329632281 are green. Mutants, probes and AC2 ran on v24.22.2 only.
- **Demo mode and alert replay:** N/A, no app or alerts exist.

## Estimates and model output

None.

## Risks and accepted costs

- The analyzer is a hand-written lexer that checks whether spawning tests declare a timeout. A future test written through one of the silent routes would run with Vitest's default timeout and no analyzer complaint. No live test does this today, so the cost is a possible flaky timeout in tooling tests, not a wrong value shown to a reader.
- Five review seats in a row found new routes, and this seat found six more. Beni has ruled that S00.2 closes anyway, so more routes should be expected.
- The analyzer's conservative grammar also rejects valid forms: some modifiers, shadowed identifiers, type imports, object keys named `import`, and JSX/TSX. A future author may hit these and get an unhelpful message.
- Open by ruling: findings 10 and 11, C1 to C4, the regex route, and A1 to A7.

**For the PM to carry to the ideas file** (I did not append them):
- A1 to A6.
- A7's comment wording.
- `bad specifier` for `import { "test" as t } from "vitest"` names no file or rule. It fails closed and also throws on `main`.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes. S00.2 was ruled in ruling 5 |
| Verdict mergeable, every High closed | Yes. Mergeable, and no High was raised by any pass |
| Nothing contested | Yes |
| `verify` green at tip; every number re-run | Yes. Run 41329632281 and local on both Node versions; vendor figures not re-run are labelled |
| No sensitive path, dependency or schema change | Yes. Only `tools/acceptance/spawn-graph.mjs` and its contract test |
| Every commit cold-read by a non-author vendor | Yes. `b4ff2af` by Claude at Pass 1; the four Claude commits by Codex at Pass 2 |
| Gate verdict | **would merge** |
| Beni's decision (filled after) | merged by Beni 2026-11-01 at 13:47 (America/New_York) as squash commit `44fa3ae42afb3dc0d0e288448a4f0d8e1484d75a` on base `f0ad018`, reviewed head `5989f81` (`gh pr view 10 --json state,mergedAt,mergeCommit`). This matches the gate's "would merge" |

## Questions for Beni

1. Add A1 to A6 to the residual-risk sentence before merging? (yes/no)

Beni's ruling says a silent route is named there, so I recommend yes. The PM makes the edit, the head does not move, and the handoff block below stays valid. Suggested wording: after "computed members (including `vi["importActual"]`)", add "optional calls or escaped member names"; after "symlink paths", add "dot-segment paths, query suffixes, package `imports` maps".

## Handoff block

`origin/main` is still `f0ad018`, so the squash tree should equal the reviewed head's tree. If another PR lands first, that one tree check fails as expected, and the `verify` runs decide instead.

Before running this, run your private-list check over the PR body (after any refresh), the squash message below and my comment.

PM's note: the block gave Cursor's address in full. The PM replaced it on that one line, because this records branch does not carry `tools/tripwire/vendors.txt` yet.

````bash
gh pr ready 10 --repo BeniCheni/keel

gh pr merge 10 --repo BeniCheni/keel --squash \
  --match-head-commit 5989f8132c540607b08768301cb9001e63608c86 \
  --subject "feat(s00.2): fail closed when a vitest test is not a named call (#10)" --body-file - <<'EOF'
S00.2 makes the spawn analyzer fail closed on the Vitest registration forms listed in the PR: a namespace or default import, a re-export, the loader forms it names, import.meta.vitest, a direct path into the installed package, a test local used other than as a call or accepted chain, and a spread of a registration's arguments. It also reads imports after a semicolon-free statement and scans .mts, .cts, .jsx and .tsx. A lexer cannot give complete coverage; the PR body's residual-risk sentence names the routes that remain, and no live test is known to use them.

Reviewed head: 5989f8132c540607b08768301cb9001e63608c86. Pass 1 Claude Code (issuecomment-6561199919), Pass 2 Codex (issuecomment-6561656921), Pass 2.5 Claude (issuecomment-6562088749).

Co-authored-by: Cursor <the address listed in tools/tripwire/vendors.txt>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
EOF

git fetch origin && git switch main && git pull --ff-only
test "$(git rev-parse origin/main)" = "$(gh pr view 10 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" && echo "origin/main equals the recorded merge commit"
test "$(git rev-parse 'origin/main^{tree}')" = 8461baf97979a3622dc2989895d01b236a963f08 && echo "squash tree equals the reviewed head's tree"
export KEEL_DATA_DIR="$(mktemp -d)"
PATH="$HOME/.nvm/versions/node/v24.22.2/bin:$PATH" sh -c 'node --version && pnpm install --frozen-lockfile && pnpm verify'
PATH="$HOME/.nvm/versions/node/v26.13.0/bin:$PATH" sh -c 'node --version && pnpm install --frozen-lockfile && pnpm verify'
node tools/tripwire/cli.mjs && echo "tripwire clean on the squash commit"
# Demo mode: N/A, no app exists yet. verify:network inside pnpm verify is the zero-network check.
````

After merging: fill in the "Beni's decision" row. The PM records this brief and carries the ideas-file entries. I wrote nothing to the repo, pushed nothing and merged nothing.

## Beni's ruling (added by the PM)

Beni ruled on 2026-11-01 (America/New_York), in the Pass 2.5 session, in the word "Yes": A1 to A6 are added to the residual-risk sentence before merging. The brief said the PM would make the edit. The Pass 2.5 session made it at 13:36 EST, said so, and pointed Beni to the PR's edit history (`gh api graphql` on `userContentEdits` shows the edit at 18:36:42 UTC). The PM has no objection: Pass 2.5 is a PM seat, and the edit changed only the residual-risk line and the section's opening line (`diff` of the body before and after, apart from one trailing blank line).

## PM's checks on this brief (added by the PM)

Each from a run in the PM's session at `5989f81`, with a generated fixture root, `inspectTools(root)` from the head analyzer, and the same files under the repo's Vitest.

| Form | Analyzer at the head | Vitest |
| --- | --- | --- |
| A1 `vi.importActual?.("vitest")` | silent | exit 0, 1 passed, 1 spawn |
| A2 `vi.importActual("vitest")` | silent | exit 0, 1 passed, 1 spawn |
| A3 `import.meta.vitest` | silent | exit 0, 1 passed, 1 spawn |
| A4 `node_modules/./vitest` path | silent | exit 0, 1 passed, 1 spawn |
| A5 `import("vitest?x")` | silent | exit 0, 1 passed, 1 spawn |
| A6 `import("#v")` with an `imports` map | silent | exit 0, 1 passed, 1 spawn |

**Low, from this seat: the PR comment misprints A2 and A3.** Its table shows `vi.importActual("vitest")` and `import.meta.vitest`, without the escapes this brief has (`gh api repos/BeniCheni/keel/issues/comments/6562088749 --jq .body`). As printed, both forms throw `unrecognised vitest test registration` at the head, so a reader of the comment alone would think those two fixes do not work. This brief and the PR body's residual-risk sentence have the forms right. The comment stays as posted. At 13:46 EST the PM added a "Pass 2.5 comment" line to the PR body's corrections section, with `gh pr edit 10 --body-file`. `scanRepo` gated it: no error and 0 hits, and a generated address gives 1 email hit. Cursor's first 76 lines stay byte-identical.

Handoff block: the tree it checks is the head's (`git rev-parse '5989f81^{tree}'` prints `8461baf97979a3622dc2989895d01b236a963f08`), `origin/main` is still `f0ad018`, and all five checks on the head are `SUCCESS` (`gh pr view 10 --json statusCheckRollup`). The first column of `tools/tripwire/vendors.txt` equals the author address of `b4ff2af` (`test "$(cut -f1 tools/tripwire/vendors.txt)" = "$(git log -1 --format=%ae b4ff2af)"` exits 0).

Not re-run here: the rest of the numbers above, which are the Pass 2.5 session's. The owner's private-list check has not covered the last two edits to the PR body or the Pass 2.5 comment. Beni runs it before merging.

## Post-merge checks (added by the PM)

Run by the PM on 2026-11-01, in a fresh clone.

| Check | Command | Result |
| --- | --- | --- |
| `origin/main` equals the recorded squash | `gh pr view 10 --json mergeCommit`; `git rev-parse origin/main` | both `44fa3ae42afb3dc0d0e288448a4f0d8e1484d75a` |
| Squash tree, the base not having moved | `git rev-parse 'origin/main^{tree}'` | `8461baf97979a3622dc2989895d01b236a963f08`, the reviewed head's tree; the squash's parent is `f0ad018` (`git log -1 --format=%p 44fa3ae`) |
| `verify` on the squash commit | `gh run list --commit 44fa3ae42afb3dc0d0e288448a4f0d8e1484d75a --json databaseId,event,conclusion` | 41338436220, `push`, `success` |
| Trailers, none empty as on PR #3's squash | `git log -1 --format=%b 44fa3ae \| grep -c -E '^Co-authored-by: [A-Za-z]+ <[^>]+@[^>]+>$'` | `3` |

Private-list check: Beni reported the result on 2026-11-01, in the words "Merged, 0 hits", when the PM asked whether the check had printed 0 hits and the PR had merged. No Claude seat runs this check, so the result is his report and the PM has not re-run it. The command the PM gave him covers the PR's title, body, comments and reviews, not the squash message. Codex's cold read of the records PR covers that.

## Carried to the ideas file (added by the PM)

For the next ordinary docs PR, with the entries in `docs/reviews/pr-10-pass-1.5.md` and `docs/reviews/pr-8-pass-2.5.md`: A1 to A6, the overclaiming comment above `assertVitestImports` (A7), and the `bad specifier` message.
