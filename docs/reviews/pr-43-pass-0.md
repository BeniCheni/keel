# Pass 0 brief: PR #43 (S03.1 build: noteMetrics's hole skip, and golden cases g12 and g13)

Written by the PM on 2026-11-14 (America/New_York), from a fresh read of the PR at `bd9ae4597acd194ffbe3c91870de40f8cbf298c2`. This brief lives on branch `docs/pr-43-records`, not on the PR branch, so that no Claude-authored commit enters PR #43 and Pass 1 stays Claude Code. When it was written, PR #43 had no comment (`gh api repos/BeniCheni/keel/issues/43/comments --jq length` printed `0`).

## Seat for Pass 1

Claude Code, fresh session, fresh clone. Model Fable 5.2 Extra, because sensitive paths are touched; `AGENTS.md` pins it. Fallback Opus 5.5 High; say so in the comment if it is used. Fable seats work on synthetic data only and never open the private-list file.

Later seats, each the `AGENTS.md` default (Beni's ruling of 2026-11-13 at 17:14 EST, below):
- **Pass 1.5** is the PM.
- **Pass 2** is Codex, GPT-6.1 Sol Extra High, with no fallback. It amends `tools/reference/payoff.py` under S03.1 Decision 2, reports AC1 to AC3 and the mutation floor's first two mutants, runs Pass M, gives the cold read of Pass 1's commits, and runs the private-list check, counts only.
- **Pass 2.5** is a fresh Claude session on Fable 5.2 High, fallback Opus 5.5 High. It gives the cold read of Codex's commits.

Beni merges. The PR is a draft and must be marked ready before it can merge.

## Scope

- **Spec:** `docs/specs/s03.1-reference-k.md`, as amended by PR #42 (Decision 7), read with `docs/specs/s03-payoff-engine.md` as amended by PR #40. Design brief: none.
- **Sensitive paths touched:** `packages/plugin-mln/**` (5 files) and `fixtures/golden/**` (6 files), counted with `git diff --name-only origin/main...HEAD -- <path> | wc -l`. The other three files are on the spec's Scope list: `tools/generators/golden/generate.mjs`, `tools/acceptance/test/golden-generator.test.mjs` (new) and `tools/fixtures/registry.mjs`.
- **Release:** no. **New dependencies:** none (AC10).
- **Checks that apply:** this is not the bootstrap path, so install, `verify` and mutations apply.
  - Pass M at Cursor's head is expected to print `cases 13, disagreements 1`, with g12 the only disagreement, and exit 1 (S03.1's Pass M section and Decision 2). Beni has ruled on that disagreement, so it is not a new High. The reference amendment and AC1 to AC3 are Codex's at Pass 2.
  - Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.
- **Diff:** 14 files, 1272 insertions, 8 deletions (`git diff --shortstat origin/main...HEAD`).
- **Base:** `origin/main` at `0fda80f`, the PR #42 squash (`git merge-base origin/main HEAD`).
- **CI:** run 43637151435 at `bd9ae45`, event `pull_request`, conclusion `success`, attempt 1 (`gh run view 43637151435 --repo BeniCheni/keel --json headSha,event,conclusion,attempt`).

## Rulings every seat carries

Each was given in a session the seats cannot see. The records on `main` quote them, and Beni's merge confirms them.

- **From PR #38's review, 2026-11-13** (`docs/reviews/pr-38-pass-2.5.md`):
  - **The `k` rule, 14:35 EST, "No (Recommended)".** A listed item dated after the final valuation date does not count toward `k`. The engine stands, and the reference follows it (S03.1 Decisions 1 and 2).
  - **"Follow-up PR", 15:07 EST.** The reference fix moves to this slice.
  - **15:28 EST, "S03.1 (Recommended)" and "One spec PR (Recommended)".**
