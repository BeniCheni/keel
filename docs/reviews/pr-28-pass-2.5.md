# Executive brief: PR #28, Pass 2.5, 2026-11-08

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim.

Seat: Claude, Opus 5.5 High (`claude-opus-5-5`, effort `high`, from this session's own metadata), no fallback. Fresh session that wrote no commit on this PR. Fresh clone `~/code/keel-pr-28-p25`, `KEEL_DATA_DIR` an empty temp directory in every shell, and still empty after the runs. Head `0b4bcc5620385be486b316e6a44b3aa32aafad60` from `gh pr view 28 --json headRefOid`, equal to the clone's HEAD, with `git status --porcelain --untracked-files=all` empty before and after. Base `5205fc8`, unmoved.

## Decision

Shadow mode: gate says "would escalate" because Pass 1 finding 1 (High) stays open under Severity, a docs PR cannot land a test that fails without the fix, and ruling 1 does not close it; Beni merges.

- Formal verdict under `AGENTS.md`: **not mergeable**.
- Codex's plan verdict at the final read: **mergeable** ([issuecomment-6730905385](https://github.com/BeniCheni/keel/pull/28#issuecomment-6730905385)).

## What ships

No code ships. This PR adds the build authority for S02, and after the build keel will:

- Show observation dates exactly as the terms list them, with a conflict kept side by side and no date picked.
- Generate dates from the stated rule when the terms list none, and tag each one ESTIMATE with its calendar named.
- Say why and generate nothing when an input is unknown, in conflict or invalid, or when a date falls outside calendar coverage.
- Flag weekends and exchange holidays on stated dates, from a rule-generated NYSE calendar for 2026 to 2060. It declines to treat that calendar as evidence for another exchange or an unscheduled closure.
- Decline to say which date is the final valuation date. S03 has to establish that.

## What the passes found

- Pass 1 (Codex, plan challenge at `43b76db`, verdict not mergeable):
  - 1, High: AC10 accepted production Node I/O and a test-only tree.
  - 2, Medium: calendar coverage underspecified for the anchor and for a roll past maturity.
  - 3, Medium: an injected calendar could produce two entries on one date.
  - 4, Medium: S03 handoff had no boundary between call dates and final valuation.
  - 5, Medium: AC2, AC4, AC6 and AC7 left holes in the schedule shape.
  - 6, Medium: public input contract underspecified.
  - 7, Medium: Decision 2 could misstate the eligible day for a non-NYSE basket.
  - 8, Medium: the NYSE Saturday rule's exception was overstated.
  - 9, Medium: the diff's contract contradicted its example.
  - 10, Low: the honesty test called for the same summary object.
  - 11, Low: two scope and wording ambiguities.
  - 12, Low: the skill's demo step has no entry point (idea 50).
- Pass 2 (Codex, `f2ad7ca`): accepted 2 to 12, accepted 1 and disputed its closure. Own findings: AC10 could still pass impure code (High, continues 1); case 13's date order (Medium); S03 overstated what S02 knows (Medium). Pass M: N/A, no engine or golden delta.
- Re-read (Codex, `7f373cd`): AC10 passed `crypto.getRandomValues` and `toLocaleUpperCase`, and a removed stub stayed green (High, continues 1); S03 handoff against case 13 (Medium).
- Second re-read (Codex, `739405e`): `RegExp.$1`, `Error.stack` and `import.meta.url` passed AC10 (High, continues 1). S03 finding accepted as addressed.
- Final read (Codex, `0b4bcc5`): no new finding; one item for S02's build review; Pass 1 finding 1 stays open.
- Pass 2.5 corroboration:
  - Finding 1: open. No test exists at this head (`git diff --exit-code origin/main...HEAD -- packages` exits 0).
  - Findings 2, 3, 13 to 18: the PR-body script gives case 10 `anchor-after-maturity`, 11 `outside-calendar` 2061-01-30, 12 `outside-calendar` 2029-01-01, 13 entry 0 only, 14 `calendar-collision` 2027-03-02, 17 two entries, 18 entry 0 only, as the spec states. Cases 8, 9, 15 and 16 turn on input status or validity and the script does not model them. I confirmed only that `example-autocall.yaml` has `dates.maturity` in conflict, and those four remain Codex's claim.
  - Finding 4 and the later S03 findings: see the S03 reading below.
  - Findings 5, 6, 7, 9, 10 and 11: read in the final spec text and present as the Pass 1.5 brief records.
  - Finding 8: NYSE's live table shows no 2028 New Year's closure and I confirmed that. The SR-NYSE-2021-56 footnote was not re-fetched; it is Codex's claim.
  - Finding 12: idea 50 is in the diff.
- Contested: none open. Codex disputed the closure language at Pass 2, the PM corrected it, and both now record the High as open.

### AC10, final text (`docs/specs/s02-schedule.md:268`)

**States what the last two Codex comments say it does: yes.** The second re-read asked for controls on `RegExp.$1`, `Error.stack` and `import.meta.url`, keeping calendar arithmetic, local captures and ordinary `Error` construction. The final read says AC10 rejects those forms and carries a repeat comparison.

- `RegExp` is out of the frozen list of 19 pure names, the text `stack` is banned, and `import` followed by `.` is banned, each with listed controls. `new Error("x")` and `/^(\d{4})$/.exec(s)` stay accepted.
- The runtime part calls each function twice with a `/g` `lastIndex` stand-in, and the mutation floor adds removal of that comparison.
- A scratch checker I built from AC10's own text rejected 38 of 38 negative controls and accepted 8 of 8 positives on both Node versions, each of the three forms tripping the expected rule. That is my reading of the text in plain Node, and it does not exercise the runtime part or a landed build.
- The AC10 hunk is the only spec change in `739405e..HEAD` besides the mutation floor (`git diff -U0 739405e..HEAD -- docs/specs/s02-schedule.md`, hunks at lines 268 and 273).

**One sentence in the final read goes beyond AC10's text.** It says restoring `BigInt`, `Symbol`, `WeakMap` or `WeakSet` to the pure-name list "failed its own control". AC10 lists a control for `RegExp` only, and zero for those four. Their ban holds, because they are absent from the frozen list, but that sentence describes Codex's scratch stand-in and not AC10's required controls. By ruling 3 this starts no spec round (see Risks).

### "What S03 takes from this", final text (`docs/specs/s02-schedule.md:247`)

**States what the last two Codex comments say it does: yes.** The second re-read accepted it as addressed; the final read says it was left intact.

- The diff `739405e..HEAD` does not touch line 247.
- It says an estimated schedule ends at the last generated slot on or before maturity, or the stated anchor alone as in case 13, and a listed schedule ends at the final item in file order with a date or `null`.
- It says neither establishes the final valuation date, and leaves that, the call and barrier order, exact dated closes and the accrual basis to S03.
- Case 13 gives entry 0 only and the 54 or 55 count reproduces (monthly from 2026-02-25, maturity 2030-08-25 or 2030-08-26). The schema's `minItems: 1` holds (`rg -A4 '"observation_schedule":' schemas/mln-terms/0.1.json`).

### Authorship and cold reads

`git log --format='%h %an' origin/main..HEAD` gives 5 commits, each Claude; `git rev-list --parents` shows a linear chain from `5205fc8`.

| Commit | Cold read by Codex | Range the comment states |
| --- | --- | --- |
| `43b76db` | Pass 1, [6725070541](https://github.com/BeniCheni/keel/pull/28#issuecomment-6725070541) | head `43b76db` |
| `f2ad7ca` | Pass 2, [6725366071](https://github.com/BeniCheni/keel/pull/28#issuecomment-6725366071) | `43b76db..f2ad7ca` |
| `7f373cd` | Re-read, [6729889774](https://github.com/BeniCheni/keel/pull/28#issuecomment-6729889774) | `f2ad7ca..7f373cd` |
| `739405e` | Second re-read, [6730578499](https://github.com/BeniCheni/keel/pull/28#issuecomment-6730578499) | `7f373cd..739405e` |
| `0b4bcc5` | Final read, [6730905385](https://github.com/BeniCheni/keel/pull/28#issuecomment-6730905385) | `739405e..0b4bcc5` |

There is no Codex-authored commit, so no Codex cold read falls to this seat. All five comments were posted from the `BeniCheni` login, so the vendor identity is what each comment states.

## Verification as re-run

Node 24.22.2 and 26.13.0, confirmed with `node --version`, each exit code read on its own.

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | Exit 0 on both |
| Verify | `pnpm verify` (Node floor and current) | Exit 0 on both. 33 core tests in 9 files, 122 tooling tests in 10 files, zero failures. Eight steps `ok`: typecheck, tests, tooling, tripwire, network, determinism, copy, boundaries |
| Tripwire | `node tools/tripwire/cli.mjs .` | Exit 0 on both, zero output lines |
| Determinism | The `verify:determinism` step of `pnpm verify` | `ok` on both. On golden outputs N/A: `git ls-files -- 'fixtures/golden/**'` lists 0 files and the diff touches no fixture |
| Zero network | The `verify:network` step of `pnpm verify` | `ok` on both |
| Mutations | n/a | N/A: the diff has no code to mutate (`git diff --exit-code origin/main...HEAD -- packages` exits 0). The floor applies to the build |
| Pass M | `python3 tools/reference/payoff.py fixtures/golden/` | N/A: no engine or golden fixture exists (`git ls-files -- 'tools/reference/**' 'packages/plugin-mln/**' 'fixtures/golden/**'` lists 0 files) |
| UI matrix | n/a | N/A: no UI path in the diff (`git diff --name-only origin/main...HEAD`, 0 under `apps/` or `packages/ui/`) |
| Demo startup | `git ls-files -- '*demo*'`; `rg -c -i demo README.md` | N/A: 0 files and no README mention, so no entry point exists at this head |
| GitHub checks | `gh api repos/BeniCheni/keel/commits/<head>/check-runs` | 5 of 5 completed, success, at the head: `verify` and the four cells (macOS and Ubuntu, Node 24 and 26). [Run 42551088771](https://github.com/BeniCheni/keel/actions/runs/42551088771) |
| Diff size | `git diff --shortstat origin/main...HEAD` | 5 files, 434 insertions, 0 deletions |
| Diff files | `git diff --name-only origin/main...HEAD` | `docs/README.md`, `docs/reviews/pr-28-pass-0.md`, `docs/reviews/pr-28-pass-1.5.md`, `docs/specs/s02-schedule.md`, `docs/v0.1.0-ideas.md` |
| Scope | `git diff --exit-code --stat origin/main...HEAD -- '*.honesty.test.ts' package.json pnpm-lock.yaml pnpm-workspace.yaml packages apps schemas fixtures tools .github .claude .agents AGENTS.md CLAUDE.md docs/providers` | Exit 0: no sensitive path, dependency, honesty test, product code or fixture |
| Removed index or idea rows | `git diff origin/main...HEAD -- docs/v0.1.0-ideas.md docs/README.md \| awk '/^-[^-]/{n++} END{print n+0}'` | 0 |
| Whitespace | `git diff --check origin/main...HEAD` | Exit 0 |
| Commits | `git log --format='%h %an' origin/main..HEAD` | 5, each Claude |
| Calendar | `gh pr view 28 --json body --jq .body \| awk '/^\x60\x60\x60python$/{p=1;next} /^\x60\x60\x60$/{if(p)exit} p' > s02_tables.py`, then `python3 -I s02_tables.py` | Exit 0. 345 closures, SHA-256 `e438df993de99cc780739a56901ea276353bc094675a0800cf1ac500a28d5fd5`, equal to the spec |
| Schedule cases | The same script | Cases 1 to 7: 19, 6, 6, 5, 4, 4 and 1 entries |
| Spec tables against script | `python3 -I pass-2.5-checks/compare.py <dir> <clone>` | 8 of 8 year rows and 7 of 7 case rows match the script, date for date |
| NYSE's live table | `curl` of <https://www.nyse.com/trade/hours-calendars>, then `python3 -I pass-2.5-checks/nyse.py <dir>` | HTTP 200. 2026, 2027 and 2028 have 10, 10 and 9 closures, each equal to the rules |
| AC10 scratch checker | `node pass-2.5-checks/ac10.mjs <clone>` | Exit 0 on both. 38 of 38 negatives rejected, 8 of 8 positives accepted, 19 frozen names |
| Review counts | `grep -cE` on each comment body, patterns as in the final read | 12 Pass 1, 3 Pass 2 (2 Medium), 2 re-read (1 Medium), 1 second re-read |

The three check scripts are printed in the body of this brief's records PR. `<dir>` holds `py/s02_tables.py` and `nyse/page.html`.

Not re-run, and why:

- The owner's private-list scan. This seat does not run it. Its zero counts on each surface are **Codex's claim** (final read, 6730905385), and they do not cover this brief or this seat's PR comment.
- SR-NYSE-2021-56 footnote 6 and cases 8, 9, 15 and 16. Codex's claims, as noted above; the PR body itself says the script does not model those cases.

## Estimates and model output

None in this PR. The spec describes an ESTIMATE label for generated dates that the S02 build will produce; this PR produces none.

## Risks and accepted costs

- **The open High and the S02 obligation.** The purity check for the schedule code exists only as a written plan. `AGENTS.md` closes a tracked High only with a fix commit carrying a test that fails without it, and a docs PR cannot land one, so Pass 1 finding 1 stays open. Beni's ruling lets this PR merge with it open, for this PR only, and the S02 build must land the AC10 test. If it does not, the finding remains open against the build.
- **One item on the final read's "For S02's build review" list.** A comment between `import` and the dot, as in `import /* module source */ .meta.url`, reads the module location and passes AC10's whitespace match. My scratch checker confirms no rule catches it on either Node version. Codex sized a control covering comments as XS, and the earlier rule had the same gap.
- **What AC10 is for.** It guards against accident on the Node versions the suite runs, and not against deliberate evasion, which stays with review. The spec says so. It also runs on Node only, while ADR-0009's Path A runs this core in JavaScriptCore.
- **Added by this seat, for the same build list.** AC10 lists no negative control for `BigInt`, `Symbol`, `WeakMap` or `WeakSet`. A restored name would survive unless the build adds controls for them, which the mutation floor's "removing any purity rule" implies. Low, and by ruling 3 no spec round.
- **One calendar for every underlying.** Generated dates assume NYSE closures. The spec names the calendar on each entry and calls it a planning fallback.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes. S02 is recorded as the PM's proposal in Pass 0, so question 4 confirms it |
| Verdict mergeable, every High closed (fix commit with a failing-first test, or for a High outside tracked files, a recorded remediation check plus Beni's confirmation) | **No.** Pass 1 finding 1 is open |
| Nothing contested | Yes |
| `verify` green at tip; every number re-run | Yes, apart from the claims labelled above as Codex's |
| No sensitive path, dependency or schema change | Yes |
| Every commit cold-read by a non-author vendor (authorship record) | Yes, Codex on all five |
| Gate verdict | would escalate |
| Beni's decision (filled after) | Merged at `0b4bcc5` with the High open, on 2026-11-09 |

## Questions for Beni

Each answerable in one word. The first three were recorded second-hand from the PM's session.

1. Confirmed: "Yes, with obligations (Recommended)", this PR only, S02 lands the AC10 test?
2. Confirmed: "Split, schedule first"?
3. Confirmed: "Yes, last round", making `0b4bcc5` the last AC10 round on the spec?
4. Confirmed: S02 as this slice's number?
5. Merge at `0b4bcc5` with the High open?
6. Add the four-name control gap to S02's build-review list?

## Handoff block

The PM runs the post-merge checks. This command needs no local checkout.

```bash
gh pr merge 28 --repo BeniCheni/keel --squash --match-head-commit 0b4bcc5620385be486b316e6a44b3aa32aafad60 --subject 'docs(specs): S02 observation schedule and exchange calendar (#28)' --body 'Adds the S02 spec for the observation schedule and exchange calendar, the first half of the engine work. S03 takes the payoff engine. No code changes.

Pass 1 finding 1 (High) stays open under the AGENTS.md Severity clause, because a docs PR cannot land a test that fails without the fix. Owner ruling of 2026-11-08, for this PR only: merged with it open, and the S02 build must land the AC10 test. Shadow gate: would escalate.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>'
```

## Records note

The PM added this section for the records PR. The Pass 2.5 seat wrote everything above, apart from the two changes named here.

- **Source.** The seat saved this brief and its three check scripts to a folder outside every clone, and that folder was later deleted. This text is the seat's own Write call, read as data from its session transcript. The PM changed the sentence saying where the scripts sit and filled in Beni's decision in the gate log. The records PR's body prints the scripts, with the same edits the seat made to them.
- **Beni's answers.** On 2026-11-09 Beni answered "Merged, yes to all", so questions 1 to 6 are each yes. The three rulings and S02's number are confirmed, the merge went ahead with the High open, and the four-name control gap joins S02's build-review list.
- **Merge.** Squash `105a58df74fa545951316c022a040b4b0ce25f63`, parent `5205fc8`, at 09:10 on 2026-11-09 America/New_York, reviewed head `0b4bcc5`. The squash tree equals the reviewed head's tree, `7ac931b95f433cc75003d299219528ce7a0105be`. The branch is deleted, and `git fetch origin pull/28/head` retrieves its commits.
- **Post-merge checks.** In a fresh clone, on the squash commit, `pnpm install --frozen-lockfile` and `pnpm verify` exited 0 on Node 24.22.2 and 26.13.0, with 33 core and 122 tooling tests passing. The tripwire exited 0 with no output. Push CI run 42632128892 succeeded on the squash.
- **Still open.** Pass 1 finding 1 stays open under Severity until the S02 build lands the AC10 test. That build also adds controls for a comment before the dot in `import /* comment */ .meta` and for the names `BigInt`, `Symbol`, `WeakMap` and `WeakSet`.
