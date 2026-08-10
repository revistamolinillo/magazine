const CACHE_NAME = "molinillo-magazine-v1";

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
    "./data/estado.js"
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

    event.respondWith(

        caches.match(event.request)
            .then(respuestaCache => {

                if(respuestaCache){

                    return respuestaCache;

                }

                return fetch(event.request);

            })

    );

});