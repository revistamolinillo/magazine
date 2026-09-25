// =======================================================
// GALERÍA DE IMÁGENES Y VISOR (LIGHTBOX)
// =======================================================

let galeriaActual = [];
let indiceActual = 0;
let enfoqueAnterior = null;


// El visor se crea una sola vez, la primera vez que hace falta
function montarLightbox(){

    if(document.getElementById("lightbox")) return;

    const visor = document.createElement("div");

    visor.id = "lightbox";
    visor.className = "lightbox";
    visor.setAttribute("role", "dialog");
    visor.setAttribute("aria-modal", "true");
    visor.setAttribute("aria-label", "Visor de imágenes");
    visor.setAttribute("aria-hidden", "true");

    visor.innerHTML = `

        <button
            class="lightbox-cerrar"
            type="button"
            onclick="cerrarLightbox()"
            aria-label="Cerrar">
            ${icono("cerrar", 24)}
        </button>

        <button
            class="lightbox-flecha izquierda"
            type="button"
            onclick="imagenAnterior(event)"
            aria-label="Imagen anterior">
            ${icono("izquierda", 28)}
        </button>

        <div class="lightbox-marco">
            <span class="spinner spinner-claro"></span>
            <img id="imagenLightbox" class="lightbox-img" alt="">
        </div>

        <button
            class="lightbox-flecha derecha"
            type="button"
            onclick="imagenSiguiente(event)"
            aria-label="Imagen siguiente">
            ${icono("derecha", 28)}
        </button>

        <div id="contadorGaleria" class="contador-galeria"></div>

    `;

    // Pulsar fuera de la imagen cierra el visor
    visor.addEventListener("click", evento => {

        if(
            evento.target === visor ||
            evento.target.classList.contains("lightbox-marco")
        ){
            cerrarLightbox();
        }

    });

    // Deslizar con el dedo para cambiar de imagen
    let inicioX = null;

    visor.addEventListener("touchstart", evento => {

        inicioX = evento.changedTouches[0].clientX;

    }, { passive:true });

    visor.addEventListener("touchend", evento => {

        if(inicioX === null) return;

        const distancia =
            evento.changedTouches[0].clientX - inicioX;

        inicioX = null;

        if(Math.abs(distancia) < 50) return;

        if(distancia > 0){
            imagenAnterior();
        }else{
            imagenSiguiente();
        }

    }, { passive:true });

    document.body.appendChild(visor);

}


function abrirGaleria(urls, indice = 0){

    if(!urls || urls.length === 0) return;

    montarLightbox();

    galeriaActual = urls;

    indiceActual =
        Math.min(Math.max(indice, 0), urls.length - 1);

    enfoqueAnterior = document.activeElement;

    const visor = document.getElementById("lightbox");

    visor.classList.add("visible");
    visor.setAttribute("aria-hidden", "false");

    visor.classList.toggle("una-sola", urls.length <= 1);

    document.body.classList.add("sin-scroll");

    mostrarImagenGaleria();

    visor.querySelector(".lightbox-cerrar").focus();

}


function mostrarImagenGaleria(){

    const img = document.getElementById("imagenLightbox");

    if(!img) return;

    const marco = img.parentElement;

    const url = galeriaActual[indiceActual];

    marco.classList.add("cargando");

    img.onload = img.onerror = () => {

        marco.classList.remove("cargando");

    };

    img.src = url;

    // Si la imagen ya estaba en memoria no hay que esperar
    if(img.complete && img.naturalWidth > 0){

        marco.classList.remove("cargando");

    }

    actualizarContador();

    // Preparamos las imágenes vecinas
    [indiceActual + 1, indiceActual - 1].forEach(i => {

        if(galeriaActual[i]){

            new Image().src = galeriaActual[i];

        }

    });

}


function actualizarContador(){

    const contador = document.getElementById("contadorGaleria");

    if(!contador) return;

    contador.textContent =
        galeriaActual.length > 1
        ? (indiceActual + 1) + " / " + galeriaActual.length
        : "";

}


// Todas las imágenes de una publicación, empezando por la indicada
function abrirImagenGaleria(idNoticia, indice){

    const publicacion = buscarPublicacion(idNoticia);

    if(!publicacion) return;

    const imagenes = obtenerImagenes(publicacion);

    abrirGaleria(
        imagenes.map(imagen => urlDrive(imagen.id, 1600)),
        indice
    );

}


// La imagen principal es la primera que se enseña
function abrirImagenPrincipal(idNoticia){

    const publicacion = buscarPublicacion(idNoticia);

    if(!publicacion) return;

    const imagenes = obtenerImagenes(publicacion);

    if(imagenes.length === 0) return;

    let indice = 0;

    if(publicacion.ImagenPrincipal){

        const posicion =
            imagenes.findIndex(
                imagen => imagen.id === publicacion.ImagenPrincipal
            );

        if(posicion !== -1) indice = posicion;

    }

    abrirImagenGaleria(idNoticia, indice);

}


function imagenAnterior(evento){

    if(evento) evento.stopPropagation();

    if(galeriaActual.length <= 1) return;

    indiceActual =
        (indiceActual - 1 + galeriaActual.length)
        % galeriaActual.length;

    mostrarImagenGaleria();

}


function imagenSiguiente(evento){

    if(evento) evento.stopPropagation();

    if(galeriaActual.length <= 1) return;

    indiceActual =
        (indiceActual + 1) % galeriaActual.length;

    mostrarImagenGaleria();

}


function cerrarLightbox(){

    const visor = document.getElementById("lightbox");

    if(!visor || !visor.classList.contains("visible")) return;

    visor.classList.remove("visible");
    visor.setAttribute("aria-hidden", "true");

    document.body.classList.remove("sin-scroll");

    galeriaActual = [];
    indiceActual = 0;

    if(enfoqueAnterior && enfoqueAnterior.focus){

        enfoqueAnterior.focus({ preventScroll:true });

    }

}


document.addEventListener("keydown", evento => {

    const visor = document.getElementById("lightbox");

    if(!visor || !visor.classList.contains("visible")) return;

    switch(evento.key){

        case "ArrowLeft":
            imagenAnterior();
            break;

        case "ArrowRight":
            imagenSiguiente();
            break;

        case "Escape":
            cerrarLightbox();
            break;

    }

});


// -------------------------------------------------------
// TIRA DE MINIATURAS DE UNA NOTICIA
// -------------------------------------------------------

function renderGaleriaImagenes(noticia){

    const imagenes = obtenerImagenes(noticia);

    if(imagenes.length <= 1) return "";

    // La galería no repite la imagen que ya se ve arriba
    const principal = idImagenPrincipal(noticia);

    const miniaturas =
        imagenes.filter(imagen => imagen.id !== principal);

    if(miniaturas.length === 0) return "";

    return `

        <div class="galeria">

            <h3 class="titulo-bloque-pequeno">
                ${icono("imagenes", 20)}
                Galería
            </h3>

            <div class="galeria-tira">

                ${miniaturas.map(imagen => `

                    <button
                        class="miniatura"
                        type="button"
                        onclick="abrirImagenGaleria(
                            '${esc(noticia.ID)}',
                            ${imagenes.indexOf(imagen)}
                        )"
                        aria-label="Ampliar imagen">

                        <img
                            src="${urlDrive(imagen.id, 800)}"
                            alt="Imagen de ${esc(noticia.Titulo)}"
                            loading="lazy"
                            decoding="async">

                    </button>

                `).join("")}

            </div>

        </div>

    `;

}
