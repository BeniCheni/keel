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

## After the re-read

Codex's re-read, [7175969685](https://github.com/BeniCheni/keel/pull/60#issuecomment-7175969685), read `89ea8dee2f16a9a5780dbf9af117aef4463b9858`, ran in a GPT-6.2 Sol sub-agent whose effort was not reported, and committed nothing. Its verdict is "not mergeable": F1 to F13 are fixed, and it raises F14 to F23, 2 High and 8 Medium (`gh api repos/BeniCheni/keel/issues/comments/7175969685 --jq .body | grep -c -E '^- \*\*F(1[4-9]|2[0-3]) (High|Medium) · open'` prints `10`). Sealed claim 8 failed, under F14. The PM reproduced all ten, accepts all ten, and fixes them in one more Claude commit, the one that adds this section. Under ruling 3, Codex re-reads that commit next.

The probes ran on Node 24.15.0 (SQLite 3.51.3), under umask `0o022`, on synthetic files under `$TMPDIR` only.

| Probe | Result |
| --- | --- |
| An importer that `SELECT`s for each row before writing, against Schema 1's insert trigger, with a plain `INSERT` and then with `INSERT OR REPLACE`, run twice each | the same rows and ids, and on the repeat `added` 0 and `duplicates` 2, for both verbs: the mutant is equivalent in behaviour |
| The same importer without the `SELECT`, on the repeat | refused with `append-only`, so dropping the `SELECT` is killable |
| A `0o600` database with existing empty `0o644` `-wal` and `-shm` files, opened and written with only the database narrowed | `600 600 600`, on the same inodes; with the modes reversed, `644 644 644`. SQLite gives side files the database's mode when it opens them |
| A `-wal` or `-shm` file that is a symbolic link, then an open and a write | `unable to open database file` for each |
| `node --check` and `node` on a file holding only `import "node:sqlite";` | exit 0 for each: a side-effect import loads the module |
| `require("node:path").win32.isAbsolute` on `/tmp/kd`, `\\server\share\kd` and `C:/kd` | `true true true` |
| `new TextDecoder("utf-8", { fatal: true })` on two byte-order marks and `A`; then with `ignoreBOM: true` | `feff 41`; `feff feff 41` |
| A copy of the head's `pnpm-lock.yaml` with a `packages/store` importer added; then also a setting added above `importers:`; then also a dependency added to `packages/core`'s importer | AC12's old check, the tail from `packages:` onward, exits 0 on all three. The new check, the whole file with the store importer's block and its blank line removed, exits 0, 1 and 1 |
| AC10's statement search, case-insensitive, on `"INSERT OR REPLACE INTO o"`, `"replace into o"`, an `or` and `ignore` split by a newline, `"on conflict do nothing"`, `ticker.replaceAll(".", "-")` and `SELECT RAISE(ABORT, 'append-only')` | fail, fail, fail, fail, pass, pass |

| Re-read # | Severity | PM disposition | Reason | Fixed by |
| --- | --- | --- | --- | --- |
| F14 | High | accept | Reproduced: the two verbs behave alike, above, so a required mutant could not be killed by behaviour. | AC10 searches the store's source for `OR REPLACE`, `REPLACE INTO`, `OR IGNORE` and `ON CONFLICT`, with controls, which kills that mutant. The floor adds dropping the `SELECT`, which AC4's repeat import kills. |
| F15 | Medium | accept | Reproduced by reading AC6 and the honesty test: no case put a link or a non-regular file at a side file's path, or an existing side file at `0o644`. | AC6: `store-file-unsafe` for a linked `-wal`, a hard-linked `-shm` and a directory at the database's or the `-wal`'s path; existing `0o644` side files are `0o600` after the open. The floor adds checking only the database file and accepting a non-regular file. SQLite already gives side files the database's mode, above, so skipping the store's narrowing of them is equivalent on this SQLite and the floor does not require it; AC6 pins the outcome. |
| F16 | High | accept | Reproduced: a side-effect import loads `node:sqlite`, above, and AC10 did not list that form. | AC10 lists the side-effect `import "…"` form and adds `import "node:sqlite"` in a second file as a control that must fail. |
| F17 | Medium | accept | Reproduced: `node:path` calls all three values absolute, above, and AC1 had no `win32` case for them. | AC1 adds `C:\kd`, `\\server\share\kd`, `C:/kd` and `/tmp/kd` on `win32`. The floor adds `node:path`'s `win32.isAbsolute`. |
| F18 | Medium | accept | Reproduced: the old check passed a settings edit and another importer's edit, above. | AC12 compares the whole lockfile with the store importer's block removed. |
| F19 | Medium | accept | Reproduced by reading the split flag's last sentence: "recomputes none" has no observable effect. | The clause is removed. A repeat import stores and returns no flag, which AC4 tests. |
| F20 | Medium | accept | Reproduced by reading the result type against the sentence after it: a date of the file that already held differing values is listed too, so "only the changed date can be a conflict" was wrong. | The sentence says when only the changed date is a conflict, and that an earlier conflict on a date of the file is listed. AC4 adds that case. |
| F21 | Medium | accept | Reproduced: the decoders differ, above, and AC2 decodes in the test, so the importer's decoder was untested on two marks. | AC4 imports the raw payloads of `bom-twice.csv` and `bom-crlf.csv`. AC2 decodes with the importer's options. |
| F22 | Medium | accept | Reproduced by reading AC7: a second call of the hook would still see the lock. | AC7 asserts the import calls `afterBegin` exactly once. The floor adds calling it twice. |
| F23 | Medium | accept | Reproduced by reading AC3 and the honesty test: the stored `detail` was checked for shape only. | AC3 checks the stored `detail` against the result's flag for `split-boundary.csv` (`3/2`) and two split files. The fixture's first close is exactly 1.5 times the walk's last close. The floor adds a stored `detail` that differs. |

