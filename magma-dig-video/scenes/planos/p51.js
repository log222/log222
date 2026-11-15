/* p51 · C5 Mercado · "Hoje, o cobre paga quarenta moedas."
 * Plano frontal do painel do Mercado (cartão do Cobre + botão VENDER). No "cobre" o ícone pulsa;
 * o preço fica "?" até o "quarenta", quando o 40 estoura com moedinhas (e o botão vira +40 moedas).
 * Empurrão lento até o valor. A seta de amanhã ainda não aparece (ela entra no p53). */
MD.plano("p51", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur, u = ART.ui;
    const tCobre = GB.wt(ctx, "cobre", 0.38), tPaga = GB.wt(ctx, "paga", 0.72), tQ = GB.wt(ctx, "quarenta", 1.1);
    GB.fundoC5(g, t, { dx: ART.map(t, 0, dur, -25, 25), z: 1.08, escuro: 0.1 });
    const trava = tQ - 0.01;   // o 40 pousa junto com a legenda "QUARENTA"
    const preco = t >= trava ? 40 : "?";   // o 40 estreia aqui, na palavra "quarenta" (o p49 termina só no título MERCADO)
    const pop = GB.hit(t, trava, 0.4);
    const z = ART.map(t, 0, dur, 1.0, 1.14, "inOutSine");
    GB.noPainel(g, { z, cx: 540, cy: 880, px: ART.map(t, 0, dur, 540, 620, "inOutSine"), py: 860 }, gg => {
      ART.painelMercado(gg, t, { preco, seta: 0, prog: 1, press: 0 });
      // ícone do cobre pulsa no "cobre"
      const pc = GB.hit(t, tCobre, 0.5); if (pc > 0) ART.glow(gg, 106 + 87 * 1.55, 390 + 87 * 1.55, 200, "#FF8A3C", 0.7 * pc);
      // estouro do preço
      if (pop > 0) ART.glow(gg, 830, 850, 300, "#FFD23F", 0.7 * pop);
      if (t > trava) for (const p of ART.burst(t, { t0: trava, count: 12, x: 830, y: 850, speed: [300, 700], angle: [-170, -10], gravity: 1500, life: [0.4, 0.7], seed: 9 })) u.moeda(gg, p.x, p.y, 14, p.rot * 0.05 + p.i, {});
    });
    ART.vignette(g, 0.5); ART.faixaLegenda(g, 0.4); ART.grain(g, ctx.frame, 0.05);
  },
});
