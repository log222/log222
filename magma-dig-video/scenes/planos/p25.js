/* p25 · "Tipo a superfície do Sol." (C6)
 * Dois discos grandes, na diagonal, enchendo o quadro: o núcleo da Terra (entra pela esquerda, com o anel ciano do
 * corte) e o disco do Sol (entra pela direita, com coroa). Mesma cor; no acorde os dois brilham juntos e o "≈" acende
 * entre eles. Rótulos ≈ 6.000 °C × ≈ 5.500 °C. Empurrão lento até o fim. */
MD.plano("p25", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, BP = ART.BP, D = ctx.dur || 1.79;
    const tA = GC.mark(ctx, "acorde", 0.05), tS = GC.wt(ctx, "superfície", 0.57), tSol = GC.wt(ctx, "Sol", 1.37);
    const k = ART.ease.outCubic(ART.prog(t, 0, 0.4));   // astros já em quadro no quadro 0, só deslizam para o lugar
    const bri = 0.45 + 0.55 * ART.prog(t, tA, tA + 0.4);
    const z = ART.map(t, 0, D, 1.0, 1.06, "linear");
    const pul = 1 + 0.025 * Math.sin(t * 5);
    const disco = (x, y, r, seed) => {
      ART.glow(g, x, y, r * 2.3, "#FF8A3C", 0.5 * bri);
      ART.circ(g, x, y, r * pul); g.fillStyle = ART.rg(g, x - r * 0.3, y - r * 0.3, 0, r * 1.1, [[0, "#FFFBEA"], [0.35, "#FFD86A"], [0.75, "#FF9A2A"], [1, "#E0561A"]]); g.fill();
      g.save(); ART.circ(g, x, y, r * pul); g.clip(); g.globalCompositeOperation = "overlay"; const r2 = ART.rng(seed);
      for (let i = 0; i < 46; i++) { const a = r2() * 6.28, d = r2() * r; ART.circ(g, x + Math.cos(a + t * 0.25) * d, y + Math.sin(a + t * 0.25) * d, r * (0.05 + r2() * 0.08)); g.fillStyle = r2() > 0.5 ? "rgba(255,255,255,.4)" : "rgba(160,40,0,.35)"; g.fill(); }
      g.restore();
    };
    ART.blueprint(g, t);
    g.save(); GC.cam(g, z, 540, 820);
    // núcleo da Terra (vem da esquerda) com o anel do corte
    const nx = 370 - 160 * (1 - k), ny = 590;
    disco(nx, ny, 225, 3);
    GC.neon(g, () => { ART.circ(g, nx, ny, 250); g.stroke(); }, { w: 3, a: 0.8 });
    GC.neon(g, () => { g.beginPath(); g.arc(nx, ny, 300, -2.6, -0.4); g.stroke(); }, { w: 2, cor: BP.fraca, dash: [10, 10], blur: 4 });
    // Sol (vem da direita) com coroa
    const sx = 625, sy = 1035 + 140 * (1 - k);   // sobe de baixo (não invade a coluna de botões à direita)
    g.save(); g.translate(sx, sy); g.rotate(t * 0.3); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 16; i++) { g.rotate(Math.PI / 8); g.fillStyle = ART.lg(g, 225, 0, 330, 0, [[0, `rgba(255,190,90,${0.5 * bri})`], [1, "rgba(255,150,60,0)"]]); g.beginPath(); g.moveTo(215, -18); g.lineTo(280 + (i % 2) * 22, 0); g.lineTo(215, 18); g.fill(); }
    g.restore();
    disco(sx, sy, 225, 7);
    // rótulos
    const la = ART.prog(t, 0.15, 0.4);
    GC.rot(g, "NÚCLEO", 640, 520, { size: 40, sp: 3, a: la });
    GC.rot(g, "DA TERRA", 640, 566, { size: 40, sp: 3, a: la });
    GC.rot(g, "≈ 6.000 °C", 640, 640, { size: 56, sp: 1, cor: "#FFD08A", a: la });
    const lb = ART.prog(t, Math.min(tS, D * 0.5), Math.min(tS, D * 0.5) + 0.25);
    GC.rot(g, "SUPERFÍCIE", 370, 960, { size: 40, sp: 3, align: "right", a: lb });
    GC.rot(g, "DO SOL", 370, 1006, { size: 40, sp: 3, align: "right", a: lb });
    GC.rot(g, "≈ 5.500 °C", 370, 1080, { size: 56, sp: 1, cor: "#FFD08A", align: "right", a: lb });
    // "≈" entre os dois
    const ek = Math.max(0, ART.prog(t, Math.min(tSol, D * 0.75) - 0.2, Math.min(tSol, D * 0.75) + 0.05, "outBack"));
    if (ek > 0.02) { g.save(); g.translate(510, 815); g.scale(ek, ek); ART.circ(g, 0, 0, 62); g.fillStyle = "rgba(6,26,38,.92)"; g.fill(); GC.neon(g, () => { ART.circ(g, 0, 0, 62); g.stroke(); }, { w: 3 }); ART.textFx(g, "≈", 0, 6, { size: 96, fam: "Lilita One", fill: "#FFD08A", stroke: null, sw: 0, shadow: null }); g.restore(); }
    ART.glow(g, 540, 820, 600, "#FFB548", 0.25 * ART.pulse(t, tA, 0.6));
    g.restore();
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
