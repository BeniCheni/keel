# Pass 1.5 brief: PR #10

Written by the PM on 2026-11-01 (America/New_York) after reading the Pass 1 comment on PR #10 ([issuecomment-6561199919](https://github.com/BeniCheni/keel/pull/10#issuecomment-6561199919); reviewed head `b4ff2af`, post-fix head `5989f81`). Codex receives this brief for Pass 2. Like the Pass 0 brief, it lives on branch `docs/pr-7-records`, not on the PR branch.

All eleven findings are accepted, and none goes to Cursor as rework. Pass 1 closed findings 1 to 8 with patches, the PM closed finding 9, and findings 10 and 11 stay open. This seat adds one silent route Pass 1 did not list, and one question for Beni on where S00.2 stops.

## How this brief adjudicated

Every disposition below rests on a run in this session, in fresh clones of PR #10 at `b4ff2af` and `5989f81`, with a fresh `mktemp -d` as `KEEL_DATA_DIR` on every command. No user data folder, no private pattern file, no Pass 1 clone and no Pass 1 transcript was opened. Node was selected with `nvm use`.

The probes use a generated fixture root holding a spawning `tools/leaf.mjs`. Each form goes through `inspectTools(root)` from three analyzers (`origin/main`, `b4ff2af` and `5989f81`), and then the same files run under the repo's Vitest with `--reporter=json`. The result reads the exit code, the passed count and a marker file the leaf appends to. An "escape" means the analyzer stays silent, Vitest exits 0, and the marker shows a spawn.

