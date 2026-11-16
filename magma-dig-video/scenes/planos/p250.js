/* p250 · "Apagou." (C2) — close do rosto: a lanterna pisca duas vezes e apaga no estalo, junto com o cronômetro em 0,0.
 * No breu só os olhos brilham e continuam se mexendo (olham a mochila, piscam); um reflexo laranja das pepitas na
 * mochila pulsa embaixo. Câmera respira até o último quadro. */
MD.plano("p250", {
  async setup(ctx) {
    if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js");
    if (!window.GA2) await MD.loadScript("../scenes/planos/_grupoA_ep02.js");
    return {};
  },
  render(g, t, ctx) {
    const D = ctx.dur || 1.1, tp = GA.m(ctx, "apagar", 0, 0.1);
    const tOff = Math.min(D * 0.5, tp + 0.3);
    const lamp = ART.kf(t, [[0, 0.7], [tOff * 0.25, 0.15], [tOff * 0.42, 0.75], [tOff * 0.62, 0.05], [tOff * 0.8, 0.5], [tOff, 0]]);
    const esc = ART.kf(t, [[0, 0.25], [tOff * 0.25, 0.75], [tOff * 0.42, 0.3], [tOff * 0.62, 0.85], [tOff * 0.8, 0.5], [tOff + 0.02, 1]]);
    const cron = GA.cron(t, D, 0, 0, [[0, 0.4], [tOff, 0.0], [D + 1, 0.0]]);
    const br = Math.sin(t * 2.4) * 0.02;
    const cam = GA.cam(395, 930, ART.lerp(3.1, 3.35, ART.prog(t, 0, D, "inOutSine")) + br, { sx: Math.sin(t * 1.3) * 6 }, { sy: 800 });
    const olhar = ART.prog(t, tOff + 0.05, Math.min(D, tOff + 0.45), "inOutSine");
    const pisca = ART.pulse(t, tOff + (D - tOff) * 0.62, 0.16); let olhos = [];
    ART.palco(g, t, cam, ART.cenas.mina({ luz: 0.6 * (1 - esc), lanternas: true }), gg => {
      const pose = ART.zeca.pose("parado", t, { ...GA.Z, turn: ART.lerp(0.8, 0.45, olhar), tool: "picareta", lamp, cone: 0.5 * lamp, coneAng: 30, blink: pisca, eyes: "aberto", brows: esc > 0.5 ? "preocupado" : "nenhum", mouth: esc > 0.5 ? "o" : "neutro", look: [ART.lerp(0.6, -0.5, olhar) + 0.15 * Math.sin(t * 3), ART.lerp(0, 0.6, olhar)], rim: "#B58CFF" });
      const A = esc > 0.02 ? ART.zeca.drawEscuro(gg, pose, esc) : ART.zeca.draw(gg, pose); olhos = A.olhos || [];
    }, { frame: ctx.frame });
    g.save(); g.fillStyle = `rgba(4,3,8,${0.72 * esc})`; g.fillRect(0, 0, 1080, 1920); g.restore();
    // olhos acima do escurecimento: brilham, piscam e passeiam até o corte (como o p08)
    if (esc > 0.3) for (const q of olhos) {
      const op = 1 - pisca, lx = (ART.lerp(0.6, -0.5, olhar) + 0.15 * Math.sin(t * 3)) * 7;
      ART.glow(g, q.x, q.y, 80, "#CFE8FF", 0.75 * esc * op);
      g.save(); g.globalAlpha = esc * op; g.fillStyle = "#FFFFFF";
      g.beginPath(); g.ellipse(q.x + 5 + lx, q.y - 7, 8, 8 * Math.max(0.15, op), 0, 0, Math.PI * 2); g.fill();
      ART.circ(g, q.x - 5 + lx, q.y + 7, 3.5); g.fill(); g.restore();
    }
    // reflexo laranja das pepitas na mochila (embaixo, atrás do Zeca), pulsando no breu
    const pp = GA.tela(cam, 300, 1070);
    ART.glow(g, pp[0], pp[1], 200, "#FF8A3C", esc * (0.35 + 0.12 * Math.sin(t * 5.5)));
    ART.glow(g, pp[0] + 30, pp[1] + 10, 60, "#FFC080", esc * 0.5);
    // poeira lenta na pouca luz que sobra
    ART.dust(g, t * 0.4, { count: 24, seed: 81, color: "#B9B0D8", alpha: 0.35 * esc, size: [1.5, 3.5], speed: 4 });
    GA2.hud(g, t, { cron });
  },
});
