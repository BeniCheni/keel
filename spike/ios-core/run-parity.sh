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
run_jsc standalone "$SV_LANG" "$SV_REGION" "$WORK/jsc-standalone-sv-rev.raw" "$LIST" reversed

for name in node-en node-haw node-sv jsc-compile-en jsc-standalone-en jsc-compile-sv jsc-standalone-sv jsc-compile-haw jsc-standalone-haw jsc-compile-en-rev jsc-standalone-en-rev jsc-compile-sv-rev jsc-standalone-sv-rev; do
  payload "$WORK/$name.raw" "$WORK/$name.txt"
done

NODE_EN=$(locale_of "$WORK/node-en.raw")
NODE_HAW=$(locale_of "$WORK/node-haw.raw")
NODE_SV=$(locale_of "$WORK/node-sv.raw")
JSC_EN=$(locale_of "$WORK/jsc-compile-en.raw")
JSC_SV=$(locale_of "$WORK/jsc-compile-sv.raw")
JSC_HAW=$(locale_of "$WORK/jsc-compile-haw.raw")
JSC_EN_B=$(locale_of "$WORK/jsc-standalone-en.raw")
JSC_SV_B=$(locale_of "$WORK/jsc-standalone-sv.raw")
JSC_HAW_B=$(locale_of "$WORK/jsc-standalone-haw.raw")
JSC_EN_R=$(locale_of "$WORK/jsc-compile-en-rev.raw")
JSC_SV_R=$(locale_of "$WORK/jsc-compile-sv-rev.raw")

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
starts_with "$JSC_EN" en || LOCALE=fail
starts_with "$JSC_SV" sv || LOCALE=fail
starts_with "$JSC_EN_B" en || LOCALE=fail
starts_with "$JSC_SV_B" sv || LOCALE=fail
starts_with "$JSC_EN_R" en || LOCALE=fail
starts_with "$JSC_SV_R" sv || LOCALE=fail
if [ "$NODE_EN" = "$NODE_HAW" ] || [ "$NODE_EN" = "$NODE_SV" ] || [ "$NODE_HAW" = "$NODE_SV" ]; then
  LOCALE=fail
fi
if [ "$JSC_EN" = "$JSC_SV" ] || [ "$JSC_EN" != "$JSC_EN_B" ] || [ "$JSC_SV" != "$JSC_SV_B" ]; then
  LOCALE=fail
fi
if [ "$JSC_EN_R" != "$JSC_EN" ] || [ "$JSC_SV_R" != "$JSC_SV" ]; then
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

if [ "$MODE" = "diff" ]; then
  if [ "$BYTES" != "match" ] || [ "$REVERSED" != "match" ]; then echo "reason=preexisting"; exit 4; fi
  node --input-type=module - "$WORK/jsc-compile-en.txt" << 'EOF'
import { readFileSync, writeFileSync } from "node:fs";
const file = process.argv[2];
const buf = readFileSync(file);
const index = buf.indexOf(0x7b);
buf[index] = 0x5b;
writeFileSync(file, buf);
EOF
  if cmp -s "$WORK/node-en.txt" "$WORK/jsc-compile-en.txt"; then echo "reason=survived"; exit 3; fi
  echo "reason=byte"
  exit 1
fi

if [ "$MODE" = "column" ]; then
  if [ "$BYTES" != "match" ] || [ "$REVERSED" != "match" ]; then echo "reason=preexisting"; exit 4; fi
  node --input-type=module - "$WORK/jsc-compile-en.txt" << 'EOF'
import { readFileSync, writeFileSync } from "node:fs";
const file = process.argv[2];
const text = readFileSync(file, "utf8");
const next = text.replace(/"column":(\d+)/, (_, value) => `"column":${Number(value) + 1}`);
if (next === text) process.exit(4);
writeFileSync(file, next);
EOF
  if cmp -s "$WORK/node-en.txt" "$WORK/jsc-compile-en.txt"; then echo "reason=survived"; exit 3; fi
  echo "reason=column"
  exit 1
fi

if [ "$MODE" = "reorder" ]; then
  if [ "$BYTES" != "match" ] || [ "$REVERSED" != "match" ]; then echo "reason=preexisting"; exit 4; fi
  MINIMAL=$WORK/two.yaml
  node --input-type=module - "$MINIMAL" << 'EOF'
