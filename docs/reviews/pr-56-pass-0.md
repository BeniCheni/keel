# Pass 0 brief: PR #56 (Codex builds; seat conduct and seat-record rules)

Written by the PM on 2026-11-22 (America/New_York), from a fresh read of the PR at `25f45317131f92913372cdf54a69f65ccbad7175`. This brief lives on branch `docs/pr-56-records`, not on the PR branch. When it was written, PR #56 had no comment (`gh api repos/BeniCheni/keel/issues/56 --jq .comments` printed `0`).

This PM session wrote the PR's one commit and this brief. It takes no review pass on this PR.

## Seat for Pass 1

Codex, because a Claude session wrote the PR. `AGENTS.md` on `main` pins GPT-6.1 Sol, at Extra High here because `AGENTS.md`, `.claude/skills/**` and `.agents/skills/**` are sensitive paths. It has no fallback, and a prompt cannot loosen the pin. If the seat is not running GPT-6.1 Sol, it stops after reading `AGENTS.md` and asks Beni in one word. This PR moves the pin to GPT-6.2 Sol, but it is reviewed under the `AGENTS.md` on `main` until it merges. If the chat reaches the model only through a sub-agent, that sub-agent gets the whole prompt and any answer from Beni word for word, does all the reading and running, and the comment says so.

Later seats: Pass 1.5 is the PM. Pass 2 is Codex, under the same pin, covering any Claude-authored commit after Pass 1. Pass 2.5 is a fresh Claude session, not the PM, on Fable 5.2 High with fallback Opus 5.5 High; it gives the cold read of any Codex-authored commit. A Claude session wrote this PR, so the new rules for a Codex-built PR do not apply to its review, before or after it merges. Beni merges. The PR is a draft and must be marked ready before it can merge.

## Scope

- Spec: none. The change carries out Beni's rulings below. Design brief: none.
- Sensitive paths touched: `AGENTS.md`, `.agents/skills/keel-pr-review/SKILL.md`, and three files under `.claude/skills/keel-pr-review/` (`SKILL.md`, `pr-comment.md`, `pass-1.5-brief.md`). `README.md` and `CHANGELOG.md` are not sensitive paths (`git diff --name-only origin/main...HEAD`).
- Release: no. No version or lockfile change, and the README changes only under "How it is built".
- New dependencies: none. `git diff --exit-code --stat origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml` exits 0.
- Bootstrap path: no. Install and `verify` apply. Mutations are N/A: no code, test or fixture changes, so there is no tested claim to mutate. Pass M is N/A: no engine or golden fixture. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.
- Diff: 7 files, 55 insertions, 30 deletions (`git diff --shortstat origin/main...HEAD`).
- Base: `origin/main` at `f551559`, the PR #55 squash (`git merge-base origin/main HEAD`).
- CI: run 45060580452 started on `25f4531`. When this brief was written, at 14:24:45 EST, its five jobs were pending and the aggregate `verify` check had not reported (`gh pr checks 56 --repo BeniCheni/keel`). Read CI from GitHub at your head.

## Rulings every seat carries

All came from Beni on 2026-11-22, in the PM's session, which no seat can open. The PM quotes each question and the answer chosen; where Beni typed his own answer, it is quoted whole. Times are when the answer arrived, in EST. If a verdict turns on one, ask Beni in one word.

