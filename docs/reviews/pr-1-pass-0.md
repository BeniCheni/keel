# Pass 0 brief: PR #1 (scaffold: rules, review skill, S00 and S01 specs)

**Retroactive.** Written by the PM on 2026-10-30 (America/New_York), after Pass 1 had already run. It is a record only. Pass 1 did not receive it, so it sealed nothing and steered nothing. It exists because `AGENTS.md` requires a Pass 0 record for every PR, and Pass 1 finding 5 caught its absence.

## Seat for Pass 1

Codex, because a Claude session wrote the scaffold. Model GPT-6.1 Sol Extra High (sensitive-path PR). No fallback.

## Scope

- Spec: none; this PR adds the first two specs (`docs/specs/s00-tooling.md`, `docs/specs/s01-terms-schema.md`) and is their plan challenge.
- Sensitive paths touched: `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**`, `.agents/skills/**`.
- Release: no.
- New dependencies: none.
- Bootstrap: no `package.json`, lockfile or workflow exists yet, so `pnpm verify`, the Node baseline, mutations and Pass M cannot run. Static checks only, each N/A stated with its reason. Beni directed this docs-only treatment for this review.

## Fast-track

Not allowed: sensitive paths are touched.

## What to check, beyond the skill's standing checks

1. Do the rules, seats and independence rules route every pass without a seat reviewing its own lines?
2. Can each S00 and S01 acceptance criterion fail, and does its command prove the criterion rather than run something adjacent?
3. Are S00 and S01 each one coherent slice, with non-goals that keep the engine, UI and I/O out?
4. Does any file, commit message or PR text carry personal data?

## Sealed appendix: builder claims to verify independently

Not sealed: Pass 1 read the claims directly from the PR body before this record existed. The claims are the four rows of the PR #1 body's claims table, as sanitized on 2026-10-30.
