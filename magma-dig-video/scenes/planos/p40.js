/* p40 · "Cinco segundos. Quatro pedras." (C2) — Zeca golpeando sem parar (4 golpes no som), faíscas e pedrinhas;
 * câmera na mão. Cronômetro do dia 2 (escala 11) em ~5,0; contador vira 4 na palavra QUATRO. */
MD.plano("p40", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.62, H = GA.ms(ctx, "picareta"); if (!H.length) H.push(0.05, 0.27, 0.49, 0.71);
    const tQ = GA.w(ctx, "quatro", 0, D * 0.6), tC = GA.w(ctx, "cinco", 0, 0.04), nh = GA.n(t, H);
    const mao = { sx: ART.noise(t * 3, 2) * 10, sy: ART.noise(t * 3, 5) * 8, rot: ART.noise(t * 2, 8) * 0.6 };
    const cam = ART.camMais(GA.cam(500, 1000, 2.05, ART.camera(t, { push: [1, 1.05], dur: D, hits: H, hitAmp: 12, hitDur: 0.18 }), { sy: 800 }), mao);
    const c0 = GA.centroBloco();
    ART.palco(g, t, cam, ART.cenas.mina({}), gg => {
      ART.cubo(gg, GA.B.X, GA.B.Z, { crack: 1 + (nh % 3) * 0.9, seed: 4 + Math.floor(nh / 3) });
      ART.zeca.draw(gg, GA.cava(t, H, { ...GA.Z, turn: 0.85, lamp: 1, cone: 0.35, rim: "#FFC88A", sweat: 0.6 }, { periodoMax: 0.5 }));
      for (const h of H) {
        for (const p of ART.burst(t, { t0: h, count: 14, x: c0[0] - 70, y: c0[1] - 40, speed: [300, 800], angle: [-175, -30], gravity: 2200, life: [0.3, 0.6], seed: 40 + h * 13, size: [7, 15] })) { gg.save(); gg.globalAlpha = p.alpha; gg.fillStyle = p.i % 3 ? "#BAAB87" : "#76756A"; gg.fillRect(p.x, p.y, p.size, p.size * 0.7); gg.restore(); }
        const sp = ART.burst(t, { t0: h, count: 10, x: c0[0] - 70, y: c0[1] - 60, speed: [600, 1100], angle: [-170, -10], gravity: 1500, life: [0.15, 0.3], seed: 60 + h * 7 });
        gg.save(); gg.globalCompositeOperation = "lighter"; for (const p of sp) { gg.globalAlpha = p.alpha; gg.strokeStyle = "#FFE29A"; gg.lineWidth = 3; gg.beginPath(); gg.moveTo(p.x, p.y); gg.lineTo(p.x - 18, p.y + 10); gg.stroke(); } gg.restore();
      }
    }, { frame: ctx.frame });
    H.forEach((h, i) => ART.ui.crac(g, 560 + (i % 2) * 90, 820 - (i % 2) * 40, t, h, { s: 0.85, rot: i % 2 ? 6 : -6, dur: 0.4 }));
    GA.hud(g, t, { cron: GA.cron(t, D, 0, 0, [[0, 5.6], [Math.max(tC, 0.35), 5.0], [D, 4.2]]), max: 11, escala: 11, moedas: t >= tQ ? 4 : nh >= 2 ? 3 : 2, pulso: GA.pulsos(t, [tQ, H[1] ?? 9]) });
  },
});
