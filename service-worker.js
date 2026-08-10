const CACHE_NAME = "molinillo-magazine-v2";

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


// ==========================================
// INSTALACIÓN
// ==========================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    ARCHIVOS_CACHE
                );

            })

    );

    self.skipWaiting();

});


// ==========================================
// ACTIVACIÓN
// ==========================================

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

    self.clients.claim();

});


// ==========================================
// PETICIONES
// ==========================================

self.addEventListener("fetch", event => {

    const url = new URL(
        event.request.url
    );


    // ==========================================
    // HEMEROTECA
    // ==========================================

    if (
        url.pathname.endsWith(
            "/data/hemeroteca.json"
        )
    ) {

        event.respondWith(

            caches.match(
                event.request
            )
            .then(respuestaCache => {

                // Comprobar actualización
                // en segundo plano

                fetch(
                    event.request,
                    {
                        cache: "no-store"
                    }
                )
                .then(respuestaRed => {

                    if (
                        respuestaRed &&
                        respuestaRed.ok
                    ) {

                        caches.open(
                            CACHE_NAME
                        )
                        .then(cache => {

                            cache.put(
                                event.request,
                                respuestaRed.clone()
                            );

                        });

                    }

                })
                .catch(() => {

                    // Si no hay Internet,
                    // seguimos usando la caché.

                });


                // ==================================
                // DEVOLVER CACHÉ INMEDIATAMENTE
                // ==================================

                if (respuestaCache) {

                    return respuestaCache;

                }


                // ==================================
                // PRIMERA CARGA
                // ==================================

                return fetch(
                    event.request
                );

            })

        );

        return;

    }


    // ==========================================
    // RESTO DE ARCHIVOS
    // CACHÉ PRIMERO
    // ==========================================

    event.respondWith(

        caches.match(
            event.request
        )
        .then(respuestaCache => {

            if (respuestaCache) {

                return respuestaCache;

            }

            return fetch(
                event.request
            );

        })

    );

});