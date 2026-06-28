# Video and Animation Generation Tools

Purpose: create animations, explainer videos, demos, and rendered visual artifacts from public-safe prompts or code.

## Tools and credits

### Manim Community Edition

- Source/credit: Manim Community
- Documentation: https://docs.manim.community/en/stable/
- Repository: https://github.com/ManimCommunity/manim
- Purpose: Python-based mathematical and technical animations.
- Provenance note: Manim Community Edition is maintained by the community and was forked from Grant Sanderson's original Manim project.

### FFmpeg

- Source/credit: FFmpeg project
- Website: https://ffmpeg.org/
- Documentation: https://www.ffmpeg.org/documentation.html
- Purpose: encode, combine, compress, and inspect video/audio outputs.

### p5.js

- Source/credit: Processing Foundation / p5.js project
- Website: https://p5js.org/
- Repository: https://github.com/processing/p5.js
- License: LGPL-2.1, per repository metadata
- Purpose: browser-based creative coding, generative visuals, interactive sketches, and audiovisual experiments.

## Public-safe usage policy

Generated videos are outputs. Do not commit large outputs, private source media, client assets, voice recordings, or prompts containing personal details.

Prefer committing reusable source templates and instructions, not rendered artifacts.

## Safe smoke tests

Use a tiny synthetic scene or sketch. Keep generated files in temporary directories outside the public starter repo.

## Secret boundary

Local Manim, p5.js, and FFmpeg workflows usually need no secrets. Cloud render farms, hosted assets, private datasets, or paid media APIs require Secrets and explicit approval.
