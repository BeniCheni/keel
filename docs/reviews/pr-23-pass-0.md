# Pass 0 brief: PR #23 (S90 results, ADR-0009 accepted, and the records of PRs #21 and #22)

Written by the PM on 2026-11-06 (America/New_York). The same Claude session wrote every commit on this branch and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Codex, GPT-6.1 Sol High. If the chat reaches that model only through a sub-agent, the sub-agent gets the whole prompt word for word, does all the reading and running, and the comment says so. The seat has no fallback: if the model is unavailable, stop and escalate.

Codex is the only eligible vendor. Claude wrote every line. Cursor built the spike whose results this PR states, so it has a stake. Codex gave Pass 2 on PR #21, and the results and records summarize that pass, so it says so wherever its read concerns its own earlier work.

## Scope

- Spec: `docs/specs/s90-ios-core-spike.md`, untouched (`git diff --exit-code origin/main...HEAD -- docs/specs/s90-ios-core-spike.md` exits 0). Its decision rule and thresholds govern the results.
- Files: the new results file `docs/specs/s90-ios-core-spike-results.md`; ADR-0009's status, Core section and "Revisit when" list; ideas 41 to 47 in `docs/v0.1.0-ideas.md`; rows in `docs/README.md`; two corrections in `docs/reviews/pr-22-pass-0.md`; and the PR #21 records, which are `pr-21-pass-0.md`, `pr-21-pass-1.5.md`, `pr-21-pass-2.5.md`, `pr-21-device-records.txt` and `pr-21-device-extra.txt`, with this brief. Command: `git diff --name-only origin/main...HEAD`.
- Sensitive paths touched: none.
- Release: no. New dependencies: none.
- Bootstrap path: no. `verify` applies through CI. Mutations and Pass M do not apply, because no code or fixture changes.
- Not a records PR: it touches `docs/specs/`, `docs/adr/` and the ideas note, so it is an ordinary docs PR.

## Ruling

On 2026-11-06, after reading a draft of the results, Beni ruled "Rule Path A", on the PM's question "Rule Path A for the iOS companion's core, as the rule selects?". He gave it in the PM's session, so Codex cannot see it, and Beni's merge confirms it. His earlier rulings on the spike are in `pr-21-pass-0.md`, `pr-21-pass-1.5.md` and `pr-21-pass-2.5.md`, which records his first-hand confirmation of them.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| Every commit on the branch, this brief's included | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or numbering fork. One cold review by a vendor that wrote none of the PR replaces Passes 1 to 2.5. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **The results' figures.** Does each reproduce with the command given, at `0c06924` or from the record files copied out of this branch? Are Beni's device numbers labelled as his run, and every reading labelled as a reading?
2. **The rule as applied.** Does the clause table follow the decision rule's text, including its edge cases? Is "not a close call" right? Is anything claimed for Path A that the spike did not measure?
3. **Disclosures.** Do the results say everything the spec asks them to say: that Q2's amendment is not pre-registered, how the device run differed from the plan, and what a pass does not prove? Check them against the three PR #21 briefs and the PR #21 comments.
4. **ADR-0009.** Does the Core section say only what the results show? Is anything else in the ADR changed besides the status line and the first item under "Revisit when"?
5. **The Pass 2.5 record.** The PM recorded it from Beni's paste of the review chat, restoring its formatting. Compare it with [issuecomment-6670022832](https://github.com/BeniCheni/keel/pull/21#issuecomment-6670022832) for anything that disagrees.
6. **The PR #22 corrections** against Cursor's [issuecomment-6641890050](https://github.com/BeniCheni/keel/pull/22#issuecomment-6641890050), and the `docs/README.md` rows against `gh pr view 21 --repo BeniCheni/keel` and `gh pr view 22 --repo BeniCheni/keel`.
7. **Ideas 41 to 47.** Does each trace to its source, and does none read as a scope commitment?
8. **Privacy.** Run the owner's private-list check, counts only, over the diff, every commit message, the PR title and body, every comment on this PR, and your own proposed comment. Beni ruled on 2026-11-06 that the Pass 2.5 brief and comment on PR #21 get this check here, since Codex's count on PR #21 came before them, so cover issuecomment-6670022832 too. Read `~/.config/keel/private-terms.txt` for this and nothing else, check first that it is readable, make a failed scan exit nonzero, and never print a term or a matched value. Confirm the two device record files hold only `KEEL_SPIKE v1` lines and `#` notes.
