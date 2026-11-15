/* MAGMA DIG — kit de arte: Zeca (rig 2.5D em recorte).
 *
 * ART.zeca.draw(g, pose) desenha o Zeca e devolve âncoras em px:
 *   {chao, cabeca, lanterna, olhos, mao, maoTras, ponta (ponta da picareta), topo}
 * pose = ART.zeca.pose(nome, t, extras)  -> objeto de pose (números + strings)
 *
 * Unidades do rig: pés em y=0, topo do capacete em y≈-235. s = px por unidade.
 * turn: -1..1 (0 = de frente, 0.5 = 3/4 para a direita, 1 = perfil direita; negativo espelha).
 */
(function () {
  const ART = window.ART, P = ART.pal;
  const { lerp, clamp, kf, ease, deg } = ART;

  // ---------------------------------------------------------------- pose padrão
  const BASE = {
    x: 540, y: 1200, s: 2, turn: 0.45, lean: 0, sq: 1, bob: 0,
    headTilt: 0, headDx: 0, headDy: 0, headTurn: 0,
    // braços: a = ombro (graus; 0 = pendurado, + = para a frente/cima no sentido em que olha), e = cotovelo
    aF: 18, eF: 20, aB: -12, eB: 15,
    // pernas: a = ângulo do quadril (+ = para a frente), lift = levanta o pé (unid.)
    lF: 0, lB: 0, liftF: 0, liftB: 0, legSpread: 1,
    eyes: "aberto", mouth: "sorriso", brows: "nenhum", blush: 1, look: [0.15, 0], blink: 0,
    tool: null, toolMat: "ferro", toolOff: 0, toolHand: "F",
    lamp: 0, cone: 0, coneAng: 8, coneLen: 900,
    rim: "#B58CFF", rimA: 0.55, key: 1, ambient: null, ball: 0, spin: 0, sweat: 0, zzz: 0, t: 0,
    shadow: 1, sit: 0,
    // ator: alvo [x,y] px para olhar, camera 0..1 (olhar para a câmera), segura/seguraB (objeto na pata), bFrente (braço de trás na frente do corpo),
    // costas 0/1 (vista de costas), banho {cor,k} (luz colorida no rosto), blinkSeed
    alvo: null, camera: 0, capacete: 1, segura: null, seguraB: null, bFrente: 0, costas: 0, banho: null, blinkSeed: 0,
  };

  // ---------------------------------------------------------------- utilidades de forma
  function blob(g, path, base, o = {}) {
    const { hi = 0.22, lo = 0.28, rim = null, rimA = 0.5, bx, by, bw, bh, lightX = -0.45, lightY = -0.6 } = o;
    path(); g.fillStyle = base; g.fill();
    g.save(); path(); g.clip();
    const cx = bx + bw / 2, cy = by + bh / 2, R = Math.max(bw, bh);
    // luz principal (cima-esquerda) e sombra de forma (baixo-direita)
    g.fillStyle = ART.rg(g, cx + lightX * bw * 0.5, cy + lightY * bh * 0.5, 0, R * 0.9, [[0, `rgba(255,248,235,${hi})`], [0.55, "rgba(255,248,235,0)"]]);
    g.fillRect(bx - 5, by - 5, bw + 10, bh + 10);
    g.fillStyle = ART.lg(g, cx + lightX * bw * 0.5, cy + lightY * bh * 0.5, cx - lightX * bw * 0.55, cy - lightY * bh * 0.55, [[0.45, "rgba(30,10,40,0)"], [1, `rgba(30,10,40,${lo})`]]);
    g.fillRect(bx - 5, by - 5, bw + 10, bh + 10);
    if (rim) {
      path(); g.lineWidth = Math.max(bw, bh) * 0.16;
      g.strokeStyle = ART.lg(g, cx + lightX * bw * 0.5, cy, cx - lightX * bw * 0.5, cy, [[0, ART.rgba(rim, 0)], [0.62, ART.rgba(rim, 0)], [1, ART.rgba(rim, rimA)]]);
      g.stroke();
    }
    g.restore();
  }
  const ellPath = (g, x, y, rx, ry, rot = 0) => () => ART.ell(g, x, y, rx, ry, rot);

  // ---------------------------------------------------------------- picareta
  function drawPick(g, mat, len = 118) {
    // desenhada com o cabo ao longo de +y local (empunhadura em 0, cabeça em y = -len*0.78)
    const top = -len * 0.8, bot = len * 0.22;
    const wood = ART.lg(g, -5, 0, 5, 0, [[0, "#7A4A2A"], [0.45, "#A8703F"], [1, "#5E3720"]]);
    ART.rr(g, -5, top, 10, bot - top, 5); g.fillStyle = wood; g.fill();
    // faixas do cabo
    g.fillStyle = "rgba(40,20,10,.35)"; [0.15, 0.55].forEach(k => g.fillRect(-5, top + (bot - top) * k, 10, 4));
    // cabeça curva com duas pontas
    const metal = mat === "esmeralda" ? ["#2FAE6A", "#7DF0A8", "#17643E"] : mat === "ouro" ? ["#E8B42C", "#FFF0A0", "#9A6A10"] : ["#8E93A3", "#E6EAF2", "#4E5262"];
    g.save(); g.translate(0, top + 6);
    g.beginPath();
    g.moveTo(-52, 16); g.quadraticCurveTo(-30, -14, 0, -14); g.quadraticCurveTo(30, -14, 54, 12);
    g.lineTo(46, 15); g.quadraticCurveTo(26, -1, 0, 2); g.quadraticCurveTo(-24, 0, -44, 20); g.closePath();
    g.fillStyle = ART.lg(g, 0, -14, 0, 18, [[0, metal[1]], [0.45, metal[0]], [1, metal[2]]]); g.fill();
    // olho do cabo
    ART.rr(g, -9, -16, 18, 22, 5); g.fillStyle = metal[2]; g.fill();
    ART.rr(g, -7, -14, 14, 8, 4); g.fillStyle = ART.rgba(metal[1], 0.6); g.fill();
    g.restore();
    return { tip: [52, top + 20], tipB: [-50, top + 24] };
  }
  ART.drawPick = drawPick;

  // ---------------------------------------------------------------- olhos / boca
  function eye(g, x, y, f, k, eyes, look, blink, side, P2, banho) {
    // f = encurtamento (0..1); k = escala
    const rx = 12.5 * k * Math.max(0.3, f), ry = 14.5 * k;
    const lid = clamp(blink);
    g.save();
    if (eyes === "feliz") {
      g.lineCap = "round"; g.lineWidth = 5.2 * k; g.strokeStyle = P.olho;
      g.beginPath(); g.moveTo(x - rx, y + 3 * k); g.quadraticCurveTo(x, y - 13 * k, x + rx, y + 3 * k); g.stroke();
    } else if (eyes === "fechado") {
      g.lineCap = "round"; g.lineWidth = 4.6 * k; g.strokeStyle = P.olho;
      g.beginPath(); g.moveTo(x - rx, y); g.quadraticCurveTo(x, y + 8 * k, x + rx, y); g.stroke();
      // cílios
      g.lineWidth = 3 * k; g.beginPath(); g.moveTo(x + rx * 0.9 * side, y + 1 * k); g.lineTo(x + rx * 1.25 * side, y - 3 * k); g.stroke();
    } else if (eyes === "espanto") {
      ART.ell(g, x, y, rx * 1.18, ry * 1.18); g.fillStyle = "#FFF9EE"; g.fill();
      g.lineWidth = 2.2 * k; g.strokeStyle = "rgba(60,30,40,.35)"; g.stroke();
      ART.ell(g, x + look[0] * 3 * k * f, y + look[1] * 3 * k, 5.4 * k * Math.max(0.4, f), 6 * k); g.fillStyle = P.olho; g.fill();
      ART.circ(g, x + 1.5 * k + look[0] * 3 * k, y - 2 * k, 1.8 * k); g.fillStyle = "#fff"; g.fill();
    } else {
      // olho grande escuro com brilho (aberto / preocupado / determinado / meio)
      const lx = look[0] * 2.6 * k, ly = look[1] * 2.6 * k;
      ART.ell(g, x, y, rx, ry); g.fillStyle = ART.rg(g, x - rx * 0.2, y - ry * 0.3, 0, ry * 1.2, [[0, "#3B2C3E"], [1, P.olho]]); g.fill();
      ART.ell(g, x + lx * f, y + ly + 2 * k, rx * 0.62, ry * 0.6); g.fillStyle = "rgba(120,90,160,.22)"; g.fill();
      ART.circ(g, x + (4.2 * k + lx) * f, y - 5.2 * k + ly, 4.6 * k); g.fillStyle = "#fff"; g.fill();
      ART.circ(g, x + (-4 * k + lx) * f, y + 5 * k + ly, 2 * k); g.fillStyle = "rgba(255,255,255,.85)"; g.fill();
      if (banho && banho.k > 0) { ART.circ(g, x + (5 * k + lx) * f, y + 4 * k + ly, 3.4 * k); g.fillStyle = ART.rgba(banho.cor || "#FF8A3C", 0.9 * banho.k); g.fill(); }
      // pálpebra (meio / piscada / preocupado / determinado)
      let top = lid;
      if (eyes === "meio") top = Math.max(top, 0.48);
      if (top > 0.02 || eyes === "preocupado" || eyes === "determinado") {
        g.save(); ART.ell(g, x, y, rx + 1, ry + 1); g.clip();
        g.fillStyle = P2;
        g.beginPath();
        const yl = y - ry - 2 + (ry * 2 + 4) * top;
        let tiltIn = 0;
        if (eyes === "preocupado") tiltIn = -0.28; // canto interno sobe
        if (eyes === "determinado") tiltIn = 0.42; // canto interno desce
        // side: +1 olho do lado direito da tela
        const inner = -side, dy = tiltIn * ry;
        g.moveTo(x - rx - 3, y - ry - 6);
        g.lineTo(x + rx + 3, y - ry - 6);
        g.lineTo(x + rx + 3, yl + (inner > 0 ? dy : -dy * 0.3));
        g.lineTo(x - rx - 3, yl + (inner < 0 ? dy : -dy * 0.3));
        g.closePath(); g.fill();
        g.restore();
      }
    }
    g.restore();
  }

  function mouth(g, x, y, k, type, f) {
    g.save(); g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "#5A2E25"; g.lineWidth = 3.4 * k;
    const w = 9 * k * Math.max(0.5, f);
    switch (type) {
      case "neutro": g.beginPath(); g.moveTo(x - w * 0.6, y); g.quadraticCurveTo(x, y + 2 * k, x + w * 0.6, y); g.stroke(); break;
      case "sorriso": g.beginPath(); g.moveTo(x - w, y - 1 * k); g.quadraticCurveTo(x - w * 0.5, y + 5 * k, x, y + 1 * k); g.quadraticCurveTo(x + w * 0.5, y + 5 * k, x + w, y - 1 * k); g.stroke(); break;
      case "triste": g.beginPath(); g.moveTo(x - w * 0.8, y + 4 * k); g.quadraticCurveTo(x, y - 3 * k, x + w * 0.8, y + 4 * k); g.stroke(); break;
      case "o": ART.ell(g, x, y + 3 * k, 4.6 * k * Math.max(0.6, f), 5.6 * k); g.fillStyle = "#4A1E1C"; g.fill(); break;
      case "grito": {
        ART.ell(g, x, y + 6 * k, 8 * k * Math.max(0.6, f), 10 * k); g.fillStyle = "#4A1E1C"; g.fill();
        g.save(); g.clip(); ART.ell(g, x, y + 14 * k, 6 * k, 5 * k); g.fillStyle = "#E86A72"; g.fill(); g.restore(); break;
      }
      case "aberto": {
        g.beginPath(); g.moveTo(x - w * 1.15, y); g.quadraticCurveTo(x, y + 2 * k, x + w * 1.15, y); g.quadraticCurveTo(x, y + 18 * k, x - w * 1.15, y); g.closePath();
        g.fillStyle = "#4A1E1C"; g.fill(); g.save(); g.clip(); ART.ell(g, x, y + 13 * k, w * 0.8, 6 * k); g.fillStyle = "#E86A72"; g.fill(); g.restore(); break;
      }
      case "esforco": {
        ART.rr(g, x - w * 1.1, y - 1 * k, w * 2.2, 7 * k, 3 * k); g.fillStyle = "#4A1E1C"; g.fill();
        g.fillStyle = "#FFF6E8"; g.fillRect(x - w * 0.95, y + 0.2 * k, w * 1.9, 2.4 * k); break;
      }
      case "dormindo": ART.ell(g, x, y + 2 * k, 3 * k, 3.6 * k); g.fillStyle = "#4A1E1C"; g.fill(); break;
      default: break;
    }
    g.restore();
  }

  // ---------------------------------------------------------------- bola (enrolado)
  function drawBall(g, p, A) {
    const R = 74, cy = -R;
    // sombra própria
    blob(g, ellPath(g, 0, cy, R, R), P.casco, { bx: -R, by: cy - R, bw: 2 * R, bh: 2 * R, rim: p.rim, rimA: p.rimA, hi: 0.3, lo: 0.4 });
    g.save(); ART.circ(g, 0, cy, R); g.clip();
    // faixas giram com spin: linhas de "longitude" vistas de lado
    for (let i = 0; i < 9; i++) {
      const a = (p.spin + i * 40) % 360, c = Math.cos(deg(a));
      if (c < -0.05) continue;
      const xx = Math.sin(deg(a)) * R;
      g.beginPath(); g.ellipse(xx * 0.98, cy, Math.max(2, Math.abs(c) * 16), R * 1.02, 0, 0, Math.PI * 2);
      g.lineWidth = 7; g.strokeStyle = ART.rgba(P.cascoEsc, 0.55 * c + 0.15); g.stroke();
    }
    // capacete aparece como calota que gira
    const ha = deg(p.spin - 30), hx = Math.sin(ha) * R * 0.62, hy = cy - Math.cos(ha) * R * 0.62;
    if (Math.cos(ha) > -0.2) {
      g.save(); g.translate(hx, hy); g.rotate(ha);
      ART.ell(g, 0, 0, 52, 30); g.fillStyle = P.capacete; g.fill();
      ART.ell(g, 0, 8, 58, 12); g.fillStyle = P.capaceteEsc; g.fill();
      ART.ell(g, 0, -4, 50, 24); g.fillStyle = P.capacete; g.fill();
      ART.circ(g, 0, -10, 11); g.fillStyle = "#9A98A6"; g.fill(); ART.circ(g, 0, -10, 8); g.fillStyle = "#FFFBEA"; g.fill();
      A.lanterna = g.getTransform().transformPoint(new DOMPoint(0, -10));
      g.restore();
    }
    g.restore();
    // brilho especular
    ART.ell(g, -R * 0.38, cy - R * 0.45, R * 0.28, R * 0.16, -0.6); g.fillStyle = "rgba(255,240,220,.25)"; g.fill();
    A.cabeca = g.getTransform().transformPoint(new DOMPoint(0, cy));
    A.topo = g.getTransform().transformPoint(new DOMPoint(0, cy - R));
  }

  // ---------------------------------------------------------------- desenho principal
  function draw(g, pose = {}) {
    const p = Object.assign({}, BASE, pose);
    const A = {};
    if (pose.blink === undefined && /aberto|preocupado|determinado|espanto/.test(p.eyes)) p.blink = blinkAt(p.t + p.blinkSeed);
    if (p.alvo) {
      const fl0 = p.turn < 0 ? -1 : 1, hx0 = p.x + fl0 * 8 * p.s, hy0 = p.y - (150 + p.bob) * p.s;
      const dx = (p.alvo[0] - hx0) * fl0, dy = p.alvo[1] - hy0;
      p.look = [clamp(dx / 260, -1, 1), clamp(dy / 260, -1, 1)];
      if (pose.headTurn === undefined) p.headTurn = clamp(dx / 1400, -0.3, 0.25) - (dx < 0 ? Math.abs(p.turn) * clamp(-dx / 500, 0, 1) * 0.8 : 0);
      if (pose.headTilt === undefined) p.headTilt = (p.headTilt || 0) + clamp(dy / 40, -9, 9);
    }
    if (p.camera > 0) { const tt0 = Math.abs(p.turn); p.headTurn = lerp(p.headTurn, -tt0 * 0.9, p.camera); p.look = [lerp(p.look[0], 0, p.camera), lerp(p.look[1], 0, p.camera)]; }
    const costas = p.costas > 0.5;
    const flip = p.turn < 0 ? -1 : 1;
    const tt = Math.abs(p.turn), th = tt * Math.PI / 2, sT = Math.sin(th), cT = Math.cos(th);
    g.save();
    g.translate(p.x, p.y);
    A.chao = g.getTransform().transformPoint(new DOMPoint(0, 0));
    g.scale(p.s * flip, p.s);

    // sombra no chão
    if (p.shadow) {
      g.save(); g.globalAlpha = p.shadow;
      const sw = (p.ball ? 70 : 74) * (1 + 0.3 * p.sit) / Math.max(0.7, 1 - p.bob / 120);
      g.fillStyle = ART.rg(g, 0, 0, 0, sw, [[0, "rgba(8,4,16,.55)"], [0.6, "rgba(8,4,16,.25)"], [1, "rgba(8,4,16,0)"]]);
      g.save(); g.scale(1, 0.2); g.fillRect(-sw, -sw, sw * 2, sw * 2); g.restore();
      g.restore();
    }

    g.rotate(deg(p.lean));
    g.scale(p.sq, 1 / p.sq);
    g.translate(0, -p.bob);

    if (p.ball > 0.5) { drawBall(g, p, A); g.restore(); return A; }

    const darkF = c => ART.shade(c, -0.16);
    const BY = -86 + p.sit * 16, BRX = 64 + p.sit * 4, BRY = 57 - p.sit * 4; // corpo
    const hipY = BY + 44;

    // ----- cauda (atrás)
    if (sT > 0.15) {
      g.save(); g.translate(-sT * 50, BY + 40); g.rotate(deg(24 + Math.sin(p.t * 2.2) * 4));
      const tl = 30 * sT + 6;
      g.beginPath(); g.moveTo(4, -12); g.quadraticCurveTo(-tl * 0.55, -9, -tl, 4); g.quadraticCurveTo(-tl - 4, 9, -tl + 4, 9); g.quadraticCurveTo(-tl * 0.5, 9, 4, 12); g.closePath();
      g.fillStyle = darkF(P.casco); g.fill();
      g.strokeStyle = ART.rgba(P.cascoEsc, 0.8); g.lineWidth = 2.6;
      for (let i = 1; i < 4; i++) { const xx = -tl * i / 4.2; g.beginPath(); g.moveTo(xx + 1, -10 + i * 3.2); g.quadraticCurveTo(xx - 2, 0, xx + 1, 10 - i * 0.8); g.stroke(); }
      g.restore();
    }
    // ----- pernas (mais longas e legíveis; sentado: sola do pé virada para a câmera)
    const leg = (side, a, lift, near) => {
      const lat = side * 23 * cT * p.legSpread, hx = lat + sT * 2;
      const len = 36, ax = deg(a);
      const fx = hx + Math.sin(ax) * len * (0.35 + 0.65 * sT), fy = hipY + Math.cos(ax) * len - lift;
      const col = near ? P.pele : darkF(P.pele);
      ART.capsule(g, hx, hipY - 14, fx, fy - 8, 15); g.fillStyle = col; g.fill();
      ART.capsule(g, hx - 5, hipY - 12, fx - 5, fy - 9, 5); g.fillStyle = "rgba(255,240,220,.18)"; g.fill();
      if (p.sit > 0.5 && cT > 0.45) {
        // sola do pé para a câmera: almofada rosa + dedinhos
        ART.ell(g, fx, fy - 4, 17, 19); g.fillStyle = near ? ART.shade(P.pele, 0.05) : darkF(P.pele); g.fill();
        ART.ell(g, fx, fy, 9, 8); g.fillStyle = ART.rgba(P.bochecha, 0.85); g.fill();
        for (let i = -1; i <= 1; i++) { ART.circ(g, fx + i * 7, fy - 14, 3.6); g.fillStyle = ART.rgba(P.bochecha, 0.85); g.fill(); }
        return [fx, fy];
      }
      const fl = 16 + 8 * sT;
      ART.ell(g, fx + sT * 8, fy - 5, fl, 10.5, deg(a * 0.25 * sT));
      g.fillStyle = near ? ART.shade(P.pele, -0.04) : darkF(P.peleEsc); g.fill();
      ART.ell(g, fx + sT * 8, fy - 1, fl * 0.9, 4); g.fillStyle = "rgba(60,30,30,.22)"; g.fill();
      // garrinhas na ponta do pé
      if (sT > 0.25) { g.fillStyle = near ? "rgba(80,45,35,.7)" : "rgba(60,35,30,.6)"; for (let i = 0; i < 3; i++) { ART.ell(g, fx + sT * 8 + fl * 0.92, fy - 9 + i * 3.6, 3.2, 1.6, 0.2); g.fill(); } }
      else { g.fillStyle = "rgba(80,45,35,.6)"; for (let i = -1; i <= 1; i++) { ART.ell(g, fx + i * 6, fy + 3, 1.8, 3); g.fill(); } }
      return [fx, fy];
    };
    const nearSide = 1; // lado +1 (direita da tela quando turn>0) está mais perto
    const sitting = p.sit > 0.5;
    if (!sitting) { leg(-nearSide, p.lB, p.liftB, false); leg(nearSide, p.lF, p.liftF, true); }

    // ----- braços (função), ombros na lateral do corpo
    const shY = BY - 22;
    const armPts = (side, a, e) => {
      const sx = side > 0 ? (BRX - 8) * cT + sT * 18 : -(BRX - 2) * cT - sT * 10, sy = shY + (1 - cT) * 4;
      const a1 = deg(a), a2 = deg(a + e);
      const ex = sx + Math.sin(a1) * 22, ey = sy + Math.cos(a1) * 22;
      const hx = ex + Math.sin(a2) * 21, hy = ey + Math.cos(a2) * 21;
      return { sx, sy, ex, ey, hx, hy, a2 };
    };
    const drawArm = (q, near) => {
      const col = near ? P.pele : darkF(P.pele);
      ART.capsule(g, q.sx, q.sy, q.ex, q.ey, 10.5); g.fillStyle = col; g.fill();
      ART.capsule(g, q.ex, q.ey, q.hx, q.hy, 9.5); g.fill();
      // pata
      ART.circ(g, q.hx, q.hy, 11.5); g.fillStyle = near ? ART.shade(P.pele, 0.06) : darkF(P.pele); g.fill();
      if (near) {
        g.fillStyle = "rgba(70,40,30,.55)";
        for (let i = -1; i <= 1; i++) { const an = q.a2 + i * 0.5; ART.ell(g, q.hx + Math.sin(an) * 10, q.hy + Math.cos(an) * 10, 2.2, 3.2, -an); g.fill(); }
      }
    };
    const armF = armPts(nearSide, p.aF, p.eF), armB = armPts(-nearSide, p.aB, p.eB);
    const bFront = p.bFrente > 0.5 || costas;
    if (!bFront) drawArm(armB, false);
    A.maoTras = g.getTransform().transformPoint(new DOMPoint(armB.hx, armB.hy));

    // ----- corpo (casco)
    const bodyPath = ellPath(g, 0, BY, BRX, BRY);
    blob(g, bodyPath, P.casco, { bx: -BRX, by: BY - BRY, bw: BRX * 2, bh: BRY * 2, rim: p.rim, rimA: p.rimA, hi: 0.26, lo: 0.36 });
    g.save(); bodyPath(); g.clip();
    // faixas da carapaça (latitudes curvas): placas alternadas claras/escuras
    for (let i = 0; i < 6; i++) {
      const yy = BY - 46 + i * 17;
      const band = () => { g.beginPath(); g.moveTo(-BRX - 6, yy - 10); g.quadraticCurveTo(-sT * 24, yy + 12, BRX + 6, yy - 10); g.lineTo(BRX + 6, yy + 1); g.quadraticCurveTo(-sT * 24, yy + 23, -BRX - 6, yy + 1); g.closePath(); };
      band(); g.fillStyle = ART.rgba(i % 2 ? P.cascoClaro : P.faixa, i % 2 ? 0.28 : 0.42); g.fill();
      g.beginPath(); g.moveTo(-BRX - 6, yy + 1); g.quadraticCurveTo(-sT * 24, yy + 23, BRX + 6, yy + 1);
      g.lineWidth = 3.2; g.strokeStyle = ART.rgba(P.cascoEsc, 0.7); g.stroke();
      // pontinhos da textura do casco
      g.fillStyle = ART.rgba(P.cascoEsc, 0.35);
      for (let j = -3; j <= 3; j++) { const xx = j * 19 + (i % 2) * 9 - sT * 12, yv = yy + 6 + 7 * (1 - (xx / BRX) * (xx / BRX)); ART.ell(g, xx, yv, 3.4, 2.2); g.fill(); }
    }
    // barriga (pele clara) só na frente, estreita
    if (!costas) {
    const bx = sT * 40, brx = 27 * (0.5 + 0.5 * cT) + 7, bry = 40;
    ART.ell(g, bx + 1, BY + 16, brx + 6, bry + 5); g.fillStyle = ART.rgba(P.cascoEsc, 0.9); g.fill();
    blob(g, ellPath(g, bx, BY + 16, brx, bry), P.rosto, { bx: bx - brx, by: BY + 16 - bry, bw: brx * 2, bh: bry * 2, hi: 0.28, lo: 0.25 });
    g.strokeStyle = ART.rgba(P.peleEsc, 0.35); g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(bx - brx * 0.6, BY + 4 + i * 16); g.quadraticCurveTo(bx, BY + 9 + i * 16, bx + brx * 0.6, BY + 4 + i * 16); g.stroke(); }
    }
    // sombra da cabeça sobre o corpo
    { const hx0 = sT * 10 + p.headDx, hy0 = BY - BRY + 16 + p.headDy; g.save(); g.translate(hx0, hy0); g.scale(1, 0.32); g.fillStyle = ART.rg(g, 0, 0, 0, 72, [[0, "rgba(40,15,30,.48)"], [0.6, "rgba(40,15,30,.25)"], [1, "rgba(40,15,30,0)"]]); g.fillRect(-72, -72, 144, 144); g.restore(); }
    g.restore();

    if (sitting) { leg(-nearSide, p.lB, p.liftB, false); leg(nearSide, p.lF, p.liftF, true); }
    if (costas) {
      g.save(); g.translate(sT * 10, BY + 46); g.rotate(deg(Math.sin(p.t * 2.2) * 6));
      g.beginPath(); g.moveTo(-12, -8); g.quadraticCurveTo(-8, 22, 0, 34); g.quadraticCurveTo(8, 22, 12, -8); g.closePath(); g.fillStyle = darkF(P.casco); g.fill();
      g.strokeStyle = ART.rgba(P.cascoEsc, 0.8); g.lineWidth = 2.4; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-10 + i * 1.5, -4 + i * 9); g.quadraticCurveTo(0, i * 9, 10 - i * 1.5, -4 + i * 9); g.stroke(); }
      g.restore();
    }
    if (bFront) drawArm(armB, !costas ? false : true);
    // ----- ferramenta atrás do braço da frente
    let toolInfo = null;
    const drawTool = () => {
      if (!p.tool) return;
      const q = p.toolHand === "B" ? armB : armF;
      g.save(); g.translate(q.hx, q.hy); g.rotate(-q.a2 + Math.PI + deg(p.toolOff));
      const r = drawPick(g, p.toolMat);
      toolInfo = { tip: g.getTransform().transformPoint(new DOMPoint(r.tip[0], r.tip[1])), tipB: g.getTransform().transformPoint(new DOMPoint(r.tipB[0], r.tipB[1])) };
      g.restore();
    };

    // ----- cabeça
    const HX = sT * 8 + p.headDx, HY = BY - BRY - 12 + p.headDy + 6;
    const th2 = clamp(th + deg(p.headTurn * 90), -0.2, Math.PI / 2), s2 = Math.sin(th2), c2 = Math.cos(th2);
    g.save(); g.translate(HX, HY + 40); g.rotate(deg(p.headTilt)); g.translate(-HX, -HY - 40);
    const HRX = 62, HRY = 52;
    const faceCol = P.rosto, skinShade = ART.shade(P.rosto, -0.08);
    // orelhas (saem por baixo da aba do capacete)
    const ear = (side) => {
      const ph = side * 1.2 + th2 * 0.8, vis = Math.cos(ph);
      if (vis < -0.5) return;
      const ex = HX + Math.sin(ph) * HRX * 1.0, ey = HY - 22;
      g.save(); g.translate(ex, ey); g.rotate(side * 0.95 + s2 * 0.25);
      const w = 13 * (0.55 + 0.45 * Math.abs(Math.sin(ph)));
      ART.ell(g, 0, -6, w, 19); g.fillStyle = skinShade; g.fill();
      ART.ell(g, 0, -4, w * 0.55, 12); g.fillStyle = P.bochecha; g.fill();
      g.restore();
    };
    ear(-1); ear(1);
    // crânio/rosto
    const headPath = ellPath(g, HX, HY, HRX, HRY);
    blob(g, headPath, faceCol, { bx: HX - HRX, by: HY - HRY, bw: HRX * 2, bh: HRY * 2, rim: p.rim, rimA: p.rimA * 0.28, hi: 0.3, lo: 0.3 });
    // bochechas
    const thF = th2 * 0.72;
    const eyesPos = [];
    let mx = HX, my = HY + 22;
    if (!costas) {
    const feat = (phi) => ({ x: HX + Math.sin(phi + thF) * HRX * 0.9, f: Math.cos(phi + thF) });
    g.save(); headPath(); g.clip();
    for (const side of [-1, 1]) {
      const q = feat(side * 0.78); if (q.f < 0.05) continue;
      g.globalAlpha = 0.75 * p.blush * clamp(q.f * 1.6);
      ART.ell(g, q.x + side * 3, HY + 16, 12 * Math.max(0.4, q.f), 7.5); g.fillStyle = P.bochecha; g.fill();
    }
    g.globalAlpha = 1;
    g.restore();
    // focinho (projeta para a frente quando vira)
    mx = HX + Math.sin(th2 * 0.85) * HRX * (0.66 + 0.12 * s2);
    const mrx = 25 + 4 * s2, mry = 19;
    blob(g, ellPath(g, mx, my, mrx, mry), P.focinho, { bx: mx - mrx, by: my - mry, bw: mrx * 2, bh: mry * 2, hi: 0.35, lo: 0.22 });
    // nariz
    const nx = mx + s2 * 17, ny = my - 6;
    ART.ell(g, nx, ny, 10.5 * (0.75 + 0.25 * c2), 7.8); g.fillStyle = ART.rg(g, nx - 3, ny - 3, 0, 12, [[0, "#6B4232"], [1, P.nariz]]); g.fill();
    ART.ell(g, nx - 3 + s2 * 2, ny - 3, 3.2, 2); g.fillStyle = "rgba(255,255,255,.55)"; g.fill();
    // boca
    mouth(g, mx + s2 * 12, my + 6, 1, p.mouth, 0.6 + 0.4 * c2);
    // olhos
    const eyeK = p.eyes === "espanto" ? 1.05 : 1;
    for (const side of [-1, 1]) {
      const q = feat(side * 0.42);
      if (q.f < 0.18) continue;
      const ex = q.x - s2 * 7, ey = HY - 5 - s2 * 4;
      eyesPos.push([ex, ey]);
      eye(g, ex, ey, clamp(q.f * 1.15, 0, 1), eyeK, p.eyes, p.look, p.blink, side, faceCol, p.banho);
      // sobrancelhas
      if (p.brows !== "nenhum") {
        const tilt = { preocupado: 0.42, bravo: -0.45, surpreso: 0.0, triste: 0.35 }[p.brows] || 0;
        const by = ey - (p.brows === "surpreso" ? 23 : 18);
        g.save(); g.translate(ex, by); g.rotate(side * tilt);
        g.lineCap = "round"; g.lineWidth = 4.6; g.strokeStyle = ART.shade(P.cascoEsc, -0.1);
        const bw2 = 9 * Math.max(0.4, q.f);
        g.beginPath(); g.moveTo(-bw2, 0); g.quadraticCurveTo(0, -3, bw2, 0); g.stroke(); g.restore();
      }
    }
    }
    // luz colorida batendo no rosto (ex.: brilho laranja do cobre)
    if (p.banho && p.banho.k > 0) {
      g.save(); headPath(); g.clip(); g.globalCompositeOperation = "lighter";
      g.fillStyle = ART.rg(g, HX + 50, HY + 40, 0, 130, [[0, ART.rgba(p.banho.cor || "#FF8A3C", 0.55 * p.banho.k)], [1, ART.rgba(p.banho.cor || "#FF8A3C", 0)]]);
      g.fillRect(HX - 80, HY - 70, 160, 140); g.restore();
    }
    A.olhos = eyesPos.map(([x, y]) => g.getTransform().transformPoint(new DOMPoint(x, y)));

    // capacete
    const brimY = HY - 34, domeCx = HX + s2 * 5;
    if (p.capacete) {
    // aba (elipse larga), parte de trás mais escura
    const brx2 = 80 + s2 * 4, bry2 = 13;
    ART.ell(g, domeCx + s2 * 9, brimY, brx2, bry2); g.fillStyle = ART.lg(g, 0, brimY - bry2, 0, brimY + bry2, [[0, P.capaceteEsc], [1, P.capaceteSombra]]); g.fill();
    ART.ell(g, domeCx + s2 * 9, brimY - 3, brx2 - 3, bry2 - 4); g.fillStyle = ART.rgba(P.capacete, 0.55); g.fill();
    // cúpula
    const drx = 66, dry = 56;
    const domePath = () => { g.beginPath(); g.ellipse(domeCx, brimY - 2, drx, dry, 0, Math.PI, 0); g.closePath(); };
    blob(g, domePath, P.capacete, { bx: domeCx - drx, by: brimY - 2 - dry, bw: drx * 2, bh: dry, hi: 0.42, lo: 0.32 });
    g.save(); domePath(); g.clip();
    // borda iluminada (só no arco)
    g.beginPath(); g.ellipse(domeCx, brimY - 2, drx, dry, 0, Math.PI * 1.55, Math.PI * 2);
    g.lineWidth = 9; g.strokeStyle = ART.rgba(p.rim, p.rimA * 0.5); g.stroke();
    // nervura central: meridiano que gira com a cabeça
    const meridian = (alpha, w, col) => {
      if (Math.cos(alpha) < 0) return;
      g.beginPath();
      for (let i = 0; i <= 16; i++) { const ph = (i / 16) * Math.PI / 2; const xx = domeCx + drx * Math.sin(alpha) * Math.cos(ph), yy = brimY - 2 - dry * Math.sin(ph); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
      g.lineWidth = w; g.strokeStyle = col; g.stroke();
    };
    meridian(th2 * 0.95, 13, ART.rgba(P.capaceteEsc, 0.55));
    meridian(th2 * 0.95 - 0.06, 5, "rgba(255,248,200,.55)");
    // reflexo especular
    ART.ell(g, domeCx - 26, brimY - 38, 20, 9, -0.45); g.fillStyle = "rgba(255,255,240,.55)"; g.fill();
    g.restore();
    // lanterna
    const lx = domeCx + Math.sin(th2 * 0.95) * drx * 0.84, ly = brimY - 30;
    const lf = Math.max(0.28, Math.cos(th2));
    if (!costas) {
    if (s2 > 0.55) { ART.rr(g, lx - 6, ly - 13, 18 * s2, 26, 6); g.fillStyle = "#77768A"; g.fill(); }
    ART.ell(g, lx + s2 * 6, ly, 17 * lf, 17); g.fillStyle = "#8C8A9E"; g.fill();
    ART.ell(g, lx + s2 * 7, ly, 13 * lf, 13); g.fillStyle = p.lamp > 0.05 ? "#FFFDF0" : "#D8D6E4"; g.fill();
    ART.ell(g, lx + s2 * 7 - 3 * lf, ly - 4, 4 * lf, 3.5); g.fillStyle = "rgba(255,255,255,.9)"; g.fill();
    }
    A.lanterna = g.getTransform().transformPoint(new DOMPoint(lx + s2 * 9, ly));
    } else {
      // sem capacete: topo da cabeça com plaquinhas de casco
      g.save(); headPath(); g.clip(); ART.ell(g, HX, HY - 50, 58, 26); g.fillStyle = ART.shade(P.casco, 0.05); g.fill();
      for (let i = -2; i <= 2; i++) { ART.ell(g, HX + i * 22, HY - 36, 9, 5); g.fillStyle = ART.rgba(P.cascoEsc, 0.45); g.fill(); } g.restore();
      A.lanterna = g.getTransform().transformPoint(new DOMPoint(HX, HY - 50));
    }
    A.cabeca = g.getTransform().transformPoint(new DOMPoint(HX, HY));
    A.topo = g.getTransform().transformPoint(new DOMPoint(HX, brimY - (p.capacete ? 56 : 20)));
    A.boca = g.getTransform().transformPoint(new DOMPoint(mx + s2 * 12, my + 6));
    // suor / gotas
    if (p.sweat > 0) {
      const sx = HX - HRX * 0.8 * flip * (flip > 0 ? 1 : 1), sy = HY - 12 + (p.t * 40 % 20);
      g.globalAlpha = p.sweat; ART.ell(g, HX - HRX - 2, sy, 5, 8); g.fillStyle = "#9FE3FF"; g.fill(); g.globalAlpha = 1;
    }
    g.restore(); // cabeça

    drawTool();
    if (p.seguraB && bFront) objeto(g, p.seguraB, armB, p);
    drawArm(armF, true);
    if (p.segura) objeto(g, p.segura, armF, p);
    A.mao = g.getTransform().transformPoint(new DOMPoint(armF.hx, armF.hy));
    if (toolInfo) { A.ponta = toolInfo.tip; A.pontaB = toolInfo.tipB; }
    g.restore();

    // luz da lanterna (fora das transformações, em px)
    A.flip = flip; A.turn = p.turn;
    if (p.lamp > 0) lampLight(g, p, A);
    if (p.zzz > 0) zzz(g, A.topo.x + 40 * flip * p.s / 2, A.topo.y + 10, p.t, p.s / 2, p.zzz);
    return A;
  }

  // ---------------------------------------------------------------- objetos na pata
  function objeto(g, o, q, p) {
    const x = q.hx + Math.sin(q.a2) * 8, y = q.hy + Math.cos(q.a2) * 8;
    if (typeof o === "function") { o(g, x, y); }
    else if (o === "moeda") ART.ui.moeda(g, x + 4, y - 2, 13, 0.3 + p.t * 0.0);
    else if (o === "pilha") { for (let i = 0; i < 4; i++) { g.save(); g.translate(x, y + 6 - i * 5); g.scale(1, 0.4); ART.circ(g, 0, 0, 14); g.fillStyle = i === 3 ? "#FFD23F" : "#C88A10"; g.fill(); g.restore(); } }
    else if (o === "pepita") { ART.pepita(g, x + 4, y - 4, 17, "cobre", 0.3, { seed: 7 }); if (p.banho) ART.glow(g, x, y, 60, "#FF8A3C", 0.6 * (p.banho.k || 0)); }
    else if (o === "giz") { g.save(); g.translate(x, y); g.rotate(-q.a2 + Math.PI * 0.75); ART.rr(g, -4, -16, 8, 26, 3); g.fillStyle = "#F4F0E6"; g.fill(); g.restore(); }
    // dedão por cima do objeto
    ART.circ(g, q.hx + Math.sin(q.a2 + 0.9) * 9, q.hy + Math.cos(q.a2 + 0.9) * 9, 6); g.fillStyle = ART.shade(P.pele, 0.06); g.fill();
  }

  // ---------------------------------------------------------------- luz da lanterna
  function lampLight(g, p, A) {
    const { x, y } = A.lanterna, k = p.lamp, sc = p.s / 2;
    const tt = Math.abs(p.turn);
    // halo
    ART.glow(g, x, y, 70 * sc, "#FFF2C4", 0.9 * k);
    ART.glow(g, x, y, 22 * sc, "#FFFFFF", 0.9 * k);
    if (p.cone > 0 && (tt > 0.2 || p.coneLivre)) {
      const ang = p.coneLivre ? p.coneAng : p.turn > 0 ? p.coneAng : 180 - p.coneAng; // graus, 0 = direita
      const spr = ART.cache("cone", 256, 128, gg => {
        gg.translate(0, 64); gg.beginPath(); gg.moveTo(0, -4); gg.lineTo(236, -50); gg.lineTo(236, 50); gg.lineTo(0, 4); gg.closePath();
        gg.fillStyle = ART.rg(gg, 0, 0, 0, 240, [[0, "rgba(255,236,170,.75)"], [0.35, "rgba(255,214,120,.25)"], [1, "rgba(255,200,100,0)"]]);
        gg.filter = "blur(5px)"; gg.fill();
      });
      const L = p.coneLen * sc;
      g.save(); g.translate(x, y); g.rotate(deg(ang)); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.55 * p.cone * k;
      g.drawImage(spr, 0, -L * 0.5 * (p.coneAbre || 1), L * 256 / 236, L * (p.coneAbre || 1));
      g.restore();
    }
  }
  ART.lampLight = lampLight;

  // ---------------------------------------------------------------- Zzz
  function zzz(g, x, y, t, sc, a) {
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 0.55 + i / 3) % 1);
      const xx = x + ph * 60 * sc + Math.sin(ph * 6 + i) * 8 * sc, yy = y - ph * 120 * sc;
      const al = a * Math.sin(Math.PI * ph);
      ART.textFx(g, "Z", xx, yy, { size: (26 + ph * 26) * sc, fam: "Lilita One", fill: "#CFE8FF", stroke: "#2A3150", sw: 6 * sc, shadow: null });
      g.globalAlpha = 1;
      void al;
    }
  }
  ART.zzz = (g, x, y, t, sc = 1, a = 1) => {
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 0.5 + i / 3) % 1), al = a * Math.sin(Math.PI * ph);
      g.save(); g.globalAlpha = al;
      ART.textFx(g, "Z", x + ph * 70 * sc + Math.sin(ph * 6 + i) * 10 * sc, y - ph * 140 * sc, { size: (30 + ph * 34) * sc, fam: "Lilita One", fill: "#D6ECFF", stroke: "#252B4A", sw: 7 * sc, shadow: null });
      g.restore();
    }
  };

  // ---------------------------------------------------------------- poses e ciclos
  const breathe = t => Math.sin(t * 2.4);
  const lt = (t, o) => t - (o.t0 || 0); // tempo local de poses de evento
  const POSES = {
    parado: t => ({ bob: breathe(t) * 1.6, sq: 1 + breathe(t) * 0.012, headDy: breathe(t + 0.4) * 1.2, aF: 14 + breathe(t) * 3, aB: -22 - breathe(t) * 2 }),
    /** ciclo de picaretada: período P (s). Fases: preparo (antecipação) → golpe → impacto → volta. Impacto em 66% do ciclo. */
    cavando: (t, o = {}) => {
      const Pd = o.periodo || 0.9, ph = ((t - (o.t0 || 0)) % Pd + Pd) % Pd / Pd;
      const a = kf(ph, [[0, 40], [0.42, 205, "outCubic"], [0.56, 212], [0.66, 78, "inQuart"], [0.78, 74], [1, 40, "inOutSine"]]);
      const e = kf(ph, [[0, 10], [0.42, -20], [0.56, -24], [0.66, 6, "inQuart"], [1, 10]]);
      const lean = kf(ph, [[0, 3], [0.42, -9, "outCubic"], [0.56, -11], [0.66, 13, "inQuart"], [0.78, 12], [1, 3]]);
      const sq = kf(ph, [[0, 1], [0.42, 0.95], [0.56, 0.94], [0.66, 1.1, "inQuart"], [0.72, 1.06], [1, 1]]);
      const impact = ph > 0.66 && ph < 0.8;
      return {
        aF: a, eF: e, aB: a - 14, eB: e + 4, lean, sq, bob: kf(ph, [[0, 0], [0.42, 6], [0.66, -2], [1, 0]]),
        headTilt: kf(ph, [[0, 0], [0.42, -6], [0.66, 7, "inQuart"], [1, 0]]),
        tool: "picareta", toolOff: 0, eyes: "determinado", mouth: impact ? "esforco" : "neutro", brows: "bravo",
        lF: kf(ph, [[0, 8], [0.66, 18], [1, 8]]), lB: -14, blink: 0,
      };
    },
    /** andar: passada com pé plantado, quique duplo, braços em oposição, balanço do corpo */
    andando: (t, o = {}) => {
      const Pd = o.periodo || 0.6, ph = (t / Pd) * Math.PI * 2;
      return { lF: Math.sin(ph) * 32, lB: -Math.sin(ph) * 32, liftF: Math.max(0, Math.cos(ph)) * 10, liftB: Math.max(0, -Math.cos(ph)) * 10,
        bob: Math.abs(Math.sin(ph)) * 7, sq: 1 + Math.cos(ph * 2) * 0.02, aF: -Math.sin(ph) * 34 + 10, eF: 18 + Math.cos(ph) * 10, aB: Math.sin(ph) * 34 - 12, eB: 18,
        lean: 5 + Math.sin(ph * 2) * 1.2, headTilt: Math.sin(ph * 2 + 0.6) * 2, headDy: Math.abs(Math.sin(ph + 0.4)) * 2 };
    },
    bola: (t, o = {}) => ({ ball: 1, spin: (o.vel ?? 360) * t, bob: Math.abs(Math.sin(t * 6)) * (o.quica ?? 0) }),
    sentado: t => ({ sit: 1, bob: -24 + breathe(t) * 1.2, lF: 80, lB: 76, liftF: 2, aF: 34, eF: 36, aB: -30, eB: 30, legSpread: 1.2 }),
    dormindo: t => ({ sit: 1, bob: -26 + Math.sin(t * 1.6) * 1.8, sq: 1 + Math.sin(t * 1.6) * 0.02, lF: 80, lB: 76, aF: 25, eF: 40, aB: -20, eB: 40,
      headTilt: 12 + Math.sin(t * 1.6) * 2, headDy: 6, eyes: "fechado", mouth: "dormindo", zzz: 1, legSpread: 1.2, blink: 0 }),
    /** deitado na cama (use ART.cobertor por cima). Rotaciona o corpo; cabeça para a esquerda quando turn>0 */
    deitado: (t, o = {}) => ({ capacete: 0, lean: -84, bob: 0, sq: 1 + Math.sin(t * 1.6) * 0.015, aF: 60, eF: 70, aB: 40, eB: 80, lF: 10, lB: -6, shadow: 0,
      eyes: o.acordado ? "meio" : "fechado", mouth: o.acordado ? "neutro" : "dormindo", zzz: o.acordado ? 0 : 1, headTilt: 6, blink: o.acordado ? undefined : 0 }),
    /** comemoração: antecipação, pulo, braços alternados com atraso, cabeça atrasada, pés encolhidos no ar, aterrissagem amassada */
    comemorando: (t, o = {}) => {
      const Pd = o.periodo || 0.75, ph = ((t % Pd) + Pd) % Pd / Pd;
      const air = Math.max(0, Math.sin((ph - 0.12) / 0.7 * Math.PI)) * (ph > 0.12 && ph < 0.82 ? 1 : 0);
      const squash = ph < 0.12 ? Math.sin(ph / 0.12 * Math.PI) : ph > 0.82 ? Math.sin((ph - 0.82) / 0.18 * Math.PI) : 0;
      const w = ph * Math.PI * 2;
      return { bob: air * 52, sq: 1 + squash * 0.09 - air * 0.05, aF: 150 + Math.sin(w) * 26, eF: -18 + Math.sin(w + 1) * 22, aB: -150 + Math.sin(w + Math.PI) * 26, eB: 18 - Math.sin(w + 1) * 22,
        eyes: "feliz", mouth: "aberto", lF: air * 26, lB: -air * 18, liftF: air * 14, liftB: air * 8, headTilt: Math.sin(w - 0.8) * 6, headDy: -air * 4 + squash * 5, lean: Math.sin(w) * 3, blink: 0 };
    },
    /** susto com antecipação (t0 = instante do susto): encolhe → pula para trás → treme */
    susto: (t, o = {}) => {
      const u = lt(t, o), k = ART.prog(u, 0.12, 0.26, "outBack");
      return { bob: kf(u, [[0, 0], [0.12, -5], [0.26, 36, "outQuad"], [0.42, 0, "inQuad"], [0.5, 0]]), sq: kf(u, [[0, 1], [0.12, 1.1], [0.26, 0.9], [0.44, 1.07], [0.6, 1]]),
        lean: kf(u, [[0, 0], [0.12, 4], [0.3, -12], [0.6, -6]]), aF: lerp(14, 128, k), eF: lerp(20, 40, k), aB: lerp(-22, -128, k), eB: lerp(15, -40, k),
        eyes: u < 0.12 ? "meio" : "espanto", mouth: u < 0.12 ? "neutro" : "grito", brows: "surpreso", headTilt: -6 * k, headDy: -4 * k,
        headDx: u > 0.4 ? Math.sin(u * 60) * 1.5 * Math.max(0, 1 - (u - 0.4)) : 0, sweat: k, lF: -10 * k, liftF: kf(u, [[0.2, 0], [0.3, 8], [0.42, 0]]), blink: 0 };
    },
    espantado: (t, o = {}) => POSES.susto(t + 0.12, o),
    preocupado: t => ({ bob: breathe(t * 0.6) * 1.2 - 3, lean: 5, headTilt: 9 + Math.sin(t * 0.9) * 2, headDy: 8, eyes: "preocupado", mouth: "triste", brows: "preocupado",
      look: [0.1, 0.9], aF: 30, eF: 60, aB: 25, eB: 65, bFrente: 1, blush: 0.6 }),
    /** cansado / ofegando depois do dia */
    cansado: t => ({ bob: -3 + Math.sin(t * 7) * 2.2, sq: 1 + Math.sin(t * 7) * 0.025, lean: 11, headTilt: 13 + Math.sin(t * 7 + 0.5) * 1.5, headDy: 9,
      eyes: "meio", mouth: Math.sin(t * 7) > 0 ? "aberto" : "o", aF: 4, eF: 8, aB: -6, eB: 6, sweat: 1, look: [0.2, 0.6] }),
    /** contando moedas com as duas patas na frente do peito */
    contando: (t, o = {}) => {
      const Pd = o.periodo || 0.55, ph = ((t % Pd) + Pd) % Pd / Pd, pass = Math.sin(ph * Math.PI);
      return { aF: lerp(48, 72, pass), eF: lerp(80, 60, pass), aB: 58, eB: 70, bFrente: 1, segura: "moeda", seguraB: "pilha",
        headTilt: 11 + pass * 2, headDy: 5, look: [0.4, 1], eyes: "aberto", mouth: "sorriso", bob: breathe(t) * 1.2 };
    },
    /** segurando um objeto na frente (ex.: pepita) */
    segurando: (t, o = {}) => ({ aF: 62, eF: 60, aB: 50, eB: 70, bFrente: 1, segura: o.objeto || "pepita", headTilt: 8, look: [0.4, 0.8], eyes: "aberto", mouth: "sorriso", bob: breathe(t) * 1.4 }),
    /** apontando para frente/parede (pata esticada); combine com alvo:[x,y] */
    apontando: (t) => ({ aF: 82 + Math.sin(t * 3) * 2, eF: -4, aB: -26, eB: 20, lean: -2, mouth: "aberto", bob: breathe(t) * 1.2 }),
    /** de costas riscando a parede com giz (plano por cima do ombro) */
    riscando: (t, o = {}) => ({ costas: 1, aF: 152 + Math.sin(t * 15) * 9, eF: -16 + Math.cos(t * 15) * 8, aB: -24, eB: 20, segura: "giz", headTilt: Math.sin(t * 15) * 1.5, bob: breathe(t) * 1.2 }),
  };
  function blinkAt(t) {
    // piscadas determinísticas a cada ~3,1 s
    const per = 3.1, ph = ((t + 1.7) % per + per) % per;
    return ph < 0.14 ? Math.sin((ph / 0.14) * Math.PI) : 0;
  }
  const mix = (a, b, k) => {
    const o = {};
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const va = a[key] ?? BASE[key], vb = b[key] ?? BASE[key];
      if (typeof va === "number" && typeof vb === "number") o[key] = lerp(va, vb, k);
      else if (Array.isArray(va) && Array.isArray(vb)) o[key] = va.map((v, i) => lerp(v, vb[i], k));
      else o[key] = k < 0.5 ? va : vb;
    }
    return o;
  };
  const pose = (name, t, extra = {}, opts = {}) => Object.assign({ t }, (POSES[name] || POSES.parado)(t, opts), extra);
  /** sequência de ações num plano, com transição suave entre elas.
   *  keys = [[t0, nome, extras?, opts?], ...]; o = {base: extras comuns, blend: s de transição (0,25)}.
   *  opts.t0 recebe o início do trecho (poses de evento como 'susto' usam tempo local). */
  const seq = (t, keys, o = {}) => {
    const bl = o.blend ?? 0.25; let i = 0;
    for (let j = 0; j < keys.length; j++) if (t >= keys[j][0]) i = j;
    const mk = j => { const [t0, nome, ex = {}, op = {}] = keys[j]; return pose(nome, t, Object.assign({}, o.base || {}, ex), Object.assign({ t0 }, op)); };
    const cur = mk(i);
    if (i === 0 || t - keys[i][0] >= bl) return cur;
    return Object.assign(mix(mk(i - 1), cur, ART.ease.inOutQuad((t - keys[i][0]) / bl)), { t });
  };
  /** Zeca no escuro: silhueta escurecida, só os olhos brilham (plano 8). k = 0..1 */
  let ESC = null;
  const drawEscuro = (g, p, k = 1, o = {}) => {
    const c = g.canvas; if (!ESC || ESC.width !== c.width || ESC.height !== c.height) ESC = ART.canvas(c.width, c.height);
    const e = ESC.getContext("2d"); e.setTransform(1, 0, 0, 1, 0, 0); e.clearRect(0, 0, ESC.width, ESC.height);
    e.setTransform(g.getTransform());
    const A = draw(e, Object.assign({}, p, { lamp: p.lamp ?? 0 }));
    e.setTransform(1, 0, 0, 1, 0, 0); e.globalCompositeOperation = "source-atop"; e.fillStyle = `rgba(6,4,12,${0.94 * k})`; e.fillRect(0, 0, ESC.width, ESC.height); e.globalCompositeOperation = "source-over";
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(ESC, 0, 0);
    for (const q of A.olhos || []) { ART.glow(g, q.x, q.y, 34 * p.s / 2, o.cor || "#CFE8FF", 0.7 * k); ART.circ(g, q.x + 3, q.y - 4, 4.5 * p.s / 2); g.fillStyle = `rgba(255,255,255,${k})`; g.fill(); ART.circ(g, q.x - 3, q.y + 4, 2 * p.s / 2); g.fill(); }
    g.restore(); return A;
  };
  /** enquadramentos prontos do Zeca sozinho na tela (sem cenário em perspectiva): retorna {x, y, s}.
   *  'geral' corpo inteiro pequeno; 'inteiro' corpo inteiro ocupando ~350–1250; 'medio' da cintura pra cima; 'close' rosto. */
  const quadro = (nome = "inteiro", x = 540) => ({
    geral: { x, y: 1250, s: 1.5 }, inteiro: { x, y: 1260, s: 3.6 }, medio: { x, y: 1560, s: 5.2 }, close: { x, y: 2050, s: 8 },
  }[nome]);
  /** cobertor por cima do Zeca deitado (x,y = centro, w = largura) */
  ART.cobertor = (g, x, y, w = 360, o = {}) => {
    g.save(); g.translate(x, y);
    g.beginPath(); g.moveTo(-w / 2, -30); g.quadraticCurveTo(-w * 0.1, -70, w / 2, -36); g.lineTo(w / 2 + 10, 50); g.quadraticCurveTo(0, 64, -w / 2 - 10, 50); g.closePath();
    g.fillStyle = ART.lg(g, 0, -60, 0, 60, [[0, o.cor || "#6E4FB0"], [1, ART.shade(o.cor || "#6E4FB0", -0.35)]]); g.fill();
    g.fillStyle = "#FFD23F"; for (let i = 0; i < 6; i++) { g.save(); g.translate(-w * 0.38 + i * w * 0.15, -8 + (i % 2) * 22); g.rotate(0.78); g.fillRect(-7, -7, 14, 14); g.restore(); }
    g.beginPath(); g.moveTo(-w / 2, -30); g.quadraticCurveTo(-w * 0.1, -70, w / 2, -36); g.lineWidth = 10; g.strokeStyle = "#E9DCC6"; g.stroke();
    g.restore();
  };
  /** lanterna falhando (determinística): intensidade 0..1 */
  const falha = (t, k = 1, seed = 3) => { const n = ART.noise(t * 18, seed), m = ART.noise(t * 3, seed + 1); return clamp(1 - k * (n > 0.35 ? 0.9 : 0) - k * Math.max(0, -m) * 0.6); };

  ART.zeca = { BASE, draw, poses: POSES, blinkAt, pose, mix, seq, drawEscuro, quadro, falha };
})();
