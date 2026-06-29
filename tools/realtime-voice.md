# Realtime Voice Front Ends

This note covers public-safe evaluation of realtime voice front ends that can sit in front of Hermes Agent.

## Purpose

Realtime voice front ends provide microphone capture, audio playback, interruption/barge-in, and a conversational UI. They are useful when Hermes should feel like a live assistant while preserving Hermes as the worker for long-running tasks.

## Candidate pattern: Electron voice shell

A desktop voice shell may use:

- Electron/Chromium for microphone capture and echo cancellation;
- a realtime voice provider for low-latency audio conversation;
- a local HTTP bridge to submit background work to Hermes;
- a task panel for Hermes run status and results.

## Example provenance to record

When evaluating a specific repository, record:

- repository URL;
- license;
- commit or release reviewed;
- package manager and lockfile status;
- network services contacted;
- local files written;
- secret variables required;
- build and smoke-test output.

Example candidate to evaluate, not vendor-endorsed:

- Iris by ASHR12, `ASHR12/iris`, https://github.com/ASHR12/iris, MIT license at time of review.

Do not copy a live sandbox, `.env`, browser profile, logs, generated assets, or provider account state into the starter.

## Secret boundary

Provider keys and local bridge tokens belong outside this public repository.

Placeholder-only variables:

```text
VOICE_PROVIDER_API_KEY=<PLACEHOLDER_ONLY>
HERMES_API_URL=http://127.0.0.1:<PORT_PLACEHOLDER>
HERMES_API_SERVER_KEY=<PLACEHOLDER_ONLY>
```

If a voice provider also requires billing, account recovery, passkeys, or CAPTCHA, those steps are human-only setup steps and should not be automated by an agent.

## Safe smoke test

Use public or synthetic data only:

1. Install dependencies from the lockfile.
2. Run the build command.
3. Run any local lint or sidecar checks.
4. Start the UI without provider keys if possible.
5. Verify that missing-key errors are clear and do not print secrets.
6. Only after review, add placeholder-documented private keys in a local ignored `.env`.

## Use boundaries

Use a voice shell for:

- conversational control;
- short status updates;
- submitting well-formed task briefs;
- reading concise task summaries aloud.

Do not use a voice shell for:

- bypassing Hermes approval gates;
- storing secrets in browser local storage without review;
- replacing the primary Hermes reasoning model silently;
- making account, billing, or recovery changes without human action.

## Rollback/removal

A private Operations note should record how to:

- stop the desktop app;
- disable the Hermes API server if it was enabled;
- revoke the provider key;
- remove the local app `.env`;
- delete browser profiles or provider cookies if they were used;
- remove generated logs and transcripts from scratch space.
