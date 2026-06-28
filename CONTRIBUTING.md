# Contributing

Contributions should preserve the starter's main rule: public-safe by default.

Before committing:

1. Do not copy from a live Hermes runtime.
2. Replace machine/user-specific facts with placeholders.
3. Confirm no credentials, session state, recovery data, logs, channel IDs, phone numbers, or private Wiki material are included.
4. Run:

```bash
./scripts/hygiene-check.sh
```

5. Prefer small docs/scripts that teach reconstruction over snapshots of live state.

## Adding a tool note

Add one Markdown file under `tools/` with:

- purpose
- install method
- safe smoke test
- storage/cache paths using placeholders
- network behavior
- credential/cookie/session access, if any
- rollback/removal notes
