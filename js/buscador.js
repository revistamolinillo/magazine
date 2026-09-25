// =======================================================
// BUSCADOR
// Busca en todas las ediciones, sin importar tildes
// ni mayúsculas, y con varias palabras a la vez.
// =======================================================

// Lista de textos ya preparados para buscar
let indiceBusqueda = [];

let temporizadorBusqueda = null;


function prepararIndiceBusqueda(){

    indiceBusqueda = todasLasNoticias.map(noticia => ({

        noticia,

        titulo: normalizar(noticia.Titulo),

        texto: normalizar([
            noticia.Titulo,
            noticia.Entradilla,
            noticia.Cuerpo,
            noticia.Autor,
            noticia.CursoDepartamento,
            noticia.Seccion,
            noticia.SubseccionPodcast,
            esPodcast(noticia) ? "podcast" : ""
        ].join(" "))

    }));

}


// -------------------------------------------------------
// PANTALLA
// -------------------------------------------------------

function renderBuscador(){

    const filtro = contextoVista.filtro || "todo";

    const filtros = [
        { clave:"todo",     etiqueta:"Todo" },
        { clave:"noticias", etiqueta:"Noticias" },
        { clave:"podcasts", etiqueta:"Podcasts" }
    ];

    return `

        <div class="pagina">

            <div class="contenedor">

                <header class="cabecera-pagina">

                    <h1 class="titulo-pagina">Buscar</h1>

                    <p class="subtitulo-pagina">
                        Por título, autor, sección o cualquier palabra del texto.
                    </p>

                </header>

                <div class="buscador">

                    ${icono("buscar", 22, "buscador-icono")}

                    <input
                        id="inputBusqueda"
                        type="search"
                        placeholder="Busca noticias, autores, secciones..."
                        autocomplete="off"
                        autocapitalize="off"
                        spellcheck="false"
                        enterkeyhint="search"
                        aria-label="Buscar en la revista"
                        oninput="programarBusqueda()">

                </div>

                <div class="filtros" role="group" aria-label="Tipo de contenido">

                    ${filtros.map(f => `

                        <button
                            class="filtro ${f.clave === filtro ? "activo" : ""}"
                            type="button"
                            data-filtro="${f.clave}"
                            aria-pressed="${f.clave === filtro}"
                            onclick="cambiarFiltroBusqueda('${f.clave}')">
                            ${f.etiqueta}
                        </button>

                    `).join("")}

                </div>

                <div
                    id="resultadosBusqueda"
                    aria-live="polite">
                </div>

            </div>

        </div>

    `;

}


// Se llama justo después de dibujar la pantalla
function prepararBuscador(enfocar){

    const input = document.getElementById("inputBusqueda");

    if(!input) return;

    input.value = contextoVista.q || "";

    buscarNoticias();

    if(enfocar && !input.value){

        input.focus({ preventScroll:true });

    }

}


function programarBusqueda(){

    clearTimeout(temporizadorBusqueda);

    temporizadorBusqueda = setTimeout(buscarNoticias, 140);

}


function cambiarFiltroBusqueda(filtro){

    contextoVista.filtro = filtro;

    document.querySelectorAll(".filtro").forEach(boton => {

        const activo = boton.dataset.filtro === filtro;

        boton.classList.toggle("activo", activo);
        boton.setAttribute("aria-pressed", String(activo));

    });

    buscarNoticias();

}


function usarSugerencia(texto){

    const input = document.getElementById("inputBusqueda");

    if(!input) return;

    input.value = texto;

    buscarNoticias();

}


// -------------------------------------------------------
// BÚSQUEDA
// -------------------------------------------------------

