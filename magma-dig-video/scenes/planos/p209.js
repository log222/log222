/* p209 · C5 Mercado · "Ontem, o cobre pagava quarenta."
 * Painel frontal (layout da Parte 1, sem a seta): cartão do Cobre com o rótulo ONTEM. No "Ontem" a barra de ontem
 * (alta, amarela) brilha no gráfico; no "cobre" o ícone pulsa; o preço fica "?" até o "quarenta", quando o 40 estoura.
 * A barra de hoje ainda não existe e o botão diz só VENDER (o valor de hoje entra no p210).
 * Empurrão lento até o 40, que continua sem salto no p210. */
MD.plano("p209", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, u = ART.ui, D = ctx.dur;
    const tOn = G.wt(ctx, "ontem", 0.04), tCob = G.wt(ctx, "cobre", 1.26), tQ = G.wt(ctx, "quarenta", 2.3);
    const k = ART.ease.inOutSine(ART.clamp(t / D));
    G.fundo(g, t, { dx: ART.map(t, 0, D, -25, 5), z: 1.08, escuro: 0.1 });
    const cam = G.cam(ART.lerp(1.0, 1.06, k), ART.lerp(540, 570, k), 860, 540, 880);
    const pop = G.hit(t, tQ, 0.45), pc = G.hit(t, tCob, 0.6), po = G.hit(t, tOn, 0.8);
    G.painel(g, cam, gg => {
      const c = ART.painelMercado(gg, t, { preco: t >= tQ ? 40 : "?", rotuloPreco: "ONTEM", varPct: false, seta: 0, botao: false,
        barras: G.B_N3.concat([0]), cores: [0, 0, 0, 0, 0, "#FFD23F"], amanha: false });
      const s = 1.55;
      // barra de ontem acende no "Ontem" (e fica com brilho leve)
      const bw = (250 * s - 250 * s * 0.035 * 6) / 7, bx = c.x0 + 36 * s + 5 * (bw + 250 * s * 0.035), bh = 160 * s * 0.66;
      ART.glow(gg, bx + bw / 2, c.y0 + 180 * s + 160 * s - bh, 150, "#FFD23F", 0.25 + 0.5 * po);
      if (pc > 0) ART.glow(gg, c.x0 + 87 * s, c.y0 + 87 * s, 200, "#FF8A3C", 0.7 * pc);
      // botão sem valor (o preço de hoje ainda não foi dito)
      u.botao(gg, 540, 1130, 720, 150, { texto: "VENDER", icone: "moeda" });
      // estouro do 40
      const px = c.x0 + c.w - 36 * s - 90, py = c.y0 + 270 * s;
      if (pop > 0) ART.glow(gg, px, py, 300, "#FFD23F", 0.7 * pop);
      if (t > tQ) for (const p of ART.burst(t, { t0: tQ, count: 12, x: px, y: py, speed: [300, 700], angle: [-170, -10], gravity: 1500, life: [0.4, 0.7], seed: 209 })) u.moeda(gg, p.x, p.y, 14, p.rot * 0.05 + p.i, {});
    });
    G.fim(g, t, ctx);
  },
});
