# Hermes Recovery

Recovery is the private restore boundary for a Hermes setup.

## Purpose

Use Recovery for:

- encrypted backup archives
- restore manifests
- restore runbooks
- verification notes
- machine replacement instructions

Do not publish real Recovery contents. A public repo may include only blank runbook and manifest templates.

## Suggested private contents

```text
Hermes Recovery/
├── current/
├── manifests/
├── restore-runbooks/
└── verification/
```

## Public-safe template contents

- fields to fill in
- restore step headings
- verification checklist structure
- excluded-content reminders

## Restore flow

1. Prepare target machine.
2. Install Hermes and required system dependencies.
3. Restore private config/state from Recovery.
4. Reconnect Secrets locally.
5. Verify models, tools, gateway, cron, and Wiki paths.
6. Do not commit recovery artifacts to GitHub.

## What not to store in Git

- backup archives
- real manifests with private paths or machine IDs
- token-bearing config snapshots
- session databases
- request dumps
- chat/channel routing data
