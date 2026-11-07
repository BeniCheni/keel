# Pass 1.5 brief: PR #21 (S90 iOS core spike)

Written by the PM on 2026-11-05 (America/New_York), after reading Pass 1's comment ([issuecomment-6667728233](https://github.com/BeniCheni/keel/pull/21#issuecomment-6667728233)) and Beni's ruling below. Pass 1 reviewed `27c802c` and left the head at `d0c9fc334f21aee6b5cc558c4f80f444ae948b35`, with CI run 42097354413 `success` (`gh run list --repo BeniCheni/keel --commit d0c9fc334f21aee6b5cc558c4f80f444ae948b35 --json conclusion`). This brief lives on branch `docs/pr-21-records`, beside the Pass 0 brief and the two device record files. Codex receives it for Pass 2.

## Seat for Pass 2

Codex, GPT-6.1 Sol High, as the spec's Seats section names for a spike PR with no sensitive path. The seat has no fallback: if that model is unavailable, stop and escalate. If the chat reaches the model only through a sub-agent, that sub-agent gets the whole prompt word for word and does all the reading and running, and the comment says so.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | High | Accept | Five floor rows, AC4's included, decided "killed" with their own comparison, not with the gate they named, so they could not fail when that gate was gone. Pass 0 did not catch it. Fixed in `14b0308`, with row `gate-off`, which fails without the fix. Closed pending Codex's cold read of `14b0308` | No |
| 2 | High | Accept | Pass 0's probe F found the same gap. A log missing most of one group, or holding an error line, passed the device comparison. Fixed in `d0c9fc3`, with row `device-thin`. Beni's records hold all 32 inputs in all 8 groups, so the device result does not rest on the bug. Closed pending Codex's cold read of `d0c9fc3` | No |
| 3 | Medium | Accept | The locale check did not read the two standalone reversed runs. Fixed in `14b0308`, with row `one-run-locale` | No |
| 4 | Medium | Accept. Not fixed, by Beni's ruling | The app prints how many of the 70 requests iOS keeps, not which, and never the queue total. The results record it as a gap that this spike leaves open, so AC7 is met except for this and the expiry check. What the lines do show: 64 of 70 kept, and after a second Request 70 the repeating trigger was not in the queue. The question goes to the ideas note, for the slice that first schedules alerts on the phone | No |
| 5 | Medium | Accept | `DEVICE.md` lines 3, 12, 25, 84 and 92 do not match what ran (Pass 0, "What ran on the device"), and line 84 does not warn that `standin/manifest.json` sits beside `malformed.yaml`. Codex fixes it at Pass 2 (below) | No |
| 6 | Low | Accept | `loadTermsMs` also times `verificationSummary`, `JSON.stringify` and the bridge back to Swift. That errs toward a slower number. The results name what it times | No |
| 7 | Low | Accept | The build log also names `arm64-apple-ios17.0`, for the `KeelSpikeKit` package. The PR body is Cursor's, so it stays; the results cite the app target's `27.0` | No |
| 8 | Low | Accept | `compare-device.mjs` exits 1 on a setup failure, the code a failed comparison uses. The floor rows read the reason, so no setup failure counts as a kill | No |

Pass 1's account of the edge inputs is accepted for the results, which put it to Beni as the spec asks: Node runs out of stack on `flow-2000` and `block-1000` and reports it as `yaml-syntax`; with `--stack-size=4000` Node gives JavaScriptCore's answer. On a deep but valid document, Node would say `ok=false` where JavaScriptCore says `ok=true`. None of the eight inputs is such a document, and none gates.

Pass 1's "Deliberately not done" list goes to `docs/v0.1.0-ideas.md` in the PM's next ordinary docs PR, with finding 4's question added.

## Authorship record

