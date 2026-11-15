/* Prancha do Zeca "ator": olhar dirigido, câmera, objetos na pata, costas, luz no rosto, escuro, deitado. */
ART.boards.zeca_ator = { dur: 3, render(g, t, f) {
  g.fillStyle = ART.lg(g, 0, 0, 0, 1920, [[0, "#221C3A"], [1, "#0E0C1A"]]); g.fillRect(0, 0, 1080, 1920);
  const Z = ART.zeca, cw = 360, ch = 470, top = 40;
  const cells = [
    ["olha o alvo ↖", "parado", { turn: 0.5, alvo: [60, 60] }, c => { ART.circ(g, c.x + 40, c.y + 40, 14); g.fillStyle = "#FFD23F"; g.fill(); }],
    ["olha o alvo ↘", "parado", { turn: 0.5, alvo: [340, 470] }, c => { ART.circ(g, c.x + 320, c.y + 420, 14); g.fillStyle = "#FFD23F"; g.fill(); }],
    ["olha p/ câmera", "parado", { turn: 0.8, camera: 1 }],
    ["contando moedas", "contando", { turn: 0.3 }],
    ["segurando pepita", "segurando", { turn: 0.25, banho: { cor: "#FF8A3C", k: 0.8 } }],
    ["apontando", "apontando", { turn: 0.85, alvo: [400, 120] }],
    ["de costas · giz", "riscando", { turn: 0.15 }],
    ["andando · costas", "andando", { turn: 0.1, costas: 1 }],
    ["luz laranja no rosto", "parado", { turn: 0.35, eyes: "espanto", mouth: "o", banho: { cor: "#FF8A3C", k: 1 } }],
    ["no escuro (olhos)", "parado", { turn: 0.2, _esc: true }],
    ["deitado + cobertor", "deitado", { turn: 0.4, _deit: true }],
    ["virando a cabeça", "parado", { turn: 0.7, headTurn: -0.75 }],
  ];
  cells.forEach(([nome, pose, ex, extra], i) => {
    const cx = (i % 3) * cw, cy = top + Math.floor(i / 3) * ch;
    g.save(); ART.rr(g, cx + 10, cy + 10, cw - 20, ch - 20, 28); g.fillStyle = ex._esc ? "#05040A" : "rgba(255,255,255,.04)"; g.fill(); g.clip();
    if (extra) extra({ x: cx, y: cy });
    const base = { x: cx + cw / 2, y: cy + ch - 92, s: 1.18, rim: "#B58CFF", rimA: 0.6 };
    if (ex.alvo) ex = Object.assign({}, ex, { alvo: [cx + ex.alvo[0], cy + ex.alvo[1]] });
    const p = Object.assign(Z.pose(pose, t, {}), base, ex);
    if (ex._esc) Z.drawEscuro(g, p, 1);
    else if (ex._deit) { p.x = cx + 250; p.y = cy + 280; Z.draw(g, p); ART.cobertor(g, cx + 190, cy + 300, 260); }
    else Z.draw(g, p);
    g.restore();
    g.save(); g.font = '900 30px "Nunito"'; g.fillStyle = "#E9E2F6"; g.textAlign = "center"; g.fillText(nome.toUpperCase(), cx + cw / 2, cy + ch - 34); g.restore();
  });
  ART.grain(g, f, 0.05);
}};
