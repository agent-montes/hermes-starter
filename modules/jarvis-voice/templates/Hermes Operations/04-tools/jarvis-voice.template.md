# JARVIS Voice App Operations Note

Use this private Operations note to track your local JARVIS voice app setup.

Public source location in the starter:

```text
apps/jarvis-voice/
```

## Local-only configuration

Create the local app env file from the example:

```bash
cd <YOUR_STARTER_CLONE>/apps/jarvis-voice
cp .env.example .env
chmod 600 .env
```

Fill real values only on your machine. Do not paste values into this note if it will be published.

Required local values:

- `GEMINI_API_KEY` — realtime voice provider key.
- `API_SERVER_KEY` — local Hermes API key.
- `HERMES_API_URL` — usually loopback, for example `http://127.0.0.1:<PORT>`.

Optional local values:

- `OPENWAKEWORD_WAKE_ENABLED`
- `OPENWAKEWORD_MODEL`
- `OPENWAKEWORD_THRESHOLD`
- `JARVIS_PHONE_HOST`
- `JARVIS_PHONE_PORT`
- `JARVIS_PHONE_TOKEN`

## Local checks

```bash
npm ci
npm run build
node --check electron/main.mjs
node --check electron/preload.cjs
python3 -m py_compile scripts/openwakeword-listener.py
```

## Safety notes

- Keep Hermes API loopback-only unless you intentionally add a token-protected LAN bridge.
- Do not commit `.env`, logs, recordings, transcripts, downloaded wake-word models, `dist/`, `release/`, or `.venv-openwakeword/`.
- Account creation, billing, CAPTCHA, passkeys, recovery, and provider-side access remediation are human-only steps.
- If the phone bridge is enabled, verify unauthenticated requests fail before sharing the LAN URL.

## Rollback

- Quit the JARVIS app.
- Stop the phone bridge process if running.
- Delete or rotate `API_SERVER_KEY` and `JARVIS_PHONE_TOKEN` if exposed locally.
- Remove ignored runtime folders: `dist/`, `release/`, `.venv-openwakeword/`, and logs.
