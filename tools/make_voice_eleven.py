"""Generate a dialogue voice track and a word-level timeline with ElevenLabs (replaces Kokoro for episodes that use it).

Usage: python tools/make_voice_eleven.py <voice_spec.json> <out_dir> [--only 3,7] [--seed N]

Spec (see production/UTP-20261105-06/voice_en_v2.json): provider, lang, model, voices_from (a config with
eleven.voices[lang][speaker] = voice id), lead_in (silence before line 1), settings (voice_settings), and lines with
id, speaker, optional audio tag, text, pause (silence after the line).

Each line is one request to /v1/text-to-speech/{voice}/with-timestamps (24 kHz PCM). Word times come from the
character alignment ElevenLabs returns, so captions follow the real speech; the tag is sent but never captioned.
Takes are cached per line in <out_dir>/lines/ (the text, tag, voice, model, seed and settings form the key), so
re-running only pays for lines that changed. --only regenerates the listed line ids even if cached.

Outputs (same format as tools/make_voice.py, so episodes can swap engines):
  <out_dir>/voice.wav, voice_<speaker>.wav (silence where others talk), timeline.json
Keys: ELEVENLABS_API_KEY in the git-ignored .env at the repo root.
"""
import argparse
import base64
import hashlib
import json
import re
import sys
import urllib.error
import urllib.request
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SR = 24000


def env_key():
    p = ROOT / ".env"
    for line in p.read_text(encoding="utf-8").splitlines() if p.exists() else []:
        if line.startswith("ELEVENLABS_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("ELEVENLABS_API_KEY missing in .env")


def tts(key, voice, body):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=pcm_24000"
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST", headers={"xi-api-key": key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise SystemExit(f"ElevenLabs HTTP {e.code}: {e.read()[:600].decode(errors='replace')}")


def words_from_alignment(sent, offset, text, al):
    """Word start/end (s, relative to the line) for each space-separated word of `text`, which sits at `offset` in `sent`."""
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    if "".join(chars) != sent:
        raise SystemExit(f"alignment text differs from the sent text:\n  sent: {sent!r}\n  got:  {''.join(chars)!r}")
    out, i = [], 0
    for w in text.split(" "):
        j = text.index(w, i)
        a, b = offset + j, offset + j + len(w) - 1
        # ignore leading/trailing punctuation for timing, keep it in the caption
        while a < b and not re.match(r"\w", sent[a]):
            a += 1
        while b > a and not re.match(r"\w", sent[b]):
            b -= 1
        out.append({"text": w, "start": st[a], "end": max(en[b], st[a] + 0.05)})
        i = j + len(w)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec"); ap.add_argument("out")
    ap.add_argument("--only", default="", help="comma-separated line ids to regenerate")
    ap.add_argument("--seed", type=int, default=7)
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    spec = json.loads(Path(a.spec).read_text(encoding="utf-8"))
    cfg = json.loads((ROOT / spec["voices_from"]).read_text(encoding="utf-8"))
    voices = cfg["eleven"]["voices"][spec["lang"]]
    key = env_key()
    out = Path(a.out); (out / "lines").mkdir(parents=True, exist_ok=True)
    only = {int(x) for x in a.only.split(",") if x.strip()}

    t = float(spec.get("lead_in", 0.15))
    speakers = sorted({l["speaker"] for l in spec["lines"]})
    full = bytearray(b"\x00\x00" * int(SR * t))
    tracks = {s: bytearray(full) for s in speakers}
    scenes, words, lines_out, chars = [], [], [], 0
    prev_text = ""
    for ln in spec["lines"]:
        tag = ln.get("tag", "")
        sent = f"{tag} {ln['text']}" if tag else ln["text"]
        offset = len(tag) + 1 if tag else 0
        body = {"text": sent, "model_id": spec["model"], "voice_settings": spec["settings"], "seed": a.seed}
        if prev_text:
            body["previous_text"] = prev_text
        h = hashlib.sha1(json.dumps([voices[ln["speaker"]], body], sort_keys=True).encode()).hexdigest()[:12]
        cache = out / "lines" / f"line{ln['id']:02d}_{h}.json"
        if cache.exists() and ln["id"] not in only:
            r = json.loads(cache.read_text(encoding="utf-8"))
        else:
            r = tts(key, voices[ln["speaker"]], body)
            cache.write_text(json.dumps(r), encoding="utf-8")
            chars += len(sent)
            print(f"  line {ln['id']:>2} ({ln['speaker']}): generated, {len(sent)} chars")
        pcm = base64.b64decode(r["audio_base64"])
        dur = len(pcm) / 2 / SR
        start = t
        for w in words_from_alignment(sent, offset, ln["text"], r["alignment"]):
            words.append({"text": w["text"], "start": round(start + w["start"], 3), "end": round(start + w["end"], 3), "scene": ln["id"], "line": 0, "speaker": ln["speaker"]})
        sil = b"\x00\x00" * int(SR * ln.get("pause", 0.4))
        full += pcm + sil
        for s in speakers:
            tracks[s] += (pcm if s == ln["speaker"] else b"\x00" * len(pcm)) + sil
        t = len(full) / 2 / SR
        scenes.append({"id": ln["id"], "start": round(start, 3), "end": round(t, 3)})
        lines_out.append({"scene": ln["id"], "speaker": ln["speaker"], "text": ln["text"], "tag": tag, "start": round(start, 3), "end": round(start + dur, 3)})
        prev_text = ln["text"]

    def wr(path, data):
        with wave.open(str(path), "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(bytes(data))
    wr(out / "voice.wav", full)
    for s in speakers:
        wr(out / f"voice_{s}.wav", tracks[s])
    tl = {"provider": "elevenlabs", "model": spec["model"], "voices": voices, "duration": round(t, 3), "scenes": scenes, "lines": lines_out, "words": words}
    (out / "timeline.json").write_text(json.dumps(tl, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"duration={t:.2f}s lines={len(lines_out)} words={len(words)} new_chars={chars}")


if __name__ == "__main__":
    main()
