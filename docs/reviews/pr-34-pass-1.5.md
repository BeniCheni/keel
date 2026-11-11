# Pass 1.5 brief: PR #34

Written by the PM on 2026-11-11 (America/New_York), after reading Pass 1's comment ([issuecomment-6809063919](https://github.com/BeniCheni/keel/pull/34#issuecomment-6809063919); reviewed head `5132249`, post-fix head `be7e30e`) and Beni's rulings. Like the Pass 0 brief, it lives on branch `docs/pr-34-records`, so that no PM commit enters PR #34. Codex receives this brief for Pass 2.

Pass 1's verdict is mergeable after fixes, with no High. This seat accepts all nine findings and contests none. Finding 6 is a defect in the spec, not in the build, by Beni's ruling 5. None goes to Cursor as rework: each was closed by a patch or needs none.

## Seat for Pass 2

Codex, GPT-6.1 Sol Extra High, because `schemas/**` and `packages/core/**` are sensitive paths. The seat has no fallback: if that model is unavailable, stop and escalate. If the chat reaches the model only through a sub-agent, that sub-agent gets the whole prompt word for word and does all the reading and running, and the comment says so. Ruling 3 moves the Claude seats to Fable 5.2; it does not touch Codex's pin.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | Medium | Accept | Reproduced. The PM's probe row A gives `schema-line` and `unknown-key` at `5132249`. At `be7e30e`, reverting the one changed line in `load.ts` fails exactly the new test (1 failed, 176 passed). The spec says which schema validates when line 1 is a marker, and is silent when it is not. The fix's rule is line 1, else the parsed marker, else 0.1, and the file still fails with `schema-line`. The PM accepts that as the intended rule and adds it to the spec in the next ordinary docs PR. Codex may contest the rule | no |
| 2 | Medium | Accept | Reproduced. Mutant R26 (the `m` of `0.1.json`'s title value changed to U+016D) passes the whole core suite at `5132249` (171 passed), and fails `0.1.json stays byte-identical to origin/main` at `be7e30e`. Restoring the old digest helper at `be7e30e` fails exactly the new digest test | no |
| 3 | Medium, surviving mutant off a boundary | Accept | Reproduced. R28 passes at `5132249` (171 passed) and fails exactly the new candidate test at `be7e30e` | no |
| 4 | Medium, surviving mutant off a boundary | Accept | Reproduced. R29 passes at `5132249` and fails exactly the new message test at `be7e30e` | no |
| 5 | Medium, surviving mutant off a boundary | Accept | Reproduced. R17 passes at `5132249` and fails exactly the new line 1 against data test at `be7e30e`. The test pins what the code already did | no |
| 6 | Medium | Accept, as a defect in the spec | Beni's ruling 5: line 57 is met by the generator's comment. No code changes on this PR. The next ordinary docs PR rewrites line 57 to say the generator records it | no |
| 7 | Low | Accept; no change | The rows the PR body lacks are in Pass 1's comment, on the PR. Pass 2 checks the floor per claim at the head | no |
| 8 | Low | Accept; no change | The rewrite repeats the same three assertions for 0.2, and Pass 1's R19 dies on its 0.1 arm. No honesty test is weakened | no |
| 9 | Low | Accept; no change required | Tidiness with no observable result. Codex may make the two edits if it agrees, and if it does not, the PM carries them to the ideas list | no |

Pass 1 also corrected the Pass 0 brief, which said the Pass 1 prompt first named Fable 5.1 Extra. The prompt the seat worked from named Fable 5.2 Extra. The PM reworded the Pass 0 brief in the same commit as this one. The sequence, from the two session transcripts in the Pass 1 folder, read as data:

- At 17:23:20 EST Beni sent the prompt as the PM wrote it, with Fable 5.1 Extra, to a session running `claude-fable-5-2`. That session found the folder empty at 17:23:31, cloned at 17:23:37 to 17:23:40, and was interrupted at 17:23:44. It ran no other command.
- At 17:24:00 Beni sent the prompt, edited to Fable 5.2 Extra, to a new conversation in the same folder. It found the first attempt's clone there and stopped. Beni emptied the folder, and Pass 1's comment says the check passed on its fourth run, at 17:28.
- So the "stray checkout" Pass 1 could not explain was the first attempt's own fresh clone, not an outside writer. Pass 1 says the app loaded that clone's `CLAUDE.md` and `AGENTS.md` into the second session. Neither file differs between `origin/main`, `5132249` and `be7e30e` (`git diff --quiet origin/main 5132249 -- CLAUDE.md AGENTS.md` exits 0, and so does the same against `be7e30e`), so the session loaded the same text its own clone holds.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `5132249` feat(core): state the final valuation date in schema 0.2 | Cursor | Claude Code, Pass 1 (done) |
| `a5d0863` fix(core): judge a 0.2 file with a line 1 fault against 0.2 | Claude | Codex, Pass 2 |
| `be7e30e` test(core): hash 0.1.json as UTF-8 and pin three loader behaviours | Claude | Codex, Pass 2 |

Any Codex fix commit gets its cold read from the fresh Claude session at Pass 2.5. This PM session wrote the spec, the build prompt and these briefs, and it takes no review pass on this PR.

## Rulings from Beni

Carried from Pass 0:

1. **Two readings of the spec, 2026-11-11 at 16:23 EST.** "Yes, in the prompt (Recommended)": `0.2.json` sets `$id`, `title` and the `schema` constant to `mln-terms/0.2`, and the manifest's `version` line moves from 1 to 2. Neither departure from the spec's literal text is a finding.
2. **Ruling 4 of 2026-11-10, "Bump to 0.2 (Recommended)".** The term arrives in a new schema 0.2, and `0.1.json` stays byte-identical.
3. **Fable 5.2 for every Fable seat, 2026-11-11 at 17:39 EST, standing.** "Correction: Fable 5.2 is the current latest version from Claude. We're using that for the Pass 1 prompt and future prompts when Fable is desired." `AGENTS.md` still pins Fable 5.1 until its own sensitive-path PR moves the pins.

New on 2026-11-11:

4. **"Yes, Fable 5.2", at 17:28 EST, in the Pass 1 session.** It answered the seat's question whether Fable 5.2 Extra was the model pin for that pass, given that `AGENTS.md` names Fable 5.1 Extra. Pass 1's comment quotes it, and the PM read the same words in that session's transcript. It came before ruling 3, which makes the same choice standing.
5. **"Yes, fix the spec (Recommended)", at 18:23 EST, in the PM's session.** The PM asked: "PR #34, finding 6: spec line 57 says the 0.2-only invalid fixture starts from minimal.yaml moved to 0.2 "and the manifest says so". The manifest doesn't say it; only a comment in the fixture generator does, and every manifest entry has the same five keys. Is line 57 met by the generator's comment alone?" So finding 6 closes as a spec defect, with no code change here.

## Known gaps for the next ordinary docs PR

Cite these rather than raising them as new:

- `README.md` line 7 still says the core "loads an mln-terms/0.1 file".
- S01's two frozen summaries and S02's frozen `termDateFlags` object, which this slice replaces.
- The S02.1 spec's wording on `0.2.json` and on the manifest (ruling 1), line 57 (ruling 5), and the rule finding 1 settles: which schema judges a file whose line 1 is not a marker.
- Finding 9's two edits, if Codex leaves them.
- `AGENTS.md`'s Fable pins move in their own sensitive-path PR (ruling 3).

## What Pass 2 does

1. Cold-read the two Claude commits. `git diff 5132249 be7e30e` is both. `a5d0863` changes one line of product code in `load.ts`, plus its tests. `be7e30e` changes a test helper and adds tests.
2. Reproduce or disprove each row above. Adjudicate finding 1's rule in particular: the spec is silent, so if another rule is right, contest it, and the PM takes it to Beni.
3. Add your own read of the whole PR at the head.
4. Check the mutation floor per claim at the head, using the PR body's rows and Pass 1's. Pass 1 ran its 80 mutants on Node 24.22.2 only, so run a sample on Node 26.13.0.
5. Run the owner's private-list check, counts only, with a readable-file precheck and a nonzero exit on a failed scan, over the diff, every commit message in `origin/main..HEAD`, the PR title and body, and every comment. No Claude seat ran it.
6. Pass M is N/A: this slice has no engine and no golden fixture. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50. Finding 6 needs no code change (ruling 5). Any fix you make follows the skill: reproduce it first, and give each behaviour fix a test that fails without it.

## Sealed appendix for Pass 2

Pass 1's findings and fixes are suspicions to re-derive, not conclusions, and so are this brief's dispositions. Do your own read before opening this.

The PM's runs, in a fresh clone at `be7e30e278e17815ca65f2b37e0f7b9cd16fb8c7` with a fresh `mktemp -d` as `KEEL_DATA_DIR`.

| Check | Command | Result |
| --- | --- | --- |
| Install and verify at `be7e30e` | `pnpm install --frozen-lockfile`, `pnpm verify`, on v24.22.2 and v26.13.0 | Exit 0 for each. Core 177, tooling 122, eight steps ok, status clean |
| Install and verify at `a5d0863` | The same, after `git checkout a5d0863` | Exit 0 for each. Core 173, tooling 122, eight steps ok, status clean |
| CI | `gh run list --repo BeniCheni/keel --commit be7e30e278e17815ca65f2b37e0f7b9cd16fb8c7 --json databaseId,event,conclusion`; the same for `a5d0863` | Run 43114888246, `pull_request`, success. No run for `a5d0863`, which was pushed together with `be7e30e`; its green rests on local runs, Pass 1's and the PM's |
| Authors | `git log --format='%h %an <%ae>' origin/main..HEAD` | `be7e30e` and `a5d0863` Claude `<noreply@anthropic.com>`; `5132249` Cursor `<cursoragent@cursor.com>` |
| Diff of the fixes | `git diff --stat 5132249 HEAD` | 3 files, 88 insertions, 6 deletions: `load.ts`, `terms.review.test.ts`, `terms.schema.test.ts` |

The PM's mutants, each one exact edit followed by `pnpm --filter @keel/core exec vitest run --config vitest.config.mjs` on v24.22.2, with the file restored after each and `git status --porcelain --untracked-files=all` empty at the end:

| Mutant | At `be7e30e` | At `5132249` |
| --- | --- | --- |
| Finding 1's line reverted (`lineSchema ?? "mln-terms/0.1"`) | Exit 1: `a 0.2 file with a line 1 fault is schema-line alone, not also judged against 0.1` | Not applicable |
| The old digest helper restored | Exit 1: `the digest reads a character outside ASCII as its UTF-8 bytes` | Not applicable |
| R26, the title value's `m` to U+016D | Exit 1: `0.1.json stays byte-identical to origin/main` | Exit 0, 171 passed |
| R17, the comparison half dropped | Exit 1: `line 1 picks the schema, and a later schema key naming the other marker is schema-line and duplicate-key` | Exit 0, 171 passed |
| R28, the real-date check skipped on candidates | Exit 1: `a final valuation candidate that is not a real date is invalid-date at that candidate` | Exit 0, 171 passed |
| R29, the message naming 0.1 only | Exit 1: `the schema-line message names both markers` | Exit 0, 171 passed |

At `be7e30e` each mutant failed exactly one test, of 177.

The mutant driver, for re-running. Run it as `python3 -I mutants.py <clone>` from outside the clone, after `pnpm install --frozen-lockfile`:

```python
# Applies one exact-string mutation at a time in the clone, runs the core suite, records the result, restores the file.
import json, subprocess, sys, re
clone = sys.argv[1]
M = [
 ("fix1-revert", "packages/core/src/terms/load.ts", 'lineSchema ?? dataSchema ?? "mln-terms/0.1"', 'lineSchema ?? "mln-terms/0.1"'),
 ("hash-revert", "packages/core/src/terms/terms.schema.test.ts",
  'const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));',
  'const bytes = new Uint8Array(text.length);\n  for (let index = 0; index < text.length; index += 1) {\n    bytes[index] = text.charCodeAt(index);\n  }\n  const digest = await crypto.subtle.digest("SHA-256", bytes);'),
 ("R26-title-value", "schemas/mln-terms/0.1.json", '"title": "mln-terms/0.1"', '"title": "ŭln-terms/0.1"'),
 ("R17-drop-compare", "packages/core/src/terms/load.ts", 'if (dataSchema === null || (lineSchema !== null && dataSchema !== lineSchema)) {', 'if (dataSchema === null) {'),
 ("R28-candidates", "packages/core/src/terms/checks.ts", '    owner === "dates.final_valuation" ||\n', '    (owner === "dates.final_valuation" && path === owner) ||\n'),
 ("R29-message", "packages/core/src/terms/messages.ts", '"Line 1 is not the schema marker mln-terms/0.1 or mln-terms/0.2"', '"Line 1 is not the schema marker mln-terms/0.1"'),
]
out = []
for name, rel, a, b in M:
    path = f"{clone}/{rel}"
    text = open(path, encoding="utf-8").read()
    n = text.count(a)
    if n != 1:
        out.append({"mutant": name, "error": f"anchor count {n}"}); continue
    open(path, "w", encoding="utf-8").write(text.replace(a, b))
    r = subprocess.run(["pnpm", "--filter", "@keel/core", "exec", "vitest", "run", "--config", "vitest.config.mjs"], cwd=clone, capture_output=True, text=True)
    log = r.stdout + r.stderr
    failed = sorted(set(re.findall(r"(?:FAIL|×)\s+\S+\.test\.ts\s*>\s*(.+?)(?:\s+\d+ms)?$", log, re.M)))
    summary = re.findall(r"^\s+Tests\s+(.+)$", log, re.M)
    subprocess.run(["git", "checkout", "--", rel], cwd=clone, check=True)
    out.append({"mutant": name, "exit": r.returncode, "tests": summary[-1] if summary else None, "failed": failed[:6]})
status = subprocess.run(["git", "status", "--porcelain", "--untracked-files=all"], cwd=clone, capture_output=True, text=True).stdout
out.append({"status_lines_after": len(status.splitlines())})
print(json.dumps(out, indent=1, ensure_ascii=True))
```

At `5132249` the first two rows report `anchor count 0`, because the lines they revert do not exist yet.
