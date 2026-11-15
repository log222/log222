/* C1 — vila à noite, boca da mina com placa MAGMA DIG (planos 4, 11, 26). */
ART.boards.a_vila = { dur: 4, render(g, t, f) {
  const cena = ART.cenas.vila({ placa: "MAGMA DIG" });
  const cam = ART.camera(t, { push: [1.0, 1.05], dur: 4, drift: [60, 0], cy: 1000 });
  ART.palco(g, t, cam, cena, gg => {
    ART.zeca.draw(gg, ART.zeca.pose("parado", t, { x: 560, y: 1300, s: 1.3, turn: 0.25, lamp: 1, rim: "#B8A2FF", rimA: 0.75, look: [0, -0.2] }));
  }, { frame: f });
}};
