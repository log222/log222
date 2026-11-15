/* p50 · C5 Mercado · "O preço muda todo dia e mostra a tendência de amanhã."
 * Close do gráfico do Cobre: as 7 barras sobem uma a uma, alternando alta e baixa ("muda todo dia"),
 * a linha de tendência se desenha sobre elas ("mostra a tendência") e a barra vazada de AMANHÃ acende por último
 * no "amanhã". Câmera desliza da esquerda para a direita. */
MD.plano("p50", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur, u = ART.ui;
    const tPreco = GB.wt(ctx, "preco", 0.12), tDia = GB.wt(ctx, "dia", 1.0), tMostra = GB.wt(ctx, "mostra", 1.4), tTend = GB.wt(ctx, "tendencia", 1.88), tAm = GB.wt(ctx, "amanha", 2.6);
    const B = [0.42, 0.56, 0.38, 0.55, 0.47, 0.6, 0.68], AM = 0.84;
    GB.fundoC5(g, t, { dx: ART.map(t, 0, dur, 40, -40), z: 1.12, escuro: 0.15 });
    const cam = { z: 1.06 + 0.04 * clamp(t / dur), cx: 540, cy: 900, px: ART.map(t, 0, dur, 470, 610, "inOutSine"), py: 860 };
    // geometria do gráfico (espaço do painel)
    const GX = 110, GW = 860, GY = 1150, GH = 560, n = 8, gap = 22, bw = (GW - gap * (n - 1)) / n;
    const bx = i => GX + i * (bw + gap), bh = v => GH * v;
    const tb = i => tPreco + (tDia + 0.2 - tPreco) * i / 6;     // cada barra no ritmo da fala
    const kLinha = ART.map(t, tMostra - 0.05, tTend + 0.4, 0, 1, "inOutSine");
    const kAm = ART.ease.outBack(clamp((t - tAm + 0.05) / 0.25)), brilho = GB.hit(t, tAm, 0.9) + (t > tAm ? 0.35 : 0);
    GB.noPainel(g, cam, gg => {
      // título do Mercado (emenda com o fim do p49) + painel de vidro + cabeçalho do cobre
      u.titulo(gg, 540, 345, "MERCADO", { s: 0.95 });
      u.cartao(gg, 80, 430, 920, 850, { r: 44, cor: "rgba(24,21,38,.78)", borda: "rgba(255,255,255,.12)" });
      ART.rr(gg, 110, 470, 120, 120, 26); gg.fillStyle = "rgba(255,255,255,.07)"; gg.fill(); u.pix(gg, "cobre", 170, 530, 80);
      gg.font = '1000 72px "Nunito"'; gg.fillStyle = "#F4EEDC"; gg.textAlign = "left"; gg.textBaseline = "middle"; gg.fillText("Cobre", 260, 512);
      gg.font = '900 36px "Nunito"'; gg.fillStyle = "#A3A0AE"; gg.fillText("PREÇO · 7 DIAS", 262, 566);
      // linha de base
      gg.fillStyle = "rgba(255,255,255,.15)"; gg.fillRect(GX - 10, GY + 8, GW + 20, 4);
      for (let i = 0; i < 7; i++) {
        const k = ART.ease.outBack(clamp((t - tb(i)) / 0.18)); if (k <= 0) continue;
        const h = bh(B[i]) * k, x = bx(i);
        ART.rr(gg, x, GY - h, bw, h, 10); gg.fillStyle = i === 6 ? "#FFD23F" : "#7A739A"; gg.fill();
        if (i > 0) { const up = B[i] > B[i - 1]; gg.font = '1000 34px "Nunito"'; gg.textAlign = "center"; gg.fillStyle = up ? "#5FD35F" : "#FF6B6B"; gg.globalAlpha = clamp((t - tb(i)) / 0.15) * (1 - 0.6 * kLinha); gg.fillText(up ? "▲" : "▼", x + bw / 2, GY - h - 30); gg.globalAlpha = 1; }
        const p = GB.hit(t, tb(i), 0.3); if (p > 0) ART.glow(gg, x + bw / 2, GY - h, 120, i === 6 ? "#FFD23F" : "#B9B2E0", 0.5 * p);
      }
      // rótulos HOJE / AMANHÃ
      gg.font = '1000 32px "Nunito"'; gg.textAlign = "center";
      gg.globalAlpha = clamp((t - tb(6)) / 0.2); gg.fillStyle = "#FFD23F"; gg.fillText("HOJE", bx(6) + bw / 2, GY + 52); gg.globalAlpha = 1;
      // barra vazada de amanhã
      if (t > tAm - 0.05 && kAm > 0.01) {
        const h = bh(AM) * kAm, x = bx(7);
        if (brilho > 0) ART.glow(gg, x + bw / 2, GY - h / 2, 260, "#5FD35F", 0.45 * clamp(brilho));
        ART.rr(gg, x + 2, GY - h, bw - 4, h, 10); gg.fillStyle = ART.rgba("#5FD35F", 0.14 + 0.2 * clamp(brilho)); gg.fill();
        gg.setLineDash([14, 10]); gg.lineWidth = 6; gg.strokeStyle = "#5FD35F"; gg.stroke(); gg.setLineDash([]);
        gg.fillStyle = "#5FD35F"; gg.fillText("AMANHÃ", x + bw / 2 - 20, GY + 94);
        gg.font = '1000 60px "Nunito"'; gg.fillText("?", x + bw / 2, GY - h / 2);
      }
      // linha de tendência (pontilhada sobre os topos)
      if (kLinha > 0) {
        const pts = B.map((v, i) => [bx(i) + bw / 2, GY - bh(v) - 70]); pts.push([bx(7) + bw / 2, GY - bh(AM) - 70]);
        const tot = pts.length - 1, upto = kLinha * tot;
        gg.save(); gg.lineWidth = 7; gg.strokeStyle = "#FFFFFF"; gg.lineCap = "round"; gg.lineJoin = "round"; gg.shadowColor = "rgba(255,255,255,.5)"; gg.shadowBlur = 10;
        gg.beginPath(); gg.moveTo(...pts[0]);
        for (let i = 1; i <= Math.floor(upto); i++) { if (i === tot && !(t > tAm - 0.05)) break; gg.lineTo(...pts[i]); }
        const f = upto - Math.floor(upto), j = Math.floor(upto);
        if (j < tot && f > 0 && !(j + 1 === tot && !(t > tAm - 0.05))) gg.lineTo(ART.lerp(pts[j][0], pts[j + 1][0], f), ART.lerp(pts[j][1], pts[j + 1][1], f));
        gg.stroke(); gg.restore();
      }
    });
    ART.vignette(g, 0.5); ART.faixaLegenda(g, 0.4); ART.grain(g, ctx.frame, 0.05);
  },
});
