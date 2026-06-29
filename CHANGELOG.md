# Changelog

## 0.1.2 - 2026-06-29

Public-safe voice-lab skeleton update.

Highlights:

- added `docs/voice-lab.md` for realtime voice shell experiments;
- added `tools/realtime-voice.md` with provider, secret, account setup, and rollback boundaries;
- added a private Operations voice-lab evaluation template;
- documented that account verification, CAPTCHA, recovery, billing, and passkey steps are human-only;
- kept provider keys, browser state, logs, transcripts, project IDs, and live sandbox state out of the starter.

## 0.1.1 - 2026-06-28

CI fix: adjusted starter shell scripts to satisfy ShellCheck in GitHub Actions.

## 0.1.0 - 2026-06-28

Initial public-safe Hermes workspace template release.

Highlights:

- five-folder workspace model: Starter, Wiki, Operations, Secrets, Recovery;
- public-safe documentation and templates;
- custom hygiene checker;
- credited tool catalog;
- Daily Assistant Kit templates;
- one-command workspace initializer with dry-run mode;
- context mirror drift check for `.hermes.md`, `AGENTS.md`, and `CLAUDE.md`;
- expanded CI for hygiene, shell, Markdown, links, YAML, context drift, and secret scanning.
