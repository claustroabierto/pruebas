/*  CONFIG DE PIEZA — cristales (vidrio de uranio)
 *  Toggle antes/después: al deslizar, el candelabro real "se enciende" en verde
 *  como bajo luz UV (overlay UV alineado sobre la pieza, fondo transparente).
 */
window.MUSEO_CONFIG = {
  id: "cristales",
  titulo: "Candelabro de vidrio de uranio",
  subtitulo: "Fluorescencia bajo luz ultravioleta",
  ficha: "Vidrio con contenido de uranio · fluoresce verde bajo radiación UV",

  targetSrc: "assets/targets.mind",
  targetPreview: "assets/target.jpg",

  // Candelabro UV (verde), alineado sobre la silueta de la pieza rastreada.
  overlay: {
    src: "assets/overlay.png",
    width: 0.814,
    height: 1.666,
    offsetX: -0.054,
    offsetY: -0.040
  },

  hotspots: [
    { x: 0.50, y: 0.50, color: "#39ff14", titulo: "Vidrio de uranio",
      pigmento: "Fluorescencia bajo luz UV", formula: "Uranio (U)",
      nota: "El uranio del vidrio absorbe la luz ultravioleta y la reemite como un intenso brillo verde. Invisible a simple vista, resplandece bajo UV." }
  ]
};
