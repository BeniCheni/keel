# S91: iOS foundation

- Status: drafted 2026-11-16 by the PM (Claude), on Beni's four rulings of that day, recorded below. Amended the same day after Codex's Pass 1, the plan challenge, which raised 16 findings; `docs/reviews/pr-50-pass-1.5.md` on the records branch gives each one's disposition.
- Release: non-release slice. It builds alongside Milestone 1 and is not a slice toward `v0.1.0`. The iOS companion's release stays after Milestone 1, as ADR-0009 records. Nothing here goes to TestFlight or the App Store.
- Builder: Cursor, Grok 4.7 Extra High (sensitive-path slice), in one draft PR on branch `s91/ios-foundation`.
- Sensitive paths the build touches: `.github/workflows/**` (a Swift job) and `AGENTS.md` (the app's new sensitive paths). This spec PR touches none.
- Design rung: none. The one screen uses system SwiftUI controls and adds no design tokens.
- Stories served, from the phone journey in `docs/specs/s90-ios-core-spike.md`: 1.1 (the phone's own first-run text and disclaimer), the summary half of 3.1 (the "N of M verified" count and the unverified paths; each field's own status stays a later slice), 3.3 (validation on import), 3.4 (estimated observation dates, each labelled ESTIMATE), and a foundation subset of 9.1's import: one terms file, not the desktop's snapshot.

## Goal

The first iOS code on `main`. An app under `apps/ios/` imports one terms file through the Files app, validates it with `@keel/core` running inside JavaScriptCore (Path A, ADR-0009), keeps it as ADR-0009's storage rules say, and shows one read-only screen: what arrived and when, the terms summary with its verification count, and the note's observation schedule. With it land the guards that ADR-0009's Consequences require before any app merges.

## Beni's rulings

All four were given on 2026-11-16 in the PM's session.

1. **"Yes, in parallel, as long as the slice stays narrow"**, to "Start an iOS foundation slice now, alongside Milestone 1?". This changes the sequencing of his ruling of 2026-11-01, which ADR-0009's Context records: one narrow iOS slice may build before Milestone 1 ships. Desktop stays the Milestone 1 shell and the system of record.
2. **"S91"**, for the number. iOS slices continue the S90 series, apart from Milestone 1's numbers.
3. **"One screen"**, for the scope: import a terms file through the Files app, validate it with the bundled core, and show one read-only screen with the terms summary, its "N of M verified" count and the observation schedule's dates. The question said that both options include the guards ADR-0009 requires before any app merges.
4. **"Approve"**, for `esbuild` on `main` as a build-time development dependency of the bundle recipe. It is MIT-licensed, the tool S90 measured, and it ships nothing at runtime.

Ruling 3 makes a bare terms file the phone's input for this slice. ADR-0009's data path is the desktop's export, which does not exist yet, so ADR-0009's status records the terms file as an interim path until the export slice defines the export.

## Scope

### Layout

- `apps/ios/Keel.xcodeproj` holds one app target, `Keel`, for iPhone only, deployment target iOS 27.0, as S90's app used.
- `apps/ios/Keel/` holds the app's sources. The import, storage and JavaScriptCore bridge code sits in `apps/ios/Keel/Snapshot/`, and every user-facing string in `apps/ios/Keel/Copy.swift`.
- `apps/ios/KeelCoreHost/` is a Swift package with the JavaScriptCore host, the screen's render model and their tests, so `swift test` runs on a Mac without a device.
- `apps/ios/bundle/` is the bundle recipe, a workspace package named `@keel/ios-bundle`, with `esbuild` as its one development dependency at the version S90 pinned, `0.28.2`. `pnpm-workspace.yaml` adds `apps/ios/bundle`. It also holds the Node oracle that acceptance criterion 4 compares against.
- `tools/ios/` holds the new guards: the network check, the bundle-imports check, the signing check and the inline-string check.
- The bundle is built from `packages/core/src/index.ts` as merged, by S90's `compile` variant: one script, no host shim. It is committed at `apps/ios/Keel/Resources/core.js` and registered with the determinism check as a file path, built by a synchronous subprocess whose failure fails the check, so `pnpm verify` fails when the committed bundle differs from a fresh build. Xcode then needs no Node to build the app.

### The app

**Before the picker opens,** the screen says that the app stores the file only in its own sandbox, makes no network request and runs no connector, and that a file picked from a cloud provider such as iCloud Drive may be downloaded by that provider, outside the app, before the app receives it. It shows no file-system path.

**Import.** The screen's one action opens the Files app's picker for a plain-text `.yaml` or `.yml` file. The app reads the picked file only through the security-scoped file URL the picker returns: it requires `isFileURL`, opens and closes security-scoped access around a single read with `FileHandle(forReadingFrom:)`, and uses no URL-loading API. It decodes the bytes as strict UTF-8 and calls `loadTerms(text, fileName)` in a JavaScriptCore context created from the bundle.

**Storing a valid file.** The app writes the file's unchanged bytes to a temporary file in `Application Support`, sets complete file protection and `isExcludedFromBackup = true`, and reads both values back, requiring exactly `.complete` and `true`. Only then does it replace the active file, and it reads both values back again on the active file. The file's name and the import time are stored beside it under the same protection.

**Failures.** Each of these keeps the previous active file, its name and its import time, including after the app relaunches, and shows one message from `Copy.swift`:

1. the file could not be read;
2. the bytes are not valid UTF-8;
3. the core failed to run;
4. the terms are invalid, followed by each diagnostic's line and the `Copy.swift` string for its code;
5. the file could not be stored with both attributes, after which the temporary file is removed.

**The screen.** One read-only list, in this order:

1. **What arrived.** One terms file, its name and its import time, and that no observation, close or alert arrived with it, so the screen shows no figure.
2. **Terms summary,** from `verificationSummary`: "N of M verified" and each unverified term's path.
3. **Observation schedule,** from `observationSchedule(terms, nyseRulesCalendar())`, by its kind:
   - *Estimated:* the stated entry with its date, status and flags, then each generated entry with its date, the label `ESTIMATE` and its rule.
   - *Listed:* each entry with its date and its term's status. An entry whose date is `null` shows its status, such as unknown or conflict, and no date. A candidate value is never shown as a dated event.
   - *Unavailable:* the reason.
4. **About,** a named section holding the disclaimer.

Before the first import the screen shows the text above the picker, the About section, and that no terms file is imported yet. It names no holding and no figure.

**The render model.** A pure Swift function in `KeelCoreHost` turns the core's results into the screen's rows. Its tests fail when a generated row lacks `ESTIMATE`, when a listed row with a `null` date shows a date, when a failure kind lacks its message, or when the first-run rows or the About section lack the disclaimer.

**Copy.** Every string the app composes lives in `Copy.swift`. A core diagnostic is shown by mapping its code to a `Copy.swift` string, with its line; an unknown code shows a `Copy.swift` fallback with the code. Each schedule `unavailable` reason maps to a `Copy.swift` string the same way. Values read from the terms file (its id, paths and dates) are data and fall outside copy lint. Text the operating system draws, such as the Files picker, is the system's.

**No network.** The app links no networking API, and its JavaScriptCore context has no `fetch`, `XMLHttpRequest` or `WebSocket`. It declares no entitlement and no network usage.

**Signing.** No team identifier, provisioning profile or device identifier is committed. Device builds read the team from a local `apps/ios/Local.xcconfig`, which `.gitignore` excludes. The committed project builds unsigned for `generic/platform=iOS`.

### Guards

These are the gaps ADR-0009's Consequences name, and they land in this slice:

1. **Copy.** Copy lint reads `apps/ios/Keel/Copy.swift`, and the banned words fail it as they fail the README. A check fails when a string literal is passed to a SwiftUI `Text`, `Label`, `Button`, `Section`, `navigationTitle` or `alert` in any Swift file under `apps/ios/Keel/` other than `Copy.swift`.
2. **No network on the phone.** A check in `pnpm verify` fails when a Swift file under `apps/ios/` contains `URLSession`, `NWConnection`, `NSURLConnection`, `CFNetwork`, `WKWebView`, `SFSafariViewController`, `import Network`, `contentsOf:` or `URL(string:`. A Swift test asserts that the bundle's context has no `fetch`, `XMLHttpRequest` or `WebSocket`.
3. **The bundle's imports.** A check reads esbuild's metafile and fails on any import record marked external, which covers `fs` and `node:fs`, and on any input under `packages/plugin-mln/` or `packages/montecarlo/`.
4. **A Swift job in CI.** `verify.yml` gains a `swift` job on macOS. It selects an installed Xcode whose iOS SDK is 27.0 or later and fails with a named message when none is installed. It installs the locked Node dependencies for the oracle, runs `swift test --package-path apps/ios/KeelCoreHost`, builds the app unsigned for `generic/platform=iOS`, and compares the built app's `core.js` with the committed file byte for byte. It runs on every pull request and every push to `main`, unfiltered, and the aggregate `verify` job needs it beside `cells`.
5. **New sensitive paths in `AGENTS.md`:** `apps/ios/Keel.xcodeproj/**`, `apps/ios/Keel/Snapshot/**`, `apps/ios/KeelCoreHost/**`, `apps/ios/bundle/**`, `apps/ios/Keel/Resources/core.js`, `tools/ios/**`, and every `*.entitlements`, `Info.plist`, `*.xcprivacy` and `*.xcconfig` under `apps/ios/`.

The tripwire already reads every tracked text file. The slice commits no binary file, so it has no app icon; the system default stands.

### Load time on the phone

The core has grown since S90 measured it at `82e4909`: the schedule and the exchange calendar landed after. ADR-0009 says to revisit when the core's size changes enough to invalidate S90's load times, so the slice measures again with S90's method and limits: five fresh launches, the median time to create the context and evaluate the bundle (limit 500 ms), and the median time of the first `loadTerms` call through the bridge, as S90's Q3 measured it, on `fixtures/synthetic/terms/valid/example-autocall.yaml` (limit 50 ms). A median passes when it is under its limit. A median at or above its limit stops the slice for Beni's ruling.

## Non-goals

Notifications of any kind. Importing closes, observations, alerts or a desktop export, whose contract is a Milestone 1 slice. Each field's own provenance status. The payoff engine, distances, charts or any figure. More than one holding. Editing anything. Any network use by the app, iCloud integration by the app, the keychain, widgets, iPad layouts, app icons and other assets, TestFlight and App Store submission, the design review cycle, Monte Carlo, and any change under `packages/`.

## Acceptance criteria

Each is checked at the PR's head, with `KEEL_DATA_DIR` set to an empty `mktemp -d`. A command that searches must also succeed as a command: a Git or tool error fails the criterion, whatever it prints.

1. `pnpm install --frozen-lockfile && pnpm verify` exits 0 on Node 24.22.2 and 26.13.0, with the new checks in it.
2. The bundle is tracked and current: `git ls-files --error-unmatch apps/ios/Keel/Resources/core.js` exits 0; after `pnpm --filter @keel/ios-bundle build`, `git status --porcelain --untracked-files=all -- apps/ios/Keel/Resources/core.js` prints nothing; and the determinism check fails when the committed bundle is edited.
3. The bundle-imports check exits 0 on the real bundle, then exits 1 on each of three planted entries in a scratch build: an import of `fs`, an import of `node:fs`, and an import from `packages/plugin-mln/`.
4. `swift test --package-path apps/ios/KeelCoreHost` exits 0. Its parity test compares JavaScriptCore with the Node oracle, which imports `packages/core/src/index.ts` directly and serializes with the same `JSON.stringify` of `{file, result, summary, schedule}` in the same order. The corpus is every `.yaml` under `fixtures/synthetic/terms/` (33 files at `5069a34`), plus in-memory inputs for a listed schedule with an `unknown` and a `conflict` entry and for the holiday, weekend and outside-calendar cases in `packages/core/src/schedule/schedule.calendar.test.ts` and `schedule.flags.test.ts`. Both engines run under `en-US` and `sv-SE`, each checking that its locale resolved as asked, as S90's Q2 did, with S90's tie input. A planted one-byte difference in the oracle's output fails the test.
5. The render model's tests pass, and each fails when its rule is broken: `ESTIMATE` on generated rows, no date on a listed row whose date is `null`, a message for each failure kind, and the disclaimer in the first-run rows and in About.
6. A banned word planted in `apps/ios/Keel/Copy.swift` makes `node tools/verify/one.mjs copy` exit 1, and a string literal planted in a `Text` in another Swift file under `apps/ios/Keel/` makes the inline-string check exit 1.
7. The network check exits 1 for each of its banned forms planted in a Swift file under `apps/ios/`, including `Data(contentsOf:` and `URL(string:`.
8. The signing check exits 0 at the head and exits 1 for each planted form in a tracked file under `apps/ios/`: `DEVELOPMENT_TEAM` and `PROVISIONING_PROFILE_SPECIFIER` set inline, quoted, conditional (`[sdk=iphoneos*]`), and in an included `.xcconfig`. `git check-ignore -q apps/ios/Local.xcconfig` exits 0.
9. `git diff --name-only origin/main...HEAD -- packages schemas fixtures` exits 0 and prints nothing.
10. `node tools/tripwire/cli.mjs .` exits 0 with no output.
11. On the PR's head SHA, `gh pr checks <N> --repo BeniCheni/keel` shows the `swift` job and `verify` passing.
12. **Beni's device run,** from a clone at the PR's head, of a signed Release build installed on his iPhone:
    - Five fresh launches, the app force-quit between them, give the two medians in "Load time on the phone", each under its limit.
    - Importing `fixtures/synthetic/terms/valid/example-autocall.yaml` shows its summary and schedule.
    - Importing `fixtures/synthetic/terms/invalid/missing-required-top.yaml` next shows its diagnostics and keeps the first file.
    - After each import, the app's log line gives the active file's SHA-256 and both attribute values; the SHA-256 is the valid fixture's both times.
    - Beni records the log lines and timings in the PR as text, with no device or team identifier.

## Dependencies

`esbuild` `0.28.2`, MIT, a development dependency of `@keel/ios-bundle` only, approved by Beni's ruling 4. No Swift package dependency.

## Seats

The spec PR gets Codex as Pass 1, the plan challenge. The build PR touches sensitive paths, so `AGENTS.md`'s pins for them apply: Pass 1 is Claude Code on Fable 5.2 Extra, Pass 2 is Codex on GPT-6.1 Sol Extra High, and Pass 2.5 is a fresh Claude session on Fable 5.2 High. Beni merges, and he alone runs the device step. Every pass's PR comment ends with a seat record, by Beni's ruling of 2026-11-16.

## Running alongside Milestone 1

S91 consumes `@keel/core` as merged and changes nothing under `packages/`. A core change it shows is needed is filed as an ideas row or a Milestone 1 slice. Milestone 1 PRs take priority in the review queue.

## Claims list (PR body)

The build PR lists every acceptance criterion with its command and result, as `AGENTS.md`'s Build step requires.
