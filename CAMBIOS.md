# Actualización: compartir en historias de Instagram y compartir la revista

Copia cada archivo sobre el que ya tienes (respeta las carpetas):

- js/compartir.js      (NUEVO)
- js/app.js
- js/render.js
- js/utils.js
- css/styles.css
- index.html
- preview.html
- service-worker.js    (ahora VERSION = "v15")
- LEEME.md

## Novedades
- El botón **Compartir** de noticias y podcasts abre un menú nuevo con:
  - **Subir a mi historia**: crea en el momento una imagen vertical (1080x1920) con la foto,
    la sección, el título, la entradilla y el autor, y abre el menú del móvil para mandarla a
    Instagram > Historia. El enlace se copia solo para pegarlo con la pegatina «Enlace».
    En el ordenador la imagen se descarga.
  - WhatsApp, Copiar enlace, descargar la imagen y "Más" (menú del sistema).
- **Compartir revista**: botón en la portada y enlace en el pie. Comparte la edición entera,
  con su propia imagen de historia (mes, número, curso, titular de portada, titulares y podcasts).
- Si se comparte una edición antigua desde la hemeroteca, el enlace lleva `?edicion=...`
  y abre directamente esa edición.
- Lo que se comparte desde la vista previa (preview.html) apunta a la revista real.
