# Executive brief: PR #16, Pass 2.5, 2026-11-02 America/New_York

Recorded by the PM on 2026-11-02 (America/New_York). The Pass 2.5 session (Claude, fresh session, Opus 5.5 High) delivered this brief in chat, and its PR comment ([issuecomment-6590526388](https://github.com/BeniCheni/keel/pull/16#issuecomment-6590526388)) says the PM records it. It stands below as that session wrote it, except for the "Beni's decision" row in the gate log.

Beni ruled "Yes, fix first" on question 1, so the handoff block below is void: it is pinned to `c4c3e1f`, and the head has moved to `8419c84`. A second Pass 2.5 reads the new head and writes the block he merges from. Questions 2 and 3 are answered first-hand in `pr-16-pass-1.5.md`, rulings 16 and 17.

The PM re-ran these of the brief's numbers, and they hold:

| Figure | Command | Result |
| --- | --- | --- |
| Scope at `c4c3e1f` | `git diff --shortstat origin/main...c4c3e1f` | 3 files, +475 −2 |
| Commits by vendor | `git log --format='%an' origin/main..c4c3e1f \| sort \| uniq -c` | 8 Claude, 1 Codex |
| Fixtures | `git ls-files fixtures/synthetic/terms \| grep -c '\.yaml$'`, and the same under `valid/` and `invalid/` | 31, 2, 29 |
| Core and schema size | `git ls-files packages/core/src \| grep -v test \| xargs cat \| wc -l`; `wc -l schemas/mln-terms/0.1.json` | 964; 2163 |
| Roles and stories | The PR body's `awk`; the spec's `grep` | 13, 20, 15; 35, 13 |
| Arithmetic | `node -p '[60-6+1, 2*(60-6+1), 3*(60-6+1)].join(" ")'` | 55, 110, 165 |
| CI at `c4c3e1f` | `gh run view 41529775953 --repo BeniCheni/keel --json conclusion,headSha` | success at that SHA |
| Demo mode absent | `git grep -c -i 'demo mode' -- README.md package.json` | exit 1, no match |
| M1's probe | `loadTerms` on the valid fixture with `retrieved_at` on a source, or `as_of` at the top level, on Node 24.22.2 and 26.13.0 | `ok=false`, `unknown-key`, both Nodes |
| AC8 with a misreported base | Scratch repo; both commands are in `pr-16-pass-1.5.md` | As the brief says, and one more case that its command missed |

The PM did not re-run the V8 anchor table, the `console` or `--jitless` probes, or the Apple reads. `verify` at `8419c84` gave the same test counts as this brief's: core 33 of 33 in 9 files, tooling 122 of 122 in 10 files, exit 0 on both Nodes (`pnpm install --frozen-lockfile && pnpm verify`).

Every number below comes from a command run in this session, in the fresh clone `~/keel-reviews/pr-16-2.5` at `c4c3e1f817ee2c53b991cf2e5b9473fbee25c43d`, with `KEEL_DATA_DIR` an empty `mktemp -d`. A number from a PR comment is labelled as that vendor's claim. The seat is Claude on Opus 5.5 High (`get_session` reports `claude-opus-5-5`, effort `high`), with no fallback used.

## Decision

Shadow mode: the gate says **"would escalate"** because finding 2's High closes only by Beni's ruling 12, an exception the gate clause does not provide for. Beni merges. The PM records this brief; the PR comment is [issuecomment-6590526388](https://github.com/BeniCheni/keel/pull/16#issuecomment-6590526388).

The review verdict is mergeable, by exception. Four Mediums are open, and none of them blocks the gate.

**Conflict to report:** `AGENTS.md` Severity closes a High in tracked files only with a fix commit and a test, and has no exception path. I recorded ruling 12 as the exception you asked for and did not count it as meeting the clause. Cursor's Pass 1 seat is also a PR-only ruling outside `AGENTS.md`. Neither changes that file.

## What ships

- A registered plan for choosing how a native iOS companion runs keel's core: Path A (`@keel/core` in JavaScriptCore) or Path B (a Swift port).
- A phone journey for all 48 Must and Should M1 stories: 13 Primary, 20 Read-only, 15 Desktop-only.
- A draft ADR-0009, Status: Proposed, which supersedes nothing.
- An honest finding that story 9.1 works as transport and falls short as content.
- It still declines to claim that either path works. No spike code exists, no Swift has run, and a pass would cover the terms loader only.

## What the passes found

**Pass 1 (Cursor, at `8c0deaf`; its claims)**
- 1, High: required `verify` was red from a cancelled macOS cell.
- 2, High: a scheduled reminder could state a stale fact as current.
- 3, Medium: mis-cited story 9.1's acceptance.
- 4, Medium: the close-call band conflicted with the clauses.
- 5, Medium: `standalone`-only was named both as Path A and as a failure.
- 6, Medium: positions were required where terms are enough.
- 7, Medium: the as-of date was undefined.
- 8, Medium: A8 and A6 timers assumed a calendar and a rating date that do not exist.
- 9, Medium: "55 observations" did not imply a rolling window.
- 10, Medium: Q5's sources were incomplete.
- 11, Medium: demo mode's role was wrong.
- 12, Medium: acknowledged alert state was missing from the gap table.
- 13, Medium: the `console` trap was overstated.
- 14, Medium: the boundary walk trips on a quoted import.
- 15, Medium: the load measurement was warm, and testability was on.
- 16, Low: the host shim was unbounded.
- 17, Low: mutation rows had no commands.
- 18, Low: the strongest argument against led with the wrong failure.

**Pass 2 (Codex, at `044690c`; its claims)**
- It accepted all 18 findings, disputing the characterisation of 5, the breadth of 15, and the `console` half of 13.
- C1 to C8 are Mediums, fixed in `804720e`: notification wording, as-of definition, `loadTerms` scope, roles, AC8, the ADR's boundary sentence, "interpreter-only", and the forum reading.
- C9, High: finding 2's closure lacked a test. Closed by Beni's ruling 12.
- Pass M: N/A.

**Pass 2.5 cold read of `804720e`, every hunk then the spec and ADR at the head**

| # | Severity | Finding | How verified |
| --- | --- | --- | --- |
| M1 | Medium | "Terms and alerts keep their own dated provenance" is untrue of terms at the head ([spec:161](docs/specs/s90-ios-core-spike.md:161), [ADR:20](docs/adr/0009-ios-companion-and-core.md:20)). "Applicable data dates" ([spec:160](docs/specs/s90-ios-core-spike.md:160)) therefore has no oracle for A5 and A9 in AC12. The research's `sources` table lists `retrieved_at`, so a later export could carry it. | `loadTerms` on the valid fixture plus `retrieved_at` on a source, or `as_of` on a term: `ok=false`, `unknown-key`, on both Nodes |
| M2 | Medium | AC8's base is self-reported, and its only record is in results written after the review ([spec:166](docs/specs/s90-ios-core-spike.md:166), [spec:354](docs/specs/s90-ios-core-spike.md:354)). Nothing ties it to AC11. | Scratch repo with a change outside the folder: true base exits 1; `KEEL_SPIKE_BASE=HEAD` exits 0 |
| M3 | Medium | The A4 row now says "A scheduled prompt" ([spec:148](docs/specs/s90-ios-core-spike.md:148)), and the ADR says A4 does not notify a closed app ([ADR:24](docs/adr/0009-ios-companion-and-core.md:24)). AC12 tests that prompt. If it is per observation, the "110" becomes 165. | Read both lines; `3*(60-6+1)` prints 165 |
| M4 | Medium | Left stale: "every screen says when that was" ([ADR:32](docs/adr/0009-ios-companion-and-core.md:32)) and "the as-of date" ([spec:87](docs/specs/s90-ios-core-spike.md:87)). Both conflict with [ADR:20](docs/adr/0009-ios-companion-and-core.md:20) and [spec:161](docs/specs/s90-ios-core-spike.md:161). | `git blame` shows `9e96d5f`; `804720e` retired the term and left them |
| L1 | Low | Q5 re-checks only backup exclusion after a replacement ([spec:276](docs/specs/s90-ios-core-spike.md:276)), while [ADR:22](docs/adr/0009-ios-companion-and-core.md:22) requires both attributes. "Must not silently reset it" also reads as a demand on iOS; Apple's page warns that some operations do reset it. | Read; Apple's page fetched |
| L2 | Low | "Names the closes" ([spec:160](docs/specs/s90-ios-core-spike.md:160)) could mean levels on a lock screen, against "Amounts … stay out" ([ADR:24](docs/adr/0009-ios-companion-and-core.md:24)). Separately dated series may also not fit a first line, and Q5 does not check truncation. | Read; no device run |
| L3 | Low | "Mismatch or coverage failure" ([spec:373](docs/specs/s90-ios-core-spike.md:373)) does not describe the `node:fs`, `montecarlo` or first-line rows. | Read |

**Rulings, clauses and thresholds are not weakened.** Comparing the spec before and after `804720e`, the "Beni's rulings" section is byte-identical. In "Decision rule", only the "Why these" line differs. Fresh-launch evidence and sanitized logs tighten ruling 6 and hard rule 1.

**Sentences in `804720e` tested and upheld**
- **The 64 limit:** the Apple engineer's accepted answer confirms 64 pending requests per app and promises no retention order. `curl` got a bot-check page, so I read it in the built-in browser, from the page's structured data.
- **Xcode 7 note:** the release notes say Enable Testability prohibits optimizations that depend on not exporting internal symbols.
- **`UNUserNotificationCenter`:** the page's documentation JSON has 0 standalone `64`s.
- **V8 flags:** `--trace-regexp-tier-up` gives 41 native-code records on 24.22.2 and none on 26.13.0, but `--print-regexp-code` shows regexp code on both.
- **`--jitless`:** exits 1 with `ERR_WEBASSEMBLY_NOT_SUPPORTED` on both Nodes.
- **AC8 on Git failure:** exits 128 for an empty, unset or bad ref. The old pipeline printed 0 with exit 0 outside a repo, so C5 was real.
- **Boundary sentence:** a comment or raw string literal exits 1; the word alone or a native Swift import exits 0. An escaped literal also exits 0, which the ADR's limit sentence covers.

**Pass 2.5 corroboration**
- Finding 1: CI run 41529775953 is success at the head.
- Finding 2: the wording is at [spec:160](docs/specs/s90-ios-core-spike.md:160) and [ADR:24](docs/adr/0009-ios-companion-and-core.md:24), and it closes by exception.
- Finding 13: the probe ran on both Nodes.
- Findings 14 and C6: the boundary probes above.
- C4: role counts re-run.
- C5, C7 and C8: as above.
- The others I read at the head and did not re-run.

**Contested: nothing open.** Three disputes are settled:
- **Ajv and `console`:** Cursor reported that compile completes with `console` removed; the PM said an absent binding throws. Codex and my probe agree with the PM: absent gives `ReferenceError`, `undefined` compiles. No JSContext has run.
- **Finding 2's closure:** the PM said `b6cbcc9` closed it; Codex said it had no test. Beni ruled 12.
- **`standalone`-only and the joint gate:** Codex asked; Beni ruled 13 and 14.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | Exit 0 on 24.22.2 and 26.13.0 |
| Verify | `pnpm verify` | Exit 0 on both; core 33 of 33 in 9 files, tooling 122 of 122 in 10 files |
| Determinism | The `fixtures:regen` and `fixtures:trees` check from the brief template | Exit 0 on both |
| Zero network | Inside `pnpm verify` | Green on both; not run separately |
| Tripwire | `node tools/tripwire/cli.mjs` | Exit 0, 0 lines, on both |
| Mutations | N/A | No code or fixture changes, and the spike's floor is not a suite yet |
| Pass M | N/A | No engine or golden fixture touched |
| UI matrix | N/A | No UI change |
| Demo mode | N/A | `git grep` finds none in the README or `package.json` |
| CI | `gh run view 41529775953` | Success at `c4c3e1f` |
| Scope | `git diff --shortstat origin/main...HEAD` | 3 files, +475 −2; `git diff --check` exit 0 |
| Stories and roles | The spec's `grep` and the PR body's `awk`, plus an ID comparison | 35 Must, 13 Should; 48 IDs equal; 13, 20, 15 |
| Sizes | `git ls-files` and `wc -l` commands | 31 fixtures (2 valid, 29 invalid); core 964 lines; schema 2163 lines |
| Arithmetic | `node -p` | 55, 110, 165 |

**Not re-run, and why**
- **Every swift, xcodebuild and devicectl command:** not run, because this Mac has no full Xcode. AC12 and JavaScriptCore behaviour are therefore untested.
- **Owner's private-list check:** Codex's count, not mine: 0 hits across the diff, 9 commit messages, 2 PR fields, 2 issue comments, 0 inline comments and 0 review bodies (issuecomment-6589253253). It does not cover my comment. I scanned that with the tripwire only: exit 0, no addresses.
- **Not re-run and not reported as mine:** library licenses, macOS CI cell seconds, Q4's per-file lines, the Q2 locale grep, Apple's guideline and Personal Team paraphrases, and Codex's other Apple reads.
- **Cold reads of `025f853` and `c4c3e1f`:** not given by this seat, by your instruction. Codex's re-read found nothing (its claim).

## Estimates and model output

The V8 anchors are ESTIMATE, on the assumption that V8 on an Apple M4 is a guide to scale. None was checked against JavaScriptCore. Three runs each, from the spec's "Anchor" script:

| Node | Flags | Import ms | Median `loadTerms` ms | Worst ms |
| --- | --- | --- | --- | --- |
| 24.22.2 | none | 93.6 to 150.0 | 0.96 to 1.26 | 9.0 to 10.0 |
| 24.22.2 | compiler flags | 131.9 to 150.9 | 2.45 to 2.68 | 8.6 to 10.6 |
| 26.13.0 | none | 160.5 to 266.5 | 1.24 to 1.40 | 11.0 to 14.2 |
| 26.13.0 | compiler flags | 115.8 to 269.3 | 2.41 to 2.96 | 8.6 to 10.0 |

The order of magnitude holds. The spec's narrower ranges, such as 93 to 103 ms, did not repeat here, and on Node 26 the import gap between flag settings is within noise. The thresholds of 500 ms and 50 ms are Beni's and are not derived from these figures.

## Risks and accepted costs

- A reminder for a note called on the desktop still fires on the phone until the next import. The wording rule makes it say it is from a snapshot, and it does not stop it.
- Finding 2's test does not exist yet. AC12 requires one in the spike, and ADR-0009 requires one with the real app before any notification text ships. Spike code never merges, so that second test is the one that binds.
- A barrier or a call cannot reach a closed app. The ADR accepts this to keep nothing leaving the owner's machines.
- If the phone is not opened before its reminder window ends, reminders stop, and nothing in the spec warns the owner that they are about to.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes; S90 is Beni's ruling |
| Verdict mergeable, every High closed | **By exception.** Finding 1: closed by a green re-run plus ruling 11. Finding 2 (Codex's C9): High, closed by Beni's ruling 12 as an exception for this PR only, with AC12 and ADR-0009's obligation. It is not a fix commit with a test, and the clause as written is not met. |
| Nothing contested | Yes; settled above |
| `verify` green at tip; every number re-run | Yes for every number reported; the rest is listed as not re-run |
| No sensitive path, dependency or schema change | Yes; 3 docs files |
| Every commit cold-read by a non-author vendor | Yes; `804720e` by this seat, the other 8 by Cursor and Codex per the authorship record and comments |
| Gate verdict | **Would escalate** |
| Beni's decision (filled after) | Fix first (ruling 15). His merge decision follows the second Pass 2.5 |

## Questions for Beni

1. Fix M1 to M4 on this PR before merging? I recommend **yes**, because M1 and M3 sit on AC12, which ruling 12 leans on, and the spec stays as registered once merged. It costs one docs commit and a Codex re-read, and it voids the block below. **No** means merge now and carry them to a docs PR before the spike branch is cut.
2. Does A4's date-based prompt notify a closed app? Yes or no; this settles M3.
3. Do rulings 1 to 14 and the Cursor seat stand as the PM recorded them? Yes or no; these are second-hand here.

## Handoff block

Authors from `git log --format='%an <%ae>' origin/main..HEAD`: 8 commits by Claude, 1 by Codex. Review passes: Cursor (Pass 1), Codex (Pass 2 and re-read), Claude (Pass 2.5). `verify.yml` has no `ready_for_review` trigger, so `gh pr ready` does not restart the check.

```bash
gh pr ready 16 --repo BeniCheni/keel && gh pr merge 16 --repo BeniCheni/keel --squash --match-head-commit c4c3e1f817ee2c53b991cf2e5b9473fbee25c43d --subject "docs(s90): iOS core spike spec, phone journey and ADR-0009 (#16)" --body "$(cat <<'EOF'
Adds the S90 spec, a phone journey for the 48 Must and Should M1 stories, a pre-registered decision rule between JavaScriptCore and a Swift port, and ADR-0009 as Proposed. No code changes, and the M1 slice plan does not change.

Reviewed head: c4c3e1f817ee2c53b991cf2e5b9473fbee25c43d. Pass 1 by Cursor, by Beni's word for this PR only (issuecomment-6587500288). Pass 2 by Codex (issuecomment-6588858035), with its re-read (issuecomment-6589253253). Pass 2.5 by Claude (issuecomment-6590526388).

Finding 2's High closes by Beni's ruling 12, an exception for this PR only, not by a fix commit with a test. AC12 and ADR-0009 carry the test obligation.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
Co-authored-by: Cursor <cursoragent@cursor.com>
EOF
)" && git pull && test "$(gh pr view 16 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" = "$(git rev-parse origin/main)" && echo "origin/main is the squash commit" && pnpm install --frozen-lockfile && KEEL_DATA_DIR="$(mktemp -d)" pnpm verify
```

The third green check, demo mode starting with zero outbound requests, is N/A because no demo mode exists before the UI slices. Check by eye that the README renders. The merge is Beni's; this seat stops here.
