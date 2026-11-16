/* p201 · GANCHO · "E se esperar" (C7) — repete o p01.
 * Breu total; clique: a lanterna do capacete do Zeca acende de frente, pisca e firma; poeira no feixe.
 * Push-in rápido até a lâmpada; no fim um clarão curto emenda no calendário (p202). O p267 fecha com o mesmo quadro. */
MD.plano("p201", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, D = ctx.dur || 0.99;
    const tc = GD.mark(ctx, "clique", 0.02);
    // começa no breu: o clique acende, pisca uma vez e firma
    const on = t < tc ? 0 : ART.kf(t - tc, [[0, 0], [0.04, 1, "outExpo"], [0.09, 0.4], [0.14, 1, "outCubic"], [0.19, 0.85], [0.25, 1]]);
    const tE = GD.wt(ctx, "esperar", D * 0.6);
    const z = ART.kf(t, [[0, 1.0], [0.25, 1.06, "outCubic"], [D - 0.18, 1.2, "inOutSine"], [D, 1.32, "inCubic"]]);
    const sh = GC.shake(t, tc, 0.18, 7, 3);
    const lp = GD.lanterna(g, t, ctx, { on, z, shx: sh.x, shy: sh.y, headTilt: -2 + 2 * ART.prog(t, tE, D) });
    const wo = ART.prog(t, D - 0.14, D, "inCubic");
    if (wo > 0) { g.save(); g.globalCompositeOperation = "lighter"; ART.glow(g, lp.x, lp.y, 1500 * wo, "#FFF4D6", 0.75 * wo); g.restore(); }
    GC.post(g, ctx, { vinheta: 0.7, legendaK: 0.35 });
  },
});
