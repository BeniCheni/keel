# Pass 1.5 brief: PR #52 (S91 iOS foundation build)

Written by the PM on 2026-11-18 (America/New_York). It follows Pass 1's comment ([issuecomment-6986672668](https://github.com/BeniCheni/keel/pull/52#issuecomment-6986672668), posted at 12:44:54 EST; reviewed head `819433e`, post-fix head `65f4c26`) and Beni's rulings below. Like the Pass 0 brief, it lives on the records branch `docs/pr-52-records`, so that no PM commit enters PR #52.

Pass 1's verdict is not mergeable, with two open Highs. The PM accepts all 18 of Pass 1's findings, and its dispositions of PR #50's five Highs and Y1, and contests none:
- **B1 and B2,** the open Highs, need redesign. They go to Cursor as rework, under Beni's rulings 1 to 3.
- **B15 and B18** fold into B1's rework. **PM1,** a lead the PM found while reproducing B2, folds into B2's.
- **B3 to B10 and B13** are closed by Pass 1's two commits, which Codex cold-reads at Pass 2.
- **B11, B12 and B14** stay open. B12 is the PR body, which Cursor updates with the rework; B11 waits on Beni's device run; B14 is a patch for Pass 2.
- **B16 and B17** are Lows for the ideas list.

**Addendum, 2026-11-18, 14:32 EST.** By Beni's ruling 4, Codex builds the rework instead of Cursor. The addendum at the end of this brief gives the seat and what changes. Where it differs from the text above, the addendum wins.

**Second to seventh addenda.** The second, at 14:56 EST, gives ruling 5. The third, at 19:28 EST, records the fresh Pass 1, rulings 6 to 8 and the C findings, and replaces "What Pass 2 does". The fourth, on 2026-11-19, records Pass 2, rulings 9 to 12 and D3's fix, and replaces "What Pass 2.5 does". The fifth records Pass 2.5, rulings 13 to 17 and the E round. The sixth records the Pass 2.5 re-run, E5, and rulings 18 and 19. The seventh records the second Pass 2.5 re-run, E6 and E7, and ruling 20.

## Order from here

1. **Rework,** by Cursor on Grok 4.7 Extra High, because the slice touches sensitive paths. The PM gives the rework prompt in chat. It builds on branch `s91/ios-foundation` from `65f4c26`.
2. **A fresh Pass 1,** by Claude Code on Fable 5.2 Extra in a new session, with Opus 5.5 High as the fallback. It is the cold read of Cursor's rework commits, as the Pass 1.5 template says: rework gets its own short build prompt and a fresh Pass 1.
3. **A short Pass 1.5 addendum** by the PM on this branch, for that pass's findings.
4. **Pass 2,** Codex on GPT-6.1 Sol Extra High, over the whole PR.
5. **Pass 2.5,** a fresh Claude session on Fable 5.2 High. Then Beni's rulings, his device run (criterion 12) at the final head, and his merge.

Beni's device run can start earlier. Step 1 at `65f4c26` settles B11, and the rework leaves the picker alone.

## Per finding

Line numbers are at `819433e` unless a commit is named. "Not re-run by the PM" means the PM read Pass 1's evidence and found its closing test at `65f4c26`, and Pass 2 re-derives it. Each named Swift test prints 1 from `git grep -c 'func <name>(' 65f4c26 -- apps/ios`. Each named Node test title prints 1 from `git grep -F -c '<title>' 65f4c26 -- tools`.

| Pass 1 # | Severity | PM disposition | Reason | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 50-F1 | High | Accept, closed | Pass 1 re-applied the body's mutant. `testFirstRunPlacesFileProviderTextBeforePickerAction` fails under it and runs in the `swift` job. Not re-run by the PM | no |
| 50-F2 | High | Accept, closed by `5ed2b7c` | At `819433e`, the tokens `Darwin` and `socket` each survived deletion, and the binary-control test passed with no SDK (B5, B6). `5ed2b7c` gives each token its own control and requires the SDK in the `swift` job. Pass 1's per-rule table shows each of the seven binary rules failing its own control, automated in `each binary rule fails its own control`. Ruling 1 widens this guard, and the rework keeps all of these controls | no |
| 50-F3 | High | Accept, closed | `the bundle import check passes, then fails each planted entry`, run in the four `cells`. Not re-run by the PM | no |
| 50-F4 | High | Accept, closed by `65f4c26` | A decoder that dropped `label` passed all 16 Swift tests at `819433e`. `testEveryValueTheCoreReturnsReachesTheScreen` fails under it. Not re-run by the PM | no |
| 50-R1 | High | Accept, closed | `testLocaleCompareScratchBundleDiffersOnTieInput` and `testJavaScriptCoreMatchesTheNodeOracle`, run in the `swift` job. Not re-run by the PM | no |
| 50-Y1 | Medium | Accept, closed | The `initWithURL:` rule fires against an allowlist that lists `initWithURL:`, and the test file fails when the rule is made to honour the allowlist. Under ruling 1, this rule stays independent of the allowlist | no |
| B1 | High | Accept | **Reproduced by the PM at `65f4c26`** (commands below). Each of the five programs, compiled for `arm64-apple-ios27.0`, exits 0 from both `tools/ios/source-check.mjs` and `tools/ios/binary-check.mjs`, with all seven counts 0. A sixth program, `socket(AF_INET, SOCK_STREAM, 0)`, exits 1 from both (`named=1`), so the probe can fail. This is High, as PR #50's F2 was: guard 2 says the binary check fails "on any symbol from the URL-loading or socket APIs", and these pass. By Pass 1's read, the head's own binaries call none of them | **Yes**, under rulings 1 and 3 |
| B2 | High | Accept | **Reproduced by the PM at `65f4c26`,** with Pass 1's probe. Each file's backup exclusion is read through a fresh `URL` and through its extended attribute (commands below). Just before the second import, both `active` and `record.json` read `true/true`. Then, for each of the 12 storage steps: the second import fails, and the active bytes stay the first import's. Afterwards, both files read `false/false`: excluded from backup false, and the attribute absent. ADR-0009 requires both attributes "applied and checked after each import or replacement", and the spec's Failures paragraph keeps the previous file. A privacy property, so High. Protection is read back on macOS only; iOS is not verified | **Yes**, under ruling 2 |
| B3 | High | Accept, closed by `65f4c26` | `testASealWithOnlyOneAttributeIsNotExactAndKeepsThePreviousFile`. Not re-run by the PM | no |
| B4 | Medium | Accept, closed by `65f4c26` | `testEveryValueTheCoreReturnsReachesTheScreen` and `testAnImportedFileShowsWhatArrivedWhenAndWhatDidNot`. Not re-run by the PM | no |
| B5 | Medium | Accept, closed by `5ed2b7c` | Without the SDK the test is skipped, not passed. The `swift` job sets `KEEL_IOS_CONTROLS: required`, and `tools/ios/test/binary-controls-required.test.mjs` checks it. Not re-run by the PM | no |
| B6 | Medium | Accept, closed by `5ed2b7c` | One plant per source token, inline name and named alternative, in `each banned token fails by itself` and its siblings. Not re-run by the PM | no |
| B7 | Medium | Accept, closed by `5ed2b7c` | `tools/acceptance/test/determinism.test.mjs`. Not re-run by the PM | no |
| B8 | Medium | Accept, closed by `5ed2b7c` | `tools/ios/test/signing-check.test.mjs`. Not re-run by the PM | no |
| B9 | Medium | Accept, closed by `5ed2b7c` | `buildBundle` now resolves its root in `apps/ios/bundle/build.mjs`. That and the workflow's `env` line are the only changes outside tests in Pass 1's two commits, and Pass 2 cold-reads both | no |
| B10 | Medium | Accept, closed by `65f4c26` | `testParityComparesBytesNotCanonicallyEquivalentText`. Not re-run by the PM | no |
| B11 | Medium | Accept, open | **The PM's static check agrees** (commands below). On macOS, `.yaml` and `.yml` both map to `public.yaml`. That type conforms to `public.text` but not to `public.plain-text`. The picker allows only `UTType("app.keel.yaml") ?? .plainText` (`apps/ios/Keel/RootView.swift:32-34` at `65f4c26`). Whether the phone's picker greys out the fixtures is not verified. Beni's device run settles it. If step 1 cannot select a fixture, the patch is Pass 2's, such as `[.yaml]`, with Beni's result as its reproduction | no |
| B12 | Medium | Accept, open | The PR body is Cursor's. The rework prompt asks Cursor to add two things to criterion 12's steps: how to launch the `Verification` build with a console attached, as S90's `DEVICE.md` did with `xcrun devicectl device process launch --terminate-existing --console`, and how the relaunch after a force quit keeps it | no |
| B13 | Medium | Accept, closed by `65f4c26` | `testOnlyTheVerificationConfigurationDefinesVERIFICATION`. Not re-run by the PM | no |
| B14 | Medium | Accept, open | A patch, not a redesign: the scanner has to follow `\(` … `)` nesting. Pass 2 reproduces it first, from Pass 1's command, and fixes it with a test | no |
| B15 | Low | Accept, into B1's rework | Under ruling 1, the binary check guards everything the app imports, and the binary that goes on the phone is the `Verification` build. The `swift` job builds and binary-checks both configurations, in the same job, so it needs no extra runner | **Yes**, with B1 |
| B16 | Low | Accept, no change here | Ideas list | no |
| B17 | Low | Accept, no change here | Ideas list | no |
| B18 | Low | Accept, into B1's rework | The widened allowlist is rebuilt from what the two built binaries import. An entry neither binary uses is removed, or its reason says why it stays | **Yes**, with B1 |

Contested: none.

## PM1, a lead for B2's rework

The PM's first B2 probe disagreed with Pass 1's result. It read the active file's seal through one `URL` value, both before the failed import and after it, and got `complete/true` both times. A fresh `URL` and the file's extended attribute both showed the exclusion gone.

So in one test, `FoundationFiling.readSeal` (`apps/ios/KeelCoreHost/Sources/KeelCoreHost/FoundationFiling.swift:22-26`) returned a stale value. The `URL` value it was given had read the value once, and then the file was replaced on disk. `SnapshotStore` keeps one `URL` value per file (`SnapshotStore.swift:44-46`), so its own read-backs may return a cached value instead of the file's.

The PM has not shown that this happens in the app. A second probe tried to remove the attribute directly, and was inconclusive: the attribute still read as present after `removexattr` returned 0. The PM claims no defect. The rework makes every read-back read the file, and tests that a read-back reports the attribute gone after an atomic write replaces the file.

## Rework for Cursor

**B1, under rulings 1 and 3.**
1. The allowlist names everything the built app imports, each with a one-line reason: every non-Swift undefined symbol, every Objective-C selector it sends, and every demangled Swift symbol that names `Foundation.URL` anywhere in its signature. The binary check fails on any of these that is not on the list.
2. The entries that never go on the allowlist stay barred: the five named APIs, a `contentsOf:` reader, a `ContentsOfURL` selector, and a selector beginning `initWithURL:`. Their rules stay independent of the allowlist.
3. Each rule the check ends up with has a control, compiled separately, that fails by that rule alone. A control may isolate its rule with a scratch allowlist that wrongly lists what the other rules would catch, as ruling 3 allows. Dropping any one rule fails its control, in the automated ablation that `each binary rule fails its own control` runs.
4. Each of Pass 1's five B1 programs, compiled for `arm64-apple-ios27.0`, fails the binary check.
5. With the allowlist as committed, both the Release and the `Verification` app pass the check, and so does the `allowed` control. The `swift` job builds and checks both configurations (B15). Every allowlist entry is used by one of the two built binaries, or says why it stays (B18).
6. The PR body gives the allowlist's entry count for each kind, with the command that prints it.

**B2, under ruling 2.**
1. A failed import never writes the previous file's bytes or its record again. Until the active file is replaced, the previous file and its record are left as they are. Once replacing has begun, the store gets the previous file back by renaming a copy that kept its attributes, never by writing bytes.
2. After a failure at any of the 12 steps, the store reads both attributes back on every file it keeps. That read comes from the file, not a cached value (PM1). If both read back exactly, the previous file, its name and its time stay. If not, ruling 2 applies: the store removes the active file and its record, and the screen shows the no-file state with the failure message.
3. The name and time always describe the stored bytes. After a stop between any two steps, followed by a relaunch, the store shows one of three things: the previous import whole, the new import whole, or, where neither can be shown whole with both attributes, nothing, as ruling 2 gives. It never shows new bytes under the old name and time.
4. Each of these properties has a test that fails at `65f4c26`:
   - on real files, with `FoundationFiling` in `swift test` on macOS, at each step, read through fresh `URL` values;
   - with the memory double, which now drops a file's attributes when it overwrites it, as an atomic write does on disk;
   - a read-back failure that leads to removal;
   - a stop at each step, followed by a relaunch.

**For both:**
- **Commits:** authored as Cursor, and each one green. Push the next commit only after CI is green on the last. Fetch first, because the branch carries Claude's two commits, and never force-push.
- **Limits:** no new dependency, and no weakened assertion or control, Pass 1's included.
- **Scope:** `apps/ios/**`, `tools/ios/**`, `.github/workflows/verify.yml` and the tests that cover them.
- **The PR body:** update the claims list. Give each new test the mutant it kills and the failing test's name, and add B12's two steps.

## Authorship record

The Pass 0 record, extended with Pass 1's fix commits (`git log --format='%h %an' origin/main..HEAD` at `65f4c26`).

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `819433e` Add the iOS foundation and the guards required before an app merges | Cursor | Claude Code, Pass 1 (done) |
| `5ed2b7c` Pin each iOS guard rule with a control that fails by that rule alone | Claude | Codex, Pass 2 |
| `65f4c26` Test the screen from the core's own JSON, the exact seal, and parity by bytes | Claude | Codex, Pass 2 |
| Cursor's rework commits, still to come | Cursor | Claude Code, the fresh Pass 1 |

A fix by the fresh Pass 1 is Claude's, and Codex cold-reads it at Pass 2. Any Codex fix gets its cold read from the fresh Claude session at Pass 2.5.

## Rulings from Beni

Given on 2026-11-18 in the PM's session, which the seats cannot see. Each question and option is quoted as he saw it.

1. **13:11:56 EST, "Yes, widen (Recommended)".** The PM asked at 13:10:37 EST: "B1 (PR #52): the binary check lets five network calls through (gethostbyname, Stream.getStreamsToHost, CFStreamCreatePairWithSocketToHost, URL.lines, URL.resourceBytes), because it lists only some API names. For Cursor's rework, should guard 2's allowlist widen to every C symbol and Objective-C selector the app imports, plus every Swift symbol naming Foundation.URL, each with a reason?" The option read: "Anything not on the list fails, so an unnamed call can't slip through. The spec already says a list of names would be incomplete. Pass 1 counted 17 non-Swift imported symbols, so the list stays small."
2. **13:11:56 EST, "Remove it (Recommended)".** Asked at the same time: "B2 (PR #52): after a failed import, the app rewrites the previous file and its record, and both lose their backup exclusion. In Cursor's rework, the app will keep the previous file by renaming an already-sealed copy instead of rewriting it, then read both settings back. If that read-back still fails, what should the app do with the phone's copy?" The option read: "Delete the file and its record, and show the no-file screen with the failure message. ADR-0009 says the phone's copy is disposable and the next import restores it. This narrows the spec's rule that a failure keeps the previous file, for this one case only."
3. **14:19:37 EST, "Yes, scratch lists (Recommended)".** The PM asked at 13:18:03 EST: "PR #52, following your B1 ruling (widen the allowlist to every imported C symbol and selector): criterion 7 says that with the allowlist as committed, socket, connect and getaddrinfo each fail by the named-API rule alone, and PDFDocument() by the framework rule alone. Once every C symbol is allowlisted, those controls also fail the new symbol rule, so 'alone' can't hold with the committed list. Should each rule keep a control that fails by it alone, but isolated with a scratch allowlist that wrongly lists what the other rules would catch (as the contentsOf:, ContentsOfURL and initWithURL: controls already do)?" The option read: "The per-rule property stays: dropping any one rule fails its control. Only criterion 7's 'with the allowlist as committed' examples change, and the PM amends that wording in the next docs PR."

Pass 1's comment records one more: "Keep waiting (Recommended)", given on 2026-11-18 in the Pass 1 session, on whether to post with `verify` red for a macOS capacity cancellation. The fifth attempt went green.

The rulings in the Pass 0 brief stand. Where rulings 1 to 3 differ from the spec's guard 2, criterion 7 or failure 5, they are the authority for the rework until the spec is amended.

## Known gaps for the next ordinary docs PR

None of these blocks this PR.
- **Spec amendments for rulings 1 to 3:** guard 2's wording, criterion 7's "with the allowlist as committed" examples, and failure 5's case where the read-back fails.
- **B16:** the `swift` job pins the corpus at 33 files, so a Milestone 1 PR that adds a terms fixture has to edit `apps/ios/**`.
- **B17:** the launch timing, the launch counter and the bundled fixture ship in every configuration.
- **For the rules PR:**
  - The skill's comment template ends with the retro, while every pass's comment now ends with a seat record.
  - The skill's section 6 has the reviewer append ideas rows, but Pass 1 here, like those on PR #30 and PR #43, left them to the PM.

## Process notes

- Pass 1 disclosed one `diff` between the clone's `AGENTS.md` and the start folder's copy, with the output discarded. That file is tracked and public, and had already loaded on its own; nothing else there was opened. This record is the only action.
- Pass 1's seat record validates against `seat-record-1.1.json` in `BeniCheni/elenchus` (the PM's ajv run printed `valid true`). elenchus reads it: Pass 1 is recorded at `65f4c26`, and next is Pass 1.5.
- Pass 1's two commits change 16 files, with 368 insertions and 26 deletions (`gh api repos/BeniCheni/keel/compare/819433e...65f4c26`), and fast-forward the branch: 2 ahead, 0 behind.

