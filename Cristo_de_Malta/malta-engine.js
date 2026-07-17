/*  MOTOR RA — Cristo_de_Malta (coreografía animada, específico de esta pieza)
 *  MindAR (image tracking) + three.js. NO es el motor compartido: aquí las tres
 *  capas de análisis se animan en el tiempo en vez de aparecer todas con un
 *  slider. Reutiliza el mismo shell HTML, shared/styles.css y MindAR/three.
 *
 *  Coreografía (segundos desde que se detecta la obra):
 *    - IR aparece superpuesta y centrada, se sostiene, y se aparta a la IZQUIERDA
 *      mientras UV aparece centrada; UV se aparta a la DERECHA mientras la Virgen
 *      de rayos X aparece centrada y SE QUEDA sobre la pintura (clímax).
 *  Luego (modo interactivo): tocar un lateral lo trae al centro; tocar el centro
 *  lo atenúa para ver la obra real por debajo.
 */
import * as THREE from "three";
import { MindARThree } from "mindar-image-three";

const CFG = window.MUSEO_CONFIG;
const $ = (id) => document.getElementById(id);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
// smoothstep: rampa suave 0→1 entre a y b
const step = (a, b, t) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;

function fatal(msg) {
  const el = $("error");
  el.textContent = "⚠ " + msg;
  el.style.display = "block";
  console.error(msg);
}

// Poses en unidades MindAR (ancho de la obra = 1, centrada en 0).
const POSE = {
  center: { x: 0.00, y: 0.00, s: 1.00 },
  left:   { x: -0.82, y: 0.00, s: 0.54 },
  right:  { x: 0.82, y: 0.00, s: 0.54 }
};

