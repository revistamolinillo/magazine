function renderSecciones(){

    const secciones = [...new Set(
        noticias.map(n => n.Seccion)
    )].sort();

    return `

        ${renderMenu()}

        <main class="pagina">

            <div class="contenedor">

                <h1 class="titulo-seccion">

                    📚 Secciones

                </h1>

                <div class="grid-secciones">

                    ${
                    secciones.map(seccion=>`

                        <article
                            class="tarjeta-seccion"
                            onclick="abrirSeccion('${seccion}')">

                            <h2>

                                ${iconoSeccion(seccion)}

                                ${seccion}

                            </h2>

                            <p>

                                ${
                                noticias.filter(n=>n.Seccion===seccion).length
                                }

                                noticias

                            </p>

                        </article>

                    `).join("")
                    }

                </div>

            </div>

        </main>

    `;

}

function abrirSeccion(nombre){

    mostrarVista("seccion-" + nombre);

}

function iconoSeccion(seccion){

    switch(seccion){

        case "Actualidad":
            return "📰";

        case "Cultura":
            return "🎭";

        case "Deportes":
            return "⚽";

        case "STEAM":
            return "🔬";

        case "Entrevistas":
            return "🎤";

        case "Podcasts":
            return "🎧";

        default:
            return "📄";

    }

}

function renderVistaSeccion(nombre){

    const lista = noticias.filter(n=>n.Seccion===nombre);

    return `

        ${renderMenu()}

        <main class="pagina">

            <div class="contenedor">

                <button
                    class="boton-volver"
                    onclick="volverDeSeccion()">

                    ← Volver

                </button>

                <h1 class="titulo-seccion">

                    ${iconoSeccion(nombre)}

                    ${nombre}

                </h1>

                <p class="subtitulo-seccion">

                    ${lista.length} artículos

                </p>

                <div class="lista-seccion">

                    ${
                    lista.map(noticia=>`

                        <article class="card-seccion">

                            <img
                                src="${obtenerImagenURL(noticia)}"
                                alt="${noticia.Titulo}">

                            <div class="card-seccion-contenido">

                                <span class="card-seccion-categoria">

                                    ${iconoSeccion(noticia.Seccion)}
                                    ${noticia.Seccion}

                                </span>

                                <h2>

                                    ${noticia.Titulo}

                                </h2>

                                <div class="card-seccion-meta">

                                    ✍️ ${noticia.Autor}

                                    ${noticia.CursoDepartamento ? " · 🏫 " + noticia.CursoDepartamento : ""}

                                </div>

                                <p>

                                    ${noticia.Entradilla || ""}

                                </p>

                                <div
                                    class="leer-articulo"
                                    onclick="irANoticia('${noticia.ID}')">

                                    Leer artículo →

                                </div>

                            </div>

                        </article>

                    `).join("")
                    }

                </div>

            </div>

        </main>

    `;

}

function renderHemeroteca(){

    const listaHemeroteca = hemeroteca.filter(
        edicion => edicion.id !== idEdicionActual
    );

    const cursos = [...new Set(
        listaHemeroteca.map(edicion => edicion.curso)
    )].sort().reverse();

    return `

        ${renderMenu()}

        <main class="pagina">

            <div class="contenedor">

                <h1 class="titulo-seccion">

                    📚 Hemeroteca

                </h1>

                ${

                cursos.map(curso =>

                    renderCurso(curso, listaHemeroteca)

                ).join("")

                }

            </div>

        </main>

    `;

}

