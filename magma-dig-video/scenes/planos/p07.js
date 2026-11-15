/* p07 · "Cada pedra que racha paga na hora." (C3) — gameplay real: o bloco racha com CRAC!; zoom no CRAC;
 * na palavra PAGA uma moeda +1 desenhada voa do bloco até o contador. */
MD.plano("p07", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(1.5, 3.6); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.99, h = GA.m(ctx, "picareta", 0, 0.05), tP = GA.w(ctx, "paga", 0, 1.01), tm = Math.min(GA.m(ctx, "moeda", 0, 0.25), tP);
    const v = ART.gameplay.visor(g, t, { de: 1.5, ate: 1.5 + D, dur: D, recorte: ART.gameplay.RECORTES.minaAlta, y: 800, largura: 1010, zoom: [1.0, 1.5], foco: [640, 320], retrato: 1,
      cronometro: { valor: 9.4 - t } });
    const p = v.map(630, 315);
    ART.ui.crac(g, p[0] + 40, p[1] - 40, t, h, { s: 1.2, rot: -6, dur: 0.9 });
    // contador + moeda voando
    const k = ART.prog(t, tP - 0.3, tP, "inCubic");
    if (k > 0 && k < 1) ART.ui.moeda(g, ART.lerp(p[0], 250, k), ART.lerp(p[1], 330, k) - Math.sin(k * Math.PI) * 240, 34, t * 10, { brilho: 0.5 });
    GA.hud(g, t, { moedas: t >= tP ? 1 : 0, pulso: ART.pulse(t, tP, 0.3) });
    ART.ui.flutua(g, 400, 500, t, tP, { texto: "+1", s: 0.8 });
    void tm;
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.3 });
  },
});
