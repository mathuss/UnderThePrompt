# UTP-20261105-06 · Incident: "One prompt" / Incidente: "Un prompt"

**Status:** dialogue draft v1, written 2026-11-11. The plugin is installed, the real session is captured (`session.md`), and a first animated draft exists (`storyboard.md`, provisional Kokoro voices). Waiting for the user's review.
**Source script:** `research/scripts/UTP-20261105-06.md` (voice-over version, left unchanged). Verification notes: `research/sources/UTP-20261105-06.md`.
**Format:** "Leo brings the problem, Mott explains what's under it" (`brand/knowledge/proposals-2026-11-11.md` §2), applied to this episode only. The brand documents are not changed.

## The idea in one line
Leo wants an app from one prompt. Mott asks him three questions he can't answer, then shows him the skill that does the same thing before any code is written.

## Dialogue
Legend: **CU** close-up · **2S** two-shot · **PROJ** lamp projection, tagged **REAL** (a real capture) or **SCHEMATIC** (a drawing).

| # | Who | EN | ES (written natively) | Shot |
|---|---|---|---|---|
| 1 | Leo | Mott. One prompt, and my app ships tonight. | Mott. Un prompt y esta noche sale mi app. | CU Leo, `smug`, laptop open (held ~4 s) |
| 2 | Mott | What's the prompt? | ¿Qué prompt? | CU Mott, at eye level |
| 3 | Leo | "Build me a habit tracker." | "Haceme una app de hábitos." | CU Leo; he turns the laptop: his own typed line |
| 4 | Mott | For who? | ¿Para quién? | CU Mott |
| 5 | Leo | For… people. With habits. | Para… gente. Con hábitos. | CU Leo |
| 6 | Mott | Where do the habits get saved? | ¿Dónde se guardan? | CU Mott (faster) |
| 7 | Leo | In the… in the app. | En la… en la app. | CU Leo, `confused` |
| 8 | Mott | And if they miss a day? | ¿Y si un día no cumplen? | CU Mott (faster) |
| 9 | Leo | …I don't know. | …No sé. | CU Leo, `guilty`; a small drop emote |
| 10 | Leo | Why are you grilling me? | ¿Por qué me interrogás? | 2S |
| 11 | Mott | Because your agent won't. It just builds. | Porque tu agente no lo hace. Construye y listo. | CU Mott |
| 12 | Leo | That's what I want. | Eso es lo que quiero. | CU Leo |
| 13 | Mott | It builds its guess. Not your app. | Construye lo que adivinó. No lo que querés. | CU Mott, deadpan |
| 14 | Mott | There's a skill for this. Grill-me. Free. | Hay una skill para esto. Grill-me. Gratis. | Mott taps the lamp. PROJ (REAL): the repo page, name and star count |
| 15 | Leo | A skill? | ¿Una skill? | CU Leo |
| 16 | Mott | A text file of instructions. Your agent reads it. | Un archivo de texto con instrucciones. Tu agente lo lee. | PROJ (REAL): the `grilling` SKILL.md, first lines |
| 17 | Leo | And it does what? | ¿Y qué hace? | CU Leo |
| 18 | Mott | It interviews you. Until no decision is left open. | Te entrevista. Hasta que no quede ninguna decisión abierta. | PROJ (SCHEMATIC): a tree of decisions; branches light up one by one |
| 19 | Leo | Sounds slow. | Suena lento. | CU Leo, `skeptical` |
| 20 | Mott | It is. Slower than "build it". | Lo es. Más lento que "hacelo". | CU Mott |
| 21 | Mott | But every question brings its answer. You say yes. | Pero cada pregunta trae su respuesta. Vos decís que sí. | PROJ (REAL): one question from a real session, with its recommended answer |
| 22 | Leo | And what I don't know? | ¿Y lo que no sé? | CU Leo |
| 23 | Mott | Facts, it looks up itself. Decisions are yours. | Los datos los busca solo. Las decisiones son tuyas. | CU Mott |
| 24 | Leo | Yes. Yes. …No. Wait. | Sí. Sí. …No. Esperá. | Split screen: PROJ (REAL) of the real session above, Leo typing below. He stops and thinks |
| 25 | Leo | Done. Your turn. Why the lamp? | Listo. Te toca. ¿Por qué la lámpara? | CU Leo, `smug` |
| 26 | Mott | … | … | CU Mott. He looks at the lamp. Two beats of silence |
| 27 | Leo | Recommended answer: you don't know. | Respuesta recomendada: no sabés. | 2S |
| 28 | Mott | …Yes. | …Sí. | CU Mott; *tink*; the only wide shot; end card |

- **Length:** about 140 words in EN, 60–65 s at dialogue pace. 28 lines.
- **Reveal:** line 14 of 28 (50%).
- **Rule of three:** Mott's questions at lines 4, 6 and 8, each faster; line 9 breaks it.
- **Callback:** the ending turns the skill's own mechanic (a recommended answer you accept with "yes") on Mott.
- **End card:** EN "Send this to the friend who says 'just build it'." / ES "Mandáselo al que dice 'hacelo y listo'."
- **Caption question:** EN "What's the one question you should have asked before you started building?" / ES "¿Cuál es la pregunta que te tendrías que haber hecho antes de empezar a construir?"
- **Caption body:** sources, the install command for Claude Code, and the note about `/grill-with-docs` below.

