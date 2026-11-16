/* p210 · C5 Mercado · "Hoje, paga vinte."
 * Mesmo enquadramento do p209 (sem salto; o empurrão continua). No "Hoje" o 40 leva um risco vermelho; no "paga" o
 * número rola para baixo como um odômetro e só pousa no 20 no "vinte". No "vinte": −50% em vermelho com seta
 * vermelha para baixo, a barra de hoje cresce só até a metade (vermelha), o botão vira VENDER +20 moedas,
 * o "ONTEM 40" fica riscado no canto e a câmera dá um tranco. */
MD.plano("p210", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, u = ART.ui, { clamp } = G, D = ctx.dur;
    const tHoje = G.wt(ctx, "hoje", 0.04), tPaga = G.wt(ctx, "paga", 0.91), tV = G.wt(ctx, "vinte", 1.32);
    // rola: 0–0,3 risco (no "Hoje") · 0,3–0,85 número rolando (do "paga" ao "vinte") · 0,85–1 fantasma ONTEM 40
    const t0 = tHoje + 0.25, tPouso = tV + 0.03;
    const rk = t < tPaga ? 0.3 * clamp((t - t0) / Math.max(0.1, tPaga - t0)) : t < tPouso ? 0.3 + 0.55 * clamp((t - tPaga) / (tPouso - tPaga)) : 0.85 + 0.15 * clamp((t - tPouso) / 0.6);
    const hoje = 0.33 * ART.ease.outBack(clamp((t - tV + 0.02) / 0.35));
    const varK = ART.prog(t, tV, tV + 0.3);
    const bate = G.hit(t, tV, 0.5);
    const k = ART.ease.inOutSine(clamp(t / D));
    G.fundo(g, t, { dx: ART.map(t, 0, D, 5, 25), z: 1.08, escuro: 0.1 + 0.12 * varK, tinta: `rgba(90,10,20,${0.12 * varK})` });
    const cam = G.cam(ART.lerp(1.06, 1.1, k), ART.lerp(570, 600, k), 860, 540, 880 + bate * 9 * Math.sin(t * 55));
    G.painel(g, cam, gg => {
      const c = ART.painelMercado(gg, t, { textoEscala: G.TXT, precoAntes: 40, preco: 20, rola: rk, varPct: -50, varK, seta: 0, botaoSub: t >= tV ? "+20 moedas" : null, botaoPulso: G.hit(t, tV, 0.5),
        barras: G.B_N3.concat([Math.max(0.001, hoje)]), cores: [0, 0, 0, 0, 0, "#FFD23F"], corHoje: "#E63748", amanha: false });
      const s = 1.55;
      // seta vermelha para baixo ao lado do −50% (queda de hoje, fato do Mercado)
      if (varK > 0) { u.seta(gg, c.x0 + 330 * s, c.y0 + 124 * s, { s: 0.45 * ART.ease.outBack(varK), dir: "baixo" }); }
      if (bate > 0) ART.glow(gg, c.x0 + c.w - 150, c.y0 + 270 * s, 320, "#E63748", 0.55 * bate);
    });
    G.fim(g, t, ctx);
  },
});
