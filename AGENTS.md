# AGENTS.md: keel

This file owns the rules for every agent and every human working in this repo. It outranks any prompt on process: a prompt may narrow these rules, never loosen them. `CLAUDE.md` imports this file; Codex and Cursor read it directly. If this file and a prompt disagree, stop and report the conflict instead of choosing.

## What this repo is

keel is a local-first, open-source monitor for investments whose value is defined by terms rather than by a market price. Milestone 1 tracks one market-linked note (a worst-of autocall) end to end: terms with provenance, imported closes, a deterministic payoff engine, an instrument page, alerts, and a headless checker. It shows dates, distances, provenance and alerts. It never recommends, never predicts, and never shows a value it cannot evidence.

The specs in `docs/specs/` are the build authority. The product research behind them is held privately until a scrubbed copy lands in `docs/proposals/`.

## Seats

| Seat | Who | Model pin | Fallback | Does | Never |
| --- | --- | --- | --- | --- | --- |
| Owner | Beni (human) | n/a | n/a | Rules on scope, numbering and forks; merges and tags every release; merges every sensitive-path PR | n/a |
| Planner (PM) | Claude, in Claude Code or Cowork | Opus 5.5 High | Sonnet 5.5 High | Slice specs, build prompts, Executive Handoff Briefs for design, Pass 0 and 1.5 briefs, the Pass 2.5 seat's prompt, records | Writes code; reviews a PR it wrote any line of |
| Designer | Claude Design | n/a | n/a | Design briefs and prototypes against `packages/ui/tokens.css` | Commits prototypes (`design/` stays local) |
| Builder | Codex | GPT-6.2 Sol High; Extra High for design-heavy or sensitive-path slices | Cursor on Grok 4.7 Medium, on Beni's word for that PR (Cursor seats, below) | One slice per draft PR, every commit green, a claims list in the PR body; the rework that review sends back | Reviews its own work; merges a release |
| Pass 1 reviewer | Claude Code, fresh session, fresh clone | Fable 5.2 Extra on sensitive-path PRs; Opus 5.5 High otherwise | Opus 5.5 High | Cold review, fixes what it reproduces (findings only on a Codex-built PR), one PR comment | Reviews a PR any Claude session wrote (Codex takes Pass 1 then) |
| Pass 2 adjudicator | Codex | GPT-6.2 Sol High; Extra High on sensitive-path PRs | none | Adjudicates Pass 1, adds its own read, runs Pass M, one PR comment, on every PR Codex did not build. Also Pass 1 on Claude-authored PRs, which includes the plan challenge on every spec | Gives the cold read of a commit it wrote; reviews a PR it built |
| Pass 2 on a Codex build | Claude Code, a second fresh session and fresh clone, neither the PM's nor the Pass 1 session | Fable 5.2 Extra on sensitive-path PRs; Opus 5.5 High otherwise | Opus 5.5 High | The Pass 2 adjudicator's work on a PR Codex built, with findings only | Commits a fix on a Codex-built PR |
| Cursor Pass 2 on a Codex build | Cursor, on Beni's word for that PR (Cursor seats, below) | Grok 4.7 Medium | The Claude Pass 2 seat on a Codex build | The same work, with findings only, where Cursor seats allows it | Commits a fix on a Codex-built PR |
| Pass 2.5 synthesis | Claude, fresh session, not the PM | Fable 5.2 High on sensitive-path PRs; Opus 5.5 High otherwise | Opus 5.5 High | Re-runs every number at the head, gives the cold read of any Codex-authored commit, writes the executive brief, evaluates the merge gate; findings only on a Codex-built PR | Runs in a session that wrote the build or any fix |
| Records and fast-track cold read | Cursor, on Beni's word | Grok 4.7 Extra High | none | The one cold read of a records or fast-track PR it wrote none of, unless that PR records or reports on a PR with any Cursor-authored commit | Gives the cold read of a commit it wrote |
| Merge logistics | Cursor, on Beni's word | Grok 4.7 Medium | none | Runs the merge and tag commands Beni approved | Merges or tags without Beni's word |

Independence rules:

