function renderPodcasts(){

    if(podcasts.length === 0) return "";

    const subsecciones = [
        ...new Set(
            podcasts
                .map(p => (p.SubseccionPodcast || "").trim())
                .filter(s => s !== "")
        )
    ].sort();

    return `

        <h2 class="titulo-seccion">
            🎙 Podcasts
        </h2>

        <div class="subsecciones-podcast">

            ${
            subsecciones.map(subseccion => `

                <article
                    class="tarjeta-subseccion-podcast"
                    onclick="mostrarPodcastsSubseccion('${subseccion.replace(/'/g, "\\'")}')">

                    <div class="icono-subseccion-podcast">

                        ${iconoSubseccionPodcast(subseccion)}

                    </div>

                    <div>

                        <h3>
                            ${subseccion}
                        </h3>

                        <p>

                            ${
                            podcasts.filter(
                                p =>
                                (p.SubseccionPodcast || "").trim()
                                === subseccion
                            ).length
                            }

                            ${
                            podcasts.filter(
                                p =>
                                (p.SubseccionPodcast || "").trim()
                                === subseccion
                            ).length === 1
                            ? " episodio"
                            : " episodios"
                            }

                        </p>

                    </div>

                </article>

            `).join("")
            }

        </div>

        <div id="lista-podcasts-subseccion"></div>

    `;

}


function iconoSubseccionPodcast(subseccion){

    switch(subseccion.toLowerCase()){

        case "deporte":
        case "deportes":
            return "⚽";

        case "actualidad":
            return "📰";

        case "cultura":
            return "🎭";

        case "entrevistas":
            return "🎤";

        case "steam":
            return "🔬";

        default:
            return "🎙️";

    }

}


function mostrarPodcastsSubseccion(subseccion){

    const contenedor =
        document.getElementById("lista-podcasts-subseccion");

    if(!contenedor) return;

    const lista = podcasts.filter(
        p =>
        (p.SubseccionPodcast || "").trim()
        === subseccion
    );

    contenedor.innerHTML = `

        <div class="cabecera-subseccion-podcast">

            <button
                class="boton-volver-podcast"
                onclick="cerrarPodcastsSubseccion()">

                ← Podcasts

            </button>

            <h2>

                ${iconoSubseccionPodcast(subseccion)}

                ${subseccion}

            </h2>

        </div>


        <div class="podcasts-lista">

            ${
            lista.map(podcast => `

                <article
                    id="noticia-${podcast.ID}"
                    class="podcast-card">


                    <div class="podcast-card-superior">


                        ${
                        obtenerImagenPodcast(podcast)
                        ?
                        `
                        <img
                            class="podcast-card-imagen"
                            src="${obtenerImagenPodcast(podcast)}"
                            alt="${podcast.Titulo}">
                        `
                        :
                        `
                        <div class="podcast-card-imagen podcast-sin-imagen">

                            🎙️

                        </div>
                        `
                        }


                        <div class="podcast-card-info">


                            <div class="podcast-card-seccion">

                                🎙 Podcast · ${subseccion}

                            </div>

                            <div class="podcast-card-edicion">
                                📅 ${obtenerNombreEdicionPodcast(podcast)}
                            </div>


                            <h2 class="podcast-card-titulo">

                                ${podcast.Titulo}

                            </h2>


                            <div class="podcast-card-autor">

                                ✍️ ${podcast.Autor}

                                ${
                                podcast.CursoDepartamento
                                ?
                                ` · 🏫 ${podcast.CursoDepartamento}`
                                :
                                ""
                                }

                            </div>


                        </div>


                    </div>


                    ${
                    podcast.Entradilla
                    ?
                    `
                    <p class="podcast-card-entradilla">

                        ${podcast.Entradilla}

                    </p>
                    `
                    :
                    ""
                    }


                    <button
                        class="boton-escuchar-podcast"
                        onclick="abrirPodcast('${podcast.ID}')">

                        🎧 Escuchar episodio →

                    </button>


                </article>

            `).join("")
            }

        </div>

    `;


    contenedor.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


function cerrarPodcastsSubseccion(){

    const contenedor =
        document.getElementById("lista-podcasts-subseccion");

    if(!contenedor) return;

    contenedor.innerHTML = "";

}


function abrirPodcast(id){

    // ==========================================
    // GUARDAR ORIGEN
    // ==========================================

    posicionOrigenArticulo = window.scrollY;

    origenArticulo = vistaActual;


    // Si venimos del buscador, guardar búsqueda
    if(vistaActual === "buscador"){

        const input =
            document.getElementById("inputBusqueda");

        textoOrigenArticulo =
            input
                ? input.value.trim()
                : textoBusquedaAnterior;

    }else{

        textoOrigenArticulo = "";

    }


    // ==========================================
    // BUSCAR PODCAST
    // ==========================================

    const podcast = podcasts.find(
        p => String(p.ID) === String(id)
    );


    if(!podcast) return;


    podcastSubseccionAnterior =
        (podcast.SubseccionPodcast || "").trim();


    // ==========================================
    // ABRIR PODCAST
    // ==========================================

    mostrarVista("podcast-" + id);


    // ==========================================
    // AL ABRIR, SIEMPRE ARRIBA
    // ==========================================

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            window.scrollTo({

                top: 0,
                left: 0,
                behavior: "instant"

            });

        });

    });

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

