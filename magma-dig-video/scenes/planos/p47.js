/* p47 · "Cobre." (C7) — a recompensa da Parte 1.
 * Num feixe de luz laranja, a pata do Zeca ergue a pepita de cobre, que gira e cintila; no acorde de recompensa a
 * etiqueta COBRE estoura acima dela. Plano segura ~1 s (a pausa intencional do vídeo). Empurrão lento. */
MD.plano("p47", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 1.13;
    const tA = GC.mark(ctx, "acorde", 0.05);
    const sobe = ART.prog(t, 0, 0.45, "outCubic");
    const z = ART.map(t, 0, D, 1.0, 1.08, "inOutSine");
    ART.holofote(g, t, { cor: "#FFB070", chao: 1270, k: 0.5 });
    g.save(); GC.cam(g, z, 540, 820);
    ART.ui.feixe(g, 540, 1270, t, { cor: "#FF9A3C", w: 110, k: 0.35 + 0.65 * ART.prog(t, tA - 0.05, tA + 0.15) });
    const py = ART.lerp(960, 820, sobe);
    // pata vem de baixo e segura a pepita na ponta dos dedos
    ART.pata(g, 565, py + 185, 80, { s: 1.15, dedos: "segura" });
    ART.obj.pepitaCobre(g, t + 0.6, { x: 540, y: py, r: 185, k: 0.7 + 0.5 * ART.pulse(t, tA, 0.5) });
    // brilhos estourando no acorde
    const ps = ART.burst(t, { t0: tA, count: 22, x: 540, y: py, speed: [250, 700], angle: [-180, 0], gravity: 300, life: [0.4, 0.9], seed: 47, drag: 2 });
    g.save(); g.globalCompositeOperation = "lighter"; for (const q of ps) { g.globalAlpha = q.alpha; ART.circ(g, q.x, q.y, 3 + q.r * 4); g.fillStyle = "#FFD9A8"; g.fill(); } g.restore();
    g.restore();
    const ek = Math.max(0, ART.prog(t, tA, tA + 0.22, "outBack"));
    if (ek > 0) { g.save(); g.translate(540, 470); g.scale(ek * 2.2, ek * 2.2); ART.ui.etiqueta(g, 0, 0, { texto: "COBRE", cor: "#FF9A3C" }); g.restore(); }
    GC.post(g, ctx, { vinheta: 0.7, legendaK: 0.4 });
  },
});
