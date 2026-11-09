# Pass 0 brief: PR #28 (S02 observation schedule and exchange calendar spec)

Written by the PM on 2026-11-08 (America/New_York), from a fresh read of the PR. The same Claude session wrote the PR and this brief, so Pass 1 and Pass 2 are its cold reads.

## Seat for Pass 1

Codex, GPT-6.1 Sol High. `AGENTS.md` gives Codex Pass 1 on a Claude-authored PR, and on a spec that pass is the plan challenge. The seat has no fallback: if it is unavailable, stop and escalate.

Later seats: Pass 1.5 is the PM. Pass 2 is Codex, on the Claude-authored commits after Pass 1. Pass 2.5 is a fresh Claude session on Opus 5.5 High, including the cold read of any Codex commit. Beni merges.

## Scope

- Spec: this PR adds `docs/specs/s02-schedule.md`. Design brief: none.
- Sensitive paths touched: none (`git diff --name-only origin/main...HEAD` lists `docs/README.md`, `docs/reviews/pr-28-pass-0.md`, `docs/specs/s02-schedule.md` and `docs/v0.1.0-ideas.md`). The build this spec authorizes will touch `packages/core/**`.
- Release: no.
- New dependencies: none, in this PR or in the build it specifies.
- Bootstrap path: no. `verify` applies through CI. Mutations and Pass M do not apply, because no code or fixture changes.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| Every commit on the branch, this brief's included | Claude | Codex, Pass 1 |

## Fast-track

Not allowed. This spec is the build authority for a sensitive-path slice, and `AGENTS.md` gives every spec the plan challenge.

## Beni's ruling

Beni ruled "Split, schedule first" on 2026-11-08, on how to slice the engine work, in the PM's session. Codex cannot see that session, and Beni's merge confirms it. The numbering S02 is the PM's proposal in that same exchange.

## What to check, beyond the skill's standing checks

Please derive the frozen values yourself before opening the sealed appendix.

1. **The calendar.** Do the rules in the spec reproduce NYSE's published holidays for 2026 to 2028, and do they state NYSE's Saturday rule correctly, including the New Year's Day exception? Re-derive the count and the SHA-256 for 2026 to 2060 with your own implementation.
2. **The frozen schedules.** Re-derive cases 1 to 12, the flags table and the diff. Do the cases reach each boundary the spec names?
3. **Decision 1 and hard rule 4.** Do rule-generated closures and a frozen table of published holiday dates sit inside "Real market data is never committed" and "Synthetic fixtures only"? The spec holds that they do not, and adds no fixture file.
4. **Decision 2.** Is one NYSE calendar for every underlying acceptable when a note may reference an underlying listed elsewhere, given that each generated date names the calendar and is tagged ESTIMATE?
5. **Decision 3.** Is starting coverage at 2026 right, given that a trade date before 2026 gets `outside-calendar`?
6. **Decision 4 and the last observation.** Does leaving a closed-day anchor unmoved, and excluding a date that rolls past maturity, give a schedule the rest of Milestone 1 can use? The research counts "Observation 3 of 55" for months 6 to 60.
7. **Decision 7.** Does returning `unavailable` for a conflict keep hard rule 6 without defeating story 3.4? `example-autocall.yaml` is that case.
8. **Honesty.** Can any path report a generated or unverified date as verified, or a date outside the calendar as open?
9. **Testability.** Can each acceptance criterion fail? AC10's grep exits 1 on no match, and on a path with no files, which is why it also counts files.
10. **Slice boundary.** Does anything here belong in S03, or does S03 need something this omits?
11. **Private list.** This seat runs the owner's private-list check, counts only, over the diff, the commit messages, the PR title and body, every comment and its own proposed comment.

## Sealed appendix: PM claims to verify independently

These are claims, not facts. Re-derive each one; report any that do not reproduce.

| # | Claim | How the PM got it |
| --- | --- | --- |
| 1 | The calendar has 345 closures for 2026 to 2060, with SHA-256 `e438df993de99cc780739a56901ea276353bc094675a0800cf1ac500a28d5fd5` over `<date> <name>\n` lines | The PM's scratch Python, using `datetime`, printed in the PR body |
| 2 | 2026, 2027 and 2028 match NYSE's published table, with 10, 10 and 9 closures | The same script, against <https://www.nyse.com/trade/hours-calendars>, read 2026-11-08 |
| 3 | Cases 1 to 7 give 19, 6, 6, 5, 4, 4 and 1 entries, with the dates in the spec | The same script |
| 4 | November 2029 has five Thursdays, and 2029-11-22 is the fourth | The same script |
