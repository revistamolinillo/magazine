// =======================================================
// UTILIDADES COMUNES
// Funciones pequeñas que usa el resto de la revista.
// =======================================================


// -------------------------------------------------------
// ICONOS (SVG en línea, heredan el color del texto)
// -------------------------------------------------------

const ICONOS = {

    buscar:
        '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',

    luna:
        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',

    sol:
        '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',

    revista:
        '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',

    secciones:
        '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',

    microfono:
        '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',

    hemeroteca:
        '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',

    compartir:
        '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',

    enlace:
        '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',

    volver:
        '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',

    siguiente:
        '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',

    arriba:
        '<polyline points="18 15 12 9 6 15"/>',

    izquierda:
        '<polyline points="15 18 9 12 15 6"/>',

    derecha:
        '<polyline points="9 18 15 12 9 6"/>',

    cerrar:
        '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',

    imagenes:
        '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',

    auriculares:
        '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',

    play:
        '<polygon points="6 3 20 12 6 21 6 3"/>',

    video:
        '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',

    movil:
        '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',

    correo:
        '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',

    lapiz:
        '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',

    instagram:
        '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',

    reloj:
        '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',

    check:
        '<polyline points="20 6 9 17 4 12"/>',

    externo:
        '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',

    calendario:
        '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'

};


function icono(nombre, tam = 20, clase = ""){

    return `<svg class="icono ${clase}" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONOS[nombre] || ""}</svg>`;

}


// -------------------------------------------------------
// TEXTO
// -------------------------------------------------------

