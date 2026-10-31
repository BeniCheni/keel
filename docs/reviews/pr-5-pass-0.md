# Pass 0 brief: PR #5 (review records: PR #3 Pass 0, 1.5 and 2.5)

Written by the PM on 2026-10-31 (America/New_York), from a fresh read of the PR at `a699303`. Claude sessions wrote every line of this PR and this brief, as on PR #2, so Pass 1 is the only cold read; this brief steers it and seals nothing the PR body does not already say. The brief and the index rows ride in the PR itself, which adds one more Claude commit for the same Codex read.

## Seat for Pass 1

Codex (Claude sessions wrote every line of this PR), model GPT-6.1 Sol High (no sensitive path touched), fallback none. Fresh clone of the PR branch, never a working copy; `KEEL_DATA_DIR` pointed at an empty temp directory.

## Scope

- Spec: none; this PR adds review records, not a slice. Design brief: none.
- Sensitive paths touched: none (`CHANGELOG.md`, `docs/README.md` and `docs/reviews/**` only).
- Release: no.
- New dependencies: none.
- Bootstrap path: partly. The branch forks from `0db249a`, before S00, so its own tree has no `package.json`, lockfile, workflow or tripwire; install, `verify` and mutations are N/A on the branch itself. `main` now carries S00, so run the gate on the merge result instead (`git merge --no-edit origin/docs/pr-3-reviews` onto `origin/main` in a scratch worktree, or the CI merge ref): the tripwire and copy lint then scan the new docs. A green run there shows only that the docs did not break the gate.

## Authorship record

The original snapshot at `a699303` had 8 commits, all `Claude` (`git log --format='%h %an' origin/main..a699303`). At the Pass 1 input head `7c6827e`, the range has 10 commits, all `Claude` (`git log --format='%h %an' origin/main..7c6827e`). The table includes the brief's initial commit and its later bootstrap correction. Every commit needs a cold read from a vendor that did not author it.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `b8443cc` PR #3 Pass 0 brief | Claude (PM) | Codex, Pass 1 |
| `32eff6b` PR #3 Pass 1.5 brief | Claude (PM) | Codex, Pass 1 |
| `4e80cfe` Pass 1.5 open-mutant correction | Claude (PM) | Codex, Pass 1 |
| `6159ea2` PR #3 Pass 2.5 executive brief | Claude (Pass 2.5 session) | Codex, Pass 1 |
| `a6f294e`, `d593070` Beni's rulings 1 to 3 | Claude (Pass 2.5 session) | Codex, Pass 1 |
| `654e8c9` squash record, empty Cursor trailer, CHANGELOG note | Claude (fork of the Pass 2.5 session) | Codex, Pass 1 |
| `a699303` post-merge verify record | Claude (Pass 2.5 session) | Codex, Pass 1 |
| `10c23d6` this brief and the index rows | Claude (PM) | Codex, Pass 1 |
| `7c6827e` run the gate on the merge result | Claude (PM) | Codex, Pass 1 |
| Pass 1 authorship-record correction (`git log -1 --format='%h %an' -- docs/reviews/pr-5-pass-0.md` after the fix) | Codex | fresh Claude session before the merge gate; Codex cannot cold-read its own fix |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or numbering fork. Fast-track changes review depth only: one cold review by Codex replaces Passes 1 to 2.5; Beni still merges in shadow mode, with the merge pinned to the reviewed SHA and "fast-track" recorded in the squash message.

## What to check, beyond the skill's standing checks

1. Does every figure in `docs/reviews/pr-3-pass-2.5.md` carry its command, and do the ones re-runnable from the repo reproduce at the reviewed head `bbe3aec0fb6b0c62441e3cdff72f59ac58c7f879` (fetch `refs/pull/3/head`): the diff shortstat against `0db249a`, the Codex share `55774a1..bbe3aec`, the 14-commit authorship split 2 Cursor / 9 Claude / 3 Codex, the 22 guard names against the spec, the per-filter test counts summing to 101, the eight mutant runs against `fc13571`, and the two reversals against `f5a0ca7` and `bbe3aec`?
2. Does the decision row match GitHub: `gh pr view 3 --json mergeCommit,mergedAt,state` gives `e9ab4ba`, and does `git diff --quiet bbe3aec0fb6b0c62441e3cdff72f59ac58c7f879 origin/main` exit 0? Does `git log -1 --format=%B e9ab4ba` really carry the empty `Co-authored-by: Cursor <>` trailer the row and the CHANGELOG describe, and are `8b9dfee` and `3c8b544` really Cursor's (`git log --format='%h %an' 0db249a..bbe3aec`)?
3. Does the Pass 1.5 brief's correction leave the original sentence standing as a record, as it says, and does `fc13571` kill the two address mutants it names (one deletion each in `tools/tripwire/scan.mjs`, run `pnpm test:tooling -- tripwire`)?
4. Does any brief misreport a check as green? The private-list check must read as not re-run by the Fable seat; the namespace must read as CI evidence only; demo mode must read N/A.
5. Does any file, commit message or PR text carry personal data? The briefs name only the owner, vendor identities, synthetic placeholders described in words, and commit SHAs. Run the tripwire on the tree and on the PR text; the handoff block deliberately avoids spelling a non-noreply address.
6. Does the CHANGELOG entry sit under `[Unreleased]` in the section order AGENTS.md prescribes, and does the docs index row for S00 match the squash and reviewed SHAs?

## Sealed appendix: builder claims to verify independently

These are claims, not facts. Re-derive each one; report any that do not reproduce. Copied from the PR #5 body as of this brief; claim 1 is restated for the head that includes this brief.

| # | Claim (as the builder stated it) | Command the builder gave |
| --- | --- | --- |
| 1 | The diff is docs only: `CHANGELOG.md`, `docs/README.md` and files under `docs/reviews/` | `git diff --name-only origin/main...HEAD` |
| 2 | 4 files, 246 insertions, 0 deletions at `a699303` (before this brief's commit) | `git diff --shortstat origin/main...a699303` |
| 3 | Every commit is Claude-authored | `git log --format='%h %an' origin/main..HEAD` prints only `Claude` |
| 4 | The tripwire on the Pass 2.5 brief, in a temporary repository with an empty allowlist and `origin/main` set, exits 0 | `node tools/tripwire/cli.mjs <dir>` |
| 5 | `pnpm verify` was not run on the branch's own tree by the builder and is reported N/A, not green | the PR body's "Claims" bullet |
| 6 | The squash `e9ab4ba` is the merge commit GitHub recorded for PR #3 and `origin/main` points at it | `test "$(gh pr view 3 --json mergeCommit --jq .mergeCommit.oid)" = "$(git rev-parse origin/main)"` |
| 7 | The squash tree equals the reviewed tree | `git diff --quiet bbe3aec0fb6b0c62441e3cdff72f59ac58c7f879 origin/main` |
| 8 | Frozen install and `verify` are green at `e9ab4ba` on v24.22.2 and v26.13.0: core 1 test, tooling 101 tests, eight `verify:* ok` lines; the first Node 24 run hit two cold-start timeouts in `test-contract.test.mjs` and passed on rerun | `nvm exec <version> pnpm install --frozen-lockfile && nvm exec <version> pnpm verify` |
| 9 | No whitespace errors | `git diff --check origin/main...HEAD` prints nothing |
