#!/usr/bin/env python3
"""stdin PCM -> openWakeWord JSON events.

Reads signed 16-bit 16 kHz mono PCM frames from stdin and emits JSON lines on
stdout. Electron captures microphone audio in the renderer and streams 16 kHz PCM
frames to this helper. No API keys or cloud calls are used at runtime after
models are downloaded.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import warnings

warnings.filterwarnings("ignore", message="urllib3 v2 only supports OpenSSL")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")


def emit(payload: dict) -> None:
    print(json.dumps(payload, separators=(",", ":")), flush=True)


def read_exact(stream, size: int) -> bytes:
    chunks = []
    remaining = size
    while remaining > 0:
        chunk = stream.read(remaining)
        if not chunk:
            return b"".join(chunks)
        chunks.append(chunk)
        remaining -= len(chunk)
    return b"".join(chunks)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run local openWakeWord on raw PCM stdin.")
    parser.add_argument("--model", default="hey_jarvis", help="Pretrained openWakeWord model name")
    parser.add_argument("--threshold", type=float, default=0.35, help="Detection threshold 0..1")
    parser.add_argument("--vad-threshold", type=float, default=0.0, help="Optional VAD threshold 0..1")
    parser.add_argument("--frame-size", type=int, default=1280, help="Samples per frame; 1280 = 80 ms at 16 kHz")
    parser.add_argument("--download", action="store_true", help="Download model resources and exit")
    args = parser.parse_args()

    try:
        import numpy as np
        from openwakeword.model import Model
        if args.download:
            from openwakeword import utils
            utils.download_models([args.model])
            emit({"type": "downloaded", "engine": "openwakeword", "model": args.model})
            return 0

        model = Model(
            wakeword_models=[args.model],
            inference_framework="onnx",
            vad_threshold=args.vad_threshold,
        )
        emit({
            "type": "ready",
            "engine": "openwakeword",
            "model": args.model,
            "threshold": args.threshold,
            "vadThreshold": args.vad_threshold,
            "frameSize": args.frame_size,
        })

        frame_bytes = args.frame_size * 2
        while True:
            data = read_exact(sys.stdin.buffer, frame_bytes)
            if len(data) < frame_bytes:
                return 0
            frame = np.frombuffer(data, dtype=np.int16).copy()
            predictions = model.predict(frame)
            score = float(predictions.get(args.model, 0.0))
            if score >= args.threshold:
                emit({
                    "type": "wakeword",
                    "engine": "openwakeword",
                    "keyword": args.model.replace("_", " "),
                    "score": round(score, 6),
                    "timestamp": time.time(),
                })
    except Exception as exc:  # keep this sanitized; no env dumps
        emit({"type": "error", "engine": "openwakeword", "error": str(exc)})
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