1. **"Yes, start it"**, at 13:16:49, to "Start drafting the rules PR next?".
2. **"Two PRs, rules first (Recommended)"**, at 13:23:54, to "PR #52's records send two groups to "the rules PR": rule changes (AGENTS.md and the review skill, both sensitive paths) and S91 spec amendments (rulings 1-3, 7, 11, 15, 19, 22 in docs/specs/s91-ios-foundation.md). How should they ship?". The option said the spec amendments follow as their own spec PR with Codex's plan challenge.
3. **"Pin 6.2 only"**, at 13:23:54, to "AGENTS.md pins Codex at GPT-6.1 Sol with no fallback, and every Codex seat since PR #52 has stopped and run on GPT-6.2 Sol by your per-PR answer. What should the rules PR say?". The option read: "Update the pin; keep 'a seat with no fallback stops and escalates' as the only rule, with no written stand-in path." Beni passed over the recommended option, which added a stand-in rule.
4. **Beni's own answer**, at 13:23:54, to "Cursor holds the Builder seat and the records/fast-track cold-read seat, both with no fallback (PR #52's rework went to Codex by ruling). What should AGENTS.md give them?": "Use Codex as Builder. Update the rule to clean up and use Cursor when Grok 4.7 Medium is deemed efficient and effective to handle the builder or reviewer seat!"
5. **All four conduct rules**, at 13:23:54, to "Which seat-conduct rules should the rules PR add to AGENTS.md? (Each came from a PR #52-55 process note.)":
   - "No host logs or settings": "A seat never opens the host's own logs, settings or any source its prompt does not name without asking Beni first (PR #52's fresh Pass 1 opened the power log and lock setting)."
   - "Name the check, not the list": "A seat names the private-list check it ran and never writes where the list is kept (PR #52's Pass 2 comment gave its location)."
   - "Review seats write no memory": "Review seats save no memory notes, since memory is a channel between seats the sealed appendix does not cover (PR #52's Pass 2.5 wrote one)."
   - "Read-only unless fixing": "A review seat runs in a read-only mode unless its prompt allows fix commits (PR #55's record observed workspace-write)."
6. **Beni's own answer**, at 13:30:53, to "With Codex as Builder, Codex can't give Pass 2 (adjudicating Pass 1, its own cold read, Pass M) on a PR it built. Who takes Pass 2 on a Codex-built PR?": "Cursor on Grok 4.7 Medium takes Pass 2 on Codex-built PRs only when the PR touches no sensitive path and no engine code, and only after one trial Pass 2 shadowed by a Claude Pass 2 shows it holds up. Otherwise a second fresh Claude session takes Pass 2 (Fable 5.2 Extra on sensitive paths, Opus 5.5 High otherwise)."
7. **"Beni, per PR (Recommended)"**, at 13:30:53, to "Who decides when Cursor on Grok 4.7 Medium is "efficient and effective" enough to take a builder or reviewer seat on a given PR?". The option read: "The PM proposes Cursor for a seat in the build prompt or Pass 0 brief with a one-line reason; Cursor takes it only on your yes, recorded in the brief."
8. **"6.2 Sol High; Extra High hard (Recommended)"**, at 13:30:53, to "What model and effort should the new Codex Builder seat pin, and what fallback?". The option read: "GPT-6.2 Sol High; Extra High for design-heavy or sensitive-path slices, as the Cursor Builder row has it today. Fallback: Cursor on Grok 4.7 Medium, under the 'who decides' rule."
9. **"Keep both (Recommended)"**, at 13:30:53, to "Cursor today also gives the one cold read of records and fast-track PRs on your word, and runs merge logistics on Grok 4.7 Medium. Keep those?". The option read: "Unchanged: Cursor may give a records or fast-track cold read on your word (not on PRs reporting on Cursor-authored work), and runs approved merge and tag commands."
10. **"Findings only; Codex reworks (Recommended)"**, at 14:08:50, to "On a Codex-built PR, Claude takes Pass 1, usually Pass 2, and Pass 2.5, so a Claude fix commit would have no non-Claude cold read. How should fixes work there?". The option read: "Claude review seats on a Codex-built PR commit no fixes. The PM routes findings to Codex as rework, and Claude's later passes cold-read the rework, so every commit gets another vendor's read."
11. **All four skill and records changes**, at 14:08:50, to "Which review-skill and records changes should the rules PR make? (The seat-record rule itself goes in regardless, as you ruled on PR #50.)":
    - "Comment ends with the record": "The comment template puts the two-line retro before the seat record, so the fenced json block is always last."
    - "PM appends ideas rows": "Section 6: the reviewer lists out-of-scope items in its comment; the PM appends them to the ideas file (how PRs #30, #43 and #52 actually ran)."
    - "Merge lines are records": "AGENTS.md says a PR that only fills a review record's README row with its merge line is a records PR (your PR #55 ruling)."
    - "One fix commit per push": "A review seat pushes its fix commits one at a time, so each gets its own CI run."