function renderCurso(curso, listaHemeroteca){

    const lista = listaHemeroteca.filter(
        edicion => edicion.curso === curso
    );

    return `

        <div class="bloque-curso">

            <h2 class="curso-titulo">

                ${curso}

            </h2>

            <div class="grid-hemeroteca">

                ${

                lista.map(edicion=>`

                    <article
                        class="card-edicion"
                        onclick="abrirEdicion('${edicion.id}')">

                        <div class="portada-edicion">

                            <img
                                src="https://drive.google.com/thumbnail?id=${edicion.imagen}&sz=w900"
                                alt="${edicion.nombre}">

                        </div>

                        <div class="info-edicion">

                            <div class="mes-edicion">

                                ${edicion.nombre.toUpperCase()}

                            </div>

                            <div class="linea-edicion"></div>

                            <div class="articulos-edicion">

                                📰 ${edicion.articulos} artículos

                            </div>

                            <div class="abrir-edicion">

                                Leer edición →

                            </div>

                        </div>

                    </article>

                `).join("")

                }

            </div>

        </div>

    `;

}

async function abrirEdicion(
    id,
    vistaFinal = "portada"
){

    console.log(
        "Abriendo edición:",
        id
    );


    // ==========================================
    // BUSCAR PRIMERO EN MEMORIA
    // ==========================================

    let datos =
        datosEdicionesCargadas[id];


    // ==========================================
    // SI NO ESTÁ EN MEMORIA, CARGAR JSON
    // ==========================================

    if(!datos){

        console.log(
            "Edición no estaba en memoria. Cargando JSON:",
            id
        );


        document.getElementById("app").innerHTML =
            renderCargando();


        let url;


        if(id === idEdicionActual){

            url =
                CONFIG.urlDatos;

        }else{

            url =
                "data/ediciones/" +
                id +
                ".json";

        }


        console.log(
            "URL que voy a cargar:",
            url
        );


        try{

            const respuesta =
                await fetch(url);


            if(!respuesta.ok){

                throw new Error(
                    "HTTP " + respuesta.status
                );

            }


            datos =
                await respuesta.json();


            // Guardarlo para futuras consultas

            datosEdicionesCargadas[id] =
                datos;


        }catch(error){

            console.error(
                "Error cargando edición:",
                id,
                error
            );


            document.getElementById("app").innerHTML = `

                ${renderMenu()}

                <main class="pagina">

                    <div class="contenedor">

                        <h2>
                            ❌ No se pudo cargar la edición
                        </h2>

                        <p>
                            ${error.message}
                        </p>

                    </div>

                </main>

            `;

            return;

        }

    }else{

        console.log(
            "Edición encontrada en memoria:",
            id
        );

    }


    // ==========================================
    // ACTUALIZAR EDICIÓN QUE ESTAMOS LEYENDO
    // ==========================================

    idEdicionLeyendo =
        datos.id;


    datosEdicionActual =
        datos;


    // ==========================================
    // LIMPIAR NOTICIAS Y PODCASTS
    // ==========================================

    noticias.length = 0;

    podcasts.length = 0;


    datos.noticias =
        datos.noticias || [];


    // ==========================================
    // CLASIFICAR NOTICIAS Y PODCASTS
    // ==========================================

    datos.noticias.forEach(
        noticia => {

            noticia.Edicion =
                datos.id;


            const archivos =
                obtenerArchivosMultimedia(
                    noticia
                );


            const esPodcast =
                (
                    noticia.TipoContenido || ""
                )
                    .trim()
                    .toLowerCase() ===
                    "podcast"
                ||
                archivos.some(
                    a =>
                        a.tipo.startsWith(
                            "audio"
                        )
                );


            if(esPodcast){

                podcasts.push(
                    noticia
                );

            }else{

                noticias.push(
                    noticia
                );

            }

        }
    );


    // ==========================================
    // ACTUALIZAR PORTADA
    // ==========================================

    edicion.mes =
        datos.mes || "";


    if(datos.portada){

        edicion.portada.titulo =
            datos.portada.Titulo || "";


        edicion.portada.entradilla =
            datos.portada.Entradilla || "";


        edicion.portada.imagen =
            obtenerImagenPortadaEdicion(
                datos
            );

    }else{

        edicion.portada.titulo = "";

        edicion.portada.entradilla = "";

        edicion.portada.imagen = "";

    }


    console.log(
        "EDICIÓN LISTA:",
        datos.id,
        datos.mes
    );


    // ==========================================
    // MOSTRAR LA VISTA SOLICITADA
    // ==========================================

    if(vistaFinal){

        mostrarVista(
            vistaFinal
        );

    }

}

