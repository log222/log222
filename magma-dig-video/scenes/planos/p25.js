/* p25 · "Tipo a superfície do Sol." (C6)
 * Tela dividida: o núcleo quente entra pela esquerda e o disco do Sol pela direita, mesma cor; os dois pulsam juntos.
 * Rótulos ≈ 6.000 °C × ≈ 5.500 °C. Câmera com empurrão lento. */
MD.plano("p25", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 1.79;
    const tA = GC.mark(ctx, "acorde", 0.05);
    const k = ART.prog(t, 0, 0.3, "outCubic");
    const z = ART.map(t, 0, D, 0.9, 0.96, "linear");
    ART.blueprint(g, t);
    // os dois discos deslizam para o lugar (desenho do kit em duas metades)
    for (const lado of [-1, 1]) {
      g.save(); GC.foco(g, z, 540, 860, 540, 860); g.translate(lado * 520 * (1 - k), 0);
      g.beginPath(); lado < 0 ? g.rect(-600, 0, 1140, 1920) : g.rect(540, 0, 1140, 1920); g.clip();
      GC.semFundo(() => ART.ciencia.nucleoSol(g, t, { k: 0.35 + 0.65 * ART.prog(t, tA, tA + 0.4) }));
      g.restore();
    }
    ART.glow(g, 540, 860, 520, "#FFB548", 0.25 * ART.pulse(t, tA, 0.6));
    const ek = Math.max(0, ART.prog(t, GC.wt(ctx, "superfície", 0.57), GC.wt(ctx, "superfície", 0.57) + 0.25, "outBack"));
    if (ek > 0) { g.save(); g.translate(540, 840); g.scale(ek, ek); ART.circ(g, 0, 0, 52); g.fillStyle = "rgba(6,26,38,.92)"; g.fill(); GC.neon(g, () => { ART.circ(g, 0, 0, 52); g.stroke(); }, { w: 3 }); ART.textFx(g, "≈", 0, 4, { size: 80, fam: "Lilita One", fill: "#FFD08A", stroke: null, sw: 0, shadow: null }); g.restore(); }
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
