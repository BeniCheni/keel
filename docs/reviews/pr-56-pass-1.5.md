# Pass 1.5 brief: PR #56

Written by the PM on 2026-11-22 (America/New_York), after reading Codex's Pass 1 comment, [7084817334](https://github.com/BeniCheni/keel/pull/56#issuecomment-7084817334), at head `25f45317131f92913372cdf54a69f65ccbad7175`, and Beni's rulings below. This brief lives on branch `docs/pr-56-records`, beside `pr-56-pass-0.md`. Codex receives it for Pass 2.

Pass 1 found five Mediums and one Low and committed no fix (`gh pr view 56 --repo BeniCheni/keel --json commits --jq '.commits | length'` printed `1` before the PM's fix). Its seat record validates against `schema/seat-record-1.1.json` (the PM's ajv run printed `valid true`, and a bad control exited 1). The PM reproduced all six, accepts all six, and fixed F1 to F5 in one Claude commit, `1e155856b1b6e355bd708cafaa90a1ef00233a49`, and F6 on this branch.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework for the builder? |
| --- | --- | --- | --- | --- |
| F1 | Medium | accept | Reproduced. At `25f4531`, `AGENTS.md:95` lets Pass 2 commit fixes on a Codex-built PR unless the seat is Claude's, so Cursor may fix there. `AGENTS.md:22`, `:29` and `:96` name a cold read only for Codex-authored commits and rework. Fixed in `1e15585` under ruling 15: every review seat on a Codex-built PR gives findings only. | no |
| F2 | Medium | accept | Reproduced. At `25f4531`, `.claude/skills/keel-pr-review/SKILL.md:88-94` gives Pass 2.5 no step for rework that its own finding sends to Codex, and `AGENTS.md:29` names none. Fixed in `1e15585` under ruling 16: the same Pass 2.5 seat re-runs at the rework head. | no |
| F3 | Medium | accept | Reproduced. At `25f4531`, `.claude/skills/keel-pr-review/SKILL.md:22` and `AGENTS.md:38` require a read-only mode unless fixing. The same skill's setup steps 2 and 3 and section 2 make every seat clone, `mktemp` and install. Fixed in `1e15585` under ruling 17: a seat's writes stay in its clone and its own temporary folders. | no |
| F4 | Medium | accept | Reproduced. At `25f4531`, `.agents/skills/keel-pr-review/SKILL.md:11` escalates when Codex is not eligible, though `AGENTS.md:99` lets any vendor that wrote none of a records PR's commits give its cold read. The sentence predates this PR (`git show origin/main:.agents/skills/keel-pr-review/SKILL.md \| grep -c 'if Codex is not eligible either'` prints `1`), and the PR rewrote the line around it. Fixed in `1e15585`. | no |
| F5 | Medium | accept | Reproduced. At `25f4531`, `README.md:16-17` names Codex as the only builder and leaves Codex out of the reviewers, while `AGENTS.md:33` allows a Cursor build and gives Codex Pass 2 on one. Fixed in `1e15585`. | no |
| F6 | Low | accept | Reproduced. `gh api repos/BeniCheni/keel/issues/comments/7083330456 --jq .body \| grep -c 'Records PR'` prints `0`, while PR #55's body and its squash message each print `1`. Fixed on this branch: `pr-56-pass-0.md:52` now cites the body and the squash message, with a dated correction. | no |

None of the six needs redesign, so none goes back to a builder. The PR has no builder seat: a Claude session wrote it.

## Rulings from Beni

All came on 2026-11-22, in the PM's session, which no seat can open. They continue the Pass 0 brief's numbering; cite them outside this record as R56.14 to R56.17. Times are EST.

