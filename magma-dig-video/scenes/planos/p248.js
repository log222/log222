/* p248 · "Foi nesses dois que achou o veio." (C2) — os dois segundos a mais: o Zeca golpeia (som grave), a parede racha e
 * veios laranja de cobre crescem por dentro até VEIO, como no p45; luz laranja no rosto, olhos arregalam. Close do
 * impacto com o Zeca inteiro à esquerda; tremor. Cronômetro 2,0 → 1,6 (pulo para baixo no corte: permitido). */
MD.plano("p248", {
  async setup(ctx) {
    if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js");
    if (!window.GA2) await MD.loadScript("../scenes/planos/_grupoA_ep02.js");
    return {};
  },
  render(g, t, ctx) {
    const D = ctx.dur || 2.84, h = GA.m(ctx, "picareta", 0, 0.05), tV = GA.w(ctx, "veio", 0, D * 0.8);
    const veios = ART.prog(t, h + 0.15, Math.max(h + 0.5, tV + 0.15), "inOutSine"), crack = ART.prog(t, h, h + 0.12) * 2.6;
    const c0 = GA.centroBloco(), imp = [c0[0] - 70, c0[1] - 50];
    const mov = ART.camera(t, { push: [1, 1.07], dur: D, hits: [h, h + 0.03], hitAmp: 24, hitDur: 0.45 });
    const cam = GA2.camClose(mov, 1.9);
    ART.palco(g, t, cam, ART.cenas.mina({ luz: 0.8 }), gg => {
      ART.cubo(gg, GA.B.X, GA.B.Z, { crack, seed: 9, veios, t, crackGlow: veios > 0.2 ? "#FFB060" : null });
      ART.zeca.draw(gg, ART.zeca.seq(t, [
        [0, "cavando", { eyes: "determinado", mouth: "esforco" }, { periodo: 0.8, t0: h - 0.53 }],
        [h + 0.3, "parado", { eyes: "aberto", mouth: "neutro", alvo: [c0[0], c0[1] - 30], tool: "picareta" }],
        [Math.max(h + 0.6, tV - 0.2), "parado", { eyes: "espanto", mouth: "o", brows: "surpreso", alvo: [c0[0], c0[1] - 30], tool: "picareta", lean: 0.08 }],
      ], { base: { ...GA.Z, turn: 0.84, lamp: 1, cone: 0.6, coneAng: 30, rim: "#FF9A50", rimA: 0.5 + 0.5 * veios, banho: { cor: "#FF8A3C", k: 0.7 * veios } }, blend: 0.25 }));
      GA2.lascas(gg, t, h, imp[0], imp[1], 48, { faisca: "#FFC070", n: 16, fa: 18 });
    }, { frame: ctx.frame });
    GA2.flash(g, t, h, "rgba(255,230,190,.18)", 0.034);
    g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = `rgba(255,120,40,${0.08 * veios})`; g.fillRect(0, 0, 1080, 1920); g.restore();
    ART.dust(g, t, { count: 36, seed: 62, color: "#FFB070", alpha: 0.7 * veios, size: [2, 5], speed: 8, x: 300, w: 760, y: 600, h: 700 });
    ART.ui.crac(g, 800, 640, t, h, { s: 1.6, rot: -5, dur: 1.0 });
    GA2.hud(g, t, { cron: GA.cron(t, D, 2.0, 1.6), moedas: 6 });
  },
});
