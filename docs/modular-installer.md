# Modular Installer Model

Hermes Starter is evolving into a modular installer.

The base path creates the private five-folder workspace. Optional modules add feature-specific templates and setup guidance without turning the starter into a copy of anyone's live system.

## Current command shape

Base workspace:

```bash
./scripts/init-workspace.sh
```

Preview available modules:

```bash
./scripts/init-workspace.sh --list-modules
```

Base workspace plus JARVIS voice notes:

```bash
./scripts/init-workspace.sh --with jarvis-voice
```

Dry-run:

```bash
./scripts/init-workspace.sh --dry-run --with jarvis-voice
```

## Design rule

Modules may install public-safe structure, examples, and documentation.

Modules must not install real secrets, OAuth state, channel IDs, phone numbers, session databases, logs, recordings, recovery archives, or private workflow state.

## Module layout

```text
modules/<module-id>/
├── module.yaml
├── README.md
└── templates/
    └── Hermes Operations/
        └── ... public-safe private Operations templates ...
```

Optional runnable source can live elsewhere, for example:

```text
apps/jarvis-voice/
```

The module registry points to the app path but does not start it automatically.

## Future module ideas

Potential modules should follow the same no-secrets rule:

- `jarvis-voice` — desktop/phone voice shell for Hermes;
- `bluebubbles-gateway` — iMessage gateway setup docs and placeholders only;
- `daily-assistant` — interview, delegation, cron-draft, and weekly-review templates;
- `github-workflow` — repo hygiene, PR, and release scripts;
- `wiki-ops` — Wiki schema and operation templates.

## Installer phases

A mature module installer should use these phases:

1. `plan` — print what will happen.
2. `copy` — copy public-safe templates.
3. `local-config` — create ignored local placeholder files only when explicitly requested.
4. `install` — install public dependencies from pinned package manifests.
5. `verify` — run smoke tests without secrets.
6. `connect` — tell the human what secrets or provider setup are required locally.

Only phases 1 and 2 are implemented in the starter initializer today.

## Secret boundary

If a module needs a credential, the public repo may document:

- variable name;
- purpose;
- provider or local system;
- whether it is required or optional;
- where to put it locally.

The public repo must never contain the value.