- The builder reviews nothing it built. A reviewer builds nothing it will review. No vendor gives the only cold read of its own work.
- **Authorship record.** The Pass 0 brief lists every commit with its authoring vendor (`git log --format='%h %an' <base>..<head>`), and the Pass 1.5 brief extends it with fix commits. Before the gate, every commit has a cold read from a vendor that did not author it. On a Claude-authored PR: Codex takes Pass 1; Codex's Pass 2 covers only the Claude-authored commits after Pass 1; any Codex-authored commit gets its cold read from the fresh Claude session at Pass 2.5. On a Codex-built PR: Claude takes Pass 1, and the Pass 2 seat on a Codex build takes Pass 2. Review seats commit no fixes there, Cursor at Pass 2 included; the PM routes their findings to Codex as rework, and a later Claude pass gives each rework commit its cold read. When a Pass 2.5 finding sends rework to Codex, the same Pass 2.5 seat, which wrote no fix, re-runs at the rework head and gives that rework its cold read, as on PR #52, until nothing goes back. If no pinned seat is eligible for a commit, stop and escalate.
- The PM session and the Pass 1 session are different sessions. The sealed appendix in the Pass 0 brief is their only channel. On a Codex-built PR, the Pass 1, Pass 2 and Pass 2.5 seats are three different fresh Claude sessions, unless Cursor takes Pass 2.
- Fable pins apply to the Claude seats only; Codex keeps its own pin on every PR. Fable seats work only on synthetic data in a fresh clone.

**Cursor seats.** Cursor on Grok 4.7 Medium takes the Builder seat, or Pass 2 on a Codex build, only on Beni's word for that PR. The PM proposes it in the build prompt or the Pass 0 brief with a one-line reason, and the brief records Beni's answer. Cursor takes Pass 2 on a Codex-built PR only when the PR touches no sensitive path and no engine code, so Pass M never falls to it, and only after one trial Pass 2, shadowed by a Claude Pass 2 on the same PR, has shown that it holds up. Beni rules on the trial, and on the trial PR the gate counts the Claude Pass 2. Otherwise the Claude seat takes Pass 2 on a Codex build. On a PR Cursor built, Codex takes Pass 2.

Seat conduct:

- A seat opens nothing its prompt does not name, the host's own logs and settings included, without asking Beni first.
- A review seat writes only inside its fresh clone and its own temporary folders, and commits and pushes nothing unless its prompt allows fix commits. It pushes its fix commits one at a time, so that each gets its own CI run.
- Review seats save no memory notes. Memory is a channel between seats that the sealed appendix does not cover.

Model pins are as of 2026-10-29, except Cursor's cold-read effort, which is as of 2026-11-07, the Fable pins, which are as of 2026-11-11, and Codex's GPT-6.2 Sol pins, the Builder seat and both Pass 2 seats on a Codex build, which are as of 2026-11-22. If a pinned model is unavailable, use the fallback and say so in the PR comment; the Builder's fallback also needs Beni's word for that PR. A seat with no fallback stops and escalates.

## Hard rules

1. **Personal data never enters the repo.** No names beyond the owner and license notices, addresses, account identifiers, balances, bet or trade identifiers, CUSIPs of real holdings, or real documents, in code, fixtures, PRs, comments or commit messages. The user's data folder lives in the OS app-data location, never under the repo, and no agent opens it. A privacy check reads its patterns from a file outside the repo and never spells them out, or says where that file is kept, in a PR, comment, commit or doc; a seat names the check it ran instead. It first checks that the file is readable, and a failed scan exits nonzero, so a failed scan never reads as zero hits.
2. **No recommendations.** Product text explains mechanics only. No feature advises buying, selling or holding, and no feature predicts a price.
3. **No value without evidence.** A dollar value appears only when a dated, sourced mark exists. Honesty tests (`*.honesty.test.ts`) are never weakened, skipped or deleted.
4. **Synthetic fixtures only.** Fixtures are generated by seed, diffed, and never hand-typed. Real market data is never committed. Fixture expected outputs regenerate byte-identically.
5. **No network by default.** The default configuration makes no outbound request. Connectors are opt-in, bring-your-own-key, and each has a `docs/providers/<id>.md` reviewed within the last 12 months.
6. **Only a `primary` source verifies a payoff term.** Conflicting sources are kept side by side and never auto-resolved.
7. **Model output stays isolated.** Nothing outside `packages/montecarlo` and the Scenario screen imports the Monte Carlo package. Its outputs carry the label ESTIMATE and their assumptions.
8. **Dependencies are a cost.** Each new dependency needs a justification, its license and, for data connectors, a data-terms note in the PR body. Prefer none.
9. **Evidence rule.** Every figure in a PR body, comment or brief carries the command that reproduces it. Absolute words ("never", "every", "all") are claims to test. Counts come from commands run in the current session, never copied from another document. A review that read but did not run is not a run.
10. **Git hygiene.** Commits are authored as the agent that did the work, set per commit (`git -c user.name=... -c user.email=... commit`), never as Beni. Agents commit as `Claude <noreply@anthropic.com>`, `Codex <noreply@openai.com>`, and Cursor under its agent address (listed in `tools/tripwire/vendors.txt` once S00.1 lands). Never force-push. Push to another seat's branch only after `git fetch`, with `git push origin HEAD:<branch>`. DCO sign-off is not required yet. From the first outside pull request, human contributors sign off (`git commit -s`); agents never sign off, because the DCO is a personal attestation.
11. **Local-only folders.** The top-level `/design/` folder and any user data folder are never committed; `.gitignore` enforces it and the tripwire checks it.
12. **Copy rules.** Product text never uses "should", "buy", "sell" or "hold". The disclaimer appears in the README, the first-run screen, About, and every alert footer.

