/* p26 · C1 Vila / boca da mina · "Dia um. Mina A, Terra Rasa."
 * Câmera atrás do Zeca, acompanhando: ele anda de costas pela trilha, passa por baixo da placa MINA A · TERRA RASA
 * e some no escuro da mina (o p27 abre do preto). O cartão fixo marca DIA 1 DE 30 no "um";
 * a placa ganha um brilho no "Mina A". */
MD.plano("p26", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur;
    const tUm = GB.wt(ctx, "um", 0.33), tMina = GB.wt(ctx, "mina", 0.41), tRasa = GB.wt(ctx, "rasa", 0.97);
    const cena = ART.cenas.vila({ placa: "MINA A", sub: "TERRA RASA", lampiao: 1, interiorMina: 0.25 });
    const k = clamp(t / dur);
    const cam = ART.camera(t, { push: [1.45, 1.75], dur, ease: "inQuad" });
    GB.mira(cam, 1, 610, ART.lerp(1120, 1070, k), 540, 990);
    // Zeca: de costas, andando para dentro (fica menor e mais alto na tela)
    const zy = ART.lerp(1330, 1172, ART.ease.inOutSine(k)), zs = ART.lerp(1.25, 0.68, ART.ease.inOutSine(k));
    const dentro = clamp((t - (dur - 0.5)) / 0.45); // entrando no escuro
    ART.palco(g, t, cam, cena, gg => {
      const p = ART.zeca.pose("andando", t, { x: 612 + 6 * Math.sin(t * 6), y: zy, s: zs, turn: 0.06, costas: 1, lamp: 1, cone: 0, rim: "#B58CFF", rimA: 0.8 }, { periodo: 0.44 });
      if (dentro > 0) ART.zeca.drawEscuro(gg, p, dentro);
      else ART.zeca.draw(gg, p);
    }, { frame: ctx.frame, legendaK: 0.4 });
    // brilho na placa no "Mina A"
    const b = GB.hit(t, tMina, 0.6);
    if (b > 0) { const [px, py, z] = GB.proj(cam, 0.85, 610, 720 + 70 + 70); ART.glow(g, px, py, 330 * z, "#FFD98A", 0.4 * b); }
    // cartão fixo: DIA 1 DE 30 (pulsa no "um")
    const kc = ART.ease.outBack(clamp((t + 0.05) / 0.25));
    GB.cartao(g, 540, 365 - (1 - kc) * 200, { saldo: 0, dia: 1, s: 0.86, a: clamp(kc * 2), pulso: GB.hit(t, tUm, 0.5) });
  },
});
