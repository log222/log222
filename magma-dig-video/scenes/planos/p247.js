/* p247 · "Dois segundos de presente." (C7) — close do cronômetro no escuro da mina. Embaixo, uma ampulheta pequena
 * brilha; a areia dourada sobe em espiral e entra na ponta da barra amarela: a cada grão que chega a barra cresce e o
 * número sobe 5,0 → 7,0 (a ÚNICA subida do dia, dentro do plano). "+2 s" grande entra na palavra DOIS. Push-in lento. */
MD.plano("p247", {
  async setup(ctx) {
    if (!window.GA) await MD.loadScript("../scenes/planos/_grupoA.js");
    if (!window.GA2) await MD.loadScript("../scenes/planos/_grupoA_ep02.js");
    return {};
  },
  render(g, t, ctx) {
    const D = ctx.dur || 2.12, tP = GA.w(ctx, "presente", 0, D * 0.6), tD = GA.w(ctx, "dois", 0, 0.02);
    const t0 = Math.max(0.02, tD), tFim = Math.max(t0 + 0.8, Math.min(D - 0.25, GA2.wFim(ctx, "presente", 0, D * 0.85) - 0.1));
    const tt = t0 + (t - t0) * (1.86 / (tFim - t0));                      // tempo da areia (chega toda em tFim)
    const z = ART.lerp(1.0, 1.08, ART.prog(t, 0, D, "inOutSine"));
    // fundo: parede da mina no breu, só a luz da lanterna de cima
    g.fillStyle = "#050409"; g.fillRect(0, 0, 1080, 1920);
    const tex = ART.texVoronoi("p247pedra", { seed: 33, n: 26, cores: ["#57534F", "#4A4744", "#625D57"], junta: "#262422" });
    g.save(); g.translate(540, 860); g.scale(1 + (z - 1) * 0.5, 1 + (z - 1) * 0.5); g.translate(-540 + t * 6, -860);
    g.globalAlpha = 0.42; g.fillStyle = g.createPattern(tex, "repeat"); g.fillRect(-120, -120, 1320, 2160); g.globalAlpha = 1; g.restore();
    g.fillStyle = ART.rg(g, 540, 820, 80, 1000, [[0, "rgba(5,4,9,.1)"], [0.55, "rgba(5,4,9,.6)"], [1, "rgba(5,4,9,.97)"]]); g.fillRect(0, 0, 1080, 1920);
    ART.dust(g, t, { count: 40, seed: 71, color: "#FFE6A0", alpha: 0.45, size: [2, 5], speed: 10, x: 120, w: 840, y: 380, h: 860 });
    // cronômetro grande
    g.save(); g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
    const cy = 600, s = 2.35, w = 350 * s, bx = 540 - w / 2 + 28 * s, bw = w - 56 * s, by = cy + 40 * s, bh = 14 * s;
    const ax = 360, ay = 1040;
    // areia: sai da ampulheta e converge para a ponta da barra (7/11)
    const valDe = x => ART.lerp(5.0, 7.0, ART.ease.inOutSine(ART.prog(x, t0 + 0.55, t0 + 1.86)));   // sobe enquanto a areia entra na barra
    const alvo = x => [bx + bw * valDe(x) / 11 - 6, by + bh / 2];   // a areia segue a ponta da barra
    ART.obj.ampulheta(g, t, { x: ax, y: ay, s: 0.36, areia: ART.lerp(0.25, 1, ART.prog(tt, t0, t0 + 1.86)), brilho: 0.6 + 0.3 * Math.sin(t * 5) });
    const frac = ART.estouroAreia(g, tt, { t0, centro: [ax, ay - 40], tam: 200, alvo, tAlvo: 0.3, n: 200, seed: 13, lascas: false });
    const val = valDe(tt);
    const fim = ART.prog(t, tFim - 0.1, tFim + 0.18), pe = ART.prog(t, tD - 0.04, tD + 0.22);   // "+2 s" entra em DOIS
    ART.glow(g, 540, cy, 620, "#FFD23F", 0.16 + 0.22 * fim + 0.12 * ART.prog(val, 5, 7));
    ART.ui.cronometro(g, 540, cy, { valor: val, max: 11, escala: 11, s, icone: "sol" });
    // brilho na ponta da barra que cresce
    if (val > 5.01 && val < 6.99) { g.save(); g.globalCompositeOperation = "lighter"; ART.glow(g, bx + bw * val / 11, by + bh / 2, 90, "#FFF1B0", 0.8); g.restore(); }
    const tc = t; // "+2 s" salta quando chega a 7,0 e fica até o corte
    const pk = pe > 0 ? ART.ease.outBack(pe) * (1 + 0.12 * fim * Math.max(0, 1 - (t - tFim) / 0.3)) : 0;
    if (pk > 0.01) { g.save(); g.translate(740, 1040 - 8 * Math.sin(tc * 4)); g.scale(pk, pk); ART.glow(g, 0, 0, 220, "#FFD23F", 0.35); ART.textFx(g, "+2 s", 0, 0, { size: 140, fam: "Nunito", weight: 1000, fill: "#FFD23F", stroke: "#1A1020", sw: 18 }); g.restore(); }
    g.restore();
    // rótulo do dia, discreto, no alto
    g.save(); g.globalAlpha = 0.85; g.font = '900 44px "Nunito"'; g.letterSpacing = "6px"; g.textAlign = "center"; g.fillStyle = "#D8D2E8"; g.shadowColor = "rgba(0,0,0,.7)"; g.shadowBlur = 12; g.fillText("DIA 4 DE 30", 540, 330); g.restore();
    ART.post(g, ctx.frame, { vinheta: 0.6, legendaK: 0.4 });
  },
});
