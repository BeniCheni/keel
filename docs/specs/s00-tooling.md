# S00: Repo tooling

- Status: revised 2026-10-30 by the PM (Claude) after the Codex plan challenge on PR #1 (Pass 1 findings 6 to 10; dispositions in `docs/reviews/pr-1-pass-1.5.md`), and again after PR #3 Pass 1 (Beni's rulings 1 to 3 in `docs/reviews/pr-3-pass-1.5.md`: filter commands, the guard list, the keyword window).
- Release: non-release slice toward `v0.1.0`.
- Builder: Cursor, Grok 4.7 Extra High (sensitive-path slice).
- Sensitive paths touched: `packages/core/**`, `.github/workflows/**`, `tools/tripwire/**`.
- Design rung: none (no UI).
- Stories served (from the private research, Section 2): 11.1 one-command dev, 11.3 CI blocks real-looking data, 10.1 no telemetry (the zero-network half), 11.2 groundwork for engine tests.

## Goal

A workspace where `pnpm verify` gates every commit before any product code exists. Every later slice inherits these fences, so each one must be shown to fail, not just to pass.

## Scope

1. **Workspace.** pnpm workspace with one package, `packages/core`, published name `@keel/core`, exporting an empty public API and one smoke test. TypeScript `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`. Node floor pinned in `package.json` `engines`: Node 24. CI also runs the newest LTS line available at build time. The PR body states both resolved versions, and if the floor and the newest LTS are the same line, it says so and the matrix runs that line once per OS.
2. **Test contract.** Vitest is the runner. `pnpm --filter <package> test [pattern]` forwards `pattern` to `vitest run`. A run that discovers zero test files fails (`passWithNoTests: false`). The include globs cover `**/*.test.ts`, which includes every `*.honesty.test.ts`. `pnpm test:tooling [-- <filter>]` runs the self-tests of the tooling itself under `tools/**/test/`; the filter reaches Vitest and matches against the test file's path, so `-- tripwire` runs only `tripwire.test.mjs`.
3. **`pnpm verify`.** Runs, in order: typecheck, tests, tooling self-tests, tripwire, network, determinism, copy lint, boundaries. Each step also runs alone as `pnpm verify:<step>`. The runner runs every step even after one fails, names each failed step in its final output, and exits nonzero if any step failed.
4. **PII tripwire** (`tools/tripwire/`). The tripwire is a heuristic backstop. It cannot detect arbitrary names or private facts; the owner's private-list check (hard rule 1) and review cover those. No PR, comment or brief presents a clean tripwire run as proof that no personal data is present.
   - **Inputs.** Every path from `git ls-files`, plus every commit message in `origin/main..HEAD`. If `origin/main` is unavailable (for example a shallow CI checkout), the tripwire exits 2; CI checks out with `fetch-depth: 0`.
   - **CUSIP.** A token bounded on both sides by a non-alphanumeric character or the start or end of text, nine characters `[0-9A-Za-z]`, uppercased before the standard modulus-10 check digit is computed. A valid check digit is a hit unless the allowlist covers it. An ISIN whose embedded nine characters are a valid CUSIP is also a hit.
   - **Account identifier.** Any of: three letters, a hyphen and six digits; a token of 6 to 12 letters and digits containing at least 4 digits that starts within 40 characters after the end of an account keyword (`account`, `acct`, `a/c`, case-insensitive), even if it ends beyond them; a masked run of at least three `*`, `x` or `X` followed by 3 or 4 digits after the same keywords.
   - **SSN.** `NNN-NN-NNNN` and `NNN NN NNNN`, digits bounded on both sides.
   - **Street address.** A house number, optional direction, one to three capitalised words, a street type (Street, St, Avenue, Ave, Road, Rd, Boulevard, Blvd, Place, Pl, Lane, Ln, Drive, Dr, Court, Ct, Parkway, Pkwy, Terrace, Way), and optionally a unit (Apt, Unit, Suite, `#`) with its number.
   - **Email address**, except `noreply` addresses and exact addresses in the allowlist.
   - **Price data.** A tracked `.csv` or `.tsv` whose header row names any of `open`, `high`, `low`, `close`, `adj close` or `price` (any case), or a tracked `.json` with any of those keys at the first array level, unless the file's first line is `# synthetic: true` (CSV, TSV) or its top level carries `"synthetic": true` (JSON).
   - **Local-only path.** Any tracked path matching the local-only entries in `.gitignore` (`/design/`, `.keel-data/`, `/terms/`, `*.sqlite`, `*.pdf`).
   - **Unscannable.** A tracked file that is binary or not valid UTF-8. There is no binary allowlist in this slice.
   - **Output.** One line per hit: class, file (or `commit <sha>`), line number. The matched text never appears on stdout or stderr. Exit 1 on any hit, 2 on a scan error, 0 only when every input was scanned and nothing hit.
   - **Allowlist** (`tools/tripwire/allowlist.txt`). Each entry is a path glob under `fixtures/`, an exact value, and a one-line reason. Entries cover only seeded, generated fixture values. The tripwire validates the allowlist before scanning anything: a malformed entry or a glob reaching outside `fixtures/` is a hit. In the allowlist file itself, a value that sits in a valid entry is exempt from the CUSIP class; any other content of that file is scanned like every other file.
