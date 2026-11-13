# UTP-20261105-06: storyboard v1 (Leo brings the problem)

Status: **v1, 2026-11-12, first draft for review.** Format: `brand/knowledge/proposals-2026-11-11.md` §2, applied to this episode only.
- **Script:** `script.md` (28 lines; line 26 is silence). Voice spec: `voice_en_v1.json`, Kokoro, Mott = `am_puck`, Leo = `am_eric`. Provisional voices: 62.1 s of speech, 65.2 s with the end card.
- **Code:** `production/remotion/src/episodes/Ep2611050601.tsx`, composition `UTP-20261105-06-EN`.
- **Real text shown on screen:** `production/remotion/src/data/utp2611050601_session.json`, built from `captures/` by a script. Nothing in it is typed by hand.
- **Not done:** music, SFX, the Spanish version, a real screenshot of the repo page and of the terminal.

## The set
The night desk, changed for dialogue: Leo **sits** with a laptop; Mott stands on **a stack of six books** so his head is level with Leo's; the lamp hangs from a cord. No monitor or keyboard.

## Shots
| Name | What it is |
|---|---|
| CU Leo | From the front, Mott's books on the right edge |
| CU Mott | Over Leo's right shoulder |
| 2S | Square to the line between their heads: both in profile, Leo left, Mott right |
| PROJ | The two-shot moved to the lower half; a lamp projection fills the top |
| SPLIT | Leo typing in the lower half; the projection on top |
| Lamp side | Mott seen from the lamp's side (line 26 only) |
| Wide | The whole desk (the last shot only) |

## Beats
| # | Time (s) | Who | Line | Shot | On screen |
|---|---|---|---|---|---|
| 1 | 0.2 | Leo | Mott. One prompt, and my app ships tonight. | CU Leo, `smug` | Stamp "NIGHT LOG · INCIDENT" |
| 2 | 2.9 | Mott | What's the prompt? | CU Mott | — |
| 3 | 4.1 | Leo | Build me a habit tracker. | CU Leo | Small card, typed: the prompt |
| 4 | 6.0 | Mott | For who? | CU Mott | — |
| 5 | 7.0 | Leo | For… people. With habits. | CU Leo, `thinking` | — |
| 6 | 9.2 | Mott | Where do the habits get saved? | CU Mott (faster) | — |
| 7 | 10.8 | Leo | In the… in the app. | CU Leo, `confused`, scratches his head | — |
| 8 | 12.2 | Mott | And if they miss a day? | CU Mott (faster), `smug` | — |
| 9 | 14.1 | Leo | I don't know. | CU Leo, `guilty`, drop emote | — |
| 10 | 15.6 | Leo | Why are you grilling me? | 2S | — |
| 11 | 17.2 | Mott | Because your agent won't. It just builds. | CU Mott | — |
| 12 | 19.9 | Leo | That's what I want. | CU Leo, `smug` | — |
| 13 | 21.4 | Mott | It builds its guess. Not your app. | CU Mott | — |
| 14 | 24.2 | Mott | There's a skill for this. Grill-me. Free. | CU Mott, then PROJ on "Grill-me" | **REAL TEXT:** `/grill-me`, its one-line description, "MIT · free · ★ 322k (whole collection)" |
| 15 | 27.6 | Leo | A skill? | CU Leo | — |
| 16 | 28.5 | Mott | A text file of instructions. Your agent reads it. | PROJ | **REAL TEXT:** the installed `grilling/SKILL.md`, name and first paragraph |
| 17 | 31.8 | Leo | And it does what? | CU Leo | — |
| 18 | 33.0 | Mott | It interviews you. Until no decision is left open. | PROJ | **SCHEMATIC:** a tree of decisions; branches go from open (ice) to settled (amber) |
| 19 | 36.5 | Leo | Sounds slow. | CU Leo, `skeptical` | — |
| 20 | 37.7 | Mott | It is. Slower than "build it". | CU Mott | — |
| 21 | 40.1 | Mott | But every question brings its answer. You say yes. | PROJ | **REAL TEXT:** question 7 (Reminders) with its recommended answer; a "yes" chip on the last word |
| 22 | 43.5 | Leo | And what I don't know? | CU Leo | — |
| 23 | 44.9 | Mott | Facts, it looks up itself. Decisions are yours. | CU Mott | — |
| 24 | 48.3 | Leo | Yes. Yes. …No. Wait. | SPLIT, Leo types, then stops | **REAL TEXT:** Q1, Q2, Q3 of round 1 with the first sentence of each recommended answer; chips yes / yes / no on his words; then the round 2 line "Your sync requirement changes Q3…" |
| 25 | 52.8 | Leo | Done. Your turn. Why the lamp? | CU Leo, `smug` | — |
| 26 | 55.3 | Mott | (silence, 2.0 s) | Lamp side: he turns up to the light | — |
| 27 | 57.3 | Leo | Recommended answer: you don't know. | 2S | — |
| 28 | 60.3 | Mott | …Yes. | CU Mott, then Wide: he flies up and taps the lamp; dark | End card: "Send this to the friend who says 'just build it'." / "Sources in the description." |

## Honesty tags
- **REAL TEXT** is a new tag: words copied from a real source and typeset by us. They can be cut, never reworded. The proposals only defined REAL (an unedited capture) and SCHEMATIC.
- The chips "yes / yes / no" on line 24 are our real answers in the captured session (`session.md`).
- Line 3's card is Leo's line in the story. It is also, word for word, the prompt of the real session.

## Known problems in this draft
1. **The reveal lands at 39% of the runtime** (24.2 s of 62.1 s), earlier than the playbook's 45–57%. By line count it is 50%: the second half has more two-part lines from Mott. Options: trim lines 16–23, or add a beat before line 14.
2. **Kokoro can't act.** The three faster questions and the silence work by timing only.
3. **Mott is small in the two-shot** (10 cm next to a human head). His close-up carries his acting.
4. **In the SPLIT shot the caption sits on Leo's neck** and his hands are out of frame.
5. **The end card is plain text.** No share-card design yet.
6. No music or SFX. The lamp tap has no sound.

7. **Mott acts at half strength** (2026-11-12, user direction: subtler, less exaggerated). `MOTT_INTENSITY = 0.5` in the episode file: expressions move half as far from neutral, blends are slower, twitches and flutters are almost off, the mouth opens less. The control is the new `intensity` option of `mott.pose()`; the pilot is unchanged. Draft 2 has it.
