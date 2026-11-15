/* Grupo B (C1 vila, C4 Toca, C5 painéis): helpers compartilhados entre os meus planos.
 * Carregado no setup de cada plano do grupo:  await GB_LOAD();
 * Tudo função pura de t (sem Date, rAF, Math.random).
 */
window.GB_LOAD = window.GB_LOAD || (() => (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js")));
(function () {
  if (window.GB) return;
  const GB = (window.GB = {});
  const W = 1080, H = 1920;
  const A = () => window.ART;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  GB.clamp = clamp;

  // ------------------------------------------------------------------ fala / efeitos
  const nn = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]/g, "").toLowerCase();
  /** início da palavra (tempo local) ou fallback */
  GB.wt = (ctx, w, fb, n = 0) => { const m = (ctx.words || []).filter(x => nn(x.w) === nn(w)); return m[n] ? m[n].ini : fb; };
  /** fim da palavra ou fallback */
  GB.wf = (ctx, w, fb, n = 0) => { const m = (ctx.words || []).filter(x => nn(x.w) === nn(w)); return m[n] ? m[n].fim : fb; };
  GB.mark = (ctx, nome, fb, i = 0) => { const m = (ctx.marks || {})[nome] || []; return m.length > i ? m[i] : fb; };
  /** pulso de "batida" que sobe rápido e decai: 0 antes de t0, 1 em t0, ~0 depois de dur */
  GB.hit = (t, t0, dur = 0.35) => (t < t0 ? 0 : Math.exp(-(t - t0) / (dur * 0.35)) * clamp((t - t0) / 0.03));

  // ------------------------------------------------------------------ câmera
  /** ponto do mundo (camada de profundidade d) -> tela, para a câmera de ART.camera */
  GB.proj = (cam, d, x, y) => {
    const z = 1 + ((cam.zoom || 1) - 1) * d, cx = cam.cx ?? W / 2, cy = cam.cy ?? H / 2;
    return [cx + (cam.sx || 0) + z * (x - cx - (cam.x || 0) * d), cy + (cam.sy || 0) + z * (y - cy - (cam.y || 0) * d), z];
  };
  /** ajusta cam.x/cam.y para o ponto (wx,wy) da camada d cair em (sx,sy) na tela */
  GB.mira = (cam, d, wx, wy, sx, sy) => {
    const z = 1 + ((cam.zoom || 1) - 1) * d, cx = cam.cx ?? W / 2, cy = cam.cy ?? H / 2;
    if (sx != null) cam.x = (wx - cx - (sx - cx) / z) / d;
    if (sy != null) cam.y = (wy - cy - (sy - cy) / z) / d;
    return cam;
  };
  /** palco com luz desenhada pelo próprio plano (a luz do kit é em espaço de tela e não segue zoom/pan) */
  GB.palco = (g, t, cam, cena, atores, o = {}) => {
    const ART = A();
    for (const L of cena.fundo || []) ART.withLayer(g, cam, L.d, gg => L.draw(gg, t));
    if (o.meio) o.meio(g, t);
    if (atores) ART.withLayer(g, cam, 1, gg => atores(gg, t));
    for (const L of cena.frente || []) ART.withLayer(g, cam, L.d, gg => L.draw(gg, t));
    if (o.luz) o.luz(g, t, cam);
    if (o.post !== false) ART.post(g, o.frame ?? Math.round(t * 30), o);
  };
  /** desfoque de movimento horizontal barato (chicote): k 0..1, px = deslocamento máximo */
  let WH = null;
  GB.chicote = (g, k, px = 60) => {
    if (k <= 0.02) return;
    const ART = A();
    if (!WH) WH = ART.canvas(W, H);
    const e = WH.getContext("2d"); e.setTransform(1, 0, 0, 1, 0, 0); e.clearRect(0, 0, W, H); e.drawImage(g.canvas, 0, 0, W, H);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    const n = 5;
    for (let i = 1; i <= n; i++) { g.globalAlpha = 0.5 / i * k + 0.08; g.drawImage(WH, (i / n) * px * k, 0, W, H); g.drawImage(WH, -(i / n) * px * k * 0.6, 0, W, H); }
    g.restore();
  };

  // ------------------------------------------------------------------ Toca
  /** cena da Toca com a luz feita aqui (segue a câmera). meta: opções do giz do kit (ART.giz). */
  GB.toca = (meta = {}, o = {}) => {
    const ART = A();
    const c = ART.cenas.toca({ meta: Object.assign({ tracos: 30 }, meta), luminaria: o.lamp ?? 1, janela: o.janela ?? 1 });
    c.luz = null;
    return c;
  };
  GB.tocaLuz = (g, t, cam, o = {}) => {
    const ART = A();
    const L = o.lamp ?? 1, f = 0.92 + 0.08 * ART.noise(t * 4, 9);
    const [lx, ly, z] = GB.proj(cam, 1, 215, 920);
    if (L > 0) { ART.glow(g, lx, ly, 700 * z, "#FFB548", 0.3 * L * f); ART.glow(g, lx, ly, 70 * z, "#FFF2C8", 0.9 * L * f); }
    if ((o.janela ?? 1) > 0) { const [wx, wy, z2] = GB.proj(cam, 0.8, 840, 330); ART.beam(g, wx, wy, 115, 1300 * z2, 120 * z2, 420 * z2, "#B8C6FF", 0.16 * (o.janela ?? 1)); }
    if (o.extra) o.extra(g, t, cam);
    ART.dust(g, t, { count: 34, seed: 21, color: "#FFE6C0", size: [1.4, 3.8], alpha: 0.4, y: 260, h: 1000 });
    ART.tom(g, [[0, "rgba(60,40,120,.16)"], [0.6, "rgba(255,150,70,.05)"], [1, "rgba(20,10,30,.25)"]]);
  };
  /** parede: centro do giz do kit em coordenadas do mundo (camada d=0.8) e escala */
  GB.PAREDE = { x: 500, y: 700, s: 0.8, d: 0.8 };
  /** ponto local do giz (coordenadas de ART.giz) -> mundo */
  GB.gizMundo = (lx, ly) => [GB.PAREDE.x + lx * GB.PAREDE.s, GB.PAREDE.y + ly * GB.PAREDE.s];
  /** tracinho i (0..29) em coordenadas locais do giz (mesma fórmula do kit) */
  GB.tracoLocal = i => { const row = Math.floor(i / 10), col = i % 10; return [-270 + col * 60, 90 + row * 92]; };

  // ------------------------------------------------------------------ giz
  const GIZ = "rgba(244,240,230,.94)";
  /** texto em giz revelado da esquerda para a direita (k 0..1). x,y = âncora (align). */
  GB.gizTexto = (g, txt, x, y, o = {}) => {
    const k = clamp(o.k ?? 1); if (k <= 0) return null;
    g.save();
    g.font = o.font || `400 ${o.size || 80}px "Lilita One"`; g.textAlign = o.align || "left"; g.textBaseline = "middle";
    if (o.spacing) g.letterSpacing = o.spacing + "px";
    const w = g.measureText(txt).width, x0 = o.align === "center" ? x - w / 2 : o.align === "right" ? x - w : x;
    g.beginPath(); g.rect(x0 - 20, y - (o.size || 80), (w + 40) * k, (o.size || 80) * 2); g.clip();
    g.globalAlpha *= o.a ?? 1;
    g.shadowColor = o.glow || "rgba(255,255,255,.35)"; g.shadowBlur = o.blur ?? 6;
    g.fillStyle = o.cor || GIZ; g.fillText(txt, x, y);
    g.restore();
    return { x0, w, xk: x0 + w * k };
  };
  /** traço de giz de (x0,y0) a (x1,y1), crescendo com k */
  GB.gizLinha = (g, x0, y0, x1, y1, k = 1, o = {}) => {
    k = clamp(k); if (k <= 0) return;
    g.save(); g.globalAlpha *= o.a ?? 1; g.strokeStyle = o.cor || GIZ; g.lineWidth = o.lw || 9; g.lineCap = "round";
    g.shadowColor = o.glow || "rgba(255,255,255,.35)"; g.shadowBlur = 6;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k); g.stroke(); g.restore();
  };
  /** poeira de giz caindo da ponta (x,y) enquanto escreve; ativo 0..1 */
  GB.poeiraGiz = (g, t, x, y, ativo = 1, seed = 3) => {
    if (ativo <= 0) return;
    const ART = A(), r = ART.rng(seed);
    g.save();
    for (let i = 0; i < 14; i++) {
      const ph = (t * (1.4 + r()) + r()) % 1, dx = (r() - 0.5) * 30 + Math.sin(ph * 6 + i) * 6, dy = ph * 120;
      g.globalAlpha = ativo * (1 - ph) * 0.8; ART.circ(g, x + dx, y + dy, 1.5 + r() * 2.5); g.fillStyle = "#F4F0E6"; g.fill();
    }
    g.restore();
  };
  /** seta de giz para cima (x,y = base), k 0..1 */
  GB.gizSeta = (g, x, y, h, k, o = {}) => {
    if (k <= 0) return;
    const a = clamp(k * 1.4), b = clamp(k * 3 - 2);
    GB.gizLinha(g, x, y, x, y - h, a, o);
    if (b > 0) { GB.gizLinha(g, x, y - h, x - h * 0.28, y - h + h * 0.3, b, o); GB.gizLinha(g, x, y - h, x + h * 0.28, y - h + h * 0.3, b, o); }
  };

  // ------------------------------------------------------------------ cartão fixo (com extra)
  /** cartão SALDO × META · DIA X DE 30 do kit + segmento de cobre opcional na barra e rótulo próprio */
  GB.cartao = (g, x, y, o = {}) => {
    const ART = A(), s = o.s || 0.85;
    ART.ui.cartaoMeta(g, x, y, Object.assign({ meta: 1000, s }, o, { rotuloExtra: null }));
    const w = 640 * s, h = 210 * s, x0 = x - w / 2, y0 = y - h / 2;
    if (o.cobre) {
      const bx = x0 + 36 * s, by = y0 + 164 * s, bw = w - 72 * s, bh = 18 * s, f0 = clamp((o.saldo || 0) / 1000), f1 = clamp(f0 + o.cobre);
      g.save(); ART.rr(g, bx + bw * f0, by, Math.max(bh, bw * (f1 - f0)), bh, bh / 2); g.fillStyle = "#E07B39"; g.shadowColor = "#FF8A3C"; g.shadowBlur = 14; g.fill(); g.restore();
    }
    if (o.rotulo) {
      g.save(); g.globalAlpha *= o.a ?? 1; g.textAlign = "right"; g.textBaseline = "alphabetic"; g.font = `1000 ${34 * s}px "Nunito"`;
      g.fillStyle = o.rotuloCor || "#FF9A4A"; g.fillText(o.rotulo, x0 + w - 36 * s, y0 + 132 * s); g.restore();
    }
    return { x0, y0, w, h };
  };

  // ------------------------------------------------------------------ painéis C5
  /** fundo dos painéis (Toca desfocada do kit), com deriva lenta */
  GB.fundoPainel = () => A().cenas.tocaDesfocada({ riscados: 1 });
  /** desenha a Toca desfocada com uma câmera própria (parallax suave) */
  GB.desenhaFundoPainel = (g, t, cena, cam) => {
    const ART = A();
    for (const L of cena.fundo || []) ART.withLayer(g, cam, L.d, gg => L.draw(gg, t));
  };
  /** silhueta de picareta enorme (para sombras): x,y = empunhadura, ang graus, len px */
  GB.silPicareta = (g, x, y, ang, len, cor = "#000", a = 1) => {
    const ART = A();
    g.save(); g.translate(x, y); g.rotate(ART.deg(ang)); g.globalAlpha *= a; g.fillStyle = cor;
    const L = len, top = -L * 0.8;
    ART.rr(g, -L * 0.045, top, L * 0.09, L, L * 0.04); g.fill();
    g.beginPath(); g.moveTo(-L * 0.46, top + L * 0.14); g.quadraticCurveTo(-L * 0.26, top - L * 0.12, 0, top - L * 0.12); g.quadraticCurveTo(L * 0.26, top - L * 0.12, L * 0.48, top + L * 0.1);
    g.lineTo(L * 0.4, top + L * 0.13); g.quadraticCurveTo(L * 0.22, top, 0, top + L * 0.02); g.quadraticCurveTo(-L * 0.2, top, -L * 0.38, top + L * 0.17); g.closePath(); g.fill();
    g.restore();
  };
  /** moeda deitada em perspectiva (vista de cima, achatada) */
  GB.moedaChao = (g, x, y, r, o = {}) => {
    const ART = A();
    g.save(); g.translate(x, y); g.rotate(o.rot || 0);
    g.globalAlpha *= o.a ?? 1;
    ART.ell(g, 0, r * 0.18, r, r * 0.55); g.fillStyle = "#8A5A08"; g.fill();
    ART.ell(g, 0, 0, r, r * 0.55); g.fillStyle = ART.lg(g, -r, -r * 0.5, r, r * 0.5, [[0, "#FFF0A0"], [0.45, "#FFC531"], [1, "#C88A10"]]); g.fill();
    ART.ell(g, 0, 0, r * 0.7, r * 0.38); g.lineWidth = r * 0.08; g.strokeStyle = "rgba(150,95,10,.55)"; g.stroke();
    g.restore();
  };

  // ------------------------------------------------------------------ C5: fundo e coluna de ramos
  let FUNDO = null;
  /** Toca desfocada (kit) atrás dos painéis, com deriva de parallax própria: dx,dy em px, z = zoom */
  GB.fundoC5 = (g, t, o = {}) => {
    const ART = A();
    if (!FUNDO) FUNDO = ART.cenas.tocaDesfocada({ riscados: o.riscados ?? 1 });
    const z = o.z ?? 1.04;
    g.save(); g.translate(540 + (o.dx || 0), 960 + (o.dy || 0)); g.scale(z, z); g.translate(-540, -960);
    for (const L of FUNDO.fundo) L.draw(g, t);
    g.restore();
    if (o.escuro) { g.save(); g.fillStyle = `rgba(10,8,18,${o.escuro})`; g.fillRect(0, 0, W, H); g.restore(); }
    if (o.tinta) { g.save(); g.fillStyle = o.tinta; g.fillRect(0, 0, W, H); g.restore(); }
  };
  /** espaço do painel (1080x1920): zoom z; o ponto (px,py) do painel vai para (cx,cy) da tela (padrão: zoom em torno de cx,cy); sx,sy = tremor */
  GB.noPainel = (g, cam, fn) => {
    g.save();
    const cx = cam.cx ?? 540, cy = cam.cy ?? 960;   // ponto do painel (px,py) cai em (cx,cy) na tela
    g.translate(cx + (cam.sx || 0), cy + (cam.sy || 0)); g.scale(cam.z || 1, cam.z || 1); g.translate(-(cam.px ?? cx), -(cam.py ?? cy));
    fn(g); g.restore();
  };
  /** posição Y (topo) do cartão de ramo i na coluna padrão */
  GB.ramoY = (i, y0 = 520, gap = 112) => y0 + i * gap;
  /** coluna de 7 ramos: est(i) -> {aceso, nivel, pulso, a, dx, esc} */
  GB.colRamos = (g, est, o = {}) => {
    const ART = A(), s = o.s ?? 0.82, w = 760 * s, x0 = 540 - w / 2, y0 = o.y0 ?? 520, gap = o.gap ?? 112;
    ART.ui.RAMOS.forEach((R, i) => {
      const e = est(i) || {}; if ((e.a ?? 1) <= 0) return;
      const y = y0 + i * gap, sc = e.esc || 1;
      g.save(); g.translate(540, y + 66 * s); g.scale(sc, sc); g.translate(-540, -(y + 66 * s));
      ART.ui.ramo(g, x0 + (e.dx || 0), y, { ramo: i, nivel: e.nivel || 0, aceso: e.aceso ?? 0, s, a: e.a ?? 1, pulso: e.pulso || 0, sombra: false });
      if (e.flash) ART.glow(g, 540, y + 66 * s, w * 0.7, R.cor, 0.5 * e.flash);
      g.restore();
    });
  };

  /** os 30 tracinhos da parede (mesma geometria do ART.giz do kit), sem o META/1.000 — para closes em que o número
   *  ficaria cortado na borda. Desenhe dentro do espaço local do giz (translate PAREDE + scale s). riscados fracionário. */
  GB.tracinhos = (g, o = {}) => {
    const ART = A(), n = o.n ?? 30, rr = ART.rng(77);
    g.save(); g.lineCap = "round";
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 10), col = i % 10, tx = -270 + col * 60 + (rr() - 0.5) * 6, ty = 90 + row * 92;
      g.save(); g.strokeStyle = "rgba(244,240,230,.92)"; g.shadowColor = "rgba(255,255,255,.35)"; g.shadowBlur = 6; g.lineWidth = 9;
      g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + (rr() - 0.5) * 6, ty + 64); g.stroke(); g.restore();
      const rk = clamp((o.riscados ?? 0) - i);
      if (rk > 0) { g.save(); g.strokeStyle = "#FF6B4A"; g.lineWidth = 8; g.beginPath(); g.moveTo(tx - 20, ty + 56); g.lineTo(tx - 20 + 44 * rk, ty + 56 - 52 * rk); g.stroke(); g.restore(); }
    }
    g.restore();
  };
})();
