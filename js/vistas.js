// =======================================================
// VISTAS
// Secciones, hemeroteca y lectura de una publicación.
// =======================================================


// Busca una publicación (noticia o podcast) por su identificador.
// Primero en la edición que se lee y después en todas.
function buscarPublicacion(id){

    const buscada = String(id);

    return (
        noticias.find(n => String(n.ID) === buscada) ||
        podcasts.find(n => String(n.ID) === buscada) ||
        todasLasNoticias.find(n => String(n.ID) === buscada) ||
        null
    );

}


function seccionDe(noticia){

    return (noticia.Seccion || "").trim() || "Otras";

}


// -------------------------------------------------------
// SECCIONES
// -------------------------------------------------------

function renderSecciones(){

    const secciones = [
        ...new Set(noticias.map(seccionDe))
    ].sort((a, b) => a.localeCompare(b, "es"));

    if(secciones.length === 0){

        return `

            <div class="pagina">

                <div class="contenedor">

                    <div class="vacio">

                        <h1>No hay secciones en esta edición</h1>

                        <p>Prueba con otra edición desde la hemeroteca.</p>

                    </div>

                </div>

            </div>

        `;

    }

    return `

        <div class="pagina">

            <div class="contenedor">

                <header class="cabecera-pagina">

                    <h1 class="titulo-pagina">Secciones</h1>

                    <p class="subtitulo-pagina">
                        ${esc(edicion.mes)}: elige por dónde empezar.
                    </p>

                </header>

                <div class="grid-tiles">

                    ${secciones.map(seccion => {

                        const total =
                            noticias.filter(n => seccionDe(n) === seccion).length;

                        return `

                            <button
                                class="tile-seccion"
                                type="button"
                                data-sec="${claveSeccion(seccion)}"
                                onclick="abrirSeccion('${esc(seccion).replace(/&#39;/g, "\\'")}')">

                                <span class="tile-seccion-aspa">
                                    ${marcaAspa()}
                                </span>

                                <span class="tile-seccion-texto">

                                    <strong>${esc(seccion)}</strong>

                                    <small>
                                        ${total} ${total === 1 ? "noticia" : "noticias"}
                                    </small>

                                </span>

                            </button>

                        `;

                    }).join("")}

                </div>

            </div>

        </div>

    `;

}


function abrirSeccion(nombre){

    mostrarVista("seccion-" + nombre);

}


function renderVistaSeccion(nombre){

    const lista =
        noticias.filter(n => seccionDe(n) === nombre);

    return `

        <div class="pagina" data-sec="${claveSeccion(nombre)}">

            <div class="contenedor">

                <button
                    class="boton-volver"
                    type="button"
                    onclick="volverDeSeccion()">

                    ${icono("volver", 18)}
                    Secciones

                </button>

                <header class="cabecera-pagina cabecera-pagina-color">

                    <h1 class="titulo-pagina">
                        ${marcaAspa()}
                        ${esc(nombre)}
                    </h1>

                    <p class="subtitulo-pagina">
                        ${lista.length} ${lista.length === 1 ? "artículo" : "artículos"}
                    </p>

                </header>

                <div class="lista-tarjetas">

                    ${lista.map(renderTarjetaNoticia).join("")}

                </div>

            </div>

        </div>

    `;

}


// Tarjeta de una noticia (secciones y buscador)
function renderTarjetaNoticia(noticia){

    return `

        <article
            class="tarjeta"
            data-sec="${claveSeccion(noticia.Seccion)}">

            ${enlacePublicacion(
                noticia.ID,
                `<img
                    src="${esc(obtenerImagenURL(noticia, 800))}"
                    data-fallback="${IMAGEN_NOTICIA}"
                    alt=""
                    loading="lazy"
                    decoding="async">`,
                "tarjeta-foto"
            )}

            <div class="tarjeta-cuerpo">

                ${etiquetaSeccion(noticia.Seccion)}

                <h2 class="tarjeta-titulo">

                    ${enlacePublicacion(
                        noticia.ID,
                        esc(noticia.Titulo),
                        "tarjeta-enlace"
                    )}

                </h2>

                ${renderAutor(noticia)}

                ${
                noticia.Entradilla
                ? `<p class="tarjeta-texto">${esc(noticia.Entradilla)}</p>`
                : ""
                }

                ${enlacePublicacion(
                    noticia.ID,
                    "Leer artículo",
                    "boton boton-suave"
                )}

            </div>

        </article>

    `;

}


function volverDeSeccion(){

    volver("secciones");

}


