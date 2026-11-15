/* p32 · C4 Toca · "Ele tinha vinte e nove."
 * Close dos 30 tracinhos. A pata do Zeca entra e risca o primeiro (giz laranja, no som do giz) e sai;
 * no "vinte e nove" os 29 que sobram acendem em onda e o cartão fixo ganha "RESTAM 29". */
MD.plano("p32", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur;
    const tGiz = GB.mark(ctx, "giz", 0.05), tVinte = GB.wt(ctx, "vinte", 0.68), tNove = GB.wt(ctx, "nove", 1.35);
    const rk = ART.map(t, tGiz + 0.02, tGiz + 0.34, 0, 1, "inOutSine");
    const cena = GB.toca({ prog: 0, tracos: 0 });   // close: só os tracinhos (o 1.000 ficaria espremido sob o cartão)
    const cam = ART.camera(t, { push: [2.25, 2.4], dur, ease: "linear" });
    GB.mira(cam, 0.8, ...GB.gizMundo(ART.map(t, 0, dur, -14, 10), 175), 540, 1000);
    const wave = i => GB.hit(t, tVinte + 0.04 + (i % 10) * 0.035 + Math.floor(i / 10) * 0.06, 0.55);
    GB.palco(g, t, cam, cena, null, {
      frame: ctx.frame, legenda: false,
      meio: gg => ART.withLayer(gg, cam, 0.8, w => { w.save(); w.translate(GB.PAREDE.x, GB.PAREDE.y); w.scale(GB.PAREDE.s, GB.PAREDE.s); GB.tracinhos(w, { riscados: rk }); w.restore(); }),
      luz: (gg, tt, c) => {
        GB.tocaLuz(gg, tt, c, { janela: 0.4 });
        for (let i = 1; i < 30; i++) {
          const [lx, ly] = GB.tracoLocal(i), [wx, wy] = GB.gizMundo(lx, ly + 32), [sx, sy, z] = GB.proj(c, 0.8, wx, wy), w = wave(i);
          if (w > 0.06) ART.glow(gg, sx, sy, 70 * z, "#FFD23F", 0.6 * w);
        }
        // fica um brilho morno nos 29 depois da onda
        const fica = clamp((t - tVinte - 0.5) / 0.4) * 0.22;
        if (fica > 0) for (let r = 0; r < 3; r++) { const [wx, wy] = GB.gizMundo(0, 122 + r * 92), [sx, sy, z] = GB.proj(c, 0.8, wx, wy); gg.save(); gg.translate(sx, sy); gg.scale(1, 0.22); ART.glow(gg, 0, 0, 330 * z, "#FFD23F", fica * 1.4); gg.restore(); }
      },
    });
    // pata com giz riscando o 1º tracinho
    const [lx0, ly0] = GB.tracoLocal(0);
    const tipL = [lx0 - 20 + 44 * rk, ly0 + 56 - 52 * rk];
    const entra = ART.ease.outCubic(clamp((t + 0.05) / (tGiz + 0.08 + 0.05))), sai = ART.ease.inCubic(clamp((t - tGiz - 0.4) / 0.35));
    if (sai < 1) {
      const [wx, wy] = GB.gizMundo(tipL[0], tipL[1]), [sx, sy] = GB.proj(cam, 0.8, wx, wy);
      const off = (1 - entra) * 420 + sai * 700;
      ART.pata(g, sx + 141 + off * 0.6, sy + 184 + off, 50, {
        s: 1.05, dedos: "segura",
        objeto: gg => { gg.save(); gg.translate(-150, -10); gg.rotate(-0.25); ART.rr(gg, -70, -14, 100, 28, 10); gg.fillStyle = "#F4F0E6"; gg.fill(); gg.restore(); },
      });
      if (rk > 0 && rk < 1) GB.poeiraGiz(g, t, sx, sy, 1, 6);
    }
    // cartão fixo: DIA 1 DE 30 → "RESTAM 29" no "nove"
    const kr = clamp((t - tNove + 0.05) / 0.2);
    GB.cartao(g, 540, 330, { saldo: 6, dia: 1, s: 0.86, rotulo: kr > 0 ? "RESTAM 29" : null, a: 1, pulso: GB.hit(t, tNove, 0.5) });
    ART.faixaLegenda(g, 0.4);
  },
});
