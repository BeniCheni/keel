# S04: Closes import and observation store

- Status: drafted 2026-11-24 by the PM (Claude), on Beni's rulings of 2026-11-24, recorded under Decisions: "Three slices (Recommended)", "S04, S05, S06 (Recommended)", "node:sqlite (Recommended)" and, for story 2.3, "Later slice (Recommended)". Revised 2026-11-25 after the plan challenge (Codex's Pass 1 on PR #60), with Beni's three rulings of that day quoted where they apply, and again after each of Codex's two re-reads.
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
5. **Hand-written Node declarations, not `@types/node`.** The workspace typechecks with `"types": []` and has no Node type package. Adding `@types/node` would be a new dependency under hard rule 8. Instead, `src/node.d.ts` declares only the members of `node:sqlite`, `node:fs`, `node:os`, `node:path`, `node:crypto` and `node:child_process` that the package and its tests use, plus `TextDecoder` (with its `fatal` and `ignoreBOM` options) and the members of `process` the tests read. A declaration file loads nothing at run time, so AC10's rules on loads do not apply to it. The plan challenge found this feasible under `"types": []`, and Beni ruled "Hand-written (Recommended)" on 2026-11-25.
6. **The importer takes bytes, not a path.** `importCloses` receives the file's bytes and its base name. It never sees a directory, so it cannot store one, and a name holding `/` or `\` is rejected. This slice has no command-line entry point; S06 adds the first.
7. **All or nothing.** A file with any rejected line stores nothing, and the result lists every reason, not only the first. An empty or `null` close is not an error: the line is skipped and counted, and nothing is stored for that date. A missing close stays missing; it is never stored as zero or carried from another day.
8. **Append-only, side by side.** Triggers refuse every `UPDATE` and `DELETE` on the slice's tables, and every `INSERT` that would meet an existing row's primary or unique key, so `INSERT OR REPLACE` and `REPLACE` cannot change a row on any connection, whatever its `recursive_triggers` setting. A close equal in text to a stored row from the same source is a duplicate and is counted, not stored. Any other close for a stored date is stored next to it. The result names the date as a conflict only when the series' values on that date differ as exact fractions, so `95.1` from one source and `95.10` from another are kept side by side and are not a conflict. Nothing picks a winner (hard rule 6).
9. **No sensitive path.** The slice lives in `packages/store`, a fixture generator under `tools/generators/closes`, its registry entry, its input files under `fixtures/synthetic/closes`, and the verify steps in `tools/verify/steps.mjs`. Its expected values are frozen in this spec and asserted in tests, so it writes nothing under `fixtures/**/expected/**` or `fixtures/golden/**`. If the build finds it must touch a sensitive path, it stops and the PM escalates.
10. **Locking.** ADR-0004's argument against is concurrent writes from the app and the check command. The store opens in WAL mode with a busy timeout, and an import runs in one `BEGIN IMMEDIATE` transaction, which takes the write lock before the import reads anything. A second writer that cannot take the lock within the timeout gets `store-busy` and stores nothing.

## Scope

All new code lives in `packages/store/` (`@keel/store`, `"exports": { ".": "./src/index.ts" }`), `tools/generators/closes/` and `fixtures/synthetic/closes/`. `tools/fixtures/registry.mjs` gains the closes generator, and `tools/verify/steps.mjs` gains `packages/store` in its `typecheck` and `tests` steps. `packages/store/vitest.config.mjs` loads `tools/network/guard-setup.mjs`, as the other packages' configs do. `packages/store/package.json` has `"dependencies": { "@keel/core": "workspace:*" }` and `"devDependencies": { "@keel/plugin-mln": "workspace:*", "vitest": "5.0.5" }`, the version the other packages pin, and no other dependency field. `pnpm-lock.yaml` gains the `packages/store` importer and nothing else, so no package is added to its `packages:` or `snapshots:` sections. That importer is exactly this block, as `pnpm install --lockfile-only --offline` writes it for that manifest (AC12):

```yaml
  packages/store:
    dependencies:
      '@keel/core':
        specifier: workspace:*
        version: link:../core
    devDependencies:
      '@keel/plugin-mln':
        specifier: workspace:*
        version: link:../plugin-mln
      vitest:
        specifier: 5.0.5
        version: 5.0.5(vite@8.3.5(esbuild@0.28.2)(yaml@2.9.1))
``` No change to `packages/core`, `packages/plugin-mln`, `schemas` or any other existing fixture.

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

