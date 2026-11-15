/* p53 · C5 Mercado · "E a seta de amanhã aponta pra cima."
 * Close da tendência do Cobre: à esquerda a barra amarela de HOJE e a vazada de AMANHÃ; à direita a seta verde.
 * "seta": a seta brota; "amanhã": a barra vazada brilha; "aponta": a seta sobe; "cima": dispara para o alto com faíscas.
 * Câmera empurra e sobe junto. */
MD.plano("p53", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur, u = ART.ui;
    const tSeta = GB.wt(ctx, "seta", 0.44), tAm = GB.wt(ctx, "amanha", 0.92), tAp = GB.wt(ctx, "aponta", 1.39), tCima = GB.wt(ctx, "cima", 2.04);
    GB.fundoC5(g, t, { dy: ART.map(t, 0, dur, 0, 40), z: 1.12, escuro: 0.2, tinta: "rgba(20,60,30,.10)" });
    const nasce = ART.ease.outBack(clamp((t - tSeta + 0.04) / 0.25));
    const sobe = ART.ease.inOutSine(clamp((t - tAp) / (tCima - tAp))) * 70 + ART.ease.outCubic(clamp((t - tCima) / 0.3)) * 110;
    const brAm = GB.hit(t, tAm, 0.8) + (t > tAm ? 0.3 : 0), brC = GB.hit(t, tCima, 0.6);
    const cam = { z: ART.map(t, 0, dur, 1.0, 1.1, "inOutSine"), cx: 540, cy: 820, px: 540, py: 860 - sobe * 0.5, sy: brC * ART.noise(t * 40, 4) * 8 };
    GB.noPainel(g, cam, gg => {
      // cabeçalho: Cobre · 40
      u.contador(gg, 540, 330, { valor: "Cobre · 40", icone: "cobre", s: 0.8, cor: "#F4EEDC" });
      // barras grandes: HOJE e AMANHÃ
      const BY = 1120, BW = 150;
      ART.rr(gg, 130, BY - 420, BW, 420, 16); gg.fillStyle = "#FFD23F"; gg.fill();
      const hA = 520;
      if (brAm > 0) ART.glow(gg, 330 + BW / 2, BY - hA / 2, 330, "#5FD35F", 0.45 * clamp(brAm));
      ART.rr(gg, 330, BY - hA, BW, hA, 16); gg.fillStyle = ART.rgba("#5FD35F", 0.12 + 0.25 * clamp(brAm)); gg.fill();
      gg.setLineDash([18, 12]); gg.lineWidth = 8; gg.strokeStyle = "#5FD35F"; gg.stroke(); gg.setLineDash([]);
      gg.font = '1000 40px "Nunito"'; gg.textAlign = "center"; gg.textBaseline = "middle";
      gg.fillStyle = "#FFD23F"; gg.fillText("HOJE", 130 + BW / 2, BY + 44);
      gg.fillStyle = "#5FD35F"; gg.fillText("AMANHÃ", 330 + BW / 2, BY + 44);
      gg.fillStyle = "rgba(255,255,255,.15)"; gg.fillRect(100, BY + 6, 420, 5);
      // seta verde
      if (nasce > 0.01) {
        const ax = 760, ay = 820 - sobe;
        ART.glow(gg, ax, ay, 340, "#5FD35F", 0.35 + 0.4 * brC);
        u.seta(gg, ax, ay, { s: 2.3 * nasce, dir: "cima" });
        // rastro ao disparar
        if (t > tCima) { gg.save(); gg.globalAlpha = 0.4 * (1 - clamp((t - tCima) / 0.4)); u.seta(gg, ax, ay + 90, { s: 2.3, dir: "cima" }); gg.restore(); }
        for (const p of ART.burst(t, { t0: tCima, count: 22, x: ax, y: ay - 160, speed: [250, 700], angle: [-160, -20], gravity: 600, life: [0.4, 0.8], size: [4, 9], seed: 12 })) {
          gg.globalAlpha = p.alpha; ART.circ(gg, p.x, p.y, p.size); gg.fillStyle = p.r > 0.5 ? "#B8FFB0" : "#FFF2A6"; gg.fill(); gg.globalAlpha = 1;
        }
      }
    });
    ART.vignette(g, 0.5); ART.faixaLegenda(g, 0.4); ART.grain(g, ctx.frame, 0.05);
  },
});
