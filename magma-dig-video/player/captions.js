/* Camada de legenda: separada das cenas, 100% dirigida por dados.
 * Dados: timeline.captions = [{ini, fim, pos?, estilo?, palavras: [{w, ini, fim, enfase}]}]
 * Estilo: timeline.estilo.legenda (config/estilo.json + overrides do story/beat).
 */
(function () {
  const MD = window.MD;
  let root, S, Z, blocks, cur = -1, curEl = null, spans = [], warned = new Set();

  function css(st) {
    return `font-family:'${st.fonte}';font-size:${st.tamanho}px;line-height:${st.altura_linha};` +
      `letter-spacing:${st.espaco_letras};color:${st.cor};-webkit-text-stroke:${st.contorno}px ${st.cor_contorno};` +
      `paint-order:stroke fill;text-shadow:${st.sombra};text-transform:${st.caixa_alta ? "uppercase" : "none"};`;
  }

  function styleFor(b) { return b.estilo ? Object.assign({}, S, b.estilo) : S; }

  function posFor(b, st) {
    let p = { centro_x: st.centro_x, centro_y: st.centro_y };
    if (typeof b.pos === "string" && st.posicoes && st.posicoes[b.pos]) Object.assign(p, st.posicoes[b.pos]);
    else if (b.pos && typeof b.pos === "object") Object.assign(p, b.pos);
    return p;
  }

  function build(i) {
    if (curEl) curEl.remove();
    curEl = null; spans = [];
    if (i < 0) return;
    const b = blocks[i], st = styleFor(b), p = posFor(b, st);
    const el = MD.el("div", { class: "md-cap" }, root);
    el.style.cssText = `position:absolute;left:${p.centro_x}px;top:${p.centro_y}px;width:${st.largura_max}px;` +
      `margin-left:${-st.largura_max / 2}px;text-align:center;white-space:${st.uma_linha ? "nowrap" : "normal"};transform-origin:50% 50%;` + css(st);
    const line = MD.el("div", {}, el);
    line.style.cssText = `display:inline-block;` +
      (st.fundo ? `background:${st.fundo};padding:0.08em 0.3em;border-radius:0.25em;` : "");
    b.palavras.forEach((w, j) => {
      const s = MD.el("span", {}, line, w.w);
      s.style.cssText = `display:inline-block;margin:0 ${st.espaco_palavras};transform-origin:50% 60%;` +
        (w.enfase ? `color:${st.cor_enfase};` : "");
      spans.push(s);
    });
    curEl = el; cur = i;
    el.style.transform = "translateY(-50%)";
    // uma linha só: se o bloco passar da largura máxima, reduz a fonte até caber
    let r = line.getBoundingClientRect();
    if (st.uma_linha && r.width > st.largura_max) {
      el.style.fontSize = `${Math.floor(st.tamanho * st.largura_max / r.width)}px`;
      r = line.getBoundingClientRect();
    }
    // checagem de zona segura (mede sem a animação de entrada)
    const scale = window.__SCALE__ || 1;
    const box = { l: r.left / scale, r: r.right / scale, t: r.top / scale, b: r.bottom / scale };
    const [dy0, dy1] = Z.direita_y || [0, MD.H];
    const naFaixaDireita = box.b > dy0 && box.t < dy1;   // botões do Instagram só entre direita_y
    const bad = box.l < Z.esquerda - 1 || (naFaixaDireita && box.r > MD.W - Z.direita + 1) ||
      box.t < Z.topo - 1 || box.b > MD.H - Z.base + 1;
    if (bad && !warned.has(i)) {
      warned.add(i);
      (window.__WARNINGS__ = window.__WARNINGS__ || []).push(
        `legenda fora da zona segura em ${b.ini.toFixed(2)}s: "${b.palavras.map(w => w.w).join(" ")}" ` +
        `caixa x[${box.l | 0},${box.r | 0}] y[${box.t | 0},${box.b | 0}]`);
    }
  }

  MD.captions = {
    init(tl) {
      S = tl.estilo.legenda; Z = tl.estilo.zona_segura; blocks = tl.captions || [];
      root = document.getElementById("captions");
    },
    render(t) {
      let i = -1;
      for (let k = 0; k < blocks.length; k++) if (t >= blocks[k].ini && t < blocks[k].fim) { i = k; break; }
      if (i !== cur) build(i);
      cur = i;
      if (i < 0) return;
      const b = blocks[i], st = styleFor(b);
      // entrada
      const k = MD.clamp((t - b.ini) / Math.max(0.001, st.dur_entrada));
      let tr = "", op = 1;
      switch (st.entrada) {
        case "pop": tr = `scale(${MD.lerp(0.65, 1, MD.ease.outBack(k))})`; op = MD.clamp(k * 3); break;
        case "fade": op = k; break;
        case "slide": tr = `translateY(${MD.lerp(50, 0, MD.ease.outCubic(k))}px)`; op = k; break;
        default: break;
      }
      // saída (opcional)
      if (st.saida === "fade") op *= MD.clamp((b.fim - t) / 0.12);
      curEl.style.transform = `translateY(-50%) ${tr}`; curEl.style.opacity = op;
      // palavra ativa
      b.palavras.forEach((w, j) => {
        const s = spans[j];
        const active = st.destacar_ativa !== false && t >= w.ini && (t < w.fim || j === b.palavras.length - 1 || t < b.palavras[j + 1].ini);
        const spoken = t >= w.ini;
        const base = w.enfase ? st.cor_enfase : st.cor;
        s.style.color = active ? st.cor_ativa : base;
        const ka = active ? MD.clamp((t - w.ini) / 0.08) : 0;
        const sc = (w.enfase ? st.escala_enfase : 1) * MD.lerp(1, st.escala_ativa, MD.ease.outQuad(ka));
        s.style.transform = `scale(${sc})`;
        s.style.opacity = st.modo === "karaoke" && !spoken ? 0 : 1;
      });
    },
  };
})();
