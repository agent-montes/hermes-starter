# Workflow Delegation Map

The delegation map decides what Hermes can do, what Hermes can prepare, and what should stay manual.

## Four buckets

### 1. Fully autonomous

Hermes may complete these without additional approval once the workflow is approved.

Typical traits:

- low risk;
- reversible;
- no external message/post/contact;
- no money movement;
- no secret access;
- clear success criteria;
- easy verification.

Examples with placeholders:

- summarize a public RSS feed;
- format a draft note;
- prepare a non-sensitive checklist.

### 2. Draft or research, then approve

Hermes may prepare the work, but the user approves before it affects the outside world.

Typical traits:

- message, email, post, PR, issue, or document will be sent/shared;
- user judgment is required;
- the result affects another person;
- public visibility is possible.

Examples with placeholders:

- draft an email response;
- prepare a GitHub issue;
- recommend a purchase, but do not buy.

### 3. Remind or prepare context only

Hermes may gather context, summarize, or remind the user, but should not act.

Typical traits:

- judgment-heavy;
- sensitive personal context;
- unclear success criteria;
- human timing matters.

Examples with placeholders:

- prepare context for a meeting;
- remind the user to review a decision;
- summarize options before a call.

### 4. Too risky or manual

Hermes should not automate these.

Typical traits:

- irreversible;
- legal, financial, medical, or safety impact;
- production risk;
- credential handling;
- direct contact with people without a review step;
- low confidence or hard-to-verify outputs.

Examples with placeholders:

- execute a trade;
- delete a live data store;
- send sensitive legal or medical communications without review.

## Scoring rubric

Score each candidate workflow from 1 to 5:

| Factor | 1 = safer | 5 = riskier |
| --- | --- | --- |
| Reversibility | Easy to undo | Hard/impossible to undo |
| External visibility | Private draft | Public or sent to others |
| Money/legal/privacy impact | None | High |
| Credential need | None | Requires secrets |
| Production impact | None | Production-changing |
| Verification difficulty | Easy | Hard |

Suggested handling:

- 6-10 total: candidate for autonomous after testing.
- 11-18 total: draft/research then approve.
- 19-24 total: remind/context only.
- 25+ total: keep manual.

## Verification questions

Before promoting a workflow, ask:

1. What exact input does Hermes need?
2. What exact output should Hermes produce?
3. How will the user know it worked?
4. What should Hermes ignore?
5. What failure would be costly?
6. What requires approval?
7. What logs or artifacts should not be saved?
