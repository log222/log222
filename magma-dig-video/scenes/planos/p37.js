/* p37 · "Porque braço forte não serve de nada no escuro." (C2) — breu; um braço musculoso com picareta enorme golpeia
 * e não acerta nada; CRAC! cinza perdido no vazio. Zeca, pequeno, só os olhos no escuro, assiste. */
MD.plano("p37", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 2.78, tB = GA.w(ctx, "braco", 0, 0.33), tF = GA.w(ctx, "forte", 0, 0.81), tE = GA.w(ctx, "escuro", 0, 2.35);
    const golpe = tF - 0.05;
    const cam = ART.camera(t, { push: [1, 1.03], dur: D, hits: [golpe + 0.16], hitAmp: 10 });
    g.fillStyle = "#06050B"; g.fillRect(0, 0, 1080, 1920);
    ART.withLayer(g, cam, 0.4, gg => ART.palco(gg, t, { zoom: 1 }, ART.cenas.mina({ luz: 0, lanternas: false }), null, { post: false }));
    g.fillStyle = "rgba(4,3,8,.86)"; g.fillRect(0, 0, 1080, 1920);
    const rimK = 1 - ART.prog(t, tE, tE + 0.35);
    ART.withLayer(g, cam, 1, gg => ART.obj.bracoForte(gg, t, { t0: golpe, x: 1110, y: 560, s: 0.95, rim: ART.mix("#15121F", "#8E7BD8", rimK), breu: 0 }));
    ART.ui.crac(g, 330, 1060, t, golpe + 0.16, { apagado: true, s: 1.1, dur: 1.4, rot: 8 });
    // Zeca no canto, no escuro: só os olhos (vira para o golpe)
    ART.withLayer(g, cam, 1, gg => ART.zeca.drawEscuro(gg, ART.zeca.pose("parado", t, { x: 250, y: 1270, s: 1.25, turn: 0.4, alvo: [700, 800], eyes: t > golpe + 0.1 ? "espanto" : "aberto" }), 0.96));
    ART.post(g, ctx.frame, { vinheta: 0.8 });
  },
});