// -------------------------------------------------------
// HEMEROTECA
// -------------------------------------------------------

function renderHemeroteca(){

    const listaHemeroteca =
        hemeroteca.filter(e => e.id !== idEdicionActual);

    const cursos = [
        ...new Set(listaHemeroteca.map(e => e.curso))
    ].sort().reverse();

    return `

        <div class="pagina">

            <div class="contenedor">

                <header class="cabecera-pagina">

                    <h1 class="titulo-pagina">Hemeroteca</h1>

                    <p class="subtitulo-pagina">
                        Todas las ediciones anteriores.
                    </p>

                </header>

                ${
                cursos.length === 0
                ? `
                    <div class="vacio">
                        <h2>Aún no hay ediciones anteriores</h2>
                        <p>Cuando se publique una nueva edición, la actual pasará aquí.</p>
                    </div>
                `
                : cursos.map(curso =>
                    renderCurso(curso, listaHemeroteca)
                ).join("")
                }

            </div>

        </div>

    `;

}


function renderCurso(curso, listaHemeroteca){

    const lista =
        listaHemeroteca.filter(e => e.curso === curso);

    return `

        <section class="bloque-curso">

            <h2 class="curso-titulo">Curso ${esc(curso)}</h2>

            <div class="grid-hemeroteca">

                ${lista.map(edicionLista => {

                    const leyendo = edicionLista.id === idEdicionLeyendo;

                    return `

                    <button
                        class="edicion"
                        type="button"
                        onclick="abrirEdicion('${esc(edicionLista.id)}')">

                        <span class="edicion-portada">

                            <img
                                src="${esc(urlDrive(edicionLista.imagen, 900))}"
                                data-fallback="${IMAGEN_NOTICIA}"
                                alt=""
                                loading="lazy"
                                decoding="async">

                            ${
                            leyendo
                            ? `<span class="edicion-leyendo">Estás aquí</span>`
                            : ""
                            }

                        </span>

                        <span class="edicion-info">

                            <strong class="edicion-mes">
                                ${esc(edicionLista.nombre)}
                            </strong>

                            <small class="edicion-articulos">
                                ${edicionLista.articulos}
                                ${Number(edicionLista.articulos) === 1 ? "artículo" : "artículos"}
                            </small>

                        </span>

                    </button>

                    `;

                }).join("")}

            </div>

        </section>

    `;

}


function renderCargando(){

    return `

        <div class="pagina">

            <div class="contenedor cargando-edicion">

                <div class="spinner spinner-grande"></div>

                <h2>Abriendo edición...</h2>

                <p>Un momento, estamos preparando la revista.</p>

            </div>

        </div>

    `;

}


function renderErrorEdicion(mensaje){

    return `

        <div class="pagina">

            <div class="contenedor">

                <div class="vacio">

                    <h2>No se pudo cargar la edición</h2>

                    <p>${esc(mensaje)}</p>

                    <button
                        class="boton boton-primario"
                        type="button"
                        onclick="volver('hemeroteca')">
                        Volver
                    </button>

                </div>

            </div>

        </div>

    `;

}


// -------------------------------------------------------
// LEER UNA NOTICIA O UN PODCAST
// -------------------------------------------------------

function renderVistaNoticia(id){

    return renderPublicacion(buscarPublicacion(id), false);

}


function renderVistaPodcast(id){

    return renderPublicacion(buscarPublicacion(id), true);

}