// Línea de tiempo de la intro (s). appear = fundido de entrada centrado;
// move = desplazamiento a su costado (null = se queda en el centro).
const TL = {
  ir: { appear: [0.4, 1.3], move: [2.0, 3.1] },
  uv: { appear: [2.0, 2.9], move: [3.6, 4.7] },
  rx: { appear: [3.6, 4.7], move: null }
};
const INTRO_END = 5.0;

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
  scene.add(new THREE.AmbientLight(0xffffff, 1.4));

  const anchor = mindar.addAnchor(0);
  const loader = new THREE.TextureLoader();

  // --- Construcción de las tres capas ---
  const layers = CFG.layers.map((cfg, i) => {
    const tex = loader.load(cfg.src);
    tex.colorSpace = THREE.SRGBColorSpace;
    const h = 1 / cfg.aspect; // ancho 1, alto sin deformar
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0,
      depthTest: false, depthWrite: false // el orden lo gobierna renderOrder
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, h), mat);
    anchor.group.add(mesh);
    const layer = {
      key: cfg.key, mesh, mat, caption: cfg.caption,
      slot: cfg.slot,           // dónde termina en la intro
      order: i,                 // orden de aparición (z relativo)
      cur: { x: 0, y: 0, s: 1 },// pose actual (se escribe cada frame)
      op: 0,                    // opacidad actual
      peek: false              // en interactivo: centro atenuado para ver la obra
    };
    mesh.userData.layer = layer;
    return layer;
  });
  const byKey = (k) => layers.find((l) => l.key === k);

  function applyPose(l) {
    l.mesh.position.set(l.cur.x, l.cur.y, 0.01 + l.order * 0.001);
    l.mesh.scale.set(l.cur.s, l.cur.s, 1);
    l.mat.opacity = l.op;
    l.mesh.renderOrder = (l.slot === "center") ? 10 : l.order;
    l.mesh.visible = l.op > 0.001;
  }

  // --- Estado / fases ---
  let visible = false;
  let phase = "idle";     // idle | intro | interactive
  let startT = 0;         // clock time en que se detectó la obra
  const clock = new THREE.Clock();

  function setCaption(txt) { $("caption").textContent = txt || ""; }

  function resetIntro() {
    phase = "intro";
    startT = clock.getElapsedTime();
    layers.forEach((l) => {
      l.slot = CFG.layers.find((c) => c.key === l.key).slot; // restaura slots
      l.op = 0; l.peek = false;
      l.cur = { ...POSE.center };
    });
    $("btn-toggle").style.display = "none";
    setCaption("Analizando la obra…");
  }

  anchor.onTargetFound = () => {
    visible = true;
    $("scan").style.display = "none";
    $("panel").classList.add("on");
    resetIntro();
  };
  anchor.onTargetLost = () => {
    visible = false;
    phase = "idle";
    $("scan").style.display = "flex";
    $("panel").classList.remove("on");
  };

  // --- Coreografía de la intro (pose + opacidad por tiempo) ---
  function intro(t) {
    for (const l of layers) {
      const tl = TL[l.key];
      l.op = step(tl.appear[0], tl.appear[1], t);
      const from = POSE.center, to = POSE[l.slot];
      const mp = tl.move ? step(tl.move[0], tl.move[1], t) : 0;
      l.cur.x = lerp(from.x, to.x, mp);
      l.cur.y = lerp(from.y, to.y, mp);
      // ligero "pop" al entrar: arranca 4% más grande y asienta
      const pop = 1 + 0.04 * (1 - step(tl.appear[0], tl.appear[1], t));
      l.cur.s = lerp(from.s, to.s, mp) * pop;
    }
    // Subtítulo narrativo según el momento
    if (t < TL.uv.appear[0]) setCaption(byKey("ir").caption);
    else if (t < TL.rx.appear[0]) setCaption(byKey("uv").caption);
    else setCaption(byKey("rx").caption);

    if (t >= INTRO_END) {
      phase = "interactive";
      $("btn-toggle").style.display = "";
      setCaption(byKey("rx").caption + "  ·  toca los laterales para comparar");
    }
  }

  // --- Modo interactivo: cada capa converge suavemente a su slot ---
  function interactive() {
    for (const l of layers) {
      const to = POSE[l.slot];
      l.cur.x = lerp(l.cur.x, to.x, 0.14);
      l.cur.y = lerp(l.cur.y, to.y, 0.14);
      l.cur.s = lerp(l.cur.s, to.s, 0.14);
      const targetOp = (l.slot === "center" && l.peek) ? 0.25 : 1;
      l.op = lerp(l.op, targetOp, 0.14);
    }
  }

  // --- Toque: lateral -> al centro · centro -> atenuar para ver la obra ---
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let lastTap = -1; // en móvil pointerdown + touchstart disparan por el mismo toque
  function handleTap(clientX, clientY, targetEl) {
    if (!visible || phase !== "interactive") return;
    if (targetEl && targetEl.closest && targetEl.closest("#panel, #topbar, #error")) return;
    const now = performance.now();
    if (now - lastTap < 350) return; // el swap/peek no es idempotente: deduplicar
    lastTap = now;
    ndc.x = (clientX / window.innerWidth) * 2 - 1;
    ndc.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(layers.map((l) => l.mesh), false)[0];
    if (!hit) return;
    const L = hit.object.userData.layer;
    if (L.slot === "center") {
      L.peek = !L.peek; // atenuar/mostrar la capa central sobre la obra real
      return;
    }
    // Traer el lateral tocado al centro; el central actual toma el hueco.
    const centerL = layers.find((l) => l.slot === "center");
    const freed = L.slot;
    if (centerL) { centerL.slot = freed; centerL.peek = false; }
    L.slot = "center"; L.peek = false;
    setCaption(L.caption + "  ·  toca el centro para ver la obra real");
  }
  window.addEventListener("pointerdown", (e) => handleTap(e.clientX, e.clientY, e.target));
  window.addEventListener("touchstart", (e) => {
    const t = e.touches && e.touches[0];
    if (t) handleTap(t.clientX, t.clientY, e.target);
  }, { passive: true });

  // Botón repetir: vuelve a lanzar la coreografía
  $("btn-toggle").addEventListener("click", () => { if (visible) resetIntro(); });

  // --- Arranque de cámara ---
  try {
    await mindar.start();
  } catch (e) {
    return fatal("No se pudo acceder a la cámara. Requiere HTTPS y permiso. (" + e.message + ")");
  }
  // Los créditos acompañan también el escaneo (igual que el motor compartido).
  const placa = $("loading").querySelector(".creditos");
  if (placa) $("scan").appendChild(placa.cloneNode(true));
  $("loading").style.display = "none";

  // --- Bucle de render ---
  renderer.setAnimationLoop(() => {
    if (phase === "intro") intro(clock.getElapsedTime() - startT);
    else if (phase === "interactive") interactive();
    layers.forEach(applyPose);
    renderer.render(scene, camera);
  });
}

window.addEventListener("DOMContentLoaded", start);
