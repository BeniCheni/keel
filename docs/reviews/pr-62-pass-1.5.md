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
| F2 | Medium | accept | Reproduced, above. S04's `storePath` returns `data-dir-relative` for a relative value (`docs/specs/s04-closes-store.md`, its location table). | Step 3 requires an absolute path (`case "$KEEL_DATA_DIR" in /*) ;; *) false ;; esac`) before it exports. It refuses a relative value rather than making it absolute, so a seat's `TMPDIR` is never rewritten. |

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

## After Pass 2

Written by the PM on 2026-11-28 (America/New_York), after Codex's Pass 2 ([issuecomment-7241031474](https://github.com/BeniCheni/keel/pull/62#issuecomment-7241031474), posted at 09:54:40 EST), which read `48a8f2f72bfdf313b5fb64dd3c34009ce577b65a` and added `4734b326e6de338d5576090d29adc5c5aec932a8`. Where this addendum differs from the text above, it wins.

Pass 2's verdict is "mergeable after fixes". It reproduced F1 and F2 on `6c34b76` and found both fixed at `48a8f2f`. Under ruling 1, below, it closed F1 with its own regression commit, `4734b32`: `tools/acceptance/test/review-data-dir-guard.test.mjs` reads step 3's guard from the skill and runs six cases in bash and six in zsh, and Pass 2 reports that a copy of the old guard fails eight of them. It found three Mediums, F3 to F5, and one Low, F6. Its seat record validates against `schema/seat-record-1.1.json`, with six finding ids, and GitHub lists no edit to the comment (`userContentEdits` gives a `totalCount` of 0). All six hosted checks passed at `4734b32`.

The PM reproduced F3 to F6 with Pass 2's own commands and accepts all four. They are fixed in one Claude commit, the one that adds this section (`git log -1 --format='%h %an' -- docs/reviews/pr-62-pass-1.5.md`). F3 and F4 sit in the guard the PM wrote at `48a8f2f`. F5 sits in both of the PM's briefs and in the PM's Pass 2 prompt, which named the same function.

| # | Severity | PM disposition | Reason | Answer |
| --- | --- | --- | --- | --- |
| F3 | Medium | accept | Reproduced. With a synthetic folder holding only a file named by a newline, and `mktemp` stubbed to print that folder and return 0, the guard at `48a8f2f` reaches the next command in bash and zsh. The command substitution strips `ls -A`'s whole output, which is two newlines. | Step 3 lists with `ls -Aq`, which prints every non-printing character as `?`, so any entry leaves at least one visible character. In both shells the case now exits 1 before the next command, and so does a folder holding a file named by a space. |
| F4 | Medium | accept | Reproduced. With `KEEL_DATA_DIR` already exported, the plain assignment keeps the export attribute, so `ls` and every command before the final `export` see the new path in their environment, in bash and zsh. The skill said it was exported only after the checks. | Step 3 starts with `unset KEEL_DATA_DIR keel_entries`, which drops the attribute. Pass 2's `ls` stub now leaves no marker in either shell, and a read-only `KEEL_DATA_DIR` makes `unset` fail, so the guard exits 1. |
| F5 | Medium | accept | Reproduced. Both briefs named S04's function `resolveDataDir`; S04's spec names it `storePath` (`docs/specs/s04-closes-store.md`, its file table and "Where the store lives"). The error codes the briefs cite are right. | Both briefs now name `storePath`, and so does the skill's explanation. Outside this section the old name is gone: `git grep -n resolveDataDir` prints only lines of this section. |
| F6 | Low | accept | Reproduced. The index row said the PM fixed both of Pass 1's findings, but F1 closed only with Codex's test in `4734b32`. | The row credits the PM's fix and Codex's test, and names the re-read and Pass 2.5 next. The PR body's Review log does the same. |

### Rulings from Beni

The first ruling recorded for this PR. Cite it outside this record as R62.1.

