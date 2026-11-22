# Pass 0 brief: PR #54 (docs after PR #53)

Written by the PM on 2026-11-21 (America/New_York), from a fresh read of the branch at `ebcca8c`, before this brief and its index row were added. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Codex, GPT-6.2 Sol High, by Beni's ruling "Allow 6.2 for PR #54 (Recommended)", given in the PM's session on 2026-11-21 at about 21:13 EST. GPT-6.2 Sol High stands in for the `AGENTS.md` pin, GPT-6.1 Sol, on this PR's cold review and any re-read, as on PRs #52 and #53, and the rules PR updates the pin. The PR touches no sensitive path, so the High effort applies. `AGENTS.md` asks for one cold review by a vendor that did not write the PR, and a Claude session wrote every line. The PR carries items from PR #52's review, which has commits by Cursor, Claude and Codex (`gh api repos/BeniCheni/keel/pulls/52/commits --paginate --jq '.[].commit.author.name' | sort | uniq -c` prints `4 Claude`, `16 Codex` and `1 Cursor`). `AGENTS.md` bars Cursor from the cold read of a records or fast-track PR that reports on a PR with a Cursor-authored commit, and names no such bar for Codex.

## Scope

- Spec: none amended. Design brief: none.
- Sensitive paths touched: none. `git diff --name-only origin/main...HEAD -- packages tools schemas fixtures .github AGENTS.md CLAUDE.md .claude .agents docs/providers apps` prints nothing.
- Release: no. New dependencies: none.
- Bootstrap path: no. `verify` applies. Mutations and Pass M are N/A: no code, test or fixture changes. Demo mode is N/A while the README has no demo step (`grep -c -i demo README.md` prints `0`), the known gap of idea 50.
- Files: `docs/v0.1.0-ideas.md` (ideas 80 to 90 and 92), `docs/README.md` (this PR's row), and this brief.

## Where each item comes from

PR #52's records name the ideas rows and send them to the next docs PR: `docs/reviews/pr-52-pass-2.5.md:462` lists D1, D2, D4, B16, B17, C9, E6, E7, E8 and the signing note, and the Pass 1.5 brief's known gaps add `tools/test-tooling.mjs` and the fresh Pass 1's two notes (`docs/reviews/pr-52-pass-1.5.md:118-123`, `:366-371` and `:484-485`). Ruling 9 (`:429`) has the PM append them. The records merged since PR #49 are PR #50's and PR #52's (`git diff --name-only 5069a34 origin/main -- docs/reviews`).

| Item | In this PR |
| --- | --- |
| D1, D2 and D4, carried by ruling 12 | Ideas 80, 81 and 82 |
| B16 and B17, Pass 1's Lows | Ideas 83 and 84 |
| C9, the fresh Pass 1's Low | Idea 85 |
| E6 and E7, carried by ruling 20 | Ideas 86 and 87 |
| E8, carried by ruling 24 | Idea 88 |
| The signing note for `Local.xcconfig` | Idea 89 |
| `tools/test-tooling.mjs`'s entry guard, from C6 | Idea 90 |
| The fresh Pass 1's note that a failed recovery removes the pair | Not carried. It described the store at `95730ba`. At the head a recovery that fails keeps the rollback copies it has not yet restored, with the files it has restored, and the next read resumes from them (`apps/ios/KeelCoreHost/Sources/KeelCoreHost/SnapshotStore.swift:65-72` and `:129-160`). Recovery removes the pair only when one of its files is missing or a seal does not read back exact (`:139-142` and `:169-172`), as rulings 2 and 7 give. Rank 91 is left unused |
| The fresh Pass 1's note that the framework rule reads only `.framework/` rows | Folded into idea 80, which D1 ran |
| Pass 2.5's note that PR #52's body keeps `819433e`'s numbers (`docs/reviews/pr-52-pass-2.5.md:69`) | Idea 92 |
| The spec amendments for rulings 1 to 3, 7, 11, 15, 19 and 22, and the items marked for the rules PR | Not here: `docs/reviews/pr-52-pass-2.5.md:463` sends them to the rules PR |

The CHANGELOG is unchanged. Its Unreleased section records no slice build after S00 (`grep -n -E 'S0[1-3]|S9[01]' CHANGELOG.md` prints only lines 11 and 14, which list specs), so S91 has no line to add.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`. A commit that adds or changes this brief cannot name itself, so its row gives the command that finds it.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `ebcca8c` | Claude | Codex |
| The commit that adds this brief and its index row (`git log --diff-filter=A -1 --format='%h %an' -- docs/reviews/pr-54-pass-0.md`) | Claude | Codex |
| `2f2e59e`, which answers the cold review | Claude | Codex |
| The commit that answers the re-read (`git log -1 --format='%h %an' -- docs/reviews/pr-54-pass-0.md`) | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or a numbering fork. One cold review by Codex replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **The ideas.** Does each of ideas 80 to 90 and 92 state its finding fairly, against the record line it cites and the review comment behind it, with every file and line number right at the head? Do they continue the numbering from 79, and does each say whether a fix would touch a sensitive path? Is any already a row, or already taken up?
2. **Coverage.** Does the table above match PR #52's records? Is anything those records send to the ideas rows missing, or anything here that they send elsewhere?
3. **The index row.** Is this PR's row in `docs/README.md` in the form PR #49's row had while it was in review?
4. **Privacy.** This seat runs the owner's private-list check, counts only, over the diff, the commit messages, the PR title and body, every comment and its own proposed comment.

Out of scope: any change to code, tests, fixtures, schemas, `AGENTS.md` or the skills. Findings there go in the comment for the PM to carry.

## After the cold review

Corrected on 2026-11-21, after Codex's cold review ([issuecomment-7073117214](https://github.com/BeniCheni/keel/pull/54#issuecomment-7073117214)) found six Mediums. Ideas 81, 82, 89 and 92 now match the code and records they cite (F1, F2, F3 and F5). Idea 91 is removed and its rank left unused, because the store it described changed before PR #52 merged (F4). The PR body's rank-count row now gives its command (F6).

Corrected again on 2026-11-22, after Codex's re-read ([issuecomment-7073867814](https://github.com/BeniCheni/keel/pull/54#issuecomment-7073867814)) found three Mediums. Idea 82 now says a quote inside a backslash escape does not split the literal (F7). The idea 91 row now says which rollback copies a failed recovery keeps, and that a missing file also removes the pair (F8). The PR body's rank-count command now reads the grouped ranks in the taken-up table (F9). The third authorship row now names `2f2e59e`, because its command would find the newest commit to change this brief.
