// =======================================================
// ESTRUCTURA DE LA PÁGINA
// Cabecera, navegación, portada y pie de página.
// =======================================================


// -------------------------------------------------------
// NAVEGACIÓN PRINCIPAL
// -------------------------------------------------------

function itemsMenu(){

    const items = [

        {
            vista:"portada",
            etiqueta:"Revista",
            icono:"revista",
            href:"./"
        },

        {
            vista:"secciones",
            etiqueta:"Secciones",
            icono:"secciones",
            href:"?vista=secciones"
        }

    ];

    // El enlace a podcasts solo aparece si hay alguno
    if(todosLosPodcasts.length){

        items.push({
            vista:"podcasts",
            etiqueta:"Podcasts",
            icono:"microfono",
            href:"?vista=podcasts"
        });

    }

    items.push(

        {
            vista:"hemeroteca",
            etiqueta:"Hemeroteca",
            icono:"hemeroteca",
            href:"?vista=hemeroteca"
        },

        {
            vista:"buscador",
            etiqueta:"Buscar",
            icono:"buscar",
            href:"?vista=buscador"
        }

    );

    return items;

}


// Pulsar un enlace del menú (respeta Ctrl/Cmd + clic)
function navegarMenu(evento, vista){

    if(
        evento &&
        (
            evento.metaKey ||
            evento.ctrlKey ||
            evento.shiftKey ||
            evento.button === 1
        )
    ){
        return true;
    }

    if(evento) evento.preventDefault();

    if(vista === "portada"){

        volverRevistaActual();

    }else{

        mostrarVista(vista);

    }

    return false;

}


function mostrarBuscador(){

    mostrarVista("buscador");

}


function renderCabecera(){

    const items = itemsMenu();

    return `

    <header class="cabecera">

        <div class="cabecera-interior contenedor-ancho">

            <a
                class="marca"
                href="./"
                onclick="return navegarMenu(event,'portada')"
                aria-label="${esc(CONFIG.nombreRevista)}: ir a la revista">

                <img
                    class="marca-logo"
                    src="assets/img/logo-marca.png"
                    alt=""
                    width="40"
                    height="40">

                <span class="marca-texto">
                    <strong>El Molinillo</strong>
                    <span>Magazine</span>
                </span>

            </a>

            <nav class="nav-principal" aria-label="Principal">

                ${items.map(item => `

                    <a
                        class="nav-enlace"
                        data-vista="${item.vista}"
                        href="${item.href}"
                        onclick="return navegarMenu(event,'${item.vista}')">

                        ${item.vista === "buscador" ? icono("buscar", 18) : ""}
                        ${item.etiqueta}

                    </a>

                `).join("")}

            </nav>

            <div class="cabecera-acciones">

                <button
                    class="boton-icono boton-tema"
                    type="button"
                    onclick="cambiarTema()">
                </button>

            </div>

        </div>

    </header>

    `;

}


// Barra inferior (solo se ve en móvil)
function renderTabs(){

    return `

    <nav class="tabs" aria-label="Navegación">

        ${itemsMenu()
            .map(item => `

            <a
                class="tab"
                data-vista="${item.vista}"
                href="${item.href}"
                onclick="return navegarMenu(event,'${item.vista}')">

                ${icono(item.icono, 22)}

                <span>${item.etiqueta}</span>

            </a>

        `).join("")}

    </nav>

    `;

}


// Marca como activo el enlace de la vista en la que estamos
function actualizarNavegacion(){

    const tipo = tipoVista(vistaActual);

    const activa = {

        portada:"portada",
        noticia:"portada",
        secciones:"secciones",
        seccion:"secciones",
        podcasts:"podcasts",
        podcast:"podcasts",
        hemeroteca:"hemeroteca",
        buscador:"buscador"

    }[tipo];

    document
        .querySelectorAll("[data-vista]")
        .forEach(elemento => {

            const esActiva = elemento.dataset.vista === activa;

            elemento.classList.toggle("activo", esActiva);

            if(esActiva){
                elemento.setAttribute("aria-current", "page");
            }else{
                elemento.removeAttribute("aria-current");
            }

        });

}


