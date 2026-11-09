# Pass 1.5 brief: PR #28

Written by the PM on 2026-11-08 (America/New_York), after reading Codex's Pass 1 comment ([issuecomment-6725070541](https://github.com/BeniCheni/keel/pull/28#issuecomment-6725070541)) at `43b76db` and Beni's ruling. Pass 1 is the plan challenge. Its verdict is not mergeable, on finding 1. It pushed nothing, as its prompt required, so the PM applies every fix here.

Codex receives this brief for Pass 2, at GPT-6.1 Sol High. There is no fallback.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason and fix | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | High | Accept | Reproduced: a single-quoted `node:fs` import and `Date.UTC` in a scratch tree give AC10's grep exit 1 and a file count of 1. AC10 is now `schedule.purity.test.ts`: only relative imports, a word list, and negative controls the checker has to reject. It stays open under `AGENTS.md`'s Severity clause, because a docs PR cannot land the fix commit with a test. Beni's ruling below lets this PR merge with it open | no |
| 2 | Medium | Accept | Entry 0 now carries `flags` and needs no coverage. While rolling, a date past maturity is checked before coverage. New cases 13, 17 and 18 | no |
| 3 | Medium | Accept | A new `calendar-collision` reason: an accepted date not after the previous entry makes the schedule unavailable. New case 14 | no |
| 4 | Medium | Accept | New section "What S03 takes from this": the last entry does not establish the final valuation date, and the count can differ from the research's 55 | no |
| 5 | Medium | Accept | AC2 and AC4 assert `index`, and the spec defines it. AC6 adds a listed date and a conflict candidate. AC7 counts the schedules it exercised | no |
| 6 | Medium | Accept | Preconditions stated. A non-real date flags `invalid-date` only, and an invalid input returns `input-invalid`. New cases 15 and 16 and a flags row | no |
| 7 | Medium | Accept | Decision 2 now says the calendar is a planning fallback and no evidence for another exchange or an unscheduled closure | no |
| 8 | Medium | Accept | The rule now states NYSE's practice and its exception as such, cites SR-NYSE-2021-56 footnote 6 and the published 2028 result, and calls the fixed Saturday rule keel's projection | no |
| 9 | Medium | Accept | A conflict candidate contributes no listed date and does not remove an estimated date of the same value | no |
| 10 | Low | Accept | The honesty test now says deep-equal values | no |
| 11 | Low | Accept | Scope says no registered fixture generator. The `rule` text says closed days are moved | no |
| 12 | Low | Accept | Outside S02. Idea 50 in `docs/v0.1.0-ideas.md` | no |

The frozen calendar and cases 1 to 12 do not change. Pass 1 re-derived them independently and they matched.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `43b76db` | Claude | Codex, Pass 1 (done) |
| This brief's commit, with the spec amendments | Claude | Codex, Pass 2 |

Codex has authored nothing on this PR. If it pushes a fix at Pass 2, that commit goes to the fresh Claude session at Pass 2.5.

## Rulings from Beni

1. **"Yes, with obligations (Recommended)"**, on 2026-11-08, on "May that High close here without a test, for this PR only, if I rewrite AC10 as a test with negative controls that the S02 build must land?" An exception for this PR only, as on PR #16 (ruling 12). The obligation is AC10 as now written: the S02 build lands that test. `AGENTS.md` has no exception path, so the High stays open under its Severity clause, the formal verdict stays "not mergeable", the shadow gate will say "would escalate", and idea 39 stays open. Whether to merge with it open is Beni's call at the merge.
2. **"Split, schedule first"**, on 2026-11-08, on how to slice the engine work.
3. **"Yes, last round"**, on 2026-11-08, on "Make this push the last AC10 round on the spec?" Codex still gives this commit its cold read and checks that the change is correct. Any further AC10 form it finds goes on a list for S02's build review and does not start another spec round. The High stays open as ruling 1 states.

All three were given in the PM's session, so Codex cannot see them, and Beni's merge confirms them.

## What Pass 2 does

1. Cold-read the commit after `43b76db`. `git diff 43b76db HEAD` is the whole amendment.
2. Reproduce or disprove each row above, and re-derive new cases 13 to 18 and the changed flags.
3. Test the new AC10 as a plan: can a compliant build still pass while impure? Does each negative control reach the rule that names it?
4. Test the new rolling order for any input where it changes a result for cases 1 to 12.
5. Run the owner's private-list check, counts only.

