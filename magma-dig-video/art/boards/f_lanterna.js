/* C7 — close da lanterna do capacete acendendo (planos 1 e 57). */
ART.boards.f_lanterna = { dur: 2, render(g, t, f) {
  ART.holofote(g, t, { k: 0.4 });
  const on = ART.kf(t, [[0, 0], [0.25, 0], [0.3, 1, "outExpo"], [0.38, 0.4], [0.45, 1]]);
  const cam = ART.camera(t, { push: [1, 1.08], dur: 2 });
  ART.withLayer(g, cam, 1, gg => ART.obj.lanterna(gg, t, { on, y: 800 }));
  ART.post(g, f, {});
}};
