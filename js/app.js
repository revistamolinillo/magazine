console.log("Preview cargado:", typeof revistaPreview);
window.addEventListener("DOMContentLoaded", iniciar);

// ==========================================
// ACTUALIZACIÓN AUTOMÁTICA DE LA REVISTA
// ==========================================

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.addEventListener(
        "message",
        event => {

            if (
                event.data &&
                event.data.tipo === "NUEVA_EDICION"
            ) {

                console.log(
                    "🆕 Nueva edición disponible:",
                    event.data.edicion
                );

                // Recargar los datos de la revista
                // sin recargar toda la página

                cargarDatos();

            }

        }
    );

}

let vistaActual = "portada";
let idEdicionActual = null;
let idEdicionLeyendo = null;
let datosEdicionActual = null;
let vistaAnterior = "portada";
let todasLasNoticias = [];
let idNoticiaAnterior = null;
let posicionScrollAnterior = 0;
let posicionVistaAnterior = 0;
let restaurandoScroll = false;
let textoBusquedaAnterior = "";
let vistaAnteriorPodcast = "podcasts";
let posicionPodcastAnterior = 0;
let origenPodcast = null;
let posicionOrigenPodcast = 0;
let busquedaOrigenPodcast = "";
let origenArticulo = "portada";
let posicionOrigenArticulo = 0;
let textoOrigenArticulo = "";
let origenPodcastSubseccion = "";
let posicionPodcastSubseccion = 0;
let datosEdicionesCargadas = {};
let todosLosPodcasts = [];
let podcastSubseccionAnterior = "";

async function iniciar(){

    try {

        // ==========================================
        // 1. CARGAR DATOS
        // ==========================================

        await cargarDatos();


        // ==========================================
        // 2. PREPARAR IMÁGENES IMPORTANTES
        // ==========================================

        await precargarImagenesIniciales();


        // ==========================================
        // 3. COMPROBAR SI VENIMOS DE UN ENLACE
        // ==========================================

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const noticia =
            parametros.get("noticia");


        if(noticia){

            await irANoticia(noticia);

            ocultarPantallaCarga();

            return;

        }


        // ==========================================
        // 4. MOSTRAR PORTADA
        // ==========================================

        mostrarVista("portada");


        // ==========================================
        // 5. YA PODEMOS QUITAR EL SPLASH
        // ==========================================

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                ocultarPantallaCarga();

            });

        });


    } catch(error) {

        console.error(
            "Error cargando la revista:",
            error
        );

        mostrarErrorCarga();

    }

}

// =======================================================
// PRECARGA INICIAL DE IMÁGENES
// =======================================================

async function precargarImagenesIniciales(){

    const urls = [];


    // ==========================================
    // PORTADA
    // ==========================================

    if(
        edicion &&
        edicion.portada &&
        edicion.portada.imagen
    ){

        const imagenPortada =
            edicion.portada.imagen;


        const urlPortada =
            imagenPortada.startsWith("http")
            ? imagenPortada
            : `https://drive.google.com/thumbnail?id=${imagenPortada}&sz=w1600`;


        urls.push(urlPortada);

    }


    // ==========================================
    // IMÁGENES PRINCIPALES DE LAS NOTICIAS
    // ==========================================

    if(
        Array.isArray(noticias)
    ){

        noticias.forEach(noticia => {

            const url =
                obtenerImagenURL(noticia);


            if(
                url &&
                !url.startsWith("assets/")
            ){

                urls.push(url);

            }

        });

    }


    // ==========================================
    // ELIMINAR DUPLICADOS
    // ==========================================

    const urlsUnicas =
        [...new Set(urls)];


    if(urlsUnicas.length === 0){

        console.log(
            "ℹ️ No hay imágenes que precargar"
        );

        return;

    }


    console.log(
        `🖼️ Esperando ${urlsUnicas.length} imágenes...`
    );


    // ==========================================
    // CARGAR TODAS LAS IMÁGENES
    // ==========================================

    await Promise.all(

        urlsUnicas.map(url => {

            return new Promise(resolve => {

                const imagen =
                    new Image();


                imagen.onload = () => {

                    console.log(
                        "✅ Imagen cargada:",
                        url
                    );

                    resolve();

                };


                imagen.onerror = () => {

                    console.warn(
                        "⚠️ No se pudo cargar:",
                        url
                    );

                    // IMPORTANTE:
                    // Una imagen que falle NO
                    // bloquea toda la aplicación.

                    resolve();

                };


                imagen.src = url;

            });

        })

    );


    console.log(
        "🖼️ Precarga inicial terminada"
    );

}
// =======================================================
// PANTALLA DE CARGA
// =======================================================

function ocultarPantallaCarga(){

    const pantalla =
        document.getElementById(
            "pantalla-carga"
        );

    if(!pantalla) return;


    pantalla.classList.add(
        "oculta"
    );


    setTimeout(() => {

        pantalla.remove();

    }, 400);

}


// =======================================================
// ERROR DE CARGA
// =======================================================

function mostrarErrorCarga(){

    const pantalla =
        document.getElementById(
            "pantalla-carga"
        );

    if(!pantalla) return;


    const texto =
        pantalla.querySelector(
            ".carga-texto"
        );


    if(texto){

        texto.textContent =
            "No se ha podido cargar la revista.";

    }


    const puntos =
        pantalla.querySelector(
            ".carga-puntos"
        );


    if(puntos){

        puntos.innerHTML =
            "⚠️";

    }

}


function mostrarVista(vista){

    if(
        !vista.startsWith("noticia-") &&
        !vista.startsWith("podcast-")
    ){

        vistaAnterior = vista;

    }

    vistaActual = vista;

    // ==========================================
    // VOLVER ARRIBA AL CAMBIAR DE VISTA
    // ==========================================

    if(
        !vista.startsWith("noticia-") &&
        !vista.startsWith("podcast-")
    ){

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        });

    }

    const app =
        document.getElementById("app");


    // ==========================================
    // NOTICIA
    // ==========================================

    if(vista.startsWith("noticia-")){

        const id =
            vista.replace("noticia-","");


        app.innerHTML =
            renderVistaNoticia(id);


        // Activar barra de progreso
        requestAnimationFrame(() => {

            activarProgresoLectura();

        });


        return;

    }


    // ==========================================
    // PODCAST
    // ==========================================

    if(vista.startsWith("podcast-")){

        const id =
            vista.replace("podcast-","");


        app.innerHTML =
            renderVistaPodcast(id);


        // Activar barra de progreso
        requestAnimationFrame(() => {

            activarProgresoLectura();

        });


        return;

    }


    // ==========================================
    // CUALQUIER OTRA VISTA
    // ==========================================

    desactivarProgresoLectura();


    switch(vista){

        case "portada":

            app.innerHTML =
                renderPortada();

            break;


        case "secciones":

            app.innerHTML =
                renderSecciones();

            break;


        case "hemeroteca":

            app.innerHTML =
                renderHemeroteca();
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "instant"
                });

            break;


        case "podcasts":

            app.innerHTML =
                renderVistaPodcasts();

            break;


        case "buscador":

            app.innerHTML =
                renderBuscador();

            break;

    }


    // ==========================================
    // SECCIÓN
    // ==========================================

    if(vista.startsWith("seccion-")){

        const nombre =
            vista.replace("seccion-","");


        app.innerHTML =
            renderVistaSeccion(nombre);

    }

}

function obtenerImagenPortadaEdicion(datos){

    if(!datos){
        return "";
    }


    const noticiasEdicion =
        datos.noticias || [];


    // ==========================================
    // BUSCAR LA NOTICIA MARCADA COMO PORTADA
    // ==========================================

    let noticiaPortada = null;


    // Primero intentamos localizarla por ID
    if(datos.portada && datos.portada.ID){

        noticiaPortada =
            noticiasEdicion.find(
                noticia =>
                    String(noticia.ID) ===
                    String(datos.portada.ID)
            );

    }


    // Si por alguna razón no existe el ID,
    // buscamos por el título como respaldo

    if(!noticiaPortada && datos.portada && datos.portada.Titulo){

        noticiaPortada =
            noticiasEdicion.find(
                noticia =>
                    noticia.Titulo &&
                    noticia.Titulo.trim().toLowerCase() ===
                    datos.portada.Titulo.trim().toLowerCase()
            );

    }


    console.log(
        "PORTADA DE LA EDICIÓN:",
        datos.id,
        datos.mes
    );

    console.log(
        "NOTICIA PORTADA:",
        noticiaPortada
    );


    // ==========================================
    // 1. IMAGEN PRINCIPAL DE LA NOTICIA
    // ==========================================

    if(
        noticiaPortada &&
        noticiaPortada.ImagenPrincipal &&
        noticiaPortada.ImagenPrincipal.trim() !== ""
    ){

        console.log(
            "IMAGEN PORTADA → ImagenPrincipal:",
            noticiaPortada.ImagenPrincipal
        );

        return noticiaPortada.ImagenPrincipal;

    }


    // ==========================================
    // 2. IMAGEN PRINCIPAL GUARDADA EN PORTADA
    // ==========================================

    if(
        datos.portada &&
        datos.portada.ImagenPrincipal &&
        datos.portada.ImagenPrincipal.trim() !== ""
    ){

        console.log(
            "IMAGEN PORTADA → ImagenPrincipal portada:",
            datos.portada.ImagenPrincipal
        );

        return datos.portada.ImagenPrincipal;

    }


    // ==========================================
    // 3. IMAGENPORTADA
    // ==========================================

    if(
        datos.portada &&
        datos.portada.ImagenPortada &&
        datos.portada.ImagenPortada.trim() !== ""
    ){

        console.log(
            "IMAGEN PORTADA → ImagenPortada:",
            datos.portada.ImagenPortada
        );

        return datos.portada.ImagenPortada;

    }


    // ==========================================
    // 4. ÚLTIMO RECURSO:
    //    PRIMERA IMAGEN DE LA NOTICIA
    // ==========================================

    if(noticiaPortada){

        const imagenes =
            obtenerImagenes(noticiaPortada);


        if(imagenes.length > 0){

            console.log(
                "IMAGEN PORTADA → Primera imagen como respaldo:",
                imagenes[0].id
            );

            return imagenes[0].id;

        }

    }


    console.warn(
        "IMAGEN PORTADA → No se encontró imagen para:",
        datos.id
    );


    return "";

}

async function cargarDatos(){

    const archivoDatos =
        window.location.pathname.includes("preview.html")
        ? "data/preview/revista-preview.json"
        : CONFIG.urlDatos;


    /*const respuesta =
        await fetch(archivoDatos);*/
    const respuesta =
    await fetch(archivoDatos + "?v=" + Date.now(), {
        cache: "no-store"
    });


    const datos =
        await respuesta.json();


    console.log(
        "DATOS DE LA EDICIÓN ACTUAL:",
        datos
    );


    // ==========================================
    // IDENTIFICACIÓN DE LA EDICIÓN
    // ==========================================

    idEdicionActual = datos.id;

    idEdicionLeyendo = datos.id;

    datosEdicionActual = datos;


    edicion.mes =
        datos.mes || "";


    // ==========================================
    // PORTADA
    // ==========================================

    if(datos.portada){

        edicion.portada.titulo =
            datos.portada.Titulo || "";


        edicion.portada.entradilla =
            datos.portada.Entradilla || "";


        edicion.portada.imagen =
            obtenerImagenPortadaEdicion(datos);


        console.log(
            "PORTADA FINAL:",
            edicion.portada
        );

    }else{

        edicion.portada.titulo = "";

        edicion.portada.entradilla = "";

        edicion.portada.imagen = "";

    }


    // ==========================================
    // LIMPIAR NOTICIAS Y PODCASTS
    // ==========================================

    noticias.length = 0;

    podcasts.length = 0;


    datos.noticias =
        datos.noticias || [];


    // ==========================================
    // CLASIFICAR CONTENIDOS
    // ==========================================

    datos.noticias.forEach(noticia => {

        const archivos =
            obtenerArchivosMultimedia(noticia);


        const esPodcast =
            (noticia.TipoContenido || "")
                .trim()
                .toLowerCase() === "podcast"
            ||
            archivos.some(
                a =>
                    a.tipo.startsWith("audio")
            );


        if(esPodcast){

            podcasts.push(noticia);

        }else{

            noticias.push(noticia);

        }

    });


    // ==========================================
    // CONSOLA
    // ==========================================

    console.log("NOTICIAS");

    console.table(
        noticias.map(n => ({
            id: n.ID,
            titulo: n.Titulo,
            seccion: n.Seccion,
            imagenPrincipal: n.ImagenPrincipal
        }))
    );


    console.log("PODCASTS");

    console.table(
        podcasts.map(n => ({
            id: n.ID,
            titulo: n.Titulo,
            seccion: n.Seccion
        }))
    );


    // ==========================================
    // HEMEROTECA Y BUSCADOR
    // ==========================================

    await cargarHemeroteca();

    await cargarTodasLasNoticias();


    console.log(
        "Datos cargados:",
        datos
    );

}

