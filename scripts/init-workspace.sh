#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_ROOT="$(cd "$ROOT/.." && pwd)"
DRY_RUN=0
FORCE=0
MODULES=()

usage() {
  cat <<'USAGE'
Usage: ./scripts/init-workspace.sh [--dry-run] [--target-root PATH] [--force] [--with MODULE] [--list-modules]

Creates private sibling folders from the public-safe templates:
  Hermes Wiki/
  Hermes Operations/
  Hermes Secrets/
  Hermes Recovery/

Optional modules:
  jarvis-voice   Copy public-safe JARVIS voice app Operations notes and print local setup steps.
  all            Enable every currently available optional module.

Safety:
  - refuses to overwrite existing files unless --force is set;
  - refuses to write into non-empty Hermes Secrets or Hermes Recovery;
  - never creates real credentials, auth files, sessions, logs, or backups;
  - optional modules copy placeholder docs/templates only;
  - supports --dry-run for preview.
USAGE
}

list_modules() {
  cat <<'MODULES'
Available modules:
  jarvis-voice  Optional Electron realtime voice shell with local openWakeWord helper and LAN phone bridge template.
MODULES
}

has_module() {
  local needle="$1" item
  if [ "${#MODULES[@]}" -eq 0 ]; then
    return 1
  fi
  for item in "${MODULES[@]}"; do
    [ "$item" = "$needle" ] && return 0
  done
  return 1
}

add_module() {
  local module="$1"
  case "$module" in
    all)
      add_module jarvis-voice
      ;;
    jarvis-voice)
      if ! has_module "$module"; then
        MODULES+=("$module")
      fi
      ;;
    *)
      echo "Unknown module: $module" >&2
      list_modules >&2
      exit 2
      ;;
  esac
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --force) FORCE=1 ;;
    --target-root) shift; TARGET_ROOT="$1" ;;
    --with) shift; add_module "$1" ;;
    --list-modules) list_modules; exit 0 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 2 ;;
  esac
  shift
done

run() {
  if [ "$DRY_RUN" -eq 1 ]; then
    printf 'DRY-RUN: %s\n' "$*"
  else
    "$@"
  fi
}

copy_tree() {
  local src="$1" dst="$2" kind="$3"
  local rel target item
  if [ ! -d "$src" ]; then
    echo "SKIP: missing template $src"
    return
  fi
  if [ -d "$dst" ] && [ "$kind" = 'sensitive' ] && find "$dst" -mindepth 1 -print -quit | grep -q .; then
    echo "REFUSE: $dst already exists and is not empty; not touching sensitive boundary" >&2
    exit 1
  fi
  run mkdir -p "$dst"
  while IFS= read -r -d '' item; do
    rel="${item#"$src"/}"
    target="$dst/$rel"
    if [ -d "$item" ]; then
      run mkdir -p "$target"
    else
      if [ -e "$target" ] && [ "$FORCE" -ne 1 ]; then
        echo "KEEP: $target already exists"
      else
        run mkdir -p "$(dirname "$target")"
        run cp "$item" "$target"
      fi
    fi
  done < <(find "$src" -mindepth 1 -print0)
}

copy_module_templates() {
  local module="$1"
  local src="$ROOT/modules/$module/templates"
  if [ ! -d "$src" ]; then
    echo "SKIP: module $module has no private workspace templates"
    return
  fi
  echo "Module: $module"
  copy_tree "$src" "$TARGET_ROOT" normal
}

print_module_next_steps() {
  local module="$1"
  case "$module" in
    jarvis-voice)
      cat <<'JARVIS_NEXT'

JARVIS voice module next steps:
1. Read apps/jarvis-voice/README.md and docs/jarvis-voice.md.
2. Create apps/jarvis-voice/.env locally from apps/jarvis-voice/.env.example.
3. Put real provider keys and local Hermes API keys only in ignored local env/secret storage.
4. From apps/jarvis-voice/, run npm ci, then npm run build.
5. Optional wake word setup uses a local .venv-openwakeword folder that must remain ignored.
JARVIS_NEXT
      ;;
  esac
}

echo "Starter root: $ROOT"
echo "Target root:  $TARGET_ROOT"
[ "$DRY_RUN" -eq 1 ] && echo 'Mode: dry run' || echo 'Mode: write'
if [ "${#MODULES[@]}" -gt 0 ]; then
  printf 'Modules: %s\n' "${MODULES[*]}"
else
  echo 'Modules: none'
fi

copy_tree "$ROOT/templates/Hermes Wiki" "$TARGET_ROOT/Hermes Wiki" normal
copy_tree "$ROOT/templates/Hermes Operations" "$TARGET_ROOT/Hermes Operations" normal
copy_tree "$ROOT/templates/Hermes Secrets" "$TARGET_ROOT/Hermes Secrets" sensitive
copy_tree "$ROOT/templates/Hermes Recovery" "$TARGET_ROOT/Hermes Recovery" sensitive

if [ "${#MODULES[@]}" -gt 0 ]; then
  for module in "${MODULES[@]}"; do
    copy_module_templates "$module"
  done
fi

for private_dir in "$TARGET_ROOT/Hermes Wiki" "$TARGET_ROOT/Hermes Operations" "$TARGET_ROOT/Hermes Secrets" "$TARGET_ROOT/Hermes Recovery"; do
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "DRY-RUN: would ensure private .gitignore in $private_dir"
  else
    mkdir -p "$private_dir"
    cat > "$private_dir/.gitignore" <<'EOF'
# Private workspace folder. Commit only after deliberate review.
.env
.env.*
auth.json
sessions/
state/
logs/
cache/
request-dumps/
gateway-state/
*.sqlite
*.sqlite3
*.db
*.tar
*.tar.gz
*.zip
*.pem
*.key
*.p12
*.pfx
EOF
  fi
done

cat <<'NEXT'

Next steps:
1. Review the created sibling folders.
2. Put real credentials only in your private secret manager or Hermes Secrets, never in Starter.
3. Keep Recovery archives private.
4. Run ./scripts/hygiene-check.sh before publishing Starter changes.
NEXT

if [ "${#MODULES[@]}" -gt 0 ]; then
  for module in "${MODULES[@]}"; do
    print_module_next_steps "$module"
  done
fi
