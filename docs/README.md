# docs index

Every slice moves through up to four rungs: proposal (the research behind the product), design brief (UI slices only), spec (the build authority), and review records (one Pass 0 brief, one Pass 1.5 brief, and the executive brief per PR). A rung may be skipped; this table records which.

| Slice | Release | Spec | Design brief | Review records | Status |
| --- | --- | --- | --- | --- | --- |
| Scaffold (PR #1) | n/a | none; adds S00 and S01 | none | `reviews/pr-1-pass-0.md` (retroactive), `reviews/pr-1-pass-1.5.md`, `reviews/pr-1-pass-2.5.md` (executive brief) | merged 2026-10-30 at squash `8b316f3`, reviewed head `97ac4dc` |
| Pass 2.5 record for PR #1 (PR #2) | n/a | none | none | `reviews/pr-2-pass-0.md` | merged 2026-10-30 at squash `0db249a` |
| S00 Repo tooling (PR #3) | toward `v0.1.0` (non-release) | `specs/s00-tooling.md` | none (no UI) | `reviews/pr-3-pass-0.md`, `reviews/pr-3-pass-1.5.md`, `reviews/pr-3-pass-2.5.md` (executive brief) | merged 2026-10-31 at squash `e9ab4ba`, reviewed head `bbe3aec` |
| Review records for PR #3 (PR #5) | n/a | none | none | `reviews/pr-5-pass-0.md`, `reviews/pr-5-pass-2.5.md` (executive brief) | merged 2026-10-31 at squash `330cc87`, reviewed head `fed9d33` (fast-track) |
| Record of the PR #5 merge and ideas 7 to 9 (PR #6) | n/a | none | none | `reviews/pr-6-pass-0.md` | landed 2026-10-31 as `f47e047`, outside the PR: GitHub records no merge on PR #6 and no CI run on that commit; its tree equals the PR's reviewed head `731ad5d` |
| Housekeeping: trailers, rules, ADRs, S00.1 spec (PR #7) | n/a | adds `specs/s00.1-tooling-hardening.md` | none | `reviews/pr-7-pass-0.md`, `reviews/pr-7-pass-1.5.md`, `reviews/pr-7-pass-2.5.md` (executive brief) | merged 2026-10-31 at squash `8a04ff3`, reviewed head `d3852d9` |
| S00.1 Tooling hardening (PR #8) | toward `v0.1.0` (non-release) | `specs/s00.1-tooling-hardening.md` | none (no UI) | `reviews/pr-8-pass-0.md` (rebuilt 2026-11-01; the original never reached GitHub), `reviews/pr-8-pass-1.5.md`, `reviews/pr-8-pass-2.5.md` (executive brief) | merged 2026-11-01 at squash `f0ad018`, reviewed head `5fcd521` |
| Scrubbed product research (PR #9) | n/a | none; adds `proposals/0001-product-research.md` | none | `reviews/pr-9-pass-0.md` | merged 2026-11-01 at squash `7b6eddd`, reviewed head `c0ff7d5` (fast-track) |
| S00.2 Test-registration guard (PR #10) | toward `v0.1.0` (non-release) | none, by Beni's ruling 5 in `reviews/pr-8-pass-2.5.md`, which holds the build brief | none (no UI) | `reviews/pr-10-pass-0.md`, `reviews/pr-10-pass-1.5.md`, `reviews/pr-10-pass-2.5.md` (executive brief) | merged 2026-11-01 at squash `44fa3ae`, reviewed head `5989f81` |
| S01 Terms schema 0.1 and loader | toward `v0.1.0` (non-release) | `specs/s01-terms-schema.md` | none (no UI) | `reviews/pr-<N>-*` | spec revised 2026-10-30 after the plan challenge |

Folders:

- `proposals/`: scrubbed copies of the product research. `0001-product-research.md` holds Sections 1 to 4, 8 and 11 (personas, user stories, chart and alert catalogs, UX direction, Milestone 1 specification). The original is private because it names a real holding.
- `specs/`: one file per slice, `sNN-<slug>.md`, or `sNN.M-<slug>.md` for a follow-up slice Beni numbers that way.
- `design/`: design briefs and Executive Handoff Briefs. Prototypes themselves stay in the local-only top-level `/design/` folder, which `.gitignore` excludes; `docs/design/` is tracked.
- `reviews/`: `pr-<N>-pass-0.md`, `pr-<N>-pass-1.5.md`, executive briefs worth keeping, and `gate-activation.md` once Beni ends shadow mode.
- `adr/`: architecture decision records, `NNNN-<slug>.md`. ADR-0001 to 0008 record the Milestone 1 architecture: Tauri shell, core without I/O, terms as YAML with provenance, SQLite outside the repo, no value without evidence, bring-your-own-key connectors, end-of-day check, Monte Carlo isolated.
- `providers/`: one terms review per data connector.
- `v0.1.0-ideas.md`: ranked candidates. Never a release scope.

Precedence when documents disagree: `AGENTS.md` first. For a slice, the spec governs behaviour and the design brief governs appearance; if they conflict, stop and report.
