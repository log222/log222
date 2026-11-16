/* p203 · GANCHO · "custasse a metade?" (C7)
 * Pepita de cobre girando no holofote, etiqueta de preço 40 pendurada embaixo. Em "metade" (som de rachar) a etiqueta
 * racha ao meio, as metades caem e entra a nova, 20 em vermelho; tremida curta no 20 e o holofote cai para metade. */
MD.plano("p203", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, D = ctx.dur || 1.62;
    const tM = GD.mark(ctx, "rachar", GD.wt(ctx, "metade", D * 0.42));
    // k da etiqueta: racha em tM, a nova chega antes do fim do plano
    const fim = Math.min(D - 0.12, tM + 0.75);
    const k = ART.prog(t, tM - 0.04, fim);
    const t20 = ART.lerp(tM - 0.04, fim, 0.62);
    const meia = ART.prog(t, t20 - 0.05, t20 + 0.25);
    const luz = 1 - 0.5 * meia;
    const sh = GC.shake(t, t20, 0.25, 14, 7);
    const z = ART.map(t, 0, D, 1.0, 1.08, "inOutSine");
    ART.holofote(g, t, { chao: 1250, cor: "#FFD2A0", k: luz });
    g.save(); GC.cam(g, z, 540, 820, sh.x, sh.y);
    g.save(); g.translate(540, 1250); g.scale(1, 0.15); ART.glow(g, 0, 0, 300, "#000000", 0.6, "source-over"); g.restore();
    ART.obj.pepitaCobre(g, t + 1.3, { x: 540, y: 610, r: 165, k: 0.55 + 0.45 * luz });
    // barbante da etiqueta (some quando ela racha)
    const fio = 1 - ART.prog(k, 0.3, 0.45);
    if (fio > 0) { g.save(); g.globalAlpha = fio; g.strokeStyle = "#C9B998"; g.lineWidth = 4; g.beginPath(); g.moveTo(560, 760); g.quadraticCurveTo(520, 860, 470, 990); g.stroke(); g.restore(); }
    ART.ui.etiquetaPreco(g, 560 + 4 * Math.sin(t * 2.2), 1045, { de: 40, para: 20, k, s: 1.35, rot: -6 + 2 * Math.sin(t * 1.8) });
    g.restore();
    if (meia > 0) ART.glow(g, 600, 1050, 360, "#E63748", 0.25 * GD.hit(t, t20, 0.6));
    GC.post(g, ctx, { vinheta: 0.7, legendaK: 0.42 });
  },
});