- **From PR #40's review, 2026-11-13** (`docs/reviews/pr-40-pass-0.md` and `pr-40-pass-1.5.md`):
  - **The builder, 17:14 EST, "No (Recommended)"** to "Does S03.1 override AGENTS.md's builder seat?". Every seat is the `AGENTS.md` default: Cursor builds and never edits `tools/reference/**`, and Codex amends the reference at Pass 2. It superseded "Codex, adjudicating (Recommended)" of 15:28 EST.
  - **PR #40's High, 17:43 EST, "Fix in S03.1 (Recommended)".** `noteMetrics` threw on a hole in `closes`. Decision 6 has this build skip it, and the High stays open on `main` until AC12's test lands and fails without the fix.
- **From PR #42, 2026-11-14** (the S03.1 spec's status line and Decision 7):
  - **00:32:49 EST, "Rewrite that test (Recommended)".** Cursor stopped before its first commit, because the honesty test "a live golden evaluation names its next event" requires every golden case to evaluate, and g12's frozen result is `unavailable`. Decision 7 lets this build rewrite that one test, to the text it gives. AC9 pins the file's tree entry: `100644 blob 6190a5eb06d34b22e075a5df5ffc1015887abbc5`.

Beni's later ruling on PR #42, "One last read (Recommended)" at 13:50:56 EST, concerned that PR's merge only. It does not apply here.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `bd9ae45` fix(plugin-mln): skip a hole in noteMetrics and pin the k and year-10000 cases | Cursor | Claude Code, Pass 1 |

Any fix commit Pass 1 pushes is Claude-authored and gets its cold read from Codex at Pass 2. Codex's reference amendment and any Codex fix get their cold read from the fresh Claude session at Pass 2.5. A Claude session wrote the spec, its amendments, the build prompt and the resume note, but no commit on this branch. The session that wrote this brief takes no review pass on this PR.

**History of the build.**
- Beni pasted the build prompt into a Cursor chat in `~/code/keel-s03.1` on 2026-11-14, after 00:00:08 EST, when the PM handed it over.
- Cursor stopped before its first commit on the honesty-test conflict, which led to PR #42.
- After PR #42 merged, Beni pasted the PM's resume note, handed over at 14:58:50 EST. Cursor then stashed its uncommitted work, reset its branch onto `0fda80f` and committed `bd9ae45`.
- Both texts are printed at the end of this brief, and the PM cannot see what Cursor received.

## Fast-track

Not allowed: the diff is code on sensitive paths.

## What to check, beyond the skill's standing checks

Each is a question, not a finding. The PM's results for some are in the sealed appendix, so that your first read stays your own.

