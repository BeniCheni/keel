# Pass 1.5 brief: PR #50

Written by the PM on 2026-11-16 (America/New_York), after reading Codex's Pass 1, the plan challenge ([issuecomment-6930324512](https://github.com/BeniCheni/keel/pull/50#issuecomment-6930324512)), at `97d8457`. Pass 1 found the spec not mergeable, with 4 Highs, 11 Mediums and a Low. The PM accepts all 16 and answers them in one commit, `0e8c5d1`, which changes the spec, ADR-0009's amendment line and `docs/README.md`. No finding needs Beni's ruling: each one tightens the spec inside rulings 1 to 4, one screen plus ADR-0009's guards. Codex receives this brief for Pass 2.

"Reproduced" means the PM ran a command in this session and saw the defect. "Read" means the PM read Pass 1's evidence and the cited lines and accepts them without re-running Pass 1's probes, which Pass 2 re-derives.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| F1 | High | Accept | **Read.** "Nothing leaves the phone" was wider than the app controls, because the Files picker can hand over a file a cloud provider downloads. The first-run text now covers the app's own storage and requests only, and names the provider's role before the picker opens | no |
| F2 | High | Accept | **Read.** A URL-taking Foundation read slipped past the six names. The app now reads only through the picker's security-scoped file URL with `FileHandle(forReadingFrom:)`, and the network check bans `contentsOf:` and `URL(string:` as well | no |
| F3 | High | Accept | **Read.** Externals do not appear as metafile inputs. The check now fails on any import record marked external, and acceptance criterion 3 plants `fs`, `node:fs` and a `plugin-mln` import against a passing baseline | no |
| F4 | High | Accept | **Reproduced.** `sed -n 23,52p packages/core/src/schedule/types.ts` shows `GeneratedEntry` with `label: "ESTIMATE"` and `ListedEntry` with `date: string \| null` and a `term`, and no `origin` or `flags`; S02's Goal tags each generated date ESTIMATE. The screen now renders each kind as its type defines it, and the render model's tests guard both rules | no |
| F5 | Medium | Accept | **Read.** ADR-0009's amendment now records the terms file as an interim data path until the export slice, and the screen's first section says no observation, close or alert came with it | no |
| F6 | Medium | Accept | **Read.** The screen gains a named About section holding the disclaimer, and the render model's tests check it and the first-run rows | no |
| F7 | Medium | Accept | **Reproduced.** `sed -n 3,7p packages/core/src/terms/summary.ts` shows `verified`, `total` and `unverified` only. The stories line now claims 3.1's summary half and a foundation subset of 9.1's import | no |
| F8 | Medium | Accept | **Read.** The spec now names five failure kinds, each with a `Copy.swift` message and the previous snapshot kept across relaunch, and requires the exact attribute values on the temporary and the active file | no |
| F9 | Medium | Accept | **Read.** Criterion 2 now requires the bundle to be tracked (`git ls-files --error-unmatch`) and the path clean after a rebuild (`git status --porcelain --untracked-files=all`), and the determinism registration builds by a synchronous subprocess whose failure fails the check | no |
| F10 | Medium | Accept | **Read.** Criterion 4 now names the Node oracle (the TypeScript entry, the same serialization and order), the 33-file corpus, in-memory listed and calendar cases, S90's locale checks and tie input, and a planted-mismatch control | no |
| F11 | Medium | Accept | **Read.** The Swift job now selects an Xcode with an iOS 27.0 or later SDK or fails by name, installs the locked Node dependencies for the oracle, compares the built app's `core.js` with the committed file, and joins the aggregate `verify` job's needs | no |
| F12 | Medium | Accept | **Read.** The sensitive list adds the Xcode project, `apps/ios/Keel/Snapshot/**` (the import, storage and bridge code) and `tools/ios/**` (the guards) | no |
| F13 | Medium | Accept | **Read.** Criterion 8 is now a signing check with planted controls for inline, quoted, conditional and included-`.xcconfig` settings, and every criterion fails on a command error | no |
| F14 | Medium | Accept | **Read.** Criterion 12 now pins the fixtures, the signed Release build, five fresh launches, S90's measurement boundaries, strict "under the limit", and the stored file's SHA-256 and attributes after each import | no |
| F15 | Medium | Accept | **Read.** Core diagnostics and schedule reasons now map by code to `Copy.swift` strings, terms values are data outside copy lint, and an inline-string check fails on a literal in a SwiftUI view outside `Copy.swift` | no |
| F16 | Low | Accept | **Reproduced.** `git show 97d8457:docs/README.md \| grep -c 'S91'` prints `0`. `docs/README.md` now indexes S91, and its ADR line names the amendment | no |

