# Pass 0 brief: PR #62 (idea 97: guard the review skill's data folder setup)

Written by the PM on 2026-11-27 (America/New_York), from a fresh read of the PR at `059dbd78716f36af06f4b3e44d0ea2c55c630230`. When it was written, PR #62 was a draft with no comment (`gh api repos/BeniCheni/keel/issues/62/comments --jq length` printed `0`).

This PM session wrote the PR's commits and this brief. It takes no review pass on this PR.

## Seat for Pass 1

Codex, because a Claude session wrote the PR. `AGENTS.md` pins GPT-6.2 Sol, at Extra High here because `.claude/skills/**` is a sensitive path. It has no fallback, and a prompt cannot loosen the pin. If the seat is not running GPT-6.2 Sol, it stops after reading `AGENTS.md` and asks Beni in one word.

## Seat for Pass 2

Codex, under the same pin, giving the cold read of any Claude-authored commit after Pass 1. Pass 1.5 is the PM. Pass 2.5 is a fresh Claude session, not the PM, on Fable 5.2 High with fallback Opus 5.5 High; it gives the cold read of any Codex-authored commit. Beni merges.

## Scope

- Spec: none. The change carries out idea 97 (`docs/v0.1.0-ideas.md`, before this PR) under Beni's ruling R60.2, below. Design brief: none.
- Sensitive paths touched: `.claude/skills/keel-pr-review/SKILL.md` (`git diff --name-only origin/main...HEAD -- .claude .agents AGENTS.md CLAUDE.md`). `.agents/skills/keel-pr-review/SKILL.md` only points to it and holds no setup step (`grep -c KEEL_DATA_DIR .agents/skills/keel-pr-review/SKILL.md` prints `0`), so it is unchanged.
- Release: no. No version or lockfile change.
- New dependencies: none. `git diff --exit-code --stat origin/main...HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml` exits 0.
- Bootstrap path: no. Install and `verify` apply. Mutations are N/A: no code, test or fixture changes. Pass M is N/A: no engine or golden fixture. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.
- Base: `origin/main` at `0f26c2d`, the PR #61 squash (`git merge-base origin/main HEAD`).
- CI: read it from GitHub at your head.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`. Every commit needs a cold read from a vendor that did not author it.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `059dbd7`, the skill fix and the ideas move | Claude | Codex, Pass 1 |
| The commit that adds this brief and its `docs/README.md` row (`git log --diff-filter=A -1 --format='%h %an' -- docs/reviews/pr-62-pass-0.md`) | Claude | Codex, Pass 1 |

## Fast-track

Not allowed. `.claude/skills/**` is a sensitive path, and `AGENTS.md` bars fast-track there. Under Beni's ruling of 2026-11-22 on risk tiers, which `AGENTS.md` does not yet hold, a sensitive-path PR gets the full review.

## Beni's rulings

- **R60.2, "Fix first (Recommended)"**, given on 2026-11-25 at 16:35 EST, to whether idea 97's skill fix lands in its own sensitive-path PR before the S04 build starts. `docs/reviews/pr-60-pass-1.5.md` records it, and S04's spec quotes it under Dependencies. The PM writes that PR after PR #60 merges, before the build prompt.

## What to check, beyond the skill's standing checks

1. **The guard fails closed.** Does `export KEEL_DATA_DIR="$(mktemp -d "${TMPDIR:-/tmp}/keel-data.XXXXXX")" && test -d "$KEEL_DATA_DIR" || exit` stop on every way `mktemp` can fail (an unwritable or missing `$TMPDIR`, an unset `TMPDIR` with an unwritable `/tmp`), in `zsh` and `bash`, and does it reach the next command when the folder is made? Is any failure left where `KEEL_DATA_DIR` holds a path that is not an empty directory?
2. **The template.** Does `${TMPDIR:-/tmp}` behave the same on macOS, where `TMPDIR` is normally set, and on Linux, where it is often unset? Does a `TMPDIR` with a trailing slash matter?
3. **`|| exit` in a seat's shell.** In the shells the seats run (Codex's, Claude Code's, Cursor's), does `exit` end only that invocation, as the seat prompts assume, and is the step's sentence ("go no further") clear about what a seat does next?
4. **Every shell invocation.** The step now says to run the export in every shell invocation, as the seat prompts do, since a seat's shell may not keep state between calls. Is that consistent with the rest of the skill and with `pr-comment.md`'s line "`KEEL_DATA_DIR` pointed at an empty temp directory"?
5. **Other unguarded forms.** Does any other file under `.claude/skills/**`, `.agents/skills/**`, `AGENTS.md` or `CLAUDE.md` set `KEEL_DATA_DIR` or make a data folder without the guard? (`.github/workflows/verify.yml:97` makes a work folder with `mktemp -d` under `set -e`; say whether that is in scope.)
6. **S04's contract.** Does the guarded form give S04's `storePath` a value it accepts (absolute, defined, non-empty), and never one that falls back to the default folder?
7. **The ideas move.** Is idea 97's row under "Taken up or ruled out" true to the change, and is the ranked table otherwise unchanged?

Out of scope: any other idea, and any change to `AGENTS.md`. Findings there go in the comment for the PM to carry.

## Sealed appendix: PM claims to verify independently

These are claims, not facts. Re-derive each one; report any that do not reproduce. The PR body's claims table holds the PM's runs.

| # | Claim (as the PM stated it) | Command the PM gave |
| --- | --- | --- |
| 1 | The old form goes on with an empty value | `( export KEEL_DATA_DIR="$(mktemp -d /nonexistent-dir/x.XXXXXX 2>/dev/null)"; echo "[$KEEL_DATA_DIR]" ); echo $?` |
| 2 | The new form stops with exit 1 when `mktemp` fails | The PR body's "The new form stops" row |
| 3 | The new form makes an empty folder inside the app's command sandbox | The PR body's `$TMPDIR` row, run inside the PM's sandbox |
| 4 | Nothing outside docs reads `KEEL_DATA_DIR` yet | `git grep -n KEEL_DATA_DIR -- ':!docs' ':!*.md'` |
| 5 | Only the ideas move and the skill line change in `059dbd7` | `git show --stat 059dbd7` |
| 6 | `pnpm verify` exits 0 | `pnpm install --frozen-lockfile && pnpm verify` on Node 24.22.2 and 26.13.0 |
