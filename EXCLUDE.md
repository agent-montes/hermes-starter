# Exclude From Starter

Never add:

- `.env`
- `auth.json`
- OAuth tokens
- API keys
- passwords
- recovery codes
- cookies
- session or state databases
- request dumps
- logs containing private identifiers
- phone numbers
- chat/channel IDs
- gateway routing state
- messaging credentials
- memories
- recovery archives
- private Wiki content
- personal account exports
- hardcoded home paths such as `/Users/<name>`
- machine-specific facts unless clearly marked as placeholders or examples
- generated optional app outputs such as `apps/*/node_modules/`, `apps/*/dist/`, `apps/*/release/`, `.venv-openwakeword/`, recordings, transcripts, and phone bridge logs

Folder-specific rules:

- `workspace/Hermes Secrets/` may contain only the inert `.gitkeep` placeholder in Git.
- `workspace/Hermes Recovery/` may contain public-safe process docs only, never real backup material.
- `workspace/Hermes Wiki/` may contain public-safe scaffolding only, never private notes or raw evidence from a live vault.
- `workspace/Hermes Operations/` may contain public-safe operating patterns only, never live channel routes or credentials.
