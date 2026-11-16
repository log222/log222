/* p251 · "Quatro pepitas na mochila." (C7) — logo depois do "Apagou."
 * No escuro, quatro pepitas de cobre acendem uma a uma, em fila, cada uma no seu foco de luz, nos quatro plins
 * em escada; o contador de cobre conta 1 → 4 junto. Travelling lateral lento pela fila até o último quadro. */
MD.plano("p251", {
  async setup() { if (!window.GD_LOAD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js"); await GD_LOAD(); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, GD = window.GD, D = ctx.dur || 2.07;
    const ms = MD.marks(ctx, "moeda").sort((a, b) => a - b);
    const tq = GD.wt(ctx, "Quatro", 0.04);
    const ti = i => (ms[i] != null ? ms[i] : tq + 0.06 + i * 0.18);
    const dx = ART.map(t, 0, D, 50, -50, "linear");           // travelling da esquerda para a direita
    const z = ART.map(t, 0, D, 1.0, 1.05, "linear");
    g.fillStyle = ART.rg(g, 540, 820, 50, 1300, [[0, "#140F1C"], [1, "#040308"]]); g.fillRect(0, 0, 1080, 1920);
    g.save(); GC.cam(g, z, 540, 860, dx, 0);
    const X = [210, 430, 650, 870], Y = 820;
    let n = 0;
    for (let i = 0; i < 4; i++) {
      const on = ART.prog(t, ti(i) - 0.02, ti(i) + 0.12, "outCubic");
      if (t >= ti(i)) n = i + 1;
      const x = X[i], y = Y + 14 * Math.sin(t * 1.7 + i * 1.3);
      // foco de luz de cima + poça no chão
      if (on > 0) {
        ART.beam(g, x, 120, 40, 1080, 70, 210, "#FFB070", 0.22 * on);
        g.save(); g.translate(x, 1040); g.scale(1, 0.2); ART.glow(g, 0, 0, 170, "#FF9A3C", 0.45 * on); g.restore();
      }
      // a pepita já está lá no breu (silhueta quase invisível) e acende
      g.save(); g.globalAlpha = 0.12 + 0.88 * on;
      ART.obj.pepitaCobre(g, t * 0.8 + i * 0.9, { x, y, r: 92 * (0.85 + 0.15 * on), k: 0.05 + 0.9 * on });
      g.restore();
      const ps = ART.burst(t, { t0: ti(i), count: 10, x, y, speed: [120, 320], angle: [-170, -10], gravity: 300, life: [0.3, 0.6], seed: 251 + i, drag: 2 });
      g.save(); g.globalCompositeOperation = "lighter"; for (const q of ps) { g.globalAlpha = q.alpha; ART.circ(g, q.x, q.y, 2.5 + q.r * 3); g.fillStyle = "#FFD9A8"; g.fill(); } g.restore();
    }
    g.restore();
    // contador de cobre (ícone de cobre), conta com os plins
    const ck = ART.prog(t, ti(0) - 0.05, ti(0) + 0.15, "outBack");
    if (ck > 0.02) ART.ui.contador(g, 540, 1130, { valor: Math.max(1, n), icone: "cobre", s: 1.7 * ck, cor: "#FFB27A", pulso: GD.hit(t, ti(Math.max(0, n - 1)), 0.4) });
    ART.dust(g, t, { count: 30, seed: 25, color: "#FFD8B0", alpha: 0.35, size: [1.5, 4], x: 60, w: 960, y: 300, h: 900, speed: 18 });
    GC.post(g, ctx, { vinheta: 0.75, legendaK: 0.4 });
  },
});
