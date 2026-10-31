# ADR-0008: Monte Carlo isolated in its own package and screen

- Status: Accepted. Decided 2026-10-29 in the product research (Section 6, held privately until a scrubbed copy lands in `docs/proposals/`); recorded 2026-10-31.
- Deciders: Beni (owner), on the PM's recommendation.

## Context

Simulation can be informative, but its output is an estimate under assumptions and must never read as a value or leak into status.

## Decision

Monte Carlo lives in `packages/montecarlo`. Nothing outside that package and the Scenario screen imports it (`AGENTS.md` hard rule 7, enforced by the import-boundary check). Every run saves its assumptions and seed; every output carries the label ESTIMATE and its assumptions. It is off until the user acknowledges the model-limits note.

## Consequences

Model output cannot reach status, value or alerts.

## Strongest argument against

Power users find it one click further away.

## Revisit when

Never for the isolation itself; the screen placement can change.
