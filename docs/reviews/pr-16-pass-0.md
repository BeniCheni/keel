# Pass 0 brief: PR #16 (S90 iOS core spike spec, phone journey and ADR-0009)

Written by the PM on 2026-11-02 (America/New_York), at `9d16c9b736d57445ed3f4e7dbbe7e2f597a3a869`. The same Claude session wrote the PR and this brief, so Codex's Pass 1 is the cold read. This brief lives on branch `docs/pr-16-records`, not on the PR branch.

## Seat for Pass 1

Codex, GPT-6.1 Sol High, because a Claude session wrote every line. This pass is the plan challenge. The seat has no fallback, so if it is unavailable, stop and escalate.

Later seats: Pass 1.5 is the PM. On a Claude-authored PR, Codex's Pass 2 covers only Claude-authored commits after Pass 1, and a fresh Claude session on Opus 5.5 High takes Pass 2.5, including the cold read of any Codex commit. Beni merges.

## Scope

- Spec: this PR adds it. Design brief: none.
- Sensitive paths touched: none (`git diff --name-only origin/main...HEAD` lists `docs/README.md`, `docs/adr/0009-ios-companion-and-core.md` and `docs/specs/s90-ios-core-spike.md`).
- Release: no. S90 is a post-`v0.1.0` spike.
- New dependencies: none in this PR. The spec asks Beni to approve `esbuild` on the spike branch only.
- Bootstrap path: no. `verify` applies through CI. Mutations and Pass M do not apply, because no code or fixture changes.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| Every commit on the branch | Claude | Codex, Pass 1 |

Any Codex fix commit gets its cold read from the fresh Claude session at Pass 2.5.

## Fast-track

Not allowed: `AGENTS.md` sends every spec through the plan challenge, and Beni's prompt names it.

## What to check, beyond the skill's standing checks

Each is a question, not a finding. Edit nothing outside this PR's three files.

1. **Can the decision rule be gamed or left undecided?** It was written to bind the spike before code exists. Find a result that passes it without proving what it should, and an outcome it does not settle. Test the "Pre-registered edge cases" against each other. Is a threshold on a median the right gate, given what a person feels? Beni's prompt fixed the rule's three clauses, so challenge what the PM added around them.
2. **Story 9.1.** The spec says 9.1 works as transport and fails as content. Walk `docs/proposals/0001-product-research.md`'s stories and its Section 11 tables yourself. What else does the phone need that 9.1 does not carry? Is any "gap" not really one? Does the spec read "terms, observations and alerts" too narrowly or too widely?
3. **The journey table.** All 48 rows: is any role wrong, by the definitions given? Is any "needs from the core" wrong against what exists at `origin/main`? Could any "scheduled ahead" row not in fact be computed at import? Is any row that says "No" for a notification one a person would expect one for?
4. **The floor.** Does the "floor, element by element" table match Section 8's hierarchy? Is anything left out?
5. **Honesty on a phone.** Which screen or notification could state something false on stale data? The spec names reminders for an already-called note. Find others, such as a status sentence, a distance, or a stale-data timer after a device clock change. Rate them by `AGENTS.md` Severity.
6. **Q2's harness.** Can it fail for the right reasons? Is `JSON.stringify` a fair canonical form across engines, for number printing and for key order? Can a JSContext's default locale be set from an XCTest target at all, and if not, what does the check do? Is comparing unbundled Node with a bundled JSContext a fair test?
7. **Q3's measurement.** Will `xcodebuild test` in Release run under a Personal Team? Does Release keep testability? Does a debugger or test host distort it, and is a test target the wrong place to measure? Does "20 fresh JSContexts in one process" measure a cold start? Name a better command if there is one.
8. **Q1's traps.** Are they real? Read `yaml`'s `exports`, `ajv/dist/core.js` and `schema-map.ts`. What else in those libraries assumes a host the JSContext lacks?
9. **Q4's sizing.** Is **L** fair? Check the license and gap in each row. Is a candidate missing?
10. **Q5.** Read Apple's pages yourself. Does the spec's paraphrase of guidelines 2.5.2, 3.2.1(viii) and 5.1.1(ix) and license 3.3.1(B) hold? Is treating the last two as path-neutral right? What has it missed, such as privacy manifests or export compliance, that bears on a spike or on Beni's use?
11. **Q6 and the repo.** Will a `spike/ios-core/` folder keep `pnpm verify` green? Run the tripwire, copy lint, boundary check and determinism check against a planted folder in a scratch clone. Does anything walk the tree and trip on it?
12. **ADR-0009.** Is it really additive? Does anything in it weaken ADR-0001, ADR-0004 or ADR-0007, or a hard rule? Is "Strongest argument against" the strongest one?
13. **Scope.** Does anything here change the M1 slice plan? Does the throwaway-branch ruling fit `AGENTS.md`'s workflow, including who closes the PR and how results land?
14. **Numbers.** Every figure in the PR body and the spec has a command. Run them. The anchor figures are V8, labelled ESTIMATE: is that label enough?

Out of scope: writing spike code. List out-of-scope items in your comment, and the PM carries them. Edit nothing under `docs/` except this PR's three files.

## Sealed appendix: claims to verify independently

Do your own read before opening this. These are claims, not facts, from the PR body at `9d16c9b736d57445ed3f4e7dbbe7e2f597a3a869`. Re-derive each one.

| # | Claim | Command given |
| --- | --- | --- |
| 1 | 35 Must and 13 Should M1 stories | `grep -cE '\| Must · M1 \|$' docs/proposals/0001-product-research.md`, and the same for `Should` |
| 2 | The journey table has exactly those 48 IDs, at those priorities | A `diff` of IDs and priorities extracted from both files |
| 3 | 9 Primary, 24 Read-only, 15 Desktop-only | The `awk` line in the PR body |
| 4 | 31 fixtures: 2 valid, 29 invalid | `git ls-files fixtures/synthetic/terms \| grep -c '\.yaml$'` |
| 5 | 964 non-test lines in core; a 2163-line schema | `git ls-files packages/core/src \| grep -v test \| xargs cat \| wc -l`; `wc -l schemas/mln-terms/0.1.json` |
| 6 | `localeCompare` only in a test stub under `packages`; no locale API in the libraries' loaded code | `git grep -n localeCompare -- packages`; the Q2 `grep` |
| 7 | `getLogger` returns the global `console` when no logger is given | `sed -n 541,546p node_modules/.pnpm/ajv@8.20.0/node_modules/ajv/dist/core.js` |
| 8 | V8 anchors on an Apple M4, Node 24.22.2: import 93 to 103 ms, and 129 to 131 ms interpreter-only; median `loadTerms` 0.94 to 1.05 ms, and 2.33 to 2.44 ms | The "Anchor" script. Your machine will differ, so check the order of magnitude and the method |
| 9 | Licenses of the five Q4 libraries and `esbuild` | `gh api repos/<repo> --jq .license.spdx_id` |
| 10 | macOS CI cells of 56 and 59 seconds | `gh run view 41482481086 --json jobs` |
| 11 | Apple's rules as paraphrased | The pages under "Sources" in the spec |
