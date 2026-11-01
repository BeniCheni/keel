# ADR-0004: SQLite file outside the repo for series, events and alerts

- Status: Accepted. Decided 2026-10-29 in the product research (Section 6, held privately until a scrubbed copy lands in `docs/proposals/`); recorded 2026-10-31.
- Deciders: Beni (owner), on the PM's recommendation.

## Context

Closes, events, marks and alert history need durable local storage that a person can inspect and back up, and that never lands in the repo.

## Decision

One SQLite file in the OS app-data folder, outside the repo. Documents live in a local folder; the database stores their path, SHA-256 and page references only. No cloud sync in Milestone 1.

## Consequences

Inspectable, one-file backup. Keeping runtime data outside the repo reduces accidental-commit risk; the heuristic tripwire, the owner's private-list check and review remain necessary. The exact SQLite binding is chosen in the storage slice.

## Strongest argument against

Concurrent writes from the desktop app and the headless check command need a lock strategy.

## Revisit when

The lock strategy proves unreliable across the app and the CLI, or a binding fails on a supported OS.
