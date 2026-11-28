# Pass 1.5 brief: PR #62 (idea 97: guard the review skill's data folder setup)

Written by the PM on 2026-11-27 (America/New_York), after reading Codex's Pass 1 comment, [7234277986](https://github.com/BeniCheni/keel/pull/62#issuecomment-7234277986), at head `6c34b76e82c9a02d72f61c547d19f171132d1564`. Pass 1 found one High and one Medium, committed nothing and did not edit the PR body. The Pass 2 seat, Codex on GPT-6.2 Sol Extra High, receives this brief.

## How this brief adjudicated

Every disposition rests on a run in this session, in bash and zsh on macOS, inside the app's command sandbox, in folders under the sandbox's `$TMPDIR`. "Old" is step 3's guard at `6c34b76`, "new" the guard at this brief's commit, read from line 21 of the skill. A synthetic non-empty folder, `full`, held one empty file. Each case ran `<setup>; <guard>; echo reached` in a child shell.

| Case (setup) | Old, bash and zsh | New, bash and zsh |
| --- | --- | --- |
| A writable absolute `TMPDIR` | reached, with an empty `keel-data.*` folder | reached, with an empty `keel-data.*` folder, exported (`env \| grep -c '^KEEL_DATA_DIR=/'` prints `1`) |
| `mktemp` stubbed to print `full` and return 1 (F1) | reached, with `KEEL_DATA_DIR` set to `full` | exit 1, not reached |
| `mktemp` stubbed to print `full` and return 0 | reached | exit 1, not reached: the folder is not empty |
| A writable relative `TMPDIR=relative` (F2) | reached, with `relative/keel-data.*` | exit 1, not reached |
| A missing `TMPDIR` | exit 1 | exit 1 |
| `mktemp` stubbed to print nothing and return 0 | exit 1 | exit 1 |
| An absolute `TMPDIR` with a trailing slash | reached | reached |

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Fixed by |
| --- | --- | --- | --- | --- |
| F1 | High | accept | Reproduced, above: `export` returns 0 whatever the substitution returned, so `test -d` was the only check, and an existing folder passed it. | Step 3 assigns `KEEL_DATA_DIR` without `export`, so the assignment carries `mktemp`'s exit status, then requires an empty folder (`ls -A`, captured the same way so a failed `ls` stops it too), and exports only after every check. |
| F2 | Medium | accept | Reproduced, above. S04's `resolveDataDir` returns `data-dir-relative` for a relative value (`docs/specs/s04-closes-store.md`, its location table). | Step 3 requires an absolute path (`case "$KEEL_DATA_DIR" in /*) ;; *) false ;; esac`) before it exports. It refuses a relative value rather than making it absolute, so a seat's `TMPDIR` is never rewritten. |

Idea 97's row under "Taken up or ruled out" said the PR used "the guard the seat prompts already use". Pass 1's answer to the brief's question 7 noted that it needed F1's correction: the seat prompts' guard has F1's flaw too. The row now states what step 3 does.

## Carried, not fixed here

- **The seat prompts' guard.** Every PM-written seat prompt to date, including this PR's Pass 1 prompt, uses `export KEEL_DATA_DIR="$(mktemp -d)" && test -d "$KEEL_DATA_DIR" || exit`, which has F1's flaw. Prompts live in chat and in receipts, not in the repo, so no file here changes. From this brief on, the PM's prompts use step 3's guard.
- **Linux, and the Claude Code and Cursor shell wrappers.** Pass 1 and this brief ran bash and zsh on macOS only. The Pass 2 seat runs what it can and says what it could not.

## Authorship record

The Pass 0 record, extended with every fix commit since. Every commit needs a cold read from a vendor that did not author it.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `059dbd7`, the skill fix and the ideas move | Claude | Codex, Pass 1 |
| `6c34b76`, the Pass 0 brief and its `docs/README.md` row | Claude | Codex, Pass 1 |
| The commit that adds this brief, with F1's and F2's fix (`git log --diff-filter=A -1 --format='%h %an' -- docs/reviews/pr-62-pass-1.5.md`) | Claude | Codex, Pass 2 |

## Rulings from Beni

None since the Pass 0 brief. R60.2 and the risk-tier ruling still govern.

## Sealed appendix for Pass 2

Pass 1's findings and this brief's fixes are suspicions to re-derive, not conclusions. Reproduce or disprove each one independently, and add your own read.

| # | Claim (as the PM stated it) | Command the PM gave |
| --- | --- | --- |
| 1 | The new guard stops in every F1 and F2 case above, in bash and zsh, and reaches the next command on the absolute and trailing-slash cases | The table above, with the guard taken from line 21 of `.claude/skills/keel-pr-review/SKILL.md` (``sed -n 21p .claude/skills/keel-pr-review/SKILL.md \| sed -e 's/^   `//' -e 's/`$//'``) |
| 2 | On success the value is exported, absolute and an empty folder | `env \| grep -c '^KEEL_DATA_DIR=/'`; `ls -A "$KEEL_DATA_DIR" \| wc -l` |
| 3 | A plain assignment from a failed command substitution returns that command's status in bash and zsh; `export` with one does not | `bash -c 'x="$(false)"; echo $?; export y="$(false)"; echo $?'`, and the same in `zsh` |
| 4 | Idea 97's row no longer claims the seat prompts' guard | `grep -c 'seat prompts already use' docs/v0.1.0-ideas.md` prints `0` |
