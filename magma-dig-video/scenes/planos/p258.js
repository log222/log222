/* p258 · "Mas na aba Clientes, tinha um pedido." (C3) — aba Clientes real do jogo (shot_5) com os valores e a caixa de
 * marketing tapados (PRESET.clientes) e o selo IMAGEM REAL DO JOGO. Push-in contínuo da aba amarela CLIENTES (que pulsa
 * em CLIENTES) até o cartão da Dona Coruja (contorno dourado em PEDIDO). Termina parado no cartão (o p259 faz o dissolve). */
MD.plano("p258", {
  async setup(ctx) {
    if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js");
    if (!window.GA2) await MD.loadScript("../scenes/planos/_grupoA_ep02.js");
    await ART.gameplay.preloadShot("shot_5");
    return {};
  },
  render(g, t, ctx) {
    const D = ctx.dur || 3.19, tC = GA.w(ctx, "clientes", 0, D * 0.3), tP = GA.w(ctx, "pedido", 0, D * 0.75);
    // push-in que para no cartão da Dona Coruja inteiro e centrado; o fim fica parado para o dissolve do p259
    const tEnd = Math.max(0.8, Math.min(D - 0.45, tP + 0.15)), k = ART.prog(t, 0, tEnd, "inOutSine");
    const v = ART.gameplay.cheio(g, t, Object.assign({}, ART.gameplay.PRESET.clientes, { dur: tEnd, topo: 84, base: 430, altura: 520, cy: 820, foco: [ART.lerp(380, 425, k), ART.lerp(250, 204, k)], zoom: [1.0, 1.1], remendos: ART.gameplay.REMENDOS.clientes.concat([[729, 84, 70, 62, "#1E1B2E"]]) }));
    // aba CLIENTES pulsa na palavra
    const ta = v.map(224, 95), tb = v.map(325, 138), pa = ART.pulse(t, tC - 0.05, 0.6);
    if (pa > 0) { g.save(); ART.rr(g, ta[0] - 6, ta[1] - 6, tb[0] - ta[0] + 12, tb[1] - ta[1] + 12, 22 * v.sc / 1.7); g.lineWidth = 7; g.strokeStyle = `rgba(255,236,150,${pa})`; g.shadowColor = "rgba(255,210,63,.9)"; g.shadowBlur = 20 * pa; g.stroke(); g.restore(); ART.glow(g, (ta[0] + tb[0]) / 2, (ta[1] + tb[1]) / 2, 200, "#FFD23F", 0.35 * pa); }
    // cartão da Dona Coruja ganha contorno em PEDIDO
    const ca = v.map(125, 150), cb = v.map(730, 258), pk = ART.prog(t, tP - 0.1, tP + 0.2, "outCubic"), pul = 0.6 + 0.4 * Math.sin((t - tP) * 8);
    if (pk > 0) { g.save(); g.globalAlpha = pk; ART.rr(g, ca[0], ca[1], cb[0] - ca[0], cb[1] - ca[1], 16 * v.sc / 1.7); g.lineWidth = 7; g.strokeStyle = "#FFD23F"; g.shadowColor = "rgba(255,210,63,.9)"; g.shadowBlur = 22 * pul; g.stroke(); g.restore(); }
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.32 });
  },
});
