# Pass 0 brief: PR #22 (S90 amendment to Q2's locale check, after the spike's first commit)

Written by the PM on 2026-11-04 (America/New_York), from a fresh read of the PR. The same Claude session wrote the PR and this brief, so the cold review is the only cold read. This brief steers that review and seals nothing.

## Seat for the cold review

Codex, GPT-6.1 Sol High. `AGENTS.md` asks for one cold review by a vendor that did not write the PR, and a Claude session wrote every line. Cursor is not eligible in practice: it builds the spike, and this changes a gate on its build. Codex read this spec at Pass 2 on PR #16 and PR #19's merge record on PR #20, so it says so in its comment where a change concerns its own earlier read. The seat has no fallback: if it is unavailable, stop and escalate.

## Scope

- Spec: `docs/specs/s90-ios-core-spike.md`. Design brief: none.
- Sensitive paths touched: none (`git diff --name-only origin/main...HEAD` lists the spec and this brief).
- Release: no.
- New dependencies: none.
- Bootstrap path: no. `verify` applies through CI. Mutations and Pass M do not apply, because no code or fixture changes.
- Spike code: it exists, on draft PR #21 at `ff4fc35`, one commit by Cursor. This PR touches none of it.

## Why this PR exists

On PR #21, `sh spike/ios-core/run-parity.sh` exits 1 with `reason=locale`: the 31 payloads match, and JavaScriptCore records `en-US` and `en`. As registered, that fails clause 1 and selects Path B, for a reason about how the system resolves a language and not about the core. Beni ruled "Yes, amend first" on 2026-11-04, on "Amend Q2's locale check before the device runs?" That ruling was given in the PM's session, so Codex cannot see it, and Beni's merge confirms it.

| # | Clause as merged | What happens | Change |
| --- | --- | --- | --- |
| 1 | Q2 compares under `en_US` and `haw_US` in both engines | JavaScriptCore resolves `haw` to `en` | JavaScriptCore's second locale is `sv_SE`. Node keeps `haw_US` and adds `sv_SE` |
| 2 | Q2 calls the two-locale test "the check that nothing else depends on locale" | With the old bug put back, it sees nothing on the 31 fixtures in any locale (rows 7 and 8 below) | A reversed-comparator run, a tie input that gates, and a new mutant |
| 3 | A run fails only if an engine's two runs report the same locale | `en-US` against `en` passes that wording | A run also fails if its locale does not start with the language it asked for |
| 4 | AC11 follows the spec's latest version | `ff4fc35` predates this PR, and AC8 bars merging `main` into the branch | AC11 pins `82e4909` and allows exactly one later version |

**What this is not.** It is not pre-registered. It came after spike code, and after `bytes=match` on macOS was known. Only the device numbers are still unknown. The decision rule's text and the thresholds do not change (`awk '/^## Decision rule/,/^## Non-goals/' docs/specs/s90-ios-core-spike.md | shasum` prints `0b1d5259a12c2752195776adb7be3ebbf737086c` on this branch and on `main`), but this change decides whether clause 1 can pass, and the results must say so.

## Authorship record

From `git log --format='%h %an' origin/main..HEAD`.

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| Every commit on the branch, this brief's included | Claude | Codex |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or numbering fork. One cold review by a vendor that wrote none of the PR replaces Passes 1 to 2.5, as on PR #19. Fast-track changes review depth only: Beni still merges in shadow mode, and "fast-track" goes in the squash message.

## What to check, beyond the skill's standing checks

1. **Scope.** Does the spec change only in its status line, one ruling paragraph, Q2's comparison, locale check and iPhone bullets, three new Q2 bullets, AC3, AC11 and one mutant? `git diff origin/main...HEAD -- docs/adr` should print nothing.
2. **The probe.** Run it. Do its rows match the table, and does the spec's text say only what they show?
3. **Strength.** Could a run written to the new wording pass a bundle that depends on locale? What does a reversed comparator miss? The wording covers `localeCompare`, `Intl.Collator` and the `toLocale` methods, and row 4 shows no call to any of them in either bundle.
4. **Direction.** Clause 1 can now pass where it could not. Is that only the removal of a false failure, or does it let a real locale dependency through? Should the Region setting be tried before `haw_US` is given up in JavaScriptCore?
5. **The second locale.** `sv` reorders non-ASCII letters and not these keys. Is there a better choice among what JavaScriptCore honors?
6. **AC11.** Run the script below. Does the new form hold in every case, and fail closed? Does AC8 still hold for `ff4fc35`?
7. **By construction.** Does any clause now fail by construction, the way `haw_US` did? Consider clause 1's "both locales" beside Node's three, and the reversed run and tie input on the iPhone.
8. **Private list.** This seat runs the owner's private-list check, counts only, over the diff, the commit messages, the PR title and body, every comment and its own proposed comment.

