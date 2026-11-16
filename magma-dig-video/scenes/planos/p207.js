/* p207 · "Noite três. Mercado." (C3) — previamente/queda: em NOITE entra a etiqueta NOITE 3 (lua); a tela real do
 * Mercado (trailer 13,8–14,7 s) aparece borrada e escura (valores ilegíveis, VENDER TUDO +91,1K tapado) com push-in
 * rápido; em MERCADO dissolve para o painel redesenhado só com o título e a linha do Cobre (como o p49). */
MD.plano("p207", {
  async setup(ctx) {
    if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js");
    if (!window.GA2) await MD.loadScript("../scenes/planos/_grupoA_ep02.js");
    await ART.gameplay.preload(13.8, 14.8);
    return {};
  },
  render(g, t, ctx) {
    const D = ctx.dur || 2.41, tN = GA.w(ctx, "noite", 0, 0.02), tM = GA.w(ctx, "mercado", 0, D * 0.6);
    ART.gameplay.cheio(g, t, { de: 13.8, ate: 14.7, dur: Math.max(0.5, tM + 0.3), topo: 100, base: 560, foco: [440, 320], zoom: [1.0, 1.22], borrar: 8, escurecer: 0.42, tapar: [[110, 480, 750, 70]], selo: "IMAGEM REAL DO JOGO" });
    const tit = () => ART.ui.titulo(g, 540, 470, "MERCADO", { s: 1.1 });
    tit();
    const k = ART.prog(t, tM - 0.1, Math.min(D, tM + 0.35), "inOutSine");
    if (k > 0) {
      g.save(); g.globalAlpha = k;
      ART.palco(g, t, { zoom: 1 }, ART.cenas.tocaDesfocada(), null, { frame: ctx.frame, legenda: false });
      const z = ART.lerp(1, 1.07, ART.prog(t, tM - 0.1, D, "linear"));
      g.translate(540, 760); g.scale(z, z); g.translate(-540, -760);
      tit();
      const y = 610, d0 = tM, sl = (1 - ART.ease.outCubic(ART.prog(t, d0, d0 + 0.4))) * 80, al = ART.prog(t, d0 - 0.05, d0 + 0.25);
      g.save(); g.globalAlpha *= al;
      ART.ui.cartao(g, 130 + sl, y, 820, 130, { r: 26, sombra: false });
      ART.rr(g, 150 + sl, y + 20, 90, 90, 20); g.fillStyle = "#2A2640"; g.fill(); ART.ui.pix(g, "cobre", 195 + sl, y + 65, 56);
      g.font = '900 48px "Nunito"'; g.fillStyle = "#F4EEDC"; g.textBaseline = "middle"; g.textAlign = "left"; g.fillText("Cobre", 270 + sl, y + 67);
      g.font = '800 38px "Nunito"'; g.fillStyle = "#A3A0AE"; g.textAlign = "right"; g.fillText("×1", 900 + sl, y + 67);
      g.restore();
      g.restore();
    }
    // etiqueta NOITE 3 (entra na palavra NOITE, fica até o corte)
    const nk = ART.prog(t, tN - 0.05, tN + 0.2, "outBack");
    if (nk > 0) { g.save(); g.translate(540, 330); g.scale(nk, nk); ART.ui.contador(g, 0, 0, { valor: "NOITE 3", icone: "lua", s: 0.8 }); g.restore(); }
    ART.dust(g, t, { count: 22, seed: 91, color: "#C9C0F0", alpha: 0.3, size: [1.5, 3.5], speed: 6 });
    ART.post(g, ctx.frame, { vinheta: 0.45, legendaK: 0.32 });
  },
});
