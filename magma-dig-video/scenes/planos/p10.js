/* p10 · "Trinta dias de luz cabem em cinco minutos." (C7)
 * Close frontal de um calendário de 30 quadradinhos que se preenchem de sol em sequência no tique-taque (de "Trinta"
 * até "luz"); em "cabem" ele se transforma no relógio 5:00; em "cinco" o número trava e no plim a pata do Zeca dá um
 * toque no relógio. */
MD.plano("p10", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 2.61;
    const tCab = GC.wt(ctx, "cabem", 1.0), tCinco = GC.wt(ctx, "cinco", 1.6), tPlim = GC.mark(ctx, "moeda", 2.29);
    const n = 30 * ART.prog(t, 0.04, tCab - 0.05, "inOutSine");
    const rel = ART.prog(t, tCab, tCinco, "inOutCubic");
    const z = ART.map(t, 0, D, 0.92, 1.04, "inOutSine") * (1 + 0.03 * ART.pulse(t, tPlim, 0.3));
    ART.holofote(g, t, { chao: 1260, k: 0.8 });
    g.save(); GC.cam(g, z, 540, 820, 0, 0, ART.deg(ART.map(t, 0, D, -2, 1)));
    ART.obj.calendario(g, t, { x: 540, y: 820, preenchido: n, relogio: rel });
    if (rel >= 1) ART.glow(g, 540, 820, 520, "#FFD23F", 0.35 * ART.pulse(t, tPlim - 0.05, 0.5));
    g.restore();
    // pata do Zeca entra pela direita e toca o relógio no plim
    const pe = ART.kf(t, [[tPlim - 0.45, 0], [tPlim - 0.05, 1, "outCubic"], [tPlim, 0.94], [D, 1]]);
    if (pe > 0) ART.pata(g, ART.lerp(1300, 850, pe), ART.lerp(1350, 1110, pe), 38, { s: 0.85, dedos: "aponta" });
    GC.post(g, ctx, { vinheta: 0.6, legendaK: 0.4 });
  },
});
