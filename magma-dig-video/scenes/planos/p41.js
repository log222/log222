/* p41 · "Um segundo. Sete." (C3) — gameplay real com golpes em sequência; zoom no cronômetro desenhado:
 * 1,0 em vermelho caindo; contador 7 na palavra SETE. */
MD.plano("p41", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(3.0, 4.4); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.23, tS = GA.w(ctx, "sete", 0, 0.76);
    const z = ART.prog(t, 0, 0.5, "inOutCubic");
    g.save(); g.translate(540, 900); g.scale(1 + 0.25 * z, 1 + 0.25 * z); g.translate(-540 - 140 * z, -900 + 160 * z);
    ART.gameplay.visor(g, t, { de: 3.0, ate: 3.0 + D, dur: D, recorte: ART.gameplay.RECORTES.minaAlta, y: 800, largura: 1010, zoom: [1.05, 1.1], retrato: 0, cronometro: { valor: Math.max(0.01, 1.0 - t * 0.7), escala: 11, fantasma: 10 } });
    g.restore();
    GA.hud(g, t, { moedas: t >= tS ? 7 : 6, icone2: "pedra", pulso: ART.pulse(t, tS, 0.3) });
    ART.post(g, ctx.frame, { vinheta: 0.55, legendaK: 0.3 });
  },
});
