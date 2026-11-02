# Pass 0 brief: PR #13 (S01 terms schema 0.1 and strict loader)

Written by the PM on 2026-11-01 (America/New_York), from a fresh read of the PR at `26b661ff0b2e8133f8f4247f928077cf94cae015`. This brief lives on branch `docs/pr-13-records`, not on the PR branch, so that no Claude-authored commit enters PR #13 and the Pass 1 seat stays Claude Code. When it was written, PR #13 had no comment (`gh api repos/BeniCheni/keel/issues/13/comments --jq length` printed `0`).

## Seat for Pass 1

Claude Code, fresh session, fresh clone. Model Fable 5.1 Extra, because sensitive paths are touched. Fallback Opus 5.5 High; say so in the comment if it is used. Fable seats work on synthetic data only and never open the private-list file.

Later seats: Pass 2 is Codex, GPT-6.1 Sol Extra High. Pass 2.5 is a fresh Claude session on Fable 5.1 High. Beni merges.

## Scope

- Spec: `docs/specs/s01-terms-schema.md`, plus the build prompt recorded at the end of this brief, which adds to the spec and does not loosen it. Design brief: none.
- Sensitive paths touched: `packages/core/**` (20 files), `schemas/**` (1 file), `tools/tripwire/allowlist.txt`. Nothing under `fixtures/**/expected/**` or `fixtures/golden/**`. Command: `git diff --name-only origin/main...HEAD`.
- Release: no.
- New dependencies: `yaml` 2.9.1 and `ajv` 8.20.0, direct runtime dependencies of `@keel/core`, plus the four transitive packages the PR body lists. The spec's Dependencies section allows a YAML 1.2 parser and a JSON Schema 2020-12 validator; the build prompt sends anything else to escalation.
- Bootstrap path: no. Install, `verify` and mutations all apply. Pass M does not apply: there is no engine and no golden fixture.
- Diff: 59 files, 7638 insertions, 20 deletions (`git diff --shortstat origin/main...HEAD`). 27 of the files are invalid fixtures, and `schemas/mln-terms/0.1.json` alone is 2143 lines.
- Base: `origin/main` at `0f20993`, the PR #12 squash (`git rev-parse origin/main`).
- CI: run 41374568031 at `26b661f`, event `pull_request`, conclusion `success` (`gh run list --commit 26b661ff0b2e8133f8f4247f928077cf94cae015 --json databaseId,event,conclusion`). The PM did not run `pnpm verify` for this brief.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `26b661f` load mln-terms/0.1 and say which terms are verified | Cursor | Claude Code, Pass 1 |

Any fix commit Pass 1 pushes is Claude-authored and gets its cold read from Codex at Pass 2. Any Codex fix commit gets its cold read from the fresh Claude session at Pass 2.5. A Claude session wrote the build prompt, not any commit, so that does not change who takes Pass 1. The session that wrote this brief takes no review pass on this PR.

## Fast-track

Not allowed: the diff is code on sensitive paths.

## What to check, beyond the skill's standing checks

Each is a question, not a finding. Results the PM has for some of them are in the sealed appendix, so that your first read stays your own.

