/* C7 — objetos: picareta velha girando e saquinho vazio (plano 13), contador 0. */
ART.boards.f_objetos = { dur: 3, render(g, t, f) {
  ART.holofote(g, t, {});
  ART.obj.picaretaVelha(g, t, { x: 560, y: 960, giro: 0.5 + t * 0.6 });
  ART.ui.contador(g, 540, 400, { valor: 0, icone: "moeda", s: 1.1 });
  ART.post(g, f, {});
}};
