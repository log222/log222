/* p11 · C1 Vila / boca da mina · "O Zeca é um tatu de capacete amarelo."
 * Plano médio, câmera baixa: o Zeca entra andando pela esquerda na frente da boca da mina, freia (antecipação),
 * vira para a câmera no "Zeca"→"tatu", dá um toque no capacete no "capacete" (a lanterna acende)
 * e abre um sorrisão no "amarelo". Empurrão leve. */
MD.plano("p11", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur;
    const tTatu = GB.wt(ctx, "tatu", 0.65), tCap = GB.wt(ctx, "capacete", 1.05), tAm = GB.wt(ctx, "amarelo", 1.69);
    const tPara = Math.min(0.5, tTatu - 0.15);
    const cena = ART.cenas.vila({ placa: "MAGMA DIG", lampiao: 1, interiorMina: 0.7 });
    const cam = ART.camera(t, { push: [1.7, 1.82], dur, ease: "outQuad" });
    GB.mira(cam, 1, 600 + ART.map(t, 0, dur, -20, 0), 1180, 540, 940);
    // posição: entra da esquerda e para com um passinho de ajuste
    const xs = ART.kf(t, [[0, 380], [tPara, 596, "outQuad"], [tPara + 0.12, 604], [tPara + 0.25, 600, "inOutSine"]]);
    const toque = clamp((t - (tCap - 0.18)) / 0.18) * (1 - clamp((t - (tCap + 0.25)) / 0.2)); // pata sobe ao capacete
    const luz = ART.ease.outQuad(clamp((t - tCap) / 0.12));
    const feliz = clamp((t - (tAm - 0.05)) / 0.12);
    const anda = ART.zeca.pose("andando", t, { turn: 0.85 }, { periodo: 0.46 });
    const freia = ART.zeca.pose("parado", t, { turn: 0.8, lean: -10, sq: 1.06, bob: -3 });
    const frente = ART.zeca.pose("parado", t, {
      turn: 0.18, camera: 1, aF: 14 + 150 * toque, eF: 20 + 90 * toque, eyes: feliz > 0.5 ? "feliz" : "aberto", mouth: feliz > 0.5 ? "aberto" : "sorriso",
      bob: 18 * Math.sin(Math.PI * clamp((t - tAm) / 0.35)) * feliz, sq: 1 + 0.05 * GB.hit(t, tAm + 0.32, 0.25), headTilt: -6 * toque + 4 * feliz,
    });
    let p;
    if (t < tPara) p = anda;
    else if (t < tPara + 0.14) p = Object.assign(ART.zeca.mix(anda, freia, ART.ease.outQuad((t - tPara) / 0.14)), { t });
    else p = Object.assign(ART.zeca.mix(freia, frente, ART.ease.outBack(clamp((t - tPara - 0.14) / 0.24))), { t });
    Object.assign(p, { x: xs, y: 1330, s: 1.5, lamp: luz, cone: 0.35 * luz, rim: "#B58CFF", rimA: 0.75 });
    ART.palco(g, t, cam, cena, gg => { ART.zeca.draw(gg, p); }, { frame: ctx.frame, legendaK: 0.42 });
    // estalo de luz quando a lanterna acende
    const fl = GB.hit(t, tCap, 0.3);
    if (fl > 0) { const [lx, ly] = GB.proj(cam, 1, xs + 8, 1330 - 1.5 * 205); ART.glow(g, lx, ly, 260, "#FFF2C8", 0.6 * fl); }
  },
});
