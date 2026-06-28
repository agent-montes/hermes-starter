# Image and Visual Generation Tools

Purpose: generate, transform, and inspect images using local or reviewed public-safe tools.

## Tools and credits

### ComfyUI

- Source/credit: Comfy-Org / ComfyUI project
- Repository: https://github.com/Comfy-Org/ComfyUI
- Website: https://www.comfy.org/
- License: GPL-3.0, per repository metadata
- Purpose: node-based visual AI engine for image, video, 3D, audio, and related generation workflows.

### p5.js

- Source/credit: Processing Foundation / p5.js project
- Website: https://p5js.org/
- Repository: https://github.com/processing/p5.js
- Purpose: browser-based generative art and interactive sketches.

### Excalidraw

- Source/credit: Excalidraw project
- Website: https://excalidraw.com/
- Repository: https://github.com/excalidraw/excalidraw
- Developer docs: https://docs.excalidraw.com/
- Purpose: hand-drawn style diagrams, wireframes, and visual notes.

### ImageMagick

- Source/credit: ImageMagick project
- Website: https://imagemagick.org/
- Repository: https://github.com/ImageMagick/ImageMagick
- Purpose: command-line image conversion and manipulation.

## Public-safe usage policy

Do not commit generated private images, seed/output logs tied to a person, model files, checkpoints, private prompts, or source assets.

For ComfyUI, keep models, checkpoints, caches, workflows with private paths, and generated outputs outside the starter repo.

## Safe smoke tests

Use small synthetic prompts or sketches and write outputs to temporary folders.

## Secret boundary

Local image generation usually needs no secrets. Any hosted model API, paid generation provider, private model registry, or cloud storage credential belongs in Secrets.
