/* p230 · C5 Mercado · "Vender agora era perder vinte."
 * Volta do inserto ao painel do Mercado: começa já na Toca desfocada (sem preto) e o painel entra subindo em fade. Cobre HOJE PAGA 20 (vermelho, −50%), o "ONTEM 40"
 * riscado no canto, botão VENDER +20 moedas. No "perder" o 40 fantasma acende em vermelho; no "vinte" um −20 vermelho
 * salta entre o 40 e o 20 (40 − 20 = 20: a conta do que se perde). Empurrão lento para o botão (continua no p231). */
MD.plano("p230", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, { clamp } = G, D = ctx.dur;
    const tVen = G.wt(ctx, "vender", 0.04), tPer = G.wt(ctx, "perder", 1.16), tV = G.wt(ctx, "vinte", 1.48);
    const k = ART.ease.inOutSine(clamp(t / D));
    G.fundo(g, t, { dx: ART.map(t, 0, D, -20, 0), z: 1.08, escuro: 0.14 });
    const cam = G.cam(ART.lerp(1.0, 1.05, k), ART.lerp(540, 560, k), 880, 540, 900);
    const pPer = G.hit(t, tPer, 0.7) + (t > tPer ? 0.25 : 0), pV = G.hit(t, tV, 0.5);
    const ent = ART.ease.outCubic(clamp(t / 0.35));
    G.painel(g, cam, gg => {
      gg.globalAlpha = ent; gg.translate(0, 60 * (1 - ent));
      const c = ART.painelMercado(gg, t, { textoEscala: G.TXT, precoAntes: 40, preco: 20, rola: 1, varPct: -50, seta: 0,
        barras: G.B_N3.concat([0.33]), cores: [0, 0, 0, 0, 0, "#FFD23F"], corHoje: "#E63748", amanha: false,
        botaoPulso: 0.35 * G.hit(t, tVen, 0.8) });
      const s = 1.55, xr = c.x0 + c.w - 36 * s;
      // 40 fantasma (canto) acende no "perder"
      if (pPer > 0) ART.glow(gg, xr - 50, c.y0 + 100 * s, 190, "#E63748", 0.55 * clamp(pPer));
      // −20 no "vinte", entre o 40 de ontem e o 20 de hoje
      const kv = ART.ease.outBack(clamp((t - tV + 0.02) / 0.25));
      if (kv > 0) {
        gg.save(); gg.translate(xr - 120, c.y0 + 168 * s - 10 * clamp((t - tV) / 0.8)); gg.scale(kv, kv);
        G.txt(gg, "−20", 0, 0, { size: 66, fill: "#FF5A66", stroke: "#2A0A10", sw: 12 }); gg.restore();
        if (pV > 0) ART.glow(gg, xr - 120, c.y0 + 168 * s, 200, "#E63748", 0.6 * pV);
      }
    });
    G.fim(g, t, ctx);
  },
});
