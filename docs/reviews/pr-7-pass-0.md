# Pass 0 brief: PR #7 (housekeeping: rules, trailers, ADRs, S00.1 spec)

Written by the PM on 2026-10-31 (America/New_York), from a fresh read of the PR at `a0db3bb`. The same Claude session wrote the PR and this brief, so Pass 1 is the only cold read of the content; this brief steers it and seals nothing.

## Seat for Pass 1

Codex, because a Claude session wrote every line. Model GPT-6.1 Sol Extra High (sensitive-path PR). No fallback.

## Scope

- Spec: adds `docs/specs/s00.1-tooling-hardening.md`; this PR is its plan challenge.
- Sensitive paths touched: `AGENTS.md`, `.claude/skills/keel-pr-review/SKILL.md`, `.claude/skills/keel-pr-review/executive-brief.md`.
- Release: no. New dependencies: none.
- Bootstrap path: no. `verify` runs as a required check.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `a0db3bb` housekeeping | Claude (PM) | Codex, Pass 1 |
| this brief | Claude (PM) | Codex, Pass 1 |
| any Codex fix commit | Codex | fresh Claude session before merge |

## Fast-track

Not allowed: sensitive paths are touched.

## What to check, beyond the skill's standing checks

1. The new `main` rule and the records-PR rule in `AGENTS.md`: are they consistent with the seat table, the authorship rule, the merge gate, fast-track and the skill? Can a records PR carry anything other than records, and can it end up with a commit no non-author vendor ever read?
2. The trailer rule: does the handoff block's new text leave any path where a trailer is filled at merge time?
3. ADR-0001 to 0008: each faithful to `AGENTS.md` and the specs, none promising behaviour the specs do not, none carrying personal data or figures.
4. S00.1 plan challenge: can every acceptance criterion fail; is AC2 (concurrent load, recorded in the PR body) evidence or theatre; does the vendor-address exemption reopen the gap the allowlist scope closes; is the slice one coherent unit?
5. The ideas-file and index edits: does each moved idea land where the table says?
