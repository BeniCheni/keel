# Pass 0 brief: PR #8 (S00.1 tooling hardening)

Written by the PM on 2026-11-01 (America/New_York), from a fresh read of the PR at `af037d47caacedeaef610ef1a97ac8a280a4f2b7`. This brief lives on branch `docs/pr-7-records`, not on the PR branch, so that no Claude-authored commit enters PR #8 and the Pass 1 seat stays Claude Code.

## This brief is a rebuild

The PM session of 2026-10-31 wrote a Pass 0 brief for this PR and recorded it in its handoff as `docs/reviews/pr-8-pass-0.md` on `docs/pr-7-records`. It never reached GitHub: no ref on `origin` holds that path (`git fetch origin && git log --all --format='%h %D' -- docs/reviews/pr-8-pass-0.md` printed nothing in a fresh clone on 2026-11-01). Its text is lost. What survives of it is the three leads the handoff names: the undisclosed `fileParallelism: false` in `tools/vitest.config.mjs`, the 943-line `tools/acceptance/spawn-graph.mjs` (evasion, and whether it fails closed), and three claims below the mutation floor. They are items 1, 3 and 6 below.

A different PM session rebuilt this brief on 2026-11-01 at 00:10 (America/New_York), at Beni's request. When it was written, PR #8 had no comment and no review (`gh api repos/BeniCheni/keel/issues/8/comments --jq length` printed `0`; `gh api repos/BeniCheni/keel/pulls/8/reviews --jq length` printed `0`) and its head was still `af037d4` (`gh pr view 8 --json headRefOid`, run at 00:10). Nothing from Pass 1 informed it, and this session has not opened the Pass 1 clone.

While this brief was being checked for commit, the PR's head moved to `8becc18` at 2026-11-01 00:12:46 (America/New_York) (`gh pr view 8 --json headRefOid,updatedAt`), still with no comment or review. This session has not read that commit's message, author or diff, and the brief was not changed in response to it, except for this paragraph. It covers `af037d4` only; the Pass 1.5 brief extends the authorship record with every later commit.

The Pass 1 session started before this brief existed on GitHub, so it could not have read it from the records branch. Its review is cold and unsteered by this brief. Pass 1.5 adjudicates Pass 1's findings against the sealed appendix below, and treats any item here that Pass 1 did not cover as a gap to route to Pass 2, not as a Pass 1 omission.

## Seat for Pass 1

Claude Code, fresh session, fresh clone. Model Fable 5.1 Extra (sensitive-path PR); fallback Opus 5.5 High, declared in the PR comment if used. Synthetic data only.

## Scope

- Spec: `docs/specs/s00.1-tooling-hardening.md`; design brief: none.
- Sensitive paths touched: `tools/tripwire/**` (`scan.mjs` and the new `vendors.txt`) and `packages/core/**` (its `package.json` only) (`gh pr view 8 --json files --jq '.files[].path'`).
- Release: no.
- New dependencies: none new to the lockfile's package set. `vitest` 5.0.5 is added to `packages/core`'s devDependencies at the version the root already pins, as the spec's Dependencies section requires (`git diff origin/main...af037d4 -- packages/core/package.json pnpm-lock.yaml`).
- Bootstrap path: no. Install, `verify`, mutations and the dynamic pass all apply. Pass M does not apply (no engine, no golden fixtures).
- Diff: 15 files, 1540 insertions, 116 deletions (`git diff --shortstat origin/main...af037d4`).
- The PR was opened as a draft and marked ready for review by Beni at 2026-10-31 23:13 (America/New_York) (`gh api repos/BeniCheni/keel/issues/8/timeline --jq '.[] | select(.event=="ready_for_review") | .created_at'`).

## Authorship record

From `git log --format='%h %an' origin/main..af037d4`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `af037d4` harden tooling timeouts, honesty discovery, and vendor address | Cursor | Claude Code, Pass 1 |

Any fix commit Pass 1 pushes is Claude-authored and gets its cold read from Codex at Pass 2. Any Codex fix commit gets its cold read from the fresh Claude session at Pass 2.5. The commit adding this brief is on `docs/pr-7-records` and gets the records-PR cold read when that PR opens.

## Fast-track

Not allowed: sensitive paths are touched.

## What to check, beyond the skill's standing checks

