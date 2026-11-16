/* p226 · "Em três anos, caiu quase noventa por cento." (C6)
 * O ×6 e as moedas saem; em "caiu" a linha despenca do pico (vira coral) e o contador corre 1929 → 1932; chega a 41
 * em "noventa", com baque, tremor e o −89% coral. A câmera recua (de 1,075 a 1) seguindo a queda. */
MD.plano("p226", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, GL = ART.ciencia.grafLinha, S = GD.WS(), D = ctx.dur || 3.8;
    const tC = GD.wt(ctx, "caiu", D * 0.37), tB = GD.mark(ctx, "boom", GD.wt(ctx, "noventa", D * 0.58));
    const prog = ART.lerp(GL.PICO, 1, ART.prog(t, tC - 0.12, tB, "inQuad"));
    const sai = 1 - ART.prog(t, 0.0, 0.35);
    const z = ART.lerp(S.Z225, 1, ART.prog(t, 0, tB, "inOutSine"));
    const sh = GC.shake(t, tB, 0.35, 16, 26);
    GD.bp(g, t);
    GD.graf(g, t, { textoEscala: GD.TE, posQueda: GD.QUEDA, prog, eixoAnos: { 1921: 1, 1925: 1, 1929: 1, 1932: ART.prog(prog, GL.anoProg(1931.85), GL.anoProg(1932.2)) }, regua: 1, wallStreet: 1, contador: true, x6: sai, emprestado: sai, queda: ART.prog(t, tB, tB + 0.35), zoom: z, foco: S.FOCO }, { dx: sh.x, dy: sh.y });
    const fl = GD.hit(t, tB, 0.5);
    if (fl > 0.02) ART.glow(g, 880, 470, 420, "#FF6B5B", 0.3 * fl);
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
