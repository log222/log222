/* MAGMA DIG — kit de arte: painéis da Toca (C5), ciência blueprint (C6), profundezas / Coração de Magma (C8),
 * closes de objeto em holofote (C7) e a pata do Zeca em close.
 */
(function () {
  const ART = window.ART, P = ART.pal, UI = () => ART.ui;
  const { clamp, lerp } = ART;
  const W = 1080, H = 1920;
  ART.obj = ART.obj || {};

  // ================================================================= fundo "noite na Toca" desfocado (para painéis)
  /** cena de fundo para painéis: a Toca bem desfocada e escurecida (cacheada) */
  ART.cenas.tocaDesfocada = (o = {}) => {
    const base = ART.cenas.toca({ meta: { riscados: o.riscados ?? 1 } });
    return {
      fundo: [{ d: 0.3, draw(g, t) {
        const c = ART.cache("tocaDesf", W / 3, H / 3, (gg) => {
          gg.scale(1 / 3, 1 / 3); const cam = { zoom: 1.15, x: 0, y: 0 };
          for (const L of base.fundo) ART.withLayer(gg, cam, L.d, x => L.draw(x, 0));
          base.luz(gg, 0, cam);
        });
        const cb = ART.blurred(c, 4, "tocaDesfB");
        g.save(); g.drawImage(cb, -40, -40, W + 80, H + 80);
        g.fillStyle = "rgba(14,11,24,.62)"; g.fillRect(0, 0, W, H); g.restore();
        ART.dust(g, t, { count: 30, seed: 8, color: "#FFE0B0", alpha: 0.35 });
      } }],
      frente: [], luz: null,
    };
  };

  // ================================================================= C5: painéis
  /** painel HABILIDADES com os 7 ramos. o = {niveis:[7], acesos: n (quantos já acenderam, fracionário), destaque: índice, pulso, y0} */
  ART.painelHabilidades = (g, t, o = {}) => {
    const u = UI(), s = o.s || 0.86, y0 = o.y0 ?? 330, gap = 136 * s;
    u.titulo(g, 540, y0, "HABILIDADES", { s: 0.9 });
    g.save(); g.font = '900 34px "Nunito"'; g.fillStyle = "#A3A0AE"; g.textAlign = "center"; g.fillText(o.subtitulo ?? "RAMOS · NÍVEL 0", 540, y0 + 66); g.restore();
    const ac = o.acesos ?? 7;
    u.RAMOS.forEach((R, i) => {
      const k = clamp(ac - i), y = y0 + 110 + i * gap, slide = (1 - ART.ease.outCubic(clamp(k * 3))) * 60;
      u.ramo(g, 540 - 760 * s / 2 + slide, y, { ramo: i, nivel: (o.niveis || [])[i] || 0, aceso: o.destaque != null ? (i === o.destaque ? 1 : 0.35) : k, s, a: 0.35 + 0.65 * clamp(k * 2), pulso: i === o.destaque ? o.pulso || 0 : 0, sombra: false });
    });
  };
  /** painel MERCADO: linhas Pedra/Cobre e botão VENDER. o = {preco, varPct, saldo, prog, press, seta, setaSombra} */
  ART.painelMercado = (g, t, o = {}) => {
    const u = UI();
    u.titulo(g, 540, o.y0 ?? 330, "MERCADO", { s: 0.9 });
    const c = u.cartaoMinerio(g, 540, 700, { tipo: "cobre", nome: "Cobre", preco: o.preco ?? 40, varPct: o.varPct ?? 12, barras: [0.42, 0.5, 0.38, 0.55, 0.47, 0.6, 0.66], amanha: 0.82, prog: o.prog ?? 1, s: 1.55, brilhoAmanha: o.brilhoAmanha || 0 });
    if ((o.seta ?? 1) > 0) {
      const k = ART.ease.outBack(clamp(o.seta ?? 1)), sx = c.x0 + c.w - 30, sy = c.y0 - 20;
      if (o.setaSombra) { g.save(); u.seta(g, sx + 26, sy + 40, { s: 0.85, dir: "baixo", cor: "#E63748", a: 0.55 * o.setaSombra }); g.restore(); }
      const tr = o.tremor ? Math.sin(t * 40) * 4 * o.tremor : 0;
      u.seta(g, sx + tr, sy - 30 * k + 30, { s: 0.85 * k, dir: "cima" });
      g.save(); g.font = '900 30px "Nunito"'; g.fillStyle = "#5FD35F"; g.textAlign = "center"; g.globalAlpha = clamp(o.seta ?? 1); g.fillText("AMANHÃ", sx, sy + 90); g.restore();
    }
    u.botao(g, 540, 1130, 720, 150, { texto: "VENDER", sub: `+${o.preco ?? 40} moedas`, icone: "moeda", press: o.press || 0 });
    return c;
  };

  // ================================================================= pata do Zeca em close
  /** braço+pata em close vindo de uma borda. (x,y) = ponta da pata; ang = direção do braço (graus, 0 = vem da direita);
   *  o = {s, dedos: 'aberta'|'aponta'|'segura', objeto: fn(g) desenhado na palma} */
  ART.pata = (g, x, y, ang = 0, o = {}) => {
    const s = o.s || 1, dedos = o.dedos || "aberta";
    const Lb = (o.braco ?? 250) / s + 60;   // comprimento visível do braço em px de tela (padrão 250)
    g.save(); g.translate(x, y); g.rotate(ART.deg(ang)); g.scale(s, s);
    // antebraço: pele com placas de casco, termina esfumado (não atravessa o quadro)
    const arm = () => ART.capsule(g, 70, 0, Lb + 200, 20 * Lb / 1000, 72);
    g.save();
    g.beginPath(); g.rect(-400, -300, Lb + 400, 600); g.clip();
    g.shadowColor = "rgba(0,0,0,.5)"; g.shadowBlur = 50; g.shadowOffsetY = 24;
    arm(); g.fillStyle = P.pele; g.fill(); g.shadowColor = "transparent";
    g.save(); arm(); g.clip();
    g.fillStyle = ART.lg(g, 0, -72, 0, 92, [[0, "rgba(255,240,220,.25)"], [0.5, "rgba(0,0,0,0)"], [1, "rgba(60,20,20,.35)"]]); g.fillRect(0, -100, Lb + 300, 220);
    g.beginPath(); g.moveTo(230, -90); g.lineTo(Lb + 300, -90); g.lineTo(Lb + 300, 40); g.quadraticCurveTo(600, 30, 230, 10); g.closePath();
    g.fillStyle = ART.lg(g, 0, -80, 0, 30, [[0, P.cascoClaro], [1, P.casco]]); g.fill();
    for (let i = 0; i < 12; i++) { const xx = 280 + i * 90; if (xx > Lb + 60) break; g.beginPath(); g.moveTo(xx, -90); g.quadraticCurveTo(xx + 22, -30, xx - 4, 22); g.lineWidth = 7; g.strokeStyle = ART.rgba(P.cascoEsc, 0.7); g.stroke(); }
    g.restore();
    // esfuma o fim do braço (mistura com o fundo escuro)
    g.globalCompositeOperation = "source-atop"; g.fillStyle = ART.lg(g, Lb - 160, 0, Lb, 0, [[0, "rgba(14,10,22,0)"], [1, "rgba(14,10,22,.95)"]]); g.fillRect(Lb - 160, -120, 170, 240);
    g.restore();
    // pata (luva redonda)
    ART.ell(g, 20, 4, 108, 92); g.fillStyle = ART.rg(g, -10, -40, 10, 130, [[0, ART.shade(P.pele, 0.16)], [1, ART.shade(P.pele, -0.04)]]); g.fill();
    // dedos curtos + garras escuras
    const fing = dedos === "aponta" ? [[-40, 1.5], [10, 0.55], [48, 0.5]] : dedos === "segura" ? [[-50, 0.5], [-8, 0.55], [32, 0.5], [66, 0.4]] : [[-54, 0.85], [-14, 1], [26, 0.95], [62, 0.7]];
    for (const [dy, l] of fing) {
      const ex = -70 - 60 * l, ey = dy * 1.05;
      ART.capsule(g, -40, dy * 0.85, ex, ey, 25); g.fillStyle = ART.shade(P.pele, 0.08); g.fill();
      ART.capsule(g, -40, dy * 0.85 + 8, ex, ey + 8, 18); g.fillStyle = "rgba(160,90,70,.18)"; g.fill();
      g.beginPath(); g.moveTo(ex - 10, ey - 13); g.quadraticCurveTo(ex - 52, ey - 6, ex - 58, ey + 6); g.quadraticCurveTo(ex - 30, ey + 12, ex - 8, ey + 12); g.closePath();
      g.fillStyle = "#4A2E28"; g.fill(); g.beginPath(); g.moveTo(ex - 16, ey - 8); g.quadraticCurveTo(ex - 40, ey - 6, ex - 48, ey); g.lineWidth = 3; g.strokeStyle = "rgba(255,255,255,.35)"; g.stroke();
    }
    // almofadinha rosada
    ART.ell(g, 30, 30, 34, 22, 0.2); g.fillStyle = ART.rgba(P.bochecha, 0.55); g.fill();
    if (o.objeto) o.objeto(g);
    g.restore();
  };

  // ================================================================= C6: CIÊNCIA (blueprint)
  const BP = { bg0: "#061A26", bg1: "#0B3144", linha: "#8FD3E8", fraca: "rgba(143,211,232,.35)", rosa: "#F08AA8", amarelo: "#EBBA40" };
  ART.BP = BP;
  /** fundo blueprint com grade e brilho central */
  ART.blueprint = (g, t, o = {}) => {
    const c = ART.cache("bp:fundo", W, H, gg => {
      gg.fillStyle = ART.rg(gg, W / 2, H * 0.45, 100, 1300, [[0, BP.bg1], [1, BP.bg0]]); gg.fillRect(0, 0, W, H);
      gg.strokeStyle = "rgba(143,211,232,.07)"; gg.lineWidth = 1.5;
      for (let x = 0; x <= W; x += 40) { gg.beginPath(); gg.moveTo(x, 0); gg.lineTo(x, H); gg.stroke(); }
      for (let y = 0; y <= H; y += 40) { gg.beginPath(); gg.moveTo(0, y); gg.lineTo(W, y); gg.stroke(); }
      gg.strokeStyle = "rgba(143,211,232,.14)"; gg.lineWidth = 2;
      for (let x = 0; x <= W; x += 200) { gg.beginPath(); gg.moveTo(x, 0); gg.lineTo(x, H); gg.stroke(); }
      for (let y = 0; y <= H; y += 200) { gg.beginPath(); gg.moveTo(0, y); gg.lineTo(W, y); gg.stroke(); }
    });
    g.drawImage(c, 0, 0);
    // linha de varredura
    const sy = ((t * 260) % (H + 400)) - 200;
    g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = ART.lg(g, 0, sy - 80, 0, sy, [[0, "rgba(143,211,232,0)"], [1, "rgba(143,211,232,.08)"]]); g.fillRect(0, sy - 80, W, 82); g.restore();
  };
  /** traço com brilho ciano */
  const neon = (g, fn, o = {}) => { g.save(); g.strokeStyle = o.cor || BP.linha; g.lineWidth = o.w || 3; g.lineCap = "round"; g.lineJoin = "round"; g.shadowColor = o.cor || BP.linha; g.shadowBlur = o.blur ?? 12; if (o.dash) g.setLineDash(o.dash); fn(); g.restore(); };
  const rotulo = (g, txt, x, y, o = {}) => { g.save(); g.font = `${o.w || 900} ${o.size || 34}px "Nunito"`; g.letterSpacing = (o.sp ?? 4) + "px"; g.fillStyle = o.cor || BP.linha; g.textAlign = o.align || "left"; g.textBaseline = "middle"; g.shadowColor = o.cor || BP.linha; g.shadowBlur = 10; g.globalAlpha *= o.a ?? 1; g.fillText(txt, x, y); g.restore(); };
  ART.bpRotulo = rotulo;

  /** corte da crosta com o furo de Kola. o = {furo: 0..1, regua: 0..1, anos: 0..1 (1970→1989), rotulo: 0..1, y0 (superfície)} */
  ART.ciencia = {};
  ART.ciencia.crosta = (g, t, o = {}) => {
    ART.blueprint(g, t);
    const y0 = o.y0 ?? 470, y1 = o.y1 ?? 1250, x0 = 120, x1 = 960, fx = 600;
    // superfície com montinhos
    neon(g, () => { g.beginPath(); g.moveTo(x0 - 120, y0); for (let x = x0 - 120; x <= x1 + 120; x += 30) g.lineTo(x, y0 - Math.max(0, Math.sin(x * 0.02) * 10)); g.stroke(); }, { w: 4 });
    // camadas (hachura)
    const camadas = [[y0, y0 + 120, "SEDIMENTOS"], [y0 + 120, y0 + 430, "GRANITO"], [y0 + 430, y1, "BASALTO"]];
    camadas.forEach(([a, b, nome], i) => {
      neon(g, () => { g.beginPath(); g.moveTo(x0 - 120, b); for (let x = x0 - 120; x <= x1 + 120; x += 40) g.lineTo(x, b + Math.sin(x * 0.01 + i) * 8); g.stroke(); }, { w: 2, cor: BP.fraca, blur: 4 });
      g.save(); g.beginPath(); g.rect(0, a, W, b - a); g.clip(); g.strokeStyle = "rgba(143,211,232,.09)"; g.lineWidth = 2;
      for (let k = -H; k < W + H; k += 26 + i * 8) { g.beginPath(); g.moveTo(k, a); g.lineTo(k - (b - a), b); g.stroke(); }
      g.restore();
      rotulo(g, nome, 150, (a + b) / 2, { size: 26, cor: BP.fraca, sp: 6 });
    });
    // régua de profundidade (direita do furo)
    const rk = clamp(o.regua ?? 1), rx = 820;
    neon(g, () => { g.beginPath(); g.moveTo(rx, y0); g.lineTo(rx, lerp(y0, y1, rk)); g.stroke(); for (let i = 0; i <= 12; i++) { const yy = lerp(y0, y1, i / 12); if (yy > lerp(y0, y1, rk) + 1) break; g.beginPath(); g.moveTo(rx, yy); g.lineTo(rx + (i % 3 === 0 ? 34 : 16), yy); g.stroke(); } });
    for (let i = 0; i <= 12; i += 3) { const yy = lerp(y0, y1, i / 12); if (i / 12 <= rk + 0.001) rotulo(g, `${i} KM`, rx + 46, yy, { size: 28, sp: 2 }); }
    // furo
    const fk = clamp(o.furo ?? 1), fy = lerp(y0, y1, fk);
    g.save(); g.fillStyle = "rgba(6,20,30,.9)"; g.fillRect(fx - 7, y0, 14, fy - y0); g.restore();
    neon(g, () => { g.beginPath(); g.moveTo(fx - 7, y0); g.lineTo(fx - 7, fy); g.moveTo(fx + 7, y0); g.lineTo(fx + 7, fy); g.stroke(); }, { w: 3, cor: BP.amarelo, blur: 14 });
    // broca na ponta + torre
    neon(g, () => { ART.poly(g, [[fx - 10, fy], [fx + 10, fy], [fx, fy + 24]]); g.stroke(); }, { cor: BP.amarelo });
    if (fk < 1) ART.glow(g, fx, fy + 10, 60, BP.amarelo, 0.5 + 0.3 * Math.sin(t * 30));
    neon(g, () => { g.beginPath(); g.moveTo(fx - 50, y0); g.lineTo(fx, y0 - 170); g.lineTo(fx + 50, y0); g.moveTo(fx - 33, y0 - 60); g.lineTo(fx + 33, y0 - 60); g.moveTo(fx - 18, y0 - 115); g.lineTo(fx + 18, y0 - 115); g.stroke(); }, { w: 3 });
    // rótulos
    const lk = clamp(o.rotulo ?? 1);
    if (lk > 0) { rotulo(g, "POÇO DE KOLA · RÚSSIA", 540, y0 - 230, { align: "center", size: 40, a: lk }); }
    if (fk >= 1) {
      const k = ART.prog(t, o.t12 ?? 0, (o.t12 ?? 0) + 0.3);
      g.save(); g.globalAlpha = k; ART.textFx(g, "12 KM", fx - 160, y1 - 10, { size: 96, fam: "Lilita One", fill: BP.amarelo, stroke: "#03121A", sw: 12, shadow: "rgba(235,186,64,.5)", sblur: 30, sdy: 0 }); g.restore();
    }
    if (o.anos != null) {
      const ano = Math.round(lerp(1970, 1989, clamp(o.anos)));
      UI().cartao(g, 140, y0 + 520, 330, 150, { vidro: false, cor: "rgba(6,26,38,.85)", borda: BP.fraca });
      rotulo(g, "ANOS DE OBRA", 305, y0 + 562, { size: 24, align: "center", cor: BP.fraca });
      rotulo(g, String(ano), 305, y0 + 625, { size: 72, align: "center", cor: "#E8FAFF", sp: 2 });
    }
  };

  /** planeta em corte (crosta, manto, núcleo externo, núcleo interno). o = {r, cx, cy, nucleo (0..1 brilho), seta (0..1), risco12 (0..1), rotulos} */
  ART.ciencia.planeta = (g, t, o = {}) => {
    ART.blueprint(g, t);
    const cx = o.cx ?? 470, cy = o.cy ?? 880, R = o.r ?? 370;
    const camadas = [[1, "#0F3B52", "CROSTA"], [0.985, "#123F58", "MANTO"], [0.55, "#3A2A2E", "NÚCLEO EXTERNO"], [0.19, "#5A2A18", "NÚCLEO INTERNO"]];
    // planeta inteiro (contorno) + fatia removida (quadrante superior direito)
    const cut = (r) => { g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, -Math.PI / 2, 0, false); g.closePath(); };
    // parte externa
    ART.circ(g, cx, cy, R); g.fillStyle = "rgba(15,59,82,.65)"; g.fill();
    neon(g, () => { ART.circ(g, cx, cy, R); g.stroke(); }, { w: 4 });
    // continentes estilizados
    g.save(); ART.circ(g, cx, cy, R); g.clip(); g.strokeStyle = "rgba(143,211,232,.25)"; g.lineWidth = 2;
    for (let i = -6; i <= 6; i++) { g.beginPath(); g.ellipse(cx, cy, Math.abs(i) * R / 6.2, R, 0, 0, Math.PI * 2); g.stroke(); }
    for (let i = -5; i <= 5; i++) { g.beginPath(); g.moveTo(cx - R, cy + i * R / 6); g.lineTo(cx + R, cy + i * R / 6); g.stroke(); }
    g.restore();
    // fatia
    g.save(); cut(R + 2); g.fillStyle = BP.bg0; g.fill(); g.restore();
    const nk = clamp(o.nucleo ?? 0);
    const cores = [["#14506B", "#0F3B52"], ["#1E5F78", "#123F58"], [ART.mix("#4A2E2E", "#FF7A1A", nk), ART.mix("#2A1E22", "#C2410C", nk)], [ART.mix("#6A3A20", "#FFF1C8", nk), ART.mix("#4A2A18", "#FFB548", nk)]];
    camadas.forEach(([rk], i) => { cut(R * rk); g.fillStyle = ART.rg(g, cx, cy, 0, R * rk, [[0, cores[i][0]], [1, cores[i][1]]]); g.fill(); neon(g, () => { cut(R * rk); g.stroke(); }, { w: 2.5 }); });
    if (nk > 0) { ART.glow(g, cx, cy, R * 0.9, "#FF9A3C", 0.6 * nk); ART.glow(g, cx, cy, R * 0.25, "#FFF6DA", 0.9 * nk); }
    // rótulos das camadas
    if (o.rotulos !== false) {
      [[R * 0.995, "CROSTA"], [R * 0.78, "MANTO"], [R * 0.38, "NÚCLEO|EXTERNO"], [R * 0.1, "NÚCLEO|INTERNO"]].forEach(([rr, nome], i) => {
        const a = -Math.PI * 0.28 + i * 0.05, px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr, lx = cx + R + 40, ly = cy - R + 40 + i * 110;
        neon(g, () => { g.beginPath(); g.moveTo(px, py); g.lineTo(lx - 14, ly); g.stroke(); ART.circ(g, px, py, 4); g.stroke(); }, { w: 1.5, cor: BP.fraca, blur: 3 });
        nome.split("|").forEach((ln, j) => rotulo(g, ln, lx, ly + j * 30, { size: 24, sp: 2, cor: i === 3 && nk > 0 ? "#FFD08A" : BP.linha }));
      });
    }
    // risquinho de 12 km na superfície (em escala real seria 0,2% do raio)
    const rk = clamp(o.risco12 ?? 1);
    if (rk > 0) {
      const a = -Math.PI * 0.62, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
      neon(g, () => { g.beginPath(); g.moveTo(px, py); g.lineTo(px - Math.cos(a) * R * 0.0019 * 1.6, py - Math.sin(a) * R * 0.0019 * 1.6); g.stroke(); }, { cor: BP.amarelo, w: 4 });
      ART.circ(g, px, py, 26); g.save(); g.globalAlpha = rk; g.setLineDash([6, 6]); g.strokeStyle = BP.amarelo; g.lineWidth = 3; g.stroke(); g.restore();
      rotulo(g, "12 KM", px - 40, py - 54, { size: 40, cor: BP.amarelo, align: "right", a: rk });
    }
    // seta até o centro
    const sk = clamp(o.seta ?? 0);
    if (sk > 0) {
      const a = -Math.PI * 0.62, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R, ex = lerp(px, cx, sk), ey = lerp(py, cy, sk);
      neon(g, () => { g.beginPath(); g.moveTo(px, py); g.lineTo(ex, ey); g.stroke(); const ang = Math.atan2(cy - py, cx - px); g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - Math.cos(ang - 0.4) * 30, ey - Math.sin(ang - 0.4) * 30); g.moveTo(ex, ey); g.lineTo(ex - Math.cos(ang + 0.4) * 30, ey - Math.sin(ang + 0.4) * 30); g.stroke(); }, { cor: "#FFFFFF", w: 5 });
      if (sk > 0.9) rotulo(g, "6.371 KM", (px + cx) / 2 - 30, (py + cy) / 2 + 10, { size: 44, align: "right", cor: "#FFFFFF", a: ART.prog(sk, 0.9, 1) });
    }
    if (o.temperatura) {
      const k = clamp(o.temperatura);
      ART.textFx(g, "≈ 6.000 °C", cx, cy + R + 150, { size: 110, fam: "Lilita One", fill: ART.mix("#E8FAFF", "#FFB548", k), stroke: "#03121A", sw: 14, shadow: "rgba(255,150,60,.5)", sblur: 40 * k, sdy: 0 });
    }
  };
  /** tela dividida núcleo × Sol. o = {k: brilho 0..1} */
  ART.ciencia.nucleoSol = (g, t, o = {}) => {
    ART.blueprint(g, t);
    const k = clamp(o.k ?? 1), pul = 0.95 + 0.05 * Math.sin(t * 4);
    const disco = (x, y, r, rot) => {
      ART.glow(g, x, y, r * 2.4, "#FF8A3C", 0.55 * k);
      ART.circ(g, x, y, r * pul); g.fillStyle = ART.rg(g, x - r * 0.3, y - r * 0.3, 0, r * 1.1, [[0, "#FFFBEA"], [0.35, "#FFD86A"], [0.75, "#FF9A2A"], [1, "#E0561A"]]); g.fill();
      g.save(); ART.circ(g, x, y, r * pul); g.clip(); g.globalCompositeOperation = "overlay"; const r2 = ART.rng(rot);
      for (let i = 0; i < 40; i++) { const a = r2() * 6.28, d = r2() * r; ART.circ(g, x + Math.cos(a + t * 0.2) * d, y + Math.sin(a + t * 0.2) * d, r * (0.05 + r2() * 0.08)); g.fillStyle = r2() > 0.5 ? "rgba(255,255,255,.4)" : "rgba(160,40,0,.35)"; g.fill(); }
      g.restore();
    };
    disco(300, 840, 210, 3); disco(780, 840, 210, 7);
    neon(g, () => { g.beginPath(); g.moveTo(540, 380); g.lineTo(540, 1240); g.stroke(); }, { dash: [14, 12], cor: BP.fraca });
    rotulo(g, "NÚCLEO DA TERRA", 300, 520, { align: "center", size: 34 });
    rotulo(g, "SUPERFÍCIE DO SOL", 780, 520, { align: "center", size: 34 });
    for (const x of [300, 780]) rotulo(g, x < 540 ? "≈ 6.000 °C" : "≈ 5.500 °C", x, 1130, { align: "center", size: 52, cor: "#FFD08A", sp: 1 });
  };
  /** silhueta de um tatu real em linhas ciano, com destaque nas garras. o = {prog: 0..1 (desenho), garras: 0..1} */
  ART.ciencia.tatu = (g, t, o = {}) => {
    ART.blueprint(g, t);
    const pk = clamp(o.prog ?? 1);
    g.save(); g.translate(540, 900); g.scale(1.25, 1.25);
    const corpo = new Path2D("M-300,40 C-310,-40 -250,-130 -120,-150 C20,-170 160,-150 230,-80 C260,-50 270,-10 300,10 C330,30 370,40 380,60 C370,75 330,78 300,72 C270,70 250,80 230,95 C150,110 -100,110 -200,95 C-250,90 -290,75 -300,40 Z");
    g.strokeStyle = BP.linha; g.lineWidth = 3.5; g.shadowColor = BP.linha; g.shadowBlur = 12; g.setLineDash([3000]); g.lineDashOffset = 3000 * (1 - pk);
    g.stroke(corpo);
    // faixas da carapaça
    g.setLineDash([]); g.globalAlpha = pk;
    for (let i = 0; i < 9; i++) { const x = -170 + i * 40; g.beginPath(); g.moveTo(x, -140 + Math.abs(i - 4) * 4); g.quadraticCurveTo(x + 12, -20, x + 4, 92); g.stroke(); }
    // cauda, orelha, olho
    g.beginPath(); g.moveTo(-300, 40); g.quadraticCurveTo(-400, 70, -460, 140); g.stroke();
    g.beginPath(); g.moveTo(240, -70); g.lineTo(225, -120); g.lineTo(262, -78); g.stroke();
    ART.circ(g, 300, 8, 5); g.fillStyle = BP.linha; g.fill();
    // pernas
    for (const [x, gar] of [[-200, false], [-130, false], [120, true], [190, true]]) {
      g.beginPath(); g.moveTo(x, 95); g.lineTo(x + 10, 170); g.stroke();
      if (gar) {
        const gk = clamp(o.garras ?? 1); g.save(); g.strokeStyle = BP.amarelo; g.shadowColor = BP.amarelo; g.lineWidth = 5; g.globalAlpha = 0.4 + 0.6 * gk;
        for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + 8 + k * 9, 170); g.quadraticCurveTo(x + 30 + k * 9, 180, x + 40 + k * 10, 200 + Math.sin(t * 14 + k) * 6 * gk); g.stroke(); }
        g.restore();
      }
    }
    g.restore();
    // terra sendo raspada
    const ps = ART.burst(t % 0.6, { t0: 0, count: 14, x: 820, y: 1150, speed: [200, 500], angle: [-160, -100], gravity: 1500, life: [0.3, 0.6], seed: 3 });
    for (const p of ps) { g.globalAlpha = p.alpha; ART.circ(g, p.x, p.y, 5); g.fillStyle = BP.linha; g.fill(); }
    g.globalAlpha = 1;
    if ((o.garras ?? 1) > 0) {
      neon(g, () => { g.beginPath(); g.moveTo(840, 1180); g.lineTo(900, 1270); g.lineTo(940, 1270); g.stroke(); }, { cor: BP.amarelo, w: 2 });
      rotulo(g, "GARRAS DE CAVAR", 960, 1270, { cor: BP.amarelo, align: "right", size: 34 });
    }
  };

  // ================================================================= C8: PROFUNDEZAS e o Coração de Magma
  const ESTRATOS = [
    ["A", "#6E6A62"], ["B", "#9DB2C8"], ["C", "#4A4450"], ["D", "#C99A3A"], ["E", "#7A4FB8"],
    ["F", "#2F8A5A"], ["G", "#B0381A"], ["H", "#8FD8F0"], ["I", "#E86A1A"],
  ];
  /** coluna de camadas de rocha (uma por mina, A–I) para descida vertical. o = {desce: 0..1, letras: true} */
  ART.cenas.profundezas = (o = {}) => {
    const faixa = 520; // altura de cada estrato em px
    const total = faixa * ESTRATOS.length;
    const tex = ART.texVoronoi("prof", { seed: 44, n: 22, cores: ["#9A9A9A", "#B8B8B8", "#7A7A7A"], junta: "#444" });
    const estrato = i => ART.cache("prof:" + i, W + 400, faixa + 2, g => {
      const [l, c] = ESTRATOS[i]; g.translate(200, 0);
      g.fillStyle = ART.lg(g, 0, 0, 0, faixa, [[0, ART.shade(c, 0.05)], [1, ART.shade(c, -0.45)]]); g.fillRect(-200, 0, W + 400, faixa + 2);
      g.save(); g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.55; g.fillStyle = g.createPattern(tex, "repeat"); g.translate(i * 97, 0); g.fillRect(-300 - i * 97, 0, W + 600, faixa); g.restore();
      const heat = i / (ESTRATOS.length - 1);
      if (heat > 0.5) { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = (heat - 0.5) * 1.2; const r = ART.rng(i + 3); g.strokeStyle = "#FF7A1A"; g.lineWidth = 4; g.shadowColor = "#FF7A1A"; g.shadowBlur = 16; for (let k = 0; k < 6; k++) { let x = r() * W, yy = r() * faixa; g.beginPath(); g.moveTo(x, yy); for (let j = 0; j < 5; j++) { x += (r() - 0.5) * 120; yy += r() * 60; g.lineTo(x, yy); } g.stroke(); } g.restore(); }
      g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(-200, faixa - 8, W + 400, 10);
      g.font = '400 120px "Lilita One"'; g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = "rgba(255,255,255,.88)"; g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 20; if (o.letras !== false) g.fillText(l, 70, faixa / 2);
    });
    const draw = (g, t) => {
      const off = (o.desce ?? 0) * (total - H + 300);
      ESTRATOS.forEach((_, i) => { const y = i * faixa - off; if (y > H + 200 || y + faixa < -200) return; g.drawImage(estrato(i), -200, y); });
    };
    const pedra = i => ART.cache("prof:pedra" + i, 260, 260, g => { g.filter = "blur(6px)"; ART.rocha(g, 130, 130, 50 + (i % 3) * 20, i); });
    return {
      fundo: [{ d: 1, draw: (g, t) => draw(g, t) }],
      frente: [{ d: 1.25, draw(g, t) { // poeira/pedrinhas passando rápido em primeiro plano
        const r = ART.rng(2), off = (o.desce ?? 0) * 6000;
        for (let i = 0; i < 18; i++) { const x = r() * W, y = ((r() * 3000 - off) % 2400 + 2400) % 2400 - 240; r(); g.drawImage(pedra(i % 6), x - 130, y - 130); }
      } }],
      luz: (g, t) => { const heat = clamp((o.desce ?? 0) * 1.3 - 0.3); if (heat > 0) { g.save(); g.fillStyle = `rgba(255,110,40,${0.18 * heat})`; g.fillRect(0, 0, W, H); g.restore(); } },
    };
  };
  /** Coração de Magma: criatura/coração de rocha rachada, lava pulsando nas fendas. Mesma assinatura de antes.
   *  o = {pulso (0..1 intensidade), x, y, s, revela (0..1: 0 = só silhueta/contorno, 1 = fendas visíveis)} */
  const CORACAO = () => {
    const S = 1100, c = S / 2, r = ART.rng(31);
    // contorno orgânico: dois lobos + "aorta"/raízes, ruído na borda
    const outline = [];
    for (let i = 0; i < 200; i++) {
      const a = (i / 200) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
      const n = 1 + 0.07 * ART.noise(i * 0.3, 4) + 0.035 * ART.noise(i * 1.4, 9);
      const rot = -0.14, X = hx * 21 * n * (hx < 0 ? 1.08 : 0.95), Y = hy * 21 * n;
      outline.push([c + X * Math.cos(rot) - Y * Math.sin(rot), c + X * Math.sin(rot) + Y * Math.cos(rot) + 20]);
    }
    const path = new Path2D(); outline.forEach((q, i) => (i ? path.lineTo(...q) : path.moveTo(...q))); path.closePath();
    // tubos (artérias de rocha) no topo e raízes embaixo
    const tubos = [[-60, -150, -120, -500, 92], [70, -170, 140, -470, 70], [180, -150, 330, -330, 46], [-250, -60, -470, -240, 40], [-200, 160, -470, 330, 34], [220, 150, 470, 300, 38]];
    const rocha = ART.canvas(S, S), gr = rocha.getContext("2d"), lava = ART.canvas(S, S), gl = lava.getContext("2d");
    gr.lineCap = "round"; gl.lineCap = "round"; gl.lineJoin = "round";
    for (const [x0, y0, x1, y1, w] of tubos) {
      gr.beginPath(); gr.moveTo(c + x0, c + y0); gr.quadraticCurveTo(c + (x0 + x1) / 2 + 40, c + (y0 + y1) / 2, c + x1, c + y1);
      gr.lineWidth = w; gr.strokeStyle = "#140808"; gr.stroke(); gr.lineWidth = w * 0.5; gr.strokeStyle = "#1E0C0A"; gr.stroke();
      gl.beginPath(); gl.moveTo(c + x0, c + y0); gl.quadraticCurveTo(c + (x0 + x1) / 2 + 40, c + (y0 + y1) / 2, c + x1, c + y1); gl.lineWidth = w * 0.18; gl.strokeStyle = "#FF8A2A"; gl.stroke();
    }
    gr.fillStyle = ART.rg(gr, c - 80, c - 120, 30, 420, [[0, "#2A1210"], [1, "#0A0405"]]); gr.fill(path);
    // placas de rocha (Voronoi grosseiro dentro do contorno): fendas = bordas das placas
    gr.save(); gr.clip(path); gl.save(); gl.clip(path);
    const sites = []; for (let i = 0; i < 46; i++) sites.push([c + (r() - 0.5) * 680, c + (r() - 0.5) * 700]);
    const step = 6;
    for (let y = c - 380; y < c + 400; y += step) for (let x = c - 380; x < c + 380; x += step) {
      let b1 = 1e9, b2 = 1e9, bi = 0;
      for (let i = 0; i < sites.length; i++) { const dx = x - sites[i][0], dy = y - sites[i][1], dd = dx * dx + dy * dy; if (dd < b1) { b2 = b1; b1 = dd; bi = i; } else if (dd < b2) b2 = dd; }
      const e = Math.sqrt(b2) - Math.sqrt(b1);
      if (e < 7) { gl.fillStyle = e < 3 ? "#FFE0A0" : "#FF6A1A"; gl.globalAlpha = e < 3 ? 1 : 0.7; gl.fillRect(x, y, step, step); }
      else { gr.fillStyle = `rgba(${40 + ART.hash(bi, 2) * 30},${14 + ART.hash(bi, 3) * 10},${12},${0.35 + 0.3 * ART.hash(bi, 5)})`; gr.fillRect(x, y, step, step); }
    }
    gr.restore(); gl.restore();
    // borda de luz (recorte)
    gr.save(); gr.strokeStyle = "rgba(255,120,40,.35)"; gr.lineWidth = 6; gr.stroke(path); gr.restore();
    return { S, rocha, lava: ART.blurred(lava, 1.5), halo: ART.blurred(lava, 18), path };
  };
  ART.coracaoMagma = (g, t, o = {}) => {
    const x = o.x ?? 540, y = o.y ?? 880, s = o.s ?? 1, beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 1.3)), 6), k = (o.pulso ?? 1) * (0.5 + 0.5 * beat);
    const C = ART._coracao || (ART._coracao = CORACAO()), rv = o.revela ?? 0.6;
    g.fillStyle = ART.rg(g, x, y, 50, 1200, [[0, "#3A0E06"], [0.5, "#160604"], [1, "#050203"]]); g.fillRect(0, 0, ART.W, ART.H);
    ART.glow(g, x, y, 950 * s, "#FF5A1A", 0.55 * k);
    g.save(); g.translate(x, y); const sc = s * (1 + 0.025 * beat); g.scale(sc, sc);
    g.drawImage(C.rocha, -C.S / 2, -C.S / 2);
    g.globalCompositeOperation = "lighter";
    g.globalAlpha = clamp(rv * (0.35 + 0.65 * k)); g.drawImage(C.lava, -C.S / 2, -C.S / 2);
    g.globalAlpha = clamp((0.3 + 0.7 * rv) * k); g.drawImage(C.halo, -C.S / 2, -C.S / 2);
    g.restore();
    // rochas soltas orbitando devagar
    for (const [ax, ay, rr, a] of [[-470, 160, 110, 0.4], [480, 120, 120, -0.5], [-430, -330, 80, -0.3], [440, -360, 90, 0.6]]) { g.save(); g.translate(x + ax * s, y + ay * s + Math.sin(t + ax) * 8); g.rotate(a + t * 0.05); ART.rocha(g, 0, 0, rr * s, ax); g.restore(); }
    ART.dust(g, t, { count: 50, seed: 6, color: "#FF9A50", size: [2, 5], speed: 40, alpha: 0.7 });
  };

  /** braço forte golpeando no escuro (plano 37): silhueta musculosa com picareta enorme que não acerta nada.
   *  o = {t0 (início do golpe), x, y (ombro), s, rim (cor da luz de recorte)} */
  ART.obj.bracoForte = (g, t, o = {}) => {
    const x = o.x ?? 1080, y = o.y ?? 700, s = o.s ?? 1, u = t - (o.t0 ?? 0.3);
    const rot = ART.kf(u, [[-0.5, -70], [0, -88, "outCubic"], [0.16, 28, "inQuart"], [0.45, 38, "outCubic"], [1.2, 34]]);
    const rim = o.rim || "#8E7BD8", body = o.cor || "#2B2442";
    g.save(); g.translate(x, y); g.scale(-s, s);
    if (u > 0.04 && u < 0.5) { g.save(); g.globalAlpha = 0.3 * (1 - (u - 0.04) / 0.46); g.strokeStyle = "#C9BFFF"; g.lineWidth = 90; g.lineCap = "round"; g.beginPath(); g.arc(0, 0, 820, ART.deg(-80), ART.deg(rot), false); g.stroke(); g.restore(); }
    g.rotate(ART.deg(rot));
    // braço de verdade: deltoide, bíceps alto, cotovelo, antebraço afunilando, punho fechado
    const sup = new Path2D("M-140,-120 C-60,-190 60,-200 140,-175 C210,-215 300,-150 345,-70 L360,70 C250,120 80,130 -20,135 C-120,135 -190,40 -140,-120 Z");
    const ante = new Path2D("M320,-80 C390,-120 470,-80 545,-48 L560,60 C480,85 400,100 330,95 Z");
    const punho = new Path2D("M530,-62 C580,-80 650,-70 668,-30 C690,20 680,80 640,98 C590,112 545,100 530,70 Z");
    g.save(); g.translate(610, 18); g.rotate(ART.deg(90)); g.scale(4, 4); ART.drawPick(g, "ferro", 230); g.restore();
    for (const pth of [sup, ante, punho]) { g.fillStyle = body; g.fill(pth); }
    // volumes e luz de recorte
    const rimDe = (pth, w) => { g.save(); g.clip(pth); g.strokeStyle = rim; g.globalAlpha = 0.9; g.lineWidth = w; g.translate(0, -w / 2); g.stroke(pth); g.restore(); };
    rimDe(sup, 18); rimDe(ante, 14); rimDe(punho, 12);
    g.save(); g.clip(sup); ART.ell(g, 150, -110, 150, 58, -0.05); g.fillStyle = "rgba(185,168,255,.18)"; g.fill(); ART.ell(g, -40, -60, 90, 70); g.fillStyle = "rgba(185,168,255,.10)"; g.fill(); g.restore();
    g.save(); g.clip(ante); ART.ell(g, 410, -45, 90, 30, 0.1); g.fillStyle = "rgba(185,168,255,.14)"; g.fill(); g.restore();
    g.strokeStyle = "rgba(10,6,20,.6)"; g.lineWidth = 8; g.lineCap = "round";
    g.beginPath(); g.moveTo(335, -50); g.quadraticCurveTo(350, 10, 335, 90); g.stroke();           // dobra do cotovelo
    for (const yy of [-30, 10, 50]) { g.beginPath(); g.moveTo(600, yy); g.lineTo(660, yy + 6); g.stroke(); } // dedos
    g.strokeStyle = "rgba(185,168,255,.35)"; g.lineWidth = 5; g.beginPath(); g.moveTo(40, -150); g.quadraticCurveTo(160, -185, 280, -140); g.stroke(); // veia/realce
    g.restore();
    // a picareta no breu: escurece tudo menos o recorte
    g.save(); g.fillStyle = `rgba(6,4,12,${o.breu ?? 0.35})`; g.fillRect(0, 0, ART.W, ART.H); g.restore();
  };
  /** ampulheta dourada em close (ramo Tempo). o = {x, y, s, areia (0..1 caindo), brilho} */
  ART.obj.ampulheta = (g, t, o = {}) => {
    const x = o.x ?? 540, y = o.y ?? 860, s = o.s ?? 1, ar = clamp(o.areia ?? ((t * 0.2) % 1));
    if (o.brilho) ART.glow(g, x, y, 420 * s, "#FFD23F", 0.5 * o.brilho);
    g.save(); g.translate(x, y); g.scale(s, s);
    const vidro = new Path2D("M-120,-230 C-120,-90 -20,-40 -14,0 C-20,40 -120,90 -120,230 L120,230 C120,90 20,40 14,0 C20,-40 120,-90 120,-230 Z");
    g.fillStyle = "rgba(200,230,255,.12)"; g.fill(vidro);
    g.save(); g.clip(vidro);
    // areia de cima (diminui) e de baixo (cresce)
    const topH = 190 * (1 - ar), botH = 190 * ar;
    g.fillStyle = "#FFC94A"; g.fillRect(-130, -20 - topH, 260, topH); g.beginPath(); g.moveTo(-130, 230); g.lineTo(130, 230); g.lineTo(130, 230 - botH * 0.6); g.lineTo(0, 230 - botH * 1.1); g.lineTo(-130, 230 - botH * 0.6); g.closePath(); g.fill();
    if (ar < 1) { g.fillStyle = "#FFE08A"; g.fillRect(-3, -10, 6, 240 - botH); }
    g.restore();
    g.lineWidth = 6; g.strokeStyle = "rgba(255,255,255,.55)"; g.stroke(vidro);
    ART.ell(g, -70, -150, 14, 60, 0.15); g.fillStyle = "rgba(255,255,255,.3)"; g.fill();
    for (const yy of [-250, 250]) { ART.rr(g, -170, yy - 22, 340, 44, 14); g.fillStyle = ART.lg(g, 0, yy - 22, 0, yy + 22, [[0, "#FFE58A"], [1, "#B07A0C"]]); g.fill(); }
    for (const xx of [-140, 140]) { ART.rr(g, xx - 12, -230, 24, 460, 10); g.fillStyle = "#C3954F"; g.fill(); }
    g.restore();
  };

  // ================================================================= C7: closes de objeto em holofote
  /** fundo escuro com holofote de cima e poça de luz no chão. o = {cor, x, chao (y), k} */
  ART.holofote = (g, t, o = {}) => {
    const x = o.x ?? 540, yc = o.chao ?? 1150, cor = o.cor || "#FFE2B0", k = o.k ?? 1;
    g.fillStyle = ART.rg(g, x, 800, 50, 1300, [[0, "#1E1830"], [1, "#07060C"]]); g.fillRect(0, 0, W, H);
    // superfície (mesa escura) com reflexo
    g.fillStyle = ART.lg(g, 0, yc - 40, 0, H, [[0, "#2A2236"], [0.2, "#16121E"], [1, "#07060A"]]); g.fillRect(0, yc - 40, W, H);
    ART.beam(g, x, -100, 90, yc + 140, 160, 760, cor, 0.32 * k);
    g.save(); g.translate(x, yc); g.scale(1, 0.18); ART.glow(g, 0, 0, 520, cor, 0.55 * k); g.restore();
    ART.dust(g, t, { count: 40, seed: 17, color: cor, alpha: 0.5 * k, x: x - 340, w: 680, y: 0, h: yc });
  };
  ART.obj = ART.obj || {};
  /** close frontal da lanterna do capacete. o = {on: 0..1, flare, s, x, y} — planos 1, 43, 57 */
  ART.obj.lanterna = (g, t, o = {}) => {
    const x = o.x ?? 540, y = o.y ?? 820, s = o.s ?? 1, on = clamp(o.on ?? 1);
    g.save(); g.translate(x, y); g.scale(s, s);
    // cúpula do capacete enorme
    ART.ell(g, 0, 380, 900, 820); g.fillStyle = ART.rg(g, -200, -200, 50, 1100, [[0, ART.mix("#6A5420", P.capacete, 0.25 + 0.75 * on)], [0.6, ART.mix("#3A2A10", P.capaceteEsc, 0.2 + 0.8 * on)], [1, "#120C04"]]); g.fill();
    // nervura
    g.fillStyle = ART.rgba("#000", 0.18); g.fillRect(-36, -440, 72, 900);
    g.fillStyle = ART.rgba("#FFF6C0", 0.18 * on + 0.04); g.fillRect(-20, -440, 14, 900);
    // suporte e aro
    ART.circ(g, 0, 18, 205); g.fillStyle = "rgba(20,14,6,.45)"; g.fill();
    ART.circ(g, 0, 0, 175); g.fillStyle = ART.lg(g, 0, -175, 0, 175, [[0, "#B8B6C8"], [1, "#55536A"]]); g.fill();
    ART.circ(g, 0, 0, 140); g.fillStyle = ART.mix("#2A2A36", "#FFFDF0", on); g.fill();
    // refletor interno
    g.save(); ART.circ(g, 0, 0, 140); g.clip();
    for (let i = 0; i < 12; i++) { g.save(); g.rotate(i * Math.PI / 6); g.fillStyle = `rgba(255,255,255,${0.06 + 0.04 * (i % 2)})`; g.beginPath(); g.moveTo(0, 0); g.lineTo(150, -40); g.lineTo(150, 40); g.fill(); g.restore(); }
    ART.circ(g, 0, 0, 40); g.fillStyle = ART.mix("#444", "#FFFFFF", on); g.fill();
    g.restore();
    ART.ell(g, -50, -60, 50, 26, -0.6); g.fillStyle = "rgba(255,255,255,.5)"; g.fill();
    g.restore();
    if (on > 0) {
      ART.glow(g, x, y, 700 * s, "#FFE6A8", 0.32 * on);
      ART.glow(g, x, y, 200 * s, "#FFFFFF", 0.8 * on);
      // flare horizontal
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.7 * on; g.fillStyle = ART.lg(g, 0, 0, W, 0, [[0, "rgba(255,220,160,0)"], [0.5, "rgba(255,240,210,.9)"], [1, "rgba(255,220,160,0)"]]);
      g.fillRect(0, y - 4 * s, W, 8 * s); g.restore();
      ART.dust(g, t, { count: 60, seed: 2, color: "#FFF0C8", alpha: 0.8 * on, size: [2, 6], x: x - 450, w: 900, y: y - 500, h: 1000 });
    }
  };
  /** picareta velha (cabo rachado, ferrugem) girando em 3/4. o = {x, y, s, giro (rad)} */
  ART.obj.picaretaVelha = (g, t, o = {}) => {
    const x = o.x ?? 540, y = o.y ?? 960, s = o.s ?? 4.4, gr = o.giro ?? t * 0.8;
    g.save(); g.translate(x, y); g.rotate(-0.35); g.scale(s * (0.35 + 0.65 * Math.abs(Math.cos(gr))), s);
    ART.drawPick(g, "ferro", 220);
    // ferrugem e rachadura no cabo
    g.fillStyle = "rgba(140,60,20,.55)"; for (const [px, py, r] of [[30, -165, 7], [-28, -160, 6], [42, -158, 4]]) { ART.circ(g, px, py, r); g.fill(); }
    g.strokeStyle = "#2A140A"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-2, -60); g.lineTo(2, -30); g.lineTo(-1, -10); g.lineTo(3, 20); g.stroke();
    // fita remendando
    g.fillStyle = "#B8A88A"; g.fillRect(-6, -5, 12, 16); g.fillStyle = "rgba(0,0,0,.2)"; g.fillRect(-6, 3, 12, 2);
    g.restore();
  };
  /** saquinho de moedas virado, só poeira. o = {x, y, s, virado: 0..1} */
  ART.obj.saquinho = (g, t, o = {}) => {
    const x = o.x ?? 540, y = o.y ?? 1000, s = o.s ?? 1.6, v = clamp(o.virado ?? 1);
    g.save(); g.translate(x, y); g.rotate(ART.lerp(0, 2.6, ART.ease.inOutCubic(v))); g.scale(s, s);
    g.beginPath(); g.moveTo(-90, 40); g.quadraticCurveTo(-110, -60, -40, -100); g.lineTo(40, -100); g.quadraticCurveTo(110, -60, 90, 40); g.quadraticCurveTo(0, 90, -90, 40); g.closePath();
    g.fillStyle = ART.lg(g, -100, -100, 100, 60, [[0, "#B07A48"], [1, "#6A4224"]]); g.fill();
    ART.ell(g, 0, -100, 46, 16); g.fillStyle = "#3A2414"; g.fill();
    g.strokeStyle = "#E0B060"; g.lineWidth = 6; g.beginPath(); g.moveTo(-44, -84); g.quadraticCurveTo(0, -70, 44, -84); g.stroke();
    g.restore();
    if (v > 0.8) { const ps = ART.burst(t, { t0: o.t0 ?? 0.6, count: 26, x: x + 40, y: y + 90, speed: [20, 90], angle: [60, 120], gravity: 300, life: [1, 2], seed: 9, spread: 0.6 }); for (const p of ps) { g.globalAlpha = p.alpha * 0.6; ART.circ(g, p.x, p.y, 3 + p.r * 4); g.fillStyle = "#C8B89A"; g.fill(); } g.globalAlpha = 1; }
  };
  /** calendário de 30 quadradinhos que se preenche e vira relógio 5:00. o = {preenchido: 0..30, relogio: 0..1} */
  ART.obj.calendario = (g, t, o = {}) => {
    const x = o.x ?? 540, y = o.y ?? 860, n = o.preenchido ?? 30, m = clamp(o.relogio ?? 0);
    g.save(); g.translate(x, y);
    const a = 1 - ART.ease.inOutCubic(m);
    if (a > 0) {
      g.globalAlpha = a; g.save(); g.scale(lerp(0.6, 1, a), lerp(0.6, 1, a));
      UI().cartao(g, -380, -380, 760, 760, { r: 40, cor: "#EDE3CC", borda: "#C9B998", sombra: true });
      ART.rr(g, -380, -380, 760, 130, 40); g.fillStyle = "#E63748"; g.fill(); g.fillStyle = "#E63748"; g.fillRect(-380, -290, 760, 40);
      g.font = '1000 64px "Nunito"'; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("30 DIAS", 0, -310);
      for (let i = 0; i < 30; i++) {
        const cx = -300 + (i % 6) * 120, cy = -160 + Math.floor(i / 6) * 110, k = clamp(n - i);
        ART.rr(g, cx - 46, cy - 40, 92, 80, 14); g.fillStyle = "rgba(60,50,40,.12)"; g.fill();
        if (k > 0) { g.save(); g.translate(cx, cy); g.scale(ART.ease.outBack(k), ART.ease.outBack(k)); ART.rr(g, -46, -40, 92, 80, 14); g.fillStyle = "#FFD23F"; g.fill(); UI().pix(g, "sol", 0, 0, 44); g.restore(); }
      }
      g.restore();
    }
    if (m > 0) {
      g.globalAlpha = m; const R = 330 * lerp(0.6, 1, ART.ease.outBack(m));
      ART.circ(g, 0, 0, R); g.fillStyle = "#EDE3CC"; g.fill(); g.lineWidth = 26; g.strokeStyle = "#FFD23F"; g.stroke();
      for (let i = 0; i < 12; i++) { const a2 = i * Math.PI / 6; g.fillStyle = "#3A3036"; g.fillRect(Math.cos(a2) * R * 0.82 - 6, Math.sin(a2) * R * 0.82 - 6, 12, 12); }
      // fatia de 5 minutos preenchida
      g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R * 0.7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (5 / 60) * clamp(m * 1.4 - 0.2)); g.closePath(); g.fillStyle = "rgba(255,181,72,.6)"; g.fill();
      g.font = '1000 150px "Nunito"'; g.fillStyle = "#2A2236"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("5:00", 0, 30);
      g.font = '900 40px "Nunito"'; g.fillStyle = "#7A6E60"; g.fillText("MINUTOS DE LUZ", 0, 140);
    }
    g.restore();
  };
  /** pepita de cobre girando no holofote com brilho laranja. o = {x, y, r, k} */
  ART.obj.pepitaCobre = (g, t, o = {}) => {
    const x = o.x ?? 540, y = o.y ?? 900, r = o.r ?? 150, k = o.k ?? 1;
    ART.glow(g, x, y, r * 4, "#FF8A3C", 0.45 * k);
    g.save(); g.translate(x, y); g.scale(Math.cos(t * 1.6) * 0.25 + 0.95, 1);
    ART.pepita(g, 0, 0, r, "cobre", Math.sin(t * 0.8) * 0.2, { seed: 7 });
    g.restore();
    // brilhos estelares
    for (let i = 0; i < 3; i++) { const ph = (t * 0.9 + i / 3) % 1, a = Math.sin(ph * Math.PI); const px = x + Math.cos(i * 2.1) * r * 0.7, py = y + Math.sin(i * 2.1) * r * 0.5; g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a; g.fillStyle = "#FFE8C8"; g.translate(px, py); g.rotate(0.3); g.fillRect(-r * 0.25, -2, r * 0.5, 4); g.fillRect(-2, -r * 0.25, 4, r * 0.5); g.restore(); }
  };
})();
