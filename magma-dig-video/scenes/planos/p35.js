/* p35 · C5 painel Habilidades · "Todo minerador começa por Força."
 * O cartão FORÇA, grande e vermelho, sozinho no centro; atrás dele, uma multidão de sombras de picaretas enormes
 * cai no lugar (no boom) e balança no ritmo, com contraluz vermelha. Empurrão no cartão; no "Força" ele pulsa forte. */
MD.plano("p35", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur, u = ART.ui;
    const tBoom = GB.mark(ctx, "boom", 0.1), tTodo = GB.wt(ctx, "todo", 0.04), tFor = GB.wt(ctx, "forca", 1.52);
    GB.fundoC5(g, t, { z: 1.1, dx: ART.map(t, 0, dur, -15, 15), escuro: 0.25, tinta: "rgba(90,10,20,.18)" });
    const z = ART.map(t, 0, dur, 1.0, 1.14, "inOutSine");
    const hitB = GB.hit(t, tBoom, 0.35), hitF = GB.hit(t, tFor, 0.5);
    const sh = (ART.noise(t * 40, 3) * 14) * (hitB + hitF);
    // contraluz vermelha atrás do cartão
    ART.glow(g, 540, 720, 1100 * z, "#E63748", 0.5 + 0.3 * hitF + 0.2 * hitB);
    // sombras de picaretas (muitos mineradores): caem no boom e balançam
    const cai = ART.ease.outBack(clamp((t - tBoom + 0.04) / 0.22));
    // 3 picaretas grandes e reconhecíveis, em contraluz (sprite cacheado: picareta do kit escurecida + borda vermelha)
    const spr = ART.cache("p35:pic", 520, 1100, gg => {
      gg.translate(260, 860); gg.scale(7.2, 7.2); ART.drawPick(gg, "ferro", 118);
      gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalCompositeOperation = "source-atop";
      gg.fillStyle = ART.lg(gg, 0, 0, 520, 0, [[0, "rgba(120,20,30,.55)"], [0.35, "rgba(14,4,8,.9)"], [1, "rgba(10,3,6,.95)"]]); gg.fillRect(0, 0, 520, 1100);
    });
    const PIC = [[150, 1430, -36, 0.9], [-150, 1430, 36, 0.9], [0, 1600, 0, 1.08]];
    PIC.forEach(([dx, gy0, ang, sc], i) => {
      const sw = Math.sin(t * 6 + i * 1.3) * 4 + 5 * hitF * Math.sin(i * 2 + 1);
      const gy = gy0 + (1 - cai) * 900;
      g.save(); g.globalAlpha = clamp(cai * 1.5); g.translate(540 + dx * z + sh, gy); g.rotate(ART.deg(ang + sw)); g.scale(sc * z, sc * z);
      g.drawImage(spr, -260, -860 - 240); g.restore();
    });
    // poeira/brasa subindo
    ART.dust(g, t, { count: 26, seed: 31, color: "#FF8A7A", size: [2, 4.5], alpha: 0.45, y: 300, h: 1100, speed: 30 });
    // cartão FORÇA no centro
    GB.noPainel(g, { z: z * (1 + 0.06 * hitF), cx: 540, cy: 930, px: 540, py: 930, sx: sh, sy: sh * 0.5 }, gg => {
      const s = 1.18, w = 760 * s, x0 = 540 - w / 2, y0 = 930 - 66 * s;
      const entra = ART.ease.outBack(clamp((t + 0.02) / 0.2));
      gg.save(); gg.translate(540, 930); gg.scale(0.85 + 0.15 * entra, 0.85 + 0.15 * entra); gg.translate(-540, -930);
      u.ramo(gg, x0, y0, { ramo: 1, nivel: 0, aceso: 1, s, pulso: 0.5 + 0.5 * hitF + 0.25 * Math.sin(t * 9) ** 2, sombra: true });
      gg.restore();
      // rótulo de cima
      gg.save(); gg.globalAlpha = clamp((t - tTodo) / 0.2); gg.font = '1000 40px "Nunito"'; gg.textAlign = "center"; gg.letterSpacing = "4px"; gg.fillStyle = "#FF9AA4";
      gg.fillText("O MAIS ESCOLHIDO", 540, 790); gg.restore();
    });
    ART.vignette(g, 0.6); ART.faixaLegenda(g, 0.4); ART.grain(g, ctx.frame, 0.05);
  },
});