14. **"Allow 6.2 for PR #56 (Recommended)"**, asked at 14:27:51 and answered at 14:43:19, to "AGENTS.md on main still pins Codex at GPT-6.1 Sol (Extra High here, sensitive paths), so PR #56's Pass 1 seat will stop at the pin. What should your pre-drafted answer in its session say?". The option read: "GPT-6.2 Sol Extra High stands in for the pin on PR #56's Codex seats (Pass 1, any re-read and Pass 2), as on PRs #52 to #55; the seat records requested gpt-6.2-sol." Beni pasted the PM's answer block into Codex's session, and Pass 1's comment quotes the ruling.
15. **"Findings only for Cursor too (Recommended)"**, asked at 15:08:31 and answered at 15:13:38, to "PR #56 F1: Cursor at Pass 2 on a Codex build may commit fixes, but no seat is named to cold-read them (your fixes ruling barred Claude seats only). Which rule?". The option read: "Whoever holds Pass 2 on a Codex build gives findings only; Codex reworks, and a later Claude pass cold-reads the rework. One route for every Codex build."
16. **"Same seat re-runs (Recommended)"**, at the same times, to "PR #56 F2: on a Codex build, a Pass 2.5 finding can send rework to Codex, and nothing says who cold-reads that rework. Which route?". The option read: "The same Pass 2.5 seat, which wrote no fix, re-runs at the rework head and gives it its cold read, as on PRs #50 and #52; repeat until nothing goes back." The fix cites PR #52 only: there the re-runs read Codex's rework, while on PR #50 the change after Pass 2.5 was the PM's amendment.
17. **"Writes stay in the clone (Recommended)"**, at the same times, to "PR #56 F3: your 'read-only unless fixing' rule clashes with the skill's own fresh clone, install and fixture writes. What should 'read-only' mean?". The option read: "A review seat writes only inside its fresh clone and its own temporary folders, and commits and pushes nothing unless its prompt allows fix commits."

Beni also answered "Post it (Recommended)" at 14:43:19 to posting the PM's Pass 0 record, which is comment 7084628081. That is an approval, not a ruling.

## Authorship record

From `git log --format='%h %an %s' origin/main..1e155856b1b6e355bd708cafaa90a1ef00233a49`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `25f4531` docs(agents): Codex builds; seat conduct and seat-record rules | Claude | Codex, Pass 1 (comment 7084817334) |
| `1e15585` docs(agents): Pass 1 fixes F1 to F5 | Claude | Codex, Pass 2 |

`1e15585` changes 6 files, with 13 insertions and 12 deletions (`git diff --shortstat 25f4531 1e15585`). Any fix Codex commits at Pass 2 gets its cold read from the fresh Claude session at Pass 2.5. The commits on this records branch, the Pass 0 brief `de775a0` and this brief's commit, land through the records PR and its own cold read.

## Process notes

