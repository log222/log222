/* p240 · C1 Vila / boca da mina · "Dia quatro."
 * Como o p26: câmera atrás do Zeca, acompanhando; ele anda de costas pela trilha com a picareta velha na pata, passa
 * por baixo da placa MINA A · TERRA RASA e entra no escuro da mina. Lanterna acesa SEM feixe (fora da mina).
 * Cartão fixo: SALDO 14 · DIA 4 DE 30 (pulsa no "quatro"). */
MD.plano("p240", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tDia = GB.wt(ctx, "dia", 0.05), tQu = GB.wt(ctx, "quatro", 0.45);
    const cena = ART.cenas.vila({ placa: "MINA A", sub: "TERRA RASA", lampiao: 1, interiorMina: 0.25 });
    const k = clamp(t / dur);
    const cam = ART.camera(t, { push: [1.45, 1.72], dur, ease: "inQuad" });
    GB.mira(cam, 1, 610, ART.lerp(1120, 1072, k), 540, 990);
    const zy = ART.lerp(1330, 1185, ART.ease.inOutSine(k)), zs = ART.lerp(1.25, 0.74, ART.ease.inOutSine(k));
    const dentro = clamp((t - (dur - 0.32)) / 0.3);
    ART.palco(g, t, cam, cena, gg => {
      const p = ART.zeca.pose("andando", t, { x: 612 + 6 * Math.sin(t * 6), y: zy, s: zs, turn: 0.06, costas: 1, lamp: 1, cone: 0, rim: "#B58CFF", rimA: 0.8,
        tool: "picareta", aF: 30 + 6 * Math.sin(t * 7), eF: 40 }, { periodo: 0.44 });
      if (dentro > 0) ART.zeca.drawEscuro(gg, p, dentro);
      else ART.zeca.draw(gg, p);
    }, { frame: ctx.frame, legendaK: 0.4 });
    const b = GB.hit(t, tDia + 0.1, 0.6);
    if (b > 0) { const [px, py, z] = GB.proj(cam, 0.85, 610, 860); ART.glow(g, px, py, 330 * z, "#FFD98A", 0.35 * b); }
    // cartão fixo: entra já no corte e pulsa no "quatro"
    const kc = ART.ease.outBack(clamp((t + 0.05) / 0.22));
    GB2.cartao(g, { saldo: 14, dia: 4, y: 365 - (1 - kc) * 200, a: clamp(kc * 2), pulso: GB.hit(t, tQu, 0.5) });
  },
});
