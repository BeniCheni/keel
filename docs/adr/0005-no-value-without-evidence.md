# ADR-0005: No value without evidence

- Status: Accepted. Decided 2026-10-29 in the product research (Section 6, held privately until a scrubbed copy lands in `docs/proposals/`); recorded 2026-10-31.
- Deciders: Beni (owner), on the PM's recommendation.

## Context

A market-linked note has no exchange price. Trackers that always show a number invent one, and a confident wrong number is the most harmful thing this product could show.

## Decision

A dollar value appears only when a dated, sourced mark exists. When none exists, the value slot is empty and says why. Model output never fills it. Honesty tests (`*.honesty.test.ts`) guard the rule and are never weakened, skipped or deleted.

## Consequences

A dollar value in the value slot is traceable to its dated, sourced mark. Scenario estimates stay separate and carry their assumptions, as ADR-0008 requires. The empty state is a designed state, not an error.

## Strongest argument against

The product can feel incomplete next to trackers that always show a number.

## Revisit when

Never: this is a product principle (`AGENTS.md` hard rule 3), not a technical choice.