- **The comment was edited once.** Codex posted it at 14:57:37 EST and edited it at 15:02:47 EST (`gh api graphql` on the comment's `userContentEdits` lists 2 versions, 13,271 and 13,738 characters). The first version said that the pass resumed "on Beni's authorization for GPT-6.2 Extra High, owner-reported", and its record gave `"requested": "gpt-6.2"`. The edit quotes ruling 14 and gives `"gpt-6.2-sol"`. No finding, count or verdict changed. GitHub keeps both versions. On PR #52, the PM's advice for this case was a new comment rather than an edit; this one stands as Beni relayed it.
- **Model and effort.** The record gives both as observed `null`, "not reported". The mode was observed as `workspace-write`, as requested.
- **Paths.** Codex ran the pinned Node binaries under `~/.nvm/versions/node/` and the installed pnpm, which the prompt's path list did not name. Running both Node versions required them, so the PM reads this as within the prompt. Under ruling 5's first rule, later prompts name them. Codex also read PR #46's three passes through the API, which the prompt allowed.
- **Length.** The comment is 13,738 characters, with the seat record last.

## What Pass 2 does

Codex, on GPT-6.2 Sol Extra High under ruling 14, in a fresh clone:

1. Adjudicate F1 to F6: reproduce or disprove each with your own command at `25f4531`, then accept, contest, or accept and dispute.
2. Give the cold read of `1e15585`, the Claude commit after Pass 1. Does it carry rulings 15, 16 and 17 and the F4 and F5 wording, and nothing else? Does any live instruction still contradict them?
3. Check F6's correction at `pr-56-pass-0.md:52` on this branch against PR #55's body, its squash message and comment 7083330456.
4. Add your own read of the whole diff, `origin/main...1e15585`, under the `AGENTS.md` on `main`.

Pass M and mutations are N/A: no code, test, engine or golden fixture changes. Demo mode is N/A while the README has no demo step, the known gap of idea 50.

## Sealed appendix for Pass 2

Pass 1's findings and the PM's fixes are suspicions to re-derive, not conclusions. Reproduce or disprove each one independently, and add your own read.

### PM runs at `1e15585`

In the PM's clone, on the branch at `1e155856b1b6e355bd708cafaa90a1ef00233a49`, against `origin/main` at `f5515590a0d3b1adf79430a96c48e3f23b023d83`, between 15:16:21 and 15:17:16 EST:

| Check | Command | Result |
| --- | --- | --- |
| Files | `git diff --name-only origin/main...HEAD` | The same 7 files as at `25f4531` |
| Size | `git diff --shortstat origin/main...HEAD` | 7 files, 56 insertions, 30 deletions |
| Commits | `git log --format='%an' origin/main..HEAD \| sort \| uniq -c` | `2 Claude` |
| Old wording | `git grep -n -i -E 'gpt-6\.1\|builder \(cursor\)\|back to cursor\|cursor rework\|rework for cursor\|two other vendors\|Cursor opens' HEAD -- AGENTS.md README.md .claude .agents` | Prints nothing and exits 1 |
| Pass 1's F1, F3 and F4 wording | `git grep -n -E 'Claude seats commit no fixes\|a Claude seat fixes nothing\|read-only mode\|findings only from a Claude seat\|Commits a fix as a Claude seat\|so Codex takes those; if Codex' HEAD -- AGENTS.md README.md CHANGELOG.md .claude .agents` | Prints nothing and exits 1 |
| New pin | `git grep -c 'GPT-6.2 Sol' HEAD -- AGENTS.md` | `3` |
| No dependency change | `git diff --exit-code --stat origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml` | Exits 0 |
| Tables | `python3 -I tablecols.py AGENTS.md .claude/skills/keel-pr-review/pr-comment.md .claude/skills/keel-pr-review/pass-1.5-brief.md` | 3/25/0, 6/19/0, 2/6/0; the control exits 1 |
| Copy lint | `node tools/verify/one.mjs copy` | Exit 0 |
| Install and verify | `CI=true pnpm install --frozen-lockfile`, `pnpm verify`, on Node 24.22.2 and 26.13.0, with an empty `mktemp -d` as `KEEL_DATA_DIR`, outside the app's command sandbox | Exit 0 for each, 12 of 12 steps; core 178, plugin 212, tooling 171 tests; the clone clean and each data folder empty afterwards |
| Tripwire | `node tools/tripwire/cli.mjs .` | Exit 0, no output |

Under Beni's ruling "Cut to pointers" on PR #48, the per-class counts, the body scan and the private-list check are the reviewer's.

## After Pass 2

Written by the PM on 2026-11-22 (America/New_York), after Codex's Pass 2 ([issuecomment-7085489566](https://github.com/BeniCheni/keel/pull/56#issuecomment-7085489566), posted at 15:43:00 EST) and its seat-record correction ([issuecomment-7085577152](https://github.com/BeniCheni/keel/pull/56#issuecomment-7085577152), posted at 15:49:47 EST), both at `1e155856b1b6e355bd708cafaa90a1ef00233a49`. Where this addendum differs from the text above, it wins.

Pass 2's verdict is "mergeable after fixes", with no fix commit. It accepted F1 to F6 as fixed, F6 on this branch, and found three Mediums, F7 to F9, and two Lows, F10 and F11. Both of its seat records validate against `schema/seat-record-1.1.json` (the PM's ajv runs printed `valid true` for each, and a bad control exited 1), and they differ only in `model`. GitHub lists no edit to either comment (`gh api graphql` on each comment's `userContentEdits` gives a `totalCount` of 0).

The PM reproduced all five new findings with Pass 2's own commands, run on `git show 1e15585:<path>`, and accepts all five. F7 to F9 are fixed in one Claude commit, `06b5cdb23ab4998fc5b55e472be12a5568838185`, and F11 in the PR body. F7 and F9 sit in wording from the PM's own fixes for F5 and F4.

| # | Severity | PM disposition | Reason | Answer |
| --- | --- | --- | --- | --- |
| F7 | Medium | accept | Reproduced. At `1e15585`, `README.md:17` says reviewers come "from vendors that did not write it", while `AGENTS.md:29` sets the cold read per commit. On this PR a Claude session wrote every commit, and a fresh Claude session still takes Pass 2.5. | `06b5cdb`: the README says the builder reviews nothing it built, and every commit gets its cold read from a vendor that did not write it. |
| F8 | Medium | accept | Reproduced. At `1e15585`, `AGENTS.md:21` names Claude or Cursor as the seat, but its model and fallback cells give only Claude's, while `AGENTS.md:33` and ruling 6 put Cursor on Grok 4.7 Medium. | `06b5cdb`, under ruling 18: Cursor's Pass 2 on a Codex build gets its own row, on Grok 4.7 Medium, with the Claude Pass 2 seat on a Codex build as its fallback. The Claude row names Claude only. |
| F9 | Medium | accept | Reproduced. At `1e15585`, `.agents/skills/keel-pr-review/SKILL.md:11` names records and fast-track PRs, then gives the fallback only for "the records PR's commits", though `AGENTS.md:118` lets any vendor that did not write a fast-track PR give its cold read. | `06b5cdb`: the fallback names both records and fast-track PRs. |
| F10 | Low | accept | Reproduced. The PM's records 7084628081 and 7085217948 give effort requested `high` and observed `xhigh`, against the Planner's High pin on `main`'s `AGENTS.md:16`. The records disclose it, and PR #52's records report the same gap. | No change, under ruling 20. It stays open as a Low; the PM's records keep disclosing it, and an ideas row takes the Planner's pin to a later PR. |
| F11 | Low | accept | Reproduced. The body's Review log said Pass 1 "continued on GPT-6.2 Sol Extra High", while Pass 1's record gives model and effort observed `null`. | The Review log now says the answer let GPT-6.2 Sol Extra High stand in, and that Codex's session did not report the model or effort it ran on. |

### Rulings from Beni

All came on 2026-11-22, in the PM's session, which no seat can open. They continue the numbering above; cite them outside this record as R56.18 to R56.20. All three were asked at 16:00:51 EST and answered at 16:04:30 EST.

18. **"The Claude seat (Recommended)"**, to "PR #56 F8: AGENTS.md's "Pass 2 on a Codex build" row lists Claude or Cursor as the seat, but its model and fallback cells give only Claude's models (Fable 5.2 Extra / Opus 5.5 High). If Cursor gets its own row (Grok 4.7 Medium, per your ruling 6), what is Cursor's fallback?". The option read: "Cursor's row: Grok 4.7 Medium, with "the Claude seat on a Codex build" as fallback. This reads ruling 6's "Otherwise a second fresh Claude session takes Pass 2" as also covering an unavailable Cursor."
19. **"PM fixes, Codex re-reads (Recommended)"**, to "PR #56: Pass 2 committed no fixes. Who fixes F7 to F9 (wording in README.md, the AGENTS.md table, the .agents pointer), and who cold-reads the fix? A Claude commit can't get its cold read from the Claude Pass 2.5 seat.". The option read: "As on PR #50: one Claude commit, an "After Pass 2" addendum on the records branch, then a Codex re-read on GPT-6.2 Sol Extra High (R56.14 covers "any re-read"), then Pass 2.5."
20. **"Record only (Recommended)"**, to "PR #56 F10 (Low): the PM's Pass 0 and 1.5 records show effort observed "xhigh" against the Planner's High pin. The records disclose it, and it has been known since PR #52. What now?". The option read: "The records keep disclosing it, and Pass 2 proposed no edit. The PM adds an ideas row to settle the Planner's pin in a later PR."

As on PR #50, this addendum's record posts as pass `"1.5"` and Codex's re-read as pass `"2"`, each carrying every finding id.

### Authorship record, extended

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `06b5cdb` docs(agents): Pass 2 fixes F7 to F9 | Claude | Codex, Pass 2's re-read |

`06b5cdb` changes 3 files, with 5 insertions and 4 deletions (`git diff --shortstat 1e15585 06b5cdb`). The PM's body edit for F11 is also Claude's text after Pass 2, and the re-read reads it too.

### Process notes

- **Pass 2 resumed on "Yes".** Pass 2 stopped at the GPT-6.1 Sol pin, as its prompt said. It resumed after Beni answered "Yes" in Codex's session, before the PM's drafted answer citing ruling 14 reached it, so its first record gave `"requested": "gpt-6.1-sol"`. When Beni pasted the drafted answer, Codex posted a separate correction that quotes ruling 14 and supersedes the first record. It did not edit the comment, as the prompt asked. No finding, count or verdict changed.
- **The PM's Pass 2 prompt was wrong on one point.** It said the fresh Claude session at Pass 2.5 would cold-read the PM's answers to Pass 2's findings. Under the `AGENTS.md` on `main`, every commit needs a cold read from a vendor that did not author it, so a Claude commit after Pass 2 cannot get its cold read from a Claude seat. Ruling 19 routes `06b5cdb` to a Codex re-read, as on PR #50. Pass 2 committed nothing, so that line routed nothing.
- **Model and effort.** Both Pass 2 records give model and effort observed `null`, "not reported". The mode was observed as `workspace-write`, as requested.
- **Paths.** Pass 2 names every path it opened outside its clone: the owner's private list, its own temporary folders, both pinned Node binaries and the installed pnpm. All are within its prompt.
- **Length.** Pass 2's comment is 16,216 characters and the correction 10,073, each with its seat record last.

### What Pass 2's re-read does

Codex, on GPT-6.2 Sol Extra High under ruling 14, in a fresh clone:

1. Give `06b5cdb` its cold read (`git diff 1e15585 06b5cdb`). Does it carry ruling 18 and the F7 and F9 wording, and nothing else? Does any live instruction still contradict them?
2. Say with a command whether each of F7 to F9 closes at `06b5cdb`, and whether the body edit closes F11.
3. Read this addendum's account of Pass 2, and the PM's body edit against GitHub's edit history.
4. Confirm that F1 to F6 stand as Pass 2 left them, and that F10 stays open as a Low under ruling 20.

Pass M and mutations stay N/A, and demo mode stays N/A under idea 50.

### Sealed appendix for Pass 2's re-read

Pass 2's findings and the PM's fixes are suspicions to re-derive, not conclusions.

#### PM runs at `06b5cdb`

In the PM's clone, on the branch at `06b5cdb23ab4998fc5b55e472be12a5568838185`, against `origin/main` at `f5515590a0d3b1adf79430a96c48e3f23b023d83`, between 16:06:08 and 16:07:22 EST:

| Check | Command | Result |
| --- | --- | --- |
| Files | `git diff --name-only origin/main...HEAD` | The same 7 files as at `1e15585` |
| Size | `git diff --shortstat origin/main...HEAD` | 7 files, 57 insertions, 30 deletions |
| Commits | `git log --format='%an' origin/main..HEAD \| sort \| uniq -c` | `3 Claude` |
| Pass 2's wording | `git grep -n -E "vendors that did not write it \(\|session; or Cursor \(Cursor seats\|records PR's commits takes those" HEAD -- AGENTS.md README.md .claude .agents` | Prints nothing and exits 1; at `1e15585`, `git grep -c` with the same pattern prints 1 each for `.agents/skills/keel-pr-review/SKILL.md`, `AGENTS.md` and `README.md` |
| Older wording | The "Old wording" and "Pass 1's F1, F3 and F4 wording" commands above, at `HEAD` | Each prints nothing and exits 1 |
| Cursor's row | `git grep -c '^\| Cursor Pass 2 on a Codex build \| Cursor, on Beni.s word for that PR (Cursor seats, below) \| Grok 4.7 Medium \| The Claude Pass 2 seat on a Codex build \|' HEAD -- AGENTS.md` | `1` |
| New pin | `git grep -c 'GPT-6.2 Sol' HEAD -- AGENTS.md` | `3` |
| No dependency change | `git diff --exit-code --stat origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml` | Exits 0 |
| Tables | `python3 -I tablecols.py AGENTS.md .claude/skills/keel-pr-review/pr-comment.md .claude/skills/keel-pr-review/pass-1.5-brief.md` | 3/26/0, 6/19/0, 2/6/0; the control exits 1 |
| Copy lint | `node tools/verify/one.mjs copy` | Exit 0 |
| Install and verify | `CI=true pnpm install --frozen-lockfile`, `pnpm verify`, on Node 24.22.2 and 26.13.0, with an empty `mktemp -d` as `KEEL_DATA_DIR`, outside the app's command sandbox | Exit 0 for each, 12 of 12 steps; core 178, plugin 212, tooling 171 tests; the clone clean and each data folder empty afterwards |
| Tripwire | `node tools/tripwire/cli.mjs .` | Exit 0, no output |

Under Beni's ruling "Cut to pointers" on PR #48, the per-class counts, the body scan and the private-list check are the reviewer's.
