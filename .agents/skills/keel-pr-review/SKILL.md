---
name: keel-pr-review
description: "Run one pass of the keel six-pass review on a pull request. The procedure lives in .claude/skills/keel-pr-review/SKILL.md; this copy points Codex and Cursor to it so there is one source of truth."
disable-model-invocation: true
---

# /keel-pr-review (pointer)

Follow `.claude/skills/keel-pr-review/SKILL.md` exactly, with its templates in the same folder. `AGENTS.md` owns every rule the procedure applies.

Codex runs Pass 2 on every code PR, and Pass 1 on any PR a Claude session wrote (that Pass 1 includes the plan challenge on specs). Cursor never reviews; it runs merge logistics only on Beni's word.
