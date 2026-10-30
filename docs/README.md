# docs index

Every slice moves through up to four rungs: proposal (the research behind the product), design brief (UI slices only), spec (the build authority), and review records (one Pass 0 brief, one Pass 1.5 brief, and the executive brief per PR). A rung may be skipped; this table records which.

| Slice | Release | Spec | Design brief | Review records | Status |
| --- | --- | --- | --- | --- | --- |
| Scaffold (PR #1) | n/a | none; adds S00 and S01 | none | `reviews/pr-1-pass-0.md` (retroactive), `reviews/pr-1-pass-1.5.md`, `reviews/pr-1-pass-2.5.md` (executive brief) | merged 2026-10-30 at squash `8b316f3`, reviewed head `97ac4dc` |
| S00 Repo tooling | toward `v0.1.0` (non-release) | `specs/s00-tooling.md` | none (no UI) | `reviews/pr-<N>-*` | spec revised 2026-10-30 after the plan challenge |
| S01 Terms schema 0.1 and loader | toward `v0.1.0` (non-release) | `specs/s01-terms-schema.md` | none (no UI) | `reviews/pr-<N>-*` | spec revised 2026-10-30 after the plan challenge |

Folders:

- `proposals/`: scrubbed copies of the product research. The original is private because it names a real holding.
- `specs/`: one file per slice, `sNN-<slug>.md`.
- `design/`: design briefs and Executive Handoff Briefs. Prototypes themselves stay in the local-only top-level `/design/` folder, which `.gitignore` excludes; `docs/design/` is tracked.
- `reviews/`: `pr-<N>-pass-0.md`, `pr-<N>-pass-1.5.md`, executive briefs worth keeping, and `gate-activation.md` once Beni ends shadow mode.
- `adr/`: architecture decision records, `NNNN-<slug>.md`.
- `providers/`: one terms review per data connector.
- `v0.1.0-ideas.md`: ranked candidates. Never a release scope.

Precedence when documents disagree: `AGENTS.md` first. For a slice, the spec governs behaviour and the design brief governs appearance; if they conflict, stop and report.
