/* p27 · "A lanterna acendeu." (C2) — preto total; uma linha de luz horizontal abre a imagem como um olho
 * (transição-assinatura): é o Zeca abrindo os olhos com a lanterna acendendo. */
MD.plano("p27", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.24, tc = GA.m(ctx, "clique", 0, 0.02), tA = GA.w(ctx, "acendeu", 0, 0.6);
    const k = ART.prog(t, tc + 0.05, Math.min(D, tA + 0.35), "inOutSine");
    const on = ART.kf(t - tc, [[0, 0], [0.05, 1, "outExpo"], [0.1, 0.5], [0.18, 1]]);
    const cam = GA.cam(540, 990, ART.lerp(2.2, 1.9, ART.prog(t, 0, D)), {}, { sy: 800 });
    ART.palco(g, t, cam, ART.cenas.mina({ luz: on }), gg => {
      ART.zeca.draw(gg, ART.zeca.seq(t, [[0, "parado", { eyes: "fechado", blink: 0 }], [tA - 0.1, "parado", { eyes: "aberto", mouth: "sorriso" }]], { base: { x: 540, y: 1182, s: 1.62, turn: 0.2, camera: 0.7, lamp: on, cone: 0, rim: "#FFC88A" }, blend: 0.15 }));
    }, { frame: ctx.frame });
    ART.aberturaOlho(g, k, { y: 830 });
  },
});
