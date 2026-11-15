/* p22 · "Levou quase vinte anos." (C6)
 * Enquadramento mais fechado no cartão ANOS DE OBRA ao lado do furo: o contador roda 1970 → 1989 no tique-taque e,
 * em "vinte", trava; embaixo entra "19 ANOS" em amarelo. */
MD.plano("p22", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 1.64;
    const tV = GC.wt(ctx, "vinte", 0.74);
    const anos = ART.prog(t, 0.02, tV, "inOutSine");
    const z = ART.map(t, 0, D, 1.42, 1.5, "linear");
    const trava = ART.pulse(t, tV, 0.25);
    ART.blueprint(g, t);
    g.save(); GC.foco(g, z, 450, 1030, 520, 760);
    GC.semFundo(() => ART.ciencia.crosta(g, t, { furo: 1, regua: 1, t12: 99, anos, y0: 470, y1: 1230, rotulo: 0 }));
    ART.glow(g, 305, 1145, 260, "#E8FAFF", 0.35 * trava);
    const k = Math.max(0, ART.prog(t, tV + 0.05, tV + 0.3, "outBack"));
    if (k > 0) { g.save(); g.translate(305, 1240); g.scale(k, k); ART.textFx(g, "19 ANOS", 0, 0, { size: 64, fam: "Lilita One", fill: ART.BP.amarelo, stroke: "#03121A", sw: 10, shadow: "rgba(235,186,64,.45)", sblur: 24, sdy: 0 }); g.restore(); }
    g.restore();
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
