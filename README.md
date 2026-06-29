# Hermes Starter

Hermes Starter is a clean, public-safe GitHub template for building a private Hermes Agent workspace from scratch.

It explains the full workspace pattern: Wiki, Operations, Secrets, Recovery, agent context files, tools, hygiene checks, and the way those parts work together. It is intentionally detailed enough to help a new user reproduce the structure, but it must never contain real credentials, runtime state, private identifiers, recovery archives, logs, sessions, or personal machine details.

Use this repository as a template, then customize the copy on your own machine.

## What this repository is

Hermes Starter is:

- a public-safe starting point for a Hermes Agent setup;
- a documentation-first architecture template;
- a folder model for separating knowledge, operations, credentials, backups, and reusable public instructions;
- a set of blank templates for private local folders;
- a hygiene-checked GitHub template repository;
- a safe place to document generic tool setup and agent operating rules.

Hermes Starter is not:

- a backup of a live Hermes install;
- a copy of a real `~/.hermes` directory;
- a secret store;
- a recovery archive;
- a personal Wiki export;
- a runtime state bundle;
- a place for chat IDs, phone numbers, OAuth files, sessions, logs, or API keys.

## The core idea

A clean Hermes setup should separate five concerns into sibling folders:

```text
Hermes Starter/     public reusable template and documentation
Hermes Wiki/        durable non-secret knowledge base
Hermes Operations/  private operating manual and runbooks
Hermes Secrets/     credentials only, private, never published
Hermes Recovery/    backups and restore artifacts, private, never published
```

The folders remain siblings because they have different safety and ownership rules. Do not merge them into one giant folder.

The Starter teaches someone how to construct a Hermes workspace. It should not contain the private workspace itself.

## Folder responsibilities

### Hermes Starter

`Hermes Starter/` is the public template.

It contains:

- setup explanations;
- blank folder templates;
- placeholder config examples;
- public-safe tool notes;
- voice-lab evaluation boundaries;
- agent context examples;
- hygiene checks;
- GitHub workflow checks.

It must not contain:

- real `.env` files;
- `auth.json`;
- provider API keys;
- OAuth tokens;
- passwords;
- cookies;
- phone numbers;
- private chat or channel IDs;
- session databases;
- memories or user profiles;
- logs with identifiers;
- recovery archives;
- private Wiki content;
- machine-specific paths.

### Hermes Wiki

`Hermes Wiki/` is the durable knowledge base.

Use it for:

- long-lived notes;
- cited research;
- source summaries;
- schema/governance rules;
- indexes;
- logs of meaningful knowledge-base changes;
- durable decisions that should survive a single chat session.

Suggested Wiki structure:

```text
Hermes Wiki/
├── SCHEMA.md
├── index.md
├── log.md
├── inbox/
├── raw/
└── human/
```

Suggested meanings:

- `SCHEMA.md` defines naming, citation, source handling, privacy, and ownership rules.
- `index.md` is the main navigation entry point.
- `log.md` records meaningful Wiki changes.
- `inbox/` receives unprocessed notes or source captures.
- `raw/` stores immutable source captures, if used.
- `human/` stores human-owned writing, if used.

The Wiki should not store secrets. It may mention that a credential exists, but never the credential value.

### Hermes Operations

`Hermes Operations/` is the private operating manual for a live Hermes setup.

Use it for:

- how the system runs;
- installation and bootstrap instructions;
- non-secret configuration notes;
- tool review notes;
- gateway and messaging policy;
- scheduled job policy;
- maintenance routines;
- recovery references;
- agent operating rules.

Suggested Operations structure:

```text
Hermes Operations/
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── .hermes.md
├── 00-overview/
├── 01-install/
├── 02-config/
├── 03-gateway/
├── 04-tools/
├── 05-cron/
├── 06-recovery/
└── 07-maintenance/
```

Suggested lane meanings:

