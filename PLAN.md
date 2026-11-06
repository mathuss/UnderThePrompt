# Under the Prompt: system architecture and implementation plan

Status: **proposal, nothing built yet.** Written 2026-11-05. Everything in this file is open to change until you approve it.

Legend used throughout:
- ✅ **Available now**: verified on this machine or in this Claude environment.
- 🔧 **Needs install or setup**: free or cheap, and I can do it with your OK.
- 🔑 **Needs you**: account creation, sign-in, verification, payment, terms, OAuth consent.
- ❓ **Uncertain**: sources conflict or I couldn't verify. Check before relying on it.

---

## 1. What I found in your environment

### Machine
| Item | Finding | Impact |
|---|---|---|
| OS | Windows 11 Home | Fine. |
| CPU / RAM | i5-1340P (12 cores), 15.6 GB | Fine for programmatic video rendering. Expect a few minutes per 90 s video. |
| GPU | Intel Iris Xe (integrated, no NVIDIA) | **Running AI video or voice models locally isn't practical.** Use cloud TTS. CPU speech-to-text (Whisper) is fine for 90 s clips. |
| Disk | ~255 GB free | Plenty. |
| Project folder | `C:\Users\Thiago\Desktop\Repos\UnderThePrompt`, empty, not a git repo | Start from scratch. I recommend `git init` for version history. |
| Python 3.14, Node 24, npm, uv, git, gh | ✅ installed | Enough to run the whole pipeline. |
| Claude Code CLI | ✅ 2.1.314 | Can run headless as a fallback scheduler. |
| ffmpeg / ffprobe | ❌ missing, but 🔧 one `winget install Gyan.FFmpeg` away | Needed for encoding, audio mixing and checks. |
| Playwright, faster-whisper | ❌ missing, 🔧 pip/npm install | Needed for screen captures and subtitle timing. |
| Chrome | ✅ installed | |

### Claude capabilities in this session
| Capability | Status | Used for |
|---|---|---|
| Local file read/write, shell (PowerShell + Bash) | ✅ | Queue files, scripts, rendering. |
| Web search + web fetch | ✅ | The Researcher's discovery and source verification. |
| **Scheduled tasks** (Claude desktop app) | ✅ connected, none set up yet | Daily Researcher run. See §3. |
| Built-in browser pane + Claude in Chrome | ✅ | Recording real product UIs, guiding you through account setup. |
| Subagents | ✅ | Parallel fact-checking during research. |
| Cloud routines (`/schedule`) | ✅ available | Not recommended at first: they can't see local files. |
| Connectors for social platforms | ❌ none connected. The registry has **Metricool** (scheduling/posting) and **Windsor.ai** (posting + analytics). | Optional publishing route, 🔑 paid accounts. |

**What I can't do, by rule:** create accounts, type passwords, complete identity or CAPTCHA checks, accept terms, grant OAuth permissions or spend money. I can open the right page and walk you through each of these, but you do the click or the typing.

---

## 2. Proposed architecture

```
         ┌───────────────────────── daily (scheduled task) ─────────────────────────┐
         │ AGENT 1: RESEARCHER  (.claude/skills/researcher)                         │
         │ discover → verify sources → score → dedupe → write EN+ES script          │
         │ output: research/scripts/UTP-YYYYMMDD-NN.md  (status: queued)            │
         └──────────────────────────────┬───────────────────────────────────────────┘
                                        │ Markdown queue (files you can read and edit)
         ┌──────────────────────────────▼───────────────────────────────────────────┐
         │ AGENT 2: PRODUCER  (.claude/skills/producer). Manual trigger at first.   │
         │ rank queue → re-verify claims → mark "selected" → archive original       │
         │ → storyboard (one visual action per block) → real UI captures           │
         │ → TTS EN + ES → word timings → Remotion render 1080×1920 → QA checks     │
         │ output: output/en/<ID>.mp4, output/es/<ID>.mp4, plus cover images       │
         └──────────────────────────────┬───────────────────────────────────────────┘
                                        │
         ┌──────────────────────────────▼───────────────────────────────────────────┐
         │ STAGE 3: PUBLISHER  (.claude/skills/publisher)                           │
         │ per-platform metadata → APPROVAL PACKAGE → wait for your "yes"           │
         │ → upload (manual at first, then API/scheduler) → publication_log.md      │
         └──────────────────────────────────────────────────────────────────────────┘
```

