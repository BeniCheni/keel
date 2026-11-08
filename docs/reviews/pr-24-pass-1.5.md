# Pass 1.5 brief: PR #24 (idea 33 and PR #23's merge record)

Written by the PM on 2026-11-07 (America/New_York), after reading Pass 1's comment ([issuecomment-6713033857](https://github.com/BeniCheni/keel/pull/24#issuecomment-6713033857)) and Beni's ruling below. Pass 1 reviewed `c8b1f59` and left the head at `b43c412fa8dc0fb4f00f1d5893cc28a1e4cfc3d5`, with CI run 42414074520 `success` on that SHA (`gh run view 42414074520 --repo BeniCheni/keel --json headSha,conclusion`). The PM then pushed the fix for finding 1 and this brief. Codex receives it for Pass 2.

Pass 1 was Cursor on Grok 4.7 Extra High, by Beni's word. Cursor first stopped before cloning because it read its effort as High. Beni then confirmed Extra High from the picker, and the comment says so. GitHub lists the comment under `BeniCheni`, because Cursor's `gh` runs as Beni. The comment's header names the seat.

## Seat for Pass 2

Codex, GPT-6.1 Sol Extra High, as `AGENTS.md` pins for a sensitive-path PR. The seat has no fallback: if that model is unavailable, stop and escalate. If the chat reaches the model only through a sub-agent, that sub-agent gets the whole prompt word for word and does all the reading and running, and the comment says so.

## Per finding

| Pass 1 # | Severity | PM disposition | Reason | Rework for Cursor? |
| --- | --- | --- | --- | --- |
| 1 | Medium | Accept | Pass 0's item 2 asked this, and Pass 1 answered it against Cursor's own interest. The text let Cursor give the only cold read of a records or fast-track PR about its own build, which `AGENTS.md` line 26 closes. PR #23 was that case: it recorded PR #21, where `ff4fc35`, `27a877b` and `27c802c` are Cursor's (`gh pr view 21 --repo BeniCheni/keel --json commits`). Beni ruled to bar it (below). Fixed in `66a98da`: the skill line, the Builder row and idea 33's outcome row. Cursor's read of PR #23 stays his one-off ruling. Closed pending Codex's cold read of `66a98da` | No |
| 2 | Medium | Accept | The pin sentence dated every pin 2026-10-29, while this PR added the cold-read effort. A stale date in docs is Medium. Fixed in `fa105d9`, which dates that effort alone. Closed pending Codex's cold read | No |
| 3 | Low | Accept | Reproduced in a fresh clone: `git rev-parse '04403b0^{tree}'` exits 128, and after `git fetch origin pull/23/head`, `git rev-parse 'b58e2df^{tree}' '04403b087b3174e4d09d263c56546bff55cae292^{tree}'` prints `38074eb1df9a3968328167d9aa87b017f793b577` twice. The PM's own check had fetched the head by SHA first, and the paragraph left that step out. Fixed in `b43c412`. Closed pending Codex's cold read | No |

Pass 1's answers to the brief's six items are accepted. One line in its header needs a note: it says the Fable 5.1 Extra Pass 1 seat did not run. That seat never applies here. `AGENTS.md` gives Pass 1 on a Claude-authored PR to Codex, and Beni moved it to Cursor.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `d2e6e3a` docs: let Cursor give records and fast-track cold reads on Beni's word | Claude | Cursor, Pass 1 (done), and Codex, Pass 2 |
| `c8b1f59` docs(reviews): move PR #24's Pass 1 to Cursor | Claude | Cursor, Pass 1 (done), and Codex, Pass 2 |
| `fa105d9` docs: date the Builder cold-read effort as 2026-11-07 | Cursor | Codex, Pass 2 |
| `b43c412` docs(reviews): make PR #23's tree check re-runnable | Cursor | Codex, Pass 2 |
| `66a98da` docs: bar Cursor's cold read of records about its own build | Claude | Codex, Pass 2 |
| This brief's commit | Claude | Codex, Pass 2 |
| Any fix commit Codex pushes | Codex | The fresh Claude session, Pass 2.5 |

## Rulings from Beni

The ruling in the Pass 0 brief stands, along with his word moving Pass 1 to Cursor. One more, on 2026-11-07, on the PM's question "Cursor's Pass 1 on PR #24 leaves you one ruling. May Cursor give the only cold read of a records or fast-track PR about a PR Cursor built? PR #23 was that case: it recorded Cursor's spike PR #21. AGENTS.md says no vendor gives the only cold read of its own work.":

