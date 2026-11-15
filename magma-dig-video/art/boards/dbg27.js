ART.boards.dbg27 = { dur: 2, async setup() {
  window.MD = window.MD || {}; MD.plano = (id, o) => { window.__P = o; };
  MD.loadScript = src => new Promise(r => { const s = document.createElement("script"); s.src = src; s.onload = r; document.head.appendChild(s); });
  await MD.loadScript("../../scenes/planos/_grupoA.js"); await MD.loadScript("../../scenes/planos/" + (window.__PL || "p27") + ".js");
}, render(g, t, f) { window.__P.render(g, t, { dur: 2.4, words: [{ w: "acendeu", ini: 0.9, fim: 1.3 }], marks: { clique: [0.02] }, frame: f }); } };
