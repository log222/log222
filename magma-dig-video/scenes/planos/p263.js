/* p263 · C5 Clientes · "E amizade rende bônus nas vendas."
 * Continua o p262 (mesmo cartão, câmera sem salto; amizade 1, ela sorrindo). No "amizade" o coração pulsa;
 * no "bônus" aparece, abaixo do nome, a linha verde "+ bônus no preço de venda" (sem número, como no jogo),
 * com um brilho verde que corre até o "vendas". Câmera parada com deriva lateral. */
MD.plano("p263", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, { clamp } = G, D = ctx.dur;
    const tAm = G.wt(ctx, "amizade", 0.28), tB = G.wt(ctx, "bonus", 1.4), tV = G.wt(ctx, "vendas", 2.04);
    const k = ART.ease.inOutSine(clamp(t / D));
    const bonus = ART.prog(t, tB - 0.05, tB + 0.3), brilho = Math.sin(Math.PI * clamp((t - tB) / (tV + 0.6 - tB))) + 0.6 * G.hit(t, tV, 0.6);
    const pAm = G.hit(t, tAm, 0.6);
    const tt = t + 2.95;
    G.fundo(g, tt, { dx: ART.map(t, 0, D, 0, -12), z: 1.1, escuro: 0.36 });
    const cam = G.cam(ART.lerp(1.08, 1.1, k), 540 + 5 * Math.sin(t * 1.3) - 5 * Math.sin(0), ART.lerp(680, 700, k), 540, 760);
    G.painel(g, cam, gg => {
      const c = G.cliente(gg, tt, { amizade: 1, amizadePulso: pAm, sorriso: 1, bonus, brilhoBonus: clamp(brilho), olhar: [0.25 * Math.sin(tt * 0.8), 0.1] });
      ART.glow(gg, c.retrato[0], c.retrato[1], 200, "#FFE0A0", 0.125);
      if (pAm > 0) ART.glow(gg, c.amizade[0], c.amizade[1], 160, "#FF5A8A", 0.5 * pAm);
    });
    G.fim(g, tt, ctx);
  },
});
