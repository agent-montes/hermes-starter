# JARVIS Voice App

`apps/jarvis-voice/` is an optional realtime voice shell for Hermes Agent.

It is included as a public-safe template module, not as a copy of a live private setup. It should build from source with public dependencies, then use local ignored configuration for provider keys and Hermes API access.

## What it does

The app provides:

- an Electron/Vite desktop voice UI;
- a realtime voice provider boundary;
- local openWakeWord support through a Python helper;
- a LAN phone bridge pattern protected by a generated local token;
- a local Hermes API handoff so Hermes remains the worker for tools and long-running tasks.

Recommended role split:

```text
Microphone / phone browser
  -> JARVIS voice shell
  -> realtime voice provider or local wake-word helper
  -> local Hermes API
  -> Hermes Agent tools, files, research, coding, scheduled work
```

The voice shell should not become the main reasoning system. It should collect the user request, provide a low-latency interface, and hand complete task briefs to Hermes.

## Install path

From a clone of this starter:

```bash
./scripts/init-workspace.sh --with jarvis-voice
cd apps/jarvis-voice
npm ci
npm run build
```

For macOS packaging:

```bash
npm run package:mac
```

For local development:

```bash
npm run dev
```

## Local configuration

Create a local ignored env file from the example:

```bash
cd apps/jarvis-voice
cp .env.example .env
chmod 600 .env
```

Fill real values only on your machine.

Important variables:

```text
GEMINI_API_KEY=<PROVIDER_KEY_FROM_YOUR_SECRET_STORE>
HERMES_API_URL=http://127.0.0.1:<LOCAL_PORT>
API_SERVER_KEY=<LOCAL_HERMES_API_KEY>
OPENWAKEWORD_WAKE_ENABLED=true
OPENWAKEWORD_MODEL=hey_jarvis
OPENWAKEWORD_THRESHOLD=0.35
```

Do not commit `.env` or any file derived from it.

## Wake word

The default public-safe route is openWakeWord with the pretrained `hey_jarvis` model.

The helper script is:

```text
apps/jarvis-voice/scripts/openwakeword-listener.py
```

The local Python environment should be created outside Git as `.venv-openwakeword/` inside the app folder or another ignored location.

`apps/jarvis-voice/build/icon.png` is a tracked source asset used by Electron packaging. Generated package output still belongs in ignored `dist/` and `release/` folders.

No Picovoice/Porcupine access key is required for this path.

## Phone bridge

The phone bridge is optional and LAN-only by default.

It should:

- keep the Hermes API on loopback;
- bind only to a private LAN address when intentionally enabled;
- generate or read `JARVIS_PHONE_TOKEN` from ignored local env;
- reject unauthenticated requests;
- avoid writing prompts, transcripts, tokens, or responses to tracked files.

Start locally with:

```bash
npm run phone
```

## macOS permissions

A packaged desktop voice app may need user-granted permissions for:

- Microphone;
- Camera, if the UI uses video/device previews;
- Local network access for the phone bridge;
- Notifications, if enabled;
- Accessibility or Automation only if future features require them.

These are human-approved System Settings steps. Do not automate passkeys, CAPTCHA, account recovery, billing, or provider identity checks.

## Public safety checklist

Before publishing changes to this module:

```bash
cd apps/jarvis-voice
npm ci --ignore-scripts
npm run build
node --check electron/main.mjs
node --check electron/preload.cjs
python3 -m py_compile scripts/openwakeword-listener.py scripts/generate-blue-icon.py
cd ../..
./scripts/hygiene-check.sh
```

Confirm the following are absent from Git:

- `.env`, `.env.*` other than examples;
- API keys, bearer tokens, OAuth files, cookies, recovery codes;
- Hermes session/state databases;
- phone numbers, chat/channel IDs, local routing state;
- recordings, transcripts, screenshots, request dumps, logs;
- `node_modules/`, `.venv-openwakeword/`, `dist/`, `release/`, caches, downloaded models.

## Provenance

This module was imported as a cleaned source snapshot into the starter repo. Its original MIT license notice is preserved in `apps/jarvis-voice/LICENSE`. The import intentionally excludes prior Git history, ignored local files, runtime state, generated outputs, and secrets.