12. **"PR-number prefix (Recommended)"**, at 14:08:50, to "Rulings are numbered per review record, so PR #52's brief ruling 6 and another record's ruling 6 can be confused. Add a prefix?". The option read: "New rulings are cited as R52.6 (PR number, then ruling number) wherever they are quoted outside their own record. Old records are not renumbered."
13. **"Record stays; prose is short (Recommended)"**, at 14:08:50, to "PR #52's Pass 2.5 comments ran about 42,000 characters, half of it the seat record, against "one short PR comment". What should the rule be?". The option read: "The seat record stays whole in the comment, since elenchus reads it there. The prose above it keeps to one or two lines per finding plus the as-run list; long evidence goes in the record's evidence fields."

The rulings this PR writes down from earlier records:
- the seat-record rulings in `docs/reviews/pr-50-pass-0.md:41` (`grep -n 'Seat records' docs/reviews/pr-50-pass-0.md`);
- Beni's ruling "Records PR (Recommended)" on PR #55, given in the PM's session on 2026-11-22 at 12:35:00 EST, which [PR #55's cold-read comment](https://github.com/BeniCheni/keel/pull/55#issuecomment-7083330456) quotes.

The occasion is the items PR #52's records mark "For the rules PR" (`grep -n 'For the rules PR' docs/reviews/pr-52-pass-1.5.md`). `docs/reviews/pr-52-pass-2.5.md:463` sends them, with the S91 spec amendments, to the rules PR.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `25f4531` docs(agents): Codex builds; seat conduct and seat-record rules | Claude | Codex, Pass 1 |

Any fix commit Codex pushes at Pass 1 gets its cold read from the fresh Claude session at Pass 2.5. Any Claude commit after Pass 1 gets its cold read from Codex at Pass 2.

## Fast-track

Not allowed: `AGENTS.md`, `.claude/skills/**` and `.agents/skills/**` are sensitive paths.

## What to check, beyond the skill's standing checks

Each is a question, not a finding.

1. **Every ruling, and only those.** Does each change trace to a ruling above, to the PR #50 or PR #55 rulings, or to an item PR #52's records send here? Does the diff change a pin, effort, fallback, pass, or gate clause that no ruling covers?
2. **Independence on a Codex-built PR.** Walk one through every pass, with rework after Pass 1, after Pass 2 and after Pass 2.5. Then walk it again with Cursor at Pass 2, both on its trial PR and after. Does every commit get a cold read from a vendor that did not write it? Is any PR left with no eligible seat? Can Pass 2.5's verdict "mergeable after fixes" still apply when Claude seats commit no fixes?
3. **The Cursor seats paragraph.** Is "no engine code" consistent with the sensitive-path list, and does "so Pass M never falls to it" hold? Ruling 10 bars fix commits by Claude seats only. Is it a gap that the rules leave Cursor's fixes at Pass 2 under the skill's ordinary fix policy? The PM read "shadowed by a Claude Pass 2" (ruling 6) to mean that on the trial PR the gate counts the Claude Pass 2. Does that reading fit the ruling?
4. **Pins and dates.** Are the as-of dates in the model-pin paragraph right? Does the records and fast-track cold read keep Grok 4.7 Extra High, as ruling 9's "Unchanged" says? Ruling 3 gives no stand-in rule. Does the Builder's fallback, which needs Beni's word for each PR, agree with it and with "A seat with no fallback stops and escalates"?
5. **Seat conduct.** Do the three conduct bullets and the new sentence in hard rule 1 say what ruling 5 and the fix-commit item in ruling 11 say, and no more? Does "opens nothing its prompt does not name" conflict with any step the skill itself requires? Does "read-only unless its prompt allows fix commits" fit a records cold read?
6. **The seat record.** Do the skill's section 7, step 3, and the comment template carry the PR #50 rulings? Is the fenced block now always last?
7. **The pointer copy and the README.** Do `.agents/skills/keel-pr-review/SKILL.md` and `README.md` agree with `AGENTS.md`? Does any live instruction outside `docs/reviews/**` and `docs/specs/**` still name Cursor as the builder, or GPT-6.1 Sol as Codex's pin?
8. **The changelog line.** Is it accurate, and in the right section of Unreleased?
9. **This PR's own review.** It runs under the `AGENTS.md` on `main` until it merges. Does a merge between passes create a disagreement for a pass that starts after it?
10. **History.** Records under `docs/reviews/**` and `docs/specs/**` keep what they said at the time, and the R-prefix applies only to new citations. Does any change reach into them?

Out of scope: the S91 spec amendments, which go to their own spec PR by ruling 2; elenchus's configuration; and any other rule or procedure. List such findings in your comment, and the PM carries them.

## Sealed appendix: to verify independently

Do your own read before opening this. Everything here is a claim, not a fact. Re-derive each one; report any that do not reproduce.

### Claims, from the PR body at `25f4531`

| # | Claim | Command given |
| --- | --- | --- |
| 1 | Seven files change: `AGENTS.md`, `CHANGELOG.md`, `README.md`, and four skill files | `git diff --name-only origin/main...HEAD` |
| 2 | 7 files, 55 insertions, 30 deletions | `git diff --shortstat origin/main...HEAD` |
| 3 | One commit, Claude's | `git log --format='%an' origin/main..HEAD \| sort \| uniq -c` |
| 4 | Five sensitive paths: `AGENTS.md` and the four skill files | `git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers apps` |
| 5 | The old wording is gone from the live rules | `git grep -n -i -E 'gpt-6\.1\|builder \(cursor\)\|back to cursor\|cursor rework\|rework for cursor\|two other vendors\|Cursor opens' HEAD -- AGENTS.md README.md .claude .agents` prints nothing and exits 1 |
| 6 | `GPT-6.2 Sol` appears 3 times in `AGENTS.md` | `git grep -c 'GPT-6.2 Sol' HEAD -- AGENTS.md` |
| 7 | No dependency or workspace file changes | `git diff --exit-code --stat origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml` |
| 8 | Tables are well formed: `AGENTS.md` 3 tables, 25 rows, 0 bad; `pr-comment.md` 6, 19, 0; `pass-1.5-brief.md` 2, 6, 0 | `python3 -I tablecols.py` over those files, from `docs/reviews/pr-32-pass-2.5.md` |
| 9 | The comment template ends with the seat record | `tail -n 3 .claude/skills/keel-pr-review/pr-comment.md` |
| 10 | Copy lint passes | `node tools/verify/one.mjs copy` |
| 11 | `pnpm verify` is green on Node 24.22.2 and 26.13.0: 12 of 12 steps; core 178, plugin 212, tooling 171 tests | `CI=true pnpm install --frozen-lockfile && pnpm verify`, with `KEEL_DATA_DIR` set to an empty `mktemp -d` |
| 12 | The tripwire finds nothing | `node tools/tripwire/cli.mjs .` |

### PM runs at `25f4531`

In a clone of `main` at `f551559`, on the branch at `25f4531`, with a fresh `mktemp -d` as `KEEL_DATA_DIR` for each Node, `CI=true pnpm install --frozen-lockfile` and `pnpm verify` exited 0 on Node v24.22.2 and v26.13.0, outside the app's command sandbox. Each gave 12 of 12 steps and core 178, plugin 212 and tooling 171 tests. Afterwards `git status --porcelain --untracked-files=all` printed nothing outside `node_modules`, and each data folder held 0 entries. `node tools/tripwire/cli.mjs .` exited 0 and printed nothing, and `node tools/verify/one.mjs copy` exited 0. These ran between 14:20:29 and 14:21:25 EST. Under Beni's ruling "Cut to pointers" on PR #48, the per-class counts, the body scan and the private-list check are the reviewer's.