- `00-overview/` explains the local operating model.
- `01-install/` documents how Hermes and dependencies are installed.
- `02-config/` documents non-secret configuration.
- `03-gateway/` documents messaging and remote-control surfaces without IDs or tokens.
- `04-tools/` documents reviewed tools, provenance, license, install method, storage paths, and network behavior.
- `05-cron/` documents scheduled jobs, expected outputs, and failure behavior.
- `06-recovery/` documents how Operations references private Recovery artifacts.
- `07-maintenance/` documents audits, cleanup, updates, and publishing workflows.

Operations may reference Secrets and Recovery locations with placeholders, but it must not duplicate credential values or backup archives.

### Hermes Secrets

`Hermes Secrets/` is the private credential boundary.

In this starter, the visible `workspace/Hermes Secrets/` shell is intentionally blank except for `.gitkeep`.

A real private Secrets folder or secret manager may contain credentials such as:

- model provider API keys;
- OAuth client secrets and refresh tokens;
- messaging platform tokens;
- SMTP/IMAP credentials;
- webhook signing secrets;
- recovery codes;
- database passwords;
- private SSH keys.

The starter may document secret categories and variable names, but never values.

Safe placeholder style:

```text
MODEL_PROVIDER_API_KEY=<PLACEHOLDER_ONLY>
MESSAGING_PLATFORM_TOKEN=<PLACEHOLDER_ONLY>
EMAIL_PASSWORD=<PLACEHOLDER_ONLY>
```

Unsafe style:

```text
MODEL_PROVIDER_API_KEY=<real value>
MESSAGING_PLATFORM_TOKEN=<real value>
EMAIL_PASSWORD=<real value>
```

Agents should not read, print, copy, upload, summarize, or move secret-bearing files unless the live user explicitly approves that secret-related action.

### Hermes Recovery

`Hermes Recovery/` is the private backup and restore boundary.

Use it for:

- encrypted backup archives;
- restore manifests;
- restore runbooks;
- verification notes;
- machine replacement instructions.

This starter includes only blank recovery templates. It must never contain real backup archives or real recovery state.

Suggested private Recovery structure:

```text
Hermes Recovery/
├── current/
├── manifests/
├── restore-runbooks/
└── verification/
```

Safe public recovery docs describe process and fields. They do not include real paths, archive names, identifiers, checksums, keys, credentials, schedules tied to a person, or exact private storage locations.

## How the folders work together

The flow is:

```text
Starter -> gives a clean public template
Operations -> tells agents how the private setup runs
Wiki -> stores durable non-secret knowledge
Secrets -> supplies credentials locally
Recovery -> restores private config/state after failure
```

### New setup flow

1. Create a new repository from this GitHub template.
2. Clone it on the target machine.
3. Create private sibling folders for Wiki, Operations, Secrets, and Recovery.
4. Copy blank templates from `templates/` into those private folders.
5. Replace placeholders in private files only.
6. Store real credentials only in Secrets or a password manager.
7. Keep recovery archives out of Git.
8. Run `scripts/hygiene-check.sh` before publishing changes to Starter.

### Adding a new tool

1. Research the tool privately.
2. Check source, license, update policy, storage paths, network behavior, and credential access.
3. Install and test using non-sensitive data.
4. Store credentials only in Secrets.
5. Record durable non-secret conclusions in Wiki if useful.
6. Document live setup details in Operations.
7. Distill only generic, reusable instructions into Starter.
8. Run hygiene checks.
9. Commit and push the public-safe Starter update.

### Recovering a machine

1. Use the private Recovery runbook.
2. Reinstall Hermes and required system dependencies.
3. Restore private configuration/state locally.
4. Reconnect Secrets locally.
5. Verify tools, gateway, cron, and Wiki paths.
6. Confirm no recovery material is copied into Starter.

## Agent context files

This repo includes three context-file patterns because different agentic tools load different files.

### `AGENTS.md`

Portable agent instructions.

Use it for:

- repository-wide safety rules;
- contribution rules;
- verification expectations;
- public-safe editing boundaries.

### `CLAUDE.md`

Claude-compatible context.

Use it for:

