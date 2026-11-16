/* p222 · "Foi a aposta do Zeca." (C6)
 * O carimbo some; a pata em linhas vira a silhueta do Zeca segurando a pepita, com a seta de amanhã sobre ele
 * (completa em "Zeca"). Deriva lateral lenta até o último quadro. */
MD.plano("p222", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, D = ctx.dur || 2.02;
    const tZ = GD.wt(ctx, "Zeca", 1.2);
    const zeca = ART.prog(t, 0.12, Math.max(0.6, tZ + 0.1), "inOutSine");
    const dx = ART.map(t, 0, D, 0, -34, "inOutSine");
    ART.blueprint(g, t);
    g.save(); GC.cam(g, GD.ESP.Z221, 540, 900, dx, GD.ESP.DY);
    ART.ciencia.especulacao(g, t, { fundo: false, pata: 1, seta: 1, setaPulso: 1 - ART.prog(t, 0, 0.35), carimbo: 1 - ART.prog(t, 0, 0.3), zeca });
    // a pepita brilha quando o Zeca fica pronto
    const b = GD.hit(t, tZ + 0.05, 0.8);
    if (b > 0.02) ART.glow(g, 440, 878, 220, ART.BP.amarelo, 0.45 * b);
    g.restore();
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
