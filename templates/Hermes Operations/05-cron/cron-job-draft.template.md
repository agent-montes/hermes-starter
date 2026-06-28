# Cron Job Draft Template

Use this before creating any scheduled job.

This is a design template only. It is not an active cron job.

## Scheduling prompt

```text
I want to turn this workflow into a scheduled job.

Before scheduling anything, help me define:
1. What should trigger the workflow.
2. How often it should run.
3. What sources it should check.
4. What rules it should follow.
5. What it should ignore.
6. What output I should receive.
7. Where the output should be delivered.
8. What should happen if there is no meaningful update.
9. What should require my approval.
10. What could go wrong and how we should detect it.

After that, propose the exact scheduled job prompt.
Do not create the job until I approve it.
```

## Draft fields

- Job name: `<JOB_NAME>`
- Trigger/cadence: `<TRIGGER_OR_SCHEDULE>`
- Source(s): `<SOURCES>`
- Rules: `<RULES>`
- Ignore list: `<IGNORE_RULES>`
- Output format: `<OUTPUT_FORMAT>`
- Delivery destination: `<DELIVERY_PLACEHOLDER_ONLY>`
- No-update behavior: `<SILENT_OR_SUMMARY>`
- Approval requirements: `<APPROVAL_REQUIREMENTS>`
- Failure modes: `<FAILURES_AND_DETECTION>`
- Exact prompt: `<PROMPT>`
- Approved for creation: `<YES_NO>`

## Public-safe reminder

Do not put real chat IDs, phone numbers, private URLs, tokens, or personal delivery targets in this public template.
