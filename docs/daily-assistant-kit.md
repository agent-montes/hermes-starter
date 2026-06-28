# Daily Assistant Kit

The Daily Assistant Kit turns Hermes from a blank chat box into a structured daily operating partner.

It is intentionally template-first. The public starter provides prompts, maps, safety rules, and review loops. A private Hermes setup fills those templates with the user's real priorities, workflows, and approvals.

## What this kit does

The kit helps Hermes:

1. interview the user about work and recurring responsibilities;
2. identify workflows Hermes can safely help with;
3. separate autonomous work from approval-only work;
4. choose a small first set of workflows;
5. create a short morning check-in loop;
6. turn repeated workflows into skills;
7. turn proven recurring checks into scheduled jobs;
8. review the system weekly and remove low-value automation.

## What this kit does not do

The kit does not ship live automation.

It does not include:

- real user interview answers;
- personal task lists;
- calendar data;
- private messages;
- credentials;
- channel IDs;
- cron IDs;
- live delivery destinations;
- installed skills;
- active scheduled jobs;
- memories;
- runtime state;
- recovery archives.

## How it fits the Hermes folder model

### Hermes Starter

Starter contains reusable public-safe docs and blank templates. This kit belongs here because it teaches the setup pattern without exposing anyone's real work.

### Hermes Operations

Operations is where the filled-in private version belongs. The real delegation map, chosen workflows, runbooks, skill drafts, cron drafts, and weekly review notes should live in private Operations.

### Hermes Wiki

Wiki receives durable, cited, non-secret knowledge that should survive beyond a task. The daily assistant loop should not dump daily priorities into Wiki. Only durable decisions or reusable research belong there.

### Hermes Secrets

Secrets stores credentials only. This kit may ask what permissions a workflow needs, but it must not store or print credentials.

### Hermes Recovery

Recovery stores backup and restore material. This kit should reference Recovery only for restore policy or backup verification, not for daily workflow data.

## Setup order

Use the kit in this order:

1. Run the daily assistant interview.
2. Build the delegation map.
3. Choose only three first workflows.
4. Test one workflow manually.
5. Draft a skill only after the workflow repeats.
6. Draft a scheduled job only after the workflow proves useful.
7. Add explicit safety rules before external actions.
8. Run a weekly workflow review.

## First three workflows

Start small:

1. one easy workflow that gives value today;
2. one recurring workflow that removes manual checking;
3. one high-leverage workflow that improves an important decision.

Do not build a giant automation system first. A few reliable workflows are better than many fragile ones.

## Promotion path

```text
Conversation -> candidate workflow -> delegation map -> manual test -> reusable skill -> scheduled job
```

A workflow should move forward only when it is useful, repeatable, and safe enough for the next level.

## Public-safe rule

The public starter models the system. It never contains a real user's system.
