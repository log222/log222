/* p05 · "quem marca a hora é a lanterna." (C2) — Zeca de frente na mina; o feixe da lanterna anda na parede como
 * ponteiro de relógio, um "tique" por palavra; push-in do plano médio até o rosto. Na palavra LANTERNA o feixe acende forte. */
MD.plano("p05", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.65, tL = GA.w(ctx, "lanterna", 0, 1.0);
    const ticks = (ctx.words || []).map(w => w.ini);
    const passo = ticks.filter(x => t >= x).length;                   // um tique por palavra
    const ang = -150 + passo * 17 + 17 * ART.ease.outBack(ART.clamp((t - (ticks[passo - 1] ?? 0)) / 0.12)) - 17;
    const forte = ART.prog(t, tL - 0.05, tL + 0.15, "outCubic");
    const cam = GA.cam(540, ART.lerp(1000, 950, ART.prog(t, 0, D, "inOutSine")), ART.lerp(1.35, 1.95, ART.prog(t, 0, D, "inOutSine")), {}, { sy: 760 });
    let A = null;
    ART.palco(g, t, cam, ART.cenas.mina({ luz: 0.4 }), gg => {
      A = ART.zeca.draw(gg, ART.zeca.pose("parado", t, { x: 540, y: 1182, s: 1.62, turn: 0.08, camera: 0.5, lamp: 0.75 + 0.25 * forte, cone: 0, rim: "#FFC88A", rimA: 0.5, mouth: "sorriso", look: [Math.cos(ART.deg(ang)) * 0.8, -0.6] }));
    }, { frame: ctx.frame });
    // ponteiro de relógio: o feixe sai da lanterna e "anda" um tique por palavra; mancha de luz na parede
    const L = 520, lx = A.lanterna.x, ly = A.lanterna.y, px = lx + Math.cos(ART.deg(ang)) * L, py = ly + Math.sin(ART.deg(ang)) * L;
    { const a = ART.deg(ang), w1 = 70 + 30 * forte; g.save(); g.globalCompositeOperation = "lighter"; g.translate(lx, ly); g.rotate(a);
      g.beginPath(); g.moveTo(0, -10); g.lineTo(L, -w1); g.lineTo(L, w1); g.lineTo(0, 10); g.closePath();
      g.fillStyle = ART.lg(g, 0, 0, L, 0, [[0, `rgba(255,236,190,${0.7 + 0.25 * forte})`], [1, "rgba(255,220,160,.08)"]]); g.fill(); g.restore(); }
    ART.glow(g, px, py, 160 + 80 * forte, "#FFE6A8", 0.6 + 0.35 * forte);
    // marcas de hora na parede (12 tiques em arco)
    g.save(); g.strokeStyle = "rgba(255,230,180,.35)"; g.lineWidth = 6; g.lineCap = "round";
    for (let i = 0; i <= 8; i++) { const a2 = ART.deg(-150 + i * 17), r0 = L - 30, r1 = L + 10; g.beginPath(); g.moveTo(lx + Math.cos(a2) * r0, ly + Math.sin(a2) * r0); g.lineTo(lx + Math.cos(a2) * r1, ly + Math.sin(a2) * r1); g.stroke(); }
    g.restore();
  },
});
