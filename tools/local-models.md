# Local Models and Emergency Fallbacks

Purpose: document optional local model tools without making them the default reasoning lane.

## Tools and credits

### Ollama

- Source/credit: Ollama project
- Website: https://ollama.com/
- Documentation: https://docs.ollama.com/
- Repository: https://github.com/ollama/ollama
- Purpose: run and manage local language models through a local service and API.

## Public-safe usage policy

Local models may be useful as an emergency fallback or private offline lane, but they should not silently replace the main reasoning model.

Recommended public-safe default:

```yaml
local_models:
  role: emergency-fallback-only
  expose_to_network: false
```

Bind local model APIs to loopback unless a user explicitly designs a secured network deployment.

## Safe smoke test

```bash
ollama --version
```

Do not commit downloaded model blobs, caches, prompts containing private data, or model server logs.

## Secret boundary

Local-only Ollama use usually needs no credentials. Cloud model registries, private model storage, or hosted inference APIs require Secrets.
