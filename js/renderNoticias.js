function renderRevista(){

    noticias.sort((a,b)=>Number(a.Orden)-Number(b.Orden));
    podcasts.sort((a,b)=>Number(a.Orden)-Number(b.Orden));

    return `

    <section id="revista" class="revista">

        <div class="contenedor">

            ${renderDestacadas()}

            ${renderNoticias()}

        </div>

    </section>

    `;

}

function renderNoticias(){
    console.log(noticias);

    return `

        <h2 class="titulo-seccion">
            📰 Noticias
        </h2>

        <div class="articulos">

            ${
            noticias.map(noticia=>`

                <article
                    id="noticia-${noticia.ID}"
                    class="articulo articulo-scroll">


                    <div class="cabecera-noticia">


                        <img
                            class="articulo-imagen"
                            src="${obtenerImagenURL(noticia)}"
                            alt="${noticia.Titulo}"
                            onclick="abrirLightbox(event,this.src)"
                        >


                        <div class="datos-noticia">


                            <div class="cabecera-articulo">


                                <div class="articulo-seccion">

                                    ${noticia.Seccion}

                                </div>


                                <h2 class="articulo-titulo">

                                    ${noticia.Titulo}

                                </h2>


                                <div class="autor-articulo">

                                    <span class="por">
                                        por
                                    </span>

                                    <strong>${noticia.Autor}</strong>


                                    ${
                                    noticia.CursoDepartamento
                                    ? 
                                    `<br>
                                    <span class="departamento">
                                        ${noticia.CursoDepartamento}
                                    </span>`
                                    : ""
                                    }


                                </div>


                            </div>


                        </div>


                    </div>



                    <div class="texto-noticia">


                        <hr class="linea-articulo">


                        <p class="articulo-entradilla">

                            ${noticia.Entradilla || ""}

                        </p>



                        <hr class="linea-articulo">


                        <div class="articulo-cuerpo">

                            <p>

                                ${noticia.Cuerpo || ""}

                            </p>

                        </div>



                        ${renderGaleriaImagenes(noticia)}

                        ${obtenerMultimedia(noticia)}

                        <div class="acciones-noticia">

                            <button
                                class="boton-compartir"
                                onclick="compartirNoticia('${noticia.ID}')">

                                📤 Compartir

                            </button>

                            <button
                                class="boton-copiar-enlace"
                                onclick="copiarEnlaceNoticia('${noticia.ID}')">

                                🔗 Copiar enlace

                            </button>

                        </div>



                    </div>



                </article>


            `).join("")
            }


        </div>


    `;

}

function renderDestacadas(){

    const destacadas = noticias.filter(noticia =>
        noticia.Destacada === "SI"
    );

    console.log(destacadas);

    if(destacadas.length===0) return "";

    return `

        <h2 class="titulo-seccion">
            ⭐ Destacadas
        </h2>

        <div class="destacadas">

            ${
            destacadas.map(noticia=>{

                console.log(
                    "DESTACADA",
                    noticia.Titulo,
                    noticia.ImagenPrincipal,
                    obtenerImagenURL(noticia)
                );

                return `

                    <article
                        class="destacada">

                        <img
                            class="imagen-destacada"
                            src="${obtenerImagenURL(noticia)}"
                            alt="${noticia.Titulo}">

                        <div class="contenido-destacada">

                            <div class="categoria-destacada">
                                ${noticia.Seccion}
                            </div>

                            <h3>
                                ${noticia.Titulo}
                            </h3>

                            <hr class="linea-destacada">

                            <div
                                class="leer-articulo"
                                onclick="event.stopPropagation(); hacerScroll('${noticia.ID}')">

                                Leer artículo →

                            </div>

                        </div>

                    </article>

                `;

            }).join("")
            }

        </div>

    `;

}

function volverDeNoticia(){

    const vista =
        vistaAnterior || "portada";


    const posicion =
        posicionScrollAnterior || 0;


    console.log(
        "VOLVIENDO A:",
        vista
    );

    console.log(
        "RESTAURANDO POSICIÓN:",
        posicion
    );


    // ==========================================
    // VOLVER A LA VISTA ANTERIOR
    // ==========================================

    mostrarVista(vista);


    // ==========================================
    // ESPERAR A QUE SE RENDERICE
    // ==========================================

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {


            // ==========================================
            // SI VENÍAMOS DEL BUSCADOR
            // ==========================================

            if(
                vista === "buscador" &&
                textoOrigenArticulo
            ){

                const input =
                    document.getElementById(
                        "inputBusqueda"
                    );


                if(input){

                    input.value =
                        textoOrigenArticulo;

                }


                buscarNoticias();

            }


            // ==========================================
            // RESTAURAR SCROLL
            // ==========================================

            requestAnimationFrame(() => {

                requestAnimationFrame(() => {

                    window.scrollTo({

                        top: posicion,

                        left: 0,

                        behavior: "instant"

                    });


                    console.log(
                        "SCROLL RESTAURADO:",
                        posicion
                    );

                });

            });

        });

    });

}