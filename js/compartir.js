// =======================================================
// COMPARTIR
// Menú para compartir una noticia, un podcast o la revista
// entera: historia de Instagram (imagen 1080x1920 creada
// en el propio navegador), WhatsApp, menú del sistema,
// copiar enlace y descargar la imagen.
// =======================================================


// -------------------------------------------------------
// ENLACES
// -------------------------------------------------------

// Dirección base de la revista (sin "preview.html", para que lo
// que se comparte desde la vista previa lleve a la revista real)
function urlBaseRevista(){

    const url = new URL(window.location.href);

    url.search = "";
    url.hash = "";

    url.pathname = url.pathname.replace(/(index|preview)\.html$/, "");

    return url;

}


function obtenerEnlaceNoticia(id){

    const url = urlBaseRevista();

    url.searchParams.set("noticia", id);

    return url.toString();

}


// La edición más reciente se comparte con la dirección de siempre;
// una edición antigua (abierta desde la hemeroteca), con ?edicion=
function obtenerEnlaceRevista(){

    const url = urlBaseRevista();

    if(idEdicionLeyendo && idEdicionLeyendo !== idEdicionActual){

        url.searchParams.set("edicion", idEdicionLeyendo);

    }

    return url.toString();

}


// Dirección corta para escribirla dentro de la imagen
function direccionVisible(){

    const url = urlBaseRevista();

    return (url.host + url.pathname).replace(/\/$/, "");

}


async function copiarEnlaceNoticia(id){

    copiarTexto(obtenerEnlaceNoticia(id));

}


async function copiarTexto(texto, mensaje = "Enlace copiado"){

    try{

        await navigator.clipboard.writeText(texto);

        toast(mensaje);

    }catch(error){

        const copiado = copiarTextoAntiguo(texto);

        toast(copiado ? mensaje : "No se pudo copiar el enlace");

    }

}


// Método alternativo para navegadores antiguos
function copiarTextoAntiguo(texto){

    const cuadro = document.createElement("textarea");

    cuadro.value = texto;
    cuadro.setAttribute("readonly", "");
    cuadro.style.position = "fixed";
    cuadro.style.opacity = "0";

    document.body.appendChild(cuadro);

    cuadro.select();

    let copiado = false;

    try{
        copiado = document.execCommand("copy");
    }catch(error){
        copiado = false;
    }

    cuadro.remove();

    return copiado;

}


// Copia sin avisar (antes de abrir Instagram, para pegar
// el enlace en la pegatina). No se espera a que termine:
// así el menú de compartir se abre dentro del mismo toque.
function copiarEnSilencio(texto){

    try{

        if(navigator.clipboard && navigator.clipboard.writeText){

            navigator.clipboard.writeText(texto).catch(() => {
                copiarTextoAntiguo(texto);
            });

            return;

        }

    }catch(error){}

    copiarTextoAntiguo(texto);

}


// -------------------------------------------------------
// QUÉ SE COMPARTE
// -------------------------------------------------------

// Todo lo que necesita el menú (y la imagen) sobre lo que se comparte
function datosCompartirPublicacion(publicacion){

    const podcast = esPodcast(publicacion);

    return {

        clave: "p-" + publicacion.ID,
        tipo: podcast ? "podcast" : "noticia",

        titulo: publicacion.Titulo || CONFIG.nombreRevista,

        texto:
            (publicacion.Entradilla || "").trim() ||
            (podcast ? "Escucha este podcast en " : "Lee esto en ") + CONFIG.nombreRevista,

        url: obtenerEnlaceNoticia(publicacion.ID),

        archivo: "molinillo-" + String(publicacion.ID).toLowerCase() + "-historia.png",

        publicacion

    };

}


function datosCompartirRevista(){

    const mes = edicion.mes || "";

    const titulo =
        CONFIG.nombreRevista + (mes ? " · " + mes : "");

    return {

        clave: "r-" + (idEdicionLeyendo || "actual"),
        tipo: "revista",

        titulo,

        texto:
            "La revista digital del " + CONFIG.centro +
            (mes ? ". Ya está aquí la edición de " + mes.toLowerCase() : "") + ".",

        url: obtenerEnlaceRevista(),

        archivo:
            "molinillo-revista-" +
            normalizar(mes || "edicion").replace(/[^a-z0-9]+/g, "-") +
            "-historia.png"

    };

}


// -------------------------------------------------------
// ABRIR EL MENÚ
// -------------------------------------------------------

