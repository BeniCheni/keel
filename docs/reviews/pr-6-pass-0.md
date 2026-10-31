# Pass 0 brief: PR #6 (review record: PR #5 merge and ideas 7 to 9)

Written by the PM on 2026-10-31 (America/New_York), from a fresh read of the PR at `aac6295`. The same Claude session wrote the PR and this brief, as on PR #2, so Pass 1 is the only cold read; this brief steers it and seals nothing the PR body does not already say.

## Seat for Pass 1

Codex (a Claude session wrote every line of this PR), model GPT-6.1 Sol High (no sensitive path touched), fallback none. Fresh clone of the PR branch; `KEEL_DATA_DIR` pointed at an empty temp directory.

## Scope

- Spec: none; this PR records a merge and ideas, not a slice. Design brief: none.
- Sensitive paths touched: none (`docs/README.md`, `docs/reviews/**`, `docs/v0.1.0-ideas.md`).
- Release: no.
- New dependencies: none.
- Bootstrap path: no. The branch forks from `330cc87`, which carries S00, so `pnpm install --frozen-lockfile && pnpm verify` runs on the branch itself.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`. Every commit needs a cold read from a vendor that did not author it.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `aac6295` PR #5 record, index row, ideas 7 to 9 | Claude (PM) | Codex, Pass 1 |
| the commit adding this brief and its index row | Claude (PM) | Codex, Pass 1 |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or numbering fork. Fast-track changes review depth only: one cold review by Codex replaces Passes 1 to 2.5; Beni still merges in shadow mode, with the merge pinned to the reviewed SHA and "fast-track" recorded in the squash message.

## What to check, beyond the skill's standing checks

1. Does the decision row in `docs/reviews/pr-5-pass-2.5.md` match GitHub (`gh pr view 5 --json mergeCommit,mergedAt,state`), and does `git merge-tree --write-tree e9ab4ba fed9d33` equal `origin/main^{tree}` at `330cc87`? The plain tree comparison with `fed9d33` is expected to differ, because the base moved; the brief says so.
2. Does each of ideas 7 to 9 state a fact the record supports: the `pnpm -s` failure reproduces at `e9ab4ba` (`pnpm -s test:tooling -- test-contract` exits 1 while `pnpm test:tooling -- test-contract` exits 0); `git log -1 --format=%B e9ab4ba` carries `Co-authored-by: Cursor <>`; the tripwire's email class exempts only `noreply` and the allowlist glob must start with `fixtures/` (`tools/tripwire/scan.mjs`)?
3. Does idea 8 stay an idea? Nothing under `.claude/skills/**` or `.agents/skills/**` changes in this PR.
4. Does any file, commit message or PR text carry personal data? The tripwire must exit 0 on the tree and on the PR text.

## Sealed appendix: builder claims to verify independently

These are claims, not facts. Re-derive each one; report any that do not reproduce. Copied from the PR #6 body; claim 1 is restated for the head that includes this brief.

| # | Claim (as the builder stated it) | Command the builder gave |
| --- | --- | --- |
| 1 | Docs only: `docs/README.md`, `docs/reviews/pr-5-pass-2.5.md`, `docs/reviews/pr-6-pass-0.md`, `docs/v0.1.0-ideas.md` | `git diff --name-only origin/main...HEAD` |
| 2 | `origin/main` is the merge commit GitHub recorded for PR #5, `330cc870d9c7098f943747289e3a2b848e68ae3c` | `test "$(git rev-parse origin/main)" = "$(gh pr view 5 --json mergeCommit --jq .mergeCommit.oid)"` |
| 3 | The squash tree equals the clean merge of `fed9d33` onto `e9ab4ba`, tree `dde1e6f` | `test "$(git merge-tree --write-tree e9ab4ba fed9d33)" = "$(git rev-parse 'origin/main^{tree}')"` |
| 4 | The gate is green on the squash commit on Node v24.22.2: core 1 test, tooling 101 tests, eight `verify:* ok` lines | `pnpm install --frozen-lockfile && pnpm verify` at `330cc87` |
| 5 | The tripwire and copy lint exit 0 on this branch | `node tools/tripwire/cli.mjs .`; `node tools/copy/cli.mjs .` |
| 6 | Node 26 was not run for the squash-commit gate by the builder | the PR body's "For the reviewer" note |
