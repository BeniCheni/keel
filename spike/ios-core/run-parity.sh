#!/bin/sh
# Parity harness for the iOS core spike. Payloads are JSON lines. A locale header is not part of the payload.
# A missing host or a failed build is reason=setup, exit 2. That is not a parity result.
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
cd "$ROOT"
if [ -z "${KEEL_DATA_DIR:-}" ]; then
  KEEL_DATA_DIR=$(mktemp -d)
  export KEEL_DATA_DIR
fi

MODE=full
DEVICE_LOG=
PROVE=bytes
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

while [ $# -gt 0 ]; do
  case "$1" in
    --inject-diff) MODE=diff ;;
    --inject-reorder) MODE=reorder ;;
    --inject-column) MODE=column ;;
    --inject-same-locale) MODE=same-locale ;;
    --inject-fewer) MODE=fewer ;;
    --inject-localecompare) MODE=localecompare ;;
    --inject-one-locale) MODE=one-locale ;;
    --prove) MODE=prove; shift; PROVE=${1:-bytes} ;;
    --compare-device) shift; MODE=device; DEVICE_LOG=$1 ;;
    *) echo "unknown argument" >&2; exit 2 ;;
  esac
  shift
done

if [ "$MODE" = "device" ]; then
  node spike/ios-core/compare-device.mjs "$ROOT" "$DEVICE_LOG"
  exit $?
fi

if ! node spike/ios-core/build.mjs >"$WORK/node-build.txt" 2>&1; then
  echo "reason=setup"
  exit 2
fi
if ! swift build --package-path spike/ios-core --product keel-spike-host >"$WORK/swift-build.txt" 2>&1; then
  echo "reason=setup"
  exit 2
fi
BIN=$(swift build --package-path spike/ios-core --product keel-spike-host --show-bin-path)
HOST=$BIN/keel-spike-host
if [ ! -x "$HOST" ]; then
  echo "reason=setup"
  exit 2
fi

git ls-files fixtures/synthetic/terms | grep '\.yaml$' | LC_ALL=C sort > "$WORK/fixtures.txt"
printf '%s\n' "tie/minimal.yaml" > "$WORK/tie-name.txt"
cat "$WORK/fixtures.txt" "$WORK/tie-name.txt" > "$WORK/list.txt"
FIXTURE_FILES=$(wc -l < "$WORK/fixtures.txt" | tr -d ' ')

run_node() {
  locale_name=$1
  lc=$2
  out=$3
  list=$4
  LC_ALL=$lc node spike/ios-core/parity-node.mjs "$ROOT" "$list" > "$out"
}

run_jsc() {
  variant=$1
  language=$2
  region=$3
  out=$4
  list=$5
  reversed=${6:-}
  if [ "$reversed" = "reversed" ]; then
    "$HOST" -AppleLanguages "($language)" -AppleLocale "$region" parity --root "$ROOT" --variant "$variant" --reversed --list "$list" > "$out"
  else
    "$HOST" -AppleLanguages "($language)" -AppleLocale "$region" parity --root "$ROOT" --variant "$variant" --list "$list" > "$out"
  fi
}

payload() {
  awk '!/^KEEL_SPIKE /' "$1" > "$2"
}

locale_of() {
  awk -F'locale=' '/^KEEL_SPIKE v1 locale / { print $2; exit }' "$1"
}

fixture_count() {
  grep -c '"file":"fixtures/' "$1" || true
}

starts_with() {
  case $1 in
    $2*) return 0 ;;
    *) return 1 ;;
  esac
}

EN_LANG=en-US
EN_REGION=en_US
SV_LANG=sv
SV_REGION=sv_SE
if [ "$MODE" = "same-locale" ]; then
  SV_LANG=$EN_LANG
  SV_REGION=$EN_REGION
fi

LIST=$WORK/list.txt
EN_LIST=$LIST
if [ "$MODE" = "fewer" ]; then
  sed '$d' "$WORK/fixtures.txt" > "$WORK/short-fixtures.txt"
  cat "$WORK/short-fixtures.txt" "$WORK/tie-name.txt" > "$WORK/short.txt"
  EN_LIST=$WORK/short.txt
