# Hermes Starter

A clean, reusable starter template for setting up a Hermes Agent workspace.

This repository is public-safe by default. It contains instructions, examples, and guardrails only. It must not contain credentials, runtime state, memories, logs, private channel IDs, recovery archives, or user-specific data.

## What this starter provides

- A suggested folder layout for a Hermes setup.
- Generic agent context files.
- Example config and environment placeholders.
- Tool setup notes that can be adapted after review.
- Hygiene checks to reduce the risk of publishing private state.

## Suggested sibling folders

```text
Hermes Wiki/        # durable knowledge base, if used
Hermes Operations/  # live operational setup instructions
Hermes Secrets/     # credentials only; never publish
Hermes Recovery/    # backups/restore artifacts; never publish
Hermes Starter/     # this clean reusable starter
```

## Quickstart

1. Copy this starter to a new workspace.
2. Rename placeholders such as `<YOUR_HOME>`, `<YOUR_HERMES_HOME>`, `<PRIMARY_PROVIDER>`, and `<MESSAGING_PLATFORM>`.
3. Create real secrets only in your secret store, never in this repository.
4. Run `scripts/hygiene-check.sh` before committing or publishing.
5. Install tools only after reviewing their license, network behavior, storage paths, and credential access.

## Non-goals

This starter is not a backup of a live Hermes install. It does not include runtime state, sessions, memories, credentials, recovery archives, channel routing, or private account configuration.
