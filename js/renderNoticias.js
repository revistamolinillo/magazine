// =======================================================
// CONTENIDO DE LA REVISTA
// Destacadas, noticias y podcasts de la edición.
// =======================================================

function renderRevista(){

    if(noticias.length === 0 && podcasts.length === 0){

        return `

        <section id="revista" class="revista">

            <div class="contenedor">

                <div class="vacio">

                    <h2>Esta edición todavía no tiene contenidos</h2>

                    <p>
                        Cuando se publiquen las primeras noticias
                        las verás aquí.
                    </p>

                </div>

            </div>

        </section>

        `;

    }

    return `

    <section id="revista" class="revista">

        <div class="contenedor">

            ${renderDestacadas()}

            ${renderNoticias()}

            ${renderPodcastsEdicion()}

        </div>

    </section>

    `;

}


function cabeceraBloque(titulo, subtitulo){

    return `

        <div class="cabecera-bloque">

            <h2 class="cabecera-bloque-titulo">${titulo}</h2>

            <p class="cabecera-bloque-subtitulo">${subtitulo}</p>

        </div>

    `;

}


// Autor de una publicación
function renderAutor(publicacion){

    return `

        <p class="autor">

            <span class="autor-por">por</span>

            <strong>${esc(publicacion.Autor)}</strong>

            ${
            publicacion.CursoDepartamento
            ? `<span class="autor-curso">${esc(publicacion.CursoDepartamento)}</span>`
            : ""
            }

        </p>

    `;

}


// -------------------------------------------------------
// DESTACADAS
// -------------------------------------------------------

function renderDestacadas(){

    const destacadas =
        noticias.filter(noticia => noticia.Destacada === "SI");

    if(destacadas.length === 0) return "";

    return `

        <div class="bloque">

            ${cabeceraBloque(
                "Destacadas",
                "Lo más destacado de esta edición"
            )}

            <div class="destacadas ${destacadas.length === 1 ? "destacadas-una" : ""}">

                ${destacadas.map(noticia => `

                    <a
                        class="destacada"
                        data-sec="${claveSeccion(noticia.Seccion)}"
                        href="#noticia-${esc(noticia.ID)}"
                        onclick="hacerScroll('${esc(noticia.ID)}'); return false;">

                        <div class="destacada-foto">

                            <img
                                src="${esc(obtenerImagenURL(noticia))}"
                                data-fallback="${IMAGEN_NOTICIA}"
                                alt=""
                                loading="lazy"
                                decoding="async">

                        </div>

                        <div class="destacada-texto">

                            ${etiquetaSeccion(noticia.Seccion)}

                            <h3>${esc(noticia.Titulo)}</h3>

                            <span class="destacada-autor">
                                por ${esc(noticia.Autor)}
                            </span>

                        </div>

                    </a>

                `).join("")}

            </div>

        </div>

    `;

}


// -------------------------------------------------------
// NOTICIAS
// -------------------------------------------------------

function renderNoticias(){

    if(noticias.length === 0) return "";

    return `

        <div class="bloque">

            ${cabeceraBloque(
                "Noticias",
                "La actualidad de nuestro centro"
            )}

            <div class="articulos">

                ${noticias.map(renderArticuloLista).join("")}

            </div>

        </div>

    `;

}


function renderArticuloLista(noticia){

    return `

        <article
            id="noticia-${esc(noticia.ID)}"
            class="articulo"
            data-sec="${claveSeccion(noticia.Seccion)}">

            <header class="articulo-cabecera">

                <button
                    class="articulo-foto"
                    type="button"
                    onclick="abrirImagenPrincipal('${esc(noticia.ID)}')"
                    aria-label="Ampliar imagen">

                    <img
                        src="${esc(obtenerImagenURL(noticia))}"
                        data-fallback="${IMAGEN_NOTICIA}"
                        alt="${esc(noticia.Titulo)}"
                        loading="lazy"
                        decoding="async">

                </button>

                <div class="articulo-datos">

                    ${etiquetaSeccion(noticia.Seccion)}

                    <h3 class="articulo-titulo">
                        ${esc(noticia.Titulo)}
                    </h3>

                    ${renderAutor(noticia)}

                    <p class="tiempo-lectura">
                        ${icono("reloj", 16)}
                        ${minutosLectura(noticia.Cuerpo)} min de lectura
                    </p>

                </div>

            </header>

            <div class="articulo-texto">

                ${
                noticia.Entradilla
                ? `<p class="entradilla">${esc(noticia.Entradilla)}</p>`
                : ""
                }

                <div class="cuerpo">
                    ${textoAParrafos(noticia.Cuerpo)}
                </div>

                ${renderGaleriaImagenes(noticia)}

                ${obtenerMultimedia(noticia)}

                ${renderAcciones(noticia)}

            </div>

        </article>

    `;

}


// -------------------------------------------------------
// PODCASTS DE ESTA EDICIÓN
// -------------------------------------------------------

function renderPodcastsEdicion(){

    if(podcasts.length === 0) return "";

    return `

        <div class="bloque">

            ${cabeceraBloque(
                "Podcasts",
                "Los episodios de esta edición"
            )}

            <div class="episodios-tira">

                ${podcasts.map(podcast => `

                    <a
                        class="episodio-mini"
                        data-sec="${claveSeccion(subseccionPodcast(podcast))}"
                        href="?noticia=${encodeURIComponent(podcast.ID)}"
                        onclick="return abrirDesdeEnlace(event,'${esc(podcast.ID)}')">

                        <span class="episodio-mini-foto">

                            <img
                                src="${esc(obtenerImagenPodcast(podcast, 600))}"
                                data-fallback="${IMAGEN_PODCAST}"
                                alt=""
                                loading="lazy"
                                decoding="async">

                            <span class="episodio-mini-play">
                                ${icono("play", 20)}
                            </span>

                        </span>

                        <span class="episodio-mini-texto">

                            <span class="etiqueta-seccion">
                                ${marcaAspa()}
                                ${esc(subseccionPodcast(podcast))}
                            </span>

                            <strong>${esc(podcast.Titulo)}</strong>

                            <small>${esc(podcast.Autor)}</small>

                        </span>

                    </a>

                `).join("")}

            </div>

        </div>

    `;

}


// -------------------------------------------------------
// MOVIMIENTO DENTRO DE LA PORTADA
// -------------------------------------------------------

function abrirRevista(){

    const revista = document.getElementById("revista");

    if(!revista) return;

    revista.scrollIntoView({
        behavior:"smooth",
        block:"start"
    });

}


function hacerScroll(id){

    const articulo =
        document.getElementById("noticia-" + id);

    if(!articulo) return;

    articulo.scrollIntoView({
        behavior:"smooth",
        block:"start"
    });

    articulo.classList.add("resaltar");

    setTimeout(() => {

        articulo.classList.remove("resaltar");

    }, 2200);

}
