# Compilador de `targets.mind`

Genera el archivo de tracking que MindAR necesita para reconocer cada pieza,
usando el mismo compilador que la herramienta web oficial pero por línea de
comandos (Chrome headless vía Puppeteer, sin subir nada a internet).

## Setup (una vez)

```bash
cd tools/mind-compiler
npm install
```

## Uso

```bash
node compile.mjs <imagen_target.jpg> <salida/targets.mind>
```

Ejemplo real:

```bash
node compile.mjs ../../Inmaculada_Concepción/assets/target.jpg ../../Inmaculada_Concepción/assets/targets.mind
```

La imagen debe ser el target plano de la pieza (buen contraste y detalle;
~1000-1200px de lado mayor). El script descarga el compilador de MindAR desde
jsDelivr en tiempo de ejecución, así que requiere conexión a internet.
