/* p220 · "Segurar apostando na alta tem nome." (C6)
 * Em linhas ciano: uma pata segurando uma moeda se desenha ao longo da fala; em "alta" nasce a seta ciano para cima
 * (AMANHÃ?). Empurrão lento contínuo (o p221 continua daqui). */
MD.plano("p220", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, D = ctx.dur || 2.9;
    const tA = GD.wt(ctx, "alta", 1.32);
    const pata = ART.prog(t, 0.0, tA, "outSine");   // começa a se desenhar já no 1º quadro
    const sai = 1 - ART.prog(t, 0.05, 0.7, "inOutSine");
    const seta = ART.prog(t, tA, tA + 0.55, "outCubic");
    const z = ART.map(t, 0, D, 1.0, GD.ESP.Z220, "linear");
    ART.blueprint(g, t);
    // a linha do p219 continua no lugar (fim do deslize, dx -40) e some enquanto a pata aparece
    GD.linha219(g, t, 1, -40 - 20 * (1 - sai), sai);
    GD.eixo219(g, 1, -40 - 20 * (1 - sai), sai);
    g.save(); GC.cam(g, z, 540, 900, 0, GD.ESP.DY);
    ART.ciencia.especulacao(g, t, { fundo: false, pata, seta });
    g.restore();
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
