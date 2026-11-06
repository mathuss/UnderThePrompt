---
id: UTP-ES-001-rea
title: "Claude puede leer cualquier programa… sin el código fuente"
language: es
format: 1080x1920 @30fps
voice: Kokoro ef_dora/em_alex (local), test version
status: in_production
---

# Storyboard: one visual action per block

Rules applied (from the brand animation prompt):
- **Max 4 words of title text per scene** (subtitles aside). Format badges and diagram node labels count as part of the drawing, because the script explicitly asks for them.
- **One persistent object**: the `.exe` file card. It travels through the whole video and transforms: file → bytes → identified badge → map → function → renamed function → source file → tested code.
- **Sync**: every key action fires on the word in **bold**. Word times come from Whisper alignment of the generated voice.
- **Final frame**: every scene holds a clear still for ≥0.4 s before the transition.
- **Honesty**: these are schematic animations, not screenshots of REA or Claude Code. REA appears as a text wordmark, not an invented logo. Tool names are the real REA tool names.

| # | Time (script) | Visual action | On-screen words (≤4) | Sync word → action | Persistent element | Final frame |
|---|---|---|---|---|---|---|
| 1 | 0–3 s | A `.exe` card drops into a terminal prompt. A `src/` folder appears, then gets crossed out. | ¿Sin código fuente? | **programa** → exe lands · **código** → src/ crossed out | exe card born | exe in terminal, question mark |
| 2 | 3–10 s | The exe card zooms into a wall of hex (`4D 5A 90 00…`). The camera pulls back: the screen becomes a tiny square inside a huge byte grid. A counter ticks to millions. | Millones de bytes | **bytes** → zoom out + counter · **IA** → "?" over a person and over a Claude spark | the hex wall *is* the exe | tiny highlighted square in a massive grid |
| 3 | 10–18 s | The grid collapses into a wire. Claude ↔ **MCP** ↔ **REA** link draws. 207 tool dots fill in, then engine nodes plug in one by one. | REA · 207 herramientas | **REA** → wordmark · **200** → dot grid fills · **Ghidra / IDA / Hopper / JADX** → each node plugs in | the wire carries the exe | full diagram lit |
| 4 | 18–28 s | The exe passes through a scanner. Format badges flash. A router arrow sends the exe to the right engine. | 1 · Identificar · open_binary | **open_binary** → scan · **nativo** → Ghidra/IDA/Hopper lane · **Android** → JADX · **firmware** → Binwalk · **Electron** → JS lane | exe gets a "PE" badge | exe docked at its engine |
| 5 | 28–36 s | The exe unfolds into 3 columns: arch, imports, strings. Everything dims except **"License invalid"**. An xref arrow draws to a function box. | 2 · Mapear | **arquitectura / librerías / textos** → columns · **License** → focus · **referencias** → arrow | function box `FUN_00401a30` born | arrow → function box |
| 6 | 36–46 s | The function box flips: assembly lines morph line by line into C pseudocode. Then a call graph grows from it. | 3 · Descompilar | **assembly** → asm visible · **pseudocódigo** → morph · **grafo** → graph grows | same function box | code + graph |
| 7 | 46–54 s | `FUN_00401a30` retypes to `validate_license()`. Comments appear. Three evidence chips stack: ✅ observado · 🤔 inferido · ❓ desconocido, each with an `EV-` id. | 4 · Entender | **nombres** → rename · **Evidence** → chips · **vio / deduce / sabe** → each chip | renamed function | function + 3 chips |
| 8 | 54–60 s | The function node starts pulsing. A running-process box with a heartbeat line appears. Frida, GDB and browser probes plug in. | En ejecución | **corre** → heartbeat · **Frida / GDB / navegador** → probes | pulsing function | live process wired |
| 9 | 60–72 s | The function drops into a clean project tree (`src/license.c`, `main.c`, `Makefile`). A behavior checklist ticks green: `verify_reconstruction ✓`. | 5 · Reconstruir | **código fuente** → files appear · **verifica** → checks tick | function becomes `license.c` | project + green check |
| 10 | 72–80 s | Editor: a cursor edits one line. Build bar fills. Tests turn green. | 6 · Modificar | **modificar** → edit · **compilar** → build bar · **testear** → tests ✓ | license.c in the editor | green tests |
| 11 | 80–85 s | Recap chain: the original exe card → evidence chips → C file line up with arrows. Small disclaimer. CTA. | Binario → evidencia → código | **Binario / evidencia / código** → each node lights | all three return | chain + "Debajo del Prompt" |

## Voice notes (pronunciation respellings for TTS only; subtitles keep the real spelling)
English technical terms are respelled so the Spanish voice reads them correctly. See `tools/voice_es.json`.
