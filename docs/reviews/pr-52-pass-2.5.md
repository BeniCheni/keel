# Executive brief: PR #52, Pass 2.5, 2026-11-19 America/New_York

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim. The record is on the PR: [issuecomment-7019236015](https://github.com/BeniCheni/keel/pull/52#issuecomment-7019236015).

## Decision

Shadow mode: the gate says **would escalate**, because the verdict is **not mergeable**: my cold read found one new High in the store (E2). The PR also touches sensitive paths and adds a dependency, so Beni merges in any case.

## What ships

- keel gets its first iOS app. It imports one terms file through Files, validates it with `@keel/core` inside JavaScriptCore, and shows one read-only screen with ESTIMATE on each generated row.
- The stored bytes stay unchanged and sealed (complete protection, excluded from backup). A failed import keeps the previous import whole: 36 of 36 cases (3 opening faults by 12 failing steps), and one whole import at 22 of 22 relaunch points.
- The guards ADR-0009 requires land with it: source, binary (both unsigned builds), bundle-import, signing, inline-string and Swift copy lint.
- It does not claim anything on a device: criterion 12 and the B11 picker step are not run at this head.
- It does not yet hold the stored pair through repeated failed renames (E2).

## What the passes found

- **Pass 1 and the fresh Pass 1:** B1 to B18, PM1, C1 to C9. I re-derived 13 of them at the head with mutants (B1, B2, B3, B7, B14, B15, B18, PM1, C1, C4, C5, C6, C8); B12 I read. Ten are fixed as recorded and not re-derived by me (B4, B5, B6, B8, B9, B10, B13, C2, C3, C7).
- **PR #50's Highs** (50-F1 to 50-F4, 50-R1, 50-Y1): each one's mutant dies at the head.
- **Pass 2:** D3 and PM2 are closed by `a39a5c7`. Reverting the fix fails exactly the four D3 tests. D1, D2 and D4 stay open Mediums under ruling 12; I did not re-run them.
- **The fourth addendum's claim holds:** `1e02aab` introduced PM2. With the store as at `80dc177` (same blob as `1e02aab`), 3 of 17 relaunch points show a mixed pair; as at `918f678`, none; at the head, none.
- **Pass 2.5, new:**

| # | Severity | Finding |
| --- | --- | --- |
| E2 | High | A `rollback` folder that outlives a failed recovery is restored over a later import. After one failed import step and the same rename failing twice (three times through the app), the retry is `stored`. The next launch then shows the third file's bytes under the first file's name and time, sealed, with no error. Reproduced on real files on this Mac and on the memory double; in the branch since `2e4cd93`. |
| E1 | Medium | Two mutants of the D3 fix's one changed line (`SnapshotStore.swift:75`) pass all 45 Swift tests. No test has half a pair whose removal fails. |
| E3 | Medium | Four branches of `918f678`'s Swift literal scanner have no test; each mutant passes all 166 tooling tests and then misses a banned word the head catches. |
| E4 | Low | `apps/ios/bundle/build.mjs:87` kept the guard C6 replaced: through a symlink the build writes nothing and exits 0. |

- **Contested:** nothing between vendors. E2's grade is mine: High by the Severity table and by PM2's precedent (the same mixed pair). It is the least likely of the three store Highs, and I found no single cause that produces the whole sequence.

## Verification as re-run

All at `a39a5c7d4ac9dd264ca1301b137bfa0c6eec45c4`.

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | exit 0 on Node 24.22.2 and 26.13.0 |
| Verify | `pnpm verify` | exit 0 on both, 12 of 12 steps; core 178 tests, plugin 212, tooling 166; tree clean after |
| Determinism | the `AGENTS.md` command | exit 0 |
| Zero network | the `network` step of `pnpm verify` | ok on both |
| Swift | `swift test --package-path apps/ios/KeelCoreHost` | 45 tests, 0 failures, 0 skipped |
| Hosted run | `gh run view 44581863296` and the `swift` job log | six of six checks `success`; swift: 45 executed, 5 skipped, 0 failures |
| Unsigned builds | `xcodebuild build … -configuration <Release, Verification> … CODE_SIGNING_ALLOWED=NO` | both succeed; `cmp` exit 0; binary check exit 0 with eight zero counts each; usage check exit 0 |
| Mutations | one replacement each, in a second clone | 61 mutants, 55 killed, 6 survived (E1's two, E3's four) |
| Tripwire | `node tools/tripwire/cli.mjs .` | exit 0, 0 hits; the synthetic control fired (exit 1, 1 hit on the control file) |
| Pass M | N/A: `git diff --name-only origin/main...HEAD -- packages fixtures \| wc -l` prints 0 | not an engine PR |
| UI matrix | N/A | no web surface; the device run is Beni's |

Not re-run, and why:
- Criterion 12 and B11: your answer today was "Not run yet" for both.
- Anything on iOS, including E2, B2, C4 and D3 on a locked phone.
- Codex's `e643ace` replay claim, and ruling 6 as given in the rework session.
- The owner's private-list check, which no Claude seat runs.
- D1, D2, D4 and the ten findings listed as fixed-as-recorded.

## Estimates and model output

None. The app labels generated schedule rows ESTIMATE, and the mutant that drops that label is killed.

## Risks and accepted costs

- **E2**, above.
- **The required `swift` check does not exercise the real file seal.** The hosted image does not honor `.complete`, so the five real-file tests skip there. All 4 of my `FoundationFiling` mutants die only in those tests, so that code is held only by a local run on an unlocked Mac.
- **Nothing is verified on a phone.** File protection behaves differently on iOS than on macOS.
- **Carried gaps:** D1 and D2 in the network guards, D4 in copy lint, B16, B17, C9.
- **The PR body's first sections still give the build's numbers at `819433e`** (16 Swift tests, 135 tooling tests). The squash message should use the head's.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes |
| Verdict mergeable, every High closed | **No**: E2 is open |
| Nothing contested | Yes |
| `verify` green at tip; every number re-run | Yes, apart from the not-verified list |
| No sensitive path, dependency or schema change | **No**: sensitive paths and `esbuild` 0.28.2; no schema change |
| Every commit cold-read by a non-author vendor | Yes: Cursor's one by Claude, Claude's four by Codex, Codex's nine by this seat |
| Gate verdict | **would escalate** |
| Beni's decision (filled after) | Not merged at `a39a5c7`. Rulings 14 to 17, given on 2026-11-19 at 14:35:27 EST in the PM's session: fix E2 on this PR (14), by refusing any import while a `rollback` folder exists (15); E1, E3 and E4 ride along (16); the B11 picker step now and criterion 12 at the final head (17). Codex's E round followed. PR #52 merged on 2026-11-21 at squash `45fc2a4`, reviewed head `91b471e` |

## Questions for Beni

Rulings 9, 10 and 13 are already confirmed (Confirm ×3, recorded in the comment).

1. Does E2 go to Codex for a fix on this PR before merge? (Yes / No)
2. If No to 1: do you re-grade E2 to Medium and carry it? (Yes / No)
3. Do E1, E3 and E4 ride in the same round as E2? (Yes / No; No carries them to the ideas list)
4. Does the device run for criterion 12 and B11 wait for the head that will merge? (Yes / No)

## Handoff block

Valid only if you rule that E2 does not block and the head is still `a39a5c7`. A fix commit voids the pin. The PR is still a draft, and marking it ready is yours.

````
gh pr merge 52 --repo BeniCheni/keel --squash --match-head-commit a39a5c7d4ac9dd264ca1301b137bfa0c6eec45c4 --subject "Add the iOS foundation (#52)" --body "$(cat <<'EOF'
S91: the first iOS app under apps/ios, with the guards ADR-0009 requires before an app merges. Reviewed head a39a5c7d4ac9dd264ca1301b137bfa0c6eec45c4. Sensitive paths: .github/workflows/verify.yml, AGENTS.md, apps/ios/**, tools/ios/**. New dependency: esbuild 0.28.2 (development only).

Co-authored-by: Cursor <cursoragent@cursor.com>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
EOF
)"
git pull
test "$(git rev-parse origin/main)" = "$(gh pr view 52 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" && echo "origin/main is the squash commit"
pnpm install --frozen-lockfile
pnpm verify
grep -c -i demo README.md
````

The last line stands in for the demo check: it prints 0 today, so there is no demo mode to start yet.

# Executive brief: PR #52, Pass 2.5 re-run, 2026-11-19 America/New_York

Every number below comes from a command run in this session at `a74aa56cb94ee5eec7ba6ac4a8b7e44beef12c98`. The commands are in the PR comment's tables.

## Decision

Shadow mode: the gate says **would escalate**, because E5 is an open High, and because the PR touches sensitive paths and adds a dependency. Beni merges.

## What ships

- An iOS foundation: the app target, keel's core as one bundled script, and a store that keeps one imported terms file with its name and time.
- The store seals what it keeps (complete protection, excluded from backup) and shows nothing when it cannot confirm a file.
- Tooling that holds this: a binary check with exact approvals, a bundle determinism check, and copy lint that follows Swift literals.
- It still declines to claim anything about behaviour on a device. Your B11 picker step and criterion 12 have not been run at this head.

## What the passes found

- **Passes 1 and 2 (39 ids):** 32 fixed, 7 open (B11 waits on the device; B16, B17, C9 as recorded; D1, D2, D4 carried by ruling 12).
- **Pass 2.5, first run (E1 to E4):** all four are closed by Codex's round.
  - E2: on real files the retry is refused in 4 of 4 rows, and the next launch shows the first import whole in 4 of 4.
  - E1, E3, E4: the six mutants that survived before now die, and the bundle build runs through a symbolic link.
- **Ruling 15's three rules hold.** Over 492 fault cases and 21,342 relaunch points on the memory double:
  - No import was stored while `rollback` existed.
  - No point was left with an unfinished recovery after one clean read.
  - No point showed nothing or a mixed pair; the store as at `a39a5c7` gave 3,273 and 287.
- **Mutants:** 31 this pass, 31 killed (18 on the round, 13 earlier store mutants re-run against the changed store).
- **New, E5 (High):** a `record.json` that could not be removed ends up describing a later import's bytes.
  - The next launch shows the second file's bytes under the first file's name and time, both sealed, with no error.
  - Reproduced at 3 of 18 stop points on the double and 4 of 8 on real files.
  - It needs the record's removal to fail twice, and the app to stop inside a three-change window of the next import. That is rarer than E2.
  - The round did not introduce it: the store as at `a39a5c7` and `918f678` gives the same rows. I missed it in my first pass.
- **Contested:** nothing between vendors. E5 has no Codex or PM read yet.

## Verification as re-run

| Check | Result |
| --- | --- |
| Install, `pnpm install --frozen-lockfile` | exit 0 on Node 24.22.2 and 26.13.0 |
| `pnpm verify` | exit 0 on both; core 178, plugin 212, tooling 171 tests; 12 of 12 steps |
| Determinism (the `AGENTS.md` command) | exit 0 |
| Zero network | the `network` step of verify, ok on both Nodes |
| Swift, local | 49 tests, 0 failures, 0 skipped |
| Hosted runs 44603395023, 44604199077, 44605480313, 44606208017 | each six of six `success`; final `swift` job 49 executed, 5 skipped, 0 failures |
| Unsigned builds, binary check, allowlist | both build; eight zero counts on each; usage check exit 0 |
| Tripwire | 0 hits over 355 files and 18 commit messages; the fresh control fired |
| Pass M, demo mode | N/A, not an engine PR and no demo mode yet |
| UI matrix | not run; no device or simulator was used |

Not re-run, and why: D1, D2, D4 (carried); the ten findings "fixed as recorded"; the owner's private-list check (no Claude seat runs it).

## Estimates and model output

None.

## Risks and accepted costs

- **E5**, as above, until you rule on it.
- While a recovery is pending, the screen shows no file and imports are refused. That is ruling 15's stated cost.
- A seal read that throws during a recovery removes a pair that a later read would have kept. That sits inside ruling 2.
- The hosted `swift` check skips the five real-file tests, so the required check does not exercise the real seal steps.
- One mutant batch hit NSCocoaErrorDomain 513; I stopped, you answered "Unlocked", and I re-ran it whole.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes |
| Verdict mergeable, every High closed | **No**: E5 is open |
| Nothing contested | Yes |
| `verify` green at tip; every number re-run | Yes |
| No sensitive path, dependency or schema change | **No**: sensitive paths and `esbuild` 0.28.2 |
| Every commit cold-read by a non-author vendor | Yes, 18 of 18 |
| Gate verdict | would escalate |
| Beni's decision | Not merged at `a74aa56`. Rulings 18 and 19, given on 2026-11-19 at 19:58:21 EST in the PM's session: fix E5 on this PR (18), by refusing an import while `record.json` is on disk without a whole sealed pair (19). Codex's `8b5d5be` followed. PR #52 merged on 2026-11-21 at squash `45fc2a4`, reviewed head `91b471e` |

## Questions for Beni

1. E5: fix it on this PR? (Yes / No)

## Handoff block

Do not run this while E5 is unruled. It applies only if you carry E5 and your two device steps pass at this head. A fix round moves the head, and `--match-head-commit` will then refuse.

```bash
# PR #52 is a draft: marking it ready is yours to run first.
gh pr merge 52 --repo BeniCheni/keel --squash --match-head-commit a74aa56cb94ee5eec7ba6ac4a8b7e44beef12c98 \
  --subject "feat(ios): the S91 iOS foundation (#52)" \
  --body "The iOS app target, keel's core as one bundled script, and a sealed store for one imported terms file.

Reviewed head: a74aa56cb94ee5eec7ba6ac4a8b7e44beef12c98 (18 commits, 62 files).
At that head: pnpm verify green on Node 24.22.2 and 26.13.0 (core 178, plugin 212, tooling 171 tests); Swift 49 tests, 0 failures; both unsigned builds pass the binary check with eight zero counts.
New dependency: esbuild 0.28.2.
Carried: D1, D2, D4, B16, B17, C9.

Co-authored-by: Cursor <cursoragent@cursor.com>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>"
git pull
test "$(git rev-parse origin/main)" = "$(gh pr view 52 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" && echo "origin/main is the squash commit"
pnpm install --frozen-lockfile
pnpm verify   # its network step stands in for demo mode, which does not exist yet
```

# Executive brief: PR #52, Pass 2.5 second re-run, 2026-11-19 America/New_York

Every number below comes from a command run in this session at `8b5d5be2e01113c5671867141f13f42024a21d24`. The commands are in the PR comment.

## Decision

Shadow mode: the gate says **would escalate**, because the PR touches sensitive paths and adds a dependency. Beni merges. Criterion 12 and the B11 picker step are not run yet at this head, and they come before the merge.

## What ships

- An iOS foundation: the app target, keel's core as one bundled script, and a store that keeps one imported terms file with its name and time.
- The store seals what it keeps and shows nothing when it cannot confirm a file. It now refuses an import while a record it cannot remove is on disk without its file.
- Tooling that holds this: a binary check with exact approvals, a bundle determinism check, and copy lint that follows Swift literals.
- It still declines to claim anything about behaviour on a device.

## What the passes found

- **Earlier ids (44):** 37 fixed, 7 open. B11 waits on the device; B16, B17 and C9 are open as recorded; D1, D2 and D4 are carried by ruling 12.
- **E5 is closed by `8b5d5be`.**
  - Eleven mutants of the guard (removed, condition, place) are all killed.
  - The store as at `a74aa56` fails the three new or changed tests.
  - On real files the import is refused in 8 of 8 rows, then stored once the record is gone.
- **Ruling 19 holds on its own terms.**
  - No import is refused once no fault is left, in 42 of 42 rows.
  - From every one of 401,227 stop points in my wider sweep, a fault-free import is stored and shown.
- **Routes the commit's sweep does not run:** I crossed its 7 starts with 13 leftovers, 16 fault modes and 13 steps, with a third import chained on.
  - On the 11 leftovers the store can reach, there are 0 mixed pairs. The store as at `a74aa56` shows 3,855, so the guard also closes a route the commit's sweep does not cover.
  - Two planted `rollback` shapes do show a mixed pair. I found no route to either, by reading and by probing; that is not a proof.
- **Earlier probes still hold:** ruling 15 (21,342 points, all whole), D3 (36 of 36), PM2, and E2 on real files (4 of 4). The 24 earlier store mutants are all killed.
- **New, both Low:**
  - E6: the new sweep does not notice when its "every try" faults stop firing.
  - E7: a first import reported as failed can still be shown at the next launch, when its last step throws and neither file can be removed. Nothing false is shown, and it is not from this commit.
- **Contested:** nothing.

## Verification as re-run

| Check | Result |
| --- | --- |
| Install, `pnpm install --frozen-lockfile` | exit 0 on Node 24.22.2 and 26.13.0 |
| `pnpm verify` | exit 0 on both; core 178, plugin 212, tooling 171 tests; 12 of 12 steps |
| Determinism (the `AGENTS.md` command) | exit 0 |
| Zero network | the `network` step of verify, ok on both Nodes |
| Mutations | 35 of 35 killed (11 on the guard, 24 earlier store mutants) |
| Swift, local | 51 tests, 0 failures, 0 skipped |
| Hosted run 44653327005 | six of six `success`; `swift` job 51 executed, 5 skipped, 0 failures |
| Unsigned builds, binary check, allowlist | both build; eight zero counts on each; usage check exit 0 |
| Tripwire | 0 hits over 355 files and 19 commit messages; the fresh control fired |
| Pass M, demo mode | N/A, not an engine PR and no demo mode yet |
| UI matrix | not run; no device or simulator was used |

Not re-run, and why: D1, D2, D4 (carried); the ten ids "fixed as recorded"; the owner's private-list check (no Claude seat runs it).

## Estimates and model output

None.

## Risks and accepted costs

- Device behaviour is unverified until your criterion 12 run.
- While a record cannot be removed, imports are refused and the screen says so. That is ruling 19's cost.
- The hosted `swift` check skips the five real-file tests.
- E6 and E7, if you carry them.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes |
| Verdict mergeable, every High closed | Yes |
| Nothing contested | Yes |
| `verify` green at tip; every number re-run | Yes |
| No sensitive path, dependency or schema change | **No**: sensitive paths and `esbuild` 0.28.2 |
| Every commit cold-read by a non-author vendor | Yes, 19 of 19 |
| Gate verdict | would escalate |
| Beni's decision | Not merged at `8b5d5be`. Ruling 20, given on 2026-11-19 at 21:08:28 EST in the PM's session, carries E6 and E7. Beni's device run at `8b5d5be` then reproduced B11. Ruling 21 (23:10:30 EST, in a side session) fixes it on this PR, and ruling 22 (23:16:38 EST) removes the `app.keel.yaml` declaration with it. Codex's `e76f296` and `91b471e` followed. PR #52 merged on 2026-11-21 at squash `45fc2a4`, reviewed head `91b471e` |

## Questions for Beni

1. E6 and E7, both Low: carry them? (Yes / No)

## Handoff block

Run this only after criterion 12 and the B11 picker step pass at this head. If a fix round follows, the head moves and `--match-head-commit` refuses.

```bash
# PR #52 is a draft: marking it ready is yours to run first.
gh pr merge 52 --repo BeniCheni/keel --squash --match-head-commit 8b5d5be2e01113c5671867141f13f42024a21d24 \
  --subject "feat(ios): the S91 iOS foundation (#52)" \
  --body "The iOS app target, keel's core as one bundled script, and a sealed store for one imported terms file.

Reviewed head: 8b5d5be2e01113c5671867141f13f42024a21d24 (19 commits, 62 files).
At that head: pnpm verify green on Node 24.22.2 and 26.13.0 (core 178, plugin 212, tooling 171 tests); Swift 51 tests, 0 failures; both unsigned builds pass the binary check with eight zero counts.
New dependency: esbuild 0.28.2.
Carried: D1, D2, D4, B16, B17, C9, E6, E7.

Co-authored-by: Cursor <cursoragent@cursor.com>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>"
git pull
test "$(git rev-parse origin/main)" = "$(gh pr view 52 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" && echo "origin/main is the squash commit"
pnpm install --frozen-lockfile
pnpm verify   # its network step stands in for demo mode, which does not exist yet
```

If you answer No to the question, drop E6 and E7 from the "Carried" line only after their fix has its own cold read.

# Executive brief: PR #52, Pass 2.5 third re-run, 2026-11-20 America/New_York

Every number below comes from a command run in this session at `91b471e43631ace5bca5026e991f79e6d3df4379`. The commands are in the PR comment.

## Decision

Shadow mode: the gate says **would escalate**, because the PR touches sensitive paths and adds a dependency. Beni merges. The B11 picker step and criterion 12 are not run at this head, and they come before the merge.

## What ships

- An iOS foundation: the app target, keel's core as one bundled script, and a store that keeps one imported terms file with its name and time.
- The Files picker now filters on the system's YAML type, and the app no longer declares a type of its own for `.yaml` and `.yml`.
- The store seals what it keeps, shows nothing when it cannot confirm a file, and refuses an import over a record it cannot remove.
- It still declines to claim anything about behaviour on a device.

## What the passes found

- **Earlier ids (46):** 37 fixed, 9 open. Codex's record marks B11 fixed; mine keeps it open until your picker step passes, as the PM's does.
- **`e76f296`, the type list:** 14 of 14 mutants are killed, including `[.plainText]`, `[.text]`, `[.yaml, .plainText]` and the old lookup. Eight wider lists fail only the equality assertion, so that assertion is what holds the width.
- **`91b471e`, the plist:** 10 of 10 mutants are killed, including the old declaration, an exported one, `yml` only, a string-valued tag and `YAML`.
- **Host registrations:** no registration of the app's type can change either test's outcome.
  - The plist test looks up no type, and the picker test's deciding assertion compares constants.
  - This Mac has `app.keel.yaml` registered, as Codex's did, and still maps both extensions to `public.yaml` first.
- **Built apps:** `plutil -extract UTImportedTypeDeclarations` fails in both builds at `91b471e`. Against the `8b5d5be` builds, that key is the only difference (26 keys against 27).
- **Width and path:** `[.yaml]` is what ruling 22's option names, and it is narrower than the old fallback. The import path after the picker is unchanged: `AppModel.swift` has the same blob at both heads.
- **Store probes carry over:** `git diff --stat 8b5d5be 91b471e` lists no store source and no store test.
- **New, E8 (Medium):** B11's regression test passes with B11 put back in `RootView`.
  - With `RootView.swift` restored from `8b5d5be`, `pnpm verify`, all 53 Swift tests and both builds still pass.
  - At the head `RootView.swift:24` does use the shared list, so the app as built is right.
- **Contested:** nothing.

## Verification as re-run

| Check | Result |
| --- | --- |
| Install, `pnpm install --frozen-lockfile` | exit 0 on Node 24.22.2 and 26.13.0 |
| `pnpm verify` | exit 0 on both; core 178, plugin 212, tooling 171 tests; 12 of 12 steps |
| Determinism (the `AGENTS.md` command) | exit 0 |
| Zero network | the `network` step of verify, ok on both Nodes |
| Mutations | 24 of 24 killed this round (14 on the list, 10 on the plist); 1 survivor outside both tests, E8 |
| Swift, local | 53 tests, 0 failures, 0 skipped |
| Hosted run 44763557130 | six of six `success`; `swift` job 53 executed, 5 skipped, 0 failures |
| Unsigned builds, binary check, allowlist | both build; eight zero counts on each; usage check exit 0 |
| Tripwire | 0 hits over 357 files and 21 commit messages; the fresh control fired |
| Pass M, demo mode | N/A, not an engine PR and no demo mode yet |
| UI matrix | not run; no device or simulator was used |

Not re-run, and why: the store probes (no store file changed); D1, D2, D4 (carried); the ten ids "fixed as recorded"; the owner's private-list check (no Claude seat runs it).

## Estimates and model output

None.

## Risks and accepted costs

- The real picker is unproven until your device run. The type mapping I read is this Mac's, not iOS's.
- E8, if you carry it: a later edit to `RootView`'s filter would pass every automated check.
- The hosted `swift` check skips the five real-file tests.
- E6 and E7, carried by ruling 20.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes |
| Verdict mergeable, every High closed | Yes, once the device run passes |
| Nothing contested | Yes |
| `verify` green at tip; every number re-run | Yes |
| No sensitive path, dependency or schema change | **No**: sensitive paths and `esbuild` 0.28.2 |
| Every commit cold-read by a non-author vendor | Yes, 21 of 21 |
| Gate verdict | would escalate |
| Beni's decision | Ruling 24 carries E8. It was given on 2026-11-20 at 13:11:58 EST in the PM's session, and again in this seat's session at 14:26:23 EST ("Carry E8"). Beni's device run at `91b471e` on 2026-11-21 passed the B11 picker step and criterion 12. Merged on 2026-11-21 at 13:33:07 EST at squash `45fc2a4`, reviewed head `91b471e`, from the PM's handoff |

## Questions for Beni

1. E8, Medium: carry it? (Yes / No)

Rule on it before your device run. A fix moves the head, and under ruling 17 criterion 12 runs at the final head.

## Handoff block

Run this only after the B11 picker step and criterion 12 pass at `91b471e`. If a fix round follows, the head moves and `--match-head-commit` refuses.

```bash
# PR #52 is a draft: marking it ready is yours to run first.
gh pr merge 52 --repo BeniCheni/keel --squash --match-head-commit 91b471e43631ace5bca5026e991f79e6d3df4379 \
  --subject "feat(ios): the S91 iOS foundation (#52)" \
  --body "The iOS app target, keel's core as one bundled script, and a sealed store for one imported terms file.

Reviewed head: 91b471e43631ace5bca5026e991f79e6d3df4379 (21 commits, 64 files).
At that head: pnpm verify green on Node 24.22.2 and 26.13.0 (core 178, plugin 212, tooling 171 tests); Swift 53 tests, 0 failures; both unsigned builds pass the binary check with eight zero counts.
New dependency: esbuild 0.28.2.
Carried: D1, D2, D4, B16, B17, C9, E6, E7, E8.

Co-authored-by: Cursor <cursoragent@cursor.com>
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>"
git pull
test "$(git rev-parse origin/main)" = "$(gh pr view 52 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" && echo "origin/main is the squash commit"
pnpm install --frozen-lockfile
pnpm verify   # its network step stands in for demo mode, which does not exist yet
```

For your device run, the digest lines to expect are `200ba5951b9a09853cbe6ff8e7c879d29bc8b7870ee377c30c6ebe7fd1ee5665` once (`minimal.yaml`), then `6215ee32b0fb9c3fc262bac8bdcd8b17050a4df5b47690d35ad79997b370c302` twice (`example-autocall.yaml`), from `shasum -a 256` at this head.

## Records note

Added by the PM for the records PR. The four executive briefs above are the Pass 2.5 seat's texts, read as data from its session transcript. The seat's session is `204a6eee-5b0c-45f0-948c-68a0e3c852c1`, the same session for all four passes, as each pass's seat record names. Each brief is extracted by `brief-from-reply.py` below and hashed with `shasum -a 256`.

| Brief | Reply | Lines | SHA-256 |
| --- | --- | --- | --- |
| Pass 2.5, at `a39a5c7` | 2026-11-19T19:07:07Z | 113 | `df023cc65de2622d431d0d1416da33b074f718fc0a6bb58336543cdfb84a830b` |
| Pass 2.5 re-run, at `a74aa56` | 2026-11-20T00:46:56Z | 102 | `c8691d57366b286bac9ebefca04e8c494ea78ede09e83b4940557468227ba30b` |
| Pass 2.5 second re-run, at `8b5d5be` | 2026-11-20T01:56:53Z | 105 | `9f8422608159036d16ffa5a574eed78487d96217ab24a984ab5a132ea65766bb` |
| Pass 2.5 third re-run, at `91b471e` | 2026-11-20T17:53:57Z | 104 | `f6c7d070d7d7a524084e9d662f4820fc26680a00f88ff7b8b88ce5de2f132fe0` |

PR #50's seats gave their briefs in a fenced block. This seat gave them as plain text, inside a reply that also held a short report and an Insight block. So the script takes each brief from its title line up to the line that opens the reply's Insight block, and drops trailing blank lines. Text before the title, a list of the seat's folders, is left out.

The PM changed one line in each brief: the gate log's "Beni's decision" row, filled in after the merge. Nothing else differs from the extracted text.

**The merge.** Beni merged PR #52 on 2026-11-21 at 13:33:07 EST from the PM's handoff block.
- **Before merging, the block:**
  - checked that the head was `91b471e`, that `main` was still `e499e5f`, and that every check passed;
  - ran his private-list scan over the comments, records, body and squash text that came after Codex's last check;
  - ran `gh pr ready` and `gh pr merge 52 --squash --match-head-commit 91b471e43631ace5bca5026e991f79e6d3df4379` only if every count was zero.
- **What Beni reported:** the lines from `MERGED` on. The counts are his, not shown to the PM.

**The PM's checks after the merge,** on a fresh clone of `main`:
- `gh pr view 52 --json mergeCommit` and `git rev-parse origin/main` both give `45fc2a4564f7a8ad127f90fdd2e88d6bd52f7c1d`. `git rev-list --parents -n1` gives one parent, `e499e5fc4e8f4233f2eb5d501cb2a851b73be2cf`.
- `git diff --quiet 91b471e 45fc2a4` exits 0, so the merged tree is the reviewed head's.
- The squash message is the subject, a blank line and the body the scan read, byte for byte. It carries `Co-authored-by:` trailers for Cursor, Claude and Codex.
- `pnpm install --frozen-lockfile` and `pnpm verify` exit 0 on Node 24.22.2 and 26.13.0, with 12 of 12 steps and core 178, plugin 212 and tooling 171 tests on each. Each ran with `KEEL_DATA_DIR` set to an empty `mktemp -d`, which still held 0 entries afterwards, and `git status --porcelain --untracked-files=all` printed nothing outside `node_modules`.
- The tripwire counts 0 hits in every class over the squash commit.
- Pass M is N/A: `git diff --name-only e499e5f 45fc2a4 -- packages fixtures` prints nothing.
- `git ls-remote origin refs/heads/s91/ios-foundation` prints nothing, and no tag exists on `origin`.
- Push CI on `main`, run 44936153713, is green on six of six jobs at `45fc2a4`, the `swift` job included.

**Where the open items go.**
- **The ideas rows,** under ruling 9: D1, D2, D4, B16, B17, C9, E6, E7 and E8, and the signing note for `Local.xcconfig`. They land in the next docs PR.
- **The rules PR:** the items listed in `pr-52-pass-1.5.md`, and the spec amendments for rulings 1 to 3, 7, 11, 15, 19 and 22.

`brief-from-reply.py`, run as `python3 -I brief-from-reply.py <transcript.jsonl> '<brief title>' <out>`:

```python
# python3 -I brief-from-reply.py <transcript.jsonl> <title> <out>
# Writes the brief in the last assistant reply whose text holds <title>: from the title line up to the line
# that opens the reply's closing Insight block, trailing blank lines dropped. Prints the reply's timestamp.
import json, sys
transcript, title, out = sys.argv[1:4]
found = None
for line in open(transcript, encoding="utf-8"):
    try:
        entry = json.loads(line)
    except ValueError:
        continue
    message = entry.get("message") or {}
    if message.get("role") != "assistant" or not entry.get("timestamp"):
        continue
    for block in message.get("content") or []:
        if not (isinstance(block, dict) and block.get("type") == "text"):
            continue
        lines = block["text"].split("\n")
        starts = [i for i, l in enumerate(lines) if l == title]
        if not starts:
            continue
        ends = [i for i, l in enumerate(lines) if i > starts[0] and l.startswith("`★ Insight")]
        if not ends:
            continue
        body = lines[starts[0]:ends[0]]
        while body and body[-1] == "":
            body.pop()
        found = (entry["timestamp"], "\n".join(body) + "\n")
if found is None:
    sys.exit("no reply holds that title line before an Insight block")
open(out, "w", encoding="utf-8").write(found[1])
print(found[0])
```
