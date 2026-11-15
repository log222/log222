/* p14 · C4 Toca · "Na parede da Toca, riscou a meta:"
 * Por cima do ombro do Zeca: de costas, ele escreve META e começa o 1.000 no giz; a pata acompanha a ponta do traço.
 * Câmera: empurrão lento + deriva para a direita seguindo o giz. O "1" sai num traço forte em "riscou". */
MD.plano("p14", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur;
    const tRis = GB.wt(ctx, "riscou", 1.05);
    const cena = GB.toca({ prog: 0, tracos: 0 });
    // escrita: META (0,05 → 0,72), volta da pata, "1.000" começando no "riscou"
    const kMetaF = tt => ART.map(tt, 0.05, 0.72, 0, 1, "inOutSine");
    const k1F = tt => ART.map(tt, tRis - 0.12, tRis + 0.22, 0, 0.24, "outCubic") + ART.map(tt, tRis + 0.25, dur + 0.25, 0, 0.36);
    // ponta do giz em coordenadas locais do giz (contínua no tempo)
    const W1 = 680 * 0.92; // largura aprox. do "1.000" (Lilita 230 px)
    const tipF = tt => {
      const km = kMetaF(tt), k1 = k1F(tt);
      const meta = [-100 + 200 * km, -258 + 14 * Math.sin(tt * 16)];
      const um = [-W1 / 2 + W1 * k1, -110 + 60 * Math.sin(tt * 10)];
      const v = ART.ease.inOutCubic(clamp((tt - 0.72) / (tRis - 0.12 - 0.72)));
      return [ART.lerp(meta[0], um[0], v), ART.lerp(meta[1], um[1], v)];
    };
    const cam = ART.camera(t, { push: [1.95, 2.08], dur, ease: "linear" });
    // câmera acompanha a ponta do giz (média móvel): o Zeca fica no lugar e a parede desliza
    let ax = 0, ay = 0; for (let i = 0; i < 8; i++) { const q = tipF(t - i * 0.05); ax += q[0] / 8; ay += q[1] / 8; }
    const [mx, my] = GB.gizMundo(ax, ay);
    GB.mira(cam, 0.8, mx, 600, 500 + (ax - mx) * 0, 640);
    cam.x = (mx - 540 - (500 - 540) / (1 + (cam.zoom - 1) * 0.8)) / 0.8;
    GB.palco(g, t, cam, cena, null, {
      frame: ctx.frame, legenda: false,
      meio: (gg) => ART.withLayer(gg, cam, 0.8, w => {
        w.save(); w.translate(GB.PAREDE.x, GB.PAREDE.y); w.scale(GB.PAREDE.s, GB.PAREDE.s);
        GB.gizTexto(w, "META", 0, -252, { size: 64, k: kMetaF(t), align: "center", spacing: 6 });
        GB.gizTexto(w, "1.000", 0, -80, { size: 230, k: k1F(t), align: "center" });
        w.restore();
      }),
      luz: (gg, tt, c) => {
        GB.tocaLuz(gg, tt, c, { janela: 0.7 });
        const tp = tipF(tt), [wx, wy] = GB.gizMundo(tp[0], tp[1]), [sx, sy] = GB.proj(c, 0.8, wx, wy);
        GB.poeiraGiz(gg, tt, sx, sy + 10, 1, 9);
      },
    });
    // corpo segue a ponta do giz com atraso (média móvel, função pura de t)
    const [sx, sy] = GB.proj(cam, 0.8, mx, my);
    const forte = GB.hit(t, tRis, 0.45);
    const base = { s: 6.2, turn: -0.3, lamp: 0.25, rim: "#FFB070", rimA: 0.75, lean: -3 - 7 * forte, sq: 1 + 0.03 * forte };
    const p = ART.zeca.pose("riscando", t, Object.assign({ x: 0, y: 0 }, base));
    if (!this._dry) this._dry = ART.canvas(4, 4).getContext("2d");
    this._dry.setTransform(1, 0, 0, 1, 0, 0);
    const A0 = ART.zeca.draw(this._dry, p);
    const mao = A0.mao || { x: 0, y: -700 };
    p.x = sx - mao.x - 10; p.y = sy - mao.y + 40;
    ART.zeca.draw(g, p);
    // a parte de baixo do Zeca (mais perto, fora da luz) escurece para a faixa da legenda
    g.save(); g.fillStyle = ART.lg(g, 0, 1080, 0, 1650, [[0, "rgba(10,6,16,0)"], [0.6, "rgba(10,6,16,.7)"], [1, "rgba(10,6,16,.95)"]]); g.fillRect(0, 1080, 1080, 840); g.restore();
    ART.faixaLegenda(g, 0.42);
  },
});
