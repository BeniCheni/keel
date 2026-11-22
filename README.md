# keel

A local-first monitor for investments whose value comes from their terms, not from a market price. The first instrument it tracks is a market-linked note: a worst-of autocall with a call level, observation dates and a barrier.

keel shows your instruments, what each term says and where that term came from, the next date that matters, and how far the underlyings sit from the call level and the barrier. When there is no evidence of a value, it says so instead of inventing one.

**Status:** pre-alpha. This repository currently holds its rules, review process, slice specs, the verify gate and two packages; there is no app yet. `@keel/core` loads an mln-terms/0.1 or mln-terms/0.2 file and reports which payoff terms are verified (S01 and S02.1); it also holds the observation schedule and exchange calendar that S02 specifies. `@keel/plugin-mln` holds the payoff engine that S03 and S03.1 specify. What each returns, and when, is in those specs under `docs/specs/`.

**Not advice.** keel is information only. It is not investment, tax or legal advice, and your offering documents govern. See `DISCLAIMER.md`.

## How it is built

Every change is one slice, one pull request:

- A planner (Claude) writes the spec in `docs/specs/`.
- A builder (Codex, or Cursor when the owner approves) implements it.
- Reviewers (Claude Code, Codex or Cursor, as `AGENTS.md` assigns them) review it cold and adjudicate each other's findings. The builder reviews nothing it built, and every commit gets its cold read from a vendor that did not write it.
- A human merges.

The rules are in `AGENTS.md`; the review procedure is `.claude/skills/keel-pr-review/`.

## Privacy

Your data lives in a folder on your machine, outside this repository. The default build makes no network requests. Every fixture in this repository is synthetic.

## Quickstart

Install, then run the gate:

```bash
pnpm install --frozen-lockfile
pnpm verify
```

`pnpm verify` runs typecheck, package tests, tooling self-tests, the tripwire, the network check, the determinism check, copy lint, and the import boundary. It runs every step even after one fails, names each failed step, and exits nonzero if any step failed.

Run one step:

```bash
pnpm verify:typecheck
pnpm verify:tests
pnpm verify:tooling
pnpm verify:tripwire
pnpm verify:network
pnpm verify:determinism
pnpm verify:copy
pnpm verify:boundaries
```

Package tests, for each package, including a file-name filter:

```bash
pnpm --filter @keel/core test
pnpm --filter @keel/core test <pattern>
pnpm --filter @keel/plugin-mln test
pnpm --filter @keel/plugin-mln test <pattern>
```

A filter that matches no test file fails the run. Tooling self-tests, with an optional filter matched against the test file's path (`pnpm test:tooling -- tripwire` runs `tools/acceptance/test/tripwire.test.mjs` alone):

```bash
pnpm test:tooling
pnpm test:tooling -- <filter>
```

Fixture registry:

```bash
pnpm fixtures:regen
pnpm -s fixtures:trees
```

On Linux CI, `pnpm verify` runs inside a network namespace with no route out, and a probe in that namespace checks that an outbound fetch and a raw connect both fail. On macOS, the in-process network guard is the check that runs.

The CI evidence check needs the `gh` command and is not part of `pnpm verify`:

```bash
pnpm test:ci-evidence -- --success-run <id> --failure-run <id>
```

## License

Apache-2.0.
