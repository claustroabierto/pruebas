/*  CONFIG DE PIEZA — dolorosa
 *  Motor propio (`dolorosa-engine.js`), no el compartido: acá no hay revelado
 *  científico sino un efecto 2.5D. Es la idea que pidió el equipo del museo
 *  ("3 planos, velas interactivas o que la virgen se mueva hacia adelante").
 *
 *  Las 3 capas vienen registradas (mismo lienzo 2906x3615), así que alineadas
 *  a ancho 1 y centradas calzan exactas sobre la obra real. Al detectar la
 *  pintura se ven idénticas al cuadro; luego se SEPARAN en profundidad y el
 *  cuadro plano se vuelve un diorama: al mover el celular hay parallax real.
 *
 *  `z` = cuánto se adelanta cada capa hacia el visitante (unidades MindAR,
 *  ancho de la obra = 1). El motor compensa el tamaño con `nominalDistance`
 *  para que de frente se siga viendo como el cuadro original.
 */
window.MUSEO_CONFIG = {
  id: "dolorosa",
  titulo: "Virgen Dolorosa",
  subtitulo: "El cuadro cobra profundidad · luz de velas",
  ficha: "Óleo colonial sobre lienzo · Hornacina con mandorla de rayos y cirios",

  targetSrc: "assets/targets.mind",
  targetPreview: "assets/target.jpg",

  aspect: 0.8039,          // ancho/alto de las capas (1000x1244)
  nominalDistance: 2.0,    // distancia de referencia para compensar el tamaño
  separacion: [0.8, 3.0],  // segundos: cuándo el cuadro se abre en profundidad

  // Orden = de atrás hacia adelante (fondo → virgen → velas).
  // flicker = cuánto le afecta el titileo de las velas (las velas, al máximo).
  layers: [
    { key: "fondo",  src: "assets/fondo.webp",  z: 0.00, flicker: 0.45 },
    { key: "virgen", src: "assets/virgen.webp", z: 0.15, flicker: 0.70, bob: 0.012 },
    { key: "velas",  src: "assets/velas.webp",  z: 0.28, flicker: 1.00 }
  ]
};