## What the fresh Pass 1 does

1. **Cold-read Cursor's rework commits:** `git diff 65f4c26 <rework head>`, and each commit's author.
2. **Check rulings 1 to 3 and each property above.** Re-run Pass 1's B1 probe and the PM's B2 probe at the new head: every B1 program exits 1 from the binary check, and every B2 step reads `true/true` or leaves nothing stored. Re-run the per-rule ablation, and mutants for each new rule and each storage step.
3. **Re-run the checks:** `verify` on Node 24.22.2 and 26.13.0, `swift test`, the two unsigned builds with the binary check on each, the determinism check, and the tripwire with a planted control.
4. **Leave Pass 1's two commits to Codex.** Fix only what it reproduces, as the skill says.

## What Pass 2 does

1. **Cold reads:** `5ed2b7c` and `65f4c26` (`git diff 819433e 65f4c26`), and any fix the fresh Pass 1 commits.
2. **Reproduce or disprove each row above,** including the PM's B1, B2 and B11 checks and PM1. Contest any disposition you disagree with; the PM takes a contest to Beni.
3. **Patches:** B14's, and B11's if Beni's device run reproduced it.
4. **Your own read** of the whole PR at the head.
5. **The owner's private-list check,** counts only, with a readable-file precheck and a nonzero exit on a failed scan. Run it over:
   - the diff, and every commit message in `origin/main..HEAD`;
   - the PR title and body, and every comment;
   - the briefs on `docs/pr-52-records`;
   - your own comment.

   No Claude seat ran it.
6. **N/A checks:** Pass M is N/A, because nothing under `packages/` or `fixtures/` changes. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`).

## Sealed appendix for the fresh Pass 1 and Pass 2

Pass 1's findings and fixes, the PM's reproductions and PM1 are all suspicions to re-derive, not conclusions. Each seat reproduces or disproves them independently and adds its own read.

## The PM's commands

All run on 2026-11-18 in a fresh scratch clone at `65f4c26678a00311b1bca3bf91de8347a61881a0` (`git rev-parse HEAD`), on Xcode with the iPhoneOS 27.2 SDK. Nothing was launched on a device or a simulator.

<details><summary>B1</summary>

```sh
C="$(mktemp -d)"; sdk="$(xcrun --sdk iphoneos --show-sdk-path)"
printf '%s\n' 'import Foundation' '_ = gethostbyname("example.invalid")' > "$C/e1.swift"
printf '%s\n' 'import Foundation' 'var i: InputStream?' 'var o: OutputStream?' 'Stream.getStreamsToHost(withName: "example.invalid", port: 80, inputStream: &i, outputStream: &o)' 'i?.open()' > "$C/e2.swift"
printf '%s\n' 'import Foundation' 'var r: Unmanaged<CFReadStream>?' 'var wr: Unmanaged<CFWriteStream>?' 'CFStreamCreatePairWithSocketToHost(nil, "example.invalid" as CFString, 80, &r, &wr)' > "$C/e3.swift"
printf '%s\n' 'import Foundation' 'var c = URLComponents()' 'c.scheme = "https"' 'c.host = "example.invalid"' 'if let u = c.url { Task { for try await _ in u.lines {} } }' > "$C/e4.swift"
printf '%s\n' 'import Foundation' 'var c = URLComponents()' 'c.scheme = "https"' 'c.host = "example.invalid"' 'if let u = c.url { Task { for try await _ in u.resourceBytes {} } }' > "$C/e5.swift"
printf '%s\n' 'import Foundation' '_ = socket(AF_INET, SOCK_STREAM, 0)' > "$C/ctl.swift"
for f in ctl e1 e2 e3 e4 e5; do
  swiftc -sdk "$sdk" -target arm64-apple-ios27.0 -module-cache-path "$C/mc" "$C/$f.swift" -o "$C/$f" || exit
  R="$(mktemp -d "$C/root.XXXX")"; mkdir -p "$R/apps/ios/Keel" "$R/tools/ios"; cp tools/ios/allowlist.txt "$R/tools/ios/"; cp "$C/$f.swift" "$R/apps/ios/Keel/Plant.swift"
  node tools/ios/source-check.mjs "$R" >/dev/null 2>&1; se=$?
  out="$(node tools/ios/binary-check.mjs "$C/$f" "$PWD" 2>&1)"; be=$?
  echo "$f source=$se binary=$be $(echo "$out" | tr '\n' ' ')"
done
```

Printed: `ctl source=1 binary=1` with `named=1`, then `source=0 binary=0` with all seven counts 0 for each of `e1` to `e5`. `git status --porcelain --untracked-files=all | wc -l` printed 0 afterwards.

</details>

<details><summary>B2 and PM1</summary>

Saved as `apps/ios/KeelCoreHost/Tests/KeelCoreHostTests/ZZScratchRestoreTests.swift`, run with `swift test --package-path apps/ios/KeelCoreHost --filter ZZScratchRestoreTests`, then deleted. The file begins with `import XCTest`, `import Darwin` (for `getxattr`) and `import KeelCoreHost`, then Pass 1's `Gated` class, word for word from the B2 block of its comment, then this:

```swift
let key = "com.apple.metadata:com_apple_backup_excludeItem"
func xattrPresent(_ path: String) -> Bool { getxattr(path, key, nil, 0, 0, 0) >= 0 }
func fresh(_ path: String) -> Bool { ((try? URL(fileURLWithPath: path).resourceValues(forKeys: [.isExcludedFromBackupKey]))?.isExcludedFromBackup) ?? false }

