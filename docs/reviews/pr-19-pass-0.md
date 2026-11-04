# Pass 0 brief: PR #19 (S90 amendment before the spike)

Written by the PM on 2026-11-03 (America/New_York), from a fresh read of the PR. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Cursor, Grok 4.7 Extra High, by Beni's word on 2026-11-03, in the words "Can we pivot to Cursor?", because he wants to use Cursor's tokens before 2026-11-05. Cursor held this seat on PR #14, and this is the effort it used for PR #16's plan challenge. `AGENTS.md` asks for one cold review by a vendor that did not write the PR, and a Claude session wrote every line. It also names Codex for a spec's plan challenge, and the PM told Beni so, so this holds for this PR only. If this seat is unavailable, stop and escalate.

Cursor will build this spike, so this read is not neutral. PR #16 kept Codex so that a vendor that will not build the spike challenged the plan before it bound, and this amendment changes a check Cursor's build has to pass. So Cursor says so in its comment, labels any finding that would make the build easier, and pushes nothing: the PM applies what it accepts. The independent read comes later, when Codex tests the amended check at Pass 2 on the spike PR.

## Scope

- Spec: `docs/specs/s90-ios-core-spike.md`. Design brief: none.
- Sensitive paths touched: none (`git diff --name-only origin/main...HEAD` lists the spec and this brief).
- Release: no.
- New dependencies: none. esbuild stays as Beni approved it, on the spike branch only. The probe below installs it in a scratch clone.
- Bootstrap path: no. `verify` applies through CI. Mutations and Pass M do not apply, because no code or fixture changes.
- Spike code: none exists (`git ls-files spike | wc -l` prints `0`), so the rule is still registered before any spike code.

## Why this PR exists

Before writing Cursor's build prompt, the PM ran Q1's checks on the real libraries and found three problems. Beni ruled "Yes, amend first" on 2026-11-03, on the question "Amend the S90 spec before Cursor starts?". That ruling was given in the PM's session, so Cursor cannot see it, and Beni's merge confirms it.

| # | Clause as merged | What happens | Change |
| --- | --- | --- | --- |
| 1 | `check-bundle.mjs` exits nonzero on `require(`, a `node:` specifier or a reference to `process` | Read as a plain search, it fails the merged core on text that is not a use. The decision rule says "Q1 failing means Q2 cannot pass", so Path A could fail for a false reason. If the builder loosened the check on its own, a registered check would change after the fact | Q1 tests for real uses, and the mutation floor gains three mutants |
| 2 | Q1's command starts with the spike's install | In a fresh clone the bundle cannot resolve `yaml` or `ajv/dist/2020.js`, and exits 1 | The root install comes first |
| 3 | AC11 names `<this spec's squash>` | After this amendment, a branch cut before it still exits 0 against the old squash | AC11 follows the spec's latest version on `main`, and a Git failure fails it |