**Sealed claim 8.** It does not hold at `89ea8de`, as the re-read found: the plain-insert mutant could not be killed by behaviour. At the new head, each mutant the floor names has a killing criterion, and the one mutant found equivalent on SQLite 3.51.3, skipping the store's own narrowing of side files, is named here and left out of the floor.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| The commit that adds this section and fixes F14 to F23 (`git log -1 --format='%h %an' -- docs/reviews/pr-60-pass-1.5.md`) | Claude | Codex, the second re-read |

### Sealed appendix for the second re-read

These are claims, not facts. Re-derive each one, and report any that do not reproduce.

| # | Claim | Command the PM gave |
| --- | --- | --- |
| 1 | The new commit is Claude's, and changes only the spec, this brief and the spec's index row | `git log --format='%h %an' origin/main..HEAD`; `git diff --name-only 89ea8de HEAD` |
| 2 | Still no sensitive path | the same command as claim 2 above, which prints nothing |
| 3 | With a `SELECT` before each write, `INSERT` and `INSERT OR REPLACE` store the same rows under Schema 1's triggers, and without the `SELECT` a repeat import fails with `append-only` | a `node:sqlite` probe |
| 4 | SQLite gives existing `-wal` and `-shm` files the database's mode when it opens them, and refuses a linked one | a probe under umask `0o022` |
| 5 | AC12's new check passes a lockfile that gains only the store importer, and fails one that also edits a setting or another importer | AC12's command on three lockfile copies |
| 6 | AC10's statement search fails each of its four phrases and passes `ticker.replaceAll(".", "-")` | the controls AC10 lists |
| 7 | Each mutant the floor names has a criterion that kills it | reading the mutation floor against AC1 to AC7 and AC10 |
| 8 | `pnpm verify` exits 0 | `pnpm install --frozen-lockfile && pnpm verify` on Node 24.22.2 and 26.13.0 |

## After the second re-read

Codex's second re-read, [7179716670](https://github.com/BeniCheni/keel/pull/60#issuecomment-7179716670), read `91c87d286a86bcae7fa012d9df71b5f8038b924a`, ran in a GPT-6.2 Sol sub-agent whose effort was not reported, and committed nothing. Its verdict is "not mergeable": F14 to F23 are fixed, and it raises F24 to F32, 3 High and 6 Medium (`gh api repos/BeniCheni/keel/issues/comments/7179716670 --jq .body | grep -c -E '^- \*\*F(2[4-9]|3[0-2]) (High|Medium) · open'` prints `9`). The PM reproduced all nine, accepts all nine, found one more defect itself (PM1), and fixes all ten in one more Claude commit, the one that adds this section. Under ruling 3, Codex re-reads that commit next.

Two statements in the section above were wrong, and this section corrects them. "SQLite refuses a linked one" holds for a symbolic link only: Codex found that SQLite accepts a hard-linked side file, which the store's own `lstat` check refuses. And skipping the store's narrowing of side files is not equivalent: it is equivalent only while no other connection holds them open (F24).

The probes ran on Node 24.15.0 (SQLite 3.51.3) on Darwin, under umask `0o022`, on synthetic files under `$TMPDIR` only.

| Probe | Result |
| --- | --- |
| A first connection holding a `0o644` database open in WAL mode after a write, then the database set to `0o600`, and a second connection opening, reading and writing it; then the same with the side files also set to `0o600` | database, `-wal`, `-shm`: `600 644 644`; then `600 600 600` |
| `INSERT OR/**/REPLACE`, `INSERT OR -- c` with a line break before `REPLACE`, and `"INSERT OR " + "REPLACE"`, each on a stored unique key | each ran: one row, its `id` now `2` |
| `UNIQUE ON CONFLICT REPLACE` on a column, then two plain `INSERT`s of one key | the second replaced the first; `sqlite_master` holds the clause |
| A small tokenizer that drops `--` and `/* */` comments, keeps quoted text whole and reads words without case, on AC4's seven controls | the five that must fail fail; the two that must pass pass |
| An ancestor check for `.git` without `realpath`, on a link to a directory holding `.git` and on a link to its subdirectory | link to the directory: found; link to the subdirectory: not found, and found through `realpath` |
| A copy of the workspace's manifests and lockfile, with a `packages/store/package.json` whose `dependencies` hold `@keel/core` and whose `devDependencies` hold `@keel/plugin-mln` and `vitest` 5.0.5, then `CI=true pnpm install --no-frozen-lockfile --lockfile-only --offline` and the same with `--frozen-lockfile` | exit 0, then exit 0; the store importer is the block Scope now prints, and the rest of the file equals the head's |
| AC12's new commands on that lockfile and manifest; then on the unchanged lockfile; then with a dependency added inside the store block | dependency fields as printed, one importer, the block byte for byte and the rest equal; the unchanged file has no importer (`grep -c` prints `0`); the added dependency fails the block comparison |

