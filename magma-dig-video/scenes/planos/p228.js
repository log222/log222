/* p228 · "a queda foi num dia só." (C6)
 * A linha de outubro de 1987 anda e, em "dia" (baque), cai num degrau quase vertical; o calendário 1 DIA e
 * SEGUNDA-FEIRA NEGRA entram no mesmo instante, com tremor; depois a linha segue até o fim do mês. */
MD.plano("p228", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, S = GD.WS(), D = ctx.dur || 2.1;
    const tD = GD.mark(ctx, "boom", GD.wt(ctx, "dia", D * 0.52));
    let p87;
    if (t < tD - 0.04) p87 = ART.lerp(S.P87A, 0.716, ART.prog(t, 0, tD - 0.04, "inOutSine"));
    else if (t < tD + 0.08) p87 = ART.lerp(0.716, 0.742, ART.prog(t, tD - 0.04, tD + 0.08));
    else p87 = ART.lerp(0.742, 1, ART.prog(t, tD + 0.08, D - 0.05, "outSine"));
    const sh = GC.shake(t, tD, 0.3, 14, 28);
    GD.bp(g, t);
    GD.graf(g, t, { prog: 1, regua: 1, wallStreet: 1, contador: true, queda: 1, pan: 1, rotulo87: 1, prog87: p87, segunda: ART.prog(t, tD, tD + 0.35) }, { dx: sh.x, dy: sh.y });
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
