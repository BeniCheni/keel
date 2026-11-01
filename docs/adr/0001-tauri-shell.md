# ADR-0001: Tauri 2 desktop shell, with the browser dev build kept first-class

- Status: Accepted. Decided 2026-10-29 in the product research (Section 6, held privately until a scrubbed copy lands in `docs/proposals/`); recorded 2026-10-31.
- Deciders: Beni (owner), on the PM's recommendation.

## Context

keel needs native notifications that fire with the window closed, a tray, OS keychain access for opt-in connector keys, and one installer. It also needs contributors who never touch Rust. The options weighed were a localhost web app, Tauri 2, Electron, a static web app with browser storage, and an addon inside another local-first app.

## Decision

Wrap the TypeScript core and UI in a Tauri 2 shell. The same core and UI also run in a plain browser dev server, and that build stays a supported target, not a fallback.

## Consequences

No listening port; per-command capability permissions; official notification and autostart plugins; one installer. Contributors work on the TypeScript core and UI without a Rust toolchain. The shell itself stays thin.

## Strongest argument against

For a solo builder, the Rust toolchain and code signing slow the first week; a localhost app plus a scheduler would show results sooner. The browser build being first-class is the mitigation.

## Revisit when

The Tauri spike (notification, autostart, keychain) fails on a supported desktop OS, or signing costs block distribution.
