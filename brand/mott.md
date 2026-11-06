# Mott: character specification

Status: **approved 2026-11-05.** Changes to anything in this file need the user's OK, because consistency is the point.

**Source of truth:** `production/remotion/src/brand/mott.ts` (geometry, colours, presets, pose). This document describes it. When they disagree, fix the code to match this spec, or get the user's OK to change the spec.

Mott is built in code as **one reusable 3D component** (see `brand/pipeline.md`). The component *is* the model sheet: every video imports the same geometry, colours and expression presets, so Mott can't drift between videos. This document is the human-readable version of that component.

---

## 1. Visual design

### Silhouette
- **At rest (wings folded):** a teardrop, with a big round head on top and two feathery antennae forming a "V". Readable at 64 px.
- **Open:** a wide shape with four rounded wings, the eyespots visible.
- **Rule:** at least one antenna is always visible in every shot of Mott. They are the brand's silhouette.

### Proportions (units; standing height = 1.0, antennae excluded)
| Part | Shape | Size | Notes |
|---|---|---|---|
| Head | Faceted sphere (icosahedron, detail 1), slightly wider than tall | Ø 0.45, scale (1.08, 1.0, 0.95) | Its centre sits at y 0.74 |
| Eyes | Two glossy hemispheres, black `#120D18` | Ø 0.17 each, spaced 0.21 apart (centres), pushed 0.19 forward | Always carry **one amber catchlight**, top-left, Ø 0.035. It's the reflection of the lamp. |
| Eyelids | Violet partial shells over each eye | Rotate 0–75° | The main expression control along with the antennae |
| Mouth | A small dark rounded shape `#2A1C3A`, low on the face | Width 0.07 (closed) to 0.10 (open) | Shapes: closed, small, open, wide, smile, "o". No teeth, no tongue. |
| Cheek fuzz | Two lilac tufts | Ø 0.07 | Beside the mouth |
| Antennae | A central rod plus **6 barbs per side** (feathery, low-poly) | Length 0.55, base gap 0.18, rod Ø 0.012 | The **eyebrows**: all emotion reads here first |
| Thorax | A fuzzy faceted ball | Ø 0.35, centre y 0.42 | Jittered vertices (±3%), lilac rim |
| Abdomen | A tapered, segmented capsule pointing down and back | Length 0.30, 3 lilac bands | Mostly hidden by folded wings |
| Front limbs ("hands") | 2 thin 2-segment limbs, rounded tips | Length 0.22 | For pointing, tapping, holding. No fingers. |
| Legs | 4 short limbs; 2 visible when standing | Length 0.14 | Simple |
| Forewings | Rounded triangles | Span 0.70 each, thin (0.01) | Each carries the **eyespot** |
| Hindwings | Smaller rounded fans | Span 0.45 each | Behind the forewings |

### The eyespot (brand mark on the body)
Each forewing carries an eyespot:
- an **amber ring** `#FFB23E`, Ø 0.16;
- a Night Ink centre;
- an amber **"_" bar** inside, 0.08 × 0.018.

It's the cursor of "Under the Prompt" grown on a moth's wing, and the eyespots are the only amber on Mott's body.

### Colour (exact, never change)
| Part | Hex |
|---|---|
| Body, head, wings base | Mott Violet `#7A68D8` |
| Fuzz, wing edges, rim light colour | Fuzz Lilac `#B9AEF2` |
| Wing inner gradient toward body | `#5B4BB8` |
| Eyes | `#120D18`, catchlight `#FFE2A8` |
| Mouth | `#2A1C3A` |
| Eyespot | Lamp Amber `#FFB23E` plus Night Ink `#0E0B14` |
| Antennae | `#5B4BB8` rod, `#B9AEF2` barbs |

### Never
- Never orange, red or any body colour other than violet.
- No clothes, hats or props glued on. Mott may *hold* an object for a scene.
- No realistic insect textures, hairs or compound-eye detail.
- No teeth, and no human hands with fingers.
- No changes of proportion between videos.
- Never the logo or mascot of any real company next to Mott in a way that looks like a mascot pairing.

### Scale in the world
- Mott is **4 cm tall**. A keycap is a step, a phone is a building, and a server rack is a skyscraper.
- To show a number, show it against Mott ("that's 200 Motts tall").

---

## 2. Expression system (named presets; every video uses only these)

| Preset | Antennae | Eyelids | Catchlight | Mouth | Wings | Body |
|---|---|---|---|---|---|---|
| `neutral` | Relaxed V, 25° out | 15% | Normal | Closed | Folded | Slow 0.5 Hz breathing bob |
| `curious` | Forward, tips raised 15° | 0% | Normal | Small | Folded | Leans forward 10° |
| `excited` | Up, 8 Hz twitch for 0.4 s | 0% | Bigger (1.3×) | Wide or smile | Quick double flutter | A small hop |
| `skeptical` | Left one straight, right one bent 40° | 45%, asymmetric | Normal | Flat, shifted to one side | Folded | Head tilted 12° |
| `shocked` | Straight up, stiff | 0% (wide) | Shrinks to 0.6× | "o" | Snap open | Pops back 5% |
| `worried` | Drooped 30° and inward | 30% | Normal | Small | Shiver at 12 Hz, low amplitude | Shrinks to 95% |
| `sad` | Fully drooped | 55% | Smaller | Closed, down | Folded tight | Slumped |
| `smug` | Relaxed, one tip curled | 50% | Normal | Smile | Half open | Leans back |
| `embarrassed` | Curled down | 40%, looks away | Normal | Small | **Dust puff** (a few lilac particles) | A small shrink |

