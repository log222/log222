/* p23 · "O centro da Terra fica mais de quinhentas vezes mais fundo." (C6)
 * Zoom-out contínuo EM ESCALA REAL: começa colado no furo de Kola (12 KM, um traço amarelo visível) e se afasta até o
 * planeta inteiro em corte; o furo vira um risco invisível marcado por um círculo. Em "quinhentas" a seta desce da
 * superfície até o centro e entra 6.371 KM. */
MD.plano("p23", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, BP = ART.BP, D = ctx.dur || 3.58;
    const tQ = GC.wt(ctx, "quinhentas", 1.69), tF = GC.wt(ctx, "fundo", 2.89);
    const CX = 440, CY = 820, R1 = 330, aF = -Math.PI * 0.62;
    const P1 = [CX + Math.cos(aF) * R1, CY + Math.sin(aF) * R1];
    // zoom em escala log: R vai de ~R1*300 (12 km ≈ 190 px) até R1
    const k = ART.prog(t, 0.0, tQ + 0.15, "inOutCubic");
    const Z0 = 300, R = R1 * Math.exp(Math.log(Z0) * (1 - k));
    const Ps = [ART.lerp(540, P1[0], ART.ease.inOutCubic(ART.prog(t, 0.1, tQ + 0.15))), ART.lerp(760, P1[1], ART.ease.inOutCubic(ART.prog(t, 0.1, tQ + 0.15)))];
    const cx = Ps[0] - Math.cos(aF) * R, cy = Ps[1] - Math.sin(aF) * R;
    ART.blueprint(g, t);
    const fr = GC.planeta(g, t, { cx, cy, R, aFuro: aF, rotulos: ART.prog(t, tQ - 0.1, tQ + 0.3), risco: 1 });
    // rótulo do furo: perto, cotas reais; longe, círculo pontilhado
    const near = 1 - ART.prog(t, 0.35, 0.8);
    if (near > 0) {
      GC.neon(g, () => { g.beginPath(); g.moveTo(fr.px + 30, fr.py); g.lineTo(fr.px + 30 - Math.cos(aF) * fr.L, fr.py - Math.sin(aF) * fr.L); g.stroke(); }, { cor: BP.amarelo, w: 2, dash: [6, 6], a: near });
      GC.rot(g, "12 KM", fr.px + 60, fr.py - Math.sin(aF) * fr.L / 2, { size: 54, cor: BP.amarelo, a: near });
      GC.rot(g, "POÇO DE KOLA", fr.px - 40, fr.py - 120, { size: 30, align: "center", a: near * 0.8 });
    }
    const far = ART.prog(t, 0.6, 1.0);
    if (far > 0) {
      g.save(); g.globalAlpha = far; ART.circ(g, fr.px, fr.py, 24); g.setLineDash([6, 6]); g.strokeStyle = BP.amarelo; g.lineWidth = 3; g.stroke(); g.restore();
      GC.rot(g, "12 KM", fr.px - 34, fr.py - 46, { size: 38, cor: BP.amarelo, align: "right", a: far });
    }
    // seta até o centro
    const sk = ART.prog(t, tQ + 0.15, tF - 0.05, "inOutCubic");
    if (sk > 0) {
      const ex = ART.lerp(fr.px, cx, sk), ey = ART.lerp(fr.py, cy, sk), ang = Math.atan2(cy - fr.py, cx - fr.px);
      GC.neon(g, () => { g.beginPath(); g.moveTo(fr.px, fr.py); g.lineTo(ex, ey); g.stroke(); g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - Math.cos(ang - 0.4) * 30, ey - Math.sin(ang - 0.4) * 30); g.moveTo(ex, ey); g.lineTo(ex - Math.cos(ang + 0.4) * 30, ey - Math.sin(ang + 0.4) * 30); g.stroke(); }, { cor: "#FFFFFF", w: 5 });
      ART.glow(g, ex, ey, 60, "#FFFFFF", 0.6);
    }
    const lk = Math.max(0, ART.prog(t, tF - 0.15, tF + 0.1, "outBack"));
    if (lk > 0) { g.save(); g.translate((fr.px + cx) / 2 - 24, (fr.py + cy) / 2 + 6); g.scale(lk, lk); ART.textFx(g, "6.371 KM", 0, 0, { size: 62, fam: "Lilita One", fill: "#FFFFFF", stroke: "#03121A", sw: 10, align: "right", shadow: "rgba(143,211,232,.5)", sblur: 20, sdy: 0 }); g.restore(); }
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
