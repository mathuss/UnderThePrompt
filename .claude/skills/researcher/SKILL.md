---
name: researcher
description: Daily tech-news research for Under the Prompt / Debajo del Prompt (all of tech, AI included). Finds fresh tools, releases and discoveries, verifies them against primary sources, scores and dedupes them, and writes 1–3 bilingual (EN + ES) 60–90 s short-video scripts into research/scripts/, then regenerates research/queue.md. Use when asked to "run the researcher", "research today's topics", or by the daily scheduled task.
---

# Researcher (Agent 1)

Goal: each run adds **1–3 filmable, verified scripts** to the queue, or zero if nothing clears the bar. Zero is a valid outcome; a weak script is not.

Read `CLAUDE.md` (hard rules) and `brand/guidelines.md` (tone, CTAs, structure) before writing. Today's date comes from the environment; write all dates absolute.

## Files you touch
| File | Action |
|---|---|
| `research/topics_seen.md` | Read first (dedup). Append one row per candidate you **wrote or rejected for a lasting reason**. |
| `research/scripts/UTP-YYYYMMDD-NN.md` | Create, one per script. Never overwrite an existing ID: take the next `NN`. |
| `research/sources/UTP-YYYYMMDD-NN.md` | Verification notes per script: each claim → source URL → what the source says, checked date. |
| `research/runs/YYYY-MM-DD.md` | Run log: sources scanned, candidates, scores, rejected ones with reason. If a log for today exists, append a new `## Run HH:MM` section. |
| `research/queue.md` | Regenerate from the YAML headers of every file in `research/scripts/`. |

Never delete anything. Never touch `production/`, `output/`, `publishing/` or `tools/`.

## Step 1: discover (aim for 8–15 candidates)
Scope: **all of technology**, not only AI. That covers software and dev tools, AI, hardware and chips, phones and gadgets, operating systems, browsers and the web, security (disclosed vulnerabilities, incidents with official write-ups), open source, space and science tech, and networking/infra. AI is one beat among several.

**What we're looking for:** things a curious, non-specialist viewer would share or try. Best fits:
- **Apps, utilities and skills** they can install or try today (a new app, a useful open-source tool, an agent skill or plugin, a hidden feature in something they already use).
- **Vulnerabilities that touch everyday tech** (phones, browsers, WhatsApp/Telegram, routers, Windows/macOS, popular apps) with a concrete action ("update X", "turn off Y"). Server-only or niche-platform bugs pass only if they're massive (widely deployed software, mass exploitation, mainstream coverage).
- **Surprising "how it works" stories** behind something people use.
Weak fits: benchmark scores, model-size races, enterprise APIs, incremental changelogs, funding news.

### Two lanes
- **News lane** (default): released or disclosed in the last 7 days (14 max for slow-moving tools).
- **Evergreen lane:** a tool, app, skill or trick that's not new but is popular right now (trending, high buzz) and unknown to most viewers. **At most 1 evergreen script per run**, and only if it scores higher than the best news candidate left out. Set `lane: evergreen` in the header.

Look at items from the **last 7 days** (14 days max for slow-moving tools). Sources, in rough priority order:
1. Official blogs, changelogs and release notes:
   - AI: Anthropic (news, Claude Code changelog, docs release notes), OpenAI, Google DeepMind / Gemini, Meta AI, Mistral, Hugging Face.
   - Platforms and software: Apple Newsroom and developer news, Google (Android, Chrome, Pixel blogs), Microsoft (Windows, VS Code, GitHub changelog/blog), Mozilla, Linux kernel / major distro releases, Node / Python / Rust release notes.
   - Hardware: NVIDIA, AMD, Intel, Qualcomm, Arm, Raspberry Pi newsrooms.
   - Security: vendor security advisories, CISA KEV, Project Zero, official post-mortems.
   - Space and science tech: NASA, ESA, SpaceX updates.
