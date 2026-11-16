/* p255 · C5 Mercado · "Quatro pepitas, duzentos e quarenta."
 * Mesmo painel (Cobre HOJE PAGA 60, faixa COBRE +50%). Nos quatro plins do "Quatro" quatro pepitas de cobre entram
 * deslizando pela esquerda e se alinham logo acima do botão VENDER, com "×4" ao lado. No "duzentos" o botão estoura
 * e vira VENDER +240 moedas (acorde), com moedinhas e brilho; as pepitas brilham. Câmera contínua acompanha a fila. */
MD.plano("p255", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, u = ART.ui, { clamp } = G, D = ctx.dur;
    const tau = G.N4.T0.p255 + t;
    const ms = MD.marks(ctx, "moeda").slice().sort((a, b) => a - b), tQ = G.wt(ctx, "quatro", 0.04);
    const ti = i => (ms[i] != null ? ms[i] : tQ + 0.05 + i * 0.15);
    const tDuz = G.mark(ctx, "acorde", G.wt(ctx, "duzentos", 1.49));
    const pD = G.hit(t, tDuz, 0.7);
    G.fundoN4(g, tau, 1);
    const cam = G.camN4(tau);
    cam.cy += pD * 6 * Math.sin(t * 50);
    const X = [370, 495, 620, 745], Y = 1030;
    G.painel(g, cam, gg => {
      ART.glow(gg, 540, 412, 560, "#FFC531", 0.2);
      G.mercadoN4(gg, t, { rola: 1, hoje: 0.98, faixa: { minerio: "cobre", nome: "Cobre", k: 1, mk: 1 },
        sub: t >= tDuz ? "+240 moedas" : "+60 moedas", pulso: t >= tDuz ? 0.6 + 0.4 * pD : 0 });
      // fila de pepitas acima do botão
      let n = 0;
      for (let i = 0; i < 4; i++) {
        const k = ART.ease.outCubic(clamp((t - ti(i) + 0.12) / 0.3)); if (k <= 0) continue; if (t >= ti(i)) n = i + 1;
        const x = ART.lerp(-120, X[i], k), y = Y - Math.sin(Math.PI * k) * 40 + 4 * Math.sin(t * 2.4 + i);
        gg.save(); gg.translate(x, y); gg.rotate((1 - k) * -2.2);
        ART.glow(gg, 0, 0, 90, "#FF9A3C", 0.35 + 0.4 * pD + 0.3 * G.hit(t, ti(i), 0.4));
        ART.obj.pepitaCobre(gg, t * 0.7 + i, { x: 0, y: 0, r: 52, k: 1 });
        gg.restore();
      }
      if (n > 0) {
        const kx = ART.ease.outBack(clamp((t - ti(0)) / 0.25)), sx = 1 + 0.25 * G.hit(t, ti(n - 1), 0.3);
        gg.save(); gg.translate(235, Y); gg.scale(kx * sx, kx * sx);
        G.txt(gg, "×" + n, 0, 0, { size: 84, fill: "#FFB27A", stroke: "#2A1408", sw: 10 }); gg.restore();
      }
      if (pD > 0) ART.glow(gg, 540, 1160, 420, "#FFF2A6", 0.6 * pD);
      if (t > tDuz) for (const p of ART.burst(t, { t0: tDuz, count: 18, x: 540, y: 1120, speed: [350, 800], angle: [-165, -15], gravity: 1500, life: [0.5, 0.9], seed: 255 })) u.moeda(gg, p.x, p.y, 15, p.rot * 0.05 + p.i, {});
    });
    G.fim(g, tau, ctx);
  },
});
