#!/usr/bin/env node
/* Render determinístico de um intervalo de quadros com Playwright + ffmpeg.
 *
 *   node render/render.js --timeline build/x/timeline.json --from 0 --to 300 --out build/x/seg0.mp4 [--scale 0.5]
 *   node render/render.js --timeline build/x/timeline.json --stills 0,45,90 --outdir build/x/stills [--scale 0.5]
 *
 * Cada quadro f é desenhado chamando window.renderFrame(f / fps, f) e capturado em JPEG
 * (ou PNG nos stills), canalizado para o ffmpeg (libx264). Sem estado entre quadros:
 * qualquer intervalo pode ser renderizado em qualquer processo.
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

function args() {
  const a = {}, v = process.argv.slice(2);
  for (let i = 0; i < v.length; i++) if (v[i].startsWith("--")) { const k = v[i].slice(2); a[k] = v[i + 1] && !v[i + 1].startsWith("--") ? v[++i] : true; }
  return a;
}

(async () => {
  const A = args();
  const tl = JSON.parse(fs.readFileSync(A.timeline, "utf8"));
  const scale = parseFloat(A.scale || "1");
  const fps = tl.fps;
  const W = tl.largura, H = tl.altura;
  const root = path.resolve(__dirname, "..");
  const browser = await chromium.launch({ args: ["--disable-gpu", "--font-render-hinting=none", "--disable-lcd-text", "--force-color-profile=srgb", "--hide-scrollbars"] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error" || m.type() === "warning") errors.push(`[console.${m.type()}] ${m.text()}`); });
  await page.addInitScript(t => { window.__TIMELINE__ = t; window.__ROOT__ = "../"; }, tl);
  await page.goto("file://" + path.join(root, "player", "index.html"));
  await page.waitForFunction(() => window.__MD_READY__ || window.__MD_ERROR__, null, { timeout: 120000, polling: 100 }); // polling por tempo: rAF é proibido no player
  const err = await page.evaluate(() => window.__MD_ERROR__);
  if (err) { console.error("ERRO no player:\n" + err); await browser.close(); process.exit(2); }

  const clip = { x: 0, y: 0, width: W, height: H };
  const q = parseInt(A.quality || "92", 10);

  if (A.stills) {
    fs.mkdirSync(A.outdir, { recursive: true });
    for (const f of String(A.stills).split(",").map(Number)) {
      await page.evaluate(([t, f]) => window.renderFrame(t, f), [f / fps, f]);
      await page.screenshot({ path: path.join(A.outdir, `f${String(f).padStart(6, "0")}.png`), clip, type: "png" });
    }
  } else {
    const from = parseInt(A.from || "0", 10), to = parseInt(A.to, 10);
    const ow = Math.round(W * scale), oh = Math.round(H * scale);
    const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
      "-vf", `scale=${ow}:${oh}:flags=lanczos,format=yuv420p`, "-c:v", "libx264", "-preset", A.preset || "veryfast",
      ...(A.bitrate ? ["-b:v", A.bitrate, "-maxrate", A.maxrate || A.bitrate, "-bufsize", A.bufsize || "16M"] : ["-crf", A.crf || "17"]),
      "-threads", A.threads || "2", "-r", String(fps), A.out], { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise((res, rej) => ff.on("close", c => (c === 0 ? res() : rej(new Error("ffmpeg saiu com " + c)))));
    const t0 = Date.now();
    const tempos = [];
    for (let f = from; f < to; f++) {
      const ta = Date.now();
      await page.evaluate(([t, f]) => window.renderFrame(t, f), [f / fps, f]);
      const tb = Date.now();
      const buf = await page.screenshot({ clip, type: "jpeg", quality: q });
      tempos.push([f, tb - ta, Date.now() - ta]);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
      if (A.progress && (f - from) % 30 === 29) process.stderr.write(`  [${A.label || ""}] ${f - from + 1}/${to - from}\r`);
    }
    ff.stdin.end();
    await done;
    const dt = (Date.now() - t0) / 1000;
    console.log(JSON.stringify({ seg: A.out, frames: to - from, secs: +dt.toFixed(2), fps: +((to - from) / dt).toFixed(2), tempos }));
  }
  const warns = await page.evaluate(() => window.__WARNINGS__ || []);
  for (const w of [...errors, ...warns]) console.error("AVISO: " + w);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
