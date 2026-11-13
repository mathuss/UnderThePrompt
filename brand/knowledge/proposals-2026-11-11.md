# Proposals after refs 4–8 (2026-11-11)

Status: **proposed, waiting for the user's decision.** Nothing here changes `brand/identity.md`, `brand/host.md`, the Researcher skill or any episode until the user says so. Evidence for every point is in `playbook.md` and `videos/`.

Goal set by the user on 2026-11-11: videos that are **explanatory and interactive at the same time, interesting and catchy**.

## 1. Where the pilot stands against the playbook
| Playbook rule | UTP-000 v3.1 today |
|---|---|
| Line 1 is a problem, said by one character to the other | Mott states a fact to camera ("In 1947…") |
| The human drives with short questions | Leo has 5 of 26 lines, mostly reactions ("No way!") |
| Nobody speaks more than two lines in a row | Mott runs four scenes in a row (3–6), then pairs (8–9, 11–12, 14–15) |
| The small character is at the human's eye level | Mott is 10 cm tall on the desk; Leo looks down, the camera has to cheat |
| End on a callback or silence | It ends on a spoken sign-off after the joke |
| One persistent object that changes | Six different sets in 60 s |

The story shots with people (the engineers, the logbook, the museum) are **our own strength** and none of the references has them. The proposal keeps them.

## 2. Format: Leo brings the problem, Mott explains what's under it
Mott still tells the story to Leo (decided 2026-11-05). What changes is **who drives**.

1. **Leo opens.** He walks in with a problem, a claim he read, or something he just did. One line, with a number or a stake.
2. **Mott answers in one or two lines, then Leo reacts or asks.** Never more than two lines in a row for anyone.
3. **Leo's questions are the skeleton:** "with what?", "and?", "how common?", "so I'm safe?".
4. **Three shots plus one:** close-up Leo, close-up Mott, an **insert**, and one two-shot. The insert is either a story shot with people doing the action (our strength) or a lamp projection (see 4b).
5. **A cut on every line.** 24–28 lines, 55–70 s.
6. **The reveal** (the key fact, the tool, the fix) lands between 45% and 57%.
7. **The caveat is a line of dialogue,** often the last one before the punchline.
8. **The last beat is a callback, a twist about Leo, or a silent look.** Then the lamp tap (*tink*, under a second). The spoken sign-off moves to the post caption.

## 3. Characters
### Leo (the look stays exactly as approved)
- **Give him a flaw that causes episodes:** he installs first and reads later, believes headlines, says "just make it work". Curious and quick, never stupid.
- **He says the clickbait version; Mott gives the true one.** This puts our honesty rule inside the comedy.
- **New face presets** on top of the nine: `panic` (wide eyes, mouth pulled), `deadpan` (flat lids, flat mouth), `guilty` (eyes aside, brows up in the middle), `smug`.
- **Emotes in our own style:** small faceted shapes near the head for one beat (a drop, an exclamation spark, a question spark). Amber for Mott, ice for Leo.
- **Props in his hands:** phone, laptop, a mug. A phone turned to the camera is a free panel.
- **Name:** still provisional. Worth settling before the first public episode.

### Mott
- **Deadpan expert.** Short answers, light roasts, and he admits when he doesn't know.
- **Raise him to Leo's eye level:** perched on the lamp arm or on a stack of books. Both faces fit a two-shot, the eyelines are true, and the "they don't look at each other" problem goes away by construction.
- **His weakness for light is the running gag:** a bright notification, a glowing screen or the lamp can distract him mid-sentence. It also gives us a non-verbal ending.
- **He operates the lamp:** he taps it to project a panel, flies into the beam to point at a line, and his shadow falls on the projection.

### A third character who never appears
Someone who exists only as notifications on Leo's phone or laptop: his tech lead, a group chat, his mother asking for tech support. No model to build, real stakes, and a source of rule-of-three gags. Who it is and what they're called is the user's choice.

## 4. Signature devices (ours, not the references')
**a. "Lamp or fire?" as a game the viewer plays.** It's already Mott's honesty beat. Make it the hook: Leo states the headline, a two-option card ("LAMP = true" / "FIRE = hype") holds for about a second so the viewer picks, then Mott gives the verdict and the correction. The post caption asks the same question. This is the most direct answer to "interactive".

