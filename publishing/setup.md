# Setup: cuentas de Debajo del Prompt y subida automática

**Estado:** guía, 2026-11-16. Las cuentas, contraseñas, verificaciones, términos y permisos OAuth los hacés vos (regla 2); yo te abro cada página, te digo qué tocar y preparo todo lo demás. **La subida automática nunca publica sin tu `approve UTP-…`** (regla 1): los scripts suben como privado/programado o como borrador.

Orden recomendado: **YouTube primero** (es la API más simple y no pide revisión), después **Instagram**, después **TikTok** (su API exige aprobación de la app).

---

## Parte A · Crear las cuentas (vos)

### A0. Antes de empezar
- Un mail para la marca (por ejemplo, un alias de tu Gmail: `tuusuario+debajodelprompt@gmail.com`). Lo usás en TikTok e Instagram.
- Tu gestor de contraseñas a mano y el celular para los códigos.
- Activá la verificación en dos pasos en cada cuenta y guardá los códigos de recuperación.

### A1. YouTube: canal "Debajo del Prompt"
1. Entrá a https://www.youtube.com con tu cuenta de Google.
2. Avatar → **Configuración** → **Agregar o administrar tus canales** → **Crear un canal**. Así se crea como **cuenta de marca** (separada de tu perfil personal y con administradores posibles).
3. Nombre: **Debajo del Prompt**. Handle: **@debajodelprompt** (estaba libre el 2026-11-15; si no, `@debajo.del.prompt`).
4. Personalizar: foto (`brand/logo/drafts/Logo-Eyespot.png`), banner (lo exporto en español cuando lo confirmes) y descripción (`publishing/channels-plan.md` §3).
5. **Verificá el canal con tu teléfono** (https://www.youtube.com/verify): habilita videos de más de 15 min y miniaturas propias.

### A2. Instagram: cuenta profesional + página de Facebook
1. App de Instagram → crear cuenta nueva **@debajodelprompt** con el mail de la marca.
2. Configuración → **Tipo de cuenta y herramientas** → **Cambiar a cuenta profesional** → **Empresa** (Business). Categoría: "Medio de comunicación" o "Creador de contenido digital".
3. Creá una **página de Facebook** "Debajo del Prompt" (https://www.facebook.com/pages/create) y **vinculala** a la cuenta de Instagram (Centro de cuentas). Hace falta para subir videos directo desde la PC por API, sin tener que alojarlos en internet.
4. Bio y foto (`publishing/channels-plan.md` §3).

### A3. TikTok: cuenta Business
1. App de TikTok → registrarte con el mail de la marca → usuario **@debajodelprompt**.
2. Configuración → Cuenta → **Cambiar a cuenta de empresa**. Categoría: "Educación" o "Ciencia y tecnología".
3. Bio y foto (`publishing/channels-plan.md` §3).

---

## Parte B · Subida automática (vos das los permisos, yo escribo los scripts)

Las claves y tokens van en `.secrets/` (ignorada por git), nunca en el repo ni en el chat.

### B1. YouTube Data API (recomendado empezar acá)
**Hecho el 2026-11-16:** proyecto, cliente OAuth de escritorio y permiso dados; `tools/upload_youtube.py` conectado al canal Debajo del Prompt (@debajodelprompt). Primera subida de prueba en privado: OK.
**Qué permite:** subir el video desde la PC con título, descripción, portada y **programarlo** (`privacyStatus: private` + `publishAt`). Ojo: si un script no indica la privacidad, YouTube lo publica como público por defecto; nuestro script siempre la fija.
1. https://console.cloud.google.com → **Crear proyecto** "debajo-del-prompt".
2. **APIs y servicios → Biblioteca → YouTube Data API v3 → Habilitar.**
3. **Pantalla de consentimiento OAuth:** tipo **Externo**, nombre "Debajo del Prompt uploader", tu mail; en **Usuarios de prueba** agregá tu cuenta de Google.
4. **Credenciales → Crear credenciales → ID de cliente OAuth → App de escritorio.** Descargá el JSON y guardalo como `.secrets/youtube_client.json`.
5. Yo escribo `tools/upload_youtube.py`; la primera vez se abre el navegador y **vos aceptás el permiso** `youtube.upload` para el canal Debajo del Prompt. El token queda en `.secrets/`.
- Límites: cada subida cuesta 1 unidad del cupo de subidas (100 por día). Según la documentación actual, los proyectos no verificados ya **no** quedan forzados a privado; lo comprobamos con una subida de prueba privada.
- A verificar: con la app en modo "prueba", Google puede vencer el permiso a los 7 días; si pasa, se pasa la app a "producción" (para uso propio no requiere revisión de Google para este permiso, lo confirmamos en el momento).

### B2. Instagram (API de Instagram con inicio de sesión de Facebook)
**Qué permite:** publicar el Reel desde la PC con subida directa del archivo (`upload_type=resumable`), sin alojarlo en internet. Límite: 100 publicaciones por API cada 24 h (la página tiene una cifra contradictoria de 50; da igual a nuestro ritmo).
1. https://developers.facebook.com → **Mis apps → Crear app** → tipo **Empresa**.
2. Agregá **Facebook Login for Business** y el producto **Instagram**.
3. Permisos: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`.
4. Con la app en modo desarrollo, tu cuenta (que es administradora) puede publicar en tu propio Instagram. Si la página pide **Page Publishing Authorization**, completala.
5. Yo escribo `tools/upload_instagram.py`; vos iniciás sesión y das el permiso una vez.
- Instagram no programa por API: el script publica cuando lo aprobás (o a la hora acordada si lo dejamos corriendo).

### B3. TikTok (Content Posting API, ruta "Upload": a borradores)
**Qué permite:** mandar el video a tu bandeja de TikTok como borrador; **vos tocás "Publicar" en la app**. Es la ruta que no exige auditoría de publicación directa (sin auditoría, la publicación directa queda forzada a privada).
1. https://developers.tiktok.com → registrarte como desarrollador → **crear app**.
2. Agregá **Login Kit** y **Content Posting API** con el permiso `video.upload`.
3. TikTok pide una revisión de la app para aprobar el permiso: suele pedir un sitio web, política de privacidad y un video de demostración. Lo preparo yo (una página simple) cuando lleguemos.
4. Yo escribo `tools/upload_tiktok.py` (subida `FILE_UPLOAD` desde la PC, sin verificar dominio).

---

## Parte C · Cómo queda el flujo
1. El Researcher propone, el Producer arma el video, yo armo el paquete en `publishing/approvals/`.
2. Vos escribís `approve UTP-…`.
3. Yo corro los scripts: YouTube programado a la hora acordada, Instagram publicado a esa hora, TikTok como borrador para que lo publiques vos. Todo se anota en `publishing/publication_log.md`.

## Fuentes (leídas el 2026-11-16)
- YouTube `videos.insert` (privacidad por defecto, proyectos no verificados, cupo, permisos): https://developers.google.com/youtube/v3/docs/videos/insert
- Instagram publicación de contenido (rutas de inicio de sesión, permisos, subida reanudable, límites): https://developers.facebook.com/docs/instagram-platform/content-publishing
- TikTok subida a borradores (permiso `video.upload`, FILE_UPLOAD vs PULL_FROM_URL): https://developers.tiktok.com/doc/content-posting-api-get-started-upload-content
- Detalles anteriores y advertencias: `PLAN.md` §6
