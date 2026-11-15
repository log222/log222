/* MAGMA DIG — kit de arte: palco (camadas/parallax), texturas, minérios e a MINA 1.
 *
 * Um cenário é um objeto { fundo: [camada...], frente: [camada...], pos: fn } onde
 * camada = { d: profundidade, draw(g, t) }  (d: 0 = infinito, 1 = plano do personagem, >1 = à frente)
 * ART.palco(g, t, cam, cena, atores(g)) desenha fundo -> atores (d=1) -> frente -> pós (vinheta, grão).
 */
(function () {
  const ART = window.ART, P = ART.pal;
  const { lerp, clamp } = ART;
  const W = 1080, H = 1920;

  // ================================================================== palco
  ART.palco = (g, t, cam, cena, atores, o = {}) => {
    const all = cena.fundo || [];
    for (const L of all) ART.withLayer(g, cam, L.d, gg => L.draw(gg, t));
    if (atores) ART.withLayer(g, cam, 1, gg => atores(gg, t));
    for (const L of cena.frente || []) ART.withLayer(g, cam, L.d, gg => L.draw(gg, t));
    if (cena.luz) cena.luz(g, t, cam);
    if (o.post !== false) ART.post(g, o.frame ?? Math.round(t * 30), o);
  };
  /** pós-processamento comum: vinheta + grão + faixa de legenda opcional */
  ART.post = (g, frame, o = {}) => {
    ART.vignette(g, o.vinheta ?? 0.62);
    if (o.legenda !== false) ART.faixaLegenda(g, o.legendaK ?? 0.38);
    ART.grain(g, frame, o.grao ?? 0.07);
  };
  /** escurece suavemente a faixa da legenda (≈66–80% da altura) para dar contraste */
  ART.LEGENDA = { y0: 1300, y1: 1500, centro: 1400 };
  ART.faixaLegenda = (g, k = 0.38) => {
    if (k <= 0) return;
    g.save();
    // faixa da legenda: centro y≈1400 (73%), platô 1290–1510
    g.fillStyle = ART.lg(g, 0, 1170, 0, 1640, [[0, "rgba(8,6,16,0)"], [0.26, `rgba(8,6,16,${k})`], [0.73, `rgba(8,6,16,${k})`], [1, "rgba(8,6,16,0)"]]);
    g.fillRect(0, 1170, W, 470); g.restore();
  };
  /** camada estática cacheada (desenha uma vez em canvas com margem; blur opcional) */
  ART.camadaEstatica = (key, d, paint, o = {}) => {
    const m = o.margem ?? 160, sc = o.res ?? 1;
    return {
      d, draw(g) {
        const c = ART.cache(key, (W + 2 * m) * sc, (H + 2 * m) * sc, (gg) => {
          gg.scale(sc, sc); gg.translate(m, m); paint(gg);
        });
        const img = o.blur ? ART.blurred(c, o.blur * sc, key + ":b" + o.blur) : c;
        g.drawImage(img, -m, -m, W + 2 * m, H + 2 * m);
      },
    };
  };

  // ================================================================== textura de pedra (Voronoi)
  /** tile de Voronoi (cacheado): cores = [base, varA, varB], borda = cor da junta */
  ART.texVoronoi = (key, o = {}) => ART.cache("vor:" + key, o.size || 384, o.size || 384, (g, w, h) => {
    const n = o.n || 34, r = ART.rng(o.seed || 7), pts = [];
    for (let i = 0; i < n; i++) pts.push([r() * w, r() * h, r()]);
    const cols = (o.cores || [P.pedra1, P.pedra2, P.pedra0]).map(ART.hex), edge = ART.hex(o.junta || "#3A3836");
    const im = g.createImageData(w, h), d = im.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let b1 = 1e9, b2 = 1e9, bi = 0;
      for (let i = 0; i < n; i++) {
        for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
          const dx = x - pts[i][0] - ox * w, dy = y - pts[i][1] - oy * h, dd = dx * dx + dy * dy;
          if (dd < b1) { b2 = b1; b1 = dd; bi = i; } else if (dd < b2) b2 = dd;
        }
      }
      const e = Math.sqrt(b2) - Math.sqrt(b1), v = pts[bi][2];
      const c = v < 0.45 ? cols[0] : v < 0.8 ? cols[1] : cols[2];
      const shade = 0.92 + 0.16 * ((pts[bi][0] / w) * 0.5 + (1 - pts[bi][1] / h) * 0.5) ;
      const k = e < 2.2 ? 1 - e / 2.2 : 0;
      const i4 = (y * w + x) * 4;
      for (let j = 0; j < 3; j++) d[i4 + j] = lerp(c[j] * shade, edge[j], k * 0.85);
      d[i4 + 3] = 255;
    }
    g.putImageData(im, 0, 0);
  });
  /** preenche o quadrilátero (pontos a,b,c,d em sentido horário; a->b = eixo u, a->d = eixo v) com a textura */
  ART.quadTex = (g, q, tex, o = {}) => {
    const [a, b, , d] = q, tw = tex.width, th = tex.height;
    const rep = o.rep || 1, ou = o.ou || 0, ov = o.ov || 0;
    g.save(); ART.poly(g, q); g.clip();
    // afim: (u,v) em px da textura -> tela
    const ux = (b[0] - a[0]) / (tw * rep), uy = (b[1] - a[1]) / (tw * rep), vx = (d[0] - a[0]) / (th * rep), vy = (d[1] - a[1]) / (th * rep);
    g.transform(ux, uy, vx, vy, a[0], a[1]);
    g.translate(-ou * tw, -ov * th);
    g.fillStyle = g.createPattern(tex, "repeat");
    g.fillRect(-tw, -th, tw * (rep + 3), th * (rep + 3));
    g.restore();
    if (o.tint) { ART.poly(g, q); g.fillStyle = o.tint; g.fill(); }
  };

  // ================================================================== minérios (ícones/pepitas em cena)
  const ORE = {
    pedra: { c: ["#9C9890", "#C9C3B4", "#5E5B57"] },
    cobre: { c: ["#E07B39", "#FFB27A", "#8A3E14"] },
    ferro: { c: ["#9C6B4E", "#D4A586", "#5A3624"] },
    prata: { c: ["#C8D3DE", "#FFFFFF", "#6F7C8C"] },
    ouro: { c: ["#FFC531", "#FFF2A6", "#B07A0C"] },
    ametista: { c: ["#9B5CF0", "#E3C6FF", "#4F2393"] },
    rubi: { c: ["#E2324A", "#FF9AA8", "#7A0F22"] },
    lasca: { c: ["#7FD8F0", "#E8FCFF", "#2E8FB0"] },
  };
  ART.ORE = ORE;
  /** pepita facetada (low-poly) centrada em (x,y), raio r, girada rot; tipo = chave de ORE */
  ART.pepita = (g, x, y, r, tipo = "ouro", rot = 0, o = {}) => {
    const c = ORE[tipo].c, rr = ART.rng(o.seed || 3);
    g.save(); g.translate(x, y); g.rotate(rot);
    if (tipo === "ametista" || tipo === "lasca") {
      // cristal: losango alongado com faces
      const h = r * 1.5, w = r * 0.75;
      const faces = [[[0, -h], [w, -h * 0.15], [0, h * 0.55]], [[0, -h], [-w, -h * 0.15], [0, h * 0.55]], [[-w, -h * 0.15], [0, h * 0.55], [-w * 0.4, h * 0.7]], [[w, -h * 0.15], [0, h * 0.55], [w * 0.4, h * 0.7]]];
      const fc = [c[1], c[0], ART.shade(c[0], -0.25), c[2]];
      faces.forEach((f, i) => { ART.poly(g, f); g.fillStyle = fc[i]; g.fill(); });
    } else if (tipo === "prata") {
      // lasca metálica alongada (como no jogo)
      ART.ell(g, 0, 0, r * 1.3, r * 0.42); g.fillStyle = ART.lg(g, 0, -r * 0.4, 0, r * 0.4, [[0, c[1]], [0.5, c[0]], [1, c[2]]]); g.fill();
      ART.ell(g, -r * 0.2, -r * 0.12, r * 0.7, r * 0.12); g.fillStyle = "rgba(255,255,255,.8)"; g.fill();
    } else {
      // pepita: polígono irregular com 3 tons
      const n = 7, pts = [];
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, k = 0.78 + rr() * 0.3; pts.push([Math.cos(a) * r * k * 1.1, Math.sin(a) * r * k * 0.9]); }
      ART.poly(g, pts); g.fillStyle = c[0]; g.fill();
      // facetas
      g.fillStyle = ART.rgba(c[1], 0.85); ART.poly(g, [pts[3], pts[4], pts[5], [r * -0.1, -r * 0.05]]); g.fill();
      g.fillStyle = ART.rgba(c[1], 0.45); ART.poly(g, [pts[5], pts[6], [r * -0.1, -r * 0.05]]); g.fill();
      g.fillStyle = ART.rgba(c[2], 0.6); ART.poly(g, [pts[0], pts[1], pts[2], [r * -0.1, -r * 0.05]]); g.fill();
    }
    if (o.brilho) ART.glow(g, 0, 0, r * 3, c[1], o.brilho);
    g.restore();
  };

  // ================================================================== projeção da mina
  /** perspectiva simples: chão em Y=0, câmera em altura hc, horizonte y0, focal f */
  const PJ = { f: 900, hc: 2.2, y0: 560, cx: 540 };
  ART.proj = (X, Y, Z, pj = PJ) => [pj.cx + (pj.f * X) / Z, pj.y0 + (pj.f * (pj.hc - Y)) / Z];
  ART.projEscala = (Z, pj = PJ) => pj.f / Z; // px por unidade na profundidade Z
  ART.PJ = PJ;

  // ---------------------------------------------------------------- bloco (cubo) com rachaduras
  /** desenha um cubo de pedra [X0..X0+1]x[0..1]x[Z0..Z0+1]; o = {tex, crack:0..3, seed, ores:[{tipo,u,v,r}], luz} */
  ART.cubo = (g, X0, Z0, o = {}) => {
    const pj = o.pj || PJ, sz = o.size || 1, Yb = o.y || 0;
    const p = (x, y, z) => ART.proj(X0 + x * sz, Yb + y * sz, Z0 + z * sz, pj);
    const top = [p(0, 1, 1), p(1, 1, 1), p(1, 1, 0), p(0, 1, 0)];
    const front = [p(0, 1, 0), p(1, 1, 0), p(1, 0, 0), p(0, 0, 0)];
    const side = X0 + sz * 0.5 < 0 ? [p(1, 1, 0), p(1, 1, 1), p(1, 0, 1), p(1, 0, 0)] : [p(0, 1, 1), p(0, 1, 0), p(0, 0, 0), p(0, 0, 1)];
    const all = [...top, ...front, ...side];
    const bx = Math.floor(Math.min(...all.map(q => q[0]))) - 40, by = Math.floor(Math.min(...all.map(q => q[1]))) - 40;
    const bw = Math.ceil(Math.max(...all.map(q => q[0]))) - bx + 80, bh = Math.ceil(Math.max(...all.map(q => q[1]))) - by + 60;
    const key = `cubo:${X0.toFixed(3)}:${Z0.toFixed(3)}:${Yb}:${sz}:${o.seed || 0}:${o.texKey || "mina"}:${JSON.stringify(o.ores || [])}:${pj.f}:${pj.y0}:${pj.cx}`;
    const spr = ART.cache(key, bw, bh, gg => {
      gg.translate(-bx, -by);
      const tex = o.tex || ART.texVoronoi("mina");
      // sombra de contato (oclusão) no chão
      const c0 = p(0.5, 0, 0.45), wid = front[1][0] - front[0][0];
      gg.save(); gg.translate(c0[0], c0[1]); gg.scale(1, 0.28); ART.glow(gg, 0, 0, wid * 0.85, "#06040A", 0.9, "source-over"); gg.restore();
      const faces = [[side, "rgba(20,14,30,.42)", 0.3], [top, "rgba(255,240,215,.10)", 0.1], [front, "rgba(20,14,30,.12)", 0.2]];
      for (const [q, tint, off] of faces) ART.quadTex(gg, q, tex, { tint, ou: (o.seed || 0) * 0.37 + off, ov: (o.seed || 0) * 0.21 });
      ART.poly(gg, front); gg.fillStyle = ART.lg(gg, 0, front[0][1], 0, front[3][1], [[0, "rgba(255,235,200,.10)"], [0.55, "rgba(20,12,30,0)"], [1, "rgba(20,12,30,.45)"]]); gg.fill();
      ART.poly(gg, top); gg.fillStyle = ART.lg(gg, 0, top[0][1], 0, top[3][1], [[0, "rgba(20,12,30,.25)"], [1, "rgba(255,235,200,.05)"]]); gg.fill();
      gg.strokeStyle = "rgba(255,236,200,.22)"; gg.lineWidth = 2; gg.beginPath(); gg.moveTo(...top[3]); gg.lineTo(...top[2]); gg.stroke();
      for (const m of o.ores || []) {
        const [a, b, , d] = front, u = m.u, v = m.v;
        const x = a[0] + (b[0] - a[0]) * u + (d[0] - a[0]) * v, y = a[1] + (b[1] - a[1]) * u + (d[1] - a[1]) * v;
        ART.pepita(gg, x, y, m.r * (b[0] - a[0]), m.tipo, m.rot || 0, { seed: m.seed || 2 });
      }
    });
    g.drawImage(spr, bx, by);
    if (o.escuro) { for (const q of [front, top, side]) { ART.poly(g, q); g.fillStyle = `rgba(12,8,20,${o.escuro})`; g.fill(); } }
    if (o.veios) veios(g, front, top, o.veios, o.seed || 1, o.t || 0);
    if (o.crack > 0) rachar(g, front, top, o.crack, o.seed || 1, o.crackGlow);
    return { front, top, side, centro: [(front[0][0] + front[2][0]) / 2, (front[0][1] + front[2][1]) / 2] };
  };
  /** veios de cobre incandescentes na face (plano 45–48: "a parede diferente"). k = 0..1 */
  function veios(g, front, top, k, seed, t) {
    const [a, b, , d] = front, map = (u, v) => [a[0] + (b[0] - a[0]) * u + (d[0] - a[0]) * v, a[1] + (b[1] - a[1]) * u + (d[1] - a[1]) * v];
    const fw = b[0] - a[0], r = ART.rng(seed + 50);
    g.save(); ART.poly(g, front); g.clip(); g.lineCap = "round"; g.lineJoin = "round";
    const fl = 0.85 + 0.15 * ART.noise(t * 3, seed);
    for (let i = 0; i < 5; i++) {
      const pts = []; let u = r() * 0.3 + (i % 2 ? 0.55 : 0.05), v = r(); const du = 0.12 + r() * 0.08, dv = (r() - 0.5) * 0.25;
      for (let j = 0; j < 8; j++) { pts.push(map(u, v)); u += du; v += dv + (r() - 0.5) * 0.18; }
      const path = () => { g.beginPath(); pts.forEach((q, j) => (j ? g.lineTo(...q) : g.moveTo(...q))); };
      path(); g.strokeStyle = ART.rgba("#FF7A1A", 0.35 * k * fl); g.lineWidth = fw * 0.09; g.stroke();
      path(); g.strokeStyle = ART.rgba("#FFB060", 0.8 * k * fl); g.lineWidth = fw * 0.035; g.stroke();
      path(); g.strokeStyle = ART.rgba("#FFF0C8", 0.9 * k * fl); g.lineWidth = fw * 0.012; g.stroke();
      // pepitas de cobre no veio
      for (let j = 1; j < pts.length; j += 3) ART.pepita(g, pts[j][0], pts[j][1], fw * 0.035 * k, "cobre", j, { seed: i * 10 + j });
    }
    g.restore();
    const c = map(0.5, 0.45);
    ART.glow(g, c[0], c[1], fw * 1.3, "#FF7A1A", 0.55 * k * fl);
  }
  ART.veios = veios;
  // rachaduras procedurais: 3 estágios, cada um revela mais ramos
  function crackPaths(seed) {
    const r = ART.rng(seed), paths = [];
    // ramo principal: do ponto de impacto (perto do topo-esquerda) para baixo
    const mk = (x0, y0, ang, len, n) => { const pts = [[x0, y0]]; let x = x0, y = y0, a = ang; for (let i = 0; i < n; i++) { a += (r() - 0.5) * 1.1; const l = len / n * (0.7 + r() * 0.6); x += Math.cos(a) * l; y += Math.sin(a) * l; pts.push([x, y]); } return pts; };
    paths.push({ st: 1, pts: mk(0.32, 0.12, 1.3, 0.55, 5), w: 1 });
    paths.push({ st: 1, pts: mk(0.32, 0.12, 0.2, 0.3, 3), w: 0.7 });
    paths.push({ st: 2, pts: mk(0.45, 0.4, 0.4, 0.5, 5), w: 0.9 });
    paths.push({ st: 2, pts: mk(0.3, 0.5, 2.4, 0.3, 4), w: 0.7 });
    paths.push({ st: 2, pts: mk(0.32, 0.12, -0.5, 0.25, 3), w: 0.6 });
    paths.push({ st: 3, pts: mk(0.6, 0.6, 1.2, 0.45, 4), w: 1 });
    paths.push({ st: 3, pts: mk(0.55, 0.3, -0.2, 0.45, 4), w: 0.8 });
    paths.push({ st: 3, pts: mk(0.4, 0.75, 2.8, 0.35, 4), w: 0.8 });
    paths.push({ st: 3, pts: mk(0.7, 0.2, 2.0, 0.3, 3), w: 0.6 });
    return paths;
  }
  const CRACKS = new Map();
  function rachar(g, front, top, stage, seed, glow) {
    let ps = CRACKS.get(seed); if (!ps) { ps = crackPaths(seed); CRACKS.set(seed, ps); }
    const [a, b, , d] = front, map = (u, v) => [a[0] + (b[0] - a[0]) * u + (d[0] - a[0]) * v, a[1] + (b[1] - a[1]) * u + (d[1] - a[1]) * v];
    const fw = b[0] - a[0];
    g.save(); ART.poly(g, front); g.clip(); g.lineCap = "round"; g.lineJoin = "round";
    for (const c of ps) {
      const k = clamp(stage - (c.st - 1)); if (k <= 0) continue;
      const n = c.pts.length - 1, upto = k * n;
      const pts = [];
      for (let i = 0; i <= Math.ceil(upto); i++) { const j = Math.min(i, upto); const i0 = Math.floor(j), f = j - i0; const p0 = c.pts[Math.min(i0, n)], p1 = c.pts[Math.min(i0 + 1, n)]; pts.push(map(lerp(p0[0], p1[0], f), lerp(p0[1], p1[1], f))); }
      // brilho/borda clara + traço escuro
      g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p)));
      if (glow) { g.strokeStyle = ART.rgba(glow, 0.35); g.lineWidth = fw * 0.06 * c.w; g.stroke(); g.strokeStyle = ART.rgba(glow, 0.6); g.lineWidth = fw * 0.035 * c.w; g.stroke(); }
      g.strokeStyle = "rgba(255,240,220,.35)"; g.lineWidth = fw * 0.03 * c.w; g.translate(1.5, 1.5); g.stroke(); g.translate(-1.5, -1.5);
      g.strokeStyle = "#1C1518"; g.lineWidth = fw * 0.02 * c.w; g.stroke();
    }
    g.restore();
  }

  /** estouro do bloco: lascas texturizadas + poeira + minérios voando. o = {t0, front, cores, seed, alvo:[x,y], ores:[tipos]} */
  ART.estouro = (g, t, o) => {
    const dt = t - o.t0; if (dt < 0 || dt > 2.2) return;
    const [a, b, c2, d] = o.front, cx = (a[0] + c2[0]) / 2, cy = (a[1] + c2[1]) / 2, sz = b[0] - a[0];
    // clarão
    if (dt < 0.25) ART.glow(g, cx, cy, sz * 1.6, "#FFF1C8", 1 - dt / 0.25);
    // nuvem de poeira (círculos que crescem e somem)
    const r = ART.rng(o.seed || 9);
    g.save();
    for (let i = 0; i < 14; i++) {
      const an = r() * Math.PI * 2, sp = 0.3 + r() * 0.7, rad = sz * (0.25 + r() * 0.3);
      const k = clamp(dt / (1.1 + r() * 0.6)), e = ART.ease.outCubic(k);
      const x = cx + Math.cos(an) * sz * 0.8 * sp * e, y = cy + Math.sin(an) * sz * 0.4 * sp * e - sz * 0.25 * e;
      g.globalAlpha = (1 - k) * 0.5;
      g.fillStyle = ART.rg(g, x, y, 0, rad * (1 + e), [[0, "rgba(205,195,175,.9)"], [1, "rgba(205,195,175,0)"]]);
      g.fillRect(x - rad * 2.2, y - rad * 2.2, rad * 4.4, rad * 4.4);
    }
    g.restore();
    // lascas (pedaços com cor de pedra)
    const shards = ART.burst(t, { t0: o.t0, count: 26, x: cx, y: cy, w: sz * 0.9, h: sz * 0.8, speed: [sz * 1.6, sz * 4.2], angle: [-170, -10], gravity: sz * 9, life: [0.7, 1.3], seed: o.seed || 5, spin: 540 });
    const cols = o.cores || [P.pedra1, P.pedra2, P.pedra0, P.pedra3];
    for (const s of shards) {
      g.save(); g.globalAlpha = clamp(s.alpha * 1.5); g.translate(s.x, s.y); g.rotate(ART.deg(s.rot));
      const rr = ART.rng(s.i + 40), ss = s.size / 22 * sz * 0.14;
      const pts = [[-ss, -ss * 0.6], [ss * (0.4 + rr() * 0.6), -ss], [ss, ss * (0.2 + rr() * 0.6)], [-ss * 0.3, ss]];
      ART.poly(g, pts); g.fillStyle = cols[s.i % cols.length]; g.fill();
      ART.poly(g, [pts[0], pts[1], [0, 0]]); g.fillStyle = "rgba(255,245,225,.3)"; g.fill();
      g.restore();
    }
    // faíscas
    const sp = ART.burst(t, { t0: o.t0, count: 18, x: cx, y: cy - sz * 0.2, speed: [sz * 3, sz * 6], angle: [-160, -20], gravity: sz * 6, life: [0.25, 0.5], seed: (o.seed || 5) + 3 });
    g.save(); g.globalCompositeOperation = "lighter";
    for (const s of sp) { g.globalAlpha = s.alpha; g.strokeStyle = "#FFE29A"; g.lineWidth = 3; g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x - (s.x - cx) * 0.08, s.y - (s.y - cy) * 0.08); g.stroke(); }
    g.restore();
  };
  /** minérios saltando do bloco e voando em arco até um alvo (contador). Retorna nº que já chegou. */
  ART.oresVoando = (g, t, o) => {
    const { t0, de, ate, tipos = ["prata", "prata", "ouro", "cobre"], n = 8, seed = 12, r = 22, dur = 0.9 } = o;
    const rr = ART.rng(seed); let chegou = 0;
    for (let i = 0; i < n; i++) {
      const delay = i * 0.05 + rr() * 0.05, kx = (rr() - 0.5) * 2, up = 0.6 + rr() * 0.5, tipo = tipos[i % tipos.length];
      const k = (t - t0 - delay) / dur;
      if (k < 0) continue;
      if (k >= 1) { chegou++; continue; }
      // fase 1 (0..0.35): salta para cima; fase 2: voa até o alvo
      let x, y, s = 1;
      const pop = [de[0] + kx * 140, de[1] - 160 * up];
      if (k < 0.35) { const q = ART.ease.outCubic(k / 0.35); x = lerp(de[0], pop[0], q); y = lerp(de[1], pop[1], q) ; }
      else { const q = ART.ease.inCubic((k - 0.35) / 0.65); x = lerp(pop[0], ate[0], q); y = lerp(pop[1], ate[1], q) - Math.sin(q * Math.PI) * 120; s = 1 - q * 0.55; }
      ART.pepita(g, x, y, r * s, tipo, t * 6 + i, { seed: i + 1, brilho: 0.35 });
    }
    return chegou;
  };

  // ================================================================== MINA 1
  /** cenário da mina 1 (pedra cinza-bege): parede do fosso ao fundo, chão em grade, luz de cima.
   *  o = {luz: 0..1 (feixe de cima), lanternas: true, carrinho: true} */
  ART.cenas = ART.cenas || {};
  ART.cenas.mina = (o = {}) => {
    const tex = ART.texVoronoi("mina", { seed: 7, n: 34 });
    const texW = ART.texVoronoi("minaParede", { seed: 21, n: 30, cores: ["#6E6A62", "#8A8373", "#4F4C4A"], junta: "#2E2B2C" });
    const ZW = 8.2; // parede do fundo
    const fundo = [
      // céu/fundo escuro + parede de blocos do fosso
      ART.camadaEstatica("mina:parede", 0.45, gg => {
        gg.fillStyle = ART.lg(gg, 0, -160, 0, 1100, [[0, "#121020"], [0.5, "#2A2534"], [1, "#4A4440"]]); gg.fillRect(-160, -160, W + 320, H + 320);
        const s = ART.projEscala(ZW), yb = ART.proj(0, 0, ZW)[1];
        for (let row = 0; row < 10; row++) for (let col = -8; col <= 8; col++) {
          const x0 = ART.proj(col, 0, ZW)[0], y0 = yb - (row + 1) * s;
          const q = [[x0, y0], [x0 + s, y0], [x0 + s, y0 + s], [x0, y0 + s]];
          const dark = clamp(row / 7);
          ART.quadTex(gg, q, texW, { ou: col * 0.31 + row * 0.17, ov: row * 0.23, tint: `rgba(14,10,26,${0.3 + dark * 0.6})` });
          gg.strokeStyle = "rgba(10,8,16,.55)"; gg.lineWidth = 3; gg.strokeRect(x0, y0, s, s);
          // minério na parede
          const h = ART.hash(col * 13 + row * 7, 2);
          if (h > 0.86 && row < 5) ART.pepita(gg, x0 + s * (0.3 + 0.4 * ART.hash(col, row)), y0 + s * 0.5, s * 0.1, h > 0.95 ? "ouro" : "cobre", h * 6, { seed: col + row });
        }
        // degraus/patamar do fosso (blocos mais perto, lado esquerdo e direito)
        for (const [cx, rows] of [[-5, 3], [-4, 2], [4, 2], [5, 3]]) for (let rr2 = 0; rr2 < rows; rr2++) ART.cubo(gg, cx, ZW - 1.0, { tex: texW, y: rr2, seed: cx * 3 + rr2 });
        // névoa na base da parede
        gg.fillStyle = ART.lg(gg, 0, yb - 260, 0, yb + 40, [[0, "rgba(150,130,120,0)"], [1, "rgba(150,130,120,.28)"]]); gg.fillRect(-160, yb - 260, W + 320, 300);
      }, { blur: 2.2, res: 0.75 }),
      // chão em grade (perspectiva): parte de trás nítida, parte da frente desfocada (profundidade de campo)
      ART.camadaEstatica("mina:chao", 1, gg => chao(gg, 1.9, ZW, tex)),
    ];
    const chaoPerto = ART.camadaEstatica("mina:chaoPerto", 1, gg => {
      chao(gg, 0.6, 2.9, tex);
      gg.fillStyle = ART.lg(gg, 0, 1150, 0, 1920, [[0, "rgba(10,8,16,.1)"], [0.4, "rgba(10,8,16,.5)"], [1, "rgba(10,8,16,.75)"]]); gg.fillRect(-160, 1150, W + 320, 930);
      // borda superior esfumada (funde com o chão nítido)
      const yb = ART.proj(0, 0, 2.6)[1];
      gg.globalCompositeOperation = "destination-in";
      gg.fillStyle = ART.lg(gg, 0, yb - 20, 0, yb + 110, [[0, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,1)"]]); gg.fillRect(-160, -160, W + 320, H + 320);
      gg.globalCompositeOperation = "source-over";
    }, { blur: 5, res: 0.6 });
    fundo.push(chaoPerto);
    // carrinho de mina ao fundo (mid)
    if (o.carrinho !== false) fundo.splice(1, 0, ART.camadaEstatica("mina:carrinho", 0.7, gg => {
      const [x, y] = ART.proj(-3.2, 0, 6.2), s = ART.projEscala(6.2);
      carrinho(gg, x, y, s * 1.05);
      // pilha de pedras/minério
      for (let i = 0; i < 9; i++) ART.pepita(gg, x + 30 + (i % 3) * 22 - 20, y - s * 0.62 - Math.floor(i / 3) * 14, s * 0.1, i % 4 ? "pedra" : "prata", i, { seed: i });
    }, { blur: 1.2, res: 0.8 }));
    const frente = [
      // pedras desfocadas no primeiro plano (cantos)
      ART.camadaEstatica("mina:frente", 1.6, gg => {
        for (const [x, y, r, s] of [[-40, 1880, 260, 3], [1130, 1760, 230, 4], [980, 1960, 300, 5], [60, 1700, 120, 6]]) {
          rocha(gg, x, y, r, s);
        }
      }, { blur: 16, res: 0.5 }),
    ];
    const luz = (g, t, cam) => {
      // feixe de luz de cima (do buraco do fosso)
      const k = o.luz ?? 1;
      if (k > 0) {
        const sway = Math.sin(t * 0.4) * 1.5;
        ART.beam(g, 200 - (cam.x || 0) * 0.3, -150, 70 + sway, 1750, 240, 700, "#FFE3B0", 0.5 * k);
        ART.beam(g, 470 - (cam.x || 0) * 0.3, -150, 74 + sway, 1500, 120, 380, "#FFE3B0", 0.32 * k);
      }
      ART.dust(g, t, { count: 70, seed: 3, color: "#FFE6B8", y: 0, h: 1400, alpha: 0.5 });
      // lanternas penduradas (bokeh) na parede do fundo
      if (o.lanternas !== false) for (const [x, y] of [[170, 640], [870, 600], [520, 470]]) {
        const fl = 0.85 + 0.15 * ART.noise(t * 3 + x, 2);
        ART.glow(g, x - (cam.x || 0) * 0.45, y, 120, "#FFB548", 0.55 * fl);
        ART.glow(g, x - (cam.x || 0) * 0.45, y, 26, "#FFF0C8", 0.9 * fl);
      }
      // gradação de cor: sombras puxando para o roxo do jogo
      ART.tom(g, [[0, "rgba(40,24,80,.28)"], [0.5, "rgba(40,24,80,0)"], [1, "rgba(14,8,28,.35)"]]);
    };
    return { fundo, frente, luz, pj: PJ, tex };
  };

  function chao(gg, z0, z1, tex) {
    const zs = []; for (let z = Math.floor(z0 * 10) / 10; z < z1; z += 1) zs.push(z);
    for (let zi = zs.length - 1; zi >= 0; zi--) {
      const z = zs[zi];
      for (let x = -9; x <= 8; x++) {
        const q = [ART.proj(x, 0, z + 1), ART.proj(x + 1, 0, z + 1), ART.proj(x + 1, 0, z), ART.proj(x, 0, z)];
        const fog = clamp((z - 2) / 7), hv = ART.hash(x * 7 + z * 3, 9);
        ART.quadTex(gg, q, tex, { ou: x * 0.37 + z * 0.11, ov: z * 0.29, tint: `rgba(${lerp(20, 58, fog)},${lerp(14, 48, fog)},${lerp(30, 62, fog)},${0.12 + fog * 0.5 + hv * 0.12})` });
        ART.poly(gg, q); gg.strokeStyle = `rgba(16,12,20,${0.7 - fog * 0.3})`; gg.lineWidth = lerp(5, 1.5, fog); gg.stroke();
        // aresta clara (bloco cúbico): luz na borda de trás
        gg.beginPath(); gg.moveTo(...q[0]); gg.lineTo(...q[1]); gg.strokeStyle = `rgba(255,236,210,${0.12 - fog * 0.08})`; gg.lineWidth = 2; gg.stroke();
        // lascas de prata deitadas no chão (como no trailer)
        const h = ART.hash(x * 31 + z * 17, 5);
        if (h > 0.72) {
          const u = 0.25 + 0.5 * ART.hash(x, z), v = 0.3 + 0.4 * ART.hash(z, x);
          const [px, py] = ART.proj(x + u, 0, z + v), sc = ART.projEscala(z + v);
          gg.save(); gg.translate(px, py); gg.scale(1, 0.42);
          ART.pepita(gg, 0, 0, sc * 0.06, h > 0.97 ? "ouro" : h > 0.93 ? "cobre" : "prata", (h * 9) % 1.2 - 0.6, { seed: x + z });
          gg.restore();
        }
      }
    }
    gg.fillStyle = ART.lg(gg, 0, ART.proj(0, 0, z1)[1], 0, ART.proj(0, 0, z1)[1] + 160, [[0, "rgba(40,34,44,.55)"], [1, "rgba(40,34,44,0)"]]); gg.fillRect(-160, ART.proj(0, 0, z1)[1], W + 320, 160);
  }
  function carrinho(g, x, y, s) {
    // vagonete de mina em perspectiva frontal-lateral
    g.save(); g.translate(x, y);
    const w = s * 1.1, h = s * 0.55;
    ART.poly(g, [[-w / 2, -h - s * 0.1], [w / 2, -h - s * 0.1], [w / 2 - s * 0.1, -s * 0.12], [-w / 2 + s * 0.1, -s * 0.12]]);
    g.fillStyle = ART.lg(g, 0, -h, 0, 0, [[0, "#6B5A52"], [1, "#3A302E"]]); g.fill();
    g.fillStyle = "#2A2224"; g.fillRect(-w / 2, -h - s * 0.12, w, s * 0.06);
    g.fillStyle = "rgba(255,220,180,.18)"; g.fillRect(-w / 2 + s * 0.1, -h + s * 0.05, w - s * 0.2, s * 0.04);
    for (const xx of [-w * 0.3, w * 0.3]) { ART.circ(g, xx, -s * 0.1, s * 0.11); g.fillStyle = "#231C1E"; g.fill(); ART.circ(g, xx, -s * 0.1, s * 0.04); g.fillStyle = "#77655C"; g.fill(); }
    g.restore();
  }
  function rocha(g, x, y, r, seed) {
    const rr = ART.rng(seed), n = 7, pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pts.push([x + Math.cos(a) * r * (0.7 + rr() * 0.4), y + Math.sin(a) * r * (0.6 + rr() * 0.3)]); }
    ART.poly(g, pts); g.fillStyle = ART.lg(g, x, y - r, x, y + r, [[0, "#4A4250"], [1, "#16121C"]]); g.fill();
    ART.poly(g, [pts[3], pts[4], pts[5], [x, y]]); g.fillStyle = "rgba(255,220,180,.10)"; g.fill();
  }
  ART.rocha = rocha;
  ART.carrinho = carrinho;
})();