function compartirNoticia(id){

    const publicacion = buscarPublicacion(id);

    if(!publicacion) return;

    abrirMenuCompartir(datosCompartirPublicacion(publicacion));

}


function compartirRevista(){

    abrirMenuCompartir(datosCompartirRevista());

}


// Lo que se está compartiendo ahora mismo
let compartiendo = null;

// Imágenes ya creadas (para no repetirlas si se vuelve a abrir)
const imagenesHistoria = new Map();


function puedeCompartirArchivos(){

    try{

        if(!navigator.canShare) return false;

        const prueba = new File(["x"], "prueba.png", { type:"image/png" });

        return navigator.canShare({ files:[prueba] });

    }catch(error){

        return false;

    }

}


function abrirMenuCompartir(datos){

    cerrarModal(true);

    compartiendo = datos;

    const conArchivos = puedeCompartirArchivos();
    const conMenuSistema = !!navigator.share;

    const etiquetaTipo = {
        noticia: "esta noticia",
        podcast: "este podcast",
        revista: "la revista"
    }[datos.tipo];

    const modal = document.createElement("div");

    modal.id = "modal";
    modal.className = "modal hoja-compartir";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "modal-titulo");

    modal.innerHTML = `

        <div class="modal-caja hoja-caja">

            <button
                class="modal-cerrar"
                type="button"
                onclick="cerrarModal()"
                aria-label="Cerrar">
                ${icono("cerrar", 20)}
            </button>

            <div class="hoja-asa" aria-hidden="true"></div>

            <h2 id="modal-titulo">Compartir ${etiquetaTipo}</h2>

            <p class="hoja-sub">${esc(datos.titulo)}</p>

            <div class="hoja-cuerpo">

                <figure class="hoja-vista">

                    <div class="hoja-vista-marco" id="vista-historia">
                        <span class="spinner spinner-grande spinner-claro"></span>
                    </div>

                    <figcaption>Vista previa de la historia</figcaption>

                </figure>

                <div class="hoja-opciones">

                    <button
                        id="boton-historia"
                        class="boton boton-historia boton-grande"
                        type="button"
                        onclick="compartirHistoria()">

                        ${icono("instagram", 20)}
                        ${conArchivos ? "Subir a mi historia" : "Descargar para historia"}

                    </button>

                    <p class="hoja-nota">
                        ${
                        conArchivos
                        ? `Elige <strong>Instagram</strong> y después <strong>Historia</strong>.
                           El enlace se copia solo: añade la pegatina
                           <strong>«Enlace»</strong> y pégalo para que se pueda abrir.`
                        : `Se descargará la imagen. Pásala a tu móvil, súbela a tu historia
                           y añade la pegatina <strong>«Enlace»</strong> con el enlace
                           (te lo copiamos ahora).`
                        }
                    </p>

                    <div class="hoja-rejilla">

                        <a
                            class="hoja-opcion"
                            href="${esc(enlaceWhatsApp(datos))}"
                            target="_blank"
                            rel="noopener"
                            onclick="setTimeout(cerrarModal, 300)">
                            <span class="hoja-opcion-icono opcion-whatsapp">${icono("mensaje", 22)}</span>
                            WhatsApp
                        </a>

                        <button
                            class="hoja-opcion"
                            type="button"
                            onclick="copiarEnlaceCompartido()">
                            <span class="hoja-opcion-icono">${icono("enlace", 22)}</span>
                            Copiar enlace
                        </button>

                        <button
                            class="hoja-opcion"
                            type="button"
                            onclick="descargarHistoria()">
                            <span class="hoja-opcion-icono">${icono("descargar", 22)}</span>
                            Imagen
                        </button>

                        ${
                        conMenuSistema
                        ? `
                            <button
                                class="hoja-opcion"
                                type="button"
                                onclick="compartirEnlaceSistema()">
                                <span class="hoja-opcion-icono">${icono("mas", 22)}</span>
                                Más
                            </button>
                        `
                        : ""
                        }

                    </div>

                </div>

            </div>

        </div>

    `;

    modal.addEventListener("click", evento => {
        if(evento.target === modal) cerrarModal();
    });

    document.body.appendChild(modal);

    requestAnimationFrame(() => modal.classList.add("visible"));

    const primero = modal.querySelector("#boton-historia");
    if(primero) primero.focus({ preventScroll:true });

    // La imagen se prepara nada más abrir: así, al pulsar el botón,
    // ya está lista (iPhone solo deja compartir justo tras el toque)
    prepararHistoria(datos)
        .then(resultado => mostrarVistaPrevia(datos, resultado))
        .catch(error => {

            console.error("No se pudo crear la imagen:", error);

            mostrarVistaPrevia(datos, null);

        });

}


