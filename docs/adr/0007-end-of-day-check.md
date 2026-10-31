# ADR-0007: End-of-day evaluation, with a headless check command for schedulers

- Status: Accepted. Decided 2026-10-29 in the product research (Section 6, held privately until a scrubbed copy lands in `docs/proposals/`); recorded 2026-10-31.
- Deciders: Beni (owner), on the PM's recommendation.

## Context

Alerts must fire with the app closed, and a calm cadence suits instruments observed monthly or at maturity.

## Decision

Evaluation runs on end-of-day data. A headless `check` command runs the same alert code as the UI and is driven by an OS scheduler (a sample launchd job first). The UI and `check` give identical output for the same data.

## Consequences

Alerts work without the app open; one code path for UI and CLI.

## Strongest argument against

Misses intraday moves, by design.

## Revisit when

A supported instrument has an intraday trigger that matters to its payoff.