1. **`unknown` through the loader, on every field type.** The spec allows `unknown` with a `null` value on every term. The only `unknown` in a valid fixture is `underlyings.performance_rounding` (`grep -l 'status: unknown' -r fixtures/synthetic/terms`), and the build prompt added a rule about integer tokens. Does every string, date, decimal and integer term load with `value: null` and stay `null`?
2. **Malformed input.** The goal is to "reject anything malformed with a line-numbered error", and a crash is High. `loadTerms` calls `doc.toJS()` after filtering `doc.errors`. Which inputs reach that call and throw? Try alias and anchor forms the `alias` fixture does not cover, tags (`!!str`, on keys as well as values), merge keys, multiple documents, and non-mapping roots.
3. **Values the loader writes itself.** `projectTerms` writes `schema`, `category`, `structure` and `basket` as literals, and `schemaDiagnostics` skips errors at `/schema`. Can a file pass with a different value in any of them, so that `terms` states something the file does not? Line 1 can match while the YAML scalar runs on.
4. **The integer rule's reach.** The build prompt asks for a plain decimal token on integer fields. Does it reach all seven integer fields, and conflict candidates? Does it stop there? Which token does `-0` become? Does a test pin the boundary between `9007199254740991` and `9007199254740992`?
5. **Schedule order with a conflict.** The spec says "known values strictly increasing" and also that a conflict keeps its candidates in file order with no winner. What is a conflict entry's known value? Can the order of two candidates inside one entry cause `schedule-order`? If the spec does not settle it, say so; the PM takes it to Beni.
6. **`duplicate-ticker`.** The spec requires unique tickers but lists no code for a repeat, and this code is not in its list. There is no fixture for it, and the spec asks for one file per code. Is a new code right, or does a listed code fit? The PM takes the answer to Beni at Pass 1.5.
7. **The schema against the field contract.** `schemas/mln-terms/0.1.json` is 2143 lines and no generator writes it. Walk every row of the spec's field contract: required, shape, range, pattern, length. Then shift each bound by one. A surviving mutant on a boundary is High. Which bounds does the suite pin?
8. **The mutation floor, per claim.** The spec asks for at least three killed mutants per claim. The PR's 31 include none for `duplicate-key`, `schema-line`, `unknown-key`, `status-fields`, `invalid-date`, `schedule-order`, `conflict-candidates`, `unknown-status`, `yaml-syntax` or the warning-versus-error split, one position mutant in all (the alias site), and fewer than three for `source-missing` and `source-kind`. Which of those survive when you try them?
9. **Whether AC2 can fail.** The build prompt requires the generator to compute expected positions from its own text, importing neither `packages/core` nor the parser. `tools/generators/terms/generate.mjs` imports only `node:fs` and `node:path`. Does an off-by-one in `positionAt` or `missingPos` go red? Does every required spec variant exist as a single mutation of `minimal.yaml`?
10. **Honesty tests.** `terms.honesty.test.ts` is new. For each of the spec's six bullets, does the test go through `loadTerms`, or only through hand-built objects? Would "the loader never invents a value" catch the case in item 3?
11. **`ajv` at module load.** The PR discloses that `new Function` runs when the loader module loads. What does this cost at import? Can the core entry load outside Vite: `node --input-type=module -e 'import("./packages/core/src/index.ts").then(m => console.log(Object.keys(m)))'`? The specifier is `ajv/dist/2020`. The headless checker is a later slice.
12. **Purity.** `verify` does not catch clock or randomness in core. Read every non-test file under `packages/core/src` for `Date`, `Math.random`, `fetch`, `process` and dynamic imports. `fixtures.ts` is a non-test file using `import.meta.glob` with a `declare global`, imported only by tests (`grep -l 'fixtures.ts' -r packages/core/src`). Does it belong in that tree, and does the global reach production typecheck?
13. **Edits outside the build prompt's scope.** The prompt named two test changes. The PR also rewrites a test in `tools/acceptance/test/test-contract.test.mjs`, which it discloses and which S00's contract forced, and changes the status sentence in `README.md`, which its body does not mention. Does the contract test still say what it should, and is the README sentence true?
14. **What the error list omits.** The PR says referential checks run only after schema validation passes. So a file with both kinds of fault reports only the first kind. Does that meet the spec's rule that errors are diagnostics in document order? Is the order still the document's when two errors share a position?
15. **Lookups by file-supplied name.** `terms.sources[term.source]` reads a plain object using a name from the file. The source ID pattern allows lowercase words. What happens for a name on `Object.prototype`?

Out of scope, by the spec's non-goals: the payoff engine, schedule generation and the holiday calendar, file I/O and symlink containment, PDF import, UI, and resolving conflicts. List out-of-scope findings in your comment rather than in `docs/v0.1.0-ideas.md`; the PM carries them to the next ordinary docs PR.

