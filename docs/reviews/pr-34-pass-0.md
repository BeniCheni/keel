# Pass 0 brief: PR #34 (S02.1 final valuation date term and schema 0.2)

Written by the PM on 2026-11-11 (America/New_York), from a fresh read of the PR at `51322491ae2fc46ba7f3edaa06a700b47842b7fc`. This brief lives on branch `docs/pr-34-records`, not on the PR branch, so that no Claude-authored commit enters PR #34 and Pass 1 stays Claude Code. When it was written, PR #34 had no comment (`gh api repos/BeniCheni/keel/issues/34/comments --jq length` printed `0`).

## Seat for Pass 1

Claude Code, fresh session, fresh clone. Model Fable 5.1 Extra, because sensitive paths are touched. Fallback Opus 5.5 High; say so in the comment if it is used. Fable seats work on synthetic data only and never open the private-list file.

Later seats: Pass 1.5 is the PM. Pass 2 is Codex, GPT-6.1 Sol Extra High, with no fallback, and it also runs the private-list check, reporting counts only. Pass 2.5 is a fresh Claude session on Fable 5.1 High, fallback Opus 5.5 High. Beni merges. The PR is still a draft and must be marked ready before it can merge.

## Scope

- Spec: `docs/specs/s02.1-final-valuation.md`, read with Beni's ruling of 2026-11-11 below and the build prompt recorded at the end of this brief. Design brief: none.
- Sensitive paths touched: `schemas/**` (one file, `schemas/mln-terms/0.2.json`; `git diff --name-only origin/main...HEAD -- schemas`) and `packages/core/**` (18 files; `git diff --name-only origin/main...HEAD -- packages/core | wc -l`). The other six files are not sensitive paths: four under `fixtures/synthetic/terms/`, `tools/generators/terms/generate.mjs` and `tools/fixtures/registry.mjs`. No file under `fixtures/**/expected/**` or `fixtures/golden` changes (`git diff --name-only origin/main...HEAD -- 'fixtures/**/expected/**' fixtures/golden | wc -l` prints `0`).
- Release: no. This is a terms-schema change (0.2) toward `v0.1.0`, which the spec's Decision 2 places in that minor.
- New dependencies: none. `git diff --exit-code --stat origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml packages/core/package.json` exits 0.
- Bootstrap path: no. Install, `verify` and mutations all apply. Pass M is N/A: this slice has no engine and no golden fixture (`ls fixtures/golden` reports no such directory). Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50; cite it rather than raising it.
- Diff: 25 files, 3032 insertions, 47 deletions (`git diff --shortstat origin/main...HEAD`). Of the insertions, 2228 are `0.2.json` (`wc -l schemas/mln-terms/0.2.json`).
- Base: `origin/main` at `58845e2`, the PR #33 squash (`git merge-base origin/main HEAD`).
- CI: run 43106088271 at `5132249`, event `pull_request`, workflow `verify`, conclusion `success` (`gh run list --repo BeniCheni/keel --commit 51322491ae2fc46ba7f3edaa06a700b47842b7fc --json databaseId,event,conclusion,workflowName`).

## Rulings every seat carries

1. **Two readings of the spec, Beni, 2026-11-11 at 16:23 EST, in the PM's session.** The PM asked: "My S02.1 spec says schema 0.2.json is 0.1.json with only its `schema` constant changed. But 0.1.json also sets `$id` and `title` to mln-terms/0.1, and the fixture manifest's `version` line also moves from 1 to 2. Should Cursor's build prompt state both readings (0.2.json's `$id` and `title` read mln-terms/0.2, and the manifest's version line moves to 2), with the spec wording fixed in the next docs PR?" Beni answered "Yes, in the prompt (Recommended)". So `0.2.json`'s `$id` and `title`, and the manifest's `version` line, differing from the spec's literal text are not findings. Whether the build matches the two readings is still yours to check.
2. **Ruling 4 of 2026-11-10, "Bump to 0.2 (Recommended)".** It put the term in a new schema 0.2 and kept `0.1.json` byte-identical. `docs/reviews/pr-32-pass-1.5.md`, "Rulings from Beni", has it.

