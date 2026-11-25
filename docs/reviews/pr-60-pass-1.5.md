# Pass 1.5 brief: PR #60 (S04 closes import and observation store, spec)

Written by the PM on 2026-11-25 (America/New_York), after reading Codex's Pass 1 comment, [7173864015](https://github.com/BeniCheni/keel/pull/60#issuecomment-7173864015), at head `90cd7556809d4944170e009ccf95d6b38d02ba2f`, and Beni's rulings below. Like the Pass 0 brief, it lives in the PR, in the commit that fixes the spec (`git log --diff-filter=A -1 --format='%h %an' -- docs/reviews/pr-60-pass-1.5.md`). Codex receives it for the re-read.

Pass 1 gave the plan challenge, found 8 High and 5 Medium, and committed nothing (`gh pr view 60 --repo BeniCheni/keel --json headRefOid,commits` printed head `90cd755` and 2 commits before the PM's fix). Its seat record validates against Elenchus's `schema/seat-record-1.1.json`: the PM's ajv run printed `valid true`, and a bad control (verdict deleted, pass `"4"`, a status of `"maybe"`) exited 1. The PM reproduced all thirteen findings, accepts all thirteen, and fixed them in one Claude commit, the one that adds this brief. None is rework for a builder: the spec is the PM's.

## How this brief adjudicated

Every disposition rests on a run in this session, in a fresh clone of PR #60 at `90cd755` in the PM's scratch directory, or on reading the spec's lines at that head. The SQLite probes ran on Node 24.15.0, with umask `0o022`, on synthetic files under `$TMPDIR` only; Pass 1 ran its probes on 24.22.2 and 26.13.0, and the PM did not repeat them there. The probe scripts are kept with the PM's receipts outside the repo. No user data folder, no private list and no Pass 1 clone was opened.

| Probe | Result at Node 24.15.0 |
| --- | --- |
| `PRAGMA recursive_triggers` on a new connection | `0` |
| On a `STRICT` table with `BEFORE UPDATE` and `BEFORE DELETE` triggers: `UPDATE`, then `INSERT OR REPLACE` on the unique key | `UPDATE` refused with `append-only`; the replace allowed, and the row's value changed from `1` to `9` |
| The same replace with `recursive_triggers = ON` | refused with `append-only` |
| A `BEFORE INSERT` trigger that raises when a row with the new primary or unique key exists, with `recursive_triggers` `0` | `INSERT OR REPLACE` on the unique key, on the primary key and `REPLACE` all refused; a new row allowed; `INSERT OR IGNORE` of a duplicate refused, so the importer must `SELECT` first |
| A database path whose last component is a symbolic link to a file under a directory holding `.git` | the ancestor check found no `.git`; SQLite wrote 8192 bytes into the linked file |
| An existing `0o755` directory: the database set to `0o600` after WAL starts, then before | after: database `600`, `-wal` `644`, `-shm` `644`; before: `600 600 600` |
| A second connection, `busy_timeout` 50, while the first holds `BEGIN IMMEDIATE` | `BEGIN IMMEDIATE`: error 5, "database is locked"; a deferred `BEGIN` then a read: allowed; `BEGIN`, a read, then a write: error 5; `BEGIN` then a write: error 5 |
| `new TextDecoder("utf-8", { fatal: true })` on two byte-order marks and `A` | `feff 41`: the decoder strips one mark, so a parser that strips one more takes two |
| `JSON.stringify({ ratio: "1/2" }).includes("/")` | `true` |
| `node tools/tripwire/cli.mjs .` in a throwaway repository with the head's `allowlist.txt` and `vendors.txt` and an `origin/main`, holding a `.csv` whose first line is `Date,Open,High,Low,Close,Adj Close,Volume` | exit 1, one `price` hit at line 1. The same file with `# synthetic: true` as its first line: exit 0. The rule is `tools/tripwire/scan.mjs:303-308` |
| An empty database file created by `fs` at `0o600` before SQLite opens it, in an existing `0o755` directory, then WAL and one write | directory `755`, database `600`, `-wal` `600`, `-shm` `600` |
| Inside a first connection's transaction, a third connection with `busy_timeout` 0 tries `BEGIN IMMEDIATE` | after the first's `BEGIN IMMEDIATE`: error 5, "database is locked"; after its deferred `BEGIN`: succeeded |
| A copy of the workspace manifests and `pnpm-lock.yaml`, plus a `packages/store/package.json` with `@keel/core` and `@keel/plugin-mln` as `workspace:*` and `vitest` 5.0.5 | `CI=true pnpm install --frozen-lockfile --lockfile-only --offline` exits 1 with `ERR_PNPM_OUTDATED_LOCKFILE`; without the store manifest it exits 0 |
| `node -e 'const t=require("typescript"); console.log(typeof t.createSourceFile, t.version)'` in the clone | `undefined 7.0.2`: the workspace's TypeScript has no JavaScript API, so AC10's checker cannot use one |

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Fixed by |
| --- | --- | --- | --- | --- |
| F1 | High | accept | Reproduced by reading the tripwire's price rule, above. The walk files' header, as specified, makes `verify` red. | Fixtures: every file starts with the line `# synthetic: true`; a test helper, `payload(name)`, requires that line and strips it, so the parser never sees it. AC12 checks the marker on every file. |
| F2 | High | accept | Reproduced: `ERR_PNPM_OUTDATED_LOCKFILE`, above. | Scope: `pnpm-lock.yaml` gains the `packages/store` importer and nothing else. AC12 checks that the lockfile is unchanged from `packages:` onward. |
| F3 | High | accept | Reproduced: `true`, above. The honesty test as written cannot pass with a correct flag stored. | The honesty test exempts `observation_flags.detail` from the slash rule, and asserts that column's JSON shape on its own. |
| F4 | High | accept | Reproduced: the replace changed a stored row, above. | Schema 1: a third trigger, `BEFORE INSERT`, on every table; `recursive_triggers = ON` at open as well; the importer `SELECT`s for duplicates and writes only with a plain `INSERT`. The honesty test runs the raw replace through a second connection with `recursive_triggers` off. AC6 and the mutation floor add their cases. |
| F5 | High | accept | Reproduced: SQLite wrote through a linked file, above. | Opening: the `.git` check runs again on the real path of the deepest existing directory, and an existing store file that is a symbolic link, a hard link or not a regular file is `store-file-unsafe`. AC6 and the honesty test cover both. |
| F6 | High | accept | Reproduced: `600 644 644` against `600 600 600`, above. | Opening: on `darwin` and `linux`, a missing database file is created at `0o600` before SQLite opens it, and an existing store file with group or other bits is set to `0o600` first; an existing directory keeps its mode. AC6 tests an existing `0o755` directory and an existing `0o644` file. |
| F7 | High | accept | Reproduced by reading: Decision 5's `src/node.d.ts` must `declare module "node:sqlite"`, which AC10's "only `sqlite.ts` names `node:sqlite`" forbids, and the CSV header's `"Date"` string trips the `Date` rule. | AC10 checks loads, not names, and skips `.d.ts` files; its checker ignores comments and string, template and regular-expression literals, with stated controls. Decision 5 says a declaration file loads nothing. |
| F8 | High | accept | Reproduced: a deferred `BEGIN` gives the same error 5 as `BEGIN IMMEDIATE` once it writes, above, so AC7 cannot tell them apart. | `openStore`'s `afterBegin` test seam. In it, AC7's third connection tries `BEGIN IMMEDIATE` with `busy_timeout` 0, and must get a busy error, which only an immediate begin causes. |
| F9 | Medium | accept | Reproduced by reading `90cd755`'s lines 25, 117, 131 and 212: Decision 8 called every second value a conflict, the result type named only unequal fractions, and AC4's "one changed value gives `added` 1" holds only for a one-row file, since any other bytes are a new source. | Decision 8 now matches the result type. AC4 splits the one-row file from the edited copy, and adds the cross-source `95.1` and `95.10` case. |
| F10 | Medium | accept | Reproduced by reading lines 103 to 107 and 137: no rule picked `fromValue` among equal fractions, "the first new row" did not say whether skips count, and a repeat import's flags were not stated. | The split flag: `previous` is the row with the lowest `observations.id` on its date; the earliest accepted row sets the date; flags are stored only for rows an import adds, so a repeat stores and returns none. AC3 and AC4 test each. |
| F11 | Medium | accept | Reproduced: the default fatal decoder strips one mark, above, and reading rule 3 finds no reason for a header without `Date`. | The CSV format: `date-column-missing`; a total order of reasons within a line; `ignoreBOM: true` in the decoder; `bom-twice.csv`. AC2 tests the order and the second mark. |
| F12 | Medium | accept | Reproduced by reading line 142: `latestCloseDates` took no date, so a close dated after the evaluation could read as the newest. | `latestCloseDates(store, tickers, asOf)`, with `as-of-invalid`; the honesty test, AC5 and the mutation floor add it. |
| F13 | Medium | accept | Reproduced by reading line 117: two documents whose hashes share 16 hex digits got one source ID, with no outcome stated. | The source ID takes 48 hex digits, which fits S03's 64-character pattern for a 10-character ticker (4 + 48 + 1 + 10 = 63), and a stored source with that ID and another document is `source-id-collision`. AC4 tests it with a source row inserted first. |

Spec size after the fix: `git diff --shortstat 90cd755 HEAD -- docs/specs/s04-closes-store.md`. Tables keep their widths: the PM's column counter, run on the spec, this brief and `docs/README.md`, reports no bad row, and a planted three-row control with one bad row exits 1.

## Pass 1's answers to the Pass 0 questions, as the PM takes them up

- **Q1, scope.** Pass 1 found that no slice owns a command-line import, since S06 is the check command and the launchd sample. Beni's ruling 4 below places it in a later slice. The spec says so under "What S05 and S06 take from this", and it goes in the ideas file in the next ordinary docs PR.
- **Q7, `win32`.** Pass 1 notes that `node:path` treats UNC paths and drive paths written with `/` as absolute, and the spec's rule is narrower. That is deliberate. The spec now says so, and such a value is `data-dir-relative`.
- **Q10, AC9.** Pass 1 found the engine results differ only in 24 `sources` arrays. AC9 now names that field.
- **Q12, privacy.** Pass 1 notes that a valid base name can still hold a person's or a host's name as ordinary text. The store is in the user's data folder, never in the repo, so hard rule 1 is not touched; no change.
- **Beni's three questions.** Pass 1 found the hand-written declarations feasible with a narrow `process` declaration, confirmed idea 97 against the repo, and noted that `AGENTS.md` as written calls for the full passes. Beni has now answered all three; see below.

## Beni's rulings

All four were given on 2026-11-25 at 16:35 EST in the PM's session, which Codex cannot see.

1. **"Hand-written (Recommended)"**, to whether Decision 5 keeps hand-written Node declarations rather than add `@types/node`. Decision 5 quotes it, and now lists `node:path` and `process` as well.
2. **"Fix first (Recommended)"**, to whether idea 97's skill fix lands in its own sensitive-path PR before the S04 build starts. The spec's Dependencies section quotes it. The PM writes that PR after this one merges, before the build prompt.
3. **"Codex re-reads (Recommended)"**, to the review depth of this spec PR: Codex re-reads each fix commit until one finds it mergeable, with no Pass 2 or Pass 2.5. This applies Beni's R1 docs tier, which `AGENTS.md` does not yet hold, so for this PR the seats table is stale on depth.
4. **"Later slice (Recommended)"**, to where a command-line import goes: not S06, but a later slice that Beni numbers.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `26d149d`, the spec and its index row | Claude | Codex, Pass 1 |
| `90cd755`, the Pass 0 brief and one spec correction | Claude | Codex, Pass 1 |
| The commit that adds this brief and fixes F1 to F13 (the command in the opening paragraph) | Claude | Codex, the re-read |

## What the re-read does

Under ruling 3, Codex gives the cold read of the fix commit: for each of F1 to F13, whether the fix closes it, and anything new the fix introduces. A finding the re-read raises goes back to the PM for one more fix commit and one more re-read, until a re-read finds the PR mergeable. Then Beni merges, in shadow mode.

## Sealed appendix for the re-read

These are claims, not facts. Re-derive each one, and report any that do not reproduce.

| # | Claim | Command the PM gave |
| --- | --- | --- |
| 1 | The fix commit is Claude's, and changes only the spec, this brief and the spec's index row | `git log --format='%h %an' origin/main..HEAD`; `git diff --name-only 90cd755 HEAD` |
| 2 | Still no sensitive path | `git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers apps` prints nothing |
| 3 | A `BEFORE INSERT` trigger refuses `INSERT OR REPLACE` on any connection, whatever its `recursive_triggers` | A `node:sqlite` probe: the trigger as Schema 1 states it, the replace on the primary and on a unique key, with the pragma `0` |
| 4 | Creating the database at `0o600` before SQLite opens it gives the `-wal` and `-shm` files `0o600` in an existing `0o755` directory | A probe under umask `0o022` |
| 5 | In `afterBegin`, a third connection's `BEGIN IMMEDIATE` with `busy_timeout` 0 fails busy after `BEGIN IMMEDIATE`, and succeeds after a deferred `BEGIN` | A probe of the two begins |
| 6 | A fixture whose first line is `# synthetic: true` passes the tripwire's price rule with a `Close` header on line 2 | `node tools/tripwire/cli.mjs .` in a throwaway repository that has an `origin/main` |
| 7 | 48 hex digits, `csv-`, `-` and a 10-character ticker fit S03's source pattern | `node -e 'console.log(/^[a-z0-9][a-z0-9-]{0,63}$/.test("csv-"+"a".repeat(48)+"-abcdefghij"))'` |
| 8 | Each mutant the floor adds is killable by a criterion the spec states | Reading the mutation floor against AC2 to AC7 and AC10 |
| 9 | `pnpm verify` exits 0 | `pnpm install --frozen-lockfile && pnpm verify` on Node 24.22.2 and 26.13.0 |
