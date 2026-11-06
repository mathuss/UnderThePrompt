# Under the Prompt / Debajo del Prompt

Bilingual tech-news short-video channel covering all of tech, AI included (TikTok, YouTube Shorts, Instagram Reels; 1080×1920, 60–90 s). The architecture and phases are in `PLAN.md`. Brand voice, CTAs and typography are in `brand/guidelines.md`.

| Language | Brand name | Script language |
|---|---|---|
| EN | **Under the Prompt** | English |
| ES | **Debajo del Prompt** | Spanish, written natively (rioplatense "vos" is fine), never a literal translation |

Never mix the two names: EN videos, metadata and CTAs say "Under the Prompt"; ES ones say "Debajo del Prompt".

## Pipeline (one skill per stage)
1. **Researcher** `.claude/skills/researcher/` → `research/scripts/UTP-YYYYMMDD-NN.md` + `research/queue.md`.
2. **Producer** (Remotion + local Kokoro TTS) → `production/<ID>/`, `output/{en,es}/`.
3. **Publisher** → `publishing/metadata/`, `publishing/approvals/`, `publishing/publication_log.md`.

The Researcher runs daily around 07:00 local time (cron `0 7 * * *`; the app adds a small dispatch delay, currently ~07:11) as the Claude desktop scheduled task `utp-daily-researcher`, approved by the user and created on 2026-11-05. It runs only while the app is open; a missed run fires on the next launch. The Producer and Publisher are triggered manually.

Each stage reads only the previous stage's output. State lives in the YAML `status:` field and in which folder a file sits.

## Hard rules (apply to every agent run, scheduled or manual)
1. **Approval mode.** Nothing becomes public (upload, post, schedule, publish) without the user's explicit "approve UTP-…" in chat.
2. **No accounts, money or authorizations.** Never create accounts, publish, spend money, buy plans, accept terms or grant OAuth/third-party access without the user's permission. Guide the user; they do the click.
3. **Never permanently delete** a script or its sources. To remove something from the queue, move it to `research/archive/` and update `status:`. Same for production and publishing files.
4. **Never fabricate** product interfaces, screenshots, demos, quotes, numbers or release dates. Show real captures, or a clearly schematic animation labeled as such. Every claim needs a source.
5. **No copyrighted music** without documented authorization. Default: no music, or CC0 with the license saved next to the video.
6. **Never bypass** verification, CAPTCHAs, security controls, paywalls or platform policies.
7. **Propose before significant changes.** Architecture changes, new services or new dependencies need a written proposal and the user's OK first.

## Conventions
- Dates are absolute (`2026-11-05`), never "yesterday".
- Large media (`output/`, `production/*/audio/`, `production/*/captures/`, `*.mp4`, `*.wav`, `*.mp3`) is git-ignored. Scripts, metadata and logs are versioned.
- Commits are the user's call. Message format: `feat(scope): Short description`, no AI attribution trailers.

## Local tools
- **ffmpeg / ffprobe** are installed but **not on PATH**. Call them by full path:
  `$LOCALAPPDATA/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe` (same folder for `ffprobe.exe`).
- Python venv in `.venv/`; Remotion project in `production/remotion/`; TTS helpers in `tools/`.
