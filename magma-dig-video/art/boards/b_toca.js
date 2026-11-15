/* C4 — Toca: parede da meta em giz (1.000, 30 tracinhos, conta), cama, mesa + cartão fixo SALDO × META. */
ART.boards.b_toca = { dur: 4, render(g, t, f) {
  const cena = ART.cenas.toca({ meta: { riscados: 1, conta: null } });
  const cam = ART.camera(t, { push: [1.0, 1.04], dur: 4, drift: [-30, 0], cy: 900 });
  ART.palco(g, t, cam, cena, gg => {
    ART.zeca.draw(gg, ART.zeca.pose("sentado", t, { x: 875, y: 1105, s: 1.15, turn: -0.4, lamp: 0, rim: "#FFB070", look: [-0.6, -0.5], eyes: "preocupado", mouth: "neutro" }));
  }, { frame: f });
  ART.ui.cartaoMeta(g, 540, 365, { saldo: 0, meta: 1000, dia: 1, s: 0.85 });
}};
