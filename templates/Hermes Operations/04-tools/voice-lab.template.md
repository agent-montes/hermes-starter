# Voice Lab Evaluation

Use this template for a private voice-shell experiment. Keep it in private Operations, not in the public starter after filling it out.

## Candidate

- Name: `<VOICE_APP_OR_TOOL_NAME>`
- Source URL: `<PUBLIC_SOURCE_URL>`
- License: `<LICENSE>`
- Reviewed version/commit: `<PINNED_VERSION_OR_COMMIT>`
- Review date: `<YYYY-MM-DD>`

## Goal

Describe the intended voice workflow in one paragraph.

## Architecture

```text
Microphone -> <VOICE_SHELL> -> <VOICE_PROVIDER_OR_LOCAL_STACK> -> Hermes API -> Hermes Agent
```

## Required secrets

List variable names only. Do not paste values.

```text
VOICE_PROVIDER_API_KEY=<STORED_IN_PRIVATE_SECRETS>
HERMES_API_SERVER_KEY=<LOCAL_ONLY_SECRET>
```

## Local files and state

- Sandbox path: `<PRIVATE_LAB_PATH>`
- Ignored environment file: `<PRIVATE_ENV_PATH>`
- Cache/log paths: `<PRIVATE_SCRATCH_PATHS>`
- Browser/profile state: `<NONE_OR_PRIVATE_PATH>`

## Build verification

```text
<COMMAND_1> -> <RESULT>
<COMMAND_2> -> <RESULT>
```

## Hermes bridge review

- Loopback-only API: `<YES/NO>`
- Complete task briefs submitted: `<YES/NO>`
- Approval gates preserved: `<YES/NO>`
- Secrets redacted from logs: `<YES/NO>`
- Transcripts stored only in approved location: `<YES/NO>`

## Account setup notes

Human-only steps:

- provider account sign-in;
- CAPTCHA or identity verification;
- passkey or recovery enrollment;
- billing setup;
- API key creation if automation is unsafe.

## Go/no-go decision

- Decision: `<GO/NO-GO/HOLD>`
- Reason:
- Follow-ups:

## Rollback

- Stop app:
- Disable local API bridge:
- Revoke provider key:
- Delete local `.env`:
- Clear scratch logs/transcripts:
