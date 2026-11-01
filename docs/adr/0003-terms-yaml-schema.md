# ADR-0003: Terms as YAML plus JSON Schema, with provenance on term fields

- Status: Accepted. Decided 2026-10-29 in the product research (Section 6, held privately until a scrubbed copy lands in `docs/proposals/`); recorded 2026-10-31.
- Deciders: Beni (owner), on the PM's recommendation.

## Context

A note's value is defined by its terms, and those terms arrive from documents of differing trust: final terms, confirmations, adviser material, the user's own typing. The terms file must be readable, diffable and auditable by a person.

## Decision

One YAML file per instrument is the source of truth for its terms. Each term field carries a value and provenance status, or a conflict with every candidate; a source is required only for the statuses that cite one. Plain structural fields carry no provenance wrapper. The field and status contracts in `docs/specs/s01-terms-schema.md` define these shapes. YAML is parsed in strict 1.2 mode and validated against a published, versioned JSON Schema. Only a `primary` source verifies a payoff term.

## Consequences

Human-editable, diffable, auditable; conflicts stay visible instead of being silently resolved. Schema versions follow semver: a minor bump may add optional fields, a major bump ships a migration.

## Strongest argument against

YAML's implicit typing traps. Strict parsing and the schema mitigate them; JSON would avoid them entirely but loses comments.

## Revisit when

Strict parsing plus the schema still lets a typing trap through, or users need a format YAML cannot express cleanly.
