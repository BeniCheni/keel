# S91: iOS foundation

- Status: drafted 2026-11-16 by the PM (Claude), on Beni's four rulings of that day, recorded below.
- Release: non-release slice. It builds alongside Milestone 1 and is not a slice toward `v0.1.0`. The iOS companion's release stays after Milestone 1, as ADR-0009 records. Nothing here goes to TestFlight or the App Store.
- Builder: Cursor, Grok 4.7 Extra High (sensitive-path slice), in one draft PR on branch `s91/ios-foundation`.
- Sensitive paths the build touches: `.github/workflows/**` (a Swift job) and `AGENTS.md` (the app's new sensitive paths). This spec PR touches none.
- Design rung: none. The one screen uses system SwiftUI controls and adds no design tokens.
- Stories served, from the phone journey in `docs/specs/s90-ios-core-spike.md`: 1.1 (the phone's own first-run text and disclaimer), 3.1 and 3.3 (read-only provenance, and validation on import), 3.4 (estimated observation dates), and the import half of 9.1, for a terms file only.

## Goal

The first iOS code on `main`. An app under `apps/ios/` imports one terms file through the Files app, validates it with `@keel/core` running inside JavaScriptCore (Path A, ADR-0009), keeps it as ADR-0009's storage rules say, and shows one read-only screen: the terms summary with its verification count, and the note's observation schedule. With it land the guards that ADR-0009's Consequences require before any app merges.

## Beni's rulings

All four were given on 2026-11-16 in the PM's session.

1. **"Yes, in parallel, as long as the slice stays narrow"**, to "Start an iOS foundation slice now, alongside Milestone 1?". This changes the sequencing of his ruling of 2026-11-01, which ADR-0009's Context records: one narrow iOS slice may build before Milestone 1 ships. Desktop stays the Milestone 1 shell and the system of record, and every other line of ADR-0009 stands.
2. **"S91"**, for the number. iOS slices continue the S90 series, apart from Milestone 1's numbers.
3. **"One screen"**, for the scope: import a terms file through the Files app, validate it with the bundled core, and show one read-only screen with the terms summary, its "N of M verified" count and the observation schedule's dates.
4. **"Approve"**, for `esbuild` on `main` as a build-time development dependency of the bundle recipe. It is MIT-licensed, the tool S90 measured, and it ships nothing at runtime.

## Scope

### Layout

- `apps/ios/` holds the Xcode project, `Keel.xcodeproj`, with one app target, `Keel`, for iPhone only, deployment target iOS 27.0, as S90's app used.
- `apps/ios/KeelCoreHost/` is a Swift package with the JavaScriptCore host and its tests, so `swift test` runs on a Mac without a device.
- `apps/ios/bundle/` is the bundle recipe, a workspace package named `@keel/ios-bundle`, with `esbuild` as its one development dependency at the version S90 pinned, `0.28.2`. `pnpm-workspace.yaml` adds `apps/ios/bundle`.
- The bundle is built from `packages/core/src/index.ts` as merged, by S90's `compile` variant: one script, no Node built-ins, no host shim, and no import of `packages/plugin-mln` or `packages/montecarlo`. It is committed at `apps/ios/Keel/Resources/core.js` and registered with the determinism check, so `pnpm verify` fails when the committed bundle differs from a fresh build. Xcode then needs no Node to build the app.

### The app

**Import.** The screen's one action opens the Files app's picker for a plain-text `.yaml` or `.yml` file. The app reads it as UTF-8 and calls `loadTerms(text, fileName)` in a JavaScriptCore context created from the bundle.

- **On success,** the file is stored unchanged in the app's `Application Support` folder, with complete file protection and excluded from backup. The app reads both attributes back after writing, and a missing attribute is an import failure. Only then does the new file replace the previous one.
- **On failure,** the screen lists the diagnostics `loadTerms` returns, each with its line and message, and the previous file stays as it was.
- **The import time** is recorded, and the screen states it.

**The screen.** One read-only list, in this order:

1. The import time, and the terms file's name.
2. The terms summary from `verificationSummary`: "N of M verified" and each unverified term's path.
3. The observation schedule from `observationSchedule(terms, nyseRulesCalendar())`. For each entry it shows the date, the entry's origin, and any flag the schedule reports. When the schedule is unavailable, it shows the reason instead.
4. The disclaimer, in every state, including the first run before any import. Hard rule 12 lists the first-run screen and About; in a one-screen app this footer is both.

Before the first import the screen says no terms file is imported yet, and that nothing leaves the phone (story 1.1). It names no holding and no figure.

**Copy.** Every user-facing string lives in one Swift file, `apps/ios/Keel/Copy.swift`, so the copy lint can read it.

**No network.** The app links no networking API, and its JavaScriptCore context has no `fetch`, `XMLHttpRequest` or `WebSocket`. It declares no entitlement and no network usage.

**Signing.** No team identifier, provisioning profile or device identifier is committed. Device builds read the team from a local `apps/ios/Local.xcconfig`, which `.gitignore` excludes. The committed project builds unsigned for `generic/platform=iOS`.

### Guards

These are the gaps ADR-0009's Consequences name, and they land in this slice:

1. **Copy lint** reads `apps/ios/Keel/Copy.swift`, and the banned words fail it as they fail the README.
2. **No network on the phone.** A check in `pnpm verify` fails when a Swift file under `apps/ios/` names `URLSession`, `NWConnection`, `NSURLConnection`, `CFNetwork`, `WKWebView` or `import Network`. A Swift test asserts that the bundle's context has no `fetch`, `XMLHttpRequest` or `WebSocket`.
3. **The bundle's inputs.** A check fails when the bundle's input list, from esbuild's metafile, includes a file under `packages/plugin-mln/` or `packages/montecarlo/`, or a Node built-in.
4. **A Swift job in CI.** `verify.yml` gains a macOS job that runs `swift test --package-path apps/ios/KeelCoreHost` and an unsigned `xcodebuild build` for `generic/platform=iOS`. It runs on every pull request and every push to `main`, unfiltered, so the aggregate `verify` check never has to read a skipped job as a pass.
5. **New sensitive paths in `AGENTS.md`,** as S90's Q6 proposed: `apps/ios/KeelCoreHost/**` (the JavaScriptCore host), `apps/ios/bundle/**` (the bundle recipe), `apps/ios/Keel/Resources/core.js`, and every `*.entitlements`, `Info.plist`, `*.xcprivacy` and `*.xcconfig` under `apps/ios/`.

The tripwire already reads every tracked text file. The slice commits no binary file, so it has no app icon; the system default stands.

### Load time on the phone

The core has grown since S90 measured it at `82e4909`: the schedule and the exchange calendar landed after. ADR-0009 says to revisit when the core's size changes enough to invalidate S90's load times. So Beni installs the build on his iPhone and records, over five fresh launches as S90's Q3 measured them, the median time to create the context and evaluate the bundle, and the median time of the first `loadTerms` on `fixtures/synthetic/terms/valid/example-autocall.yaml`. S90's limits apply: 500 ms and 50 ms. A median above its limit stops the slice for Beni's ruling. The records go in the PR as text lines, as S90's did; no screenshot is committed.

## Non-goals

Notifications of any kind. Importing closes, observations, alerts or a desktop export, whose contract is a Milestone 1 slice. The payoff engine, distances, charts or any figure. More than one holding. Editing anything. Any network use, iCloud, the keychain, widgets, iPad layouts, app icons and other assets, TestFlight and App Store submission, the design review cycle, Monte Carlo, and any change under `packages/`.

## Acceptance criteria

Each is checked at the PR's head, with `KEEL_DATA_DIR` set to an empty `mktemp -d`.

1. `pnpm install --frozen-lockfile && pnpm verify` exits 0 on Node 24.22.2 and 26.13.0, with the new checks in it.
2. Rebuilding the bundle changes nothing: `pnpm --filter @keel/ios-bundle build && git diff --exit-code apps/ios/Keel/Resources/core.js` exits 0.
3. The bundle's inputs hold no file under `packages/plugin-mln/` or `packages/montecarlo/` and no Node built-in, by the guard in item 3 above; adding such an import to a scratch entry makes it exit 1.
4. `swift test --package-path apps/ios/KeelCoreHost` exits 0. Its tests load the committed bundle, assert that `fetch`, `XMLHttpRequest` and `WebSocket` are undefined in the context, and compare with Node's output, byte for byte: `loadTerms` for every terms file under `fixtures/synthetic/terms/`, and `verificationSummary` and `observationSchedule` for each file under its `valid/` folder.
5. `xcodebuild build -project apps/ios/Keel.xcodeproj -scheme Keel -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO` exits 0.
6. A banned word planted in `apps/ios/Keel/Copy.swift` makes `node tools/verify/one.mjs copy` exit 1.
7. `URLSession` planted in any Swift file under `apps/ios/` makes the network check exit 1.
8. `git grep -n -E 'DEVELOPMENT_TEAM *= *[A-Z0-9]{10}' -- apps/ios` prints nothing, and `git check-ignore apps/ios/Local.xcconfig` prints its path.
9. `git diff --name-only origin/main...HEAD -- packages schemas fixtures` prints nothing.
10. `node tools/tripwire/cli.mjs .` exits 0 with no output.
11. The new Swift job passes in CI on the PR's head, and `verify` passes.
12. On Beni's iPhone: importing a valid synthetic terms file shows its summary and schedule; importing an invalid one shows its diagnostics and keeps the previous file; and both load-time medians are under S90's limits. Beni records these, as text, in the PR.

## Dependencies

`esbuild` `0.28.2`, MIT, a development dependency of `@keel/ios-bundle` only, approved by Beni's ruling 4. No Swift package dependency.

## Seats

The spec PR gets Codex as Pass 1, the plan challenge. The build PR touches sensitive paths, so `AGENTS.md`'s pins for them apply: Pass 1 is Claude Code on Fable 5.2 Extra, Pass 2 is Codex on GPT-6.1 Sol Extra High, and Pass 2.5 is a fresh Claude session on Fable 5.2 High. Beni merges, and he alone runs the device step.

## Running alongside Milestone 1

S91 consumes `@keel/core` as merged and changes nothing under `packages/`. A core change it shows is needed is filed as an ideas row or a Milestone 1 slice. Milestone 1 PRs take priority in the review queue.

## Claims list (PR body)

The build PR lists every acceptance criterion with its command and result, as `AGENTS.md`'s Build step requires.
