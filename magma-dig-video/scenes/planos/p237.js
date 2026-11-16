/* p237 · C5 Mercado · "Hoje, era o ferro."
 * Continua o p236 (mesma faixa, câmera sem salto). No plim do começo um brilho corre a faixa; no "ferro" a vaga
 * vira FERRO +50% (ícone do ferro estoura com faíscas). A câmera desce da faixa até as linhas: Ferro ×0 acende,
 * Cobre ×1 (vale 20) fica apagada embaixo. */
MD.plano("p237", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, { clamp } = G, D = ctx.dur, L = G.ALTA;
    const tPlim = G.mark(ctx, "moeda", 0.25), tFe = G.wt(ctx, "ferro", 1.32);
    const brilho = t < tPlim - 0.05 ? null : clamp((t - tPlim + 0.05) / 0.6);
    const mk = clamp((t - tFe + 0.02) / 0.3);
    const pF = G.hit(t, tFe, 0.6);
    const k = ART.ease.inOutSine(clamp(t / D));
    const aFe = 0.3 + 0.7 * ART.prog(t, tFe - 0.1, tFe + 0.35);
    G.fundo(g, t + 2.82, { dx: ART.map(t, 0, D, 0, -12), z: 1.1, escuro: 0.32 });
    const cam = G.camMix(G.cam(1.2, 540, L.faixa, 540, 540), G.cam(1.22, 540, 620, 540, 690), k);
    G.painel(g, cam, gg => {
      G.mercadoAlta(gg, t, { faixa: { minerio: mk > 0 ? "ferro" : null, nome: "Ferro", k: 1, mk, brilho },
        ferro: { a: aFe, pulso: 0.7 * pF }, cobre: { a: 0.3 + 0.15 * ART.prog(t, tFe, tFe + 0.4) } });
      if (pF > 0) { ART.glow(gg, 640, L.faixa, 260, "#FFE58A", 0.7 * pF); }
      G.faiscas(gg, t, tFe, 600, L.faixa, "#FFE7A0", 237, 16);
    });
    G.fim(g, t + 2.82, ctx);
  },
});
