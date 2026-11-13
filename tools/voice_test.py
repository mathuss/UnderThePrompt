"""Listening test: the same P5 lines voiced by ElevenLabs and by Gemini TTS, in English and Spanish.

Usage:
  python tools/voice_test.py --list-voices          # ElevenLabs voices on the user's account (names, ids, accents)
  python tools/voice_test.py [--only eleven|gemini] [--lang en|es]

Keys come from a git-ignored .env at the repo root (see .env.example): ELEVENLABS_API_KEY, GEMINI_API_KEY.
Uses only the Python standard library (no new dependency). Writes WAV files (24 kHz mono, 16-bit) to
production/UTP-20261105-06/audio/voice-test/ (git-ignored), one per provider × model × language × scene,
with the silences of the script placed between lines, plus a notes.json with the settings used.

Cost: about 1,000 characters per provider per run. Within the free tiers of both services.
"""
import argparse
import base64
import io
import json
import os
import sys
import urllib.error
import urllib.request
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "production" / "UTP-20261105-06" / "audio" / "voice-test"
SR = 24000

# ── the test lines (script.md lines 4–9 and 25–28). pause = silence after the line, in seconds ──
SCENES = {
    "questions": [
        ("mott", "For who?", "¿Para quién?", "dry, flat, unhurried; a teacher who already knows the answer", 0.35),
        ("leo", "For… people. With habits.", "Para… gente. Con hábitos.", "caught off guard, improvising, a little defensive", 0.3),
        ("mott", "Where do the habits get saved?", "¿Dónde se guardan?", "dry, a touch faster than before", 0.25),
        ("leo", "In the… in the app.", "En la… en la app.", "stalling, losing confidence mid-sentence", 0.15),
        ("mott", "And if they miss a day?", "¿Y si un día no cumplen?", "quick, calm, the third question lands fastest", 0.9),
        ("leo", "…I don't know.", "…No sé.", "quiet, embarrassed admission, almost under his breath", 0.0),
    ],
    "ending": [
        ("leo", "Done. Your turn. Why the lamp?", "Listo. Te toca. ¿Por qué la lámpara?", "smug, playful, turning the tables", 2.0),
        ("leo", "Recommended answer: you don't know.", "Respuesta recomendada: no sabés.", "teasing, mock-formal, enjoying it", 0.9),
        ("mott", "…Yes.", "…Sí.", "small, defeated, deadpan", 0.0),
    ],
}
# ElevenLabs audio tags (square brackets) per line index, prepended when the model supports them.
ELEVEN_TAGS = {("questions", 1): "[hesitant]", ("questions", 3): "[hesitant]", ("questions", 5): "[sheepishly]",
               ("ending", 0): "[playful]", ("ending", 1): "[teasing]", ("ending", 2): "[sighs]"}

CONFIG = {
    "eleven": {
        "models": ["eleven_v4", "eleven_v4_turbo"],
        # voice ids: fill in after --list-voices. Mott: dry, small, mid-low; Leo: young male. ES ideally Argentine voices.
        "voices": {"en": {"mott": "", "leo": ""}, "es": {"mott": "", "leo": ""}},
        "settings": {"stability": 0.35, "similarity_boost": 0.75, "style": 0.3, "use_speaker_boost": True},
    },
    "gemini": {
        "model": "gemini-3.8-flash-tts",
        "voices": {"mott": "Sadaltager", "leo": "Puck"},  # prebuilt: "Knowledgeable" / "Upbeat"
        "lang_style": {"en": "", "es": "Spanish from Buenos Aires (rioplatense, with voseo and sheísmo). "},
    },
}
CFG_FILE = Path(__file__).with_name("voice_test.config.json")  # optional overrides, versioned (holds no secrets)


def load_env():
    env = {}
    p = ROOT / ".env"
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return {**env, **{k: os.environ[k] for k in ("ELEVENLABS_API_KEY", "GEMINI_API_KEY") if os.environ.get(k)}}


def http(method, url, headers, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={"Content-Type": "application/json", **headers})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise SystemExit(f"{method} {url.split('?')[0]} -> HTTP {e.code}: {e.read()[:600].decode(errors='replace')}")


def pcm_silence(sec):
    return b"\x00\x00" * int(SR * sec)


def wav_bytes_to_pcm(b):
    with wave.open(io.BytesIO(b)) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1 and w.getsampwidth() == 2, "unexpected WAV format"
        return w.readframes(w.getnframes())


def write_wav(path, pcm):
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm)


def text_of(line, lang):
    return line[1] if lang == "en" else line[2]


