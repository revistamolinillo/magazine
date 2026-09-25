// =======================================================
// EL MOLINILLO MAGAZINE
// Arranque de la aplicación y carga de datos.
// =======================================================

window.addEventListener("DOMContentLoaded", iniciar);


// -------------------------------------------------------
// ARRANQUE
// -------------------------------------------------------

async function iniciar(){

    modoPreview =
        window.location.pathname.includes("preview.html");

    if(modoPreview){

        document.body.classList.add("modo-preview");

    }

    // La posición al volver la gestiona la propia revista
    if("scrollRestoration" in history){

        history.scrollRestoration = "manual";

    }

    try{

        actualizarBotonTema();

        aplicarTamanoTexto();

        // 1. Datos
        await cargarDatos();

        // 2. Imagen de la portada (sin esperar más de lo razonable)
        await precargarImagenPortada();

        // 3. Estructura de la página
        montarEstructura();

        history.replaceState(
            {
                vista:"portada",
                edicion:idEdicionLeyendo,
                idx:0,
                scroll:0,
                ctx:{}
            },
            ""
        );

        // 4. Pantalla inicial (¿venimos de un enlace?)
        const parametros =
            new URLSearchParams(window.location.search);

        const noticia = parametros.get("noticia");

        const vista = parametros.get("vista");

        const vistasPermitidas = [
            "secciones",
            "hemeroteca",
            "podcasts",
            "buscador"
        ];

        if(noticia){

            await irANoticia(noticia, { reemplazar:true });

        }else if(vistasPermitidas.includes(vista)){

            mostrarVista(vista, { reemplazar:true });

        }else{

            mostrarVista("portada", { reemplazar:true });

        }

        // 5. Ya podemos quitar la pantalla de carga
        requestAnimationFrame(() => {

            requestAnimationFrame(ocultarPantallaCarga);

        });

        registrarServiceWorker();

    }catch(error){

        console.error("Error cargando la revista:", error);

        mostrarErrorCarga();

    }

}


// -------------------------------------------------------
// PANTALLA DE CARGA
// -------------------------------------------------------

function ocultarPantallaCarga(){

    window.revistaLista = true;

    const pantalla = document.getElementById("pantalla-carga");

    if(!pantalla) return;

    pantalla.classList.add("oculta");

    setTimeout(() => pantalla.remove(), 500);

}


function mostrarErrorCarga(){

    const pantalla = document.getElementById("pantalla-carga");

    if(!pantalla) return;

    pantalla.classList.add("con-error");

    const texto = pantalla.querySelector(".carga-texto");

    if(texto){

        texto.textContent =
            "No se ha podido cargar la revista. Comprueba tu conexión.";

    }

    const puntos = pantalla.querySelector(".carga-puntos");

    if(puntos){

        puntos.innerHTML = `
            <button
                class="boton boton-primario"
                type="button"
                onclick="window.location.reload()">
                Intentarlo de nuevo
            </button>
        `;

    }

}


// -------------------------------------------------------
// CARGA DE DATOS
// -------------------------------------------------------

// Las fichas de la edición actual y de la hemeroteca cambian
// a menudo: se piden siempre frescas.
async function pedirJSON(url, fresco = true){

    const direccion =
        fresco
        ? url + "?v=" + Date.now()
        : url;

    const respuesta = await fetch(
        direccion,
        fresco ? { cache:"no-store" } : undefined
    );

    if(!respuesta.ok){

        throw new Error("HTTP " + respuesta.status + " en " + url);

    }

    return respuesta.json();

}


async function cargarDatos(){

    datosEdicionesCargadas = {};

    const archivo =
        modoPreview
        ? CONFIG.urlDatosPreview
        : CONFIG.urlDatos;

    const datos = await pedirJSON(archivo);

    idEdicionActual = datos.id;

    datosEdicionesCargadas[datos.id] = datos;

    aplicarEdicion(datos);

    await cargarHemeroteca();

    await cargarTodasLasNoticias();

    prepararIndiceBusqueda();

}


function numeroEdicion(id){

    const numero = parseInt(String(id || "").replace(/\D/g, ""), 10);

    return Number.isFinite(numero) ? String(numero) : "";

}


function ordenDe(publicacion){

    const numero = Number(publicacion.Orden);

    return (
        publicacion.Orden !== "" &&
        publicacion.Orden !== null &&
        publicacion.Orden !== undefined &&
        Number.isFinite(numero)
    )
        ? numero
        : 9999;

}


