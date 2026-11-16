/* p215 · "Ninguém tirou nada dele." (C7)
 * A pepita inteira de novo, intacta, com o brilho voltando ao cheio, dá uma volta inteira (360°) no holofote ao longo
 * do plano. Empurrão lento; brilhos e poeira até o último quadro. */
MD.plano("p215", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, D = ctx.dur || 2.45;
    const tN = GD.wt(ctx, "Ninguem", 0.04);
    const volta = ART.prog(t, tN, tN + 0.5);           // brilho volta ao cheio na primeira palavra
    const k = 0.6 + 0.5 * volta + 0.06 * Math.sin(t * 5);
    // fase do giro do kit: cos(ph*1.6) -> 1 volta = 2π/1.6 de fase ao longo do plano
    const ph = 0.2 + (t / D) * (2 * Math.PI / 1.6);
    const z = ART.map(t, 0, D, 1.0, 1.08, "inOutSine");
    ART.holofote(g, t, { chao: 1250, cor: "#FFD2A0", k: 0.6 + 0.35 * volta });
    g.save(); GC.cam(g, z, 540, 800);
    g.save(); g.translate(540, 1250); g.scale(1, 0.15); ART.glow(g, 0, 0, 300, "#000000", 0.6, "source-over"); g.restore();
    ART.obj.pepitaCobre(g, ph, { x: 540, y: 760, r: 200, k });
    const ps = ART.burst(t, { t0: tN + 0.1, count: 16, x: 540, y: 760, speed: [150, 420], angle: [-180, 0], gravity: 150, life: [0.6, 1.2], seed: 215, drag: 2 });
    g.save(); g.globalCompositeOperation = "lighter"; for (const q of ps) { g.globalAlpha = q.alpha * 0.8; ART.circ(g, q.x, q.y, 2.5 + q.r * 3); g.fillStyle = "#FFD9A8"; g.fill(); } g.restore();
    g.restore();
    GC.post(g, ctx, { vinheta: 0.7, legendaK: 0.4 });
  },
});
