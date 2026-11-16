/* p212 · C4 Toca · "O sorriso foi junto com o preço."
 * Mesmo Zeca e mesmo enquadramento do p208 (a câmera agora recua devagar). Começa ainda no balanço feliz;
 * no "foi" o balanço morre e o sorriso desmancha aos poucos (feliz → preocupado), a pata com a pepita desce,
 * ombros e cabeça caem; no "junto" ele dá um passo para trás; a luz do painel esfria para um vermelho apagado.
 * No "preço" o cartão fixo mostra o cobre caindo de 4% para 2% (RESTAM 27). */
MD.plano("p212", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tFoi = GB.wt(ctx, "foi", 0.6), tJu = GB.wt(ctx, "junto", 0.95), tPr = GB.wt(ctx, "preco", 1.7);
    const k = ART.map(t, tFoi - 0.1, tPr + 0.25, 0, 1, "inOutSine");          // feliz -> preocupado
    const passo = ART.map(t, tJu, tJu + 0.45, 0, 1, "inOutCubic");
    const kCai = ART.map(t, tPr, tPr + 0.45, 0, 1, "inOutCubic");               // cartão 4% -> 2%
    const cena = GB2.toca({ lamp: 0.8, janela: 0.8 });
    const cam = GB2.camInteiro(t, dur, { push: [1.47, 1.39], ease: "inOutSine", dx: 6 + 10 * passo });
    const Z = GB2.Z, [fx, fy] = GB2.tela(cam, Z.x, Z.y - 330);
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { tracinhos: true, riscados: 3 }),
      luz: (gg, tt, c) => GB.tocaLuz(gg, tt, c, { lamp: 0.8, janela: 0.8 }),
    });
    const sw = (1 - clamp((t - tFoi + 0.15) / 0.35)), ph = (t + 2.16) * 5.2;   // continua o balanço do p208 e para
    const feliz = ART.zeca.pose("parado", t, {
      aF: 52 + 6 * Math.sin(ph) * sw, eF: 62, aB: 40, eB: 78, bFrente: 1,
      lean: 3.5 * Math.sin(ph) * sw, bob: Math.abs(Math.sin(ph)) * 7 * sw, liftF: Math.max(0, Math.sin(ph)) * 6 * sw, liftB: Math.max(0, -Math.sin(ph)) * 6 * sw,
      eyes: "feliz", mouth: "aberto", headTilt: -5, alvo: [170, 780],
    });
    const triste = ART.zeca.pose("preocupado", t, { aF: 30, eF: 6, aB: 16, eB: 30, bFrente: 1, alvo: [300, 1150], headTilt: 12, headDy: 10 });
    const p = Object.assign(ART.zeca.mix(feliz, triste, k), { t });
    const expr = k < 0.18 ? ["feliz", "aberto"] : k < 0.45 ? ["aberto", "sorriso"] : k < 0.72 ? ["aberto", "neutro"] : ["preocupado", "triste"];
    Object.assign(p, {
      x: Z.x + 22 * passo, y: Z.y - 14 * passo, s: Z.s, turn: -0.22, lamp: 0, segura: "pepita",
      rim: ART.mix("#9FC8FF", "#C0808A", kCai), rimA: 0.45,
      eyes: expr[0], mouth: expr[1], brows: k > 0.55 ? "triste" : "nenhum",
      liftB: (p.liftB || 0) + 10 * Math.sin(Math.PI * passo), lean: (p.lean || 0) - 5 * Math.sin(Math.PI * passo),
      blinkSeed: 0.2,
    });
    GB2.zecaTela(g, cam, p);
    GB2.luzPainel(g, t, 1 - 0.3 * kCai, { fx, fy, cor: ART.mix("#7FD8FF", "#E06A6A", kCai) });
    ART.post(g, ctx.frame, { legendaK: 0.42 });
    const pct = kCai < 0.5 ? 4 : 2;
    GB2.cartao(g, { saldo: 14, dia: 3, cobre: ART.lerp(0.04, 0.02, kCai), tag: `COBRE ${pct}%`, tagPulso: GB.hit(t, tPr + 0.2, 0.6), rotulo: "RESTAM 27" });
  },
});