## The probe

This is the PM's plan probe. It is not the spike's check, the builder need not use it, and it is not committed as code. Save it outside the clone as `probe.sh`, then run `bash probe.sh <clone>` on Node 24.22.2 and macOS, in a fresh clone of `s90/ios-core-spike` at `ff4fc35`. It needs Xcode. It puts the removed `localeCompare` back in `dedupe` in that clone and reverts it, and changes no system setting.

```bash
#!/usr/bin/env bash
# Usage: bash probe.sh <fresh clone of s90/ios-core-spike at ff4fc35>, on Node 24.22.2.
# It puts localeCompare back in dedupe in that clone, then reverts it. It commits and pushes nothing, and changes no system setting.
set -u
clone="$1"
cd "$clone" || exit 1
test -z "$(git status --porcelain)" || { echo "clone is not clean"; exit 1; }
export KEEL_DATA_DIR="$(mktemp -d)"
out="$(mktemp -d)"
cat > "$out/stub.js" <<'JS'
(function () {
  var rev = function (a, b) { a = String(a); b = String(b); return a < b ? 1 : a > b ? -1 : 0; };
  String.prototype.localeCompare = function (other) { return rev(this, other); };
  var C = Intl.Collator;
  Intl.Collator = function () { var c = new C(); Object.defineProperty(c, "compare", { get: function () { return rev; } }); return c; };
  Intl.Collator.prototype = C.prototype;
})();
JS
python3 -I - "$out/tie.yaml" <<'PY' || exit 1
import re, sys
t = open("fixtures/synthetic/terms/valid/minimal.yaml", encoding="utf-8").read()
for pat in (r"call:\n[\s\S]*?(?=premium:)", r"barrier:\n[\s\S]*?(?=economics:)", r"economics:\n[\s\S]*?(?=sources:)"):
    t, n = re.subn(pat, "", t, count=1)
    assert n == 1, pat
open(sys.argv[1], "w", encoding="utf-8").write(t)
PY
git ls-files fixtures/synthetic/terms | grep '\.yaml$' | LC_ALL=C sort > "$out/f31.txt"
printf '%s\n' "$out/tie.yaml" > "$out/tie.txt"
pnpm install --frozen-lockfile > /dev/null 2>&1 || { echo "root install failed"; exit 1; }
pnpm --dir spike/ios-core --ignore-workspace install --frozen-lockfile > /dev/null 2>&1 || { echo "spike install failed"; exit 1; }

echo "=== 1. run-parity.sh in a clone that has never built the host"
sh spike/ios-core/run-parity.sh > "$out/p1.log" 2>&1
echo "exit=$?"
grep -cE 'No such file' "$out/p1.log"

swift build --package-path spike/ios-core --product keel-spike-host > /dev/null 2>&1 || { echo "swift build failed"; exit 1; }
host="$(swift build --package-path spike/ios-core --product keel-spike-host --show-bin-path)/keel-spike-host"
test -x "$host" || { echo "no host"; exit 1; }

echo "=== 2. run-parity.sh with the host built"
sh spike/ios-core/run-parity.sh > "$out/p2.log" 2>&1
echo "exit=$?"
grep -E '^(bytes=|locale-check|reason=)' "$out/p2.log"

echo "=== 3. default locale in a JSContext, by launch arguments"
for pair in "en-US en_US" "en-GB en_GB" "sv sv_SE" "de de_DE" "lt lt_LT" "et et_EE" "cs cs_CZ" "tr tr_TR" "ja ja_JP" "haw haw_US" "mi mi_NZ"; do
  set -- $pair
  printf '%-6s -> ' "$1"
  "$host" -AppleLanguages "($1)" -AppleLocale "$2" parity --root "$clone" --variant standalone --list "$out/tie.txt" 2>/dev/null | grep -m1 'KEEL_SPIKE v1 locale' | sed -E 's/.*locale=//'
done

echo "=== 4. locale API calls in the built bundles"
for v in compile standalone; do printf '%s: ' "$v"; grep -cE 'localeCompare|toLocale|Intl\.' "spike/ios-core/dist/$v.js"; done

hash_of() { grep -v '^KEEL_SPIKE' "$1" | sed -E "s#$out/##g" | shasum | cut -c1-10; }
node_run() { LC_ALL="$1.UTF-8" node spike/ios-core/parity-node.mjs "$clone" "$2" > "$out/o" 2>/dev/null; hash_of "$out/o"; }
jsc_run() { "$host" -AppleLanguages "($1)" -AppleLocale "$2" parity --root "$clone" --variant "$3" --list "$4" > "$out/o" 2>/dev/null; hash_of "$out/o"; }
table() {
  printf 'node:'; for lc in en_US haw_US sv_SE et_EE; do printf ' %s=%s' "$lc" "$(node_run "$lc" "$1")"; done; echo
  node spike/ios-core/build.mjs > /dev/null || { echo "build failed"; exit 1; }
  for v in compile standalone; do
    printf '%s:' "$v"
    for pair in "en-US en_US" "sv sv_SE" "et et_EE" "haw haw_US"; do set -- $pair; printf ' %s=%s' "$1" "$(jsc_run "$1" "$2" "$v" "$table_list")"; done
    cp "spike/ios-core/dist/$v.js" "$out/$v.keep"
    { cat "$out/stub.js"; cat "$out/$v.keep"; } > "spike/ios-core/dist/$v.js"
    printf ' reversed=%s\n' "$(jsc_run en-US en_US "$v" "$table_list")"
    cp "$out/$v.keep" "spike/ios-core/dist/$v.js"
  done
}

echo "=== 5. core as merged, 31 fixtures"; table_list="$out/f31.txt"; table "$table_list"
echo "=== 6. core as merged, tie input"; table_list="$out/tie.txt"; table "$table_list"
python3 -I - packages/core/src/terms/load.ts <<'PY' || exit 1
import re, sys
p = sys.argv[1]
t = open(p, encoding="utf-8").read()
new, n = re.subn(r"\(left\.path < right\.path \? -1 : left\.path > right\.path \? 1 : 0\)", "left.path.localeCompare(right.path)", t)
assert n == 1, n
open(p, "w", encoding="utf-8").write(new)
PY
echo "=== 7. localeCompare back in dedupe, 31 fixtures"; table_list="$out/f31.txt"; table "$table_list"
echo "=== 8. localeCompare back in dedupe, tie input"; table_list="$out/tie.txt"; table "$table_list"
git checkout -q -- packages/core/src/terms/load.ts
node spike/ios-core/build.mjs > /dev/null
echo "=== reverted, status=[$(git status --porcelain)]"
```

