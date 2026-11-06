# Production pipeline: topic → finished 3D video

Status: **approved 2026-11-05.** `three` 0.187, `@react-three/fiber` 9.8, `@remotion/three` 4.0.540 and `@types/three` are installed (the user approved the install). `@react-three/postprocessing` is not installed.

## 1. What this machine actually has (inspected 2026-11-05)

| Need | Available now | Notes |
|---|---|---|
| Video composition and rendering | ✅ **Remotion 4.0.540** (React → MP4), already rendering our videos | Free for individuals and teams of up to 3 people |
| 3D in the browser / Remotion | ⚠️ Possible, but **not installed**. `three`, `@react-three/fiber` and `@remotion/three` are not in `node_modules`. | Headless Chrome renders WebGL. The GPU is an **Intel Iris Xe** (integrated, no NVIDIA), usable through ANGLE (`--gl=angle`). **3D render speed is unmeasured.** |
| Blender | ❌ Not installed | Could be installed with winget (free). Eevee runs on Iris Xe, but slowly. |
| AI image / video generation | ❌ None available: no model and no API key in this environment | It also clashes with "never fabricate" and with character consistency. **Not used.** |
| Voice | ✅ **Kokoro** (local, CPU): EN `am_puck` chosen. ES voice undecided. | `@remotion/elevenlabs` is present in `node_modules` (pulled in by Remotion) but has no account or key, and is **not used** without the user's OK and budget. |
| Word timing | ✅ `tools/make_voice.py` (prefix synthesis, offline) | Whisper can't download its model on this network, so pronunciation has to be checked by ear. |
| Encoding, mixing, loudness | ✅ ffmpeg 9.0.2 (full path, see `CLAUDE.md`) | |
| Music and SFX | ✅ Python + numpy in `.venv` | Procedurally generated sounds are our own, so no licence is needed |
| Research and fact-checking | ✅ Web search and fetch, plus the `researcher` skill | Some sites have bot checks, which we don't bypass |

**Honest limits:**
- No 3D frame has been rendered yet. The concept page shows **real-time three.js prototypes** running in the browser, not final renders.
- The quality ceiling on this machine is "stylized low-poly with bloom and depth of field", the same family as ref 1. Film-grade lighting would need Blender or a GPU.

## 2. Tool choice

| Job | Choice | Why |
|---|---|---|
| Character creation and consistency | **Mott as one procedural three.js component** (`<Mott expression pose look talk wings />`), built from code primitives | The code is the model sheet, so it can't drift between videos. There's no modelling file to keep in sync, and expressions are named presets. |
| 3D animation | **`@remotion/three` + `@react-three/fiber`**: every frame is a pure function of time, keyed to word timings | The same frame-accurate system we already use. Animation anchors to sync words, exactly like the current videos. |
| Environments | A **modular kit** of low-poly sets (The Lamp, Machine Room, Server Aisle, Data Field, Archive) plus a fixed light rig | Same materials and light rules everywhere |
| AI video generation | **None** | Unavailable here, inconsistent between shots, and against our no-fabrication rule |
| Voice | Kokoro `am_puck` (EN), with the amplitude envelope driving Mott's mouth | Local and free. The ES voice is pending a decision. |
| Sound design | `tools/sfx.py` and `tools/music.py`, procedural (numpy), mixed and ducked in ffmpeg | Original, consistent, licence-free |
| Composition, captions, cards | Remotion (2D layers over the 3D canvas) | Already built: captions, word sync, cards |
| Final encode | ffmpeg: loudnorm −14 LUFS, H.264, AAC 48 kHz | Same as now |
| Blender | **Not now.** An optional later upgrade for hero shots, exported to glTF | Adds a second toolchain. Only worth it if three.js quality isn't enough. |

## 3. Needs approval before installing (rule 7)

| Package | Licence | Purpose |
|---|---|---|
| `three` | MIT | 3D engine |
| `@react-three/fiber` | MIT | React renderer for three.js |
| `@remotion/three` | Remotion licence (same as now) | Frame-synced three.js inside Remotion |
| *(optional)* `@react-three/postprocessing` + `postprocessing` | MIT | Bloom and depth of field, the cinematic look |

**First milestone: done 2026-11-05.**
- The `Mott-Test` composition (`src/MottTest.tsx`) renders a turnaround plus all 9 expressions on the Lamp set (`src/brand/lampDesk.ts`).
- It took **55 s for 502 frames at 1080×1920 with soft shadows (~0.11 s/frame)**, with `--gl=angle` on the Iris Xe. A 60 s 3D video should take ~3–4 min before post effects.
- Bloom/DoF are not measured yet; they need `@react-three/postprocessing`, and the user's OK before installing it.
- Render command: `npx remotion render <bundle> Mott-Test out.mp4 --gl=angle`.
- Colour management: use `<ThreeCanvas flat>` and **not** `linear`. `linear` skips the sRGB conversion and turns the violet orange.

