# Agent Context Files

Hermes Starter includes three context files because different agentic tools look for different names.

## `AGENTS.md`

Portable agent instructions. Many coding agents and automation tools understand this convention.

Use it for:

- repository-wide rules
- public-safety boundaries
- verification expectations
- contribution workflow

Do not use it for secrets, credentials, phone numbers, channel IDs, or machine-specific runtime state.

## `CLAUDE.md`

Claude-compatible context file. It mirrors the same public-safe rules so Claude-based tools receive the same boundaries.

Use it for:

- concise project purpose
- safe editing constraints
- testing and hygiene expectations

## `.hermes.md`

Hermes-specific project context. Hermes loads this in relevant project sessions.

Use it for:

- Hermes-specific tool expectations
- repo safety policy
- starter-vs-live workspace boundaries

In a private Operations folder, `.hermes.md` can include local workflow rules. In this public starter, it must remain generic and placeholder-only.

## Why this matters

Context files are instructions that can influence agent behavior. Treat them as code-adjacent safety controls.

Good context files are:

- short
- explicit
- public-safe
- easy to audit
- consistent across tools

Bad context files contain:

- real secrets
- operational tokens
- account identifiers
- private logs
- long historical reports
- instructions copied from untrusted sources