function mostrarVistaPrevia(datos, resultado){

    // Si mientras tanto se ha cerrado o se comparte otra cosa, no se toca
    if(compartiendo !== datos) return;

    const marco = document.getElementById("vista-historia");

    if(!marco) return;

    if(!resultado){

        marco.innerHTML = `<p class="hoja-vista-error">No se ha podido preparar la imagen.</p>`;

        return;

    }

    marco.innerHTML = `<img src="${resultado.url}" alt="Imagen para la historia: ${esc(datos.titulo)}">`;

}


function enlaceWhatsApp(datos){

    const texto = `${datos.titulo}\n${datos.url}`;

    return "https://wa.me/?text=" + encodeURIComponent(texto);

}


function copiarEnlaceCompartido(){

    if(!compartiendo) return;

    copiarTexto(compartiendo.url);

}


async function compartirEnlaceSistema(){

    if(!compartiendo || !navigator.share) return;

    try{

        await navigator.share({
            title: compartiendo.titulo,
            text: compartiendo.texto.slice(0, 160),
            url: compartiendo.url
        });

        cerrarModal();

    }catch(error){

        // La persona cerró el menú de compartir: no pasa nada

    }

}


// -------------------------------------------------------
// HISTORIA DE INSTAGRAM
// -------------------------------------------------------

async function compartirHistoria(){

    const datos = compartiendo;

    if(!datos) return;

    const boton = document.getElementById("boton-historia");

    // El enlace se copia ya, para pegarlo en la pegatina de Instagram
    copiarEnSilencio(datos.url);

    let resultado = imagenesHistoria.get(datos.clave);

    // Todavía preparándose (se pulsó muy rápido)
    if(!resultado){

        if(boton) boton.disabled = true;

        try{
            resultado = await prepararHistoria(datos);
        }catch(error){
            resultado = null;
        }

        if(boton) boton.disabled = false;

        if(!resultado){

            toast("No se ha podido preparar la imagen");

            return;

        }

    }

    const archivo = new File(
        [resultado.blob],
        datos.archivo,
        { type:"image/png" }
    );

    if(navigator.canShare && navigator.canShare({ files:[archivo] })){

        try{

            await navigator.share({ files:[archivo] });

            cerrarModal();

            toast("Enlace copiado: pégalo con la pegatina «Enlace»", {
                duracion:6000
            });

        }catch(error){

            if(error && error.name === "NotAllowedError"){

                // Algunos móviles piden un segundo toque si la imagen
                // aún no estaba lista en el primero
                toast("La imagen ya está lista: vuelve a pulsar");

            }

            // AbortError: la persona cerró el menú. No pasa nada.

        }

        return;

    }

    // Sin poder compartir archivos (ordenador): se descarga
    descargarBlob(resultado.blob, datos.archivo);

    toast("Imagen descargada y enlace copiado", { duracion:5000 });

}


async function descargarHistoria(){

    const datos = compartiendo;

    if(!datos) return;

    let resultado = imagenesHistoria.get(datos.clave);

    if(!resultado){

        try{
            resultado = await prepararHistoria(datos);
        }catch(error){
            resultado = null;
        }

    }

    if(!resultado){

        toast("No se ha podido preparar la imagen");

        return;

    }

    descargarBlob(resultado.blob, datos.archivo);

    toast("Imagen descargada");

}


function descargarBlob(blob, nombre){

    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = nombre;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => URL.revokeObjectURL(url), 60000);

}


// Crea (o recupera) la imagen de la historia
const historiasEnCurso = new Map();

function prepararHistoria(datos){

    if(imagenesHistoria.has(datos.clave)){

        return Promise.resolve(imagenesHistoria.get(datos.clave));

    }

    if(historiasEnCurso.has(datos.clave)){

        return historiasEnCurso.get(datos.clave);

    }

    const promesa = (async () => {

        const lienzo =
            datos.tipo === "revista"
            ? await dibujarHistoriaRevista(datos)
            : await dibujarHistoriaPublicacion(datos);

        const blob = await new Promise((resolver, rechazar) => {

            lienzo.toBlob(
                b => b ? resolver(b) : rechazar(new Error("toBlob vacío")),
                "image/png"
            );

        });

        const resultado = { blob, url: URL.createObjectURL(blob) };

        imagenesHistoria.set(datos.clave, resultado);

        return resultado;

    })();

    historiasEnCurso.set(datos.clave, promesa);

    promesa.finally(() => historiasEnCurso.delete(datos.clave));

    return promesa;

}


