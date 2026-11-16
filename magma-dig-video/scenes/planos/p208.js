/* p208 · C4 Toca · "Ele abriu o painel sorrindo."
 * Plano inteiro, câmera baixa: o Zeca de pé no tapete, pepita na pata, diante do painel (fora de quadro, do lado
 * da câmera; só a borda do vidro entra pela esquerda). No "abriu" o painel acende e a luz fria bate no rosto;
 * no "sorrindo" abre o sorrisão e balança o corpo de expectativa, trocando o peso de um pé para o outro.
 * Cartão fixo: SALDO 14 · DIA 3 DE 30 · COBRE 4% · RESTAM 27. Lanterna apagada (Toca). */
MD.plano("p208", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tAb = GB.wt(ctx, "abriu", 0.2), tSo = GB.wt(ctx, "sorrindo", 1.1);
    const kP = ART.map(t, tAb - 0.05, tAb + 0.3, 0.15, 1, "outCubic");
    const feliz = clamp((t - tSo + 0.08) / 0.18);
    const cena = GB2.toca({ lamp: 0.8, janela: 0.8 });
    const cam = GB2.camInteiro(t, dur, { dx: ART.map(t, 0, dur, -6, 6) });
    const Z = GB2.Z, [fx, fy] = GB2.tela(cam, Z.x, Z.y - 330);
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { tracinhos: true, riscados: 3 }),
      luz: (gg, tt, c) => GB.tocaLuz(gg, tt, c, { lamp: 0.8, janela: 0.8 }),
    });
    // balanço de expectativa (cresce no "sorrindo")
    const sw = 0.35 + 0.65 * feliz, ph = t * 5.2;
    GB2.zecaTela(g, cam, ART.zeca.pose("parado", t, {
      x: Z.x, y: Z.y, s: Z.s, turn: -0.22, lamp: 0, rim: "#7FD8FF", rimA: 0.35 + 0.4 * kP,
      aF: 52 + 6 * Math.sin(ph), eF: 62, aB: 40, eB: 78, bFrente: 1, segura: "pepita",
      lean: 3.5 * Math.sin(ph) * sw, bob: Math.abs(Math.sin(ph)) * 7 * sw, liftF: Math.max(0, Math.sin(ph)) * 6 * sw, liftB: Math.max(0, -Math.sin(ph)) * 6 * sw,
      sq: 1 + 0.05 * GB.hit(t, tAb, 0.3) - 0.03 * GB.hit(t, tSo, 0.3),
      eyes: feliz > 0.5 ? "feliz" : "aberto", mouth: feliz > 0.5 ? "aberto" : "sorriso", brows: "nenhum",
      headTilt: -5 + 5 * Math.sin(ph * 0.5) * sw, alvo: [ART.lerp(420, 170, kP), ART.lerp(1000, 780, kP)],
      banho: { cor: "#7FD8FF", k: 0.6 * kP }, blinkSeed: 0.2,
    }));
    GB2.luzPainel(g, t, kP, { fx, fy });
    ART.post(g, ctx.frame, { legendaK: 0.42 });
    // cartão fixo (entra do topo no começo do plano)
    const kc = ART.ease.outBack(clamp((t + 0.02) / 0.3));
    GB2.cartao(g, { saldo: 14, dia: 3, cobre: 0.04, tag: "COBRE 4%", rotulo: "RESTAM 27", y: 365 - (1 - kc) * 220, a: clamp(kc * 2) });
  },
});