| Re-read # | Severity | PM disposition | Reason | Fixed by |
| --- | --- | --- | --- | --- |
| F24 | High | accept | Reproduced: held-open side files stayed at `644`, above. | AC6 adds a second connection holding `0o644` side files open, after which `openStore` and an import leave all three files at `0o600`. The floor adds narrowing only the database file. |
| F25 | High | accept | Reproduced: comment-separated and concatenated verbs ran, above, and a column's conflict clause turns a plain `INSERT` into a replace. A search of source text cannot see the SQL a program builds. | `openStore`'s `onSql` test seam: `sqlite.ts` passes it every statement it runs. AC4 tokenizes each, with comments dropped, and refuses the words `REPLACE`, `IGNORE` and `CONFLICT` and any `INSERT` not followed by `INTO`, with seven controls. AC10's text search is removed. |
| F26 | Medium | accept | Reproduced: AC12 passed an unchanged lockfile and an added dependency inside the store block, above. | Scope prints the importer block that pnpm writes and the manifest's dependency fields. AC12 requires one importer, that block byte for byte, the rest equal to `origin/main`'s, and the manifest's fields exactly. |
| F27 | Medium | accept | Reproduced by reading the sentence after the result type against Decision 8: `95.1` changed to `95.10` changes the bytes and makes no conflict. | The sentence and AC4's edited copy say the changed Close differs as an exact fraction. |
| F28 | Medium | accept | Reproduced by reading Fixtures: the walk had no start and no ceiling, so 1.5 times its last close could leave S03's grammar. | The walk starts at `100.00` and is held between `1.00` and `10000.00`, so `split-boundary.csv`'s first close is at most `15000.000`. |
| F29 | High | accept | Reproduced: a link to the directory holding `.git` is caught without `realpath`, above, so the control could not tell the two checks apart. | The honesty test and AC6 use a link to a subdirectory of the directory holding `.git`. |
| F30 | Medium | accept | Reproduced by reading Fixtures: a reject file whose only data line is the defective one cannot catch a partial store. | Each reject file for a data-line reason has at least two valid lines before the defect, and the honesty test says so. The floor names the mutant. |
| F31 | Medium | accept | Reproduced by reading AC3: with no stored close between the skipped and the accepted dates, both rules give the same `previous`. | AC3 fixes the dates: closes stored on `2026-03-02` and `2026-03-04`, `2026-03-03` skipped, `2026-03-05` accepted, `previous` from `2026-03-04`. |
| F32 | Medium | accept | Reproduced by reading Decision 8 and the import rules: a new document always has a new source, so rows can repeat only in a repeat of the same bytes, and a lookup by hash finds that first. Dropping the row lookup alone is then equivalent. | Schema 1 names the lookup by hash. The floor's mutant is a repeat import that reaches an insert, by dropping whichever lookup finds the stored rows. |
| PM1 | Medium | the PM's own | Reproduced by reading Scope against Decision 4: Scope listed `@keel/core` among development dependencies, though the package's source imports it, and pnpm writes it under `dependencies`, above. | Scope gives the exact dependency fields, which AC12 checks. |

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| The commit that adds this section and fixes F24 to F32 and PM1 (`git log -1 --format='%h %an' -- docs/reviews/pr-60-pass-1.5.md`) | Claude | Codex, the third re-read |

### Sealed appendix for the third re-read

These are claims, not facts. Re-derive each one, and report any that do not reproduce.

| # | Claim | Command the PM gave |
| --- | --- | --- |
| 1 | The new commit is Claude's, and changes only the spec, this brief and the spec's index row | `git log --format='%h %an' origin/main..HEAD`; `git diff --name-only 91c87d2 HEAD` |
| 2 | Still no sensitive path | the first appendix's claim 2 command, which prints nothing |
| 3 | Side files held open by another connection keep `0o644` unless the store narrows them | a probe under umask `0o022` |
| 4 | AC4's tokenizer, as specified, fails its five controls and passes its two | a tokenizer written to the criterion's words |
| 5 | Scope's importer block is what pnpm writes for Scope's manifest, and AC12's commands pass it and fail the two controls above | the workspace probe above |
| 6 | A link to a subdirectory of a directory holding `.git` defeats an ancestor check without `realpath` | a probe |
| 7 | Each mutant the floor names has a criterion that kills it, and none is equivalent | reading the mutation floor against AC1 to AC7, AC10 and the honesty tests |
| 8 | `pnpm verify` exits 0 | `pnpm install --frozen-lockfile && pnpm verify` on Node 24.22.2 and 26.13.0 |
