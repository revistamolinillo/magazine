let galeriaActual = [];
let indiceActual = 0;

function actualizarContador(){

    const contador = document.getElementById("contadorGaleria");

    if(!contador) return;

    contador.textContent =
        (indiceActual + 1) + " / " + galeriaActual.length;

}

function obtenerArchivosMultimedia(noticia){

    if(!noticia.Multimedia) return [];

    return noticia.Multimedia
        .split("\n")
        .map(linea=>linea.trim())
        .filter(linea=>linea!=="")
        .map(linea=>{

            const partes=linea.split("|");

            return{

                id: partes[0],
                tipo: partes[1] || ""

            };

        });

}

function obtenerImagenes(noticia){

    return obtenerArchivosMultimedia(noticia)
        .filter(a=>a.tipo.startsWith("image"));

}

function obtenerVideos(noticia){

    return obtenerArchivosMultimedia(noticia)
        .filter(a=>a.tipo.startsWith("video"));

}

function obtenerAudios(noticia){

    return obtenerArchivosMultimedia(noticia)
        .filter(a=>a.tipo.startsWith("audio"));

}

function renderGaleriaImagenes(noticia){

    const imagenes = obtenerImagenes(noticia);

    if(imagenes.length<=1) return "";


    return `

    <div class="galeria-profesional">

        <h3 class="titulo-galeria">
            📷 Galería
        </h3>


        <div class="carrusel-imagenes">

            ${
            imagenes.slice(1).map((imagen,index)=>`

                <div
                class="miniatura-galeria"
                onclick="abrirImagenGaleria('${noticia.ID}',${index+1})">


                    <img
                    src="https://drive.google.com/thumbnail?id=${imagen.id}&sz=w800">


                </div>


            `).join("")
            }


        </div>

    </div>

    `;

}

document.addEventListener("keydown",function(e){

    const lightbox=document.getElementById("lightbox");

    if(!lightbox.classList.contains("visible")) return;

    switch(e.key){

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

function abrirLightbox(event, imagen){

    if(event) event.stopPropagation();

    galeriaActual = [imagen];
    indiceActual = 0;

    const img = document.getElementById("imagenLightbox");

    img.src = imagen;

    actualizarContador();

    document.getElementById("lightbox").classList.add("visible");

}

function abrirImagenGaleria(idNoticia, indice){

    let noticia = noticias.find(n=>n.ID===idNoticia);


    if(!noticia){

        noticia = podcasts.find(n=>n.ID===idNoticia);

    }


    if(!noticia) return;


    const imagenes = obtenerImagenes(noticia);


    galeriaActual = imagenes.map(img =>
        `https://drive.google.com/thumbnail?id=${img.id}&sz=w1600`
    );


    indiceActual = indice;


    const img=document.getElementById("imagenLightbox");


    img.onload = ()=>{

        img.style.opacity=1;

    };


    img.style.opacity=0;

    img.src = galeriaActual[indiceActual];


    actualizarContador();


    document
    .getElementById("lightbox")
    .classList.add("visible");

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

    const nuevaImagen = galeriaActual[indiceActual];

    img.onload = () => {

        img.style.opacity = 1;

    };

    img.src = nuevaImagen;

    actualizarContador();

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

    const nuevaImagen = galeriaActual[indiceActual];

    img.onload = () => {

        img.style.opacity = 1;

    };

    img.src = nuevaImagen;

    actualizarContador();

}

function cerrarLightbox(){

    document.getElementById("lightbox").classList.remove("visible");

    galeriaActual=[];

    indiceActual=0;

}