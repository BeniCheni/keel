# Review (Pass <1 or 2>): <one-sentence verdict>

Verdict: <mergeable | mergeable after fixes | not mergeable>. An open High makes the verdict "not mergeable". A High in tracked files closes with a fix commit and a test that fails without it; a High outside tracked files closes with a recorded remediation check plus Beni's confirmation.

- Head SHA reviewed: `<sha>`; post-fix SHA: `<sha or none>`; date: <YYYY-MM-DD, America/New_York>
- Seat: <Claude Code | Codex>, model <name and effort>, fallback used: <no | yes, why>
- Fresh clone: <yes>; `KEEL_DATA_DIR` pointed at an empty temp directory: <yes>
- Baseline: <tests run / passed / failed> on Node <floor> and <current>; `pnpm verify` <green | red>
- Diff: <files changed, insertions, deletions> against `origin/main`; `verify` run: <link and result>
- Sensitive paths touched: <none | list>

## Findings

| # | Severity | Finding (one sentence, file:line) | How verified (command, SHA or number) | Fix (commit SHA, or "not fixed: why") |
| --- | --- | --- | --- | --- |
| 1 | High / Medium / Low | | | |

## Pass 1 findings adjudicated (Pass 2 only)

| Pass 1 # | Disposition (accept / contest / accept and dispute) | Evidence |
| --- | --- | --- |

## Pass M (Pass 2, engine PRs only)

Command: `python3 tools/reference/payoff.py fixtures/golden/`. Cases compared: <n>. Disagreements: <n, each listed as a finding>.

## Killed as unreproducible

| Lead | What was tried | What was observed |
| --- | --- | --- |

## Mutations run

| Claim | Mutation | Suite result | Died for the right reason? |
| --- | --- | --- | --- |

A surviving mutant is a finding: High on a boundary, Medium elsewhere.

## Privacy sweep

| Pattern class | Hits |
| --- | --- |
| CUSIP (check-digit valid, not allowlisted) | |
| Account identifier | |
| SSN pattern | |
| Street address | |
| Email (non-noreply) | |
| Price file without synthetic header | |

Matched values are never printed.

## Human-review resolutions

<How each item a human raised was addressed, and where it is recorded.>

## Deliberately not done

| Item | Why | Rough size |
| --- | --- | --- |

## As run

<Every command run, with the count it produced and how the count was made. Anything not run, and why.>

## Retro

- Caught: <one line>
- Missed or wasted: <one line>
