/* p04 · C1 Vila à noite · "No MAGMA DIG,"
 * Plano geral da vila com a boca da mina e a placa MAGMA DIG balançando. Deriva lateral com parallax
 * (lua e morros quase parados, cerca e capim correndo). No "MAGMA" um brilho corre pela placa e solta poeira;
 * o Zeca, pequeno e de costas, vai pela trilha em direção à mina (ponte para o p05). */
MD.plano("p04", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur;
    const tMag = GB.wt(ctx, "magma", 0.17);
    const cena = ART.cenas.vila({ placa: "MAGMA DIG", lampiao: 1, interiorMina: 0.6 });
    // placa grande (≥ 60% da largura): plano de conjunto da boca da mina, deriva lateral com parallax
    const D = Math.max(dur, 0.8), k0 = clamp(t / D);
    const cam = { zoom: ART.lerp(1.62, 1.7, k0), x: 0, y: 0, sx: 0, sy: 0 };
    GB.mira(cam, 0.85, 610 + ART.lerp(-30, 30, k0), 871, 540, 600);
    const brilho = clamp((t - tMag) / 0.45);
    ART.palco(g, t, cam, cena, gg => {
      // Zeca de costas andando pela trilha, pequeno
      const k = clamp(t / D);
      ART.zeca.draw(gg, ART.zeca.pose("andando", t, { x: 590 + 10 * k, y: 1335 - 40 * k, s: 1.3 - 0.08 * k, turn: 0.1, costas: 1, lamp: 1, rim: "#B58CFF", rimA: 0.7 }, { periodo: 0.5 }));
    }, { frame: ctx.frame, legendaK: 0.32 });
    // brilho correndo pela placa (camada d = 0.85) + poeira caindo
    if (brilho > 0 && brilho < 1) {
      const [px, py, z] = GB.proj(cam, 0.85, 610 - 200 + 400 * ART.ease.inOutSine(brilho), 720 + 76 + 75);
      ART.glow(g, px, py, 120 * z, "#FFF2C0", 0.7 * Math.sin(Math.PI * brilho));
    }
    if (t > tMag) {
      const [bx, by] = GB.proj(cam, 0.85, 610, 720 + 76 + 150);
      for (const p of ART.burst(t, { t0: tMag, count: 16, x: bx, y: by, w: 360, h: 10, speed: [10, 60], angle: [60, 120], gravity: 500, life: [0.5, 0.9], size: [2, 4], seed: 2 })) {
        g.globalAlpha = p.alpha * 0.8; ART.circ(g, p.x, p.y, p.size); g.fillStyle = "#E8D2B0"; g.fill(); g.globalAlpha = 1;
      }
    }
  },
});
