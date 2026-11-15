/* p19 · "o Coração de Magma." (C8)
 * No fundo do escuro, a silhueta gigante do Coração de Magma bate (sincronizado com a batida grave): o contorno e as
 * fendas acendem a cada pulso. Lá embaixo, o Zeca minúsculo, de costas, olha pra cima: dá a escala. Empurrão lento. */
MD.plano("p19", {
  async setup() { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; },
  render(g, t, ctx) {
    const ART = window.ART, GC = window.GC, D = ctx.dur || 1.43;
    const tb = GC.mark(ctx, "coracao", 0);
    const tCor = GC.wt(ctx, "Coração", 0.2);
    // batidas: tum-tum no som, e de novo ~0,85 s depois
    const beat = Math.max(ART.pulse(t, tb, 0.28), 0.7 * ART.pulse(t, tb + 0.22, 0.26), ART.pulse(t, tb + 0.85, 0.28), 0.7 * ART.pulse(t, tb + 1.07, 0.26));
    const z = ART.map(t, 0, D, 1.0, 1.07, "outSine") * (1 + 0.012 * beat);
    g.save(); GC.cam(g, z, 540, 820);
    ART.coracaoMagma(g, 0, { x: 540, y: 800, s: 0.92, pulso: 0.45 + 1.1 * beat, revela: 0.15 + 0.35 * beat + 0.15 * ART.prog(t, tCor, D) });
    ART.glow(g, 540, 800, 900, "#FF5A1A", 0.4 * beat); ART.glow(g, 540, 760, 380, "#FFB060", 0.3 * beat);
    // chão de rocha e o Zeca pequeno de costas, recortado pela luz laranja
    g.fillStyle = ART.lg(g, 0, 1180, 0, 1400, [[0, "#1A0806"], [1, "#050203"]]);
    g.beginPath(); g.moveTo(-100, 1260); g.quadraticCurveTo(300, 1190, 540, 1215); g.quadraticCurveTo(800, 1240, 1180, 1185); g.lineTo(1180, 2000); g.lineTo(-100, 2000); g.fill();
    const p = ART.zeca.pose("parado", t, { x: 470, y: 1222, s: 0.75, turn: 0.2, costas: 1, lamp: 1, cone: 0.6, coneLivre: 1, coneAng: -70, coneLen: 500, rim: "#FF7A2A", rimA: 0.9 });
    ART.zeca.drawEscuro(g, p, 0.65, { cor: "#FFB070" });
    g.restore();
    ART.dust(g, t, { count: 40, seed: 12, color: "#FF9A50", size: [2, 5], speed: 50, alpha: 0.6 });
    GC.post(g, ctx, { vinheta: 0.7, legendaK: 0.45 });
  },
});
