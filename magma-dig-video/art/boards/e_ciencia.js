/* C6 — ciência: planeta em corte, risquinho de 12 km contra 6.371 km até o centro. */
ART.boards.e_ciencia = { dur: 3, render(g, t, f) {
  ART.ciencia.planeta(g, t, { seta: 1, nucleo: 0.35, risco12: 1 });
  ART.post(g, f, { legenda: true, legendaK: 0.25, vinheta: 0.55 });
}};
