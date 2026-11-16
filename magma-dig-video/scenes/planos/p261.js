/* p261 · C5 Clientes · "Menos que o Mercado."
 * Corte para a comparação (composição claramente diferente do cartão): sob o título CLIENTES, duas barras crescem
 * lado a lado nos dois "ding": ENTREGAR 160 (roxa) e VENDER 240 (amarela, a do Mercado de hoje), com o valor
 * contando junto e o ícone de moeda. No "Mercado" a barra VENDER brilha e um "<" aparece entre as duas.
 * Câmera quase parada, com deriva e empurrão leve. */
MD.plano("p261", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, u = ART.ui, { clamp } = G, D = ctx.dur;
    const t0 = G.mark(ctx, "ding", 0), tMer = G.wt(ctx, "mercado", 0.92);
    const kb = clamp((t - t0) / 1.0);
    const pM = G.hit(t, tMer, 0.8), kl = ART.ease.outBack(clamp((t - tMer + 0.02) / 0.25));
    G.fundo(g, t, { dx: ART.map(t, 0, D, -15, 15), z: 1.1, escuro: 0.55 });
    ART.glow(g, 540, 640, 620, "#0A0812", 0.7, "source-over");   // apaga o "1.000" da parede atrás das barras
    const cam = G.cam(ART.map(t, 0, D, 1.0, 1.04, "inOutSine"), 540, 800, 540, 800);
    const base = 1130, alt = 560, lw = 250, gap = 150, x1 = 540 - (2 * lw + gap) / 2, x2 = x1 + lw + gap;
    G.painel(g, cam, gg => {
      u.titulo(gg, 540, 330, "CLIENTES", { s: 0.9 });
      if (t > tMer) ART.glow(gg, x2 + lw / 2, base - alt / 2, 420, "#FFD23F", 0.25 + 0.4 * pM);
      u.barrasComparar(gg, { k: kb, itens: [{ rotulo: "ENTREGAR", valor: 160, cor: "#8E7BE0" }, { rotulo: "VENDER", valor: 240, cor: "#FFD23F" }], base, alt, larg: lw, gap });
      if (kl > 0) { gg.save(); gg.translate(540, base - 230); gg.scale(kl, kl); G.txt(gg, "<", 0, 0, { size: 150, fill: "#F4EEDC", stroke: "#1A1020", sw: 14 }); gg.restore(); }
    });
    G.fim(g, t, ctx);
  },
});
