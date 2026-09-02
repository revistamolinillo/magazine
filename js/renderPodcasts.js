function renderPodcasts(){

    if(todosLosPodcasts.length === 0){

        return "";

    }


    const subsecciones = [
        ...new Set(

            todosLosPodcasts
                .map(
                    p =>
                        (
                            p.SubseccionPodcast ||
                            ""
                        ).trim()
                )
                .filter(
                    s => s !== ""
                )

        )
    ].sort();


    return `

        <h2 class="titulo-seccion">

            🎙 Podcasts

        </h2>


        <div id="subsecciones-podcast" class="subsecciones-podcast">

            ${
            subsecciones.map(
                subseccion => `

                    <article
                        class="tarjeta-subseccion-podcast"
                        onclick="
                            mostrarPodcastsSubseccion(
                                '${subseccion.replace(/'/g, "\\'")}'
                            )
                        ">

                        <div
                            class="icono-subseccion-podcast">

                            ${iconoSubseccionPodcast(
                                subseccion
                            )}

                        </div>


                        <div>

                            <h3>

                                ${subseccion}

                            </h3>


                            <p>

                                ${
                                todosLosPodcasts.filter(
                                    p =>
                                        (
                                            p.SubseccionPodcast ||
                                            ""
                                        ).trim()
                                        ===
                                        subseccion
                                ).length
                                }

                                ${
                                todosLosPodcasts.filter(
                                    p =>
                                        (
                                            p.SubseccionPodcast ||
                                            ""
                                        ).trim()
                                        ===
                                        subseccion
                                ).length === 1
                                    ? " episodio"
                                    : " episodios"
                                }

                            </p>

                        </div>

                    </article>

                `
            ).join("")
            }

        </div>


        <div
            id="lista-podcasts-subseccion">
        </div>

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

        const subsecciones =
        document.getElementById("subsecciones-podcast");

    if(subsecciones){
        subsecciones.style.display = "none";
    }


    // ==========================================
    // LIMPIAR EL NOMBRE DE LA SUBSECCIÓN
    // ==========================================

    subseccion =
        subseccion
            .replace("🎙️", "")
            .replace("🎙", "")
            .replace("🎭", "")
            .replace("⚽", "")
            .replace("📰", "")
            .replace("🎤", "")
            .replace("🔬", "")
            .trim();


    // ==========================================
    // BUSCAR LOS PODCASTS
    // ==========================================

    const lista =
        todosLosPodcasts.filter(
            podcast =>
                (podcast.SubseccionPodcast || "").trim()
                === subseccion
        );


    console.log(
        "SUBSECCIÓN:",
        subseccion
    );

    console.log(
        "PODCASTS ENCONTRADOS:",
        lista
    );


    // ==========================================
    // MOSTRAR CABECERA
    // ==========================================

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
            lista.length === 0
            ?
            `

                <p class="subtitulo-seccion">

                    No hay podcasts en esta subsección.

                </p>

            `
            :
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
                            alt="${podcast.Titulo}"
                        >

                        `
                        :
                        `

                        <div
                            class="podcast-card-imagen podcast-sin-imagen">

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


    // ==========================================
    // IR A LA SUBSECCIÓN
    // ==========================================

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


    const subsecciones =
        document.getElementById("subsecciones-podcast");

    if(subsecciones){
        subsecciones.style.display = "grid";
    }

}


async function abrirPodcast(id){

    // ==========================================
    // GUARDAR ORIGEN
    // ==========================================

    posicionOrigenArticulo =
        window.scrollY;

    origenArticulo =
        vistaActual;


    // ==========================================
    // SI ESTAMOS DENTRO DE UNA SUBSECCIÓN
    // DE PODCASTS
    // ==========================================

    origenPodcastSubseccion = "";

    posicionPodcastSubseccion = 0;


    if(vistaActual === "podcasts"){

        const listaSubseccion =
            document.getElementById(
                "lista-podcasts-subseccion"
            );


        if(
            listaSubseccion &&
            listaSubseccion.innerHTML.trim() !== ""
        ){

            posicionPodcastSubseccion =
                window.scrollY;


            const cabecera =
                listaSubseccion.querySelector(
                    ".cabecera-subseccion-podcast h2"
                );


            if(cabecera){

                origenPodcastSubseccion =
                    cabecera.textContent
                        .replace("🎙️", "")
                        .replace("🎙", "")
                        .replace("← Podcasts", "")
                        .trim();

            }

        }

    }


    // ==========================================
    // SI VENIMOS DEL BUSCADOR
    // ==========================================

    if(vistaActual === "buscador"){

        const input =
            document.getElementById(
                "inputBusqueda"
            );


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

    const podcast =
        todosLosPodcasts.find(
            p =>
                String(p.ID) ===
                String(id)
        );


    if(!podcast){

        console.warn(
            "Podcast no encontrado:",
            id
        );

        return;

    }


    console.log(
        "PODCAST SELECCIONADO:",
        podcast.Titulo,
        "Edición:",
        podcast.Edicion
    );


    // ==========================================
    // GUARDAR SUBSECCIÓN DEL PODCAST
    // ==========================================

    podcastSubseccionAnterior =
        (
            podcast.SubseccionPodcast ||
            ""
        ).trim();


    // ==========================================
    // ABRIR LA EDICIÓN CORRESPONDIENTE
    // ==========================================

    if(
        podcast.Edicion &&
        podcast.Edicion !==
        idEdicionLeyendo
    ){

        await abrirEdicion(
            podcast.Edicion,
            "podcast-" + id
        );

    }else{

        mostrarVista(
            "podcast-" + id
        );

    }


    // ==========================================
    // ARRIBA DEL TODO
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

    console.log("🎙️ RENDER VISTA PODCAST:", id);
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


                    <div class="acciones-noticia">

                        <button
                            class="boton-compartir"
                            onclick="compartirNoticia('${podcast.ID}')">

                            📤 Compartir

                        </button>

                        <button
                            class="boton-copiar-enlace"
                            onclick="copiarEnlaceNoticia('${podcast.ID}')">

                            🔗 Copiar enlace

                        </button>

                    </div>


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


    // ==========================================
    // VOLVER A UNA SUBSECCIÓN DE PODCASTS
    // ==========================================

    if(
        destino === "podcasts" &&
        podcastSubseccionAnterior
    ){

        console.log(
            "VOLVIENDO A SUBSECCIÓN:",
            podcastSubseccionAnterior
        );


        // Primero reconstruimos la página de podcasts

        mostrarVista("podcasts");


        requestAnimationFrame(() => {

            requestAnimationFrame(() => {


                // Ahora reconstruimos la subsección

                mostrarPodcastsSubseccion(
                    podcastSubseccionAnterior
                );


                requestAnimationFrame(() => {

                    requestAnimationFrame(() => {

                        window.scrollTo({

                            top:
                                posicionPodcastSubseccion || 0,

                            left: 0,

                            behavior: "instant"

                        });

                    });

                });

            });

        });


        return;

    }


    // ==========================================
    // VOLVER DESDE EL BUSCADOR
    // ==========================================

    if(destino === "buscador"){

        mostrarVista("buscador");


        requestAnimationFrame(() => {

            requestAnimationFrame(() => {


                const input =
                    document.getElementById(
                        "inputBusqueda"
                    );


                if(input){

                    input.value =
                        busqueda;

                }


                buscarNoticias();


                requestAnimationFrame(() => {

                    window.scrollTo({

                        top: posicion,

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
    // ==========================================

    mostrarVista(destino);


    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            window.scrollTo({

                top: posicion,

                left: 0,

                behavior: "instant"

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