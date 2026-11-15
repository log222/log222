/* p39 · "Crac. Uma. Crac. Duas." (C3) — Dia 2: dois golpes com corte entre eles (aberto → fechado);
 * contador de moedas 1 → 2 nas palavras; cronômetro do dia de 11 s: 11,0 → 9,0, com a barra fantasma de ontem. */
MD.plano("p39", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(0.3, 3.6); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.15, H = GA.ms(ctx, "picareta"); if (H.length < 2) H.push(...[D * 0.05, D * 0.4].slice(H.length));
    const tU = GA.w(ctx, "uma", 0, D * 0.3), tD = GA.w(ctx, "duas", 0, D * 0.75), B = t >= H[1] - 0.02;
    const cron = { valor: GA.cron(t, D, 11.0, 9.0), escala: 11, fantasma: 10 };
    const v = B ? ART.gameplay.cheio(g, t, { de: 2.2, ate: 2.2 + D, dur: D, foco: [690, 330], zoom: [1.45, 1.5], cronometro: cron })
                : ART.gameplay.cheio(g, t, { de: 0.3, ate: 0.3 + D, dur: D, foco: [560, 360], zoom: [1, 1.04], cronometro: cron });
    const p = v.map(640, 320);
    H.forEach((h, i) => ART.ui.crac(g, p[0] + (i ? 40 : -40), p[1] - 40, t, h, { s: 1.05, rot: i ? 6 : -6, dur: 0.5 }));
    GA.hud(g, t, { y: 370, moedas: (t >= tU ? 1 : 0) + (t >= tD ? 1 : 0), pulso: GA.pulsos(t, [tU, tD]) });
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.32 });
  },
});
