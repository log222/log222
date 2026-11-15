/* p52 · C4 Toca · "Quatro por cento da meta. Faltam vinte e oito dias."
 * Close da parede da meta. O Zeca (primeiro plano, à direita) ergue a pepita de cobre que ilumina a parede;
 * a barrinha de giz enche 4% em cobre no "quatro por cento"; no "faltam" o 2º tracinho é riscado;
 * no "vinte e oito" os 28 que sobram acendem em onda e o cartão fixo mostra RESTAM 28. */
MD.plano("p52", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur;
    const tQ = GB.wt(ctx, "quatro", 0.04), tMeta = GB.wt(ctx, "meta", 0.97), tFal = GB.wt(ctx, "faltam", 1.47), tVinte = GB.wt(ctx, "vinte", 2.01), tOito = GB.wt(ctx, "oito", 2.35);
    const rk = 1 + ART.map(t, tFal + 0.02, tFal + 0.3, 0, 1, "inOutSine");
    const cena = GB.toca({ prog: 1, tracos: 30, riscados: rk });
    if (cena.fundo.length === 5) cena.fundo = cena.fundo.filter((L, i) => i !== 3 && i !== 4); // close: sem mesa/cama na frente da barra
    const cam = ART.camera(t, { push: [2.12, 2.24], dur, ease: "linear" });
    GB.mira(cam, 0.8, ...GB.gizMundo(ART.map(t, 0, dur, 14, -6), 250), 540, 766);
    // barrinha de giz da meta (abaixo dos tracinhos, acima da mesa): 4% em cobre
    const kBox = ART.map(t, tQ - 0.02, tQ + 0.3, 0, 1, "outCubic");
    const kFill = ART.map(t, tQ + 0.25, tMeta + 0.1, 0, 0.04, "outCubic");
    const BX = -280, BY = 352, BW = 560, BH = 38;
    const wave = i => GB.hit(t, tVinte + 0.04 + (i % 10) * 0.035 + Math.floor(i / 10) * 0.06, 0.55);
    // pepita (luz laranja) — posição na tela calculada antes para iluminar a parede
    const sobe = ART.ease.outBack(clamp((t + 0.1) / 0.45));
    GB.palco(g, t, cam, cena, null, {
      frame: ctx.frame, legenda: false,
      meio: gg => ART.withLayer(gg, cam, 0.8, w => {
        w.save(); w.translate(GB.PAREDE.x, GB.PAREDE.y); w.scale(GB.PAREDE.s, GB.PAREDE.s);
        if (kBox > 0) {
          // contorno de giz desenhado em volta
          w.save(); w.strokeStyle = "rgba(244,240,230,.92)"; w.lineWidth = 7; w.shadowColor = "rgba(255,255,255,.35)"; w.shadowBlur = 6;
          w.setLineDash([2 * (BW + BH) * kBox, 4000]); ART.rr(w, BX, BY, BW, BH, 14); w.stroke(); w.restore();
        }
        if (kFill > 0.001) {
          w.save(); ART.rr(w, BX + 7, BY + 7, Math.max(16, (BW - 14) * kFill / 0.04 * 0.04 * 1), BH - 14, 8);
          w.fillStyle = "#F08A3E"; w.shadowColor = "#FF8A3C"; w.shadowBlur = 18; w.fill(); w.restore();
          GB.gizTexto(w, Math.round(kFill * 100) + "%", -110, BY + BH + 98, { align: "center", size: 140, cor: "rgba(255,170,90,.98)", glow: "rgba(255,140,60,.7)", blur: 12 });
        }
        w.restore();
      }),
      luz: (gg, tt, c) => {
        GB.tocaLuz(gg, tt, c, { janela: 0.35, lamp: 0.6 });
        for (let i = 2; i < 30; i++) {
          const [lx, ly] = GB.tracoLocal(i), [wx, wy] = GB.gizMundo(lx, ly + 32), [sx, sy, z] = GB.proj(c, 0.8, wx, wy), w = wave(i);
          if (w > 0.02) ART.glow(gg, sx, sy, 70 * z, "#FFD23F", 0.6 * w);
        }
        const [bx, by, z] = GB.proj(c, 0.8, ...GB.gizMundo(BX + 30, BY + BH / 2));
        const b = GB.hit(t, tMeta, 0.6);
        if (b > 0) ART.glow(gg, bx, by, 200 * z, "#FF8A3C", 0.5 * b);
        if (rk > 1 && rk < 2) { const [lx, ly] = GB.tracoLocal(1), [px, py] = GB.proj(c, 0.8, ...GB.gizMundo(lx - 20 + 44 * (rk - 1), ly + 56 - 52 * (rk - 1))); GB.poeiraGiz(gg, tt, px, py, 1, 8); }
      },
    });
    // a pata do Zeca entra por baixo/direita erguendo a pepita de cobre, que ilumina a parede
    const px = 905 - 40 * sobe + Math.sin(t * 2.2) * 6, py = 1300 - 150 * sobe + Math.sin(t * 3.1) * 5;
    ART.glow(g, px - 70, py - 60, 520, "#FF8A3C", 0.32 + 0.06 * Math.sin(t * 6));
    ART.pata(g, px, py, 58, {
      s: 1.25, dedos: "segura",
      objeto: gg => { ART.pepita(gg, -95, -40, 62, "cobre", 0.4 + t * 0.15, { seed: 7 }); ART.glow(gg, -95, -40, 120, "#FFB070", 0.45); },
    });
    g.save(); g.fillStyle = ART.lg(g, 0, 1250, 0, 1920, [[0, "rgba(10,6,16,0)"], [0.5, "rgba(10,6,16,.55)"], [1, "rgba(10,6,16,.9)"]]); g.fillRect(0, 1250, 1080, 670); g.restore();
    ART.faixaLegenda(g, 0.4);
    // cartão fixo: saldo 7, cobre na mochila = 4% → RESTAM 28
    GB.cartao(g, 540, 330, { saldo: 7, dia: 2, s: 0.86, cobre: kFill, rotulo: t >= tVinte - 0.05 ? "RESTAM 28" : kFill > 0.001 ? "COBRE " + Math.round(kFill * 100) + "%" : null, pulso: GB.hit(t, tVinte, 0.5) + GB.hit(t, tMeta, 0.5) * 0.6 });
  },
});