// Vuelve a dibujar el menú (por ejemplo cuando aparece el primer podcast)
function refrescarMenu(){

    const cabecera = document.querySelector(".cabecera");
    const tabs = document.querySelector(".tabs");

    if(!cabecera || !tabs) return;

    cabecera.outerHTML = renderCabecera();
    tabs.outerHTML = renderTabs();

    actualizarBotonTema();
    actualizarNavegacion();

}


function montarEstructura(){

    document.getElementById("app").innerHTML = `

        ${renderCabecera()}

        <main id="contenido" tabindex="-1"></main>

        ${renderTabs()}

        <button
            id="boton-subir"
            class="boton-subir"
            type="button"
            onclick="window.scrollTo({top:0})"
            aria-label="Volver arriba">
            ${icono("arriba", 22)}
        </button>

    `;

    actualizarBotonTema();

    activarBotonSubir();

}


// El botón de subir solo aparece cuando se ha bajado bastante
function activarBotonSubir(){

    const boton = document.getElementById("boton-subir");

    if(!boton) return;

    let pendiente = false;

    window.addEventListener("scroll", () => {

        if(pendiente) return;

        pendiente = true;

        requestAnimationFrame(() => {

            pendiente = false;

            boton.classList.toggle(
                "visible",
                window.scrollY > window.innerHeight * 1.5
            );

        });

    }, { passive:true });

}


// -------------------------------------------------------
// PORTADA
// -------------------------------------------------------

function renderPortada(){

    return `

        ${renderHero()}

        ${renderRevista()}

    `;

}


function renderHero(){

    const portada = edicion.portada;

    const imagen = urlDrive(portada.imagen, 1600);

    const titulo =
        portada.titulo ||
        ("Edición de " + (edicion.mes || "este mes"));

    const claveSec =
        claveSeccion(portada.seccion);

    return `

    <section class="hero" data-sec="${claveSec}">

        ${
        imagen
        ? `
            <img
                class="hero-img"
                src="${esc(imagen)}"
                alt=""
                fetchpriority="high"
                decoding="async"
                onerror="this.remove()">
        `
        : ""
        }

        <div class="hero-velo"></div>

        <div class="hero-contenido contenedor-ancho">

            <p class="hero-edicion">

                <span class="hero-mes">
                    ${esc(edicion.mes)}
                </span>

                ${
                edicion.numero
                ? `<span class="hero-numero">${esc(
                        "Número " + edicion.numero +
                        (edicion.curso ? ", curso " + edicion.curso : "")
                   )}</span>`
                : ""
                }

            </p>

            ${etiquetaSeccion(portada.seccion)}

            <h1 class="hero-titulo">
                ${esc(titulo)}
            </h1>

            ${
            portada.entradilla
            ? `<p class="hero-entradilla">${esc(portada.entradilla)}</p>`
            : ""
            }

            <div class="hero-botones">

                <button
                    class="boton boton-primario boton-grande"
                    type="button"
                    onclick="abrirRevista()">

                    Leer la revista

                </button>

                ${
                todosLosPodcasts.length > 0
                ? `
                    <button
                        class="boton boton-cristal boton-grande"
                        type="button"
                        onclick="mostrarVista('podcasts')">

                        ${icono("auriculares", 20)}
                        Escuchar podcasts

                    </button>
                `
                : ""
                }

            </div>

        </div>

        <div class="franja-aspas" aria-hidden="true"></div>

    </section>

    `;

}


// -------------------------------------------------------
// PIE DE PÁGINA
// -------------------------------------------------------