1. **The undisclosed `fileParallelism: false`** (`tools/vitest.config.mjs:12`, comment: one file at a time, so a test can compare git status after its own cleanup). It appears in neither the PR body's claims nor its "Deliberately not done" list. It is not a timeout, so it does not break Scope 1's "No global timeout change" by the letter, but it is a global scheduling change to the tooling suite. Remove it in your clone and run `pnpm test:tooling` and the AC4 self-test: what fails, and is that failure a cross-file collision Scope 2's per-process names should already have prevented? Does serial file order within each run reduce the load that AC2 is meant to prove the suite survives?
2. **AC4 as specified against AC4 as claimed.** The spec says that after the self-test `git status --porcelain --untracked-files=all -- packages tools` prints nothing. The builder's claim says the two children leave that status "unchanged". Which does the test assert? If it compares a before snapshot with an after snapshot, how does it hold under AC2's three concurrent runs, when another process's temporary file can be present at either snapshot? Are the two children held at a real barrier, so their writes and runs provably overlap, or do they merely start close together? The spec rules out a same-process name check alone.
3. **`tools/acceptance/spawn-graph.mjs` (943 lines, a hand-written lexer and parser, no new dependency).** Does it fail closed? For each construct it does not model (`skipStatement` and the statement readers), find whether it throws, which turns the self-test red, or skips, which treats the module as non-spawning. Then probe evasions with generated test files under `tools/**/test/`, removed afterwards: `child_process` without the `node:` prefix (line 5 keys on the prefixed specifier); dynamic `import()`; `createRequire`; a namespace import (`import * as h`) calling `h.run()`; a default import; aliasing (`const r = run; r()`); passing a spawning function as a callback; `.call` and `.apply`; `export *`; `.js`, `.cjs` and `.ts` files under `tools/`; `node:cluster`'s `fork`; spawning from `beforeAll`, `beforeEach` or module top level rather than inside `it` or `test`; `it.each`, `test.concurrent` and nested `describe`. Any construct that lets a real spawning test escape the timeout check is a test that cannot fail for that path. The spec's seven AC1 fixtures are the floor, not the whole set.
4. **Where the timeout comes from.** Does the check accept only `NESTED_RUN_TIMEOUT_MS` imported from `helpers.mjs`, or any identifier of that name, such as a local constant set to 1000? Does Vitest actually apply the value, meaning it sits in the argument position Vitest reads? The builder reports 180000 from `inspectTools(".").nestedTimeoutMs`: how is that read, and what happens if the constant becomes an expression? Test both sides of the spec's floor: 60000 passes and 59999 fails.
5. **AC1's fixtures.** Are all seven present (a spawning leaf, a wrapper importing it, its re-export, a wrapper around a `helpers.mjs` spawning helper, that helper's re-export, a second-level wrapper, and a write-only wrapper)? Does each of the first six without the timeout fail the self-test while the write-only one passes? Do the fixtures go through the same `build()` path as the real tree?
6. **The mutation floor.** The spec requires at least three killed mutants per claim. Mapping the PR body's 14 mutants (appendix row 11) onto its eight claims (`gh pr view 8 --json body --jq .body | awk '/^## Claims/{f=1;next} /^`NESTED/{f=0} f' | grep -c '^|'` prints 10, less the header and separator), this rebuild finds two tested claims with one mutant each: claim 3, overlapping temp files (only "use a fixed temp-file name"), and claim 6, `@keel/core` declares Vitest (only "give it a runtime dependency"; no mutant changes the version away from the root's). Claim 5, the clean repo scan, has none, though it is a run rather than a test. The lost original counted three claims below the floor; re-derive the count yourself. All 13 mutants the spec names are present. Check that each dies for the right reason: three share the test "the spawn graph follows wrappers and re-exports and leaves a write-only wrapper out", and "import `node:child_process` in a test file" is attributed to the timeout test, whose name says nothing about imports. The vendor sub-claims "different case", "longer address containing the listed one" and "missing `vendors.txt` exits 2" have no mutant listed.
7. **The vendor exemption** (`tools/tripwire/scan.mjs`, 43 insertions and 7 deletions). It must be exact, case-insensitive, and limited to the email class. Inside `vendors.txt`, only addresses on valid lines are exempt: does a listed address on a malformed line hit as email as well as `vendors`? How do an empty file and a whitespace-only line behave? Is the `noreply` exemption byte-for-byte unchanged? Does the shipped entry equal Cursor's commit address on `af037d4` and on `8b9dfee`? Compare without printing it, for example `test "$(cut -f1 tools/tripwire/vendors.txt)" = "$(git log -1 --format=%ae af037d4)" && echo equal`, and check that the reason column reads "Cursor agent commit address". Never print the address in a comment, commit or log.
8. **Scope 2 coverage.** Is every file a tooling test writes inside the repo named with the process ID and a random part, created only for its test, and removed in `finally`? That includes the network test's `zz-guard.test.mjs` and the temporary honesty files under `packages/core/src`. How does "tooling tests do not embed fixed repo temp names" detect a fixed name, and can a name built at run time from constants evade it?
9. **AC3.** The test must read the temporary file's path from `testResults` and the counts from the JSON report, not from printed text. Could another honesty file in `@keel/core` satisfy the counts? Is `--outputFile` in a temp directory outside the repo? Does dropping the core include glob, or making the failing temporary test pass, fail the test for the right reason?
10. **Assertions in the other test files.** Six test files change by a few lines each: `copy-boundary`, `determinism`, `namespace-probe`, `needs-check`, `network` and `verify-runner`. Confirm every hunk only adds the timeout or a per-process name, and no assertion is weakened (`git diff origin/main...af037d4 -- tools/acceptance/test/`). `tripwire.test.mjs` (160 insertions, 37 deletions) and `helpers.mjs` (37 insertions, 1 deletion) need the same check.
11. **AC2 re-run.** The spec records AC2 in the PR body and keeps it out of `verify`. Re-run the builder's loop yourself on Node 24 from a fresh clone. Then run it once more with `fileParallelism: false` removed, to tell whether that setting is what carries AC2.
12. **`packages/core/package.json`.** `vitest` must equal the root's version, `dependencies` must be absent, and the `test` script must be unchanged. The lockfile must change only that importer.

