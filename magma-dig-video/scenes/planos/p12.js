/* p12 · "Cavar, tatu já nasce sabendo." (C6 ciência)
 * Blueprint: um tatu de verdade, grande e de traço grosso, se desenha em linhas ciano, inclinado de focinho para a
 * terra; em "tatu" as garras da frente acendem em amarelo e cavam: a toca (corte tracejado) avança terra adentro e a
 * terra voa. Etiqueta GARRAS DE CAVAR. Câmera desliza e empurra devagar durante todo o plano. */
MD.plano("p12", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, BP = ART.BP, D = ctx.dur || 2.07;
    const tT = GC.wt(ctx, "tatu", 0.6);
    const prog = ART.prog(t, 0, Math.min(tT + 0.15, D * 0.5), "outCubic");
    const gar = ART.prog(t, tT, tT + 0.3);
    const cava = ART.prog(t, tT, D, "linear");
    const z = ART.map(t, 0, D, 1.0, 1.07, "inOutSine"), dx = ART.map(t, 0, D, 20, -20, "inOutSine");
    ART.blueprint(g, t);
    g.save(); GC.foco(g, z, 540 + dx, 820, 540, 820);
    // chão (superfície) e a toca sendo aberta
    const solo = 1010, sy = x => solo + (x - 740) * 0.12 + Math.sin(x * 0.013) * 6;   // barranco levemente inclinado
    GC.neon(g, () => { g.beginPath(); g.moveTo(-100, sy(-100)); for (let x = -100; x <= 1180; x += 40) g.lineTo(x, sy(x)); g.stroke(); }, { w: 4, a: 0.9 });
    g.save(); g.beginPath(); g.moveTo(-100, sy(-100)); for (let x = -100; x <= 1180; x += 40) g.lineTo(x, sy(x)); g.lineTo(1180, 1700); g.lineTo(-100, 1700); g.closePath(); g.clip(); g.strokeStyle = "rgba(143,211,232,.08)"; g.lineWidth = 2;
    for (let k = -800; k < 1600; k += 26) { g.beginPath(); g.moveTo(k, solo); g.lineTo(k - 500, solo + 500); g.stroke(); } g.restore();
    if (cava > 0) {
      const toca = new Path2D("M740,1010 C780,1080 800,1150 880,1200 C950,1240 1040,1250 1160,1245");
      g.save(); g.setLineDash([16, 12]); GC.neon(g, () => { g.lineDashOffset = 0; g.save(); g.setLineDash([2000]); g.lineDashOffset = 2000 * (1 - cava); g.lineWidth = 70; g.strokeStyle = "rgba(143,211,232,.22)"; g.shadowBlur = 0; g.stroke(toca); g.restore(); }, { w: 3 }); g.restore();
    }
    // o tatu (traço grosso), inclinado para a terra
    g.save(); g.translate(452, 770); g.rotate(0.2); g.scale(1.42, 1.42);
    const corpo = new Path2D("M-300,40 C-310,-40 -250,-130 -120,-150 C20,-170 160,-150 230,-80 C260,-50 270,-10 300,10 C330,30 370,40 380,60 C370,75 330,78 300,72 C270,70 250,80 230,95 C150,110 -100,110 -200,95 C-250,90 -290,75 -300,40 Z");
    g.fillStyle = `rgba(143,211,232,${0.13 * prog})`; g.fill(corpo);
    g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = BP.linha; g.shadowColor = BP.linha; g.shadowBlur = 14; g.lineWidth = 6;
    g.setLineDash([3000]); g.lineDashOffset = 3000 * (1 - prog); g.stroke(corpo); g.setLineDash([]);
    g.globalAlpha = prog; g.lineWidth = 4.5;
    for (let i = 0; i < 9; i++) { const x = -170 + i * 40; g.beginPath(); g.moveTo(x, -140 + Math.abs(i - 4) * 4); g.quadraticCurveTo(x + 12, -20, x + 4, 92); g.stroke(); }
    g.lineWidth = 6;
    g.beginPath(); g.moveTo(-300, 40); g.quadraticCurveTo(-400, 70, -460, 140); g.stroke();
    g.beginPath(); g.moveTo(240, -70); g.lineTo(225, -125); g.lineTo(265, -78); g.stroke();
    ART.circ(g, 300, 8, 7); g.fillStyle = BP.linha; g.fill();
    // pernas grossas; as da frente cavam (raspam para trás)
    const raspa = gar > 0 ? Math.sin(t * 22) : 0;
    for (const [x, frente, ph] of [[-200, false, 0], [-130, false, 1], [130, true, 0], [195, true, Math.PI]]) {
      const sw = frente ? raspa * Math.cos(ph) * 22 * gar : 0;
      g.lineWidth = 16; g.strokeStyle = BP.linha; g.beginPath(); g.moveTo(x, 90); g.lineTo(x + 6 + sw, 160); g.stroke();
      if (frente) {
        g.save(); g.strokeStyle = BP.amarelo; g.shadowColor = BP.amarelo; g.shadowBlur = 18; g.lineWidth = 8; g.globalAlpha = prog * (0.35 + 0.65 * gar);
        for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + sw + k * 10 - 4, 162); g.quadraticCurveTo(x + sw + 26 + k * 10, 172, x + sw + 36 + k * 11, 196); g.stroke(); }
        g.restore();
      }
    }
    g.restore();
    // terra voando para trás das garras
    if (gar > 0) {
      for (let n = 0; n < 4; n++) {
        const ps = ART.burst((t - tT) % 0.5 + n * 0.0, { t0: n * 0.12, count: 10, x: 740, y: 1010, speed: [250, 520], angle: [-170, -120], gravity: 1500, life: [0.3, 0.5], seed: 30 + n + 7 * Math.floor((t - tT) / 0.5) });
        g.save(); for (const q of ps) { g.globalAlpha = q.alpha * gar; ART.circ(g, q.x, q.y, 5 + q.r * 5); g.fillStyle = BP.linha; g.fill(); } g.restore();
      }
      GC.neon(g, () => { g.beginPath(); g.moveTo(800, 1050); g.lineTo(840, 1110); g.lineTo(900, 1110); g.stroke(); }, { cor: BP.amarelo, w: 3, a: gar });
    }
    g.restore();
    if (gar > 0) GC.rot(g, "GARRAS DE CAVAR", 940, 1200, { cor: BP.amarelo, align: "right", size: 42, a: gar, sp: 3 });
    GC.post(g, ctx, { vinheta: 0.55, legendaK: 0.32 });
  },
});
