/* C5 — painel Habilidades: 7 ramos no nível zero, TEMPO recebendo o primeiro ponto. */
ART.boards.d_habilidades = { dur: 3, render(g, t, f) {
  ART.palco(g, t, { zoom: 1 }, ART.cenas.tocaDesfocada(), null, { frame: f, legenda: false });
  ART.painelHabilidades(g, t, { destaque: 3, pulso: 0.6 + 0.4 * Math.sin(t * 4), niveis: [0, 0, 0, 1, 0, 0, 0] });
  ART.post(g, f, { legenda: false, vinheta: 0.5 });
}};
