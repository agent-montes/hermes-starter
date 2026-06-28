#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"

fail=0
fail_msg() { echo "FAIL: $1"; fail=1; }

# Disallow sensitive/runtime filenames while allowing explicit examples/templates.
if find . -path './.git' -prune -o -type f \( \
  -name '.env' -o -name 'auth.json' -o \
  -name '*.sqlite' -o -name '*.sqlite3' -o -name '*.db' -o \
  -name '*.pem' -o -name '*.key' -o -name '*.p12' -o -name '*.pfx' -o \
  -name '*.tar' -o -name '*.tar.gz' -o -name '*.zip' -o -name '*.mobileconfig' \
\) -print | grep -q .; then
  fail_msg 'sensitive/runtime/archive filenames present'
  find . -path './.git' -prune -o -type f \( -name '.env' -o -name 'auth.json' -o -name '*.sqlite' -o -name '*.sqlite3' -o -name '*.db' -o -name '*.pem' -o -name '*.key' -o -name '*.p12' -o -name '*.pfx' -o -name '*.tar' -o -name '*.tar.gz' -o -name '*.zip' -o -name '*.mobileconfig' \) -print
else
  echo 'OK: no sensitive/runtime/archive filenames present'
fi

for d in sessions state logs request-dumps gateway-state cache; do
  if find . -path './.git' -prune -o -type d -name "$d" -print | grep -q .; then
    fail_msg "runtime directory present: $d"
    find . -path './.git' -prune -o -type d -name "$d" -print
  else
    echo "OK: no runtime directory named $d"
  fi
done

# The visible secrets folder shell must remain blank except for inert placeholders.
for secrets_dir in './workspace/Hermes Secrets'; do
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
check_content 'hardcoded Linux user paths' '/home/[A-Za-z0-9._-]+'
check_content 'phone-number-like strings' '\+?[0-9][0-9 .()/-]{8,}[0-9]'
check_content 'common real-looking token assignments' '(api[_-]?key|token|secret|password)[A-Za-z0-9_ -]*[:=][[:space:]]*[A-Za-z0-9_./+=-]{20,}'
check_content 'known token prefixes' 'github_pat_|ghp_|sk-[A-Za-z0-9]|xox[baprs]-|Bearer [A-Za-z0-9._-]+'
check_content 'private key block' 'BEGIN (RSA |OPENSSH |EC |DSA |)PRIVATE KEY'
check_content 'session/state JSON artifacts' 'session[^/]*\.json|state[^/]*\.json'
check_content 'live account identifiers' 'agent-montes|19037476363|Oscar'

if [ "$fail" -ne 0 ]; then
  echo 'hygiene_check_failed'
  exit 1
fi

echo 'hygiene_check_ok'
