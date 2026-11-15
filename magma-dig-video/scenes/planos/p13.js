/* p13 · "Mas chegou com uma picareta velha e nenhuma moeda." (C7)
 * A) picareta velha (ferrugem, cabo rachado e remendado) girando devagar no holofote, empurrão; em "velha" uma lasca
 *    de ferrugem cai. B) corte interno em "nenhuma": a pata do Zeca vira o saquinho de moedas e chacoalha: só poeira.
 *    O contador "0" entra em "moeda". */
/** bolsa de moedas em pé (boca para cima em y≈-150), desenhada local; vira de cabeça pra baixo com rotate(π) */
function bolsa(g, ART) {
  // corpo arredondado
  g.save(); g.shadowColor = "rgba(0,0,0,.5)"; g.shadowBlur = 30; g.shadowOffsetY = 12;
  g.beginPath(); g.moveTo(-36, -92); g.bezierCurveTo(-150, -60, -160, 110, -60, 130); g.lineTo(60, 130); g.bezierCurveTo(160, 110, 150, -60, 36, -92); g.closePath();
  g.fillStyle = ART.lg(g, -140, -80, 140, 130, [[0, "#C8925A"], [1, "#6A4224"]]); g.fill(); g.restore();
  // dobras do tecido
  g.strokeStyle = "rgba(60,30,14,.35)"; g.lineWidth = 5; g.lineCap = "round";
  for (const [x0, x1] of [[-30, -70], [10, 0], [40, 80]]) { g.beginPath(); g.moveTo(x0, -80); g.quadraticCurveTo((x0 + x1) / 2 - 10, 0, x1, 70); g.stroke(); }
  // moeda estampada
  ART.ui.pix(g, "moeda", 0, 30, 92);
  // pescoço amarrado + babado da boca (aberta)
  ART.rr(g, -40, -112, 80, 26, 10); g.fillStyle = "#7A4A26"; g.fill();
  g.strokeStyle = "#E0B060"; g.lineWidth = 7; g.beginPath(); g.moveTo(-42, -99); g.quadraticCurveTo(0, -90, 42, -99); g.stroke();
  g.beginPath(); g.moveTo(30, -96); g.quadraticCurveTo(70, -60, 60, -20); g.stroke();
  g.beginPath(); g.moveTo(-34, -112); for (let i = 0; i <= 6; i++) g.lineTo(-70 + i * 23.3, -150 - (i % 2) * 14); g.lineTo(34, -112); g.closePath();
  g.fillStyle = "#B07A48"; g.fill();
  ART.ell(g, 0, -150, 66, 18); g.fillStyle = "#24140A"; g.fill();
}
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
      const shake = Math.sin(u * 38) * 24 * ART.pulse(u % 0.9, 0.04, 0.6);   // chacoalha em sacudidas, até o fim do plano
      const BX = 520 + shake, BY = 640;
      // bolsa de moedas (com a moeda estampada) de cabeça pra baixo, boca aberta pra baixo; a pata segura pelo fundo
      g.save(); g.translate(BX, BY); g.rotate(Math.PI + 0.1 * Math.sin(u * 38) * ART.pulse(u % 0.9, 0.04, 0.6)); g.scale(1.55, 1.55);
      bolsa(g, ART);
      g.restore();
      ART.pata(g, BX + 40, BY - 230, -50, { s: 0.85, dedos: "segura" });
      // só poeira sai da boca do saco
      for (let i = 0; tN + 0.1 + i * 0.18 < D; i++) {
        const ps = ART.burst(t, { t0: tN + 0.1 + i * 0.18, count: 26, x: BX, y: BY + 250, speed: [30, 160], angle: [65, 115], gravity: 200, life: [0.9, 1.5], seed: 20 + (i % 5), spread: 0.15, w: 120 });
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