// -------------------------------------------------------
// DIBUJO DE LA IMAGEN (1080 x 1920, formato historia)
// -------------------------------------------------------

const HISTORIA = {

    ancho: 1080,
    alto: 1920,
    margen: 84,

    tinta: "#131f4d",
    tintaProfunda: "#0a1030",
    blanco: "#ffffff",
    gris: "#c9d2ee",
    acento: "#f39a2d",

    aspas: ["#2f9be0", "#e5488a", "#f2c81e", "#2fa866", "#f39a2d"],

    colorSeccion: {
        actualidad: "#2f9be0",
        cultura: "#e5488a",
        deportes: "#2fa866",
        steam: "#f2c81e",
        entrevistas: "#f39a2d",
        podcasts: "#e5488a",
        otras: "#5b76e0"
    },

    // Texto oscuro sobre colores claros (amarillo, naranja)
    textoSobre: {
        steam: "#131f4d",
        entrevistas: "#131f4d"
    }

};


const F_TITULO = '"Poppins", system-ui, sans-serif';
const F_SERIF = '"Lora", Georgia, serif';


async function cargarFuentesHistoria(){

    if(!document.fonts || !document.fonts.load) return;

    try{

        await Promise.race([
            Promise.all([
                document.fonts.load(`700 80px ${F_TITULO}`),
                document.fonts.load(`500 40px ${F_TITULO}`),
                document.fonts.load(`400 40px ${F_TITULO}`),
                document.fonts.load(`italic 400 40px ${F_SERIF}`),
                document.fonts.load(`400 40px ${F_SERIF}`)
            ]),
            esperar(4000)
        ]);

    }catch(error){}

}


function esperar(ms){

    return new Promise(resolver => setTimeout(resolver, ms));

}


// Carga una imagen que se pueda pintar en el lienzo sin "mancharlo"
// (si no, el navegador no deja convertirlo en archivo)
function cargarImagenLienzo(src, tiempoMax = 8000){

    return new Promise(resolver => {

        if(!src){
            resolver(null);
            return;
        }

        const img = new Image();

        let terminado = false;

        const acabar = valor => {

            if(terminado) return;

            terminado = true;

            resolver(valor);

        };

        const esPropia = new URL(src, window.location.href).origin === window.location.origin;

        if(!esPropia) img.crossOrigin = "anonymous";

        img.decoding = "async";

        img.onload = () => acabar(img.naturalWidth ? img : null);
        img.onerror = () => acabar(null);

        setTimeout(() => acabar(null), tiempoMax);

        img.src = src;

    });

}


// Prueba varias direcciones de la foto (Drive) y si ninguna
// sirve usa la imagen genérica de la revista
async function cargarFotoHistoria(idODireccion, generica){

    const candidatas = [];

    if(idODireccion){

        if(/^https?:\/\//i.test(idODireccion)){

            candidatas.push(idODireccion);

        }else{

            const id = encodeURIComponent(idODireccion);

            candidatas.push(`https://lh3.googleusercontent.com/d/${id}=w1080`);
            candidatas.push(`https://drive.google.com/thumbnail?id=${id}&sz=w1080&lienzo=1`);

        }

    }

    for(const src of candidatas){

        const img = await cargarImagenLienzo(src);

        if(img && imagenUsable(img)) return img;

    }

    return generica ? cargarImagenLienzo(generica) : null;

}


// Comprueba que la imagen no deja el lienzo "manchado"
function imagenUsable(img){

    try{

        const prueba = document.createElement("canvas");

        prueba.width = prueba.height = 2;

        const c = prueba.getContext("2d");

        c.drawImage(img, 0, 0, 2, 2);
        c.getImageData(0, 0, 1, 1);

        return true;

    }catch(error){

        return false;

    }

}


function crearLienzo(){

    const lienzo = document.createElement("canvas");

    lienzo.width = HISTORIA.ancho;
    lienzo.height = HISTORIA.alto;

    const ctx = lienzo.getContext("2d");

    ctx.textBaseline = "alphabetic";

    return { lienzo, ctx };

}


// Dibuja la imagen cubriendo el rectángulo (como object-fit: cover)
function dibujarCubriendo(ctx, img, x, y, w, h){

    const escala = Math.max(w / img.naturalWidth, h / img.naturalHeight);

    const sw = w / escala;
    const sh = h / escala;

    const sx = (img.naturalWidth - sw) / 2;
    const sy = (img.naturalHeight - sh) / 2;

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);

}


