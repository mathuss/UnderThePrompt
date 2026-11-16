# UTP-20261105-06 · ES v2: "Adivinó" (Debajo del Prompt)

**Estado:** guion v2, 2026-11-16, para revisar antes de generar voz. Reemplaza a `script_es.md` si el usuario lo aprueba.
**Pedido del usuario:** que tenga historia y una conclusión clara; que Leo presente una idea, que se vea el problema (un contraejemplo), que Mott diga "che, tengo justo lo que necesitás", y que explique cómo funciona y cómo se usa, con dudas de Leo en el medio.
**Todo lo que se ve es real:** el contraejemplo (`counterexample_es.md`, sin grill-me, 2026-11-16) y la sesión con grill-me (`session_es.md`, 2026-11-15). Misma idea en los dos: "Haceme una app para seguir hábitos."

## La historia en una línea
Leo le pide una app a Claude y la tiene en segundos, pero no es la que quería: Claude adivinó. Mott le muestra grill-me, que primero pregunta y después programa, y esta vez sale la app de Leo.

## Diálogo
Planos: siempre los dos juntos. PROJ = proyección de la lámpara arriba, con su etiqueta REAL / REAL TEXT.

| # | Acto | Quién | Línea | En pantalla |
|---|---|---|---|---|
| 1 | La idea | Leo | Mott, tengo una idea: una app para seguir mis hábitos. | — |
| 2 | | Leo | Se la pido a Claude y en un minuto la tengo. | Leo tipea. PROJ (REAL TEXT): `> Haceme una app para seguir hábitos.` |
| 3 | El problema | Leo | ¡Listo! Mañana la uso desde el celu. | PROJ (REAL TEXT): `index.html · 117 líneas · 0 preguntas` |
| 4 | | Mott | Mmm… esa app no sale de esta compu. | PROJ (REAL TEXT, su propio resumen): "los datos quedan en ese navegador y en ese dispositivo." |
| 5 | | Leo | ¿Cómo que no? | — |
| 6 | | Mott | Nunca te preguntó dónde la ibas a usar. Adivinó. | — |
| 7 | La solución | Mott | Pero tengo justo lo que necesitás: grill-me, de Matt Pocock. | PROJ (REAL): captura del repo + "hecho por Matt Pocock · gratis · MIT" |
| 8 | | Leo | ¿Cómo funciona esto? | — |
| 9 | | Mott | Antes de escribir código, te entrevista. | PROJ (REAL TEXT): su primera frase, "Antes de escribir código, necesito cerrar las decisiones…" |
| 10 | | Mott | Cada pregunta trae su respuesta recomendada. Vos decís ok, o la cambiás. | PROJ (REAL TEXT): ronda 1, Q1–Q3 con sus respuestas |
| 11 | | Leo | ¿Y cómo lo uso? | — |
| 12 | | Mott | Lo instalás con un comando… | **PASO 1/2** (REAL TEXT): `claude plugin install mattpocock-skills@claude-plugins-official` |
| 13 | | Mott | …y escribís barra grill-me, con tu idea. | **PASO 2/2**: `/grill-me Haceme una app para seguir hábitos.` |
| 14 | | Leo | La primera, ok. La segunda… no: la quiero en el celu y en la compu. El resto, ok. | Ronda 1 con la pregunta 2 completa (login y sincronización); fichas ok / no / ok, como en la sesión real |
| 15 | | Mott | Y con ese «no», cambió el plan. | PROJ (REAL TEXT): "Con sync entre celu y compu cambia la raíz del árbol." |
| 16 | Conclusión | Leo | O sea que la primera vez… construyó lo que se imaginó. | — |
| 17 | | Mott | Y esta vez, lo que vos querías. Primero preguntas, después código. | Plano general; Mott toca la lámpara. Placa: DEBAJO DEL PROMPT |

- **Duración estimada:** 65–75 s (unas 115 palabras más las pausas para leer los paneles).
- **Estructura:** idea (1–2) → problema real (3–6) → "tengo justo lo que necesitás" (7) → cómo funciona (8–10) → cómo se usa (11–13) → lo prueba y funciona (14–15) → conclusión (16–17).
- **Las dudas de Leo** son las preguntas del espectador: "¿Cómo que no?", "¿Cómo funciona esto?", "¿Y cómo lo uso?", "O sea que…".
- **Cada pregunta de Leo responde a algo que Mott afirmó** (y al revés), para que suene a conversación: Leo dice para qué la quiere (el celu) antes de que Mott le muestre que no se puede.
- **La conclusión** cierra el contraste: la primera vez adivinó, esta vez preguntó.
- **La contra** ("es más lento") sale para mantenerlo simple. Se puede volver a sumar en la línea 17 si hace falta.
- **Crédito:** Matt Pocock dicho en la línea 7 y en el panel; la descripción del post lleva el comando y el link.

## Datos del contraejemplo (verificados)
- Pedido directo en Claude Code, carpeta vacía: **0 preguntas**, un `index.html` de **117 líneas**, 31 s de reloj.
- Guarda todo en `localStorage` (líneas 49 y 51). Su resumen: "los datos quedan en ese navegador y en ese dispositivo".
- No se dice que la app esté mal: hace lo que adivinó. El punto del video es que **no preguntó**.
