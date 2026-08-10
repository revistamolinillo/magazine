function obtenerArchivosMultimedia(noticia){

    if(!noticia || !noticia.Multimedia) return [];

    return noticia.Multimedia
        .split("\n")
        .map(l=>l.trim())
        .filter(l=>l!=="")
        .map(l=>{

            const partes = l.split("|");

            return {

                id: partes[0],
                tipo: (partes[1] || "").toLowerCase(),
                url: partes[2] || ""

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


function obtenerImagenURL(noticia){

    const imagenes = obtenerImagenes(noticia);

    let url = "";

    if(noticia.ImagenPrincipal){

        url = `https://drive.google.com/thumbnail?id=${noticia.ImagenPrincipal}&sz=w1200`;

    }else if(imagenes.length){

        url = `https://drive.google.com/thumbnail?id=${imagenes[0].id}&sz=w1200`;

    }else{

        url = "assets/img/noticia.jpg";

    }


    console.log("URL IMAGEN GENERADA:", url);

    return url;

}

function obtenerImagenPodcast(podcast){

    const imagenes = obtenerImagenes(podcast);

    if(imagenes.length){

        return `https://drive.google.com/thumbnail?id=${imagenes[0].id}&sz=w1200`;

    }

    return "assets/img/podcast.jpg";

}

function obtenerMultimedia(noticia){

    const videos=obtenerVideos(noticia);
    console.log(videos[0]);

    const audios=obtenerAudios(noticia);

    let html="";

    if(videos.length){

        html+=`

        <div class="bloque-multimedia">

            <h3>🎥 Vídeos</h3>

            ${videos.map(v=>`

                <div class="video-contenedor">

                    <iframe
                        class="video-player"
                        src="https://drive.google.com/file/d/${v.id}/preview"
                        allow="autoplay"
                        allowfullscreen>
                    </iframe>

                </div>

                <div class="video-movil">

                    <a
                        href="https://drive.google.com/file/d/${v.id}/view"
                        target="_blank"
                        rel="noopener">

                        <span class="icono-video">▶</span>

                        <strong>Ver vídeo</strong>

                        <small>Se abrirá el reproductor</small>

                    </a>

                </div>

            `).join("")}

        </div>

        `;

    }


    if(audios.length){

        html += `

            <div class="podcast-audio">

                <h3>🎧 Audio</h3>

                ${audios.map((a, indice) => `

                    <div class="podcast-player-wrapper">

                        <div class="podcast-player-cargando">

                            <span class="podcast-spinner"></span>

                            Cargando reproductor...

                        </div>

                        <iframe
                            class="podcast-player"
                            src="https://drive.google.com/file/d/${a.id}/preview"
                            allow="autoplay"
                            loading="lazy"
                            onload="this.parentElement.classList.add('cargado')">
                        </iframe>

                    </div>

                `).join("")}

            </div>

        `;

    }

    return html;

}

function renderAudioPodcast(podcast){

    const audios = obtenerAudios(podcast);

    if(audios.length === 0) return "";

    return `

        <div class="podcast-audio">

            <h3>🎧 Escucha el episodio</h3>

            ${audios.map((a, indice) => `

                <div class="podcast-player-wrapper">

                    <div class="podcast-player-cargando">

                        <span class="podcast-spinner"></span>

                        Cargando reproductor...

                    </div>

                    <iframe
                        class="podcast-player"
                        src="https://drive.google.com/file/d/${a.id}/preview"
                        allow="autoplay"
                        loading="lazy"
                        onload="this.parentElement.classList.add('cargado')">
                    </iframe>

                </div>

            `).join("")}

        </div>

    `;
}