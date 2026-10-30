#!/bin/bash
set -euo pipefail
here=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
root=$(CDPATH= cd -- "$here/../.." && pwd)
exec sudo unshare --net -- bash "$here/netns-enter.sh" "$(id -u)" "$(id -g)" "$PATH" "$HOME" "$root"
