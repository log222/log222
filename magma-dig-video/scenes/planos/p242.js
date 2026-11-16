/* p242 · "Pedra, pedra, pedra." (C2) — três golpes nos marks de picareta, um bloco quebrado por golpe; CRAC! e uma moeda
 * voando ao contador em cada plim (0 → 3). Cortes internos no ritmo: plano médio → mais perto → contra-ângulo baixo.
 * Cronômetro 10,8 → 8,0 (max 11). Lanterna acesa com feixe no bloco. */
MD.plano("p242", {
  async setup(ctx) {
    if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js");
    if (!window.GA2) await MD.loadScript("../scenes/planos/_grupoA_ep02.js");
    return {};
  },
  render(g, t, ctx) {
    const D = ctx.dur || 2.75, H = GA.ms(ctx, "picareta"), M = GA.ms(ctx, "moeda");
    if (H.length < 3) H.push(...[0.05, D * 0.35, D * 0.65].slice(H.length));
    while (M.length < H.length) M.push(H[M.length] + 0.3);
    const c1 = (H[0] + H[1]) / 2 + 0.06, c2 = (H[1] + H[2]) / 2 + 0.06;
    const seg = t < c1 ? 0 : t < c2 ? 1 : 2, h = H[seg];
    const mov = ART.camera(t, { push: [1, 1.05], dur: D, hits: H, hitAmp: 16 });
    const cam = seg === 0 ? GA2.camMedio(mov, 1.6)
      : seg === 1 ? GA.cam(505, 1000, 1.85, mov, { sy: 830 })
      : ART.camMais(GA.cam(490, 1040, 1.7, mov, { sy: 900 }), { rot: -2.5 });
    const c0 = GA.centroBloco(), imp = [c0[0] - 70, c0[1] - 50];
    const crack = t >= h ? Math.min(3, ART.prog(t, h, h + 0.1) * 3) : 0;
    ART.palco(g, t, cam, ART.cenas.mina({}), gg => {
      ART.cubo(gg, GA.B.X, GA.B.Z, { crack, seed: 4 + seg * 3 });
      ART.zeca.draw(gg, GA.cava(t, H, { ...GA.Z, turn: 0.84, lamp: 1, cone: 0.5, coneAng: 30, rim: "#FFC88A", eyes: "determinado" }, { periodoMax: 0.9 }));
      ART.estouro(gg, t, { t0: h + 0.02, front: GA.frente(), seed: 20 + seg });
      for (const hh of H) GA2.lascas(gg, t, hh, imp[0], imp[1], 3 + hh * 10);
    }, { frame: ctx.frame });
    // moeda: salta do bloco e chega ao contador no plim
    const bs = GA.tela(cam, imp[0], imp[1] - 20);
    H.forEach((hh, i) => GA2.voa(g, t, hh + 0.02, M[i], bs, [250, 330], (gg, x, y, k) => ART.ui.moeda(gg, x, y, 32 * (1 - 0.3 * k), t * 9, { brilho: 0.4 })));
    H.forEach((hh, i) => ART.ui.crac(g, 790 + (i % 2) * 40, 640 - i * 15, t, hh, { s: 1.1, rot: i % 2 ? 6 : -7, dur: 0.6 }));
    M.forEach(m => ART.ui.flutua(g, 400, 470, t, m, { texto: "+1", s: 0.7 }));
    GA2.hud(g, t, { cron: GA.cron(t, D, 10.8, 8.0), moedas: GA.n(t, M), pulso: GA.pulsos(t, M) });
  },
});
