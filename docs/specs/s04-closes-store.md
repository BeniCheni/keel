# S04: Closes import and observation store

- Status: drafted 2026-11-24 by the PM (Claude), on Beni's rulings of 2026-11-24, recorded under Decisions: "Three slices (Recommended)", "S04, S05, S06 (Recommended)", "node:sqlite (Recommended)" and, for story 2.3, "Later slice (Recommended)".
- Release: non-release slice toward `v0.1.0`. Starts only after this spec merges.
- Builder: Codex, GPT-6.2 Sol High, in one draft PR on branch `s04/closes-store`.
- Sensitive paths the build touches: none, if it keeps to Scope (Decision 9). This spec PR touches none.
- Design rung: none (no UI).
- Stories served: 2.1, importing daily closes from CSV with a split flag and the source and import time per row. S05's A8 (story 6.4) and every later reader of closes take this slice's read functions.

## Goal

keel can take a CSV file of daily closes for one underlying and keep every close it accepts, with its source and import time, in one SQLite file outside the repo. It reads the Close column and never Adj Close. It keeps conflicting values side by side, never overwrites or deletes a stored close, and stores nothing from a file it rejects. It flags a move of more than 40% between consecutive closes as a possible split and changes no value. It hands the engine exactly the closes it holds, in S03's `Close` shape.

## Decisions

Each of these is open to the plan challenge, except where a ruling of Beni's settles it.

1. **Three slices.** By Beni's ruling "Three slices (Recommended)", the proposal's Day 4 is cut in three: S04 is this slice; S05 is the pure alert evaluator for A1, A3, A4, A8, A9 and A10 in `packages/core`; S06 is the check command and the sample launchd job. By "S04, S05, S06 (Recommended)" each takes a top-level number.
2. **Manual marks wait.** By Beni's ruling "Later slice (Recommended)", story 2.3 (marks), ratings and observation overrides are not in this slice, and neither is the `marks` table.
3. **Node's built-in SQLite.** By Beni's ruling "node:sqlite (Recommended)", the store uses `node:sqlite`, so the slice adds no dependency. When Beni ruled, its documentation for Node 24 and Node 26 gave "Stability: 1.2 - Release candidate", so its API may still change. One file, `src/sqlite.ts`, holds every use of it, and a test keeps every other file from importing it (AC10).
4. **A new package, `@keel/store`, outside core.** ADR-0002 keeps `packages/core` free of I/O, and this slice reads bytes, writes a file and keeps time. Its source may import `@keel/core` and nothing else in the workspace; its parity test (AC9) also imports `@keel/plugin-mln`, as a development dependency. Its parsing, split and location functions do no I/O and take everything as arguments.
5. **Hand-written Node declarations, not `@types/node`.** The workspace typechecks with `"types": []` and has no Node type package. Adding `@types/node` would be a new dependency under hard rule 8. Instead, `src/node.d.ts` declares only the members of `node:sqlite`, `node:fs`, `node:os`, `node:crypto` and `node:child_process` that the package and its tests use, plus `TextDecoder`. The plan challenge may argue for `@types/node`; that needs Beni's word.
6. **The importer takes bytes, not a path.** `importCloses` receives the file's bytes and its base name. It never sees a directory, so it cannot store one, and a name holding `/` or `\` is rejected. This slice has no command-line entry point; S06 adds the first.
7. **All or nothing.** A file with any rejected line stores nothing, and the result lists every reason, not only the first. An empty or `null` close is not an error: the line is skipped and counted, and nothing is stored for that date. A missing close stays missing; it is never stored as zero or carried from another day.
8. **Append-only, side by side.** Triggers refuse every `UPDATE` and `DELETE` on the slice's tables. A close equal in text to a stored row from the same source is a duplicate and is counted, not stored. Any other close for a stored date is stored next to it, and the result names the date as a conflict. Nothing picks a winner (hard rule 6).
9. **No sensitive path.** The slice lives in `packages/store`, a fixture generator under `tools/generators/closes`, its registry entry, its input files under `fixtures/synthetic/closes`, and the verify steps in `tools/verify/steps.mjs`. Its expected values are frozen in this spec and asserted in tests, so it writes nothing under `fixtures/**/expected/**` or `fixtures/golden/**`. If the build finds it must touch a sensitive path, it stops and the PM escalates.
10. **Locking.** ADR-0004's argument against is concurrent writes from the app and the check command. The store opens in WAL mode with a busy timeout, and an import runs in one `BEGIN IMMEDIATE` transaction. A second writer that cannot take the lock within the timeout gets `store-busy` and stores nothing.