## Sensitive paths

A PR touching any of these is a sensitive-path PR: Fable pins apply, fast-track is barred, and Beni merges it.

- `packages/core/**` (domain model, schedule, alert evaluation)
- `packages/plugin-mln/**` (payoff engine)
- `schemas/**`
- `tools/tripwire/**` and its allowlist
- `tools/reference/**` (Pass M reference implementation)
- `fixtures/**/expected/**` and `fixtures/golden/**`
- `docs/providers/**`
- `.github/workflows/**`
- `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**`, `.agents/skills/**`
- `apps/ios/**` (the whole app: any file can reroute the import or the bridge)
- `tools/ios/**` (the guards)

## Engineering

- TypeScript in strict mode; pnpm workspaces; the Node floor is pinned in `package.json` and CI runs the floor and the current LTS.
- `pnpm verify` runs typecheck, tests, honesty tests, the PII tripwire, the zero-network test, the determinism check, copy lint and the import-boundary check. It is green at every commit.
- The determinism check regenerates every registered output, takes the output trees from the registry (`pnpm -s fixtures:trees`), and then requires `git status --porcelain --untracked-files=all -- <those trees>` to succeed and print nothing. A failed Git command fails the check; it never reads as clean. A bare `git diff --exit-code` misses staged and untracked outputs and is not the check.
- `packages/core` and every category plugin do no I/O: no file system, network, clock or randomness. Time, data and seeds are passed in.
- Money is integer cents. Levels are decimal ratios with an explicit rounding rule taken from the terms.
- Every engine or alert claim has at least three mutants that the suite kills, including each boundary (for example 95.00%, 94.99%, 60.00%, 59.99%).

## Workflow

