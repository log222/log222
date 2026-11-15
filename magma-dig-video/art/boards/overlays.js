/* Prancha de overlays de interface desenhados na cena. */
ART.boards.overlays = { dur: 3, render(g, t, f) {
  const U = ART.ui;
  g.fillStyle = ART.lg(g, 0, 0, 0, 1920, [[0, "#3A3050"], [0.5, "#2A2340"], [1, "#16121F"]]); g.fillRect(0, 0, 1080, 1920);
  ART.glow(g, 300, 500, 600, "#FFB548", 0.15); ART.glow(g, 800, 1300, 700, "#8E6FD0", 0.2);
  const lab = (s, x, y) => { g.save(); g.font = '800 24px "Nunito"'; g.fillStyle = "rgba(233,226,246,.55)"; g.letterSpacing = "3px"; g.textAlign = "center"; g.fillText(s.toUpperCase(), x, y); g.restore(); };
  // cronômetros
  U.cronometro(g, 200, 130, { valor: 10, icone: "sol", s: 0.8 }); lab("cronômetro", 200, 215);
  U.cronometro(g, 540, 130, { valor: 11, fantasma: 10, escala: 11, icone: "sol", s: 0.8 }); lab("dia 2 · fantasma", 540, 215);
  U.cronometro(g, 880, 130, { valor: 0.9, icone: "sol", s: 0.8 }); lab("alerta", 880, 215);
  // CRAC + contador + flutuante
  U.crac(g, 230, 330, 0.3, 0); U.crac(g, 230, 440, 0.3, 0, { apagado: true, s: 0.7, rot: 4 }); lab("crac! / crac apagado", 230, 520);
  U.contador(g, 610, 330, { valor: 7, icone: "moeda", pulso: 0.5 }); U.flutua(g, 760, 330, 0.12, 0, { texto: "+1", s: 0.8 }); lab("contador de saque", 610, 520);
  U.contador(g, 900, 330, { valor: "2", icone: "pedra", s: 0.7 }); U.contador(g, 900, 430, { valor: "1", icone: "cobre", s: 0.7 });
  // cartão meta
  U.cartaoMeta(g, 540, 660, { saldo: 40, meta: 1000, dia: 2, rotuloExtra: "4%", vidro: false }); lab("cartão fixo · saldo × meta · dia x de 30", 540, 790);
  // cartão de minério + seta
  U.cartaoMinerio(g, 380, 1040, { tipo: "cobre", nome: "Cobre", preco: 40, varPct: 12, s: 1.0, vidro: false, brilhoAmanha: 0.5 }); lab("cartão de minério · 7 dias + amanhã", 380, 1270);
  U.seta(g, 800, 990, { s: 0.8 }); g.save(); g.filter = "blur(3px)"; U.seta(g, 920, 1080, { s: 0.6, dir: "baixo", a: 0.6 }); g.restore(); lab("tendência", 860, 1190);
  // botões
  U.botao(g, 300, 1380, 440, 120, { texto: "VENDER", sub: "+40 moedas", icone: "moeda" });
  U.botao(g, 780, 1380, 380, 120, { texto: "COMPRAR", cor: "verde" }); lab("botões gordinhos", 540, 1480);
  // raridade
  U.etiqueta(g, 220, 1570, { texto: "RARO", cor: "#FF9A3C" }); U.etiqueta(g, 220, 1660, { texto: "ÉPICO", cor: "#B07CFF", s: 0.8 });
  // ramos
  U.ramo(g, 420, 1540, { ramo: 3, nivel: 1, s: 0.78, w: 760 }); U.ramo(g, 420, 1660, { ramo: 1, nivel: 0, aceso: 0.4, s: 0.78, w: 760 }); lab("ramos da árvore", 716, 1790);
  // ícones pixel
  ["pedra", "cobre", "ferro", "prata", "ouro", "ametista", "lasca", "moeda", "ampulheta", "mochila", "sol", "lua"].forEach((n, i) => U.pix(g, n, 70 + i * 86, 1860, 52));
  ART.grain(g, f, 0.04);
}};
