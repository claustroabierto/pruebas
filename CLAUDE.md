# Museo Ayacucho — RA por QR (WebAR)

RA (realidad aumentada) sin app, por QR fijo junto a cada pieza. Exposición
**"Un claustro abierto al mundo a través del arte"** — Monasterio de Carmelitas
Descalzas (Santa Teresa), Ayacucho, en colaboración con UTEC. 14 piezas totales,
se van agregando de una en una.

- Sitio en vivo: https://claustroabierto.github.io/
- Repo: `claustroabierto/claustroabierto.github.io` (org GitHub `claustroabierto`)
- Deploy: GitHub Pages, rama `main`, root. Cada push a `main` publica solo.

## Stack

- **MindAR** (image tracking, MIT) + **three.js** para overlays 2D/animados.
- **Google model-viewer** para las piezas 3D por fotogrametría (pendientes: ver abajo).
- Sin build step, sin framework: HTML + JS plano por pieza + motor compartido.
- Hosting 100% gratis, sin dominio propio (no es requisito del museo).

## Estructura del repo

```
museo-ar/
  index.html          landing con tarjetas a cada pieza
  shared/
    ar-engine.js       motor único: carga MindAR, dibuja overlay + extras + hotspots
    styles.css
  <pieza>/             una carpeta por pieza, ej: Inmaculada_Concepción/, escapulario/, candelabros/
    index.html         boilerplate que carga shared/ar-engine.js + su config.js
    config.js          window.MUSEO_CONFIG = {...} — todo lo específico de la pieza
    assets/
      target.jpg       imagen plana que MindAR rastrea (buen contraste/detalle)
      targets.mind     tracking compilado (binario, generado — ver tools/mind-compiler)
      overlay.png      capa transparente principal (etiquetas / rayos X / etc.)
      ...              otros assets propios de esa pieza (extras[], hotspots, etc.)
  tools/
    mind-compiler/      script para generar targets.mind (ver su README)
```

## Añadir una pieza nueva

1. `cp -r Inmaculada_Concepción NUEVA` (o `escapulario`, el que tenga el layout más parecido)
2. Reemplaza `NUEVA/assets/target.jpg` por la imagen de la pieza nueva
3. Compila el tracking: `cd tools/mind-compiler && node compile.mjs ../../NUEVA/assets/target.jpg ../../NUEVA/assets/targets.mind`
4. Edita `NUEVA/config.js`: `titulo`, `overlay` (width/height/offsetX/offsetY — unidades MindAR, ancho de la pieza real = 1), `hotspots[]` (coords normalizadas 0..1 sobre el overlay), `extras[]` si hay paneles adicionales al costado
5. Agrega la tarjeta en `index.html` (raíz)
6. Prueba en un celular real (HTTPS obligatorio para cámara) antes de dar por cerrada la pieza

## Layouts de overlay (varían por pieza — decidir cuál aplica a cada una nueva)

- **Etiquetas alrededor** (Inmaculada_Concepción): overlay transparente, sin la pieza dibujada, con hotspots que apuntan a zonas de la pintura real.
- **Panel al costado** (escapulario): el overlay trae la pieza + rayos X posicionados para calzar SOBRE la obra real, y paneles extra (microscopía, tablas) quedan al costado, fuera del área rastreada.
- **Toggle antes/después** (candelabros): overlay principal alineado sobre la pieza (ej. fluorescencia UV) + `extras[]` con comparativas sin/con efecto.
- **Crossfade** (piezas sin asset transparente, solo ORIGINAL+ANALISIS compuestos): mezclar con shader/opacidad en vez de superponer capas.

Regla aprendida: si el proveedor de assets ya entrega una capa transparente
recortada, usarla tal cual — no reconstruir manualmente desde la radiografía
cruda. Alinear midiendo bounding boxes (silueta del original vs. componente del
asset) para calcular `width/offsetX/offsetY`, no a ojo.

## Compilar `targets.mind`

MindAR necesita un `.mind` compilado por imagen. Ya NO se hace a mano en la
web oficial — hay un script en `tools/mind-compiler/` que corre el mismo
compilador vía Chrome headless. Ver `tools/mind-compiler/README.md`.

## Pendiente / próximos pasos

- **Sin meshes 3D todavía**: san francisco de borja y Wawapampay solo tienen
  fotos de fotogrametría sin procesar (proyectos Agisoft vacíos). Flujo previsto:
  Metashape/RealityScan → Blender (decimate, bake, texturas ≤1024²) →
  gltf-transform (Draco/KTX2) → `<model-viewer>`.
- **MALTA**: casi sin material fuente (revelado tipo pentimento, Cristo → Virgen oculta).
- **Bichos / dolorosa**: necesitan animación (sprite sheet / video con alpha
  "stacked" three.js), assets aún no generados.
- Assets fuente sin procesar (fotos RAW, PSD, .zip de fotogrametría) NO viven en
  este repo por peso — se comparten aparte (Drive). Solo se commitea lo ya
  procesado para cada pieza (`assets/` final de cada carpeta).

## Convenciones

- Nunca commitear `node_modules/` (raíz `.gitignore` ya lo cubre para
  cualquier subcarpeta, incluido `tools/mind-compiler/`).
- Nombres de carpeta de pieza en minúsculas, sin espacios, mismo id que
  `config.js:id`.
- Probar SIEMPRE en celular real antes de considerar una pieza terminada —
  el emulador/desktop no valida tracking de cámara.
