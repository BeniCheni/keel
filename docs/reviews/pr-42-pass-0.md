# Pass 0 brief: PR #42 (S03.1 Decision 7, one honesty test rewritten for g12)

Written by the PM on 2026-11-14 (America/New_York), from a fresh read of the PR at `d568181`. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing. When it was written, PR #42 had no comment (`gh api repos/BeniCheni/keel/issues/42/comments --jq length` printed `0`). The brief sits on `docs/pr-42-records`, not on the PR branch, so the PR's diff stays one spec file. Records PR #41 also edits the S03.1 row of `docs/README.md`, and this PR's index row would sit next to it.

## Seat for the cold review

Codex, GPT-6.1 Sol High. The PR touches no sensitive path, so the High effort applies. `AGENTS.md` asks for one cold review by a vendor that did not write the PR, and a Claude session wrote every line. Cursor does not take it: the amendment changes the rules of the S03.1 build Cursor is doing now, and settles the stop Cursor raised. The seat has no fallback: if it is unavailable, stop and escalate.

## Scope

- **Spec:** this PR amends `docs/specs/s03.1-reference-k.md` alone. Design brief: none.
- **Sensitive paths touched:** none. `git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers | wc -l` prints `0`.
- **Release:** no. New dependencies: none.
- **Checks that apply:** this is not the bootstrap path, so `verify` applies. Mutations and Pass M are N/A: no code, test or fixture changes. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.

## The ruling the PR records

**"Rewrite that test (Recommended)", 2026-11-14 at 00:32:49 EST, in the PM's session.** The PM asked at 00:32:26 EST. Decision 7 quotes the question in full.

- **The chosen option read:** "Amend the spec so Cursor changes only that one test. It lists the golden cases that don't evaluate, requires that list to be exactly g12, and still requires a next event on every live case. All 11 existing cases must still evaluate. In my probe it passes with g12, and fails if another case stops evaluating or if g12 is missing. Needs your word that this isn't weakening under hard rule 3."
- **Its preview** showed the test text that Decision 7 now gives, and the probe's four results.
- **He declined:**
  - "Drop g12": "Keep g13 only, and change no honesty test. Pass M then cannot see the k-rule disagreement, so PR #38's uncommitted reproducer (AC1) stays the only check on it."
  - "Separate g12 folder": "Put g12 outside fixtures/golden, for example in fixtures/golden-unavailable/, with a second Pass M run and a new registry tree. No honesty test changes, but more spec and tooling change."

The cold review cannot see that session. Beni's merge confirms the ruling.

**Cursor's stop,** as Beni relayed it to the PM at 00:30:11 EST, with nothing committed:
- `pnpm verify` on Node 24.22.2 failed in the honesty test "a live golden evaluation names its next event", with g12's frozen `unavailable` result as the error.
- AC9 and the Honesty tests section forbade any change to the test.
- Two other red checks were separate:
  - `payoff.policy.test.ts` pinned 11 golden folders, a case-list pin Cursor had moved to 13;
  - the determinism step failed, because the six new golden files were not yet tracked.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `d568181` | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or a numbering fork. One cold review by Codex replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message. The rewritten test itself is code, and it gets the full passes in the S03.1 build PR: Pass 1 by Claude Code on Fable 5.2 Extra, Pass 2 by Codex, and Pass 2.5 by a fresh Claude session on Fable 5.2 High.

## What to check, beyond the skill's standing checks

1. **The rewrite.** Is Decision 7's text a correct replacement for the test at `883bdd1`, lines 503 to 509 of `packages/plugin-mln/src/payoff.honesty.test.ts`? Every name it uses is already imported or defined in that file. Run the PR body's `honesty-probe.sh`, after reading it, in a clone of `main` with `node_modules` installed. The PM also ran `pnpm -s verify:typecheck` with the rewrite applied, and it exited 0.
2. **Hard rule 3.** At `883bdd1`, the test asserted two things about every golden case: it evaluates, and, if `live`, it names its next event. Does the rewrite relax either for any of the 11 existing cases? Can a future case stop evaluating without the test failing?
3. **AC9.** Does the line rule admit exactly the rewrite, and fail on an edit elsewhere in the file or in another honesty file? The rule is that every hunk's old range lies within lines 503 to 509. Is "the test reads as Decision 7 gives it" checkable as written?
4. **Agreement.** Do the status line, Decision 7, Scope, Honesty tests, AC9 and the Mutation floor agree with each other and with Non-goals? Does any other line of the S03.1 spec, or of the S03 spec, still say that no honesty test changes?
5. **Scope.** Is the new bullet right that the golden-folder count in `payoff.policy.test.ts` is part of the case list? Is excluding `*.honesty.test.ts` from the general test-file bullet right?
6. **The mutants.** Does each of Decision 7's two mutants fail the rewritten test? Is each stated exactly enough for Cursor to apply it?
7. **Copy.** The quoted question contains "should". `pnpm -s verify:copy` exits 0. Is quoting Beni's question verbatim acceptable here, as earlier specs have done?
8. **Privacy.** This seat runs the owner's private-list check, counts only, over the diff, the commit message, the PR title and body, every comment, this brief and its own proposed comment.

Out of scope: any change to code, tests, fixtures or `AGENTS.md`, and Cursor's paused build. Findings there go in the comment for the PM to carry.
