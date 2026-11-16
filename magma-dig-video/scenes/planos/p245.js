/* p245 · "com uma ampulheta." (C2) — o Zeca olhava para cima/longe; vira a cabeça e o feixe da lanterna desce e acha o
 * bloco à frente: um bloco claro com uma ampulheta dourada gravada, que acende no escuro. Em AMPULHETA os olhos
 * arregalam (espanto leve). Câmera acompanha o feixe (inclina de cima para o bloco). Cronômetro 5,6 → 5,2. */
MD.plano("p245", {
  async setup(ctx) {
    if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js");
    if (!window.GA2) await MD.loadScript("../scenes/planos/_grupoA_ep02.js");
    return {};
  },
  render(g, t, ctx) {
    const D = ctx.dur || 1.55, tA = GA.w(ctx, "ampulheta", 0, D * 0.45);
    const k = ART.prog(t, 0.04, Math.max(0.3, tA - 0.05), "inOutCubic");     // feixe varrendo até o bloco
    const ach = ART.prog(t, tA - 0.15, tA + 0.15, "outCubic");              // bloco acende
    const c0 = GA.centroBloco();
    const mov = ART.camera(t, { push: [1, 1.04], dur: D });
    const cam = ART.camMais(GA.cam(560, 1010, 1.47, mov, { sy: 860 }), { y: ART.lerp(-70, 0, k), rot: ART.lerp(-2, 0, k) });
    ART.palco(g, t, cam, ART.cenas.mina({ luz: 0.85 }), gg => {
      ART.cubo(gg, GA.B.X, GA.B.Z, { especial: "ampulheta", t, brilho: 0.25 + 0.75 * ach, escuro: 0.62 * (1 - ach) });
      if (ach > 0) { gg.save(); gg.globalCompositeOperation = "lighter"; ART.glow(gg, c0[0], c0[1], 330, "#FFC531", 0.3 * ach * (0.85 + 0.15 * Math.sin(t * 7))); gg.restore(); }
      ART.zeca.draw(gg, ART.zeca.seq(t, [
        [0, "parado", { eyes: "aberto", mouth: "neutro", alvo: [900, 560] }],
        [Math.max(0.2, tA - 0.12), "parado", { eyes: "espanto", mouth: "o", brows: "surpreso", alvo: [c0[0], c0[1] - 40], lean: -0.05 }],
      ], { base: { ...GA.Z, turn: 0.8, tool: "picareta", lamp: 1, cone: 0.7, coneLivre: 1, coneAng: ART.lerp(-22, 34, k), coneLen: 820, rim: "#FFC88A", banho: { cor: "#FFD86A", k: 0.35 * ach } }, blend: 0.22 }));
    }, { frame: ctx.frame });
    ART.dust(g, t, { count: 30, seed: 52, color: "#FFE6A0", alpha: 0.5, size: [2, 5], speed: 6, x: 520, w: 520, y: 700, h: 500 });
    GA2.hud(g, t, { cron: GA.cron(t, D, 5.6, 5.2), moedas: 4 });
  },
});