## Sealed appendix: to verify independently

Do your own read before opening this. Everything here is a claim, not a fact. Re-derive each one; report any that do not reproduce.

### Builder claims, from the PR body at `26b661f`

| # | Claim (as the builder stated it) | Command the builder gave |
| --- | --- | --- |
| 1 | `origin/main` is the pinned SHA: both `0f20993f39eba26a4b638d0f6d9f498818a85f4c` | `git rev-parse HEAD^`; `git rev-parse origin/main` |
| 2 | The commit is the agent identity in `tools/tripwire/vendors.txt` | `git log -1 --format='%an <%ae>'` |
| 3 | `fixtures:trees` prints `fixtures/synthetic/terms` | `pnpm -s fixtures:trees` |
| 4 | Core tests, including AC1 to AC6: 7 files, 17 tests passed | `pnpm --filter @keel/core test` |
| 5 | `verify ok` on Node 24.22.2: typecheck, tests, tooling 121, tripwire, network, determinism, copy, boundaries | `pnpm install --frozen-lockfile && pnpm verify` |
| 6 | `verify ok` on Node 26.13.0, same eight steps | `pnpm install --frozen-lockfile && pnpm verify` |
| 7 | Public names are `dateFlags`, `loadTerms`, `verificationSummary` | `packages/core/src/index.test.ts` in the core run |
| 8 | The allowlist is one synthetic entry and the tripwire is clean | `verify:tripwire` in both runs |
| 9 | AC1 to AC6 live in the test files the PR names, and AC2 checks one code, path, line and column per file | The PR's AC paragraph |
| 10 | `yaml-syntax` and `cusip-check-digit` are covered by editing generated text in memory; the warning leaves `ok` true; messages from every invalid case meet the copy-lint word boundaries | `terms.invalid.test.ts` |
| 11 | The contract, determinism and index tests changed only as the PR describes | `git diff origin/main...HEAD -- tools/acceptance/test packages/core/src/index.test.ts` |
| 12 | 31 of 31 mutants were killed, each by the named test or check, and restored before the commit | The PR's mutant table |
| 13 | `yaml` 2.9.1 is ISC. `ajv` 8.20.0 is MIT. `ajv/dist/compile/index.js` line 89 is `new Function`, and that compile step runs when the loader module loads | The PR's Dependencies section |
| 14 | Transitive from `ajv`: `fast-deep-equal` 3.1.3 MIT, `fast-uri` 3.1.9 BSD-3-Clause, `json-schema-traverse` 1.0.0 MIT, `require-from-string` 2.0.2 MIT. No other direct dependency | The PR's Dependencies section |
| 15 | Deliberately not done: referential checks run only after schema validation passes; a repeated ticker uses `duplicate-ticker`; explicit YAML tags are `yaml-syntax`; plain scalars are left alone | None given |
| 16 | Residual risk: schema compilation did not fetch `$schema`, because core tests stayed green under the network guard | `pnpm --filter @keel/core test` |
| 17 | Residual risk: the generator and the loader each have a Gregorian calendar, and a drift between them would fail the valid fixtures and the leap-day load | None given |
| 18 | Residual risk: a `node:fs` import in non-test core source fails `tsc`, and `Date.now()`, `Math.random()` and `fetch` are invisible to it and unused | `pnpm exec tsc -p packages/core --noEmit` |

### PM probes at `26b661f`

The PM ran these on Node 24 only, through a temporary test file in a scratch clone that edited `minimal.yaml` in memory and called `loadTerms`. They were run to sharpen the questions above. They are not findings: severity and fixes are Pass 1's.

