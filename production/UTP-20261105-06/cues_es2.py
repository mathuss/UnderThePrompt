"""SFX cues for UTP-20261105-06 ES v2 ("Adivinó"), from the same sync words and spans as src/episodes/Ep2611050601es2.tsx.

Usage: python production/UTP-20261105-06/cues_es2.py <timeline.json> <cues.json>
Keep the timings here in step with the episode file (projection starts, typing spans, the chips, the lamp tap).
"""
import json
import random
import re
import sys
import unicodedata

tl = json.load(open(sys.argv[1], encoding="utf-8"))
rnd = random.Random(1105)


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return re.sub(r"[^a-z0-9_]", "", "".join(c for c in s if unicodedata.category(c) != "Mn"))


def W(scene, q, nth=0, edge="start"):
    hits = [w for w in tl["words"] if w["scene"] == scene and norm(w["text"]).startswith(norm(q))]
    if not hits:
        raise SystemExit(f'word "{q}" not found in scene {scene}')
    return hits[min(nth, len(hits) - 1)][edge]


def S(i):
    return next(s for s in tl["scenes"] if s["id"] == i)


def line_end(i):
    return [w for w in tl["words"] if w["scene"] == i][-1]["end"]


tap = S(17)["end"] - 0.3          # T.tap in the episode
cues = []  # no whoosh on the opening tilt: viewers heard it as a sigh (user note 2026-11-16)

# each projection: the lamp swells, then a soft click as the panel lands
for at in [W(2, "pido") - 0.1, S(3)["start"], S(4)["start"], W(7, "grill") - 0.2, S(9)["start"], S(10)["start"], S(12)["start"], S(13)["start"], S(14)["start"], S(15)["start"]]:
    cues += [{"t": at - 0.05, "kind": "hum", "gain": 0.35}, {"t": at + 0.25, "kind": "card", "gain": 0.45}]

# the yes / yes / no chips
cues += [{"t": W(14, "ok", 0), "kind": "tick", "gain": 0.8}, {"t": W(14, "ok", 1), "kind": "tick", "gain": 0.8}, {"t": W(14, "no"), "kind": "tick", "gain": 1.1}]

# typing: same spans as typingAt() in the episode
for a, b in [(W(2, "pido") - 0.1, S(2)["end"] - 0.4), (S(14)["start"] - 0.1, line_end(14) + 0.2), (line_end(17) + 0.4, tap - 0.6)]:
    # real typing comes in words: 3–7 keys ~0.1–0.18 s apart, then a space bar, then a short breath
    t = a
    while t < b:
        for _ in range(rnd.randint(3, 7)):
            if t >= b:
                break
            cues.append({"t": round(t, 3), "kind": "key", "gain": rnd.uniform(0.8, 1.0)})
            t += rnd.uniform(0.1, 0.18)
        if t < b:
            cues.append({"t": round(t, 3), "kind": "space", "gain": 0.9})
            t += rnd.uniform(0.2, 0.38)

# the ending: Mott flies up (flight starts 0.3 s after the last word), taps the lamp, the lamp goes out
cues += [{"t": line_end(17) + 0.3, "kind": "flutter", "gain": 0.8}, {"t": tap - 0.1, "kind": "hum", "gain": 0.8}, {"t": tap, "kind": "tink"}]

json.dump(sorted(cues, key=lambda c: c["t"]), open(sys.argv[2], "w"), indent=0)
print(f"{len(cues)} cues, tap at {tap:.2f}s")
