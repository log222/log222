/* p225 · "Muita gente comprou com dinheiro emprestado." (C6)
 * No pé do gráfico entram as moedas em linhas: 1 cheia (PRÓPRIO) e 9 tracejadas; EMPRESTADO aparece na palavra.
 * Empurrão contínuo (vem do p224). A ponta da linha continua brilhando no pico. */
MD.plano("p225", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, GL = ART.ciencia.grafLinha, S = GD.WS(), D = ctx.dur || 2.99;
    const tE = GD.wt(ctx, "emprestado", D * 0.65);
    const a = 0.15, b = Math.min(D - 0.1, a + (tE - a) / 0.6);   // emprestado = 0,6 (rótulo começa) em "emprestado"
    const em = ART.prog(t, a, b);
    const z = ART.lerp(S.Z224, S.Z225, ART.prog(t, 0, D));
    GD.bp(g, t);
    GD.graf(g, t, { prog: GL.PICO, regua: 1, wallStreet: 1, contador: true, x6: 1, emprestado: em, zoom: z, foco: S.FOCO });
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
