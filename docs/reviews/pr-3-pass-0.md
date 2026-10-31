# Pass 0 brief: PR #3 (S00 repo tooling)

Written by the PM on 2026-10-30 (America/New_York), from a fresh read of the PR at `3c8b54403566038eaca8dc56fb0ad2e88ab6ede1`. This brief lives on branch `docs/pr-3-reviews`, not on the PR branch, so that no Claude-authored commit enters PR #3 and the Pass 1 seat stays Claude Code.

## Seat for Pass 1

Claude Code, fresh session, fresh clone. Model Fable 5.1 Extra (sensitive-path PR); fallback Opus 5.5 High, declared in the PR comment if used. Synthetic data only.

## Scope

- Spec: `docs/specs/s00-tooling.md`; design brief: none.
- Sensitive paths touched: `packages/core/**`, `.github/workflows/**`, `tools/tripwire/**` (including the empty `allowlist.txt`).
- Release: no.
- New dependencies: `typescript` 7.0.2 (Apache-2.0) and `vitest` 5.0.5 (MIT), both devDependencies, both expected by the spec. pnpm 10.28.2 is pinned as the package manager.
- Bootstrap path: no longer. This PR adds `package.json`, the lockfile and the workflow, so install, `verify`, mutations and the dynamic pass all apply. Pass M does not apply (no engine).
- Diff: 48 files, 3025 insertions, 1 deletion (`git diff --shortstat origin/main...3c8b544`).

## Authorship record

From `git log --format='%h %an' origin/main..3c8b544`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `8b9dfee` verify gate and workspace tooling | Cursor | Claude Code, Pass 1 |
| `3c8b544` honesty summary read with colour codes stripped | Cursor | Claude Code, Pass 1 |

Any fix commit Pass 1 pushes is Claude-authored and gets its cold read from Codex at Pass 2.

## Fast-track

Not allowed: sensitive paths are touched.

## What to check, beyond the skill's standing checks

1. Every acceptance criterion AC1 to AC9: does the named test assert the criterion itself, and can it fail? Run each command, then break the code it guards and confirm the right test dies for the right reason. The spec's required mutants are the floor, not the whole set.
2. The Linux namespace (`tools/ci/verify-netns.sh`, `netns-enter.sh`, `netns-run.sh`). Does the Node version printed inside the namespace match the cell's matrix version on both ubuntu cells, so the floor cell really tests Node 24? Is there truly no route out, and does the probe distinguish "blocked" from "probe never ran"? Is loopback being up consistent with the spec?
3. Tripwire precision on real repo text. Run `pnpm verify:tripwire` against the whole tree and the commit messages, then check the classes against ordinary prose and code that later slices will add: commit SHAs, 9-character identifiers, version strings, YAML dates and decimal levels like those S01 will generate. A false positive in S01 is cheaper to find now.
4. The test sources themselves. Tripwire positives must be generated at test time. Confirm no tracked test file holds a realistic-looking value assembled so as to dodge the tracked-file scan.
5. Honesty-test discovery (`3c8b544`). How is a `*.honesty.test.ts` file proved discovered: by parsing Vitest's printed summary, or by a structured listing? Can a formatting change in Vitest turn "not discovered" into a pass?
6. Determinism with an empty registry. `pnpm -s fixtures:trees` prints `fixtures`, but no `fixtures/` directory exists yet. Confirm the check still means something then, and that "an empty pathspec exits 128" cannot be hit by a normal empty registry.
7. Supply chain. The lockfile resolves only from the public npm registry; no dependency runs an install script; the workflow's third-party actions are pinned by tag (`@v4`), not by commit SHA. Report whether tag pinning is acceptable here or an ideas-file candidate. Do not add a dependency.
8. Copy and docs. `README.md` changed by 55 lines: check the quickstart commands run as written, the disclaimer is intact, and copy lint covers the README as shipped.
9. The red-probe evidence. Run `pnpm test:ci-evidence -- --success-run 41113257636 --failure-run 41113925991` yourself and read both runs' job lists. Confirm the probe PR (#4) is closed unmerged and nothing from it is reachable from the PR branch.