5. **Zero-network boundary.** Two layers.
   - **Authoritative:** in CI, the Linux cells run `pnpm verify` after install inside a network namespace with no route out (for example `sudo unshare --net` dropping back to the runner user), so every transport, DNS lookup and child process is cut off. A probe step inside the same namespace runs a `fetch` to `https://example.com` and a raw `net.connect` to a public address, and asserts both fail with a no-route error code (`ENETUNREACH`, `EHOSTUNREACH`, `ENETDOWN`, `EAI_AGAIN`, `ENOTFOUND` or `EAI_FAIL`) and prints each code. A response, a timeout or any other error fails the probe.
   - **Fast local check:** a test setup file loaded for every Vitest run that makes each of these 22 entry points throw `network blocked: <name>`, loopback included: `fetch`, `WebSocket`, `http.request`, `http.get`, `https.request`, `https.get`, `net.connect`, `net.createConnection`, `net.Socket.prototype.connect` (the choke point under every TCP path), `tls.connect`, `dns.lookup`, `dns.resolve`, `dns.resolve4`, `dns.resolve6`, `dns.promises.lookup`, `dns.promises.resolve`, `dns.promises.resolve4`, `dns.promises.resolve6`, `dns.Resolver.prototype.resolve`, `dns.Resolver.prototype.resolve4`, `dns.Resolver.prototype.resolve6` and `dgram.createSocket`. Its self-tests run each probe in an isolated child process and assert the child dies with that probe's `network blocked: <name>` message, so a caught exception, a hang or an unrelated crash cannot pass as success. On macOS cells only this layer runs; the PR body says so.
6. **Determinism.** `pnpm fixtures:regen` runs a generator registry (empty in this slice). Each generator registers a name, a version, a seed and the output trees it owns. `pnpm -s fixtures:trees` prints the registered output trees, one per line, or `fixtures` when none is registered. `verify:determinism` runs the registry, then requires `git status --porcelain --untracked-files=all -- <those trees>` to exit 0 and print nothing. A nonzero Git exit fails the check.
7. **Copy lint.** Scans `packages/ui/src/copy/**` (empty now), `README.md` and `DISCLAIMER.md` for the whole words should, buy, sell, hold, case-insensitive, and exits 1 on a hit.
8. **Import boundary.** Fails if any file outside `packages/montecarlo/**` and `packages/ui/src/screens/scenario/**` imports `@keel/montecarlo` or a path inside it, by static `import`, `export ... from`, dynamic `import()` or `require()`. Neither allowed path exists yet; the check still runs.
9. **CI.** `.github/workflows/verify.yml` on `pull_request` and on `push` to `main`, `permissions: contents: read`, no secrets. Matrix: `ubuntu-latest` and `macos-latest`, Node floor and current LTS. Steps: checkout with `fetch-depth: 0`, set up pnpm and Node, `pnpm install --frozen-lockfile`, then `pnpm verify` (inside the namespace on Linux). A final job named exactly `verify` runs with `if: always()`, needs every matrix cell, and runs `tools/ci/needs-check.mjs` on `toJSON(needs)`: it exits 0 only if every needed job's result is `success`, so failure, cancellation and skipping all turn `verify` red.
10. **README quickstart** lists the commands above.

