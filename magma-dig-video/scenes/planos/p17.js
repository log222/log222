/* p17 · "e abrir a próxima mina." (C3) — Mapa da Jornada real em tela cheia; a câmera desliza do nó A (Terra Rasa)
 * ao nó B (Pinheiral Nevado); em PRÓXIMA o nó B ganha um anel pulsante. */
MD.plano("p17", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(20.0, 21.8); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.55, tP = GA.w(ctx, "proxima", 0, D * 0.4);
    const k = ART.prog(t, 0.05, tP + 0.25, "inOutCubic");
    const v = ART.gameplay.cheio(g, t, { de: 20.0, ate: 21.6, dur: D, topo: 60, base: 470, foco: [ART.lerp(176, 336, k) + 12 * ART.prog(t, tP + 0.25, D), 210], zoom: [1.95, 2.15], selo: "MAPA DA JORNADA · IMAGEM REAL" });
    const b = v.map(336, 205), pk = ART.prog(t, tP, tP + 0.3, "outBack");
    if (pk > 0) { g.save(); g.lineWidth = 9; g.strokeStyle = "#FFD23F"; g.globalAlpha = pk; ART.circ(g, b[0], b[1], 80 + 10 * Math.sin(t * 10)); g.stroke(); g.restore(); ART.glow(g, b[0], b[1], 220, "#FFD23F", 0.45 * pk); }
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.32 });
  },
});
