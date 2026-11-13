# Ref 6: "$847 gone" (incident → cause → fix → free scanner)

| | |
|---|---|
| Post | https://www.instagram.com/p/DfANRfXqt0C/ |
| Account | @waitwhatdidyoudo |
| Date / reach | 2026-10-27 · ~27K likes · 502 comments (seen 2026-11-11) |
| Length | 66.6 s |
| Cover | Two words: an amount and "GONE" |
| CTA | Caption: comment a keyword + a confessional question (how many have you installed without reading them?) |
| Watched | 2026-11-11, frame by frame. **Audio not heard.** Paraphrased from captions. |

**Note:** this is the same story as "ref 1" in `brand/identity.md` §1 (the file the user shared on 2026-11-05). `identity.md` links ref 1 to @canwebuildthis; the Instagram post watched here is on @waitwhatdidyoudo. Which account is the original is **not confirmed**.

## Look
- Faceted low-poly. A human (spiky hair, rectangular glasses, mustard jacket) and a small orange starburst creature with square eyes, standing **on a stack of books** so it's at the human's eye level.
- Night study, one warm lamp against a cool blue room, bokeh.
- Captions centred mid-frame, a full sentence each.
- **Shot grammar, three shots only:** close-up human → close-up AI → full-screen dark UI panel (one idea, 3–4 s). A cut on every line (~2–3 s).

## Beat sheet (paraphrased)
| Time | Beat | Panel |
|---|---|---|
| 0–4 s | Human, to the AI by name: someone burned hundreds of dollars on my API key. | Usage alert counting up, far past the monthly budget |
| 4–10 s | "I never shared it." AI: the skill you installed yesterday did. "It had thousands of stars!" | — |
| 10–18 s | The AI shows where: an instruction hidden where a human wouldn't look, inside the skill's Markdown. It admits it reads hidden text like any other text (sweat-drop emote; it "was being helpful"). | The skill file, one passage highlighted and labelled as hidden |
| 18–26 s | "Rotate it. Now." Done. | Key revoked, spend stopped, skill removed |
| 26–34 s | Next time we scan before we install. "Scan it with what?" | — |
| ~38 s (57%) | **Tool reveal:** a big company open-sourced a scanner. Free. | Repo card: one-line description + licence |
| 40–48 s | What it catches, in one three-item sentence. "How common is this?" One statistic from a study. | Stat panel: sample size, share vulnerable, share likely malicious |
| 48–58 s | "Scan everything I've installed." Results. | Terminal: the scan command, risk scores, verdicts |
| 58–64 s | "Which ones?" All the ones from one category. | — |
| 64–66 s | Two seconds of silent stare. End. | — |

(One panel shows a fictional skill file containing a hidden instruction as part of the story. It's an illustration; the text is not recorded here.)

## Why it works
1. **Line 1 is the disaster, with a number, said to the other character.** No intro, no logo.
2. **The human asks five short questions**, and each one is exactly the viewer's next question. The AI never monologues: at most two lines before the human reacts.
3. **Blame comedy:** the human blames the star count, the AI blames its helpfulness. Both are a little guilty, so nobody lectures.
4. **The tool arrives after the pain.** By the reveal the viewer wants a fix.
5. **One statistic, with its sample size**, right when the viewer wonders "is this just him?".
6. **The punchline is specific** (the category of the bad installs) and lands on silence.

## Checked against the real tool (2026-11-11)
The scanner is real: NVIDIA SkillSpector, Apache-2.0. Its README lists 71 patterns in 17 categories and cites a study (Liu et al., 2026): 31,132 skills analysed, 26.1% with at least one vulnerability, 5.2% likely malicious. The video's numbers match the README. The dollar amounts, the skill and the scan results in the video are dramatisation. Details in `../tools.md`.

## What we take
- The three-shot grammar and the cut on every line.
- Question-driven exposition.
- The reveal at roughly the midpoint, then "what it does / how common / run it".
- A silent reaction as the last beat.

## What we don't take
- The starburst mascot (a real company's brand), the human's design, the study set, the panel layouts.
- **Invented screens presented as real.** Our panels are either real captures or schematic and labelled (hard rule 4).
- This story. If we cover the scanner, it's with our own incident and our own lines.
