// =======================================================
// ESTADO GLOBAL DE LA REVISTA
// =======================================================

// Datos de la edición que se está leyendo
let edicion = {

    mes:"",
    curso:"",
    numero:"",

    portada:{
        titulo:"",
        entradilla:"",
        imagen:"",
        seccion:""
    }

};

// Contenido de la edición que se está leyendo
let noticias = [];
let podcasts = [];

// Contenido de TODAS las ediciones (buscador, podcasts)
let todasLasNoticias = [];
let todosLosPodcasts = [];

// Hemeroteca
let hemeroteca = [];
let datosEdicionesCargadas = {};

// Ediciones
let idEdicionActual = null;      // la más reciente
let idEdicionLeyendo = null;     // la que se está leyendo ahora
let datosEdicionActual = null;   // datos de la que se lee

// Navegación
let vistaActual = "portada";
let contextoVista = {};          // búsqueda, subsección de podcasts...
let modoPreview = false;
