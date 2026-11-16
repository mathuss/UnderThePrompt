# Contraejemplo real: la misma idea, sin grill-me

Capturado el 2026-11-16 en esta PC, para la versión en español. Misma idea que `session_es.md`, pero pedida directo, sin la skill.

- **Comando:** `claude -p "Haceme una app para seguir hábitos." --permission-mode acceptEdits` en una carpeta nueva y vacía.
- **Resultado:** 2 turnos, 24.2 s de trabajo del modelo (31 s de reloj). **Cero preguntas.** Creó un solo archivo, `index.html`, de **117 líneas**.
- **Dónde guarda los datos:** `localStorage` (líneas 49 y 51 del archivo). Su propio resumen lo dice: los datos quedan "en ese navegador y en ese dispositivo". No sincroniza con el celular.
- **Archivos:** `captures/sin-grill-me.json` (respuesta completa) y `captures/sin-grill-me_index.html` (el código que escribió), ignorados por git.

## Respuesta (real, sin editar)

Hice la app de hábitos como un único archivo, sin dependencias. No la abrí en un navegador, así que todavía no la probé.

**Archivo:** `C:\Users\Thiago\AppData\Local\Temp\claude\9d46c02e97810c7c\b24be3f8-44b9-4233-ab85-ca1d2b0de739\scratchpad\habitos-sin-grill\index.html`

Para usarla, abrí el archivo con doble clic en cualquier navegador.

**Qué hace**
- **Agregar y eliminar hábitos.** Al eliminar uno te pide confirmación.
- **Marcar hoy.** Es el círculo verde al lado de cada hábito.
- **Racha de días seguidos** (🔥). Si todavía no marcaste hoy, la racha sigue contando desde ayer.
- **Vista de los últimos 7 días.** Podés tocar cualquier día para marcarlo o desmarcarlo, por ejemplo si te olvidaste de anotar uno.
- **Resumen del día**, tipo "Hoy: 2 de 4 completados".
- **Modo oscuro automático** y diseño que se adapta al celular.
- **Datos en el navegador** (localStorage). No hay cuenta ni servidor, y los datos quedan en ese navegador y en ese dispositivo.

Si querés, le agrego recordatorios, hábitos que solo van ciertos días de la semana, estadísticas mensuales, o la publico como página para abrirla desde el celular.