// Deja lista una edición para leerla:
// portada, noticias y podcasts
function aplicarEdicion(datos){

    datos.noticias = datos.noticias || [];

    datosEdicionActual = datos;

    idEdicionLeyendo = datos.id;

    edicion.mes = datos.mes || "";
    edicion.curso = datos.curso || "";
    edicion.numero = numeroEdicion(datos.id);

    if(datos.portada){

        edicion.portada = {
            titulo: datos.portada.Titulo || "",
            entradilla: datos.portada.Entradilla || "",
            imagen: obtenerImagenPortadaEdicion(datos),
            seccion: datos.portada.Seccion || ""
        };

    }else{

        edicion.portada = {
            titulo:"",
            entradilla:"",
            imagen:"",
            seccion:""
        };

    }

    noticias.length = 0;
    podcasts.length = 0;

    datos.noticias.forEach(publicacion => {

        publicacion.Edicion = datos.id;

        if(esPodcast(publicacion)){

            podcasts.push(publicacion);

        }else{

            noticias.push(publicacion);

        }

    });

    noticias.sort((a, b) => ordenDe(a) - ordenDe(b));
    podcasts.sort((a, b) => ordenDe(a) - ordenDe(b));

}


// La imagen de la portada, por orden de preferencia
function obtenerImagenPortadaEdicion(datos){

    if(!datos) return "";

    const lista = datos.noticias || [];

    const portada = datos.portada || {};

    let noticiaPortada = null;

    // Primero se localiza por identificador...
    if(portada.ID){

        noticiaPortada =
            lista.find(n => String(n.ID) === String(portada.ID));

    }

    // ...y si no, por el título
    if(!noticiaPortada && portada.Titulo){

        noticiaPortada =
            lista.find(n =>
                n.Titulo &&
                n.Titulo.trim().toLowerCase() ===
                portada.Titulo.trim().toLowerCase()
            );

    }

    const candidatas = [

        noticiaPortada && noticiaPortada.ImagenPrincipal,

        portada.ImagenPrincipal,

        portada.ImagenPortada

    ];

    for(const candidata of candidatas){

        if(candidata && String(candidata).trim() !== ""){

            return String(candidata).trim();

        }

    }

    // Último recurso: la primera imagen de la noticia
    if(noticiaPortada){

        const imagenes = obtenerImagenes(noticiaPortada);

        if(imagenes.length > 0) return imagenes[0].id;

    }

    return "";

}


async function cargarHemeroteca(){

    try{

        const datos = await pedirJSON(CONFIG.urlHemeroteca);

        hemeroteca = Array.isArray(datos) ? datos : [];

    }catch(error){

        console.error("Error cargando la hemeroteca:", error);

        hemeroteca = [];

    }

    // Las portadas se van preparando en segundo plano
    hemeroteca.forEach(edicionLista => {

        if(edicionLista.imagen){

            new Image().src = urlDrive(edicionLista.imagen, 900);

        }

    });

}


// Reúne el contenido de todas las ediciones
// (para el buscador y para los podcasts)
async function cargarTodasLasNoticias(){

    todasLasNoticias = [];
    todosLosPodcasts = [];

    // Un mismo contenido puede aparecer en varias ediciones:
    // solo se cuenta una vez (la edición más reciente)
    const vistos = new Set();

    const anadir = datos => {

        (datos.noticias || []).forEach(publicacion => {

            publicacion.Edicion = datos.id;

            const clave = String(publicacion.ID);

            if(vistos.has(clave)) return;

            vistos.add(clave);

            todasLasNoticias.push(publicacion);

            if(esPodcast(publicacion)){

                todosLosPodcasts.push(publicacion);

            }

        });

    };

    anadir(datosEdicionesCargadas[idEdicionActual]);

    const pendientes =
        hemeroteca.filter(e => e.id !== idEdicionActual);

    // Todas las ediciones a la vez
    const resultados = await Promise.all(

        pendientes.map(async edicionLista => {

            try{

                return await pedirJSON(
                    "data/ediciones/" + edicionLista.id + ".json",
                    false
                );

            }catch(error){

                console.warn(
                    "No se pudo cargar la edición",
                    edicionLista.id,
                    error
                );

                return null;

            }

        })

    );

    resultados.forEach((datos, i) => {

        if(!datos) return;

        datosEdicionesCargadas[pendientes[i].id] = datos;

        anadir(datos);

    });

}


