# Tools mentioned in the references

Checked on 2026-11-11 against the pages listed under each tool. Star counts are snapshots. **Nothing here is installed or adopted.** Adding any of them is a proposal to the user (project rule 7); creating accounts or paying is the user's click (rule 2).

| Tool | Seen in | Real? | Licence / price | Verdict for us |
|---|---|---|---|---|
| NVIDIA SkillSpector | ref 6 | Yes | Apache-2.0, free | **Worth proposing:** scan the skills we install |
| Cloudflare security-audit-skill | ref 7 | Yes | MIT, free | Not needed now (we ship videos, not a web app). Good topic for an episode |
| Playwright MCP | ref 8 | Yes | Apache-2.0, free | Not needed: the built-in browser pane already covers captures |
| "OpenMotion" | ref 5 | **Name not confirmed.** Closest match: Open Design's Motion + `nexu-io/motion-anything` | Apache-2.0 (both repos) | **Worth evaluating** as a source of motion ideas for panels and end cards; early-stage |
| Higgsfield Content Factory | ref 4 | Yes | Paid plans, credits | **Not recommended** |

## NVIDIA SkillSpector
- **What it is:** a scanner for AI-agent skills. It checks a skill for vulnerabilities, malicious patterns and policy risks before you install it.
- **Facts (repo README):** Apache-2.0. 71 vulnerability patterns in 17 categories (prompt injection, data exfiltration, supply chain, MCP tool poisoning and others). Static analysis plus an optional LLM stage (`--no-llm` for static only). Input: a folder, a single `SKILL.md`, a Git URL or a zip. Output: terminal, JSON and other formats, with a risk score.
- **Install:** `uv tool install git+https://github.com/NVIDIA/skillspector.git` (Python; needs `uv`).
- **Use:** `skillspector scan <path-or-url>`.
- **The statistic it cites:** "Agent Skills in the Wild" (Liu et al., 2026): 42,447 skills collected, 31,132 analysed, 26.1% with at least one vulnerability, 5.2% showing likely malicious intent.
- **Caveat:** one third-party write-up notes that a pass in the static-only mode is a floor, not a guarantee.
- **For us:** this project has third-party skills installed. A one-off scan of the skills folders, plus "scan before installing" as a habit, is a cheap safety step. Needs the user's OK (new tool on the machine).
- **Sources:** https://github.com/NVIDIA/SkillSpector · https://docs.nvidia.com/skills/scanning-agent-skills · https://www.helpnetsecurity.com/2026/08/03/skillspector-open-source-agent-skill-security-scanner/

## Cloudflare security-audit-skill
- **What it is:** a coding-agent skill that runs a multi-phase security audit of a codebase and writes machine-readable, independently verified findings.
- **Facts (repo README):** MIT. Six phases: reconnaissance → coverage-led hunting → candidate validation by a fresh verifier → structured `findings.json` → independent record verification → report. Principle: the agent that checks a finding is never the agent that found it. The README says a single run found roughly half of what repeated runs found.
- **Install:** `npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit` (add `--global` for user level).
- **For us:** no web service to audit today. Its "a different agent tries to disprove each finding" idea is worth borrowing for our own Researcher fact-checks.
- **Sources:** https://github.com/cloudflare/security-audit-skill · https://korben.info/en/cloudflare-launches-ai-security-audit-skill.html

## Playwright MCP
- **What it is:** Microsoft's MCP server that lets an agent drive a browser through Playwright's accessibility tree.
- **Facts:** Apache-2.0. Install for Claude Code: `claude mcp add playwright npx @playwright/mcp@latest`.
- **For us:** the desktop app's browser pane already does page captures and reading. Revisit only if we need scripted, repeatable captures outside the app.
- **Source:** https://github.com/microsoft/playwright-mcp

## "OpenMotion" (ref 5) → Open Design Motion / motion-anything
- **What the video claims:** an open-source library of 1,000+ motion templates in famous-brand styles, usable by any coding agent, free.
- **What I could confirm:**
  - No project or repo called exactly "OpenMotion" turned up on its official pages. A download-aggregator listing uses the name; that is not a primary source.
  - **Open Design** (`nexu-io/open-design`, Apache-2.0 per its site footer) has a **Motion** product page: an AI-assisted workflow where a supported agent (the page names Claude Code and Codex) builds motion graphics from a description and exports the video with an editable source project. The page gives no template count and doesn't say how it renders.
  - **motion-anything** (`nexu-io/motion-anything`, Apache-2.0) is its sibling: 403 motion recipes (77 with live previews), 59 brand packs, 58 video templates; recipes are plain HTML/CSS/JS/WebGL; exports include React, Lottie and MP4. It's at v0.1 with a handful of commits.
- **Not confirmed:** the "1,000+ templates" figure, and that "OpenMotion" is the official name.
- **For us:** our renderer is Remotion + three.js, so these wouldn't replace anything. They could be a **reference library for 2D motion** (panel entrances, counters, end cards) that we re-implement in our own style. Two cautions: brand packs that imitate real companies' styles are a trademark risk for a channel that must look like itself, and the project is very young. A one-hour evaluation is the right first step, with the user's OK.
- **Sources:** https://open-design.ai/solutions/video/ · https://github.com/nexu-io/open-design · https://github.com/nexu-io/motion-anything

## Higgsfield Content Factory
- **What it is:** a paid AI video generator. You pick a viral video as a format reference, give a topic, set length and episode count, and it generates a faceless explainer. Also reachable from Claude through Higgsfield's MCP.
- **Facts:** paid plans only; generation costs credits that scale with length and episodes. Higgsfield says the reference guides format and pacing and the story is new.
- **Why not for us:**
  1. It replaces exactly what makes the channel recognisable: our own characters, set and look ("consistency over novelty").
  2. Generated visuals can show things that never happened; our rule 4 needs real captures or labelled schematics, and a source for every claim.
  3. Starting from someone else's viral video is too close to recreating a reference.
  4. It costs money per video, and ref 4 is a sponsored post.
- **Sources:** https://higgsfield.ai/blog/higgsfield-introduces-content-factory · https://www.usermag.co/p/my-journey-into-the-slop-factory (a critical view)
