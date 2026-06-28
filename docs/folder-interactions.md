# Folder Interactions

The folders are separate on purpose. Each one has a job.

## Main flow

```text
Hermes Starter -> copied into a new private setup
Hermes Operations -> tells agents how the local setup runs
Hermes Wiki -> stores durable non-secret knowledge
Hermes Secrets -> supplies credentials locally
Hermes Recovery -> restores private config/state after failure
```

## Adding a new tool

1. Research the tool in a private workspace.
2. Verify license, dependencies, storage paths, and network behavior.
3. Install and test with non-sensitive data.
4. Store credentials only in Secrets or a password manager.
5. Record durable, cited conclusions in Wiki if needed.
6. Add generic setup instructions to Starter only after removing local facts.
7. Run `scripts/hygiene-check.sh`.
8. Commit and publish the clean starter update.

## Running a live system

1. Operations stores the runbook.
2. Context files guide agents.
3. Secrets provide credentials at runtime.
4. Wiki preserves durable knowledge.
5. Recovery captures private restore artifacts.
6. Starter remains clean and reusable.

## Recovering a machine

1. Start from the Recovery restore runbook.
2. Reinstall Hermes and system dependencies.
3. Restore private config/state locally.
4. Reconnect Secrets locally.
5. Verify gateway, cron, tools, and Wiki paths.
6. Never publish recovery artifacts.

## Publishing updates to Starter

Only publish distilled instructions. Do not publish live state.
