# Pass 1.5 brief: PR #13

Written by the PM on 2026-11-01 (America/New_York) after reading the Pass 1 comment on PR #13 ([issuecomment-6567988397](https://github.com/BeniCheni/keel/pull/13#issuecomment-6567988397); reviewed head `26b661f`, post-fix head `747ea72`). Codex receives this brief for Pass 2. Like the Pass 0 brief, it lives on branch `docs/pr-13-records`, not on the PR branch.

All fourteen findings are accepted, and none goes to Cursor as rework. Pass 1 closed findings 1 to 9 with patches, and its three Highs are closed. Beni's rulings below add four changes for Pass 2: a locale-independent tie-break, conflict entries out of the schedule-order check, a `duplicate-ticker` fixture, and `-0` rejected. This seat adds two surviving mutants in the head's code and two Lows.

## How this brief adjudicated

Every disposition below rests on a run in this session, in fresh clones of PR #13 at `26b661f` and `747ea72`, with a fresh `mktemp -d` as `KEEL_DATA_DIR`. No user data folder, no private pattern file, no Pass 1 clone and no Pass 1 transcript was opened. Probes and mutants ran on Node v24.22.2.

The probes use a temporary Vitest file in `packages/core/src/terms/`, deleted after each run, that edits `minimal.yaml` in memory and prints each result of `loadTerms`. The mutants are exact-string edits, each followed by the whole core suite (`pnpm --filter @keel/core exec vitest run`) and a restore.

- **Baseline at `747ea72`:** `pnpm install --frozen-lockfile && pnpm verify` exits 0 on v24.22.2 and v26.13.0. Each run gives core 26 passed (8 files), tooling 122 passed (10 files) and all eight `verify:* ok` lines, and `git status --porcelain | wc -l` prints `0` afterwards.
- **CI:** run 41380472237 at `747ea72`, event `pull_request`, conclusion `success` (`gh run view 41380472237 --json conclusion,headSha,event`).
- **Diff:** 61 files, 8079 insertions, 20 deletions (`git diff --shortstat origin/main...747ea72`), of which Pass 1's commits are 11 files, 451 and 10 (`git diff --shortstat 26b661f 747ea72`).
- **No new dependency since the reviewed head:** `git diff --name-only 26b661f 747ea72 -- package.json pnpm-lock.yaml 'packages/*/package.json' | wc -l` prints `0`.
- **No test weakened:** `git diff 26b661f 747ea72 -- '*.honesty.test.ts' | grep -c '^-[^-]'` prints `0`. Across all test files the only removed line is the old `ajv/dist/2020` import (`git diff 26b661f 747ea72 -- '*.test.ts' '*.test.mjs' | grep '^-[^-]'`).
- **Each fix's test fails without it:** Pass 1's final five core test files on the `26b661f` source give 6 failed, 20 passed. The six are the tests Pass 1 names for findings 1, 2, 4, 5, 6 and 8. `core-entry.test.mjs` on the `26b661f` tree fails too (`node tools/test-tooling.mjs tools/acceptance/test/core-entry.test.mjs`), which is finding 9. The tests for findings 3 and 7 pass at `26b661f`, as they should: they pin behaviour that was already right and kill mutants, and they do not change an outcome.

Slip, this seat: the first baseline mutant run was contaminated by a copied test file left behind, and it was discarded. The results below are from a clean tree (`git status --porcelain | wc -l` printed `0` before and after).

## Per finding

