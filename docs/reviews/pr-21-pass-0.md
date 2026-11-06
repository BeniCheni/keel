# Pass 0 brief: PR #21 (S90 iOS core spike)

Written by the PM on 2026-11-05 (America/New_York), from a fresh read of the PR at `27c802c7ebd432ea27adcc98d199902d6db08cd9`. This brief lives on branch `docs/pr-21-records`, not on the PR branch, so that no Claude-authored commit enters PR #21 and Pass 1 stays Claude Code. Beni's device records sit beside it, in `pr-21-device-records.txt` and `pr-21-device-extra.txt`. When this was written, PR #21 had no comment (`gh api repos/BeniCheni/keel/issues/21/comments --jq length` printed `0`).

## Seat for Pass 1

Claude Code, fresh session, fresh clone, Opus 5.5 High, as the spec's Seats section names for a spike PR with no sensitive path. `AGENTS.md` gives the same model as the fallback, so if Opus 5.5 High is unavailable, stop and escalate. The seat needs full Xcode 27.2 on macOS for `swift test` and the unsigned app build. This Mac has no simulator image, on purpose. If any command asks for one, or for any Xcode component, stop and escalate, and do not install it.

Later seats: Pass 2 is Codex on GPT-6.1 Sol High, and Pass 2.5 is a fresh Claude session on Opus 5.5 High. After Pass 2.5, Beni closes PR #21 unmerged and the branch stays. The PM then writes `docs/specs/s90-ios-core-spike-results.md`, Beni rules, and ADR-0009 moves from Proposed.

Claude wrote no line of this PR. A Claude session, the PM, wrote the three build prompts below and a local helper, outside the repo, that ran Beni's device lines. The device numbers passed through that helper, so Codex reads it at Pass 2. The session that wrote this brief takes no review pass on this PR.

## Scope

- Spec: `docs/specs/s90-ios-core-spike.md` as amended by PR #19 (`82e4909`, the base) and PR #22 (`32cfe40`). Read the amended text with `git show origin/main:docs/specs/s90-ios-core-spike.md`, because the branch holds only the base's version. The build prompts at the end of this brief add to the spec and do not loosen it. Design brief: none.
- Base: `KEEL_SPIKE_BASE=82e49091477d53a16d7179f5a418dc3e41ff4395`, the branch's fork point (`git merge-base origin/main origin/s90/ios-core-spike`). `main` is at `32cfe40`. AC8 bars merging it, so `git diff origin/main...HEAD` and `git diff 82e4909...HEAD` show the same diff.
- Sensitive paths touched: none. All 31 files are under `spike/ios-core/` (`git diff --name-only 82e4909...HEAD | grep -v '^spike/ios-core/'` prints nothing), with 3141 insertions and no deletions (`git diff --shortstat 82e4909...HEAD`).
- Release: no. The PR never merges.
- New dependencies: `esbuild` 0.28.2, MIT, on the spike branch only, approved by Beni on 2026-11-02 under the spec's Dependencies section. No Swift package.
- Bootstrap path: no. `verify` (AC9) and the mutation floor apply. Pass M does not: there is no engine and no golden fixture.
- CI: run 41942314747 at `27c802c`, event `pull_request`, conclusion `success`, with all five checks passing (`gh pr checks 21 --repo BeniCheni/keel`).
- Device: Beni's iPhone Air on iOS 27.2, with Xcode 27.2 (27B52) on macOS 27.2, run on 2026-11-05 from a clone pinned at `27c802c`. Every device number is Beni's run. Passes 1, 2 and 2.5 mark them so, and check them for internal consistency, not by re-running.

## Authorship record

From `git log --format='%h %an' 82e4909..origin/s90/ios-core-spike`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `ff4fc35` Add the iOS core spike harness | Cursor | Claude Code, Pass 1 |
| `27a877b` Gate the spike parity check on Swedish and a reversed comparator | Cursor | Claude Code, Pass 1 |
| `27c802c` Tell a fresh clone to install and bundle before xcodebuild | Cursor | Claude Code, Pass 1 |
| The PM's device helper, which is not in the repo | Claude | Codex, Pass 2 |

Cursor built on Grok 4.7 at Extra High by Beni's ruling of 2026-11-04, above the High that the spec and `AGENTS.md` name, so that Cursor's tokens were spent before 2026-11-05. The PR body states the ruling. Any fix commit Pass 1 pushes gets its cold read from Codex at Pass 2. Any Codex fix commit gets its cold read from the fresh Claude session at Pass 2.5.

## Fast-track

Not allowed: the diff is code.

## Rulings Pass 1 cannot see

These were given in the PM's session.

| Date | Beni's words or choice | Effect |
| --- | --- | --- |
| 2026-11-04 | Extra High for the build | The builder seat, above |
| 2026-11-04 | "Yes, amend first", on Q2 | PR #22, merged as `32cfe40`. The spec says the amendment came after spike code and is not pre-registered |
| 2026-11-05 | "Pay Apple" | The free Personal Team was at Apple's device limit, so the device run used a paid Apple Developer Program team |
| 2026-11-05 | "Yes, Record the Q5 change in Pass 0 and the results without amending the spec!" | The next section. The spec stays as merged, so AC11's count stays `1` |

