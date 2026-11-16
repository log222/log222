/* Grupo B · Parte 2 (C1 vila, C4 Toca): helpers só dos planos p204–p266 do animador B.
 * Carregar no setup:  await (window.GB2_LOAD ? GB2_LOAD() : MD.loadScript("../scenes/planos/_grupoB_ep02.js").then(() => GB2_LOAD()));
 * Usa (sem mudar) o _grupoB.js da Parte 1. Tudo função pura de t.
 */
window.GB2_LOAD = window.GB2_LOAD || (async () => {
  if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
  if (!window.GB2) await (window.__GB2_P = window.__GB2_P || MD.loadScript("../scenes/planos/_grupoB_ep02.js"));
});
(function () {
  if (window.GB2) return;
  const GB2 = (window.GB2 = {});
  const A = () => window.ART, B = () => window.GB;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  GB2.clamp = clamp;

  // ------------------------------------------------------------------ posições fixas da Toca na Parte 2
  // O Zeca fica no tapete, na frente do pé da cama (de pé, sentado no chão e levantando no mesmo lugar).
  GB2.Z = { x: 800, y: 1372, s: 1.9 };          // de pé / sentado no chão (camada d=1)
  /** câmera do plano inteiro da Toca (p208, p212, p232): zoom z0→z1, pés do Zeca em y≈1300 da tela */
  GB2.camInteiro = (t, dur, o = {}) => {
    const ART = A(), GB = B();
    const cam = ART.camera(t, { push: o.push || [1.4, 1.47], dur, ease: o.ease || "linear" });
    GB.mira(cam, 1, (o.mx ?? 677) + (o.dx || 0), (o.my ?? GB2.Z.y) + (o.dy || 0), 540, o.sy ?? 1300);
    return cam;
  };
  GB2.CAMA = { x: 960, y: 1112, s: 1.3 };       // sentado na cama (mesma posição do p56)
  // seta de giz (a do p56) no espaço local do giz
  GB2.SETA = { x: 350, y: 215, h: 220 };
  // porta da Toca (desenhada aqui; o kit não tem): à direita, depois da cama
  GB2.PORTA = { x: 1150, y: 1255, w: 170, h: 330 };

  /** cena da Toca da Parte 2. o = {riscados, numero (mostra META/1.000 do kit), lamp, janela} */
  GB2.toca = (o = {}) => {
    const GB = B();
    const num = o.numero ? 1 : 0;
    const c = GB.toca({ prog: num, tracos: num ? 30 : 0, riscados: num ? (o.riscados ?? 3) : 0 }, { lamp: o.lamp ?? 1, janela: o.janela ?? 1 });
    const M = c.fundo[3], LAMP = c.fundo[4];   // camadas dos móveis (cama + mesa) e do lampião do kit
    // a Toca do kit acaba em x≈1240 do mundo: estende parede (escura, canto da toca) e chão para a direita
    c.fundo.unshift({ d: 0.8, draw: g => { g.fillStyle = "#1A1424"; g.fillRect(1150, -400, 1400, 2600); } });
    c.fundo.splice(4, 0, { d: 1, draw: g => { const ART = A(); g.fillStyle = ART.lg(g, 0, 1240, 0, 1920, [[0, "#3A2A30"], [0.3, "#241A22"], [1, "#0C0810"]]); g.fillRect(1230, 1240, 1400, 900); g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(1230, 1238, 1400, 18); } });
    if (o.porta !== false) c.fundo.push({ d: 1, draw: (g, t) => GB2.porta(g, t, { aberta: typeof o.aberta === "function" ? o.aberta(t) : (o.aberta || 0) }) });
    if (o.semMoveis) c.fundo = c.fundo.filter(L => L !== M && L !== LAMP);
    return c;
  };
  /** camada da parede (d=0.8) com as coisas da Parte 2 (paredeLocal), para o `meio` do GB.palco */
  GB2.meioParede = (cam, t, po) => gg => A().withLayer(gg, cam, 0.8, w => {
    const GB = B(); w.save(); w.translate(GB.PAREDE.x, GB.PAREDE.y); w.scale(GB.PAREDE.s, GB.PAREDE.s); GB2.paredeLocal(w, t, po); w.restore();
  });
  /** desenha o Zeca em coordenadas de tela a partir de uma pose com x,y,s do mundo (camada d) — âncoras em px de tela */
  GB2.zecaTela = (g, cam, p, d = 1) => {
    const GB = B(), [sx, sy, z] = GB.proj(cam, d, p.x, p.y);
    const q = Object.assign({}, p, { x: sx, y: sy, s: p.s * z, shadow: p.shadow ?? 1 });
    return Object.assign(A().zeca.draw(g, q), { z, sx, sy });
  };
  /** âncoras de uma pose já em px de tela, sem desenhar no quadro (desenho num canvas mínimo) */
  let DRY = null;
  GB2.ancoras = p => {
    if (!DRY) DRY = A().canvas(4, 4).getContext("2d");
    DRY.setTransform(1, 0, 0, 1, 0, 0);
    return A().zeca.draw(DRY, p);
  };
  /** versão de tela de uma pose do mundo (sem desenhar) */
  GB2.poseTela = (cam, p, d = 1) => { const [sx, sy, z] = B().proj(cam, d, p.x, p.y); return Object.assign({}, p, { x: sx, y: sy, s: p.s * z }); };
  /** ponto do mundo (d=1) -> tela */
  GB2.tela = (cam, x, y, d = 1) => B().proj(cam, d, x, y);
  GB2.ZS = { x: 800, y: 1345 };   // sentado no chão, encostado no pé da cama (e onde levanta)

  /** coisas da parede em espaço local do giz (chame dentro de translate(PAREDE)+scale(s)):
   *  o = {tracinhos (bool: desenha os 30 com riscados), riscados, seta (0..1 alfa), x (0..1 X de giz), brilhoX, barra:{box, saldo, cobre, texto, a}} */
  GB2.paredeLocal = (w, t, o = {}) => {
    const ART = A(), GB = B();
    if (o.tracinhos) GB.tracinhos(w, { riscados: o.riscados ?? 3 });
    const S = GB2.SETA;
    if ((o.seta ?? 1) > 0) {
      w.save(); w.globalAlpha *= (o.seta ?? 1);
      const apag = clamp(o.x ?? 0) * 0.45;   // riscada, a seta perde força
      GB.gizSeta(w, S.x, S.y, S.h, 1, { lw: 12, cor: `rgba(170,240,160,${0.95 - apag})`, glow: `rgba(120,230,120,${0.6 - apag})` });
      GB.gizTexto(w, "?", S.x + 70, S.y - S.h + 40, { size: 110, cor: `rgba(244,240,230,${0.9 - apag})` });
      w.restore();
    }
    const xk = clamp(o.x ?? 0);
    if (xk > 0) {
      const k1 = clamp(xk * 2), k2 = clamp(xk * 2 - 1), cx = S.x + 20, cy = S.y - S.h * 0.48, r = S.h * 0.55;
      const cor = "rgba(255,120,95,.97)", glow = `rgba(255,90,70,${0.5 + 0.4 * (o.brilhoX || 0)})`;
      GB.gizLinha(w, cx - r * 0.8, cy - r, cx + r * 0.8, cy + r, k1, { lw: 15, cor, glow });
      GB.gizLinha(w, cx + r * 0.8, cy - r, cx - r * 0.8, cy + r, k2, { lw: 15, cor, glow });
    }
    if (o.barra) GB2.barraGiz(w, t, o.barra);
  };
  /** ponta do giz do X (local) para o progresso xk 0..1 */
  GB2.pontaX = xk => {
    const S = GB2.SETA, cx = S.x + 20, cy = S.y - S.h * 0.48, r = S.h * 0.55;
    if (xk <= 0.5) { const k = xk * 2; return [cx - r * 0.8 + 1.6 * r * k, cy - r + 2 * r * k]; }
    const k = (xk - 0.5) * 2; return [cx + r * 0.8 - 1.6 * r * k, cy - r + 2 * r * k];
  };

  /** barrinha da meta em giz (abaixo dos tracinhos), saldo em giz claro + cobre em laranja. b = {box 0..1, saldo, cobre, texto, a} */
  GB2.BARRA = { x: -280, y: 352, w: 560, h: 38 };
  GB2.barraGiz = (w, t, b) => {
    const ART = A(), GB = B(), { x: BX, y: BY, w: BW, h: BH } = GB2.BARRA;
    const kBox = clamp(b.box ?? 1);
    if (kBox > 0) {
      w.save(); w.strokeStyle = "rgba(244,240,230,.92)"; w.lineWidth = 7; w.shadowColor = "rgba(255,255,255,.35)"; w.shadowBlur = 6;
      w.setLineDash([2 * (BW + BH) * kBox, 4000]); ART.rr(w, BX, BY, BW, BH, 14); w.stroke(); w.restore();
    }
    const iw = BW - 14, fs = clamp(b.saldo || 0), fc = clamp(b.cobre || 0);
    if (fs > 0.001) { w.save(); ART.rr(w, BX + 7, BY + 7, Math.max(12, iw * fs), BH - 14, 8); w.fillStyle = "rgba(225,222,215,.95)"; w.shadowColor = "rgba(255,255,255,.4)"; w.shadowBlur = 8; w.fill(); w.restore(); }
    if (fc > 0.001) { w.save(); ART.rr(w, BX + 7 + iw * fs, BY + 7, Math.max(12, iw * fc), BH - 14, 8); w.fillStyle = "#F08A3E"; w.shadowColor = "#FF8A3C"; w.shadowBlur = 18; w.fill(); w.restore(); }
    if (b.texto) GB.gizTexto(w, b.texto, b.tx ?? 0, BY + BH + 98, { align: "center", size: b.size || 140, k: b.textoK ?? 1, cor: "rgba(255,170,90,.98)", glow: "rgba(255,140,60,.7)", blur: 12, a: b.a ?? 1 });
  };

  // ------------------------------------------------------------------ cartão fixo + etiqueta do cobre
  /** cartão SALDO × META · DIA X DE 30 (GB.cartao) + segmento de cobre na barra + etiqueta "COBRE N%" pendurada no segmento.
   *  o = {saldo, dia, cobre (fração), tag ('COBRE 4%'), tagPulso, rotulo ('RESTAM 27'), pulso, a, y, s} */
  GB2.cartao = (g, o = {}) => {
    const ART = A(), GB = B(), s = o.s ?? 0.86, y = o.y ?? 365;
    const r = GB.cartao(g, 540, y, { saldo: o.saldo, dia: o.dia, s, cobre: o.cobre, rotulo: o.rotulo, rotuloCor: o.rotuloCor, pulso: o.pulso, a: o.a ?? 1 });
    if (o.tag && (o.cobre || 0) > 0) {
      const bx = r.x0 + 36 * s, bw = r.w - 72 * s, f0 = clamp((o.saldo || 0) / 1000), f1 = clamp(f0 + o.cobre);
      const ax = bx + bw * (f0 + f1) / 2, ay = r.y0 + r.h - 4 * s;
      g.save(); g.globalAlpha *= o.a ?? 1;
      g.font = `1000 ${30 * s}px "Nunito"`; g.textBaseline = "middle"; g.textAlign = "left";
      const tw = g.measureText(o.tag).width, ic = 30 * s, pw = tw + ic + 34 * s, ph = 46 * s;
      const px = clamp(ax - pw * 0.3, r.x0 + 4, r.x0 + r.w - pw - 4), py = ay + 16 * s;
      // biquinho apontando para o segmento
      g.beginPath(); g.moveTo(ax - 9 * s, py + 1); g.lineTo(ax, py - 12 * s); g.lineTo(ax + 9 * s, py + 1); g.closePath(); g.fillStyle = "rgba(20,18,31,.86)"; g.fill();
      ART.rr(g, px, py, pw, ph, ph / 2); g.fillStyle = "rgba(20,18,31,.86)"; g.fill();
      g.lineWidth = 2.5; g.strokeStyle = "rgba(240,138,62,.75)"; g.stroke();
      ART.ui.pix(g, "cobre", px + 14 * s + ic / 2, py + ph / 2, ic);
      g.fillStyle = "#FF9A4A"; g.fillText(o.tag, px + 22 * s + ic, py + ph / 2 + 1);
      if (o.tagPulso) ART.glow(g, px + pw / 2, py + ph / 2, pw * 0.7, "#FF8A3C", 0.45 * o.tagPulso);
      g.restore();
    }
    return r;
  };

  // ------------------------------------------------------------------ painel aceso (vem da frente/esquerda, do lado da câmera)
  /** luz do painel do Mercado no ambiente: brilho frio vindo de baixo-esquerda + borda de vidro desfocada em primeiro plano.
   *  k 0..1 (aceso), cor (muda para avermelhada quando o preço cai), fx/fy = ponto da tela onde a luz bate (rosto) */
  GB2.luzPainel = (g, t, k, o = {}) => {
    if (k <= 0) return;
    const ART = A(), cor = o.cor || "#7FD8FF", fl = 0.93 + 0.07 * ART.noise(t * 3.1, 5);
    const fx = o.fx ?? 700, fy = o.fy ?? 850;
    ART.glow(g, fx - 80, fy + 60, 720, cor, 0.16 * k * fl);
    ART.glow(g, -60, fy + 240, 760, cor, 0.3 * k * fl);
    if (o.vidro !== false) {
      // canto do painel de vidro, desfocado, entrando pela esquerda (fora da faixa da legenda)
      g.save(); g.globalAlpha = k * 0.85;
      g.beginPath(); g.moveTo(-40, 520); g.lineTo(150, 590); g.lineTo(150, 1180); g.lineTo(-40, 1240); g.closePath();
      g.fillStyle = ART.lg(g, -40, 0, 150, 0, [[0, ART.rgba(cor, 0.05)], [1, ART.rgba(cor, 0.2)]]); g.fill();
      g.lineWidth = 6; g.strokeStyle = ART.rgba(cor, 0.55); g.stroke();
      g.strokeStyle = ART.rgba(cor, 0.25); g.lineWidth = 4;
      for (let i = 0; i < 5; i++) { const yy = 650 + i * 110; g.beginPath(); g.moveTo(-20, yy - 30 + i * 2); g.lineTo(120, yy); g.stroke(); }
      g.restore();
    }
  };

  // ------------------------------------------------------------------ pepitas
  /** n pepitas de cobre amontoadas (no colo), x,y = centro, r = raio de cada uma, brilho 0..1 */
  GB2.pepitas = (g, t, x, y, r, o = {}) => {
    const ART = A(), n = o.n ?? 4, br = o.brilho ?? 1;
    const P = [[-0.95, 0.25], [0.95, 0.3], [-0.05, 0.4], [0.1, -0.55]];
    ART.glow(g, x, y, r * 6, "#FF8A3C", 0.35 * br * (0.9 + 0.1 * Math.sin(t * 5)));
    for (let i = 0; i < n; i++) {
      const [dx, dy] = P[i % 4];
      ART.pepita(g, x + dx * r * 1.1, y + dy * r * 1.1, r, "cobre", 0.3 + i * 1.3 + Math.sin(t * 1.2 + i) * 0.05, { seed: 7 + i });
    }
    // brilhos estelares
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.8 + i / 3) % 1, a = Math.sin(ph * Math.PI) * br; if (a < 0.05) continue;
      const px = x + Math.cos(i * 2.3 + 1) * r * 1.4, py = y + Math.sin(i * 2.3 + 1) * r * 0.8;
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a; g.fillStyle = "#FFE8C8"; g.translate(px, py); g.rotate(0.3);
      g.fillRect(-r * 0.5, -1.5, r, 3); g.fillRect(-1.5, -r * 0.5, 3, r); g.restore();
    }
  };

  /** onde fica o colo (px de tela) a partir das âncoras do Zeca sentado: entre as duas patas */
  GB2.colo = (A, s) => {
    const m = A.mao || { x: 540, y: 1100 }, b = A.maoTras || m;
    return [(m.x + b.x) / 2, (m.y + b.y) / 2 + 2 * s];
  };
  /** pepita de cobre única na tela (x,y px), s = escala de tela do Zeca; brilho 0..1 */
  GB2.pepita = (g, t, x, y, s, o = {}) => {
    const ART = A(), br = o.brilho ?? 1, pul = 0.85 + 0.15 * Math.sin(t * 4.5);
    ART.glow(g, x, y, 110 * s, "#FF8A3C", 0.32 * br * pul);
    ART.pepita(g, x, y, 17 * s * (o.esc || 1), "cobre", 0.3 + 0.05 * Math.sin(t * 1.3), { seed: 7 });
    ART.glow(g, x, y, 22 * s, "#FFE0B0", 0.3 * br * pul);
  };

  // ------------------------------------------------------------------ saquinho pequeno na pata (com cordão)
  /** saquinho de couro pequeno (x,y = centro da boca), s escala, fecha 0..1 (cordão aperta), cheio 0..1 */
  GB2.saquinho = (g, x, y, s, o = {}) => {
    const ART = A(), f = clamp(o.fecha ?? 0), c = clamp(o.cheio ?? 0);
    g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s, s);
    const boca = ART.lerp(34, 14, f), bojo = 1 + 0.12 * c;
    g.beginPath(); g.moveTo(-boca, 0); g.quadraticCurveTo(-60 * bojo, 20, -52 * bojo, 70); g.quadraticCurveTo(0, 104 * bojo, 52 * bojo, 70); g.quadraticCurveTo(60 * bojo, 20, boca, 0); g.closePath();
    g.fillStyle = ART.lg(g, -60, 0, 60, 90, [[0, "#B07A48"], [1, "#5E3A20"]]); g.fill();
    // franzido da boca
    g.beginPath(); g.moveTo(-boca - 6, -10); g.lineTo(-boca, 4); g.lineTo(boca, 4); g.lineTo(boca + 6, -10); g.quadraticCurveTo(0, -18 + 8 * f, -boca - 6, -10); g.fillStyle = "#8A5A30"; g.fill();
    if (f < 0.6) { ART.ell(g, 0, -4, boca * 0.9, 7 * (1 - f)); g.fillStyle = "#2A180C"; g.fill(); }
    // cordão
    g.strokeStyle = "#E0B060"; g.lineWidth = 5; g.lineCap = "round";
    g.beginPath(); g.moveTo(-boca, 6); g.quadraticCurveTo(0, 14, boca, 6); g.stroke();
    if (f > 0) { g.beginPath(); g.moveTo(4, 8); g.quadraticCurveTo(14 + 10 * f, 26, 8 + 4 * f, 30 + 22 * f); g.moveTo(4, 8); g.quadraticCurveTo(-6, 28, -4 - 6 * f, 32 + 18 * f); g.stroke(); }
    // brilho laranja escapando quando aberto e cheio
    if (c > 0 && f < 0.9) ART.glow(g, 0, -6, 70, "#FF8A3C", 0.5 * c * (1 - f));
    g.restore();
  };

  // ------------------------------------------------------------------ porta da Toca (camada d=1, depois dos móveis)
  GB2.porta = (g, t, o = {}) => {
    const ART = A(), P = GB2.PORTA, ab = clamp(o.aberta ?? 0);
    const x0 = P.x - P.w / 2, y0 = P.y - P.h, r = P.w / 2;
    g.save();
    // batente de pedra e madeira
    g.beginPath(); g.moveTo(x0 - 24, P.y); g.lineTo(x0 - 24, y0 + r); g.arc(P.x, y0 + r, r + 24, Math.PI, 0); g.lineTo(x0 + P.w + 24, P.y); g.closePath();
    g.fillStyle = "#3A2A30"; g.fill();
    // vão (noite azul lá fora quando abre)
    const vao = () => { g.beginPath(); g.moveTo(x0, P.y); g.lineTo(x0, y0 + r); g.arc(P.x, y0 + r, r, Math.PI, 0); g.lineTo(x0 + P.w, P.y); g.closePath(); };
    vao(); g.fillStyle = ART.lg(g, 0, y0, 0, P.y, [[0, "#22306A"], [1, "#131A3A"]]); g.fill();
    if (ab > 0) { g.save(); vao(); g.clip(); ART.dust(g, t, { count: 8, seed: 13, color: "#D8FF8A", size: [2, 4], alpha: 0.8 * ab, x: x0, y: y0, w: P.w, h: P.h }); g.restore(); }
    // folha de madeira (gira para dentro: fica mais estreita)
    const fw = P.w * (1 - 0.82 * ab);
    g.save(); vao(); g.clip();
    g.beginPath(); g.rect(x0, y0 - 10, fw, P.h + 20);
    g.fillStyle = ART.lg(g, x0, 0, x0 + fw, 0, [[0, "#7A4E2E"], [1, ab > 0 ? "#4E321F" : "#6B4428"]]); g.fill();
    g.strokeStyle = "rgba(30,15,10,.5)"; g.lineWidth = 4;
    for (let i = 1; i < 4; i++) { const xx = x0 + fw * i / 4; g.beginPath(); g.moveTo(xx, y0); g.lineTo(xx, P.y); g.stroke(); }
    if (fw > 30) { ART.circ(g, x0 + fw - 22, y0 + P.h * 0.58, 9); g.fillStyle = "#E0B060"; g.fill(); }
    g.restore();
    g.restore();
    if (ab > 0) ART.glow(g, P.x, P.y - P.h * 0.4, 260, "#9FB4FF", 0.25 * ab);
  };

  // ------------------------------------------------------------------ texto "SEGURA" subindo como balão
  GB2.balao = (g, txt, x, y, s, a, o = {}) => {
    const ART = A(); if (a <= 0.01) return;
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(o.rot || 0); g.scale(s, s);
    ART.textFx(g, txt, 0, 0, { size: 64, fam: "Lilita One", fill: o.cor || "#FFD23F", stroke: "#1A1020", sw: 10 });
    g.restore();
  };
})();
