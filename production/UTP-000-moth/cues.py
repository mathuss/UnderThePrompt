"""SFX cue list for UTP-000, from the same sync words the video uses (src/episodes/Episode000.tsx).

Usage: python production/UTP-000-moth/cues.py <timeline.json> <cues.json>
Keep in sync with Episode000.tsx: if a card's `at` changes there, change its cue here.
"""
import json
import re
import sys
import unicodedata

tl = json.load(open(sys.argv[1], encoding="utf-8"))


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9_]", "", s)


def W(scene, q, nth=0, edge="start"):
    hits = [w for w in tl["words"] if w["scene"] == scene and norm(w["text"]).startswith(norm(q))]
    if not hits:
        raise SystemExit(f'word "{q}" not found in scene {scene}')
    return hits[min(nth, len(hits) - 1)][edge]


def S(i):
    return next(s for s in tl["scenes"] if s["id"] == i)


tap = W(14, "light", 0, "end") + 0.55
cues = [
    # lamp: opening blink and the closing lamp tap (signature sting)
    {"t": 0.0, "kind": "hum", "gain": 0.8}, {"t": 0.08, "kind": "tink", "gain": 0.6},
    {"t": tap, "kind": "tink"}, {"t": tap - 0.1, "kind": "hum"},
    # blink cuts
    *({"t": S(i)["start"] - 0.05, "kind": "tick"} for i in (3, 10, 13)),
    # wing flutter when Mott takes off
    *({"t": S(i)["start"] + 0.15, "kind": "flutter"} for i in (3, 5, 11, 12)),
    {"t": W(14, "light", 0, "end") + 0.05, "kind": "flutter"},
    # myth card cracks
    {"t": W(10, "no") - 0.05, "kind": "crack"},
]
# relay clicks: the armature toggles every 1/2.6 s during shot 4 (same as the visual)
t = W(4, "click")
while t < S(4)["end"] - 0.05:
    cues.append({"t": t, "kind": "relay", "gain": 0.9})
    t += 1 / 2.6
for n in range(2):
    cues.append({"t": W(5, "relay", n), "kind": "relay", "gain": 0.45})
# a wooden click for each evidence card as it appears
for at in [W(1, "1947") - 0.1, W(3, "harvard"), W(4, "click"), W(5, "wrong"), W(5, "relay"), W(7, "first"), W(8, "edison") - 0.1,
           S(9)["start"], S(10)["start"] + 0.1, W(10, "she"), S(11)["start"] + 0.1, W(11, "wings") - 0.1, W(12, "smithsonian")]:
    cues.append({"t": at, "kind": "card", "gain": 0.8})

json.dump(sorted(cues, key=lambda c: c["t"]), open(sys.argv[2], "w"), indent=0)
print(f"{len(cues)} cues, tap at {tap:.2f}s")
