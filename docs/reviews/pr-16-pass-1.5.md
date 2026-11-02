# Pass 1.5 brief: PR #16

Written by the PM on 2026-11-02 (America/New_York) after reading Cursor's Pass 1 comment on PR #16 ([issuecomment-6587500288](https://github.com/BeniCheni/keel/pull/16#issuecomment-6587500288); reviewed head `8c0deaf`, verdict "not mergeable"). Cursor pushed nothing, by the Pass 0 brief. The PM's post-Pass-1 head is `b6cbcc98881cfd3f66bfbcc6ad1d8d7d1b9c3617`. Codex receives this brief for Pass 2. Like the Pass 0 brief, it lives on branch `docs/pr-16-records`, not on the PR branch.

Seventeen of the eighteen findings are accepted as stated, one is accepted and disputed in part, and none goes to Cursor as rework. The PM applied the accepted wording in `b6cbcc9`. One High closes with a CI re-run and Beni's confirmation, and the other closes with that commit. Beni ruled on eleven questions, including all seven Cursor raised.

## How this brief adjudicated

Each "Reproduced" below comes from a run in this session at `8c0deaf`, in a fresh clone, on Node v24.22.2, with a fresh `mktemp -d` as `KEEL_DATA_DIR`. "Read" means the PM checked the cited lines and ran nothing. Apple pages that only Cursor read are marked. No user data folder and no private list was opened. No Swift or Xcode command has been run by anyone, because this Mac has no full Xcode.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | High | accept; closes on a green re-run with Beni's confirmation | **Reproduced.** `gh run view 41510891687 --json jobs` shows the macOS Node 26 cell cancelled with no steps, and the `verify` job printing `needs-check: cells result is abandoned`. It is a runner failure and no code fault: local `pnpm verify` exits 0 on both Nodes, on Cursor's run and on the PM's at `main`. The same cancellation hit `main` at `2ed7b44` (run 41510620550) and an earlier PR #14 run, per Cursor. The PM re-ran both failed runs with `gh run rerun --failed`. `b6cbcc9` also starts a fresh run for this PR | no |
| 2 | High | accept; closed by `b6cbcc9` | **Read.** The spec and ADR let a reminder state a stale fact, and an as-of date elsewhere in the body does not undo that. Applied with W2's sense in both files, adding that an estimated date says it is estimated | no |
| 3 | Medium | accept | **Reproduced.** `grep -n '^\| 9.1 ' docs/proposals/0001-product-research.md`: the story sentence names the three, and the acceptance says only "Round-trip import reproduces the same state". The PM's error. `display_name` joins the gap table | no |
| 4 | Medium | accept | **Read.** A median of 450 ms was both a clause pass and "unresolved". Beni's rulings 1 and 2 settle it, and the PM added the band himself, so the conflict was the PM's | no |
| 5 | Medium | accept, reworded | **Read.** Cursor's text says clause 1 fails. If `compile` passes parity and only misses the load threshold, the failing clause is 2. The spec now says the unedited core has not met the rule at that SHA | no |
| 6 | Medium | accept | **Reproduced.** Section 3's chart 4 row lists "Terms only" (`awk -F'\|' '/^\| 4 \| Payoff/{print $5}' docs/proposals/0001-product-research.md`). Rows 5.2, 5.4, 7.1 and 7.2 and the floor now say per notional. The purchase sentence joins the floor as a **No** | no |
| 7 | Medium | accept | **Read.** Applied in the spec and the ADR | no |
| 8 | Medium | accept | **Read.** `packages/core/src/terms/dates.ts` flags weekends only, and S01's stories line says holidays arrive with the schedule slice | no |
| 9 | Medium | accept, with a different reason for the window | **Read.** The step from 55 to a window did not follow. T-1 plus A8's observation-date timer are two requests per observation, 110 before A5 and A9, which is the real reason. The 64 itself stays a lead: Cursor's fetch of the forum thread returned 403, the PM read it only through a search result, and Apple's page, as Cursor read it, states no number | no |
| 10 | Medium | accept | The PM read guideline 4.7 and 5.1.1(ix) itself earlier the same day and agrees. The privacy manifest and export compliance rest on Cursor's reading, and the spec says so | no |
| 11 | Medium | accept | **Read.** By the spec's own definition. Role counts become 10, 23 and 15. Also applied from Cursor's question 3: 6.8's writing is desktop-only | no |
| 12 | Medium | accept | **Read.** Section 11's `alert_firings` has `acknowledged_at` | no |
| 13 | Medium | **accept and dispute** | See "The one dispute" | no |
| 14 | Medium, marked Build-easier | accept | **Reproduced.** On a planted `spike/ios-core/check-bundle.mjs`, `node tools/boundary/cli.mjs` exits 1 for a comment holding the text `require("@keel/montecarlo")`, and 0 for the word `montecarlo` alone. An escaped string form exits 0. The mark is fair: the builder learns a trap, and the check stays as it is. The PM did not re-run the NUL-byte case | no |
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