| # | Edit to `minimal.yaml` | Result |
| --- | --- | --- |
| A | `value: null`, `status: unknown` on `call.level`, `call.non_call_months`, `premium.rate_per_year` or `economics.issue_price` | Rejected, `wrong-type` at `<path>.value` |
| B | The same on `call.frequency`, `dates.trade` or `issuer` | `ok: true` |
| C | `value: *nope` as the issuer's value | `loadTerms` throws `ReferenceError` (unresolved alias) |
| D | Six added keys, each a list of ten aliases of the one before | `loadTerms` throws `ReferenceError` (excessive alias count) |
| E | `schema: mln-terms/0.1` followed by an indented line `extra` | `ok: true`, with no diagnostic |
| F | An observation schedule whose first entry is a conflict with candidates `2026-06-03` then `2026-06-01` | Rejected, `schedule-order`. With those candidates in the other order, `ok: true` |
| G | `source: constructor` on the issuer | Rejected, `source-kind` rather than `source-missing` |
| H | `fees: { value: -0, status: user }` | `ok: true` |
| I | `!!str id: note-min`, a tag on a key | `ok: true`, though the PR says explicit tags are `yaml-syntax` |
| J | No edit: the native Node import in item 11 | Fails, `ERR_MODULE_NOT_FOUND`, and Node suggests `ajv/dist/2020.js` |

Checked and held, so they need no repeat unless you doubt them: a source path of 255 characters loads and one of 256 gives `source-path`; deep flow nesting gives `yaml-syntax` with no throw; empty text, a comment alone, `---` alone, a list root and a second document each give diagnostics with no throw; CRLF line endings load; an `estimate` candidate and a nested conflict are rejected.

Probe A may trace to the build prompt, whose integer rule did not except the `null` of an `unknown` term. That is the PM's wording, and the spec still governs: `unknown` is allowed on every term.

## Build prompt

As the PM wrote it and handed it to Beni on 2026-11-01. Beni reported no change to it, and the PM cannot see what Cursor received. It carries results of PM probes run at `0f20993` on Node 24 only.

