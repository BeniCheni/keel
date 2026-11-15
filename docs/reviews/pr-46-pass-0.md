# Pass 0 brief: PR #46 (the Pass 2.5 seat is a fresh Claude session, not the PM)

Written by the PM on 2026-11-15 (America/New_York), from a fresh read of the PR at `783abe138f655033b6660d0ac58fe0bc47490bea`. This brief lives on branch `docs/pr-46-records`, not on the PR branch. When it was written, PR #46 had no comment (`gh api repos/BeniCheni/keel/issues/46 --jq .comments` printed `0`).

This PM session wrote the PR's one commit and this brief. It takes no review pass on this PR.

## Seat for Pass 1

Codex, because a Claude session wrote the PR. GPT-6.1 Sol Extra High, because `AGENTS.md` and `.claude/skills/**` are sensitive paths. No fallback: if that model is unavailable, stop and escalate. If the chat reaches the model only through a sub-agent, that sub-agent gets the whole prompt word for word and does all the reading and running, and the comment says so.

Later seats: Pass 1.5 is the PM. Pass 2 is Codex, covering any Claude-authored commit after Pass 1. Pass 2.5 is a fresh Claude session, not the PM, on Fable 5.2 High with fallback Opus 5.5 High; it gives the cold read of any Codex-authored commit. That is the seat as this PR names it, and as every Pass 2.5 since PR #32 has run. Beni merges. The PR is a draft and must be marked ready before it can merge.

## Scope