**b. Lamp projections.** Panels are light the lamp casts on the wall or desk, in the Lamplight palette. Each carries a small tag: **REAL** (a real capture) or **SCHEMATIC** (a drawing). That turns hard rule 4 into a visual signature, where the references simply invent their screens.

**c. The step bar.** For how-tos: split screen with the projection above and the characters below, and "STEP 2/3" with amber segments. It reuses the amber progress bar from `identity.md`.

**d. One object that transforms.** Each episode picks one thing that changes as the explanation grows (a request card that gains lines, a map whose candidate area shrinks, an envelope travelling through a phone).

**e. Endings.** Punchline or silence → lamp tap → a 2 s end card with a share prompt aimed at a person ("send this to the friend who installs everything").

**f. Caption CTA.** A question people can answer about themselves, plus the sources. A "comment WORD and get the link" mechanic needs a third-party DM service and an account, so it's a separate proposal if the user wants it.

## 5. Series (all inside Mott's Night Log, each with its own label and number)
| Series (EN / ES) | Shape | Fits |
|---|---|---|
| **Incident / Incidente** | Leo has a problem → cause → fix → caveat (playbook shape A) | Security and privacy news |
| **Lamp or fire? / ¿Lámpara o fuego?** | A viral claim → the viewer guesses → verdict → what's actually true | Hype checks, AI claims |
| **You are… / Sos…** | Second person, escalation loop (shape B) | How an attack, a protocol or a chip works |
| **In three steps / En tres pasos** | Split screen with the step bar | Settings, tools, how-tos |
| **Origins / Origen** | Mott tells a history story with people in the shots | Evergreen (the moth pilot is episode 1) |

## 6. Script pitches from the current queue
Facts below come from the Researcher's scripts in `research/scripts/`. News items from 2026-11-05/06 need a fresh check before production.

### P1. Incident: "My coding agent is leaking my email" (UTP-20261106-02)
- **Hook:** Leo, phone in hand, says the headline version. "Lamp or fire?" card.
- **Verdict:** lamp, but smaller than the headline: some users, some requests, one line of the request.
- **Object that transforms:** one HTTP request card (SCHEMATIC); the User-Agent line lights up, then the email slot.
- **Reveal (~50%):** it was being polite. Some sites ask bots for a contact, and the account email was in the model's context.
- **Fix:** version 2.1.317 asks first; `claude --version`, `claude update` (REAL terminal capture).
- **Caveat as dialogue:** the check doesn't catch scripts the agent writes and runs itself.
- **Ending:** Leo asks Mott if *he* knows his email. Mott looks at the lamp. *Tink.*
- **Why first:** one set, public pages, and it tests the whole new format. A full draft is in section 7.

### P2. Lamp or fire?: "Hackers got into the White House" (UTP-20261111-01)
- **Hook:** Leo reads it that way. Card. **Fire:** nobody got in; strangers' traffic came *out* of that network, 236 times in a month, sold by 28 proxy services.
- **Escalation:** how does your connection end up for sale? A free VPN → an app that pays for "unused bandwidth" → a browser extension → a cheap TV box. Each one adds a line from a little house to a stranger (SCHEMATIC).
- **Reveal:** if it's free, your connection may be the price.
- **Do it:** the free IP check (REAL capture). Leo's comes back clean.
- **Caveat as the ending:** "Which device would it be?" "It can't tell you." Both turn slowly to the cheap TV box on Leo's shelf. Silence.

### P3. In two steps: "A person may read your email" (UTP-20261111-02)
- **Hook:** Leo, delighted: he connected Gmail to Gemini and it's great. Mott: Google says a person may read part of it.
- **Split screen with the step bar:** step 1/2 Keep Activity off (REAL capture of the setting); step 2/2 disconnect the apps you don't need.
- **Leo's questions:** "A person-person?" "What do they see?" "For how long?" (excerpts and summaries; reviewed chats kept up to three years; Google's own advice is not to connect confidential apps).
- **Caveat as the ending:** disconnecting doesn't delete what's already in the activity. Leo scrolls his own inbox, `guilty` face.
- **Share card:** "send this to the friend who connects everything".
- **Why it's strong:** evergreen, no staleness risk, and the viewer can do it in 30 seconds.