```
You are the builder for keel slice S01, terms schema 0.1 and strict loader. Use Grok 4.7 Extra High, because this is a sensitive-path slice. Read AGENTS.md first, then docs/specs/s01-terms-schema.md, which is the build authority. This prompt adds to the spec and never loosens it; if the two conflict, stop and report.
Work in a fresh clone of BeniCheni/keel on branch s01/terms-schema, cut from origin/main at 0f20993f39eba26a4b638d0f6d9f498818a85f4c (stop and report if origin/main differs). Export KEEL_DATA_DIR="$(mktemp -d)" for every command. Never open the user's data folder or anything under ~/.config/keel/.
Scope: what the spec names, plus the two test changes below. Nothing under docs/ and no CHANGELOG.md edit; the PM writes the records.
Dependencies: the spec covers a YAML 1.2 parser and a JSON Schema 2020-12 validator. Pin exact versions, as the repo does, and give each a justification and license line in the PR body. For any other dependency, stop and escalate. If your validator compiles with new Function or eval at run time, say so in the PR body; ajv 8.20.0's compile module contains new Function.
Reading fixtures in core tests: `types: []` in packages/core/tsconfig.json is the only thing stopping a node:fs import under packages/core/src. With such an import, even in a test file, `pnpm exec tsc -p packages/core --noEmit` exits 1 while Vitest passes. Keep that true: no @types/node, no shim for node:* modules, no change to `types`. One route the PM ran at main, with tsc and Vitest both exiting 0: `import.meta.glob("../../../../fixtures/synthetic/terms/**/*.yaml", { query: "?raw", import: "default", eager: true })`, with ImportMeta.glob declared through `declare global` in the test. A JSON import of schemas/mln-terms/0.1.json from production code also passes both.
Purity: non-test code under packages/core/src uses no clock, randomness, network or file system. verify does not catch all of this: a file using Date.now(), Math.random() and fetch exits 0 under tsc. So it rests on you and on review.
Fixture CUSIPs: a CUSIP that passes its check digit may appear only in files under fixtures/synthetic/terms/. The allowlist accepts only globs under fixtures/ (tools/tripwire/scan.mjs:205), and one such literal in a core test file, a generator file or a commit message each gave a tripwire hit at main. So the generator computes the check digit at run time, and tests read the value from a fixture or compute it. Keep fixture CUSIPs out of commit messages, the PR body and comments. Allowlist lines are tab-separated: glob, value, reason.
Fixture values: every integer-cent value, and the integer part of every decimal string, stays under nine digits so the CUSIP class does not fire (idea 2 in docs/v0.1.0-ideas.md). The generator throws if a value breaks this, and a test shows it throwing. The only exception is the out-of-range fixture described below. Add no allowlist entry beyond the ZZZ CUSIPs; if the tripwire hits other generated output, change the generator.
Generator: write it in .mjs, like everything else under tools/, and register it in tools/fixtures/registry.mjs as { name, version, seed, trees, regen(root) }. It imports neither packages/core nor the parser the loader uses, and it computes each expected line and column from the text it emits; otherwise AC2 cannot fail. regen empties its tree before writing, and terms.invalid.test.ts compares the discovered invalid files with the manifest, so a stale fixture goes red.
Two existing tests must change, and neither may be deleted. Registering the generator turns "fixtures:trees prints fixtures when nothing is registered" in tools/acceptance/test/determinism.test.mjs red (received fixtures/synthetic/terms). Keep its treesOf([]) and splitTrees assertions, make the live expectation the registered tree, and rename the test to match. "public API is empty" in packages/core/src/index.test.ts asserts an empty list; replace it with the exact list of exported names. Update the comments in packages/core/src/index.ts and tools/fixtures/registry.mjs.
Integer tokens: the spec says no floats appear and the loader never invents a value. yaml 2.9.1 parses 9500.0, 1e3, 0x10, 0o17 and +9500 as integers that pass JSON Schema's integer type, and it parses 99999999999999999 as 100000000000000000. So integer fields accept only a plain decimal token: an optional minus, then digits with no leading zero. Any other numeric form is wrong-type, and a magnitude above Number.MAX_SAFE_INTEGER is out-of-range. The check reads the source token, so it belongs to the loader. Add one invalid fixture per form above, each still a single mutation of minimal.yaml.
Diagnostic positions: line and column are 1-based. A diagnostic with no token of its own, such as missing-required, keeps the missing key's dotted path and points at the key of its parent mapping, or at line 1 column 1 for a top-level key.
Coverage the acceptance table omits: yaml-syntax has no fixture by the spec's carve-out, and no criterion names the cusip-check-digit warning. Test both in terms.invalid.test.ts by changing generated fixture text in memory, with no new fixture file. The warning must leave ok true.
Messages: every diagnostic message is product text under hard rule 12, and tools/copy/lint.mjs reads only packages/ui/src/copy, README.md and DISCLAIMER.md, so it never sees them. Add a test that collects the message from every invalid case and asserts none uses should, buy, sell or hold, with the same word boundaries as the lint.
Mutation floor: at least three killed mutants per claim, each applied by hand in the working tree, killed by a named test, and restored before commit. Include all eight the spec requires, plus: a node:fs import in a non-test file under packages/core/src turns pnpm verify red; accepting 9500.0 as an integer; accepting a value above Number.MAX_SAFE_INTEGER; a stale file in invalid/ going undetected; the generator allowing a nine-digit cent value. List each in the PR body with the test or check that kills it.
Commits: author as your agent identity per hard rule 10 (git -c user.name=... -c user.email=... commit), the address tools/tripwire/vendors.txt lists. Every commit is green, so the commit that registers the generator carries its outputs, its allowlist entries and the determinism test change, and the commit that first exports from index.ts carries the index test change. Before every push: pnpm install --frozen-lockfile && pnpm verify green on Node 24 and Node 26 in your clone. Open the draft PR against main on your first push so CI runs. Push the next commit only after the verify check is green on the last. Never force-push.
PR body: every claim with the command that reproduces it and the result in your session, the mutant table, the dependency lines, a Deliberately not done list, and the residual risk you accept. Then stop. Pass 1 is Claude Code, Pass 2 is Codex, Pass 2.5 is a fresh Claude session, the PM writes the briefs, and Beni merges.
```
