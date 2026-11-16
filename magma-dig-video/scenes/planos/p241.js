/* p241 · "Onze segundos de luz." (C2) — dia 4: preto; a linha de luz abre a imagem como um olho (como o p27), a lanterna
 * acende com feixe e a mina aparece. Em ONZE o HUD entra (cronômetro 11,0 de 11, moedas 0). No fim o Zeca vira para o
 * bloco, decidido (passa a pose para o p242). Câmera recua com a abertura e depois empurra devagar. */
MD.plano("p241", {
  async setup(ctx) {
    if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js");
    if (!window.GA2) await MD.loadScript("../scenes/planos/_grupoA_ep02.js");
    return {};
  },
  render(g, t, ctx) {
    const D = ctx.dur || 2.42, tc = GA.m(ctx, "clique", 0, 0.02), tO = GA.w(ctx, "onze", 0, 0.1), tL = GA.w(ctx, "luz", 0, D * 0.7);
    const k = ART.prog(t, tc + 0.03, Math.min(D * 0.45, 0.95), "inOutSine");
    const on = ART.kf(t - tc, [[0, 0], [0.05, 1, "outExpo"], [0.1, 0.5], [0.18, 1]]);
    const z = ART.lerp(1.9, 1.6, ART.prog(t, 0, D * 0.5, "outSine")) * ART.lerp(1, 1.035, ART.prog(t, D * 0.4, D, "inOutSine"));
    const cam = GA2.camMedio({}, z);
    const tAbre = Math.max(tO, 0.3), tVira = Math.max(tAbre + 0.5, tL - 0.2);
    ART.palco(g, t, cam, ART.cenas.mina({ luz: 0.35 + 0.65 * on }), gg => {
      ART.cubo(gg, GA.B.X, GA.B.Z, { seed: 4 });
      ART.zeca.draw(gg, ART.zeca.seq(t, [
        [0, "parado", { eyes: "fechado", blink: 0, turn: 0.45, camera: 0.5 }],
        [tAbre, "parado", { eyes: "aberto", mouth: "sorriso", turn: 0.45, camera: 0.5 }],
        [tVira, "parado", { eyes: "determinado", mouth: "sorriso", turn: 0.82, camera: 0, alvo: [900, 1000] }],
      ], { base: { ...GA.Z, tool: "picareta", lamp: on, cone: 0.6 * on, coneAng: 28, rim: "#FFC88A" }, blend: 0.3 }));
    }, { frame: ctx.frame });
    ART.dust(g, t, { count: 34, seed: 41, color: "#FFE6B8", alpha: 0.55 * on, size: [2, 5], speed: 8, x: 380, w: 620, y: 760, h: 520 });
    ART.aberturaOlho(g, k, { y: 830 });
    const intro = ART.prog(t, tAbre - 0.08, tAbre + 0.14, "outBack");
    GA2.hud(g, t, { cron: 11.0, moedas: 0, intro, pulso: ART.pulse(t, tAbre, 0.35) });
  },
});
