# Pass 1.5 brief: PR #1

Written by the PM on 2026-10-30 (America/New_York) after reading Codex's Pass 1 comment on PR #1 (reviewed head `cea220f`, post-fix head `68b5670`). Codex receives this brief for Pass 2.

All 18 findings are accepted. Two are accepted with a narrower fix than Pass 1 proposed (7 and 8). None goes to Cursor as rework, because no Cursor build exists yet: every fix is a PM revision of the rules, the skill or the specs, committed on `docs/scaffold`.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | High | accept | The PM wrote the leaking claims row; this is my error. The PR body is sanitized. Still open: Beni deletes the earliest body revision from the edit history (UI only; no REST route exists) and re-runs his private-list check. Codex is right that `grep -f <file> \| wc -l` prints 0 when the pattern file is missing. The privacy-command rule (ruling 1) requires a readable-file precheck and a nonzero exit on a failed scan, so a failed scan never reads as zero hits. | no |
| 2 | Medium | accept | Concrete now: 68b5670 is Codex-authored. Fix: Pass 0 records each commit's authoring vendor. Before the gate, every commit has a cold read from a vendor that did not author it. On a Claude-authored PR, Codex takes Pass 1, Codex's Pass 2 covers only the Claude-authored revision delta, and any Codex-authored commit gets its cold read from the fresh Claude session at Pass 2.5. The Fable pins name the Claude seats only. If no pinned eligible seat exists, stop and escalate. Routing for this PR is in "Authorship record" below. | no |
| 3 | Medium | accept | Fast-track changes review depth only. It never changes who merges (Beni, through shadow mode), never applies to a release or numbering fork, and keeps resolved findings, applicable checks and `--match-head-commit`. Delegated merging starts only on an owner activation record that cites the shadow log. Templates updated with the rule. | no |
| 4 | Medium | accept | A squash merge cannot equal the reviewed head. Post-merge check: `origin/main` equals the squash commit GitHub recorded for the PR, and the peeled tag equals that commit. If the base did not move, the squash commit's tree equals the reviewed head's tree (`git rev-parse <squash>^{tree} <head>^{tree}`); if it moved, `verify` runs green on the squash commit. The reviewed head SHA is recorded separately. | no |
| 5 | Medium | accept | Adds a bootstrap path for pre-S00 docs-only PRs: static checks only, each skipped check stated N/A with a reason. Amends the High gate: a High outside tracked files (PR body, comments, settings) is closed by a recorded remediation check plus Beni's confirmation, not a test. The missing Pass 0 brief is supplied as a retroactive record (`docs/reviews/pr-1-pass-0.md`), labelled as such. | no |
| 6 | Medium | accept | S00 gets named self-test commands with failure assertions per criterion (Pass 1's table, adopted). The final `verify` job runs `if: always()` and fails unless every needed job's result is `success`. AC8's negative run moves off the deliverable branch (ruling 5). | no |
| 7 | Medium | accept and dispute | Accept: token boundaries and case for CUSIPs, account variants (numeric, letter plus digits, masked), address variants, ordinary-code negatives, fixture-only allowlisting with reasons, fail-closed on binary or undecodable files, tracked local-only paths, scan errors and missing base history. Dispute the scope only: the tripwire is a heuristic backstop and the spec says so. It does not try to detect arbitrary names or facts; the private-list check and review cover those. | no |
| 8 | Medium | accept and dispute | Accept that intercepting a few Node APIs proves nothing about "no network". Dispute the remedy of enumerating every transport: CI runs `pnpm verify` after install inside a network namespace with no route out, so any transport, child process or DNS lookup fails. The in-process guard stays as a fast local check, and its self-tests run in isolated child processes. The namespace job is authoritative. | no |
| 9 | Medium | accept | Determinism check becomes: regenerate, then `git status --porcelain --untracked-files=all -- <registered output trees>` must print nothing. Negative cases: tracked edit, deletion, staged change, new file. Skill and executive template updated. | no |
| 10 | Medium | accept | S00 names `@keel/core`, defines the `test` script contract (filter forwarding, nonempty suites, honesty-file discovery), and lists `packages/core/**` as a sensitive path. S01 registers a versioned seeded terms generator in `fixtures:regen`. | no |
| 11 | Medium | accept | S01 gets a field contract table: required or optional, value type, unit, range, null rule, rounding rule, and discriminated definitions for known, unknown and conflict terms. Lexical YAML rules are separated from the JSON Schema. | no |
| 12 | Medium | accept | A `primary` status must cite a source ID that resolves to a source of kind `primary`. Conflict candidates carry full provenance and keep source order; nothing picks a winner. Negative tests for primary claims backed by advisor or document sources and for dangling source IDs. | no |
| 13 | Medium | accept | The spec fixes the exact critical payoff paths (including premium rate, barrier level and call timing), counts a schedule as one path, counts an absent critical term as unverified, separates terms, diagnostics and date flags in the result, and freezes the expected summary counts for the named fixture. | no |
| 14 | Medium | accept | One portable relative-path grammar: forward slashes only, no `..`, no rooted, drive or UNC forms, checked before normalization. Symlink containment stays at the later I/O boundary. | no |
| 15 | Medium | accept | `.gitignore` anchors to `/design/` so `docs/design/` stays tracked (ruling 6). | no |
| 16 | Medium | accept | The DCO line in the PR body was the PM's, not an owner ruling. Removed pending ruling 4. | no |
| 17 | Low | accept | Replaced with: a review may report no findings when it records its checks, scope and limits. | no |
| 18 | Low | accept | 68b5670 is Codex-authored, so its cold read goes to the Pass 2.5 Claude session, not Codex. | no |

## Authorship record for PR #1

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `cd1df4d` scaffold | Claude (PM) | Codex, Pass 1 |
| `cea220f` S00 `verify` check | Claude (PM) | Codex, Pass 1 |
| `68b5670` README copy | Codex | fresh Claude session, Pass 2.5 |
| PM revision commits after this brief | Claude (PM) | Codex, Pass 2 (revision delta only) |

Reproduce the first three rows: `git log --format='%h %an' 262f119..68b5670`.

## Rulings from Beni

Beni ruled on 2026-10-30 (America/New_York):

1. Privacy-command rule: patterns are read from a file outside the repo and never spelled out; the check prechecks that the file is readable, and a failed scan exits nonzero. **Approved.**
2. Routing in finding 2 and the authorship record above: **Approved.**
3. Gate and bootstrap clarifications in findings 3 to 5: **Approved.**
4. DCO: not required now. Required for human contributors from the first outside PR. Agents never sign off. **Approved.**
5. S00 AC8's failing-dependency evidence comes from a throwaway probe branch that is never merged and is deleted after the run is recorded: **Approved.**
6. Anchor the ignore rule to `/design/`: **Approved.**
7. The earliest PR #1 body revision is deleted from the edit history, and Beni's private-list check shows no leaking revision: **Confirmed by Beni.**

Specs are revised before either build starts; that follows from accepting findings 6 to 14 and needs no separate ruling.

## Sealed appendix for Pass 2

Pass 1's findings and fixes are suspicions to re-derive, not conclusions. Codex reads only the PM revision delta (the commits after `68b5670`) and checks that each accepted finding is resolved as dispositioned above, that the two disputes (7 and 8) hold up, and that the revision added no new gap. Codex does not re-review `68b5670`.
