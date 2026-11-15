/* p02 · "de trabalho durasse" (C3) — imagem real do jogo em tela cheia: a picareta bate no primeiro bloco cinza.
 * Cronômetro desenhado cobre o original e fica em 10,0 (quem despenca é o p03). CRAC! no som. */
MD.plano("p02", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(0.5, 1.9); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.12, h = GA.m(ctx, "picareta", 0, 0.05);
    const sh = ART.camera(t, { hits: [h], hitAmp: 12, push: [1, 1] });
    g.save(); g.translate(sh.sx, sh.sy);
    const v = ART.gameplay.cheio(g, t, { de: 0.55, ate: 1.75, dur: D, foco: [640, 340], zoom: [1.05, 1.18], cronometro: { valor: 10 } });
    g.restore();
    const p = v.map(640, 300);
    ART.ui.crac(g, p[0] + 70, p[1] - 40, t, h, { s: 1.2, rot: -6 });
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.32 });
  },
});
