/* p57 · CHAMADA · "Curte pra parte dois." (C7) — fecha o círculo do p01.
 * Mesmo enquadramento do p01 (Zeca de frente, lanterna acesa no breu), câmera se afastando devagar. Em "Curte" ele
 * sorri pra câmera; depois de "dois" o clique: a lanterna apaga, sobram os olhos brilhando, que piscam e somem. */
MD.plano("p57", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 2.58;
    const tCurte = GC.wt(ctx, "Curte", 0.04), fimDois = GC.wf(ctx, "dois.", 1.45);
    // apaga NO QUADRO do clique (ctx.marks) que vem depois da fala; senão no "apagar"; senão logo após "dois"
    const depois = nome => MD.marks(ctx, nome).filter(m => m > fimDois - 0.3).sort((a, b) => a - b)[0];
    const tOff = depois("clique") ?? depois("apagar") ?? Math.min(D - 0.6, fimDois + 0.12);
    const on = t < tOff ? 1 : ART.kf(t - tOff, [[0, 0.12], [0.04, 0.4], [0.08, 0]]);
    const z = ART.kf(t, [[0, 1.12], [tOff, 1.03, "outSine"], [D, 0.99]]);
    const LX = 540, LY = 470, S = 6.2, CX = 540, CY = 900;   // mesmo enquadramento do p01
    const feliz = ART.prog(t, tCurte + 0.1, tCurte + 0.3);
    g.save();
    GC.breu(g, t, { x: LX, y: LY, c0: ART.mix("#07060B", "#1C1626", on), c1: "#030206" });
    GC.cam(g, z, CX, CY);
    const pose = ART.zeca.pose("parado", t + 3, { x: 540, y: LY + 201 * S, s: S, turn: 0, camera: 1, look: [0, 0.05], eyes: feliz > 0.5 && t < tOff ? "feliz" : "aberto", mouth: feliz > 0.5 ? "sorriso" : "neutro", blink: 0, headTilt: -2 + 5 * ART.pulse(t, tCurte + 0.1, 0.5) });
    let anc;
    if (on > 0.02) anc = GC.zecaNoEscuro(g, pose, { escuro: ART.lerp(1, 0.8, on), raio: 1000, rimK: on, apagado: 0.97 * (1 - Math.min(1, on * 3)) });
    else {
      // no breu, só os olhos; eles piscam e fecham no fim
      const fecha = ART.prog(t, D - 0.35, D - 0.15);
      const pisca = ART.pulse(t, tOff + 0.45, 0.16);
      anc = ART.zeca.drawEscuro(g, Object.assign({}, pose, { eyes: "aberto", blink: Math.max(fecha, pisca) }), 1, { cor: "#FFE6A8" });
      if (fecha > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(3,2,6,${fecha})`; g.fillRect(0, 0, 1080, 1920); g.restore(); }
    }
    g.restore();
    const lp = anc.lanterna || { x: LX, y: LY };
    if (on > 0.02) GC.lampada(g, t, lp.x, lp.y, S * 13 * z * 0.55, on, {});
    ART.dust(g, t, { count: 70, seed: 11, color: "#FFF0C8", alpha: 0.9 * on, size: [2, 6], x: 40, w: 1000, y: 150, h: 1100, speed: 30 });
    GC.post(g, ctx, { vinheta: 0.7, legendaK: 0.35 });
  },
});
