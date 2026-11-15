/* Helpers do grupo A (Mina A com o Zeca + gameplay do trailer). Planos: p02 p05 p06 p07 p08 p16 p17 p27 p28 p29
 * p37 p39 p40 p41 p42 p44 p45 p46 p48 p49. Tudo dirigido por t, ctx.words e ctx.marks. */
(function () {
  const ART = window.ART;
  const GA = (window.GA = {});
  const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]/g, "").toLowerCase();
  /** início (s, local) da n-ésima ocorrência da palavra falada; fb se não achar */
  GA.w = (ctx, palavra, n = 0, fb = 0) => { const m = (ctx.words || []).filter(w => norm(w.w) === norm(palavra)); return m[n] ? m[n].ini : fb; };
  /** tempo do i-ésimo efeito sonoro */
  GA.m = (ctx, nome, i = 0, fb = 0) => { const l = (ctx.marks && ctx.marks[nome]) || []; return l[i] ?? fb; };
  GA.ms = (ctx, nome) => ((ctx.marks && ctx.marks[nome]) || []).slice();
  // geometria padrão da mina (ver art/README.md)
  GA.Z = { x: 372, y: 1182, s: 1.62 };            // Zeca de perfil diante do bloco
  GA.B = { X: 0.15, Z: 2.9 };                     // bloco-alvo
  GA.frente = () => [ART.proj(GA.B.X, 1, GA.B.Z), ART.proj(GA.B.X + 1, 1, GA.B.Z), ART.proj(GA.B.X + 1, 0, GA.B.Z), ART.proj(GA.B.X, 0, GA.B.Z)];
  GA.centroBloco = () => { const f = GA.frente(); return [(f[0][0] + f[2][0]) / 2, (f[0][1] + f[2][1]) / 2]; };
  /** pose de picaretada com impactos exatamente nos tempos dados (ex.: MD marks 'picareta') */
  GA.cava = (t, impactos, extras = {}, o = {}) => {
    if (!impactos.length) return ART.zeca.pose("parado", t, extras);
    let j = impactos.findIndex(m => t <= m + 0.25);
    if (j < 0) j = impactos.length - 1;
    const gap = j > 0 ? impactos[j] - impactos[j - 1] : (o.periodo || 0.9);
    const P = Math.min(o.periodoMax || 0.9, Math.max(0.2, gap)), t0 = impactos[j] - 0.66 * P;
    const tt = t < t0 ? t0 : (j === impactos.length - 1 && t > impactos[j] + 0.34 * P ? t0 + P * 0.999 : t);
    return ART.zeca.pose("cavando", tt, Object.assign({ t }, extras), { periodo: P, t0 });
  };
  /** quantos impactos já aconteceram */
  GA.n = (t, ms) => ms.filter(m => t >= m).length;
  /** HUD: cronômetro (dir.) + contador (esq.) */
  GA.hud = (g, t, o = {}) => {
    const intro = o.intro ?? 1;
    const hy = o.y ?? 330;
    if (o.cron != null) { g.save(); g.translate(790, hy); g.scale(intro, intro); ART.ui.cronometro(g, 0, 0, { valor: o.cron, max: o.max || 10, escala: o.escala || o.max || 10, fantasma: o.fantasma, icone: o.icone || "sol", s: 0.9 }); g.restore(); }
    if (o.moedas != null) { g.save(); g.translate(250, hy); g.scale(intro, intro); ART.ui.contador(g, 0, 0, { valor: o.moedas, icone: o.icone2 || "moeda", pulso: o.pulso || 0 }); g.restore(); }
  };
  /** cronômetro canônico: interpola v0 -> v1 ao longo do plano, ou por âncoras [[t, v], ...] (tempos locais) */
  GA.cron = (t, D, v0, v1, ancoras) => ancoras ? ART.kf(t, ancoras.map(([a, v]) => [a, v, "linear"])) : ART.lerp(v0, v1, ART.clamp(t / Math.max(0.01, D)));
  /** pulso 0..1 que acende em cada tempo da lista */
  GA.pulsos = (t, lista, dur = 0.25) => Math.max(0, ...lista.map(m => ART.pulse(t, m, dur)));
  /** câmera: enquadramento + movimento (push/tremor) */
  GA.cam = (X, Y, z, mov = {}, o = {}) => ART.camMais(ART.enquadrar(X, Y, z, o), mov);
  /** ponto do plano d=1 -> px de tela, dada a câmera */
  GA.tela = (cam, X, Y, d = 1) => { const z = 1 + ((cam.zoom || 1) - 1) * d, cx = cam.cx ?? 540, cy = cam.cy ?? 960; return [cx + (cam.sx || 0) + (X - cx - (cam.x || 0) * d) * z, cy + (cam.sy || 0) + (Y - cy - (cam.y || 0) * d) * z]; };
})();
