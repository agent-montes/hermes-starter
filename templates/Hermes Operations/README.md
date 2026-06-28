# Hermes Operations Template

Copy this folder when creating private live Operations docs.

Operations is where setup/runbook instructions live. It may reference Secrets and Recovery, but it must not duplicate secret values or backup archives.

## Suggested workflow

1. Start in `00-overview/` with the operating model.
2. Add install steps to `01-install/`.
3. Add non-secret config instructions to `02-config/`.
4. Document gateway/messaging behavior in `03-gateway/`.
5. Add reviewed tool notes to `04-tools/`.
6. Add scheduled job notes to `05-cron/`.
7. Add restore references to `06-recovery/`.
8. Add maintenance/audit routines to `07-maintenance/`.

## Rule

Keep instructions here. Keep secret values out.
