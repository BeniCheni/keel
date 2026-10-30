# docs index

Every slice moves through up to four rungs: proposal (the research behind the product), design brief (UI slices only), spec (the build authority), and review records (one Pass 0 brief, one Pass 1.5 brief, and the executive brief per PR). A rung may be skipped; this table records which.

| Slice | Release | Spec | Design brief | Review records | Status |
| --- | --- | --- | --- | --- | --- |
| S00 Repo tooling | toward `v0.1.0` (non-release) | `specs/s00-tooling.md` | none (no UI) | `reviews/pr-<N>-*` | spec drafted 2026-10-29 |
| S01 Terms schema 0.1 and loader | toward `v0.1.0` (non-release) | `specs/s01-terms-schema.md` | none (no UI) | `reviews/pr-<N>-*` | spec drafted 2026-10-29 |

Folders:

- `proposals/`: scrubbed copies of the product research. The original is private because it names a real holding.
- `specs/`: one file per slice, `sNN-<slug>.md`.
- `design/`: design briefs and Executive Handoff Briefs. Prototypes themselves stay in the local-only `design/` folder at the repo root.
- `reviews/`: `pr-<N>-pass-0.md`, `pr-<N>-pass-1.5.md`, and executive briefs worth keeping.
- `adr/`: architecture decision records, `NNNN-<slug>.md`.
- `providers/`: one terms review per data connector.
- `v0.1.0-ideas.md`: ranked candidates. Never a release scope.

Precedence when documents disagree: `AGENTS.md` first. For a slice, the spec governs behaviour and the design brief governs appearance; if they conflict, stop and report.
