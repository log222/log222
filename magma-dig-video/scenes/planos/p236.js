/* p236 · C5 Mercado · "Todo dia, um minério fica em alta."
 * Painel do Mercado no layout novo (título, faixa, linhas). No "ding" do começo acende no topo a faixa dourada
 * EM ALTA HOJE, ainda vazia (vaga tracejada com "?"); um brilho percorre a faixa no "minério … alta" e a vaga pulsa
 * no "alta". As linhas Ferro / Cobre já estão lá, apagadas (acendem no p237). Empurrão lento na faixa. */
MD.plano("p236", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, { clamp } = G, D = ctx.dur, L = G.ALTA;
    const tDing = G.mark(ctx, "ding", 0), tMin = G.wt(ctx, "minerio", 1.08), tAlta = G.wt(ctx, "alta", 2.12);
    const acende = ART.ease.outCubic(clamp((t - tDing) / 0.35));
    const brilho = t < tMin - 0.2 ? null : clamp((t - tMin + 0.2) / (tAlta + 0.35 - tMin));
    const pA = G.hit(t, tAlta, 0.7);
    const k = ART.ease.inOutSine(clamp(t / D));
    G.fundo(g, t, { dx: ART.map(t, 0, D, 20, 0), z: 1.1, escuro: 0.32 });
    const cam = G.cam(ART.lerp(1.14, 1.2, k), 540, L.faixa, 540, ART.lerp(520, 540, k));
    G.painel(g, cam, gg => {
      G.mercadoAlta(gg, t, { faixa: { minerio: null, k: acende, brilho }, ferro: { a: 0.3 }, cobre: { a: 0.3 } });
      if (acende > 0) ART.glow(gg, 540, L.faixa, 520, "#FFC531", 0.25 * G.hit(t, tDing, 0.8) + 0.35 * pA);
      if (pA > 0) ART.glow(gg, 783, L.faixa, 170, "#FFF2A6", 0.6 * pA);
    });
    G.fim(g, t, ctx);
  },
});
