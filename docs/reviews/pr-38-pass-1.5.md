# Pass 1.5 brief: PR #38

Written by the PM on 2026-11-13 (America/New_York). It follows Pass 1's comment ([issuecomment-6840781376](https://github.com/BeniCheni/keel/pull/38#issuecomment-6840781376), posted 2026-11-12 at 20:11 EST; reviewed head `e29d9ff`, post-fix head `d052141`) and Beni's two rulings below. Like the Pass 0 brief, it lives on branch `docs/pr-38-records`, so that no PM commit enters PR #38. Codex receives this brief for Pass 2.

Pass 1's verdict is not mergeable, with one open High. This seat accepts all 14 findings and contests none. Finding 1, the open High, now has Beni's ruling. It is a patch to one return, not a redesign, so it goes to Codex at Pass 2 rather than back to Cursor. Finding 10 is a defect in the spec, not in the build; Beni's ruling settles it with no code change. Nothing goes to Cursor as rework.

## Seat for Pass 2

Codex, GPT-6.1 Sol Extra High, because `packages/plugin-mln/**` and `fixtures/golden/**` are sensitive paths. The seat has no fallback: if that model is unavailable, stop and escalate. If the chat reaches the model only through a sub-agent, that sub-agent gets the whole prompt word for word and does all the reading and running, and the comment says so.

By Beni's ruling 2 of 2026-11-10 ("Codex at Pass 2 (Recommended)"), Codex writes `tools/reference/payoff.py` from the spec before it reads anything under `packages/plugin-mln/` or `tools/generators/golden/`. This brief names engine functions and code lines. So Codex writes the reference before reading this brief, Pass 1's comment or the Pass 0 brief's appendix. The prompt carries the two rulings the reference needs: check 2's order, and ruling A below.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | High | Accept | Reproduced at `d052141` on both Nodes with Pass 1's `live-forever.mjs`: `live`, 18 rows, `next` null, `reasons` empty on all six dates, 2036-01-02 included. The PM also reached it with an estimated schedule (appendix, `probe-estimated.mjs`). The Status rule says `live` comes "with `next` set", and no rule covers events running out with no final event. Beni's ruling A settles it. The fix is the return at the end of `runEvaluation`, so Codex makes it at Pass 2, with the tests listed under What Pass 2 does | no |
| 2 | High | Accept | Reproduced: with an impure `src/x.js` planted, the purity file passes at `e29d9ff` (exit 0, 75 passed) and fails at `d052141` (exit 1, 3 of 81 failed). Closed by `0f9d20d`, subject to Codex's cold read. Core's purity test has the same listing defect (`packages/core/src/schedule/schedule.purity.test.ts:248`), outside this slice; the PM carries it | no |
| 3 | High, surviving mutants on boundaries | Accept | Reproduced for B-MB7 and B-CH1: each passes the plugin suite at `e29d9ff` (172 passed) and fails at `d052141`, B-MB7 three tests and B-CH1 one. The engine was right; only the tests were missing. Closed by `758d482`, subject to Codex's cold read. The PM ran two of the eight, so Codex runs the rest | no |
| 4 | Medium, surviving mutants on honesty rules | Accept | Reproduced for B-EV1: passes at `e29d9ff` and fails one test at `d052141`. Closed by `ac64233`. No honesty test is weakened: `ac64233` is the only one of the eight to touch `payoff.honesty.test.ts`. It adds tests, and its one changed test is stronger. That test asserted nothing when the result was not an evaluation; it now requires an evaluation with status `unknown` (`git diff e29d9ff d052141 -- packages/plugin-mln/src/payoff.honesty.test.ts`) | no |
| 5 | Medium, surviving mutants off a boundary | Accept | Not re-run by the PM. Codex samples the 25 at the head | no |
| 6 | Medium | Accept | Reproduced: with the plugin's line removed from the `tests` step, the tooling suite passes at `e29d9ff` (122 passed) and fails one test at `d052141`. Closed by `6384d3a` | no |
| 7 | Medium | Accept | Reproduced: B-VP7 (`pushClose` skips `drawAllowed`) passes the plugin and tooling suites at both SHAs. The guard re-checks the same value 64 times, where the spec says it "draws that value again". No value is rejected today, so no fixture is wrong, but the guard cannot do what the spec says. Codex fixes it at Pass 2 if the redraw fits at the draw site with every golden byte unchanged, with a test that B-VP7 fails. If it needs more than that, Codex leaves it and says so, and the PM carries it as an idea | no |
| 8 | Medium | Accept the throw | Reproduced: restoring `e29d9ff`'s block in `resolveMember` at `d052141` fails exactly the new test (1 of 204). The engine already throws when terms that passed its checks still do not solve (`engine.ts:107`, "terms did not solve"). The loader refuses such a level, so only a hand-built `Terms` reaches it, and a throw needs no API change. The spec's Public API states no input contract. The next docs PR adds one: the functions take terms that a successful `loadTerms` returned, and other input may throw. Codex may contest | no |
| 9 | Medium | Accept | Not re-run by the PM. Closed by `d052141`; Codex checks C-AC7 and C-AC7b | no |
| 10 | Medium, defect in the spec | Accept | Reproduced at `d052141` on both Nodes with Pass 1's `spec-bullets.mjs`. With the term absent, the result is `live` with `next` at index 16 on 2030-06-04, then `unknown` with `final-valuation-absent` on 2030-09-03, 2031-03-03 and 2040-01-01; with the term `unknown`, on 2030-09-03, it is `final-valuation-unknown`. It is never `date-unknown`. Beni's ruling B: the bullet is reworded to keep the final valuation term known, which is what the landed tests do, and Events stays as written. H5 closes with the tests as landed. The spec edit goes in the next docs PR | no |
| 11 | Low | Accept | Reproduced: L with item 18 an `estimate` on 2031-03-03 gives `matured`, 19 rows, 142500, because item 18's date is the final valuation date and its status comes from the term. The bullet's wording goes in the next docs PR. Codex may add a one-line comment where the test skips item 18; otherwise the PM carries it | no |
| 12 | Low | Accept; no change | The PR body is the builder's, and none of the five points changes a result. Pass 1's comment gives every mutant as an exact change, and Pass 2 works from those | no |
| 13 | Low | Accept; no change required | No row reaches the fallback today. Codex may narrow it while making finding 1's fix if it agrees; otherwise the PM carries it to the ideas list | no |
| 14 | Low, process | Accept | The build prompt said to stop on a spec rule that cannot be met as written. Cursor changed the test and reported it in the PR body instead. The PM records it, and the next build prompt repeats the stop rule next to its list of the spec's honesty bullets | no |

