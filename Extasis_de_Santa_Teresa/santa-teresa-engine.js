/*  MOTOR RA — Éxtasis de Santa Teresa (coreografía animada, motor propio).
 *  MindAR (image tracking de la pintura) + three.js. Secuencia:
 *   1. rayos X crece hasta calzar el cuadro
 *   2. reverso (óvalo) crece en el óvalo blanco del rayos X
 *   3. reverso se mueve a la izquierda
 *   4. microscopías una por una (sin flechas)
 *   5. estático: tocar microscopía -> zoom (sin aro; aviso abajo)
 *  + slider de transparencia (opacidad del rayos X) + botón Repetir.
 */
import * as THREE from "three";
import { MindARThree } from "mindar-image-three";

const CFG = window.MUSEO_CONFIG;
const $ = (id) => document.getElementById(id);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const step = (a, b, t) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
function fatal(msg) { const el = $("error"); el.textContent = "⚠ " + msg; el.style.display = "block"; console.error(msg); }

async function start() {
  if (!CFG) return fatal("No se cargó la configuración de la pieza.");
  $("titulo").textContent = CFG.titulo;
  $("subtitulo").textContent = CFG.subtitulo || "";
  $("ficha-txt").textContent = CFG.ficha || "";

  let mindar;
  try {
    mindar = new MindARThree({ container: $("ar"), imageTargetSrc: CFG.targetSrc, uiScanning: "no", uiLoading: "no", filterMinCF: 0.0001, filterBeta: 0.001 });
  } catch (e) { return fatal("No se pudo iniciar MindAR: " + e.message); }

  const { renderer, scene, camera } = mindar;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const anchor = mindar.addAnchor(0);
  const loader = new THREE.TextureLoader();
  const tx = (s) => { const t = loader.load(s); t.colorSpace = THREE.SRGBColorSpace; return t; };

  // --- Rayos X (llena el cuadro) ---
  const rxCfg = CFG.rx;
  const rxMat = new THREE.MeshBasicMaterial({ map: tx(rxCfg.src), transparent: true, opacity: 0, depthTest: false, depthWrite: false });
  const rxMesh = new THREE.Mesh(new THREE.PlaneGeometry(rxCfg.width, rxCfg.height), rxMat);
  rxMesh.position.set(rxCfg.offsetX, rxCfg.offsetY, 0.001); rxMesh.renderOrder = 1; anchor.group.add(rxMesh);

  // --- Reverso (óvalo) ---
  const rvCfg = CFG.reverso;
  const rvMat = new THREE.MeshBasicMaterial({ map: tx(rvCfg.src), transparent: true, opacity: 0, depthTest: false, depthWrite: false });
  const rvMesh = new THREE.Mesh(new THREE.PlaneGeometry(rvCfg.width, rvCfg.height), rvMat);
  rvMesh.renderOrder = 3; anchor.group.add(rvMesh);

  // --- Microscopías (aparecen una por una; la imagen ya viene recortada en círculo) ---
  const micTam = CFG.microTam || 0.2;
  const micros = (CFG.microscopias || []).map((m, i) => {
    const mat = new THREE.MeshBasicMaterial({ map: tx(m.img), transparent: true, opacity: 0, depthTest: false, depthWrite: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(micTam, micTam), mat);
    mesh.position.set(m.x, m.y, 0.01 + i * 0.001); mesh.renderOrder = 10 + i; anchor.group.add(mesh);
    return { ...m, mesh, mat };
  });

  // --- Estado / UI ---
  let visible = false, startT = 0, rxAlpha = 1, staticReady = false;
  const clock = new THREE.Clock();
  const INTER = CFG.intervaloReveal || 0.75;
  const setCaption = (t) => { const c = $("caption"); if (c) c.textContent = t || ""; };

  anchor.onTargetFound = () => { visible = true; startT = clock.getElapsedTime(); $("scan").style.display = "none"; $("panel").classList.add("on"); };
  anchor.onTargetLost = () => { visible = false; $("scan").style.display = "flex"; $("panel").classList.remove("on"); closeCard(); };

  // Slider de transparencia del rayos X (0 = se ve la pintura, 100 = rayos X pleno).
  const slider = $("reveal");
  if (slider) { slider.value = 100; slider.addEventListener("input", () => { rxAlpha = slider.value / 100; }); }
  // Repetir la coreografía.
  const rb = $("btn-repeat"); if (rb) rb.addEventListener("click", (e) => { e.stopPropagation(); if (visible) startT = clock.getElapsedTime(); });

  // --- Zoom: tocar una microscopía la amplía ---
  function openCard(i) {
    const m = micros[i];
    $("card-titulo").textContent = m.titulo || "";
    $("card-pigmento").textContent = m.pigmento || "";
    $("card-formula").textContent = m.formula || "";
    $("card-nota").textContent = m.nota || "";
    const img = $("card-img"); if (img) { img.src = m.img; img.style.display = "block"; }
    $("card").classList.add("on");
  }
  function closeCard() { $("card").classList.remove("on"); const z = $("zoom"); if (z) z.classList.remove("on"); }
  const cardClose = $("card-close"); if (cardClose) cardClose.addEventListener("click", closeCard);
  const cardImg = $("card-img"), zoom = $("zoom"), zoomImg = $("zoom-img");
  if (cardImg && zoom && zoomImg) {
    cardImg.addEventListener("click", () => { if (!cardImg.getAttribute("src")) return; zoomImg.src = cardImg.src; zoom.classList.add("on"); });
    zoom.addEventListener("click", () => zoom.classList.remove("on"));
  }
  // Toque sobre las microscopías (proyección a pantalla + distancia).
  const _wp = new THREE.Vector3();
  function handleTap(cx, cy, target) {
    if (!visible || !staticReady) return;
    if (target && target.closest && target.closest("#panel, #card, #topbar, #zoom")) return;
    let best = -1, bd = Infinity;
    micros.forEach((m, i) => {
      m.mesh.getWorldPosition(_wp); _wp.project(camera); if (_wp.z > 1) return;
      const sx = (_wp.x * 0.5 + 0.5) * innerWidth, sy = (-_wp.y * 0.5 + 0.5) * innerHeight;
      const d = Math.hypot(sx - cx, sy - cy); if (d < bd) { bd = d; best = i; }
    });
    if (best >= 0 && bd < Math.min(innerWidth, innerHeight) * 0.14) openCard(best);
  }
  window.addEventListener("pointerdown", (e) => handleTap(e.clientX, e.clientY, e.target));
  window.addEventListener("touchstart", (e) => { const t = e.touches && e.touches[0]; if (t) handleTap(t.clientX, t.clientY, e.target); }, { passive: true });

  // --- Cámara ---
  try { await mindar.start(); }
  catch (e) { return fatal("No se pudo acceder a la cámara. Requiere HTTPS y permiso. (" + e.message + ")"); }
  const placa = $("loading").querySelector(".creditos"); if (placa) $("scan").appendChild(placa.cloneNode(true));
  $("loading").style.display = "none";

  // Tiempos (seg desde que se detecta la obra).
  const T_RX = [0.3, 1.6];        // rayos X crece
  const T_RV_IN = [1.9, 3.1];     // reverso crece en el óvalo
  const T_RV_MOVE = [3.4, 4.4];   // reverso se va a la izquierda
  const T_MIC0 = 4.7;             // primera microscopía

  renderer.setAnimationLoop(() => {
    const now = clock.getElapsedTime(), t = now - startT;

    // rayos X: crece 0.02->1; su opacidad la modula el slider.
    rxMesh.scale.setScalar(lerp(0.02, 1, step(T_RX[0], T_RX[1], t)));
    rxMat.opacity = step(T_RX[0], T_RX[0] + 0.5, t) * rxAlpha;

    // reverso: crece en el óvalo y luego se mueve a la izquierda.
    const rvMove = step(T_RV_MOVE[0], T_RV_MOVE[1], t);
    rvMat.opacity = step(T_RV_IN[0], T_RV_IN[0] + 0.5, t);
    rvMesh.scale.setScalar(lerp(0.02, 1, step(T_RV_IN[0], T_RV_IN[1], t)));
    rvMesh.position.set(lerp(rvCfg.ovalX, rvCfg.izqX, rvMove), lerp(rvCfg.ovalY, rvCfg.izqY, rvMove), 0.003);

    // microscopías: una por una (con pop de entrada).
    let shown = 0;
    micros.forEach((m, i) => {
      const a = T_MIC0 + i * INTER, o = step(a, a + 0.5, t);
      m.mat.opacity = o; m.mesh.scale.setScalar(lerp(0.55, 1, o)); if (o > 0.6) shown++;
    });
    staticReady = shown >= micros.length && micros.length > 0;

    if (t < T_RV_IN[0]) setCaption("Rayos X: el soporte de piedra bajo la pintura…");
    else if (t < T_RV_MOVE[1]) setCaption("El reverso de piedra, con su inscripción");
    else if (!staticReady) setCaption("Microscopía de los pigmentos…");
    else setCaption("Toca cada microscopía para ampliarla · desliza para ver el rayos X");

    renderer.render(scene, camera);
  });
}
window.addEventListener("DOMContentLoaded", start);
