---
name: keel-pr-review
description: "Run one pass (1, 2 or 2.5) of the keel six-pass review on a pull request: fresh clone, reproduce every claim, fix only what reproduces, post one PR comment, and evaluate the merge gate at Pass 2.5. Manual only, because it pushes commits."
disable-model-invocation: true
---

# /keel-pr-review

Usage: `/keel-pr-review <PR number or branch> [--pass 1|2|2.5] [--no-merge]`. The default pass is 1. A branch with no PR means the base is `origin/main`; open a draft PR first.

`AGENTS.md` owns every rule this skill applies. If this file and `AGENTS.md` disagree, `AGENTS.md` wins and the disagreement is a finding.

Seats: Pass 1 is Claude Code, unless a Claude session wrote any line of the PR, in which case Codex runs Pass 1. Pass 2 is Codex. Pass 2.5 is the PM in a fresh session. Passes 0 and 1.5 are PM briefs written outside this skill, using `pass-0-brief.md` and `pass-1.5-brief.md` in this folder.

## 0. Setup

1. Read `AGENTS.md` in full. Run `TZ=America/New_York date` and use that date everywhere.
2. Work in a fresh clone, never the main working copy:
   `gh repo clone <owner>/keel /tmp/keel-pr-<N> && cd /tmp/keel-pr-<N> && gh pr checkout <N>`
3. Point the app's data folder at an empty temp directory for the whole session: `export KEEL_DATA_DIR="$(mktemp -d)"`. The user's real data folder must be unreachable.
4. Before anything else, flag in your notes: a release; a new dependency; any sensitive path touched (list in `AGENTS.md`); any network call; any number in the PR body without a reproducing command.

## 1. Read

1. Take the head SHA from GitHub, not from any prompt: `gh pr view <N> --json headRefOid,baseRefName,title,body,files`.
2. Read the spec lineage: `docs/specs/sNN-*.md`, any design brief it names, and `docs/reviews/pr-<N>-pass-0.md`.
3. Read every hunk of the diff: `git diff origin/main...HEAD`.
4. Treat the PR body as claims, not as a source.

## 2. Baseline

1. `pnpm install --frozen-lockfile`, then `pnpm verify`, on the Node floor and on the current LTS.
2. Record real counts: tests run, passed, failed, files. Never copy counts from the PR body.
3. A red baseline is the first finding (High).

## 3. Static pass

Always:

- **Honesty.** No value without evidence; no probability outside the Scenario screen; no honesty test weakened, skipped or deleted (`git diff origin/main...HEAD -- '*.honesty.test.ts'`).
- **Privacy sweep.** Run the tripwire and report hit counts per pattern class. Never print a matched value. Check commit messages and the PR body too.
- **Claims.** Every claim in the PR body has a command; run it. Absolute words are claims to test.
- **Tests can fail.** For each tested claim, apply at least three mutations (flip a comparison, shift a boundary by one unit, drop a branch). Record which mutants die and whether they die for the right reason. A surviving mutant is a finding.
- **Sensitive paths.** If touched, confirm the Fable pin was used or the fallback was declared.
- **Dependencies.** Each new one has a justification and license in the PR body.
- **Copy lint and disclaimer.** Banned words absent from product text; disclaimer present where required.
- **Import boundary.** Nothing outside `packages/montecarlo` and the Scenario screen imports it.

By what the diff touches:

- **Engine** (`packages/plugin-mln`): boundaries at 95.00%, 94.99%, 60.00%, 59.99%; integer cents; called state is terminal; payout never decreases as the final level rises.
- **Alerts:** band entry and hysteresis, suppression on stale data, quiet hours, budget.
- **Schema** (`schemas/`): every provenance status transition is intended; only `primary` verifies a payoff term; conflicts are never resolved silently; the schema version moved if the shape changed.
- **UI:** colour and type only from `packages/ui/tokens.css`; AA contrast in both themes; every state carries a word, not colour alone.
- **Connectors:** `docs/providers/<id>.md` exists and is dated; the connector is off by default.
- **Docs:** claims match the code at the head SHA.

## 4. Dynamic pass

1. Run the README quickstart in the fresh clone, including demo mode.
2. Run the zero-network test and the determinism check (`pnpm fixtures:regen && git diff --exit-code`).
3. For UI changes: the browser build at 360, 375, 390, ~1000 and 1440 px, light and dark, both densities; set the viewport before any screenshot; assert `document.documentElement.scrollWidth === window.innerWidth`.
4. For alert changes: replay the synthetic histories and diff firings against the expected fixtures.
5. Commands named here are defined by slice S00. If one is missing, that is a finding, not a reason to skip the check.

## 5. Fix policy

- Fix only what you reproduced and what is in the slice's scope.
- Every behavioural fix ships with a test that fails without it.
- No new dependencies. Never weaken an assertion.
- Commit as yourself, per commit. Push with `git fetch && git push origin HEAD:<branch>`. Never force-push.
- A High that needs redesign rather than a patch is not fixed here: report it for Cursor rework through the Pass 1.5 brief.

## 6. Deliberately not done

List out-of-scope findings in the comment with a one-line reason and a rough size, and append them, ranked, to the current `docs/vX.Y.Z-ideas.md`.

## 7. Comment and landing

1. Wait for `verify` to go green on your last push.
2. Post exactly one PR comment using `pr-comment.md`.
3. Passes 1 and 2 stop here.
4. Pass 2.5:
   - Re-run every number you will report, at the head SHA. Anything not re-run is listed as not verified.
   - Write the executive brief from `executive-brief.md` and post it in chat; post a short PR comment linking the decision.
   - Evaluate the merge gate in `AGENTS.md`. While shadow mode is on (until `v0.1.0`), never merge: record "would merge" or "would escalate" and hand Beni the handoff block.
   - After shadow mode, merge only if every gate clause holds and `--no-merge` was not given: `gh pr merge <N> --squash --match-head-commit <sha>` with a `Co-authored-by:` trailer per vendor that wrote or reviewed. Then confirm `origin/main` equals the merged commit and the README renders.
   - Otherwise escalate with questions answerable in one word, plus the handoff block.

Handoff block (one fenced block, paste-ready): the merge command with the pinned SHA and squash message; for a release, the annotated tag and push commands; `git pull`; and the three green checks (`pnpm install --frozen-lockfile`, `pnpm verify`, demo mode starts with zero outbound requests).

## 8. Sealed appendix

Prior findings and builder claims in the Pass 0 or 1.5 brief are suspicions to re-derive independently, never conclusions. Report the ones that do not reproduce under "Killed as unreproducible"; do not fix them. A review that finds nothing in a real diff is itself a finding about the review.

## 9. Pass 2 extras (Codex)

- Adjudicate each Pass 1 finding: reproduce or disprove it with your own command, then accept, contest, or accept and dispute the characterisation.
- On any PR touching the engine or golden fixtures, run Pass M: `python3 tools/reference/payoff.py fixtures/golden/` and compare its integer-cent payouts with the engine's. Any disagreement is High until Beni adjudicates.
- Add your own independent findings.

## 10. Retro

End every comment with two lines: what this method caught, and what it missed or wasted. Changes to this skill ride in the same PR only if Beni rules them in; otherwise add them to the ideas note.