Pass 1 also found one of the PM's own Pass 0 reads wrong. The Pass 0 brief said the grep "finds `Math.floor` only in `dates.ts`". It finds 18 lines: 16 in `dates.ts` (14 `Math.floor`, one `Math.min`, one `Math.abs`) and two `Number(` in `fraction.ts`. The PM corrected the Pass 0 brief in the same commit as this one. Pass 1's check 7 found no floating-point step in any result.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD` at `d052141`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `e29d9ff` feat(plugin-mln): pay a worst-of autocall from evidenced terms | Cursor | Claude Code, Pass 1 (done) |
| `0f9d20d` test(plugin-mln): let the purity file listing fail on a file that is not .ts | Claude | Codex, Pass 2 |
| `758d482` test(plugin-mln): pin the boundaries no test sat on | Claude | Codex, Pass 2 |
| `ac64233` test(plugin-mln): cover the honesty rules a mutant could break unseen | Claude | Codex, Pass 2 |
| `da5631e` test(plugin-mln): test the checks and listed paths that no test read | Claude | Codex, Pass 2 |
| `6384d3a` test(tooling): fail when the plugin drops out of the typecheck or tests step | Claude | Codex, Pass 2 |
| `3553ee7` test(plugin-mln): count the generator's draws and hold its scan in regen | Claude | Codex, Pass 2 |
| `3a69eca` fix(plugin-mln): stop on an initial level with no ratio instead of leaving the member out | Claude | Codex, Pass 2 |
| `d052141` test(plugin-mln): draw and count the trailing undated evaluations | Claude | Codex, Pass 2 |

`git diff e29d9ff d052141` is all eight. Codex's reference file and any Codex fix get their cold read from the fresh Claude session at Pass 2.5. This PM session wrote the spec, the build prompt and these briefs, and it takes no review pass on this PR.

## Rulings from Beni

Carried from Pass 0: rulings 1, 2, 3, 5, 6 and 7 from PR #32, by its numbers; check 2's order, "In its path's place (Recommended)", 2026-11-12 at 14:29 EST; and the picker answer "Yes!", 2026-11-12 at 15:35 EST. The Pass 0 brief quotes each.

New on 2026-11-13, in the PM's session. The PM recorded the time, 12:28 EST, right after the answers.

- **A. The run-out, "Yes (Recommended)".** The question: "PR #38's open High: when the final valuation date is in conflict and every listed observation comes before both candidate dates, the engine reports `live` with no next event forever, even after maturity. Should the status become `unknown` with reason `final-valuation-conflict` as soon as the observations run out?" The option read: "Pass 1's proposal. From the last row's date on, the status is `unknown` with `final-valuation-conflict`. This adds one case to Status, and Codex fixes it at Pass 2 with a test that fails without it." The alternative Beni declined kept `live` with a `final` next event of no date until the earlier candidate.
- **B. The undated-item bullet, "Reword it (Recommended)".** The question: "The S03 spec's honesty bullet 'An undated item bounds the status' (term absent, trailing undated item gives `date-unknown`) cannot be met as written: with the term absent, evaluation stops earlier, at the last dated item, with `final-valuation-absent`. How should it be fixed?" The option read: "Reword the bullet to keep the final valuation term known, which is what the landed test does. Events stays as written. The spec edit lands in the docs PR after S03 merges, as PR #37 did for S02.1." The alternative Beni declined changed Events so that a later undated item shows an earlier item is a call.

**Ruling A as a rule, from the code's conditions.** When evaluation has taken every event without stopping, and the final valuation term is not known, the status is `unknown`, `next` is `null`, `payoutCents` is `null`, and `reasons` holds the term's reason. Only a conflict reaches this today:
- With the term known, the final event comes last. Evaluation either stops at it or makes it a row. After that row the status is `final-fixed` or `matured`, unless the row is `unknown`, which has already stopped evaluation.
- With the term absent or unknown, the last event is never a call event. A listed schedule's last item has no later item, and an estimated schedule's entries all have unknown role. So Rows step 1, 2 or 3 stops evaluation at it.
- A schedule always has an entry. A listed one has at least one item (`minItems` 1 in `schemas/mln-terms/0.2.json`). An estimated one starts its entries with the stated first call observation, and is `unavailable` with `anchor-after-maturity` when that date falls after maturity (`packages/core/src/schedule/schedule.ts:76-87`; appendix, `probe-empty.mjs`).

On the last row's own date the status is already `unknown`. Under the term known, that same date gives `live` with the final event as `next`.

## Known gaps for the next ordinary docs PR

Cite these rather than raising them as new:

- The S03 spec: ruling A's case under Status; ruling B's rewording of the undated-item bullet; finding 11's wording of the planning-date bullet for L's item 18; finding 8's input contract under Public API; and check 2's order as the ruling of 2026-11-12 states it.
- The README quickstart names only `@keel/core`'s tests, and its status line predates the engine (Pass 1, Deliberately not done).
- `docs/README.md`'s row for PR #37 still says "in review"; the next records or docs PR gives its merge line.
- Ideas from Pass 1: core's purity listing defect (a `packages/core` PR of its own); a listed first item that differs from the stated first call observation with no finding; `live` for an `asOf` before the trade date; finding 7 if Codex leaves it; finding 13 if Codex leaves it.

## What Pass 2 does

1. **Pass M first.** Write `tools/reference/payoff.py` from the spec, check 2's order and ruling A, before reading anything under `packages/plugin-mln/` or `tools/generators/golden/`, this brief past this list, Pass 1's comment or the Pass 0 appendix. Run it on `fixtures/golden/` and on the spec's two controls, and report all three runs. Any disagreement is High until Beni adjudicates.
2. **Cold-read the eight Claude commits.** `git diff e29d9ff d052141`. Seven add tests. `3a69eca` changes `resolveMember` in `engine.ts`.
3. **Reproduce or disprove each row above.** Contest any disposition you disagree with, finding 8's throw in particular; the PM takes a contest to Beni.
4. **Fix finding 1 under ruling A.** Give it tests that fail without the fix:
   - Pass 1's listed case: `unknown` with `final-valuation-conflict` on the last row's date, at maturity and after it; `live` with `next` set on the day before the last row.
   - An estimated-schedule case like `probe-estimated.mjs` below, from a terms file the loader accepts if one can be written.
   - An honesty test under "Final valuation date not known": no `live` result without `next`, in every golden case and every property case.
   - AC7's generator drawing conflicting terms.
   If regeneration changes any golden byte, say which and why in the comment.
5. **Finding 7**, as its row says.
6. **Your own read** of the whole PR at the head. Check the mutation floor per claim, using the PR body's rows and Pass 1's exact changes, and run a sample on Node 26.13.0.
7. **The owner's private-list check**, counts only, with a readable-file precheck and a nonzero exit on a failed scan, over the diff, every commit message in `origin/main..HEAD`, the PR title and body, and every comment, your own included. No Claude seat ran it.
8. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50. Any fix follows the skill: reproduce it first, and give each behaviour fix a test that fails without it.

## Sealed appendix for Pass 2

Pass 1's findings and fixes are suspicions to re-derive, not conclusions, and so are this brief's dispositions. Do your own read before opening this.

The PM's runs, in a fresh clone at `d052141027e005758440f60c781998f03125e01a`, with a fresh `mktemp -d` as `KEEL_DATA_DIR`:

| Check | Command | Result |
| --- | --- | --- |
| Install and verify | `pnpm install --frozen-lockfile`, `pnpm verify`, on v24.22.2 and v26.13.0 | Exit 0 for each. Core 178, plugin 204, tooling 123, eight steps ok, status clean |
| CI | `gh run list --repo BeniCheni/keel --commit d052141027e005758440f60c781998f03125e01a --json databaseId,event,conclusion,attempt` | Run 43342392712, `pull_request`, success, attempt 1 |
| Authors | `git log --format='%h %an <%ae>' origin/main..HEAD` | Eight commits Claude `<noreply@anthropic.com>`, then `e29d9ff` Cursor `<cursoragent@cursor.com>` |
| Diff of the fixes | `git diff --stat e29d9ff HEAD` | 7 files, 646 insertions, 47 deletions: `engine.ts`, five plugin test files, `tools/acceptance/test/verify-runner.test.mjs` |
| Finding 1, listed | Pass 1's `live-forever.mjs`, on both Nodes | `loads: true`, then `evaluated live rows 18 next null reasons []` on 2030-12-02, 2030-12-03, 2031-02-26, 2031-03-03, 2031-03-04 and 2036-01-02 |
| Finding 1, estimated | `probe-estimated.mjs` below, Node v24.22.2 | One entry, 2026-09-01. On 2026-08-31, `live` with `next` that entry; on 2026-09-01, 2026-09-14, 2026-09-15 and 2027-01-04, `live`, 1 row, `next` null |
| Ruling A's reach | `probe-empty.mjs` below, Node v24.22.2 | The first call moved to 2031-03-04, 2031-06-02 or 2035-01-02: `unavailable`, `schedule-unavailable` with `anchor-after-maturity` |
| Findings 10 and 11 | Pass 1's `spec-bullets.mjs`, on both Nodes | As finding 10's and 11's rows above, identical on both Nodes |
| Float-prone calls | `git grep -h -o -E 'parseFloat\|parseInt\|toFixed\|Number\(\|Math\.[a-z]+' e29d9ff -- packages/plugin-mln/src ':!*.test.ts' ':!**/test-support/**' \| sort \| uniq -c` | 14 `Math.floor`, 1 `Math.min`, 1 `Math.abs`, 2 `Number(` |

The PM's mutant sample, on Node v24.22.2, each one exact edit with the file restored after it, and `git status --porcelain --untracked-files=all` empty at the end at both SHAs:

| Mutant | At `e29d9ff` | At `d052141` |
| --- | --- | --- |
| B-MB7, the final row on the unrounded ratio | Exit 0, 172 passed | Exit 1, 3 failed: `the final row pays one-for-one on the rounded ratio`, `the final row rounds the ratio before the barrier test`, `the final row rounds the ratio before the call test` |
| B-CH1, a first call on settlement accepted | Exit 0, 172 passed | Exit 1, 1 failed: `a first call on the settlement date is unavailable` |
| B-EV1, `user` dates not evidence | Exit 0, 172 passed | Exit 1, 1 failed: `a document, advisor or user date is evidence` |
| `3a69eca`'s block reverted | Not applicable | Exit 1, 1 failed: `an initial level the loader would refuse stops the call instead of leaving the member out` |
| B-VP7, no redraw guard | Plugin exit 0, 172 passed; tooling exit 0, 122 passed | Plugin exit 0, 204 passed; tooling exit 0, 123 passed |
| The plugin's `tests` line removed from `tools/verify/steps.mjs` | Tooling exit 0, 122 passed | Tooling exit 1, 1 failed: `a failure in the plugin alone fails the tests step and the typecheck step` |
| An impure `src/x.js` planted | Purity file exit 0, 75 passed | Purity file exit 1, 3 of 81 failed |

The driver. Run it as `python3 -I mutants.py <clone>` from outside the clone, after `pnpm install --frozen-lockfile`:

```python
# Applies one exact-string mutation at a time in a clone, runs the named suite, records exit and failing tests, restores.
import json, subprocess, sys, re, os
clone = sys.argv[1]
ENGINE = "packages/plugin-mln/src/engine.ts"
NEW_INIT = '''    if (initialFrac === null || initialFrac.p === 0n) throw new Error("initial level did not solve");
    if (closeFrac === null) throw new Error("close did not solve");
    raw = divFrac(closeFrac, initialFrac);
    rounded = roundRatio(raw, rounding);
    ratio = formatRatio(rounded);
'''
OLD_INIT = '''    if (initialFrac !== null && closeFrac !== null && initialFrac.p !== 0n) {
      raw = divFrac(closeFrac, initialFrac);
      rounded = roundRatio(raw, rounding);
      ratio = formatRatio(rounded);
    }
'''
M = [
 ("B-MB7 final row on the unrounded ratio", ENGINE, "settleFinal(best.rounded, best.raw,", "settleFinal(best.raw, best.raw,", "plugin"),
 ("B-CH1 first call on settlement accepted", "packages/plugin-mln/src/events.ts", "firstOrder !== null && firstOrder <= 0", "firstOrder !== null && firstOrder < 0", "plugin"),
 ("B-EV1 user dates not evidence", "packages/plugin-mln/src/read.ts", '"advisor", "user"]', '"advisor"]', "plugin"),
 ("3a69eca reverted", ENGINE, NEW_INIT, OLD_INIT, "plugin"),
 ("B-VP7 no redraw guard", "tools/generators/golden/generate.mjs", "const value = fixed ? close.value : drawAllowed(caseId, () => close.value);", "const value = close.value;", "both"),
 ("Plugin dropped from the tests step", "tools/verify/steps.mjs", '        run("pnpm", ["--filter", "@keel/plugin-mln", "test"]),\n', "", "tooling"),
]
SUITES = {
 "plugin": [["pnpm", "--filter", "@keel/plugin-mln", "exec", "vitest", "run", "--config", "vitest.config.mjs"]],
 "tooling": [["pnpm", "test:tooling"]],
}
SUITES["both"] = SUITES["plugin"] + SUITES["tooling"]
def run(cmds):
    res = []
    for c in cmds:
        r = subprocess.run(c, cwd=clone, capture_output=True, text=True)
        log = r.stdout + r.stderr
        failed = sorted(set(re.findall(r"(?:FAIL|×)\s+\S+\.test\.\S+\s*>\s*(.+?)(?:\s+\d+ms)?$", log, re.M)))
        summary = re.findall(r"^\s+Tests\s+(.+)$", log, re.M)
        res.append({"cmd": " ".join(c[:3]), "exit": r.returncode, "tests": summary[-1].strip() if summary else None, "failed": failed[:4]})
    return res
out = []
for name, rel, a, b, suite in M:
    path = f"{clone}/{rel}"
    text = open(path, encoding="utf-8").read()
    n = text.count(a)
    if n != 1:
        out.append({"mutant": name, "error": f"anchor count {n}"}); continue
    open(path, "w", encoding="utf-8").write(text.replace(a, b))
    try:
        out.append({"mutant": name, "runs": run(SUITES[suite])})
    finally:
        subprocess.run(["git", "checkout", "--", rel], cwd=clone, check=True)
# Finding 2: an impure .js file under src/ against the purity test.
plant = f"{clone}/packages/plugin-mln/src/x.js"
open(plant, "w").write("export const now = Date.now();\nconsole.log(Math.random());\n")
try:
    out.append({"mutant": "Finding 2 plant src/x.js", "runs": run([["pnpm", "--filter", "@keel/plugin-mln", "exec", "vitest", "run", "--config", "vitest.config.mjs", "payoff.purity"]])})
finally:
    os.remove(plant)
status = subprocess.run(["git", "status", "--porcelain", "--untracked-files=all"], cwd=clone, capture_output=True, text=True).stdout
out.append({"head": subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=clone, capture_output=True, text=True).stdout.strip(), "status_lines_after": len(status.splitlines())})
print(json.dumps(out, indent=1, ensure_ascii=True))
```

At `e29d9ff` the `3a69eca` row reports `anchor count 0`, because the block it reverts does not exist yet.

`probe-estimated.mjs`, run as `node probe-estimated.mjs <clone>`. It edits a loaded `Terms` object, so whether the loader accepts the same terms as a file is open:

```js
// The run-out under a conflicting term with an estimated schedule of one entry: maturity moved to 2026-09-15.
import { readFileSync } from "node:fs";
const ROOT = process.argv[2];
const { loadTerms, nyseRulesCalendar, observationSchedule } = await import(`${ROOT}/packages/core/src/index.ts`);
const { evaluateNote } = await import(`${ROOT}/packages/plugin-mln/src/index.ts`);
const cal = nyseRulesCalendar();
const text = readFileSync(`${ROOT}/fixtures/synthetic/terms/valid/minimal.yaml`, "utf8").replace("mln-terms/0.1", "mln-terms/0.2");
const t = structuredClone(loadTerms(text, "b.yaml").terms);
t.dates.maturity = { ...t.dates.maturity, value: "2026-09-15" };
const p = (value) => ({ value, status: "primary", source: "supplement" });
t.dates.final_valuation = { value: null, status: "conflict", candidates: [p("2026-09-10"), p("2026-09-14")] };
const s = observationSchedule(t, cal);
console.log("schedule", s.kind, "entries", s.entries.length, JSON.stringify(s.entries.map((e) => e.date)));
const low = { ALFA: "60.15", BRVO: "48.3", CHRL: "72", DLTA: "57.075" };
const closes = Object.entries(low).map(([ticker, value]) => ({ ticker, date: "2026-09-01", value, source: "synthetic-close" }));
for (const asOf of ["2026-08-31", "2026-09-01", "2026-09-14", "2026-09-15", "2027-01-04"]) {
  const r = evaluateNote(t, cal, closes, asOf);
  console.log(asOf, r.kind, r.status ?? "", "rows", r.rows?.length, "next", JSON.stringify(r.next ?? null), "reasons", JSON.stringify(r.reasons));
}
```

`probe-empty.mjs`, run the same way:

```js
// Can an estimated schedule be empty, so that evaluateNote's loop has no event at all?
import { readFileSync } from "node:fs";
const ROOT = process.argv[2];
const { loadTerms, nyseRulesCalendar, observationSchedule } = await import(`${ROOT}/packages/core/src/index.ts`);
const { evaluateNote } = await import(`${ROOT}/packages/plugin-mln/src/index.ts`);
const cal = nyseRulesCalendar();
const text = readFileSync(`${ROOT}/fixtures/synthetic/terms/valid/minimal.yaml`, "utf8").replace("mln-terms/0.1", "mln-terms/0.2");
const base = loadTerms(text, "b.yaml").terms;
console.log("maturity", JSON.stringify(base.dates.maturity.value), "first call", JSON.stringify(base.dates.first_call_observation.value), "schedule kind", observationSchedule(base, cal).kind, "entries", observationSchedule(base, cal).entries?.length);
for (const first of ["2031-03-04", "2031-06-02", "2035-01-02"]) {
  const t = structuredClone(base); t.dates.first_call_observation = { ...t.dates.first_call_observation, value: first };
  const s = observationSchedule(t, cal);
  const r = evaluateNote(t, cal, [], "2036-01-02");
  console.log(first, "schedule", s.kind, "entries", s.entries?.length ?? null, "->", r.kind, r.status ?? "", JSON.stringify(r.next ?? null), JSON.stringify(r.reasons).slice(0, 200));
}
```

On the base terms it prints maturity 2031-03-03, first call 2026-09-01, an estimated schedule of 19 entries, then the three `unavailable` lines.

## Pass 2's stop and ruling C

Pass 2 stopped on 2026-11-13 before posting a comment, on a Pass M disagreement, and Beni relayed it to the PM's session. By then Codex had pushed two commits: `3e48b83`, the reference `tools/reference/payoff.py`, and `f24e2f3`, the fix for finding 1. `f24e2f3` also rewrote `nearestSlot` and `wholeMonthOffset` in `events.ts` and the generator's draw site. CI run 43479598734 at `f24e2f3` is `success` on all four cells and the `verify` job (`gh run view 43479598734 --repo BeniCheni/keel --json conclusion,jobs`).

The disputed case, reproduced by the PM on Node v24.22.2 with `case.mjs` and `ref.py` below. It uses g01's terms with monthly calls, trade 9999-05-28, settlement 9999-06-01, first call 9999-12-01, and final valuation and maturity 9999-12-31. The estimated schedule has one entry, 9999-12-01, so `k` is 1. The final valuation date is 30 days from slot 0 (9999-12-01) and one day from slot 1 (10000-01-01).

| Run | `payoutSchedule` result |
| --- | --- |
| Engine at `d052141` | `unavailable`: `non-call-months-mismatch`, `final-valuation-off-cycle` |
| Engine at `f24e2f3` | `payouts`: one call at 9999-12-01, 6 months, 104250; final 9999-12-31, 7 months, `aboveCallCents` 104958 |
| Reference at `f24e2f3` | `unavailable`: `final-valuation-off-cycle` |

Settlement to first call is exactly six months, so `d052141`'s `non-call-months-mismatch` was wrong. Its month-by-month search gives up once a cursor passes year 9999: `daysApart("10000-01-01", "9999-12-01")` is `null` there, so `wholeMonthOffset("9999-06-01", "9999-12-01")` and `nearestSlot("9999-12-01", 1, "9999-12-31")` both return `null`. The reference and `f24e2f3` agree there is no mismatch. The only point in dispute is whether 10000-01-01 counts as a slot. The reference leaves out every slot in year 10000 or later (`... + slot * step < 120_000` in `nearest_slot`).

**C. Slots past 9999, "Yes, it counts (Recommended)".** Given in the PM's session; the PM recorded the time, 13:20 EST, right after the answer. The question: "PR #38 Pass M disagreement. Terms with monthly calls, first call 9999-12-01, and final valuation 9999-12-31: the final date's nearest cycle slot is 10000-01-01, one day away, which is slot 1 (on-cycle). The engine counts that slot and pays 104,958 cents (7 premium months); Codex's Python reference drops slots in year 10000 and says `final-valuation-off-cycle`. Does a cycle slot past 9999-12-31 count?" The option read: "Slots are cycle dates with no year limit, as Decision 6 says the cycle alone sets 'nearest'. The engine's 104,958 stands. Codex fixes the reference to compute those slots, adds the case as an engine test, and reruns Pass M." The alternative Beni declined dropped such slots and made the case `unavailable`.

So the engine's answer at `f24e2f3` stands. Codex amends the reference's slot arithmetic only, and says in its comment that it made this amendment after reading the engine, by ruling C. It adds this case as an engine test that a slot cap at year 9999 fails, and reruns Pass M. The next docs PR adds one sentence to Decision 6: a cycle slot may fall after 9999-12-31.

`case.mjs`, run as `node case.mjs <clone> [case.json]`:

```js
// The year-9999 case: monthly calls, first call 9999-12-01, final valuation and maturity 9999-12-31.
// Prints the engine's payoutSchedule result and writes the reference's input to argv[3].
import { readFileSync, writeFileSync } from "node:fs";
const ROOT = process.argv[2];
const { loadTerms, nyseRulesCalendar, observationSchedule } = await import(`${ROOT}/packages/core/src/index.ts`);
const { payoutSchedule } = await import(`${ROOT}/packages/plugin-mln/src/index.ts`);
const cal = nyseRulesCalendar();
const yaml = readFileSync(`${ROOT}/fixtures/golden/g01-called-first/terms.yaml`, "utf8")
  .replace('"2026-03-02"', '"9999-05-28"').replace('"2026-03-04"', '"9999-06-01"')
  .replace('"2026-09-01"', '"9999-12-01"').replace('"2031-02-26"', '"9999-12-31"')
  .replace('"2031-03-03"', '"9999-12-31"').replace('value: "quarterly"', 'value: "monthly"');