final class ZZScratchRestoreTests: XCTestCase {
    func testScratchProbe() throws {
        for step in StorageStep.allCases {
            let folder = FileManager.default.temporaryDirectory.appendingPathComponent("keel-pm-scratch-\(UUID().uuidString)", isDirectory: true)
            try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
            let files = Gated()
            let store = SnapshotStore(folder: folder, files: files)
            _ = store.importFile(bytes: Data("first".utf8), name: "one.yaml", importedAt: "t1")
            let ap = folder.appendingPathComponent("active").path, rp = folder.appendingPathComponent("record.json").path
            let b = "active=\(fresh(ap))/\(xattrPresent(ap)) record=\(fresh(rp))/\(xattrPresent(rp))"
            files.failStep = step
            let second = store.importFile(bytes: Data("second".utf8), name: "two.yaml", importedAt: "t2")
            let kept = String(decoding: try FoundationFiling().read(URL(fileURLWithPath: ap)), as: UTF8.self)
            print("SCRATCH2 step=\(step.rawValue) before[\(b)] second=\(second == .failed ? "failed" : "stored") bytes=\(kept) after[active=\(fresh(ap))/\(xattrPresent(ap)) record=\(fresh(rp))/\(xattrPresent(rp))]")
            try? FileManager.default.removeItem(at: folder)
        }
    }
}
```

It printed, for all 12 steps, `before[active=true/true record=true/true] second=failed bytes=first after[active=false/false record=false/false]`, and `swift test` exited 0.

PM1 comes from the PM's first run of this probe. That run differed in one way: it read `active`'s seal with `FoundationFiling().readSeal` through one `URL` value, both before the second import and after it. It then printed `active=complete/true record=complete/false` for all 12 steps.

</details>

<details><summary>B11</summary>

```sh
C="$(mktemp -d)"
cat > "$C/u.swift" <<'SWIFT'
import UniformTypeIdentifiers
for ext in ["yaml", "yml"] {
  let t = UTType(filenameExtension: ext)!
  print("ext=\(ext) type=\(t.identifier) dynamic=\(t.isDynamic) plainText=\(t.conforms(to: .plainText)) text=\(t.conforms(to: .text))")
}
SWIFT
swiftc -module-cache-path "$C/mc" "$C/u.swift" -o "$C/u" && "$C/u"
```

Printed `ext=yaml type=public.yaml dynamic=false plainText=false text=true`, and the same for `yml`. This is a macOS binary, so it says nothing about the app's own declared type `app.keel.yaml`.

</details>

## Addendum, 2026-11-18: Codex builds the rework

Written by the PM after the record above was posted.

**Why.** The Builder seat's pin for a sensitive-path slice is Grok 4.7 at Extra High, and AGENTS.md gives the seat no fallback, so the seat stops and escalates. The owner's xAI plan now offers Grok 4.7 at Medium effort only, with a 256K context window, so the pinned seat cannot run.

**Ruling 4.** Given at 14:32:35 EST in the PM's session: "Let's pivot to use Codex as the builder." Beni gave that reason with it.

**Seat for the rework.**
- **Model:** Codex on GPT-6.1 Sol at Extra High, Codex's pin on sensitive-path PRs. The seat has no fallback: if that model is unavailable, it stops and escalates.
- **Where:** a new Codex session and a fresh clone.
- **What it builds:** the "Rework for Cursor" section above, and nothing beyond it. Only the section's line on commits changes, as the next item gives.
- **Commits:** authored as `Codex <noreply@openai.com>`, as hard rule 10 gives.

**What changes for independence.** AGENTS.md says "A reviewer builds nothing it will review" and "No vendor gives the only cold read of its own work". So:
- **The fresh Pass 1** stays Claude Code on Fable 5.2 Extra. It gives the cold read of Codex's rework commits. Pass 2.5's fresh Claude session reads them again, as AGENTS.md gives any Codex-authored commit.
- **Pass 2** stays Codex, in another session. Its cold read covers Claude's `5ed2b7c` and `65f4c26`, and any fix the fresh Pass 1 commits. It may reproduce or disprove B1 and B2 as Pass 1 found them at `819433e`. It leaves out of its read whether Codex's rework closes B1, B2, B15, B18 and PM1; the fresh Pass 1 and Pass 2.5 judge that. This is the shape AGENTS.md gives a Claude-authored PR, where Codex's Pass 2 covers only the Claude-authored commits after Pass 1.
- **The authorship record's last row** now reads: Codex's rework commits, still to come, authored by Codex, cold-read by Claude Code at the fresh Pass 1 and again at Pass 2.5.
- **The PR body** is Cursor's. Codex adds the rework's claims and B12's two steps in a section marked as the rework's, and leaves Cursor's claims as written.

**For the rules PR.** These are Beni's to rule:
- whether Codex stays the builder after this PR;
- the fallback AGENTS.md gives the Builder seat;
- the fallback for Cursor's cold-read seat, which is also pinned at Extra High. Merge logistics, pinned at Medium, is unaffected.

## Second addendum, 2026-11-18: GPT-6.2 Sol stands in for Codex's pin

**Why.** The rework's Codex session stopped before cloning or changing PR #52. Its report: it was running GPT-6.2 Sol at Extra High, while AGENTS.md pins Codex at GPT-6.1 Sol and gives that seat no fallback. PR #52's head (`65f4c26`), this branch (`aedee77`) and the PR's comments were unchanged afterwards (`gh pr view 52 --json headRefOid`, `gh api repos/BeniCheni/keel/git/ref/heads/docs/pr-52-records`, and the PR's comment list).

**Ruling 5.** Given at 14:56:50 EST in the PM's session, "Allow 6.2 for PR #52". The PM asked at 14:56:24 EST: "PR #52's Codex rework session stopped because it is running GPT-6.2 Sol at Extra High, and AGENTS.md pins Codex at GPT-6.1 Sol with no fallback. How should the Codex seats on PR #52 proceed?" The option read: "Ruling 5: GPT-6.2 Sol at Extra High stands in for the pin in PR #52's Codex seats, the rework and Pass 2. The PM records it in a second addendum and updates the prompt; the pin itself goes to the rules PR."

**What changes.**
- **The rework's seat** is Codex on GPT-6.2 Sol at Extra High. It still has no fallback: if that model is unavailable, it stops and escalates.
- **Pass 2's seat** for PR #52 is Codex on GPT-6.2 Sol at Extra High, in a session other than the rework's.
- Each Codex seat record gives `"requested": "gpt-6.2-sol"`, with this ruling as its source. Its comment says that the model stands in for the pin by ruling 5.
- Nothing else in this brief or the first addendum changes.

**For the rules PR.** Codex's pin in AGENTS.md, GPT-6.1 Sol as of 2026-10-29, is Beni's to update. This ruling covers PR #52 only.

## Third addendum, 2026-11-18: the fresh Pass 1, and rulings 6 to 8

Written by the PM at 19:28 EST, after the fresh Pass 1's comment ([issuecomment-6995420076](https://github.com/BeniCheni/keel/pull/52#issuecomment-6995420076), posted at 19:07:58 EST). It reviewed head `d58945ded5c8767311e9aad0688c2b4ea9363db6`, and its post-fix head is `95730ba191a14296987f5b8825d5964236d60f83`. Where this addendum differs from the text above, it wins.

**Ruling numbers.** This brief numbers Beni's rulings on PR #52 from 1. The S91 spec has its own series, in which ruling 6 keeps the `swift` job required, and that series is unchanged. Where the two could be confused, a record says "this brief's ruling N".

**What the fresh Pass 1 found.** Claude Code on Fable 5.2 at extra-high effort, in a new session, gave Codex's three rework commits their cold read. Its verdict is mergeable after fixes, with no High open.
- **Closed by the rework:** B1, B2, B12, B15, B18 and PM1. Each closing test fails at `65f4c26`.
- **Closed by its two commits:** C1 to C3. The commits are `eb974705c888e9a8742dd669b7bc4a71fe3b23bd` and `95730ba191a14296987f5b8825d5964236d60f83`, and they add tests only (`git diff --shortstat d58945d 95730ba` prints 3 files changed, 557 insertions).
- **Still open:** C4 to C9.
- **CI:** the `verify` run at `95730ba`, [44425084300](https://github.com/BeniCheni/keel/actions/runs/44425084300), is green on all six checks. Its `swift` job printed `Executed 37 tests, with 5 tests skipped and 0 failures`.

The first per-finding table above stands, except that B1, B2, B12, B15, B18 and PM1 are now closed, as the fresh Pass 1 found.

**Ruling 6.** Given in the rework's Codex session, which the PM cannot see. The PM drafted its terms for Beni's reply:
- one corrective push while `verify` was red;
- the seal stays exactly `.complete` and true, and no test accepts another class;
- before each real-file test, a probe sets `.complete` on a scratch file with Foundation's own call, not through `FoundationFiling`, and reads it back through a fresh `URL`;
- if that read is not `.complete`, the test calls `XCTSkip` with the macOS version and the class read, so it is skipped, never passed; on a host that honors `.complete`, it runs in full;
- the memory-double tests are unchanged;
- the corrective commit is pushed alone, before the guard commit;
- the PR body names each test that skips on the hosted runner.

Beni confirmed these terms in the fresh Pass 1's session at 19:07:40 EST, with "Confirm". The seat asked at 19:07:01 EST: "PR #52 fresh Pass 1: did you give ruling 6 in the Codex session with these terms?", followed by the terms above.

Under ruling 6, the red intermediate commit stands:
- `2e4cd93`'s run, 44397677564, failed in `swift` only.
- `d0ebd5b` was pushed alone, and its run, 44401293178, finished green at 21:32:14Z.
- `d58945d`'s run was created at 21:32:43Z (`gh run list --branch s91/ios-foundation`).

A squash merge carries only the tip's tree, and the gate reads `verify` at the tip.

**Ruling 7, on C4.** Given at 19:18:57 EST in the PM's session: "Leave it (Recommended)". The PM asked at 19:14:19 EST: "C4 (PR #52, fresh Pass 1): on every read, launch included, the store deletes the kept file and its record when their bytes can't be read or the record doesn't decode, even when both seals read back exactly. Ruling 2 deletes only when a seal reads back inexact. On iOS, complete protection makes reads fail while the phone is locked. When the seal is exact but the read fails, what should the store do?" The option read: "Return no file, so the screen shows the no-file state, and delete nothing. Deletion stays limited to ruling 2's case (an inexact seal) and to a half-written pair. A locked read then loses nothing, and the next import still replaces the file. Codex patches it at Pass 2 with a test, and Pass 2.5 cold-reads the patch."

**Ruling 8, on the fresh Pass 1's comment.** Given at the same time, to a second question asked with the first: "Leave as posted (Recommended)". The question read: "The fresh Pass 1 opened this Mac's power log and screen-lock setting, which the prompt didn't allow, to explain C7. Its public comment on PR #52 now gives your display-off times ([two times, left out here]) and says [what the lock is set to]. GitHub keeps a comment's edit history, so trimming it won't erase that. What should happen to the comment?" The option read: "The PM records the scope breach in the addendum's process notes. The rules PR adds the host's own logs and settings to what seats never open without asking."

**Per finding, the fresh Pass 1's.** The PM accepts all nine and contests none.

| Id | Severity | Disposition | Next |
| --- | --- | --- | --- |
| C1 | Medium | Accept, closed by `eb97470`. The store's rules were held almost only by the five real-file tests the hosted runner skips | Codex cold-reads `eb97470` at Pass 2 |
| C2 | Medium | Accept, closed by `95730ba`. Fifteen mutants of the widened check and the usage check passed every tooling test | Codex cold-reads `95730ba` at Pass 2 |
| C3 | Medium | Accept, closed by `95730ba`. A deleted assertion: the rework stopped running the isolated controls against the committed allowlist | Codex cold-reads `95730ba` at Pass 2 |
| C4 | Medium | Accept. Under ruling 7, the store removes the active file and its record only when one of the pair is missing, or when a seal does not read back exact. A seal read that throws counts as inexact, as ruling 2 gives. When both seals are exact and a read or the record's decoding fails, `activeTerms()` returns nothing and removes nothing | Codex patches it at Pass 2 |
| C5 | Medium | Accept. The decision after a failure, between the no-file state and the kept file, moves into `KeelCoreHost`, where a test fails if the screen keeps a removed file's name, time, summary or schedule | Codex patches it at Pass 2 |
| C6 | Medium | Accept, reproduced by the PM (commands below). The fix compares real paths in the six files of this PR that carry the guard. `tools/test-tooling.mjs` carries it on `main`, outside this PR | Codex patches the six at Pass 2; `tools/test-tooling.mjs` goes to the known gaps |
| C7 | Low | Accept. The rework section's sentence "On a Mac where Foundation honors `.complete`, all the real-file assertions run" gains "and is unlocked" | Codex edits its own section of the PR body at Pass 2 |
| C8 | Medium | Accept. A surviving mutant: copying the previous files straight into `rollback`, without `staging`, passes every test. The fix is a filing double that can stop inside a copy, and a test that kills that mutant | Codex patches it at Pass 2 |
| C9 | Low | Accept, no change. `.usingNewMetadataOnly` has no test, and the fresh Pass 1 observed no difference to test for on macOS 27.2.1 | Known gaps |

**Authorship record, extended** (`git log --reverse --format='%h %an' origin/main..95730ba`).

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `819433e` Add the iOS foundation and the guards required before an app merges | Cursor | Claude Code, Pass 1 (done) |
| `5ed2b7c` Pin each iOS guard rule with a control that fails by that rule alone | Claude | Codex, Pass 2 |
| `65f4c26` Test the screen from the core's own JSON, the exact seal, and parity by bytes | Claude | Codex, Pass 2 |
| `2e4cd93` Preserve sealed iOS imports through failures and relaunches | Codex | Claude Code, the fresh Pass 1 (done), and again at Pass 2.5 |
| `d0ebd5b` Report unsupported macOS file protection as a test skip | Codex | Claude Code, the fresh Pass 1 (done), and again at Pass 2.5 |
| `d58945d` Require exact approvals for iOS binary imports | Codex | Claude Code, the fresh Pass 1 (done), and again at Pass 2.5 |
| `eb97470` Hold the store's recovery rules with tests that need no real file | Claude | Codex, Pass 2 |
| `95730ba` Test the binary check's parsing and both commands on canned tool output | Claude | Codex, Pass 2 |
| Pass 2's patches, still to come | Codex | Claude, Pass 2.5 |

Two commits have no CI run of their own, because each was pushed together with the commit after it: `5ed2b7c` and `eb97470`. `gh run list --branch s91/ios-foundation` lists runs at `819433e`, `65f4c26`, `2e4cd93`, `d0ebd5b`, `d58945d` and `95730ba` only. Pass 2 runs `pnpm verify` and `swift test` at each of the two.

**What Pass 2 does now.** This replaces the list in "What Pass 2 does" above. Pass 2 is Codex on GPT-6.2 Sol at Extra High, by ruling 5, in a session other than the rework's.
1. **Cold reads:** `5ed2b7c` and `65f4c26` (`git diff 819433e 65f4c26`), and `eb97470` and `95730ba` (`git diff d58945d 95730ba`). For C1 to C3, check that each new test fails for the mutants it names and passes at the head. Whether Codex's rework needed those tests is not Codex's to judge.
2. **Reproduce or disprove** each row of the first per-finding table as Pass 1 found it at `819433e`, and the PM's B1, B2 and B11 checks and PM1 as the PM found them at `65f4c26`. Contest any disposition you disagree with; the PM takes a contest to Beni. Leave out whether Codex's rework closes B1, B2, B15, B18, PM1 or C4 to C9, as the first addendum gives.
3. **Patches.** Each comes with a test that fails without it, is committed as Codex, and is pushed only after `verify` and `swift` are green on the last push:
   - B14, reproduced first;
   - C4 under ruling 7, then C5, C6 in the six files of this PR, and C8, each shown failing first at `95730ba`;
   - C7, as one sentence in the rework's section of the PR body, with the posted body diffed against the saved file;
   - B11, only if Beni's device run reproduces it.

   If a patch cannot be made as given, Pass 2 stops and asks Beni.
4. **Its own read** of the whole PR at the head. A finding on a Codex commit is welcome, but it is not that commit's cold read.
5. **The owner's private-list check,** as above. It now also covers the fresh Pass 1's comment and this addendum.
6. **N/A checks,** as above.

**What Pass 2.5 does.** A fresh Claude session on Fable 5.2 at High, not the PM:
- the cold read of every Codex commit: the rework's three, read a second time, and Pass 2's patches;
- a re-run of every number at the head, with the results of Beni's device run;
- the merge gate, in shadow mode.

**Beni's device run.** Step 1, the picker, can run at any head, and it settles B11 while Pass 2 can still patch it. The full run of criterion 12 waits for Pass 2's patches, because C4 and C5 change the code it exercises. It runs at the head Pass 2.5 reads.

**Known gaps, added.** None of these blocks this PR.
- **`tools/test-tooling.mjs`** carries C6's entry guard on `main` (`git show origin/main:tools/test-tooling.mjs | grep -c 'import.meta.url === pathToFileURL(process.argv\[1\]).href'` prints 1). Started through a symbolic link, it would exit 0 without testing. This is for the next tooling slice.
- **C9:** `.usingNewMetadataOnly` has no test.
- **Two notes from the fresh Pass 1's "Deliberately not done":**
  - A failed recovery removes the pair although a retry would restore it. This is a design note, inside ruling 2.
  - The framework rule reads only the `.framework/` rows of `otool -L`, so a linked dylib that is not a framework is gated only by its symbols. This is reasoned, not run, and Pass 2 may test it in its own read.
- **For the rules PR:**
  - a per-PR prefix for rulings, so that a brief's ruling 6 and a spec's ruling 6 cannot be confused;
  - that a seat never opens the host's own logs or settings without asking, which the fresh Pass 1 did (process notes);
  - whether a review seat pushes its fix commits one at a time, so that each gets its own CI run.

**Process notes.**
- The fresh Pass 1 ran in a session started from a folder outside keel. It says it ran no command against that folder.
- To explain C7, it opened this Mac's power log, filtered to display events, and its screen-lock setting. Its prompt allows neither, and says to stop and ask before using a source the prompt does not name. The seat disclosed the step in its comment, and under ruling 8 the comment stays as posted.
- It ran `gh`, `git fetch`, `git push`, `pnpm`, `vitest`, `swift` and `xcodebuild` with the sandbox off, and said so.
- Its seat record validates against `seat-record-1.1.json` (the PM's ajv run printed `valid: true`). elenchus records Pass 1 at `95730ba`. Its only failures are the route on the PM's effort at passes 0 and 1.5: the PM's sessions observe xhigh against the Planner's High pin. This addendum's record repeats that failure.
- Codex's report that `d58945d` replays a local commit, `e643ace`, byte for byte stays not verifiable.

**The PM's commands.** Run on 2026-11-18 in the scratch clone at `95730ba191a14296987f5b8825d5964236d60f83` (`git rev-parse HEAD`).

C6, from the clone's root. `S` is the scratch folder, under `/private/tmp`, which `/tmp` links to (`ls -ld /tmp` prints `/tmp -> private/tmp`):

```sh
node tools/ios/allowlist-usage.mjs one                          # exit 2, 61 bytes of output
node "${S#/private}/keel52/tools/ios/allowlist-usage.mjs" one   # exit 0, 0 bytes
node "$S/keel52/tools/ios/allowlist-usage.mjs" one              # exit 2, 61 bytes
git grep -l 'import.meta.url === pathToFileURL(process.argv\[1\]).href'   # 7 files
```

The seven files are `tools/ios/allowlist-usage.mjs`, added in `d58945d`; five more under `tools/ios/`, added in `819433e`; and `tools/test-tooling.mjs`, which is on `main` and which the PR does not change. Checked with `git cat-file -e origin/main:<path>`, `git log --diff-filter=A origin/main..HEAD -- <path>` and `git diff --name-only origin/main...HEAD -- tools/test-tooling.mjs`.

C4, read at `95730ba`:
- `keepSealedTerms` (`SnapshotStore.swift:157-167`) removes the pair in one `guard`, which covers both files' presence, both seals, both reads and the record's decoding.
- At `65f4c26`, `activeTerms()` returned `nil` and removed nothing when a read or the decoding failed (`git show 65f4c26:apps/ios/KeelCoreHost/Sources/KeelCoreHost/SnapshotStore.swift`, lines 56 to 63).

Authorship and runs: `git log --reverse --format='%h %an <%ae> %s' origin/main..95730ba` and `gh run list --repo BeniCheni/keel --branch s91/ios-foundation --json databaseId,headSha,conclusion,createdAt,updatedAt`. The `swift` job's totals: `gh run view 44425084300 --job 135227722721 --log | grep 'Executed'`.

Ruling 6's confirmation: the fresh Pass 1's transcript, read for its questions to Beni and his answers only, with `jq` over its `AskUserQuestion` calls and their results.

Record checks: ajv's 2020 validator over the comment's JSON block against `seat-record-1.1.json`, then `elenchus status` and `elenchus check` for `BeniCheni/keel#52`.

