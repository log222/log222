/* p244 · "E um bloco diferente," (C3) — screenshot real (shot_1) com o bloco de ampulheta: push-in contínuo até o bloco
 * (sem céu, árvores nem HUD do jogo: o 137/12/6 e o 11,8 ficam fora do recorte). Em DIFERENTE um anel dourado pulsa em
 * volta do bloco. Selo IMAGEM REAL DO JOGO. Cronômetro desenhado 6,0 → 5,6. */
MD.plano("p244", {
  async setup(ctx) {
    if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js");
    if (!window.GA2) await MD.loadScript("../scenes/planos/_grupoA_ep02.js");
    await ART.gameplay.preloadShot("shot_1");
    return {};
  },
  render(g, t, ctx) {
    const D = ctx.dur || 1.77, tD = GA.w(ctx, "diferente", 0, D * 0.5);
    const v = ART.gameplay.cheio(g, t, Object.assign({}, ART.gameplay.PRESET.ampulheta, { dur: D, cronometro: { valor: GA.cron(t, D, 6.0, 5.6), max: 11, escala: 11 } }));
    const a = v.map(712, 262), b = v.map(778, 292), cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2, rw = (b[0] - a[0]) * 0.75, rh = (b[1] - a[1]) * 0.95;
    const pk = ART.prog(t, tD - 0.12, tD + 0.2, "outBack"), pul = 0.5 + 0.5 * Math.sin((t - tD) * 9);
    ART.glow(g, cx, cy, 260 + 30 * pul, "#FFD23F", 0.18 + 0.32 * pk);
    if (pk > 0) {
      g.save(); g.globalAlpha = Math.min(1, pk); g.lineWidth = 9; g.strokeStyle = "#FFD23F"; g.shadowColor = "rgba(255,200,60,.8)"; g.shadowBlur = 18;
      g.beginPath(); g.ellipse(cx, cy, rw * (1 + 0.05 * pul) * pk, rh * (1 + 0.05 * pul) * pk, 0, 0, Math.PI * 2); g.stroke(); g.restore();
    }
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.32 });
  },
});