function degradado(ctx, y0, y1, paradas){

    const g = ctx.createLinearGradient(0, y0, 0, y1);

    paradas.forEach(([pos, color]) => g.addColorStop(pos, color));

    return g;

}


function rectRedondeado(ctx, x, y, w, h, r){

    const radio = Math.min(r, w / 2, h / 2);

    ctx.beginPath();
    ctx.moveTo(x + radio, y);
    ctx.arcTo(x + w, y, x + w, y + h, radio);
    ctx.arcTo(x + w, y + h, x, y + h, radio);
    ctx.arcTo(x, y + h, x, y, radio);
    ctx.arcTo(x, y, x + w, y, radio);
    ctx.closePath();

}


// El "aspa" de la marca: hoja con dos esquinas redondeadas
function dibujarAspa(ctx, x, y, tam, color){

    ctx.save();

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arcTo(x + tam, y, x + tam, y + tam, tam);
    ctx.lineTo(x + tam, y + tam);
    ctx.arcTo(x, y + tam, x, y, tam);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

}


// Parte un texto en líneas que caben en "ancho".
// Si no cabe en "maxLineas", la última termina en "…"
function partirLineas(ctx, texto, ancho, maxLineas){

    const palabras = String(texto || "").replace(/\s+/g, " ").trim().split(" ");

    const lineas = [];

    let actual = "";

    for(let i = 0; i < palabras.length; i++){

        const prueba = actual ? actual + " " + palabras[i] : palabras[i];

        if(ctx.measureText(prueba).width <= ancho || !actual){

            actual = prueba;

        }else{

            lineas.push(actual);

            actual = palabras[i];

        }

    }

    if(actual) lineas.push(actual);

    if(lineas.length <= maxLineas){

        return lineas.map(l => recortarLinea(ctx, l, ancho));

    }

    const visibles = lineas.slice(0, maxLineas);

    visibles[maxLineas - 1] =
        recortarLinea(ctx, visibles[maxLineas - 1] + " …", ancho, true);

    return visibles;

}


// Acorta una línea demasiado larga añadiendo "…"
function recortarLinea(ctx, linea, ancho, forzar = false){

    if(!forzar && ctx.measureText(linea).width <= ancho) return linea;

    let texto = linea.replace(/\s*…$/, "");

    while(texto.length > 1 && ctx.measureText(texto + "…").width > ancho){

        texto = texto.slice(0, -1);

    }

    return texto.replace(/[\s,.;:]+$/, "") + "…";

}


// Busca el tamaño de letra más grande con el que el texto
// ocupa como mucho "maxLineas"
function ajustarTexto(ctx, texto, { ancho, maxLineas, tamMax, tamMin, peso = 700, familia = F_TITULO, estilo = "" }){

    for(let tam = tamMax; tam >= tamMin; tam -= 4){

        ctx.font = `${estilo} ${peso} ${tam}px ${familia}`.trim();

        const lineas = partirLineas(ctx, texto, ancho, 99);

        // Ninguna palabra puede ser más ancha que el hueco
        const palabraLarga = String(texto || "")
            .split(/\s+/)
            .some(p => ctx.measureText(p).width > ancho);

        if(lineas.length <= maxLineas && !palabraLarga){

            return { tam, lineas };

        }

    }

    ctx.font = `${estilo} ${peso} ${tamMin}px ${familia}`.trim();

    return {
        tam: tamMin,
        lineas: partirLineas(ctx, texto, ancho, maxLineas)
    };

}


// Logotipo + nombre de la revista
async function dibujarMarca(ctx, x, y, tam){

    const logo = await cargarImagenLienzo("assets/icons/icon-512.png", 4000);

    if(logo){

        ctx.save();

        rectRedondeado(ctx, x, y, tam, tam, tam * 0.24);
        ctx.clip();

        ctx.drawImage(logo, x, y, tam, tam);

        ctx.restore();

        ctx.save();
        rectRedondeado(ctx, x, y, tam, tam, tam * 0.24);
        ctx.strokeStyle = "rgba(255,255,255,.28)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

    }

    const tx = x + (logo ? tam + 24 : 0);

    ctx.fillStyle = HISTORIA.blanco;
    ctx.font = `700 ${Math.round(tam * 0.4)}px ${F_TITULO}`;
    ctx.fillText("El Molinillo", tx, y + tam * 0.48);

    ctx.fillStyle = HISTORIA.gris;
    ctx.font = `400 ${Math.round(tam * 0.3)}px ${F_TITULO}`;
    ctx.fillText("Magazine", tx, y + tam * 0.88);

}


