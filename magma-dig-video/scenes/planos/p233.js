/* p233 · C4 Toca · "Porque quem tem pressa vende barato."
 * Close do rosto (mesmo lugar do p232): olhos determinados, meio sorriso; a luz fria do painel recorta o perfil
 * pela esquerda e a luz quente da luminária vem da direita. No "pressa" ele aperta os olhos e inclina de leve
 * para a frente; no "barato" faz um aceno curto e firme com a cabeça. Push-in lento até o último quadro. */
MD.plano("p233", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tPr = GB.wt(ctx, "pressa", 0.7), tBa = GB.wt(ctx, "barato", 1.9);
    const cena = GB2.toca({ lamp: 0.9, janela: 0.6 });
    const cam = ART.camera(t, { push: [2.6, 2.8], dur, ease: "linear" });
    const ZS = GB2.ZS, S = GB2.Z.s;
    GB.mira(cam, 1, ZS.x + 6 + ART.map(t, 0, dur, -3, 3), ZS.y - S * 150, 540, 840);
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { tracinhos: true, riscados: 3 }),
      luz: (gg, tt, c) => GB.tocaLuz(gg, tt, c, { lamp: 0.9, janela: 0.6 }),
    });
    // fundo bem escurecido e desfocado pela profundidade: só o rosto conta
    g.save(); g.fillStyle = "rgba(12,8,20,.55)"; g.fillRect(0, 0, 1080, 1920); g.restore();
    const inc = ART.map(t, tPr - 0.1, tPr + 0.3, 0, 1, "outCubic");
    const acena = Math.sin(Math.PI * clamp((t - tBa + 0.02) / 0.32));
    const resp = Math.sin(t * 2.2);
    const p = ART.zeca.pose("parado", t, {
      x: ZS.x, y: ZS.y, s: S, turn: -0.3, lamp: 0, aF: 8, eF: 12, aB: -8, eB: 12,
      lean: 3 * inc, headDy: 2 * resp + 7 * Math.max(0, acena), headTilt: -4 + 3 * inc - 4 * Math.max(0, acena),
      eyes: t > tPr - 0.05 && t < tBa + 0.5 ? "meio" : "determinado", mouth: "sorriso", brows: "bravo", camera: 0.55, blinkSeed: 0.9,
      rim: "#7FD8FF", rimA: 0.95, banho: { cor: "#7FD8FF", k: 0.3 },
    });
    GB2.zecaTela(g, cam, p);
    // brilho quente pela direita (luminária) e frio pela esquerda (painel)
    ART.glow(g, 1080, 700, 520, "#FFB548", 0.16);
    GB2.luzPainel(g, t, 0.75, { fx: 520, fy: 760, vidro: false });
    ART.post(g, ctx.frame, { legendaK: 0.42 });
  },
});
