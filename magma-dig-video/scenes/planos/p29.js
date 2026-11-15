/* p29 · "Crac. Uma moeda. Crac. Duas." (C2) — Zeca em 3ª pessoa dá dois golpes sincronizados com o som; CRAC! e
 * moeda pulando para o contador a cada golpe; corte interno entre os golpes (plano médio → mais perto). */
MD.plano("p29", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.91, H = GA.ms(ctx, "picareta"), M = GA.ms(ctx, "moeda");
    if (H.length < 2) H.push(...[0.04, 0.93].slice(H.length));
    const corte = (H[0] + H[1]) / 2 + 0.05, B = t >= corte;
    const nh = GA.n(t, H), mo = M.length ? GA.n(t, M) : nh;
    const mov = ART.camera(t, { push: [1, 1.04], dur: D, hits: H, hitAmp: 16 });
    const cam = B ? GA.cam(560, 1010, 2.45, mov, { sy: 820 }) : GA.cam(470, 1010, 1.85, mov, { sy: 820 });
    const c0 = GA.centroBloco();
    ART.palco(g, t, cam, ART.cenas.mina({}), gg => {
      ART.cubo(gg, GA.B.X, GA.B.Z, { crack: Math.min(3, nh * 1.2), seed: 4, ores: [{ tipo: "prata", u: 0.7, v: 0.3, r: 0.07 }] });
      ART.zeca.draw(gg, GA.cava(t, H, { ...GA.Z, turn: 0.82, lamp: 1, cone: 0.35, rim: "#FFC88A" }));
      for (const h of H) {
        for (const p of ART.burst(t, { t0: h, count: 12, x: c0[0] - 60, y: c0[1] - 50, speed: [260, 700], angle: [-170, -40], gravity: 2200, life: [0.35, 0.7], seed: 30 + h * 10, size: [8, 16] })) { gg.save(); gg.globalAlpha = p.alpha; gg.fillStyle = p.i % 2 ? "#BAAB87" : "#76756A"; gg.fillRect(p.x, p.y, p.size, p.size * 0.7); gg.restore(); }
        ART.glow(gg, c0[0] - 60, c0[1] - 50, 140, "#FFE6B0", t >= h ? 0.9 * Math.max(0, 1 - (t - h) / 0.12) : 0);
      }
    }, { frame: ctx.frame });
    // moeda saltando do bloco até o contador (em px de tela)
    const bs = GA.tela(cam, c0[0] - 60, c0[1] - 60);
    M.forEach(m => { const k = ART.prog(t, m - 0.28, m, "inCubic"); if (k > 0 && k < 1) ART.ui.moeda(g, ART.lerp(bs[0], 250, k), ART.lerp(bs[1], 330, k) - Math.sin(k * Math.PI) * 220, 30 * (1 - 0.3 * k), t * 9, { brilho: 0.4 }); });
    H.forEach((h, i) => ART.ui.crac(g, i ? 640 : 600, i ? 760 : 820, t, h, { s: 1.15, rot: i ? 5 : -7 }));
    GA.hud(g, t, { cron: 8.6 - t, moedas: mo, pulso: GA.pulsos(t, M.length ? M : H) });
    M.forEach(m => ART.ui.flutua(g, 400, 500, t, m, { texto: "+1", s: 0.7 }));
  },
});
