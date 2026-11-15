/* Style frame: tratamento do gameplay real (C3) — visor vertical "o que o Zeca vê". */
ART.boards.gameplay = {
  dur: 1.2,
  async setup() { await ART.gameplay.preload(0.5, 1.7); },
  render(g, t, frame) {
    const v = ART.gameplay.visor(g, t, { de: 0.5, ate: 1.7, dur: 1.2, recorte: ART.gameplay.RECORTES.mina, y: 830, largura: 1000, zoom: [1.0, 1.08], foco: [610, 330], retrato: 0, cronometro: { valor: Math.max(0, 10 - t) } });
    ART.post(g, frame, { vinheta: 0.5, legenda: false, grao: 0.05 });
  },
};
