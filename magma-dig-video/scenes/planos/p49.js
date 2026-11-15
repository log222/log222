/* p49 · "Noite dois. Mercado." (C3) — a tela do Mercado do jogo aparece por um instante (valor do VENDER TUDO borrado),
 * push-in rápido; em MERCADO dissolve para o painel redesenhado do kit (C5). */
MD.plano("p49", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(13.6, 15.2); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.41, tM = GA.w(ctx, "mercado", 0, 0.89);
    ART.gameplay.visor(g, t, { de: 13.6, ate: 13.6 + D, dur: D, recorte: ART.gameplay.RECORTES.mercado, y: 820, largura: 1010, zoom: [1.0, 1.25], foco: [430, 300], retrato: 0, rotulo: "NOITE · MERCADO", aba: false, lanterna: 0.3,
      tapar: [[100, 470, 760, 60], [720, 140, 180, 330]] });
    const k = ART.prog(t, tM - 0.1, Math.min(D, tM + 0.35), "inOutSine");
    if (k > 0) { g.save(); g.globalAlpha = k; ART.palco(g, t, { zoom: 1 }, ART.cenas.tocaDesfocada(), null, { frame: ctx.frame, legenda: false }); ART.painelMercado(g, t, { seta: 0, prog: ART.prog(t, tM, tM + 0.5) }); g.restore(); }
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.3 });
  },
});
