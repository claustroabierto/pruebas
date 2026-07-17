/*  CONFIG DE PIEZA — Inmaculada_Concepción
 *  Overlay de microscopías (versión corregida del equipo, 2026-07-17) que se
 *  revelan UNA POR UNA sobre el cuadro, cada una con una FLECHA al punto exacto
 *  del pigmento en la pintura.
 *
 *  Coordenadas normalizadas 0..1 sobre el OVERLAY (850x850): `x,y` = centro del
 *  círculo de microscopía; `punto` = destino de la flecha (sobre la pintura).
 */
window.MUSEO_CONFIG = {
  id: "Inmaculada_Concepción",
  titulo: "La Inmaculada Concepción",
  subtitulo: "Microscopía y materialidad · pigmentos",
  ficha: "Óleo sobre lienzo · Escuela colonial · Análisis científico de pigmentos",

  targetSrc: "assets/targets.mind",
  targetPreview: "assets/target.jpg",

  // Geometría de alineación (unidades MindAR: ancho de la pintura = 1).
  // La pintura mide 1 (ancho) x 1.412 (alto); el overlay 850x850 la contiene en
  // un rect de 537px de ancho. src = overlay corregido del equipo (2026-07-17).
  overlay: { src: "assets/overlay-nuevo.webp", width: 1.583, height: 1.583, offsetX: 0.012, offsetY: 0.018 },

  // Revelado uno por uno: cada microscopía aparece en orden, con su flecha.
  revelarSecuencial: true,
  intervaloReveal: 0.9,   // segundos entre cada aparición

  hotspots: [
    { x: 0.235, y: 0.214, color: "#c98a6a", reveal: "assets/reveal/1carnacion.webp", punto: { x: 0.485, y: 0.25 }, img: "assets/micro-carnacion.webp",
      titulo: "Carnación", pigmento: "Bermellón / Albayalde", formula: "HgS · PbCO₃", nota: "El tono de la piel combina bermellón (rojo) y albayalde (blanco de plomo)." },
    { x: 0.752, y: 0.214, color: "#5c7f4f", reveal: "assets/reveal/2verde.webp", punto: { x: 0.55, y: 0.33 }, img: "assets/micro-verde.webp",
      titulo: "Verde", pigmento: "Malaquita", formula: "Cu₂CO₃(OH)₂", nota: "Verde mineral de cobre, muy usado en el manto y paisajes." },
    { x: 0.235, y: 0.430, color: "#e8562a", reveal: "assets/reveal/3rojo1.webp", punto: { x: 0.44, y: 0.42 }, img: "assets/micro-rojo1.webp",
      titulo: "Rojo", pigmento: "Bermellón", formula: "HgS", nota: "Sulfuro de mercurio: el rojo más intenso del periodo colonial." },
    { x: 0.752, y: 0.430, color: "#c1431f", reveal: "assets/reveal/4rojo2.webp", punto: { x: 0.60, y: 0.42 }, img: "assets/micro-rojo2.webp",
      titulo: "Rojo", pigmento: "Bermellón", formula: "HgS", nota: "También presente en los pliegues del manto rojo." },
    { x: 0.235, y: 0.666, color: "#5a79b0", reveal: "assets/reveal/5azul.webp", punto: { x: 0.37, y: 0.60 }, img: "assets/micro-azul.webp",
      titulo: "Azul", pigmento: "Añil", formula: "C₁₆H₁₀N₂O₂", nota: "Tinte vegetal (índigo) traído del comercio colonial." },
    { x: 0.752, y: 0.666, color: "#d8b41f", reveal: "assets/reveal/6amarillo.webp", punto: { x: 0.57, y: 0.62 }, img: "assets/micro-amarillo.webp",
      titulo: "Amarillo", pigmento: "Oropimente", formula: "As₂S₃", nota: "Sulfuro de arsénico: amarillo brillante y tóxico." },
    { x: 0.235, y: 0.884, color: "#b0446a", reveal: "assets/reveal/7morado.webp", punto: { x: 0.45, y: 0.80 }, img: "assets/micro-morado.webp",
      titulo: "Morado", pigmento: "Cochinilla", formula: "C₂₂H₂₀O₁₃", nota: "Colorante del insecto cochinilla, tesoro tintóreo andino." },
    { x: 0.752, y: 0.884, color: "#d9cdb8", reveal: "assets/reveal/8blanco.webp", punto: { x: 0.55, y: 0.82 }, img: "assets/micro-blanco.webp",
      titulo: "Blanco", pigmento: "Albayalde", formula: "PbCO₃", nota: "Blanco de plomo, base de las luces y carnaciones." }
  ]
};