## Fourth addendum, 2026-11-19: Pass 2, and rulings 9 to 12

Written by the PM at 11:55 EST, after Pass 2's comment ([issuecomment-7014825709](https://github.com/BeniCheni/keel/pull/52#issuecomment-7014825709), posted at 11:13:32 EST). It reviewed head `95730ba191a14296987f5b8825d5964236d60f83`, and its post-fix head is `80dc17732a7387c23bb9c7e5cbbacb39fc8e97ab`. Where this addendum differs from the text above, it wins.

**What Pass 2 found.** Codex on GPT-6.2 Sol at Extra High, by ruling 5, in a session other than the rework's. Its verdict is not mergeable, with D3 open.
- **Adjudicated:** it accepts all 34 earlier findings and contests none. For B1, B2, B15, B18, PM1 and C4 to C9 it reproduced each finding at the historical heads and left closure to the fresh Pass 1 and Pass 2.5, as the first addendum gives.
- **Cold reads:** Claude's `5ed2b7c`, `65f4c26`, `eb97470` and `95730ba`, with no finding on any of them.
- **Patches:** five Codex commits, each pushed alone after the previous push's `verify` and `swift` were green, and C7's two-line edit of the PR body, diffed against the saved file.
- **New findings:** D1, D2 and D4 (Medium) and D3 (High).
- **CI at `80dc177`:** run [44562739808](https://github.com/BeniCheni/keel/actions/runs/44562739808) is green on all six checks. Its `swift` job printed `Executed 41 tests, with 5 tests skipped and 0 failures`.

| Commit | Finding | Its run |
| --- | --- | --- |
| `918f678` Check Swift strings inside copy interpolations | B14 | 44559454756 |
| `1e02aab` Keep exactly sealed imports through read failures | C4 | 44560294926 |
| `fec1793` Make failed import screen state testable | C5 | 44560980251 |
| `0e59b2b` Run the iOS guards through symbolic links | C6 | 44561761067 |
| `80dc177` Test interruptions during rollback copies | C8 | 44562739808 |

C6's commit changes the six files the third addendum names and adds a shared helper, `tools/ios/entry-point.mjs`, which they now import.

**Rulings 9 and 10.** Both were given in Pass 2's Codex session, which the PM cannot see. Pass 2's comment records both under "Human-review resolutions". Beni answered "Yes" to each of Codex's questions, as the PM advised.
- **Ruling 9.** Codex asked: "May the PM record Pass 2's out-of-scope findings in a separate docs PR?" The PM appends the ideas rows in a separate docs PR, and Pass 2 lists each one under "Deliberately not done".
- **Ruling 10.** Codex asked: "May I record the replay claim as unverified and continue Pass 2?" Every claim this brief already records as not verifiable or device-only is recorded as not verified, and the pass continues. That covers the replay of `e643ace`, the device and simulator runs (B11, criterion 12, and how B2 and C4 behave on iOS), and ruling 6 as given in the rework session.

**Ruling 11, on D3.** Given at 11:51:02 EST in the PM's session: "Keep via rollback (Recommended)". The PM asked at 11:40:37 EST: "PR #52's D3 (open High): when an earlier import is exactly sealed on disk but can't be read at the moment a new import starts (a transient read error or an undecodable record), what should the import do?" The option read: "Treat the sealed pair as the previous import and copy it into the rollback before anything is replaced. If even the copy can't read it (a locked phone), the import fails and the earlier pair stays put. This closes both D3 cases: the deletion and the mixed pair. A sealed record that won't decode can still be replaced by a good import."

**Ruling 12, on D1, D2 and D4.** Given at the same time, to a second question asked with the first: "Carry them (Recommended)". The question read: "PR #52's three open Mediums: D1 (an inert force-linked dylib passes the binary check), D2 (a block comment between `import` and the module name passes the source check) and D4 (a raw Swift string hides a banned word from copy lint). Should they be patched on this PR or carried?" The option read: "Only D3 gets fixed on PR #52. D1, D2 and D4 go on the ideas list for the next tooling slice, each with its own control. D1 is already one of the brief's known gaps (dylibs)."

**D3, and PM2.** `importFile` (`SnapshotStore.swift:73`) decides whether a previous import exists from `activeTerms() != nil`. Since `1e02aab`, `activeTerms()` returns nothing for an exactly sealed pair that fails to read or to decode, and removes nothing, as ruling 7 gives. The import then treats that pair as absent.
- **D3, as Pass 2 found it.** The import skips `preservePrevious`, and on any failure it takes the first-import branch (lines 100 to 101), which removes both files. The PM's probe (commands below) widens Pass 2's single case to three faults: a read of the active file fails once, a read of the record fails once, or the record does not decode. For each fault and each of the 12 storage steps, the failed import leaves no file at all: 36 of 36 cases.
- **PM2, found by the PM while reproducing D3.** A *successful* import after a failed opening read has no rollback. The probe relaunches at each of the import's 17 points, before every change and after the last. Under either transient fault, those relaunches show the previous import at 8 points, then the new file's bytes under the previous import's record (its name and import time) at 3, nothing at 2, and the new import at 4. Showing a mixed pair as one import is a confident falsehood about where the terms came from, so PM2 is High. It folds into D3, as PM1 folded into B2.
- **Where they came from.** The PM ran the same probes with `SnapshotStore.swift` as it was at `918f678`, before C4's patch.
  - No mixed pair appears. The opening read's failure removes the pair, which is C4 itself, and the 19 relaunch points show the previous import at 5, nothing at 10 and the new import at 4.
  - The failed imports also leave no file, in 36 of 36 cases, because the pair is already gone.
  - With no fault, both stores show the previous import at 18 of 22 points and then the new one at 4.

  So `1e02aab` narrowed C4's deletion to a failed import, and it introduced PM2.

**D3's fix.** Codex writes it in Pass 2's session as one commit, under ruling 11.
- After the opening cleanup, a pair still on disk is the previous import, whether or not its bytes read and its record decodes. By then any pair left has both halves with exact seals, because ruling 7 removes the rest. The import preserves that pair through `staging` and `rollback` before anything is replaced. If preserving it fails, the import fails and the pair stays as it was.
- After a failure, only a first import removes what it wrote. A first import is one that started with no pair on disk.
- Each of these tests is shown failing at `80dc177` first:
  1. For each of the three faults and each of the 12 storage steps, the failed import leaves both original files with their ids and seals. After a transient fault, the next `activeTerms()` returns the previous import.
  2. For each transient fault, every relaunch point of a successful import shows the previous import or the new one, never a mixed pair and never nothing. No point after the first new one goes back.
  3. After an undecodable sealed record, a good import is shown as the new import.
  4. When copying the earlier pair into `staging` fails, the import fails and the pair stays.
- The commit is pushed alone, after `80dc177`'s run. Then Pass 2 posts a second short comment with its seat record: input `80dc177`, output the fix's head, D3 and PM2 fixed, and D1, D2 and D4 open and carried under ruling 12.
- If the fix cannot be made as given, Codex stops and asks Beni.

**Per finding, Pass 2's.** The PM accepts all four and contests none. The PM ran D3's case; D1, D2 and D4 are accepted on Pass 2's reproduction, which the PM did not re-run.

| Id | Severity | Disposition | Next |
| --- | --- | --- | --- |
| D1 | Medium | Accept. The binary check reads linked frameworks only, so an inert force-linked dylib with no undefined symbol passes. This is the third addendum's dylib note, now run | Carried by ruling 12: an ideas row |
| D2 | Medium | Accept. The source check misses `import /* … */ PDFKit`, which Xcode typechecks | Carried by ruling 12: an ideas row |
| D3 | High | Accept, reproduced and widened by the PM. PM2 folds in | Codex fixes it in Pass 2's session under ruling 11; Pass 2.5 cold-reads the fix |
| D4 | Medium | Accept. Copy lint ends a raw Swift string at its first embedded quote | Carried by ruling 12: an ideas row |

**Authorship record, extended** (`git log --reverse --format='%h %an' 95730ba..80dc177`).

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `918f678` | Codex | Claude, Pass 2.5 |
| `1e02aab` | Codex | Claude, Pass 2.5, which also checks PM2 on it |
| `fec1793` | Codex | Claude, Pass 2.5 |
| `0e59b2b` | Codex | Claude, Pass 2.5 |
| `80dc177` | Codex | Claude, Pass 2.5 |
| D3's fix, still to come | Codex | Claude, Pass 2.5 |

**What Pass 2.5 does now.** This replaces the list in the third addendum. Pass 2.5 is a fresh Claude session on Fable 5.2 at High, not the PM. It does three things:
- the cold read of every Codex commit: the rework's three, read a second time; Pass 2's five, where the read of `1e02aab` includes PM2; and D3's fix;
- a re-run of every number at the head, with the results of Beni's device run;
- the merge gate, in shadow mode. D1, D2 and D4 stay open as Mediums carried by ruling 12, and B11 waits on the device run.

**Beni's device run.** Step 1, the picker, can still run at any head. The full run of criterion 12 now waits for D3's fix, because the fix changes the store it exercises. It runs at the head Pass 2.5 reads.

**Known gaps, added.** These are for the PM's ideas rows under ruling 9, together with B16, B17, C9 and `tools/test-tooling.mjs`.
- D1, D2 and D4, as in the table above.
- **For the rules PR:** a seat names the private-list check it ran, not where the list is kept. Pass 2's comment gives the list's location on this Mac, though nothing it holds.

**Process notes.**
- Codex's first scratch clone was cleared between turns, with the five patch commits unpushed (local head `ce302ad`). Codex rebuilt them in a new fresh clone. The hashes above are the published ones. The PM's scratch folder was cleared the same night, and the PM rebuilt its elenchus config from its notes.
- The historical rerun of B2 and PM1 first failed with `NSCocoaErrorDomain` 513 while the Mac was locked, which is C7. Beni unlocked the Mac, and the rerun completed at both historical heads. Pass 2 says it opened neither power logs nor lock settings.
- Pass 2 ran GitHub and git network calls, `pnpm`, Xcode and Swift with the sandbox off, and said so. The PM ran `gh` and `swift test` with the sandbox off, because SwiftPM cannot compile its manifest inside the PM's command sandbox.
- Pass 2's seat record validates against `seat-record-1.1.json` (the PM's ajv run printed `valid: true`). elenchus records Pass 2 at `80dc177`, with next 2.5. Its only failures are the known route failures on the PM's effort at passes 0 and 1.5, which this addendum's record repeats.