import { readFileSync, writeFileSync } from "node:fs";
const dest = process.argv[2];
const text = readFileSync("fixtures/synthetic/terms/valid/minimal.yaml", "utf8");
const next = text.replace("schema: mln-terms/0.1\n", "schema: mln-terms/0.1\nnope: 1\nalso: 2\n");
if (next === text) process.exit(4);
writeFileSync(dest, next);
EOF
  printf '%s\n' "$MINIMAL" > "$WORK/one.txt"
  run_node en en_US.UTF-8 "$WORK/re-node.raw" "$WORK/one.txt"
  run_jsc compile "$EN_LANG" "$EN_REGION" "$WORK/re-jsc.raw" "$WORK/one.txt"
  payload "$WORK/re-node.raw" "$WORK/re-node.txt"
  payload "$WORK/re-jsc.raw" "$WORK/re-jsc.txt"
  if ! cmp -s "$WORK/re-node.txt" "$WORK/re-jsc.txt"; then echo "reason=preexisting"; exit 4; fi
  node --input-type=module - "$WORK/re-jsc.txt" << 'EOF'
import { readFileSync, writeFileSync } from "node:fs";
const file = process.argv[2];
const line = readFileSync(file, "utf8").trim();
const payload = JSON.parse(line);
const errors = payload.result && payload.result.errors;
if (!errors || errors.length < 2) process.exit(4);
const first = errors[0];
errors[0] = errors[1];
errors[1] = first;
writeFileSync(file, `${JSON.stringify(payload)}\n`);
EOF
  if cmp -s "$WORK/re-node.txt" "$WORK/re-jsc.txt"; then echo "reason=survived"; exit 3; fi
  echo "reason=reorder"
  exit 1
fi

if [ "$MODE" = "localecompare" ]; then
  if [ "$BYTES" != "match" ] || [ "$REVERSED" != "match" ] || [ "$LOCALE" != "pass" ]; then echo "reason=preexisting"; exit 4; fi
  if [ -n "$(git status --porcelain -- packages)" ]; then echo "reason=setup"; exit 2; fi
  if ! KEEL_SPIKE_DEDUPE=localeCompare node spike/ios-core/build.mjs >"$WORK/mutant-build.txt" 2>&1; then
    node spike/ios-core/build.mjs >"$WORK/restore-build.txt" 2>&1 || true
    echo "reason=setup"
    exit 2
  fi
  if [ -n "$(git status --porcelain -- packages)" ]; then
    node spike/ios-core/build.mjs >"$WORK/restore-build.txt" 2>&1 || true
    echo "reason=setup"
    exit 2
  fi
  if ! grep -q localeCompare spike/ios-core/dist/compile.js || ! grep -q localeCompare spike/ios-core/dist/standalone.js; then
    node spike/ios-core/build.mjs >"$WORK/restore-build.txt" 2>&1 || true
    echo "reason=setup"
    exit 2
  fi
  run_jsc compile "$EN_LANG" "$EN_REGION" "$WORK/mut-id.raw" "$LIST"
  run_jsc compile "$EN_LANG" "$EN_REGION" "$WORK/mut-rev.raw" "$LIST" reversed
  payload "$WORK/mut-id.raw" "$WORK/mut-id.txt"
  payload "$WORK/mut-rev.raw" "$WORK/mut-rev.txt"
  grep '"file":"fixtures/' "$WORK/mut-id.txt" > "$WORK/mut-id-fixtures.txt"
  grep '"file":"fixtures/' "$WORK/mut-rev.txt" > "$WORK/mut-rev-fixtures.txt"
  grep '"file":"tie/minimal.yaml"' "$WORK/mut-id.txt" > "$WORK/mut-id-tie.txt"
  grep '"file":"tie/minimal.yaml"' "$WORK/mut-rev.txt" > "$WORK/mut-rev-tie.txt"
  grep '"file":"tie/minimal.yaml"' "$WORK/node-en.txt" > "$WORK/node-tie.txt"
  node spike/ios-core/build.mjs >"$WORK/restore-build.txt" 2>&1 || true
  if ! cmp -s "$WORK/mut-id-fixtures.txt" "$WORK/mut-rev-fixtures.txt"; then echo "reason=preexisting"; exit 4; fi
  if ! cmp -s "$WORK/mut-id-tie.txt" "$WORK/node-tie.txt"; then echo "reason=preexisting"; exit 4; fi
  if cmp -s "$WORK/mut-id-tie.txt" "$WORK/mut-rev-tie.txt"; then echo "reason=survived"; exit 3; fi
  echo "reason=reversed-tie"
  exit 1
fi

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

if [ "$MODE" = "fewer" ]; then
  if [ "$COUNT" = "fail" ]; then echo "reason=fixture-count"; exit 1; fi
  echo "reason=survived"
  exit 3
fi

if [ "$MODE" = "same-locale" ]; then
  if [ "$JSC_EN" = "$JSC_SV" ]; then echo "reason=locale-same"; exit 1; fi
  echo "reason=survived"
  exit 3
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