function renderPublicacion(publicacion, comoPodcast){

    if(!publicacion){

        return `

            <div class="pagina">

                <div class="contenedor">

                    <div class="vacio">

                        <h1>No hemos encontrado este contenido</h1>

                        <p>
                            Puede que el enlace sea antiguo o que
                            se haya retirado de la revista.
                        </p>

                        <button
                            class="boton boton-primario"
                            type="button"
                            onclick="volverRevistaActual()">
                            Ir a la revista
                        </button>

                    </div>

                </div>

            </div>

        `;

    }

    const subseccion = subseccionPodcast(publicacion);

    const clave =
        comoPodcast
        ? claveSeccion(subseccion)
        : claveSeccion(publicacion.Seccion);

    const imagen =
        comoPodcast
        ? obtenerImagenPodcast(publicacion, 1400)
        : obtenerImagenURL(publicacion, 1400);

    const tieneImagenes =
        obtenerImagenes(publicacion).length > 0;

    return `

        <div class="pagina" data-sec="${clave}">

            <div class="contenedor-lectura">

                <article class="lectura">

                    <button
                        class="boton-volver"
                        type="button"
                        onclick="volverDePublicacion()">

                        ${icono("volver", 18)}
                        Volver

                    </button>

                    ${
                    comoPodcast
                    ? `<span class="etiqueta-seccion">
                            ${marcaAspa()}
                            Podcast de ${esc(subseccion)}
                       </span>`
                    : etiquetaSeccion(publicacion.Seccion)
                    }

                    <h1 class="lectura-titulo">
                        ${esc(publicacion.Titulo)}
                    </h1>

                    <div class="lectura-meta">

                        ${renderAutor(publicacion)}

                        ${
                        comoPodcast
                        ? ""
                        : `<p class="tiempo-lectura">
                                ${icono("reloj", 16)}
                                ${minutosLectura(publicacion.Cuerpo)} min de lectura
                           </p>`
                        }

                    </div>

                    ${comoPodcast ? "" : renderHerramientasLectura(publicacion)}

                    <${tieneImagenes ? "button" : "div"}
                        class="lectura-foto"
                        ${
                        tieneImagenes
                        ? `type="button"
                           onclick="abrirImagenPrincipal('${esc(publicacion.ID)}')"
                           aria-label="Ampliar imagen"`
                        : ""
                        }>

                        <img
                            src="${esc(imagen)}"
                            data-fallback="${comoPodcast ? IMAGEN_PODCAST : IMAGEN_NOTICIA}"
                            alt="${esc(publicacion.Titulo)}"
                            decoding="async">

                    </${tieneImagenes ? "button" : "div"}>

                    ${
                    publicacion.Entradilla
                    ? `<p class="entradilla">${esc(publicacion.Entradilla)}</p>`
                    : ""
                    }

                    ${
                    comoPodcast
                    ? renderAudioPodcast(publicacion)
                    : ""
                    }

                    ${
                    publicacion.Cuerpo
                    ? `<div class="cuerpo">${textoAParrafos(publicacion.Cuerpo)}</div>`
                    : ""
                    }

                    ${renderGaleriaImagenes(publicacion)}

                    ${comoPodcast ? "" : obtenerMultimedia(publicacion)}

                    ${renderAcciones(publicacion)}

                </article>

                ${renderSigueLeyendo(publicacion)}

            </div>

        </div>

    `;

}


// -------------------------------------------------------
// HERRAMIENTAS DE LECTURA
// Escuchar el artículo y cambiar el tamaño de la letra.
// -------------------------------------------------------

const ESCALAS_TEXTO = [1, 1.15, 1.3, 1.5];

let nivelTexto = 0;

let lecturaActiva = false;

// Cada lectura tiene un número; así una lectura antigua
// nunca sigue hablando por encima de otra nueva.
let numeroLectura = 0;


function renderHerramientasLectura(publicacion){

    const voz =
        lecturaDisponible()
        ? `
            <button
                id="boton-leer-voz"
                class="boton boton-suave boton-pequeno"
                type="button"
                aria-pressed="false"
                onclick="alternarLectura('${esc(publicacion.ID)}')">
            </button>
        `
        : "";

    return `

        <div
            class="herramientas-lectura"
            role="group"
            aria-label="Opciones de lectura">

            ${voz}

            <div
                class="tamano-texto"
                role="group"
                aria-label="Tamaño de letra">

                <button
                    id="boton-texto-menos"
                    class="boton-texto"
                    type="button"
                    onclick="cambiarTamanoTexto(-1)"
                    aria-label="Reducir letra">
                    <span class="letra-pequena" aria-hidden="true">A</span>
                </button>

                <button
                    id="boton-texto-mas"
                    class="boton-texto"
                    type="button"
                    onclick="cambiarTamanoTexto(1)"
                    aria-label="Aumentar letra">
                    <span class="letra-grande" aria-hidden="true">A</span>
                </button>

            </div>

        </div>

    `;

}


// Se llama después de dibujar una noticia
function prepararHerramientasLectura(){

    actualizarBotonLectura();

    actualizarBotonesTexto();

}


// ----- Tamaño de letra -----

function aplicarTamanoTexto(){

    try{

        const guardado =
            parseInt(localStorage.getItem("molinillo-texto"), 10);

        if(guardado >= 0 && guardado < ESCALAS_TEXTO.length){

            nivelTexto = guardado;

        }

    }catch(error){

        // Si no se puede leer lo guardado, se usa el tamaño normal

    }

    document.documentElement.style.setProperty(
        "--escala-texto",
        ESCALAS_TEXTO[nivelTexto]
    );

}


