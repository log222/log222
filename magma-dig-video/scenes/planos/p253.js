/* p253 · C5 Mercado · "Em alta hoje: cobre."
 * Mesmo painel do p252 (câmera contínua). No "alta" a faixa EM ALTA HOJE acende em dourado (acorde claro);
 * no "cobre" a vaga vira COBRE +50% com o ícone do cobre e faíscas, e um brilho varre a faixa.
 * O cartão do Cobre ainda mostra o preço NORMAL 40; o de hoje (60 = 40 + 50%) entra no p254. */
MD.plano("p253", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, { clamp } = G;
    const tau = G.N4.T0.p253 + t;
    const tAlta = G.wt(ctx, "alta", 0.36), tCo = G.wt(ctx, "cobre", 1.56);
    const k = ART.ease.outCubic(clamp((t - tAlta + 0.05) / 0.35));
    const mk = clamp((t - tCo + 0.02) / 0.3);
    const brilho = t < tCo ? null : clamp((t - tCo) / 0.8);
    const pA = G.hit(t, tAlta, 0.8), pC = G.hit(t, tCo, 0.7);
    G.fundoN4(g, tau, k);
    const cam = G.camN4(tau);
    G.painel(g, cam, gg => {
      if (k > 0) ART.glow(gg, 540, 412, 560, "#FFC531", 0.2 * k + 0.35 * pA);
      G.mercadoN4(gg, t, { rola: 0, faixa: { minerio: mk > 0 ? "cobre" : null, nome: "Cobre", k, mk, brilho } });
      if (pC > 0) ART.glow(gg, 660, 412, 260, "#FFB27A", 0.7 * pC);
      G.faiscas(gg, t, tCo, 600, 412, "#FFE7A0", 253, 18);
    });
    G.fim(g, tau, ctx);
  },
});
