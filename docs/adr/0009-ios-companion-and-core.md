# ADR-0009: A native iOS companion, with its own storage, data path and notifications

- Status: Proposed. Drafted 2026-11-02. The core choice is decided by spike S90's pre-registered rule, and Beni rules on the results.
- Deciders: Beni (owner), on the PM's recommendation.

## Context

Beni wants a native iOS companion that he uses himself, and wants to learn the iOS build and release cycle by building it. He ruled on 2026-11-01 that the iOS app does not replace the Tauri desktop app for Milestone 1: desktop stays the M1 shell and the system of record, and iOS is a post-M1 companion. The research's floor for the phone is "a read-only responsive view of Today and the instrument summary".

The phone cannot do what the desktop does for alerts. iOS gives an app no timed background run it can rely on, so ADR-0007's scheduled `check` command has no equivalent there, and a close reaches the phone only by import.

This ADR is additive. It supersedes nothing. ADR-0001, ADR-0004 and ADR-0007 stand unchanged for desktop. ADR-0002 stands too: iOS is a runtime that can pass time and data in, on either core path. ADR-0003, ADR-0005, ADR-0006 and ADR-0008 apply to the phone as written.

## Decision

**Role.** A companion. The phone reads and explains what the desktop's data produces, and schedules its own date-based reminders. It writes nothing back. The story-by-story split is the journey table in `docs/specs/s90-ios-core-spike.md`.

**Core.** Path A runs the TypeScript `@keel/core` in JavaScriptCore; Path B is a full Swift port. S90's decision rule chooses, on measured parity, load time and App Review reading. This section is rewritten when Beni rules on the results.

**Data path.** Files only. The desktop's export reaches the phone through the Files app, by a route the owner chooses: AirDrop and USB stay between the owner's devices, and iCloud Drive leaves them, which the phone names. No network, no account, no sync service. Each import replaces the previous snapshot whole, and `loadTerms` validates it first. What the export omits, the phone says it omits, and it shows no empty state that claims more.

**Storage.** The app's sandbox, in `Application Support`: the imported files, unchanged, plus anything derived, which can be rebuilt from them. No SQLite on the phone at first, because there is no history to keep that the desktop does not hold. Files are excluded from device and iCloud backup and use complete file protection. The phone's copy is disposable, and the next import restores it.

**Notifications.** Local only, scheduled ahead from dates known at import: A3 reminders, A5, A8 as a timer each import resets, A9 and a weekly digest. Severity keeps Section 4's meaning, quiet hours shift fire times, and each body carries the export's as-of date, with amounts and CUSIPs left out. The app schedules a rolling window within the system's pending limit and refills it on each open and import. Rules that need a new close (A1, A2, A4, A7, A11) appear after import and do not notify a closed app.

**Keychain.** Not used. No connector runs on the phone, so there is no key to hold.

**Not offered.** Push, email, webhook, Monte Carlo, document storage, editing terms.

## Consequences

The phone stays honest and private by construction: no network path, nothing to sync, nothing it can make disagree with the desktop except by being out of date. Its state is only as fresh as the last import, and every screen says when that was.

A scheduled notification fires whatever has happened since. A note called on the desktop keeps its reminders on the phone until the next import cancels them.

Story 9.1 as written carries terms, observations and alerts, which is not enough for the floor. Marks, positions, ratings, the change log, alert settings and documents do not travel, so the phone must say so. Idea 32 carries that to the export slice. No M1 plan changes here.

Copy lint, the import-boundary check and the zero-network test do not cover Swift today. They must before an app merges, along with new sensitive paths and a Swift CI job. S90 lists each one, and adds none, because its code never merges.

An App Store listing is a separate question from this architecture. Guidelines 3.2.1(viii) and 5.1.1(ix) could affect a holdings monitor from an individual on either core path.

## Strongest argument against

A hand-carried file is the weakest part of a monitor whose job is "never be surprised by a date, a barrier or a call". The events that matter most, a barrier band or a call, are exactly the ones this design cannot deliver to a closed app, and a person who forgets to import gets calendar reminders and a stale-data warning, and nothing else. A push channel from the desktop (story 6.11), or a sync service, would close that gap at the cost of a third party seeing metadata. Tauri on iOS would also save a second UI. This ADR accepts the gap to keep "nothing leaves your machines", and leaves desktop notifications as the channel for those events.

## Revisit when

S90's results arrive; a stale phone misses an event in Beni's own use; the export slice settles what travels; story 6.11 or any sync is taken up; Apple's rules on bundled code, the notification limit or the Personal Team change; an App Store listing is wanted; or the core's size or dependencies change enough to invalidate S90's load times.