**The PM's commands.** These ran on 2026-11-19 in a fresh scratch clone (`gh repo clone BeniCheni/keel`, then `git fetch origin pull/52/head:pr52`) at `80dc17732a7387c23bb9c7e5cbbacb39fc8e97ab`, with `KEEL_DATA_DIR` set to an empty `mktemp -d` folder.

The probe is two tests appended inside `SnapshotRecoveryTests`, and it is never committed:

```swift
func testPMProbeD3() throws {
    for fault in ["read active", "read record", "undecodable record"] {
        for step in StorageStep.allCases {
            let files = LedgerFiling()
            let store = store(on: files, withPrevious: true)
            let previous = try XCTUnwrap(store.activeTerms())
            let previousIDs = ids(files)
            let recordBytes = try files.read(record)
            switch fault {
            case "read active": files.readThrowsOnceFor = active.path
            case "read record": files.readThrowsOnceFor = record.path
            default: files.state.files[record.path]?.data = Data("{".utf8)
            }
            files.failStep = step
            let outcome = importSecond(store)
            files.failStep = nil
            files.readThrowsOnceFor = nil
            let left = names(files.state)
            let kept = left == ["active", "record.json"] && ids(files) == previousIDs
            if fault == "undecodable record", kept { files.state.files[record.path]?.data = recordBytes }
            let shown = store.activeTerms()
            print("PMPROBE \(fault) | \(step.rawValue) | outcome=\(outcome == .failed ? "failed" : "stored") | files=\(left.joined(separator: ",")) | keptOriginal=\(kept) | showsPrevious=\(shown == previous)")
        }
    }
}

func testPMProbeD3Stops() throws {
    for fault in ["none", "read active", "read record"] {
        let files = LedgerFiling()
        let store = store(on: files, withPrevious: true)
        var states: [LedgerFiling.State] = []
        files.beforeChange = { states.append($0) }
        if fault == "read active" { files.readThrowsOnceFor = active.path }
        if fault == "read record" { files.readThrowsOnceFor = record.path }
        let outcome = importSecond(store)
        files.beforeChange = nil
        states.append(files.state)
        var shown: [String] = []
        for state in states {
            let probe = LedgerFiling(state)
            guard let terms = SnapshotStore(folder: folder, files: probe).activeTerms() else { shown.append("nothing"); continue }
            let bytesNew = terms.bytes == second
            let recordNew = terms.name == "two.yaml"
            shown.append(bytesNew == recordNew ? (bytesNew ? "new" : "previous") : (bytesNew ? "MIXED(new bytes, old record)" : "MIXED(old bytes, new record)"))
        }
        print("PMPROBE2 \(fault) | outcome=\(outcome == .failed ? "failed" : "stored") | stops=\(states.count) | \(shown.joined(separator: " > "))")
    }
}
```

