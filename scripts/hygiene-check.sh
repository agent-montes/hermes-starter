#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"

fail=0

fail_msg() {
  echo "FAIL: $1"
  fail=1
}

# Disallow actual sensitive filenames while allowing placeholder examples and docs that mention them.
if find . -path './.git' -prune -o -type f \( \
  -name '.env' -o \
  -name 'auth.json' -o \
  -name '*.sqlite' -o \
  -name '*.sqlite3' -o \
  -name '*.db' \
\) -print | grep -q .; then
  fail_msg 'sensitive/runtime filenames present'
  find . -path './.git' -prune -o -type f \( -name '.env' -o -name 'auth.json' -o -name '*.sqlite' -o -name '*.sqlite3' -o -name '*.db' \) -print
else
  echo 'OK: no sensitive/runtime filenames present'
fi

check_content() {
  local label="$1" pattern="$2"
  if grep -RInE --exclude-dir=.git --exclude='hygiene-check.sh' --exclude='EXCLUDE.md' --exclude='.gitignore' "$pattern" . >/tmp/hermes-starter-hygiene.$$ 2>/dev/null; then
    echo "FAIL: $label"
    cat /tmp/hermes-starter-hygiene.$$
    fail=1
  else
    echo "OK: $label"
  fi
  rm -f /tmp/hermes-starter-hygiene.$$
}

check_content 'hardcoded macOS user paths' '/Users/[A-Za-z0-9._-]+'
check_content 'phone-number-like strings' '\+?[0-9][0-9 .()/-]{8,}[0-9]'
check_content 'common real-looking token assignments' '(api[_-]?key|token|secret|password)[A-Za-z0-9_ -]*[:=][[:space:]]*[A-Za-z0-9_./+=-]{20,}'
check_content 'session/state JSON artifacts' 'session[^/]*\.json|state[^/]*\.json'

if [ "$fail" -ne 0 ]; then
  echo 'hygiene_check_failed'
  exit 1
fi

echo 'hygiene_check_ok'
