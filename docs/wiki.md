# Hermes Wiki

The Wiki is the durable knowledge base for a Hermes setup. It is where long-lived, cited, non-secret knowledge belongs.

## Purpose

Use the Wiki for:

- durable notes and decisions
- source summaries
- cited research
- schemas and indexes
- human-readable operational knowledge

Do not use the Wiki for:

- API keys or passwords
- OAuth tokens or cookies
- phone numbers or channel IDs
- gateway routing state
- session databases
- private account exports
- recovery archives

## Suggested structure

```text
Hermes Wiki/
├── SCHEMA.md
├── index.md
├── log.md
├── inbox/
├── raw/
└── human/
```

## File purposes

- `SCHEMA.md` — local governance: naming, citation, source handling, ownership, and privacy rules.
- `index.md` — entry point for important pages.
- `log.md` — chronological record of meaningful Wiki changes.
- `inbox/` — unprocessed notes or source captures waiting for review.
- `raw/` — immutable source captures when used.
- `human/` — human-owned writing when used.

## Agent behavior

Agents should read the Wiki schema before writing. They should search for an existing page before creating a new one. They should preserve evidence, cite sources, and avoid converting inference into fact.

## Public starter boundary

This starter includes only blank Wiki templates. It must not include private Wiki content from a live system.
