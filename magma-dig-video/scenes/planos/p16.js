/* p16 · "O preço pra subir de rank" (C3) — recorte do screenshot do Mercado só no botão SUBIR DE RANK
 * (esconde o 10,4BI e o rank E); push-in; clique no som; anel de destaque em RANK. */
MD.plano("p16", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(0.5, 0.6); await ART.gameplay.preloadShot("shot_4"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.49, tc = GA.m(ctx, "clique", 0, 0.02), tR = GA.w(ctx, "rank", 0, 1.13);
    const press = ART.pulse(t, tR - 0.05, 0.25);
    const v = ART.gameplay.visor(g, t, { img: "shot_4", recorte: ART.gameplay.RECORTES.botaoRank, dur: D, y: 820, largura: 1000, zoom: [1.0, 1.0], retrato: 0, rotulo: "MERCADO DO JOGO", fonte: "screenshot real", aba: false, lanterna: 0.3 });
    // o botão do screenshot está cinza (desabilitado no save do trailer); o roteiro pede o amarelo: redesenhado por cima, no mesmo lugar
    ART.ui.botao(g, 540, v.y0 + v.h / 2 - 6, v.w * 0.92, v.h * 0.82, { texto: "★ SUBIR DE RANK", press });
    // pata do Zeca entrando para apertar o botão
    const k = ART.prog(t, 0.2, tR - 0.05, "outCubic");
    ART.pata(g, ART.lerp(1250, 760, k), ART.lerp(1150, 900 + 20 * press, k), -35, { s: 0.85, dedos: "aponta" });
    if (press > 0) { g.save(); ART.rr(g, v.x0 - 8, v.y0 - 8, v.w + 16, v.h + 16, 40); g.lineWidth = 10; g.strokeStyle = `rgba(255,210,63,${press})`; g.stroke(); g.restore(); ART.glow(g, 540, v.y0 + v.h / 2, 600, "#FFD23F", 0.35 * press); }
    void tc;
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.3 });
  },
});