The PM owns three known gaps, all bound for the next ordinary docs PR. Cite them rather than raising them as new:

- `README.md` line 7 still says the core "loads an mln-terms/0.1 file". The build prompt told Cursor to leave it.
- Once this slice merges, S01's two frozen summaries and S02's frozen `termDateFlags` object in their specs disagree with the code. `docs/reviews/pr-32-pass-2.5.md`, "Risks and accepted costs", accepted that.
- The S02.1 spec's wording on `0.2.json` and on the manifest, per ruling 1.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `5132249` feat(core): state the final valuation date in schema 0.2 | Cursor | Claude Code, Pass 1 |

Any fix commit Pass 1 pushes is Claude-authored and gets its cold read from Codex at Pass 2. Any Codex fix commit gets its cold read from the fresh Claude session at Pass 2.5. A Claude session wrote the spec and the build prompt but no commit on this branch, so that does not change who takes Pass 1. The session that wrote this brief takes no review pass on this PR.

## Fast-track

Not allowed: the diff is code on sensitive paths and changes the terms schema.

## What to check, beyond the skill's standing checks

Each is a question, not a finding. Results the PM has for some of them are in the sealed appendix, so that your first read stays your own.

1. **Does AC1's byte-identity test pin bytes?** `terms.schema.test.ts` imports `0.1.json` as text and hashes it through `sha256Hex`, which fills a `Uint8Array` from `charCodeAt`. Does the digest change for every edit to the file's bytes? Is there an edit to `0.1.json` that the whole suite misses?
2. **Which schema validates a file whose line 1 fails.** `load.ts` validates against 0.1 whenever line 1 is not exactly a marker (`lineSchema ?? "mln-terms/0.1"`), even when the parsed `schema` value is `mln-terms/0.2`. The spec says only "Any other value is `schema-line`, as now". Does the fallback add a diagnostic that tells the reader something false about the file? Does the spec settle which schema applies?
3. **The line 1 against data branch.** `load.ts` adds `schema-line` when the parsed value is not a marker or differs from line 1. Which inputs reach each half? A branch no input reaches cannot kill a mutant.
4. **The mutation floor, per claim.** The spec asks for at least three killed mutants per claim. The PR body lists 18 claims (`gh pr view 34 --repo BeniCheni/keel --json body --jq .body | awk '/^## Claims/{f=1} /^## Mutation floor/{f=0} f && /^[0-9]+\. /' | wc -l`) and 24 mutant rows (`gh pr view 34 --repo BeniCheni/keel --json body --jq .body | awk '/^## Mutation floor/{f=1} /^## Test plan/{f=0} f && /^\| /' | tail -n +3 | wc -l`). Which claims have fewer than three? Look in particular at the derived fixture date (claim 11), the statuses other than `document` (claim 14), "an unknown value adds no key" (claim 16), and "absent stays absent" (a projection that defaults the term).
5. **Whether each mutant row is re-runnable and died for the right reason.** The build prompt asked for each change "as a patch or a one-line command"; the rows describe changes in words. Every row's suite command is the whole core suite, recorded as "Each exit was 1", which does not show which test failed. Re-run a sample, including the three summary-order rows and the three date-flag rows, and confirm the named test fails on the named assertion. A row that does not reproduce goes under "Killed as unreproducible".
6. **The manifest and spec line 57.** The spec says that for the 0.2-only invalid fixture, the mutation applies to `minimal.yaml` moved to 0.2, "and the manifest says so". Ruling 1 makes the version line and the two new entries the manifest's whole diff. Does the manifest say it anywhere? If it does not, is that a defect in the build or in the spec?
7. **The changed expected values.** The PR body lists ten replaced assertions. Compare them with every removed line in the test diff (`git diff -U0 origin/main...HEAD -- '*.test.ts' | grep -E '^-[^-]'`). Is each replacement the value the spec sets? Was anything removed that the table does not account for? The continuation-line honesty test is rewritten as a loop over both markers: is it at least as strong as before?
8. **Decision 3.** The loader checks the date and nothing more. Does a final valuation date before trade or after maturity load with no diagnostic, as the spec requires? Does any new code compare it with another date?
9. **The purity test's new import.** `schedule.purity.test.ts` imports `node:fs` under `// @ts-expect-error TS2591`, which suppresses every error on that line, not only TS2591. Does it hide anything? Does the recursive listing see the same set of files the glob reads, leaving aside the extensions and symlinks of ideas 51 to 53?
10. **The generator.** Claim 11 says the derived date draws nothing from the seed. Check the code and the regenerated bytes. The marker check now keys on two hard-coded file names (`SCHEMA_02` in `generate.mjs`): does it still catch a drifted marker in every file?

