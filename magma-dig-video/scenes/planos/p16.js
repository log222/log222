/* p16 · "O preço pra subir de rank" (C3) — screenshot real do Mercado em tela cheia, perto do botão SUBIR DE RANK
 * (rank e preço 10,4BI borrados). O botão (cinza no save do trailer) é redesenhado em amarelo no mesmo lugar; a pata aperta em RANK. */
MD.plano("p16", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preloadShot("shot_4"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.49, tR = GA.w(ctx, "rank", 0, D * 0.75), press = ART.pulse(t, tR - 0.04, 0.25);
    const v = ART.gameplay.cheio(g, t, { img: "shot_4", dur: D, topo: 0, base: 588, foco: [968, 250], zoom: [1.5, 1.62], tapar: [[770, 85, 420, 100]] });
    const a = v.map(785, 207), b = v.map(1155, 268), cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2;
    const bw = Math.min(840, b[0] - a[0]), bh = (b[1] - a[1]);
    ART.ui.botao(g, Math.min(cx, 540), cy, bw, bh, { texto: "★ SUBIR DE RANK", press });
    if (press > 0) ART.glow(g, Math.min(cx, 540), cy, 520, "#FFD23F", 0.4 * press);
    const k = ART.prog(t, 0.15, tR - 0.04, "outCubic");
    ART.pata(g, ART.lerp(1150, 760, k), ART.lerp(cy + 260, cy + 40 + 15 * press, k), -40, { s: 0.75, dedos: "aponta" });
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.32 });
  },
});
