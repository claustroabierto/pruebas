/*  Compilador automático de targets.mind (MindAR) vía Chrome headless.
 *  Uso:  node compile.mjs <imagen_entrada> <salida.mind>
 *  Corre el MISMO compilador que la herramienta web oficial, sin build nativo.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const [imgPath, outPath] = process.argv.slice(2);
if (!imgPath || !outPath) {
  console.error("Uso: node compile.mjs <imagen> <salida.mind>");
  process.exit(1);
}

const imgBuf = fs.readFileSync(imgPath);
const ext = path.extname(imgPath).slice(1).toLowerCase();
const mime = ext === "png" ? "image/png" : "image/jpeg";
const dataUrl = `data:${mime};base64,${imgBuf.toString("base64")}`;

// El bundle es un ES module con imports a chunks hermanos -> se carga como
// módulo desde el CDN (necesita una página http real, no about:blank/data).
const bundleUrl = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js";

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});
try {
  const page = await browser.newPage();
  page.on("console", (m) => process.stdout.write("  [page] " + m.text() + "\n"));
  page.on("pageerror", (e) => process.stdout.write("  [pageerror] " + e.message + "\n"));
  // Página con origen http para permitir módulos cross-origin del CDN
  await page.goto("https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.evaluate(async (url) => {
    await import(url);
  }, bundleUrl);
  await page.waitForFunction("window.MINDAR && window.MINDAR.IMAGE && window.MINDAR.IMAGE.Compiler", { timeout: 30000 });

  console.log("Compilando " + path.basename(imgPath) + " ...");
  const b64 = await page.evaluate(async (durl) => {
    const img = new Image();
    img.src = durl;
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
    const compiler = new window.MINDAR.IMAGE.Compiler();
    await compiler.compileImageTargets([img], (p) => console.log("progreso: " + p.toFixed(1) + "%"));
    const buffer = await compiler.exportData();
    // buffer es ArrayBuffer/Uint8Array -> base64
    const bytes = new Uint8Array(buffer);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }, dataUrl);

  fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
  console.log("OK -> " + outPath + " (" + fs.statSync(outPath).size + " bytes)");
} finally {
  await browser.close();
}
