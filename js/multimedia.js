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
// Usa el reproductor de Google Drive (iframe /preview),
// igual que los vídeos. Reproduce al instante.
// -------------------------------------------------------

const PODCAST_INTRO = "assets/audio/intro.mp3";
const PODCAST_OUTRO = "assets/audio/outro.mp3";


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

                    <div class="podcast-reproductor">

                        <audio class="podcast-intro-audio" preload="auto">
                            <source src="${PODCAST_INTRO}" type="audio/mpeg">
                        </audio>

                        <audio class="podcast-outro-audio" preload="auto">
                            <source src="${PODCAST_OUTRO}" type="audio/mpeg">
                        </audio>

                        <button class="podcast-btn-intro" type="button">
                            ${icono("play", 18)}
                            <span>Escuchar intro</span>
                        </button>

                        <iframe
                            class="podcast-iframe-player"
                            src="https://drive.google.com/file/d/${id}/preview"
                            allow="autoplay"
                            loading="lazy">
                        </iframe>

                        <button class="podcast-btn-outro" type="button">
                            ${icono("play", 18)}
                            <span>Escuchar salida</span>
                        </button>

                    </div>

                    <a class="boton boton-primario boton-escuchar-movil"
                       href="https://drive.google.com/file/d/${id}/view"
                       target="_blank" rel="noopener">
                        ${icono("auriculares", 20)}
                        Escuchar podcast
                    </a>

                `;

            }).join("")}

        </div>

    `;

}


// Se llama desde navegacion.js despues de pintar la vista
function inicializarReproductores(){

    var reproductores = document.querySelectorAll(".podcast-reproductor");

    for(var i = 0; i < reproductores.length; i++){

        (function(cont){

            var introAudio = cont.querySelector(".podcast-intro-audio");
            var outroAudio = cont.querySelector(".podcast-outro-audio");
            var btnIntro   = cont.querySelector(".podcast-btn-intro");
            var btnOutro   = cont.querySelector(".podcast-btn-outro");

            if(btnIntro && introAudio){
                var introSonando = false;

                btnIntro.addEventListener("click", function(){
                    if(introSonando){
                        introAudio.pause();
                        introSonando = false;
                        btnIntro.querySelector("svg").outerHTML = icono("play", 18);
                        btnIntro.querySelector("span").textContent = "Escuchar intro";
                    }else{
                        outroAudio.pause();
                        introAudio.currentTime = 0;
                        introAudio.play().catch(function(){});
                        introSonando = true;
                        btnIntro.querySelector("svg").outerHTML = icono("pausa", 18);
                        btnIntro.querySelector("span").textContent = "Pausar intro";
                    }
                });

                introAudio.addEventListener("ended", function(){
                    introSonando = false;
                    btnIntro.querySelector("svg").outerHTML = icono("play", 18);
                    btnIntro.querySelector("span").textContent = "Escuchar intro";
                });
            }

            if(btnOutro && outroAudio){
                var outroSonando = false;

                btnOutro.addEventListener("click", function(){
                    if(outroSonando){
                        outroAudio.pause();
                        outroSonando = false;
                        btnOutro.querySelector("svg").outerHTML = icono("play", 18);
                        btnOutro.querySelector("span").textContent = "Escuchar salida";
                    }else{
                        introAudio.pause();
                        outroAudio.currentTime = 0;
                        outroAudio.play().catch(function(){});
                        outroSonando = true;
                        btnOutro.querySelector("svg").outerHTML = icono("pausa", 18);
                        btnOutro.querySelector("span").textContent = "Pausar salida";
                    }
                });

                outroAudio.addEventListener("ended", function(){
                    outroSonando = false;
                    btnOutro.querySelector("svg").outerHTML = icono("play", 18);
                    btnOutro.querySelector("span").textContent = "Escuchar salida";
                });
            }

        })(reproductores[i]);

    }

}
