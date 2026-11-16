/* p231 · C5 Mercado · "Todo mundo vende pra esquecer."
 * Mesmo painel e mesma câmera do fim do p230 (o −20 continua lá). A pata do Zeca entra pela direita/alto no "vende"
 * e desce até quase tocar o VENDER (como o p55); o botão pulsa, convidando. No "esquecer" a pata para e treme no ar,
 * sem apertar. Empurrão lento até o último quadro. */
MD.plano("p231", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, { clamp } = G, D = ctx.dur;
    const tVe = G.wt(ctx, "vende", 0.68), tPra = G.wt(ctx, "pra", 1.16), tEsq = G.wt(ctx, "esquecer", 1.52);
    const k = ART.ease.inOutSine(clamp(t / D));
    G.fundo(g, t + 2.36, { dx: ART.map(t, 0, D, 0, 15), z: 1.08, escuro: 0.14 + 0.08 * k });
    const cam = G.cam(ART.lerp(1.05, 1.1, k), ART.lerp(560, 580, k), ART.lerp(880, 883, k), 540, 900);
    const pulso = clamp((t - tVe + 0.1) / 0.3) * (0.55 + 0.45 * Math.sin(t * 6.5));
    G.painel(g, cam, gg => {
      const c = ART.painelMercado(gg, t + 2.36, { precoAntes: 40, preco: 20, rola: 1, varPct: -50, seta: 0,
        barras: G.B_N3.concat([0.33]), cores: [0, 0, 0, 0, 0, "#FFD23F"], corHoje: "#E63748", amanha: false, botaoPulso: pulso });
      const s = 1.55, xr = c.x0 + c.w - 36 * s;
      G.txt(gg, "−20", xr - 120, c.y0 + 168 * s - 10, { size: 66, fill: "#FF5A66", stroke: "#2A0A10", sw: 12 });
    });
    // botão VENDER em px de tela
    const bx = cam.cx + cam.z * (540 - cam.px), by = cam.cy + cam.z * (1130 - cam.py);
    const entra = ART.ease.outCubic(clamp((t - tVe + 0.1) / 0.5));
    const desce = ART.ease.inOutSine(clamp((t - tVe - 0.2) / Math.max(0.2, tPra + 0.2 - tVe)));
    const hesita = ART.ease.outBack(clamp((t - tEsq - 0.1) / 0.4));
    const tre = clamp((t - tEsq) / 0.25) * Math.sin(t * 36) * 5 + Math.sin(t * 4.5) * 4;
    if (entra > 0) {
      // ponta da pata sobre a metade direita do botão (não cobre o VENDER nem o preço); braço sai para o alto/direita
      const px = bx + 320 + (1 - entra) * 420 + hesita * 30 + tre, py = by - 165 + desce * 70 - hesita * 34 - (1 - entra) * 260;
      ART.glow(g, px - 40, by + 6, 120, "#2A1E08", 0.4 * desce * (1 - 0.4 * hesita), "source-over");
      ART.pata(g, px, py, -35, { s: 0.95, dedos: "aponta" });
    }
    G.fim(g, t + 2.36, ctx);
  },
});
