# Executive brief: PR #8, Pass 2.5, 2026-11-01 America/New_York

Recorded by the PM on 2026-11-01 (America/New_York). The Pass 2.5 session delivered this brief in chat, and its PR comment ([issuecomment-6560062425](https://github.com/BeniCheni/keel/pull/8#issuecomment-6560062425)) says the PM records it here. "This seat" and "here" below mean that session, which described the brief this way: "Every number in it comes from a command run in this session in a fresh clone at `5fcd521`; anything taken from another seat is labelled as that seat's claim." The text is unchanged except for three things: the "Beni's decision" row is filled, one trailer in the handoff block is replaced and marked there, and the PM added every section after the handoff block.

Seat: Claude, fresh session, Fable 5.1 High. Fallback not used. Review clone, AC2 clone and mutant clone all under this session's scratchpad, with `KEEL_DATA_DIR` a fresh `mktemp -d` on every command. No user data folder and nothing under `~/.config/keel/` was opened.

## Decision

Shadow mode: the gate says **would escalate**, because three sensitive paths are touched (`tools/tripwire/scan.mjs`, `tools/tripwire/vendors.txt`, `packages/core/package.json`), so the delegated gate never covers this PR and Beni merges, as PR #3's brief recorded. Every other gate clause holds. Verdict on the review itself: mergeable, no High, nothing contested, with two open Mediums from this seat that no shipped test triggers. Beni rules whether they are fixed on this PR first or carried to the ideas file.

## What ships

- Tooling tests that spawn a nested run must carry a timeout taken from one exported constant, and the set of spawning entry points is computed from the import graph of `tools/`, never hand-kept. The analyzer now refuses forms it cannot model instead of guessing.
- Honesty-file discovery is proved from Vitest's JSON report, not from printed text, and the self-test turns red under three concurrent runs when the core include glob loses the honesty files.
- Every file a tooling test writes inside the repo is named per process with a random part, and two overlapping suites leave nothing behind.
- The tripwire exempts one vendor commit address from the email class only, exactly and case-insensitively, and validates its list before scanning.
- `@keel/core` declares Vitest at the root's version and still has no runtime dependency. The PR still declines to claim anything about product code, workflow pinning or allowlist scope.

## What the passes found

- Pass 1 (Claude Code, `af037d4`): seven Mediums. 17 of 32 evasion forms escaped the spawn graph; an undisclosed `fileParallelism: false` masked a race in the overlap self-test; a vanishing temp file threw ENOENT; eight surviving mutants across AC1, AC4, AC5 and the printed-text honesty mutant. Six closed by fix commits `8becc18`, `3f8aaf6`, `4f868df`; the seventh went to Beni.
- Pass 2 (Codex, first comment at `c488cc7`): C1 to C3, three more spawning escapes; C4 disproved the PM's rationale for finding 7; stopped on the vendor disagreement. Completing comment at `40328c2`: C5 (a vanished imported module erased a graph edge) and C6 (partial or misplaced timeout options accepted), both closed with C1 to C3 in `5fcd521`; C7, the stale PR body section, closed by the PM's refresh. 27 mutants, 27 killed. Pass M not applicable.
- Pass 2.5 corroboration: every Pass 1 and Pass 2 number re-derived here matches. The 1.5 brief's dispositions and rulings hold. The authorship record matches `git log --format='%h %an' origin/main..HEAD`: one Codex commit, five Claude, one Cursor. The PM's refreshed "Corrections after Pass 1" section holds line by line against the head.
- Cold read of `5fcd521` (Codex): sound. Each of the five regressions fails for the reason it names, shown by Codex's seven fix-removal mutants and by my own mutant of the computed-access branch, which fails with `expected [Function] to throw an error` on exactly the two forms it should catch. The vanished-file skip and the new missing-import throw do not conflict in the live tree: nothing imports any file a tooling test writes under `tools/`.
- New from this seat (details in the PR comment):
  - Finding 1, Medium, open: the analyzer recognises a test only through a named import of `test` or `it` from `vitest`. A namespace import, a default import, `test.extend`, a dynamic import of `vitest`, or a const alias of `test` registers tests it never checks, so a spawning test written that way needs no timeout. Codex's residual-risk table lists the spawning side only, not this side. All eight shipped test files use the plain named import, so no live test escapes. Medium by the precedent of Pass 1 finding 1 and C1 to C3.
  - Finding 2, Medium, open: the clause in the namespace guard that rejects a call to a property the parser did not record as an export has no killing test. Replacing it with `true` passes the whole contract file. It is load-bearing for export forms the parser skips. One fixture line kills it.
  - Findings 3 to 5, Low: the tools-only scope of the missing-import throw is untested (the mutant only makes the analyzer stricter); the new rules reject reasonable forms such as `{ timeout: NESTED_RUN_TIMEOUT_MS, retry: 1 }` or `toBeInstanceOf(Function)`, which Codex's table does disclose in general terms; `node:worker_threads` is a path-based loading route like `node:cluster` and is not named.
- Contested: nothing. Ruling 4 closed the only disagreement before this pass.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Head | `gh pr view 8 --json headRefOid` vs `git rev-parse HEAD` | both `5fcd521defec04b1d0613d219fb2c262fffa602b`, unchanged at posting |
| Install | `pnpm install --frozen-lockfile` | exit 0 on v24.22.2, v26.13.0, v24.15.0 |
| Verify | `pnpm verify` | exit 0 on all three: core 1/1 (1 file), tooling 119/119 (8 files), eight `verify:* ok` lines |
| Diff | `git diff --shortstat origin/main...HEAD` | 15 files, 2040 insertions, 118 deletions; no `*.honesty.test.ts` touched; `tools/vitest.config.mjs` equals `origin/main`; `git diff --check` clean |
| Determinism | the skill's `pnpm fixtures:regen && sh -c '… git status --porcelain --untracked-files=all -- <tree> …'` | exit 0, tree `fixtures` |
| Zero network | inside `pnpm verify` (`verify:network ok`) | green on all three Node lines |
| AC2 normal | PR body loop, fresh clone, cold install, v24.22.2 | `0 0 0` ×3, 119 passed in each of nine runs, leftover `0` |
| AC2 negative | same, core glob `**/index.test.ts` | `1 1 1` ×3, each run 118 passed / 1 failed in the honesty-discovery test only; status lists only the config edit |
| Codex mutants | `mutations.py` from the completing comment, cold scratch clone at `5fcd521` | 27 applied, 27 killed, same counts and test names as Codex's table |
| My mutants of `5fcd521` | six exact edits, whole `test-contract` file each | 4 killed, 2 survived (findings 2 and 3) |
| Analyzer probes | 15 generated forms through `inspectTools` | A1 to A6 rejected or flagged (fail closed); B1 to B5, B8, B9 pass silently (finding 1, 5, 3); controls behave |
| `nestedTimeoutMs` | the PR body's one-liner | 180000; 26 entry points; `missingTimeouts` and `forbiddenChildProcessImports` empty |
| Privacy | `node tools/tripwire/cli.mjs`; counts-only `scanRepo`; same on my comment in a temp repo with `origin/main` set | exit 0, all classes 0; comment 0 hits, generated-address control 1 email hit |
| Vendors | `test "$(cut -f1 tools/tripwire/vendors.txt)" = "$(git log -1 --format=%ae af037d4)"` | equal; one line; reason "Cursor agent commit address"; `noreply` line unchanged |
| Lockfile | `git diff origin/main...HEAD -- pnpm-lock.yaml` | 6 lines, `packages/core` importer only; root devDependencies still `typescript`, `vitest` |
| CI | `gh run view 41318099897 --json headSha,conclusion,event`; the five earlier run IDs | `5fcd521` success `pull_request`; each earlier run success at its SHA; `gh pr checks 8` five passes |
| Pass M, UI matrix, demo mode | | N/A: no engine, UI or app |

Not re-run, and why: the owner's private-list check (no Claude seat runs it; it has not yet covered the PM's refreshed body text or my comment); Codex's runtime probes with their `spawns: 1` counts (analyzer side re-run only); Pass 1's 32-form harness and mutants at `af037d4` and Codex's AC2 control at `af037d4` (historical heads; the head is covered above); the Linux namespace probe locally (CI ran it on both Ubuntu cells).

## Estimates and model output

None. This PR has no model output and no figure derived from an assumption.

## Risks and accepted costs

- The spawn analyzer is a lexer over source text. It now fails closed on what it does not model on the spawning side, but the test-registration side still trusts one import shape (finding 1). A future author who writes a test through any other `vitest` binding gets no timeout check and no error. The analyzer's conservative rules also reject some valid forms, which authors will discover as thrown errors naming the rule.
- Two Mediums arrive at the last pass, where no seat may fix without another round: a Codex or Cursor fix commit, a cold read of it, and a PM refresh. Carrying them instead leaves the escape class and the untested guard in the ideas file, with no live test affected today.
- The spec does not state the fail-closed rules `5fcd521` adds (the 1.5 brief records this); the next tooling spec should, and should also state the accepted test-registration and timeout forms.
- The base moved: PR #9 landed as `7b6eddd` with no file in common, so the squash tree differs from the head tree and `verify` must be run on the squash commit.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | yes: non-release slice toward `v0.1.0`; versions unchanged |
| Verdict mergeable, every High closed | yes: no High at any pass; the two open Mediums are this seat's findings 1 and 2, with no live instance |
| Nothing contested | yes: ruling 4 closed the only disagreement before this pass |
| `verify` green at tip; every number re-run | yes on v24.22.2, v26.13.0 and v24.15.0 and in run 41318099897; every number above re-run here except the private-list check |
| No sensitive path, dependency or schema change | **no**: three sensitive paths; no new dependency; no schema |
| Every commit cold-read by a non-author vendor | yes: `af037d4` (Cursor) by Claude Code at Pass 1; `8becc18`, `3f8aaf6`, `4f868df`, `c488cc7`, `40328c2` (Claude) by Codex at Pass 2; `5fcd521` (Codex) by this seat. 1 + 5 + 1 = 7 = `git rev-list --count origin/main..HEAD` |
| Gate verdict | **would escalate** (sensitive paths; the delegated gate never covers this PR). Beni merges |
| Beni's decision (filled after) | merged by Beni 2026-11-01 at 10:39 (America/New_York) as squash commit `f0ad0187925823a21315f9b5c2a1f25d44b07211` on base `7b6eddd`, reviewed head `5fcd521` (`gh pr view 8 --json state,mergedAt,mergeCommit`). This matches the gate's verdict, under which Beni merges. Findings 1 and 2 were still open at the merge; see "Beni's rulings" below |

## Questions for Beni

1. Fix finding 1 on this PR before merging, rather than carry it to the ideas file? (yes/no)
2. Fix finding 2 on this PR before merging? (yes/no)
3. Will you run the private-list check over the refreshed PR body, the squash message and my comment before merging? (yes/no)
4. Do rulings 1 to 4 in `docs/reviews/pr-8-pass-1.5.md` record your decisions as you gave them? (yes/no)

## Handoff block

Trailers are literal text: the three commit authors from `git log --format='%an <%ae>' origin/main..HEAD` in the reviewed clone, which are also the three vendors that reviewed. The squash message may carry Cursor's address because `tools/tripwire/vendors.txt` lands in this squash. If Beni answers yes to question 1 or 2, the fix commit's SHA replaces the pinned SHA below after its cold read.

PM's note: the block gave Cursor's address in full. The PM replaced it on that one line, because this records branch does not carry `tools/tripwire/vendors.txt` yet. `git log -1 --format=%b f0ad018` prints the trailer as it ran.

````bash
gh pr merge 8 --repo BeniCheni/keel --squash \
  --match-head-commit 5fcd521defec04b1d0613d219fb2c262fffa602b \
  --subject "feat(s00.1): tooling hardening (#8)" --body-file - <<'EOF'
S00.1 hardens the S00 gate: spawning tooling tests carry NESTED_RUN_TIMEOUT_MS from the import graph of tools/, with an analyzer that fails closed on forms it does not model; honesty discovery is proved from Vitest's JSON report; tooling temp files are per process; tools/tripwire/vendors.txt exempts one vendor commit address from the email class only; @keel/core declares vitest at the root's version.

Reviewed head: 5fcd521defec04b1d0613d219fb2c262fffa602b. Pass 1 Claude Code (issuecomment-6553379287), Pass 2 Codex (issuecomment-6553631860, issuecomment-6559644651), Pass 2.5 Claude (issuecomment-6560062425).

Co-authored-by: Cursor <the address listed in tools/tripwire/vendors.txt>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
EOF

git fetch origin && git switch main && git pull --ff-only
test "$(git rev-parse origin/main)" = "$(gh pr view 8 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" && echo "origin/main equals the recorded merge commit"
test "$(git merge-tree --write-tree 7b6eddd 5fcd521defec04b1d0613d219fb2c262fffa602b)" = "$(git rev-parse 'origin/main^{tree}')" && echo "squash tree equals merge-tree of base and reviewed head"
export KEEL_DATA_DIR="$(mktemp -d)"
PATH="$HOME/.nvm/versions/node/v24.22.2/bin:$PATH" sh -c 'node --version && pnpm install --frozen-lockfile && pnpm verify'
PATH="$HOME/.nvm/versions/node/v26.13.0/bin:$PATH" sh -c 'node --version && pnpm install --frozen-lockfile && pnpm verify'
node tools/tripwire/cli.mjs && echo "tripwire clean on the squash commit, including its message"
# Demo mode: N/A, no app exists yet. verify:network inside pnpm verify is the zero-network check.
````

After merging: fill the "Beni's decision" row, record the gate verdict against the decision, and the PM carries the ideas-file entries (finding 1's registration forms, finding 2 if carried, `node:worker_threads`, the accepted timeout and test forms for the next tooling spec).

## Beni's rulings (added by the PM)

These are numbered separately from rulings 1 to 4 in `docs/reviews/pr-8-pass-1.5.md`. Beni ruled on 2026-11-01 (America/New_York), in the Pass 2.5 session, in the words "1. Yes. 2. Yes. 3. Yes. 4. Yes.":

1. Finding 1 is fixed on PR #8 before merging.
2. Finding 2 is fixed on PR #8 before merging.
3. Beni runs the private-list check over the refreshed PR body, the squash message and the Pass 2.5 comment before merging.
4. Rulings 1 to 4 in the 1.5 brief record his decisions as he gave them.

**What happened next.** Beni then ran the handoff block. PR #8 merged at 10:39, four minutes after the Pass 2.5 comment at 10:35 (`gh pr view 8 --json mergedAt`; `gh api repos/BeniCheni/keel/issues/comments/6560062425 --jq .created_at`), before any fix commit existed. So rulings 1 and 2 were not carried out on PR #8, and findings 1 and 2 were open at the merge. Both are Medium and no shipped test triggers them, so the verdict stood. Beni named Cursor as the fix seat, and the fix moved to a new slice cut from the merged `main`: S00.2, PR #10.

**Ruling 3.** Beni reported the result on 2026-11-01, in the words "Yes, 0 hits", when the PM asked whether the check had printed 0 hits. The PM had given him a counts-only command over the PR's title and body, the squash message read from the merged commit, and every comment and review. His words do not say which run they report or when it ran, so this record does not claim it came before the merge. No Claude seat runs this check, so the result is Beni's report and the PM has not re-run it.

**Ruling 5.** Beni ruled on 2026-11-01, in the words "Record is enough": S00.2 needs no spec PR. Findings 1 and 2 of the Pass 2.5 comment and the build brief below are its build authority. The session proposed the number S00.2 and the branch `s00.2/test-registration-guard`, and Beni left both as proposed. Builder Cursor, Grok 4.7 High, because neither file it touches is a sensitive path. Pass 1 Claude Code, Pass 2 Codex, Pass 2.5 the PM in a fresh session. Fast-track barred. `docs/README.md` allows a slice to skip the spec rung, and its row for S00.2 records that.

## Post-merge checks (added by the PM)

Run by the PM on 2026-11-01, in a fresh clone holding both `5fcd521` and `f0ad018`.

| Check | Command | Result |
| --- | --- | --- |
| `origin/main` equals the recorded squash | `gh pr view 8 --json mergeCommit`; `git rev-parse origin/main` | both `f0ad0187925823a21315f9b5c2a1f25d44b07211` |
| Squash tree, the base having moved | `git merge-tree --write-tree 7b6eddd 5fcd521`, compared with `git rev-parse 'origin/main^{tree}'` | equal |
| `verify` on the squash commit | `gh run view 41322322970 --json headSha,conclusion,event` | `f0ad018`, `success`, `push` |
| Trailers, none empty as on PR #3's squash | `git log -1 --format=%b f0ad018 \| grep -c -E '^Co-authored-by: [A-Za-z]+ <[^>]+@[^>]+>$'` | `3` |

The Pass 2.5 session's claim, not re-run here: `pnpm install --frozen-lockfile && pnpm verify` exits 0 on the squash commit on Node v24.22.2, and `node tools/tripwire/cli.mjs` exits 0 there.

## S00.2 build brief (added by the PM)

The Pass 2.5 session wrote this after the merge, and Beni handed it to Cursor. It replaces the session's earlier brief for a fix on PR #8, which was never used.

```
You are the builder for keel slice S00.2, test-registration guard for the spawn analyzer. Read AGENTS.md first; it owns every rule. Work in a fresh clone of BeniCheni/keel on branch s00.2/test-registration-guard cut from origin/main at f0ad0187925823a21315f9b5c2a1f25d44b07211 (stop and report if origin/main differs). Export KEEL_DATA_DIR="$(mktemp -d)" for every command. Never open the user's data folder or anything under ~/.config/keel/.
Authority: Beni ruled on 2026-11-01 that Pass 2.5 findings 1 and 2 on PR #8 (issuecomment-6560062425) are fixed in a follow-up slice. Touch only tools/acceptance/spawn-graph.mjs and tools/acceptance/test/test-contract.test.mjs. No new dependency, no other file, no product code, nothing under docs/.
Finding 1. The analyzer recognises a test only through a named import of test or it from vitest. Make every other way of reaching Vitest fail closed with an error that names the rule, in the style of assertNamespaceUses: a namespace or default import of vitest, a dynamic import or require of vitest, and any use of a test local other than a call or a chain such as test.only, test.each(table)(...), test.concurrent or test.skipIf(cond)(...) that ends in a call, so test.extend({}) and const t = test both throw. Keep working: plain named imports, aliases in the import clause such as import { test as it2 }, it, test.each, test.only, test.concurrent, and tests inside describe blocks.
Finding 2. In assertNamespaceUses, the clause binding.target.exportNames.has(prop.value) has no killing test; the mutant that replaces it with true passes the whole contract file. Add a fixture form that calls a property the parser did not record as an export, for example h.nope(), and expect the unrecognised-namespace error.
Regressions. One new test for finding 1 with the five escaping forms from the Pass 2.5 comment (import * as v from "vitest" with v.test, a default import of vitest, test.extend, const { test } = await import("vitest"), const t = test), each expected to throw, plus the working forms above expected to report exactly the right missingTimeouts. Add the finding 2 form to "unrecognised uses of spawning namespaces fail closed". Each regression fails against the main analyzer (swap in git show origin/main:tools/acceptance/spawn-graph.mjs, run, restore) and passes at your commit. The live tree must still report missingTimeouts [], forbiddenChildProcessImports [] and nestedTimeoutMs 180000 from inspectTools(".").
Mutation floor: at least three killed mutants per finding, each applied by hand in the working tree, killed by a named test, and restored before commit; the P25-exportnames-any mutant from the Pass 2.5 comment must die. List each in the PR body with the test that kills it.
Commit as your agent identity per AGENTS.md hard rule 10 (git -c user.name=... -c user.email=... commit), the address tools/tripwire/vendors.txt now lists. Before every push: pnpm install --frozen-lockfile && pnpm verify green on Node 24 and Node 26 in your clone. Open a draft PR against main with a body that lists every claim with the command that reproduces it and the result in your session, the mutant table, and a Deliberately not done list. Push the next commit only after the verify check is green on the last. Never force-push.
Record in the PR body the residual risk you accept: a lexer cannot see constructed specifiers, runtime-generated code, modules loaded by path (node:cluster, node:worker_threads) or lexical shadowing. Then stop; Pass 1 is Claude Code, Pass 2 is Codex, and the PM writes the briefs.
```

## Carried to the ideas file (added by the PM)

Pass 2.5's findings 3, 4 and 5 stay open: the untested tools-only scope of the missing-import throw, the accepted test-registration and timeout forms for the next tooling spec, and `node:worker_threads` as a path-based loading route. `docs/v0.1.0-ideas.md` is outside `docs/reviews/**`, so they land in the next ordinary docs PR, with the entries the 1.5 brief lists.