Absolute means starting with `/` on `darwin` and `linux`, and with a drive letter, `:` and `\` on `win32`. That is narrower than `node:path` on purpose: a UNC path or a drive path written with `/` is `data-dir-relative`. From this slice on, `KEEL_DATA_DIR` decides where real data goes, so an empty value is an error and never means "use the default".

### Opening the store

`openStore(file, options?)` returns `{ kind: "open", store }` or `{ kind: "error", code }`. `options.busyTimeoutMs` defaults to 5000. `options.afterBegin` is a test seam: when given, `importCloses` calls it once, after its begin statement and before its first read or write. `options.onSql` is a second test seam: when given, `sqlite.ts` calls it with the text of every SQL statement it prepares or executes, before it runs, schema statements included. No caller outside the tests passes either.

The store's files are the database file and the `-wal` and `-shm` files beside it. The steps run in this order, and each check runs before anything is created.

1. **Not inside a repository.** If the file's directory, or any directory above it, holds an entry named `.git`, the result is `store-in-repository` and nothing is created. The same check runs again on the real path (`realpath`) of the deepest directory that exists, so a linked directory cannot lead into a repository. This guards hard rule 1 in a development clone. It also refuses a home folder kept in Git; that cost is accepted, and the fix is a `KEEL_DATA_DIR` outside it.
2. **No linked store file.** Each of the store's files that exists must be, by `lstat`, a regular file with one link. A symbolic link, a hard link or anything else is `store-file-unsafe`, and the file and what it points to are left unchanged.
3. **Folder and file modes, on `darwin` and `linux`.** A missing directory is created, with its missing parents, at mode `0o700`; an existing directory keeps its mode. A missing database file is created empty at mode `0o600` before SQLite first opens it, so SQLite gives the `-wal` and `-shm` files it creates the same mode. Any existing store file with a group or other permission bit is set to `0o600` before SQLite opens it.
4. **Pragmas.** `journal_mode = WAL`, `foreign_keys = ON`, `recursive_triggers = ON` and `busy_timeout` from the option.
5. **Schema version.** `PRAGMA user_version` 0 creates schema 1 in one transaction and sets it to 1. Version 1 changes nothing. Any higher version closes the database and returns `store-newer`. Nothing migrates downward.

### Schema 1

Every table is `STRICT`, and every table has three triggers that raise `append-only`: `BEFORE UPDATE`, `BEFORE DELETE`, and `BEFORE INSERT` when a stored row already has the new row's primary key or any of its `UNIQUE` keys. The insert trigger is what stops `INSERT OR REPLACE`, since SQLite's replace deletes the old row without firing delete triggers while `recursive_triggers` is off, which is its default. The importer therefore looks up what it would duplicate before it inserts: a repeat of a stored document is found by its hash, and adds nothing. Its only write statement is a plain `INSERT INTO`, and no statement the store runs holds a conflict clause (AC4).

| Table | Columns |
| --- | --- |
| `documents` | `id` INTEGER PRIMARY KEY; `kind` TEXT, only `csv-closes`; `file_name` TEXT; `sha256` TEXT, 64 lowercase hex, UNIQUE; `redacted` INTEGER, always 0 here |
| `sources` | `id` TEXT PRIMARY KEY; `kind` TEXT, only `csv-closes`; `document_id` INTEGER REFERENCES `documents`; `series_key` TEXT; `page` INTEGER, NULL; `url` TEXT, NULL; `retrieved_at` TEXT |
| `observations` | `id` INTEGER PRIMARY KEY; `series_key` TEXT; `as_of_date` TEXT; `value` TEXT; `source_id` TEXT REFERENCES `sources`; `provenance` TEXT, only `imported-csv`; `imported_at` TEXT; UNIQUE (`series_key`, `as_of_date`, `value`, `source_id`) |
| `observation_flags` | `observation_id` INTEGER REFERENCES `observations`; `code` TEXT, only `possible-split`; `detail` TEXT, JSON `{ "from", "fromValue", "ratio" }`; PRIMARY KEY (`observation_id`, `code`) |

These follow the proposal's Section 11 data model. `sources.series_key` is added so that one CSV file belongs to one series. `observation_flags` is added so that a flag never edits the row it describes. A value is stored as the exact text the file gave, never as a number.

### The CSV format

`parseClosesCsv(text)` returns `{ kind: "parsed", rows, skipped }` or `{ kind: "rejected", reasons }`. Each reason is `{ code, line }`, where `line` is 1-based, or `null` for the file as a whole. `rows` is `{ line, date, value }[]` in ascending date order. `skipped` is `{ line, code }[]` in line order.

1. One leading U+FEFF is removed, and only one: `importCloses` decodes with `ignoreBOM: true`, so the decoder strips none, and a second U+FEFF stays in the first header cell. Lines split on `\n`, and one `\r` at a line's end is removed. A blank line is skipped as `line-blank`, except the one after a final newline, which is not counted.
2. Any `"` in the file rejects it with `quoted-field` at each line that has one, and no other rule runs.
3. No non-blank line at all is `no-rows`, with line `null`. Otherwise the first non-blank line is the header, split on `,` with no trimming. It needs exactly one cell `Date` and exactly one cell `Close`. With no `Date` the reason is `date-column-missing`. With no `Close` it is `close-column-missing`, whether or not `Adj Close` is there. A header cell that appears twice is `header-duplicate`, once per repeated name. Header reasons carry the header's line, and when there are any, no data line is checked. The `Adj Close` column is never read.
4. A data line with a different cell count from the header is `row-width`, and its cells are not checked.
5. A date is `YYYY-MM-DD` and a real Gregorian date, or it is `date-invalid`. The store has its own check; it imports none from core.
6. A close cell that is exactly empty or exactly `null` skips the line as `close-empty` or `close-null`. Any other close matches `^(0|[1-9][0-9]{0,9})(\.[0-9]{1,6})?$`, S03's grammar, and is greater than zero, or it is `close-invalid`. A line with an invalid date gets `date-invalid` and is never counted as skipped.
7. A valid date on two data lines is `date-duplicate` at the second, whatever the values, and whether or not either line is skipped.
8. No data row left after the skips is `no-rows`, with line `null`.

