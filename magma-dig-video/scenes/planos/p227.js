/* p227 · "Em oitenta e sete," (C6)
 * Pan lateral para a direita: o gráfico de 1929 sai pela esquerda e um segundo gráfico ciano se desenha;
 * 1987 / OUTUBRO entra em "oitenta". Termina com o 2º gráfico em 0,55 (o p228 continua). */
MD.plano("p227", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, S = GD.WS(), D = ctx.dur || 1.63;
    const tO = GD.wt(ctx, "oitenta", 0.36);
    GD.bp(g, t);
    GD.graf(g, t, { textoEscala: GD.TE, posQueda: GD.QUEDA, prog: 1, regua: 1, wallStreet: 1, contador: true, queda: 1, pan: ART.prog(t, 0.0, D - 0.12), rotulo87: ART.prog(t, tO - 0.03, tO + 0.3), prog87: S.P87A * ART.prog(t, tO, D) });
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
