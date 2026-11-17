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
| Beni's decision (filled after) | Ruled on 2026-11-16 that PR #50 may merge with F1 to F4 and R1 open, after the PM amends the spec for U1 to U5 (ruling 8). Merged on 2026-11-17 at squash `b703841`, reviewed head `51cd526`, after Codex's fourth to sixth re-reads and the Pass 2.5 re-run |

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

# Executive brief: PR #50, Pass 2.5 re-run, 2026-11-17 America/New_York

Every number below comes from a command run in this session. A number taken from a PR body or comment is labelled as that vendor's claim. Seat: Claude Code 2.1.325 on claude-opus-5-5 at high effort, AGENTS.md's Pass 2.5 pin for a PR with no sensitive path, no fallback. Model and effort come from all 91 assistant records in this session's own transcript at the time of the check. The fresh clone was at 51cd5264d957ad1800d740ce6111357d0afd7223, with origin/main at 5069a3478a9a6d57486e7909b44845f9807d66a1 and docs/pr-50-records at 0c4884dda833d4d34dff4568adef47a3c211b395. All three were checked with gh pr view 50 --repo BeniCheni/keel --json headRefOid and git rev-parse. KEEL_DATA_DIR was an empty mktemp -d folder and held 0 entries at the end. The sandbox failed gh's certificate check and refused mktemp in the system temp folder, so gh, git fetch, pnpm and the compiled probes ran with the sandbox off. The date comes from TZ=America/New_York date.

**This is not the session that gave the first Pass 2.5.** The prompt called this the same session. The first pass's seat record (issuecomment-6937655844) names session 5919fca3-f88b-4c7c-a913-b21de874fe34. This session is d2072d8a-482f-4762-8627-a73806c75502, and its transcript begins with the prompt at 2026-11-17T17:35:16Z. I asked Beni in this chat. He answered "Yes (Recommended)" to holding the re-run here as a fresh Pass 2.5 seat, which AGENTS.md allows: a fresh Claude session, not the PM, that wrote no commit or fix. He also answered "Yes (Recommended)" to my reading 5919fca3's transcript only for the brief comparison below.

## Decision

Shadow mode: the gate says "would escalate". F1 to F4 and R1 are open Highs under AGENTS.md's Severity clause: a High in tracked files closes only with a fix commit carrying a failing-first test, and a spec PR cannot carry one. That makes the formal verdict "not mergeable", and it is the only gate clause that fails. verify is green at 51cd526: Beni's re-run of the cancelled macOS Node 26 cell passed. Beni ruled on 2026-11-16 that the spec may merge with F1 to F4 and R1 open. That ruling is his call, not the gate's. Beni merges.

## What ships

- A build authority for S91, the first iOS code meant to merge. The app under apps/ios/ imports one terms file through the Files app and validates it with @keel/core in JavaScriptCore. It keeps the file under ADR-0009's storage rules and shows one read-only screen: what arrived, "N of M verified", and the observation schedule with each generated date labelled ESTIMATE.
- The guards ADR-0009 requires before any app merges:
  - copy lint over Swift and over ruleFor's literals;
  - a source and a binary network check working from one allowlist, with a control that fails by each binary rule alone;
  - a bundle-imports check;
  - a required Swift CI job;
  - new sensitive paths.
- ADR-0009's amendment: one narrow iOS slice may build alongside Milestone 1, and a bare terms file is an interim data path until the export slice. Desktop stays the system of record.
- What it still declines to claim: no figure, no notification, no field-level provenance, no import of closes, observations or alerts. The screen says none of those arrived.

## What the passes found