## Sealed appendix: builder claims to verify independently

These are claims, not facts. Re-derive each one; report any that do not reproduce. Run counts come from your own session, never from this table. The claims are taken from the PR body at `af037d4` (`gh pr view 8 --json body --jq .body`), which GitHub last updated at 2026-11-01T03:13:25Z (`gh pr view 8 --json updatedAt`).

| # | Claim (as the builder stated it) | Command the builder gave |
| --- | --- | --- |
| 1 | AC1: spawning entry points come from the import graph; wrappers and re-exports are included, a wrapper that only calls `write()` is not; every test calling an entry point passes `NESTED_RUN_TIMEOUT_MS`, at least 60000; no test file except `helpers.mjs` imports `node:child_process`. 9 passed; the graph self-test builds its fixtures in a temp directory | `pnpm test:tooling -- test-contract` |
| 2 | AC3: the honesty test reads `testResults`, `numPassedTests` and `numFailedTests` from `--reporter=json --outputFile=<temp>`, and the failing run exits nonzero. 9 passed on Node 24.22.2 | `pnpm -s test:tooling -- test-contract` (`nvm exec 24.22.2`) |
| 3 | AC4: two overlapping child processes write different per-process repo temp names and leave `git status --porcelain --untracked-files=all -- packages tools` unchanged; on a fresh clone that command prints nothing | `pnpm test:tooling -- test-contract` |
| 4 | AC5: a listed vendor address is not an email hit in a tracked file, in a different case, or in a commit message; a one-character change, a different domain, and a longer address containing the listed one are email hits; another class on the same line still hits; a malformed `vendors.txt` line is a `vendors` hit; an unlisted address in a reason column is an email hit; a missing `vendors.txt` exits 2. 44 passed during `pnpm verify`, 7 of them vendor cases | `pnpm test:tooling -- tripwire` |
| 5 | AC6: the repo scans clean with the shipped list: exit 0, no hits | `pnpm verify:tripwire` |
| 6 | AC7: `@keel/core` declares `vitest` at the root's version and `dependencies` is absent or empty; passed inside the 9 | `pnpm test:tooling -- test-contract` |
| 7 | AC8: the gate is green on Node 24 and Node 26: `verify ok` on both, including typecheck, tests, tooling (112 passed), tripwire, network, determinism, copy and boundaries | `pnpm install --frozen-lockfile && pnpm verify` |
| 8 | AC8: the `verify` check on the PR is green: the four `cell` jobs and `verify` pass, run `41268001530` | `gh pr checks 8` |
| 9 | `NESTED_RUN_TIMEOUT_MS` parsed from `tools/` is 180000 | `node --input-type=module -e 'import { inspectTools } from "./tools/acceptance/spawn-graph.mjs"; console.log(inspectTools(".").nestedTimeoutMs)'` |
| 10 | The tooling suite during `verify` is 8 files and 112 tests | `pnpm test:tooling` |
| 11 | Each of the 14 mutants in the PR body's mutant table was applied, killed by the test named beside it, and restored; none is in the commit (`gh pr view 8 --json body --jq .body \| awk '/^## Mutants/{f=1;next} /^## Resolved/{f=0} f' \| grep -c '^\|'` prints 16, less the header and separator) | the PR body's mutant table |
| 12 | CI run `41268001530` resolved v24.22.1 and v26.13.0 on both ubuntu and macos cells; locally `nvm exec` resolved v24.22.2 and v26.13.0 | `gh run view 41268001530 --log` (step "Node version"); `nvm exec 24.22.2 node --version`; `nvm exec 26.13.0 node --version` |
| 13 | The lockfile adds `vitest` `5.0.5(vite@8.3.5)` under the `packages/core` importer's `devDependencies`; the root importer already had that version; no new package was added; `packages/core/package.json` has no `dependencies` key | `git diff origin/main -- pnpm-lock.yaml` |
| 14 | AC2: in a fresh clone at `af037d4` on Node v24.22.2, after `pnpm install --frozen-lockfile`, three rounds of three concurrent `pnpm test:tooling` runs all exited 0 (`round 1: 0 0 0`, `round 2: 0 0 0`, `round 3: 0 0 0`), and afterwards `git status --porcelain --untracked-files=all -- packages tools \| wc -l` printed `0` | the shell loop in the PR body's AC2 section |
| 15 | The PR changes none of `docs/specs/`, `docs/adr/`, `docs/reviews/`, `AGENTS.md`, `CLAUDE.md`, `docs/README.md` or `CHANGELOG.md`, and no product code | the PR body's "Deliberately not done" list; check with `git diff --name-only origin/main...af037d4` |