// La imagen de la portada es lo primero que se ve:
// se espera a que llegue, pero nunca más de 3 segundos
function precargarImagenPortada(){

    const url = urlDrive(edicion.portada.imagen, 1600);

    if(!url) return Promise.resolve();

    const carga = new Promise(resolve => {

        const imagen = new Image();

        imagen.onload = imagen.onerror = () => resolve();

        imagen.src = url;

    });

    const limite = new Promise(resolve => setTimeout(resolve, 3000));

    return Promise.race([carga, limite]);

}


// -------------------------------------------------------
// SERVICE WORKER Y NUEVAS EDICIONES
// -------------------------------------------------------

function registrarServiceWorker(){

    if(!("serviceWorker" in navigator) || modoPreview) return;

    navigator.serviceWorker
        .register("./service-worker.js")
        .catch(error => {

            console.error("Error registrando Service Worker:", error);

        });

}


if("serviceWorker" in navigator){

    // Si ya había una versión instalada y llega otra nueva, se avisa
    const teniaControlador = !!navigator.serviceWorker.controller;

    navigator.serviceWorker.addEventListener("controllerchange", () => {

        if(!teniaControlador || modoPreview) return;

        toast("La revista se ha actualizado.", {
            accion:"Recargar",
            alAccion:() => window.location.reload(),
            duracion:15000
        });

    });

    navigator.serviceWorker.addEventListener("message", evento => {

        if(
            evento.data &&
            evento.data.tipo === "NUEVA_EDICION"
        ){

            toast("Hay una edición nueva de la revista.", {
                accion:"Ver ahora",
                alAccion:() => window.location.reload(),
                duracion:12000
            });

        }

    });

}


// Si la revista se deja abierta (por ejemplo en el móvil) y mientras
// tanto se publica algo nuevo, al volver a ella se avisa.
let ultimaComprobacion = Date.now();
let avisadaNuevaEdicion = false;


document.addEventListener("visibilitychange", () => {

    if(document.visibilityState === "visible"){

        comprobarNuevaEdicion();

    }

});


async function comprobarNuevaEdicion(){

    const DIEZ_MINUTOS = 10 * 60 * 1000;

    if(
        modoPreview ||
        avisadaNuevaEdicion ||
        !datosEdicionesCargadas[idEdicionActual] ||
        Date.now() - ultimaComprobacion < DIEZ_MINUTOS
    ){
        return;
    }

    ultimaComprobacion = Date.now();

    try{

        const datos = await pedirJSON(CONFIG.urlDatos);

        const actual = datosEdicionesCargadas[idEdicionActual];

        const hayCambios =
            datos.id !== actual.id ||
            (datos.fechaPublicacion || "") !== (actual.fechaPublicacion || "");

        if(hayCambios){

            avisadaNuevaEdicion = true;

            toast("Hay contenido nuevo en la revista.", {
                accion:"Ver ahora",
                alAccion:() => window.location.reload(),
                duracion:15000
            });

        }

    }catch(error){

        // Sin conexión: no pasa nada, se comprobará otro día

    }

}


// -------------------------------------------------------
// CONEXIÓN
// -------------------------------------------------------

window.addEventListener("offline", () => {

    toast("Sin conexión. Puedes seguir viendo lo que ya has abierto.", {
        duracion:5000
    });

});

window.addEventListener("online", () => {

    toast("Conexión recuperada");

});


// -------------------------------------------------------
// COMPARTIR
// -------------------------------------------------------

function obtenerEnlaceNoticia(id){

    const url = new URL(window.location.href);

    url.search = "";
    url.hash = "";

    url.searchParams.set("noticia", id);

    return url.toString();

}


async function compartirNoticia(id){

    const publicacion = buscarPublicacion(id);

    if(!publicacion) return;

    const url = obtenerEnlaceNoticia(id);

    if(navigator.share){

        const resumen =
            (publicacion.Entradilla || "").slice(0, 160) ||
            "Mira esto en " + CONFIG.nombreRevista;

        try{

            await navigator.share({
                title: publicacion.Titulo,
                text: resumen,
                url
            });

        }catch(error){

            // La persona cerró el menú de compartir: no pasa nada

        }

        return;

    }

    copiarTexto(url);

}


async function copiarEnlaceNoticia(id){

    copiarTexto(obtenerEnlaceNoticia(id));

}


async function copiarTexto(texto){

    try{

        await navigator.clipboard.writeText(texto);

        toast("Enlace copiado");

    }catch(error){

        // Método alternativo para navegadores antiguos
        const cuadro = document.createElement("textarea");

        cuadro.value = texto;

        cuadro.style.position = "fixed";
        cuadro.style.opacity = "0";

        document.body.appendChild(cuadro);

        cuadro.select();

        let copiado = false;

        try{

            copiado = document.execCommand("copy");

        }catch(errorCopia){

            copiado = false;

        }

        cuadro.remove();

        toast(
            copiado
            ? "Enlace copiado"
            : "No se pudo copiar el enlace"
        );

    }

}


