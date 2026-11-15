/* Prancha de poses e expressões do Zeca (3 x 4). */
ART.boards.zeca_poses = { dur: 3, render(g, t, f) {
  g.fillStyle = ART.lg(g, 0, 0, 0, 1920, [[0, "#221C3A"], [1, "#0E0C1A"]]); g.fillRect(0, 0, 1080, 1920);
  const Z = ART.zeca, cw = 360, ch = 470, top = 40;
  const cells = [
    ["parado · 3/4", "parado", { turn: 0.45 }],
    ["de frente", "parado", { turn: 0 }],
    ["andando · perfil", "andando", { turn: 0.95, _t: 0.15 }],
    ["picareta · preparo", "cavando", { turn: 0.85, _t: 0.42 * 0.9, lamp: 1 }],
    ["picareta · impacto", "cavando", { turn: 0.85, _t: 0.67 * 0.9, lamp: 1, _dx: -40 }],
    ["enrolado em bola", "bola", { turn: 0.5 }],
    ["sentado", "sentado", { turn: 0.15 }],
    ["dormindo", "dormindo", { turn: 0.15 }],
    ["comemorando", "comemorando", { turn: 0.3, _t: 0.4 }],
    ["susto", "susto", { turn: 0.25, _t: 0.5 }],
    ["preocupado", "preocupado", { turn: 0.35 }],
    ["cansado · ofegando", "cansado", { turn: 0.4 }],
  ];
  cells.forEach(([nome, pose, ex], i) => {
    const cx = (i % 3) * cw, cy = top + Math.floor(i / 3) * ch;
    g.save(); ART.rr(g, cx + 10, cy + 10, cw - 20, ch - 20, 28); g.fillStyle = "rgba(255,255,255,.04)"; g.fill(); g.clip();
    const p = Object.assign(Z.pose(pose, ex._t ?? t, {}), { x: cx + cw / 2 + (ex._dx || 0), y: cy + ch - 92, s: 1.18, rim: "#B58CFF", rimA: 0.6 }, ex);
    Z.draw(g, p);
    g.restore();
    g.save(); g.font = '900 30px "Nunito"'; g.fillStyle = "#E9E2F6"; g.textAlign = "center"; g.fillText(nome.toUpperCase(), cx + cw / 2, cy + ch - 34); g.restore();
  });
  ART.grain(g, f, 0.05);
}};