```sh
swift test --package-path apps/ios/KeelCoreHost --filter 'testPMProbeD3$'     # 36 rows, keptOriginal=false in all 36
swift test --package-path apps/ios/KeelCoreHost --filter testPMProbeD3Stops   # the sequences above
f=apps/ios/KeelCoreHost/Sources/KeelCoreHost/SnapshotStore.swift
git show 918f678:"$f" > "$f"                                                  # the store before C4's patch; then both commands again
git checkout -- .
```

Authorship and runs: `git log --format='%h %an <%ae> %s' 95730ba..80dc177`, `git show --stat --format= <commit>` and `gh run list --repo BeniCheni/keel --commit <sha>`. The `swift` totals: `gh run view 44562739808 --repo BeniCheni/keel --job 135696143883 --log | grep 'Executed'`.

The rulings' times come from the timestamps of the PM's `AskUserQuestion` call and its result, in this session's own transcript. The record checks are as in the third addendum.

## Fifth addendum, 2026-11-19: Pass 2.5, and rulings 13 to 17

Written by the PM at 14:37 EST, after Pass 2.5's comment ([issuecomment-7019236015](https://github.com/BeniCheni/keel/pull/52#issuecomment-7019236015), posted at 14:05:46 EST). It reviewed head `a39a5c7d4ac9dd264ca1301b137bfa0c6eec45c4` and pushed nothing. Where this addendum differs from the text above, it wins.

**Between the fourth addendum and Pass 2.5.**
- **Ruling 13.** Codex stopped before editing, because the fourth addendum's test (1) required both original file ids at all 12 steps. Once replacement has begun, the rollback restores sealed copies, which have new ids. The existing `testAFailureLeavesUntouchedFilesInPlaceAndNeverWritesThePreviousFileAgain` already splits the steps there. The PM's wording was wrong. Beni answered "Yes" in Codex's session, and confirmed it in Pass 2.5's session, together with rulings 9 and 10 ("Confirm" three times, asked at 13:09:43 EST and answered by 13:20:29 EST, as that comment records). The ruling:
  - for writeTemporary, protectTemporary, excludeTemporary, readTemporary and replaceActive, both original file ids survive the failed import;
  - from protectActive on, both names hold the sealed rollback copies, whose ids differ from the originals;
  - at every step, both files are sealed, and their bytes and record equal what was on disk before the import;
  - after a transient fault, the next `activeTerms()` returns the previous import.
- **D3's fix.** Codex's `a39a5c7` ("Preserve sealed imports through opening read failures") changes `SnapshotStore.swift` (4 lines added, 2 removed) and adds four tests. Its run, [44581863296](https://github.com/BeniCheni/keel/actions/runs/44581863296), is green on all six checks, and the `swift` job printed `Executed 45 tests, with 5 tests skipped and 0 failures`. Pass 2's follow-up ([issuecomment-7017465594](https://github.com/BeniCheni/keel/pull/52#issuecomment-7017465594)) carries the same 39 finding ids as the fourth addendum's record, with D3 and PM2 fixed.

**What Pass 2.5 found.** Claude Code on Fable 5.2 at High effort, on 72 of 72 replies, in a fresh session that wrote no commit. Its verdict is not mergeable, with E2 open. The shadow gate says would escalate.
- **Cold reads:** all nine Codex commits, with 61 code mutants, of which 55 were killed. D3 and PM2 are closed. It confirmed the fourth addendum's claim that `1e02aab` introduced PM2.
- **Re-run at the head:**
  - installs and `pnpm verify` on Node 24.22.2 and 26.13.0, each with core 178, plugin 212 and tooling 166 tests passing;
  - local Swift, with 45 tests, no skip and no failure;
  - the determinism check;
  - both unsigned builds, each with eight zero counts in the binary check;
  - the tripwire, with a control that fired;
  - Pass M and demo mode, as N/A with their commands.
- **Device:** Beni reported "Not run yet" for criterion 12 and for the B11 picker step at `a39a5c7`.
- **New findings:**

| Id | Severity | Finding |
| --- | --- | --- |
| E2 | High | A `rollback` folder outlives a failed recovery and is later restored over a stored import. `recoverPrevious` removes the active pair on any throw and leaves `rollback` in place. The next import then sees no pair, is stored as a first import, and never retires `rollback`. The next read restores what is left of the stale copy. With the rename out of `rollback/record.json` failing twice, the next launch shows the third file's bytes under the first file's name and time, both sealed, with no error. In the branch since `2e4cd93` |
| E1 | Medium | Two mutants of `a39a5c7`'s one changed line pass all 45 Swift tests: `files.exists(active)` alone, and `\|\|` in place of `&&`. No test has half a pair whose removal fails |
| E3 | Medium | Four branches of `918f678`'s Swift literal scanner have no test that fails without them: the nested block-comment depth, the parenthesis depth inside an interpolation, the `"""` delimiter, and the skip over an escaped character |
| E4 | Low | `apps/ios/bundle/build.mjs:87` kept the entry guard that C6 replaced, so a build started through a symbolic link writes nothing and exits 0 |

**Per finding, Pass 2.5's.** The PM accepts all four and contests none. For E2, the PM read the code path at `a39a5c7`, which runs through `recoverPrevious`'s catch, `hadPrevious` and the conditional retire at the commit point. The PM did not re-run Pass 2.5's probe. E1, E3 and E4 are accepted on Pass 2.5's reproduction.

**Ruling 14, on E2.** Given at 14:35:27 EST in the PM's session: "Fix it now (Recommended)". The PM asked at 14:14:06 EST, in four questions. The first read: "PR #52's E2 (new High from Pass 2.5): after a recovery fails and leaves its `rollback` folder, a later import can still be stored, and the next launch restores the stale rollback over it: the third file's bytes under the first file's name and time, sealed, no error. It needs the same rename to fail twice in a row, so it's rare. Does Codex fix E2 on this PR before merge?" The option read: "Codex fixes it as one commit with a test that fails first (Pass 2.5's probe gives one), and Pass 2.5 cold-reads the fix. It is the same kind of falsehood as PM2, which this PR graded High and fixed."

**Ruling 15, on E2's shape.** "Refuse while pending (Recommended)". The question read: "If E2 is fixed now, which rule does the store follow so that no import is ever stored while a `rollback` folder exists?" The option read: "A new import starts only once the opening recovery has cleared `rollback`. If the folder is still there, the import fails before it writes anything, and every later read retries the recovery. A stale rollback can then never be restored over a newer import. The cost: while a rename keeps failing, imports keep failing too, and the screen says so."

**Ruling 16, on E1, E3 and E4.** "Ride along (Recommended)". The question read: "PR #52's E1 (two surviving mutants of the D3 fix's line), E3 (four untested branches in B14's copy-lint scanner) and E4 (a seventh command, the bundle build, kept the old symlink guard): do they ride in the same Codex round as E2?" The option read: "All three are small and sit in this PR's own fixes: E1 and E3 are tests only, E4 is one guard. Pass 2.5 re-reads the round anyway for E2."

**Ruling 17, on the device run.** "Picker now, 12 at final (Recommended)". The question read: "PR #52's device run: when do you run the B11 picker step and criterion 12 on your iPhone?" The option read: "The picker step doesn't touch the store, so running it now tells us whether B11 joins the next Codex round. Criterion 12 exercises the store, so it waits for the head that will merge."

**The round for Codex.** This is rework under ruling 5, so Codex works on GPT-6.2 Sol at Extra High. There are four commits, in this order, each with a test shown failing at `a39a5c7` first, and each pushed alone after the previous push's `verify` and `swift` are green.

1. **E2, under ruling 15.** The store holds three rules.
   - **No import is stored while `rollback` exists.** After the opening recovery, if `rollback` is still there, the import returns failed before it writes anything, and it removes nothing.
   - **Recovery always finishes.** Each recovery either restores a whole, exactly sealed pair and retires `rollback`, or finds that what is left cannot make a whole pair, removes what is left of it, and retires `rollback`. The screen then shows nothing, as ruling 2 gives. `rollback` remains only while an operation keeps throwing, never because a state is one the next recovery cannot finish.
   - **A completed restore is kept.** When both restores have completed and only retiring `rollback` fails, the restored pair stays, and the next read retires the folder. This is Pass 2.5's "Deliberately not done" item on the same code path.

   The tests:
   - Pass 2.5's probe becomes a test, on the memory double, for both halves of `rollback` and for two and three failed renames. While `rollback` exists, the retry import returns failed and writes nothing. No relaunch, before or after the fault clears, shows a mixed pair, or the first import in place of an import reported as stored. Once the fault clears, a new import is stored and shown.
   - From each state a failed recovery can leave (each rename and remove inside a recovery failing once), the next `activeTerms()` leaves no `rollback`, and it shows the previous import whole or nothing.
   - A recovery whose two restores completed, but whose retire failed, keeps the restored pair, and the next read shows the previous import.
2. **E1.** For each half of a pair, with one half on disk whose removal throws, the import is stored and shown. The test fails under both of Pass 2.5's mutants.
3. **E3.** Pass 2.5's four plants go into `tools/acceptance/test/copy-swift.test.mjs`. Each one fails under its own mutant.
4. **E4.** `apps/ios/bundle/build.mjs` uses `tools/ios/entry-point.mjs`, with a symbolic-link test like C6's that fails on the old guard.

Then Codex posts one comment with a Pass 2 seat record: input `a39a5c7`, output the round's head, and the 43 ids from Pass 2.5's record, with E1 to E4 fixed. If any part of the round cannot be made as given, Codex stops and asks Beni. D1, D2, D4, B16, B17 and C9 stay as recorded. If Beni's picker step reproduces B11 before the round ends, the PM adds B11 to the round in writing.

**Authorship record, extended.**

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `a39a5c7` | Codex | Claude, Pass 2.5 (done) |
| The E round's four commits, still to come | Codex | Claude, the Pass 2.5 re-run |

**What the Pass 2.5 re-run does.** The same Pass 2.5 session is still eligible, because it wrote no fix. A fresh Claude session on Fable 5.2 at High would also do. It does three things:
- the cold read of the round's four commits;
- a re-run of every number at the round's head, with Beni's criterion 12 run at that head, and his picker result;
- the merge gate, in shadow mode.

**Process notes.**
- The Pass 2.5 session was opened in `~/code/keel`, and every reply in its transcript records that folder as its working folder. It wrote and ran everything in its own scratch folder and its clones. No command names the working copy itself, which is clean on `main` (`git -C ~/code/keel status --porcelain --untracked-files=all | wc -l` prints 0).
- It saved a memory note of environment facts (mktemp, `gh`, zsh, mutant clones) in this project's own memory folder, which later sessions started in `~/code/keel` load, the PM's among them. The note holds no finding, and the folder held nothing before. For the rules PR: whether review seats may write memory at all, since memory is a channel between seats that the sealed appendix does not cover.
- Pass 2.5's seat record validates against `seat-record-1.1.json`, with 43 ids: the 39 earlier ones and E1 to E4. elenchus records Pass 2.5 at `a39a5c7`, with next 3. Its failures are the known route failures on the PM's effort at passes 0 and 1.5, and the sha-chain failure at pass 2, where the follow-up record chains on its own first record. For the elenchus repo: a seat's follow-up record chains on that seat's earlier output.

