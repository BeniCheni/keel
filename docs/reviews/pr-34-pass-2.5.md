# Executive brief: PR #34, Pass 2.5, 2026-11-11 America/New_York

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim.

PR comment: https://github.com/BeniCheni/keel/pull/34#issuecomment-6810769704

## Decision

Shadow mode: the gate says **"would escalate"** because the PR touches sensitive paths (`schemas/**`, `packages/core/**`) and changes the terms schema; Beni merges. The review verdict is **mergeable**: every High is closed, nothing is contested, and `verify` is green at `902a9ecd62f147b31bfbf1c0f5a2b81363f04b6d` on both Nodes and in CI.

## What ships

- A terms file on schema `mln-terms/0.2` can state the note's final valuation date, with its provenance. Files on 0.1 still load, and a 0.1 file that states the term is rejected as `unknown-key`.
- keel counts the date among the payoff terms. It is verified only when present as one `primary` term backed by a listed primary source; absent, conflicting or any other status stays unverified. The total becomes 13 plus the number of members.
- A value that is not a real calendar date is an error, and a weekend date is flagged, candidates included.
- keel does not compare the date with trade, maturity or the schedule, does not estimate it, and the schedule does not read it yet. S03 owns those.
- No release, no new dependency, no network request.

## What the passes found

- **Pass 1** (Claude Code, at `5132249`, fixes to `be7e30e`): no High. Nine findings:
  - Mediums 1 to 5 were fixed in `a5d0863` and `be7e30e`: the line 1 fallback, the byte-identity hash, and three untested behaviours.
  - Medium 6 is a spec defect (line 57).
  - Lows 7 to 9 need no change.
- **Pass 2** (Codex, at `be7e30e`, fix `902a9ec`): accepted all nine and contested nothing. Its own finding 1 is a High: a surviving mutant on the provenance boundary of the new term, closed by a test in `902a9ec`. Pass M is N/A. Codex's claim: the private-list check gave 0 on every surface.
- **Pass 2.5 corroboration:**
  - **Cold read of `902a9ec`.** The commit is one test, 37 insertions in `terms.honesty.test.ts`, with no product code. I agree it closes the High.
    - Pass 2's three mutants each exit 0 with 177 passed at `be7e30e`. At the head each exits 1 with 1 failed and 177 passed, failing only the new test. Both Nodes give the same result.
    - My K1 to K4 split the mutants by arm (direct term, candidates; source-kind, source-missing). Each arm fails alone at the head and survives at `be7e30e`.
    - The assertion requires exactly one error, by code and path. I checked that `toMatchObject` rejects an extra array element.
  - **Is it High? Yes.** Under the source-kind mutant, a date marked `primary` with a `document` source loads and counts as verified, 16 of 17; the head reports `source-kind`. Under the missing-source mutant, a date naming no listed source does the same. That is hard rule 6's line.
  - **Does it close? Yes.** It is a fix commit in tracked files with a test that fails without the guarded check. PR #3 closed two surviving-mutant Highs test-only by your ruling of 2026-10-31 (`docs/reviews/pr-3-pass-2.5.md`, question 1).
  - **Pass 1's Mediums 1 to 5 stay closed.** The six mutants in the Pass 1.5 driver each exit 1 at the head, with one test failed of 178.
  - **Finding 1's rule.** Four malformed-marker 0.2 inputs give `schema-line` alone at the head.
  - **Decision 3.** A final valuation date before trade, at trade, at maturity, after maturity and before the first call each loads with no error, warning or flag.
  - **Frozen values.** Both summaries and the `[]` flags match the spec.
- **Out of scope, carried (Medium, off the boundary):** in S01's source checks, which this PR does not change, two generic mutants pass all 178 tests. G6 skips conflict candidate 0 in `walk`; G7 runs the source-kind check for `primary` status only. A conflict or a non-primary term never verifies, so neither crosses the verification line. You ruled "Carry" in this session.
- **Contested:** none.

## Verification as re-run

