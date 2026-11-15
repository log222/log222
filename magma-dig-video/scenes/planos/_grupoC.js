/* Grupo C (C6 ciência, C7 closes de objeto, C8 profundezas): helpers compartilhados.
 * Carregado no setup de cada plano do grupo:  await GC_LOAD();
 * Tudo função pura de t (sem Date, rAF, Math.random).
 */
(function () {
  if (window.GC) return;
  const GC = (window.GC = {});
  const W = 1080, H = 1920;
  const A = () => window.ART;

  // ------------------------------------------------------------------ utilidades de tempo/fala
  /** tempo local da palavra (ou fallback) */
  GC.wt = (ctx, w, fb, n = 0) => { const v = MD.wordTime(ctx, w, n); return v == null ? fb : v; };
  /** fim da palavra */
  GC.wf = (ctx, w, fb, n = 0) => {
    const nn = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]/g, "").toLowerCase();
    const m = (ctx.words || []).filter(x => nn(x.w) === nn(w));
    return m[n] ? m[n].fim : fb;
  };
  GC.mark = (ctx, nome, fb, i = 0) => { const m = MD.marks(ctx, nome); return m.length > i ? m[i] : fb; };

  // ------------------------------------------------------------------ Zeca com luz controlada
  let OFF = null;
  /** desenha o Zeca num canvas à parte e escurece por cima (fora do raio de luz), para planos no breu.
   *  o = {escuro 0..1, lx, ly (centro da luz em px de tela), raio, cor da sombra, rimCor, rimK} -> âncoras */
  GC.zecaNoEscuro = (g, pose, o = {}) => {
    const ART = A();
    if (!OFF) OFF = ART.canvas(W, H);
    const e = OFF.getContext("2d");
    e.setTransform(1, 0, 0, 1, 0, 0); e.globalCompositeOperation = "source-over"; e.globalAlpha = 1; e.clearRect(0, 0, W, H);
    e.setTransform(g.getTransform());
    const anc = ART.zeca.draw(e, Object.assign({}, pose, { lamp: 0, cone: 0, shadow: 0 }));
    e.setTransform(1, 0, 0, 1, 0, 0);
    const k = o.escuro ?? 0.85;
    if (k > 0) {
      e.globalCompositeOperation = "source-atop";
      const lx = o.lx ?? (anc.lanterna ? anc.lanterna.x : 540), ly = o.ly ?? (anc.lanterna ? anc.lanterna.y : 600), R = o.raio ?? 900;
      e.fillStyle = ART.rg(e, lx, ly, R * 0.08, R, [[0, `rgba(14,8,10,${k * 0.2})`], [0.5, `rgba(12,7,12,${k * 0.72})`], [1, `rgba(6,4,10,${k * 0.97})`]]);
      e.fillRect(0, 0, W, H);
      if (o.apagado) { e.fillStyle = `rgba(4,3,8,${o.apagado})`; e.fillRect(0, 0, W, H); }
      if (o.rimK) { // luz de recorte quente vinda da lanterna (de cima)
        e.globalCompositeOperation = "source-atop";
        e.fillStyle = ART.lg(e, 0, ly - 200, 0, ly + 700, [[0, ART.rgba(o.rimCor || "#FFD98A", 0.35 * o.rimK)], [1, ART.rgba(o.rimCor || "#FFD98A", 0)]]);
        e.fillRect(0, 0, W, H);
      }
      e.globalCompositeOperation = "source-over";
    }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(OFF, 0, 0); g.restore();
    return anc;
  };

  /** lâmpada da lanterna vista de frente, por cima do Zeca: bulbo branco + halo + flare horizontal + raios.
   *  (x,y) px de tela; r = raio do bulbo; on 0..1 */
  GC.lampada = (g, t, x, y, r, on, o = {}) => {
    const ART = A();
    // aro metálico (sempre visível)
    g.save();
    ART.circ(g, x, y, r * 1.28); g.fillStyle = ART.lg(g, x, y - r * 1.3, x, y + r * 1.3, [[0, "#C9C7D8"], [1, "#4C4A5E"]]); g.fill();
    ART.circ(g, x, y, r); g.fillStyle = ART.mix("#2B2A36", "#FFFDF2", on); g.fill();
    if (on < 0.6) { ART.ell(g, x - r * 0.3, y - r * 0.35, r * 0.35, r * 0.18, -0.6); g.fillStyle = "rgba(255,255,255,.35)"; g.fill(); }
    g.restore();
    if (on <= 0.01) return;
    ART.glow(g, x, y, r * 2.2, "#FFFFFF", 0.95 * on);
    ART.glow(g, x, y, r * 7 * (o.halo ?? 1), "#FFE6A8", 0.55 * on);
    ART.glow(g, x, y, r * 16 * (o.halo ?? 1), "#FFC86A", 0.25 * on);
    // flare horizontal anamórfico
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.85 * on;
    const fh = Math.max(3, r * 0.08);
    g.fillStyle = ART.lg(g, 0, 0, W, 0, [[0, "rgba(255,210,140,0)"], [Math.max(0.01, x / W - 0.3), "rgba(255,225,170,.25)"], [x / W, "rgba(255,248,230,1)"], [Math.min(0.99, x / W + 0.3), "rgba(255,225,170,.25)"], [1, "rgba(255,210,140,0)"]]);
    g.fillRect(0, y - fh / 2, W, fh);
    g.globalAlpha = 0.3 * on; g.fillRect(0, y - fh * 2.5, W, fh * 5);
    // raios girando devagar
    g.translate(x, y); g.rotate(t * 0.25);
    for (let i = 0; i < 6; i++) {
      g.rotate(Math.PI / 3);
      g.fillStyle = ART.lg(g, 0, 0, r * 9, 0, [[0, "rgba(255,240,200,.35)"], [1, "rgba(255,240,200,0)"]]);
      g.beginPath(); g.moveTo(0, -r * 0.12); g.lineTo(r * 9, -r * 0.5); g.lineTo(r * 9, r * 0.5); g.lineTo(0, r * 0.12); g.fill();
    }
    g.restore();
  };

  /** fundo de breu com poeira iluminada perto da lanterna */
  GC.breu = (g, t, o = {}) => {
    const ART = A();
    g.fillStyle = ART.rg(g, o.x ?? 540, o.y ?? 700, 40, 1400, [[0, o.c0 || "#16121F"], [1, o.c1 || "#040308"]]);
    g.fillRect(0, 0, W, H);
  };

  /** número grande no estilo do jogo (Nunito 1000, branco, sombra) */
  GC.numero = (g, txt, x, y, o = {}) => {
    const ART = A();
    ART.textFx(g, txt, x, y, { size: o.size || 200, fam: o.fam || "Nunito", weight: o.weight ?? 1000, fill: o.fill || "#FFFFFF", stroke: o.stroke || "#14121F", sw: o.sw ?? 18, shadow: o.shadow || "rgba(0,0,0,.55)", sdy: o.sdy ?? 10, sblur: o.sblur ?? 24, align: o.align || "center" });
  };

  /** escurece a faixa da legenda (y 1300–1500) */
  GC.faixa = (g, k = 0.45) => A().faixaLegenda(g, k);

  /** pós comum do grupo: vinheta, faixa da legenda, grão */
  GC.post = (g, ctx, o = {}) => A().post(g, ctx.frame ?? 0, { vinheta: o.vinheta ?? 0.6, legenda: o.legenda !== false, legendaK: o.legendaK ?? 0.4, grao: o.grao ?? 0.05 });

  /** câmera simples em volta de um ponto: escala s em torno de (cx,cy) + deslocamento */
  GC.cam = (g, z, cx = 540, cy = 960, dx = 0, dy = 0, rot = 0) => {
    g.translate(cx + dx, cy + dy); if (rot) g.rotate(rot); g.scale(z, z); g.translate(-cx, -cy);
  };


  // ------------------------------------------------------------------ C6: planeta em corte com escala livre
  const BPc = () => A().BP;
  GC.neon = (g, fn, o = {}) => { g.save(); g.strokeStyle = o.cor || BPc().linha; g.lineWidth = o.w || 3; g.lineCap = "round"; g.lineJoin = "round"; g.shadowColor = o.cor || BPc().linha; g.shadowBlur = o.blur ?? 12; if (o.dash) g.setLineDash(o.dash); g.globalAlpha *= o.a ?? 1; fn(); g.restore(); };
  GC.rot = (g, txt, x, y, o = {}) => A().bpRotulo(g, txt, x, y, o);
  /** planeta em corte (fatia do quadrante superior direito removida), com qualquer raio R em px (funciona com R enorme
   *  para o zoom-out a partir do furo). o = {cx, cy, R, nucleo 0..1, rotulos 0..1, risco 0..1, seta 0..1, aFuro (rad)} */
  GC.planeta = (g, t, o = {}) => {
    const ART = A(), BP = BPc(), cx = o.cx, cy = o.cy, R = o.R, nk = ART.clamp(o.nucleo ?? 0);
    const aF = o.aFuro ?? -Math.PI * 0.62;
    const cut = r => { g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, -Math.PI / 2, 0, false); g.closePath(); };
    // corpo
    ART.circ(g, cx, cy, R); g.fillStyle = "rgba(15,59,82,.7)"; g.fill();
    if (R < 4000) { // meridianos e paralelos
      g.save(); ART.circ(g, cx, cy, R); g.clip(); g.strokeStyle = "rgba(143,211,232,.22)"; g.lineWidth = 2;
      for (let i = -6; i <= 6; i++) { g.beginPath(); g.ellipse(cx, cy, Math.max(0.5, Math.abs(i) * R / 6.2), R, 0, 0, Math.PI * 2); g.stroke(); }
      for (let i = -5; i <= 5; i++) { g.beginPath(); g.moveTo(cx - R, cy + i * R / 6); g.lineTo(cx + R, cy + i * R / 6); g.stroke(); }
      g.restore();
    } else { // perto da superfície: hachura de rocha
      g.save(); ART.circ(g, cx, cy, R); g.clip(); g.strokeStyle = "rgba(143,211,232,.1)"; g.lineWidth = 2;
      for (let k = -2000; k < 3000; k += 28) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k - 1920, 1920); g.stroke(); }
      g.restore();
    }
    GC.neon(g, () => { ART.circ(g, cx, cy, R); g.stroke(); }, { w: 4 });
    if (R < 60000) {
      g.save(); cut(R + 3); g.fillStyle = BP.bg0; g.fill(); g.restore();
      const radii = [1, 0.985, 0.55, 0.19];
      const cores = [["#14506B", "#0F3B52"], ["#1E5F78", "#123F58"], [ART.mix("#4A2E2E", "#FF7A1A", nk), ART.mix("#2A1E22", "#C2410C", nk)], [ART.mix("#6A3A20", "#FFF1C8", nk), ART.mix("#4A2A18", "#FFB548", nk)]];
      radii.forEach((rk, i) => { cut(R * rk); g.fillStyle = ART.rg(g, cx, cy, 0, R * rk, [[0, cores[i][0]], [1, cores[i][1]]]); g.fill(); GC.neon(g, () => { cut(R * rk); g.stroke(); }, { w: 2.5 }); });
      if (nk > 0) { ART.glow(g, cx, cy, R * 0.95, "#FF9A3C", 0.65 * nk); ART.glow(g, cx, cy, R * 0.28, "#FFF6DA", 0.95 * nk); }
    }
    const lk = o.rotulos ?? 0;
    if (lk > 0) {
      const lx = o.lx ?? cx + R + 36;
      [[R * 0.995, "CROSTA"], [R * 0.78, "MANTO"], [R * 0.38, "NÚCLEO|EXTERNO"], [R * 0.1, "NÚCLEO|INTERNO"]].forEach(([rr, nome], i) => {
        const a = -Math.PI * 0.28 + i * 0.05, px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr, ly = cy - R + 40 + i * 104;
        GC.neon(g, () => { g.beginPath(); g.moveTo(px, py); g.lineTo(lx - 12, ly); g.stroke(); ART.circ(g, px, py, 4); g.stroke(); }, { w: 1.5, cor: BP.fraca, blur: 3, a: lk });
        nome.split("|").forEach((ln, j) => GC.rot(g, ln, lx, ly + j * 28, { size: 24, sp: 2, a: lk, cor: i === 3 && nk > 0.3 ? "#FFD08A" : BP.linha }));
      });
    }
    // furo de 12 km em escala real
    const px = cx + Math.cos(aF) * R, py = cy + Math.sin(aF) * R, L = R * 12 / 6371;
    const rk = o.risco ?? 1;
    if (rk > 0) {
      GC.neon(g, () => { g.beginPath(); g.moveTo(px, py); g.lineTo(px - Math.cos(aF) * Math.max(L, 1.2), py - Math.sin(aF) * Math.max(L, 1.2)); g.stroke(); }, { cor: BP.amarelo, w: Math.min(10, Math.max(3, L * 0.05)), blur: 14 });
    }
    return { px, py, L };
  };

  /** câmera que põe o ponto do mundo (wx,wy) na tela em (sx,sy) com zoom z */
  GC.foco = (g, z, wx, wy, sx = 540, sy = 860, rot = 0) => { g.translate(sx, sy); if (rot) g.rotate(rot); g.scale(z, z); g.translate(-wx, -wy); };
  GC.setup = async () => { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return {}; };

  /** roda fn com ART.blueprint desligado (o fundo já foi desenhado fora da câmera: sem emenda nem varredura dupla) */
  GC.semFundo = fn => { const ART = A(), bp = ART.blueprint; ART.blueprint = () => {}; try { fn(); } finally { ART.blueprint = bp; } };

  /** tremor determinístico */
  GC.shake = (t, t0, dur, amp, seed = 1) => MD.shake(t, { t0, dur, amp, freq: 26, seed, rot: 0.6 });
})();
window.GC_LOAD = window.GC_LOAD || (async () => { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return window.GC; });