## Sealed appendix for Pass 2

Pass 1's findings and fixes are suspicions to re-derive, not conclusions. Codex reproduces or disproves each one independently and adds its own read.

The PM's own working gives case 13 as entry 0 only, case 14 as `calendar-collision` on 2027-03-02, case 17 as 2025-12-15 and 2026-01-15, and case 18 as entry 0 only, from the script in the PR body. Cases 1 to 12 print as before.

## After Pass 2

Codex's Pass 2 is [issuecomment-6725366071](https://github.com/BeniCheni/keel/pull/28#issuecomment-6725366071), at `f2ad7ca`. It stopped once, because this brief and the prompt treated the ruling as closing the High, and it was right: that wording is corrected above. Its formal verdict under `AGENTS.md` is not mergeable, on finding 1 alone. Its verdict on the plan is mergeable after fixes. It accepted every Pass 1 disposition, and its own implementation matched cases 1 to 18.

| Pass 2 finding | Severity | PM disposition | Reason and fix |
| --- | --- | --- | --- |
| AC10 can still pass impure code | High, continues Pass 1 finding 1 | Accept | Reproduced: none of AC10's listed rules fires on `Math["random"]()` or `console.log`. A word list cannot be complete, so AC10 now has two parts: a tighter lexical check with one negative control per rule, and a runtime check with counting stubs. The spec says the pair guards against accident and that deliberate evasion stays with review. Ruling 1 covers this as the same finding |
| Case 13 misdescribes the order of dates | Medium | Accept | The roll reaches 2029-01-01, where maturity is checked first. The case now says so |
| The S03 handoff overstates what S02 knows | Medium | Accept | A listed schedule can state any date, so the handoff now says only what each kind of last entry is |

Codex re-reads the commit that carries these changes, because a Claude session wrote it.

## After the Pass 2 re-read

Codex's re-read is [issuecomment-6729889774](https://github.com/BeniCheni/keel/pull/28#issuecomment-6729889774), at `7f373cd`. Its formal verdict under `AGENTS.md` is not mergeable, on finding 1 alone. Its verdict on the plan is mergeable after fixes. It accepted the case 13 fix.

| Re-read finding | Severity | PM disposition | Reason and fix |
| --- | --- | --- | --- |
| AC10 still passes `crypto.getRandomValues` and `toLocaleUpperCase`, and a removed stub stays green | High, continues Pass 1 finding 1 | Accept | Reproduced. Adding two more words would leave the same gap, so the lexical check now derives its banned names from the running Node's globals, minus a frozen list of pure language names, and bans the text `locale`. The runtime check adds crypto and locale stubs, and each stub now has its own control. Ruling 1 covers this as the same finding |
| The S03 handoff calls the last estimated entry generated, and the finding 4 row excludes the last entry outright | Medium | Accept | Case 13 ends on the stated anchor, and a listed last entry can be `null`. The handoff now states both branches, and the row now says the last entry does not establish the final valuation date |

Codex re-reads the commit that carries these changes, because a Claude session wrote it.

## After the second re-read

Codex's second re-read is [issuecomment-6730578499](https://github.com/BeniCheni/keel/pull/28#issuecomment-6730578499), at `739405e`. Its formal verdict under `AGENTS.md` is not mergeable, on finding 1 alone. Its verdict on the plan is mergeable after fixes. It accepted the S03 handoff.

| Second re-read finding | Severity | PM disposition | Reason and fix |
| --- | --- | --- | --- |
| `RegExp.$1`, `Error.stack` and `import.meta.url` pass both parts of AC10 | High, continues Pass 1 finding 1 | Accept | Reproduced. `RegExp` leaves the pure names along with four the slice does not need, the lexical check bans the text `stack`, `import.` and `__dirname` and `__filename`, and each form gets a control. The runtime check now calls each function twice and compares the results, which catches state held between calls. Ruling 1 covers this as the same finding |

By ruling 3, this is the last AC10 round on the spec. Codex reads the commit that carries these changes, because a Claude session wrote it. Then a fresh Claude session takes Pass 2.5.