- **Pass 1 (Codex, plan challenge, at 97d8457):** 16 findings, 4 High, 11 Medium, 1 Low. The count is gh api repos/BeniCheni/keel/issues/comments/6930324512 --jq .body piped to grep -c -E '^\*\*F[0-9]+ · High ', which prints 4; Medium prints 11 and Low 1. The Highs are F1 (the first-run privacy promise and the Files boundary), F2 (URL-taking Foundation reads), F3 (metafile externals) and F4 (ESTIMATE and null dates on the screen). 0e8c5d1 answered them.
- **Pass 2 (Codex):**
  - At 0e8c5d1: 6 fixed, 10 open, and N1 to N4 new. Answered in 47bbbdd.
  - Re-read at 47bbbdd: 15 fixed, 5 open, and R1 (High) plus R2 to R4 new. Answered in 9c2a905.
  - Second re-read at 9c2a905: 19 fixed, 5 open, and S1 new. Answered in 1cb0f7a.
  - Third re-read at 1cb0f7a: 20 fixed, 5 open, 0 new.
  - Pass M: N/A on every read, since no engine or golden change.
- **Pass 2.5 (Claude, session 5919fca3, at 1cb0f7a):** not mergeable, would escalate. It found U1 to U5: three Mediums and two Lows. 869b71c answered them.
- **Pass 2 (Codex), continued:**
  - Fourth re-read at 869b71c: U1 to U5 closed; 25 fixed, 5 open, and V1 to V3 new (Mediums). Answered in 6279d03 and in 7ab320f on the records branch.
  - Fifth re-read at 6279d03: 28 fixed, 7 open (F1 to F4, R1, W1, W2), and W1 and W2 new (Mediums). Answered in 51cd526 and in 0c4884d on the records branch.
  - Sixth and last re-read at 51cd526: 30 fixed, 5 open (F1 to F4, R1), 0 new, verdict "not mergeable". Run on its seat record with the PR body's fenced jq commands.
- **Pass 2.5 re-run corroboration:**
  - Every Review-log count reproduces by the body's own commands: 16; 6, 10, 4; 15, 5, 4; 19, 5, 1; 20, 5, 0; 5; 25, 5, 3; 28, 7, 2.
  - The open Highs still map to criteria that can fail: F1 to line 110, F2 to line 116, F3 to line 104, F4 to line 107, R1 to line 105.
  - F4's premise holds: packages/core/src/schedule/types.ts line 37 is label: "ESTIMATE", and line 50 is date: string | null.
  - R1's Node half reproduces (r1-tie.mts: shipped barrier,call,economics; reversed economics,call,barrier; orders differ).
  - W1: the PM's per-rule probe exits 0, and its output equals the record line for line. W2 is answered by the squash text in this brief.
  - The earlier U4 probe and the V2 probe also reproduce: U4 prints string url-contentsOf=1, nsdata selector=1, allowed all 0, and V2's output equals its record.
  - U1 to U5 are closed at the head; the table below gives the evidence.
- **New at this re-run, for the S91 build review's list under ruling 10:**
  - **Y1, Medium, spec lines 79 to 81 and 116.** Criterion 7 says that, with a scratch allowlist that wrongly lists them, InputStream(url:) still fails "by the initWithURL: rule alone". Guard 2's rule list at line 81 has no such rule. There, initWithURL: appears only as an example of the allowlist-gated rule "any other selector containing URL … not on the allowlist". Line 79 says initWithURL: never goes on the allowlist, but not that the binary check fails on it whatever the allowlist says.
  - So a check built from line 81 alone passes InputStream(url:) under the wrong allowlist. The PM's probe shows this: "stream (wrong allowlist): exit 1, by initWithURL alone", so without that rule the control exits 0. A Foundation-only binary trips no framework rule.
  - Criterion 7 still catches it, so this is not High. The build needs the allowlist-independent initWithURL: rule that criterion 7 assumes. It must not weaken the control, and it must not reject the wrong allowlist up front, since then no binary rule would run at all.
- **Contested:** nothing. Every PM disposition accepts, the sixth record has no "contested" status, and this seat contests no Codex disposition.

U1 to U5 at 51cd526:

