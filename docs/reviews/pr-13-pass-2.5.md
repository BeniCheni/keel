# Executive brief: PR #13, Pass 2.5, 2026-11-01 America/New_York

Recorded by the PM on 2026-11-02 (America/New_York). The Pass 2.5 session (Claude, fresh session, Fable 5.1 High) delivered this brief in chat, and its PR comment ([issuecomment-6569021327](https://github.com/BeniCheni/keel/pull/13#issuecomment-6569021327)) says the PM records it. Beni told the PM it had posted, and the PM copied the text from that one message in the session's transcript, by script, reading nothing else there. "This session" and "this seat" below mean that session. The text is unchanged except for the "Beni's decision" row, which the PM filled after the merge, and the PM's sections follow the handoff block.

Every number below comes from a command run in this session in a fresh clone at `~/keel-reviews/pr-13-2.5`, head `c527df87a86659e4b3b1903966a4eff699a7d6cc`, with `KEEL_DATA_DIR` an empty `mktemp -d`. A number taken from a PR body or comment is labelled as that vendor's claim. Seat: Claude, fresh session, Fable 5.1 High, no fallback.

## Decision

Shadow mode: the gate says **would escalate**, because the PR touches three sensitive paths, adds two runtime dependencies and introduces the terms schema, so the "no sensitive path, dependency or schema change" clause fails. Every other clause holds. Verdict: mergeable, no High open, two Medium test gaps recorded. Beni merges.

## What ships

- keel reads an `mln-terms/0.1` file and returns the terms that are in it, or one positioned diagnostic per fault, with a line and column a person can act on.
- It says which payoff terms are verified, and only a `primary` source verifies one. A conflict keeps every candidate in file order and never counts as verified.
- It flags weekend dates from the ISO date alone, with no clock and no time zone.
- It never invents a value: a missing fee, estimate or schedule stays missing, and a null value is legal under `unknown` alone.
- It still declines to compute a payoff, resolve a conflict, read a file from disk, or show a dollar value. Those are later slices.

## What the passes found

- Pass 1 (Claude Code, Fable 5.1 Extra): 14 findings at `26b661f`. Three Highs, each closed with a fix commit and a test: the loader threw on two alias forms, the schema accepted a null value under every status, and 20 of 22 one-unit schema bound shifts survived. Four Mediums fixed, seven Lows, three questions for Beni.
- Pass 1.5 (PM): all 14 accepted, none to Cursor as rework. Beni's five rulings recorded. Added PM-1 (untested alias fallback, Medium) and PM-2 (unpinned candidate guards, Medium), plus two Lows.
- Pass 2 (Codex, GPT-6.1 Sol Extra High): all 14 accepted. Landed rulings 1, 2, 3 and 5 and closed PM-1 and PM-2 in `c527df8`. Codex's claims: 26 bound edits, 24 surviving at `26b661f` and 26 dying at `747ea72`; 91 post-fix mutants, 91 killed; 89 own-read assertions; private-list check 0 hits over eight inputs. Pass M N/A.
- Pass 2.5 corroboration, each from a run here:
  - Baseline, diff, scope, fixture count, CI result, licences and the `new Function` line all reproduce as the Pass 1.5 brief and Pass 2 state.
  - Each pass's tests fail without its fixes: `c527df8`'s tests and fixtures on the `747ea72` source give 27 passed, 6 failed; `747ea72`'s tests on the `26b661f` source give 20 passed, 6 failed, the Pass 1.5 count.
  - The `integerFaultPaths` step beyond the rulings: scoped to the faulted path, hides nothing that lets a file load (50 token faults over five integer owners, 0 loaded). Ruling 4's two-stage order, narrowed to one scalar. Accepted cost.
  - Two surviving mutants of `c527df8`'s hunks, both Medium, both test-only, head behaviour right in each case. Finding 1: a mutant that lets one token fault drop every schema diagnostic survives the suite and the typecheck (new in `c527df8`, `load.ts:114`). Finding 2: a comparator that sorts diagnostics by path before position survives (`load.ts:53`); the same shape survives at `747ea72`, so this gap predates the commit.
- Contested: nothing. Every vendor accepted every finding, and Codex's bound count differs from Pass 1's only in enumeration, not in direction.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | exit 0 on Node 24.22.2 and 26.13.0 |
| Verify | `pnpm verify` | exit 0 on both; core 33 passed in 9 files, tooling 122 passed in 10 files, all eight `verify:* ok` lines; `git status --porcelain --untracked-files=all \| wc -l` prints `0` after each |
| Determinism | `pnpm fixtures:regen && sh -c 'keel_generated_trees="$(pnpm -s fixtures:trees)" && keel_generated_status="$(printf "%s\n" "$keel_generated_trees" \| while IFS= read -r keel_generated_tree; do git status --porcelain --untracked-files=all -- "$keel_generated_tree" \|\| exit; done)" && test -z "$keel_generated_status"'` | regen exit 0, loop exit 0; trees: `fixtures/synthetic/terms` |
| Zero network | `pnpm -s verify:network` | exit 0 |
| Core entry under Node | `node --input-type=module -e 'import("./packages/core/src/index.ts").then(m => console.log(Object.keys(m).join(" ")))'` | `dateFlags loadTerms verificationSummary`, exit 0 on both Nodes |
| Mutations | 15 exact edits of `c527df8`'s hunks on Node 24.22.2, each followed by `pnpm --filter @keel/core exec vitest run --config vitest.config.mjs` (and `pnpm fixtures:regen` first for the four generator rows), then restore | 12 killed by the suite, 1 killed by `pnpm exec tsc -p packages/core --noEmit` (TS2339), 2 survived (findings 1 and 2) |
| Failing-first | Detached worktrees: `c527df8` tests on `747ea72`; `747ea72` tests on `26b661f` | 27 passed / 6 failed; 20 passed / 6 failed |
| Tripwire | `scanRepo` over the clone; PR title, body, Pass 1, Pass 2 and the Pass 2.5 comment in a throwaway repo with the repo's allowlist and vendors files | 0 hits in every class; synthetic address control gives 1 `email` hit |
| Diff | `git diff --shortstat origin/main...HEAD`; `git diff --shortstat 747ea72 c527df8` | 64 files, +8461 −20; 7 files, +392 −10 |
| Scope of `c527df8` | `git diff --name-only 747ea72 c527df8 -- docs CHANGELOG.md package.json pnpm-lock.yaml 'packages/*/package.json' \| wc -l`; removed test lines; removed honesty lines over the PR | `0`; `0`; `0` |
| CI | `gh run list --commit c527df8…` | run 41385332658, `pull_request`, success |
| Pass M | `python3 tools/reference/payoff.py fixtures/golden/` | N/A: no engine, no golden fixture |
| UI matrix | | N/A: no UI in this slice |
| Demo mode | | N/A: none exists before the UI slices |

Not re-run, and why: Codex's 91 post-fix mutants, 26 historical bound edits and 89 own-read assertions, and Pass 1's 78 mutants, 22 bound shifts and 138 probes, because this seat wrote its own mutants and probes instead; the Pass 1.5 locale sweep over 59 locales; the owner's private-list check, which is not this seat's (Codex's count: 0 over eight inputs, before the PR body refresh).

## Estimates and model output

None. No figure in this PR comes from a model or an assumption.

## Risks and accepted costs

- `ajv` compiles the schema with `new Function` when the loader module loads. A strict content security policy in a later webview would refuse it. Disclosed in the PR body; the ideas file carries it.
- Two runtime dependencies enter `@keel/core`: `yaml` 2.9.1 (ISC) and `ajv` 8.20.0 (MIT), with four transitive packages, all MIT or BSD-3-Clause.
- Two-stage reporting (ruling 4): a schema fault hides a referential fault until fixed, and since `c527df8` a token fault hides a schema fault at the same path. The file is rejected either way.
- The two Medium test gaps above: the head behaves right, but a later edit to the suppression scope or the diagnostic order would not go red.
- Carried to the ideas file by the PM: BOM handling, anchor-only path, the test helper in the production tree, the generator writing the allowlist outside its declared tree, the `yaml` process warning on a complex key, non-scalar key positions, the broad `toJS` catch.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | yes |
| Verdict mergeable, every High closed (fix commit with a failing-first test) | yes: three Highs, each with a fix commit whose test fails on the `26b661f` source |
| Nothing contested | yes |
| `verify` green at tip; every number re-run | yes, with the not-verified list above |
| No sensitive path, dependency or schema change | **no**: `packages/core/**`, `schemas/**`, `tools/tripwire/allowlist.txt`; `yaml` and `ajv`; `schemas/mln-terms/0.1.json` |
| Every commit cold-read by a non-author vendor (authorship record) | yes: Cursor's by Claude (Pass 1), the nine Claude commits by Codex (Pass 2), `c527df8` by this seat |
| Gate verdict | would escalate |
| Beni's decision (filled after) | Merged on 2026-11-02 at squash `3bceb20`, reviewed head `c527df8`, without the two pinning tests |

## Questions for Beni

1. Land the two pinning tests (findings 1 and 2) in PR #13 before merging? Recommended: no, as a follow-up, since the head behaves right and any fix here needs another cold read. (yes / no)
2. Confirm rulings 1 to 5 as the Pass 1.5 brief records them? (yes / no)
3. Is the private-list check clean over the refreshed PR body and the Pass 2.5 comment? (yes / no)
4. Merge PR #13 at `c527df8`? (yes / no)

## Handoff block

Authors from `git log --format='%an <%ae>' origin/main..HEAD` in this clone: Cursor, Claude, Codex. Reviewers: Claude (Pass 1, Pass 2.5), Codex (Pass 2). Each trailer is spelled out in full.

```bash
gh pr ready 13
```

```bash
gh pr merge 13 --squash --match-head-commit c527df87a86659e4b3b1903966a4eff699a7d6cc --subject "feat(s01): terms schema 0.1 and strict loader (#13)" --body "$(cat <<'EOF'
loadTerms reads an mln-terms/0.1 file and returns its terms or one positioned diagnostic per fault; verificationSummary reports which payoff terms a primary source verifies; dateFlags marks weekends from the ISO date alone. Synthetic fixtures are generated by seed.

Co-authored-by: Cursor <cursoragent@cursor.com>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
EOF
)"
```

```bash
git pull
```

```bash
test "$(gh pr view 13 --json mergeCommit --jq .mergeCommit.oid)" = "$(git rev-parse origin/main)" && echo "origin/main is the squash commit"
```

```bash
pnpm install --frozen-lockfile && pnpm verify
```

Demo mode starting with zero outbound requests: N/A, no demo mode exists before the UI slices. The README renders: the status sentence at the head is true.

## PM's checks on this brief (added by the PM)

Each from a run in the PM's session at `c527df8`, in a fresh clone of PR #13, on Node v24.22.2, with a fresh `mktemp -d` as `KEEL_DATA_DIR`.

| Check | Command or edit | Result |
| --- | --- | --- |
| Finding 1 | At `load.ts:114`, the filter replaced by `...(integerFaultPaths.size > 0 ? [] : schemaErrors)`, then `pnpm --filter @keel/core exec vitest run --config vitest.config.mjs` and `pnpm exec tsc -p packages/core --noEmit` | vitest exit 0, 33 passed; tsc exit 0. The mutant survives |
| Finding 2 | At `load.ts:53`, the path comparison moved ahead of line and column, then the same two commands | vitest exit 0, 33 passed; tsc exit 0. The mutant survives |
| The drop is scoped at the head | `-0` on `call.level` and a key `levle` under `call`, through `loadTerms` in a temporary test | `unknown-key call.levle 54:3` and `wrong-type call.level.value 56:12` |
| Trailers | `git log --format='%an <%ae>' origin/main..c527df8 \| sort -u` | Claude, Codex and Cursor, with the three addresses in the handoff block |
| Base and head | `git rev-parse --short origin/main`; `gh pr view 13 --json headRefOid,isDraft` | `0f20993`; `c527df8`, still a draft |
| Addresses in the Pass 2.5 comment | `gh api repos/BeniCheni/keel/issues/comments/6569021327 --jq .body \| grep -o -E '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' \| grep -v 'noreply@' \| grep -v -c '^cursoragent@cursor\.com$'` | `0` |

Not re-run here: the rest of the numbers above, which are the Pass 2.5 session's, its 13 other mutants among them. The owner's private-list check has not covered the PR body refresh or the Pass 2.5 comment. Beni runs it before merging.

On question 1, the PM agrees with the recommendation, for one more reason. A follow-up PR of its own would touch `packages/core/**`, so it would be a sensitive-path PR with full passes, for two tests. The PM carries both tests to the ideas file, to ride the next slice that touches `packages/core`.

Rulings 1 to 5 in question 2 are first-hand: Beni gave them to the PM directly, and `pr-13-pass-1.5.md` records his words. Question 2 stays in the brief as the Pass 2.5 session wrote it.

## Beni's rulings (added by the PM)

Beni ruled on 2026-11-02 (America/New_York):

1. **"Yes, merged as is"**, on "Merge without the two pinning tests, sending them to the ideas file?" That answers questions 1 and 4. The tests are idea 29 in `docs/v0.1.0-ideas.md`.
2. **"Clean, 0 hits on both"**, on "Was your private-list check clean over the refreshed PR #13 body and the Pass 2.5 comment?" That answers question 3. No Claude seat ran that check.

Question 2 was not put, for the reason in the PM's section above.

## Post-merge checks (added by the PM)

From the PM's session on 2026-11-02, in a fresh clone of `main` at the squash, with a fresh `mktemp -d` as `KEEL_DATA_DIR`.

| Check | Command | Result |
| --- | --- | --- |
| `origin/main` is the squash GitHub recorded | `gh pr view 13 --json mergeCommit --jq .mergeCommit.oid`; `git rev-parse origin/main` | both `3bceb2016a8ab5db46fcf1f718d35a085598ec14`; merged at 16:32:28 UTC by Beni, whose own run of the handoff's `test` line also passed |
| The base did not move, so the trees match | `git rev-parse 'origin/main^{tree}'`; `git rev-parse 'c527df8^{tree}'` | both `42ca02e521b4a0e9cd92d0eea8bb6f1fa9125ca7` |
| Trailers | `git log -1 --format=%B 3bceb20` | Cursor, Claude and Codex, each spelled out in full |
| CI on the squash | `gh run view 41482481086 --json conclusion,headSha,event` | `success`, `push`, at `3bceb20` |
| Verify on the squash | `pnpm install --frozen-lockfile && pnpm verify` on v24.22.2 and v26.13.0 | exit 0 on both; core 33 passed (9 files), tooling 122 passed (10 files), all eight `verify:* ok` lines; `git status --porcelain \| wc -l` prints `0` afterwards |
| README status sentence | `git show 3bceb20 -- README.md` | Now says `@keel/core` loads an mln-terms/0.1 file and reports which payoff terms are verified, which the suite above supports |
| Release checks | n/a | Not a release: no tag, and no version moved. Demo mode does not exist before the UI slices |

## Carried to the ideas file (added by the PM)

On PR #14, as ideas 21 to 31: the `localeCompare` sorts left in `tools/`; Pass 1's findings 11 to 14; PM-3 and PM-4; `new Function` at module load; this brief's findings 1 and 2; a sealed appendix in its own file; and exact edits in every mutation table.