1. **"No"**, to Pass 2's stop question, "Does the tracked Pass 1.5 probe table satisfy that requirement for closing F1? Yes / No", where the requirement is `AGENTS.md`'s rule that a High in tracked files closes only with a fix commit carrying a test that fails without it. Beni brought the question to the PM's session at 08:14:15 EST, the PM drafted the answer at 08:15:32 EST, and Beni pasted it into Codex's session, which made it his word. It asked Pass 2 to add that test as one Codex commit, shown failing against `6c34b76`'s guard and passing at its own commit, and to say that Pass 2.5 still owes its cold read.

### Authorship record, extended

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `4734b32` test(tooling): the guard's regression test | Codex | Claude, Pass 2.5 |
| The commit that adds this section, with F3 to F6's fixes | Claude | Codex, Pass 2's re-read |

### Process notes

- **The PM missed the closing rule.** The Pass 1.5 brief offered a probe table for F1, which nothing runs, so F1 could not close on it under `AGENTS.md`. The brief should have asked Pass 2 for the test. Ruling 1 did that after the fact.
- **A sub-agent.** Pass 2 ran in a fresh Codex sub-agent on GPT-6.2 Sol Extra High. Its record gives model and effort observed `null`, "not reported", and mode observed `workspace-write`, as requested.
- **Paths.** Pass 2 names every path it opened outside its clone: the owner's private list, its own temporary folders and their guarded data folders, and the installed Node runners. All are within its prompt.
- **Length.** Pass 2's comment is 13,914 characters, with its seat record last.

### Carried, not fixed here

- **`set -a`.** In a shell with `allexport` on, every assignment exports, so the new path is in the environment before the checks run. The guard still stops on a failed check. The seats' shells do not set it, and step 3 does not guard against it.
- **Linux, and the Claude Code and Cursor shell wrappers.** Still unverified, as Pass 2 says.

### What Pass 2's re-read does

Codex, on GPT-6.2 Sol Extra High, in a fresh clone:

1. Give the PM's commit its cold read (`git diff 4734b32 HEAD`). Does it fix F3 to F6 and change nothing else?
2. Say with a command whether each of F3 to F6 closes at the head. Confirm that F1 and F2 stand as Pass 2 left them.
3. Add F3's and F4's cases to `review-data-dir-guard.test.mjs` in one Codex commit, shown failing against `4734b32`'s guard and passing at the head. Pass 2.5 gives that commit its cold read with `4734b32`.
4. Read this addendum's account of Pass 2, and the PM's body edit against GitHub's edit history.

Pass M stays N/A, and demo mode stays N/A under idea 50.

### Sealed appendix for Pass 2's re-read

Pass 2's findings and the PM's fixes are suspicions to re-derive, not conclusions.

| # | Claim (as the PM stated it) | Command the PM gave |
| --- | --- | --- |
| 1 | In bash and zsh, F3's newline-named entry and a space-named entry each make the guard exit 1 before the next command; at `4734b32` the newline case reaches it | F3's setup from Pass 2's record, with the guard read by `sed -n 21p .claude/skills/keel-pr-review/SKILL.md \| sed -e 's/^   .//' -e 's/.$//'` at each ref |
| 2 | With `KEEL_DATA_DIR=synthetic` exported first, Pass 2's `ls` stub leaves no marker at the head in either shell, and leaves one at `4734b32` | F4's setup from Pass 2's record |
| 3 | A read-only `KEEL_DATA_DIR` makes the guard exit 1 in both shells | `bash -c 'readonly KEEL_DATA_DIR=/x; <guard>; echo reached'`, and the same in `zsh` |
| 4 | Codex's regression test passes all twelve cases at the head on both pinned Nodes | `pnpm test:tooling -- review-data-dir-guard.test.mjs` |
| 5 | Only this section names `resolveDataDir`, in F5's row and this claim | `git grep -n resolveDataDir` |
