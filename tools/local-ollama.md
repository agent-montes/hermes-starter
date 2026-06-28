# Local Ollama Emergency Fallback

Short Ollama-specific note retained for discoverability. See also `local-models.md`.

## Tool and credit

### Ollama

- Source/credit: Ollama project
- Website: https://ollama.com/
- Documentation: https://docs.ollama.com/
- Repository: https://github.com/ollama/ollama
- Purpose: run and manage local language models through a local service and API.

## Safety defaults

Use local models only as an emergency or optional local fallback, not as a silent replacement for the main cloud reasoning model.

- Bind Ollama to loopback only unless a secured network deployment is intentionally designed.
- Do not expose the unauthenticated API to LAN or WAN.
- Use models that fit the target machine.
- Smoke-test with exact expected output.
- Keep model aliases and contexts machine-appropriate.
- Do not commit model blobs, caches, private prompts, or logs.