**Design principles**
1. **Agents are Claude Code skills in the repo** (`.claude/skills/*/SKILL.md`), plus a `CLAUDE.md` with brand rules. You can read and edit their instructions like any other file, and the same skill runs from a schedule or when you ask for it.
2. **The file system is the database.** Markdown with a small YAML header holds machine-readable status. No server, no external DB.
3. **Nothing is ever deleted.** State changes happen by moving files between folders and updating `status:`. Git records every change, so even an accidental overwrite can be undone.
4. **Each stage only reads the previous stage's output.** If one stage fails, the stages before it are unaffected.
5. **Approval gate before anything public.** Hard-coded in the Publisher skill, not just a convention.

### Queue design (refines your single-file idea)
A single big `scripts_queue.md` gets risky when agents cut sections out of it to "remove from queue". I propose **one file per script plus an index**:

- `research/scripts/UTP-20261105-01.md` holds one script with a header like this:
  ```yaml
  id: UTP-20261105-01
  topic: "Claude Code subagents running in parallel"
  slug: claude-code-parallel-subagents
  status: queued        # queued → selected → in_production → rendered → awaiting_approval → approved → published | failed | rejected
  created: 2026-11-05
  scores: {novelty: 4, interest: 5, hook: 4, visual: 5, accuracy: 5, clarity: 4, brand_fit: 5}
  sources: [ {url: ..., type: primary, checked: 2026-11-05} ]
  demo_requirements: "Claude Code installed; public repo; no login"
  ```
  The body holds the full EN script and the full ES script: hook, duration, timestamped scenes, visuals, voice-over, on-screen text, demos, sources and CTA.
- `research/queue.md` is a readable table of all active scripts (ID, topic, score, status, date). It's regenerated on every run, and it's where you check what's waiting.
- `research/topics_seen.md` is the dedup ledger: topic slug, main URLs, date, and outcome. The Researcher checks it before writing anything.
- **Removing from the queue** means moving the file to `research/archive/` with `status: selected`. A working copy goes to `production/<ID>/`. If production fails, the producer sets `status: failed` with a reason and moves the file back to `scripts/` so it can be retried.

### Folder structure (adapted to this repo)
```
UnderThePrompt/
├── CLAUDE.md                  # brand + safety rules every agent run follows
├── PLAN.md                    # this file
├── .claude/
│   ├── settings.json          # permission allowlist so scheduled runs don't stall
│   └── skills/{researcher,producer,publisher}/SKILL.md
├── brand/
│   ├── guidelines.md          # tone EN/ES, colors, fonts, CTA lines, do/don't
│   ├── logo/  fonts/
├── research/
│   ├── queue.md               # index (generated)
│   ├── topics_seen.md         # dedup ledger
│   ├── scripts/               # active queue, one .md per script
│   ├── archive/               # selected / used / rejected, never deleted
│   └── sources/               # per-ID notes and snapshots of key sources
├── production/
│   ├── remotion/              # the video template project (code)
│   └── <ID>/                  # storyboard.md, verification.md, captures/, audio/, subs/, render.log
├── output/
│   ├── en/   es/              # final MP4s + cover PNGs (git-ignored, too big for git)
├── publishing/
│   ├── metadata/<ID>.md       # per-platform titles, descriptions, hashtags, status
│   ├── approvals/<ID>.md      # the package you approve
│   └── publication_log.md
└── tools/                     # small scripts: tts, align, qa-check, upload
```

---

## 3. How daily scheduling will work

**Recommended: a Claude desktop scheduled task** (✅ available now).
- A daily cron task, for example `0 7 * * *` at 07:00 local time, with a self-contained prompt: *"In C:\…\UnderThePrompt, run the researcher skill."*
- **Limitation:** it runs **only while the Claude desktop app is open and the PC is awake.** If the app is closed at 07:00, the task runs the next time you open it. For a once-a-day research job, a late run doesn't matter.
- Unattended runs need permission to search the web and write inside the project. I'll add a narrow allowlist in `.claude/settings.json` rather than broad bypass permissions.
- Each run uses your Claude plan's usage allowance. A research run with verification is a moderately heavy session.