Two more sentences change, and they are facts, not clauses. The spec said this Mac has no full Xcode, and that stopped being true on 2026-11-03: `xcode-select -p` prints `/Applications/Xcode.app/Contents/Developer`. So the build authority no longer states an unmet prerequisite.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| Every commit on the branch, this brief's included | Claude | Cursor |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or numbering fork. One cold review by a vendor that wrote none of the PR replaces Passes 1 to 2.5, as Cursor's did for the S01 amendments on PR #14. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **Scope.** Does the spec change only in its status line, one new ruling paragraph, Q1's command and paragraph, three mutants, AC11, one lockfile clause under Dependencies and the two sentences on Xcode? `git diff origin/main...HEAD -- docs/adr` should print nothing. `awk '/^## Decision rule/,/^## Non-goals/' docs/specs/s90-ios-core-spike.md | shasum` should print `0b1d5259a12c2752195776adb7be3ebbf737086c` at this head, the same as `git show origin/main:docs/specs/s90-ios-core-spike.md | awk '/^## Decision rule/,/^## Non-goals/' | shasum`.
2. **The plain-search figures.** In a scratch clone after `pnpm install --frozen-lockfile`, run `pnpm dlx esbuild@0.28.2 packages/core/src/index.ts --bundle --platform=neutral --format=iife --global-name=KeelCore --main-fields=module,main --log-level=error --outfile=/tmp/c.js`. Then `grep -cF 'require(' /tmp/c.js`, `grep -cE '\bprocess\b' /tmp/c.js` and `grep -cF 'node:' /tmp/c.js` should print `5`, `4` and `1`, and `grep -cE '\bself\b' /tmp/c.js` should print `40`. Read those lines. Is any of them a real use?
3. **The root install.** In a fresh clone with no install, the same esbuild line should exit 1 with `Could not resolve "yaml"`.
4. **Can the new check be built, and is it strong enough?** Run the probe below. Is there a real use it misses, beyond the limits the spec states? Does the new wording lose anything the old one caught?
5. **The floor.** Each mutant's command first proves the unmodified comparison passes. Does that, with the three new mutants, rule out a plain search?
6. **AC11.** Run the script below. Does the new form hold in every case, and fail closed?
7. **Direction.** Does anything here make Path A easier to select than the rule as registered, other than removing a false failure? Thresholds and decision clauses should be untouched.
8. **Private list.** Not this seat's. Beni runs the owner's private-list check himself, counts only, over the diff, the commit messages, the PR title and body and every comment, Cursor's included. Cursor does not open that file, and reports the check as not run by it.

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
const marked = { ...base, define: { process: MARK, globalThis: MARK, global: MARK, self: MARK, window: MARK } };

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
  return { "require(": hits(/require\(/), process: hits(/\bprocess\b/), "node:": hits(/node:/), self: hits(/\bself\b/) };
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
  ["text only", entry + "export const s = 'require(\"a\") node:fs process globalThis global self window'; export const o = { process: 1, node: 2, global: 3, self: 4, window: 5 };\n"],
  ["local bindings named self and global", entry + "export function f() { const self = 1; const global = 2; return self + global; }\n"],
  ["process", entry + "export const p = process.env.X;\n"],
  ["typeof process", entry + "export const p = typeof process;\n"],
  ["globalThis.process", entry + "export const p = globalThis.process.env.X;\n"],
  ["require call", entry + 'export const r = require("x");\n'],
  ["require call, external", entry + 'export const r = require("x");\n', ["x"]],
  ["require alias", entry + "export const r = require;\n"],
  ["typeof require", entry + "export const r = typeof require;\n"],
  ["require.resolve", entry + 'export const r = require.resolve("x");\n'],
  ["globalThis.require", entry + 'export const r = globalThis.require("x");\n'],
  ["global.process", entry + "export const p = global.process;\n"],
  ["self.process", entry + "export const p = self.process;\n"],
  ["window.process", entry + "export const p = window.process;\n"],
  ["alias of globalThis, process", entry + "const g = globalThis; export const p = g.process;\n"],
  ["alias of globalThis, require", entry + 'const g = globalThis; export const r = g.require("x");\n'],
  ["alias of globalThis, require, external", entry + 'const g = globalThis; export const r = g.require("x");\n', ["x"]],
  ["destructured from globalThis", entry + "const { process: p } = globalThis; export { p };\n"],
  ["node:fs", 'import fs from "node:fs";\n' + entry + "export const f = fs;\n"],
  ["node:fs, external", 'import fs from "node:fs";\n' + entry + "export const f = fs;\n", ["node:fs"]],
  ["montecarlo word", entry + "export const m = 'montecarlo';\n"],
  ["name built at run time, on globalThis", entry + 'export const p = globalThis["pro" + "cess"];\n'],
  ["new Function returning this", entry + 'export const p = new Function("return this")().process;\n'],
  ["a sloppy function's this", entry + "export const p = (function () { return this; })().process;\n"],
  ["indirect eval", entry + 'export const p = (0, eval)("this").process;\n'],
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

What it printed, on Node 24.22.2 at `662dde3`, with the clone's root as the working directory:

| Line | Result |
| --- | --- |
| `compile` plain search | `require(` 5, `process` 4, `node:` 1, `self` 40 |
| `standalone` plain search | `require(` 2, `process` 0, `node:` 1, `self` 0 |
| Reference check, both variants | Not flagged, no external imports; 608362 and 615302 bytes |
| Text only; local bindings named `self` and `global` | Not flagged |
| `process`, `typeof process`, `globalThis.process`, `global.process`, `self.process`, `window.process` | Flagged |
| `require` call marked external, `require` alias, `typeof require`, `require.resolve`, `globalThis.require` | Flagged |
| An alias of `globalThis` followed by `.process` or by a `require` call, with `x` marked external or not; `process` destructured from `globalThis` | Flagged |
| `node:fs` marked external, the word `montecarlo` | Flagged |
| `globalThis["pro" + "cess"]` | Flagged, on the bare `globalThis` |
| `require` call and `node:fs` import, not marked external | The build fails: `Could not resolve` |
| `.process` after `new Function("return this")()`, a sloppy function's `this` or an indirect `eval` | Not flagged |
| Each variant the same as Node on 31 fixtures | `true`, under `en-US` and under `haw-US` |

The last row ran in a bare V8 context, not JavaScriptCore, so it says nothing about clause 1. It shows only that swapping `schema-map.ts`'s compile through a build plugin needs no core edit. The `standalone` bundle is not the smaller one, at 615302 bytes against 608362.

The byte counts follow the working directory, because esbuild's path comments and binding names follow the path: from `spike/ios-core` the same run prints 609904 and 615788. Cursor's run printed 608356 and 615296. The PM did not reproduce those two numbers and reads them as the same effect.

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

## After the cold read

Cursor gave the cold read at `662dde3` ([issuecomment-6622204075](https://github.com/BeniCheni/keel/pull/19#issuecomment-6622204075)), verdict "not mergeable", with one Medium and two Lows. The PM reproduced all three in a fresh clone of that head on Node 24.22.2, and accepts them.

| Finding | Reproduced by | Change |
| --- | --- | --- |
| M1, Medium: a check for `process` and `require` alone passes real references through an alias of the global object, which the old plain search caught | The probe's forms, with its `define` set back to `process`, `globalThis.process` and `globalThis.require`: all not flagged | The check also flags the global object's names, and the floor gains a mutant. Neither real bundle holds one |
| Low: the brief's byte counts do not reproduce | The note under the probe's table | The table names its working directory |
| Low: the spike's frozen install exits 1 with no lockfile | `pnpm --dir spike/ios-core --ignore-workspace install --frozen-lockfile` exits 1 with `ERR_PNPM_NO_LOCKFILE`, then exits 0 after a plain install writes `pnpm-lock.yaml`. `node tools/tripwire/cli.mjs` exits 0 with both files staged | Dependencies names the lockfile |

M1 corrects the PM. This brief's probe and the spec named a name built at run time as the only thing out of reach, and neither tested an alias. Cursor marked M1 Build-easier because the wording as it stood made the check easier to pass. The fix makes it stricter.

The wider check still gives up one thing a plain search had: `.process` on an object the check cannot identify, such as the result of `new Function("return this")()`. It looks the same as `ajv`'s `code.process`, which is why a plain search cannot pass the real bundle. The spec states that limit, and Q2's runs in a JSContext are the test for it.

Cursor re-reads the fix commit at the same seat and effort. Then Beni runs the private-list check and merges.

## Left for the build prompt

These are facts about the repo, not clauses, so they go in Cursor's prompt and not in the spec. Each came from staging the planted file in a scratch clone and running `pnpm verify`. Say if any belongs in the spec.

- A `*.test.mjs` under a `test/` folder in the spike joins the tooling suite: `Test Files  11 passed (11)` where a clean clone has 10, and `verify` still exits 0.
- A committed binary fails the tripwire, as Q6 says: a planted PNG gives `verify failed: tripwire`.
- `verify` does not check spike code. A badly typed `.ts` and a `.swift` file under the spike both leave it at exit 0.
- The root `.gitignore` has no `.build/` or `xcuserdata/` line, and AC8 bars editing it, so the spike needs its own (`cat .gitignore`).

## The merge (PM, 2026-11-04, after it)

This lands here because changing the brief before the merge would have moved the reviewed head.

Cursor's re-read ([issuecomment-6634510153](https://github.com/BeniCheni/keel/pull/19#issuecomment-6634510153)) gave "mergeable" at `4167a98`, with M1 closed and no new finding. Beni ran the PM's counts-only private-list script over the diff, the commits, the PR title and body, the comments, the inline comments and the reviews, and reported a positive control hit and `total hits: 0`. The PM did not open the list. That run came before the merge, so it does not cover the squash message or this section.

**`verify` was red when this merged.** `AGENTS.md` says `main` moves only on a PR with the `verify` check green. Beni waived that for this PR only, on 2026-11-04, in the words "Give me a `gh` command to override/kill the pending `verify` CI instances and merge PR #19 as an admin." The PM told him this broke that rule and gave him a script to run, and he reported "Merged". The rule does not change, and this sets no precedent.

GitHub gave the macOS cells no runner in any of the four attempts of run 41854156542 (`gh api repos/BeniCheni/keel/actions/runs/41854156542/attempts/<N>/jobs`):

| Attempt | Started, UTC | Cancelled, UTC | Steps run in each macOS cell |
| --- | --- | --- | --- |
| 1 | 15:05:43 | 15:20:45 | 0 |
| 2 | 15:23:23 | 15:38:25 | 0 |
| 3 | 15:40:01 | 15:55:03 | 0 |
| 4 | 17:01:33 | 17:16:34 | 0 |

The reason is GitHub's: "The job was not acquired by Runner of type hosted even after multiple attempts", with a notice about macOS arm64 capacity (`gh api repos/BeniCheni/keel/check-runs/126658105704/annotations --jq '.[].message'`). The `verify` job then printed `needs-check: cells result is abandoned`. The Ubuntu cells passed, and `pnpm verify` exited 0 on Node 24.22.2 and 26.13.0 on the PM's Mac at `4167a98`. No code in this PR ran on macOS in CI before it merged.

**What closes it.** A red build is a High, and it was open at the merge. It closes outside tracked files, so it needs a recorded check and Beni's written confirmation. The check: `main`'s own run on the squash, 41885526843, finished green at 18:27 UTC with all five jobs passing, both macOS cells included (`gh api repos/BeniCheni/keel/actions/runs/41885526843/jobs --jq '.jobs[]|[.name,.conclusion]|@tsv'`). The squash's tree equals the reviewed head's, `dd1e2b3` (`git rev-parse '82e4909^{tree}' '4167a98^{tree}'`), and its parent `378dab7` is this PR's base, so that run tested the reviewed tree. In a fresh clone of `main`, `pnpm verify` exited 0 on both Nodes. Beni's merge of this record is his confirmation.

Fast-track has no shadow verdict. This merge would not meet the gate's "`verify` green" clause, so it is no evidence for `gate-activation.md`.

**How the bypass ran.** The `main` ruleset had no bypass actor, so `gh pr merge --admin` alone could not merge (`gh api repos/BeniCheni/keel/rulesets/26183786 --jq .current_user_can_bypass` printed `never`). The versions, from `gh api repos/BeniCheni/keel/rulesets/26183786/history` and `.../history/<id>`, in America/New_York:

| Version | When | State |
| --- | --- | --- |
| 55678243 | 2026-10-31 13:31:03 | What `AGENTS.md` describes: squash only, `verify` required, threads resolved, no bypass |
| 56286804 | 2026-11-04 12:12:14 | The `pull_request` rule removed |
| 56286959 | 2026-11-04 12:12:58 | That rule back with merge, squash and rebase allowed, thread resolution off, and extra approval for unattributed changes on |
| 56299579 | 2026-11-04 13:16:28 | 55678243's rules, plus a bypass for repository admins on pull requests |
| 56299597 | 2026-11-04 13:16:35 | 55678243's rules, with no bypass |

The merge is at 13:16:32 (`gh pr view 19 --repo BeniCheni/keel --json mergedAt`), so the bypass was on for 7 seconds. The ruleset now equals 55678243 on its name, target, enforcement, bypass actors, conditions and rules, and `current_user_can_bypass` prints `never`. The two 12:12 edits came before the PM's script and are not from it. The history gives the actor's type as `User`, and `gh api repos/BeniCheni/keel/collaborators --jq '.[]|[.login,.role_name]|@tsv'` lists one admin, Beni.
