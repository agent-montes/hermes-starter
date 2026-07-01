# J.A.R.V.I.S. Mirror Setup

This is the shortest safe path to mirror this setup on another machine. It intentionally uses placeholders only: do not commit `.env`, provider keys, local Hermes tokens, logs, builds, or generated model/runtime caches.

## 1. Prerequisites

- Node.js 20+ and npm.
- Python 3.9+ for the local wake-word helper.
- Hermes Agent installed locally.
- A Gemini Live-capable API key for `GEMINI_API_KEY`.
- A microphone input device for voice and wake-word detection.
- Optional webcam for gesture control; USB/UVC camera-mic devices such as OBSBOT Tail Air can work as both mic and camera when macOS exposes them as input devices.

The wake word uses openWakeWord locally. It does not require a Picovoice account, Picovoice key, wake-word API, or runtime cloud call.

## 2. Install app dependencies

```bash
npm install
```

## 3. Install local wake-word runtime

```bash
python3 -m venv .venv-openwakeword
.venv-openwakeword/bin/python -m pip install --upgrade pip
.venv-openwakeword/bin/python -m pip install openwakeword==0.6.0
.venv-openwakeword/bin/python scripts/openwakeword-listener.py --download
```

This downloads the pretrained `hey_jarvis` model once. `.venv-openwakeword/` is ignored by Git.

## 4. Create local app config

```bash
cp .env.example .env
```

Edit `.env` and set at least:

```env
GEMINI_API_KEY=<your Gemini API key>
HERMES_API_URL=http://127.0.0.1:8642
API_SERVER_KEY=<same local key configured in Hermes>
```

Optional but recommended local defaults:

```env
JARVIS_USER_NAME=there
GEMINI_LIVE_MODEL=models/gemini-3.1-flash-live-preview
GEMINI_LIVE_VOICE=Leda
OPENWAKEWORD_WAKE_ENABLED=false
OPENWAKEWORD_MODEL=hey_jarvis
OPENWAKEWORD_THRESHOLD=0.35
OPENWAKEWORD_VAD_THRESHOLD=0
```

Never commit `.env`.

## 5. Enable the Hermes local API

In the Hermes environment file on that machine, set:

```env
API_SERVER_ENABLED=true
API_SERVER_HOST=127.0.0.1
API_SERVER_PORT=8642
API_SERVER_KEY=<same local key used in the app .env>
```

Restart Hermes from a normal shell after changing its environment.

Verify:

```bash
curl -s http://127.0.0.1:8642/health
```

Expected:

```json
{"status":"ok"}
```

## 6. Run JARVIS

Development mode:

```bash
npm run dev
```

Production-style local run:

```bash
npm start
```

Package an unpacked macOS app:

```bash
npm run package:mac
open release/mac-arm64/JARVIS.app
```

## 7. Optional phone bridge

The phone bridge exposes a LAN page that submits prompts to Hermes through the Mac. It generates a local token into ignored `.env` if `JARVIS_PHONE_TOKEN` is missing.

```bash
npm run phone
```

Open the printed pairing URL only on your trusted local network. Do not commit the generated token or bridge logs.

## 8. Pre-push hygiene checklist

Before pushing:

```bash
npm run build
npm run package:mac
node --check electron/main.mjs
node --check electron/preload.cjs
git diff --check
git status --short
```

Also verify:

- `.env`, `.venv-openwakeword/`, `dist/`, `release/`, `node_modules/`, runtime logs, and generated phone tokens are ignored.
- `.env.example` contains placeholders only.
- No API keys, bearer tokens, OAuth files, phone numbers, local absolute paths, or packaged app outputs are staged.
- If a microphone is missing, the UI should show a wake-word microphone warning while W remains available as a backup wake key.