async function cargarHemeroteca(){

    try{

        const respuesta = await fetch(
            CONFIG.urlHemeroteca + "?v=" + Date.now(),
            {
                cache: "no-store"
            }
        );


        if(!respuesta.ok){

            console.error(
                "No se pudo cargar la hemeroteca:",
                respuesta.status
            );

            return;

        }


        hemeroteca = await respuesta.json();
        precargarPortadasHemeroteca();


        // ==========================================
        // COMPROBAR DATOS
        // ==========================================

        if(!Array.isArray(hemeroteca)){

            console.error(
                "La hemeroteca no tiene un formato válido."
            );

            hemeroteca = [];

            return;

        }


        // ==========================================
        // LA HEMEROTECA YA TIENE LAS PORTADAS
        //
        // NO DESCARGAMOS LOS JSON DE LAS EDICIONES
        // ==========================================

        console.log(
            "Hemeroteca cargada rápidamente:",
            hemeroteca
        );


        // ==========================================
        // MOSTRAR LAS EDICIONES
        // ==========================================

        hemeroteca.forEach(edicion => {

            console.log(
                "Edición:",
                edicion.id,
                "Portada:",
                edicion.imagen
            );

        });


    }catch(error){

        console.error(
            "Error cargando la hemeroteca:",
            error
        );

    }

}

function abrirRevista(){

    mostrarVista("portada");

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            const revista =
                document.getElementById("revista");

            if(!revista) return;

            revista.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });

}

function hacerScroll(id){

    const articulo = document.getElementById("noticia-"+id);

    if(!articulo) return;

    articulo.scrollIntoView({

        behavior:"smooth",

        block:"start"

    });

    articulo.classList.add("resaltar");

    setTimeout(()=>{

        articulo.classList.remove("resaltar");

    },2000);

}

async function volverRevistaActual(){

    if(idEdicionLeyendo === idEdicionActual){

        mostrarVista("portada");

        return;

    }


    await abrirEdicion(idEdicionActual);

}

function buscarNoticias(){

    const input =
        document.getElementById("inputBusqueda");

    if(!input) return;


    const texto =
        input.value
            .toLowerCase()
            .trim();


    textoBusquedaAnterior = texto;


    const contenedor =
        document.getElementById("resultadosBusqueda");

    if(!contenedor) return;


    if(todasLasNoticias.length === 0){

        contenedor.innerHTML =
        `
        <p class="subtitulo-seccion">
            Preparando buscador...
        </p>
        `;

        return;

    }


    if(!texto){

        contenedor.innerHTML =
        `
        <p class="subtitulo-seccion">
            Escribe algo para comenzar la búsqueda.
        </p>
        `;

        return;

    }


    const resultados =
        todasLasNoticias.filter(noticia => {

            const contenido =
            `
            ${noticia.Titulo || ""}
            ${noticia.Entradilla || ""}
            ${noticia.Cuerpo || ""}
            ${noticia.Autor || ""}
            ${noticia.Seccion || ""}
            ${noticia.TipoContenido || ""}
            `
            .toLowerCase();


            return contenido.includes(texto);

        });


    if(resultados.length === 0){

        contenedor.innerHTML =
        `
        <p class="subtitulo-seccion">
            No se han encontrado noticias.
        </p>
        `;

        return;

    }


    contenedor.innerHTML =

    resultados.map(noticia => {

        const esPodcast =
            (noticia.TipoContenido || "")
                .trim()
                .toLowerCase() === "podcast"
            ||
            obtenerAudios(noticia).length > 0;


        return `

        <article class="card-seccion">


            <img
                src="${
                    esPodcast
                        ? obtenerImagenPodcast(noticia)
                        : obtenerImagenURL(noticia)
                }"
                alt="${noticia.Titulo}"
            >


            <div class="card-seccion-contenido">


                <span class="card-seccion-categoria">

                    ${
                        esPodcast
                            ? "🎙 Podcast"
                            : iconoSeccion(noticia.Seccion)
                    }

                    ${
                        esPodcast
                            ? ""
                            : noticia.Seccion
                    }

                </span>


                <h2>
                    ${noticia.Titulo}
                </h2>


                <p>
                    ${noticia.Entradilla || ""}
                </p>


                <div
                    class="leer-articulo"
                    onclick="irANoticia('${noticia.ID}')">

                    ${
                        esPodcast
                            ? "Escuchar episodio →"
                            : "Leer artículo →"
                    }

                </div>


            </div>


        </article>

        `;

    }).join("");

}

