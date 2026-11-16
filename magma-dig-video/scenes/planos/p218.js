/* p218 · C4 Toca · "É a regra do mundo."
 * Plano geral (mesmo do fim do p213, push-in lento): o Zeca ainda sentado no chão com a pepita no colo.
 * Enche o peito (respira fundo) e olha para o painel (do lado da câmera); no "regra" balança a cabeça devagar,
 * aceitando; no "mundo" solta o ar de olhos fechados e o rosto relaxa (de triste para neutro). */
MD.plano("p218", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tRe = GB.wt(ctx, "regra", 0.35), tMu = GB.wt(ctx, "mundo", 0.95);
    const cena = GB2.toca({ numero: true, riscados: 3, lamp: 0.8, janela: 0.8 });
    const cam = ART.camera(t, { push: [1.21, 1.29], dur, ease: "linear" });
    GB.mira(cam, 1, 648 + ART.map(t, 0, dur, 0, 14), 1095, 540, 880);
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { seta: 1 }),
      luz: (gg, tt, c) => GB.tocaLuz(gg, tt, c, { lamp: 0.8, janela: 0.8 }),
    });
    // respiração: inspira até o "regra", segura, solta no "mundo"
    const insp = ART.map(t, 0, tRe, 0, 1, "inOutSine") * (1 - ART.map(t, tMu - 0.05, tMu + 0.6, 0, 1, "inOutSine"));
    const nao = clamp((t - tRe + 0.05) / Math.max(0.4, tMu - tRe + 0.1));        // balança a cabeça: 2 idas e voltas
    const balanca = nao > 0 && nao < 1 ? Math.sin(nao * Math.PI * 2) * Math.sin(nao * Math.PI) : 0;
    const solta = ART.map(t, tMu - 0.05, tMu + 0.35, 0, 1, "outSine");
    const fecha = clamp((t - tMu) / 0.12) * (1 - clamp((t - tMu - 0.55) / 0.18));
    const ZS = GB2.ZS;
    const p = ART.zeca.pose("sentado", t, {
      x: ZS.x, y: ZS.y, s: GB2.Z.s, turn: -0.22, lamp: 0, segura: null,
      aF: 5, eF: 30, aB: 5, eB: 30, bFrente: 1,
      sq: 1 + 0.045 * insp, bob: -24 + 7 * insp, lean: -3 * insp,
      alvo: [140, 820], headTurn: -0.18 + 0.16 * balanca, headTilt: 10 - 6 * insp + 4 * solta, headDy: 6 + 6 * solta,
      eyes: "preocupado", mouth: solta > 0.5 ? "neutro" : "triste", brows: solta > 0.6 ? "nenhum" : "triste", blink: fecha,
      rim: "#B58CFF", rimA: 0.5, blinkSeed: 0.6,
    });
    const A1 = GB2.zecaTela(g, cam, p);
    { const sZ = GB2.Z.s * A1.z, [cx, cy] = GB2.colo(A1, sZ); GB2.pepita(g, t, cx, cy, sZ, { brilho: 0.7 }); }
    GB2.luzPainel(g, t, 0.55, { fx: 600, fy: 900, vidro: false });
    ART.post(g, ctx.frame, { legendaK: 0.42 });
  },
});
