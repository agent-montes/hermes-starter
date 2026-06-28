# Morning Check-In Template

This is a prompt template only. It is not an active scheduled job.

## Purpose

Create a short daily loop that helps the user start with leverage instead of a blank chat.

## Suggested prompt

```text
Create a morning check-in workflow for me.

Every morning at <LOCAL_TIME>, ask me what my number one priority is today.

After I answer, do four things:
1. Summarize what I am trying to accomplish in one sentence.
2. Look at my delegation map and suggest three useful ways you can help today.
3. Ask if I want you to start any of those tasks.
4. If my answer reveals a durable preference or recurring responsibility, suggest a memory update, but only save it if I approve and it will still matter later.

Keep the check-in short. Do not overwhelm me.
Do not create tasks, memory, scheduled jobs, send messages, or touch external systems without approval.
```

## Schedule draft

- Local time: `<LOCAL_TIME>`
- Timezone: `<TIMEZONE>`
- Delivery: `<PRIVATE_DELIVERY_DESTINATION>`
- No-response behavior: `<DO_NOTHING_OR_REMIND_ONCE>`
- Allowed actions: `<ASK_SUMMARIZE_SUGGEST>`
- Approval-required actions: `<LIST>`

## Public-safe reminder

Do not include real phone numbers, chat IDs, delivery routes, cron IDs, or personal priorities in this template.
