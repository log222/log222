/* p205 · C4 Toca · "O Zeca segurou o cobre."
 * Close (mesmo Zeca do p204, na cama): ele dorme sentado, coberto, a pata apertando a pepita contra o peito; a luz
 * laranja da pepita pulsa no rosto. O ronco enche o peito no começo; no "segurou" a pata aperta de leve; os Z sobem.
 * Push-in lento até o último quadro. Lanterna apagada. */
MD.plano("p205", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tSe = GB.wt(ctx, "segurou", 0.5), tCo = GB.wt(ctx, "cobre", 1.3);
    const cena = GB2.toca({ lamp: 0.2, janela: 0.9, porta: false });
    const C = GB2.CAMA;
    const cam = ART.camera(t, { push: [3.05, 3.3], dur, ease: "linear" });
    GB.mira(cam, 1, C.x - 30 + ART.map(t, 0, dur, -4, 4), C.y - C.s * 120, 540, 860);
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { tracinhos: true, riscados: 2, seta: 1 }),
      luz: (gg, tt, c) => GB.tocaLuz(gg, tt, c, { lamp: 0.2, janela: 0.9 }),
    });
    g.save(); g.fillStyle = "rgba(10,6,20,.45)"; g.fillRect(0, 0, 1080, 1920); g.restore();
    const [zx, zy, zf] = GB2.tela(cam, C.x, C.y);
    const aperta = GB.hit(t, tSe + 0.05, 0.8) + 0.6 * GB.hit(t, tCo + 0.05, 0.8);
    const ronco = Math.sin(Math.PI * clamp(t / 0.9));   // o ronco do começo enche o peito
    const pul = 0.75 + 0.25 * Math.sin(t * 3.6);
    const p = ART.zeca.pose("dormindo", t, {
      x: zx, y: zy, s: C.s * zf, turn: -0.35, lamp: 0, shadow: 0,
      aF: 48 - 8 * aperta, eF: 92 + 12 * aperta, aB: 44 - 6 * aperta, eB: 92 + 8 * aperta, bFrente: 1, segura: "pepita",
      sq: 1 + 0.035 * ronco - 0.02 * aperta, bob: -26 + 4 * ronco, mouth: ronco > 0.5 ? "o" : "dormindo",
      banho: { cor: "#FF8A3C", k: 0.55 + 0.3 * pul }, rim: "#9FB4FF", rimA: 0.55, zzz: 1,
    });
    const A1 = ART.zeca.draw(g, p);
    ART.cobertor(g, zx + 30 * zf, zy + 6 * zf, 300 * zf);
    const m = A1.mao || { x: zx, y: zy - 100 };
    ART.glow(g, m.x, m.y, 300 * zf, "#FF8A3C", 0.32 * pul);
    ART.glow(g, m.x, m.y, 50 * zf, "#FFE0B0", 0.4 * pul);
    ART.post(g, ctx.frame, { legendaK: 0.4 });
  },
});