What it printed, on Node 24.22.2 and macOS 27.2. Each cell is the first 10 characters of a `shasum` over the payload lines:

| Row | Input | Node: `en_US`, `haw_US`, `sv_SE`, `et_EE` | JavaScriptCore, both variants: `en-US`, `sv`, `et`, `haw` | JavaScriptCore, both variants: reversed |
| --- | --- | --- | --- | --- |
| 5 | Core as merged, 31 fixtures | all `10fa772915` | all `10fa772915` | `10fa772915` |
| 6 | Core as merged, tie input | all `4f542f2cab` | all `4f542f2cab` | `4f542f2cab` |
| 7 | `localeCompare` back, 31 fixtures | all `10fa772915` | all `10fa772915` | `10fa772915` |
| 8 | `localeCompare` back, tie input | `4f542f2cab`, except `haw_US` **`dbff9cc416`** | all `4f542f2cab` | **`5f91b72658`** |

Rows 1 to 4:

- **Row 1:** in a clone that has never built the host, `run-parity.sh` exits 1 with one `No such file` line.
- **Row 2:** with the host built, it exits 1 with `bytes=match`, `locale-check status=fail node=en-US,haw-US jscontext=en-US,en` and `reason=locale`.
- **Row 3:** launch arguments give `en-US`, `en-GB`, `sv-SE`, `de-DE`, `lt-LT`, `et-EE`, `cs-CZ`, `tr-TR` and `ja-JP` as asked. `haw` and `mi` give `en`.
- **Row 4:** `localeCompare`, `toLocale` and `Intl.` appear on 0 lines of each built bundle.

