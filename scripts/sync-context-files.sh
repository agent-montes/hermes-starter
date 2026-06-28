#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
MODE="${2:---check}"
cd "$ROOT"
SOURCE='.hermes.md'
TARGETS=('AGENTS.md' 'CLAUDE.md')

if [ ! -f "$SOURCE" ]; then
  echo "FAIL: missing canonical context file $SOURCE" >&2
  exit 1
fi

fail=0
for target in "${TARGETS[@]}"; do
  if [ ! -f "$target" ]; then
    echo "FAIL: missing context mirror $target"
    fail=1
    continue
  fi
  if ! cmp -s "$SOURCE" "$target"; then
    if [ "$MODE" = '--write' ]; then
      cp "$SOURCE" "$target"
      echo "SYNC: updated $target from $SOURCE"
    else
      echo "FAIL: $target differs from canonical $SOURCE"
      fail=1
    fi
  else
    echo "OK: $target mirrors $SOURCE"
  fi
done

if [ "$MODE" = '--write' ]; then
  exit 0
fi
exit "$fail"
