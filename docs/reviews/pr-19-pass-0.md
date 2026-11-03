# Pass 0 brief: PR #19 (S90 amendment before the spike)

Written by the PM on 2026-11-03 (America/New_York), from a fresh read of the PR. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Codex, GPT-6.1 Sol High. `AGENTS.md` asks for one cold review by a vendor that did not write the PR, and a Claude session wrote every line. Codex read this spec at Pass 2 on PR #16, so it says so in its comment where a change concerns its own earlier read. The seat has no fallback: if it is unavailable, stop and escalate.

## Scope

- Spec: `docs/specs/s90-ios-core-spike.md`. Design brief: none.
- Sensitive paths touched: none (`git diff --name-only origin/main...HEAD` lists the spec and this brief).
- Release: no.
- New dependencies: none. esbuild stays as Beni approved it, on the spike branch only. The probe below installs it in a scratch clone.
- Bootstrap path: no. `verify` applies through CI. Mutations and Pass M do not apply, because no code or fixture changes.
- Spike code: none exists (`git ls-files spike | wc -l` prints `0`), so the rule is still registered before any spike code.

## Why this PR exists

Before writing Cursor's build prompt, the PM ran Q1's checks on the real libraries and found three problems. Beni ruled "Yes, amend first" on 2026-11-03, on the question "Amend the S90 spec before Cursor starts?". That ruling was given in the PM's session, so Codex cannot see it, and Beni's merge confirms it.

| # | Clause as merged | What happens | Change |
| --- | --- | --- | --- |
| 1 | `check-bundle.mjs` exits nonzero on `require(`, a `node:` specifier or a reference to `process` | Read as a plain search, it fails the merged core on text that is not a use. The decision rule says "Q1 failing means Q2 cannot pass", so Path A could fail for a false reason. If the builder loosened the check on its own, a registered check would change after the fact | Q1 tests for real uses, and the mutation floor gains two mutants |
| 2 | Q1's command starts with the spike's install | In a fresh clone the bundle cannot resolve `yaml` or `ajv/dist/2020.js`, and exits 1 | The root install comes first |
| 3 | AC11 names `<this spec's squash>` | After this amendment, a branch cut before it still exits 0 against the old squash | AC11 follows the spec's latest version on `main`, and a Git failure fails it |

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| Every commit on the branch, this brief's included | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or numbering fork. One cold review by Codex replaces Passes 1 to 2.5, as it did for the S01 amendments on PR #14. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **Scope.** Does the spec change only in its status line, one new ruling paragraph, Q1's command and paragraph, two mutants and AC11? `git diff origin/main...HEAD -- docs/adr` should print nothing. `awk '/^## Decision rule/,/^## Non-goals/' docs/specs/s90-ios-core-spike.md | shasum` should print `0b1d5259a12c2752195776adb7be3ebbf737086c` at this head, the same as `git show origin/main:docs/specs/s90-ios-core-spike.md | awk '/^## Decision rule/,/^## Non-goals/' | shasum`.
2. **The plain-search figures.** In a scratch clone after `pnpm install --frozen-lockfile`, run `pnpm dlx esbuild@0.28.2 packages/core/src/index.ts --bundle --platform=neutral --format=iife --global-name=KeelCore --main-fields=module,main --log-level=error --outfile=/tmp/c.js`. Then `grep -cF 'require(' /tmp/c.js`, `grep -cE '\bprocess\b' /tmp/c.js` and `grep -cF 'node:' /tmp/c.js` should print `5`, `4` and `1`. Read those lines. Is any of them a real use?
3. **The root install.** In a fresh clone with no install, the same esbuild line should exit 1 with `Could not resolve "yaml"`.
4. **Can the new check be built, and is it strong enough?** Run the probe below. Is there a real use it misses, beyond a name built at run time? Does the new wording lose anything the old one caught?
5. **The floor.** Each mutant's command first proves the unmodified comparison passes. Does that, with the two new mutants, rule out a plain search?
6. **AC11.** Run the script below. Does the new form hold in every case, and fail closed?
7. **Direction.** Does anything here make Path A easier to select than the rule as registered, other than removing a false failure? Thresholds and decision clauses should be untouched.
8. **Private list.** This seat runs the owner's private-list check, counts only, over the diff, the commit messages, the PR title and body, every comment and its own proposed comment.

## The probe

This is the PM's plan probe. It is not the spike's check, the builder need not use it, and it is not committed as code. Save it outside the clone as `probe.mjs`, then run this in a scratch clone of this PR's head:

```bash
pnpm install --frozen-lockfile
mkdir -p spike/ios-core
printf '{"name":"probe","private":true,"devDependencies":{"esbuild":"0.28.2"}}\n' > spike/ios-core/package.json
pnpm --dir spike/ios-core --ignore-workspace install
LC_ALL=en_US.UTF-8 node /path/to/probe.mjs "$PWD"
LC_ALL=haw_US.UTF-8 node /path/to/probe.mjs "$PWD"
```

