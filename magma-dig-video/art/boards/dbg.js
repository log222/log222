ART.boards.dbg = { dur: 1, render(g, t, f) {
  const cam = ART.enquadrar(540, 990, 2, { sy: 800 }), K = window.__K__ || 0;
  if (K === 0) ART.palco(g, t, cam, ART.cenas.mina({}), gg => ART.zeca.draw(gg, ART.zeca.pose("parado", 0.5, { x: 500, y: 1182, s: 1.62, turn: 0.4, lamp: 1, cone: 0.6, coneAng: 2 })), { frame: 1 });
  const Zp = () => ART.zeca.pose("parado", 0.5, { x: 500, y: 1182, s: 1.62, turn: 0.4, lamp: 1, cone: 0.6, coneAng: 2 });
  if (K === 3) ART.palco(g, t, cam, ART.cenas.mina({}), gg => ART.zeca.draw(gg, Zp()), { frame: 1, post: false });
  if (K === 4) { const c = ART.cenas.mina({}); c.luz = null; ART.palco(g, t, cam, c, gg => ART.zeca.draw(gg, Zp()), { frame: 1, post: false }); }
  if (K === 5) { const c = ART.cenas.mina({}); c.luz = null; c.frente = []; ART.palco(g, t, cam, c, gg => ART.zeca.draw(gg, Zp()), { frame: 1, post: false }); }
  if (K === 6) { const c = ART.cenas.mina({}); c.luz = null; c.frente = []; c.fundo = []; ART.palco(g, t, cam, c, gg => ART.zeca.draw(gg, Zp()), { frame: 1, post: false }); }
  if (K === 1) { g.fillStyle = "#555"; g.fillRect(0, 0, 1080, 1920); ART.withLayer(g, cam, 1, gg => ART.zeca.draw(gg, ART.zeca.pose("parado", 0.5, { x: 500, y: 1182, s: 1.62, turn: 0.4, lamp: 1, cone: 0.6, coneAng: 2 }))); }
  if (K === 2) { g.fillStyle = "#555"; g.fillRect(0, 0, 1080, 1920); ART.withLayer(g, cam, 1, gg => ART.zeca.draw(gg, ART.zeca.pose("parado", 0.5, { x: 500, y: 1182, s: 1.62, turn: 0.4, lamp: 1, cone: 0.6, coneAng: 2, camera: 0.5 }))); }
}};
