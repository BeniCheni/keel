# Pass 0 brief: PR #60 (S04 closes import and observation store, spec)

Written by the PM on 2026-11-25 (America/New_York), from a fresh read of the PR at `26d149d`. The same Claude session wrote the spec and this brief, so Codex's reads are the cold reads. The brief is in the PR, in the commit after `26d149d`, so its own row in the authorship record gives the command that finds it.

## Seat for Pass 1

Codex, GPT-6.2 Sol High. `AGENTS.md` gives Codex Pass 1 on a Claude-authored PR, and on a spec that pass is the plan challenge (the Pass 2 adjudicator row, `AGENTS.md:20`). PR #60 touches no sensitive path, so the pin is High. The seat has no fallback: if it is unavailable, stop and escalate.

## Seat for Pass 2, and the review depth

`AGENTS.md`'s Workflow gives a spec PR the full passes: Pass 1, Pass 1.5, Pass 2 by Codex on the Claude-authored commits after Pass 1, and Pass 2.5 by a fresh Claude session on Opus 5.5 High. Beni's ruling R1 of 2026-11-22 sets review depth by four risk tiers, generated, docs, code and sensitive, with the full 360 only for sensitive. R1 is not in `AGENTS.md` yet (`grep -n -i -E 'tier|claude code action|fork pr' AGENTS.md` prints nothing), so the seats table is stale on depth, and nothing written says what the docs tier gets.

The PM proposes, for this docs-tier spec PR: Pass 1 (the plan challenge), Pass 1.5, then Codex re-reads of each fix commit until one finds it mergeable, with no Pass 2 or Pass 2.5. The build PR, a code-tier PR, gets its own depth question in its own Pass 0 brief. This needs Beni's word (question 3 below), and until he gives it, the full passes stand.

## Scope