| Pass 1 # | Severity | PM disposition | Reason (each from a run in this session) | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | High | accept | **Reproduced.** `value: *nope` as the issuer's value throws `ReferenceError` at `26b661f` and gives `alias issuer.value 6:10` at `747ea72`. An alias chain throws at `26b661f` and gives one `alias` diagnostic per alias at `747ea72` (50 for this seat's five lists of ten aliases; Pass 1's 60 came from its own shape). The catch's fallback line is not pinned: see PM-1. | no |
| 2 | High | accept | **Reproduced.** At `26b661f`, `value: null` under `primary` loads with `verified` 15 on `call.frequency`, `issuer` and a member's `initial`, so a null value counted as verified. A null first candidate also loads. At `747ea72` each is `status-fields` at the value. Each of the five changed schema sites dies when set back to `true`, at lines 149, 276, 338, 411 and 474, with "a null value is rejected under every status except unknown". See the Low on the comment below. | no |
| 3 | High | accept; the 20-of-22 count is sampled, not re-derived | **Reproduced on a sample of four.** At `26b661f`, `textValue.maxLength` 201, `monthsValue.maximum` 121 and `feeValue.minimum` -1 each survive (17 passed), and `levelValue.maximum` 20001 dies through its fixture. At `747ea72` all four die with "every bound in the field contract holds on both sides". | no |
| 4 | Medium | accept | **Reproduced.** `value: null` under `unknown` on `call.level` is `wrong-type` at `26b661f` and loads with `verified` 14 at `747ea72`. An empty `value:` and `value: ~` load the same way. With no `value` key it stays `status-fields`, so the loader invents nothing. `value: ~` under `primary` is `status-fields`. | no |
| 5 | Medium | accept | **Reproduced.** The continuation line loads at `26b661f` and is `schema-line schema 1:1` at `747ea72`. | no |
| 6 | Medium | accept | **Reproduced.** `source: constructor` is `source-kind` at `26b661f` and `source-missing` at `747ea72`. `valueof` is `source-missing` at both. A file that lists `constructor` as a source still loads. | no |
| 7 | Medium | accept; the mutants are not re-run | The behaviours hold at both heads: `2031-3-3` and `2100-02-29` are `invalid-date`, `2400-02-29` loads, and a conflict with no `candidates` is `conflict-candidates`. This seat did not re-run the three edits. | no |
| 8 | Low | accept | **Reproduced.** `!!str id: note-min` loads at `26b661f` and is `yaml-syntax id 2:7` at `747ea72`. | no |
| 9 | Low | accept | **Reproduced** through `core-entry.test.mjs`, above. | no |
| 10 | Low | accept; Pass 2 fixes it, by ruling 5 | **Reproduced.** `fees: { value: -0, status: user }` loads at both heads. | no |
| 11 | Low | accept; stays open | **Reproduced.** A leading BOM is `schema-line schema 1:1` at both heads. Ideas file. | no |
| 12 | Low | accept; stays open | **Reproduced.** `issuer: &bank` is `alias` with an empty path at `5:9` at both heads. Ideas file. | no |
| 13 | Low | accept; stays open | **Reproduced.** Every file naming `fixtures.ts` is a test (`git grep -l 'fixtures.ts' -- packages/core/src \| grep -vc '\.test\.ts$'` prints `0`). Ideas file. | no |
| 14 | Low | accept; stays open | **Reproduced.** `generate.mjs:911` overwrites the whole of `tools/tripwire/allowlist.txt`, and `pnpm -s fixtures:trees` prints only `fixtures/synthetic/terms`. The PM's decision: the file stays as it is for this slice. Before a second generator registers, either list the file as an output or merge into it, so that one generator cannot erase another's entries. Ideas file. | no |

Pass 1's "Deliberately not done" also lists the `localeCompare` tie-break (ruling 1 below) and the `yaml` warning on a complex key (ideas file, below).

Low, from this seat, outside tracked files, no action needed:

- Two of the mutation table's rows print `undefined` for both the suite result and the killing test: "alias throw" and "initial > 0" (`gh api repos/BeniCheni/keel/issues/comments/6567988397 --jq .body | grep -n 'undefined'`). So "78 run, 78 killed" has no recorded result for those two. This seat ran both, and both die: a rethrowing catch fails "an alias the parser cannot resolve is a diagnostic, not a throw", and an always-true `positiveDecimal` fails two tests.
- The table cuts each edit at 60 characters, so it cannot be re-run as written. Codex writes its own mutants, with exact edits in its comment.
- Finding 2's line list (`149,226,272,330,596`) names two lines the fix leaves alone, `term.properties` and a `not` inside the conflict branch, and omits the `estimate` and `assumed` branches it changes (`git show 26b661f:schemas/mln-terms/0.1.json`, `git diff 26b661f 747ea72 -- schemas`). The finding stands.