Beni ran the timing and parity launches before giving the last ruling. That ruling changes neither the decision rule nor a threshold: `awk '/^## Decision rule/,/^## Non-goals/' docs/specs/s90-ios-core-spike.md | shasum` prints `0b1d5259a12c2752195776adb7be3ebbf737086c` on `main`.

## The Q5 change

With a paid team, the profile lasts beyond the spike, so:

- "Whether a notification fires after the profile expires" was not run. The results say so and why. Apple's 7-day figure stays a reading, not an observation.
- The reinstall check ran the same day rather than on day 8.
- The keychain row ran under the paid team, not "the Personal Team". The other Q5 rows ran there too, so they no longer show that a free team can do them.
- The spec's "Nothing here depends on paying" and `DEVICE.md` line 3's "free Personal Team" stay as written. This brief and the results correct them.
- AC7 is met except for the expiry check.

What the Personal Team showed, for the results. The first signed build failed with "Your development team has reached the maximum number of registered iPhone devices". Xcode's Apple Accounts pane showed "6 Provisioned Devices" for that Personal Team (Beni's screenshot), while Apple's [compare-memberships page](https://developer.apple.com/support/compare-memberships/) says a free team registers up to 3 devices, and that registrations expire after 7 days. After enrolling, Xcode listed one team of type Individual with the same team ID as the Personal Team. The PM read that from Xcode's settings, printing only the team type and whether the ID matched.

## What ran on the device

The PM wrote a local helper, outside the repo, that ran `DEVICE.md`'s lines from a clone pinned at `27c802c`. It kept the team ID, device ID and bundle ID in a file with mode 600, kept only lines starting `KEEL_SPIKE v1 `, and refused any record that held an identifier. These are the lines that ran, where they differ from `DEVICE.md`:

- **Build:** `xcodebuild build -project spike/ios-core/App/KeelSpike.xcodeproj -scheme KeelSpike -configuration Release -destination "platform=iOS,id=$KEEL_SPIKE_UDID" -derivedDataPath spike/ios-core/.build/ios DEVELOPMENT_TEAM="$KEEL_SPIKE_TEAM" -allowProvisioningUpdates -allowProvisioningDeviceRegistration PRODUCT_BUNDLE_IDENTIFIER="$KEEL_SPIKE_BUNDLE_ID"`. The registration flag is new. On the paid team the build exited 65 without it, saying the device "isn't registered in your developer account". `xcodebuild -help` describes the flag as allowing `xcodebuild` to register the destination device.
- **Install:** `xcrun devicectl device install app --device "$KEEL_SPIKE_UDID" spike/ios-core/.build/ios/Build/Products/Release-iphoneos/KeelSpike.app`.
- **Launch:** `xcrun devicectl device process launch --device "$KEEL_SPIKE_UDID" --terminate-existing --console "$KEEL_SPIKE_BUNDLE_ID" -- -AppleLanguages "(<language>)" -AppleLocale <region> -KeelVariant <variant>`, with `-KeelProbe 1` on the probes. The app never exits on its own, so the helper ended each launch after 15 seconds with no new output. It required exactly 1 fresh timing line and 128 parity lines from each timing launch, and 2 locale lines from each probe.
- **Order:** probes under `(sv) sv_SE` and `(haw) haw_US`. Then 5 fresh launches per variant under `(en-US) en_US`, and 1 compile launch under `(sv) sv_SE`. Then 1 compile launch under `(haw) haw_US`, which `DEVICE.md` does not have. The PM added it because the phone resolved `haw`, where macOS gives `en`. Its records are kept apart and compared with Node under `haw_US`, as a report that never gates.
- **Hand checks:** through `--console` sessions under `(en-US) en_US`, keeping the warm, `q5` and error lines. The Q5 order changed: the 2-minute notification came before Request 70, which fills the 64-slot queue; Request 70 was tapped again after the repeating trigger, to read the queue; and the reinstall was a rebuild through the build line above. The first reinstall round was confounded: the saved snapshot was absent after the rebuild, and the log shows the queue and the repeating trigger re-added. A clean recheck followed (the last 5 lines of `pr-21-device-extra.txt`).
- **Malformed import:** both times, the phone rejected the file with 18 errors, the first at line 1, column 1. The sealed appendix has the PM's reading of that.

At Pass 2, Codex reads the helper at `~/.keel-spike/device.sh` on Beni's Mac, and nothing else under `~/.keel-spike/`: `env` holds the identifiers, and `logs/` holds raw console and build output that names the account.

Beni's observations, which are not in the lines:

1. The 2-minute notification fired with the app force-quit and the phone locked.
2. Tapping it from the lock screen asked for an unlock first, and the detail page then opened.
3. In the clean recheck, the repeating notification arrived after the rebuild, with nothing re-added.

