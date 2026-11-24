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

## After Pass 2's re-read

Written by the PM on 2026-11-22 (America/New_York), after Codex's re-read of Pass 2 ([issuecomment-7089510550](https://github.com/BeniCheni/keel/pull/56#issuecomment-7089510550), posted at 20:54:37 EST) at `06b5cdb23ab4998fc5b55e472be12a5568838185`. Where this section differs from the text above, it wins.

The re-read's verdict is "mergeable", with no fix commit. It closes F1 to F9 and F11, keeps F10 open as a Low under ruling 20, and finds one new Low, F12. Its seat record validates against `schema/seat-record-1.1.json`, with 12 finding ids (the PM's ajv run printed `valid true`, and a bad control failed on three counts). GitHub lists no edit to the comment (`userContentEdits` gives a `totalCount` of 0). All six hosted checks passed at `06b5cdb` ([run 45095998960](https://github.com/BeniCheni/keel/actions/runs/45095998960)), and GitHub reports the PR `MERGEABLE` and `CLEAN` (`gh pr view 56 --json mergeable,mergeStateStatus`).

| # | Severity | PM disposition | Reason | Answer |
| --- | --- | --- | --- | --- |
| F12 | Low | accept | Reproduced. `git log -1 --format=%B 06b5cdb` says at lines 3 and 4 that Pass 2's three Mediums were "each in wording from the Pass 1 fixes". But `git show 25f4531:AGENTS.md` and `git show 1e15585:AGENTS.md` give line 21 the same Who, model and fallback cells, the cells F8 is about; `1e15585` changed only the row's "Does" cell. F8's defect came in with `25f4531`. This brief's "After Pass 2" section has it right: only F7 and F9 sit in the PM's fix wording. | Corrected here. The commit message stays as pushed, because changing it needs a force-push. `main` keeps the squash message instead, and that message attributes only F7 and F9 to the Pass 1 fixes. F12 stays open until the squash lands. |

### Authorship record

Unchanged. `06b5cdb` has its cold read from Codex, in this re-read. Every commit on the PR now has a cold read from a vendor that did not author it: `25f4531` from Codex's Pass 1, `1e15585` from Codex's Pass 2, and `06b5cdb` from Codex's re-read. No Codex commit exists, so Pass 2.5 has no commit to cold-read.

### Process notes

- **The same chat.** The re-read ran in the chat that gave Pass 2; its record's session id matches the Pass 2 records. It made a fresh clone, and it read three of its own scripts from its Pass 2 temporary folder, read-only, as the prompt allowed.
- **The PM's scratch folder was cleared again,** after the push of 20:41 EST and before 21:01 EST. Nothing pushed was lost, and the PM's receipts are kept outside it. The PM re-cloned keel and rebuilt its checks: the seat-record validator on the repository's own ajv 8.20.0, with a control that fails on three counts; and `tablecols.py` from `docs/reviews/pr-32-pass-2.5.md`, with a control that exits 1. The rebuilt validator also passes records 7085489566, 7085577152 and 7089353143, as the first one did.

### What Pass 2.5 does

A fresh Claude session, not the PM, on Fable 5.2 High (fallback Opus 5.5 High), in a fresh clone:

1. Re-run every number it reports at `06b5cdb`, against `origin/main` at `f5515590a0d3b1adf79430a96c48e3f23b023d83`. Anything not re-run is listed as not verified.
2. Read the whole diff, `origin/main...06b5cdb`, against rulings 1 to 20. Check that every commit has a cold read from a vendor that did not author it, and that F1 to F12 each have a disposition.
3. Write the executive brief from `executive-brief.md`, and evaluate the merge gate in shadow mode. The PR touches sensitive paths, so Beni merges it.
4. Give the squash message and its trailers: Claude for every commit, and Codex for Pass 1, Pass 2 and the re-read. The message attributes only F7 and F9 to the Pass 1 fixes (F12).

Pass M and mutations stay N/A, and demo mode stays N/A under idea 50. The PM's runs at `06b5cdb` are in the sealed appendix of "After Pass 2", above.

## After Pass 2.5

Written by the PM on 2026-11-22 (America/New_York), after Claude's Pass 2.5 ([issuecomment-7090042008](https://github.com/BeniCheni/keel/pull/56#issuecomment-7090042008), posted at 21:34:18 EST) at `06b5cdb23ab4998fc5b55e472be12a5568838185`. Where this section differs from the text above, it wins.

Pass 2.5's verdict is "mergeable after fixes", and its shadow gate would escalate, because the PR touches sensitive paths and Beni merges it. No High is open. It found F1 to F9 and F11 fixed and F10 and F12 open Lows, and it adds two Mediums, F13 and F14, and two Lows, F15 and F16. Its seat record validates against `schema/seat-record-1.1.json`, with 16 finding ids (the PM's ajv run printed `valid true`, and a bad control failed). GitHub lists no edit to the comment. The comment carries the executive brief in full, as its prompt asked.

The PM reproduced all four with the seat's own commands and accepts all four. They are fixed in one Claude commit, `1c71942063577dd9bd3e1b79b0749e5bbf1d6b2b`. F13 and F14 sit in wording that was already on `main`, F15 in a template the PR had not touched, and F16 in a label that came in with `25f4531`. The PM's check: `git grep -c -F <phrase> <ref> -- .claude` for each of F13 and F14's four phrases gives one file at `origin/main`, at `25f4531` and at `06b5cdb`, and the old row label gives none at `origin/main` and one at `25f4531`.

| # | Severity | PM disposition | Reason | Answer |
| --- | --- | --- | --- | --- |
| F13 | Medium | accept | Reproduced. At `06b5cdb`, `pass-1.5-brief.md:3` and `:27` say Codex receives the brief and re-derives Pass 1's findings, and `executive-brief.md:16` says "Codex's own findings" for Pass 2. On a Codex-built PR, `AGENTS.md:20` bars Codex from that Pass 2. | `1c71942`: the three lines name the Pass 2 seat: Codex, or on a Codex-built PR the Claude Pass 2 seat or Cursor. |
| F14 | Medium | accept | Reproduced. At `06b5cdb`, `SKILL.md:113` tells a seat to add skill changes "to the ideas note", while `SKILL.md:80` (ruling 11) says the PM appends ideas rows and a review seat does not edit that file. | `1c71942`: the seat lists them under Deliberately not done, and the PM appends them to the ideas note. |
| F15 | Low | accept | Reproduced. `AGENTS.md:34` has the PM propose Cursor in the Pass 0 brief and the brief record Beni's answer, and on a Codex-built PR that brief names the Pass 2 seat, but `pass-0-brief.md` has a "Seat for Pass 1" slot only. | `1c71942`: the template gains "Seat for Pass 2": Codex, a second fresh Claude session, or Cursor with the PM's one-line reason and Beni's answer. |
| F16 | Low | accept | Reproduced. The row "Records and fast-track cold read" at `AGENTS.md:24` holds Cursor's cells only, while `AGENTS.md:100` and the pointer give that read to any vendor that wrote none of the PR. | `1c71942`: the row is "Cursor records and fast-track cold read", beside "Cursor Pass 2 on a Codex build". |

### Rulings from Beni

All came on 2026-11-22. They continue the numbering above; cite them outside this record as R56.21 and R56.22.

21. **"Yes, fix first"**, given in the Pass 2.5 seat's own session at about 21:36 EST, as that seat's last message records, to its question 1 in comment 7090042008: "Should the PM fix F13 and F14 in this PR before the merge? "Yes" means one Claude fix commit, a Codex re-read, and this seat re-runs at the new head. "No" means the block below merges this head, and F13 to F16 go to the next docs PR."
22. **"Ride along (Recommended)"**, in the PM's session, asked at 21:39:16 and answered at 21:40:59 EST, to "PR #56 Pass 2.5's Lows: F15 (the Pass 0 template has no slot for the Pass 2 seat or a Cursor proposal) and F16 (the "Records and fast-track cold read" row is Cursor-only but its label reads as covering every such read). Fix them in the same commit as F13 and F14?". The option read: "One Claude commit fixes F13 to F16. F15 adds a Pass 2 seat slot to pass-0-brief.md; F16 renames the row "Cursor records and fast-track cold read". Same Codex re-read, same Pass 2.5 re-run."

At the same times Beni answered "Yes, until the merge block (Recommended)" to "For the rest of PR #56's loop, may I push the PM's fix and records commits, update the body, post the PM's records and message the Pass 2.5 seat with the new SHAs, without stopping for your yes each time?". The option read: "I still stop for any new ruling, any High, any seat's stop, and anything outside those four actions. You still paste Codex's prompt, run the merge, and mark the PR ready." That is an approval, not a ruling.

The seat's question 2, "Are rulings 1 to 20 right as the two briefs quote them?", is still open. Beni answers it in the seat's session at its re-run.

### Authorship record, extended

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `1c71942` docs(agents): Pass 2.5 fixes F13 to F16 | Claude | Codex, Pass 2's second re-read |

`1c71942` changes 5 files, with 9 insertions and 5 deletions (`git diff --shortstat 06b5cdb 1c71942`), and brings `pass-0-brief.md` and `executive-brief.md` into the PR, so the PR now changes 9 files, 7 of them on sensitive paths. After Codex's second re-read, the same Pass 2.5 seat, which wrote no fix, re-runs at the new head.

### Process notes

- **The seat's worktree.** The app started the Pass 2.5 session in a worktree of its clone, cut from `origin/main`, at `~/code/keel-pr-56-p25/.claude/worktrees/keel-pr-56-pass-25-99c405`. The seat detached that worktree at the head, ran every check there, put it back afterwards, and says so in its comment. The clone and its worktree stay until PR #56 merges.
- **The handoff block is void.** The seat's block answered a "No" to its question 1 and pins `06b5cdb`; its re-run replaces it.
- **The PM and the seat.** At Beni's request to guide the Pass 2.5 session to completion, the PM read that session's last message, to see where it stopped. Nothing reaches the seat from the PM but this brief, the PM's records and the new SHAs.

### What Pass 2's second re-read does

Codex, on GPT-6.2 Sol Extra High under ruling 14, in a fresh clone:

1. Give `1c71942` its cold read (`git diff 06b5cdb 1c71942`). Does it carry rulings 21 and 22 and the F13 to F16 wording, and nothing else? Does any live instruction still contradict them?
2. Say with a command whether each of F13 to F16 closes at `1c71942`.
3. Confirm that F1 to F12 stand as the re-read and Pass 2.5 left them, F10 and F12 open as Lows.

Then the Pass 2.5 seat re-runs at `1c71942`. Pass M and mutations stay N/A, and demo mode stays N/A under idea 50.

### Sealed appendix for Pass 2's second re-read

The findings and the PM's fixes are suspicions to re-derive, not conclusions.

#### PM runs at `1c71942`

In the PM's clone, on the branch at `1c71942063577dd9bd3e1b79b0749e5bbf1d6b2b`, against `origin/main` at `f5515590a0d3b1adf79430a96c48e3f23b023d83`, between 21:42:18 and 21:43:18 EST:

| Check | Command | Result |
| --- | --- | --- |
| Files | `git diff --name-only origin/main...HEAD` | 9 files: the 7 earlier ones, `pass-0-brief.md` and `executive-brief.md` |
| Size | `git diff --shortstat origin/main...HEAD` | 9 files, 64 insertions, 33 deletions |
| Commits | `git log --format='%an' origin/main..HEAD \| sort \| uniq -c` | `4 Claude` |
| Sensitive paths | `git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers apps \| wc -l` | `7` |
| Pass 2.5's wording | `git grep -n -E "Codex receives this brief for Pass 2\|Codex reproduces or disproves each one\|plus Codex's own findings\|otherwise add them to the ideas note\|^[\|] Records and fast-track cold read [\|]" HEAD -- AGENTS.md README.md .claude .agents` | Prints nothing and exits 1; at `06b5cdb`, `git grep -c` with the same pattern gives `SKILL.md` 1, `executive-brief.md` 1, `pass-1.5-brief.md` 2 and `AGENTS.md` 1 |
| Earlier wording | The "Old wording", "Pass 1's F1, F3 and F4 wording" and "Pass 2's wording" commands above, at `HEAD` | Each prints nothing and exits 1 |
| The Pass 2 slot | `git grep -c '^## Seat for Pass 2$' HEAD -- .claude/skills/keel-pr-review/pass-0-brief.md` | `1` |
| Cursor's rows | `git grep -c -E '^[\|] Cursor (Pass 2 on a Codex build\|records and fast-track cold read) [\|]' HEAD -- AGENTS.md` | `2` |
| New pin | `git grep -c 'GPT-6.2 Sol' HEAD -- AGENTS.md` | `3` |
| No dependency change | `git diff --exit-code --stat origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml` | Exits 0 |
| Tables | `python3 -I tablecols.py AGENTS.md` and the four templates `pr-comment.md`, `pass-1.5-brief.md`, `pass-0-brief.md`, `executive-brief.md` | 3/26/0, 6/19/0, 2/6/0, 2/6/0, 2/19/0; the control exits 1 |
| Copy lint | `node tools/verify/one.mjs copy` | Exit 0 |
| Install and verify | `CI=true pnpm install --frozen-lockfile`, `pnpm verify`, on Node 24.22.2 and 26.13.0, with an empty `mktemp -d` as `KEEL_DATA_DIR`, outside the app's command sandbox | Exit 0 for each, 12 of 12 steps; core 178, plugin 212, tooling 171 tests; the clone clean and each data folder empty afterwards |
| Tripwire | `node tools/tripwire/cli.mjs .` | Exit 0, no output |

Under Beni's ruling "Cut to pointers" on PR #48, the per-class counts, the body scan and the private-list check are the reviewer's.

## After Pass 2's second re-read

Written by the PM on 2026-11-22 (America/New_York), after Codex's second re-read ([issuecomment-7090547948](https://github.com/BeniCheni/keel/pull/56#issuecomment-7090547948), posted at 22:12:08 EST) at `1c71942063577dd9bd3e1b79b0749e5bbf1d6b2b`. Where this section differs from the text above, it wins.

The second re-read's verdict is "mergeable after fixes", with no fix commit. It closes F13 to F16, keeps F10 and F12 open as Lows, and finds one Medium, F17, and two Lows, F18 and F19. Its seat record validates against `schema/seat-record-1.1.json`, with 19 finding ids (the PM's ajv run printed `valid true`, and a bad control failed), and its session id matches the records of Pass 2 and the re-read. GitHub lists no edit to the comment. All six hosted checks passed at `1c71942` ([run 45102335577](https://github.com/BeniCheni/keel/actions/runs/45102335577)), and GitHub reports the PR `MERGEABLE` and `CLEAN`.

| # | Severity | PM disposition | Reason | Answer |
| --- | --- | --- | --- | --- |
| F17 | Medium | accept | Reproduced. At `1c71942`, `pass-0-brief.md:11` ties "(Codex built this PR)" to the Claude option only, so its Cursor option reads as open on any PR. `AGENTS.md:34` gives Cursor's Pass 2 only on a Codex-built PR, outside sensitive paths and engine code, after a shadowed trial, and on a PR Claude or Cursor built, Codex takes Pass 2. The line came in with `1c71942`, for F15. | `aa609a4`, under ruling 23: the slot names Codex when Claude or Cursor built the PR, and on a Codex-built PR a second fresh Claude session, or Cursor on Beni's word only where "Cursor seats" in `AGENTS.md` allows it. |
| F18 | Low | accept | Reproduced. Body v5's "Cursor seats" bullet says the row "Cursor records and fast-track cold read" keeps that read and merge logistics, but `AGENTS.md:25` gives merge logistics a row of its own, on Grok 4.7 Medium, where the cold-read row is on Extra High. Body v4 had it right; the PM's v5 rewrite for F16 brought the error in. | Body v6: Cursor keeps the records and fast-track cold read, in the row of that name, and merge logistics, in a row of its own. |
| F19 | Low | accept | Reproduced. Split into cells, row 21 of `git show 25f4531:AGENTS.md` and of `git show 1e15585:AGENTS.md` has the same Seat, Who, Model pin and Fallback cells, and different Does and Never cells. The PM wrote that `1e15585` changed only the Does cell in this brief's F12 row, above, and in the seat records of comments 7089726492 and 7090239912. F12 stands: the cells F8 is about came in with `25f4531`. | Corrected here: `1e15585` changed row 21's Does and Never cells, and not its Who, Model pin or Fallback cells. The two comments stay as posted, and the PM's next record carries the corrected evidence. |

### Ruling from Beni

It came on 2026-11-22 and continues the numbering above; cite it outside this record as R56.23.

23. **"Fix first (Recommended)"**, in the PM's session, asked at 22:22:09 and answered by 22:22:31 EST, to "PR #56, Codex's second re-read raised F17 (Medium): the new 'Seat for Pass 2' line in pass-0-brief.md offers Cursor on any PR, though AGENTS.md:34 allows Cursor's Pass 2 only on a Codex-built PR, outside sensitive paths, after a shadowed trial. 1c71942 introduced that line. Fix it in this PR before the merge?". The option read: "One Claude commit rewrites line 11; Codex gives it a third re-read; the Pass 2.5 seat re-runs at that head. F18's body fix and F19's records correction ride along." Its preview gave the new line, which `aa609a4` carries word for word.

F18 and F19 are answered under Beni's approval of "Yes, until the merge block (Recommended)", above: a body edit and this records commit, with no commit on the PR branch.

### Authorship record, extended

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `aa609a4` docs(agents): Pass 2's second re-read fixes F17 | Claude | Codex, Pass 2's third re-read |

`aa609a4` changes 1 file, with 1 insertion and 1 deletion (`git diff --shortstat 1c71942 aa609a4`). The line it replaces came in with this PR, so the PR still changes 9 files, with 64 insertions and 33 deletions, 7 of the files on sensitive paths. After Codex's third re-read, the same Pass 2.5 seat, which wrote no fix, re-runs at the new head.

### Process notes

- **The same chat, a new scratch folder.** The second re-read ran in the chat that gave Pass 2 and the re-read, in the fresh clone `/tmp/keel-pr-56-p2r2`. It says its three reads of scripts from the re-read's temporary folder found the files missing, so it rebuilt them in its own temporary folder.
- **The PM's errors.** F18 came from the PM's body v5, and F19 from the PM's description of `1e15585`, repeated in two records. Neither changes a rule or a finding's status.

### What Pass 2's third re-read does

Codex, on GPT-6.2 Sol Extra High under ruling 14, in a fresh clone:

1. Give `aa609a4` its cold read (`git diff 1c71942 aa609a4`). Does it carry ruling 23 and the F17 wording, and nothing else? Does any live instruction still contradict it?
2. Say with a command whether F17 closes at `aa609a4`, F18 in body v6, and F19 in this section.
3. Confirm that F1 to F16 stand as the second re-read left them, F10 and F12 open as Lows.

Then the Pass 2.5 seat re-runs at `aa609a4`. Pass M and mutations stay N/A, and demo mode stays N/A under idea 50.

### Sealed appendix for Pass 2's third re-read

The findings and the PM's fixes are suspicions to re-derive, not conclusions.

#### PM runs at `aa609a4`

In the PM's clone, on the branch at `aa609a4a2b5bc49926a2034bc9f5e0132049659a`, against `origin/main` at `f5515590a0d3b1adf79430a96c48e3f23b023d83`, with the install and verify between 22:23:02 and 22:23:59 EST and the other rows between 22:25:05 and 22:25:06 EST:

| Check | Command | Result |
| --- | --- | --- |
| Files | `git diff --name-only origin/main...HEAD` | The same 9 files as at `1c71942` |
| Size | `git diff --shortstat origin/main...HEAD` | 9 files, 64 insertions, 33 deletions |
| Commits | `git log --format='%an' origin/main..HEAD \| sort \| uniq -c` | `5 Claude` |
| Sensitive paths | `git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers apps \| wc -l` | `7` |
| F17's new line | `git grep -c -F 'Codex (Claude or Cursor built this PR)' HEAD -- .claude/skills/keel-pr-review/pass-0-brief.md` | `1` |
| F17's old line | `git grep -n -F 'a second fresh Claude session (Codex built this PR)' HEAD -- AGENTS.md README.md .claude .agents` | Prints nothing and exits 1; at `1c71942` it prints `pass-0-brief.md:11` |
| F19's cells | `diff <(git show 25f4531:AGENTS.md \| sed -n 21p \| tr '\|' '\n') <(git show 1e15585:AGENTS.md \| sed -n 21p \| tr '\|' '\n')` | `6,7c6,7`: fields 6 and 7, the Does and Never cells, differ; fields 2 to 5, Seat, Who, Model pin and Fallback, do not |
| Earlier wording | The "Old wording", "Pass 1's F1, F3 and F4 wording", "Pass 2's wording" and "Pass 2.5's wording" commands above, at `HEAD` | Each prints nothing and exits 1 |
| Tables | `python3 -I tablecols.py AGENTS.md` and the four templates `pr-comment.md`, `pass-1.5-brief.md`, `pass-0-brief.md`, `executive-brief.md` | 3/26/0, 6/19/0, 2/6/0, 2/6/0, 2/19/0; the control exits 1 |
| Copy lint | `node tools/verify/one.mjs copy` | Exit 0 |
| Install and verify | `CI=true pnpm install --frozen-lockfile`, `pnpm verify`, on Node 24.22.2 and 26.13.0, with an empty `mktemp -d` as `KEEL_DATA_DIR`, outside the app's command sandbox, between 22:23:02 and 22:23:59 EST | Exit 0 for each, 12 of 12 steps; core 178, plugin 212, tooling 171 tests; the clone clean and each data folder empty afterwards |
| Tripwire | `node tools/tripwire/cli.mjs .` | Exit 0, no output |

Under Beni's ruling "Cut to pointers" on PR #48, the per-class counts, the body scan and the private-list check are the reviewer's.

## After Pass 2.5's re-run

Written by the PM on 2026-11-23 (America/New_York), after Codex's third re-read, the Pass 2.5 seat's re-run at `aa609a4a2b5bc49926a2034bc9f5e0132049659a`, and Beni's merge. Where this section differs from the text above, it wins.

**Codex's third re-read** ([issuecomment-7090852509](https://github.com/BeniCheni/keel/pull/56#issuecomment-7090852509), posted 2026-11-22 at 22:34:31 EST) finds `aa609a4` mergeable. It makes no fix commit and raises no new finding. It closes F17 to F19 and keeps F10 and F12 open as Lows. Its seat record validates against `schema/seat-record-1.1.json` with 19 finding ids. Its session id, `01a204f1-6080-79e3-adbe-056585b04662`, is the second re-read's. All six hosted checks passed at `aa609a4` (`gh api repos/BeniCheni/keel/commits/aa609a4a2b5bc49926a2034bc9f5e0132049659a/check-runs`: 6 of 6 `success`).

**The Pass 2.5 re-run** ([issuecomment-7102977585](https://github.com/BeniCheni/keel/pull/56#issuecomment-7102977585), posted 2026-11-23 at 08:45:10 EST) finds `aa609a4` mergeable, with no High or Medium open. Its shadow gate would escalate, because the PR touches sensitive paths. It raises one Low, F20. Its seat record validates with 20 finding ids. Its session id, `e74c71dd-7102-4264-b43d-0ece3f7863bf`, is the first run's. The PM's ajv runs printed `valid true` for both records, and a bad control printed `valid false` and exited 1. The control was the re-run's record with `verdict` removed, `pass` set to "4" and a finding's status set to "maybe". GitHub lists no edit to either comment. The executive briefs of both Pass 2.5 runs are in `pr-56-pass-2.5.md`.

| # | Severity | PM disposition | Reason | Answer |
| --- | --- | --- | --- | --- |
| F20 | Low | accept | Reproduced. `git grep -n -i cursor aa609a4 -- .claude/skills/keel-pr-review/pass-0-brief.md` prints line 11 only, where Cursor appears as a builder only in "Claude or Cursor built this PR". `AGENTS.md:34` at `aa609a4` has the PM propose Cursor for the Builder seat or for Pass 2, "and the brief records Beni's answer". The template has a slot for that answer on Pass 2 only. | No change in this PR, under ruling 24. An ideas row, from rank 93, in the next docs PR. |
| F12 | Low | closed | The squash landed. `git log -1 --format=%B dacfef3 \| grep -c -F 'F7 and F9 sat in wording from the Pass 1 fixes, and F8 came in with'` prints `1`, so `main` carries the attribution that this brief's F12 answer set out. | Closed by `dacfef3`. |
| F10 | Low | accept | Unchanged. This section was written in the Opus 5.5 PM session, and the PM did not read the session's effort for this record. | Open as a Low, under ruling 20. An ideas row, from rank 93, in the next docs PR. |

### Rulings from Beni

They came on 2026-11-23 and continue the numbering above. Cite them outside this record as R56.24 and R56.25.

24. **"Yes"**, in the Pass 2.5 seat's session, to its question 1: "Merge this head, with F20 going to the ideas note and not to another fix in this PR? "No" means one more Claude fix commit, a Codex re-read, and this seat re-runs again." The PM did not see it given. It came between the question's post at 08:45:10 EST and Beni's message to the PM at 08:56:33 EST that the seat's session had finished. The seat's own reply records it: "I take your "Yes" as the answer to question 1", adding that "the button only answered question 1". The PM read that reply through the app's session events at 08:57:40 EST. Beni's merge of `aa609a4` at 11:32:38 EST carries it out.
25. **"Yes, all right"**, in the PM's session, asked at 11:40:35 and answered by 11:43:35 EST. The question was: "In the Pass 2.5 seat's session for PR #56 you were asked its question 2: "Are rulings 1 to 23 right as the two briefs quote them?" What was your answer? (The records PR has to quote it, and I never saw it.)". The option read: "Rulings R56.1 to R56.23 stand as the briefs quote them." So rulings 1 to 23 stand as this brief and the Pass 0 brief quote them. The ruling rests on Beni's word to the PM: the last reply of the seat's that the PM read, at 08:57:40 EST, still lists question 2 as open.

### Authorship record

No commit was added to the PR after `aa609a4`. `git log --format='%h %an' f551559..aa609a4` lists 5 commits, all Claude's, and Codex gave each its cold read, as the records above set out. GitHub made the squash `dacfef3`, with both vendors' trailers. This records branch holds only Claude's commits, plus a merge of `main` at `dacfef3`, made with a merge commit and not a rebase. So Codex, which authored none of them, gives the records PR its one cold read.

### Process notes

- **The Planner seat.** By Beni's ruling of 11:44 EST on 2026-11-23, a Fable 5.2 session in another clone held the Planner seat from then until 16:00 EST. It left no handback note and nothing on origin. At 22:22 EST, `git ls-remote --heads origin` listed the same four branches as at the merge, and `gh pr list --state open` printed `[]`. Beni said at 22:22:29 EST that the seat was back with the Opus PM session ("Yes, it's back"), and that session wrote this section.
- **The merge.** `pr-56-pass-2.5.md`'s records note holds the PM's post-merge checks, each with its command.

### What comes next

- Codex's cold read of the records PR, as one short PR comment. Beni merges it.
- The ideas docs PR, with rows from rank 93: F10, F20, and three more items from the seat's "Deliberately not done" list (idea 48 now reaching every slice; no seats row or pin for a Claude or Codex records cold read; the skill's unguarded `mktemp -d`). The list's fourth item is F10's own row. *Corrected on 2026-11-24, after the records cold read's [F2](https://github.com/BeniCheni/keel/pull/57#issuecomment-7137593571): this line had listed F10 twice.*
- The S91 spec-amendment PR that `pr-52-pass-2.5.md` owes.
