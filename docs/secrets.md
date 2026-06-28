# Hermes Secrets

Secrets is the private-only credential boundary. A public starter may include an empty Secrets folder and blank category templates, but never real values.

## Purpose

Use Secrets or a password manager for:

- model provider API keys
- OAuth client secrets and refresh tokens
- messaging platform tokens
- SMTP/IMAP credentials
- webhook signing secrets
- recovery codes
- database passwords
- private SSH keys

## Public-safe documentation

It is safe to document categories and placeholder variable names. It is not safe to include values.

Safe placeholder style:

- `MODEL_PROVIDER_API_KEY=<PLACEHOLDER_ONLY>`
- `MESSAGING_PLATFORM_TOKEN=<PLACEHOLDER_ONLY>`
- `EMAIL_PASSWORD=<PLACEHOLDER_ONLY>`

Unsafe style:

- any real token value
- any copied credential file
- any account-specific routing or recovery detail

## Hard exclusions

Never publish:

- `.env` with real values
- `auth.json`
- API keys
- OAuth tokens
- passwords
- cookies
- phone numbers
- chat IDs or channel IDs
- gateway routing state
- recovery codes
- private email credentials

## Agent behavior

Agents must ask for explicit secret-related approval before reading, copying, printing, moving, storing, or testing secret-bearing files or values. Normal command approval is not enough for secrets.
