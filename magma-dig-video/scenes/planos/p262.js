/* p262 · C5 Clientes · "Só que cliente atendido vira amigo."
 * Volta ao cartão da Dona Coruja (pedido 4/4 Cobre, +160 moedas). Empurrão no retrato. No "atendido" o pedido
 * brilha; no "amigo" (sininho) o coração enche e a amizade passa de 0 para 1 com um pulo, e ela sorri (olhos felizes). */
MD.plano("p262", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, { clamp } = G, D = ctx.dur;
    const tAt = G.wt(ctx, "atendido", 1.0), tAm = G.mark(ctx, "ding", G.wt(ctx, "amigo", 2.12));
    const k = ART.ease.inOutSine(clamp(t / D));
    const am = ART.prog(t, tAm - 0.12, tAm + 0.3, "inOutCubic"), amizade = am >= 1 ? 1 : am;
    const pulo = G.hit(t, tAm + 0.2, 0.6), sorriso = 0.3 + 0.7 * ART.prog(t, tAm, tAm + 0.3), pAt = G.hit(t, tAt, 0.8);
    G.fundo(g, t, { dx: ART.map(t, 0, D, 15, 0), z: 1.1, escuro: 0.36 });
    const cam = G.cam(ART.lerp(1.0, 1.08, k), 540, ART.lerp(720, 680, k), 540, 760);
    G.painel(g, cam, gg => {
      const c = G.cliente(gg, t, { amizade, amizadePulso: pulo, sorriso, olhar: [0.25 * Math.sin(t * 0.8), 0.1] });
      if (pAt > 0) ART.glow(gg, c.x0 + 200, c.y0 + 360, 240, "#FFD23F", 0.45 * pAt);
      if (pulo > 0) { ART.glow(gg, c.amizade[0], c.amizade[1], 200, "#FF5A8A", 0.6 * pulo); G.faiscas(gg, t, tAm + 0.15, c.amizade[0], c.amizade[1], "#FFB0C8", 262, 12); }
      if (sorriso > 0.5) ART.glow(gg, c.retrato[0], c.retrato[1], 200, "#FFE0A0", 0.25 * (sorriso - 0.5));
    });
    G.fim(g, t, ctx);
  },
});
