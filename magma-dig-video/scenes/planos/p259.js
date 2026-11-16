/* p259 · C5 Clientes · "A Dona Coruja quer quatro cobres."
 * Começa no recorte real da aba CLIENTES (o mesmo do fim do p258, sem preto) e dissolve em ~0,3 s para o cartão redesenhado. Retrato da Dona Coruja de óculos,
 * simpática: no "Coruja" ela pisca e o retrato brilha. O pedido só aparece no "quatro": 4/4 Cobre (o Zeca tem as
 * quatro pepitas); no "cobres" o ícone do cobre pulsa. A recompensa ainda está escondida (entra no p260).
 * ENTREGAR cinza, como no jogo. Empurrão lento no retrato (continua no p260). */
MD.plano("p259", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); await ART.gameplay.preloadShot("shot_5"); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, { clamp } = G, D = ctx.dur;
    const tCor = G.wt(ctx, "coruja", 0.44), tQ = G.wt(ctx, "quatro", 1.48), tCob = G.wt(ctx, "cobres", 1.88);
    const k = ART.ease.inOutSine(clamp(t / D));
    const pis = (() => { const d = t - tCor - 0.05; return d > 0 && d < 0.2 ? Math.sin(d / 0.2 * Math.PI) : null; })();
    const rev = clamp((t - tQ + 0.02) / 0.12), pQ = G.hit(t, tQ, 0.6), pC = G.hit(t, tCob, 0.6), pR = G.hit(t, tCor, 0.8);
    G.fundo(g, t, { dx: ART.map(t, 0, D, 20, 0), z: 1.1, escuro: 0.36 });
    const entra = ART.ease.outCubic(clamp(t / 0.3));
    const cam = G.cam(ART.lerp(1.0, 1.06, k) * (0.96 + 0.04 * entra), 540, ART.lerp(720, 690, k), 540, 760);
    G.painel(g, cam, gg => {
      gg.save(); gg.translate(0, 50 * (1 - entra));
      const c = G.cliente(gg, t, { pisca: pis ?? undefined, olhar: [0.2 * Math.sin(t * 0.9), 0.1], pedidoK: rev, recompensaA: 0 });
      gg.restore();
      if (pR > 0) ART.glow(gg, c.retrato[0], c.retrato[1], 220, "#FFE0A0", 0.45 * pR);
      if (pQ > 0) ART.glow(gg, c.x0 + 200, c.y0 + 360, 220, "#FFD23F", 0.55 * pQ);
      if (pC > 0) ART.glow(gg, c.x0 + 76, c.y0 + 360, 120, "#FF8A3C", 0.8 * pC);
    });
    G.fim(g, t, ctx);
    // começo sem preto: o recorte real do p258 (aba CLIENTES, parado no cartão da Dona Coruja) dissolve para o cartão
    const dk = 1 - ART.ease.inOutSine(clamp(t / 0.32));
    if (dk > 0) { g.save(); g.globalAlpha = dk; G.recorteClientes(g, t); ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.32 }); g.restore(); }
  },
});
