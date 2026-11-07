# Executive brief: PR #21, Pass 2.5, 2026-11-05 America/New_York

Recorded by the PM on 2026-11-06 (America/New_York). The Pass 2.5 session, a fresh Claude session with model id `claude-opus-5-5`, delivered this brief in its review chat at `0c06924`, and posted [issuecomment-6670022832](https://github.com/BeniCheni/keel/pull/21#issuecomment-6670022832) on the PR. The session's draft file no longer existed when the PM recorded it, so the brief below is Beni's paste from that chat. The paste lost the brief's Markdown, so the PM put back its headings, tables and code formatting. No wording or figure was changed.

The PM re-ran these of the brief's figures at `0c06924`, from a new clone, and they hold:

| Figure | Command | Result |
| --- | --- | --- |
| Scope | `git diff --shortstat origin/main...HEAD`; `git diff --name-only origin/main...HEAD \| grep -vc '^spike/ios-core/'` | 31 files, 3284 insertions; 0 |
| Measured build unchanged | `git diff --quiet 27c802c 0c06924 -- spike/ios-core/App spike/ios-core/Sources spike/ios-core/Tests spike/ios-core/Package.swift spike/ios-core/build.mjs spike/ios-core/bundle.mjs` | Exit 0 |
| Codex's commit | `git show --stat --format= 0c06924` | 1 file, 10 insertions, 8 deletions |
| Decision rule | `git show origin/main:docs/specs/s90-ios-core-spike.md \| awk '/^## Decision rule/,/^## Non-goals/' \| shasum` | `0b1d5259a12c2752195776adb7be3ebbf737086c` |
| Spec closes the PR | `git show origin/main:docs/specs/s90-ios-core-spike.md \| grep -n 'Beni closes the PR unmerged'` | Line 394 |
| Device medians and ranges | The median command in the Pass 0 brief, with ranges added | `compile` 105.073 (103.640 to 108.544) and 13.479 (12.996 to 13.831); `standalone` 5.704 (5.451 to 6.046) and 16.788 (16.034 to 17.034) |
| Device comparison | `sh spike/ios-core/run-parity.sh --compare-device` on `pr-21-device-records.txt` | Exit 0, `records=1408`, `mismatches=0`, `bytes=match` |
| Low 2.5-1 | `sed -n '43p' spike/ios-core/DEVICE.md` | Ends "The `haw` probe is the haw run. It does not gate." |
| Low 2.5-2 | `sed -n '89,90p' spike/ios-core/DEVICE.md` | Request 70, then Add repeating trigger, with no second Request 70 |
| CI | `gh run view 42110270788 --repo BeniCheni/keel --json headSha,conclusion` | `0c06924`, `success` |

## Beni's answers (added by the PM)

Given to the PM on 2026-11-06, in reply to the brief's questions:

1. to 3. The three rulings: "Yes, all three". So "Pay Apple", recording the Q5 change without amending the spec, and "No, record the gap" are confirmed first-hand.
4. Codex's private-list count: "Yes, accept it". The Pass 2.5 brief and comment get their private-list check at the records PR's cold read.
5. Lows 2.5-1 and 2.5-2: "Yes, carry them". No fix commit, so the spike branch stays at `0c06924`.

He also approved pushing this record ("Yes, push it"). Closing PR #21 is his, with the handoff command below.

## Carried to the results and the ideas file (added by the PM)

For the results: Lows 2.5-1 and 2.5-2, and Pass 1's Lows 6 to 8. For `docs/v0.1.0-ideas.md`, in the PM's next ordinary docs PR:

- Core reports a stack overflow as `yaml-syntax`, "not valid YAML", on deep but valid nesting (Pass 1).
- `check-bundle.mjs` does not flag `Buffer`, `__dirname` or `module` (Pass 1).
- Which pending requests iOS keeps past 64, and whether a repeating trigger takes a slot, for the first slice that schedules alerts on the phone (Pass 1 finding 4, by Beni's ruling).
- Time `loadTerms` alone on the phone (Pass 1 finding 6).
- The device comparison ignores locales it does not gate on, and the helper's count checks alone would accept duplicated rows (Pass 2).

---

# Executive brief: PR #21, Pass 2.5, 2026-11-05 America/New_York

Every number below comes from a command run in this session. I worked in a fresh clone of `s90/ios-core-spike` at `0c06924b339bb1bd0f3537b69f34edaf3a34ea22`, with the head taken from GitHub. `KEEL_DATA_DIR` pointed at an empty temp directory.

The exception is the device numbers: they are Beni's run on his iPhone at `27c802c`. I recomputed them from `pr-21-device-records.txt`, copied out with `git show`, and did not re-measure them.

Seat: a fresh Claude session. The model id reads `claude-opus-5-5`. I can't see the effort level from inside the session; the prompt set High. No fallback was used, and this session wrote no line of the PR.

## Decision

Shadow mode: the gate says "would escalate", because `esbuild` 0.28.2 is a new dependency. It is spike-only and Beni approved it on 2026-11-02, but it still fails the "no dependency" clause.

The gate doesn't decide anything here. The spec closes this PR unmerged, and the branch stays (`grep -n 'Beni closes the PR unmerged'` on the spec, line 394).

Every High is closed, and nothing is contested. No verdict on Path A or Path B.

## What ships

Nothing merges. The branch stays at `0c06924`. The measured build is `27c802c`, and no app source has changed since. This command exits 0:

```bash
git diff --exit-code 27c802c 0c06924 -- spike/ios-core/{App,Sources,Tests,Package.swift,build.mjs,bundle.mjs}
```

What the branch shows:

- **Bundles:** the unedited `@keel/core` builds into two scripts with no Node built-ins, `compile` (608362 bytes) and `standalone` (615302), each `flagged=0`. Core is untouched (`git diff --exit-code 82e4909 HEAD -- packages` exits 0). Both load in a JSContext on macOS with `shims=0`.
- **macOS parity:** Node and JavaScriptCore give byte-identical output on 31 fixtures plus the tie input. That holds in both variants, under each engine's locales and under the reversed comparator.
- **iPhone (Beni's run):** all 1408 parity records match Node's hashes, and both gated medians are far under their thresholds.
- **Not claimed:** the engine, schedule and alert rules (they don't exist yet), App Review's view, profile expiry on a free team, and which of the 70 notification requests iOS keeps.

## What the passes found

Pass 1 (Claude Code, at `27c802c`):

- High 1: five floor rows, AC4's among them, decided "killed" with their own comparison instead of their gate. Fixed in `14b0308`, with row `gate-off`.
- High 2: the device comparison accepted a thin group or an error line. Fixed in `d0c9fc3`, with row `device-thin`.
- Medium 3: the locale check skipped the two standalone reversed runs. Fixed in `14b0308`.
- Medium 4: the Q5 harness prints how many pending requests are kept, not which, and no queue total after the repeating trigger. Open, by Beni's ruling.
- Medium 5: `DEVICE.md` did not match what ran. Fixed by Codex in `0c06924`.
- Lows 6 to 8: `loadTermsMs` times more than `loadTerms`; the build log also names `arm64-apple-ios17.0`; `compare-device.mjs` uses exit 1 for setup failures.

Pass 2 (Codex, at `d0c9fc3`):

- Accepted all eight findings, each with its own command, and found no further behaviour fix.
- Read the PM's device helper and found it does what Pass 0 says. Its count checks alone would accept duplicated rows, so Codex checked groups and hashes in Beni's records separately.
- AC10's private-list half: 0 hits in each scope.
- A bad hash under an extra `de-DE` locale is ignored, since only `en` and `sv` gate.
- Pass M: N/A.

Pass 2.5 corroboration:

- High 1: at the head, `gate-off` exits 1 with `gate-needed=true` on all 7 injections. With `27c802c`'s `run-parity.sh` put back, it exits 2, with `gate-needed=false` on 4. The test fails without the fix. Closed.
- High 2: at the head, `device-thin` exits 1 (`thin=true error=true`). With `27c802c`'s comparator it exits 3. Closed. Beni's records pass both comparators.
- Medium 3: `one-run-locale` exits 1, `reason=locale-run`. Closed.
- Medium 4: the extra file shows `pending-kept count=64 total=64` four times and `repeating-pending count=1` four times. That is Beni's lines, read, not re-run.
- Low 7: the build log names 27.0 five times and 17.0 five times.
- Lows 6 and 8: not re-checked.

Cold read of `0c06924` (Codex's only commit, `DEVICE.md` only, +10/−8). It does what Pass 1.5 item 6 asked:

- The build, install and launch lines match Pass 0's "What ran on the device" exactly, including `-allowProvisioningDeviceRegistration`.
- It names `27c802c` as the measured build, and limits the expiry check to a free team.
- It names `export.yaml` and `malformed.yaml`, and warns off `manifest.json`.
- It says only deleting the app stops the repeating trigger. That matches the source: `HarnessModel.swift:227` repeats every 60 s, and there is no `removePending` call anywhere.
- It holds no identifier.

Two Lows, not fixed, because this pass pushes nothing:

- **2.5-1 (Low):** `DEVICE.md:43` says "The `haw` probe is the haw run". The phone's 128 Hawaiian hashes came from an extra `(haw)` `haw_US` launch that the file doesn't list. A re-run that follows the file gets a `haw` locale but no `haw` hashes. It doesn't gate.
- **2.5-2 (Low):** `DEVICE.md:89-90` doesn't say to press Request 70 again after Add repeating trigger. That second press is how the repeating-slot reading was taken.

Contested: none.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | Exit 0 on Node 24.22.2 and 26.13.0 |
| Verify | `pnpm verify`, Node floor and current | Exit 0 on both. Test Files 9 (33 passed, 0 failed) and 10 (122 passed, 0 failed). All sub-checks ok |
| Determinism | Inside `pnpm verify` | ok on both Nodes |
| Zero network | Inside `pnpm verify`; `git grep -n -E 'URLSession\|NWConnection' -- spike/ios-core` | ok; grep exits 1 |
| Mutations | `node spike/ios-core/floor.mjs <row>`, 15 rows | All exit 1 with baseline 0, `hit=true`, restored 0, each for its stated reason. Tree clean afterwards |
| Pass M | `python3 tools/reference/payoff.py fixtures/golden/` | N/A: no engine |
| UI matrix | n/a | N/A: bare harness controls |
| AC1 | spike install, `build.mjs`, `check-bundle.mjs` | Exit 0, 0, 0. 608362 and 615302 bytes, `flagged=0`. `localeCompare` 0 times in `compile.js` |
| AC2, AC12 | `swift test --package-path spike/ios-core` | Exit 0, 3 tests. `shims=0`; network globals and `process` undefined |
| Unsigned build | `xcodebuild … Release … generic/platform=iOS … CODE_SIGNING_ALLOWED=NO` | Exit 0 against `iPhoneOS27.2.sdk`. Bundles `cmp` equal to `dist`. 31 yaml byte-equal to the fixtures. Target 27.0 on 4 lines |
| AC3 | `sh spike/ios-core/run-parity.sh` | Exit 0, `reason=pass`, `bytes=match`, `reversed=match`, locale check pass (Node `en-US,haw-US,sv-SE`, JSC `en-US,sv-SE`), `haw-jscontext locale=en,en bytes=match`, 31 fixtures in each count, `en-GB` match |
| Edge inputs | Same run, reported only | 6 `same=true`. `flow-2000`: Node `yaml-syntax:6:794`, JSC `wrong-type:6:3`. `block-1000`: Node `yaml-syntax:992:1789`, JSC `unknown-key:98:1`. Both engines `ok=false` on all 8 |
| AC4 and inject modes | `--inject-<mode>` | `diff`→`byte`, `column`, `reorder`, `same-locale`→`locale-same`, `fewer`→`fixture-count`, `localecompare`→`reversed-tie`, `one-locale`→`locale-run`, each exit 1. All 4 `--prove` modes exit 0 |
| Setup failure | A `swift` that exits 1, first on `PATH` | Exit 2, `reason=setup` |
| AC8, AC10 (git half), AC11 | The spec's commands; base `82e4909`; `origin/main` at `32cfe40`; first spike commit `ff4fc35` | Exit 0, 1, 0. AC11's count is 1 |
| Decision rule unchanged | `awk '/^## Decision rule/,/^## Non-goals/' … \| shasum` | `0b1d5259…`, equal to Pass 0's |
| Scope | `git diff --shortstat origin/main...HEAD` | 31 files, 3284 insertions, 0 deletions; 0 paths outside `spike/ios-core/` |
| Device comparison | `run-parity.sh --compare-device` on the records file | Exit 0: `records=1408`, 8 groups, `files=32 fixtures=31`, `mismatches=0`, `bytes=match`. Also exit 0 with `27c802c`'s comparator |
| Device consistency | My own `device_check.py` | 13 launches with 13 distinct pids. 11 fresh lines, each pid equal to its launch's process line. 0 error lines. 128 parity lines per timing launch. 8 groups × 32 inputs. 0 keys with two hashes. Every input has one hash across all variants, comparators and locales |
| Hawaiian launch | My own `haw-compare.mjs`, Node under `haw_US` | 128 records, 0 differ (reported only) |
| Stand-in export | `export-standin.mjs`, then `parity-node.mjs` on each file | Manifest unchanged. `malformed.yaml`: 1 error at 8:11. `manifest.json`: 18 errors at 1:1. `export.yaml`: ok |
| Privacy | Tripwire over the PR text, all comments, the 4 records files, this brief and the comment | 0 hits in every class. A planted control fired `ssn` once |
| CI | `gh pr checks 21` | Run 42110270788 at `0c06924`: 5 of 5 pass |

Device timings (Beni's run at `27c802c`, first 10 fresh launches):

| Variant | Context and bundle: median (range) | First `loadTerms`: median (range) | Under both limits | In a band? |
| --- | --- | --- | --- | --- |
| `compile` | 105.073 ms (103.640 to 108.544) | 13.479 ms (12.996 to 13.831) | 5 of 5 | No |
| `standalone` | 5.704 ms (5.451 to 6.046) | 16.788 ms (16.034 to 17.034) | 5 of 5 | No |

The 11th launch, in Swedish, gave 104.605 and 13.137 ms. The thresholds are 500 and 50 ms, with bands of 400 to 600 and 40 to 60.

For scale only, macOS fresh medians this session (`swift test`): `compile` 76.284 / 12.018 ms, `standalone` 5.075 / 12.666 ms.

Not re-run, and why:

- **Beni's run:** every device measurement and hand check, plus his three observations: the notification fired while locked, the unlock prompt appeared, and the trigger arrived after the rebuild.
- **AC10's private-list half:** this seat may not open `~/.config/keel/`. It rests on Codex's count, which didn't cover this brief or comment.
- **The PM's helper:** only Codex read it.
- **Left to Pass 1 and Pass 2:** the Q4 and Q6 tables, Pass 1's `--stack-size` account of the edge inputs, Pass 1's Q1 plant list, the reversed-comparator isolation probe, Codex's `de-DE` observation, and Lows 6 and 8.
- **Not checked by anyone:** whether `--console` attaches a debugger.
- **Not run:** the README quickstart and demo mode.
- **Results day:** clause 3.

## Estimates and model output

None in this PR. The timings are measurements. The spec's V8 anchor is labelled ESTIMATE there, and it isn't in this diff.

## Risks and accepted costs

- **One run:** one phone, one iOS version (27.2), one day. The lines are sanitized by a helper outside the repo.
- **Paid team ("Pay Apple"):** profile expiry was not observed, and the reinstall ran the same day. Nothing shows what a free team can do. The spec's "Nothing here depends on paying" stays as merged; the results correct it.
- **Q5 gap ("No, record the gap"):** 64 of 70 requests were kept, but not which. Whether the repeating trigger takes a slot is read only from totals.
- **Malformed import:** the phone most likely rejected `manifest.json`, not `malformed.yaml`. Its 18 errors at 1:1 match `manifest.json` in Node, not `malformed.yaml`'s 1 error at 8:11. That is an inference. A rejection with a line and column, and with the previous copy kept, was still shown.
- **Timing scope:** `loadTermsMs` includes the summary, the stringify and the bridge. That errs slower.
- **Static check limits:** `check-bundle.mjs` can't see code built at run time or the global reached through `this`, as the spec says.
- **Deep inputs:** a deep but valid document could read `ok=false` in Node and `ok=true` on the phone. Reported, not gating.
- **Process:** the Q2 amendment came after spike code, so it isn't pre-registered. The build ran at Extra High by ruling. The base is `82e4909` while `main` is at `32cfe40`. `esbuild` is spike-only.

Decision clauses, measured outcomes only:

- **Q2:** byte-identical on macOS across engines, variants, gating locales and the reversed comparator. On the iPhone (Beni's run), 0 mismatches over 8 complete groups. Core unedited, 0 shims.
- **Q3:** both medians under threshold for both variants, with none in a band (Beni's run).
- **Q5 App Review:** not run; it belongs to results day.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes |
| Verdict mergeable, every High closed (fix commit with a failing-first test, or for a High outside tracked files, a recorded remediation check plus Beni's confirmation) | Yes. `14b0308` and `d0c9fc3`, whose rows fail against `27c802c`'s harness |
| Nothing contested | Yes |
| `verify` green at tip; every number re-run | Green on both Nodes and in CI. Re-run except the list above; device numbers are Beni's run |
| No sensitive path, dependency or schema change | No. No sensitive path or schema change, but `esbuild` is a new dependency |
| Every commit cold-read by a non-author vendor (authorship record) | Yes. Cursor ×3 by Claude Code; Claude ×2 and the helper by Codex; Codex's `0c06924` by this session |
| Gate verdict | would escalate |
| Beni's decision (filled after) | |

The spec closes this PR rather than merging it.

## Questions for Beni

Questions 1 to 3 are your rulings, which reached the reviewers second-hand through the PM.

1. On 2026-11-05, did you rule "Pay Apple", so that the device run used a paid Developer Program team? (Yes / No)
2. Did you rule that the Q5 change is recorded in Pass 0 and the results without amending the spec? (Yes / No)
3. On reworking the Q5 notification harness and re-running those taps, did you rule "No, record the gap"? (Yes / No)
4. Accept Codex's AC10 private-list count (0 hits) without a Pass 2.5 re-run, even though it didn't cover this brief or comment? (Yes / No)
5. Carry Lows 2.5-1 and 2.5-2 to the results and the ideas note, with no fix commit? (Yes / No)

## Handoff block

```bash
gh pr close 21 --repo BeniCheni/keel --comment "Closed unmerged after Pass 2.5, as the S90 spec says. Reviewed head 0c06924b339bb1bd0f3537b69f34edaf3a34ea22; the branch stays."
```

A copy of this brief, which the PM can record on `docs/pr-21-records`: `/private/tmp/claude-501/-Users-benicheni-code-keel-pr21-pass25/d351b8a2-a6f7-4a2f-9d05-48939af28597/scratchpad/drafts/pr-21-pass-2.5-brief.md`

The fresh clone is next to it in the same folder. I used a new clone because `/tmp/keel-pr-21`, left from Pass 1, was not fresh.
