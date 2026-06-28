#!/usr/bin/env python3
from pathlib import Path
import sys
try:
    import yaml
except Exception as exc:
    print(f"FAIL: PyYAML unavailable: {exc}")
    sys.exit(1)

root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()
files = [p for p in root.rglob('*') if p.is_file() and p.suffix in {'.yaml', '.yml'} and '.git' not in p.parts]
failed = False
for path in sorted(files):
    try:
        yaml.safe_load(path.read_text())
        print(f"OK: {path.relative_to(root)}")
    except Exception as exc:
        print(f"FAIL: {path.relative_to(root)}: {exc}")
        failed = True
if not files:
    print('OK: no YAML files found')
sys.exit(1 if failed else 0)
