# 10-Minute Quickstart

This path creates a private Hermes workspace from the public-safe starter template.

```bash
gh repo create my-hermes-starter --template agent-montes/hermes-starter --public
git clone <YOUR_REPOSITORY_URL>
cd my-hermes-starter
./scripts/init-workspace.sh --dry-run
./scripts/init-workspace.sh
# Optional module preview/setup:
./scripts/init-workspace.sh --list-modules
./scripts/init-workspace.sh --dry-run --with jarvis-voice
./scripts/init-workspace.sh --with jarvis-voice
./scripts/hygiene-check.sh
```

What this does:

- creates sibling folders for Wiki, Operations, Secrets, and Recovery;
- copies only public-safe templates;
- refuses to overwrite non-empty Secrets or Recovery folders;
- creates local `.gitignore` files for private folders;
- optionally copies module-specific public-safe Operations notes, such as `jarvis-voice`;
- leaves credentials, sessions, logs, OAuth state, app runtime outputs, and backups out of the public starter.

After the quickstart, read:

- `docs/workspace-overview.md`
- `docs/daily-assistant-kit.md`
- `docs/secrets.md`
- `docs/recovery.md`
- `docs/modular-installer.md`
- `docs/jarvis-voice.md` if you enable the optional JARVIS module

Do not paste real secrets into this repository.