// Etiqueta redondeada (sección, "Podcast", "Nueva edición"...)
function dibujarEtiqueta(ctx, texto, x, y, { fondo, color, conAspa = true, tam = 30 }){

    ctx.font = `700 ${tam}px ${F_TITULO}`;

    const textoMayus = texto.toUpperCase();

    const anchoTexto = ctx.measureText(textoMayus).width + textoMayus.length * 2;

    const alto = Math.round(tam * 2);
    const relleno = Math.round(tam * 0.9);
    const aspa = conAspa ? Math.round(tam * 0.75) : 0;
    const hueco = conAspa ? Math.round(tam * 0.45) : 0;

    const ancho = relleno * 2 + aspa + hueco + anchoTexto;

    ctx.save();

    ctx.fillStyle = fondo;
    rectRedondeado(ctx, x, y, ancho, alto, alto / 2);
    ctx.fill();

    if(conAspa){

        dibujarAspa(ctx, x + relleno, y + (alto - aspa) / 2, aspa, color);

    }

    ctx.fillStyle = color;

    if("letterSpacing" in ctx) ctx.letterSpacing = "2px";

    ctx.fillText(
        textoMayus,
        x + relleno + aspa + hueco,
        y + alto / 2 + tam * 0.36
    );

    if("letterSpacing" in ctx) ctx.letterSpacing = "0px";

    ctx.restore();

    return { ancho, alto };

}


// Las cinco aspas en una línea (como en la web)
function dibujarFranjaAspas(ctx, y, alto){

    const ancho = HISTORIA.ancho / HISTORIA.aspas.length;

    HISTORIA.aspas.forEach((color, i) => {

        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(i * ancho), y, Math.ceil(ancho), alto);

    });

}


// Pie con la invitación y la dirección
function dibujarLlamada(ctx, texto, y){

    const { margen } = HISTORIA;

    ctx.fillStyle = HISTORIA.gris;
    ctx.font = `500 32px ${F_TITULO}`;
    ctx.fillText(texto, margen, y);

    ctx.fillStyle = HISTORIA.acento;
    ctx.font = `700 36px ${F_TITULO}`;
    ctx.fillText(
        recortarLinea(ctx, direccionVisible(), HISTORIA.ancho - margen * 2),
        margen,
        y + 52
    );

}


// --- Noticia o podcast ---

