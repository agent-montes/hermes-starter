# Local Ollama Emergency Fallback

Use local models only as an emergency or optional local fallback, not as a silent replacement for the main cloud reasoning model.

Safety defaults:

- Bind Ollama to loopback only: `127.0.0.1:11434`.
- Do not expose the unauthenticated API to LAN or WAN.
- Use small models that fit the target machine.
- Smoke-test with exact expected output.
- Keep model aliases and contexts machine-appropriate.
