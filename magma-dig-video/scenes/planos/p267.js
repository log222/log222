/* p267 · CHAMADA · "Curte pra parte três." (C7) — fecha o círculo do p201 (como o p57 fecha o p01).
 * Mesmo enquadramento do p201: Zeca de frente, lanterna acesa no breu, câmera se afastando devagar. Em "Curte" ele
 * sorri pra câmera; depois de "três" a lanterna apaga e sobram os olhos, que piscam e fecham no último quadro. */
MD.plano("p267", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, D = ctx.dur || 2.2;
    const tCurte = GD.wt(ctx, "Curte", 0.04), fim3 = GD.wf(ctx, "tres", Math.min(D - 0.6, 1.64));
    // apaga no clique/apagar que vier depois da fala; senão logo depois de "três"
    const depois = nome => MD.marks(ctx, nome).filter(m => m > fim3 - 0.3).sort((a, b) => a - b)[0];
    const tOff = Math.min(D - 0.35, depois("apagar") ?? depois("clique") ?? fim3 + 0.12);
    const on = t < tOff ? 1 : ART.kf(t - tOff, [[0, 0.12], [0.04, 0.4], [0.08, 0]]);
    const z = ART.kf(t, [[0, 1.12], [tOff, 1.03, "outSine"], [D, 0.99]]);
    const feliz = ART.prog(t, tCurte + 0.1, tCurte + 0.3);
    const fecha = ART.prog(t, D - 0.28, D - 0.06);
    const pisca = ART.pulse(t, tOff + 0.22, 0.14);
    GD.lanterna(g, t, ctx, {
      on, z, eyes: feliz > 0.5 && t < tOff ? "feliz" : "aberto", mouth: feliz > 0.5 ? "sorriso" : "neutro",
      headTilt: -2 + 5 * ART.pulse(t, tCurte + 0.1, 0.5), blink: on > 0.02 ? 0 : Math.max(fecha, pisca), fecha: on > 0.02 ? 0 : fecha * 0.9,
    });
    GC.post(g, ctx, { vinheta: 0.7, legendaK: 0.35 });
  },
});
