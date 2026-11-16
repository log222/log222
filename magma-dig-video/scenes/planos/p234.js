/* p234 · C4 Toca · "Mas parou de olhar pra seta."
 * Por cima do ombro: o Zeca de costas, grande em primeiro plano à direita, risca um X de giz vermelho sobre a seta
 * verde da parede (a do p56), em dois traços no som do giz. Depois baixa a pata, dá meio passo para o lado e vira a
 * cabeça para longe da seta ("parou de olhar"); no "seta" o X brilha e a seta perde a cor. Tracinhos: 3 riscados. */
MD.plano("p234", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tGiz = GB.mark(ctx, "giz", 0.05), tOl = GB.wt(ctx, "olhar", 1.2), tSe = GB.wt(ctx, "seta", 2.0);
    const xk = ART.map(t, tGiz, tGiz + 0.7, 0, 1, "inOutSine");
    const baixa = ART.map(t, tGiz + 0.75, tOl + 0.1, 0, 1, "inOutCubic");
    const vira = ART.map(t, tOl - 0.05, tOl + 0.4, 0, 1, "inOutSine");
    const brilhoX = GB.hit(t, tSe, 0.8), kPan = ART.map(t, tGiz + 0.8, tOl + 0.4, 0, 1, "inOutSine");
    const cena = GB2.toca({ lamp: 0.75, janela: 0.6, semMoveis: true });
    const cam = ART.camera(t, { push: [1.7, 1.8], dur, ease: "linear" });
    const S = GB2.SETA, [cwx, cwy] = GB.gizMundo(S.x + 10, S.y - S.h * 0.45);
    GB.mira(cam, 0.8, cwx + ART.map(t, 0, dur, 8, -8) + 70 * kPan, cwy, 470, 820);
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { tracinhos: true, riscados: 3, seta: 1, x: xk, brilhoX }),
      luz: (gg, tt, c) => {
        GB.tocaLuz(gg, tt, c, { lamp: 0.75, janela: 0.6 });
        const [px, py] = GB.proj(c, 0.8, ...GB.gizMundo(...GB2.pontaX(xk)));
        if (xk > 0 && xk < 1) GB.poeiraGiz(gg, tt, px, py, 1, 4);
        if (brilhoX > 0.02) { const [bx, by, z] = GB.proj(c, 0.8, cwx, cwy); ART.glow(gg, bx, by, 240 * z, "#FF6B4A", 0.4 * brilhoX); }
      },
    });
    // alvo da pata: ponta do giz enquanto risca; depois desce
    const [tx, ty] = GB.proj(cam, 0.8, ...GB.gizMundo(...GB2.pontaX(xk)));
    const SZ = 3.2, base = { x: 0, y: 0, s: SZ, turn: -0.42, costas: 1, lamp: 0, rim: "#FFB070", rimA: 0.7, segura: "giz", bob: Math.sin(t * 2.4) * 1.2 };
    // corpo fixo (posicionado para a pata alcançar o meio do X com o braço erguido) + meio passo para a direita no fim
    const [mx0, my0] = GB.proj(cam, 0.8, cwx, cwy);
    const A0 = GB2.ancoras(Object.assign({}, base, { aF: 150, eF: -10 }));
    const bx = mx0 - A0.mao.x - 30 + 90 * baixa + 70 * 1.62 * kPan, by = my0 - A0.mao.y + 40;
    // procura o ângulo de ombro/cotovelo que leva a pata até a ponta do giz (busca em grade, função pura de t)
    let best = [150, -10], bd = 1e9;
    if (baixa < 1) {
      for (let a = 100; a <= 180; a += 8) for (let e = -50; e <= 40; e += 10) {
        const q = GB2.ancoras(Object.assign({}, base, { x: bx, y: by, aF: a, eF: e }));
        const d = (q.mao.x - tx) ** 2 + (q.mao.y - ty) ** 2; if (d < bd) { bd = d; best = [a, e]; }
      }
      const [a0, e0] = best;
      for (let a = a0 - 6; a <= a0 + 6; a += 2) for (let e = e0 - 8; e <= e0 + 8; e += 2) {
        const q = GB2.ancoras(Object.assign({}, base, { x: bx, y: by, aF: a, eF: e }));
        const d = (q.mao.x - tx) ** 2 + (q.mao.y - ty) ** 2; if (d < bd) { bd = d; best = [a, e]; }
      }
    }
    const aF = ART.lerp(best[0], 18, baixa), eF = ART.lerp(best[1], 24, baixa);
    const p = Object.assign({}, ART.zeca.pose("parado", t, base), {
      x: bx, y: by, aF, eF, aB: -20, eB: 20,
      lean: -4 + 4 * baixa, liftF: 10 * Math.sin(Math.PI * clamp((baixa - 0.2) / 0.6)),
      headTilt: ART.lerp(-6, 12, vira), headTurn: ART.lerp(-0.25, 0.3, vira), headDy: 6 * vira,
      segura: baixa > 0.6 ? null : "giz",
    });
    ART.zeca.draw(g, p);
    // a parte de baixo do Zeca (mais perto, fora da luz) escurece para a faixa da legenda
    g.save(); g.fillStyle = ART.lg(g, 0, 1150, 0, 1700, [[0, "rgba(10,6,16,0)"], [0.55, "rgba(10,6,16,.72)"], [1, "rgba(10,6,16,.95)"]]); g.fillRect(0, 1150, 1080, 770); g.restore();
    ART.post(g, ctx.frame, { legendaK: 0.42 });
  },
});
