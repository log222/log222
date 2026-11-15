/* MAGMA DIG — helpers determinísticos para cenas.
 * Tudo aqui é função pura do tempo t (segundos). NADA de Date, rAF, Math.random,
 * setTimeout ou transições CSS: o render tira um frame por vez, fora de ordem e em
 * processos paralelos. Veja docs/PIPELINE.md.
 */
(function () {
  const MD = (window.MD = window.MD || {});
  MD.W = 1080; MD.H = 1920;

  // ------------------------------------------------------------ matemática
  MD.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  MD.lerp = (a, b, k) => a + (b - a) * k;
  MD.invLerp = (a, b, x) => (b === a ? 0 : (x - a) / (b - a));
  /** progresso 0..1 de t entre t0 e t1, com easing opcional */
  MD.prog = (t, t0, t1, ease) => { const k = MD.clamp(MD.invLerp(t0, t1, t)); return ease ? MD.ease[ease](k) : k; };
  /** mapeia t de [t0,t1] para [v0,v1] (clamp) com easing */
  MD.map = (t, t0, t1, v0, v1, ease) => MD.lerp(v0, v1, MD.prog(t, t0, t1, ease));

  // ------------------------------------------------------------ easing
  const c1 = 1.70158, c3 = c1 + 1, c4 = (2 * Math.PI) / 3;
  MD.ease = {
    linear: k => k,
    inQuad: k => k * k, outQuad: k => 1 - (1 - k) * (1 - k),
    inOutQuad: k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
    inCubic: k => k * k * k, outCubic: k => 1 - Math.pow(1 - k, 3),
    inOutCubic: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
    outQuart: k => 1 - Math.pow(1 - k, 4), inExpo: k => (k === 0 ? 0 : Math.pow(2, 10 * k - 10)),
    outExpo: k => (k === 1 ? 1 : 1 - Math.pow(2, -10 * k)),
    inBack: k => c3 * k * k * k - c1 * k * k,
    outBack: k => 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2),
    outElastic: k => (k === 0 ? 0 : k === 1 ? 1 : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * c4) + 1),
    outBounce: k => {
      const n1 = 7.5625, d1 = 2.75;
      if (k < 1 / d1) return n1 * k * k;
      if (k < 2 / d1) return n1 * (k -= 1.5 / d1) * k + 0.75;
      if (k < 2.5 / d1) return n1 * (k -= 2.25 / d1) * k + 0.9375;
      return n1 * (k -= 2.625 / d1) * k + 0.984375;
    },
  };

  /** keyframes: MD.kf(t, [[0, 0], [0.5, 100, 'outBack'], [1, 80]]) -> número ou array.
   *  O easing de uma chave vale para o trecho que CHEGA nela. */
  MD.kf = (t, keys) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        const k = MD.prog(t, t0, t1, e || "linear");
        return Array.isArray(v0) ? v0.map((x, j) => MD.lerp(x, v1[j], k)) : MD.lerp(v0, v1, k);
      }
    }
    return keys[keys.length - 1][1];
  };

  /** pulso 0→1→0 em [t0, t0+dur] (bump suave) */
  MD.pulse = (t, t0, dur) => { const k = (t - t0) / dur; return k <= 0 || k >= 1 ? 0 : Math.sin(Math.PI * k); };

  // ------------------------------------------------------------ aleatório determinístico
  /** gerador com semente: const r = MD.rng(42); r() -> [0,1) */
  MD.rng = seed => { let a = (seed * 2654435761) >>> 0 || 1; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  /** hash inteiro -> [0,1) */
  MD.hash = (n, seed = 0) => { let x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x); };
  /** ruído suave 1D em [-1,1] */
  MD.noise = (x, seed = 0) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return MD.lerp(MD.hash(i, seed), MD.hash(i + 1, seed), u) * 2 - 1; };

  /** tremor de câmera: retorna {x, y, rot} (px, graus). Decai até zero em dur.
   *  MD.shake(t, {t0: 1.2, dur: 0.5, amp: 30, freq: 22, seed: 3}) */
  MD.shake = (t, o = {}) => {
    const { t0 = 0, dur = 0.5, amp = 24, freq = 20, seed = 1, rot = 1.5 } = o;
    const k = (t - t0) / dur;
    if (k < 0 || k > 1) return { x: 0, y: 0, rot: 0 };
    const env = Math.pow(1 - k, 2);
    const s = (t - t0) * freq;
    return { x: MD.noise(s, seed) * amp * env, y: MD.noise(s, seed + 7) * amp * env, rot: MD.noise(s, seed + 13) * rot * env };
  };

  /** partículas analíticas (sem estado): explosão em t0.
   *  MD.particles(t, {t0, count, x, y, speed:[a,b], angle:[a,b] (graus, 0=direita, -90=cima),
   *                   gravity, life:[a,b], size:[a,b], seed, drag, spin}) -> [{x,y,size,alpha,rot,k}]
   *  Desenhe com MD.drawParticles(ctx2d, lista, cor | fn(p,i)). */
  MD.particles = (t, o = {}) => {
    const { t0 = 0, count = 30, x = 540, y = 960, speed = [300, 900], angle = [-180, 0], gravity = 1800,
      life = [0.5, 1.1], size = [8, 22], seed = 1, drag = 0.0, spin = 360, spread = 0 } = o;
    const r = MD.rng(seed), out = [];
    for (let i = 0; i < count; i++) {
      const sp = MD.lerp(speed[0], speed[1], r()), an = (MD.lerp(angle[0], angle[1], r()) * Math.PI) / 180;
      const lf = MD.lerp(life[0], life[1], r()), sz = MD.lerp(size[0], size[1], r()), delay = r() * spread;
      const sr = (r() - 0.5) * 2 * spin, ox = (r() - 0.5) * 20, oy = (r() - 0.5) * 20;
      const dt = t - t0 - delay;
      if (dt < 0 || dt > lf) continue;
      const vd = drag > 0 ? (1 - Math.exp(-drag * dt)) / drag : dt;
      out.push({ x: x + ox + Math.cos(an) * sp * vd, y: y + oy + Math.sin(an) * sp * vd + 0.5 * gravity * dt * dt,
        size: sz * (1 - 0.5 * (dt / lf)), alpha: 1 - Math.pow(dt / lf, 2), rot: sr * dt, k: dt / lf, i });
    }
    return out;
  };
  MD.drawParticles = (g, list, color = "#fff", shape = "rect") => {
    for (const p of list) {
      g.save(); g.globalAlpha = p.alpha; g.translate(p.x, p.y); g.rotate((p.rot * Math.PI) / 180);
      g.fillStyle = typeof color === "function" ? color(p) : color;
      if (shape === "circle") { g.beginPath(); g.arc(0, 0, p.size / 2, 0, 2 * Math.PI); g.fill(); }
      else g.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      g.restore();
    }
  };

  // ------------------------------------------------------------ DOM / SVG
  const SVGNS = "http://www.w3.org/2000/svg";
  const SVG_TAGS = new Set(["svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "defs", "linearGradient", "radialGradient", "stop", "clipPath", "mask", "filter", "feGaussianBlur", "feOffset", "feMerge", "feMergeNode", "use", "image", "tspan", "pattern"]);
  /** MD.el('div', {class:'x', style:'...'}, parent, 'texto') — SVG se a tag for SVG. */
  MD.el = (tag, attrs = {}, parent = null, text = null) => {
    const e = SVG_TAGS.has(tag) ? document.createElementNS(SVGNS, tag) : document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  /** aplica transform/opacity de uma vez: MD.set(el, {x, y, s, r, o, sx, sy}) */
  MD.set = (e, { x = 0, y = 0, s = 1, sx, sy, r = 0, o } = {}) => {
    e.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scale(${sx ?? s}, ${sy ?? s})`;
    if (o !== undefined) e.style.opacity = o;
  };
  /** canvas 1080x1920 (ou w,h) já anexado; retorna {canvas, g} */
  MD.canvas = (parent, w = MD.W, h = MD.H) => {
    const c = MD.el("canvas", { width: w, height: h }, parent);
    c.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px`;
    return { canvas: c, g: c.getContext("2d") };
  };
  /** carrega imagem (use no setup, que pode ser async) */
  MD.loadImage = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  /** caminho de asset relativo à raiz do projeto: MD.asset('assets/img/zeca.png') */
  MD.asset = p => (window.__ROOT__ || "../") + p;

  /** dirige uma animação CSS (@keyframes) de forma determinística: a animação fica
   *  pausada e com delay negativo = t. Ex.: MD.seekCss(el, t - 0.5) */
  MD.seekCss = (e, t) => { e.style.animationPlayState = "paused"; e.style.animationDelay = `${-Math.max(0, t)}s`; };

  /** texto flutuante tipo "+150" (cria uma vez por chave, posiciona por t).
   *  MD.floatText(parent, 'f1', t, {t0: 1, dur: 0.9, text: '+150', x: 540, y: 900, rise: 160, size: 90, color: '#FFD21F'}) */
  MD.floatText = (parent, key, t, o) => {
    const floaters = (parent.__floaters = parent.__floaters || new Map());
    let e = floaters.get(key);
    if (!e) {
      e = MD.el("div", { class: "md-float" }, parent, o.text);
      e.style.cssText = `position:absolute;left:0;top:0;white-space:nowrap;font-family:'${o.font || "Lilita One"}';` +
        `font-size:${o.size || 90}px;color:${o.color || "#FFD21F"};-webkit-text-stroke:${o.stroke ?? 12}px #111;` +
        `paint-order:stroke fill;text-shadow:0 6px 0 rgba(0,0,0,.8);will-change:transform`;
      floaters.set(key, e);
    }
    const { t0 = 0, dur = 0.9, x = 540, y = 960, rise = 160 } = o;
    const k = (t - t0) / dur;
    if (k < 0 || k > 1) { e.style.opacity = 0; return e; }
    const s = k < 0.2 ? MD.ease.outBack(k / 0.2) : 1;
    e.style.opacity = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
    e.style.transform = `translate(${x}px, ${y - rise * MD.ease.outCubic(k)}px) translate(-50%, -50%) scale(${s})`;
    return e;
  };

  /** contador animado pt-BR: MD.countUp(t, 1, 1.5, 0, 1500) -> "1.500" */
  MD.countUp = (t, t0, dur, from, to, ease = "outCubic", decimals = 0) =>
    MD.map(t, t0, t0 + dur, from, to, ease).toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  // ------------------------------------------------------------ sincronia com a narração
  /** índice da palavra falada em t (tempo local do beat), ou -1 */
  MD.wordIndex = (ctx, t) => { const w = ctx.beat.words; for (let i = 0; i < w.length; i++) if (t >= w[i].ini && t < w[i].fim) return i; return -1; };
  /** tempo local em que a palavra (texto, sem acento/caixa) começa no beat; null se não existir */
  MD.wordTime = (ctx, word, nth = 0) => {
    const n = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]/g, "").toLowerCase();
    const m = ctx.beat.words.filter(w => n(w.w) === n(word));
    return m[nth] ? m[nth].ini : null;
  };
  /** tempos locais dos efeitos sonoros do beat: MD.marks(ctx, 'picareta') -> [0.4, 1.1] */
  MD.marks = (ctx, name) => (ctx.beat.marks[name] || []).slice();
})();
