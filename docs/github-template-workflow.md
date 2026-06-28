# GitHub Template Workflow

Use this repository as a clean starting point, not as a copy of a live Hermes install.

## Maintainer workflow

1. Install and verify a tool in a private Operations workspace.
2. Distill only reusable instructions into this starter.
3. Replace local facts with placeholders.
4. Run `scripts/hygiene-check.sh`.
5. Commit the clean change.
6. Push to GitHub.
7. Confirm the GitHub Actions hygiene workflow passes.
8. Tag stable snapshots when useful.

## User workflow

1. Click `Use this template` on GitHub.
2. Clone the new repo locally.
3. Copy folder templates into private sibling folders.
4. Fill placeholders in example files.
5. Store secrets outside the repository.
6. Run hygiene checks before every push.

## Placeholder convention

Use angle-bracket placeholders for environment-specific values:

- `<YOUR_HOME>`
- `<YOUR_HERMES_HOME>`
- `<YOUR_OPERATIONS_DIR>`
- `<YOUR_WIKI_DIR>`
- `<YOUR_SECRETS_DIR>`
- `<YOUR_RECOVERY_DIR>`
- `<PRIMARY_PROVIDER>`
- `<PRIMARY_MODEL>`
- `<MESSAGING_PLATFORM>`
- `<PLACEHOLDER_ONLY>`

Never replace these with real private values in the template repository.