2. GitHub: trending repos (daily/weekly, all languages) and releases of notable repos.
3. Hacker News front page / "Show HN"; Product Hunt (all categories, top of the day/week).
4. **Buzz signals** (to find candidates and score `buzz`, never as the cited source):
   - **Reddit: public RSS feeds**, e.g. `https://www.reddit.com/r/<sub>/top/.rss?t=week`. RSS gives titles and links in popularity order but no vote counts. Fetch at most ~8 feeds, one every 15 s or slower; on HTTP 429 (rate limit), skip that feed and note it in the run log. Rotate which subs you read across days.
   - Don't try other Reddit routes: the JSON API returns 403 to automated clients, and the Claude in Chrome extension blocks reddit.com by its own safety policy (checked 2026-11-05). Don't work around either. Useful subs: technology, gadgets, Android, iphone, apple, windows, software, selfhosted, opensource, privacy, cybersecurity, sysadmin, ClaudeAI, ChatGPT, LocalLLaMA, androidapps, macapps. Keep it to ~10 feeds per run.
   - Hacker News points and comments (Algolia API: `https://hn.algolia.com/api/v1/search?tags=front_page`).
   - GitHub stars gained this week (trending page).
   - Recent YouTube videos / mainstream press coverage about it (via web search).
5. Reputable tech press as **leads only** (The Verge, Ars Technica, TechCrunch, Wired): each lead must be traced back to a primary source before it counts.
6. Papers (arXiv, Nature, Science) only when there's a public demo, code or an official explainer.
7. MCP registry and the `modelcontextprotocol` GitHub org, for agent tooling.

**Variety:** when several candidates pass the gate, prefer a mix of beats across the 1–3 scripts. Don't write three scripts on the same beat on one day unless nothing else qualifies. Check the last 3 run logs: if the queue is mostly one beat (e.g. AI), break a tie toward a different beat.

Use web search to find candidates; use web fetch to open the actual pages. An aggregator, newsletter or social post can **lead** you to a topic but is never the source you cite for a claim.

## Step 2: dedup
For each candidate, check `research/topics_seen.md` (slug, product name, main URL) and the existing files in `research/scripts/` and `research/archive/`. Drop it if it's the same product **and** the same angle. A genuinely new release of a product already covered (major version, new capability) is allowed; say in the script why it's new.

## Step 3: verify (every claim in the script)
Checklist, per candidate. A candidate fails if any **must** item fails.
- [ ] **must** Primary source exists and opens today (official blog/docs/changelog, the repo itself, the paper). Record URL + `checked:` date.
- [ ] **must** (news lane) The release/publish date is on the primary source and is inside the window. Note it. (Evergreen lane: note the latest release date and confirm the project is maintained and the install steps work today.)
- [ ] **must** Every number, name, price, limit and capability in the script appears in a source you opened. If two sources disagree, use the primary one and mention the disagreement in the sources note.
- [ ] **must** The thing is real and usable now (released, or public preview with clear availability). Rumors, leaks and "coming soon" are rejected.
- [ ] **must** License / availability / pricing stated correctly (free, paid, waitlist, region-limited).
- [ ] **should** A second independent source (reputable outlet, HN discussion with author replies, docs page) corroborates it.
- [ ] **should** You can name exactly what will be shown on screen, and it can be captured for real (see `demo_requirements`).

Never write a claim you didn't see on a page this run. If a page fails to load, try once more; if it still fails, the claim is out.

## Step 4: score (1–5 each)
| Criterion | 5 means | 1 means |
|---|---|---|
| novelty | News: released in the last 72 h. Evergreen: most viewers have never heard of it | Old news, or something everyone already knows |
| interest | Most tech-curious viewers would care | Niche of a niche |
| useful | The viewer can do something today: install it, try it, check if they're affected, change a setting | Nothing for the viewer to do |
| buzz | Spreading beyond dev circles: top of big subreddits, mainstream press, YouTube videos, thousands of GitHub stars this week | Only discussed in one niche forum |
| hook | A true, surprising first line writes itself | Needs a paragraph of setup |
| visual | Clear real demo: UI, terminal, before/after | Nothing to show but text |
| accuracy | All claims verified on primary sources | Relies on secondary sources |
| clarity | One idea, explainable in 60–90 s | Needs several concepts |
| brand_fit | "What's under the hood" of a piece of tech: how it works, hands-on | Business gossip, funding, drama, stock moves |

