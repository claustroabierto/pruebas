/*  CONFIG DE PIEZA — Cristo_de_Malta
 *  A diferencia del resto, esta pieza NO usa el motor compartido (revelado
 *  estático con slider), sino su propio motor `malta-engine.js`, porque la
 *  experiencia es una COREOGRAFÍA animada de tres análisis científicos:
 *
 *    1. Infrarrojo  — el dibujo subyacente del Cristo.
 *    2. Ultravioleta — barnices y retoques en la superficie.
 *    3. Rayos X     — la VIRGEN OCULTA pintada debajo (el pentimento, el "wow").
 *
 *  Las tres aparecen superpuestas sobre la obra una a una; las dos primeras se
 *  apartan a los costados (izq / der) y la Virgen de rayos X queda superpuesta
 *  sobre la pintura original como clímax.
 *
 *  `aspect` = ancho/alto real de cada imagen (medido con el header del webp).
 *  El motor arma el plano con ancho 1 (= ancho de la obra rastreada) y alto
 *  1/aspect, sin deformar.
 */
window.MUSEO_CONFIG = {
  id: "Cristo_de_Malta",
  titulo: "Cristo de Malta",
  subtitulo: "Tres miradas científicas · y una Virgen oculta",
  ficha: "Óleo colonial · Infrarrojo, ultravioleta y rayos X revelan una imagen anterior bajo la pintura",

  targetSrc: "assets/targets.mind",
  targetPreview: "assets/target.jpg",

  // Orden de aparición = orden del arreglo. `slot` = dónde termina cada capa:
  //   left / right = se aparta al costado · center = queda sobre la obra.
  layers: [
    {
      key: "ir",
      src: "assets/ir.webp",
      aspect: 0.7669,
      slot: "left",
      caption: "Infrarrojo · aflora el dibujo subyacente del Cristo"
    },
    {
      key: "uv",
      src: "assets/uv.webp",
      aspect: 0.7753,
      slot: "right",
      caption: "Ultravioleta · barnices y retoques en la superficie"
    },
    {
      key: "rx",
      src: "assets/rx.webp",
      aspect: 0.7669,
      slot: "center",
      caption: "Rayos X · una Virgen oculta fue pintada bajo el Cristo"
    }
  ]
};
