ART.boards.mt = { dur: 4, render(g, t, f) {
  const cena = ART.cenas.mina();
  const cam = ART.camera(t, { push: [1, 1.08], dur: 4 });
  ART.palco(g, t, cam, cena, gg => {
    const b = ART.cubo(gg, 0.15, 2.9, { crack: 2.5, seed: 4, ores: [{ tipo: "prata", u: .7, v: .3, r: .08 }] });
    const A = ART.zeca.draw(gg, ART.zeca.pose("cavando", t, { x: 380, y: 1185, s: 1.6, turn: 0.8, lamp: 1, cone: .6, rim: "#FFC27A" }));
    gg.fillStyle = "red"; if (A.ponta) gg.fillRect(A.ponta.x - 5, A.ponta.y - 5, 10, 10);
  }, { frame: f });
}};
