/*  CONFIG DE PIEZA — dolorosa
 *  Motor propio (`dolorosa-engine.js`), no el compartido. Efecto 2.5D + fuego
 *  vivo. Idea del equipo del museo: "3 planos, velas interactivas o que la
 *  virgen se mueva hacia adelante".
 *
 *  Las 3 capas vienen registradas (mismo lienzo 2906x3615): alineadas a ancho 1
 *  y centradas calzan exactas sobre la obra. Al detectar se ven idénticas al
 *  cuadro; luego se separan en profundidad y la Virgen SE ADELANTA saliendo de
 *  su hornacina, mientras los cirios arden con llama procedural (no brillo).
 *
 *  `z` = cuánto se adelanta cada capa (unidades MindAR, ancho de la obra = 1).
 */
window.MUSEO_CONFIG = {
  id: "dolorosa",
  titulo: "Virgen Dolorosa",
  subtitulo: "El cuadro cobra vida · la Virgen se adelanta entre los cirios",
  ficha: "Óleo colonial sobre lienzo · Hornacina con mandorla de rayos y cirios",

  targetSrc: "assets/targets.mind",
  targetPreview: "assets/target.jpg",

  aspect: 0.8039,          // ancho/alto de las capas (1000x1244)
  nominalDistance: 2.0,    // distancia de referencia para compensar el tamaño
  separacion: [0.8, 3.0],  // segundos: cuándo el cuadro se abre en profundidad

  // Orden = de atrás hacia adelante. Parallax más agresivo que la 1ª versión:
  // los cirios se despegan mucho más del fondo.
  // salida = amplitud del movimiento autónomo hacia el visitante (la Virgen
  // "sale" del cuadro, visible de frente SIN compensar el tamaño).
  layers: [
    { key: "fondo",  src: "assets/fondo.webp",  z: 0.00 },
    { key: "virgen", src: "assets/virgen.webp", z: 0.22, salida: 0.10 },
    { key: "velas",  src: "assets/velas.webp",  z: 0.42 }
  ],

  // Llamas procedurales sobre la mecha de cada cirio. Posiciones calibradas
  // visualmente contra el asset de velas (la medición automática por color
  // agarraba craquelado del borde; el ojo sobre la llama real fue más fiable).
  flames: [
    { x: -0.350, y: 0.115 },
    { x:  0.315, y: 0.122 }
  ]
};
