# Daily researcher task (approved 2026-11-05, scope widened to all tech 2026-11-05)

- Task ID: `utp-daily-researcher` (created in the Claude desktop app, Scheduled section)
- Schedule: `0 7 * * *` (07:00 local, plus the app's small dispatch delay, ~07:11)
- Runs only while the app is open; a missed run fires on next launch.
- This file is a copy for reference. The live prompt is the one in the app.

## Prompt

Work in the folder C:\Users\Thiago\Desktop\Repos\UnderThePrompt (project "Under the Prompt" / "Debajo del Prompt", a bilingual tech-news short-video channel covering all of tech, AI included: software, hardware, mobile, web, security, open source, space and science tech).

1. Read CLAUDE.md (hard rules) and brand/guidelines.md.
2. Run the project's researcher skill exactly as written in .claude/skills/researcher/SKILL.md: discover across all tech beats, dedupe against research/topics_seen.md, verify every claim on primary sources, score, write 0–3 EN + ES scripts to research/scripts/UTP-YYYYMMDD-NN.md with verification notes in research/sources/, append to research/topics_seen.md, write/append the run log research/runs/YYYY-MM-DD.md, and regenerate research/queue.md. Follow the skill's variety rule (mix beats; don't fill the queue with one beat). Use today's real date.
3. Also re-check candidates the previous run log marked "Retry next run".

Hard limits: only write inside research/. Never touch production/, tools/, output/, publishing/ or PLAN.md. Never delete files (archive instead). Never publish, post, create accounts, sign in, spend money or accept terms. Do not git commit. Never invent claims, numbers or demos; zero scripts is a valid outcome if nothing passes the gate.

Finish with a short report in Spanish (rioplatense): scripts written (ID, topic, beat, score), number of rejected candidates and main reasons, and anything that needs the user's decision.