**The PM's commands.** The rulings' times come from this session's own transcript. The working copy's state comes from `git -C ~/code/keel status --porcelain --untracked-files=all`, `git -C ~/code/keel rev-parse --abbrev-ref HEAD` and `git -C ~/code/keel stash list`. The Pass 2.5 seat's working folders and file writes come from its transcript's `cwd` fields and its `Write` and `Edit` calls, read for those only. E2's code path is read at `a39a5c7` with `git show a39a5c7:apps/ios/KeelCoreHost/Sources/KeelCoreHost/SnapshotStore.swift`. The record checks are as in the third addendum.

## Sixth addendum, 2026-11-19: the Pass 2.5 re-run, and rulings 18 and 19

Written by the PM at 20:04 EST, after the re-run's comment ([issuecomment-7026722230](https://github.com/BeniCheni/keel/pull/52#issuecomment-7026722230), posted at 19:46:05 EST). It reviewed head `a74aa56cb94ee5eec7ba6ac4a8b7e44beef12c98` and pushed nothing. Where this addendum differs from the text above, it wins.

**Between the fifth addendum and the re-run.** Codex built the E round under rulings 14 to 16, in four commits, each pushed alone: `425a9d5` (E2), `82a672c` (E1), `a6798ea` (E3) and `a74aa56` (E4). Their runs, 44603395023, 44604199077, 44605480313 and 44606208017, each show six of six checks green on their first attempt. Codex's comment ([issuecomment-7021042959](https://github.com/BeniCheni/keel/pull/52#issuecomment-7021042959)) carries the 43 ids, with E1 to E4 fixed. The round stopped once on NSCocoaErrorDomain 513, and went on after Beni unlocked the Mac.

**What the re-run found.** It ran as Claude Code on Fable 5.2 at High effort, on 126 of 126 replies. It is the same session as the first Pass 2.5, which wrote no commit. Its verdict is not mergeable, with E5 open, and the shadow gate says would escalate.
- **Cold reads:** every hunk of the E round's four commits, with 18 mutants, all killed. E1 to E4 are closed.
  - Ruling 15's three rules hold on the memory double, over 492 fault cases and 21,342 relaunch points. No import was stored while `rollback` existed. No point was left unfinished after one clean read. No point showed nothing or a mixed pair.
  - The first pass's 13 store mutants, re-run against the changed store, are all killed.
  - D3 holds in 36 of 36 cases, and PM2 at 22 of 22 relaunch points.
- **Re-run at the head:**
  - installs and `pnpm verify` on Node 24.22.2 and 26.13.0, each with core 178, plugin 212 and tooling 171 tests passing;
  - local Swift, with 49 tests, no skip and no failure; the hosted `swift` job, read from its log, with 49 executed and 5 skipped;
  - the determinism check;
  - both unsigned builds, each with eight zero counts in the binary check;
  - the tripwire, with 0 hits over 355 files and 18 commit messages, and a control that fired;
  - Pass M and demo mode, as N/A with their commands.
- **Authorship:** each of the 18 commits has a cold read from a vendor that did not write it.
- **Device:** Beni reported "not run yet" for the B11 picker step and for criterion 12 at `a74aa56`.
- **New finding:**

| Id | Severity | Finding |
| --- | --- | --- |
| E5 | High | A `record.json` whose removal fails ends up describing a later import's bytes. `removeActivePair` removes the record first, with `try?`. If that removal fails and the removal of `active` succeeds, the record stays alone, sealed. The next import's opening read cannot remove it either, so `hadPrevious` is false, no `rollback` is made, and `active` is replaced before the new record is written. A stop between those two steps leaves the new bytes beside the old record, both sealed. The next launch shows the second file's bytes under the first file's name and time, with no error. A lost seal on `active` reaches the same start. Pass 2.5 reproduced it at 3 of 18 stop points on the memory double, and at 4 of 8 on real files on macOS. The store as at `a39a5c7` and as at `918f678` gives the same rows, so the E round did not introduce it |

**Per finding.** The PM accepts E5 and contests nothing.
- **Reproduction.** The PM ran Pass 2.5's test as a probe on the memory double. Stops 9, 10 and 11 of 17 show "second under one.yaml at t1". The rows are the same at `a74aa56` and with the store as at `a39a5c7`.
- **Code path.** The PM read it at `a74aa56`: `removeActivePair`'s `try?` (`SnapshotStore.swift:186-189`), `hadPrevious` (`:79`), and the replacement (`:87`) before the record's write (`:94`).
- **Not re-run:** the real-file probe.

**The PM's error.** The fifth addendum's E1 item reads: "For each half of a pair, with one half on disk whose removal throws, the import is stored and shown." For the record half, that pinned E5's route as correct. As with test (1) before ruling 13, the PM specified the state at an operation's end without checking it at every stop. From here on, any outcome the PM specifies for the store is checked at every stop point too.

**Ruling 18, on E5.** Given at 19:58:21 EST in the PM's session: "Fix it now (Recommended)". The PM asked at 19:54:15 EST, in two questions.
- **The question:** "PR #52's E5, a new High from the Pass 2.5 re-run: when record.json can't be removed and the app stops inside a three-step window of the next import, the next launch shows the new file's bytes under the old file's name and time, sealed, with no error. It's rarer than E2 and was there before the E round (I reproduced it at a74aa56 and a39a5c7). Does Codex fix E5 on this PR before merge?"
- **The option:** "One Codex commit with a test that fails first (Pass 2.5's test fails 3 times at the head), then a Pass 2.5 cold read. AGENTS.md's Severity table makes an open High "not mergeable", and PM2 and E2 (the same false screen by other routes) were fixed on this PR."

**Ruling 19, on E5's shape.** "Refuse over orphan record (Recommended)".
- **The question:** "If E5 is fixed on PR #52, which shape does the store take?"
- **The option:** "After the opening read, if record.json is on disk without a whole sealed pair, the import fails before writing anything (the same shape as ruling 15). The record half of E1's pinned test (82a672c) changes from stored to failed; the active half stays stored. The new test relaunches at every stop from every start state of the two files, not only from a whole pair."
- **Not chosen:** a digest of the file in `record.json`, checked on every read.

**The round for Codex.** This is rework under ruling 5, so Codex works on GPT-6.2 Sol at Extra High. It is one commit, for E5, under ruling 19. Every new or changed test is shown failing at `a74aa56` first.

- **The rule.** After the opening read, if `record.json` is on disk without a whole sealed pair, `importFile` returns failed before it writes anything. Every later read retries the removal, as it does now. Once the record is gone, an import is stored and shown.
  - An `active` left alone stays storable, because its record is written only after it.
  - A pair whose files are both on disk but not sealed is already refused by `preservePrevious`'s seal check, and it stays refused.
- **The one existing test that changes** is `testAnOrphanThatCannotBeRemovedDoesNotPreventImport`, from `82a672c`.
  - **The record half changes.** The import now returns failed and writes nothing, and no relaunch shows a file. After the fault clears, the next import is stored and shown. This supersedes the fifth addendum's E1 item for the record half.
  - **The active half stays as it is:** stored and shown.
  - Both of E1's mutants still fail the test.
- **New tests, on the memory double:**
  - **Pass 2.5's test.** Its `testProbeAStopAfterReplacingOverAnOrphanRecordShowsAWholeImportOrNothing`, from its comment, becomes a test under ruling 19: the import returns failed, and every relaunch shows nothing. It fails at `a74aa56`.
  - **A sweep over every start state of the two files.** The starts are:
    - nothing;
    - a whole sealed pair;
    - `active` alone;
    - `record.json` alone;
    - each file unsealed beside a sealed other;
    - both unsealed.
  - **The faults.** Each start runs with no fault, or with the removal of either file failing once, twice or on every try. Each of those runs with no failing step, or with each of the 12 steps failing once.
  - **The relaunches.** Each run imports the second file and relaunches on the state before every change, and on the state at the end. A relaunch is a new store with no fault, as `relaunch(_:_:)` gives now.
  - **What must hold.** Every relaunch shows one whole import or nothing, never a mixed pair. An import reported as stored is what the relaunch at the end shows. This is the harness that found E5, widened to every start.
- **The real-file probe.** Then Codex runs Pass 2.5's real-file probe, `testProbeOrphanRecordOnRealFiles`, from its comment. It runs at the commit, on the unlocked Mac, and Codex reports its eight rows. Under ruling 19, each row reports the import as failed and the next launch as showing nothing.
- **How it lands.** The commit goes in as before:
  - commit as Codex, with no sign-off;
  - `pnpm install --frozen-lockfile` and `pnpm verify` on Node 24 and on Node 26, and `swift test --package-path apps/ios/KeelCoreHost` on the unlocked Mac;
  - `git fetch`, a check that `origin/s91/ios-foundation` is still `a74aa56`, then a push of that one commit, and a wait until the hosted checks are green.
- **The comment.** Codex then posts one comment with a Pass 2 seat record:
  - input `a74aa56`, and output the new head, with that one commit;
  - the 44 ids from the re-run's record, with E5 fixed;
  - the owner's private-list check, counts only, run first.
- **Stops and scope.** If the commit cannot be made as given, or if this rule conflicts with an existing test's invariant other than the one named above, Codex stops and asks Beni. D1, D2, D4, B11, B16, B17 and C9 stay as recorded.

**The PM's check of this specification.** The PM checked this specification at `a74aa56` before handing it on, in a scratch clone, on the memory double, with the two new tests written as probes. The disk tests ran too, on the unlocked Mac, with no skip and no 513.
- **Without a change to the store:**
  - the adapted Pass 2.5 test fails 11 times;
  - the sweep runs 637 imports and 10,608 relaunch points, and 126 of those points show "second under one.yaml at t1".
- **With one guard after `hadPrevious` that returns failed when `record.json` is on disk without the pair:**
  - both pass, with 0 mixed points over 8,952;
  - the 33 snapshot tests show 2 failures, both in the record half of `testAnOrphanThatCannotBeRemovedDoesNotPreventImport`, which is the one test this ruling changes.

So the rule can be met without touching any other test's invariant. The shape of the code is Codex's.

**Authorship record, extended.**

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `425a9d5`, `82a672c`, `a6798ea`, `a74aa56` | Codex | Claude, the Pass 2.5 re-run (done) |
| The E5 commit, still to come | Codex | Claude, the next Pass 2.5 re-run |

**What the next Pass 2.5 re-run does.** The same session is still eligible, because it wrote no fix. A fresh Claude session on Fable 5.2 at High would also do. It does three things:
- **The cold read** of the E5 commit, with its own E5 probes on the double and on real files.
- **A re-run of every number** at the new head, with Beni's criterion 12 run at that head, and his picker result.
- **The merge gate,** in shadow mode.

**Device run.** Ruling 17 stands. The picker step does not touch the store, so it can run at `a74aa56` or at any later head. Criterion 12 waits for the E5 commit's head.

