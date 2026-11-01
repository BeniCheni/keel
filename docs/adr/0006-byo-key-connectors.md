# ADR-0006: Connectors are bring-your-own-key; no market data ships in the repo

- Status: Accepted. Decided 2026-10-29 in the product research (Section 6, held privately until a scrubbed copy lands in `docs/proposals/`); recorded 2026-10-31.
- Deciders: Beni (owner), on the PM's recommendation.

## Context

Market data licences restrict redistribution, and a default network call would break the local-first promise.

## Decision

The default build makes no outbound request. Every data connector is opt-in, uses the user's own key, and has a `docs/providers/<id>.md` terms review dated within the last 12 months. Tests and demos use seeded synthetic data only.

## Consequences

Clean licensing; no real market data in the repo; zero-network default is testable.

## Strongest argument against

More setup for anyone who wants automated prices.

## Revisit when

A provider offers terms that permit redistribution and the default stays network-free.
