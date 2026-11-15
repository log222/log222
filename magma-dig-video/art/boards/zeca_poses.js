/* Prancha de poses e expressões do Zeca (3 x 4). */
ART.boards.zeca_poses = { dur: 3, render(g, t, f) {
  g.fillStyle = ART.lg(g, 0, 0, 0, 1920, [[0, "#221C3A"], [1, "#0E0C1A"]]); g.fillRect(0, 0, 1080, 1920);
  const Z = ART.zeca, cw = 360, ch = 470, top = 40;
  const cells = [
    ["parado · 3/4", "parado", { turn: 0.45 }],
    ["de frente", "parado", { turn: 0, eyes: "aberto", mouth: "sorriso" }],
    ["andando · perfil", "andando", { turn: 0.95 }],
    ["picareta · preparo", "cavando", { turn: 0.85, _t: 0.42 * 0.9 }],
    ["picareta · impacto", "cavando", { turn: 0.85, _t: 0.67 * 0.9 }],
    ["enrolado em bola", "bola", { turn: 0.5 }],
    ["sentado", "sentado", { turn: 0.35 }],
    ["dormindo", "dormindo", { turn: 0.3 }],
    ["comemorando", "comemorando", { turn: 0.3, _t: 0.22 }],
    ["espantado", "espantado", { turn: 0.2, _t: 0.5 }],
    ["preocupado", "preocupado", { turn: 0.35 }],
    ["close · lanterna", "parado", { turn: 0.3, s: 3.2, lamp: 1, eyes: "feliz", mouth: "aberto", _close: true }],
  ];
  cells.forEach(([nome, pose, ex], i) => {
    const cx = (i % 3) * cw, cy = top + Math.floor(i / 3) * ch;
    g.save(); ART.rr(g, cx + 10, cy + 10, cw - 20, ch - 20, 28); g.fillStyle = "rgba(255,255,255,.04)"; g.fill(); g.clip();
    const tt = ex._t ?? t;
    const p = Object.assign(Z.pose(pose, tt, {}), { x: cx + cw / 2, y: cy + ch - 90, s: 1.25, rim: "#B58CFF", rimA: 0.6 }, ex);
    if (ex._close) { p.x = cx + cw / 2 + 20; p.y = cy + ch + 250; p.s = 2.4; p.zzz = 0; }
    if (pose === "cavando") p.lamp = 1;
    Z.draw(g, p);
    g.restore();
    g.save(); g.font = '900 30px "Nunito"'; g.fillStyle = "#E9E2F6"; g.textAlign = "center"; g.fillText(nome.toUpperCase(), cx + cw / 2, cy + ch - 34); g.restore();
  });
  ART.grain(g, f, 0.05);
}};
