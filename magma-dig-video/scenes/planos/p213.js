/* p213 · C4 Toca · "Sentou no chão da Toca."
 * Plano geral: a Toca inteira (parede da meta, mesa, cama, porta) e o Zeca no tapete. Do "Sentou" ao "chão" as
 * pernas cedem e ele escorrega para trás até sentar no chão, encostado no pé da cama; no "chão" o corpo assenta
 * (amassa, sobe poeirinha do tapete). A câmera desce junto com ele. Pepita na pata. Lanterna apagada. */
MD.plano("p213", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tCh = GB.wt(ctx, "chao", 0.75), tToca = GB.wt(ctx, "toca", 1.3);
    const kS = ART.map(t, 0.04, tCh, 0, 1, "inQuad");          // desce acelerando, assenta no "chão"
    const bate = GB.hit(t, tCh, 0.4);
    const cena = GB2.toca({ numero: true, riscados: 3, lamp: 0.8, janela: 0.8 });
    const cam = ART.camera(t, { push: [1.16, 1.21], dur, ease: "linear" });
    GB.mira(cam, 1, 640 + ART.map(t, 0, dur, -8, 8), ART.lerp(1035, 1095, ART.ease.inOutSine(clamp(t / (tCh + 0.3)))), 540, 880);
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { seta: 1 }),
      luz: (gg, tt, c) => GB.tocaLuz(gg, tt, c, { lamp: 0.8, janela: 0.8 }),
    });
    const Z = GB2.Z, ZS = GB2.ZS;
    const pe = ART.zeca.pose("preocupado", t, { aF: 30, eF: 6, aB: 16, eB: 30, bFrente: 1, alvo: [300, 1150], headTilt: 12, headDy: 10 });
    const se = ART.zeca.pose("sentado", t, { aF: 5, eF: 30, aB: 5, eB: 30, bFrente: 1, headTilt: 16, headDy: 10, alvo: null, look: [0.2, 0.9] });
    const p = Object.assign(ART.zeca.mix(pe, se, kS), { t });
    Object.assign(p, {
      x: ART.lerp(Z.x, ZS.x, kS), y: ART.lerp(Z.y, ZS.y, kS), s: Z.s, turn: -0.22, lamp: 0, segura: null,
      sq: (p.sq || 1) - 0.07 * bate, bob: (p.bob || 0) - 6 * bate + 6 * Math.sin(Math.PI * kS) * (kS < 0.4 ? 1 : 0),
      eyes: "preocupado", mouth: "triste", brows: "triste",
      rim: "#C0606A", rimA: 0.55, blinkSeed: 0.6,
    });
    const A1 = GB2.zecaTela(g, cam, p), sZ = Z.s * A1.z;
    { const m = A1.mao, [cx, cy] = GB2.colo(A1, sZ); GB2.pepita(g, t, ART.lerp(m.x + 4 * sZ, cx, kS), ART.lerp(m.y - 4 * sZ, cy, kS), sZ, { brilho: 0.7 }); }
    // poeirinha do tapete quando assenta
    if (t > tCh) {
      const [px, py] = GB2.tela(cam, ZS.x, ZS.y);
      for (const q of ART.burst(t, { t0: tCh, count: 16, x: px, y: py - 6, speed: [60, 180], angle: [-170, -10], gravity: 300, life: [0.5, 0.9], size: [3, 7], seed: 12 })) {
        g.globalAlpha = q.alpha * 0.5; ART.circ(g, q.x, q.y, q.size); g.fillStyle = "#C8B0C8"; g.fill(); g.globalAlpha = 1;
      }
    }
    void A1;
    GB2.luzPainel(g, t, 0.6, { fx: 600, fy: 900, cor: "#E06A6A", vidro: false });
    ART.post(g, ctx.frame, { legendaK: 0.42 });
  },
});