function cambiarTamanoTexto(cambio){

    const nuevo =
        Math.min(
            ESCALAS_TEXTO.length - 1,
            Math.max(0, nivelTexto + cambio)
        );

    if(nuevo === nivelTexto) return;

    nivelTexto = nuevo;

    document.documentElement.style.setProperty(
        "--escala-texto",
        ESCALAS_TEXTO[nivelTexto]
    );

    try{

        localStorage.setItem("molinillo-texto", String(nivelTexto));

    }catch(error){

        // El cambio vale igualmente durante esta visita

    }

    actualizarBotonesTexto();

}


function actualizarBotonesTexto(){

    const menos = document.getElementById("boton-texto-menos");
    const mas = document.getElementById("boton-texto-mas");

    if(menos) menos.disabled = nivelTexto === 0;

    if(mas) mas.disabled = nivelTexto === ESCALAS_TEXTO.length - 1;

}


// ----- Escuchar el artículo -----

function lecturaDisponible(){

    return (
        "speechSynthesis" in window &&
        "SpeechSynthesisUtterance" in window
    );

}


// Una frase muy larga se parte por las comas y, si aún no basta, por palabras
function partirFraseLarga(frase, maximo){

    if(frase.length <= maximo) return [frase];

    const salida = [];

    let actual = "";

    frase.split(/(?<=[,;:])\s+/).forEach(parte => {

        const trozos =
            parte.length > maximo
            ? partirPorPalabras(parte, maximo)
            : [parte];

        trozos.forEach(trozo => {

            if(actual && (actual + " " + trozo).length > maximo){

                salida.push(actual);

                actual = trozo;

            }else{

                actual = actual ? actual + " " + trozo : trozo;

            }

        });

    });

    if(actual) salida.push(actual);

    return salida;

}


function partirPorPalabras(texto, maximo){

    const salida = [];

    let actual = "";

    texto.split(/\s+/).forEach(palabra => {

        if(actual && (actual + " " + palabra).length > maximo){

            salida.push(actual);

            actual = palabra;

        }else{

            actual = actual ? actual + " " + palabra : palabra;

        }

    });

    if(actual) salida.push(actual);

    return salida;

}


// Trozos de texto cortos: los navegadores dejan de hablar
// si se les da un texto muy largo de una vez.
function trocearParaVoz(texto, maximo = 220){

    const frases =
        texto
            .replace(/\r\n?/g, "\n")
            .split(/(?<=[.!?…])\s+|\n+/)
            .map(f => f.trim())
            .filter(Boolean)
            .flatMap(frase => partirFraseLarga(frase, maximo));

    const trozos = [];

    let actual = "";

    frases.forEach(frase => {

        if(actual && (actual + " " + frase).length > maximo){

            trozos.push(actual);

            actual = frase;

        }else{

            actual = actual ? actual + " " + frase : frase;

        }

    });

    if(actual) trozos.push(actual);

    return trozos;

}


function elegirVoz(){

    const voces = window.speechSynthesis.getVoices();

    return (
        voces.find(v => v.lang && v.lang.toLowerCase() === "es-es") ||
        voces.find(v => v.lang && v.lang.toLowerCase().startsWith("es")) ||
        null
    );

}


function alternarLectura(id){

    if(lecturaActiva){

        detenerLectura();

        return;

    }

    const publicacion = buscarPublicacion(id);

    if(!publicacion || !lecturaDisponible()) return;

    const texto = [
        publicacion.Titulo,
        publicacion.Entradilla,
        publicacion.Cuerpo
    ].filter(Boolean).join(".\n");

    const trozos = trocearParaVoz(texto);

    if(trozos.length === 0) return;

    window.speechSynthesis.cancel();

    numeroLectura++;

    const miLectura = numeroLectura;

    lecturaActiva = true;

    actualizarBotonLectura();

    let indice = 0;

    const hablarSiguiente = () => {

        if(!lecturaActiva || miLectura !== numeroLectura) return;

        if(indice >= trozos.length){

            detenerLectura();

            return;

        }

        const frase = new SpeechSynthesisUtterance(trozos[indice++]);

        frase.lang = "es-ES";

        const voz = elegirVoz();

        if(voz) frase.voice = voz;

        frase.onend = hablarSiguiente;

        frase.onerror = evento => {

            // Al cancelar la lectura el navegador avisa con un "error"
            if(
                evento.error !== "interrupted" &&
                evento.error !== "canceled"
            ){

                detenerLectura();

            }

        };

        window.speechSynthesis.speak(frase);

    };

    hablarSiguiente();

}


