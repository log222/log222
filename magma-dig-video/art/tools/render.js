#!/usr/bin/env node
/* Render das pranchas do kit (fora do pipeline).
 *   node art/tools/render.js <board> --stills 0,1.5 --out art/frames/x.png   (1 still -> arquivo; vários -> pasta)
 *   node art/tools/render.js <board> --video --from 0 --to 7 --out build/art/teste.mp4
 * Opções: --scale 0.5 (preview rápido), --q 92 (jpeg do vídeo)
 */
const path = require("path"), fs = require("fs"), { spawn } = require("child_process");
const { chromium } = require("playwright");
const argv = process.argv.slice(2), board = argv[0], A = {};
for (let i = 1; i < argv.length; i++) if (argv[i].startsWith("--")) { const k = argv[i].slice(2); A[k] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true; }
(async () => {
  const scale = parseFloat(A.scale || "1"), fps = 30;
  const browser = await chromium.launch({ args: ["--disable-gpu", "--font-render-hinting=none", "--force-color-profile=srgb", "--allow-file-access-from-files"] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
  const errs = []; page.on("pageerror", e => errs.push(String(e))); page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await page.goto("file://" + path.resolve(__dirname, "../preview/index.html") + "?board=" + board);
  await page.waitForFunction(() => window.__READY__ || window.__ERR__, null, { timeout: 120000 });
  const e = await page.evaluate(() => window.__ERR__); if (e) { console.error(e); process.exit(2); }
  const clip = { x: 0, y: 0, width: 1080, height: 1920 };
  const times = [];
  if (A.video) {
    const from = parseFloat(A.from || 0), to = parseFloat(A.to || 6);
    const ow = Math.round(1080 * scale), oh = Math.round(1920 * scale);
    const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", "30", "-c:v", "mjpeg", "-i", "-", "-vf", `scale=${ow}:${oh}:flags=lanczos,format=yuv420p`, "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-r", "30", A.out], { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise((res, rej) => ff.on("close", c => (c === 0 ? res() : rej(new Error("ffmpeg " + c)))));
    for (let f = Math.round(from * fps); f < Math.round(to * fps); f++) {
      const t0 = Date.now();
      await page.evaluate(([t, f]) => window.renderFrame(t, f), [f / fps, f]);
      const t1 = Date.now();
      const buf = await page.screenshot({ clip, type: "jpeg", quality: parseInt(A.q || "93") });
      times.push([t1 - t0, Date.now() - t0]);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    }
    ff.stdin.end(); await done;
  } else {
    const ts = String(A.stills || "0").split(",").map(Number);
    const out = A.out;
    if (ts.length > 1) fs.mkdirSync(out, { recursive: true });
    for (const t of ts) {
      const t0 = Date.now();
      await page.evaluate(([t, f]) => window.renderFrame(t, f), [t, Math.round(t * fps)]);
      const t1 = Date.now();
      const file = ts.length > 1 ? path.join(out, `${board}_${t.toFixed(2)}.png`) : out;
      await page.screenshot({ path: file, clip, type: "png" });
      times.push([t1 - t0, Date.now() - t0]);
    }
  }
  const avg = i => (times.reduce((a, b) => a + b[i], 0) / times.length).toFixed(0);
  console.log(JSON.stringify({ board, frames: times.length, draw_ms: +avg(0), total_ms: +avg(1) }));
  for (const x of errs) console.error("ERRO: " + x);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