// Convierte un texto en HTML seguro (sirve también para atributos)
function esc(texto){

    return String(texto ?? "").replace(
        /[&<>"']/g,
        c => ({
            "&":"&amp;",
            "<":"&lt;",
            ">":"&gt;",
            '"':"&quot;",
            "'":"&#39;"
        }[c])
    );

}


// Minúsculas y sin tildes, para buscar sin preocuparse de acentos
function normalizar(texto){

    return String(texto ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


// Convierte enlaces escritos en el texto en enlaces pulsables
function enlazarURLs(html){

    return html.replace(
        /(https?:\/\/[^\s<]+[^\s<.,;:!?)"'])/g,
        url =>
            `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );

}


// Los textos se muestran como texto normal:
// una línea en blanco separa párrafos.
function textoAParrafos(texto){

    const limpio =
        esc(
            String(texto ?? "").replace(/\r\n?/g, "\n")
        ).trim();

    if(!limpio) return "";

    return limpio
        .split(/\n\s*\n/)
        .map(parrafo =>
            `<p>${enlazarURLs(parrafo.replace(/\n/g, "<br>"))}</p>`
        )
        .join("");

}


function minutosLectura(texto){

    const palabras =
        String(texto ?? "")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .length;

    return Math.max(1, Math.round(palabras / 200));

}


// Marca en amarillo las palabras buscadas
function resaltar(texto, terminos){

    const original = String(texto ?? "");

    if(!terminos || !terminos.length){
        return esc(original);
    }

    const base = normalizar(original);

    // Si al normalizar cambia la longitud no podemos
    // localizar las posiciones con seguridad.
    if(base.length !== original.length){
        return esc(original);
    }

    const marcas = new Array(original.length).fill(false);

    terminos.forEach(termino => {

        if(!termino) return;

        let posicion = base.indexOf(termino);

        while(posicion !== -1){

            for(let i = 0; i < termino.length; i++){
                marcas[posicion + i] = true;
            }

            posicion = base.indexOf(termino, posicion + termino.length);

        }

    });

    let html = "";
    let dentro = false;

    for(let i = 0; i < original.length; i++){

        if(marcas[i] && !dentro){
            html += "<mark>";
            dentro = true;
        }

        if(!marcas[i] && dentro){
            html += "</mark>";
            dentro = false;
        }

        html += esc(original[i]);

    }

    if(dentro) html += "</mark>";

    return html;

}


// -------------------------------------------------------
// SECCIONES
// Cada sección tiene el color de una aspa del logo.
// El color se aplica con data-sec="..." en el CSS.
// -------------------------------------------------------

function claveSeccion(nombre){

    const n = normalizar(nombre).trim();

    if(n.startsWith("actualidad")) return "actualidad";
    if(n.startsWith("cultura"))    return "cultura";
    if(n.startsWith("deport"))     return "deportes";
    if(n.startsWith("steam"))      return "steam";
    if(n.startsWith("entrevista")) return "entrevistas";
    if(n.startsWith("podcast"))    return "podcasts";

    return "otras";

}


// Pequeña aspa de color (toma el color de data-sec)
function marcaAspa(){

    return `<span class="aspa" aria-hidden="true"></span>`;

}


// Etiqueta con el nombre de la sección
function etiquetaSeccion(nombre){

    if(!nombre) return "";

    return `
        <span class="etiqueta-seccion" data-sec="${claveSeccion(nombre)}">
            ${marcaAspa()}
            ${esc(nombre)}
        </span>
    `;

}


// -------------------------------------------------------
// IMÁGENES
// -------------------------------------------------------

const IMAGEN_NOTICIA = "assets/img/noticia.jpg";
const IMAGEN_PODCAST = "assets/img/podcast.jpg";


// Acepta un identificador de Drive o una dirección completa
function urlDrive(idODireccion, ancho = 1200){

    if(!idODireccion) return "";

    if(/^https?:\/\//i.test(idODireccion)){
        return idODireccion;
    }

    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(idODireccion)}&sz=w${ancho}`;

}


// Si una imagen no carga, se sustituye por la imagen genérica.
// (Se escucha una sola vez para toda la página.)
document.addEventListener("error", evento => {

    const img = evento.target;

    if(
        !img ||
        img.tagName !== "IMG" ||
        !img.dataset.fallback ||
        img.dataset.fallido
    ){
        return;
    }

    img.dataset.fallido = "1";

    img.src = img.dataset.fallback;

}, true);


// -------------------------------------------------------
// AVISOS (sustituyen a los alert)
// -------------------------------------------------------

function toast(mensaje, opciones = {}){

    const {
        accion = "",
        alAccion = null,
        duracion = 3500
    } = opciones;

    let zona = document.getElementById("avisos");

    if(!zona){

        zona = document.createElement("div");
        zona.id = "avisos";
        zona.setAttribute("role", "status");
        zona.setAttribute("aria-live", "polite");
        document.body.appendChild(zona);

    }

    const aviso = document.createElement("div");
    aviso.className = "aviso";

    const texto = document.createElement("span");
    texto.textContent = mensaje;
    aviso.appendChild(texto);

    if(accion){

        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "aviso-accion";
        boton.textContent = accion;

        boton.addEventListener("click", () => {
            if(alAccion) alAccion();
            aviso.remove();
        });

        aviso.appendChild(boton);

    }

    zona.appendChild(aviso);

    requestAnimationFrame(() => aviso.classList.add("visible"));

    setTimeout(() => {

        aviso.classList.remove("visible");

        setTimeout(() => aviso.remove(), 300);

    }, duracion);

}


// -------------------------------------------------------
// VENTANAS EMERGENTES (instalación, avisos...)
// -------------------------------------------------------

function abrirModal({ icono: nombreIcono, titulo, html, boton = "Entendido" }){

    cerrarModal(true);

    const modal = document.createElement("div");

    modal.id = "modal";
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "modal-titulo");

    modal.innerHTML = `

        <div class="modal-caja">

            <button
                class="modal-cerrar"
                type="button"
                onclick="cerrarModal()"
                aria-label="Cerrar">
                ${icono("cerrar", 20)}
            </button>

            <div class="modal-icono">
                ${icono(nombreIcono, 28)}
            </div>

            <h2 id="modal-titulo">${titulo}</h2>

            ${html}

            <button
                class="boton boton-primario modal-boton"
                type="button"
                onclick="cerrarModal()">
                ${boton}
            </button>

        </div>

    `;

    modal.addEventListener("click", evento => {
        if(evento.target === modal) cerrarModal();
    });

    document.body.appendChild(modal);

    requestAnimationFrame(() => modal.classList.add("visible"));

    const primero = modal.querySelector(".modal-boton");
    if(primero) primero.focus();

}


function cerrarModal(inmediato = false){

    const modal = document.getElementById("modal");

    if(!modal) return;

    modal.removeAttribute("id");

    modal.classList.remove("visible");

    if(inmediato){
        modal.remove();
        return;
    }

    setTimeout(() => modal.remove(), 250);

}


document.addEventListener("keydown", evento => {

    if(evento.key === "Escape") cerrarModal();

});


// -------------------------------------------------------
// TEMA CLARO / OSCURO
// -------------------------------------------------------

function temaActual(){

    return document.documentElement.dataset.tema === "oscuro"
        ? "oscuro"
        : "claro";

}


function cambiarTema(){

    const nuevo =
        temaActual() === "oscuro"
        ? "claro"
        : "oscuro";

    document.documentElement.dataset.tema = nuevo;

    try{
        localStorage.setItem("molinillo-tema", nuevo);
    }catch(error){
        // Si el navegador no deja guardar, el cambio vale igualmente
    }

    actualizarBotonTema();

}


function actualizarBotonTema(){

    document.querySelectorAll(".boton-tema").forEach(boton => {

        const oscuro = temaActual() === "oscuro";

        boton.innerHTML = icono(oscuro ? "sol" : "luna", 20);

        boton.setAttribute(
            "aria-label",
            oscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
        );

    });

}
