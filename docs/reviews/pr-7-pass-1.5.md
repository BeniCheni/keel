# Pass 1.5 brief: PR #7

Written by the PM on 2026-10-31 (America/New_York) after reading Codex's Pass 1 comment on PR #7 (issuecomment-6546987719; reviewed head `80c0eb3`, post-fix head `acbcc25`) and Beni's rulings.

All eight findings are accepted. Findings 5 to 7 were fixed by Codex in `acbcc25`. Findings 1 to 4 and 8 are fixed by the PM commit after this brief, applying Beni's rulings Q1 to Q6. No rework goes to Cursor: this PR has no code.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | Medium | accept | The records-PR shortcut dropped the non-author cold read that the authorship rule requires, and it reached `gate-activation.md`. Now a records PR gets one non-author cold read, posted as a comment, with no briefs written (Q1); `gate-activation.md` is excluded (Q2). Records still never generate records. | no |
| 2 | Medium | accept | A reviewer who wrote no commit had no trailer. Trailers now list commit authors from Git plus every reviewing vendor from the review comments and briefs, using the commit identities now listed in hard rule 10 (Q3). | no |
| 3 | Medium | accept | The network test's fixed `zz-guard.test.mjs` collides too, and a same-process name check proves nothing across processes. Every in-repo temp file is now named per process, and AC4 runs two overlapping child processes at a barrier, with a cleanup check (Q4). | no |
| 4 | Medium | accept | The timeout check missed helper-spawned subprocesses and files outside the three named. All spawning now goes through listed entry points, and AC1 covers every tooling test file (Q5). | no |
| 5 | Medium | accept | ADR-0003 claimed provenance on every field; S01 has plain fields and source-free statuses. Fixed in `acbcc25`. | no |
| 6 | Medium | accept | ADR-0002 claimed the existing checks enforce purity; they do not cover file system, clock or randomness. Fixed in `acbcc25`. | no |
| 7 | Medium | accept | ADR-0004 and ADR-0005 overclaimed. Fixed in `acbcc25`. | no |
| 8 | Low | accept | S00.1 had no story IDs. It now inherits S00's 11.1, 11.2 and 11.3 (Q6). | no |

Codex's AC5 note is adopted too: the unlisted-address case now puts the address in the reason column of a valid `vendors.txt` line, so the test does not change the configured list.

## Authorship record

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `a0db3bb` housekeeping, `80c0eb3` Pass 0 brief | Claude (PM) | Codex, Pass 1 |
| `acbcc25` ADR corrections | Codex | fresh Claude session before merge |
| `ada396b` PM commit applying Q1 to Q6, with this brief | Claude (PM) | Codex, scoped re-read (issuecomment-6547327421) |
| `f1bc1b6`, `72b9a7f` PM commits applying Q8 | Claude (PM) | Codex, scoped re-read (issuecomment-6547815846) |
| PM commit completing Q8 (per-symbol helper tracking) | Claude (PM) | Codex, scoped re-read of that commit only |

## Rulings from Beni

Beni ruled on 2026-10-31 (America/New_York):

1. Q1: records PRs keep one non-author cold read, posted as a comment, writing no records. **Approved.**
2. Q2: `docs/reviews/gate-activation.md` never lands as a records PR. **Approved.**
3. Q3: trailers list commit authors from Git plus every reviewing vendor, spelled out in full. **Approved.**
4. Q4: per-process temp files, an overlapping-process AC4 and cleanup checks in S00.1. **Approved.**
5. Q5: AC1 covers direct and helper-mediated subprocesses in every tooling test file. **Approved.**
6. Q6: S00.1 inherits S00's story IDs. **Approved.**
7. Q7: ADR-0001 to 0008 as recorded (Accepted, decided 2026-10-29), and the rulings recorded second-hand in this PR (S00.1 numbering, S00.1 before S01, allowlist scoped to `fixtures/`). **Confirmed.**
8. Q8, from Codex's scoped re-read of `ada396b` (issuecomment-6547327421): S00.1's AC1 computes spawning entry points from the import graph, following wrappers and re-exports transitively, and rejects a test that calls an unlisted wrapper without the timeout. **Approved**, to be fixed in this PR.
9. Q8, completed after Codex's re-read of `72b9a7f` (issuecomment-6547815846): spawning is tracked per exported symbol, so a wrapper or re-export of a spawning helper from `helpers.mjs` is covered, while a module importing only non-spawning helpers is not; AC1 fixtures add a helper-wrapper, a helper re-export, a second-level wrapper and a passing write-only control. **Approved.**
