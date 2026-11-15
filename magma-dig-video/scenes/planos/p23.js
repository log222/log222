/* p23 · "O centro da Terra fica mais de quinhentas vezes mais fundo." (C6)
 * Zoom-out contínuo EM ESCALA REAL: começa colado no furo de Kola (12 KM, um traço amarelo visível) e se afasta até o
 * planeta inteiro em corte; o furo vira um risco invisível marcado por um círculo. Em "quinhentas" entram os rótulos
 * das camadas e o selo ×520 (6.371 ÷ 12,262 ≈ 520); a seta desce da superfície até o centro e "6.371 KM" entra em
 * "fundo". Depois, empurrão lento: o p24 começa exatamente neste enquadramento final. */
MD.plano("p23", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, BP = ART.BP, D = ctx.dur || 3.58, K = GC.KOLA;
    const tQ = GC.wt(ctx, "quinhentas", 1.69), tF = GC.wt(ctx, "fundo", 2.89);
    const { CX, CY, R: R1, aF } = K;
    const P1 = [CX + Math.cos(aF) * R1, CY + Math.sin(aF) * R1];
    // zoom em escala log: R vai de ~R1*300 (12 km ≈ 180 px) até R1
    const tZ = Math.min(tQ + 0.15, D * 0.7);
    const k = ART.prog(t, 0.0, tZ, "inOutCubic");
    const Z0 = 300, R = R1 * Math.exp(Math.log(Z0) * (1 - k));
    const kp = ART.ease.inOutCubic(ART.prog(t, 0.1, tZ));
    const Ps = [ART.lerp(540, P1[0], kp), ART.lerp(760, P1[1], kp)];
    const cx = Ps[0] - Math.cos(aF) * R, cy = Ps[1] - Math.sin(aF) * R;
    // depois do zoom: empurrão lento até K.zFim (o p24 começa daqui)
    const zc = ART.map(t, tZ, D, 1.0, K.zFim, "linear");
    ART.blueprint(g, t);
    g.save(); GC.cam(g, zc, CX, CY);
    const fr = GC.planeta(g, t, { cx, cy, R, aFuro: aF, rotulos: ART.prog(t, tQ - 0.1, tQ + 0.3), risco: 1 });
    // rótulo do furo de perto (cotas reais)
    const near = 1 - ART.prog(t, 0.35, 0.8);
    if (near > 0) {
      GC.neon(g, () => { g.beginPath(); g.moveTo(fr.px + 30, fr.py); g.lineTo(fr.px + 30 - Math.cos(aF) * fr.L, fr.py - Math.sin(aF) * fr.L); g.stroke(); }, { cor: BP.amarelo, w: 2, dash: [6, 6], a: near });
      GC.rot(g, "12 KM", fr.px + 60, fr.py - Math.sin(aF) * fr.L / 2, { size: 54, cor: BP.amarelo, a: near });
      GC.rot(g, "POÇO DE KOLA", fr.px - 40, fr.py - 120, { size: 34, align: "center", a: near * 0.8 });
    }
    GC.kolaMarcas(g, fr, cx, cy, {
      far: ART.prog(t, 0.6, 1.0),
      seta: ART.prog(t, tQ + 0.15, Math.max(tQ + 0.5, tF - 0.05), "inOutCubic"),
      label: Math.max(0, ART.prog(t, tF - 0.15, tF + 0.1, "outBack")),
      selo: Math.max(0, ART.prog(t, tQ, tQ + 0.25, "outBack")),
    });
    g.restore();
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
