#!/bin/bash
set -euo pipefail
cd "$1"
node --version
pnpm verify
printf '%s\n' namespace-probe
node tools/ci/namespace-probe.mjs
