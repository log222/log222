/* p206 · C5 Mercado · "E a seta errou."
 * Painel do Mercado da noite dois (estado do p53/p55: Cobre HOJE PAGA 40, seta verde de AMANHÃ para cima).
 * Cartão inteiro no quadro (sem botão), com a seta em destaque: ela começa a tremer no "seta", gira 180° e cai vermelha para baixo no "errou" (tranco de câmera
 * e brilho vermelho). Empurrão lento até o último quadro. */
MD.plano("p206", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, { clamp } = G, D = ctx.dur;
    const tSeta = G.wt(ctx, "seta", 0.36), tErr = G.wt(ctx, "errou", 0.76);
    const tremor = clamp((t - tSeta + 0.25) / 0.3) * (1 - clamp((t - tErr - 0.1) / 0.15));
    const giro = ART.prog(t, tSeta + 0.12, tErr + 0.3);
    const bate = G.hit(t, tErr + 0.22, 0.5);
    G.fundo(g, t, { dx: ART.map(t, 0, D, 10, -14), z: 1.1, escuro: 0.15 });
    const cam = G.cam(ART.map(t, 0, D, 1.08, 1.14, "inOutSine"), 540, 700, 540, 760);
    cam.cy += bate * 10 * Math.sin(t * 50);
    G.painel(g, cam, gg => {
      const c = ART.painelMercado(gg, t, { textoEscala: G.TXT, preco: 40, varPct: 12, seta: 1, setaGiro: giro, tremor, botao: false });
      const sx = c.x0 + c.w - 30, sy = c.y0 - 20;
      if (giro > 0.5) ART.glow(gg, sx, sy + 40, 260, "#E63748", (0.25 + 0.5 * bate) * ART.smooth(clamp((giro - 0.5) * 2)));
      else ART.glow(gg, sx, sy, 220, "#5FD35F", 0.25 * (1 - giro));
    });
    G.fim(g, t, ctx);
  },
});
