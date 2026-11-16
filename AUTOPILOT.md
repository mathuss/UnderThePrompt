# Autopilot: de la investigación a YouTube sin intervención

**Estado:** propuesta, 2026-11-16, para el OK del usuario (regla 7: cambio de arquitectura). Nada de esto está construido todavía.
**Pedido:** "completar el pipeline automatizado de YouTube, desde research y guion hasta animación con criterios de aceptación y subida. 100% automático, sin mi input."
**Alcance:** solo español (Debajo del Prompt), solo YouTube. TikTok (Metricool) e Instagram se suman después con el mismo paquete.

## 1. Qué ya existe y qué falta
| Etapa | Hoy | Falta para que sea automática |
|---|---|---|
| Investigación | ✅ Researcher diario (07:11), guiones verificados con fuentes | Que escriba en el formato de historia (ver §3) |
| Guion de diálogo | ❌ Lo escribí a mano con vos (P5) | Un escritor automático con las reglas del playbook y tus correcciones |
| Evidencia real | ❌ Sesiones, capturas y comandos hechos a mano | Captura automática: páginas (Chrome sin ventana), terminal (`claude -p`, `curl`), citas textuales |
| Animación | ⚠️ Cada episodio es un archivo de código propio | **Un renderizador genérico** que arma cualquier episodio desde un archivo de datos |
| Voz, música, efectos, mezcla | ✅ ElevenLabs, sonido propio, −14 LUFS | Efectos generados desde el mismo archivo de datos |
| Control de calidad | ❌ Lo hacías vos mirando | **Criterios de aceptación automáticos** (§4) |
| Subida | ✅ Script de YouTube público/programado | Metadatos y portada automáticos, horario, registro |
| Disparo | ⚠️ Solo el Researcher está programado | Una tarea programada nueva: "productor" |

## 2. El flujo
```
07:11  Researcher (ya existe) → guiones verificados en research/scripts/
09:00  Productor (nuevo, tarea programada, todos los días)
  1. Elige el mejor guion en cola que pase el filtro de "filmable" (tiene evidencia real capturable).
  2. Reescribe en diálogo (episode.json) con la estructura de historia y el playbook.
  3. Captura la evidencia real (capturas, sesiones de terminal, citas) y re-verifica las fuentes ese día.
  4. Gate A (guion y hechos). Si falla: corrige hasta 2 veces; si sigue fallando, descarta y prueba el siguiente guion.
  5. Voz (ElevenLabs) → Gate B (audio).
  6. Render (renderizador genérico) + música, efectos y mezcla → Gate C (imagen) y Gate D (técnico).
  7. Metadatos, portada (plantilla), descripción con fuentes y crédito.
  8. Sube a YouTube, programado a las 19:00 ART del mismo día. Registro en publication_log.md.
  9. Informe del día en publishing/runs/AAAA-MM-DD.md: qué publicó, qué descartó y por qué.
```
Si ningún guion pasa todos los gates, **no publica nada ese día** y lo anota. Nunca publica algo que falló un gate.

## 3. Formato del episodio (datos, no código)
Un archivo `production/<ID>/episode.json` describe todo: líneas (quién, texto, etiqueta de actuación, pausa), qué panel acompaña cada línea y de dónde sale (captura, cita textual, comando, número, lista de preguntas), la portada y los metadatos. Un solo componente de Remotion lo convierte en video: elige los planos solo (panel → plano con proyección; pregunta de Leo → plano frontal; cierre → general con el toque de lámpara), con las cámaras, transiciones, manos, ciudad y paneles que ya ajustamos.

**Estructura obligatoria de la historia** (tus correcciones de P5):
1. Leo presenta una idea o una situación.
2. El problema real, mostrado con evidencia real (un contraejemplo, un incidente, un dato).
3. Mott: "tengo justo lo que necesitás" (o el giro equivalente, sin "che" de la nada).
4. Cómo funciona, con las dudas de Leo ("¿cómo funciona esto?").
5. Cómo se usa o qué hacer (pasos, si hay).
6. Conclusión que cierra el contraste del punto 2.

