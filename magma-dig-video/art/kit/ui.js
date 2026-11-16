/* MAGMA DIG — kit de arte: interface desenhada dentro da cena (overlays).
 * Linguagem: UI flat escura do jogo (cartões roxo-azulados arredondados, botões "gordinhos" com
 * sombra sólida, ícones em pixel art) + vidro fosco da referência quando o cartão flutua na cena.
 * Todas as funções: (g, x, y, opções) com x,y = centro do componente, salvo indicação. s = escala.
 */
(function () {
  const ART = window.ART, P = ART.pal;
  const { clamp, lerp } = ART;
  const UI = (ART.ui = {});
  const F = (px, w = 900) => `${w} ${px}px "Nunito"`;

  // ================================================================= ícones pixel art (como no jogo)
  // cada mapa: linhas de caracteres; '.' = vazio; letras = cores da paleta do ícone
  const PIX = {
    pedra: { c: { a: "#C9C3B4", b: "#9C9890", d: "#5E5B57" }, m: ["..aaaa..", ".aaabbb.", "aabbbbbd", "abbbbbbd", "abbbbbdd", ".bbbbdd.", "..dddd.."] },
    cobre: { c: { a: "#FFB27A", b: "#E07B39", d: "#8A3E14" }, m: ["...a....", "...ab...", "..aabb..", "..abbb..", ".abbbbd.", ".abbbbdd", "abbbbddd", "dddddddd"] },
    ferro: { c: { a: "#D4A586", b: "#9C6B4E", d: "#5A3624" }, m: ["aaaaaaad", "abbbbbbd", "abbbbbbd", "abbbbbbd", "abbbbbbd", "abbbbbbd", "dddddddd"] },
    prata: { c: { a: "#FFFFFF", b: "#C8D3DE", d: "#6F7C8C" }, m: ["..aaaa..", ".aabbbb.", "aabbbbbd", "abbbbbbd", "abbbbbbd", ".bbbbbd.", "..dddd.."] },
    ouro: { c: { a: "#FFF2A6", b: "#FFC531", d: "#B07A0C" }, m: ["..aaa...", ".aabbbb.", "abbbbbbb", "bbbbbbbd", ".bbbbbdd", "..dddd.."] },
    ametista: { c: { a: "#E3C6FF", b: "#9B5CF0", d: "#4F2393" }, m: ["...a...", "..aab..", "..abb..", ".aabbd.", ".abbbd.", ".abbdd.", "..bdd..", "...d..."] },
    lasca: { c: { a: "#E8FCFF", b: "#7FD8F0", d: "#2E8FB0" }, m: ["...a...", "..aab..", ".aabbb.", "abbbbbd", ".bbbbd.", "..bdd..", "...d..."] },
    moeda: { c: { a: "#FFF2A6", b: "#FFC531", d: "#B07A0C", e: "#8A5A08" }, m: ["..aaaa..", ".abbbbb.", "abbeebbd", "abbebbbd", "abbebbbd", "abbeebbd", ".bbbbbd.", "..dddd.."] },
    picareta: { c: { a: "#E6EAF2", b: "#8E93A3", w: "#A8703F", d: "#5E3720" }, m: [".aaaaa..", "abbbbba.", "b..w..b.", "...w....", "...w....", "...d....", "...d...."] },
    punho: { c: { a: "#FF8A95", b: "#E63748", d: "#8C1222" }, m: [".aaaaa.", "abababb", "abbbbbd", "abbbbbd", ".bbbbd.", ".bbbdd.", "..ddd.."] },
    valor: { c: { a: "#FFF2A6", b: "#FFC531", d: "#8A5A08" }, m: ["..aaaa..", ".abbbbb.", "abbddbbd", "abddddbd", "abddddbd", "abbddbbd", ".bbbbbd.", "..dddd.."] },
    tempo: { c: { a: "#C8FBFF", b: "#3FC6D6", d: "#167784", e: "#0B3E46" }, m: ["..aaaa..", ".ab..bb.", "ab.e..bd", "ab.ee.bd", "ab....bd", ".bb..bd.", "..dddd.."] },
    ampulheta: { c: { a: "#FFE38A", b: "#C3954F", s: "#FFD23F", d: "#6E4A1E" }, m: ["bbbbbbb", ".asssa.", "..asa..", "...s...", "..a.a..", ".asssa.", "bbbbbbb"] },
    raio: { c: { a: "#FFF2A6", b: "#FFC531", d: "#B07A0C" }, m: ["....ab.", "...ab..", "..abb..", ".abbbbd", "...bbd.", "...bd..", "..bd...", "..d...."] },
    bigorna: { c: { a: "#FFB27A", b: "#E07B39", d: "#6E2C0C" }, m: ["aaaaaab.", "bbbbbbbb", ".bbbbbd.", "..bbbd..", "..bbbd..", ".bbbbbd.", "dddddddd"] },
    ajudante: { c: { a: "#E3C6FF", b: "#9B5CF0", d: "#4F2393", e: "#FFFFFF" }, m: ["b......b", "bb.bb.bb", "bbbbbbbb", "bbebbebb", ".bbbbbb.", "..dbbd..", "...dd..."] },
    sol: { c: { a: "#FFF2A6", b: "#FFC531", d: "#E08A10" }, m: ["...a...", ".a.a.a.", "..bbb..", "aabbbaa", "..bbb..", ".b.b.b.", "...b..."] },
    lua: { c: { a: "#E8F0FF", b: "#A9B8E8", d: "#5A6AA8" }, m: ["..aaa..", ".aab...", "aab....", "abb....", "abbb..d", ".bbbbd.", "..ddd.."] },
    mochila: { c: { a: "#D7A06A", b: "#9C6337", d: "#5A3420", y: "#FFD23F" }, m: ["..aaaa..", ".a....a.", "abbbbbbd", "abbyybbd", "abbbbbbd", "abbbbbbd", ".dddddd."] },
  };
  const PIXC = new Map();
  UI.pix = (g, nome, x, y, size) => {
    const d = PIX[nome]; if (!d) return;
    let c = PIXC.get(nome);
    if (!c) {
      const h = d.m.length, w = Math.max(...d.m.map(r => r.length));
      c = ART.canvas(w, h); const gg = c.getContext("2d");
      d.m.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== "." && d.c[ch]) { gg.fillStyle = d.c[ch]; gg.fillRect(i, j, 1, 1); } }));
      PIXC.set(nome, c);
    }
    const k = size / Math.max(c.width, c.height);
    g.save(); g.imageSmoothingEnabled = false;
    g.drawImage(c, Math.round(x - (c.width * k) / 2), Math.round(y - (c.height * k) / 2), c.width * k, c.height * k);
    g.restore();
  };
  UI.PIX = PIX;

  // ================================================================= base: cartões e botões
  /** cartão do jogo (flat escuro). x,y = canto superior esquerdo. o = {r, cor, borda, vidro, sombra, a} */
  UI.cartao = (g, x, y, w, h, o = {}) => {
    const r = o.r ?? 26;
    g.save(); g.globalAlpha *= o.a ?? 1;
    if (o.sombra !== false) { g.shadowColor = "rgba(0,0,0,.5)"; g.shadowBlur = 40; g.shadowOffsetY = 16; }
    if (o.vidro) {
      // vidro fosco: copia o que está atrás, desfoca e escurece
      g.save(); ART.rr(g, x, y, w, h, r); g.clip(); g.shadowColor = "transparent";
      const m = 40, sx = Math.max(0, x - m), sy = Math.max(0, y - m);
      g.filter = `blur(${o.vidro === true ? 18 : o.vidro}px)`;
      try { g.drawImage(g.canvas, sx, sy, Math.min(g.canvas.width - sx, w + 2 * m), Math.min(g.canvas.height - sy, h + 2 * m), sx, sy, Math.min(g.canvas.width - sx, w + 2 * m), Math.min(g.canvas.height - sy, h + 2 * m)); } catch (e) { void e; }
      g.filter = "none"; g.restore();
      ART.rr(g, x, y, w, h, r); g.fillStyle = o.cor || "rgba(30,27,46,.62)"; g.fill();
    } else { ART.rr(g, x, y, w, h, r); g.fillStyle = o.cor || P.uiCard; g.fill(); }
    g.shadowColor = "transparent";
    // brilho interno no topo + borda
    ART.rr(g, x, y, w, h, r); g.fillStyle = ART.lg(g, 0, y, 0, y + Math.min(h, 120), [[0, "rgba(255,255,255,.07)"], [1, "rgba(255,255,255,0)"]]); g.fill();
    ART.rr(g, x + 1, y + 1, w - 2, h - 2, r - 1); g.lineWidth = o.bw ?? 2.5; g.strokeStyle = o.borda || (o.vidro ? "rgba(255,255,255,.22)" : P.uiBorda); g.stroke();
    g.restore();
  };
  const BOT = { amarelo: ["#FFD23F", "#C99A12", "#2A1E08"], verde: ["#66CB4B", "#3E8E2C", "#10280A"], roxo: ["#494369", "#2E2944", "#E9E4FF"], vermelho: ["#E63748", "#9A1C2A", "#fff"] };
  /** botão gordinho: x,y = centro. o = {texto, sub, cor, press (0..1), icone, s, a} */
  UI.botao = (g, x, y, w, h, o = {}) => {
    const [c0, c1, tc] = BOT[o.cor || "amarelo"], pr = clamp(o.press || 0), dep = 10 * (1 - pr), r = h * 0.32;
    g.save(); g.globalAlpha *= o.a ?? 1;
    g.shadowColor = "rgba(0,0,0,.45)"; g.shadowBlur = 30; g.shadowOffsetY = 14;
    ART.rr(g, x - w / 2, y - h / 2 + 10, w, h, r); g.fillStyle = c1; g.fill(); g.shadowColor = "transparent";
    ART.rr(g, x - w / 2, y - h / 2 + 10 - dep, w, h, r); g.fillStyle = ART.lg(g, 0, y - h / 2, 0, y + h / 2, [[0, ART.shade(c0, 0.15)], [1, c0]]); g.fill();
    ART.rr(g, x - w / 2 + 10, y - h / 2 + 16 - dep, w - 20, h * 0.28, r * 0.7); g.fillStyle = "rgba(255,255,255,.22)"; g.fill();
    const cy = y + 10 - dep;
    let tx = x;
    const te = o.textoEscala || 1, se = o.subEscala || 1;   // Parte 2 (correção): texto / sub maiores
    if (o.icone) { const iw = h * 0.5; const total = iw + 16 + measure(g, o.texto, h * 0.36 * te); UI.pix(g, o.icone, x - total / 2 + iw / 2, cy - (o.sub ? h * 0.12 : 0), iw); tx = x + (iw + 16) / 2; }
    g.fillStyle = tc; g.textAlign = "center"; g.textBaseline = "middle"; g.font = F(h * 0.36 * te);
    g.fillText(o.texto || "", tx, cy - (o.sub ? h * 0.13 * (se > 1 ? 1.15 : 1) : 0));
    if (o.sub) { g.font = F(h * 0.26 * se, 800); g.globalAlpha *= se > 1 ? 0.95 : 0.85; g.fillText(o.sub, tx, cy + h * (se > 1 ? 0.22 : 0.2)); }
    g.restore();
  };
  function measure(g, s, px) { g.save(); g.font = F(px); const w = g.measureText(s || "").width; g.restore(); return w; }

  // ================================================================= cronômetro do dia
  /** HUD do jogo: número grande "10,0" + barra amarela que esvazia. x,y = centro.
   *  o = {valor, max (10), s, fantasma (valor de ontem p/ barra fantasma), icone ('sol'|'lua'), pausa, a} */
  UI.cronometro = (g, x, y, o = {}) => {
    const s = o.s || 1, v = Math.max(0, o.valor ?? 10), mx = o.max || 10, fr = clamp(v / (o.escala || mx));
    const w = (o.icone ? 350 : 300) * s, h = 150 * s;
    g.save(); g.globalAlpha *= o.a ?? 1;
    const alerta = v <= (o.alerta ?? 1.0) && v > 0.001;
    UI.cartao(g, x - w / 2, y - h / 2, w, h, { r: 30 * s, cor: "rgba(20,18,31,.88)", borda: alerta ? "#E63748" : "rgba(255,255,255,.14)", bw: 3 * s });
    const txt = v.toFixed(1).replace(".", ",");
    g.font = F(96 * s, 1000); g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = alerta ? "#FF5A66" : "#FFFFFF";
    g.shadowColor = "rgba(0,0,0,.5)"; g.shadowBlur = 8 * s; g.shadowOffsetY = 3 * s;
    g.fillText(txt, x + (o.icone ? 36 * s : 0), y - 14 * s);
    g.shadowColor = "transparent";
    if (o.icone) UI.pix(g, o.icone, x - w / 2 + 50 * s, y - 14 * s, 50 * s);
    // barra
    const bx = x - w / 2 + 28 * s, bw = w - 56 * s, by = y + 40 * s, bh = 14 * s;
    ART.rr(g, bx, by, bw, bh, bh / 2); g.fillStyle = "rgba(255,255,255,.12)"; g.fill();
    if (o.fantasma != null) { const ff = clamp(o.fantasma / (o.escala || mx)); ART.rr(g, bx, by, bw * ff, bh, bh / 2); g.setLineDash([6 * s, 5 * s]); g.lineWidth = 2.5 * s; g.strokeStyle = "rgba(255,210,63,.7)"; g.stroke(); g.setLineDash([]); }
    if (fr > 0.002) { ART.rr(g, bx, by, Math.max(bh, bw * fr), bh, bh / 2); g.fillStyle = alerta ? "#E63748" : ART.lg(g, bx, 0, bx + bw, 0, [[0, "#FFB548"], [1, "#FFD23F"]]); g.fill(); }
    g.restore();
  };

  // ================================================================= CRAC!
  /** "CRAC!" que estoura no impacto e sobe. t0 = instante do golpe. o = {s, cor, apagado, rot} */
  UI.crac = (g, x, y, t, t0, o = {}) => {
    const dt = t - t0, dur = o.dur ?? 0.75; if (dt < 0 || dt > dur) return;
    const s = o.s || 1, k = dt / dur;
    const sc = dt < 0.1 ? ART.ease.outBack(dt / 0.1) * 1.15 : lerp(1.15, 1, ART.prog(dt, 0.1, 0.25));
    g.save(); g.translate(x, y - 70 * s * ART.ease.outCubic(k)); g.rotate(ART.deg(o.rot ?? -6)); g.scale(sc * s, sc * s);
    g.globalAlpha *= k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
    const cor = o.apagado ? "#8E8A9A" : o.cor || "#FFD23F";
    ART.textFx(g, "CRAC!", 0, 0, { size: 96, fam: "Lilita One", fill: gg => ART.lg(gg, 0, -40, 0, 40, [[0, ART.shade(cor, 0.35)], [0.5, cor], [1, ART.shade(cor, -0.12)]]), stroke: "#22140C", sw: 16, sdy: 8, shadow: "rgba(0,0,0,.6)", spacing: 2 });
    g.restore();
  };

  // ================================================================= contador de saque / moedas
  /** pílula com ícone + número. x,y = centro. o = {valor, icone ('moeda'), s, pulso (0..1), cor, prefixo, a} */
  UI.contador = (g, x, y, o = {}) => {
    const s = (o.s || 1) * (1 + 0.14 * (o.pulso || 0)), txt = (o.prefixo || "") + (typeof o.valor === "string" ? o.valor : ART.num(o.valor ?? 0));
    g.save(); g.globalAlpha *= o.a ?? 1; g.font = F(64 * s, 1000);
    const tw = g.measureText(txt).width, w = tw + 130 * s, h = 96 * s;
    UI.cartao(g, x - w / 2, y - h / 2, w, h, { r: h / 2, cor: "rgba(20,18,31,.85)", borda: "rgba(255,255,255,.14)" });
    if (o.icone !== null) UI.pix(g, o.icone || "moeda", x - w / 2 + 52 * s, y, 52 * s);
    g.fillStyle = o.cor || "#FFFFFF"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(txt, x - w / 2 + 92 * s, y + 3 * s);
    if (o.pulso > 0) ART.glow(g, x, y, w * 0.6, "#FFD23F", 0.35 * o.pulso);
    g.restore();
    return { w, h };
  };
  /** número flutuante "+1" (sobe e some). o = {texto, cor, s} */
  UI.flutua = (g, x, y, t, t0, o = {}) => {
    const dt = t - t0, dur = o.dur ?? 0.9; if (dt < 0 || dt > dur) return;
    const k = dt / dur, s = (o.s || 1) * (dt < 0.12 ? ART.ease.outBack(dt / 0.12) : 1);
    g.save(); g.globalAlpha *= k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1; g.translate(x, y - 120 * ART.ease.outCubic(k)); g.scale(s, s);
    ART.textFx(g, o.texto || "+1", 0, 0, { size: 72, fam: "Nunito", weight: 1000, fill: o.cor || "#FFD23F", stroke: "#1A1020", sw: 12 });
    g.restore();
  };

  // ================================================================= moeda (objeto 2.5D)
  /** moeda dourada vista de frente com giro (rot 0..2π) */
  UI.moeda = (g, x, y, r, rot = 0, o = {}) => {
    const k = Math.cos(rot), ax = Math.abs(k) * 0.92 + 0.08;
    g.save(); g.translate(x, y);
    // espessura
    ART.ell(g, (k >= 0 ? 1 : -1) * r * 0.1 * (1 - ax), 0, r * ax + r * 0.02, r); g.fillStyle = "#9A6A08"; g.fill();
    ART.ell(g, 0, 0, r * ax, r); g.fillStyle = ART.lg(g, -r, -r, r, r, [[0, "#FFF0A0"], [0.45, "#FFC531"], [1, "#C88A10"]]); g.fill();
    ART.ell(g, 0, 0, r * ax * 0.78, r * 0.78); g.lineWidth = r * 0.08; g.strokeStyle = "rgba(150,95,10,.55)"; g.stroke();
    // emblema: picareta pequena
    if (ax > 0.35) { g.save(); g.scale(ax, 1); g.rotate(-0.6); g.fillStyle = "rgba(150,95,10,.65)"; g.fillRect(-r * 0.06, -r * 0.4, r * 0.12, r * 0.8); g.beginPath(); g.ellipse(0, -r * 0.4, r * 0.4, r * 0.14, 0, Math.PI, 0); g.fill(); g.restore(); }
    ART.ell(g, -r * 0.3 * ax, -r * 0.42, r * 0.22 * ax, r * 0.1, -0.5); g.fillStyle = "rgba(255,255,255,.55)"; g.fill();
    g.restore();
    if (o.brilho) ART.glow(g, x, y, r * 2.4, "#FFD23F", o.brilho);
  };

  // ================================================================= gráfico de 7 dias (Mercado)
  /** x,y = canto sup. esq. o = {barras: [7 valores 0..1], amanha (0..1 | false = sem barra de amanhã), prog (0..1 animação), cor, corHoje,
   *  cores: [cor por barra] (Parte 2), desliza (Parte 2: nº de barras já deslizadas para a esquerda, fracionário), janela (7)} */
  UI.grafico7 = (g, x, y, w, h, o = {}) => {
    if (o.desliza != null || o.amanha === false || o.cores) return grafico7b(g, x, y, w, h, o);
    const b = o.barras || [0.4, 0.55, 0.35, 0.5, 0.45, 0.6, 0.7], n = b.length + 1, gap = w * 0.035, bw = (w - gap * (n - 1)) / n, pr = o.prog ?? 1;
    g.save();
    for (let i = 0; i < n; i++) {
      const isT = i === n - 1, v = isT ? o.amanha ?? 0.85 : b[i];
      const ki = clamp(pr * n * 1.0 - i), hh = h * v * ART.ease.outBack(clamp(ki));
      const bx = x + i * (bw + gap), by = y + h - hh;
      if (ki <= 0) continue;
      if (isT) {
        ART.rr(g, bx + 2, by, bw - 4, hh, 6); g.setLineDash([10, 7]); g.lineWidth = 5; g.strokeStyle = o.corAmanha || "#5FD35F"; g.stroke(); g.setLineDash([]);
        ART.rr(g, bx + 2, by, bw - 4, hh, 6); g.fillStyle = ART.rgba(o.corAmanha || "#5FD35F", 0.12 + 0.12 * (o.brilhoAmanha || 0)); g.fill();
        if (o.brilhoAmanha) ART.glow(g, bx + bw / 2, by, bw * 1.6, o.corAmanha || "#5FD35F", 0.5 * o.brilhoAmanha);
      } else {
        ART.rr(g, bx, by, bw, hh, 6); g.fillStyle = i === n - 2 ? o.corHoje || "#FFD23F" : "#7A739A"; g.fill();
      }
    }
    // linha de base
    g.fillStyle = "rgba(255,255,255,.15)"; g.fillRect(x - 6, y + h + 6, w + 12, 3);
    g.restore();
  };
  /** variante do gráfico (Parte 2): sem barra de amanhã, cor por barra e/ou deslizando (barras novas entram pela direita) */
  function grafico7b(g, x, y, w, h, o) {
    const b = o.barras || [0.4, 0.55, 0.35, 0.5, 0.45, 0.6, 0.7], temA = o.amanha !== false && o.desliza == null;
    const jan = o.desliza != null ? o.janela ?? 7 : b.length, n = jan + (temA ? 1 : 0), gap = w * 0.035, bw = (w - gap * (n - 1)) / n, pr = o.prog ?? 1;
    const d = o.desliza ?? 0, ult = Math.min(b.length - 1, Math.ceil(d + jan - 1e-6) - 1); // índice da barra "hoje"
    g.save(); g.beginPath(); g.rect(x - 4, y - h * 0.4, w + 8, h * 1.4 + 4); g.clip();
    for (let i = 0; i < b.length; i++) {
      const pos = i - d; if (pos < -1 || pos > jan) continue;
      const ki = o.desliza != null ? clamp((d + jan - i) * 1.5) : clamp(pr * n - i);   // barra nova cresce ao entrar
      if (ki <= 0) continue;
      const hh = h * b[i] * ART.ease.outBack(ki), bx = x + pos * (bw + gap), by = y + h - hh;
      const cor = (o.cores && o.cores[i]) || (i === (o.desliza != null ? ult : b.length - 1) ? o.corHoje || "#FFD23F" : "#7A739A");
      ART.rr(g, bx, by, bw, hh, 6); g.fillStyle = cor; g.fill();
    }
    if (temA) {
      const ki = clamp(pr * n - b.length), v = o.amanha ?? 0.85, hh = h * v * ART.ease.outBack(ki), bx = x + b.length * (bw + gap), by = y + h - hh, ca = o.corAmanha || "#5FD35F";
      if (ki > 0) { ART.rr(g, bx + 2, by, bw - 4, hh, 6); g.setLineDash([10, 7]); g.lineWidth = 5; g.strokeStyle = ca; g.stroke(); g.setLineDash([]); ART.rr(g, bx + 2, by, bw - 4, hh, 6); g.fillStyle = ART.rgba(ca, 0.12 + 0.12 * (o.brilhoAmanha || 0)); g.fill(); }
    }
    g.restore();
    g.save(); g.fillStyle = "rgba(255,255,255,.15)"; g.fillRect(x - 6, y + h + 6, w + 12, 3); g.restore();
  }
  /** seta de tendência (dir 'cima'|'baixo'). x,y = centro, o = {s, cor, a}
   *  Parte 2: giro (0..1: gira 180° de cima para baixo e passa de verde a vermelho), contorno (0..1: vira seta fantasma tracejada) */
  UI.seta = (g, x, y, o = {}) => {
    if (o.giro != null || o.contorno) return seta2(g, x, y, o);
    const s = o.s || 1, up = (o.dir || "cima") === "cima", cor = o.cor || (up ? "#5FD35F" : "#E63748");
    g.save(); g.translate(x, y); g.scale(s, up ? s : -s); g.globalAlpha *= o.a ?? 1;
    g.shadowColor = ART.rgba(cor, 0.6); g.shadowBlur = 30;
    ART.poly(g, [[0, -70], [56, -6], [22, -6], [22, 66], [-22, 66], [-22, -6], [-56, -6]]);
    g.fillStyle = ART.lg(g, 0, -70, 0, 66, [[0, ART.shade(cor, 0.3)], [1, ART.shade(cor, -0.2)]]); g.fill();
    g.shadowColor = "transparent"; g.lineWidth = 6; g.strokeStyle = ART.shade(cor, -0.45); g.lineJoin = "round"; g.stroke();
    g.restore();
  };
  function seta2(g, x, y, o) {
    const s = o.s || 1, gk = clamp(o.giro ?? 0), up0 = (o.dir || "cima") === "cima", ck = clamp(o.contorno || 0);
    const cor = o.cor || ART.mix("#5FD35F", "#E63748", up0 ? ART.smooth(gk) : 1 - ART.smooth(gk));
    g.save(); g.translate(x, y); g.rotate(Math.PI * ART.ease.inOutBack(gk)); g.scale(s, up0 ? s : -s); g.globalAlpha *= o.a ?? 1;
    const forma = () => ART.poly(g, [[0, -70], [56, -6], [22, -6], [22, 66], [-22, 66], [-22, -6], [-56, -6]]);
    if (ck < 1) {
      g.save(); g.globalAlpha *= 1 - ck; g.shadowColor = ART.rgba(cor, 0.6); g.shadowBlur = 30; forma();
      g.fillStyle = ART.lg(g, 0, -70, 0, 66, [[0, ART.shade(cor, 0.3)], [1, ART.shade(cor, -0.2)]]); g.fill();
      g.shadowColor = "transparent"; g.lineWidth = 6; g.strokeStyle = ART.shade(cor, -0.45); g.lineJoin = "round"; g.stroke(); g.restore();
    }
    if (ck > 0) { g.save(); g.globalAlpha *= ck; forma(); g.fillStyle = ART.rgba(cor, 0.1); g.fill(); g.setLineDash([12, 9]); g.lineWidth = 6; g.strokeStyle = ART.rgba(cor, 0.85); g.lineJoin = "round"; g.stroke(); g.restore(); }
    g.restore();
  }
  /** número de preço que rola (odômetro) de `de` para `para`. Alinhado à direita em xr, linha de base yb. k 0..1. -> largura */
  UI.precoRolando = (g, xr, yb, de, para, k, px, cor) => {
    const v = lerp(de, para, clamp(k)), desce = para < de;
    const a = desce ? Math.ceil(v - 1e-9) : Math.floor(v + 1e-9), f = Math.abs(v - a), nx = desce ? a - 1 : a + 1, H = px * 0.95;
    g.save(); g.font = F(px, 1000); g.textAlign = "right"; g.fillStyle = cor;
    const wTxt = Math.max(g.measureText(String(a)).width, g.measureText(String(para)).width);
    g.beginPath(); g.rect(xr - wTxt - 20, yb - px * 0.8, wTxt + 40, px * 0.86); g.clip();
    const dir = desce ? 1 : -1;   // desce: números escorregam para baixo
    g.fillText(String(a), xr, yb + dir * f * H);
    if (f > 0.001) g.fillText(String(nx), xr, yb + dir * (f - 1) * H);
    g.restore();
    g.save(); g.font = F(px, 1000); const w = g.measureText(String(Math.round(v))).width; g.restore();
    return w;
  };

  // ================================================================= cartão de minério (preço + tendência)
  /** cartão vertical flutuante: x,y = centro. o = {tipo, nome, preco, varPct, barras, amanha, s, vidro, a, prog, raro} */
  UI.cartaoMinerio = (g, x, y, o = {}) => {
    const s = o.s || 1, w = 560 * s, h = 400 * s, x0 = x - w / 2, y0 = y - h / 2;
    g.save(); g.globalAlpha *= o.a ?? 1;
    UI.cartao(g, x0, y0, w, h, { vidro: o.vidro !== false, r: 36 * s, cor: "rgba(28,24,44,.72)", borda: o.raro ? ART.rgba(o.raro, 0.8) : null, bw: 3 });
    // ícone em quadrado
    ART.rr(g, x0 + 32 * s, y0 + 32 * s, 110 * s, 110 * s, 22 * s); g.fillStyle = "rgba(255,255,255,.07)"; g.fill();
    UI.pix(g, o.tipo || "cobre", x0 + 87 * s, y0 + 87 * s, 72 * s);
    g.fillStyle = "#F4EEDC"; g.font = F(58 * s, 1000); g.textAlign = "left"; g.textBaseline = "alphabetic";
    g.fillText(o.nome || "Cobre", x0 + 168 * s, y0 + 92 * s);
    const antes = o.precoAntes, rk = clamp(o.rola ?? 0), TE = o.textoEscala || 1;   // textoEscala: rótulos "HOJE PAGA"/"moedas" maiores
    if (o.varPct != null) { g.save(); if (antes != null) g.globalAlpha *= o.varK ?? ART.prog(rk, 0.55, 0.9); g.font = F(38 * s, 900); g.fillStyle = o.varPct >= 0 ? "#5FD35F" : "#FF5A66"; g.fillText((o.varPct >= 0 ? "+" : "") + o.varPct + "%", x0 + 170 * s, y0 + 136 * s); g.restore(); }
    const go = { barras: o.barras, amanha: o.amanha, prog: o.prog ?? 1, brilhoAmanha: o.brilhoAmanha || 0 };
    if (o.corHoje) go.corHoje = o.corHoje; if (o.cores) go.cores = o.cores;
    UI.grafico7(g, x0 + 36 * s, y0 + 180 * s, 250 * s, 160 * s, go);
    // preço
    if (antes == null) {
      g.textAlign = "right"; g.font = F(30 * s * TE, 800); g.fillStyle = "#A3A0AE"; g.fillText(o.rotuloPreco || "HOJE PAGA", x0 + w - 36 * s, y0 + 216 * s - (TE - 1) * 14 * s);
      const pt = o.precoTexto != null ? String(o.precoTexto) : String(o.preco ?? 40), pa = clamp(o.precoK ?? 1);   // precoTexto: '?' · precoK: 0 esconde
      if (pa > 0) { g.save(); g.globalAlpha *= pa;
      g.font = F(104 * s, 1000); g.fillStyle = o.corPreco || "#FFD23F"; g.fillText(pt, x0 + w - 36 * s, y0 + 316 * s);
      UI.pix(g, "moeda", x0 + w - 36 * s - measure(g, pt, 104 * s) - 40 * s, y0 + 282 * s, 46 * s); g.restore(); }
    } else precoComAntes(g, x0, y0, w, s, o, antes, rk);
    g.textAlign = "right"; g.font = F(26 * s * TE, 800); g.fillStyle = TE > 1 ? "#C3C0CE" : "#A3A0AE"; g.fillText("moedas", x0 + w - 36 * s, y0 + 352 * s + (TE - 1) * 8 * s);
    g.restore();
    return { x0, y0, w, h };
  };
  /** Parte 2: preço de ontem riscado -> preço novo rolando; o de ontem fica pequeno e riscado no canto (fantasma) */
  function precoComAntes(g, x0, y0, w, s, o, antes, rk) {
    const novo = o.preco ?? 40, xr = x0 + w - 36 * s, desce = novo < antes;
    const corN = o.corPreco || (desce ? "#FF5A66" : "#FFD23F");
    const risco = ART.prog(rk, 0, 0.3, "outCubic"), rola = ART.prog(rk, 0.3, 0.85, "inOutCubic"), troca = ART.prog(rk, 0.3, 0.6);
    // rótulo: ONTEM -> HOJE PAGA
    g.save(); g.textAlign = "right"; g.font = F(30 * s * (o.textoEscala || 1), 800); g.fillStyle = "#A3A0AE";
    g.globalAlpha *= 1 - troca; g.fillText(o.rotuloAntes || "ONTEM", xr, y0 + 216 * s); g.restore();
    g.save(); g.textAlign = "right"; g.font = F(30 * s * (o.textoEscala || 1), 800); g.fillStyle = "#A3A0AE";
    g.globalAlpha *= troca; g.fillText(o.rotuloPreco || "HOJE PAGA", xr, y0 + 216 * s); g.restore();
    // número grande
    const px = 104 * s, cor = rola > 0 ? ART.mix("#FFD23F", corN, ART.prog(rola, 0, 0.3)) : "#FFD23F";
    const pa = clamp(o.precoK ?? 1);
    if (pa > 0) { g.save(); g.globalAlpha *= pa;
    const pw = UI.precoRolando(g, xr, y0 + 316 * s, antes, novo, rola, px, cor);
    UI.pix(g, "moeda", xr - pw - 40 * s, y0 + 282 * s, 46 * s); g.restore(); }
    const some = 1 - ART.prog(rk, 0.3, 0.42);   // risco sobre o número antigo (some quando ele rola)
    if (risco > 0 && some > 0) { const ww = measure(g, String(antes), px) + 24 * s; g.save(); g.globalAlpha *= some; g.lineCap = "round"; g.strokeStyle = "#E63748"; g.lineWidth = 11 * s; g.beginPath(); g.moveTo(xr - ww, y0 + 290 * s); g.lineTo(xr - ww + (ww + 12 * s) * risco, y0 + 268 * s); g.stroke(); g.restore(); }
    // fantasma do preço antigo no canto superior direito
    const fk = ART.prog(rk, 0.6, 1) * (o.antesFantasma ?? 1);
    if (fk > 0) {
      g.save(); g.globalAlpha *= fk; g.textAlign = "right";
      g.font = F(24 * s * (o.textoEscala || 1), 900); g.fillStyle = "#8E8A9A"; g.letterSpacing = 2 * s + "px"; g.fillText(o.rotuloAntes || "ONTEM", xr, y0 + 64 * s); g.letterSpacing = "0px";
      g.font = F(64 * s, 1000); g.fillStyle = "#8E8A9A"; g.fillText(String(antes), xr, y0 + 128 * s);
      const aw = measure(g, String(antes), 64 * s);
      g.strokeStyle = "#E63748"; g.lineWidth = 7 * s; g.lineCap = "round"; g.beginPath(); g.moveTo(xr - aw - 8 * s, y0 + 116 * s); g.lineTo(xr + 8 * s, y0 + 96 * s); g.stroke();
      g.restore();
    }
  }

  /** linha do Mercado (como no jogo): x,y = canto sup. esq. o = {tipo, nome, qtd, barras, amanha, varPct, valor, w, s}
   *  Parte 2: a (opacidade; "apagada" ≈ 0.4), pulso (0..1: borda dourada piscando, chama atenção) */
  UI.linhaMercado = (g, x, y, o = {}) => {
    if (o.a != null || o.pulso) {
      const s = o.s || 1, w = (o.w || 900) * s, h = 120 * s, p = clamp(o.pulso || 0);
      g.save(); g.globalAlpha *= o.a ?? 1; UI.linhaMercado(g, x, y, { ...o, a: undefined, pulso: 0 });
      if (p > 0) { ART.rr(g, x - 4 * s, y - 4 * s, w + 8 * s, h + 8 * s, 28 * s); g.lineWidth = 7 * s; g.strokeStyle = ART.rgba("#FFD23F", 0.85 * p); g.stroke(); ART.glow(g, x + w / 2, y + h / 2, w * 0.55, "#FFD23F", 0.3 * p); }
      g.restore(); return;
    }
    if (o.textoEscala || o.moeda) return linhaMercado2(g, x, y, o);
    const s = o.s || 1, w = (o.w || 900) * s, h = 120 * s;
    UI.cartao(g, x, y, w, h, { r: 24 * s, cor: o.destaque ? "#2A2540" : P.uiCard, borda: o.destaque ? "#FFD23F" : P.uiBorda, bw: o.destaque ? 4 : 2.5, sombra: false });
    ART.rr(g, x + 18 * s, y + 18 * s, 84 * s, 84 * s, 18 * s); g.fillStyle = "#2A2640"; g.fill();
    UI.pix(g, o.tipo, x + 60 * s, y + 60 * s, 52 * s);
    g.fillStyle = "#F4EEDC"; g.font = F(44 * s, 900); g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(o.nome, x + 124 * s, y + 60 * s);
    g.fillStyle = "#A3A0AE"; g.font = F(34 * s, 800); g.fillText("×" + (o.qtd ?? 1), x + 300 * s, y + 62 * s);
    UI.grafico7(g, x + 400 * s, y + 24 * s, 150 * s, 64 * s, { barras: o.barras, amanha: o.amanha, prog: o.prog ?? 1 });
    if (o.varPct != null) { g.fillStyle = o.varPct >= 0 ? "#5FD35F" : "#FF5A66"; g.font = F(38 * s, 900); g.fillText((o.varPct >= 0 ? "+" : "") + o.varPct + "%", x + 580 * s, y + 62 * s); }
    UI.botao(g, x + w - 120 * s, y + h / 2 - 6 * s, 200 * s, 80 * s, { texto: String(o.valor ?? ""), cor: "roxo", press: 1 });
  };
  /** linha do Mercado legível (Parte 2, correção): textoEscala (1.3 recomendado) e moeda (ícone no botão de valor). Altura 120·s·(0.8+0.2·te). */
  function linhaMercado2(g, x, y, o) {
    const s = o.s || 1, te = o.textoEscala || 1, w = (o.w || 900) * s, h = 120 * s * (0.8 + 0.2 * te);
    UI.cartao(g, x, y, w, h, { r: 24 * s, cor: o.destaque ? "#2A2540" : P.uiCard, borda: o.destaque ? "#FFD23F" : P.uiBorda, bw: o.destaque ? 4 : 2.5, sombra: false });
    const q = h - 36 * s; ART.rr(g, x + 18 * s, y + 18 * s, q, q, 18 * s); g.fillStyle = "#2A2640"; g.fill();
    UI.pix(g, o.tipo, x + 18 * s + q / 2, y + h / 2, q * 0.62);
    let cx = x + 36 * s + q;
    g.fillStyle = "#F4EEDC"; g.font = F(44 * s * te, 1000); g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(o.nome, cx, y + h / 2 + 2 * s);
    cx += measure(g, o.nome, 44 * s * te) + 18 * s;
    g.fillStyle = "#C9C3E8"; g.font = F(36 * s * te, 900); g.fillText("×" + (o.qtd ?? 1), cx, y + h / 2 + 3 * s);
    if (o.grafico !== false && te <= 1.15) UI.grafico7(g, x + 400 * s, y + 24 * s, 150 * s, 64 * s, { barras: o.barras, amanha: o.amanha, prog: o.prog ?? 1 });
    if (o.varPct != null) { g.fillStyle = o.varPct >= 0 ? "#5FD35F" : "#FF5A66"; g.font = F(38 * s * te, 900); g.fillText((o.varPct >= 0 ? "+" : "") + o.varPct + "%", x + w - 300 * s * (0.8 + 0.2 * te) - 120 * s, y + h / 2 + 3 * s); }
    const bw = 200 * s * te, bh = Math.min(h - 24 * s, 80 * s * te);
    UI.botao(g, x + w - bw / 2 - 20 * s, y + h / 2 - 6 * s, bw, bh, { texto: String(o.valor ?? ""), cor: o.corBotao || "roxo", press: 1, icone: o.moeda ? "moeda" : undefined, textoEscala: te > 1 ? 1.25 : 1 });
  }

  // ================================================================= etiqueta de raridade + feixe
  UI.etiqueta = (g, x, y, o = {}) => {
    const s = o.s || 1, txt = (o.texto || "RARO").toUpperCase(), cor = o.cor || "#FF9A3C";
    g.save(); g.globalAlpha *= o.a ?? 1; g.font = F(40 * s, 1000);
    const w = g.measureText(txt).width + 60 * s, h = 70 * s;
    g.shadowColor = ART.rgba(cor, 0.8); g.shadowBlur = 30 * s;
    ART.rr(g, x - w / 2, y - h / 2, w, h, 16 * s); g.fillStyle = ART.rgba(ART.shade(cor, -0.55), 0.85); g.fill();
    g.shadowColor = "transparent"; g.lineWidth = 3 * s; g.strokeStyle = cor; g.stroke();
    g.fillStyle = ART.shade(cor, 0.4); g.textAlign = "center"; g.textBaseline = "middle"; g.letterSpacing = 4 * s + "px"; g.fillText(txt, x, y + 2 * s);
    g.restore();
  };
  /** coluna de luz vertical sobre um item raro (como o "RARA" da referência) */
  UI.feixe = (g, x, yChao, t, o = {}) => {
    const cor = o.cor || "#FF9A3C", k = o.k ?? 1, w = (o.w || 90) * (0.9 + 0.1 * Math.sin(t * 9));
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = k;
    g.fillStyle = ART.lg(g, x - w, 0, x + w, 0, [[0, ART.rgba(cor, 0)], [0.5, ART.rgba(cor, 0.55)], [1, ART.rgba(cor, 0)]]);
    g.fillRect(x - w, 0, w * 2, yChao);
    g.fillStyle = ART.lg(g, x - w * 0.2, 0, x + w * 0.2, 0, [[0, "rgba(255,255,255,0)"], [0.5, "rgba(255,255,255,.85)"], [1, "rgba(255,255,255,0)"]]);
    g.fillRect(x - w * 0.2, 0, w * 0.4, yChao);
    g.restore();
    // poça de luz no chão
    g.save(); g.translate(x, yChao); g.scale(1, 0.25); ART.glow(g, 0, 0, w * 3, cor, 0.8 * k); g.restore();
    // brilhos subindo
    const sp = ART.rng(o.seed || 3);
    g.save(); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 14; i++) { const ph = (t * (0.4 + sp() * 0.5) + sp()) % 1, xx = x + (sp() - 0.5) * w * 1.4, yy = yChao - ph * yChao * 0.8; g.globalAlpha = k * Math.sin(ph * Math.PI); ART.circ(g, xx, yy, 3 + sp() * 4); g.fillStyle = "#FFF5D8"; g.fill(); }
    g.restore();
  };

  // ================================================================= cartão fixo SALDO × META · DIA X DE 30
  /** x,y = centro. o = {saldo, meta (1000), dia, total (30), s, a, pulso, rotuloExtra} */
  UI.cartaoMeta = (g, x, y, o = {}) => {
    const s = o.s || 1, w = 640 * s, h = 210 * s, x0 = x - w / 2, y0 = y - h / 2, meta = o.meta ?? 1000, saldo = o.saldo ?? 0;
    g.save(); g.globalAlpha *= o.a ?? 1;
    UI.cartao(g, x0, y0, w, h, { vidro: o.vidro !== false, r: 32 * s, cor: "rgba(20,18,31,.78)", borda: "rgba(255,210,63,.35)", bw: 3 });
    g.textBaseline = "alphabetic"; g.textAlign = "left";
    g.font = F(28 * s, 900); g.fillStyle = "#A3A0AE"; g.letterSpacing = 3 * s + "px"; g.fillText("SALDO", x0 + 36 * s, y0 + 56 * s);
    g.textAlign = "right"; g.fillText(`DIA ${o.dia ?? 1} DE ${o.total ?? 30}`, x0 + w - 36 * s, y0 + 56 * s);
    g.letterSpacing = "0px"; g.textAlign = "left";
    UI.pix(g, "moeda", x0 + 62 * s, y0 + 112 * s, 46 * s);
    g.font = F(74 * s, 1000); g.fillStyle = "#FFD23F"; const st = ART.num(Math.round(saldo)); g.fillText(st, x0 + 100 * s, y0 + 136 * s);
    const sw = measure(g, st, 74 * s);
    g.font = F(44 * s, 900); g.fillStyle = "#F4EEDC"; g.fillText(" / " + ART.num(meta), x0 + 100 * s + sw, y0 + 134 * s);
    if (o.rotuloExtra) { g.textAlign = "right"; g.font = F(34 * s, 1000); g.fillStyle = "#5FD35F"; g.fillText(o.rotuloExtra, x0 + w - 36 * s, y0 + 132 * s); }
    // barra de meta
    const bx = x0 + 36 * s, by = y0 + 164 * s, bw = w - 72 * s, bh = 18 * s, f = clamp(saldo / meta);
    ART.rr(g, bx, by, bw, bh, bh / 2); g.fillStyle = "rgba(255,255,255,.1)"; g.fill();
    if (f > 0) { ART.rr(g, bx, by, Math.max(bh, bw * f), bh, bh / 2); g.fillStyle = ART.lg(g, bx, 0, bx + bw, 0, [[0, "#FFB548"], [1, "#FFD23F"]]); g.fill(); }
    if (o.pulso) ART.glow(g, x, y, w * 0.55, "#FFD23F", 0.3 * o.pulso);
    g.restore();
  };

  // ================================================================= ramos da árvore de habilidades
  UI.RAMOS = [
    { nome: "Mina", icone: "picareta", cor: "#A3A0AE", max: 14 },
    { nome: "Força", icone: "punho", cor: "#E63748", max: 12 },
    { nome: "Valor", icone: "valor", cor: "#FFC531", max: 13 },
    { nome: "Tempo", icone: "tempo", cor: "#3FC6D6", max: 7 },
    { nome: "Poderes", icone: "raio", cor: "#FFB548", max: 16 },
    { nome: "Forja", icone: "bigorna", cor: "#E07B39", max: 5 },
    { nome: "Ajudantes", icone: "ajudante", cor: "#9B5CF0", max: 9 },
  ];
  /** cartão de ramo: x,y = canto sup. esq. o = {ramo (índice ou objeto), nivel, aceso (0..1), w, s, pulso} */
  UI.ramo = (g, x, y, o = {}) => {
    const R = typeof o.ramo === "number" ? UI.RAMOS[o.ramo] : o.ramo || UI.RAMOS[0];
    const s = o.s || 1, w = (o.w || 760) * s, h = 132 * s, ac = clamp(o.aceso ?? 1), nv = o.nivel ?? 0;
    g.save(); g.globalAlpha *= o.a ?? 1;
    const borda = ac > 0.5 ? ART.mix("#302B41", R.cor, ac) : P.uiBorda;
    UI.cartao(g, x, y, w, h, { r: 28 * s, cor: ART.mix("#1E1B2E", ART.shade(R.cor, -0.7), ac * 0.6), borda, bw: 3 + 2 * ac, sombra: o.sombra });
    // quadrado do ícone na cor do ramo
    ART.rr(g, x + 22 * s, y + 20 * s, 92 * s, 92 * s, 22 * s); g.fillStyle = ART.mix("#2A2640", ART.shade(R.cor, -0.35), 0.35 + 0.65 * ac); g.fill();
    UI.pix(g, R.icone, x + 68 * s, y + 66 * s, 58 * s);
    g.fillStyle = ART.mix("#8C88A0", "#F4EEDC", ac); g.font = F(54 * s, 1000); g.textAlign = "left"; g.textBaseline = "middle";
    g.fillText(R.nome, x + 140 * s, y + 62 * s);
    // bolinhas de nível
    const nd = Math.min(R.max, 7), dx = 30 * s, x1 = x + w - 40 * s - (nd - 1) * dx;
    for (let i = 0; i < nd; i++) {
      ART.circ(g, x1 + i * dx, y + 66 * s, 10 * s);
      g.fillStyle = i < nv ? R.cor : "rgba(255,255,255,.12)"; g.fill();
      if (i < nv) ART.glow(g, x1 + i * dx, y + 66 * s, 30 * s, R.cor, 0.5);
    }
    g.textAlign = "right"; g.font = F(30 * s, 900); g.fillStyle = "#A3A0AE"; g.fillText(`${nv}/${R.max}`, x1 - 26 * s, y + 68 * s);
    if (o.pulso) { ART.rr(g, x, y, w, h, 28 * s); g.lineWidth = 8 * s; g.strokeStyle = ART.rgba(R.cor, 0.6 * o.pulso); g.stroke(); ART.glow(g, x + w / 2, y + h / 2, w * 0.6, R.cor, 0.25 * o.pulso); }
    g.restore();
  };
  /** título de painel da Toca (amarelo, caixa-alta) */
  UI.titulo = (g, x, y, txt, o = {}) => {
    const s = o.s || 1;
    g.save(); g.font = F(84 * s, 1000); g.textAlign = "center"; g.textBaseline = "middle"; g.letterSpacing = 4 * s + "px";
    g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 20; g.shadowOffsetY = 8; g.fillStyle = o.cor || "#FFD23F"; g.fillText(txt, x, y);
    g.restore();
  };

  // ================================================================= legenda de exemplo (só p/ julgar contraste; a real é do pipeline)
  /** legenda no estilo definido: Anton, branca, caixa-alta, 1 palavra amarela (#EBBA40), contorno fino + sombra.
   *  palavras: [{w, amarelo}] ou string com *destaque*. y = centro (padrão 1400). */
  UI.legendaExemplo = (g, palavras, o = {}) => {
    if (typeof palavras === "string") palavras = palavras.split(" ").map(w => ({ w: w.replace(/\*/g, ""), amarelo: /\*/.test(w) }));
    const size = o.size || 92, y = o.y ?? 1400, gap = size * 0.24;
    g.save(); g.font = `400 ${size}px "Anton"`; g.textBaseline = "middle"; g.textAlign = "left";
    const ws = palavras.map(p => g.measureText(p.w.toUpperCase()).width), total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
    let x = (o.cx ?? 540) - total / 2;
    palavras.forEach((p, i) => {
      const s = p.w.toUpperCase();
      g.lineJoin = "round"; g.shadowColor = "rgba(0,0,0,.65)"; g.shadowBlur = 18; g.shadowOffsetY = 6;
      g.lineWidth = size * 0.11; g.strokeStyle = "#161408"; g.strokeText(s, x, y);
      g.shadowColor = "transparent"; g.fillStyle = p.amarelo ? "#EBBA40" : "#FFFFFF"; g.fillText(s, x, y);
      x += ws[i] + gap;
    });
    g.restore();
  };
})();
