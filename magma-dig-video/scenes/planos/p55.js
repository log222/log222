/* p55 · C5 Mercado · "Vende hoje e garante os quarenta,"
 * Plano detalhe do botão amarelo VENDER (+40 moedas). A pata do Zeca entra no "Vende" e desce até quase tocar;
 * o botão acende no "garante" e afunda um tiquinho, o "+40" pulsa no "quarenta" — e a pata hesita,
 * recua um pouco e fica tremendo no ar, sem apertar. Empurrão lento. */
MD.plano("p55", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur, u = ART.ui;
    const tV = GB.wt(ctx, "vende", 0.04), tG = GB.wt(ctx, "garante", 0.81), tQ = GB.wt(ctx, "quarenta", 1.37);
    GB.fundoC5(g, t, { z: 1.12, escuro: 0.25, dx: ART.map(t, 0, dur, 15, -15) });
    const z = ART.map(t, 0, dur, 1.0, 1.1, "inOutSine");
    const brilho = clamp((t - tG) / 0.2) * (0.6 + 0.4 * Math.sin(t * 8)), pq = GB.hit(t, tQ, 0.5);
    const quase = clamp((t - tG) / 0.25) * (1 - clamp((t - tQ - 0.1) / 0.3)); // o botão afunda um tiquinho e volta
    GB.noPainel(g, { z, cx: 540, cy: 880, px: 540, py: 880 }, gg => {
      // cartão do cobre ao fundo, apagado (contexto: HOJE PAGA 40)
      gg.save(); gg.globalAlpha = 0.55; u.cartaoMinerio(gg, 540, 520, { tipo: "cobre", nome: "Cobre", preco: 40, varPct: 12, barras: [0.42, 0.5, 0.38, 0.55, 0.47, 0.6, 0.66], amanha: 0.82, s: 1.05, vidro: false }); gg.restore();
      if (brilho > 0) ART.glow(gg, 540, 930, 560, "#FFD23F", 0.35 * brilho);
      gg.save(); gg.translate(540, 930); const sc = 1 + 0.04 * pq; gg.scale(sc, sc); gg.translate(-540, -930);
      u.botao(gg, 540, 930, 820, 230, { texto: "VENDER", sub: "+40 moedas", icone: "moeda", press: 0.25 * quase });
      gg.restore();
      if (pq > 0) ART.glow(gg, 600, 990, 200, "#FFF2A6", 0.5 * pq);
    });
    // pata: entra pela direita/cima no "Vende", desce, hesita no "quarenta" e recua um pouco, tremendo
    const entra = ART.ease.outCubic(clamp((t - tV + 0.02) / 0.45));
    const desce = ART.ease.inOutSine(clamp((t - 0.5) / (tG + 0.1 - 0.5)));
    const recua = ART.ease.outBack(clamp((t - tQ) / 0.35));
    const tre = clamp((t - tQ) / 0.2) * Math.sin(t * 38) * 5 + Math.sin(t * 5) * 4;
    const px = 770 + (1 - entra) * 520 + recua * 30 + tre, py = 560 + desce * 120 - recua * 60 + (1 - entra) * -260;
    ART.pata(g, px, py, -38, { s: 1.15, dedos: "aponta" });
    // sombra da pata no botão (fica mais nítida quando chega perto)
    ART.glow(g, px - 170, 930, 120, "#2A1E08", 0.35 * desce * (1 - 0.5 * recua), "source-over");
    ART.vignette(g, 0.55); ART.faixaLegenda(g, 0.4); ART.grain(g, ctx.frame, 0.05);
  },
});