## 4. The reusable workflow (what happens when you give a topic)

Each step writes a file the next step reads. A ✋ marks where your approval is needed.

1. **Research and fact-check:** the `researcher` skill writes `research/scripts/<ID>.md` with sources, a fact list and a "can't say" list.
2. **Story development:** pick the angle and the "lamp or fire" beat, and map it to the HOOK/CONTEXT/DEVELOPMENT/PAYOFF/ENDING structure (`brand/identity.md` §5).
3. **Scriptwriting:** EN and ES written natively in Mott's voice (`brand/mott.md` §5–7), 45–75 s, with the sign-off. ✋ Optional script review.
4. **Scene breakdown:** `production/<ID>/storyboard.md` (human-readable) plus **`shots.json`**, the machine version: one entry per shot, using only presets, so new videos reuse the system instead of reinventing it.
   ```json
   { "shot": 7, "sync": "taped", "set": "logbook", "camera": {"preset": "topdown-descend", "size": "wide"},
     "mott": {"pose": "stand", "expression": "curious", "at": [0.2, 0, 0.1], "look": "page"},
     "cards": [{"type": "photo", "src": "captures/nhhc-NH96566.jpg", "credit": "US Navy / NHHC", "border": "ice"}],
     "text": "First actual case", "transition": "cut" }
   ```
5. **Visual instructions:** every set, camera move, card type and transition is a named preset in `production/remotion/src/brand/`. A new kind of visual becomes a new preset that all future videos can use.
6. **Character animation:** the `mott` fields in `shots.json` resolve to pose and expression presets, blended over 0.25–0.4 s and anchored to sync words. Blinks are seeded and the mouth follows the audio envelope. Mott can't move outside the preset vocabulary without a spec change.
7. **Narration and audio:**
   - `voice.json` goes through `tools/make_voice.py` to produce `voice.wav` and `timeline.json` (word times);
   - `tools/envelope.py` produces mouth data;
   - `tools/music.py` produces a bed of the right length;
   - SFX cues come from `shots.json`;
   - ffmpeg mixes and ducks the result.
8. **Subtitles:** karaoke pill chunks are built from `timeline.json` (≤ 4 words), as the current template does, restyled.
9. **Edit and render:**
   - `npx remotion render … --props='{"episode":"<ID>","lang":"en"}' --gl=angle`;
   - loudnorm;
   - **QA**: a contact sheet of every shot, the 4-word check, sync-word coverage, duration 45–75 s, −14 LUFS, safe zones;
   - output to `output/{en,es}/<ID>.mp4`.
10. **Approval package:** ✋ the video, script, sources, titles and descriptions, platforms and schedule. Nothing gets published without your explicit "approve UTP-…".

## 5. Reusable assets to build (one time)
| Asset | Path (planned) |
|---|---|
| `Mott.tsx` (geometry, colours, expressions, poses, gestures) | `production/remotion/src/brand/` |
| `Cursor.tsx` (the lamp, blink transition) | same |
| Sets: `LampDesk.tsx`, `MachineRoom.tsx`, `ServerAisle.tsx`, `DataField.tsx`, `Archive.tsx` | `src/brand/sets/` |
| `LightRig.tsx` (amber key + violet fill + lilac rim + haze + dust motes) | `src/brand/` |
| Camera presets: push-in, orbit, crane, top-down descend, flutter-cam, rack focus | `src/brand/camera.ts` |
| 2D layer: `ProgressBar`, `LogStamp`, `CaptionPill`, `Card` (amber/ice/coral, source tab), `EndCard` | `src/brand/ui/` |
| `shots.json` interpreter (`Episode.tsx`) | `src/` |
| Audio tools: `envelope.py`, `music.py`, `sfx.py`, `mix.sh` | `tools/` |
| QA script: `qa.py` (contact sheet, checks) | `tools/` |

## 6. Effort estimate (honest)
- **Build the system:** Mott, 2 sets, the light rig, UI and the interpreter. Several working sessions. The first real Mott render is the gate.
- **Per video after that:** the research, script, storyboard and shots in one session; render time to be measured. The current 2D videos take ~8 min per 98 s; 3D will be slower.
- **The pilot** (UTP-000) is also the system's test case: if a shot needs something the presets can't do, we add a preset, not a one-off.
