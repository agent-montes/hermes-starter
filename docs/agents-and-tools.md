# Agents and Tools

This file documents agent roles without exposing account identifiers, private channels, tokens, or runtime state.

## Main Hermes brain

Use one primary reasoning model for normal Hermes work. In this template, keep the provider and model as placeholders:

```yaml
primary_provider: <PRIMARY_PROVIDER>
primary_model: <PRIMARY_MODEL>
```

Record the actual provider and model in the private Operations workspace after setup.

## Remote-control surface agent

Purpose: receive user requests through the chosen messaging surface and route them to Hermes tools.

Typical responsibilities:

- receive messages;
- ask for approvals when needed;
- run safe tools;
- report concise results;
- avoid exposing secrets in chat;
- avoid restarting its own gateway unless explicitly approved.

Public template placeholders:

```yaml
messaging_platform: <MESSAGING_PLATFORM>
gateway_service: <GATEWAY_SERVICE_NAME>
```

Do not commit phone numbers, chat IDs, channel IDs, OAuth files, or gateway routing state.

## Wiki agent

Purpose: maintain durable knowledge under the Wiki governance rules.

Responsibilities:

- read the local schema before Wiki writes;
- search for existing pages before creating new pages;
- preserve raw evidence;
- keep index and log files current;
- avoid turning inference into fact;
- keep human-owned and raw folders protected.

The Wiki agent writes knowledge, not secrets.

## Operations agent

Purpose: maintain the operational command center.

Responsibilities:

- keep runbooks current;
- document tool provenance;
- maintain setup instructions;
- keep action plans separate from durable Wiki knowledge;
- run audits and report failures;
- avoid storing credentials or private runtime state.

## Cron and watchdog agents

Purpose: run scheduled checks and backups.

Recommended behavior:

- stay silent when healthy;
- report only failures or required decisions;
- verify freshness, not just exit codes;
- never publish backup archives;
- never disclose secret-bearing paths or values.

## Tool-provenance agent

Purpose: review public tools before installation or update.

Responsibilities:

- record source URL, license, pinned revision, intended use, storage paths, and network behavior;
- check updates in report-only mode;
- require human approval before installing, pulling, upgrading, downloading binaries, or changing permissions.

## Emergency local model lane

Local models may be documented as an emergency lane, but they should not silently replace the main reasoning model.

Recommended rule:

```yaml
local_models:
  role: emergency-fallback-only
  expose_to_network: false
```

Do not expose unauthenticated local model APIs to a LAN or the public internet.
