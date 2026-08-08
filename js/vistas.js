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

async function abrirEdicion(id){

    document.getElementById("app").innerHTML =
        renderCargando();

    console.log("Cargando edición:", id);

    let url;

    if(id === idEdicionActual){

        url = CONFIG.urlDatos;

    }else{

        url = "data/ediciones/" + id + ".json";

    }

    const respuesta = await fetch(url);

    const datos = await respuesta.json();

    idEdicionLeyendo = id;

    console.log("Edición recibida:", datos);

    // Limpiar noticias y podcasts
    noticias.length = 0;
    podcasts.length = 0;


    datos.noticias.forEach(noticia=>{
        noticia.Edicion = datos.id;

        const seccion = (noticia.Seccion || "")
            .trim()
            .toLowerCase();


        if(seccion === "podcast"){

            podcasts.push(noticia);

        }else{

            noticias.push(noticia);

        }

    });

    // Actualizar portada
    edicion.mes = datos.mes;

    if(datos.portada){

        edicion.portada.titulo =
            datos.portada.Titulo;

        edicion.portada.entradilla =
            datos.portada.Entradilla;

        edicion.portada.imagen =
            datos.portada.ImagenPortada;

    }

    mostrarVista("portada");

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
        n => n.ID === id
    );


    if(!noticia){

        return `

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


                <span class="card-seccion-categoria">

                    ${iconoSeccion(noticia.Seccion)}
                    ${noticia.Seccion}

                </span>



                <h1 class="titulo-noticia-individual">

                    ${noticia.Titulo}

                </h1>



                <div class="meta-noticia-individual">

                    ✍️ ${noticia.Autor}

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
                >



                <p class="entradilla-noticia-individual">

                    ${noticia.Entradilla || ""}

                </p>



                <div class="cuerpo-noticia-individual">

                    ${noticia.Cuerpo || ""}

                </div>



                ${renderGaleriaImagenes(noticia)}

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

async function irANoticia(id){

    // Guardamos dónde estaba el usuario
    posicionScrollAnterior = window.scrollY;

    const noticia = todasLasNoticias.find(
        n => String(n.ID) === String(id)
    );

    if(!noticia){
        console.log("No encontrada:", id);
        return;
    }

    // Si la noticia pertenece a otra edición,
    // cargamos primero esa edición
    if(
        noticia.Edicion &&
        noticia.Edicion !== idEdicionLeyendo
    ){
        await abrirEdicion(noticia.Edicion);
    }

    // Abrimos la noticia
    mostrarVista("noticia-" + id);

    // Esperamos a que el DOM se haya actualizado
    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth"
            });

        });

    });
}