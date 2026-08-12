function renderPortada(){

    return `

        ${renderMenu()}

        ${renderHero()}

        ${renderRevista()}

        ${renderFooter()}

    `;

}

function renderMenu(){

    return `

    <header class="menu">

        <div class="logo">

            EL MOLINILLO
            <span>MAGAZINE</span>

        </div>


        <button
            class="menu-hamburguesa"
            onclick="toggleMenuMovil()"
            aria-label="Abrir menú">

            ☰

        </button>


        <nav id="menu-navegacion">

            <a href="#"
            onclick="
                volverRevistaActual();
                cerrarMenuMovil();
                return false;
            ">
                Revista
            </a>


            <a href="#"
            onclick="
                mostrarVista('secciones');
                cerrarMenuMovil();
                return false;
            ">
                Secciones
            </a>


            ${
                podcasts.length
                ? `
                    <a href="#"
                    onclick="
                        mostrarVista('podcasts');
                        cerrarMenuMovil();
                        return false;
                    ">
                        Podcasts
                    </a>
                `
                : ""
            }


            <a href="#"
            onclick="
                mostrarVista('hemeroteca');
                cerrarMenuMovil();
                return false;
            ">
                Hemeroteca
            </a>


            <a href="#"
            onclick="
                mostrarBuscador();
                cerrarMenuMovil();
                return false;
            ">
                🔎 Buscar
            </a>

        </nav>

    </header>

    `;
}


function renderHero(){

    return `

    <main class="portada">

        <section class="hero">

            <!-- FOTO DE PORTADA -->

            <div
                class="hero-fondo"
                style="
                    background-image:url(
                        'https://drive.google.com/thumbnail?id=${edicion.portada.imagen}&sz=w1200'
                    )
                ">
            </div>


            <!-- CABECERA -->

            <div class="hero-cabecera">

                <p class="hero-revista">
                    EL MOLINILLO MAGAZINE
                </p>

                <p class="hero-fecha">
                    ${edicion.mes}
                </p>

            </div>


            <!-- CONTENIDO DE LA NOTICIA -->

            <div class="hero-contenido">

                <h1 class="hero-titulo">
                    ${edicion.portada.titulo}
                </h1>

                <p class="hero-entradilla">
                    ${edicion.portada.entradilla}
                </p>

                <div class="hero-botones">

                    <button
                        class="hero-boton"
                        onclick="abrirRevista()">

                        Leer revista

                    </button>

                </div>

            </div>

        </section>

    </main>

    `;
}

function renderFooter(){

    return `

<footer class="footer">

    <div class="footer-contenido">

        <!-- IDENTIDAD -->

        <div class="footer-bloque">

            <div class="footer-logo">
                EL MOLINILLO
                <span>MAGAZINE</span>
            </div>

            <p>
                Revista digital del IES El Molinillo
            </p>

        </div>


        <!-- REVISTA -->

        <div class="footer-bloque">

            <h3>
                Revista
            </h3>

            <a href="#"
                onclick="volverRevistaActual(); return false;">
                📰 Revista
            </a>

            <a href="#"
                onclick="mostrarVista('secciones'); return false;">
                📚 Secciones
            </a>

            <a href="#"
                onclick="mostrarVista('hemeroteca'); return false;">
                🗂️ Hemeroteca
            </a>

            <a href="#"
                onclick="mostrarBuscador(); return false;">
                🔎 Buscar
            </a>

        </div>


        <!-- PARTICIPA -->

        <div class="footer-bloque">

            <h3>
                Participa
            </h3>

            <a
                href="https://script.google.com/macros/s/AKfycbzqWxMfGJTtSSepWnKGb10YKs1Got-BRC2QLc7dXJ3R7GG8h3_3KdJMyydkKjaoBGpd/exec"
                target="_blank"
                rel="noopener">
                📝 Añadir noticia
            </a>

            <a
                href="mailto:revismol@gmail.com">
                ✉️ Contacta con nosotros
            </a>

            <a
                href="#"
                onclick="return false;"
                title="Instagram próximamente">
                📸 Instagram
            </a>

        </div>


        <!-- INSTALAR -->

        <div class="footer-bloque footer-instalar">

            <h3>
                Revista en tu dispositivo
            </h3>

            <p>
                Lleva El Molinillo Magazine contigo.
            </p>

            <button
                id="boton-instalar-app"
                class="boton-instalar-app"
                onclick="instalarPWA()">

                📱 Instalar revista

            </button>

        </div>

    </div>


    <!-- PIE FINAL -->

    <div class="footer-abajo">

        <span>
            © 2026 El Molinillo Magazine
        </span>

        <span>
            IES El Molinillo · Guillena
        </span>

    </div>

</footer>

`;

}

