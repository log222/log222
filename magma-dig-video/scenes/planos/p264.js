/* p264 · C4 Toca · "Faltam vinte e seis dias."
 * Close dos 30 tracinhos (como o p32): 4 já riscados. No som do giz a pata do Zeca passa um sublinhado de giz sob
 * os que faltam, fileira por fileira (contando); no "vinte" os 26 acendem em onda; no "seis" o cartão fixo pulsa
 * RESTAM 26. Cartão: SALDO 20 · DIA 4 DE 30 · COBRE 24% · RESTAM 26. Câmera parada com deriva. */
MD.plano("p264", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tGiz = GB.mark(ctx, "giz", 0.05), tVi = GB.wt(ctx, "vinte", 0.5), tSe = GB.wt(ctx, "seis", 0.95);
    const cena = GB2.toca({ lamp: 0.7, janela: 0.4, semMoveis: true, porta: false });
    const cam = ART.camera(t, { push: [2.25, 2.33], dur, ease: "linear" });
    GB.mira(cam, 0.8, ...GB.gizMundo(ART.map(t, 0, dur, -14, 10), 175), 540, 1000);
    // sublinhados: fileira 0 (do 5º ao 10º), fileiras 1 e 2 inteiras
    const LIN = [[4, 9, 0], [0, 9, 1], [0, 9, 2]];
    const ks = ART.map(t, tGiz, tGiz + 0.7, 0, 3, "inOutSine");
    const seg = (j, k) => { const [c0, c1, r] = LIN[j], x0 = -270 + c0 * 60 - 22, x1 = -270 + c1 * 60 + 22, y = 90 + r * 92 + 74; return [x0, y, x0 + (x1 - x0) * k, y]; };
    const ponta = (() => { const j = Math.min(2, Math.floor(ks)), k = ks >= 3 ? 1 : ks - j; const s = seg(j, k); return [s[2], s[3]]; })();
    const wave = i => GB.hit(t, tVi + 0.04 + (i % 10) * 0.035 + Math.floor(i / 10) * 0.06, 0.55);
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: gg => ART.withLayer(gg, cam, 0.8, w => {
        w.save(); w.translate(GB.PAREDE.x, GB.PAREDE.y); w.scale(GB.PAREDE.s, GB.PAREDE.s);
        GB.tracinhos(w, { riscados: 4 });
        for (let j = 0; j < 3; j++) { const k = clamp(ks - j); if (k > 0) { const s = seg(j, 1); GB.gizLinha(w, s[0], s[1], s[2], s[3], k, { lw: 6, cor: "rgba(255,214,90,.85)", glow: "rgba(255,200,60,.5)" }); } }
        w.restore();
      }),
      luz: (gg, tt, c) => {
        GB.tocaLuz(gg, tt, c, { janela: 0.4, lamp: 0.7 });
        for (let i = 4; i < 30; i++) {
          const [lx, ly] = GB.tracoLocal(i), [wx, wy] = GB.gizMundo(lx, ly + 32), [sx, sy, z] = GB.proj(c, 0.8, wx, wy), w = wave(i);
          if (w > 0.06) ART.glow(gg, sx, sy, 70 * z, "#FFD23F", 0.6 * w);
        }
        const fica = clamp((t - tVi - 0.5) / 0.4) * 0.22;
        if (fica > 0) for (let r = 0; r < 3; r++) { const [wx, wy] = GB.gizMundo(0, 122 + r * 92), [sx, sy, z] = GB.proj(c, 0.8, wx, wy); gg.save(); gg.translate(sx, sy); gg.scale(1, 0.22); ART.glow(gg, 0, 0, 330 * z, "#FFD23F", fica * 1.4); gg.restore(); }
        if (ks > 0 && ks < 3) { const [px, py] = GB.proj(c, 0.8, ...GB.gizMundo(...ponta)); GB.poeiraGiz(gg, tt, px, py, 1, 6); }
      },
    });
    // pata com giz acompanhando a ponta do sublinhado; entra no começo e sai depois
    const entra = ART.ease.outCubic(clamp((t + 0.05) / (tGiz + 0.12))), sai = ART.ease.inCubic(clamp((t - tGiz - 0.8) / 0.35));
    if (sai < 1) {
      const [sx, sy] = GB.proj(cam, 0.8, ...GB.gizMundo(...ponta)), off = (1 - entra) * 420 + sai * 700;
      ART.pata(g, sx + 141 + off * 0.6, sy + 184 + off, 50, {
        s: 1.05, dedos: "segura",
        objeto: gg => { gg.save(); gg.translate(-150, -10); gg.rotate(-0.25); ART.rr(gg, -70, -14, 100, 28, 10); gg.fillStyle = "#F4F0E6"; gg.fill(); gg.restore(); },
      });
    }
    ART.post(g, ctx.frame, { legendaK: 0.4, vinheta: 0.5 });
    GB2.cartao(g, { saldo: 20, dia: 4, cobre: 0.24, tag: "COBRE 24%", rotulo: "RESTAM 26", pulso: GB.hit(t, tSe, 0.5) });
  },
});
