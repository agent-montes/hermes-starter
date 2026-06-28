# Hermes Operations

Operations is the private runbook area for the live Hermes setup.

## Purpose

Use Operations for:

- setup instructions
- tool review notes
- install and upgrade procedures
- gateway and cron operating policy
- maintenance checklists
- non-secret source provenance
- agent context boundaries

Do not use Operations for real credential values, copied auth files, session exports, logs with private identifiers, or recovery archives.

## Suggested lanes

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

## Lane purposes

- `00-overview/` — high-level operating model and decisions.
- `01-install/` — installation and bootstrap steps.
- `02-config/` — non-secret configuration instructions.
- `03-gateway/` — messaging/gateway setup and restart policy.
- `04-tools/` — installed tool notes, provenance, and safety reviews.
- `05-cron/` — scheduled job policy and verification steps.
- `06-recovery/` — restore procedures that reference private Recovery artifacts.
- `07-maintenance/` — audits, updates, cleanup, and hygiene routines.

## Operations-to-Starter workflow

When a new tool is added:

1. Evaluate it privately in Operations.
2. Store any credentials only in Secrets.
3. Record durable non-secret conclusions in Wiki if useful.
4. Distill generic setup instructions into Starter.
5. Run the Starter hygiene check before publishing.