## Authorship record

From `git log --format='%h %an' origin/main..b6cbcc9`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `9e96d5f` spec, journey and ADR-0009 | Claude | Cursor, Pass 1 (issuecomment-6587500288); Codex, Pass 2 |
| `9d16c9b` name the spec PR in the index | Claude | Cursor, Pass 1; Codex, Pass 2 |
| `8cdd91c` record Beni's ruling on the plan challenge seat | Claude | Cursor, Pass 1; Codex, Pass 2 |
| `8c0deaf` merge `origin/main` | Claude | Cursor, Pass 1; Codex, Pass 2 |
| `b6cbcc9` apply Pass 1 findings and Beni's rulings | Claude | Codex, Pass 2 |
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

## Privacy

The only address in Cursor's comment other than `noreply` ones is its own vendor identity (`gh api repos/BeniCheni/keel/issues/comments/6587500288 --jq .body | grep -o -E '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' | grep -v 'noreply@' | grep -v -c '^cursoragent@cursor\.com$'` prints `0`). `scanRepo` finds 0 hits in that comment and in the PR body refreshed for `b6cbcc9`. Cursor did not run the owner's private-list check, and this seat did not either. Codex runs it at Pass 2.

## Sealed appendix for Pass 2

Pass 1's findings and this brief's dispositions are suspicions to re-derive, not conclusions. Codex reads the whole PR at the head, because it did not take Pass 1 here. It gives the plan a challenge from a vendor that will not build the spike, and gives the cold read of `b6cbcc9`. It reproduces or disproves each Pass 1 finding with its own commands, and runs the owner's private-list check (counts only, readable-file precheck, nonzero exit on a failed scan) over the diff, every commit message, the PR title and body, and every comment. Pass M does not apply.

Leads for Codex's own read, none of them established:

1. **The dispute.** Run the probe above. Is "absent" the right model of a host with no `console`? Does a JSContext define `console`, if Apple's documentation or a run can say?
2. **Cursor's Build-easier marks.** Did accepting findings 14 and 17 make any check weaker? Did any accepted wording make the spike easier to pass? Cursor builds this, so test that hard.
3. **The rule after these edits.** Can clause 2 now pass on something a person would not feel as fast? Do the rulings leave any outcome undecided, or any two bullets in conflict? Is "the unedited core has not met the rule" clear enough for the `standalone` case?
4. **Five fresh launches.** Is 5 enough to take a median from? Do `devicectl` and a Personal Team allow the device lines? They are the PM's reading, with no run behind them, and the spec says so.
5. **The honesty wording.** Does each notification named in the alert table meet the new first-line rule? Find a body that the rule still lets state something false, and rate it.
6. **What the journey still gets wrong.** Cursor's question 3 found 6.8. Which other row's role does not meet its definition?
7. **Cursor's seat.** Did its position as builder shape what it asked for or left alone? Is anything missing from its plan challenge that an independent reader would have raised?
