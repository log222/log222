/* C8 — fundo de tudo: silhueta do Coração de Magma pulsando (plano 19). */
ART.boards.g_profundezas = { dur: 3, render(g, t, f) {
  const cam = ART.camera(t, { push: [1.0, 1.05], dur: 3 });
  ART.withLayer(g, cam, 1, gg => ART.coracaoMagma(gg, t, { y: 860, s: 1.05 }));
  ART.post(g, f, {});
}};
