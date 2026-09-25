// =======================================================
// PODCASTS
// Subsecciones → episodios → episodio.
// =======================================================

// Nombre del mes de una edición a partir de su identificador
function nombreEdicion(idEdicion){

    if(!idEdicion) return "";

    if(
        datosEdicionesCargadas[idEdicion] &&
        datosEdicionesCargadas[idEdicion].mes
    ){
        return datosEdicionesCargadas[idEdicion].mes;
    }

    const enHemeroteca =
        hemeroteca.find(e => e.id === idEdicion);

    return enHemeroteca ? enHemeroteca.nombre : "";

}


// Las subsecciones que hay entre todos los podcasts
function listaSubseccionesPodcast(){

    return [
        ...new Set(
            todosLosPodcasts.map(subseccionPodcast)
        )
    ].sort((a, b) => {

        // "Otros" siempre al final
        if(a === "Otros") return 1;
        if(b === "Otros") return -1;

        return a.localeCompare(b, "es");

    });

}


function renderVistaPodcasts(){

    const subseccion = contextoVista.sub;

    return `

        <div class="pagina">

            <div class="contenedor">

                ${
                subseccion
                ? renderEpisodiosSubseccion(subseccion)
                : renderSubseccionesPodcast()
                }

            </div>

        </div>

    `;

}


// -------------------------------------------------------
// TARJETAS DE SUBSECCIÓN
// -------------------------------------------------------

function renderSubseccionesPodcast(){

    if(todosLosPodcasts.length === 0){

        return `

            <div class="vacio">

                <h1>Todavía no hay podcasts</h1>

                <p>Cuando se publique el primero aparecerá aquí.</p>

            </div>

        `;

    }

    return `

        <header class="cabecera-pagina">

            <h1 class="titulo-pagina">Podcasts</h1>

            <p class="subtitulo-pagina">
                Elige un tema y escucha los episodios.
            </p>

        </header>

        <div class="grid-tiles">

            ${listaSubseccionesPodcast().map(subseccion => {

                const total =
                    todosLosPodcasts.filter(
                        p => subseccionPodcast(p) === subseccion
                    ).length;

                return `

                    <button
                        class="tile-seccion"
                        type="button"
                        data-sec="${claveSeccion(subseccion)}"
                        onclick="abrirSubseccionPodcast('${esc(subseccion).replace(/&#39;/g, "\\'")}')">

                        <span class="tile-seccion-aspa">
                            ${marcaAspa()}
                        </span>

                        <span class="tile-seccion-texto">

                            <strong>${esc(subseccion)}</strong>

                            <small>
                                ${total} ${total === 1 ? "episodio" : "episodios"}
                            </small>

                        </span>

                    </button>

                `;

            }).join("")}

        </div>

    `;

}


function abrirSubseccionPodcast(subseccion){

    mostrarVista("podcasts", { ctx:{ sub:subseccion } });

}


function cerrarSubseccionPodcast(){

    volver("podcasts");

}


// -------------------------------------------------------
// EPISODIOS DE UNA SUBSECCIÓN
// -------------------------------------------------------

function renderEpisodiosSubseccion(subseccion){

    const lista =
        todosLosPodcasts.filter(
            podcast => subseccionPodcast(podcast) === subseccion
        );

    return `

        <div data-sec="${claveSeccion(subseccion)}">

            <button
                class="boton-volver"
                type="button"
                onclick="cerrarSubseccionPodcast()">

                ${icono("volver", 18)}
                Podcasts

            </button>

            <header class="cabecera-pagina cabecera-pagina-color">

                <h1 class="titulo-pagina">
                    ${marcaAspa()}
                    ${esc(subseccion)}
                </h1>

                <p class="subtitulo-pagina">
                    ${lista.length} ${lista.length === 1 ? "episodio" : "episodios"}
                </p>

            </header>

            <div class="lista-tarjetas">

                ${
                lista.length === 0
                ? `<p class="subtitulo-pagina">No hay podcasts en esta subsección.</p>`
                : lista.map(renderEpisodio).join("")
                }

            </div>

        </div>

    `;

}


function renderEpisodio(podcast){

    const mes = nombreEdicion(podcast.Edicion);

    return `

        <article
            class="tarjeta"
            data-sec="${claveSeccion(subseccionPodcast(podcast))}">

            ${enlacePublicacion(
                podcast.ID,
                `<img
                    src="${esc(obtenerImagenPodcast(podcast, 800))}"
                    data-fallback="${IMAGEN_PODCAST}"
                    alt=""
                    loading="lazy"
                    decoding="async">`,
                "tarjeta-foto"
            )}

            <div class="tarjeta-cuerpo">

                <span class="etiqueta-seccion">
                    ${marcaAspa()}
                    Podcast
                </span>

                ${
                mes
                ? `<p class="tarjeta-edicion">
                        ${icono("calendario", 15)}
                        ${esc(mes)}
                   </p>`
                : ""
                }

                <h2 class="tarjeta-titulo">

                    ${enlacePublicacion(
                        podcast.ID,
                        esc(podcast.Titulo),
                        "tarjeta-enlace"
                    )}

                </h2>

                ${renderAutor(podcast)}

                ${
                podcast.Entradilla
                ? `<p class="tarjeta-texto">${esc(podcast.Entradilla)}</p>`
                : ""
                }

                ${enlacePublicacion(
                    podcast.ID,
                    `${icono("auriculares", 18)} Escuchar episodio`,
                    "boton boton-primario"
                )}

            </div>

        </article>

    `;

}


// Se mantiene por compatibilidad con enlaces antiguos
function abrirPodcast(id){

    return irANoticia(id);

}
