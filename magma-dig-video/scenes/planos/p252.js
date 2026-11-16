/* p252 · C5 Mercado · "Noite quatro. Mercado."
 * Durante "Noite quatro." o cartão fixo do episódio fica limpo no topo (GB2.cartao: SALDO 20 / 1.000 · DIA 4 DE 30 ·
 * RESTAM 26) e o painel do Mercado sobe um pouco da base, em fade (sem passar pela faixa da legenda): cartão do Cobre
 * com o preço NORMAL 40 e o botão VENDER sem valor. No fim do "quatro." o cartão fixo desliza para cima e some inteiro;
 * só então, no "Mercado", entram o título MERCADO e a faixa EM ALTA HOJE (apagada, vazia). Câmera empurrando do primeiro
 * ao último quadro, contínua até o p255. */
MD.plano("p252", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD();
    if (!window.GB2) await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD()));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, GB2 = window.GB2, { clamp } = G;
    const tau = G.N4.T0.p252 + t;
    const tWh = G.mark(ctx, "whoosh", 0), tNoite = G.wt(ctx, "noite", 0.04), fimQ = G.wf(ctx, "quatro", 1.32), tMer = G.wt(ctx, "mercado", 1.39);
    const sobe = ART.ease.outCubic(clamp((t - tWh) / 0.45));
    const sai = ART.ease.inCubic(clamp((t - (fimQ - 0.3)) / 0.3));                 // cartão fixo sai inteiro até o fim do "quatro."
    const entra = ART.ease.outBack(clamp((t - tMer + 0.02) / 0.3));
    G.fundoN4(g, tau);
    const cam = G.camN4(tau);
    G.painel(g, cam, gg => {
      // parte de baixo (cartão do Cobre + botão): sobe 70 px em fade
      gg.save(); gg.globalAlpha = clamp(sobe * 1.4); gg.translate(0, (1 - sobe) * 70);
      gg.beginPath(); gg.rect(0, 480, 1080, 1440); gg.clip();
      G.mercadoN4(gg, t, { rola: 0, faixa: { minerio: null, k: 0 } });
      gg.restore();
      // título + faixa só no "Mercado"
      if (entra > 0) {
        gg.save(); gg.globalAlpha = clamp(entra * 2);
        gg.translate(540, 356); gg.scale(0.85 + 0.15 * entra, 0.85 + 0.15 * entra); gg.translate(-540, -356);
        gg.beginPath(); gg.rect(0, 0, 1080, 480); gg.clip();
        G.mercadoN4(gg, t, { rola: 0, faixa: { minerio: null, k: 0 } }); gg.restore();
        const p = G.hit(t, tMer, 0.5); if (p > 0) ART.glow(gg, 540, 300, 380, "#FFD23F", 0.35 * p);
      }
    });
    // cartão fixo do episódio (tela): entra no "Noite", sai deslizando para cima antes do "Mercado"
    const ck = ART.ease.outCubic(clamp((t - tNoite + 0.04) / 0.25));
    if (sai < 1 && ck > 0) GB2.cartao(g, { saldo: 20, dia: 4, rotulo: "RESTAM 26", y: 365 - (1 - ck) * 60 - sai * 330, a: clamp(ck * 2) * (1 - sai) });
    G.fim(g, tau, ctx);
  },
});