# ───────────── ElevenLabs: one request per line, joined with the script's pauses ─────────────
def eleven(key, cfg, lang, notes, scenes=None, tags=True, label=""):
    H = {"xi-api-key": key}
    voices = cfg["voices"][lang]
    if not all(voices.values()):
        raise SystemExit(f"ElevenLabs: set voice ids for '{lang}' in {CFG_FILE.name} (run --list-voices first)")
    for model in cfg["models"]:
        for scene, lines in SCENES.items():
            if scenes and scene not in scenes:
                continue
            pcm, prev = pcm_silence(0.15), ""
            for i, line in enumerate(lines):
                who, text = line[0], text_of(line, lang)
                tag = ELEVEN_TAGS.get((scene, i)) if tags else None
                say = f"{tag} {text}" if tag else text
                body = {"text": say, "model_id": model, "voice_settings": cfg["settings"]}
                if prev:
                    body["previous_text"] = prev
                r = http("POST", f"https://api.elevenlabs.io/v1/text-to-speech/{voices[who]}/with-timestamps?output_format=pcm_24000", H, body)
                pcm += base64.b64decode(r["audio_base64"]) + pcm_silence(line[4] or 0.25)
                prev = text
            name = f"eleven_{label + '_' if label else ''}{model}_{lang}_{scene}{'_tags' if tags else ''}.wav"
            write_wav(OUT / name, pcm)
            notes.append({"file": name, "provider": "ElevenLabs", "model": model, "lang": lang, "voices": voices, "settings": cfg["settings"], "tags": tags})
            print("wrote", name)


# ───────────── Gemini: one dialogue request per scene (2 speakers, a style per turn) ─────────────
def gemini(key, cfg, lang, notes):
    H = {"x-goog-api-key": key}
    for scene, lines in SCENES.items():
        # Gemini can't be told exact silences; long pauses become <long pause> tags inside the turn
        content = []
        for line in lines:
            text = text_of(line, lang) + (" <long pause>" if line[4] >= 0.9 else "")
            content.append({"type": "text", "text": text,
                            "annotations": [{"type": "speech_metadata", "speaker": line[0].capitalize(), "style": cfg["lang_style"][lang] + line[3]}]})
        body = {
            "model": cfg["model"],
            "input": [{"type": "user_input", "content": content}],
            "response_format": {"type": "audio"},
            "generation_config": {"speech_config": {"speakers": [{"speaker": "Mott", "voice": cfg["voices"]["mott"]}, {"speaker": "Leo", "voice": cfg["voices"]["leo"]}]}},
        }
        r = http("POST", "https://generativelanguage.googleapis.com/v1beta/interactions", H, body)
        audio = None
        for step in r.get("steps", []):
            if step.get("type") == "model_output":
                for c in step.get("content", []):
                    if c.get("type") == "audio":
                        audio = base64.b64decode(c["data"])
        if audio is None:
            raise SystemExit("Gemini: no audio in the response: " + json.dumps(r)[:600])
        name = f"gemini_{cfg['model']}_{lang}_{scene}.wav"
        write_wav(OUT / name, pcm_silence(0.15) + wav_bytes_to_pcm(audio))
        notes.append({"file": name, "provider": "Gemini", "model": cfg["model"], "lang": lang, "voices": cfg["voices"], "styles": [l[3] for l in lines]})
        print("wrote", name)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list-voices", action="store_true")
    ap.add_argument("--only", choices=["eleven", "gemini"])
    ap.add_argument("--lang", choices=["en", "es"])
    ap.add_argument("--scene", action="append", choices=list(SCENES), help="only these scenes")
    ap.add_argument("--model", action="append", help="ElevenLabs model ids (overrides config)")
    ap.add_argument("--mott"); ap.add_argument("--leo")  # ElevenLabs voice ids (override config)
    ap.add_argument("--no-tags", action="store_true"); ap.add_argument("--label", default="")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    env = load_env()
    cfg = json.loads(json.dumps(CONFIG))
    if CFG_FILE.exists():
        for k, v in json.loads(CFG_FILE.read_text(encoding="utf-8")).items():
            cfg[k].update(v)

    if a.list_voices:
        key = env.get("ELEVENLABS_API_KEY") or sys.exit("ELEVENLABS_API_KEY missing in .env")
        r = http("GET", "https://api.elevenlabs.io/v2/voices?page_size=100", {"xi-api-key": key})
        for v in r.get("voices", []):
            lab = v.get("labels") or {}
            print(f"{v['voice_id']}  {v['name']:<28} {lab.get('gender', ''):<7} {lab.get('age', ''):<12} {lab.get('accent', ''):<16} {lab.get('language', '')}")
        return

    notes = []
    langs = [a.lang] if a.lang else ["en", "es"]
    for lang in langs:
        if a.only in (None, "eleven"):
            k = env.get("ELEVENLABS_API_KEY")
            ec = json.loads(json.dumps(cfg["eleven"]))
            if a.model: ec["models"] = a.model
            if a.mott: ec["voices"][lang]["mott"] = a.mott
            if a.leo: ec["voices"][lang]["leo"] = a.leo
            eleven(k, ec, lang, notes, a.scene, not a.no_tags, a.label) if k else print("skip ElevenLabs: no ELEVENLABS_API_KEY")
        if a.only in (None, "gemini"):
            k = env.get("GEMINI_API_KEY")
            gemini(k, cfg["gemini"], lang, notes) if k else print("skip Gemini: no GEMINI_API_KEY")
    if notes:
        OUT.mkdir(parents=True, exist_ok=True)
        nf = OUT / "notes.json"
        old = json.loads(nf.read_text(encoding="utf-8")) if nf.exists() else []
        nf.write_text(json.dumps(old + notes, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
