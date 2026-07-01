# JARVIS Voice Module

This module adds public-safe setup notes for the optional JARVIS voice app in `apps/jarvis-voice/`.

It is a preview module. The initializer copies only private Operations notes into the target sibling workspace. It does not install dependencies, create provider accounts, write real keys, expose LAN services, or start the app.

Use:

```bash
./scripts/init-workspace.sh --with jarvis-voice
```

Then review:

- `docs/jarvis-voice.md`
- `apps/jarvis-voice/README.md`
- `apps/jarvis-voice/.env.example`

Secrets boundary:

- `GEMINI_API_KEY` is a provider secret.
- `API_SERVER_KEY` and `JARVIS_PHONE_TOKEN` are local access secrets.
- All real values belong only in ignored local env files, Hermes Secrets, or a password manager.