## Authorship record

The Pass 0 record, extended with the fix commit.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `97d8457` | Claude | Codex, Pass 1 |
| `0e8c5d1` | Claude | Codex, Pass 2 |

## Rulings from Beni

None since Pass 0. The seven of 2026-11-16 stand as `docs/reviews/pr-50-pass-0.md` records them.

## What Pass 2 does

1. Re-derive each of the 16 findings against `97d8457` and say whether `0e8c5d1` closes it, with a command.
2. Read `0e8c5d1` in full as the cold read of the PM's fix, against AGENTS.md, ADR-0009, S90's spec and results, S02's spec and the core's types, and report anything it gets wrong or newly overstates.
3. **The Swift job's toolchain.** Is an Xcode whose iOS SDK is 27.0 or later installed on GitHub's macOS runner images that `verify.yml` can select? If none is, the `swift` job cannot pass as specified, and that is a finding against the plan, not the build.
4. Report any requirement the fix added that is not needed for the one screen or a guard ADR-0009 lists.

## Sealed appendix for Pass 2

Pass 1's findings and the PM's fixes are suspicions to re-derive, not conclusions. Codex reproduces or disproves each one independently and adds its own read. The PM's new claims in `0e8c5d1`:

| # | Claim | Command |
| --- | --- | --- |
| 1 | `fixtures/synthetic/terms/` holds 33 `.yaml` files at `5069a34` | `git ls-tree -r --name-only 5069a34 fixtures/synthetic/terms` |
| 2 | A core `Diagnostic` carries a `code`, `line` and `message` | `sed -n 99,105p packages/core/src/terms/types.ts` |
| 3 | Schedule `unavailable` reasons carry a `code` | `sed -n 59,64p packages/core/src/schedule/types.ts` |
| 4 | `schedule.flags.test.ts` covers weekend and outside-calendar flags, and `schedule.calendar.test.ts` covers holidays | `grep -c -i weekend packages/core/src/schedule/schedule.flags.test.ts`; `grep -c -i outside-calendar packages/core/src/schedule/schedule.flags.test.ts`; `grep -c -i holiday packages/core/src/schedule/schedule.calendar.test.ts` |
| 5 | `missing-required-top.yaml` is a tracked invalid fixture | `git ls-files fixtures/synthetic/terms/invalid` |

## After Pass 2

Written by the PM on 2026-11-16 (America/New_York), after Codex's Pass 2 ([issuecomment-6935224748](https://github.com/BeniCheni/keel/pull/50#issuecomment-6935224748)) at `0e8c5d1`: not mergeable, with F5, F6, F7, F9, F10 and F16 fixed, the other ten open, and four new Mediums, N1 to N4. The PM accepts every open item and answers them in `47bbbdd`. Pass 2's own commands are its evidence; the PM reproduced none of its probes.

| # | Pass 2 | PM disposition | In `47bbbdd` |
| --- | --- | --- | --- |
| F1 | open | Accept | The render model's tests check the file-provider text before the picker's action |
| F2 | open | Accept | A whitespace-blind source check that adds `Darwin` and `socket`, and a binary undefined-symbol check in the Swift job |
| F3, F4 | open | Accept as spec text; the tests land in the build | Criteria 3 and 5 name the failing-first tests. As on PR #28 and PR #32, a spec PR cannot carry a test, so these Highs stay open under `AGENTS.md`'s Severity clause until the build lands them, and merging with them open is Beni's ruling at Pass 3 |
| F8 | open | Accept | A `SnapshotStore` in `KeelCoreHost` with injectable file operations, and a relaunch test for a failure at each step |
| F11 | open | Accept | `runs-on: xcode-27`, and criterion 11 reads the check runs by the head SHA |
| F12 | open | Accept | All of `apps/ios/**` is sensitive |
| F13 | open | Accept | The signing check also fails on a tracked `.mobileprovision` file and on a device identifier |
| F14 | open | Accept | One record per launch with a counter, process ID and both timings, and a successful replacement in the device run |
| F15 | open | Accept | Copy lint reads every Swift string literal under `apps/ios/` |
| N1 | new | Accept | S90's reversed-comparator run is kept in criterion 4 |
| N2 | new | Accept | Copy lint reads `ruleFor`'s literals in `packages/core/src/schedule/schedule.ts`, and the screen shows the rule as the core gives it |
| N3 | new | Accept | Every `unavailable` reason is shown in order with its path or date |
| N4 | new | Accept | The device run imports `minimal.yaml` for an estimated schedule before `example-autocall.yaml` |