/*function renderPortada(){

    return `

        ${renderMenu()}

        ${renderHero()}

        ${renderRevista()}

    `;

}

function renderMenu(){

    return `

    <header class="menu">

        <div class="logo">

            EL MOLINILLO
            <span>MAGAZINE</span>

        </div>


        <nav>

            <a href="#"
            onclick="volverRevistaActual();return false;">
                Revista
            </a>

            <a href="#" onclick="mostrarSecciones();return false;">
                Secciones
            </a>

            <a href="#">
                Podcasts
            </a>

            <a href="#" onclick="mostrarHemeroteca();return false;">
                Hemeroteca
            </a>

            <a href="#" onclick="mostrarBuscador();return false;">
                🔎 Buscar
            </a>

        </nav>


    </header>

    `;

}

function renderHero(){

    return `

        <main class="portada">

            <section class="hero">

                <div 
                class="hero-fondo"
                style="
                background-image:url('https://drive.google.com/thumbnail?id=${edicion.portada.imagen}&sz=w1200')
                ">
                </div>

                <div class="hero-contenido">

                    <p class="hero-revista">
                        EL MOLINILLO MAGAZINE
                    </p>

                    <p class="hero-fecha">
                        ${edicion.mes}
                    </p>

                    <h1 class="hero-titulo">
                        ${edicion.portada.titulo}
                    </h1>

                    <p class="hero-entradilla">
                        ${edicion.portada.entradilla}
                    </p>

                    <button class="hero-boton" onclick="abrirRevista()">
                        Leer revista
                    </button>

                </div>

            </section>

        </main>

    `;

}

function renderRevista(){

    noticias.sort((a,b)=>Number(a.Orden)-Number(b.Orden));
    podcasts.sort((a,b)=>Number(a.Orden)-Number(b.Orden));

    return `

    <section id="revista" class="revista">

        <div class="contenedor">

            ${renderDestacadas()}

            ${renderNoticias()}

            ${renderPodcasts()}

        </div>

    </section>

    `;

}

function renderPodcasts(){

    return renderListadoArticulos(
        podcasts,
        "🎙 Podcasts"r
    );

}

/*function renderPodcasts(){

    if(podcasts.length===0) return "";

    return `
        <h2 class="titulo-seccion">
            🎙 Podcasts
        </h2>

        <div class="articulos">

            AQUÍ

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

                    <div
                        class="imagen"
                        style="background-image:url('${obtenerImagenURL(noticia)}')">
                    </div>

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

function renderNoticias(){

    return renderListadoArticulos(
        noticias,
        "📰 Noticias"
    );

}

/*function renderNoticias(){
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

                    <img
                        class="articulo-imagen"
                        src="${obtenerImagenURL(noticia)}"
                        alt="${noticia.Titulo}"
                        onclick="abrirLightbox(event,this.src)"
                    >

                    <div class="articulo-contenido">

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

                                ${noticia.CursoDepartamento
                                    ? `<br><span class="departamento">${noticia.CursoDepartamento}</span>`
                                    : ""
                                }

                            </div>

                        </div>

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

function obtenerArchivosMultimedia(noticia){

    if(!noticia.Multimedia) return [];

    return noticia.Multimedia
        .split("\n")
        .map(l=>l.trim())
        .filter(l=>l!=="")
        .map(l=>{

            const p=l.split("|");

            return{

            id: partes[0],
            tipo: partes[1] || "",
            url: partes[2] || ""

        };

        });

}

function obtenerImagenURL(noticia){
    console.log(noticia.Multimedia);

    const imagen=obtenerArchivosMultimedia(noticia)
        .find(a=>a.tipo.startsWith("image"));

    if(!imagen){

        return "assets/img/noticia.jpg";

    }

    return `https://drive.google.com/thumbnail?id=${imagen.id}&sz=w1200`;

}

function renderGaleriaImagenes(noticia){

    const imagenes=obtenerArchivosMultimedia(noticia)
        .filter(a=>a.tipo.startsWith("image"));

    if(imagenes.length<=1) return "";

    return `

    <div class="galeria">

        ${imagenes.slice(1).map(img=>`

            <img
                src="https://drive.google.com/thumbnail?id=${img.id}&sz=w1200"
                class="foto-galeria"
                onclick="abrirLightbox(event,this.src)"
            >

        `).join("")}

    </div>

    `;

}

function obtenerMultimedia(noticia){

    const archivos=obtenerArchivosMultimedia(noticia);

    const videos=archivos.filter(a=>a.tipo.startsWith("video"));
    const audios=archivos.filter(a=>a.tipo.startsWith("audio"));

    let html="";

    if(videos.length){

        html+=`

        <div class="bloque-multimedia">

            <h3>🎥 Vídeos</h3>

            <div class="videos">

                ${videos.map(v=>`

                    <iframe
                        src="https://drive.google.com/file/d/${v.id}/preview"
                        allow="autoplay"
                        loading="lazy">
                    </iframe>

                `).join("")}

            </div>

        </div>

        `;

    }

    if(audios.length){

        html+=`

        <div class="bloque-multimedia">

            <h3>🎧 Audios</h3>

            <div class="audios">

                ${audios.map(a=>`

                    <iframe
                        src="https://drive.google.com/file/d/${a.id}/preview"
                        allow="autoplay"
                        loading="lazy">
                    </iframe>

                `).join("")}
r
            </div>

        </div>

        `;

    }

    return html;

}

function abrirLightbox(event, imagen){

    if(event) event.stopPropagation();

    galeriaActual = [imagen];

    indiceActual = 0;

    document.getElementById("imagenLightbox").src = imagen;

    actualizarContador();

    document.getElementById("lightbox").classList.add("visible");

}

function abrirImagenGaleria(idNoticia, indice){

    const noticia = noticias.find(n=>n.ID===idNoticia);

    if(!noticia) return;

    const imagenes = obtenerImagenes(noticia);

    galeriaActual = imagenes.map(img=>
        `https://drive.google.com/thumbnail?id=${img.id}&sz=w1600`
    );

    indiceActual = indice;

    document.getElementById("imagenLightbox").src =
        galeriaActual[indiceActual];
    
    actualizarContador();

    document.getElementById("lightbox").classList.add("visible");

}

function imagenAnterior(event){

    if(event) event.stopPropagation();

    if(galeriaActual.length<=1) return;

    indiceActual--;

    if(indiceActual<0){

        indiceActual = galeriaActual.length-1;

    }

    const img=document.getElementById("imagenLightbox");

        img.style.opacity=0;

        setTimeout(()=>{

            img.style.opacity = 0;

            const nuevaImagen = galeriaActual[indiceActual];

            img.onload = () => {

                img.style.opacity = 1;

            };

            img.src = nuevaImagen;

            actualizarContador();

            img.style.opacity=1;

        },150);

}

function imagenSiguiente(event){

    if(event) event.stopPropagation();

    if(galeriaActual.length<=1) return;

    indiceActual++;

    if(indiceActual>=galeriaActual.length){

        indiceActual=0;

    }

    const img=document.getElementById("imagenLightbox");

        img.style.opacity=0;

        setTimeout(()=>{

            img.style.opacity = 0;

            const nuevaImagen = galeriaActual[indiceActual];

            img.onload = () => {

                img.style.opacity = 1;

            };

            img.src = nuevaImagen;

            actualizarContador();

            img.style.opacity=1;

        },150);

}

function cerrarLightbox(){

    document.getElementById("lightbox").classList.remove("visible");

    galeriaActual=[];

    indiceActual=0;

}

function mostrarSecciones(){

    document.getElementById("app").innerHTML = renderSecciones();

}

function mostrarHemeroteca(){

    document.getElementById("app").innerHTML = renderHemeroteca();

}*/

