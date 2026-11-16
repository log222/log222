/* p266 · C4 Toca · "ou vende tudo hoje na alta?"
 * Plano médio (enquadramento do p56): o Zeca sentado na cama, coberto, as quatro pepitas no colo, luz laranja no
 * rosto. No "ou" olha para a porta da Toca (à direita, para a vila e a Dona Coruja); no "vende" vira para o painel do
 * Mercado (do lado da câmera, luz fria); no "alta?" baixa os olhos para as pepitas, sobrancelhas em dúvida. Não decide.
 * Câmera parada com deriva. Lanterna apagada. */
MD.plano("p266", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tOu = GB.wt(ctx, "ou", 0.02), tVe = GB.wt(ctx, "vende", 0.35), tAl = GB.wt(ctx, "alta", 1.4);
    const cena = GB2.toca({ lamp: 0.25, janela: 0.9 });
    const cam = ART.camera(t, { push: [2.3, 2.36], dur, ease: "linear" });
    GB.mira(cam, 1, ART.map(t, 0, dur, 870, 884), 955, 540, 820);
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { tracinhos: true, riscados: 4, seta: 1, x: 1 }),
      luz: (gg, tt, c) => GB.tocaLuz(gg, tt, c, { lamp: 0.25, janela: 0.9 }),
    });
    const C = GB2.CAMA, [zx, zy, zf] = GB2.tela(cam, C.x, C.y), sZ = C.s * zf;
    // olhares: porta (direita) -> painel (frente/esquerda) -> pepitas
    const fase = t < tVe - 0.05 ? 0 : t < tAl - 0.05 ? 1 : 2;
    const kPainel = ART.map(t, tVe - 0.1, tVe + 0.25, 0, 1, "inOutSine") * (1 - ART.map(t, tAl - 0.1, tAl + 0.3, 0, 1, "inOutSine"));
    const resp = Math.sin(t * 2.0);
    const base = ART.zeca.pose("sentado", t, {
      x: zx, y: zy, s: sZ, turn: -0.3, lamp: 0, shadow: 0,
      aF: 5, eF: 30, aB: 5, eB: 30, bFrente: 1,
      bob: -24 + 1.5 * resp, sq: 1 + 0.015 * resp,
      eyes: fase === 2 ? "preocupado" : "aberto", mouth: fase === 2 ? "neutro" : fase === 1 ? "o" : "neutro", brows: fase === 2 ? "preocupado" : "surpreso",
      headTilt: fase === 0 ? -10 : fase === 1 ? 4 : 14, headDy: fase === 2 ? 6 : 0, blinkSeed: 0.7,
      banho: { cor: "#FF8A3C", k: 0.5 }, rim: "#9FB4FF", rimA: 0.55,
    });
    const A0 = GB2.ancoras(base), [cx, cy] = GB2.colo(A0, sZ);
    base.alvo = fase === 0 ? [1300, 760] : fase === 1 ? [-120, 900] : [cx, cy];
    ART.zeca.draw(g, base);
    ART.cobertor(g, zx + 30 * zf, zy + 6 * zf, 300 * zf);
    GB2.pepitas(g, t, cx, cy - 6 * sZ, 11 * sZ, { n: 4, brilho: 0.85 });
    GB2.luzPainel(g, t, 0.25 + 0.6 * kPainel, { fx: zx, fy: zy - 260, vidro: false });
    ART.post(g, ctx.frame, { legendaK: 0.4 });
  },
});
