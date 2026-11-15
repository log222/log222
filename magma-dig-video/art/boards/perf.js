/* micro-benchmark das peças (usado por tools/bench.js --pecas) */
ART.boards.perf = { dur: 1, render() {} };
window.__PECAS__ = () => {
  const c = document.getElementById("c"), g = c.getContext("2d"); const out = {};
  const cena = ART.cenas.mina({}); const cam = { zoom: 1.05 };
  const T = (nome, fn, n = 8) => { fn(0); g.getImageData(0, 0, 1, 1); const t0 = performance.now(); for (let i = 0; i < n; i++) fn(i * 0.1); g.getImageData(0, 0, 1, 1); out[nome] = +((performance.now() - t0) / n).toFixed(1); };
  T("fundo_mina(camadas)", t => { for (const L of cena.fundo) ART.withLayer(g, cam, L.d, gg => L.draw(gg, t)); });
  T("frente_mina", t => { for (const L of cena.frente) ART.withLayer(g, cam, L.d, gg => L.draw(gg, t)); });
  T("luz_mina", t => cena.luz(g, t, cam));
  T("beam", t => ART.beam(g, 200, -150, 70, 1750, 240, 700, "#FFE3B0", 0.5));
  T("dust70", t => ART.dust(g, t, { count: 70 }));
  T("glow", t => ART.glow(g, 500, 500, 300, "#FFB548", 0.5));
  T("vignette", t => ART.vignette(g, 0.6));
  T("faixa", t => ART.faixaLegenda(g));
  T("grain", t => ART.grain(g, 3, 0.07));
  T("zeca", t => ART.zeca.draw(g, ART.zeca.pose("cavando", t, { x: 372, y: 1182, s: 1.62, turn: 0.82, lamp: 1, cone: 0.4 })));
  T("cubo", t => ART.cubo(g, 0.15, 2.9, { crack: 2, seed: 4 }));
  T("estouro", t => ART.estouro(g, 0.3 + t, { t0: 0, front: [[587, 932], [897, 932], [897, 1243], [587, 1243]], seed: 8 }));
  T("cronometro", t => ART.ui.cronometro(g, 790, 340, { valor: 7, icone: "sol" }));
  T("crac", t => ART.ui.crac(g, 650, 900, 0.2, 0));
  T("cartaoMeta(vidro)", t => ART.ui.cartaoMeta(g, 540, 400, {}));
  T("clear", t => g.clearRect(0, 0, 1080, 1920));
  return out;
};