- **Baseline at `5989f81`:** `pnpm install --frozen-lockfile && pnpm verify` exits 0 on v24.22.2 and v26.13.0. Each run gives core 1 passed (1 file), tooling 120 passed (8 files) and all eight `verify:* ok` lines, and `git status --porcelain | wc -l` prints `0` afterwards.
- **Diff at `5989f81`:** 2 files, 367 insertions, 24 deletions (`git diff --shortstat origin/main...HEAD`), of which Pass 1's commits are 245 and 27 (`git diff --shortstat b4ff2af 5989f81`). No new dependency (`git diff --name-only origin/main...HEAD -- package.json pnpm-lock.yaml 'packages/*/package.json' | wc -l` prints `0`). `git diff origin/main...HEAD -- tools/acceptance/test/test-contract.test.mjs | grep -c '^-[^-]'` prints `0`. The one test line `5989f81` removes (`git show --format= --numstat 5989f81`) belongs to a fixture an earlier commit in this PR added, and it makes that fixture stricter.
- **AC2 at `5989f81`:** PR #8's loop, from a fresh clone and a cold install on v24.22.2, prints `0 0 0` in all three rounds, with 120 passed in each of the nine runs and leftover `0` (`git status --porcelain --untracked-files=all -- packages tools | wc -l`).
- **Pass 1's push order:** "each was pushed only after the `verify` run on the one before it went green" holds. From `gh run view <id> --json createdAt,updatedAt`, in UTC: `970d21a` finished 16:58:06, the next run started 16:59:05; `57dd887` finished 17:00:02, the next started 17:01:03; `d37b08b` finished 17:01:56, the next started 17:05:16. All four runs have conclusion `success`.
- **Live tree:** no live test uses any route below. `pnpm verify` is green at both heads, and the `spawned tooling tests declare NESTED_RUN_TIMEOUT_MS` test reads the live tree, which covers the routes `5989f81` now flags or rejects. For the routes it leaves open, at `5989f81`: `git grep -n -E '^\s*(beforeAll|beforeEach|afterAll|afterEach|aroundEach|aroundAll)\(' -- 'tools/**/*.mjs'` and `git grep -n -E '^\s*describe(\.[a-z]+)?\(' -- 'tools/**/test/*.mjs'` print nothing, and `git grep -n -E '^\s*(test|it)(\.[a-z]+)?\("[^"]*", *[A-Za-z_]+\.[A-Za-z_]+ *[,)]' -- 'tools/**/test/*.mjs'` prints nothing for a member callback. `git grep -n -E 'from "(\.\./){3,}' -- 'tools/**/test/*.mjs'` prints two lines, both fixture strings in the contract test. `git grep -n -E '[)}] */[^/* ]' -- 'tools/**/*.mjs'` prints 14 lines outside comments; read one by one, they are the insides of regexes and template paths, not a regex after `)` or `}`. These greps match common forms, so they support the claim without proving it.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason (each from a run in this session) | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | Medium | accept | **Reproduced.** `export { test } from "vitest"`, `export { test as t }`, `export *` and `export * as v`, imported from a local module: silent on `main` and `b4ff2af`, Vitest exit 0 and 1 spawn each. All four throw `unrecognised vitest test registration` at `5989f81`. | no |
| 2 | Medium | accept | **Reproduced for eight forms.** `` import(`vitest`) ``, `import(("vitest"))`, `vi.importActual("vitest")`, `import.meta.vitest`, `import.meta["vitest"]`, `"vit\x65st"`, a line-continued specifier and a path into `node_modules`: silent at `b4ff2af`, Vitest exit 0 and 1 spawn each, and all throw at `5989f81`. A static `import { test } from "vit\x65st"` is silent at `b4ff2af` and flagged at `5989f81`, as Pass 1 says. The destructured, aliased and optional `import.meta` forms were not re-run. | no |
| 3 | Medium | accept | **Reproduced.** `const x = 1` with no semicolon, then the imports: silent at `b4ff2af`, Vitest exit 0 and 1 spawn, flagged at `5989f81`. A `child_process` import swallowed the same way is absent from `forbiddenChildProcessImports` at `b4ff2af` and listed at `5989f81`. | no |
| 4 | Medium | accept | **Reproduced for `.mts`, `.jsx` and `.tsx`.** A helper that registers a spawning test: silent at `b4ff2af`, Vitest exit 0 and 1 spawn each, flagged at `5989f81`. `.cts` was not run, here or by Pass 1. | no |
| 5 | Medium | accept | **Reproduced.** `test((e = test.extend({}), "t"), () => {})`, the same in a `test.each` table and a `test.skipIf` condition, and `e = test` in a title, then `e("x", spawning)`: silent at `b4ff2af`, Vitest exit 0, 2 passed and 1 spawn each. All throw at `5989f81`. | no |
| 6 | Medium | accept | **Reproduced.** A spread call and `test("x", ...)`: silent at `b4ff2af`, Vitest exit 0 and 1 spawn each. Both throw at `5989f81`. | no |
| 7 | Medium | accept the finding; the counts are not re-derived | **Reproduced on a sample of the kinds it names.** Seven mutants, run on the whole contract file: a dangling `test.each(t)`, `test.only` as a value, the walker's member, optional and function guards, and the loader check's member and call guards. Each survives at `b4ff2af` (17 passed) and dies at `5989f81` (16 passed, 1 failed, `unrecognised vitest test registration fails closed`). `P25-exportnames-any` dies at both. The final test file against the `b4ff2af` analyzer gives 16 passed, 1 failed, that test. "11 of 18" and "50 of 50" could not be re-run: see the Low below. | no |
| 8 | Low | accept | **Reproduced.** `b.import;` throws `import missing from` at `b4ff2af` and is accepted at `5989f81`. `test("o", spawning)()` is silent at `b4ff2af` and flagged at `5989f81`; Vitest exits 1 on it, so nothing escaped. | no |
| 9 | Medium | accept; closed by the PM | The PR body described `b4ff2af`. See "PR body" below. | no |
| 10 | Medium | accept; stays open | **Reproduced.** A helper outside `tools/`, a spawning `beforeAll`, and `test("x", o.fn)`: silent on all three analyzers, Vitest exit 0 and 1 spawn each. This seat adds two more of the same kind: a spawn in a `describe` body and at module top level, both silent, exit 0 and 1 spawn. None of them is a route to Vitest, so none is inside findings 1 and 2. They are named in the PR body's residual risk and go to the ideas file. | no |
| 11 | Low | accept; stays open | **Reproduced.** `const a = { import: 1 };` is silent on `main` and throws `import missing from` at both heads, naming neither the file nor the rule. Nothing escapes. Pass 1 left it because the Pass 0 brief says to report new rejections and "not change those rules". The PM meant the S00.1 rules, and that wording was unclear. This is a defect in S00.2's own clause, so Codex may fix it with a test. It is not required. | no |

Low, from this seat, outside tracked files, no action needed: Pass 1's finding 7 says "Table below", but its mutation table gives totals only, with no edit for any of its 18 or 50 mutants. Under hard rule 9 those two figures have no reproducing command. Codex's PR #8 appendix is the better form. Codex writes its own mutants here.

Privacy, this seat: the Pass 1 comment contains no address other than `noreply` ones (`gh api repos/BeniCheni/keel/issues/comments/6561199919 --jq .body | grep -o -E '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' | grep -v -c 'noreply@'` prints `0`). The owner's private-list check was not run by this seat; Codex runs it at Pass 2.

## One route Pass 1 did not list

Pass 1 disclosed that a regex holding a backslash right after `)` or `}` now throws, because the lexer reads it as division. A regex holding a quote in that position does not throw. It throws the lexer out of step, and the test after it disappears into what the lexer takes for strings:

`if (1) /"/.test("1"); test("x", () => { leaf(); }); if (1) /"/.test("1");`

On one line, with the imports above it, this is silent at `5989f81`, and Vitest exits 0 with 1 passed and 1 spawn. The same holds with `{ } /"/` in place of `if (1) /"/`. The same regex after `(`, `=>`, `return` or `typeof`, or with a slash inside a character class, is read correctly, and the test is flagged. Medium, by the precedent of finding 1: a generated counterexample with no live escape. Not fixed. It is named in the PR body's residual risk, and it is lead 3 below.

Some other forms this seat tried came out as they should: a nested backtick or brace in a template, comment markers inside strings or regexes, a hashbang, `test /* c */ (...)` and a line break before `(` are flagged; `(test)(...)` and `(0, test)(...)` throw. `import { test } from "vitest"` throws `bad specifier`, which is safe but does not name the rule.

Forms Pass 1 killed as unreproducible, re-checked here: `createRequire(import.meta.url)("vitest")`, a global `test` and a `test` nested in a callback each make Vitest exit 1, so none is an escape.

## Pass 1's questions, as the PM takes them up

- **Pass 1 Q1** (a later slice fails closed on a relative import that leaves `tools/`) and **Pass 1 Q2** (a later slice checks spawning hooks) become ideas-file entries, not rulings now. They ask what a later slice does, and the file ranks that. This matches how the PR #8 brief handled hooks.
- **Pass 1 left the ideas file alone**, although the skill asks it to append. That was right: the build brief limits this slice to two files. The PM carries these to the next ordinary docs PR, with those the PR #8 briefs list: a helper outside `tools/`; spawning hooks, `describe` bodies and module top level; spawn-side value tracking (`test("x", o.fn)`); `test("x", fn, { timeout: T })`, which the analyzer counts and Vitest rejects (this seat: analyzer silent, exit 1); `import type` from `vitest` throwing; a semicolon-free statement before a spawning function; a regex right after `)` or `}`; and a runtime guard or a real parser in place of the hand-written lexer.

## PR body (finding 9)

At 12:29 EST on 2026-11-01 the PM appended "Corrections after Pass 1" to the PR body with `gh pr edit 10 --body-file`, following ruling 2 on PR #8, because Pass 1's report routed the text to the PM or Cursor. It went on before Pass 2 so that Codex's private-list check covers it. The first edit worded one bullet wrongly, and the PM replaced it a minute later; the edit history shows both. Cursor's text is byte-identical (`cmp` of the first 76 lines against the saved body). This time the repo tripwire's `scanRepo` ran first and gated the edit: no error and 0 hits on the new text, and a generated address added to the same temporary repository gives 1 email hit. The section extends Pass 1's suggested residual-risk text with the regex route, `describe` bodies and module top level. If Pass 2 moves the head, the section gets one more refresh, not one per commit.

## Question for Beni

Five passes in a row have found silent routes through the spawn analyzer: PR #8's Pass 1 (17 of 32 forms), its Pass 2 (C1 to C3, C5 and C6), its Pass 2.5 (finding 1), PR #10's Pass 1 (findings 1 to 6), and this seat (the regex route). No live test has used one. The hand-written lexer will not reach a closed list, as Pass 1's retro also says, and each round lands at the end of a review where a fix needs another round. The analyzer is now 1188 lines (`wc -l tools/acceptance/spawn-graph.mjs`).

1. Does S00.2 close after Pass 2, with any new silent route that no live test uses named in the residual-risk sentence and the ideas file instead of being fixed? A defect in the commits under review, and anything High, still gets fixed. The PM recommends yes.

## Authorship record

The Pass 0 record, extended with every commit since: `git log --format='%h %an' origin/main..5989f81`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `b4ff2af` fail closed when a vitest test is not a named call | Cursor | Claude Code, Pass 1 (issuecomment-6561199919) |
| `970d21a` fail closed on every other route to vitest | Claude (Pass 1 session) | Codex, Pass 2 |
| `57dd887` read imports after a semicolon-free const and every module extension | Claude (Pass 1 session) | Codex, Pass 2 |
| `d37b08b` visit a test local inside an accepted registration | Claude (Pass 1 session) | Codex, Pass 2 |
| `5989f81` pin each registration clause and every chain's timeout | Claude (Pass 1 session) | Codex, Pass 2 |
| Any Codex fix commit at Pass 2 | Codex | fresh Claude session, Pass 2.5 (Opus 5.5 High) |
| The commits adding this brief and `pr-10-pass-0.md`, on `docs/pr-7-records` | Claude (PM) | the records-PR cold read |

## Rulings from Beni

None on this brief yet. Question 1 is open. Ruling 5 in `docs/reviews/pr-8-pass-2.5.md` is the slice's authority.

## Sealed appendix for Pass 2

Pass 1's findings and fixes are suspicions to re-derive, not conclusions, and so are this brief's dispositions. Codex gives the cold read of the four Claude-authored commits (`b4ff2af..5989f81`), reproduces or disproves each Pass 1 finding with its own commands, checks that each fix's test fails without it, and adds its own read of the whole PR at the head. Codex also runs the owner's private-list check (counts only, readable-file precheck, nonzero exit on a failed scan) over the diff, every commit message in `origin/main..HEAD`, the PR title and body including the PM's section, and every comment. Neither Claude seat ran it. Pass M does not apply: there is no engine and there are no golden fixtures.

Leads for Codex's own read, none of them established:

1. `57dd887` changes where `skipStatement` stops. What valid source now parses differently? Try a statement that legitimately continues across a line break next to `import` (`const x = y\n  .import`, `const a = b ?\n  import("c") : d`). Can that hide code, or only reject it? Do the newly scanned `.tsx` and `.jsx` files fail with a message an author can act on?
2. `970d21a` adds `VITEST_OTHER_SPEC` and `reachesVitest`. What do they miss, and what do they wrongly catch: a relative path holding `node_modules/vitest` through a symlink or `..` segments, `./vitest.mjs`, `@vitest-foo/x`?
3. `d37b08b` throws on a backslash token to stop a misread regex. The "One route" section above shows a quote gets past it. Is there a cheap, sound rule for a `/` right after `)` or `}`, or is naming it the honest end? Report which, and any other way to throw the lexer out of step.
4. `5989f81` removes the `while` loop over chained calls. Does each curried chain still read its timeout from the right call, including `test.each(a)(b)(c)`?
5. Write your own mutants of the new clauses, with exact edits in your comment. Pass 1's are not listed, and this seat ran only the eight named above.
6. Run the AC2 loop at your final head, once normally and once with the core include glob broken, as on PR #8. Pass 1 and this seat ran only the normal loop.
7. Are the eleven severities right? Say so if a route here is worse than Medium: Pass 1 and this seat both used the precedent that a generated counterexample with no live escape is Medium.
