# S90 results: iOS core spike

- Status: written by the PM (Claude) on 2026-11-06 (America/New_York), after the spike PR's review. Beni rules on these results, and ADR-0009 moves from Proposed then.
- Spec: `docs/specs/s90-ios-core-spike.md` as amended at `32cfe40`. The decision rule and the thresholds are as registered: `git show 32cfe40:docs/specs/s90-ios-core-spike.md | awk '/^## Decision rule/,/^## Non-goals/' | shasum` prints `0b1d5259a12c2752195776adb7be3ebbf737086c`.
- Spike branch: `s90/ios-core-spike`, kept and never merged. `KEEL_SPIKE_BASE` is `82e49091477d53a16d7179f5a418dc3e41ff4395`. The iPhone measured the app built from `27c802c7ebd432ea27adcc98d199902d6db08cd9`. The reviewed head is `0c06924b339bb1bd0f3537b69f34edaf3a34ea22`, and no app source changed between them (`git diff --quiet 27c802c 0c06924 -- spike/ios-core/App spike/ios-core/Sources spike/ios-core/Tests spike/ios-core/Package.swift spike/ios-core/build.mjs spike/ios-core/bundle.mjs` exits 0).
- Spike PR: #21, built by Cursor, closed unmerged by Beni on 2026-11-06 (`gh pr view 21 --repo BeniCheni/keel --json state,closedAt`).
- Review records: `docs/reviews/pr-21-pass-0.md`, `pr-21-pass-1.5.md` and `pr-21-pass-2.5.md`, with Beni's sanitized device lines in `pr-21-device-records.txt` and `pr-21-device-extra.txt`.

Unless a row says otherwise, the PM ran each command below on 2026-11-06, from a new clone at `0c06924`, on Node 24.22.2, Xcode 27.2 and macOS 27.2, with `KEEL_DATA_DIR` set to an empty temp directory. Device figures are Beni's run on 2026-11-05, on an iPhone Air with iOS 27.2, recomputed here from the record files and not re-measured.

## What the rule selects

| Clause | Measured | Holds? |
| --- | --- | --- |
| 1. **Q2:** parity is 100% on every fixture, in both engines, in both locales and on the iPhone, against the merged core with nothing edited | On macOS, `sh spike/ios-core/run-parity.sh` exits 0 with `bytes=match` and `reversed=match` on 31 fixtures plus the tie input, in both variants, with Node under `en-US`, `haw-US`, `sv-SE` and JavaScriptCore under `en-US`, `sv-SE`. On the iPhone, `sh spike/ios-core/run-parity.sh --compare-device docs/reviews/pr-21-device-records.txt` exits 0: 1408 records, 8 groups of 32 inputs, `mismatches=0`. `git diff --exit-code 82e4909 0c06924 -- packages` exits 0, and the host reports `shims=0` | Yes, for `compile` and for `standalone` |
| 2. **Q3:** both medians on the device are under the thresholds | `compile`: 105.073 ms and 13.479 ms. `standalone`: 5.704 ms and 16.788 ms. Thresholds 500 ms and 50 ms. No median is in its close-call band (400 to 600 ms, 40 to 60 ms) | Yes, for both |
| 3. **Q5:** no App Review blocker to executing bundled JavaScript | Cursor's re-read on 2026-11-06 ([issuecomment-6690887877](https://github.com/BeniCheni/keel/pull/21#issuecomment-6690887877)): guidelines 2.5.2 and 4.7 and license section 3.3.1(B) are unchanged since 2026-11-02, and nothing in them names bundled JavaScript run through JavaScriptCore inside the app as a problem | Yes, as a reading. App Review has the final word, and the spike submitted nothing |

**All three clauses hold for `compile`, the merged core with nothing edited, so the rule chooses Path A.** It is not a close call: no gated median is inside its band. The edge case "only `standalone` passes" does not arise. `standalone` passes too, and it would need a core change, which is not needed for this result.

**What a pass does not prove**, as the spec registered it: this measures the terms loader. The engine, schedule, alert rules and CSV parsing do not exist yet, so the pass says Path A works for the core as it stands at `82e4909`. It does not say the load time will hold as the core grows; ADR-0009's "Revisit when" covers that.

**Not pre-registered.** Q2's locale check was amended on 2026-11-04 by PR #22, after the first spike commit, and after macOS `bytes=match` was known, before any device number. As first registered, Q2 ran both engines under `en_US` and `haw_US`. JavaScriptCore on macOS resolves `haw` to `en` (`haw-jscontext locale=en,en` in the macOS run), so that check failed by construction there, for a reason about locale resolution and not about the core. On the iPhone, JavaScriptCore resolved `haw`: the probe lines in `pr-21-device-records.txt` read `locale=haw` for both variants, and an extra `haw_US` launch gave 128 records with 0 differences from Node under `haw_US` (`pr-21-device-extra.txt`, part 1). That launch was added by the PM after the probe and is not pre-registered either.

