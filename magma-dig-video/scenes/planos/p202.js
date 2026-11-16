/* p202 · GANCHO · "só um dia" (C7) — só 0,56 s.
 * Calendário de 30 quadradinhos no holofote, dois dias já cheios; no baque (em "dia") o terceiro se preenche e a folha
 * balança. Push-in contínuo do primeiro ao último quadro. */
MD.plano("p202", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, D = ctx.dur || 0.56;
    const tB = GD.mark(ctx, "boom", GD.wt(ctx, "dia", D * 0.6));
    const fill = 2 + ART.prog(t, tB - 0.06, tB + 0.08);
    const bate = GD.hit(t, tB, 0.5);
    const z = ART.map(t, 0, D, 0.97, 1.09, "linear");
    ART.holofote(g, t, { chao: 1290, cor: "#FFE2B0", k: 0.75 + 0.2 * bate });
    g.save(); GC.cam(g, z, 540, 860, 0, 6 * bate);
    // a folha balança presa no alto (pivô na argola do topo)
    const rot = ART.deg(-2 + 3.5 * bate * Math.sin((t - tB) * 26));
    g.translate(540, 470); g.rotate(rot); g.translate(-540, -470);
    ART.obj.calendario(g, t, { x: 540, y: 860, preenchido: fill });
    // brilho no quadradinho 3 (coluna 2, linha 0)
    if (bate > 0.02) ART.glow(g, 540 - 300 + 240, 860 - 160, 160, "#FFD23F", 0.6 * bate);
    g.restore();
    GC.post(g, ctx, { vinheta: 0.7, legendaK: 0.4 });
  },
});
