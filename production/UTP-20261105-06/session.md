# Real grill-me session: "Build me a habit tracker."

Captured 2026-11-11 on this PC. This is the unedited text output of a real session; nothing here was written by us except the two prompts.

- **Tool:** Claude Code 2.1.314, headless mode (`claude -p ... --output-format json`), second round with `--resume`.
- **Skill:** `grill-me` from the plugin `mattpocock-skills@claude-plugins-official`, version 1.3.1 (installed 2026-11-11, user scope).
- **Folder:** a new, empty folder outside the repo. The session created no files.
- **Session id:** `07700227-c430-4cc1-8b85-a45f63fa17fe`
- **Round 1:** 16.5 s. **Round 2:** 20.0 s.
- **Raw JSON:** `captures/grill-me-round1.json`, `captures/grill-me-round2.json` (git-ignored).
- **Limit:** this is text, not a screenshot of a terminal window. On screen it must be typeset from this text without changing a word, and may be cut but not rewritten.

## Round 1

**Prompt (ours):**

```
/mattpocock-skills:grill-me Build me a habit tracker.
```

**Output (real):**

The working directory is empty and not a git repo, so there's no existing code to constrain this. These are the first-round questions. Each one is independent of the others.

❓ **Q1** - **Platform**: Where does this run? The options are a web app (browser), a mobile app (iOS/Android), a desktop app, or a CLI/TUI.

➡️ A web app. It's the fastest to build, it works on phone and desktop, and you can publish and share it as a single page.

---

❓ **Q2** - **Users**: Is this just for you, or do other people need accounts, for example friends or an accountability partner?

➡️ Just you, with no accounts and no login. Adding multi-user support later would be a rewrite, so say now if you want it.

---

❓ **Q3** - **Data storage**: Where do the habit data live? The options are browser-local storage (this device only), a file you can export and import, or a backend database that syncs across devices.

➡️ Browser-local storage, plus JSON export and import as a backup. It needs no server and nothing to host. The downside is that your data won't sync between your phone and your laptop.

---

❓ **Q4** - **Habit types**: What kinds of habits do you track? The options are:
- (a) Binary done/not-done only.
- (b) Also counts or quantities, such as "8 glasses of water" or "30 min reading".
- (c) Also habits that aren't daily, such as "3× per week" or "Mon/Wed/Fri".

➡️ (a) and (c) for v1: daily completion, with a simple schedule of specific weekdays. Quantities add a lot of UI and streak-logic complexity, so I'd leave them out.

---

❓ **Q5** - **Streak rules**: What counts as keeping a streak? Does a missed day always reset it to zero? Do you want a "skip" or "rest day" that doesn't break it? Can you backfill yesterday if you forgot to log it?

➡️ Streaks count only scheduled days, so an unscheduled day never breaks one. Add a manual "skip" that preserves the streak. Allow backfilling any past date. A plain miss resets the streak.

---

❓ **Q6** - **Views**: Which views do you want? The options are:
- (a) A "today" checklist.
- (b) A weekly grid.
- (c) A GitHub-style heatmap calendar per habit.
- (d) Stats and charts, such as completion rate and best streak.

➡️ (a) as the home screen, plus (c) and a few numbers from (d), meaning current streak, best streak and 30-day completion rate. Skip (b) because the heatmap covers it.

---

❓ **Q7** - **Reminders**: Do you want notifications or reminders?

➡️ No for v1. Browser notifications are unreliable without a backend or an installed PWA, and a reminder feature could be added later.

---

Once you've answered, I'll compute the next round. It will cover things that depend on these answers: the habit editing and archiving model, the visual style, the tech stack and how you want it delivered, and what testing you expect.

## Round 2

**Prompt (ours):**

```
Q1 yes. Q2 yes. Q3 no, wait: I want it to sync between my phone and my laptop. Q4 to Q7 yes.
```

**Output (real):**

Settled so far: a single-user web app with no accounts, daily and weekday-scheduled habits, streaks that count only scheduled days (with skip and backfill), a today checklist plus per-habit heatmap and three stats, and no reminders. Your sync requirement changes Q3, and it raises a new question about identity, since sync needs some way to know the data is yours.

Stack, hosting, offline behavior and conflict handling all depend on the sync answer, so they wait for the next round. These questions don't depend on it.

❓ **Q8** - **Sync mechanism**: Which of these do you want?
- (a) A published Claude Artifact with its built-in shared database. It has no server to run and no separate login beyond your Claude account, and it syncs across any device where you open the link. The trade-off is that it only works while the Artifact is hosted on claude.ai, and you'd be tied to that platform.
- (b) A hosted backend such as Supabase or Firebase, with a free tier. It is a real app you control and can host anywhere, but it needs an account setup and a login. A single-user magic link would be enough.
- (c) Sync through a file in a cloud folder (Dropbox, Drive or iCloud). It needs no backend, but browsers can't reliably write to those folders, so it's clunky on a phone.

➡️ (a). It's the least setup for a personal tool, and a habit tracker has little data. Choose (b) if you want something portable that isn't tied to Claude.

---

❓ **Q9** - **Editing and archiving habits**: What should happen when you rename a habit, change its schedule, or stop doing it? For example, if you change "Gym" from Mon/Wed/Fri to Mon/Thu, does the old history keep its old schedule, or is it recalculated under the new one? Does deleting a habit erase its history, or is it archived and hidden?

➡️ Schedule changes apply from that day forward and old history keeps the old schedule, so past streaks don't silently change. "Delete" archives the habit and hides it, and you can restore it. A separate "delete forever" action removes the history.

---

❓ **Q10** - **Day boundary**: When does "today" end? A strict midnight cutoff can be annoying if you log habits after midnight.

➡️ A configurable rollover hour, defaulting to 3 AM. Before that hour, the app still treats it as the previous day. It is easy to build and avoids a classic complaint. Pick plain midnight if you'd rather not have the setting.

---

❓ **Q11** - **Visual style**: What look do you want?
- (a) Minimal and clean.
- (b) Playful and colorful, with per-habit colors or emoji.
- (c) Dense and data-forward.

Also, do you need dark mode?

➡️ (b) in a light touch: each habit gets a color and an optional emoji, and the heatmap uses the habit's color. Dark mode follows the system setting.

---

❓ **Q12** - **Scale and testing**: Roughly how many habits will you track (5, 10, 30+)? How much testing do you expect: just a manual check, or automated tests for the streak logic?

➡️ Assume 5–15 habits. Streak logic is where bugs hide, so I'd write automated tests for it (schedules, skips, backfill, rollover). The UI I'd check by hand.
