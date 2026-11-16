/* p256 · C4 Toca · "Quase um quarto da meta."
 * Close da parede da meta (como o p52): 4 tracinhos riscados de 30, a seta de giz riscada fica fora do quadro.
 * A pata do Zeca entra por baixo erguendo as quatro pepitas, que iluminam a parede. A barrinha de giz é desenhada,
 * o saldo enche 2% em giz claro e, do "quase" ao "quarto", o cobre enche mais 24% em laranja; "24%" em giz no
 * "quarto". Cartão fixo: SALDO 20 · DIA 4 DE 30 · COBRE 24% · RESTAM 26. */
MD.plano("p256", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tQa = GB.wt(ctx, "quase", 0.05), tQu = GB.wt(ctx, "quarto", 0.6), tMe = GB.wt(ctx, "meta", 1.1);
    const tAc = GB.mark(ctx, "acorde", 0.05);
    const cena = GB2.toca({ lamp: 0.6, janela: 0.35, semMoveis: true, porta: false });
    const cam = ART.camera(t, { push: [2.12, 2.24], dur, ease: "linear" });
    GB.mira(cam, 0.8, ...GB.gizMundo(ART.map(t, 0, dur, 14, -6), 250), 540, 766);
    const kBox = ART.map(t, -0.1, 0.2, 0.35, 1, "outCubic");
    const fs = ART.map(t, 0.0, 0.25, 0, 0.02, "outCubic");
    const fc = ART.map(t, tQa + 0.05, tQu + 0.2, 0, 0.24, "inOutSine");
    const kTx = ART.map(t, tQu, tQu + 0.3, 0, 1, "outCubic");
    const BAR = GB2.BARRA, iw = BAR.w - 14;
    const txC = BAR.x + 7 + iw * (0.02 + 0.12);   // centro do trecho laranja
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { tracinhos: true, riscados: 4, seta: 0, barra: { box: kBox, saldo: fs, cobre: fc, texto: kTx > 0 ? "24%" : null, textoK: kTx, tx: txC } }),
      luz: (gg, tt, c) => {
        GB.tocaLuz(gg, tt, c, { janela: 0.35, lamp: 0.6 });
        const [bx, by, z] = GB.proj(c, 0.8, ...GB.gizMundo(BAR.x + 7 + iw * (0.02 + fc), BAR.y + BAR.h / 2));
        const b = GB.hit(t, tQu + 0.15, 0.7) + 0.5 * GB.hit(t, tAc + 0.05, 0.6);
        if (fc > 0.005 && fc < 0.239) GB.poeiraGiz(gg, tt, bx, by, 1, 11);
        if (b > 0) ART.glow(gg, bx, by, 260 * z, "#FF8A3C", 0.5 * b);
      },
    });
    // pata do Zeca com as quatro pepitas (luz laranja na parede)
    const sobe = ART.ease.outBack(clamp((t + 0.1) / 0.45));
    const px = 905 - 40 * sobe + Math.sin(t * 2.2) * 6, py = 1300 - 150 * sobe + Math.sin(t * 3.1) * 5;
    ART.glow(g, px - 70, py - 60, 560, "#FF8A3C", 0.34 + 0.06 * Math.sin(t * 6));
    ART.pata(g, px, py, 58, { s: 1.25, dedos: "segura", objeto: gg => GB2.pepitas(gg, t, -100, -50, 34, { n: 4, brilho: 0.9 }) });
    g.save(); g.fillStyle = ART.lg(g, 0, 1250, 0, 1920, [[0, "rgba(10,6,16,0)"], [0.5, "rgba(10,6,16,.55)"], [1, "rgba(10,6,16,.9)"]]); g.fillRect(0, 1250, 1080, 670); g.restore();
    ART.post(g, ctx.frame, { legendaK: 0.4, vinheta: 0.5 });
    const kCard = fc / 0.24;
    GB2.cartao(g, { saldo: 20, dia: 4, cobre: fc, tag: kCard > 0.98 ? "COBRE 24%" : null, tagPulso: GB.hit(t, tQu + 0.2, 0.6), rotulo: "RESTAM 26", pulso: GB.hit(t, tMe, 0.5) * 0.6 });
  },
});