async function dibujarHistoriaPublicacion(datos){

    await cargarFuentesHistoria();

    const { lienzo, ctx } = crearLienzo();

    const { ancho, alto, margen } = HISTORIA;

    const publicacion = datos.publicacion;
    const podcast = datos.tipo === "podcast";

    const claveSec = podcast ? "podcasts" : claveSeccion(seccionDe(publicacion));

    const colorSec = HISTORIA.colorSeccion[claveSec] || HISTORIA.colorSeccion.otras;

    // Fondo
    ctx.fillStyle = HISTORIA.tinta;
    ctx.fillRect(0, 0, ancho, alto);

    // Foto en la parte de arriba
    const altoFoto = 1180;

    const foto = await cargarFotoHistoria(
        idImagenPrincipal(publicacion),
        podcast ? IMAGEN_PODCAST : IMAGEN_NOTICIA
    );

    if(foto){

        dibujarCubriendo(ctx, foto, 0, 0, ancho, altoFoto);

    }

    // Velos para que se lea el texto
    ctx.fillStyle = degradado(ctx, 0, 420, [
        [0, "rgba(10,16,48,.78)"],
        [1, "rgba(10,16,48,0)"]
    ]);
    ctx.fillRect(0, 0, ancho, 420);

    ctx.fillStyle = degradado(ctx, altoFoto - 560, altoFoto, [
        [0, "rgba(19,31,77,0)"],
        [.65, "rgba(19,31,77,.85)"],
        [1, HISTORIA.tinta]
    ]);
    ctx.fillRect(0, altoFoto - 560, ancho, 560);

    // Marca
    await dibujarMarca(ctx, margen, 150, 100);

    // --- Bloque de texto (se coloca de abajo arriba) ---

    const anchoTexto = ancho - margen * 2;

    // Título
    const titulo = ajustarTexto(ctx, publicacion.Titulo || "", {
        ancho: anchoTexto,
        maxLineas: 5,
        tamMax: 96,
        tamMin: 60
    });

    const altoLineaTitulo = Math.round(titulo.tam * 1.08);

    // Entradilla
    ctx.font = `italic 400 40px ${F_SERIF}`;

    const entradilla = (publicacion.Entradilla || "").trim();

    const lineasEntradilla =
        entradilla
        ? partirLineas(ctx, entradilla, anchoTexto, titulo.lineas.length >= 4 ? 2 : 3)
        : [];

    // Autoría
    const autor = (publicacion.Autor || "").trim();

    const altoEtiqueta = 60;

    const bloque =
        altoEtiqueta + 44 +
        titulo.lineas.length * altoLineaTitulo +
        (lineasEntradilla.length ? 30 + lineasEntradilla.length * 56 : 0) +
        (autor ? 34 + 40 : 0);

    const finBloque = 1600;

    let y = Math.max(560, finBloque - bloque);

    // Etiqueta
    const nombreEtiqueta =
        podcast
        ? "Podcast" + (publicacion.SubseccionPodcast ? " · " + subseccionPodcast(publicacion) : "")
        : seccionDe(publicacion);

    dibujarEtiqueta(ctx, nombreEtiqueta, margen, y, {
        fondo: colorSec,
        color: HISTORIA.textoSobre[claveSec] || HISTORIA.blanco,
        conAspa: false
    });

    y += altoEtiqueta + 44;

    // Título
    ctx.fillStyle = HISTORIA.blanco;
    ctx.font = `700 ${titulo.tam}px ${F_TITULO}`;

    if("letterSpacing" in ctx) ctx.letterSpacing = "-1px";

    titulo.lineas.forEach(linea => {

        y += altoLineaTitulo;

        ctx.fillText(linea, margen, y - Math.round(titulo.tam * 0.2));

    });

    if("letterSpacing" in ctx) ctx.letterSpacing = "0px";

    // Entradilla
    if(lineasEntradilla.length){

        y += 30;

        ctx.fillStyle = HISTORIA.gris;
        ctx.font = `italic 400 40px ${F_SERIF}`;

        lineasEntradilla.forEach(linea => {

            y += 56;

            ctx.fillText(linea, margen, y - 12);

        });

    }

    // Autoría
    if(autor){

        y += 34;

        dibujarAspa(ctx, margen, y + 6, 26, colorSec);

        ctx.fillStyle = HISTORIA.blanco;
        ctx.font = `500 32px ${F_TITULO}`;
        ctx.fillText(
            recortarLinea(ctx, autor, anchoTexto - 44),
            margen + 44,
            y + 30
        );

        y += 40;

    }

    // Llamada final
    dibujarLlamada(
        ctx,
        podcast ? "Escúchalo en la revista del " + CONFIG.centro : "Léela en la revista del " + CONFIG.centro,
        1700
    );

    dibujarFranjaAspas(ctx, alto - 18, 18);

    return lienzo;

}


// --- La revista entera ---