| # | Command | Result | Closed? |
| --- | --- | --- | --- |
| U1 | sed -n 3p docs/specs/s91-ios-foundation.md, against git log of origin/main..HEAD | Names the amendments after Pass 1, Pass 2, the first two re-reads, Pass 2.5, and the fourth and fifth re-reads. That matches 0e8c5d1, 47bbbdd, 9c2a905, 1cb0f7a, 869b71c, 6279d03 and 51cd526; the third re-read found nothing | Yes |
| U2 | sed -n 114p of the spec, grep -o for F1 to F4 and R1 | All five named, each with its criterion | Yes |
| U3 | sed -n 85p of the spec | "public preview", the outage path, and ruling 6 | Yes |
| U4 | sed -n 81p and 116p of the spec | contentsOf: Foundation.URL and ContentsOfURL rules; String(contentsOf:encoding:), NSData(contentsOf:) and append(contentsOf:) controls | Yes |
| U5 | sed -n 42p docs/README.md; git cat-file -e on origin/docs/pr-50-records for pass-0, 1.5 and 2.5 | Three records named, on the records branch until its records PR merges; each exits 0 there and 128 at HEAD | Yes |

The archived brief is word for word. docs/reviews/pr-50-pass-2.5.md at 0c4884d has 249 lines. It equals lines 1 to 249 of the fenced brief in session 5919fca3's reply of 2026-11-17T03:51:25Z (transcript line 695). diff prints only that reply's closing fence and the Insight block after it, which were not part of the brief.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Install | pnpm install --frozen-lockfile, Node 24.22.2 and 26.13.0, pnpm 10.28.2 | exit 0 on both |
| Verify | pnpm verify (Node floor and current) | exit 0 on both. On each, core ran 178 tests in 16 files, plugin 212 in 12, and tooling 126 in 11, and all eight verify steps report ok. Afterwards git status --porcelain --untracked-files=all prints nothing, and KEEL_DATA_DIR holds 0 entries |
| Determinism | the skill's pnpm fixtures:regen && sh -c '…' command | exit 0; trees fixtures/synthetic/terms and fixtures/golden |
| Zero network | pnpm -s verify:network | exit 0 |
| Mutations | n/a | N/A: no code or test change |
| Pass M | python3 tools/reference/payoff.py fixtures/golden/ | N/A: no engine or golden fixture change |
| UI matrix | n/a | N/A: no UI |
| Demo mode | grep -c -i demo README.md | prints 0, exit 1. N/A under idea 50, never green |
| README quickstart | blocks 2 to 5 | All 8 verify:* steps exit 0. The core filter on schedule ran 7 files and 122 tests. A plugin filter matching no file exits 1. test:tooling on tripwire ran 1 file and 44 tests. fixtures:regen exits 0 |
| Claims table | each row's own command | All 9 rows reproduce: 3 paths; 3 files, 147 insertions, 1 deletion; 8 × Claude; the sensitive-path diff prints nothing; the four exports; 2 valid fixtures; 500 ms and 50 ms; copy lint exit 0; the install and verify row as above |
| Review log | the body's grep -c commands and its fenced jq block | 16; 6, 10, 4; 15, 5, 4; 19, 5, 1; 20, 5, 0; U 5; 25, 5, 3; fifth 28, 7, 2. The same jq on the sixth record gives 30, 5 |
| Diff | git diff --name-status, --numstat and --check origin/main...HEAD | M docs/README.md (2 added, 1 removed), M docs/adr/0009-ios-companion-and-core.md (1 added), A docs/specs/s91-ios-foundation.md (144 added). --check exits 0 |
| Authorship | git log --format='%h %an <%ae>' origin/main..HEAD; git rev-list --count | 8 commits, all Claude <noreply@anthropic.com>: 97d8457, 0e8c5d1, 47bbbdd, 9c2a905, 1cb0f7a, 869b71c, 6279d03, 51cd526. Codex's eight seat records give input_sha equal to each, one per commit, and 0 commits of their own |
| Honesty tests | git diff origin/main...HEAD -- '*.honesty.test.ts' \| wc -l | 0 |
| Per-rule probe | the "After Pass 2's fifth re-read" sh block of pass-1.5.md at 0c4884d, extracted by awk and run with bash | exit 0; its output equals the record's text block (diff exit 0); Xcode 27.2, iPhoneOS SDK 27.2, binaries never launched |
| Earlier probes | the U4 and V2 sh blocks of the same file | U4 as recorded; V2 exit 0 and equal to its record |
| Spec facts | git ls-tree at 5069a34; git ls-files --error-unmatch on 12 named paths | 33 yaml files, as criterion 4 states; every named path tracked |
| Checks at head | gh api repos/BeniCheni/keel/commits/51cd5264d957ad1800d740ce6111357d0afd7223/check-runs | 5 of 5 completed success: verify and the four cells, run 44134766478, attempt 2. In attempt 1 the macOS Node 26 cell was cancelled with no runner and verify failed (below) |
| Tripwire | node tools/tripwire/cli.mjs ., and tripwire-rerun.sh | exit 0, no output; per class below |
| Seat record | validate-seat.mjs, with ajv 8.20.0 dist/2020, against seat-record-1.1.json | below, in the comment |