function renderFooter(){

    const instagram =
        CONFIG.urlInstagram
        ? `
            <a
                class="pie-enlace"
                href="${esc(CONFIG.urlInstagram)}"
                target="_blank"
                rel="noopener">
                ${icono("instagram", 18)}
                Instagram
            </a>
        `
        : `
            <span class="pie-enlace pie-enlace-inactivo">
                ${icono("instagram", 18)}
                Instagram
                <small>Próximamente</small>
            </span>
        `;

    return `

    <footer class="pie">

        <div class="franja-aspas" aria-hidden="true"></div>

        <div class="pie-interior contenedor-ancho">

            <div class="pie-marca">

                <div class="pie-logo">

                    <img
                        src="assets/img/logo-marca.png"
                        alt=""
                        width="44"
                        height="44"
                        loading="lazy">

                    <span>
                        <strong>El Molinillo</strong>
                        <span>Magazine</span>
                    </span>

                </div>

                <p>
                    Revista digital del ${esc(CONFIG.centro)}
                </p>

            </div>


            <div class="pie-bloque">

                <h3>Revista</h3>

                <a
                    class="pie-enlace"
                    href="./"
                    onclick="return navegarMenu(event,'portada')">
                    ${icono("revista", 18)}
                    Revista
                </a>

                <a
                    class="pie-enlace"
                    href="?vista=secciones"
                    onclick="return navegarMenu(event,'secciones')">
                    ${icono("secciones", 18)}
                    Secciones
                </a>

                <a
                    class="pie-enlace"
                    href="?vista=hemeroteca"
                    onclick="return navegarMenu(event,'hemeroteca')">
                    ${icono("hemeroteca", 18)}
                    Hemeroteca
                </a>

                <a
                    class="pie-enlace"
                    href="?vista=buscador"
                    onclick="return navegarMenu(event,'buscador')">
                    ${icono("buscar", 18)}
                    Buscar
                </a>

            </div>


            <div class="pie-bloque">

                <h3>Participa</h3>

                <a
                    class="pie-enlace"
                    href="${esc(CONFIG.urlAnadirNoticia)}"
                    target="_blank"
                    rel="noopener">
                    ${icono("lapiz", 18)}
                    Añadir noticia
                </a>

                <a
                    class="pie-enlace"
                    href="mailto:${esc(CONFIG.correoContacto)}"
                    onclick="contactarConNosotros(); return false;">
                    ${icono("correo", 18)}
                    Contacta con nosotros
                </a>

                ${instagram}

            </div>


            <div class="pie-bloque pie-instalar" id="bloque-instalar">

                <h3>Revista en tu dispositivo</h3>

                <p>
                    Lleva El Molinillo Magazine contigo.
                </p>

                <button
                    id="boton-instalar-app"
                    class="boton boton-cristal"
                    type="button"
                    onclick="instalarPWA()">

                    ${icono("movil", 18)}
                    Instalar revista

                </button>

            </div>

        </div>

        <div class="pie-abajo contenedor-ancho">

            <span>
                © ${new Date().getFullYear()} ${esc(CONFIG.nombreRevista)}
            </span>

            <span>
                ${esc(CONFIG.centro)}, ${esc(CONFIG.localidad)}
            </span>

        </div>

    </footer>

    `;

}


// -------------------------------------------------------
// ACCIONES DE UNA PUBLICACIÓN (compartir / copiar enlace)
// -------------------------------------------------------

function renderAcciones(publicacion){

    const id = esc(publicacion.ID);

    return `

        <div class="acciones">

            <button
                class="boton boton-primario"
                type="button"
                onclick="compartirNoticia('${id}')">

                ${icono("compartir", 18)}
                Compartir

            </button>

            <button
                class="boton boton-suave"
                type="button"
                onclick="copiarEnlaceNoticia('${id}')">

                ${icono("enlace", 18)}
                Copiar enlace

            </button>

        </div>

    `;

}


// Enlace real a una publicación (se puede abrir en otra pestaña)
function enlacePublicacion(id, contenido, clase = ""){

    return `
        <a
            class="${clase}"
            href="?noticia=${encodeURIComponent(id)}"
            onclick="return abrirDesdeEnlace(event,'${esc(id)}')">
            ${contenido}
        </a>
    `;

}


function abrirDesdeEnlace(evento, id){

    if(
        evento.metaKey ||
        evento.ctrlKey ||
        evento.shiftKey ||
        evento.button === 1
    ){
        return true;
    }

    evento.preventDefault();

    irANoticia(id);

    return false;

}