Out of scope, by the spec's non-goals: comparing the final valuation date with other dates (S03), estimating it, any change to `observationSchedule` or `scheduleDiff`, removing schema 0.1 or migrating files, payment dates, the payoff engine, UI, ideas 51 to 53, and Pass M. List out-of-scope findings in your comment rather than in `docs/v0.1.0-ideas.md`; the PM carries them to the next ordinary docs PR.

## Sealed appendix: to verify independently

Do your own read before opening this. Everything here is a claim, not a fact. Re-derive each one; report any that do not reproduce.

### Builder claims, from the PR body at `5132249`

| # | Claim (as the builder stated it) | Command the builder gave |
| --- | --- | --- |
| 1 | `0.1.json` is byte-identical to `origin/main`; SHA-256 `411d100f2dc971e2d8c5f2bd553dfc95292196f41d6c0f9301f5a9cb6a21de78`, which the schema test pins | `git diff --exit-code origin/main...HEAD -- schemas/mln-terms/0.1.json`; `git show origin/main:schemas/mln-terms/0.1.json \| shasum -a 256` |
| 2 | The valid-fixture diff is only `example-autocall.yaml`, 5 insertions and 1 deletion | `git diff --numstat origin/main...HEAD -- fixtures/synthetic/terms/valid` |
| 3 | After `pnpm fixtures:regen`, `git status --porcelain --untracked-files=all -- fixtures` prints nothing on Node v24.22.2 and v26.13.0 | The same two commands, on each Node |
| 4 | The manifest diff is the version line and the two new invalid entries, numstat `15 1`; the manifest test expects version 2 and seed `keel-s01-terms-1` | `git diff origin/main...HEAD -- fixtures/synthetic/terms/manifest.json` |
| 5 | `schedule.ts`, `calendar.ts` and `types.ts` are unchanged | `git diff --stat origin/main...HEAD -- packages/core/src/schedule/schedule.ts packages/core/src/schedule/calendar.ts packages/core/src/schedule/types.ts` |
| 6 | `packages/core/src/index.ts` and `tools/acceptance/test/core-entry.test.mjs` are unchanged | `git diff --stat origin/main...HEAD -- packages/core/src/index.ts tools/acceptance/test/core-entry.test.mjs` |
| 7 | No dependency and no version file changed | `git diff --stat origin/main...HEAD -- package.json pnpm-lock.yaml packages/core/package.json`; `git diff --name-only origin/main...HEAD -- CHANGELOG.md README.md package.json` |
| 8 | `pnpm verify` is green on Node v24.22.2 and v26.13.0: eight steps ok, 171 core tests in 16 files, 122 tooling tests in 10 files | `pnpm install --frozen-lockfile`; `pnpm verify` |
| 9 | Honesty test counts did not fall: `schedule.honesty.test.ts` 14 and 14, `terms.honesty.test.ts` 8 and 11, at `origin/main` and `HEAD` | `git grep -c -E '^[[:space:]]*(test\|it)(\.each\([^)]*\))?\(' <rev> -- '*.honesty.test.ts'` |
| 10 | `README.md` line 7 is unchanged and still names `mln-terms/0.1` | `git show HEAD:README.md \| sed -n '7p'` |
| 11 | `example-autocall.yaml` line 1 is `schema: mln-terms/0.2`; its `dates.final_valuation` is `2031-07-09`, `primary`, `supplement`, the last key of `dates`, derived as five calendar days before the earlier maturity candidate and not drawn from the seed; `dayOfWeek(2031, 7, 9)` is 3 | The frozen tests in `terms.summary.test.ts` and `terms.dates.test.ts` |
| 12 | A 0.1 file stating the term fails `unknown-key` at `dates.final_valuation`; a 0.2 file with `2027-02-30` fails `invalid-date` at `dates.final_valuation.value`; both manifest rows carry path, line and column, and the tests assert all three | `terms.invalid.test.ts` |
| 13 | `minimal.yaml` with line 1 changed to 0.2 loads to the same terms apart from `schema` | `terms.valid.test.ts` |
| 14 | The term is unverified when absent, when a conflict of two `primary` candidates, and under `document`, `advisor`, `user`, `estimate`, `assumed` and `unknown`; an absent term stays absent and stays in `total` for both versions | `terms.honesty.test.ts` |
| 15 | The new summary path sits immediately after `dates.first_call_observation` | `terms.summary.test.ts` |
| 16 | A Saturday final valuation flags `weekend` in the loader's `dateFlags` and in `termDateFlags`; a conflict flags each candidate path; an unknown value adds no key | `terms.dates.test.ts`; `schedule.flags.test.ts` |
| 17 | The purity glob's non-test keys equal the recursive listing; narrowing the glob, or a `Date.now()` file beside the marker, fails `schedule sources pass the purity checker` | `pnpm --filter @keel/core exec vitest run --config vitest.config.mjs src/schedule/schedule.purity.test.ts -t "schedule sources pass the purity checker"` |
| 18 | An integer token fault (`09500`) and an unknown key are both reported; two faults whose path order reverses their line order come out in line order | `terms.invalid.test.ts` |
| 19 | AC1 to AC10 each pass | The PR body's acceptance table |
| 20 | 24 mutants, each exit 1 under `pnpm --filter @keel/core test` on Node v24.22.2, none surviving, each killed by the test the row names | The PR body's mutation table |
| 21 | `loadTerms`, `dateFlags`, `verificationSummary` and `termDateFlags` keep their signatures; core product code does no file, network, clock or random I/O | The PR's summary |

