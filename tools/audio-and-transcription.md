# Audio, Speech, and Transcription Tools

Purpose: convert speech to text, synthesize audio responses, and inspect audio files.

## Tools and credits

### OpenAI Whisper

- Source/credit: OpenAI, `openai/whisper`
- Repository: https://github.com/openai/whisper
- License: MIT, per repository metadata
- Purpose: speech recognition, transcription, translation, and language identification.

### FFmpeg

- Source/credit: FFmpeg project
- Website: https://ffmpeg.org/
- Documentation: https://www.ffmpeg.org/documentation.html
- Purpose: audio extraction, conversion, resampling, and media inspection.

## Public-safe usage policy

Transcripts can contain private data. Do not commit audio files, transcripts, speaker names, call recordings, or metadata unless they are synthetic and public-safe.

## Safe smoke tests

Use generated synthetic audio or a public-domain sample. Keep outputs outside the repo.

## Secret boundary

Local transcription can run without credentials. Hosted speech APIs, TTS providers, or private audio storage require Secrets and explicit approval.
