/* p15 · C4 Toca · "mil moedas em trinta dias."
 * Close frontal da parede da meta, empurrão no número. A pata do Zeca fecha o último zero do 1.000 (giz)
 * e sai; o 1.000 "bate" no "mil" (acorde grave); o cartão fixo SALDO × META estreia em "moedas";
 * os 30 tracinhos saem em rajada de "trinta" a "dias" e pulsam em onda. */
MD.plano("p15", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur;
    const tMil = GB.wt(ctx, "mil", 0.04), tMoedas = GB.wt(ctx, "moedas", 0.36), tTrinta = GB.wt(ctx, "trinta", 1.0), tDias = GB.wt(ctx, "dias", 1.4);
    const tAc = GB.mark(ctx, "acorde", 0.05);
    // 1.000 termina de ser escrito até o "mil"; tracinhos em rajada de "trinta" até "dias"
    const prog = ART.map(t, -0.05, tMil + 0.12, 0.82, 1, "outQuad");
    const nTr = Math.floor(ART.map(t, tTrinta - 0.08, tDias + 0.05, 0, 30, "inOutSine") + 0.001);
    const cena = GB.toca({ prog, tracos: nTr, riscados: 0 });
    const bate = GB.hit(t, tAc + 0.05, 0.5);
    const cam = ART.camera(t, { push: [1.6, 1.78], dur, ease: "outQuad", hits: [tAc + 0.05], hitAmp: 7 });
    // enquadra o ponto (500, 720) da parede (d=0.8) em (540, 800) na tela
    const z = 1 + (cam.zoom - 1) * 0.8;
    cam.x = (522 - 540) / 0.8 + ART.map(t, 0, dur, -10, 12);
    cam.y = (734 - 960 - (915 - 960) / z) / 0.8;
    GB.palco(g, t, cam, cena, null, {
      frame: ctx.frame,
      luz: (gg, tt, c) => {
        GB.tocaLuz(gg, tt, c, { janela: 0.6 });
        // brilho do número no "mil"
        const [nx, ny, zz] = GB.proj(c, 0.8, 500, 636);
        if (bate > 0) ART.glow(gg, nx, ny, 420 * zz, "#FFE6B0", 0.45 * bate);
        // onda pelos tracinhos depois do "dias"
        for (let i = 0; i < nTr; i++) {
          const [lx, ly] = GB.tracoLocal(i), [wx, wy] = GB.gizMundo(lx, ly + 32), [sx, sy, z3] = GB.proj(c, 0.8, wx, wy);
          const w = GB.hit(t, tDias + 0.08 + (i % 10) * 0.03 + Math.floor(i / 10) * 0.05, 0.4);
          if (w > 0.02) ART.glow(gg, sx, sy, 60 * z3, "#FFD23F", 0.55 * w);
        }
        // poeira de giz na ponta da pata enquanto fecha o zero
        const [px, py] = GB.proj(c, 0.8, 500 + 0.8 * 300, 636 - 0.8 * 10);
        GB.poeiraGiz(gg, tt, px - 40, py + 40, clamp(1 - t / 0.35), 5);
      },
    });
    // pata com giz fechando o último zero e saindo (vem de baixo/direita)
    const sai = ART.ease.inCubic(clamp((t - 0.2) / 0.45));
    if (sai < 1) {
      const [px, py] = GB.proj(cam, 0.8, 500 + 0.8 * 300, 636 + 0.8 * 40);
      const wig = Math.sin(t * 26) * 10 * clamp(1 - t / 0.2);
      ART.pata(g, px + 60 + sai * 700 + wig, py + 90 + sai * 900, 38, {
        s: 1.25, dedos: "segura",
        objeto: gg => { gg.save(); gg.translate(-120, 4); gg.rotate(-0.5); ART.rr(gg, -60, -13, 92, 26, 10); gg.fillStyle = "#F4F0E6"; gg.fill(); gg.fillStyle = "rgba(0,0,0,.08)"; gg.fillRect(-20, -13, 52, 26); gg.restore(); },
      });
    }
    // cartão fixo estreia em "moedas" (desce do topo)
    const kc = ART.ease.outBack(clamp((t - (tMoedas - 0.08)) / 0.3));
    if (kc > 0) GB.cartao(g, 540, 365 - (1 - kc) * 260, { saldo: 0, dia: 1, s: 0.86, a: clamp(kc * 2), pulso: GB.hit(t, tMoedas + 0.2, 0.5) });
  },
});
