/* p06 · "Acendeu, é dia." (C2) — a luz da lanterna acende e varre a parede de blocos; poeira dourada; câmera sobe.
 * Zeca pequeno embaixo olhando para cima. No DIA, o cronômetro do dia entra com o solzinho (10,0). */
MD.plano("p06", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.3, tA = GA.w(ctx, "acendeu", 0, 0.04), tD = GA.w(ctx, "dia", 0, 0.79);
    const on = ART.kf(t - tA, [[0, 0.1], [0.06, 1, "outExpo"], [0.12, 0.5], [0.2, 1]]);
    const cam = GA.cam(480, ART.lerp(940, 860, ART.prog(t, 0, D, "inOutSine")), 1.55, {}, { sy: 820 });
    ART.palco(g, t, cam, ART.cenas.mina({ luz: on }), gg => {
      ART.glow(gg, 600, 560, 420, "#FFE2A0", 0.5 * on);
      ART.zeca.draw(gg, ART.zeca.pose("parado", t, { x: 380, y: 1182, s: 1.62, turn: 0.55, lamp: Math.max(0.3, on), cone: 0.9, coneLivre: 1, coneAng: -48, coneLen: 700, coneAbre: 0.7, alvo: [620, 520], eyes: "aberto", mouth: "aberto", rim: "#FFC88A" }));
    }, { frame: ctx.frame });
    ART.dust(g, t, { count: 60, seed: 7, color: "#FFD98A", alpha: 0.8 * on, size: [2, 5], y: 200, h: 1000 });
    const k = ART.prog(t, tD - 0.05, tD + 0.15, "outBack");
    if (k > 0) GA.hud(g, t, { cron: 10, intro: k });
  },
});