1. **Plan.** The PM writes `docs/specs/sNN-<slug>.md` (a follow-up slice Beni numbers as `sNN.M`, such as S00.1, uses `sNN.M-<slug>.md`): story IDs, acceptance criteria with reproducing commands, non-goals, sensitive paths touched, and the design rung if any. The spec PR gets Codex as Pass 1, which is the plan challenge. Beni rules on scope and numbering.
2. **Design** (only for slices the spec marks). The instrument page gets the full Design Review cycle: Round 1 cold review (Claude Code), Round 2 deep-dive rebuttal (Codex), Round 3 regroup, Beni approves the prototype, then an Executive Handoff Brief and declarative build instructions go to the builder. Terms and Evidence and the alerts inbox get Round 1 plus Beni's approval. Other screens reuse existing components and tokens.
3. **Build.** The builder (Codex, or Cursor on Beni's word for that PR) opens a draft PR on branch `sNN/<slug>` (or `sNN.M/<slug>`) for exactly one slice, and pushes the next commit only after CI is green on the last. The PR body lists every claim with its reproducing command.
4. **Review.** `/keel-pr-review <N>` runs the passes:

| Pass | Seat | Output |
| --- | --- | --- |
| 0 | PM | `docs/reviews/pr-<N>-pass-0.md`: what to check, the sealed appendix of builder claims, whether fast-track is allowed |
| 1 | Claude Code (Codex if a Claude session wrote the PR) | Fix commits for what it reproduces (findings only on a Codex-built PR); one PR comment; stops |
| 1.5 | PM | `docs/reviews/pr-<N>-pass-1.5.md`: per finding accept, contest, or accept and dispute; structural Highs go back to the builder as rework, and on a Codex-built PR so does every finding that needs a change |
| 2 | Codex (on a Codex-built PR, a second fresh Claude session, or Cursor under Cursor seats) | Independent read, reproduce or disprove each finding, Pass M on engine PRs, fix commits (findings only on a Codex-built PR), one PR comment. On a Claude-authored PR, the cold read of the Claude-authored commits after Pass 1 |
| 2.5 | Claude, fresh session, not the PM | Re-run of every number at the head, cold read of any Codex-authored commit, executive brief, merge gate verdict |
| 3 | Beni | Rulings on contested items; merges; tags releases |

**Records PRs.** A PR that only adds or corrects files under `docs/reviews/**`, plus their rows in `docs/README.md`, is a records PR, except that `docs/reviews/gate-activation.md` is Beni's record and never lands this way. A PR that only fills a review record's row in `docs/README.md` with its merge line is a records PR too. A records PR gets one cold read by a vendor that authored none of its commits, posted as one short PR comment. That read writes no review records, and no Pass 0, 1.5 or 2.5 brief is written for the PR, so records never generate records. The cold read, the `verify` check green and Beni's merge complete it. Records may batch across slices. A records PR that touches any other file is an ordinary PR.

**Bootstrap path.** Until S00 merges, a docs-only PR has no `package.json`, lockfile or workflow, so install, `verify`, mutations and Pass M cannot run. Such a PR gets static checks only. Every pass states each skipped check as N/A with its reason, and nothing reports a skipped check as green.

5. **Ship.** See Releases.

## Merge gate

**Shadow mode until `v0.1.0` ships.** Pass 2.5 evaluates the gate and records "would merge" or "would escalate" in the executive brief. Beni merges every PR. Delegated merging starts only when Beni writes an activation record in `docs/reviews/gate-activation.md` that cites the shadow verdicts and his matching decisions. After that record exists, Pass 2.5 may squash-merge a PR when all of these hold:

- Not a release and no numbering fork.
- Verdict "mergeable" or "mergeable after fixes", and every High finding is closed as Severity defines.
- Nothing contested between vendors.
- `verify` green at the tip, and Pass 2.5 re-ran every number it reports.
- No sensitive path touched, no new dependency, no terms-schema change.
- Squash merge pinned to the reviewed SHA (`gh pr merge <N> --squash --match-head-commit <sha>`), with a `Co-authored-by:` trailer for every vendor that wrote or reviewed, each spelled out in full: authors from `git log --format='%an <%ae>' origin/main..<head>` in the reviewed clone, plus every vendor that gave a review pass or a records cold read on the PR, taken from the review comments and briefs and written with that vendor's commit identity.

**`main` moves only by a PR merge.** Every change reaches `main` through `gh pr merge <N> --squash --match-head-commit <sha>` (or the same merge in the GitHub UI) on an open PR with the `verify` check green. Never through a direct push, an API ref or contents edit, or the web editor. The `main` ruleset requires a pull request, squash merges only, and the `verify` check.

**Fast-track.** Allowed only when the Pass 0 brief names it and the diff is docs, UI copy or tokens outside sensitive paths. It is never allowed for a release or a numbering fork. Fast-track changes review depth only: one cold review by a vendor that did not write the PR replaces Passes 1 to 2.5. It does not change who merges. In shadow mode Beni merges, and after activation the gate above still applies in full: findings closed, applicable checks green, and the merge pinned with `--match-head-commit`. Record "fast-track" in the squash message.

## Severity

| Level | Meaning |
| --- | --- |
| High | A confident falsehood to the reader (a value or probability shown without evidence, a wrong payoff, a wrong or missed alert state); any personal-data leak; a trust claim the numbers do not support; a test that cannot fail, or a weakened honesty or boundary test; a surviving mutant on a boundary; a red build; a crash; an outbound request in the default configuration; an AA contrast failure on a new surface |
| Medium | A wrong or stale claim in docs or UI copy; a missed edge case; a layout defect; a surviving mutant off a boundary; a connector without its provider terms file |
| Low | Tidiness; a comment that overclaims |

A High in tracked files closes only with a fix commit carrying a test that fails without it. A High outside tracked files (a PR body, a comment, a repository setting) closes with a recorded remediation check, such as a before-and-after equality assertion, plus Beni's written confirmation. An open High makes the verdict "not mergeable".

## Stop and escalate

Stop and escalate to Beni on: a release or numbering fork; any privacy issue; a disagreement between vendors; a dependency the work needs; any need to read the user's data folder; any claim that could not be re-run; this file disagreeing with a prompt. Write escalations as questions answerable in one word.

## Releases

- Semver `v0.x.y`. A patch is a fix, tooling or docs with no new capability. A minor adds a capability under one theme. A terms-schema bump is always at least a minor. Work toward a later cutover ships as non-releases.
- The version agrees across `package.json`, the lockfile, `CHANGELOG.md`, the README badge, the README lineage list, and the git tag. If any disagree, stop and report.
- `CHANGELOG.md` released sections open with one subject sentence, then Added, Changed, Fixed, Behavior change (any change to a golden output), and Deliberately not done. Dates are in America/New_York.
- Beni merges the release PR and pushes an annotated tag on the squash commit. Post-merge: `origin/main` equals the squash commit GitHub recorded for the PR, and the peeled tag equals that commit. The reviewed head SHA is recorded separately. If the base did not move during review, the squash commit's tree equals the reviewed head's tree; if it moved, `verify` runs green on the squash commit. Then the README renders, and demo mode starts with zero outbound requests.

## Docs

- `docs/README.md` indexes every spec, design brief and review record by slice and release.
- `docs/vX.Y.Z-ideas.md` holds ranked candidates. It is never a release scope.
- A ruling quoted outside its own record is cited by PR number, then ruling number: R52.6 is ruling 6 in PR #52's records. Records already merged keep their numbers.
- Prompts handed to agents in chat are fenced blocks with one line per paragraph and a four-backtick outer fence when they contain fenced blocks.
