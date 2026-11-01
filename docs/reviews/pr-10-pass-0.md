# Pass 0 brief: PR #10 (S00.2 test-registration guard)

Written by the PM on 2026-11-01 (America/New_York), from a fresh read of the PR at `b4ff2afbf1d263a182163f4f61a6785d7e7c09c2`. This brief lives on branch `docs/pr-7-records`, not on the PR branch, so that no Claude-authored commit enters PR #10 and the Pass 1 seat stays Claude Code. When it was written, PR #10 had no comment (`gh api repos/BeniCheni/keel/issues/10/comments --jq length` printed `0`).

## Seat for Pass 1

Claude Code, fresh session, fresh clone. Model Opus 5.5 High, because no sensitive path is touched. The fallback is the same model, so if it is unavailable, stop and escalate.

## Scope

- Spec: none. Beni ruled on 2026-11-01, in the words "Record is enough", that S00.2 needs no spec PR. The build authority is findings 1 and 2 of the Pass 2.5 comment on PR #8 ([issuecomment-6560062425](https://github.com/BeniCheni/keel/pull/8#issuecomment-6560062425)) and the build brief recorded in `docs/reviews/pr-8-pass-2.5.md` (ruling 5 and "S00.2 build brief" there, same branch as this file). Design brief: none.
- Sensitive paths touched: none. The diff is `tools/acceptance/spawn-graph.mjs` and `tools/acceptance/test/test-contract.test.mjs` (`git diff --name-only origin/main...HEAD`), and `AGENTS.md` does not list `tools/acceptance/**`.
- Release: no.
- New dependencies: none (`git diff --name-only origin/main...HEAD -- package.json pnpm-lock.yaml 'packages/*/package.json' | wc -l` prints `0`).
- Bootstrap path: no. Install, `verify` and mutations all apply. Pass M does not apply (no engine, no golden fixtures).
- Diff: 2 files, 132 insertions, 7 deletions (`git diff --shortstat origin/main...HEAD`). The test file has 78 added and 0 removed, the analyzer 54 added and 7 removed (`git show --format= --numstat HEAD`).
- Base: `origin/main` at `f0ad018`, the PR #8 squash (`git rev-parse origin/main`).
- CI: run 41325568023 at `b4ff2af`, event `pull_request`, conclusion `success` (`gh run list --commit b4ff2afbf1d263a182163f4f61a6785d7e7c09c2 --json databaseId,event,conclusion`). The PM did not re-run `pnpm verify` for this brief.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `b4ff2af` fail closed when a vitest test is not a named call | Cursor | Claude Code, Pass 1 |

Any fix commit Pass 1 pushes is Claude-authored and gets its cold read from Codex at Pass 2. Any Codex fix commit gets its cold read from the fresh Claude session at Pass 2.5. A Claude session wrote the build brief, not any commit, so that does not change who takes Pass 1. The session that wrote the brief takes no review pass on this PR.

## Fast-track

Not allowed: the diff is code, and Beni's ruling 5 bars it.

## What to check, beyond the skill's standing checks

None of these has been run by the PM. Each is a question, not a finding.

1. **"Every other way of reaching Vitest."** The build brief asks for every way other than a named import of `test` or `it` to fail closed. The PR's "Deliberately not done" exempts `export { test } from "vitest"`. Write a test that imports `test` from a local module re-exporting Vitest: is it flagged, does it throw, or does it pass silently? Do the same for `export * from "vitest"`, a specifier that is not a plain string token (a no-substitution template literal in `import()`), an aliased loader (`createRequire`, `const load = require`), and other package entry specifiers. A form that passes silently is either named in the PR's residual-risk sentence or is a finding.
2. **Forms inside an accepted registration.** The PR says a test local that occurs only inside an accepted registration is not visited again. Can a spawning test escape that way, for example `const t = test` or `test.extend({})` in an accepted test's callback or in a `test.each` table argument? Run it, and check what Vitest does with it at run time before grading it.
3. **Timeouts on every accepted chain.** The regression asserts the missing timeouts for each accepted chain, but gives the timeout only on a plain `test`. Does each chain count a timeout it receives, and only in the positions C6 allows: `test.each([1])("x", fn, T)`, `test.skipIf(0)("x", fn, T)`, `test.only("x", { timeout: T }, fn)`, `test.concurrent("x", fn, T)`? Does a timeout on the wrong call of a curried chain count?
4. **What the new rule rejects.** Pass 2.5's finding 4 listed harmless forms the S00.1 rules reject. Which reasonable forms does this rule add: a tagged-template `` test.each`...` ``, an object key or label named `test` or `it`, `it` as a parameter or loop variable in a file that imports `it`, `typeof test`? Are they disclosed? The live tree has none, or `pnpm verify` would be red.
5. **Finding 2's closing test.** The build brief says each regression fails against the `main` analyzer. The PR body says `h.nope()` passes there because the clause already exists, and that the kill is the mutant `P25-exportnames-any`. Is that the right reading? Does `h.nope()` throw because of the `exportNames` clause and not another guard?
6. **Load.** Neither the build brief nor the PR body re-runs S00.1's AC2 loop, which is how Pass 1 on PR #8 found its race. `assertVitestImports` and the new throw in `testCallsIn` also read the temp files a concurrent run writes under `tools/acceptance/test`. Run the loop (PR #8's body has it) from a fresh clone and a cold install at the head.
7. **The error message.** `assertVitestImports` names the file; the throw in `testCallsIn` gives only an offset. What does an author see when the live tree trips each one? Does the second name the file by the time it surfaces?
8. **The residual-risk sentence.** The build brief dictated it. After items 1 and 2, is it complete and true? Pass 2.5 on PR #8 found the same kind of gap in Codex's table.

