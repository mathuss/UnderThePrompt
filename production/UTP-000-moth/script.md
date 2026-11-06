---
id: UTP-000-moth
topic: "The 1947 moth in the Harvard Mark II, the 'first actual case of bug being found'"
status: proposal          # sample script for the brand pilot; not queued, not produced
created: 2026-11-05
series: "Night Log #000 / Bitácora #000 (pilot: why the host is a moth)"
target_duration: 60s
sources:
  - url: https://www.si.edu/object/log-book-computer-bug:nmah_334663
    type: primary (Smithsonian NMAH object record)
    checked: 2026-11-05
    note: >-
      The page sits behind a bot check, so it couldn't be opened directly. Its catalogue text, quoted in search results,
      supports: 1947; Relay #70, Panel F; the moth was taped into the log; the log book was probably not Hopper's;
      "bug" and "debug" soon became standard programmer language.
  - url: https://www.computerhistory.org/tdih/september/9/
    type: primary (Computer History Museum, "This Day in History")
    checked: 2026-11-05
    note: September 9, 1947; Harvard Mark II; moth caught between relay contacts; "First actual case of bug being found" written in the log; Grace Hopper was present.
  - url: https://spectrum.ieee.org/did-you-know-edison-coined-the-term-bug
    type: secondary (IEEE Spectrum, history column)
    checked: 2026-11-05
    note: Edison used "bug" for technical faults in 1878 letters, so the term predates computers.
demo_requirements: "None. Archival photo of the log page: the US Navy (NHHC) photo NH 96566-KN is a US-government work, public domain. Downloading it needs the user's OK."
---

# UTP-000: The first *actual* bug

## Fact checks (what we can and can't say)
- ✅ **Date:** September 9, 1947. Some sources say 1945; the 1947 date is the one the Smithsonian and CHM use.
- ✅ **Machine and place:** Harvard Mark II, built from electromechanical relays.
- ✅ **What was found:** a moth caught in a relay (Relay #70, Panel F), which the team taped into the logbook.
- ✅ **The note:** "First actual case of bug being found."
- ✅ **"Bug" was older:** Edison used it in 1878. That's why the note is a joke: an *actual* bug.
- ✅ **Grace Hopper** was on the team and helped make the story famous. She did **not** personally find the moth, and the log book was probably not hers. Don't say she found it.
- ✅ **The log page is kept by the Smithsonian** (National Museum of American History). Don't say it's on display unless re-verified.
- ❌ **Avoid:** machine weight, relay counts, "the first bug ever", "Hopper invented debugging".

## Structure
| Beat | Time |
|---|---|
| Hook | 0–3 s |
| Context | 3–12 s |
| Development | 12–45 s (including the "lamp or fire" beat) |
| Payoff | 45–55 s |
| Ending | 55–62 s |

---

## EN: narration (Mott, `am_puck` @ 1.05)

**HOOK**
> In 1947, a moth made a computer fail. I'm a moth. We need to talk about it.

**CONTEXT**
> This is the Harvard Mark II. A room full of relays: little metal switches that click open and shut to do math.

**DEVELOPMENT**
> On September 9th, it started giving wrong answers. So the team searched it, relay by relay… and found her. A moth, stuck between the contacts.
>
> And they did the most engineer thing possible: they taped her into the logbook, and wrote: "First actual case of bug being found."
>
> Here's the part nobody tells you. They didn't invent the word. Engineers already called glitches "bugs". Edison wrote it in 1878. That's the joke: an *actual* bug.
>
> Bright light. Let's check if it's a lamp or a fire. No, Grace Hopper didn't pull it out. She was on the team, and she helped make the story famous.

**PAYOFF**
> So the most famous bug in history wasn't the first bug. Just the first one with wings. That page is kept at the Smithsonian today. Moth included.

**ENDING**
> Every time you debug something… you're talking about my family. Stay curious. Not too close to the light.

*(~170 words, ≈ 60–64 s at Puck 1.05. Measure after TTS and trim if it runs over 65 s.)*

---

## ES: narración (Mott; voz por definir)

**HOOK**
> En 1947, una polilla hizo fallar una computadora. Yo soy una polilla. Tenemos que hablar.

**CONTEXTO**
> Esta es la Harvard Mark II. Una sala llena de relés: interruptorcitos de metal que se abren y se cierran para hacer cuentas.

**DESARROLLO**
> El 9 de septiembre empezó a dar resultados mal. El equipo la revisó relé por relé… y la encontró. Una polilla, atrapada entre los contactos.
>
> E hicieron lo más ingeniero del mundo: la pegaron con cinta en el cuaderno de registro y anotaron: "Primer caso real de bug encontrado".
>
> Acá viene la parte que nadie cuenta. La palabra no la inventaron ahí. Los ingenieros ya les decían "bugs", bichos, a las fallas. Edison la usaba en 1878. Por eso el chiste está en "real".
>
> Mucha luz. Veamos si es lámpara o incendio. No, Grace Hopper no la sacó con sus manos. Estaba en el equipo y ayudó a que la historia se hiciera famosa.

**PAYOFF**
> O sea: el bug más famoso de la historia no fue el primero. Fue el primero con alas. Esa página se guarda hoy en el Smithsonian. Con polilla y todo.

**CIERRE**
> Cada vez que hacés debug… estás hablando de mi familia. Seguí curioso. Pero no tan cerca de la luz.

*(The ES quotes the logbook note in translation. On screen, the real note stays in English, with a subtitle translation.)*