The PR body also states that Beni set Extra High in Cursor's picker before pasting the build prompt. That repeats the build prompt's own sentence. After this brief was first pushed at `2c72b93`, Beni confirmed it at 17:30 EST on 2026-11-11 in the PM's session, answering "Yes" to "Was Cursor's picker on Grok 4.7 Extra High when you pasted the S02.1 build prompt?". That is his statement; no command re-runs it.

### PM runs at `5132249`

The PM ran `pnpm install --frozen-lockfile && pnpm verify` in a fresh clone with `KEEL_DATA_DIR="$(mktemp -d)"`, on Node v24.22.2 and v26.13.0. Every install and verify exited 0. Each run printed eight step lines ending in ` ok`. Core tests were 171 in 16 files, tooling 122 in 10 files, and `git status --porcelain --untracked-files=all | wc -l` printed `0` afterward.

Checked and held, so they need no repeat unless you doubt them:

- `diff schemas/mln-terms/0.1.json schemas/mln-terms/0.2.json` shows `$id`, `title` and the `schema` constant changed, and 65 lines added for `final_valuation`, between `first_call_observation` and `observation_schedule` in `dates.properties`. In `0.2.json`, `$defs.dates.properties.final_valuation` deep-equals `first_call_observation`, and `$defs.dates.required` does not list it.
- The manifest diff is the version line and the two entries, appended at the end of `invalid`. `example-autocall.yaml` gains the four-line term as the last key of `dates`. Each new invalid fixture differs from `minimal.yaml` by the term alone, and the 0.2 one also by line 1.

### PM probes at `5132249`

The PM ran these on Node 24 only, through a temporary test in the scratch clone, then removed it (`git status --porcelain --untracked-files=all | wc -l` printed `0`). They sharpen the questions above. They are not findings: severity and fixes are Pass 1's.

Each input is `minimal.yaml` with `dates.final_valuation` (`primary`, `supplement`) added as the last key of `dates`, and line 1 moved to 0.2, unless the row says otherwise. Results are `[code, path, line, column]` or the flags and summary.