**Process notes.**
- **Memory.** The re-run wrote no memory note. The seat's note and the index are unchanged since 14:06 EST.
- **Comment length.** The re-run's comment is 41,961 characters, against the prompt's "one short PR comment". Its seat record is 20,692 of them. The first Pass 2.5 comment was 41,638. For the rules PR: whether a seat record's coverage list stays in the PR comment.
- **Stops.** The re-run stopped once on NSCocoaErrorDomain 513 and asked Beni. After his "Unlocked", it ran the batch again in full. It also waited once on a usage limit.
- **The record.** The re-run's seat record validates against `seat-record-1.1.json`, with 44 ids: the 43 earlier ones, in the same order, and E5. elenchus records Pass 2.5 at `a74aa56`, with next 3. Its failures are the three known ones, and its note "commits pushed after pass 2.5" is gone.
- **How E5 was found.** E5 survived Pass 1, Pass 2 and the first Pass 2.5. It was found by relaunching at every stop from a start that no earlier test used. This round's sweep makes every start part of the suite.

**The PM's commands.**
- **The re-run's comment:** `gh api repos/BeniCheni/keel/issues/comments/7026722230`. Its record is the body's `json` block. It was checked with ajv against `schema/seat-record-1.1.json` in the elenchus repo, and its ids compared with Codex's E-round record. The lengths come from `jq '.body|length'` and `wc -c`.
- **Head and branches:** `gh pr view 52 --repo BeniCheni/keel --json headRefOid,isDraft,mergeable,state` and `git ls-remote origin refs/heads/s91/ios-foundation refs/heads/docs/pr-52-records refs/heads/main`.
- **Authorship:** `git log --reverse --format='%h %an <%ae>' origin/main..a74aa56`.
- **Runs:** `gh run view <id> --repo BeniCheni/keel --json conclusion,headSha,attempt,jobs` for the four E-round runs.
- **elenchus:** `node dist/cli.js status` and `check BeniCheni/keel#52 --config <config>`.
- **E5's reproduction.**
  - Pass 2.5's test was appended to `SnapshotRecoveryTests` in a scratch clone at `a74aa56`, and printed what each relaunch shows.
  - It ran with `swift test --package-path apps/ios/KeelCoreHost --filter SnapshotRecoveryTests/testPMProbeE5`: once at the head, and once with `SnapshotStore.swift` taken from `a39a5c7`.
  - Afterwards, `git checkout -- .` restored the clone.
- **The check of the specification.** The adapted test and the sweep were appended to `SnapshotRecoveryTests` as `testPMProbeE5Ruling19` and `testPMProbeE5Sweep`. The guard was one line after `hadPrevious` in `SnapshotStore.swift`.
  - The runs were `swift test --package-path apps/ios/KeelCoreHost --filter 'Snapshot'`, with the guard, and `--filter 'SnapshotRecoveryTests/testPMProbe'`, without it.
  - The counts are from the probes' printed tallies and the runner's summary lines.
  - Afterwards, `git checkout -- .` restored the clone.
- **Memory:** `stat -f '%Sm'` on the seat's memory note and its index.
- **The rulings' times** come from this session's own transcript.

## Seventh addendum, 2026-11-19: the second Pass 2.5 re-run, and ruling 20

Written by the PM at 21:10 EST. It follows two comments:
- Codex's E5 comment ([issuecomment-7027500111](https://github.com/BeniCheni/keel/pull/52#issuecomment-7027500111)), posted at 20:28:24 EST;
- the second re-run's comment ([issuecomment-7027943283](https://github.com/BeniCheni/keel/pull/52#issuecomment-7027943283)), posted at 20:56:17 EST.

The re-run reviewed head `8b5d5be2e01113c5671867141f13f42024a21d24` and pushed nothing. Where this addendum differs from the text above, it wins.

**Codex's E5 commit.** `8b5d5be` ("Refuse imports over an orphaned snapshot record") adds one guard to `SnapshotStore.swift`, in 2 lines. It adds 98 lines to `SnapshotRecoveryTests.swift` and removes 3. The PM's prompt for the re-run said 100 lines; that is the commit's total.
- **The tests:** the record half of `82a672c`'s test, Pass 2.5's E5 test under ruling 19, and a 637-import sweep. The double gains `removeAlwaysThrowsFor`.
- **The sweep:** 10,608 relaunches with 126 mixed at `a74aa56`, and 8,952 with 0 at the fix. These are the same counts as the PM's check.
- **The real-file probe:** in 8 of 8 rows the import is refused and nothing is shown.
- **The run:** 44653327005 is green on six of six checks, and its `swift` job printed "Executed 51 tests, with 5 tests skipped and 0 failures".
- **The record:** it validates, with the 44 ids in order. Only E5 changed, to fixed.

**What the second re-run found.** It ran as Claude Code on Fable 5.2 at High effort, on 154 of 154 replies, in the same session as both earlier Pass 2.5 comments. That session wrote no commit. Its verdict is mergeable, once Beni's device run passes. The shadow gate says would escalate, because of the sensitive paths and the `esbuild` dependency.
- **Cold read of `8b5d5be`.** 11 mutants of the guard (removing it, changing its condition, moving it) are all killed. The store as at `a74aa56` fails the three new or changed tests. The 24 earlier store mutants are all killed too, so 35 of 35 in all.
- **Ruling 19 on its own terms.** No import was refused once no fault was left, in 42 of 42 rows. From 401,227 stop points in a wider sweep, a fault-free import is stored and shown.
- **Routes the commit's sweep does not cover.**
  - The re-run crossed the 7 starts with 13 leftover files and folders, 16 fault modes and 13 steps, with a third import chained on.
  - On the 11 leftovers the store can reach, 0 points are mixed. With the store as at `a74aa56`, 3,855 are.
  - Two planted `rollback` shapes do show a mixed pair. The re-run found no route to either, by reading or by probing.
- **Earlier probes still hold:** ruling 15 over 21,342 points, D3 in 36 of 36 cases, PM2, and E2 on real files in 4 of 4.
- **Re-run at the head:**
  - installs and `pnpm verify` on Node 24.22.2 and 26.13.0, each with core 178, plugin 212 and tooling 171 tests passing;
  - local Swift, with 51 tests, no skip and no failure; the hosted `swift` job, with 51 executed and 5 skipped;
  - the determinism check;
  - both unsigned builds, each with eight zero counts in the binary check;
  - the tripwire, with 0 hits over 355 files and 19 commit messages, and a control that fired;
  - Pass M and demo mode, as N/A with their commands.
- **Authorship:** each of the 19 commits has a cold read from a vendor that did not write it.
- **Device:** Beni reported "not run yet" for the B11 picker step and for criterion 12 at `8b5d5be`.
- **New findings:**

| Id | Severity | Finding |
| --- | --- | --- |
| E6 | Low | The new sweep does not notice when its "every try" faults stop firing. It pins only `imports == 637` and `mixed == 0`. With the double's one new line removed, 182 of its 637 cases lose their fault, and every test still passes |
| E7 | Low | A first import reported as failed can still be shown at the next launch. It happens when the last step, `readRecord`, throws and neither file can be removed: the import returns failed and leaves a whole, exactly sealed pair. Nothing false is shown, because the bytes, name and time agree. It needs three faults at once. The store as at `a74aa56` gives it too, so it is not from `8b5d5be` |

**Per finding.** The PM accepts E6 and E7 and contests nothing.
- **E6, reproduced.** At `8b5d5be`, with the double's `removeAlwaysThrowsFor` line removed, `SnapshotRecoveryTests` passes all 24 of its tests. The sweep then prints 9,998 relaunches and 41 stored imports, against 8,952 and 37.
- **E7, read.** The PM read the path at `8b5d5be` (`SnapshotStore.swift:105-114`). With no `rollback` and no previous pair, a throw at `readRecord` calls `removeActivePair`. Both of its `try?` removals can fail, and the import then returns failed with a whole, sealed pair on disk. The PM did not re-run the seat's sweep for E7.
- **Grading.** Low stands for both.
  - E7 shows nothing false. At the import, the store could not confirm the record's seal, so "failed" was what it could evidence. At the next launch it confirms both seals.
  - E6's mutant is in the test double, not in the store.

**Ruling 20, on E6 and E7.** Given at 21:08:28 EST in the PM's session: "Carry both (Recommended)". The PM asked at 21:05:17 EST.
- **The question:** "PR #52's second Pass 2.5 re-run says mergeable at 8b5d5be, once your device run passes, with two new Lows. E6: the new sweep can't tell when its "every try" faults stop firing (I reproduced it). E7: a first import reported as failed can show at the next launch when its last step throws and neither file can be removed; the bytes, name and time are all correct, so nothing false is shown. Carry E6 and E7 as ideas rows, or fix them before merge?"
- **The option:** "Both are Low, and the gate allows open Lows. The head stays at 8b5d5be, so your device run there is the last step before Pass 3. The PM adds both to the ideas rows (ruling 9). E6's fix is an extra count assertion; E7 needs its own ruling on what a failed import may leave on disk."

**What Pass 3 needs.** No High is open. Before Beni merges:
- **His device run at `8b5d5be`,** under ruling 17: the B11 picker step and criterion 12 on his iPhone.
  - If the picker step reproduces B11, B11 is a Medium to rule on before the merge.
  - If criterion 12 fails, the PR is not mergeable at this head.
- **His own private-list check.**
- **Pass 3:** his rulings, `gh pr ready 52`, and the squash merge pinned to `8b5d5be` with `--match-head-commit`. The PM writes the handoff block after the device run.

**Carried,** for the ideas rows under ruling 9: D1, D2, D4, B16, B17, C9, E6 and E7, with the items already listed in the earlier addenda.

**Authorship record, extended.**

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `8b5d5be` | Codex | Claude, the second Pass 2.5 re-run (done) |

**Process notes.**
- **Comment length.** The re-run's comment is 25,048 characters, and its seat record is 15,679 of them. The previous comment was 41,961.
- **Memory.** The re-run wrote no memory note. The seat's note and the index are unchanged since 14:06 EST.
- **The record.** It validates against `seat-record-1.1.json`, with 46 ids: the 44 in order, then E6 and E7. elenchus records Pass 2.5 at `8b5d5be`, with next 3. It is blocked only on "no record for pass 3", and its failures are the three known ones.
- **The seat's handoff block** leaves `gh pr ready` and the private-list check outside it. The PM's Pass 3 handoff puts both in, as PR #50's did.

**The PM's commands.**
- **The two comments:** `gh api repos/BeniCheni/keel/issues/comments/<id>`. Each record is the body's `json` block, checked with ajv against `schema/seat-record-1.1.json` in the elenchus repo, and its ids compared with the record before it.
- **The commit:** `git log` and `git diff --stat a74aa56 8b5d5be`, and the store hunk read in full.
- **The run:** `gh run view 44653327005 --repo BeniCheni/keel --json conclusion,headSha,attempt,event,jobs`, and the `swift` job's log through `gh run view --log --job`.
- **Head, branches and authorship:**
  - `gh pr view 52 --repo BeniCheni/keel --json headRefOid,isDraft,mergeable,state`;
  - `git ls-remote origin refs/heads/s91/ios-foundation refs/heads/docs/pr-52-records`;
  - `git log --reverse --format='%an' origin/main..8b5d5be | sort | uniq -c`.
- **E6's reproduction.**
  - In a scratch clone at `8b5d5be`, the line `if removeAlwaysThrowsFor == url { throw Fault.injected }` was deleted.
  - The run was `swift test --package-path apps/ios/KeelCoreHost --filter 'SnapshotRecoveryTests'`.
  - Afterwards, `git checkout -- .` restored the clone.
- **elenchus:** `node dist/cli.js status` and `check BeniCheni/keel#52 --config <config>`.
- **Memory:** `stat -f '%Sm'` on the seat's memory note and its index.
- **The ruling's times** come from this session's own transcript.