const loaded = loadTerms(yaml, "y9999.yaml");
if (!loaded.ok) { console.log("loads: false", JSON.stringify(loaded.errors)); process.exit(1); }
const schedule = observationSchedule(loaded.terms, cal);
console.log("loads: true; schedule", schedule.kind, JSON.stringify(schedule.entries?.map((e) => e.date) ?? schedule.reasons));
const pay = payoutSchedule(loaded.terms, cal);
console.log("engine:", JSON.stringify(pay.kind === "payouts" ? { final: pay.final, calls: pay.calls.map((c) => [c.date, c.premiumMonths, c.payoutCents]) } : pay));
if (process.argv[3]) writeFileSync(process.argv[3], JSON.stringify({ calendar: "nyse-rules-1", terms: loaded.terms, schedule }));
```

`ref.py`, run as `python3 -I ref.py <clone> case.json`:

```python
# Runs the PR's Pass M reference payout_schedule on the case JSON. Usage: python3 -I ref.py <clone> <case.json>
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location("payoff_ref", f"{sys.argv[1]}/tools/reference/payoff.py")
ref = importlib.util.module_from_spec(spec); spec.loader.exec_module(ref)
data = json.load(open(sys.argv[2], encoding="utf-8"))
r = ref.payout_schedule(data)
print("reference:", json.dumps({"final": r["final"], "calls": [[c["date"], c["premiumMonths"], c["payoutCents"]] for c in r["calls"]]} if r.get("kind") == "payouts" else r))
```

`old-null.mjs` prints `[null,null,null]` at `d052141` and `[null,6,1]` at `f24e2f3`:

```js
// The old engine's month search past year 9999. Run as node old-null.mjs <clone at d052141>.
const d = await import(`${process.argv[2]}/packages/plugin-mln/src/dates.ts`);
const e = await import(`${process.argv[2]}/packages/plugin-mln/src/events.ts`);
console.log(JSON.stringify([d.daysApart("10000-01-01", "9999-12-01"), e.wholeMonthOffset("9999-06-01", "9999-12-01"), e.nearestSlot("9999-12-01", 1, "9999-12-31")]));
```

### Authorship since Pass 1

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `3e48b83` Add independent S03 payoff reference for Pass M | Codex | Claude, Pass 2.5, fresh session |
| `f24e2f3` Bound S03 evaluation when evidenced observations run out | Codex | Claude, Pass 2.5, fresh session |
