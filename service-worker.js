// =======================================================
// SERVICE WORKER - EL MOLINILLO MAGAZINE
//
// Permite abrir la revista al instante y leer lo que ya se
// ha visto aunque no haya conexión.
//
// IMPORTANTE: cuando cambies cualquier archivo de código
// (js, css, html) sube el número de VERSION para que los
// dispositivos que ya tienen la revista instalada se actualicen.
// =======================================================

const VERSION = "v7";

const CACHE_APP = "molinillo-app-" + VERSION;

// Las imágenes de Drive tienen su propia caché (no se borra al actualizar)
const CACHE_IMAGENES = "molinillo-imagenes";

const MAX_IMAGENES = 90;

const ARCHIVOS_CACHE = [

    "./",
    "./index.html",
    "./manifest.json",

    "./css/styles.css",

    "./js/utils.js",
    "./js/multimedia.js",
    "./js/galeria.js",
    "./js/render.js",
    "./js/renderNoticias.js",
    "./js/renderPodcasts.js",
    "./js/vistas.js",
    "./js/buscador.js",
    "./js/navegacion.js",
    "./js/app.js",

    "./data/config.js",
    "./data/estado.js",
    "./data/hemeroteca.json",

    "./assets/fonts/Poppins-Regular.woff",
    "./assets/fonts/Poppins-Medium.woff",
    "./assets/fonts/Poppins-Bold.woff",
    "./assets/fonts/Lora-Variable.woff",
    "./assets/fonts/Lora-Italic-Variable.woff",

    "./assets/img/logo-marca.png",
    "./assets/img/favicon.png",
    "./assets/img/noticia.jpg",
    "./assets/img/podcast.jpg",

    "./assets/icons/icon-192.png",
    "./assets/icons/icon-512.png"

];


// -------------------------------------------------------
// INSTALACIÓN
// -------------------------------------------------------

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_APP).then(cache =>

            // Se piden siempre a la red (cache: "reload") para no guardar
            // por error una versión antigua que tenga el navegador.
            // Si un archivo falla, el resto se guarda igualmente.
            Promise.all(
                ARCHIVOS_CACHE.map(archivo =>
                    cache
                        .add(new Request(archivo, { cache:"reload" }))
                        .catch(() => {})
                )
            )

        )

    );

    self.skipWaiting();

});


// -------------------------------------------------------
// ACTIVACIÓN: se borran las cachés de versiones antiguas
// -------------------------------------------------------

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(nombres =>

            Promise.all(
                nombres
                    .filter(nombre =>
                        nombre !== CACHE_APP &&
                        nombre !== CACHE_IMAGENES
                    )
                    .map(nombre => caches.delete(nombre))
            )

        )

    );

    self.clients.claim();

});


// -------------------------------------------------------
// AYUDAS
// -------------------------------------------------------

// Dirección sin parámetros (?v=123, ?noticia=N000001...)
function sinParametros(direccion){

    const url = new URL(direccion);

    url.search = "";
    url.hash = "";

    return url.toString();

}


async function recortarCache(nombre, maximo){

    const cache = await caches.open(nombre);

    const claves = await cache.keys();

    if(claves.length <= maximo) return;

    await Promise.all(
        claves
            .slice(0, claves.length - maximo)
            .map(clave => cache.delete(clave))
    );

}


// -------------------------------------------------------
// PETICIONES
// -------------------------------------------------------

self.addEventListener("fetch", event => {

    const request = event.request;

    if(request.method !== "GET") return;

    const url = new URL(request.url);

    // ---------------------------------------------------
    // DATOS (JSON y configuración)
    // Red primero: así se ven las novedades enseguida.
    // Si no hay conexión, se usa la última copia.
    // La copia se guarda sin "?v=..." para poder encontrarla
    // después aunque la dirección cambie.
    // ---------------------------------------------------

    const esDato =
        url.origin === self.location.origin &&
        (
            url.pathname.endsWith(".json") ||
            url.pathname.endsWith("/config.js") ||
            url.pathname.endsWith("/estado.js")
        );

    if(esDato){

        event.respondWith(datosRedPrimero(request));

        return;

    }

    // ---------------------------------------------------
    // IMÁGENES
    // Caché primero: tras la primera vez, se ven al instante.
    // ---------------------------------------------------

    if(
        request.destination === "image" ||
        url.hostname.includes("drive.google.com")
    ){

        event.respondWith(imagenCachePrimero(event, request));

        return;

    }

    // ---------------------------------------------------
    // El resto de archivos de la propia web (HTML, JS, CSS,
    // fuentes): salen de la caché y se actualizan detrás.
    // ---------------------------------------------------

    if(url.origin === self.location.origin){

        event.respondWith(archivoCachePrimero(event, request));

    }

});


async function datosRedPrimero(request){

    const cache = await caches.open(CACHE_APP);

    const clave = sinParametros(request.url);

    try{

        const respuesta = await fetch(request, { cache:"no-store" });

        if(respuesta.ok){

            await cache.put(clave, respuesta.clone());

        }

        return respuesta;

    }catch(error){

        const guardada = await cache.match(clave);

        if(guardada) return guardada;

        return Response.error();

    }

}


async function imagenCachePrimero(event, request){

    const guardada = await caches.match(request);

    if(guardada) return guardada;

    const respuesta = await fetch(request);

    // Las imágenes de Drive llegan como "opacas": también valen
    if(
        respuesta &&
        (respuesta.ok || respuesta.type === "opaque")
    ){

        const copia = respuesta.clone();

        event.waitUntil(

            caches.open(CACHE_IMAGENES)
                .then(cache => cache.put(request, copia))
                .then(() => recortarCache(CACHE_IMAGENES, MAX_IMAGENES))
                .catch(() => {})

        );

    }

    return respuesta;

}


async function archivoCachePrimero(event, request){

    const cache = await caches.open(CACHE_APP);

    const esPagina = request.mode === "navigate";

    // Las páginas se guardan sin "?noticia=..." ni "?vista=..."
    const clave = esPagina ? sinParametros(request.url) : request;

    const guardada = await cache.match(clave);

    const actualizacion =
        fetch(request, { cache:"no-store" })
            .then(async respuesta => {

                if(respuesta && respuesta.ok){

                    await cache.put(clave, respuesta.clone());

                }

                return respuesta;

            });

    if(guardada){

        // Se actualiza en segundo plano para la próxima vez
        event.waitUntil(actualizacion.catch(() => {}));

        return guardada;

    }

    try{

        return await actualizacion;

    }catch(error){

        // Sin conexión y sin copia de esta página: la portada
        if(esPagina){

            const portada = await cache.match("./index.html");

            if(portada) return portada;

        }

        return Response.error();

    }

}


// -------------------------------------------------------
// MENSAJE PARA FORZAR ACTUALIZACIÓN
// -------------------------------------------------------

self.addEventListener("message", event => {

    if(
        event.data &&
        event.data.tipo === "ACTUALIZAR"
    ){

        self.skipWaiting();

    }

});
