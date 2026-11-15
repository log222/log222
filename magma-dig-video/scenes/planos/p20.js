/* p20 · "O buraco mais fundo que a gente já cavou" (C6)
 * Corte da crosta inteiro no quadro (y ≈ 300–1250, rótulos dentro da zona segura). POÇO DE KOLA · RÚSSIA no alto;
 * a broca desce da torre ao longo da fala, com brilho no furo e faíscas na ponta. Câmera empurra devagar e acompanha
 * a ponta de leve. Termina quase no fundo: o p21 continua do mesmo enquadramento, com a régua. */
MD.plano("p20", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 2.31;
    const y0 = 490, y1 = 1250;
    const furo = ART.map(t, 0.05, D, 0.0, 0.97, "inOutSine");
    const tipY = ART.lerp(y0, y1, furo);
    const z = ART.map(t, 0, D, 0.95, 1.0, "inOutSine");
    const vib = Math.sin(t * 70) * 1.2;
    ART.blueprint(g, t);
    g.save(); GC.focoCrosta(g, z, 870 + (tipY - 870) * 0.06 + vib * 0.3);
    GC.semFundo(() => ART.ciencia.crosta(g, t, { furo, regua: 0, rotulo: 0, y0, y1 }));
    GC.furo(g, y0, tipY);
    ART.glow(g, 600, tipY + 12, 90, ART.BP.amarelo, 0.6 + 0.3 * Math.sin(t * 30));
    // faíscas e poeira na ponta da broca
    const ps = ART.burst(t % 0.3, { t0: 0, count: 14, x: 600, y: tipY + 18, speed: [90, 280], angle: [-170, -10], gravity: 600, life: [0.15, 0.3], seed: 5 + Math.floor(t / 0.3) });
    g.save(); g.globalCompositeOperation = "lighter"; for (const q of ps) { g.globalAlpha = q.alpha; ART.circ(g, q.x, q.y, 3.5); g.fillStyle = ART.BP.amarelo; g.fill(); } g.restore();
    g.restore();
    GC.tituloKola(g, ART.prog(t, 0, 0.2));
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
