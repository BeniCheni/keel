# Pass 1.5 brief: PR #16

Written by the PM on 2026-11-02 (America/New_York) after reading Cursor's Pass 1 comment on PR #16 ([issuecomment-6587500288](https://github.com/BeniCheni/keel/pull/16#issuecomment-6587500288); reviewed head `8c0deaf`, verdict "not mergeable"). Cursor pushed nothing, by the Pass 0 brief. The PM's post-Pass-1 head is `044690cad4000c1890a815be37c87b7bd8e11ead`. Codex receives this brief for Pass 2. Like the Pass 0 brief, it lives on branch `docs/pr-16-records`, not on the PR branch.

Seventeen of the eighteen findings are accepted as stated, one is accepted and disputed in part, and none goes to Cursor as rework. The PM applied the accepted wording in `b6cbcc9` and `044690c`. One High closes with a CI re-run and Beni's confirmation, and the other closes with that commit. Beni ruled on eleven questions, including all seven Cursor raised.

## How this brief adjudicated

Each "Reproduced" below comes from a run in this session at `8c0deaf`, in a fresh clone, on Node v24.22.2, with a fresh `mktemp -d` as `KEEL_DATA_DIR`. "Read" means the PM checked the cited lines and ran nothing. Apple pages that only Cursor read are marked. No user data folder and no private list was opened. No Swift or Xcode command has been run by anyone, because this Mac has no full Xcode.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | High | accept; closes on a green re-run with Beni's confirmation | **Reproduced.** `gh run view 41510891687 --json jobs` shows the macOS Node 26 cell cancelled with no steps, and the `verify` job printing `needs-check: cells result is abandoned`. It is a runner failure and no code fault: local `pnpm verify` exits 0 on both Nodes, on Cursor's run and on the PM's at `main`. The same cancellation hit `main` at `2ed7b44` (run 41510620550) and an earlier PR #14 run, per Cursor. The PM re-ran both failed runs with `gh run rerun --failed`. `b6cbcc9` also starts a fresh run for this PR | no |
| 2 | High | accept; closed by `b6cbcc9` | **Read.** The spec and ADR let a reminder state a stale fact, and an as-of date elsewhere in the body does not undo that. Applied with W2's sense in both files, adding that an estimated date says it is estimated | no |
| 3 | Medium | accept | **Reproduced.** `grep -n '^\| 9.1 ' docs/proposals/0001-product-research.md`: the story sentence names the three, and the acceptance says only "Round-trip import reproduces the same state". The PM's error. `display_name` joins the gap table | no |
| 4 | Medium | accept | **Read.** A median of 450 ms was both a clause pass and "unresolved". Beni's rulings 1 and 2 settle it, and the band was the PM's addition, so the conflict was the PM's | no |
| 5 | Medium | accept, reworded | **Read.** Cursor's text says clause 1 fails. If `compile` passes parity and only misses the load threshold, the failing clause is 2. The spec now says the unedited core has not met the rule at that SHA | no |
| 6 | Medium | accept | **Reproduced.** Section 3's chart 4 row lists "Terms only" (`awk -F'\|' '/^\| 4 \| Payoff/{print $5}' docs/proposals/0001-product-research.md`). Rows 5.2, 5.4, 7.1 and 7.2 and the floor now say per notional. The purchase sentence joins the floor as a **No** | no |
| 7 | Medium | accept | **Read.** Applied in the spec and the ADR | no |
| 8 | Medium | accept | **Read.** `packages/core/src/terms/dates.ts` flags weekends only, and S01's stories line says holidays arrive with the schedule slice | no |
| 9 | Medium | accept, with a different reason for the window | **Read.** The step from 55 to a window did not follow. T-1 plus A8's observation-date timer are two requests per observation, 110 before A5 and A9, which is the real reason. The 64 itself stays a lead: Cursor's fetch of the forum thread returned 403, the PM read it only through a search result, and Apple's page, as Cursor read it, states no number | no |
| 10 | Medium | accept | The PM read guideline 4.7 and 5.1.1(ix) itself earlier the same day and agrees. The privacy manifest and export compliance rest on Cursor's reading, and the spec says so | no |
| 11 | Medium | accept | **Read.** By the spec's own definition. Role counts become 10, 23 and 15. Also applied from Cursor's question 3: 6.8's writing is desktop-only | no |
| 12 | Medium | accept | **Read.** Section 11's `alert_firings` has `acknowledged_at` | no |
| 13 | Medium | **accept and dispute** | See "The one dispute" | no |
| 14 | Medium, marked Build-easier | accept | **Reproduced.** On a planted `spike/ios-core/check-bundle.mjs`, `node tools/boundary/cli.mjs` exits 1 for a comment that spells out a `require` call of the Monte Carlo package, and 0 for the word `montecarlo` alone. An escaped string form exits 0. The mark is fair: the builder learns a trap, and the check stays as it is. The PM did not re-run the NUL-byte case | no |
| 15 | Medium | accept | **Read** for the warm-run point. Xcode 7's note is Cursor's reading. Beni's ruling 6 moves the gate to fresh launches | no |
| 16 | Low | accept | **Read.** Applied | no |
| 17 | Low, marked Build-easier | accept | **Read.** It tightens the floor. Each row now needs a command that exits nonzero | no |
| 18 | Low | accept | **Read.** Applied in the ADR | no |