function volverDePodcast(){

    // ==========================================
    // SI VENÍAMOS DE UNA SUBSECCIÓN DE PODCASTS
    // ==========================================

    if(
        origenArticulo === "podcasts" &&
        origenPodcastSubseccion
    ){

        mostrarVista("podcasts");


        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                mostrarPodcastsSubseccion(
                    origenPodcastSubseccion
                );


                requestAnimationFrame(() => {

                    window.scrollTo({

                        top:
                            posicionPodcastSubseccion,

                        left: 0,

                        behavior: "instant"

                    });

                });

            });

        });


        return;

    }


    // ==========================================
    // RESTO DE CASOS
    //
    // BUSCADOR, ETC.
    // ==========================================

    const destino =
        origenArticulo ||
        "podcasts";


    const posicion =
        posicionOrigenArticulo ||
        0;


    const busqueda =
        textoOrigenArticulo ||
        "";


    mostrarVista(destino);


    requestAnimationFrame(() => {

        requestAnimationFrame(() => {


            // ==================================
            // SI VENÍAMOS DEL BUSCADOR
            // ==================================

            if(
                destino === "buscador" &&
                busqueda
            ){

                const input =
                    document.getElementById(
                        "inputBusqueda"
                    );


                if(input){

                    input.value =
                        busqueda;

                }


                buscarNoticias();

            }


            // ==================================
            // RESTAURAR POSICIÓN
            // ==================================

            requestAnimationFrame(() => {

                window.scrollTo({

                    top: posicion,

                    left: 0,

                    behavior: "instant"

                });

            });

        });

    });

}

async function cargarTodasLasNoticias(){

    todasLasNoticias.length = 0;
    todosLosPodcasts.length = 0;

    const respuesta =
        await fetch(CONFIG.urlHemeroteca);

    const ediciones =
        await respuesta.json();


    // ==========================================
    // AÑADIR EDICIÓN ACTUAL
    // ==========================================

    if(
        datosEdicionActual &&
        datosEdicionActual.noticias
    ){

        datosEdicionActual.noticias.forEach(noticia => {

            noticia.Edicion =
                datosEdicionActual.id;


            const archivos =
                obtenerArchivosMultimedia(noticia);


            const esPodcast =
                (
                    noticia.TipoContenido ||
                    ""
                )
                .trim()
                .toLowerCase() === "podcast"
                ||
                archivos.some(
                    a =>
                        a.tipo.startsWith("audio")
                );


            if(esPodcast){

                todosLosPodcasts.push(noticia);

            }


            todasLasNoticias.push(noticia);

        });

    }


    // ==========================================
    // AÑADIR TODAS LAS EDICIONES ANTERIORES
    // ==========================================

    for(const edicion of ediciones){

        // Evitar cargar dos veces la edición actual
        if(
            datosEdicionActual &&
            edicion.id === datosEdicionActual.id
        ){

            continue;

        }


        const respuestaEdicion =
            await fetch(
                "data/ediciones/" +
                edicion.id +
                ".json"
            );


        const datosEdicion =
            await respuestaEdicion.json();
            datosEdicionesCargadas[edicion.id] = datosEdicion;


        if(!datosEdicion.noticias){

            continue;

        }


        datosEdicion.noticias.forEach(noticia => {

            noticia.Edicion =
                datosEdicion.id;


            const archivos =
                obtenerArchivosMultimedia(noticia);


            const esPodcast =
                (
                    noticia.TipoContenido ||
                    ""
                )
                .trim()
                .toLowerCase() === "podcast"
                ||
                archivos.some(
                    a =>
                        a.tipo.startsWith("audio")
                );


            if(esPodcast){

                todosLosPodcasts.push(noticia);

            }


            todasLasNoticias.push(noticia);

        });

    }


    console.log(
        "TOTAL NOTICIAS:",
        todasLasNoticias.length
    );


    console.log(
        "TOTAL PODCASTS:",
        todosLosPodcasts.length
    );


    console.table(
        todosLosPodcasts.map(p => ({
            id: p.ID,
            titulo: p.Titulo,
            subseccion: p.SubseccionPodcast,
            edicion: p.Edicion
        }))
    );

}

