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

// ==========================================
// COMPROBAR NUEVA EDICIÓN
// ==========================================

async function comprobarNuevaEdicion() {

    try {

        const respuesta = await fetch(
            "./data/hemeroteca.json?v=" + Date.now(),
            {
                cache: "no-store"
            }
        );

        if (!respuesta.ok) return;

        const hemeroteca = await respuesta.json();

        if (!hemeroteca || !hemeroteca.length) return;

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

async function guardarEdicionActual(id) {

    const cache = await caches.open(CACHE_NAME);

    await cache.put(
        "./data/edicion-actual.txt",
        new Response(id)
    );

}

async function obtenerEdicionGuardada() {

    const cache = await caches.open(CACHE_NAME);

    const respuesta =
        await cache.match(
            "./data/edicion-actual.txt"
        );

    if (!respuesta) return null;

    return await respuesta.text();

}

async function comprobarYActualizarEdicion() {

    try {

        const respuesta = await fetch(
            "./data/hemeroteca.json?v=" + Date.now(),
            {
                cache: "no-store"
            }
        );

        if (!respuesta.ok) return;

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


        // ==========================================
        // PRIMERA INSTALACIÓN
        // ==========================================

        if (!edicionGuardada) {

            await guardarEdicionActual(
                ultimaEdicion
            );

            return;

        }


        // ==========================================
        // NO HAY CAMBIOS
        // ==========================================

        if (
            edicionGuardada ===
            ultimaEdicion
        ) {

            return;

        }


        // ==========================================
        // HAY UNA NUEVA EDICIÓN
        // ==========================================

        console.log(
            "🆕 NUEVA EDICIÓN DETECTADA:",
            ultimaEdicion
        );


        await guardarEdicionActual(
            ultimaEdicion
        );


        // Avisar a la aplicación
        // de que existe una nueva edición

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


    } catch(error) {

        console.log(
            "Error comprobando actualización:",
            error
        );

    }

}