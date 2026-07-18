/*  CONFIG DE PIEZA — Éxtasis de Santa Teresa (RA5)
 *  Coreografía animada sobre la pintura real (image tracking):
 *   1. Rayos X aparece creciendo hasta calzar el cuadro.
 *   2. El REVERSO (placa oval de piedra) crece y calza en el ÓVALO blanco del rayos X.
 *   3. El reverso se desplaza a la izquierda.
 *   4. Las microscopías aparecen una por una (sin flechas), en sus posiciones.
 *   5. Queda estático: se tocan las microscopías para hacer ZOOM (los círculos no
 *      llevan aro; un aviso abajo indica que se pueden tocar).
 *  + barra de transparencia (opacidad del rayos X) + botón Repetir.
 *
 *  Unidades: ancho de la pintura = 1, centro en (0,0), y hacia arriba. Las
 *  posiciones/tamaños se AJUSTAN A MANO con `posiciones.html` (no tantear).
 */
window.MUSEO_CONFIG = {
  id: "Extasis_de_Santa_Teresa",
  titulo: "Éxtasis de Santa Teresa",
  subtitulo: "Rayos X · el reverso de piedra · microscopía de pigmentos",
  ficha: "Óleo sobre placa de piedra (mármol ónice) · Rayos X revela el soporte; el reverso lleva la inscripción «Sta. Teresia con l'angelo»",

  targetSrc: "assets/targets.mind",
  targetPreview: "assets/target.jpg",

  // Rayos X que llena el cuadro (PLACEHOLDER — ajustar con posiciones.html).
  rx: { src: "assets/rx.webp", width: 1.06, height: 1.33, offsetX: 0.0, offsetY: 0.02 },

  // Reverso (óvalo) — calza en el óvalo blanco del rayos X y luego va a la IZQUIERDA.
  reverso: {
    src: "assets/reverso.webp", width: 0.46, height: 0.62,
    ovalX: 0.0, ovalY: 0.0,        // dónde calza sobre el óvalo del rayos X
    izqX: -0.82, izqY: 0.0          // a dónde se mueve (izquierda)
  },

  // Microscopías: aparecen una por una (sin flechas). x/y = centro del círculo
  // (= zona tocable para el zoom). PLACEHOLDER — ajustar con posiciones.html.
  microTam: 0.20,                   // diámetro de las bolitas
  intervaloReveal: 0.75,            // seg entre cada aparición
  microscopias: [
    { img: "assets/micro-dorado.webp",    x: -0.30, y:  0.55, titulo: "Dorado",    pigmento: "Oro",     formula: "Au",                 nota: "Detalles dorados en pan de oro (Au) aplicado sobre bol; el rayos X los muestra opacos." },
    { img: "assets/micro-carnacion.webp", x:  0.28, y:  0.35, titulo: "Carnación", pigmento: "Plomo",   formula: "Pb",                 nota: "La carnación (tono de piel) se construye con blanco de plomo (Pb)." },
    { img: "assets/micro-azurita.webp",   x: -0.10, y: -0.45, titulo: "Azurita",   pigmento: "Azurita", formula: "Cu₃(CO₃)₂(OH)₂",     nota: "Azul mineral de azurita, carbonato básico de cobre, muy usado en el manto." }
  ]
};
