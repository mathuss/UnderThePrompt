# Channels plan: accounts, identity, descriptions and publishing

**Status:** plan, 2026-11-12. Nothing has been created, published or paid for. Every account, sign-in, verification and terms click is the user's (project rule 2). Nothing becomes public without "approve UTP-…" in chat (rule 1).

## Decision (2026-11-15): Spanish first, as Debajo del Prompt
The user chose to launch in Spanish only for now. Name: **Debajo del Prompt**, handle `@debajodelprompt` (free on YouTube on 2026-11-15). "Detrás del Prompt" was considered and is taken: a YouTube channel of that name makes documentaries about the history of AI. The English channel is on hold until a free name is chosen (§0). So the account work below is **three accounts** (YouTube, TikTok, Instagram in Spanish), not six.

## 0. Why English is on hold: the name is already in use
On 2026-11-12 a YouTube channel called **UnderThePrompt** (`@UnderThePrompt`) is live. It covers the same niche, daily AI news Shorts, and has 267 videos and 36 subscribers (read from its public About page). So:
- the handle `@undertheprompt` is taken on YouTube;
- a second channel with the same name and topic would be easy to confuse with it, and either side could report the other for impersonation.

I found no other "Under the Prompt" on the web (closest: Underprompt, an AI job board, and "The Prompt" podcast). **"Debajo del Prompt" shows no use**, and `@debajodelprompt` returned "not found" on YouTube. I could not check TikTok or Instagram handles reliably from here (both answer the same way for any name); the sign-up form is the real test.

| Option | What it means | Trade-off |
|---|---|---|
| **A. Keep "Under the Prompt", distinct handle** (e.g. `@under.the.prompt`, free on YouTube on 2026-11-12) | Videos, end cards and wordmark stay as they are | Real confusion risk with a same-niche channel that posts daily |
| **B. Rename the English channel, keep "Debajo del Prompt"** | Pick a name that is free on all three platforms | Changes the EN end card and wordmark (two strings in code) |
| **C. One name for both languages** | Use "Debajo del Prompt" style naming only for ES, and the new EN name ties to Mott (e.g. "Mott's Night Log") | The two channels look less like one brand |

