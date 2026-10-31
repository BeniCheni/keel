# ADR-0002: Domain core in TypeScript with zero I/O

- Status: Accepted. Decided 2026-10-29 in the product research (Section 6, held privately until a scrubbed copy lands in `docs/proposals/`); recorded 2026-10-31.
- Deciders: Beni (owner), on the PM's recommendation.

## Context

The same evaluation must run in the UI, in the headless check command and in tests, with byte-identical results.

## Decision

`packages/core` and every category plugin do no I/O: no file system, network, clock or randomness. Time, data and seeds are passed in. Storage sits behind an adapter interface implemented by each shell.

## Consequences

The core is trivially testable and deterministic, and UI and CLI parity follows from sharing it. `AGENTS.md` enforces the rule, and the import-boundary and network checks back it.

## Strongest argument against

Two storage adapters (desktop shell and CLI) must be maintained and kept in step.

## Revisit when

A third runtime needs the core and cannot pass time and data in.