```js
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";

const root = process.argv[2];
const esbuild = createRequire(join(root, "spike/ios-core/package.json"))("esbuild");
const fromCore = createRequire(join(root, "packages/core/package.json"));
const coreDir = join(root, "packages/core/src");
const termsDir = join(coreDir, "terms");
const MARK = "__KEEL_FREE_GLOBAL__";
const base = {
  bundle: true,
  platform: "neutral",
  format: "iife",
  globalName: "KeelCore",
  mainFields: ["module", "main"],
  write: false,
  metafile: true,
  logLevel: "silent",
};
const marked = { ...base, define: { process: MARK, "globalThis.process": MARK, "globalThis.require": MARK } };

function standalone() {
  const Ajv = fromCore("ajv/dist/2020.js").default;
  const standaloneCode = fromCore("ajv/dist/standalone").default;
  const schema = JSON.parse(readFileSync(join(root, "schemas/mln-terms/0.1.json"), "utf8"));
  const ajv = new Ajv({ allErrors: true, strict: true, code: { source: true, esm: true } });
  const generated = standaloneCode(ajv, ajv.compile(schema));
  return {
    name: "standalone",
    setup(b) {
      b.onResolve({ filter: /^generated-validator$/ }, (a) => ({ path: a.path, namespace: "gen" }));
      b.onLoad({ filter: /.*/, namespace: "gen" }, () => ({ contents: generated, loader: "js", resolveDir: termsDir }));
      b.onLoad({ filter: /schema-map\.ts$/ }, (a) => {
        const src = readFileSync(a.path, "utf8");
        const out = src
          .replace('import Ajv from "ajv/dist/2020.js";', 'import validate from "generated-validator";')
          .replace(/import schema from [^\n]+\n/, "")
          .replace(/const ajv = new Ajv\([^\n]+\n/, "")
          .replace(/const validate = ajv\.compile\(schema\);\n/, "");
        if (out === src) throw new Error("the swap did not apply");
        return { contents: out, loader: "ts", resolveDir: termsDir };
      });
    },
  };
}

function check(r) {
  const [output] = Object.values(r.metafile.outputs);
  const text = r.outputFiles[0].text;
  const external = output.imports.filter((i) => i.external).map((i) => i.path);
  const flagged =
    external.length > 0 || text.includes(MARK) || /typeof require\b/.test(text) || text.includes("montecarlo");
  return { flagged, external, bytes: Buffer.byteLength(text) };
}

function plain(text) {
  const lines = text.split("\n");
  const hits = (re) => lines.filter((l) => re.test(l)).length;
  return { "require(": hits(/require\(/), process: hits(/\bprocess\b/), "node:": hits(/node:/) };
}

const bundles = {};
for (const [name, plugins] of [["compile", []], ["standalone", [standalone()]]]) {
  const entryPoints = [join(coreDir, "index.ts")];
  const text = (await esbuild.build({ ...base, entryPoints, plugins })).outputFiles[0].text;
  bundles[name] = text;
  console.log(name, "plain search", JSON.stringify(plain(text)));
  console.log(name, "reference check", JSON.stringify(check(await esbuild.build({ ...marked, entryPoints, plugins }))));
}

const entry = 'export * from "./index.ts";\n';
const planted = [
  ["text only", entry + "export const s = 'require(\"a\") node:fs process'; export const o = { process: 1, node: 2 };\n"],
  ["process", entry + "export const p = process.env.X;\n"],
  ["typeof process", entry + "export const p = typeof process;\n"],
  ["globalThis.process", entry + "export const p = globalThis.process.env.X;\n"],
  ["require call", entry + 'export const r = require("x");\n'],
  ["require call, external", entry + 'export const r = require("x");\n', ["x"]],
  ["require alias", entry + "export const r = require;\n"],
  ["typeof require", entry + "export const r = typeof require;\n"],
  ["require.resolve", entry + 'export const r = require.resolve("x");\n'],
  ["globalThis.require", entry + 'export const r = globalThis.require("x");\n'],
  ["node:fs", 'import fs from "node:fs";\n' + entry + "export const f = fs;\n"],
  ["node:fs, external", 'import fs from "node:fs";\n' + entry + "export const f = fs;\n", ["node:fs"]],
  ["montecarlo word", entry + "export const m = 'montecarlo';\n"],
  ["name built at run time", entry + 'export const p = globalThis["pro" + "cess"];\n'],
];
for (const [label, contents, external = []] of planted) {
  try {
    const stdin = { contents, resolveDir: coreDir, loader: "ts", sourcefile: "entry.ts" };
    const r = check(await esbuild.build({ ...marked, stdin, external }));
    console.log(label, "->", r.flagged ? "flagged" : "not flagged");
  } catch (e) {
    console.log(label, "-> build failed:", e.errors?.[0]?.text ?? e.message);
  }
}

const files = execFileSync("git", ["ls-files", "fixtures/synthetic/terms"], { cwd: root, encoding: "utf8" })
  .split("\n")
  .filter((f) => f.endsWith(".yaml"));
const inputs = files.map((file) => ({ file, text: readFileSync(join(root, file), "utf8") }));
const core = await import(join(coreDir, "index.ts"));
const run = (k) =>
  inputs
    .map((i) => {
      const result = k.loadTerms(i.text, i.file);
      const o = { file: i.file, result };
      if (result.ok) o.summary = k.verificationSummary(result.terms);
      return JSON.stringify(o);
    })
    .join("\n");
const node = run(core);
for (const [name, text] of Object.entries(bundles)) {
  const ctx = vm.createContext({ console });
  vm.runInContext(text + ";globalThis.KeelCore=KeelCore;", ctx);
  console.log(name, "same as Node on", inputs.length, "fixtures:", run(ctx.KeelCore) === node);
}
console.log("locale", new Intl.Collator().resolvedOptions().locale);
```

