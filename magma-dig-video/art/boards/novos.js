/* Peças novas do acabamento (prancha de conferência). */
ART.boards.novos = { dur: 3, render(g, t, f) {
  const k = window.__K__ || 0, Z = ART.zeca;
  const L = [
    () => { // 0: parede de veios + Zeca com luz laranja no rosto (planos 45–46), plano médio
      const cena = ART.cenas.mina({}); const cam = ART.camMais(ART.enquadrar(560, 1000, 1.8), ART.camera(t, { push: [1, 1.05], dur: 3 }));
      ART.palco(g, t, cam, cena, gg => { ART.cubo(gg, 0.15, 2.9, { veios: 1, crack: 2.5, seed: 4, crackGlow: "#FFB060", t }); Z.draw(gg, Z.pose("parado", t, { x: 372, y: 1182, s: 1.62, turn: 0.75, eyes: "espanto", mouth: "o", lamp: 1, banho: { cor: "#FF8A3C", k: 1 }, rim: "#FF9A50", rimA: 0.9 })); }, { frame: f });
    },
    () => { g.fillStyle = "#07060C"; g.fillRect(0, 0, 1080, 1920); ART.obj.bracoForte(g, t, { t0: 1.0 }); ART.ui.crac(g, 300, 1100, t, 1.12, { apagado: true, s: 1.2, dur: 1.5 }); ART.post(g, f, {}); },
    () => { // 2: fantasma de ontem por cima da cena de hoje
      const cena = ART.cenas.mina({}); const cam = ART.enquadrar(420, 1000, 1.6);
      ART.palco(g, t, cam, cena, gg => Z.draw(gg, Z.pose("cavando", t, { x: 372, y: 1182, s: 1.62, turn: 0.82, lamp: Z.falha(t, 0.6) }, { periodo: 0.7 })), { frame: f });
      ART.duplaExposicao(g, d => { d.fillStyle = "#000"; d.fillRect(0, 0, 1080, 1920); ART.withLayer(d, cam, 1, gg => Z.drawEscuro(gg, Z.pose("parado", t, { x: 372, y: 1182, s: 1.62, turn: 0.82 }), 1)); }, 0.6, { dx: 18, tint: "rgba(40,60,140,.25)" });
    },
    () => { ART.holofote(g, t, { cor: "#FFD23F" }); ART.obj.ampulheta(g, t, { brilho: 1, areia: 0.4 }); ART.post(g, f, {}); },
    () => { ART.coracaoMagma(g, t, { revela: 0.7 }); ART.post(g, f, {}); },
    () => { ART.palco(g, t, { zoom: 1 }, ART.cenas.mina({}), gg => Z.draw(gg, Z.pose("parado", t, { x: 372, y: 1182, s: 1.62, turn: 0.4, lamp: 1 })), { frame: f }); ART.aberturaOlho(g, 0.35); },
  ];
  L[k]();
}};