All at `902a9ec`, in the fresh clone, with `KEEL_DATA_DIR` set to one empty `mktemp -d` (0 entries after the runs).

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | Exit 0 on Node 24.22.2 and 26.13.0 |
| Verify | `pnpm verify` | Exit 0 on both; eight steps `ok`; core 178 passed in 16 files, tooling 122 passed in 10 files; `git status --porcelain --untracked-files=all` empty after |
| CI | `gh run list --commit 902a9ec… --json …`, `gh pr checks 34` | Run 43124329982, `pull_request`, success; four cells and `verify` pass |
| Determinism | The skill's command (`pnpm fixtures:regen && sh -c '…'`) | Exit 0 on 24.22.2; `git status … -- fixtures` prints nothing; the step is also `ok` inside `verify` on both Nodes |
| Zero network | `pnpm verify:network` | Exit 0 (the macOS in-process guard; the Linux namespace probe runs only in CI) |
| Quickstart | Each README command, Node 24.22.2 | All as the README says; detail below |
| Tripwire | `node tools/tripwire/cli.mjs` | Exit 0, 0 hits in all ten classes; detail below |
| Mutations | Driver below | 18 distinct mutants; table below |
| Honesty | `git grep -c -E '^[[:space:]]*(test\|it)(\.each\([^)]*\))?\(' <rev> -- '*.honesty.test.ts'` | Schedule 14 and terms 8 at `origin/main`; 14 and 12 at the head. No `.skip`, `.only` or `.todo` added by the diff |
| Schema | `git rev-parse origin/main:schemas/mln-terms/0.1.json HEAD:…`, `shasum -a 256` | One blob id twice; SHA-256 `411d100f…de78`, the pinned value. `0.2.json` with the term removed and three names reset equals `0.1.json`, key order included |
| Diff | `git diff --shortstat origin/main...HEAD` | 25 files, 3151 insertions, 47 deletions; 4 commits; base `58845e2` has not moved |
| Unchanged files and dependencies | `git diff --exit-code origin/main...HEAD -- <AC1, AC5, AC9 files, README, CHANGELOG, docs, package files>` | Exit 0 |
| Pass M | n/a | N/A: no engine and no golden fixture (`ls fixtures/golden` reports no such directory) |
| UI matrix | n/a | N/A: no UI in the diff |
| Demo mode | `grep -c -i demo README.md` prints `0` | N/A, not green: the known gap of idea 50 |

**Quickstart detail.** The eight `pnpm verify:<step>` commands exit 0. `pnpm --filter @keel/core test` gives 178 in 16 files, `… test terms` 55 in 8, and `… test schedule` 122 in 7. A filter matching no file exits 1. `pnpm test:tooling` gives 122 in 10 files, and `pnpm test:tooling -- tripwire` 44 in 1. `pnpm fixtures:regen` exits 0, and `pnpm -s fixtures:trees` prints `fixtures/synthetic/terms`. `pnpm test:ci-evidence -- --success-run 43124329982 --failure-run 41113925991` prints `ci-evidence ok`.

**Tripwire detail.** `cusip`, `account`, `ssn`, `address`, `email`, `price`, `allowlist`, `vendors`, `local-only` and `unscannable` are each 0, over 210 tracked files and 4 commit messages. I ran it twice more with a scratch file staged by `git add -N`:

- The PR title, body, both earlier comments and my comment draft: 0 hits.
- My comment as posted, plus the squash message: 0 hits.

A control file with one SSN-shaped synthetic string gave exit 1 and 1 `ssn` hit, so staged files are scanned. The scratch files are removed and the tree is clean.

**Mutations.** Each run is `pnpm --filter @keel/core exec vitest run --config vitest.config.mjs` after one exact edit, with the file restored after.

