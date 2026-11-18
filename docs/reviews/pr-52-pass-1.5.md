# Pass 1.5 brief: PR #52 (S91 iOS foundation build)

Written by the PM on 2026-11-18 (America/New_York). It follows Pass 1's comment ([issuecomment-6986672668](https://github.com/BeniCheni/keel/pull/52#issuecomment-6986672668), posted at 12:44:54 EST; reviewed head `819433e`, post-fix head `65f4c26`) and Beni's rulings below. Like the Pass 0 brief, it lives on the records branch `docs/pr-52-records`, so that no PM commit enters PR #52.

Pass 1's verdict is not mergeable, with two open Highs. The PM accepts all 18 of Pass 1's findings, and its dispositions of PR #50's five Highs and Y1, and contests none:
- **B1 and B2,** the open Highs, need redesign. They go to Cursor as rework, under Beni's rulings 1 to 3.
- **B15 and B18** fold into B1's rework. **PM1,** a lead the PM found while reproducing B2, folds into B2's.
- **B3 to B10 and B13** are closed by Pass 1's two commits, which Codex cold-reads at Pass 2.
- **B11, B12 and B14** stay open. B12 is the PR body, which Cursor updates with the rework; B11 waits on Beni's device run; B14 is a patch for Pass 2.
- **B16 and B17** are Lows for the ideas list.

**Addendum, 2026-11-18, 14:32 EST.** By Beni's ruling 4, Codex builds the rework instead of Cursor. The addendum at the end of this brief gives the seat and what changes. Where it differs from the text above, the addendum wins.

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
