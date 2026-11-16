/* p232 · C4 Toca · "O Zeca guardou a pepita de novo."
 * Plano inteiro (mesmo lugar do p213/p218). Ele se levanta do chão (inclina para a frente, empurra, sobe), com a
 * pepita numa pata e o saquinho de couro na outra; no "guardou" a pepita cai dentro do saquinho (pop, brilho
 * laranja escapando da boca); no "pepita" ele puxa o cordão e amarra; no "novo" olha para a câmera, decidido.
 * A câmera acompanha a subida. Lanterna apagada. */
MD.plano("p232", {
  async setup() { await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD())); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, GB2 = window.GB2, { clamp } = GB2, dur = ctx.dur;
    const tGu = GB.wt(ctx, "guardou", 0.55), tPe = GB.wt(ctx, "pepita", 1.2), tNo = GB.wt(ctx, "novo", 2.1);
    const tPop = GB.mark(ctx, "pop", tGu + 0.1);
    const kUp = ART.map(t, 0.0, Math.max(0.35, tGu - 0.05), 0, 1, "inOutCubic");     // levanta
    const leva = ART.map(t, tGu - 0.25, tPop, 0, 1, "inOutSine");                     // pata da pepita vai à boca do saco
    const dentro = t >= tPop;
    const fecha = ART.map(t, tPe - 0.1, tPe + 0.45, 0, 1, "inOutCubic");
    const decide = ART.map(t, tNo - 0.2, tNo + 0.15, 0, 1, "outBack");
    const cena = GB2.toca({ lamp: 0.8, janela: 0.8 });
    const cam = GB2.camInteiro(t, dur, { push: [1.38, 1.46], my: GB2.ZS.y, dy: ART.lerp(-30, 0, kUp) - 10 * decide });
    GB.palco(g, t, cam, cena, null, {
      post: false,
      meio: GB2.meioParede(cam, t, { tracinhos: true, riscados: 3 }),
      luz: (gg, tt, c) => GB.tocaLuz(gg, tt, c, { lamp: 0.8, janela: 0.8 }),
    });
    const ZS = GB2.ZS;
    const sent = ART.zeca.pose("sentado", t, { aF: 5, eF: 30, aB: 5, eB: 30, bFrente: 1, headTilt: 8, eyes: "preocupado", mouth: "neutro", brows: "triste" });
    const empurra = ART.zeca.pose("parado", t, { lean: 16, sq: 0.94, bob: -10, aF: 20, eF: 40, aB: 10, eB: 50, bFrente: 1, headTilt: 4 });
    const pe = ART.zeca.pose("parado", t, { aF: ART.lerp(40, 58, leva) + 6 * Math.sin(Math.PI * fecha * 3) * (fecha > 0 && fecha < 1 ? 1 : 0), eF: ART.lerp(60, 92, leva) - 30 * decide,
      aB: 34, eB: 64, bFrente: 1, headTilt: 10 - 10 * decide });
    let p;
    if (kUp < 0.5) p = Object.assign(ART.zeca.mix(sent, empurra, kUp * 2), { t });
    else p = Object.assign(ART.zeca.mix(empurra, pe, (kUp - 0.5) * 2), { t });
    const cheio = dentro ? 1 : 0;
    Object.assign(p, {
      x: ZS.x, y: ZS.y, s: GB2.Z.s, turn: -0.22, lamp: 0,
      segura: null,
      seguraB: (gg, x, y) => GB2.saquinho(gg, x, y + 4, 0.34, { fecha, cheio, rot: 0.1 * Math.sin(t * 3) }),
      eyes: decide > 0.3 ? "determinado" : kUp > 0.6 ? "aberto" : "preocupado", mouth: decide > 0.3 ? "sorriso" : "neutro", brows: decide > 0.3 ? "nenhum" : "triste",
      camera: decide, headDy: (p.headDy || 0) + 4 * Math.sin(Math.PI * clamp((t - tNo - 0.1) / 0.3)),
      alvo: decide > 0.5 ? null : [600, 1150], blinkSeed: 0.3,
      rim: "#B58CFF", rimA: 0.55, banho: { cor: "#FF8A3C", k: dentro ? 0.2 * (1 - fecha) : 0.3 },
      sq: (p.sq || 1) + 0.04 * GB.hit(t, tPop, 0.3),
    });
    const A1 = GB2.zecaTela(g, cam, p), sZ = GB2.Z.s * A1.z;
    if (!dentro) {   // pepita: do colo para a pata da frente (levantando) e da pata para a boca do saco (no "guardou")
      const [cx, cy] = GB2.colo(A1, sZ), m = A1.mao, b = A1.maoTras || m, kp = clamp(kUp * 1.6);
      let x = ART.lerp(cx, m.x + 4 * sZ, kp), y = ART.lerp(cy, m.y - 4 * sZ, kp);
      const kb = clamp((t - (tPop - 0.12)) / 0.12); x = ART.lerp(x, b.x, kb); y = ART.lerp(y, b.y - 6 * sZ, kb) - 18 * sZ * Math.sin(Math.PI * kb);
      GB2.pepita(g, t, x, y, sZ, { brilho: 0.8 });
    }
    // pop: brilho laranja escapando do saquinho
    const mb = A1.maoTras;
    if (mb) {
      const h = GB.hit(t, tPop, 0.5);
      if (h > 0) { ART.glow(g, mb.x, mb.y + 10, 220, "#FF8A3C", 0.7 * h); for (const q of ART.burst(t, { t0: tPop, count: 10, x: mb.x, y: mb.y, speed: [80, 220], angle: [-160, -20], gravity: 500, life: [0.3, 0.6], size: [2, 5], seed: 31 })) { g.globalAlpha = q.alpha; ART.circ(g, q.x, q.y, q.size); g.fillStyle = "#FFC080"; g.fill(); g.globalAlpha = 1; } }
    }
    GB2.luzPainel(g, t, 0.45, { fx: 600, fy: 900, vidro: false });
    ART.post(g, ctx.frame, { legendaK: 0.42 });
  },
});
