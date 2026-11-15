/* p44 · "E no segundo comprado," (C2) — contra-plongée: o Zeca ergue a picareta velha em câmera lenta; poeira lenta.
 * Cronômetro em 0,9 (vermelho). */
MD.plano("p44", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.28;
    const ph = ART.lerp(0.05, 0.5, ART.prog(t, 0, D, "outSine" in ART.ease ? "outSine" : "outQuad"));    // só a subida, lenta
    const cam = GA.cam(470, 860, ART.lerp(2.3, 2.45, ART.prog(t, 0, D)), { rot: -4 }, { sy: 900 });
    ART.palco(g, t, cam, ART.cenas.mina({}), gg => {
      ART.zeca.draw(gg, ART.zeca.pose("cavando", ph * 0.9, { ...GA.Z, turn: 0.7, lamp: 0.85 + 0.15 * ART.zeca.falha(t, 0.4, 7), cone: 0.6, rim: "#FFC88A", rimA: 0.9, t }, { periodo: 0.9 }));
    }, { frame: ctx.frame });
    ART.dust(g, t * 0.3, { count: 50, seed: 9, color: "#FFE6B8", alpha: 0.7, size: [2, 6], speed: 5 });
    GA.hud(g, t, { cron: GA.cron(t, D, 1.0, 0.7), max: 11, escala: 11 });
  },
});
