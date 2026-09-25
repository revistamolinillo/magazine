// =======================================================
// NAVEGACIÓN
//
// Cada pantalla que se abre queda guardada en el historial
// del navegador, así que el botón "atrás" (o el gesto de
// volver en el móvil) funciona como se espera y recuerda
// la posición, la búsqueda y la edición que se estaba leyendo.
// =======================================================


// -------------------------------------------------------
// TIPOS DE VISTA
//
//   portada · secciones · seccion-NOMBRE · hemeroteca
//   podcasts · buscador · noticia-ID · podcast-ID
// -------------------------------------------------------

function tipoVista(vista){

    if(vista.startsWith("noticia-")) return "noticia";
    if(vista.startsWith("podcast-")) return "podcast";
    if(vista.startsWith("seccion-")) return "seccion";

    return vista;

}


// -------------------------------------------------------
// HISTORIAL
// -------------------------------------------------------

function indiceHistorial(){

    return (
        history.state &&
        typeof history.state.idx === "number"
    )
        ? history.state.idx
        : 0;

}


// Datos de la pantalla que hay que recordar al volver
function capturarContexto(){

    const ctx = { ...contextoVista };

    if(tipoVista(vistaActual) === "buscador"){

        const input = document.getElementById("inputBusqueda");

        if(input) ctx.q = input.value;

    }

    return ctx;

}


// Guarda dónde estábamos antes de salir de una pantalla
function guardarPosicion(){

    if(!history.state) return;

    history.replaceState(
        {
            ...history.state,
            scroll: window.scrollY,
            ctx: capturarContexto()
        },
        ""
    );

}


// Sitúa la pantalla en la posición pedida una vez dibujada
function posicionar(scroll){

    window.scrollTo({ top:0, left:0, behavior:"instant" });

    if(!scroll) return;

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            window.scrollTo({
                top:scroll,
                left:0,
                behavior:"instant"
            });

        });

    });

}


// -------------------------------------------------------
// MOSTRAR UNA VISTA
// -------------------------------------------------------

// Cuando se pone una pantalla de "cargando", la posición
// ya se guardó antes y no hay que guardarla otra vez
let posicionYaGuardada = false;

// Edición que se ve ahora mismo en pantalla
let edicionPintada = null;


function mostrarVista(vista, opciones = {}){

    const {
        historial = true,
        reemplazar = false,
        ctx = {}
    } = opciones;

    // Pulsar el enlace de la pantalla en la que ya estamos
    // solo nos lleva arriba (sin llenar el historial)
    if(
        historial &&
        !reemplazar &&
        vista === vistaActual &&
        idEdicionLeyendo === edicionPintada &&
        JSON.stringify(ctx) === JSON.stringify(contextoVista)
    ){

        window.scrollTo({ top:0, behavior:"smooth" });

        return;

    }

    cerrarLightbox();

    if(historial && !reemplazar && !posicionYaGuardada){

        guardarPosicion();

    }

    posicionYaGuardada = false;

    vistaActual = vista;

    contextoVista = { ...ctx };

    if(historial){

        const estado = {
            vista,
            edicion: idEdicionLeyendo,
            idx: reemplazar
                ? indiceHistorial()
                : indiceHistorial() + 1,
            scroll: 0,
            ctx: contextoVista
        };

        if(reemplazar){

            history.replaceState(estado, "");

        }else{

            history.pushState(estado, "");

        }

    }

    pintarVista(vista, true);

    posicionar(0);

}


// Dibuja la vista en pantalla (sin tocar el historial)
function pintarVista(vista, enfocar){

    const contenido = document.getElementById("contenido");

    if(!contenido) return;

    const tipo = tipoVista(vista);

    const nombre = vista.slice(vista.indexOf("-") + 1);

    let html = "";

    switch(tipo){

        case "secciones":
            html = renderSecciones();
            break;

        case "seccion":
            html = renderVistaSeccion(nombre);
            break;

        case "hemeroteca":
            html = renderHemeroteca();
            break;

        case "podcasts":
            html = renderVistaPodcasts();
            break;

        case "buscador":
            html = renderBuscador();
            break;

        case "noticia":
            html = renderVistaNoticia(nombre);
            break;

        case "podcast":
            html = renderVistaPodcast(nombre);
            break;

        default:
            html = renderPortada();

    }

    // Si se estaba leyendo en voz alta, se detiene al cambiar de pantalla
    detenerLectura();

    contenido.innerHTML = html + renderFooter();

    edicionPintada = idEdicionLeyendo;

    document.body.dataset.vista = tipo;

    actualizarNavegacion();

    actualizarTituloDocumento(vista);

    actualizarBotonInstalacion();

    // Barra de progreso solo al leer
    if(tipo === "noticia" || tipo === "podcast"){

        const publicacion = buscarPublicacion(nombre);

        const clave =
            publicacion
            ? (
                tipo === "podcast"
                ? claveSeccion(subseccionPodcast(publicacion))
                : claveSeccion(publicacion.Seccion)
            )
            : "otras";

        activarProgresoLectura(clave);

    }else{

        desactivarProgresoLectura();

    }

    if(tipo === "noticia"){

        prepararHerramientasLectura();

    }

    if(tipo === "buscador"){

        prepararBuscador(enfocar);

    }

    if(enfocar){

        contenido.focus({ preventScroll:true });

    }

}


