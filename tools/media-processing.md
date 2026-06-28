# Media Processing Tools

Purpose: inspect, convert, compress, and prepare media files for agent workflows.

## Tools and credits

### FFmpeg

- Source/credit: FFmpeg project
- Website: https://ffmpeg.org/
- Documentation: https://www.ffmpeg.org/documentation.html
- Repository mirror: https://github.com/FFmpeg/FFmpeg
- License: mainly LGPL with optional GPL components; verify build options for your install.
- Purpose: process audio, video, subtitles, streams, and media metadata.

### ImageMagick

- Source/credit: ImageMagick project
- Website: https://imagemagick.org/
- Repository: https://github.com/ImageMagick/ImageMagick
- Command docs: https://imagemagick.org/script/command-line-tools.php
- Purpose: convert, resize, crop, inspect, and transform images.

## Public-safe usage policy

Use media tools only on user-approved files or synthetic examples. Do not commit private media, thumbnails, transcripts, metadata dumps, generated outputs, or filenames that reveal private context.

## Safe smoke tests

```bash
ffmpeg -version
magick -version
```

For generated media tests, use synthetic input only.

## Secret boundary

Local FFmpeg and ImageMagick workflows usually need no credentials. If a media workflow uploads to cloud storage or calls a paid API, document placeholders only and store credentials in Secrets.
