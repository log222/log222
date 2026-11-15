/* p01 · GANCHO · "E se o seu dia" (C7)
 * Breu total. Clique: a lanterna do capacete do Zeca acende de frente, pisca e firma; a luz estoura em flare
 * e a poeira aparece no feixe. Push-in rápido até a lâmpada (que "engole" a tela no fim, emendando no gameplay p02). */
MD.plano("p01", {
  async setup(ctx) { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 0.96;
    const tc = GC.mark(ctx, "clique", 0.02);
    // acende: clique -> estala, pisca uma vez, firma
    const on = ART.kf(t - tc, [[0, 0], [0.03, 0], [0.06, 1, "outExpo"], [0.1, 0.25], [0.15, 1, "outCubic"], [0.2, 0.85], [0.26, 1]]);
    // câmera: push-in rápido no capacete, centrado na lâmpada; no fim acelera para dentro da luz
    const z = ART.kf(t, [[0, 1.0], [0.2, 1.08, "outCubic"], [D - 0.18, 1.26, "inOutSine"], [D, 1.5, "inCubic"]]);
    const LX = 540, LY = 580, S = 7;                      // lâmpada fica aqui na tela
    const sh = GC.shake(t, tc + 0.04, 0.18, 7, 3);
    g.save();
    GC.breu(g, t, { x: LX, y: LY, c0: ART.mix("#07060B", "#1C1626", on), c1: "#030206" });
    GC.cam(g, z, LX, LY, sh.x, sh.y);
    // Zeca de frente, em close: capacete enorme, rosto no breu iluminado só pelo vazamento da lanterna
    const pose = ART.zeca.pose("parado", t + 3, { x: 540, y: LY + 201 * S, s: S, turn: 0, camera: 1, look: [0, 0.05], eyes: (t - tc > 0.04 && t - tc < 0.3) ? "meio" : "aberto", mouth: "neutro", blink: 0, headTilt: -2 });
    const anc = GC.zecaNoEscuro(g, pose, { escuro: ART.lerp(1, 0.8, on), raio: 1000, rimK: on, apagado: 0.97 * (1 - Math.min(1, on * 3)) });
    g.restore();
    // a lâmpada (desenhada por cima, em px de tela, acompanhando a câmera)
    const lp = anc.lanterna || { x: LX, y: LY };   // âncora do kit já vem em px de tela (com a câmera)
    const rr = S * 13 * z;
    GC.lampada(g, t, lp.x, lp.y, rr * 0.55, on, { halo: 1 + 0.4 * ART.prog(t, D - 0.3, D) });
    // poeira atravessando a luz
    ART.dust(g, t, { count: 70, seed: 11, color: "#FFF0C8", alpha: 0.9 * on, size: [2, 6], x: 40, w: 1000, y: 150, h: 1100, speed: 30 });
    // estouro de luz no fim (entra no dia de trabalho)
    const wo = ART.prog(t, D - 0.16, D, "inCubic");
    if (wo > 0) { g.save(); g.globalCompositeOperation = "lighter"; ART.glow(g, lp.x, lp.y, 1600 * wo, "#FFF4D6", 0.9 * wo); g.restore(); }
    GC.post(g, ctx, { vinheta: 0.7, legendaK: 0.35 });
  },
});