**Rulings from Beni, 2026-11-16, in the PM's session.** "Synthetic only (Recommended)", to Pass 2's question whether the stored file's SHA-256 is logged only for the synthetic device verification: the spec's ruling 5. "Repeat the pass (Recommended)", to how the records go before Pass 2.5: this answer posts as pass `"1.5"` and Codex's re-read as pass `"2"`, each carrying every finding id; `elenchus` flags the repeats until it gains a re-read value.

**Authorship record,** extended:

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `47bbbdd` | Claude | Codex, Pass 2's re-read |

**What Pass 2's re-read does.** Re-derive each of F1 to F16 and N1 to N4 against `47bbbdd` with a command; give `47bbbdd` its cold read; check that `xcode-27` is a label a workflow in this repository can use; and name any requirement added beyond the one screen and ADR-0009's guards.

## After Pass 2's re-read

Written by the PM on 2026-11-16 (America/New_York), after Codex's re-read of Pass 2 ([issuecomment-6935881288](https://github.com/BeniCheni/keel/pull/50#issuecomment-6935881288)) at `47bbbdd`: not mergeable, with F1 to F4 open until the build lands their tests, N1 open, every other earlier finding fixed, and four new findings, R1 to R4. The PM accepts them and answers them in `9c2a905`. The PM reproduced R4 (`grep -n 'four rulings' docs/specs/s91-ios-foundation.md` at `47bbbdd` printed the status line); the rest rest on Pass 2's re-read.

| # | Re-read | PM disposition | In `9c2a905` |
| --- | --- | --- | --- |
| R1 (High), N1 | open | Accept | Criterion 4 requires the bundle as built to match the oracle under the reversed comparator, and a scratch bundle with `localeCompare` put back in `dedupe` to differ on the tie input |
| R2 | new | Accept | The binary network check has two separately compiled controls, each calling one API, and each must fail it |
| R3 | new | Accept | Ruling 5's digest is gated by the three fixtures' own SHA-256: any other bytes log no digest. A unit test and a fourth synthetic file in the device run check it |
| R4 | new | Accept | The spec counts five rulings, and the PR body is corrected in the same edit as this record |

R1 is a High in spec text. Like F1 to F4, it closes when the build lands criterion 4's test, which fails without it.

**Authorship record,** extended:

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `9c2a905` | Claude | Codex, Pass 2's second re-read |

**What Pass 2's second re-read does.** Re-derive F1 to F16, N1 to N4 and R1 to R4 against `9c2a905` with a command, give `9c2a905` its cold read, and name any requirement it added beyond the one screen and ADR-0009's guards.

## After Pass 2's second re-read

Written by the PM on 2026-11-16 (America/New_York), after Codex's second re-read of Pass 2 ([issuecomment-6936488699](https://github.com/BeniCheni/keel/pull/50#issuecomment-6936488699)) at `9c2a905`: not mergeable, with F1 to F4 and R1 open until the build lands their tests, every other finding fixed, and one new Medium, S1. The PM accepts S1 and answers it in `1cb0f7a`: criterion 7 now compiles one scratch binary per named network symbol (`URLSession`, `Data(contentsOf:)`, `socket`, `connect`, `getaddrinfo`), each of which must fail the binary check. The PM did not re-run Codex's compiled probes.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `1cb0f7a` | Claude | Codex, Pass 2's third re-read |

**What Pass 2's third re-read does.** Give `1cb0f7a` its cold read, say whether S1 closes, and confirm the other findings stand as the second re-read left them.
