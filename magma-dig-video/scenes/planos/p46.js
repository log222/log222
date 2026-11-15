/* p46 · "Um brilho laranja." (C2) — close do rosto; a luz laranja do cobre inunda o rosto do Zeca, reflexo nos olhos.
 * O plano mais claro do vídeo; push-in lento. */
MD.plano("p46", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.34, td = GA.m(ctx, "ding", 0, 0), tL = GA.w(ctx, "laranja", 0, 0.6);
    const k = ART.prog(t, td, tL + 0.1, "outCubic");
    const cam = GA.cam(480, 940, ART.lerp(3.0, 3.25, ART.prog(t, 0, D, "inOutSine")), {}, { sy: 800 });
    ART.palco(g, t, cam, ART.cenas.mina({ luz: 0.6 }), gg => {
      ART.glow(gg, 760, 1000, 600, "#FF8A3C", 0.8 * k);
      ART.zeca.draw(gg, ART.zeca.seq(t, [[0, "parado", { eyes: "aberto", mouth: "neutro" }], [tL - 0.15, "parado", { eyes: "espanto", mouth: "o", brows: "surpreso" }]], { base: { x: 470, y: 1182, s: 1.62, turn: 0.45, lamp: 1, cone: 0.6, coneAng: 32, alvo: [800, 980], rim: "#FF9A50", rimA: 0.6 + 0.4 * k, banho: { cor: "#FF9A3C", k } }, blend: 0.2 }));
    }, { frame: ctx.frame, vinheta: 0.4 });
    g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = `rgba(255,120,40,${0.12 * k})`; g.fillRect(0, 0, 1080, 1920); g.restore();
    ART.dust(g, t, { count: 40, seed: 12, color: "#FFB070", alpha: 0.8 * k, size: [2, 5] });
    GA.hud(g, t, { cron: GA.cron(t, D, 0.4, 0.2), max: 11, escala: 11 });
  },
});
