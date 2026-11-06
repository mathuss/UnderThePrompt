"""SFX cues for UTP-000 v2 (Mott tells Leo), from the same sync words as src/episodes/Pilot000.tsx.

Usage: python production/UTP-000-moth/cues_v2.py <timeline.json> <cues.json>
"""
import json
import re
import sys
import unicodedata

tl = json.load(open(sys.argv[1], encoding="utf-8"))


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


tap = W(17, "light", 0, "end") + 0.6
cues = [
    {"t": 0.0, "kind": "hum", "gain": 0.7}, {"t": 0.08, "kind": "tink", "gain": 0.55},  # opening lamp
    {"t": W(3, "picture") - 0.05, "kind": "tick"}, {"t": S(16)["start"] - 0.05, "kind": "tick"},  # blink cuts
    {"t": W(6, "found"), "kind": "flutter", "gain": 0.6},
    {"t": W(17, "light", 0, "end") + 0.05, "kind": "flutter"},
    {"t": tap - 0.1, "kind": "hum"}, {"t": tap, "kind": "tink"},  # closing lamp tap
]
t = W(4, "click")  # the relay armature toggles every 1/2.6 s in scene 4 (same as the visual)
while t < S(4)["end"] - 0.05:
    cues.append({"t": t, "kind": "relay", "gain": 0.9})
    t += 1 / 2.6
for at in [W(1, "1947") - 0.1, W(3, "harvard"), W(6, "stuck") - 0.1, W(11, "edison") + 0.1, W(14, "famous") - 0.3, S(15)["start"] + 0.3]:
    cues.append({"t": at, "kind": "card", "gain": 0.7})
cues.append({"t": W(8, "taped"), "kind": "card", "gain": 0.5})  # tape press

json.dump(sorted(cues, key=lambda c: c["t"]), open(sys.argv[2], "w"), indent=0)
print(f"{len(cues)} cues, tap at {tap:.2f}s")
