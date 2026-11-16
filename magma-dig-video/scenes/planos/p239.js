/* p239 · C4 Toca · "Até lá, mais cobre na mochila."
 * Plano inteiro, a câmera acompanha da esquerda para a direita: o Zeca sai da parede da meta (onde riscou a seta),
 * anda até o pé da cama, se abaixa e pega a picareta velha encostada ali ("lá"), ajeita o capacete com a outra pata
 * ("cobre"), segue até a porta da Toca, que abre para a noite azul ("mochila"), para e olha para trás.
 * Lanterna apagada (ainda na Toca). */
MD.plano("p239", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tLa = GB.wt(ctx, "la", 0.35), tMa = GB.wt(ctx, "mais", 0.9), tCo = GB.wt(ctx, "cobre", 1.25), tMo = GB.wt(ctx, "mochila", 2.0);
    // marcos da ação
    const tPega = Math.max(0.45, tLa + 0.1);                  // abaixa e pega
    const tSobe = tPega + 0.35;
    const tCap = Math.max(tSobe + 0.05, tCo - 0.05);         // ajeita o capacete
    const tPorta = Math.min(dur - 0.6, tMo + 0.1);           // chega à porta
    const xPick = 960, xPorta = 1060;
    const x = ART.kf(t, [[0, 800], [tPega - 0.08, xPick - 40, "inOutSine"], [tSobe, xPick - 30], [tPorta, xPorta, "inOutSine"]]);
    const y = ART.kf(t, [[0, 1345], [tPega, 1325, "inOutSine"], [tPorta, 1300, "inOutSine"]]);
    const aberta = (tt => ART.map(tt, tPorta - 0.35, tPorta + 0.25, 0, 1, "inOutCubic"));
    const cena = GB2.toca({ lamp: 0.8, janela: 0.8, aberta, picareta: false });   // a única picareta é a do pé da cama
    const cam = ART.camera(t, { push: [1.36, 1.42], dur, ease: "linear" });
    GB.mira(cam, 1, ART.map(t, 0, dur, 905, 965, "inOutSine"), 1290, 540, 1230);
    const temPic = t >= tPega;
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { tracinhos: true, riscados: 3, seta: 1, x: 1 }),
      luz: (gg, tt, c) => GB.tocaLuz(gg, tt, c, { lamp: 0.8, janela: 0.8 }),
    });
    // picareta velha encostada no pé da cama (até ele pegar)
    if (!temPic) { const [px, py, z] = GB2.tela(cam, xPick + 15, 1300); g.save(); g.translate(px, py); g.rotate(0.28); ART.drawPick(g, "ferro", 150 * z * 0.75); g.restore(); }
    // andar <-> parar com transição suave (sem pulo de pose)
    const kAnda = clamp(ART.map(t, tPega - 0.3, tPega - 0.08, 1, 0) + ART.map(t, tSobe - 0.05, tSobe + 0.15, 0, 1) - ART.map(t, tPorta - 0.15, tPorta + 0.15, 0, 1));
    const andando = kAnda > 0.5;
    const abaixa = Math.sin(Math.PI * clamp((t - (tPega - 0.2)) / 0.5));
    const cap = Math.sin(Math.PI * clamp((t - tCap) / 0.45));
    const volta = ART.map(t, tPorta, tPorta + 0.45, 0, 1, "inOutSine");
    const anda = ART.zeca.pose("andando", t, {}, { periodo: 0.5 });
    const para = ART.zeca.pose("parado", t, {});
    const base = Object.assign(ART.zeca.mix(para, anda, ART.ease.inOutSine(kAnda)), { t });
    const p = Object.assign({}, base, {
      x, y, s: GB2.Z.s, turn: ART.lerp(0.85, 0.15, volta), lamp: 0, rim: "#B58CFF", rimA: 0.6,
      lean: (base.lean || 0) + 18 * abaixa, sq: (base.sq || 1) - 0.06 * abaixa, bob: (base.bob || 0) - 8 * abaixa,
      tool: temPic ? "picareta" : null, aF: temPic ? 24 + 8 * Math.sin(t * 6) * kAnda : ART.lerp(base.aF ?? 14, 60, abaixa),
      eF: temPic ? 30 : ART.lerp(base.eF ?? 20, 10, abaixa),
      aB: ART.lerp(base.aB ?? -12, 165, cap), eB: ART.lerp(base.eB ?? 15, 40, cap), bFrente: cap > 0.1 ? 1 : 0,
      eyes: "determinado", mouth: volta > 0.5 ? "sorriso" : "neutro", brows: "nenhum",
      camera: 0.85 * volta, headTilt: (base.headTilt || 0) - 6 * cap, blinkSeed: 0.5,
    });
    GB2.zecaTela(g, cam, p);
    ART.post(g, ctx.frame, { legendaK: 0.42 });
  },
});
