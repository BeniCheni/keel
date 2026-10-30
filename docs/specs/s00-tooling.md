# S00: Repo tooling

- Status: spec drafted 2026-10-29 by the PM (Claude); awaiting the Codex plan challenge and Beni's ruling.
- Release: non-release slice toward `v0.1.0`.
- Builder: Cursor, Grok 4.7 Extra High (sensitive-path slice).
- Sensitive paths touched: `.github/workflows/**`, `tools/tripwire/**`.
- Design rung: none (no UI).
- Stories served (from the private research, Section 2): 11.1 one-command dev, 11.3 CI blocks real-looking data, 10.1 no telemetry (the zero-network half), 11.2 groundwork for engine tests.

## Goal

A workspace where `pnpm verify` gates every commit before any product code exists. Every later slice inherits these fences, so they must be able to fail.

## Scope

1. **Workspace.** pnpm workspace with one package, `packages/core`, exporting an empty public API and one smoke test. TypeScript `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`. Node floor pinned in `package.json` `engines`: Node 24, matching Kickoff. CI also runs the newest LTS line available at build time; state which in the PR body.
2. **`pnpm verify`.** Runs, in order: typecheck, tests, tripwire, network, determinism, copy lint, boundaries. Each step is also runnable alone as `pnpm verify:<step>`. Any failing step fails the whole command with a non-zero exit.
3. **PII tripwire** (`tools/tripwire/`). Scans every file from `git ls-files`, plus the commit messages on the branch (`git log origin/main..HEAD --format=%B`). Pattern classes:
   - CUSIP: nine characters whose check digit is valid under the standard CUSIP modulus-10 algorithm, not listed in `tools/tripwire/allowlist.txt`.
   - Account identifier: three capital letters, a hyphen, six digits (the layout brokerage confirmations use).
   - SSN: `NNN-NN-NNNN`.
   - Street address: a number followed by a street-type word (Street, St, Avenue, Ave, Road, Rd, Boulevard, Blvd, Apt).
   - Email address, except `noreply` addresses and addresses listed in the allowlist.
   - Price file: any `.csv` whose header contains `close` (any case) and whose first line is not `# synthetic: true`.
   Output is one line per hit: pattern class, file, line number. The matched text is never printed. Exit 1 on any hit. Allowlist entries are exact values, each with a one-line reason.
4. **Zero-network guard.** A test setup file, loaded for every test, that makes any outbound attempt throw: `fetch`, `http.request`, `https.request`, `net.connect`, `tls.connect`, `dns.lookup`. Local loopback is also blocked; nothing in keel's tests needs it.
5. **Determinism.** `pnpm fixtures:regen` exists as a generator registry (empty for now). `verify:determinism` runs it and then `git diff --exit-code`.
6. **Copy lint.** All user-facing strings will live in `packages/ui/src/copy/**`. The lint scans that tree (empty now) for the whole words should, buy, sell, hold, case-insensitive, and exits 1 on a hit.
7. **Import boundary.** Fails if any file outside `packages/montecarlo/**` and `packages/ui/src/screens/scenario/**` imports `@keel/montecarlo`. Neither path exists yet; the check must still run.
8. **CI.** `.github/workflows/verify.yml` on `pull_request` and on `push` to `main`. Matrix: `ubuntu-latest` and `macos-latest`, Node floor and current LTS. Steps: checkout, set up pnpm and Node, `pnpm install --frozen-lockfile`, `pnpm verify`. No secrets. No network after install. A final job named exactly `verify` depends on every matrix cell and fails if any cell fails, so the branch ruleset can require one stable check name; the workflow sets `permissions: contents: read`.
9. **README quickstart** lists the commands above.

## Non-goals

Any product code; the terms schema (S01); UI; Tauri; data connectors; Monte Carlo; the Python reference for Pass M (arrives with the engine slice).

## Acceptance criteria

| # | Criterion | Reproducing command |
| --- | --- | --- |
| AC1 | A fresh clone installs and verifies green on Node floor and current LTS | `pnpm install --frozen-lockfile && pnpm verify` |
| AC2 | Each verify step runs alone and fails the whole run when it fails | `pnpm verify:<step>` for each step |
| AC3 | The tripwire catches every pattern class, prints no matched text, and exits 1 | A self-test that generates seeded positives in a temp directory at test time (never committed), runs the tripwire on them, and asserts each class is reported and no matched string appears in the output |
| AC4 | The tripwire passes on the repo itself | `pnpm verify:tripwire` |
| AC5 | An outbound request in any test fails the run | A self-test that attempts one request of each kind and asserts the throw |
| AC6 | The determinism check fails on a dirty regeneration | A self-test that writes a changed file into a temp git repo and asserts a non-zero exit |
| AC7 | Copy lint and the import boundary each fail on a seeded violation | Self-tests on temp fixtures |
| AC8 | CI runs the four-cell matrix and the final `verify` job goes green; a deliberately failing cell turns `verify` red | The `verify` workflow run on the PR, plus a throwaway commit that breaks one cell |

## Mutation floor

At least three mutants per claim, killed by the suite, listed in the PR body. Required among them: removing one tripwire pattern class; breaking the CUSIP check-digit step; printing the matched value; removing `fetch` interception; dropping the `git diff --exit-code` step.

## Dependencies

Expected: `typescript` and a test runner (`vitest` is the candidate). Anything else (a TypeScript runner for scripts, for example) needs a justification and license line in the PR body. No runtime dependencies in `packages/core`.

## Claims list (PR body)

The PR body lists every claim the builder makes, each with the command that reproduces it. The PM copies these into the sealed appendix of the Pass 0 brief.