async function dibujarHistoriaRevista(datos){

    await cargarFuentesHistoria();

    const { lienzo, ctx } = crearLienzo();

    const { ancho, alto, margen } = HISTORIA;

    const anchoTexto = ancho - margen * 2;

    // Fondo: la foto de portada a toda la pantalla
    ctx.fillStyle = HISTORIA.tinta;
    ctx.fillRect(0, 0, ancho, alto);

    const foto = await cargarFotoHistoria(edicion.portada.imagen, IMAGEN_NOTICIA);

    if(foto){

        dibujarCubriendo(ctx, foto, 0, 0, ancho, alto);

    }

    ctx.fillStyle = degradado(ctx, 0, alto, [
        [0, "rgba(10,16,48,.72)"],
        [.22, "rgba(10,16,48,.25)"],
        [.42, "rgba(19,31,77,.55)"],
        [.6, "rgba(19,31,77,.92)"],
        [1, HISTORIA.tinta]
    ]);
    ctx.fillRect(0, 0, ancho, alto);

    // Marca grande
    await dibujarMarca(ctx, margen, 150, 120);

    // Titulares de la edición (sin la portada), hasta 4
    const idPortada = String((edicion.portada && edicion.portada.ID) || "");

    const tituloPortadaNorm = normalizar(edicion.portada.titulo || "").trim();

    const titulares = noticias
        .filter(n =>
            String(n.ID) !== idPortada &&
            normalizar(n.Titulo || "").trim() !== tituloPortadaNorm
        )
        .slice(0, 4);

    const totalPodcasts = podcasts.length;

    // Altura del bloque para colocarlo desde abajo
    const tituloPortada = (edicion.portada.titulo || "").trim();

    ctx.font = `italic 400 44px ${F_SERIF}`;

    const lineasPortada =
        tituloPortada
        ? partirLineas(ctx, "«" + tituloPortada + "»", anchoTexto, 2)
        : [];

    const altoTitulares =
        titulares.length
        ? 60 + titulares.length * 62 + (totalPodcasts ? 62 : 0)
        : (totalPodcasts ? 60 + 62 : 0);

    const bloque =
        60 + 40 +        // etiqueta
        168 +            // mes
        56 +             // curso
        (lineasPortada.length ? 36 + lineasPortada.length * 58 : 0) +
        (altoTitulares ? 44 + altoTitulares : 0);

    let y = Math.max(620, 1590 - bloque);

    // Etiqueta
    const esActual = !idEdicionLeyendo || idEdicionLeyendo === idEdicionActual;

    const textoEtiqueta =
        edicion.numero
        ? "Número " + edicion.numero
        : (esActual ? "Nueva edición" : "Edición");

    dibujarEtiqueta(ctx, textoEtiqueta, margen, y, {
        fondo: HISTORIA.acento,
        color: HISTORIA.tinta,
        conAspa: true
    });

    y += 60 + 40;

    // Mes
    const mes = edicion.mes || "Nueva edición";

    const ajusteMes = ajustarTexto(ctx, mes, {
        ancho: anchoTexto,
        maxLineas: 1,
        tamMax: 156,
        tamMin: 80
    });

    ctx.fillStyle = HISTORIA.blanco;
    ctx.font = `700 ${ajusteMes.tam}px ${F_TITULO}`;

    if("letterSpacing" in ctx) ctx.letterSpacing = "-3px";

    ctx.fillText(ajusteMes.lineas[0], margen - 4, y + Math.round(ajusteMes.tam * 0.78));

    if("letterSpacing" in ctx) ctx.letterSpacing = "0px";

    y += Math.round(ajusteMes.tam * 1.02) + 8;

    // Curso
    ctx.fillStyle = HISTORIA.gris;
    ctx.font = `500 38px ${F_TITULO}`;
    ctx.fillText(
        edicion.curso ? "Curso " + edicion.curso : CONFIG.centro,
        margen,
        y + 34
    );

    y += 56;

    // Titular de portada
    if(lineasPortada.length){

        y += 36;

        ctx.fillStyle = HISTORIA.blanco;
        ctx.font = `italic 400 44px ${F_SERIF}`;

        lineasPortada.forEach(linea => {

            y += 58;

            ctx.fillText(linea, margen, y - 14);

        });

    }

    // En este número
    if(altoTitulares){

        y += 44;

        ctx.fillStyle = "rgba(255,255,255,.22)";
        ctx.fillRect(margen, y, anchoTexto, 2);

        y += 60;

        ctx.fillStyle = HISTORIA.acento;
        ctx.font = `700 28px ${F_TITULO}`;

        if("letterSpacing" in ctx) ctx.letterSpacing = "3px";

        ctx.fillText("EN ESTE NÚMERO", margen, y - 10);

        if("letterSpacing" in ctx) ctx.letterSpacing = "0px";

        ctx.font = `500 36px ${F_TITULO}`;

        titulares.forEach(noticia => {

            const clave = claveSeccion(seccionDe(noticia));

            dibujarAspa(ctx, margen, y + 18, 26, HISTORIA.colorSeccion[clave] || HISTORIA.colorSeccion.otras);

            ctx.fillStyle = HISTORIA.blanco;
            ctx.font = `500 36px ${F_TITULO}`;
            ctx.fillText(
                recortarLinea(ctx, noticia.Titulo || "", anchoTexto - 48),
                margen + 48,
                y + 44
            );

            y += 62;

        });

        if(totalPodcasts){

            dibujarAspa(ctx, margen, y + 18, 26, HISTORIA.colorSeccion.podcasts);

            ctx.fillStyle = HISTORIA.gris;
            ctx.font = `500 36px ${F_TITULO}`;
            ctx.fillText(
                (titulares.length ? "Y " : "") +
                (totalPodcasts === 1 ? "un podcast para escuchar" : `${totalPodcasts} podcasts para escuchar`),
                margen + 48,
                y + 44
            );

            y += 62;

        }

    }

    dibujarLlamada(ctx, "Lee la revista completa en", 1700);

    dibujarFranjaAspas(ctx, alto - 18, 18);

    return lienzo;

}
