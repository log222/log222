/* p37 · "Porque braço forte não serve de nada no escuro." (C2) — breu; um braço musculoso enorme, inteiro e em contraluz
 * desde o 1º quadro, golpeia com a picareta gigante e não acerta nada; CRAC! cinza perdido no vazio.
 * O Zeca, pequeno e separado, só os olhos no escuro, assiste. */
MD.plano("p37", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 2.78, tF = GA.w(ctx, "forte", 0, D * 0.3), tE = GA.w(ctx, "escuro", 0, D * 0.85);
    const golpe = tF - 0.1, imp = golpe + 0.16;
    const cam = ART.camera(t, { push: [1, 1.04], dur: D, hits: [imp], hitAmp: 10 });
    g.fillStyle = "#06050B"; g.fillRect(0, 0, 1080, 1920);
    // contraluz: um halo frio atrás do braço recorta a silhueta
    const fade = 1 - 0.6 * ART.prog(t, tE, tE + 0.4);
    ART.withLayer(g, cam, 0.6, gg => { ART.glow(gg, 760, 700, 760, "#5A4AA8", 0.55 * fade, "source-over"); ART.glow(gg, 860, 560, 360, "#8E7BD8", 0.35 * fade, "source-over"); });
    ART.withLayer(g, cam, 1, gg => ART.obj.bracoForte(gg, t, { t0: golpe, x: 1020, y: 880, s: 0.62, rim: ART.mix("#2A2340", "#B9A8FF", fade), breu: 0 }));
    ART.ui.crac(g, 330, 1080, t, imp, { apagado: true, s: 1.15, dur: 1.4, rot: 8 });
    ART.withLayer(g, cam, 1, gg => ART.zeca.drawEscuro(gg, ART.zeca.pose("parado", t, { x: 210, y: 1270, s: 1.15, turn: 0.4, alvo: [700, 800], eyes: t > imp ? "espanto" : "aberto" }), 0.96));
    ART.post(g, ctx.frame, { vinheta: 0.7 });
  },
});