## Where each claim comes from (checked 2026-11-11)
| Line | Claim | Source |
|---|---|---|
| 14 | The skill exists, is called grill-me, and is free | README of [mattpocock/skills](https://github.com/mattpocock/skills): MIT licence; `/grill-me` listed under Productivity |
| 14 (projection) | Star count | Repo page showed 322.1k on 2026-11-11 (314.8k on 2026-11-05). The stars belong to the whole collection, not to grill-me. Capture it on production day |
| 16 | A skill is a text file of instructions | The skill files themselves (`SKILL.md`, Markdown) |
| 18 | It interviews you until every decision is settled | [grilling SKILL.md](https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grilling/SKILL.md): a design tree; done when nothing is left to ask |
| 21 | Each question has a recommended answer; "yes" accepts it | Same file |
| 23 | It looks up facts itself; decisions go to the user | Same file |
| 20 | Slower than "build it" | Not a sourced number. It follows from adding an interview before the work. Keep it as a plain remark, never as a measurement |
| 11, 13 | An agent given a vague prompt builds from its own assumptions | Mott's opinion. The README makes the same argument (a "communication gap" between you and the agent). No figure attached |

## Corrections to the Researcher's script
1. **Questions come in rounds, not one at a time.** The skill asks every question it can ask now, numbered, then waits. Lines 21 and 24 are written to fit that.
2. **`/grill-me` is described in the README as "for non-code uses".** For work inside a codebase the README points to `/grill-with-docs`, which is the same interview plus a glossary and decision records. Leo has only an idea and no repo yet, so grill-me fits, but the caption should say this in one sentence.
3. **`grill-me` itself is one line** that hands off to the `grilling` skill. The file worth showing at line 16 is `grilling`.
4. **Drop "dozens of skills".** The Researcher counted 27 on 2026-11-05; the line isn't needed here.

## What the real session showed (2026-11-11)
Plugin `mattpocock-skills@claude-plugins-official` 1.3.1, installed at user scope. Its manifest declares 27 skills and no hooks or MCP servers. Claude Code 2.1.314, an empty folder, prompt: `/mattpocock-skills:grill-me Build me a habit tracker.` Full text in `session.md`; raw JSON in `captures/`.

| What the script says | What happened |
|---|---|
| Questions come in rounds, numbered, each with a recommended answer | Round 1: 7 questions (Q1–Q7) in about 17 s. Round 2: 5 more (Q8–Q12). Every one has a recommended answer |
| Mott's three questions (lines 4, 6, 8): who is it for, where is the data saved, what if they miss a day | The real round 1 asks the same three: **Q2 Users**, **Q3 Data storage**, **Q5 Streak rules** (does a missed day reset it?). Mott's lines were written before the session and are his own words; the match is real and worth showing |
| "Facts, it looks up itself" (line 23) | It opened by reporting that the folder was empty and not a git repository, without asking |
| "Yes. Yes. …No. Wait." (line 24) | Our real answers: Q1 yes, Q2 yes, Q3 no (sync between phone and laptop), Q4–Q7 yes. Round 2 then opened with a new question caused by that "no" (Q8, how to sync) |
| It writes no code until you agree | The session created no files in either round |

**Projections to cut from the real text (never reworded):**
- Line 21: **Q7 Reminders**, the shortest question, with its recommended answer starting "No for v1."
- Line 24: the round 1 list with Q1, Q2, Q3 visible; then the first lines of round 2 ("Your sync requirement changes Q3…").
- Optional, after line 9: a one-second flash of Q2, Q3 and Q5 next to Mott's three questions.

**Note:** in headless mode the skill had to be called with its plugin prefix (`/mattpocock-skills:grill-me`). The README writes `/grill-me`. Check which one the interactive terminal accepts before putting the command on screen.

## Before production (each needs the user's OK)
1. **The real session: done on 2026-11-11** (the user approved the install in chat). See "What the real session showed" below and `session.md`.
2. **A terminal screenshot does not exist yet.** The capture is the session's text output from headless mode. The projection can typeset that text word for word. If we want the look of the actual Claude Code window, the user runs `/grill-me` once in a terminal and we take a screenshot.
3. **The star count** has to be captured from the repo page on production day.
4. **New pieces this script uses** (from the proposals, not built yet): Mott at eye level, the lamp projection with its REAL / SCHEMATIC tag, the split screen, the `guilty` and `smug` faces, the drop emote, the end card.
5. **Voices.** Still Kokoro. This script leans on timing (the three faster questions, the silence at line 26), which is where a voice with acting control would show most.

## Playbook checklist
- [x] Line 1: a problem, said by one character to the other, with a number or a stake ("one prompt", "tonight").
- [x] No line over ~12 words; nobody speaks more than two lines in a row.
- [x] The human asks at least four short questions (lines 10, 15, 17, 22, 25).
- [x] One idea. The reveal sits at 50%.
- [x] One statistic at most (the star count, on the projection only).
- [x] The caveat is spoken as dialogue (lines 19–20).
- [x] The last beat is a callback and a twist about a character.
- [x] Every panel is marked REAL or SCHEMATIC.
- [ ] 55–70 s, works with the sound off: to confirm with a timed read and captions.
- [x] Nothing in it recreates a reference's characters, set, lines or story.