function renderBuscador(){

    return `

    ${renderMenu()}


    <main class="pagina">

    <div class="contenedor">


    <h1 class="titulo-seccion">

    🔎 Buscar en la revista

    </h1>


    <div class="buscador">

    <input
    id="inputBusqueda"
    type="text"
    placeholder="Busca noticias, autores, secciones..."
    value="${textoBusquedaAnterior}"
    oninput="buscarNoticias()"
    >


    </div>


    <div id="resultadosBusqueda">


    <p class="subtitulo-seccion">
    Escribe algo para comenzar la búsqueda.
    </p>


    </div>


    </div>

    </main>


    `;

}

// =======================================================
// MENÚ MÓVIL
// =======================================================

function toggleMenuMovil(){

    const menu = document.getElementById("menu-navegacion");

    if(!menu) return;

    menu.classList.toggle("menu-abierto");

}


function cerrarMenuMovil(){

    const menu = document.getElementById("menu-navegacion");

    if(!menu) return;

    menu.classList.remove("menu-abierto");

}

document.addEventListener("click", function(event){

    const menu = document.getElementById("menu-navegacion");
    const boton = document.querySelector(".menu-hamburguesa");

    if(!menu || !boton) return;

    if(
        menu.classList.contains("menu-abierto") &&
        !menu.contains(event.target) &&
        !boton.contains(event.target)
    ){

        menu.classList.remove("menu-abierto");

    }

});

