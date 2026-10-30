# Executive brief: PR #1, Pass 2.5, 2026-10-30 America/New_York

Every number below comes from a command run in this session, in a fresh clone of `docs/scaffold` at head `97ac4dc83016f7e5a1d09d66a669e7818ed2da5e` (taken from `gh pr view 1 --json headRefOid` and matched to `git rev-parse HEAD`). A number taken from a PR body or comment is labelled as that vendor's claim. Seat: Claude, fresh session, Fable 5.1 High (sensitive-path pin); fallback not used. `KEEL_DATA_DIR` pointed at an empty `mktemp -d` directory (0 entries); no user data folder and no private pattern file was opened.

## Decision

Shadow mode: the gate says **"would escalate"**, because the PR touches sensitive paths and `verify` cannot run on the bootstrap path, so two gate clauses cannot hold even though every finding is closed and nothing is contested; Beni merges.

Review verdict on the content itself: mergeable. No open High, no new finding above Low from this seat's cold read of the three Codex-authored commits.

## What ships

- The rules file every agent works under: seats and model pins, hard rules, sensitive paths, the merge gate in shadow mode until `v0.1.0`, severity and escalation.
- The six-pass review procedure as a skill, with its PR comment, executive brief, Pass 0 and Pass 1.5 templates, and a pointer copy for Codex and Cursor.
- Specs for S00 (repo tooling: `pnpm verify`, PII tripwire, zero-network boundary, determinism check, copy lint, import boundary, CI) and S01 (terms schema 0.1 and strict loader), both revised after the plan challenge.
- README, DISCLAIMER, SECURITY, CHANGELOG, `.gitignore`, the docs index, and the Pass 0 (retroactive) and Pass 1.5 records for this PR.
- What it still declines to claim: no product code, no tests, no CI, and no product runtime check has run. Product runtime checks are N/A until S00 lands; the static checks below were run.

## What the passes found

- Pass 1 (Codex, at `cea220f`, fixes to `68b5670`): 18 findings. 1 High: private search terms in the original PR body's claims row (fixed in metadata; history deletion owner-confirmed, ruling 7). 15 Medium: seat routing when Codex fixes a PR (2), fast-track gaps (3), squash-vs-head post-merge check (4), no bootstrap path and no Pass 0 brief (5), S00 negative checks and the red-commit conflict (6), tripwire scope (7), zero-network interception (8), `git diff --exit-code` misses staged/untracked (9), S00/S01 interface gaps (10), S01 field contract (11), `primary` not bound to a primary source (12), summary underdetermined (13), relative path escape (14), `design/` ignore too broad (15), DCO recorded second-hand (16). 2 Low: "no findings is a finding" (17), README used a banned whole word (18, fixed in `68b5670`).
- Pass 1.5 (PM): all 18 accepted, 7 and 8 accepted with a narrower fix; rulings 1 to 7 recorded; fixes in `cceb3c8` and `6bbd7de`.
- Pass 2 (Codex, at `6bbd7de`, scope `68b5670..6bbd7de`): all 18 Pass 1 findings accepted as resolved. Own findings: P2-A Medium (PR body claim 1 still fail-open; fixed in metadata), P2-B Medium (allowlist file flags its own CUSIPs; proposal), P2-C Medium (determinism example treats a failed `git status` as clean; proposal). Pass M: N/A, no engine. Codex independently derived the S01 frozen summaries (7/16 and 15/16) and matched them.
- Pass 1.5 addendum: rulings 8 and 9 approved P2-B and P2-C; applied in `454eaad`.
- Pass 2 scoped re-read (Codex, `cf82f7c..454eaad`): P2-B and P2-C resolved. P2-D Medium: the new determinism examples assign zsh's read-only `status`; fixed in `97ac4dc`.
- Pass 2.5 cold read of the Codex-authored commits (this seat):
  - `68b5670` (README copy): one sentence, "what you hold" became "your instruments". Whole-word scan of README at the parent and at the commit: 1 then 0 (`git show 68b5670^:README.md | grep -ciwE 'should|buy|sell|hold'` and the same at `68b5670`). The sentence stays accurate and the disclaimer paragraph is untouched. No finding.
  - `cf82f7c` (ideas candidates): two ranked rows restating P2-B and P2-C as pending owner rulings, which is what skill section 10 directs when a change is not ruled in. `454eaad` removed them after rulings 8 and 9; `git diff cf82f7c^ HEAD -- docs/v0.1.0-ideas.md` is empty (0 lines), so the commit's net effect at head is nil. No personal data, no product copy. No finding.
  - `97ac4dc` (determinism examples): reproduced P2-D first: the `454eaad` example exits 1 in zsh with "read-only variable: status" and 0 in `sh`. The `97ac4dc` example, run with a stub `pnpm` in temporary Git repositories, exits 0 on a clean tree, 1 on a tracked edit, a deletion, a staged change, an untracked new file and a dirty second tree whose name contains a space, 0 when the dirt is outside a registered tree, 128 outside any Git repository, and 128 when the registry prints an empty line (Git rejects the empty pathspec), in both zsh and `sh` (`/bin/sh` here is bash 3.2 in POSIX mode). The table cell in `executive-brief.md` equals the `SKILL.md` command once its `\|` escapes are unescaped. AGENTS.md line 66 and S00 scope 6 state the same contract. No finding. Observation only: the sentence after the command, "Each `&&` keeps a failed command, Git included, from reading as clean", now relies on `|| exit` inside the loop plus the assignment's exit status rather than on `&&` alone; the effect it describes holds.
