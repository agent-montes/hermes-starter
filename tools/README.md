# Tools Catalog

This folder contains public-safe notes for reviewed or candidate tools that may be useful in a Hermes setup.

Each note should credit where the tool came from and include:

- purpose;
- official source, repository, or documentation;
- license when known;
- safe install/evaluation pattern;
- smoke-test guidance;
- risks and limits;
- where secrets belong;
- rollback/removal notes when relevant.

## Catalog

- `document-conversion.md` — MarkItDown and local file-to-Markdown conversion.
- `web-crawlers.md` — Crawl4AI and bounded public web ingest.
- `web-ingest.md` — short policy note for web/document ingest.
- `media-processing.md` — FFmpeg and ImageMagick.
- `video-generation.md` — Manim, FFmpeg, and p5.js for animation/video.
- `image-generation.md` — ComfyUI, p5.js, Excalidraw, ImageMagick.
- `audio-and-transcription.md` — Whisper and FFmpeg.
- `youtube-and-downloaders.md` — yt-dlp and FFmpeg.
- `ascii-and-terminal-art.md` — pyfiglet, cowsay, boxes.
- `creative-web-artifacts.md` — p5.js, Excalidraw, ImageMagick.
- `github-and-dev-workflow.md` — GitHub CLI, git, zx.
- `research-and-gif-tools.md` — Exa and Tenor GIF API.
- `local-models.md` — Ollama and local-model fallback policy.
- `local-ollama.md` — short Ollama-specific note retained for discoverability.

## Public-safe rule

Do not include credentials, private URLs, channel IDs, copied live config, model blobs, generated private outputs, logs, request dumps, or local machine paths.
