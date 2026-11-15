/* p20 · "O buraco mais fundo que a gente já cavou" (C6)
 * Corte da crosta (blueprint). POÇO DE KOLA · RÚSSIA no alto; um furo fininho desce da torre e a câmera desce junto
 * com a broca (faíscas na ponta). Sem régua ainda: ela aparece no p21, quando o furo para. */
MD.plano("p20", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 2.31;
    const y0 = 470, y1 = 1250;
    const furo = ART.map(t, 0.1, D, 0.0, 0.86, "inOutSine");
    const tipY = ART.lerp(y0, y1, furo);
    const z = ART.map(t, 0, D, 1.12, 1.55, "inOutSine");
    const camY = ART.lerp(y0 - 60, tipY, ART.prog(t, 0, D * 0.6, "inOutSine"));
    const vib = Math.sin(t * 70) * 1.5;
    ART.blueprint(g, t);
    g.save(); GC.foco(g, z, 600 + vib, camY, 540, ART.map(t, 0, D, 700, 760));
    GC.semFundo(() => ART.ciencia.crosta(g, t, { furo, regua: 0, rotulo: ART.prog(t, 0, 0.25), y0, y1 }));
    // faíscas e poeira na ponta da broca
    const ps = ART.burst(t % 0.3, { t0: 0, count: 12, x: 600, y: tipY + 18, speed: [80, 260], angle: [-170, -10], gravity: 600, life: [0.15, 0.3], seed: 5 + Math.floor(t / 0.3) });
    g.save(); g.globalCompositeOperation = "lighter"; for (const q of ps) { g.globalAlpha = q.alpha; ART.circ(g, q.x, q.y, 3); g.fillStyle = ART.BP.amarelo; g.fill(); } g.restore();
    g.restore();
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
