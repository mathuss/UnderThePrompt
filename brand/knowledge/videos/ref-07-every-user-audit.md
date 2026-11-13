# Ref 7: "every user" (same template as ref 6, different incident)

| | |
|---|---|
| Post | https://www.instagram.com/p/De9bqWtoARc/ |
| Account | @waitwhatdidyoudo |
| Date / reach | 2026-10-26 · ~39K likes · 862 comments (seen 2026-11-11) |
| Length | 63.2 s |
| Cover | Two words: "EVERY USER" |
| CTA | Caption: comment a keyword + a question |
| Watched | 2026-11-11, frame by frame. **Audio not heard.** Paraphrased from captions. |

Same set, same two characters, same shot grammar as ref 6. **This is the point:** the series is a template, and only the incident and the tool change.

## Beat sheet (paraphrased)
| Time | Beat | Panel |
|---|---|---|
| 0–4 s | Human: someone is downloading every one of our users. | Live request log: one endpoint, thousands of hits, no auth, all successful |
| 4–8 s | We've only been live a few hours. | — |
| 8–14 s | AI: the endpoint doesn't check who's asking. | Code file with one line highlighted: a to-do where the auth check should be |
| 14–20 s | "You wrote that endpoint!" The AI: you told me to just make it work, and it works very well. | — |
| 20–27 s | Lock it down and find what else you missed. The AI admits it's bad at checking its own homework. | — |
| ~28 s (44%) | **Tool reveal:** a big company open-sourced the audit skill behind its own bug hunting. | Repo card: name, licence |
| 30–36 s | Install. | Terminal: the one-line install command typed out, then a tick |
| 36–46 s | "What does it actually do?" Three steps: map the app, send hunters at every input, a *different* agent tries to disprove each finding. | — |
| 46–52 s | "And?" Results. | Findings table: confirmed / needs validation / rejected |
| 52–60 s | Want me to run it again? "Why again?" Their own notes say one run finds about half. | — |
| 60–63 s | Then run it before every launch. Cut to the **first wide shot of the whole room**. End. | — |

## What's new compared with ref 6
1. **The AI shares the blame** and says so with a dry line. The human's vague instruction is the real cause. Relatable for anyone who has typed "just make it work".
2. **The limit is the ending.** The honest caveat (one run isn't enough) becomes the final beat and the takeaway. The honesty beat doesn't slow the video; it closes it.
3. **The set is revealed last.** Sixty seconds of close-ups, then one wide shot as a full stop.
4. The reveal comes slightly earlier (44%) because the install is shown on screen.

## Checked against the real tool (2026-11-11)
Real: `cloudflare/security-audit-skill`, MIT. The install command in the video matches the README. The README describes six phases, a rule that the agent checking a finding is never the one that found it, and says a single run found roughly half of what repeated runs found. The request log, the code and the findings table in the video are dramatisation. Details in `../tools.md`.

## What we take
- A fixed template per series: same set, same shots, new incident.
- The caveat as the closing line.
- Holding the wide shot for the last second.

## What we don't take
- Characters, set, panels, lines, the incident.
