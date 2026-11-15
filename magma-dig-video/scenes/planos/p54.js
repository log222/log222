/* p54 · C5 Mercado · "Mas seta não é promessa."
 * As setas são o assunto: a seta verde de amanhã, grande e centralizada, treme;
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
    // a seta verde grande (≥ 300 px) no centro, tremendo; atrás dela cresce a seta vermelha para baixo
    GB.noPainel(g, { z: ART.map(t, 0, Math.max(dur, 1), 1.0, 1.05), cx: 540, cy: 820, px: 540, py: 820, sx: sh, sy: sh * 0.4 }, gg => {
      ART.ui.contador(gg, 540, 330, { valor: "Cobre · 40", icone: "cobre", s: 0.8, cor: "#F4EEDC" });
      // vermelha atrás (cresce no "não" e no "promessa")
      if (sombra > 0.02) {
        const ks = clamp(sombra);
        ART.glow(gg, 600, 900, 460, "#E63748", 0.4 * ks);
        gg.save(); gg.globalAlpha = 0.85 * ks; ART.ui.seta(gg, 640 + ART.noise(t * 9, 2) * 6, 880 + 70 * ks, { s: 3.0 * (0.6 + 0.4 * ks) * (1 + 0.08 * GB.hit(t, tProm, 0.5)), dir: "baixo", cor: "#E63748" }); gg.restore();
      }
      // verde na frente, tremendo cada vez mais
      const tg = Math.sin(t * 46) * 7 * tremor, rot = Math.sin(t * 31) * 0.04 * tremor;
      ART.glow(gg, 470, 720, 380, "#5FD35F", 0.3 + 0.2 * (1 - clamp(sombra)));
      gg.save(); gg.translate(470 + tg, 720); gg.rotate(rot); gg.globalAlpha = 1 - 0.25 * clamp(sombra) + 0.25 * Math.max(0, Math.sin(t * 23)) * clamp(sombra);
      ART.ui.seta(gg, 0, 0, { s: 2.6, dir: "cima" }); gg.restore();
      gg.font = '1000 44px "Nunito"'; gg.textAlign = "center"; gg.fillStyle = "#5FD35F"; gg.fillText("AMANHÃ", 470, 950);
      gg.globalAlpha = clamp(sombra); gg.font = '1000 110px "Nunito"'; gg.fillStyle = "#FF6B78"; gg.fillText("?", 840, 1120); gg.globalAlpha = 1;
    });
    // flash frio no acorde dissonante
    const fl = GB.hit(t, tAc, 0.4);
    if (fl > 0) { g.save(); g.fillStyle = `rgba(160,170,220,${0.12 * fl})`; g.fillRect(0, 0, 1080, 1920); g.restore(); }
    ART.vignette(g, 0.62); ART.faixaLegenda(g, 0.4); ART.grain(g, ctx.frame, 0.06);
  },
});
