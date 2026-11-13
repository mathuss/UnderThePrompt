# Expressive TTS options (researched 2026-11-06)

**Why:** Kokoro (local, free) can't act. It has no emotion control, so Mott and Leo sound flat even with tuned pacing. We need a TTS that can be **directed** (excited, skeptical, whispering, laughing), has **good Spanish** (rioplatense if possible), keeps **the same voice across videos**, and ideally returns **word or character timestamps** for caption sync.

**Every option below needs the user to create an account and an API key.** Rule 2: I can't create accounts, accept terms or pay.

## Decision so far (2026-11-12, ElevenLabs listening test)
The user tested ElevenLabs first (`tools/voice_test.py`, settings in `tools/voice_test.config.json`) and chose by ear:

| | Mott | Leo |
|---|---|---|
| **English** | River (premade: calm, neutral) | Liam (premade: young, energetic) |
| **Spanish** | Carlos Pro (library, Argentine: documentary and radio) | Tomás (library, young, Rioplatense) |

- **Model:** Eleven v4 with audio tags in square brackets (`[hesitant]`, `[sighs]`). It beat v4 Turbo, and the tagged takes beat the untagged ones.
- **Rejected:** Callum for Mott (too raspy for him). Pairs E (Juan + Chelo) and F (Juanma + Ignacio) for Spanish.
- **Risk:** the two Spanish voices belong to other users in the shared library. Their owners can withdraw them with 180 days' notice (Tomás) or 730 days (Carlos Pro). If they become the channel's permanent voices, a professional voice clone of our own would remove that risk.
- **Still open:** the Gemini test, and wiring ElevenLabs into `tools/make_voice.py` (a rule 7 change: it needs the user's OK).

## Update 2026-11-12: which platform sounds most real
The user asked for a more real voice after hearing the first P5 draft (Kokoro). This section replaces the recommendation further down. The 2026-11-06 comparison below is kept for its details.

**What "real" was measured with:** the Artificial Analysis Speech Arena, a blind test where listeners pick the better of two clips. Read on 2026-11-12. Its limits: it tests English, it measures which clip people prefer, and it says nothing about acting on direction or about Argentine Spanish.

| Rank | Model | Provider | Elo | Price per 1M characters |
|---|---|---|---|---|
| 1 | Eleven v4 | ElevenLabs | 1338 | $80.00 |
| 2 | Eleven v4 Turbo | ElevenLabs | 1337 | $40.00 |
| 3 | Qwen-Audio-3.1-TTS-Plus | Alibaba | 1297 | $19.31 |
| 4 | Sonic 3.6 | Cartesia | 1296 | $49.00 |
| 5 | Simba 3.5 | Speechify | 1293 | $6.58 |
| 6 | Gemini 3.8 Flash TTS | Google | 1283 | $16.49 |
| 7 | Fish Audio Drama 3 | Fish Audio | 1274 | $15.00 |
| 9 | Realtime TTS-2 | Inworld | 1266 | $20.83 |

**What matters for us beyond that ranking:**

| | ElevenLabs (Eleven v4 / v4 Turbo) | Gemini 3.8 Flash TTS | Inworld Realtime TTS-2 |
|---|---|---|---|
| Blind-test rank | 1 and 2 | 6 | 9 |
| How we direct the acting | v4 is described as their most emotive model, with no audio tags. **Audio tags work only on v4 Turbo** (and v3 Conversational) | A style per turn in plain words, plus inline tags (`<laugh>`, `<sigh>`, `<short pause>`) | Emotion, pace and style steered in plain words |
| Two voices in one request | Yes (Text to Dialogue) | Yes, 2 speakers, **prebuilt voices only**. Custom voices are generated turn by turn and joined | Not confirmed |
| Argentine Spanish | ElevenLabs has an Argentine-accent page and public Argentine voices in its library (third-party catalogues list six). Spanish itself is one language code on v4 | Spanish is one language. The docs say to pick a regional voice from the Extended Voice Library (it has an accent filter) or to design one. **No es-AR voice confirmed** | **Has named Rioplatense voices** (for example "Lautaro" and "Florencia" on its voice pages) |
| Timestamps for captions | Yes, character level | Not mentioned | Not confirmed |
| Free testing | 10K credits a month, no commercial licence | Free tier | Not confirmed |
| Not confirmed | Whether the Argentine library voices work well on v4 | — | Price on its own site, timestamps, licence terms |

**Cost is not the deciding factor.** One video is about 900 characters per language. With three takes per line, two videos a day and two languages, that is about 324,000 characters a month: about $26 on Eleven v4, about $13 on v4 Turbo, about $7 on Inworld, about $5 on Gemini.

### Recommendation
Run a listening test with three candidates on the same lines, in English and in Spanish, and let the user pick by ear:
1. **ElevenLabs, Eleven v4 Turbo** (and plain v4 for comparison). It is the top of the blind test, it has audio tags for the acting, timestamps for the captions, and Argentine voices to try.
2. **Gemini 3.8 Flash TTS.** Free to test, direction per line in plain words, and the cheapest. The open question is the Argentine accent.
3. **Inworld Realtime TTS-2.** Lower in the ranking, but the only one with voices described as Rioplatense. Worth one test for the Spanish version alone.

**Test lines (from UTP-20261105-06):** lines 4–9 (the three faster questions and "I don't know"), and lines 25–28 (the silence and the ending). They need speed, hesitation, deadpan and one long pause, which is what Kokoro can't do.

**What I can and can't judge:** I can check timing, loudness and that the words are right. I can't hear the audio, so whether a voice sounds real, and whether the accent is right, is the user's call.

**What I need from the user:** an API key for each service they want in the test (they create the accounts; the free tiers are enough for the test), saved in a git-ignored `.env`. Adding a new voice service to the pipeline is a rule 7 change: this section is the proposal, and nothing is wired in until the user says yes.

**Sources (read 2026-11-12):** [Speech Arena leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard) · [ElevenLabs models](https://elevenlabs.io/docs/overview/models) · [ElevenLabs Argentine accent page](https://elevenlabs.io/languages/argentine-accent) · [Gemini speech generation](https://aistudio.google.com/docs/speech-generation) · [Inworld TTS docs](https://docs.inworld.ai/docs/tts/tts) · [Inworld voice "Lautaro"](https://inworld.ai/voices/lautaro) · secondary: [Famulor catalogue of ElevenLabs Argentine voices](https://www.famulor.io/voices/elevenlabs/languages/es/accents/argentine)

## Comparison (2026-11-06)

| | **ElevenLabs** (Eleven v3 / v4) | **Google Gemini TTS** (3.8 Flash TTS) | **Cartesia** (Sonic 3.x) | OpenAI `gpt-4o-mini-tts` | Hume Octave |
|---|---|---|---|---|---|
| How you direct emotion | Eleven v3 is described as their "emotionally rich, expressive" model. Audio tags are documented for v4 Turbo and v3 Conversational | A natural-language **style per turn** ("cheerful and friendly", "whispered urgently") plus inline tags (`<laugh>`, `<sigh>`, `<short pause>`) | Emotion, speed and volume controls, plus laughter cues (Sonic 3) | An `instructions` prompt (tone, emotion, pace, accent) | Emotional by design |
| Two-voice dialogue | Yes (Text to Dialogue API) | **Yes, natively: up to 2 speakers per request** | Per request | Per request | — |
| Spanish | Yes (v3: 70+ languages; v4: 90+). Only Spain and Mexico are listed as variants (Multilingual v2), no rioplatense | Yes (130+ languages, auto-detected) | Yes (42 languages, per its changelog) | Yes, but its voices are "optimized for English" | Yes (Octave 2) |
| Timestamps for captions | **Yes:** character-level `alignment` (the `/with-timestamps` endpoint) | Not mentioned. We'd align separately | Word-level timestamps documented (AWS listing) | Not mentioned | — |
| Custom or consistent voices | Voice design, instant and professional cloning (Creator plan and up) | Voice design, replication and remixing (3.8 models) | Instant cloning | 13 fixed voices | — |
| Price | API: **$0.08 per 1K characters** (v3, v4, Multilingual v2); $0.04 for v4 Turbo / Flash. Plans: Starter $6/mo (30K credits, commercial use), Creator $22 (121K), Pro $99 (600K). Free: 10K credits, **no commercial licence** | **About $0.0135 per minute of audio** (3.8 Flash TTS, 2026 pricing; doubles on 2027-01-01). **Has a free tier** (free-tier content is used to improve Google's products) | ~$5/mo plan for commercial use. Third-party figures conflict | ~$0.015/min (estimate) | — |
| Status | Active | Active | Active | **Deprecated: shuts down 2027-01-06** (official) | ❓ A search snippet reported the TTS API ending on 2026-11-13; **not confirmed** on Hume's docs |

**Rough cost per video:** a 60 s two-voice script is about 900 characters, or about 1 minute of audio per language. With ~3 takes per line while directing:
- **ElevenLabs:** ~$0.20–0.25 per language per video via the API.
- **Gemini:** ~$0.04 per language per video, or $0 on the free tier.
- At 2 videos a day × 2 languages:
  - **ElevenLabs:** ~$25–30/month on the API, or the Pro plan.
  - **Gemini:** ~$5/month.

## Recommendation (2026-11-06, replaced by the update above)
**Test the two strongest on the same two scenes before choosing.** Use the "found her… a moth" reveal and Leo's "No way!".
1. **Gemini 3.8 Flash TTS first.**
   - It's the cheapest, with a free tier to test at no cost.
   - Its **dialogue mode with a style per turn** fits Mott telling Leo exactly.
   - It has strong Spanish.
   - Its weakness is no timestamps. We'd align by running speech-to-text on the result, or keep our current prefix method only if it stays cheap.
2. **ElevenLabs Eleven v3/v4 second.**
   - It's the reference for expressive voices.
   - It returns **character timestamps**, so caption sync is simple.
   - Voice design or cloning keeps Mott's and Leo's voices identical across videos.
   - It's about 5× more expensive, and the free plan can't be used for published videos.
3. **Skip** OpenAI `gpt-4o-mini-tts` (officially shuts down 2027-01-06). Leave Hume Octave aside too: its future is unclear (an unconfirmed report of an API sunset) and its pricing sources conflict.

**Also worth considering:** for the most natural Spanish (rioplatense), recording the voices yourself or with a voice actor beats any TTS. Our pipeline already accepts a recorded WAV plus a script.

## What I need from the user to test
- **Gemini:** a Google AI Studio API key. A free-tier key is enough for testing.
- **ElevenLabs:** an account (free is enough to test, but a paid plan is needed for published videos) and an API key.
- Keys go in a local `.env` file, which must be git-ignored and is never committed.

## Sources
- ElevenLabs pricing: https://elevenlabs.io/pricing · API pricing: https://elevenlabs.io/pricing/api
- ElevenLabs models: https://elevenlabs.io/docs/overview/models · TTS: https://elevenlabs.io/docs/capabilities/text-to-speech · timestamps endpoint: https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- Gemini speech generation: https://aistudio.google.com/docs/speech-generation · pricing: https://aistudio.google.com/docs/pricing
- OpenAI TTS guide (models, deprecation, disclosure policy): https://developers.openai.com/api/docs/guides/text-to-speech
- Hume: the sunset claim came from a search result summary; its FAQ page (https://dev.hume.ai/docs/text-to-speech-tts/faq) did not confirm it on 2026-11-06
- Cartesia (secondary sources only; verify before use): https://aws.amazon.com/marketplace/pp/prodview-h5rfrnvkbnlki, https://invideo.io/blog/cartesia-sonic-ai-voice/