// =======================================================
// COMPARTIR NOTICIA
// =======================================================

function obtenerEnlaceNoticia(id){

    const url =
        new URL(
            window.location.href
        );

    url.search = "";

    url.searchParams.set(
        "noticia",
        id
    );

    return url.toString();

}


// =======================================================
// COMPARTIR CON EL MENÚ NATIVO
// =======================================================

async function compartirNoticia(id){

    const noticia =
        todasLasNoticias.find(
            n =>
                String(n.ID) ===
                String(id)
        );

    if(!noticia) return;


    const url =
        obtenerEnlaceNoticia(id);


    // Si el dispositivo permite compartir
    if(navigator.share){

        try{

            await navigator.share({

                title:
                    noticia.Titulo,

                text:
                    noticia.Entradilla ||
                    "Mira esta noticia de El Molinillo Magazine",

                url:
                    url

            });

        }catch(error){

            // El usuario simplemente canceló
            console.log(
                "Compartir cancelado"
            );

        }

        return;

    }


    // Si no existe navigator.share,
    // copiamos el enlace

    copiarTexto(
        url
    );

}


// =======================================================
// COPIAR ENLACE
// =======================================================

async function copiarEnlaceNoticia(id){

    const url =
        obtenerEnlaceNoticia(id);

    copiarTexto(url);

}


// =======================================================
// COPIAR TEXTO AL PORTAPAPELES
// =======================================================

async function copiarTexto(texto){

    try{

        await navigator.clipboard.writeText(
            texto
        );


        alert(
            "🔗 Enlace copiado"
        );


    }catch(error){

        console.error(
            "No se pudo copiar el enlace:",
            error
        );


        // Método alternativo

        const textarea =
            document.createElement("textarea");

        textarea.value =
            texto;

        document.body.appendChild(
            textareaa
        );

        textarea.select();

        document.execCommand(
            "copy"
        );

        textarea.remove();


        alert(
            "🔗 Enlace copiado"
        );

    }

}

// ==========================================
// INSTALACIÓN PWA
// ==========================================

let instalacionPWA = null;

window.addEventListener("beforeinstallprompt", (event) => {

    // Evitar que Chrome muestre automáticamente el aviso
    event.preventDefault();

    // Guardamos el evento para utilizarlo después
    instalacionPWA = event;

    console.log("PWA preparada para instalar");

    // Mostrar el botón
    const boton = document.getElementById(
        "boton-instalar-app"
    );

    if (boton) {
        boton.style.display = "inline-flex";
    }

});

async function instalarPWA(){

    // ==========================================
    // ¿YA ESTÁ ABIERTA COMO APP?
    // ==========================================

    const estaEnModoApp =
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches
        ||
        window.navigator.standalone === true;


    if(estaEnModoApp){

        mostrarMensajeInstalada();

        return;

    }


    // ==========================================
    // IPHONE / IPAD
    // ==========================================

    const esIOS =
        /iphone|ipad|ipod/i.test(
            navigator.userAgent
        );


    if(esIOS){

        mostrarInstruccionesIOS();

        return;

    }


    // ==========================================
    // ANDROID / ORDENADOR
    // ==========================================

    if(!instalacionPWA){

        mostrarMensajeInstalada();

        return;

    }


    instalacionPWA.prompt();


    const resultado =
        await instalacionPWA.userChoice;


    console.log(
        "Resultado instalación:",
        resultado.outcome
    );


    if(resultado.outcome === "accepted"){

        actualizarBotonInstalacion();

    }


    instalacionPWA = null;

}