// -------------------------------------------------------
// CONTACTO
// -------------------------------------------------------

function contactarConNosotros(){

    const correo = CONFIG.correoContacto;

    const asunto =
        encodeURIComponent("Contacto - " + CONFIG.nombreRevista);

    const cuerpo =
        encodeURIComponent("Hola, " + CONFIG.nombreRevista + ":\n\n");

    const esMovil =
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // En el móvil se abre la aplicación de correo
    if(esMovil){

        window.location.href =
            `mailto:${correo}?subject=${asunto}&body=${cuerpo}`;

        return;

    }

    // En el ordenador se abre Gmail
    window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(correo)}&su=${asunto}&body=${cuerpo}`,
        "_blank",
        "noopener"
    );

}


// -------------------------------------------------------
// INSTALAR LA REVISTA (PWA)
// -------------------------------------------------------

let instalacionPWA = null;


function estaInstalada(){

    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );

}


window.addEventListener("beforeinstallprompt", evento => {

    // Guardamos el aviso para lanzarlo cuando se pulse el botón
    evento.preventDefault();

    instalacionPWA = evento;

});


window.addEventListener("appinstalled", () => {

    instalacionPWA = null;

    actualizarBotonInstalacion();

    toast("Revista instalada");

});


async function instalarPWA(){

    if(estaInstalada()){

        mostrarMensajeInstalada();

        return;

    }

    // iPhone / iPad
    if(/iphone|ipad|ipod/i.test(navigator.userAgent)){

        mostrarInstruccionesIOS();

        return;

    }

    // Android / ordenador con instalación directa
    if(instalacionPWA){

        instalacionPWA.prompt();

        const resultado = await instalacionPWA.userChoice;

        if(resultado.outcome === "accepted"){

            actualizarBotonInstalacion();

        }

        instalacionPWA = null;

        return;

    }

    // Navegadores sin instalación directa
    mostrarInstruccionesGenericas();

}


function actualizarBotonInstalacion(){

    const boton = document.getElementById("boton-instalar-app");

    if(!boton) return;

    if(estaInstalada()){

        boton.innerHTML = `${icono("check", 18)} Revista instalada`;

        boton.disabled = true;

    }

}


function mostrarMensajeInstalada(){

    abrirModal({
        icono:"check",
        titulo:"Revista instalada",
        html:`
            <p class="modal-texto">
                <strong>${esc(CONFIG.nombreRevista)}</strong>
                ya está instalada en este dispositivo.
                Ábrela desde tu pantalla de inicio o tus aplicaciones.
            </p>
        `
    });

}


function mostrarInstruccionesIOS(){

    abrirModal({
        icono:"movil",
        titulo:"Instala la revista",
        html:`
            <p class="modal-texto">
                Ten <strong>${esc(CONFIG.nombreRevista)}</strong>
                siempre a mano en tu iPhone o iPad.
            </p>

            <ol class="pasos">

                <li>
                    <span class="paso-numero">1</span>
                    <span>
                        <strong>Pulsa Compartir</strong>
                        en la barra de Safari.
                    </span>
                </li>

                <li>
                    <span class="paso-numero">2</span>
                    <span>
                        Elige <strong>«Añadir a pantalla de inicio»</strong>.
                    </span>
                </li>

                <li>
                    <span class="paso-numero">3</span>
                    <span>
                        Confirma pulsando <strong>«Añadir»</strong>.
                    </span>
                </li>

            </ol>
        `
    });

}


function mostrarInstruccionesGenericas(){

    abrirModal({
        icono:"movil",
        titulo:"Instala la revista",
        html:`
            <p class="modal-texto">
                Tu navegador no ofrece la instalación con un solo botón,
                pero puedes hacerlo desde su menú:
            </p>

            <ol class="pasos">

                <li>
                    <span class="paso-numero">1</span>
                    <span>
                        Abre el <strong>menú del navegador</strong>
                        (los tres puntos o las tres rayas).
                    </span>
                </li>

                <li>
                    <span class="paso-numero">2</span>
                    <span>
                        Busca <strong>«Instalar aplicación»</strong>
                        o <strong>«Añadir a pantalla de inicio»</strong>.
                    </span>
                </li>

            </ol>
        `
    });

}