**Alternatives if this proves unreliable:**
- **Windows Task Scheduler + `claude -p` (headless CLI)** runs without the app open. It still needs the PC on.
- **Cloud routine** runs even when the PC is off, but works on a GitHub repo, not your local folder. Results would come back through `git push/pull`. Worth considering in Phase 5.

The **Producer** shouldn't run on a fixed schedule at first. Rendering and verification are where errors show up, so trigger it yourself ("produce the next video") until it has proven reliable.

---

## 4. How local file access will work
- All agents work inside `C:\Users\Thiago\Desktop\Repos\UnderThePrompt` with normal file tools. No upload to any cloud store is needed for research or production.
- Every Markdown file stays plain text you can edit in VS Code. If you change a script by hand, the Producer uses your version. If you set `status: rejected`, it's skipped forever.
- Large binaries (`output/`, `production/*/captures`, audio) are git-ignored. Scripts, metadata and logs are versioned.
- **One exception:** Instagram's simplest API route needs the video at a **public URL**. See §6. That would be a temporary upload of the finished MP4 only, and only in Phase 4.

---

## 5. Video generation and editing options

### Recommended stack
| Layer | Choice | Why | Status |
|---|---|---|---|
| Composition and animation | **[Remotion](https://www.remotion.dev/)** (React → MP4) | Code-driven, so Claude can write each scene. Exact 1080×1920 output, precise word-synced animation, reusable branded components, identical structure for EN and ES. Free for individuals and companies of up to 3 people ([license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)). | 🔧 npm install |
| Voice-over | **ElevenLabs** (best natural EN + ES; returns character timestamps) **or** Azure / Google neural TTS (cheaper, robotic-ish) | Quality voice is a hard requirement in your brief, and local models aren't feasible on this GPU. | 🔑 account + API key, paid. ❓ Prices vary by source ([example](https://dev.to/techsifted/elevenlabs-pricing-2026-plans-credits-and-api-costs-explained-1549)), so check the official page. Rough guess: a few US$/month at 2 videos/day. |
| Subtitle timing | TTS timestamps, cross-checked with **faster-whisper** on CPU | Word-accurate captions and "sync each key action with its word". | 🔧 pip install |
| Real product UI footage | **Playwright** headless recording for web UIs, the built-in browser for screenshots, terminal recording for CLI tools | Your brief forbids fabricated interfaces. | 🔧 install |
| Encoding and QA | **ffmpeg / ffprobe** | Checks resolution, duration, codec, and loudness (target about −14 LUFS). | 🔧 winget |
| Music | **None in v1**, or CC0 tracks with the license saved per video | Avoids copyright problems. Each platform's in-app sounds can be added at upload time if you want them. | n/a |

### How your animation prompt becomes a process
Your instruction, *"Primero, proponé una acción visual por bloque y después construí la animación…"*, becomes a mandatory two-step in the Producer:
1. **`storyboard.md` first.** For each script block it lists: the visual action, max 4 on-screen words, the literal drawing of any analogy, the scale object for magnitudes, the focus target, which elements carry over to the next scene, the sync word, and the final frame. I can show you this for review before rendering.
2. **Build the animation from the storyboard.** A checker script verifies the 4-word limit, that every scene has a sync word, and that the scene ends on a held final frame.

### What is hard or limited
- **Demos that need logins or paid tools.** If a topic needs a signed-in product (e.g. a paid AI app), I can't sign in for you. Either you sign in in the browser pane and I record, or the Researcher deprioritizes topics that can't be demonstrated without credentials. I'll add a `demo_requirements` field so this is known at research time.
- **Desktop-only apps.** Recording them needs computer-use or you running a screen recorder. Web and CLI tools are the easy path.
- **Generative AI video** (Veo, Sora, Runway, etc.) conflicts with "never fabricate interfaces". At most, use it for clearly abstract B-roll, labeled as AI-generated. I recommend skipping it in v1.
- **Rendering time.** CPU-only, so expect a few minutes per 90 s video per language. ❓ I'll measure this in Phase 2.

---

## 6. Publishing integrations: what is possible per platform

| | **YouTube Shorts** | **Instagram Reels** | **TikTok** |
|---|---|---|---|
| Official API | YouTube Data API v3 `videos.insert` | Instagram Graph API (container → `media_publish`) | Content Posting API: **Upload** (to drafts) or **Direct Post** |
| Account requirements | Google account + channel (one Google account can own several channels as Brand Accounts) | **Professional** account (Business or Creator). ❓ Sources disagree on whether Creator works; Business is safe. Facebook Page link needed for the local-file upload route. | TikTok account + **TikTok developer app** with scope approval |
| Your-side setup 🔑 | Google Cloud project, OAuth consent screen, sign in once | Meta developer app, link the account, grant permissions once | Developer app registration, app review for `video.upload` (needs a website, privacy policy and demo), sign in once |
| Can it post publicly by API? | **Yes, per current docs**: *"Videos uploaded from unverified API projects are not restricted to private viewing mode"* ([videos.insert](https://developers.google.com/youtube/v3/docs/videos/insert)). ❓ Older guides say the opposite, so I'll test with an unlisted upload first. | **Yes** for your own accounts. Apps in development mode work for users who have a role on the app. ❓ Confirm during setup. | **Not without an audit.** Unaudited Direct Post is forced to **private** ([docs](https://developers.tiktok.com/docs/en/content-posting-api-get-started)). The **Upload** route sends the video to your TikTok inbox as a draft, and you tap *Post* in the app ([docs](https://developers.tiktok.com/docs/en/content-posting-api-get-started-upload-content)). |
| Quotas | 100 upload calls/day in the uploads bucket, per current docs | 100 API posts per 24 h per account ([docs](https://developers.facebook.com/docs/instagram-platform/content-publishing)) | Not stated for Upload. ❓ |
| Scheduling | `publishAt` with private status, so YouTube publishes it at that time | No native schedule via API. Publish when approved or via a scheduler. | Draft route: you post manually from the app |
| Gotchas | ❓ OAuth apps left in "Testing" mode issue refresh tokens that expire after about 7 days, so you'd need to re-sign in weekly unless the app is moved to production. To verify in Phase 4. | The Instagram-Login route needs the video at a **public URL** at publish time. The Facebook-Login route allows a direct resumable upload. | Audit is described by third parties as slow and often rejected ([example](https://www.postpeer.dev/blog/best-tiktok-posting-api)). |

**Practical recommendation**
1. **Phase 4a, manual publishing with full prep.** For each video I prepare a ready-to-paste package: per-platform title, description, caption, hashtags and cover. You upload from your phone or the web. This needs zero integrations and fits approval mode.
2. **Phase 4b, YouTube API first.** It's the easiest and best-documented. Upload as private or scheduled, then it goes public only after your approval.
3. **Phase 4c, Instagram API** via the Facebook-Login route, so no public hosting is needed.
4. **TikTok:** use the **draft/inbox Upload** route. You give the final tap, which is also a natural approval step. Or use a scheduler that has already passed TikTok's audit, such as **Metricool**, which has a Claude connector in the registry (🔑 paid plan, your authorization). Applying for the Direct Post audit only makes sense later, if at all.

**Policy notes to respect (❓ to recheck at setup time):** platforms require labeling of *realistic* AI-generated imagery. AI-voiced narration over real screen recordings is generally a different case, but I'll check each platform's current rule when we set up the accounts. Platforms may also deprioritize "unoriginal, mass-produced" content, which is one more reason to keep a human approval step and real demos.

---

## 7. What needs your participation

| When | What you do | What I do |
|---|---|---|
| Phase 0 | Approve this plan. Choose a TTS provider and create its account + API key. Decide on brand basics (logo, colors) or let me draft them. | Install ffmpeg/Remotion/Playwright, `git init`, scaffold folders, write `CLAUDE.md` and brand draft |
| Phase 1 | Review the first 2–3 research runs. Approve the schedule time. | Build the Researcher, run it manually, tune it, then create the daily task |
| Phase 2 | Review storyboard + first EN/ES videos. Approve the voice choice. | Build the Remotion template, TTS/alignment, captures, QA |
| Phase 3 | **Create the 6 accounts** (TikTok, YouTube, Instagram × EN/ES): sign-up, phone/email verification, terms, 2FA. Check that the handles are available. | Research handle availability, write bios, make avatars and banners, open each sign-up page and walk you through it |
| Phase 4 | Approve each video before it's published. For APIs: create the Google Cloud / Meta / TikTok developer apps and click through the OAuth consents. | Prepare metadata, write the upload scripts, keep `publication_log.md` |
| Phase 5 | Decide which stages may run without approval | Propose metrics-based criteria |

---

## 8. Phased implementation plan

**Phase 0: Foundation (½ day)**
- Install ffmpeg, Node/Python deps. `git init` with a `.gitignore` for media.
- Create the folder structure, `CLAUDE.md` (brand + safety rules) and `brand/guidelines.md` draft (EN/ES tone, CTA lines, typography, colors).
- **Done when** the folder skeleton exists and `ffmpeg -version` works.

**Phase 1: AI Researcher (1–2 days of iteration)**
- Skill with: a source list (official changelogs and blogs of Anthropic/OpenAI/Google, GitHub trending, the MCP registry, Hacker News, Product Hunt, arXiv when relevant), the verification checklist, a scoring rubric, a dedup check against `topics_seen.md`, and the EN + ES script template with your 6-part structure. Spanish is written natively, not translated.
- Output: 1–3 scripts per run, plus a run log with rejected candidates and the reasons.
- Run it manually 2–3 times and review with you. Then create the **daily scheduled task**.
- **Done when** 3 consecutive runs produce scripts you'd actually film, with working primary sources and no duplicates.

**Phase 2: AI Video Producer (3–5 days)**
- Remotion template: 1080×1920, safe zones for platform UI overlays, branded intro/outro, word-level captions, scene components (UI capture frame, scale comparison, focus/zoom, analogy drawing, persistent elements across scenes).
- Pipeline: select → re-verify → archive → storyboard → captures → TTS → alignment → render → QA (resolution, duration 60–90 s, loudness, caption sync, 4-word check) → cover image.
- Failure handling: `status: failed` with the reason, and the script goes back to the queue.
- **Done when** one topic is rendered in EN and ES, you approve the quality, and a forced failure correctly restores the queue.

**Phase 3: Channel setup (mostly your time, ~1–2 h with my guidance)**
- Create the 6 accounts, profile assets and bios. Professional/Business mode on Instagram. Channel settings on YouTube.

**Phase 4: Publishing (incremental)**
- 4a manual packages → 4b YouTube API → 4c Instagram API → 4d TikTok via draft upload or Metricool.
- Approval package per video: final MP4s, script, per-platform metadata, target platforms, proposed schedule. Nothing goes out without your explicit "approve UTP-…".

**Phase 5: Gradual autonomy (after ~2–4 weeks of stable runs)**
- Candidates: Producer on a schedule, auto-queueing approved videos for scheduled publish. Optional analytics feedback into the Researcher's scoring.

---

## 9. Open questions and uncertainties
1. **TTS provider and budget**: ElevenLabs (best quality) vs Azure/Google (cheaper). Any monthly budget cap?
2. **Six accounts vs. fewer:** your brief wants separate EN and ES accounts on each platform. That's the clean choice for the algorithms. ❓ YouTube also supports multi-language audio tracks on one video; I haven't verified whether that works for Shorts.
3. **Video length:** platforms are fine with 60–90 s, but very short Shorts often perform better. Consider allowing 45–90 s.
4. **Posting frequency:** research is daily, but how many videos per week do you want to publish?
5. ❓ Items to verify during setup: YouTube's public-upload behavior for unverified projects, Google OAuth testing-mode token expiry, whether Instagram Creator accounts can publish via API, TikTok Upload-route limits, and each platform's AI-disclosure rules.

## Sources consulted
- YouTube `videos.insert` reference: https://developers.google.com/youtube/v3/docs/videos/insert
- TikTok Content Posting API, Direct Post: https://developers.tiktok.com/docs/en/content-posting-api-get-started
- TikTok Content Posting API, Upload: https://developers.tiktok.com/docs/en/content-posting-api-get-started-upload-content
- TikTok Direct Post reference: https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post
- Instagram content publishing: https://developers.facebook.com/docs/instagram-platform/content-publishing
- Remotion license: https://github.com/remotion-dev/remotion/blob/main/LICENSE.md
- Third-party (secondary, for context only): https://www.postpeer.dev/blog/best-tiktok-posting-api, https://postproxy.dev/blog/instagram-reels-api-publishing-guide/, https://dev.to/techsifted/elevenlabs-pricing-2026-plans-credits-and-api-costs-explained-1549