- Pass 2.5 corroboration of earlier findings, re-checked at head:
  - 1 / P2-A: hard rule 1 carries the privacy-command rule; the live PR body's claim 1 has `test -r` before the scan and exits 2 on a failed scan; claim 2 is counts-only. Claim 2 run here: 0, exit 0.
  - 2 / 18: authorship below from `git log --format='%h %an' origin/main..HEAD`; this seat read only the Codex commits.
  - 3, 4, 5: fast-track paragraph, Releases post-merge check, bootstrap paragraph and the High-outside-tracked-files clause all present in AGENTS.md; `docs/reviews/pr-1-pass-0.md` exists and is labelled retroactive.
  - 9 / P2-C / P2-D: probes above.
  - 13: S01 summaries derived from the spec's status table and path list by my own script (`derive_s01.py`, scratchpad): `example-autocall.yaml` 7 verified of 16 with the 9 unverified paths in the frozen order; `minimal.yaml` 15 of 16 with `dates.observation_schedule` only. Both equal the frozen JSON.
  - 15: `git check-ignore -v design/probe.pen docs/design/probe.md` reports only `.gitignore:9:/design/ design/probe.pen`.
  - 16, 17: hard rule 10 carries the DCO ruling; skill section 8 permits an empty findings list.
  - P2-B: S00 line 30 (allowlist validated first, in-file exemption for valid entry values only), AC3 line 52 and the mutation floor line 62 carry ruling 8.