## Non-goals

Any product code; the terms schema (S01); UI; Tauri; data connectors; Monte Carlo; the Python reference for Pass M (arrives with the engine slice).

## Acceptance criteria

Every self-test generates its positives at test time in a temp directory. Nothing realistic is committed.

| # | Criterion | Reproducing command and what it asserts |
| --- | --- | --- |
| AC1 | A fresh clone installs and verifies green on the Node floor and current LTS | `pnpm install --frozen-lockfile && pnpm verify` on each matrix cell; the PR body records the resolved versions |
| AC2 | Each verify step fails the whole run when it fails | `pnpm test:tooling -- verify-runner`: forces each step to fail in turn and asserts a nonzero top-level exit naming that step |
| AC3 | The tripwire catches every class, never prints a match, and fails closed | `pnpm test:tooling -- tripwire`: per class, generated positives (including the account and address variants), ordinary-code negatives, exact allowlist behaviour (in-scope entry passes, out-of-scope glob is a hit, a malformed entry is a hit, and a populated allowlist of generated check-digit-valid values scans clean while an unlisted value added to the allowlist file is a hit), commit-message hits, a tracked local-only path, a non-UTF-8 file, and a missing `origin/main` (exit 2); asserts no matched value appears on stdout or stderr |
| AC4 | The tripwire passes on the repo itself | `pnpm verify:tripwire` exits 0 |
| AC5 | No outbound request escapes | `pnpm test:tooling -- network`: each in-process probe fails in its child process. The Linux CI namespace probe step fails both of its requests |
| AC6 | The determinism check catches every dirty case | `pnpm test:tooling -- determinism`: in a temp git repo, a tracked edit, a deletion, a staged change and a new untracked file under a registered tree each make it exit nonzero; so does a Git failure (the check run outside a Git repository); a clean regeneration exits 0 |
| AC7 | Copy lint and the import boundary each fail on seeded violations | `pnpm test:tooling -- copy-boundary`: a banned word in each scanned scope; each import form (static, re-export, dynamic, require); plus negatives (a banned word inside another word, an import from an allowed path) |
| AC8 | The `verify` check is green only when every cell succeeds | `pnpm test:tooling -- needs-check`: `needs-check.mjs` exits nonzero for failure, cancelled and skipped inputs and 0 for all-success. Then `pnpm test:ci-evidence -- --success-run <id> --failure-run <id>`, which reads both runs with `gh run view --json jobs` and asserts: the success run has every matrix cell and `verify` successful; the failure run has exactly one failed cell and `verify` failed. The failure run comes from a throwaway branch `s00/probe-verify-red` with one commit that fails one cell, opened as a draft PR into `s00/tooling`, closed unmerged and deleted once the run ID is recorded. Nothing red lands on `s00/tooling` |
| AC9 | The core test contract holds | `pnpm test:tooling -- test-contract`: a filter matching no file fails; a temp `*.honesty.test.ts` is discovered and a failing one turns the run red |

## Mutation floor

At least three mutants per claim, killed by the suite, listed in the PR body with the test that kills each. Required among them: removing one tripwire class; breaking the CUSIP check-digit step; printing the matched value; treating a scan error as exit 0; removing `fetch` interception; replacing the determinism check with `git diff --exit-code`; ignoring Git's exit status in the determinism check; exempting the whole allowlist file from the scan; making `needs-check.mjs` accept `skipped`.

## Dependencies

Expected: `typescript` and `vitest`. Anything else (a TypeScript runner for scripts, for example) needs a justification and license line in the PR body. No runtime dependencies in `packages/core`.

## Claims list (PR body)

The PR body lists every claim the builder makes, each with the command that reproduces it. The PM copies these into the sealed appendix of the Pass 0 brief.