From `git log --format='%h %an' 82e49091477d53a16d7179f5a418dc3e41ff4395..origin/s90/ios-core-spike`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `ff4fc35` Add the iOS core spike harness | Cursor | Claude Code, Pass 1 (done) |
| `27a877b` Gate the spike parity check on Swedish and a reversed comparator | Cursor | Claude Code, Pass 1 (done) |
| `27c802c` Tell a fresh clone to install and bundle before xcodebuild | Cursor | Claude Code, Pass 1 (done) |
| `14b0308` Decide each parity injection through the gate it targets | Claude | Codex, Pass 2 |
| `d0c9fc3` Require every input in every device group, and fail on error lines | Claude | Codex, Pass 2 |
| The PM's device helper, which is not in the repo | Claude | Codex, Pass 2 |
| Any fix commit Codex pushes | Codex | The fresh Claude session, Pass 2.5 |

## Rulings from Beni

The four in the Pass 0 brief stand. One more, on 2026-11-05, on "Rework the Q5 notification harness and rerun those taps on your phone?":

> No, record the gap

## What Pass 2 does

Beyond the skill's standing checks and its Pass 2 extras:

1. **Cold read of `14b0308` and `d0c9fc3`.** Does each injection now change only what its gate reads, and does only the gate decide? Can `gate-off` pass vacuously, for example if the line it inserts before lands somewhere else? Does the stricter comparison reject a log with a whole group missing, an extra locale, the same input with two hashes, an input outside the fixture list, or an error line, and does it still pass Beni's records?
2. **Adjudicate findings 1 to 8**, and Pass 1's stack account of the edge inputs, each with your own command.
3. **Pass 0's items 2 and 3**, Q1's check and the reversed comparator, which Pass 0 named for you because Cursor alone gave PR #19's cold read and your Q2 read came after spike code existed.
4. **The PM's device helper.** Read `~/.keel-spike/device.sh` on Beni's Mac, and nothing else under `~/.keel-spike/`: `env` holds account identifiers, and `logs/` holds raw output that names the account. Does it do what Pass 0's "What ran on the device" says? Could it have kept a line from an earlier launch, cut or altered a line, or passed a launch that printed too little? It is outside the repo, so report and do not fix.
5. **AC10's private-list half.** Counts only, over the PR's diff at the head, every commit message on the branch, the PR title and body, every PR comment, the files on `docs/pr-21-records`, and your own proposed comment. Read `~/.config/keel/private-terms.txt` for this and nothing else. Check first that it is readable, exit nonzero if the scan fails, and never print a term or a matched value.
6. **Fix `DEVICE.md`** (finding 5), in one commit as Codex, touching no app source. Make it true for a free or a paid team: the registration flag on the build line where a paid team needs it, the expiry check only on a free team, the files to import by name with a warning about `manifest.json`, and a note that only deleting the app stops the 60-second repeating trigger. Keep its statement that the measured build is `27c802c`'s. The fresh Claude session gives this commit its cold read at Pass 2.5.
7. **Your own read** of the whole PR: what did Pass 1 miss?

Pass M does not apply: there is no engine and no golden fixture. The device numbers are Beni's run; mark them so. Write no results file, leave ADR-0009 alone, and give no verdict on Path A or Path B. Post one PR comment, then stop.

## Sealed appendix for Pass 2

Do your own read before opening this. Pass 1's findings and fixes are suspicions to re-derive, not conclusions. Reproduce or disprove each one independently.

### Pass 1's claims about its fixes

