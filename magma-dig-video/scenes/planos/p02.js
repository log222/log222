/* p02 · "de trabalho durasse" (C3) — gameplay real: a picareta batendo no primeiro bloco cinza em 1ª pessoa.
 * Recorte vertical com leve zoom; o cronômetro desenhado cobre o original e começa a cair de 10,0; CRAC! no som. */
MD.plano("p02", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(0.5, 1.7); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.12, h = GA.m(ctx, "picareta", 0, 0.05);
    const v = ART.gameplay.visor(g, t, { de: 0.55, ate: 0.55 + D, dur: D, recorte: ART.gameplay.RECORTES.minaAlta, y: 800, largura: 1010, zoom: [1.0, 1.12], foco: [700, 330], retrato: 0,
      cronometro: { valor: Math.max(0, 10 - Math.max(0, t - 0.15)) } });
    const sh = ART.camera(t, { hits: [h], hitAmp: 10, push: [1, 1] });
    const p = v.map(620, 320);
    ART.ui.crac(g, p[0] + 60 + sh.sx, p[1] - 30 + sh.sy, t, h, { s: 1.1, rot: -6 });
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.3 });
  },
});