- Spec: none. The change carries out Beni's ruling below. Design brief: none.
- Sensitive paths touched: `AGENTS.md` and `.claude/skills/keel-pr-review/SKILL.md`. The third file, `CHANGELOG.md`, is not a sensitive path (`git diff --name-only origin/main...HEAD`).
- Release: no. No version, lockfile or README change.
- New dependencies: none. `git diff --exit-code --stat origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml` exits 0.
- Bootstrap path: no. Install and `verify` apply. Mutations are N/A: no code, test or fixture changes, so there is no tested claim to mutate. Pass M is N/A: no engine or golden fixture. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.
- Diff: 3 files, 5 insertions, 4 deletions (`git diff --shortstat origin/main...HEAD`).
- Base: `origin/main` at `79839c3`, the PR #45 squash (`git merge-base origin/main HEAD`).
- CI: the PM did not read CI before writing this brief. Read it from GitHub at your head. (Corrected on 2026-11-15 in records PR #47, after Codex's cold read. This line first said no check had reported when the brief was written, which the PM had not checked: at the brief's commit, 18:07:03Z, three of run 43744794467's four matrix cells had completed, and the fourth cell and the aggregate `verify` check completed at 18:07:08Z and 18:07:24Z.)

## Rulings every seat carries

Both came from Beni on 2026-11-15, in the PM's session, which no seat can open. The PM quotes the question each answered. If a verdict turns on either, ask Beni in one word.

1. **"Fresh Claude, not PM".** The question: "Which should the Pass 2.5 seat be?", with the options "Fresh Claude, not PM" and "PM, fresh session". The PM had laid out the three places that say "a fresh Claude session" and the three that say "the PM", and recommended the first.
2. **"Yes, start it".** The question: "Start the AGENTS.md PR for the Pass 2.5 seat name?".

The occasion: PR #38's Pass 2.5 finding 6 (`grep -n -E '^\| *6 *\|' docs/reviews/pr-38-pass-2.5.md`), raised again as PR #43's Pass 2.5 finding 3 (`grep -n -E '^\| *3 *\|' docs/reviews/pr-43-pass-2.5.md`). Both records route it to an `AGENTS.md` PR.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `783abe1` docs(agents): the Pass 2.5 seat is a fresh Claude session, not the PM | Claude | Codex, Pass 1 |

Any fix commit Codex pushes at Pass 1 gets its cold read from the fresh Claude session at Pass 2.5. Any Claude commit after Pass 1 gets its cold read from Codex at Pass 2.

## Fast-track

Not allowed: `AGENTS.md` and `.claude/skills/**` are sensitive paths.

## What to check, beyond the skill's standing checks

Each is a question, not a finding.

1. **Every name for the seat, and only those.** Does every live instruction now name the Pass 2.5 seat one way: `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**`, `.agents/skills/**` and the README? Does the diff change anything else a seat reads, such as a pin, a fallback, an effort, the pass order or the merge gate?
2. **The Planner row.** It drops "2.5 briefs, executive briefs" for "the Pass 2.5 seat's prompt". Does any live instruction rely on the PM writing an executive brief? Workflow step 2's "Executive Handoff Brief" for the design cycle names no seat; does dropping "executive briefs" from the Planner row leave it with none? Do the records under `docs/reviews/` show the PM writing the Pass 2.5 seat's prompt?
3. **Who may run Pass 2.5.** Does "not the PM" bar a session that every Pass 2.5 since PR #32 would have allowed? Does it leave any PR with no eligible Pass 2.5 seat, including a PR the PM wrote? Does it agree with `CLAUDE.md`'s "You are the PM unless a prompt seats you elsewhere"?
4. **The changelog line.** Is it accurate, and in the right section of Unreleased?
5. **This PR's own Pass 2.5.** It will run under the new wording whether or not the PR has merged. Does that create a disagreement for it, or for any review that starts after the merge?
6. **History.** Records under `docs/reviews/**` and `docs/specs/**` keep what they said at the time. Is there a live instruction outside them that still calls Pass 2.5 the PM?

Out of scope: any other rule, pin or skill procedure, including idea 72's review log for records PRs. List such findings in your comment, and the PM carries them.

## Sealed appendix: to verify independently

Do your own read before opening this. Everything here is a claim, not a fact. Re-derive each one; report any that do not reproduce.

### Claims, from the PR body at `783abe1`

| # | Claim | Command given |
| --- | --- | --- |
| 1 | Three files change: the Claude skill, `AGENTS.md`, `CHANGELOG.md` | `git diff --name-only origin/main...HEAD` |
| 2 | 3 files, 5 insertions, 4 deletions | `git diff --shortstat origin/main...HEAD` |
| 3 | One commit, Claude's | `git log --format='%an' origin/main..HEAD \| sort \| uniq -c` |
| 4 | The old wording is gone from the rules and skills | `git grep -c -E 'PM, fresh session\|PM in a fresh session\|2\.5 briefs, executive briefs' HEAD -- AGENTS.md .claude .agents` prints nothing and exits 1 |
| 5 | The new wording is in both tables and the skill | `git grep -c 'fresh session, not the PM' HEAD -- AGENTS.md .claude` prints 2 for `AGENTS.md` and 1 for the skill |
| 6 | No dependency or workspace file changes | `git diff --exit-code --stat origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml` |
| 7 | Tables are well formed: `AGENTS.md` 3 tables, 23 rows, 0 bad | `python3 -I tablecols.py AGENTS.md CHANGELOG.md .claude/skills/keel-pr-review/SKILL.md`, from `docs/reviews/pr-32-pass-2.5.md` |
| 8 | Copy lint passes | `node tools/verify/one.mjs copy` |
| 9 | `pnpm verify` is green on Node 24.22.2 and 26.13.0: core 178, plugin 212, tooling 126 tests | `pnpm install --frozen-lockfile && pnpm verify`, in a fresh clone with `KEEL_DATA_DIR="$(mktemp -d)"` |
| 10 | The tripwire finds nothing, and the body scans clean with a planted control caught | `node tools/tripwire/cli.mjs .`; `scanRepo` per class |

### PM runs at `783abe1`

In a clone of `main` at `79839c3`, on the branch at `783abe1`, with a fresh `mktemp -d` as `KEEL_DATA_DIR`, `pnpm install --frozen-lockfile` and `pnpm verify` exited 0 on Node v24.22.2 and v26.13.0, each with core 178, plugin 212 and tooling 126 tests, and `git status --porcelain --untracked-files=all` was empty afterward. `node tools/tripwire/cli.mjs .` exited 0 and printed nothing, and `scanRepo` gave 0 in each of its ten classes. The PR body and title passed `scanRepo` in a temporary repository with the clone's two policy files: 0 hits, and a planted check-digit-valid token gave exactly 1 `cusip` hit.
