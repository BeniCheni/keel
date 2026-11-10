# Executive brief: PR #30, Pass 2.5, 2026-11-09 America/New_York

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim.

## Decision

Shadow mode: the gate says "would escalate" because `packages/core/**` is a sensitive path; Beni merges. The formal verdict is **mergeable**: every High is closed, finding 5 by Beni's written confirmation in this session. No other gate clause fails.

- **Head reviewed:** `f6a21c144a9ce2510c550d6cec6f3dc0a659d64d`, taken from `gh pr view 30 --repo BeniCheni/keel --json headRefOid`. The clone's `git rev-parse HEAD` matched and `git status --porcelain --untracked-files=all` printed 0 lines at the start, before the comment was posted, and at the end.
- **Seat:** Claude, fresh session, Fable 5.2 (`claude-fable-5-2`), effort High as assigned; the session does not show its effort, so that is reported, not read.
- **Model pin:** `AGENTS.md` pins this seat to Fable 5.1 High with fallback Opus 5.5 High, and the prompt seated Fable 5.2. I stopped and asked. Beni answered "Yes" to "Do you rule that Fable 5.2 High holds the Pass 2.5 seat for PR #30?". This is an owner ruling against the pin, for this PR only, not the fallback.
- **Comment:** [issuecomment-6755531584](https://github.com/BeniCheni/keel/pull/30#issuecomment-6755531584), posted 19:42 EST.
- **This session wrote** no commit, no push, no merge and no review record.

## What ships

- keel can say which dates a note observes on. Listed dates are shown as listed, in file order; an unknown or conflicting item carries no date, and a conflict keeps every candidate.
- When the terms list none, keel generates dates from the stated first call observation, moves closed days to the next open day, and tags each one ESTIMATE with the rule and the calendar it used.
- The calendar is built from fixed rules for NYSE, 2026 to 2060, with no fetch and no dependency. A date outside those years is flagged and is not reported as an open day.
- When an input is unknown, in conflict or invalid, or a generated date leaves the calendar, keel returns no schedule and gives the reason. There is no partial schedule.
- keel still declines to claim:
  - the final valuation date;
  - any unscheduled closure or half day;
  - that one NYSE calendar fits every underlying;
  - any payoff, value or probability.

## What the passes found

**Pass 1** (Claude Code, [issuecomment-6746624951](https://github.com/BeniCheni/keel/pull/30#issuecomment-6746624951), reviewed `0f9b5fc`, pushed `25084c4`, `415be36`, `ab33165`):

1. High, continues PR #28's Pass 1 finding 1: AC10's three absolutes did not hold (specifier forms, non-ASCII whitespace, a non-recursive glob). Fixed in `25084c4`.
2. High: the lower edge of calendar coverage had no test. Fixed in `ab33165`.
3. Medium: dates compared as text broke below year 1000 and past 9999. Fixed in `415be36`.
4. Medium: 14 more mutants passed every test. Fixed in `ab33165`.
5. Medium as filed: the PR body's AC8 row was untrue. Not fixed by Pass 1.
6. Low: the runtime half of AC10 ran none of the listed paths.
7. Low: `samples.ts` is test support under a non-test name.
8. Low: `index.test.ts` pins the runner's key order.
9. Low: guards no input reaches.
10. Low: AC7's oracle is the code under test.

**Pass 1.5** (PM): accepted all ten. It disputed that finding 1 closed at `ab33165`, because the glob limb had no committed control, and it raised finding 5 to High, outside tracked files.

**Pass 2** (Codex, [issuecomment-6749892420](https://github.com/BeniCheni/keel/pull/30#issuecomment-6749892420)):

- Accepted all ten, including the PM's closure condition and the raised severity.
- Pushed `f6a21c1`: the glob control and a fourth runtime case.
- Stated that finding 1 and PR #28's finding closed there.
- Pass M: N/A.
- Codex's claim: zero hits on the private-list check on every surface.

**Pass 2.5 corroboration:**

- **Finding 1:** closes at `f6a21c1`, and my cold read agrees with Codex. PR #28's Pass 1 finding 1 closes with it.
  - The nine import forms: 0 rejected at `0f9b5fc`, 9 at `ab33165` and at the head.
  - Glob set back to `./*.ts`: 1 failed, 67 passed, on the new assertion.
  - That assertion also removed, plus a nested file calling `Date.now()`: 68 passed.
- **Finding 2:** closed at `ab33165`. X7b and X7c pass at `0f9b5fc` and fail the named lower-bound test at the head.
- **Finding 3:** with `civil.ts` and `schedule.ts` from `0f9b5fc`, 2 failed and 119 passed, on both Nodes. The two failures are the two tests the fix added.
- **Finding 4:** the 16 former survivors all pass at `0f9b5fc` with typecheck exit 0, and all fail their named tests at the head.
- **Finding 5:** closed.
  - The PR body has 3 revisions.
  - Its first 103 lines equal the first revision byte for byte: 10,506 bytes, SHA-256 `60a127d2…f512ee4a`.
  - Every figure in "Corrections after Pass 1" reproduced at the head.
  - Beni confirmed the close in this session.
- **Finding 6:** fixed in `f6a21c1`.
  - `void Math.random();` in `listedSchedule`, or before the `estimatedSet` line: 2 failed, 66 passed.
  - With the fourth case taken out: 1 failed, the lexical test alone.
  - The case reaches `listed` with 4 entries and `diff` with 1, 18, 1 and `[2,3]`.
- **Finding 7:** reproduced. `import "./samples.ts";` in `schedule.ts` makes `pnpm verify` exit 1 at `verify:tooling`.
- **Findings 8 to 10:** not re-run; Low, no change.

**New at Pass 2.5:**

| # | Severity | Finding | How verified | Fix |
| --- | --- | --- | --- | --- |
| 2.5-1 | Medium, a surviving mutant off a boundary | The assertion at `packages/core/src/schedule/schedule.purity.test.ts:224` pins one folder, one level down, not the recursion. With the glob narrowed to `./{*,*/*}.ts` or `./{*,test-support/*}.ts`, all 68 purity tests pass and typecheck exits 0. With the first, a file two folders down calling `Date.now()` passes too. The head's own glob reads that file and fails on it | Mutants G3b, G4b and T4b pass on both Nodes; T3 is killed with `./test-support/deeper/evil.ts ambient:Date` | Not fixed. Beni ruled "Carry (Recommended)" in this session |

It does not reopen finding 1: Severity asks for a test that fails without the fix, and G1 is that test.

**The helper's location:** `test-support/same-twice.ts` raises nothing new beside finding 7.

- It is pure, the checker reads it (T1 is killed), and nothing in product code imports it.
- One difference: if `schedule.ts` imported it, `pnpm verify` still exits 0, with all eight steps ok.
- So the PM's carried rule on where a relative specifier may point has to name this folder too.

**Contested:** nothing stands. Two earlier disagreements were settled before this pass:

- Pass 1 closed finding 1 at `ab33165`; the PM disputed it; Codex accepted the PM's condition and met it.
- Pass 1 filed finding 5 as Medium and left the reading to the PM, who raised it; Codex accepted.

## Verification as re-run

All on Node v24.22.2 and v26.13.0 unless a row says otherwise, each command's own exit code read.

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | Exit 0 on both |
| Verify | `pnpm verify` | Exit 0 on both; 8 step lines ok, then `verify ok`. Core 154 passed in 16 files, tooling 122 passed in 10 files |
| Schedule, purity, terms | `pnpm --filter @keel/core test schedule`, then `schedule.purity`, then `terms` | 121 in 7 files; 68 in 1; 32 in 8; exit 0 on both |
| Determinism | The skill's command, as in `baseline.sh` below | `pnpm fixtures:regen` exit 0, tree check exit 0, on both |
| Zero network | `pnpm -s verify:network` | Exit 0 on both |
| Tripwire | `node tools/tripwire/cli.mjs`; `scanRepo(process.cwd())` | Exit 0, 0 lines, on both; no error, 0 hits, so 0 in each of the six classes |
| Tripwire on PR text | The same CLI on a throwaway repo holding the PR title, body and my comment | Exit 0; with a made-up address added, 1 `email` hit and exit 1 |
| GitHub checks | `gh pr checks 30 --repo BeniCheni/keel`; `gh run list --repo BeniCheni/keel --commit f6a21c144a9ce2510c550d6cec6f3dc0a659d64d --json databaseId,event,conclusion,status,headSha` | 5 pass: four cells and `verify`. Run 42687442879, `pull_request`, success |
| Diff and commits | `git diff --shortstat origin/main...HEAD`; `git rev-list --count origin/main..HEAD`; `git merge-base origin/main HEAD` | 17 files, 2046 insertions, 4 deletions; 5 commits; base `4210f6d` |
| AC9 | `git diff --numstat origin/main...HEAD -- packages/core/src/terms schemas fixtures tools` | One line: `1`, tab, `1`, tab, `tools/acceptance/test/core-entry.test.mjs`. Line 15 keeps `toBe(` |
| Dependencies | `git diff --exit-code origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml packages/core/package.json` | Exit 0 |
| Honesty tests | `git diff --numstat origin/main...HEAD -- '*.honesty.test.ts'`; `grep -c '^test('` on the file; `grep -n -E '\.(skip\|only\|todo)\b' packages/core/src/schedule/*.test.ts \| wc -l` | 334 added, 0 deleted; 14 tests at the head, 9 at `0f9b5fc`; 0 skips |
| Calendar | Codex's command (below), `wc -l`, `shasum -a 256` | 345; `e438df993de99cc780739a56901ea276353bc094675a0800cf1ac500a28d5fd5`, on both. Pass 1's `ref.py selfcheck` gives the same count and hash |
| Finding 3 | `git checkout 0f9b5fc -- packages/core/src/schedule/civil.ts packages/core/src/schedule/schedule.ts`, the schedule tests, then `git checkout HEAD --` the same two | 2 failed, 119 passed, on both; status clean after |
| Mutations, mine | `python3 -I p25_mutants.py mutants.json`, then `python3 -I p25_mut.py <clone> <node> mutants.json` | 34 mutants, same verdicts on both Nodes: 22 killed, 12 pass; status clean after |
| Mutations, Pass 1's 42 at the head | `python3 -I mutants_after.py m.json && python3 -I mut.py m.json`, Node 24.22.2 | 41 killed, N3 passes; the first 16 each fail their named test |
| The same 16 at `0f9b5fc` | `git archive 0f9b5fc` into the scratchpad, install, then `mut.py` with X19b and X19d re-worded (below), Node 24.22.2 | 16 pass, typecheck exit 0 on each |
| Nine import forms | `node forms.mjs <clone> <commit> <scratch>` | 0 rejected at `0f9b5fc`, 9 at `ab33165` and `f6a21c1`, on both Nodes |
| Nested file at `0f9b5fc` | `sub/evil.ts` in the export, then the purity run with `-t 'schedule sources pass the purity checker'`, Node 24.22.2 | Exit 0, 1 passed, 56 skipped. At the head, T2c is killed |
| Differential | Pass 1's `gen_cases.py`, `run_product.mjs`, `compare.py`, seeds 30 and 31; `gen_edge.py`, seed 7; Node 24.22.2 | 12,000 cases, 0 mismatches, `calendar-collision` 16 times; 4,000 extreme-year cases, 0 mismatches |
| PR body | `gh api graphql` with `userContentEdits`, then the Python check below | 3 revisions; first 103 lines equal the first revision; `ASSERT OK` |
| Pass M | `python3 tools/reference/payoff.py fixtures/golden/` | N/A: the slice has no engine and `ls fixtures/golden` finds no such folder |
| UI matrix | | N/A: the slice has no UI |
| Demo mode | `grep -c -i demo README.md` | N/A: prints 0, the README has no demo |

**My 12 passing mutants:**

- 5 are controls written to pass: G2, T2b, R0, and R6 and R7 without the fourth case.
- 3 pass the tests but fail typecheck: G3, G4, T4.
- 1 is the helper-reach probe, E1.
- 3 are finding 2.5-1.

**Not re-run, and why:**

- **The owner's private-list check.** No Claude seat runs it or opens its file. Codex's zero counts are Codex's claim. The PR body refresh at 19:22 EST and my comment at 19:42 EST both came after Codex's check, so Beni re-runs it before merging.
- **37 of the builder's 47 mutant rows.** 10 ran here, re-worded, through Pass 1's published definitions. The rest are Pass 1's claim (50 killed) and Codex's claim (49 variants killed).
- **Pass 1's other own mutants** at `0f9b5fc`, and 9 of its 18 import forms: not published in runnable form.
- **Codex's Python calendar:** I ran Pass 1's instead.
- **`pnpm verify` at `0f9b5fc`, `25084c4`, `415be36` and `ab33165`:** earlier seats' claims. Here only the schedule tests at `0f9b5fc` ran (100 in 7 files).
- **Pass 1's 42 mutants on Node 26:** run on 24 only.
- **Any seat's effort setting**, and Cursor's model: no command reads them.
- **JavaScriptCore:** not part of `verify`.
- **Reading:** I read in full the spec, the six product files, `index.ts`, the purity and honesty tests, and `f6a21c1`'s diff. The other five test files (735 lines) I did not read line by line; Pass 1 and Codex cold-read them.

## Estimates and model output

None. ESTIMATE in this slice is a label on dates generated by a fixed rule, not a model's output, and nothing imports the Monte Carlo package.

## Risks and accepted costs

- **AC10 guards against accident, not evasion.** The lexical checker and the runtime stubs catch accidental impurity on the Node versions the suite runs. They do not prove purity against deliberate evasion, and nothing ran on JavaScriptCore, where ADR-0009's Path A will run this code.
- **Carried to the next ordinary PR, four items now.** The PM's three:
  - where a relative specifier may point, which must now also cover `test-support/`;
  - identifiers written with Unicode escapes;
  - the `.mts`, `.js` and `.json` extensions.

  Plus finding 2.5-1: the glob control pins one folder, not the recursion. A fix would compare the glob's keys with a recursive listing, about 8 lines in the purity test.
- **N3 is equivalent.** Reverting the first maturity check to a text comparison passes every test. I re-ran it and agree with both earlier seats: a slot past year 9999 enters the inner loop, the numeric check there rejects it, and the loop ends once the year's text sorts after the maturity. Only the iteration count changes.
- **The fourth runtime case is exercised, not asserted.** Removing it fails nothing (R0). If `minimal.yaml` changed so that its estimate became unavailable, the case would stop reaching most of `scheduleDiff` without a red test. Low.
- **Model pin.** This pass ran on Fable 5.2 by owner ruling while `AGENTS.md` still reads Fable 5.1. The file needs its own PR if the pin is to move.
- **Finding 5's timing.** Ruling 6 put the confirmation "at the merge". Beni gave it in this session, before the private-list re-run, which is still due.
- **Vendor identity.** Every PR comment is posted from the owner's GitHub account, so which vendor ran each pass rests on the comment's own statement and on the commit author fields.
- **What S03 cannot take from this.** The schedule does not establish the final valuation date. Leaving out a slot that rolls past maturity can shorten the count, so a monthly note can show 54 entries where the research counts 55.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes |
| Verdict mergeable, every High closed | Yes. Findings 1 and 2 by fix commits with failing-first tests; finding 5 by the remediation check plus Beni's confirmation of 2026-11-09 |
| Nothing contested | Yes |
| `verify` green at tip; every number re-run | Yes for every number reported as this session's; the rest are labelled as their vendor's claim |
| No sensitive path, dependency or schema change | **No**: `packages/core/**`, 16 files. No dependency, no schema change |
| Every commit cold-read by a non-author vendor | Yes. `0f9b5fc` Cursor, read by Claude at Pass 1. `25084c4`, `415be36`, `ab33165` Claude, read by Codex at Pass 2. `f6a21c1` Codex, read here |
| Gate verdict | would escalate |
| Beni's decision (filled after) | Merged on 2026-11-10 at squash `5ce0853`, after the private-list check returned zero on every surface |

## Questions for Beni

Answered in this session, 2026-11-09, each in one word:

1. Fable 5.2 High holds the Pass 2.5 seat for PR #30, against the Fable 5.1 pin? **Yes.**
2. Rulings 1 to 4 from Pass 0, as recorded? **Yes.**
3. Rulings 5 to 7 from Pass 1.5, as recorded? **Yes.**
4. Finding 5 confirmed closed? **Yes.**
5. Finding 2.5-1: carry, or fix first? **Carry.**

Still open, for the merge:

6. Did the private-list check return zero on every surface after the 19:22 EST body refresh and comment 6755531584?

## Handoff block

Run the private-list check first. The PM runs the post-merge checks.

```bash
gh pr ready 30 --repo BeniCheni/keel
gh pr merge 30 --repo BeniCheni/keel --squash --match-head-commit f6a21c144a9ce2510c550d6cec6f3dc0a659d64d --subject "feat(core): observation schedule and exchange calendar (#30)" --body "Adds the S02 observation schedule and the rule-built NYSE calendar for 2026 to 2060 in packages/core/src/schedule, exported from the core entry. Listed dates stay as listed. Generated dates step from the stated first call observation, move closed days to the next open day and carry the ESTIMATE label. Unknown, conflicting or invalid inputs, and dates outside the calendar, return no schedule with the reason.

Review: Pass 1 found two Highs in tracked files, fixed in 25084c4, 415be36 and ab33165. Pass 2 added f6a21c1, where PR #28 Pass 1 finding 1 closes. Finding 5, a High in the PR body, closed with a byte-for-byte check of the original text and the owner's written confirmation of 2026-11-09. AC9 exception by the owner's ruling of 2026-11-09: one expected string in tools/acceptance/test/core-entry.test.mjs. One Medium is carried: the glob control in schedule.purity.test.ts pins one folder, one level down. Pass 2.5 ran on Fable 5.2 High by the owner's ruling, against the Fable 5.1 pin. Shadow gate: would escalate, sensitive path packages/core. Reviewed head f6a21c144a9ce2510c550d6cec6f3dc0a659d64d.

Co-authored-by: Cursor <cursoragent@cursor.com>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>"
```

## Scripts

Pass 1's `mut.py`, `mutants_after.py`, `ref.py`, `gen_cases.py`, `gen_edge.py`, `run_product.mjs` and `compare.py` are printed in [its comment](https://github.com/BeniCheni/keel/pull/30#issuecomment-6746624951) and were run as published. Everything else is below.

`baseline.sh` (`sh baseline.sh <clone> <node version> <log dir>`)

```sh
#!/bin/sh
CLONE="$1"; V="$2"; LOGS="$3"
PATH="$HOME/.nvm/versions/node/v$V/bin:$PATH"; export PATH
KEEL_DATA_DIR="$(mktemp -d)"; export KEEL_DATA_DIR
cd "$CLONE" || exit 2
echo "node $(node --version) pnpm $(pnpm --version) head $(git rev-parse HEAD)"
run() { name="$1"; shift; "$@" > "$LOGS/$V-$name.log" 2>&1; echo "$name exit=$?"; }
run install pnpm install --frozen-lockfile
run verify pnpm verify
run schedule pnpm --filter @keel/core test schedule
run purity pnpm --filter @keel/core test schedule.purity
run terms pnpm --filter @keel/core test terms
run tripwire node tools/tripwire/cli.mjs
run network pnpm -s verify:network
run regen pnpm fixtures:regen
run trees sh -c 'keel_generated_trees="$(pnpm -s fixtures:trees)" && keel_generated_status="$(printf "%s\n" "$keel_generated_trees" | while IFS= read -r keel_generated_tree; do git status --porcelain --untracked-files=all -- "$keel_generated_tree" || exit; done)" && test -z "$keel_generated_status"'
st="$(git status --porcelain --untracked-files=all)"; echo "status exit=$? lines=$(printf '%s' "$st" | grep -c .)"
```

Calendar, Codex's command:

```sh
node --input-type=module -e 'import {nyseRulesCalendar} from "./packages/core/src/schedule/calendar.ts"; for (const {date,name} of nyseRulesCalendar().closures) console.log(date+" "+name)' > "$KEEL_DATA_DIR/calendar.txt"; wc -l < "$KEEL_DATA_DIR/calendar.txt"; shasum -a 256 "$KEEL_DATA_DIR/calendar.txt"
```

PR body check:

```sh
gh api graphql -f query='query { repository(owner:"BeniCheni",name:"keel") { pullRequest(number:30) { body createdAt lastEditedAt headRefOid userContentEdits(first:20) { totalCount nodes { createdAt editedAt editor { login } diff } } } } }' > edits.json
```

```python
# python3 -I check_body.py <dir holding edits.json>
import json, sys, hashlib
d = json.load(open(sys.argv[1] + '/edits.json'))['data']['repository']['pullRequest']
body = d['body'].encode()
revs = [n['diff'].encode() for n in sorted(d['userContentEdits']['nodes'], key=lambda n: n['editedAt'])]
first = revs[0]
print('revisions', len(revs), 'bytes', [len(r) for r in revs], 'current body bytes', len(body))
print('current body == last revision:', body == revs[-1])
prefix = b'\n'.join(body.split(b'\n')[:103])
print('sha256 first revision', hashlib.sha256(first).hexdigest())
print('sha256 body prefix   ', hashlib.sha256(prefix).hexdigest())
assert prefix == first and body.startswith(first)
print('ASSERT OK')
```

`p25_mut.py`

```python
"""Pass 2.5 mutant runner for keel PR #30. Applies one mutant, runs Vitest with the JSON reporter, restores, prints what failed.
Usage: python3 -I p25_mut.py <clone> <node version> <mutants.json> [id ...]
A mutant is {id, edits: [[file, old, new], ...], create: {file: text}, delete: [file], pattern, typecheck}. Files are relative to the schedule folder.
Each `old` must occur exactly once. The tree is restored in a finally block and `git status` is printed at the end."""
import json, os, subprocess, sys, tempfile

ROOT, NODE, SPEC = sys.argv[1], sys.argv[2], sys.argv[3]
ONLY = set(sys.argv[4:])
SCH = os.path.join(ROOT, "packages/core/src/schedule")


def env():
    e = dict(os.environ)
    e["KEEL_DATA_DIR"] = tempfile.mkdtemp()
    e["PATH"] = os.path.expanduser("~/.nvm/versions/node/v%s/bin:" % NODE) + e["PATH"]
    return e


def run_tests(pattern):
    out = tempfile.mktemp(suffix=".json")
    p = subprocess.run(
        ["pnpm", "--filter", "@keel/core", "exec", "vitest", "run", "--config", "vitest.config.mjs", pattern, "--reporter=json", "--outputFile=" + out],
        cwd=ROOT, env=env(), capture_output=True, text=True)
    failed, total, passed = [], -1, -1
    try:
        data = json.load(open(out))
        total, passed = data["numTotalTests"], data["numPassedTests"]
        for f in data["testResults"]:
            name = os.path.basename(f["name"])
            if f.get("status") == "failed" and not f["assertionResults"]:
                failed.append((name + " (file failed to load)", (f.get("message") or "").strip().split("\n")[0][:200]))
            for t in f["assertionResults"]:
                if t["status"] == "failed":
                    failed.append((name + ": " + t["title"], (t.get("failureMessages") or [""])[0].split("\n")[0][:200]))
    except Exception as err:  # no JSON means the run itself broke; never read that as a pass
        failed.append(("<no json>", repr(err) + (p.stdout + p.stderr)[-300:]))
    return p.returncode, total, passed, failed


def typecheck():
    return subprocess.run(["node", "tools/verify/one.mjs", "typecheck"], cwd=ROOT, env=env(), capture_output=True, text=True).returncode


def apply(m):
    saved, created = {}, []
    try:
        for rel, old, new in m.get("edits", []):
            path = os.path.join(SCH, rel)
            if path not in saved:
                saved[path] = open(path).read()
            text = open(path).read()
            if text.count(old) != 1:
                return {"error": "old text occurs %d times in %s: %r" % (text.count(old), rel, old[:70])}
            open(path, "w").write(text.replace(old, new))
        for rel, text in m.get("create", {}).items():
            path = os.path.join(SCH, rel)
            if os.path.exists(path):
                return {"error": "exists: " + rel}
            os.makedirs(os.path.dirname(path), exist_ok=True)
            open(path, "w").write(text)
            created.append(path)
        for rel in m.get("delete", []):
            path = os.path.join(SCH, rel)
            if path not in saved:
                saved[path] = open(path).read()
            os.remove(path)
        code, total, passed, failed = run_tests(m.get("pattern", "schedule"))
        tc = typecheck() if m.get("typecheck", True) else None
        return {"exit": code, "total": total, "passed": passed, "failed": failed, "typecheck": tc}
    finally:
        for path, text in saved.items():
            os.makedirs(os.path.dirname(path), exist_ok=True)
            open(path, "w").write(text)
        for path in created:
            os.remove(path)
            try:
                os.rmdir(os.path.dirname(path))
            except OSError:
                pass


for m in json.load(open(SPEC)):
    if ONLY and m["id"] not in ONLY:
        continue
    r = apply(m)
    if "error" in r:
        print("!! %s ERROR %s" % (m["id"], r["error"]))
        continue
    verdict = "SURVIVED" if r["exit"] == 0 else "killed"
    print("%s %s exit=%s tests=%s passed=%s failed=%d typecheck-exit=%s expect=%s" % (
        m["id"], verdict, r["exit"], r["total"], r["passed"], len(r["failed"]), r["typecheck"], m.get("expect", "?")))
    for title, msg in r["failed"][:4]:
        print("      - %s :: %s" % (title, msg))
    if len(r["failed"]) > 4:
        print("      (+%d more)" % (len(r["failed"]) - 4))
st = subprocess.run(["git", "status", "--porcelain", "--untracked-files=all"], cwd=ROOT, capture_output=True, text=True)
print("git status after: exit=%d lines=%d" % (st.returncode, len(st.stdout.splitlines())))
```

`p25_mutants.py`

```python
"""Pass 2.5 mutants for f6a21c1 (Codex's commit) on keel PR #30. Writes mutants.json for p25_mut.py.
Usage: python3 -I p25_mutants.py <out.json>"""
import json, sys

P = "schedule.purity.test.ts"
S = "schedule.ts"
F = "flags.ts"
H = "test-support/same-twice.ts"
M = []


def m(id, expect, edits=None, create=None, delete=None, pattern="schedule.purity", typecheck=True):
    M.append(dict(id=id, expect=expect, edits=edits or [], create=create or {}, delete=delete or [], pattern=pattern, typecheck=typecheck))


GLOB_NEW = 'import.meta.glob("./**/*.ts", {'
GLOB_OLD = 'import.meta.glob("./*.ts", {'
ASSERT = '  expect(files.map(([file]) => file)).toContain("./test-support/same-twice.ts");\n'
HELPER_IMPORT = 'import { sameTwice } from "./test-support/same-twice.ts";\n'
CASE_LINE = "      exercise(caseWithList, nyse),\n"
IMPURE = "  void Math.random();\n"
LISTED_OPEN = "function listedSchedule(list: readonly Term<string>[]): ListedSchedule {\n"
SET_LINE = "  const estimatedSet = new Set(estimatedDates);\n"
EVIL = "export const t = Date.now();\n"

# --- the glob assertion
m("G1-glob-not-recursive", "killed: sources test, on the same-twice path", [[P, GLOB_NEW, GLOB_OLD]])
m("G2-glob-not-recursive-and-assertion-removed", "SURVIVES: shows the new assertion is what catches G1", [[P, GLOB_NEW, GLOB_OLD], [P, ASSERT, ""]])
m("G3-glob-one-level-only", "to see: does a glob that stops one folder down pass?", [[P, GLOB_NEW, 'import.meta.glob(["./*.ts", "./*/*.ts"], {']])
m("G4-glob-names-the-one-subfolder", "to see: does a glob that names only test-support pass?", [[P, GLOB_NEW, 'import.meta.glob(["./*.ts", "./test-support/*.ts"], {']])
m("G5-glob-subfolders-only", "killed: top-level sources missing", [[P, GLOB_NEW, 'import.meta.glob("./*/**/*.ts", {']])
# --- the nested file is checked, not only listed
m("T1-nested-helper-calls-Date-now", "killed: sources test names ./test-support/same-twice.ts ambient:Date", [[H, "  return JSON", "  void Date.now();\n  return JSON"]])
m("T2-same-at-old-glob-without-assertion", "SURVIVES: the hole finding 1 described, at the head's code", [[H, "  return JSON", "  void Date.now();\n  return JSON"], [P, GLOB_NEW, GLOB_OLD], [P, ASSERT, ""]])
m("T3-deeper-nested-impure-file", "killed: a file two folders down is read", create={"test-support/deeper/evil.ts": EVIL})
m("T4-deeper-nested-impure-file-one-level-glob", "to see: paired with G3", [[P, GLOB_NEW, 'import.meta.glob(["./*.ts", "./*/*.ts"], {']], create={"test-support/deeper/evil.ts": EVIL})
# --- the same two globs as one pattern string, which is the only form the declared type in terms/fixtures.ts accepts
ONE_LEVEL = 'import.meta.glob("./{*,*/*}.ts", {'
m("G3b-glob-one-level-only-typed", "to see: does a glob that stops one folder down pass, typecheck included?", [[P, GLOB_NEW, ONE_LEVEL]])
m("G4b-glob-names-the-one-subfolder-typed", "to see", [[P, GLOB_NEW, 'import.meta.glob("./{*,test-support/*}.ts", {']])
m("T4b-deeper-nested-impure-file-one-level-glob-typed", "to see: paired with G3b", [[P, GLOB_NEW, ONE_LEVEL]], create={"test-support/deeper/evil.ts": EVIL})
m("T2b-nested-impure-file-at-old-glob-without-assertion", "SURVIVES: the hole finding 1 described", [[P, GLOB_NEW, GLOB_OLD], [P, ASSERT, ""]], create={"sub/evil.ts": EVIL})
m("T2c-nested-impure-file-at-head", "killed: ./sub/evil.ts ambient:Date", create={"sub/evil.ts": EVIL})
m("T2d-nested-impure-file-at-old-glob-with-assertion", "killed by the path assertion only", [[P, GLOB_NEW, GLOB_OLD]], create={"sub/evil.ts": EVIL})
# --- the helper move
m("S1-helper-moved-back-inline", "killed: the asserted path no longer exists",
  [[P, HELPER_IMPORT, ""], [P, 'test("the repeat comparison rejects a lastIndex stand-in"', "function sameTwice(run: () => unknown): boolean {\n  return JSON.stringify(run()) === JSON.stringify(run());\n}\n\ntest(\"the repeat comparison rejects a lastIndex stand-in\""]],
  delete=[H])
m("S2-helper-always-true", "killed: the lastIndex stand-in test", [[H, "  return JSON.stringify(run()) === JSON.stringify(run());", "  void run();\n  return true;"]])
m("S3-helper-runs-once", "killed: the lastIndex stand-in test", [[H, "  return JSON.stringify(run()) === JSON.stringify(run());", "  const once = JSON.stringify(run());\n  return once === once;"]])
# --- the fourth runtime case: impure line on the listed paths, with the case and without it
for tag, without in (("", False), ("-without-case-4", True)):
    drop = [[P, CASE_LINE, ""]] if without else []
    exp = "SURVIVES the runtime test; lexical only" if without else "killed twice: lexical and runtime"
    m("R1-random-in-listedSchedule" + tag, exp, [[S, LISTED_OPEN, LISTED_OPEN + IMPURE]] + drop)
    m("R2-random-before-estimatedSet" + tag, exp, [[S, SET_LINE, IMPURE + SET_LINE]] + drop)
    m("R3-random-on-no-known-date-item" + tag, exp, [[S, "      noKnownDate.push(index);\n", "      void Math.random();\n      noKnownDate.push(index);\n"]] + drop)
    m("R4-random-in-sort-comparator" + tag, exp, [[S, "  if (left < right) return -1;\n", "  void Math.random();\n  if (left < right) return -1;\n"]] + drop)
    m("R5-random-in-termDateFlags-list-loop" + tag, exp, [[F, "      const item = list[index];\n", "      void Math.random();\n      const item = list[index];\n"]] + drop)
    exp2 = "SURVIVES everything: no ambient name, and the path does not run" if without else "killed by the runtime test alone: the repeat comparison"
    m("R6-listed-index-alternates" + tag, exp2,
      [[S, LISTED_OPEN, "let flip = 0;\n" + LISTED_OPEN + "  flip += 1;\n"], [S, "      index,\n      date: term.status", "      index: index + (flip % 2),\n      date: term.status"]] + drop)
    m("R7-diff-order-alternates" + tag, exp2,
      [[S, "export function scheduleDiff(", "let turn = 0;\nexport function scheduleDiff("], [S, SET_LINE, "  turn += 1;\n  if (turn % 2 === 0) noKnownDate.reverse();\n" + SET_LINE]] + drop)
# --- the case removed, nothing else changed: no assertion depends on the case being there
m("R0-case-4-removed-only", "SURVIVES by design: the case is exercised, not asserted", [[P, CASE_LINE, ""]])
# --- could the helper reach the entry (finding 7's question, asked of the new file)
m("E1-schedule-imports-the-helper", "to see: does anything fail if product code imports the helper?", [[S, 'import { scheduleDateFlags } from "./flags.ts";\n', 'import { scheduleDateFlags } from "./flags.ts";\nimport "./test-support/same-twice.ts";\n']], pattern="schedule")
json.dump(M, open(sys.argv[1], "w"), indent=1)
print(len(M), "mutants")
```

E1 and its `samples.ts` twin were also run under the whole of `pnpm verify`: add `import "./test-support/same-twice.ts";` (then `import "./samples.ts";`) after the `./flags.ts` import in `schedule.ts`, run `pnpm verify`, then `git checkout HEAD -- packages/core/src/schedule/schedule.ts`.

`forms.mjs`

```js
// Lifts the checker out of schedule.purity.test.ts as it stands at a commit, and counts hits on the nine forms from the Pass 0 appendix.
// Usage: node forms.mjs <clone> <commit> <scratch dir>
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const [clone, commit, scratch] = process.argv.slice(2);
const text = execFileSync("git", ["-C", clone, "show", `${commit}:packages/core/src/schedule/schedule.purity.test.ts`], { encoding: "utf8" });
const from = text.indexOf("const PURE_NAMES");
const to = text.indexOf("const NEGATIVES");
if (from === -1 || to === -1) throw new Error("markers not found");
let body = text.slice(from, to);
const globAt = body.indexOf("const sources = import.meta.glob(");
if (globAt === -1) throw new Error("glob not found");
const globEnd = body.indexOf("});", globAt) + 3;
const glob = body.slice(globAt, globEnd).split("\n")[0];
body = body.slice(0, globAt) + body.slice(globEnd);
const file = `${scratch}/checker-${commit}.ts`;
writeFileSync(file, `${body}\nexport { purityHits };\n`);
const { purityHits } = await import(pathToFileURL(file).href);
const forms = [
  'import{readFileSync}from"node:fs"', 'export*from"fs"', 'export{x}from"fs"', ';import"fs"', 'import /* c */ "node:fs"',
  'import x from /* c */ "node:fs"', 'import\u00a0("fs")', "import\u2028.meta.url", "import\ufeff.meta.url",
];
let rejected = 0;
for (const form of forms) if (purityHits(form).length > 0) rejected += 1;
const control = purityHits('import fs from "fs"').length; // a form both commits must reject, so 0 above is not a broken lift
console.log(`${commit} glob: ${glob.trim()} | forms ${forms.length} rejected ${rejected} | control hits ${control}`);
```

`case4.mjs`

```js
// What the fourth runtime case reaches: the same terms as schedule.purity.test.ts builds, through the public entry in plain Node.
// Usage: node case4.mjs <clone>
import { readFileSync } from "node:fs";
const root = process.argv[2];
const api = await import(`${root}/packages/core/src/index.ts`);
const terms = api.loadTerms(readFileSync(`${root}/fixtures/synthetic/terms/valid/minimal.yaml`, "utf8"), "minimal.yaml").terms;
terms.dates.observation_schedule = [
  { value: "2026-09-01", status: "primary", source: "supplement" },
  { value: "2027-03-02", status: "user" },
  { value: null, status: "unknown" },
  { status: "conflict", candidates: [{ value: "2027-06-01", status: "primary", source: "supplement" }, { value: "2027-06-02", status: "user" }] },
];
const cal = api.nyseRulesCalendar();
const obs = api.observationSchedule(terms, cal);
const diff = api.scheduleDiff(terms, cal);
const flags = api.termDateFlags(terms, cal);
console.log("observationSchedule:", obs.kind, "entries", obs.entries.length, "dates", JSON.stringify(obs.entries.map((e) => e.date)));
console.log("scheduleDiff:", diff.kind, "inBoth", diff.inBoth.length, "onlyEstimated", diff.onlyEstimated.length, "onlyListed", diff.onlyListed.length, "noKnownDate", JSON.stringify(diff.noKnownDate));
console.log("termDateFlags list keys:", Object.keys(flags).filter((k) => k.startsWith("dates.observation_schedule")).join(" "));
```

The two re-worded mutants for the 16 at `0f9b5fc` (the first 16 entries of Pass 1's `m.json`, with `typecheck` set on all):

```python
# X19b-maturity-validity-unchecked: same `old` as published; `new` is
'  const maturityTerm = terms.dates.maturity;\n  const maturity: DateRead =\n    maturityTerm.status === "unknown" || maturityTerm.status === "conflict"\n      ? readDate(maturityTerm)\n      : { ok: true, value: maturityTerm.value, status: maturityTerm.status };'
# X19d-anchor-invalid-only-for-feb-30
old = '  if (!isRealDate(term.value)) return { ok: false, code: "input-invalid" };'
new = '  if (term.value === "2027-02-30") return { ok: false, code: "input-invalid" };'
```

Tripwire on the PR text: in an empty `git init` folder, copy `tools/tripwire/allowlist.txt` and `vendors.txt`, commit them, point `refs/remotes/origin/main` at that commit, stage the PR title and body (`gh pr view 30 --repo BeniCheni/keel --json title,body`) and the comment text, then run `node tools/tripwire/cli.mjs <folder>` from the clone. For the control, stage one more file holding a made-up address and run it again.

## Records note (PM, 2026-11-10)

Added by the PM for the records PR. The Pass 2.5 seat wrote no file. This brief is the seat's last chat message, read as data from its session transcript with `extract_brief.py` (printed in the records PR body), SHA-256 `6e81cfc19eec302241ca74837ef256fbc146fd74ff59ad7da6ad84508f2b3780`. Beni pasted the same text into the PM's session. The PM changed two lines and appended this note. The first change makes the link to `schedule.purity.test.ts:224` a plain path, because it pointed at the clone root. The second fills the last row of the gate log.

- **Question 6.** Beni answered "All zero, merged" on 2026-11-10 in the PM's session. He ran the counts-only script below over six surfaces: the diff, every commit message, the PR title and body, the issue comments, the reviews and the review comments. It covers the body refresh at 19:22 EST and comment 6755531584. No Claude seat opened the list. The PM tested the script against throwaway lists before handing it over: a list with no matching term gave exit 0, a planted term gave exit 1, and an empty or missing list gave exit 2.
- **The merge.** Squash `5ce085317796622441eac079b8011b7cffa31e04`, merged by Beni at 2026-11-10T14:18:38Z (09:18 EST), reviewed head `f6a21c1` (`gh pr view 30 --repo BeniCheni/keel --json mergeCommit,mergedAt,headRefOid,mergedBy`). Its parent is `4210f6d`, so the base did not move, and its tree equals the reviewed head's: `89f1dba6928601b703c80b032d6fcfbb6b89e980` for both (`git rev-parse '5ce0853^{tree}' 'f6a21c1^{tree}'`). The branch `s02/schedule` is deleted (`git ls-remote --heads origin s02/schedule` prints nothing).
- **The squash message** differs from the handoff block above in one sentence, which the PM changed before handing it to Beni. The block says "Pass 1 found two Highs in tracked files, fixed in 25084c4, 415be36 and ab33165", but `415be36` fixed a Medium. The squash says "Pass 1 fixed two Highs and two Mediums in tracked files, in 25084c4, 415be36 and ab33165". The trailers are `Cursor <cursoragent@cursor.com>`, `Claude <noreply@anthropic.com>` and `Codex <noreply@openai.com>`, one for each author in `git log --format='%an <%ae>' 4210f6d..f6a21c1` (`git log -1 --format=%B 5ce0853`).
- **Post-merge checks**, in a fresh clone at `5ce0853` with a fresh `mktemp -d` as `KEEL_DATA_DIR`: `origin/main` equals the squash commit. `pnpm install --frozen-lockfile` and `pnpm verify` each exit 0 on Node v24.22.2 and v26.13.0, with 154 core and 122 tooling tests and all eight steps ok, and `git status` is clean afterwards. The push run on `main`, 42832784562, succeeded (`gh run view 42832784562 --repo BeniCheni/keel --json headSha,event,conclusion`). Demo mode is N/A, because the README has none.
- **Closed:** PR #28's Pass 1 finding 1 and this PR's findings 1, 2 and 5.
- **Still open:**
  - Medium 2.5-1 and the three items Pass 1.5 carries (where a relative specifier may point, now including `test-support/`; Unicode-escaped identifiers; the `.mts`, `.js` and `.json` extensions). All four go to the next ordinary docs PR.
  - `AGENTS.md` still pins this seat to Fable 5.1. Beni's ruling seated Fable 5.2 for this PR only, so moving the pin takes its own sensitive-path PR.

The script Beni ran:

```bash
bash <<'SCRIPT'
set -u
F="${KEEL_PRIVATE_LIST:-$HOME/.config/keel/private-terms.txt}"
R=BeniCheni/keel; N=30
{ test -r "$F" && test -s "$F"; } || { echo "list unreadable or empty"; exit 2; }
W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT
grep -v '^[[:space:]]*$' "$F" > "$W/p" || { echo "list has no patterns"; exit 2; }
gh pr diff $N --repo $R > "$W/diff" || { echo "diff fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/commits --jq '.[].commit.message' > "$W/commits" || { echo "commits fetch failed"; exit 2; }
gh pr view $N --repo $R --json title,body --jq '.title, .body' > "$W/title-body" || { echo "PR fetch failed"; exit 2; }
gh api --paginate repos/$R/issues/$N/comments --jq '.[].body' > "$W/comments" || { echo "comments fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/reviews --jq '.[].body' > "$W/reviews" || { echo "reviews fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/comments --jq '.[].body' > "$W/review-comments" || { echo "review comments fetch failed"; exit 2; }
head -n 1 "$W/p" > "$W/control"
c="$(grep -F -i -c -f "$W/p" "$W/control")"
[ "$c" = 1 ] || { echo "control failed"; exit 2; }
echo "control: ok"
status=0
for s in diff commits title-body comments reviews review-comments; do
  test -s "$W/$s" || [ "$s" = reviews ] || [ "$s" = review-comments ] || { echo "$s: empty, scan failed"; status=2; continue; }
  n="$(grep -F -i -c -f "$W/p" "$W/$s")"; rc=$?
  if [ "$rc" -gt 1 ]; then echo "$s: scan failed"; status=2
  else echo "$s: $n matching lines"; [ "$n" = 0 ] || { [ "$status" = 2 ] || status=1; }
  fi
done
echo "exit $status"
exit $status
SCRIPT
```