Privacy, this seat: the only address in the Pass 1 comment other than `noreply` ones is Cursor's vendor identity (`gh api repos/BeniCheni/keel/issues/comments/6567988397 --jq .body | grep -o -E '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' | grep -v 'noreply@' | grep -v -c '^cursoragent@cursor\.com$'` prints `0`). The owner's private-list check was not run by this seat; Codex runs it at Pass 2.

## What this seat adds

| # | Severity | Finding | How verified | Pass 2 |
| --- | --- | --- | --- | --- |
| PM-1 | Medium | The fallback line in `7eab3da`'s catch has no killing test. It is the only thing that gives a diagnostic when `toJS` throws and no alias site was recorded. | Dropping `if (!errors.some(...)) errors.push(diagnostic(fileName, "alias", "", 1, 1));` leaves 26 passed. `*nope : 1` appended to `minimal.yaml` gives one `alias` diagnostic at `747ea72`, and with the line dropped it returns `ok: false` with zero errors. | Fix: a test that fails without the line. |
| PM-2 | Medium | The per-field `if` guards on conflict candidates are not pinned. | Setting the guard at schema line 79 (`issuer`, candidates) to `value: true` leaves 26 passed. A null candidate on `issuer` then gets a second diagnostic, `wrong-type`, beside `status-fields`. The guard at line 51 dies. There are 47 not-null sites (`/"value": \{\s*"not": \{\s*"type": "null"\s*\}\s*\}/g` over the schema), and this seat tried seven. | Fix: a null candidate on every term field gives exactly one `status-fields`. Then shift the guards. |
| PM-3 | Low | An alias used as a key, and a complex key, report at line 1 column 1, not on their own line. `walk` skips a non-scalar key. The spec's goal is a line-numbered error. | Appended at line 97: `*nope : 1` is `alias "" 1:1`, and `? [a, b]` is `unknown-key "[ a, b ]" 1:1`. Both fail closed. | May fix with a test. If not, ideas file. |
| PM-4 | Low | The catch has no type check, so anything `toJS` throws becomes an `alias` diagnostic, whose message says an anchor or alias is present. The comment names two causes only. | Read at `load.ts`, `git show 747ea72:packages/core/src/terms/load.ts`. This seat found no third cause on Node. | Lead 1 below. |

Forms this seat tried that came out as they should at `747ea72`, each with no throw: flow nesting of 100000 opened, and of 100 to 2000 opened and closed; a block sequence 20000 deep; a block mapping 1500 deep; `__proto__` at the top and inside `sources`; a key holding a dot; a merge key. A character outside the Basic Multilingual Plane counts as two columns (`issuer.extra 5:38`), and `0000-02-29` loads. Neither is a finding here. Both matter to any engine that must match these positions.

## Pass 2's comment, as the PM takes it up

