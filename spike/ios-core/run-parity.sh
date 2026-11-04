#!/bin/sh
# Parity harness for the iOS core spike. Payloads are JSON lines. A locale header is not part of the payload.
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
cd "$ROOT"
if [ -z "${KEEL_DATA_DIR:-}" ]; then
  KEEL_DATA_DIR=$(mktemp -d)
  export KEEL_DATA_DIR
fi

MODE=full
DEVICE_LOG=
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

while [ $# -gt 0 ]; do
  case "$1" in
    --inject-diff) MODE=diff ;;
    --inject-reorder) MODE=reorder ;;
    --inject-column) MODE=column ;;
    --inject-same-locale) MODE=same-locale ;;
    --inject-fewer) MODE=fewer ;;
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

node spike/ios-core/build.mjs >/dev/null
BIN=$(swift build --package-path spike/ios-core --product keel-spike-host --show-bin-path)
HOST=$BIN/keel-spike-host
git ls-files fixtures/synthetic/terms | grep '\.yaml$' | LC_ALL=C sort > "$WORK/files.txt"
COUNT=$(wc -l < "$WORK/files.txt" | tr -d ' ')

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
  "$HOST" -AppleLanguages "($language)" -AppleLocale "$region" parity --root "$ROOT" --variant "$variant" --list "$list" > "$out"
}

payload() {
  awk '!/^KEEL_SPIKE /' "$1" > "$2"
}

locale_of() {
  awk -F'locale=' '/^KEEL_SPIKE v1 locale / { print $2; exit }' "$1"
}

EN_LANG=en-US
EN_REGION=en_US
HAW_LANG=haw
HAW_REGION=haw_US
if [ "$MODE" = "same-locale" ]; then
  HAW_LANG=$EN_LANG
  HAW_REGION=$EN_REGION
fi

LIST=$WORK/files.txt
SHORT=$WORK/files.txt
if [ "$MODE" = "fewer" ]; then
  sed '$d' "$WORK/files.txt" > "$WORK/short.txt"
  SHORT=$WORK/short.txt
fi

run_node en en_US.UTF-8 "$WORK/node-en.raw" "$LIST"
run_node haw haw_US.UTF-8 "$WORK/node-haw.raw" "$LIST"
run_jsc compile "$EN_LANG" "$EN_REGION" "$WORK/jsc-compile-en.raw" "$LIST"
run_jsc standalone "$EN_LANG" "$EN_REGION" "$WORK/jsc-standalone-en.raw" "$LIST"
run_jsc compile "$HAW_LANG" "$HAW_REGION" "$WORK/jsc-compile-haw.raw" "$SHORT"
run_jsc standalone "$HAW_LANG" "$HAW_REGION" "$WORK/jsc-standalone-haw.raw" "$LIST"

payload "$WORK/node-en.raw" "$WORK/node-en.txt"
payload "$WORK/node-haw.raw" "$WORK/node-haw.txt"
payload "$WORK/jsc-compile-en.raw" "$WORK/jsc-compile-en.txt"
payload "$WORK/jsc-standalone-en.raw" "$WORK/jsc-standalone-en.txt"
payload "$WORK/jsc-compile-haw.raw" "$WORK/jsc-compile-haw.txt"
payload "$WORK/jsc-standalone-haw.raw" "$WORK/jsc-standalone-haw.txt"

NODE_EN=$(locale_of "$WORK/node-en.raw")
NODE_HAW=$(locale_of "$WORK/node-haw.raw")
JSC_EN=$(locale_of "$WORK/jsc-compile-en.raw")
JSC_HAW=$(locale_of "$WORK/jsc-compile-haw.raw")
JSC_EN_B=$(locale_of "$WORK/jsc-standalone-en.raw")
JSC_HAW_B=$(locale_of "$WORK/jsc-standalone-haw.raw")

BYTES=match
cmp -s "$WORK/node-en.txt" "$WORK/jsc-compile-en.txt" || BYTES=differ
cmp -s "$WORK/node-en.txt" "$WORK/jsc-standalone-en.txt" || BYTES=differ
cmp -s "$WORK/node-haw.txt" "$WORK/jsc-compile-haw.txt" || BYTES=differ
cmp -s "$WORK/node-haw.txt" "$WORK/jsc-standalone-haw.txt" || BYTES=differ

# A requested Hawaiian run that resolves to some other language is not a second locale.
LOCALE=pass
case $NODE_EN in *en*) ;; *) LOCALE=fail ;; esac
case $NODE_HAW in haw*) ;; *) LOCALE=fail ;; esac
case $JSC_EN in *en*) ;; *) LOCALE=fail ;; esac
case $JSC_HAW in haw*) ;; *) LOCALE=fail ;; esac
if [ "$NODE_EN" = "$NODE_HAW" ] || [ "$JSC_EN" = "$JSC_HAW" ] || [ "$JSC_EN" != "$JSC_EN_B" ] || [ "$JSC_HAW" != "$JSC_HAW_B" ]; then
  LOCALE=fail
fi

COMPILE_COUNT=$(wc -l < "$WORK/jsc-compile-haw.txt" | tr -d ' ')
STANDALONE_COUNT=$(wc -l < "$WORK/jsc-standalone-en.txt" | tr -d ' ')
COUNT=pass
if [ "$COUNT" != "x" ] && [ "$COMPILE_COUNT" -ne 31 ]; then COUNT=fail; fi
if [ "$STANDALONE_COUNT" -ne 31 ]; then COUNT=fail; fi
if [ "$(wc -l < "$WORK/node-en.txt" | tr -d ' ')" -ne 31 ]; then COUNT=fail; fi

echo "fixtures=31 locales=$NODE_EN,$NODE_HAW engines=node,jscontext variants=compile,standalone"
echo "bytes=$BYTES"
echo "fixture-count compile=$COMPILE_COUNT standalone=$STANDALONE_COUNT node=$(wc -l < "$WORK/node-en.txt" | tr -d ' ') status=$COUNT"
echo "locale-check status=$LOCALE node=$NODE_EN,$NODE_HAW jscontext=$JSC_EN,$JSC_HAW"

if [ "$MODE" = "diff" ]; then
  if [ "$BYTES" != "match" ]; then echo "reason=preexisting"; exit 4; fi
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
  if [ "$BYTES" != "match" ]; then echo "reason=preexisting"; exit 4; fi
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
  if [ "$BYTES" != "match" ]; then echo "reason=preexisting"; exit 4; fi
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

if [ "$MODE" = "prove" ]; then
  case "${PROVE:-bytes}" in
    bytes)
      if [ "$BYTES" = "match" ]; then exit 0; fi
      echo "reason=bytes"
      exit 1
      ;;
    count)
      if [ "$COUNT" = "pass" ]; then exit 0; fi
      echo "reason=fixture-count"
      exit 1
      ;;
    locales-differ)
      if [ "$JSC_EN" != "$JSC_HAW" ] && [ "$NODE_EN" != "$NODE_HAW" ]; then exit 0; fi
      echo "reason=locale-same"
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
  if [ "$JSC_EN" = "$JSC_HAW" ]; then echo "reason=locale-same"; exit 1; fi
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
if [ "$COUNT" != "pass" ]; then echo "reason=fixture-count"; exit 1; fi
if [ "$LOCALE" != "pass" ]; then echo "reason=locale"; exit 1; fi
echo "reason=pass"
exit 0