Also applied, from Cursor's plan-challenge notes:

- "At the system's discretion" was the PM's wording and is not on Apple's page, so the spec now states what `earliestBeginDate` does.
- Guideline 2.5.2's paraphrase is restored to "introduces or changes".
- `fast-uri`'s `new URL` joins the Q1 traps.
- **L** is now sized two ways.
- App IDs and device registrations also expire after 7 days.
- A detail page opened from the lock screen waits for unlock.

The PM adds one limit Cursor's note 1 implies: a pass measures the terms loader only, and the spec now says so under "What a pass does not prove".

Slip, this seat: `b6cbcc9` quoted, in the spec itself, the exact text finding 14 warns about. The boundary walk reads docs as well, so `node tools/boundary/cli.mjs` printed `boundary docs/specs/s90-ios-core-spike.md 295`, and three CI cells failed on run 41519459842. The PM had not run `pnpm verify` before that push, because the diff was docs. `044690c` rewords the sentence, and `pnpm verify` exited 0 on v24.22.2 and v26.13.0 before it went up. The spec now says the walk covers docs.

## The one dispute

Cursor's W13, and its "Killed as unreproducible" row "`new Ajv` throws if `console` is missing", tested with `console` set to `undefined`. That leaves the global's binding in place, and it is not a host with no `console`. With the binding absent, `new Ajv` throws. The PM therefore accepts W13's `yaml` half and contests its `ajv` half: for a host with no `console`, the trap stands, and the bundle would not load.

```js
// node console-probe.mjs <clone> absent, then the same with undefined. From a clone after pnpm install.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const [root, mode] = process.argv.slice(2);
const require = createRequire(join(root, "packages/core/package.json"));
const Ajv = require("ajv/dist/2020.js").default;
const schema = JSON.parse(readFileSync(join(root, "schemas/mln-terms/0.1.json"), "utf8"));
if (mode === "absent") delete globalThis.console; else globalThis.console = undefined;
try { new Ajv({ allErrors: true, strict: true }).compile(schema); process.stdout.write(`${mode}: compile completed\n`); }
catch (e) { process.stdout.write(`${mode}: ${e.name}: ${e.message}\n`); }
```

| Mode | `new Ajv` and `compile` | `example-autocall.yaml` through `yaml`'s browser `parseDocument` and `toJS` | `? [a, b]` through the same |
| --- | --- | --- | --- |
| `absent` | `ReferenceError: console is not defined` | no throw, 0 warnings | `ReferenceError: console is not defined` |
| `undefined` | completes | no throw, 0 warnings | `TypeError: Cannot read properties of undefined (reading 'warn')` |

Whether a JSContext defines `console` is what decides it, and nobody has run that. `BundleLoadTests` will show it. This is a disagreement between vendors on a fact, so Codex settles it with its own run at Pass 2. It changes no plan: the spec states both hosts.

## Pass 2's comment, as the PM takes it up