function renderVistaPodcast(id){

    const podcast = podcasts.find(
        p => String(p.ID) === String(id)
    );


    if(!podcast){

        return `

            ${renderMenu()}

            <main class="pagina">

                <div class="contenedor">

                    <h1>
                        Podcast no encontrado
                    </h1>

                </div>

            </main>

        `;

    }


    const subseccion =
        (podcast.SubseccionPodcast || "").trim();


    return `

        ${renderMenu()}

        <main class="pagina podcast">

            <div class="contenedor">

                <article class="noticia-individual">


                    <div class="podcast-etiqueta">

                        🎙 Podcast · ${subseccion}

                    </div>


                    <h1 class="titulo-noticia-individual">

                        ${podcast.Titulo}

                    </h1>


                    <div class="meta-noticia-individual">

                        🎙️

                        <strong>
                            ${podcast.Autor}
                        </strong>

                        ${
                        podcast.CursoDepartamento
                        ?
                        " · 🏫 " + podcast.CursoDepartamento
                        :
                        ""
                        }

                    </div>


                    ${
                    obtenerImagenPodcast(podcast)
                    ?
                    `
                    <img
                        class="imagen-noticia-individual"
                        src="${obtenerImagenPodcast(podcast)}"
                        alt="${podcast.Titulo}"
                    >
                    `
                    :
                    ""
                    }


                    ${
                    podcast.Entradilla
                    ?
                    `
                    <p class="entradilla-noticia-individual">

                        ${podcast.Entradilla}

                    </p>
                    `
                    :
                    ""
                    }


                    ${
                    podcast.Cuerpo
                    ?
                    `
                    <div class="cuerpo-noticia-individual">

                        ${podcast.Cuerpo}

                    </div>
                    `
                    :
                    ""
                    }


                    ${renderGaleriaImagenes(podcast)}


                    ${renderAudioPodcast(podcast)}


                    <button
                        class="boton-volver"
                        onclick="volverDePodcast()">

                        ← Volver

                    </button>


                </article>

            </div>

        </main>

    `;

}


function volverDePodcast(){

    const destino =
        origenArticulo || "podcasts";

    const posicion =
        posicionOrigenArticulo || 0;

    const busqueda =
        textoOrigenArticulo || "";


    mostrarVista(destino);


    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            if(
                destino === "buscador" &&
                busqueda
            ){

                const input =
                    document.getElementById("inputBusqueda");

                if(input){

                    input.value = busqueda;

                }

                buscarNoticias();

            }


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

function obtenerNombreEdicionPodcast(podcast){

    if(
        podcast.Edicion &&
        datosEdicionActual &&
        podcast.Edicion === datosEdicionActual.id
    ){

        return datosEdicionActual.mes;

    }

    const edicion = hemeroteca.find(
        e => e.id === podcast.Edicion
    );

    if(edicion){

        return edicion.nombre;

    }

    return "";

}