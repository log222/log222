/* p38 · "Dia dois. Onze segundos de luz." (C7)
 * Clique: a lanterna do Zeca acende (eco do p01) e o cronômetro do jogo aparece com "DIA 2 DE 30"; em "Onze" o número
 * pula de 10,0 para 11,0 e a barra amarela cresce além da barra fantasma tracejada de ontem (10,0). "+1 s" sobe. */
MD.plano("p38", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 2.0;
    const tc = GC.mark(ctx, "clique", 0.02), tO = GC.wt(ctx, "Onze", 0.65);
    const on = ART.kf(t - tc, [[0, 0], [0.04, 1, "outExpo"], [0.09, 0.3], [0.14, 1]]);
    const cresce = Math.max(0, ART.prog(t, tO, tO + 0.3, "outBack"));
    const val = ART.lerp(10, 11, ART.prog(t, tO, tO + 0.18));
    const z = ART.map(t, 0, D, 1.0, 1.1, "inOutSine");
    // fundo: mina escura, acende com a lanterna
    g.fillStyle = "#050409"; g.fillRect(0, 0, 1080, 1920);
    const tex = ART.texVoronoi("p03pedra", { seed: 31, n: 26, cores: ["#57534F", "#4A4744", "#625D57"], junta: "#262422" });
    g.save(); GC.cam(g, 1 + (z - 1) * 0.5, 540, 900);
    g.globalAlpha = 0.5 * on; g.fillStyle = g.createPattern(tex, "repeat"); g.fillRect(-100, -100, 1280, 2120); g.globalAlpha = 1;
    g.fillStyle = ART.rg(g, 640, 1000, 60, 1100, [[0, "rgba(5,4,9,0)"], [0.6, "rgba(5,4,9,.55)"], [1, "rgba(5,4,9,.97)"]]); g.fillRect(-100, -100, 1280, 2120);
    const pz = ART.zeca.pose("parado", t, { x: 540, y: 1270, s: 2.1, turn: 0.35, tool: "picareta", aF: 40, eF: 60, eyes: "determinado", mouth: "neutro", brows: "bravo", lamp: on, cone: 0.9 * on, coneAng: 42, coneLen: 560, rim: "#FFB060", rimA: 0.4 * on });
    if (on > 0.05) ART.zeca.draw(g, pz); else ART.zeca.drawEscuro(g, pz, 1);
    g.restore();
    // cronômetro grande com barra fantasma
    const cy = 560;
    g.save(); GC.cam(g, z * (1 + 0.05 * ART.pulse(t, tO, 0.3)), 540, cy);
    ART.glow(g, 540, cy, 600, "#FFD23F", 0.18 * on + 0.25 * ART.pulse(t, tO, 0.5));
    ART.ui.cronometro(g, 530, cy, { valor: val, max: 11, escala: 11, fantasma: 10, s: 2.5, icone: "sol", a: ART.prog(t, tc, tc + 0.12) });
    // marca de ontem (10,0) por cima da barra: a de hoje passa dela
    { const s = 2.5, w = 350 * s, bx = 530 - w / 2 + 28 * s, bw = w - 56 * s, by = cy + 40 * s, mx = bx + bw * 10 / 11, mk = ART.prog(t, tO - 0.1, tO + 0.2);
      g.save(); g.globalAlpha = mk; g.setLineDash([10, 7]); g.strokeStyle = "#FFFFFF"; g.lineWidth = 6; g.beginPath(); g.moveTo(mx, by - 18); g.lineTo(mx, by + 14 * s + 18); g.stroke(); g.setLineDash([]);
      g.font = '900 40px "Nunito"'; g.textAlign = "center"; g.fillStyle = "#D8D2E8"; g.shadowColor = "#000"; g.shadowBlur = 10; g.fillText("ONTEM", mx - 10, by + 14 * s + 62); g.restore(); }
    g.restore();
    // DIA 2 DE 30
    const dk = ART.prog(t, 0.0, 0.2, "outCubic");
    g.save(); g.globalAlpha = dk; g.font = '900 46px "Nunito"'; g.letterSpacing = "6px"; g.textAlign = "center"; g.fillStyle = "#D8D2E8"; g.shadowColor = "rgba(0,0,0,.7)"; g.shadowBlur = 12; g.fillText("DIA 2 DE 30", 540, cy - 250); g.restore();
    const pk = Math.max(0, ART.prog(t, tO + 0.02, tO + 0.25, "outBack"));
    if (pk > 0.01) { g.save(); g.translate(845, cy - 252); g.scale(pk, pk); ART.textFx(g, "+1 s", 0, 0, { size: 66, fam: "Nunito", weight: 1000, fill: "#FFD23F", stroke: "#1A1020", sw: 12 }); g.restore(); }
    GC.post(g, ctx, { vinheta: 0.7, legendaK: 0.42 });
  },
});