## 4. Criterios de aceptación (lo que reemplaza tu mirada)
**Gate A · Guion y hechos**
- Cada afirmación del guion está en las notas de fuentes, y la fuente se vuelve a abrir el día de producción: sigue online y dice lo mismo.
- Cada panel "real" tiene su archivo de captura y su URL. Nada inventado: si no se puede capturar, el panel no va.
- Estructura de §3 presente; conclusión que retoma el problema.
- Diálogo: líneas ≤ 12 palabras salvo excepción marcada; nadie dice más de 2 líneas seguidas; cada pregunta de Leo responde a algo que se dijo; nada de "che" sin motivo; español rioplatense correcto (lo revisa un segundo agente que solo busca errores de idioma y frases que no suenan naturales).
- El creador de la herramienta o la fuente del hallazgo se nombra.
- Duración estimada 55–85 s.

**Gate B · Audio**
- La voz se vuelve a transcribir (ElevenLabs Speech-to-Text) y se compara con el guion: ninguna palabra de más (por ejemplo, una etiqueta leída en voz alta), ninguna faltante.
- Sin silencios largos fuera de las pausas previstas; −14 LUFS ± 1; pico ≤ −1 dB.

**Gate C · Imagen** (un agente revisor mira 12 cuadros con una rúbrica fija, como el que usamos)
- Ningún texto cortado ni fuera de su panel; ningún panel tapa la cara de Leo; los dos personajes en cuadro; nada pisa la barra de arriba ni los botones de la derecha; nada de etiquetas internas ni líneas de fuente en pantalla; la ciudad se ve; nada roto (manos, anteojos, objetos atravesados).
- Si falla, se corrige el dato del panel (tamaño, recorte) y se vuelve a renderizar, hasta 2 veces.

**Gate D · Técnico**
- 1080×1920, 30 fps, H.264 + AAC, duración igual a la prevista ± 1 s, sin cuadros negros.
- Título ≤ 100 caracteres, descripción con fuentes, comando (si hay), crédito y la aclaración de voces con IA.
- La subida verifica el canal (Debajo del Prompt) antes de subir.

## 5. Seguridad del piloto automático
- **Freno de mano:** si existe el archivo `publishing/PAUSE`, el productor no sube nada. Vos (o yo, si me lo pedís) lo creás con un mensaje.
- **Tope:** 1 video por día (ritmo diario, decidido por el usuario el 2026-11-16).
- **Presupuesto:** ≤ 1.500 caracteres de ElevenLabs por video, más la transcripción. Con el plan Creator (unos 121.000 créditos por mes) alcanza para unos 30 videos por mes, justo para el ritmo diario: hay que vigilarlo.
- **Arranque seguro:** las 2 primeras corridas suben como **no listado**; si salen bien, pasa solo a público a partir de la tercera.
- Las reglas siguen: fuentes (4), música propia (5), nada de cuentas ni pagos nuevos (2), crédito a los creadores.

## 6. Cosas que tenés que hacer vos una sola vez
1. **Pasar la app de Google a "producción"** (Google Cloud → OAuth consent screen → Publish app). En modo prueba, Google vence el permiso cada 7 días y el piloto se cortaría solo. Para uso propio no hace falta la revisión de Google.
2. Dejar la app de Claude abierta y la PC prendida a la hora del productor (las tareas programadas solo corren así).
3. ~~Decidir el ritmo~~ **Decidido el 2026-11-16: todos los días**, 19:00 hora de Argentina.

## 7. Fases de construcción
1. **Renderizador genérico + episode.json.** Prueba: rehacer P5 desde datos y que salga igual al publicado.
2. **Escritor y capturador** (skill "producer"): de un guion del Researcher a episode.json con evidencia real. Prueba: el guion de Bitly del 2026-11-16.
3. **Gates A–D** con sus informes.
4. **Subida automática + tarea programada + freno de mano.** Dos corridas no listadas.
5. **En marcha:** público automático.

## 8. Riesgos que quedan
- Un error de contenido puede salir publicado: los gates lo bajan mucho, no a cero. El informe diario y el freno de mano son la red.
- Hay temas difíciles de mostrar con evidencia real sin intervención (por ejemplo, algo que requiere una cuenta paga): esos se descartan solos.
- La calidad de la voz no se puede juzgar automáticamente más allá de "dice lo que tiene que decir".
