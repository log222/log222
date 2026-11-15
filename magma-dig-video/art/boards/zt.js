ART.boards.zt = { dur: 4, render(g, t) {
  g.fillStyle = ART.lg(g,0,0,0,1920,[[0,"#2A2347"],[1,"#0E0C1A"]]); g.fillRect(0,0,1080,1920);
  const Z = ART.zeca;
  Z.draw(g, Z.pose("parado", t, {x: 300, y: 700, s: 2, turn: 0}));
  Z.draw(g, Z.pose("parado", t, {x: 780, y: 700, s: 2, turn: 0.5}));
  Z.draw(g, Z.pose("cavando", t, {x: 300, y: 1250, s: 2, turn: 1}));
  Z.draw(g, Z.pose("andando", t, {x: 780, y: 1250, s: 2, turn: 0.7, lamp: 1, cone: 1}));
  Z.draw(g, Z.pose("parado", t, {x: 540, y: 1900, s: 3.2, turn: 0.25}));
}};
