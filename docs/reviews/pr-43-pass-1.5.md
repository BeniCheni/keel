# Pass 1.5 brief: PR #43

Written by the PM on 2026-11-14 (America/New_York). It follows Pass 1's comment ([issuecomment-6884388797](https://github.com/BeniCheni/keel/pull/43#issuecomment-6884388797), posted at 16:21:53 EST; reviewed head `bd9ae45`, post-fix head `06aa0a4`) and Beni's rulings below. Like the Pass 0 brief, it lives on branch `docs/pr-43-records`, so that no PM commit enters PR #43. Codex receives this brief for Pass 2.

Pass 1's verdict is mergeable after fixes, with no open High. This seat accepts all four findings and contests none:
- **Findings 1 and 2** are closed by Pass 1's two test commits.
- **Findings 3 and 4** are Lows that need no change in this PR.
- **PR #40's High** meets its closing condition at this head, and closes when PR #43 merges.

Nothing goes to Cursor as rework. The reference amendment and AC1 to AC3 are Codex's at Pass 2, as the spec gives them.

## Seat for Pass 2

Codex, GPT-6.1 Sol Extra High, because `packages/plugin-mln/**` and `fixtures/golden/**` are sensitive paths. The seat has no fallback: if that model is unavailable, stop and escalate. If the chat reaches the model only through a sub-agent, that sub-agent gets the whole prompt word for word and does all the reading and running, and the comment says so.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | Medium | Accept | Reproduced at `bd9ae45` with the PM's own harness, `mutants43.py` below. Each of L1 to L4, applied alone to `noteMetrics`'s new index loop, leaves the plugin suite at exit 0 with 211 passed. At `06aa0a4` each exits 1, with 1 failed, the test `noteMetrics takes its date from a close at any index, with or without a hole before it`, added in `21d3e37`. Medium by Beni's ruling below: a loop's bound is not a "boundary" under Severity | no |
| 2 | Medium | Accept | Reproduced the same way. Each of G1 to G3, applied alone to the guard in `placeRow`, leaves both suites at exit 0 at `bd9ae45` (plugin 211 passed, tooling 125 passed). At `06aa0a4` each exits 1 in the tooling suite, with 1 failed, `the silent-skip guard reads every part of its shape`, added in `06aa0a4`. The plugin suite stays at exit 0 | no |
| 3 | Low | Accept, no change here | Reproduced: V1, the version set back to 1, leaves both suites at exit 0 at both heads. S03.1's Scope lets the acceptance tests change only where they already pin the version, and AC4 checks the version by command. A test that pins it goes to the ideas list in the next ordinary docs PR | no |
| 4 | Low | Accept, no change here | Reproduced: the AC7 diff in the PR body, extracted at `bd9ae45`, fails `git apply --check` with "corrupt patch" (exit 128), and applies with `--recount`. The PR body is Cursor's, outside tracked files. The mutant itself reproduces from Pass 1's exact change, and the body's other mutant diffs apply | no |

Contested: none. The PM also agrees with Pass 1's notes that need no change:
- **Exporting `placeRow`** is within Scope's "for the two cases, the version and the guard". AC7 and AC8 need a test in another file to reach both throws, and `pushClose` stays private.
- **An explicit `undefined` or `null` element in `closes`** still throws in `noteMetrics` and `evaluateNote`. That is outside S03's input contract, which admits only what the `Close` type allows: a hole, not those values.
- **`missing` naming a member other than the worst** is ignored outside the guard's shape. That is older than this slice, and Decision 4 names two guards only. It goes to the ideas list in the next ordinary docs PR.
- **`pnpm test:ci-evidence`** from the README quickstart could not be run, because no failure run of the shape it needs is known. The README states the step but not how to run it on demand. That goes to the ideas list too, with idea 50.

## PR #40's High

