/* p17 · "e abrir a próxima mina." (C3) — Mapa da Jornada do trailer; a câmera desliza do nó A (Terra Rasa) ao nó B
 * (Pinheiral Nevado); em PRÓXIMA o nó B ganha um anel pulsante. */
MD.plano("p17", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(20.0, 21.6); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.55, tP = GA.w(ctx, "proxima", 0, 0.6);
    const k = ART.prog(t, 0.1, tP + 0.25, "inOutCubic");
    const foco = [ART.lerp(176, 336, k), ART.lerp(200, 214, k)];
    const v = ART.gameplay.visor(g, t, { de: 20.0, ate: 20.0 + D, dur: D, recorte: ART.gameplay.RECORTES.mapaAlto, y: 800, largura: 1010, zoom: [1.35, 1.35], foco, retrato: 0, rotulo: "MAPA DA JORNADA", aba: false, lanterna: 0.4 });
    const b = v.map(336, 214), pk = ART.prog(t, tP, tP + 0.3, "outBack");
    if (pk > 0) { g.save(); g.lineWidth = 8; g.strokeStyle = "#FFD23F"; g.globalAlpha = pk; ART.circ(g, b[0], b[1], 70 + 10 * Math.sin(t * 10)); g.stroke(); g.restore(); ART.glow(g, b[0], b[1], 200, "#FFD23F", 0.4 * pk); }
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.3 });
  },
});