Privacy, per class, from tripwire-rerun.sh. The planted control is synthetic, written to a file in a throwaway repository and never printed:

| Scan | Exit | cusip | account | ssn | address | email | price | local-only | unscannable | allowlist | vendors |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Clone | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| PR body | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| pass-1.5.md at 0c4884d | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| This comment | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| This brief | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| All four with a planted check-digit-valid control | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

The private-list check is Codex's claim, not re-run here: it reports 0 matches at every read, the last at 2026-11-17T17:28:49Z. This brief and this seat's comment come after that check, so the PM's handoff scan covers them. No Claude seat opened the owner's list.

Not re-run, and why:
- These are Codex's compiled or installed evidence, and this seat did not repeat them: F2's typecheck forms; F3's esbuild metafile probe (esbuild is not installed at this head, and ls node_modules/.pnpm | grep -c '^esbuild@' prints 0); and the JavaScriptCore parity runs behind F10, N1 and R1. R1's Node half was re-run.
- Codex's private-list counts, by the prompt.
- The build's swift job on xcode-27, which is future build work, and criterion 12's device run, which is Beni's.
- pnpm test:ci-evidence, which needs a failure run id and is outside pnpm verify.
- The PM's historical run times in the body's Claims header and in the probes' printed timestamps. This seat re-ran each probe at its own time (UTC): per-rule probe 17:48:05 to 17:48:13, U4 and V2 17:50:16 to 17:50:24.

## Estimates and model output

None. No figure in this PR comes from a model or an assumption.

## Risks and accepted costs

- Five Highs stay open into the build. These tests close them:
  - F1, criterion 5 (line 110): a render-model test that fails when the first-run rows lack the file-provider text before the picker's action.
  - F2, criterion 7 (line 116):
    - a whitespace-blind source check against the one allowlist, with planted Data(contentsOf : url), Darwin.socket, append(contentsOf:) and import PDFKit;
    - a binary check whose every rule has a scratch control that fails by that rule alone;
    - the named failing controls, and a passing control that calls only append(contentsOf:) and FileHandle(forReadingFrom:).
  - F3, criterion 3 (line 104): a bundle-imports check that fails on any external import record and on plugin-mln or montecarlo inputs, with planted fs, node:fs and plugin-mln entries against a passing baseline.
  - F4, criterion 5 (line 107): render-model tests that fail when a generated row lacks ESTIMATE, or when a listed row with a null date shows a date.
  - R1, criterion 4 (line 105): the bundle as built matches the Node oracle under S90's reversed comparator, and a scratch bundle with localeCompare put back in dedupe differs on the tie input.
