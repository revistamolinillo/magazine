function renderPodcasts(){

    if(podcasts.length===0) return "";

    return `

    <h2 class="titulo-seccion">

        🎙 Podcasts

    </h2>

    <div class="articulos">

        ${

        podcasts.map(podcast=>`

            <article
            id="noticia-${podcast.ID}"
            class="articulo articulo-scroll">

                <div class="cabecera-noticia">

                    ${obtenerImagenPodcast(podcast) ? `
                        <img
                            class="articulo-imagen"
                            src="${obtenerImagenPodcast(podcast)}"
                            alt="${podcast.Titulo}"
                            onclick="abrirLightbox(event,this.src)">
                    ` : ""}

                    <div class="datos-noticia">

                        <div class="cabecera-articulo">

                            <div class="articulo-seccion">

                                🎙 Podcast

                            </div>

                            <h2 class="articulo-titulo">

                                ${podcast.Titulo}

                            </h2>

                            <div class="autor-articulo">

                                <span class="por">por</span>

                                <strong>${podcast.Autor}</strong>

                                ${
                                    podcast.CursoDepartamento
                                    ? `<br><span class="departamento">${podcast.CursoDepartamento}</span>`
                                    : ""
                                }

                            </div>

                        </div>

                        <hr class="linea-articulo">

                        <p class="articulo-entradilla">

                            ${podcast.Entradilla || ""}

                        </p>

                    </div>

                </div>

                <hr class="linea-articulo">

                <div class="articulo-cuerpo">

                    <p>

                        ${podcast.Cuerpo || ""}

                    </p>

                </div>

                ${renderGaleriaImagenes(podcast)}

                ${renderAudioPodcast(podcast)}

            </article>

        `).join("")

        }

    </div>

    `;

}

function renderVistaPodcasts(){

    return `

        ${renderMenu()}

        <main class="pagina podcast">

            <div class="contenedor">

                ${renderPodcasts()}

            </div>

        </main>

    `;

}