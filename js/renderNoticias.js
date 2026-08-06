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

    if(destacadas.length===0) return "";

    return `

        <h2 class="titulo-seccion">
            ⭐ Destacadas
        </h2>

        <div class="destacadas">

            ${
            destacadas.map(noticia=>`

                <article
                    class="destacada"
                    onclick="irANoticia('${noticia.ID}')">

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

                        <div class="leer-articulo">

                            Leer artículo →

                        </div>

                    </div>

                </article>

            `).join("")
            }

        </div>

    `;

}