| Mutant | `be7e30e` | `902a9ec` | Nodes |
| --- | --- | --- | --- |
| C1 source-kind, C2 source-missing, C3 candidate sources (Pass 2's) | Exit 0, 177 passed | Exit 1, 1 failed and 177 passed: the new test | Both |
| K1 to K4, the same split by arm | Exit 0, 177 passed | Exit 1, 1 failed and 177 passed: the new test | Both |
| K5, the term left out of `eachTerm` | Exit 1, 4 failed | Exit 1, 5 failed | Both |
| K6 candidate 0 only, K7 non-primary status only | Exit 0 | Exit 0, 178 passed | Both |
| G6, G7, the generic forms of K6 and K7 | not run | Exit 0, 178 passed | 24.22.2 |
| Pass 1's six: `fix1-revert`, `hash-revert`, R26, R17, R28, R29 | not run | Exit 1, 1 failed and 177 passed, each on its named test | 24.22.2 |

Not re-run, and why:

- **The owner's private-list check.** No Claude seat runs it. Codex's 0 on every surface is Codex's claim, and it predates my comment, so it needs one more run over that comment before the merge.
- **The builder's 24 mutant rows, Pass 1's other 74 mutants, the generator mutants, and Pass 2's Node 26 replays.** The mutation floor per claim rests on those two seats.
- **The PM's probe rows A to L, and PR-body claims 11 to 18 one by one.** They are covered only by the suite passing.
- **Codex's model, effort and sub-agent, and Cursor's effort.** These are as recorded; no command re-runs them.

## Estimates and model output

None.

## Risks and accepted costs

- **Docs now trail the code.** The PM carries these to the next ordinary docs PR:
  - README line 7 still says the core loads an `mln-terms/0.1` file.
  - The S01 and S02 specs hold frozen values this slice replaces.
  - The S02.1 spec's wording differs on `0.2.json`, the manifest and line 57.
- **The spec is silent on one rule.** A file whose line 1 is not a marker is judged by line 1, else the parsed marker, else 0.1, and it still fails with `schema-line`. The PM and Codex accepted this; it goes into the spec.
- **Two dead-code lines stay** (finding 9), with no observable effect.
- **The S01 source-check gap is carried**, as above.
- **`AGENTS.md` on main still pins Fable 5.1.** PR #35 is open and in draft.
- **Process notes:**
  - The clone is in `~/code/keel-pr-34-p25` rather than the skill's `/tmp/keel-pr-34`, as the prompt directed; it is a fresh clone either way.
  - The skill calls this seat "the PM in a fresh session" and the prompt says "not the PM". I read both as a fresh Claude session that wrote none of the build or fixes.
  - Ruling 2 is on main at `docs/reviews/pr-32-pass-1.5.md:54`.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes: versions stay `0.0.0`, `CHANGELOG.md` untouched |
| Verdict mergeable, every High closed | Yes: Pass 2 finding 1 closed by `902a9ec`; no other High |
| Nothing contested | Yes |
| `verify` green at tip; every number re-run | Yes, for every number in this brief; the list above is not verified |
| No sensitive path, dependency or schema change | **No**: `schemas/**` (1 file), `packages/core/**` (18 files), terms schema 0.2. No dependency |
| Every commit cold-read by a non-author vendor | Yes: `5132249` Cursor, read by Claude; `a5d0863` and `be7e30e` Claude, read by Codex; `902a9ec` Codex, read here |
| Gate verdict | **would escalate** |
| Beni's decision (filled after) | Merged on 2026-11-11 at 20:49 EST at squash `3804dc3`, with his private-list scan of PRs #34 and #35 reported all zero |

## Questions for Beni

None open. You answered four in this session, between 19:26 and 19:33 EST:

1. Fable 5.2 is the pin for this PR's Claude seats, Extra at Pass 1 and High here: **Yes**. The session reports `claude-fable-5-2`, effort `high`.
2. Ruling 1 confirmed: **Yes**.
3. Ruling 5 confirmed: **Yes**.
4. The S01 source-check gap: **Carry**.

## Handoff block

```bash
# Before merging: one more private-list run over issuecomment-6810769704 (Codex or Beni; no Claude seat runs it).
gh pr view 34 --repo BeniCheni/keel --json headRefOid --jq .headRefOid   # must print 902a9ecd62f147b31bfbf1c0f5a2b81363f04b6d
gh pr checks 34 --repo BeniCheni/keel
gh pr ready 34 --repo BeniCheni/keel
gh pr merge 34 --repo BeniCheni/keel --squash --match-head-commit 902a9ecd62f147b31bfbf1c0f5a2b81363f04b6d --subject "feat(core): state the final valuation date in schema 0.2 (#34)" --body-file - <<'EOF'
Adds terms schema mln-terms/0.2: schema 0.1 plus an optional dates.final_valuation term, with 0.1.json byte-identical. The loader reads both versions and picks the schema from line 1, and a 0.1 file that states the term is unknown-key. The verification summary counts the term as a payoff path after dates.first_call_observation, verified only as one primary term, so the total becomes 13 plus the number of members. The loader's dateFlags and termDateFlags gain the key. The terms generator moves to version 2 with the same seed. Also pins the purity glob's recursion (PR #30, Medium 2.5-1) and two loader orderings (idea 29). No release and no new dependency.

Review: Pass 1 found no High and fixed five Mediums in a5d0863 and be7e30e; its finding 6 closed as a spec defect by the owner's ruling of 2026-11-11. Pass 2 accepted all nine findings and added 902a9ec, a test that closes one High: a surviving mutant on the provenance boundary of the new term. Pass 2.5 gave the cold read of 902a9ec and found no High open. Carried to the PM's list: README line 7, the frozen values in the S01 and S02 specs, the S02.1 spec wording, two dead-code lines, and an older gap in S01's source checks. The Claude seats ran on Fable 5.2 by the owner's ruling, against the Fable 5.1 pin. Shadow gate: would escalate, because sensitive paths are touched and the terms schema changes. Reviewed head 902a9ecd62f147b31bfbf1c0f5a2b81363f04b6d.

Co-authored-by: Cursor <cursoragent@cursor.com>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
EOF
git checkout main && git pull
test "$(git rev-parse origin/main)" = "$(gh pr view 34 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" && echo "origin/main equals the squash commit"
pnpm install --frozen-lockfile
pnpm verify
# Demo mode: N/A, not green. The README has no demo step (idea 50). Not a release, so no tag.
```

The three trailers match `git log --format='%an <%ae>' origin/main..HEAD` in this clone (Cursor, Claude, Codex) and the review comments (Claude at Passes 1 and 2.5, Codex at Pass 2).

## Scripts

The mutant driver is the one in the Pass 1.5 brief, with a no-edit control run added and these rows. Run it as `python3 -I mutants.py <clone>` from outside the clone. Every row edits `packages/core/src/terms/checks.ts`. C1 to C3 are the three rows the Pass 1.5 brief prints.

```python
KIND = '      else if (source.kind !== term.status) {'
MISS = '      if (!source) errors.push(diagnostic(fileName, "source-missing", sourcePath, pos.line, pos.column));'
FV = '"dates.final_valuation"'
M = [
 ("K1-kind-direct-only", KIND, f'      else if (source.kind !== term.status && path !== {FV}) {{'),
 ("K2-kind-candidates-only", KIND, f'      else if (source.kind !== term.status && !(dateOwner(path) === {FV} && path !== dateOwner(path))) {{'),
 ("K3-missing-direct-only", MISS, f'      if (!source) {{ if (path !== {FV}) errors.push(diagnostic(fileName, "source-missing", sourcePath, pos.line, pos.column)); }}'),
 ("K4-missing-candidates-only", MISS, f'      if (!source) {{ if (!(dateOwner(path) === {FV} && path !== dateOwner(path))) errors.push(diagnostic(fileName, "source-missing", sourcePath, pos.line, pos.column)); }}'),
 ("K5-term-not-walked", '  one("dates.final_valuation", terms.dates.final_valuation);\n', ''),
 ("K6-kind-candidate0-only", KIND, '      else if (source.kind !== term.status && path !== "dates.final_valuation.candidates[0]") {'),
 ("K7-kind-nonprimary-status", KIND, f'      else if (source.kind !== term.status && !(dateOwner(path) === {FV} && term.status !== "primary")) {{'),
 ("G6-walk-skips-candidate-0", '      walk(`${path}.candidates[${index}]`, candidate, visit);', '      if (index > 0) walk(`${path}.candidates[${index}]`, candidate, visit);'),
 ("G7-kind-checked-for-primary-only", KIND, '      else if (source.kind !== term.status && term.status === "primary") {'),
]
```

The provenance probe. Run it from the repo root as `node --input-type=module < probe.mjs`, intact and then under C1 and C2:

```js
import { readFileSync } from "node:fs";
import { loadTerms, verificationSummary } from "./packages/core/src/index.ts";
const base = readFileSync("fixtures/synthetic/terms/valid/minimal.yaml", "utf8")
  .replace("schema: mln-terms/0.1\n", "schema: mln-terms/0.2\n")
  .replace("sources:\n", "sources:\n  doc-source:\n    kind: document\n    file: sources/doc-source.pdf\n");
for (const source of ["supplement", "doc-source", "missing-source"]) {
  const text = base.replace("underlyings:\n", `  final_valuation:\n    value: 2031-07-09\n    status: primary\n    source: ${source}\nunderlyings:\n`);
  const r = loadTerms(text, "minimal.yaml");
  const s = r.ok ? verificationSummary(r.terms) : null;
  console.log(source, JSON.stringify(r.ok
    ? { status: r.terms.dates.final_valuation.status, verified: !s.unverified.includes("dates.final_valuation"), summary: `${s.verified}/${s.total}` }
    : r.errors.map(({ code, path }) => ({ code, path }))));
}
```

- **Intact:** `supplement` is verified at 16/17, `doc-source` gives `source-kind`, and `missing-source` gives `source-missing`, both at `dates.final_valuation.source`.
- **Under C1:** `doc-source` loads as `primary`, verified, 16/17.
- **Under C2:** `missing-source` does the same.

The Decision 3 inputs are `minimal.yaml` moved to 0.2 with the term set to `2026-02-27`, `2026-03-02`, `2031-03-03`, `2031-03-05` and `2026-08-31`. The finding 1 inputs are the four in Pass 1's probe.

Nothing was pushed, nothing was merged, and the PR is still a draft. I stop here.

## Records note (PM, 2026-11-11)

Written by the PM for the records PR, after the merge. Everything above is the seat's chat message, read as data from its session transcript. The PM changed one line, the gate log's last row.

- **The four questions.** The seat asked them in its own session in one question form, at 19:26:53 EST, and the transcript records Beni's answers at 19:31:36 EST:
  - "Yes": Fable 5.2 is the pin for this PR's Claude seats, Extra at Pass 1 and High at Pass 2.5. This confirms first-hand what rulings 3, 4 and 6 had recorded.
  - "Yes": ruling 1.
  - "Yes": ruling 5.
  - "Carry (Recommended)": the older gap in S01's source checks.

  The brief's span, 19:26 to 19:33 EST, covers both times.
- **Ruling 6.** The PM never saw Beni's reconciliation in the Pass 2 session. The first question above settles the same point in Beni's own answer.
- **The handoff.** Beni ran only the GitHub commands: `gh pr ready 34` and the pinned `gh pr merge`, with its message in a heredoc. The block's first line called for one more private-list run, and the PM gave Beni the script below for it. The PM ran the block's local-checkout steps in a fresh clone after the merge, as recorded below.
- **The base moved.** PR #35 merged first, at 20:36 EST, as `9d74d05`. Before this merge the PM made a local trial merge of `902a9ec` onto `9d74d05`, which was never pushed. It had no conflicts and tree `8e45d841488eab3ae90286602b33cd3504273a5f`. `pnpm install --frozen-lockfile && pnpm verify` exited 0 on it on Node 24.22.2 and 26.13.0, with 178 core and 122 tooling tests.
- **The private-list scan.** The PM gave Beni the script below to run before the merge. It covers PRs #34 and #35 on every surface: diff, commit messages, title and body, issue comments, reviews and review comments. It also covers both squash messages, this PR's as planned and PR #35's as merged. It caught both PRs' Pass 2.5 comments, which were posted after Codex's last scan. Beni reported "Yes, all zero" at 21:06 EST in the PM's session, answering "Did the private-list scan end with exit 0 and every line at 0?". He reported the outcome, not the counts.
- **The merge.** Beni merged at 20:49 EST (`2026-11-12T01:49:24Z`): squash `3804dc3122fa9367cf971177417a475713f43e13`, parent `9d74d05302910cdde211def5cb255468674a174c`.
  - The tree is `8e45d84`, equal to the trial merge's.
  - Against the reviewed head `902a9ec`, the squash differs only in `AGENTS.md` and `CHANGELOG.md`, PR #35's two files.
  - The squash message equals the handoff block's subject and body, with trailers Cursor, Claude and Codex.
  - The branch `s02.1/final-valuation` is deleted.
- **The post-merge checks.** In a fresh clone at `3804dc3`, `pnpm install --frozen-lockfile` and `pnpm verify` exited 0 on Node 24.22.2 and 26.13.0: 178 core and 122 tooling tests, eight steps ok, and a clean tree afterwards. Push run 43137130914 succeeded on `3804dc3`, with all four cells and `verify`.
- **The Fable pin.** This PR's branch kept `AGENTS.md` at Fable 5.1, and its Claude seats ran on Fable 5.2 by rulings 3, 4 and 6. PR #35 moved the pins on `main` before this merge.
- **Still open.** The next ordinary docs PR takes:
  - `README.md` line 7;
  - the frozen values in the S01 and S02 specs;
  - the S02.1 spec's wording on `0.2.json`, the manifest and line 57;
  - the line 1 fallback rule.

  Finding 9's two dead-code lines and the S01 source-check gap are code. They go to the ideas list for the next slice that can carry them. The S03 build comes next.

The scan Beni ran (SHA-256 `7b387aecd5e85cdf0ba3fe3f29bf4b7504eb88953c2c376db10ea780fbf805c6`):

```bash
bash <<'SCRIPT'
set -u
F="${KEEL_PRIVATE_LIST:-$HOME/.config/keel/private-terms.txt}"
R=BeniCheni/keel
{ test -r "$F" && test -s "$F"; } || { echo "list unreadable or empty"; exit 2; }
W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT
grep -v '^[[:space:]]*$' "$F" > "$W/p" || { echo "list has no patterns"; exit 2; }
head -n 1 "$W/p" > "$W/control"
c="$(grep -F -i -c -f "$W/p" "$W/control")"
[ "$c" = 1 ] || { echo "control failed"; exit 2; }
echo "control: ok"
cat > "$W/squash-34" <<'MSG'
feat(core): state the final valuation date in schema 0.2 (#34)

Adds terms schema mln-terms/0.2: schema 0.1 plus an optional dates.final_valuation term, with 0.1.json byte-identical. The loader reads both versions and picks the schema from line 1, and a 0.1 file that states the term is unknown-key. The verification summary counts the term as a payoff path after dates.first_call_observation, verified only as one primary term, so the total becomes 13 plus the number of members. The loader's dateFlags and termDateFlags gain the key. The terms generator moves to version 2 with the same seed. Also pins the purity glob's recursion (PR #30, Medium 2.5-1) and two loader orderings (idea 29). No release and no new dependency.

Review: Pass 1 found no High and fixed five Mediums in a5d0863 and be7e30e; its finding 6 closed as a spec defect by the owner's ruling of 2026-11-11. Pass 2 accepted all nine findings and added 902a9ec, a test that closes one High: a surviving mutant on the provenance boundary of the new term. Pass 2.5 gave the cold read of 902a9ec and found no High open. Carried to the PM's list: README line 7, the frozen values in the S01 and S02 specs, the S02.1 spec wording, two dead-code lines, and an older gap in S01's source checks. The Claude seats ran on Fable 5.2 by the owner's ruling, against the Fable 5.1 pin. Shadow gate: would escalate, because sensitive paths are touched and the terms schema changes. Reviewed head 902a9ecd62f147b31bfbf1c0f5a2b81363f04b6d.

Co-authored-by: Cursor <cursoragent@cursor.com>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
MSG
gh api repos/$R/commits/9d74d05302910cdde211def5cb255468674a174c --jq .commit.message > "$W/squash-35" < /dev/null || { echo "PR #35 squash fetch failed"; exit 2; }
status=0
for N in 34 35; do
  gh pr diff $N --repo $R > "$W/diff-$N" < /dev/null || { echo "#$N diff fetch failed"; exit 2; }
  gh api --paginate repos/$R/pulls/$N/commits --jq '.[].commit.message' > "$W/commits-$N" < /dev/null || { echo "#$N commits fetch failed"; exit 2; }
  gh pr view $N --repo $R --json title,body --jq '.title, .body' > "$W/title-body-$N" < /dev/null || { echo "#$N PR fetch failed"; exit 2; }
  gh api --paginate repos/$R/issues/$N/comments --jq '.[].body' > "$W/comments-$N" < /dev/null || { echo "#$N comments fetch failed"; exit 2; }
  gh api --paginate repos/$R/pulls/$N/reviews --jq '.[].body' > "$W/reviews-$N" < /dev/null || { echo "#$N reviews fetch failed"; exit 2; }
  gh api --paginate repos/$R/pulls/$N/comments --jq '.[].body' > "$W/review-comments-$N" < /dev/null || { echo "#$N review comments fetch failed"; exit 2; }
  echo "comments on PR #$N now: $(gh api repos/$R/issues/$N --jq .comments < /dev/null)"
  for s in diff commits title-body comments reviews review-comments squash; do
    f="$W/$s-$N"
    test -s "$f" || [ "$s" = reviews ] || [ "$s" = review-comments ] || { echo "#$N $s: empty, scan failed"; status=2; continue; }
    n="$(grep -F -i -c -f "$W/p" "$f")"; rc=$?
    if [ "$rc" -gt 1 ]; then echo "#$N $s: scan failed"; status=2
    else echo "#$N $s: $n matching lines"; [ "$n" = 0 ] || { [ "$status" = 2 ] || status=1; }
    fi
  done
done
echo "exit $status"
exit $status
SCRIPT
```
