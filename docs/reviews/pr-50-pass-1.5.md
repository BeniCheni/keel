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

## After Pass 2.5

Written by the PM on 2026-11-16 (America/New_York), after the Pass 2.5 synthesis ([issuecomment-6937655844](https://github.com/BeniCheni/keel/pull/50#issuecomment-6937655844)) at `1cb0f7a`: not mergeable, and the shadow gate would escalate, only because F1 to F4 and R1 stay open under `AGENTS.md`'s Severity clause. It found five new items, U1 to U5. The PM accepts all five and answers them in `869b71c`, which changes the spec and `docs/README.md` only. The PM reproduced U1 (`sed -n 3p docs/specs/s91-ios-foundation.md` at `1cb0f7a`), U2 (`sed -n 113p` of the same), U4 (below) and U5 (`git cat-file -e 1cb0f7a:docs/reviews/pr-50-pass-0.md` exits 128). U3 rests on the seat's runner sources.

| # | Pass 2.5 | PM disposition | In `869b71c` |
| --- | --- | --- | --- |
| U1 | Medium | Accept | The status line names the amendments after Pass 2's first two re-reads and after Pass 2.5 |
| U2 | Low | Accept | Criterion 5's closing note names all five open Highs, the criterion that closes each (F1 and F4 by criterion 5, F2 by 7, F3 by 3, R1 by 4), and Beni's ruling that the spec merges with them open |
| U3 | Medium | Accept | The Swift job says GitHub marks the `xcode-27` image a public preview, and what an outage does: `swift` fails or never starts, and every pull request waits until Beni merges a `verify.yml` change to a working label, or rules otherwise. A label that is not a preview replaces it the same way. Ruling 6 keeps the job required |
| U4 | Medium | Accept | The binary check also fails on any demangled symbol whose `contentsOf:` argument is a `Foundation.URL`, and on any Objective-C selector containing `ContentsOfURL`. Criterion 7 adds `String(contentsOf:encoding:)` and `NSData(contentsOf:)` as failing controls, a passing control that calls only `append(contentsOf:)` and `FileHandle(forReadingFrom:)`, and `append(contentsOf:)` as a planted source form. The source token is never narrowed |
| U5 | Low | Accept | The index row names all three records and says they stay on `docs/pr-50-records` until its records PR merges. PR #40, the last spec PR with records on their own branch, merged the same way (`git cat-file -e 883bdd1:docs/reviews/pr-40-pass-0.md` exits 128) |

**U4, reproduced and widened.** On the iPhoneOS 27.2 SDK, three scratch binaries were compiled for `arm64-apple-ios27.0` and never launched. `String(contentsOf:encoding:)` links `String.init(contentsOf: Foundation.URL, encoding:)`, which the five-API pattern matches 0 times. `NSData(contentsOf:)` links no `contentsOf` Swift symbol at all; its only trace is the selector string `initWithContentsOfURL:`. The rule `869b71c` writes fails both, and passes a binary that calls only `append(contentsOf:)` and `FileHandle(forReadingFrom:)`:

```sh
P="$(mktemp -d)" || exit; export CLANG_MODULE_CACHE_PATH="$P/cc"
sdk="$(xcrun --sdk iphoneos --show-sdk-path)" || exit
printf '%s\n' 'import Foundation' '_ = try? String(contentsOf: URL(fileURLWithPath: "synthetic"), encoding: .utf8)' > "$P/string.swift"
printf '%s\n' 'import Foundation' '_ = NSData(contentsOf: URL(fileURLWithPath: "synthetic"))' > "$P/nsdata.swift"
printf '%s\n' 'import Foundation' 'var bytes: [UInt8] = [1]' 'bytes.append(contentsOf: [2, 3])' 'if let h = try? FileHandle(forReadingFrom: URL(fileURLWithPath: "synthetic")) { _ = try? h.readToEnd() }' 'print(bytes)' > "$P/allowed.swift"
for f in string nsdata allowed; do
  swiftc -sdk "$sdk" -target arm64-apple-ios27.0 -module-cache-path "$P/mc" "$P/$f.swift" -o "$P/$f" || exit
  nm -u "$P/$f" | xcrun swift-demangle > "$P/$f.dm" || exit
  s=$(grep -c -E 'URLSession|Data\.init\(contentsOf:|_socket$|_connect$|_getaddrinfo$' "$P/$f.dm"); u=$(grep -c -E 'contentsOf: (__shared )?Foundation\.URL' "$P/$f.dm"); o=$(strings -a "$P/$f" | grep -c 'ContentsOfURL')
  echo "$f five=$s url-contentsOf=$u selector=$o"
done
```

It printed `string five=0 url-contentsOf=1 selector=0`, `nsdata five=0 url-contentsOf=0 selector=1` and `allowed five=0 url-contentsOf=0 selector=0`. The build writes its own check; this probe only shows that the rule can be met.

**Rulings from Beni, 2026-11-16, in the PM's session,** his Pass 3 answers to the seat's four questions:

1. "Yes (Recommended)", to "May PR #50 merge with F1–F4 and R1 open, with the build obligated to land criteria 3, 4, 5 and 7's tests?". Criterion 5's closing note records it.
2. "Yes, amend now (Recommended)", to whether the PM amends the spec for U1 to U5 before the merge: this section and `869b71c`.
3. "Yes, keep required (Recommended)", to whether the `swift` job on the `xcode-27` preview stays required on every pull request: the spec's ruling 6.
4. "Confirm (Recommended)", rulings 1 and 2: S91 is a non-release slice that builds alongside Milestone 1.

The records continue under ruling 7, "Repeat the pass": this answer posts as pass `"1.5"`, Codex's re-read as pass `"2"`, and the Pass 2.5 re-run as pass `"2.5"`, each carrying every finding id.

**Process notes for the records PR.** The Pass 2.5 seat's record gives its observed mode as the app's `auto` permission mode, against the requested `read-only`: the app has no read-only mode, and the seat made no commit. It ran `gh`, `git fetch` and `pnpm` with the sandbox off, because the sandbox's TLS interception broke `gh`. It reported its model and effort from its own transcript, so `elenchus check` raises no route flag for pass 2.5.

**Authorship record,** extended:

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `869b71c` | Claude | Codex, Pass 2's fourth re-read |

**What Pass 2's fourth re-read does.** Give `869b71c` its cold read (`git diff 1cb0f7a HEAD`), say with a command whether each of U1 to U5 closes, check that criterion 7's seven failing controls and its passing control can be built, and confirm with `git diff` that nothing else changed. Then the Pass 2.5 seat re-runs at the new head.

## After Pass 2's fourth re-read

Written by the PM on 2026-11-17 (America/New_York), after Codex's fourth re-read of Pass 2 ([issuecomment-6950911623](https://github.com/BeniCheni/keel/pull/50#issuecomment-6950911623)) at `869b71c`: not mergeable only because F1 to F4 and R1 stay open under `AGENTS.md`'s Severity clause, U1 to U5 fixed, and three new Mediums, V1 to V3. The PM accepts all three. V1 is answered on this branch in `7ab320f`, which adds `docs/reviews/pr-50-pass-2.5.md`, the Pass 2.5 seat's executive brief as it gave it in its chat. V2 and V3 are answered in `6279d03`, which changes the spec only. The PM reproduced V1 (`git cat-file -e aa2f208:docs/reviews/pr-50-pass-2.5.md` exits 128, and exits 0 at `7ab320f`) and V2 (the probe below). V3 follows from the spec's own SDK check: an image change that keeps an iOS 27 SDK passes it.

| # | Fourth re-read | PM disposition | Answer |
| --- | --- | --- | --- |
| V1 | Medium | Accept | `7ab320f` on `docs/pr-50-records` adds the Pass 2.5 executive brief, so the index row's pointer resolves on this branch. The Pass 2.5 re-run's brief follows in the same file |
| V2 | Medium | Accept | In `6279d03`, both network checks work from one allowlist in `tools/ios/`: the modules the app may import, the frameworks it may link, and the selectors and symbols naming a URL that it may use, each with a reason. The five named APIs, a `contentsOf:` reader, a `ContentsOfURL` selector and any selector beginning `initWithURL:` never go on it. The source check also fails on an `import` not on the list, and the overclaim about the `contentsOf` token is gone. Criterion 7 adds `PDFDocument(url:)`, `InputStream(url:)` and `NSAttributedString(url:options:documentAttributes:)` as failing controls and `import PDFKit` as a planted source form |
| V3 | Medium | Accept | In `6279d03`, the outage paragraph names only an image that breaks, is withdrawn, or changes so that the job cannot start or its SDK check fails |

**V2, reproduced, and the new rule checked.** On the iPhoneOS 27.2 SDK, a scratch binary calling `PDFDocument(url:)` matched none of the source tokens or binary patterns at `869b71c`; its only traces are the linked PDFKit framework and the selector `initWithURL:`, which `InputStream(url:)` sends too. The script below applies the rule `6279d03` writes, with a starting allowlist of `Foundation`, `SwiftUI`, `JavaScriptCore` and `UniformTypeIdentifiers` and the one selector `fileHandleForReadingFromURL:error:`. It compiles each control for `arm64-apple-ios27.0` and never launches it. Each of the ten failing controls exits 1, and the app's own read exits 0:

```sh
P="$(mktemp -d)" || exit; export CLANG_MODULE_CACHE_PATH="$P/cc"
sdk="$(xcrun --sdk iphoneos --show-sdk-path)" || exit
src() { printf '%s\n' "import $2" "$3" > "$P/$1.swift"; }
src urlsession Foundation '_ = URLSession.shared'
src data Foundation '_ = try? Data(contentsOf: URL(fileURLWithPath: "synthetic"))'
src socket Foundation '_ = socket(0, 0, 0)'
src connect Foundation 'var a = sockaddr(); _ = connect(0, &a, socklen_t(MemoryLayout<sockaddr>.size))'
src getaddrinfo Foundation 'var r: UnsafeMutablePointer<addrinfo>?; _ = getaddrinfo(nil, nil, nil, &r)'
src string Foundation '_ = try? String(contentsOf: URL(fileURLWithPath: "synthetic"), encoding: .utf8)'
src nsdata Foundation '_ = NSData(contentsOf: URL(fileURLWithPath: "synthetic"))'
src pdf PDFKit '_ = PDFDocument(url: URL(fileURLWithPath: "synthetic"))'
src stream Foundation '_ = InputStream(url: URL(fileURLWithPath: "synthetic"))'
src attr UIKit '_ = try? NSAttributedString(url: URL(fileURLWithPath: "synthetic"), options: [:], documentAttributes: nil)'
printf '%s\n' 'import Foundation' 'var b: [UInt8] = [1]' 'b.append(contentsOf: [2])' 'if let h = try? FileHandle(forReadingFrom: URL(fileURLWithPath: "synthetic")) { _ = try? h.readToEnd() }' 'print(b)' > "$P/allowed.swift"
fw_ok='^(Foundation|SwiftUI|JavaScriptCore|UniformTypeIdentifiers)$'; sel_ok='^fileHandleForReadingFromURL:error:$'
for f in urlsession data socket connect getaddrinfo string nsdata pdf stream attr allowed; do
  swiftc -sdk "$sdk" -target arm64-apple-ios27.0 -module-cache-path "$P/mc" "$P/$f.swift" -o "$P/$f" 2>/dev/null || { echo "$f: compile failed"; exit 1; }
  nm -u "$P/$f" | xcrun swift-demangle > "$P/$f.dm" || exit
  xcrun otool -L "$P/$f" > "$P/$f.L" || exit
  xcrun otool -v -s __TEXT __objc_methname "$P/$f" > "$P/$f.sel" || exit
  fw=$(awk 'NR>1{print $1}' "$P/$f.L" | grep '\.framework/' | sed 's|.*/||' | grep -c -v -E "$fw_ok")
  five=$(grep -c -E 'URLSession|Data\.init\(contentsOf:|_socket$|_connect$|_getaddrinfo$' "$P/$f.dm")
  cof=$(grep -c -E 'contentsOf: (__shared )?Foundation\.URL' "$P/$f.dm")
  curl=$(grep -c 'ContentsOfURL' "$P/$f.sel")
  usel=$(grep -o '[A-Za-z0-9_:]*URL[A-Za-z0-9_:]*' "$P/$f.sel" | sort -u | grep -c -v -E "$sel_ok")
  usym=$(grep -c -E '\([^)]*Foundation\.URL' "$P/$f.dm")
  n=$((fw + five + cof + curl + usel + usym))
  echo "$f fw=$fw five=$five contentsOf=$cof ContentsOfURL=$curl url-selector=$usel url-symbol=$usym -> $([ $n -gt 0 ] && echo exit 1 || echo exit 0)"
done
```

It printed, from `bash` with the sandbox off between 2026-11-17T14:46:15Z and 14:46:21Z:

```text
urlsession fw=1 five=1 contentsOf=0 ContentsOfURL=0 url-selector=0 url-symbol=0 -> exit 1
data fw=0 five=1 contentsOf=1 ContentsOfURL=0 url-selector=0 url-symbol=1 -> exit 1
socket fw=0 five=1 contentsOf=0 ContentsOfURL=0 url-selector=0 url-symbol=0 -> exit 1
connect fw=0 five=1 contentsOf=0 ContentsOfURL=0 url-selector=0 url-symbol=0 -> exit 1
getaddrinfo fw=0 five=1 contentsOf=0 ContentsOfURL=0 url-selector=0 url-symbol=0 -> exit 1
string fw=0 five=0 contentsOf=1 ContentsOfURL=0 url-selector=0 url-symbol=1 -> exit 1
nsdata fw=1 five=0 contentsOf=0 ContentsOfURL=1 url-selector=1 url-symbol=0 -> exit 1
pdf fw=2 five=0 contentsOf=0 ContentsOfURL=0 url-selector=1 url-symbol=0 -> exit 1
stream fw=1 five=0 contentsOf=0 ContentsOfURL=0 url-selector=1 url-symbol=0 -> exit 1
attr fw=1 five=0 contentsOf=0 ContentsOfURL=0 url-selector=1 url-symbol=0 -> exit 1
allowed fw=0 five=0 contentsOf=0 ContentsOfURL=0 url-selector=0 url-symbol=0 -> exit 0
```

`InputStream(url:)` and `NSAttributedString(url:options:documentAttributes:)` fail on the selector rule even where their frameworks would be allowed, so the framework list is not their only guard. The build writes its own check and its own allowlist; this probe only shows that the rule can be met.

**Ruling from Beni, 2026-11-17, in the PM's session:** "Amend now (Recommended)", to "Amend again, or make this the last round?", asked after V2 and V3.

**Process notes for the records PR.** Codex's fourth re-read read two public search snippets outside the sources its prompt allowed, and said so in its comment; it rests no finding on them. The PM's scratch folder was cleared overnight on 16 to 17 Nov 2026; nothing pushed was lost, and the PM rebuilt its `elenchus` config and tripwire counter from its transcript.

**Authorship record,** extended:

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `6279d03` | Claude | Codex, Pass 2's fifth re-read |

`7ab320f` is on `docs/pr-50-records`, not in PR #50; its records PR gets its own cold read.

**What Pass 2's fifth re-read does.** Give `6279d03` its cold read (`git diff 869b71c HEAD`), say with a command whether V1 (on this branch), V2 and V3 close, check that criterion 7's ten failing controls and its passing control behave as the rule says, and confirm with `git diff` that nothing else changed. Then the Pass 2.5 seat re-runs at the new head.

## After Pass 2's fifth re-read

Written by the PM on 2026-11-17 (America/New_York), after Codex's fifth re-read of Pass 2 ([issuecomment-6954772033](https://github.com/BeniCheni/keel/pull/50#issuecomment-6954772033)) at `6279d03`: not mergeable only because F1 to F4 and R1 stay open under `AGENTS.md`'s Severity clause, V1 to V3 fixed, and two new Mediums, W1 and W2. The PM accepts both. W1 is answered in `51cd526`, which changes criterion 7 and the status line of the spec only. W2 is answered here, with no file change. The PM reproduced W1 and found it wider (below), and read W2 in the archived brief (`git show 93a0141:docs/reviews/pr-50-pass-2.5.md | grep -n 're-ran every number'`).

| # | Fifth re-read | PM disposition | Answer |
| --- | --- | --- | --- |
| W1 | Medium | Accept | In `51cd526`, each rule of the binary check has a control that fails by that rule alone: `socket`, `connect` and `getaddrinfo` for the named APIs; `PDFDocument()` with no URL for the framework rule; `URLComponents(url:resolvingAgainstBaseURL:)` for the `Foundation.URL`-argument rule; `FileManager.contentsOfDirectory(at:includingPropertiesForKeys:)` for the URL-selector rule; and `String(contentsOf:encoding:)`, `NSData(contentsOf:)` and `InputStream(url:)`, against a scratch allowlist that wrongly lists them, for the `contentsOf:`, `ContentsOfURL` and `initWithURL:` rules. `UIApplication.shared.open(_:)` joins the other failing controls |
| W2 | Medium | Accept | The archived brief stays as the seat wrote it. Its proposed squash text says the Pass 2.5 seat re-ran every number, while the same brief labels Codex's compiled probes, F3's esbuild probe and R1's JavaScriptCore run as Codex's claims, not re-run. That squash text is superseded: the Pass 2.5 re-run writes the squash text the PM's handoff uses, and it says which numbers were re-run and which are a vendor's claim |

**W1, reproduced and widened.** Codex found that dropping the framework rule or the URL-argument rule left every control's result unchanged. Run on the ten controls `6279d03` named, the script below shows that only `socket`, `connect` and `getaddrinfo` fail by one rule alone; each of the other seven fails by two or more. So dropping any rule except the named-API rule went unnoticed. The script compiles each control for `arm64-apple-ios27.0` on the iPhoneOS 27.2 SDK and never launches it. The committed allowlist in it is `Foundation`, `CoreFoundation`, `SwiftUI`, `UIKit`, `JavaScriptCore` and `UniformTypeIdentifiers`, plus the one selector `fileHandleForReadingFromURL:error:`. The "wrong" allowlist also lists `String.init(contentsOf:…)`, `initWithContentsOfURL:` and any `initWithURL:…` selector. For each control it names the one rule that fails it alone, if there is one. It exits 1 if any rule has no such control:

```sh
P="$(mktemp -d)" || exit; export CLANG_MODULE_CACHE_PATH="$P/cc"
sdk="$(xcrun --sdk iphoneos --show-sdk-path)" || exit
src() { printf '%s\n' "import $2" "$3" > "$P/$1.swift"; }
U='URL(fileURLWithPath: "synthetic")'
src socket Foundation '_ = socket(0, 0, 0)'
src connect Foundation 'var a = sockaddr(); _ = connect(0, &a, socklen_t(MemoryLayout<sockaddr>.size))'
src getaddrinfo Foundation 'var r: UnsafeMutablePointer<addrinfo>?; _ = getaddrinfo(nil, nil, nil, &r)'
src pdfnourl PDFKit '_ = PDFDocument()'
src components Foundation "_ = URLComponents(url: $U, resolvingAgainstBaseURL: false)"
src listdir Foundation "_ = try? FileManager.default.contentsOfDirectory(at: $U, includingPropertiesForKeys: nil)"
src string Foundation "_ = try? String(contentsOf: $U, encoding: .utf8)"
src nsdata Foundation "_ = NSData(contentsOf: $U)"
src stream Foundation "_ = InputStream(url: $U)"
src urlsession Foundation '_ = URLSession.shared'
src data Foundation "_ = try? Data(contentsOf: $U)"
src pdfurl PDFKit "_ = PDFDocument(url: $U)"
src attr UIKit "_ = try? NSAttributedString(url: $U, options: [:], documentAttributes: nil)"
src openurl UIKit "UIApplication.shared.open($U)"
printf '%s\n' 'import Foundation' 'var b: [UInt8] = [1]' 'b.append(contentsOf: [2])' "if let h = try? FileHandle(forReadingFrom: $U) { _ = try? h.readToEnd() }" 'print(b)' > "$P/allowed.swift"
fw_ok='^(Foundation|CoreFoundation|SwiftUI|UIKit|JavaScriptCore|UniformTypeIdentifiers)$'
rules() { f=$1; so='^fileHandleForReadingFromURL:error:$'; sy='^$'
  if [ "$2" = wrong ]; then so='^(fileHandleForReadingFromURL:error:|initWithContentsOfURL:|initWithURL:.*)$'; sy='String\.init\(contentsOf:'; fi
  echo "fw=$(awk 'NR>1{print $1}' "$P/$f.L" | grep '\.framework/' | sed 's|.*/||' | grep -c -v -E "$fw_ok")" \
    "named=$(grep -c -E 'URLSession|Data\.init\(contentsOf:|_socket$|_connect$|_getaddrinfo$' "$P/$f.dm")" \
    "contentsOf=$(grep -c -E 'contentsOf: (__shared )?Foundation\.URL' "$P/$f.dm")" \
    "ContentsOfURL=$(grep -c 'ContentsOfURL' "$P/$f.sel")" \
    "initWithURL=$(grep -o '[A-Za-z0-9_:]*URL[A-Za-z0-9_:]*' "$P/$f.sel" | sort -u | grep -c '^initWithURL:')" \
    "url-selector=$(grep -o '[A-Za-z0-9_:]*URL[A-Za-z0-9_:]*' "$P/$f.sel" | sort -u | grep -v -E "$so" | grep -c .)" \
    "url-symbol=$(grep -E '\([^)]*Foundation\.URL' "$P/$f.dm" | grep -c -v -E "$sy")"; }
fails() { n=0; for kv in $1; do [ "${kv%%=*}" = "$2" ] && continue; n=$((n + ${kv#*=})); done; [ $n -gt 0 ] && echo 1 || echo 0; }
for f in socket connect getaddrinfo pdfnourl components listdir string nsdata stream urlsession data pdfurl attr openurl allowed; do
  swiftc -sdk "$sdk" -target arm64-apple-ios27.0 -module-cache-path "$P/mc" "$P/$f.swift" -o "$P/$f" 2>/dev/null || { echo "$f: compile failed"; exit 1; }
  nm -u "$P/$f" | xcrun swift-demangle > "$P/$f.dm" || exit
  xcrun otool -L "$P/$f" > "$P/$f.L" || exit
  xcrun otool -v -s __TEXT __objc_methname "$P/$f" > "$P/$f.sel" || exit
done
caught=""
run() { f=$1; list=$2; r=$(rules $f $list); e=$(fails "$r" none); alone=""
  for kv in $r; do k=${kv%%=*}; [ "$(fails "$r" $k)" = 0 ] && [ "$e" = 1 ] && alone=$k; done
  [ -n "$alone" ] && caught="$caught $alone"
  echo "$f ($list allowlist): exit $e${alone:+, by $alone alone}"; }
for f in socket connect getaddrinfo pdfnourl components listdir string nsdata stream urlsession data pdfurl attr openurl allowed; do run $f committed; done
for f in string nsdata stream; do run $f wrong; done
for k in fw named contentsOf ContentsOfURL initWithURL url-selector url-symbol; do
  case " $caught " in *" $k "*) echo "rule $k: a control fails by it alone" ;; *) echo "rule $k: NO isolated control"; bad=1 ;; esac
done
[ -z "${bad:-}" ]
```

It printed, from `bash` with the sandbox off between 2026-11-17T17:01:36Z and 17:01:44Z, and exited 0:

```text
socket (committed allowlist): exit 1, by named alone
connect (committed allowlist): exit 1, by named alone
getaddrinfo (committed allowlist): exit 1, by named alone
pdfnourl (committed allowlist): exit 1, by fw alone
components (committed allowlist): exit 1, by url-symbol alone
listdir (committed allowlist): exit 1, by url-selector alone
string (committed allowlist): exit 1
nsdata (committed allowlist): exit 1
stream (committed allowlist): exit 1
urlsession (committed allowlist): exit 1
data (committed allowlist): exit 1
pdfurl (committed allowlist): exit 1
attr (committed allowlist): exit 1
openurl (committed allowlist): exit 1, by url-selector alone
allowed (committed allowlist): exit 0
string (wrong allowlist): exit 1, by contentsOf alone
nsdata (wrong allowlist): exit 1, by ContentsOfURL alone
stream (wrong allowlist): exit 1, by initWithURL alone
rule fw: a control fails by it alone
rule named: a control fails by it alone
rule contentsOf: a control fails by it alone
rule ContentsOfURL: a control fails by it alone
rule initWithURL: a control fails by it alone
rule url-selector: a control fails by it alone
rule url-symbol: a control fails by it alone
```

`openurl` fails by the URL-selector rule alone only while `UIKit` is on the allowlist; `listdir` needs only `Foundation`, so it is the control the criterion relies on. The build writes its own check and allowlist; this probe only shows that the criterion can be met.

**Ruling from Beni, 2026-11-17, in the PM's session:** "Amend, then last round (Recommended)", to how the round after W1 ends. `51cd526` answers W1; Codex's sixth re-read is the last spec round, and anything it finds goes on the S91 build review's list, as PR #32's ruling 7 did; then the Pass 2.5 re-run, and Beni's merge.

**Process notes for the records PR.** The required `verify` check failed at `6279d03` because its macOS Node 26 cell never got a hosted runner ([run 44114059557](https://github.com/BeniCheni/keel/actions/runs/44114059557)); the four other cells passed, and the push of `51cd526` runs CI again. Codex's fifth re-read read `AGENTS.md` in a separate preflight clone before its fresh clone, and said so.

**Authorship record,** extended:

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `51cd526` | Claude | Codex, Pass 2's sixth re-read |

**What Pass 2's sixth re-read does.** It is the last spec round, by Beni's ruling. Give `51cd526` its cold read (`git diff 6279d03 HEAD`), say with a command whether W1 closes and whether W2's answer holds, and confirm with `git diff` that nothing else changed. Anything new goes on the S91 build review's list, not into another amendment. Then the Pass 2.5 seat re-runs at the head.
