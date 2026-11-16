/* Grupo C5 da Parte 2 (animador C): painéis da Toca — Mercado (queda e alta do cobre) e Clientes (Dona Coruja).
 * Planos: p206 p209 p210 p216 p217 p230 p231 p235 p236 p237 p238 p252 p253 p254 p255 p259 p260 p261 p262 p263 p265.
 * Usa (sem mudar) o _grupoB.js da Parte 1: GB.fundoC5, GB.noPainel, GB.wt, GB.hit.
 * Tudo função pura de t (sem Date, rAF, setTimeout, Math.random).
 */
window.GC5_LOAD = window.GC5_LOAD || (async () => {
  if (!window.GB) await (window.__GB_P = window.__GB_P || MD.loadScript("../scenes/planos/_grupoB.js"));
});
(function () {
  if (window.GC5) return;
  const GC5 = (window.GC5 = {});
  const A = () => window.ART;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  GC5.clamp = clamp;

  // ------------------------------------------------------------------ fala
  GC5.wt = (ctx, w, fb, n = 0) => window.GB.wt(ctx, w, fb, n);
  GC5.wf = (ctx, w, fb, n = 0) => window.GB.wf(ctx, w, fb, n);
  GC5.mark = (ctx, nome, fb, i = 0) => window.GB.mark(ctx, nome, fb, i);
  GC5.hit = (t, t0, d) => window.GB.hit(t, t0, d);
  /** soma de degraus suaves: 1 por instante de ts (cada um leva dur s) */
  GC5.degraus = (t, ts, dur = 0.25, ease = "outBack") => ts.reduce((s, t0) => s + A().ease[ease](clamp((t - t0) / dur)), 0);

  // ------------------------------------------------------------------ câmera
  /** câmera do painel: ponto (ax,ay) do painel vai para (sx,sy) da tela, com zoom z */
  GC5.cam = (z, ax, ay, sx, sy) => ({ z, px: ax, py: ay, cx: sx, cy: sy });
  GC5.camMix = (a, b, k) => { const L = A().lerp; return { z: L(a.z, b.z, k), px: L(a.px, b.px, k), py: L(a.py, b.py, k), cx: L(a.cx, b.cx, k), cy: L(a.cy, b.cy, k) }; };
  /** fundo (Toca desfocada) com deriva; o = {dx, dy, z, escuro, tinta} */
  GC5.fundo = (g, t, o = {}) => window.GB.fundoC5(g, t, o);
  GC5.painel = (g, cam, fn) => window.GB.noPainel(g, cam, fn);
  /** acabamento: brilhos lentos subindo (movimento até o último quadro), vinheta, faixa da legenda, grão */
  GC5.fim = (g, t, ctx, o = {}) => {
    const ART = A();
    ART.dust(g, t, { count: o.n ?? 22, seed: o.seed ?? 52, color: o.cor || "#FFE6B0", size: [1.4, 3.4], alpha: 0.35, y: 260, h: 1000 });
    ART.vignette(g, o.vinheta ?? 0.5); ART.faixaLegenda(g, o.legenda ?? 0.4); ART.grain(g, ctx.frame, 0.05);
  };
  /** entrada em dissolve a partir do escuro (primeiros `d` s) */
  GC5.dissolve = (g, t, d = 0.25, cor = "#0A0812") => {
    const k = 1 - clamp(t / d); if (k <= 0) return;
    g.save(); g.globalAlpha = A().ease.inOutSine(k); g.fillStyle = cor; g.fillRect(0, 0, 1080, 1920); g.restore();
  };

  // ------------------------------------------------------------------ Mercado
  /** barras do cobre: semana até ontem (índice 5 = ontem, 6 = hoje) */
  GC5.B_N3 = [0.42, 0.5, 0.38, 0.55, 0.47, 0.66];      // noite 3: ontem (40) alto
  GC5.B_N4 = [0.5, 0.38, 0.55, 0.47, 0.66, 0.33];      // noite 4: ontem (20) baixo
  /** linha do Mercado com o valor do botão com ícone de moeda (o kit desenha só o número) */
  GC5.linha = (g, x, y, o = {}) => {
    const ART = A(), u = ART.ui, s = o.s || 1, w = (o.w || 900) * s, h = 120 * s;
    u.linhaMercado(g, x, y, o);
    g.save(); g.globalAlpha *= o.a ?? 1;
    u.botao(g, x + w - 120 * s, y + h / 2 - 6 * s, 200 * s, 80 * s, { texto: String(o.valor ?? ""), cor: "roxo", press: 1, icone: "moeda" });
    g.restore();
    return { x, y, w, h, icone: [x + 60 * s, y + 60 * s], botao: [x + w - 120 * s, y + h / 2 - 6 * s] };
  };
  /** texto com contorno (Nunito) */
  GC5.txt = (g, s, x, y, o = {}) => A().textFx(g, s, x, y, Object.assign({ size: 64, fam: "Nunito", weight: 1000, fill: "#F4EEDC", stroke: "#1A1020", sw: 10 }, o));
  /** faíscas que sobem de (x,y) a partir de t0 */
  GC5.faiscas = (g, t, t0, x, y, cor = "#FFE7A0", seed = 7, n = 14) => {
    const ART = A();
    for (const p of ART.burst(t, { t0, count: n, x, y, speed: [200, 560], angle: [-170, -10], gravity: 500, life: [0.4, 0.8], size: [3, 8], seed })) {
      g.save(); g.globalAlpha = p.alpha; g.globalCompositeOperation = "lighter"; ART.circ(g, p.x, p.y, p.size); g.fillStyle = cor; g.fill(); g.restore();
    }
  };

  /** gráfico de preço por dia (p216–p217): cartão com cabeçalho do Cobre e janela de 7 barras que desliza */
  GC5.B216 = [0.42, 0.5, 0.38, 0.55, 0.47, 0.66, 0.33, 0.6, 0.45, 0.72, 0.4, 0.62];
  const GW = 780, GGAP = GW * 0.035, GBW = (GW - GGAP * 6) / 7;
  GC5.GRAF = { x: 150, y: 640, w: GW, h: 360, bw: GBW, passo: GBW + GGAP, xHoje: 150 + 6 * (GBW + GGAP) + GBW / 2 };
  GC5.grafSemana = (g, t, o = {}) => {
    const ART = A(), u = ART.ui, R = GC5.GRAF;
    u.cartao(g, 90, 470, 900, 580, { vidro: true, r: 40, cor: "rgba(24,21,38,.8)", borda: "rgba(255,255,255,.12)" });
    ART.rr(g, 122, 500, 110, 110, 24); g.fillStyle = "rgba(255,255,255,.07)"; g.fill(); u.pix(g, "cobre", 177, 555, 74);
    g.save(); g.font = '1000 66px "Nunito"'; g.fillStyle = "#F4EEDC"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("Cobre", 256, 538);
    g.font = '900 34px "Nunito"'; g.fillStyle = "#A3A0AE"; g.letterSpacing = "2px"; g.fillText("PREÇO DE CADA DIA", 258, 590); g.restore();
    u.grafico7(g, R.x, R.y, R.w, R.h, { barras: o.barras, desliza: o.d || 0, janela: 7, cores: o.cores });
    g.save(); g.font = '1000 32px "Nunito"'; g.textAlign = "center"; g.fillStyle = "#FFD23F"; g.fillText("HOJE", R.xHoje, R.y + R.h + 36); g.restore();
  };

  /** Mercado com a faixa EM ALTA HOJE e as linhas Ferro / Cobre (p236–p238): tudo centrado em x 540, escala 0,9
   *  o = {faixa: {...faixaAlta}, ferro: {a, pulso}, cobre: {a, pulso}} -> posições úteis */
  GC5.ALTA = { titulo: 300, faixa: 412, s: 0.9, lx: 170, lw: 740, lh: 170, ferro: 540, cobre: 735 };
  /** linha do Mercado grande (legível no celular): ícone, nome, ×quantidade, botão roxo com moeda + valor.
   *  Mesmos campos da linha do jogo (sem o mini-gráfico). o = {tipo, nome, qtd, valor, a, pulso, destaque} */
  GC5.linhaGrande = (g, x, y, w, h, o = {}) => {
    const ART = A(), u = ART.ui, p = clamp(o.pulso || 0);
    g.save(); g.globalAlpha *= o.a ?? 1;
    u.cartao(g, x, y, w, h, { r: 32, cor: o.destaque ? "#2A2540" : "rgba(33,30,51,.94)", borda: o.destaque ? "#FFD23F" : "rgba(255,255,255,.12)", bw: o.destaque ? 4 : 2.5, sombra: false });
    ART.rr(g, x + 24, y + (h - 120) / 2, 120, 120, 26); g.fillStyle = "#2A2640"; g.fill();
    u.pix(g, o.tipo, x + 84, y + h / 2, 82);
    g.textAlign = "left"; g.textBaseline = "middle"; g.font = '1000 64px "Nunito"'; g.fillStyle = "#F4EEDC"; g.fillText(o.nome, x + 170, y + h / 2 + 2);
    const nw = g.measureText(o.nome).width; g.font = '900 52px "Nunito"'; g.fillStyle = "#A3A0AE"; g.fillText("×" + (o.qtd ?? 1), x + 170 + nw + 22, y + h / 2 + 4);
    u.botao(g, x + w - 24 - 115, y + h / 2 - 6, 230, 120, { texto: String(o.valor ?? ""), cor: "roxo", press: 1, icone: "moeda" });
    if (p > 0) { ART.rr(g, x - 5, y - 5, w + 10, h + 10, 36); g.lineWidth = 8; g.strokeStyle = ART.rgba("#FFD23F", 0.9 * p); g.stroke(); ART.glow(g, x + w / 2, y + h / 2, w * 0.55, "#FFD23F", 0.3 * p); }
    g.restore();
    return { icone: [x + 84, y + h / 2], botao: [x + w - 139, y + h / 2 - 6] };
  };
  GC5.mercadoAlta = (g, t, o = {}) => {
    const ART = A(), u = ART.ui, L = GC5.ALTA, s = L.s;
    u.titulo(g, 540, L.titulo, "MERCADO", { s: 0.9 });
    const f = u.faixaAlta(g, 540, L.faixa, Object.assign({ s }, o.faixa || {}));
    const fe = o.ferro ? GC5.linhaGrande(g, L.lx, L.ferro, L.lw, L.lh, Object.assign({ tipo: "ferro", nome: "Ferro", qtd: 0, valor: 0 }, o.ferro)) : null;
    const co = o.cobre ? GC5.linhaGrande(g, L.lx, L.cobre, L.lw, L.lh, Object.assign({ tipo: "cobre", nome: "Cobre", qtd: 1, valor: 20 }, o.cobre)) : null;
    return { faixa: f, ferro: fe, cobre: co };
  };

  /** Noite 4 (p252–p255): câmera contínua pelos quatro planos. tau = tempo desde o início do p252 (T0 de cada plano). */
  GC5.N4 = { T: 10.37, T0: { p252: 0, p253: 2.40, p254: 4.99, p255: 7.16 } };
  GC5.camN4 = (tau) => { const ART = A(), k = clamp(tau / GC5.N4.T); return GC5.cam(ART.lerp(1.0, 1.04, k), ART.lerp(528, 552, k), 780, 540, 800); };
  GC5.fundoN4 = (g, tau, quente = 0) => GC5.fundo(g, tau, { dx: A().map(tau, 0, GC5.N4.T, 22, -22), z: 1.1, escuro: 0.26, tinta: quente > 0 ? `rgba(120,80,10,${0.1 * quente})` : null });
  /** painel da noite 4. o = {faixa, preco ('?' | número), rola (0..1 de 20 para 60), hoje (altura da barra de hoje), sub (texto do botão), pulso, a (painel)} */
  GC5.mercadoN4 = (g, t, o = {}) => {
    const ART = A(), u = ART.ui;
    const p = { faixa: Object.assign({ s: 0.9 }, o.faixa || {}), varPct: false, amanha: false, seta: 0, botao: false, antesFantasma: 0,
      barras: GC5.B_N4.concat([Math.max(0.001, o.hoje || 0)]), cores: [0, 0, 0, 0, 0, "#E63748"] };
    if (o.rola != null) Object.assign(p, { precoAntes: 20, preco: 60, rola: o.rola });
    else Object.assign(p, { preco: o.preco ?? "?", rotuloPreco: "HOJE PAGA" });
    const c = ART.painelMercado(g, t, p);
    const pu = clamp(o.pulso || 0), bs = 1 + 0.05 * pu * (0.5 + 0.5 * Math.sin(t * 6));
    if (pu > 0) ART.glow(g, 540, 1160, 520, "#FFD23F", 0.4 * pu);
    g.save(); g.translate(540, 1160); g.scale(bs, bs); g.translate(-540, -1160);
    u.botao(g, 540, 1160, 720, 150, o.sub ? { texto: "VENDER", sub: o.sub, icone: "moeda" } : { texto: "VENDER", icone: "moeda" });
    g.restore();
    return c;
  };

  // ------------------------------------------------------------------ Clientes
  /** retalho na cor do cartão de cliente (esconde uma linha antes da palavra que a revela) */
  GC5.retalho = (g, x, y, w, h, a = 1) => {
    if (a <= 0) return; const ART = A();
    g.save(); g.globalAlpha *= a; ART.rr(g, x, y, w, h, 14); g.fillStyle = "#211E33"; g.fill(); g.restore();
  };
  /** aba CLIENTES: título + cartão da Dona Coruja (centro 540,720, s=1). Pedido 4/4 Cobre (o Zeca tem as 4 pepitas),
   *  recompensa +160. o: campos do ART.ui.cartaoCliente + escondePedido / escondeRecompensa (0..1 = retalho por cima) */
  GC5.CLI = { x: 540, y: 720 };
  GC5.cliente = (g, t, o = {}) => {
    const ART = A(), u = ART.ui;
    u.titulo(g, 540, 330, "CLIENTES", { s: 0.9 });
    const c = u.cartaoCliente(g, GC5.CLI.x, GC5.CLI.y, Object.assign({ t, s: 1, amizade: 0, recompensa: 160, pedido: { tem: 4, precisa: 4, tipo: "cobre", nome: "Cobre" }, sorriso: 0.3 }, o));
    GC5.retalho(g, c.x0 + 30, c.y0 + 318, 555, 84, o.escondePedido || 0);
    GC5.retalho(g, c.x0 + 30, c.y0 + 404, 555, 78, o.escondeRecompensa || 0);
    return c;
  };
})();
