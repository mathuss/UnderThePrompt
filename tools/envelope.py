"""Voice amplitude envelope for Mott's mouth: one value 0..1 per video frame.

Usage: python tools/envelope.py <voice.wav> <out.json> [--fps 30]

RMS over a 40 ms window, gated below the noise floor, smoothed (fast attack, slower release)
and normalized to the 95th percentile so loud syllables open the mouth fully.
"""
import argparse
import json

import numpy as np
import soundfile as sf


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("wav")
    ap.add_argument("out")
    ap.add_argument("--fps", type=int, default=30)
    a = ap.parse_args()

    audio, sr = sf.read(a.wav, dtype="float32")
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    hop = sr / a.fps
    win = int(sr * 0.04)
    n = int(len(audio) / hop) + 1
    rms = np.zeros(n, dtype=np.float32)
    for i in range(n):
        c = int(i * hop)
        seg = audio[max(0, c - win // 2): c + win // 2]
        rms[i] = float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0.0

    ref = np.percentile(rms[rms > 0], 95) if np.any(rms > 0) else 1.0
    env = np.clip((rms / ref - 0.08) / 0.92, 0, 1)
    out = np.zeros_like(env)
    for i in range(n):  # fast attack, slower release reads as natural speech
        prev = out[i - 1] if i else 0.0
        k = 0.7 if env[i] > prev else 0.35
        out[i] = prev + (env[i] - prev) * k

    with open(a.out, "w") as f:
        json.dump({"fps": a.fps, "env": [round(float(v), 3) for v in out]}, f)
    print(f"{a.out}: {n} frames, mean {out.mean():.2f}")


if __name__ == "__main__":
    main()
