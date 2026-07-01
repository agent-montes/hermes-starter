#!/usr/bin/env python3
"""Generate the J.A.R.V.I.S. macOS app icon.

Creates a round, Big Sur-style blue icon at build/icon.png. The asset is a real
PNG with transparency at the rounded corners so the Dock doesn't show the old
square/Electron-looking icon.
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "build" / "icon.png"
SIZE = 1024
RADIUS = 238


def rounded_mask(size: int, radius: int) -> Image.Image:
    scale = 4
    mask = Image.new("L", (size * scale, size * scale), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, size * scale - 1, size * scale - 1), radius=radius * scale, fill=255)
    return mask.resize((size, size), Image.Resampling.LANCZOS)


def lerp(a: int, b: int, t: float) -> int:
    return round(a + (b - a) * t)


def gradient_base() -> Image.Image:
    # Deep navy -> electric blue with a lighter top-left highlight.
    top = (80, 170, 255)
    mid = (42, 125, 255)
    bottom = (7, 16, 36)
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    px = img.load()
    if px is None:
        raise RuntimeError("failed to access icon pixel buffer")
    for y in range(SIZE):
        for x in range(SIZE):
            v = (x * 0.25 + y * 0.9) / (SIZE * 1.15)
            if v < 0.52:
                t = v / 0.52
                r, g, b = (lerp(top[i], mid[i], t) for i in range(3))
            else:
                t = (v - 0.52) / 0.48
                r, g, b = (lerp(mid[i], bottom[i], t) for i in range(3))
            px[x, y] = (r, g, b, 255)
    return img


def add_glow_layer(base: Image.Image) -> None:
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse((-160, -170, 720, 680), fill=(170, 220, 255, 82))
    d.ellipse((390, 260, 1230, 1140), fill=(0, 64, 200, 95))
    layer = layer.filter(ImageFilter.GaussianBlur(62))
    base.alpha_composite(layer)


def add_circuit_pattern(base: Image.Image, mask: Image.Image) -> None:
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # Diagonal blueprint/circuit rows, echoing the user's blue reference image.
    for offset in range(-780, 1280, 96):
        d.line([(offset, SIZE + 120), (offset + 760, -120)], fill=(185, 225, 255, 28), width=4)
    for offset in range(-560, 1280, 128):
        d.line([(offset, SIZE + 80), (offset + 620, -80)], fill=(0, 40, 120, 32), width=7)

    # Tiny circuit blocks along a subtle grid.
    for y in range(120, 910, 92):
        shift = (y // 92) % 4 * 28
        for x in range(70 + shift, 930, 112):
            if (x + y) % 5 == 0:
                continue
            d.rounded_rectangle((x, y, x + 42, y + 16), radius=5, outline=(210, 235, 255, 32), width=2)
            if (x + y) % 3 == 0:
                d.rectangle((x + 50, y + 6, x + 78, y + 10), fill=(210, 235, 255, 24))
    layer.putalpha(Image.composite(layer.getchannel("A"), Image.new("L", (SIZE, SIZE), 0), mask))
    base.alpha_composite(layer)


def add_reactor(base: Image.Image) -> None:
    cx = cy = SIZE // 2
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    # Outer glow.
    for i, alpha in enumerate([18, 28, 38, 54]):
        r = 312 - i * 18
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(95, 190, 255, alpha), width=10)
    layer = layer.filter(ImageFilter.GaussianBlur(1.5))

    # Clean rings on top.
    d = ImageDraw.Draw(layer)
    for r, width, alpha in [(286, 8, 210), (226, 5, 185), (156, 5, 165)]:
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(165, 225, 255, alpha), width=width)
    # Arc segments.
    for start in range(0, 360, 45):
        d.arc((cx - 258, cy - 258, cx + 258, cy + 258), start + 6, start + 30, fill=(240, 252, 255, 230), width=13)
    for start in range(18, 360, 60):
        d.arc((cx - 194, cy - 194, cx + 194, cy + 194), start, start + 28, fill=(65, 170, 255, 220), width=9)

    # Center core.
    d.ellipse((cx - 94, cy - 94, cx + 94, cy + 94), fill=(12, 76, 180, 190), outline=(230, 248, 255, 230), width=5)
    d.ellipse((cx - 56, cy - 56, cx + 56, cy + 56), fill=(240, 252, 255, 238))
    d.ellipse((cx - 36, cy - 36, cx + 36, cy + 36), fill=(90, 180, 255, 245))

    base.alpha_composite(layer)


def add_letter(base: Image.Image) -> None:
    # A small monogram helps the Dock icon read at small size without looking like Electron.
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 168)
    except Exception:
        font = ImageFont.load_default()
    text = "J"
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (SIZE - tw) / 2 - bbox[0]
    y = SIZE * 0.682 - th / 2 - bbox[1]
    d.text((x + 3, y + 4), text, font=font, fill=(0, 26, 80, 120))
    d.text((x, y), text, font=font, fill=(235, 250, 255, 230))
    base.alpha_composite(layer)


def add_depth(base: Image.Image, mask: Image.Image) -> Image.Image:
    # Edge shadow and top sheen inside the rounded icon.
    shade = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(shade)
    d.rounded_rectangle((18, 18, SIZE - 18, SIZE - 18), radius=RADIUS - 10, outline=(255, 255, 255, 92), width=9)
    d.rounded_rectangle((28, 30, SIZE - 28, SIZE - 26), radius=RADIUS - 16, outline=(0, 8, 32, 80), width=10)
    d.ellipse((120, 55, 820, 390), fill=(255, 255, 255, 42))
    shade.putalpha(Image.composite(shade.getchannel("A"), Image.new("L", (SIZE, SIZE), 0), mask))
    base.alpha_composite(shade)

    out = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    base.putalpha(mask)
    out.alpha_composite(base)
    return out


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    mask = rounded_mask(SIZE, RADIUS)
    img = gradient_base()
    add_glow_layer(img)
    add_circuit_pattern(img, mask)
    add_reactor(img)
    add_letter(img)
    img = add_depth(img, mask)
    img.save(OUT, format="PNG", optimize=True)
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
