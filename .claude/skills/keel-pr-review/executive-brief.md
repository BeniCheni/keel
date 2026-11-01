# Executive brief: PR #<N>, Pass 2.5, <YYYY-MM-DD America/New_York>

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim.

## Decision

<Merged at `<sha>` because gate clauses <list> hold. | Escalated because <one sentence>. | Shadow mode: gate says "would merge" or "would escalate" because <one sentence>; Beni merges.>

## What ships

3 to 5 bullets, in the README's voice: what keel can now do, and what it still declines to claim.

## What the passes found

- Pass 1: <one line per finding>
- Pass 2: <one line per disposition, plus Codex's own findings and the Pass M result>
- Pass 2.5 corroboration: <one line per finding re-checked>
- Contested: <each point, with both positions and the evidence for each>

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | |
| Verify | `pnpm verify` (Node floor and current) | |
| Determinism | `pnpm fixtures:regen && sh -c 'keel_generated_trees="$(pnpm -s fixtures:trees)" && keel_generated_status="$(printf "%s\n" "$keel_generated_trees" \| while IFS= read -r keel_generated_tree; do git status --porcelain --untracked-files=all -- "$keel_generated_tree" \|\| exit; done)" && test -z "$keel_generated_status"'` | |
| Zero network | | |
| Mutations | | |
| Pass M | `python3 tools/reference/payoff.py fixtures/golden/` | |
| UI matrix | | |

Not re-run, and why: <list or "none">.

## Estimates and model output

<Any figure in this PR that comes from a model or an assumption, labelled ESTIMATE, with its assumptions and whether it was checked in-sample or held out. "None" is a valid answer.>

## Risks and accepted costs

<Restated so a reader who will not open the spec can follow them.>

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | |
| Verdict mergeable, every High closed (fix commit with a failing-first test, or for a High outside tracked files, a recorded remediation check plus Beni's confirmation) | |
| Nothing contested | |
| `verify` green at tip; every number re-run | |
| No sensitive path, dependency or schema change | |
| Every commit cold-read by a non-author vendor (authorship record) | |
| Gate verdict | would merge / would escalate |
| Beni's decision (filled after) | |

## Questions for Beni

Each answerable in one word. Confirm here any ruling a vendor recorded second-hand.

1.

## Handoff block

One fenced, paste-ready block: merge command pinned to the SHA with the squash message and co-author trailers (Every `Co-authored-by:` trailer is spelled out in full as literal text (name and address): every commit author, resolved in the reviewed clone from `git log --format='%an <%ae>' origin/main..<head>`, plus every vendor that gave a review pass or a records cold read on the PR, taken from the review comments and briefs and written with that vendor's commit identity from `AGENTS.md` hard rule 10. Never fill a trailer by shell substitution at merge time: the merging clone may not have the commit, which is how PR #3's squash got an empty Cursor trailer.); for a release, the annotated tag and push commands; `git pull`; a check that `origin/main` equals the squash commit GitHub recorded (`gh pr view <N> --json mergeCommit`); and the three green checks.
