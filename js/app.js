console.log("Preview cargado:", typeof revistaPreview);
window.addEventListener("DOMContentLoaded", iniciar);

let vistaActual = "portada";
let idEdicionActual = null;
let idEdicionLeyendo = null;
let datosEdicionActual = null;
let vistaAnterior = "portada";
let todasLasNoticias = [];
let idNoticiaAnterior = null;
let posicionScrollAnterior = 0;
let posicionVistaAnterior = 0;
let restaurandoScroll = false;
let textoBusquedaAnterior = "";

async function iniciar(){

    await cargarDatos();

    mostrarVista("portada");

}

function mostrarVista(vista){

    if(!vista.startsWith("noticia-")){

        vistaAnterior = vista;

    }

    vistaActual = vista;

    const app = document.getElementById("app");

    if(vista.startsWith("noticia-")){

        const id = vista.replace("noticia-","");

        return app.innerHTML =
            renderVistaNoticia(id);

    }

    switch(vista){

        case "portada":

            app.innerHTML = renderPortada();
            break;


        case "secciones":

            app.innerHTML = renderSecciones();
            break;


        case "hemeroteca":

            app.innerHTML = renderHemeroteca();
            break;


        case "podcasts":

            app.innerHTML = renderVistaPodcasts();
            break;

        case "buscador":

            app.innerHTML = renderBuscador();
            break;

    }


    if(vista.startsWith("seccion-")){

        const nombre =
            vista.replace("seccion-","");

        app.innerHTML =
            renderVistaSeccion(nombre);

    }

}

async function cargarDatos(){


    const archivoDatos =
    window.location.pathname.includes("preview.html")
    ? "data/preview/revista-preview.json"
    : CONFIG.urlDatos;

    const respuesta = await fetch(archivoDatos);

    const datos = await respuesta.json();
    idEdicionActual = datos.id;
    console.log(datos.noticias);
    datosEdicionActual = datos;
    idEdicionActual = datos.id;
    idEdicionLeyendo = datos.id;

    edicion.mes = datos.mes;

    if(datos.portada){

        edicion.portada.titulo =
            datos.portada.Titulo;

        edicion.portada.entradilla =
            datos.portada.Entradilla;

        // Buscamos la noticia que corresponde a la portada
        const noticiaPortada = (datos.noticias || []).find(
            noticia => noticia.Titulo === datos.portada.Titulo
        );

        if(
            noticiaPortada &&
            noticiaPortada.ImagenPrincipal
        ){

            edicion.portada.imagen =
                noticiaPortada.ImagenPrincipal;

        }else{

            edicion.portada.imagen =
                datos.portada.ImagenPortada;

        }

        console.log(
            "IMAGEN PORTADA:",
            edicion.portada.imagen
        );

    }

    noticias.length = 0;
    podcasts.length = 0;

    datos.noticias = datos.noticias || [];

    datos.noticias.forEach(noticia=>{

        const seccion = (noticia.Seccion || "")
            .trim()
            .toLowerCase();

        console.log("[" + seccion + "]");

        if(seccion === "podcast"){

            podcasts.push(noticia);

        }else{

            noticias.push(noticia);

        }

    });
        console.log("NOTICIAS");
        console.table(noticias.map(n => ({
            titulo: n.Titulo,
            seccion: n.Seccion
        })));

        console.log("PODCASTS");
        console.table(podcasts.map(n => ({
            titulo: n.Titulo,
            seccion: n.Seccion
        })));

    await cargarHemeroteca();
    cargarTodasLasNoticias();

    console.log("Datos cargados",datos);

}

async function cargarHemeroteca(){

    const respuesta = await fetch(CONFIG.urlHemeroteca);

    hemeroteca = await respuesta.json();

}

function abrirRevista(){

    document.getElementById("revista").scrollIntoView({

        behavior:"smooth"

    });

}

function hacerScroll(id){

    const articulo = document.getElementById("noticia-"+id);

    if(!articulo) return;

    articulo.scrollIntoView({

        behavior:"smooth",

        block:"start"

    });

    articulo.classList.add("resaltar");

    setTimeout(()=>{

        articulo.classList.remove("resaltar");

    },2000);

}

async function volverRevistaActual(){

    if(idEdicionLeyendo === idEdicionActual){

        mostrarVista("portada");

        return;

    }


    await abrirEdicion(idEdicionActual);

}

function buscarNoticias(){

    const texto =
    document.getElementById("inputBusqueda")
    .value
    .toLowerCase()
    .trim();

    textoBusquedaAnterior = texto;

    const contenedor =
    document.getElementById("resultadosBusqueda");

    if(todasLasNoticias.length===0){

        contenedor.innerHTML =
        `
        <p class="subtitulo-seccion">
        Preparando buscador...
        </p>
        `;

        return;

    }

    if(!texto){

        contenedor.innerHTML =
        `
        <p class="subtitulo-seccion">
        Escribe algo para comenzar la búsqueda.
        </p>
        `;

        return;

    }


    const todo = todasLasNoticias.length
    ? todasLasNoticias
    : [...noticias, ...podcasts];

    const resultados =
    todo.filter(noticia=>{


        const contenido =
        `
        ${noticia.Titulo}
        ${noticia.Entradilla}
        ${noticia.Cuerpo}
        ${noticia.Autor}
        ${noticia.Seccion}
        `
        .toLowerCase();


        return contenido.includes(texto);


    });



    if(resultados.length===0){

        contenedor.innerHTML=
        `
        <p class="subtitulo-seccion">
        No se han encontrado noticias.
        </p>
        `;

        return;

    }



    contenedor.innerHTML =

    resultados.map(noticia=>`

    <article class="card-seccion">


        <img
        src="${
            noticia.Seccion?.toLowerCase()==="podcast"
            ? obtenerImagenPodcast(noticia)
            : obtenerImagenURL(noticia)
        }">


        <div class="card-seccion-contenido">


            <span class="card-seccion-categoria">

            ${iconoSeccion(noticia.Seccion)}
            ${noticia.Seccion}

            </span>


            <h2>
            ${noticia.Titulo}
            </h2>


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


    `).join("");


}

function volverDeNoticia(){

    const posicion = posicionScrollAnterior || 0;

    restaurandoScroll = true;

    mostrarVista(vistaAnterior);

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            if(vistaAnterior === "buscador" && textoBusquedaAnterior){

                buscarNoticias();

            }

            window.scrollTo({
                top: posicion,
                left: 0,
                behavior: "smooth"
            });

        });

    });

}

async function cargarTodasLasNoticias(){

    todasLasNoticias.length = 0;

    const respuesta = await fetch(CONFIG.urlHemeroteca);

    const ediciones = await respuesta.json();

    // Añadir primero la edición actual
    if(datosEdicionActual && datosEdicionActual.noticias){

        datosEdicionActual.noticias.forEach(noticia=>{

            noticia.Edicion = datosEdicionActual.id;

            todasLasNoticias.push(noticia);

        });

    }

    for(const edicion of ediciones){

        const respuestaEdicion = await fetch(
            "data/ediciones/" + edicion.id + ".json"
        );

        const datosEdicion = await respuestaEdicion.json();

        if(datosEdicion.noticias){

            datosEdicion.noticias.forEach(noticia=>{

                noticia.Edicion = edicion.id;

                todasLasNoticias.push(noticia);

            });

        }

    }

    console.log(
        "TOTAL BUSCADOR:",
        todasLasNoticias.length
    );

    console.table(todasLasNoticias.map(n=>({
        id:n.ID,
        titulo:n.Titulo,
        edicion:n.Edicion
    })));

}