fi
# One gating run, the standalone reversed sv run, under the en locale.
SV_REV_B_LANG=$SV_LANG
SV_REV_B_REGION=$SV_REGION
if [ "$MODE" = "one-locale" ]; then
  SV_REV_B_LANG=$EN_LANG
  SV_REV_B_REGION=$EN_REGION
fi

# The localeCompare mutant replaces both bundles before any run, and the exit trap rebuilds them clean.
if [ "$MODE" = "localecompare" ]; then
  if [ -n "$(git status --porcelain -- packages)" ]; then echo "reason=setup"; exit 2; fi
  trap 'node spike/ios-core/build.mjs >/dev/null 2>&1 || true; rm -rf "$WORK"' EXIT
  if ! KEEL_SPIKE_DEDUPE=localeCompare node spike/ios-core/build.mjs >"$WORK/mutant-build.txt" 2>&1; then echo "reason=setup"; exit 2; fi
  if [ -n "$(git status --porcelain -- packages)" ]; then echo "reason=setup"; exit 2; fi
  if ! grep -q localeCompare spike/ios-core/dist/compile.js || ! grep -q localeCompare spike/ios-core/dist/standalone.js; then
    echo "reason=setup"
    exit 2
  fi
fi

run_node en en_US.UTF-8 "$WORK/node-en.raw" "$LIST"
run_node haw haw_US.UTF-8 "$WORK/node-haw.raw" "$LIST"
run_node sv sv_SE.UTF-8 "$WORK/node-sv.raw" "$LIST"
run_jsc compile "$EN_LANG" "$EN_REGION" "$WORK/jsc-compile-en.raw" "$EN_LIST"
run_jsc standalone "$EN_LANG" "$EN_REGION" "$WORK/jsc-standalone-en.raw" "$LIST"
run_jsc compile "$SV_LANG" "$SV_REGION" "$WORK/jsc-compile-sv.raw" "$LIST"
run_jsc standalone "$SV_LANG" "$SV_REGION" "$WORK/jsc-standalone-sv.raw" "$LIST"
run_jsc compile haw haw_US "$WORK/jsc-compile-haw.raw" "$LIST"
run_jsc standalone haw haw_US "$WORK/jsc-standalone-haw.raw" "$LIST"
run_jsc compile "$EN_LANG" "$EN_REGION" "$WORK/jsc-compile-en-rev.raw" "$LIST" reversed
run_jsc standalone "$EN_LANG" "$EN_REGION" "$WORK/jsc-standalone-en-rev.raw" "$LIST" reversed
run_jsc compile "$SV_LANG" "$SV_REGION" "$WORK/jsc-compile-sv-rev.raw" "$LIST" reversed
run_jsc standalone "$SV_REV_B_LANG" "$SV_REV_B_REGION" "$WORK/jsc-standalone-sv-rev.raw" "$LIST" reversed

for name in node-en node-haw node-sv jsc-compile-en jsc-standalone-en jsc-compile-sv jsc-standalone-sv jsc-compile-haw jsc-standalone-haw jsc-compile-en-rev jsc-standalone-en-rev jsc-compile-sv-rev jsc-standalone-sv-rev; do
  payload "$WORK/$name.raw" "$WORK/$name.txt"
done

# Output injections change what the gates below read. The gates alone decide whether an injection was caught.
case "$MODE" in
  diff|column|reorder)
    for name in node-haw node-sv jsc-compile-en jsc-standalone-en jsc-compile-sv jsc-standalone-sv jsc-compile-en-rev jsc-standalone-en-rev jsc-compile-sv-rev jsc-standalone-sv-rev; do
      if ! cmp -s "$WORK/node-en.txt" "$WORK/$name.txt"; then echo "reason=preexisting"; exit 4; fi
    done
    if ! node --input-type=module - "$MODE" "$WORK/jsc-compile-en.txt" << 'EOF'
