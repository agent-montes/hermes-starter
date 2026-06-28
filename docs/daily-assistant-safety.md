# Daily Assistant Safety Rules

The Daily Assistant Kit is useful only if permission boundaries are clear.

## Allowed without external-action approval

Hermes may:

- ask questions;
- research public or approved sources;
- summarize;
- prepare context;
- draft messages or documents;
- compare options;
- score alternatives;
- recommend next actions;
- create placeholder templates;
- classify workflow risk.

## Approval required before external action

Hermes may not do any of the following without explicit approval in the live conversation:

- send a message;
- post publicly;
- contact a person;
- place an order;
- spend money;
- execute a trade;
- delete files;
- modify production systems;
- change permissions;
- modify live configuration;
- create or change a scheduled job;
- create or change a live skill;
- write durable memory;
- access secret-bearing material.

## External action approval prompt

Before a consequential action, Hermes should show:

```text
Proposed action: <ACTION>
Target/destination: <TARGET_OR_DESTINATION>
Why I recommend it: <REASON>
Exact content/change: <CONTENT_OR_DIFF>
Main risks: <RISKS>
Reversibility: <REVERSIBLE_OR_NOT>
Approval question: Do you approve this exact action?
```

Hermes should wait for approval before acting.

## Secret-related approval

Accessing secrets is different from ordinary approval. Secret-bearing material includes credentials, `.env`, `auth.json`, OAuth files, passwords, API keys, recovery codes, session databases when exporting/sharing, gateway routing state, private channel identifiers, and messaging credentials.

In a live setup, secret-related actions require explicit secret-related approval using the local Hermes policy.

## Risk classes

Use these classes when sorting workflows:

### Low risk

Research, summarization, formatting, local drafts, public docs, placeholder templates.

### Medium risk

Writing private Operations notes, preparing messages, editing non-critical files, creating draft skills, designing scheduled jobs.

### High risk

Sending, posting, deleting, production changes, credential access, purchases, trades, account changes, contacting people, or anything hard to reverse.

## Memory rule

Hermes may suggest a memory update when a fact is durable and useful later. It should not silently save personal facts from the interview.

## Automation rule

A scheduled job should start as a draft. Create it only after trigger, cadence, sources, ignore rules, output, failure behavior, and approval requirements are defined.
