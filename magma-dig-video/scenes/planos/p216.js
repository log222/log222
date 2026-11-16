/* p216 · C5 Mercado · "No Mercado, o preço anda todo dia."
 * Close do gráfico de preço do Cobre (sem número: o preço "anda"). O gráfico desliza para a esquerda: a cada sílaba
 * forte (Mercado, preço, anda, todo, dia) entra uma barra nova pela direita e a mais velha sai pela esquerda.
 * A câmera desliza da esquerda para a direita. O p217 continua daqui, sem salto. */
MD.plano("p216", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, D = ctx.dur;
    const ts = [G.wt(ctx, "mercado", 0.36), G.wt(ctx, "preco", 1.4), G.wt(ctx, "anda", 1.96), G.wt(ctx, "todo", 2.36), G.wt(ctx, "dia", 2.68)];
    const d = G.degraus(t, ts.map(x => x - 0.02), 0.3, "inOutCubic");
    G.fundo(g, t, { dx: ART.map(t, 0, D, 30, -30), z: 1.1, escuro: 0.12 });
    const cam = G.cam(1.1, ART.map(t, 0, D, 520, 560, "inOutSine"), 840, 540, 780);
    G.painel(g, cam, gg => {
      G.grafSemana(gg, t, { d, barras: G.B216 });
      // brilho na barra que acabou de entrar
      for (const t0 of ts) { const p = G.hit(t, t0 + 0.15, 0.5); if (p > 0) ART.glow(gg, G.GRAF.xHoje, G.GRAF.y + G.GRAF.h * 0.4, 160, "#FFD23F", 0.45 * p); }
    });
    G.fim(g, t, ctx);
  },
});