- the same safety rules as `AGENTS.md`;
- Claude-specific project context where needed;
- preventing Claude-based tools from treating the starter as a live secret-bearing workspace.

### `.hermes.md`

Hermes-specific context.

Use it for:

- Hermes-specific behavior expectations;
- tool-use boundaries;
- public-safe starter rules;
- reminders that live secrets and runtime state belong elsewhere.

In a private Operations folder, these context files may be adapted to local workflows. In this public starter, they must stay generic and placeholder-only.

## Agent roles documented by this starter

The starter describes roles, not private identities.

### Main Hermes brain

The primary reasoning model for normal Hermes work. In the public template, provider and model are placeholders:

```yaml
primary_provider: <PRIMARY_PROVIDER>
primary_model: <PRIMARY_MODEL>
```

### Remote-control surface agent

The surface that receives messages from a chosen platform and routes requests to Hermes.

Responsibilities:

- receive user requests;
- ask for approvals when needed;
- run safe tools;
- summarize results;
- avoid exposing secrets;
- avoid restarting its own gateway unless explicitly approved.

Public placeholders:

```yaml
messaging_platform: <MESSAGING_PLATFORM>
gateway_service: <GATEWAY_SERVICE_NAME>
```

### Wiki agent

Maintains durable non-secret knowledge.

Responsibilities:

- read local Wiki schema before writes;
- search for existing pages before creating new ones;
- cite sources;
- preserve evidence;
- update index/log files;
- avoid turning inference into fact;
- avoid secrets.

### Operations agent

Maintains the private operating manual.

Responsibilities:

- keep runbooks current;
- document tool provenance;
- record verified setup procedures;
- keep instructions separate from secrets;
- run audits and report failures.

### Cron and watchdog agents

Run scheduled checks.

Recommended behavior:

- stay silent when healthy;
- report failures or required decisions;
- verify freshness, not just command exit codes;
- avoid publishing backups, secrets, or private routing data.

### Tool-provenance agent

Reviews public tools before install or update.

Responsibilities:

- record source URL;
- record license;
- pin version or revision when useful;
- document storage/cache paths;
- document network behavior;
- document credential access;
- use report-only update checks before changing a live system.

### Emergency local model lane

Optional fallback lane for local models.

Public-safe rule:

```yaml
local_models:
  role: emergency-fallback-only
  expose_to_network: false
```

Do not expose unauthenticated local model APIs to a LAN or public internet.

## Repository layout

```text
.
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── .hermes.md
├── .env.example
├── config.example.yaml
├── EXCLUDE.md
├── MANIFEST.md
├── SECURITY.md
├── CONTRIBUTING.md
├── docs/
├── examples/
├── scripts/
├── templates/
├── tools/
├── workspace/
└── .github/workflows/hygiene.yml
```

Important directories:

- `docs/` contains detailed explanations.
- `templates/` contains copyable blank templates.
- `workspace/` shows the public-safe shape of the sibling folders.
- `examples/` contains placeholder examples only.
- `tools/` contains the credited public-safe tool catalog.
- `scripts/` contains local checks, workspace initialization, YAML validation, and context mirror verification.
- `.github/workflows/` runs hygiene, context, shell, Markdown, YAML, link, and secret-scan checks on GitHub.
- `QUICKSTART.md` contains the short 10-minute path.

The tool catalog includes notes for document conversion, web crawlers, media processing, video generation, image generation, audio/transcription, YouTube/download helpers, ASCII/terminal art, creative web artifacts, GitHub/dev workflow tools, search/GIF tools, and local model fallback tools. Each note credits the official source or project and keeps credentials/output/state out of Git.

The Daily Assistant Kit adds a structured way to make Hermes useful every day without over-automating: interview the user, build a delegation map, choose three first workflows, test manually, promote repeated workflows into skills, promote proven checks into scheduled jobs, and review weekly. It is documented in `docs/daily-assistant-kit.md`, `docs/daily-assistant-safety.md`, and `docs/workflow-delegation-map.md`. Public templates live under `templates/Hermes Operations/`; active skills, cron jobs, memory writes, and external actions are created only in the user's private setup after explicit approval.

