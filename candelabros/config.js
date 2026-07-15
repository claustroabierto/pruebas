/*  CONFIG DE PIEZA — candelabros (vidrio de uranio)
 *  Toggle antes/después: al deslizar, el candelabro real "se enciende" en verde
 *  (overlay UV sobre la pieza) y al costado aparecen las burbujas comparativas
 *  del cristal de uranio SIN / CON luz UV.
 */
window.MUSEO_CONFIG = {
  id: "candelabros",
  titulo: "Candelabro de vidrio de uranio",
  subtitulo: "Fluorescencia bajo luz ultravioleta",
  ficha: "Vidrio con contenido de uranio · fluoresce verde bajo radiación UV",

  targetSrc: "assets/targets.mind",
  targetPreview: "assets/target.jpg",

  // Candelabro UV (verde) alineado sobre la pieza rastreada.
  overlay: {
    src: "assets/overlay.webp",
    width: 0.814,
    height: 1.666,
    offsetX: -0.054,
    offsetY: -0.040
  },

  // Burbujas comparativas al costado (cristal de uranio sin/con luz UV).
  extras: [
    { src: "assets/sinuv.webp", width: 0.52, height: 0.88, offsetX: 0.95, offsetY: 0.50 },
    { src: "assets/conuv.webp", width: 0.52, height: 0.82, offsetX: 0.95, offsetY: -0.48 }
  ],

  hotspots: [
    { x: 0.50, y: 0.50, color: "#39ff14", titulo: "Vidrio de uranio",
      pigmento: "Fluorescencia bajo luz UV", formula: "Uranio (U)",
      nota: "El uranio del vidrio absorbe la luz ultravioleta y la reemite como un intenso brillo verde. Invisible a simple vista, resplandece bajo UV." }
  ]
};