function actualizarTituloDocumento(vista){

    const tipo = tipoVista(vista);

    const nombre = vista.slice(vista.indexOf("-") + 1);

    let titulo = CONFIG.nombreRevista;

    if(tipo === "noticia" || tipo === "podcast"){

        const publicacion = buscarPublicacion(nombre);

        if(publicacion){
            titulo = publicacion.Titulo + " | " + CONFIG.nombreRevista;
        }

    }else if(tipo === "seccion"){

        titulo = nombre + " | " + CONFIG.nombreRevista;

    }else{

        const nombres = {
            secciones:"Secciones",
            hemeroteca:"Hemeroteca",
            podcasts:"Podcasts",
            buscador:"Buscar"
        };

        if(nombres[tipo]){
            titulo = nombres[tipo] + " | " + CONFIG.nombreRevista;
        }

    }

    document.title = titulo;

}


// -------------------------------------------------------
// VOLVER
// -------------------------------------------------------

// Vuelve a la pantalla anterior. Si se entró directamente
// por un enlace (no hay pantalla anterior), va a la indicada.
function volver(destino = "portada", ctx = {}){

    if(indiceHistorial() > 0){

        history.back();

        return;

    }

    mostrarVista(destino, { reemplazar:true, ctx });

}


// El botón "atrás" del navegador o del móvil
window.addEventListener("popstate", async evento => {

    const estado = evento.state;

    if(!estado) return;

    cerrarLightbox();

    cerrarModal(true);

    // La pantalla pertenece a otra edición: hay que cargarla
    if(
        estado.edicion &&
        estado.edicion !== idEdicionLeyendo
    ){

        try{

            await cargarEdicion(estado.edicion);

        }catch(error){

            console.error(error);

        }

    }

    vistaActual = estado.vista;

    contextoVista = { ...(estado.ctx || {}) };

    pintarVista(estado.vista, false);

    posicionar(estado.scroll || 0);

});


// -------------------------------------------------------
// EDICIONES
// -------------------------------------------------------

// Carga los datos de una edición y la deja lista para leer
async function cargarEdicion(id){

    let datos = datosEdicionesCargadas[id];

    if(!datos){

        const url =
            id === idEdicionActual
            ? (modoPreview ? CONFIG.urlDatosPreview : CONFIG.urlDatos)
            : "data/ediciones/" + id + ".json";

        const respuesta = await fetch(url);

        if(!respuesta.ok){

            throw new Error("HTTP " + respuesta.status);

        }

        datos = await respuesta.json();

        datosEdicionesCargadas[id] = datos;

    }

    aplicarEdicion(datos);

}


async function abrirEdicion(id, vistaFinal = "portada", opciones = {}){

    if(id !== idEdicionLeyendo){

        try{

            if(!datosEdicionesCargadas[id]){

                guardarPosicion();

                posicionYaGuardada = true;

                document.getElementById("contenido").innerHTML =
                    renderCargando();

            }

            await cargarEdicion(id);

        }catch(error){

            console.error("Error cargando edición:", id, error);

            posicionYaGuardada = false;

            document.getElementById("contenido").innerHTML =
                renderErrorEdicion(error.message) + renderFooter();

            return;

        }

    }

    mostrarVista(vistaFinal || "portada", opciones);

}


// "Revista" siempre lleva a la edición más reciente
async function volverRevistaActual(){

    if(idEdicionLeyendo === idEdicionActual){

        mostrarVista("portada");

        return;

    }

    await abrirEdicion(idEdicionActual);

}


// -------------------------------------------------------
// ABRIR UNA NOTICIA O UN PODCAST
// -------------------------------------------------------

async function irANoticia(id, opciones = {}){

    const publicacion =
        todasLasNoticias.find(
            n => String(n.ID) === String(id)
        );

    // Si no existe, la propia vista explica qué ha pasado
    if(!publicacion){

        mostrarVista("noticia-" + id, opciones);

        return;

    }

    const vistaDestino =
        (esPodcast(publicacion) ? "podcast-" : "noticia-") + id;

    if(
        publicacion.Edicion &&
        publicacion.Edicion !== idEdicionLeyendo
    ){

        await abrirEdicion(
            publicacion.Edicion,
            vistaDestino,
            opciones
        );

    }else{

        mostrarVista(vistaDestino, opciones);

    }

}
