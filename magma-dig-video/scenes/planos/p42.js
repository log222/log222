/* p42 · "Ontem, a luz apagava aqui." (C2) — close do Zeca preocupado, a lanterna treme; a imagem preta de ontem
 * (o breu com os olhos dele) aparece em dupla exposição, mais forte em APAGAVA/AQUI. */
MD.plano("p42", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.73, tAp = GA.w(ctx, "apagava", 0, 0.81), tAq = GA.w(ctx, "aqui", 0, 1.37);
    const lamp = ART.zeca.falha(t, ART.prog(t, 0.2, tAp, "inQuad"), 5) * 0.9 + 0.1;
    const cam = GA.cam(520, 950, ART.lerp(2.4, 2.6, ART.prog(t, 0, D)), {}, { sy: 900 });
    const pose = ART.zeca.pose("preocupado", t, { x: 540, y: 1182, s: 1.62, turn: 0.35, lamp, cone: 0, alvo: [600, 500], rim: "#9FB4FF" });
    ART.palco(g, t, cam, ART.cenas.mina({ luz: lamp }), gg => ART.zeca.draw(gg, pose), { frame: ctx.frame, post: false });
    const k = ART.kf(t, [[0, 0.1], [tAp, 0.45, "inOutSine"], [tAq, 0.62], [D, 0.5]]);
    ART.duplaExposicao(g, d => { d.fillStyle = "#03020A"; d.fillRect(0, 0, 1080, 1920); ART.withLayer(d, cam, 1, gg => ART.zeca.drawEscuro(gg, Object.assign({}, pose, { lamp: 0, eyes: "aberto", brows: "nenhum", mouth: "neutro", rim: "#7FA0FF", rimA: 1 }), 0.62, { cor: "#9FC4FF" })); }, k, { dx: 46, dy: -10, escala: 1.06, tint: "rgba(40,70,160,.3)" });
    if (k > 0.3) { g.save(); g.font = '900 34px "Nunito"'; g.letterSpacing = "6px"; g.fillStyle = `rgba(160,190,255,${(k - 0.3) * 1.6})`; g.textAlign = "center"; g.fillText("ONTEM · 10,0 s", 540, 470); g.restore(); }
    // "ontem": a barra fantasma do cronômetro terminava aqui
    GA.hud(g, t, { cron: 1.0, max: 11, escala: 11 });
    ART.post(g, ctx.frame, {});
  },
});
