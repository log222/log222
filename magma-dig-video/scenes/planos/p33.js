/* p33 · C5 painel Habilidades · "Noite um. Habilidades."
 * Plano frontal: o painel escuro sobe de baixo (no whoosh) com os 7 ramos ainda apagados, todos no nível 0;
 * a etiqueta NOITE 1 (lua) entra no "noite" e o título HABILIDADES estoura no "Habilidades". */
MD.plano("p33", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur, u = ART.ui;
    const tWh = GB.mark(ctx, "whoosh", 0), tNoite = GB.wt(ctx, "noite", 0.04), tHab = GB.wt(ctx, "habilidades", 0.65);
    GB.fundoC5(g, t, { dx: ART.map(t, 0, dur, 20, -20), z: 1.06 });
    const sobe = ART.ease.outCubic(clamp((t - tWh) / 0.38));
    const cam = { z: ART.map(t, 0, dur, 1.0, 1.04), cx: 540, cy: 860 };
    GB.noPainel(g, cam, gg => {
      gg.save(); gg.translate(0, (1 - sobe) * 900); gg.globalAlpha = clamp(sobe * 1.6);
      // placa do painel atrás da coluna (vidro escuro)
      u.cartao(gg, 150, 470, 780, 920, { r: 40, cor: "rgba(20,18,31,.72)", borda: "rgba(255,255,255,.10)" });
      GB.colRamos(gg, i => ({ aceso: 0, nivel: 0, a: 0.78 }), { y0: 520, gap: 120, s: 0.84 });
      gg.restore();
      // etiqueta NOITE 1
      const kn = ART.ease.outBack(clamp((t - tNoite) / 0.25));
      if (kn > 0) { gg.save(); gg.translate(540, 300); gg.scale(kn, kn); u.contador(gg, 0, 0, { valor: "NOITE 1", icone: "lua", s: 0.62, cor: "#CFD8FF" }); gg.restore(); }
      // título no "Habilidades"
      const kt = ART.ease.outBack(clamp((t - tHab + 0.04) / 0.22));
      if (kt > 0) {
        gg.save(); gg.translate(540, 400); gg.scale(kt, kt); u.titulo(gg, 0, 0, "HABILIDADES", { s: 0.92 }); gg.restore();
        gg.save(); gg.globalAlpha = clamp((t - tHab - 0.1) / 0.2); gg.font = '900 32px "Nunito"'; gg.fillStyle = "#A3A0AE"; gg.textAlign = "center"; gg.letterSpacing = "2px"; gg.fillText("RAMOS · NÍVEL 0", 540, 462); gg.restore();
        const fl = GB.hit(t, tHab, 0.45); if (fl > 0) ART.glow(gg, 540, 400, 420, "#FFD23F", 0.35 * fl);
      }
    });
    ART.vignette(g, 0.5); ART.faixaLegenda(g, 0.35); ART.grain(g, ctx.frame, 0.05);
  },
});