The records: `pr-21-device-records.txt` holds the probe lines and the timing run's 11 launches, in launch order. It is the exact input the helper passed to the comparison, so `sh spike/ios-core/run-parity.sh --compare-device docs/reviews/pr-21-device-records.txt`, from a clone at `27c802c` with the installs done, reproduces it. `pr-21-device-extra.txt` holds the Hawaiian launch and the hand-check lines. In both, lines starting `#` are the PM's notes.

## What to check, beyond the skill's standing checks

Each is a question, not a finding. The PM's results for some of them are in the sealed appendix, so that your first read stays your own.

1. **AC1 to AC12 at `27c802c`, from a fresh clone.** AC5's and AC7's device halves are Beni's run. Check the records for internal consistency instead: are the fresh launches distinct processes, are the counts per variant right, and do your own medians match the claims? Is any number in the PR body unreproducible?
2. **Q1's check after PR #19.** `check-bundle.mjs` is meant to flag a real `require`, `node:`, the global `process`, the global object's names `globalThis`, `global`, `self` and `window`, and `montecarlo`. Try forms it may miss: a computed property on an alias, `Function("return this")()`, indirect `eval`, an alias held in a local variable. Cursor alone gave PR #19's cold read and also built this, so Codex repeats this at Pass 2.
3. **The reversed comparator.** Is `String.prototype.localeCompare`, `Intl.Collator` and each `toLocale` method replaced before the bundle is evaluated, in both the macOS host and the app? Does any other run, or any timing, carry the replacement? It must not. Does the `localecompare-dedupe` row die for its stated reason, `reversed-tie`, and not another? Codex's Q2 read came after spike code existed, so Codex repeats this at Pass 2.
4. **What the timing measures.** Q3 asks for JSContext creation plus bundle evaluation, including `ajv.compile` for `compile`, then the first `loadTerms` on `example-autocall.yaml`, in a new process, in Release, with no debugger attached. Read `Timing.measure` and `HarnessModel.startIfNeeded`. What runs before the clock starts, and what does `loadTermsMs` time beyond `loadTerms`? `project.pbxproj` sets `ENABLE_TESTABILITY = NO` in one configuration: is that the Release one, and is it Release's default? Does `--console` attach a debugger?
5. **Device-comparison coverage.** AC3 asks for all 31 fixtures and the tie input, in both variants, under each engine's locales and the reversed comparator. Does `compare-device.mjs` require every file in every (variant, comparator, locale) group? What does it accept that it should not?
6. **The edge inputs, reported and not gating.** The PR body says `flow-2000` and `block-1000` differ between Node and JavaScriptCore, and that Node's columns differ between runs. Is Node's column really unstable on one input, and why? Does JavaScriptCore give a different diagnostic because it hits a recursion limit? Could any edge input make JavaScriptCore say `ok=true` where Node says `ok=false`, or the reverse? A confident falsehood on the phone is High in kind, but the spec makes these non-gating, so report it and do not decide.
7. **Q4 and Q6 (AC6).** Does each row have a command or a source, and do the counts reproduce?
8. **AC12 and copy.** Does the wording test fail when the snapshot's first line is dropped? Copy lint does not read Swift, so check the harness's strings for hard rule 12 yourself (`git grep -n -i -w -E 'should|buy|sell|hold' -- spike/ios-core`).
9. **`DEVICE.md` against what ran.** The list above shows where they differ. A stale line is a docs Medium at most. The measured SHA stays `27c802c`. A fix commit is optional, changes no device number, and leaves the app's sources alone.
10. **Q5's harness.** The app records how many of 70 requests are kept, not which, and the spec asks which. Whether a repeating trigger occupies a slot is read from totals the app prints. The detail page's waiting-for-unlock state was not reached, because iOS asked for an unlock before the app opened. Which of these are harness defects, and which are limits of what iOS shows?
11. **Privacy.** AC10's git half, the tripwire over the PR body and both record files, and no identifier in `DEVICE.md`. The private-list half of AC10 is Beni's and has not run.

Out of scope, by the spec's non-goals: UI design, App Store or TestFlight submission, network, Monte Carlo, port code for Q4, sync, and merging spike code. The results file and the ADR are the PM's, after Pass 2.5. List out-of-scope findings in your comment; the PM carries them to the ideas note.

## Sealed appendix: to verify independently

Do your own read before opening this. Everything here is a claim, not a fact. Re-derive each one; report any that do not reproduce.

### Builder claims, from the PR body at `27c802c`