Out of scope, by the build brief: Pass 2.5's findings 3, 4 and 5 on PR #8, which go to the ideas file. Report new rejections under item 4, but do not change those rules.

## Sealed appendix: builder claims to verify independently

Do your own read before opening this. These are claims, not facts, taken from the PR body at `b4ff2af`. Re-derive each one; report any that do not reproduce.

| # | Claim (as the builder stated it) | Command the builder gave |
| --- | --- | --- |
| 1 | `origin/main` is `f0ad0187925823a21315f9b5c2a1f25d44b07211` | `git rev-parse origin/main` |
| 2 | The diff is two files, 132 insertions, 7 deletions | `git diff --stat origin/main...HEAD`; `git show --stat --format='' HEAD` |
| 3 | No new dependency; the diff touches no lockfile or `package.json` | None given |
| 4 | With the `main` analyzer swapped in, the contract file exits 1 with 16 passed and 1 failed, the failure being `unrecognised vitest test registration fails closed` on the namespace form; at this commit it exits 0 with 17 passed | `git show origin/main:tools/acceptance/spawn-graph.mjs`, then `pnpm exec vitest run --config tools/vitest.config.mjs tools/acceptance/test/test-contract.test.mjs --reporter=json --outputFile=<temp>` |
| 5 | The five Pass 2.5 forms throw, and so do `import { default as vitest } from "vitest"` and `require("vitest")` | The same contract file |
| 6 | Accepted registrations report exactly `plain`, `it`, `each %i`, `only`, `concurrent`, `skipIf`, `inside describe` and `aliased`; `timed` is absent | The same contract file |
| 7 | `h.nope()` is in the namespace test; on the `main` analyzer that test still passes; `P25-exportnames-any` dies, with 16 passed and 1 failed | `pnpm exec vitest run --config tools/vitest.config.mjs tools/acceptance/test/test-contract.test.mjs` |
| 8 | The live tree reports `missingTimeouts` empty, `forbiddenChildProcessImports` empty and `nestedTimeoutMs` 180000 | `node --input-type=module -e 'import { inspectTools } from "./tools/acceptance/spawn-graph.mjs"; const r = inspectTools("."); console.log(JSON.stringify({ missingTimeouts: r.missingTimeouts, forbiddenChildProcessImports: r.forbiddenChildProcessImports, nestedTimeoutMs: r.nestedTimeoutMs }));'` |
| 9 | `verify ok` and every `verify:* ok` line on Node v24.22.2 and v26.13.0: core 1 passed in 1 file, tooling 120 passed in 8 files | `pnpm install --frozen-lockfile && pnpm verify` |
| 10 | 15 mutants for finding 1 and 4 for finding 2 each exit 1, with the named test the only failure, and `P25-exportnames-any` is run against the whole file | The mutant tables in the PR body, each with `-t "<test>"` |
| 11 | Each uncommitted mutant was restored, and the verified tree is the committed tree | `git status --porcelain` |
| 12 | "Deliberately not done": modifiers other than `only`, `concurrent`, `each` and `skipIf` throw, including `skip`, `todo`, `fails`, `runIf` and stacked modifiers such as `only.each` | None given |
| 13 | Residual risk: "A lexer cannot see constructed specifiers, runtime-generated code, modules loaded by path (node:cluster, node:worker_threads) or lexical shadowing." | None given |
