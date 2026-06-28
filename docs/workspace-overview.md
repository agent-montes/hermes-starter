# Workspace Overview

Hermes Starter describes a clean, reusable folder model for a Hermes Agent workspace. The starter itself is public-safe. The live workspace you create from it is private.

## Five-folder model

| Folder | Public? | Purpose | What belongs there | What must not go there |
|---|---:|---|---|---|
| `Hermes Starter/` | Yes | Reusable template, docs, examples, checks | Placeholder configs, setup docs, public-safe scripts | Real credentials, runtime state, personal logs |
| `Hermes Wiki/` | Usually private | Durable knowledge base | Cited notes, schemas, indexes, source summaries | Secrets, tokens, private account exports |
| `Hermes Operations/` | Private | Live runbooks and operating policy | Install notes, tool provenance, maintenance procedures | Secret values, copied auth files, recovery archives |
| `Hermes Secrets/` | Private only | Credential storage boundary | Local secret files or references to a password manager | Public docs, logs, source notes |
| `Hermes Recovery/` | Private only | Backup and restore material | Encrypted backups, restore manifests, verification notes | Public templates with real paths or IDs |

## How the folders work together

1. `Hermes Starter` provides public-safe scaffolding.
2. A new user copies templates from `Hermes Starter` into private sibling folders.
3. `Hermes Operations` becomes the local runbook for the live machine.
4. `Hermes Wiki` stores durable non-secret knowledge and citations.
5. `Hermes Secrets` supplies credentials locally without being copied into docs.
6. `Hermes Recovery` restores private state if the machine fails.

## Design rule

The starter teaches reconstruction. It must not be a snapshot of a live Hermes machine.
