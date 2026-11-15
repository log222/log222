/* MAGMA DIG — kit de arte: VILA à noite (C1) e TOCA (C4).
 * ART.cenas.vila(o) / ART.cenas.toca(o) -> cena para ART.palco(g, t, cam, cena, atores).
 * Pontos úteis em cena.pos (px no plano d=1): chão do Zeca, centro da placa, etc.
 */
(function () {
  const ART = window.ART, P = ART.pal;
  const { clamp, lerp } = ART;
  const W = 1080, H = 1920;

  // ---------------------------------------------------------------- peças compartilhadas
  /** madeira: retângulo com veios */
  const madeira = (g, x, y, w, h, o = {}) => {
    const c = o.cor || "#7A4E2E";
    ART.rr(g, x, y, w, h, o.r ?? Math.min(w, h) * 0.12);
    g.fillStyle = ART.lg(g, x, y, x + (o.vert ? w : 0), y + (o.vert ? 0 : h), [[0, ART.shade(c, 0.18)], [0.5, c], [1, ART.shade(c, -0.3)]]); g.fill();
    g.save(); ART.rr(g, x, y, w, h, o.r ?? Math.min(w, h) * 0.12); g.clip();
    const r = ART.rng(o.seed || 1); g.strokeStyle = "rgba(40,20,10,.28)"; g.lineWidth = Math.max(1.5, Math.min(w, h) * 0.05);
    for (let i = 0; i < 4; i++) {
      g.beginPath();
      if (o.vert) { const xx = x + w * (0.15 + r() * 0.7); g.moveTo(xx, y); g.bezierCurveTo(xx + (r() - 0.5) * w * 0.3, y + h * 0.3, xx + (r() - 0.5) * w * 0.3, y + h * 0.7, xx, y + h); }
      else { const yy = y + h * (0.15 + r() * 0.7); g.moveTo(x, yy); g.bezierCurveTo(x + w * 0.3, yy + (r() - 0.5) * h * 0.3, x + w * 0.7, yy + (r() - 0.5) * h * 0.3, x + w, yy); }
      g.stroke();
    }
    g.restore();
  };
  ART.madeira = madeira;
  /** pinheiro em blocos (voxel), como as árvores do jogo */
  const pinheiro = (g, x, y, s, cor) => {
    g.fillStyle = ART.shade(cor, -0.2); g.fillRect(x - s * 0.08, y - s * 0.35, s * 0.16, s * 0.35);
    for (let i = 0; i < 4; i++) {
      const w = s * (0.9 - i * 0.2), h = s * 0.3, yy = y - s * 0.3 - i * s * 0.24;
      g.fillStyle = i % 2 ? cor : ART.shade(cor, 0.06); g.fillRect(x - w / 2, yy - h, w, h);
      g.fillStyle = ART.shade(cor, 0.16); g.fillRect(x - w / 2, yy - h, w, h * 0.18);
    }
  };
  ART.pinheiro = pinheiro;
  /** cerca de madeira (postes + 2 travessas) entre x0 e x1 na altura do chão y; s = escala */
  const cerca = (g, x0, x1, y, s = 1, o = {}) => {
    const step = 150 * s, n = Math.max(1, Math.round((x1 - x0) / step));
    const cor = o.cor || "#6B4428";
    for (const k of [0.42, 0.75]) madeira(g, x0 - 10 * s, y - 120 * s * k - 8 * s, x1 - x0 + 20 * s, 18 * s, { cor: ART.shade(cor, -0.05), seed: k * 10 });
    for (let i = 0; i <= n; i++) { const xx = lerp(x0, x1, i / n); madeira(g, xx - 13 * s, y - 128 * s, 26 * s, 128 * s, { cor, vert: true, seed: i, r: 6 * s }); ART.poly(g, [[xx - 13 * s, y - 128 * s], [xx, y - 142 * s], [xx + 13 * s, y - 128 * s]]); g.fillStyle = ART.shade(cor, 0.1); g.fill(); }
  };
  ART.cerca = cerca;
  /** placa de madeira pendurada: (x,y) = ponto de suspensão central. o = {texto, sub, ang (graus), s} */
  ART.placa = (g, x, y, o = {}) => {
    const s = o.s || 1, w = (o.w || 440) * s, h = (o.sub ? 190 : 150) * s, drop = 70 * s;
    g.save(); g.translate(x, y); g.rotate(ART.deg(o.ang || 0));
    // cordas
    g.strokeStyle = "#3A2A1C"; g.lineWidth = 5 * s; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * w * 0.32, 0); g.lineTo(sx * w * 0.36, drop + 8 * s); g.stroke(); }
    g.shadowColor = "rgba(0,0,0,.55)"; g.shadowBlur = 24 * s; g.shadowOffsetY = 12 * s;
    madeira(g, -w / 2, drop, w, h, { cor: "#8A5A34", r: 16 * s, seed: 4 }); g.shadowColor = "transparent";
    // tábuas
    g.strokeStyle = "rgba(40,20,10,.45)"; g.lineWidth = 3 * s; g.beginPath(); g.moveTo(-w / 2 + 8 * s, drop + h / 2); g.lineTo(w / 2 - 8 * s, drop + h / 2); g.stroke();
    for (const sx of [-1, 1]) { ART.circ(g, sx * (w / 2 - 22 * s), drop + 22 * s, 6 * s); g.fillStyle = "#3A3036"; g.fill(); }
    // texto entalhado
    const ty = drop + (o.sub ? h * 0.4 : h * 0.54);
    g.font = `400 ${(o.tam || 86) * s}px "Lilita One"`; g.textAlign = "center"; g.textBaseline = "middle"; g.letterSpacing = 3 * s + "px";
    g.fillStyle = "rgba(30,14,6,.7)"; g.fillText(o.texto || "MAGMA DIG", 0, ty + 4 * s);
    g.fillStyle = ART.lg(g, 0, ty - 40 * s, 0, ty + 40 * s, [[0, "#FFE58A"], [1, "#F2B53A"]]); g.fillText(o.texto || "MAGMA DIG", 0, ty);
    if (o.sub) { g.font = `900 ${40 * s}px "Nunito"`; g.letterSpacing = 2 * s + "px"; g.fillStyle = "#F4E2C4"; g.fillText(o.sub, 0, drop + h * 0.78); }
    g.restore();
  };

  // ================================================================= VILA À NOITE (C1)
  /** o = {placa: 'MAGMA DIG', sub: null|'A · TERRA RASA', lampiao: 0..1, interiorMina: 0..1 (brilho de dentro)} */
  ART.cenas.vila = (o = {}) => {
    const gy = 1180; // linha do chão no plano do Zeca
    const portal = { x: 610, y: gy - 30, w: 380, h: 420 };
    const fundo = [
      // céu + estrelas + lua
      ART.camadaEstatica("vila:ceu", 0.05, gg => {
        gg.fillStyle = ART.lg(gg, 0, -160, 0, 1300, [[0, "#07060F"], [0.45, "#161230"], [0.8, "#2C2452"], [1, "#4A3A72"]]); gg.fillRect(-160, -160, W + 320, H + 320);
        const r = ART.rng(5);
        for (let i = 0; i < 160; i++) { const x = r() * (W + 300) - 150, y = r() * 950 - 100, s = r() < 0.08 ? 3.4 : 1.2 + r() * 1.4; gg.globalAlpha = 0.35 + r() * 0.6; ART.circ(gg, x, y, s); gg.fillStyle = r() < 0.2 ? "#FFE9B8" : "#DCE4FF"; gg.fill(); }
        gg.globalAlpha = 1;
        ART.glow(gg, 860, 330, 420, "#B9A8FF", 0.35, "source-over");
        ART.circ(gg, 860, 330, 92); gg.fillStyle = ART.rg(gg, 830, 300, 10, 100, [[0, "#FFFBEA"], [1, "#E7DCC0"]]); gg.fill();
        for (const [dx, dy, rr] of [[-24, -18, 16], [28, 22, 22], [10, -40, 9], [-30, 34, 11]]) { ART.circ(gg, 860 + dx, 330 + dy, rr); gg.fillStyle = "rgba(170,160,140,.35)"; gg.fill(); }
        // faixas de nuvem
        for (const [y, a] of [[620, 0.18], [740, 0.12]]) { gg.fillStyle = `rgba(120,100,180,${a})`; gg.beginPath(); gg.ellipse(400, y, 900, 50, -0.05, 0, Math.PI * 2); gg.fill(); }
      }),
      // morros distantes com pinheiros
      ART.camadaEstatica("vila:morros", 0.05, gg => {
        gg.fillStyle = "#1E1838";
        gg.beginPath(); gg.moveTo(-160, 900); for (let x = -160; x <= W + 160; x += 40) gg.lineTo(x, 840 - Math.sin(x * 0.006) * 60 - Math.sin(x * 0.017) * 20); gg.lineTo(W + 160, 1300); gg.lineTo(-160, 1300); gg.fill();
        const r = ART.rng(8); for (let i = 0; i < 40; i++) { const x = r() * (W + 320) - 160; pinheiro(gg, x, 860 - Math.sin(x * 0.006) * 60 + 10, 70 + r() * 70, "#241C44"); }
        gg.fillStyle = ART.lg(gg, 0, 760, 0, 1000, [[0, "rgba(90,70,150,0)"], [1, "rgba(90,70,150,.35)"]]); gg.fillRect(-160, 760, W + 320, 300);
      }, { blur: 3, res: 0.6 }),
      // vila (casinhas com janelas acesas) à esquerda
      ART.camadaEstatica("vila:casas", 0.45, gg => {
        gg.fillStyle = "#2A2140"; gg.beginPath(); gg.moveTo(-160, 1000); gg.quadraticCurveTo(250, 880, 640, 1010); gg.lineTo(640, 1300); gg.lineTo(-160, 1300); gg.fill();
        const casas = [[40, 975, 150], [210, 935, 120], [340, 960, 140], [-90, 1000, 130]];
        for (const [x, y, s] of casas) {
          gg.fillStyle = "#3A2E52"; gg.fillRect(x - s / 2, y - s * 0.6, s, s * 0.6);
          ART.poly(gg, [[x - s * 0.62, y - s * 0.58], [x, y - s * 1.05], [x + s * 0.62, y - s * 0.58]]); gg.fillStyle = "#4A2E3E"; gg.fill();
          for (const wx of [-0.22, 0.2]) { gg.fillStyle = "#FFC56A"; gg.fillRect(x + wx * s - s * 0.08, y - s * 0.42, s * 0.16, s * 0.16); ART.glow(gg, x + wx * s, y - s * 0.34, s * 0.5, "#FFB548", 0.5, "source-over"); }
          gg.fillStyle = "#2A2034"; gg.fillRect(x + s * 0.2, y - s * 1.0, s * 0.12, s * 0.25);
        }
        for (let i = 0; i < 12; i++) pinheiro(gg, 470 + i * 60 + (i % 3) * 13, 1010 + (i % 2) * 10, 110 + (i % 4) * 25, "#2E2450");
      }, { blur: 2, res: 0.7, y0: 700, y1: 1350 }),
      // morro da mina + portal de madeira
      ART.camadaEstatica("vila:mina", 0.85, gg => {
        // morro de pedra low-poly
        const pts = [[220, gy + 30], [260, 900], [360, 780], [470, 700], [600, 650], [760, 690], [880, 760], [1000, 820], [1140, 900], [1240, gy + 30]];
        ART.poly(gg, pts); gg.fillStyle = ART.lg(gg, 0, 650, 0, gy, [[0, "#4A4258"], [1, "#2A2334"]]); gg.fill();
        const r = ART.rng(12);
        for (let i = 0; i < pts.length - 2; i++) { ART.poly(gg, [pts[i], pts[i + 1], [600 + (r() - 0.5) * 200, 900 + r() * 150]]); gg.fillStyle = `rgba(${r() > 0.5 ? "255,240,220" : "10,6,20"},${0.04 + r() * 0.08})`; gg.fill(); }
        // aresta iluminada pela lua (direita)
        gg.strokeStyle = "rgba(190,170,255,.35)"; gg.lineWidth = 6; gg.beginPath(); pts.slice(4, 9).forEach((p, i) => (i ? gg.lineTo(...p) : gg.moveTo(...p))); gg.stroke();
        // pinheiros no topo
        for (const [x, y, s] of [[300, 840, 120], [390, 760, 150], [880, 770, 140], [990, 830, 120], [1080, 880, 130]]) pinheiro(gg, x, y, s, "#2B2246");
        // abertura escura
        const { x, y, w, h } = portal;
        gg.beginPath(); gg.moveTo(x - w / 2 + 30, y); gg.lineTo(x - w / 2 + 30, y - h + 60); gg.quadraticCurveTo(x, y - h - 10, x + w / 2 - 30, y - h + 60); gg.lineTo(x + w / 2 - 30, y); gg.closePath();
        gg.fillStyle = ART.lg(gg, 0, y - h, 0, y, [[0, "#0A0710"], [1, "#1A0E10"]]); gg.fill();
        // trilhos saindo
        gg.strokeStyle = "#5A4A48"; gg.lineWidth = 6;
        for (const sx of [-1, 1]) { gg.beginPath(); gg.moveTo(x + sx * 40, y - 30); gg.lineTo(x + sx * 120, gy + 200); gg.stroke(); }
        for (let i = 0; i < 6; i++) { const k = i / 5, yy = lerp(y - 30, gy + 200, k * k); madeira(gg, x - lerp(55, 150, k * k), yy - 6, lerp(110, 300, k * k), lerp(8, 18, k * k), { cor: "#4E3424", seed: i }); }
        // vigas do portal
        madeira(gg, x - w / 2, y - h + 10, 44, h - 10, { cor: "#7A4E2E", vert: true, seed: 1 });
        madeira(gg, x + w / 2 - 44, y - h + 10, 44, h - 10, { cor: "#6E4429", vert: true, seed: 2 });
        madeira(gg, x - w / 2 - 40, y - h - 20, w + 80, 56, { cor: "#8A5A34", seed: 3 });
        madeira(gg, x - w / 2 - 6, y - h + 46, 30, 120, { cor: "#5E3A24", vert: true, seed: 6 });
        // pedras na base
        for (const [px, pr] of [[x - w / 2 - 50, 50], [x + w / 2 + 60, 60], [x + w / 2 + 130, 36]]) ART.rocha(gg, px, y + 10, pr, px);
      }, { blur: 0.8, res: 0.85, y0: 520, y1: 1450 }),
      // chão
      ART.camadaEstatica("vila:chao", 1, gg => {
        gg.fillStyle = ART.lg(gg, 0, gy - 60, 0, H + 160, [[0, "#2E2638"], [0.25, "#221C2C"], [1, "#0C0A12"]]); gg.fillRect(-160, gy - 40, W + 320, H);
        // caminho de terra até a mina
        gg.beginPath(); gg.moveTo(530, gy - 30); gg.lineTo(690, gy - 30); gg.lineTo(980, H + 160); gg.lineTo(160, H + 160); gg.closePath();
        gg.fillStyle = ART.lg(gg, 0, gy, 0, H, [[0, "#4A3C3E"], [1, "#1A1418"]]); gg.fill();
        const r = ART.rng(3);
        for (let i = 0; i < 90; i++) { const x = r() * (W + 200) - 100, y = gy - 20 + Math.pow(r(), 1.6) * 700, s = 6 + (y - gy) * 0.05; gg.fillStyle = `rgba(${r() > 0.5 ? "70,96,70" : "52,70,60"},.8)`; for (let k = 0; k < 4; k++) { gg.beginPath(); gg.moveTo(x + k * s * 0.5, y); gg.lineTo(x + k * s * 0.5 + (k - 1.5) * s * 0.4, y - s * (2 + r())); gg.lineTo(x + k * s * 0.5 + s * 0.3, y); gg.fill(); } }
        cerca(gg, -60, 430, gy + 40, 1.05, { cor: "#6B4428" });
        cerca(gg, 790, 1150, gy + 40, 1.05, { cor: "#6B4428" });
        gg.fillStyle = ART.lg(gg, 0, gy + 160, 0, H, [[0, "rgba(8,6,14,0)"], [1, "rgba(8,6,14,.7)"]]); gg.fillRect(-160, gy + 160, W + 320, H);
      }),
    ];
    const frente = [ART.camadaEstatica("vila:frente", 1.6, gg => {
      const r = ART.rng(9);
      for (const [cx, cy] of [[-20, 1820], [1060, 1700]]) for (let i = 0; i < 26; i++) { const x = cx + (r() - 0.5) * 300, y = cy + r() * 200; gg.fillStyle = "#151A1C"; gg.beginPath(); gg.moveTo(x, y); gg.lineTo(x + (r() - 0.5) * 80, y - 160 - r() * 160); gg.lineTo(x + 26, y); gg.fill(); }
      madeira(gg, 980, 1380, 60, 600, { cor: "#3A2618", vert: true });
    }, { blur: 14, res: 0.5, y0: 1250 })];
    const pos = { chao: gy, portal, placa: [portal.x, portal.y - portal.h - 10] };
    const tomV = [[0, "rgba(40,30,110,.18)"], [1, "rgba(10,6,30,.3)"]];
    // elementos dinâmicos (placa balançando, lampião, brilho de dentro) ficam numa camada d=0.85 desenhada por função
    fundo.push({
      d: 0.85, draw(g, t) {
        const k = o.interiorMina ?? 0.5;
        if (k > 0) ART.glow(g, portal.x, portal.y - 80, 240, "#FF8A3C", 0.35 * k * (0.9 + 0.1 * ART.noise(t * 2, 4)));
        ART.placa(g, pos.placa[0], pos.placa[1] + 6, { texto: o.placa || "MAGMA DIG", sub: o.sub, ang: Math.sin(t * 1.6) * 3.2 + Math.sin(t * 0.7) * 1.2, s: o.sub ? 0.95 : 1 });
        // lampião num poste à direita
        const lx = 905, ly = 905;
        madeira(g, lx - 9, ly - 30, 18, gy - ly + 70, { cor: "#5A3A22", vert: true });
        madeira(g, lx - 9, ly - 30, 70, 14, { cor: "#5A3A22" });
        g.save(); g.translate(lx + 52, ly - 16); g.rotate(Math.sin(t * 1.3) * 0.08);
        g.strokeStyle = "#2A2024"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 26); g.stroke();
        ART.rr(g, -16, 26, 32, 46, 8); g.fillStyle = "#2E2830"; g.fill(); ART.rr(g, -11, 32, 22, 34, 6); g.fillStyle = "#FFD98A"; g.fill();
        const L = (o.lampiao ?? 1) * (0.9 + 0.1 * ART.noise(t * 5, 2));
        ART.glow(g, 0, 50, 230, "#FFB548", 0.55 * L); ART.glow(g, 0, 50, 40, "#FFF2C8", 0.9 * L);
        g.restore();
      },
    });
    const luz = (g, t) => {
      // vaga-lumes
      ART.dust(g, t, { count: 26, seed: 11, color: "#D8FF8A", size: [2.5, 5], speed: 10, alpha: 0.75, x: 0, y: 800, w: W, h: 700 });
    };
    return { fundo, frente, luz, pos, tom: tomV };
  };

  // ================================================================= TOCA (C4)
  /** o = {meta: {texto:'1.000', tracos: 30, riscados: 1, conta: null|'1.000 ÷ 6 = 167', barra: 0..1 (4%), seta: 0..1, prog: 0..1 (giz se desenhando)},
   *       luminaria: 0..1, janela: 0..1 (feixe de lua)} */
  ART.cenas.toca = (o = {}) => {
    const gy = 1250; // chão
    const parede = { x: 500, y: 700, s: 0.8 }; // centro da área de giz
    const tex = ART.texVoronoi("toca", { seed: 33, n: 26, cores: ["#5A4A5E", "#6B5868", "#46384E"], junta: "#2A2030" });
    const fundo = [
      ART.camadaEstatica("toca:parede", 0.8, gg => {
        // parede de pedra arredondada (toca)
        gg.fillStyle = "#1A1424"; gg.fillRect(-160, -160, W + 320, H + 320);
        const q = [[-160, -160], [W + 160, -160], [W + 160, gy + 20], [-160, gy + 20]];
        ART.quadTex(gg, q, tex, { rep: 3.2, tint: "rgba(30,20,40,.25)" });
        // arco da toca escurecendo nas bordas
        gg.fillStyle = ART.rg(gg, 540, 760, 200, 900, [[0, "rgba(14,10,22,0)"], [0.6, "rgba(14,10,22,.35)"], [1, "rgba(14,10,22,.95)"]]); gg.fillRect(-160, -160, W + 320, gy + 180);
        // vigas de madeira do teto
        madeira(gg, -160, 160, W + 320, 60, { cor: "#5A3A26", seed: 9 });
        for (const x of [60, 1020]) madeira(gg, x - 30, 160, 60, gy - 160, { cor: "#4E321F", vert: true, seed: x });
        // janelinha redonda lá em cima (luz da lua)
        ART.circ(gg, 840, 330, 70); gg.fillStyle = "#1C2448"; gg.fill(); ART.circ(gg, 840, 330, 70); gg.lineWidth = 16; gg.strokeStyle = "#6B4428"; gg.stroke();
        gg.strokeStyle = "#6B4428"; gg.lineWidth = 8; gg.beginPath(); gg.moveTo(770, 330); gg.lineTo(910, 330); gg.moveTo(840, 260); gg.lineTo(840, 400); gg.stroke();
        ART.glow(gg, 840, 330, 90, "#9FB4FF", 0.4, "source-over");
        // prateleira com potes à esquerda
        madeira(gg, 90, 500, 230, 22, { cor: "#6B4428" });
        for (const [x, c, h] of [[120, "#8E6FD0", 60], [175, "#E07B39", 46], [230, "#66CB4B", 54], [280, "#FFD23F", 40]]) { ART.rr(gg, x - 18, 500 - h, 36, h, 10); gg.fillStyle = c; gg.globalAlpha = 0.8; gg.fill(); gg.globalAlpha = 1; ART.rr(gg, x - 14, 500 - h, 8, h - 8, 4); gg.fillStyle = "rgba(255,255,255,.25)"; gg.fill(); }
        // calendário de papel pendurado
        gg.save(); gg.translate(150, 640); gg.rotate(-0.06); gg.scale(0.72, 0.72);
        ART.rr(gg, -70, 0, 140, 170, 8); gg.fillStyle = "#EDE3CC"; gg.fill(); gg.fillStyle = "#E63748"; gg.fillRect(-70, 0, 140, 36);
        gg.fillStyle = "#6E6450"; for (let i = 0; i < 30; i++) { const cx = -58 + (i % 6) * 23, cy = 52 + Math.floor(i / 6) * 22; gg.fillRect(cx, cy, 14, 12); }
        gg.restore();
      }),
      // giz na parede (dinâmico)
      { d: 0.8, draw: (g, t) => ART.giz(g, parede.x, parede.y, t, Object.assign({ s: parede.s }, o.meta || {})) },
      // chão de terra batida + tapete
      ART.camadaEstatica("toca:chao", 1, gg => {
        gg.fillStyle = ART.lg(gg, 0, gy - 10, 0, H, [[0, "#3A2A30"], [0.3, "#241A22"], [1, "#0C0810"]]); gg.fillRect(-160, gy - 10, W + 320, H);
        gg.fillStyle = "rgba(0,0,0,.35)"; gg.fillRect(-160, gy - 12, W + 320, 18);
        gg.save(); gg.translate(540, gy + 140); gg.scale(1, 0.24);
        ART.circ(gg, 0, 0, 380); gg.fillStyle = "#4A2E5A"; gg.fill(); ART.circ(gg, 0, 0, 300); gg.lineWidth = 26; gg.strokeStyle = "#C3954F"; gg.stroke(); ART.circ(gg, 0, 0, 180); gg.lineWidth = 18; gg.strokeStyle = "#7A4E8A"; gg.stroke();
        gg.restore();
      }),
      // móveis: cama (direita) e mesa (esquerda)
      ART.camadaEstatica("toca:moveis", 1, gg => {
        // cama
        const bx = 700, by = gy + 10;
        madeira(gg, bx - 10, by - 250, 34, 260, { cor: "#6B4428", vert: true, r: 10 });
        madeira(gg, bx, by - 130, 420, 70, { cor: "#7A4E2E" });
        ART.rr(gg, bx + 20, by - 190, 400, 80, 30); gg.fillStyle = "#E9DCC6"; gg.fill();
        ART.rr(gg, bx + 34, by - 230, 120, 70, 28); gg.fillStyle = "#F4EEDC"; gg.fill(); ART.rr(gg, bx + 34, by - 230, 120, 70, 28); gg.fillStyle = "rgba(160,140,200,.25)"; gg.fill();
        ART.rr(gg, bx + 150, by - 200, 290, 100, 34); gg.fillStyle = ART.lg(gg, 0, by - 200, 0, by - 100, [[0, "#6E4FB0"], [1, "#43307A"]]); gg.fill();
        gg.fillStyle = "#FFD23F"; for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) { gg.save(); gg.translate(bx + 185 + i * 56, by - 172 + j * 40); gg.rotate(0.78); gg.fillRect(-7, -7, 14, 14); gg.restore(); }
        for (const x of [bx + 10, bx + 400]) madeira(gg, x, by - 70, 26, 70, { cor: "#5A3A22", vert: true });
        // mesa
        const tx = 110, ty = gy + 10;
        madeira(gg, tx, ty - 250, 330, 34, { cor: "#8A5A34" });
        for (const x of [tx + 20, tx + 280]) madeira(gg, x, ty - 220, 28, 220, { cor: "#6B4428", vert: true });
        // livro-caixa aberto + moedas
        gg.save(); gg.translate(tx + 200, ty - 262); gg.rotate(-0.05);
        ART.poly(gg, [[-80, 0], [0, -14], [0, 12], [-86, 10]]); gg.fillStyle = "#EDE3CC"; gg.fill();
        ART.poly(gg, [[0, -14], [84, -2], [88, 10], [0, 12]]); gg.fillStyle = "#E2D6BA"; gg.fill();
        gg.fillStyle = "#7A3A2A"; gg.fillRect(-88, 8, 178, 6); gg.restore();
        for (let i = 0; i < 4; i++) { gg.save(); gg.translate(tx + 300, ty - 256 - i * 9); gg.scale(1, 0.4); ART.circ(gg, 0, 0, 24); gg.fillStyle = i === 3 ? "#FFD23F" : "#C88A10"; gg.fill(); gg.restore(); }
        // picareta velha encostada
        gg.save(); gg.translate(470, gy - 20); gg.rotate(0.22); ART.drawPick(gg, "ferro", 150); gg.restore();
      }),
    ];
    const frente = [
      ART.camadaEstatica("toca:frenteTopo", 1.5, gg => {
        gg.strokeStyle = "#2A1A1A"; gg.lineCap = "round"; const r = ART.rng(4);
        for (let i = 0; i < 7; i++) { const x = r() * 260 - 40 + (i > 3 ? 880 : 0); gg.lineWidth = 10 + r() * 14; gg.beginPath(); gg.moveTo(x, -160); gg.bezierCurveTo(x + 40, 100, x - 30, 200, x + 10, 300 + r() * 200); gg.stroke(); }
      }, { blur: 12, res: 0.5, y1: 560 }),
      ART.camadaEstatica("toca:frenteBase", 1.5, gg => { ART.rocha(gg, -60, 1900, 300, 2); ART.rocha(gg, 1140, 1950, 320, 3); }, { blur: 12, res: 0.5, y0: 1500 }),
    ];
    const luz = (g, t) => {
      const L = o.luminaria ?? 1;
      // luminária (vela/lampião) sobre a mesa
      const lx = 215, ly = gy - 330;
      if (L > 0) {
        const f = 0.92 + 0.08 * ART.noise(t * 4, 9);
        const sp = ART.cache("toca:lamp", W / 4, H / 4, gg => { gg.scale(0.25, 0.25); ART.glow(gg, lx, ly, 700, "#FFB548", 0.32); });
        g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = L * f; g.drawImage(sp, 0, 0, W, H); g.restore();
        ART.glow(g, lx, ly, 70, "#FFF2C8", 0.9 * L * f);
      }
      // feixe da janela redonda
      if ((o.janela ?? 1) > 0) { const sp = ART.cache("toca:janela", W / 4, H / 4, gg => { gg.scale(0.25, 0.25); ART.beam(gg, 840, 330, 115, 1300, 120, 420, "#B8C6FF", 0.18); }); g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = o.janela ?? 1; g.drawImage(sp, 0, 0, W, H); g.restore(); }
      ART.dust(g, t, { count: 40, seed: 21, color: "#FFE6C0", size: [1.2, 3.5], alpha: 0.4, y: 300, h: 1000 });
    };
    // lampião em cima da mesa (desenhado no plano dos móveis)
    fundo.push({ d: 1, draw(g) { const lx = 215, ly = 920; ART.rr(g, lx - 22, ly - 10, 44, 64, 10); g.fillStyle = "#3A3036"; g.fill(); ART.rr(g, lx - 15, ly, 30, 44, 8); g.fillStyle = "#FFE0A0"; g.fill(); g.fillStyle = "#2A2024"; g.fillRect(lx - 26, ly + 52, 52, 10); } });
    return { fundo, frente, luz, pos: { chao: gy, parede, cama: [900, gy - 190] }, tom: [[0, "rgba(60,40,120,.18)"], [0.6, "rgba(255,150,70,.05)"], [1, "rgba(20,10,30,.25)"]] };
  };

  // ---------------------------------------------------------------- giz na parede (meta)
  /** escrita de giz (traço com textura): meta = {texto, tracos, riscados, conta, barra, seta, prog, s} */
  ART.giz = (g, x, y, t, m = {}) => {
    const s = m.s || 1, prog = m.prog ?? 1;
    g.save(); g.translate(x, y); g.scale(s, s);
    const chalk = (fn, k) => { if (k <= 0) return; g.save(); g.globalAlpha *= clamp(k); g.strokeStyle = "rgba(244,240,230,.92)"; g.fillStyle = "rgba(244,240,230,.92)"; g.lineCap = "round"; g.lineJoin = "round"; fn(); g.restore(); };
    // título
    chalk(() => { g.font = '400 64px "Lilita One"'; g.textAlign = "center"; g.letterSpacing = "6px"; g.fillText("META", 0, -230); }, prog * 3);
    chalk(() => {
      g.font = '400 230px "Lilita One"'; g.textAlign = "center"; g.textBaseline = "middle";
      g.save(); g.beginPath(); g.rect(-400, -220, 800 * clamp(prog * 2 - 0.2), 260); g.clip();
      g.fillText(m.texto || "1.000", 0, -80);
      g.restore();
    }, prog * 2);
    // 30 tracinhos (3 fileiras de 10)
    const n = m.tracos ?? 30, rr = ART.rng(77);
    for (let i = 0; i < n; i++) {
      const k = clamp(prog * n * 0.6 - i * 0.5 + 6);
      const row = Math.floor(i / 10), col = i % 10, tx = -270 + col * 60 + (rr() - 0.5) * 6, ty = 90 + row * 92;
      chalk(() => { g.lineWidth = 9; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + (rr() - 0.5) * 6, ty + 64 * k); g.stroke(); }, k > 0 ? 1 : 0);
      const rk = clamp((m.riscados ?? 0) - i);
      if (rk > 0) { g.save(); g.strokeStyle = "#FF6B4A"; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(tx - 20, ty + 56); g.lineTo(tx - 20 + 44 * rk, ty + 56 - 52 * rk); g.stroke(); g.restore(); }
    }
    // barra de progresso desenhada
    if (m.barra != null) chalk(() => {
      g.lineWidth = 6; ART.rr(g, -280, 390, 560, 46, 14); g.stroke();
      ART.rr(g, -272, 398, Math.max(8, 544 * clamp(m.barra)), 30, 10); g.fillStyle = "#FFD23F"; g.shadowColor = "#FFD23F"; g.fill();
      g.font = '900 40px "Nunito"'; g.textAlign = "left"; g.fillStyle = "#FFD23F"; g.fillText(Math.round(m.barra * 100) + "%", 300, 426);
    }, 1);
    // conta
    if (m.conta) { const ck = m.contaProg ?? 1; chalk(() => { g.font = '400 70px "Lilita One"'; g.textAlign = "center"; g.save(); g.beginPath(); g.rect(-420, 330, 840 * ck, 120); g.clip(); g.fillText(m.conta, 0, 400); g.restore(); }, 1); }
    // seta desenhada
    if (m.seta) chalk(() => { g.lineWidth = 10; const k = clamp(m.seta); g.beginPath(); g.moveTo(330, 260); g.lineTo(330 + 80 * k, 260 - 160 * k); g.stroke(); if (k > 0.9) { g.beginPath(); g.moveTo(380, 110); g.lineTo(410, 100); g.lineTo(412, 135); g.stroke(); } }, 1);
    g.restore();
  };
})();
