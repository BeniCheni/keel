# Changelog

All notable changes to keel are recorded here. Versions follow semver. Dates are in America/New_York.

## [Unreleased]

### Added

- `AGENTS.md` (the owning rules file) and a `CLAUDE.md` that imports it.
- The `/keel-pr-review` skill with its PR comment, executive brief, Pass 0 and Pass 1.5 templates, and a pointer copy for Codex and Cursor.
- Specs for S00 (repo tooling) and S01 (terms schema 0.1 and strict loader).
- `README.md`, `DISCLAIMER.md`, `SECURITY.md`, `.gitignore`, and the `docs/` index.
- ADR-0001 to ADR-0008 in `docs/adr/`, recording the Milestone 1 architecture.
- Spec for S00.1 (tooling hardening), ruled to build before S01.

### Changed

- `AGENTS.md`: `main` moves only by a pinned PR squash merge; the `main` ruleset now also requires the `verify` check and allows squash merges only. Records PRs (only `docs/reviews/**` and their index rows) need no review passes and write no records of their own. Builders push the next commit only after CI is green on the last. Follow-up slices may be numbered `sNN.M`.
- The review skill's handoff block spells every `Co-authored-by` trailer out in full, resolved in the reviewed clone (idea 8).
- S00 repo tooling merged as squash commit `e9ab4ba` (PR #3). Its `Co-authored-by: Cursor <>` trailer is empty by a handoff-block error; Cursor authored the slice's two build commits, `8b9dfee` and `3c8b544`. Beni ruled to record this rather than rewrite `main` (`docs/reviews/pr-3-pass-2.5.md`).

### Deliberately not done

- No product code; S00 is the first code slice.
- The product research is not committed, because it names a real holding; a scrubbed copy is planned for `docs/proposals/`.