It meets its closing condition at this head. Cursor's test `noteMetrics skips a hole in closes` fails without the fix:
- **At `0fda80f`,** with `bd9ae45`'s `payoff.metrics.test.ts` copied in and nothing else changed, the PM's run of that file exits 1: 1 failed, 4 passed, with `TypeError: Cannot read properties of undefined (reading 'ticker')`.
- **At the head,** the three Decision 6 mutants each fail it (Pass 1's rows 1 to 3).

It closes when PR #43 merges. The records of PR #40 and of this PR will say so.

## Authorship record

The Pass 0 record, extended with Pass 1's fix commits (`git log --format='%h %an' origin/main..HEAD` at `06aa0a4`).

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `bd9ae45` fix(plugin-mln): skip a hole in noteMetrics and pin the k and year-10000 cases | Cursor | Claude Code, Pass 1 |
| `21d3e37` test(plugin-mln): pin noteMetrics's date search at every index | Claude | Codex, Pass 2 |
| `06aa0a4` test(tools): cover each condition of the golden generator's silent-skip guard | Claude | Codex, Pass 2 |

Codex's reference amendment, and any Codex fix, gets its cold read from the fresh Claude session at Pass 2.5.

## Rulings from Beni

Given on 2026-11-14 in sessions the seats cannot see. The PM read the first three from the Pass 1 session's transcript, as data.

1. **15:47:03 EST, in the Pass 1 session, "Cleared, re-check".** The seat had asked: "The folder holds .claude. Will you clear it so I can re-run the check?"
2. **15:50:10 EST, in the Pass 1 session, "Yes, subfolder".** The seat had asked: ".claude is back. May I clone into a new subfolder, keel/, and run the pass there?" The desktop app keeps a `.claude` entry in each session folder, so the empty-folder check could not pass. Pass 1's clone is `~/code/keel-pr-43-p1/keel`, a folder that did not exist before, and the seat never opened the `.claude` entry.
3. **16:25:40 EST, in the Pass 1 session, "Yes".** The seat had asked: "Was Cursor's picker on Grok 4.7 Extra High for the build prompt and the resume note?" This settles builder claim 2 in the Pass 0 appendix, which no command can re-run.
4. **16:29:09 EST, in the PM's session, "No, Medium (Recommended)".** The PM asked at 16:28:56 EST: "PR #43's Pass 1 found four surviving mutants in noteMetrics's new index loop (its start, bound and step) and closed them in commit 21d3e37 with a test that fails under each. Does a loop bound count as a "boundary" under AGENTS.md's Severity table, which would make that finding a High instead of a Medium?" The option read: "Severity's "boundary" means a claim's threshold value, as AGENTS.md's examples (95.00%, 94.99%, 60.00%, 59.99%) show, not a loop's bound inside the code. The finding stays Medium. Either way, 21d3e37 has already closed it, so the verdict and the gate do not change."

The rulings in the Pass 0 brief stand.

## Known gaps for the next ordinary docs PR

These go to `docs/v0.1.0-ideas.md` with their sources. None blocks this PR.
- A test that pins the golden generator's version (finding 3).
- `missing` naming a member other than the worst is ignored outside the guard's shape (Pass 1's "Deliberately not done").
- A way to run the README's `pnpm test:ci-evidence` step without a real failure run, alongside idea 50.

## What Pass 2 does

1. **The reference amendment, from the spec.** Amend `observation_events` in `tools/reference/payoff.py` as S03.1 Decision 2 gives it, from S03's Events as amended. With a listed schedule, a known final valuation date and no item dated on it, an item whose known date is after that date is not an event and is not counted in `k`. Change nothing else in the reference unless a golden case shows another disagreement. Name, in your comment, the S03 rule each change follows. If S03 does not settle a case, stop and report. The amendment changes `tools/reference/payoff.py` and no other file.
2. **AC1 to AC3 and the floor's first two mutants.**
   - **AC1:** the seat's `after-final.mjs` and `after-final.py`, printed in `docs/reviews/pr-38-pass-2.5.md`, print `equal: True True` on both Nodes.
   - **AC2:** Pass M on `fixtures/golden/` exits 0 with `cases 13, disagreements 0`, and S03's two controls each exit 1.
   - **AC3:** the reference from `9ec6fd0` disagrees on g12 alone, and the one from `3e48b83` on g12 and g13, each with exit 1. Fetch `refs/pull/38/head` first, since `3e48b83` is not on `main`.