function mostrarMensajeInstalada(){

    const existente =
        document.getElementById(
            "modal-revista-instalada"
        );


    if(existente){

        existente.classList.add("visible");

        return;

    }


    const modal =
        document.createElement("div");


    modal.id =
        "modal-revista-instalada";


    modal.className =
        "modal-instalar-ios";


    modal.innerHTML = `

        <div
            class="modal-instalar-ios-contenido"
            onclick="event.stopPropagation()"
        >

            <button
                class="cerrar-modal-ios"
                onclick="cerrarMensajeInstalada()"
                aria-label="Cerrar">

                ×

            </button>


            <div class="icono-instalar-ios">

                ✅

            </div>


            <h2>

                Revista instalada

            </h2>


            <p class="modal-ios-intro">

                <strong>
                    El Molinillo Magazine
                </strong>

                ya está instalada en este dispositivo.

            </p>


            <p
                style="
                    text-align:center;
                    color:#64748b;
                    line-height:1.5;
                "
            >

                Puedes acceder a ella directamente
                desde tu pantalla de inicio o
                aplicaciones.

            </p>


            <button
                class="boton-cerrar-ios"
                onclick="cerrarMensajeInstalada()">

                Entendido

            </button>

        </div>

    `;


    modal.onclick = function(){

        cerrarMensajeInstalada();

    };


    document.body.appendChild(modal);


    requestAnimationFrame(() => {

        modal.classList.add("visible");

    });

}


function cerrarMensajeInstalada(){

    const modal =
        document.getElementById(
            "modal-revista-instalada"
        );


    if(!modal) return;


    modal.classList.remove("visible");


    setTimeout(() => {

        modal.remove();

    },250);

}

function actualizarBotonInstalacion(){

    const boton =
        document.getElementById(
            "boton-instalar-app"
        );


    if(!boton) return;


    const estaEnModoApp =
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches
        ||
        window.navigator.standalone === true;


    if(estaEnModoApp){

        boton.innerHTML =
            "✅ Revista instalada";


        boton.disabled = true;


        boton.style.opacity = "0.7";


        boton.style.cursor =
            "default";

    }

}

function mostrarInstruccionesIOS(){

    const existente =
        document.getElementById(
            "modal-instalar-ios"
        );

    if(existente){

        existente.classList.add("visible");

        return;

    }


    const modal =
        document.createElement("div");

    modal.id =
        "modal-instalar-ios";

    modal.className =
        "modal-instalar-ios";


    modal.innerHTML = `

        <div
            class="modal-instalar-ios-contenido"
            onclick="event.stopPropagation()"
        >

            <button
                class="cerrar-modal-ios"
                onclick="cerrarInstruccionesIOS()"
                aria-label="Cerrar">

                ×

            </button>


            <div class="icono-instalar-ios">

                📱

            </div>


            <h2>

                Instala la revista

            </h2>


            <p class="modal-ios-intro">

                Ten <strong>El Molinillo Magazine</strong>
                siempre a mano en tu iPhone.

            </p>


            <div class="pasos-ios">

                <div class="paso-ios">

                    <span class="numero-paso-ios">
                        1
                    </span>

                    <div>

                        <strong>
                            Pulsa Compartir
                        </strong>

                        <p>
                            Pulsa el botón
                            <strong>Compartir ↗️</strong>
                            de Safari.
                        </p>

                    </div>

                </div>


                <div class="paso-ios">

                    <span class="numero-paso-ios">
                        2
                    </span>

                    <div>

                        <strong>
                            Añadir a pantalla de inicio
                        </strong>

                        <p>
                            Busca y selecciona
                            <strong>«Añadir a pantalla de inicio»</strong>.
                        </p>

                    </div>

                </div>


                <div class="paso-ios">

                    <span class="numero-paso-ios">
                        3
                    </span>

                    <div>

                        <strong>
                            Pulsa Añadir
                        </strong>

                        <p>
                            Confirma pulsando
                            <strong>«Añadir»</strong>.
                        </p>

                    </div>

                </div>

            </div>


            <button
                class="boton-cerrar-ios"
                onclick="cerrarInstruccionesIOS()">

                Entendido

            </button>

        </div>

    `;


    modal.onclick = function(){

        cerrarInstruccionesIOS();

    };


    document.body.appendChild(modal);


    requestAnimationFrame(() => {

        modal.classList.add("visible");

    });

}