import { readFileSync, writeFileSync } from "node:fs";
const [mode, file] = process.argv.slice(2);
const text = readFileSync(file, "utf8");
let next = text;
if (mode === "diff") {
  const index = text.indexOf("{");
  if (index !== -1) next = `${text.slice(0, index)}[${text.slice(index + 1)}`;
} else if (mode === "column") {
  next = text.replace(/"column":(\d+)/, (_, value) => `"column":${Number(value) + 1}`);
} else {
  const lines = text.split("\n");
  const at = lines.findIndex((line) => line.startsWith("{") && (JSON.parse(line).result?.errors?.length ?? 0) >= 2);
  if (at === -1 || JSON.stringify(JSON.parse(lines[at])) !== lines[at]) process.exit(4);
  const payload = JSON.parse(lines[at]);
  const errors = payload.result.errors;
  [errors[0], errors[1]] = [errors[1], errors[0]];
  lines[at] = JSON.stringify(payload);
  next = lines.join("\n");
}
if (next === text) process.exit(4);
writeFileSync(file, next);
EOF
    then
      echo "reason=setup"
      exit 2
    fi
    ;;
esac

NODE_EN=$(locale_of "$WORK/node-en.raw")
NODE_HAW=$(locale_of "$WORK/node-haw.raw")
NODE_SV=$(locale_of "$WORK/node-sv.raw")
JSC_EN=$(locale_of "$WORK/jsc-compile-en.raw")
JSC_SV=$(locale_of "$WORK/jsc-compile-sv.raw")
JSC_HAW=$(locale_of "$WORK/jsc-compile-haw.raw")
JSC_HAW_B=$(locale_of "$WORK/jsc-standalone-haw.raw")

BYTES=match
for name in node-haw node-sv jsc-compile-en jsc-standalone-en jsc-compile-sv jsc-standalone-sv; do
  cmp -s "$WORK/node-en.txt" "$WORK/$name.txt" || BYTES=differ
done
REVERSED=match
for name in jsc-compile-en-rev jsc-standalone-en-rev jsc-compile-sv-rev jsc-standalone-sv-rev; do
  cmp -s "$WORK/node-en.txt" "$WORK/$name.txt" || REVERSED=differ
done
if cmp -s "$WORK/node-en.txt" "$WORK/jsc-compile-haw.txt" && cmp -s "$WORK/node-en.txt" "$WORK/jsc-standalone-haw.txt"; then
  HAW_BYTES=match
else
  HAW_BYTES=differ
fi

# en does not count as sv. The two gating locales in one engine have to differ.
# haw in JavaScriptCore is reported and does not gate.
LOCALE=pass
starts_with "$NODE_EN" en || LOCALE=fail
starts_with "$NODE_HAW" haw || LOCALE=fail
starts_with "$NODE_SV" sv || LOCALE=fail
if [ "$NODE_EN" = "$NODE_HAW" ] || [ "$NODE_EN" = "$NODE_SV" ] || [ "$NODE_HAW" = "$NODE_SV" ]; then
  LOCALE=fail
fi
# Every gating JavaScriptCore run, both variants and both comparators, reports the locale it asked for.
for name in jsc-compile-en jsc-standalone-en jsc-compile-en-rev jsc-standalone-en-rev; do
  run_locale=$(locale_of "$WORK/$name.raw")
  starts_with "$run_locale" en || LOCALE=fail
  [ "$run_locale" = "$JSC_EN" ] || LOCALE=fail
done
for name in jsc-compile-sv jsc-standalone-sv jsc-compile-sv-rev jsc-standalone-sv-rev; do
  run_locale=$(locale_of "$WORK/$name.raw")
  starts_with "$run_locale" sv || LOCALE=fail
  [ "$run_locale" = "$JSC_SV" ] || LOCALE=fail
done
if [ "$JSC_EN" = "$JSC_SV" ]; then
  LOCALE=fail
fi

COMPILE_COUNT=$(fixture_count "$WORK/jsc-compile-en.txt")
STANDALONE_COUNT=$(fixture_count "$WORK/jsc-standalone-en.txt")
NODE_COUNT=$(fixture_count "$WORK/node-en.txt")
COUNT=pass
if [ "$FIXTURE_FILES" -ne 31 ] || [ "$COMPILE_COUNT" -ne 31 ] || [ "$STANDALONE_COUNT" -ne 31 ] || [ "$NODE_COUNT" -ne 31 ]; then
  COUNT=fail
