# Secrets and Recovery

This repository may document how secrets and recovery are handled, but it must not contain secret values or backup artifacts.

## Secrets folder rule

`Hermes Secrets/` is for credentials only in the private workspace. In Git, it should be blank or represented only by an inert placeholder so the folder shape is visible.

Never commit:

- `.env` files;
- authentication JSON;
- OAuth tokens;
- API keys;
- passwords;
- recovery codes;
- cookies;
- session or state databases;
- request dumps;
- messaging credentials;
- phone numbers;
- channel IDs;
- gateway routing state.

## Blank secret inventory template

Use this as a private checklist. Fill values only in your real secret manager or private secrets folder, never in Git.

```text
Provider credentials
- <PROVIDER_NAME>: stored in <SECRET_STORE_LOCATION>

Messaging gateway credentials
- <MESSAGING_PLATFORM>: stored in <SECRET_STORE_LOCATION>

Git hosting credentials
- <GIT_HOST>: stored in <SECRET_STORE_LOCATION>

Recovery credentials
- <RECOVERY_METHOD>: stored in <SECRET_STORE_LOCATION>

Rotation notes
- owner: <ROLE_OR_PERSON>
- rotation cadence: <CADENCE>
- last private rotation record: <PRIVATE_LOCATION>
```

Keep this template blank in the repository.

## Recovery folder rule

`Hermes Recovery/` is for private backup manifests, restore notes, and recovery artifacts. Do not commit actual backup archives or machine-specific recovery state.

Safe to document in Git:

- what must be backed up;
- what must never be backed up publicly;
- restore order;
- verification commands with placeholders;
- incident checklist.

Never commit:

- tarballs;
- zip files;
- database dumps;
- session exports;
- private manifests containing paths or identifiers;
- screenshots containing secrets;
- credential recovery codes.

## Restore order

Recommended private restore sequence:

1. Install Hermes and base dependencies.
2. Restore private secrets from the secret store.
3. Restore private runtime configuration.
4. Restore Operations instructions.
5. Restore Wiki knowledge if used.
6. Restore scheduled jobs only after checking that destinations and credentials are correct.
7. Run hygiene and status checks before enabling remote access.

## Approval rule

Any action that reads, copies, prints, backs up, uploads, or summarizes secret-bearing files requires explicit secret-related approval in the live environment.