Rows may come in any order; the result sorts them. Reasons are listed with line `null` first, then by line, and within one line in the order of the codes above: `quoted-field`, `date-column-missing`, `close-column-missing`, `header-duplicate` (in header order), `row-width`, `date-invalid`, `close-invalid`, `date-duplicate`.

### The split flag

`splitFlags(rows, previous)` takes the parsed rows and `previous`, the stored close just before the file's earliest row (see below), and returns `{ date, from, fromValue, ratio }[]`: the flagged close's date, the earlier close's date and its text, and the ratio. For each pair of consecutive closes, in date order, with `previous` first when it is given, it computes `r = later ÷ earlier` as an exact fraction. It flags the later close when `r > 7/5` or `r < 3/5`, so a move of exactly 40% either way is not flagged. A gap in days between the two closes does not change this. `ratio` is the reduced fraction `"p/q"`. No float is used.

`previous` is read from the closes stored before this import. Its date is the latest stored date for the series before the date of the file's earliest accepted row (rows skipped as `close-empty` or `close-null` do not count). It exists only when that date holds exactly one distinct value, by exact fraction, across all sources; its value is then the text of that date's row with the lowest `observations.id`, so equal fractions written differently give one answer. Otherwise there is none, and the import result says why: `no-earlier-close` or `earlier-close-conflict`. Pairs that a back-filled import creates with stored closes after its dates are not checked; that is a non-goal.

A flag is stored in `observation_flags` with its detail as JSON, and it changes no value and blocks no row. Flags are stored only for observations this import adds, and the result's `flags` lists exactly those. Since a file's source is its document, an import adds every accepted row or none: a repeat of the same bytes adds nothing, so it stores and returns no flag.

### Importing

`importCloses(store, { ticker, fileName, bytes, now })`:

