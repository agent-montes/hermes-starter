# Voice Lab

This page describes a public-safe pattern for experimenting with realtime voice front ends for Hermes.

The goal is to make voice a shell around Hermes, not a replacement for the main Hermes reasoning model. A voice shell can handle low-latency microphone input, speaker output, interruption, and short conversational turns while delegating durable work to Hermes through an explicit local API boundary.

## Recommended architecture

```text
User microphone
  -> local desktop voice app
  -> realtime voice model or speech stack
  -> local Hermes API bridge
  -> Hermes Agent worker
  -> concise spoken or written result
```

Keep these roles separate:

- Voice shell: captures audio, plays audio, shows lightweight UI state, and submits complete task briefs.
- Hermes Agent: performs long-running work, tool use, file operations, research, coding, scheduled work, and approvals.
- Secret store: holds provider API keys and local bearer tokens outside the public starter.
- Operations notes: record non-secret setup decisions, pinned sources, smoke tests, and rollback steps.

## Public-safe sandbox rule

A voice experiment belongs in a private Operations `Lab/` area until it is reviewed. The public starter may document the pattern, but it must not include:

- real provider API keys;
- local bearer tokens;
- browser profiles, cookies, or OAuth files;
- account recovery details;
- project numbers, billing identifiers, or private cloud project IDs;
- live `.env` files;
- microphone recordings, transcripts, logs, or request dumps;
- machine-specific paths from a private setup.

## Provider boundary

Common provider variables should be placeholders only:

```text
VOICE_PROVIDER_API_KEY=<PLACEHOLDER_ONLY>
HERMES_API_URL=http://127.0.0.1:<PORT_PLACEHOLDER>
HERMES_API_SERVER_KEY=<PLACEHOLDER_ONLY>
```

The local Hermes API key is not a billed vendor key, but it is still secret because it grants access to Hermes tools. Store it only in the private secret store and the local app environment file that needs it.

## Manual account setup preferred

Do not automate account creation, CAPTCHA, passkey enrollment, recovery settings, billing enrollment, or identity verification. Those steps should be performed by the human account owner in a normal browser session.

Agents may document what needs to be configured, but should not bypass provider account-protection flows.

## Safe evaluation checklist

Before connecting a voice shell to a live Hermes instance:

1. Review the source repository and license.
2. Build the app locally from source.
3. Confirm `.env` is ignored.
4. Confirm the app submits complete task briefs rather than vague summaries.
5. Confirm Hermes API access is loopback-only unless explicitly designed otherwise.
6. Confirm every external action still uses Hermes approval policy.
7. Confirm the app does not log secrets, transcripts, or raw audio into the repository.
8. Run a synthetic smoke test with dummy prompts before using private data.
9. Document rollback: how to stop the app, revoke its key, and remove local state.

## Example voice-shell task handoff

Good handoff:

```text
Research public documentation for <TOPIC>. Summarize the latest public facts, cite sources, and do not access private files.
```

Bad handoff:

```text
Do that thing we discussed.
```

The voice shell should assume Hermes cannot hear the prior spoken conversation unless the full context is included in the submitted task.
