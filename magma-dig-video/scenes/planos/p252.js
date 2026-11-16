/* p252 · C5 Mercado · "Noite quatro. Mercado."
 * Começa com o cartão fixo no topo (SALDO 20 / 1.000 · DIA 4 DE 30 · NOITE 4). No whoosh o painel do Mercado sobe
 * da base (cartão do Cobre com o preço de ontem, 20, e o botão VENDER sem valor). No "Mercado" o cartão fixo sobe e
 * sai, e o título MERCADO com a faixa EM ALTA HOJE (ainda apagada e vazia) entram. Câmera contínua até o p255. */
MD.plano("p252", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, GB = window.GB, { clamp } = G;
    const tau = G.N4.T0.p252 + t;
    const tWh = G.mark(ctx, "whoosh", 0), tNoite = G.wt(ctx, "noite", 0.04), tMer = G.wt(ctx, "mercado", 1.39);
    const sobe = ART.ease.outCubic(clamp((t - tWh) / 0.42));
    const sai = ART.ease.inCubic(clamp((t - tMer + 0.05) / 0.25)), entra = ART.ease.outBack(clamp((t - tMer + 0.02) / 0.3));
    G.fundoN4(g, tau);
    const cam = G.camN4(tau);
    G.painel(g, cam, gg => {
      // corpo do painel sobe de baixo
      gg.save(); gg.translate(0, (1 - sobe) * 1000); gg.globalAlpha = clamp(sobe * 1.5);
      // parte de baixo (cartão do Cobre + botão)
      gg.save(); gg.beginPath(); gg.rect(0, 480, 1080, 1440); gg.clip();
      G.mercadoN4(gg, t, { rola: 0, faixa: { minerio: null, k: 0 } }); gg.restore();
      gg.restore();
      // título + faixa só no "Mercado" (antes, o lugar é do cartão fixo)
      if (entra > 0) {
        gg.save(); gg.globalAlpha = clamp(entra * 2);
        gg.translate(540, 356); gg.scale(0.85 + 0.15 * entra, 0.85 + 0.15 * entra); gg.translate(-540, -356);
        gg.beginPath(); gg.rect(0, 0, 1080, 480); gg.clip();
        G.mercadoN4(gg, t, { rola: 0, faixa: { minerio: null, k: 0 } }); gg.restore();
      }
      if (t > tMer) { const p = GB.hit(t, tMer, 0.5); if (p > 0) ART.glow(gg, 540, 300, 380, "#FFD23F", 0.35 * p); }
    });
    // cartão fixo (tela): entra no "Noite", sai para cima no "Mercado"
    const ck = ART.ease.outBack(clamp((t - tNoite + 0.1) / 0.3));
    if (sai < 1 && ck > 0) {
      g.save(); g.globalAlpha = 1 - sai; g.translate(540, 365 - 180 * sai); g.scale(ck, ck); g.translate(-540, -365);
      GB.cartao(g, 540, 365, { saldo: 20, dia: 4, rotulo: "NOITE 4", rotuloCor: "#CFD8FF", s: 0.85 });
      g.restore();
    }
    G.fim(g, tau, ctx);
  },
});
