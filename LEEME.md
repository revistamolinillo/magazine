# El Molinillo Magazine (versión mejorada)

Se sube igual que la anterior: copia todo el contenido de esta carpeta a tu hosting
(GitHub Pages, etc.) sustituyendo los archivos. La carpeta `data/` (revista.json,
hemeroteca.json, ediciones...) es la tuya, sin cambios.

## Comprobación rápida tras subirlo
La carpeta `js/` debe tener **10 archivos**: app.js, buscador.js, galeria.js, multimedia.js,
navegacion.js, render.js, renderNoticias.js, renderPodcasts.js, utils.js, vistas.js.
Si falta alguno, la pantalla de carga te dirá cuáles.
Si ves una versión antigua: Ctrl+Shift+R, o en las herramientas del navegador
(Application > Storage) "Clear site data".

## Qué tocar y dónde
- `data/config.js`: correo de contacto, enlace de "Añadir noticia", Instagram
  (déjalo en "" hasta que exista el perfil), nombre del centro.
- `css/styles.css`: colores de las secciones (busca "Un color por sección") y tipografías.
- `service-worker.js`: **cada vez que cambies código (js, css, html) sube el número
  de VERSION** (v5 -> v6...) para que los móviles con la app instalada se actualicen.

## Archivos JS
utils.js (utilidades) · multimedia.js · galeria.js · render.js (cabecera, portada, pie)
· renderNoticias.js · renderPodcasts.js · vistas.js (secciones, hemeroteca, lectura)
· buscador.js · navegacion.js (historial y "atrás") · app.js (arranque y datos)

## Colores por sección
Actualidad azul · Cultura rosa · Deportes verde · STEAM amarillo · Entrevistas naranja.
Las secciones nuevas usan el azul de la marca.

## Fuentes
Poppins y Lora (licencia SIL OFL 1.1), en assets/fonts.
