/* p49 · "Noite dois. Mercado." (C3) — a tela real do Mercado aparece borrada e escura (valores ilegíveis) com o título;
 * em MERCADO dissolve para o painel redesenhado só com o título e a lista ainda sem preço nem botão (o 40 é do p51). */
MD.plano("p49", {
  async setup(ctx) { if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js"); await ART.gameplay.preload(13.6, 15.4); return {}; },
  render(g, t, ctx) {
    const D = ctx.dur || 1.41, tM = GA.w(ctx, "mercado", 0, D * 0.6);
    ART.gameplay.cheio(g, t, { de: 13.6, ate: 15.0, dur: D, topo: 100, base: 560, foco: [440, 320], zoom: [1.0, 1.15], borrar: 9, escurecer: 0.45, selo: "IMAGEM REAL DO JOGO" });
    ART.ui.titulo(g, 540, 420, "MERCADO", { s: 1.1 });
    const k = ART.prog(t, tM - 0.1, Math.min(D, tM + 0.35), "inOutSine");
    if (k > 0) {
      g.save(); g.globalAlpha = k;
      ART.palco(g, t, { zoom: 1 }, ART.cenas.tocaDesfocada(), null, { frame: ctx.frame, legenda: false });
      // empurrão lento contínuo até o corte
      const z = ART.lerp(1, 1.07, ART.prog(t, tM - 0.1, D, "linear"));
      g.translate(540, 700); g.scale(z, z); g.translate(-540, -700);
      ART.ui.titulo(g, 540, 420, "MERCADO", { s: 1.1 });
      // brilho passando pelo título
      { const sx = ART.lerp(200, 900, ART.prog(t, tM + 0.15, D, "inOutSine")); g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = k * 0.55;
        g.fillStyle = ART.lg(g, sx - 90, 0, sx + 90, 0, [[0, "rgba(255,240,200,0)"], [0.5, "rgba(255,240,200,.9)"], [1, "rgba(255,240,200,0)"]]); g.fillRect(sx - 90, 360, 180, 120); g.restore(); }
      [["cobre", "Cobre", "×1"]].forEach(([ic, nome, q], i) => {
        const y = 560 + i * 160, d0 = tM + i * Math.max(0.08, (D - tM) * 0.3), sl = (1 - ART.ease.outCubic(ART.prog(t, d0, d0 + 0.4))) * 80, al = ART.prog(t, d0 - 0.05, d0 + 0.25);
        g.save(); g.globalAlpha *= al;
        ART.ui.cartao(g, 130 + sl, y, 820, 130, { r: 26, sombra: false });
        ART.rr(g, 150 + sl, y + 20, 90, 90, 20); g.fillStyle = "#2A2640"; g.fill(); ART.ui.pix(g, ic, 195 + sl, y + 65, 56);
        g.font = '900 48px "Nunito"'; g.fillStyle = "#F4EEDC"; g.textBaseline = "middle"; g.textAlign = "left"; g.fillText(nome, 270 + sl, y + 67);
        g.font = '800 38px "Nunito"'; g.fillStyle = "#A3A0AE"; g.textAlign = "right"; g.fillText(q, 900 + sl, y + 67);
        g.restore();
      });
      g.restore();
    }
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.32 });
  },
});
