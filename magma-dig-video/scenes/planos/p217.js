/* p217 · C5 Mercado · "Sobe, desce, sobe de novo."
 * Continua o gráfico do p216 (mesmo cartão, mesma câmera). Em cada palavra (nos três "ding") entra uma barra grande:
 * verde alta ("Sobe"), vermelha baixa ("desce"), verde alta ("sobe de novo"); a seta acompanha em cima da barra nova
 * (cima / baixo / cima) com um estalo. Câmera parada com um balanço leve no ritmo. */
MD.plano("p217", {
  async setup() {
    if (!window.GC5) await (window.__GC5_P = window.__GC5_P || MD.loadScript("../scenes/planos/_grupoC5_ep02.js"));
    await GC5_LOAD(); return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, G = window.GC5, u = ART.ui, { clamp } = G, D = ctx.dur, R = G.GRAF;
    const ms = MD.marks(ctx, "ding").slice().sort((a, b) => a - b);
    const ts = [ms[0] ?? G.wt(ctx, "sobe", 0.04), ms[1] ?? G.wt(ctx, "desce", 0.84), ms[2] ?? G.wt(ctx, "sobe", 1.61, 1)];
    const B = G.B216.concat([0.88, 0.3, 0.92]), cores = []; cores[12] = "#5FD35F"; cores[13] = "#E63748"; cores[14] = "#5FD35F";
    const d = 5 + G.degraus(t, ts.map(x => x - 0.02), 0.28, "inOutCubic");
    let n = -1; ts.forEach((t0, i) => { if (t >= t0 - 0.02) n = i; });
    let balanco = 0; for (const t0 of ts) balanco += G.hit(t, t0, 0.5);
    G.fundo(g, t + 3.6, { dx: -30 + ART.map(t, 0, D, 0, -12), z: 1.1, escuro: 0.12 });
    const cam = G.cam(1.1 + 0.012 * balanco, 560 + 6 * Math.sin(t * 2.2), 840, 540, 780 + 4 * Math.sin(t * 3.1));
    G.painel(g, cam, gg => {
      G.grafSemana(gg, t, { d, barras: B, cores });
      if (n >= 0) {
        const i = 12 + n, up = n !== 1, cor = up ? "#5FD35F" : "#E63748";
        const x = R.x + (i - d) * R.passo + R.bw / 2;
        const cresce = ART.ease.outBack(clamp((d + 7 - i) * 1.5)), topo = R.y + R.h - R.h * B[i] * cresce;
        const pop = ART.ease.outBack(clamp((t - ts[n] + 0.02) / 0.22)), sp = G.hit(t, ts[n], 0.5);
        const sy = up ? topo - 95 : topo - 95;
        ART.glow(gg, x, sy, 200, cor, 0.3 + 0.4 * sp);
        u.seta(gg, x, sy - (up ? 14 : -14) * sp, { s: 0.78 * pop, dir: up ? "cima" : "baixo" });
        if (sp > 0) ART.glow(gg, x, topo, 150, cor, 0.5 * sp);
      }
    });
    G.fim(g, t, ctx);
  },
});