fi
for name in node-en node-sv jsc-compile-sv jsc-standalone-sv jsc-compile-en-rev jsc-compile-sv-rev; do
  grep -q '"file":"tie/minimal.yaml"' "$WORK/$name.txt" || COUNT=fail
done

echo "fixtures=31 tie=present locales=$NODE_EN,$NODE_HAW,$NODE_SV engines=node,jscontext variants=compile,standalone"
echo "bytes=$BYTES"
echo "reversed=$REVERSED"
echo "haw-jscontext locale=$JSC_HAW,$JSC_HAW_B bytes=$HAW_BYTES"
echo "fixture-count compile=$COMPILE_COUNT standalone=$STANDALONE_COUNT node=$NODE_COUNT status=$COUNT"
echo "locale-check status=$LOCALE node=$NODE_EN,$NODE_HAW,$NODE_SV jscontext=$JSC_EN,$JSC_SV"

# Each injection is caught only through the gate it targets. With that gate gone, the injection survives.
case "$MODE" in
  diff|column|reorder)
    if [ "$BYTES" = "differ" ]; then
      case "$MODE" in
        diff) echo "reason=byte" ;;
        column) echo "reason=column" ;;
        reorder) echo "reason=reorder" ;;
      esac
      exit 1
    fi
    echo "reason=survived"
    exit 3
    ;;
  same-locale|one-locale)
    if [ "$LOCALE" = "fail" ]; then
      if [ "$MODE" = "same-locale" ]; then echo "reason=locale-same"; else echo "reason=locale-run"; fi
      exit 1
    fi
    echo "reason=survived"
    exit 3
    ;;
  fewer)
    if [ "$COUNT" = "fail" ]; then echo "reason=fixture-count"; exit 1; fi
    echo "reason=survived"
    exit 3
    ;;
  localecompare)
    if [ "$REVERSED" = "differ" ]; then
      # The intended catch: the reversed runs differ from Node on the tie input, and on no fixture.
      grep '"file":"fixtures/' "$WORK/node-en.txt" > "$WORK/node-fixtures.txt" || true
      grep '"file":"tie/minimal.yaml"' "$WORK/node-en.txt" > "$WORK/node-tie.txt" || true
      TIE_CAUGHT=yes
      for name in jsc-compile-en-rev jsc-standalone-en-rev jsc-compile-sv-rev jsc-standalone-sv-rev; do
        grep '"file":"fixtures/' "$WORK/$name.txt" > "$WORK/$name-fixtures.txt" || true
        cmp -s "$WORK/node-fixtures.txt" "$WORK/$name-fixtures.txt" || TIE_CAUGHT=no
      done
      grep '"file":"tie/minimal.yaml"' "$WORK/jsc-compile-en-rev.txt" > "$WORK/rev-tie.txt" || true
      cmp -s "$WORK/node-tie.txt" "$WORK/rev-tie.txt" && TIE_CAUGHT=no
      if [ "$TIE_CAUGHT" = "yes" ]; then echo "reason=reversed-tie"; else echo "reason=reversed-other"; fi
      exit 1
    fi
    echo "reason=survived"
    exit 3
    ;;
esac

if [ "$MODE" = "prove" ]; then
  case "$PROVE" in
    bytes)
      if [ "$BYTES" = "match" ] && [ "$REVERSED" = "match" ] && [ "$COUNT" = "pass" ] && [ "$LOCALE" = "pass" ]; then exit 0; fi
      echo "reason=bytes"
      exit 1
      ;;
    count)
      if [ "$BYTES" = "match" ] && [ "$REVERSED" = "match" ] && [ "$COUNT" = "pass" ] && [ "$LOCALE" = "pass" ]; then exit 0; fi
      echo "reason=fixture-count"
      exit 1
      ;;
    locales-differ)
      # en-US against en is not a pass: the second locale has to start with sv, and the two have to differ.
      if [ "$LOCALE" = "pass" ] && starts_with "$JSC_SV" sv && [ "$JSC_EN" != "$JSC_SV" ] && [ "$BYTES" = "match" ] && [ "$REVERSED" = "match" ]; then exit 0; fi
      echo "reason=locale"
      exit 1
      ;;
    reversed)
      if [ "$BYTES" = "match" ] && [ "$REVERSED" = "match" ] && [ "$COUNT" = "pass" ] && [ "$LOCALE" = "pass" ]; then exit 0; fi
      echo "reason=reversed"
      exit 1
      ;;
    *)
      echo "unknown prove" >&2
      exit 2
      ;;
  esac
