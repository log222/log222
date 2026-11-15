/* p13 · "Mas chegou com uma picareta velha e nenhuma moeda." (C7)
 * A) picareta velha (ferrugem, cabo rachado e remendado) girando devagar no holofote, empurrão; em "velha" uma lasca
 *    de ferrugem cai. B) corte interno em "nenhuma": a pata do Zeca vira o saquinho de moedas e chacoalha: só poeira.
 *    O contador "0" entra em "moeda". */
MD.plano("p13", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 3.03;
    const tV = GC.wt(ctx, "velha", 1.53), tN = GC.wt(ctx, "nenhuma", 2.01) - 0.06, tM = GC.wt(ctx, "moeda", 2.49);
    if (t < tN) {
      const z = ART.map(t, 0, tN, 0.94, 1.08, "inOutSine");
      ART.holofote(g, t, { chao: 1240, cor: "#E8D8C0", k: 0.85 });
      g.save(); GC.cam(g, z, 540, 820);
      // sombra no chão
      g.save(); g.translate(560, 1240); g.scale(1, 0.15); ART.glow(g, 0, 0, 320, "#000000", 0.6, "source-over"); g.restore();
      ART.obj.picaretaVelha(g, t, { x: 540, y: 900, s: 4.3, giro: 0.5 + t * 0.9 });
      // ferrugem caindo em "velha" + rangido (rachar)
      const ps = ART.burst(t, { t0: tV, count: 14, x: 470, y: 330, speed: [20, 120], angle: [60, 120], gravity: 900, life: [0.6, 1.1], seed: 8 });
      for (const q of ps) { g.globalAlpha = q.alpha; ART.circ(g, q.x, q.y, 3 + q.r * 5); g.fillStyle = "#9A4A1E"; g.fill(); }
      g.globalAlpha = 1;
      g.restore();
    } else {
      const u = t - tN;
      const z = ART.map(u, 0, D - tN, 1.0, 1.06);
      ART.holofote(g, t, { chao: 1250, cor: "#E8D8C0", k: 0.7 });
      g.save(); GC.cam(g, z, 540, 800);
      const shake = Math.sin(u * 38) * 24 * ART.prog(u, 0.05, 0.2) * (1 - ART.prog(u, 0.7, 1.0));
      const BX = 520 + shake, BY = 720;
      // saquinho de cabeça pra baixo, segurado pelo fundo pela pata (vem do alto à direita)
      g.save(); g.translate(BX, BY); g.rotate(Math.PI + 0.08 * Math.sin(u * 38) * ART.prog(u, 0.05, 0.2));
      ART.obj.saquinho(g, t, { x: 0, y: 0, s: 2.2, virado: 0 });
      g.restore();
      ART.pata(g, BX + 30, BY - 170, -40, { s: 0.9, dedos: "segura" });
      // só poeira sai da boca do saco
      for (let i = 0; i < 3; i++) {
        const ps = ART.burst(t, { t0: tN + 0.1 + i * 0.18, count: 26, x: BX, y: BY + 215, speed: [30, 160], angle: [65, 115], gravity: 200, life: [0.9, 1.5], seed: 20 + i, spread: 0.15, w: 120 });
        for (const q of ps) { g.globalAlpha = q.alpha * 0.6; ART.circ(g, q.x, q.y, 5 + q.r * 12); g.fillStyle = "#C8B89A"; g.fill(); }
      }
      g.globalAlpha = 1;
      g.restore();
      const ck = Math.max(0, ART.prog(t, tM - 0.08, tM + 0.15, "outBack"));
      if (ck > 0.06) ART.ui.contador(g, 540, 1100, { valor: 0, s: 2.1 * ck, pulso: ART.pulse(t, tM, 0.3) });
    }
    GC.post(g, ctx, { vinheta: 0.65, legendaK: 0.4 });
  },
});
