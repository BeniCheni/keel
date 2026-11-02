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

**Data path.** Files only. The desktop's export reaches the phone through the Files app, by a route the owner chooses: AirDrop and USB stay between the owner's devices, and iCloud Drive leaves them, which the phone names. No network, no account, no sync service. Each import replaces the previous snapshot only after validation succeeds; a rejected import leaves the previous snapshot intact. `loadTerms` validates each terms document only. Validation of observations, alerts and their cross-references belongs to the later export/import contract, not to that API or this terms-loader spike. What the export omits, the phone says it omits, and it shows no empty state that claims more. The newest observation date means only the latest observation present. Each holding and series keeps its applicable dates, and a newer close for one cannot freshen another. With no observations, the phone says no observation date is present. The terms format has no provenance date today, an alert firing on the desktop has a firing time, and an observation date cannot date terms. The import screen separately shows when the phone imported the files; neither that time nor a file's modification time stands in for source freshness.

**Storage.** The app's sandbox, in `Application Support`: the imported files, unchanged, plus anything derived, which can be rebuilt from them. No SQLite on the phone at first, because there is no history to keep that the desktop does not hold. Files are excluded from device and iCloud backup and use complete file protection, with both attributes applied and checked after each import or replacement. The phone's copy is disposable, and the next import restores it.

**Notifications.** Local only, scheduled ahead from dates known at import: A3 reminders, A5, A8 as a timer each import resets, A9 and a weekly digest. Severity keeps Section 4's meaning, and quiet hours shift fire times. Each notification's first line says it comes from the imported snapshot and names the applicable data dates, which S90's spec defines rule by rule, or says no observation date is present. Its title, subtitle and body describe only that snapshot and its recorded dates. None claims a current desktop state: an observation still ahead, a note not called, a close missing on the desktop, terms still unverified, or a current rating. Amounts and CUSIPs stay out. The detail page carries the disclaimer, by Beni's ruling of 2026-11-02 on hard rule 12. A test that fails without this wording rule lands with the app, before any notification text ships. S90's harness test does not count for that, because its code never merges. The app selects the soonest requests itself within the system's pending limit and refills its rolling window on each open and import. Without an open or import before that window ends, no later reminder is promised. Rules that need a new close (A1, A2, A4, A7, A11) appear after import and do not notify a closed app.

**Keychain.** Not used. No connector runs on the phone, so there is no key to hold.

**Not offered.** Push, email, webhook, Monte Carlo, document storage, editing terms.

## Consequences

The phone stays honest and private by construction: no network path, nothing to sync, nothing it can make disagree with the desktop except by being out of date. Its state is only as fresh as the last import. The import screen says when that was, and each screen names the data dates that apply to it.

A scheduled notification fires whatever has happened since. A note called on the desktop keeps its reminders on the phone until the next import cancels them. The wording above limits that to a stale reminder that says it is one, and does not remove it. Under complete file protection, a detail page opened from the lock screen also waits for unlock before it can read the snapshot.

Story 9.1's story sentence names terms, observations and alerts, which is not enough for the floor. Marks, positions, ratings, the change log, alert settings, acknowledged alert state and documents do not travel, so the phone must say so. Idea 32 carries that to the export slice. No M1 plan changes here.

Copy lint and the zero-network test do not cover Swift today. The import-boundary check scans Swift text, including comments and string literals; it does not analyze native APIs or prove the bundle's dependency graph. Those coverage gaps must close before an app merges, along with new sensitive paths and a Swift CI job. S90 lists each one, and adds none, because its code never merges.

An App Store listing is a separate question from this architecture. Guidelines 3.2.1(viii) and 5.1.1(ix) could affect a holdings monitor from an individual on either core path.

## Strongest argument against

A hand-carried file is the weakest part of a monitor whose job is "never be surprised by a date, a barrier or a call". The sharper failure is a reminder for a note that was called after the last import: it arrives looking current, however carefully it is worded. Its other half is silence. The events that matter most, a barrier band or a call, are exactly the ones this design cannot deliver to a closed app, and a person who forgets to import gets calendar reminders and a stale-data warning, and nothing else. A push channel from the desktop (story 6.11), or a sync service, would close that gap at the cost of a third party seeing metadata. Tauri on iOS would also save a second UI. This ADR accepts the gap to keep "nothing leaves your machines", and leaves desktop notifications as the channel for those events.

## Revisit when

S90's results arrive; a stale phone misses an event in Beni's own use; the export slice settles what travels; story 6.11 or any sync is taken up; Apple's rules on bundled code, the notification limit or the Personal Team change; an App Store listing is wanted; or the core's size or dependencies change enough to invalidate S90's load times.
