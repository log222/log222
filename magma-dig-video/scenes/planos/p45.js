/* p45 · "a picareta bateu numa parede diferente." (C2) — impacto no som; a parede racha e veios laranja de cobre aparecem
 * por dentro, crescendo até DIFERENTE; tremor de câmera; CRAC! maior. */
MD.plano("p45", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 2.59, h = GA.m(ctx, "picareta", 0, 0.05), tD = GA.w(ctx, "diferente", 0, 1.8);
    const veios = ART.prog(t, h + 0.1, tD + 0.2, "inOutSine"), crack = ART.prog(t, h, h + 0.12) * 2.6;
    const cam = GA.cam(640, 980, ART.lerp(2.5, 2.7, ART.prog(t, 0, D)), ART.camera(t, { hits: [h, h + 0.03], hitAmp: 26, hitDur: 0.45 }), { sy: 820 });
    ART.palco(g, t, cam, ART.cenas.mina({}), gg => {
      ART.cubo(gg, GA.B.X, GA.B.Z, { crack, seed: 9, veios, t, crackGlow: veios > 0.2 ? "#FFB060" : null });
      ART.zeca.draw(gg, GA.cava(t, [h], { ...GA.Z, turn: 0.85, lamp: 1, cone: 0.6, rim: "#FF9A50", rimA: 0.5 + 0.5 * veios, banho: { cor: "#FF8A3C", k: veios * 0.7 }, eyes: t > h + 0.4 ? "espanto" : undefined }));
      const c0 = GA.centroBloco();
      for (const p of ART.burst(t, { t0: h, count: 22, x: c0[0] - 80, y: c0[1] - 60, speed: [500, 1200], angle: [-175, -10], gravity: 1600, life: [0.2, 0.5], seed: 77 })) { gg.save(); gg.globalCompositeOperation = "lighter"; gg.globalAlpha = p.alpha; gg.strokeStyle = "#FFC070"; gg.lineWidth = 4; gg.beginPath(); gg.moveTo(p.x, p.y); gg.lineTo(p.x - 22, p.y + 12); gg.stroke(); gg.restore(); }
    }, { frame: ctx.frame });
    if (t >= h && t < h + 0.08) { g.save(); g.fillStyle = "rgba(255,230,190,.5)"; g.fillRect(0, 0, 1080, 1920); g.restore(); }
    ART.ui.crac(g, 600, 760, t, h, { s: 1.7, rot: -5, dur: 1.0 });
    GA.hud(g, t, { cron: GA.cron(t, D, 0.7, 0.4), max: 11, escala: 11 });
  },
});
