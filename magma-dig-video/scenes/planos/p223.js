/* p223 · "Em mil novecentos e vinte e nove," (C6)
 * A linha de preço se desenha e o contador de anos na ponta gira como odômetro desde o primeiro quadro (o dígito das
 * unidades rola sem parar) e trava em 1929 na palavra "nove". Os anos do eixo só acendem quando a linha passa por eles
 * (1921 no começo, 1925 na passagem, 1929 ao travar). WALL STREET entra no p224, na palavra "Wall".
 * Zoom-out contínuo revelando o gráfico inteiro (termina em zoom 1 = começo do p224). */
MD.plano("p223", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, GL = ART.ciencia.grafLinha, S = GD.WS(), D = ctx.dur || 2.56;
    const tN = GD.wt(ctx, "nove", D * 0.8, 0);
    // ano contínuo: corre desde o 1º quadro (já em movimento) e chega a 1929 em "nove"; depois anda devagar (1929,06)
    const v = t < tN ? ART.lerp(1921.15, 1929, ART.prog(t, 0, tN, "outSine")) : ART.lerp(1929, 1929.06, ART.prog(t, tN, D));
    const prog = GL.anoProg(Math.max(v, 1921.62));
    const z = ART.lerp(S.Z223, 1, ART.prog(t, 0, D, "inOutSine"));
    const trava = GD.hit(t, tN, 0.4);
    const eixo = { 1921: ART.prog(t, 0, 0.25), 1925: ART.prog(v, 1925, 1925.35), 1929: ART.prog(t, tN, tN + 0.2) };
    GD.bp(g, t);
    const r = GD.graf(g, t, { textoEscala: GD.TE, posQueda: GD.QUEDA, eixoAnos: eixo, prog, regua: 0, wallStreet: 0, contador: false, zoom: z, foco: S.FOCO0 });
    // ponta da linha em coordenadas do gráfico (desfaz zoom/foco)
    const tipX = r.ponta ? (r.ponta[0] - S.FOCO0[0]) / z + S.FOCO0[0] : 200 + 0.6 / 10.92 * 700;
    const tipY = r.ponta ? (r.ponta[1] - S.FOCO0[1]) / z + S.FOCO0[1] : 900;
    // odômetro: depois de travar, mostra 1929 parado (a ponta segue respirando)
    GD.odometro(g, t < tN ? v : 1929, tipX, tipY, z, S.FOCO0);
    if (trava > 0.02) ART.glow(g, (Math.min(Math.max(tipX, 240), 880) - S.FOCO0[0]) * z + S.FOCO0[0], (1072 - S.FOCO0[1]) * z + S.FOCO0[1], 200, "#E8FAFF", 0.35 * trava);
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