Codex completed Pass 2 ([issuecomment-6568716160](https://github.com/BeniCheni/keel/pull/13#issuecomment-6568716160)), on GPT-6.1 Sol Extra High with no fallback, with the verdict "mergeable after fixes", and pushed one commit, `c527df8`. It accepts all fourteen findings and reports no High open and no vendor disagreement. `c527df8` lands rulings 1, 2, 3 and 5 and closes PM-1 and PM-2. PM-3, PM-4 and findings 11 to 14 stay open, for the ideas file. Its own enumeration of schema bounds is larger than Pass 1's: 26 edits, of which 24 survive and 2 die at `26b661f`, and all 26 die at `747ea72`. That supports finding 3 with a different count, and is not a dispute.

This seat does not give the cold read of `c527df8`; the fresh Claude session does at Pass 2.5. The checks below are what this seat needs for these records and the PR body. Each comes from a run in this session at `c527df8`, in a fresh clone of PR #13, with a fresh `mktemp -d` as `KEEL_DATA_DIR`.

| Check | Command | Result |
| --- | --- | --- |
| Baseline | `pnpm install --frozen-lockfile && pnpm verify` on v24.22.2 and v26.13.0 | exit 0 on both; core 33 passed (9 files), tooling 122 passed (10 files), all eight `verify:* ok` lines; `git status --porcelain \| wc -l` prints `0` afterwards |
| CI | `gh run view 41385332658 --json conclusion,headSha,event` | `success` at `c527df8`, event `pull_request` |
| Diff | `git diff --shortstat origin/main...c527df8` | 64 files, 8461 insertions, 20 deletions |
| This pass | `git diff --shortstat 747ea72 c527df8` | 7 files, 392 insertions, 10 deletions |
| Scope | `git diff --name-only 747ea72 c527df8 -- docs CHANGELOG.md package.json pnpm-lock.yaml 'packages/*/package.json' \| wc -l` | `0` |
| No test weakened | `git diff 747ea72 c527df8 -- '*.test.ts' '*.test.mjs' \| grep -c '^-[^-]'` | `0` |
| Fixtures | `ls fixtures/synthetic/terms/invalid \| wc -l` | `29`, with `duplicate-ticker.yaml` and `wrong-type-negative-zero.yaml` among them |
| Locale in core | `git grep -nE 'localeCompare\|toLocale\|Intl\.\|Collator' -- packages/core/src` | one line, the stub in `terms.review.test.ts:12`; none in production code |

Rulings through the loader, on Node v24.22.2, with a temporary Vitest file that edits `minimal.yaml` in memory and is deleted afterwards. Every row gives the same result under `LC_ALL=en_US.UTF-8` and `LC_ALL=haw_US.UTF-8`.

| Ruling or item | Input | Result |
| --- | --- | --- |
| 1 | `barrier` and `economics` removed | `barrier` then `economics` |
| 2 | Candidates `2026-06-03` then `2026-06-01` inside one entry | loads |
| 2 | Known `2026-06-02`, then a conflict with `2026-06-01` and `2026-06-03` | loads |
| 2 | Known `2026-06-03`, a conflict, known `2026-06-01` | `schedule-order dates.observation_schedule[2].value 32:16` |
| 3 | A repeated ticker | `duplicate-ticker underlyings.members[1].ticker 34:15` |
| 5 | `-0` on `economics.fees`, `call.non_call_months`, `call.level` and a `call.level` candidate | one `wrong-type` at the value, each |
| 5 | `-1` on `call.level`; `0` on `call.non_call_months` | `out-of-range`; loads |
| PM-1 | `*nope : 1` appended | one `alias` at `1:1` |
| PM-2 | A null candidate on `issuer` | one `status-fields` at the value |

Three things for the record:

- **`c527df8` goes one step past the rulings.** `integerFaultPaths` removes a schema diagnostic at any path that has a token fault. So `-0` on `call.level` gives one `wrong-type`, not that plus `out-of-range`. The rule reaches every integer-token fault, not only `-0`. The PM reads this as needed for "exactly one" and in scope. Pass 2.5 gives it a cold read.
- **Pass 2's mutation table closes this seat's Low on Pass 1's table.** It gives complete edits. Five of its rows contain the word `undefined`, each as source text in an edit, and each row records an exit and a killing test.
- **Not re-run here:** its 91 post-fix mutants, its 26 historical edits and five before-and-after rows, its 89 own-read assertions, and its private-list check. Pass 2.5 re-runs the mutants it reports.

Slip, this seat: the Pass 2 prompt barred everything under `~/.config/keel/`, a line copied from the builder prompt, and that folder holds the private list Codex is the seat to read. Codex paused that one check and asked. The PM gave Beni a reply limiting the exception to the one file, for that scan, with counts only, and Beni passed it on. Pass 2's comment records the exception. A Pass 2 prompt now names that exception, and a builder or Fable prompt keeps the whole ban.

Privacy, this seat: the only address in Pass 2's comment other than `noreply` ones is Cursor's vendor identity (`gh api repos/BeniCheni/keel/issues/comments/6568716160 --jq .body | grep -o -E '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' | grep -v 'noreply@' | grep -v -c '^cursoragent@cursor\.com$'` prints `0`), and `scanRepo` finds 0 hits in it.

The PM refreshed the PR body once for this comment, at 23:03 EST on 2026-11-01, with `gh pr edit 13 --body-file`. Cursor's 91 lines stay byte-identical (`cmp` of the first 91 lines against the saved body), and `scanRepo` gated the edit: no error and 0 hits on the new text, and a generated address gives 1 email hit. Codex's private-list check came before this edit, so Beni runs that check before merging, over the PR body and the Pass 2.5 comment.

Pass 2's "Deliberately not done" adds nothing to the ideas-file entries listed above.

## Authorship record

The Pass 0 record, extended with every commit since: `git log --format='%h %an' origin/main..c527df8`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `26b661f` load mln-terms/0.1 and say which terms are verified | Cursor | Claude Code, Pass 1 (issuecomment-6567988397) |
| `798099f` import ajv by file so the core entry loads under Node alone | Claude (Pass 1 session) | Codex, Pass 2 (issuecomment-6568716160) |
| `7eab3da` report an alias the parser cannot resolve instead of throwing | Claude (Pass 1 session) | Codex, Pass 2 (issuecomment-6568716160) |
| `de83a53` a null value is legal under unknown alone, on every term | Claude (Pass 1 session) | Codex, Pass 2 (issuecomment-6568716160) |
| `de4b0e8` a source named like an Object.prototype member is source-missing | Claude (Pass 1 session) | Codex, Pass 2 (issuecomment-6568716160) |
| `66b9b3b` reject a schema marker that a continuation line extends | Claude (Pass 1 session) | Codex, Pass 2 (issuecomment-6568716160) |
| `82bc58b` an explicit tag on a key is yaml-syntax like a tag on a value | Claude (Pass 1 session) | Codex, Pass 2 (issuecomment-6568716160) |
| `ca39159` pin every field-contract bound from both sides | Claude (Pass 1 session) | Codex, Pass 2 (issuecomment-6568716160) |
| `0fd34af` pin the date-pattern code and the century leap rule | Claude (Pass 1 session) | Codex, Pass 2 (issuecomment-6568716160) |
| `747ea72` a conflict without a candidates key is conflict-candidates | Claude (Pass 1 session) | Codex, Pass 2 (issuecomment-6568716160) |
| `c527df8` apply owner rulings and pin review regressions | Codex | the fresh Claude session, Pass 2.5 |
| The commits adding this brief and `pr-13-pass-0.md`, on `docs/pr-13-records` | Claude (PM) | the records-PR cold read |

`c527df8` gets its cold read from the fresh Claude session at Pass 2.5, on Fable 5.1 High. The Pass 1 session and this session take no further pass on this PR.

## Rulings from Beni

Beni ruled on 2026-11-01 (America/New_York), on questions the PM put with its recommendation. Each answer is in Beni's words or the option he chose.

1. **"Fix in PR #13!"**, on "Should the locale-order fix go into PR #13?" `dedupe` in `load.ts` breaks a line-and-column tie with `localeCompare`, which reads the process locale. With `barrier` and `economics` both removed from `minimal.yaml`, the loader gave `barrier` then `economics` under `LC_ALL=en_US.UTF-8` and the reverse under `LC_ALL=haw_US.UTF-8`, at both heads, and `cs_CZ.UTF-8` matched `en_US` at `26b661f`. Over 15 sibling-key sets and 59 locale tags on Node v24.15.0 and ICU 78.2, only `haw` reorders any set, and `en` matches code-point order on all 15, so a code-point comparison keeps today's `en` order on those keys. PR #14's body holds the sweep script. Severity is Medium, a missed edge case in a determinism claim. Pass 2 fixes it with a test that fails on the current `dedupe` whatever the machine's default locale is. `LC_ALL` in a nested run and a stubbed `localeCompare` would each qualify. `git grep -nE 'localeCompare|toLocale|Intl\.|Collator' -- packages/core/src` prints only that line at `747ea72`. The same call in `tools/` stays out of scope and stays in idea 21.
2. **"No, skip them (Recommended)"**, on "In an observation schedule, should a conflict entry's candidates count toward schedule-order?" A conflict has no known value, so it takes no part in the check. Today, listing `2026-06-03` before `2026-06-01` inside one entry is `schedule-order` and the reverse loads, so listing order decides validity. A candidate before the entry above it is also `schedule-order` today. Pass 2 changes `checks.ts`, with tests that both of those forms load, that `[2026-06-03, conflict, 2026-06-01]` is still `schedule-order` on the known values, that candidates still get date flags, and that the schedule stays unverified.
3. **"Keep it (Recommended)"**, on "Keep duplicate-ticker as a new error code, even though the spec's list does not name it?" Pass 2 adds `invalid/duplicate-ticker.yaml` through the generator and its manifest, because the spec asks for a file per code, and regenerates.
4. **"Accept it (Recommended)"**, on "Is two-stage reporting acceptable, where schema faults hide referential faults until they are fixed?" No code change.
5. **"Reject it (Recommended)"**, on "Should -0 be rejected on integer terms?" `-0` becomes `wrong-type` on all seven integer terms, candidates included. `-1` stays what it is today. Pass 2 adds a `wrong-type-*` fixture for it, like the other token forms.

The PM amends `docs/specs/s01-terms-schema.md` for rulings 2 to 5 on draft PR #14, once Pass 2.5 settles the code, so the spec and the merged loader agree. Until then these rulings govern over the spec's text. Like Pass 1, Pass 2 edits nothing under `docs/`: out-of-scope items go in the comment, and the PM carries them.

## PR body

At 22:18 EST on 2026-11-01 the PM appended "Corrections after Pass 1" to the PR body with `gh pr edit 13 --body-file`, following ruling 2 on PR #8 and the same step on PR #10. It went on before Pass 2, so that Codex's private-list check covers it. Cursor's 91 lines are byte-identical (`cmp` of the first 91 lines against the saved body). The repo tripwire's `scanRepo` gated the edit: no error and 0 hits on the new text, and a generated address added to the same temporary repository gives 1 email hit. The section gets one refresh after Pass 2, not one per commit.

## More ideas-file entries for the PM

These go on draft PR #14: findings 11 to 14; PM-3 if Pass 2 leaves it; the `yaml` warning on a complex key, which `logLevel` can silence (`node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/log.js` calls `process.emitWarning`, or `console.warn` where that is absent); `new Function` running at module load, which a strict content security policy in the Tauri webview would refuse, so that the core entry could not import there (no slice has set one, ADR-0001 is silent, and `ajv`'s standalone mode is the candidate answer); a sealed appendix in its own file, because Pass 1 reports that one file prints it with the rest; and exact edits in every mutation table.

## Sealed appendix for Pass 2

Pass 1's findings and fixes are suspicions to re-derive, not conclusions, and so are this brief's dispositions and PM-1 to PM-4. Codex gives the cold read of the nine Claude-authored commits (`26b661f..747ea72`), reproduces or disproves each Pass 1 finding with its own commands, checks that each fix's test fails without it, and adds its own read of the whole PR at the head. Codex also runs the owner's private-list check (counts only, readable-file precheck, nonzero exit on a failed scan) over the diff, every commit message in `origin/main..HEAD`, the PR title and body including the PM's section, and every comment. Neither Claude seat ran it. Pass M does not apply: there is no engine and there are no golden fixtures.

Leads for Codex's own read, none of them established:

1. `7eab3da` catches everything `toJS` throws. What reaches it besides the two causes its comment names? Should it narrow, and would narrowing bring a crash back?
2. `de83a53` skips the integer rule when the parsed value is null. Which tokens parse to null (`~`, `Null`, `NULL`, empty), and can any reach `terms` as a non-null value or under a status other than `unknown`?
3. `66b9b3b` adds `carriesMarker` beside `schemaLineOk`, and `schemaDiagnostics` still skips errors at `/schema`. Can a file pass both and still carry another value at `schema`?
4. `ca39159`'s table pins lengths and ranges. Which pattern shapes does it leave open: first characters of `sourceId` and ticker, the ISIN and CUSIP patterns, the rounding modes, the dot-segment guard in `sourcePath`?
5. `798099f` changes one specifier. Does `ajv/dist/2020.js` keep its types under `tsc`, and does the Vite build agree with Node on which file it loads?
6. Write your own mutants of the fixes and of rulings 1, 2, 3 and 5, with exact edits in your comment. This seat ran eighteen distinct edits, named above, and Pass 1's table cannot be re-run as written.
7. Are the severities right, PM-1 and PM-2 included? A surviving mutant off a boundary is Medium by `AGENTS.md`. Say so if one of these is on a boundary.
