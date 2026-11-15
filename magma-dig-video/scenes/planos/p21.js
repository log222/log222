/* p21 · "tem doze quilômetros." (C6)
 * Plano aberto do corte inteiro (corta do close da broca): o furo parou; a régua desce ao lado marcando 0–12 KM e
 * o "12 KM" amarelo entra no plim (palavra "doze"). Leve empurrão. */
MD.plano("p21", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 1.44;
    const tDoze = Math.min(GC.wt(ctx, "doze", 0.26), GC.mark(ctx, "moeda", 0.25));
    const regua = ART.prog(t, 0, tDoze + 0.05, "outCubic");
    const z = ART.map(t, 0, D, 1.0, 1.06, "outSine");
    ART.blueprint(g, t);
    g.save(); GC.foco(g, z, 560, 860, 540, 800);
    GC.semFundo(() => ART.ciencia.crosta(g, t, { furo: 1, regua, t12: tDoze, y0: 470, y1: 1230 }));
    // flash na ponta quando o número entra
    ART.glow(g, 600, 1240, 220, ART.BP.amarelo, 0.8 * ART.pulse(t, tDoze - 0.02, 0.4));
    g.restore();
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.3 });
  },
});
