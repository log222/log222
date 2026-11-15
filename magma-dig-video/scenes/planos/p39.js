/* p39 · "Crac. Uma. Crac. Duas." (C3) — Dia 2: dois golpes rápidos (cortes no ritmo); contador 1 → 2;
 * cronômetro do dia 2 (11 s) com a barra fantasma de ontem. */
MD.plano("p39", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(0.3, 3.2); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.15, H = GA.ms(ctx, "picareta"); if (H.length < 2) H.push(0.04, 0.41);
    const tU = GA.w(ctx, "uma", 0, 0.33), tD = GA.w(ctx, "duas", 0, 0.84), B = t >= H[1] - 0.02;
    const v = ART.gameplay.visor(g, t, B ? { de: 2.2, ate: 2.2 + D, dur: D, recorte: ART.gameplay.RECORTES.minaAlta, y: 800, largura: 1010, zoom: [1.15, 1.2], foco: [680, 330], retrato: 0, cronometro: { valor: 9.8 - t, escala: 11, fantasma: 10 } }
                                      : { de: 0.3, ate: 0.3 + D, dur: D, recorte: ART.gameplay.RECORTES.minaLarga, y: 830, largura: 1040, zoom: [1, 1.05], retrato: 0, cronometro: { valor: 9.8 - t, escala: 11, fantasma: 10 } });
    const p = v.map(640, 320);
    H.forEach((h, i) => ART.ui.crac(g, p[0] + (i ? 40 : -40), p[1] - 40, t, h, { s: 1.05, rot: i ? 6 : -6, dur: 0.5 }));
    const n = (t >= tU ? 1 : 0) + (t >= tD ? 1 : 0);
    GA.hud(g, t, { moedas: n, icone2: "pedra", pulso: GA.pulsos(t, [tU, tD]) });
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.3 });
  },
});
