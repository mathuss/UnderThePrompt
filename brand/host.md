# The host: the intern (name TBD)

Status: **design in progress, 2026-11-05.** The look follows the user's spec and is based on the user's own photo, shared by the user for this purpose. Name and voice are not chosen yet.

## Role in every video
**Mott tells the story; the intern listens, asks and reacts.**
- The intern is a systems student / intern who is curious about tech. They stand in for the audience: they ask the questions viewers would ask ("wait, a moth? an actual moth?").
- Mott is the storyteller. When the story travels (1947, 1878, a lab, a museum), the video cuts to the story told visually, with **the people in the story doing the actions**. Then it cuts back to the desk for the intern's reaction.
- The format borrows from the dialogue-driven references, but here **the AI-ish character (Mott) tells and the human learns**. That flips the reference, where the human acts and the AI helps.

## Look (source of truth: `production/remotion/src/HostOptions.tsx` → `HOSTS.host`, built with `src/brand/person.ts`)
- **Skin:** fair (`#ECC8AE`).
- **Face:** oval, dark straight brows, **small eyes** (`eyeSize: 0.0155`), a slight smile.
- **Hair:** very dark brown/black (`#0D0A09`), **uniform colour (no fade)**. Sides down to **mid-ear** (no skin gap above the ear), the back down to the nape, a fuller top shell and a soft fringe of locks across the forehead (`hair: "fringe"`, approved look "v3", 2026-11-05). No loose pieces on top, never receding.
- **Glasses:** rounded soft-rectangle frames in **clear, glass-like acrylic**, with clear lenses (faint tint plus a glint).
- **Lips:** thin and lip-coloured (`#C48F8F`). They only part when talking.
- **Clothes:** **blue polo** (`#2B4F9E`, collar and placket `#22407F`), **black trousers** (`#141417`), dark shoes.
- **Skin shading:** faceted low-poly, like the rest of the world.
- **Proportions:** stylized, with a big head (scaled 1.36×) and a slim build, about 1.7 m.
- **Never:** violet (reserved for Mott), round glasses with a yellow jacket and long hair (too close to @canwebuildthis), or a dark blob mouth.

## Open
- Name (bilingual-friendly, short).
- Voice: Mott keeps Kokoro `am_puck`, so the intern needs a different voice.

## Expression system (since 2026-11-06)
Source of truth: `FACE` presets in `production/remotion/src/brand/person.ts`. They are shared by every person; the review reel is `Host-Expressions`.

**Face rig:**
- **Eyelids:** they share the eye's squash group, so they never clip, the same fix as Mott's. Blinks are seeded every 3–5 s.
- **Brows:** raise, inner tilt, and an asymmetric raise on the left.
- **Lips:** a centre piece plus corner pieces that rotate up (smile) or down (frown). The inner mouth shows when the lips part.
- **Head:** tilt, turn and lean.

**The nine presets:**

| Preset | Face | Body action used in the reel |
|---|---|---|
| neutral | Rest | — |
| curious | One brow up, head tilted | A light lean (35%) |
| surprised | Brows up, eyes wide, mouth open | `surprised` |
| happy | Smiling eyes, smile | `laugh` |
| skeptical | One brow up, one eye narrowed, mouth to the side | — |
| confused | Brows tilted, head tilted | `scratch` |
| worried | Inner brows up, frown | — |
| excited | Brows up, open smile | `talk` |
| thinking | Brows down, lids half closed, head turned | — |