Codex completed Pass 2 ([issuecomment-6588858035](https://github.com/BeniCheni/keel/pull/16#issuecomment-6588858035)), on GPT-6.1 Sol High with no fallback, with the verdict "not mergeable", and pushed one commit, `804720e`. It accepts all eighteen of Cursor's findings, disputing the characterisation of 5 and the breadth of 15. It reports nine of its own, C1 to C9, and fixes C1 to C8 in that commit. Its reading of the Ajv and `console` dispute agrees with this brief: an absent binding throws, and a binding set to `undefined` does not. No JSContext has been run on it.

**C9, the High, is right.** Row 2 above says `b6cbcc9` closed finding 2. `AGENTS.md` closes a High in tracked files only with a fix commit carrying a test that fails without it, and neither that commit nor any other on this docs PR has one. The PM's row overclaimed. No test can land on a PR that holds no code, so the PM put the closure to Beni, who ruled below. `804720e` also removes wording of the PM's that the new rule itself forbade, in the A4 row and the A9 reminder.

This seat does not give the cold read of `804720e`; the fresh Claude session does at Pass 2.5. These checks are what this seat needs for these records, each from a run in this session.

| Check | Command | Result |
| --- | --- | --- |
| Authorship | `git log --format='%h %an' origin/main..c4c3e1f` | `c4c3e1f`, `025f853`, then `804720e` by Codex, and the earlier commits by Claude |
| Role counts, IDs and priorities | Command R in Codex's comment, at `025f853` | 48 IDs and priorities match; 13 Primary, 20 Read-only, 15 Desktop-only |
| `verify` before each PM push | `pnpm install --frozen-lockfile && pnpm verify` on v24.22.2 and v26.13.0 | exit 0 on both; core 33, tooling 122 |
| Addresses in Codex's comment | `gh api repos/BeniCheni/keel/issues/comments/6588858035 --jq .body \| grep -o -E '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' \| grep -v 'noreply@' \| grep -v -c '^cursoragent@cursor\.com$'` | `0` |

Not re-run here: Codex's probes, its source reads and its private-list check. Its check came before the PM's last two commits and the PR body refresh, so the prompt for the short re-read below repeats it.

The PM's take on what `804720e` changed, without giving it a cold read:

- C2 replaces the PM's as-of definition, which a mixed or empty export could make false.
- C3 corrects the ADR's claim that `loadTerms` validates a whole snapshot.
- C4 moves 5.2, 7.1 and 7.2 to Primary, so the role counts differ from those in this brief's earlier sections.
- C5 replaces a check that a Git failure could pass.
- C7 corrects "interpreter-only", which the PM used in the spec and the PR body.
- C8 reads the forum thread directly: the 64 is confirmed, and which requests survive an overflow is not. This supersedes finding 9's note that the 64 stays a lead.

Out-of-scope items for the next ideas batch: a full export envelope with CSV and alert validation, per-series completeness and malformed replacement tests, from Codex's "Deliberately not done". Idea 32 covers part of this.

## Pass 2.5's findings, as the PM takes them up

The first Pass 2.5 is issuecomment-6590526388, at `c4c3e1f`, and `docs/reviews/pr-16-pass-2.5.md` holds its brief. Beni ruled to fix the four Mediums on this PR (ruling 15). The Pass 2.5 seat did not fix them: its prompt told it to push nothing, and `AGENTS.md` bars Pass 2.5 from a session that wrote a fix. The PM made the fix in `8419c84`, in a fresh clone, and completed M2 in `19ea2f5` after Codex's re-read found that command could still fail open.

| Finding | Severity | Disposition | How the PM checked it | What changed |
| --- | --- | --- | --- | --- |
| M1 | Medium | accept | **Reproduced** on Node 24.22.2 and 26.13.0: `loadTerms` on `example-autocall.yaml` with `retrieved_at` on a source, or `as_of` at the top level, gives `ok=false` and `unknown-key`. `git grep -nE 'retrieved_at\|as_of' -- schemas` exits 1. Section 11 of the research lists `retrieved_at` under `sources` and a firing time under `alert_firings` | The spec says what the format holds, and defines the applicable data dates rule by rule, so AC12 has an oracle. The ADR follows and points to the spec |
| M2 | Medium | accept, with a different command | **Reproduced**, in the table below. The fix prompt's command still passes one case | The claims list records the base, AC8 checks it against `main`, and AC11's first commit is taken from `origin/main` |
| M3 | Medium | accept | **Read.** The prompt has been in the A4 row since `9e96d5f`, and `025f853` added it to AC12 | By ruling 16: A4 is after import only in both rows, and AC12 drops it. The ADR sentence and the 110 stand |
| M4 | Medium | accept | **Read** | ADR Consequences and journey row 4.2 now agree with the data path |
| L1 to L3 | Low | not fixed | Not re-checked | Carried to the next ideas batch |

M2's command, in a scratch repo with `git`, reading exit codes. "Prompt" is `test "$(git rev-parse "<first spike commit>^")" = "$(git rev-parse "$KEEL_SPIKE_BASE")" && git diff --exit-code "$KEEL_SPIKE_BASE" HEAD -- . ':(exclude)spike/ios-core/**'`. "Spec" replaces the first `rev-parse` with `git merge-base origin/main HEAD`.

| Case | Prompt | Spec |
| --- | --- | --- |
| Only spike changes, true base | 0 | 0 |
| Only spike changes, base is `HEAD` | 1 | 1 |
| Only spike changes, `main` moved after the cut, true base | 0 | 0 |
| Only spike changes, no `origin/main` in the clone, true base | 0 | 1 |
| Outside change, true base | 1 | 1 |
| Outside change, base is `HEAD` | 1 | 1 |
| Outside change in the first commit, with the base and the first commit both moved up one | **0** | 1 |
| Outside change, empty base | 1 | 1 |
| Outside change, bad base | 1 | 1 |

The bold row is why the spec differs from the fix prompt: the prompt's two inputs can both be misreported, so it passes with an outside change. `git merge-base --is-ancestor` in AC11 stays on the first spike commit rather than moving to the base. On a branch cut before the spec and then merged with `main`, AC8's base test passes, and AC11 with `git rev-list --reverse origin/main..HEAD`'s first line exits 1.

One addition goes beyond the fix prompt. A date the terms hold in conflict says so and names each candidate, under hard rule 6, because `example-autocall.yaml`'s maturity has `status: conflict` (`sed -n 26,28p fixtures/synthetic/terms/valid/example-autocall.yaml`), so A5's oracle needed an answer for that case. Which candidate sets A5's fire time stays open, and goes to the next ideas batch.

For Codex at the re-read: AC12 no longer lists A4's prompt, because the prompt no longer exists. Ruling 12's words name the wording rule and do not name A4, and A8's observation-date timer stays in AC12. Check this against ruling 12, along with the AC8 command and the conflict clause.

The fix prompt, as drafted by the Pass 2.5 seat, said Beni had already answered "No" on A4. Its transcript held only "Yes, fix first" at that point, and the same message called A4 open. The PM put the question to him directly, and ruling 16 is that answer.

### Codex's re-read of `8419c84`

Codex's re-read is issuecomment-6590981024. It reports M1, M3 and M4 fixed, finds that dropping A4's prompt does not narrow ruling 12, and finds that the conflict clause is not overreach. It also finds M2 incomplete, at Medium: AC8 at `8419c84` can exit 0 after a Git failure, and "fixes the four Mediums" in the PR body overstates M2's closure. The subject of `8419c84` says the same and cannot be changed.

A second Pass 2.5 session then stopped before it began, because its prompt made an open finding a stop condition. It re-ran nothing, and wrote no gate verdict, brief or PR comment.

The PM accepts the finding. **Reproduced** with Codex's steps in a scratch repo: the command at `8419c84` exits 0, `git diff --quiet "$base" HEAD -- . ':(exclude)spike/ios-core/**'` exits 1, and the command at `19ea2f5` exits 128. Ruling 15 already covers M2, so this needed no new ruling. "Spec" in the table above means the command at `8419c84`, and that table tested an empty and a bad base only with `origin/main` present, which is how it missed this case.

`19ea2f5` uses Codex's proposed form, and these exit codes come from running the spec's own AC8 cell for the last column:

| Case | `8419c84` | `19ea2f5` |
| --- | --- | --- |
| Only spike changes, true base | 0 | 0 |
| Only spike changes, an annotated tag at the true base | 1 | 0 |
| Only spike changes, base is `HEAD` | 1 | 1 |
| Outside change, true base | 1 | 1 |
| Outside change, base moved past it | 1 | 1 |
| Outside change, base `--quiet` | 1 | 128 |
| Outside change, empty base | 1 | 128 |
| Outside change, base `--quiet`, no `origin/main` | **0** | 128 |
| Outside change, true base, no `origin/main` | 1 | 128 |

The PM also changed AC10, which no review had reported, because testing AC8 turned up the same kind of hole. AC10 said "prints nothing", and a failed `git grep` also prints nothing to standard output. Its `\|` is only a table escape, but a reader copying from the raw file gets a pattern that matches neither identifier. AC10 now uses two `-e` patterns and requires exit 1. Exit codes, with synthetic identifiers planted in a scratch repo:

| Case | As rendered | As in the raw file | `19ea2f5` |
| --- | --- | --- | --- |
| Clean | 1 | 1 | 1 |
| Team ID planted | 0 | **1** | 0 |
| Device ID planted | 0 | **1** | 0 |
| Outside a repo | 128 | 128 | 128 |

For Codex at the next re-read: check both command changes, and whether `19ea2f5` changes anything else.

Codex's third re-read is issuecomment-6591278315, at `19ea2f5`: M2 is closed, the AC10 repair is justified and not overreach, and it has no new findings. Its private-list scan found 0 hits across the diff, the commit messages, the PR fields, the comments and its own comment.

## Authorship record

From `git log --format='%h %an' origin/main..19ea2f5`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `9e96d5f` spec, journey and ADR-0009 | Claude | Cursor, Pass 1 (issuecomment-6587500288); Codex, Pass 2 |
| `9d16c9b` name the spec PR in the index | Claude | Cursor, Pass 1; Codex, Pass 2 |
| `8cdd91c` record Beni's ruling on the plan challenge seat | Claude | Cursor, Pass 1; Codex, Pass 2 |
| `8c0deaf` merge `origin/main` | Claude | Cursor, Pass 1; Codex, Pass 2 |
| `b6cbcc9` apply Pass 1 findings and Beni's rulings | Claude | Codex, Pass 2 |
| `044690c` stop quoting the import the boundary check rejects | Claude | Codex, Pass 2 (issuecomment-6588858035) |
| `804720e` tighten snapshot contracts and spike evidence checks | Codex | the fresh Claude session, Pass 2.5 |
| `025f853` record Beni's rulings after Pass 2 | Claude | Codex, short re-read (issuecomment-6589253253) |
| `c4c3e1f` put AC11 and AC12 in order | Claude | Codex, short re-read (issuecomment-6589253253) |
| `8419c84` fix the four Pass 2.5 Mediums and take A4's prompt out | Claude | Codex, second short re-read (issuecomment-6590981024) |
| `19ea2f5` complete M2, and stop AC8 and AC10 reading a Git failure as clean | Claude | Codex, third short re-read (issuecomment-6591278315) |
| The commits adding this brief and `pr-16-pass-0.md`, on `docs/pr-16-records` | Claude | the records-PR cold read |

Any commit Codex pushes gets its cold read from the fresh Claude session at Pass 2.5.

## Rulings from Beni

Beni ruled on 2026-11-02 (America/New_York), in the option "Take them all (Recommended)", on the question "Take all eleven recommendations in the table above?" Each answer below is the recommendation he took:

1. Inside the close-call band, the three clauses still name a path, and the result is labelled a close call. Beni rules: **yes**.
2. If only one median is inside its band, the whole result is a close call: **yes**.
3. If a second locale cannot be run in an engine, clause 1 fails, and changing the Region setting counts as a route: **yes**.
4. A parity difference on the iPhone fails clause 1, which adds one device run: **yes**.
5. A divergence on a non-gating edge case makes a close call: **no**. It is reported and put to Beni.
6. The gate stays the median of 20 in-process runs: **no**. It is the median of 5 fresh launches, of the first load and the first `loadTerms`, and the 20 are still reported.
7. The worst run stays ungated, and is reported: **yes**.
8. Thresholds of 500 ms and 50 ms, with a close call within 20%: **yes**.
9. `esbuild` on the spike branch only: **yes**.
10. Under hard rule 12, the notification's detail page carries the disclaimer, since a lock-screen notification has no footer, and no notification text ships until this is settled: **yes**.
11. Finding 1 closes once a re-run is green, with this as Beni's confirmation: **yes**.

Rulings 1 to 7 answer Cursor's Q-A to Q-G. Ruling 6 changes what clause 2 measures, which only Beni could do.

After Pass 2, Beni ruled on 2026-11-02 on Codex's three questions, in the options below:

12. **"Yes, with obligations (Recommended)"**, on "May the stale-notification High close on this docs PR without a test, because no code can land here?" An exception for this PR only. The spec gains AC12: the spike's harness tests the notification wording rule, and the test fails without it. ADR-0009 requires such a test to land with the real app before any notification text ships, because spike code never merges.
13. **"No, stays conditional A (Recommended)"**, on "If only the standalone variant passes, does that formally select Path B?"
14. **"No, keep the two medians (Recommended)"**, on "Should the load gate also require the same launches to meet both limits together?" The paired measurements stay reported.

After Pass 2.5, Beni ruled on 2026-11-02 on its three questions, in the options below:

15. **"Yes, fix first"**, on "Fix the four Mediums on PR #16 before merging?", answered in the Pass 2.5 session.
16. **"No (Recommended)"**, on "Does A4's date-based prompt notify a closed app?", answered to the PM.
17. **"Yes (Recommended)"**, on "Do rulings 1 to 14 and the Cursor seat stand as the PM recorded them?", answered to the PM.

## Privacy

The only address in Cursor's comment other than `noreply` ones is its own vendor identity (`gh api repos/BeniCheni/keel/issues/comments/6587500288 --jq .body | grep -o -E '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' | grep -v 'noreply@' | grep -v -c '^cursoragent@cursor\.com$'` prints `0`). `scanRepo` finds 0 hits in that comment and in the PR body refreshed for `b6cbcc9`. Cursor did not run the owner's private-list check, and this seat did not either. Codex runs it at Pass 2.

## Sealed appendix for Pass 2

Pass 1's findings and this brief's dispositions are suspicions to re-derive, not conclusions. Codex reads the whole PR at the head, because it did not take Pass 1 here. It gives the plan a challenge from a vendor that will not build the spike, and gives the cold read of `b6cbcc9` and `044690c`. It reproduces or disproves each Pass 1 finding with its own commands, and runs the owner's private-list check (counts only, readable-file precheck, nonzero exit on a failed scan) over the diff, every commit message, the PR title and body, and every comment. Pass M does not apply.

Leads for Codex's own read, none of them established:

1. **The dispute.** Run the probe above. Is "absent" the right model of a host with no `console`? Does a JSContext define `console`, if Apple's documentation or a run can say?
2. **Cursor's Build-easier marks.** Did accepting findings 14 and 17 make any check weaker? Did any accepted wording make the spike easier to pass? Cursor builds this, so test that hard.
3. **The rule after these edits.** Can clause 2 now pass on something a person would not feel as fast? Do the rulings leave any outcome undecided, or any two bullets in conflict? Is "the unedited core has not met the rule" clear enough for the `standalone` case?
4. **Five fresh launches.** Is 5 enough to take a median from? Do `devicectl` and a Personal Team allow the device lines? They are the PM's reading, with no run behind them, and the spec says so.
5. **The honesty wording.** Does each notification named in the alert table meet the new first-line rule? Find a body that the rule still lets state something false, and rate it.
6. **What the journey still gets wrong.** Cursor's question 3 found 6.8. Which other row's role does not meet its definition?
7. **Cursor's seat.** Did its position as builder shape what it asked for or left alone? Is anything missing from its plan challenge that an independent reader would have raised?