- **Eyelid rule:** eye, catchlight and lid share one squash group, and the lid rotates *inside* it, so the lid stays concentric with the eye at every angle (a fix for the overlap the user spotted on 2026-11-05). Lid angle = −π/2 + closure·π. The catchlight hides once closure ≥ 0.36.
- Blend between presets over 0.25–0.4 s. Never snap, except `shocked`, which snaps in 0.1 s.
- Talking: the mouth opens with the voice's amplitude envelope (computed from the WAV), clamped between `small` and `open`. Blinks happen every 3–5 s at random (seeded), and on cuts.

## 3. Poses and signature gestures

| Name | Description | When |
|---|---|---|
| `stand` | On two visible legs, front limbs at rest | Default |
| `hover` | Wings beating at a readable 4 Hz, body bobbing | Travelling, wide shots |
| `perch` | Sitting on an edge, legs dangling | Listening, thinking |
| `point` | One front limb extended toward a target; both antennae aim at it too | Directing attention |
| **Lamp Tap** *(signature)* | Flies up, taps the cursor-lamp with a front limb: *tink*, the lamp blinks | The opening and ending of every video |
| **Antenna Check** *(signature)* | Both antennae swing to point at the thing, then Mott's head follows | "Look at this", before every key number |
| **Wing Shield** *(signature)* | One forewing covers the face, eyes peeking over it | Bad news, security horrors, cringe |
| **Light Lean** *(signature)* | Mott drifts toward something bright (hype), then catches itself and pulls back | The "lamp or fire?" honesty beat |

---

## 4. Personality

- **Core:** endlessly curious, a night owl and a nerd. Mott reads changelogs at 3 a.m. for fun.
- **The conflict that makes Mott a character:** Mott is *dazzled* by bright new tech, and knows what happens to moths that fly into bright lights. So Mott learned to check before getting close. **Curiosity first, then receipts.**
- **Traits:**
  - warm;
  - a little dramatic about small things and calm about big ones;
  - honest about what it doesn't know;
  - never cynical.
- **Flaw (running gag):** easily distracted by anything shiny or glowing, so it glances at lights mid-sentence.
- **Values:** curiosity, honesty, protecting the viewer from hype and from scams.

## 5. Tone of voice

- First person, talking to **you**. Short sentences. Conversational, smart, never lecturing.
- At most one joke every ~20 s. Information always beats the joke.
- Explains with **physical analogies at moth scale** ("it's like searching every switch in a building, one by one").
- Speeds up when excited and slows down for the payoff. Pauses before numbers.
- **Voice:**
  - EN: Kokoro `am_puck`, speed 1.05, chosen by the user on 2026-11-05.
  - ES: *to be decided.* Kokoro's Spanish voices sounded robotic to the user, and a better option may need a paid TTS, which needs the user's permission.

## 6. Vocabulary and expressions

| Use | EN | ES (rioplatense) |
|---|---|---|
| Opener when something's big | "Okay, okay, okay." | "A ver, a ver, a ver." |
| **Fact-check ritual** (the honesty beat) | "Bright light. Let's check if it's a lamp or a fire." | "Mucha luz. Veamos si es lámpara o incendio." |
| Twist | "Here's the part nobody tells you." | "Acá viene la parte que nadie cuenta." |
| Evidence | "Receipts:" / "Don't trust me, here's the source." | "Pruebas:" / "No me creas, acá está la fuente." |
| Going deeper | "Let's look under the prompt." | "Veamos qué hay debajo del prompt." |
| **Sign-off (every video)** | "Stay curious. Not too close to the light." | "Seguí curioso. Pero no tan cerca de la luz." |

- **Never say:** "game changer", "insane", "this changes everything", "RIP", "you won't believe". No fake urgency, and no "smash that like".

## 7. Humor style
- **Self-aware moth jokes:** lights, being a "bug", sweaters ("I don't eat sweaters. That's my cousins' kids.").
- **Understatement** after big numbers ("Eight hundred dollars. In an hour. Cool cool cool.").
- **Physical gags:** the dust puff, the Light Lean, the lamp-tap misfire (rare, maybe once in ten videos).
- **Never:** jokes at the viewer's expense, punching down, politics, or memes that will age in a month.

## 8. Reactions and mannerisms
- Antennae twitch whenever a number is said.
- Leans toward screens. Taps glass with a front limb to "open" a card.
- Wings shiver on security topics. Covers its face with the Wing Shield at the worst detail.
- Looks straight at the camera only for the hook and the sign-off. Otherwise it looks at the story.

## 9. Relationship with the audience
- Mott is the **night-shift friend who reads the fine print so you don't have to**, and brings you along ("come with me").
- Admits mistakes on camera, and corrects them in the next log.
- Always credits sources ("receipts in the description").
- Treats viewers as smart people who are short on time.

## 10. The Cursor (silent partner)
- The giant blinking "_" lamp over Mott's desk. It never speaks aloud.
- It "answers" Mott by **typing UI cards**: evidence, numbers, sources, commands. This turns evidence into dialogue.
- Its blink is the signature transition.
