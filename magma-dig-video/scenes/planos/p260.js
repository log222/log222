/* p260 · C5 Clientes · "Paga cento e sessenta."
 * Mesmo cartão e câmera do fim do p259. A recompensa entra no "cento": +160 moedas acende com brilho dourado e
 * moedinhas (plim). A câmera desce devagar do retrato até a recompensa. */
MD.plano("p260", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, u = ART.ui, { clamp } = G, D = ctx.dur;
    const tCento = G.wt(ctx, "cento", 0.52);
    const k = ART.ease.inOutSine(clamp(t / D));
    const rev = clamp((t - tCento + 0.02) / 0.12), rk = ART.prog(t, tCento, tCento + 0.4);
    const p = G.hit(t, tCento, 0.6);
    G.fundo(g, t + 2.9, { dx: ART.map(t, 0, D, 0, -10), z: 1.1, escuro: 0.36 });
    const cam = G.cam(ART.lerp(1.06, 1.09, k), 540, ART.lerp(690, 740, k), 540, 760);
    G.painel(g, cam, gg => {
      const c = G.cliente(gg, t + 2.9, { olhar: [0.2 * Math.sin((t + 2.9) * 0.9), 0.1], escondeRecompensa: 1 - rev, recompensaK: t > tCento ? rk : undefined });
      const [rx, ry] = c.recompensa;
      if (p > 0) ART.glow(gg, rx, ry, 280, "#FFD23F", 0.6 * p);
      if (t > tCento) for (const q of ART.burst(t, { t0: tCento, count: 10, x: rx, y: ry, speed: [250, 550], angle: [-160, -20], gravity: 1400, life: [0.4, 0.7], seed: 260 })) u.moeda(gg, q.x, q.y, 12, q.rot * 0.05 + q.i, {});
    });
    G.fim(g, t + 2.9, ctx);
  },
});
