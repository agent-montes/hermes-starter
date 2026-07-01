# Notices and Provenance

Hermes Starter is maintained as a public-safe template. It intentionally excludes live Hermes state, secrets, sessions, logs, recovery archives, private identifiers, and machine-specific configuration.

## JARVIS voice app module

`apps/jarvis-voice/` was imported as a cleaned source snapshot for use as an optional Hermes voice-shell module.

The app source is derived from the MIT-licensed Iris/JARVIS voice app lineage. The original app license notice is preserved in:

```text
apps/jarvis-voice/LICENSE
```

The import deliberately excludes:

- prior unrelated Git history;
- ignored local `.env` files;
- provider keys and local Hermes API keys;
- phone bridge tokens;
- sessions, logs, transcripts, recordings, screenshots, request dumps;
- `node_modules/`, virtual environments, model caches, `dist/`, and `release/` outputs;
- private paths, channel IDs, phone numbers, and recovery material.

The starter repository should be treated as the canonical public template history. Feature modules should be added through reviewed public-safe commits or pull requests rather than by force-pushing unrelated histories.
