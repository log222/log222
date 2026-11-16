/* p224 · "Wall Street tinha subido seis vezes." (C6)
 * A linha sobe forte até o pico de 1929; a régua aparece (63 embaixo) e o 381 marca o topo quando a ponta chega lá;
 * em "seis" entra o ×6. Empurrão lento contínuo (continua no p225). */
MD.plano("p224", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, GL = ART.ciencia.grafLinha, S = GD.WS(), D = ctx.dur || 3.15;
    const tS = GD.wt(ctx, "seis", D * 0.6);
    const prog = ART.lerp(S.P223, GL.PICO, ART.prog(t, 0.1, Math.max(0.6, tS - 0.05), "inQuad"));
    const z = ART.lerp(1, S.Z224, ART.prog(t, 0, D));
    GD.bp(g, t);
    GD.graf(g, t, { prog, regua: ART.prog(t, 0.0, 0.5), wallStreet: 1, contador: true, x6: ART.prog(t, tS, tS + 0.4), zoom: z, foco: S.FOCO });
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
