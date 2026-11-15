/* C6 — ciência: corte da crosta com o Poço de Kola (12 km, 1970→1989). */
ART.boards.e_kola = { dur: 3, render(g, t, f) {
  ART.ciencia.crosta(g, t, { furo: 1, anos: 1, t12: 0, y0: 470, y1: 1230 });
  ART.post(g, f, { legenda: true, legendaK: 0.25, vinheta: 0.55 });
}};