**How the device run differed from the plan.** Each is recorded in `docs/reviews/pr-21-pass-0.md`:

- The free Personal Team was at Apple's device limit, so Beni ruled "Pay Apple", and the run used a paid Apple Developer Program team. The spec's "Nothing here depends on paying" is corrected here.
- The paid team's build needed `-allowProvisioningDeviceRegistration`, which `DEVICE.md` at `27c802c` lacked.
- A helper the PM wrote, outside the repo, ran the device lines and kept only `KEEL_SPIKE v1` lines. Codex read it at Pass 2.
- Beni ran the timing and parity launches before ruling on the Q5 change below. That ruling changes no clause and no threshold.

## Q1 Bundle

| Check | Command | Result |
| --- | --- | --- |
| Build and check, both variants | `node spike/ios-core/build.mjs && node spike/ios-core/check-bundle.mjs` | Exit 0. `compile` 608362 bytes, `standalone` 615302 bytes, each `flagged=0` |
| Load in a JSContext on macOS | `swift test --package-path spike/ios-core` | Exit 0, 3 tests, 0 failures. The host printed `console=object url=undefined function=function fetch=undefined xmlHttpRequest=undefined webSocket=undefined process=undefined shims=0` |
| Core edited | `git diff --exit-code 82e4909 0c06924 -- packages` | Exit 0: no |

JavaScriptCore defines `console`, so `ajv`'s logger and `yaml`'s warnings find one. It does not define `URL`. The spec names `fast-uri`'s one `new URL` path as a trap. Every comparison matched Node, where `URL` exists, so no parity input took that path to a different result; whether any input reached it was not checked.

Limits of the static check, which the spec states and Pass 1 and Pass 2 each showed by planting forms: `check-bundle.mjs` misses code built at run time (`Function("return this")().process`, indirect `eval`) and a sloppy function's `this`. It also does not flag `Buffer`, `__dirname` or `module`, which are outside the spec's list. Q2's runs cover those only on the paths they exercise.

## Q2 Parity

On macOS, in the run above:

- Node resolved `en-US`, `haw-US` and `sv-SE`. JavaScriptCore resolved `en-US` and `sv-SE` for both variants, and `en` for `haw` (`haw-jscontext locale=en,en bytes=match`, reported and not gating).
- `fixture-count compile=31 standalone=31 node=31`, `tie=present`, `bytes=match`, `reversed=match`, `locale-check status=pass`, `reason=pass`.
- `en-GB`, reported: `node=en-GB jscontext=en-GB bytes=match`.

