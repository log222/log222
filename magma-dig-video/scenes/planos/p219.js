/* p219 · "E do nosso também." (C6) — troca de mundo.
 * A Toca (Zeca sentado no chão com a pepita, como no p218) dissolve em linhas ciano sobre azul-petróleo; uma linha
 * de preço ciano começa a se desenhar da esquerda e a câmera desliza para a direita. Sem números ainda. */
MD.plano("p219", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, BP = ART.BP, D = ctx.dur || 1.63;
    const tN = GD.wt(ctx, "nosso", 0.36);
    const a = ART.prog(t, 0.08, Math.min(0.6, tN + 0.15), "inOutSine");   // dissolve curto
    if (a < 1) GD.toca(g, t, ctx, { push: [1.08, 1.12] });
    if (a > 0) {
      g.save(); g.globalAlpha = a; ART.blueprint(g, t); g.restore();
      const dx = ART.map(t, 0, D, 40, -40, "linear");                       // câmera desliza para a direita
      GD.linha219(g, t, ART.prog(t, 0.25, D, "inOutSine"), dx, a);
      GD.eixo219(g, ART.prog(t, 0.15, 0.9), dx, a);
    }
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