Limits:

- This ran on macOS only. Whether the iPhone honors `sv_SE` or `haw` is unknown until Beni's first device launch.
- The Region setting was not tried, because that changes a system setting.
- The PM does not know why JavaScriptCore drops `haw`.
- The probe's stub reverses `localeCompare` and `Intl.Collator` only. The spec's wording also covers the `toLocale` methods, which the builder adds.
- A comparator run proves something only on the inputs it runs. The tie input is the one input known to reach a tie.

## The AC11 script

Run it with `bash`. It works in throwaway repos and touches no clone.

```bash
#!/usr/bin/env bash
# Tests the amended AC11 in throwaway repos. Touches no clone of keel. Each case prints the command's exit code.
set -u
spec=docs/specs/s90-ios-core-spike.md
mk() { d="$(mktemp -d)"; cd "$d" || exit 1; git init -q -b main .; git config user.name t; git config user.email noreply@anthropic.com; mkdir -p docs/specs; echo a > "$spec"; git add .; git commit -qm start; }
ac11() { first="$(git rev-list --reverse origin/main..HEAD | head -1)"; git merge-base --is-ancestor "$BASE" "$first" && test "$(git rev-list --count "$BASE"..origin/main -- "$spec")" = 1; echo "$1: exit $?"; }
fake_origin() { git update-ref refs/remotes/origin/main "$1"; }
spike() { git switch -q -c spike "$1"; echo s > s; git add s; git commit -qm spike; }
main_commit() { git switch -q main; echo "$1" >> "$2"; git add "$2"; git commit -qm "$1"; }
# the real shape: spike cut from BASE, then one amendment on main
mk; BASE="$(git rev-parse HEAD)"; spike "$BASE"; main_commit amend "$spec"; fake_origin main; git switch -q spike; ac11 "cut from base, one amendment"
# an unrelated main move as well
mk; BASE="$(git rev-parse HEAD)"; spike "$BASE"; main_commit amend "$spec"; main_commit other other.md; fake_origin main; git switch -q spike; ac11 "cut from base, one amendment, unrelated move"
# the amendment has not merged
mk; BASE="$(git rev-parse HEAD)"; spike "$BASE"; fake_origin main; git switch -q spike; ac11 "cut from base, no amendment yet"
# a second amendment
mk; BASE="$(git rev-parse HEAD)"; spike "$BASE"; main_commit amend "$spec"; main_commit amend2 "$spec"; fake_origin main; git switch -q spike; ac11 "cut from base, two amendments"
# cut before the base
mk; OLD="$(git rev-parse HEAD)"; main_commit base "$spec"; BASE="$(git rev-parse HEAD)"; spike "$OLD"; main_commit amend "$spec"; fake_origin main; git switch -q spike; ac11 "cut before the base"
# no origin/main: the first-commit lookup and the count both fail
mk; BASE="$(git rev-parse HEAD)"; spike "$BASE"; first="$(git rev-parse HEAD)"; git merge-base --is-ancestor "$BASE" "$first" && test "$(git rev-list --count "$BASE"..origin/main -- "$spec" 2>/dev/null)" = 1; echo "no origin/main: exit $?"
```

| Case | Exit |
| --- | --- |
| Cut from the base, one amendment | 0 |
| Cut from the base, one amendment, an unrelated move on `main` | 0 |
| Cut from the base, no amendment yet | 1 |
| Cut from the base, two amendments | 1 |
| Cut before the base | 1 |
| No `origin/main` | 1 |

So AC11 exits 1 until this PR merges, and a further amendment has to edit AC11 again.

## Left for the builder

These go in Cursor's follow-up prompt, not the spec. Each is a fact about PR #21 at `ff4fc35`:

- `run-parity.sh` calls `swift build ... --show-bin-path`, which prints the path without building, so AC3's command does not reproduce in a fresh clone (row 1). A setup error is not a result.
- The mutation floor's `same-locale` baseline, `--prove locales-differ`, accepts `en-US` against `en` (PR #21's body).
