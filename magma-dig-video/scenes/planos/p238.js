/* p238 · C5 Mercado · "Um dia, vai ser o cobre."
 * Continua o p237 (mesmo painel, câmera sem salto). No "Um dia" a linha Cobre ×1 (20) acende e pisca com borda
 * dourada; no "vai ser" um fantasma do ícone do cobre sobe da linha até a faixa EM ALTA e chega no "cobre"
 * (paira sobre a vaga, sonhando com a alta), depois volta para a linha. Empurrão leve na linha do Cobre. */
MD.plano("p238", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, u = ART.ui, { clamp } = G, D = ctx.dur, L = G.ALTA;
    const tUm = G.wt(ctx, "um", 0.04), tVai = G.wt(ctx, "vai", 0.99), tCo = G.wt(ctx, "cobre", 1.64);
    const k = ART.ease.inOutSine(clamp(t / D));
    const aCo = 0.45 + 0.55 * ART.prog(t, tUm, tUm + 0.3);
    const pulso = ART.prog(t, tUm, tUm + 0.3) * (0.55 + 0.45 * Math.sin((t - tUm) * 7));
    G.fundo(g, t + 5.05, { dx: ART.map(t, 0, D, -12, -26), z: 1.1, escuro: 0.32 });
    const cam = G.camMix(G.cam(1.22, 540, 620, 540, 690), G.cam(1.24, 540, 630, 540, 695), k);
    let ic = null;
    G.painel(g, cam, gg => {
      const r = G.mercadoAlta(gg, t, { faixa: { minerio: "ferro", nome: "Ferro", k: 1, mk: 1 }, ferro: { a: 1 }, cobre: { a: aCo, pulso } });
      ic = r.cobre.icone;
    });
    // fantasma do ícone do cobre: sobe da linha até a faixa (chega no "cobre") e volta (px de tela)
    const P = (x, y) => [cam.cx + cam.z * (x - cam.px), cam.cy + cam.z * (y - cam.py)];
    const sobe = ART.ease.inOutCubic(clamp((t - tVai + 0.1) / (tCo + 0.05 - tVai + 0.1)));
    const volta = ART.ease.inOutCubic(clamp((t - tCo - 0.35) / Math.max(0.3, D - tCo - 0.45)));
    const kk = sobe * (1 - volta);
    if (t > tVai - 0.1) {
      const [x0, y0] = P(ic[0], ic[1]), [x1, y1] = P(560, L.faixa);
      const x = ART.lerp(x0, x1, kk) + Math.sin(kk * Math.PI) * 60, y = ART.lerp(y0, y1, kk);
      const a = 0.25 + 0.55 * Math.sin(Math.PI * clamp(kk * 1.05)) + 0.2 * kk;
      ART.glow(g, x, y, 150, "#FF9A4A", 0.45 * a);
      g.save(); g.globalAlpha = clamp(a); u.pix(g, "cobre", x, y, 70 * cam.z * (1 + 0.35 * kk)); g.restore();
      const pc = G.hit(t, tCo + 0.05, 0.6); if (pc > 0) ART.glow(g, x1, y1, 260, "#FFC531", 0.5 * pc);
    }
    G.fim(g, t + 5.05, ctx);
  },
});
