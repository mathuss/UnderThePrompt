# UTP-20261105-06 · ES: "Que te pregunte primero" (Debajo del Prompt)

**Estado:** guion v1 en español, 2026-11-15. Escrito en rioplatense, no traducido. Parte de la v2 en inglés (`script_v2.md`) y suma lo que pidió el usuario: que sea más útil para quien usa Claude, con **cómo instalarlo y usarlo**.
**Marca:** Debajo del Prompt (el canal arranca en español; "Under the Prompt" queda en pausa porque el nombre ya existe en YouTube, ver `publishing/channels-plan.md`).
**Sesión real en pantalla:** `session_es.md` (2026-11-15, en español). **Comando verificado:** `/grill-me` funciona escrito así en Claude Code.

## Diálogo
Planos: siempre los dos juntos (2S lateral, 2S frontal, o 2S lateral bajo una proyección). Pasos con barra "PASO 1/3".

| # | Quién | Línea | Plano | En pantalla |
|---|---|---|---|---|
| 1 | Leo | Mott. Con un solo prompt, Claude me arma la app. | 2S frontal | — |
| 2 | Mott | Antes de que escriba código… probá grill-me, de Matt Pocock. | 2S + PROJ | **REAL:** captura del repo + "hecho por Matt Pocock · /grill-me · gratis · licencia MIT" |
| 3 | Leo | ¿Y cómo lo instalo? | 2S frontal | — |
| 4 | Mott | Un comando, en Claude Code. | 2S + PROJ | **PASO 1/3 · instalar** (REAL TEXT): `claude plugin install mattpocock-skills@claude-plugins-official` y la respuesta real "✔ Successfully installed plugin…" |
| 5 | Mott | Después escribís barra grill-me, y tu idea. | 2S + PROJ | **PASO 2/3 · usar**: `/grill-me Haceme una app para seguir hábitos.` (se tipea) |
| 6 | Leo | ¡Pará! ¿Me está haciendo preguntas? | 2S + PROJ | **REAL TEXT:** ronda 1, su primera frase y Q1–Q3 |
| 7 | Mott | Seis. Y cada una trae su respuesta recomendada. | 2S + PROJ | Se encienden las respuestas |
| 8 | Leo | Ok… ok… no. Quiero que se sincronice. | 2S + PROJ | **PASO 3/3 · responder**: chips ok / ok / no |
| 9 | Mott | Y con ese «no», cambió el plan. | 2S + PROJ | **REAL TEXT:** la ronda 2 abre con "Con sync entre celu y compu cambia la raíz del árbol." |
| 10 | Leo | ¿Y cuándo escribe código? | 2S frontal | — |
| 11 | Mott | Cuando no queda ninguna decisión abierta. | 2S + PROJ | **REAL TEXT:** "Antes de escribir código, necesito cerrar las decisiones de la raíz del árbol." (su propia frase en la ronda 1) |
| 12 | Leo | Es más lento. | 2S frontal | — |
| 13 | Mott | Más lento. Pero arma tu app, no la que se imaginó. | 2S lateral, después plano general | Placa final: "/grill-me de Matt Pocock · gratis · MIT" · "Comando y fuentes en la descripción." |

- **Palabras:** unas 75. Duración estimada: 55–60 s con las pausas de lectura.
- **El número:** "seis", las preguntas reales de la ronda 1 en español.
- **La contra** (12–13): es más lento. Dicho en diálogo.
- **Crédito:** Matt Pocock dicho en la línea 2, en el panel, en el título del paso 1 y en la placa final. Su foto no se usa.
- **Por qué sirve a usuarios de Claude:** los tres pasos se pueden copiar de la pantalla, y la descripción del post lleva el comando para copiar y pegar.

## Descripción del post (borrador, va en el paquete de aprobación)
> ¿Le pedís una app a Claude en un solo prompt? Probá que te pregunte primero.
>
> grill-me es una skill gratuita (licencia MIT) de Matt Pocock: antes de escribir código te entrevista, con cada pregunta acompañada de su respuesta recomendada.
>
> Instalarla en Claude Code:
> claude plugin install mattpocock-skills@claude-plugins-official
> Después: /grill-me + tu idea
>
> Repo: github.com/mattpocock/skills
> Voces generadas con IA. La sesión que se ve es real (2026-11-15).

## Fuentes
- Repo y README: https://github.com/mattpocock/skills (MIT, autor Matt Pocock; captura de la página 2026-11-12).
- Comando de instalación: README del repo; lo corrimos el 2026-11-12 y respondió "✔ Successfully installed plugin: mattpocock-skills@claude-plugins-official (scope: user)".
- Comportamiento (rondas, respuesta recomendada, no actúa hasta cerrar las decisiones): `skills/productivity/grilling/SKILL.md`.
- Sesión: `session_es.md`.
