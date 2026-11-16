/* MAGMA DIG — kit de arte: peças novas da Parte 2 ("A seta").
 * Faixa EM ALTA HOJE, etiqueta de preço que racha, cartão de cliente da Dona Coruja (+ retrato), barras ENTREGAR × VENDER,
 * gráfico de linha blueprint (1929 / 1987) e o desenho em linhas da especulação (pata com moeda -> Zeca com pepita).
 * Tudo função pura de t / progresso. Nada aqui altera peça da Parte 1.
 */
(function () {
  const ART = window.ART, UI = ART.ui, { clamp, lerp } = ART;
  const F = (px, w = 900) => `${w} ${px}px "Nunito"`;
  const W = 1080;
  const mede = (g, s, font) => { g.save(); g.font = font; const w = g.measureText(s).width; g.restore(); return w; };

  // ================================================================= faixa EM ALTA HOJE (Mercado)
  /** faixa dourada "EM ALTA HOJE: <minério> +50%" (como a linha "Em alta hoje" do jogo). x,y = centro.
   *  o = {minerio: 'ferro'|'cobre'|... | null (vazia), nome, pct (50), k (0..1 acende), mk (0..1 entrada do minério), brilho (0..1 posição da varredura de luz; omitido = sem), w (900), s, a} */
  UI.faixaAlta = (g, x, y, o = {}) => {
    const s = o.s || 1, w = (o.w || 900) * s, h = 104 * s, x0 = x - w / 2, y0 = y - h / 2, k = clamp(o.k ?? 1), mk = clamp(o.mk ?? 1);
    g.save(); g.globalAlpha *= o.a ?? 1;
    if (k > 0) ART.glow(g, x, y, w * 0.62, "#FFC531", 0.35 * k);
    UI.cartao(g, x0, y0, w, h, { r: h / 2, cor: "rgba(28,24,40,.92)", borda: ART.rgba("#FFD23F", 0.35 + 0.4 * k), bw: 3 * s, sombra: false });
    if (k > 0) {
      g.save(); g.globalAlpha *= k; ART.rr(g, x0, y0, w, h, h / 2);
      g.fillStyle = ART.lg(g, 0, y0, 0, y0 + h, [[0, "#FFE58A"], [0.5, "#FFD23F"], [1, "#E8A21E"]]); g.fill();
      ART.rr(g, x0 + 14 * s, y0 + 8 * s, w - 28 * s, h * 0.3, h * 0.15); g.fillStyle = "rgba(255,255,255,.3)"; g.fill();
      ART.rr(g, x0, y0, w, h, h / 2); g.lineWidth = 4 * s; g.strokeStyle = "#B07A0C"; g.stroke(); g.restore();
    }
    const tc = ART.mix("#C9B27A", "#2A1E08", k);
    g.textBaseline = "middle"; g.textAlign = "left"; g.font = F(42 * s, 1000); g.fillStyle = tc; g.letterSpacing = 2 * s + "px";
    g.fillText("EM ALTA HOJE:", x0 + 44 * s, y + 3 * s); g.letterSpacing = "0px";
    const xr = x0 + w - 30 * s;
    if (o.minerio && mk > 0) {
      const pct = `+${o.pct ?? 50}%`, nome = (o.nome || o.minerio).toUpperCase();
      const pw = mede(g, pct, F(40 * s, 1000)) + 40 * s, ph = 64 * s, sc = ART.ease.outBack(mk);
      g.save(); g.globalAlpha *= clamp(mk * 2); g.translate(xr - pw / 2, y); g.scale(sc, sc); g.translate(-(xr - pw / 2), -y);
      ART.rr(g, xr - pw, y - ph / 2, pw, ph, ph / 2); g.fillStyle = "#1E2A14"; g.fill();
      g.font = F(40 * s, 1000); g.fillStyle = "#7BEA6A"; g.textAlign = "center"; g.fillText(pct, xr - pw / 2, y + 3 * s);
      const nx = xr - pw - 22 * s; g.font = F(48 * s, 1000); g.textAlign = "right"; g.fillStyle = ART.mix("#F4EEDC", "#2A1E08", k); g.fillText(nome, nx, y + 3 * s);
      UI.pix(g, o.minerio, nx - mede(g, nome, F(48 * s, 1000)) - 38 * s, y, 54 * s);
      g.restore();
    } else {
      // vaga vazia: tracejado com "?"
      const vw = 300 * s, vh = 64 * s; ART.rr(g, xr - vw, y - vh / 2, vw, vh, vh / 2); g.setLineDash([10 * s, 8 * s]); g.lineWidth = 4 * s; g.strokeStyle = ART.rgba(ART.mix("#C9B27A", "#6A4A08", k), 0.8); g.stroke(); g.setLineDash([]);
      g.font = F(44 * s, 1000); g.textAlign = "center"; g.fillStyle = ART.rgba(ART.mix("#C9B27A", "#6A4A08", k), 0.9); g.fillText("?", xr - vw / 2, y + 3 * s);
    }
    if (o.brilho != null) {  // varredura de luz
      const bx = lerp(x0 - 160 * s, x0 + w + 160 * s, clamp(o.brilho));
      g.save(); ART.rr(g, x0, y0, w, h, h / 2); g.clip(); g.globalCompositeOperation = "lighter";
      g.translate(bx, y); g.transform(1, 0, -0.45, 1, 0, 0);
      g.fillStyle = ART.lg(g, -90 * s, 0, 90 * s, 0, [[0, "rgba(255,255,255,0)"], [0.5, "rgba(255,255,255,.75)"], [1, "rgba(255,255,255,0)"]]); g.fillRect(-90 * s, -h, 180 * s, h * 2);
      g.restore();
      ART.glow(g, bx, y, 120 * s, "#FFF4CC", 0.5 * Math.sin(Math.PI * clamp(o.brilho)));
    }
    g.restore();
    return { x0, y0, w, h };
  };

  // ================================================================= etiqueta de preço que racha (p203)
  /** etiqueta de papel com o preço; racha ao meio e vira o preço novo. x,y = centro.
   *  o = {de (40), para (20), k (0..1: 0–0,35 racha · 0,35–0,7 metades caem · 0,5–1 etiqueta nova entra), s, rot (graus), corNovo} */
  UI.etiquetaPreco = (g, x, y, o = {}) => {
    const s = o.s || 1, k = clamp(o.k ?? 0), w = 380 * s, h = 200 * s, de = String(o.de ?? 40), para = String(o.para ?? 20);
    const forma = gg => { gg.beginPath(); gg.moveTo(-w / 2 + 60 * s, -h / 2); gg.lineTo(w / 2, -h / 2); gg.lineTo(w / 2, h / 2); gg.lineTo(-w / 2 + 60 * s, h / 2); gg.lineTo(-w / 2, 0); gg.closePath(); };
    const tag = (txt, cor, racha, metade) => {
      g.save(); g.shadowColor = "rgba(0,0,0,.5)"; g.shadowBlur = 30 * s; g.shadowOffsetY = 12 * s;
      forma(g); g.fillStyle = "#EDE3CC"; g.fill(); g.shadowColor = "transparent";
      forma(g); g.lineWidth = 5 * s; g.strokeStyle = "#C9B998"; g.stroke();
      ART.circ(g, -w / 2 + 52 * s, 0, 16 * s); g.fillStyle = "#3A3036"; g.fill();
      UI.pix(g, "moeda", -w / 2 + 125 * s, 0, 58 * s);
      g.font = F(120 * s, 1000); g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = cor; g.fillText(txt, 60 * s, 8 * s);
      if (racha > 0) { // rachadura em zigue-zague de cima para baixo
        const pts = [[10, -100], [-14, -60], [16, -28], [-10, 6], [18, 40], [-6, 72], [8, 100]].map(([a, b]) => [a * s + 40 * s, b * s]);
        const n = (pts.length - 1) * racha; g.beginPath(); g.moveTo(...pts[0]);
        for (let i = 1; i <= Math.ceil(n); i++) { const f = Math.min(1, n - (i - 1)), p0 = pts[i - 1], p1 = pts[i]; g.lineTo(lerp(p0[0], p1[0], f), lerp(p0[1], p1[1], f)); }
        g.lineWidth = 7 * s; g.strokeStyle = "#2A1E1A"; g.lineJoin = "round"; g.stroke();
      }
      g.restore();
    };
    g.save(); g.translate(x, y); g.rotate(ART.deg(o.rot ?? -6));
    const racha = ART.prog(k, 0, 0.35, "outCubic"), cai = ART.prog(k, 0.35, 0.75, "inCubic"), novo = ART.prog(k, 0.5, 0.85);
    if (cai < 1) for (const lado of [-1, 1]) {
      g.save(); g.globalAlpha *= 1 - cai;
      g.translate(lado * 80 * s * cai, 260 * s * cai * cai); g.rotate(lado * 0.5 * cai);
      g.beginPath(); if (lado < 0) g.rect(-w, -h, w + 40 * s, h * 2); else g.rect(40 * s, -h, w, h * 2); g.clip();
      tag(de, "#2A2236", racha, lado); g.restore();
    }
    if (novo > 0) { const sc = ART.ease.outBack(novo); g.save(); g.globalAlpha *= clamp(novo * 2); g.scale(sc, sc); tag(para, o.corNovo || "#E63748", 0); g.restore(); }
    g.restore();
  };

  // ================================================================= coração (amizade)
  /** coraçãozinho que enche de baixo para cima. x,y = centro; r ≈ meia largura. o = {cheio 0..1, cor, s} */
  UI.coracao = (g, x, y, r, o = {}) => {
    const k = clamp(o.cheio ?? 1), cor = o.cor || "#FF5A8A";
    const path = () => { g.beginPath(); g.moveTo(0, r * 0.95); g.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.75, -r * 1.15, 0, -r * 0.45); g.bezierCurveTo(r * 0.75, -r * 1.15, r * 1.4, -r * 0.1, 0, r * 0.95); g.closePath(); };
    g.save(); g.translate(x, y);
    path(); g.fillStyle = "rgba(255,255,255,.1)"; g.fill();
    if (k > 0) { g.save(); path(); g.clip(); const yk = lerp(r, -r * 1.05, k); g.fillStyle = ART.lg(g, 0, -r, 0, r, [[0, ART.shade(cor, 0.3)], [1, cor]]); g.fillRect(-r * 1.5, yk, r * 3, r * 3); g.restore(); }
    path(); g.lineWidth = Math.max(2, r * 0.16); g.strokeStyle = k > 0 ? ART.shade(cor, -0.35) : "rgba(255,255,255,.35)"; g.lineJoin = "round"; g.stroke();
    if (k >= 1) { ART.ell(g, -r * 0.4, -r * 0.35, r * 0.18, r * 0.12, -0.6); g.fillStyle = "rgba(255,255,255,.7)"; g.fill(); }
    g.restore();
  };

  // ================================================================= Dona Coruja (retrato)
  /** retrato da Dona Coruja (cliente do jogo, amiga — nunca vilã): coruja bege de óculos redondos, olhos laranja, bico pequeno,
   *  penugem clara no peito, xale lilás. x,y = centro; tam = lado do quadro.
   *  o = {t (pisca sozinha), pisca (0..1 força o piscar), sorriso (0..1: olhos felizes + bochechas), olhar:[dx,dy] (-1..1), fundo (true), blinkSeed} */
  UI.coruja = (g, x, y, tam, o = {}) => {
    const s = tam / 200, t = o.t ?? 0, sr = clamp(o.sorriso ?? 0.3);
    let pis = o.pisca;
    if (pis == null) { const per = 3.1, ph = ((t + (o.blinkSeed ?? 0.7)) % per + per) % per; pis = ph < 0.16 ? Math.sin((ph / 0.16) * Math.PI) : 0; }
    const [lx, ly] = o.olhar || [0, 0];
    g.save(); g.translate(x, y); g.scale(s, s);
    if (o.fundo !== false) {
      ART.rr(g, -100, -100, 200, 200, 34); g.fillStyle = ART.lg(g, 0, -100, 0, 100, [[0, "#E8C9A0"], [1, "#CFA77A"]]); g.fill();
      ART.rr(g, -100, -100, 200, 200, 34); g.clip();
    }
    const corpo = "#9C7048", cab = "#B88A5C", disco = "#F0DCBE", esc = "#7A5434";
    // corpo + xale
    ART.ell(g, 0, 118, 92, 70); g.fillStyle = corpo; g.fill();
    ART.ell(g, 0, 112, 46, 44); g.fillStyle = "#F3E6D0"; g.fill();                     // peito claro
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.arc(i * 16, 100 + Math.abs(i) * 4, 9, 0.2, Math.PI - 0.2); g.lineWidth = 3; g.strokeStyle = "rgba(160,120,80,.45)"; g.stroke(); }
    g.beginPath(); g.moveTo(-96, 86); g.quadraticCurveTo(-50, 70, -26, 104); g.lineTo(-40, 140); g.lineTo(-100, 140); g.closePath(); g.fillStyle = "#9A7FD8"; g.fill();
    g.beginPath(); g.moveTo(96, 86); g.quadraticCurveTo(50, 70, 26, 104); g.lineTo(40, 140); g.lineTo(100, 140); g.closePath(); g.fillStyle = "#9A7FD8"; g.fill();
    ART.circ(g, 0, 104, 9); g.fillStyle = "#FFD23F"; g.fill();                       // broche
    // cabeça (redonda, levemente inclinada) + tufos
    g.save(); g.rotate(ART.deg(-4 + 3 * Math.sin(t * 1.3)));
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * 40, -58); g.quadraticCurveTo(sx * 66, -98, sx * 84, -96); g.quadraticCurveTo(sx * 80, -64, sx * 66, -40); g.closePath(); g.fillStyle = esc; g.fill(); }
    ART.ell(g, 0, -6, 84, 76); g.fillStyle = ART.rg(g, -20, -40, 10, 110, [[0, ART.shade(cab, 0.12)], [1, cab]]); g.fill();
    // disco facial (dois lóbulos claros)
    for (const sx of [-1, 1]) { ART.ell(g, sx * 30, 2, 44, 46); g.fillStyle = disco; g.fill(); }
    g.beginPath(); g.moveTo(-14, -40); g.quadraticCurveTo(0, -30, 14, -40); g.lineWidth = 4; g.strokeStyle = "rgba(120,80,50,.5)"; g.stroke();   // "V" da testa
    // bochechas
    for (const sx of [-1, 1]) { ART.ell(g, sx * 50, 34, 15, 9); g.fillStyle = ART.rgba("#EE8C8C", 0.35 + 0.4 * sr); g.fill(); }
    // olhos atrás dos óculos
    for (const sx of [-1, 1]) {
      const ex = sx * 30, ey = 0;
      ART.circ(g, ex, ey, 24); g.fillStyle = "#FFFFFF"; g.fill();
      if (sr > 0.75) { // olhos felizes (^ ^)
        g.beginPath(); g.arc(ex, ey + 8, 15, Math.PI * 1.15, Math.PI * 1.85); g.lineWidth = 7; g.lineCap = "round"; g.strokeStyle = "#3A2418"; g.stroke();
      } else {
        g.save(); ART.circ(g, ex, ey, 24); g.clip();
        ART.circ(g, ex + lx * 6, ey + ly * 5, 16); g.fillStyle = ART.rg(g, ex, ey, 2, 16, [[0, "#FFC94A"], [1, "#E88A1A"]]); g.fill();
        ART.circ(g, ex + lx * 7, ey + ly * 6, 8.5); g.fillStyle = "#1A1014"; g.fill();
        ART.circ(g, ex + lx * 6 - 5, ey + ly * 5 - 6, 4.5); g.fillStyle = "#FFFFFF"; g.fill();
        // pálpebra (pisca)
        if (pis > 0) { g.fillStyle = cab; g.fillRect(ex - 26, ey - 26, 52, 52 * pis); g.beginPath(); g.moveTo(ex - 24, ey - 24 + 50 * pis); g.lineTo(ex + 24, ey - 24 + 50 * pis); g.lineWidth = 3.5; g.strokeStyle = esc; g.stroke(); }
        g.restore();
      }
    }
    // óculos redondos dourados
    g.lineWidth = 6; g.strokeStyle = "#C08A28";
    for (const sx of [-1, 1]) { ART.circ(g, sx * 30, 0, 27); g.stroke(); ART.ell(g, sx * 30 - 9, -10, 7, 4, -0.6); g.fillStyle = "rgba(255,255,255,.55)"; g.fill(); }
    g.beginPath(); g.moveTo(-4, -3); g.quadraticCurveTo(0, -8, 4, -3); g.stroke();
    // bico + sorriso
    g.beginPath(); g.moveTo(-10, 26); g.quadraticCurveTo(0, 22, 10, 26); g.quadraticCurveTo(4, 40, 0, 44); g.quadraticCurveTo(-4, 40, -10, 26); g.closePath(); g.fillStyle = "#F0A238"; g.fill();
    g.beginPath(); g.moveTo(-8, 28); g.quadraticCurveTo(0, 26, 8, 28); g.lineWidth = 2; g.strokeStyle = "rgba(255,255,255,.6)"; g.stroke();
    if (sr > 0) { g.beginPath(); g.moveTo(-26, 34); g.quadraticCurveTo(-16, 40 + 6 * sr, -9, 36); g.moveTo(26, 34); g.quadraticCurveTo(16, 40 + 6 * sr, 9, 36); g.lineWidth = 3.5; g.lineCap = "round"; g.strokeStyle = ART.rgba("#7A4A2A", 0.5 + 0.5 * sr); g.stroke(); }
    g.restore();
    g.restore();
  };

  // ================================================================= cartão de cliente (aba CLIENTES)
  /** cartão de cliente no estilo da aba Clientes do jogo (shot_5), redesenhado para o Reel. x,y = centro; tamanho 940×500·s.
   *  o = {s, t, nome ('Dona Coruja'), amizade (0..n: o coração enche na parte fracionária; 0 -> 1 = "vira amiga"),
   *       bonus (0..1 mostra a linha de bônus), bonusTexto ('bônus no preço de venda'), brilhoBonus (0..1),
   *       pedido {tem: 0, precisa: 4, tipo: 'cobre', nome: 'Cobre'}, recompensa (160), recompensaK (0..1 destaque),
   *       botaoK (0..1: ENTREGAR cinza -> amarelo), press (0..1), pisca, sorriso, olhar, a, vidro}
   *  -> {x0, y0, w, h, retrato:[x,y], botao:[x,y], recompensa:[x,y], amizade:[x,y]} */
  UI.cartaoCliente = (g, x, y, o = {}) => {
    const s = o.s || 1, w = 940 * s, h = 500 * s, x0 = x - w / 2, y0 = y - h / 2, t = o.t ?? 0;
    const am = Math.max(0, o.amizade ?? 0), nAm = Math.floor(am + 1e-6), frac = am - nAm, cheio = frac > 1e-3 ? frac : nAm > 0 ? 1 : 0;
    const ped = Object.assign({ tem: 0, precisa: 4, tipo: "cobre", nome: "Cobre" }, o.pedido || {});
    g.save(); g.globalAlpha *= o.a ?? 1;
    UI.cartao(g, x0, y0, w, h, { r: 36 * s, cor: o.vidro ? "rgba(33,30,51,.86)" : "#211E33", borda: "#3E3858", bw: 3.5 * s, vidro: o.vidro });
    // retrato
    const rx = x0 + 40 * s + 115 * s, ry = y0 + 40 * s + 115 * s;
    g.save(); g.shadowColor = "rgba(0,0,0,.45)"; g.shadowBlur = 24 * s; g.shadowOffsetY = 10 * s; ART.rr(g, rx - 115 * s, ry - 115 * s, 230 * s, 230 * s, 40 * s); g.fillStyle = "#CFA77A"; g.fill(); g.restore();
    UI.coruja(g, rx, ry, 230 * s, { t, pisca: o.pisca, sorriso: o.sorriso, olhar: o.olhar, blinkSeed: o.blinkSeed });
    // nome
    const tx = x0 + 300 * s;
    g.textBaseline = "middle"; g.textAlign = "left";
    g.font = F(60 * s, 1000); g.fillStyle = "#F4EEDC"; g.fillText(o.nome || "Dona Coruja", tx, y0 + 82 * s);
    // amizade: coração + número (pula quando muda)
    const pop = nAm > 0 && frac < 1e-3 ? 0 : 0, pulo = o.amizadePulso || 0;
    const ax = tx + 26 * s, ay = y0 + 154 * s, cs = 1 + 0.25 * pulo + pop;
    g.save(); g.translate(ax, ay); g.scale(cs, cs); UI.coracao(g, 0, 2 * s, 24 * s, { cheio }); g.restore();
    if (cheio > 0) ART.glow(g, ax, ay, 70 * s, "#FF5A8A", 0.25 * cheio + 0.3 * pulo);
    const ae = o.amizadeEscala ?? 1;   // Parte 2 (correção): "amizade N" maior (ex. 1.25)
    g.font = F(42 * s * ae, 900); g.fillStyle = ae > 1 ? "#DCD6F4" : "#C9C3E8"; g.fillText("amizade " + nAm, ax + 44 * s + (ae - 1) * 10 * s, ay + 3 * s);
    // bônus (sem número)
    const bk = clamp(o.bonus ?? 0);
    if (bk > 0) {
      g.save(); g.globalAlpha *= bk; g.font = F(36 * s, 900); g.fillStyle = "#7BEA6A"; g.fillText("+ " + (o.bonusTexto || "bônus no preço de venda"), tx, y0 + 220 * s);
      if (o.brilhoBonus) ART.glow(g, tx + 230 * s, y0 + 220 * s, 300 * s, "#5FD35F", 0.35 * o.brilhoBonus); g.restore();
    }
    // divisória
    g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(x0 + 34 * s, y0 + 290 * s, w - 68 * s, 3 * s);
    // pedido
    const py = y0 + 360 * s, pk = clamp(o.pedidoK ?? 1);   // pedidoK 0 = linha do pedido escondida
    if (pk > 0) { g.save(); g.globalAlpha *= pk;
    ART.rr(g, x0 + 34 * s, py - 42 * s, 84 * s, 84 * s, 20 * s); g.fillStyle = "#2A2640"; g.fill();
    UI.pix(g, ped.tipo, x0 + 76 * s, py, 56 * s);
    g.font = F(54 * s, 1000); g.fillStyle = "#F4EEDC"; const pedTxt = `${ped.tem}/${ped.precisa}`; g.fillText(pedTxt, x0 + 140 * s, py + 3 * s);
    g.font = F(46 * s, 900); g.fillStyle = "#C9C3E8"; g.fillText(ped.nome, x0 + 140 * s + mede(g, pedTxt + " ", F(54 * s, 1000)), py + 4 * s);
    g.restore(); }
    // recompensa
    const qy = y0 + 440 * s, rk = clamp(o.recompensaK ?? 1), rTxt = `+${ART.num(o.recompensa ?? 160)}`;
    const ra = clamp(o.recompensaA ?? 1);   // recompensaA 0 = linha da recompensa escondida (recompensaK continua sendo o destaque)
    if (ra > 0) {
    g.save(); g.globalAlpha *= (0.45 + 0.55 * rk) * ra;
    if (rk > 0 && o.recompensaK != null) ART.glow(g, x0 + 230 * s, qy, 240 * s, "#FFD23F", 0.45 * rk * (0.8 + 0.2 * Math.sin(t * 6)));
    UI.pix(g, "moeda", x0 + 76 * s, qy, 50 * s);
    const rsc = 1 + 0.12 * (o.recompensaK != null ? Math.sin(Math.PI * clamp(rk)) : 0);
    g.save(); g.translate(x0 + 140 * s, qy); g.scale(rsc, rsc);
    g.font = F(54 * s, 1000); g.fillStyle = "#FFD23F"; g.fillText(rTxt, 0, 3 * s);
    g.font = F(40 * s, 900); g.fillStyle = "#E8DCA8"; g.fillText(" moedas", mede(g, rTxt, F(54 * s, 1000)), 5 * s); g.restore();
    g.restore(); }
    // botão ENTREGAR (cinza como no jogo -> amarelo quando dá para entregar)
    const bxc = x0 + w - 190 * s, byc = y0 + 395 * s, bk2 = clamp(o.botaoK ?? 0);
    if (bk2 < 1) UI.botao(g, bxc, byc, 300 * s, 112 * s, { texto: "ENTREGAR", cor: "roxo", press: o.press || 0, a: 1 - bk2 });
    if (bk2 > 0) UI.botao(g, bxc, byc, 300 * s, 112 * s, { texto: "ENTREGAR", cor: "amarelo", press: o.press || 0, a: bk2 });
    g.restore();
    return { x0, y0, w, h, retrato: [rx, ry], botao: [bxc, byc + 10 * s], recompensa: [x0 + 230 * s, qy], amizade: [ax, ay] };
  };

  // ================================================================= barras ENTREGAR × VENDER (p261)
  /** barras verticais lado a lado que crescem. o = {itens: [{rotulo, valor, cor}], max (maior valor), k (0..1 crescimento; a 2ª barra atrasa),
   *  x (centro, 540), base (y da base, 1120), alt (altura da maior, 560), larg (250), gap (150), s} */
  UI.barrasComparar = (g, o = {}) => {
    const it = o.itens || [{ rotulo: "ENTREGAR", valor: 160, cor: "#8E7BE0" }, { rotulo: "VENDER", valor: 240, cor: "#FFD23F" }];
    const s = o.s || 1, mx = o.max || Math.max(...it.map(i => i.valor)), base = o.base ?? 1120, alt = (o.alt ?? 560) * s, lw = (o.larg ?? 250) * s, gap = (o.gap ?? 150) * s, cx = o.x ?? 540;
    const tot = it.length * lw + (it.length - 1) * gap, k = clamp(o.k ?? 1);
    g.save(); g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(cx - tot / 2 - 40 * s, base, tot + 80 * s, 5 * s); g.restore();
    it.forEach((b, i) => {
      const ki = ART.prog(k, i * 0.3, i * 0.3 + 0.7, "outCubic"), hh = alt * (b.valor / mx) * ki, bx = cx - tot / 2 + i * (lw + gap), cor = b.cor || "#FFD23F";
      g.save();
      if (hh > 1) {
        g.shadowColor = "rgba(0,0,0,.45)"; g.shadowBlur = 30; g.shadowOffsetY = 12;
        ART.rr(g, bx, base - hh, lw, hh + 2, 26 * s); g.fillStyle = ART.lg(g, 0, base - hh, 0, base, [[0, ART.shade(cor, 0.25)], [1, ART.shade(cor, -0.25)]]); g.fill(); g.shadowColor = "transparent";
        ART.rr(g, bx + 14 * s, base - hh + 12 * s, lw * 0.22, Math.max(0, hh - 30 * s), 12 * s); g.fillStyle = "rgba(255,255,255,.2)"; g.fill();
      }
      // valor no topo (conta junto)
      const v = Math.round(b.valor * ki), txt = ART.num(v);
      g.font = F(76 * s, 1000); const tw = g.measureText(txt).width, iw = 54 * s, tot2 = iw + 14 * s + tw;
      g.globalAlpha *= clamp(ki * 3);
      UI.pix(g, "moeda", bx + lw / 2 - tot2 / 2 + iw / 2, base - hh - 56 * s, iw);
      g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = "#F4EEDC"; g.fillText(txt, bx + lw / 2 - tot2 / 2 + iw + 14 * s, base - hh - 52 * s);
      g.restore();
      g.save(); g.font = F(44 * s, 1000); g.textAlign = "center"; g.textBaseline = "middle"; g.letterSpacing = 2 * s + "px"; g.fillStyle = ART.shade(cor, 0.2); g.fillText(b.rotulo, bx + lw / 2, base + 56 * s); g.restore();
    });
  };

  // ================================================================= C6: gráfico de linha blueprint (Wall Street 1929 e 1987)
  const BP = ART.BP, CORAL = "#FF6B5B";
  const neon = (g, fn, o = {}) => { g.save(); g.strokeStyle = o.cor || BP.linha; g.lineWidth = o.w || 3; g.lineCap = "round"; g.lineJoin = "round"; g.shadowColor = o.cor || BP.linha; g.shadowBlur = o.blur ?? 12; if (o.dash) g.setLineDash(o.dash); g.globalAlpha *= o.a ?? 1; fn(); g.restore(); };
  const rot = (g, txt, x, y, o = {}) => ART.bpRotulo(g, txt, x, y, o);
  /** traça uma polilinha até a fração k do comprimento */
  const traca = (g, pts, k) => {
    if (k <= 0 || pts.length < 2) return; const L = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const alvo = L[L.length - 1] * clamp(k); g.beginPath(); g.moveTo(...pts[0]);
    for (let i = 1; i < pts.length; i++) { if (L[i] <= alvo) g.lineTo(...pts[i]); else { const f = (alvo - L[i - 1]) / (L[i] - L[i - 1] || 1); g.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); break; } }
    g.stroke();
  };
  const elipse = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 64) => { const p = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; };

  // Dow Jones (aprox., fontes em roteiro/fatos-02.md): 63,9 (ago/1921) -> 381,2 (3/set/1929) -> 41,2 (8/jul/1932)
  const DOW = [[1921.6, 63.9], [1922.0, 78], [1922.8, 103], [1923.4, 88], [1924.0, 95], [1924.6, 104], [1925.1, 122], [1925.8, 156], [1926.3, 137], [1926.8, 162], [1927.4, 172], [1927.9, 200],
    [1928.4, 214], [1928.9, 295], [1929.3, 312], [1929.5, 336], [1929.68, 381.2], [1929.8, 300], [1929.87, 198.7], [1930.05, 250], [1930.3, 294], [1930.6, 225], [1930.95, 160], [1931.2, 190],
    [1931.5, 145], [1931.8, 96], [1932.0, 75], [1932.3, 58], [1932.52, 41.2]];
  // outubro de 1987 (fechamentos diários aprox.): 16/out 2.247 -> 19/out 1.739 (−22,6%)
  const OUT87 = [2639, 2641, 2640, 2549, 2551, 2517, 2482, 2471, 2508, 2413, 2355, 2247, 1739, 1841, 2028, 1950, 1950];
  const G = { X0: 200, X1: 900, YT: 520, YB: 960, A0: 1921.6, A1: 1932.52, PICO: 1929.68, OX: 1080 };
  const xA = a => G.X0 + (a - G.A0) / (G.A1 - G.A0) * (G.X1 - G.X0), yV = v => G.YB - v / 400 * (G.YB - G.YT);
  const i87 = i => (i <= 11 ? i : i - 0.75), D87 = i87(16);
  const x87 = i => G.OX + G.X0 + i87(i) / D87 * (G.X1 - G.X0), y87 = v => G.YB - (v - 1500) / 1300 * (G.YB - G.YT);
  /** pontos da série até a "ponta" d (no domínio), com o ponto interpolado no fim */
  const ate = (dom, d) => { const out = []; for (let i = 0; i < dom.length; i++) { if (dom[i][0] <= d) out.push(dom[i]); else { if (i > 0) { const a = dom[i - 1], b = dom[i], f = (d - a[0]) / (b[0] - a[0]); out.push([d, lerp(a[1], b[1], f)]); } break; } } return out; };

  /** gráfico de linha em ciano (inserto de Wall Street, planos 219–229). Desenha o fundo blueprint (fundo:false para não).
   *  o = {prog (0..1: linha 1921→1932 se desenhando; PICO ≈ 0,74), regua (0..1), wallStreet (0..1), x6 (0..1), queda (0..1: −89% coral),
   *       contador (true: ano na ponta da linha), emprestado (0..1: 1 moeda cheia + 9 tracejadas),
   *       prog87 (0..1: 2º gráfico, out/1987; DEGRAU87 ≈ 0,73), rotulo87 (0..1), segunda (0..1: SEGUNDA-FEIRA NEGRA + 1 DIA), queda87 (0..1: −22,6%),
   *       pan (0..1: desliza o conteúdo 1080 px para a esquerda, do 1º para o 2º gráfico), zoom (1), foco [x,y] (px de tela),
   *       apaga (0..1: linhas ciano somem; os números coral ficam), a (opacidade geral, para o dissolve)}
   *  -> {ponta:[x,y] (tela), ponta87:[x,y], ano} */
  ART.ciencia.grafLinha = (g, t, o = {}) => {
    g.save(); g.globalAlpha *= o.a ?? 1;
    if (o.fundo !== false) ART.blueprint(g, t);
    const pan = ART.ease.inOutCubic(clamp(o.pan ?? 0)) * G.OX, z = o.zoom ?? 1, [fx, fy] = o.foco || [540, 760], ap = 1 - clamp(o.apaga ?? 0);
    g.translate(fx, fy); g.scale(z, z); g.translate(-fx - pan, -fy);
    const tela = (x, y) => [(x - pan - fx) * z + fx, (y - fy) * z + fy];
    const res = { ponta: null, ponta87: null, ano: null };
    const TE = o.textoEscala ?? 1, eixoK = a => { const e = o.eixoAnos ?? 1; return typeof e === "object" ? clamp(e[a] ?? 0) : clamp(e); };
    const [qx, qy] = o.posQueda || [875, 468], [wx, wy] = o.posWallStreet || [540, 368];
    // ------------------------------------------------ gráfico 1: 1921–1932
    const p = clamp(o.prog ?? 1), dTip = lerp(G.A0, G.A1, p), regua = clamp(o.regua ?? 1);
    // eixo do tempo
    neon(g, () => { g.beginPath(); g.moveTo(G.X0 - 30, G.YB); g.lineTo(G.X1 + 30, G.YB); g.stroke(); for (let a = 1922; a <= 1932; a++) { g.beginPath(); g.moveTo(xA(a), G.YB); g.lineTo(xA(a), G.YB + (a % 2 ? 10 : 18)); g.stroke(); } }, { w: 2.5, a: ap * 0.9 });
    for (const a of [1921, 1925, 1929, 1932]) { const ek = eixoK(a); if (ek > 0) rot(g, String(a), xA(a + (a === 1921 ? 0.6 : 0)), G.YB + 44 + (TE - 1) * 14, { size: 28 * TE, align: "center", cor: TE > 1 ? "#B8E6F4" : BP.fraca, sp: 1, a: ap * ek }); }
    // régua vertical (valores)
    if (regua > 0) {
      const rx = 150;
      neon(g, () => { g.beginPath(); g.moveTo(rx, G.YB); g.lineTo(rx, lerp(G.YB, G.YT - 20, regua)); g.stroke(); for (let v = 0; v <= 400; v += 50) { const yy = yV(v); if (yy < lerp(G.YB, G.YT - 20, regua)) break; g.beginPath(); g.moveTo(rx, yy); g.lineTo(rx + (v % 100 ? 10 : 20), yy); g.stroke(); } }, { w: 2.5, a: ap });
      const lab = (v, k, y) => { if (k <= 0) return; rot(g, String(v), rx - 16, y, { size: 46, align: "right", cor: "#E8FAFF", sp: 1, a: k * ap }); neon(g, () => { g.beginPath(); g.moveTo(rx, y); g.lineTo(xA(v === 63 ? 1921.6 : G.PICO), y); g.stroke(); }, { w: 2, dash: [8, 10], cor: BP.fraca, blur: 2, a: k * ap }); };
      lab(63, regua * clamp(p * 20), yV(63.9));
      lab(381, regua * ART.prog(dTip, G.PICO - 0.15, G.PICO), yV(381.2));
    }
    // linha (subida ciano, queda coral) + área
    const pts = ate(DOW, dTip).map(([a, v]) => [xA(a), yV(v)]);
    if (pts.length > 1) {
      g.save(); g.globalAlpha *= ap; g.beginPath(); g.moveTo(pts[0][0], G.YB); pts.forEach(q => g.lineTo(...q)); g.lineTo(pts[pts.length - 1][0], G.YB); g.closePath();
      g.fillStyle = ART.lg(g, 0, G.YT, 0, G.YB, [[0, "rgba(143,211,232,.22)"], [1, "rgba(143,211,232,.02)"]]); g.fill(); g.restore();
      const iP = pts.findIndex((q, i) => DOW[i] && DOW[i][0] >= G.PICO);
      const sobe = iP < 0 ? pts : pts.slice(0, iP + 1), cai = iP < 0 ? [] : pts.slice(iP);
      neon(g, () => { traca(g, sobe, 1); }, { w: 6, a: ap });
      if (cai.length > 1) neon(g, () => { traca(g, cai, 1); }, { w: 6, cor: CORAL, blur: 16, a: Math.max(ap, 0.0) });
      const tip = pts[pts.length - 1], quente = dTip > G.PICO;
      if (p < 1) { ART.glow(g, tip[0], tip[1], 46, quente ? CORAL : BP.linha, 0.9); ART.circ(g, tip[0], tip[1], 8); g.fillStyle = "#FFFFFF"; g.fill(); }
      res.ponta = tela(...tip);
      // contador de anos na ponta
      if (o.contador !== false && p > 0 && p < 1.0001) {
        const ano = Math.floor(dTip + 1e-6), cx = clamp(tip[0], G.X0 + 40, G.X1 - 20); res.ano = ano;
        neon(g, () => { g.beginPath(); g.moveTo(tip[0], tip[1] + 16); g.lineTo(tip[0], G.YB); g.stroke(); }, { w: 2, dash: [6, 8], cor: BP.fraca, blur: 2, a: ap });
        UI.cartao(g, cx - 95, G.YB + 72, 190, 76, { vidro: false, r: 20, cor: "rgba(6,26,38,.9)", borda: quente ? CORAL : BP.linha, sombra: false, a: ap });
        rot(g, String(ano), cx, G.YB + 112, { size: 52, align: "center", cor: "#E8FAFF", sp: 2, a: ap });
      }
      // 41 no fim
      if (p > 0.985) rot(g, "41", tip[0] + 18, tip[1] - 4, { size: 46, cor: "#FFD2CC", sp: 1, a: ART.prog(p, 0.985, 1) });
    }
    // etiquetas
    const ws = clamp(o.wallStreet ?? 0); if (ws > 0) rot(g, "WALL STREET · NOVA YORK", wx, wy, { size: 42, align: "center", a: ws * ap });
    const x6 = clamp(o.x6 ?? 0);
    if (x6 > 0) {
      neon(g, () => { const y0 = yV(63.9) - 10, y1 = lerp(y0, yV(381.2) + 10, ART.ease.outCubic(x6)); g.beginPath(); g.moveTo(112, y0); g.lineTo(112, y1); g.moveTo(98, y1 + 18); g.lineTo(112, y1); g.lineTo(126, y1 + 18); g.stroke(); }, { w: 5, cor: "#FFFFFF", a: ap });
      g.save(); g.globalAlpha *= x6 * ap; const sc = ART.ease.outBack(x6); g.translate(400, 650); g.scale(sc, sc);
      ART.textFx(g, "×6", 0, 0, { size: 150, fam: "Lilita One", fill: "#E8FAFF", stroke: "#03121A", sw: 14, shadow: "rgba(143,211,232,.6)", sblur: 30, sdy: 0 }); g.restore();
    }
    const qd = clamp(o.queda ?? 0);
    if (qd > 0) {
      g.save(); g.globalAlpha *= qd; const sc = ART.ease.outBack(qd); g.translate(qx, qy); g.scale(sc, sc);
      ART.textFx(g, "−89%", 0, 0, { size: 132, fam: "Lilita One", fill: CORAL, stroke: "#03121A", sw: 14, shadow: "rgba(255,107,91,.6)", sblur: 34, sdy: 0 }); g.restore();
    }
    // moedas: 1 própria (cheia) + 9 emprestadas (tracejadas)
    const em = clamp(o.emprestado ?? 0);
    if (em > 0) {
      const y = 1172, r = 31, dx = 78, x0 = 540 - 4.5 * dx;
      for (let i = 0; i < 10; i++) {
        const ki = ART.prog(em, i * 0.07, i * 0.07 + 0.25, "outBack"); if (ki <= 0) continue;
        const x = x0 + i * dx, rr = r * ki;
        if (i === 0) { ART.circ(g, x, y, rr); g.fillStyle = BP.linha; g.save(); g.globalAlpha *= ap; g.shadowColor = BP.linha; g.shadowBlur = 16; g.fill(); g.restore(); ART.circ(g, x, y, rr * 0.62); g.lineWidth = 3; g.strokeStyle = BP.bg0; g.stroke(); }
        else neon(g, () => { ART.circ(g, x, y, rr); g.stroke(); ART.circ(g, x, y, rr * 0.62); g.stroke(); }, { w: 3, dash: [7, 6], cor: BP.amarelo, a: ap });
      }
      const lk = ART.prog(em, 0.6, 1);
      if (lk > 0) {
        rot(g, "PRÓPRIO", x0 + (TE - 1) * 30, 1232 + (TE - 1) * 10, { size: 26 * TE, align: "center", sp: 2, a: lk * ap });
        neon(g, () => { g.beginPath(); g.moveTo(x0 + dx - r, 1214); g.lineTo(x0 + dx - r, 1222); g.lineTo(x0 + 9 * dx + r, 1222); g.lineTo(x0 + 9 * dx + r, 1214); g.stroke(); }, { w: 2.5, cor: BP.amarelo, a: lk * ap });
        rot(g, "EMPRESTADO", x0 + 5 * dx, 1252 + (TE - 1) * 16, { size: 36 * TE, align: "center", cor: BP.amarelo, sp: 4, a: lk * ap });
      }
    }
    // ------------------------------------------------ gráfico 2: outubro de 1987 (à direita)
    const p87 = clamp(o.prog87 ?? 0), r87 = clamp(o.rotulo87 ?? 0);
    if (p87 > 0 || r87 > 0) {
      const L0 = G.OX + G.X0, L1 = G.OX + G.X1;
      neon(g, () => { g.beginPath(); g.moveTo(L0 - 30, G.YB); g.lineTo(L0 - 30 + (L1 - L0 + 60) * clamp(Math.max(p87, r87) * 1.6), G.YB); g.stroke(); for (let i = 0; i < 17; i++) { if (x87(i) > L0 - 30 + (L1 - L0 + 60) * clamp(Math.max(p87, r87) * 1.6)) break; g.beginPath(); g.moveTo(x87(i), G.YB); g.lineTo(x87(i), G.YB + 10); g.stroke(); } }, { w: 2.5, a: ap * 0.9 });
      if (r87 > 0) {
        g.save(); g.globalAlpha *= r87 * ap; ART.textFx(g, "1987", G.OX + 540, 405, { size: 110, fam: "Lilita One", fill: "#E8FAFF", stroke: "#03121A", sw: 12, shadow: "rgba(143,211,232,.6)", sblur: 30, sdy: 0 }); g.restore();
        rot(g, "OUTUBRO", G.OX + 540, 480 + (TE - 1) * 14, { size: 30 * TE, align: "center", cor: BP.fraca, sp: 8, a: r87 * ap });
      }
      if (p87 > 0) {
        const d = p87 * D87, dom = OUT87.map((v, i) => [i87(i), v]), q = ate(dom, d).map(([ii, v]) => [G.OX + G.X0 + ii / D87 * (G.X1 - G.X0), y87(v)]);
        const iD = 11, antes = q.slice(0, iD + 1), depois = q.length > iD ? q.slice(iD) : [];
        neon(g, () => traca(g, antes, 1), { w: 6, a: ap });
        if (depois.length > 1) neon(g, () => traca(g, depois, 1), { w: 6, cor: CORAL, blur: 16 });
        const tip = q[q.length - 1]; if (p87 < 1) { ART.glow(g, tip[0], tip[1], 46, d > iD ? CORAL : BP.linha, 0.9); ART.circ(g, tip[0], tip[1], 8); g.fillStyle = "#FFFFFF"; g.fill(); }
        res.ponta87 = tela(...tip);
      }
      const sg = clamp(o.segunda ?? 0);
      if (sg > 0) {
        const sx = (x87(11) + x87(12)) / 2, sy = 600, sc = ART.ease.outBack(sg);
        g.save(); g.globalAlpha *= clamp(sg * 2); g.translate(sx, sy); g.scale(sc * (TE > 1 ? 0.5 + 0.5 * TE : 1), sc * (TE > 1 ? 0.5 + 0.5 * TE : 1));
        UI.cartao(g, -70, -66, 140, 132, { vidro: false, r: 18, cor: "rgba(6,26,38,.92)", borda: BP.linha, sombra: false });
        g.fillStyle = BP.linha; ART.rr(g, -70, -66, 140, 34, 18); g.fill(); g.fillRect(-70, -48, 140, 16);
        for (const xx of [-36, 36]) { ART.rr(g, xx - 6, -80, 12, 30, 6); g.fillStyle = "#E8FAFF"; g.fill(); }
        rot(g, "1", 0, 14, { size: 64, align: "center", cor: "#E8FAFF", sp: 0 }); rot(g, "DIA", 0, 50, { size: 24 * (TE > 1 ? 1.3 : 1), align: "center", sp: 3 });
        g.restore();
        neon(g, () => { g.beginPath(); g.moveTo(sx, sy + 70); g.lineTo(sx, y87(2247) - 14); g.stroke(); }, { w: 2, dash: [6, 7], cor: BP.fraca, blur: 2, a: sg });
        rot(g, "SEGUNDA-FEIRA NEGRA", G.OX + 540, G.YB + 60, { size: 40, align: "center", cor: "#E8FAFF", sp: 3, a: sg });
      }
      const q87 = clamp(o.queda87 ?? 0);
      if (q87 > 0) {
        g.save(); g.globalAlpha *= q87; const sc = ART.ease.outBack(q87); g.translate(G.OX + 470, 815); g.scale(sc, sc);
        ART.textFx(g, "−22,6%", 0, 0, { size: 120, fam: "Lilita One", fill: CORAL, stroke: "#03121A", sw: 14, shadow: "rgba(255,107,91,.6)", sblur: 34, sdy: 0 }); g.restore();
        neon(g, () => { const x = x87(12) + 26, y0 = y87(2247), y1 = lerp(y0, y87(1739), ART.ease.outCubic(q87)); g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.moveTo(x - 12, y1 - 16); g.lineTo(x, y1); g.lineTo(x + 12, y1 - 16); g.stroke(); }, { w: 4, cor: CORAL, blur: 12, a: q87 });
      }
    }
    g.restore();
    return res;
  };
  ART.ciencia.grafLinha.PICO = (G.PICO - G.A0) / (G.A1 - G.A0);       // ≈ 0,74 (prog do topo, 381)
  ART.ciencia.grafLinha.DEGRAU87 = (11.125) / D87;                     // ≈ 0,73 (prog87 no meio do degrau)
  /** prog da linha 1 em que a ponta está no ano `a` (ex.: anoProg(1929) para o contador mostrar 1929) */
  ART.ciencia.grafLinha.anoProg = a => clamp((a - G.A0) / (G.A1 - G.A0));

  // ================================================================= C6: especulação em linhas (p220–222)
  /** desenho em linhas ciano: pata segurando uma moeda + seta de amanhã; carimbo ESPECULAÇÃO; a pata vira o Zeca com a pepita.
   *  o = {pata (0..1 desenho), seta (0..1 nasce), setaPulso (0..1), carimbo (0..1: bate e fica), zeca (0..1: troca pata -> Zeca), fundo (true), a} */
  ART.ciencia.especulacao = (g, t, o = {}) => {
    g.save(); g.globalAlpha *= o.a ?? 1;
    if (o.fundo !== false) ART.blueprint(g, t);
    const zk = clamp(o.zeca ?? 0), pk = clamp(o.pata ?? 1) * (1 - ART.smooth(zk * 1.6));
    // ---- pata + moeda
    if (pk > 0) {
      const a1 = [[40, 1300], [150, 1120], [300, 980], [352, 948]], a2 = [[210, 1320], [330, 1150], [460, 1010], [500, 985]];
      neon(g, () => { traca(g, a1, pk * 1.6); traca(g, a2, pk * 1.6); }, { w: 5 });
      neon(g, () => { traca(g, elipse(430, 905, 92, 82, 0.9, Math.PI * 2 + 0.2), ART.prog(pk, 0.15, 0.6)); }, { w: 5 });
      const mk = ART.prog(pk, 0.3, 0.8);
      neon(g, () => { traca(g, elipse(455, 770, 92, 92, -Math.PI / 2, Math.PI * 1.5), mk); traca(g, elipse(455, 770, 66, 66, -Math.PI / 2, Math.PI * 1.5), mk); }, { w: 5, cor: BP.amarelo });
      if (mk > 0.6) neon(g, () => { g.beginPath(); g.moveTo(430, 800); g.lineTo(482, 742); g.moveTo(452, 722); g.quadraticCurveTo(490, 726, 508, 760); g.stroke(); }, { w: 4, cor: BP.amarelo, a: ART.prog(mk, 0.6, 1) });
      const fk = ART.prog(pk, 0.55, 1);
      for (const [fx, fy, an] of [[352, 846, -0.5], [392, 828, -0.2], [438, 826, 0.1], [484, 838, 0.4]]) {
        neon(g, () => { traca(g, elipse(fx, fy, 22, 34, an - Math.PI, an + 0.25), fk); }, { w: 4.5 });
        if (fk > 0.8) neon(g, () => { g.beginPath(); g.moveTo(fx + Math.sin(an) * 30, fy - 30); g.quadraticCurveTo(fx + Math.sin(an) * 40, fy - 52, fx + Math.sin(an) * 30 + 10, fy - 60); g.stroke(); }, { w: 4, cor: BP.amarelo, a: ART.prog(fk, 0.8, 1) });
      }
    }
    // ---- Zeca em linhas com a pepita
    if (zk > 0) {
      const dk = ART.prog(zk, 0.15, 1), X = 440, Y = 1060, S = 1.3;
      const P = pts => pts.map(([x, y]) => [X + x * S, Y + y * S]);
      neon(g, () => {
        traca(g, P(elipse(0, -300, 82, 82, ART.deg(-12.7), ART.deg(192.7), 48)), dk);            // cabeça (abaixo da aba)
        traca(g, P(elipse(0, -318, 98, 92, Math.PI, Math.PI * 2, 40)), dk);                      // capacete
        traca(g, P([[-114, -318], [114, -318]]), dk);                                             // aba
        traca(g, P(elipse(0, -262, 30, 20)), dk);                                                // focinho
        traca(g, P(elipse(0, -120, 116, 100, ART.deg(-60), ART.deg(240), 56)), dk);              // corpo
        for (const yy of [-176, -132, -88]) traca(g, P([[-100, yy], [-50, yy + 14], [0, yy + 18], [50, yy + 14], [100, yy]]), ART.prog(dk, 0.3, 1)); // faixas do casco
        traca(g, P([[-104, -170], [-70, -150], [-46, -146]]), ART.prog(dk, 0.4, 1));             // braços
        traca(g, P([[104, -170], [70, -150], [46, -146]]), ART.prog(dk, 0.4, 1));
        traca(g, P([[-70, -26], [-70, 0], [-26, 0], [-26, -22]]), ART.prog(dk, 0.5, 1));        // pernas
        traca(g, P([[26, -22], [26, 0], [70, 0], [70, -26]]), ART.prog(dk, 0.5, 1));
        traca(g, P([[106, -60], [150, -40], [178, -18], [196, 0]]), ART.prog(dk, 0.5, 1));       // rabo
      }, { w: 5 });
      if (dk > 0.4) {
        const a = ART.prog(dk, 0.4, 0.8);
        for (const sx of [-1, 1]) { ART.circ(g, X + sx * 30 * S, Y - 300 * S, 7 * a); g.fillStyle = BP.linha; g.fill(); }
        ART.circ(g, X, Y - 270 * S, 5 * a); g.fill();
        neon(g, () => { ART.circ(g, X, Y - 372 * S, 16 * S); g.stroke(); for (const an of [-60, -90, -120]) { const r0 = 26 * S, r1 = 40 * S; g.beginPath(); g.moveTo(X + Math.cos(ART.deg(an)) * r0, Y - 372 * S + Math.sin(ART.deg(an)) * r0); g.lineTo(X + Math.cos(ART.deg(an)) * r1, Y - 372 * S + Math.sin(ART.deg(an)) * r1); g.stroke(); } }, { w: 4, cor: BP.amarelo, a });
        // pepita (hexágono facetado) nas patas
        const hx = P([[0, -186], [40, -164], [40, -116], [0, -94], [-40, -116], [-40, -164], [0, -186]]);
        g.save(); g.globalAlpha *= a; g.beginPath(); hx.forEach((q, i) => (i ? g.lineTo(...q) : g.moveTo(...q))); g.fillStyle = "rgba(6,26,38,.95)"; g.fill(); g.restore();
        neon(g, () => { traca(g, hx, a); g.beginPath(); g.moveTo(...P([[0, -186]])[0]); g.lineTo(...P([[0, -140]])[0]); g.lineTo(...P([[40, -116]])[0]); g.moveTo(...P([[0, -140]])[0]); g.lineTo(...P([[-40, -116]])[0]); if (a > 0.9) g.stroke(); }, { w: 4.5, cor: BP.amarelo, blur: 16 });
        ART.glow(g, X, Y - 140 * S, 120, BP.amarelo, 0.35 * a);
      }
    }
    // ---- seta de amanhã
    const sk = clamp(o.seta ?? 0);
    if (sk > 0) {
      const sx = lerp(770, 720, zk), y0 = lerp(1010, 760, zk), y1 = lerp(y0, lerp(560, 410, zk), ART.ease.outCubic(sk)), pu = clamp(o.setaPulso || 0) * (0.6 + 0.4 * Math.sin(t * 8));
      if (pu > 0) ART.glow(g, sx, y1 + 60, 170, BP.linha, 0.55 * pu);
      neon(g, () => { g.beginPath(); g.moveTo(sx, y0); g.lineTo(sx, y1); g.moveTo(sx - 46, y1 + 50); g.lineTo(sx, y1); g.lineTo(sx + 46, y1 + 50); g.stroke(); }, { w: 8 + 3 * pu, blur: 18 });
      rot(g, "AMANHÃ?", sx, y1 - 40, { size: 34, align: "center", sp: 3, a: ART.prog(sk, 0.5, 1) });
    }
    // ---- carimbo
    const ck = clamp(o.carimbo ?? 0);
    if (ck > 0) {
      const bate = ART.prog(ck, 0, 0.3), sc = lerp(1.9, 1, ART.ease.inQuad(bate)), sh = ck > 0.3 ? Math.max(0, 1 - (ck - 0.3) / 0.2) : 0;
      g.save(); g.globalAlpha *= clamp(bate * 3) * 0.95; g.translate(540 + Math.sin(ck * 80) * 6 * sh, 1150 + Math.cos(ck * 70) * 5 * sh); g.rotate(ART.deg(-7)); g.scale(sc, sc);
      g.strokeStyle = BP.amarelo; g.shadowColor = BP.amarelo; g.shadowBlur = 18; g.lineWidth = 7; ART.rr(g, -350, -78, 700, 156, 18); g.stroke(); g.lineWidth = 3; ART.rr(g, -334, -62, 668, 124, 12); g.stroke();
      g.font = '400 96px "Lilita One"'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = BP.amarelo; g.letterSpacing = "4px"; g.fillText("ESPECULAÇÃO", 0, 6);
      // falhas de tinta (determinísticas)
      g.shadowColor = "transparent"; g.fillStyle = "rgba(9,36,52,.85)"; const r = ART.rng(41);
      for (let i = 0; i < 26; i++) { ART.circ(g, (r() - 0.5) * 680, (r() - 0.5) * 140, 2 + r() * 4); g.fill(); }
      g.restore();
      if (sh > 0) ART.glow(g, 540, 1150, 420, BP.amarelo, 0.3 * sh);
    }
    g.restore();
  };
})();
