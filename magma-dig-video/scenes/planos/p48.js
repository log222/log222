/* p48 · "Sem esse segundo, ficava no escuro." (C2) — a mesma parede, agora sem lanterna: o veio laranja vai sumindo no
 * preto; o Zeca vira silhueta e sobra o brilho dos olhos em ESCURO. Plano parado, escurecimento lento. */
MD.plano("p48", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 2.21, tE = GA.w(ctx, "escuro", 0, 1.69);
    const esc = ART.prog(t, 0.1, tE + 0.2, "inOutSine"), veios = 1 - ART.prog(t, 0.4, tE + 0.3, "inQuad");
    const cam = GA.cam(560, 980, 2.1, {}, { sy: 820 });
    ART.palco(g, t, cam, ART.cenas.mina({ luz: 0.5 * (1 - esc), lanternas: false }), gg => {
      ART.cubo(gg, GA.B.X, GA.B.Z, { crack: 2.6, seed: 9, veios, t, escuro: 0.7 * esc });
      const pose = ART.zeca.pose("parado", t, { ...GA.Z, turn: 0.75, lamp: 0, alvo: [700, 980], banho: { cor: "#FF8A3C", k: 0.6 * veios } });
      if (esc > 0.05) ART.zeca.drawEscuro(gg, pose, esc); else ART.zeca.draw(gg, pose);
    }, { frame: ctx.frame });
    g.save(); g.fillStyle = `rgba(3,2,6,${0.72 * esc})`; g.fillRect(0, 0, 1080, 1920); g.restore();
  },
});
