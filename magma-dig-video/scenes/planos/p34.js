/* p34 · C5 painel Habilidades · "Mina, Força, Valor, Tempo, Poderes, Forja, Ajudantes."
 * Mais perto que o p33: a câmera desce pela coluna em trancos, um ramo por nome (no clique de cada palavra),
 * e cada cartão acende na sua cor com um estalo (escala + brilho). Todos continuam no nível 0. */
MD.plano("p34", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur, u = ART.ui;
    const NOMES = ["mina", "forca", "valor", "tempo", "poderes", "forja", "ajudantes"];
    const cl = (ctx.marks && ctx.marks.clique && ctx.marks.clique.length === 7) ? ctx.marks.clique : NOMES.map((n, i) => GB.wt(ctx, n, 0.04 + i * 0.5));
    const Y0 = 462, GAP = 117, S = 0.92, cc = i => Y0 + i * GAP + 61;
    // continua exatamente do enquadramento final do p33 (z 1,04 em torno de 540,800) e empurra devagar;
    // cada cartão acende no seu nome com estalo, e a câmera dá um tranquinho na direção do cartão aceso
    let lit = -1; for (let k = 0; k < 7; k++) if (t >= cl[k] - 0.02) lit = k;
    let shake = 0; for (const c of cl) shake += GB.hit(t, c, 0.18);
    let puxa = 0; for (let k = 0; k < 7; k++) puxa += (cc(k) - (k ? cc(k - 1) : 800)) * ART.ease.outBack(clamp((t - cl[k] + 0.02) / 0.22)) * 0.06;
    GB.fundoC5(g, t + 1.37, { dx: ART.map(t, 0, dur, -20, -40), z: 1.06 });
    const cam = { z: ART.map(t, 0, Math.max(dur, 1), 1.04, 1.13, "inOutSine"), cx: 540, cy: 800, px: 540, py: Math.min(797, 800 + puxa * 0.4), sy: shake * 5 };
    GB.noPainel(g, cam, gg => {
      u.cartao(gg, 140, 440, 800, 860, { r: 40, cor: "rgba(20,18,31,.72)", borda: "rgba(255,255,255,.10)" });
      gg.save(); gg.translate(540, 268); u.contador(gg, 0, 0, { valor: "NOITE 1", icone: "lua", s: 0.62, cor: "#CFD8FF" }); gg.restore();
      u.titulo(gg, 540, 350, "HABILIDADES", { s: 0.92 });
      gg.save(); gg.font = '900 32px "Nunito"'; gg.fillStyle = "#A3A0AE"; gg.textAlign = "center"; gg.letterSpacing = "2px"; gg.fillText("RAMOS · NÍVEL 0", 540, 412); gg.restore();
      GB.colRamos(gg, i => {
        const k = ART.ease.outCubic(clamp((t - cl[i] + 0.02) / 0.12));
        const pop = GB.hit(t, cl[i], 0.35);
        return { aceso: k, nivel: 0, a: 0.78 + 0.22 * k, esc: 1 + 0.08 * pop, flash: pop, pulso: pop * 0.8, dx: -14 * pop };
      }, { y0: Y0, gap: GAP, s: S });
    });
    ART.vignette(g, 0.5); ART.faixaLegenda(g, 0.35); ART.grain(g, ctx.frame, 0.05);
  },
});
