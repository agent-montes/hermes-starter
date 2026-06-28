# Hermes Starter

A clean, reusable starter template for setting up a Hermes Agent workspace.

This repository is public-safe by default. It contains instructions, examples, and guardrails only. It must not contain credentials, runtime state, memories, logs, private channel IDs, recovery archives, or user-specific data.

Use this repo as a GitHub template when starting a new Hermes setup, then fill in local details on the target machine.

## What this starter provides

- A suggested folder layout for a Hermes setup.
- Generic agent context files.
- Example config and environment placeholders.
- Tool setup notes that can be adapted after review.
- Hygiene checks to reduce the risk of publishing private state.
- A maintenance pattern for adding new tool instructions without copying live state.

## Suggested sibling folders

```text
Hermes Wiki/        # durable knowledge base, if used
Hermes Operations/  # live operational setup instructions
Hermes Secrets/     # credentials only; never publish
Hermes Recovery/    # backups/restore artifacts; never publish
Hermes Starter/     # this clean reusable starter
```

## Quickstart

1. Create a new repository from this template or copy this folder to a new workspace.
2. Rename placeholders such as `<YOUR_HOME>`, `<YOUR_HERMES_HOME>`, `<PRIMARY_PROVIDER>`, and `<MESSAGING_PLATFORM>`.
3. Create real secrets only in your secret store, never in this repository.
4. Review `EXCLUDE.md` before adding any file.
5. Run `scripts/hygiene-check.sh` before committing or publishing.
6. Install tools only after reviewing their license, network behavior, storage paths, and credential access.

## Recommended first edits

- `config.example.yaml` — copy values into your real config location after review.
- `.env.example` — copy variable names only; keep real values in a secret store.
- `AGENTS.md`, `CLAUDE.md`, `.hermes.md` — adapt generic agent rules to your workspace.
- `tools/` — add one reviewed, public-safe note per tool.

## Non-goals

This starter is not a backup of a live Hermes install. It does not include runtime state, sessions, memories, credentials, recovery archives, channel routing, or private account configuration.

## Safety promise

This repository should always be safe to share publicly. If a file would reveal personal context, live runtime state, or credentials, it belongs somewhere else.
