#!/usr/bin/env node
/* Mede o tempo de desenho por quadro (ms, só JS + rasterização do canvas; sem screenshot), ignorando o 1º quadro (cache).
 *   node art/tools/bench.js teste a_vila b_toca ...   [--n 20] */
const path = require("path"), { chromium } = require("playwright");
const args = process.argv.slice(2), N = +(args.includes("--n") ? args[args.indexOf("--n") + 1] : 20);
const boards = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--n");
(async () => {
  const b = await chromium.launch({ args: ["--disable-gpu", "--font-render-hinting=none", "--allow-file-access-from-files"] });
  for (const name of boards) {
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
    p.on("pageerror", e => console.error(name, String(e)));
    await p.goto("file://" + path.resolve(__dirname, "../preview/index.html") + "?board=" + name);
    await p.waitForFunction(() => window.__READY__ || window.__ERR__, null, { timeout: 120000 });
    const r = await p.evaluate(async (N) => {
      const dur = (window.__BOARD__.dur || 3), ts = [];
      const c = document.getElementById("c"), g = c.getContext("2d");
      renderFrame(0.05, 1); g.getImageData(0, 0, 1, 1);
      for (let i = 0; i < N; i++) { const t = (i + 1) / (N + 1) * dur, t0 = performance.now(); renderFrame(t, i + 2); g.getImageData(0, 0, 1, 1); ts.push(performance.now() - t0); }
      ts.sort((a, b) => a - b); return { med: ts[ts.length >> 1], max: ts[ts.length - 1] };
    }, N);
    console.log(`${name.padEnd(16)} mediana ${r.med.toFixed(0).padStart(4)} ms   máx ${r.max.toFixed(0).padStart(4)} ms`);
    await p.close();
  }
  await b.close();
})();
