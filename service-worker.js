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
    const url = new URL(request.url);


    // ===================================================
    // SOLO GET
    // ===================================================

    if (request.method !== "GET") {
        return;
    }


    // ===================================================
    // 1. HEMEROTECA
    //
    // Siempre comprobar Internet.
    // Si falla → utilizar caché.
    // ===================================================

    if (
        url.pathname.endsWith(
            "/data/hemeroteca.json"
        )
    ) {

        event.respondWith(

            fetch(request, {
                cache: "no-store"
            })

            .then(respuesta => {

                if (respuesta.ok) {

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
    // 2. JSON DE LAS EDICIONES
    //
    // E000001.json
    // E000002.json
    // E000003.json...
    //
    // Siempre comprobar Internet.
    // ===================================================

    if (
        url.pathname.includes(
            "/data/ediciones/"
        )
        &&
        url.pathname.endsWith(".json")
    ) {

        event.respondWith(

            fetch(request, {
                cache: "no-store"
            })

            .then(respuesta => {

                if (respuesta.ok) {

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
    // 3. CONFIG.JS Y ESTADO.JS
    //
    // Comprobar red primero.
    // ===================================================

    if (
        url.pathname.endsWith(
            "/data/config.js"
        )
        ||
        url.pathname.endsWith(
            "/data/estado.js"
        )
    ) {

        event.respondWith(

            fetch(request, {
                cache: "no-store"
            })

            .then(respuesta => {

                if (respuesta.ok) {

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
    // 4. IMÁGENES
    //
    // CACHÉ PRIMERO
    //
    // Esto es importante para mantener la revista rápida.
    // ===================================================

    if (
        request.destination === "image"
        ||
        url.hostname.includes(
            "drive.google.com"
        )
    ) {

        event.respondWith(

            caches.match(request)

                .then(respuestaCache => {

                    // Si ya existe → instantáneo
                    if (respuestaCache) {

                        return respuestaCache;

                    }


                    // Si no existe → descargar
                    return fetch(request)

                        .then(respuestaRed => {

                            if (
                                respuestaRed &&
                                (
                                    respuestaRed.ok
                                    ||
                                    respuestaRed.type ===
                                    "opaque"
                                )
                            ) {

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
    // 5. RESTO DE ARCHIVOS
    //
    // HTML / JS / CSS / MANIFEST
    //
    // IMPORTANTE:
    //
    // Estos archivos están incluidos en cada nueva
    // versión del Service Worker.
    //
    // Cuando cambiemos v4 → v5 → v6...
    // se volverán a descargar.
    // ===================================================

    event.respondWith(

        caches.match(request)

            .then(respuestaCache => {

                if (respuestaCache) {

                    return respuestaCache;

                }


                return fetch(request)

                    .then(respuestaRed => {

                        if (
                            respuestaRed &&
                            respuestaRed.ok
                        ) {

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
// COMPROBAR NUEVA EDICIÓN
// =======================================================

async function comprobarNuevaEdicion() {

    try {

        const respuesta = await fetch(
            "./data/hemeroteca.json?v=" +
            Date.now(),
            {
                cache: "no-store"
            }
        );


        if (!respuesta.ok) {
            return;
        }


        const hemeroteca =
            await respuesta.json();


        if (
            !hemeroteca ||
            !hemeroteca.length
        ) {

            return;

        }


        const ultimaEdicion =
            hemeroteca[0].id;


        console.log(
            "Última edición publicada:",
            ultimaEdicion
        );


    } catch (error) {

        console.log(
            "No se pudo comprobar la edición:",
            error
        );

    }

}


// =======================================================
// GUARDAR EDICIÓN ACTUAL
// =======================================================

async function guardarEdicionActual(id) {

    const cache =
        await caches.open(CACHE_NAME);


    await cache.put(

        "./data/edicion-actual.txt",

        new Response(id)

    );

}


// =======================================================
// OBTENER EDICIÓN GUARDADA
// =======================================================

async function obtenerEdicionGuardada() {

    const cache =
        await caches.open(CACHE_NAME);


    const respuesta =
        await cache.match(
            "./data/edicion-actual.txt"
        );


    if (!respuesta) {
        return null;
    }


    return await respuesta.text();

}


// =======================================================
// COMPROBAR Y ACTUALIZAR EDICIÓN
// =======================================================

async function comprobarYActualizarEdicion() {

    try {

        const respuesta = await fetch(

            "./data/hemeroteca.json?v=" +
            Date.now(),

            {
                cache: "no-store"
            }

        );


        if (!respuesta.ok) {
            return;
        }


        const hemeroteca =
            await respuesta.json();


        if (
            !hemeroteca ||
            hemeroteca.length === 0
        ) {

            return;

        }


        const ultimaEdicion =
            hemeroteca[0].id;


        const edicionGuardada =
            await obtenerEdicionGuardada();


        console.log(
            "Edición guardada:",
            edicionGuardada
        );


        console.log(
            "Última edición:",
            ultimaEdicion
        );


        // =============================================
        // PRIMERA INSTALACIÓN
        // =============================================

        if (!edicionGuardada) {

            await guardarEdicionActual(
                ultimaEdicion
            );

            return;

        }


        // =============================================
        // NO HAY CAMBIOS
        // =============================================

        if (
            edicionGuardada ===
            ultimaEdicion
        ) {

            return;

        }


        // =============================================
        // NUEVA EDICIÓN
        // =============================================

        console.log(
            "🆕 NUEVA EDICIÓN DETECTADA:",
            ultimaEdicion
        );


        await guardarEdicionActual(
            ultimaEdicion
        );


        // =============================================
        // AVISAR A LA REVISTA
        // =============================================

        const clientes =
            await self.clients.matchAll();


        clientes.forEach(cliente => {

            cliente.postMessage({

                tipo:
                    "NUEVA_EDICION",

                edicion:
                    ultimaEdicion

            });

        });


    } catch (error) {

        console.log(
            "Error comprobando actualización:",
            error
        );

    }

}