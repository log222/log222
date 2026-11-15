/* p28 · "Picareta velha, um bloco por vez." (C3) — tela cheia, enquadramento mais aberto e parado; golpes lentos.
 * Cronômetro (Dia 1) 10,0 → 8,6. CRAC! em cada golpe do som. */
MD.plano("p28", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(2.6, 4.8); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.82, H = GA.ms(ctx, "picareta");
    const v = ART.gameplay.cheio(g, t, { de: 2.6, ate: 2.6 + D, dur: D, foco: [760, 360], zoom: [1, 1.02], cronometro: { valor: GA.cron(t, D, 10.0, 8.6) }, tom: "rgba(40,30,70,.12)" });
    const p = v.map(640, 300);
    H.forEach((h, i) => ART.ui.crac(g, p[0] + (i ? 90 : -20), p[1] - 30, t, h, { s: 1.0, rot: i ? 6 : -6 }));
    ART.post(g, ctx.frame, { vinheta: 0.5, legendaK: 0.32 });
  },
});