| # | Claim (as the builder stated it) | Command the builder gave |
| --- | --- | --- |
| 1 | The seat is Cursor on Grok 4.7, at Extra High by Beni's ruling, and the model id does not carry the effort | None |
| 2 | The spec read is `32cfe40d95dbce06ece90b0b547eea0a95f61dfb` | `git log -1 --format=%H origin/main -- docs/specs/s90-ios-core-spike.md` |
| 3 | `KEEL_SPIKE_BASE` stays `82e4909`, and the first spike commit is `ff4fc3500218d2bc63693ea77797bf98fabc787c` | `git rev-list --reverse 82e49091477d53a16d7179f5a418dc3e41ff4395..HEAD \| head -1` |
| 4 | A missing `swift` is a setup failure, not a parity result: `reason=setup`, exit 2 | A `swift` that exits 1 first on `PATH`, then `sh spike/ios-core/run-parity.sh` |
| 5 | With no `spike/ios-core/.build`, the run builds the host and exits 0 with `reason=pass` | `sh spike/ios-core/run-parity.sh` |
| 6 | Node runs under `en-US`, `haw-US`, `sv-SE`. JavaScriptCore gates on `en-US`, `sv-SE` in both variants, and its `haw` run gives `locale=en,en bytes=match` | The same run |
| 7 | `bytes=match`, `reversed=match`, `tie=present`, `fixtures=31`, and the fixture-count and locale checks pass | The same run |
| 8 | `en-US` against `en` is rejected as a locale pair | The `locales-differ` predicate on `jscontext=en-US,en` |
| 9 | AC4 exits 1 with `reason=byte` | `sh spike/ios-core/run-parity.sh --inject-diff` |
| 10 | AC8 exits 0 on `27a877b` and on `27c802c` | AC8's command |
| 11 | AC11 exits 0, and the count printed `1` | AC11's command, with `ff4fc35` as the first spike commit |
| 12 | AC10's git half exits 1 | AC10's `git grep` |
| 13 | No `URLSession` or `NWConnection` token | `git grep -n -E 'URLSession\|NWConnection' -- spike/ios-core` exits 1 |
| 14 | The deployment target is `27.0` on four lines | `git grep -n IPHONEOS_DEPLOYMENT_TARGET -- spike/ios-core/App/KeelSpike.xcodeproj/project.pbxproj` |
| 15 | `packages/` is untouched | `git diff --exit-code -- packages` |
| 16 | `compile` is 608362 bytes and `standalone` 615302, each `flagged 0`, and the clean `compile.js` has `localeCompare` 0 times | `node spike/ios-core/build.mjs`, then `node spike/ios-core/check-bundle.mjs` |
| 17 | Swift tests exit 0 with `shims=0` on both variants, and the reversed sessions are in `BundleLoadTests` | `swift test --package-path spike/ios-core` |
| 18 | The app compiles unsigned for `arm64-apple-ios27.0` against `iPhoneOS27.2.sdk` | `xcodebuild build ... -destination 'generic/platform=iOS' ... CODE_SIGNING_ALLOWED=NO` |
| 19 | `verify` exits 0 on Node 24.22.2 and 26.13.0, with Test Files 9 and 10 and the tripwire ok | `pnpm install --frozen-lockfile && pnpm verify` |
| 20 | The tie input is `tie-bytes=1287` with `markers-removed=true`, and the fixture list stays 31 | `tie.mjs` applied to `minimal.yaml` |
| 21 | `en-GB`, reported: `node=en-GB`, `jscontext=en-GB`, `bytes=match` | The parity run |
| 22 | Six edges are `same=true`. `flow-2000` and `block-1000` are `same=false`, and their Node columns differ between two runs | The parity run |
| 23 | macOS timings over two sessions: `compile` fresh context medians 78.855 and 77.241 ms, `loadTerms` 12.239 and 11.980 ms; `standalone` fresh context 5.104 and 5.085 ms, `loadTerms` 12.076 and 12.594 ms. These are not the device thresholds | `swift test --package-path spike/ios-core --filter LoadTimeTests` |
| 24 | All twelve floor rows exit 1, each with `phase=baseline exit=0`, `hit=true` and `phase=restored exit=0`, for the reasons in the PR's table | `node spike/ios-core/floor.mjs <row>` |
| 25 | On synthesized logs: with `haw`, exit 0 and `records=256`; without `haw`, exit 0; without `sv`, exit 1 `reason=locale`; without `reversed`, exit 1 `reason=reversed` | `node spike/ios-core/compare-device.mjs` |
| 26 | From a new clone at `27c802c`: both installs, `build.mjs` and the unsigned build exit 0, and the app's two bundles `cmp` equal to `dist` | `DEVICE.md`'s order, unsigned |
| 27 | The Q4 counts and candidate table | Each row's command or source |
| 28 | The stand-in export is generated twice with equal manifests, from seed `keel-s90-standin-1`, from `example-autocall.yaml` and `source-kind.yaml`, and its yaml files are git-ignored | `node spike/ios-core/export-standin.mjs`; `git check-ignore -q spike/ios-core/standin/export.yaml` |
| 29 | The Q6 table | Each row's command |
| 30 | `esbuild` 0.28.2 is MIT, pinned exact, with its lockfile under `spike/ios-core/`, and there is no other new dependency | `gh api repos/evanw/esbuild --jq .license.spdx_id` |
| 31 | Not run by the builder: the iPhone, AC10's private-list half, the App Review re-read, and Q5's device rows | None |