3. **Cold-read `21d3e37` and `06aa0a4`:** `git diff bd9ae45 06aa0a4`. Both add tests only.
4. **Reproduce or disprove each row above,** and PR #40's High. Contest any disposition you disagree with; the PM takes a contest to Beni.
5. **Your own read** of the whole PR at the head, including the mutation floor per claim and a sample run on Node 26.13.0. Never change `packages/plugin-mln/src/payoff.honesty.test.ts`: AC9 pins its exact tree entry. Run AC9's two commands exactly as the spec states them, from the clone's root.
6. **The owner's private-list check,** counts only, with a readable-file precheck and a nonzero exit on a failed scan. Run it over the diff, every commit message in `origin/main..HEAD`, the PR title and body, every comment, both briefs on `docs/pr-43-records`, and your own comment. No Claude seat ran it.
7. **Demo mode** is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50. Any fix follows the skill: reproduce it first, and give each behaviour fix a test that fails without it.

## Sealed appendix for Pass 2

Pass 1's findings and fixes are suspicions to re-derive, not conclusions, and so are this brief's dispositions. Do your own read before opening this.

The PM's runs, in a fresh clone, with a fresh `mktemp -d` as `KEEL_DATA_DIR`:

| Check | Command | Result |
| --- | --- | --- |
| Install and verify at `06aa0a4` | `pnpm install --frozen-lockfile`, `pnpm verify`, on v24.22.2 and v26.13.0 | Exit 0 for each. Core 178 in 16 files, plugin 212 in 12, tooling 126 in 11; status clean afterwards |
| CI at `06aa0a4` | `gh run view 43641619604 --repo BeniCheni/keel --json headSha,event,conclusion,attempt,jobs` | `pull_request`, success, attempt 1, 5 of 5 jobs success |
| Authors | `git log --format='%h %an <%ae>' origin/main..HEAD` | `06aa0a4` and `21d3e37` Claude `<noreply@anthropic.com>`, then `bd9ae45` Cursor `<cursoragent@cursor.com>` |
| The fixes | `git diff --stat bd9ae45 06aa0a4` | 2 files, 35 insertions, 1 deletion: `payoff.metrics.test.ts` and `golden-generator.test.mjs` |
| Timeline | `gh api repos/BeniCheni/keel/issues/43/timeline --paginate --jq '[.[] \| .event] \| group_by(.) \| map("\(length) \(.[0])")'` | 3 `committed`, 1 `commented`; no force-push |
| Tripwire at `06aa0a4` | `node tools/tripwire/cli.mjs .`, and `scanRepo` counted per class | Exit 0; 0 in each of the ten classes |
| Pass M at `06aa0a4` | `python3 -I tools/reference/payoff.py fixtures/golden/` | Exit 1, `cases 13, disagreements 1`; g12 alone |
| AC9 at `06aa0a4` | The spec's two commands, from the clone's root | One file listed; `100644 blob 6190a5eb06d34b22e075a5df5ffc1015887abbc5` |
| PR #40's High at `0fda80f` | `bd9ae45`'s `payoff.metrics.test.ts` copied in; `npx vitest run --config vitest.config.mjs src/payoff.metrics.test.ts` from `packages/plugin-mln` | Exit 1: 1 failed, `noteMetrics skips a hole in closes`, with `TypeError`; 4 passed |
| The AC7 diff as printed | That diff from the PR body, `git apply --check`, at `bd9ae45` | Exit 128, "corrupt patch"; with `--recount`, exit 0 |

The PM's mutant runs, on Node v24.22.2, each one exact edit with the file restored after it, and `git status --porcelain` empty at the end at both SHAs. "Plugin" is the plugin suite and "tooling" the tooling suite, each run with vitest's JSON reporter:

