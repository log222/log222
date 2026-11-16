/* p223 · "Em mil novecentos e vinte e nove," (C6)
 * WALL STREET · NOVA YORK no alto; a linha de preço se desenha e o contador de anos na ponta corre 1921 → 1929,
 * travando em 1929 na palavra "nove". Zoom-out contínuo revelando o gráfico inteiro (termina em zoom 1 = começo do p224). */
MD.plano("p223", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, GL = ART.ciencia.grafLinha, S = GD.WS(), D = ctx.dur || 2.56;
    const tN = GD.wt(ctx, "nove", D * 0.8, 0);
    const p29 = GL.anoProg(1929);
    const prog = t < tN ? ART.lerp(0.004, p29, ART.prog(t, 0.08, tN, "inOutSine")) : ART.lerp(p29, S.P223, ART.prog(t, tN, D));
    const z = ART.lerp(S.Z223, 1, ART.prog(t, 0, D, "inOutSine"));
    const trava = GD.hit(t, tN, 0.4);
    GD.bp(g, t);
    const r = GD.graf(g, t, { prog, regua: 0, wallStreet: ART.prog(t, 0.05, 0.45), contador: true, zoom: z, foco: S.FOCO0 });
    if (trava > 0.02 && r.ponta) ART.glow(g, r.ponta[0], (1072 - S.FOCO0[1]) * z + S.FOCO0[1], 200, "#E8FAFF", 0.35 * trava);
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
