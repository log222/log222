/* p246 · "Crac." (C2) — close do impacto: o Zeca golpeia o bloco de ampulheta no som da picareta; o bloco estoura em
 * lascas claras e areia dourada que sobe em espiral; CRAC! dourado; tremor de câmera. Cronômetro 5,2 → 5,0. */
MD.plano("p246", {
  async setup(ctx) {
    if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js");
    if (!window.GA2) await MD.loadScript("../scenes/planos/_grupoA_ep02.js");
    return {};
  },
  render(g, t, ctx) {
    const D = ctx.dur || 0.77, h = GA.m(ctx, "picareta", 0, 0.04);
    const c0 = GA.centroBloco(), imp = [c0[0] - 70, c0[1] - 50];
    const mov = ART.camera(t, { push: [1, 1.06], dur: D, hits: [h, h + 0.03], hitAmp: 24, hitDur: 0.4 });
    const cam = GA2.camClose(mov, 1.95);
    const vivo = t < h + 0.03;
    ART.palco(g, t, cam, ART.cenas.mina({ luz: 0.85 }), gg => {
      if (vivo) ART.cubo(gg, GA.B.X, GA.B.Z, { especial: "ampulheta", t, brilho: 1, crack: ART.prog(t, h - 0.02, h + 0.03) * 3, seed: 6 });
      ART.zeca.draw(gg, GA.cava(t, [h], { ...GA.Z, turn: 0.84, lamp: 1, cone: 0.6, coneAng: 30, rim: "#FFC88A", eyes: t > h + 0.12 ? "espanto" : "determinado", mouth: t > h + 0.12 ? "o" : "esforco", banho: { cor: "#FFD23F", k: 0.6 * ART.prog(t, h, h + 0.2) } }, { periodo: 0.7 }));
      ART.estouroAreia(gg, t, { t0: h, front: GA.frente(), seed: 9 });
      GA2.lascas(gg, t, h, imp[0], imp[1], 46, { cor1: "#E2DCCB", cor2: "#C9C2B0", n: 10 });
    }, { frame: ctx.frame });
    GA2.flash(g, t, h, "rgba(255,226,150,.18)", 0.034);
    ART.ui.crac(g, 800, 640, t, h, { s: 1.5, rot: -6, dur: 0.75, cor: "#FFC531" });
    GA2.hud(g, t, { cron: GA.cron(t, D, 5.2, 5.0), moedas: 4 });
  },
});
