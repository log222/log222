/* p12 · "Cavar, tatu já nasce sabendo." (C6 ciência)
 * Blueprint: um tatu de verdade se desenha em linhas ciano (lateral); em "tatu" as garras da frente acendem em amarelo
 * e começam a cavar, jogando terra; etiqueta GARRAS DE CAVAR. Câmera desliza da cauda para as garras. */
MD.plano("p12", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 2.07;
    const tT = GC.wt(ctx, "tatu", 0.6);
    const prog = ART.prog(t, 0, tT + 0.15, "outCubic");
    const gar = Math.max(0, ART.prog(t, tT, tT + 0.3, "outBack"));
    const z = ART.map(t, 0, D, 1.08, 1.16, "inOutSine"), dx = ART.map(t, 0, D, -60, 10, "inOutSine");
    ART.blueprint(g, t);
    g.save(); GC.foco(g, z, 640 + dx, 960, 540, 930);
    GC.semFundo(() => ART.ciencia.tatu(g, t, { prog, garras: gar }));
    // terra se acumulando sob as garras
    const pile = ART.prog(t, tT, D, "outCubic");
    if (pile > 0) GC.neon(g, () => { g.beginPath(); g.moveTo(650, 1160); g.quadraticCurveTo(800, 1160 - 70 * pile, 950, 1160); g.stroke(); }, { cor: ART.BP.linha, w: 2.5, a: 0.8 });
    g.restore();
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.3 });
  },
});
