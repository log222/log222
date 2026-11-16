/* p229 · "Vinte e dois por cento." (C6) — fim do inserto.
 * Em "Vinte" o −22,6% coral cresce sobre o degrau; push-in no número; depois as linhas ciano se apagam (o número
 * coral fica) e o azul-petróleo dá lugar à Toca no escuro, de volta ao painel (p230). */
MD.plano("p229", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, GB = window.GB, S = GD.WS(), D = ctx.dur || 1.7;
    const tV = GD.wt(ctx, "Vinte", 0.04);
    const z = ART.lerp(1, S.Z229, ART.prog(t, 0, D, "outSine"));
    const apaga = ART.prog(t, Math.max(tV + 0.6, D - 0.8), D - 0.15);
    const volta = ART.prog(t, D - 0.5, D - 1 / 30, "inOutSine");   // último quadro = Toca desfocada cheia (início do p230)
    GD.bp(g, t);
    GD.graf(g, t, { textoEscala: GD.TE, posQueda: GD.QUEDA, prog: 1, regua: 1, wallStreet: 1, contador: true, queda: 1, pan: 1, rotulo87: 1, prog87: 1, segunda: 1, queda87: ART.prog(t, tV, tV + 0.4), apaga, zoom: z, foco: S.FOCO229 });
    if (volta > 0) GD.tocaDesfocada(g, t, volta);
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
