/* p31 · C4 Toca · "Nesse ritmo, a meta levava cento e sessenta e sete dias."
 * O Zeca, de lado na parede, faz a conta no giz embaixo dos tracinhos: "1.000 ÷ 6 =" e, no "cento e sessenta e sete",
 * o 167 em giz amarelo. No "sete" ele para com o giz no ar, se afasta e olha para a câmera, preocupado.
 * Câmera: plano médio que empurra até o resultado. */
MD.plano("p31", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur;
    const tCento = GB.wt(ctx, "cento", 1.53), tSete = GB.wt(ctx, "sete", 2.29), tDias = GB.wt(ctx, "dias", 2.65);
    const cena = GB.toca({ prog: 1, tracos: 30, riscados: 0 }, { lamp: 0.8 });
    if (cena.fundo.length === 5) cena.fundo = cena.fundo.filter((L, i) => i !== 3 && i !== 4); // sem mesa/cama: a parede de baixo fica livre
    // conta em coordenadas locais do giz (s = 0.8, centro 500,700): linha em y local 395 (mundo ≈ 1016), embaixo dos tracinhos
    const LY = 395, X0 = -330, FA = 72, FB = 140;
    g.save(); g.font = `400 ${FA}px "Lilita One"`; const W_A = g.measureText("1.000 ÷ 6 =").width; g.font = `400 ${FB}px "Lilita One"`; const W_B = g.measureText("167").width; g.restore();
    const XB = X0 + W_A + 26, XFIM = XB + W_B;
    const kA = ART.map(t, 0.12, tCento - 0.12, 0, 1, "inOutSine");          // "1.000 ÷ 6 ="
    const kB = ART.map(t, tCento - 0.05, tSete + 0.12, 0, 1, "inOutSine");   // "167"
    const kU = ART.map(t, tSete + 0.14, tSete + 0.36, 0, 1, "outCubic");     // sublinhado
    const tipF = tt => {
      const a = ART.map(tt, 0.12, tCento - 0.12, 0, 1, "inOutSine"), b = ART.map(tt, tCento - 0.05, tSete + 0.12, 0, 1, "inOutSine");
      const ya = LY + 10 * Math.sin(tt * 14), yb = LY - 8 + 30 * Math.sin(tt * 9);
      if (b <= 0) return [ART.lerp(X0, X0 + W_A, a), ya];
      return [ART.lerp(XB, XFIM, b), yb];
    };
    const parado = clamp((t - (tSete + 0.18)) / 0.35); // para com o giz no ar
    // câmera: acompanha a ponta do giz e, no 167, abre para o enquadramento final com a conta inteira (x 60–960)
    const [rx, ry] = GB.gizMundo((XB + XFIM) / 2, LY);
    const contaE = GB.gizMundo(X0, LY)[0], contaD = GB.gizMundo(XFIM, LY)[0];
    const zoom = ART.kf(t, [[0, 1.42], [tCento, 1.38], [tSete + 0.3, 1.27, "inOutCubic"], [Math.max(dur, tSete + 0.6), 1.31]]);
    const cam = { zoom, x: 0, y: 0, sx: 0, sy: 0 };
    const tp0 = tipF(t), tipW = GB.gizMundo(tp0[0], LY)[0];
    const fim = (contaE + contaD + 290) / 2;                         // conta + Zeca à direita
    const kf = ART.ease.inOutCubic(clamp((t - tCento + 0.1) / (tSete + 0.35 - tCento + 0.1)));
    const zEff = 1 + (zoom - 1) * 0.8;
    const cxW = ART.lerp(Math.max(tipW, contaE + 330 / zEff), fim, kf);
    GB.mira(cam, 0.8, cxW, 1016, ART.lerp(470, 500, kf), 980);
    GB.palco(g, t, cam, cena, null, {
      frame: ctx.frame, legenda: false,
      meio: gg => ART.withLayer(gg, cam, 0.8, w => {
        w.save(); w.translate(GB.PAREDE.x, GB.PAREDE.y); w.scale(GB.PAREDE.s, GB.PAREDE.s);
        GB.gizTexto(w, "1.000 ÷ 6 =", X0, LY, { size: FA, k: kA });
        const r = GB.gizTexto(w, "167", XB, LY - 6, { size: FB, k: kB, cor: "rgba(255,214,98,.96)", glow: "rgba(255,200,80,.6)", blur: 10 });
        if (kU > 0 && r) { GB.gizLinha(w, r.x0 - 6, LY + 66, r.x0 + r.w + 10, LY + 60, kU, { cor: "rgba(255,214,98,.95)", lw: 9 }); GB.gizLinha(w, r.x0 + 6, LY + 86, r.x0 + r.w - 4, LY + 82, clamp(kU * 1.4 - 0.4), { cor: "rgba(255,214,98,.95)", lw: 7 }); }
        w.restore();
      }),
      luz: (gg, tt, c) => {
        GB.tocaLuz(gg, tt, c, { janela: 0.5, lamp: 0.7 });
        // brilho no 167 quando completa
        const [sx, sy, z] = GB.proj(c, 0.8, rx, ry - 6);
        const b = GB.hit(t, tSete + 0.1, 0.8);
        if (b > 0) ART.glow(gg, sx, sy, 300 * z, "#FFC64A", 0.4 * b);
        if (parado < 1) { const tp = tipF(tt), [wx, wy] = GB.gizMundo(tp[0], tp[1]), [px, py] = GB.proj(c, 0.8, wx, wy); GB.poeiraGiz(gg, tt, px, py + 8, 1 - parado, 4); }
      },
    });
    // Zeca de 3/4 (olha a parede, à direita da conta), braço esticado até a ponta do giz; corpo acompanha com atraso
    let ax = -1e9, ay = 0; for (let i = 0; i < 6; i++) { const q = tipF(Math.min(t + i * 0.05, tSete + 0.12)); if (q[0] > ax) { ax = q[0]; ay = q[1]; } } // o corpo vai à frente da ponta: nunca cobre o que já foi escrito
    const [mx, my] = GB.gizMundo(ax, ay), [sx, sy] = GB.proj(cam, 0.8, mx, my);
    const [, floorY, zf] = GB.proj(cam, 1, 0, 1262);
    const mover = Math.abs(tipF(t)[0] - tipF(t - 0.1)[0]) / 30; // passinhos quando a mão anda muito
    const escreve = ART.zeca.pose("apontando", t, {
      turn: -0.62, segura: "giz", eyes: "determinado", mouth: "neutro", look: [-0.6, -0.2], headTilt: -4,
      aF: 96 + Math.sin(t * 14) * 6, eF: -6 + Math.cos(t * 14) * 8, lF: Math.sin(t * 16) * 14 * clamp(mover), lB: -Math.sin(t * 16) * 14 * clamp(mover),
      rim: "#FFB070", rimA: 0.6, lamp: 0.35, cone: 0,
    });
    const congela = Object.assign({}, escreve, {
      aF: 112, eF: 14, lean: -7, headTurn: 0, camera: 1, eyes: t > tDias + 0.1 ? "preocupado" : "espanto", mouth: "o", brows: "preocupado", segura: "giz",
      sweat: clamp((t - tDias) / 0.3), lF: 0, lB: 0,
    });
    const p = parado > 0 ? Object.assign(ART.zeca.mix(escreve, congela, ART.ease.outBack(parado)), { t }) : escreve;
    p.s = 1.38 * zf;
    if (!this._dry) this._dry = ART.canvas(4, 4).getContext("2d");
    this._dry.setTransform(1, 0, 0, 1, 0, 0);
    const A0 = ART.zeca.draw(this._dry, Object.assign({}, p, { x: 0, y: 0 }));
    const mao = A0.mao || { x: -100, y: -200 };
    p.x = sx - mao.x + 18 + parado * 70; p.y = floorY; // pés no chão; a mão chega perto da ponta
    ART.zeca.draw(g, p);
    ART.faixaLegenda(g, 0.4);
  },
});
