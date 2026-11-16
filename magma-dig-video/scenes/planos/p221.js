/* p221 · "Especulação." (C6)
 * O carimbo ESPECULAÇÃO desce e bate sobre o desenho no baque; a seta pulsa. Empurrão leve continua. */
MD.plano("p221", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, D = ctx.dur || 1.16;
    const tB = GD.mark(ctx, "boom", GD.wt(ctx, "Especulacao", 0.04) + 0.05);
    // carimbo: desce até tB (k 0 -> 0,3 = impacto), depois tremor e fica
    const ck = t < tB ? 0.3 * ART.prog(t, 0, tB, "inQuad") : 0.3 + 0.7 * ART.prog(t, tB, D);
    const z = ART.map(t, 0, D, GD.ESP.Z220, GD.ESP.Z221, "linear");
    const sh = GC.shake(t, tB, 0.2, 8, 21);
    ART.blueprint(g, t);
    g.save(); GC.cam(g, z, 540, 900, sh.x, GD.ESP.DY + sh.y);
    ART.ciencia.especulacao(g, t, { fundo: false, pata: 1, seta: 1, setaPulso: ART.prog(t, 0, 0.25), carimbo: ck });
    g.restore();
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
