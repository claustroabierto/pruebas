/*  CONFIG DE PIEZA — escapulario
 *  Layout "al costado": se rastrea la pieza y a su derecha aparece el panel
 *  de rayos X + microscopía + composición elemental (Ag/Cu/Au).
 *  offsetX/width/height son ajustables a ojo tras ver en el celular.
 */
window.MUSEO_CONFIG = {
  id: "escapulario",
  titulo: "Escapulario bordado",
  subtitulo: "Rayos X · microscopía · composición elemental",
  ficha: "Bordado con hilos metálicos (plata, cobre, oro) · Análisis por fluorescencia de rayos X",

  targetSrc: "assets/targets.mind",
  targetPreview: "assets/target.jpg",

  // Panel lateral (a la derecha de la pieza). Pieza rastreada = ancho 1.
  overlay: {
    src: "assets/overlay.png",
    width: 1.60,
    height: 1.60,
    offsetX: 1.35,   // desplazado a la derecha de la pieza
    offsetY: 0.00
  },

  // Sin hotspots por ahora: el panel ya trae las tablas Ag/Cu/Au legibles.
  hotspots: []
};
