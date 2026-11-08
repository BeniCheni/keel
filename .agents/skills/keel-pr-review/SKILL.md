---
name: keel-pr-review
description: "Run one pass of the keel six-pass review on a pull request. The procedure lives in .claude/skills/keel-pr-review/SKILL.md; this copy points Codex and Cursor to it so there is one source of truth."
disable-model-invocation: true
---

# /keel-pr-review (pointer)

Follow `.claude/skills/keel-pr-review/SKILL.md` exactly, with its templates in the same folder. `AGENTS.md` owns every rule the procedure applies.

Codex runs Pass 2 on every code PR, and Pass 1 on any PR a Claude session wrote (that Pass 1 includes the plan challenge on specs). Codex never gives the cold read of a commit Codex wrote; the fresh Claude session at Pass 2.5 covers those. Cursor gives no review pass on a PR it built. On Beni's word, it gives the one cold read on a records or fast-track PR that it wrote none of, unless that PR records or reports on a PR with any Cursor-authored commit (check each with `gh pr view <N> --json commits`). No vendor gives the only cold read of its own work, so Codex takes those; if Codex is not eligible either, stop and escalate. It runs merge logistics only on Beni's word.
