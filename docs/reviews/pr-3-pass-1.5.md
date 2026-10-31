# Pass 1.5 brief: PR #3

Written by the PM on 2026-10-30 (America/New_York) after reading the Pass 1 comment on PR #3 (issuecomment-6532940023; reviewed head `3c8b544`, post-fix head `d0caa9c`) and Beni's rulings. Codex receives this brief for Pass 2. Like the Pass 0 brief, it lives on branch `docs/pr-3-reviews`, not on the PR branch.

All ten findings are accepted. Finding 7 is accepted with a narrower severity reading (below). None goes to Cursor as rework: Pass 1 fixed every finding that a commit can fix, and the rest are records. The PM added one commit to the PR, `55774a1`, which brings the spec in line with rulings 1 to 3. The PM also appended a "Corrections after Pass 1" section to the PR body for findings 2, 7, 8 and 10, leaving Cursor's text unchanged.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | High | accept | A boundary mutant survived and a qualifying token was missed. Closed by `9cb2a56` (its new test fails without it) and `d0caa9c`. Ruling 3 confirms the window counts where the token starts. | no |
| 2 | Medium | accept | Every acceptance command ran the whole suite, so none isolated its criterion. Closed by `885eb4b`. Ruling 1 moves the spec to the working form (`55774a1`); the PR body correction says so. | no |
| 3 | Medium | accept | The local guard is the only network layer on macOS and on a developer's machine, so its gaps matter even though the spec named only six calls. Closed by `68bac4e`. Ruling 2 makes the 22 entry points the required set (`55774a1`). | no |
| 4 | Medium | accept | An exported variable could print a full green gate with no step run. Closed by `585c12e` (argv only, stub announced on stderr). | no |
| 5 | Medium | accept | The namespace probe could pass without reaching the network. Closed by `84d160e`; the live run prints the no-route codes. `55774a1` records the code requirement in the spec, matching the fix. | no |
| 6 | Medium | accept | Four off-boundary mutants survived. Closed by `aa78a99` (tests only). | no |
| 7 | Medium | accept, with a narrower severity reading | `8b9dfee` is red in CI and the builder's rule is every commit green. The severity table's "a red build" is a High when the head is red; here the head is green, so Medium stands. History cannot be rebuilt without a force-push. Ruling 4 keeps the red run as recorded history, and the PR body correction now states it. Process note for the next build prompt: Cursor confirms CI is green on each pushed commit before pushing the next. | no |
| 8 | Low | accept | Four mutant-table rows overclaimed. Closed in the PR body correction; T8 and T18 now die after `9cb2a56`. | no |
| 9 | Low | accept | Honesty discovery proved its negative only by the absence of a message. `aa78a99` adds positive assertions; a structured reporter is an ideas-file candidate. | no |
| 10 | Low | accept | The Node-version citation pointed at setup-node's line. Closed in the PR body correction. | no |

Surviving mutants left open by Pass 1: T14 and T15 are equivalent (accepted as unkillable); T20 (`NoReply` case) and T26 (synthetic marker by `includes`) loosen rules the spec does not pin (accepted as Low, not fixed).

**Correction after Pass 2 (PM, 2026-10-30):** the sentence above was wrong about T14 and T15. Codex showed both are non-equivalent surviving boundary mutants (High): a direction followed by three words, and a unit, each change the scanner's result when deleted. Beni ruled during Pass 2 to treat them as High and close them test-only. `fc13571` kills both (issuecomment-6537661855, finding P2-A). The sentence is kept as the record of what this brief said.

Ideas-file note for S01, from Pass 1's idea 2: a 9-digit integer passes the CUSIP check digit one time in ten, so S01's fixture generator must keep every integer-cent value below nine digits, or the tripwire will flag its own fixtures. This goes into the S01 build prompt; it needs no change here.

## Authorship record

From `git log --format='%h %an' origin/main..55774a1`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `8b9dfee`, `3c8b544` | Cursor | Claude Code, Pass 1 |
| `9cb2a56`, `585c12e`, `68bac4e`, `84d160e`, `aa78a99`, `885eb4b`, `0fadf6a`, `d0caa9c` (Pass 1 fixes and ideas) | Claude (Pass 1 session) | Codex, Pass 2 |
| `55774a1` spec rulings | Claude (PM) | Codex, Pass 2 |
| Any Codex fix commit at Pass 2 | Codex | fresh Claude session, Pass 2.5 |

## Rulings from Beni

Beni ruled on 2026-10-30 (America/New_York):

1. The spec's AC2 to AC9 commands become `pnpm test:tooling -- <name>`. **Approved.**
2. The S00 spec records the 22-entry guard list from `68bac4e` as the required set. **Approved.**
3. "Within 40 characters after an account keyword" means the token starts within 40 characters and may end beyond them, as `9cb2a56` implements. **Approved.**
4. `8b9dfee`'s red run 41112013304 stays as recorded history, with the PR body corrected; no rebuild. **Approved.**

## Sealed appendix for Pass 2

Pass 1's findings and fixes are suspicions to re-derive, not conclusions. Codex gives the cold read of all nine Claude-authored commits (`3c8b544..55774a1`), reproduces or disproves each Pass 1 finding with its own commands, and checks that each fix commit's test fails without it. Codex also runs the owner's private-list check (counts only), which the Fable seat did not run, and adds its own independent read of the whole PR at the head. Pass M does not apply: no engine.