| # | Input | Result |
| --- | --- | --- |
| A | Line 1 `schema: mln-terms/0.2 # c`, term `2031-07-09` | `schema-line` at `schema` 1:1, and `unknown-key` at `dates.final_valuation` 26:3 |
| B | Line 1 `schema: mln-terms/0.2 # c`, no term | `schema-line` only |
| C | Line 1 stays 0.1, term `2031-07-09` | `unknown-key` at `dates.final_valuation` 26:3 |
| D | Duplicate `schema: mln-terms/0.1` key appended, no term | `schema-line` 1:1 and `duplicate-key` at `schema` 97:1 |
| E | Term `2026-12-25` | Loader `dateFlags` `[]`, `termDateFlags` `["exchange-holiday"]`, summary 16 of 17 |
| F | Term `0999-07-09` | Loads; `termDateFlags` `["outside-calendar"]` |
| G | Term `value: null`, `status: unknown` | Loads; no `final_valuation` key in either flag set; summary 15 of 17, listing `dates.final_valuation` |

Also held, rows H to L of the script: a conflict whose second candidate is `2027-02-30` reports `invalid-date` at `dates.final_valuation.candidates[1].value` (H); source `nope` reports `source-missing` at `dates.final_valuation.source` (I); `status: estimate` with no `rule` reports `status-fields` at `dates.final_valuation.rule` (J); `2031-7-09` reports `invalid-date` at `dates.final_valuation.value` (K); a Saturday, `2031-07-12`, flags `weekend` in both sets (L).

On question 1: the PM modelled `sha256Hex` in Python, where each UTF-16 unit becomes its low eight bits, as a `Uint8Array` store does. `0.1.json` has no non-ASCII character. Changing the `i` of `"title"` to U+0169 leaves the modelled digest at `411d100f2dc971e2…` while the file's UTF-8 SHA-256 becomes `c6b5c828ec2b4ca8…`. The PM did not run that edit through the suite. Whether some edit survives the whole suite is the question.

The probe test, for re-running. Put it at `packages/core/src/terms/zz-pm-probe.test.ts`, run `pnpm --filter @keel/core exec vitest run --config vitest.config.mjs src/terms/zz-pm-probe.test.ts`, read `packages/core/probe.txt`, then delete both files:

```ts
import { test } from "vitest";
// @ts-expect-error TS2591
import { writeFileSync } from "node:fs";
import { loadTerms, nyseRulesCalendar, termDateFlags, verificationSummary } from "../index.ts";
import { textOf } from "./fixtures.ts";

const out: string[] = [];
const base = textOf("valid", "minimal.yaml");
const v02 = (t: string) => t.replace("schema: mln-terms/0.1\n", "schema: mln-terms/0.2\n");
const withFv = (t: string, body: string) => t.replace("underlyings:\n", `  final_valuation:\n${body}underlyings:\n`);
const fv = (v: string) => `    value: ${v}\n    status: primary\n    source: supplement\n`;
function show(name: string, text: string) {
  const r = loadTerms(text, "probe.yaml");
  if (!r.ok) {
    out.push(`${name} ERR ${JSON.stringify(r.errors.map((e) => [e.code, e.path, e.line, e.column]))}`);
    return;
  }
  const flags = Object.fromEntries(Object.entries(r.dateFlags).filter(([k]) => k.includes("final")));
  const tflags = Object.fromEntries(Object.entries(termDateFlags(r.terms, nyseRulesCalendar())).filter(([k]) => k.includes("final")));
  const s = verificationSummary(r.terms);
  out.push(`${name} OK ${r.terms.schema} loader=${JSON.stringify(flags)} term=${JSON.stringify(tflags)} ${s.verified}/${s.total} ${JSON.stringify(s.unverified.filter((p) => p.startsWith("dates")))}`);
}
test("pm probes", () => {
  show("A", withFv(base.replace("schema: mln-terms/0.1\n", "schema: mln-terms/0.2 # c\n"), fv("2031-07-09")));
  show("B", base.replace("schema: mln-terms/0.1\n", "schema: mln-terms/0.2 # c\n"));
  show("C", withFv(base, fv("2031-07-09")));
  show("D", v02(base) + "schema: mln-terms/0.1\n");
  show("E", withFv(v02(base), fv("2026-12-25")));
  show("F", withFv(v02(base), fv("0999-07-09")));
  show("G", withFv(v02(base), "    value: null\n    status: unknown\n"));
  show("H", withFv(v02(base), "    status: conflict\n    candidates:\n      - value: 2031-07-09\n        status: primary\n        source: supplement\n      - value: 2027-02-30\n        status: primary\n        source: supplement\n"));
  show("I", withFv(v02(base), "    value: 2031-07-09\n    status: primary\n    source: nope\n"));
  show("J", withFv(v02(base), "    value: 2031-07-09\n    status: estimate\n"));
  show("K", withFv(v02(base), fv("2031-7-09")));
  show("L", withFv(v02(base), fv("2031-07-12")));
  writeFileSync("probe.txt", out.join("\n") + "\n");
});
```

