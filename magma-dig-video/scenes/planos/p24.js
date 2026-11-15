/* p24 · "E lá no centro faz uns seis mil graus." (C6)
 * Mesmo planeta do p23; empurrão até o núcleo, que acende de laranja a branco a partir de "centro". Termômetro ao lado
 * sobe até 6.000 °C em "seis mil"; o número entra grande. */
MD.plano("p24", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, BP = ART.BP, D = ctx.dur || 2.19;
    const tC = GC.wt(ctx, "centro", 0.43), tS = GC.wt(ctx, "seis", 1.15);
    const CX = 440, CY = 820, R = 330;
    const z = ART.map(t, 0, D, 1.0, 1.75, "inOutSine");
    const nk = ART.prog(t, tC, tS + 0.1, "inOutQuad") * (0.92 + 0.08 * Math.sin(t * 9));
    ART.blueprint(g, t);
    g.save(); GC.foco(g, z, ART.lerp(CX + 40, CX, ART.prog(t, 0, D)), CY, 440, 760);
    GC.planeta(g, t, { cx: CX, cy: CY, R, nucleo: nk, rotulos: 0, risco: 0 });
    // ondas de calor saindo do núcleo
    for (let i = 0; i < 3; i++) { const ph = ((t * 0.9 + i / 3) % 1); g.save(); g.globalAlpha = nk * (1 - ph) * 0.6; ART.circ(g, CX, CY, R * (0.19 + ph * 0.36)); g.strokeStyle = "#FFB548"; g.lineWidth = 3 / z; g.stroke(); g.restore(); }
    g.restore();
    // termômetro (tela)
    const TX = 870, TT = 380, TB = 1000, fill = ART.prog(t, tC - 0.1, tS, "inCubic");
    g.save();
    ART.rr(g, TX - 70, TT - 70, 140, TB - TT + 190, 40); g.fillStyle = "rgba(6,22,32,.88)"; g.fill();
    GC.neon(g, () => { ART.rr(g, TX - 70, TT - 70, 140, TB - TT + 190, 40); g.stroke(); }, { w: 2, cor: ART.BP.fraca, blur: 4 });
    ART.rr(g, TX - 26, TT - 26, 52, TB - TT + 52, 26); g.fillStyle = "rgba(6,26,38,.9)"; g.fill();
    GC.neon(g, () => { ART.rr(g, TX - 26, TT - 26, 52, TB - TT + 52, 26); g.stroke(); }, { w: 3 });
    ART.circ(g, TX, TB + 30, 46); g.fillStyle = ART.mix("#C2410C", "#FF7A1A", nk); g.fill();
    GC.neon(g, () => { ART.circ(g, TX, TB + 30, 46); g.stroke(); }, { w: 3 });
    const top = ART.lerp(TB, TT, fill);
    ART.rr(g, TX - 13, top, 26, TB + 30 - top, 13); g.fillStyle = ART.lg(g, 0, TT, 0, TB, [[0, "#FFF1C8"], [0.4, "#FFB548"], [1, "#E0561A"]]); g.fill();
    ART.glow(g, TX, top, 70, "#FFB548", 0.6 * fill);
    for (let i = 0; i <= 6; i++) { const yy = ART.lerp(TB, TT, i / 6); g.fillStyle = BP.fraca; g.fillRect(TX - 46, yy - 1.5, i % 3 === 0 ? 18 : 10, 3); }
    g.restore();
    const lk = Math.max(0, ART.prog(t, tS - 0.02, tS + 0.25, "outBack"));
    if (lk > 0) { g.save(); g.translate(470, 1180); g.scale(lk, lk); ART.textFx(g, "≈ 6.000 °C", 0, 0, { size: 124, fam: "Lilita One", fill: "#FFD08A", stroke: "#2A0E04", sw: 14, shadow: "rgba(255,150,60,.6)", sblur: 40, sdy: 0 }); g.restore(); }
    GC.post(g, ctx, { vinheta: 0.6, legendaK: 0.35 });
  },
});
