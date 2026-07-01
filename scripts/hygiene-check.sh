#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"

fail=0
fail_msg() { echo "FAIL: $1"; fail=1; }
TMP_BASE="${TMPDIR:-/tmp}/hermes-starter-hygiene.$$"
trap 'rm -f "$TMP_BASE"*' EXIT

# Prune generated dependency/build/runtime folders before content scans.
# They may exist locally after smoke tests, but they must remain ignored and untracked.
find_pruned() {
  find . \
    \( -path './.git' -o -type d \( \
      -name node_modules -o -name dist -o -name release -o -name dist-electron -o \
      -name .venv -o -name .venv-openwakeword -o -name __pycache__ -o \
      -name .pytest_cache \
    \) \) -prune -o "$@"
}

# Disallow sensitive/runtime filenames while allowing explicit examples/templates.
if find_pruned -type f \( \
  -name '.env' -o -name 'auth.json' -o \
  -name '*.sqlite' -o -name '*.sqlite3' -o -name '*.db' -o \
  -name '*.pem' -o -name '*.key' -o -name '*.p12' -o -name '*.pfx' -o \
  -name '*.tar' -o -name '*.tar.gz' -o -name '*.zip' -o -name '*.mobileconfig' \
\) -print | grep -q .; then
  fail_msg 'sensitive/runtime/archive filenames present'
  find_pruned -type f \( -name '.env' -o -name 'auth.json' -o -name '*.sqlite' -o -name '*.sqlite3' -o -name '*.db' -o -name '*.pem' -o -name '*.key' -o -name '*.p12' -o -name '*.pfx' -o -name '*.tar' -o -name '*.tar.gz' -o -name '*.zip' -o -name '*.mobileconfig' \) -print
else
  echo 'OK: no sensitive/runtime/archive filenames present'
fi

for d in sessions state logs request-dumps gateway-state cache; do
  if find_pruned -type d -name "$d" -print | grep -q .; then
    fail_msg "runtime directory present: $d"
    find_pruned -type d -name "$d" -print
  else
    echo "OK: no runtime directory named $d"
  fi
done

# The visible secrets folder shell must remain blank except for inert placeholders.
secrets_dirs=('./workspace/Hermes Secrets')
for secrets_dir in "${secrets_dirs[@]}"; do
  if [ -d "$secrets_dir" ]; then
    if find "$secrets_dir" -type f ! -name '.gitkeep' -print | grep -q .; then
      fail_msg "$secrets_dir contains files other than .gitkeep"
      find "$secrets_dir" -type f ! -name '.gitkeep' -print
    else
      echo "OK: $secrets_dir is blank except .gitkeep"
    fi
  fi
done

# Recovery folder shells may contain public docs/templates only, never archives or backups.
for recovery_dir in './workspace/Hermes Recovery' './templates/Hermes Recovery'; do
  if [ -d "$recovery_dir" ]; then
    if find "$recovery_dir" -type f \( -name '*.tar' -o -name '*.tar.gz' -o -name '*.tgz' -o -name '*.zip' -o -name '*.7z' -o -name '*.bak' \) -print | grep -q .; then
      fail_msg "recovery archive material present in $recovery_dir"
      find "$recovery_dir" -type f \( -name '*.tar' -o -name '*.tar.gz' -o -name '*.tgz' -o -name '*.zip' -o -name '*.7z' -o -name '*.bak' \) -print
    else
      echo "OK: no recovery archive material present in $recovery_dir"
    fi
  fi
done

check_content() {
  local label="$1" pattern="$2"
  if grep -RInE \
    --exclude-dir=.git \
    --exclude-dir=node_modules \
    --exclude-dir=dist \
    --exclude-dir=release \
    --exclude-dir=dist-electron \
    --exclude-dir=.venv \
    --exclude-dir=.venv-openwakeword \
    --exclude-dir=__pycache__ \
    --exclude-dir=.pytest_cache \
    --exclude='hygiene-check.sh' \
    --exclude='EXCLUDE.md' \
    --exclude='.gitignore' \
    --exclude='.hygiene-denylist.example' \
    "$pattern" . >"$TMP_BASE.content" 2>/dev/null; then
    echo "FAIL: $label"
    cat "$TMP_BASE.content"
    fail=1
  else
    echo "OK: $label"
  fi
  rm -f "$TMP_BASE.content"
}

check_local_denylist() {
  local file='.hygiene-denylist.local'
  if [ ! -f "$file" ]; then
    echo 'OK: no local hygiene denylist configured'
    return
  fi
  local line pattern hit=0
  while IFS= read -r line || [ -n "$line" ]; do
    pattern="${line%%#*}"
    pattern="$(printf '%s' "$pattern" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    [ -z "$pattern" ] && continue
    if grep -RInF \
      --exclude-dir=.git \
      --exclude-dir=node_modules \
      --exclude-dir=dist \
      --exclude-dir=release \
      --exclude-dir=dist-electron \
      --exclude-dir=.venv \
      --exclude-dir=.venv-openwakeword \
      --exclude='.hygiene-denylist.local' \
      -- "$pattern" . >>"$TMP_BASE.denylist" 2>/dev/null; then
      hit=1
    fi
  done < "$file"
  if [ "$hit" -ne 0 ]; then
    echo 'FAIL: local denylist matches found'
    cat "$TMP_BASE.denylist"
    fail=1
  else
    echo 'OK: local denylist has no matches'
  fi
  rm -f "$TMP_BASE.denylist"
}

check_content 'hardcoded macOS user paths' '/Users/[A-Za-z0-9._-]+'
check_content 'hardcoded Linux user paths' '/home/[A-Za-z0-9._-]+'
check_content 'phone-number-like strings' '(\+[0-9][0-9 .()/-]{8,}[0-9]|\([0-9]{3}\)[0-9 .()/-]{6,}|[0-9]{3}[-. ][0-9]{3}[-. ][0-9]{4})'
check_content 'quoted hardcoded token-like literals' '(api[_-]?key|token|secret|password)[A-Za-z0-9_ -]*[:=][[:space:]]*["'\'' ][A-Za-z0-9_./+=-]{20,}["'\'' ]'
check_content 'known token prefixes' 'github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|sk-(proj-)?[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,}|xox[baprs]-[0-9A-Za-z-]{20,}|Bearer [A-Za-z0-9._-]{20,}'
check_content 'private key block' 'BEGIN (RSA |OPENSSH |EC |DSA |)PRIVATE KEY'
check_content 'session/state JSON artifacts' 'session[^/]*\.json|state[^/]*\.json'
check_local_denylist

if [ "$fail" -ne 0 ]; then
  echo 'hygiene_check_failed'
  exit 1
fi

echo 'hygiene_check_ok'
