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
      e.fillStyle = ART.rg(e, lx, ly, R * 0.08, R, [[0, `rgba(8,6,14,${k * 0.25})`], [0.55, `rgba(8,6,14,${k * 0.8})`], [1, `rgba(8,6,14,${k * 0.97})`]]);
      e.fillRect(0, 0, W, H);
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

  /** tremor determinístico */
  GC.shake = (t, t0, dur, amp, seed = 1) => MD.shake(t, { t0, dur, amp, freq: 26, seed, rot: 0.6 });
})();
window.GC_LOAD = window.GC_LOAD || (async () => { if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js"); return window.GC; });
