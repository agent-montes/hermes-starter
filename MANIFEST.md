# Manifest

Included public-safe artifacts:

## Root documentation

- `README.md` — starter overview and quickstart.
- `QUICKSTART.md` — 10-minute starter path.
- `CHANGELOG.md` — template release history.
- `LICENSE` — MIT license.
- `SECURITY.md` — public-safe disclosure and handling policy.
- `CONTRIBUTING.md` — contribution rules for safe changes.
- `EXCLUDE.md` — material forbidden from the starter.
- `MANIFEST.md` — this file.

## Agent context

- `AGENTS.md` — portable agent instructions.
- `CLAUDE.md` — Claude-compatible context.
- `.hermes.md` — Hermes-specific context.

## Examples and config

- `.hygiene-denylist.example` — copy to local gitignored denylist for private identifiers.
- `config.example.yaml` — placeholder-only config example.
- `.env.example` — placeholder-only environment example.
- `examples/` — non-sensitive examples only.

## Detailed docs

- `docs/system-overview.md` — full setup explanation.
- `docs/daily-assistant-kit.md` — daily assistant interview/delegation/promotion loop.
- `docs/daily-assistant-safety.md` — approval gates and external-action rules.
- `docs/workflow-delegation-map.md` — four-bucket autonomy model and scoring rubric.
- `docs/workspace-overview.md` — five-folder model.
- `docs/wiki.md` — Wiki purpose and structure.
- `docs/operations.md` — Operations purpose and lane model.
- `docs/secrets.md` — secret boundary and safe placeholders.
- `docs/recovery.md` — recovery boundary and restore model.
- `docs/folder-interactions.md` — how folders work together.
- `docs/agent-context-files.md` — purpose of AGENTS, CLAUDE, and Hermes context files.
- `docs/agents-and-tools.md` — agent/tool responsibilities and model-lane policy.
- `docs/secrets-and-recovery.md` — blank secret inventory and recovery boundary guidance.
- `docs/replication-runbook.md` — setup and verification runbook.
- `docs/setup-principles.md` — general principles.
- `docs/github-template-workflow.md` — GitHub template workflow.
- `docs/tool-review-checklist.md` — tool review checklist.
- `docs/voice-lab.md` — public-safe realtime voice shell and Hermes API bridge pattern.

## Templates

- `templates/Hermes Wiki/` — blank Wiki structure.
- `templates/Hermes Operations/` — private Operations lane skeleton, including Daily Assistant Kit templates and a voice-lab evaluation template.
- `templates/Hermes Secrets/` — empty secret-boundary folder and blank category template.
- `templates/Hermes Recovery/` — blank restore and backup templates.

## Example workspace shell

- `workspace/Hermes Wiki/` — public-safe placeholder for the private Wiki folder.
- `workspace/Hermes Operations/` — public-safe placeholder for private Operations docs.
- `workspace/Hermes Secrets/` — intentionally empty folder marker only.
- `workspace/Hermes Recovery/` — public-safe placeholder for private Recovery docs.

## Tools and automation

- `tools/README.md` — index for the credited public-safe tool catalog.
- `tools/document-conversion.md` — MarkItDown.
- `tools/web-crawlers.md` and `tools/web-ingest.md` — Crawl4AI and web/document ingest policy.
- `tools/media-processing.md` — FFmpeg and ImageMagick.
- `tools/video-generation.md` — Manim, FFmpeg, and p5.js.
- `tools/image-generation.md` — ComfyUI, p5.js, Excalidraw, ImageMagick.
- `tools/audio-and-transcription.md` — Whisper and FFmpeg.
- `tools/realtime-voice.md` — realtime voice front ends and Hermes voice-shell boundaries.
- `tools/youtube-and-downloaders.md` — yt-dlp and FFmpeg.
- `tools/ascii-and-terminal-art.md` — pyfiglet, cowsay, boxes.
- `tools/creative-web-artifacts.md` — p5.js, Excalidraw, ImageMagick.
- `tools/github-and-dev-workflow.md` — GitHub CLI, git, zx.
- `tools/research-and-gif-tools.md` — Exa and Tenor GIF API.
- `tools/local-models.md` and `tools/local-ollama.md` — Ollama/local fallback policy.
- `scripts/hygiene-check.sh` — local leak/hygiene check with optional local denylist.
- `scripts/init-workspace.sh` — one-command private sibling-folder initializer with dry-run mode.
- `scripts/sync-context-files.sh` — verifies/generates `AGENTS.md` and `CLAUDE.md` from canonical `.hermes.md`.
- `scripts/validate-yaml.py` — YAML syntax validation for examples/workflows.
- `.github/workflows/hygiene.yml` — CI for hygiene, context drift, shell, Markdown, YAML, links, and secret scanning.
- `workspace/` — public-safe visible folder shell for the five-folder model.
- `workspace/Hermes Secrets/.gitkeep` — inert placeholder only; no secret template or value lives in this folder.

Every file should be safe to share publicly.
