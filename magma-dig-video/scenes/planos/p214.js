/* p214 · C4 Toca · "A pepita no colo."
 * Plano médio: o Zeca sentado no chão (mesmo lugar do fim do p213), a pepita no colo entre as duas patas.
 * Ele olha para ela; no "pepita" aproxima as patas e a luz laranja fraca sobe no rosto; no "colo" pisca devagar
 * (fecha e abre os olhos, cansado). Respiração lenta, push-in lento até o último quadro. */
MD.plano("p214", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tPe = GB.wt(ctx, "pepita", 0.2), tCo = GB.wt(ctx, "colo", 0.9);
    const junta = ART.map(t, tPe - 0.1, tPe + 0.35, 0, 1, "inOutSine");
    const cena = GB2.toca({ lamp: 0.7, janela: 0.7 });
    const cam = ART.camera(t, { push: [2.15, 2.3], dur, ease: "linear" });
    const ZS = GB2.ZS;
    GB.mira(cam, 1, ZS.x + 15 + ART.map(t, 0, dur, -4, 4), ZS.y - 175, 540, 900);
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { tracinhos: true, riscados: 3 }),
      luz: (gg, tt, c) => GB.tocaLuz(gg, tt, c, { lamp: 0.7, janela: 0.7 }),
    });
    // fundo um pouco mais escuro (profundidade): o rosto e a pepita mandam
    g.save(); g.fillStyle = "rgba(14,8,22,.35)"; g.fillRect(0, 0, 1080, 1920); g.restore();
    // piscada lenta no "colo"
    const ph = clamp((t - tCo - 0.05) / 0.6), pisca = ph > 0 && ph < 1 ? Math.sin(Math.PI * ph) : 0;
    const resp = Math.sin(t * 1.9);
    const base = ART.zeca.pose("sentado", t, {
      x: ZS.x, y: ZS.y, s: GB2.Z.s, turn: -0.22, lamp: 0, segura: null,
      aF: 5 + 6 * junta, eF: 30 + 14 * junta, aB: 5 + 6 * junta, eB: 30 + 14 * junta, bFrente: 1,
      headTilt: 16 + 2 * resp, headDy: 10, sq: 1 + 0.015 * resp, bob: -24 + 2 * resp,
      eyes: "preocupado", mouth: "triste", brows: "triste", blink: pisca,
      rim: "#C0606A", rimA: 0.45, banho: { cor: "#FF8A3C", k: 0.2 + 0.35 * junta }, blinkSeed: 0.6,
    });
    const pt = GB2.poseTela(cam, base);
    const A0 = GB2.ancoras(pt), [cx, cy] = GB2.colo(A0, pt.s);
    pt.alvo = [cx, cy];
    ART.zeca.draw(g, pt);
    GB2.pepita(g, t, cx, cy, pt.s, { brilho: 0.6 + 0.4 * junta });
    ART.glow(g, cx, cy - 120 * pt.s / 2, 300, "#FF8A3C", 0.12 * junta);
    ART.post(g, ctx.frame, { legendaK: 0.42 });
  },
});