- `ticker` matches the schema's `^[A-Z][A-Z0-9.]{0,9}$`, or `ticker-invalid`. The series key is `close:<ticker>`.
- `fileName` is 1 to 255 characters, with no `/`, `\` or control character, or `file-name-invalid`.
- `bytes` is at most 5,000,000 bytes, or `file-too-large`, and valid UTF-8 by `new TextDecoder("utf-8", { fatal: true, ignoreBOM: true })`, or `encoding-invalid`.
- `now` is `YYYY-MM-DDTHH:MM:SS.sssZ` and a real instant, or `now-invalid`. It is the only clock the store reads, and it fills `imported_at` and `retrieved_at`.
- The document is identified by the SHA-256 of `bytes`. Its source ID is `csv-`, the first 48 hex digits of that hash, `-`, and the ticker in lower case with `.` written `-`; at 63 characters at most, it matches S03's `^[a-z0-9][a-z0-9-]{0,63}$`. A document already stored under another series is `document-other-series`. A stored source with the same ID and a different document is `source-id-collision`.
- Everything runs in one `BEGIN IMMEDIATE` transaction. A lock not taken within the busy timeout is `store-busy`. Any failure rolls back, and nothing is stored.

It returns `{ kind: "rejected", reasons }`, `{ kind: "error", code }` or:

```ts
{
  kind: "imported";
  sourceId: string;
  sha256: string;
  rows: number;        // data rows accepted by the parser
  added: number;       // rows stored
  duplicates: number;  // rows equal in text to a stored row from the same source: 0 or rows
  skipped: { line: number; code: "line-blank" | "close-empty" | "close-null" }[];
  conflicts: { date: string; values: string[] }[]; // dates of this file that now hold two or more values for the series that differ as exact fractions, values in stored order
  flags: { date: string; from: string; fromValue: string; ratio: string }[]; // the flags this import stored
  previous: { date: string; value: string } | { reason: "no-earlier-close" | "earlier-close-conflict" };
}
```

Importing the same bytes for the same ticker again adds nothing: `added` is 0, `duplicates` equals `rows` and `flags` is empty. Any other bytes are a new document and a new source, so even a copy of a stored file with one Close changed adds every one of its rows. Where the store held no conflict on the file's dates before, only the changed date can be one, and it is one only when the new Close differs from the old as an exact fraction (`95.1` changed to `95.10` is no conflict); a date of the file that already held differing values is listed too, since `conflicts` names every date of the file that holds them now.

### Reading

- `closesFor(store, tickers, asOf)` returns every stored close for those tickers dated on or before `asOf`, as S03's `Close` (`{ ticker, date, value, source }`), ordered by the tickers' input order, then date, then source ID, then value. It returns conflicting closes as they are and never fills a missing date. An invalid `asOf` is `{ kind: "error", code: "as-of-invalid" }`.
- `latestCloseDates(store, tickers, asOf)` returns `{ ticker, date }[]`: the latest stored date on or before `asOf`, or `null` when the series has none. A stored close dated after `asOf` never shows here, so A8 cannot read a future close as fresh data. An invalid `asOf` is `as-of-invalid`. S05's A8 reads it.
- `closeStore(store)` closes the database.

## Frozen values

### Location

The table under "Where the store lives", with these exact cases in `location.test.ts`: `{ KEEL_DATA_DIR: "/tmp/kd" }` gives `/tmp/kd/keel.sqlite` on `darwin` and `linux` and `data-dir-relative` on `win32`; on `win32`, `C:\kd` gives `C:\kd\keel.sqlite`, and the UNC path `\\server\share\kd` and the drive path `C:/kd` each give `data-dir-relative`, though `node:path`'s `win32.isAbsolute` calls all three absolute; `{ KEEL_DATA_DIR: "" }` gives `data-dir-empty`; `{ KEEL_DATA_DIR: "kd" }` gives `data-dir-relative`; `darwin` with home `/Users/u` gives `/Users/u/Library/Application Support/keel/keel.sqlite`; `linux` with home `/home/u` and `XDG_DATA_HOME` `/x` gives `/x/keel/keel.sqlite`, with it empty gives `/home/u/.local/share/keel/keel.sqlite`; `win32` with `APPDATA` `C:\Users\u\AppData\Roaming` gives `C:\Users\u\AppData\Roaming\keel\keel.sqlite`, and with none gives `app-data-unset`; `freebsd` gives `platform-unsupported`; `darwin` with home `""` gives `home-invalid`.

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

Every file starts with the line `# synthetic: true` and a `\n`, the tripwire's marker for a synthetic CSV, followed by the payload: the bytes a test hands to `importCloses`. The marker is fixture packaging, not part of the CSV format, and the parser knows nothing of it. One test helper, `payload(name)`, requires a file's first 18 bytes to be exactly that line and returns the rest; it fails on a file without the marker. So the payload of `bom-crlf.csv` starts with its byte-order mark.

