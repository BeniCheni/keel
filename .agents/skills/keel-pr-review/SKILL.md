---
name: keel-pr-review
description: "Run one pass of the keel six-pass review on a pull request. The procedure lives in .claude/skills/keel-pr-review/SKILL.md; this copy points Codex and Cursor to it so there is one source of truth."
disable-model-invocation: true
---

# /keel-pr-review (pointer)

Follow `.claude/skills/keel-pr-review/SKILL.md` exactly, with its templates in the same folder. `AGENTS.md` owns every rule the procedure applies.

Codex builds slices. It runs Pass 2 on every code PR it did not build, and Pass 1 on any PR a Claude session wrote (that Pass 1 includes the plan challenge on specs). Codex never gives the cold read of a commit Codex wrote and gives no review pass on a PR it built: on a Codex-built PR, Claude sessions take Pass 1, Pass 2 and Pass 2.5, or Cursor takes Pass 2 where `AGENTS.md` (Cursor seats) allows it, and Codex reworks their findings. Cursor takes a builder or Pass 2 seat only on Beni's word for that PR, and gives no review pass on a PR it built. On Beni's word, it gives the one cold read on a records or fast-track PR that it wrote none of, unless that PR records or reports on a PR with any Cursor-authored commit (check each with `gh pr view <N> --json commits`). Otherwise, since no vendor gives the only cold read of its own work, a vendor that wrote none of that records or fast-track PR's commits takes it, Codex or a fresh Claude session; if neither is eligible, stop and escalate. Cursor runs merge logistics only on Beni's word.