function renderCargando(){

    return `

        ${renderMenu()}

        <main class="pagina">

            <div class="contenedor cargando-edicion">

                <div class="spinner-revista"></div>

                <h2>

                    📖 Abriendo edición...

                </h2>

                <p>

                    Un momento, estamos preparando la revista.

                </p>

            </div>

        </main>

    `;

}

function mostrarBuscador(){

    mostrarVista("buscador");

}

/*function renderVistaPodcastsCompleta(){

    return `

        ${renderMenu()}

        <main class="pagina">

            <div class="contenedor">

                <h1 class="titulo-seccion">

                    🎙 Podcasts

                </h1>

                <div class="articulos">

                    ${

                    podcasts.map(podcast=>`

                        <article class="articulo">

                            <div class="articulo-contenido">

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

                                    </div>

                                </div>

                                <hr class="linea-articulo">

                                <p class="articulo-entradilla">

                                    ${podcast.Entradilla || ""}

                                </p>

                                <hr class="linea-articulo">

                                <div class="articulo-cuerpo">

                                    <p>${podcast.Cuerpo || ""}</p>

                                </div>

                                ${obtenerMultimedia(podcast)}

                            </div>

                        </article>

                    `).join("")

                    }

                </div>

            </div>

        </main>

    `;

}*/

function renderVistaNoticia(id){

    const noticia = noticias.find(
        n => String(n.ID) === String(id)
    );

    if(!noticia){

        return `

            ${renderMenu()}

            <main class="pagina">

                <div class="contenedor">

                    <h1>
                        Noticia no encontrada
                    </h1>

                </div>

            </main>

        `;

    }


    return `

        ${renderMenu()}

        <main class="pagina">

            <div class="contenedor">

                <article class="noticia-individual">


                    <div class="articulo-seccion">

                        ${iconoSeccion(noticia.Seccion)}
                        ${noticia.Seccion}

                    </div>


                    <h1 class="titulo-noticia-individual">

                        ${noticia.Titulo}

                    </h1>


                    <div class="meta-noticia-individual">

                        ✍️

                        <span class="autor-noticia">
                            ${noticia.Autor}
                        </span>

                        ${
                            noticia.CursoDepartamento
                            ?
                            " · 🏫 " + noticia.CursoDepartamento
                            :
                            ""
                        }

                    </div>


                    <img
                        class="imagen-noticia-individual"
                        src="${obtenerImagenURL(noticia)}"
                        onclick="abrirImagenPrincipal('${noticia.ID}')"
                    >


                    ${
                        noticia.Entradilla
                        ?
                        `
                        <p class="entradilla-noticia-individual">

                            ${noticia.Entradilla}

                        </p>
                        `
                        :
                        ""
                    }


                    <div class="cuerpo-noticia-individual">

                        ${noticia.Cuerpo || ""}

                    </div>


                    ${renderGaleriaImagenes(noticia)}

                    <div class="acciones-noticia">

                        <button
                            class="boton-compartir"
                            onclick="compartirNoticia('${noticia.ID}')">

                            📤 Compartir noticia

                        </button>

                        <button
                            class="boton-copiar-enlace"
                            onclick="copiarEnlaceNoticia('${noticia.ID}')">

                            🔗 Copiar enlace

                        </button>

                    </div>


                    <button
                        class="boton-volver"
                        onclick="volverDeNoticia()">

                        ← Volver

                    </button>


                </article>

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

        <main class="pagina">

            <div class="contenedor">

                <h1>
                    Podcast no encontrado
                </h1>

            </div>

        </main>

        `;

    }


    return `

    ${renderMenu()}

    <main class="pagina">

        <div class="contenedor">

            <article class="noticia-individual">


                <div class="podcast-tipo">

                    🎙 Podcast

                </div>


                <h1 class="titulo-noticia-individual">

                    ${podcast.Titulo}

                </h1>


                <div class="meta-noticia-individual">

                    🎙️

                    <span class="nombre-autor">

                        ${podcast.Autor}

                    </span>

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


                <p class="entradilla-noticia-individual">

                    ${podcast.Entradilla || ""}

                </p>


                <div class="cuerpo-noticia-individual">

                    ${podcast.Cuerpo || ""}

                </div>


                ${renderGaleriaImagenes(podcast)}


                ${renderAudioPodcast(podcast)}


                <!-- ======================================
                     ACCIONES DEL PODCAST
                     ====================================== -->

                <div class="acciones-noticia">

                    <button
                        class="boton-compartir"
                        onclick="compartirNoticia('${podcast.ID}')">

                        📤 Compartir podcast

                    </button>


                    <button
                        class="boton-copiar-enlace"
                        onclick="copiarEnlaceNoticia('${podcast.ID}')">

                        🔗 Copiar enlace

                    </button>

                </div>


                <button
                    class="boton-volver"
                    onclick="volverDePodcast()"
                >

                    ← Volver

                </button>


            </article>

        </div>

    </main>

    `;

}

