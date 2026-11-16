/* p249 · "Cobre. Cobre. Cobre." (C2) — três golpes rápidos no veio, nos marks de picareta; a cada um uma pepita de cobre
 * salta e voa em arco até o contador de cobre (1 → 4, no plim grave). Câmera na mão. Cronômetro 1,6 → 0,4; a partir
 * de 1,0 fica vermelho e a lanterna começa a falhar (ART.zeca.falha), cada vez mais. */
MD.plano("p249", {
  async setup(ctx) {
    if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js");
    if (!window.GA2) await MD.loadScript("../scenes/planos/_grupoA_ep02.js");
    return {};
  },
  render(g, t, ctx) {
    const D = ctx.dur || 2.56, H = GA.ms(ctx, "picareta"), M = GA.ms(ctx, "moeda");
    if (H.length < 3) H.push(...[0.05, D * 0.33, D * 0.62].slice(H.length));
    while (M.length < H.length) M.push(H[M.length] + 0.3);
    const cron = GA.cron(t, D, 1.6, 0.4);
    const kf = ART.clamp((1.0 - cron) / 0.6);                                 // 0 em 1,0 → 1 em 0,4
    const lamp = cron > 1.0 ? 1 : ART.lerp(1, 0.25, kf * 0.5) * ART.zeca.falha(t, 0.35 + 0.6 * kf, 11) + 0.05;
    const c0 = GA.centroBloco(), imp = [c0[0] - 70, c0[1] - 40];
    const mov = ART.camMais(ART.camera(t, { push: [1, 1.05], dur: D, hits: H, hitAmp: 14, hitDur: 0.22 }), GA2.mao(t, 1));
    const cam = GA2.camMedio(mov, 1.68);
    const luz = 0.55 + 0.45 * lamp;
    ART.palco(g, t, cam, ART.cenas.mina({ luz: 0.35 + 0.5 * lamp }), gg => {
      ART.cubo(gg, GA.B.X, GA.B.Z, { crack: 2.6, seed: 9, veios: 0.75 + 0.25 * luz, t, crackGlow: "#FFB060" });
      ART.zeca.draw(gg, GA.cava(t, H, { ...GA.Z, turn: 0.85, lamp, cone: 0.6 * lamp, coneAng: 46, rim: "#FF9A50", rimA: 0.8, sweat: 0.5 + 0.5 * kf, eyes: "determinado", banho: { cor: "#FF8A3C", k: 0.55 } }, { periodoMax: 0.75 }));
      for (const hh of H) GA2.lascas(gg, t, hh, imp[0], imp[1], 60 + hh * 9, { faisca: "#FFC070", cor1: "#C98A5A", n: 10 });
    }, { frame: ctx.frame });
    // escurece junto com a lanterna que falha
    g.save(); g.fillStyle = `rgba(4,3,8,${0.45 * (1 - lamp) * kf})`; g.fillRect(0, 0, 1080, 1920); g.restore();
    const bs = GA.tela(cam, imp[0], imp[1] - 10);
    H.forEach((hh, i) => GA2.voa(g, t, hh + 0.02, M[i], bs, [250, 448], (gg, x, y, k) => ART.pepita(gg, x, y, 34 * (1 - 0.35 * k), "cobre", t * 7 + i, { seed: i + 2, brilho: 0.5 }), 260));
    H.forEach((hh, i) => ART.ui.crac(g, 780 + (i % 2) * 40, 560 - i * 8, t, hh, { s: 1.05, rot: i % 2 ? 6 : -6, dur: 0.45, cor: "#FF9A50" }));
    GA2.hud(g, t, { cron, moedas: 6, cobre: 1 + GA.n(t, M), pulsoCobre: GA.pulsos(t, M, 0.3) });
  },
});
