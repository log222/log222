/* p220 · "Segurar apostando na alta tem nome." (C6)
 * Em linhas ciano: uma pata segurando uma moeda se desenha ao longo da fala; em "alta" nasce a seta ciano para cima
 * (AMANHÃ?). Empurrão lento contínuo (o p221 continua daqui). */
MD.plano("p220", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, D = ctx.dur || 2.9;
    const tA = GD.wt(ctx, "alta", 1.32);
    const pata = ART.prog(t, 0.0, tA, "inOutSine");
    const seta = ART.prog(t, tA, tA + 0.55, "outCubic");
    const z = ART.map(t, 0, D, 1.0, GD.ESP.Z220, "linear");
    ART.blueprint(g, t);
    g.save(); GC.cam(g, z, 540, 900, 0, GD.ESP.DY);
    ART.ciencia.especulacao(g, t, { fundo: false, pata, seta });
    g.restore();
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
