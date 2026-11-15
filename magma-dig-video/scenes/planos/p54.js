/* p54 · C5 Mercado · "Mas seta não é promessa."
 * Plano médio do painel do Mercado (mais aberto que o close da seta no p53): a seta verde de amanhã treme;
 * no "não" surge atrás dela a sombra de uma seta vermelha para baixo, que cresce no "promessa";
 * a luz da cena esfria e puxa para o vermelho. Câmera quase parada, com tremor leve. */
MD.plano("p54", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur;
    const tNao = GB.wt(ctx, "nao", 0.57), tProm = GB.wt(ctx, "promessa", 0.81), tAc = GB.mark(ctx, "acorde", 0.05);
    const sombra = ART.ease.outCubic(clamp((t - tNao + 0.03) / 0.3)) * (1 + 0.25 * GB.hit(t, tProm, 0.6));
    const tremor = 0.4 + 0.9 * clamp((t - tProm) / 0.15);
    GB.fundoC5(g, t, { z: 1.08, escuro: 0.25, tinta: `rgba(90,10,20,${0.12 * sombra})` });
    const sh = ART.noise(t * 22, 7) * 5 * tremor;
    GB.noPainel(g, { z: ART.map(t, 0, dur, 0.9, 0.93), cx: 540, cy: 860, px: 600, py: 820, sx: sh, sy: sh * 0.4 }, gg => {
      ART.painelMercado(gg, t, { preco: 40, seta: 1, setaSombra: clamp(sombra * 1.3), tremor, prog: 1, brilhoAmanha: 0.2 });
      // sombra vermelha extra, maior, atrás (a dúvida)
      const sx = 106 + 868 - 30, sy = 390 - 20;
      if (sombra > 0.02) { gg.save(); gg.globalAlpha = 0.35 * clamp(sombra); ART.ui.seta(gg, sx + 40, sy + 160 + 30 * sombra, { s: 1.4 * clamp(sombra), dir: "baixo", cor: "#E63748" }); gg.restore(); ART.glow(gg, sx + 40, sy + 160, 260, "#E63748", 0.3 * clamp(sombra)); }
    });
    // flash frio no acorde dissonante
    const fl = GB.hit(t, tAc, 0.4);
    if (fl > 0) { g.save(); g.fillStyle = `rgba(160,170,220,${0.12 * fl})`; g.fillRect(0, 0, 1080, 1920); g.restore(); }
    ART.vignette(g, 0.62); ART.faixaLegenda(g, 0.4); ART.grain(g, ctx.frame, 0.06);
  },
});
