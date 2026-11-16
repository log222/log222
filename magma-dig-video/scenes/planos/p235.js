/* p235 · C5 Mercado · "Seta é palpite de amanhã."
 * Close na seta do Mercado (mesmo enquadramento do p206). Cobre hoje 20 (−50%). No "Seta" a seta verde de AMANHÃ
 * brota firme; no "palpite" ela vira fantasma (contorno tracejado) e um "?" pisca ao lado; no "amanhã" o rótulo
 * AMANHÃ brilha. Câmera parada com deriva lenta. */
MD.plano("p235", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, { clamp } = G, D = ctx.dur;
    const tSeta = G.wt(ctx, "seta", 0.04), tPal = G.wt(ctx, "palpite", 0.87), tAm = G.wt(ctx, "amanha", 1.64);
    const seta = clamp((t - tSeta + 0.05) / 0.3);
    const fant = ART.prog(t, tPal, tPal + 0.45, "inOutSine");
    const pAm = G.hit(t, tAm, 0.8) + (t > tAm ? 0.3 : 0);
    G.fundo(g, t, { dx: ART.map(t, 0, D, -10, 14), dy: ART.map(t, 0, D, 0, -10), z: 1.1, escuro: 0.15 });
    const cam = G.cam(ART.map(t, 0, D, 1.38, 1.42, "inOutSine"), ART.map(t, 0, D, 695, 712), 600, 600, 712);
    G.painel(g, cam, gg => {
      const c = ART.painelMercado(gg, t, { precoAntes: 40, preco: 20, rola: 1, antesFantasma: 0, varPct: -50, seta, setaFantasma: fant, botao: false,
        barras: G.B_N3.concat([0.33]), cores: [0, 0, 0, 0, 0, "#FFD23F"], corHoje: "#E63748", amanha: false });
      const sx = c.x0 + c.w - 30, sy = c.y0 - 20;
      ART.glow(gg, sx, sy, 220, "#5FD35F", 0.3 * seta * (1 - 0.6 * fant));
      if (pAm > 0) ART.glow(gg, sx, sy + 90, 150, "#5FD35F", 0.45 * clamp(pAm));
    });
    G.fim(g, t, ctx);
  },
});