**My recommendation: B.** The mark (Mott's eyespot) and the look don't depend on the name, so a rename is cheap now and expensive later. Candidates to check on all three platforms before choosing: *Mott's Night Log*, *Night Log*, *After the Prompt*, *Lamp or Fire*. I have not checked these yet.

## 1. The six accounts
Separate EN and ES accounts on each platform (cleaner for each algorithm and audience).

| Platform | How | Account type | Notes |
|---|---|---|---|
| **YouTube** ×2 | One Google account (yours) → YouTube → "Create a channel" twice, each as a **Brand Account** channel | Brand Account channels | Lets you add managers later and keeps the channels off your personal profile. Decide this at creation: a personal channel is hard to convert later. |
| **TikTok** ×2 | Two TikTok accounts (different emails or phone) | Business account (free) | Business unlocks the analytics and the website link sooner; it limits the music library, which we don't use (rule 5). |
| **Instagram** ×2 | Two Instagram accounts in the same Meta Accounts Center | Professional → Creator or Business | Professional is needed for insights and, later, for API publishing (Business is the safe choice for the API). |

For each: a dedicated email per brand (e.g. two aliases of one inbox), 2-factor authentication, and the recovery codes saved in your password manager. I can open each sign-up page in the browser pane and walk you through it; you type and click.

## 2. Identity assets (drafts in `brand/logo/drafts/`)
| Asset | Proposal | Size |
|---|---|---|
| **Avatar (all six accounts)** | **A. The eyespot**: Mott's amber wing ring with the "_" cursor, on Night Ink. Reads at 98 px, works for any name. Recommended. | 800×800 (circle-safe) |
| | B. Mott himself, wings open (3D render). More personality; small at 98 px. Good for a later "character" account or the banner. | 800×800 |
| | C. `>_` terminal prompt. Shown for comparison: generic, many dev brands use it. Not recommended. | 800×800 |
| **Wordmark** | Eyespot + name in JetBrains Mono, Cream, with the amber `_` cursor. EN and ES drafts. | 2400×600 |
| **YouTube banner** | Night city skyline (the same city as the videos), eyespot + name + tagline inside the 1546×423 safe area | 2560×1440 |
| **TikTok / Instagram** | Avatar only (no banners on those platforms) | — |

Sizes: YouTube recommends a 2560×1440 banner (it shows a centred safe area on all devices) and an 800×800 avatar that renders as small as 98×98. TikTok and Instagram show the avatar in a small circle, which is why a simple mark beats a detailed picture.

The drafts are rendered from code (`production/remotion/src/BrandAssets.tsx`), so a name change is one string.

## 3. Descriptions (drafts; the names follow option A until the user decides)
Limits used: YouTube channel description ~1,000 characters; TikTok bio 80 (sources disagree, 80 is the safe value); Instagram bio 150; TikTok display name 30.

### YouTube, EN
> Under the Prompt: what's really under the hood of the tech you use.
>
> Short, sourced explainers on AI, software, security, chips and the internet, told by Mott (a night-shift moth) and Leo (an intern who installs first and reads later).
>
> Every claim has a source in the description. Every screen is a real capture or a labelled schematic. The voices are AI-generated; the people and tools we cover are real, and we always credit who made them.
>
> New Shorts every week. En español: @debajodelprompt

### YouTube, ES
> Debajo del Prompt: lo que de verdad hay debajo de la tecnología que usás.
>
> Explicaciones cortas y con fuentes sobre IA, software, seguridad, chips e internet, contadas por Mott (una polilla del turno noche) y Leo (un pasante que instala primero y lee después).
>
> Cada dato tiene su fuente en la descripción. Cada pantalla es una captura real o un esquema marcado como tal. Las voces son generadas con IA; las personas y herramientas de las que hablamos son reales, y siempre damos crédito a quien las hizo.
>
> Shorts nuevos todas las semanas. In English: @under.the.prompt

### TikTok bio (≤ 80)
- EN: `What's really under the hood of tech. Sourced, in 60 seconds.` (61)
- ES: `Lo que de verdad hay debajo de la tecnología. Con fuentes, en 60 s.` (67)

### Instagram bio (≤ 150, four lines)
EN is 149 characters, ES 144.
- EN: `What's really under the hood of tech_` / `Sourced explainers in 60 s with Mott & Leo.` / `AI voices · real captures · creators credited` / `ES → @debajodelprompt`
- ES: `Lo que de verdad hay debajo de la tecnología_` / `Con fuentes, en 60 s, con Mott y Leo.` / `Voces IA · capturas reales · créditos` / `EN → @under.the.prompt`

## 4. AI disclosure (check each platform's own help page at setup)
Read on 2026-11-12, from secondary summaries; the official pages win if they differ.
- **YouTube:** the "altered or synthetic content" setting is for realistic content; fully animated content is listed as exempt. Our videos are animated, so the toggle is likely not required, but we disclose the AI voices in the channel and video descriptions anyway.
- **TikTok:** asks creators to label AI-generated content with realistic images, **audio** or video. Our voices are realistic synthetic audio → **turn on the AI-generated content label** on every post.
- **Instagram / Meta:** asks for self-disclosure of photorealistic video or **realistic-sounding audio** ("AI info") → **turn it on** for every Reel.
Rule of thumb for the Publisher: always disclose the AI voices; never use a real person's voice or likeness.

## 5. Publishing flow
**Phase 4a (now): manual, with a ready-to-paste package.** For each approved video the Publisher writes `publishing/metadata/UTP-….md` with, per platform and language: title, caption or description (sources and credits included), hashtags, the AI-disclosure setting to tick, the cover frame, and the suggested time. You upload from the phone or the web. No integrations, nothing to authorize.

**Phase 4b (later, each one a separate proposal):**
1. **YouTube Data API** (`videos.insert`, with `publishAt` for scheduling): needs a Google Cloud project and your OAuth consent once.
2. **Instagram Graph API**: needs a Business account, a Meta developer app, and your consent.
3. **TikTok Content Posting API, "Upload" route**: sends the video to your TikTok drafts, and you tap Post. Direct posting needs an app audit.

**Cadence to start:** 3 videos a week per language (Mon / Wed / Fri), the same day in both languages. Raise it once the pipeline is smooth.

## 6. Order of work
1. **You:** choose the name option (§0). **Me:** check the chosen handles on the three platforms' public pages and rerender the identity assets.
2. **You:** pick the avatar (§2). **Me:** final exports (PNG plus SVG with text as paths) and both banners.
3. **You:** create the six accounts with my guidance; **me:** the walkthrough, profile texts and assets ready to upload.
4. **Me:** the Spanish version of P5 and the first approval package; **you:** "approve UTP-20261105-06" (or changes).
5. Then the first public posts, by hand.

## Sources
- Existing channel: https://www.youtube.com/@UnderThePrompt/about (read 2026-11-12)
- YouTube banner and profile picture: https://support.google.com/youtube/answer/12950272
- Secondary (sizes, limits, AI labels; to re-verify at setup): https://www.freelogoservices.com/blog/youtube-channel-art-size-guide/ · https://www.vozo.ai/blogs/youtube/add-second-youtube-channel · https://setmysocial.com/guides/tiktok/ · https://www.handlegrab.com/blog/social-media-username-rules-limits · https://quickcountertools.com/tiktok-username-rules-2026/ · https://www.postora.org/blog/ai-generated-content-labels-social-media-2026 · https://join.genhq.io/post/do-you-have-to-label-ai-video-youtube-tiktok-meta · https://storrito.com/resources/tiktoks-2026-ai-labeling-rules-and-what-they-signal-for-platform-governance/
- Publishing APIs: `PLAN.md` §6 (with official links)
