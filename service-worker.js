const CACHE_NAME = "molinillo-magazine-v4";

const ARCHIVOS_CACHE = [

    "./",
    "./index.html",
    "./manifest.json",

    "./css/styles.css",

    "./js/app.js",
    "./js/vistas.js",
    "./js/render.js",
    "./js/renderNoticias.js",
    "./js/renderPodcasts.js",
    "./js/multimedia.js",
    "./js/galeria.js",

    "./data/config.js",
    "./data/estado.js",
    "./data/hemeroteca.json"

];


// =======================================================
// INSTALACIÓN
// =======================================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    ARCHIVOS_CACHE
                );

            })

    );

    // Activar inmediatamente
    self.skipWaiting();

});


// =======================================================
// ACTIVACIÓN
// =======================================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(nombres => {

                return Promise.all(

                    nombres
                        .filter(nombre =>
                            nombre !== CACHE_NAME
                        )
                        .map(nombre =>
                            caches.delete(nombre)
                        )

                );

            })

    );

    // Tomar el control inmediatamente
    self.clients.claim();

});


// =======================================================
// PETICIONES
// =======================================================

self.addEventListener("fetch", event => {

    const request = event.request;

    const url =
        new URL(request.url);


    // Solo GET
    if(request.method !== "GET"){
        return;
    }


    // ===================================================
    // JSON DINÁMICOS
    //
    // RED PRIMERO
    // Si falla → caché
    //
    // Esto permite detectar cambios.
    // ===================================================

    const esJSON =
        url.pathname.endsWith(".json") ||
        url.pathname.endsWith("/config.js") ||
        url.pathname.endsWith("/estado.js");


    if(esJSON){

        event.respondWith(

            fetch(request, {
                cache: "no-store"
            })

            .then(respuesta => {

                if(respuesta.ok){

                    const copia =
                        respuesta.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                request,
                                copia
                            );

                        });

                }

                return respuesta;

            })

            .catch(() => {

                return caches.match(request);

            })

        );

        return;

    }


    // ===================================================
    // IMÁGENES
    //
    // CACHÉ PRIMERO
    //
    // La primera vez:
    // Internet → caché
    //
    // Las siguientes:
    // caché → instantáneo
    // ===================================================

    if(
        request.destination === "image" ||
        url.hostname.includes("drive.google.com")
    ){

        event.respondWith(

            caches.match(request)

                .then(respuestaCache => {

                    if(respuestaCache){

                        return respuestaCache;

                    }


                    return fetch(request)

                        .then(respuestaRed => {

                            if(
                                respuestaRed &&
                                (
                                    respuestaRed.ok ||
                                    respuestaRed.type === "opaque"
                                )
                            ){

                                const copia =
                                    respuestaRed.clone();

                                caches.open(CACHE_NAME)
                                    .then(cache => {

                                        cache.put(
                                            request,
                                            copia
                                        );

                                    });

                            }

                            return respuestaRed;

                        });

                })

        );

        return;

    }


    // ===================================================
    // JS / CSS / HTML
    //
    // CACHÉ PRIMERO
    //
    // Para que la revista abra inmediatamente.
    //
    // Si no existe en caché:
    // Internet → caché
    // ===================================================

    event.respondWith(

        caches.match(request)

            .then(respuestaCache => {

                if(respuestaCache){

                    // Actualización en segundo plano
                    fetch(request, {
                        cache: "no-store"
                    })
                    .then(respuestaNueva => {

                        if(
                            respuestaNueva &&
                            respuestaNueva.ok
                        ){

                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        request,
                                        respuestaNueva.clone()
                                    );

                                });

                        }

                    })
                    .catch(() => {});


                    // Devolver inmediatamente
                    return respuestaCache;

                }


                // No estaba en caché
                return fetch(request)

                    .then(respuestaRed => {

                        if(
                            respuestaRed &&
                            respuestaRed.ok
                        ){

                            const copia =
                                respuestaRed.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        request,
                                        copia
                                    );

                                });

                        }

                        return respuestaRed;

                    });

            })

    );

});


// =======================================================
// MENSAJE PARA FORZAR ACTUALIZACIÓN
// =======================================================

self.addEventListener("message", event => {

    if(
        event.data &&
        event.data.tipo === "ACTUALIZAR"
    ){

        self.skipWaiting();

    }

});