- Contested: none. Every Pass 1 and Pass 2 finding is accepted by both vendors.
- New from this seat: **Low**, `docs/reviews/pr-1-pass-1.5.md` lines 34 to 39: the authorship record ends at "PM commit applying rulings 8 and 9" (now `454eaad`) and does not list `97ac4dc` (Codex, cold read by Pass 2.5). AGENTS.md says the Pass 1.5 brief extends the record with fix commits. The file is Claude-authored, so this seat does not push a fix; the complete record is in the shadow gate log below for Beni to confirm (question 2).

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | N/A: no `package.json` or lockfile (`test -e package.json` false) |
| Verify | `pnpm verify` (Node floor and current) | N/A: no manifest, no runner, no workflow (`test -e .github/workflows` false) |
| Determinism | `pnpm fixtures:regen && sh -c '...'` as in the template | N/A as a product check (no registry); the command's shape was probed with a stub `pnpm` as recorded above |
| Zero network | | N/A: no code, no test setup, no CI namespace |
| Mutations | | N/A: no suite |
| Pass M | `python3 tools/reference/payoff.py fixtures/golden/` | N/A: `tools/reference/payoff.py` and `fixtures/golden` absent |
| UI matrix | | N/A: no UI |
| Head SHA | `gh pr view 1 --json headRefOid`; `git rev-parse HEAD` | both `97ac4dc83016f7e5a1d09d66a669e7818ed2da5e`; PR open, draft; `statusCheckRollup` length 0 |
| Diff | `git diff --shortstat origin/main...HEAD` | 20 files changed, 929 insertions, 0 deletions (base `origin/main` = `262f119`) |
| File inventory | `git diff --name-status origin/main...HEAD`; `git ls-files \| wc -l` | 20 added, 0 modified or deleted; 21 tracked files at head |
| Whitespace | `git diff --check origin/main...HEAD` | clean, exit 0 |
| Honesty tests | `git diff origin/main...HEAD -- '*.honesty.test.ts' \| wc -l` | 0 lines (none exist yet) |
| Copy rule | `grep -niwE 'should\|buy\|sell\|hold' README.md DISCLAIMER.md` | 0 hits (exit 1); README disclaimer sentence present (1) |
| Local-only ignore | `git check-ignore -v design/probe.pen docs/design/probe.md` | only `design/probe.pen` ignored, by `.gitignore:9:/design/` |
| S01 frozen summaries | `python3 -I derive_s01.py docs/specs/s01-terms-schema.md` | 7/16 and 15/16 derived; both equal the frozen JSON; exit 0 |
| Authorship record | `git log --format='%h %an' origin/main..HEAD` | 8 commits: 5 Claude, 3 Codex (table below) |
| PR claim 2 | the body's counts-only command | prints 0, exit 0 |
| PR claim 3 | the body's `python3 -c "import yaml..."` | fails: PyYAML not installed; Ruby alternative parses 2 frontmatters with `name` and `disable-model-invocation` asserted |
| PR claim 4 | `grep -rni vigil --exclude-dir=.git .` | 0 hits (exit 1) |
| Structural privacy sweep | `python3 -I privacy_counts.py` (scratchpad; counts only, no value printed) | 21 tracked files, 0 unscannable, 8 commit messages, PR body plus 4 comments: CUSIP check-digit-valid 0, account 0, SSN 0, street address 0, non-noreply email 0, price-candidate files 0 |
| Clone state | `git status --porcelain --untracked-files=all \| wc -l` | 0 |

Not re-run, and why:

- PR claim 1, the owner's private-list check: not re-run by this seat. Fable seats work only on synthetic data and never open `~/.config/keel/private-terms.txt`. It rests on Codex's counts-only sweeps (0 hits in Pass 2 and the re-read) and Beni's confirmation in ruling 7.
- Deletion of the leaked PR body revision from the edit history: owner-confirmed (ruling 7), not verifiable through the API.
- PR claim 3 as written: PyYAML is absent and no dependency was installed; the Ruby parse is the evidence.

## Estimates and model output

None. No figure in this PR comes from a model or an assumption.

## Risks and accepted costs

