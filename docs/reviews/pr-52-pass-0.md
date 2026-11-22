# Pass 0 brief: PR #52 (S91 iOS foundation build)

Written by the PM on 2026-11-18 (America/New_York), from a fresh read of the PR at `819433e`. The PM wrote S91's spec (PR #50) and the build prompt, and no line of this PR: Cursor wrote all of it. This brief lives on the records branch `docs/pr-52-records`, not on the PR branch, so the PR's diff and claims stay as posted.

## Seat for Pass 1

Claude Code, in a fresh session with a fresh clone, on Fable 5.2 Extra, because PR #52 touches sensitive paths. The fallback is Opus 5.5 High, said so in the comment if used. Fable seats work only on synthetic data in a fresh clone. Pass 1 may fix what it reproduces, under the skill's fix policy; a fix commit is Claude's and gets its cold read from Codex at Pass 2.

Later seats:
- Pass 1.5 is the PM.
- Pass 2 is Codex on GPT-6.1 Sol Extra High: it adjudicates Pass 1, adds its own read, gives the cold read of any Claude fix commit, and runs the owner's private-list check. Pass M is N/A: no engine or golden fixture changes.
- Pass 2.5 is a fresh Claude session on Fable 5.2 High.
- Beni merges, and he alone runs criterion 12, the device run.

## Scope

- Spec: `docs/specs/s91-ios-foundation.md` as merged at `b703841`, with `docs/adr/0009-ios-companion-and-core.md`, `docs/specs/s90-ios-core-spike.md` and `docs/specs/s90-ios-core-spike-results.md`. S90's code is on the kept, unmerged branch `s90/ios-core-spike` at `0c06924`, under `spike/ios-core/`; the build prompt told Cursor to port from it. Design brief: none.
- Size: `git diff --shortstat origin/main...HEAD` gives 52 files, 22,838 insertions and 13 deletions. Of the new files, 27 are under `apps/ios/` and 13 under `tools/ios/` (`git diff --name-only --diff-filter=A origin/main...HEAD -- apps/ios`, and the same for `tools/ios`). The committed bundle `apps/ios/Keel/Resources/core.js` is 686,686 bytes and 19,209 lines (`wc -c -l`).
- Sensitive paths touched: `.github/workflows/verify.yml` and `AGENTS.md` (`git diff --name-only origin/main...HEAD -- .github AGENTS.md CLAUDE.md .claude .agents packages schemas tools/tripwire tools/reference fixtures docs/providers`), and the new `apps/ios/**` and `tools/ios/**`, which this PR adds to `AGENTS.md`'s list.
- Untouched, as the build prompt required: `git diff --name-only origin/main...HEAD -- packages schemas fixtures docs tools/reference tools/tripwire CHANGELOG.md README.md` prints nothing.
- Release: no. S91 is a non-release slice.
- New dependency: `esbuild` `0.28.2`, MIT, a development dependency of `@keel/ios-bundle` only, approved by Beni's ruling 4 in the spec.
- Bootstrap path: no. `verify` applies, and the new `swift` job is in it. Mutations apply to the five Highs below and to the guards. Pass M is N/A. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.

## Authorship record

From `git log --format='%h %an <%ae>' origin/main..HEAD` on PR #52's branch.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `819433e` | Cursor | Claude Code, Pass 1 |

## Fast-track

Not allowed. The PR touches sensitive paths.

## Beni's rulings

All given in the PM's session, which Pass 1 cannot see; the spec and `docs/reviews/pr-50-pass-1.5.md` record them with their questions.

- The spec's six rulings of 2026-11-16: "Yes, in parallel, as long as the slice stays narrow"; "S91"; "One screen"; "Approve" (esbuild); "Synthetic only" (the digest gate); and "Yes, keep required" (the `swift` job on `xcode-27`).
- 2026-11-16, at PR #50's Pass 3: "Yes (Recommended)", that the spec merges with F1 to F4 and R1 open and this build lands their failing-first tests.
- 2026-11-17: "Amend, then last round (Recommended)", after which the Pass 2.5 re-run's Y1 is this build review's list.
- 2026-11-16, the seat-record rulings: every pass's comment ends with one fenced `json` seat record, and the PM posts its own Pass 0 and Pass 1.5 records.

