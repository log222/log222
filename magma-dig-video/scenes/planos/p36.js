/* p36 · C5 painel Habilidades · "O Zeca botou tudo em Tempo."
 * Plano detalhe: a pata do Zeca empurra a pilha de 6 moedas para cima (som das moedas); a câmera sobe com elas;
 * as moedas entram uma a uma no cartão TEMPO (saldo 6 → 0) e, no "Tempo", a 1ª bolinha acende: 0/7 → 1/7. */
MD.plano("p36", {
  async setup(ctx) {
    if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
    return {};
  },
  render(g, t, ctx) {
    const ART = window.ART, GB = window.GB, { clamp } = GB, dur = ctx.dur, u = ART.ui;
    const tM = GB.mark(ctx, "moeda", 0.25), tTudo = GB.wt(ctx, "tudo", 0.97), tTempo = GB.wt(ctx, "tempo", 1.45);
    // card TEMPO no espaço do painel
    const CY = 560, S = 1.08, CW = 760 * S, CX0 = 540 - CW / 2, CH = 132 * S;
    // moedas: pilha empurrada de y 1180 até 900 (tM → tTudo), depois voam uma a uma até o cartão (tTudo → tTempo)
    const empurra = ART.ease.inOutSine(clamp((t - tM + 0.1) / (tTudo - tM + 0.1)));
    const pilhaY = ART.lerp(1180, 980, empurra), pilhaX = ART.lerp(620, 540, empurra);
    const voo = i => clamp((t - (tTudo + i * (tTempo - tTudo - 0.06) / 6)) / 0.24);
    let entrou = 0; for (let i = 0; i < 6; i++) if (voo(i) >= 1) entrou++;
    const nivel = t >= tTempo ? 1 : 0, acende = GB.hit(t, tTempo, 0.6);
    // câmera sobe com as moedas
    const cy = ART.lerp(1000, 760, ART.ease.inOutSine(clamp((t - 0.1) / (tTempo - 0.1))));
    GB.fundoC5(g, t, { dy: (1000 - cy) * 0.15, z: 1.1, escuro: 0.1 });
    const cam = { z: 1.0 + 0.04 * clamp(t / dur), cx: 540, cy: 860, px: 540, py: cy, sy: acende * ART.noise(t * 40, 2) * 6 };
    GB.noPainel(g, cam, gg => {
      // cartões vizinhos apagados (Valor acima, Poderes abaixo) para dar contexto
      u.ramo(gg, CX0 + 30, CY + 190, { ramo: 4, nivel: 0, aceso: 0, s: S * 0.92, a: 0.45, sombra: false });
      u.ramo(gg, CX0, CY, { ramo: 3, nivel, aceso: 1, s: S, pulso: 0.4 + acende * 0.6 + 0.15 * entrou / 6, sombra: true });
      if (acende > 0) ART.glow(gg, 540, CY + CH / 2, 600, "#3FC6D6", 0.5 * acende);
      // moedas que ainda não voaram: pilha
      for (let i = 0; i < 6; i++) {
        const k = voo(i);
        const rx = pilhaX - 275 + i * 110, ry = pilhaY + Math.sin(t * 20 + i) * 3 * (1 - empurra);
        if (k <= 0) { u.moeda(gg, rx, ry, 48, 0.25 * Math.sin(t * 6 + i), { brilho: 0.15 }); continue; }
        if (k >= 1) continue;
        const e = ART.ease.inOutSine(k), x0 = rx, y0 = ry, x1 = CX0 + 160 + i * 18, y1 = CY + CH / 2;
        const x = ART.lerp(x0, x1, e), y = ART.lerp(y0, y1, e) - Math.sin(Math.PI * e) * 160;
        u.moeda(gg, x, y, 40 * (1 - 0.4 * e), k * 9 + i, { brilho: 0.25 });
      }
      // +1 no nível
      if (t > tTempo) u.flutua(gg, CX0 + CW - 120, CY + 20, t, tTempo, { texto: "+1", cor: "#7FE8F0" });
    });
    // pata empurrando a pilha (vem de baixo/direita), sai depois do "tudo"
    const sai = ART.ease.inCubic(clamp((t - tTudo - 0.05) / 0.35));
    if (sai < 1) {
      const sy = 860 + (pilhaY + 10 - cy) * cam.z, sx = 540 + (pilhaX + 275 + 150 - 540) * cam.z;
      ART.pata(g, sx + sai * 600, sy + 40 + sai * 300, 18, { s: 1.0, dedos: "aberta" });
    }
    // saldo 6 → 0 (contador no alto)
    const saldo = 6 - entrou;
    u.contador(g, 540, 300, { valor: saldo, s: 0.9, pulso: entrou > 0 ? GB.hit(t, tTudo + 0.24 + (entrou - 1) * (tTempo - tTudo - 0.06) / 6, 0.3) : 0, cor: saldo === 0 ? "#FF9A9A" : "#FFFFFF" });
    ART.vignette(g, 0.55); ART.faixaLegenda(g, 0.4); ART.grain(g, ctx.frame, 0.05);
  },
});
