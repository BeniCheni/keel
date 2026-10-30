# Pass 0 brief: PR #2 (review record: PR #1 Pass 2.5 executive brief)

Written by the PM on 2026-10-30 (America/New_York), from a fresh read of the PR at `00ff727`. The same Claude session wrote the PR and this brief, as on PR #1, so Pass 1 is the only cold read; this brief steers it but did not seal anything the PR body does not already say.

## Seat for Pass 1

Codex (a Claude session wrote every line of this PR), model GPT-6.1 Sol High (no sensitive path touched), fallback none.

## Scope

- Spec: none; this PR adds a review record, not a slice. Design brief: none.
- Sensitive paths touched: none (`docs/reviews/**` and `docs/README.md` only).
- Release: no.
- New dependencies: none.
- Bootstrap path (no `package.json` yet): yes: static checks only, each skipped check N/A with its reason (install, `verify`, mutations, dynamic checks, Pass M).

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`. Every commit needs a cold read from a vendor that did not author it.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `00ff727` executive brief and index row | Claude (PM) | Codex, Pass 1 |
| the commit adding this brief and its index row | Claude (PM) | Codex, Pass 1 |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or numbering fork. Fast-track changes review depth only: one cold review by Codex replaces Passes 1 to 2.5; Beni still merges in shadow mode, with the merge pinned to the reviewed SHA and "fast-track" recorded in the squash message.

## What to check, beyond the skill's standing checks

1. Does every figure in `docs/reviews/pr-1-pass-2.5.md` carry its command, and do the ones that can be re-run from the repo reproduce (diff shortstat and file inventory at `97ac4dc`, copy scan, `git check-ignore`, `git diff --check`, the authorship record from `git log --format='%h %an' 262f119..97ac4dc`, and the S01 summaries derived from the spec's status table)?
2. Does the "Beni's decision" row match what GitHub recorded for PR #1 (`gh pr view 1 --json mergeCommit,mergedAt,state`), and does the squash commit's tree equal the reviewed head's tree?
3. Does the brief misreport any check as green? Every runnable check must read N/A on the bootstrap path.
4. Does any file, commit message or PR text carry personal data? The brief names only the owner, agent noreply identities and synthetic fixture names from the spec.

## Sealed appendix: builder claims to verify independently

These are claims, not facts. Re-derive each one; report any that do not reproduce. Copied from the PR #2 body as of this brief; claim 1 is restated for the two-commit head.

| # | Claim (as the builder stated it) | Command the builder gave |
| --- | --- | --- |
| 1 | The diff is two added review records and index rows, nothing else | `git diff --stat origin/main...HEAD` shows `docs/README.md`, `docs/reviews/pr-1-pass-2.5.md` and `docs/reviews/pr-2-pass-0.md` only |
| 2 | The squash SHA the brief records is the one GitHub recorded for PR #1, and `origin/main` points at it | `test "$(gh pr view 1 --json mergeCommit --jq .mergeCommit.oid)" = 8b316f32f1c128e3194b1b4ac398e717e551ec16 && test "$(git rev-parse origin/main)" = 8b316f32f1c128e3194b1b4ac398e717e551ec16` |
| 3 | The squash commit's tree equals the reviewed head's tree | `test "$(git rev-parse 'origin/main^{tree}')" = "$(git rev-parse '97ac4dc83016f7e5a1d09d66a669e7818ed2da5e^{tree}')"` |
| 4 | No string matches an account-identifier or SSN pattern | the counts-only command from PR #1 claim 2 prints 0 and exits 0 |
| 5 | The earlier working name appears only inside quoted copies of PR #1's claim 4 command | `grep -rni vigil --exclude-dir=.git .` prints exactly 2 lines, `docs/reviews/pr-1-pass-2.5.md:64` and this row of `docs/reviews/pr-2-pass-0.md`, each quoting that command |
| 6 | No whitespace errors | `git diff --check origin/main...HEAD` prints nothing |
