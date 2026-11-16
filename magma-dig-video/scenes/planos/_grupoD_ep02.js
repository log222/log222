/* Grupo D, Parte 2 (C6 inserto Wall Street p219–p229, C7 closes de objeto p201–p203, p211, p215, p251, p267).
 * Carregado no setup:  await GD_LOAD();   (carrega também _grupoC.js e _grupoB.js, que são só lidos)
 * Tudo função pura de t (sem Date, rAF, Math.random).
 */
(function () {
  if (window.GD) return;
  const GD = (window.GD = {});
  const W = 1080, H = 1920;
  const A = () => window.ART;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  GD.clamp = clamp;

  // ------------------------------------------------------------------ fala
  const nn = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]/g, "").toLowerCase();
  GD.wt = (ctx, w, fb, n = 0) => { const m = (ctx.words || []).filter(x => nn(x.w) === nn(w)); return m[n] ? m[n].ini : fb; };
  GD.wf = (ctx, w, fb, n = 0) => { const m = (ctx.words || []).filter(x => nn(x.w) === nn(w)); return m[n] ? m[n].fim : fb; };
  GD.mark = (ctx, nome, fb, i = 0) => { const m = MD.marks(ctx, nome); return m.length > i ? m[i] : fb; };
  /** batida: sobe em t0 e decai */
  GD.hit = (t, t0, dur = 0.35) => (t < t0 ? 0 : Math.exp(-(t - t0) / (dur * 0.35)) * clamp((t - t0) / 0.03));

  // ------------------------------------------------------------------ C7: lanterna em close (p201 abre, p267 fecha: mesmo enquadramento do p01/p57)
  GD.LANT = { LX: 540, LY: 470, S: 6.2, CX: 540, CY: 900 };
  /** Zeca de frente em close, lanterna do capacete. o = {on 0..1, z, shx, shy, eyes, mouth, headTilt, olhos (só olhos no breu), blink, fecha} */
  GD.lanterna = (g, t, ctx, o = {}) => {
    const ART = A(), GC = window.GC, L = GD.LANT, on = o.on ?? 1, z = o.z ?? 1;
    g.save();
    GC.breu(g, t, { x: L.LX, y: L.LY, c0: ART.mix("#07060B", "#1C1626", on), c1: "#030206" });
    GC.cam(g, z, L.CX, L.CY, o.shx || 0, o.shy || 0);
    const pose = ART.zeca.pose("parado", t + 3, { x: 540, y: L.LY + 201 * L.S, s: L.S, turn: 0, camera: 1, look: [0, 0.05], eyes: o.eyes || "aberto", mouth: o.mouth || "neutro", blink: o.blink ?? 0, headTilt: o.headTilt ?? -2 });
    let anc;
    if (on > 0.02) anc = GC.zecaNoEscuro(g, pose, { escuro: ART.lerp(1, 0.8, on), raio: 1000, rimK: on, apagado: 0.97 * (1 - Math.min(1, on * 3)) });
    else anc = ART.zeca.drawEscuro(g, Object.assign({}, pose, { eyes: "aberto", blink: o.blink ?? 0 }), 1, { cor: "#FFE6A8" });
    g.restore();
    const lp = (anc && anc.lanterna) || { x: L.LX, y: L.LY };
    if (on > 0.02 || o.aro) GC.lampada(g, t, lp.x, lp.y, L.S * 13 * z * 0.55, on, { halo: o.halo ?? 1 });
    // poeira: no feixe quando acesa; quase invisível no breu (mas ainda se mexe)
    ART.dust(g, t, { count: 70, seed: 11, color: "#FFF0C8", alpha: 0.9 * on + 0.06, size: [2, 6], x: 40, w: 1000, y: 150, h: 1100, speed: 30 });
    if (o.fecha > 0) { g.save(); g.fillStyle = `rgba(3,2,6,${o.fecha})`; g.fillRect(0, 0, W, H); g.restore(); }
    return lp;
  };

  // ------------------------------------------------------------------ C7: pepita no holofote
  let OFF = null;
  /** pepita de cobre girando, com sombra cortando ao meio (p211). o = {x, y, r, k, giro (fase), corte 0..1 (linha entra), escuro 0..1, ang (rad)} */
  GD.pepita = (g, t, o = {}) => {
    const ART = A(), x = o.x ?? 540, y = o.y ?? 760, r = o.r ?? 180, k = o.k ?? 1, ph = o.giro ?? t;
    const corte = clamp(o.corte ?? 0), esc = clamp(o.escuro ?? 0);
    if (corte <= 0 && esc <= 0) { ART.obj.pepitaCobre(g, ph, { x, y, r, k }); return; }
    // brilho (fora do recorte) cai junto com a metade de baixo
    ART.glow(g, x, y, r * 4, "#FF8A3C", 0.45 * k * (1 - 0.45 * esc));
    if (!OFF) OFF = ART.canvas(W, H);
    const e = OFF.getContext("2d");
    e.setTransform(1, 0, 0, 1, 0, 0); e.globalCompositeOperation = "source-over"; e.globalAlpha = 1; e.clearRect(0, 0, W, H);
    e.setTransform(g.getTransform());
    e.save(); e.translate(x, y); e.scale(Math.cos(ph * 1.6) * 0.25 + 0.95, 1);
    ART.pepita(e, 0, 0, r, "cobre", Math.sin(ph * 0.8) * 0.2, { seed: 7 });
    e.restore();
    // metade de baixo escurece (só sobre a pepita)
    const ang = o.ang ?? -0.12;
    e.globalCompositeOperation = "source-atop";
    e.save(); e.translate(x, y); e.rotate(ang);
    e.fillStyle = `rgba(8,5,12,${0.82 * esc})`; e.fillRect(-r * 2, 0, r * 4, r * 2);
    e.restore();
    e.globalCompositeOperation = "source-over";
    e.setTransform(1, 0, 0, 1, 0, 0);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(OFF, 0, 0); g.restore();
    // a linha de sombra (fio de luz fria) que corta a pepita
    if (corte > 0) {
      g.save(); g.translate(x, y); g.rotate(ang);
      const L = r * 1.5 * ART.ease.outCubic(corte);
      g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.85 * (1 - 0.5 * esc);
      g.fillStyle = ART.lg(g, -L, 0, L, 0, [[0, "rgba(255,220,190,0)"], [0.5, "rgba(255,236,214,1)"], [1, "rgba(255,220,190,0)"]]);
      g.fillRect(-L, -3, L * 2, 6);
      g.restore();
    }
    // cintilas só na metade de cima
    for (let i = 0; i < 2; i++) {
      const p2 = (ph * 0.9 + i / 2) % 1, a = Math.sin(p2 * Math.PI) * k;
      const px = x + Math.cos(i * 2.6 + 3.6) * r * 0.6, py = y - r * 0.35 - i * r * 0.15;
      g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a; g.fillStyle = "#FFE8C8"; g.translate(px, py); g.rotate(0.3); g.fillRect(-r * 0.22, -2, r * 0.44, 4); g.fillRect(-2, -r * 0.22, 4, r * 0.44); g.restore();
    }
  };

  /** especulação (p220–p222): empurrão contínuo entre os cortes; DY sobe o desenho para longe da faixa da legenda */
  GD.ESP = { Z220: 1.03, Z221: 1.055, DY: -40 };

  // ------------------------------------------------------------------ C6: gráfico com câmera própria
  /** fundo blueprint fora da câmera (o tremor/deriva não abre borda) */
  GD.bp = (g, t) => A().blueprint(g, t);
  /** gráfico de Wall Street: o = parâmetros do grafLinha; cam = {dx, dy} tremor/deriva em px de tela */
  GD.graf = (g, t, o, cam = {}) => {
    const ART = A();
    g.save(); if (cam.dx || cam.dy) g.translate(cam.dx || 0, cam.dy || 0);
    const r = ART.ciencia.grafLinha(g, t, Object.assign({ fundo: false }, o));
    g.restore(); return r;
  };
  /** estados nas fronteiras dos cortes (o fim de um plano = o começo do seguinte) */
  GD.WS = () => {
    const GL = A().ciencia.grafLinha;
    return {
      FOCO0: [320, 700], Z223: 1.22,              // p223 começa fechado no canto esquerdo e abre
      P223: GL.anoProg(1929.06),                  // ponta no fim do p223 (contador em 1929)
      FOCO: [560, 1000], Z224: 1.035, Z225: 1.075, // p224 -> p225 empurrão lento; p226 volta a 1
      P87A: 0.55,                                 // 2º gráfico no fim do p227
      FOCO229: [470, 815], Z229: 1.1,
    };
  };
  /** câmera lerp: zoom em torno de foco1 -> foco2 com continuidade (interpola o ponto fixo) */
  GD.lerp2 = (a, b, k) => [A().lerp(a[0], b[0], k), A().lerp(a[1], b[1], k)];
  /** parâmetros comuns do inserto (rodada de correção) */
  GD.TE = 1.4; GD.QUEDA = [790, 455];

  /** contador-odômetro de anos (p223): mesmo cartão e posição do contador do kit (G: X0 200, X1 900, YB 960),
   *  mas o dígito das unidades rola continuamente. v = ano contínuo (ex.: 1923,4); tipX = x da ponta (mundo);
   *  zoom/foco = os mesmos passados ao grafLinha. */
  GD.odometro = (g, v, tipX, tipY, zoom, foco) => {
    const ART = A(), BP = ART.BP, YB = 960;
    const cx = clamp(tipX, 240, 880);
    g.save(); g.translate(foco[0], foco[1]); g.scale(zoom, zoom); g.translate(-foco[0], -foco[1]);
    GCneon(g, () => { g.beginPath(); g.moveTo(tipX, tipY + 16); g.lineTo(tipX, YB); g.stroke(); }, { w: 2, dash: [6, 8], cor: BP.fraca, blur: 2 });
    ART.ui.cartao(g, cx - 95, YB + 72, 190, 76, { vidro: false, r: 20, cor: "rgba(6,26,38,.9)", borda: BP.linha, sombra: false });
    // "192" fixo + unidade rolando (clip na janela do cartão)
    const base = Math.floor(v), f0 = v - base, u = base % 10, u2 = (u + 1) % 10;
    const f = ART.ease.inOutCubic(clamp((f0 - 0.45) / 0.55));   // cada ano: lê um instante, depois rola para o seguinte
    g.save(); g.font = '900 52px "Nunito"'; g.letterSpacing = "2px";
    const wAll = g.measureText(String(base)).width, w3 = g.measureText(String(base).slice(0, 3)).width;
    g.restore();
    const x0 = cx - wAll / 2, yC = YB + 112;
    ART.bpRotulo(g, String(base).slice(0, 3), x0, yC, { size: 52, align: "left", cor: "#E8FAFF", sp: 2 });
    g.save(); g.beginPath(); g.rect(x0 + w3 - 4, YB + 76, 60, 68); g.clip();
    const H = 56, dy = -f * H;
    ART.bpRotulo(g, String(u), x0 + w3, yC + dy, { size: 52, align: "left", cor: "#E8FAFF", sp: 2, a: 1 - 0.6 * f });
    if (f > 0.001) ART.bpRotulo(g, String(u2), x0 + w3, yC + dy + H, { size: 52, align: "left", cor: "#E8FAFF", sp: 2, a: 0.4 + 0.6 * f });
    g.restore();
    g.restore();
  };
  const GCneon = (g, fn, o) => window.GC.neon(g, fn, o);

  /** linha livre do p219 (sem eixo de números); continua no começo do p220 e sai em fade. k = desenho, dx = deslize, a = opacidade */
  GD.linha219 = (g, t, k, dx, a = 1) => {
    const ART = A(), BP = ART.BP, GC = window.GC;
    if (a <= 0) return;
    g.save(); g.translate(dx, 0); g.globalAlpha *= a;
    const pts = []; const r = ART.rng(219);
    for (let i = 0; i <= 24; i++) { const x = 120 + i * 36, y = 900 - i * 9 - 60 * Math.sin(i * 0.7) * (0.4 + r() * 0.6); pts.push([x, y]); }
    const n = (pts.length - 1) * k;
    GC.neon(g, () => {
      g.beginPath(); g.moveTo(...pts[0]);
      for (let i = 1; i <= Math.ceil(n); i++) { const f = Math.min(1, n - (i - 1)), p0 = pts[i - 1], p1 = pts[i]; g.lineTo(ART.lerp(p0[0], p1[0], f), ART.lerp(p0[1], p1[1], f)); }
      g.stroke();
    }, { w: 6 });
    if (k > 0) { const i = Math.min(pts.length - 1, Math.floor(n)), f = n - i, p0 = pts[i], p1 = pts[Math.min(pts.length - 1, i + 1)]; const tx = ART.lerp(p0[0], p1[0], f), ty = ART.lerp(p0[1], p1[1], f); ART.glow(g, tx, ty, 46, BP.linha, 0.9 * a); ART.circ(g, tx, ty, 8); g.fillStyle = "#FFFFFF"; g.fill(); }
    g.restore();
  };
  /** eixo fino do p219 (sem números) */
  GD.eixo219 = (g, k, dx, a = 1) => { const ART = A(); if (a <= 0) return; g.save(); g.translate(dx, 0); window.GC.neon(g, () => { g.beginPath(); g.moveTo(90, 1000); g.lineTo(ART.lerp(90, 1000, k), 1000); g.stroke(); }, { w: 2.5, a: 0.8 * a }); g.restore(); };

  /** Toca desfocada sem o giz (último quadro do p229 = primeiro do p230); mesma transformação do GB.fundoC5 (z 1,04) */
  let TD = null;
  GD.tocaDesfocada = (g, t, a = 1) => {
    const ART = A();
    if (!TD) TD = ART.cenas.tocaDesfocada({ meta: false });
    g.save(); g.globalAlpha *= a; g.translate(540, 960); g.scale(1.04, 1.04); g.translate(-540, -960);
    for (const L of TD.fundo) L.draw(g, t);
    g.restore();
  };

  // ------------------------------------------------------------------ Toca (p219, p229) — usa o _grupoB só para leitura
  GD.TOCA = null;
  GD.toca = (g, t, ctx, o = {}) => {
    const ART = A(), GB = window.GB;
    if (!GD.TOCA) GD.TOCA = GB.toca({ prog: 0, tracos: 0 }, { lamp: 0.6 });
    const cena = GD.TOCA;
    const cam = ART.camera(t, { push: o.push || [1.08, 1.12], dur: ctx.dur, ease: "linear" });
    GB.mira(cam, 1, o.mx ?? 560, o.my ?? 1000, 540, o.sy ?? 900);
    GB.palco(g, t, cam, cena, gg => {
      const p = ART.zeca.pose("sentado", t, { x: 560, y: 1225, s: 1.6, turn: 0.15, eyes: "meio", mouth: "neutro", segura: "pepita", lamp: 0, cone: 0, banho: { cor: "#FF9A3C", k: 0.35 }, alvo: o.alvo, headTilt: 3 * Math.sin(t * 1.4) });
      ART.zeca.draw(gg, p);
    }, { frame: ctx.frame, legenda: false, luz: (gg, tt, c) => GB.tocaLuz(gg, tt, c, { lamp: 0.6, janela: 0.9 }) });
    return cam;
  };
})();
window.GD_LOAD = window.GD_LOAD || (async () => {
  if (!window.GC) await MD.loadScript("../scenes/planos/_grupoC.js");
  if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
  if (!window.GD) await MD.loadScript("../scenes/planos/_grupoD_ep02.js");
  return window.GD;
});
