# Hermes Starter

A clean, reusable starter template for setting up a Hermes Agent workspace.

This repository is public-safe by default. It contains instructions, examples, folder shells, and guardrails only. It must not contain credentials, runtime state, memories, logs, private channel IDs, recovery archives, or user-specific data.

Use this repo as a GitHub template when starting a new Hermes setup, then fill in local details on the target machine.

## What this starter provides

- A suggested sibling-folder layout for a Hermes setup.
- Public-safe details for Wiki, Operations, Secrets, Recovery, and Starter responsibilities.
- Generic agent context files.
- Example config and environment placeholders.
- Tool setup notes that can be adapted after review.
- Hygiene checks to reduce the risk of publishing private state.
- A maintenance pattern for adding new tool instructions without copying live state.

## Suggested sibling folders

```text
Hermes Wiki/        # durable knowledge base, if used
Hermes Operations/  # live operational setup instructions
Hermes Secrets/     # credentials only; blank in Git
Hermes Recovery/    # backups/restore artifacts; no archives in Git
Hermes Starter/     # this clean reusable starter
```

A public-safe folder shell is included under `workspace/` so the intended layout is visible without copying private state.

## Detailed guides

- `docs/workspace-overview.md` — five-folder architecture.
- `docs/folder-interactions.md` — how the folders work together during setup, tool adoption, live operation, recovery, and publishing.
- `docs/system-overview.md` — how Wiki, Operations, Secrets, Recovery, and Starter work together.
- `docs/wiki.md` — Wiki purpose, structure, and write behavior.
- `docs/operations.md` — Operations purpose and lane model.
- `docs/secrets.md` — secret boundary and public-safe placeholder style.
- `docs/recovery.md` — recovery boundary and restore model.
- `docs/agents-and-tools.md` — agent/tool responsibilities and model-lane policy using placeholders.
- `docs/agent-context-files.md` — purpose of AGENTS, CLAUDE, and Hermes context files.
- `docs/secrets-and-recovery.md` — blank secret inventory template and recovery boundaries.
- `docs/replication-runbook.md` — step-by-step setup checklist for a new machine or workspace.
- `docs/setup-principles.md` — short public-safe setup principles.

## Templates and folder shells

- `templates/Hermes Wiki/` — blank Wiki structure.
- `templates/Hermes Operations/` — private Operations lane skeleton.
- `templates/Hermes Secrets/` — secret-boundary placeholder plus blank category template; no values.
- `templates/Hermes Recovery/` — blank restore and backup templates.
- `workspace/` — visible public-safe folder shell; `workspace/Hermes Secrets/` contains only `.gitkeep`.

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
- `docs/` — update public-safe procedures and placeholders.
- `tools/` — add one reviewed, public-safe note per tool.

## Non-goals

This starter is not a backup of a live Hermes install. It does not include runtime state, sessions, memories, credentials, recovery archives, channel routing, or private account configuration.

## Safety promise

This repository should always be safe to share publicly. If a file would reveal personal context, live runtime state, or credentials, it belongs somewhere else.
