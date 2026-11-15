/* p28 · "Picareta velha, um bloco por vez." (C3) — gameplay real, golpes lentos num bloco de cada vez, sem zoom.
 * Cronômetro desenhado (Dia 1) caindo de 10,0 — cobre o 13,2 original. CRAC! em cada golpe do som. */
MD.plano("p28", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(2.6, 4.6); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.82, H = GA.ms(ctx, "picareta");
    const v = ART.gameplay.visor(g, t, { de: 2.6, ate: 2.6 + D, dur: D, recorte: ART.gameplay.RECORTES.minaLarga, y: 830, largura: 1040, zoom: [1, 1], retrato: 0, cronometro: { valor: 10 - t * 0.98 } });
    const p = v.map(640, 300);
    H.forEach((h, i) => ART.ui.crac(g, p[0] + (i ? 70 : -40), p[1] - 30, t, h, { s: 0.95, rot: i ? 6 : -6 }));
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.3 });
  },
});