| # | Claim | Command Pass 1 gave |
| --- | --- | --- |
| 1 | At `27c802c`, with `\|\| BYTES=differ` turned into `\|\| true` in a copy, `--inject-diff`, `--inject-column` and `--inject-reorder` still exit 1, and the same holds for the locale and reversed gates | A `sed` edit of a copy of `run-parity.sh`, then each `--inject-*` mode |
| 2 | At `d0c9fc3`, `gate-off` exits 1 with `gate-needed=true` on all 7 injections; with the `27c802c` script it shows `gate-needed=false` on the first four and exits 2 | `node spike/ios-core/floor.mjs gate-off` |
| 3 | At `27c802c`, a log with the (`standalone`, `reversed`, `sv-SE`) group cut to the tie input and one error line added prints `records=225`, `mismatches=0`, `bytes=match`, exit 0 | `node spike/ios-core/compare-device.mjs "$PWD" gap.log` |
| 4 | At `d0c9fc3`, `device-thin` exits 1 with `thin=true error=true`, and 3 against the `27c802c` comparison | `node spike/ios-core/floor.mjs device-thin` |
| 5 | At `d0c9fc3`, `one-run-locale` exits 1 with `reason=locale-run` | `node spike/ios-core/floor.mjs one-run-locale` |
| 6 | All 15 floor rows exit 1 at `d0c9fc3`, and the tree is clean afterwards | `node spike/ios-core/floor.mjs <row>` |
| 7 | No app source changed: `git diff --exit-code 27c802c d0c9fc3 -- spike/ios-core/App spike/ios-core/Sources spike/ios-core/Tests` exits 0 | That command |
| 8 | Beni's records compare clean at `27c802c` and `d0c9fc3`: `records=1408`, `mismatches=0`, `bytes=match`, exit 0 | `sh spike/ios-core/run-parity.sh --compare-device pr-21-device-records.txt` |
| 9 | With `node --stack-size=4000` or `20000`, Node gives `flow-2000` `wrong-type:6:3` and `block-1000` `unknown-key:98:1`, JavaScriptCore's answers; the default stack gave columns `6:753`, `6:793` and `6:794` over three runs | A scratch script |
| 10 | `check-bundle.mjs` flags a computed property on an alias, a two-step alias chain, a destructured `process`, `self.process`, `window`, `global.process`, a dynamic `import("node:fs")`, `require(variable)`, `require.resolve`, a bare `fs` import and `"monte" + "carlo"`; it misses `Function("return this")().process`, `(0, eval)("process")` and a sloppy function's `this` | Plants through `inspectVariant` |
| 11 | All 31 builder claims in the Pass 0 sealed appendix reproduce | Their commands, at `27c802c` |

### PM checks at `d0c9fc3`, 2026-11-05

From a new clone on Node 24.22.2 and macOS 27.2, with `origin/main` at `32cfe40`:

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile`; `pnpm --dir spike/ios-core --ignore-workspace install --frozen-lockfile`; `node spike/ios-core/build.mjs` | Each exit 0 |
| `sh spike/ios-core/run-parity.sh` | Exit 0, `reason=pass`, `bytes=match`, `reversed=match`, `locale-check status=pass node=en-US,haw-US,sv-SE jscontext=en-US,sv-SE`, `fixture-count compile=31 standalone=31 node=31 status=pass` |
| `sh spike/ios-core/run-parity.sh --compare-device` on `pr-21-device-records.txt` from this branch | Exit 0, `records=1408`, `mismatches=0`, `bytes=match` |
| `node spike/ios-core/floor.mjs` for `gate-off`, `device-thin`, `one-run-locale`, `alter-byte`, `localecompare-dedupe` | Each exit 1. `gate-off` printed `gate-needed=true` for each injection, and `device-thin` printed `thin=true error=true` |
| `git status --porcelain --untracked-files=all` afterwards | Empty |
| `git diff --name-only 27c802c d0c9fc3 -- spike/ios-core/App spike/ios-core/Sources spike/ios-core/Tests` | Nothing |

Two readings, not runs:

- The spec's Q1 says "No static check sees code built at run time or the global object reached through a function's `this`" (`git show origin/main:docs/specs/s90-ios-core-spike.md | grep -n 'No static check sees'`), which matches Pass 1's account of the forms `check-bundle.mjs` misses.
- `xcrun devicectl device process launch --help` describes `--console` as attaching the application to the console and bridging its stdout, and describes debugging as a separate LLDB attach or `--start-stopped`. So `--console` alone should not attach a debugger. Nobody has checked this on the phone.
