"""Procedural sound for Under the Prompt: an original music bed plus the brand's signature SFX.

Everything is synthesized here (numpy), so there is nothing to license (project rule 5).

Usage:
  python tools/sound.py music <seconds> <out.wav>
  python tools/sound.py sfx <cues.json> <seconds> <out.wav>
cues.json: [{"t": 1.23, "kind": "tink" | "hum" | "relay" | "flutter" | "card" | "crack" | "tick", "gain": 1.0}, ...]
"""
import json
import sys

import numpy as np
import soundfile as sf

SR = 48000
rng = np.random.default_rng(1947)


def env_ad(n, a, d):
    """Attack/decay envelope over n samples (a, d in seconds)."""
    t = np.arange(n) / SR
    return np.minimum(1.0, t / max(a, 1e-4)) * np.exp(-np.maximum(0.0, t - a) / max(d, 1e-4))


def lowpass(x, cutoff):
    """One-pole low-pass."""
    k = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - k) * v + k * acc
        y[i] = acc
    return y


def bandnoise(n, lo, hi):
    w = rng.standard_normal(n)
    return lowpass(w, hi) - lowpass(w, lo)


# ───────────── signature sounds ─────────────
def tink(gain=1.0):
    """Glass tink: inharmonic partials, the lamp being tapped."""
    n = int(SR * 1.4)
    t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * dcy) for f, a, dcy in [(2350, 1, 5.5), (3870, 0.55, 8), (6120, 0.3, 12), (1180, 0.25, 4)])
    return 0.35 * gain * s * env_ad(n, 0.002, 2.0)


def hum(gain=1.0):
    """Low lamp hum swelling in and out (≈1.2 s)."""
    n = int(SR * 1.3)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * 110 * t) + 0.5 * np.sin(2 * np.pi * 220 * t) + 0.2 * np.sin(2 * np.pi * 330 * t)
    shape = np.sin(np.pi * np.clip(t / 1.3, 0, 1)) ** 2
    return 0.12 * gain * s * shape


def relay(gain=1.0):
    """Relay click: a sharp metallic tick plus a small thump."""
    n = int(SR * 0.12)
    t = np.arange(n) / SR
    click = bandnoise(n, 1800, 7000) * env_ad(n, 0.0005, 0.008)
    thump = np.sin(2 * np.pi * 160 * t) * env_ad(n, 0.001, 0.025)
    return 0.5 * gain * (click + 0.6 * thump)


def flutter(gain=1.0):
    """Soft wing flutter: filtered noise pulsed at ~18 Hz for 0.45 s."""
    n = int(SR * 0.45)
    t = np.arange(n) / SR
    pulses = (0.5 + 0.5 * np.sin(2 * np.pi * 18 * t)) ** 3
    s = bandnoise(n, 300, 1800) * pulses * np.sin(np.pi * t / 0.45)
    return 0.28 * gain * s


def card(gain=1.0):
    """Wooden click when a card appears."""
    n = int(SR * 0.09)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * 1250 * t) * env_ad(n, 0.0005, 0.012) + 0.4 * bandnoise(n, 900, 4000) * env_ad(n, 0.0003, 0.004)
    return 0.32 * gain * s


def crack(gain=1.0):
    """Glass crack for the myth card: a burst of crackles."""
    n = int(SR * 0.5)
    s = np.zeros(n)
    for _ in range(14):
        at = int(rng.uniform(0, 0.35) * SR)
        m = int(SR * 0.03)
        s[at:at + m] += bandnoise(m, 2000, 9000)[: n - at] * env_ad(m, 0.0003, 0.006)[: n - at] * rng.uniform(0.4, 1)
    return 0.4 * gain * s


def tick(gain=1.0):
    """Soft low tick under the blink cut."""
    n = int(SR * 0.15)
    t = np.arange(n) / SR
    return 0.25 * gain * np.sin(2 * np.pi * 420 * t) * env_ad(n, 0.001, 0.03)


KINDS = {"tink": tink, "hum": hum, "relay": relay, "flutter": flutter, "card": card, "crack": crack, "tick": tick}


def render_sfx(cues, seconds):
    out = np.zeros(int(SR * seconds) + SR)
    for c in cues:
        s = KINDS[c["kind"]](c.get("gain", 1.0))
        i = int(c["t"] * SR)
        if i < 0 or i >= len(out):
            continue
        out[i:i + len(s)] += s[: len(out) - i]
    return out[: int(SR * seconds)]


# ───────────── music bed ─────────────
def music(seconds):
    """Original ambient bed: slow minor pad (A minor with a minor-sixth colour) and a soft 90 BPM pulse."""
    n = int(SR * seconds)
    t = np.arange(n) / SR
    chords = [[110.0, 130.81, 164.81, 196.0], [87.31, 130.81, 174.61, 220.0], [98.0, 146.83, 196.0, 246.94], [110.0, 130.81, 164.81, 174.61]]
    bar = 60 / 90 * 4  # one chord per bar
    pad = np.zeros(n)
    for i in range(int(seconds / bar) + 2):
        notes = chords[i % len(chords)]
        a, b = int(i * bar * SR), int((i + 1.25) * bar * SR)
        if a >= n:
            break
        seg = t[a:min(b, n)] - i * bar
        shape = np.sin(np.pi * np.clip(seg / (bar * 1.25), 0, 1)) ** 1.5
        tone = sum(np.sin(2 * np.pi * f * seg + 0.3 * np.sin(2 * np.pi * 0.2 * seg)) * (0.6 if j == 0 else 0.35) for j, f in enumerate(notes))
        tone += 0.15 * sum(np.sin(2 * np.pi * 2 * f * seg) for f in notes)
        pad[a:min(b, n)] += tone * shape
    pad = lowpass(pad, 1400)
    # soft pulse: a muted sine pluck on each beat, root of the chord, one octave up
    beat = 60 / 90
    pulse = np.zeros(n)
    m = int(SR * 0.35)
    tt = np.arange(m) / SR
    for i in range(int(seconds / beat)):
        root = chords[int(i * beat / bar) % len(chords)][0] * 2
        p = np.sin(2 * np.pi * root * tt) * env_ad(m, 0.004, 0.12) * (0.8 if i % 4 == 0 else 0.5)
        a = int(i * beat * SR)
        pulse[a:a + m] += p[: n - a]
    mix = 0.16 * pad / max(1e-6, np.abs(pad).max()) + 0.07 * pulse
    fade = np.minimum(1, t / 2.0) * np.minimum(1, (seconds - t) / 2.5)
    return mix * fade


def write(path, x):
    peak = np.abs(x).max()
    if peak > 0.98:
        x = x * 0.98 / peak
    sf.write(path, x.astype(np.float32), SR)


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "music":
        write(sys.argv[3], music(float(sys.argv[2])))
    elif mode == "sfx":
        write(sys.argv[4], render_sfx(json.load(open(sys.argv[2])), float(sys.argv[3])))
    else:
        sys.exit(__doc__)
    print("ok", sys.argv[-1])
