# External Action Approval Rules Template

Use this in private Operations to define approval gates.

## Core rule

Hermes may research, summarize, prepare, draft, compare, score, and recommend.

Hermes may not send messages, post publicly, place orders, execute trades, delete files, change production systems, modify permissions, contact people, create live scheduled jobs, create live skills, or write durable memory without explicit approval.

## Approval format

```text
Proposed action: <ACTION>
Target/destination: <TARGET>
Why I recommend it: <REASON>
Exact content/change: <CONTENT_OR_CHANGE>
Risk: <RISK>
What happens if this is wrong: <FAILURE_MODE>
Rollback plan: <ROLLBACK_IF_ANY>
Approval question: Do you approve this exact action?
```

## Categories

### Draft-only

- `<WORKFLOW>`

### Approval before sending/posting/changing

- `<WORKFLOW>`

### Manual-only

- `<WORKFLOW>`

## Secret handling

Secret-bearing files and values require secret-related approval under local Hermes policy. Do not paste real secrets into this template.