- No product runtime exists. Both specs are reviewed as plans; every acceptance criterion, mutation floor and CI behaviour is a promise for the S00 and S01 builds, not a checked result.
- The tripwire is a heuristic backstop by design. The owner's private-list check and human review cover names and private facts; no clean scan here is proof of absence.
- The zero-network boundary is authoritative only in the Linux CI namespace; macOS cells get the weaker in-process layer.
- Pass 0 was written after Pass 1 and sealed nothing; Pass 1 read the claims straight from the PR body.
- The original leak lived in PR metadata, so its closure is a remediation check plus Beni's confirmation, not a test.
- Rulings 1 to 9 are recorded by the PM second-hand in `docs/reviews/pr-1-pass-1.5.md`; question 1 asks Beni to confirm them in his own words.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | yes |
| Verdict mergeable, every High closed | yes: the one High (Pass 1 finding 1, PR metadata) closed by recorded before-and-after body checks plus Beni's confirmation (ruling 7) |
| Nothing contested | yes |
| `verify` green at tip; every number re-run | no: `verify` is N/A on the bootstrap path, so this clause cannot hold; every number this seat reports was re-run at head |
| No sensitive path, dependency or schema change | no: `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**`, `.agents/skills/**` touched; no dependency; no schema (none exists) |
| Every commit cold-read by a non-author vendor (authorship record) | yes, see below |
| Gate verdict | would escalate |
| Beni's decision (filled after) | merged by Beni 2026-10-30 as squash commit `8b316f32f1c128e3194b1b4ac398e717e551ec16` on base `262f119`; post-merge checks re-run from the fresh clone: `origin/main` equals the recorded merge commit, and its tree equals the reviewed head's tree; both `Co-authored-by` trailers present. Ruled 2026-10-30 in chat ("Yes!" to questions 1, 2 and 3); rulings 1 to 9 confirmed as given; the Low on the authorship record closed by this table standing as the Pass 1.5 extension |

Authorship record at head (`git log --format='%h %an' origin/main..HEAD`):

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| `cd1df4d` scaffold | Claude | Codex, Pass 1 |
| `cea220f` S00 `verify` check | Claude | Codex, Pass 1 |
| `68b5670` README copy | Codex | Claude, this Pass 2.5 |
| `cceb3c8` Pass 0 and 1.5 briefs | Claude | Codex, Pass 2 |
| `6bbd7de` Pass 1.5 rulings applied | Claude | Codex, Pass 2 |
| `cf82f7c` ideas candidates | Codex | Claude, this Pass 2.5 |
| `454eaad` rulings 8 and 9 applied | Claude | Codex, scoped re-read |
| `97ac4dc` determinism examples zsh-safe | Codex | Claude, this Pass 2.5 |

## Questions for Beni

Answered by Beni on 2026-10-30 in chat: 1 yes, 2 yes, 3 yes.

1. Do rulings 1 to 9 in `docs/reviews/pr-1-pass-1.5.md` read as you gave them? (yes/no)
2. Does the authorship record above stand as the Pass 1.5 extension for `454eaad` and `97ac4dc`, closing the Low? (yes/no)
3. Merge PR #1 at `97ac4dc`? (yes/no)

## Historical handoff block (PR #1 already merged)

The block below records the pre-merge handoff for PR #1; do not re-run its merge command. At that handoff, the base was `origin/main` = `262f119`. The instruction was to run from the main working copy on `main` after `git fetch`, and to stop if the base moved: on the bootstrap path there was no `verify` to run on the squash commit. The completed merge and post-merge checks are recorded in "Beni's decision" above.

```bash
gh pr merge 1 --repo BeniCheni/keel --squash --match-head-commit 97ac4dc83016f7e5a1d09d66a669e7818ed2da5e --subject "docs: scaffold rules, review skill and S00/S01 specs" --body "$(printf '%s\n' 'Reviewed head: 97ac4dc83016f7e5a1d09d66a669e7818ed2da5e. Shadow-mode gate verdict: would escalate (sensitive paths; bootstrap path). Merged by Beni.' '' 'Co-authored-by: Claude <noreply@anthropic.com>' 'Co-authored-by: Codex <noreply@openai.com>')"
git switch main && git pull --ff-only
test "$(git rev-parse origin/main)" = "$(gh pr view 1 --repo BeniCheni/keel --json mergeCommit --jq .mergeCommit.oid)" && echo "origin/main equals the squash commit GitHub recorded"
test "$(git rev-parse 'origin/main^{tree}')" = "$(git rev-parse '97ac4dc83016f7e5a1d09d66a669e7818ed2da5e^{tree}')" && echo "squash tree equals the reviewed head tree (base did not move)"
# Three green checks (pnpm install --frozen-lockfile; pnpm verify; demo mode starts with zero outbound requests): N/A on the bootstrap path. No package.json, lockfile or demo mode exists before S00.
```