## What to check, beyond the skill's standing checks

1. **The five Highs from PR #50.** Under `AGENTS.md`'s Severity clause each closes only with a test that fails without its rule. Re-apply each mutant the body prints, and say whether the named test fails for that rule: F1 and F4 (criterion 5's render-model tests), F2 (criterion 7), F3 (criterion 3) and R1 (criterion 4). Is each of those tests one that runs in CI, so it keeps guarding after the merge?
2. **F2's per-rule property.** Criterion 7 needs each rule of the binary check to have a control that fails by that rule alone. The body's ablation table gives no command that reproduces it. Is the ablation in a test the `swift` job runs (`tools/ios/test/binary-check.test.mjs` is the one it names), or was it a one-off? Re-derive it for every rule: framework, the named APIs, `contentsOf:`, `ContentsOfURL`, `initWithURL:`, the URL selector and the URL argument.
3. **Y1.** Does the binary check fail any selector beginning `initWithURL:` whatever the allowlist says, with the wrong allowlist passed through to the rules rather than rejected up front?
4. **Criterion 5's other rules.** The body prints mutants for F1 and F4 only. Do the tests for unavailable reasons, each failure kind's message, the disclaimer in the first-run rows and in About, a storage failure surviving a new `SnapshotStore`, and the digest gate each fail when their rule is broken?
5. **Plants done by hand.** Criteria 2 and 6 are reported as one-off plants, one of them in `packages/core`'s `ruleFor` and then reverted. Which of them are automated tests that keep failing later (`tools/acceptance/test/copy-swift.test.mjs` has a `ruleFor` case on a scratch file), and does any guard rest only on a plant done once?
6. **The committed bundle.** Is `core.js` the esbuild output of `packages/core/src/index.ts` as merged, byte for byte on Linux and macOS, with no host shim? Do the tripwire, the import-boundary check (S90's Q6 found it reads text across the repo) and copy lint stay clean with it tracked?
7. **Parity, criterion 4.** The 33-file corpus; whether the in-memory dates the body lists are the cases `packages/core/src/schedule/schedule.calendar.test.ts` and `schedule.flags.test.ts` use; each engine's check that its locale resolved as asked; the reversed-comparator run; the scratch `localeCompare` bundle; and the one-byte foil.
8. **Storage.** Complete protection and backup exclusion read back on the temporary and the active file, a failure at each step keeping the previous file, name and import time, and the five failure kinds.
9. **The allowlist.** Does each entry carry a reason, is it what the one screen and the snapshot store need, and is nothing that must never be on it there? Does the binary check pass on both the Release and Verification binaries?
10. **Signing.** `apps/ios/Config.xcconfig` includes an optional `Local.xcconfig`. Does the signing check cover every planted form, including an included `.xcconfig`, and is nothing identifying committed?
11. **The bundled fixture.** `example-autocall.yaml` is in the app's Resources in every configuration, for the launch timing (`grep -c 'example-autocall.yaml in Resources' apps/ios/Keel.xcodeproj/project.pbxproj` prints `2`). Is that consistent with the spec, and can the screen ever show it?
12. **CI.** Does the `swift` job do what guard 4 says, in order, and does `verify` need it beside `cells`, with the needs check updated and tested?
13. **Copy and the disclaimer.** Does every string in `Copy.swift` pass `AGENTS.md`'s copy rules, and does the disclaimer appear where the spec says?
14. **Criterion 12's steps.** Are the device-run steps in the body complete and repeatable, and do the three fixture hashes match `shasum -a 256` at the head?

Out of scope: the device run, which is Beni's, and any change under `packages/`. A core change the review shows is needed goes to the ideas list or a Milestone 1 slice, as the spec's "Running alongside Milestone 1" says.

## Sealed appendix: builder claims to verify independently

These are claims, not facts. Re-derive each one; report any that do not reproduce.

| # | Claim (as the builder stated it) | Command the builder gave |
| --- | --- | --- |
| 1 | `origin/main` at the branch point is `e499e5f`, and the diff from the spec merge `b703841` lists only `docs/README.md` and files under `docs/reviews/` | `git diff --name-only b7038417447a5dc66e517c7dbc2997d2eee382c5 origin/main` |
| 2 | Only `Cursor cursoragent@cursor.com` authored commits | `git log --format='%an %ae' origin/main..HEAD` |
| 3 | esbuild is `0.28.2`, MIT | the `node --input-type=module` one-liner in the body's Dependency section |
| 4 | Install and verify exit 0 on Node 24.22.2 and 26.13.0, with the four new verify steps ok; core 178 tests in 16 files, plugin 212 in 12, tooling 135 in 17; `git status` clean after | `pnpm install --frozen-lockfile && pnpm verify` |
| 5 | The bundle is tracked and current, and one appended byte makes the determinism check fail with `apps/ios/Keel/Resources/core.js differs from a fresh build` | `git ls-files --error-unmatch`; `pnpm --filter @keel/ios-bundle build`; `node tools/fixtures/verify.mjs` |
| 6 | The bundle-imports check exits 0 on the real bundle, and its test fails each planted entry | `node tools/ios/bundle-imports.mjs .`; `tools/ios/test/bundle-imports.test.mjs` |
| 7 | `swift test` exits 0 with 16 tests and 0 failures, parity included | `swift test --package-path apps/ios/KeelCoreHost` |
| 8 | Each copy plant makes copy lint exit 1, and a planted `Text("hello")` makes the inline check exit 1 | `node tools/verify/one.mjs copy`; `node tools/ios/inline-check.mjs .` |
| 9 | The source check's test fails each banned form, `import PDFKit` included; the binary check exits 0 on the unsigned Release and Verification binaries; each built app's `core.js` equals the committed file | `tools/ios/test/source-check.test.mjs`; `node tools/ios/binary-check.mjs`; `cmp` |
| 10 | The signing check exits 0, its tests fail every planted form, and `Local.xcconfig` is ignored | `node tools/ios/signing-check.mjs .`; `git check-ignore -q apps/ios/Local.xcconfig` |
| 11 | Nothing under `packages`, `schemas` or `fixtures` changes | `git diff --name-only origin/main...HEAD -- packages schemas fixtures` |
| 12 | The tripwire exits 0 with no output, the bundle included | `node tools/tripwire/cli.mjs .` |
| 13 | All six checks succeed at `819433e`, `swift` and `verify` among them, in run 44242345278 | `gh api repos/BeniCheni/keel/commits/819433ef10a87e4fec27c44feb542ed4531fe9a3/check-runs` |
| 14 | F1's mutant fails `testFirstRunPlacesFileProviderTextBeforePickerAction` | the body's `perl` command, then `swift test --filter` |
| 15 | F4's two mutants fail `testGeneratedRowCarriesEstimate` and `testListedNullDateShowsNoDate` | the body's `perl` commands, then `swift test --filter` |
| 16 | F3's mutant fails `the bundle import check passes, then fails each planted entry` | the body's `perl` command, then `vitest run` on `bundle-imports.test.mjs` |
| 17 | F2's source mutant fails `the source check fails each banned form and an import that is not allowed` | the body's `perl` command, then `vitest run` on `source-check.test.mjs` |
| 18 | F2's binary ablation: with each of seven rules removed, one named control passes, and the app's own read passes with every rule present | none given: the body's table only |
| 19 | Y1: the `initWithURL:` rule counts every selector beginning `initWithURL:` whatever the allowlist says, and the wrong allowlist is passed into `evaluateBinary`, not rejected | the ablation table's `initWithURL` row |
| 20 | R1's mutant fails `testLocaleCompareScratchBundleDiffersOnTieInput`, and the committed bundle matches the oracle under the reversed comparator | the body's `perl` command, then `swift test --filter` |
| 21 | The three fixture hashes are `200ba5951b9a09853cbe6ff8e7c879d29bc8b7870ee377c30c6ebe7fd1ee5665` (`minimal.yaml`), `6215ee32b0fb9c3fc262bac8bdcd8b17050a4df5b47690d35ad79997b370c302` (`example-autocall.yaml`) and `57429d2148ace259202ced2324a84c48843dc87126f26f83d3f491e8ae62d99b` (`missing-required-top.yaml`) | `shasum -a 256` on the three fixture paths |
