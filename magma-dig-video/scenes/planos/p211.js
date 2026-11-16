/* p211 · "Metade." (C7) — pausa intencional (trilha corta seco).
 * Pepita no holofote girando devagar; na palavra uma linha de sombra atravessa a pepita ao meio e a metade de baixo
 * escurece. O giro e o empurrão continuam até o último quadro. */
MD.plano("p211", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, D = ctx.dur || 1.37;
    const tM = GD.wt(ctx, "Metade", 0.04);
    const corte = ART.prog(t, tM + 0.02, tM + 0.3, "outCubic");
    const esc = ART.prog(t, tM + 0.15, tM + 0.55, "inOutSine");
    const z = ART.map(t, 0, D, 1.02, 1.1, "linear");
    ART.holofote(g, t, { chao: 1250, cor: "#FFD2A0", k: 0.75 - 0.15 * esc });
    g.save(); GC.cam(g, z, 540, 800);
    g.save(); g.translate(540, 1250); g.scale(1, 0.15); ART.glow(g, 0, 0, 300, "#000000", 0.6, "source-over"); g.restore();
    GD.pepita(g, t, { x: 540, y: 760, r: 200, k: 0.9 - 0.3 * esc, giro: 0.4 + t * 0.55, corte, escuro: esc, ang: -0.1 });
    g.restore();
    GC.post(g, ctx, { vinheta: 0.75, legendaK: 0.4 });
  },
});