function cerrarInstruccionesIOS(){

    const modal =
        document.getElementById(
            "modal-instalar-ios"
        );


    if(!modal) return;


    modal.classList.remove("visible");


    setTimeout(() => {

        modal.remove();

    }, 250);

}

// =======================================================
// PRECARGAR IMÁGENES DE LAS SECCIONES EN SEGUNDO PLANO
// =======================================================

function precargarImagenesSecciones() {

    if (!noticias || !noticias.length) {
        return;
    }

    console.log("🖼️ Iniciando precarga de imágenes...");

    // Esperamos un poco para NO ralentizar la portada
    setTimeout(() => {

        noticias.forEach(noticia => {

            const url = obtenerImagenURL(noticia);

            if (!url) {
                return;
            }

            const imagen = new Image();

            imagen.src = url;

        });

        console.log("🖼️ Precarga de imágenes iniciada");

    }, 1500);

}

// =======================================================
// PRECARGA DE IMÁGENES INICIALES
// =======================================================

async function precargarImagenesIniciales(){

    console.log(
        "🖼️ Preparando imágenes iniciales..."
    );


    const urls = [];


    // ==========================================
    // PORTADA DE LA EDICIÓN
    // ==========================================

    if(
        edicion &&
        edicion.portada &&
        edicion.portada.imagen
    ){

        const url =
            `https://drive.google.com/thumbnail?id=${
                edicion.portada.imagen
            }&sz=w1200`;

        urls.push(url);

    }


    // ==========================================
    // IMÁGENES DE LAS NOTICIAS DE LA PORTADA
    // ==========================================

    if(
        Array.isArray(noticias) &&
        noticias.length
    ){

        noticias.forEach(noticia => {

            const url =
                obtenerImagenURL(noticia);

            if(
                url &&
                !url.startsWith("assets/")
            ){

                urls.push(url);

            }

        });

    }


    // ==========================================
    // ELIMINAR DUPLICADAS
    // ==========================================

    const urlsUnicas =
        [...new Set(urls)];


    console.log(
        "🖼️ Imágenes a preparar:",
        urlsUnicas.length
    );


    if(!urlsUnicas.length){

        return;

    }


    // ==========================================
    // CARGAR TODAS LAS IMÁGENES
    // ==========================================

    await Promise.all(

        urlsUnicas.map(url => {

            return new Promise(resolve => {

                const img =
                    new Image();


                img.onload = () => {

                    console.log(
                        "✅ Imagen cargada:",
                        url
                    );

                    resolve();

                };


                img.onerror = () => {

                    console.warn(
                        "⚠️ No se pudo cargar:",
                        url
                    );

                    // IMPORTANTÍSIMO:
                    // una imagen rota NO bloquea
                    // la entrada a la revista

                    resolve();

                };


                img.src = url;

            });

        })

    );


    console.log(
        "🖼️ Imágenes iniciales preparadas"
    );

}

function precargarPortadasHemeroteca(){

    if(!Array.isArray(hemeroteca)) return;

    console.log(
        "🖼️ Precargando portadas de la hemeroteca..."
    );

    hemeroteca.forEach(edicion => {

        if(!edicion.imagen) return;

        const url =
            `https://drive.google.com/thumbnail?id=${edicion.imagen}&sz=w900`;

        const imagen =
            new Image();

        imagen.src = url;

    });

}

function contactarConNosotros(){

    const correo = "revismol@gmail.com";

    const asunto =
        encodeURIComponent(
            "Contacto - El Molinillo Magazine"
        );

    const cuerpo =
        encodeURIComponent(
            "Hola, El Molinillo Magazine:\n\n"
        );


    // ==========================================
    // COMPROBAR SI ES MÓVIL
    // ==========================================

    const esMovil =
        /Android|iPhone|iPad|iPod/i.test(
            navigator.userAgent
        );


    // ==========================================
    // MÓVIL
    // ==========================================

    if(esMovil){

        window.location.href =
            `mailto:${correo}?subject=${asunto}&body=${cuerpo}`;

        return;

    }


    // ==========================================
    // ORDENADOR
    // ==========================================

    window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(correo)}&su=${asunto}&body=${cuerpo}`,
        "_blank"
    );

}

