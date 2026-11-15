/* p18 · "E no fundo de tudo," (C8)
 * Descida vertical rápida através das camadas de rocha A–I (uma por mina, cada vez mais quentes). O Zeca, enrolado em
 * bola com a lanterna acesa, despenca junto no centro do quadro; pedrinhas passam desfocadas em primeiro plano. */
MD.plano("p18", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return { cena: null }; },
  render(g, t, ctx, st) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 0.93;
    const desce = ART.map(t, 0, D, 0.04, 0.9, "inQuad");
    const cena = ART.cenas.profundezas({ desce });
    const cam = ART.camera(t, { push: [1.0, 1.08], dur: D, hits: [] });
    const sh = GC.shake(t, 0, D, 10 * ART.prog(t, 0, D), 9);
    cam.sx = sh.x; cam.sy = sh.y;
    ART.palco(g, t, cam, cena, gg => {
      const p = ART.zeca.pose("bola", t, { x: 560, y: 900, s: 1.7, lamp: 1, turn: 0.3 }, { vel: 540 });
      ART.zeca.draw(gg, p);
      ART.glow(gg, 560, 760, 260, "#FFE6A8", 0.35);
    }, { frame: ctx.frame, legendaK: 0.4, vinheta: 0.7 });
    // riscos de velocidade
    g.save(); g.globalCompositeOperation = "lighter"; const r = ART.rng(3);
    for (let i = 0; i < 16; i++) { const x = r() * 1080, y = ((r() * 2400 - t * 5200) % 2400 + 2400) % 2400 - 240; g.fillStyle = `rgba(255,220,180,${0.08 + r() * 0.1})`; g.fillRect(x, y, 3, 160 + r() * 200); }
    g.restore();
  },
});
