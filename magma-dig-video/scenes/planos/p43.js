/* p43 · "Mas hoje tinha mais um." (C7)
 * Close mais fechado que o p42: a lanterna do capacete ainda falha (continua o "ontem apagava aqui"), firma em "hoje" e
 * brilha forte; o Zeca aperta os olhos, determinado. Em "mais" a ampulheta dourada do ramo Tempo acende no canto com
 * "+1 s". Empurrão até a lâmpada. */
MD.plano("p43", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 1.44;
    const tH = GC.wt(ctx, "hoje", 0.36), tM = GC.wt(ctx, "mais", 1.0);
    const on = t < tH ? 0.25 + 0.75 * ART.zeca.falha(t, 0.9, 7) : 0.85 + 0.15 * ART.prog(t, tH, tH + 0.15);
    const z = ART.kf(t, [[0, 1.0], [tH, 1.04], [D, 1.18, "inOutSine"]]);
    const LX = 490, LY = 450, S = 7.0, CX = 520, CY = 880;   // olhos e boca acima de y 1200
    g.save();
    GC.breu(g, t, { x: LX, y: LY, c0: ART.mix("#0A0810", "#221A2C", on), c1: "#040308" });
    GC.cam(g, z, CX, CY);
    const pose = ART.zeca.pose("parado", t + 5, { x: LX + 40, y: LY + 201 * S, s: S, turn: 0.15, look: [0.1, 0], eyes: t < tH ? "preocupado" : "determinado", brows: t < tH ? "preocupado" : "bravo", mouth: "neutro", blink: 0, headTilt: 3 });
    const anc = GC.zecaNoEscuro(g, pose, { escuro: ART.lerp(0.95, 0.72, on), raio: 1100, rimK: on });
    g.restore();
    const lp = anc.lanterna || { x: LX, y: LY };
    GC.lampada(g, t, lp.x, lp.y, S * 13 * z * 0.5, on, { halo: 0.8 + 0.5 * ART.prog(t, tH, D) });
    ART.dust(g, t, { count: 60, seed: 19, color: "#FFF0C8", alpha: 0.8 * on, size: [2, 6], x: 40, w: 1000, y: 150, h: 1100, speed: 26 });
    // ampulheta do ramo Tempo
    const ak = Math.max(0, ART.prog(t, tM - 0.04, tM + 0.25, "outBack"));
    if (ak > 0) {
      g.save(); g.translate(820, 400); g.scale(ak, ak);
      ART.circ(g, 0, 0, 130); g.fillStyle = "rgba(20,16,30,.9)"; g.fill(); g.lineWidth = 6; g.strokeStyle = "#FFD23F"; g.stroke();
      ART.obj.ampulheta(g, t, { x: 0, y: -10, s: 0.36, areia: ART.map(t, tM, D, 0.15, 0.4), brilho: 0.6 });
      ART.textFx(g, "+1 s", 0, 175, { size: 70, fam: "Nunito", weight: 1000, fill: "#FFD23F", stroke: "#1A1020", sw: 14 });
      g.restore();
    }
    // relógio canônico: 1,0 congelado (o segundo comprado), vermelho, piscando de leve
    ART.ui.cronometro(g, 300, 335, { valor: 1.0, max: 11, s: 0.95, icone: "sol", alerta: 1.0, a: 0.85 + 0.15 * Math.sin(t * 12) });
    GC.post(g, ctx, { vinheta: 0.7, legendaK: 0.38 });
  },
});
