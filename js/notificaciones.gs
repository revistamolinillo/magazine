/**
 * ==========================================================
 * NOTIFICACIONES.GS
 * ----------------------------------------------------------
 * Envía un aviso push (OneSignal) a todo el mundo que tenga
 * la revista instalada y haya aceptado las notificaciones.
 *
 * Necesita dos claves en la hoja Config:
 *   OneSignalAppId   → el "OneSignal App ID" (público)
 *   OneSignalApiKey  → el "REST API Key" (SECRETO, no lo pongas
 *                       nunca en ningún archivo de la web)
 * ==========================================================
 */

function enviarNotificacionPush(titulo, mensaje, url){

  const appId = getConfig("OneSignalAppId");
  const apiKey = getConfig("OneSignalApiKey");

  if(!appId || !apiKey){

    Logger.log(
      "OneSignal no está configurado (falta OneSignalAppId u " +
      "OneSignalApiKey en la hoja Config). Se omite la notificación."
    );

    return;

  }

  const payload = {

    app_id: appId,

    target_channel: "push",

    included_segments: ["All Subscribers"],

    headings: { es: titulo, en: titulo },

    contents: { es: mensaje, en: mensaje },

    url: url || "https://revistamolinillo.github.io/magazine/"

  };

  const opciones = {

    method: "post",

    contentType: "application/json",

    headers: {

      Authorization: "Key " + apiKey

    },

    payload: JSON.stringify(payload),

    muteHttpExceptions: true

  };

  const respuesta = UrlFetchApp.fetch(
    "https://api.onesignal.com/notifications",
    opciones
  );

  const codigo = respuesta.getResponseCode();

  Logger.log(
    "OneSignal (" + codigo + "): " + respuesta.getContentText()
  );

  if(codigo !== 200){

    throw new Error(
      "OneSignal respondió con un error: " + respuesta.getContentText()
    );

  }

}


/**
 * Prueba rápida: ejecuta esta función a mano desde el editor
 * (▶ Ejecutar) para comprobar que el envío funciona antes de
 * confiar en que se dispare solo al publicar.
 */
function probarNotificacionPush(){

  enviarNotificacionPush(
    "🧪 Prueba de notificación",
    "Si ves esto, OneSignal está bien configurado.",
    "https://revistamolinillo.github.io/magazine/"
  );

}