### P4. You are…: "You're a text message nobody will ever see" (UTP-20261106-01, merge with UTP-20261105-05)
- **Frame:** Leo is on a call at the desk. It drops. Mott: "You just got a text." "I didn't." "Exactly."
- **Second-person escalation (SCHEMATIC, one envelope travelling through a phone):** you arrive as a system message → the phone handles you in the background → you carry a length → it gets squeezed into a smaller number type → it turns negative → the phone tries to build a list of negative size → the phone service crashes → the call drops.
- **Do it:** Settings → About phone → security update of 2026-11-01 or later (REAL capture).
- **Caveat:** the researcher says Android 12 and 13 won't get the fix. Leo looks at his old phone.

### P5. Incident (rule of three): "Build me an app" (UTP-20261105-06)
- **Hook:** Leo: "Build me an app. Now." The skill asks a question instead. Leo answers, annoyed. Another question. A third. Faster each time.
- **Turn:** by the third question Leo realises he doesn't know what he wants.
- **Reveal:** that's the point. A skill is a Markdown file of instructions; this one interviews you until every decision is settled (free, MIT).
- **Caveat:** it takes longer than saying "build it".
- **Ending:** Leo turns it on Mott: "Why the lamp?" Mott has no answer. *Tink.*

### P6. Lamp or fire?: "A plane can tell where you filmed" (UTP-20261105-04)
- **Hook:** Leo posted a video and says nobody can know where he lives. Mott: "A plane can." Card. **Lamp.**
- **Object that transforms:** a map (SCHEMATIC) whose candidate area shrinks each time a pitch curve matches a public flight track.
- **Caveat:** it needs planes overhead, flight data for that moment, decent audio and the recording time.
- **Do it:** replace the background audio; ordinary noise reduction may not be enough.
- **Ending:** a plane passes. Both look up. Silence.

### Possible later: the skill scanner (from `tools.md`)
SkillSpector is real and the study numbers are public, so the topic is fair. It is also the exact subject of ref 6, so it only works with our own incident and structure, and it should not be among the first episodes.

## 7. Full draft of P1 in the new format
**Draft for review.** Before production: check whether the release that removes the email from the model's context has shipped (lines 16 and 22 change if so), and capture the real terminal. Line 19 depends on what the real capture shows; if the machine is already up to date, lines 19–21 become "…Already there." / "Then you're covered." / "So I'm safe."

Legend: **CU** close-up · **2S** two-shot · **PROJ** lamp projection.

