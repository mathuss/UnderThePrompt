"""Generate a voice-over and a word-level timeline from a voice.json script.

Usage: python tools/make_voice.py <voice.json> <out_dir> [--voice NAME]

Each line is synthesized separately with Kokoro (local), so line boundaries are
exact. Inside a line, the end time of word k is measured by synthesizing the
prefix "w1 .. wk" and taking its length (fully offline, no ASR model needed).
Caption words are mapped onto those times by character position, so TTS-only
respellings don't break the alignment.
Outputs: <out_dir>/voice.wav, <out_dir>/timeline.json

Dialogue: add "speakers": {"mott": {"voice": "am_puck", "speed": 1.05}, ...} to the spec and
"speaker": "<name>" to a scene (or to a line object). Each speaker then also gets its own
time-aligned track <out_dir>/voice_<name>.wav (silence where others talk), used to drive mouths.
Lines and words in the timeline carry their "speaker".
"""
import argparse
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent
MODELS = ROOT / "models" / "kokoro"
SR = 24000
LINE_GAP = 0.18   # silence between lines of the same scene (s)
SCENE_GAP = 0.45  # silence between scenes (s)
LEAD_IN = 0.15


def respell(text: str, table: dict) -> str:
    return re.sub(r"[\w\-]+", lambda m: table.get(m.group(0), m.group(0)), text)


def letters(word: str) -> int:
    return max(len(re.sub(r"\W", "", word)), 1)


def speech_curve(tts, say, voice, speed, lang, total_dur):
    """(char_fraction, time) pairs: when each spoken word ends, by prefix synthesis."""
    sw = say.split()
    lens = [letters(w) for w in sw]
    total = sum(lens)
    fr, ts, acc, prev = [0.0], [0.0], 0, 0.0
    for k in range(1, len(sw) + 1):
        acc += lens[k - 1]
        if k == len(sw):
            end = total_dur
        else:
            pre, _ = tts.create(" ".join(sw[:k]), voice=voice, speed=speed, lang=lang)
            end = min(len(pre) / SR, total_dur)
        end = max(end, prev + 0.05)
        fr.append(acc / total)
        ts.append(end)
        prev = end
    return np.array(fr), np.array(ts)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("out")
    ap.add_argument("--voice")
    args = ap.parse_args()

    spec = json.loads(Path(args.spec).read_text(encoding="utf-8"))
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    voice = args.voice or spec["voice"]
    lang = {"es": "es", "en": "en-us"}[spec["lang"]]
    tts = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))

    speakers = spec.get("speakers") or {"narrator": {"voice": voice, "speed": spec["speed"]}}
    default_spk = next(iter(speakers))
    tracks = {k: [np.zeros(int(LEAD_IN * SR), dtype=np.float32)] for k in speakers}
    audio = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)]

    def push(chunk, who):
        audio.append(chunk)
        for k in tracks:
            tracks[k].append(chunk if k == who else np.zeros_like(chunk))
    t = LEAD_IN
    scenes, words, lines_out = [], [], []

    for si, scene in enumerate(spec["scenes"]):
        scene_start = t
        for li, line in enumerate(scene["lines"]):
            text = line["text"] if isinstance(line, dict) else line
            say = line.get("say", text) if isinstance(line, dict) else text
            say = respell(say, spec["respell"])
            who = (line.get("speaker") if isinstance(line, dict) else None) or scene.get("speaker") or default_spk
            v_name, v_speed = speakers[who]["voice"], speakers[who].get("speed", spec["speed"])
            samples, sr = tts.create(say, voice=v_name, speed=v_speed, lang=lang)
            assert sr == SR, sr
            samples = samples.astype(np.float32)
            dur = len(samples) / SR

            fr, ts = speech_curve(tts, say, v_name, v_speed, lang, dur)
            caption_words = text.split()
            clen = [letters(w) for w in caption_words]
            ctot, acc = sum(clen), 0
            for w, n in zip(caption_words, clen):
                ws = float(np.interp(acc / ctot, fr, ts))
                we = float(np.interp((acc + n) / ctot, fr, ts))
                words.append({"text": w, "start": round(t + ws, 3), "end": round(t + max(we, ws + 0.08), 3),
                              "scene": scene["id"], "line": len(lines_out), "speaker": who})
                acc += n
            lines_out.append({"scene": scene["id"], "speaker": who, "text": text, "start": round(t, 3), "end": round(t + dur, 3)})
            print(f"  scene {scene['id']} line {li}: {dur:.2f}s", flush=True)
            push(samples, who)
            t += dur
            if li < len(scene["lines"]) - 1:
                push(np.zeros(int(LINE_GAP * SR), dtype=np.float32), None)
                t += LINE_GAP
        gap = SCENE_GAP if si < len(spec["scenes"]) - 1 else 1.2
        push(np.zeros(int(gap * SR), dtype=np.float32), None)
        t += gap
        scenes.append({"id": scene["id"], "start": round(scene_start, 3), "end": round(t, 3)})

    full = np.concatenate(audio)
    gain = 0.89 / (float(np.max(np.abs(full))) or 1.0)
    sf.write(out / "voice.wav", full * gain, SR, subtype="PCM_16")
    if len(speakers) > 1:
        for k, chunks in tracks.items():
            sf.write(out / f"voice_{k}.wav", np.concatenate(chunks) * gain, SR, subtype="PCM_16")
    (out / "timeline.json").write_text(json.dumps(
        {"voice": voice, "duration": round(t, 3), "scenes": scenes, "lines": lines_out, "words": words},
        ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"voice={voice} duration={t:.2f}s scenes={len(scenes)} words={len(words)}")


if __name__ == "__main__":
    sys.exit(main())
