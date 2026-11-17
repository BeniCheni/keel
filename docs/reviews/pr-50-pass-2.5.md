# Executive brief: PR #50, Pass 2.5, 2026-11-16 America/New_York

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim. Seat: a fresh Claude Code 2.1.325 session on claude-opus-5-5 at high effort (AGENTS.md's Pass 2.5 pin for a PR with no sensitive path; no fallback), in a fresh clone at 1cb0f7a2d12184329e7115289447984d2bcdacbe with origin/main at 5069a3478a9a6d57486e7909b44845f9807d66a1 and docs/pr-50-records at 69d8a8c3b43df68603f4a2f5fb5fb7427086d58f, all three checked with gh pr view 50 --repo BeniCheni/keel --json headRefOid and git rev-parse. KEEL_DATA_DIR was an empty mktemp -d folder. The sandbox blocked gh (TLS), so gh, git fetch and pnpm ran with the sandbox off. Date from TZ=America/New_York date.

## Decision

Shadow mode: the gate says "would escalate", because F1 to F4 and R1 are open Highs under AGENTS.md's Severity clause (a tracked High closes only with a fix commit carrying a failing-first test, and a spec PR cannot carry one), which makes the formal verdict "not mergeable". No other gate clause fails. Beni merges.

## What ships

- A build authority for S91, the first iOS code meant to merge: an app under apps/ios/ that imports one terms file through the Files app, validates it with @keel/core in JavaScriptCore, keeps it under ADR-0009's storage rules, and shows one read-only screen with what arrived, "N of M verified", and the observation schedule with each generated date labelled ESTIMATE.
- The guards ADR-0009's Consequences require before any app merges: copy lint over Swift, a source and a binary network check, a bundle-imports check, a Swift CI job, and new sensitive paths.
- ADR-0009's amendment: one narrow iOS slice may build alongside Milestone 1, and a bare terms file is an interim data path until the export slice. Desktop stays the system of record.
- What it still declines to claim: no figure, no notification, no field-level provenance, no import of closes, observations or alerts. The screen says that none of those arrived.

## What the passes found

- Pass 1 (Codex, plan challenge, at 97d8457): 16 findings, 4 High, 11 Medium, 1 Low (gh api repos/BeniCheni/keel/issues/comments/6930324512 --jq .body | grep -c -E '^\*\*F[0-9]+ · High ' prints 4, Medium 11, Low 1). F1: the first-run privacy promise exceeded the Files boundary. F2: the Swift network rule missed URL-taking Foundation reads. F3: the bundle check read metafile inputs, which omit externals. F4: the screen did not require ESTIMATE or the listed entries' null dates. F5 to F16 cover the interim data path, About placement, story scope, failure paths, the determinism assertion, the parity oracle, CI toolchain, sensitive paths, signing controls, the device procedure, copy routing and the index row.
- Pass 2 (Codex, at 0e8c5d1): 6 fixed, 10 open, 4 new Mediums N1 to N4 (locale-mutant parity, generated rule copy, unavailable reasons, device schedule coverage). Pass M: N/A (no engine or golden change).
- Re-reads (Codex): at 47bbbdd 15 fixed, 5 open, R1 (High: criterion 4 required the healthy bundle to fail parity under the reversed comparator) and R2 to R4 (Medium). At 9c2a905 19 fixed, 5 open, S1 (Medium: the binary check had no controls for connect and getaddrinfo). At 1cb0f7a 20 fixed, 5 open, 0 new. Each count is reproduced by the PR body's own Review-log commands; this seat re-ran all fifteen.
- Pass 2.5 corroboration: F1 maps to criterion 5's file-provider row (spec line 109), F2 to criterion 7 (line 115), F3 to criterion 3 (line 103), F4 to criterion 5's ESTIMATE and null-date row (line 106), and R1 to criterion 4's reversed-comparator pair (line 104). Each criterion fails without its rule. F4's premise holds in packages/core/src/schedule/types.ts (GeneratedEntry.label is "ESTIMATE", ListedEntry.date is string or null). R1 holds in Node (r1-tie.mts below): the tie input's three diagnostics all sit at line 1, column 1, so a reversed localeCompare in dedupe orders them economics, call, barrier against the shipped barrier, call, economics. Core, yaml 2.9.1 and ajv 8.20.0 call no locale API (grep -rlE 'localeCompare|toLocale|Intl\.' over packages/core/src minus tests, yaml's browser/dist and dist, and ajv's dist: 0 files each). F3's metafile premise and R1's JavaScriptCore half are Codex's claims, because esbuild is not installed at this head (ls node_modules/.pnpm | grep -c '^esbuild@' prints 0). Every other fixed finding was checked against the spec lines its seat-record evidence names.
- New at Pass 2.5, for the PM to amend:
  - U1, Medium, spec line 3. The status line names amendments after Pass 1, Pass 2 and Pass 2's re-read, and omits 1cb0f7a, the amendment after the second re-read.
  - U2, Low, spec line 113. The closing note names F1 to F4 as the Highs the build closes, and leaves out R1, which closes by criterion 4.
  - U3, Medium, spec line 84. xcode-27 is listed in GitHub's hosted-runner docs for public repositories, but actions/runner-images (README at f40a752, issue 14404, open) marks its image as a public preview. The spec calls it "the GitHub-hosted label" and makes swift a need of verify on every PR, with no plan if the preview breaks. That would block Milestone 1's PRs too. This adds to F11; it does not contest it.
  - U4, Medium, spec lines 79 to 80. A scratch arm64-apple-ios27.0 binary calling String(contentsOf:encoding:) links a symbol that criterion 7's five-API pattern matches 0 times, so the bare contentsOf source token is its only guard. That token also matches append(contentsOf:) and insert(contentsOf:at:), which compile in plain code. A builder who narrows it reopens F2's path.
  - U5, Low, docs/README.md line 42. The new row names reviews/pr-50-pass-0.md and pr-50-pass-1.5.md. git cat-file -e HEAD:docs/reviews/pr-50-pass-0.md exits 128, and both files exist only on docs/pr-50-records. PR #28's spec squash carried its records; this one will not.
- Contested: nothing. Every record comment has 0 "status": "contested" entries, every PM disposition accepts, and this seat contests no Codex disposition.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Install | pnpm install --frozen-lockfile, by verify-pin.sh | exit 0 on Node 24.22.2 and on 26.13.0, pnpm 10.28.2 |
| Verify | pnpm verify (Node floor and current) | exit 0 on both. Core 178 tests in 16 files, plugin 212 in 12, tooling 126 in 11, on each. git status --porcelain --untracked-files=all prints nothing, and KEEL_DATA_DIR holds 0 entries after each |
| Determinism | the skill's pnpm fixtures:regen && sh -c '…' command | exit 0; pnpm -s fixtures:trees prints fixtures/synthetic/terms and fixtures/golden |
| Zero network | pnpm verify:network | exit 0 (the macOS in-process guard; the Linux namespace probe runs in CI) |
| Mutations | n/a | N/A: no code or test change |
| Pass M | python3 tools/reference/payoff.py fixtures/golden/ | N/A: no engine or golden fixture change |
| UI matrix | n/a | N/A: no UI |
| Demo mode | grep -c -i demo README.md | prints 0, exit 1. N/A under idea 50, not green |
| README quickstart | each block's commands | the 8 verify:* steps exit 0. pnpm --filter @keel/core test schedule: 7 files, 122 tests. A plugin filter matching no file exits 1, as the README says it must. pnpm test:tooling -- tripwire: 1 file, 44 tests. fixtures:regen exits 0 |
| Checks at head | gh api repos/BeniCheni/keel/commits/1cb0f7a2d12184329e7115289447984d2bcdacbe/check-runs --jq '.total_count, (.check_runs[] \| [.name,.status,.conclusion,.head_sha] \| @tsv)' | 5 runs (verify and four cells), all completed and success at 1cb0f7a |
| Claims table | each row's own command | all 9 rows reproduce: 3 paths; 3 files, 146 insertions, 1 deletion; 5 × Claude; sensitive-path diff exits 0 and prints nothing; the four exports; 2 valid fixtures; 500 ms and 50 ms; copy lint exit 0; the install and verify row as above |
| Review log | the body's grep -c commands | 16; 6, 10, 4; 15, 5, 4; 19, 5, 1; 20, 5, 0 |
| Authorship | git log --format='%h %an <%ae>' origin/main..HEAD | 5 commits (97d8457, 0e8c5d1, 47bbbdd, 9c2a905, 1cb0f7a), all Claude <noreply@anthropic.com>, no Codex commit. Each was cold-read by Codex at its own head (Pass 1, Pass 2, three re-reads, per their comments) |
| Diff | git diff --name-status origin/main...HEAD; git diff --check origin/main...HEAD | M docs/README.md, M docs/adr/0009-ios-companion-and-core.md, A docs/specs/s91-ios-foundation.md; --check exit 0 |
| Honesty tests | git diff origin/main...HEAD -- '*.honesty.test.ts' \| wc -c | 0 |
| Tripwire | tripwire-review.sh | see Privacy below |
| Seat record | validate-seat.mjs with ajv 8.20.0 dist/2020 against seat-record-1.1.json | valid, 1 json block, 30 findings, on the file posted and on GitHub's stored copy |

Privacy, per class, from tripwire-review.sh (the planted control is synthetic, written to a file, never printed):

| Scan | Exit | cusip | account | ssn | address | email | price | local-only | unscannable | allowlist | vendors |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Clone | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| PR body | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| PR body with a planted check-digit-valid control | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Pass 2.5 comment | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

The private-list check is Codex's claim: it reports 0 matches at Pass 1, Pass 2 and each re-read. This seat's comment (issuecomment-6937655844) posted after Codex's last check, so the PM's handoff scan must cover it. No Claude seat opened the owner's list.

Not re-run, and why:
- Codex's compiled probes: the five binary controls, F2's typecheck forms, F3's esbuild metafile probe, and the JavaScriptCore parity runs behind F10, N1 and R1. The prompt names the compiled controls as Codex's evidence, and esbuild is not installed here.
- The xcode-27 swift job, which is future build work.
- Criterion 12's device run, which is Beni's.
- pnpm test:ci-evidence, which needs a failure run id and is outside pnpm verify.
- The PM's historical run times.

## Estimates and model output

None. No figure in this PR comes from a model or an assumption.

## Risks and accepted costs

- Five Highs stay open into the build, and these tests close them:
  - F1, criterion 5: a render-model test that fails when the first-run rows lack the file-provider text before the picker's action.
  - F2, criterion 7: a whitespace-blind source check, with planted Data(contentsOf : url) and Darwin.socket, and a binary nm -u check that fails on each of five separately compiled controls (URLSession, Data(contentsOf:), socket, connect, getaddrinfo).
  - F3, criterion 3: a bundle-imports check that fails on any external import record and on any plugin-mln or montecarlo input, with planted fs, node:fs and plugin-mln entries against a passing baseline.
  - F4, criterion 5: render-model tests that fail when a generated row lacks ESTIMATE, or when a listed row with a null date shows a date.
  - R1, criterion 4: the bundle as built matches the Node oracle under S90's reversed comparator, and a scratch bundle with localeCompare put back in dedupe differs on the tie input.
- The build's swift job depends on the xcode-27 runner label, a public preview (U3). Because swift is a need of the aggregate verify on every PR, an outage there blocks Milestone 1 too. Any change to verify.yml is itself a sensitive-path PR.
- The build PR touches sensitive paths: .github/workflows/** and AGENTS.md, and then apps/ios/** and tools/ios/**. Its Claude seats take the Fable pins (Pass 1 on Fable 5.2 Extra, Pass 2.5 on Fable 5.2 High), Codex takes Extra High, fast-track is barred, and Beni merges it.
- Criterion 12 is a device run only Beni can do: five fresh launches under the 500 ms and 50 ms medians, three fixture imports with digests, and one non-fixture import that logs no digest. The build cannot be called complete without it.
- elenchus flags the repeated records until it gains a re-read value. PR #50 carries four pass "1.5" records (the PM's 6934678381, 6935532782, 6936163804, 6936573307) and four pass "2" records (Codex's 6935224748, 6935881288, 6936488699, 6936865047), by grep -o '"pass": "[^"]*"' over each comment body.
- The guards stop accidental network use, not deliberate evasion: a selector string or dlsym slips past both a token list and nm -u. The spec does not claim more, and this is not raised as a finding.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes: a non-release slice numbered S91 by Beni's ruling 2 (confirm, question 4) |
| Verdict mergeable, every High closed (fix commit with a failing-first test, or for a High outside tracked files, a recorded remediation check plus Beni's confirmation) | No: F1 to F4 and R1 are open; the verdict is "not mergeable" |
| Nothing contested | Yes |
| verify green at tip; every number re-run | Yes: 5 of 5 check runs succeed at 1cb0f7a; every number reported here was re-run, except those labelled Codex's claim |
| No sensitive path, dependency or schema change | Yes: the sensitive-path diff prints nothing; no package.json or lockfile change; esbuild is approved for the build PR, not added here |
| Every commit cold-read by a non-author vendor (authorship record) | Yes: 5 Claude commits, each read by Codex |
| Gate verdict | would escalate |
| Beni's decision (filled after) | |

Requirements beyond ruling 3's one screen and ADR-0009's guards, none found to widen the screen:
- The signing check (criterion 8) traces to hard rule 1.
- The digest gate traces to ruling 5.
- The load-time re-measure traces to ADR-0009's "Revisit when".
- The parity test traces to ADR-0009's Path A premise.
- The SnapshotStore failure handling traces to ADR-0009's Storage and Data path.
Every criterion, 1 to 12, can fail as written.

## Questions for Beni

1. May PR #50 merge with F1 to F4 and R1 open, to close when the S91 build lands criteria 3, 4, 5 and 7's tests? (Yes / No)
2. Should the PM amend the spec for U1 to U5 before the merge? (Yes / No) A Yes moves the head, which then needs Codex's re-read of the amendment and a fresh Pass 2.5 re-run.
3. Keep swift a required need of verify on the xcode-27 preview label (U3)? (Yes / No)
4. Confirm rulings 1 and 2, S91 as a non-release slice building alongside Milestone 1? (Confirm / No)

## Handoff block

Proposed squash, for the current head only. If the PM amends for U1 to U5, the reviewed head and the review paragraph change. This is plain text; the PM's handoff adds the private-list scan of the late comments and the merge itself.

```
Subject: docs(specs): S91 iOS foundation spec, and ADR-0009's sequencing amendment (#50)

Adds docs/specs/s91-ios-foundation.md, the first iOS slice meant to merge: an app under apps/ios/ that imports one terms file through the Files app, validates it with @keel/core in JavaScriptCore (Path A), and shows one read-only screen, with the guards ADR-0009 requires before any app merges. Amends ADR-0009's status with Beni's ruling of 2026-11-16 that this one narrow slice may build alongside Milestone 1, with a bare terms file as an interim data path until the export slice. Indexes S91 in docs/README.md. No code changes.

Review: spec PR. Codex's Pass 1, the plan challenge, at 97d8457 found 4 Highs, 11 Mediums and a Low, which 0e8c5d1 answered. Codex's Pass 2 at 0e8c5d1 left ten open and found four Mediums, which 47bbbdd answered. Its re-read at 47bbbdd found a High and three Mediums, which 9c2a905 answered. Its second re-read at 9c2a905 found one Medium, which 1cb0f7a answered, and its third re-read at 1cb0f7a found none. The Pass 2.5 synthesis by Claude at 1cb0f7a re-ran every number and found three Mediums and two Lows in spec and index text. F1 to F4 and R1 stay open until the S91 build lands their failing-first tests, by Beni's ruling on merging with them open. Reviewed head 1cb0f7a2d12184329e7115289447984d2bcdacbe.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
```

The trailers are checked against git log --format='%an <%ae>' origin/main..HEAD (5 × Claude <noreply@anthropic.com>) and the review comments (Codex gave Pass 1, Pass 2 and three re-reads). After the merge: gh pr view 50 --repo BeniCheni/keel --json mergeCommit gives the squash commit, which origin/main must equal.

## Scripts this brief rests on

verify-pin.sh, run as sh verify-pin.sh <version> <clone> <logdir> for 24.22.2 and 26.13.0:

```sh
#!/bin/sh
v="$1"; clone="$2"; logs="$3"
PATH="$HOME/.nvm/versions/node/v$v/bin:$PATH"; export PATH
KEEL_DATA_DIR="$(mktemp -d "$logs/kd-$v.XXXXXX")" || exit 2; export KEEL_DATA_DIR
cd "$clone" || exit 2
rm -rf node_modules packages/*/node_modules tools/*/node_modules apps/*/node_modules
echo "node $(node --version) pnpm $(pnpm --version)"
pnpm install --frozen-lockfile > "$logs/install-$v.log" 2>&1; echo "install_exit=$?"
pnpm verify > "$logs/verify-$v.log" 2>&1; echo "verify_exit=$?"
st="$(git status --porcelain --untracked-files=all)"; echo "git_status_exit=$? lines=$(printf '%s' "$st" | grep -c .)"
python3 -I -c 'import os; print("keel_data_dir_entries", len(os.listdir(os.environ["KEEL_DATA_DIR"])))'
```

Test counts came from grep -E 'Test Files|Tests ' on each verify log.

r1-tie.mts, run as node r1-tie.mts <clone> from packages/core:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const clone = process.argv[2];
const core = await import(pathToFileURL(join(clone, "packages/core/src/index.ts")).href);
const text = readFileSync(join(clone, "fixtures/synthetic/terms/valid/minimal.yaml"), "utf8")
  .replace(/call:\n[\s\S]*?(?=premium:)/, "")
  .replace(/barrier:\n[\s\S]*?(?=economics:)/, "")
  .replace(/economics:\n[\s\S]*?(?=sources:)/, "");
const r = core.loadTerms(text, "tie.yaml");
if (r.ok) { console.log("tie input loaded ok: no diagnostics"); process.exit(1); }
const errs = r.errors.map((e: any) => ({ line: e.line, column: e.column, path: e.path, code: e.code }));
const shipped = [...errs].sort((a, b) => a.line - b.line || a.column - b.column || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
const reversedLocale = [...errs].sort((a, b) => a.line - b.line || a.column - b.column || -a.path.localeCompare(b.path));
console.log("shipped order", shipped.map((e) => e.path).join(","));
console.log("mutant order under reversed comparator", reversedLocale.map((e) => e.path).join(","));
console.log(JSON.stringify(shipped) === JSON.stringify(reversedLocale) ? "orders match" : "orders differ");
```

The U4 probe, on the local iPhoneOS 27.2 SDK; the binaries are built but never launched:

```sh
P="$(mktemp -d)"; export CLANG_MODULE_CACHE_PATH="$P/cc"; sdk="$(xcrun --sdk iphoneos --show-sdk-path)"
printf '%s\n' 'var bytes: [UInt8] = [1]' 'bytes.append(contentsOf: [2, 3])' 'bytes.insert(contentsOf: [0], at: 0)' 'print(bytes)' > "$P/append.swift"
printf '%s\n' 'import Foundation' '_ = try? String(contentsOf: URL(fileURLWithPath: "synthetic"), encoding: .utf8)' > "$P/string.swift"
for f in append string; do swiftc -sdk "$sdk" -target arm64-apple-ios27.0 -module-cache-path "$P/mc" "$P/$f.swift" -o "$P/$f" || exit; tr -d ' \t' < "$P/$f.swift" | grep -c contentsOf; done
nm -u "$P/string" | xcrun swift-demangle | grep -c -E 'URLSession|Data\.init\(contentsOf:|_socket$|_connect$|_getaddrinfo$'
```

It printed compile exit 0 twice, contentsOf on 2 lines and on 1 line, and 0 pattern hits. The demangled symbol is String.init(contentsOf:encoding:).

tripwire-review.sh, run as sh tripwire-review.sh <clone> <workdir> <pr-body-file> <comment-file>:

```sh
#!/bin/sh
clone="$1"; work="$2"; body="$3"; comment="$4"
classes="cusip account ssn address email price local-only unscannable allowlist vendors"
cli="$clone/tools/tripwire/cli.mjs"
mkdir -p "$work" || exit 2
row() {
  out="$work/$1.tsv"
  [ -n "$2" ] && [ -d "$2/.git" ] || { echo "$1: no repo to scan"; exit 2; }
  node "$cli" "$2" > "$out" 2> "$work/$1.err"; rc=$?
  [ "$rc" -le 1 ] || { echo "$1: scan error rc=$rc"; exit 2; }
  line="| $1 | $rc |"
  for c in $classes; do line="$line $(cut -f1 "$out" | grep -c -x "$c") |"; done
  echo "$line"
}
mkrepo() {
  r="$work/repo-$1"; rm -rf "$r"; mkdir -p "$r/tools/tripwire" || exit 2
  git -C "$r" init -q || exit 2
  cp "$clone/tools/tripwire/allowlist.txt" "$clone/tools/tripwire/vendors.txt" "$r/tools/tripwire/" || exit 2
  git -C "$r" add -A && git -C "$r" -c user.name=Claude -c user.email=noreply@anthropic.com commit -q -m base || exit 2
  git -C "$r" update-ref refs/remotes/origin/main HEAD || exit 2
  cp "$2" "$r/surface.md" || exit 2
  if [ "${3:-}" = control ]; then
    node --input-type=module -e "import { cusipCheckDigit } from '$clone/tools/tripwire/scan.mjs'; const b = 'ZQ' + String(Date.now() % 1000000).padStart(6, '0'); process.stdout.write('planted control ' + b + cusipCheckDigit(b) + '\n');" > "$r/control.md" || exit 2
  fi
  git -C "$r" add -A && git -C "$r" -c user.name=Claude -c user.email=noreply@anthropic.com commit -q -m surface || exit 2
  echo "$r"
}
echo "| Scan | Exit | $(echo $classes | sed 's/ / | /g') |"
row clone "$clone"
row pr-body "$(mkrepo pr-body "$body")"
row pr-body-with-control "$(mkrepo pr-body-control "$body" control)"
row comment "$(mkrepo comment "$comment")"
```

The comment's table rows were prefilled before the scan, so the scanned bytes are the posted bytes. The scan's output equalled those rows. GitHub's stored body differs from the file only by jq's trailing newline.

validate-seat.mjs, run as node validate-seat.mjs <clone>/node_modules/.pnpm/ajv@8.20.0/node_modules/ajv/dist/2020.js seat-record-1.1.json comment.md. The schema came from gh api repos/BeniCheni/elenchus/contents/schema/seat-record-1.1.json --jq .content | base64 -D.

```js
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const [ajvPath, schemaPath, commentPath] = process.argv.slice(2);
const Ajv2020 = (await import(pathToFileURL(ajvPath).href)).default;
const text = readFileSync(commentPath, "utf8");
const m = text.match(/```json\n([\s\S]*?)\n```\s*$/);
if (!m) { console.error("no trailing fenced json block, or text after it"); process.exit(1); }
const record = JSON.parse(m[1]);
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(JSON.parse(readFileSync(schemaPath, "utf8")));
const ok = validate(record);
console.log(`json blocks=${text.split("```json").length - 1} valid=${ok} findings=${record.findings.length}`);
if (!ok) { console.error(JSON.stringify(validate.errors, null, 1)); process.exit(1); }
```

Runner label sources:
- gh api repos/actions/runner-images/readme (main at f40a752b24f9f5c2380d5bf53f91353ca122f7e7, 2026-11-16) lists Xcode 27 as preview with labels xcode-27 or xcode-27-xlarge.
- images/macos/xcode-27-arm64-Readme.md, image 20261104.0337.1, lists iphoneos27.0 to 27.2.
- images/macos/macos-26-arm64-Readme.md tops out at iphoneos26.5.
- gh api repos/actions/runner-images/issues/14404 is open and titled "Xcode 27 is now available as a public preview".
- docs.github.com/en/actions/reference/runners/github-hosted-runners lists xcode-27 beside macos-latest for public repositories.
