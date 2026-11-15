/* p07 · "Cada pedra que racha paga na hora." (C3) — tela cheia, zoom forte no CRAC; na palavra PAGA uma moeda
 * desenhada voa do bloco até o contador (+1). Cronômetro 9,5 → 8,5. */
MD.plano("p07", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(1.5, 3.8); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.99, h = GA.m(ctx, "picareta", 0, 0.05), tP = GA.w(ctx, "paga", 0, D * 0.5);
    const v = ART.gameplay.cheio(g, t, { de: 1.5, ate: 3.4, dur: D, foco: [630, 320], zoom: [1.1, 1.75], cronometro: { valor: GA.cron(t, D, 9.5, 8.5) } });
    const p = v.map(630, 315);
    ART.ui.crac(g, p[0] + 40, p[1] - 60, t, h, { s: 1.3, rot: -6, dur: 0.9 });
    const k = ART.prog(t, tP - 0.3, tP, "inCubic");
    if (k > 0 && k < 1) ART.ui.moeda(g, ART.lerp(p[0], 250, k), ART.lerp(p[1], 370, k) - Math.sin(k * Math.PI) * 240, 36, t * 10, { brilho: 0.5 });
    GA.hud(g, t, { y: 370, moedas: t >= tP ? 1 : 0, pulso: ART.pulse(t, tP, 0.3) });
    ART.ui.flutua(g, 400, 520, t, tP, { texto: "+1", s: 0.8 });
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.32 });
  },
});
