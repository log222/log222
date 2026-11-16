/* Helpers do grupo A, Parte 2 (dia 4 na mina A + gameplay real). Planos: p207 p241–p250 p258.
 * Usa o GA (_grupoA.js) sem mudá-lo. Tudo dirigido por t, ctx.words e ctx.marks. */
(function () {
  const ART = window.ART, GA = window.GA;
  const GA2 = (window.GA2 = {});
  const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]/g, "").toLowerCase();
  /** fim (s, local) da n-ésima ocorrência da palavra; fb se não achar */
  GA2.wFim = (ctx, palavra, n = 0, fb = 0) => { const m = (ctx.words || []).filter(w => norm(w.w) === norm(palavra)); return m[n] ? m[n].fim : fb; };
  /** enquadramento padrão do dia 4 (plano médio: Zeca inteiro à esquerda, bloco à direita) */
  GA2.camMedio = (mov = {}, z = 1.6) => GA.cam(480, 1010, z, mov, { sy: 860 });
  /** close do impacto com o Zeca inteiro à esquerda (bloco cortado à direita) */
  GA2.camClose = (mov = {}, z = 2.0) => GA.cam(500, 1000, z, mov, { sy: 820 });
  /** HUD do dia 4: cronômetro (max/escala 11), contador de moedas e, opcional, contador de cobre embaixo */
  GA2.hud = (g, t, o = {}) => {
    GA.hud(g, t, { cron: o.cron, max: 11, escala: 11, moedas: o.moedas, pulso: o.pulso || 0, intro: o.intro ?? 1, y: o.y });
    if (o.cobre != null) {
      const s = o.intro ?? 1;
      g.save(); g.translate(250, (o.y ?? 330) + 118); g.scale(s, s);
      ART.ui.contador(g, 0, 0, { valor: o.cobre, icone: "cobre", pulso: o.pulsoCobre || 0, s: 0.92 });
      if (o.pulsoCobre > 0) ART.glow(g, 0, 0, 160, "#FF8A3C", 0.45 * o.pulsoCobre);
      g.restore();
    }
  };
  /** lascas de pedra + faíscas no golpe h (coordenadas do plano do personagem) */
  GA2.lascas = (gg, t, h, x, y, seed = 1, o = {}) => {
    for (const p of ART.burst(t, { t0: h, count: o.n ?? 14, x, y, speed: [300, 820], angle: [-175, -30], gravity: 2200, life: [0.3, 0.65], seed: seed * 7 + 3, size: [7, 15] })) {
      gg.save(); gg.globalAlpha = p.alpha; gg.fillStyle = p.i % 3 ? (o.cor1 || "#BAAB87") : (o.cor2 || "#76756A"); gg.translate(p.x, p.y); gg.rotate(p.rot * 0.02); gg.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7); gg.restore();
    }
    const sp = ART.burst(t, { t0: h, count: o.fa ?? 10, x, y: y - 10, speed: [600, 1100], angle: [-170, -10], gravity: 1500, life: [0.15, 0.3], seed: seed * 11 + 5 });
    gg.save(); gg.globalCompositeOperation = "lighter";
    for (const p of sp) { gg.globalAlpha = p.alpha; gg.strokeStyle = o.faisca || "#FFE29A"; gg.lineWidth = 3; gg.beginPath(); gg.moveTo(p.x, p.y); gg.lineTo(p.x - 18, p.y + 10); gg.stroke(); }
    gg.restore();
    ART.glow(gg, x, y, 140, o.clarao || "#FFE6B0", t >= h ? 0.9 * Math.max(0, 1 - (t - h) / 0.12) : 0);
  };
  /** objeto voando em arco de (de) até (ate) em px de tela, chegando em tChega. desenha(g, x, y, k) */
  GA2.voa = (g, t, t0, tChega, de, ate, desenha, alto = 220) => {
    const k = ART.prog(t, t0, tChega, "inCubic"); if (k <= 0 || k >= 1) return;
    desenha(g, ART.lerp(de[0], ate[0], k), ART.lerp(de[1], ate[1], k) - Math.sin(k * Math.PI) * alto, k);
  };
  /** clarão de tela inteira curto no impacto */
  GA2.flash = (g, t, h, cor = "rgba(255,230,190,.45)", dur = 0.07) => { if (t >= h && t < h + dur) { g.save(); g.fillStyle = cor; g.fillRect(0, 0, 1080, 1920); g.restore(); } };
  /** câmera na mão (ruído suave) */
  GA2.mao = (t, a = 1) => ({ sx: ART.noise(t * 3, 2) * 10 * a, sy: ART.noise(t * 3, 5) * 8 * a, rot: ART.noise(t * 2, 8) * 0.5 * a });
})();