- The build's swift job runs on xcode-27, a public-preview image, and it is a need of the aggregate verify on every pull request (ruling 6).
  - The image is arm64 only: README line 30 of actions/runner-images lists xcode-27 or xcode-27-xlarge, arm64, with a preview badge, and issue 14404, "Xcode 27 is now available as a public preview", is open.
  - GitHub's own annotations show the arm64 capacity limit today. Attempt 1 at 51cd526 cancelled the macOS Node 26 cell (job 134221171809) with "The job was not acquired by Runner of type hosted even after multiple attempts" and three notices of capacity limits on macOS arm64 runners, so verify (job 134231138522) failed. The same cell was cancelled at 6279d03 (run 44114059557, job 134147147117, verify failed).
  - Both times a re-run was the fix. Under the build, the same queueing or cancellation of swift blocks every pull request, Milestone 1's included, until a re-run passes or Beni merges a verify.yml change (a sensitive path). Ruling 6 accepts that cost.
- Y1 goes to the build review: the binary check needs the allowlist-independent initWithURL: rule that criterion 7 tests.
- The build PR touches sensitive paths: .github/workflows/** and AGENTS.md, then apps/ios/** and tools/ios/**. Its Claude seats take the Fable pins (Pass 1 on Fable 5.2 Extra, Pass 2.5 on Fable 5.2 High), Codex takes Extra High, fast-track is barred, and Beni merges it.
- Criterion 12 is a device run only Beni can do: five fresh launches under the 500 ms and 50 ms medians, three fixture imports with digests, and one non-fixture import that logs no digest.
- elenchus will flag repeated records until it gains a re-read value. By grep -o '"pass": "[^"]*"' over each comment body, PR #50 carries 7 pass "1.5" records from the PM, 7 pass "2" records from Codex, and, with this one, 2 pass "2.5" records.
- The guards stop accidental network use, not deliberate evasion: a selector built at run time, or dlsym, slips past both a token list and nm -u. The spec does not claim more.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes. A non-release slice, numbered S91 by Beni's ruling 2; he confirmed rulings 1 and 2 on 2026-11-16 |
| Verdict mergeable, every High closed (fix commit with a failing-first test, or for a High outside tracked files, a recorded remediation check plus Beni's confirmation) | No. F1 to F4 and R1 are open, and the verdict is "not mergeable" |
| Nothing contested | Yes |
| verify green at tip; every number re-run | Yes. 5 of 5 check runs succeed at 51cd526 (run 44134766478, attempt 2). Every number this brief gives as its own was re-run; the ones not re-run are labelled as a vendor's claim and listed above |
| No sensitive path, dependency or schema change | Yes. The sensitive-path diff prints nothing, and package.json and the lockfile are unchanged. esbuild is approved for the build PR, not added here |
| Every commit cold-read by a non-author vendor (authorship record) | Yes. 8 Claude commits, each read by Codex at its own head |
| Gate verdict | would escalate |
| Beni's decision (filled after) | Ruled on 2026-11-16 that PR #50 may merge with F1 to F4 and R1 open (ruling 8); his call, not the gate's. Merged on 2026-11-17 at squash `b703841`, reviewed head `51cd526` |

Every acceptance criterion, 1 to 12, can fail as written:
- 1, 2, 3, 6, 7, 8, 9 and 10 each turn on an exit code or on empty output.
- 4 and 5 require each test to fail when its rule breaks.
- 11 turns on two named check conclusions at the head.
- 12 is Beni's device run against the two medians and the digest log.

No criterion widens the screen beyond ruling 3, and none goes beyond ADR-0009's guards. 51cd526 adds controls for the existing binary rules and the UIApplication.shared.open(_:) failing control; Codex's sixth re-read reached the same reading.

## Questions for Beni

1. Do rulings 8, 9 and 10 stand as docs/reviews/pr-50-pass-1.5.md at 0c4884d records them? You gave them in the PM's session, which this seat cannot see. (Confirm / No)
2. Does ruling 8, merging PR #50 with F1 to F4 and R1 open, hold at the new head 51cd526? (Yes / No)

## Handoff block

The proposed squash text, for 51cd526 only. It is plain text and replaces the archived brief's squash text (W2). The PM's handoff adds the private-list scan of the late comments and of this message, the Review-log rows for the sixth re-read and this re-run, and the merge itself. This seat prints no merge command.

```
Subject: docs(specs): S91 iOS foundation spec, and ADR-0009's sequencing amendment (#50)

Adds docs/specs/s91-ios-foundation.md, the first iOS slice meant to merge: an app under apps/ios/ that imports one terms file through the Files app, validates it with @keel/core in JavaScriptCore (Path A), and shows one read-only screen, with the guards ADR-0009 requires before any app merges. Amends ADR-0009's status with Beni's ruling of 2026-11-16 that this one narrow slice may build alongside Milestone 1, with a bare terms file as an interim data path until the export slice. Indexes S91 in docs/README.md. No code changes.

Review: spec PR, eight Claude commits, each cold-read by Codex at its own head. Codex's Pass 1, the plan challenge, at 97d8457 found 4 Highs, 11 Mediums and a Low. Codex's Pass 2 and its six re-reads found 4, then 4 (one High), 1, 0, 3, 2 and 0 more. The Pass 2.5 synthesis by Claude at 1cb0f7a found 5. Each was answered in the spec, the index or the records branch. Codex's sixth and last re-read at 51cd526 found nothing new.

The Pass 2.5 re-run by Claude at 51cd526 re-ran these numbers: install and verify on Node 24.22.2 and 26.13.0 (core 178, plugin 212 and tooling 126 tests on each); every row of the PR body's Claims table; every Review-log count; the diff (3 files, 147 insertions, 1 deletion); the eight commit authors; the tripwire per class over the clone, the PR body, the Pass 1.5 records, its own comment and brief, with a planted control; the per-rule binary-check probe and the earlier U4 and V2 probes; and R1's Node tie check. These are vendors' claims, not re-run: Codex's private-list counts, F2's typecheck forms, F3's esbuild metafile probe and the JavaScriptCore parity runs behind F10, N1 and R1. The re-run found one Medium, Y1, for the S91 build review's list.

F1 to F4 and R1 stay open until the S91 build lands their failing-first tests: F1 and F4 by criterion 5, F2 by 7, F3 by 3 and R1 by 4. They are open by Beni's ruling of 2026-11-16 that the spec merges with them open; the shadow gate would escalate. Reviewed head 51cd5264d957ad1800d740ce6111357d0afd7223.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
```

The trailers are checked against git log --format='%an <%ae>' origin/main..HEAD, which gives 8 × Claude <noreply@anthropic.com>, and against the review comments: Codex gave Pass 1, Pass 2 and six re-reads, and Claude gave both Pass 2.5 passes. After the merge, gh pr view 50 --repo BeniCheni/keel --json mergeCommit gives the squash commit, which origin/main must equal.

## Scripts this brief rests on

The installs and verifies ran as one loop, once per version, from the clone with KEEL_DATA_DIR exported:

```sh
for v in 24.22.2 26.13.0; do L=<logdir>/node-$v.log; export PATH="<nvm>/v$v/bin:<pnpm>:<PATH>"
  { echo "== node $(node -v) pnpm $(pnpm -v)"; pnpm install --frozen-lockfile; echo "INSTALL_EXIT=$?"; pnpm verify; echo "VERIFY_EXIT=$?"
    echo "STATUS_LINES=$(git status --porcelain --untracked-files=all | wc -l)"
    echo "DATADIR_COUNT=$(python3 -I -c 'import os; print(len(os.listdir(os.environ["KEEL_DATA_DIR"])))')"; } > $L 2>&1; done
```

Test counts came from grep -E 'Test Files|Tests ' on each log.

The probes were extracted from the records file at 0c4884d and run as printed:

```sh
git show 0c4884dda833d4d34dff4568adef47a3c211b395:docs/reviews/pr-50-pass-1.5.md > p15.md
awk '/^## After Pass 2.s fifth re-read/{section=1} section && /^```sh$/{capture=1;next} capture && /^```$/{exit} capture{print}' p15.md > probe.sh
bash probe.sh > probe.out 2>&1; echo "PROBE_EXIT=$?"
awk '/^## After Pass 2.s fifth re-read/{s=1} s&&/^```text$/{c=1;next} c&&/^```$/{exit} c{print}' p15.md > probe.expected
diff probe.expected probe.out
```

The U4 and V2 probes were extracted the same way from the first sh block after the "## After Pass 2.5" and "## After Pass 2's fourth re-read" headings. probe.sh has SHA-256 63f38e3934a28b475351a4b17dc7e9877962b88d972ea3ad16d612ba3bd52a96.

The brief comparison ran over session 5919fca3's transcript, which Beni allowed in this chat:

```python
# python3 -I compare.py <transcript.jsonl> <outdir>: keeps the last assistant text holding the brief's title
import json, sys
T, S = sys.argv[1], sys.argv[2]; hits = []
for i, l in enumerate(open(T)):
    d = json.loads(l)
    if d.get('type') != 'assistant': continue
    for c in d.get('message', {}).get('content', []) or []:
        if c.get('type') == 'text' and 'Executive brief: PR #50' in c['text']: hits.append((i, d.get('timestamp'), c['text']))
open(S + '/brief-from-transcript.md', 'w').write(hits[-1][2])
```

Then sed -n '/^# Executive brief/,$p' brief-from-transcript.md > bt.md and diff bt.md pass-2.5.md, where pass-2.5.md is git show 0c4884d:docs/reviews/pr-50-pass-2.5.md.

R1's tie check is r1-tie.mts exactly as printed in the archived brief, run as node r1-tie.mts <clone> from packages/core. validate-seat.mjs is exactly as printed there too.

tripwire-rerun.sh, run as sh tripwire-rerun.sh <clone> <workdir> <pr-body> <pass-1.5-at-0c4884d> <comment> <brief>. It is the first pass's tripwire-review.sh, extended to more surfaces:

```sh
#!/bin/sh
clone="$1"; work="$2"; body="$3"; p15="$4"; comment="$5"; brief="$6"
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
  name="$1"; shift
  r="$work/repo-$name"; rm -rf "$r"; mkdir -p "$r/tools/tripwire" || exit 2
  git -C "$r" init -q || exit 2
  cp "$clone/tools/tripwire/allowlist.txt" "$clone/tools/tripwire/vendors.txt" "$r/tools/tripwire/" || exit 2
  git -C "$r" add -A && git -C "$r" -c user.name=Claude -c user.email=noreply@anthropic.com commit -q -m base || exit 2
  git -C "$r" update-ref refs/remotes/origin/main HEAD || exit 2
  i=0
  for f in "$@"; do
    if [ "$f" = control ]; then
      node --input-type=module -e "import { cusipCheckDigit } from '$clone/tools/tripwire/scan.mjs'; const b = 'ZQ' + String(Date.now() % 1000000).padStart(6, '0'); process.stdout.write('planted control ' + b + cusipCheckDigit(b) + '\n');" > "$r/control.md" || exit 2
    else
      i=$((i + 1)); cp "$f" "$r/surface-$i.md" || exit 2
    fi
  done
  git -C "$r" add -A && git -C "$r" -c user.name=Claude -c user.email=noreply@anthropic.com commit -q -m surface || exit 2
  echo "$r"
}
echo "| Scan | Exit | $(echo $classes | sed 's/ / | /g') |"
row clone "$clone"
row pr-body "$(mkrepo pr-body "$body")"
row pass-1.5-at-0c4884d "$(mkrepo p15 "$p15")"
row this-comment "$(mkrepo comment "$comment")"
row this-brief "$(mkrepo brief "$brief")"
row all-four-with-planted-control "$(mkrepo combined "$body" "$p15" "$comment" "$brief" control)"
```

The privacy rows in this brief and in the comment were filled in before the scan, so the bytes scanned are the bytes posted. The scan's output equalled those rows.

## Records note

Added by the PM for the records PR. The two executive briefs above are the seats' texts, read as data from their session transcripts. The first is the markdown block of session `5919fca3-f88b-4c7c-a913-b21de874fe34`'s reply of 2026-11-17T03:51:25Z, 249 lines, SHA-256 `ae2d34e9a850ae5914daeb69d87c9d1bea80854d2e83c36f58cb8e32ab91b135`. The re-run's is the markdown block of session `d2072d8a-482f-4762-8627-a73806c75502`'s reply of 2026-11-17T17:58:26Z, 267 lines, SHA-256 `9e9b147fe3a2ec2eea04b302426b767a2a0a8b4a587f92f747b9ae18fde8490e`. Each is extracted by `brief-from-reply.py` below and hashed with `shasum -a 256`. The PM changed one line in each: the gate log's last row, Beni's decision, filled in after the merge.

**The merge.** Beni merged PR #50 on 2026-11-17 at 14:05 EST from the PM's handoff, which ran his private-list scan over the comments, records, body and squash text that came after Codex's last check, and ran `gh pr ready` and `gh pr merge 50 --squash --match-head-commit 51cd5264d957ad1800d740ce6111357d0afd7223` only if every count was zero. The counts are Beni's claim. The PM's checks on a fresh clone of `main`:

- `gh pr view 50 --json mergeCommit` and `git rev-parse origin/main` both give `b7038417447a5dc66e517c7dbc2997d2eee382c5`, and `git rev-list --parents -n1` gives one parent, `5069a3478a9a6d57486e7909b44845f9807d66a1`.
- `git diff --quiet 51cd526 b703841` exits 0: the merged tree is the reviewed head's. The squash body is byte for byte the text the scan read, and carries `Co-authored-by: Claude <noreply@anthropic.com>` and `Co-authored-by: Codex <noreply@openai.com>`.
- `pnpm install --frozen-lockfile` and `pnpm verify` exit 0 on Node 24.22.2 and 26.13.0 (core 178, plugin 212 and tooling 126 tests); `python3 -I tools/reference/payoff.py fixtures/golden/` gives 13 cases agreeing and 0 disagreements; `node tools/tripwire/cli.mjs .` exits 0 with no output.
- `git ls-remote --heads origin docs/s91-spec` prints nothing, and no tag points at `b703841`.
- Push CI on `main`, run 44154829436: in attempts 1 and 2 the macOS Node 26 cell was cancelled without a runner, with GitHub's annotations "The job was not acquired by Runner of type hosted even after multiple attempts" and three notices of capacity limits on macOS arm64 runners; the other three cells passed, so `verify` failed. The same cell had been cancelled the same way at `6279d03` and, before its re-run passed, at `51cd526`.

`brief-from-reply.py`, run as `python3 -I brief-from-reply.py <transcript.jsonl> '<brief title>' <out>`:

```python
# python3 -I brief-from-reply.py <transcript.jsonl> <title> <out>
# Writes the four-backtick markdown block of the last assistant reply whose text holds <title>, and prints its timestamp.
import json, re, sys
transcript, title, out = sys.argv[1:4]
found = None
for line in open(transcript, encoding="utf-8"):
    try:
        entry = json.loads(line)
    except ValueError:
        continue
    message = entry.get("message") or {}
    if message.get("role") != "assistant":
        continue
    for block in message.get("content") or []:
        if isinstance(block, dict) and block.get("type") == "text" and title in block["text"]:
            match = re.search(r"````markdown\n(.*?)\n````", block["text"], re.S)
            if match:
                found = (entry.get("timestamp"), match.group(1))
if found is None:
    sys.exit("no reply holds that title in a markdown block")
open(out, "w", encoding="utf-8").write(found[1] + "\n")
print(found[0])
```
