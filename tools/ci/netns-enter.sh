#!/bin/bash
set -euo pipefail
uid=$1
gid=$2
path=$3
home=$4
root=$5
if command -v ip >/dev/null 2>&1; then
  ip link set lo up
elif [ -x /usr/sbin/ip ]; then
  /usr/sbin/ip link set lo up
else
  /sbin/ip link set lo up
fi
exec setpriv --reuid="$uid" --regid="$gid" --init-groups --inh-caps=-all \
  env PATH="$path" HOME="$home" \
  bash "$root/tools/ci/netns-run.sh" "$root"