function detenerLectura(){

    if(!lecturaActiva && !document.getElementById("boton-leer-voz")){
        return;
    }

    lecturaActiva = false;

    numeroLectura++;

    if(lecturaDisponible()){

        window.speechSynthesis.cancel();

    }

    actualizarBotonLectura();

}


function actualizarBotonLectura(){

    const boton = document.getElementById("boton-leer-voz");

    if(!boton) return;

    boton.setAttribute("aria-pressed", String(lecturaActiva));

    boton.innerHTML =
        lecturaActiva
        ? `${icono("cerrar", 18)} Detener lectura`
        : `${icono("auriculares", 18)} Escuchar artículo`;

}


function volverDePublicacion(){

    volver(
        tipoVista(vistaActual) === "podcast"
        ? "podcasts"
        : "portada"
    );

}


// Sugerencias al final de un artículo (misma edición)
function renderSigueLeyendo(actual){

    const otras =
        [...noticias, ...podcasts]
            .filter(p => String(p.ID) !== String(actual.ID));

    if(otras.length === 0) return "";

    // Primero las de la misma sección
    const seccionActual = claveSeccion(actual.Seccion);

    otras.sort((a, b) => {

        const mismaA = claveSeccion(a.Seccion) === seccionActual ? 0 : 1;
        const mismaB = claveSeccion(b.Seccion) === seccionActual ? 0 : 1;

        return mismaA - mismaB;

    });

    const elegidas = otras.slice(0, 3);

    return `

        <aside class="sigue-leyendo">

            <h2 class="sigue-leyendo-titulo">Sigue leyendo</h2>

            <div class="sigue-leyendo-lista">

                ${elegidas.map(publicacion => {

                    const podcast = esPodcast(publicacion);

                    const clave =
                        podcast
                        ? claveSeccion(subseccionPodcast(publicacion))
                        : claveSeccion(publicacion.Seccion);

                    const nombre =
                        podcast
                        ? "Podcast de " + subseccionPodcast(publicacion)
                        : seccionDe(publicacion);

                    return `

                        <a
                            class="sugerencia"
                            data-sec="${clave}"
                            href="?noticia=${encodeURIComponent(publicacion.ID)}"
                            onclick="return abrirDesdeEnlace(event,'${esc(publicacion.ID)}')">

                            <img
                                src="${esc(
                                    podcast
                                    ? obtenerImagenPodcast(publicacion, 500)
                                    : obtenerImagenURL(publicacion, 500)
                                )}"
                                data-fallback="${podcast ? IMAGEN_PODCAST : IMAGEN_NOTICIA}"
                                alt=""
                                loading="lazy"
                                decoding="async">

                            <span class="sugerencia-texto">

                                <span class="etiqueta-seccion">
                                    ${marcaAspa()}
                                    ${esc(nombre)}
                                </span>

                                <strong>${esc(publicacion.Titulo)}</strong>

                            </span>

                        </a>

                    `;

                }).join("")}

            </div>

        </aside>

    `;

}


// -------------------------------------------------------
// BARRA DE PROGRESO DE LECTURA
// Toma el color de la sección del artículo.
// -------------------------------------------------------

let progresoPendiente = false;


function activarProgresoLectura(clave){

    let barra = document.getElementById("barra-progreso-lectura");

    if(!barra){

        barra = document.createElement("div");
        barra.id = "barra-progreso-lectura";
        barra.setAttribute("aria-hidden", "true");

        document.body.appendChild(barra);

    }

    barra.dataset.sec = clave || "otras";

    window.removeEventListener("scroll", programarProgresoLectura);

    window.addEventListener(
        "scroll",
        programarProgresoLectura,
        { passive:true }
    );

    actualizarProgresoLectura();

}


function programarProgresoLectura(){

    if(progresoPendiente) return;

    progresoPendiente = true;

    requestAnimationFrame(() => {

        progresoPendiente = false;

        actualizarProgresoLectura();

    });

}


function actualizarProgresoLectura(){

    const barra = document.getElementById("barra-progreso-lectura");

    if(!barra) return;

    const alturaTotal =
        document.documentElement.scrollHeight - window.innerHeight;

    if(alturaTotal <= 0){

        barra.style.transform = "scaleX(1)";

        return;

    }

    const progreso =
        Math.min(1, Math.max(0, window.scrollY / alturaTotal));

    barra.style.transform = `scaleX(${progreso})`;

}


function desactivarProgresoLectura(){

    const barra = document.getElementById("barra-progreso-lectura");

    if(barra) barra.remove();

    window.removeEventListener("scroll", programarProgresoLectura);

}