What it printed, on Node 24.22.2 at `378dab7`:

| Line | Result |
| --- | --- |
| `compile` plain search | `require(` 5, `process` 4, `node:` 1 |
| `standalone` plain search | `require(` 2, `process` 0, `node:` 1 |
| Reference check, both variants | Not flagged, no external imports; 608362 and 615302 bytes |
| Text only | Not flagged |
| `process`, `typeof process`, `globalThis.process` | Flagged |
| `require` call marked external, `require` alias, `typeof require`, `require.resolve`, `globalThis.require` | Flagged |
| `node:fs` marked external, the word `montecarlo` | Flagged |
| `require` call and `node:fs` import, not marked external | The build fails: `Could not resolve` |
| Name built at run time | Not flagged. A plain search misses it too, because the word is not in the text |
| Each variant the same as Node on 31 fixtures | `true`, under `en-US` and under `haw-US` |

The last row ran in a bare V8 context, not JavaScriptCore, so it says nothing about clause 1. It shows only that swapping `schema-map.ts`'s compile through a build plugin needs no core edit. The `standalone` bundle is not the smaller one, at 615302 bytes against 608362.

## The AC11 script

Run it with `bash`. It works in throwaway repos and touches no clone. `was` is the form as merged, with the old squash standing in for `<this spec's squash>`, and `now` is the amended form.

```bash
spec=docs/specs/s90-ios-core-spike.md
ac11() {
  git merge-base --is-ancestor "$(git log -1 --format=%H origin/main -- "$spec" 2>/dev/null)" "$(git rev-list --reverse origin/main..HEAD 2>/dev/null | head -1)" 2>/dev/null
  echo $?
}
was() {
  git merge-base --is-ancestor "$c1" "$(git rev-list --reverse origin/main..HEAD 2>/dev/null | head -1)" 2>/dev/null
  echo $?
}
repo() {
  cd "$(mktemp -d)" || exit 1
  git init -q -b main .
  git config user.name Claude
  git config user.email noreply@anthropic.com
  mkdir -p docs/specs
  echo v1 > "$spec"; git add .; git commit -qm merged-spec; c1="$(git rev-parse HEAD)"
  echo v2 > "$spec"; git add .; git commit -qm amendment; c2="$(git rev-parse HEAD)"
}
spike() { git switch -qc s90 "$1"; echo a > a; git add .; git commit -qm first-spike-commit; }

repo; git update-ref refs/remotes/origin/main "$c2"; spike "$c2"
echo "cut after the amendment: was=$(was) now=$(ac11)"
repo; git update-ref refs/remotes/origin/main "$c2"; spike "$c1"
echo "cut before the amendment: was=$(was) now=$(ac11)"
repo; spike "$c2"; git switch -q main; echo z > z; git add .; git commit -qm unrelated
git update-ref refs/remotes/origin/main "$(git rev-parse main)"; git switch -q s90
echo "main moved by an unrelated commit after the cut: was=$(was) now=$(ac11)"
repo; spike "$c2"
echo "no origin/main: now=$(ac11)"
```

| Case | `was` | `now` |
| --- | --- | --- |
| Cut after the amendment | 0 | 0 |
| Cut before the amendment | **0** | 1 |
| `main` moved by an unrelated commit after the cut | 0 | 0 |
| No `origin/main` | not run | 128 |

## Left for the build prompt

These are facts about the repo, not clauses, so they go in Cursor's prompt and not in the spec. Each came from staging the planted file in a scratch clone and running `pnpm verify`. Say if any belongs in the spec.

- A `*.test.mjs` under a `test/` folder in the spike joins the tooling suite: `Test Files  11 passed (11)` where a clean clone has 10, and `verify` still exits 0.
- A committed binary fails the tripwire, as Q6 says: a planted PNG gives `verify failed: tripwire`.
- `verify` does not check spike code. A badly typed `.ts` and a `.swift` file under the spike both leave it at exit 0.
- The root `.gitignore` has no `.build/` or `xcuserdata/` line, and AC8 bars editing it, so the spike needs its own (`cat .gitignore`).
