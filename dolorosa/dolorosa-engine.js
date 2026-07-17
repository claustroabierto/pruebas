/*  MOTOR RA — dolorosa (parallax 2.5D + luz de velas, específico de esta pieza)
 *  MindAR (image tracking) + three.js. NO es el motor compartido ni el de Malta:
 *  Malta coreografía revelados científicos; acá el cuadro se abre en profundidad.
 *
 *  Efecto:
 *   1. Al detectar la obra, las 3 capas aparecen alineadas: se ve idéntico al
 *      cuadro real (el visitante no nota nada raro).
 *   2. Las capas se SEPARAN en profundidad (fondo atrás, virgen al medio, velas
 *      adelante). El cuadro plano se vuelve un diorama: al mover el celular hay
 *      parallax REAL, porque la cámara se mueve de verdad.
 *   3. Las velas titilan e iluminan la escena (luz cálida que late). Se pueden
 *      apagar: la hornacina queda en penumbra fría.
 *
 *  Compensación de tamaño: al adelantar una capa hacia la cámara se vería más
 *  grande. Se la escala por (D0-z)/D0 para que a la distancia nominal D0 siga
 *  calzando con el cuadro original. El parallax aparece cuando el visitante se
 *  mueve y deja de estar a esa distancia/ángulo — que es justo la gracia.
 */
import * as THREE from "three";
import { MindARThree } from "mindar-image-three";

const CFG = window.MUSEO_CONFIG;
const $ = (id) => document.getElementById(id);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const step = (a, b, t) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;

// Luz de las velas (cálida) vs velas apagadas (penumbra fría de la hornacina).
const LIT = new THREE.Color(1.00, 0.97, 0.92);
const UNLIT = new THREE.Color(0.52, 0.56, 0.70);

function fatal(msg) {
  const el = $("error");
  el.textContent = "⚠ " + msg;
  el.style.display = "block";
  console.error(msg);
}

async function start() {
  if (!CFG || !CFG.layers) return fatal("No se cargó la configuración de la pieza.");

  $("titulo").textContent = CFG.titulo;
  $("subtitulo").textContent = CFG.subtitulo || "";
  $("ficha-txt").textContent = CFG.ficha || "";

  let mindar;
  try {
    mindar = new MindARThree({
      container: $("ar"),
      imageTargetSrc: CFG.targetSrc,
      uiScanning: "no",
      uiLoading: "no",
      filterMinCF: 0.0001,
      filterBeta: 0.001
    });
  } catch (e) {
    return fatal("No se pudo iniciar MindAR: " + e.message);
  }

  const { renderer, scene, camera } = mindar;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const anchor = mindar.addAnchor(0);
  const loader = new THREE.TextureLoader();
  const H = 1 / CFG.aspect;              // alto del plano (ancho de la obra = 1)
  const D0 = CFG.nominalDistance || 2.0;
  const SEP = CFG.separacion || [0.8, 3.0];

  const layers = CFG.layers.map((cfg, i) => {
    const tex = loader.load(cfg.src);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0,
      depthTest: false, depthWrite: false   // el orden lo gobierna renderOrder
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, H), mat);
    mesh.renderOrder = i;                  // fondo → virgen → velas
    anchor.group.add(mesh);
    return {
      key: cfg.key, mesh, mat,
      z: cfg.z || 0, flicker: cfg.flicker || 0, bob: cfg.bob || 0,
      col: new THREE.Color()
    };
  });

  // --- Estado ---
  let visible = false;
  let startT = 0;
  let lit = true;        // velas encendidas
  let litMix = 1;        // transición suave encendido/apagado
  const clock = new THREE.Clock();

  const setCaption = (t) => { $("caption").textContent = t || ""; };
  function updateBotonVelas() {
    $("btn-velas").textContent = lit ? "Apagar velas" : "Encender velas";
  }

  function replay() { startT = clock.getElapsedTime(); }

  anchor.onTargetFound = () => {
    visible = true;
    $("scan").style.display = "none";
    $("panel").classList.add("on");
    replay();
  };
  anchor.onTargetLost = () => {
    visible = false;
    $("scan").style.display = "flex";
    $("panel").classList.remove("on");
  };

  // --- Interacción: apagar/encender velas (botón o tocando la obra) ---
  let lastTap = -1;
  function toggleVelas() { lit = !lit; updateBotonVelas(); }
  $("btn-velas").addEventListener("click", (e) => { e.stopPropagation(); toggleVelas(); });
  $("btn-repeat").addEventListener("click", (e) => { e.stopPropagation(); if (visible) replay(); });
  function handleTap(targetEl) {
    if (!visible) return;
    if (targetEl && targetEl.closest && targetEl.closest("#panel, #topbar, #error")) return;
    const now = performance.now();
    if (now - lastTap < 350) return;   // pointerdown + touchstart disparan juntos
    lastTap = now;
    toggleVelas();
  }
  window.addEventListener("pointerdown", (e) => handleTap(e.target));
  window.addEventListener("touchstart", (e) => handleTap(e.target), { passive: true });
  updateBotonVelas();

  // --- Arranque de cámara ---
  try {
    await mindar.start();
  } catch (e) {
    return fatal("No se pudo acceder a la cámara. Requiere HTTPS y permiso. (" + e.message + ")");
  }
  const placa = $("loading").querySelector(".creditos");
  if (placa) $("scan").appendChild(placa.cloneNode(true));
  $("loading").style.display = "none";

  // --- Bucle de render ---
  renderer.setAnimationLoop(() => {
    const now = clock.getElapsedTime();
    const t = now - startT;

    // Titileo orgánico: tres senos desfasados, nunca repite igual al oído/ojo.
    const flick =
      0.050 * (Math.sin(now * 11.3) + 1) / 2 +
      0.035 * (Math.sin(now * 17.7 + 1.3) + 1) / 2 +
      0.025 * (Math.sin(now * 29.1 + 2.7) + 1) / 2;

    litMix = lerp(litMix, lit ? 1 : 0, 0.06);
    const appear = step(0.0, 0.5, t);
    const sep = step(SEP[0], SEP[1], t);

    for (const L of layers) {
      L.mat.opacity = appear;
      // De plano (z=0, escala 1) a separado (z, escala compensada)
      const s = lerp(1, (D0 - L.z) / D0, sep);
      const bob = L.bob ? Math.sin(now * 0.9) * L.bob * sep : 0;
      L.mesh.position.set(0, 0, L.z * sep + bob);
      L.mesh.scale.set(s, s, 1);
      // Luz: cálida y titilando si están encendidas; fría y quieta si no.
      L.col.copy(UNLIT).lerp(LIT, litMix);
      const dim = 1 - L.flicker * flick * litMix;
      L.mat.color.setRGB(L.col.r * dim, L.col.g * dim, L.col.b * dim);
    }

    if (t < SEP[1]) setCaption("El cuadro se abre en profundidad…");
    else setCaption(lit
      ? "Mueve el celular: las capas se separan · toca para apagar las velas"
      : "Velas apagadas · toca para encenderlas");

    renderer.render(scene, camera);
  });
}

window.addEventListener("DOMContentLoaded", start);