**Gate:** accuracy ≥ 4 **and** total ≥ 32/45 **and** no criterion at 1 **and** (useful ≥ 4 **or** buzz ≥ 4). Rank passing candidates by total (ties → useful, then buzz, then visual). Write the top 1–3. Log the rest with scores and reason. Record the buzz evidence in the run log (which subreddits/feeds, HN points, stars).

`demo_requirements` must be concrete: what software/account is needed, whether login or payment is required, and whether it's web, CLI or desktop. Prefer topics demonstrable with **no login and no payment**; if one needs the user's account, say so.

## Step 5: write the script file
ID: `UTP-<YYYYMMDD>-<NN>`, NN = 01, 02… for that day. Slug: kebab-case, English.

```markdown
---
id: UTP-20261105-01
topic: "Short English topic line"
slug: kebab-case-slug
beat: ai                          # ai | software | hardware | mobile | web | security | open-source | space-science | infra
lane: news                        # news | evergreen
status: queued
created: 2026-11-05
release_date: 2026-11-03          # from the primary source (evergreen: latest release)
scores: {novelty: 4, interest: 5, useful: 5, buzz: 4, hook: 4, visual: 5, accuracy: 5, clarity: 4, brand_fit: 5}
score_total: 41                   # out of 45
duration_target_s: 75
sources:
  - {url: "https://…", type: primary, what: "release post", checked: 2026-11-05}
  - {url: "https://…", type: secondary, what: "…", checked: 2026-11-05}
demo_requirements: "What is needed to capture the demo for real: software, account/login, cost, web/CLI/desktop."
---

# <EN title> / <ES title>

## Why now
One or two sentences: what happened, when, and why it's worth a video.

## EN script: "<hook line>"
Target duration: 75 s.

| Time | Visual (real capture or labeled schematic) | Voice-over | On-screen text (≤4 words) |
|---|---|---|---|
| 0–3 s | … | … | … |
| … | | | |

**CTA:** <one EN CTA line from brand/guidelines.md>

## ES script: "<hook line>"
Written natively in Spanish (not translated). Same structure; timings may differ.

| Tiempo | Visual | Voz en off | Texto en pantalla (≤4 palabras) |
|---|---|---|---|

**CTA:** <una línea ES de brand/guidelines.md>

## Sources
- [Title](url): what it supports. Checked YYYY-MM-DD.

## Notes for the Producer
Pronunciations, what must be captured live, claims to re-verify on production day, honest limitations to mention.
```

Script rules:
- 60–90 s each language. Rough pace: EN ≈ 2.5 words/s, ES ≈ 2.3 words/s. Count voice-over words and check the total fits the target.
- 6-part structure from `brand/guidelines.md`: hook (≤3 s) → context → how it works / demo → limits → takeaway → CTA.
- One visual action per block. Each block names what is actually on screen. If it's not a real capture, write "schematic:" in front.
- On-screen text ≤ 4 words per row (count them).
- The voice-over includes at least one honest limitation (price, platform, preview status, what it can't do).
- ES: native phrasing, rioplatense "vos" is fine, keep common English tech terms. Don't translate line by line.

## Step 6: update the ledgers
1. Append to `research/topics_seen.md` one row per written script (`outcome: queued`) and per candidate rejected for a lasting reason (duplicate, unverifiable, not released). Don't add candidates rejected only on score; they may come back.
2. Write the run log (`research/runs/YYYY-MM-DD.md`): sources scanned, every candidate with scores, decision and reason.
3. Regenerate `research/queue.md`:

```markdown
# Script queue
Generated: YYYY-MM-DD HH:MM by the researcher skill. Do not edit by hand; edit the script files.

| ID | Topic | Beat | Score | Status | Created | Release date | Demo needs |
|---|---|---|---|---|---|---|---|
```
Sort by status (`queued` first), then score desc. Include every file in `research/scripts/` (not the archive).

## Finish
Report: scripts written (ID, topic, score), how many candidates were rejected and the main reasons, and anything the user must decide (e.g. a topic that needs their login to demo).