function buscarNoticias(){

    const input = document.getElementById("inputBusqueda");

    const contenedor =
        document.getElementById("resultadosBusqueda");

    if(!input || !contenedor) return;

    const texto = input.value.trim();

    contextoVista.q = input.value;

    const filtro = contextoVista.filtro || "todo";

    if(indiceBusqueda.length === 0){

        contenedor.innerHTML = `
            <p class="mensaje-busqueda">
                Preparando el buscador...
            </p>
        `;

        return;

    }

    const terminos =
        normalizar(texto).split(/\s+/).filter(Boolean);

    if(terminos.length === 0){

        contenedor.innerHTML = renderSugerenciasBusqueda();

        return;

    }

    const resultados =
        indiceBusqueda
            .filter(item => {

                const podcast = esPodcast(item.noticia);

                if(filtro === "noticias" && podcast) return false;
                if(filtro === "podcasts" && !podcast) return false;

                return terminos.every(t => item.texto.includes(t));

            })
            // Primero los que tienen las palabras en el título
            .map(item => ({
                item,
                puntos: terminos.filter(t => item.titulo.includes(t)).length
            }))
            .sort((a, b) => b.puntos - a.puntos)
            .map(r => r.item.noticia);

    if(resultados.length === 0){

        contenedor.innerHTML = `

            <div class="vacio vacio-pequeno">

                <h2>Sin resultados</h2>

                <p>
                    No hay nada para «${esc(texto)}».
                    Prueba con otra palabra o con menos palabras.
                </p>

            </div>

        `;

        return;

    }

    contenedor.innerHTML = `

        <p class="mensaje-busqueda">
            ${resultados.length}
            ${resultados.length === 1 ? "resultado" : "resultados"}
        </p>

        <div class="lista-tarjetas">

            ${resultados.map(noticia =>
                renderResultado(noticia, terminos)
            ).join("")}

        </div>

    `;

}


function renderSugerenciasBusqueda(){

    const secciones = [
        ...new Set(
            todasLasNoticias
                .filter(n => !esPodcast(n))
                .map(n => (n.Seccion || "").trim())
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b, "es"));

    return `

        <div class="sugerencias-busqueda">

            <p class="mensaje-busqueda">
                Escribe algo para empezar.
            </p>

            ${
            secciones.length
            ? `
                <div class="filtros">

                    ${secciones.map(seccion => `

                        <button
                            class="filtro"
                            type="button"
                            onclick="usarSugerencia('${esc(seccion).replace(/&#39;/g, "\\'")}')">
                            ${esc(seccion)}
                        </button>

                    `).join("")}

                </div>
            `
            : ""
            }

        </div>

    `;

}


function renderResultado(noticia, terminos){

    const podcast = esPodcast(noticia);

    const subseccion = subseccionPodcast(noticia);

    const clave =
        podcast
        ? claveSeccion(subseccion)
        : claveSeccion(noticia.Seccion);

    return `

        <article class="tarjeta" data-sec="${clave}">

            ${enlacePublicacion(
                noticia.ID,
                `<img
                    src="${esc(
                        podcast
                        ? obtenerImagenPodcast(noticia, 800)
                        : obtenerImagenURL(noticia, 800)
                    )}"
                    data-fallback="${podcast ? IMAGEN_PODCAST : IMAGEN_NOTICIA}"
                    alt=""
                    loading="lazy"
                    decoding="async">`,
                "tarjeta-foto"
            )}

            <div class="tarjeta-cuerpo">

                <span class="etiqueta-seccion">
                    ${marcaAspa()}
                    ${
                    podcast
                    ? "Podcast de " + esc(subseccion)
                    : esc(seccionDe(noticia))
                    }
                </span>

                <h2 class="tarjeta-titulo">

                    ${enlacePublicacion(
                        noticia.ID,
                        resaltar(noticia.Titulo, terminos),
                        "tarjeta-enlace"
                    )}

                </h2>

                <p class="autor">
                    <span class="autor-por">por</span>
                    <strong>${resaltar(noticia.Autor, terminos)}</strong>
                </p>

                ${
                noticia.Entradilla
                ? `<p class="tarjeta-texto">${resaltar(noticia.Entradilla, terminos)}</p>`
                : ""
                }

                ${enlacePublicacion(
                    noticia.ID,
                    podcast
                    ? `${icono("auriculares", 18)} Escuchar episodio`
                    : "Leer artículo",
                    podcast ? "boton boton-primario" : "boton boton-suave"
                )}

            </div>

        </article>

    `;

}
