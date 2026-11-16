# Pass 0 brief: PR #50 (S91 iOS foundation spec, and ADR-0009's sequencing amendment)

Written by the PM on 2026-11-16 (America/New_York), from a fresh read of the PR at `97d8457`. The same Claude session wrote the PR and this brief, so Pass 1 and Pass 2 are its cold reads. This brief lives on the records branch `docs/pr-50-records`, not on the PR branch, so the PR's diff and claims stay as posted.

## Seat for Pass 1

Codex, GPT-6.1 Sol High. `AGENTS.md` gives Codex Pass 1 on a Claude-authored PR, and on a spec that pass is the plan challenge. PR #50 touches no sensitive path, so the pin is High. The seat has no fallback: if it is unavailable, stop and escalate.

Later seats:
- Pass 1.5 is the PM.
- Pass 2 is Codex, on the Claude-authored commits after Pass 1.
- Pass 2.5 is a fresh Claude session on Opus 5.5 High, including the cold read of any Codex commit. This PR touches no sensitive path, so the Fable pin does not apply.

## Scope

- Spec: `docs/specs/s91-ios-foundation.md`, new; ADR: `docs/adr/0009-ios-companion-and-core.md`, one status line. Design brief: none.
- Sensitive paths touched: none (`git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers` prints nothing). The build the spec describes will touch `.github/workflows/**` and `AGENTS.md`.
- Release: no. New dependencies: none in this PR. The spec approves `esbuild` `0.28.2` for the build, by Beni's ruling 4.
- Bootstrap path: no. `verify` applies. Mutations and Pass M are N/A: no code, test or fixture changes. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD` on PR #50's branch.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `97d8457` | Claude | Codex, Pass 1 |

## Fast-track

Not allowed. `AGENTS.md` gives every spec the plan challenge, and S91's spec is the build authority for a sensitive-path slice: its build adds a CI job and changes `AGENTS.md`.

## Beni's rulings

All were given on 2026-11-16 in the PM's session. Codex cannot see that session. The spec's "Beni's rulings" section quotes the first four with their questions; the last three are recorded here for the first time.

- **"Yes, in parallel, as long as the slice stays narrow"**, to "Start an iOS foundation slice now, alongside Milestone 1?".
- **"S91 (Recommended)"**, to which number the narrow iOS slice takes.
- **"One screen (Recommended)"**, to how narrow the first iOS slice is. The question said that both options include the guards ADR-0009 requires before any app merges.
- **"Approve (Recommended)"**, to `esbuild` on `main` as a build-time development dependency for the iOS bundle.
- **Seat records** ("Post records (Recommended)", "Record as pass 1 (Recommended)", "In the rules PR (Recommended)"): every pass's PR comment ends with one fenced `json` seat record, valid against `schema/seat-record-1.1.json` in `BeniCheni/elenchus`; the PM posts its own Pass 0 and Pass 1.5 records; fast-track re-reads record as pass `"1"`; and the rule is written into the review skill in a later rules PR, not in this one.

## What to check, beyond the skill's standing checks

This is the plan challenge: find what is wrong with the plan before it binds the build.

1. **Narrowness.** Does the spec stay inside ruling 3 and the question's wording, one screen plus ADR-0009's guards? Name any requirement that is not needed for the one screen or for a guard ADR-0009's Consequences list.
2. **ADR-0009.** Does any line of the spec contradict ADR-0009 as it stands at this head, in role, data path, storage, notifications, keychain or "Not offered"? In particular, ADR-0009's data path is the desktop's export through the Files app; S91 imports a bare terms file. Is the spec's Non-goals line enough to keep that consistent?
3. **The committed bundle.** Can `apps/ios/Keel/Resources/core.js` be committed and still pass every check `pnpm verify` runs today: the tripwire (which reads every tracked text file), the import-boundary check (which S90's Q6 found reads text across the repo and fails on a spelled-out `require` call), copy lint and the determinism check? Is registering it with the determinism check feasible as `tools/fixtures/` works today?
4. **Parity.** Acceptance criterion 4 compares JavaScriptCore with Node byte for byte for `loadTerms`, `verificationSummary` and `observationSchedule`. S90 found locale resolution differs between the engines. Is the criterion testable as written, and does `observationSchedule` depend on anything S90's parity did not cover?
5. **CI.** An unfiltered macOS Swift job on every pull request and push: is it feasible within `verify.yml` as it stands, with the aggregate `verify` job and `tools/ci/needs-check.mjs`? What does it cost in runner time and in exposure to macOS runner queues?
6. **Hard rule 12 and story 1.1.** Does a disclaimer footer on the one screen meet "the first-run screen, About" for a one-screen app? Does the first-run text meet story 1.1 as S90's journey states it?
7. **The sensitive-path list.** Is the proposed list complete for the app as specified (the JavaScriptCore host, the bundle recipe, the committed bundle, entitlements, `Info.plist`, privacy manifests, `.xcconfig` files)? Is anything listed that need not be?
8. **Each acceptance criterion's command.** Will each run as written, from a fresh clone, on the paths the spec names? Criterion 12 is Beni's device step; is it specified tightly enough to repeat?
9. **Stories.** Do stories 1.1, 3.1, 3.3, 3.4 and the import half of 9.1 match S90's journey table, and does the slice serve each as claimed?

Out of scope: building anything, and any change to `AGENTS.md` or the skills. Findings there go in the comment for the PM to carry.

## Sealed appendix: PM claims to verify independently

These are claims, not facts. Re-derive each one; report any that do not reproduce. The PR body's claims table holds the PM's runs. In summary:

| # | Claim (as the PM stated it) | Command the PM gave |
| --- | --- | --- |
| 1 | Two files change, 107 insertions, one commit by Claude | `git diff --name-only origin/main...HEAD`; `git diff --shortstat origin/main...HEAD`; `git log --format='%an' origin/main..HEAD` |
| 2 | No sensitive path | The scope line's `git diff --name-only … -- <sensitive paths>` |
| 3 | The core exports `loadTerms`, `verificationSummary`, `nyseRulesCalendar` (a function) and `observationSchedule` | `sed -n 2,19p packages/core/src/index.ts`; `grep -n 'export function nyseRulesCalendar' packages/core/src/schedule/calendar.ts` |
| 4 | The valid synthetic terms files are `example-autocall.yaml` and `minimal.yaml` | `git ls-files fixtures/synthetic/terms/valid` |
| 5 | S90's limits are 500 ms and 50 ms, as medians over 5 fresh launches | `sed -n 339,340p docs/specs/s90-ios-core-spike.md` |
| 6 | S90 measured the core at `82e4909`, before the schedule and calendar landed | `git log --format='%h %ad %s' --date=short 82e4909..origin/main -- packages/core/src/schedule` |
| 7 | S90 pinned `esbuild` `0.28.2` | `git show origin/s90/ios-core-spike:spike/ios-core/package.json` |
| 8 | Copy lint reads `packages/ui/src/copy`, `README.md` and `DISCLAIMER.md` only | `sed -n 15,22p tools/copy/lint.mjs` |
| 9 | `verify.yml` has two jobs, `cells` and `verify`, and `verify` needs `cells` | `grep -n -E '^  [a-z]+:$' .github/workflows/verify.yml`; `grep -n 'needs:' .github/workflows/verify.yml` |
| 10 | `pnpm verify` exits 0 on Node 24.22.2 and 26.13.0 at `97d8457` | `pnpm install --frozen-lockfile && pnpm verify` |
