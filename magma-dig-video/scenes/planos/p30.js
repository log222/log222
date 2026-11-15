/* p30 · "Apagou. Seis moedas." (C7)
 * A lanterna do Zeca falha e apaga (no estalo): no breu só sobram os olhos dele, olhando pra cima. Em "Seis" o
 * contador amarelo de moedas acende flutuando no escuro, com seis moedinhas girando em volta. */
MD.plano("p30", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 1.44;
    const tOff = GC.mark(ctx, "apagar", 0.1), tSeis = GC.wt(ctx, "Seis", 0.57);
    const lamp = t < tOff ? ART.zeca.falha(t, 0.8, 4) : 0;
    const z = ART.map(t, 0, D, 1.0, 1.08, "inOutSine");
    g.fillStyle = "#040308"; g.fillRect(0, 0, 1080, 1920);
    g.save(); GC.cam(g, z, 540, 900);
    const p = ART.zeca.pose("parado", t, { x: 540, y: 1700, s: 3.6, turn: 0.1, look: [0, -0.8], eyes: "aberto", mouth: "o", lamp: lamp, headTilt: -6 });
    if (lamp > 0.05) { ART.zeca.draw(g, p); g.fillStyle = "rgba(4,3,8,.45)"; g.fillRect(-200, -200, 1480, 2320); }
    else ART.zeca.drawEscuro(g, p, 1);
    g.restore();
    // contador flutuando no escuro
    const ck = Math.max(0, ART.prog(t, tSeis - 0.05, tSeis + 0.2, "outBack"));
    if (ck > 0.06) {
      const y = 600 + Math.sin(t * 3) * 8;
      ART.glow(g, 540, y, 520, "#FFD23F", 0.35 * ck);
      for (let i = 0; i < 6; i++) {
        const a = t * 1.6 + i * Math.PI / 3, rx = 400 * ck, ry = 140 * ck;
        const mx = 540 + Math.cos(a) * rx, my = y + Math.sin(a) * ry;
        if (Math.sin(a) < 0) ART.ui.moeda(g, mx, my, 44 * ck, t * 5 + i);
      }
      ART.ui.contador(g, 540, y, { valor: 6, s: 3.3 * ck, cor: "#FFD23F", pulso: ART.pulse(t, tSeis, 0.35) });
      for (let i = 0; i < 6; i++) {
        const a = t * 1.6 + i * Math.PI / 3, rx = 400 * ck, ry = 140 * ck;
        const mx = 540 + Math.cos(a) * rx, my = y + Math.sin(a) * ry;
        if (Math.sin(a) >= 0) ART.ui.moeda(g, mx, my, 54 * ck, t * 5 + i);
      }
    }
    GC.post(g, ctx, { vinheta: 0.75, legendaK: 0.4 });
  },
});