### PM probes, 2026-11-05

These were run to steer the questions above. They are not findings: severity and fixes are Pass 1's.

**A. The head from a new clone**, on Node 24.22.2 and macOS 27.2, at `27c802c` with `origin/main` at `32cfe40`:

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile`; `pnpm --dir spike/ios-core --ignore-workspace install --frozen-lockfile`; `node spike/ios-core/build.mjs`; `node spike/ios-core/check-bundle.mjs` | Each exit 0. `compile` 608362 bytes and `standalone` 615302, each `flagged=0` |
| `sh spike/ios-core/run-parity.sh` | Exit 0, `reason=pass`, `bytes=match`, `reversed=match`, `haw-jscontext locale=en,en bytes=match`, `locale-check status=pass node=en-US,haw-US,sv-SE jscontext=en-US,sv-SE`, `fixture-count compile=31 standalone=31 node=31` |
| `sh spike/ios-core/run-parity.sh --inject-diff` | Exit 1, `reason=byte` |
| AC8, AC10's git half, AC11 | Exit 0, 1 and 0. AC11's count is `1`, with first spike commit `ff4fc35` |
| `git status --porcelain` after all of it | Empty |

The PM did not run `swift test`, the floor rows or `pnpm verify` for this brief.

**B. The device records hold together.** Run against `pr-21-device-records.txt`:

- 11 fresh timing lines with 11 distinct `pid` values.
- 1408 parity lines. Each (variant, comparator, locale) group holds all 32 inputs: 320 lines in each `en-US` group, which is 10 launches, and 32 in each `sv-SE` group.
- No hash differs between repeated launches for the same variant, locale, comparator and input.
- 4 probe locale lines: `sv-SE` in both variants, and `haw` in both.

**C. Medians from the records**, over the first 10 timing lines. The 11th line, from the Swedish launch, stays out.

```bash
python3 -c 'import re,statistics as s,sys; r=[re.search(r"variant=(\S+) .*contextMs=(\S+) loadTermsMs=(\S+)",l).groups() for l in open(sys.argv[1]) if "kind=fresh" in l][:10]; [print(v, s.median(float(x[1]) for x in r if x[0]==v), s.median(float(x[2]) for x in r if x[0]==v)) for v in ("compile","standalone")]' docs/reviews/pr-21-device-records.txt
```

| Variant | Context and bundle, median (worst) | First `loadTerms`, median (worst) | Launches under both limits |
| --- | --- | --- | --- |
| `compile` | 105.073 ms (108.544) | 13.479 ms (13.831) | 5 of 5 |
| `standalone` | 5.704 ms (6.046) | 16.788 ms (17.034) | 5 of 5 |

The thresholds are 500 ms and 50 ms, with close-call bands of 400 to 600 ms and 40 to 60 ms. No median is in a band. The Swedish launch gave 104.605 ms and 13.137 ms.

**D. The comparison from the records**, at `27c802c`: `device-compare records=1408 locales=en-US,sv-SE variants=compile,standalone comparators=identity,reversed files=32 fixtures=31 haw-seen=yes`, then `mismatches=0` and `bytes=match`, exit 0.

**E. The Hawaiian launch** (part 1 of `pr-21-device-extra.txt`): 128 records, phone locale `haw`. Against Node's `parity-node.mjs` under `LC_ALL=haw_US.UTF-8`, which resolved `haw-US`, hashing each JSON line as `compare-device.mjs` does: 0 differ. That comparison is the PM's code in the helper, not the spike's.

**F. A thin log passes the comparison.** The PM built a log from Node's own hashes, with full `en-US` groups and `sv-SE` groups that hold only the tie input: 132 lines. `sh spike/ios-core/run-parity.sh --compare-device` on it printed `records=132 ... fixtures=31`, `mismatches=0` and `bytes=match`, and exited 0. Beni's records hold all 32 inputs in every group (B), so the device result does not rest on this.

**G. The malformed import.** `malformed.yaml` is byte-identical to `fixtures/synthetic/terms/invalid/source-kind.yaml` (`cmp`), and on that fixture the phone matched Node in 44 parity records. Through `parity-node.mjs`, Node gives `malformed.yaml` 1 error, the first at line 8, column 11, and gives `manifest.json` from the same stand-in folder 18 errors, the first at line 1, column 1. The phone's two rejections were 18 errors at line 1, column 1. The PM's inference is that the phone was given `manifest.json` both times. The check still showed a malformed file rejected with a line and column, with the previous copy kept.

**H. The hand checks** (part 2 of `pr-21-device-extra.txt`), as the PM reads them:

- Warm, 20 in one process: `compile` context median 94.845 ms (worst 141.701), `loadTerms` 13.101 (14.335). `standalone` ran twice: context 3.434 (12.258) and 3.424 (12.163), `loadTerms` 12.727 (31.880) and 12.744 (31.763).
- The import was stored with `backup-excluded=true` and `NSURLFileProtectionComplete`, and read back true after a later import replaced it.
- Keychain `added-read-deleted`. Detail `readable`, disclaimer `present`. Notifications `authorized`, alert setting `2`.
- Request 70 gave `count=64 total=64`. After the repeating trigger (`count=1`), Request 70 again gave `count=64 total=64`, so the repeating trigger was not in the queue then.
- First reinstall round: detail `empty` and backup flag `absent`, with queue and repeating trigger re-added in the same stretch of the log. Clean recheck: the import stored, one repeating trigger added, then after the rebuild detail `readable` with the disclaimer and backup flag `true` with complete protection. With Beni's observation 3, both the file and the pending notification survived a reinstall over the old build.

**I. Build errors, read through a filter that replaced identifiers**: on the Personal Team, "Your development team has reached the maximum number of registered iPhone devices", then "No profiles for '<bundle>' were found". On the paid team without the registration flag: the device "isn't registered in your developer account". With it: `BUILD SUCCEEDED`, and the install went through.

## Build prompts

As the PM wrote them and handed them to Beni, all on 2026-11-04 (America/New_York). The PM cannot see what Cursor received. An earlier draft of the first prompt named High. Beni chose Extra High before he sent it, and the first prompt below replaced it.

First, before `ff4fc35`:

```
You are Cursor, the builder seat on BeniCheni/keel slice S90, the iOS core spike. Use Grok 4.7 Extra High. The chat's model id reads grok-4.7 at any effort, so read the effort from the picker, not the id. The spec and AGENTS.md name High for this slice. Beni ruled Extra High for this build on 2026-11-04, so that is not a conflict, and you state his ruling in the PR body. If that model or effort is unavailable, stop and tell me. The seat has no fallback.
Your build authority is docs/specs/s90-ios-core-spike.md at commit 82e49091477d53a16d7179f5a418dc3e41ff4395, under AGENTS.md. Read both in full first, then the probe and the "Left for the build prompt" section of docs/reviews/pr-19-pass-0.md. Apart from the ruling above, if this prompt, the spec and AGENTS.md disagree, stop and report it, and do not choose.
Preflight, and stop if any of it differs: xcode-select -p prints /Applications/Xcode.app/Contents/Developer, xcodebuild -version prints Xcode 27.2, git status --porcelain prints nothing, and git merge-base --is-ancestor 82e49091477d53a16d7179f5a418dc3e41ff4395 origin/main exits 0. Report what each printed.
Work in this workspace, ~/code/keel-s90, which is a fresh clone. Never work in ~/code/keel-pm, which is the PM's copy. Export KEEL_DATA_DIR="$(mktemp -d)" for every command. Never open the user's data folder or anything under ~/.config/keel/. The private-list half of AC10 is Beni's, so report it as not run by you. Data is synthetic only: generate the Q5 stand-in export by seed from the synthetic terms fixtures, and never hand-type a fixture.
Cut s90/ios-core-spike from exactly that commit, even if main has moved, and record KEEL_SPIKE_BASE=82e49091477d53a16d7179f5a418dc3e41ff4395 in the claims list. Never merge or rebase main into the branch, and never force-push. Commit with git -c user.name=Cursor -c user.email=cursoragent@cursor.com commit. Open one draft PR and leave it a draft. It never merges: after review, Beni closes it.
Before every push, run pnpm install --frozen-lockfile && pnpm verify on Node 24.22.2 and 26.13.0, plus every spike command that exists so far, and read the exit codes, not piped output. pnpm verify does not type-check or run spike code, so its pass says nothing about the spike.
Push the next commit only after CI is green on the last one you pushed. GitHub has been short of macOS arm64 runners. If a macOS cell is cancelled with zero steps, confirm the cause with gh api repos/BeniCheni/keel/check-runs/<job id>/annotations --jq '.[].message' and re-run it with gh run rerun <run id> --failed. While CI is stuck, keep working and committing locally, with each commit passing the checks above, and push them one at a time as CI clears. A local pass is not green CI. Never ask for or use a bypass.
Everything you add lives under spike/ios-core/. Never edit @keel/core, a sensitive path, the root package.json, lockfile or .gitignore, or the tripwire allowlist. The only new dependency is esbuild, pinned exact, with spike/ios-core/pnpm-lock.yaml committed. Put .build/, xcuserdata/ and DerivedData in spike/ios-core/.gitignore. Commit no binary: any file with a NUL byte fails the tripwire, so no PNG and no image in an asset catalog. Do not name a file *.test.mjs or *.test.ts under a test/ folder in the spike, because it joins the repo's tooling suite: verify's Test Files counts must stay at 9 and 10. No file may spell out a require or an import of the Monte Carlo package, because the boundary check reads every text file. Copy lint does not read Swift, so hold harness strings to hard rule 12 yourself.
A failing result is a result. If a Q1, Q2 or Q3 check fails, or the bundle needs a core change, do not edit core, loosen a check or change a threshold to make it pass. Report the failure with its command. A shim may define only host globals the bundle calls, as the spec's edge cases say, and you report every shim.
Set IPHONEOS_DEPLOYMENT_TARGET = 27.0 on the app target, and show it with git grep IPHONEOS_DEPLOYMENT_TARGET -- spike/ios-core. Xcode's SDK is iOS 27.2, and 27.0 is the target that has been compile-checked. This Mac has no simulator images (xcrun simctl runtime list reports 0). Beni deleted them on purpose, and no spec command needs one. If a build asks for one, or for any Xcode component, stop and escalate, and do not install it. Check that the app compiles with no device or account by using -destination generic/platform=iOS CODE_SIGNING_ALLOWED=NO.
You never run the device lines, and you never ask for, read or print an Apple ID, team ID, device name or UDID. KEEL_SPIKE_TEAM, KEEL_SPIKE_UDID and KEEL_SPIKE_BUNDLE_ID stay in Beni's environment. The committed project sets no team and has a placeholder bundle ID that names no person. The build sets the real ID from KEEL_SPIKE_BUNDLE_ID through PRODUCT_BUNDLE_IDENTIFIER, which the spec's xcodebuild line does not pass yet. The spec asks you to confirm or replace its three device lines, so record what you changed and why. Confirm that AC10's git grep exits 1 at every push.
Write spike/ios-core/DEVICE.md for Beni. He runs it from a fresh clone of the branch, not his working copy, on the free Personal Team. It tells him to trust the developer profile on the phone before the first launch (Settings > General > VPN & Device Management), and to keep automatic iOS updates off until the runs end, because every timing must come from one iOS version. It orders the runs: Q3 and the Q2 device parity first, then Q5, and the profile-expiry check last, on day 8 or later, because installs last 7 days. The harness writes each measurement as one sanitized line in a fixed format, with no signing, provisioning or install output and no identifier, and run-parity.sh --compare-device reads only those lines. The raw console log stays out of the repo.
The PR body carries every claim with its reproducing command, run in the session; KEEL_SPIKE_BASE; the Q4 table with each row re-verified; the Q6 table; the Q5 checklist for Beni; esbuild's justification and license; and the eleven mutation-floor rows. Each row's command first proves the unmodified comparison passes, then exits nonzero for the intended reason, and the comparison passes again after restoring. Mark anything not run as not run.
Write no results file and no ADR edit, and give no verdict on Path A or Path B. Report each clause's measured outcome and stop there. The PM writes the results, and Beni rules.
Stop and escalate to me, as a question answerable in one word, on any privacy issue, a tripwire hit, a dependency the work needs, a need to read the user's data folder, a claim you could not re-run, or any disagreement between this prompt and the repo's rules. Never edit the tripwire allowlist to clear a hit. When everything that does not need the iPhone is pushed and green, post the PR link and DEVICE.md's path, then stop. Do not review your own work.
```

Second, after PR #22 merged, before `27a877b`:

```
You are Cursor, continuing the builder seat on BeniCheni/keel slice S90, on draft PR #21. Stay on Grok 4.7 Extra High, by Beni's ruling of 2026-11-04. Read the effort from the picker, not the model id. If it is unavailable, stop and tell me. Everything in your first build prompt still applies unless this prompt changes it.
Beni ruled to amend Q2 before the device runs, and PR #22 merged it as 32cfe40d95dbce06ece90b0b547eea0a95f61dfb. Read the amended spec with git fetch origin && git show origin/main:docs/specs/s90-ios-core-spike.md, and read origin/main:docs/reviews/pr-22-pass-0.md, including its probe and "Left for the builder". If they disagree with this prompt, stop and report it, and do not choose.
Keep the base. KEEL_SPIKE_BASE stays 82e49091477d53a16d7179f5a418dc3e41ff4395. Never merge or rebase main into the branch, and never force-push. AC8 and the amended AC11 depend on that: run both with origin/main fetched, and report their exit codes.
Fix the harness so AC3 reproduces. run-parity.sh calls swift build with --show-bin-path, which prints the path without building, so in a clone that has never built the host it exits 1 with No such file. Make it build the host first, and report a setup failure as a setup failure, not as a parity result. Show this from a clean clone.
Implement Q2 as amended. Node runs under en_US, haw_US and sv_SE. JavaScriptCore runs under en_US and sv_SE, for each variant. Every output must be byte-identical. JavaScriptCore still makes a haw run, and each resolved locale is reported, but that run does not gate.
Tighten the locale check. A run fails if its locale does not start with the language it asked for, so en does not count as sv_SE, and an engine's run still fails if its two runs report the same locale. --prove locales-differ must no longer accept en-US against en, and the same-locale floor row must use the new baseline.
Add the tie input: minimal.yaml with call, barrier and economics removed in memory, the edit packages/core/src/terms/terms.review.test.ts makes. It gates in every comparison beside the 31 fixtures. Generate it, do not hand-type it, and do not commit it as a fixture. The fixture-count check stays at 31.
Add the reversed-comparator run in JavaScriptCore, on macOS and on the iPhone. Before the bundle is evaluated, it replaces String.prototype.localeCompare, Intl.Collator and the toLocale methods with versions that give a different answer from the real ones. Its output must be byte-identical to the others. It is a test run, not a host shim: no other parity run and no timing has it, and the host still reports shims=0.
Add the twelfth mutation-floor row: put localeCompare back in dedupe through a build plugin, with core unedited, and show that the reversed-comparator run catches it for that reason on the tie input. git diff of packages/ stays empty. Like the other rows, it first proves the unmodified comparison passes, and the comparison passes again after restoring. Update every other row that the new baselines affect.
Update the iPhone side. The app runs the same inputs under en_US and sv_SE and with the reversed comparator, for each variant, and logs a SHA-256 of each output. compare-device.mjs requires those runs, reports the haw run as seen, and no longer requires haw. Check that the app still compiles with -destination generic/platform=iOS CODE_SIGNING_ALLOWED=NO.
Update spike/ios-core/DEVICE.md. Before any timing, Beni makes one launch each under (sv) sv_SE and (haw) haw_US and reads the locale lines. If sv does not resolve to a locale starting with sv, he stops and tells the PM before going further. Keep the rest of the order: Q3 and the Q2 device parity, then Q5, then the profile-expiry check on day 8 or later. Keep the sanitized line format, and keep every identifier out.
A failing result is still a result. If run-parity.sh exits nonzero on the amended check, report the reason and the command. Do not edit core, loosen a check or change a threshold to make it pass.
Before every push, run pnpm install --frozen-lockfile && pnpm verify on Node 24.22.2 and 26.13.0, plus every spike command, and read the exit codes, not piped output. Push the next commit only after CI is green on the last one you pushed. If a macOS cell is cancelled with zero steps and its annotations show no runner was acquired, re-run it with gh run rerun <run id> --failed, and keep committing locally while you wait. Never ask for or use a bypass.
Update the PR body at the new head: every claim with its reproducing command run in this session, the spec version you read (git log -1 --format=%H origin/main -- docs/specs/s90-ios-core-spike.md), that this amendment came after the first spike commit, the resolved-locale results, the reversed-comparator and tie-input results, and the twelve floor rows. Give no verdict on Path A or Path B. Mark anything not run as not run.
Stop and escalate to me, as a question answerable in one word, on any privacy issue, a tripwire hit, a dependency the work needs, a claim you could not re-run, or any disagreement with the repo's rules. When everything that does not need the iPhone is pushed and green, post the PR link, the new head, the exit code of sh spike/ios-core/run-parity.sh and DEVICE.md's path, then stop. Do not review your own work.
```

Third, after the PM ran `27a877b` from clean clones, before `27c802c`:

```
You are Cursor, continuing the builder seat on BeniCheni/keel slice S90, on draft PR #21. Stay on Grok 4.7 Extra High, by Beni's ruling of 2026-11-04. Read the effort from the picker, not the model id. If it is unavailable, stop and tell me. Everything in your earlier build prompts still applies unless this prompt changes it. The PM ran your head, 27a877b525e9a767362b8b6e03b69575a9ae022d, from clean clones and found two gaps.
First gap: spike/ios-core/DEVICE.md's build line fails in a fresh clone. xcodebuild exits 65 because compile.js and standalone.js do not exist: dist/ is gitignored, and the file never says to install or build. Add the steps before the build line, on Node 24.22.2: pnpm install --frozen-lockfile, pnpm --dir spike/ios-core --ignore-workspace install --frozen-lockfile, and node spike/ios-core/build.mjs. Say that Beni's shell may default to another Node. Then show it works from a new clone with nothing installed or built, following DEVICE.md's order, using -destination generic/platform=iOS CODE_SIGNING_ALLOWED=NO in place of the signed line, and report the exit codes and that the built app holds compile.js and standalone.js. Run nothing on a device.
Second gap: your last PR body edit dropped sections the spec requires there. AC6 needs the Q4 and Q6 tables, with a command or a source per row. AC7 needs the Q5 checklist for Beni. Restore them, plus esbuild's justification and license (gh api repos/evanw/esbuild --jq .license.spdx_id). Your first version is in the PR's edit history and in this chat. Re-run each row's command in this session rather than copying it, and mark anything not run as not run. Keep everything the body says now. Editing the body does not need a commit, and the DEVICE.md change does.
Change nothing else. Do not edit core, a sensitive path, a check or a threshold, and never merge or rebase main into the branch. Before you push, run pnpm install --frozen-lockfile && pnpm verify on Node 24.22.2 and 26.13.0, plus every spike command, and read the exit codes, not piped output. If a macOS cell is cancelled with zero steps and its annotations show no runner was acquired, re-run it with gh run rerun <run id> --failed. Never ask for or use a bypass.
Give no verdict on Path A or Path B. Stop and escalate to me on any privacy issue, a tripwire hit, a claim you could not re-run, or any disagreement with the repo's rules. When the commit is pushed and green and the body is updated, post the new head and the fresh-clone result, then stop. Do not review your own work.
```