- **Walks.** `walk-alfa.csv`, `walk-brvo.csv`, `walk-chrl.csv` and `walk-dlta.csv`: every open day from 2026-01-02 to 2027-12-31 by `nyseRulesCalendar()` and `scheduleDateFlags` from `@keel/core`, a seeded walk that starts at `100.00`, with daily moves within ±3%, closes rounded half-up to 2 decimals and held between `1.00` and `10000.00`, a move that would leave that range being clamped to its edge. The header is `Date,Open,High,Low,Close,Adj Close,Volume`; Open, High and Low equal Close, and Adj Close is Close × 0.98 rounded half-up, so a reader of the wrong column fails the tests.
- **Splits.** One file per row of the split table, as two consecutive closes, plus `split-boundary.csv`, whose first close is exactly 1.5 times the last close of `walk-alfa.csv`, written with at most 3 decimals, for the `previous` rule.
- **Rejects.** One file per rejection reason in the CSV format, each with that one defect. Where the reason belongs to a data line, the file has at least two valid data lines before the defective one, so an importer that stored lines as it read them would store some.
- **Skips and shapes.** `skip-null.csv` (empty and `null` closes and a blank line), `bom-crlf.csv` (a byte-order mark and CRLF endings), `bom-twice.csv` (two byte-order marks, which gives `date-column-missing` at line 1), `descending.csv` (dates newest first) and `adj-close-only.csv`.

Tickers are the synthetic `ALFA`, `BRVO`, `CHRL` and `DLTA` used by the terms fixtures.

## Honesty tests (`store.honesty.test.ts`)

