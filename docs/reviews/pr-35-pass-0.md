# Pass 0 brief: PR #35 (move the Fable pins to Fable 5.2)

Written by the PM on 2026-11-11 (America/New_York), from a fresh read of the PR at `20da0de081ef72d1033136c582204f55daeed434`. This brief lives on branch `docs/pr-35-records`, not on the PR branch. When it was written, PR #35 had no comment (`gh api repos/BeniCheni/keel/issues/35/comments --jq length` printed `0`).

This PM session wrote the PR's one commit and this brief. It takes no review pass on this PR.

## Seat for Pass 1

Codex, because a Claude session wrote the PR. GPT-6.1 Sol Extra High, because `AGENTS.md` is a sensitive path. No fallback: if that model is unavailable, stop and escalate. If the chat reaches the model only through a sub-agent, that sub-agent gets the whole prompt word for word and does all the reading and running, and the comment says so.

Later seats: Pass 1.5 is the PM. Pass 2 is Codex, covering any Claude-authored commit after Pass 1. Pass 2.5 is a fresh Claude session on Fable 5.2 High, by ruling 1 below, with fallback Opus 5.5 High; it gives the cold read of any Codex-authored commit. Beni merges. The PR is a draft and must be marked ready before it can merge.

## Scope

- Spec: none. The change carries out Beni's rulings below. Design brief: none.
- Sensitive paths touched: `AGENTS.md`. The other file, `CHANGELOG.md`, is not a sensitive path (`git diff --name-only origin/main...HEAD`).
- Release: no. No version, lockfile or README change.
- New dependencies: none. `git diff --exit-code --stat origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml` exits 0.
- Bootstrap path: no. Install and `verify` apply. Mutations are N/A: no code, test or fixture changes, so there is no tested claim to mutate. Pass M is N/A: no engine or golden fixture. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.
- Diff: 2 files, 6 insertions, 5 deletions (`git diff --shortstat origin/main...HEAD`).
- Base: `origin/main` at `58845e2`, the PR #33 squash (`git merge-base origin/main HEAD`).
- CI: no check had reported when this brief was written. Read it from GitHub at your head.

## Rulings every seat carries

1. **Fable 5.2 for every Fable seat, Beni, 2026-11-11 at 17:39 EST, in the PM's session, standing.** His words: "Correction: Fable 5.2 is the current latest version from Claude. We're using that for the Pass 1 prompt and future prompts when Fable is desired."
2. **This PR, Beni, 2026-11-11 at 18:52 EST, in the PM's session.** He answered "Yes, open it" to "Shall I open the AGENTS.md PR moving the Fable pins to 5.2?".

The occasion: PR #34's Pass 2 stopped on the mismatch today, before running anything. The review skill tells Pass 2 to "confirm the Claude seats used the Fable pin or declared the fallback", and `AGENTS.md` named Fable 5.1. PR #34's briefs carry ruling 1 as their ruling 3.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `20da0de` docs(agents): move the Fable pins to Fable 5.2 | Claude | Codex, Pass 1 |

Any fix commit Codex pushes at Pass 1 gets its cold read from the fresh Claude session at Pass 2.5. Any Claude commit after Pass 1 gets its cold read from Codex at Pass 2.

## Fast-track

Not allowed: `AGENTS.md` is a sensitive path.

## What to check, beyond the skill's standing checks

Each is a question, not a finding.

1. **Every pin, and only the pins.** Does the diff move every Fable 5.1 pin in the files that set seats: `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**`, `.agents/skills/**` and the README? Does it change anything else a seat reads, such as a fallback, an effort or Codex's pin?
2. **The two generic sentences.** "Fable pins apply" and "Fable seats work only on synthetic data in a fresh clone" no longer name a version. Do they still bind exactly the seats they bound before? Is any reading looser than the old text?
3. **The pin date line.** "Model pins are as of 2026-10-29, except the Builder cold-read effort, which is as of 2026-11-07, and the Fable pins, which are as of 2026-11-11." Is each date true, and does the sentence still read correctly?
4. **The changelog line.** Is it accurate, and in the right section of Unreleased?
5. **In-flight reviews.** PR #34's seats run under ruling 1 through its briefs. Does merging this create any new disagreement for a seat already under way, or for one that starts after the merge?
6. **Anything that still names Fable 5.1 as current.** Historical records under `docs/reviews/**` and `docs/specs/**` should keep what they said at the time. Is there a live instruction outside them that still names Fable 5.1?

Out of scope: moving any other pin or fallback, and any change to the review skill's procedure. List such findings in your comment, and the PM carries them.

## Sealed appendix: to verify independently

Do your own read before opening this. Everything here is a claim, not a fact. Re-derive each one; report any that do not reproduce.

### Claims, from the PR body at `20da0de`

| # | Claim | Command given |
| --- | --- | --- |
| 1 | 2 files change, 6 insertions, 5 deletions | `git diff --shortstat origin/main...HEAD` |
| 2 | `AGENTS.md` has 4 lines naming Fable 5.1 on `origin/main` and none at the head | `git grep -c 'Fable 5\.1' origin/main -- AGENTS.md`; the same at `HEAD` prints nothing and exits 1 |
| 3 | 2 lines name Fable 5.2 at the head, the two seat rows | `git grep -n 'Fable 5\.2' HEAD -- AGENTS.md` |
| 4 | No changed line names Codex's pin, and both changed seat rows keep the fallback Opus 5.5 High | `git diff -U0 origin/main...HEAD -- AGENTS.md \| grep -E '^[-+]' \| grep -c 'GPT-6.1'` prints `0`; the same with `'Opus 5.5 High'` and `^\+` prints `2` |
| 5 | No dependency or workspace file changes | `git diff --exit-code --stat origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml` |
| 6 | `pnpm verify` is green on Node 24.22.2 and 26.13.0, eight steps ok, core 154 and tooling 122 tests | `pnpm install --frozen-lockfile && pnpm verify`, in a fresh clone with `KEEL_DATA_DIR="$(mktemp -d)"` |
| 7 | The tripwire finds nothing | `node tools/tripwire/cli.mjs .` |
| 8 | The review skill needs no change: its one Fable line names no version | `git grep -n 'Fable' HEAD -- .claude .agents` |

### PM runs at `20da0de`

In a fresh clone of the branch with a fresh `mktemp -d` as `KEEL_DATA_DIR`, `pnpm install --frozen-lockfile` and `pnpm verify` exited 0 on Node v24.22.2 and v26.13.0. Each printed eight step lines ending in ` ok`, with core 154 and tooling 122 tests, and `git status --porcelain --untracked-files=all` was empty afterward. `node tools/tripwire/cli.mjs .` exited 0 and printed nothing. The PR body passed the tripwire's `scanRepo` in a temporary repository: no error and 0 hits, and a generated address added to the same repository gave exactly 1 email hit.
