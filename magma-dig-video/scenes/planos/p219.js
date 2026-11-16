/* p219 · "E do nosso também." (C6) — troca de mundo.
 * A Toca (Zeca sentado no chão com a pepita, como no p218) dissolve em linhas ciano sobre azul-petróleo; uma linha
 * de preço ciano começa a se desenhar da esquerda e a câmera desliza para a direita. Sem números ainda. */
MD.plano("p219", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, BP = ART.BP, D = ctx.dur || 1.63;
    const tN = GD.wt(ctx, "nosso", 0.36);
    const a = ART.prog(t, 0.08, Math.min(0.6, tN + 0.15), "inOutSine");   // dissolve curto
    if (a < 1) GD.toca(g, t, ctx, { push: [1.08, 1.12] });
    if (a > 0) {
      g.save(); g.globalAlpha = a; ART.blueprint(g, t); g.restore();
      // a Toca vira linhas: contorno ciano do Zeca sentado aparece por cima enquanto a cor some
      const dx = ART.map(t, 0, D, 40, -40, "linear");                       // câmera desliza para a direita
      g.save(); g.translate(dx, 0); g.globalAlpha = a;
      // linha de preço se desenhando da esquerda (forma livre, sem eixo nem valores)
      const pts = []; const r = ART.rng(219);
      for (let i = 0; i <= 24; i++) { const x = 120 + i * 36, y = 900 - i * 9 - 60 * Math.sin(i * 0.7) * (0.4 + r() * 0.6); pts.push([x, y]); }
      const k = ART.prog(t, 0.25, D, "inOutSine");
      const n = (pts.length - 1) * k;
      GC.neon(g, () => {
        g.beginPath(); g.moveTo(...pts[0]);
        for (let i = 1; i <= Math.ceil(n); i++) { const f = Math.min(1, n - (i - 1)), p0 = pts[i - 1], p1 = pts[i]; g.lineTo(ART.lerp(p0[0], p1[0], f), ART.lerp(p0[1], p1[1], f)); }
        g.stroke();
      }, { w: 6 });
      if (k > 0) { const i = Math.min(pts.length - 1, Math.floor(n)), f = n - i, p0 = pts[i], p1 = pts[Math.min(pts.length - 1, i + 1)]; const tx = ART.lerp(p0[0], p1[0], f), ty = ART.lerp(p0[1], p1[1], f); ART.glow(g, tx, ty, 46, BP.linha, 0.9); ART.circ(g, tx, ty, 8); g.fillStyle = "#FFFFFF"; g.fill(); }
      // eixo fino (sem números)
      GC.neon(g, () => { g.beginPath(); g.moveTo(90, 1000); g.lineTo(ART.lerp(90, 1000, ART.prog(t, 0.15, 0.9)), 1000); g.stroke(); }, { w: 2.5, a: 0.8 });
      g.restore();
    }
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
