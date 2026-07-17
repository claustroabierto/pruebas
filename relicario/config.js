/*  CONFIG DE PIEZA — relicario (usa MARCADOR RA como target)
 *  El relicario es un objeto de VOLUMEN (medallón con reliquias): no rastrea
 *  como imagen plana y lo mueven en vitrina. Por eso el target NO es la pieza
 *  sino un MARCADOR RA impreso que se coloca junto a ella.
 *
 *  El marcador (assets/marcador.jpg) lleva la foto de la pieza (para que
 *  enganche: detección 3737, vs 379 de las letras RA solas) + "RA6". Al
 *  escanearlo, el relicario "sale" del marcador y flota, ampliado.
 *
 *  Este config sirve de plantilla para cualquier pieza que use marcador RA:
 *  cambiar marcador/objeto/textos.
 */
window.MUSEO_CONFIG = {
  id: "relicario",
  titulo: "Relicario",
  subtitulo: "Escanea el marcador · la pieza cobra vida",
  ficha: "Relicario de oro con reliquias y esmaltes · s. XVII · objeto de volumen (marcador RA)",

  targetSrc: "assets/targets.mind",
  targetPreview: "assets/marcador.jpg",

  // El objeto que "sale" del marcador y flota.
  objeto: { src: "assets/relicario.webp", aspect: 0.687, size: 1.15 }
};
