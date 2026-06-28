# Replication Runbook

Use this runbook to create a new Hermes workspace from the starter without copying private state.

## One-time setup

1. Create sibling folders:

```text
Hermes Wiki/
Hermes Operations/
Hermes Secrets/
Hermes Recovery/
Hermes Starter/
```

2. Copy or generate public-safe starter files into `Hermes Starter/`.
3. Create real credentials only in the private secret store.
4. Configure Hermes locally with placeholders replaced in private config files only.
5. Run the hygiene checker before committing Starter changes.

## Wiki setup

If using the Wiki:

- create a schema file;
- create an index file;
- create an append-only log;
- keep raw evidence immutable;
- keep human-owned notes protected;
- update index and log after successful writes;
- never store secrets in the Wiki.

## Operations setup

Operations should contain the living operating manual and command center.

Recommended files:

- `README.md` for purpose and boundaries;
- `How This Setup Runs.md` for the current operating manual;
- tool source registry with public provenance only;
- audit scripts that report failures;
- context mirrors for agents when needed.

Keep Operations lean. It should hold current operating facts, not chat history or private state.

## Secrets setup

Create the real secrets folder locally and keep it out of Git. Store only credentials and private authentication material there.

Recommended private contents are implementation-specific and should be managed by a password manager, keychain, or private secret store.

## Recovery setup

Create a private recovery folder outside Git. Backups should be encrypted or otherwise protected according to your local security requirements.

Recommended private contents:

- backup manifests;
- restore notes;
- encrypted archives;
- service recovery checklist;
- key rotation notes.

## Verification checklist

Before publishing Starter:

- run `scripts/hygiene-check.sh`;
- inspect `git status --short`;
- confirm no secret-bearing filenames are present;
- confirm no personal paths or identifiers are present;
- confirm `Hermes Secrets/` contains no real files;
- confirm `Hermes Recovery/` contains no archives;
- confirm docs use placeholders rather than private values.