## Important docs

- `docs/workspace-overview.md` — five-folder architecture.
- `docs/folder-interactions.md` — how the folders work together.
- `docs/system-overview.md` — system-level explanation.
- `docs/daily-assistant-kit.md` — daily assistant interview/delegation/promotion loop.
- `docs/daily-assistant-safety.md` — approval gates and external-action boundaries.
- `docs/workflow-delegation-map.md` — four-bucket autonomy model and scoring rubric.
- `docs/wiki.md` — Wiki purpose and structure.
- `docs/operations.md` — Operations purpose and lane model.
- `docs/secrets.md` — secret boundary and placeholder rules.
- `docs/recovery.md` — recovery boundary and restore model.
- `docs/agents-and-tools.md` — agent/tool roles.
- `docs/agent-context-files.md` — context-file purpose.
- `docs/secrets-and-recovery.md` — secret/recovery guardrails.
- `docs/replication-runbook.md` — setup checklist.
- `docs/tool-review-checklist.md` — tool review process.
- `docs/github-template-workflow.md` — safe publishing workflow.

## Templates included

```text
templates/Hermes Wiki/
templates/Hermes Operations/
templates/Hermes Secrets/
templates/Hermes Recovery/
```

The Secrets template documents categories only. The visible workspace Secrets folder is blank except for `.gitkeep`.

## Quickstart

For the shortest path, use `QUICKSTART.md`.

1. Click `Use this template` on GitHub.
2. Create a new private or public repo from it.
3. Clone your new repo locally.
4. Preview workspace creation:

```bash
./scripts/init-workspace.sh --dry-run
```

5. Create the private sibling folders from templates:

```bash
./scripts/init-workspace.sh
```

6. Put real credentials only in a private secret store.
7. Put backup artifacts only in private Recovery storage.
8. Run:

```bash
./scripts/hygiene-check.sh
./scripts/sync-context-files.sh . --check
./scripts/validate-yaml.py .
```

9. Commit only public-safe starter changes.

## Hygiene and safety checks

The starter includes `scripts/hygiene-check.sh`, `scripts/init-workspace.sh`, `scripts/sync-context-files.sh`, `scripts/validate-yaml.py`, and a GitHub Actions workflow.

The hygiene check looks for:

- real secret/runtime filenames;
- archive files;
- session/state artifacts;
- cache/log/request-dump directories;
- hardcoded home paths;
- phone-number-like strings;
- token-like assignments;
- known token prefixes;
- private key blocks;
- local denylist entries from `.hygiene-denylist.local`, if configured;
- non-placeholder files inside the visible Secrets shell.

Passing hygiene does not prove perfect safety. It is a guardrail. Human review is still required before broad public sharing.

## What must never be committed

Never commit:

- real `.env` files;
- `auth.json`;
- API keys;
- OAuth tokens;
- passwords;
- cookies;
- recovery codes;
- phone numbers;
- chat IDs;
- channel IDs;
- gateway routing state;
- sessions;
- memories;
- request dumps;
- private logs;
- private Wiki pages;
- recovery archives;
- database files;
- private SSH keys;
- machine-specific paths.

When in doubt, document the reconstruction step instead of committing the private artifact.

## Maintainer workflow

When improving this starter:

1. Make changes locally.
2. Keep everything placeholder-only.
3. Run the local checks:

```bash
./scripts/hygiene-check.sh
./scripts/sync-context-files.sh . --check
./scripts/validate-yaml.py .
```

4. Review `git status --short`.
5. Commit with a clear message.
6. Push to GitHub.
7. Confirm the GitHub Actions hygiene workflow passes.

## Non-goals

This repo does not provide:

- live Hermes runtime state;
- private account setup;
- credential material;
- recovery archives;
- a universal security policy;
- a guarantee that a generated workspace is safe without local review.

## Safety promise

This repository should always be safe to share publicly. If a file would reveal personal context, live runtime state, credentials, private routing, or recovery material, it belongs outside this repository.
