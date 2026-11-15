/* p34 · C5 painel Habilidades · "Mina, Força, Valor, Tempo, Poderes, Forja, Ajudantes."
 * Mais perto que o p33: a câmera desce pela coluna em trancos, um ramo por nome (no clique de cada palavra),
 * e cada cartão acende na sua cor com um estalo (escala + brilho). Todos continuam no nível 0. */
MD.plano("p34", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur, u = ART.ui;
    const NOMES = ["mina", "forca", "valor", "tempo", "poderes", "forja", "ajudantes"];
    const cl = (ctx.marks && ctx.marks.clique && ctx.marks.clique.length === 7) ? ctx.marks.clique : NOMES.map((n, i) => GB.wt(ctx, n, 0.04 + i * 0.5));
    const Y0 = 462, GAP = 117, S = 0.92, cc = i => Y0 + i * GAP + 61;
    // índice "contínuo" da câmera: tranco com overshoot a cada nome
    let idx = 0; for (let k = 1; k < 7; k++) idx += ART.ease.outBack(clamp((t - cl[k] + 0.03) / 0.2));
    const tr = (ART.lerp(cc(0), cc(6), idx / 6));
    GB.fundoC5(g, t, { dy: -idx * 18, z: 1.12 });
    let shake = 0; for (const c of cl) shake += GB.hit(t, c, 0.18);
    const cam = { z: 1.26 + 0.015 * idx, cx: 540, cy: 840, px: 540, py: tr, sy: shake * 6 };
    GB.noPainel(g, cam, gg => {
      u.cartao(gg, 140, 440, 800, 860, { r: 40, cor: "rgba(20,18,31,.72)", borda: "rgba(255,255,255,.10)" });
      u.titulo(gg, 540, 350, "HABILIDADES", { s: 0.92 });
      GB.colRamos(gg, i => {
        const k = ART.ease.outCubic(clamp((t - cl[i] + 0.02) / 0.12));
        const pop = GB.hit(t, cl[i], 0.35);
        return { aceso: k, nivel: 0, a: 0.78 + 0.22 * k, esc: 1 + 0.07 * pop, flash: pop, pulso: pop * 0.8 };
      }, { y0: Y0, gap: GAP, s: S });
    });
    g.save(); g.fillStyle = ART.lg(g, 0, 1120, 0, 1560, [[0, "rgba(12,10,22,0)"], [0.45, "rgba(12,10,22,.6)"], [1, "rgba(12,10,22,.75)"]]); g.fillRect(0, 1120, 1080, 800); g.restore();
    ART.vignette(g, 0.55); ART.faixaLegenda(g, 0.3); ART.grain(g, ctx.frame, 0.05);
  },
});