| Mutant | At `bd9ae45` | At `06aa0a4` |
| --- | --- | --- |
| L1, bound `closes.length - 1` | Plugin exit 0, 211 passed | Plugin exit 1, 1 failed: `noteMetrics takes its date from a close at any index, with or without a hole before it` |
| L2, start at index 1 | Plugin exit 0, 211 passed | Plugin exit 1, the same test |
| L3, step of 2 | Plugin exit 0, 211 passed | Plugin exit 1, the same test |
| L4, a hole also skips the next element | Plugin exit 0, 211 passed | Plugin exit 1, the same test |
| G1, the `all` condition dropped | Plugin exit 0, 211 passed; tooling exit 0, 125 passed | Plugin exit 0, 212 passed; tooling exit 1, 1 failed: `the silent-skip guard reads every part of its shape` |
| G2, the `worstTicker` condition dropped | As G1 | As G1 |
| G3, `missing !== worstTicker` read as `missing === undefined` | As G1 | As G1 |
| V1, the version set back to 1 | Plugin exit 0, 211 passed; tooling exit 0, 125 passed | Plugin exit 0, 212 passed; tooling exit 0, 126 passed |

The driver, run as `python3 -I mutants43.py <clone> <work dir>` with the clone checked out at each SHA after `pnpm install --frozen-lockfile`:

```python
# Applies each of Pass 1's eight surviving mutants alone at the clone's HEAD, runs the named suites with vitest's
# JSON reporter, prints the exit code, totals and failing test titles, and restores the file with git checkout.
# usage: python3 -I mutants43.py <clone> <work dir>
import json, os, subprocess, sys
C, W = sys.argv[1], sys.argv[2]
E = "packages/plugin-mln/src/engine.ts"; G = "tools/generators/golden/generate.mjs"
LOOP = "  for (let index = 0; index < closes.length; index += 1) {\n"
M = [
  ("L1 bound", E, LOOP, LOOP.replace("index < closes.length;", "index < closes.length - 1;"), ["plugin"]),
  ("L2 start", E, LOOP, LOOP.replace("let index = 0;", "let index = 1;"), ["plugin"]),
  ("L3 step", E, LOOP, LOOP.replace("index += 1", "index += 2"), ["plugin"]),
  ("L4 hole skips next", E, "    if (close === undefined) continue;\n", "    if (close === undefined) { index += 1; continue; }\n", ["plugin"]),
  ("G1 all dropped", G, "    row.all === undefined &&\n", "", ["plugin", "tooling"]),
  ("G2 worstTicker dropped", G, "    row.worstTicker !== undefined &&\n", "", ["plugin", "tooling"]),
  ("G3 missing", G, "    row.missing !== row.worstTicker\n", "    row.missing === undefined\n", ["plugin", "tooling"]),
  ("V1 version", G, "export const version = 2;\n", "export const version = 1;\n", ["plugin", "tooling"]),
]
SUITES = {
  "plugin": ["pnpm", "--filter", "@keel/plugin-mln", "exec", "vitest", "run", "--config", "vitest.config.mjs", "--reporter=json"],
  "tooling": ["pnpm", "exec", "vitest", "run", "--config", "tools/vitest.config.mjs", "--reporter=json"],
}
def clean():
    return subprocess.run(["git", "status", "--porcelain"], cwd=C, capture_output=True, text=True).stdout == ""
head = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=C, capture_output=True, text=True).stdout.strip()
print("head", head)
for label, path, old, new, suites in M:
    if not clean(): print(label, "tree not clean before"); sys.exit(2)
    p = os.path.join(C, path); t = open(p, encoding="utf-8").read()
    if t.count(old) != 1: print(label, "old text found", t.count(old), "times"); sys.exit(2)
    open(p, "w", encoding="utf-8").write(t.replace(old, new))
    parts = []
    for s in suites:
        out = os.path.join(W, f"{head}-{label.split()[0]}-{s}.json")
        rc = subprocess.run(SUITES[s] + [f"--outputFile={out}"], cwd=C, capture_output=True).returncode
        d = json.load(open(out))
        failed = sorted({a["title"] for f in d["testResults"] for a in f["assertionResults"] if a["status"] == "failed"})
        parts.append(f"{s} exit {rc}, {d['numPassedTests']} passed, {d['numFailedTests']} failed" + (f" [{'; '.join(failed)}]" if failed else ""))
    subprocess.run(["git", "checkout", "--", path, "fixtures"], cwd=C)
    print(f"{label}: " + " | ".join(parts))
    if not clean(): print(label, "tree not clean after"); sys.exit(2)
```
