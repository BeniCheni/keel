# Pass 0 brief: PR #24 (idea 33: when Cursor may give a cold read, and PR #23's merge record)

Written by the PM on 2026-11-07 (America/New_York). The same Claude session wrote every commit on this branch and this brief.

## Seats

This PR touches `AGENTS.md` and `.agents/skills/**`, both sensitive paths, so fast-track is barred, the Fable 5.1 pins apply to the Claude seats, and Beni merges it.

- **Pass 1:** Codex, GPT-6.1 Sol Extra High, because a Claude session wrote every line. If the chat reaches that model only through a sub-agent, the sub-agent gets the whole prompt word for word, does all the reading and running, and the comment says so. No fallback: if the model is unavailable, stop and escalate.
- **Pass 1.5:** the PM.
- **Pass 2:** Codex, on any Claude-authored commit pushed after Pass 1. If there is none, Pass 2 has nothing to read, and the brief at Pass 1.5 says so.
- **Pass 2.5:** a fresh Claude session on Fable 5.1 High, fallback Opus 5.5 High, on synthetic data only, which also gives the cold read of any Codex-authored commit.

Cursor gives no pass here: this PR changes what Cursor may do, so it has a stake.

## Scope

- Rule changes: the last sentence of line 11 in `.agents/skills/keel-pr-review/SKILL.md`, and the Builder row of `AGENTS.md`'s seat table, its model pin and its "Does" cell.
- Records: idea 33 moves from the ranked table of `docs/v0.1.0-ideas.md` to "Taken up or ruled out"; `docs/README.md` gets a row for PR #23; `docs/reviews/pr-23-pass-0.md` gets a section on the merge; and this brief.
- Command: `git diff --name-only origin/main...HEAD`.
- Release: no. New dependencies: none. Bootstrap path: no. `verify` applies through CI. Mutations and Pass M do not apply, because no code or fixture changes.

## Ruling

On 2026-11-07, Beni chose "Yes, on your word (Recommended)" on the PM's question "Idea 33: may Cursor give a records or fast-track cold read on a PR it wrote none of?". The question noted that Cursor's copy of the review skill says "Cursor never reviews", that `AGENTS.md` allows any vendor that wrote none of the commits, and that he had seated Cursor that way on PRs #14, #15, #16, #19, #22 and #23. He gave it in the PM's session, so the reviewers cannot see it, and his merge confirms it.

The same day he confirmed, "Yes, 0 hits", that the private-list scan he ran before merging PR #23 printed `total hits: 0`. The merge section added to `pr-23-pass-0.md` rests on that.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| Every commit on the branch, this brief's included | Claude | Codex, Pass 1 |

## Fast-track

Not allowed: the diff touches sensitive paths.

## What to check, beyond the skill's standing checks

1. **The ruling as written.** Do the two rule edits say what Beni ruled, and no more? Cursor gives the one cold read of a records or fast-track PR it wrote none of, on Beni's word, and no review pass on a PR it built.
2. **The independence rules.** Does the new text open any path that `AGENTS.md`'s independence rules close? Consider a records PR that records Cursor's own build, and a fast-track PR about a slice Cursor built. Should the rule say so, or is "on Beni's word" enough?
3. **Consistency.** Does any other rule file still contradict the new text? Check `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**` and `.agents/skills/**` (`git grep -n -i cursor -- AGENTS.md CLAUDE.md .claude .agents`).
4. **The model pin.** The Builder row now pins Extra High for cold reads, as Cursor ran on PRs #19, #22 and #23. `AGENTS.md` says its pins are as of 2026-10-29. Should that date move?
5. **The records.** Check the `docs/README.md` row and the merge section against `gh pr view 23 --repo BeniCheni/keel --json mergeCommit,mergedAt,headRefOid`, the PR #23 comments, and `git rev-parse b58e2df^{tree} 04403b0^{tree}`. Check that idea 33's outcome row matches the ruling, and that no other idea row changed.
6. **Privacy.** Run the owner's private-list check, counts only, over the diff, every commit message, the PR title and body, every comment, and your own proposed comment. Read `~/.config/keel/private-terms.txt` for this and nothing else, check first that it is readable, make a failed scan exit nonzero, and never print a term or a matched value.
