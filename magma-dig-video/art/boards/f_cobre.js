/* C7 — pepita de cobre no holofote com etiqueta e feixe (plano 47). */
ART.boards.f_cobre = { dur: 3, render(g, t, f) {
  ART.holofote(g, t, { cor: "#FFB070", chao: 1180 });
  ART.ui.feixe(g, 540, 1180, t, { cor: "#FF8A3C", w: 110, k: 0.7 });
  ART.obj.pepitaCobre(g, t, { y: 930, r: 140 });
  ART.ui.etiqueta(g, 540, 620, { texto: "COBRE", cor: "#FF9A3C", s: 1.3 });
  ART.ui.contador(g, 540, 470, { valor: "40", icone: "moeda", s: 0.9, prefixo: "vale " });
  ART.post(g, f, {});
}};