| # | Who | EN | ES (written natively) | Shot |
|---|---|---|---|---|
| 1 | Leo | Mott. My coding agent is leaking my email. | Mott. Mi agente de código está filtrando mi mail. | CU Leo, `panic`, phone in hand |
| 2 | Mott | Lamp or fire? | ¿Lámpara o fuego? | CU Mott + the two-option card, ~1.2 s |
| 3 | Mott | Lamp. It's real. But smaller than that headline. | Lámpara. Es real. Pero más chico que ese titular. | CU Mott |
| 4 | Leo | Smaller how? | ¿Más chico cómo? | CU Leo |
| 5 | Mott | Some users. Some requests. One line. | Algunos usuarios. Algunos pedidos. Una sola línea. | Mott taps the lamp |
| 6 | Mott | Every web request says who's asking. That's the User-Agent. | Cada pedido web dice quién pregunta. Eso es el User-Agent. | PROJ (SCHEMATIC): request card, the line lights up |
| 7 | Leo | And mine said… | Y el mío decía… | CU Leo |
| 8 | Mott | Your email. As the contact. | Tu mail. Como contacto. | PROJ: the slot fills with `you@…`; Mott's shadow points |
| 9 | Leo | Why would it do that? | ¿Y por qué haría eso? | CU Leo |
| 10 | Mott | Because polite bots do. Wikipedia asks them for a contact. | Porque los bots educados lo hacen. Wikipedia les pide un contacto. | PROJ (REAL): the Wikimedia User-Agent policy |
| 11 | Leo | But how did it know my email? | ¿Pero cómo sabía mi mail? | CU Leo |
| 12 | Mott | Their own team said it: it was in the model's context. | Lo dijo su propio equipo: estaba en el contexto del modelo. | PROJ (REAL): the team member's reply, key sentence underlined |
| 13 | Leo | So it was being… polite. | O sea que estaba siendo… educado. | 2S |
| 14 | Mott | With your address. Yes. | Con tu dirección. Sí. | CU Mott, deadpan |
| 15 | Leo | Fix it. Now. | Arreglalo. Ya. | CU Leo |
| 16 | Mott | Already shipped. Version 2.1.317 asks before sending it. | Ya salió. La 2.1.317 te pregunta antes de mandarlo. | PROJ (REAL): the changelog line |
| 17 | Leo | And I'm on…? | ¿Y yo en cuál estoy? | CU Leo |
| 18 | Mott | Type it. | Escribilo. | Leo types; PROJ (REAL): `claude --version` |
| 19 | Leo | …Older. | …Una más vieja. | CU Leo, `guilty` |
| 20 | Mott | claude update. | claude update. | PROJ (REAL): the command and its result |
| 21 | Leo | Done. So I'm safe. | Listo. Estoy a salvo. | CU Leo, `smug` |
| 22 | Mott | Safer. It misses scripts it writes and runs itself. | Más a salvo. No frena los scripts que escribe y corre solo. | CU Mott |
| 23 | Leo | So what do I do? | ¿Y entonces qué hago? | CU Leo |
| 24 | Mott | Read what your agent sends. It knows more than you think. | Mirá qué manda tu agente. Sabe más de vos de lo que pensás. | 2S |
| 25 | Leo | …Do you know my email? | …¿Vos sabés mi mail? | CU Leo |
| 26 | Mott | …Bright light. | …Qué linda luz. | CU Mott turning to the lamp; *tink*; the only wide shot; end card |

- **Length:** about 150 words in EN, 60–65 s at dialogue pace.
- **End card:** EN "Send this to the friend who lets the agent run everything." / ES "Mandáselo al que deja que el agente haga todo."
- **Caption question:** EN "Lamp or fire: did you know your agent had your email?" / ES "¿Lámpara o fuego: sabías que tu agente tenía tu mail?"
- **Sources** (already checked by the Researcher on 2026-11-06) go in the description, as today.
- **Accuracy notes kept from the script:** say "their team" / "someone on the Claude Code team", not "Anthropic announced"; never say how many users were affected; the "scam emails" claim is the reporter's and is left out of this version.

## 8. Tools
| Proposal | Cost | Needs from the user |
|---|---|---|
| **Decide the voices first.** A dialogue format lives or dies on acting, and Kokoro can't act (`brand/tts-options.md`). This is now the biggest quality lever. | Gemini free tier to test | An API key (the user creates it) |
| **Scan installed skills with SkillSpector** once, and before each new install. | Free; installs a Python tool | OK to install |
| **One-hour look at Open Design Motion / motion-anything** as a library of 2D motion ideas for projections and end cards, re-implemented in our style. | Free | OK to clone and try locally |
| **Higgsfield Content Factory:** not recommended (paid, generic look, conflicts with rule 4). | — | — |

## 9. What would change if this is approved
1. `brand/identity.md` §5–6: Leo opens; the two-line limit; the reveal window; endings; "Lamp or fire?" as the hook game; lamp projections with REAL / SCHEMATIC tags; the series table.
2. `brand/host.md`: Leo's flaw, new presets and emotes. `brand/mott.md`: eye-level perch, the light gag, operating the lamp.
3. `brand/guidelines.md`: structure and CTA sections (the CTA moves to the caption and the end card).
4. The Researcher skill's script template: a **dialogue table** (who / line / shot / panel type) instead of a voice-over table, plus the playbook checklist. Existing queued scripts stay as they are and get converted when picked.
5. Remotion: a projection component with the tag, the two-option card, the step bar, split-screen layout, four face presets, emotes, and Mott's perch on the desk set.

## 10. Decisions for the user
1. Approve the format change in section 2 (yes / no / with changes).
2. Which episode first: **P1** (tests everything on one set; needs a freshness check) or **P3** (evergreen, strongest "do it now").
3. The third, off-screen character: who is it?
4. Leo's final name.
5. Voices: which TTS to test first.
6. The two tool checks in section 8.
