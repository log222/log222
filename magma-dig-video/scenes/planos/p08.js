/* p08 · "Apagou, é noite." (C2) — close do rosto; a lanterna pisca duas vezes e apaga; no escuro só os olhos brilham.
 * Cronômetro em 0,0. Câmera parada com leve respiração. */
MD.plano("p08", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const tp = GA.m(ctx, "apagar", 0, 0.1);
    const lamp = ART.kf(t - tp, [[-1, 1], [0, 1], [0.02, 0], [0.1, 0], [0.13, 0.6], [0.2, 0], [0.26, 0.35], [0.32, 0]]);
    const esc = ART.kf(t - tp, [[0, 0], [0.02, 0.85], [0.12, 0.85], [0.14, 0.4], [0.2, 0.9], [0.26, 0.6], [0.34, 1]]);
    const D = ctx.dur || 1.2, br = Math.sin(t * 2.2) * 0.008;
    const cam = GA.cam(540, ART.lerp(930, 905, ART.prog(t, 0, D)), ART.lerp(3.5, 4.1, ART.prog(t, 0, D, "inOutSine")) + br, {}, { sy: 800 });
    const cena = ART.cenas.mina({ luz: 1 - esc, lanternas: true });
    ART.palco(g, t, cam, cena, gg => {
      const pose = ART.zeca.pose("parado", t, { x: 540, y: 1182, s: 1.62, turn: 0.15, camera: 0.8, lamp, cone: 0.5, eyes: "aberto", look: [Math.sin(Math.max(0, t - tp - 0.4) * 2.6) * 0.8 * esc, -0.4 * esc + 0.25 * Math.sin(t * 1.7) * esc], blinkSeed: 0.6, brows: esc > 0.3 ? "preocupado" : "nenhum", mouth: esc > 0.3 ? "o" : "neutro", rim: "#B58CFF" });
      const A = esc > 0.01 ? ART.zeca.drawEscuro(gg, pose, esc) : ART.zeca.draw(gg, pose); ART._p08lamp = A.lanterna;
    }, { frame: ctx.frame });
    g.save(); g.fillStyle = `rgba(4,3,8,${0.75 * esc})`; g.fillRect(0, 0, 1080, 1920); g.restore();
    // filamento esfriando (laranja que some devagar até o corte)
    const ember = esc * (1 - ART.prog(t, tp + 0.4, D)) * 0.8;
    if (ember > 0 && ART._p08lamp) ART.glow(g, ART._p08lamp.x, ART._p08lamp.y, 60, "#FF8A3C", ember);
    GA.hud(g, t, { cron: 0 });
  },
});