- Spec: `docs/specs/s04-closes-store.md`, new. Design brief: none.
- Sensitive paths touched: none (`git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers apps` prints nothing). The build the spec describes touches none either, by its Decision 9.
- Release: no. New dependencies: none in this PR, and none in the build: `node:sqlite` is part of Node, by Beni's ruling "node:sqlite (Recommended)".
- Bootstrap path: no. `verify` applies. Mutations and Pass M are N/A: no code, test or fixture changes. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.
- Files: `docs/specs/s04-closes-store.md`, `docs/README.md` (this PR's row) and this brief.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `26d149d`, the spec and its index row | Claude | Codex, Pass 1 |
| The commit that adds this brief and one spec correction (`git log --diff-filter=A -1 --format='%h %an' -- docs/reviews/pr-60-pass-0.md`) | Claude | Codex, Pass 1 |

The second commit corrects one line of the spec: the import result's `conflicts` now compares values as exact fractions, as S03 does, so `95.1` and `95.10` from two sources are not a conflict (`git diff 26d149d HEAD -- docs/specs`).

## Fast-track

Not allowed. `AGENTS.md` gives every spec the plan challenge.

## Beni's rulings

All were given on 2026-11-24 at 22:39:50 EST in the PM's session, which Codex cannot see. The spec's Status line and Decisions 1 to 3 quote them.

- **"Three slices (Recommended)"**, to how the proposal's Day 4 is cut. S04 is CSV closes import, the split detector and the observation store; next is the pure alert evaluator in `packages/core`; then the check command and the launchd sample.
- **"S04, S05, S06 (Recommended)"**, to whether those take top-level numbers or `S04.M` numbers.
- **"node:sqlite (Recommended)"**, to Node's built-in SQLite or a native addon. The question quoted the stability line of Node's documentation for 24 and 26, and the local run on Node 24.15.0.
- **"Later slice (Recommended)"**, to whether story 2.3, manual marks, goes in S04.

## Questions for Beni

Each is answerable in one word, and the PR body asks the first two.

1. **Node type declarations.** Keep Decision 5, hand-written declarations for the few Node members the store uses, rather than add `@types/node` as a development dependency?
2. **Idea 97 first.** S04's build is the first code that reads `KEEL_DATA_DIR`, and the review skill's setup still exports it from an unchecked `mktemp -d`. Fix the skill in its own sensitive-path PR before the build starts?
3. **Review depth.** For this spec PR, the plan challenge and re-reads of each fix, with no Pass 2 or Pass 2.5, as proposed above?

## What to check, beyond the skill's standing checks

This is the plan challenge: find what is wrong with the plan before it binds the build.

1. **Scope against the rulings.** Does the spec stay inside the three-slice cut and leave out story 2.3? Is anything in it S05's or S06's work, or does it leave a gap S05 or S06 will need (A8's stale-data dates, the check command's store path)? Is "no command-line import" (Decision 6) a gap in story 2.1?
2. **`node:sqlite`.** On Node 24.22.2 and 26.13.0, do `DatabaseSync`, `STRICT` tables, triggers, `journal_mode = WAL`, `busy_timeout` and `BEGIN IMMEDIATE` behave as the spec needs? Does opening a database print an `ExperimentalWarning` on either version (AC11)? Is one file enough to contain a change to a release-candidate API?
3. **Decision 5.** Can a package with `"types": []` typecheck its source and its tests against hand-written declarations of `node:sqlite`, `node:fs`, `node:os`, `node:crypto`, `node:child_process` and `TextDecoder`, as `tools/verify/steps.mjs` would run it? What does that cost against `@types/node`?
4. **Sensitive paths.** Is Decision 9 right that `packages/store/**`, `tools/generators/closes/**`, `tools/fixtures/registry.mjs`, `tools/verify/steps.mjs` and `fixtures/synthetic/closes/**` are outside `AGENTS.md`'s list? Does AC9, which reads `fixtures/golden/g03-live`, touch it?
5. **The CSV format.** Is each rule testable as written, and is the set complete for a common export (an empty or `null` close, a byte-order mark, CRLF, descending dates)? Is all-or-nothing on any bad line right for story 2.1?
6. **The split flag.** Are the boundaries exact (`7/5` and `3/5` not flagged), and does the frozen table's float row show what it says? Is the `previous` rule sound when the earlier date holds a conflict, and is leaving back-filled pairs unchecked acceptable?
7. **Where the store lives.** Are the location rules right for each platform, including the `win32` absolute-path rule? Is refusing any path under a directory that holds `.git` the right guard for hard rule 1, given that it also refuses a home folder kept in Git?
8. **Append-only and conflicts.** Do the triggers, the UNIQUE key on the value's text and the exact-fraction conflict rule agree? Can any import path store a value other than the file's text, or lose one?
9. **Locking.** Is AC7 reliable on CI runners with a 50 ms busy timeout, and does the one-transaction import meet ADR-0004's argument against?
10. **Engine parity.** Is AC9 feasible as written: does `evaluateNote`'s result for `g03-live` differ only in each close's `source` when its closes come back from the store?
11. **Each acceptance criterion and the mutation floor.** Will each criterion's test run as named, from a fresh clone? Does every claim have three mutants, including each boundary?
12. **Privacy.** Can any column hold a directory, a host or a user name? Do the folder and file modes cover the `-wal` and `-shm` files?

Out of scope: building anything, and any change to `AGENTS.md` or the skills. Findings there go in the comment for the PM to carry.

## Sealed appendix: PM claims to verify independently

These are claims, not facts. Re-derive each one; report any that do not reproduce. The PR body's claims table holds the PM's runs.

| # | Claim (as the PM stated it) | Command the PM gave |
| --- | --- | --- |
| 1 | Three files change, in two commits by Claude | `git diff --name-only origin/main...HEAD`; `git log --format='%h %an' origin/main..HEAD` |
| 2 | No sensitive path | The scope line's `git diff --name-only … -- <sensitive paths>` |
| 3 | The spec quotes Beni's four rulings | The PR body's `grep -o -E … \| sort -u \| wc -l` row |
| 4 | Node's documentation gives "Stability: 1.2 - Release candidate" for `node:sqlite` on Node 24 and 26 | The stability line of `https://nodejs.org/docs/latest-v24.x/api/sqlite.html` and `latest-v26.x` |
| 5 | `node:sqlite` runs with nothing on stderr | The PR body's `node -e` row, on each Node the suite runs |
| 6 | A float ratio flags `0.7` to `0.98`, which is exactly `7/5` | `node -e 'console.log(0.98/0.7>1.4)'` |
| 7 | `@keel/core` and `@keel/plugin-mln` typecheck with `"types": []`, and no Node type package is installed | `grep -n '"types"' packages/*/tsconfig.json`; `ls node_modules/@types` |
| 8 | Copy lint reads no spec: only `packages/ui/src/copy`, `README.md` and `DISCLAIMER.md`, plus its iOS and schedule checks | `sed -n 127,134p tools/copy/lint.mjs`; `grep -n -E 'join\(root' tools/copy/lint.mjs` |
| 9 | `pnpm verify` exits 0 | `pnpm install --frozen-lockfile && pnpm verify` on Node 24.22.2 and 26.13.0 |
