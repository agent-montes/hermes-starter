# Optional Modules

Modules are opt-in public-safe additions for a Hermes Starter workspace.

The base starter creates the five-folder workspace model. Modules add feature-specific docs, private Operations templates, and setup guidance without writing secrets or live runtime state.

Current modules:

- `jarvis-voice` — optional Electron realtime voice shell for Hermes, local openWakeWord helper, and LAN phone bridge pattern.

Preview available modules:

```bash
./scripts/init-workspace.sh --list-modules
```

Initialize the base workspace plus a module:

```bash
./scripts/init-workspace.sh --with jarvis-voice
```

Dry-run first:

```bash
./scripts/init-workspace.sh --dry-run --with jarvis-voice
```

Module safety rules:

- Modules may copy placeholder docs/templates into private sibling folders.
- Modules must not create real credentials, auth files, sessions, logs, databases, recordings, transcripts, or recovery archives.
- Real provider keys and local Hermes API keys stay in ignored local env files, Hermes Secrets, or a password manager.
- Module source code must build from public dependencies and must not rely on private machine paths.