The PM's first run gave the rows longer names; rows A to L are the same twelve inputs, and the PM re-ran this script as printed.

## Build prompt

As the PM wrote it and handed it to Beni on 2026-11-11. Beni has reported no change to it, and the PM cannot see what Cursor received.

```
You are Cursor, the Builder for slice S02.1 of BeniCheni/keel: the final valuation date term and terms schema 0.2.
Set up first. This chat opened in ~/code/keel-s02.1, which Beni created empty for this build. Before you read or run anything else, run pwd and ls -A. pwd must print that folder and ls -A must print nothing; if either fails, stop and tell Beni, and read nothing in that folder. Then run gh repo clone BeniCheni/keel . and confirm that git rev-parse origin/main prints 58845e25f8ebaa65527678aa7d98f8edea515bf0 and git status --porcelain --untracked-files=all prints nothing; if not, stop. Create branch s02.1/final-valuation from it. Never work in ~/code/keel-pm or any other keel checkout. Export KEEL_DATA_DIR="$(mktemp -d)" in every shell invocation, and use synthetic data only.
Then read AGENTS.md in full, before anything else in the repo. It outranks this prompt. If they disagree, stop and report.
Model: Grok 4.7 Extra High, because this slice touches the sensitive paths schemas/** and packages/core/**. Your chat id reads grok-4.7 at every effort, so do not judge the effort from the id. Beni sets Extra High in the picker before he pastes this prompt, and that setting is the evidence of your effort; say so in the PR body. If this chat cannot run at that effort, grok-4.7-xhigh as a sub-agent is authorized as a backup, and the PR body says so. There is no fallback model. If neither is available, stop and escalate. Every seat for this slice is the AGENTS.md default; no ruling moves one.
The build authority is docs/specs/s02.1-final-valuation.md. Build exactly that one slice in one draft PR. Read the spec in full, along with "Rulings from Beni" in docs/reviews/pr-32-pass-1.5.md, where ruling 4 ("Bump to 0.2 (Recommended)") is this slice's, and "Risks and accepted costs" in docs/reviews/pr-32-pass-2.5.md. The 13 open Highs and the ruling 7 list there belong to S03's build, not to this one. Stay out of packages/plugin-mln, tools/reference and fixtures/golden, and out of everything in the spec's non-goals.
Two readings of the spec, by Beni's ruling of 2026-11-11 in the PM's session ("Yes, in the prompt (Recommended)"). First, schemas/mln-terms/0.2.json sets $id, title and the schema constant to mln-terms/0.2; otherwise it is 0.1.json plus dates.final_valuation as the spec defines it. Second, the generator's move to version 2 changes the version line of fixtures/synthetic/terms/manifest.json from 1 to 2; that line and the two new invalid entries are the manifest's whole diff. Update the "version 1" comment in tools/fixtures/registry.mjs to match. State both readings in the PR body. Do not edit the spec: the PM corrects its wording in a later docs PR.
Files that do not change: schemas/mln-terms/0.1.json (AC1), packages/core/src/index.ts and tools/acceptance/test/core-entry.test.mjs (AC9), and schedule.ts, calendar.ts and types.ts in packages/core/src/schedule/ (AC5). Touch no file under docs/, and do not change CHANGELOG.md, README.md or any version; this slice is not a release. README.md line 7 still says the core loads an mln-terms/0.1 file; leave it, and list it in the PR body as a known gap for the PM's docs PR. If the work needs a file outside schemas/mln-terms/0.2.json, packages/core/src/terms/, packages/core/src/schedule/, tools/generators/terms/, tools/fixtures/registry.mjs and fixtures/synthetic/terms/, stop and ask Beni in one word. Add no dependency. loadTerms, dateFlags, verificationSummary and termDateFlags keep their signatures, and their behaviour changes only as the spec says. Core does no I/O: no file system, network, clock or randomness.
The frozen values, the fixture diff and the honesty tests are the contract. If your code and a frozen value disagree, do not change the value, the test or the spec to make them agree: stop and ask Beni in one word.
Existing tests change only where the spec replaces a frozen value. That means S01's verification summaries wherever a test asserts them (total becomes 13 plus the number of members, and a 0.1 file always lists dates.final_valuation as unverified), including terms.honesty.test.ts, terms.review.test.ts and terms.summary.test.ts, and S02's frozen termDateFlags object and the key lists that follow from it in schedule.flags.test.ts. List every changed expected value in the PR body with its old value, its new value and the spec line that sets it. Never remove a test or an assertion, and never weaken, skip or delete an honesty test. Report the honesty test counts at origin/main and at your head with git grep -c -E '^[[:space:]]*(test|it)(\.each\([^)]*\))?\(' <rev> -- '*.honesty.test.ts'; neither count may fall.
AC1 asks that 0.1.json stay byte-identical to origin/main's. So that the test does not depend on what CI has fetched, pin in the test the SHA-256 that git show origin/main:schemas/mln-terms/0.1.json | shasum -a 256 prints, and show git diff --exit-code origin/main...HEAD -- schemas/mln-terms/0.1.json exiting 0 in the PR body.
This slice carries two items owed to the next slice that touches packages/core: Medium 2.5-1 from PR #30's Pass 2.5, which AC6 closes, and idea 29, which AC7 pins. The PR body shows each narrowed glob of AC6 and each mutant of AC7 failing its test.
Fixtures are generated by seed, never hand-typed. After pnpm fixtures:regen, git status --porcelain --untracked-files=all -- fixtures prints nothing, on both Nodes. git diff --numstat origin/main...HEAD -- fixtures/synthetic/terms/valid shows example-autocall.yaml with 5 lines added and 1 removed, and nothing else.
Meet the spec's Mutation floor: at least three killed mutants per claim, including every mutant it lists by name and each boundary. For each mutant, the PR body gives the exact change as a patch or a one-line command, the command that runs the suite, and the test that fails. Run every one in this session. On PR #30 the AC8 row claimed kills that 11 mutants of honesty-guarded behaviour survived, so a survivor is reported as a survivor, never as a kill. A surviving mutant on a boundary is a High.
Git. Set the author per commit with git -c user.name=Cursor -c user.email=cursoragent@cursor.com commit, never as Beni. Never force-push. Open a draft PR on branch s02.1/final-valuation after the first commit. Every commit is green: push the next commit only after CI is green on the last one. Before each push, run pnpm install --frozen-lockfile && pnpm verify on Node 24.22.2 and 26.13.0, reading each command's own exit code.
PR body. List every claim with its reproducing command, as in S00, and state each acceptance criterion from AC1 to AC10 with its result. Every figure comes from a command you ran in this session. Absolute words are claims to test. Name the sensitive paths touched, state that no dependency was added, and state that this slice changes the terms schema (0.2) without a release. The PM copies your claims into a sealed appendix, so make each one checkable as written.
Privacy. Never open the owner's data folder or anything under ~/.keel-spike/ or ~/.config/keel/. No personal data, real market data or real documents go in code, tests, commits, the PR or comments. Product text, loader messages included, explains mechanics only and passes the copy rules in AGENTS.md.
Stop and escalate to Beni, as a question answerable in one word, on anything AGENTS.md lists: a dependency the work needs, a claim you cannot re-run, a privacy issue, or this prompt disagreeing with that file or with the spec beyond the two readings above.
You review nothing you built, and you merge nothing. When the slice is complete and CI is green on the last commit, leave the PR in draft, report the PR link and head SHA, and stop.
```