> No, bar it (Recommended)

The option he chose read: "The skill and the Builder row add: no cold read of a records or fast-track PR that records a PR Cursor wrote any commit of. Codex takes those. Cursor's read of PR #23 stays a one-off ruling of yours, dated 2026-11-07." He gave it in the PM's session, so the reviewers cannot see it, and his merge confirms it.

## What Pass 2 does

Beyond the skill's standing checks and its Pass 2 extras:

1. **Cold read of `fa105d9`, `b43c412`, `66a98da` and this brief.** Does `66a98da` say what Beni ruled, and no more? Can a reader decide by command whether a given records or fast-track PR is barred? Do "records or reports on" cover both a records PR of `docs/reviews/pr-<N>-*` files and a results PR like PR #23? Is the pin sentence in `fa105d9` true, and does the fetch in `b43c412` work from a fresh clone?
2. **Adjudicate findings 1 to 3**, each with your own command.
3. **The bar's reach to Codex.** The bar rests on "no vendor gives the only cold read of its own work". PR #21 also has a Codex commit, `0c06924`. Does the same reasoning bar Codex from giving the only cold read of records about a PR it wrote a commit on? Codex has a stake here, as Cursor did at Pass 1. Report it, judged against `AGENTS.md`'s independence rules, and do not widen the rule: that is Beni's call.
4. **Your own read** of the whole PR, against the Pass 0 brief's items 1 to 5. Cursor had a stake in this PR, so read its rule text as if Pass 1 had not run.
5. **The private-list check.** Counts only, over the diff at the head, every commit message on the branch, the PR title and body, every PR comment, Pass 1's included, and your own proposed comment. Read `~/.config/keel/private-terms.txt` for this and nothing else. Check first that it is readable, exit nonzero if the scan fails, and never print a term or a matched value.

Pass M and mutations do not apply: no code or fixture changes. Post one PR comment, then stop.

## Sealed appendix for Pass 2

Do your own read before opening this. Pass 1's findings and fixes are suspicions to re-derive, not conclusions. Reproduce or disprove each one independently.

### Pass 1's claims

| # | Claim | Command Pass 1 gave |
| --- | --- | --- |
| 1 | At `c8b1f59`, `AGENTS.md` still said every pin was as of 2026-10-29 while the Builder row added "and for cold reads" | `git show c8b1f59:AGENTS.md` |
| 2 | In a fresh clone, `git rev-parse '04403b0^{tree}'` exits 128; after `git fetch origin pull/23/head`, the squash and the reviewed head print `38074eb1df9a3968328167d9aa87b017f793b577` twice | Those commands, and `gh api repos/BeniCheni/keel/commits/04403b087b3174e4d09d263c56546bff55cae292 --jq .commit.tree.sha` |
| 3 | No rule file says Cursor never reviews | `git grep -n -i 'never reviews' -- AGENTS.md CLAUDE.md .claude .agents`, exit 1 |
| 4 | Only idea 33's rows changed in the ideas file | `git diff origin/main...c8b1f59 -- docs/v0.1.0-ideas.md` |
| 5 | The tripwire found 0 in every class over the repo, the PR text and the comments | `node tools/tripwire/cli.mjs .` |
| 6 | `pnpm verify` exits 0 on Node 24.22.2 and 26.13.0 before and after the fixes, and CI run 42414074520 succeeded on `b43c412` | `pnpm install --frozen-lockfile && pnpm verify`; `gh run watch 42414074520 --exit-status` |

### PM checks at `b43c412`, 2026-11-07

| Command | Result |
| --- | --- |
| In a fresh clone, `git rev-parse 'b58e2df^{tree}' '04403b0^{tree}'` | Exit 128 |
| `git fetch origin pull/23/head`, then `git rev-parse 'b58e2df^{tree}' '04403b087b3174e4d09d263c56546bff55cae292^{tree}'` | Exit 0 and `38074eb1df9a3968328167d9aa87b017f793b577` twice |
| `gh run view 42414074520 --repo BeniCheni/keel --json headSha,conclusion,event` | `b43c412fa8dc0fb4f00f1d5893cc28a1e4cfc3d5`, `pull_request`, `success` |
| `gh pr view 21 --repo BeniCheni/keel --json commits` | Cursor `ff4fc35`, `27a877b`, `27c802c`; Claude `14b0308`, `d0c9fc3`; Codex `0c06924` |