## Scope

All new code lives in `packages/store/` (`@keel/store`, `"exports": { ".": "./src/index.ts" }`), `tools/generators/closes/` and `fixtures/synthetic/closes/`. `tools/fixtures/registry.mjs` gains the closes generator, and `tools/verify/steps.mjs` gains `packages/store` in its `typecheck` and `tests` steps. `packages/store/vitest.config.mjs` loads `tools/network/guard-setup.mjs`, as the other packages' configs do. No change to `packages/core`, `packages/plugin-mln`, `schemas` or any other existing fixture.

### Files

| File | Holds | I/O |
| --- | --- | --- |
| `src/location.ts` | `storePath` | none |
| `src/csv.ts` | `parseClosesCsv` | none |
| `src/split.ts` | `splitFlags` and the exact-fraction helpers | none |
| `src/sqlite.ts` | every use of `node:sqlite` | the database file |
| `src/store.ts` | `openStore`, `importCloses`, `closesFor`, `latestCloseDates`, `closeStore` | file system, through `sqlite.ts` and `node:fs` |
| `src/node.d.ts` | the declarations of Decision 5 | none |
| `src/index.ts` | the public exports | none |

### Where the store lives

`storePath({ env, platform, home })` returns `{ kind: "path", dir, file }` or `{ kind: "error", code }`. It reads only its argument, never `process.env`. `file` is `dir` joined with `keel.sqlite`, by `/` on `darwin` and `linux` and by `\` on `win32`.

| Input | Result |
| --- | --- |
| `env.KEEL_DATA_DIR` defined and absolute | `dir` is that value, unchanged |
| `env.KEEL_DATA_DIR` defined and empty | error `data-dir-empty`; never a fall back to the default |
| `env.KEEL_DATA_DIR` defined and relative | error `data-dir-relative` |
| `darwin`, no `KEEL_DATA_DIR` | `<home>/Library/Application Support/keel` |
| `linux`, no `KEEL_DATA_DIR`, `XDG_DATA_HOME` absolute | `<XDG_DATA_HOME>/keel` |
| `linux`, no `KEEL_DATA_DIR`, `XDG_DATA_HOME` absent, empty or relative | `<home>/.local/share/keel` |
| `win32`, no `KEEL_DATA_DIR`, `APPDATA` absolute | `<APPDATA>\keel` |
| `win32`, no `KEEL_DATA_DIR`, `APPDATA` absent, empty or relative | error `app-data-unset` |
| any other platform | error `platform-unsupported` |
| `home` needed and empty or relative | error `home-invalid` |

Absolute means starting with `/` on `darwin` and `linux`, and with a drive letter, `:` and `\` on `win32`. From this slice on, `KEEL_DATA_DIR` decides where real data goes, so an empty value is an error and never means "use the default".

### Opening the store

`openStore(file, options?)` returns `{ kind: "open", store }` or `{ kind: "error", code }`. `options.busyTimeoutMs` defaults to 5000.

1. **Not inside a repository.** If the file's directory, or any directory above it, holds an entry named `.git`, the result is `store-in-repository` and nothing is created. This guards hard rule 1 in a development clone. It also refuses a home folder kept in Git; that cost is accepted, and the fix is a `KEEL_DATA_DIR` outside it.
2. **Folder and file modes.** A missing directory is created, with its missing parents, at mode `0o700`. On `darwin` and `linux` the database file is set to mode `0o600` after it is created. The `-wal` and `-shm` files SQLite writes beside it rely on the folder's mode.
3. **Pragmas.** `journal_mode = WAL`, `foreign_keys = ON` and `busy_timeout` from the option.
4. **Schema version.** `PRAGMA user_version` 0 creates schema 1 in one transaction and sets it to 1. Version 1 changes nothing. Any higher version closes the database and returns `store-newer`. Nothing migrates downward.

### Schema 1

Every table is `STRICT`, and every table has `BEFORE UPDATE` and `BEFORE DELETE` triggers that raise `append-only`.

| Table | Columns |
| --- | --- |
| `documents` | `id` INTEGER PRIMARY KEY; `kind` TEXT, only `csv-closes`; `file_name` TEXT; `sha256` TEXT, 64 lowercase hex, UNIQUE; `redacted` INTEGER, always 0 here |
| `sources` | `id` TEXT PRIMARY KEY; `kind` TEXT, only `csv-closes`; `document_id` INTEGER REFERENCES `documents`; `series_key` TEXT; `page` INTEGER, NULL; `url` TEXT, NULL; `retrieved_at` TEXT |
| `observations` | `id` INTEGER PRIMARY KEY; `series_key` TEXT; `as_of_date` TEXT; `value` TEXT; `source_id` TEXT REFERENCES `sources`; `provenance` TEXT, only `imported-csv`; `imported_at` TEXT; UNIQUE (`series_key`, `as_of_date`, `value`, `source_id`) |
| `observation_flags` | `observation_id` INTEGER REFERENCES `observations`; `code` TEXT, only `possible-split`; `detail` TEXT, JSON; PRIMARY KEY (`observation_id`, `code`) |

These follow the proposal's Section 11 data model. `sources.series_key` is added so that one CSV file belongs to one series. `observation_flags` is added so that a flag never edits the row it describes. A value is stored as the exact text the file gave, never as a number.

### The CSV format

`parseClosesCsv(text)` returns `{ kind: "parsed", rows, skipped }` or `{ kind: "rejected", reasons }`. Each reason is `{ code, line }`, where `line` is 1-based, or `null` for the file as a whole. `rows` is `{ line, date, value }[]` in ascending date order. `skipped` is `{ line, code }[]` in line order.

1. One leading U+FEFF is removed. Lines split on `\n`, and one `\r` at a line's end is removed. A blank line is skipped as `line-blank`, except the one after a final newline, which is not counted.
2. Any `"` in the file rejects it with `quoted-field` at each line that has one.
3. The first non-blank line is the header, split on `,` with no trimming. It needs exactly one cell `Date` and exactly one cell `Close`. With no `Close` the reason is `close-column-missing`, whether or not `Adj Close` is there; a header cell repeated is `header-duplicate`. The `Adj Close` column is never read.
4. A data line with a different cell count from the header is `row-width`.
5. A date is `YYYY-MM-DD` and a real Gregorian date, or it is `date-invalid`. The store has its own check; it imports none from core.
6. A close cell that is exactly empty or exactly `null` skips the line as `close-empty` or `close-null`. Any other close matches `^(0|[1-9][0-9]{0,9})(\.[0-9]{1,6})?$`, S03's grammar, and is greater than zero, or it is `close-invalid`.
7. A date on two data lines is `date-duplicate` at the second, whatever the values.
8. No data row left after the skips is `no-rows`.