1. **Decision 6 and the input contract.** The engine change is `noteMetrics`'s loop over `closes` alone, now an index loop that skips an index with no element. With it, does any exported function still throw on a `closes` value its type admits?
   - Codex's `sparse-contract.mjs`, printed in PR #40's Pass 2 comment ([issuecomment-6867211522](https://github.com/BeniCheni/keel/pull/40#issuecomment-6867211522)), exited 1 at `9ec6fd0`. Does it exit 0 at the head?
   - Does `close-invalid` still name a close by its index in the array as given, holes counted?
2. **AC12 and PR #40's High.** Does the test assert everything AC12 lists?
   - A hole before, between and after the closes, each deep-equal to the closes without it;
   - `new Array(1)`, deep-equal to `[]`;
   - an invalid close after a leading hole, giving `close-invalid` at index 1.

   Does it fail at `0fda80f`, without the fix, as well as under the three Decision 6 mutants the body gives? Say whether PR #40's High closes.
3. **Decision 7 and AC9.** Run AC9's two commands exactly as the spec states them, from the clone's root. Is `payoff.honesty.test.ts` the only honesty file changed, and is its tree entry the pinned line? Do Decision 7's two mutants fail the rewritten test as the body says?
4. **g12 and g13 against the spec's Frozen values.** Are the terms, `asOf` and closes as the spec defines them? Are the expected outputs the engine's own? Does `payoff.golden.test.ts` assert the frozen values the spec lists, including g13's evaluation fields? Recompute the g13 cents independently, rather than reading the test.
5. **The generator.**
   - The version moves to 2, and the 11 existing cases stay byte-identical.
   - Regeneration is byte-identical on both Nodes, and every new golden JSON file carries `"synthetic": true`.
   - The tripwire scan still runs before writing, and no allowlist entry is added.
   - `placeRow` is newly exported, so the guard tests can call it. Is that within Scope's "for the two cases, the version and the guard"?
6. **AC7 and AC8.** Does each guard test fail under its mutant? Do AC8's three neighbouring shapes (`fixedClose`, `conflict`, `missing` naming `worstTicker`) reach the branches Decision 4 names?
7. **Pass M at Cursor's head.** Is the output 13 cases with g12 the only disagreement, at `$.evaluation.reasons[1]`?
8. **The mutation floor.** Count the killed mutants per claim against the spec's floor. Can each be re-run exactly from the PR body? The `events.ts` continue mutant must fail both PR #38's test at `payoff.evaluate.test.ts:682` and AC5's test on g12.
9. **Scope.**
   - Run AC6 in its two steps and AC10.
   - Is any file outside the spec's Scope list changed?
   - The body says `test-contract.test.mjs` and `determinism.test.mjs` needed no change. Is that so?
10. **The rebase.** The branch is one commit on `0fda80f`. Is anything from the earlier base left that does not belong to this slice?

Out of scope: `tools/reference/**`, AC1 to AC3 and the floor's first two mutants (Codex's at Pass 2); the README, the ideas list and `AGENTS.md`; and the three open findings about proof scripts in PR #42's body, which are not part of this slice. List any out-of-scope finding in your comment; the PM carries it.

## Sealed appendix: to verify independently

Do your own read before opening this. Everything here is a claim, not a fact. Re-derive each one; report any that do not reproduce.

### Builder claims, from the PR body at `bd9ae45`

| # | Claim (as the builder stated it) | Command or source the builder gave |
| --- | --- | --- |
| 1 | 14 changed files, as the body's Files table lists; one commit, by Cursor, on `0fda80f` | `git diff --name-status origin/main...HEAD` |
| 2 | Effort Grok 4.7 Extra High set in the picker; no sub-agent; no fallback | The body's "Seat, effort, and base" |
| 3 | The rebase onto `0fda80f`: no commits and nothing on the remote before it; `git stash pop` reported no conflict | The same section |
| 4 | AC4: six `A` lines under `fixtures/golden`; regeneration and the trees status clean on both Nodes; the registry prints `2` at the head and `1` at `9ec6fd0` | The commands in the body's AC4 section, including the worktree with linked `node_modules` |
| 5 | AC5: the golden test pins 13 cases, deep-equals g12's evaluation and payouts and g13's payouts, and checks g13's evaluation fields | `payoff.golden.test.ts`, test `golden fixtures match the frozen cases` |
| 6 | AC6: `changed.txt` lists five files; the filter prints nothing; the `engine.ts` diff changes the loop alone | The body's AC6 commands and diff |
| 7 | AC7 and AC8: each guard test fails under its mutant, and the other test in the file passes | The body's diffs and `pnpm exec vitest run --config tools/vitest.config.mjs golden-generator.test.mjs` |
| 8 | AC9: one honesty file listed; `ls-tree` prints the pinned line | The body's AC9 commands |
| 9 | AC10: exit 0 | `git diff --quiet origin/main...HEAD -- package.json pnpm-lock.yaml packages/plugin-mln/package.json` |
| 10 | AC11: `verify` exits 0 on both Nodes, with core 178 in 16 files, plugin 211 in 12, tooling 125 in 11; status clean | `pnpm install --frozen-lockfile && pnpm verify` |
| 11 | AC12: the metrics test is in the suite, and each of the three Decision 6 mutants fails it | The body's diffs and `pnpm --filter @keel/plugin-mln exec vitest run --config vitest.config.mjs payoff.metrics.test.ts` |
| 12 | AC2 at this commit: Pass M exits 1, with `cases 13, disagreements 1`, g12 alone at `$.evaluation.reasons[1]` | `python3 -I tools/reference/payoff.py fixtures/golden/` |
| 13 | The `events.ts` continue mutant fails two tests, 209 passing; the g12 expected-output mutant fails the golden test | The body's diffs and commands |
| 14 | Decision 7's two mutants each fail the rewritten test, with the received lists `["g03-live", "g12-listed-after-final"]` and `[]` | The body's diffs and the honesty test command |

### PM runs at `bd9ae45`

In a fresh clone with a fresh `mktemp -d` as `KEEL_DATA_DIR`, on Node v24.22.2 and v26.13.0:

| Check | Command | Result |
| --- | --- | --- |
| Install and verify | `pnpm install --frozen-lockfile`, `pnpm verify` | Exit 0 for each on both Nodes. Core 178 in 16 files, plugin 211 in 12, tooling 125 in 11; status clean afterwards |
| Tripwire | `node tools/tripwire/cli.mjs .`, and `scanRepo` counted per class | Exit 0, no output, nothing on stderr; 0 in each of the ten classes |
| Scope | `git diff --name-only origin/main...HEAD`, against the spec's Scope list | No path outside it; 0 under `tools/reference`, `packages/core`, `schemas`, `fixtures/synthetic`, `docs`, `CHANGELOG.md`, `README.md`, `package.json` and `pnpm-lock.yaml` |
| The 11 existing cases | `git diff --quiet origin/main...HEAD -- <the 11 case folders>` | Exit 0 |
| `"synthetic": true` | `grep -c '"synthetic": true'` over the new cases' `input.json` and `expected/result.json` | 1 in each of the four files |
| The registry | `git diff origin/main...HEAD -- tools/fixtures/registry.mjs` | The comment alone, "version 1" to "version 2". The value comes from `generate.mjs`'s `export const version`, now `2` |
| Pass M | `python3 -I tools/reference/payoff.py fixtures/golden/` | Exit 1, `cases 13, disagreements 1`; g12 alone |
| AC9 | The spec's two commands, from the clone's root | One file listed; `100644 blob 6190a5eb06d34b22e075a5df5ffc1015887abbc5` |

### PM reads at `bd9ae45`

These were done to sharpen the questions. They are not findings.

- g12's `input.json` has `asOf` 2026-08-31 and one close per member (`ALFA`, `BRVO`, `CHRL`, `DLTA`) on that date. Its terms differ from g02's in one line, item 18's date, 2031-02-26 to 2031-03-03 (`git diff --no-index -U0 fixtures/golden/g02-called-second/terms.yaml fixtures/golden/g12-listed-after-final/terms.yaml`).
- g13's `input.json` has `asOf` 9999-11-30, one close per member on that date, trade 9999-05-28, settlement 9999-06-01, first call 9999-12-01, final valuation and maturity 9999-12-31, and a monthly call frequency.
- AC12's test, `noteMetrics skips a hole in closes`, builds its holes with a helper, `holeAt`, and asserts with `Object.hasOwn` that each hole is a real hole, not an `undefined` element.
- `golden-generator.test.mjs` has two tests. The second asserts that the silent-skip shape throws and that the `fixedClose`, `conflict` and `missing` shapes do not.
- `payoff.golden.test.ts` pins g12's unavailable result and g13's payouts inline, as well as through `expected/result.json`.

## Build prompt

As the PM handed it to Beni on 2026-11-14 at 00:00:08 EST, taken as data from the PM's session transcript. SHA-256 of the text plus a final newline: `5676e649840c1f70e1743a1d3a722d7908acca40d588e0b90677687145299e10`.

```
You are Cursor, the Builder for slice S03.1 of BeniCheni/keel: two golden cases, two generator guards, and one change to noteMetrics in @keel/plugin-mln.
Set up first. This chat opened in ~/code/keel-s03.1, which Beni created empty for this build. Before you read or run anything else, run pwd and ls -A. pwd must print that folder and ls -A must print nothing; if either fails, stop and tell Beni, and read nothing in that folder. Then run gh repo clone BeniCheni/keel . and confirm that git status --porcelain --untracked-files=all prints nothing. The spec merged at 883bdd14f688603f191cf11973b087af0329668c. If git rev-parse origin/main prints that, continue. If it prints a later commit, continue only if git diff --name-only 883bdd14f688603f191cf11973b087af0329668c origin/main exits 0 and lists nothing outside docs/reviews/ and docs/README.md, and say so in the PR body; otherwise stop and tell Beni. Create branch s03.1/reference-k from origin/main. Never work in ~/code/keel-pm or any other keel checkout. Export KEEL_DATA_DIR="$(mktemp -d)" in every shell invocation, and use synthetic data only.
Then read AGENTS.md in full, before anything else in the repo. It outranks this prompt. If they disagree, stop and report.
Model: Grok 4.7 Extra High, because this slice touches the sensitive paths packages/plugin-mln/** and fixtures/golden/**. Your chat id reads grok-4.7 at every effort, so do not judge the effort from the id. Beni sets Extra High in the picker before he pastes this prompt, and that setting is the evidence of your effort; say so in the PR body. If this chat cannot run at that effort, grok-4.7-xhigh as a sub-agent is authorized as a backup, and the PR body says so. There is no fallback model. If neither is available, stop and escalate.
Seats. Every seat for this slice is the AGENTS.md default. Beni ruled so on 2026-11-13 at 17:14 EST in the PM's session, answering "No (Recommended)" to "Does S03.1 override AGENTS.md's builder seat?". That answer superseded his earlier "Codex, adjudicating (Recommended)" of 15:28 EST. So you build, you never edit tools/reference/**, and Codex amends the reference at Pass 2.
The build authority is docs/specs/s03.1-reference-k.md. Build exactly that one slice in one draft PR. Read the spec in full, with docs/specs/s03-payoff-engine.md as amended in the same PR (its Events, its input contract and its golden layout), and findings 1, 3 and 4 in docs/reviews/pr-38-pass-2.5.md, whose appendix prints the after-final reproducer that AC1 uses at Pass 2.
Scope is the spec's list of files the builder may change, and nothing else: packages/plugin-mln/src/engine.ts, only noteMetrics's loop over closes (Decision 6); tools/generators/golden/generate.mjs, for the two cases, the version and the guard; the two new case folders under fixtures/golden/, as the generator writes them; test files under packages/plugin-mln/src/ ending .test.ts, for the case list, the frozen values and AC12's test; tools/acceptance/test/golden-generator.test.mjs, a new file for the generator's guards; tools/acceptance/test/test-contract.test.mjs and tools/acceptance/test/determinism.test.mjs, only where they pin the test list, the registry or the generator's version; tools/fixtures/registry.mjs, only in the comment naming the golden generator's version.
If the build needs any other file, stop and report; the spec is amended first. List every changed file in the PR body with its reason. Never create or touch anything under tools/reference/. Do not change packages/core, the schemas, fixtures/synthetic, the 11 existing golden cases, any honesty test, anything under docs/, CHANGELOG.md, README.md, package.json, pnpm-lock.yaml or any version; this slice is not a release. Add no dependency.
Decision 6 is the slice's one engine change: noteMetrics skips an index of closes that holds no element, and nothing else about noteMetrics changes. Check 1 does not change, and a close-invalid reason still names a close by its index in the array as given, holes counted. The engine still does no I/O: no file system, network, clock or randomness.
The frozen values, the golden cases and the honesty tests are the contract. If your code and a frozen value disagree, do not change the value, the test or the spec to make them agree: stop and ask Beni in one word. Honesty tests are never weakened, skipped or deleted.
Golden fixtures are generated by seed, never hand-typed. The registered generator writes g12-listed-after-final and g13-year-10000-slot as the spec's Frozen values define them, writes each case's expected output by running the engine, scans what it writes with the repository's tripwire, and adds no allowlist entry. The 11 existing cases stay byte-identical, and the generator's version moves from 1 to 2. After pnpm fixtures:regen, git status --porcelain --untracked-files=all over every tree pnpm -s fixtures:trees prints shows nothing, on both Nodes.
Pass M at your last commit. Run python3 -I tools/reference/payoff.py fixtures/golden/ without changing the reference. The spec expects cases 13, disagreements 1, with g12-listed-after-final the only disagreement, and exit 1, because Codex amends the reference at Pass 2. Report what it prints and its exit code. If it disagrees on any other case, stop and ask Beni in one word.
PR #40's High. noteMetrics throws a TypeError on a hole in closes at 9ec6fd0, and Beni ruled on 2026-11-13 at 17:43 EST ("Fix in S03.1 (Recommended)") that this build fixes it. It stays open on main until AC12's test lands and fails without the fix. The first Decision 6 mutant, the loop set back to for (const close of closes) with no skip, is that proof: give it in the PR body under this High, with the command and the failing test's name.
Meet the spec's Mutation floor. The first two mutants are Codex's, at Pass 2. Run all the others in this session: the events.ts continue mutant, with both failures it names; g12's expected output given the reference's old extra reason; AC7's mutant; AC8's mutant; the three Decision 6 mutants.
For each mutant, the PR body gives the exact change as a unified diff or a one-line sed or perl command that applies to the file at your head, the command that runs the suite, naming the test file, and the name of each failing test taken from the output. An exit code alone does not show which test failed. A survivor is reported as a survivor, never as a kill, and a surviving mutant on a boundary is a High.
Git. Set the author per commit with git -c user.name=Cursor -c user.email=cursoragent@cursor.com commit, never as Beni. Never force-push. Open a draft PR on branch s03.1/reference-k after the first commit. Every commit is green: push the next commit only after CI is green on the last one. Before each push, run pnpm install --frozen-lockfile && pnpm verify on Node 24.22.2 and 26.13.0, reading each command's own exit code. If a CI job is cancelled without running a single step, that is GitHub running out of macOS runners, not a failure of your commit: rerun the failed jobs with gh run rerun <run id> --failed, wait for them to finish green, and say so in the PR body. Never push a commit just to retrigger CI.
PR body. List every claim with its reproducing command and its result at your head: AC4 to AC12, AC2's run at your last commit, and the mutants. Every figure comes from a command you ran in this session, and every hash you give is the full 64-character SHA-256. Absolute words are claims to test. Name the sensitive paths touched, state that no dependency was added, state the seat ruling above, and print any short script a claim rests on. The PM copies your claims into a sealed appendix, so make each one checkable as written.
Privacy. Never open the owner's data folder or anything under ~/.keel-spike/ or ~/.config/keel/. No personal data, real market data or real documents go in code, tests, fixtures, commits, the PR or comments. Any text the engine or generator returns explains mechanics only, recommends nothing and passes the copy rules in AGENTS.md.
Stop and escalate to Beni, as a question answerable in one word, on anything AGENTS.md lists: a dependency the work needs, a claim you cannot re-run, a privacy issue, a spec rule you cannot meet as written, or this prompt disagreeing with that file or with the spec.
You review nothing you built, and you merge nothing. When the slice is complete and CI is green on the last commit, leave the PR in draft, report the PR link and head SHA, and stop.
```

## Resume note

As the PM handed it to Beni on 2026-11-14 at 14:58:50 EST, taken as data from the PM's session transcript. SHA-256 of the text plus a final newline: `91d6276aa0c1795f29359ddecb73d25904b2930ae0cf766fb99e13d107b38990`.

```
You are Cursor, the Builder for slice S03.1 of BeniCheni/keel, resuming the build you stopped before your first commit. The spec is amended, and you can go on.
The ruling. On 2026-11-14 at 00:32:49 EST, in the PM's session, Beni answered "Rewrite that test (Recommended)" to: "S03.1's g12 golden case is unavailable by design. But the honesty test "a live golden evaluation names its next event" requires every golden case to evaluate, and the S03.1 spec (AC9) bars editing honesty tests, so Cursor stopped. How should S03.1 resolve it?" PR #42 put that into the spec as Decision 7 and merged to main as 0fda80f1bf02ec8a551491608fcc2cf3e70f598a. PR #41, records only, merged before it.
Move your work onto the new main. Your branch s03.1/reference-k has no commits and nothing pushed, so nothing is lost. In ~/code/keel-s03.1, first confirm that git log --oneline 883bdd14f688603f191cf11973b087af0329668c..HEAD prints nothing and git ls-remote --heads origin s03.1/reference-k prints nothing; if either prints anything, stop and tell Beni. Then run git fetch origin. Confirm git rev-parse origin/main prints 0fda80f1bf02ec8a551491608fcc2cf3e70f598a. If it prints a later commit, continue only if git diff --name-only 0fda80f1bf02ec8a551491608fcc2cf3e70f598a origin/main exits 0 and lists nothing outside docs/reviews/ and docs/README.md, and say so in the PR body; otherwise stop and tell Beni. This replaces the start-commit rule in your build prompt. Then run git stash push --include-untracked -m s03.1-wip, git checkout -B s03.1/reference-k origin/main, and git stash pop. If the pop reports a conflict, stop and tell Beni. Keep exporting KEEL_DATA_DIR="$(mktemp -d)" in every shell invocation.
Read the amended spec again in full at origin/main: docs/specs/s03.1-reference-k.md, in particular the status line, Decision 7, Scope, Honesty tests, AC9 and the Mutation floor. Everything else in your build prompt stands: the model and effort, the seats, Git identity, every-commit-green, verify on Node 24.22.2 and 26.13.0 before each push, the CI rerun rule, privacy, and stopping on anything AGENTS.md lists.
What Decision 7 allows, and nothing more. Replace lines 503 to 509 of packages/plugin-mln/src/payoff.honesty.test.ts, the whole test "a live golden evaluation names its next event" from its test( line to its closing });, with the 13 lines Decision 7 gives, byte for byte, each without its three-space indent. Change nothing else in that file or in any other honesty test file. The count of golden folders in payoff.policy.test.ts is part of the case list Scope allows, as you had it. The determinism step needs the six new golden files committed.
AC9 at your head. From the clone's root, git diff --name-only origin/main...HEAD -- '*.honesty.test.ts' > honesty.txt exits 0 and honesty.txt holds the one line packages/plugin-mln/src/payoff.honesty.test.ts. git ls-tree HEAD -- packages/plugin-mln/src/payoff.honesty.test.ts prints exactly 100644 blob 6190a5eb06d34b22e075a5df5ffc1015887abbc5, a tab, and the path. If the blob differs, your file is not Decision 7's text byte for byte: do not change the pin or the spec, stop and tell Beni. Remove honesty.txt afterwards; it is not part of the slice.
The mutation floor now also lists Decision 7's two mutants: g03-live's input.json given an asOf that is not a date, and g12's folder removed, each with the rewritten test among the failures. Give each in the PR body as you give the others.
PR body. State the ruling above with its date and time, the rebase onto 0fda80f, Decision 7, and AC9's two commands with their output at your head. The PR #42 body also prints proof scripts the PM wrote; they are not part of your slice, and you need not run them.
When the slice is complete and CI is green on the last commit, leave the PR in draft, report the PR link and head SHA, and stop.
```
