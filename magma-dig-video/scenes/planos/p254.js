/* p254 · C5 Mercado · "Sessenta moedas cada."
 * Mesmo painel (câmera contínua). No "Sessenta" o 20 de ontem leva o risco e o número rola para cima até 60 (pousa
 * ainda dentro da palavra); a barra de hoje sobe acima de todas. No "moedas" o 60 estoura com moedinhas.
 * Sem % no cartão (o +50% fica só na faixa). O botão continua VENDER sem valor (o total entra no p255). */
MD.plano("p254", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, u = ART.ui, { clamp } = G;
    const tau = G.N4.T0.p254 + t;
    const tS = G.wt(ctx, "sessenta", 0.04), tM = G.mark(ctx, "moeda", G.wt(ctx, "moedas", 0.68)), tCada = G.wt(ctx, "cada", 1.4);
    const fimS = G.wf(ctx, "sessenta", 0.68), pouso = Math.min(fimS - 0.1, tS + 0.5);
    // rola: 0–0,3 risco no 20 · 0,3–0,85 sobe até 60 (pousa antes do fim do "Sessenta")
    const rk = t < tS ? 0 : t < tS + 0.1 ? 0.3 * (t - tS) / 0.1 : 0.3 + 0.55 * clamp((t - tS - 0.1) / (pouso - tS - 0.1)) + 0.15 * clamp((t - pouso) / 0.4);
    const hoje = 0.98 * ART.ease.outBack(clamp((t - tS - 0.05) / (pouso - tS)));
    const pM = G.hit(t, tM, 0.5), pC = G.hit(t, tCada, 0.6);
    G.fundoN4(g, tau, 1);
    const cam = G.camN4(tau);
    cam.cy += pM * 6 * Math.sin(t * 50);
    G.painel(g, cam, gg => {
      ART.glow(gg, 540, 412, 560, "#FFC531", 0.2);
      const c = G.mercadoN4(gg, t, { rola: rk, hoje, faixa: { minerio: "cobre", nome: "Cobre", k: 1, mk: 1 } });
      const s = 1.4, px = c.x0 + c.w - 36 * s - 80, py = c.y0 + 270 * s;
      if (pM > 0) ART.glow(gg, px, py, 320, "#FFD23F", 0.7 * pM);
      if (pC > 0) ART.glow(gg, px, py, 260, "#FFD23F", 0.35 * pC);
      if (t > tM) for (const p of ART.burst(t, { t0: tM, count: 14, x: px, y: py, speed: [300, 700], angle: [-170, -10], gravity: 1500, life: [0.4, 0.8], seed: 254 })) u.moeda(gg, p.x, p.y, 14, p.rot * 0.05 + p.i, {});
    });
    G.fim(g, tau, ctx);
  },
});
