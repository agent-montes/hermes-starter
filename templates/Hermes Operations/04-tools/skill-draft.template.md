# Skill Draft Template

Use this when a workflow keeps recurring.

Do not install the skill until the user approves the draft.

## Skill drafting prompt

```text
This workflow keeps coming up, so I want to turn it into a reusable skill.

First, ask me any missing questions needed to understand the workflow.

Then create a skill draft with:
1. When to use this skill.
2. Inputs needed from me.
3. Step-by-step process.
4. Safety boundaries.
5. Approval rules.
6. What to verify before final output.
7. Common mistakes to avoid.
8. Example output format.
9. When not to use this skill.

Do not save or install the skill yet. Show me the draft first and ask for approval.
```

## Draft fields

- Skill name: `<SKILL_NAME>`
- Trigger/use case: `<WHEN_TO_USE>`
- Inputs: `<REQUIRED_INPUTS>`
- Prerequisites: `<TOOLS_CONTEXT_PERMISSIONS>`
- Steps:
  1. `<STEP>`
  2. `<STEP>`
  3. `<STEP>`
- Safety boundaries: `<BOUNDARIES>`
- Approval rules: `<APPROVAL_RULES>`
- Verification: `<CHECKS>`
- Common mistakes: `<MISTAKES>`
- Example output: `<EXAMPLE>`
- When not to use: `<EXCLUSIONS>`