- The Close column is the only one read: for each walk file, every stored value equals that line's Close and none equals its Adj Close.
- A file with any rejected line stores nothing: the row counts of all four tables are equal before and after, for every reject file, including those whose defect follows valid lines.
- A missing close is never stored: for `skip-null.csv`, no row exists for a skipped date, and no stored value is `0`, empty or `null`.
- A stored close is never changed or removed: after importing a conflicting file, the earlier rows are byte-equal to before. On each table, a raw `UPDATE`, a raw `DELETE`, and a raw `INSERT OR REPLACE` that meets a stored row's primary key and each of its unique keys, each fails with `append-only`, both through the store's connection and through a second connection opened with `recursive_triggers` off, and every row is byte-equal afterwards.
- A conflict is kept side by side: both values come back from `closesFor`, in the stated order, and the result names the date.
- A split flag changes no value: a flagged row's value equals the file's text, and the row is stored.
- No directory is stored: a `fileName` holding `/` or `\` is rejected, and after the suite's imports no column of any table except `observation_flags.detail` holds a `/` or `\`. Each `detail` parses as JSON with exactly the keys `from`, `fromValue` and `ratio`: `from` a valid date, `fromValue` in S03's close grammar, and `ratio` matching `^[1-9][0-9]*/[1-9][0-9]*$`.
- `closesFor` never returns a close dated after `asOf`, and never returns a date the store does not hold. `latestCloseDates` never returns a date after `asOf`.
- `storePath` reads only its argument: with `process.env.KEEL_DATA_DIR` set to a sentinel during the call, a call with `env: {}` on `darwin` returns the default path, not the sentinel.
- An empty `KEEL_DATA_DIR` is never the default location: `{ KEEL_DATA_DIR: "" }` gives `data-dir-empty` on every platform.
- A store is never opened inside a repository: `openStore` on a path under a directory holding `.git` returns `store-in-repository` and creates no file; so does a path whose directory is a symbolic link to a subdirectory of such a directory, not to the directory itself, so that only the real-path check sees the `.git`. A database file that is a symbolic link to, or a hard link of, a file under such a directory returns `store-file-unsafe`, and the target's bytes are unchanged.

Each honesty test fails when its guarded behaviour is broken; the PR body names, per mutant, the test that kills it.

## What S05 and S06 take from this

S05 reads closes through `closesFor` and stale-data dates through `latestCloseDates`, both at the evaluation's `asOf`, and stays pure: the caller passes it what the store returns. S06 is the first command line; it calls `storePath` with the real environment, `openStore`, and these read functions, and passes the real clock as `now`. Neither may write to the store except through this package. By the three-slice ruling S06 is the check command and the launchd sample, so a command-line import, the user's way to call `importCloses`, is not in S06. Beni ruled on 2026-11-25 that it goes to a later slice ("Later slice (Recommended)", to where the import command goes), which he numbers.

## Non-goals

Manual marks, ratings and observation overrides (story 2.3 and its tables). A command-line import. Any price connector (story 2.2). PDF import (story 2.4). Any UI. Alert evaluation, including A11 on the split flag (S05 or later). Re-checking stored pairs after a back-filled import. Adjusting any close for a split. Deleting or correcting a stored close. Schema migrations beyond creating version 1. Reading `Adj Close`, quoted fields or any delimiter but `,`. Windows CI: `storePath` covers `win32` as a pure function only, since CI runs macOS and Linux.

## Acceptance criteria

Store tests run with `pnpm --filter @keel/store test`. Each criterion names the test file that carries it. Every test that opens a store does so in a new directory under `os.tmpdir()`, never under the repo, never at the default location, and never in `KEEL_DATA_DIR`.

| # | Criterion | Test file and what it asserts |
| --- | --- | --- |
| AC1 | The location table holds | `location.test.ts`: every case under Frozen values, deep-equal |
| AC2 | The CSV format holds | `csv.test.ts`, on payloads decoded as `importCloses` decodes them (`fatal` and `ignoreBOM` both true): each reject file gives exactly its reason and line; `skip-null.csv`, `bom-crlf.csv` and `descending.csv` parse as stated, and `bom-twice.csv` gives `date-column-missing` at line 1; the dates under Frozen values; for a file with three defects, every reason in the stated order, not only the first; a line with both an invalid date and an invalid close gives `date-invalid` then `close-invalid` |
| AC3 | The split flag holds | `split.test.ts`: the split table, deep-equal on flags and `ratio`; `split-boundary.csv` after `walk-alfa.csv` flags its first close with `from` the walk's last date, `fromValue` the text of that date's Close in `walk-alfa.csv` and `ratio` `3/2`, and the stored `observation_flags.detail` for that row parses deep-equal to `{ from, fromValue, ratio }` of the result's flag; the same holds for the split files `100.00` to `50.00` (`1/2`) and `50` to `100` (`2/1`); `previous` gives `no-earlier-close` on an empty series and `earlier-close-conflict` when the earlier date holds two values; when the earlier date holds `95.1` and then `95.10` from two sources, `previous.value` is `95.1`; with closes stored on `2026-03-02` and `2026-03-04`, a file whose first line, `2026-03-03`, is skipped as `close-null` and whose next, `2026-03-05`, is accepted takes `previous` from `2026-03-04`, not `2026-03-02` |
| AC4 | Imports store what they say | `import.test.ts`: the four walk files give `added` equal to their data-line counts; a second import of the same bytes gives `added` 0, `duplicates` equal to `rows` and no flags, and the flag count in the store is unchanged; a one-row file with a different value on a stored date gives `added` 1 and that one conflict; a copy of `walk-alfa.csv`'s payload with one Close changed to a value that differs as an exact fraction gives `added` equal to its rows, `duplicates` 0 and exactly that date as the one conflict; when one date of that copy already held two differing values before the import, `conflicts` lists that date and the changed one, in date order; a one-row file holding `95.10` from a second source on a date stored as `95.1` gives `added` 1 and no conflict, and `closesFor` returns both texts; the raw payload of `bom-twice.csv` gives `rejected` with `date-column-missing` at line 1 and the row counts of all four tables unchanged, and the raw payload of `bom-crlf.csv` imports every row it parses to; the source ID format; `source-id-collision`, from a source row the test inserts first with the import's ID and another document; `document-other-series`, `ticker-invalid`, `file-name-invalid`, `file-too-large`, `encoding-invalid` and `now-invalid`, each with the row counts of all four tables unchanged. Statements: a new store opened with `onSql`, then two imports of `walk-alfa.csv` and one conflicting file, passes every statement to the test. The test splits each into tokens: it drops `--` comments to the end of the line and `/* */` comments, keeps quoted strings and quoted identifiers whole, and compares unquoted words without case. No statement holds the word `REPLACE`, `IGNORE` or `CONFLICT`; every statement whose first word is `INSERT` has `INTO` second; and the statements include an `INSERT INTO observations`. Controls, each through the same tokenizer: `INSERT OR/**/REPLACE INTO o`, `INSERT OR -- c` then a line break and `REPLACE INTO o`, `INSERT OR IGNORE INTO o`, `INSERT INTO o VALUES (1) ON CONFLICT DO NOTHING` and `CREATE TABLE t (k TEXT UNIQUE ON CONFLICT REPLACE)` fail; `INSERT INTO o VALUES ('replace')` and `SELECT RAISE(ABORT, 'append-only')` pass |
| AC5 | Reads return what is stored | `read.test.ts`: `closesFor` order and `asOf` cut-off, both conflicting values, no filled date, `as-of-invalid`; `latestCloseDates` with and without closes, and with a stored close after `asOf`, which it does not return; its `as-of-invalid` |
| AC6 | The store opens safely | `open.test.ts`: schema 1 on a new file and no change on a second open; `store-newer` on `user_version` 2; `store-in-repository`, for a path under a directory holding `.git` and for a linked directory that points to a subdirectory of one, not to the directory itself; `store-file-unsafe` for a database file that is a symbolic link or a hard link, for a `-wal` file that is a symbolic link, for a `-shm` file that is a hard link, and for a directory where the database file or the `-wal` file would be, each with any target's bytes unchanged; WAL mode and `recursive_triggers` 1; on `darwin` and `linux`, under umask `0o022`: a new directory is `0o700`; in an existing `0o755` directory, after an import, the database, `-wal` and `-shm` files are each `0o600` and the directory is still `0o755`; an existing `0o644` database file, and existing `0o644` `-wal` and `-shm` files beside a `0o600` database, are each `0o600` after the open; and with a second connection, which the test opens on a `0o644` database in WAL mode and writes through, holding the `-wal` and `-shm` files open at `0o644`, `openStore` and an import leave all three files `0o600` |
| AC7 | A second writer waits or fails whole | `lock.test.ts`: with a write transaction held on a second connection, an import with `busyTimeoutMs` 50 returns `store-busy` and the row counts are unchanged; after it commits, the same import succeeds. The import takes the lock before it reads: in an `afterBegin` that the test passes, a third connection with `busy_timeout` 0 tries `BEGIN IMMEDIATE` and gets a busy error, which a deferred `BEGIN` would not give, and the import calls `afterBegin` exactly once |
| AC8 | Honesty tests pass, and each can fail | `store.honesty.test.ts` under `pnpm verify` |
| AC9 | Engine parity | `parity.test.ts`: for golden case `g03-live`, its closes, written per ticker as CSV text inside the test and imported through `importCloses`, then read back by `closesFor`, give `evaluateNote` a result deep-equal to the one from the case's own closes, apart from the result's `sources` arrays, which name the store's source IDs |
| AC10 | `node:sqlite` stays in one file, and the pure files stay pure | `boundary.test.ts`: reads each `.ts` file in `packages/store/src` that is neither a test nor a `.d.ts` as text, and requires at least six. Its checker ignores comments and the contents of string, template and regular-expression literals. Only `sqlite.ts` loads `node:sqlite`, by `import … from`, a side-effect `import "…"`, `export … from`, `import(` or `require(`. `location.ts`, `csv.ts` and `split.ts` load nothing but `./` files and use no identifier `process`, `Date`, `Math`, `fetch`, `require` or `globalThis`. Controls, each run through the same checker: `"Date"` in a string, `// Date` and `/Date/` pass; `new Date()`, `Date.now()`, `process.env`, `globalThis.process`, `import x from "node:fs"`, `import "node:sqlite"` and `import("node:sqlite")` in a second file each fail. |
| AC11 | Node's SQLite runs warning-free on the suite's Node | `node.test.ts`: `process.execPath` runs a script that opens `:memory:` with `DatabaseSync` and reads `sqlite_version()`; it exits 0 and prints nothing on stderr |
| AC12 | Nothing else changes | `git diff --stat origin/main...HEAD -- packages/core packages/plugin-mln schemas fixtures/golden fixtures/synthetic/terms` prints nothing; no path under `fixtures/**/expected/**` changes; `packages/store/package.json`'s dependency fields are exactly those under Scope: `node -e 'const p=require("./packages/store/package.json");console.log(JSON.stringify([p.dependencies,p.devDependencies,p.peerDependencies,p.optionalDependencies]))'` prints `[{"@keel/core":"workspace:*"},{"@keel/plugin-mln":"workspace:*","vitest":"5.0.5"},null,null]`; `pnpm-lock.yaml` gains exactly the importer block under Scope and nothing else: `grep -c '^  packages/store:$' pnpm-lock.yaml` prints `1`, `awk '/^  packages\/store:$/{s=1} s&&/^$/{exit} s' pnpm-lock.yaml` prints that block byte for byte, and with that block and the blank line after it removed the file equals `origin/main`'s, so `diff <(git show origin/main:pnpm-lock.yaml) <(awk '/^  packages\/store:$/{s=1;next} s&&/^$/{s=0;next} !s' pnpm-lock.yaml)` prints nothing; every file under `fixtures/synthetic/closes` starts with `# synthetic: true` |
| AC13 | `pnpm verify` stays green, including tripwire, network and determinism | `pnpm verify` on Node 24.22.2 and 26.13.0; afterwards `git status --porcelain --untracked-files=all` prints nothing outside `node_modules`, and `KEEL_DATA_DIR` holds 0 entries |

## Mutation floor

At least three killed mutants per claim, listed in the PR body with the killing test. Required among them: `>=` in place of `>` at 7/5; `<=` in place of `<` at 3/5; a float ratio in place of the exact fraction (killed by `0.7` to `0.98`); comparing the earlier close to the first row of the file instead of the stored `previous`; reading `Adj Close`; trimming header cells; accepting a quoted field; storing a skipped close as `0`; stopping at the first reason; a partial store on a rejected file; `INSERT OR REPLACE` in place of a plain insert, in any spelling (the insert trigger makes it equivalent in behaviour, so AC4's statement check kills it); `ON CONFLICT REPLACE` on a `UNIQUE` constraint of Schema 1 (the same check); a repeat import that reaches an insert, by dropping whichever lookup finds the stored document or rows (AC4's repeat import then meets the insert trigger); narrowing only the database file, not existing side files (AC6's held connection); a reject file whose defect follows valid lines stored in part (the honesty test); checking only the database file, not `-wal` and `-shm`, for links; accepting a store file that is not a regular file; `node:path`'s `win32.isAbsolute` in place of the stated rule; calling `afterBegin` twice; a stored `detail` that differs from the result's flag; a missing trigger of each of the three kinds on any table; dropping `recursive_triggers = ON`; keying duplicates on date alone; falling back to the default on an empty `KEEL_DATA_DIR`; reading `process.env` in `storePath`; storing the base name with its directory; dropping the `.git` check; dropping the real-path check; following a linked database file; setting `0o600` after SQLite creates the side files instead of before; `BEGIN` in place of `BEGIN IMMEDIATE`; `closesFor` including dates after `asOf`; `latestCloseDates` ignoring `asOf`; a second file importing `node:sqlite`; decoding without `ignoreBOM`; taking `previous` from before a skipped first line; storing a flag on a repeat import; a source ID from 16 hex digits.

## Dependencies

None. `node:sqlite` is part of Node.

Before the build, idea 97 matters: from this slice on, `KEEL_DATA_DIR` is read, and the review skill's setup still exports it from a bare `mktemp -d` with no check. The fix touches `.claude/skills/**`, a sensitive path, so it is not folded into this slice. Beni ruled "Fix first (Recommended)" on 2026-11-25: the skill fix lands in its own PR before the build prompt goes out.

## Claims list (PR body)

As in S00: every claim with its reproducing command, copied by the PM into the Pass 0 sealed appendix.
