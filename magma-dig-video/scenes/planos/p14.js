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
    // escrita: o "1.000" grande (o "1" num traço forte no "riscou"); o META entra no close do p15.
    // Câmera FIXA na parede: o que já foi escrito fica sempre à esquerda da pata, livre; o Zeca vai à direita.
    const W1 = 680 * 0.92; // largura aprox. do "1.000" (Lilita 230 px)
    const k1F = tt => ART.map(tt, tRis - 0.14, tRis + 0.2, 0, 0.2, "outCubic") + ART.map(tt, tRis + 0.24, Math.max(dur, tRis + 0.6) + 0.2, 0, 0.5);
    const tipF = tt => {
      const k1 = k1F(tt), x = -W1 / 2 + W1 * k1, y = -110 + 70 * Math.sin(tt * 10);
      const chega = ART.ease.inOutSine(clamp(tt / Math.max(0.2, tRis - 0.14)));  // a pata chega ao ponto de partida
      return [ART.lerp(-W1 / 2 + 160, x, chega), ART.lerp(-300, y, chega)];
    };
    const D = Math.max(dur, tRis + 0.6);
    const cam = { zoom: ART.map(t, 0, D, 1.62, 1.7), x: 0, y: 0, sx: 0, sy: 0 };
    GB.mira(cam, 0.8, 500, 636, 470 + ART.map(t, 0, D, 10, -10), 700);
    const tp = tipF(t), [mx, my] = GB.gizMundo(tp[0], tp[1]);
    GB.palco(g, t, cam, cena, null, {
      frame: ctx.frame, legenda: false,
      meio: (gg) => ART.withLayer(gg, cam, 0.8, w => {
        w.save(); w.translate(GB.PAREDE.x, GB.PAREDE.y); w.scale(GB.PAREDE.s, GB.PAREDE.s);
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
    const base = { s: 3.3, turn: -0.42, lamp: 0.25, cone: 0, rim: "#FFB070", rimA: 0.75, lean: -3 - 7 * forte, sq: 1 + 0.03 * forte };
    const p = ART.zeca.pose("riscando", t, Object.assign({ x: 0, y: 0 }, base));
    if (!this._dry) this._dry = ART.canvas(4, 4).getContext("2d");
    this._dry.setTransform(1, 0, 0, 1, 0, 0);
    const A0 = ART.zeca.draw(this._dry, p);
    const mao = A0.mao || { x: 0, y: -700 };
    const [, syC] = GB.proj(cam, 0.8, ...GB.gizMundo(0, -80));
    p.x = sx - mao.x - 10; p.y = syC - mao.y + 30;   // pés fixos na prancha; só anda de lado
    p.shadow = 0;
    // andaime de madeira (prancha comprida com pés): a meta fica alta na parede, ele escreve de cima dela
    {
      const fy = p.y, sc = p.s / 3.3;
      ART.madeira(g, -40, fy - 6 * sc, 1160, 40 * sc, { cor: "#8A5A34", seed: 4 });
      for (const lx of [150, 560, 960]) ART.madeira(g, lx - 18 * sc, fy + 30 * sc, 36 * sc, 1920 - fy, { cor: "#5E3A24", vert: true, seed: lx });
      ART.madeira(g, 120, fy + 300 * sc, 880, 26 * sc, { cor: "#5E3A24", seed: 7 });
    }
    ART.zeca.draw(g, p);
    // a parte de baixo do Zeca (mais perto, fora da luz) escurece para a faixa da legenda
    g.save(); g.fillStyle = ART.lg(g, 0, 1080, 0, 1650, [[0, "rgba(10,6,16,0)"], [0.6, "rgba(10,6,16,.7)"], [1, "rgba(10,6,16,.95)"]]); g.fillRect(0, 1080, 1080, 840); g.restore();
    ART.faixaLegenda(g, 0.42);
  },
});
