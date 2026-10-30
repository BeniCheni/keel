# Pass 0 brief: PR #<N> (<slice ID and title>)

Written by the PM on <date, America/New_York>, from a fresh read of the PR at `<sha>`. Save as `docs/reviews/pr-<N>-pass-0.md`.

## Seat for Pass 1

<Claude Code | Codex (a Claude session wrote part of this PR)>, model <pin>, fallback <pin>.

## Scope

- Spec: `docs/specs/<file>`; design brief: <file or none>
- Sensitive paths touched: <list or none>
- Release: <no | yes, version>
- New dependencies: <none | list>
- Bootstrap path (no `package.json` yet): <no | yes: static checks only, each skipped check N/A with its reason>

## Authorship record

From `git log --format='%h %an' <base>..<head>`. Every commit needs a cold read from a vendor that did not author it.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| | | |

## Fast-track

<Not allowed | Allowed: the diff is docs, UI copy or tokens outside sensitive paths, and this is not a release or numbering fork.> Fast-track changes review depth only: Beni still merges in shadow mode, and the full gate applies after activation.

## What to check, beyond the skill's standing checks

1. <question tied to an acceptance criterion>
2.

## Sealed appendix: builder claims to verify independently

These are claims, not facts. Re-derive each one; report any that do not reproduce.

| # | Claim (as the builder stated it) | Command the builder gave |
| --- | --- | --- |
| 1 | | |
