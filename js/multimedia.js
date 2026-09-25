// =======================================================
// MULTIMEDIA
// Lee el campo "Multimedia" de cada noticia y prepara
// imágenes, vídeos y audios.
//
// Cada línea del campo tiene este formato:
//     idDrive|tipo|enlace
// =======================================================

function obtenerArchivosMultimedia(noticia){

    if(!noticia || !noticia.Multimedia) return [];

    return String(noticia.Multimedia)
        .split("\n")
        .map(linea => linea.trim())
        .filter(linea => linea !== "")
        .map(linea => {

            const partes = linea.split("|");

            return {
                id: partes[0],
                tipo: (partes[1] || "").toLowerCase(),
                url: partes[2] || ""
            };

        });

}


function obtenerImagenes(noticia){

    return obtenerArchivosMultimedia(noticia)
        .filter(a => a.tipo.startsWith("image"));

}


function obtenerVideos(noticia){

    return obtenerArchivosMultimedia(noticia)
        .filter(a => a.tipo.startsWith("video"));

}


function obtenerAudios(noticia){

    return obtenerArchivosMultimedia(noticia)
        .filter(a => a.tipo.startsWith("audio"));

}


// Un contenido es podcast si está marcado como tal
// o si lleva algún archivo de audio.
function esPodcast(noticia){

    return (
        (noticia.TipoContenido || "")
            .trim()
            .toLowerCase() === "podcast"
        ||
        obtenerAudios(noticia).length > 0
    );

}


// Nombre de la subsección de un podcast
// (si no tiene, va a "Otros" para que nunca quede oculto)
function subseccionPodcast(podcast){

    return (podcast.SubseccionPodcast || "").trim() || "Otros";

}


// -------------------------------------------------------
// IMAGEN PRINCIPAL
// -------------------------------------------------------

function idImagenPrincipal(noticia){

    if(noticia.ImagenPrincipal) return noticia.ImagenPrincipal;

    const imagenes = obtenerImagenes(noticia);

    return imagenes.length ? imagenes[0].id : "";

}


function obtenerImagenURL(noticia, ancho = 1200){

    const id = idImagenPrincipal(noticia);

    return id
        ? urlDrive(id, ancho)
        : IMAGEN_NOTICIA;

}


function obtenerImagenPodcast(podcast, ancho = 1200){

    const id = idImagenPrincipal(podcast);

    return id
        ? urlDrive(id, ancho)
        : IMAGEN_PODCAST;

}


// -------------------------------------------------------
// VÍDEOS
// En ordenador se reproducen dentro de la página;
// en móvil se abre el reproductor de Drive.
// (El CSS decide cuál de los dos se ve.)
// -------------------------------------------------------

function obtenerMultimedia(noticia){

    const videos = obtenerVideos(noticia);

    if(videos.length === 0) return "";

    return `

        <div class="bloque-multimedia">

            <h3 class="titulo-bloque-pequeno">
                ${icono("video", 20)}
                Vídeos
            </h3>

            ${videos.map(video => `

                <div class="video-contenedor">

                    <iframe
                        class="video-player"
                        src="https://drive.google.com/file/d/${encodeURIComponent(video.id)}/preview"
                        title="Vídeo de la noticia"
                        allow="autoplay"
                        loading="lazy"
                        allowfullscreen>
                    </iframe>

                </div>

                <a
                    class="video-movil"
                    href="https://drive.google.com/file/d/${encodeURIComponent(video.id)}/view"
                    target="_blank"
                    rel="noopener">

                    <span class="video-movil-icono">
                        ${icono("play", 22)}
                    </span>

                    <span>
                        <strong>Ver vídeo</strong>
                        <small>Se abrirá el reproductor</small>
                    </span>

                </a>

            `).join("")}

        </div>

    `;

}


// -------------------------------------------------------
// AUDIO DE UN PODCAST
// -------------------------------------------------------

function renderAudioPodcast(podcast){

    const audios = obtenerAudios(podcast);

    if(audios.length === 0) return "";

    return `

        <div class="podcast-audio">

            <h3 class="titulo-bloque-pequeno">
                ${icono("auriculares", 20)}
                Escucha el episodio
            </h3>

            ${audios.map(audio => {

                const id = encodeURIComponent(audio.id);

                return `

                    <div class="podcast-player-wrapper">

                        <div class="podcast-player-cargando">
                            <span class="spinner"></span>
                            Cargando reproductor...
                        </div>

                        <iframe
                            class="podcast-player"
                            src="https://drive.google.com/file/d/${id}/preview"
                            title="Reproductor de audio"
                            allow="autoplay"
                            onload="this.parentElement.classList.add('cargado')">
                        </iframe>

                    </div>

                    <a
                        class="boton boton-primario boton-escuchar-movil"
                        href="https://drive.google.com/file/d/${id}/view"
                        target="_blank"
                        rel="noopener">

                        ${icono("auriculares", 20)}
                        Escuchar podcast

                    </a>

                `;

            }).join("")}

        </div>

    `;

}