On the iPhone (Beni's run): every (variant, comparator, locale) group holds all 32 inputs, and no input has two hashes. Pass 1, Pass 2 and Pass 2.5 each checked this from the record file with their own script.

Edge inputs, reported and not gating: `complex-key`, `alias-key`, `leading-bom`, `crlf`, `non-bmp` and `year-zero` are `same=true`. `flow-2000` and `block-1000` are `same=false`: Node gives `yaml-syntax` at `6:794` and `992:1789`, JavaScriptCore gives `wrong-type:6:3` and `unknown-key:98:1`, and both engines say `ok=false`. Pass 1 traced this to Node running out of stack inside `yaml`, which `load.ts` reports as `yaml-syntax`; with `node --stack-size=4000`, Node gives JavaScriptCore's answers, and Codex reproduced that. So a deep but valid document could read `ok=false` in Node and `ok=true` on the phone. None of the eight inputs is such a document. This is put to Beni as the spec asks, and it does not make a close call.

During review, Pass 1 found that five mutation-floor rows decided "killed" with their own comparison instead of the gate they named, and that the device comparison accepted a group missing inputs or holding an error line. Both were fixed (`14b0308`, `d0c9fc3`) with floor rows that fail without the fix. The gates themselves were sound, and the result above holds under the fixed harness.

## Q3 Code generation and load time

`ajv.compile`, which calls `new Function`, works inside a JSContext on the iPhone: the `compile` variant ran all its parity inputs with no mismatch.

Beni's iPhone, Release build, the first 10 fresh launches (5 per variant, each a new process with its own `pid`), computed with the command in `docs/reviews/pr-21-pass-0.md`, probe C:

| Variant | Create a JSContext and evaluate the bundle: median (range) | First `loadTerms`: median (range) | Launches under both limits |
| --- | --- | --- | --- |
| `compile` | 105.073 ms (103.640 to 108.544) | 13.479 ms (12.996 to 13.831) | 5 of 5 |
| `standalone` | 5.704 ms (5.451 to 6.046) | 16.788 ms (16.034 to 17.034) | 5 of 5 |

The 11th launch, under `sv_SE`, gave 104.605 ms and 13.137 ms and stays out of the medians.

Reported, not gated. The warm set, 20 in one process (`grep kind=warm docs/reviews/pr-21-device-extra.txt`): `compile` context median 94.845 ms (worst 141.701), `loadTerms` 13.101 ms (worst 14.335). `standalone` was run twice: context 3.434 and 3.424 ms (worst 12.258 and 12.163), `loadTerms` 12.727 and 12.744 ms (worst 31.880 and 31.763).

Against a macOS JSContext, from `swift test --package-path spike/ios-core --filter LoadTimeTests` in the run above: `compile` 75.563 ms and 12.027 ms, `standalone` 5.130 ms and 12.446 ms (fresh medians). The phone was slower by about 1.4 times for `compile`'s context and `standalone`'s `loadTerms`, and about 1.1 times for the other two. The spike did not establish whether a JIT ran on either device, so it neither confirms nor refutes the premise "no JIT in-app"; it shows the measured cost is far under the thresholds either way.

What the clocks cover (Pass 1, read from `Timing.swift` and `CoreSession.swift`): the context clock starts at `JSContext()` and covers creation, bundle evaluation with `ajv.compile` for `compile`, and the harness's helper script, with file loading before it. `loadTermsMs` also times `verificationSummary`, `JSON.stringify` and the bridge back to Swift, so it errs toward a slower number. The build was Release, with `ENABLE_TESTABILITY = NO` in the Release configuration. Whether `devicectl ... --console` attaches a debugger was not checked on the phone; its help text describes it as bridging stdout, with a debugger attached separately.

## Q4 Swift-port cost

A desk study, from the PR body at `27c802c`; Pass 1 and Pass 2 each re-ran its counts and licenses. The core outside tests is 964 lines (`git ls-files packages/core/src | grep -v test | xargs cat | wc -l`). The nine loader files total 796 lines (`wc -l` on `locate.ts`, `dates.ts`, `load.ts`, `checks.ts`, `project.ts`, `summary.ts`, `messages.ts`, `cusip.ts` and `schema-map.ts`, in the run above), and the schema is 2163 lines. A port would rebuild a strict YAML 1.2 parser with positions, a JSON Schema 2020-12 validator, and the loader logic.

| Must rebuild | Candidates the builder read | License |
| --- | --- | --- |
| Strict YAML with positions | `jpsim/Yams` (its columns count Unicode scalars, where the core counts UTF-16 units); `pantoniou/libfyaml` | MIT; MIT |
| JSON Schema 2020-12 | `ajevans99/swift-json-schema`; `objecthub/swift-dynamicjson`; `kylef/JSONSchema.swift` (2020-12 support incomplete, last pushed 2023-07-25) | MIT; Apache-2.0; BSD-3-Clause |
| CUSIP, dates and loader logic | None. Rewritten by hand | n/a |

The spec has Q4's size inform a close call only. This result is not one.

## Q5 iOS constraints

Beni's hand checks on 2026-11-05, read from `docs/reviews/pr-21-device-extra.txt` part 2, with his observations where noted. All ran under the paid team.

| Subject | Result |
| --- | --- |
| Import through Files | The export was stored with `backup-excluded=true` and `NSURLFileProtectionComplete`. A malformed file was rejected with a line and column, and the previous copy was kept (`kept-previous=true`). The rejected file was most likely `standin/manifest.json`, not `malformed.yaml`: the phone's 18 errors at line 1, column 1 match Node on `manifest.json`, and `malformed.yaml` gives 1 error at 8:11 in Node and on the phone's own parity run of the same bytes. That is an inference |
| Storage in the sandbox | The backup flag read back true after a later import replaced the file, with complete protection |
| Notifications, app closed | One scheduled 2 minutes out fired with the app force-quit and the phone locked (Beni's observation). Authorization `authorized`, alert setting `2` |
| Detail page from the lock screen | iOS asked for an unlock before the app opened, and the detail page then read the snapshot and showed the disclaimer (Beni's observation). The app's own waiting-for-unlock state was never reached |
| Pending limit | Requesting 70 kept 64. Which 64 was not recorded: the harness prints the count only, and Beni ruled "No, record the gap" on reworking it. ADR-0009's design does not depend on it, because the app selects the soonest requests itself within the limit |
| Repeating trigger | Pending when added. After a second Request 70, the queue held 64 one-shot requests and not the repeating one. So a repeating trigger can be pushed out by later requests. Whether it takes a slot is read only from totals |
| Reinstall over the old build | In a clean recheck, the pending repeating notification fired after a rebuild and reinstall (Beni's observation), and the snapshot read back with the disclaimer, still excluded from backup and under complete protection. Both survive |
| Profile expiry | Not run. With a paid team the profile outlasts the spike. By Beni's ruling the change is recorded here and in Pass 0, without amending the spec |
| Personal Team | Not tested as such. Its first signed build failed with "Your development team has reached the maximum number of registered iPhone devices". Xcode's account screen showed "6 Provisioned Devices" for it (Beni's screenshot), while Apple's [compare-memberships page](https://developer.apple.com/support/compare-memberships/) says a free team registers up to 3 devices and that registrations expire after 7 days. After enrolling, the same team ID became an Individual team |
| Keychain | `added-read-deleted` |
| App Review | As clause 3 above. Guideline 4.7 is unchanged and still covers code "not embedded in the binary", which the bundled core is not |
| Path-neutral | Guidelines 3.2.1(viii) and 5.1.1(ix) are unchanged (Cursor's re-read). They bear on an App Store listing on either path, not on this decision |

## Q6 Repo and CI

From the PR body at `27c802c`, re-read by Pass 1 and Pass 2. The Xcode project lives at `spike/ios-core/App/KeelSpike.xcodeproj`, outside the pnpm workspace. The tripwire scans the spike's text files, and none holds a NUL byte. Copy lint does not read Swift. The import-boundary check reads Swift text, so a spelled import of the Monte Carlo package fails it while the word alone passes. The zero-network test does not cover the phone; the spike has no `URLSession` or `NWConnection` token. CI already has a macOS runner, and this branch adds no job and no sensitive path. ADR-0009 requires these gaps closed before an app merges.

## Review

| Pass | Seat | Record | Outcome |
| --- | --- | --- | --- |
| 0 | PM | `pr-21-pass-0.md` | Sealed 31 builder claims; probe F found the device-comparison gap |
| 1 | Claude Code, Opus 5.5 High | [issuecomment-6667728233](https://github.com/BeniCheni/keel/pull/21#issuecomment-6667728233) | 2 Highs fixed, 3 Mediums (1 fixed), 3 Lows; all 31 claims reproduced |
| 1.5 | PM | `pr-21-pass-1.5.md` | All 8 findings accepted; Beni's "No, record the gap" |
| 2 | Codex, GPT-6.1 Sol High in a sub-agent | [issuecomment-6669693454](https://github.com/BeniCheni/keel/pull/21#issuecomment-6669693454) | All 8 accepted with its own commands; `DEVICE.md` fixed in `0c06924`; private-list check 0 hits in every scope |
| 2.5 | Fresh Claude session, Opus 5.5 | [issuecomment-6670022832](https://github.com/BeniCheni/keel/pull/21#issuecomment-6670022832), `pr-21-pass-2.5.md` | Every High closed, nothing contested; shadow gate "would escalate" only because `esbuild` is a new dependency; Beni confirmed his three rulings |

Every commit had a cold read from a vendor that did not write it: Cursor's three by Claude Code, Claude's two and the PM's helper by Codex, and Codex's one by the Pass 2.5 session.

## Left open

Each is a row in `docs/v0.1.0-ideas.md`:

- Idea 41: which pending requests iOS keeps past 64, and whether a repeating trigger takes a slot.
- Idea 42: profile expiry and what a free Personal Team allows, which this run did not observe.
- Idea 43: core reports a stack overflow as `yaml-syntax`, "not valid YAML", on deep but valid nesting.
- Idea 44: whether any input reaches `fast-uri`'s `new URL` path, which JavaScriptCore cannot run.
- Idea 45: `check-bundle.mjs` does not flag `Buffer`, `__dirname` or `module`.
- Idea 46: time `loadTerms` alone on the phone.
- Idea 47: the device harness. The comparison ignores locales it does not gate on, the helper's count checks alone would accept duplicated rows, `DEVICE.md` lists neither the extra `haw_US` launch nor the second Request 70 (Pass 2.5's two Lows), and nobody checked on the phone whether `devicectl --console` attaches a debugger.

## Beni's ruling

On 2026-11-06 (America/New_York), Beni ruled "Rule Path A", on the PM's question "Rule Path A for the iOS companion's core, as the rule selects?", after reading a draft of these results. The iOS companion runs the TypeScript `@keel/core` inside JavaScriptCore, as the `compile` bundle of the core as merged, with no Swift port. ADR-0009 moves from Proposed to Accepted with this file, and its Core section now records Path A.
