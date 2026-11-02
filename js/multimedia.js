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
// Reproductor personalizado con entrada y salida.
// -------------------------------------------------------

const PODCAST_INTRO = "assets/audio/intro.mp3";
const PODCAST_OUTRO = "assets/audio/outro.mp3";

let _reproductoresActivos = [];


function renderAudioPodcast(podcast){

    const audios = obtenerAudios(podcast);

    if(audios.length === 0) return "";

    return `

        <div class="podcast-audio">

            <h3 class="titulo-bloque-pequeno">
                ${icono("auriculares", 20)}
                Escucha el episodio
            </h3>

            ${audios.map((audio, i) => {

                const id = encodeURIComponent(audio.id);

                return `

                    <div class="podcast-reproductor"
                         data-episode-id="${esc(audio.id)}">

                        <div class="podcast-cargando-panel">
                            <div class="podcast-eq-barras">
                                <span></span><span></span><span></span>
                                <span></span><span></span>
                            </div>
                            <p>Cargando audio...</p>
                        </div>

                        <div class="podcast-controles" hidden>

                            <button class="podcast-btn-play"
                                    type="button"
                                    aria-label="Reproducir">
                                ${icono("play", 20)}
                            </button>

                            <div class="podcast-barra-cont">
                                <div class="podcast-barra-bg">
                                    <div class="podcast-barra-prog"></div>
                                </div>
                            </div>

                            <span class="podcast-reloj">
                                0:00 / 0:00
                            </span>

                        </div>

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


// -------------------------------------------------------
// INICIALIZACION DE LOS REPRODUCTORES
// Se llama cada vez que se pinta una vista.
// -------------------------------------------------------

function inicializarReproductores(){

    // Limpiar reproductores anteriores (si se cambia de vista)
    _reproductoresActivos.forEach(function(r){
        r.segmentos.forEach(function(s){
            s.audio.pause();
            s.audio.removeAttribute("src");
            s.audio.load();
        });
        cancelAnimationFrame(r.raf);
    });
    _reproductoresActivos = [];

    // Inicializar los que haya en pantalla
    var reproductores = document.querySelectorAll(".podcast-reproductor");
    for(var i = 0; i < reproductores.length; i++){
        _crearReproductor(reproductores[i]);
    }

}


function _crearReproductor(contenedor){

    var idEpisodio = contenedor.dataset.episodeId;
    if(!idEpisodio) return;

    // -- Elementos del DOM --
    var panelCarga = contenedor.querySelector(".podcast-cargando-panel");
    var controles  = contenedor.querySelector(".podcast-controles");
    var btnPlay    = contenedor.querySelector(".podcast-btn-play");
    var barraFondo = contenedor.querySelector(".podcast-barra-bg");
    var barraProg  = contenedor.querySelector(".podcast-barra-prog");
    var reloj      = contenedor.querySelector(".podcast-reloj");

    // -- Los tres segmentos: entrada, episodio, salida --
    var segmentos = [
        { audio: new Audio(), url: PODCAST_INTRO },
        { audio: new Audio(), url: "" },
        { audio: new Audio(), url: PODCAST_OUTRO }
    ];

    var duraciones    = [0, 0, 0];
    var segActual     = 0;
    var duracionTotal = 0;
    var sonando       = false;
    var listo         = false;
    var rafId         = 0;

    // Referencia para limpieza
    var ref = { segmentos: segmentos, raf: 0 };
    _reproductoresActivos.push(ref);


    // -- Formato mm:ss --

    function fmt(s){
        if(!isFinite(s) || s < 0) return "0:00";
        var m  = Math.floor(s / 60);
        var ss = Math.floor(s % 60);
        return m + ":" + (ss < 10 ? "0" : "") + ss;
    }


    // -- Tiempo actual unificado --

    function tiempoAhora(){
        var t = 0;
        for(var i = 0; i < segActual; i++) t += duraciones[i];
        t += (segmentos[segActual].audio.currentTime || 0);
        return t;
    }


    // -- Pintar barra y reloj --

    function pintar(){
        if(!listo) return;
        var t   = tiempoAhora();
        var pct = duracionTotal > 0 ? (t / duracionTotal) * 100 : 0;
        barraProg.style.width = pct + "%";
        reloj.textContent = fmt(t) + " / " + fmt(duracionTotal);

        if(sonando){
            rafId = requestAnimationFrame(pintar);
            ref.raf = rafId;
        }
    }


    // -- Reproducir / Pausar --

    function reproducir(){
        segmentos[segActual].audio.play().catch(function(){});
        sonando = true;
        btnPlay.innerHTML = icono("pausa", 20);
        btnPlay.setAttribute("aria-label", "Pausar");
        rafId = requestAnimationFrame(pintar);
        ref.raf = rafId;
    }

    function pausar(){
        segmentos[segActual].audio.pause();
        sonando = false;
        btnPlay.innerHTML = icono("play", 20);
        btnPlay.setAttribute("aria-label", "Reproducir");
        cancelAnimationFrame(rafId);
        pintar();
    }


    // -- Pasar al siguiente segmento --

    function siguiente(){
        if(segActual < segmentos.length - 1){
            segActual++;
            // Saltar segmentos que no cargaron (duracion 0)
            if(duraciones[segActual] === 0){
                siguiente();
                return;
            }
            reproducir();
        }else{
            // Todo terminado: volver al inicio
            segActual = 0;
            for(var i = 0; i < segmentos.length; i++){
                segmentos[i].audio.currentTime = 0;
            }
            pausar();
        }
    }


    // -- Buscar en la linea de tiempo unificada --

    function buscar(ratio){
        var tiempo = ratio * duracionTotal;

        segmentos[segActual].audio.pause();

        for(var i = 0; i < segmentos.length; i++){
            if(duraciones[i] === 0){
                continue;
            }
            if(tiempo <= duraciones[i] || i === segmentos.length - 1){
                segActual = i;
                segmentos[i].audio.currentTime =
                    Math.min(Math.max(0, tiempo), duraciones[i] - 0.01);
                break;
            }
            tiempo -= duraciones[i];
        }

        if(sonando) reproducir();
        pintar();
    }


    // -- Cargar los tres audios --
    //    Intro y outro se cargan del repositorio (local).
    //    El episodio se carga a través de Apps Script
    //    (que sí puede leer archivos de Drive).

    function cargar(){

        var pendientes = 3;

        // --- Cargar intro (0) y outro (2): archivos locales ---

        function cargarLocal(i){
            var seg = segmentos[i];
            var resuelto = false;

            function resolver(){
                if(resuelto) return;
                resuelto = true;
                duraciones[i] = seg.audio.duration || 0;
                pendientes--;
                if(pendientes === 0) todoCargado();
            }

            function fallar(){
                if(resuelto) return;
                resuelto = true;
                duraciones[i] = 0;
                pendientes--;
                if(pendientes === 0) todoCargado();
            }

            seg.audio.addEventListener("loadedmetadata", resolver);
            seg.audio.addEventListener("canplay", resolver);
            seg.audio.addEventListener("error", fallar);
            seg.audio.addEventListener("ended", siguiente);

            seg.audio.src = seg.url;
            seg.audio.load();
        }

        cargarLocal(0);
        cargarLocal(2);


        // --- Cargar episodio (1) via proxy de Apps Script ---

        var urlProxy = CONFIG.urlAnadirNoticia
            + "?accion=audio&id=" + encodeURIComponent(idEpisodio);

        console.log("Podcast: cargando audio via Apps Script...");

        fetch(urlProxy)
            .then(function(resp){ return resp.json(); })
            .then(function(data){

                if(data.error){
                    throw new Error(data.error);
                }

                // Decodificar base64 a Blob
                var raw = atob(data.audio);
                var arr = new Uint8Array(raw.length);
                for(var j = 0; j < raw.length; j++){
                    arr[j] = raw.charCodeAt(j);
                }

                var blob = new Blob([arr], {
                    type: data.tipo || "audio/mpeg"
                });
                var blobUrl = URL.createObjectURL(blob);

                console.log("Podcast: audio recibido, tamano=" +
                    arr.length + " bytes");

                // Ahora cargar el blob en el elemento Audio
                var seg = segmentos[1];
                var resuelto = false;

                function resolver(){
                    if(resuelto) return;
                    resuelto = true;
                    duraciones[1] = seg.audio.duration || 0;
                    pendientes--;
                    if(pendientes === 0) todoCargado();
                }

                seg.audio.addEventListener("loadedmetadata", resolver);
                seg.audio.addEventListener("canplay", resolver);
                seg.audio.addEventListener("ended", siguiente);

                seg.audio.src = blobUrl;
                seg.audio.load();

            })
            .catch(function(err){
                console.error("Podcast: error cargando audio:", err);
                duraciones[1] = 0;
                pendientes--;
                if(pendientes === 0) todoCargado();
            });


        // Timeout de seguridad (30s porque el proxy tarda mas)
        setTimeout(function(){
            if(pendientes > 0){
                console.log("Podcast: timeout de carga, pendientes=" + pendientes);
                pendientes = 0;
                todoCargado();
            }
        }, 30000);

    }


    function todoCargado(){

        duracionTotal = duraciones[0] + duraciones[1] + duraciones[2];

        // Si el episodio no cargo, mostrar error
        if(duraciones[1] === 0){
            var texto = panelCarga.querySelector("p");
            if(texto) texto.textContent = "No se pudo cargar el audio.";
            var barras = panelCarga.querySelector(".podcast-eq-barras");
            if(barras) barras.hidden = true;
            // Mostrar el enlace a Drive como alternativa
            var enlace = contenedor.nextElementSibling;
            if(enlace && enlace.classList.contains("boton-escuchar-movil")){
                enlace.style.display = "inline-flex";
            }
            return;
        }

        listo = true;

        panelCarga.hidden = true;
        controles.hidden  = false;

        // Empezar en el primer segmento con audio
        segActual = duraciones[0] > 0 ? 0 : 1;

        pintar();

    }


    // -- Eventos --

    btnPlay.addEventListener("click", function(){
        if(!listo) return;
        if(sonando) pausar();
        else reproducir();
    });

    barraFondo.addEventListener("click", function(e){
        if(!listo) return;
        var rect  = barraFondo.getBoundingClientRect();
        var ratio = (e.clientX - rect.left) / rect.width;
        ratio = Math.max(0, Math.min(1, ratio));
        buscar(ratio);
    });

    // Permitir arrastrar en la barra
    barraFondo.addEventListener("mousedown", function(e){
        if(!listo) return;
        e.preventDefault();

        function mover(ev){
            var rect  = barraFondo.getBoundingClientRect();
            var ratio = (ev.clientX - rect.left) / rect.width;
            buscar(Math.max(0, Math.min(1, ratio)));
        }

        function soltar(){
            document.removeEventListener("mousemove", mover);
            document.removeEventListener("mouseup", soltar);
        }

        document.addEventListener("mousemove", mover);
        document.addEventListener("mouseup", soltar);
    });

    // Tactil
    barraFondo.addEventListener("touchstart", function(e){
        if(!listo) return;

        function moverT(ev){
            var touch = ev.touches[0];
            var rect  = barraFondo.getBoundingClientRect();
            var ratio = (touch.clientX - rect.left) / rect.width;
            buscar(Math.max(0, Math.min(1, ratio)));
        }

        function soltarT(){
            document.removeEventListener("touchmove", moverT);
            document.removeEventListener("touchend", soltarT);
        }

        document.addEventListener("touchmove", moverT);
        document.addEventListener("touchend", soltarT);
    }, { passive: true });


    // -- Arrancar la carga --
    cargar();

}