## Sealed appendix: builder claims to verify independently

These are claims, not facts. Re-derive each one; report any that do not reproduce. Run counts come from your own session, never from this table.

| # | Claim (as the builder stated it) | Command the builder gave |
| --- | --- | --- |
| 1 | Frozen install and the full gate pass on Node 24.22.2: eight `verify:* ok` lines, 1 core test, 63 tooling tests, `verify ok` | `nvm exec 24.22.2 pnpm install --frozen-lockfile && nvm exec 24.22.2 pnpm verify` |
| 2 | The same gate passes on Node 26.13.0 | `nvm exec 26.13.0 pnpm install --frozen-lockfile && nvm exec 26.13.0 pnpm verify` |
| 3 | The gate passes on the pushed head `3c8b544` | `pnpm install --frozen-lockfile && pnpm verify` |
| 4 | CI run `41113257636` is green on all four cells and on `verify`; cells resolved v24.22.1 and v26.13.0 | `gh run view 41113257636 --json jobs --jq '.jobs[] \| [.name,.conclusion] \| @tsv'` and `gh run view 41113257636 --log` |
| 5 | The empty registry prints exactly `fixtures` and a newline | `pnpm -s fixtures:trees \| od -An -tx1` |
| 6 | The shipped allowlist is empty | `wc -c tools/tripwire/allowlist.txt` |
| 7 | `pnpm test:tooling` reports 7 test files and 63 tests passed | `pnpm test:tooling` |
| 8 | AC1 and AC9: `@keel/core` has no runtime dependency, a Node 24 floor, `engine-strict`, an empty API; each strict flag is enforced; a no-match filter fails; a honesty file is discovered and a failing one goes red | `pnpm test:tooling -- acceptance/test-contract` and `pnpm --filter @keel/core test` |
| 9 | AC2: steps run in order; each forced failure is named and later steps still run; two failures are both named | `pnpm test:tooling -- acceptance/verify-runner` |
| 10 | AC3: every tripwire class and variant, negatives, allowlist behaviour, commit messages, local-only paths, non-UTF-8, missing `origin/main` exits 2; no matched text on stdout or stderr | `pnpm test:tooling -- acceptance/tripwire` |
| 11 | AC4: the tripwire on this tree exits 0 | `pnpm verify:tripwire` |
| 12 | AC5: each in-process probe fails in its own child process | `pnpm test:tooling -- acceptance/network` |
| 13 | AC6: tracked edit, deletion, staged change and new untracked file each fail; a Git failure exits 128; a clean regeneration exits 0; dirt outside a registered tree passes | `pnpm test:tooling -- acceptance/determinism` |
| 14 | AC7: every scanned copy scope and every import form, with negatives | `pnpm test:tooling -- acceptance/copy-boundary` |
| 15 | AC8 local: `needs-check.mjs` rejects failure, cancelled and skipped; the workflow has the required settings | `pnpm test:tooling -- acceptance/needs-check` |
| 16 | AC8 live: green run `41113257636`, red run `41113925991` with only the ubuntu Node 24 cell failed and `verify` failed; probe PR #4 closed unmerged, branch deleted | `pnpm test:ci-evidence -- --success-run 41113257636 --failure-run 41113925991`; `gh pr view 4 --json state,mergedAt`; `git ls-remote --heads origin s00/probe-verify-red` |
| 17 | Linux cells run `pnpm verify` inside `sudo unshare --net` with no default route; the namespace probe's `fetch` throws and `net.connect` to a public address never connects | `gh run view 41113257636 --log` |
| 18 | Every mutant in the PR body's mutant table (59 rows: `gh pr view 3 --json body --jq .body \| awk '/^## Mutants/{f=1;next} /^## AC8/{f=0} f' \| grep -c '^\|'` prints 61, less the header and separator) is killed by the test named beside it | the PR body's mutant table |