async function irANoticia(id){

    // ==========================================
    // GUARDAR ORIGEN
    // ==========================================

    posicionOrigenArticulo =
        window.scrollY;

    posicionScrollAnterior =
        window.scrollY;

    origenArticulo =
        vistaActual;

    vistaAnterior =
        vistaActual;


    console.log(
        "ORIGEN NOTICIA:",
        vistaActual
    );

    console.log(
        "POSICIÓN GUARDADA:",
        posicionScrollAnterior
    );


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
    // BUSCAR LA PUBLICACIÓN
    // ==========================================

    const publicacion =
        todasLasNoticias.find(
            n =>
                String(n.ID) ===
                String(id)
        );


    if(!publicacion){

        console.log(
            "No encontrada:",
            id
        );

        return;

    }


    // ==========================================
    // ¿ES PODCAST?
    // ==========================================

    const esPodcast =
        (publicacion.TipoContenido || "")
            .trim()
            .toLowerCase() === "podcast"
        ||
        obtenerAudios(publicacion).length > 0;


    // ==========================================
    // DESTINO
    // ==========================================

    const vistaDestino =
        esPodcast
            ? "podcast-" + id
            : "noticia-" + id;


    // ==========================================
    // ABRIR
    // ==========================================

    if(
        publicacion.Edicion &&
        publicacion.Edicion !==
        idEdicionLeyendo
    ){

        await abrirEdicion(
            publicacion.Edicion,
            vistaDestino
        );

    }else{

        mostrarVista(
            vistaDestino
        );

    }


    // ==========================================
    // SIEMPRE ARRIBA AL ABRIR EL ARTÍCULO
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

function abrirImagenPrincipal(idNoticia){

    let noticia =
        noticias.find(
            n => String(n.ID) === String(idNoticia)
        );

    if(!noticia){

        noticia =
            podcasts.find(
                n => String(n.ID) === String(idNoticia)
            );

    }

    if(!noticia) return;

    const imagenes =
        obtenerImagenes(noticia);

    if(imagenes.length === 0) return;

    galeriaActual = imagenes.map(
        imagen =>
            `https://drive.google.com/thumbnail?id=${imagen.id}&sz=w1600`
    );

    /*
     * La imagen principal es la primera que se muestra
     * en el lightbox.
     */

    let indicePrincipal = 0;

    if(noticia.ImagenPrincipal){

        const posicion =
            imagenes.findIndex(
                imagen =>
                    imagen.id === noticia.ImagenPrincipal
            );

        if(posicion !== -1){

            indicePrincipal = posicion;

        }

    }

    indiceActual = indicePrincipal;

    const img =
        document.getElementById("imagenLightbox");

    if(!img) return;

    img.src =
        galeriaActual[indiceActual];

    actualizarContador();

    document
        .getElementById("lightbox")
        .classList.add("visible");

}

function volverDeSeccion(){

    mostrarVista("secciones");

}