fi

# Reported, not gating: a locale the legacy map accepts, plus inputs edited in memory.
if [ "$MODE" = "full" ]; then
  run_node extra en_GB.UTF-8 "$WORK/node-gb.raw" "$LIST"
  run_jsc compile en-GB en_GB "$WORK/jsc-gb.raw" "$LIST"
  payload "$WORK/node-gb.raw" "$WORK/node-gb.txt"
  payload "$WORK/jsc-gb.raw" "$WORK/jsc-gb.txt"
  GB_NODE=$(locale_of "$WORK/node-gb.raw")
  GB_JSC=$(locale_of "$WORK/jsc-gb.raw")
  if cmp -s "$WORK/node-gb.txt" "$WORK/jsc-gb.txt"; then GB_BYTES=match; else GB_BYTES=differ; fi
  echo "extra locale=en-GB node=$GB_NODE jscontext=$GB_JSC bytes=$GB_BYTES"
  node spike/ios-core/edge-cases.mjs "$ROOT" "$WORK/edges" >/dev/null
fi

# Edge inputs use their own driver so a throw stays inside the report.
if [ "$MODE" = "full" ]; then
  node --input-type=module - "$ROOT" "$WORK/edges" "$HOST" << 'EOF'
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
const root = process.argv[2];
const dir = process.argv[3];
const host = process.argv[4];
const names = readFileSync(join(dir, "names.txt"), "utf8").split("\n").filter(Boolean);
const core = await import(join(root, "packages/core/src/index.ts"));
const jsc = spawnSync(host, ["-AppleLanguages", "(en-US)", "-AppleLocale", "en_US", "edges", "--root", root, "--variant", "compile", "--edges", dir], { encoding: "utf8" });
const jscLines = new Map();
for (const line of (jsc.stdout || "").split("\n")) {
  const tab = line.indexOf("\t");
  if (tab === -1) continue;
  jscLines.set(line.slice(0, tab), line.slice(tab + 1));
}
for (const name of names) {
  const text = readFileSync(join(dir, name));
  let nodeLine;
  try {
    const file = `edge/${name}`;
    const result = core.loadTerms(text.toString("utf8"), file);
    const payload = { file, result };
    if (result.ok) payload.summary = core.verificationSummary(result.terms);
    nodeLine = JSON.stringify(payload);
  } catch {
    nodeLine = "EDGE-EXCEPTION";
  }
  const other = jscLines.get(name) ?? "EDGE-MISSING";
  const same = nodeLine === other;
  process.stdout.write(`edge name=${name} same=${same}${same ? "" : ` node=${brief(nodeLine)} jsc=${brief(other)}`}\n`);
}

function brief(text) {
  if (!text.startsWith("{")) return text.slice(0, 24);
  const payload = JSON.parse(text);
  const result = payload.result ?? {};
  const errors = Array.isArray(result.errors) ? result.errors : [];
  const first = errors.slice(0, 2).map((error) => `${error.code}:${error.line}:${error.column}`).join(",");
  return `ok=${Boolean(result.ok)} errors=${errors.length} first=${first || "none"}`;
}
EOF
fi

if [ "$BYTES" != "match" ]; then echo "reason=bytes"; exit 1; fi
if [ "$REVERSED" != "match" ]; then echo "reason=reversed"; exit 1; fi
if [ "$COUNT" != "pass" ]; then echo "reason=fixture-count"; exit 1; fi
if [ "$LOCALE" != "pass" ]; then echo "reason=locale"; exit 1; fi
echo "reason=pass"
exit 0
