/* p265 · C5 Clientes · "Entrega pra Dona Coruja e ganha uma amiga,"
 * O dilema no painel: cartão da Dona Coruja (amizade 1, bônus, pedido 4/4 Cobre, +160 moedas) e, embaixo, apagado,
 * o VENDER +240 moedas do Mercado. No "Entrega" a pata do Zeca entra pelo alto/direita e vem pairar sobre ENTREGAR,
 * que fica ativo (amarelo) quando ela se aproxima. No "e ganha" a pata hesita, escorrega na direção do VENDER (que
 * acende um pouco) e volta para o ENTREGAR no "amiga", tremendo no ar, sem apertar. A Dona Coruja olha para a pata.
 * Empurrão lento até o último quadro. */
MD.plano("p265", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, u = ART.ui, { clamp } = G, D = ctx.dur;
    const tE = G.wt(ctx, "entrega", 0.04), tDona = G.wt(ctx, "dona", 0.76), tGa = G.wt(ctx, "ganha", 1.96), tAmi = G.wt(ctx, "amiga", 2.6);
    const k = ART.ease.inOutSine(clamp(t / D));
    const entra = ART.ease.outCubic(clamp((t - tE) / Math.max(0.4, tDona + 0.1 - tE)));
    const ativa = ART.prog(t, tDona - 0.2, tDona + 0.15);
    const vai = ART.ease.inOutSine(clamp((t - tGa + 0.1) / 0.45)) * (1 - ART.ease.inOutSine(clamp((t - tAmi + 0.1) / 0.4)));
    G.fundo(g, t, { dx: ART.map(t, 0, D, 12, -12), z: 1.1, escuro: 0.38 });
    const cam = G.cam(ART.lerp(1.0, 1.05, k), 540, ART.lerp(790, 800, k), 540, 780);
    let c = null;
    G.painel(g, cam, gg => {
      c = G.cliente(gg, t, { amizade: 1, sorriso: 1, bonus: 1, botaoK: ativa, olhar: [0.6, 0.5] });
      if (ativa > 0) ART.glow(gg, c.botao[0], c.botao[1], 240, "#FFD23F", 0.3 * ativa * (0.75 + 0.25 * Math.sin(t * 6)));
      // VENDER do Mercado, apagado, embaixo (a outra opção)
      const av = 0.62 + 0.3 * vai;
      if (vai > 0) ART.glow(gg, 540, 1120, 380, "#FFD23F", 0.3 * vai);
      gg.save(); gg.globalAlpha = av; u.botao(gg, 540, 1110, 600, 130, { texto: "VENDER", sub: "+240 moedas", icone: "moeda" }); gg.restore();
    });
    // pata (px de tela): paira sobre ENTREGAR, hesita em direção ao VENDER e volta
    const P = (x, y) => [cam.cx + cam.z * (x - cam.px), cam.cy + cam.z * (y - cam.py)];
    const [bx, by] = P(c.botao[0], c.botao[1]), [vx, vy] = P(540 + 180, 1110);
    const tre = Math.sin(t * 4.2) * 5 + clamp((t - tAmi) / 0.3) * Math.sin(t * 33) * 4;
    const alvoX = ART.lerp(bx + 195, vx + 170, vai), alvoY = ART.lerp(by - 175, vy - 165, vai);   // palma; os dedos ficam embaixo/à esquerda
    const px = alvoX + (1 - entra) * 480 + tre, py = alvoY - (1 - entra) * 380 + 6 * Math.sin(t * 2.6);
    if (entra > 0) {
      ART.glow(g, px - 30, py + 70, 110, "#1A1208", 0.35 * entra, "source-over");
      ART.pata(g, px, py, -42, { s: 0.92, dedos: "aponta" });
    }
    G.fim(g, t, ctx);
  },
});