Rows may come in any order; the result sorts them. Reasons are listed in line order, with file-wide reasons first.

### The split flag

`splitFlags(rows, previous)` takes the parsed rows and `previous`, the stored close just before the first new row (see below), and returns `{ date, from, fromValue, ratio }[]`. For each pair of consecutive closes, in date order, with `previous` first when it is given, it computes `r = later ÷ earlier` as an exact fraction. It flags the later close when `r > 7/5` or `r < 3/5`, so a move of exactly 40% either way is not flagged. A gap in days between the two closes does not change this. `ratio` is the reduced fraction `"p/q"`. No float is used.

`previous` is the stored close for the series on the latest date before the file's first date, when that date holds exactly one distinct value (by exact fraction) across all sources. Otherwise there is none, and the import result says why: `no-earlier-close` or `earlier-close-conflict`. Pairs that a back-filled import creates with stored closes after its dates are not checked; that is a non-goal.

A flag is stored in `observation_flags` with its detail as JSON, and it changes no value and blocks no row.

### Importing

`importCloses(store, { ticker, fileName, bytes, now })`:

- `ticker` matches the schema's `^[A-Z][A-Z0-9.]{0,9}$`, or `ticker-invalid`. The series key is `close:<ticker>`.
- `fileName` is 1 to 255 characters, with no `/`, `\` or control character, or `file-name-invalid`.
- `bytes` is at most 5,000,000 bytes, or `file-too-large`, and valid UTF-8 by a fatal decoder, or `encoding-invalid`.
- `now` is `YYYY-MM-DDTHH:MM:SS.sssZ` and a real instant, or `now-invalid`. It is the only clock the store reads, and it fills `imported_at` and `retrieved_at`.
- The document is identified by the SHA-256 of `bytes`. Its source ID is `csv-`, the first 16 hex digits of that hash, `-`, and the ticker in lower case with `.` written `-`; it matches S03's `^[a-z0-9][a-z0-9-]{0,63}$`. A document already stored under another series is `document-other-series`.
- Everything runs in one `BEGIN IMMEDIATE` transaction. A lock not taken within the busy timeout is `store-busy`. Any failure rolls back, and nothing is stored.

It returns `{ kind: "rejected", reasons }`, `{ kind: "error", code }` or:

```ts
{
  kind: "imported";
  sourceId: string;
  sha256: string;
  rows: number;        // data rows accepted by the parser
  added: number;       // rows stored
  duplicates: number;  // rows equal to a stored row from the same source
  skipped: { line: number; code: "line-blank" | "close-empty" | "close-null" }[];
  conflicts: { date: string; values: string[] }[]; // dates of this file that now hold two or more distinct values for the series, values in stored order
  flags: { date: string; from: string; fromValue: string; ratio: string }[];
  previous: { date: string; value: string } | { reason: "no-earlier-close" | "earlier-close-conflict" };
}
```

Importing the same bytes for the same ticker again adds nothing: `added` is 0 and `duplicates` equals `rows`.

### Reading

- `closesFor(store, tickers, asOf)` returns every stored close for those tickers dated on or before `asOf`, as S03's `Close` (`{ ticker, date, value, source }`), ordered by the tickers' input order, then date, then source ID, then value. It returns conflicting closes as they are and never fills a missing date. An invalid `asOf` is `{ kind: "error", code: "as-of-invalid" }`.
- `latestCloseDates(store, tickers)` returns `{ ticker, date }[]`, with `date` `null` when the series has no close. S05's A8 reads it.
- `closeStore(store)` closes the database.

## Frozen values

### Location

The table under "Where the store lives", with these exact cases in `location.test.ts`: `{ KEEL_DATA_DIR: "/tmp/kd" }` on each platform gives `/tmp/kd/keel.sqlite` on `darwin` and `linux`; `{ KEEL_DATA_DIR: "" }` gives `data-dir-empty`; `{ KEEL_DATA_DIR: "kd" }` gives `data-dir-relative`; `darwin` with home `/Users/u` gives `/Users/u/Library/Application Support/keel/keel.sqlite`; `linux` with home `/home/u` and `XDG_DATA_HOME` `/x` gives `/x/keel/keel.sqlite`, with it empty gives `/home/u/.local/share/keel/keel.sqlite`; `win32` with `APPDATA` `C:\Users\u\AppData\Roaming` gives `C:\Users\u\AppData\Roaming\keel\keel.sqlite`, and with none gives `app-data-unset`; `freebsd` gives `platform-unsupported`; `darwin` with home `""` gives `home-invalid`.

### Split boundaries

| Earlier | Later | `r` | Flagged |
| --- | --- | --- | --- |
| `100` | `140` | `7/5` | no |
| `100` | `140.000001` | above `7/5` | yes |
| `0.7` | `0.98` | `7/5` | no; a float ratio reads it as above |
| `100` | `60` | `3/5` | no |
| `100` | `59.999999` | below `3/5` | yes |
| `100.00` | `50.00` | `1/2` | yes |
| `50` | `100` | `2/1` | yes |
| `95.1` | `95.10` | `1/1` | no |

### Dates

`2026-02-29`, `2100-02-29`, `2026-13-01`, `2026-04-31` and `2026-4-01` are `date-invalid`; `2028-02-29` and `2000-02-29` are valid.

## Fixtures

A generator `closes`, version 1, seed `keel-s04-closes-1`, owns `fixtures/synthetic/closes`, and `pnpm fixtures:regen` writes it byte-identically on every run and OS. Every file is generated; none is typed by hand.

- **Walks.** `walk-alfa.csv`, `walk-brvo.csv`, `walk-chrl.csv` and `walk-dlta.csv`: every open day from 2026-01-02 to 2027-12-31 by `nyseRulesCalendar()` and `scheduleDateFlags` from `@keel/core`, a seeded walk with daily moves within ±3%, closes rounded half-up to 2 decimals and never below 1. The header is `Date,Open,High,Low,Close,Adj Close,Volume`; Open, High and Low equal Close, and Adj Close is Close × 0.98 rounded half-up, so a reader of the wrong column fails the tests.
- **Splits.** One file per row of the split table, as two consecutive closes, plus `split-boundary.csv`, whose first close is 1.5 times the last close of `walk-alfa.csv`, for the `previous` rule.
- **Rejects.** One file per rejection reason in the CSV format, each with that one defect.
- **Skips and shapes.** `skip-null.csv` (empty and `null` closes and a blank line), `bom-crlf.csv` (a byte-order mark and CRLF endings), `descending.csv` (dates newest first) and `adj-close-only.csv`.

Tickers are the synthetic `ALFA`, `BRVO`, `CHRL` and `DLTA` used by the terms fixtures.

## Honesty tests (`store.honesty.test.ts`)

- The Close column is the only one read: for each walk file, every stored value equals that line's Close and none equals its Adj Close.
- A file with any rejected line stores nothing: the row counts of all four tables are equal before and after, for every reject file.
- A missing close is never stored: for `skip-null.csv`, no row exists for a skipped date, and no stored value is `0`, empty or `null`.
- A stored close is never changed or removed: after importing a conflicting file, the earlier rows are byte-equal to before, and a raw `UPDATE` or `DELETE` on each table fails with `append-only`.
- A conflict is kept side by side: both values come back from `closesFor`, in the stated order, and the result names the date.
- A split flag changes no value: a flagged row's value equals the file's text, and the row is stored.
- No directory is stored: a `fileName` holding `/` or `\` is rejected, and no column of any table holds a `/` or `\` after the suite's imports.
- `closesFor` never returns a close dated after `asOf`, and never returns a date the store does not hold.
- `storePath` reads only its argument: with `process.env.KEEL_DATA_DIR` set to a sentinel during the call, a call with `env: {}` on `darwin` returns the default path, not the sentinel.
- An empty `KEEL_DATA_DIR` is never the default location: `{ KEEL_DATA_DIR: "" }` gives `data-dir-empty` on every platform.
- A store is never opened inside a repository: `openStore` on a path under a directory holding `.git` returns `store-in-repository` and creates no file.

Each honesty test fails when its guarded behaviour is broken; the PR body names, per mutant, the test that kills it.

## What S05 and S06 take from this

S05 reads closes through `closesFor` and stale-data dates through `latestCloseDates`, and stays pure: the caller passes it what the store returns. S06 is the first command line; it calls `storePath` with the real environment, `openStore`, and these read functions, and passes the real clock as `now`. Neither may write to the store except through this package.

## Non-goals

Manual marks, ratings and observation overrides (story 2.3 and its tables). A command-line import. Any price connector (story 2.2). PDF import (story 2.4). Any UI. Alert evaluation, including A11 on the split flag (S05 or later). Re-checking stored pairs after a back-filled import. Adjusting any close for a split. Deleting or correcting a stored close. Schema migrations beyond creating version 1. Reading `Adj Close`, quoted fields or any delimiter but `,`. Windows CI: `storePath` covers `win32` as a pure function only, since CI runs macOS and Linux.

## Acceptance criteria

Store tests run with `pnpm --filter @keel/store test`. Each criterion names the test file that carries it. Every test that opens a store does so in a new directory under `os.tmpdir()`, never under the repo, never at the default location, and never in `KEEL_DATA_DIR`.

| # | Criterion | Test file and what it asserts |
| --- | --- | --- |
| AC1 | The location table holds | `location.test.ts`: every case under Frozen values, deep-equal |
| AC2 | The CSV format holds | `csv.test.ts`: each reject file gives exactly its reason and line; `skip-null.csv`, `bom-crlf.csv` and `descending.csv` parse as stated; the dates under Frozen values; every reason listed, not only the first, for a file with three defects |
| AC3 | The split flag holds | `split.test.ts`: the split table, deep-equal on flags and `ratio`; `split-boundary.csv` after `walk-alfa.csv` flags its first close with `from` the walk's last date; `previous` gives `no-earlier-close` on an empty series and `earlier-close-conflict` when the earlier date holds two values |
| AC4 | Imports store what they say | `import.test.ts`: the four walk files give `added` equal to their data-line counts; a second import of the same bytes gives `added` 0 and `duplicates` equal to `rows`; a file with one changed value gives one conflict and `added` 1; the source ID format; `document-other-series`, `ticker-invalid`, `file-name-invalid`, `file-too-large`, `encoding-invalid` and `now-invalid` |
| AC5 | Reads return what is stored | `read.test.ts`: `closesFor` order and `asOf` cut-off, both conflicting values, no filled date, `as-of-invalid`; `latestCloseDates` with and without closes |
| AC6 | The store opens safely | `open.test.ts`: schema 1 on a new file and no change on a second open; `store-newer` on `user_version` 2; `store-in-repository`; WAL mode; modes `0o700` and `0o600` on `darwin` and `linux` |
| AC7 | A second writer waits or fails whole | `lock.test.ts`: with a write transaction held on a second connection, an import with `busyTimeoutMs` 50 returns `store-busy` and the row counts are unchanged; after it commits, the same import succeeds |
| AC8 | Honesty tests pass, and each can fail | `store.honesty.test.ts` under `pnpm verify` |
| AC9 | Engine parity | `parity.test.ts`: for golden case `g03-live`, its closes, written per ticker as CSV text inside the test and imported through `importCloses`, then read back by `closesFor`, give `evaluateNote` a result deep-equal to the one from the case's own closes, apart from each close's `source`, which names the store's source ID |
| AC10 | `node:sqlite` stays in one file, and the pure files stay pure | `boundary.test.ts`: reads each non-test `.ts` file in `packages/store/src` as text and requires at least five; only `sqlite.ts` names `node:sqlite`; `location.ts`, `csv.ts` and `split.ts` import nothing but `./` files and name no `process`, `Date`, `Math.random`, `fetch` or `node:`. A negative control for each rule must be rejected by the same checker |
| AC11 | Node's SQLite runs warning-free on the suite's Node | `node.test.ts`: `process.execPath` runs a script that opens `:memory:` with `DatabaseSync` and reads `sqlite_version()`; it exits 0 and prints nothing on stderr |
| AC12 | Nothing else changes | `git diff --stat origin/main...HEAD -- packages/core packages/plugin-mln schemas fixtures/golden fixtures/synthetic/terms` prints nothing; no path under `fixtures/**/expected/**` changes |
| AC13 | `pnpm verify` stays green, including tripwire, network and determinism | `pnpm verify` on Node 24.22.2 and 26.13.0; afterwards `git status --porcelain --untracked-files=all` prints nothing outside `node_modules`, and `KEEL_DATA_DIR` holds 0 entries |

## Mutation floor

At least three killed mutants per claim, listed in the PR body with the killing test. Required among them: `>=` in place of `>` at 7/5; `<=` in place of `<` at 3/5; a float ratio in place of the exact fraction (killed by `0.7` to `0.98`); comparing the earlier close to the first row of the file instead of the stored `previous`; reading `Adj Close`; trimming header cells; accepting a quoted field; storing a skipped close as `0`; stopping at the first reason; a partial store on a rejected file; `INSERT OR REPLACE` in place of a plain insert; a missing trigger on any table; keying duplicates on date alone; falling back to the default on an empty `KEEL_DATA_DIR`; reading `process.env` in `storePath`; storing the base name with its directory; dropping the `.git` check; `BEGIN` in place of `BEGIN IMMEDIATE`; `closesFor` including dates after `asOf`; a second file importing `node:sqlite`.

## Dependencies

None. `node:sqlite` is part of Node.

Before the build, idea 97 matters: from this slice on, `KEEL_DATA_DIR` is read, and the review skill's setup still exports it from a bare `mktemp -d` with no check. The fix touches `.claude/skills/**`, a sensitive path, so the PM raises it with Beni rather than fold it into this slice.

## Claims list (PR body)

As in S00: every claim with its reproducing command, copied by the PM into the Pass 0 sealed appendix.
