/*  MOTOR RA — bichos (mantón de Manila, insectos que cobran vida)
 *  MindAR (image tracking) + three.js. Los insectos y aves bordados vuelan
 *  sobre el mantón real que ve la cámara. NO dibuja el mantón (lo pone la
 *  cámara): solo ancla los sprites que vuelan sobre él.
 *
 *  Misma lógica de vuelo que la demo (anim-demo.html). Dos modos por botón:
 *  revolotean (contenido) / enjambre (vuelo amplio). Tocar la obra alterna.
 */
import * as THREE from "three";
import { MindARThree } from "mindar-image-three";

const CFG = window.MUSEO_CONFIG;
const $ = (id) => document.getElementById(id);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, t) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;

function fatal(msg) {
  const el = $("error"); el.textContent = "⚠ " + msg; el.style.display = "block"; console.error(msg);
}

async function start() {
  if (!CFG || !CFG.bichos) return fatal("No se cargó la configuración de la pieza.");
  $("titulo").textContent = CFG.titulo;
  $("subtitulo").textContent = CFG.subtitulo || "";
  $("ficha-txt").textContent = CFG.ficha || "";

  let mindar;
  try {
    mindar = new MindARThree({
      container: $("ar"), imageTargetSrc: CFG.targetSrc,
      uiScanning: "no", uiLoading: "no", filterMinCF: 0.0001, filterBeta: 0.001
    });
  } catch (e) { return fatal("No se pudo iniciar MindAR: " + e.message); }

  const { renderer, scene, camera } = mindar;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const anchor = mindar.addAnchor(0);
  const loader = new THREE.TextureLoader();
  const tex = (s) => { const t = loader.load(s); t.colorSpace = THREE.SRGBColorSpace; return t; };

  const bichos = CFG.bichos.map((b, i) => {
    const mat = new THREE.MeshBasicMaterial({ map: tex(b.src), transparent: true, depthTest: false, depthWrite: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    mesh.renderOrder = 2 + i; anchor.group.add(mesh);
    return { ...b, mesh, mat, ph: i * 1.7, fx: 0.33 + i * 0.028, fy: 0.26 + i * 0.022, cur: null };
  });

  let mode = "revolotea", visible = false, lastTap = -1;
  const clock = new THREE.Clock();
  const setCaption = (t) => { $("caption").textContent = t || ""; };
  const updateBtn = () => { $("btn-modo").textContent = mode === "revolotea" ? "Que vuelen más" : "Que se calmen"; };

  function trans(b, i, now) {
    let fly = 1, ampMul = mode === "enjambre" ? 1.0 : 0.42;
    const amp = b.spread * ampMul;
    const ox = Math.sin(now * b.fx + b.ph) * amp * fly;
    const oy = Math.sin(now * b.fy + b.ph * 1.3) * amp * 0.55 * fly + Math.sin(now * 1.1 + b.ph) * 0.012 * fly;
    const flapv = Math.sin(now * b.flap + b.ph);
    const sy = b.size * (1 + flapv * 0.14);
    const sx = b.size * b.aspect;
    const rot = Math.sin(now * 0.6 + b.ph) * 0.18 + flapv * 0.025;
    const z = 0.02 + fly * (0.05 + 0.03 * Math.sin(now * b.fx + b.ph));
    return { x: b.x + ox, y: b.y + oy, z, sx, sy, rot };
  }

  anchor.onTargetFound = () => { visible = true; $("scan").style.display = "none"; $("panel").classList.add("on"); };
  anchor.onTargetLost = () => { visible = false; $("scan").style.display = "flex"; $("panel").classList.remove("on"); };

  const toggle = () => { mode = mode === "revolotea" ? "enjambre" : "revolotea"; updateBtn();
    setCaption(mode === "enjambre" ? "Los bordados vuelan por todo el mantón" : "Los insectos revolotean sobre la seda"); };
  $("btn-modo").addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
  function handleTap(el) {
    if (!visible) return;
    if (el && el.closest && el.closest("#panel, #topbar, #error")) return;
    const now = performance.now(); if (now - lastTap < 350) return; lastTap = now; toggle();
  }
  window.addEventListener("pointerdown", (e) => handleTap(e.target));
  window.addEventListener("touchstart", (e) => handleTap(e.target), { passive: true });
  updateBtn();

  try { await mindar.start(); }
  catch (e) { return fatal("No se pudo acceder a la cámara. Requiere HTTPS y permiso. (" + e.message + ")"); }
  const placa = $("loading").querySelector(".creditos");
  if (placa) $("scan").appendChild(placa.cloneNode(true));
  $("loading").style.display = "none";
  setCaption("Los insectos revolotean sobre la seda");

  renderer.setAnimationLoop(() => {
    const now = clock.getElapsedTime();
    for (let i = 0; i < bichos.length; i++) {
      const b = bichos[i], t = trans(b, i, now);
      if (!b.cur) b.cur = { ...t };
      for (const k of ["x", "y", "z", "sx", "sy", "rot"]) b.cur[k] = lerp(b.cur[k], t[k], 0.14);
      b.mesh.position.set(b.cur.x, b.cur.y, b.cur.z);
      b.mesh.scale.set(b.cur.sx, b.cur.sy, 1);
      b.mesh.rotation.z = b.cur.rot;
    }
    renderer.render(scene, camera);
  });
}
window.addEventListener("DOMContentLoaded", start);
